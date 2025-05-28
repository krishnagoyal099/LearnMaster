// Use relative URLs in production, localhost in development
export const API_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.DEV ? 'http://localhost:5000' : ''
);

export const API_ENDPOINTS = {
  login: `${API_URL}/auth/login`,
  signup: `${API_URL}/auth/signup`,
  validateToken: `${API_URL}/auth/validate-token`,
};

console.log('API Configuration:', {
  API_URL,
  isDev: import.meta.env.DEV,
  endpoints: API_ENDPOINTS
});
