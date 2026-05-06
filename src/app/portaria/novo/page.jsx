"use client";
import { useState } from "react";
import { ArrowLeft, Check, Camera, User, Building2, MapPin, Phone, Mail, AlertCircle, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NovoCadastroPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    dataNascimento: "",
    sexo: "",
    empresa: "",
    setor: "",
    motivo: "",
    telefone: "",
    email: ""
  });

  const [checklist, setChecklist] = useState({
    tipoCartaIdentificacao: false,
    testeCompleto: false,
    documentoCPFRG: false,
    empresaAcessivel: false,
    telefoneContato: false
  });

  const maskCPF = (v) =>
    v.replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");

  const handleCPFChange = (e) => {
    setForm({ ...form, cpf: maskCPF(e.target.value) });
  };

  const handleChecklistChange = (key) => {
    setChecklist({ ...checklist, [key]: !checklist[key] });
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
    <div className="min-h-screen">
      {/* Header com Navegação */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/portaria" className="p-2 hover:bg-muted/60 rounded-lg transition-all duration-200 hover:scale-110">
            <ArrowLeft size={20} className="text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">Novo Cadastro de Visitante</h1>
            <p className="text-xs text-muted-foreground mt-1">Passo {step} de 2 — {step === 1 ? "Identificação" : "Autorização"}</p>
          </div>
        </div>
      </div>

      {/* Breadcrumb de Steps - Melhorado */}
      <div className="px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center gap-6">
          {/* Step 1 */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
              step >= 1 
                ? "bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg shadow-primary/30" 
                : "bg-muted/60 text-muted-foreground"
            }`}>
              {step > 1 ? <Check size={20} /> : "1"}
            </div>
            <span className={`text-sm font-semibold transition-colors duration-300 ${step >= 1 ? "text-foreground" : "text-muted-foreground"}`}>
              Identificação
            </span>
          </div>

          {/* Conector */}
          <div className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= 2 ? "bg-gradient-to-r from-primary to-primary/60" : "bg-muted/40"}`} />

          {/* Step 2 */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
              step >= 2 
                ? "bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg shadow-primary/30" 
                : "bg-muted/60 text-muted-foreground"
            }`}>
              2
            </div>
            <span className={`text-sm font-semibold transition-colors duration-300 ${step >= 2 ? "text-foreground" : "text-muted-foreground"}`}>
              Autorização
            </span>
          </div>
        </div>
      </div>

      {/* STEP 1: IDENTIFICAÇÃO DO VISITANTE */}
      {step === 1 && (
        <div className="p-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Coluna Esquerda: Formulário */}
            <div className="lg:col-span-2 space-y-6">
              {/* Seção: Dados Pessoais */}
              <div className="bg-card/40 border border-border/30 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 backdrop-blur-xl">
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
              <div className="bg-card/40 border border-border/30 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 backdrop-blur-xl">
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
                        <option value="Recepção">Recepção</option>
                        <option value="Administrativo">Administrativo</option>
                        <option value="Produção">Produção</option>
                        <option value="Laboratório">Laboratório</option>
                        <option value="Almoxarifado">Almoxarifado</option>
                        <option value="Diretoria">Diretoria</option>
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
              <div className="bg-card/40 border border-border/30 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 backdrop-blur-xl">
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
            </div>

            {/* Coluna Direita: Prévia de Crachá + Checklist */}
            <div className="lg:col-span-1 space-y-6">
              {/* Prévia de Crachá */}
              <div className="bg-gradient-to-br from-blue-600/80 via-blue-700/80 to-blue-900/80 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl transition-shadow duration-300 overflow-hidden relative backdrop-blur-xl">
                {/* Efeito de fundo */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10">
                  <div className="text-xs font-bold uppercase tracking-widest mb-5 opacity-90">
                    Prévia de Crachá
                  </div>

                  <div className="bg-white/15 backdrop-blur-sm rounded-xl p-5 mb-5 text-center border border-white/20">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-300 to-gray-400 rounded-lg mx-auto mb-4 flex items-center justify-center shadow-lg">
                      <Camera size={40} className="text-gray-600" />
                    </div>
                    <p className="text-xs opacity-80 font-medium">Foto não capturada</p>
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
              <div className="bg-card/40 border border-border/30 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 backdrop-blur-xl">
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

              {/* Info Box */}
              <div className="bg-gradient-to-br from-blue-50/60 to-blue-100/40 border border-blue-200/40 rounded-3xl p-4 flex gap-3 backdrop-blur-xl">
                <AlertCircle size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900">
                  <p className="font-bold mb-1">Informações Importantes</p>
                  <p className="opacity-90">Preencha todos os campos obrigatórios antes de prosseguir.</p>
                </div>
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

      {/* STEP 2: AGUARDANDO AUTORIZAÇÃO (Placeholder) */}
      {step === 2 && (
        <div className="p-8 max-w-4xl mx-auto">
          <div className="bg-card/40 border border-border/30 rounded-3xl p-12 text-center shadow-sm backdrop-blur-xl">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
              <AlertCircle size={40} className="text-amber-600" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-3">Aguardando Autorização</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              O cadastro foi enviado para análise do supervisor. Você será notificado quando for aprovado ou recusado.
            </p>

            <div className="bg-muted/20 rounded-2xl p-6 mb-8 text-left border border-border/30 backdrop-blur-lg">
              <p className="text-sm font-bold text-foreground mb-4">Dados Enviados:</p>
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong className="text-foreground">Nome:</strong> {form.nome}</p>
                <p><strong className="text-foreground">CPF:</strong> {form.cpf}</p>
                <p><strong className="text-foreground">Empresa:</strong> {form.empresa}</p>
                <p><strong className="text-foreground">Setor:</strong> {form.setor}</p>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={handleVoltarStep} className="rounded-xl px-6 h-11 font-semibold">
                ← Voltar
              </Button>
              <Link href="/portaria">
                <Button className="rounded-xl px-6 h-11 font-semibold bg-gradient-to-r from-primary to-primary/90">
                  Voltar para Operação
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
