// src/routes/ressource.routes.ts
import { Router } from 'express';
import { createRessource } from '../controllers/ressource.controller';
import { authenticateToken } from '../middlewares/authenticate';
import { requireRole } from '../middlewares/requireRole';

const ressourceRoutes = Router();

ressourceRoutes.post('/ressources', authenticateToken, requireRole('admin'), createRessource);

export default ressourceRoutes;