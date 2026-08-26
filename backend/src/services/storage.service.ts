// src/services/storage.service.ts
import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(__dirname, '../../uploads');

export interface StorageService {
  getAbsolutePath(relativePath: string): string;
  deleteFile(relativePath: string): Promise<void>;
  fileExists(relativePath: string): boolean;
}

// Implémentation locale — pourra être remplacée par une implémentation
// Cloudinary/S3 plus tard sans changer les contrôleurs qui l'utilisent
export const localStorageService: StorageService = {
  getAbsolutePath(relativePath: string): string {
    return path.join(UPLOAD_DIR, relativePath);
  },

  async deleteFile(relativePath: string): Promise<void> {
    const fullPath = this.getAbsolutePath(relativePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  },

  fileExists(relativePath: string): boolean {
    return fs.existsSync(this.getAbsolutePath(relativePath));
  },
};

// Point d'entrée unique utilisé par le reste de l'app
export const storageService: StorageService = localStorageService;