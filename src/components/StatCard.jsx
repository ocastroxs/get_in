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
  featured = false,
  insight,
}) {
  return (
    <div
      className={[
        "group flex flex-col rounded-[20px] border border-border bg-card text-card-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg animate-in fade-in slide-in-from-bottom-4",
         compact ? "min-h-[112px] gap-2 p-4" : "gap-4 p-5",
        featured ? "min-h-[168px] justify-between" : "",
      ].join(" ")}
      style={{
        borderTopColor: accentVar,
        borderTopWidth: "2px",
        boxShadow: featured ? "0 2px 6px rgba(15, 58, 125, 0.08)" : undefined,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <p
          className={[
            "font-semibold uppercase text-muted-foreground",
            compact ? "text-[10px] tracking-[0.18em]" : "text-[11px] tracking-[0.22em]",
          ].join(" ")}
        >
          {label}
        </p>
        {icon && (
          <div
            className={[
              "flex items-center justify-center rounded-xl border border-border/70 bg-accent/80 transition-colors group-hover:bg-accent",
              compact ? "h-8 w-8" : featured ? "h-11 w-11" : "h-9 w-9",
            ].join(" ")}
          >
            {icon}
          </div>
        )}
      </div>

      <div className={compact ? "flex items-end gap-2" : "flex items-end gap-3"}>
        <span
          className={[
            "font-mono font-semibold leading-none tracking-tight",
            compact ? "text-[2rem]" : featured ? "text-[2.7rem]" : "text-[2.6rem]",
            valueClassName,
          ].join(" ")}
        >
          {value}
        </span>
        {delta !== undefined && (
          <span
            className={[
              "inline-flex items-center gap-1 rounded-full px-2 py-1 font-semibold",
              compact ? "mb-0 text-[10px]" : "mb-0.5 text-xs",
              deltaDir === "up"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700",
            ].join(" ")}
          >
            {deltaDir === "up" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {delta}%
          </span>
        )}
      </div>

      {(sub || insight) && (
        <div className="space-y-1">
          {sub ? (
            <p className={compact ? "text-[11px] leading-snug text-muted-foreground" : "text-xs text-muted-foreground"}>
              {sub}
            </p>
          ) : null}
          {insight ? <p className="text-xs font-medium text-foreground/80">{insight}</p> : null}
        </div>
      )}
    </div>
  );
}
