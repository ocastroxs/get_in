"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Loader2,
  Search,
  ShieldCheck,
  TrendingUp,
  Users,
  X,
  XCircle,
} from "lucide-react";
import Topbar from "@/components/Topbar";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ModalFiltro from "@/components/ui/ModalFiltro";
import { api } from "@/services/api";
import { exportTableToPdf } from "@/lib/exportPdf";

const STATUS_LABEL = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  recusado: "Recusado",
};

function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function getSetorNome(requisicao) {
  return requisicao?.setores?.nome || requisicao?.departamento?.nome || requisicao?.setor || "-";
}

export default function SupervisorDashboardPage() {
  const [requisicoes, setRequisicoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [tempFiltroStatus, setTempFiltroStatus] = useState("Todos");

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
        setRequisicoes(response.data);
      } else {
        setRequisicoes([]);
      }
    } catch (error) {
      console.error("Erro ao carregar requisicoes:", error);
      setRequisicoes([]);
    } finally {
      setLoading(false);
    }
  }

  const requisicoesFiltradas = useMemo(() => {
    return requisicoes.filter((requisicao) => {
      const usuario = requisicao.usuario || {};
      const termoBusca = busca.toLowerCase();
      const matchBusca =
        busca === "" ||
        (usuario.nome || "").toLowerCase().includes(termoBusca) ||
        (usuario.cpf || "").includes(busca) ||
        (requisicao.empresa || "").toLowerCase().includes(termoBusca) ||
        getSetorNome(requisicao).toLowerCase().includes(termoBusca);
      const matchStatus = filtroStatus === "Todos" || requisicao.status === filtroStatus.toLowerCase();

      return matchBusca && matchStatus;
    });
  }, [requisicoes, busca, filtroStatus]);

  const countPendentes = requisicoes.filter((r) => r.status === "pendente").length;
  const countAprovados = requisicoes.filter((r) => r.status === "aprovado").length;
  const countRecusados = requisicoes.filter((r) => r.status === "recusado").length;
  const countTotal = requisicoes.length;

  const aplicarFiltros = () => setFiltroStatus(tempFiltroStatus);

  const limparFiltros = () => {
    setTempFiltroStatus("Todos");
    setFiltroStatus("Todos");
    setBusca("");
  };

  async function exportarPDF() {
    if (requisicoesFiltradas.length === 0) {
      alert("Nao ha dados para exportar.");
      return;
    }

    try {
      await exportTableToPdf({
        title: "Dashboard do supervisor",
        subtitle: "Solicitacoes de visitantes por setor",
        fileName: `requisicoes_supervisor_${new Date().toISOString().split("T")[0]}.pdf`,
        filters: [
          busca ? `Busca: ${busca}` : null,
          filtroStatus !== "Todos" ? `Status: ${filtroStatus}` : null,
        ].filter(Boolean),
        columns: [
          { header: "Visitante", weight: 1.4 },
          { header: "Empresa", weight: 1.1 },
          { header: "Setor", weight: 1.1 },
          { header: "Motivo", weight: 1.2 },
          { header: "Data", weight: 1 },
          { header: "Status", weight: 0.8 },
        ],
        rows: requisicoesFiltradas.map((requisicao) => {
          const usuario = requisicao.usuario || {};
          return [
            usuario.nome || "-",
            requisicao.empresa || "-",
            getSetorNome(requisicao),
            requisicao.motivo || "-",
            formatDateTime(requisicao.dataDaRequisicao),
            STATUS_LABEL[requisicao.status] || requisicao.status || "Pendente",
          ];
        }),
      });
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      alert("Nao foi possivel exportar o PDF.");
    }
  }

  return (
    <>
      <Topbar
        title="Dashboard do Supervisor"
        subtitle="Visao geral das solicitacoes de visitantes"
      />

      <div className="flex flex-col gap-6 p-4 md:p-6 animate-in fade-in duration-700">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Pendentes" value={countPendentes} icon={<AlertTriangle size={20} className="text-amber-600" />} accentVar="#d97706" sub={countPendentes > 0 ? "Acao necessaria" : "Nenhuma"} />
          <StatCard label="Aprovados" value={countAprovados} icon={<CheckCircle2 size={20} className="text-green-600" />} accentVar="#16a34a" sub={`${countAprovados} setor(es)`} />
          <StatCard label="Recusados" value={countRecusados} icon={<XCircle size={20} className="text-red-600" />} accentVar="#dc2626" sub={`${countRecusados} rejeitado(s)`} />
          <StatCard label="Total" value={countTotal} icon={<Users size={20} className="text-blue-600" />} accentVar="#2563eb" sub="Requisicoes" />
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
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
                {filtroStatus !== "Todos" && (
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
                {requisicoesFiltradas.length} resultado(s)
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border bg-muted/20 p-5">
            <div>
              <h2 className="text-sm font-bold text-foreground">Listagem de Requisicoes</h2>
              <p className="mt-0.5 text-[10px] text-muted-foreground">Historico e pendencias recentes por setor</p>
            </div>
            <Clock size={20} className="text-primary opacity-60" />
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : requisicoesFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <AlertTriangle size={32} className="mb-3 text-muted-foreground opacity-30" />
              <p className="text-sm text-muted-foreground">Nenhuma requisicao encontrada.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {requisicoesFiltradas.slice(0, 10).map((requisicao) => {
                const usuario = requisicao.usuario || {};
                const status = requisicao.status || "pendente";
                const statusColor = {
                  pendente: "bg-amber-100 text-amber-700",
                  aprovado: "bg-green-100 text-green-700",
                  recusado: "bg-red-100 text-red-600",
                }[status] || "bg-gray-100 text-gray-700";

                return (
                  <div key={requisicao.id} className="grid gap-3 p-4 transition hover:bg-muted/30 md:grid-cols-[1.5fr_1fr_1fr_auto] md:items-center">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-foreground">{usuario.nome || "-"}</p>
                      <p className="mt-1 truncate text-[11px] text-muted-foreground">{requisicao.empresa || "-"} - {requisicao.motivo || "-"}</p>
                    </div>
                    <p className="text-xs font-semibold text-foreground">{getSetorNome(requisicao)}</p>
                    <span className="text-[10px] font-mono text-muted-foreground">{formatDateTime(requisicao.dataDaRequisicao)}</span>
                    <span className={`inline-flex w-fit items-center rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
                      {STATUS_LABEL[status] || status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <InfoPanel icon={<TrendingUp size={18} />} title="Como Funciona" accent="blue">
            <InfoItem number="1" text="A portaria solicita acesso para um ou mais setores." />
            <InfoItem number="2" text="Cada setor pode ser analisado separadamente." />
            <InfoItem number="3" text="A portaria recebe o resultado e libera o fluxo aprovado." />
          </InfoPanel>

          <InfoPanel icon={<ShieldCheck size={18} />} title="Seguranca" accent="green">
            <InfoItem icon={<Check size={12} />} text="Confira dados pessoais e empresa antes da decisao." />
            <InfoItem icon={<Check size={12} />} text="Aprove somente os setores realmente necessarios." />
            <InfoItem icon={<Check size={12} />} text="Use o historico para auditar decisoes anteriores." />
          </InfoPanel>
        </div>
      </div>

      <ModalFiltro
        isOpen={modalFiltroAberto}
        onClose={() => setModalFiltroAberto(false)}
        onApply={aplicarFiltros}
        onClear={limparFiltros}
      >
        <div className="space-y-2">
          <label className="ml-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Status da Requisicao
          </label>
          <div className="grid grid-cols-1 gap-2">
            {["Todos", "Pendente", "Aprovado", "Recusado"].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setTempFiltroStatus(status)}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 text-xs font-semibold transition-all ${
                  tempFiltroStatus === status
                    ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "border-border/60 bg-background text-muted-foreground hover:border-primary/30 hover:bg-muted/40"
                }`}
              >
                <span>{status === "Todos" ? "Todos os status" : status}</span>
                {tempFiltroStatus === status && <Check size={14} />}
              </button>
            ))}
          </div>
        </div>
      </ModalFiltro>
    </>
  );
}

function InfoPanel({ icon, title, accent, children }) {
  const classes = {
    blue: "border-blue-200 bg-blue-50/80 text-blue-700",
    green: "border-green-200 bg-green-50/80 text-green-700",
  };

  return (
    <section className={`rounded-2xl border p-6 shadow-sm ${classes[accent]}`}>
      <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900">
        {icon}
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function InfoItem({ number, icon, text }) {
  return (
    <div className="flex items-start gap-3 text-xs font-medium leading-relaxed text-slate-700">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-bold text-primary shadow-xs">
        {icon || number}
      </span>
      <span>{text}</span>
    </div>
  );
}
