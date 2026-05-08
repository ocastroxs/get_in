"use client";

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
import { ENTRADAS_POR_HORA } from "@/lib/mockData";

export default function EntradasChart({
  title = "Entradas por Periodo",
  subtitle = "Fluxo registrado ao longo do dia",
  data = ENTRADAS_POR_HORA,
  dataKey = "value",
  nameKey = "hora",
  barColor = "var(--primary)",
  activeBarColor = "var(--secondary)",
  mobileLayout = false,
}) {
  const [view, setView] = useState("hoje");
  const chartData = mobileLayout ? data.slice(0, 8) : data.slice(0, 9);
  const height = mobileLayout ? 220 : 280;

  const chartMeta = useMemo(() => {
    const values = chartData.map((item) => item[dataKey]);
    const peakValue = Math.max(...values);
    const peakItem = chartData.find((item) => item[dataKey] === peakValue);
    const total = values.reduce((sum, value) => sum + value, 0);
    const previous = chartData[Math.max(values.indexOf(peakValue) - 1, 0)]?.[dataKey] ?? peakValue;
    const deltaPct = previous > 0 ? Math.round(((peakValue - previous) / previous) * 100) : 0;

    return {
      peakItem,
      total,
      deltaPct,
    };
  }, [chartData, dataKey]);

  return (
    <section className="rounded-[24px] border border-border bg-card p-5 text-card-foreground shadow-md transition-all duration-300 hover:shadow-lg animate-in fade-in slide-in-from-bottom-4">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Painel Principal</p>
          <h2 className={`${mobileLayout ? "text-xl" : "text-2xl"} font-semibold text-foreground`}>{title}</h2>
          <p className="max-w-xl text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-border bg-muted/60 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Pico do periodo</p>
            <p className="mt-1 font-mono text-xl font-semibold text-foreground">
              {chartMeta.peakItem?.[dataKey] ?? 0}
              <span className="ml-2 text-sm font-sans text-muted-foreground">{chartMeta.peakItem?.[nameKey] ?? "--"}</span>
            </p>
          </div>

          <div className="flex rounded-xl border border-border bg-muted/60 p-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {["hoje", "semana"].map((item) => (
              <button
                key={item}
                onClick={() => setView(item)}
                className={[
                  "rounded-lg px-3 py-2 transition-colors",
                  view === item ? "bg-card text-foreground shadow-sm" : "hover:text-foreground",
                ].join(" ")}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

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
              cursor={{ fill: "rgba(15,58,125,0.06)" }}
              contentStyle={{
                borderRadius: "16px",
                border: "1px solid var(--border)",
                background: "rgba(255,255,255,0.96)",
                boxShadow: "0 2px 8px rgba(15, 58, 125, 0.10)",
              }}
            />
            <Bar dataKey={dataKey} radius={[10, 10, 0, 0]} maxBarSize={mobileLayout ? 32 : 42}>
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
              strokeOpacity={0.35}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: barColor, stroke: "var(--card)", strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-5 grid gap-3 border-t border-border pt-4 md:grid-cols-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Insight automatico</p>
          <p className="mt-1 text-sm text-foreground">
            Pico as <span className="font-semibold">{chartMeta.peakItem?.[nameKey] ?? "--"}</span> com{" "}
            <span className="font-semibold">{chartMeta.peakItem?.[dataKey] ?? 0} visitantes</span>.
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Comparativo</p>
          <p className="mt-1 text-sm text-foreground">
            Variacao de <span className="font-semibold">{chartMeta.deltaPct}%</span> em relacao ao intervalo anterior,
            com <span className="font-semibold">{chartMeta.total} registros</span> no periodo.
          </p>
        </div>
      </div>
    </section>
  );
}
