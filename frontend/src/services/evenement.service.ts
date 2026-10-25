import api from './api';

export interface Evenement {
  id: number;
  titre: string;
  description: string;
  date_debut: string;
  date_fin: string | null;
  lieu: string | null;
  partenaires: string | null;
  visible_vitrine: 0 | 1 | boolean;
  a_photo: 0 | 1 | boolean;
  auteur_nom?: string | null;
  auteur_prenom?: string | null;
}

export interface EvenementInput {
  titre: string;
  description: string;
  date_debut: string; // "2026-10-20T14:00"
  date_fin: string;   // "" si absent
  lieu: string;
  partenaires: string;
  photo?: File | null;
  supprimer_photo?: boolean;
}

const versFormData = (input: EvenementInput, edition: boolean): FormData => {
  const form = new FormData();
  form.append('titre', input.titre);
  form.append('description', input.description);
  form.append('date_debut', input.date_debut);
  // En édition, une chaîne vide vide le champ côté backend ; en création on l'omet
  if (edition || input.date_fin) form.append('date_fin', input.date_fin);
  if (edition || input.lieu) form.append('lieu', input.lieu);
  if (edition || input.partenaires) form.append('partenaires', input.partenaires);
  if (input.supprimer_photo) form.append('supprimer_photo', 'true');
  if (input.photo) form.append('photo', input.photo);
  return form;
};

const multipart = { headers: { 'Content-Type': 'multipart/form-data' } };

export const evenementService = {
  async getAll(mois?: string): Promise<Evenement[]> {
    const { data } = await api.get('/evenements', { params: mois ? { mois } : {} });
    return data.evenements;
  },

  async getById(id: number): Promise<Evenement> {
    const { data } = await api.get(`/evenements/${id}`);
    return data.evenement;
  },

  async create(input: EvenementInput): Promise<number> {
    const { data } = await api.post('/evenements', versFormData(input, false), multipart);
    return data.evenementId;
  },

  async update(id: number, input: EvenementInput): Promise<void> {
    await api.patch(`/evenements/${id}`, versFormData(input, true), multipart);
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/evenements/${id}`);
  },

  async setVitrine(id: number, visible: boolean): Promise<void> {
    await api.patch(`/evenements/${id}/vitrine`, { visible_vitrine: visible });
  },

  // Une balise <img> n'envoie pas le JWT : on passe par Axios pour récupérer un blob
  async getPhotoBlob(id: number): Promise<Blob> {
    const res = await api.get(`/evenements/${id}/photo`, { responseType: 'blob' });
    return res.data;
  },
};