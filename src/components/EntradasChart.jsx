"use client";

import { getActiveLanguage } from "@/lib/i18n-core";
import { useMemo, useState } from "react";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { ENTRADAS_POR_HORA } from "@/lib/mockData";

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
const DATA_BR_RE = /^\d{2}\/\d{2}$/;

function formatarDiaMes(data) {
  return new Intl.DateTimeFormat(getActiveLanguage(), {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(data);
}

function normalizarSemanaBrasileira(items) {
  const hoje = new Date();
  const total = items.length || 7;

  return items.map((item, index) => {
    if (DATA_BR_RE.test(String(item.hora ?? ""))) {
      return item;
    }

    const data = new Date(hoje);
    data.setDate(hoje.getDate() - (total - 1 - index));

    return {
      ...item,
      hora: formatarDiaMes(data),
      diaSemana: item.diaSemana || item.hora || DIAS_SEMANA[data.getDay()],
    };
  });
}

export default function EntradasChart({
  title = "Entradas por Periodo",
  subtitle = "Fluxo registrado ao longo do dia",
  data = ENTRADAS_POR_HORA,
  weekData = data,
  monthData = weekData,
  dataKey = "value",
  nameKey = "hora",
  barColor = "var(--primary)",
  mobileLayout = false,
  showPeriodToggle = true,
  emptyMessage,
}) {
  const [view, setView] = useState("hoje");
  const chartData = useMemo(() => {
    if (!showPeriodToggle) return data;
    if (view === "mes") return monthData;
    if (view === "semana") return normalizarSemanaBrasileira(weekData);
    return data;
  }, [data, monthData, showPeriodToggle, view, weekData]);
  const xTickInterval =
    !showPeriodToggle
      ? (mobileLayout ? 3 : 1)
      : view === "hoje"
        ? (mobileLayout ? 3 : 1)
        : view === "mes"
          ? (mobileLayout ? 6 : 3)
          : 0;
  const height = mobileLayout ? 220 : 280;

  const chartMeta = useMemo(() => {
    const values = chartData.map((item) => item[dataKey]);
    const peakValue = Math.max(...values, 0);
    const peakItem = chartData.find((item) => item[dataKey] === peakValue);
    const total = values.reduce((sum, value) => sum + value, 0);
    const previous = chartData[Math.max(values.indexOf(peakValue) - 1, 0)]?.[dataKey] ?? peakValue;
    const deltaPct = previous > 0 ? Math.round(((peakValue - previous) / previous) * 100) : 0;

    return {
      peakItem: total > 0 ? peakItem : null,
      total,
      deltaPct,
    };
  }, [chartData, dataKey]);

  const hasUsableData = chartData.length > 0 && chartMeta.total > 0;
  const peakLabel = chartMeta.peakItem
    ? view === "semana" && chartMeta.peakItem.diaSemana
      ? `${chartMeta.peakItem[nameKey]} ${chartMeta.peakItem.diaSemana}`
      : chartMeta.peakItem[nameKey]
    : "--";

  return (
    <section className="rounded-[24px] border border-border bg-card p-5 text-card-foreground shadow-md transition-all duration-300 hover:shadow-lg animate-in fade-in slide-in-from-bottom-4">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Painel Principal</p>
          <h2 className={`${mobileLayout ? "text-xl" : "text-2xl"} font-semibold text-foreground`}>{title}</h2>
          <p className="max-w-xl text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          <div className="min-w-[112px] rounded-xl border border-primary/10 bg-primary/[0.035] px-3 py-2 shadow-sm shadow-slate-200/30 sm:w-auto">
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-primary/70">Pico</p>
            <p className="mt-0.5 flex items-baseline gap-1.5 font-mono text-lg font-semibold text-foreground">
              {chartMeta.peakItem?.[dataKey] ?? 0}
              <span className="font-sans text-[11px] font-semibold text-muted-foreground">{peakLabel}</span>
            </p>
          </div>

          {showPeriodToggle ? (
          <div className="grid w-full grid-cols-3 rounded-xl border border-border bg-muted/50 p-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground shadow-sm shadow-slate-200/30 sm:flex sm:w-fit">
            {["hoje", "semana", "mes"].map((item) => (
              <button
                key={item}
                onClick={() => setView(item)}
                className={[
                  "w-full rounded-lg px-2.5 py-1.5 text-center transition-all duration-300 sm:w-auto sm:text-left",
                  view === item
                    ? "bg-card text-foreground shadow-sm shadow-slate-200/50"
                    : "hover:bg-white/80 hover:text-foreground",
                ].join(" ")}
              >
                {item === "mes" ? "mês" : item}
              </button>
            ))}
          </div>
          ) : null}
        </div>
      </div>

      {!hasUsableData ? (
        <div style={{ height }} className="flex flex-col items-center justify-center gap-3 text-center animate-in fade-in duration-500">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/80 text-muted-foreground/60 shadow-inner">
            <BarChart3 size={24} />
          </div>
          <div className="space-y-1 px-4">
            <h3 className="text-sm font-semibold text-foreground">Sem dados de fluxo</h3>
            <p className="text-xs text-muted-foreground max-w-[280px] mx-auto leading-relaxed">
              {emptyMessage || `Nao foram registradas entradas de visitantes para o periodo selecionado (${view === "hoje" ? "hoje" : view === "semana" ? "esta semana" : "este mes"}).`}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div style={{ height }} className="w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 12, right: 12, bottom: 8, left: -10 }}>
                <defs>
                  <linearGradient id="entradasGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.96" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.68" />
                  </linearGradient>
                  <linearGradient id="entradasPeakGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--secondary)" stopOpacity="0.94" />
                    <stop offset="100%" stopColor="var(--secondary)" stopOpacity="0.70" />
                  </linearGradient>
                </defs>

                <CartesianGrid vertical={false} stroke="rgba(15,58,125,0.08)" />
                <XAxis
                  dataKey={nameKey}
                  interval={xTickInterval}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)", fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  dy={8}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)", fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  width={30}
                />
                <Tooltip
                  cursor={{ fill: "rgba(15,58,125,0.035)" }}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "1px solid var(--border)",
                    background: "rgba(255,255,255,0.96)",
                    boxShadow: "0 12px 28px rgba(15, 58, 125, 0.10)",
                  }}
                />
                <Bar dataKey={dataKey} radius={[10, 10, 0, 0]} maxBarSize={view === "hoje" || view === "mes" ? (mobileLayout ? 18 : 24) : mobileLayout ? 32 : 42}>
                  {chartData.map((entry, index) => {
                    const isPeak = entry[dataKey] === chartMeta.peakItem?.[dataKey];
                    return (
                      <Cell
                        key={`bar-${entry[nameKey]}-${index}`}
                        fill={isPeak ? "url(#entradasPeakGradient)" : "url(#entradasGradient)"}
                      />
                    );
                  })}
                </Bar>
                <Line
                  type="monotone"
                  dataKey={dataKey}
                  stroke={barColor}
                  strokeOpacity={0.32}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 3, fill: "var(--card)", stroke: barColor, strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-5 grid gap-3 border-t border-border pt-4 md:grid-cols-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Insight automatico</p>
              <p className="mt-1 text-sm text-foreground">
                Pico as <span className="font-semibold">{peakLabel}</span> com{" "}
                <span className="font-semibold">{chartMeta.peakItem?.[dataKey] ?? 0} visitantes</span>.
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {showPeriodToggle ? "Comparativo" : "Historico"}
              </p>
              {showPeriodToggle ? (
                <p className="mt-1 text-sm text-foreground">
                  Variacao de <span className="font-semibold">{chartMeta.deltaPct}%</span> em relacao ao intervalo anterior,
                  com <span className="font-semibold">{chartMeta.total} registros</span> no periodo.
                </p>
              ) : (
                <p className="mt-1 text-sm text-foreground">
                  Total de <span className="font-semibold">{chartMeta.total} registros</span> no historico carregado.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
