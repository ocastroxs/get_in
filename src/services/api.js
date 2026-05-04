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

85	export const publicService = {
86	  async getStats() {
87	    try {
88	      // Este endpoint deve ser criado no back-end como uma rota pública
89	      const data = await api.get('/public/stats');
90	      return data;
91	    } catch (error) {
92	      console.error('Erro ao buscar estatísticas públicas:', error);
93	      return {
94	        sucesso: false,
95	        data: {
96	          visitasHoje: 0,
97	          setoresAtivos: 0,
98	          rastreabilidade: 0
99	        }
100	      };
101	    }
102	  }
103	};
104	
