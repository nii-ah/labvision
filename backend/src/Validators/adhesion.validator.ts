// src/validators/adhesion.validator.ts
import { z } from 'zod';

export const createAdhesionSchema = z.object({
  statut_labvision: z.enum([
    'president', 'responsable', 'membre_simple', 'collaborateur', 'partenaire', 'professeur'
  ]).default('membre_simple'),
}); 