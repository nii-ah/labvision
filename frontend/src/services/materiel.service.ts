// src/services/materiel.service.ts
import api from './api';

export interface MaterielFichier {
  id: number;
  type_fichier: 'fiche_technique' | 'manuel' | 'autre';
  nom_original: string;
  mime_type: string | null;
  taille: number | null;
  created_at: string;
}

export interface Materiel {
  id: number;
  nom: string;
  description: string | null;
  quantite_totale: number;
  visible_vitrine: boolean | 0 | 1;
  created_at: string;
  nb_fichiers?: number;
  fichiers?: MaterielFichier[];
}

export interface MaterielInput {
  nom: string;
  description?: string | null;
  quantite_totale: number;
}

export const materielService = {
  async getAll(): Promise<Materiel[]> {
    const { data } = await api.get('/materiels');
    return data.materiels;
  },

  async getById(id: number): Promise<Materiel> {
    const { data } = await api.get(`/materiels/${id}`);
    return data.materiel;
  },

  async create(input: MaterielInput): Promise<number> {
    const { data } = await api.post('/materiels', input);
    return data.materielId;
  },

  async update(id: number, input: Partial<MaterielInput>): Promise<void> {
    await api.patch(`/materiels/${id}`, input);
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/materiels/${id}`);
  },

  async setVitrine(id: number, visible: boolean): Promise<void> {
    await api.patch(`/materiels/${id}/vitrine`, { visible_vitrine: visible });
  },

 async addFichier(
  id: number,
  fichier: File,
  type_fichier: MaterielFichier['type_fichier']
): Promise<void> {
  const form = new FormData();
  form.append('type_fichier', type_fichier);
  form.append('fichier', fichier);
  await api.post(`/materiels/${id}/fichiers`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
},

  async removeFichier(id: number, fichierId: number): Promise<void> {
    await api.delete(`/materiels/${id}/fichiers/${fichierId}`);
  },

  // Passe par Axios pour envoyer le JWT, puis ouvre le blob dans un nouvel onglet
  async openFichier(id: number, fichierId: number): Promise<void> {
    const res = await api.get(`/materiels/${id}/fichiers/${fichierId}`, {
      responseType: 'blob',
    });
    const url = URL.createObjectURL(res.data);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  },
};