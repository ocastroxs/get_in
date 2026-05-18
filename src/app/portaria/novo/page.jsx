import { useState, useEffect } from "react";
import { ArrowLeft, Check, User, Building2, MapPin, Phone, ChevronRight, ChevronDown, Lock, Lightbulb, Shield, Clock, Bell, Info, X, RefreshCw, Circle } from "lucide-react";
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

const setoresPadrao = [
  "Produção",
  "Almoxarifado",
  "Administrativo",
  "Laboratório",
  "Diretoria",
  "Recepção"
];

function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function getEmpresaNome(registro) {
  return String(
    registro?.empresa ||
      registro?.empresa_visitante ||
      registro?.usuario?.empresa ||
      registro?.usuario?.empresas?.nome ||
      registro?.empresas?.nome ||
      registro?.empresa_nome ||
      registro?.nomeFantasia ||
      registro?.razaoSocial ||
      registro?.razao_social ||
      registro?.nome ||
      ""
  ).trim();
}

function getEmpresaNomeFromRegistro(registro) {
  return String(
    registro?.empresa ||
      registro?.empresa_visitante ||
      registro?.usuario?.empresa ||
      registro?.usuario?.empresas?.nome ||
      registro?.empresas?.nome ||
      registro?.empresa_nome ||
      registro?.nomeFantasia ||
      registro?.razaoSocial ||
      registro?.razao_social ||
      ""
  ).trim();
}

function buildEmpresasOptions(registros) {
  const empresasUnicas = new Map();

  registros.forEach((registro) => {
    const nome = getEmpresaNomeFromRegistro(registro);

    if (nome) {
      empresasUnicas.set(nome.toLowerCase(), { nome });
    }
  });

  return Array.from(empresasUnicas.values()).sort((a, b) => a.nome.localeCompare(b.nome));
}

function SelectField({ value, onChange, placeholder, options, Icon, loading, emptyLabel }) {
  const hasOptions = options.length > 0;
  const hasSelectedValue = options.some((option) => option.value === value);
  const placeholderText = loading ? "Carregando..." : hasOptions ? placeholder : emptyLabel;

  return (
    <div className="relative">
      <Icon
        size={15}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
      <select
        value={hasSelectedValue ? value : ""}
        onChange={(event) => onChange(event.target.value)}
        disabled={loading || !hasOptions}
        className="h-10 w-full appearance-none rounded-lg border border-border bg-background py-2 pl-9 pr-9 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <option value="">{placeholderText}</option>
        {options.map((option) => (
          <option key={`${option.value}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  );
}

export default function NovoCadastroPage() {
  const { user, funcionario } = useAuth();
  const [step, setStep] = useState(1);
  const [tempoEspera, setTempoEspera] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingEmpresas, setLoadingEmpresas] = useState(true);
  const [empresas, setEmpresas] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
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

  const setoresDisponiveis = departamentos.length > 0
    ? departamentos.map((departamento) => departamento.nome).filter(Boolean)
    : setoresPadrao;

  const empresaOptions = empresas
    .map((empresa) => {
      const label = getEmpresaNome(empresa);

      return label ? { value: label, label } : null;
    })
    .filter(Boolean);

  useEffect(() => {
    async function fetchEmpresas() {
      setLoadingEmpresas(true);

      try {
        const response = await api.get("/empresas");

        if (response.sucesso && Array.isArray(response.data) && response.data.length > 0) {
          setEmpresas(response.data);
          return;
        }

        const [usuariosResponse, requisicoesResponse] = await Promise.all([
          api.get("/user"),
          api.get("/requisicao-visitante"),
        ]);

        const usuarios = usuariosResponse.sucesso && Array.isArray(usuariosResponse.data)
          ? usuariosResponse.data
          : [];
        const requisicoes = requisicoesResponse.sucesso && Array.isArray(requisicoesResponse.data)
          ? requisicoesResponse.data
          : [];

        setEmpresas(buildEmpresasOptions([...usuarios, ...requisicoes]));
      } catch (error) {
        console.error("Erro ao carregar empresas:", error);
        setEmpresas([]);
      } finally {
        setLoadingEmpresas(false);
      }
    }

    fetchEmpresas();
  }, []);

  useEffect(() => {
    async function fetchDepartamentos() {
      try {
        const response = await api.get("/dep");

        if (response.sucesso && Array.isArray(response.data)) {
          setDepartamentos(response.data);
        }
      } catch (error) {
        console.error("Erro ao carregar departamentos:", error);
      }
    }

    fetchDepartamentos();
  }, []);

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

  const getDepartamentoId = () => {
    const departamentoSelecionado = departamentos.find((departamento) => departamento.nome === form.setor);

    return Number(
      departamentoSelecionado?.id ||
        funcionario?.idDepartamento ||
        funcionario?.idSetor ||
        user?.idDepartamento ||
        user?.idSetor ||
        user?.idDep ||
        user?.funcionario?.idDepartamento ||
        user?.funcionario?.idSetor ||
        1
    );
  };

  const getOrCreateVisitanteUsuario = async () => {
    const cpfLimpo = onlyDigits(form.cpf);
    const email = form.email.trim().toLowerCase();
    const usuarioPayload = {
      nome: form.nome.trim(),
      cpf: form.cpf,
      cel: form.telefone,
      celular: form.telefone,
      email,
      empresa: form.empresa
    };

    const usuariosResponse = await api.get("/user");

    if (usuariosResponse.sucesso && Array.isArray(usuariosResponse.data)) {
      const usuarioExistente = usuariosResponse.data.find((usuario) => onlyDigits(usuario.cpf) === cpfLimpo);

      if (usuarioExistente) {
        const updateResponse = await api.put(`/user/${usuarioExistente.id}`, usuarioPayload);
        return updateResponse.sucesso
          ? updateResponse.data || { ...usuarioExistente, ...usuarioPayload, celular: form.telefone }
          : usuarioExistente;
      }
    }

    const createResponse = await api.post("/user", usuarioPayload);

    if (createResponse.sucesso && createResponse.data) {
      return createResponse.data;
    }

    throw new Error(createResponse.mensagem || "Erro ao cadastrar dados do visitante.");
  };

  const handleProximoStep = async () => {
    const cpfCompletoForm = onlyDigits(form.cpf).length === 11;
    const telefoneCompletoForm = onlyDigits(form.telefone).length >= 10;
    const emailValidoForm = isValidEmail(form.email);

    if (!form.nome.trim() || !cpfCompletoForm || !form.empresa || !telefoneCompletoForm || !emailValidoForm) {
      alert("Preencha nome, CPF, empresa, telefone e e-mail validos.");
      return;
    }
    
    if (!user || !user.id) {
      alert("Erro: Usuário não autenticado");
      return;
    }
    
    setLoading(true);
    try {
      const visitanteUsuario = await getOrCreateVisitanteUsuario();
      const idDepartamento = getDepartamentoId();
      const setoresPermitidos = form.setoresAcesso.length > 0 ? form.setoresAcesso.join(", ") : "Nenhum";
      const descricao = [
        `Visitante: ${form.nome.trim()}`,
        `CPF: ${form.cpf}`,
        `Telefone: ${form.telefone}`,
        `Email: ${form.email.trim().toLowerCase()}`,
        `Empresa: ${form.empresa}`,
        `Setor: ${form.setor || "Nao informado"}`,
        `Setores permitidos: ${setoresPermitidos}`
      ].join(" | ");

      const payload = {
        idUsuario: visitanteUsuario.id,
        idDepartamento,
        idSetor: idDepartamento,
        motivo: form.motivo || "Visita",
        validade: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        descricao,
        empresa: form.empresa,
        telefone: form.telefone,
        email: form.email.trim().toLowerCase(),
        setoresAcesso: form.setoresAcesso
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
      alert(error.message || "Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleVoltarStep = () => {
    setStep(1);
  };

  const cpfCompleto = form.cpf.replace(/\D/g, "").length === 11;
  const telefoneCompleto = form.telefone.replace(/\D/g, "").length >= 10;
  const emailValido = isValidEmail(form.email);
  const requisitos = [
    { key: "tipoIdentificacao", label: "Identificação do visitante", completed: Boolean(form.nome.trim()) },
    {
      key: "cadastroCompleto",
      label: "Cadastro completo",
      completed: Boolean(form.nome.trim() && cpfCompleto && form.empresa && form.motivo && telefoneCompleto && emailValido)
    },
    { key: "documentoCPFRG", label: "Documento CPF/RG", completed: cpfCompleto },
    { key: "empresaAcessivel", label: "Empresa acessível", completed: Boolean(form.empresa) },
    { key: "telefoneContato", label: "Telefone de contato", completed: telefoneCompleto },
    { key: "emailContato", label: "E-mail de contato", completed: emailValido }
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
                    <SelectField
                      value={form.empresa}
                      onChange={(empresa) => setForm({ ...form, empresa })}
                      placeholder="Selecione a empresa"
                      emptyLabel="Nenhuma empresa cadastrada"
                      options={empresaOptions}
                      Icon={Building2}
                      loading={loadingEmpresas}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2.5">
                        Setor de Destino
                      </label>
                      <SelectField
                        value={form.setor}
                        onChange={(setor) => setForm({ ...form, setor })}
                        placeholder="Selecione o setor"
                        emptyLabel="Nenhum setor disponível"
                        options={setoresDisponiveis.map((setor) => ({ value: setor, label: setor }))}
                        Icon={MapPin}
                        loading={false}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2.5">
                        Motivo da Visita
                      </label>
                      <SelectField
                        value={form.motivo}
                        onChange={(motivo) => setForm({ ...form, motivo })}
                        placeholder="Selecione o motivo"
                        emptyLabel="Nenhum motivo disponível"
                        options={motivoOptions}
                        Icon={Info}
                        loading={false}
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
                      Telefone <span className="text-red-500">*</span>
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
                      E-mail <span className="text-red-500">*</span>
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

          {/* Dados do Visitante */}
          <div className="bg-white border border-border rounded-[32px] p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-blue-50 rounded-xl">
                <User size={20} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Informações do Visitante</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Nome</p>
                <p className="text-sm font-semibold text-foreground">{form.nome}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">CPF</p>
                <p className="text-sm font-semibold text-foreground">{form.cpf}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Empresa</p>
                <p className="text-sm font-semibold text-foreground">{form.empresa}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Setor de Destino</p>
                <p className="text-sm font-semibold text-foreground">{form.setor || "Não informado"}</p>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-border/40">
              <div className="flex flex-wrap gap-2">
                {form.setoresAcesso.length > 0 ? (
                  form.setoresAcesso.map((setor, idx) => (
                    <span key={idx} className="bg-muted/50 text-muted-foreground px-3 py-1 rounded-full text-[10px] font-bold border border-border/60">
                      {setor}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground italic">Nenhum setor de acesso adicional</span>
                )}
              </div>
            </div>
          </div>

          {/* Ações do Step 2 */}
          <div className="flex items-center justify-between pt-4">
            <Button variant="ghost" onClick={handleVoltarStep} className="text-muted-foreground hover:text-foreground font-bold text-sm">
              <ArrowLeft size={16} className="mr-2" />
              Editar Informações
            </Button>
            
            <div className="flex gap-3">
              <Button variant="outline" className="rounded-xl border-border/60 font-bold text-sm h-11 px-6">
                Imprimir Comprovante
              </Button>
              <Link href="/portaria">
                <Button className="rounded-xl bg-foreground text-background hover:bg-foreground/90 font-bold text-sm h-11 px-6">
                  Finalizar e Voltar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
