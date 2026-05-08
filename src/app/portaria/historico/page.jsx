"use client";
import { useState, useEffect, useMemo } from "react";
import {
  Calendar, Clock, Download, Loader2, Search, X, Filter, LogOut, LogIn, User, Building2, MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Topbar from "@/components/Topbar";
import { api } from "@/services/api";

const STATUS_OPTIONS = ["Todos", "Ativo", "Finalizado"];

// ─── MODAL DE DETALHES ───────────────────────────────────────────────────────
function ModalDetalhes({ isOpen, onClose, registro }) {
  if (!isOpen || !registro) return null;

  const tempoPermanen = registro.dataSaida 
    ? Math.round((new Date(registro.dataSaida) - new Date(registro.dataEntrada)) / 60000)
    : "—";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl border border-border w-full max-w-md shadow-lg animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Detalhes do Registro</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
          >
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-muted/40 rounded-lg p-3 space-y-3">
            <div className="flex items-start gap-2">
              <User size={16} className="text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Visitante</p>
                <p className="text-sm font-medium text-foreground">{registro.visitante}</p>
                <p className="text-xs text-muted-foreground">{registro.cpf}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Building2 size={16} className="text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Empresa</p>
                <p className="text-sm font-medium text-foreground">{registro.empresa}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <MapPin size={16} className="text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Setor</p>
                <p className="text-sm font-medium text-foreground">{registro.setor}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <LogIn size={16} className="text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Entrada</p>
                <p className="text-sm font-medium text-foreground">{registro.dataEntrada}</p>
              </div>
            </div>

            {registro.dataSaida && (
              <div className="flex items-start gap-2">
                <LogOut size={16} className="text-red-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Saída</p>
                  <p className="text-sm font-medium text-foreground">{registro.dataSaida}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2">
              <Clock size={16} className="text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Permanência</p>
                <p className="text-sm font-medium text-foreground">
                  {tempoPermanen === "—" ? "—" : `${tempoPermanen} minutos`}
                </p>
              </div>
            </div>
          </div>

          {registro.observacoes && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-amber-900 uppercase mb-1">Observações</p>
              <p className="text-sm text-amber-800">{registro.observacoes}</p>
            </div>
          )}
        </div>

        <div className="flex gap-2 p-4 border-t border-border">
          <Button
            onClick={onClose}
            className="flex-1"
          >
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── LINHA DO HISTÓRICO ─────────────────────────────────────────────────────
function LinhaHistorico({ registro, onDetalhes }) {
  const status = registro.dataSaida ? "Finalizado" : "Ativo";
  const statusClass = registro.dataSaida 
    ? "bg-blue-100 text-blue-700" 
    : "bg-green-100 text-green-700";

  return (
    <tr className="border-b border-border hover:bg-muted/50 transition-colors">
      <td className="px-4 py-3">
        <div>
          <p className="text-sm font-medium text-foreground">{registro.visitante}</p>
          <p className="text-xs text-muted-foreground">{registro.cpf}</p>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-foreground">{registro.empresa}</td>
      <td className="px-4 py-3 text-sm text-foreground">{registro.setor}</td>
      <td className="px-4 py-3 text-xs text-muted-foreground">{registro.dataEntrada}</td>
      <td className="px-4 py-3 text-xs text-muted-foreground">{registro.dataSaida || "—"}</td>
      <td className="px-4 py-3">
        <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${statusClass}`}>
          {status}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onDetalhes(registro)}
          className="text-primary border-primary hover:bg-primary/5"
        >
          Ver Detalhes
        </Button>
      </td>
    </tr>
  );
}

// ─── PÁGINA PRINCIPAL ────────────────────────────────────────────────────────
export default function HistoricoPage() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroData, setFiltroData] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [modalAberto, setModalAberto] = useState(false);
  const [registroSelecionado, setRegistroSelecionado] = useState(null);

  useEffect(() => {
    fetchHistorico();
  }, []);

  async function fetchHistorico() {
    try {
      setLoading(true);
      const response = await api.get('/portaria/historico');

      if (response.sucesso && response.data) {
        setRegistros(response.data);
      }
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    } finally {
      setLoading(false);
    }
  }

  const registrosFiltrados = useMemo(() => {
    return registros.filter(r => {
      const matchBusca = busca === "" ||
        r.visitante.toLowerCase().includes(busca.toLowerCase()) ||
        r.cpf.includes(busca) ||
        r.empresa.toLowerCase().includes(busca.toLowerCase());

      const matchStatus = filtroStatus === "Todos" || 
        (filtroStatus === "Finalizado" && r.dataSaida) ||
        (filtroStatus === "Ativo" && !r.dataSaida);

      const matchData = filtroData === "" ||
        r.dataEntrada.includes(filtroData);

      return matchBusca && matchStatus && matchData;
    });
  }, [registros, busca, filtroStatus, filtroData]);

  const resumoStatus = useMemo(() => ({
    Todos: registros.length,
    Ativo: registros.filter((r) => !r.dataSaida).length,
    Finalizado: registros.filter((r) => Boolean(r.dataSaida)).length,
  }), [registros]);

  const filtrosAtivos = [
    busca ? `Busca: "${busca}"` : null,
    filtroData ? `Data: ${filtroData}` : null,
    filtroStatus !== "Todos" ? `Status: ${filtroStatus}` : null,
  ].filter(Boolean);

  function handleDetalhes(registro) {
    setRegistroSelecionado(registro);
    setModalAberto(true);
  }

  function limparFiltros() {
    setBusca("");
    setFiltroData("");
    setFiltroStatus("Todos");
  }

  function downloadCSV() {
    const cols = ["Visitante", "CPF", "Empresa", "Setor", "Entrada", "Saída", "Status"];
    const lines = registrosFiltrados.map((r) =>
      [r.visitante, r.cpf, r.empresa, r.setor, r.dataEntrada, r.dataSaida || "—", r.dataSaida ? "Finalizado" : "Ativo"].join(";")
    );
    const csv = [cols.join(";"), ...lines].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "historico_portaria.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <Topbar
        title="Histórico"
        subtitle="Registro completo de entradas e saídas"
      />

      {/* Barra de Filtros */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-6 shadow-sm">
        <div className="space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/10">
                <Filter size={18} className="text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Filtros do Histórico</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Refine os registros por visitante, período e status de permanência.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="px-3 py-2 rounded-xl bg-muted/40 border border-border/50 text-[11px] font-semibold text-muted-foreground">
                {registrosFiltrados.length} resultado(s)
              </div>
              {filtrosAtivos.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={limparFiltros}
                  className="h-9 px-3 text-xs text-muted-foreground hover:text-foreground"
                >
                  <X size={14} className="mr-1.5" />
                  Limpar filtros
                </Button>
              )}
              <Button
                type="button"
                onClick={downloadCSV}
                variant="outline"
                className="h-9 gap-2 rounded-xl border-border/60"
              >
                <Download size={14} />
                Exportar CSV
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.4fr)_260px] gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
              <Input
                placeholder="Buscar por nome, CPF ou empresa..."
                className="pl-10 pr-10 h-11 rounded-xl border-border/60 bg-background/80 text-sm"
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

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
              <Input
                type="date"
                className="pl-10 h-11 rounded-xl border-border/60 bg-background/80 text-sm"
                value={filtroData}
                onChange={(e) => setFiltroData(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <Filter size={13} />
              Status da visita
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {STATUS_OPTIONS.map((status) => {
                const isActive = filtroStatus === status;

                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setFiltroStatus(status)}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-background text-muted-foreground border-border/60 hover:border-primary/30 hover:bg-muted/40 hover:text-foreground"
                    }`}
                  >
                    <span>{status}</span>
                    <span className={`min-w-5 h-5 px-1 rounded-full text-[10px] flex items-center justify-center ${
                      isActive
                        ? "bg-white/20 text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}>
                      {resumoStatus[status]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {filtrosAtivos.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {filtrosAtivos.map((filtro) => (
                <span
                  key={filtro}
                  className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary"
                >
                  {filtro}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabela de Histórico */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-bold text-sm">Histórico de Visitantes</h3>
          <p className="text-xs text-muted-foreground">{registrosFiltrados.length} registros</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="px-4 py-3">Visitante</th>
                <th className="px-4 py-3">Empresa</th>
                <th className="px-4 py-3">Setor</th>
                <th className="px-4 py-3">Entrada</th>
                <th className="px-4 py-3">Saída</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Loader2 className="animate-spin" size={24} />
                      <span className="text-sm">Carregando histórico...</span>
                    </div>
                  </td>
                </tr>
              ) : registrosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                    Nenhum registro encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                registrosFiltrados.map((r) => (
                  <LinhaHistorico
                    key={r.id}
                    registro={r}
                    onDetalhes={handleDetalhes}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <ModalDetalhes
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        registro={registroSelecionado}
      />
    </>
  );
}
