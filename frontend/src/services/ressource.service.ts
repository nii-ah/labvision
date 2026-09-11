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

export interface CreateRessourcePayload {
  titre: string;
  description?: string;
  niveau: string;
  langue: string;
  format: 'pdf' | 'audio' | 'video';
  telechargeable: boolean;
  domaine_ids: number[];
  fichier: File;
}

export const createRessource = async (payload: CreateRessourcePayload) => {
  const formData = new FormData();
  formData.append('titre', payload.titre);
  if (payload.description) formData.append('description', payload.description);
  formData.append('niveau', payload.niveau);
  formData.append('langue', payload.langue);
  formData.append('format', payload.format);
  formData.append('telechargeable', String(payload.telechargeable));
  formData.append('domaine_ids', JSON.stringify(payload.domaine_ids));
  formData.append('fichier', payload.fichier);

  const response = await api.post('/ressources', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};