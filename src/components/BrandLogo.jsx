"use client";

import { cn } from "@/lib/utils";

export default function BrandLogo({ variant = "light", compact = false, className }) {
  const isLight = variant === "light";

  return (
    <div className={cn("flex items-center", className)}>
      {compact ? (
        <p
          className={cn(
            "text-xl font-black tracking-tight",
            isLight ? "text-white" : "text-[#0A2540]"
          )}
        >
          G<span className="text-[#4DA8EA]">I</span>
        </p>
      ) : (
        <div className="leading-none">
          <p
            className={cn(
              "text-2xl font-black tracking-tight",
              isLight ? "text-white" : "text-[#0A2540]"
            )}
          >
            GET<span className="text-[#4DA8EA]">IN</span>
          </p>
          <p
            className={cn(
              "mt-1 text-[10px] font-bold uppercase tracking-[0.22em]",
              isLight ? "text-white/45" : "text-slate-400"
            )}
          >
            Access Control
          </p>
        </div>
      )}
    </div>
  );
}
