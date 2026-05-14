"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const AuthContext = createContext();

const TOKEN_KEY = "getin_token";
const USER_KEY = "getin_user";
const FUNCIONARIO_KEY = "getin_funcionario";
const SESSION_COOKIE_KEY = "getin_session";
const TIPO_COOKIE_KEY = "getin_tipo";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export const normalizeTipo = (tipo) => {
  const value = String(tipo || "").trim().toLowerCase();
  const aliases = {
    administrador: "adm",
    admin: "adm",
    adm: "adm",
    porteiro: "port",
    portaria: "port",
    port: "port",
    supervisor: "sup",
    sup: "sup",
  };

  return aliases[value] || value;
};

export const getAuthTipo = (funcionario, user) =>
  normalizeTipo(
    funcionario?.tipo ||
      funcionario?.cargo ||
      user?.funcionario?.tipo ||
      user?.funcionario?.cargo ||
      user?.tipo ||
      user?.cargo
  );

const getBrowserStorageValue = (key) => {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(key) || sessionStorage.getItem(key);
};

const saveBrowserStorageValue = (key, value, remember) => {
  const storage = remember ? localStorage : sessionStorage;
  const fallbackStorage = remember ? sessionStorage : localStorage;

  storage.setItem(key, value);
  fallbackStorage.removeItem(key);
};

const removeBrowserStorageValue = (key) => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
};

const setBrowserCookie = (key, value, remember) => {
  if (typeof document === "undefined") {
    return;
  }

  const maxAge = remember ? `; max-age=${COOKIE_MAX_AGE}` : "";
  document.cookie = `${key}=${encodeURIComponent(value)}; path=/; samesite=lax${maxAge}`;
};

const removeBrowserCookie = (key) => {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${key}=; path=/; samesite=lax; max-age=0`;
};

const syncAuthCookies = (tipo, remember) => {
  const normalizedTipo = normalizeTipo(tipo);

  setBrowserCookie(SESSION_COOKIE_KEY, "1", remember);

  if (normalizedTipo) {
    setBrowserCookie(TIPO_COOKIE_KEY, normalizedTipo, remember);
  } else {
    removeBrowserCookie(TIPO_COOKIE_KEY);
  }
};

const clearAuthCookies = () => {
  removeBrowserCookie(SESSION_COOKIE_KEY);
  removeBrowserCookie(TIPO_COOKIE_KEY);
};

const parseStoredJson = (value) => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    console.error("Erro ao recuperar dados da sessao:", error);
    return null;
  }
};

const sanitizeAuthObject = (value) => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const { senha, senhaHash, password, ...safeValue } = value;
  return safeValue;
};

const getFuncionarioFromAuthData = (authData) => {
  const payload = authData?.data || authData;
  const funcionario =
    authData?.funcionario ||
    payload?.funcionario ||
    payload?.usuario?.funcionario ||
    payload?.user?.funcionario ||
    (payload?.tipo || payload?.cargo ? payload : null);

  const safeFuncionario = sanitizeAuthObject(funcionario);
  const tipo = normalizeTipo(safeFuncionario?.tipo || safeFuncionario?.cargo);

  return (
    safeFuncionario &&
    (tipo
      ? {
          ...safeFuncionario,
          tipo,
        }
      : safeFuncionario)
  );
};

const getUserFromAuthData = (authData, funcionario) => {
  const payload = authData?.data || authData;
  const { funcionario: _payloadFuncionario, ...payloadWithoutFuncionario } = payload || {};
  const baseUser =
    payload?.usuario ||
    payload?.user ||
    (payload && (payload.email || payload.nome || payload.id) ? payloadWithoutFuncionario : null) ||
    funcionario;
  const safeUser = sanitizeAuthObject(baseUser);
  const safeFuncionario = sanitizeAuthObject(funcionario);

  if (!safeUser || !safeFuncionario || baseUser === funcionario) {
    return safeUser || null;
  }

  const tipo = getAuthTipo(safeFuncionario, safeUser);

  return {
    ...safeUser,
    funcionario: safeFuncionario,
    ...(tipo ? { tipo } : {}),
    nome: safeUser.nome || safeFuncionario.nome,
    email: safeUser.email || safeFuncionario.email,
  };
};

export const getFlowRouteByTipo = (tipo) => {
  const normalizedTipo = normalizeTipo(tipo);

  if (normalizedTipo === "port") {
    return "/portaria";
  }

  if (normalizedTipo === "sup") {
    return "/supervisor";
  }

  if (normalizedTipo === "adm") {
    return "/dashboard";
  }

  return "/";
};

const isPathInSection = (pathname, section) => pathname === section || pathname.startsWith(`${section}/`);

const getProtectedRedirect = (pathname, tipo) => {
  const normalizedTipo = normalizeTipo(tipo);
  const flowRoute = getFlowRouteByTipo(normalizedTipo);
  const isDashboardFlow = isPathInSection(pathname, "/dashboard");

  if (flowRoute === "/") {
    return "/";
  }

  if (isPathInSection(pathname, "/portaria") && normalizedTipo !== "port") {
    return flowRoute;
  }

  if (isPathInSection(pathname, "/supervisor") && normalizedTipo !== "sup") {
    return flowRoute;
  }

  if ((isDashboardFlow || isPathInSection(pathname, "/configuracoes")) && normalizedTipo !== "adm") {
    return flowRoute;
  }

  return null;
};

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [funcionario, setFuncionario] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;

    queueMicrotask(() => {
      if (!isMounted) {
        return;
      }

      const storedUser = getBrowserStorageValue(USER_KEY);
      const storedFuncionario = getBrowserStorageValue(FUNCIONARIO_KEY);
      const localToken = localStorage.getItem(TOKEN_KEY);
      const sessionToken = sessionStorage.getItem(TOKEN_KEY);
      const token = localToken || sessionToken;

      if (storedUser && token) {
        const parsedUser = parseStoredJson(storedUser);
        const parsedFuncionario = getFuncionarioFromAuthData(
          parseStoredJson(storedFuncionario) || parsedUser
        );

        if (parsedUser) {
          const normalizedUser = getUserFromAuthData(parsedUser, parsedFuncionario);

          setUser(normalizedUser);
          setFuncionario(parsedFuncionario);
          setIsAuthenticated(true);
          syncAuthCookies(getAuthTipo(parsedFuncionario, normalizedUser), Boolean(localToken));
        } else {
          removeBrowserStorageValue(USER_KEY);
          removeBrowserStorageValue(TOKEN_KEY);
          removeBrowserStorageValue(FUNCIONARIO_KEY);
          clearAuthCookies();
        }
      }

      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const protectedRoutes = [
      "/dashboard",
      "/supervisor",
      "/portaria",
      "/configuracoes",
    ];
    const isProtectedRoute = protectedRoutes.some((route) => isPathInSection(pathname, route));
    const tipo = getAuthTipo(funcionario, user);

    if (!isLoading && !isAuthenticated && isProtectedRoute) {
      router.replace("/");
      return;
    }

    if (!isLoading && isAuthenticated) {
      if (pathname === "/") {
        const flowRoute = getFlowRouteByTipo(tipo);

        if (flowRoute !== "/") {
          router.replace(flowRoute);
        }

        return;
      }

      const redirectTo = getProtectedRedirect(pathname, tipo);
      if (redirectTo && redirectTo !== pathname) {
        router.replace(redirectTo);
      }
    }
  }, [funcionario, isAuthenticated, isLoading, pathname, router, user]);

  const login = (userData, token, funcionarioData = null, options = {}) => {
    const remember = options.remember ?? true;
    const authData = funcionarioData ? { ...userData, funcionario: funcionarioData } : userData;
    const authFuncionario = getFuncionarioFromAuthData(authData);
    const authUser = getUserFromAuthData(authData, authFuncionario);
    const tipo = getAuthTipo(authFuncionario, authUser);

    saveBrowserStorageValue(TOKEN_KEY, token, remember);
    saveBrowserStorageValue(USER_KEY, JSON.stringify(authUser), remember);

    if (authFuncionario) {
      saveBrowserStorageValue(FUNCIONARIO_KEY, JSON.stringify(authFuncionario), remember);
    } else {
      removeBrowserStorageValue(FUNCIONARIO_KEY);
    }

    setUser(authUser);
    setFuncionario(authFuncionario);
    setIsAuthenticated(true);
    syncAuthCookies(tipo, remember);

    router.replace(getFlowRouteByTipo(tipo));
  };

  const logout = () => {
    removeBrowserStorageValue(TOKEN_KEY);
    removeBrowserStorageValue(USER_KEY);
    removeBrowserStorageValue(FUNCIONARIO_KEY);
    setUser(null);
    setFuncionario(null);
    setIsAuthenticated(false);
    clearAuthCookies();
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, funcionario, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}
