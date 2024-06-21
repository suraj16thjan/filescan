import pathname from "path";
import { envConfig } from "../config";
import { 
    s3Upload, 
    fileScan,
    deleteLocalFile,
    publishMessage
} from "../utils";

interface resultTypes {
    isInfected: boolean;
    viruses: string[];
    file? : string;
}

export const uploadScan = async (req: any , res: any) => {
  const { file, store, requestedFile, subId } = req;
  let { source, path, region, error } = store || {};
    try {

      console.log(subId)
      if (!file) return res.status(400).json({message:"File not found"});

      const { filename, path: localDiskFilePath, originalname} = file;
      
      const result : resultTypes = await fileScan(localDiskFilePath);

      await publishMessage(subId, result);

      if (!result.isInfected && (source || path) && requestedFile.originalname === originalname) {
        try {
          await s3Upload({
            source,
            path, 
            region: region || envConfig.AWS_DEFAULT_REGION,
            localDiskFilePath: pathname.join(`${__dirname}`, `../../${localDiskFilePath}`),
            mimetype: file.mimetype
          })
          await publishMessage(subId, 'uploaded');

          console.log(`File ${filename} uploaded successfully to s3://${source}${path}.`);
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
      await publishMessage(subId, "failed");
      console.log(err);
    }
  }