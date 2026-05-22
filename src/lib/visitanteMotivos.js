export const MOTIVO_OPTIONS = [
  { value: "Visita", label: "Visita" },
  { value: "Entrega", label: "Entrega" },
  { value: "Manutenção", label: "Manutenção" },
  { value: "Reunião", label: "Reunião" },
  { value: "Outro", label: "Outro" },
];

const MOTIVO_ALIASES = {
  visita: "Visita",
  entrega: "Entrega",
  manutencao: "Manutenção",
  reuniao: "Reunião",
  outro: "Outro",
};

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function normalizeMotivoVisita(value) {
  return MOTIVO_ALIASES[normalizeText(value)] || "Outro";
}
