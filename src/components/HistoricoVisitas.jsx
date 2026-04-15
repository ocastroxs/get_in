import { Search, SlidersHorizontal } from "lucide-react";
import { HISTORICO_VISITAS } from "@/lib/mockData";

export default function HistoricoVisitas({ 
  title = "Histórico de Visitas", 
  data = HISTORICO_VISITAS,
  searchPlaceholder = "Buscar visitante..."
}) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-300">
      <div className="p-6 border-b border-border flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-muted/20">
        <h3 className="font-bold text-lg text-foreground">{title}</h3>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder={searchPlaceholder} 
              className="pl-9 pr-4 py-2 border border-input rounded-lg text-sm w-full md:w-64 outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-background text-foreground transition-all" 
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 border border-input rounded-lg text-sm text-foreground hover:bg-accent transition-colors">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" /> <span className="hidden md:inline">Filtros</span>
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-muted/40 text-[10px] uppercase font-bold text-muted-foreground">
            <tr>
              <th className="px-6 py-4 whitespace-nowrap">Visitante</th>
              <th className="px-6 py-4">Empresa</th>
              <th className="px-6 py-4">Tipo</th>
              <th className="px-6 py-4">Setor</th>
              <th className="px-6 py-4">Entrada/Saída</th>
              <th className="px-6 py-4">Permanência</th>
              <th className="px-6 py-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-border">
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-muted/30 transition-colors group">
                <td className="px-6 py-4 font-bold text-foreground whitespace-nowrap">{item.visitante}</td>
                <td className="px-6 py-4 text-muted-foreground font-medium">{item.empresa}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                    item.tipo === 'Técnico' || item.tipo === 'Manutenção' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                    item.tipo === 'Auditor' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' :
                    'bg-slate-500/10 text-slate-600 dark:text-slate-400'
                  }`}>
                    {item.tipo}
                  </span>
                </td>
                <td className="px-6 py-4 text-muted-foreground">{item.setor}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-mono text-xs">{item.entrada}</span>
                  <span className="text-muted-foreground text-xs mx-1">→</span>
                  <span className="font-mono text-xs text-muted-foreground">{item.saida}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="w-14 text-xs font-medium text-foreground">{item.tempo}</span>
                    <div className="flex-1 h-1.5 bg-muted rounded-full w-24 overflow-hidden">
                       <div 
                        className={`h-full transition-all duration-1000 ease-out ${item.permanenciaStatus > 80 ? 'bg-destructive' : item.permanenciaStatus > 50 ? 'bg-amber-500' : 'bg-primary'}`} 
                        style={{width: `${item.permanenciaStatus}%`}}
                       ></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                    item.status === 'CONCLUÍDO' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  }`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
