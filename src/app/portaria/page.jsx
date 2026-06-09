"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  ChevronDown,
  Clock,
  Loader2,
  LogOut,
  Mail,
  Pencil,
  Phone,
  Search,
  Trash2,
  Users,
  X,
  Filter,
  Check,
  Download,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatCard from "@/components/StatCard";
import Topbar from "@/components/Topbar";
import ModalFiltro from "@/components/ui/ModalFiltro";
import ModalPortal from "@/components/ui/ModalPortal";
import PaginationControls from "@/components/ui/PaginationControls";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { usePagination } from "@/hooks/usePagination";
import { api } from "@/services/api";
import { exportTableToPdf } from "@/lib/exportPdf";
import { useToast } from "@/components/ui/toast-provider";
import {
  buildSelectOptions,
  dedupeVisitantesPorIdentidade,
  formatPhone,
  formatPortariaDateTime,
  getEmpresaNome,
  getResponseArray,
  getSetorLabel,
  getSetoresPermitidosLabel,
  getSetorNome,
  isToday,
  isValidEmail,
  maskCPF,
  maskPhone,
  normalizePortariaVisitante,
  onlyDigits,
  pickFirst,
  PORTARIA_STATUS_DOT,
  PORTARIA_STATUS_FILTERS,
  PORTARIA_STATUS_LABEL,
  PORTARIA_STATUS_STYLE,
} from "@/lib/portaria-data";

const EDIT_INPUT_CLASS =
  "h-11 rounded-xl border-border/60 bg-card text-sm shadow-xs transition-all duration-200 hover:border-primary/30 hover:bg-accent/50 focus:border-primary/50 focus:ring-0 focus:ring-offset-0 outline-none";

const SEARCH_INPUT_CLASS =
  "h-11 rounded-xl border-border/60 bg-card text-sm shadow-xs transition-all duration-200 hover:border-primary/30 hover:bg-accent/50 focus:border-primary/50 focus:ring-0 focus:ring-offset-0 outline-none pl-10";

function formatDuration(startDate) {
  if (!startDate) return "—";

  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) {
    return "—";
  }

  const diffInMinutes = Math.max(0, Math.round((Date.now() - start.getTime()) / 60000));
  const hours = Math.floor(diffInMinutes / 60);
  const minutes = diffInMinutes % 60;

  if (hours === 0) {
    return `${minutes} min`;
  }

  return `${hours}h ${minutes.toString().padStart(2, "0")}min`;
}

function getVisitanteForm(visitante) {
  const setor = visitante?.setorResponsavel || getSetorLabel(visitante);

  return {
    nome: visitante?.nome || "",
    cpf: visitante?.cpf || "",
    empresa: visitante?.empresa || "",
    setor: setor === "—" ? "" : setor,
    setoresPermitidos: getSetoresPermitidosLabel(visitante),
    telefone: formatPhone(visitante?.telefone) || visitante?.telefone || "",
    email: visitante?.email || ""
  };
}

function buildVisitanteDescricao(form) {
  return [
    `Visitante: ${form.nome.trim()}`,
    `CPF: ${form.cpf.trim()}`,
    `Telefone: ${form.telefone.trim()}`,
    `Email: ${form.email.trim().toLowerCase()}`,
    `Empresa: ${form.empresa.trim()}`,
    `Setor responsavel: ${form.setor.trim() || "Não informado"}`,
    `Setores permitidos: ${form.setoresPermitidos && form.setoresPermitidos !== "—" ? form.setoresPermitidos : "Não informado"}`
  ].join(" | ");
}

function ModalCheckout({ isOpen, onClose, visitante, onConfirm }) {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  async function handleCheckout() {
    setLoading(true);
    try {
      const payload = {
        idUsuario: visitante?.idUsuario || visitante?.id,
        idLog: visitante?.idLog,
        dataSaida: new Date().toISOString()
      };

      const response = await api.post("/portaria/checkout", payload);

      if (response.sucesso) {
        showToast({
          type: "success",
          title: "Check-out realizado",
          description: `${visitante?.nome || "Visitante"} teve a saída registrada.`,
        });
        onConfirm();
        onClose();
      } else {
        showToast({
          type: "error",
          title: "Não foi possível realizar o check-out",
          description: response.mensagem || "Revise o visitante selecionado e tente novamente.",
        });
      }
    } catch (error) {
      console.error(error);
      showToast({
        type: "error",
        title: "Erro de conexão",
        description: "Não foi possível conectar à API.",
      });
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen || !visitante) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-hidden animate-in zoom-in-95 rounded-xl border border-border bg-card shadow-lg duration-300 fade-in">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-semibold text-foreground">Check-out</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 transition-colors hover:bg-muted"
            type="button"
          >
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto p-4" data-lenis-prevent>
          <div className="space-y-3 rounded-lg bg-muted/40 p-3">
            <div className="flex items-start gap-2">
              <Users size={16} className="mt-0.5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Visitante</p>
                <p className="text-sm font-medium text-foreground">{visitante.nome || "—"}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Building2 size={16} className="mt-0.5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Empresa</p>
                <p className="text-sm font-medium text-foreground">{visitante.empresa || "—"}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock size={16} className="mt-0.5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Tempo de Permanência</p>
                <p className="text-sm font-medium text-foreground">{formatDuration(visitante.dataEntrada)}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Observações
            </label>
            <textarea
              placeholder="Adicione observações sobre a visita (opcional)"
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              rows="3"
            />
          </div>
        </div>

        <div className="flex gap-2 border-t border-border p-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
            type="button"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCheckout}
            className="flex-1 bg-red-600 hover:bg-red-700"
            disabled={loading}
            type="button"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <LogOut size={14} className="mr-2" />
                Confirmar Saída
              </>
            )}
          </Button>
        </div>
        </div>
      </div>
    </ModalPortal>
  );
}

function SelectField({ value, onChange, placeholder, options, Icon, loading, emptyLabel }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasOptions = options.length > 0;
  const hasSelectedValue = options.some((option) => option.value === value);
  const placeholderText = loading ? "Carregando..." : hasOptions ? placeholder : emptyLabel;
  const selectedOption = options.find((option) => option.value === value);
  const disabled = loading || !hasOptions;

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
        disabled={disabled}
        onClick={() => setIsOpen((current) => !current)}
        className={`group flex h-10 w-full items-center gap-3 rounded-xl border bg-card px-3 text-left text-sm shadow-xs transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
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
          {selectedOption?.label || placeholderText}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180 text-primary" : "group-hover:text-primary"
          }`}
        />
      </button>

      {isOpen && !disabled && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-border/60 bg-popover p-1.5 text-popover-foreground shadow-[0_18px_45px_rgba(15,58,125,0.14)]"
        >
          <button
            type="button"
            role="option"
            aria-selected={!hasSelectedValue}
            onClick={() => {
              onChange("");
              setIsOpen(false);
            }}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all duration-150 ${
              !hasSelectedValue
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
            }`}
          >
            <span className="size-2 rounded-full bg-border" />
            <span className="flex-1 truncate font-medium">{placeholder}</span>
          </button>

          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                key={`${option.id || option.value}-${option.value}`}
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

function ModalEditarVisitante({
  isOpen,
  onClose,
  visitante,
  onSave,
  empresaOptions = [],
  setorOptions = [],
  loadingOptions = false
}) {
  const [form, setForm] = useState(getVisitanteForm(visitante));
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    setForm(getVisitanteForm(visitante));
    setErro("");
  }, [visitante]);

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.nome.trim()) {
      setErro("Nome do visitante é obrigatório.");
      return;
    }

    if (!form.email.trim() || !isValidEmail(form.email)) {
      setErro("Informe um e-mail válido.");
      return;
    }

    if (loadingOptions) {
      setErro("Aguarde o carregamento das empresas e setores.");
      return;
    }

    const empresaSelecionada = empresaOptions.find((option) => option.value === form.empresa);
    const setorSelecionado = setorOptions.find((option) => option.value === form.setor);

    if (!empresaSelecionada) {
      setErro("Selecione uma empresa cadastrada.");
      return;
    }

    if (!setorSelecionado) {
      setErro("Selecione um setor cadastrado.");
      return;
    }

    setSaving(true);
    setErro("");

    try {
      const payload = {
        nome: form.nome.trim(),
        cpf: form.cpf.trim(),
        empresa: form.empresa.trim(),
        setorResponsavel: form.setor.trim(),
        telefone: form.telefone.trim(),
        celular: form.telefone.trim(),
        email: form.email.trim().toLowerCase(),
        descricao: buildVisitanteDescricao(form)
      };

      const response = await onSave(payload);

      if (response?.sucesso) {
        onClose();
      } else {
        setErro(response?.mensagem || "Não foi possível salvar o visitante.");
      }
    } catch (error) {
      console.error(error);
      setErro("Erro de conexão com o servidor.");
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen || !visitante) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-300">
        <form
          onSubmit={handleSubmit}
          className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-hidden animate-in zoom-in-95 rounded-xl border border-border bg-card shadow-lg duration-300 fade-in"
        >
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Pencil size={15} />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Editar visitante</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 transition-colors hover:bg-muted"
            type="button"
          >
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto p-4" data-lenis-prevent>
          {erro && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
              <AlertTriangle size={14} className="mt-0.5 shrink-0 text-red-500" />
              <span>{erro}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nome</label>
              <Input
                value={form.nome}
                onChange={(event) => setField("nome", event.target.value)}
                className={EDIT_INPUT_CLASS}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">CPF</label>
              <Input
                value={form.cpf}
                onChange={(event) => setField("cpf", maskCPF(event.target.value))}
                className={EDIT_INPUT_CLASS}
                maxLength={14}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Empresa</label>
              <SelectField
                value={form.empresa}
                onChange={(empresa) => setField("empresa", empresa)}
                placeholder="Selecione a empresa"
                emptyLabel="Nenhuma empresa cadastrada"
                options={empresaOptions}
                Icon={Building2}
                loading={loadingOptions}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Setor responsável</label>
              <SelectField
                value={form.setor}
                onChange={(setor) => setField("setor", setor)}
                placeholder="Selecione o setor responsável"
                emptyLabel="Nenhum setor cadastrado"
                options={setorOptions}
                Icon={MapPin}
                loading={loadingOptions}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Celular</label>
              <Input
                value={form.telefone}
                onChange={(event) => setField("telefone", maskPhone(event.target.value))}
                className={EDIT_INPUT_CLASS}
                maxLength={15}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">E-mail</label>
              <Input
                type="email"
                value={form.email}
                onChange={(event) => setField("email", event.target.value)}
                className={EDIT_INPUT_CLASS}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 border-t border-border bg-muted/20 p-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={saving}
            type="button"
          >
            Cancelar
          </Button>
          <Button
            className="flex-1"
            disabled={saving || loadingOptions}
            type="submit"
          >
            {saving ? (
              <>
                <Loader2 size={14} className="mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Check size={14} className="mr-2" />
                Salvar alterações
              </>
            )}
          </Button>
        </div>
        </form>
      </div>
    </ModalPortal>
  );
}

function ModalExcluirVisitante({ isOpen, onClose, visitante, onConfirm }) {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    setErro("");
  }, [visitante]);

  async function handleConfirm() {
    setLoading(true);
    setErro("");

    try {
      const response = await onConfirm();

      if (response?.sucesso) {
        onClose();
      } else {
        setErro(response?.mensagem || "Não foi possível excluir o visitante.");
      }
    } catch (error) {
      console.error(error);
      setErro("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen || !visitante) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-hidden animate-in zoom-in-95 rounded-xl border border-border bg-card shadow-lg duration-300 fade-in">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <AlertTriangle size={16} />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Excluir visitante</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 transition-colors hover:bg-muted"
            type="button"
          >
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto p-4" data-lenis-prevent>
          {erro && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
              <AlertTriangle size={14} className="mt-0.5 shrink-0 text-red-500" />
              <span>{erro}</span>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir <strong className="text-foreground">{visitante.nome || "este visitante"}</strong>?
            Esta ação remove o cadastro e os registros vinculados.
          </p>
        </div>

        <div className="flex gap-2 border-t border-border bg-muted/20 p-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
            type="button"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700"
            disabled={loading}
            type="button"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="mr-2 animate-spin" />
                Excluindo...
              </>
            ) : (
              <>
                <Trash2 size={14} className="mr-2" />
                Excluir
              </>
            )}
          </Button>
        </div>
        </div>
      </div>
    </ModalPortal>
  );
}

function LinhaVisitante({ visitante, onCheckout, onEdit, onDelete }) {
  const status = visitante.status || "ativo";
  const statusClass = PORTARIA_STATUS_STYLE[status] || PORTARIA_STATUS_STYLE.ativo;
  const dotClass = PORTARIA_STATUS_DOT[status] || PORTARIA_STATUS_DOT.ativo;

  return (
    <tr className="border-b border-border transition-colors hover:bg-muted/50">
      <td className="px-4 py-3">
        <p className="text-sm font-bold text-foreground">{visitante.nome || "—"}</p>
      </td>
      <td className="px-4 py-3 text-sm text-foreground">{visitante.empresa || "—"}</td>
      <td className="px-4 py-3 text-sm text-foreground">{getSetorLabel(visitante)}</td>
      <td className="px-4 py-3 whitespace-nowrap text-[11px] font-mono text-muted-foreground">
        {formatPortariaDateTime(visitante.dataEntrada)}
      </td>
      <td className="px-4 py-3">
        <p className="flex items-center gap-1.5 whitespace-nowrap text-xs text-muted-foreground">
          <Phone size={12} />
          <span>{formatPhone(visitante.telefone) || "—"}</span>
        </p>
      </td>
      <td className="px-4 py-3">
        <p className="flex max-w-[240px] items-center gap-1.5 truncate text-xs text-muted-foreground">
          <Mail size={12} className="shrink-0" />
          <span className="truncate">{visitante.email || "—"}</span>
        </p>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-2 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusClass}`}>
          <span className={`h-2 w-2 rounded-full ${dotClass}`} />
          {PORTARIA_STATUS_LABEL[status] || PORTARIA_STATUS_LABEL.ativo}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2 whitespace-nowrap">
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => onEdit(visitante)}
            className="text-muted-foreground hover:bg-primary/10 hover:text-primary"
            title="Editar visitante"
            aria-label={`Editar ${visitante.nome || "visitante"}`}
            type="button"
          >
            <Pencil size={14} />
          </Button>

          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => onDelete(visitante)}
            className="text-muted-foreground hover:bg-red-50 hover:text-red-600"
            title="Excluir visitante"
            aria-label={`Excluir ${visitante.nome || "visitante"}`}
            type="button"
          >
            <Trash2 size={14} />
          </Button>

          {status === "ativo" && visitante.podeCheckout && (
            <Button
              size="sm"
              onClick={() => onCheckout(visitante)}
              className="h-8 gap-1.5 bg-red-600 text-[10px] font-bold uppercase hover:bg-red-700 rounded-lg"
              type="button"
            >
              <LogOut size={12} />
              <span className="hidden xl:inline">Saída</span>
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function PortariaPage() {
  const { showToast } = useToast();
  const [visitantes, setVisitantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [modalCheckoutAberto, setModalCheckoutAberto] = useState(false);
  const [modalEdicaoAberto, setModalEdicaoAberto] = useState(false);
  const [modalExclusaoAberto, setModalExclusaoAberto] = useState(false);
  const [visitanteSelecionado, setVisitanteSelecionado] = useState(null);
  const [empresaOptions, setEmpresaOptions] = useState([]);
  const [setorOptions, setSetorOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
  const [tempFiltroStatus, setTempFiltroStatus] = useState("Todos");

  useEffect(() => {
    fetchOpcoesEdicao();
  }, []);

  useAutoRefresh(fetchVisitantes);

  async function fetchVisitantes({ silent = false } = {}) {
    try {
      if (!silent) setLoading(true);
      const visitantesResponse = await api.get("/portaria/vlocal");
      const visitantesPortaria = getResponseArray(visitantesResponse, ["dados", "visitantes"]);

      if (visitantesResponse?.sucesso) {
        setVisitantes(
          dedupeVisitantesPorIdentidade(
            visitantesPortaria
              .map(normalizePortariaVisitante)
              .filter((visitante) => {
                if (visitante.status === "saida") {
                  return isToday(visitante.dataSaida);
                }

                return visitante.status === "ativo";
              })
          )
        );
      } else {
        console.warn("Back-end não retornou visitantes da portaria.");
        setVisitantes([]);
      }
    } catch (error) {
      console.error("Erro ao carregar visitantes:", error);
      setVisitantes([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchOpcoesEdicao() {
    setLoadingOptions(true);

    try {
      const [empresasResponse, setoresResponse] = await Promise.all([
        api.get("/empresas"),
        api.get("/setores")
      ]);

      setEmpresaOptions(buildSelectOptions(getResponseArray(empresasResponse), getEmpresaNome));
      setSetorOptions(buildSelectOptions(getResponseArray(setoresResponse), getSetorNome));
    } catch (error) {
      console.error("Erro ao carregar empresas e setores:", error);
      setEmpresaOptions([]);
      setSetorOptions([]);
    } finally {
      setLoadingOptions(false);
    }
  }

  const visitantesFiltrados = useMemo(() => {
    return visitantes.filter((visitante) => {
      const nome = visitante?.nome?.toLowerCase() || "";
      const cpf = visitante?.cpf || "";
      const empresa = visitante?.empresa?.toLowerCase() || "";
      const setor = getSetorLabel(visitante).toLowerCase();
      const setoresPermitidos = getSetoresPermitidosLabel(visitante).toLowerCase();
      const telefone = visitante?.telefone?.toLowerCase() || "";
      const telefoneFormatado = formatPhone(visitante?.telefone).toLowerCase();
      const telefoneDigitos = onlyDigits(visitante?.telefone);
      const termoBuscaDigitos = onlyDigits(busca);
      const email = visitante?.email?.toLowerCase() || "";
      const termoBusca = busca.toLowerCase();

      const matchBusca =
        busca === "" ||
        nome.includes(termoBusca) ||
        cpf.includes(busca) ||
        empresa.includes(termoBusca) ||
        setor.includes(termoBusca) ||
        setoresPermitidos.includes(termoBusca) ||
        telefone.includes(termoBusca) ||
        telefoneFormatado.includes(termoBusca) ||
        (termoBuscaDigitos !== "" && telefoneDigitos.includes(termoBuscaDigitos)) ||
        email.includes(termoBusca);

      const matchStatus = filtroStatus === "Todos" || visitante.status === filtroStatus;

      return matchBusca && matchStatus;
    });
  }, [visitantes, busca, filtroStatus]);

  const {
    page,
    setPage,
    pageSize,
    totalItems,
    totalPages,
    paginatedItems: visitantesPagina,
  } = usePagination(visitantesFiltrados);

  function handleCheckout(visitante) {
    setVisitanteSelecionado(visitante);
    setModalCheckoutAberto(true);
  }

  function handleEdit(visitante) {
    if (!loadingOptions && (empresaOptions.length === 0 || setorOptions.length === 0)) {
      fetchOpcoesEdicao();
    }

    setVisitanteSelecionado(visitante);
    setModalEdicaoAberto(true);
  }

  function handleDelete(visitante) {
    setVisitanteSelecionado(visitante);
    setModalExclusaoAberto(true);
  }

  function handleConfirmacao() {
    fetchVisitantes();
  }

  async function salvarVisitante(payload) {
    if (!visitanteSelecionado?.id) {
      return { sucesso: false, mensagem: "Visitante não identificado." };
    }

    const response = await api.put(`/portaria/visitante/${visitanteSelecionado.id}`, payload);

    if (response.sucesso) {
      await fetchVisitantes();
      showToast({
        type: "success",
        title: "Visitante atualizado",
        description: "Os dados da visita foram salvos.",
      });
    }

    return response;
  }

  async function excluirVisitante() {
    if (!visitanteSelecionado?.id) {
      return { sucesso: false, mensagem: "Visitante não identificado." };
    }

    const response = await api.delete(`/portaria/visitante/${visitanteSelecionado.id}`);

    if (response.sucesso) {
      await fetchVisitantes();
      showToast({
        type: "success",
        title: "Visitante excluído",
        description: "O cadastro e os registros vinculados foram removidos.",
      });
    }

    return response;
  }

  const aplicarFiltros = () => {
    setFiltroStatus(tempFiltroStatus);
  };

  const limparFiltros = () => {
    setTempFiltroStatus("Todos");
    setFiltroStatus("Todos");
    setBusca("");
  };

  const exportarPDF = async () => {
    if (visitantesFiltrados.length === 0) {
      showToast({
        type: "info",
        title: "Nada para exportar",
        description: "A lista atual não tem visitantes para gerar PDF.",
      });
      return;
    }

    try {
      await exportTableToPdf({
        title: "Visitantes presentes",
        subtitle: "Controle de acesso da portaria",
        fileName: `visitantes_presentes_${new Date().toISOString().split("T")[0]}.pdf`,
        filters: [
          busca ? `Busca: ${busca}` : null,
          filtroStatus !== "Todos" ? `Status: ${PORTARIA_STATUS_LABEL[filtroStatus] || filtroStatus}` : null,
        ].filter(Boolean),
        columns: [
          { header: "Nome", weight: 1.5 },
          { header: "Empresa", weight: 1.2 },
          { header: "Setor responsável", weight: 1 },
          { header: "Entrada", weight: 1.1 },
          { header: "Celular", weight: 1 },
          { header: "E-mail", weight: 1.4 },
          { header: "Status", weight: 0.8 },
        ],
        rows: visitantesFiltrados.map((v) => [
          v.nome,
          v.empresa,
          getSetorLabel(v),
          formatPortariaDateTime(v.dataEntrada),
          formatPhone(v.telefone),
          v.email,
          PORTARIA_STATUS_LABEL[v.status] || "Dentro",
        ]),
      });
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      showToast({
        type: "error",
        title: "Erro ao exportar PDF",
        description: "Não foi possível gerar o arquivo agora.",
      });
    }
  };

  const countDentro = visitantes.filter((v) => v.status === "ativo").length;
  const countSaidas = visitantes.filter((v) => v.status === "saida").length;
  const countEmpresas = new Set(
    visitantes
      .filter((v) => v.status === "ativo" && v.empresa)
      .map((v) => String(v.empresa).toLowerCase())
  ).size;

  return (
    <>
      <Topbar
        title="Portaria"
        subtitle="Controle de acesso e visitantes"
        buttonText="Novo Visitante"
        buttonHref="/portaria/novo"
      />

      <div className="flex flex-col gap-6 p-4 md:p-6 animate-in fade-in duration-700">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard
            label="Visitantes Dentro"
            value={countDentro}
            icon={<Users size={20} className="text-green-600" />}
            accentVar="#16a34a"
            sub="No local agora"
          />
          <StatCard
            label="Saídas"
            value={countSaidas}
            icon={<LogOut size={20} className="text-blue-600" />}
            accentVar="#2563eb"
            sub="Com saída registrada"
          />
          <StatCard
            label="Empresas Presentes"
            value={countEmpresas}
            icon={<Building2 size={20} className="text-amber-600" />}
            accentVar="#d97706"
            sub="Com visitantes dentro"
          />
        </div>

        {/* Barra de Filtros Padronizada */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center lg:flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="Buscar por nome, empresa, setor responsável, setor permitido, celular ou e-mail..."
                  className={SEARCH_INPUT_CLASS}
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
                {busca && (
                  <button
                    type="button"
                    onClick={() => setBusca("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              
              <Button
                type="button"
                onClick={() => setModalFiltroAberto(true)}
                variant="outline"
                className="h-11 px-4 gap-2 rounded-xl border-border/60 bg-background/80"
              >
                <Filter size={16} />
                <span className="hidden sm:inline">Filtros</span>
                {filtroStatus !== "Todos" && (
                  <span className="ml-1 w-5 h-5 rounded-full bg-primary text-[10px] flex items-center justify-center text-primary-foreground">
                    1
                  </span>
                )}
              </Button>
            </div>

            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
              <Button
                onClick={exportarPDF}
                variant="outline"
                className="h-11 px-4 gap-2 rounded-xl border-border/60 bg-background/80 text-sm font-medium"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Exportar PDF</span>
              </Button>
              <div className="px-3 py-2 rounded-xl bg-muted/40 border border-border/50 text-[11px] font-semibold text-muted-foreground">
                {visitantesFiltrados.length} presente(s)
              </div>
            </div>
          </div>

          {(filtroStatus !== "Todos" || busca) && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border/40">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">Filtros ativos:</span>
              {busca && (
                <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
                  Busca: {busca}
                </span>
              )}
              {filtroStatus !== "Todos" && (
                <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
                  Status: {PORTARIA_STATUS_LABEL[filtroStatus] || filtroStatus}
                </span>
              )}
              <Button
                variant="ghost"
                onClick={limparFiltros}
                className="h-7 px-2 text-[10px] text-muted-foreground hover:text-foreground"
              >
                Limpar tudo
              </Button>
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/20">
            <h3 className="font-bold text-sm text-foreground">Visitantes</h3>
            <p className="text-xs text-muted-foreground">{visitantesFiltrados.length} visitantes encontrados</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left border-collapse">
              <thead>
                <tr className="bg-muted/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="px-4 py-3">Visitante</th>
                  <th className="px-4 py-3">Empresa</th>
                  <th className="px-4 py-3">Setor responsável</th>
                  <th className="px-4 py-3">Entrada</th>
                  <th className="px-4 py-3">Celular</th>
                  <th className="px-4 py-3">E-mail</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading && visitantes.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Loader2 className="animate-spin" size={24} />
                        <span className="text-sm">Carregando visitantes...</span>
                      </div>
                    </td>
                  </tr>
                ) : visitantesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-20 text-center text-sm text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-12 w-12 text-muted/30" />
                        <p>Nenhum visitante presente no momento.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  visitantesPagina.map((v, index) => (
                    <LinhaVisitante
                      key={`${v.id || "visitante"}-${v.dataEntrada || v.status || index}`}
                      visitante={v}
                      onCheckout={handleCheckout}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
          <PaginationControls
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            currentCount={visitantesPagina.length}
            onPageChange={setPage}
            itemLabel="visitante(s)"
          />
        </div>
      </div>

      <ModalCheckout
        isOpen={modalCheckoutAberto}
        onClose={() => setModalCheckoutAberto(false)}
        visitante={visitanteSelecionado}
        onConfirm={handleConfirmacao}
      />

      <ModalEditarVisitante
        isOpen={modalEdicaoAberto}
        onClose={() => setModalEdicaoAberto(false)}
        visitante={visitanteSelecionado}
        onSave={salvarVisitante}
        empresaOptions={empresaOptions}
        setorOptions={setorOptions}
        loadingOptions={loadingOptions}
      />

      <ModalExcluirVisitante
        isOpen={modalExclusaoAberto}
        onClose={() => setModalExclusaoAberto(false)}
        visitante={visitanteSelecionado}
        onConfirm={excluirVisitante}
      />

      {/* Modal de Filtro Padronizado */}
      <ModalFiltro
        isOpen={modalFiltroAberto}
        onClose={() => setModalFiltroAberto(false)}
        onApply={aplicarFiltros}
        onClear={limparFiltros}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
              Status de Permanência
            </label>
            <div className="grid grid-cols-1 gap-2">
              {PORTARIA_STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setTempFiltroStatus(f.value)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all border ${
                    tempFiltroStatus === f.value
                      ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                      : "bg-background text-muted-foreground border-border/60 hover:border-primary/30 hover:bg-muted/40"
                  }`}
                >
                  <span>{f.label}</span>
                  {tempFiltroStatus === f.value && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </ModalFiltro>
    </>
  );
}
