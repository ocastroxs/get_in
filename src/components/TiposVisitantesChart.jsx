"use client";

import { useMemo, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from "recharts";
import PeriodToggle from "@/components/ui/PeriodToggle";

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
            Distribuição
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
  subtitle = "Por período - dia",
  data = [],
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
    return view === "semana" ? "Por período - semana" : "Por período - dia";
  }, [showPeriodToggle, subtitle, view]);

  const chartSize = mobileLayout ? 168 : 220;

  return (
    <div className={`bg-card text-card-foreground rounded-[24px] border border-border flex flex-col shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 duration-300 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400 ${mobileLayout ? "gap-4 p-5" : "gap-4 p-5 min-h-[330px]"}`}>
      <div className="animate-in fade-in slide-in-from-left-4 duration-700 delay-500">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Distribuição</p>
            <h2 className={`${mobileLayout ? "text-xl" : "text-2xl"} font-semibold text-foreground`}>{title}</h2>
            <p className="text-sm text-muted-foreground">{displaySubtitle}</p>
          </div>

          {showPeriodToggle ? <PeriodToggle value={view} onChange={setView} /> : null}
        </div>
      </div>

      {isEmpty ? (
        <div className={`rounded-2xl border border-border/70 bg-muted/35 flex flex-col items-center justify-center ${mobileLayout ? "py-10" : "min-h-[220px] py-12"}`}>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">{emptyText}</p>
          </div>
        </div>
      ) : (
        <div
          className={`mt-1 rounded-2xl border border-border/70 bg-muted/35 p-4 ${
            mobileLayout
              ? "flex flex-col gap-4"
              : "grid min-h-[250px] flex-1 grid-cols-[240px_minmax(0,1fr)] items-center gap-7"
          }`}
        >
          <div className="relative mx-auto shrink-0 cursor-pointer transition-transform duration-500 hover:scale-[1.02]">
            <ResponsiveContainer width={chartSize} height={chartSize}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={mobileLayout ? 54 : 72}
                  outerRadius={mobileLayout ? 78 : 102}
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
              <span className={`${mobileLayout ? "text-2xl" : "text-3xl"} font-mono font-semibold text-foreground`}>{total}</span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">total</span>
            </div>
          </div>

          <div className={`grid min-w-0 content-center gap-3 ${mobileLayout ? "grid-cols-1" : "grid-cols-2"}`}>
            {chartData.map((item, index) => (
              <div
                key={index}
                className={`flex min-w-0 items-center justify-between rounded-xl border border-border/70 bg-background/70 hover:bg-background transition-all hover:translate-x-0.5 animate-in fade-in slide-in-from-right-2 duration-700 ${mobileLayout ? "w-full gap-2 p-3" : "w-full gap-3 px-3.5 py-3"}`}
                style={{ animationDelay: `${500 + index * 50}ms` }}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full shadow-sm"
                    style={{ backgroundColor: item[colorKey] }}
                  />
                  <span className={`min-w-0 truncate font-medium text-muted-foreground ${mobileLayout ? "text-xs" : "text-sm leading-tight"}`}>{item[nameKey]}</span>
                </div>
                <span className={`${mobileLayout ? "text-xs" : "text-xs"} ml-2 min-w-7 shrink-0 rounded-full bg-muted px-2 py-0.5 text-center font-bold text-foreground`}>{item[dataKey]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
