const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://api.getin.dev.br').replace(/\/+$/, '');

const getHeaders = (tokenOverride = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  const token =
    tokenOverride ||
    (typeof window !== 'undefined'
      ? localStorage.getItem('getin_token') || sessionStorage.getItem('getin_token')
      : null);

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const getAuthOnlyHeaders = (tokenOverride = null) => {
  const headers = {};
  const token =
    tokenOverride ||
    (typeof window !== 'undefined'
      ? localStorage.getItem('getin_token') || sessionStorage.getItem('getin_token')
      : null);

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const getDefaultErrorMessage = (status) => {
  if (status === 401) {
    return 'E-mail ou senha incorretos.';
  }

  if (status === 403) {
    return 'Você não tem permissão para acessar este recurso.';
  }

  if (status === 404) {
    return 'Recurso não encontrado.';
  }

  return 'Não foi possível completar a solicitação.';
};

const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  let body = null;

  if (isJson) {
    try {
      body = await response.json();
    } catch {
      body = null;
    }
  }

  if (response.ok) {
    return body || { sucesso: true };
  }

  return {
    ...(body || {}),
    sucesso: false,
    status: response.status,
    mensagem: body?.mensagem || body?.message || body?.erro || getDefaultErrorMessage(response.status),
  };
};

const getEndpointPath = (endpoint) => `/${String(endpoint || '').replace(/^\/+/, '')}`;

const request = async (endpoint, options) => {
  try {
    const response = await fetch(`${API_URL}${getEndpointPath(endpoint)}`, options);
    return parseResponse(response);
  } catch {
    return {
      sucesso: false,
      status: 0,
      mensagem: 'Não foi possível conectar à API.',
    };
  }
};

const sanitizeFuncionario = (funcionario) => {
  if (!funcionario || typeof funcionario !== 'object') {
    return null;
  }

  const { senha, senhaHash, password, ...safeFuncionario } = funcionario;
  return safeFuncionario;
};

const getUsuarioFromLoginResponse = (response) => {
  const data = response?.data;

  if (data?.usuario) {
    return data.usuario;
  }

  if (data?.user) {
    return data.user;
  }

  return data || response?.usuario || response?.user || null;
};

const getFuncionarioFromLoginResponse = (response) => {
  const data = response?.data;
  return (
    response?.funcionario ||
    data?.funcionario ||
    data?.usuario?.funcionario ||
    data?.user?.funcionario ||
    (data?.tipo || data?.cargo ? data : null)
  );
};

const findFuncionarioByUsuarioId = async (token, usuarioId) => {
  if (!token || usuarioId === undefined || usuarioId === null) {
    return null;
  }

  const response = await request('/func', {
    method: 'GET',
    headers: getHeaders(token),
  });

  if (!response.sucesso || !Array.isArray(response.data)) {
    return null;
  }

  return (
    response.data.find((funcionario) => String(funcionario.idUsuario) === String(usuarioId)) ||
    null
  );
};

const withFuncionarioData = async (loginResponse) => {
  const usuario = getUsuarioFromLoginResponse(loginResponse);
  const funcionarioExistente = getFuncionarioFromLoginResponse(loginResponse);
  const funcionario =
    sanitizeFuncionario(funcionarioExistente) ||
    sanitizeFuncionario(await findFuncionarioByUsuarioId(loginResponse.token, usuario?.id));

  if (!usuario || !funcionario) {
    return loginResponse;
  }

  return {
    ...loginResponse,
    funcionario,
    data: {
      usuario,
      funcionario,
    },
  };
};

export const api = {
  async get(endpoint) {
    return request(endpoint, {
      method: 'GET',
      cache: 'no-store',
      headers: getHeaders(),
    });
  },

  async post(endpoint, data) {
    return request(endpoint, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
  },

  async put(endpoint, data) {
    return request(endpoint, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
  },

  async delete(endpoint) {
    return request(endpoint, {
      method: 'DELETE',
      headers: getHeaders(),
    });
  },

  async upload(endpoint, formData) {
    return request(endpoint, {
      method: 'POST',
      headers: getAuthOnlyHeaders(),
      body: formData,
    });
  },
};

export const authService = {
  async login(email, senha) {
    const loginResponse = await api.post('/auth/login', { email, senha });

    if (!loginResponse.sucesso || !loginResponse.token) {
      return loginResponse;
    }

    return withFuncionarioData(loginResponse);
  },

  logout() {
    if (typeof window === 'undefined') {
      return;
    }

    localStorage.removeItem('getin_token');
    localStorage.removeItem('getin_user');
    localStorage.removeItem('getin_funcionario');
    sessionStorage.removeItem('getin_token');
    sessionStorage.removeItem('getin_user');
    sessionStorage.removeItem('getin_funcionario');
    document.cookie = 'getin_session=; path=/; samesite=lax; max-age=0';
    document.cookie = 'getin_tipo=; path=/; samesite=lax; max-age=0';
  },

  getUser() {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('getin_user') || sessionStorage.getItem('getin_user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  isAuthenticated() {
    if (typeof window !== 'undefined') {
      return !!(localStorage.getItem('getin_token') || sessionStorage.getItem('getin_token'));
    }
    return false;
  },
};

export const publicService = {
  async getStats() {
    try {
      const data = await api.get('/public/stats');
      if (data.sucesso && data.data) {
        return {
          sucesso: true,
          data: {
            usuariosTotal: data.data.usuariosTotal || 0,
            setoresTotal: data.data.setoresTotal || 0,
            visitasHoje: data.data.visitasHoje || 0,
          },
        };
      }
    } catch (error) {
      console.warn('Não foi possível buscar estatísticas públicas:', error);
    }

    return {
      sucesso: false,
      data: {
        usuariosTotal: 0,
        setoresTotal: 0,
        visitasHoje: 0,
      },
    };
  },
};

