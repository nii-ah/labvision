import multer from 'multer';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = path.join(__dirname, '../../uploads/evenements');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp'];

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (!ALLOWED_MIMES.includes(file.mimetype)) {
    return cb(new Error('Photo non autorisée (JPEG, PNG ou WebP).'));
  }
  cb(null, true);
};

export const uploadEvenementPhoto = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo
}).single('photo');