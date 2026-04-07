"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Field,
  FieldLabel,
} from "@/components/ui/field"
import { Mail, Lock, Eye, EyeOff, LogIn, LockKeyhole, User, Radio, ShieldCheck } from "lucide-react"

const roles = [
  { id: "seguranca", label: "Segurança", icon: LockKeyhole },
  { id: "supervisor", label: "Supervisor", icon: User },
  { id: "administrador", label: "Administrador", icon: Radio },
]

export function LoginForm({ className, ...props }) {
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState("seguranca")
  const [remember, setRemember] = useState(true)

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold [--font-heading] text-foreground">
          Bem-vindo de volta
        </h1>
        <p className="text-sm text-muted-foreground">
          Acesse o painel com suas credenciais de segurança.
        </p>
      </div>

      {/* Role selector */}
      <div>
        <Label className="text-sm font-medium text-foreground mb-2 block">
          Perfil de Acesso
        </Label>
        <div className="grid grid-cols-3 gap-3">
          {roles.map((role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => setSelectedRole(role.id)}
              className={cn(
                "group flex flex-col items-center gap-2 rounded-xl border p-3 transition-all text-center",
                selectedRole === role.id
                  ? "border-blue-500 bg-blue-50 text-blue-600"
                  : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg",
                  selectedRole === role.id
                    ? "bg-blue-500/10 text-blue-500"
                    : "bg-gray-200/60 text-gray-400"
                )}
              >
                <role.icon className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-medium leading-tight">
                {role.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Email */}
      <Field>
        <FieldLabel htmlFor="email">E-mail</FieldLabel>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            required
            className="h-11 pl-10 border border-gray-200 bg-gray-50/50 text-sm placeholder:text-gray-400" />
        </div>
      </Field>

      {/* Password */}
      <Field>
        <FieldLabel htmlFor="password">Senha</FieldLabel>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            required
            className="h-11 pl-10 pr-10 border border-gray-200 bg-gray-50/50 text-sm" />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </Field>

      {/* Remember me + forgot password */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox
            id="remember"
            checked={remember}
            onCheckedChange={setRemember}
          />
          <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
            Manter conectado
          </Label>
        </div>
        <a
          href="#"
          className="text-sm text-blue-500 hover:text-blue-600 hover:underline underline-offset-4 transition-colors"
        >
          Esqueci minha senha
        </a>
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        className="h-12 w-full rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium shadow-lg shadow-blue-500/20 transition-all"
      >
        <LogIn className="mr-2 h-4 w-4" />
        Entrar no Sistema
      </Button>

      {/* Security footer */}
      <div className="flex items-center gap-2 rounded-xl border border-green-100 bg-green-50/50 p-3">
        <ShieldCheck className="h-4 w-4 text-green-500 shrink-0" />
        <p className="text-[10px] text-green-700 leading-relaxed font-medium">
          Conexão segura • Dados criptografados • Acesso auditado
        </p>
      </div>
    </form>
  )
}
