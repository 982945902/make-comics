import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

function getS3UploadConfig() {
  const {
    S3_UPLOAD_KEY,
    S3_UPLOAD_SECRET,
    S3_UPLOAD_BUCKET,
    S3_UPLOAD_REGION,
  } = process.env;

  if (
    !S3_UPLOAD_KEY ||
    !S3_UPLOAD_SECRET ||
    !S3_UPLOAD_BUCKET ||
    !S3_UPLOAD_REGION
  ) {
    throw new Error("Missing required S3 environment variables");
  }

  return {
    key: S3_UPLOAD_KEY,
    secret: S3_UPLOAD_SECRET,
    bucket: S3_UPLOAD_BUCKET,
    region: S3_UPLOAD_REGION,
  };
}

export async function uploadImageToS3(
  imageUrl: string,
  key: string
): Promise<string> {
  try {
    const config = getS3UploadConfig();
    const s3Client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.key,
        secretAccessKey: config.secret,
      },
    });

    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const imageBuffer = Buffer.from(await response.arrayBuffer());

    const command = new PutObjectCommand({
      Bucket: config.bucket,
      Key: `comics/${key}`,
      Body: imageBuffer,
      ContentType: "image/jpeg",
      Metadata: {
        "app-name": "make-comics",
        "type": "comic-page",
      },
    });

    await s3Client.send(command);

    const publicUrl = `https://${config.bucket}.s3.${config.region}.amazonaws.com/comics/${key}`;
    return publicUrl;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error("Failed to upload image to S3");
  }
}
