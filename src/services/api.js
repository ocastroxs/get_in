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

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authService = {
  async login(email, senha) {
    const data = await api.post('/auth/login', { email, senha });
    if (data.sucesso && data.token) {
      localStorage.setItem('getin_token', data.token);
      localStorage.setItem('getin_user', JSON.stringify(data.data));
    }
    return data;
  },

  async registrar(payload) {
    // payload: { nome, cpf, celular, email, idDepartamento, tipo, dataDeNascimento, senha }
    return await api.post('/auth/', payload);
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

// ─── Usuários ─────────────────────────────────────────────────────────────────

export const userService = {
  async listarTodos() {
    return await api.get('/user/');
  },

  async buscarPorId(id) {
    return await api.get(`/user/${id}`);
  },

  async buscarPorNome(nome) {
    return await api.get(`/user/name/${encodeURIComponent(nome)}`);
  },

  async buscarPorCpf(cpf) {
    return await api.get(`/user/cpf/${cpf}`);
  },

  async criar(payload) {
    // payload: { nome, cpf, cel, email }
    return await api.post('/user/', payload);
  },

  async atualizar(id, payload) {
    return await api.put(`/user/${id}`, payload);
  },

  async remover(id) {
    return await api.delete(`/user/${id}`);
  },
};

// ─── Funcionários ─────────────────────────────────────────────────────────────

export const funcService = {
  async listarTodos() {
    return await api.get('/func/');
  },

  async buscarPorId(id) {
    return await api.get(`/func/${id}`);
  },
};

// ─── Departamentos ────────────────────────────────────────────────────────────

export const depService = {
  async listarTodos() {
    return await api.get('/dep/');
  },

  async criar(payload) {
    // payload: { nome, idGestor? }
    return await api.post('/dep/', payload);
  },
};

// ─── Crachás ──────────────────────────────────────────────────────────────────

export const crachaService = {
  async listarTodos() {
    return await api.get('/cracha/');
  },

  async listarPorStatus(status) {
    // status: 'd' (disponível), 'p' (perdido), 'e' (emUso)
    return await api.get(`/cracha/status/${status}`);
  },

  async criar() {
    return await api.post('/cracha/', {});
  },
};

// ─── Tags RFID ────────────────────────────────────────────────────────────────

export const tagService = {
  async buscarPorId(id) {
    return await api.get(`/tags/${id}`);
  },

  async vincular(payload) {
    // payload: { idUsuario, idCracha, codigoTag, temporario, validade? }
    return await api.post('/tags/', payload);
  },
};

// ─── Requisições de Acesso ────────────────────────────────────────────────────

export const requisicaoService = {
  async criar(payload) {
    // payload: { idUsuario, idDepartamento }
    return await api.post('/requisicao/', payload);
  },

  async atualizarStatus(id, payload) {
    // payload: { status: 'aprovado' | 'recusado' }
    return await api.put(`/requisicao/${id}`, payload);
  },

  async listarPorDepartamento(idDep) {
    return await api.get(`/requisicao/dep/${idDep}`);
  },
};

// ─── Dispositivos ─────────────────────────────────────────────────────────────

export const dispositivoService = {
  async listarTodos() {
    return await api.get('/dispositivos/');
  },

  async criar(payload) {
    // payload: { idDepartamento, local }
    return await api.post('/dispositivos/', payload);
  },

  async validarAcesso(idDispositivo, codigoCracha) {
    return await api.get(`/dispositivos/${idDispositivo}/${codigoCracha}`);
  },
};

// ─── Logs de Acesso ───────────────────────────────────────────────────────────

export const logService = {
  async listarTodos() {
    return await api.get('/logs/');
  },

  async listarPorUsuario(idUsuario) {
    return await api.get(`/logs/user/${idUsuario}`);
  },

  async listarPorDispositivo(idDispositivo) {
    return await api.get(`/logs/device/${idDispositivo}`);
  },

  async criar(payload) {
    // payload: { idDispositivo, idUsuario, dataDeEntrada?, dataDeSaida? }
    return await api.post('/logs/', payload);
  },
};
