"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Users, ArrowRightLeft, LogOut, AlertTriangle,
  Search, X, Plus, CreditCard, Check, Loader2,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/StatCard";
import { api } from "@/services/api";

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

function toCSV(rows) {
  const cols = ["Nome", "Empresa", "CPF", "Setor", "Entrada", "Saída", "Status"];
  const lines = rows.map((r) =>
    [r.nome, r.empresa, r.cpf, r.setor, r.entrada, r.saida ?? "—", STATUS_LABEL[r.status]].join(";")
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

// ─── MODAL NOVO VISITANTE ───────────────────────────────────────────────────

function ModalNovoVisitante({ onClose, onSave }) {
  const [form, setForm] = useState({
    nome: "", empresa: "", cpf: "", setor: "Adm", motivo: ""
  });
  const [loading, setLoading] = useState(false);

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
    try {
      const payload = {
        idUsuario: 1,
        idDepartamento: 1,
        motivo: form.motivo || "Visita",
        validade: new Date().toISOString()
      };
      
      const response = await api.post('/requisicao-visitante', payload);
      
      if (response.sucesso) {
        onSave();
        onClose();
      } else {
        alert(response.mensagem || "Erro ao registrar visitante.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
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
          <p className="text-xs text-muted-foreground">
            Registre um novo visitante no sistema. Todos os campos marcados com * são obrigatórios.
          </p>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Nome completo *</label>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => setForm({...form, nome: e.target.value})}
              placeholder="Ex: Marina Souza"
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Empresa *</label>
            <input
              type="text"
              value={form.empresa}
              onChange={(e) => setForm({...form, empresa: e.target.value})}
              placeholder="Ex: Nutrilab"
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">CPF *</label>
            <input
              type="text"
              value={form.cpf}
              onChange={(e) => setForm({...form, cpf: maskCPF(e.target.value)})}
              placeholder="000.000.000-00"
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Setor</label>
            <select
              value={form.setor}
              onChange={(e) => setForm({...form, setor: e.target.value})}
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            >
              {SETORES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Motivo da Visita</label>
            <input
              type="text"
              value={form.motivo}
              onChange={(e) => setForm({...form, motivo: e.target.value})}
              placeholder="Ex: Visita Técnica"
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-muted/30">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button size="sm" className="gap-1.5" onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
            Registrar Visitante
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── LINHA DA TABELA ─────────────────────────────────────────────────────────

function LinhaVisitante({ v }) {
  return (
    <tr className="border-b border-border hover:bg-accent/40 transition-colors">
      <td className="py-3 px-4">
        <div className="text-sm font-medium text-foreground">{v.nome}</div>
        <div className="text-[10px] text-muted-foreground font-mono">{v.cpf}</div>
      </td>
      <td className="py-3 px-4 text-sm text-primary font-medium whitespace-nowrap">{v.empresa}</td>
      <td className="py-3 px-4">
        <div className="text-xs font-semibold text-foreground">{v.setor || "—"}</div>
      </td>
      <td className="py-3 px-4 text-sm text-foreground">{v.entrada || "—"}</td>
      <td className="py-3 px-4 text-sm text-muted-foreground">{v.saida ?? "—"}</td>
      <td className="py-3 px-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[v.status] ?? "bg-muted text-muted-foreground"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[v.status] ?? "bg-muted-foreground"}`} />
          {STATUS_LABEL[v.status] || v.status}
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

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────

export default function VisitantesPage() {
  const [visitantes, setVisitantes]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [statusFiltro, setStatusFiltro] = useState("Todos");
  const [busca, setBusca]             = useState("");

  const carregarVisitantes = async () => {
    setLoading(true);
    try {
      const response = await api.get('/requisicao-visitante');
      if (response.sucesso) {
        setVisitantes(response.data || []);
      }
    } catch (error) {
      console.error("Erro ao carregar visitantes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarVisitantes();
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
    total:       visitantes.length,
    ativos:      visitantes.filter((v) => v.status === "ativo").length,
    finalizados: visitantes.filter((v) => v.status === "finalizado").length,
    alertas:     visitantes.filter((v) => v.status === "semsaida").length,
  }), [visitantes]);

  return (
    <>
      {modalAberto && (
        <ModalNovoVisitante
          onClose={() => setModalAberto(false)}
          onSave={carregarVisitantes}
        />
      )}

      <div className="flex flex-col gap-5">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Dashboard Visitantes</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Gestão de acesso e monitoramento de visitantes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadCSV(filtrados)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              Download
            </button>
            <button
              onClick={() => setModalAberto(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus size={16} /> Novo Visitante
            </button>
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label="Total"
            value={stats.total}
            valueClassName="text-primary"
            icon={<Users size={17} className="text-primary" />}
            sub="visitantes"
            accentVar="var(--primary)"
          />
          <StatCard
            label="Ativos"
            value={stats.ativos}
            valueClassName="text-green-600"
            icon={<ArrowRightLeft size={17} className="text-green-600" />}
            sub="na empresa"
            accentVar="var(--green-500)"
          />
          <StatCard
            label="Finalizados"
            value={stats.finalizados}
            valueClassName="text-blue-600"
            icon={<LogOut size={17} className="text-blue-600" />}
            sub="check-outs"
            accentVar="var(--blue-500)"
          />
          <StatCard
            label="Alertas"
            value={stats.alertas}
            valueClassName="text-red-600"
            icon={<AlertTriangle size={17} className="text-red-600" />}
            sub="requerem atenção"
            accentVar="var(--red-500)"
          />
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Registro de Visitantes</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar visitante..."
                  className="h-8 pl-8 pr-3 w-52 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                />
                {busca && (
                  <button onClick={() => setBusca("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X size={11} />
                  </button>
                )}
              </div>
              <select
                value={statusFiltro}
                onChange={(e) => setStatusFiltro(e.target.value)}
                className="h-8 px-3 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              >
                <option value="Todos">Todos Status</option>
                <option value="ativo">Ativos</option>
                <option value="finalizado">Finalizados</option>
                <option value="semsaida">Alertas</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {["Visitante", "Empresa", "Setor", "Entrada", "Saída", "Status", "Ações"].map((col) => (
                    <th key={col} className="py-2.5 px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Loader2 className="animate-spin" size={24} />
                        <span className="text-sm">Carregando visitantes...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                      Nenhum visitante encontrado com os filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  filtrados.map((v) => <LinhaVisitante key={v.id} v={v} />)
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
