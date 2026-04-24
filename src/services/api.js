const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://get-in-ilp5.onrender.com';

const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('getin_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

export const api = {
  async get(endpoint) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return response.json();
  },

  async post(endpoint, data) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async put(endpoint, data) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async delete(endpoint) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return response.json();
  },
};

export const authService = {
  async login(email, senha) {
    const data = await api.post('/auth/login', { email, senha });
    if (data.sucesso && data.token) {
      localStorage.setItem('getin_token', data.token);
      localStorage.setItem('getin_user', JSON.stringify(data.data));
    }
    return data;
  },

  logout() {
    localStorage.removeItem('getin_token');
    localStorage.removeItem('getin_user');
  },

  getUser() {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('getin_user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  isAuthenticated() {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('getin_token');
    }
    return false;
  }
};
