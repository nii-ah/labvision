// src/middlewares/upload.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = path.join(__dirname, '../../uploads/ressources');

// Créer le dossier s'il n'existe pas
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const ALLOWED_TYPES: Record<string, string[]> = {
  pdf: ['application/pdf'],
  audio: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'],
  video: ['video/mp4', 'video/webm', 'video/ogg'],
};

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const format = req.body.format;
  const allowed = ALLOWED_TYPES[format];

  if (!allowed) {
    return cb(new Error('Format invalide.'));
  }
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error(`Le fichier ne correspond pas au format déclaré (${format}).`));
  }
  cb(null, true);
};

export const uploadRessourceFile = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 Mo max
}).single('fichier');