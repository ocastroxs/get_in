"use client";
import { useState, useEffect, useMemo } from "react";
import {
  Clock, CheckCircle2, XCircle, Loader2, Search, X, AlertTriangle, User, Building2, MapPin, Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Topbar from "@/components/Topbar";
import { api } from "@/services/api";

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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl border border-border w-full max-w-md shadow-lg animate-in fade-in zoom-in duration-300">
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

          <p className="text-xs text-muted-foreground bg-amber-50 border border-amber-200 rounded p-2">
            ⚠️ Você está prestes a aprovar ou recusar esta requisição de visita.
          </p>
        </div>

        <div className="flex gap-2 p-4 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleRecusa}
            className="flex-1 bg-red-600 hover:bg-red-700"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={14} className="mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <XCircle size={14} className="mr-2" />
                Recusar
              </>
            )}
          </Button>
          <Button
            onClick={handleAprovacao}
            className="flex-1 bg-green-600 hover:bg-green-700"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={14} className="mr-2 animate-spin" />
                Processando...
              </>
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
          className="text-amber-600 border-amber-200 hover:bg-amber-50"
        >
          <Clock size={14} className="mr-1" />
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

      return matchBusca;
    });
  }, [requisicoes, busca]);

  function handleAnalise(requisicao) {
    setRequisicaoSelecionada(requisicao);
    setModalAberto(true);
  }

  function handleConfirmacao() {
    fetchRequisicoes();
  }

  return (
    <>
      <Topbar
        title="Pendências"
        subtitle="Requisições de visita aguardando aprovação"
        buttonText="Atualizar"
      />

      {/* Card de Informação */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <AlertTriangle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-sm text-blue-900">Requisições Pendentes</h3>
          <p className="text-xs text-blue-700 mt-1">
            {requisicoesFiltradas.length} requisição(ões) aguardando sua análise e aprovação.
          </p>
        </div>
      </div>

      {/* Barra de Busca */}
      <div className="bg-card border border-border rounded-xl p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
          <Input
            placeholder="Buscar por nome, CPF ou empresa..."
            className="pl-9 h-9 text-sm"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          {busca && (
            <button
              onClick={() => setBusca("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Tabela de Requisições */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-bold text-sm">Requisições Pendentes</h3>
          <p className="text-xs text-muted-foreground">{requisicoesFiltradas.length} registros</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="px-4 py-3">Visitante</th>
                <th className="px-4 py-3">Empresa</th>
                <th className="px-4 py-3">Setor</th>
                <th className="px-4 py-3">Motivo</th>
                <th className="px-4 py-3">Solicitação</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Loader2 className="animate-spin" size={24} />
                      <span className="text-sm">Carregando pendências...</span>
                    </div>
                  </td>
                </tr>
              ) : requisicoesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                    Nenhuma requisição pendente encontrada.
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

      {/* Modal */}
      <ModalAprovacao
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        requisicao={requisicaoSelecionada}
        onConfirm={handleConfirmacao}
      />
    </>
  );
}
