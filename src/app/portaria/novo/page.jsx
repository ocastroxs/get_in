"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, Check, Camera, User, Building2, MapPin, Phone, Mail, AlertCircle, ChevronRight, Lock, Lightbulb, Tag, Shield, Clock, Bell, Info, X, PhoneCall, RefreshCw, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NovoCadastroPage() {
  const [step, setStep] = useState(1);
  const [tempoEspera, setTempoEspera] = useState(30);
  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    dataNascimento: "",
    sexo: "",
    empresa: "",
    setor: "",
    motivo: "",
    telefone: "",
    email: "",
    setoresAcesso: [],
    tagRFID: "",
  });

  const [checklist, setChecklist] = useState({
    tipoCartaIdentificacao: false,
    testeCompleto: false,
    documentoCPFRG: false,
    empresaAcessivel: false,
    telefoneContato: false
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
    let timer;
    if (step === 2 && tempoEspera > 0) {
      timer = setInterval(() => {
        setTempoEspera((prev) => prev + 1);
      }, 1000);
    }
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

  const handleCPFChange = (e) => {
    setForm({ ...form, cpf: maskCPF(e.target.value) });
  };

  const toggleSetorAcesso = (setor) => {
    setForm({
      ...form,
      setoresAcesso: form.setoresAcesso.includes(setor)
        ? form.setoresAcesso.filter(s => s !== setor)
        : [...form.setoresAcesso, setor]
    });
  };

  const handleProximoStep = () => {
    if (!form.nome || !form.cpf || !form.empresa) {
      alert("Preencha os campos obrigatórios");
      return;
    }
    setStep(2);
  };

  const handleVoltarStep = () => {
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header com Navegação */}
      <div className="p-6 flex items-center justify-between bg-white border-b border-border/40">
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
                Notificação enviada ao supervisor. Aguarde a confirmação para liberar o crachá.
              </p>
            )}
          </div>
        </div>

        {/* Breadcrumb de Steps - Corrigido para 2 passos */}
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

                  <div className="grid grid-cols-2 gap-4">
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
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2.5">
                        Data de Nascimento
                      </label>
                      <Input
                        type="date"
                        value={form.dataNascimento}
                        onChange={(e) => setForm({ ...form, dataNascimento: e.target.value })}
                        className="h-11 rounded-xl border-border/60 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2.5">
                      Sexo
                    </label>
                    <select
                      value={form.sexo}
                      onChange={(e) => setForm({ ...form, sexo: e.target.value })}
                      className="w-full h-11 px-4 rounded-xl border border-border/60 bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200"
                    >
                      <option value="">Selecione...</option>
                      <option value="M">Masculino</option>
                      <option value="F">Feminino</option>
                      <option value="O">Outro</option>
                    </select>
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
                    <Input
                      type="text"
                      placeholder="Nome da empresa"
                      value={form.empresa}
                      onChange={(e) => setForm({ ...form, empresa: e.target.value })}
                      className="h-11 rounded-xl border-border/60 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2.5">
                        Setor de Destino
                      </label>
                      <select
                        value={form.setor}
                        onChange={(e) => setForm({ ...form, setor: e.target.value })}
                        className="w-full h-11 px-4 rounded-xl border border-border/60 bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200"
                      >
                        <option value="">Selecione...</option>
                        {setoresDisponiveis.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2.5">
                        Motivo da Visita
                      </label>
                      <select
                        value={form.motivo}
                        onChange={(e) => setForm({ ...form, motivo: e.target.value })}
                        className="w-full h-11 px-4 rounded-xl border border-border/60 bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200"
                      >
                        <option value="">Selecione...</option>
                        <option value="Visita">Visita</option>
                        <option value="Entrega">Entrega</option>
                        <option value="Manutenção">Manutenção</option>
                        <option value="Reunião">Reunião</option>
                        <option value="Outro">Outro</option>
                      </select>
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
                      onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                      className="h-11 rounded-xl border-border/60 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200 text-sm"
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
                      {setoresDisponiveis.map(setor => (
                        <label key={setor} className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-muted/50 transition-all duration-200 border border-border/40">
                          <div className={`w-5 h-5 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
                            form.setoresAcesso.includes(setor)
                              ? "bg-primary border-primary shadow-md shadow-primary/30"
                              : "border-border/60"
                          }`}>
                            {form.setoresAcesso.includes(setor) && <Check size={14} className="text-white" />}
                          </div>
                          <span className="text-sm font-medium text-foreground">{setor}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2.5">
                      TAG RFID / Crachá
                    </label>
                    <Input
                      type="text"
                      placeholder="Escanear ou digitar TAG RFID"
                      value={form.tagRFID}
                      onChange={(e) => setForm({ ...form, tagRFID: e.target.value })}
                      className="h-11 rounded-xl border-border/60 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200 text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-2">Escaneie o crachá ou TAG RFID do visitante</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna Direita: Prévia de Crachá + Checklist + Dicas */}
            <div className="lg:col-span-1 space-y-6">
              {/* Prévia de Crachá */}
              <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl transition-shadow duration-300 overflow-hidden relative">
                {/* Efeito de fundo */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10">
                  <div className="text-xs font-bold uppercase tracking-widest mb-5 opacity-90">
                    Prévia de Crachá
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="opacity-80">Nome:</span>
                      <span className="font-bold text-right text-sm">{form.nome || "—"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="opacity-80">Empresa:</span>
                      <span className="font-bold text-right text-xs">{form.empresa || "—"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="opacity-80">Setor:</span>
                      <span className="font-bold text-right text-xs">{form.setor || "—"}</span>
                    </div>
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
                  {[
                    { key: "tipoCartaIdentificacao", label: "Tipo de carta identificação" },
                    { key: "testeCompleto", label: "Teste completo" },
                    { key: "documentoCPFRG", label: "Documento CPF/RG" },
                    { key: "empresaAcessivel", label: "Empresa acessível" },
                    { key: "telefoneContato", label: "Telefone de contato" }
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-3 cursor-pointer group p-2.5 rounded-lg hover:bg-muted/50 transition-all duration-200">
                      <div className={`w-5 h-5 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
                        checklist[key]
                          ? "bg-primary border-primary shadow-md shadow-primary/30"
                          : "border-border/60 group-hover:border-primary/50"
                      }`}>
                        {checklist[key] && <Check size={14} className="text-white" />}
                      </div>
                      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-200">
                        {label}
                      </span>
                    </label>
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
                    <span>Confirme os setores permitidos antes de gerar o crachá</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>Escaneie a TAG RFID para vincular ao cadastro</span>
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
            <Button onClick={handleProximoStep} className="rounded-xl px-6 h-11 font-semibold bg-gradient-to-r from-primary to-primary/90 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 flex items-center gap-2">
              Próximo Passo
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: AGUARDANDO AUTORIZAÇÃO (Novo Layout Baseado na Imagem) */}
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
              A notificação foi enviada para Carlos Mendes via app mobile. O visitante ficará em espera até a confirmação de acesso.
            </p>

            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-xs font-bold border border-amber-100">
                <Clock size={14} />
                Aguardando há {formatTime(tempoEspera)}
              </div>
              
              <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-[10px] font-bold border border-blue-100">
                <Bell size={12} />
                Notificação push enviada às 08:12 - VisitTrack App
              </div>
            </div>
          </div>

          {/* Grid de Informações */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dados do Visitante */}
            <div className="bg-white border border-border rounded-[32px] p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-xl">
                  <User size={18} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Dados do Visitante</h3>
                  <p className="text-[10px] text-muted-foreground">Resumo do cadastro enviado</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { label: "Nome", value: form.nome || "João Carvalho" },
                  { label: "Empresa", value: form.empresa || "TechMaint Serviços" },
                  { label: "Tipo", value: "Técnico / Manutenção" },
                  { label: "CPF", value: form.cpf || "02.345.678-90" },
                  { label: "Período", value: "28 jul - 08:00 - 17:00" },
                  { label: "Crachá", value: form.tagRFID || "TAG-0047" },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center border-b border-border/40 pb-2 last:border-0">
                    <span className="text-[11px] text-muted-foreground font-medium">{item.label}</span>
                    <span className="text-[11px] text-foreground font-bold">{item.value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-1">
                  <span className="text-[11px] text-muted-foreground font-medium">Setores</span>
                  <div className="flex gap-2">
                    <span className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[9px] font-bold border border-amber-100">
                      <div className="w-1 h-1 rounded-full bg-amber-500" /> Produção
                    </span>
                    <span className="flex items-center gap-1 bg-rose-50 text-rose-700 px-2 py-0.5 rounded text-[9px] font-bold border border-rose-100">
                      <div className="w-1 h-1 rounded-full bg-rose-500" /> Manutenção
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status do Processo */}
            <div className="bg-white border border-border rounded-[32px] p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-slate-50 rounded-xl">
                  <Zap size={18} className="text-slate-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Status do Processo</h3>
                  <p className="text-[10px] text-muted-foreground">Acompanhamento em tempo real</p>
                </div>
              </div>

              <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                {[
                  { title: "Visitante cadastrado", time: "08:10 - Rafael Silva (Portaria)", desc: "Dados pessoais e permissões registrados no sistema.", status: "complete" },
                  { title: "Crachá TAG-0047 vinculado", time: "08:11 - Sistema automático", desc: "", status: "complete" },
                  { title: "Notificação enviada ao supervisor", time: "08:12 - Push notification", desc: "Carlos Mendes — Gerente de Produção", status: "complete" },
                  { title: "Aguardando aprovação", time: "Agora - Em andamento...", desc: "", status: "active" },
                  { title: "Crachá ativado e entregue", time: "Pendente", desc: "", status: "pending" },
                ].map((item, i) => (
                  <div key={i} className="relative pl-8">
                    <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center z-10 ${
                      item.status === "complete" ? "bg-emerald-500" : item.status === "active" ? "bg-amber-400" : "bg-slate-200"
                    }`}>
                      {item.status === "complete" && <Check size={10} className="text-white" />}
                    </div>
                    <div>
                      <h4 className={`text-[11px] font-bold ${item.status === "pending" ? "text-muted-foreground" : "text-foreground"}`}>
                        {item.title}
                      </h4>
                      <p className="text-[9px] text-muted-foreground font-medium">{item.time}</p>
                      {item.desc && <p className="text-[9px] text-muted-foreground mt-1 bg-slate-50 p-1.5 rounded-lg border border-slate-100">{item.desc}</p>}
                    </div>
                  </div>
                ))}
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
                  <h3 className="font-bold text-sm text-foreground">Carlos Mendes</h3>
                  <p className="text-[10px] text-muted-foreground">Gerente de Produção - Ramal 214</p>
                </div>
              </div>
              <div className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-[9px] font-bold border border-amber-100">
                Notificado - Aguardando resposta
              </div>
            </div>

            {/* Simulação de Notificação */}
            <div className="bg-[#0F172A] rounded-2xl overflow-hidden border border-slate-800">
              <div className="bg-slate-800/50 px-4 py-2 flex items-center gap-2 border-b border-slate-700">
                <div className="w-4 h-4 bg-blue-500 rounded flex items-center justify-center text-[8px] text-white font-bold">A</div>
                <span className="text-[9px] text-slate-300 font-medium uppercase tracking-wider">VisitTrack App - Simulação da notificação recebida pelo supervisor</span>
              </div>
              <div className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 bg-amber-500/10 rounded-lg">
                    <Bell size={16} className="text-amber-500" />
                  </div>
                  <div>
                    <h4 className="text-white text-xs font-bold mb-1">Nova solicitação de acesso</h4>
                    <p className="text-slate-400 text-[10px] leading-relaxed">
                      O técnico João Carvalho (TechMaint Serviços) chegou na portaria para manutenção. Solicita acesso aos setores Produção e Manutenção das 08h às 17h. Autoriza a entrada?
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold h-9 rounded-xl border-0">
                    <Check size={14} className="mr-1.5" /> Aprovar Acesso
                  </Button>
                  <Button className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-[10px] font-bold h-9 rounded-xl border border-rose-500/20">
                    <X size={14} className="mr-1.5" /> Negar
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6 pt-6 border-t border-border/40">
              <p className="text-[10px] text-muted-foreground font-medium">Não está respondendo? Contate o supervisor:</p>
              <div className="flex gap-2">
                <Button variant="outline" className="h-8 rounded-lg text-[10px] font-bold gap-1.5 border-border/60">
                  <PhoneCall size={12} /> Ligar - Ramal 214
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
              <Button variant="outline" className="h-10 rounded-xl text-[11px] font-bold gap-2 border-amber-200 bg-amber-50 text-amber-700 px-5">
                <AlertCircle size={14} /> Acesso de Emergência
              </Button>
              <Button className="h-10 rounded-xl text-[11px] font-bold gap-2 bg-blue-500 hover:bg-blue-600 text-white px-8 shadow-lg shadow-blue-500/20">
                <RefreshCw size={14} /> Simular Aprovação
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
