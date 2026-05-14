"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, Check, Camera, User, Building2, MapPin, Phone, Mail, AlertCircle, ChevronRight, ChevronDown, Lock, Lightbulb, Shield, Clock, Bell, Info, X, PhoneCall, RefreshCw, Zap, Circle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/AuthContext";
import { api } from "@/services/api";
import UserAvatar from "@/components/ui/UserAvatar";

const motivoOptions = [
  { value: "Visita", label: "Visita" },
  { value: "Entrega", label: "Entrega" },
  { value: "Manutenção", label: "Manutenção" },
  { value: "Reunião", label: "Reunião" },
  { value: "Outro", label: "Outro" },
];

const empresaOptions = [
  { value: "Nutrilab", label: "Nutrilab" },
  { value: "FiltraTec", label: "FiltraTec" },
  { value: "ConsTech", label: "ConsTech" },
  { value: "LogiMax", label: "LogiMax" },
  { value: "TechFix Ltda", label: "TechFix Ltda" },
  { value: "SupriTec", label: "SupriTec" },
];

function PrettySelect({ value, onChange, placeholder, options, Icon = Info }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value);

  return (
    <div
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsOpen(false);
        }
      }}
    >
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className={`group flex h-11 w-full items-center gap-3 rounded-xl border bg-card px-3 text-left text-sm shadow-xs transition-all duration-200 ${
          isOpen
            ? "border-primary/50 ring-3 ring-primary/15 shadow-md"
            : "border-border/60 hover:border-primary/30 hover:bg-accent/50"
        }`}
      >
        <span className={`flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors duration-200 ${
          selectedOption || isOpen
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground"
        }`}>
          <Icon size={15} />
        </span>
        <span className={`min-w-0 flex-1 truncate font-medium ${
          selectedOption ? "text-foreground" : "text-muted-foreground"
        }`}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180 text-primary" : "group-hover:text-primary"
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-border/60 bg-popover p-1.5 text-popover-foreground shadow-[0_18px_45px_rgba(15,58,125,0.14)]"
        >
          <button
            type="button"
            role="option"
            aria-selected={!value}
            onClick={() => {
              onChange("");
              setIsOpen(false);
            }}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all duration-150 ${
              !value ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
            }`}
          >
            <span className="size-2 rounded-full bg-border" />
            <span className="flex-1 truncate font-medium">{placeholder}</span>
          </button>

          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all duration-150 ${
                  isSelected
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted/70"
                }`}
              >
                <span className={`flex size-5 shrink-0 items-center justify-center rounded-full border transition-all duration-150 ${
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background"
                }`}>
                  {isSelected && <Check size={12} />}
                </span>
                <span className="min-w-0 flex-1 truncate font-semibold">{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function NovoCadastroPage() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [tempoEspera, setTempoEspera] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    empresa: "",
    setor: "",
    motivo: "",
    telefone: "",
    email: "",
    setoresAcesso: [],
  });

  const setoresDisponiveis = [
    "Produção",
    "Almoxarifado",
    "Administrativo",
    "Laboratório",
    "Diretoria",
    "Recepção"
  ];

  useEffect(() => {
    if (step !== 2) {
      return undefined;
    }

    const timer = setInterval(() => {
      setTempoEspera((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [step]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const maskCPF = (v) =>
    v.replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");

  const maskPhone = (v) =>
    v.replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4,5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");

  const handleCPFChange = (e) => {
    setForm({ ...form, cpf: maskCPF(e.target.value) });
  };

  const handlePhoneChange = (e) => {
    setForm({ ...form, telefone: maskPhone(e.target.value) });
  };

  const toggleSetorAcesso = (setor) => {
    setForm((prev) => ({
      ...prev,
      setoresAcesso: prev.setoresAcesso.includes(setor)
        ? prev.setoresAcesso.filter((s) => s !== setor)
        : [...prev.setoresAcesso, setor]
    }));
  };

  const handleProximoStep = async () => {
    if (!form.nome || !form.cpf || !form.empresa) {
      alert("Preencha os campos obrigatórios");
      return;
    }
    
    if (!user || !user.id) {
      alert("Erro: Usuário não autenticado");
      return;
    }
    
    setLoading(true);
    try {
      const payload = {
        idUsuario: user.id,
        idDepartamento: user.idDepartamento || 1,
        motivo: form.motivo || "Visita",
        validade: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        descricao: `Visitante: ${form.nome} | CPF: ${form.cpf} | Empresa: ${form.empresa}`,
        empresa: form.empresa
      };
      
      const response = await api.post('/requisicao-visitante', payload);
      
      if (response.sucesso) {
        setStep(2);
        setTempoEspera(0);
      } else {
        alert(response.mensagem || "Erro ao registrar visitante");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleVoltarStep = () => {
    setStep(1);
  };

  const cpfCompleto = form.cpf.replace(/\D/g, "").length === 11;
  const telefoneCompleto = form.telefone.replace(/\D/g, "").length >= 10;
  const requisitos = [
    { key: "tipoIdentificacao", label: "Identificação do visitante", completed: Boolean(form.nome.trim()) },
    {
      key: "cadastroCompleto",
      label: "Cadastro completo",
      completed: Boolean(form.nome.trim() && cpfCompleto && form.empresa && form.motivo && telefoneCompleto)
    },
    { key: "documentoCPFRG", label: "Documento CPF/RG", completed: cpfCompleto },
    { key: "empresaAcessivel", label: "Empresa acessível", completed: Boolean(form.empresa) },
    { key: "telefoneContato", label: "Telefone de contato", completed: telefoneCompleto }
  ];

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header com Navegação */}
      <div className="p-6 flex items-center justify-between border-b border-white/40  backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <Link href="/portaria" className="p-2 hover:bg-muted/60 rounded-lg transition-all duration-200 hover:scale-110">
            <ArrowLeft size={20} className="text-muted-foreground" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">
              <span>Dashboard</span>
              <ChevronRight size={10} />
              <span>Visitantes</span>
              <ChevronRight size={10} />
              <span className="text-primary">Novo Cadastro</span>
            </div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">
              {step === 1 ? "Novo Cadastro de Visitante" : "Aguardando Aprovação"}
            </h1>
            {step === 2 && (
              <p className="text-sm text-muted-foreground mt-1">
                Notificação enviada ao supervisor. Aguarde a confirmação para liberar o acesso.
              </p>
            )}
          </div>
        </div>

        {/* Breadcrumb de Steps - 2 passos */}
        <div className="flex items-center gap-4 bg-muted/30 p-1.5 rounded-full border border-border/40">
          {[
            { id: 1, label: "Identificação" },
            { id: 2, label: "Autorização" }
          ].map((s) => (
            <div key={s.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === s.id
                  ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30"
                  : step > s.id
                    ? "bg-emerald-500 text-white"
                    : "bg-white text-muted-foreground border border-border"
              }`}>
                {step > s.id ? <Check size={12} /> : s.id}
              </div>
              <span className={`text-[11px] font-bold ${
                step === s.id
                  ? "text-foreground"
                  : step > s.id
                    ? "text-emerald-600"
                    : "text-muted-foreground"
              }`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: IDENTIFICAÇÃO DO VISITANTE */}
      {step === 1 && (
        <div className="p-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Coluna Esquerda: Formulário */}
            <div className="lg:col-span-2 space-y-6">
              {/* Seção: Dados Pessoais */}
              <div className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/40">
                  <div className="p-2.5 bg-primary/10 rounded-xl">
                    <User size={20} className="text-primary" />
                  </div>
                  <h2 className="text-lg font-bold text-foreground">Dados Pessoais</h2>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2.5">
                      Nome Completo <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="Digite o nome completo"
                      value={form.nome}
                      onChange={(e) => setForm({ ...form, nome: e.target.value })}
                      className="h-11 rounded-xl border-border/60 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2.5">
                      CPF <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="000.000.000-00"
                      value={form.cpf}
                      onChange={handleCPFChange}
                      className="h-11 rounded-xl border-border/60 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200 text-sm"
                      maxLength="14"
                    />
                  </div>

                </div>
              </div>

              {/* Seção: Dados da Empresa */}
              <div className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/40">
                  <div className="p-2.5 bg-primary/10 rounded-xl">
                    <Building2 size={20} className="text-primary" />
                  </div>
                  <h2 className="text-lg font-bold text-foreground">Dados da Empresa</h2>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2.5">
                      Empresa <span className="text-red-500">*</span>
                    </label>
                    <PrettySelect
                      value={form.empresa}
                      onChange={(empresa) => setForm({ ...form, empresa })}
                      placeholder="Selecione a empresa..."
                      options={empresaOptions}
                      Icon={Building2}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2.5">
                        Setor de Destino
                      </label>
                      <PrettySelect
                        value={form.setor}
                        onChange={(setor) => setForm({ ...form, setor })}
                        placeholder="Selecione..."
                        options={setoresDisponiveis.map((setor) => ({ value: setor, label: setor }))}
                        Icon={MapPin}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2.5">
                        Motivo da Visita
                      </label>
                      <PrettySelect
                        value={form.motivo}
                        onChange={(motivo) => setForm({ ...form, motivo })}
                        placeholder="Selecione..."
                        options={motivoOptions}
                        Icon={Info}
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* Seção: Contato */}
              <div className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/40">
                  <div className="p-2.5 bg-primary/10 rounded-xl">
                    <Phone size={20} className="text-primary" />
                  </div>
                  <h2 className="text-lg font-bold text-foreground">Contato</h2>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2.5">
                      Telefone
                    </label>
                    <Input
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={form.telefone}
                      onChange={handlePhoneChange}
                      className="h-11 rounded-xl border-border/60 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200 text-sm"
                      maxLength="15"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2.5">
                      E-mail
                    </label>
                    <Input
                      type="email"
                      placeholder="email@exemplo.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="h-11 rounded-xl border-border/60 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Seção: Permissões de Acesso */}
              <div className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/40">
                  <div className="p-2.5 bg-primary/10 rounded-xl">
                    <Lock size={20} className="text-primary" />
                  </div>
                  <h2 className="text-lg font-bold text-foreground">Permissões de Acesso</h2>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-3">
                      Setores Permitidos
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {setoresDisponiveis.map((setor, index) => {
                        const isSelected = form.setoresAcesso.includes(setor);

                        return (
                          <label
                            key={setor}
                            htmlFor={`setor-acesso-${index}`}
                            className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all duration-200 border ${
                              isSelected
                                ? "bg-primary/5 border-primary/30 shadow-sm"
                                : "border-border/40 hover:bg-muted/50"
                            }`}
                          >
                            <input
                              id={`setor-acesso-${index}`}
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSetorAcesso(setor)}
                              className="sr-only"
                            />
                            <div className={`w-5 h-5 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
                              isSelected
                                ? "bg-primary border-primary shadow-md shadow-primary/30"
                                : "border-border/60"
                            }`}>
                              {isSelected && <Check size={14} className="text-white" />}
                            </div>
                            <span className="text-sm font-medium text-foreground">{setor}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Coluna Direita: Prévia do visitante + Checklist + Dicas */}
            <div className="lg:col-span-1 space-y-6">
              {/* Prévia do visitante - Design Profissional */}
              <div className="relative group">
                {/* Cartão Principal do Visitante */}
                <div className="bg-card rounded-3xl p-6 text-card-foreground shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden relative border border-border h-full flex flex-col">
                  <div className="relative z-10 flex flex-col h-full">
                    {/* Header com Status */}
                    <div className="flex items-start justify-between mb-5 pb-4 border-b border-border/60">
                      <div className="flex-1">
                        <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary/80 mb-1">
                          Visitante
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                          Prévia do Visitante
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
                        <Circle size={6} className="fill-emerald-500 text-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-bold text-emerald-700">Ativo</span>
                      </div>
                    </div>

                    {/* Avatar + Informações Principais */}
                    <div className="flex gap-4 mb-5">
                      <div className="flex-shrink-0">
                        <UserAvatar name={form.nome} email="" className="w-14 h-14 text-lg shadow-sm border-2 border-background ring-1 ring-border" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-foreground truncate mb-1">
                          {form.nome || "Nome do Visitante"}
                        </div>
                        <div className="text-xs text-muted-foreground truncate mb-2">
                          {form.empresa || "Empresa"}
                        </div>
                      </div>
                    </div>

                    {/* Setor de Destino */}
                    {form.setor && (
                      <div className="mb-4 pb-4 border-b border-border/60">
                        <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">
                          Setor de Destino
                        </div>
                        <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/15 rounded-full px-3 py-1.5">
                          <div className="w-2 h-2 rounded-full bg-primary/70"></div>
                          <span className="text-xs font-bold text-primary">{form.setor}</span>
                        </div>
                      </div>
                    )}

                    {/* Setores de Acesso */}
                    {form.setoresAcesso.length > 0 && (
                      <div className="mb-4 pb-4 border-b border-border/60">
                        <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">
                          Acesso Permitido
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {form.setoresAcesso.map((setor, idx) => (
                            <div key={idx} className="inline-flex items-center gap-1 bg-muted/50 border border-border/60 rounded-full px-2 py-0.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
                              <span className="text-[9px] font-semibold text-foreground/75">{setor}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Rodapé com QR Code Simulado */}
                    <div className="mt-auto pt-3 border-t border-border/60">
                      <div className="flex items-center justify-between">
                        <div className="text-[8px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                          CPF: {form.cpf || "—"}
                        </div>
                        {/* QR Code Simulado */}
                        <div className="w-10 h-10 bg-background border border-border rounded-lg flex items-center justify-center shadow-xs">
                          <div className="w-6 h-6 grid grid-cols-3 gap-0.5">
                            {[...Array(9)].map((_, i) => (
                              <div key={i} className={`rounded-sm ${
                                [0, 2, 4, 6, 8].includes(i) ? "bg-foreground/55" : "bg-muted"
                              }`}></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4">
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground"></span>
                    <span className="rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[10px] font-bold text-primary">
                      Pronto para envio
                    </span>
                  </div>
                </div>
              </div>

              {/* Checklist de Requisitos */}
              <div className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border/40">
                  <div className="p-2.5 bg-primary/10 rounded-xl">
                    <Check size={20} className="text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground">Requisitos</h3>
                </div>

                <div className="space-y-3">
                  {requisitos.map(({ key, label, completed }) => (
                    <div
                      key={key}
                      className={`flex items-center gap-3 p-2.5 rounded-lg transition-all duration-200 ${
                        completed ? "bg-primary/5" : "bg-transparent"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
                        completed
                          ? "bg-primary border-primary shadow-md shadow-primary/30"
                          : "border-border/60"
                      }`}>
                        {completed && <Check size={14} className="text-white" />}
                      </div>
                      <span className={`text-sm font-medium transition-colors duration-200 ${
                        completed ? "text-primary" : "text-foreground"
                      }`}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dicas de Cadastro */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200 rounded-3xl p-5 shadow-sm">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
                    <Lightbulb size={18} className="text-amber-600" />
                  </div>
                  <h3 className="font-bold text-amber-900 text-sm">Dicas de Cadastro</h3>
                </div>

                <ul className="space-y-2.5 text-xs text-amber-900/80">
                  <li className="flex gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>Verifique se o visitante possui documento de identificação válido</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>Confirme os setores permitidos antes de enviar a solicitação</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>Confira empresa, telefone e motivo antes de avançar</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3 justify-end mt-10 pt-8 border-t border-border/40">
            <Link href="/portaria">
              <Button variant="outline" className="rounded-xl px-6 h-11 font-semibold">
                Cancelar
              </Button>
            </Link>
            <Button onClick={handleProximoStep} disabled={loading} className="rounded-xl px-6 h-11 font-semibold bg-gradient-to-r from-primary to-primary/90 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 flex items-center gap-2">
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  Próximo Passo
                  <ChevronRight size={16} />
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: AGUARDANDO AUTORIZAÇÃO */}
      {step === 2 && (
        <div className="p-8 max-w-5xl mx-auto space-y-6">
          {/* Card Central de Status */}
          <div className="bg-white border border-border rounded-[32px] p-10 text-center shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-amber-400" />
            
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-amber-100">
              <Shield size={32} className="text-amber-500" />
            </div>
            
            <h2 className="text-2xl font-black text-foreground mb-2 tracking-tight">
              Aguardando aprovação do supervisor
            </h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-8">
              A notificação foi enviada via app mobile. O visitante ficará em espera até a confirmação de acesso.
            </p>

            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-xs font-bold border border-amber-100">
                <Clock size={14} />
                Aguardando há {formatTime(tempoEspera)}
              </div>
              
              <div className="flex items-center gap-2 bg-primary/5 text-primary px-4 py-2 rounded-full text-[10px] font-bold border border-primary/10">
                <Bell size={12} />
                Notificação push enviada às 08:12 - VisitTrack App
              </div>
            </div>
          </div>

          {/* Dados do Visitante - Ocupando largura total após remoção da timeline */}
          <div className="bg-white border border-border rounded-[32px] p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-blue-50 rounded-xl">
                <User size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">Dados do Visitante</h3>
                <p className="text-xs text-muted-foreground">Resumo do cadastro enviado</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {[
                { label: "Nome", value: form.nome || "—" },
                { label: "Empresa", value: form.empresa || "—" },
                { label: "Tipo", value: form.motivo || "—" },
                { label: "CPF", value: form.cpf || "—" },
                { label: "Período", value: "Acesso imediato" },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center border-b border-border/40 pb-3">
                  <span className="text-xs text-muted-foreground font-medium">{item.label}</span>
                  <span className="text-xs text-foreground font-bold">{item.value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-1 md:col-span-2">
                <span className="text-xs text-muted-foreground font-medium">Setores de Acesso</span>
                <div className="flex gap-2">
                  {form.setoresAcesso.length > 0 ? (
                    form.setoresAcesso.map((setor, idx) => (
                      <span key={idx} className="flex items-center gap-1 bg-primary/5 text-primary px-3 py-1 rounded-full text-[10px] font-bold border border-primary/10">
                        <div className="w-1 h-1 rounded-full bg-primary" /> {setor}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground italic">Nenhum setor selecionado</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Seção do Supervisor */}
          <div className="bg-white border border-border rounded-[32px] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  CM
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Supervisor</h3>
                  <p className="text-[10px] text-muted-foreground">Gerente de Produção</p>
                </div>
              </div>
              <div className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-[9px] font-bold border border-amber-100">
                Notificado - Aguardando resposta
              </div>
            </div>

            

            <div className="flex items-center justify-between mt-6 pt-6 border-t border-border/40">
              <p className="text-[10px] text-muted-foreground font-medium">Não está respondendo? Contate o supervisor:</p>
              <div className="flex gap-2">
                <Button variant="outline" className="h-8 rounded-lg text-[10px] font-bold gap-1.5 border-border/60">
                  <PhoneCall size={12} /> Ligar
                </Button>
                <Button variant="outline" className="h-8 rounded-lg text-[10px] font-bold gap-1.5 border-border/60">
                  <RefreshCw size={12} /> Reenviar Notificação
                </Button>
              </div>
            </div>
          </div>

          {/* Footer de Ações */}
          <div className="flex items-center justify-between bg-white border border-border rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
              <RefreshCw size={12} className="animate-spin text-primary" />
              Atualizado automaticamente a cada 10 segundos
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleVoltarStep} className="h-10 rounded-xl text-[11px] font-bold gap-2 border-border/60 px-5">
                <X size={14} /> Cancelar Cadastro
              </Button>
              <Button className="h-10 rounded-xl text-[11px] font-bold gap-2 bg-blue-500 hover:bg-blue-600 text-white px-8 shadow-lg shadow-blue-500/20">
                <RefreshCw size={14} /> Voltar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
