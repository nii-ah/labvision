// routes/auth.routes.ts
import { Router, Response } from 'express';
import { register, login } from "../controllers/auth.controller";
import { authenticateToken } from '../middlewares/authenticate';
import { AuthRequest } from '../middlewares/authenticate';

const router = Router();

// Routes publiques — pas de middleware
router.post("/register", register);
router.post('/login', login);

// Exemple de route protégée — middleware appliqué avant le contrôleur
// router.get('/mon-profil', authenticateToken, monProfilController);


export default router;
