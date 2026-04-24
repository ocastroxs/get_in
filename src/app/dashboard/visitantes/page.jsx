"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Users, ArrowRightLeft, LogOut, AlertTriangle,
  Search, Filter, X, Download, Plus,
  CreditCard, ChevronDown, Check, Clock
} from "lucide-react";
import Topbar from "@/components/Topbar";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { VISITANTES_HOJE, ALERTAS_VISITANTES } from "@/lib/mockData";
import { api } from "@/services/api";

// ─── helpers ────────────────────────────────────────────────────────────────

const EMPRESAS = ["Todas", ...Array.from(new Set(VISITANTES_HOJE.map((v) => v.empresa))).sort()];
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
  const cols = ["Nome", "Empresa", "CPF", "Setor", "Entrada", "Saída", "Status", "Crachá"];
  const lines = rows.map((r) =>
    [r.nome, r.empresa, r.cpf, r.setor, r.entrada, r.saida ?? "—", STATUS_LABEL[r.status], r.cracha].join(";")
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

function ModalNovoVisitante({ onClose, onSave }) {
  const [form, setForm] = useState({
    nome: "", empresa: "", cpf: "", setor: "Adm", entrada: "", cracha: ""
  });
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const maskCPF = (v) =>
    v.replace(/\D/g, "")
     .replace(/(\d{3})(\d)/, "$1.$2")
     .replace(/(\d{3})(\d)/, "$1.$2")
     .replace(/(\d{3})(\d{1,2})/, "$1-$2")
     .replace(/(-\d{2})\d+?$/, "$1");

  function handleSubmit() {
    if (!form.nome || !form.empresa || !form.cpf || !form.entrada) {
      alert("Preencha Nome, Empresa, CPF e Horário de Entrada.");
      return;
    }
    onSave({
      ...form,
      id: Date.now(),
      saida: null,
      status: "ativo",
      cracha: form.cracha || `TAG-${String(Math.floor(Math.random() * 900) + 100)}`,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* header */}
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

        {/* body */}
        <div className="px-6 py-5 space-y-4">
          {[
            { label: "Nome completo *", key: "nome",    type: "text",  placeholder: "Ex: Marina Souza" },
            { label: "Empresa *",       key: "empresa", type: "text",  placeholder: "Ex: Nutrilab" },
            { label: "CPF *",           key: "cpf",     type: "text",  placeholder: "000.000.000-00", mask: maskCPF },
            { label: "Horário de entrada *", key: "entrada", type: "time" },
            { label: "Crachá (opcional)",    key: "cracha",  type: "text",  placeholder: "TAG-000" },
          ].map(({ label, key, type, placeholder, mask }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
              <input
                type={type}
                value={form[key]}
                placeholder={placeholder}
                onChange={(e) =>
                  setForm((p) => ({ ...p, [key]: mask ? mask(e.target.value) : e.target.value }))
                }
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              />
            </div>
          ))}

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Setor</label>
            <select
              value={form.setor}
              onChange={set("setor")}
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            >
              {["Adm", "Lab", "Prod", "Alm"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-muted/30">
          <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
          <Button size="sm" className="gap-1.5" onClick={handleSubmit}>
            <Check size={13} /> Registrar entrada
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Alerta Banner ───────────────────────────────────────────────────────────

function AlertaBanner({ alertas, onDismiss }) {
  if (!alertas.length) return null;
  const nomes = alertas.map((a) => `${a.nome} [${a.setor}]`).join(" e ");
  return (
    <div className="flex items-start gap-3 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800 relative animate-in fade-in slide-in-from-top-2 duration-500">
      <AlertTriangle size={16} className="text-yellow-500 mt-0.5 shrink-0" />
      <span>
        <strong>{alertas.length} visitante{alertas.length > 1 ? "s" : ""} sem saída registrada</strong> com turno encerrado.{" "}
        Verificar {nomes}.
      </span>
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
      <td className="py-3 px-4 text-sm text-primary font-medium whitespace-nowrap">{v.empresa}</td>
      <td className="py-3 px-4 text-sm text-muted-foreground font-mono">{v.cpf}</td>
      <td className="py-3 px-4">
        <div className="text-sm font-semibold text-foreground">{v.entrada}</div>
        <div className="text-[11px] text-muted-foreground">Setor: {v.setor}</div>
      </td>
      <td className="py-3 px-4 text-sm text-foreground">{v.saida ?? "—"}</td>
      <td className="py-3 px-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[v.status]}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[v.status]}`} />
          {STATUS_LABEL[v.status]}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted text-xs font-mono text-muted-foreground border border-border">
          <CreditCard size={11} />
          {v.cracha}
        </span>
      </td>
    </tr>
  );
}

// ─── Página principal ────────────────────────────────────────────────────────

export default function VisitantesPage() {
  const [visitantes, setVisitantes]   = useState(VISITANTES_HOJE);
  const [alertas, setAlertas]         = useState(ALERTAS_VISITANTES);
  const [modalAberto, setModalAberto] = useState(false);

  useEffect(() => {
    async function fetchVisitantes() {
      try {
        // Usando o serviço de API centralizado que aponta para a URL correta
        const data = await api.get('/user/read');
        
        if (data && data.sucesso && Array.isArray(data.dados)) {
          const mapped = data.dados.map(user => ({
            nome: user.nome || "Sem nome",
            empresa: user.empresa || 'Empresa Mock',
            cpf: user.cpf || "000.000.000-00",
            setor: user.setor || 'Adm',
            entrada: user.entrada || '08:00',
            saida: user.saida || null,
            status: user.status || 'ativo',
            cracha: user.cracha || ('TAG-' + (user.id || Math.floor(Math.random() * 1000)))
          }));
          setVisitantes(mapped);
        }
      } catch (error) {
        console.error('Erro ao buscar visitantes:', error);
      }
    }
    fetchVisitantes();
  }, []);

  // filtros
  const [empresa, setEmpresa]         = useState("Todas");
  const [data, setData]               = useState("29/07/2025");
  const [statusFiltro, setStatusFiltro] = useState("Todos");
  const [busca, setBusca]             = useState("");

  const filtrados = useMemo(() => {
    return visitantes.filter((v) => {
      const matchEmpresa = empresa === "Todas" || v.empresa === empresa;
      const matchStatus  = statusFiltro === "Todos" || v.status === statusFiltro;
      const matchBusca   = busca.trim() === "" ||
        v.nome.toLowerCase().includes(busca.toLowerCase()) ||
        v.cpf.includes(busca) ||
        v.empresa.toLowerCase().includes(busca.toLowerCase()) ||
        v.cracha.toLowerCase().includes(busca.toLowerCase());
      return matchEmpresa && matchStatus && matchBusca;
    });
  }, [visitantes, empresa, statusFiltro, busca]);

  const stats = useMemo(() => ({
    total:      visitantes.length,
    ativos:     visitantes.filter((v) => v.status === "ativo").length,
    finalizados: visitantes.filter((v) => v.status === "finalizado").length,
    semsaida:   visitantes.filter((v) => v.status === "semsaida").length,
  }), [visitantes]);

  function limparFiltros() {
    setEmpresa("Todas");
    setStatusFiltro("Todos");
    setBusca("");
  }

  function handleSave(novo) {
    setVisitantes((p) => [novo, ...p]);
  }

  return (
    <>
      {modalAberto && (
        <ModalNovoVisitante
          onClose={() => setModalAberto(false)}
          onSave={handleSave}
        />
      )}

      <div className="flex flex-col gap-5 animate-in fade-in duration-700">
        {/* Topbar reutilizado — mas com botões próprios */}
        <header className="flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-700">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Visitantes</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Indústria Alimentos Puros · Ter 08h – 18h · 29 de julho de 2025
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => downloadCSV(filtrados)}>
              <Download size={13} />
              Exportar
            </Button>
            <Button size="sm" className="gap-1.5" onClick={() => setModalAberto(true)}>
              <Plus size={13} />
              Novo Visitante
            </Button>
          </div>
        </header>

        {/* Banner de alerta — só aparece quando há alertas */}
        <AlertaBanner alertas={alertas} onDismiss={() => setAlertas([])} />

        {/* KPI Cards — reutilizando StatCard */}
        <div className="grid grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          <StatCard
            label="Visitantes Hoje"
            value={stats.total}
            icon={<Users size={17} className="text-primary" />}
            delta={12}
            deltaDir="up"
            sub="vs ontem"
            accentVar="var(--primary)"
          />
          <StatCard
            label="Visitantes Ativos"
            value={stats.ativos}
            valueClassName="text-chart-2"
            icon={<ArrowRightLeft size={17} className="text-chart-2" />}
            sub="100% credenciadas"
            accentVar="var(--chart-2)"
          />
          <StatCard
            label="Finalizados"
            value={stats.finalizados}
            valueClassName="text-chart-3"
            icon={<LogOut size={17} className="text-chart-3" />}
            sub="✓ check-out confirmado"
            accentVar="var(--chart-3)"
          />
          <StatCard
            label="Sem Saída Registrada"
            value={stats.semsaida}
            valueClassName="text-destructive"
            icon={<AlertTriangle size={17} className="text-destructive" />}
            sub={`${stats.semsaida} alerta${stats.semsaida !== 1 ? "s" : ""} pendente${stats.semsaida !== 1 ? "s" : ""}`}
            accentVar="var(--destructive)"
          />
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Filter size={13} />
            Filtros
          </div>

          {/* Empresa */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground">Empresa</label>
            <div className="relative">
              <select
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                className="h-8 pl-3 pr-7 rounded-lg border border-border bg-background text-xs text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer"
              >
                {EMPRESAS.map((e) => <option key={e}>{e}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Data */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground">Data</label>
            <input
              type="text"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="h-8 px-3 w-28 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              placeholder="DD/MM/AAAA"
            />
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

          <button
            onClick={limparFiltros}
            className="text-xs text-primary hover:text-primary/70 font-medium transition-colors underline underline-offset-2"
          >
            Limpar filtros
          </button>

          <span className="ml-auto text-xs text-muted-foreground">
            {filtrados.length} registro{filtrados.length !== 1 ? "s" : ""} encontrado{filtrados.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Tabela */}
        <div className="bg-card border border-border rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          {/* header da tabela */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Registro de Visitantes</h2>
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
          </div>

          {/* tabela */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {["Nome", "Empresa", "CPF", "Entrada", "Saída", "Status", "Crachá"].map((col) => (
                    <th key={col} className="py-2.5 px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                      Nenhum visitante encontrado com os filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  filtrados.map((v, i) => <LinhaVisitante key={v.id} v={v} index={i} />)
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}