// src/services/ressource.service.ts
import api from './api';

export interface Domaine {
  id: number;
  nom: string;
}

export interface Ressource {
  id: number;
  titre: string;
  description: string | null;
  niveau: string;
  langue: string;
  format: 'pdf' | 'audio' | 'video';
  image_url: string | null;
  fichier_url?: string;
  telechargeable: boolean;
  visible_vitrine: boolean;
  date_creation: string;
}

export interface RessourcesResponse {
  ressources: Ressource[];
}


export interface RessourceDetail extends Ressource {
  auteur_id: number;
  auteur_nom: string;
  auteur_prenom: string;
  domaines: Domaine[];
}

export const getRessources = async (domaineId?: number): Promise<Ressource[]> => {
  const params = domaineId ? { domaine_id: domaineId } : {};
  const response = await api.get<RessourcesResponse>('/ressources', { params });
  return response.data.ressources;
};

export const getDomaines = async (): Promise<Domaine[]> => {
  const response = await api.get<{ domaines: Domaine[] }>('/domaines');
  return response.data.domaines;
};


export const getRessourceById = async (id: string | number): Promise<RessourceDetail> => {
  const response = await api.get<{ ressource: RessourceDetail }>(`/ressources/${id}`);
  return response.data.ressource;
};

const API_BASE_URL = 'http://localhost:5000/api';

export const getViewUrl = (id: number | string): string => {
  const token = localStorage.getItem('token');
  return `${API_BASE_URL}/ressources/${id}/view${token ? `?token=${token}` : ''}`;
};

export const getDownloadUrl = (id: number | string): string => {
  const token = localStorage.getItem('token');
  return `${API_BASE_URL}/ressources/${id}/download${token ? `?token=${token}` : ''}`;
};