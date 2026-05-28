"use client";

import { useMemo, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from "recharts";
import { TIPOS_VISITANTE } from "@/lib/mockData";

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

function PieTooltip({ active, payload, dataKey, nameKey, colorKey, total, peakItem }) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0]?.payload;
  if (!item) {
    return null;
  }

  const value = Number(item[dataKey]) || 0;
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  const color = item[colorKey] || "var(--primary)";
  const isPeak = peakItem && item[nameKey] === peakItem[nameKey] && value === (Number(peakItem[dataKey]) || 0);

  return (
    <div className="min-w-[180px] rounded-xl border border-border bg-card/95 px-3 py-2.5 text-card-foreground shadow-lg shadow-slate-900/10 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
            <p className="truncate text-sm font-semibold text-foreground">{item[nameKey]}</p>
          </div>
          <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Distribuicao
          </p>
        </div>
        {isPeak ? (
          <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-primary">
            Principal
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

export default function TiposVisitantesChart({
  title = "Motivos",
  subtitle = "Por período - hoje",
  data = TIPOS_VISITANTE,
  weekData = data,
  monthData = data,
  emptyMessage = "Nenhum motivo registrado hoje.",
  weekEmptyMessage = "Nenhum motivo registrado na semana.",
  monthEmptyMessage = "Nenhum motivo registrado no mês.",
  dataKey = "value",
  nameKey = "name",
  colorKey = "color",
  mobileLayout = false,
  showPeriodToggle = true,
}) {
  const [view, setView] = useState("hoje");

  const chartData = useMemo(() => {
    if (!showPeriodToggle) return data;
    if (view === "mes") return monthData;
    return view === "semana" ? weekData : data;
  }, [data, weekData, monthData, showPeriodToggle, view]);

  const total = useMemo(() => {
    return chartData.reduce((sum, item) => sum + (Number(item[dataKey]) || 0), 0);
  }, [chartData, dataKey]);

  const peakItem = useMemo(() => {
    return chartData.reduce((current, item) => {
      if (!current) return item;
      return (Number(item[dataKey]) || 0) > (Number(current[dataKey]) || 0) ? item : current;
    }, null);
  }, [chartData, dataKey]);

  const isEmpty = chartData.length === 0;
  
  const emptyText = useMemo(() => {
    if (!showPeriodToggle) return emptyMessage;
    if (view === "mes") return monthEmptyMessage;
    return view === "semana" ? weekEmptyMessage : emptyMessage;
  }, [view, monthEmptyMessage, showPeriodToggle, weekEmptyMessage, emptyMessage]);

  const displaySubtitle = useMemo(() => {
    if (!showPeriodToggle) return subtitle;
    if (view === "mes") return "Por período - mês";
    return view === "semana" ? "Por período - semana" : "Por período - hoje";
  }, [showPeriodToggle, subtitle, view]);

  const chartSize = mobileLayout ? 112 : 156;

  return (
    <div className={`bg-card text-card-foreground rounded-[24px] border border-border flex flex-col shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 duration-300 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400 ${mobileLayout ? "gap-4 p-5" : "gap-4 p-5 min-h-[280px]"}`}>
      <div className="animate-in fade-in slide-in-from-left-4 duration-700 delay-500">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Distribuição</p>
            <h2 className={`${mobileLayout ? "text-xl" : "text-2xl"} font-semibold text-foreground`}>{title}</h2>
            <p className="text-sm text-muted-foreground">{displaySubtitle}</p>
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

      {isEmpty ? (
        <div className={`flex flex-col items-center justify-center ${mobileLayout ? "py-8" : "py-12"}`}>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">{emptyText}</p>
          </div>
        </div>
      ) : (
        <div className={`mt-1 flex ${mobileLayout ? "flex-col gap-4" : "flex-1 items-center gap-6"}`}>
          <div className="relative shrink-0 self-center cursor-pointer transition-transform duration-500 hover:scale-105">
            <ResponsiveContainer width={chartSize} height={chartSize}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={mobileLayout ? 38 : 50}
                  outerRadius={mobileLayout ? 52 : 70}
                  dataKey={dataKey}
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
                    <Cell key={index} fill={entry[colorKey]} className="transition-all hover:opacity-80" />
                  ))}
                </Pie>
                <Tooltip
                  content={
                    <PieTooltip
                      dataKey={dataKey}
                      nameKey={nameKey}
                      colorKey={colorKey}
                      total={total}
                      peakItem={peakItem}
                    />
                  }
                  wrapperStyle={{ outline: "none", zIndex: 20 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className={`${mobileLayout ? "text-xl" : "text-2xl"} font-mono font-semibold text-foreground`}>{total}</span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">total</span>
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-center gap-2.5 pr-1 max-w-[280px]">
            {chartData.map((item, index) => (
              <div
                key={index}
                className={`flex w-fit max-w-full items-center rounded-xl hover:bg-muted/50 transition-all hover:translate-x-0.5 animate-in fade-in slide-in-from-right-2 duration-700 ${mobileLayout ? "gap-2 p-2.5" : "gap-3 px-2.5 py-2"}`}
                style={{ animationDelay: `${500 + index * 50}ms` }}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full shadow-sm"
                    style={{ backgroundColor: item[colorKey] }}
                  />
                  <span className={`truncate font-medium text-muted-foreground ${mobileLayout ? "text-[11px]" : "text-[15px] leading-tight"}`}>{item[nameKey]}</span>
                </div>
                <span className={`${mobileLayout ? "text-[11px]" : "text-xs"} min-w-6 shrink-0 rounded-full bg-muted px-2 py-0.5 text-center font-bold text-foreground`}>{item[dataKey]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
