import assert from "node:assert/strict";
import { test } from "node:test";

import {
  getImageStorageMode,
  persistGeneratedImage,
} from "../lib/image-storage.ts";

test("uses provider URLs by default", async () => {
  assert.equal(getImageStorageMode({}), "provider-url");

  const imageUrl = "https://image.pollinations.ai/prompt/test";
  const persistedUrl = await persistGeneratedImage({
    imageUrl,
    storageKey: "story/page.jpg",
    env: {},
    upload: async () => {
      throw new Error("upload should not be called");
    },
  });

  assert.equal(persistedUrl, imageUrl);
});

test("uploads generated images when S3 storage is enabled", async () => {
  const persistedUrl = await persistGeneratedImage({
    imageUrl: "https://image.pollinations.ai/prompt/test",
    storageKey: "story/page.jpg",
    env: { IMAGE_STORAGE: "s3" },
    upload: async (imageUrl, storageKey) => {
      assert.equal(imageUrl, "https://image.pollinations.ai/prompt/test");
      assert.equal(storageKey, "story/page.jpg");
      return "https://bucket.s3.amazonaws.com/comics/story/page.jpg";
    },
  });

  assert.equal(
    persistedUrl,
    "https://bucket.s3.amazonaws.com/comics/story/page.jpg",
  );
});
