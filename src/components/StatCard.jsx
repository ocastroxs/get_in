import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatCard({
  label,
  value,
  valueClassName = "text-foreground",
  icon,
  sub,
  delta,
  deltaDir,
  accentVar = "var(--primary)",
  compact = false,
}) {
  return (
    <div
      className={[
        "bg-card text-card-foreground rounded-xl border border-border flex flex-col hover:shadow-md transition-all hover:scale-105 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4 duration-700",
        compact ? "min-h-[112px] gap-2 p-3" : "gap-3 p-4",
      ].join(" ")}
      style={{ borderBottomColor: accentVar, borderBottomWidth: "2px" }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className={compact ? "text-[10px] font-semibold uppercase tracking-wide text-muted-foreground" : "text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"}>
          {label}
        </p>
        {icon && (
          <div className={compact ? "flex h-8 w-8 items-center justify-center rounded-lg bg-accent animate-in fade-in zoom-in duration-700 delay-100" : "flex h-9 w-9 items-center justify-center rounded-lg bg-accent transition-all group-hover:scale-110 animate-in fade-in zoom-in duration-700 delay-100"}>
            {icon}
          </div>
        )}
      </div>

      <div className={compact ? "flex items-end gap-2" : "flex items-end gap-3"}>
        <span className={`${compact ? "text-2xl" : "text-4xl"} font-bold leading-none ${valueClassName}`}>
          {value}
        </span>
        {delta !== undefined && (
          <span className={`flex items-center gap-0.5 font-semibold ${compact ? "mb-0 text-[10px]" : "mb-0.5 text-xs"} ${deltaDir === "up" ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>
            {deltaDir === "up" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {delta}%
          </span>
        )}
      </div>

      {sub && <p className={compact ? "text-[11px] leading-snug text-muted-foreground" : "text-xs text-muted-foreground"}>{sub}</p>}
    </div>
  );
}
