"use client";

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

export default function StatusVisitantesChart({ mobileLayout = "default" }) {
  const ativos = STATUS_VISITANTES[0]?.value ?? 0;
  const compactMobile = mobileLayout === "list";
  const chartSize = 176;
  const mobileChartSize = 132;

  return (
    <div className={`bg-card text-card-foreground rounded-xl border border-border flex flex-col shadow-sm hover:shadow-md transition-all hover:-translate-y-1 duration-300 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 ${compactMobile ? "gap-4 p-4" : "gap-4 p-5 min-h-[320px]"}`}>
      <div className="animate-in fade-in slide-in-from-left-4 duration-700 delay-600">
        <h3 className={`${compactMobile ? "text-base" : "text-sm"} font-semibold text-foreground`}>Status dos Visitantes</h3>
        <p className="text-xs text-muted-foreground">Situacao atual - tempo real</p>
      </div>

      {compactMobile ? (
        <div className="flex flex-col gap-3">
          <div className="relative mx-auto shrink-0">
            <ResponsiveContainer width={mobileChartSize} height={mobileChartSize}>
              <PieChart>
                <Pie
                  data={STATUS_VISITANTES}
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
                  {STATUS_VISITANTES.map((entry, index) => (
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
              <span className="text-2xl font-bold text-foreground">{ativos}</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">ativos</span>
            </div>
          </div>

          {STATUS_VISITANTES.map((item, index) => (
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
                  data={STATUS_VISITANTES}
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
                  {STATUS_VISITANTES.map((entry, index) => (
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
              <span className="text-3xl font-bold text-foreground">{ativos}</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">ativos</span>
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-center gap-3">
            {STATUS_VISITANTES.map((item, index) => (
              <div
                key={item.name}
                className="flex items-center justify-between gap-3 rounded-lg p-2.5 hover:bg-muted/50 transition-all hover:translate-x-1 animate-in fade-in slide-in-from-right-2 duration-700"
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
