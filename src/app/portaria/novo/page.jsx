"use client";
import { useState } from "react";
import { ArrowLeft, Check, Upload, Camera, User, Building2, MapPin, Phone, Calendar, FileText, AlertCircle } from "lucide-react";
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
    <div className="min-h-screen bg-background">
      {/* Header com Navegação */}
      <div className="border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/portaria" className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Novo Cadastro</h1>
            <p className="text-xs text-muted-foreground">Passo {step} de 2</p>
          </div>
        </div>
      </div>

      {/* Breadcrumb de Steps */}
      <div className="border-b border-border px-6 py-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${step >= 1 ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
            1
          </div>
          <span className={`text-sm font-medium ${step >= 1 ? "text-foreground" : "text-muted-foreground"}`}>
            Identificação
          </span>
        </div>

        <div className={`h-0.5 flex-1 ${step >= 2 ? "bg-primary" : "bg-muted"}`} />

        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${step >= 2 ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
            2
          </div>
          <span className={`text-sm font-medium ${step >= 2 ? "text-foreground" : "text-muted-foreground"}`}>
            Autorização
          </span>
        </div>
      </div>

      {/* STEP 1: IDENTIFICAÇÃO DO VISITANTE */}
      {step === 1 && (
        <div className="p-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna Esquerda: Formulário */}
            <div className="lg:col-span-2 space-y-6">
              {/* Seção: Dados Pessoais */}
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <User size={18} className="text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Dados Pessoais</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                      Nome Completo *
                    </label>
                    <Input
                      type="text"
                      placeholder="Digite o nome completo"
                      value={form.nome}
                      onChange={(e) => setForm({ ...form, nome: e.target.value })}
                      className="h-10"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                        CPF *
                      </label>
                      <Input
                        type="text"
                        placeholder="000.000.000-00"
                        value={form.cpf}
                        onChange={handleCPFChange}
                        className="h-10"
                        maxLength="14"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                        Data de Nascimento
                      </label>
                      <Input
                        type="date"
                        value={form.dataNascimento}
                        onChange={(e) => setForm({ ...form, dataNascimento: e.target.value })}
                        className="h-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                      Sexo
                    </label>
                    <select
                      value={form.sexo}
                      onChange={(e) => setForm({ ...form, sexo: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
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
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 size={18} className="text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Dados da Empresa</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                      Empresa *
                    </label>
                    <Input
                      type="text"
                      placeholder="Nome da empresa"
                      value={form.empresa}
                      onChange={(e) => setForm({ ...form, empresa: e.target.value })}
                      className="h-10"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                      Setor de Destino
                    </label>
                    <select
                      value={form.setor}
                      onChange={(e) => setForm({ ...form, setor: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
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
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                      Motivo da Visita
                    </label>
                    <select
                      value={form.motivo}
                      onChange={(e) => setForm({ ...form, motivo: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
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

              {/* Seção: Contato */}
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Phone size={18} className="text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Contato</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                      Telefone
                    </label>
                    <Input
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={form.telefone}
                      onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                      className="h-10"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                      E-mail
                    </label>
                    <Input
                      type="email"
                      placeholder="email@exemplo.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="h-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna Direita: Prévia de Crachá + Checklist */}
            <div className="lg:col-span-1 space-y-6">
              {/* Prévia de Crachá */}
              <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl p-6 text-white shadow-lg">
                <div className="text-xs font-semibold uppercase tracking-wider mb-4 opacity-80">
                  Prévia de Crachá
                </div>

                <div className="bg-white/10 rounded-lg p-4 mb-4 text-center">
                  <div className="w-20 h-20 bg-gray-400 rounded-lg mx-auto mb-3 flex items-center justify-center">
                    <Camera size={32} className="text-gray-600" />
                  </div>
                  <p className="text-xs opacity-75">Foto não capturada</p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="opacity-75">Nome:</span>
                    <span className="font-semibold">{form.nome || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-75">Empresa:</span>
                    <span className="font-semibold text-xs">{form.empresa || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-75">Setor:</span>
                    <span className="font-semibold text-xs">{form.setor || "—"}</span>
                  </div>
                </div>
              </div>

              {/* Checklist de Requisitos */}
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Check size={18} className="text-primary" />
                  <h3 className="font-semibold text-foreground">Checklist de Requisitos</h3>
                </div>

                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      checked={checklist.tipoCartaIdentificacao}
                      onChange={() => handleChecklistChange("tipoCartaIdentificacao")}
                      className="mt-1 w-4 h-4 rounded border-border"
                    />
                    <span className="text-sm text-foreground">Tipo de carta identificação</span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      checked={checklist.testeCompleto}
                      onChange={() => handleChecklistChange("testeCompleto")}
                      className="mt-1 w-4 h-4 rounded border-border"
                    />
                    <span className="text-sm text-foreground">Teste completo</span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      checked={checklist.documentoCPFRG}
                      onChange={() => handleChecklistChange("documentoCPFRG")}
                      className="mt-1 w-4 h-4 rounded border-border"
                    />
                    <span className="text-sm text-foreground">Documento CPF/RG</span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      checked={checklist.empresaAcessivel}
                      onChange={() => handleChecklistChange("empresaAcessivel")}
                      className="mt-1 w-4 h-4 rounded border-border"
                    />
                    <span className="text-sm text-foreground">Empresa acessível</span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      checked={checklist.telefoneContato}
                      onChange={() => handleChecklistChange("telefoneContato")}
                      className="mt-1 w-4 h-4 rounded border-border"
                    />
                    <span className="text-sm text-foreground">Telefone de contato</span>
                  </label>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                <AlertCircle size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-800">
                  <p className="font-semibold mb-1">Informações Importantes</p>
                  <p>Preencha todos os campos obrigatórios antes de prosseguir para a próxima etapa.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-border">
            <Link href="/portaria">
              <Button variant="outline">Cancelar</Button>
            </Link>
            <Button onClick={handleProximoStep} className="bg-primary hover:bg-primary/90">
              Próximo Passo →
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: AGUARDANDO AUTORIZAÇÃO (Placeholder) */}
      {step === 2 && (
        <div className="p-6 max-w-4xl mx-auto">
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} className="text-amber-600" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">Aguardando Autorização</h2>
            <p className="text-muted-foreground mb-6">
              O cadastro foi enviado para análise do supervisor. Você será notificado quando for aprovado ou recusado.
            </p>

            <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm font-semibold text-foreground mb-2">Dados Enviados:</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Nome:</strong> {form.nome}</p>
                <p><strong>CPF:</strong> {form.cpf}</p>
                <p><strong>Empresa:</strong> {form.empresa}</p>
                <p><strong>Setor:</strong> {form.setor}</p>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={handleVoltarStep}>
                ← Voltar
              </Button>
              <Link href="/portaria">
                <Button>Voltar para Operação</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
