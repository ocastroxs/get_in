"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Topbar from "@/components/Topbar";
import { exportElementToPdf } from "@/lib/exportElementToPdf";

const DashboardTopbarContext = createContext(null);

const DEFAULT_CONFIGS = {
  "/dashboard": {
    title: "Dashboard Geral",
    subtitle: "Visao rapida do desempenho e atividades recentes",
  },
  "/dashboard/visitantes": {
    title: "Dashboard Visitantes",
    subtitle: "Visao geral de visitantes",
  },
  "/dashboard/relatorios": {
    title: "Relatorios",
    subtitle: "Relatorio detalhado do periodo selecionado",
  },
  "/dashboard/configuracoes": {
    title: "Configuracoes",
    subtitle: "Gerencie sua conta, seguranca e preferencias do sistema",
  },
  "/dashboard/funcionarios": {
    title: "Funcionarios",
    subtitle: "Gestao de colaboradores e niveis de acesso do sistema",
  },
  "/dashboard/checkin": {
    title: "Check-in / Check-out",
    subtitle: "Acompanhe entradas, saidas e pendencias do dia",
  },
  "/dashboard/empresas": {
    title: "Empresas Terceirizadas",
    subtitle: "Controle de empresas parceiras e visitantes vinculados",
  },
  "/dashboard/setores": {
    title: "Setores",
    subtitle: "Gerencie setores, acessos e fluxo interno",
  },
  "/dashboard/crachas": {
    title: "Dashboard Crachas",
    subtitle: "Gestao de inventario de crachas e status de TAGs",
  },
  "/dashboard/permissao": {
    title: "Permissoes",
    subtitle: "Determine os acessos de cada perfil",
  },
  "/dashboard/circulacao": {
    title: "Circulacao Interna",
    subtitle: "Monitoramento de fluxo e ocupacao em tempo real",
  },
};

function formatSegment(segment) {
  return segment
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getDefaultConfig(pathname) {
  if (DEFAULT_CONFIGS[pathname]) {
    return DEFAULT_CONFIGS[pathname];
  }

  const segment = pathname?.split("/").filter(Boolean).pop() ?? "dashboard";
  return {
    title: formatSegment(segment),
    subtitle: "Resumo da pagina atual",
  };
}

export function DashboardTopbarProvider({ children }) {
  const pathname = usePathname();
  const [pageConfig, setPageConfig] = useState(null);

  const defaultConfig = useMemo(() => getDefaultConfig(pathname), [pathname]);
  const mergedConfig = useMemo(
    () => ({
      ...defaultConfig,
      ...(pageConfig ?? {}),
    }),
    [defaultConfig, pageConfig]
  );

  const onExport = mergedConfig.hideExport
    ? null
    : () => {
        const target = document.querySelector("[data-dashboard-export-root='true']");
        exportElementToPdf(target, mergedConfig.title);
      };

  const value = useMemo(
    () => ({
      setTopbarConfig: setPageConfig,
    }),
    []
  );

  return (
    <DashboardTopbarContext.Provider value={value}>
      <Topbar
        title={mergedConfig.title}
        subtitle={mergedConfig.subtitle}
        primaryActionLabel={mergedConfig.primaryActionLabel}
        onPrimaryAction={mergedConfig.onPrimaryAction}
        onExport={onExport}
      />
      {children}
    </DashboardTopbarContext.Provider>
  );
}

export function useDashboardTopbar(config) {
  const context = useContext(DashboardTopbarContext);

  useEffect(() => {
    if (!context) {
      return undefined;
    }

    context.setTopbarConfig(config ?? null);

    return () => {
      context.setTopbarConfig(null);
    };
  }, [context, config]);
}
