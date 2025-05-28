export const API_URL = import.meta.env.VITE_API_URL;

export const API_ENDPOINTS = {
  login: `${API_URL}/auth/login`,
  signup: `${API_URL}/auth/signup`,
  validateToken: `${API_URL}/auth/validate-token`,
};
