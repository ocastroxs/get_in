"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { TIPOS_VISITANTE } from "@/lib/mockData";

export default function TiposVisitantesChart({
  title = "Tipos de Visitante",
  subtitle = "Por período — hoje",
  data = TIPOS_VISITANTE,
  dataKey = "value",
  nameKey = "name",
  colorKey = "color"
}) {
  const total = data.reduce((s, v) => s + v[dataKey], 0);

  return (
    <div className="bg-card text-card-foreground rounded-xl border border-border p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div>
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>

      <div className="flex items-center gap-6 mt-2">
        <div className="relative shrink-0 transition-transform duration-500 hover:scale-105 cursor-pointer">
          <ResponsiveContainer width={130} height={130}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={46}
                outerRadius={60}
                dataKey={dataKey}
                startAngle={90}
                endAngle={-270}
                strokeWidth={3}
                stroke="var(--card)"
                paddingAngle={2}
                animationDuration={1500}
                animationEasing="ease-out"
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry[colorKey]} className="transition-all hover:opacity-80" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  fontWeight: "bold",
                  borderRadius: "12px",
                  border: "1px solid var(--border)",
                  background: "rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(8px)",
                  color: "var(--foreground)",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
                }}
                itemStyle={{ color: "var(--foreground)" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-foreground">{total}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">total</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 flex-1">
          {data.map((item, i) => (
            <div key={i} className="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-md shrink-0 shadow-sm"
                  style={{ backgroundColor: item[colorKey] }}
                />
                <span className="text-xs font-medium text-muted-foreground truncate">{item[nameKey]}</span>
              </div>
              <span className="text-xs font-bold text-foreground shrink-0 bg-muted px-2 py-0.5 rounded-md">{item[dataKey]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
