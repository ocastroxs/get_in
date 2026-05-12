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
    return `${preview} esta com permanencia sem saida registrada.`;
  }

  if (remaining > 0) {
    return `${preview} e mais ${remaining} visitante(s) estao sem saida registrada.`;
  }

  return `${preview} estao sem saida registrada.`;
}

export default function AlertaBanner({ alertas = [], onDismiss }) {
  if (!alertas.length) return null;

  const title =
    alertas.length === 1
      ? "1 visitante precisa de atencao"
      : `${alertas.length} visitantes precisam de atencao`;

  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-950">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 text-red-600">
          <AlertTriangle size={18} />
        </div>

        <div className="space-y-1">
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-sm text-red-800">{buildMessage(alertas)}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-100 hover:text-red-700"
        aria-label="Fechar alerta"
      >
        <X size={16} />
      </button>
    </div>
  );
}
