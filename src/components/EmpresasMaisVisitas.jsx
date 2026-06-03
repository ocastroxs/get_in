"use client";

import { getActiveLanguage } from "@/lib/i18n-core";
import PaginationControls from "@/components/ui/PaginationControls";
import { usePagination } from "@/hooks/usePagination";

export default function EmpresasMaisVisitas({
  title = "Empresas com Mais Acessos",
  data = []
}) {
  const {
    page,
    setPage,
    pageSize,
    totalItems,
    totalPages,
    paginatedItems: paginaAtual,
  } = usePagination(data);

  const formatUltimoAcesso = (value) => {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";

    return new Intl.DateTimeFormat(getActiveLanguage(), {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  };

  return (
    <div className="bg-card text-card-foreground p-0 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col">
      <div className="p-6 border-b border-border bg-muted/10">
        <h2 className="font-bold text-foreground">{title}</h2>
      </div>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm text-left h-full">
          <thead>
            <tr className="text-[10px] uppercase font-bold text-muted-foreground border-b border-border bg-muted/30">
              <th className="px-6 py-3">Empresa</th>
              <th className="px-6 py-3 text-center">Visitantes</th>
              <th className="px-6 py-3 text-center">Último acesso</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center text-sm text-muted-foreground">
                  Nenhuma empresa encontrada.
                </td>
              </tr>
            ) : paginaAtual.map((item) => (
              <tr key={item.nome} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-3.5 font-semibold text-foreground">{item.nome}</td>
                <td className="px-6 py-3.5 text-center text-muted-foreground font-medium">
                  {item.visitantes ?? item.visitas ?? 0}
                </td>
                <td className="px-6 py-3.5 text-center">
                  <span className="inline-flex rounded-md bg-muted px-2.5 py-1 text-[10px] font-bold text-muted-foreground">
                    {formatUltimoAcesso(item.ultimoAcesso || item.ultimaVisita)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length > 0 && (
        <PaginationControls
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          currentCount={paginaAtual.length}
          onPageChange={setPage}
          itemLabel="empresa(s)"
        />
      )}
    </div>
  );
}
