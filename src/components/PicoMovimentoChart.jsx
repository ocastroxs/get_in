"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ENTRADAS_POR_HORA } from "@/lib/mockData";

export default function EntradasChart() {
  const [view, setView] = useState("hoje");

  return (
    <div className="bg-card text-card-foreground rounded-xl border border-border p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Entradas por Período</h3>
          <p className="text-xs text-muted-foreground">Visitantes registrados</p>
        </div>
        <div className="flex bg-muted rounded-lg p-0.5 text-xs font-medium">
          {["hoje", "semana"].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={[
                "px-3 py-1 rounded-md capitalize transition-all",
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

      <ResponsiveContainer width="100%" height={160}>
        <BarChart
          data={ENTRADAS_POR_HORA}
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
          <Bar dataKey="value" name="Entradas" radius={[4, 4, 0, 0]}>
            {ENTRADAS_POR_HORA.map((entry) => (
              <Cell
                key={entry.hora}
                fill={entry.hora === "11h" ? "var(--primary)" : "var(--accent)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}