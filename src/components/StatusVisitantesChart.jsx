"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { STATUS_VISITANTES } from "@/lib/mockData";

export default function StatusVisitantesChart() {
  const ativos = STATUS_VISITANTES.find((s) => s.name === "Dentro da fábrica")?.value ?? 0;

  return (
    <div className="bg-card text-card-foreground rounded-xl border border-border p-5 flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Status dos Visitantes</h3>
        <p className="text-xs text-muted-foreground">Situação atual — tempo real</p>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative shrink-0">
          <ResponsiveContainer width={130} height={130}>
            <PieChart>
              <Pie
                data={STATUS_VISITANTES}
                cx="50%"
                cy="50%"
                innerRadius={42}
                outerRadius={60}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                strokeWidth={2}
                stroke="var(--card)"
              >
                {STATUS_VISITANTES.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)",
                  background: "var(--popover)",
                  color: "var(--popover-foreground)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-foreground">{ativos}</span>
            <span className="text-[10px] text-muted-foreground">ativos</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 flex-1">
          {STATUS_VISITANTES.map((item) => (
            <div key={item.name} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-muted-foreground truncate">{item.name}</span>
              </div>
              <span className="text-xs font-semibold text-foreground shrink-0">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
