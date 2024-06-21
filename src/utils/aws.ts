import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";

interface optionsTypes {
    source: string;
    path: string;
    localDiskFilePath: string;
    mimetype: string;
    region : string;
}

export const s3Upload = async (options : optionsTypes) => {
    try {
        console.log(options)
        const { source, path, region, localDiskFilePath, mimetype } = options
        const s3Client = new S3Client({
            region
        });
    
        await s3Client.send(new PutObjectCommand({
            Bucket: source,
            Key: path,
            Body: fs.readFileSync(localDiskFilePath),
            ContentType: mimetype
        }));
    } catch (error) {
        console.log(error)
    }
}