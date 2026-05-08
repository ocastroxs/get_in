"use client";

import { useState, useEffect } from "react";
import StatCard from "@/components/StatCard";
import EntradasChart from "@/components/EntradasChart";
import TiposVisitantesChart from "@/components/TiposVisitantesChart";
import HistoricoVisitas from "@/components/HistoricoVisitas";
import SetoresMaisVisitados from "@/components/SetoresMaisVisitados";
import EmpresasMaisVisitas from "@/components/EmpresasMaisVisitas";
import FiltrosRelatorio from "@/components/FiltrosRelatorio";
import { Users, ArrowRightLeft, Clock, AlertTriangle, FileText, Download, Share2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";

export default function RelatoriosPage() {
  const [activeTab, setActiveTab] = useState("geral");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    visitas: { value: 0, delta: 0, deltaDir: "up", sub: "Total acumulado" },
    checkoutRate: "0%",
    permanencia: { value: "0h", delta: 0, deltaDir: "down", sub: "Média por visitante" },
    alertas: { value: 0, sub: "Permanência excedida" }
  });
  const [historico, setHistorico] = useState([]);
  const [setoresMaisVisitados, setSetoresMaisVisitados] = useState([]);
  const [empresasMaisVisitas, setEmpresasMaisVisitas] = useState([]);

  const carregarRelatorios = async () => {
    setLoading(true);
    try {
      // 🔌 Endpoints futuros para relatórios
      // Por enquanto, carregamos dados dos endpoints existentes
      const responseLogs = await api.get('/logs');
      const responseDep = await api.get('/dep');
      
      if (responseLogs.sucesso) {
        setHistorico(responseLogs.data || []);
      }
      
      if (responseDep.sucesso) {
        setSetoresMaisVisitados(responseDep.data || []);
      }
      
      // Calcula estatísticas básicas a partir dos logs
      if (responseLogs.sucesso && responseLogs.data) {
        const logs = responseLogs.data;
        const totalVisitas = logs.length;
        const checkoutCount = logs.filter(l => l.dataDeSaida).length;
        const checkoutRate = totalVisitas > 0 ? Math.round((checkoutCount / totalVisitas) * 100) : 0;
        
        setStats(prev => ({
          ...prev,
          visitas: { ...prev.visitas, value: totalVisitas },
          checkoutRate: `${checkoutRate}%`,
          alertas: { ...prev.alertas, value: Math.floor(Math.random() * 10) } // Placeholder
        }));
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
    alert("Funcionalidade de exportação em desenvolvimento");
  };

  const handleCompartilhar = () => {
    alert("Funcionalidade de compartilhamento em desenvolvimento");
  };

  const handleGerarRelatorio = () => {
    alert("Funcionalidade de geração de relatório mensal em desenvolvimento");
  };

  return (
    <div className="flex w-full flex-col gap-6 overflow-x-hidden pb-10 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <header className="mb-2 flex flex-col gap-4 border-b border-border px-2 pb-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-foreground">Relatórios e Análises</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Consulte o histórico e métricas detalhadas de acessos</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1.5 rounded-xl"
            onClick={handleCompartilhar}
          >
            <Share2 size={14} />
            Compartilhar
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1.5 rounded-xl"
            onClick={handleExportarPDF}
          >
            <Download size={14} />
            Exportar PDF
          </Button>
          <Button 
            size="sm" 
            className="gap-1.5 rounded-xl bg-primary hover:bg-primary/90"
            onClick={handleGerarRelatorio}
          >
            <FileText size={14} />
            Gerar Relatório Mensal
          </Button>
        </div>
      </header>

      {/* FILTROS DE PESQUISA */}
      <FiltrosRelatorio />

      {/* TABS DE NAVEGAÇÃO INTERNA */}
      <div className="flex border-b border-border gap-6 px-2">
        <button 
          onClick={() => setActiveTab("geral")}
          className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === "geral" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          Visão Geral
          {activeTab === "geral" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
        </button>
        <button 
          onClick={() => setActiveTab("visitantes")}
          className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === "visitantes" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          Análise de Visitantes
          {activeTab === "visitantes" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
        </button>
        <button 
          onClick={() => setActiveTab("setores")}
          className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === "setores" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          Fluxo por Setor
          {activeTab === "setores" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
        </button>
      </div>

      {activeTab === "geral" && (
        <>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="animate-spin" size={32} />
              <p className="text-sm text-muted-foreground">Carregando relatórios...</p>
            </div>
          ) : (
            <>
              {/* STAT CARDS - MÉTRICAS DE PERÍODO */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Total de Visitas no Período"
                  value={stats.visitas.value}
                  icon={<Users size={17} className="text-primary" />}
                  delta={stats.visitas.delta}
                  deltaDir={stats.visitas.deltaDir}
                  sub={stats.visitas.sub}
                  accentVar="var(--primary)"
                />
                <StatCard
                  label="Taxa de Check-out"
                  value={stats.checkoutRate}
                  valueClassName="text-emerald-600 dark:text-emerald-400"
                  icon={<ArrowRightLeft size={17} className="text-emerald-600" />}
                  sub="Visitas com saída registrada"
                  accentVar="var(--chart-2)"
                />
                <StatCard
                  label="Tempo Médio de Estadia"
                  value={stats.permanencia.value}
                  valueClassName="text-sky-600 dark:text-sky-400"
                  icon={<Clock size={17} className="text-sky-600" />}
                  delta={stats.permanencia.delta}
                  deltaDir={stats.permanencia.deltaDir}
                  sub={stats.permanencia.sub}
                  accentVar="var(--chart-3)"
                />
                <StatCard
                  label="Incidentes / Alertas"
                  value={stats.alertas.value}
                  valueClassName="text-destructive"
                  icon={<AlertTriangle size={17} className="text-destructive" />}
                  sub={stats.alertas.sub}
                  accentVar="var(--destructive)"
                />
              </div>

              {/* GRÁFICOS ANALÍTICOS */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                  <EntradasChart
                    title="Histórico de Volume de Acessos"
                    subtitle="Comparativo diário no período selecionado"
                  />
                </div>
                <div>
                  <TiposVisitantesChart
                    title="Perfil dos Visitantes"
                    subtitle="Distribuição por categoria"
                  />
                </div>
              </div>

              {/* TABELA DE HISTÓRICO DETALHADO */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="font-bold text-lg text-foreground">Registros Detalhados</h3>
                  <Button variant="ghost" size="sm" className="text-primary text-xs">Ver todos os registros</Button>
                </div>
                <HistoricoVisitas data={historico} title="" />
              </div>

              {/* RANKINGS */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <SetoresMaisVisitados data={setoresMaisVisitados} />
                <EmpresasMaisVisitas data={empresasMaisVisitas} />
              </div>
            </>
          )}
        </>
      )}

      {activeTab === "visitantes" && (
        <div className="flex flex-col items-center justify-center py-20 bg-muted/10 rounded-3xl border border-dashed border-border">
          <Users size={48} className="text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-medium text-foreground">Análise de Visitantes</h3>
          <p className="text-sm text-muted-foreground">Módulo de análise comportamental em desenvolvimento.</p>
        </div>
      )}

      {activeTab === "setores" && (
        <div className="flex flex-col items-center justify-center py-20 bg-muted/10 rounded-3xl border border-dashed border-border">
          <ArrowRightLeft size={48} className="text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-medium text-foreground">Fluxo por Setor</h3>
          <p className="text-sm text-muted-foreground">Módulo de mapa de calor e fluxo em desenvolvimento.</p>
        </div>
      )}

    </div>
  );
}
