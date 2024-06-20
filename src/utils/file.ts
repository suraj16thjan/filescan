import multer from "multer";
import path from "path";
import fs from "fs";

const limits = {
    fileSize: 300 * 1024 * 1024 // 300 MB limit
};

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

export const upload = multer({ storage,limits });

export const deleteLocalFile = (localDiskFilePath: string) => fs.unlink(localDiskFilePath, (err) => {
    const message = err ? `Error deleting file: ${err.message}` : 'File deleted successfully';
    console.log(message);
});

