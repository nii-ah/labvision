// src/utils/auth.ts

const getUserRoles = (): string[] => {
  const userRaw = localStorage.getItem('user');
  if (!userRaw) return [];
  try {
    const user = JSON.parse(userRaw);
    return Array.isArray(user.roles) ? user.roles : [];
  } catch {
    return [];
  }
};

export const hasRole = (role: string): boolean => getUserRoles().includes(role);

export const isAdmin = (): boolean => hasRole('admin');

export const canManageMateriels = (): boolean =>
  isAdmin() || hasRole('resp_materiels');

export const canManageEvenements = (): boolean =>
  isAdmin() || hasRole('resp_activites');