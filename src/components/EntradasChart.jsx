"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ENTRADAS_POR_HORA } from "@/lib/mockData";

export default function EntradasChart({
  title = "Entradas por Periodo",
  subtitle = "Visitantes registrados",
  data = ENTRADAS_POR_HORA,
  dataKey = "value",
  nameKey = "hora",
  barColor = "var(--primary)",
  activeBarColor = "var(--chart-2)",
  mobileLayout = false,
}) {
  const [view, setView] = useState("hoje");
  const height = mobileLayout ? 164 : 188;
  const chartData = mobileLayout ? data.slice(0, 9) : data.slice(0, 9);

  return (
    <div className={`bg-card text-card-foreground rounded-xl border border-border flex flex-col shadow-sm hover:shadow-md transition-all hover:-translate-y-1 duration-300 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 ${mobileLayout ? "gap-3 p-4" : "gap-3 p-4"}`}>
      <div className={`flex items-start justify-between ${mobileLayout ? "gap-3" : ""}`}>
        <div className="animate-in fade-in slide-in-from-left-4 duration-700 delay-300">
          <h3 className={`${mobileLayout ? "text-base" : "text-sm"} font-bold text-foreground`}>{title}</h3>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className={`flex shrink-0 rounded-lg bg-muted p-0.5 font-bold uppercase tracking-wider ${mobileLayout ? "text-[11px]" : "text-[10px]"}`}>
          {["hoje", "semana"].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={[
                `${mobileLayout ? "px-2.5 py-1.5" : "px-3 py-1.5"} rounded-md transition-all duration-300`,
                view === v
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {v === "hoje" ? "Hoje" : "Semana"}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full overflow-hidden" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={mobileLayout ? { top: 8, right: 10, bottom: 6, left: 0 } : { top: 8, right: 14, bottom: 2, left: 0 }}
            barCategoryGap={mobileLayout ? "20%" : "10%"}
          >
            <XAxis
              dataKey={nameKey}
              tick={{ fontSize: mobileLayout ? 10 : 11, fill: "var(--muted-foreground)", fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              dy={mobileLayout ? 8 : 8}
              interval={0}
              padding={{ left: 6, right: 6 }}
            />
            <YAxis
              width={mobileLayout ? 24 : 28}
              tick={{ fontSize: mobileLayout ? 10 : 11, fill: "var(--muted-foreground)", fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: "var(--muted)", opacity: 0.35 }}
              contentStyle={{
                fontSize: 12,
                fontWeight: "bold",
                borderRadius: "12px",
                border: "1px solid var(--border)",
                background: "rgba(255, 255, 255, 0.92)",
                backdropFilter: "blur(8px)",
                color: "var(--foreground)",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
              }}
              itemStyle={{ color: barColor }}
            />
            <Bar
              dataKey={dataKey}
              name="Total"
              maxBarSize={mobileLayout ? 26 : 28}
              radius={mobileLayout ? [4, 4, 0, 0] : [8, 8, 0, 0]}
              animationDuration={1200}
              animationEasing="ease-out"
            >
              {chartData.map((entry, index) => {
                const isMax = entry[dataKey] === Math.max(...chartData.map((item) => item[dataKey]));
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={isMax ? activeBarColor : barColor}
                    className="cursor-pointer transition-all duration-300 hover:opacity-80"
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
