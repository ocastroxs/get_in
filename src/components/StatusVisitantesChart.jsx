"use client";

import { useMemo, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { STATUS_VISITANTES } from "@/lib/mockData";

function StatusPieTooltip({ active, payload }) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0]?.payload;
  if (!item) {
    return null;
  }

  return (
    <div className="min-w-[132px] rounded-xl border border-border bg-white/95 px-3 py-2 shadow-lg backdrop-blur-sm">
      <p className="text-xs font-semibold text-foreground">{item.name}</p>
      <p className="mt-1 text-xs font-bold" style={{ color: item.color }}>
        Total: {item.value}
      </p>
    </div>
  );
}

export default function StatusVisitantesChart({ 
  mobileLayout = "default",
  data = STATUS_VISITANTES,
  weekData = STATUS_VISITANTES
}) {
  const [view, setView] = useState("hoje");

  // Select data based on view
  const chartData = useMemo(() => {
    return view === "semana" ? weekData : data;
  }, [data, weekData, view]);

  // "Ativos" is usually the first item (Dentro da fábrica)
  const ativos = useMemo(() => {
    const itemAtivo = chartData.find(item => item.name.toLowerCase().includes("dentro") || item.name.toLowerCase().includes("ativo"));
    return itemAtivo?.value ?? 0;
  }, [chartData]);

  const compactMobile = mobileLayout === "list";
  const chartSize = 176;
  const mobileChartSize = 132;

  return (
    <div className={`bg-card text-card-foreground rounded-[24px] border border-border flex flex-col shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 duration-300 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 ${compactMobile ? "gap-4 p-5" : "gap-4 p-5 min-h-[320px]"}`}>
      <div className="animate-in fade-in slide-in-from-left-4 duration-700 delay-600">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Semantica</p>
            <h3 className={`${compactMobile ? "text-xl" : "text-2xl"} font-semibold text-foreground`}>Status dos Visitantes</h3>
            <p className="text-sm text-muted-foreground">Situacao atual com leitura imediata de risco e permanencia.</p>
          </div>

          <div className="flex rounded-xl border border-border bg-muted/50 p-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground shadow-sm shadow-slate-200/30">
            {["hoje", "semana"].map((item) => (
              <button
                key={item}
                onClick={() => setView(item)}
                className={[
                  "rounded-lg px-2.5 py-1.5 transition-all duration-300",
                  view === item
                    ? "bg-card text-foreground shadow-sm shadow-slate-200/50"
                    : "hover:bg-white/80 hover:text-foreground",
                ].join(" ")}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {compactMobile ? (
        <div className="flex flex-col gap-3">
          <div className="relative mx-auto shrink-0">
            <ResponsiveContainer width={mobileChartSize} height={mobileChartSize}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={58}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  strokeWidth={3}
                  stroke="var(--card)"
                  paddingAngle={2}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={<StatusPieTooltip />}
                  wrapperStyle={{ outline: "none", zIndex: 20 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-2xl font-semibold text-foreground">{ativos}</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">ativos</span>
            </div>
          </div>

          {chartData.map((item, index) => (
            <div
              key={item.name}
              className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/70 px-3 py-3 animate-in fade-in slide-in-from-right-2 duration-700"
              style={{ animationDelay: `${600 + index * 50}ms` }}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate text-sm text-foreground">{item.name}</span>
              </div>
              <span className="shrink-0 text-base font-semibold text-foreground">{item.value}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center gap-8">
          <div className="relative shrink-0">
            <ResponsiveContainer width={chartSize} height={chartSize}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={56}
                  outerRadius={80}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  strokeWidth={3}
                  stroke="var(--card)"
                  paddingAngle={2}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={<StatusPieTooltip />}
                  wrapperStyle={{ outline: "none", zIndex: 20 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-3xl font-semibold text-foreground">{ativos}</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">ativos</span>
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-center gap-3">
            {chartData.map((item, index) => (
              <div
                key={item.name}
                className="flex items-center justify-between gap-3 rounded-xl p-2.5 hover:bg-muted/50 transition-all hover:translate-x-0.5 animate-in fade-in slide-in-from-right-2 duration-700"
                style={{ animationDelay: `${600 + index * 50}ms` }}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="truncate text-sm text-muted-foreground">{item.name}</span>
                </div>
                <span className="shrink-0 text-sm font-semibold text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
