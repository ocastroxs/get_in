import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import CheckboxStandard6 from "./checkbox-standard-6";
import { ShieldCheck } from "lucide-react";

export function LoginForm({
  className,
  ...props
}) {
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold --font-heading">Bem-vindo de volta</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Acesse o painel com suas credenciais de segurança.
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            required
            className="border" />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <a href="#" className="ml-auto text-sm underline-offset-4 hover:underline">
              Esqueceu sua senha?
            </a>
          </div>
          <Input id="password" type="password" required className="bg-background" />
        </Field>
        <Field>
          <Button type="submit">Entrar no Sistema</Button>
          <div className="flex">
            <CheckboxStandard6 />
            <a href="#" className="ml-auto text-sm underline-offset-4 hover:underline">
              Esqueceu sua senha?
            </a>
          </div>
        </Field>
        <div className="">
          <div className="">
            <ShieldCheck />
          </div>
          <p>Conexão Segura • Dados Criptografados • Acesso Auditado</p>
        </div>
      </FieldGroup>
    </form>
  );
}
