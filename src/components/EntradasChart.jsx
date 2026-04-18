"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ENTRADAS_POR_HORA } from "@/lib/mockData";

export default function EntradasChart({
  title = "Entradas por Período",
  subtitle = "Visitantes registrados",
  data = ENTRADAS_POR_HORA,
  dataKey = "value",
  nameKey = "hora",
  barColor = "var(--primary)",
  activeBarColor = "var(--chart-2)"
}) {
  const [view, setView] = useState("hoje");

  return (
    <div className="bg-card text-card-foreground rounded-xl border border-border p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all hover:scale-105 hover:-translate-y-1 duration-300 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
      <div className="flex items-start justify-between">
        <div className="animate-in fade-in slide-in-from-left-4 duration-700 delay-300">
          <h3 className="text-sm font-bold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex bg-muted rounded-lg p-0.5 text-[10px] font-bold uppercase tracking-wider">
          {["hoje", "semana"].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={[
                "px-3 py-1.5 rounded-md transition-all duration-300",
                view === v
                  ? "bg-background text-foreground shadow-sm scale-105"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {v === "hoje" ? "Hoje" : "Semana"}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[180px] w-full mt-2" style={{ minWidth: '300px', minHeight: '180px' }}>
        <ResponsiveContainer width={400} height={180}>
          <BarChart
            data={data}
            barSize={32}
            margin={{ top: 10, right: 0, bottom: 0, left: -24 }}
          >
            <XAxis
              dataKey={nameKey}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)", fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--muted-foreground)", fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              dx={-10}
            />
            <Tooltip
              cursor={{ fill: "var(--muted)", opacity: 0.4 }}
              contentStyle={{
                fontSize: 12,
                fontWeight: "bold",
                borderRadius: "12px",
                border: "1px solid var(--border)",
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(8px)",
                color: "var(--foreground)",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
              }}
              itemStyle={{ color: barColor }}
            />
            <Bar dataKey={dataKey} name="Total" radius={[6, 6, 0, 0]} animationDuration={1200} animationEasing="ease-out">
              {data.map((entry, index) => {
                // Destacar o maior valor visualmente como exemplo de dinâmica
                const isMax = entry[dataKey] === Math.max(...data.map(d => d[dataKey]));
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={isMax ? activeBarColor : barColor}
                    className="transition-all duration-300 hover:opacity-80 cursor-pointer"
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