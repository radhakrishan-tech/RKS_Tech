const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadsDir = path.resolve(__dirname, "..", "..", "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = ext && ext.length <= 10 ? ext : ".jpg";
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
    cb(null, name);
  },
});

function imageOnlyFilter(_req, file, cb) {
  if (!file.mimetype || !file.mimetype.startsWith("image/")) {
    cb(new Error("Only image files are allowed"));
    return;
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter: imageOnlyFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 8,
  },
});

module.exports = { upload };
