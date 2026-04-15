"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Field, FieldLabel } from "@/components/ui/field";
import { Mail, Lock, Eye, EyeOff, LogIn, ShieldCheck } from "lucide-react";

export function LoginForm({ className, ...props }) {
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold font-heading">Bem-vindo de volta</h1>
        <p className="text-sm text-muted-foreground">Acesse o painel com suas credenciais de segurança.</p>
      </div>

      {/* Email */}
      <Field>
        <FieldLabel htmlFor="email">E-mail</FieldLabel>
        <div className="relative transition-transform duration-300 focus-within:-translate-y-1 shadow-xl!">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            required
            className="shadow-xl! focus-visible:ring-0 focus-visible:ring-offset-0 h-11 pl-10 border border-gray-200 bg-gray-50/50 text-sm transition-all duration-300 placeholder:text-gray-400 focus-visible:border-gray-500"
          />
        </div>
      </Field>

      {/* Password */}
      <Field>
        <FieldLabel htmlFor="password">Senha</FieldLabel>
        <div className="relative transition-transform duration-300 focus-within:-translate-y-1 shadow-xl!">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            required
            className="shadow-xl! focus-visible:ring-0 focus-visible:ring-offset-0 h-11 pl-10 border border-gray-200 bg-gray-50/50 text-sm transition-all duration-300 placeholder:text-gray-400 focus-visible:border-gray-500"
          />
        </div>
      </Field>

      {/* Remember me + forgot password */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox id="remember" checked={remember} onCheckedChange={setRemember} />
          <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
            Manter conectado
          </Label>
        </div>
        <a href="#" className="text-sm text-blue-500 hover:text-blue-600 hover:underline underline-offset-4 transition-colors">
          Esqueci minha senha
        </a>
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        className="h-12 w-full rounded-md bg-blue-500 hover:bg-blue-600 text-white font-medium shadow-lg! shadow-blue-500/20 transition-all duration-300 hover:cursor-pointer"
      >
        <LogIn className="mr-2 h-4 w-4" />
        Entrar no Sistema
      </Button>

      {/* Security footer */}
      <div className="flex items-center gap-2 rounded-md border border-green-100 bg-green-50/50 p-3">
        <ShieldCheck className="h-6 w-4 text-green-500 shrink-0" />
        <p className="text-[12px] text-green-700 leading-relaxed font-medium">Conexão segura • Dados criptografados • Acesso auditado</p>
      </div>
    </form>
  );
}
