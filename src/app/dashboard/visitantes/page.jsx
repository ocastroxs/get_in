"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Users, ArrowRightLeft, LogOut, AlertTriangle,
  Search, X, Plus, CreditCard, Check, Loader2,
  MoreHorizontal
} from "lucide-react";
import AlertaBanner from "@/components/AlertaBanner";
import StatCard from "@/components/StatCard";
import Topbar from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";

const STATUS_LABEL = {
  ativo: "Ativo",
  semsaida: "Sem saida",
  finalizado: "Finalizado",
  pendente: "Pendente",
};

const STATUS_STYLE = {
  ativo: "bg-green-100 text-green-700",
  semsaida: "bg-red-100 text-red-600",
  finalizado: "bg-blue-100 text-blue-700",
  pendente: "bg-amber-100 text-amber-700",
};

const STATUS_DOT = {
  ativo: "bg-green-500",
  semsaida: "bg-red-500",
  finalizado: "bg-blue-500",
  pendente: "bg-amber-500",
};

const SETORES = ["Adm", "Lab", "Prod", "Alm", "Recepcao", "Diretoria"];

function toCSV(rows) {
  const cols = ["Nome", "Empresa", "CPF", "Setor", "Entrada", "Saida", "Status"];
  const lines = rows.map((r) =>
    [r.nome, r.empresa, r.cpf, r.setor, r.entrada, r.saida ?? "-", STATUS_LABEL[r.status] ?? r.status].join(";")
  );
  return [cols.join(";"), ...lines].join("\n");
}

function downloadCSV(data) {
  const blob = new Blob([toCSV(data)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "visitantes.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function ModalNovoVisitante({ onClose, onSave }) {
  const [form, setForm] = useState({
    nome: "",
    empresa: "",
    cpf: "",
    setor: "Adm",
    motivo: "",
  });
  const [loading, setLoading] = useState(false);

  const maskCPF = (value) =>
    value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");

  async function handleSubmit() {
    if (!form.nome || !form.empresa || !form.cpf) {
      alert("Preencha os campos obrigatorios.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        idUsuario: 1,
        idDepartamento: 1,
        motivo: form.motivo || "Visita",
        validade: new Date().toISOString(),
      };

      const response = await api.post("/requisicao-visitante", payload);

      if (response.sucesso) {
        onSave();
        onClose();
      } else {
        alert(response.mensagem || "Erro ao registrar visitante.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro de conexao com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="mx-4 w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-xl animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Plus size={16} className="text-primary" />
            </div>
            <h2 className="font-semibold text-foreground">Novo Visitante</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground transition-colors hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <p className="text-xs text-muted-foreground">
            Registre um novo visitante no sistema. Todos os campos marcados com * sao obrigatorios.
          </p>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Nome completo *</label>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Ex: Marina Souza"
              className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground transition placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Empresa *</label>
            <input
              type="text"
              value={form.empresa}
              onChange={(e) => setForm({ ...form, empresa: e.target.value })}
              placeholder="Ex: Nutrilab"
              className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground transition placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">CPF *</label>
            <input
              type="text"
              value={form.cpf}
              onChange={(e) => setForm({ ...form, cpf: maskCPF(e.target.value) })}
              placeholder="000.000.000-00"
              className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground transition placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Setor</label>
            <select
              value={form.setor}
              onChange={(e) => setForm({ ...form, setor: e.target.value })}
              className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {SETORES.map((setor) => (
                <option key={setor} value={setor}>
                  {setor}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Motivo da Visita</label>
            <input
              type="text"
              value={form.motivo}
              onChange={(e) => setForm({ ...form, motivo: e.target.value })}
              placeholder="Ex: Visita Tecnica"
              className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground transition placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/30 px-6 py-4">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button size="sm" className="gap-1.5" onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
            Registrar Visitante
          </Button>
        </div>
      </div>
    </div>
  );
}

function LinhaVisitante({ visitante }) {
  return (
    <tr className="border-b border-border transition-colors hover:bg-accent/40">
      <td className="px-4 py-3">
        <div className="text-sm font-medium text-foreground">{visitante.nome}</div>
        <div className="font-mono text-[10px] text-muted-foreground">{visitante.cpf}</div>
      </td>
      <td className="px-4 py-3 text-sm font-medium whitespace-nowrap text-primary">{visitante.empresa}</td>
      <td className="px-4 py-3">
        <div className="text-xs font-semibold text-foreground">{visitante.setor || "-"}</div>
      </td>
      <td className="px-4 py-3 text-sm text-foreground">{visitante.entrada || "-"}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground">{visitante.saida ?? "-"}</td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
            STATUS_STYLE[visitante.status] ?? "bg-muted text-muted-foreground"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[visitante.status] ?? "bg-muted-foreground"}`} />
          {STATUS_LABEL[visitante.status] || visitante.status}
        </span>
      </td>
      <td className="px-4 py-3">
        <button className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
          <MoreHorizontal size={14} />
        </button>
      </td>
    </tr>
  );
}

export default function VisitantesPage() {
  const [visitantes, setVisitantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [statusFiltro, setStatusFiltro] = useState("Todos");
  const [busca, setBusca]             = useState("");

  const carregarVisitantes = async () => {
    setLoading(true);
    try {
      const response = await api.get("/requisicao-visitante");
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

  const alertas = useMemo(
    () => visitantes.filter((visitante) => visitante.status === "semsaida"),
    [visitantes]
  );

  useEffect(() => {
    if (alertas.length > 0) {
      setMostrarBanner(true);
    }
  }, [alertas.length]);

  const filtrados = useMemo(() => {
    return visitantes.filter((visitante) => {
      const matchStatus = statusFiltro === "Todos" || visitante.status === statusFiltro;
      const query = busca.trim().toLowerCase();
      const matchBusca =
        !query ||
        visitante.nome?.toLowerCase().includes(query) ||
        visitante.empresa?.toLowerCase().includes(query) ||
        visitante.cpf?.includes(query);

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
                  filtrados.map((visitante) => <LinhaVisitante key={visitante.id} visitante={visitante} />)
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
