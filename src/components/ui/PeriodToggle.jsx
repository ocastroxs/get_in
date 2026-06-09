"use client";

const PERIOD_OPTIONS = [
  { value: "hoje", label: "Dia" },
  { value: "semana", label: "Semana" },
  { value: "mes", label: "Mês" },
];

export default function PeriodToggle({ value, onChange, className = "" }) {
  return (
    <div
      role="tablist"
      aria-label="Período"
      className={[
        "grid w-full grid-cols-3 rounded-xl border border-border/80 bg-muted/45 p-1 text-[11px] font-semibold text-muted-foreground shadow-sm shadow-slate-200/30 sm:w-fit",
        className,
      ].join(" ")}
    >
      {PERIOD_OPTIONS.map((option) => {
        const active = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={[
              "min-h-8 rounded-lg px-3 py-1.5 text-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              active
                ? "bg-card text-foreground shadow-sm ring-1 ring-border/60"
                : "hover:bg-background/80 hover:text-foreground",
            ].join(" ")}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
