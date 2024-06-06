import express from "express";
import multer from "multer";
import path from "path";
import NodeClam from "clamscan";

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

const upload = multer({ storage });

(async () => {
  try {
    const clamScan = await new NodeClam().init({
      preference: "clamdscan",
      scanRecursively: true,
      clamdscan: {
        host: "127.0.0.1",
        port: 3310,
      },
    });

    app.post("/upload", upload.single("file"), async (req, res) => {
      try {
        const { file } = req;
        if (!file) {
          return res.status(400);
        }
        const result = await clamScan.scanFile(file.path);
        console.log(result);
        console.log(result);
        return res.json(true);
      } catch (err) {
        console.log(err);
      }
    });

    app.listen(5000, "0.0.0.0", () => {
      console.log("Listening on port 5000");
    });
  } catch (err) {
    console.log(err);
  }
})();
