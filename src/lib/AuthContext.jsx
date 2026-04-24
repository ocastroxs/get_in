"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Verificar se há sessão armazenada ao montar o componente
  useEffect(() => {
    const storedUser = localStorage.getItem("getin_user");
    const token = localStorage.getItem("getin_token");
    
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Erro ao recuperar usuário:", error);
        localStorage.removeItem("getin_user");
        localStorage.removeItem("getin_token");
      }
    }
    setIsLoading(false);
  }, []);

  // Redirecionar para login se não autenticado e tentar acessar rota protegida
  useEffect(() => {
    const protectedRoutes = ["/dashboard", "/registrarFuncionario", "/permissao", "/crachas", "/relatorios"];
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    if (!isLoading && !isAuthenticated && isProtectedRoute) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  const login = (userData, token) => {
    // Agora o login recebe os dados reais vindos da sua integração
    localStorage.setItem("getin_token", token);
    localStorage.setItem("getin_user", JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    router.push("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("getin_token");
    localStorage.removeItem("getin_user");
    setUser(null);
    setIsAuthenticated(false);
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isLoading, login, logout }}>
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
