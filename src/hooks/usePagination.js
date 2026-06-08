"use client";

import { useCallback, useMemo, useState } from "react";
import { DEFAULT_PAGE_SIZE } from "@/components/ui/PaginationControls";

export function usePagination(items = [], pageSize = DEFAULT_PAGE_SIZE) {
  const [pageState, setPageState] = useState(1);
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const page = Math.min(Math.max(pageState, 1), totalPages);

  const setPage = useCallback(
    (value) => {
      setPageState((current) => {
        const nextValue = typeof value === "function" ? value(current) : value;
        const nextPage = Number(nextValue);
        if (!Number.isFinite(nextPage)) return current;
        return Math.min(Math.max(Math.trunc(nextPage), 1), totalPages);
      });
    },
    [totalPages]
  );

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  return {
    page,
    setPage,
    pageSize,
    totalItems,
    totalPages,
    paginatedItems,
  };
}
