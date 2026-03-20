import multer from 'multer';
import path from 'path';
import os from 'os';
import fs from 'fs';

const isVercel = process.env.VERCEL === '1' || process.env.VERCEL;
const uploadDir = isVercel ? os.tmpdir() : 'uploads/';

if (!isVercel && !fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Set storage engine
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Check file type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /mp4|mkv|avi|mov|jpg|jpeg|png/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('File format not supported. Please upload JPG, PNG, MP4, or AVI only.'));
  }
}

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
});

export default upload;
