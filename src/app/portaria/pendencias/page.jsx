"use client";
import { useState, useEffect, useMemo } from "react";
import {
  Clock, CheckCircle2, XCircle, Loader2, Search, X, AlertTriangle, User, Building2, MapPin, Phone, Filter, Check, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Topbar from "@/components/Topbar";
import ModalFiltro from "@/components/ui/ModalFiltro";
import { api } from "@/services/api";
import { exportTableToPdf } from "@/lib/exportPdf";

// ─── MODAL DE APROVAÇÃO ──────────────────────────────────────────────────────
function ModalAprovacao({ isOpen, onClose, requisicao, onConfirm }) {
  const [loading, setLoading] = useState(false);

  async function handleAprovacao() {
    setLoading(true);
    try {
      const payload = {
        id: requisicao?.id,
        status: "aprovado"
      };

      const response = await api.post('/portaria/aprovar-requisicao', payload);

      if (response.sucesso) {
        alert("Requisição aprovada com sucesso!");
        onConfirm();
        onClose();
      } else {
        alert(response.mensagem || "Erro ao aprovar requisição.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRecusa() {
    setLoading(true);
    try {
      const payload = {
        id: requisicao?.id,
        status: "recusado"
      };

      const response = await api.post('/portaria/recusar-requisicao', payload);

      if (response.sucesso) {
        alert("Requisição recusada com sucesso!");
        onConfirm();
        onClose();
      } else {
        alert(response.mensagem || "Erro ao recusar requisição.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen || !requisicao) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-card rounded-xl border border-border w-full max-w-md shadow-lg animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Análise de Requisição</h2>
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
                <p className="text-sm font-medium text-foreground">{requisicao.visitante}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Building2 size={16} className="text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Empresa</p>
                <p className="text-sm font-medium text-foreground">{requisicao.empresa}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <MapPin size={16} className="text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Setor de Destino</p>
                <p className="text-sm font-medium text-foreground">{requisicao.setor}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock size={16} className="text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Motivo</p>
                <p className="text-sm font-medium text-foreground">{requisicao.motivo}</p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-xs text-amber-700 leading-relaxed">
              <strong>Atenção:</strong> Você está prestes a aprovar ou recusar esta requisição de visita. Esta ação notificará o supervisor responsável.
            </p>
          </div>
        </div>

        <div className="flex gap-2 p-4 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-xl"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleRecusa}
            className="flex-1 bg-red-600 hover:bg-red-700 rounded-xl"
            disabled={loading}
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <>
                <XCircle size={14} className="mr-2" />
                Recusar
              </>
            )}
          </Button>
          <Button
            onClick={handleAprovacao}
            className="flex-1 bg-green-600 hover:bg-green-700 rounded-xl"
            disabled={loading}
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <>
                <CheckCircle2 size={14} className="mr-2" />
                Aprovar
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── LINHA DA REQUISIÇÃO ─────────────────────────────────────────────────────
function LinhaRequisicao({ requisicao, onAnalise }) {
  return (
    <tr className="border-b border-border hover:bg-muted/50 transition-colors">
      <td className="px-4 py-3">
        <div>
          <p className="text-sm font-medium text-foreground">{requisicao.visitante}</p>
          <p className="text-xs text-muted-foreground">{requisicao.cpf}</p>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-foreground">{requisicao.empresa}</td>
      <td className="px-4 py-3 text-sm text-foreground">{requisicao.setor}</td>
      <td className="px-4 py-3 text-sm text-foreground">{requisicao.motivo}</td>
      <td className="px-4 py-3 text-xs text-muted-foreground">{requisicao.solicitacao}</td>
      <td className="px-4 py-3 text-right">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onAnalise(requisicao)}
          className="text-amber-600 border-amber-200 hover:bg-amber-50 rounded-lg h-8"
        >
          <Clock size={14} className="mr-1.5" />
          Analisar
        </Button>
      </td>
    </tr>
  );
}

// ─── PÁGINA PRINCIPAL ────────────────────────────────────────────────────────
export default function PendenciasPage() {
  const [requisicoes, setRequisicoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [requisicaoSelecionada, setRequisicaoSelecionada] = useState(null);
  
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
  const [filtroSetor, setFiltroSetor] = useState("Todos");
  const [tempFiltroSetor, setTempFiltroSetor] = useState("Todos");

  useEffect(() => {
    fetchRequisicoes();
    const interval = setInterval(fetchRequisicoes, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  async function fetchRequisicoes() {
    try {
      setLoading(true);
      const response = await api.get('/portaria/pendencias');

      if (response.sucesso && response.data) {
        setRequisicoes(response.data);
      }
    } catch (error) {
      console.error("Erro ao carregar pendências:", error);
    } finally {
      setLoading(false);
    }
  }

  const requisicoesFiltradas = useMemo(() => {
    return requisicoes.filter(r => {
      const matchBusca = busca === "" ||
        r.visitante.toLowerCase().includes(busca.toLowerCase()) ||
        r.cpf.includes(busca) ||
        r.empresa.toLowerCase().includes(busca.toLowerCase());
      
      const matchSetor = filtroSetor === "Todos" || r.setor === filtroSetor;

      return matchBusca && matchSetor;
    });
  }, [requisicoes, busca, filtroSetor]);

  const setoresUnicos = ["Todos", ...new Set(requisicoes.map(r => r.setor))];

  function handleAnalise(requisicao) {
    setRequisicaoSelecionada(requisicao);
    setModalAberto(true);
  }

  function handleConfirmacao() {
    fetchRequisicoes();
  }

  const aplicarFiltros = () => {
    setFiltroSetor(tempFiltroSetor);
  };

  const limparFiltros = () => {
    setTempFiltroSetor("Todos");
    setFiltroSetor("Todos");
    setBusca("");
  };

  const exportarPDF = async () => {
    if (requisicoesFiltradas.length === 0) {
      alert("Não há dados para exportar.");
      return;
    }

    try {
      await exportTableToPdf({
        title: "Pendências da portaria",
        subtitle: "Requisições de visita aguardando aprovação",
        fileName: `pendencias_${new Date().toISOString().split("T")[0]}.pdf`,
        filters: [
          busca ? `Busca: ${busca}` : null,
          filtroSetor !== "Todos" ? `Setor: ${filtroSetor}` : null,
        ].filter(Boolean),
        columns: [
          { header: "Visitante", weight: 1.4 },
          { header: "CPF", weight: 1 },
          { header: "Empresa", weight: 1.2 },
          { header: "Setor", weight: 1.1 },
          { header: "Motivo", weight: 1.5 },
          { header: "Solicitação", weight: 1 },
        ],
        rows: requisicoesFiltradas.map((r) => [
          r.visitante,
          r.cpf,
          r.empresa,
          r.setor,
          r.motivo,
          r.solicitacao,
        ]),
      });
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      alert("Não foi possível exportar o PDF.");
    }
  };

  return (
    <>
      <Topbar
        title="Pendências"
        subtitle="Requisições de visita aguardando aprovação"
      />

      <div className="flex flex-col gap-5 p-4 md:p-6 animate-in fade-in duration-700">
        {/* Card de Informação */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
          <AlertTriangle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-sm text-blue-900 dark:text-blue-300">Requisições Pendentes</h3>
            <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
              Atualmente existem <strong>{requisicoesFiltradas.length}</strong> requisições aguardando sua análise.
            </p>
          </div>
        </div>

        {/* Barra de Filtros Padronizada */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 items-center gap-3 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="Buscar por nome, CPF ou empresa..."
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
                {filtroSetor !== "Todos" && (
                  <span className="ml-1 w-5 h-5 rounded-full bg-primary text-[10px] flex items-center justify-center text-primary-foreground">
                    1
                  </span>
                )}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={exportarPDF}
                variant="outline"
                className="h-11 px-4 gap-2 rounded-xl border-border/60 bg-background/80 text-sm font-medium"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Exportar PDF</span>
              </Button>
              <div className="px-3 py-2 rounded-xl bg-muted/40 border border-border/50 text-[11px] font-semibold text-muted-foreground">
                {requisicoesFiltradas.length} registro(s)
              </div>
            </div>
          </div>

          {(filtroSetor !== "Todos" || busca) && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border/40">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">Filtros ativos:</span>
              {busca && (
                <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
                  Busca: {busca}
                </span>
              )}
              {filtroSetor !== "Todos" && (
                <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
                  Setor: {filtroSetor}
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

        {/* Tabela de Requisições */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-border bg-muted/20">
            <h3 className="font-bold text-sm">Lista de Pendências</h3>
            <p className="text-xs text-muted-foreground">{requisicoesFiltradas.length} requisições encontradas</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="px-4 py-3">Visitante</th>
                  <th className="px-4 py-3">Empresa</th>
                  <th className="px-4 py-3">Setor</th>
                  <th className="px-4 py-3">Motivo</th>
                  <th className="px-4 py-3">Solicitação</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading && requisicoes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Loader2 className="animate-spin" size={24} />
                        <span className="text-sm">Carregando pendências...</span>
                      </div>
                    </td>
                  </tr>
                ) : requisicoesFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center text-sm text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Clock className="h-12 w-12 text-muted/30" />
                        <p>Nenhuma requisição pendente encontrada.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  requisicoesFiltradas.map((r) => (
                    <LinhaRequisicao
                      key={r.id}
                      requisicao={r}
                      onAnalise={handleAnalise}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Análise */}
      <ModalAprovacao
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        requisicao={requisicaoSelecionada}
        onConfirm={handleConfirmacao}
      />

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
              Filtrar por Setor
            </label>
            <div className="grid grid-cols-1 gap-2">
              {setoresUnicos.map((setor) => (
                <button
                  key={setor}
                  type="button"
                  onClick={() => setTempFiltroSetor(setor)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all border ${
                    tempFiltroSetor === setor
                      ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                      : "bg-background text-muted-foreground border-border/60 hover:border-primary/30 hover:bg-muted/40"
                  }`}
                >
                  <span>{setor === "Todos" ? "Todos os Setores" : setor}</span>
                  {tempFiltroSetor === setor && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
            <p className="text-[10px] text-primary/80 leading-relaxed">
              <strong>Info:</strong> Filtrar por setor ajuda a organizar as aprovações de acordo com a área de destino do visitante.
            </p>
          </div>
        </div>
      </ModalFiltro>
    </>
  );
}
