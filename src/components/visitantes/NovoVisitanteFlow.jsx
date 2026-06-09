"use client";
import { getActiveLanguage } from "@/lib/i18n-core";
import { useState, useEffect } from "react";
import { ArrowLeft, Check, User, Building2, MapPin, Phone, ChevronRight, ChevronDown, Lock, Lightbulb, Shield, Clock, Bell, Info, X, PhoneCall, RefreshCw, ScanLine } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/AuthContext";
import { api } from "@/services/api";
import UserAvatar from "@/components/ui/UserAvatar";
import { MOTIVO_OPTIONS, normalizeMotivoVisita } from "@/lib/visitanteMotivos";
import { useToast } from "@/components/ui/toast-provider";
import {
  getEmpresaNome,
  getEmpresaNomeFromRegistro,
  getSetorNome,
  isValidEmail,
  onlyDigits,
} from "@/lib/portaria-data";

const EMPRESA_NENHUMA = "Nenhuma";
const CREATE_VIRTUAL_TAG_VALUE = "__CREATE_VIRTUAL_TAG__";

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

function getTagSelectionLabel(value, tags = []) {
  if (!value) return "Não selecionada";
  if (value === CREATE_VIRTUAL_TAG_VALUE) return "Criar nova TAG virtual";

  const tag = tags.find((item) => item.codigoTag === value);
  if (!tag) return value;

  return `TAG - ${tag.codigoTag}`;
}

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

export default function NovoVisitanteFlow({ backHref = "/portaria", breadcrumbRoot = "Portaria" }) {
  const { user, funcionario } = useAuth();
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [tempoEspera, setTempoEspera] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingEmpresas, setLoadingEmpresas] = useState(true);
  const [loadingSetores, setLoadingSetores] = useState(true);
  const [loadingTags, setLoadingTags] = useState(true);
  const [empresas, setEmpresas] = useState([]);
  const [setores, setSetores] = useState([]);
  const [tagsDisponiveis, setTagsDisponiveis] = useState([]);
  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    empresa: "",
    setor: "",
    motivo: "",
    telefone: "",
    email: "",
    rfidTag: "",
    observacao: "",
    setoresAcesso: [],
  });

  const setorOptions = setores
    .map((setor) => {
      const label = getSetorNome(setor);
      const id = Number(setor?.id || setor?.idSetor);

      return label && id
        ? {
            id,
            idDep: setor?.idDep || setor?.idDepartamento,
            value: label,
            label
          }
        : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.label.localeCompare(b.label, getActiveLanguage()));

  const setoresDisponiveis = setorOptions;

  const tagOptions = [
    ...tagsDisponiveis.map((tag) => ({
      value: tag.codigoTag,
      label: `TAG - ${tag.codigoTag}`,
    })),
    {
      value: CREATE_VIRTUAL_TAG_VALUE,
      label: "Criar nova TAG virtual",
    },
  ];

  const empresaOptions = [
    { value: EMPRESA_NENHUMA, label: EMPRESA_NENHUMA },
    ...empresas
      .map((empresa) => {
        const label = getEmpresaNome(empresa);

        return label && label !== EMPRESA_NENHUMA ? { value: label, label } : null;
      })
      .filter(Boolean)
  ];

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
    async function fetchSetores() {
      setLoadingSetores(true);

      try {
        const response = await api.get("/setores");

        if (response.sucesso && Array.isArray(response.data)) {
          setSetores(response.data);
          return;
        }

        setSetores([]);
      } catch (error) {
        console.error("Erro ao carregar setores:", error);
        setSetores([]);
      } finally {
        setLoadingSetores(false);
      }
    }

    fetchSetores();
  }, []);

  useEffect(() => {
    async function fetchTagsDisponiveis() {
      setLoadingTags(true);

      try {
        const response = await api.get("/tags/disponiveis");

        if (response.sucesso && Array.isArray(response.data)) {
          setTagsDisponiveis(response.data);
          return;
        }

        setTagsDisponiveis([]);
      } catch (error) {
        console.error("Erro ao carregar TAGs disponiveis:", error);
        setTagsDisponiveis([]);
      } finally {
        setLoadingTags(false);
      }
    }

    fetchTagsDisponiveis();
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

  const getSetorSelecionado = () => {
    return setorOptions.find((setor) => setor.value === form.setor) || null;
  };

  const getSetoresSelecionados = () => {
    const setoresSelecionados = new Map();

    form.setoresAcesso.forEach((setorNome) => {
      const setor = setorOptions.find((option) => option.value === setorNome);

      if (setor?.id) {
        setoresSelecionados.set(setor.id, setor);
      }
    });

    return Array.from(setoresSelecionados.values());
  };

  const getUsuarioDepartamentoId = () => {
    const setorSelecionado = getSetorSelecionado();
    const id = Number(
      setorSelecionado?.idDep ||
        funcionario?.idDep ||
        funcionario?.idDepartamento ||
        user?.idDep ||
        user?.idDepartamento ||
        user?.funcionario?.idDep ||
        user?.funcionario?.idDepartamento
    );

    return Number.isInteger(id) && id > 0 ? id : undefined;
  };

  const getUsuarioPayload = () => {
    const idDep = getUsuarioDepartamentoId();
    const payload = {
      nome: form.nome.trim(),
      cpf: form.cpf,
      cel: form.telefone,
      celular: form.telefone,
      email: form.email.trim().toLowerCase()
    };

    if (idDep) {
      payload.idDep = idDep;
    }

    return payload;
  };

  const getDepartamentoId = () => {
    return Number(
      getUsuarioDepartamentoId() ||
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
    const usuarioPayload = getUsuarioPayload();

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

  const showCadastroError = (description) => {
    showToast({
      type: "error",
      title: "Revise o cadastro",
      description,
    });
  };

  const handleProximoStep = async () => {
    const cpfCompletoForm = onlyDigits(form.cpf).length === 11;
    const telefoneCompletoForm = onlyDigits(form.telefone).length >= 10;
    const emailValidoForm = isValidEmail(form.email);
    const setoresSelecionados = getSetoresSelecionados();
    const observacao = form.observacao.trim();

    if (!form.nome.trim() || !cpfCompletoForm || !form.empresa || !form.setor || !form.motivo || !telefoneCompletoForm || !emailValidoForm) {
      showCadastroError("Preencha nome, CPF, empresa, setor responsável, motivo, telefone e e-mail válidos.");
      return;
    }

    if (form.setoresAcesso.length === 0) {
      showCadastroError("Selecione ao menos um setor permitido.");
      return;
    }

    if (!form.rfidTag) {
      showCadastroError("Selecione uma TAG ou escolha criar uma nova TAG virtual.");
      return;
    }

    if (loadingSetores || setorOptions.length === 0 || setoresSelecionados.length === 0) {
      showCadastroError("Não foi possível carregar os setores. Atualize a página e tente novamente.");
      return;
    }
    
    if (!user || !user.id) {
      showCadastroError("Usuário não autenticado. Faça login novamente.");
      return;
    }
    
    setLoading(true);
    try {
      const visitanteUsuario = await getOrCreateVisitanteUsuario();
      let codigoTagFinal = form.rfidTag;

      if (form.rfidTag === CREATE_VIRTUAL_TAG_VALUE) {
        const tagResponse = await api.put("/tags/virtual/assign", {
          idUsuario: visitanteUsuario.id,
        });

        if (!tagResponse.sucesso || !tagResponse.data?.codigoTag) {
          throw new Error(tagResponse.mensagem || tagResponse.erro || "Erro ao criar TAG virtual.");
        }

        codigoTagFinal = tagResponse.data.codigoTag;
      } else {
        const tagResponse = await api.put(`/tags/code/${encodeURIComponent(form.rfidTag)}/assign`, {
          idUsuario: visitanteUsuario.id,
        });

        if (!tagResponse.sucesso || !tagResponse.data?.codigoTag) {
          throw new Error(tagResponse.mensagem || tagResponse.erro || "Erro ao vincular TAG.");
        }

        codigoTagFinal = tagResponse.data.codigoTag;
      }

      const idDepartamento = getDepartamentoId();
      const setoresPermitidos = form.setoresAcesso.length > 0 ? form.setoresAcesso.join(", ") : "Nenhum";
      const descricao = [
        `Visitante: ${form.nome.trim()}`,
        `CPF: ${form.cpf}`,
        `Telefone: ${form.telefone}`,
        `Email: ${form.email.trim().toLowerCase()}`,
        `Empresa: ${form.empresa}`,
        `TAG RFID: ${codigoTagFinal || "Não informada"}`,
        `Setor responsável: ${form.setor || "Não informado"}`,
        `Setores permitidos: ${setoresPermitidos}`,
        `Observacoes: ${observacao || "Nenhuma"}`
      ].join(" | ");

      const empresaPayload = form.empresa === EMPRESA_NENHUMA ? null : form.empresa;
      const payload = {
        idUsuario: visitanteUsuario.id,
        idDepartamento,
        idSetor: setoresSelecionados.map((setor) => setor.id),
        status: "pendente",
        motivo: normalizeMotivoVisita(form.motivo || "Visita"),
        validade: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        descricao,
        empresa: empresaPayload,
        setorResponsavel: form.setor,
        telefone: form.telefone,
        email: form.email.trim().toLowerCase(),
        codigoTag: codigoTagFinal,
        setoresAcesso: form.setoresAcesso
      };
      
      const response = await api.post('/requisicao-visitante', payload);
      
      if (response.sucesso) {
        setForm((current) => ({ ...current, rfidTag: codigoTagFinal }));
        setStep(2);
        setTempoEspera(0);
        showToast({
          type: "success",
          title: "Solicitação enviada",
          description: "O supervisor já pode analisar o acesso do visitante.",
        });
      } else {
        showCadastroError(response.mensagem || "Erro ao registrar visitante.");
      }
    } catch (error) {
      console.error(error);
      showCadastroError(error.message || "Erro ao conectar com o servidor.");
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
      completed: Boolean(form.nome.trim() && cpfCompleto && form.empresa && form.setor && form.motivo && telefoneCompleto && emailValido)
    },
    { key: "documentoCPFRG", label: "Documento CPF/RG", completed: cpfCompleto },
    { key: "empresaAcessivel", label: "Empresa acessível", completed: Boolean(form.empresa) },
    { key: "setorResponsavel", label: "Setor responsável", completed: Boolean(form.setor) },
    { key: "setoresPermitidos", label: "Setores permitidos", completed: form.setoresAcesso.length > 0 },
    { key: "telefoneContato", label: "Telefone de contato", completed: telefoneCompleto },
    { key: "emailContato", label: "E-mail de contato", completed: emailValido },
    { key: "tagSelecionada", label: "TAG selecionada", completed: Boolean(form.rfidTag) }
  ];

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header com Navegação */}
      <div className="p-6 flex items-center justify-between border-b border-white/40  backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <Link href={backHref} className="p-2 hover:bg-muted/60 rounded-lg transition-all duration-200 hover:scale-110">
            <ArrowLeft size={20} className="text-muted-foreground" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">
              <span>{breadcrumbRoot}</span>
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
                      className="h-11 rounded-xl border-border/60 bg-card focus:border-primary/50 focus:ring-0 focus:ring-offset-0 outline-none transition-all duration-200 text-sm hover:border-primary/30 hover:bg-accent/50 shadow-xs"
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
                      className="h-11 rounded-xl border-border/60 bg-card focus:border-primary/50 focus:ring-0 focus:ring-offset-0 outline-none transition-all duration-200 text-sm hover:border-primary/30 hover:bg-accent/50 shadow-xs"
                      maxLength="14"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2.5">
                      Observacao da Portaria
                    </label>
                    <textarea
                      placeholder="Informe contexto importante para o supervisor, se houver."
                      value={form.observacao}
                      onChange={(e) => setForm({ ...form, observacao: e.target.value })}
                      rows={3}
                      className="w-full resize-none rounded-xl border border-border/60 bg-card px-3 py-2 text-sm text-foreground shadow-xs outline-none transition-all duration-200 hover:border-primary/30 hover:bg-accent/50 focus:border-primary/50 focus:ring-0 focus:ring-offset-0"
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
                  <h2 className="text-lg font-bold text-foreground">Dados Informacionais</h2>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2.5">
                      Empresa <span className="text-red-500">*</span>
                    </label>
                    <PrettySelect
                      value={form.empresa}
                      onChange={(empresa) => setForm({ ...form, empresa })}
                      placeholder={loadingEmpresas ? "Carregando empresas..." : "Selecione a empresa..."}
                      options={empresaOptions}
                      Icon={Building2}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2.5">
                        Setor Responsável
                      </label>
                      <PrettySelect
                        value={form.setor}
                        onChange={(setor) => setForm({ ...form, setor })}
                        placeholder={loadingSetores ? "Carregando setores..." : "Selecione a area..."}
                        options={setoresDisponiveis}
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
                        options={MOTIVO_OPTIONS}
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
                      Telefone <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={form.telefone}
                      onChange={handlePhoneChange}
                      className="h-11 rounded-xl border-border/60 bg-card focus:border-primary/50 focus:ring-0 focus:ring-offset-0 outline-none transition-all duration-200 text-sm hover:border-primary/30 hover:bg-accent/50 shadow-xs"
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
                      className="h-11 rounded-xl border-border/60 bg-card focus:border-primary/50 focus:ring-0 focus:ring-offset-0 outline-none transition-all duration-200 text-sm hover:border-primary/30 hover:bg-accent/50 shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2.5">
                      TAG RFID
                    </label>
                    <PrettySelect
                      value={form.rfidTag}
                      onChange={(value) => setForm({ ...form, rfidTag: value })}
                      placeholder={loadingTags ? "Carregando TAGs..." : "Selecione uma TAG"}
                      options={tagOptions}
                      Icon={ScanLine}
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
                        const setorValue = setor.value;
                        const isSelected = form.setoresAcesso.includes(setorValue);

                        return (
                          <label
                            key={setor.id || setorValue}
                            htmlFor={`setor-acesso-${setor.id || index}`}
                            className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all duration-200 border ${
                              isSelected
                                ? "bg-primary/5 border-primary/30 shadow-sm"
                                : "border-border/40 hover:bg-muted/50"
                            }`}
                          >
                            <input
                              id={`setor-acesso-${setor.id || index}`}
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSetorAcesso(setorValue)}
                              className="sr-only"
                            />
                            <div className={`w-5 h-5 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
                              isSelected
                                ? "bg-primary border-primary shadow-md shadow-primary/30"
                                : "border-border/60"
                            }`}>
                              {isSelected && <Check size={14} className="text-white" />}
                            </div>
                            <span className="text-sm font-medium text-foreground">{setor.label}</span>
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

                    {/* Setor responsável */}
                    {form.setor && (
                      <div className="mb-4 pb-4 border-b border-border/60">
                        <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">
                          Setor Responsável
                        </div>
                        <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/15 rounded-full px-3 py-1.5">
                          <div className="w-2 h-2 rounded-full bg-primary/70"></div>
                          <span className="text-xs font-bold text-primary">{form.setor}</span>
                        </div>
                      </div>
                    )}

                    {/* Setores permitidos */}
                    {form.setoresAcesso.length > 0 && (
                      <div className="mb-4 pb-4 border-b border-border/60">
                        <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">
                          Setores Permitidos
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

                    <div className="mt-auto space-y-2 border-t border-border/60 pt-4">
                      {[
                        { label: "CPF", value: form.cpf || "—" },
                        { label: "Telefone", value: form.telefone || "—" },
                        { label: "E-mail", value: form.email || "—" },
                        { label: "Motivo", value: form.motivo || "—" },
                        { label: "TAG", value: getTagSelectionLabel(form.rfidTag, tagsDisponiveis) },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between gap-3 text-[10px]">
                          <span className="font-bold uppercase tracking-[0.14em] text-muted-foreground">{item.label}</span>
                          <span className="min-w-0 truncate text-right font-semibold text-foreground">{item.value}</span>
                        </div>
                      ))}
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
              <div className="rounded-3xl border border-primary/15 bg-card p-5 shadow-sm">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                    <Lightbulb size={18} className="text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground text-sm">Dicas de Cadastro</h3>
                </div>

                <ul className="space-y-2.5 text-xs text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Verifique se o visitante possui documento de identificação válido</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Confirme os setores permitidos antes de enviar a solicitação</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Confira empresa, telefone e motivo antes de avançar</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3 justify-end mt-10 pt-8 border-t border-border/40">
            <Link href={backHref}>
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
              A notificação foi enviada. O visitante ficará em espera até a confirmação de acesso.
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
                { label: "Setor responsável", value: form.setor || "—" },
                { label: "CPF", value: form.cpf || "—" },
                { label: "Telefone", value: form.telefone || "—" },
                { label: "E-mail", value: form.email || "—" },
                { label: "Período", value: "Acesso imediato" },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center border-b border-border/40 pb-3">
                  <span className="text-xs text-muted-foreground font-medium">{item.label}</span>
                  <span className="text-xs text-foreground font-bold">{item.value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-1 md:col-span-2">
                <span className="text-xs text-muted-foreground font-medium">Setores permitidos</span>
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
              {form.observacao.trim() && (
                <div className="flex justify-between items-start pt-1 md:col-span-2">
                  <span className="text-xs text-muted-foreground font-medium">Observacao</span>
                  <span className="max-w-xl text-right text-xs font-bold text-foreground">{form.observacao.trim()}</span>
                </div>
              )}
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
              <Link href={backHref}>
                <Button className="h-10 rounded-xl text-[11px] font-bold gap-2 bg-blue-500 hover:bg-blue-600 text-white px-8 shadow-lg shadow-blue-500/20">
                  <RefreshCw size={14} /> Voltar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
