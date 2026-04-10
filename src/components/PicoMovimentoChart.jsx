"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { PICO_MOVIMENTO } from "@/lib/mockData";

export default function PicoMovimentoChart() {
  return (
    <div className="bg-card text-card-foreground rounded-xl border border-border p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Pico de Movimento</h3>
          <p className="text-xs text-muted-foreground">Entradas e saídas por hora</p>
        </div>
      </div>

      <div className="w-full" style={{ minWidth: '300px', height: '160px' }}>
        <ResponsiveContainer width={400} height={160}>
          <BarChart
            data={PICO_MOVIMENTO}
            barSize={28}
            margin={{ top: 0, right: 0, bottom: 0, left: -24 }}
          >
          <XAxis
            dataKey="hora"
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
              background: "var(--popover)",
              color: "var(--popover-foreground)",
            }}
            cursor={{ fill: "var(--muted)" }}
          />
          <Bar dataKey="value" name="Movimento" radius={[4, 4, 0, 0]}>
            {PICO_MOVIMENTO.map((entry) => (
              <Cell
                key={entry.hora}
                fill={entry.hora === "11h" ? "var(--primary)" : "var(--accent)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}