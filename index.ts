import express from "express";
import cors from "cors";

import { envConfig, middleware } from "./src/config";
import { upload}  from "./src/utils";
import { handleSSE } from './src/sse'
import {uploadScan,getSignedUpload} from './src/controllers'

const app = express();
app.use(cors({
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
}));

(async () => {
  try {
    app.get("/", async (_req, res) => res.json({message: "Nameste"}));
    
    app.post("/get-signed-upload", upload.single("file"),getSignedUpload );

    app.get("/upload/status",middleware, handleSSE);

    app.post("/upload", middleware, upload.single("file"), uploadScan);

    app.listen(envConfig.PORT, "0.0.0.0", () => {
      console.log(`Listening on port ${envConfig.PORT}`);
    });
  } catch (err) {
    console.log(err);
  }
})();