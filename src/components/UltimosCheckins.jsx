import Link from "next/link";
import { ULTIMOS_CHECKINS } from "@/lib/mockData";

export default function UltimosCheckins() {
  return (
    <div className="bg-card text-card-foreground rounded-xl border border-border p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Últimos Check-ins</h3>
        <Link href="/checkin" className="text-xs text-primary hover:text-primary/80 font-medium">
          Ver todos →
        </Link>
      </div>

      <div className="border-t border-border">
        <div className="grid grid-cols-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <span>Visitante</span>
          <span className="text-center">Setor</span>
          <span className="text-right">Hora</span>
        </div>

        {ULTIMOS_CHECKINS.map((item, i) => (
          <div
            key={i}
            className="grid grid-cols-3 py-2.5 items-center border-t border-border/50 hover:bg-accent/50 -mx-5 px-5 transition-colors"
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