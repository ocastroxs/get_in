"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Layers, CheckSquare, Activity, Lock,
  Filter, Search, X,
  Plus, Pencil, Trash2,
  ShieldAlert, ShieldCheck, ShieldOff,
  AlertTriangle, Check, Loader2,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import Topbar from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ModalFiltro from "@/components/ui/ModalFiltro";
import { api } from "@/services/api";

// ─── CONSTANTES DE DOMÍNIO ───────────────────────────────────────────────────

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
  status: "ativo",
};

function normalizarAcesso(acesso, fallback = null) {
  const valor = String(acesso || "").toLowerCase();
  return ACESSO_LABEL[valor] ? valor : fallback;
}

function normalizarStatus(status, fallback = null) {
  const valor = String(status || "").toLowerCase();
  return STATUS_LABEL[valor] ? valor : fallback;
}

function normalizarSetor(setor) {
  return {
    ...setor,
    acesso: normalizarAcesso(setor?.acesso),
    status: normalizarStatus(setor?.status),
    responsavel: setor?.responsavel || "",
  };
}

function payloadSetor(form, { incluirCamposDeTela = false } = {}) {
   return{
    nome: form.nome.trim(),
    idGestor: form.idGestor || null,
    acesso: normalizarAcesso(form.acesso, "liberado"),
    status: normalizarStatus(form.status, "ativo"),
  };
  
  if (!incluirCamposDeTela) { payload.idGestor = null; }

  return payload;
}

function montarSetorLocal(form, data) {
  return {
    ...form,
    ...data,
    responsavel: form.responsavel?.trim() || null,
    acesso: normalizarAcesso(form.acesso, "liberado"),
    status: normalizarStatus(form.status, "ativo"),
  };
}

function mensagemErroSetor(response, acao) {
  if (response?.status === 404 && response?.mensagem?.includes("Cannot PUT")) {
    return "A API ainda não possui rota para editar setores.";
  }

  if (response?.status >= 500) {
    return "Erro interno no servidor ao salvar setor. Verifique o contrato do endpoint /setores no backend.";
  }

  return response?.mensagem || `Erro ao ${acao}.`;
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function toCSV(rows) {
  const cols = ["ID", "Nome", "Responsável", "Acesso", "Status"];
  const lines = rows.map((r) =>
    [r.id, r.nome, r.responsavel || "—", ACESSO_LABEL[r.acesso] || "—", STATUS_LABEL[r.status] || "—"].join(";")
  );
  return [cols.join(";"), ...lines].join("\n");
}

function downloadCSV(rows) {
  const blob = new Blob([toCSV(rows)], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a"); a.href = url; a.download = "setores.csv"; a.click();
  URL.revokeObjectURL(url);
}

// ─── MODAL CONFIRMAÇÃO DE EXCLUSÃO ───────────────────────────────────────────

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
            <strong className="text-foreground">{setor.nome}</strong>?
            Esta ação não pode ser desfeita.
          </p>
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

// ─── MODAL CRIAR / EDITAR SETOR ──────────────────────────────────────────────

function ModalSetor({ setor, onClose, onSave }) {
  const isEdicao = !!setor?.id;
  const [form, setForm] = useState(() => ({
    ...SETOR_VAZIO,
    ...(setor ?? {}),
    nome: setor?.nome || "",
    idGestor: setor?.idGestor || null,
    acesso: setor?.acesso || SETOR_VAZIO.acesso,
    status: setor?.status || SETOR_VAZIO.status,
  }));
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  async function handleSubmit() {
    if (!form.nome.trim()) {
      setErro("Nome é obrigatório.");
      return;
    }
    setSaving(true);
    try {
      const payload = payloadSetor(form, { incluirCamposDeTela: isEdicao });
      
      if (isEdicao) {
        const response = await api.put(`/setores/${setor.id}`, payload);
        if (response.sucesso) {
          onSave(response.data ? normalizarSetor(response.data) : null, true);
          onClose();
        } else {
          setErro(mensagemErroSetor(response, "salvar"));
        }
      } else {
        const response = await api.post('/setores', payload);
        if (response.sucesso) {
          onSave(response.data ? normalizarSetor(montarSetorLocal(form, response.data)) : null, false);
          onClose();
        } else {
          console.error("Erro ao criar setor:", JSON.stringify(payload), JSON.stringify(response));
          setErro(mensagemErroSetor(response, "criar"));
        }
      }
    } catch (e) {
      console.error(e);
      setErro(e?.message || "Erro de conexão com o servidor.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              {isEdicao ? <Pencil size={15} className="text-primary" /> : <Plus size={15} className="text-primary" />}
            </div>
            <h2 className="font-semibold text-foreground">{isEdicao ? "Editar Setor" : "Novo Setor"}</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {erro && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
              <AlertTriangle size={13} className="text-red-500 mt-0.5 shrink-0" />
              {erro}
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Nome do Setor *</label>
            <input
              type="text"
              value={form.nome}
              onChange={set("nome")}
              placeholder="Ex: Produção"
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Responsável</label>
            <input
              type="text"
              value={form.responsavel}
              onChange={set("responsavel")}
              placeholder="Ex: João Silva"
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Acesso</label>
            <select
              value={form.acesso}
              onChange={set("acesso")}
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            >
              {["liberado", "restrito", "bloqueado"].map(a => (
                <option key={a} value={a}>{ACESSO_LABEL[a]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Status</label>
            <select
              value={form.status}
              onChange={set("status")}
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            >
              {["ativo", "restrito", "inativo"].map(s => (
                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-muted/30">
          <Button variant="outline" size="sm" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button size="sm" className="gap-1.5" onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
            {isEdicao ? "Salvar alterações" : "Criar setor"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── LINHA DA TABELA ─────────────────────────────────────────────────────────

function LinhaSetor({ setor, onEditar, onExcluir }) {
  if (!setor) return null;
  
  const AcessoIcon = ACESSO_ICON[setor.acesso] ?? ShieldCheck;
  return (
    <tr className="group border-b border-border transition-colors duration-300 hover:bg-primary/[0.035]">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">
            {setor.id}
          </div>
          <div className="font-bold text-sm text-foreground">{setor.nome}</div>
        </div>
      </td>
      <td className="py-3 px-4 text-xs font-medium text-muted-foreground">{setor.responsavel || "—"}</td>
      <td className="py-3 px-4">
        {setor.acesso ? (
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${ACESSO_STYLE[setor.acesso]}`}>
            <AcessoIcon size={12} className={ACESSO_ICON_COLOR[setor.acesso]} />
            {ACESSO_LABEL[setor.acesso]}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </td>
      <td className="py-3 px-4">
        {setor.status ? (
          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold ${STATUS_STYLE[setor.status]}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[setor.status]}`} />
            {STATUS_LABEL[setor.status]}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </td>
      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => onEditar(setor)} className="rounded-xl p-2 text-muted-foreground transition-all duration-300 hover:bg-primary/8 hover:text-primary">
            <Pencil size={14} />
          </button>
          <button onClick={() => onExcluir(setor)} className="rounded-xl p-2 text-muted-foreground transition-all duration-300 hover:bg-destructive/8 hover:text-destructive">
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────

export default function SetoresPage() {
  const [setores, setSetores] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [statusFiltro, setStatusFiltro] = useState("Todos");
  const [acessoFiltro, setAcessoFiltro] = useState("Todos");
  const [busca, setBusca] = useState("");
  
  const [modalSetor, setModalSetor]     = useState({ open: false, data: null });
  const [modalExcluir, setModalExcluir] = useState({ open: false, data: null });
  
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
  const [tempStatusFiltro, setTempStatusFiltro] = useState("Todos");
  const [tempAcessoFiltro, setTempAcessoFiltro] = useState("Todos");

  const carregarSetores = async () => {
    setLoading(true);
    try {
      const response = await api.get('/setores');
      if (response.sucesso) {
        const data = (response.data || []).map(normalizarSetor);
        setSetores(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarSetores(); }, []);

  const filtrados = useMemo(() => {
    return setores.filter(s => {
      const matchStatus = statusFiltro === "Todos" || s.status === statusFiltro;
      const matchAcesso = acessoFiltro === "Todos" || s.acesso === acessoFiltro;
      const matchBusca  = !busca.trim() || s.nome.toLowerCase().includes(busca.toLowerCase());
      return matchStatus && matchAcesso && matchBusca;
    });
  }, [setores, statusFiltro, acessoFiltro, busca]);

  const stats = useMemo(() => ({
    total: setores.length,
    ativos: setores.filter(s => s.status === "ativo").length,
    restritos: setores.filter(s => s.acesso === "restrito").length,
    bloqueados: setores.filter(s => s.acesso === "bloqueado").length,
  }), [setores]);

  const handleSave = (data, isEdicao) => {
    if (!data?.id) {
      carregarSetores();
      return;
    }

    if (isEdicao) {
      setSetores(prev => prev.map(s => s.id === data.id ? data : s));
    } else {
      setSetores(prev => [data, ...prev]);
    }
  };

  const handleExcluir = async () => {
    const id = modalExcluir.data?.id;
    if (!id) return;
    try {
      const response = await api.delete(`/setores/${id}`);
      if (response.sucesso) {
        setSetores(prev => prev.filter(s => s.id !== id));
        setModalExcluir({ open: false, data: null });
      }
    } catch (e) {
      alert("Erro ao excluir setor.");
    }
  };

  const aplicarFiltros = () => {
    setStatusFiltro(tempStatusFiltro);
    setAcessoFiltro(tempAcessoFiltro);
  };

  const limparFiltros = () => {
    setTempStatusFiltro("Todos");
    setTempAcessoFiltro("Todos");
    setStatusFiltro("Todos");
    setAcessoFiltro("Todos");
    setBusca("");
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      <Topbar
        title="Gestão de Setores"
        subtitle="Controle de setores e níveis de acesso integrados ao backend."
        secondaryButtonText="Exportar CSV"
        onSecondaryButtonClick={() => downloadCSV(filtrados)}
        buttonText="Novo Setor"
        onButtonClick={() => setModalSetor({ open: true, data: null })}
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total" value={stats.total} valueClassName="text-primary" icon={<Layers size={17} className="text-primary" />} sub="setores" accentVar="var(--primary)" />
        <StatCard label="Operacionais" value={stats.ativos} valueClassName="text-green-600" icon={<CheckSquare size={17} className="text-green-600" />} sub="status ativo" accentVar="#16a34a" />
        <StatCard label="Acesso Restrito" value={stats.restritos} valueClassName="text-orange-600" icon={<Activity size={17} className="text-orange-600" />} sub="segurança média" accentVar="#ea580c" />
        <StatCard label="Bloqueados" value={stats.bloqueados} valueClassName="text-red-600" icon={<Lock size={17} className="text-red-600" />} sub="acesso especial" accentVar="var(--destructive)" />
      </div>

      {/* Barra de Filtros Padronizada */}
      <div className="bg-card border border-border rounded-[24px] p-5 shadow-md">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 items-center gap-3 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Buscar setor pelo nome..."
                className="pl-10 h-11 rounded-xl border-border/60 bg-background/80 text-sm transition-all duration-300 focus-visible:border-primary/40 focus-visible:ring-primary/20"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
              {busca && (
                <button
                  type="button"
                  onClick={() => setBusca("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            
            <Button
              type="button"
              onClick={() => setModalFiltroAberto(true)}
              variant="outline"
              className="h-11 px-4 gap-2 rounded-xl border-border/60 bg-background/80 transition-all duration-300 hover:border-primary/20 hover:bg-white hover:shadow-sm"
            >
              <Filter size={16} />
              <span className="hidden sm:inline">Filtros</span>
              {(statusFiltro !== "Todos" || acessoFiltro !== "Todos") && (
                <span className="ml-1 w-5 h-5 rounded-full bg-primary text-[10px] flex items-center justify-center text-primary-foreground">
                  {(statusFiltro !== "Todos" ? 1 : 0) + (acessoFiltro !== "Todos" ? 1 : 0)}
                </span>
              )}
            </Button>
          </div>

          <div className="px-3 py-2 rounded-xl border border-border/50 bg-muted/40 text-[11px] font-semibold text-muted-foreground shadow-sm shadow-slate-200/20">
            {filtrados.length} resultado(s)
          </div>
        </div>

        {(statusFiltro !== "Todos" || acessoFiltro !== "Todos" || busca) && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border/40">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">Filtros ativos:</span>
            {busca && (
              <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
                Busca: {busca}
              </span>
            )}
            {statusFiltro !== "Todos" && (
              <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
                Status: {STATUS_LABEL[statusFiltro]}
              </span>
            )}
            {acessoFiltro !== "Todos" && (
              <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
                Acesso: {ACESSO_LABEL[acessoFiltro]}
              </span>
            )}
            <Button
              variant="ghost"
              onClick={limparFiltros}
              className="h-7 px-2 text-[10px] text-muted-foreground transition-colors hover:bg-transparent hover:text-foreground"
            >
              Limpar tudo
            </Button>
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-[24px] overflow-hidden shadow-md">
        <div className="p-4 border-b border-border bg-muted/20">
          <h3 className="font-bold text-sm">Lista de Setores</h3>
          <p className="text-xs text-muted-foreground">Cadastro e níveis de acesso configurados no backend</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="px-4 py-3">Setor / ID</th>
                <th className="px-4 py-3">Responsável</th>
                <th className="px-4 py-3">Acesso</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Loader2 className="animate-spin" size={24} />
                      <span className="text-sm">Carregando setores...</span>
                    </div>
                  </td>
                </tr>
              ) : filtrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-sm text-muted-foreground">
                    Nenhum setor encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                filtrados.map(s => (
                  <LinhaSetor
                    key={s.id}
                    setor={s}
                    onEditar={(data) => setModalSetor({ open: true, data })}
                    onExcluir={(data) => setModalExcluir({ open: true, data })}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalSetor.open && (
        <ModalSetor
          setor={modalSetor.data}
          onClose={() => setModalSetor({ open: false, data: null })}
          onSave={handleSave}
        />
      )}
      {modalExcluir.open && (
        <ModalConfirmarExclusao
          setor={modalExcluir.data}
          onClose={() => setModalExcluir({ open: false, data: null })}
          onConfirm={handleExcluir}
        />
      )}

      {/* Modal de Filtro Padronizado */}
      <ModalFiltro
        isOpen={modalFiltroAberto}
        onClose={() => setModalFiltroAberto(false)}
        onApply={aplicarFiltros}
        onClear={limparFiltros}
      >
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
              Status Operacional
            </label>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTS.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setTempStatusFiltro(status)}
                  className={`flex items-center justify-center px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                    tempStatusFiltro === status
                      ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                      : "bg-background text-muted-foreground border-border/60 hover:border-primary/30 hover:bg-muted/40"
                  }`}
                >
                  {STATUS_LABEL[status] || status}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
              Nível de Acesso
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ACESSO_OPTS.map((acesso) => (
                <button
                  key={acesso}
                  type="button"
                  onClick={() => setTempAcessoFiltro(acesso)}
                  className={`flex items-center justify-center px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                    tempAcessoFiltro === acesso
                      ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                      : "bg-background text-muted-foreground border-border/60 hover:border-primary/30 hover:bg-muted/40"
                  }`}
                >
                  {ACESSO_LABEL[acesso] || acesso}
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
            <p className="text-[10px] text-primary/80 leading-relaxed">
              <strong>Info:</strong> Os filtros de status e acesso podem ser combinados para localizar setores com configurações específicas de segurança.
            </p>
          </div>
        </div>
      </ModalFiltro>
    </div>
  );
}
