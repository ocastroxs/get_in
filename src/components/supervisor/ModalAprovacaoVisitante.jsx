"use client";

import { getActiveLanguage } from "@/lib/i18n-core";
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
import { api } from "@/services/api";
import { useToast } from "@/components/ui/toast-provider";
import { formatCPF, formatPhone } from "@/lib/utils";
import { normalizeMotivoVisita } from "@/lib/visitanteMotivos";

const STATUS_STYLE = {
  pendente: "border-amber-200 bg-amber-50 text-amber-700",
  aprovado: "border-green-200 bg-green-50 text-green-700",
  recusado: "border-red-200 bg-red-50 text-red-700",
  expirado: "border-slate-200 bg-slate-50 text-slate-700",
};

const STATUS_LABEL = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  recusado: "Recusado",
  expirado: "Expirado",
};

function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(getActiveLanguage(), {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function getSetorNome(item) {
  return item?.setor || item?.setores?.nome || item?.departamento?.nome || "-";
}

function pickFirst(...values) {
  return values.find((value) => value !== undefined && value !== null && String(value).trim() !== "") || "";
}

function getDescricaoValue(descricao, label) {
  if (typeof descricao !== "string") return "";

  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = descricao.match(new RegExp(`${escapedLabel}:\\s*([^|]+)`, "i"));

  return match?.[1]?.trim() || "";
}

function getObservacaoPortaria(requisicao) {
  const descricao = requisicao?.descricao || "";
  const observacao = pickFirst(
    requisicao?.observacoes,
    getDescricaoValue(descricao, "Observacao da Portaria"),
    getDescricaoValue(descricao, "Observacao"),
    getDescricaoValue(descricao, "Observacoes"),
    getDescricaoValue(descricao, "Observação da Portaria"),
    getDescricaoValue(descricao, "Observação"),
    getDescricaoValue(descricao, "Observações")
  );

  return observacao || "Nenhuma observação registrada pela portaria.";
}

function getSolicitacoes(requisicao) {
  const itens = requisicao?.setoresSolicitados || requisicao?.requisicoes || requisicao?.itens || [requisicao];

  return itens.filter(Boolean).map((item) => ({
    id: item.id,
    setor: getSetorNome(item),
    status: item.status || "pendente",
    motivo: normalizeMotivoVisita(item.motivo || requisicao?.motivo),
    dataDaRequisicao: item.dataDaRequisicao || requisicao?.dataDaRequisicao,
  }));
}

export default function ModalAprovacaoVisitante({ isOpen, onClose, requisicao, onConfirm }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [observacoes, setObservacoes] = useState("");
  const [decisoes, setDecisoes] = useState({});

  const solicitacoes = useMemo(() => getSolicitacoes(requisicao), [requisicao]);

  useEffect(() => {
    if (!requisicao) {
      return;
    }

    const initial = {};
    getSolicitacoes(requisicao).forEach((item) => {
      initial[item.id] = item.status || "pendente";
    });
    setDecisoes(initial);
    setObservacoes("");
  }, [requisicao]);

  async function handleConfirmar() {
    const updates = solicitacoes
      .filter((item) => item.id)
      .map((item) => ({
        id: item.id,
        status: decisoes[item.id] || item.status || "pendente",
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
  const observacaoPortaria = getObservacaoPortaria(requisicao);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-600">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Analisar visitante</h2>
              <p className="text-xs text-muted-foreground">Decida cada setor solicitado individualmente</p>
            </div>
          </div>
          <button type="button" onClick={onClose} disabled={loading} className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[calc(90vh-148px)] space-y-5 overflow-y-auto p-5">
          <section className="rounded-2xl border border-border bg-muted/30 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
              <Users size={16} className="text-primary" />
              Dados do visitante
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <Info label="Nome" value={usuario.nome || "-"} />
              <Info label="CPF" value={formatCPF(usuario.cpf) || "-"} />
              <Info label="E-mail" value={usuario.email || "-"} icon={<Mail size={14} />} />
              <Info label="Telefone" value={formatPhone(usuario.celular || usuario.telefone) || "-"} icon={<Phone size={14} />} />
              <Info label="Empresa" value={requisicao.empresa || "-"} icon={<Building2 size={14} />} />
              <Info label="Solicitado em" value={formatDateTime(requisicao.dataDaRequisicao)} icon={<Clock size={14} />} />
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <MapPin size={16} className="text-primary" />
              Setores solicitados
            </h3>
            <div className="grid gap-3">
              {solicitacoes.map((item) => {
                const status = decisoes[item.id] || item.status || "pendente";

                return (
                  <div key={item.id || item.setor} className="rounded-2xl border border-border bg-background p-4 shadow-xs">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-bold text-foreground">{item.setor}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{item.motivo}</p>
                      </div>
                      <span className={`w-fit rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLE[status] || STATUS_STYLE.pendente}`}>
                        {STATUS_LABEL[status] || status}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant={status === "aprovado" ? "default" : "outline"}
                        onClick={() => setDecisoes((current) => ({ ...current, [item.id]: "aprovado" }))}
                        className="h-9 gap-1.5 rounded-xl"
                        disabled={loading}
                      >
                        <CheckCircle2 size={14} />
                        Aprovar setor
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDecisoes((current) => ({ ...current, [item.id]: "recusado" }))}
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
                Descricao da requisicao
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{requisicao.descricao}</p>
            </section>
          )}

          <section className="rounded-2xl border border-blue-100 bg-blue-50/80 p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-blue-900">
              <FileText size={16} className="text-blue-700" />
              Observação da portaria
            </h3>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-blue-900/80">{observacaoPortaria}</p>
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

        <div className="sticky bottom-0 flex flex-col gap-2 border-t border-border bg-card p-5 sm:flex-row">
          <Button type="button" variant="outline" onClick={onClose} className="h-10 flex-1 rounded-xl" disabled={loading}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleConfirmar} className="h-10 flex-1 rounded-xl" disabled={loading}>
            {loading ? <Loader2 size={14} className="mr-2 animate-spin" /> : <CheckCircle2 size={14} className="mr-2" />}
            Salvar analise
          </Button>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value, icon }) {
  return (
    <div>
      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
        {icon}
        {value}
      </p>
    </div>
  );
}
