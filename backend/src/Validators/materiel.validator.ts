import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const fichierParamSchema = z.object({
  id: z.coerce.number().int().positive(),
  fichierId: z.coerce.number().int().positive(),
});

export const createMaterielSchema = z.object({
  nom: z.string().trim().min(1, 'Le nom est obligatoire').max(150),
  description: z.string().trim().max(5000).nullable().optional(),
  quantite_totale: z.coerce.number().int().min(0).default(1),
});

export const updateMaterielSchema = z
  .object({
    nom: z.string().trim().min(1).max(150).optional(),
    description: z.string().trim().max(5000).nullable().optional(),
    quantite_totale: z.coerce.number().int().min(0).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: 'Aucun champ à modifier',
  });

export const vitrineSchema = z.object({
  visible_vitrine: z.boolean(),
});

export const fichierBodySchema = z.object({
  type_fichier: z.enum(['fiche_technique', 'manuel', 'autre']).default('autre'),
});