"use client";

import React from "react";
import { X, Filter, RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import ModalPortal from "@/components/ui/ModalPortal";

/**
 * ModalFiltro Padronizado
 * @param {boolean} isOpen - Estado do modal
 * @param {function} onClose - Função para fechar o modal
 * @param {function} onApply - Função para aplicar os filtros
 * @param {function} onClear - Função para limpar os filtros
 * @param {React.ReactNode} children - Campos de filtro específicos de cada página
 * @param {string} title - Título do modal (opcional)
 */
export default function ModalFiltro({ 
  isOpen, 
  onClose, 
  onApply, 
  onClear, 
  children,
  title = "Filtros"
}) {
  if (!isOpen) return null;

  return (
    <ModalPortal>
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Filter size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{title}</h2>
              <p className="text-xs text-muted-foreground">Refine sua busca</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[min(70vh,520px)] space-y-5 overflow-y-auto p-6" data-lenis-prevent>
          {children}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 p-5 border-t border-border bg-muted/10">
          <Button
            variant="outline"
            onClick={() => {
              onClear();
              onClose();
            }}
            className="flex-1 h-11 rounded-xl gap-2 border-border/60 hover:bg-muted"
          >
            <RotateCcw size={16} />
            Limpar
          </Button>
          <Button
            onClick={() => {
              onApply();
              onClose();
            }}
            className="flex-1 h-11 rounded-xl gap-2 shadow-lg shadow-primary/20"
          >
            <Check size={16} />
            Aplicar Filtros
          </Button>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}
