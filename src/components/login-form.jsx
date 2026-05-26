"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Field } from "@/components/ui/field";
import { Mail, Lock, Eye, EyeOff, LogIn, ShieldCheck, AlertCircle } from "lucide-react";
import { authService } from "@/services/api";
import { getAuthTipo, getFlowRouteByTipo, useAuth } from "@/lib/AuthContext";
import BrandLogo from "@/components/BrandLogo";

export function LoginForm({ className, ...props }) {
  const { login: updateAuthContext } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [shakeKey, setShakeKey] = useState(0);

  const validate = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = "O e-mail é obrigatório.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Informe um e-mail válido.";
    }
    if (!password) {
      newErrors.password = "A senha é obrigatória.";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoading) return;

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setShakeKey((prev) => prev + 1);
      return;
    }

    setIsLoading(true);
    setGeneralError("");

    try {
      const resultado = await authService.login(email, password);

      if (resultado.sucesso && resultado.token) {
        const funcionario =
          resultado.data?.funcionario ||
          resultado.funcionario ||
          (resultado.data?.tipo ? resultado.data : null);
        const usuario = resultado.data?.usuario || resultado.data?.user || resultado.data;
        const tipo = getAuthTipo(funcionario, usuario);
        const redirectTo = getFlowRouteByTipo(tipo);

        if (redirectTo === "/") {
          setGeneralError("Seu usuário não possui perfil de acesso a este sistema.");
          setShakeKey((prev) => prev + 1);
          return;
        }

        await updateAuthContext(resultado, resultado.token, funcionario, { remember });
        router.push(redirectTo);
      } else {
        setGeneralError(resultado.mensagem || "E-mail ou senha incorretos.");
        setShakeKey((prev) => prev + 1);
      }
    } catch {
      setGeneralError("Erro de conexão. O servidor está online?");
      setShakeKey((prev) => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={cn(
        "flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-white text-slate-900 dark:bg-white dark:text-slate-900",
        className
      )}
      {...props}
    >
      {/* Logo visível apenas em dispositivos móveis */}
      <div className="flex lg:hidden justify-center mb-2">
        <BrandLogo variant="dark" />
      </div>

      {/* Cabeçalho */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-bold font-heading tracking-tight text-slate-900 dark:text-slate-900">
          Bem-vindo de volta
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-500">
          Acesse o painel com suas credenciais de segurança.
        </p>
      </div>

      {/* Campo E-mail */}
      <Field className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-800">E-mail</span>
        <div
          key={`email-${shakeKey}`}
          className={cn(
            "relative transition-transform duration-300 focus-within:-translate-y-0.5",
            (errors.email || generalError) && "animate-shake"
          )}
        >
          <Mail
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200",
              errors.email ? "text-red-400" : "text-slate-400"
            )}
          />
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              if (generalError) setGeneralError("");
            }}
            disabled={isLoading}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={cn(
              "h-11 pl-10 border bg-slate-50/50 text-sm text-slate-900 transition-all duration-300 placeholder:text-slate-400",
              "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:bg-white",
              "dark:border-slate-200 dark:bg-slate-50/50 dark:text-slate-900 dark:placeholder:text-slate-400 dark:focus-visible:bg-white",
              errors.email
                ? "border-red-400 bg-red-50/30 focus-visible:border-red-500 dark:border-red-400 dark:bg-red-50/30"
                : "border-slate-200 focus-visible:border-blue-500 dark:focus-visible:border-blue-500"
            )}
          />
        </div>
        {errors.email && (
          <p
            id="email-error"
            role="alert"
            className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-500 mt-1 animate-in fade-in slide-in-from-top-1 duration-300"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {errors.email}
          </p>
        )}
      </Field>

      {/* Campo Senha */}
      <Field className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-800">Senha</span>
        <div
          key={`password-${shakeKey}`}
          className={cn(
            "relative transition-transform duration-300 focus-within:-translate-y-0.5",
            (errors.password || generalError) && "animate-shake"
          )}
        >
          <Lock
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200",
              errors.password ? "text-red-400" : "text-slate-400"
            )}
          />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              if (generalError) setGeneralError("");
            }}
            disabled={isLoading}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
            className={cn(
              "h-11 pl-10 pr-11 border bg-slate-50/50 text-sm text-slate-900 transition-all duration-300 placeholder:text-slate-400",
              "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:bg-white",
              "dark:border-slate-200 dark:bg-slate-50/50 dark:text-slate-900 dark:placeholder:text-slate-400 dark:focus-visible:bg-white",
              errors.password
                ? "border-red-400 bg-red-50/30 focus-visible:border-red-500 dark:border-red-400 dark:bg-red-50/30"
                : "border-slate-200 focus-visible:border-blue-500 dark:focus-visible:border-blue-500"
            )}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            disabled={isLoading}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded disabled:opacity-50"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p
            id="password-error"
            role="alert"
            className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-500 mt-1 animate-in fade-in slide-in-from-top-1 duration-300"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {errors.password}
          </p>
        )}
      </Field>

      {/* Erro geral */}
      {generalError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 dark:bg-red-50 dark:border-red-200 dark:text-red-700 animate-in fade-in slide-in-from-top-2 duration-300" role="alert">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {generalError}
          </div>
        </div>
      )}

      {/* Manter conectado + Esqueci senha */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Adicionada a classe literal de borda para blindar o Checkbox */}
          <Checkbox
            id="remember"
            checked={remember}
            onCheckedChange={setRemember}
            disabled={isLoading}
            className="border-slate-300 bg-white dark:border-slate-300 dark:bg-white data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 dark:data-[state=checked]:bg-blue-500 dark:data-[state=checked]:border-blue-500"
          />
          <Label
            htmlFor="remember"
            className="text-sm text-slate-500 dark:text-slate-500 cursor-pointer select-none"
          >
            Manter conectado
          </Label>
        </div>
        <a
          href="#"
          className="text-sm text-blue-500 hover:text-blue-600 hover:underline underline-offset-4 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
        >
          Esqueci minha senha
        </a>
      </div>

      {/* Botão de envio */}
      <Button
        type="submit"
        disabled={isLoading}
        className={cn(
          "h-12 w-full rounded-xl bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white font-semibold",
          "shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-blue-500/40 hover:cursor-pointer",
          "disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
        )}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            Entrando…
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <LogIn className="h-4 w-4" />
            Entrar no Sistema
          </span>
        )}
      </Button>

      {/* Rodapé de segurança */}
      <div className="flex items-center gap-2.5 rounded-xl border border-green-100 bg-green-50 px-4 py-3 dark:border-green-100 dark:bg-green-50">
        <ShieldCheck className="h-5 w-5 text-green-500 shrink-0" />
        <p className="text-[11px] text-green-700 dark:text-green-700 leading-relaxed font-medium">
          Conexão segura&nbsp;•&nbsp;Dados criptografados&nbsp;•&nbsp;Acesso auditado
        </p>
      </div>
    </form>
  );
}
