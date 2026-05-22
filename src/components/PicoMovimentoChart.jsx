"use client";

import { Activity } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PICO_MOVIMENTO } from "@/lib/mockData";

const MOBILE_LABELS = {
  Financeiro: "Financ.",
  Tecnologia: "Tecnol.",
  Producao: "Prod.",
  Produção: "Prod.",
  Manutencao: "Manut.",
  Manutenção: "Manut.",
  Portaria: "Port.",
  Estoque: "Estoq.",
  Administracao: "Admin.",
  Administração: "Admin.",
};

function formatMobileLabel(label) {
  const text = String(label ?? "");
  return MOBILE_LABELS[text] || (text.length > 8 ? `${text.slice(0, 7)}.` : text);
}

function pluralizeRequisicao(value) {
  return value === 1 ? "requisição" : "requisições";
}

export default function PicoMovimentoChart({ mobileLayout = false, data }) {
  const fallbackData = PICO_MOVIMENTO.map((item) => ({ setor: item.hora, value: item.value }));
  const sourceData = Array.isArray(data) ? data : fallbackData;
  const chartData = mobileLayout ? sourceData.slice(0, 6) : sourceData;
  const height = mobileLayout ? 240 : 280;
  const peak = chartData.reduce((current, item) => (item.value > current.value ? item : current), chartData[0] || { setor: "-", value: 0 });
  const hasData = chartData.some((item) => item.value > 0);

  return (
    <section className="rounded-[24px] border border-border bg-card p-5 text-card-foreground shadow-md transition-all duration-300 hover:shadow-lg animate-in fade-in slide-in-from-bottom-4">
      <div className={`${mobileLayout ? "mb-6 flex flex-col gap-4 min-[380px]:flex-row min-[380px]:items-start min-[380px]:justify-between" : "mb-5 flex items-start justify-between gap-4"}`}>
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-foreground">
            <Activity size={14} />
            Setores
          </div>
          <h3 className={`${mobileLayout ? "text-xl" : "text-2xl"} font-semibold text-foreground`}>Pico por Setor</h3>
          <p className="max-w-[220px] text-sm leading-relaxed text-muted-foreground">Requisições de visita agrupadas por setor.</p>
        </div>

        <div className="w-fit min-w-[124px] rounded-xl border border-primary/10 bg-primary/[0.035] px-3 py-2 shadow-sm shadow-slate-200/30">
          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-primary/70">Maior fluxo</p>
          <p className="mt-0.5 flex items-baseline gap-1.5 font-mono text-lg font-semibold text-foreground">
            {peak.value}
            <span className="font-sans text-[11px] font-semibold text-muted-foreground">{peak.setor}</span>
          </p>
        </div>
      </div>

      {hasData ? (
        <div style={{ height }} className="w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={mobileLayout ? { top: 8, right: 8, bottom: 30, left: -10 } : { top: 8, right: 8, bottom: 6, left: -12 }}
              barCategoryGap={mobileLayout ? "28%" : "18%"}
            >
              <CartesianGrid vertical={false} stroke="rgba(15,58,125,0.08)" />
              <XAxis
                dataKey="setor"
                interval={0}
                tick={{
                  fontSize: mobileLayout ? 10 : 10,
                  fill: "var(--muted-foreground)",
                  fontWeight: 600,
                }}
                tickFormatter={mobileLayout ? formatMobileLabel : undefined}
                tickMargin={mobileLayout ? 12 : 8}
                angle={mobileLayout ? -32 : 0}
                textAnchor={mobileLayout ? "end" : "middle"}
                height={mobileLayout ? 54 : 30}
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
                    key={entry.setor}
                    fill={entry.setor === peak.setor ? "var(--primary)" : "rgba(15, 58, 125, 0.14)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div style={{ height }} className="flex w-full items-center justify-center text-sm text-muted-foreground">
          Nenhuma requisição por setor encontrada.
        </div>
      )}

      <div className="mt-5 border-t border-border pt-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Leitura rápida</p>
        <p className="mt-2 text-sm leading-relaxed text-foreground">
          O setor com maior volume foi <span className="font-semibold">{peak.setor}</span>, com{" "}
          <span className="font-semibold">{peak.value} {pluralizeRequisicao(peak.value)}</span> no período carregado.
        </p>
      </div>
    </section>
  );
}
