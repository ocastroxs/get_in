"use client";

import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-6 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Algo saiu do fluxo</h1>
        <p className="mt-2 text-sm text-slate-500">
          Nao foi possivel carregar esta tela agora. Tente novamente para refazer a renderizacao.
        </p>
        {error?.message && (
          <p className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
            {error.message}
          </p>
        )}
        <Button type="button" onClick={reset} className="mt-5 h-10 gap-2 rounded-xl">
          <RefreshCcw className="h-4 w-4" />
          Tentar novamente
        </Button>
      </div>
    </div>
  );
}
