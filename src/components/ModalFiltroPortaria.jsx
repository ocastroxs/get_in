"use client";

import { useState, useCallback, useMemo } from "react";
import { X, Filter, Search, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldSet, FieldGroup, FieldLegend, Field, FieldLabel, FieldContent } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";

const CONFIG_PADRAO = {
  busca: {
    label: "Buscar",
    placeholder: "Nome, CPF ou empresa..."
  },
  data: {
    label: "Data",
    placeholder: "Selecione uma data"
  },
  status: {
    label: "Status",
    opcoes: [
      { label: "Todos", value: "Todos" },
      { label: "Ativo", value: "ativo" },
      { label: "Saída", value: "saida" }
    ]
  },
  setores: {
    label: "Setores",
    opcoes: []
  }
};

/**
 * ModalFiltroPortaria - Componente reutilizável de modal de filtros para fluxo de portaria
 * 
 * Props:
 * - isOpen: boolean - Controla se o modal está aberto
 * - onClose: function - Callback para fechar o modal
 * - filtros: object - Estado atual dos filtros
 * - onFiltrosChange: function - Callback quando filtros mudam
 * - onLimpar: function - Callback para limpar todos os filtros
 * - config: object - Configuração dos filtros disponíveis
 *   - busca: { label, placeholder }
 *   - data: { label, placeholder }
 *   - status: { label, opcoes: [{ label, value }] }
 *   - setores: { label, opcoes: [{ label, value }] }
 */
export default function ModalFiltroPortaria({
  isOpen,
  onClose,
  filtros = {},
  onFiltrosChange,
  onLimpar,
  config = {}
}) {
  const configMerged = useMemo(() => ({
    ...CONFIG_PADRAO,
    ...config
  }), [config]);

  // Estados locais para edição
  const [filtrosLocais, setFiltrosLocais] = useState(filtros);

  // Atualizar filtro local
  const handleFiltroChange = useCallback((chave, valor) => {
    setFiltrosLocais(prev => ({
      ...prev,
      [chave]: valor
    }));
  }, []);

  // Aplicar filtros
  const handleAplicar = useCallback(() => {
    onFiltrosChange?.(filtrosLocais);
    onClose();
  }, [filtrosLocais, onFiltrosChange, onClose]);

  // Limpar filtros
  const handleLimpar = useCallback(() => {
    const filtrosVazios = Object.keys(filtrosLocais).reduce((acc, chave) => {
      if (chave === "status") {
        acc[chave] = "Todos";
      } else {
        acc[chave] = "";
      }
      return acc;
    }, {});
    
    setFiltrosLocais(filtrosVazios);
    onLimpar?.(filtrosVazios);
  }, [filtrosLocais, onLimpar]);

  // Sincronizar com props quando abre
  const handleAbrirModal = useCallback(() => {
    setFiltrosLocais(filtros);
  }, [filtros]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md animate-in fade-in zoom-in rounded-xl border border-border bg-card shadow-lg duration-300">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2">
              <Filter size={18} className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Filtros</h2>
              <p className="text-xs text-muted-foreground">Refine sua busca</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 transition-colors hover:bg-muted"
            type="button"
          >
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="space-y-4 p-4 max-h-[60vh] overflow-y-auto">
          <FieldSet>
            {/* Campo de Busca */}
            {configMerged.busca && (
              <FieldGroup>
                <FieldLegend>{configMerged.busca.label}</FieldLegend>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
                  <Input
                    placeholder={configMerged.busca.placeholder}
                    className="pl-10 h-10 rounded-lg border-border/60 bg-background/80 text-sm"
                    value={filtrosLocais.busca || ""}
                    onChange={(e) => handleFiltroChange("busca", e.target.value)}
                  />
                  {filtrosLocais.busca && (
                    <button
                      type="button"
                      onClick={() => handleFiltroChange("busca", "")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </FieldGroup>
            )}

            {/* Campo de Data */}
            {configMerged.data && (
              <FieldGroup>
                <FieldLegend>{configMerged.data.label}</FieldLegend>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
                  <Input
                    type="date"
                    className="pl-10 h-10 rounded-lg border-border/60 bg-background/80 text-sm"
                    value={filtrosLocais.data || ""}
                    onChange={(e) => handleFiltroChange("data", e.target.value)}
                  />
                </div>
              </FieldGroup>
            )}

            {/* Campo de Status */}
            {configMerged.status && configMerged.status.opcoes.length > 0 && (
              <FieldGroup>
                <FieldLegend>{configMerged.status.label}</FieldLegend>
                <div className="space-y-2">
                  {configMerged.status.opcoes.map((opcao) => (
                    <Field key={opcao.value} orientation="horizontal">
                      <Checkbox
                        id={`status-${opcao.value}`}
                        checked={filtrosLocais.status === opcao.value}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleFiltroChange("status", opcao.value);
                          }
                        }}
                      />
                      <FieldLabel htmlFor={`status-${opcao.value}`} className="cursor-pointer">
                        {opcao.label}
                      </FieldLabel>
                    </Field>
                  ))}
                </div>
              </FieldGroup>
            )}

            {/* Campo de Setores (se configurado) */}
            {configMerged.setores && configMerged.setores.opcoes.length > 0 && (
              <FieldGroup>
                <FieldLegend>{configMerged.setores.label}</FieldLegend>
                <div className="space-y-2">
                  {configMerged.setores.opcoes.map((opcao) => (
                    <Field key={opcao.value} orientation="horizontal">
                      <Checkbox
                        id={`setor-${opcao.value}`}
                        checked={(filtrosLocais.setores || []).includes(opcao.value)}
                        onCheckedChange={(checked) => {
                          const setoresAtuais = filtrosLocais.setores || [];
                          if (checked) {
                            handleFiltroChange("setores", [...setoresAtuais, opcao.value]);
                          } else {
                            handleFiltroChange("setores", setoresAtuais.filter(s => s !== opcao.value));
                          }
                        }}
                      />
                      <FieldLabel htmlFor={`setor-${opcao.value}`} className="cursor-pointer">
                        {opcao.label}
                      </FieldLabel>
                    </Field>
                  ))}
                </div>
              </FieldGroup>
            )}
          </FieldSet>
        </div>

        {/* Rodapé */}
        <div className="flex gap-2 border-t border-border p-4">
          <Button
            variant="outline"
            onClick={handleLimpar}
            className="flex-1"
            type="button"
          >
            <X size={14} className="mr-2" />
            Limpar
          </Button>
          <Button
            onClick={handleAplicar}
            className="flex-1"
            type="button"
          >
            <Search size={14} className="mr-2" />
            Aplicar
          </Button>
        </div>
      </div>
    </div>
  );
}
