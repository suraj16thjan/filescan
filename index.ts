import express from "express";

import { envConfig, middleware } from "./src/config";
import { 
  getJwtSecrets, 
  jwtSign, 
  s3Upload, 
  fileScan,
  upload,
  deleteLocalFile
} from "./src/utils";

interface resultTypes {
  isInfected: boolean;
  viruses: string[];
  file? : string;
}

const app = express();

(async () => {
  try {
    app.use(middleware)

    app.get("/", async (_req, res) => res.json({message: "Nameste"}));

    app.post("/upload", upload.single("file"), async (req: any , res: any) => {
      try {
        const { file, store, requestedFile } = req;
        let { source, path, region, error } = store || {};
        
        if (!file) return res.status(400).json({message:"File not found"});

        const { filename, path: localDiskFilePath, originalname} = file;

        const { previousKey,currentKey } = await getJwtSecrets();

        // console.log({file});

        const stores = {
          "source": "clamav-innovatetch",
          "path": `clamav/file-${Date.now() + "-" + Math.round(Math.random() * 1e9)}-${originalname}`
        };

        var token = jwtSign({ file, store:stores });
        
        const result : resultTypes = await fileScan(localDiskFilePath);

        if (!result.isInfected && (source || path) && requestedFile.originalname === originalname) {
          try {

            await s3Upload({
              source,
              path, 
              region: region || envConfig.AWS_DEFAULT_REGION,
              localDiskFilePath,
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
          token,
          currentKey,
          previousKey
        });

      } catch (err) {
        console.log(err);
      }
    });

    const port = 8080;
    app.listen(port, "0.0.0.0", () => {
      console.log(`Listening on port ${port}`);
    });
  } catch (err) {
    console.log(err);
  }
})();