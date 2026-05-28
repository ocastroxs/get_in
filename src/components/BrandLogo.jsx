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
          G
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
        </div>
      )}
    </div>
  );
}
