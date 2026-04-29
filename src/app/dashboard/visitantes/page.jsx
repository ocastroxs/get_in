"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Users, ArrowRightLeft, LogOut, AlertTriangle,
  Search, Filter, X, Download, Plus,
  CreditCard, Clock, Loader2
} from "lucide-react";
import Topbar from "@/components/Topbar";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { VISITANTES_HOJE, ALERTAS_VISITANTES } from "@/lib/mockData";
import { api } from "@/services/api";

// ─── helpers ────────────────────────────────────────────────────────────────

const STATUS_OPTS = ["Todos", "ativo", "semsaida", "finalizado"];
const STATUS_LABEL = { ativo: "Ativo", semsaida: "Sem saída", finalizado: "Finalizado" };
const STATUS_STYLE = {
  ativo:      "bg-green-100 text-green-700",
  semsaida:   "bg-red-100   text-red-600",
  finalizado: "bg-blue-100  text-blue-700",
};
const STATUS_DOT = {
  ativo:      "bg-green-500",
  semsaida:   "bg-red-500",
  finalizado: "bg-blue-500",
};

function toCSV(rows) {
  const cols = ["Nome", "CPF", "Email", "Entrada", "Saída", "Status"];
  const lines = rows.map((r) =>
    [r.nome, r.cpf, r.email || "—", r.entrada, r.saida ?? "—", STATUS_LABEL[r.status] || r.status].join(";")
  );
  return [cols.join(";"), ...lines].join("\n");
}

function downloadCSV(data) {
  const blob = new Blob([toCSV(data)], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = "visitantes.csv"; a.click();
  URL.revokeObjectURL(url);
}

// ─── Modal Novo Visitante ────────────────────────────────────────────────────

function ModalNovoVisitante({ onClose, onSave, departamentos }) {
  const [form, setForm] = useState({
    nome: "", cpf: "", email: "", celular: "", idDepartamento: ""
  });
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const maskCPF = (v) =>
    v.replace(/\D/g, "")
     .replace(/(\d{3})(\d)/, "$1.$2")
     .replace(/(\d{3})(\d)/, "$1.$2")
     .replace(/(\d{3})(\d{1,2})/, "$1-$2")
     .replace(/(-\d{2})\d+?$/, "$1");

  async function handleSubmit() {
    if (!form.nome || !form.cpf) {
      setErro("Preencha Nome e CPF.");
      return;
    }
    setSaving(true);
    setErro("");
    try {
      // Cria usuário via POST /user/
      const resultado = await api.post('/user/', {
        nome: form.nome,
        cpf: form.cpf.replace(/\D/g, ""),
        cel: form.celular,
        email: form.email,
      });

      if (resultado && (resultado.sucesso || resultado.id)) {
        const novoUsuario = resultado.data || resultado;
        onSave({
          id: novoUsuario.id || Date.now(),
          nome: form.nome,
          cpf: form.cpf,
          email: form.email,
          celular: form.celular,
          entrada: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          saida: null,
          status: "ativo",
        });
        onClose();
      } else {
        setErro(resultado?.mensagem || "Erro ao cadastrar visitante.");
      }
    } catch (err) {
      console.error(err);
      setErro("Erro de conexão com o servidor.");
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
              <Plus size={15} className="text-primary" />
            </div>
            <h2 className="font-semibold text-foreground">Novo Visitante</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* body */}
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Nome completo *</label>
            <input
              type="text"
              value={form.nome}
              onChange={set("nome")}
              placeholder="Ex: João da Silva"
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">CPF *</label>
              <input
                type="text"
                value={form.cpf}
                onChange={(e) => setForm(p => ({ ...p, cpf: maskCPF(e.target.value) }))}
                placeholder="000.000.000-00"
                maxLength={14}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Celular</label>
              <input
                type="text"
                value={form.celular}
                onChange={set("celular")}
                placeholder="(11) 99999-9999"
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">E-mail</label>
            <input
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="visitante@email.com"
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
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
              <Plus size={13} />
            )}
            Cadastrar
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Alerta Banner ───────────────────────────────────────────────────────────

function AlertaBanner({ alerta, onDismiss }) {
  return (
    <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm text-yellow-800 animate-in fade-in slide-in-from-top-2 duration-300">
      <AlertTriangle size={16} className="text-yellow-500 shrink-0" />
      <span className="flex-1">{alerta.mensagem}</span>
      <button
        onClick={onDismiss}
        className="ml-auto shrink-0 text-yellow-400 hover:text-yellow-600 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ─── Linha da Tabela ─────────────────────────────────────────────────────────

function LinhaVisitante({ v, index }) {
  return (
    <tr className="border-b border-border hover:bg-accent/40 transition-all animate-in fade-in slide-in-from-left-2 duration-500" style={{ animationDelay: `${index * 50}ms` }}>
      <td className="py-3 px-4 font-medium text-sm text-foreground whitespace-nowrap">{v.nome}</td>
      <td className="py-3 px-4 text-sm text-muted-foreground font-mono">{v.cpf}</td>
      <td className="py-3 px-4 text-sm text-muted-foreground">{v.email || "—"}</td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock size={13} />
          {v.entrada || "—"}
        </div>
      </td>
      <td className="py-3 px-4 text-sm text-foreground">{v.saida ?? "—"}</td>
      <td className="py-3 px-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[v.status] || "bg-gray-100 text-gray-700"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[v.status] || "bg-gray-400"}`} />
          {STATUS_LABEL[v.status] || v.status}
        </span>
      </td>
    </tr>
  );
}

// ─── Página principal ────────────────────────────────────────────────────────

export default function VisitantesPage() {
  const [visitantes, setVisitantes]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [alertas, setAlertas]         = useState(ALERTAS_VISITANTES);
  const [modalAberto, setModalAberto] = useState(false);
  const [departamentos, setDepartamentos] = useState([]);

  // Filtros
  const [statusFiltro, setStatusFiltro] = useState("Todos");
  const [busca, setBusca]             = useState("");

  useEffect(() => {
    async function fetchDados() {
      try {
        setLoading(true);

        // Busca todos os usuários via GET /user/
        const data = await api.get('/user/');
        const lista = Array.isArray(data) ? data
          : (data?.data ?? data?.dados ?? null);

        if (lista && Array.isArray(lista)) {
          const mapped = lista.map(user => ({
            id: user.id,
            nome: user.nome || "Sem nome",
            cpf: user.cpf || "—",
            email: user.email || "—",
            celular: user.celular || user.cel || "—",
            entrada: user.dataDeCriacao
              ? new Date(user.dataDeCriacao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              : "—",
            saida: null,
            status: "ativo",
          }));
          setVisitantes(mapped);
        } else {
          // Fallback para dados de simulação
          setVisitantes(VISITANTES_HOJE);
        }

        // Busca departamentos para o modal
        const depData = await api.get('/dep/');
        const deps = Array.isArray(depData) ? depData : (depData?.data ?? depData?.dados ?? []);
        setDepartamentos(deps);

      } catch (error) {
        console.error('Erro ao buscar visitantes:', error);
        setVisitantes(VISITANTES_HOJE);
      } finally {
        setLoading(false);
      }
    }
    fetchDados();
  }, []);

  const filtrados = useMemo(() => {
    return visitantes.filter((v) => {
      const matchStatus  = statusFiltro === "Todos" || v.status === statusFiltro;
      const matchBusca   = busca.trim() === "" ||
        (v.nome || "").toLowerCase().includes(busca.toLowerCase()) ||
        (v.cpf || "").includes(busca) ||
        (v.email || "").toLowerCase().includes(busca.toLowerCase());
      return matchStatus && matchBusca;
    });
  }, [visitantes, statusFiltro, busca]);

  const stats = useMemo(() => ({
    total:      visitantes.length,
    ativos:     visitantes.filter((v) => v.status === "ativo").length,
    finalizados: visitantes.filter((v) => v.status === "finalizado").length,
    semsaida:   visitantes.filter((v) => v.status === "semsaida").length,
  }), [visitantes]);

  function limparFiltros() {
    setStatusFiltro("Todos");
    setBusca("");
  }

  function handleSave(novo) {
    setVisitantes((p) => [novo, ...p]);
  }

  return (
    <div className="space-y-6">
      {modalAberto && (
        <ModalNovoVisitante
          onClose={() => setModalAberto(false)}
          onSave={handleSave}
          departamentos={departamentos}
        />
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Visitantes</h1>
          <p className="text-sm text-muted-foreground">Gerencie os visitantes e usuários cadastrados no sistema.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => downloadCSV(filtrados)}>
            <Download size={16} /> Exportar
          </Button>
          <Button size="sm" className="gap-2" onClick={() => setModalAberto(true)}>
            <Plus size={16} /> Novo Visitante
          </Button>
        </div>
      </div>

      {/* Alertas */}
      {alertas.length > 0 && (
        <div className="space-y-2">
          {alertas.map((a, i) => (
            <AlertaBanner
              key={i}
              alerta={a}
              onDismiss={() => setAlertas((p) => p.filter((_, idx) => idx !== i))}
            />
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Visitantes" value={stats.total} icon={<Users size={20} className="text-primary" />} accentVar="var(--primary)" />
        <StatCard label="Ativos" value={stats.ativos} valueClassName="text-chart-2" icon={<ArrowRightLeft size={20} className="text-chart-2" />} accentVar="var(--chart-2)" />
        <StatCard label="Finalizados" value={stats.finalizados} valueClassName="text-chart-3" icon={<LogOut size={20} className="text-chart-3" />} accentVar="var(--chart-3)" />
        <StatCard label="Sem Saída" value={stats.semsaida} valueClassName="text-destructive" icon={<AlertTriangle size={20} className="text-destructive" />} accentVar="var(--destructive)" />
      </div>

      {/* Filtros */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Buscar por nome, CPF ou email..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <div className="flex items-center gap-1 mr-2 text-xs font-medium text-muted-foreground">
              <Filter size={14} /> Status:
            </div>
            {STATUS_OPTS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFiltro(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  statusFiltro === s
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {s === "Todos" ? "Todos" : STATUS_LABEL[s]}
              </button>
            ))}
            {(busca || statusFiltro !== "Todos") && (
              <button
                onClick={limparFiltros}
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
                <th className="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nome</th>
                <th className="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">CPF</th>
                <th className="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">E-mail</th>
                <th className="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Entrada</th>
                <th className="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Saída</th>
                <th className="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      <p className="text-sm text-muted-foreground">Carregando visitantes...</p>
                    </div>
                  </td>
                </tr>
              ) : filtrados.length > 0 ? (
                filtrados.map((v, i) => (
                  <LinhaVisitante key={v.id || i} v={v} index={i} />
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="w-12 h-12 text-muted/30" />
                      <p className="text-sm text-muted-foreground">Nenhum visitante encontrado.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border bg-muted/20 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Mostrando <strong>{filtrados.length}</strong> de <strong>{visitantes.length}</strong> visitantes
          </p>
        </div>
      </div>
    </div>
  );
}
