"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Users, ArrowRightLeft, LogOut, AlertTriangle,
  Search, X, Plus, CreditCard, Check, Loader2,
  MoreHorizontal, Filter, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatCard from "@/components/StatCard";
import ModalFiltro from "@/components/ui/ModalFiltro";
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
  
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
  const [tempStatusFiltro, setTempStatusFiltro] = useState("Todos");

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

  const aplicarFiltros = () => {
    setStatusFiltro(tempStatusFiltro);
  };

  const limparFiltros = () => {
    setTempStatusFiltro("Todos");
    setStatusFiltro("Todos");
    setBusca("");
  };

  return (
    <>
      {modalAberto && (
        <ModalNovoVisitante
          onClose={() => setModalAberto(false)}
          onSave={carregarVisitantes}
        />
      )}

      <div className="flex flex-col gap-5 animate-in fade-in duration-700">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Dashboard Visitantes</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Gestão de acesso e monitoramento de visitantes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadCSV(filtrados)}
              className="gap-2 rounded-xl"
            >
              <Download size={14} />
              Exportar CSV
            </Button>
            <Button
              size="sm"
              onClick={() => setModalAberto(true)}
              className="gap-1.5 rounded-xl"
            >
              <Plus size={14} />
              Novo Visitante
            </Button>
          </div>
        </header>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total de Visitas"
            value={stats.total}
            icon={<Users size={17} className="text-primary" />}
            sub="Registros no sistema"
            accentVar="var(--primary)"
          />
          <StatCard
            label="Ativos Agora"
            value={stats.ativos}
            valueClassName="text-green-600"
            icon={<Check size={17} className="text-green-600" />}
            sub="Dentro da empresa"
            accentVar="var(--chart-2)"
          />
          <StatCard
            label="Finalizados"
            value={stats.finalizados}
            valueClassName="text-blue-600"
            icon={<ArrowRightLeft size={17} className="text-blue-600" />}
            sub="Visitas concluídas"
            accentVar="var(--chart-3)"
          />
          <StatCard
            label="Alertas"
            value={stats.alertas}
            valueClassName="text-red-600"
            icon={<AlertTriangle size={17} className="text-red-600" />}
            sub="Sem saída registrada"
            accentVar="var(--destructive)"
          />
        </div>

        {/* Barra de Filtros Padronizada */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 items-center gap-3 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="Buscar por nome, empresa ou CPF..."
                  className="pl-10 h-11 rounded-xl border-border/60 bg-background/80 text-sm"
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
                className="h-11 px-4 gap-2 rounded-xl border-border/60 bg-background/80"
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

            <div className="px-3 py-2 rounded-xl bg-muted/40 border border-border/50 text-[11px] font-semibold text-muted-foreground">
              {filtrados.length} resultado(s)
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
                  Status: {STATUS_LABEL[statusFiltro] || statusFiltro}
                </span>
              )}
              <Button
                variant="ghost"
                onClick={limparFiltros}
                className="h-7 px-2 text-[10px] text-muted-foreground hover:text-foreground"
              >
                Limpar tudo
              </Button>
            </div>
          )}
        </div>

        {/* Tabela de Visitantes */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/20">
            <h3 className="font-bold text-sm">Listagem de Visitantes</h3>
            <p className="text-xs text-muted-foreground">Monitoramento em tempo real</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="py-3 px-4">Visitante</th>
                  <th className="py-3 px-4">Empresa</th>
                  <th className="py-3 px-4">Setor</th>
                  <th className="py-3 px-4">Entrada</th>
                  <th className="py-3 px-4">Saída</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Ações</th>
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

      {/* Modal de Filtro Padronizado */}
      <ModalFiltro
        isOpen={modalFiltroAberto}
        onClose={() => setModalFiltroAberto(false)}
        onApply={aplicarFiltros}
        onClear={limparFiltros}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
              Status da Visita
            </label>
            <div className="grid grid-cols-2 gap-2">
              {["Todos", "ativo", "semsaida", "finalizado", "pendente"].map((status) => (
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
          
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
            <p className="text-[10px] text-primary/80 leading-relaxed">
              <strong>Nota:</strong> Filtros avançados permitem encontrar registros específicos com mais facilidade. Combine com a busca por texto para melhores resultados.
            </p>
          </div>
        </div>
      </ModalFiltro>
    </>
  );
}
