import { envConfig, middleware } from "../config";
import { 
    getJwtSecrets, 
    jwtSign, 
    s3Upload, 
    fileScan,
    deleteLocalFile
  } from "../utils";

interface resultTypes {
    isInfected: boolean;
    viruses: string[];
    file? : string;
}

export const uploadScan = async (req: any , res: any) => {
    try {
      const { file, store, requestedFile } = req;
      let { source, path, region, error } = store || {};
      
      if (!file) return res.status(400).json({message:"File not found"});

      const { filename, path: localDiskFilePath, originalname} = file;
      
      const result : resultTypes = await fileScan(localDiskFilePath);

      if (!result.isInfected && (source || path) && requestedFile.originalname === originalname) {
        try {
          await s3Upload({
            source,
            path, 
            region: region || envConfig.AWS_DEFAULT_REGION,
            localDiskFilePath: `../../${localDiskFilePath}`,
            mimetype: file.mimetype
          })

          console.log(`File ${filename} uploaded successfully s3://${source}${path}.`);
        } catch (err) {
          error = err
          console.log(err);
        }
      }

      deleteLocalFile(localDiskFilePath);
      delete result?.file;
      return res.json({
        result,
        source,
        path,
        error,
      });

    } catch (err) {
      console.log(err);
    }
  }