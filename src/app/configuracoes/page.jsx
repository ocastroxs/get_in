"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Camera,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogOut,
  Mail,
  RotateCcw,
  Save,
  Shield,
  SlidersHorizontal,
  Smartphone,
  User,
} from "lucide-react";
import Topbar from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import UserAvatar from "@/components/ui/UserAvatar";
import { getAuthTipo, useAuth } from "@/lib/AuthContext";
import { maskPhone } from "@/lib/utils";
import { api } from "@/services/api";
import { useToast } from "@/components/ui/toast-provider";

const NOTIFICATION_STORAGE_KEY = "getin_notification_preferences";

const CARGOS = [
  { value: "adm", label: "Administrador" },
  { value: "sup", label: "Supervisor" },
  { value: "port", label: "Portaria" },
];

const DEFAULT_NOTIFICACOES = {
  emailNovoVisitante: true,
  emailCheckIn: true,
  emailAlerta: true,
  emailRelatorio: false,
  pushNotificacoes: true,
  pushAlertas: true,
  toastSistema: true,
};

function pickFirst(...values) {
  return values.find((value) => value !== undefined && value !== null && String(value).trim() !== "") || "";
}

function getCargoLabel(tipo) {
  return CARGOS.find((cargo) => cargo.value === tipo)?.label || "Funcionario";
}

function mapProfileResponse(response, fallbackUser, fallbackFuncionario) {
  const data = response?.data || {};
  const perfil = data.perfil || {};
  const usuario = data.usuario || fallbackUser || {};
  const funcionario = data.funcionario || fallbackFuncionario || {};
  const tipo = getAuthTipo(funcionario, usuario);

  return {
    nome: pickFirst(perfil.nome, usuario.nome, "Usuario"),
    email: pickFirst(perfil.email, usuario.email),
    telefone: maskPhone(pickFirst(perfil.telefone, perfil.celular, usuario.celular)),
    setor: pickFirst(perfil.setor, funcionario.setor?.nome, funcionario.setores?.nome),
    idSetor: pickFirst(funcionario.idSetor, funcionario.setor?.id, funcionario.setores?.id),
    cargo: tipo || "func",
    dataAdmissao: pickFirst(perfil.dataAdmissao, funcionario.dataDeCriacao, usuario.dataDeCriacao),
    avatarUrl: pickFirst(perfil.avatarUrl, funcionario.avatarUrl, funcionario.imagem),
    funcionarioId: pickFirst(funcionario.id, fallbackFuncionario?.id),
  };
}

function loadNotificationPreferences() {
  if (typeof window === "undefined") {
    return DEFAULT_NOTIFICACOES;
  }

  try {
    const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    return stored ? { ...DEFAULT_NOTIFICACOES, ...JSON.parse(stored) } : DEFAULT_NOTIFICACOES;
  } catch {
    return DEFAULT_NOTIFICACOES;
  }
}

export default function ConfiguracoesPage() {
  const { user, funcionario, logout, updateAuthData } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [abaAtiva, setAbaAtiva] = useState("perfil");
  const [loading, setLoading] = useState(false);
  const [loadingPerfil, setLoadingPerfil] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [perfil, setPerfil] = useState(() => mapProfileResponse(null, user, funcionario));
  const [perfilOriginal, setPerfilOriginal] = useState(perfil);
  const [seguranca, setSeguranca] = useState({
    senhaAtual: "",
    novaSenha: "",
    confirmarSenha: "",
  });
  const [notificacoes, setNotificacoes] = useState(DEFAULT_NOTIFICACOES);
  const [notificacoesOriginal, setNotificacoesOriginal] = useState(DEFAULT_NOTIFICACOES);

  useEffect(() => {
    async function carregarConfiguracoes() {
      setLoadingPerfil(true);

      try {
        const profileResponse = await api.get("/user/me/profile");

        const nextPerfil = profileResponse.sucesso
          ? mapProfileResponse(profileResponse, user, funcionario)
          : mapProfileResponse(null, user, funcionario);

        setPerfil(nextPerfil);
        setPerfilOriginal(nextPerfil);

      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
        showToast({
          type: "error",
          title: "Configurações não carregadas",
          description: "Usando os dados locais da sessão.",
        });
      } finally {
        setLoadingPerfil(false);
      }
    }

    const preferencias = loadNotificationPreferences();
    setNotificacoes(preferencias);
    setNotificacoesOriginal(preferencias);
    carregarConfiguracoes();
  }, [funcionario, showToast, user]);

  async function handleSalvarPerfil() {
    setLoading(true);

    try {
      const response = await api.put("/user/me/profile", {
        nome: perfil.nome,
        email: perfil.email,
        telefone: perfil.telefone,
      });

      if (!response.sucesso) {
        throw new Error(response.mensagem || response.erro || "Erro ao salvar perfil.");
      }

      const nextPerfil = mapProfileResponse(response, user, funcionario);
      setPerfil(nextPerfil);
      setPerfilOriginal(nextPerfil);

      const data = response.data || {};
      if (data.usuario && data.funcionario) {
        updateAuthData({ data: { usuario: data.usuario, funcionario: data.funcionario } }, data.funcionario);
      }

      showToast({
        type: "success",
        title: "Perfil atualizado",
        description: "Suas informações foram salvas.",
      });
    } catch (error) {
      showToast({
        type: "error",
        title: "Erro ao salvar perfil",
        description: error.message || "Tente novamente em instantes.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSalvarSeguranca() {
    if (seguranca.novaSenha !== seguranca.confirmarSenha) {
      showToast({
        type: "error",
        title: "Senhas diferentes",
        description: "A confirmacao precisa repetir a nova senha.",
      });
      return;
    }

    if (seguranca.novaSenha.length < 8) {
      showToast({
        type: "error",
        title: "Senha muito curta",
        description: "Use no minimo 8 caracteres.",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await api.put("/user/me/password", {
        senhaAtual: seguranca.senhaAtual,
        novaSenha: seguranca.novaSenha,
      });

      if (!response.sucesso) {
        throw new Error(response.mensagem || response.erro || "Erro ao alterar senha.");
      }

      setSeguranca({ senhaAtual: "", novaSenha: "", confirmarSenha: "" });
      showToast({
        type: "success",
        title: "Senha alterada",
        description: "A nova senha ja esta ativa.",
      });
    } catch (error) {
      showToast({
        type: "error",
        title: "Erro ao alterar senha",
        description: error.message || "Confira a senha atual e tente de novo.",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleSalvarNotificacoes() {
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notificacoes));
    setNotificacoesOriginal(notificacoes);
    showToast({
      type: "success",
      title: "Notificações atualizadas",
      description: "Os avisos visuais e preferenciais foram salvos.",
    });
  }

  async function handleAvatarChange(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const funcionarioId = perfil.funcionarioId || funcionario?.id;

    if (!funcionarioId) {
      showToast({
        type: "error",
        title: "Foto não enviada",
        description: "Não foi possível identificar seu funcionário.",
      });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await api.upload(`/avatar/${funcionarioId}`, formData);

      if (!response.sucesso) {
        throw new Error(response.mensagem || response.erro || "Erro ao enviar imagem.");
      }

      const avatarUrl = response.data?.avatarUrl || response.data?.imagem;
      setPerfil((current) => ({ ...current, avatarUrl }));
      setPerfilOriginal((current) => ({ ...current, avatarUrl }));
      updateAuthData(
        {
          data: {
            usuario: { ...(user || {}), avatarUrl },
            funcionario: { ...(funcionario || {}), avatarUrl, imagem: avatarUrl },
          },
        },
        { ...(funcionario || {}), avatarUrl, imagem: avatarUrl }
      );

      showToast({
        type: "success",
        title: "Foto atualizada",
        description: "Sua foto de perfil foi alterada.",
      });
    } catch (error) {
      showToast({
        type: "error",
        title: "Erro no upload",
        description: error.message || "Use uma imagem valida de ate 5 MB.",
      });
    } finally {
      event.target.value = "";
      setLoading(false);
    }
  }

  // Função interna para disparar o logout global do app
  const handleSairDoSistema = () => {
    try {
      logout();
    } catch (error) {
      console.error("Erro ao efetuar logout:", error);
    }
  };

  return (
    <>
      <Topbar
        title="Configurações"
        subtitle="Gerencie perfil, segurança e notificações do sistema"
      />

      <div className="space-y-6 animate-in fade-in duration-700">
        <div className="flex items-center justify-between border-b border-border gap-4 overflow-x-auto">
          <div className="flex gap-2">
            <TabButton active={abaAtiva === "perfil"} onClick={() => setAbaAtiva("perfil")} icon={<User size={16} />} label="Perfil" />
            <TabButton active={abaAtiva === "seguranca"} onClick={() => setAbaAtiva("seguranca")} icon={<Lock size={16} />} label="Segurança" />
            <TabButton active={abaAtiva === "notificacoes"} onClick={() => setAbaAtiva("notificacoes")} icon={<Bell size={16} />} label="Notificações" />
            <TabButton active={abaAtiva === "preferencias"} onClick={() => setAbaAtiva("preferencias")} icon={<SlidersHorizontal size={16} />} label="Preferências" />
          </div>

          <Button
            type="button"
            variant="destructive"
            className="h-9 gap-2 rounded-xl text-xs md:text-sm font-semibold mb-2"
            onClick={handleSairDoSistema}
          >
            <LogOut size={14} />
            Sair do Sistema
          </Button>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6">
          {loadingPerfil ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Carregando configuracoes...
            </div>
          ) : (
            <>
              {abaAtiva === "perfil" && (
                <div className="space-y-6">
                  <div className="flex flex-col gap-5 border-b border-border pb-6 md:flex-row md:items-center">
                    <UserAvatar name={perfil.nome} email={perfil.email} src={perfil.avatarUrl} className="h-20 w-20 text-2xl" />
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-xl font-bold text-foreground">{perfil.nome}</h2>
                      <p className="text-sm text-muted-foreground">{getCargoLabel(perfil.cargo)}</p>
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    <Button type="button" variant="outline" className="h-10 gap-2 rounded-xl" onClick={() => fileInputRef.current?.click()} disabled={loading}>
                      <Camera size={16} />
                      Alterar foto
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="Nome completo">
                      <Input value={perfil.nome} onChange={(event) => setPerfil({ ...perfil, nome: event.target.value })} className="h-11 rounded-xl" />
                    </Field>
                    <Field label="E-mail">
                      <Input type="email" value={perfil.email} onChange={(event) => setPerfil({ ...perfil, email: event.target.value })} className="h-11 rounded-xl" />
                    </Field>
                    <Field label="Telefone">
                      <Input
                        type="tel"
                        inputMode="tel"
                        value={perfil.telefone}
                        onChange={(event) => setPerfil({ ...perfil, telefone: maskPhone(event.target.value) })}
                        className="h-11 rounded-xl"
                      />
                    </Field>
                    <Field label="Setor principal">
                      <Input value={perfil.setor || "Nao informado"} disabled className="h-11 rounded-xl opacity-70" />
                    </Field>
                    <Field label="Cargo">
                      <Input value={getCargoLabel(perfil.cargo)} disabled className="h-11 rounded-xl opacity-70" />
                    </Field>
                    <Field label="Data de admissão">
                      <Input type="date" value={perfil.dataAdmissao ? String(perfil.dataAdmissao).slice(0, 10) : ""} disabled className="h-11 rounded-xl opacity-70" />
                    </Field>
                  </div>

                  <ActionRow
                    onReset={() => setPerfil(perfilOriginal)}
                    onSave={handleSalvarPerfil}
                    loading={loading}
                    saveLabel="Salvar alterações"
                  />
                </div>
              )}

              {abaAtiva === "seguranca" && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                      <Shield size={18} />
                      Alterar senha
                    </h2>
                    <PasswordField label="Senha atual" value={seguranca.senhaAtual} onChange={(value) => setSeguranca({ ...seguranca, senhaAtual: value })} />
                    <PasswordField
                      label="Nova senha"
                      value={seguranca.novaSenha}
                      onChange={(value) => setSeguranca({ ...seguranca, novaSenha: value })}
                      visible={showPassword}
                      onToggle={() => setShowPassword((current) => !current)}
                    />
                    <PasswordField
                      label="Confirmar nova senha"
                      value={seguranca.confirmarSenha}
                      onChange={(value) => setSeguranca({ ...seguranca, confirmarSenha: value })}
                      visible={showConfirmPassword}
                      onToggle={() => setShowConfirmPassword((current) => !current)}
                    />
                  </div>

                  <ActionRow
                    onReset={() => setSeguranca({ senhaAtual: "", novaSenha: "", confirmarSenha: "" })}
                    onSave={handleSalvarSeguranca}
                    loading={loading}
                    saveLabel="Alterar senha"
                  />
                </div>
              )}

              {abaAtiva === "notificacoes" && (
                <div className="space-y-6">
                  <NotificationGroup title="E-mail" icon={<Mail size={18} />}>
                    <CheckboxItem label="Novo visitante registrado" checked={notificacoes.emailNovoVisitante} onChange={(checked) => setNotificacoes({ ...notificacoes, emailNovoVisitante: checked })} />
                    <CheckboxItem label="Check-in e check-out" checked={notificacoes.emailCheckIn} onChange={(checked) => setNotificacoes({ ...notificacoes, emailCheckIn: checked })} />
                    <CheckboxItem label="Alertas de segurança" checked={notificacoes.emailAlerta} onChange={(checked) => setNotificacoes({ ...notificacoes, emailAlerta: checked })} />
                    <CheckboxItem label="Relatórios periódicos" checked={notificacoes.emailRelatorio} onChange={(checked) => setNotificacoes({ ...notificacoes, emailRelatorio: checked })} />
                  </NotificationGroup>

                  <NotificationGroup title="Avisos visuais" icon={<Smartphone size={18} />}>
                    <CheckboxItem label="Notificações gerais no canto inferior" checked={notificacoes.pushNotificacoes} onChange={(checked) => setNotificacoes({ ...notificacoes, pushNotificacoes: checked })} />
                    <CheckboxItem label="Alertas críticos" checked={notificacoes.pushAlertas} onChange={(checked) => setNotificacoes({ ...notificacoes, pushAlertas: checked })} />
                    <CheckboxItem label="Toasts de ações importantes" checked={notificacoes.toastSistema} onChange={(checked) => setNotificacoes({ ...notificacoes, toastSistema: checked })} />
                  </NotificationGroup>

                  <ActionRow
                    onReset={() => setNotificacoes(notificacoesOriginal)}
                    onSave={handleSalvarNotificacoes}
                    loading={false}
                    saveLabel="Salvar notificações"
                  />
                </div>
              )}

              {abaAtiva === "preferencias" && (
                <div className="space-y-4">
                  <section className="rounded-2xl border border-border/70 bg-background/60 p-5">
                    <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                      <SlidersHorizontal size={18} />
                      Preferências
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                      Esta área está reservada para preferências pessoais de visualização, idioma e atalhos do sistema.
                    </p>
                  </section>

                  <div className="grid gap-3 md:grid-cols-3">
                    {["Tema do sistema", "Densidade das tabelas", "Atalhos de navegação"].map((label) => (
                      <div key={label} className="rounded-2xl border border-border bg-muted/30 p-4">
                        <p className="text-sm font-bold text-foreground">{label}</p>
                        <p className="mt-1 text-xs text-muted-foreground">Em breve</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-foreground">{label}</span>
      {children}
    </label>
  );
}

function PasswordField({ label, value, onChange, visible = false, onToggle }) {
  const type = onToggle ? (visible ? "text" : "password") : "password";

  return (
    <Field label={label}>
      <div className="relative">
        <Input
          type={type}
          autoComplete="new-password"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 rounded-xl pr-11"
        />
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          >
            {visible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </Field>
  );
}

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 border-b-2 px-4 pb-3 text-sm font-semibold transition ${
        active
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function CheckboxItem({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border/60 bg-card/80 p-3 text-sm font-medium text-foreground transition hover:bg-muted/40 dark:bg-white/[0.04] dark:hover:bg-white/[0.07]">
      <Checkbox checked={checked} onCheckedChange={onChange} className="h-5 w-5" />
      <span className="flex-1">{label}</span>
    </label>
  );
}

function NotificationGroup({ title, icon, children }) {
  return (
    <section className="space-y-3 rounded-2xl border border-border/70 bg-card/90 p-4 dark:bg-white/[0.03]">
      <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
        {icon}
        {title}
      </h2>
      <div className="grid gap-3 md:grid-cols-2">{children}</div>
    </section>
  );
}

function ActionRow({ onReset, onSave, loading, saveLabel }) {
  return (
    <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
      <Button type="button" variant="outline" onClick={onReset} className="h-10 gap-2 rounded-xl">
        <RotateCcw size={14} />
        Descartar
      </Button>
      <Button type="button" onClick={onSave} disabled={loading} className="h-10 gap-2 rounded-xl">
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        {saveLabel}
      </Button>
    </div>
  );
}
