"use client";

import { useMemo, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from "recharts";
import { STATUS_VISITANTES } from "@/lib/mockData";

function renderActiveSector(props) {
  const outerRadius = Number(props.outerRadius) || 0;

  return (
    <Sector
      {...props}
      outerRadius={outerRadius + 3}
      stroke="var(--card)"
      strokeWidth={4}
      fillOpacity={1}
    />
  );
}

function StatusPieTooltip({ active, payload, total, peakItem }) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0]?.payload;
  if (!item) {
    return null;
  }

  const value = Number(item.value) || 0;
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  const color = item.color || "var(--primary)";
  const isPeak = peakItem && item.name === peakItem.name && value === (Number(peakItem.value) || 0);

  return (
    <div className="min-w-[184px] rounded-xl border border-border bg-card/95 px-3 py-2.5 text-card-foreground shadow-lg shadow-slate-900/10 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
            <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
          </div>
          <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Status
          </p>
        </div>
        {isPeak ? (
          <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-primary">
            Maior grupo
          </span>
        ) : null}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border/70 pt-2.5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Total</p>
          <p className="mt-0.5 font-mono text-base font-semibold text-foreground">{value}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Do total</p>
          <p className="mt-0.5 font-mono text-base font-semibold text-foreground">{percent}%</p>
        </div>
      </div>
    </div>
  );
}

export default function StatusVisitantesChart({ 
  mobileLayout = "default",
  data = STATUS_VISITANTES,
  weekData = STATUS_VISITANTES,
  monthData = STATUS_VISITANTES,
  title = "Status dos Visitantes",
  subtitle = "Situacao atual com leitura imediata de risco e permanencia.",
  showPeriodToggle = true
}) {
  const [view, setView] = useState("hoje");

  // Select data based on view
  const chartData = useMemo(() => {
    if (!showPeriodToggle) return data;
    if (view === "mes") return monthData;
    return view === "semana" ? weekData : data;
  }, [data, monthData, showPeriodToggle, weekData, view]);

  const total = useMemo(() => {
    return chartData.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  }, [chartData]);

  const peakItem = useMemo(() => {
    return chartData.reduce((current, item) => {
      if (!current) return item;
      return (Number(item.value) || 0) > (Number(current.value) || 0) ? item : current;
    }, null);
  }, [chartData]);

  const compactMobile = mobileLayout === "list";
  const chartSize = 176;
  const mobileChartSize = 132;

  return (
    <div className={`bg-card text-card-foreground rounded-[24px] border border-border flex flex-col shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 duration-300 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 ${compactMobile ? "gap-4 p-5" : "gap-4 p-5 min-h-[320px]"}`}>
      <div className="animate-in fade-in slide-in-from-left-4 duration-700 delay-600">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Status</p>
            <h3 className={`${compactMobile ? "text-xl" : "text-2xl"} font-semibold text-foreground`}>{title}</h3>
            <p className="max-w-[280px] text-sm text-muted-foreground">{subtitle}</p>
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
                  animationDuration={1500}
                  animationEasing="ease-out"
                  activeShape={renderActiveSector}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={<StatusPieTooltip total={total} peakItem={peakItem} />}
                  wrapperStyle={{ outline: "none", zIndex: 20 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-2xl font-semibold text-foreground">{total}</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">total</span>
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
                  animationDuration={1500}
                  animationEasing="ease-out"
                  activeShape={renderActiveSector}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={<StatusPieTooltip total={total} peakItem={peakItem} />}
                  wrapperStyle={{ outline: "none", zIndex: 20 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-3xl font-semibold text-foreground">{total}</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">total</span>
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-center gap-3 max-w-[280px]">
            {chartData.map((item, index) => (
              <div
                key={item.name}
                className="flex w-fit max-w-full items-center gap-3 rounded-xl p-2.5 hover:bg-muted/50 transition-all hover:translate-x-0.5 animate-in fade-in slide-in-from-right-2 duration-700"
                style={{ animationDelay: `${600 + index * 50}ms` }}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="truncate text-sm text-muted-foreground">{item.name}</span>
                </div>
                <span className="min-w-6 shrink-0 text-right text-sm font-semibold text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
