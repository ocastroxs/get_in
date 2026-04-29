"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { PICO_MOVIMENTO } from "@/lib/mockData";

export default function PicoMovimentoChart({ mobileLayout = false }) {
  const height = mobileLayout ? 164 : 188;
  const chartData = mobileLayout ? PICO_MOVIMENTO.slice(1, 10) : PICO_MOVIMENTO;

  return (
    <div className={`bg-card text-card-foreground rounded-xl border border-border flex flex-col shadow-sm hover:shadow-md transition-all hover:-translate-y-1 duration-300 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 ${mobileLayout ? "gap-3 p-4" : "gap-3 p-4"}`}>
      <div className="flex items-start justify-between">
        <div className="animate-in fade-in slide-in-from-left-4 duration-700 delay-400">
          <h3 className={`${mobileLayout ? "text-base" : "text-sm"} font-semibold text-foreground`}>Pico de Movimento</h3>
          <p className="text-xs text-muted-foreground">Entradas e saidas por hora</p>
        </div>
      </div>

      <div className="w-full overflow-hidden" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={mobileLayout ? { top: 8, right: 10, bottom: 6, left: 0 } : { top: 8, right: 12, bottom: 2, left: 0 }}
            barCategoryGap={mobileLayout ? "16%" : "10%"}
          >
            <XAxis
              dataKey="hora"
              tick={{ fontSize: mobileLayout ? 9 : 10, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              interval={0}
              padding={{ left: 6, right: 6 }}
            />
            <YAxis
              width={mobileLayout ? 22 : 26}
              tick={{ fontSize: mobileLayout ? 9 : 10, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
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
            <Bar
              dataKey="value"
              name="Movimento"
              maxBarSize={mobileLayout ? 18 : 24}
              radius={mobileLayout ? [3, 3, 0, 0] : [6, 6, 0, 0]}
              animationDuration={1200}
              animationEasing="ease-out"
            >
              {chartData.map((entry) => (
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
