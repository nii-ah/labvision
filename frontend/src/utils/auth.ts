// src/utils/auth.ts
export const isAdmin = (): boolean => {
  const userRaw = localStorage.getItem('user');
  if (!userRaw) return false;
  const user = JSON.parse(userRaw);
  return user.roles?.includes('admin') ?? false;
};