"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Field, FieldLabel } from "@/components/ui/field";
import { Mail, Lock, Eye, EyeOff, LogIn, ShieldCheck, ArrowRight, AlertCircle } from "lucide-react";

export function LoginForm({ className, ...props }) {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validação básica
    if (!email || !password) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Por favor, insira um e-mail válido.");
      return;
    }

    setIsLoading(true);

    // Simular delay de autenticação
    setTimeout(() => {
      try {
        login(email, password);
      } catch (err) {
        setError("Erro ao fazer login. Tente novamente.");
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-700", className)} 
      {...props}
    >
      {/* Header com animação */}
      <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-right-4 duration-700 delay-100">
        <h1 className="text-3xl font-bold font-heading bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
          Bem-vindo de volta
        </h1>
        <p className="text-sm text-muted-foreground">Acesse o painel com suas credenciais de segurança.</p>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border-2 border-red-200 bg-red-50/80 p-3 animate-in fade-in shake duration-300">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Email com melhorias */}
      <Field className="animate-in fade-in slide-in-from-right-4 duration-700 delay-150">
        <FieldLabel htmlFor="email">E-mail</FieldLabel>
        <div className="relative transition-all duration-300 focus-within:-translate-y-1">
          <Mail className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-300",
            focusedField === "email" ? "text-blue-500" : "text-muted-foreground/50"
          )} />
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            onFocus={() => setFocusedField("email")}
            onBlur={() => setFocusedField(null)}
            disabled={isLoading}
            className={cn(
              "h-11 pl-10 border-2 bg-white/80 text-sm transition-all duration-300 placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed",
              focusedField === "email" 
                ? "border-blue-400 shadow-lg shadow-blue-500/10 bg-white" 
                : "border-gray-200 hover:border-gray-300"
            )}
          />
        </div>
      </Field>

      {/* Password com melhorias */}
      <Field className="animate-in fade-in slide-in-from-right-4 duration-700 delay-200">
        <FieldLabel htmlFor="password">Senha</FieldLabel>
        <div className="relative transition-all duration-300 focus-within:-translate-y-1">
          <Lock className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-300",
            focusedField === "password" ? "text-blue-500" : "text-muted-foreground/50"
          )} />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            onFocus={() => setFocusedField("password")}
            onBlur={() => setFocusedField(null)}
            disabled={isLoading}
            className={cn(
              "h-11 pl-10 pr-10 border-2 bg-white/80 text-sm transition-all duration-300 placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed",
              focusedField === "password" 
                ? "border-blue-400 shadow-lg shadow-blue-500/10 bg-white" 
                : "border-gray-200 hover:border-gray-300"
            )}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed",
              focusedField === "password" ? "text-blue-500" : "text-muted-foreground/50 hover:text-muted-foreground"
            )}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </Field>

      {/* Remember me + forgot password com melhorias */}
      <div className="flex items-center justify-between animate-in fade-in slide-in-from-right-4 duration-700 delay-250">
        <div className="flex items-center gap-2">
          <Checkbox 
            id="remember" 
            checked={remember} 
            onCheckedChange={setRemember}
            disabled={isLoading}
            className="transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
            Manter conectado
          </Label>
        </div>
        <a 
          href="#" 
          className="text-sm text-blue-500 hover:text-blue-600 hover:underline underline-offset-4 transition-all duration-300 font-medium"
          onClick={(e) => e.preventDefault()}
        >
          Esqueci minha senha
        </a>
      </div>

      {/* Submit button com estado de carregamento */}
      <Button
        type="submit"
        disabled={isLoading}
        className={cn(
          "h-12 w-full rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium shadow-lg shadow-blue-500/30 transition-all duration-300 group animate-in fade-in slide-in-from-right-4 duration-700 delay-300",
          isLoading && "opacity-75 cursor-not-allowed"
        )}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Entrando...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <LogIn className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            Entrar no Sistema
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 opacity-0 group-hover:opacity-100" />
          </div>
        )}
      </Button>

      {/* Security footer com melhorias */}
      <div className="flex items-center gap-2 rounded-lg border-2 border-green-200 bg-gradient-to-r from-green-50/80 to-emerald-50/80 p-4 backdrop-blur-sm animate-in fade-in slide-in-from-right-4 duration-700 delay-350 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300">
        <ShieldCheck className="h-5 w-5 text-green-600 shrink-0 animate-pulse" />
        <p className="text-[12px] text-green-700 leading-relaxed font-medium">
          <span className="font-bold">Segurança garantida:</span> Conexão criptografada • Dados protegidos • Acesso auditado
        </p>
      </div>

      {/* Divider com gradiente */}
      <div className="relative flex items-center gap-3 my-2">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
        <span className="text-xs text-muted-foreground/60 font-medium">ou</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
      </div>

      {/* Link para cadastro */}
      <p className="text-center text-sm text-muted-foreground animate-in fade-in slide-in-from-right-4 duration-700 delay-400">
        Não tem uma conta?{" "}
        <a href="/registrarFuncionario" className="text-blue-500 hover:text-blue-600 font-medium transition-colors hover:underline underline-offset-2">
          Solicite acesso
        </a>
      </p>
    </form>
  );
}
