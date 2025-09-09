import multer from "multer";

/* ---------- IMAGE STORAGE (diskStorage) ---------- */
const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp/"); // Images are saved temporarily on disk
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Save with original filename
  },
});

/* ---------- VIDEO STORAGE (memoryStorage) ---------- */
const videoUpload = multer.memoryStorage(); // Videos stay in memory buffer, not saved locally

/* ---------- EXPORT MULTER INSTANCES ---------- */
export const upload = multer({
  storage: imageStorage, // For image uploads
});

export const uploadVideo = multer({
  storage: videoUpload, // For video uploads
  limits: {
    fileSize: 1024 * 1024 * 100, // Max 100 MB
  },
});
