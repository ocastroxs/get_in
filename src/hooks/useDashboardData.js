import { useState } from "react";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { dashboardService } from "@/services/dashboardService";

/**
 * Hook para gerenciar dados do dashboard com integração ao back-end
 * Utiliza o serviço centralizado de dashboard
 */
export function useDashboardData() {
  const [data, setData] = useState({
    stats: null,
    alertas: [],
    entradasHoje: [],
    entradasSemana: [],
    entradasMes: [],
    requisicoes: [],
    visitantesLocal: [],
    logs: [],
    loading: true,
    error: null,
  });

  async function fetchDashboardData({ silent = false } = {}) {
    try {
      if (!silent) {
        setData((prev) => ({ ...prev, loading: true, error: null }));
      }

      const resultado = await dashboardService.carregarDados();

      if (resultado.sucesso) {
        setData({
          stats: resultado.stats,
          alertas: resultado.alertas,
          entradasHoje: resultado.entradasHoje,
          entradasSemana: resultado.entradasSemana,
          entradasMes: resultado.entradasMes,
          requisicoes: resultado.requisicoes,
          visitantesLocal: resultado.visitantesLocal,
          logs: resultado.logs,
          loading: false,
          error: null,
        });
      } else {
        throw new Error(resultado.erro || "Erro ao carregar dados");
      }
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
      setData((prev) => ({
        ...prev,
        loading: false,
        error: error.message || "Erro ao carregar dados",
      }));
    }
  }

  useAutoRefresh(fetchDashboardData);

  return data;
}
