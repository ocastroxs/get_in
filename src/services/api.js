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

const parseResponse = async (response) => {
  const text = await response.text();

  if (!text) {
    return { sucesso: response.ok };
  }

  try {
    return JSON.parse(text);
  } catch {
    const htmlError = text.match(/<pre>(.*?)<\/pre>/is)?.[1];
    const mensagem = htmlError
      ? htmlError.replace(/<[^>]*>/g, '').trim()
      : text.trim();

    return {
      sucesso: false,
      mensagem: mensagem || `Erro ${response.status} ao comunicar com o servidor.`,
      status: response.status,
    };
  }
};

export const api = {
  async get(endpoint) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return parseResponse(response);
  },

  async post(endpoint, data) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return parseResponse(response);
  },

  async put(endpoint, data) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return parseResponse(response);
  },

  async delete(endpoint) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return parseResponse(response);
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

export const publicService = {
  async getStats() {
    try {
      // Este endpoint deve ser criado no back-end como uma rota pública
      const data = await api.get('/public/stats');
      return data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas públicas:', error);
      return {
        sucesso: false,
        data: {
          visitasHoje: 0,
          setoresAtivos: 0,
          rastreabilidade: 0
        }
      };
    }
  }
};
