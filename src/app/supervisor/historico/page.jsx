"use client";

import { getActiveLanguage } from "@/lib/i18n-core";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Eye,
  Filter,
  Info,
  Loader2,
  Search,
  X,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Topbar from "@/components/Topbar";
import StatCard from "@/components/StatCard";
import ModalFiltro from "@/components/ui/ModalFiltro";
import { api } from "@/services/api";
import { exportTableToPdf } from "@/lib/exportPdf";
import { formatCPF } from "@/lib/utils";
import { normalizeMotivoVisita } from "@/lib/visitanteMotivos";

const STATUS_LABEL = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  recusado: "Recusado",
  expirado: "Expirado",
};

const STATUS_STYLE = {
  pendente: "bg-amber-100 text-amber-700",
  aprovado: "bg-green-100 text-green-700",
  recusado: "bg-red-100 text-red-600",
  expirado: "bg-slate-100 text-slate-700",
};

function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(getActiveLanguage(), {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function getSetorNome(requisicao) {
  return requisicao?.setores?.nome || requisicao?.departamento?.nome || requisicao?.setor || "-";
}

function getExpirationDate(requisicao) {
  const validade = new Date(requisicao?.validade);

  if (!Number.isNaN(validade.getTime())) {
    return validade;
  }

  const dataDaRequisicao = new Date(requisicao?.dataDaRequisicao);

  if (Number.isNaN(dataDaRequisicao.getTime())) {
    return null;
  }

  return new Date(dataDaRequisicao.getTime() + 24 * 60 * 60 * 1000);
}

function getEffectiveStatus(requisicao) {
  const status = String(requisicao?.status || "pendente").toLowerCase();
  const expirationDate = getExpirationDate(requisicao);

  if (status === "pendente" && expirationDate && expirationDate.getTime() <= Date.now()) {
    return "expirado";
  }

  return status;
}

function getIdentity(requisicao) {
  const usuario = requisicao.usuario || {};
  return requisicao.idUsuario || usuario.id || usuario.cpf || usuario.email || usuario.nome || requisicao.id;
}

function groupByUsuarioEStatus(requisicoes) {
  const groups = new Map();

  requisicoes.forEach((requisicao) => {
    const usuario = requisicao.usuario || {};
    const status = requisicao.status || "pendente";
    const key = `${getIdentity(requisicao)}|${status}`;
    const setor = getSetorNome(requisicao);
    const current = groups.get(key);

    if (!current) {
      groups.set(key, {
        key,
        status,
        usuario,
        empresa: requisicao.empresa || usuario.empresas?.nome || "-",
        motivo: normalizeMotivoVisita(requisicao.motivo),
        dataDaRequisicao: requisicao.dataDaRequisicao,
        setores: setor && setor !== "-" ? [setor] : [],
      });
      return;
    }

    if (setor && setor !== "-" && !current.setores.includes(setor)) {
      current.setores.push(setor);
    }

    if (new Date(requisicao.dataDaRequisicao).getTime() > new Date(current.dataDaRequisicao).getTime()) {
      current.dataDaRequisicao = requisicao.dataDaRequisicao;
      current.empresa = requisicao.empresa || current.empresa;
      current.motivo = normalizeMotivoVisita(requisicao.motivo || current.motivo);
    }
  });

  return Array.from(groups.values()).sort(
    (a, b) => new Date(b.dataDaRequisicao).getTime() - new Date(a.dataDaRequisicao).getTime()
  );
}

function LinhaHistorico({ registro, onDetalhes }) {
  const statusClass = STATUS_STYLE[registro.status] || STATUS_STYLE.pendente;

  return (
    <tr className="border-b border-border transition-colors hover:bg-muted/50">
      <td className="px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{registro.usuario.nome || "-"}</p>
          <p className="text-xs text-muted-foreground">{formatCPF(registro.usuario.cpf) || "CPF não informado"}</p>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-foreground">{registro.empresa || "-"}</td>
      <td className="px-4 py-3">
        <div className="flex max-w-sm flex-wrap gap-1.5">
          {(registro.setores.length > 0 ? registro.setores : ["-"]).map((setor) => (
            <span key={setor} className="rounded-full border border-border bg-muted/50 px-2.5 py-1 text-[10px] font-bold text-foreground">
              {setor}
            </span>
          ))}
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-foreground">{registro.motivo || "-"}</td>
      <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
        {formatDateTime(registro.dataDaRequisicao)}
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${statusClass}`}>
          {STATUS_LABEL[registro.status] || STATUS_LABEL.pendente}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onDetalhes(registro)}
          className="h-8 gap-1.5 rounded-lg text-[11px] font-bold"
          type="button"
        >
          <Eye size={13} />
          Detalhes
        </Button>
      </td>
    </tr>
  );
}

function ModalDetalhesHistorico({ registro, onClose }) {
  if (!registro) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border bg-muted/20 p-5">
          <div>
            <h2 className="text-lg font-bold text-foreground">Detalhes da requisicao</h2>
            <p className="text-xs text-muted-foreground">{registro.usuario.nome || "-"} - {STATUS_LABEL[registro.status] || registro.status}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-3 p-5 text-sm">
          <Detail label="CPF" value={formatCPF(registro.usuario.cpf) || "-"} />
          <Detail label="Empresa" value={registro.empresa || "-"} />
          <Detail label="Setores" value={registro.setores.join(", ") || "-"} />
          <Detail label="Motivo" value={registro.motivo || "-"} />
          <Detail label="Solicitacao" value={formatDateTime(registro.dataDaRequisicao)} />
        </div>

        <div className="border-t border-border p-5">
          <Button type="button" onClick={onClose} className="h-10 w-full rounded-xl">
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-background/60 px-4 py-3">
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

export default function HistoricoSupervisorPage() {
  const [requisicoes, setRequisicoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [registroSelecionado, setRegistroSelecionado] = useState(null);
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
  const [tempFiltroStatus, setTempFiltroStatus] = useState("todos");

  useEffect(() => {
    fetchRequisicoes();
    const interval = setInterval(fetchRequisicoes, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  async function fetchRequisicoes() {
    try {
      setLoading(true);
      const response = await api.get("/requisicao-visitante");

      if (response?.sucesso && Array.isArray(response.data)) {
        setRequisicoes(
          response.data.map((requisicao) => ({
            ...requisicao,
            status: getEffectiveStatus(requisicao),
            motivo: normalizeMotivoVisita(requisicao.motivo),
          }))
        );
      } else {
        setRequisicoes([]);
      }
    } catch (error) {
      console.error("Erro ao carregar historico:", error);
      setRequisicoes([]);
    } finally {
      setLoading(false);
    }
  }

  const registros = useMemo(() => groupByUsuarioEStatus(requisicoes), [requisicoes]);

  const registrosFiltrados = useMemo(() => {
    return registros.filter((registro) => {
      const termoBusca = busca.toLowerCase();
      const setores = registro.setores.join(" ").toLowerCase();
      const matchBusca =
        busca === "" ||
        (registro.usuario.nome || "").toLowerCase().includes(termoBusca) ||
        (registro.usuario.cpf || "").includes(busca) ||
        (registro.empresa || "").toLowerCase().includes(termoBusca) ||
        setores.includes(termoBusca);
      const matchStatus = filtroStatus === "todos" || registro.status === filtroStatus;

      return matchBusca && matchStatus;
    });
  }, [registros, busca, filtroStatus]);

  const countPendentes = requisicoes.filter((r) => r.status === "pendente").length;
  const countAprovados = requisicoes.filter((r) => r.status === "aprovado").length;
  const countRecusados = requisicoes.filter((r) => r.status === "recusado").length;
  const countExpirados = requisicoes.filter((r) => r.status === "expirado").length;

  async function exportarPDF() {
    if (registrosFiltrados.length === 0) {
      alert("Nenhuma requisição para exportar.");
      return;
    }

    try {
      await exportTableToPdf({
        title: "Histórico de aprovações",
        subtitle: "Registros agrupados por usuário e status",
        fileName: `historico-requisicoes-${new Date().toISOString().split("T")[0]}.pdf`,
        filters: [
          busca ? `Busca: ${busca}` : null,
          filtroStatus !== "todos" ? `Status: ${STATUS_LABEL[filtroStatus]}` : null,
        ].filter(Boolean),
        columns: [
          { header: "Nome", weight: 1.3 },
          { header: "CPF", weight: 1 },
          { header: "Empresa", weight: 1.1 },
          { header: "Setores", weight: 1.6 },
          { header: "Motivo", weight: 1.1 },
          { header: "Data", weight: 1 },
          { header: "Status", weight: 0.8 },
        ],
        rows: registrosFiltrados.map((registro) => [
          registro.usuario.nome || "-",
          formatCPF(registro.usuario.cpf) || "-",
          registro.empresa || "-",
          registro.setores.join(", ") || "-",
          registro.motivo || "-",
          formatDateTime(registro.dataDaRequisicao),
          STATUS_LABEL[registro.status] || registro.status,
        ]),
      });
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      alert("Não foi possível exportar o PDF.");
    }
  }

  const aplicarFiltros = () => setFiltroStatus(tempFiltroStatus);

  const limparFiltros = () => {
    setTempFiltroStatus("todos");
    setFiltroStatus("todos");
    setBusca("");
  };

  return (
    <>
      <Topbar
        title="Histórico de Aprovações"
        subtitle="Visualize todas as requisicoes processadas"
      />

      <div className="flex flex-col gap-6 animate-in fade-in duration-700">
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatCard label="Aprovados" value={countAprovados} valueClassName="text-green-600" icon={<CheckCircle2 size={17} className="text-green-600" />} sub="Setores autorizados" accentVar="var(--chart-2)" />
          <StatCard label="Pendentes" value={countPendentes} valueClassName="text-amber-600" icon={<AlertTriangle size={17} className="text-amber-600" />} sub="Aguardando análise" accentVar="var(--warning)" />
          <StatCard label="Recusados" value={countRecusados} valueClassName="text-red-600" icon={<XCircle size={17} className="text-red-600" />} sub="Acesso não autorizado" accentVar="var(--destructive)" />
          <StatCard label="Expirados" value={countExpirados} valueClassName="text-slate-600" icon={<XCircle size={17} className="text-slate-600" />} sub="Mais de 24h pendente" accentVar="#64748b" />
        </div>

        <div className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex w-full flex-1 items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="Buscar por nome, CPF, empresa ou setor..."
                  className="h-11 rounded-xl border-border/60 bg-background/80 pl-10 text-sm"
                  value={busca}
                  onChange={(event) => setBusca(event.target.value)}
                />
                {busca && (
                  <button type="button" onClick={() => setBusca("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X size={14} />
                  </button>
                )}
              </div>

              <Button type="button" onClick={() => setModalFiltroAberto(true)} variant="outline" className="h-11 gap-2 rounded-xl border-border/60 bg-background/80 px-4">
                <Filter size={16} />
                <span className="hidden sm:inline">Filtros</span>
                {filtroStatus !== "todos" && (
                  <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">1</span>
                )}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button type="button" onClick={exportarPDF} variant="outline" className="h-11 gap-2 rounded-xl border-border/60 bg-background/80 px-4 text-sm font-medium">
                <Download size={16} />
                <span className="hidden sm:inline">Exportar PDF</span>
              </Button>
              <div className="rounded-xl border border-border/50 bg-muted/40 px-3 py-2 text-[11px] font-semibold text-muted-foreground">
                {registrosFiltrados.length} resultado(s)
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border bg-muted/20 p-4">
            <h3 className="text-sm font-bold">Registros de Acesso</h3>
            <p className="text-xs text-muted-foreground">Solicitações agrupadas por usuário e status</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="text-sm">Carregando dados...</span>
              </div>
            </div>
          ) : registrosFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <AlertTriangle size={32} className="mb-3 text-muted-foreground opacity-20" />
              <p className="text-sm text-muted-foreground">Nenhum registro encontrado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3 text-left">Visitante</th>
                    <th className="px-4 py-3 text-left">Empresa</th>
                    <th className="px-4 py-3 text-left">Setor</th>
                    <th className="px-4 py-3 text-left">Motivo</th>
                    <th className="px-4 py-3 text-left">Solicitacao</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-right">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {registrosFiltrados.map((registro) => (
                    <LinhaHistorico key={registro.key} registro={registro} onDetalhes={setRegistroSelecionado} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/90 p-5 shadow-sm">
          <div className="flex gap-3">
            <div className="h-fit rounded-xl bg-white p-2 text-blue-700 shadow-xs">
              <Info size={18} />
            </div>
            <div>
              <h3 className="mb-1 text-sm font-bold text-slate-900">Sobre o Historico</h3>
              <p className="text-xs leading-relaxed text-slate-700">
                Este historico consolida todos os setores do mesmo visitante por status. Assim, setores aprovados, recusados e pendentes aparecem em logs separados e mais faceis de auditar.
              </p>
            </div>
          </div>
        </div>
      </div>

      <ModalDetalhesHistorico
        registro={registroSelecionado}
        onClose={() => setRegistroSelecionado(null)}
      />

      <ModalFiltro
        isOpen={modalFiltroAberto}
        onClose={() => setModalFiltroAberto(false)}
        onApply={aplicarFiltros}
        onClear={limparFiltros}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="ml-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Status da Requisicao
            </label>
            <div className="grid grid-cols-2 gap-2">
              {["todos", "pendente", "aprovado", "recusado", "expirado"].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setTempFiltroStatus(status)}
                  className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all ${
                    tempFiltroStatus === status
                      ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "border-border/60 bg-background text-muted-foreground hover:border-primary/30 hover:bg-muted/40"
                  }`}
                >
                  {status === "todos" ? "Todos" : STATUS_LABEL[status]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </ModalFiltro>
    </>
  );
}
