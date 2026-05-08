type ImageStorageMode = "provider-url" | "s3";

interface PersistGeneratedImageOptions {
  imageUrl: string;
  storageKey: string;
  env?: Record<string, string | undefined>;
  upload?: (imageUrl: string, storageKey: string) => Promise<string>;
}

export function getImageStorageMode(
  env: Record<string, string | undefined> = process.env,
): ImageStorageMode {
  const mode = (env.IMAGE_STORAGE || "provider-url").toLowerCase();

  if (mode === "s3") {
    return "s3";
  }

  return "provider-url";
}

export async function persistGeneratedImage({
  imageUrl,
  storageKey,
  env = process.env,
  upload = defaultUploadGeneratedImage,
}: PersistGeneratedImageOptions): Promise<string> {
  if (getImageStorageMode(env) === "s3") {
    return upload(imageUrl, storageKey);
  }

  return imageUrl;
}

async function defaultUploadGeneratedImage(
  imageUrl: string,
  storageKey: string,
): Promise<string> {
  const { uploadImageToS3 } = await import("./s3-upload");
  return uploadImageToS3(imageUrl, storageKey);
}
