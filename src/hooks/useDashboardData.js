import { useEffect, useState } from "react";
import { api } from "@/services/api";

/**
 * Hook para gerenciar dados do dashboard com integração ao back-end
 * Consolida requisições, logs e visitantes locais em um único estado
 */
export function useDashboardData() {
  const [data, setData] = useState({
    requisicoes: [],
    visitantesLocal: [],
    logs: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setData((prev) => ({ ...prev, loading: true, error: null }));

        const [requisicoesResponse, portariaResponse, logsResponse] = await Promise.all([
          api.get("/requisicao-visitante"),
          api.get("/portaria/vlocal"),
          api.get("/logs"),
        ]);

        // Normalizando respostas do back-end
        const normalizarArray = (response, keys = []) => {
          if (Array.isArray(response?.data)) return response.data;
          if (Array.isArray(response?.dados)) return response.dados;
          for (const key of keys) {
            if (Array.isArray(response?.[key])) return response[key];
            if (Array.isArray(response?.data?.[key])) return response.data[key];
            if (Array.isArray(response?.dados?.[key])) return response.dados[key];
          }
          return [];
        };

        const requisicoes = normalizarArray(requisicoesResponse, ["requisicoes"]);
        const visitantesLocal = normalizarArray(portariaResponse, ["visitantes"]);
        const logs = normalizarArray(logsResponse, ["logs"]);

        setData({
          requisicoes,
          visitantesLocal,
          logs,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
        setData((prev) => ({
          ...prev,
          loading: false,
          error: error.message || "Erro ao carregar dados",
        }));
      }
    }

    fetchDashboardData();
  }, []);

  return data;
}
