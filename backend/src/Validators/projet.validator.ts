// src/validators/projet.validator.ts
import { z } from 'zod';

export const createProjetSchema = z.object({
  titre: z.string().min(3).max(255),
  description: z.string().optional(),
  domaine_ids: z.array(z.number()).min(1, 'Sélectionnez au moins un domaine'),
});

export const updateProjetSchema = z.object({
  titre: z.string().min(3).max(255).optional(),
  description: z.string().optional(),
  domaine_ids: z.array(z.number()).optional(),
});