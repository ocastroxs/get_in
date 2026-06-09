"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ModalPortal from "@/components/ui/ModalPortal";
import { api } from "@/services/api";
import { useToast } from "@/components/ui/toast-provider";
import {
  formatCPF,
  formatPhone,
  formatSupervisorDateTime,
  getSupervisorObservacaoPortaria,
  getSupervisorSolicitacoes,
  SUPERVISOR_MODAL_STATUS_STYLE,
  SUPERVISOR_STATUS_LABEL,
} from "@/lib/supervisor-data";

function getSolicitacaoKey(item) {
  return item.id || `${item.setor}-${item.dataDaRequisicao || ""}`;
}

export default function ModalAprovacaoVisitante({ isOpen, onClose, requisicao, onConfirm }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [observacoes, setObservacoes] = useState("");
  const [decisoes, setDecisoes] = useState({});

  const solicitacoes = useMemo(() => getSupervisorSolicitacoes(requisicao), [requisicao]);

  useEffect(() => {
    if (!requisicao) {
      return;
    }

    const initial = {};
    getSupervisorSolicitacoes(requisicao).forEach((item) => {
      initial[getSolicitacaoKey(item)] = item.status || "pendente";
    });
    setDecisoes(initial);
    setObservacoes("");
  }, [requisicao]);

  async function handleConfirmar() {
    const updates = solicitacoes
      .filter((item) => item.id)
      .map((item) => ({
        id: item.id,
        status: decisoes[getSolicitacaoKey(item)] || item.status || "pendente",
      }));

    if (updates.length === 0) {
      showToast({
        type: "error",
        title: "Pedido sem setores",
        description: "Não foi possível identificar os setores da solicitação.",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await api.put("/requisicao-visitante/lote", {
        updates,
        observacoes: observacoes || null,
      });

      if (!response.sucesso) {
        throw new Error(response.mensagem || response.erro || "Erro ao processar requisição.");
      }

      showToast({
        type: "success",
        title: "Solicitação analisada",
        description: "As decisões por setor foram salvas.",
      });
      onConfirm?.();
      onClose?.();
    } catch (error) {
      showToast({
        type: "error",
        title: "Erro ao analisar",
        description: error.message || "Tente novamente em instantes.",
      });
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen || !requisicao) return null;

  const usuario = requisicao.usuario || {};
  const observacaoPortaria = requisicao.observacoesPortaria || getSupervisorObservacaoPortaria(requisicao);

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-3 backdrop-blur-sm sm:items-center sm:p-4">
        <div className="max-h-[calc(100vh-1rem)] w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-card p-4 sm:p-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-600">
                <AlertTriangle size={20} />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold text-foreground">Analisar visitante</h2>
                <p className="truncate text-xs text-muted-foreground">Decida cada setor solicitado individualmente</p>
              </div>
            </div>
            <button type="button" onClick={onClose} disabled={loading} className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground">
              <X size={18} />
            </button>
          </div>

          <div className="max-h-[calc(100vh-10rem)] space-y-5 overflow-y-auto p-4 sm:p-5" data-lenis-prevent>
            <section className="rounded-2xl border border-border bg-muted/30 p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
                <Users size={16} className="text-primary" />
                Dados do visitante
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <Info label="Nome" value={requisicao.visitante || usuario.nome || "-"} />
                <Info label="CPF" value={formatCPF(requisicao.cpf || usuario.cpf) || "-"} />
                <Info label="E-mail" value={requisicao.email || usuario.email || "-"} icon={<Mail size={14} />} />
                <Info label="Telefone" value={formatPhone(requisicao.telefone || usuario.celular || usuario.telefone) || "-"} icon={<Phone size={14} />} />
                <Info label="Empresa" value={requisicao.empresa || "-"} icon={<Building2 size={14} />} />
                <Info label="Solicitado em" value={formatSupervisorDateTime(requisicao.dataDaRequisicao)} icon={<Clock size={14} />} />
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                <MapPin size={16} className="text-primary" />
                Setores solicitados
              </h3>
              <div className="grid gap-3">
                {solicitacoes.map((item) => {
                  const itemKey = getSolicitacaoKey(item);
                  const status = decisoes[itemKey] || item.status || "pendente";

                  return (
                    <div key={itemKey} className="rounded-2xl border border-border bg-background p-4 shadow-xs">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="min-w-0">
                          <p className="break-words text-sm font-bold text-foreground">{item.setor || "-"}</p>
                          <p className="mt-1 break-words text-xs text-muted-foreground">{item.motivo || "-"}</p>
                        </div>
                        <span className={`w-fit rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${SUPERVISOR_MODAL_STATUS_STYLE[status] || SUPERVISOR_MODAL_STATUS_STYLE.pendente}`}>
                          {SUPERVISOR_STATUS_LABEL[status] || status}
                        </span>
                      </div>
                      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <Button
                          type="button"
                          variant={status === "aprovado" ? "default" : "outline"}
                          onClick={() => setDecisoes((current) => ({ ...current, [itemKey]: "aprovado" }))}
                          className="h-9 gap-1.5 rounded-xl"
                          disabled={loading}
                        >
                          <CheckCircle2 size={14} />
                          Aprovar setor
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setDecisoes((current) => ({ ...current, [itemKey]: "recusado" }))}
                          className={`h-9 gap-1.5 rounded-xl ${status === "recusado" ? "border-red-300 bg-red-50 text-red-700" : ""}`}
                          disabled={loading}
                        >
                          <XCircle size={14} />
                          Recusar setor
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {requisicao.descricao && (
              <section className="rounded-2xl border border-border bg-muted/30 p-4">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
                  <FileText size={16} className="text-primary" />
                  Descrição da requisição
                </h3>
                <p className="break-words text-sm leading-relaxed text-muted-foreground">{requisicao.descricao}</p>
              </section>
            )}

            <section className="rounded-2xl border border-blue-100 bg-blue-50/80 p-4">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-blue-900">
                <FileText size={16} className="text-blue-700" />
                Observação da portaria
              </h3>
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-blue-900/80">{observacaoPortaria}</p>
            </section>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Observações internas</span>
              <textarea
                placeholder="Adicione observações para auditoria interna"
                value={observacoes}
                onChange={(event) => setObservacoes(event.target.value)}
                className="min-h-24 w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                disabled={loading}
              />
            </label>
          </div>

          <div className="sticky bottom-0 flex flex-col gap-2 border-t border-border bg-card p-4 sm:flex-row sm:p-5">
            <Button type="button" variant="outline" onClick={onClose} className="h-10 flex-1 rounded-xl" disabled={loading}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleConfirmar} className="h-10 flex-1 rounded-xl" disabled={loading}>
              {loading ? <Loader2 size={14} className="mr-2 animate-spin" /> : <CheckCircle2 size={14} className="mr-2" />}
              Salvar análise
            </Button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

function Info({ label, value, icon }) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="flex min-w-0 items-center gap-2 break-words text-sm font-semibold text-foreground">
        {icon}
        <span className="min-w-0 break-words">{value}</span>
      </p>
    </div>
  );
}
