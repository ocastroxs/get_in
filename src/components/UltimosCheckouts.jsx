import Link from "next/link";
import { ULTIMOS_CHECKOUTS } from "@/lib/mockData";

export default function UltimosCheckouts() {
  return (
    <div className="bg-card text-card-foreground rounded-xl border border-border p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all hover:scale-105 hover:-translate-y-1 duration-300 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700">
      <div className="flex items-center justify-between animate-in fade-in slide-in-from-left-4 duration-700 delay-800">
        <h3 className="text-sm font-semibold text-foreground">Últimos Check-outs</h3>
        <Link href="/checkin" className="text-xs text-primary hover:text-primary/80 font-medium transition-all hover:translate-x-1">
          Ver todos →
        </Link>
      </div>

      <div className="border-t border-border">
        <div className="grid grid-cols-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <span>Visitante</span>
          <span className="text-center">Setor</span>
          <span className="text-right">Saída</span>
        </div>

        {ULTIMOS_CHECKOUTS.map((item, i) => (
          <div
            key={i}
            className="grid grid-cols-3 py-2.5 items-center border-t border-border/50 hover:bg-accent/50 -mx-5 px-5 transition-all hover:translate-x-1 animate-in fade-in slide-in-from-left-2 duration-700" style={{ animationDelay: `${800 + i * 50}ms` }}
          >
            <div>
              <p className="text-xs font-semibold text-foreground">{item.nome}</p>
              <p className="text-[10px] text-muted-foreground">{item.empresa}</p>
            </div>
            <div className="flex justify-center">
              <span className="text-[10px] font-semibold text-accent-foreground bg-accent px-2 py-0.5 rounded-md">
                {item.setor}
              </span>
            </div>
            <p className="text-xs font-mono text-muted-foreground text-right">{item.hora}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
