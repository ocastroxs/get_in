"use client";

import { AlertTriangle, X } from "lucide-react";

function buildMessage(alertas) {
  if (alertas.length === 0) return "";

  const preview = alertas
    .slice(0, 3)
    .map((alerta) => alerta.nome || alerta.empresa || "Visitante")
    .join(", ");

  const remaining = alertas.length - Math.min(alertas.length, 3);

  if (alertas.length === 1) {
    return `${preview} está com permanência sem saída registrada.`;
  }

  if (remaining > 0) {
    return `${preview} e mais ${remaining} visitante(s) estão sem saída registrada.`;
  }

  return `${preview} estão sem saída registrada.`;
}

export default function AlertaBanner({ alertas = [], onDismiss }) {
  if (!alertas.length) return null;

  const title =
    alertas.length === 1
      ? "1 visitante precisa de atenção"
      : `${alertas.length} visitantes precisam de atenção`;

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-rose-200/60 bg-gradient-to-br from-rose-50/90 via-orange-50/80 to-white/85 p-5 text-red-950 shadow-xl shadow-rose-900/10 backdrop-blur-md transition-all duration-300">
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/65 text-red-600 shadow-sm ring-1 ring-rose-200/70 backdrop-blur">
            <AlertTriangle size={20} />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-bold tracking-tight">{title}</p>
            <p className="text-xs leading-relaxed text-red-800/90">{buildMessage(alertas)}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-red-500 transition-all hover:bg-white/65 hover:text-red-700 active:scale-95"
          aria-label="Fechar alerta"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
