"use client";

import { useMemo, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from "recharts";
import { STATUS_VISITANTES } from "@/lib/mockData";
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
  subtitle = "Situação atual com leitura imediata de risco e permanência.",
  showPeriodToggle = true
}) {
  const [view, setView] = useState("mes");

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
  const chartSize = 220;
  const mobileChartSize = 168;
  const currentChartSize = compactMobile ? mobileChartSize : chartSize;
  const innerRadius = compactMobile ? 54 : 72;
  const outerRadius = compactMobile ? 78 : 102;

  return (
    <div className={`bg-card text-card-foreground rounded-[24px] border border-border flex flex-col shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 duration-300 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 ${compactMobile ? "gap-4 p-5" : "gap-4 p-5 min-h-[320px]"}`}>
      <div className="animate-in fade-in slide-in-from-left-4 duration-700 delay-600">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Status</p>
            <h3 className={`${compactMobile ? "text-xl" : "text-2xl"} font-semibold text-foreground`}>{title}</h3>
            <p className="max-w-[280px] text-sm text-muted-foreground">{subtitle}</p>
          </div>

          {showPeriodToggle ? <PeriodToggle value={view} onChange={setView} /> : null}
        </div>
      </div>

      <div
        className={`rounded-2xl border border-border/70 bg-muted/35 p-4 ${
          compactMobile
            ? "flex flex-col gap-4"
            : "grid flex-1 grid-cols-[minmax(220px,260px)_minmax(0,1fr)] items-center gap-5"
        }`}
      >
        <div className="relative mx-auto shrink-0">
          <ResponsiveContainer width={currentChartSize} height={currentChartSize}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={innerRadius}
                outerRadius={outerRadius}
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
            <span className={`${compactMobile ? "text-2xl" : "text-3xl"} font-mono font-semibold text-foreground`}>{total}</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">total</span>
          </div>
        </div>

        <div className={`grid min-w-0 content-center gap-2.5 ${compactMobile ? "grid-cols-1" : "grid-cols-[repeat(auto-fit,minmax(170px,1fr))]"}`}>
          {chartData.map((item, index) => (
            <div
              key={item.name}
              className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/70 px-3 py-3 hover:bg-background transition-all hover:translate-x-0.5 animate-in fade-in slide-in-from-right-2 duration-700"
              style={{ animationDelay: `${600 + index * 50}ms` }}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="min-w-0 truncate text-sm text-muted-foreground">{item.name}</span>
              </div>
              <span className="ml-2 min-w-7 shrink-0 rounded-full bg-muted px-2 py-0.5 text-center text-xs font-bold text-foreground">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
