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
}) {
  return (
    <div
      className="bg-card text-card-foreground rounded-xl border border-border p-4 flex flex-col gap-3 hover:shadow-md transition-shadow"
      style={{ borderBottomColor: accentVar, borderBottomWidth: "2px" }}
    >
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
          {label}
        </p>
        {icon && (
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-end gap-3">
        <span className={`text-4xl font-bold leading-none ${valueClassName}`}>
          {value}
        </span>
        {delta !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold mb-0.5 ${deltaDir === "up" ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>
            {deltaDir === "up" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {delta}%
          </span>
        )}
      </div>

      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
