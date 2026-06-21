// src/services/auth.service.ts
import api from './api';

export interface RegisterData {
  nom: string;
  prenom: string;
  email: string;
  mot_de_passe: string;
}

export interface LoginData {
  email: string;
  mot_de_passe: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    roles: string[];
  };
}

export const registerUser = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/register', data);
  return response.data;
};

export const loginUser = async (data: LoginData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/login', data);
  return response.data;
};