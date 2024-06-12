import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import express from "express";
import multer from "multer";
import path from "path";
import NodeClam from "clamscan";
import fs from "fs";

interface resultTypes {
  isInfected: boolean;
  viruses: string[];
  file? : string;
}

const app = express();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "uploads/");
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const limits = {
  fileSize: 300 * 1024 * 1024 // 300 MB limit
};

const upload = multer({ storage,limits });

const deleteLocalFile = (localDiskFilePath: string) => fs.unlink(localDiskFilePath, (err) => {
  const message = err ? `Error deleting file: ${err.message}` : 'File deleted successfully';
  console.log(message);
});

(async () => {
  try {
    const clamScan = await new NodeClam().init({
      preference: "clamdscan",
      scanRecursively: false,
      clamdscan: {
      //  multiscan: true,
        socket: "/var/run/clamav/clamd.ctl",
      //  host: "127.0.0.1",
      //  port: 3310,
      },
    });

   app.get("/", async (_req, res) => res.json({message: "Nameste"}));

    app.post("/upload", upload.single("file"), async (req, res) => {
      try {
        const { file , body : { store }  } = req;
        let { source, path, region, error } = JSON.parse(store || '{}');
        
        if (!file) return res.status(400).json({message:"File not found"});

        const { filename, path: localDiskFilePath} = file;
        
        const result : resultTypes = await clamScan.scanFile(localDiskFilePath);

        if (!result.isInfected && (source || path)) {
          try {
            const s3Client = new S3Client({
              region : region || "ap-southeast-1"
            });
            await s3Client.send(new PutObjectCommand({
              Bucket: source,
              Key: path,
              Body: fs.readFileSync(localDiskFilePath),
              ContentType: file.mimetype
            }));

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
          error
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