export default function SetoresMaisVisitados({
  title = "Setores Mais Visitados",
  data = [],
  barColorConfig = ["bg-primary", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"]
}) {
  const maxVisitas = Math.max(...data.map(item => item.visitas || 0), 1);

  return (
    <div className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow duration-300">
      <h2 className="font-bold mb-5 text-foreground">{title}</h2>
      <div className="space-y-5">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum setor encontrado.</p>
        ) : data.map((item, i) => {
          const visitas = item.visitas || 0;
          const percentage = (visitas / maxVisitas) * 100;
          const colorClass = barColorConfig[i % barColorConfig.length];
          return (
            <div key={item.nome} className="group">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-medium text-muted-foreground group-hover:text-foreground transition-colors">{item.nome}</span>
                <span className="font-bold text-foreground">{visitas} visitas</span>
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
