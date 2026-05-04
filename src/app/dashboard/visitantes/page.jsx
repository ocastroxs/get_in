"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Users, ArrowRightLeft, LogOut, AlertTriangle,
  Search, X, Plus, CreditCard, ChevronDown, Check, Loader2,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/StatCard";
import { api } from "@/services/api";
import { VISITANTES_HOJE, ALERTAS_VISITANTES } from "@/lib/mockData";

// ─── HELPERS & CONFIG ────────────────────────────────────────────────────────

const STATUS_LABEL = {
  ativo:      "Ativo",
  semsaida:   "Sem saída",
  finalizado: "Finalizado",
  pendente:   "Pendente"
};

const STATUS_STYLE = {
  ativo:      "bg-green-100 text-green-700",
  semsaida:   "bg-red-100   text-red-600",
  finalizado: "bg-blue-100  text-blue-700",
  pendente:   "bg-amber-100 text-amber-700",
};

const STATUS_DOT = {
  ativo:      "bg-green-500",
  semsaida:   "bg-red-500",
  finalizado: "bg-blue-500",
  pendente:   "bg-amber-500",
};

const SETORES = ["Adm", "Lab", "Prod", "Alm", "Recepção", "Diretoria"];

// ─── STUBS DE API (PRONTO PARA INTEGRAR) ──────────────────────────────────────

async function apiListarVisitantes() {
  try {
    const response = await api.get("/requisicao-visitante");
    if (response.sucesso) return response.data;
    return VISITANTES_HOJE;
  } catch (error) {
    console.error("Erro ao listar visitantes:", error);
    return VISITANTES_HOJE;
  }
}

async function apiRegistrarEntrada(dados) {
  try {
    const payload = {
      idUsuario: dados.idUsuario || 1, 
      idDepartamento: dados.idDepartamento || 1,
      motivo: dados.motivo || "Visita Técnica",
      validade: new Date().toISOString()
    };
    
    const response = await api.post("/requisicao-visitante", payload);
    return response;
  } catch (error) {
    console.error("Erro ao registrar entrada:", error);
    return { sucesso: false, mensagem: "Erro de conexão com o servidor." };
  }
}

// ─── COMPONENTES DE APOIO ────────────────────────────────────────────────────

function ModalNovoVisitante({ onClose, onSave }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: "", empresa: "", cpf: "", setor: "Adm", entrada: "", cracha: ""
  });

  const maskCPF = (v) =>
    v.replace(/\D/g, "")
     .replace(/(\d{3})(\d)/, "$1.$2")
     .replace(/(\d{3})(\d)/, "$1.$2")
     .replace(/(\d{3})(\d{1,2})/, "$1-$2")
     .replace(/(-\d{2})\d+?$/, "$1");

  async function handleSubmit() {
    if (!form.nome || !form.empresa || !form.cpf) {
      alert("Preencha os campos obrigatórios.");
      return;
    }
    
    setLoading(true);
    await apiRegistrarEntrada(form);
    
    setTimeout(() => {
      onSave({
        ...form,
        id: Date.now(),
        entrada: form.entrada || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "ativo",
        cracha: form.cracha || "TAG-NOVA"
      });
      setLoading(false);
      onClose();
    }, 800);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Plus size={16} className="text-primary" />
            </div>
            <h2 className="font-semibold text-foreground">Novo Visitante</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Nome completo *</label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) => setForm({...form, nome: e.target.value})}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">CPF *</label>
              <input
                type="text"
                value={form.cpf}
                onChange={(e) => setForm({...form, cpf: maskCPF(e.target.value)})}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Empresa *</label>
              <input
                type="text"
                value={form.empresa}
                onChange={(e) => setForm({...form, empresa: e.target.value})}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Setor</label>
              <select
                value={form.setor}
                onChange={(e) => setForm({...form, setor: e.target.value})}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
              >
                {SETORES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Crachá (TAG)</label>
              <input
                type="text"
                placeholder="Ex: TAG-001"
                value={form.cracha}
                onChange={(e) => setForm({...form, cracha: e.target.value})}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-muted/30">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button size="sm" className="gap-1.5" onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
            Registrar Entrada
          </Button>
        </div>
      </div>
    </div>
  );
}

function LinhaVisitante({ v, index }) {
  return (
    <tr className="border-b border-border hover:bg-accent/40 transition-colors">
      <td className="py-3 px-4">
        <div className="text-sm font-medium text-foreground">{v.nome}</div>
        <div className="text-[10px] text-muted-foreground font-mono">{v.cpf}</div>
      </td>
      <td className="py-3 px-4 text-sm text-primary font-medium whitespace-nowrap">{v.empresa}</td>
      <td className="py-3 px-4">
        <div className="text-xs font-semibold text-foreground">{v.setor}</div>
      </td>
      <td className="py-3 px-4 text-sm text-foreground">{v.entrada}</td>
      <td className="py-3 px-4 text-sm text-muted-foreground">{v.saida ?? "—"}</td>
      <td className="py-3 px-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[v.status] ?? "bg-muted text-muted-foreground"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[v.status] ?? "bg-muted-foreground"}`} />
          {STATUS_LABEL[v.status] || v.status}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted text-[10px] font-mono text-muted-foreground border border-border">
          <CreditCard size={10} />
          {v.cracha || "—"}
        </span>
      </td>
      <td className="py-3 px-4">
        <button className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
          <MoreHorizontal size={14} />
        </button>
      </td>
    </tr>
  );
}

export default function VisitantesPage() {
  const [visitantes, setVisitantes]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [alertas, setAlertas]         = useState(ALERTAS_VISITANTES);
  
  const [statusFiltro, setStatusFiltro] = useState("Todos");
  const [busca, setBusca]             = useState("");

  const carregarDados = async () => {
    setLoading(true);
    const dados = await apiListarVisitantes();
    setVisitantes(dados);
    setLoading(false);
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const filtrados = useMemo(() => {
    return visitantes.filter((v) => {
      const matchStatus = statusFiltro === "Todos" || v.status === statusFiltro;
      const q = busca.trim().toLowerCase();
      const matchBusca = !q ||
        v.nome.toLowerCase().includes(q) ||
        v.empresa.toLowerCase().includes(q) ||
        v.cpf.includes(q);
      return matchStatus && matchBusca;
    });
  }, [visitantes, statusFiltro, busca]);

  const stats = useMemo(() => ({
    total:      visitantes.length,
    ativos:     visitantes.filter((v) => v.status === "ativo").length,
    finalizados: visitantes.filter((v) => v.status === "finalizado").length,
    alertas:    visitantes.filter((v) => v.status === "semsaida").length,
  }), [visitantes]);

  return (
    <>
      {modalAberto && (
        <ModalNovoVisitante
          onClose={() => setModalAberto(false)}
          onSave={(novo) => setVisitantes(p => [novo, ...p])}
        />
      )}

      <div className="flex flex-col gap-5">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Dashboard Visitantes</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Controle de acesso e monitoramento de visitantes em tempo real
            </p>
          </div>
          <button
            onClick={() => setModalAberto(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus size={16} /> Registrar Visitante
          </button>
        </header>

        {alertas.length > 0 && (
          <div className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-800 animate-in fade-in slide-in-from-top-2 duration-500">
            <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p><strong>{alertas.length} visitantes com tempo de permanência excedido.</strong> Favor verificar a saída ou renovar a autorização.</p>
            </div>
            <button onClick={() => setAlertas([])} className="text-red-400 hover:text-red-600">
              <X size={14} />
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label="Total Hoje"
            value={stats.total}
            icon={<Users size={17} className="text-primary" />}
            accentVar="var(--primary)"
          />
          <StatCard
            label="Na Empresa"
            value={stats.ativos}
            valueClassName="text-green-600"
            icon={<ArrowRightLeft size={17} className="text-green-600" />}
            accentVar="var(--green-500)"
          />
          <StatCard
            label="Check-outs"
            value={stats.finalizados}
            icon={<LogOut size={17} className="text-blue-600" />}
            accentVar="var(--blue-500)"
          />
          <StatCard
            label="Alertas"
            value={stats.alertas}
            valueClassName="text-red-600"
            icon={<AlertTriangle size={17} className="text-red-600" />}
            accentVar="var(--red-500)"
          />
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between p-4 gap-4 border-b border-border bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar visitante..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="h-9 pl-9 pr-4 w-full md:w-64 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                />
              </div>
              <select
                value={statusFiltro}
                onChange={(e) => setStatusFiltro(e.target.value)}
                className="h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
              >
                <option value="Todos">Todos Status</option>
                <option value="ativo">Ativos</option>
                <option value="finalizado">Finalizados</option>
                <option value="semsaida">Alertas</option>
              </select>
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              {filtrados.length} registro(s) encontrado(s)
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="py-3 px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Visitante</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Empresa</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Setor</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Entrada</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Saída</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Crachá</th>
                  <th className="py-3 px-4 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Loader2 className="animate-spin" size={24} />
                        <span className="text-sm">Carregando visitantes...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-20 text-center text-sm text-muted-foreground">
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                ) : (
                  filtrados.map((v, i) => (
                    <LinhaVisitante key={v.id || i} v={v} index={i} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}"