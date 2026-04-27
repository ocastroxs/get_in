"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { TIPOS_VISITANTE } from "@/lib/mockData";

function PieTooltip({ active, payload }) {
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

export default function TiposVisitantesChart({
  title = "Tipos de Visitante",
  subtitle = "Por periodo - hoje",
  data = TIPOS_VISITANTE,
  dataKey = "value",
  nameKey = "name",
  colorKey = "color",
  mobileLayout = false,
}) {
  const total = data.reduce((sum, item) => sum + item[dataKey], 0);
  const chartSize = mobileLayout ? 112 : 156;

  return (
    <div className={`bg-card text-card-foreground rounded-xl border border-border flex flex-col shadow-sm hover:shadow-md transition-all hover:-translate-y-1 duration-300 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400 ${mobileLayout ? "gap-3 p-4" : "gap-3 p-4 min-h-[280px]"}`}>
      <div className="animate-in fade-in slide-in-from-left-4 duration-700 delay-500">
        <h3 className={`${mobileLayout ? "text-base" : "text-sm"} font-bold text-foreground`}>{title}</h3>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>

      <div className={`mt-1 flex ${mobileLayout ? "flex-col gap-4" : "flex-1 items-center gap-6"}`}>
        <div className="relative shrink-0 self-center cursor-pointer transition-transform duration-500 hover:scale-105">
          <ResponsiveContainer width={chartSize} height={chartSize}>
            <PieChart>
              <Pie
                data={data}
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
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry[colorKey]} className="transition-all hover:opacity-80" />
                ))}
              </Pie>
              <Tooltip
                content={<PieTooltip />}
                wrapperStyle={{ outline: "none", zIndex: 20 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className={`${mobileLayout ? "text-xl" : "text-2xl"} font-bold text-foreground`}>{total}</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">total</span>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-center gap-2.5 pr-1">
          {data.map((item, index) => (
            <div
              key={index}
              className={`grid items-center rounded-lg hover:bg-muted/50 transition-all hover:translate-x-1 animate-in fade-in slide-in-from-right-2 duration-700 ${mobileLayout ? "grid-cols-[1fr_auto] gap-2 p-2" : "grid-cols-[minmax(0,1fr)_40px] gap-3 px-2 py-1.5"}`}
              style={{ animationDelay: `${500 + index * 50}ms` }}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className="h-3 w-3 shrink-0 rounded-full shadow-sm"
                  style={{ backgroundColor: item[colorKey] }}
                />
                <span className={`truncate font-medium text-muted-foreground ${mobileLayout ? "text-[11px]" : "text-[15px] leading-tight"}`}>{item[nameKey]}</span>
              </div>
              <span className={`${mobileLayout ? "text-[11px]" : "text-xs"} justify-self-end shrink-0 rounded-full bg-muted px-2 py-0.5 text-center font-bold text-foreground`}>{item[dataKey]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
