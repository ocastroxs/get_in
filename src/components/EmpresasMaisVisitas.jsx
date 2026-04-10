import { EMPRESAS_MAIS_VISITAS } from "@/lib/mockData";

export default function EmpresasMaisVisitas({
  title = "Empresas com Mais Visitas",
  data = EMPRESAS_MAIS_VISITAS
}) {
  return (
    <div className="bg-card text-card-foreground p-0 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col">
      <div className="p-6 border-b border-border bg-muted/10">
        <h3 className="font-bold text-foreground">{title}</h3>
      </div>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm text-left h-full">
          <thead>
            <tr className="text-[10px] uppercase font-bold text-muted-foreground border-b border-border bg-muted/30">
              <th className="px-6 py-3">Empresa</th>
              <th className="px-6 py-3 text-center">Visitas</th>
              <th className="px-6 py-3 text-center">Alertas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((item, i) => (
              <tr key={item.nome} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-3.5 font-semibold text-foreground">{item.nome}</td>
                <td className="px-6 py-3.5 text-center text-muted-foreground font-medium">{item.visitas}</td>
                <td className="px-6 py-3.5 text-center">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                    item.alertas > 0 
                      ? 'bg-destructive/10 text-destructive' 
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {item.alertas}
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
