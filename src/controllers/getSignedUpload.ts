import { 
    jwtSign, 
    deleteLocalFile
} from "../utils";

export const getSignedUpload = async (req: any , res: any) => {
    try {
      const { file } = req;
      
      if (!file) return res.status(400).json({message:"File not found"});

      const { path: localDiskFilePath, originalname} = file;

      deleteLocalFile(localDiskFilePath);
      return res.json({
        uploadToken : jwtSign({ 
            file, 
            store : {
                "source": "clamav-innovatetch",
                "path": `clamav/file-${Date.now() + "-" + Math.round(Math.random() * 1e9)}-${originalname}`
            }
        }),
      });
    } catch (error) {
      console.error(error);
      res.send(500).json({error})
    }
  }