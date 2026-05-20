"use client";

import { Activity } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PICO_MOVIMENTO } from "@/lib/mockData";

export default function PicoMovimentoChart({ mobileLayout = false }) {
  const chartData = mobileLayout ? PICO_MOVIMENTO.slice(1, 10) : PICO_MOVIMENTO;
  const height = mobileLayout ? 220 : 280;
  const peak = chartData.reduce((current, item) => (item.value > current.value ? item : current), chartData[0]);

  return (
    <section className="rounded-[24px] border border-border bg-card p-5 text-card-foreground shadow-md transition-all duration-300 hover:shadow-lg animate-in fade-in slide-in-from-bottom-4">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-foreground">
            <Activity size={14} />
            Movimento
          </div>
          <h3 className={`${mobileLayout ? "text-xl" : "text-2xl"} font-semibold text-foreground`}>Pico de Movimento</h3>
          <p className="text-sm text-muted-foreground">Leitura complementar de entradas e saidas por hora.</p>
        </div>

        <div className="min-w-[124px] rounded-2xl border border-border bg-muted/50 px-4 py-3 shadow-sm shadow-slate-200/40">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Maior fluxo</p>
          <p className="mt-1 font-mono text-xl font-semibold text-foreground">{peak.value}</p>
          <p className="text-xs text-muted-foreground">{peak.hora}</p>
        </div>
      </div>

      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 6, left: -12 }} barCategoryGap="18%">
            <CartesianGrid vertical={false} stroke="rgba(15,58,125,0.08)" />
            <XAxis
              dataKey="hora"
              tick={{ fontSize: 10, fill: "var(--muted-foreground)", fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              width={28}
              tick={{ fontSize: 10, fill: "var(--muted-foreground)", fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(15,58,125,0.035)" }}
              contentStyle={{
                borderRadius: "16px",
                border: "1px solid var(--border)",
                background: "rgba(255,255,255,0.96)",
                boxShadow: "0 12px 28px rgba(15, 58, 125, 0.10)",
              }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={28}>
              {chartData.map((entry) => (
                <Cell
                  key={entry.hora}
                  fill={entry.hora === peak.hora ? "var(--primary)" : "rgba(15, 58, 125, 0.14)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-5 border-t border-border pt-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Leitura rapida</p>
        <p className="mt-1 text-sm text-foreground">
          O horario de maior pressao foi <span className="font-semibold">{peak.hora}</span>, com fluxo{" "}
          <span className="font-semibold">concentrado e acima da media diaria</span>.
        </p>
      </div>
    </section>
  );
}
