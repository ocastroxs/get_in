"use client";

import { getActiveLanguage } from "@/lib/i18n-core";
import { useMemo, useState } from "react";
import {
  Users, ArrowRightLeft, Clock3,
  Search, X, Check, Loader2, Filter,
  Eye
} from "lucide-react";
import StatCard from "@/components/StatCard";
import Topbar from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ModalFiltro from "@/components/ui/ModalFiltro";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { api } from "@/services/api";

const STATUS_LABEL = {
  ativo: "Ativo",
  expirado: "Expirado",
  finalizado: "Finalizado",
  pendente: "Pendente",
};

const STATUS_STYLE = {
  ativo: "bg-primary/10 text-primary",
  expirado: "bg-destructive/10 text-destructive",
  finalizado: "bg-muted text-foreground",
  pendente: "bg-muted text-muted-foreground",
};

const STATUS_DOT = {
  ativo: "bg-primary",
  expirado: "bg-destructive",
  finalizado: "bg-foreground",
  pendente: "bg-muted-foreground",
};

const LIMITE_ALERTA_HORAS = 8;

function normalizarArrayResponse(response, keys = []) {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.dados)) return response.dados;

  for (const key of keys) {
    if (Array.isArray(response?.[key])) return response[key];
    if (Array.isArray(response?.data?.[key])) return response.data[key];
    if (Array.isArray(response?.dados?.[key])) return response.dados[key];
  }

  return [];
}

function parseData(value) {
  if (!value) return null;
  const data = new Date(String(value).replace(" ", "T"));
  return Number.isNaN(data.getTime()) ? null : data;
}

function formatarDataHora(value) {
  const data = parseData(value);
  if (!data) return value || "-";
  return data.toLocaleString(getActiveLanguage(), {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getEntrada(item) {
  return item?.dataEntrada || item?.entrada || item?.dataDeEntrada || item?.dataDaRequisicao;
}

function getSaida(item) {
  return item?.dataSaida || item?.saida || item?.dataDeSaida;
}

function normalizarStatus(item, origem) {
  if (origem === "pendencias") return "pendente";

  const status = String(item?.status || item?.solicitacao || "").toLowerCase();
  const saida = getSaida(item);
  const entrada = parseData(getEntrada(item));

  if (saida || status.includes("saida") || status.includes("finalizado") || status.includes("conclu")) {
    return "finalizado";
  }

  if (status.includes("pendente")) {
    return "pendente";
  }

  if (status.includes("expir") || status.includes("alerta") || status.includes("semsaida")) {
    return "expirado";
  }

  if (entrada) {
    const horas = (Date.now() - entrada.getTime()) / (1000 * 60 * 60);
    if (horas >= LIMITE_ALERTA_HORAS) return "expirado";
  }

  return "ativo";
}

function normalizarVisitante(item, origem, index) {
  const usuario = item?.usuario || {};

  return {
    id: `${origem}-${item?.id || item?.idUsuario || item?.idLog || index}`,
    idOriginal: item?.id,
    nome: item?.nome || item?.visitante || usuario?.nome || "Visitante",
    empresa: item?.empresa || usuario?.empresas?.nome || "-",
    cpf: item?.cpf || usuario?.cpf || "-",
    setor: Array.isArray(item?.setores) ? item.setores.join(", ") : item?.setor || item?.setores?.nome || "-",
    entrada: formatarDataHora(getEntrada(item)),
    saida: getSaida(item) ? formatarDataHora(getSaida(item)) : "-",
    status: normalizarStatus(item, origem),
  };
}

function ModalDetalhesVisitante({ visitante, onClose }) {
  if (!visitante) return null;

  const detalhes = [
    { label: "Nome", value: visitante.nome },
    { label: "CPF", value: visitante.cpf },
    { label: "Empresa", value: visitante.empresa },
    { label: "Setor", value: visitante.setor },
    { label: "Entrada", value: visitante.entrada },
    { label: "Saida", value: visitante.saida || "-" },
    { label: "Status", value: STATUS_LABEL[visitante.status] || visitante.status },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-sm font-bold text-foreground">Detalhes do Visitante</h2>
            <p className="text-xs text-muted-foreground">Registro completo da visita</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Fechar detalhes"
          >
            <X size={18} />
          </button>
        </div>
        <div className="space-y-3 px-6 py-5">
          {detalhes.map((item) => (
            <div key={item.label} className="flex items-start justify-between gap-4 border-b border-border/40 pb-2 last:border-0 last:pb-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{item.label}</span>
              <span className="text-right text-sm font-medium text-foreground">{item.value || "-"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LinhaVisitante({ visitante, onDetalhes }) {
  return (
    <tr className="border-b border-border transition-colors duration-300 hover:bg-primary/[0.035]">
      <td className="px-4 py-3">
        <div className="text-sm font-medium text-foreground">{visitante.nome}</div>
        <div className="font-mono text-[10px] text-muted-foreground">{visitante.cpf}</div>
      </td>
      <td className="px-4 py-3 text-sm font-medium whitespace-nowrap text-primary">{visitante.empresa}</td>
      <td className="px-4 py-3">
        <div className="text-xs font-semibold text-foreground">{visitante.setor || "-"}</div>
      </td>
      <td className="px-4 py-3 text-sm text-foreground">{visitante.entrada || "-"}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground">{visitante.saida ?? "-"}</td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
            STATUS_STYLE[visitante.status] ?? "bg-muted text-muted-foreground"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[visitante.status] ?? "bg-muted-foreground"}`} />
          {STATUS_LABEL[visitante.status] || visitante.status}
        </span>
      </td>
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={() => onDetalhes(visitante)}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-all duration-300 hover:bg-primary/8 hover:text-primary"
          aria-label={`Ver detalhes de ${visitante.nome}`}
        >
          <Eye size={14} />
        </button>
      </td>
    </tr>
  );
}

export default function VisitantesPage() {
  const [visitantes, setVisitantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visitanteDetalhes, setVisitanteDetalhes] = useState(null);
  const [statusFiltro, setStatusFiltro] = useState("Todos");
  const [tempStatusFiltro, setTempStatusFiltro] = useState("Todos");
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
  const [busca, setBusca] = useState("");

  const carregarVisitantes = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const [localResponse, pendenciasResponse, historicoResponse] = await Promise.all([
        api.get("/portaria/vlocal"),
        api.get("/portaria/pendencias"),
        api.get("/portaria/historico"),
      ]);

      const visitantesLocal = normalizarArrayResponse(localResponse, ["visitantes", "dados"])
        .map((item, index) => normalizarVisitante(item, "vlocal", index));
      const pendencias = normalizarArrayResponse(pendenciasResponse, ["pendencias", "dados"])
        .map((item, index) => normalizarVisitante(item, "pendencias", index));
      const historico = normalizarArrayResponse(historicoResponse, ["historico", "dados"])
        .map((item, index) => normalizarVisitante(item, "historico", index));

      const visitantesPorId = new Map();
      [...visitantesLocal, ...pendencias, ...historico].forEach((visitante) => {
        visitantesPorId.set(visitante.id, visitante);
      });

      setVisitantes([...visitantesPorId.values()]);
    } catch (error) {
      console.error("Erro ao carregar visitantes:", error);
    } finally {
      setLoading(false);
    }
  };

  useAutoRefresh(carregarVisitantes);

  const filtrados = useMemo(() => {
    return visitantes.filter((visitante) => {
      const matchStatus = statusFiltro === "Todos" || visitante.status === statusFiltro;
      const query = busca.trim().toLowerCase();
      const matchBusca =
        !query ||
        visitante.nome?.toLowerCase().includes(query) ||
        visitante.empresa?.toLowerCase().includes(query) ||
        visitante.cpf?.includes(query);

      return matchStatus && matchBusca;
    });
  }, [visitantes, statusFiltro, busca]);

  const stats = useMemo(() => ({
    total:       visitantes.length,
    ativos:      visitantes.filter((v) => v.status === "ativo").length,
    finalizados: visitantes.filter((v) => v.status === "finalizado").length,
    expirados:   visitantes.filter((v) => v.status === "expirado").length,
  }), [visitantes]);

  const aplicarFiltros = () => {
    setStatusFiltro(tempStatusFiltro);
  };

  const limparFiltros = () => {
    setStatusFiltro("Todos");
    setTempStatusFiltro("Todos");
    setBusca("");
  };

  return (
    <>
      <ModalDetalhesVisitante visitante={visitanteDetalhes} onClose={() => setVisitanteDetalhes(null)} />

      <div className="flex flex-col gap-6">
        <Topbar
          title="Visitantes"
          subtitle="Gestao de acesso e monitoramento de visitantes"
          buttonText="Novo Visitante"
          buttonHref="/dashboard/visitantes/novo"
        />

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            label="Total de Visitas"
            value={stats.total}
            icon={<Users size={17} className="text-primary" />}
            sub="Registros no sistema"
            accentVar="var(--primary)"
          />
          <StatCard
            label="Ativos Agora"
            value={stats.ativos}
            valueClassName="text-secondary"
            icon={<Check size={17} className="text-secondary" />}
            sub="Dentro da empresa"
            accentVar="var(--chart-2)"
          />
          <StatCard
            label="Finalizados"
            value={stats.finalizados}
            valueClassName="text-foreground"
            icon={<ArrowRightLeft size={17} className="text-foreground" />}
            sub="Visitas concluídas"
            accentVar="var(--foreground)"
          />
          <StatCard
            label="Expirados"
            value={stats.expirados}
            valueClassName="text-destructive"
            icon={<Clock3 size={17} className="text-destructive" />}
            sub="saida pendente"
            accentVar="var(--destructive)"
          />
        </div>

        {/* Barra de Filtros Padronizada */}
        <div className="bg-card border border-border rounded-[24px] p-5 shadow-md">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 items-center gap-3 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar por nome, empresa ou CPF..."
                  className="pl-10 h-11 rounded-xl border-border/60 bg-background/80 text-sm transition-all duration-300 focus-visible:border-primary/40 focus-visible:ring-primary/20"
                />
                {busca && (
                  <button
                    type="button"
                    onClick={() => setBusca("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Limpar busca"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <Button
                type="button"
                variant="outline"
                className="h-11 px-4 gap-2 rounded-xl border-border/60 bg-background/80 transition-all duration-300 hover:border-primary/20 hover:bg-white hover:shadow-sm"
                onClick={() => setModalFiltroAberto(true)}
              >
                <Filter size={16} />
                <span className="hidden sm:inline">Filtros</span>
                {statusFiltro !== "Todos" ? (
                  <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                    1
                  </span>
                ) : null}
              </Button>
            </div>

            <div className="px-3 py-2 rounded-xl border border-border/50 bg-muted/40 text-[11px] font-semibold text-muted-foreground shadow-sm shadow-slate-200/20">
              {filtrados.length} resultado(s)
            </div>
          </div>

          {(statusFiltro !== "Todos" || busca) && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border/40">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">Filtros ativos:</span>
              {busca && (
                <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
                  Busca: {busca}
                </span>
              )}
              {statusFiltro !== "Todos" && (
                <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
                  Status: {STATUS_LABEL[statusFiltro] || statusFiltro}
                </span>
              )}
              <Button
                variant="ghost"
                onClick={limparFiltros}
                className="h-7 px-2 text-[10px] text-muted-foreground transition-colors hover:bg-transparent hover:text-foreground"
              >
                Limpar tudo
              </Button>
            </div>
          )}
        </div>

        {/* Tabela de Visitantes */}
        <div className="overflow-hidden rounded-[24px] border border-border bg-card shadow-md">
          <div className="p-4 border-b border-border bg-muted/20">
            <h3 className="font-bold text-sm">Listagem de Visitantes</h3>
            <p className="text-xs text-muted-foreground">Monitoramento em tempo real</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {["Visitante", "Empresa", "Setor", "Entrada", "Saída", "Status", "Ações"].map((col) => (
                    <th key={col} className="py-2.5 px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest whitespace-nowrap">
                      {col}
                    </th>
                  ))}
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
                ) : filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                      Nenhum visitante encontrado com os filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  filtrados.map((visitante) => (
                    <LinhaVisitante
                      key={visitante.id}
                      visitante={visitante}
                      onDetalhes={setVisitanteDetalhes}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

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
              Status da Visita
            </label>
            <div className="grid grid-cols-2 gap-2">
              {["Todos", "ativo", "expirado", "finalizado", "pendente"].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setTempStatusFiltro(status)}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                    tempStatusFiltro === status
                      ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                      : "bg-background text-muted-foreground border-border/60 hover:border-primary/30 hover:bg-muted/40"
                  }`}
                >
                  {STATUS_LABEL[status] || status}
                  {tempStatusFiltro === status && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>
          
        </div>
      </ModalFiltro>
    </>
  );
}
