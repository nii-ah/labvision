// src/routes/domaine.routes.ts
import { Router } from 'express';
import { getDomaines } from '../controllers/domaine.controller';

const domaineRouter = Router();

domaineRouter.get('/domaines', getDomaines);

export default domaineRouter;