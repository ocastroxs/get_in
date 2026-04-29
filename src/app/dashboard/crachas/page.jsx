"use client";

import { useState, useMemo, useEffect } from "react";
import {
  CreditCard, ArrowRightLeft, Undo2, AlertTriangle,
  Search, Filter, X, Download, Plus, Check,
  ChevronDown, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/StatCard";
import { api } from "@/services/api";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_LABEL = {
  disponivel: "Disponível",
  emUso:      "Em Uso",
  perdido:    "Perdido",
  // Mapeamentos adicionais para compatibilidade
  d:          "Disponível",
  e:          "Em Uso",
  p:          "Perdido",
};

const STATUS_STYLE = {
  disponivel: "bg-green-100 text-green-700",
  emUso:      "bg-amber-100 text-amber-700",
  perdido:    "bg-red-100   text-red-600",
  d:          "bg-green-100 text-green-700",
  e:          "bg-amber-100 text-amber-700",
  p:          "bg-red-100   text-red-600",
};

const STATUS_DOT = {
  disponivel: "bg-green-500",
  emUso:      "bg-amber-500",
  perdido:    "bg-red-500",
  d:          "bg-green-500",
  e:          "bg-amber-500",
  p:          "bg-red-500",
};

const STATUS_FILTER_OPTS = ["Todas", "disponivel", "emUso", "perdido"];

function toCSV(rows) {
  const cols = ["ID", "Código Tag", "Usuário", "Status", "Data de Criação"];
  const lines = rows.map((r) =>
    [r.id, r.codigoTag || "—", r.usuario || "—", STATUS_LABEL[r.status] || r.status, r.dataDeCriacao || "—"].join(";")
  );
  return [cols.join(";"), ...lines].join("\n");
}

function downloadCSV(data) {
  const blob = new Blob([toCSV(data)], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = "crachas.csv"; a.click();
  URL.revokeObjectURL(url);
}

// ─── Modal Novo Crachá ────────────────────────────────────────────────────────

function ModalNovoCracha({ onClose, onSave, usuarios }) {
  const [form, setForm] = useState({
    idUsuario: "", codigoTag: "", temporario: false, validade: ""
  });
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  async function handleSubmit() {
    if (!form.codigoTag) {
      setErro("Informe o código da tag RFID.");
      return;
    }
    setSaving(true);
    setErro("");
    try {
      // 1. Cria o crachá via POST /cracha/
      const crachaRes = await api.post('/cracha/', {});
      if (!crachaRes || (!crachaRes.sucesso && !crachaRes.id && !crachaRes.data?.id)) {
        throw new Error(crachaRes?.mensagem || "Erro ao criar crachá.");
      }

      const idCracha = crachaRes.data?.id || crachaRes.id;

      // 2. Se houver usuário selecionado, vincula a tag via POST /tags/
      if (form.idUsuario && idCracha) {
        const tagRes = await api.post('/tags/', {
          idUsuario: parseInt(form.idUsuario),
          idCracha: idCracha,
          codigoTag: form.codigoTag,
          temporario: form.temporario,
          validade: form.validade || null,
        });
        if (!tagRes || !tagRes.sucesso) {
          throw new Error(tagRes?.mensagem || "Erro ao vincular tag.");
        }
      }

      onSave({
        id: idCracha,
        codigoTag: form.codigoTag,
        idUsuario: form.idUsuario ? parseInt(form.idUsuario) : null,
        usuario: usuarios.find(u => String(u.id) === String(form.idUsuario))?.nome || "—",
        status: "disponivel",
        temporario: form.temporario,
        validade: form.validade || null,
        dataDeCriacao: new Date().toLocaleDateString('pt-BR'),
      });
      onClose();
    } catch (err) {
      console.error(err);
      setErro(err.message || "Erro ao criar crachá.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <CreditCard size={15} className="text-primary" />
            </div>
            <h2 className="font-semibold text-foreground">Novo Crachá</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* body */}
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Código da Tag RFID *</label>
            <input
              type="text"
              value={form.codigoTag}
              onChange={set("codigoTag")}
              placeholder="Ex: TAG123456"
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Vincular a Usuário (opcional)</label>
            <div className="relative">
              <select
                value={form.idUsuario}
                onChange={set("idUsuario")}
                className="w-full h-9 pl-3 pr-7 rounded-lg border border-border bg-background text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              >
                <option value="">— Selecionar usuário —</option>
                {usuarios.map(u => (
                  <option key={u.id} value={u.id}>{u.nome} ({u.cpf})</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border border-border">
            <div>
              <p className="text-sm font-medium text-foreground">Tag Temporária</p>
              <p className="text-[11px] text-muted-foreground">Crachá com prazo de validade</p>
            </div>
            <button
              type="button"
              onClick={() => setForm(p => ({ ...p, temporario: !p.temporario }))}
              className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${form.temporario ? "bg-primary justify-end" : "bg-border justify-start"}`}
            >
              <span className="w-5 h-5 bg-white rounded-full shadow-sm block" />
            </button>
          </div>

          {form.temporario && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Validade</label>
              <input
                type="datetime-local"
                value={form.validade}
                onChange={set("validade")}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              />
            </div>
          )}

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
            Criar Crachá
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Linha da Tabela ─────────────────────────────────────────────────────────

function LinhaCracha({ c, index }) {
  return (
    <tr className="border-b border-border hover:bg-accent/40 transition-all animate-in fade-in slide-in-from-left-2 duration-500" style={{ animationDelay: `${index * 50}ms` }}>
      <td className="py-3 px-4">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted text-xs font-mono text-muted-foreground border border-border">
          <CreditCard size={11} />
          {c.codigoTag || `#${c.id}`}
        </span>
      </td>
      <td className="py-3 px-4 text-sm text-foreground">{c.usuario || "—"}</td>
      <td className="py-3 px-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[c.status] || "bg-gray-100 text-gray-700"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[c.status] || "bg-gray-400"}`} />
          {STATUS_LABEL[c.status] || c.status}
        </span>
      </td>
      <td className="py-3 px-4 text-xs text-muted-foreground">
        {c.temporario ? "Temporário" : "Permanente"}
      </td>
      <td className="py-3 px-4 text-xs text-muted-foreground">
        {c.dataDeCriacao
          ? new Date(c.dataDeCriacao).toLocaleDateString('pt-BR')
          : "—"}
      </td>
    </tr>
  );
}

// ─── Página principal ────────────────────────────────────────────────────────

export default function CrachasPage() {
  const [crachas, setCrachas]         = useState([]);
  const [usuarios, setUsuarios]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [statusFiltro, setStatusFiltro] = useState("Todas");
  const [busca, setBusca]             = useState("");

  useEffect(() => {
    async function fetchDados() {
      setLoading(true);
      try {
        // Busca crachás via GET /cracha/
        const crachaData = await api.get('/cracha/');
        const listaCrachas = Array.isArray(crachaData) ? crachaData
          : (crachaData?.data ?? crachaData?.dados ?? []);
        setCrachas(listaCrachas);

        // Busca usuários para o modal de vinculação
        const userData = await api.get('/user/');
        const listaUsers = Array.isArray(userData) ? userData
          : (userData?.data ?? userData?.dados ?? []);
        setUsuarios(listaUsers);
      } catch (error) {
        console.error('Erro ao buscar crachás:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchDados();
  }, []);

  const filtrados = useMemo(() => {
    return crachas.filter((c) => {
      const matchStatus = statusFiltro === "Todas" || c.status === statusFiltro;
      const matchBusca  = busca.trim() === "" ||
        String(c.id).includes(busca) ||
        (c.codigoTag || "").toLowerCase().includes(busca.toLowerCase()) ||
        (c.usuario || "").toLowerCase().includes(busca.toLowerCase());
      return matchStatus && matchBusca;
    });
  }, [crachas, statusFiltro, busca]);

  const stats = useMemo(() => ({
    total:      crachas.length,
    disponiveis: crachas.filter(c => c.status === "disponivel" || c.status === "d").length,
    emUso:      crachas.filter(c => c.status === "emUso" || c.status === "e").length,
    perdidos:   crachas.filter(c => c.status === "perdido" || c.status === "p").length,
  }), [crachas]);

  function handleSave(novo) {
    setCrachas((p) => [novo, ...p]);
  }

  return (
    <div className="space-y-6">
      {modalAberto && (
        <ModalNovoCracha
          onClose={() => setModalAberto(false)}
          onSave={handleSave}
          usuarios={usuarios}
        />
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Crachás</h1>
          <p className="text-sm text-muted-foreground">Gerencie os crachás e tags RFID do sistema.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => downloadCSV(filtrados)}>
            <Download size={16} /> Exportar
          </Button>
          <Button size="sm" className="gap-2" onClick={() => setModalAberto(true)}>
            <Plus size={16} /> Novo Crachá
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total de Crachás" value={stats.total} icon={<CreditCard size={20} className="text-primary" />} accentVar="var(--primary)" />
        <StatCard label="Disponíveis" value={stats.disponiveis} valueClassName="text-chart-2" icon={<Check size={20} className="text-chart-2" />} accentVar="var(--chart-2)" />
        <StatCard label="Em Uso" value={stats.emUso} valueClassName="text-chart-4" icon={<ArrowRightLeft size={20} className="text-chart-4" />} accentVar="var(--chart-4)" />
        <StatCard label="Perdidos" value={stats.perdidos} valueClassName="text-destructive" icon={<AlertTriangle size={20} className="text-destructive" />} accentVar="var(--destructive)" />
      </div>

      {/* Filtros */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Buscar por ID, tag ou usuário..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <div className="flex items-center gap-1 mr-2 text-xs font-medium text-muted-foreground">
              <Filter size={14} /> Status:
            </div>
            {STATUS_FILTER_OPTS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFiltro(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  statusFiltro === s
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {s === "Todas" ? "Todas" : STATUS_LABEL[s]}
              </button>
            ))}
            {(busca || statusFiltro !== "Todas") && (
              <button
                onClick={() => { setBusca(""); setStatusFiltro("Todas"); }}
                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                title="Limpar filtros"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tag / ID</th>
                <th className="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Usuário</th>
                <th className="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tipo</th>
                <th className="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Criado em</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      <p className="text-sm text-muted-foreground">Carregando crachás...</p>
                    </div>
                  </td>
                </tr>
              ) : filtrados.length > 0 ? (
                filtrados.map((c, i) => (
                  <LinhaCracha key={c.id || i} c={c} index={i} />
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <CreditCard className="w-12 h-12 text-muted/30" />
                      <p className="text-sm text-muted-foreground">Nenhum crachá encontrado.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border bg-muted/20 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Mostrando <strong>{filtrados.length}</strong> de <strong>{crachas.length}</strong> crachás
          </p>
        </div>
      </div>
    </div>
  );
}
