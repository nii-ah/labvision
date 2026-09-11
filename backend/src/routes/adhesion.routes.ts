// src/routes/adhesion.routes.ts
import { Router } from 'express';
import { createAdhesion, validerAdhesion, getAdhesions } from '../controllers/adhesion.controller';
import { authenticateToken } from '../middlewares/authenticate';
import { requireRole } from '../middlewares/requireRole';
import { getMonAdhesion } from '../controllers/adhesion.controller';


const router = Router();

router.get('/adhesions/mine', authenticateToken, getMonAdhesion);
router.post('/adhesions', authenticateToken, createAdhesion);
router.get('/adhesions', authenticateToken, requireRole('admin'), getAdhesions);
router.patch('/adhesions/:id/valider', authenticateToken, requireRole('admin'), validerAdhesion);

export default router;