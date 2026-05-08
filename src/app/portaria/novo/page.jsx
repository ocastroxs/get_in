"use client";
import { useState } from "react";
import { ArrowLeft, Check, Camera, User, Building2, MapPin, Phone, Mail, AlertCircle, ChevronRight, Lock, Lightbulb, Tag, Shield } from "lucide-react";
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
    email: "",
    setoresAcesso: [],
    tagRFID: "",
    epiNecessario: []
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
      <div className="px-6 py-6 flex justify-center">
        <div className="flex items-center gap-6 max-w-md">
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
          <div className={`h-1 w-16 rounded-full transition-all duration-500 ${step >= 2 ? "bg-gradient-to-r from-primary to-primary/60" : "bg-muted/40"}`} />

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

      {/* STEP 2: AGUARDANDO AUTORIZAÇÃO (Placeholder) */}
      {step === 2 && (
        <div className="p-8 max-w-4xl mx-auto">
          <div className="bg-card border border-border rounded-3xl p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
              <AlertCircle size={40} className="text-amber-600" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-3">Aguardando Autorização</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              O cadastro foi enviado para análise do supervisor. Você será notificado quando for aprovado ou recusado.
            </p>

            <div className="bg-muted rounded-2xl p-6 mb-8 text-left border border-border">
              <p className="text-sm font-bold text-foreground mb-4">Dados Enviados:</p>
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong className="text-foreground">Nome:</strong> {form.nome}</p>
                <p><strong className="text-foreground">CPF:</strong> {form.cpf}</p>
                <p><strong className="text-foreground">Empresa:</strong> {form.empresa}</p>
                <p><strong className="text-foreground">Setor:</strong> {form.setor}</p>
                {form.setoresAcesso.length > 0 && (
                  <p><strong className="text-foreground">Setores de Acesso:</strong> {form.setoresAcesso.join(", ")}</p>
                )}
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
