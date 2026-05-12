"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  Clock,
  Loader2,
  LogOut,
  QrCode,
  Search,
  Users,
  X,
  SlidersHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatCard from "@/components/StatCard";
import Topbar from "@/components/Topbar";
import ModalFiltroPortaria from "@/components/ModalFiltroPortaria";
import { api } from "@/services/api";

const STATUS_LABEL = {
  ativo: "Dentro",
  saida: "Saída",
  pendente: "Pendente",
  alerta: "Alerta"
};

const STATUS_STYLE = {
  ativo: "bg-green-100 text-green-700",
  saida: "bg-blue-100 text-blue-700",
  pendente: "bg-amber-100 text-amber-700",
  alerta: "bg-red-100 text-red-600"
};

const STATUS_DOT = {
  ativo: "bg-green-500",
  saida: "bg-blue-500",
  pendente: "bg-amber-500",
  alerta: "bg-red-500"
};

const STATUS_FILTERS = [
  { label: "Todos", value: "Todos" },
  { label: "Ativo", value: "ativo" },
  { label: "Pendente", value: "pendente" },
  { label: "Saída", value: "saida" }
];

function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(date);
}

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

function getSetorLabel(visitante) {
  if (Array.isArray(visitante?.setoresAcesso) && visitante.setoresAcesso.length > 0) {
    return visitante.setoresAcesso.join(", ");
  }

  return visitante?.setor || "—";
}

function ModalCheckout({ isOpen, onClose, visitante, onConfirm }) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    try {
      const payload = {
        id: visitante?.id,
        dataSaida: new Date().toISOString()
      };

      const response = await api.post("/portaria/checkout", payload);

      if (response.sucesso) {
        alert("Check-out realizado com sucesso!");
        onConfirm();
        onClose();
      } else {
        alert(response.mensagem || "Erro ao realizar check-out.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen || !visitante) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md animate-in zoom-in rounded-xl border border-border bg-card shadow-lg duration-300 fade-in">
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

        <div className="space-y-4 p-4">
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
  );
}

function LinhaVisitante({ visitante, onCheckout }) {
  const status = visitante.status || "ativo";
  const statusClass = STATUS_STYLE[status] || STATUS_STYLE.ativo;
  const dotClass = STATUS_DOT[status] || STATUS_DOT.ativo;

  return (
    <tr className="border-b border-border transition-colors hover:bg-muted/50">
      <td className="px-4 py-3">
        <div>
          <p className="text-sm font-medium text-foreground">{visitante.nome || "—"}</p>
          <p className="text-xs text-muted-foreground">{visitante.cpf || "CPF não informado"}</p>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-foreground">{visitante.empresa || "—"}</td>
      <td className="px-4 py-3 text-sm text-foreground">{getSetorLabel(visitante)}</td>
      <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
        {formatDateTime(visitante.dataEntrada)}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
        {formatDuration(visitante.dataEntrada)}
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-2 rounded-md px-2.5 py-1 text-xs font-medium ${statusClass}`}>
          <span className={`h-2 w-2 rounded-full ${dotClass}`} />
          {STATUS_LABEL[status] || STATUS_LABEL.ativo}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2 whitespace-nowrap">
          <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" type="button">
            <QrCode size={12} />
            <span className="hidden xl:inline">Crachá</span>
          </Button>

          {status === "ativo" && (
            <Button
              size="sm"
              onClick={() => onCheckout(visitante)}
              className="h-8 gap-1.5 bg-red-600 text-xs hover:bg-red-700"
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
  const [visitantes, setVisitantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [modalCheckoutAberto, setModalCheckoutAberto] = useState(false);
  const [visitanteSelecionado, setVisitanteSelecionado] = useState(null);
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
  const [filtros, setFiltros] = useState({
    busca: "",
    status: "Todos"
  });

  useEffect(() => {
    fetchVisitantes();
    const interval = setInterval(fetchVisitantes, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  async function fetchVisitantes() {
    try {
      setLoading(true);
      const response = await api.get("/portaria/visitantes-presentes");

      if (response && typeof response === "object" && response.sucesso && response.data) {
        setVisitantes(response.data);
      } else if (!response || typeof response !== "object") {
        console.warn("Back-end não está pronto. Exibindo lista vazia.");
        setVisitantes([]);
      }
    } catch (error) {
      console.error("Erro ao carregar visitantes:", error);
      setVisitantes([]);
    } finally {
      setLoading(false);
    }
  }

  const visitantesFiltrados = useMemo(() => {
    return visitantes.filter((visitante) => {
      const nome = visitante?.nome?.toLowerCase() || "";
      const cpf = visitante?.cpf || "";
      const empresa = visitante?.empresa?.toLowerCase() || "";
      const termoBusca = busca.toLowerCase();

      const matchBusca =
        busca === "" ||
        nome.includes(termoBusca) ||
        cpf.includes(busca) ||
        empresa.includes(termoBusca);

      const matchStatus = filtroStatus === "Todos" || visitante.status === filtroStatus;

      return matchBusca && matchStatus;
    });
  }, [visitantes, busca, filtroStatus]);

  function handleCheckout(visitante) {
    setVisitanteSelecionado(visitante);
    setModalCheckoutAberto(true);
  }

  function handleConfirmacao() {
    fetchVisitantes();
  }

  function handleAplicarFiltros(novosFiltros) {
    setBusca(novosFiltros.busca || "");
    setFiltroStatus(novosFiltros.status || "Todos");
    setFiltros(novosFiltros);
  }

  function handleLimparFiltros() {
    setBusca("");
    setFiltroStatus("Todos");
    setFiltros({
      busca: "",
      status: "Todos"
    });
  }

  const configFiltros = {
    busca: {
      label: "Buscar",
      placeholder: "Nome, CPF ou empresa..."
    },
    status: {
      label: "Status da Visita",
      opcoes: STATUS_FILTERS
    }
  };

  return (
    <>
      <Topbar
        title="Operação Portaria"
        subtitle="Gerenciamento de entrada e saída de visitantes"
        buttonText="Novo Visitante"
        buttonHref="/portaria/novo"
      />

      <div className="mb-6 grid grid-cols-3 gap-3">
        <StatCard
          label="Visitantes Presentes"
          value={visitantes.filter((visitante) => visitante.status === "ativo").length}
          icon={<Users size={20} className="text-blue-600" />}
        />
        <StatCard
          label="Aguardando Aprovação"
          value={visitantes.filter((visitante) => visitante.status === "pendente").length}
          icon={<AlertTriangle size={20} className="text-amber-600" />}
        />
        <StatCard
          label="Saídas Hoje"
          value={visitantes.filter((visitante) => visitante.status === "saida").length}
          icon={<LogOut size={20} className="text-green-600" />}
        />
      </div>

      <div className="mb-6 rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
            <Input
              placeholder="Buscar por nome, CPF ou empresa..."
              className="h-9 pl-9 text-sm"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
            />
            {busca && (
              <button
                onClick={() => setBusca("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                type="button"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setModalFiltroAberto(true)}
              className="gap-2 rounded-lg"
              type="button"
            >
              <SlidersHorizontal size={14} />
              Filtros Avançados
            </Button>
            {STATUS_FILTERS.map((status) => (
              <button
                key={status.value}
                onClick={() => setFiltroStatus(status.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  filtroStatus === status.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
                type="button"
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between gap-3 border-b border-border p-4">
          <div>
            <h3 className="text-sm font-bold">Visitantes em Operação</h3>
            <p className="text-xs text-muted-foreground">{visitantesFiltrados.length} registros</p>
          </div>
          <div className="text-[11px] text-muted-foreground">
            Atualização automática a cada 30 segundos
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Visitante</th>
                <th className="px-4 py-3">Empresa</th>
                <th className="px-4 py-3">Setor</th>
                <th className="px-4 py-3">Entrada</th>
                <th className="px-4 py-3">Permanência</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Loader2 className="animate-spin" size={24} />
                      <span className="text-sm">Carregando visitantes...</span>
                    </div>
                  </td>
                </tr>
              ) : visitantesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                    Nenhum visitante encontrado.
                  </td>
                </tr>
              ) : (
                visitantesFiltrados.map((visitante, index) => (
                  <LinhaVisitante
                    key={visitante.id || `${visitante.cpf || visitante.nome || "visitante"}-${index}`}
                    visitante={visitante}
                    onCheckout={handleCheckout}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ModalCheckout
        isOpen={modalCheckoutAberto}
        onClose={() => setModalCheckoutAberto(false)}
        visitante={visitanteSelecionado}
        onConfirm={handleConfirmacao}
      />

      <ModalFiltroPortaria
        isOpen={modalFiltroAberto}
        onClose={() => setModalFiltroAberto(false)}
        filtros={filtros}
        onFiltrosChange={handleAplicarFiltros}
        onLimpar={handleLimparFiltros}
        config={configFiltros}
      />
    </>
  );
}
