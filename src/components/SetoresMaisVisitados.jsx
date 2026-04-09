import { SETORES_MAIS_VISITADOS } from "@/lib/mockData";

export default function SetoresMaisVisitados({
  title = "Setores Mais Visitados",
  data = SETORES_MAIS_VISITADOS,
  barColorConfig = ["bg-primary", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"]
}) {
  const maxVisitas = Math.max(...data.map(item => item.visitas));

  return (
    <div className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow duration-300">
      <h3 className="font-bold mb-5 text-foreground">{title}</h3>
      <div className="space-y-5">
        {data.map((item, i) => {
          const percentage = (item.visitas / maxVisitas) * 100;
          const colorClass = barColorConfig[i % barColorConfig.length];
          return (
            <div key={item.nome} className="group">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-medium text-muted-foreground group-hover:text-foreground transition-colors">{item.nome}</span>
                <span className="font-bold text-foreground">{item.visitas} visitas</span>
              </div>
              <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ease-out rounded-full ${colorClass}`} 
                  style={{width: `${percentage}%`}}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
