import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

// Configure AWS S3
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    region: process.env.AWS_REGION!,
});

export const s3 = new AWS.S3();

// Define the expected file type
export interface UploadFile {
    buffer: Buffer;
    originalname?: string;
    mimetype?: string;
}

export const uploadToS3 = async (file: UploadFile, folder: string): Promise<string> => {
    if (!file || !file.buffer) {
        throw new Error('Invalid file: No buffer found');
    }

    try {
        const fileName = `${folder}/${uuidv4()}_${file.originalname || 'unnamed'}`;
        const params: AWS.S3.PutObjectRequest = {
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: fileName,
            Body: file.buffer,
            ContentType: file.mimetype || 'application/octet-stream',
        };

        const result = await s3.upload(params).promise();
        return result.Location; // Returns the file's public URL
    } catch (err) {
        console.error('S3 Upload Error:', err);
        if (err instanceof Error) {
            throw new Error(`Failed to upload file to S3: ${err.message}`);
        }
        throw new Error('Unknown error occurred while uploading to S3');
    }
};
