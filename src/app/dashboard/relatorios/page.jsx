"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/StatCard";
import EntradasChart from "@/components/EntradasChart";
import TiposVisitantesChart from "@/components/TiposVisitantesChart";
import HistoricoVisitas from "@/components/HistoricoVisitas";
import SetoresMaisVisitados from "@/components/SetoresMaisVisitados";
import EmpresasMaisVisitas from "@/components/EmpresasMaisVisitas";
import FiltrosRelatorio from "@/components/FiltrosRelatorio";
import Topbar from "@/components/Topbar";
import { Users, ArrowRightLeft, Clock, AlertTriangle, Share2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";

const CORES_GRAFICO = ["#0f3a7d", "#34a853", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

function parseData(value) {
  if (!value) return null;
  const data = new Date(value);
  return Number.isNaN(data.getTime()) ? null : data;
}

function formatarHora(value) {
  const data = parseData(value);
  if (!data) return value || "-";
  return data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function formatarDuracao(ms) {
  if (!ms || ms < 0) return "-";
  const minutos = Math.round(ms / 60000);
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return horas > 0 ? `${horas}h ${resto}m` : `${resto}m`;
}

function nomeVisitante(log) {
  return log.visitante || log.usuario_nome || log.nome || log.nomeVisitante || log.pessoa || "Visitante";
}

function empresaVisitante(log) {
  return log.empresa || log.nomeEmpresa || "-";
}

function setorVisitado(log) {
  return log.setor || log.departamento_usuario || log.departamento || log.nomeDepartamento || log.destino || log.local_dispositivo || "-";
}

function tipoVisitante(log) {
  return log.tipo || log.tipoVisitante || log.categoria || "Geral";
}

function statusVisita(log) {
  if (log.status) return String(log.status).toUpperCase();
  return log.dataDeSaida || log.saida ? "CONCLUIDO" : "DENTRO";
}

function normalizarHistorico(logs) {
  return logs.map((log, index) => {
    const entrada = log.dataDeEntrada || log.entrada;
    const saida = log.dataDeSaida || log.saida;
    const entradaData = parseData(entrada);
    const saidaData = parseData(saida);
    const duracaoMs = entradaData && saidaData ? saidaData - entradaData : 0;
    const permanenciaPct = duracaoMs ? Math.min(100, Math.round((duracaoMs / (4 * 60 * 60 * 1000)) * 100)) : 0;

    return {
      id: log.log_id || log.id || index,
      visitante: nomeVisitante(log),
      empresa: empresaVisitante(log),
      tipo: tipoVisitante(log),
      setor: setorVisitado(log),
      entrada: formatarHora(entrada),
      saida: saida ? formatarHora(saida) : "-",
      permanenciaStatus: permanenciaPct,
      tempo: formatarDuracao(duracaoMs),
      status: statusVisita(log),
    };
  });
}

function rankingPorCampo(logs, getCampo) {
  const mapa = new Map();

  logs.forEach((log) => {
    const nome = getCampo(log);
    if (!nome || nome === "-") return;
    const atual = mapa.get(nome) || { nome, visitas: 0, alertas: 0 };
    atual.visitas += 1;
    if (String(log.status || "").toLowerCase().includes("alert")) {
      atual.alertas += 1;
    }
    mapa.set(nome, atual);
  });

  return [...mapa.values()].sort((a, b) => b.visitas - a.visitas).slice(0, 8);
}

function entradasPorDia(logs) {
  const mapa = new Map();

  logs.forEach((log) => {
    const data = parseData(log.dataDeEntrada || log.entrada);
    if (!data) return;
    const chave = data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    mapa.set(chave, (mapa.get(chave) || 0) + 1);
  });

  if (mapa.size === 0) {
    const hoje = new Date();
    for (let diasAtras = 6; diasAtras >= 0; diasAtras -= 1) {
      const data = new Date(hoje);
      data.setDate(hoje.getDate() - diasAtras);
      const chave = data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      mapa.set(chave, 0);
    }
  }

  return [...mapa.entries()].map(([hora, value]) => ({ hora, value })).slice(-14);
}

function entradasPorHoraHoje(logs) {
  const hoje = new Date();
  const mapa = new Map();

  logs.forEach((log) => {
    const data = parseData(log.dataDeEntrada || log.entrada);
    if (!data) return;
    const mesmoDia = data.toDateString() === hoje.toDateString();
    if (!mesmoDia) return;
    const chave = `${String(data.getHours()).padStart(2, "0")}h`;
    mapa.set(chave, (mapa.get(chave) || 0) + 1);
  });

  if (mapa.size === 0) {
    const horaAtual = hoje.getHours();
    const inicio = Math.max(0, horaAtual - 4);
    const fim = Math.min(23, horaAtual + 1);
    for (let hora = inicio; hora <= fim; hora += 1) {
      mapa.set(`${String(hora).padStart(2, "0")}h`, 0);
    }
  }

  return [...mapa.entries()]
    .sort(([a], [b]) => Number(a.replace("h", "")) - Number(b.replace("h", "")))
    .map(([hora, value]) => ({ hora, value }));
}

function tiposVisitantes(logs) {
  return rankingPorCampo(logs, tipoVisitante).map((item, index) => ({
    name: item.nome,
    value: item.visitas,
    color: CORES_GRAFICO[index % CORES_GRAFICO.length],
  }));
}

function calcularTempoMedio(logs) {
  const duracoes = logs
    .map((log) => {
      const entrada = parseData(log.dataDeEntrada || log.entrada);
      const saida = parseData(log.dataDeSaida || log.saida);
      return entrada && saida ? saida - entrada : null;
    })
    .filter((valor) => valor && valor > 0);

  if (duracoes.length === 0) return "-";
  return formatarDuracao(duracoes.reduce((sum, valor) => sum + valor, 0) / duracoes.length);
}

export default function RelatoriosPage() {
  const [activeTab, setActiveTab] = useState("geral");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    visitas: { value: 0, delta: 0, deltaDir: "up", sub: "Total carregado do backend" },
    checkoutRate: "0%",
    permanencia: { value: "-", delta: 0, deltaDir: "down", sub: "Média por visitante" },
    alertas: { value: 0, sub: "Status de alerta nos registros" },
  });
  const [historico, setHistorico] = useState([]);
  const [setoresMaisVisitados, setSetoresMaisVisitados] = useState([]);
  const [empresasMaisVisitas, setEmpresasMaisVisitas] = useState([]);
  const [entradas, setEntradas] = useState([]);
  const [entradasSemana, setEntradasSemana] = useState([]);
  const [tipos, setTipos] = useState([]);

  const carregarRelatorios = async () => {
    setLoading(true);
    try {
      const responseLogs = await api.get("/views/logs");
      const responseEmpresas = await api.get("/empresas");
      const logs = responseLogs.sucesso ? responseLogs.data || [] : [];

      const totalVisitas = logs.length;
      const checkoutCount = logs.filter((log) => log.dataDeSaida || log.saida).length;
      const checkoutRate = totalVisitas > 0 ? Math.round((checkoutCount / totalVisitas) * 100) : 0;
      const alertas = logs.filter((log) => {
        const status = String(log.status || "").toLowerCase();
        return status.includes("alert") || status.includes("semsaida");
      }).length;
      const rankingEmpresas = rankingPorCampo(logs, empresaVisitante);

      setHistorico(normalizarHistorico(logs));
      setSetoresMaisVisitados(rankingPorCampo(logs, setorVisitado));
      setEntradas(entradasPorHoraHoje(logs));
      setEntradasSemana(entradasPorDia(logs));
      setTipos(tiposVisitantes(logs));
      setStats({
        visitas: { value: totalVisitas, delta: 0, deltaDir: "up", sub: "Total carregado do backend" },
        checkoutRate: `${checkoutRate}%`,
        permanencia: { value: calcularTempoMedio(logs), delta: 0, deltaDir: "down", sub: "Média por visitante" },
        alertas: { value: alertas, sub: "Status de alerta nos registros" },
      });

      if (responseEmpresas.sucesso) {
        const visitasPorEmpresa = new Map(rankingEmpresas.map((empresa) => [empresa.nome, empresa]));
        const empresas = (responseEmpresas.data || [])
          .map((empresa) => visitasPorEmpresa.get(empresa.nome) || { nome: empresa.nome, visitas: empresa.visitantes || 0, alertas: 0 })
          .sort((a, b) => b.visitas - a.visitas)
          .slice(0, 8);
        setEmpresasMaisVisitas(empresas.length ? empresas : rankingEmpresas);
      } else {
        setEmpresasMaisVisitas(rankingEmpresas);
      }
    } catch (error) {
      console.error("Erro ao carregar relatórios:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarRelatorios();
  }, []);

  const handleExportarPDF = () => {
    window.print();
  };

  const handleCompartilhar = async () => {
    if (navigator.share) {
      await navigator.share({ title: "Relatórios GETIN", url: window.location.href });
      return;
    }
    await navigator.clipboard?.writeText(window.location.href);
    alert("Link dos relatórios copiado.");
  };

  return (
    <div className="flex w-full flex-col gap-6 overflow-x-hidden pb-10 animate-in fade-in duration-700">
      <Topbar
        title="Relatórios e Análises"
        subtitle="Historico e metricas de acessos integrados ao backend."
        secondaryButtonText="Exportar PDF"
        onSecondaryButtonClick={handleExportarPDF}
        buttonText="Atualizar Relatórios"
        onButtonClick={carregarRelatorios}
      />

      <div className="flex justify-end px-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 rounded-xl border-border/70 bg-white/75 transition-all duration-300 hover:border-primary/20 hover:bg-white hover:shadow-md hover:shadow-slate-200/40"
          onClick={handleCompartilhar}
        >
          <Share2 size={14} />
          Compartilhar
        </Button>
      </div>

      <FiltrosRelatorio />

      <div className="flex border-b border-border gap-6 px-2">
        {[
          ["geral", "Visão Geral"],
          ["visitantes", "Analise de Visitantes"],
          ["setores", "Fluxo por Setor"],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === id ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            {label}
            {activeTab === id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="animate-spin" size={32} />
          <p className="text-sm text-muted-foreground">Carregando relatorios...</p>
        </div>
      ) : (
        <>
          {activeTab === "geral" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total de Visitas no Período" value={stats.visitas.value} icon={<Users size={17} className="text-primary" />} delta={stats.visitas.delta} deltaDir={stats.visitas.deltaDir} sub={stats.visitas.sub} accentVar="var(--primary)" />
                <StatCard label="Taxa de Check-out" value={stats.checkoutRate} valueClassName="text-secondary" icon={<ArrowRightLeft size={17} className="text-secondary" />} sub="Visitas com saida registrada" accentVar="var(--chart-2)" />
                <StatCard label="Tempo Médio de Estadia" value={stats.permanencia.value} valueClassName="text-foreground" icon={<Clock size={17} className="text-foreground" />} delta={stats.permanencia.delta} deltaDir={stats.permanencia.deltaDir} sub={stats.permanencia.sub} accentVar="var(--chart-4)" />
                <StatCard label="Incidentes / Alertas" value={stats.alertas.value} valueClassName="text-destructive" icon={<AlertTriangle size={17} className="text-destructive" />} sub={stats.alertas.sub} accentVar="var(--destructive)" />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                  <EntradasChart title="Histórico de Volume de Acessos" subtitle="Comparativo diário no período selecionado" data={entradas} weekData={entradasSemana} />
                </div>
                <TiposVisitantesChart title="Perfil dos Visitantes" subtitle="Distribuicao por categoria" data={tipos} />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="font-bold text-lg text-foreground">Registros Detalhados</h3>
                </div>
                <HistoricoVisitas data={historico} title="" />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <SetoresMaisVisitados data={setoresMaisVisitados} />
                <EmpresasMaisVisitas data={empresasMaisVisitas} />
              </div>
            </>
          )}

          {activeTab === "visitantes" && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <TiposVisitantesChart title="Analise de Visitantes" subtitle="Distribuicao por categoria nos registros" data={tipos} />
              <EmpresasMaisVisitas data={empresasMaisVisitas} />
            </div>
          )}

          {activeTab === "setores" && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <SetoresMaisVisitados title="Fluxo por Setor" data={setoresMaisVisitados} />
              <EntradasChart title="Volume de Acessos" subtitle="Entradas registradas por dia" data={entradas} weekData={entradasSemana} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
