"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const DEFAULT_PAGE_SIZE = 10;

export default function PaginationControls({
  page,
  totalPages,
  totalItems,
  pageSize = DEFAULT_PAGE_SIZE,
  currentCount,
  onPageChange,
  itemLabel = "registro(s)",
}) {
  const safeTotalItems = Number(totalItems) || 0;
  const safePageSize = Number(pageSize) || DEFAULT_PAGE_SIZE;
  const safeTotalPages = Math.max(Number(totalPages) || 1, 1);
  const safePage = Math.min(Math.max(Number(page) || 1, 1), safeTotalPages);
  const visibleCount = currentCount ?? Math.min(safePageSize, safeTotalItems);
  const start = safeTotalItems > 0 ? (safePage - 1) * safePageSize + 1 : 0;
  const end = safeTotalItems > 0 ? Math.min(safeTotalItems, start + visibleCount - 1) : 0;

  return (
    <div className="flex flex-col gap-3 border-t border-border bg-muted/10 p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground">
        Mostrando <strong>{start}</strong>-<strong>{end}</strong> de{" "}
        <strong>{safeTotalItems}</strong> {itemLabel}. Página {safePage} de {safeTotalPages}.
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, safePage - 1))}
          disabled={safePage <= 1}
          className="gap-1.5 rounded-xl"
        >
          <ArrowLeft size={14} />
          Anterior
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(safeTotalPages, safePage + 1))}
          disabled={safePage >= safeTotalPages}
          className="gap-1.5 rounded-xl"
        >
          Próxima
          <ArrowRight size={14} />
        </Button>
      </div>
    </div>
  );
}
