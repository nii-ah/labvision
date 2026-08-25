// src/validators/ressource.validator.ts
import { z } from 'zod';

export const createRessourceSchema = z.object({
  titre: z.string().min(3).max(255),
  description: z.string().optional(),
  niveau: z.enum(['Débutant', 'Intermédiaire', 'Avancé']).optional(),
  langue: z.enum(['Français', 'Malagasy']).optional(),
  format: z.enum(['pdf', 'audio', 'video']),
  fichier_url: z.string().url().optional(),
  image_url: z.string().url().optional(),
  telechargeable: z.boolean().optional(),
  domaine_ids: z.array(z.number()).min(1, 'Sélectionnez au moins un domaine'),
});


// src/validators/ressource.validator.ts (ajoute ce schéma)

export const updateRessourceSchema = z.object({
  titre: z.string().min(3).max(255).optional(),
  description: z.string().optional(),
  niveau: z.enum(['Débutant', 'Intermédiaire', 'Avancé']).optional(),
  langue: z.enum(['Français', 'Malagasy']).optional(),
  format: z.enum(['pdf', 'audio', 'video']).optional(),
  fichier_url: z.string().url().optional(),
  image_url: z.string().url().optional(),
  telechargeable: z.boolean().optional(),
  domaine_ids: z.array(z.number()).optional(),
});


export type CreateRessourceInput = z.infer<typeof createRessourceSchema>;


