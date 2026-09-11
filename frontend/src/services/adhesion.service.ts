// src/services/adhesion.service.ts
import api from './api';

export interface Adhesion {
  id: number;
  user_id: number;
  statut_labvision: string;
  date_demande: string;
  validee: boolean;
  date_validation: string | null;
  nom: string;
  prenom: string;
  email: string;
}

// src/services/adhesion.service.ts (ajoute ceci)

export interface MonAdhesion {
  id: number;
  statut_labvision: string;
  validee: boolean;
  date_demande: string;
  date_validation: string | null;
}


export const demanderAdhesion = async (): Promise<{ message: string }> => {
  const response = await api.post('/adhesions', {});
  return response.data;
};

export const getAdhesionsEnAttente = async (): Promise<Adhesion[]> => {
  const response = await api.get<{ adhesions: Adhesion[] }>('/adhesions', {
    params: { statut: 'en_attente' },
  });
  return response.data.adhesions;
};

export const validerAdhesion = async (id: number): Promise<{ message: string }> => {
  const response = await api.patch(`/adhesions/${id}/valider`);
  return response.data;
};

export const getMonAdhesion = async (): Promise<MonAdhesion | null> => {
  const response = await api.get<{ adhesion: MonAdhesion | null }>('/adhesions/mine');
  return response.data.adhesion;
};