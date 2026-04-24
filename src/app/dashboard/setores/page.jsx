"use client";

/**
 * Página de Setores — GetIN
 *
 * INTEGRAÇÃO COM BACK-END
 * ──────────────────────────────────────────────────────────────────────
 * Este componente usa dados locais (SETORES_MOCK) e funções stub para
 * simular chamadas à API. Para ligar ao back-end real, substitua as
 * funções marcadas com "🔌 API" pelo seu serviço (fetch, axios, etc.).
 *
 * Endpoints sugeridos:
 *   GET    /api/setores            → lista todos os setores
 *   POST   /api/setores            → cria novo setor
 *   PUT    /api/setores/:id        → edita setor existente
 *   DELETE /api/setores/:id        → exclui setor
 */

import { useState, useMemo, useCallback } from "react";
import {
  Layers, CheckSquare, Activity, Lock,
  Filter, ChevronDown, Search, X,
  Plus, Download, Pencil, Trash2, Link2,
  ShieldAlert, ShieldCheck, ShieldOff,
  AlertTriangle, Check, HardHat,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { SETORES_MOCK } from "@/lib/setoresData";

// ─── Constantes de domínio ───────────────────────────────────────────────────

const ACESSO_OPTS   = ["Todos", "liberado", "restrito", "bloqueado"];
const STATUS_OPTS   = ["Todos", "ativo", "restrito", "inativo"];

const ACESSO_LABEL  = { liberado: "Liberado", restrito: "Restrito", bloqueado: "Bloqueado" };
const STATUS_LABEL  = { ativo: "Ativo",       restrito: "Restrito", inativo: "Inativo" };

const ACESSO_STYLE  = {
  liberado:  "bg-emerald-100 text-emerald-700 border-emerald-200",
  restrito:  "bg-red-100     text-red-600     border-red-200",
  bloqueado: "bg-gray-200    text-gray-600    border-gray-300",
};
const STATUS_STYLE  = {
  ativo:     "bg-green-100  text-green-700",
  restrito:  "bg-orange-100 text-orange-600",
  inativo:   "bg-gray-100   text-gray-500",
};
const STATUS_DOT    = {
  ativo:     "bg-green-500",
  restrito:  "bg-orange-400",
  inativo:   "bg-gray-400",
};
const ACESSO_ICON   = {
  liberado:  ShieldCheck,
  restrito:  ShieldAlert,
  bloqueado: ShieldOff,
};
const ACESSO_ICON_COLOR = {
  liberado:  "text-emerald-500",
  restrito:  "text-red-400",
  bloqueado: "text-gray-400",
};

const SETOR_VAZIO = {
  nome: "", responsavel: "", acesso: "liberado",
  status: "ativo", epiObrig: false,
};

// ─── API STUBS (substitua por chamadas reais) ─────────────────────────────────

/**
 * 🔌 API — busca lista de setores
 */
async function apiListarSetores() {
  try {
    const res = await fetch('http://localhost:3000/dep');
    if (!res.ok) throw new Error('Erro ao buscar setores');
    const data = await res.json();
    if (!data.sucesso) return SETORES_MOCK; // Fallback
    return data.data.map(dep => ({
      id: dep.id,
      nome: dep.nome,
      responsavel: dep.idGestor ? `Gestor ${dep.idGestor}` : 'N/A',
      acesso: 'liberado',
      status: 'ativo',
      epiObrig: false,
      visitantes: 0,
      fluxo: 0,
      ultimaAtualizacao: { data: new Date().toLocaleDateString(), hora: new Date().toLocaleTimeString() }
    }));
  } catch (error) {
    console.error(error);
    return SETORES_MOCK; // Fallback
  }
}

/**
 * 🔌 API — cria novo setor
 */
async function apiCriarSetor(payload) {
  try {
    const res = await fetch('http://localhost:3000/dep', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: payload.nome, idGestor: null })
    });
    if (!res.ok) throw new Error('Erro ao criar setor');
    const data = await res.json();
    if (!data.sucesso) throw new Error(data.mensagem);
    return { ...payload, id: Math.random(), visitantes: 0, fluxo: 0, ultimaAtualizacao: { data: new Date().toLocaleDateString(), hora: new Date().toLocaleTimeString() } };
  } catch (error) {
    console.error(error);
    // Fallback mock
    const nextNum = String(Math.floor(Math.random() * 900) + 100).padStart(3, "0");
    return { ...payload, id: `SET-${nextNum}`, visitantes: 0, fluxo: 0, ultimaAtualizacao: { data: "29/07", hora: "agora" } };
  }
}

/**
 * 🔌 API — edita setor existente
 * Como backend não tem PUT, usar mock
 */
async function apiEditarSetor(id, payload) {
  return { ...payload, id };
}

/**
 * 🔌 API — exclui setor
 * Como backend não tem DELETE, usar mock
 */
async function apiExcluirSetor(id) {
  return { ok: true };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toCSV(rows) {
  const cols = ["ID", "Nome", "Responsável", "Acesso", "Status", "Visitantes", "Fluxo", "EPI"];
  const lines = rows.map((r) =>
    [r.id, r.nome, r.responsavel, ACESSO_LABEL[r.acesso], STATUS_LABEL[r.status],
     r.visitantes, r.fluxo, r.epiObrig ? "Sim" : "Não"].join(";")
  );
  return [cols.join(";"), ...lines].join("\n");
}
function downloadCSV(rows) {
  const blob = new Blob([toCSV(rows)], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a"); a.href = url; a.download = "setores.csv"; a.click();
  URL.revokeObjectURL(url);
}

// ─── Barra de fluxo ──────────────────────────────────────────────────────────

function FluxoBar({ value, max }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const color = pct >= 75 ? "bg-primary" : pct >= 40 ? "bg-chart-2" : "bg-chart-3";
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-border rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-foreground tabular-nums">{value}</span>
    </div>
  );
}

// ─── Modal Confirmação de Exclusão ───────────────────────────────────────────

function ModalConfirmarExclusao({ setor, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-sm mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertTriangle size={16} className="text-destructive" />
            </div>
            <h2 className="font-semibold text-foreground">Excluir Setor</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir o setor{" "}
            <strong className="text-foreground">{setor.nome}</strong> ({setor.id})?
            Esta ação não pode ser desfeita.
          </p>
          {setor.visitantes > 0 && (
            <div className="mt-3 flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
              <AlertTriangle size={13} className="text-yellow-500 mt-0.5 shrink-0" />
              Atenção: este setor possui <strong>{setor.visitantes} visitante(s) ativo(s)</strong>. Remova-os antes de excluir.
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-muted/30">
          <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
          <Button
            size="sm"
            className="gap-1.5 bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20"
            onClick={onConfirm}
          >
            <Trash2 size={13} /> Confirmar exclusão
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Criar / Editar Setor ──────────────────────────────────────────────

function ModalSetor({ setor, onClose, onSave }) {
  const isEdicao = !!setor?.id;
  const [form, setForm] = useState(setor ?? SETOR_VAZIO);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  async function handleSubmit() {
    if (!form.nome.trim() || !form.responsavel.trim()) {
      setErro("Nome e Responsável são obrigatórios.");
      return;
    }
    setSaving(true);
    try {
      // 🔌 API: troca apiCriarSetor / apiEditarSetor pela sua chamada real
      const resultado = isEdicao
        ? await apiEditarSetor(setor.id, form)
        : await apiCriarSetor(form);
      onSave(resultado, isEdicao);
      onClose();
    } catch (e) {
      setErro("Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              {isEdicao ? <Pencil size={15} className="text-primary" /> : <Plus size={15} className="text-primary" />}
            </div>
            <h2 className="font-semibold text-foreground">{isEdicao ? "Editar Setor" : "Novo Setor"}</h2>
            {isEdicao && <span className="text-xs text-muted-foreground font-mono">({setor.id})</span>}
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* body */}
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Nome */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Nome do setor *</label>
            <input
              type="text"
              value={form.nome}
              onChange={set("nome")}
              placeholder="Ex: Área de Produção"
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>

          {/* Responsável */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Responsável *</label>
            <input
              type="text"
              value={form.responsavel}
              onChange={set("responsavel")}
              placeholder="Ex: Eng. Carlos Meier"
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>

          {/* Acesso + Status em linha */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Tipo de acesso</label>
              <div className="relative">
                <select
                  value={form.acesso}
                  onChange={set("acesso")}
                  className="w-full h-9 pl-3 pr-7 rounded-lg border border-border bg-background text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                >
                  <option value="liberado">Liberado</option>
                  <option value="restrito">Restrito</option>
                  <option value="bloqueado">Bloqueado</option>
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Status</label>
              <div className="relative">
                <select
                  value={form.status}
                  onChange={set("status")}
                  className="w-full h-9 pl-3 pr-7 rounded-lg border border-border bg-background text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                >
                  <option value="ativo">Ativo</option>
                  <option value="restrito">Restrito</option>
                  <option value="inativo">Inativo</option>
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          {/* EPI toggle */}
          <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border border-border">
            <div className="flex items-center gap-2">
              <HardHat size={15} className="text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">EPI Obrigatório</p>
                <p className="text-[11px] text-muted-foreground">Exige uso de equipamento de proteção</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, epiObrig: !p.epiObrig }))}
              className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${form.epiObrig ? "bg-primary justify-end" : "bg-border justify-start"}`}
            >
              <span className="w-5 h-5 bg-white rounded-full shadow-sm block" />
            </button>
          </div>

          {erro && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-destructive">
              <AlertTriangle size={13} /> {erro}
            </div>
          )}
        </div>

        {/* footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-muted/30">
          <Button variant="outline" size="sm" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button size="sm" className="gap-1.5" onClick={handleSubmit} disabled={saving}>
            {saving ? (
              <span className="w-3 h-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <Check size={13} />
            )}
            {isEdicao ? "Salvar alterações" : "Criar setor"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Linha da tabela ─────────────────────────────────────────────────────────

function LinhaSetor({ setor, fluxoMax, onEditar, onExcluir }) {
  const AcessoIcon = ACESSO_ICON[setor.acesso] ?? ShieldCheck;
  return (
    <tr className="border-b border-border hover:bg-accent/40 transition-colors group">
      {/* Setor */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${setor.acesso === "restrito" || setor.acesso === "bloqueado" ? "bg-red-50" : "bg-accent"}`}>
            <AcessoIcon size={15} className={ACESSO_ICON_COLOR[setor.acesso]} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground leading-tight">{setor.nome}</p>
            <p className="text-[11px] text-muted-foreground">
              {setor.id}{setor.epiObrig && " · EPI obrig."}
            </p>
          </div>
        </div>
      </td>

      {/* Responsável */}
      <td className="py-3 px-4 text-sm text-muted-foreground whitespace-nowrap">{setor.responsavel}</td>

      {/* Acesso */}
      <td className="py-3 px-4">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${ACESSO_STYLE[setor.acesso]}`}>
          {ACESSO_LABEL[setor.acesso]}
        </span>
      </td>

      {/* Status */}
      <td className="py-3 px-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[setor.status]}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[setor.status]}`} />
          {STATUS_LABEL[setor.status]}
        </span>
      </td>

      {/* Visitantes */}
      <td className="py-3 px-4 text-sm text-muted-foreground whitespace-nowrap">
        {setor.visitantes} pessoa{setor.visitantes !== 1 ? "s" : ""}
      </td>

      {/* Fluxo */}
      <td className="py-3 px-4">
        <FluxoBar value={setor.fluxo} max={fluxoMax} />
      </td>

      {/* Última atualização */}
      <td className="py-3 px-4">
        <p className="text-xs font-semibold text-foreground">{setor.ultimaAtualizacao?.data ?? "—"}</p>
        <p className="text-[11px] text-muted-foreground">{setor.ultimaAtualizacao?.hora ?? ""}</p>
      </td>

      {/* Ações */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
          <button
            title="Copiar link"
            onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/setores/${setor.id}`)}
            className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Link2 size={13} />
          </button>
          <button
            title="Editar setor"
            onClick={() => onEditar(setor)}
            className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 hover:border-primary/30 transition-colors"
          >
            <Pencil size={13} />
          </button>
          <button
            title="Excluir setor"
            onClick={() => onExcluir(setor)}
            className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function SetoresPage() {
  const [setores, setSetores]           = useState(SETORES_MOCK);
  const [statusFiltro, setStatusFiltro] = useState("Todos");
  const [acessoFiltro, setAcessoFiltro] = useState("Todos");
  const [busca, setBusca]               = useState("");

  // modais
  const [modalSetor, setModalSetor]     = useState(null);   // null | {} (novo) | { ...setor } (editar)
  const [modalExcluir, setModalExcluir] = useState(null);   // null | setor

  // ── filtro ──────────────────────────────────────────────────────────
  const filtrados = useMemo(() => {
    return setores.filter((s) => {
      const mStatus = statusFiltro === "Todos" || s.status === statusFiltro;
      const mAcesso = acessoFiltro === "Todos" || s.acesso === acessoFiltro;
      const mBusca  = busca.trim() === "" ||
        s.nome.toLowerCase().includes(busca.toLowerCase()) ||
        s.responsavel.toLowerCase().includes(busca.toLowerCase()) ||
        s.id.toLowerCase().includes(busca.toLowerCase());
      return mStatus && mAcesso && mBusca;
    });
  }, [setores, statusFiltro, acessoFiltro, busca]);

  // ── KPIs ─────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const maiorFluxo = setores.reduce((a, b) => b.fluxo > a.fluxo ? b : a, setores[0]);
    const bloqueados = setores.filter((s) => s.acesso === "bloqueado").length; 
    const restritos  = setores.filter((s) => s.acesso === "restrito").length;
    return {
      total:      setores.length,
      ativos:     setores.filter((s) => s.status === "ativo").length,
      pctAtivos:  Math.round((setores.filter((s) => s.status === "ativo").length / setores.length) * 100),
      maiorFluxo,
      bloqueados,
      restritos,
    };
  }, [setores]);

  const fluxoMax = useMemo(() => Math.max(...setores.map((s) => s.fluxo), 1), [setores]);

  // ── handlers ─────────────────────────────────────────────────────────

  function handleSalvar(resultado, isEdicao) {
    if (isEdicao) {
      setSetores((p) => p.map((s) => s.id === resultado.id ? { ...s, ...resultado } : s));
    } else {
      setSetores((p) => [resultado, ...p]);
    }
  }

  async function handleExcluir() {
    if (!modalExcluir) return;
    try {
      // 🔌 API: substituir por await apiExcluirSetor(modalExcluir.id)
      await apiExcluirSetor(modalExcluir.id);
      setSetores((p) => p.filter((s) => s.id !== modalExcluir.id));
    } catch {
      alert("Erro ao excluir setor.");
    } finally {
      setModalExcluir(null);
    }
  }

  return (
    <>
      {/* Modal criar/editar */}
      {modalSetor !== null && (
        <ModalSetor
          setor={modalSetor?.id ? modalSetor : null}
          onClose={() => setModalSetor(null)}
          onSave={handleSalvar}
        />
      )}

      {/* Modal confirmar exclusão */}
      {modalExcluir && (
        <ModalConfirmarExclusao
          setor={modalExcluir}
          onConfirm={handleExcluir}
          onClose={() => setModalExcluir(null)}
        />
      )}

      <div className="flex flex-col gap-5">

        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Setores</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Indústria Alimentos Puros · 29 de julho de 2025
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => downloadCSV(filtrados)}>
              <Download size={13} /> Exportar
            </Button>
            <Button size="sm" className="gap-1.5" onClick={() => setModalSetor({})}>
              <Plus size={13} /> Novo Setor
            </Button>
          </div>
        </header>

        {/* KPI Cards — reutiliza StatCard */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            label="Total de Setores"
            value={stats.total}
            icon={<Layers size={17} className="text-primary" />}
            delta={2}
            deltaDir="up"
            sub="este mês"
            accentVar="var(--primary)"
          />
          <StatCard
            label="Setores Ativos"
            value={stats.ativos}
            valueClassName="text-chart-2"
            icon={<CheckSquare size={17} className="text-chart-2" />}
            sub={
              <span>
                <strong className="text-chart-2">{stats.pctAtivos}%</strong> do total
              </span>
            }
            accentVar="var(--chart-2)"
          />
          <StatCard
            label="Maior Fluxo Hoje"
            value={
              <span className="text-chart-3 font-extrabold text-2xl leading-none">
                {stats.maiorFluxo?.nome ?? "—"}
              </span>
            }
            valueClassName=""
            icon={<Activity size={17} className="text-chart-3" />}
            sub={`${stats.maiorFluxo?.fluxo ?? 0} passagens hoje`}
            accentVar="var(--chart-3)"
          />
          <StatCard
            label="Bloqueados / Restritos"
            value={stats.bloqueados + stats.restritos}
            valueClassName="text-destructive"
            icon={<Lock size={17} className="text-destructive" />}
            sub={
              <span>
                <strong className="text-destructive">{stats.bloqueados} bloqueado</strong>
                {" · "}{stats.restritos} restritos
              </span>
            }
            accentVar="var(--destructive)"
          />
        </div>

        {/* Barra de filtros */}
        <div className="flex flex-wrap items-center gap-3 bg-card border border-border rounded-xl px-4 py-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Filter size={13} /> Filtros
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground">Status</label>
            <div className="relative">
              <select
                value={statusFiltro}
                onChange={(e) => setStatusFiltro(e.target.value)}
                className="h-8 pl-3 pr-7 rounded-lg border border-border bg-background text-xs text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer"
              >
                {STATUS_OPTS.map((s) => (
                  <option key={s} value={s}>{s === "Todos" ? "Todos" : STATUS_LABEL[s]}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Acesso */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground">Acesso</label>
            <div className="relative">
              <select
                value={acessoFiltro}
                onChange={(e) => setAcessoFiltro(e.target.value)}
                className="h-8 pl-3 pr-7 rounded-lg border border-border bg-background text-xs text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer"
              >
                {ACESSO_OPTS.map((a) => (
                  <option key={a} value={a}>{a === "Todos" ? "Todos" : ACESSO_LABEL[a]}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <button
            onClick={() => { setStatusFiltro("Todos"); setAcessoFiltro("Todos"); setBusca(""); }}
            className="text-xs text-primary hover:text-primary/70 font-medium transition-colors underline underline-offset-2"
          >
            Limpar filtros
          </button>

          <span className="ml-auto text-xs text-muted-foreground">
            {filtrados.length} registro{filtrados.length !== 1 ? "s" : ""} encontrado{filtrados.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Tabela */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {/* Cabeçalho da tabela */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Registro de Setores</h2>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar setor..."
                className="h-8 pl-8 pr-3 w-52 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              />
              {busca && (
                <button onClick={() => setBusca("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X size={11} />
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {["Setor", "Responsável", "Acesso", "Status", "Visitantes", "Fluxo", "Última Atualização", "Ações"].map((col) => (
                    <th key={col} className="py-2.5 px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                      Nenhum setor encontrado com os filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  filtrados.map((s) => (
                    <LinhaSetor
                      key={s.id}
                      setor={s}
                      fluxoMax={fluxoMax}
                      onEditar={(s) => setModalSetor(s)}
                      onExcluir={(s) => setModalExcluir(s)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  );
}