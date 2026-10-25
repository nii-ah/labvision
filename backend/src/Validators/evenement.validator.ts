import { z } from 'zod';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2})?$/;

// "2026-10-20T14:00" -> "2026-10-20 14:00:00"
const toMysqlDateTime = (s: string): string => {
  const v = s.replace('T', ' ');
  return v.length === 16 ? `${v}:00` : v;
};

const dateTime = z
  .string()
  .trim()
  .regex(DATE_REGEX, 'Format attendu : AAAA-MM-JJ HH:mm')
  .transform(toMysqlDateTime);

// Optionnel : "" devient null (on vide le champ), absent reste undefined (on ne touche pas)
const dateTimeOpt = z
  .union([z.literal(''), dateTime])
  .optional()
  .transform((v) => (v === '' ? null : v));

const texteOpt = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v === '' ? null : v));

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const listQuerySchema = z.object({
  mois: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Format attendu : AAAA-MM')
    .optional(),
});

export const createEvenementSchema = z
  .object({
    titre: z.string().trim().min(3, 'Titre trop court').max(200),
    description: z.string().trim().min(1, 'La description est obligatoire'),
    date_debut: dateTime,
    date_fin: dateTimeOpt,
    lieu: texteOpt(255),
    partenaires: texteOpt(500),
  })
  .refine((d) => !d.date_fin || d.date_fin >= d.date_debut, {
    message: 'La date de fin doit être après la date de début',
    path: ['date_fin'],
  });

export const updateEvenementSchema = z.object({
  titre: z.string().trim().min(3).max(200).optional(),
  description: z.string().trim().min(1).optional(),
  date_debut: dateTime.optional(),
  date_fin: dateTimeOpt,
  lieu: texteOpt(255),
  partenaires: texteOpt(500),
  supprimer_photo: z.enum(['true', 'false']).optional(),
});

export const vitrineSchema = z.object({
  visible_vitrine: z.boolean(),
});