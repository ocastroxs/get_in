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

function PicoSetorTooltip({ active, payload, total, peak }) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0]?.payload;
  if (!item) {
    return null;
  }

  const value = Number(item.value) || 0;
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  const isPeak = item.setor === peak?.setor && value === peak?.value;

  return (
    <div className="min-w-[180px] rounded-xl border border-border bg-card/95 px-3 py-2.5 text-card-foreground shadow-lg shadow-slate-900/10 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{item.setor}</p>
          <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Setor
          </p>
        </div>
        {isPeak ? (
          <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-primary">
            Maior fluxo
          </span>
        ) : null}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border/70 pt-2.5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Total</p>
          <p className="mt-0.5 font-mono text-base font-semibold text-foreground">{value}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Do total</p>
          <p className="mt-0.5 font-mono text-base font-semibold text-foreground">{percent}%</p>
        </div>
      </div>
    </div>
  );
}

export default function PicoMovimentoChart({ mobileLayout = false, data }) {
  const fallbackData = PICO_MOVIMENTO.map((item) => ({ setor: item.hora, value: item.value }));
  const sourceData = Array.isArray(data) ? data : fallbackData;
  const chartData = mobileLayout ? sourceData.slice(0, 6) : sourceData;
  const height = mobileLayout ? 240 : 280;
  const peak = chartData.reduce((current, item) => (item.value > current.value ? item : current), chartData[0] || { setor: "-", value: 0 });
  const chartTotal = chartData.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
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
                cursor={{ fill: "rgba(15,58,125,0.055)", radius: 10 }}
                content={<PicoSetorTooltip total={chartTotal} peak={peak} />}
                wrapperStyle={{ outline: "none", zIndex: 20 }}
              />
              <Bar
                dataKey="value"
                radius={[8, 8, 0, 0]}
                maxBarSize={28}
                activeBar={{
                  fillOpacity: 0.96,
                  stroke: "var(--foreground)",
                  strokeOpacity: 0.18,
                  strokeWidth: 2,
                }}
              >
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
