"use client";

import { getActiveLanguage } from "@/lib/i18n-core";
import { useState, useMemo } from "react";
import {
  Layers, UserCheck, TrendingDown, TrendingUp,
  Filter, Search, X,
  Plus, Pencil, Trash2,
  AlertTriangle, Check, Download, Loader2,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import Topbar from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ModalFiltro from "@/components/ui/ModalFiltro";
import ModalPortal from "@/components/ui/ModalPortal";
import PaginationControls from "@/components/ui/PaginationControls";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { usePagination } from "@/hooks/usePagination";
import { api } from "@/services/api";
import { exportTableToPdf } from "@/lib/exportPdf";

// ─── CONSTANTES DE DOMÍNIO ───────────────────────────────────────────────────

const STATUS_OPTS   = ["Todos", "Ativo", "Inativo"];

const ACESSO_LABEL  = { liberado: "Liberado", restrito: "Restrito", bloqueado: "Bloqueado" };
const STATUS_LABEL  = { ativo: "Ativo",       restrito: "Restrito", inativo: "Inativo" };

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
const SETOR_VAZIO = {
  nome: "", responsavel: "", idGestor: "", acesso: "Liberado",
  status: "Ativo",
};

function acessoKey(acesso) {
  return String(acesso || "").toLowerCase();
}

function normalizarAcesso(acesso, fallback = null) {
  const key = acessoKey(acesso);
  return ACESSO_LABEL[key] || fallback;
}

function statusKey(status) {
  return String(status || "").toLowerCase();
}

function normalizarStatus(status, fallback = null) {
  const key = statusKey(status);
  return STATUS_LABEL[key] || fallback;
}

function normalizarSetor(setor) {
  return {
    ...setor,
    acesso: normalizarAcesso(setor?.acesso),
    status: normalizarStatus(setor?.status),
    responsavel: setor?.responsavel || "",
  };
}

function payloadSetor(form) {
  return {
    nome: form.nome.trim(),
    idGestor: form.idGestor ? Number(form.idGestor) : null,
    acesso: normalizarAcesso(form.acesso, "Liberado"),
    status: normalizarStatus(form.status, "Ativo"),
  };
}

function montarSetorLocal(form, data) {
  return {
    ...form,
    ...data,
    responsavel: form.responsavel?.trim() || null,
    acesso: normalizarAcesso(form.acesso, "Liberado"),
    status: normalizarStatus(form.status, "Ativo"),
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

function formatarData(value) {
  if (!value) return null;
  const data = new Date(value);
  if (Number.isNaN(data.getTime())) return value;
  return data.toLocaleString(getActiveLanguage(), {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getSetorRequisicao(requisicao) {
  return {
    id: Number(requisicao?.idSetor || requisicao?.setores?.id),
    nome: requisicao?.setores?.nome || requisicao?.setor || "",
  };
}

function enriquecerSetoresComVisitas(setores, requisicoes) {
  return setores.map((setor) => {
    const relacionadas = requisicoes.filter((requisicao) => {
      const setorReq = getSetorRequisicao(requisicao);
      return setorReq.id === Number(setor.id) || setorReq.nome === setor.nome;
    });
    const ultima = relacionadas
      .map((requisicao) => new Date(requisicao.dataDaRequisicao || requisicao.validade || 0))
      .filter((data) => !Number.isNaN(data.getTime()))
      .sort((a, b) => b - a)[0];

    return {
      ...setor,
      visitantes: relacionadas.length,
      ultimaVisita: ultima ? ultima.toISOString() : null,
    };
  });
}

// ─── MODAL CONFIRMAÇÃO DE EXCLUSÃO ───────────────────────────────────────────

function ModalConfirmarExclusao({ setor, onConfirm, onClose }) {
  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="max-h-[calc(100vh-2rem)] w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
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
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5" data-lenis-prevent>
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
    </ModalPortal>
  );
}

// ─── MODAL CRIAR / EDITAR SETOR ──────────────────────────────────────────────

function ModalSetor({ setor, gestores, onClose, onSave }) {
  const isEdicao = !!setor?.id;
  const [form, setForm] = useState(() => ({
    ...SETOR_VAZIO,
    ...(setor ?? {}),
    nome: setor?.nome || "",
    idGestor: setor?.idGestor || "",
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
      const payload = payloadSetor(form);
      
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
    <ModalPortal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-xl animate-in zoom-in-95 duration-300">
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

        <div className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-5" data-lenis-prevent>
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
            <select
              value={form.idGestor}
              onChange={set("idGestor")}
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            >
              <option value="">Sem gestor</option>
              {gestores.map((gestor) => (
                <option key={gestor.id} value={gestor.id}>
                  {gestor.gestor}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Acesso</label>
            <select
              value={form.acesso}
              onChange={set("acesso")}
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            >
              {["Liberado", "Restrito", "Bloqueado"].map(a => (
                <option key={a} value={a}>{ACESSO_LABEL[acessoKey(a)]}</option>
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
              {["Ativo", "Restrito", "Inativo"].map(s => (
                <option key={s} value={s}>{STATUS_LABEL[statusKey(s)]}</option>
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
    </ModalPortal>
  );
}

// ─── LINHA DA TABELA ─────────────────────────────────────────────────────────

function LinhaSetor({ setor, onEditar, onExcluir }) {
  if (!setor) return null;

  return (
    <tr className="group border-b border-border transition-colors duration-300 hover:bg-primary/[0.035]">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">
            {(setor.nome || "?").slice(0, 2).toUpperCase()}
          </div>
          <div className="font-bold text-sm text-foreground">{setor.nome}</div>
        </div>
      </td>
      <td className="py-3 px-4 text-sm font-bold text-foreground">{setor.visitantes || 0}</td>
      <td className="py-3 px-4 text-xs font-medium text-muted-foreground">{formatarData(setor.ultimaVisita) || "-"}</td>
      <td className="py-3 px-4 text-xs font-medium text-muted-foreground">{setor.responsavel || "-"}</td>
      <td className="py-3 px-4">
        {setor.status ? (
          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold ${STATUS_STYLE[statusKey(setor.status)]}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[statusKey(setor.status)]}`} />
            {STATUS_LABEL[statusKey(setor.status)]}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
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

// PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────

export default function SetoresPage() {
  const [setores, setSetores] = useState([]);
  const [gestores, setGestores] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [statusFiltro, setStatusFiltro] = useState("Todos");
  const [busca, setBusca] = useState("");
  
  const [modalSetor, setModalSetor]     = useState({ open: false, data: null });
  const [modalExcluir, setModalExcluir] = useState({ open: false, data: null });
  
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
  const [tempStatusFiltro, setTempStatusFiltro] = useState("Todos");

  const carregarSetores = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const [response, gestoresResponse, requisicoesResponse] = await Promise.all([
        api.get('/setores'),
        api.get('/views/gestores'),
        api.get('/requisicao-visitante'),
      ]);
      if (response.sucesso) {
        const requisicoes = requisicoesResponse.sucesso && Array.isArray(requisicoesResponse.data)
          ? requisicoesResponse.data
          : [];
        const data = enriquecerSetoresComVisitas((response.data || []).map(normalizarSetor), requisicoes);
        setSetores(data);
      }
      if (gestoresResponse.sucesso) {
        setGestores(gestoresResponse.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useAutoRefresh(carregarSetores);

  const filtrados = useMemo(() => {
    return setores.filter(s => {
      const matchStatus = statusFiltro === "Todos" || s.status === statusFiltro;
      const matchBusca  = !busca.trim() || s.nome.toLowerCase().includes(busca.toLowerCase());
      return matchStatus && matchBusca;
    });
  }, [setores, statusFiltro, busca]);

  const {
    page,
    setPage,
    pageSize,
    totalItems,
    totalPages,
    paginatedItems: setoresPagina,
  } = usePagination(filtrados);

  const stats = useMemo(() => ({
    total: setores.length,
    comResponsavel: setores.filter(s => Number(s.idGestor) > 0 || Boolean(String(s.responsavel || "").trim())).length,
    maisVisitado: setores.reduce((a, b) => (b.visitantes || 0) > (a.visitantes || 0) ? b : a, setores[0]) || {},
    menosVisitado: setores.reduce((a, b) => (b.visitantes || 0) < (a.visitantes || 0) ? b : a, setores[0]) || {},
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
  };

  const limparFiltros = () => {
    setTempStatusFiltro("Todos");
    setStatusFiltro("Todos");
    setBusca("");
  };

  async function exportarPDF() {
    if (filtrados.length === 0) {
      alert("Não há dados para exportar.");
      return;
    }

    try {
      await exportTableToPdf({
        title: "Setores",
        subtitle: "Controle de setores integrado ao backend",
        fileName: `setores_${new Date().toISOString().split("T")[0]}.pdf`,
        filters: [
          busca ? `Busca: ${busca}` : null,
          statusFiltro !== "Todos" ? `Status: ${STATUS_LABEL[statusKey(statusFiltro)] || statusFiltro}` : null,
        ].filter(Boolean),
        columns: [
          { header: "Setor", weight: 1.4 },
          { header: "Visitantes", weight: 0.8 },
          { header: "Última Visita", weight: 1 },
          { header: "Responsável", weight: 1.2 },
          { header: "Status", weight: 0.8 },
        ],
        rows: filtrados.map((setor) => [
          setor.nome || "-",
          setor.visitantes || 0,
          formatarData(setor.ultimaVisita) || "-",
          setor.responsavel || "-",
          STATUS_LABEL[statusKey(setor.status)] || setor.status || "-",
        ]),
      });
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      alert("Não foi possível exportar o PDF.");
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      <Topbar
        title="Gestão de Setores"
        subtitle="Controle de setores integrado ao backend."
        buttonText="Novo Setor"
        onButtonClick={() => setModalSetor({ open: true, data: null })}
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total" value={stats.total} valueClassName="text-primary" icon={<Layers size={17} className="text-primary" />} sub="setores" accentVar="var(--primary)" />
        <StatCard label="Com Responsável" value={stats.comResponsavel} valueClassName="text-blue-600" icon={<UserCheck size={17} className="text-blue-600" />} sub="gestor definido" accentVar="#2563eb" />
        <StatCard label="Mais Visitado" value={stats.maisVisitado?.nome || "—"} valueClassName="text-foreground font-bold text-sm" icon={<TrendingUp size={17} className="text-foreground" />} sub={`${stats.maisVisitado?.visitantes || 0} visitas`} accentVar="var(--chart-4)" />
        <StatCard label="Menos Visitado" value={stats.menosVisitado?.nome || "—"} valueClassName="text-foreground font-bold text-sm" icon={<TrendingDown size={17} className="text-muted-foreground" />} sub={`${stats.menosVisitado?.visitantes || 0} visitas`} accentVar="var(--border)" />
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
              {statusFiltro !== "Todos" && (
                <span className="ml-1 w-5 h-5 rounded-full bg-primary text-[10px] flex items-center justify-center text-primary-foreground">
                  1
                </span>
              )}
            </Button>
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:justify-end">
            <Button
              type="button"
              onClick={exportarPDF}
              variant="outline"
              disabled={loading || filtrados.length === 0}
              className="h-11 gap-2 rounded-xl border-border/60 bg-background/80 px-4 text-sm font-medium"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Exportar PDF</span>
            </Button>
            <div className="px-3 py-2 rounded-xl border border-border/50 bg-muted/40 text-[11px] font-semibold text-muted-foreground shadow-sm shadow-slate-200/20">
              {filtrados.length} resultado(s)
            </div>
          </div>
        </div>

        {(statusFiltro !== "Todos" || busca) && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border/40">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">Filtros ativos:</span>
            {busca && (
              <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
                Busca: {busca}
              </span>
            )}
            {statusFiltro !== "Todos" && (
              <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
                Status: {STATUS_LABEL[statusKey(statusFiltro)] || statusFiltro}
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
          <p className="text-xs text-muted-foreground">Cadastro de setores configurados no backend</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="px-4 py-3">Setor</th>
                <th className="px-4 py-3">Visitantes</th>
                <th className="px-4 py-3">Última Visita</th>
                <th className="px-4 py-3">Responsável</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Loader2 className="animate-spin" size={24} />
                      <span className="text-sm">Carregando setores...</span>
                    </div>
                  </td>
                </tr>
              ) : filtrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-sm text-muted-foreground">
                    Nenhum setor encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                setoresPagina.map(s => (
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
        <PaginationControls
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          currentCount={setoresPagina.length}
          onPageChange={setPage}
          itemLabel="setor(es)"
        />
      </div>

      {modalSetor.open && (
        <ModalSetor
          setor={modalSetor.data}
          gestores={gestores}
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
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                    tempStatusFiltro === status
                      ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                      : "bg-background text-muted-foreground border-border/60 hover:border-primary/30 hover:bg-muted/40"
                  }`}
                >
                  {STATUS_LABEL[statusKey(status)] || status}
                  {tempStatusFiltro === status && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>

        </div>
      </ModalFiltro>
    </div>
  );
}
