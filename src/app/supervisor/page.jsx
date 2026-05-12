'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Users,
  Clock,
  Loader2,
  Search,
  Filter,
  X,
  Check
} from 'lucide-react';
import Topbar from '@/components/Topbar';
import StatCard from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ModalFiltro from '@/components/ui/ModalFiltro';
import { api } from '@/services/api';

function formatDateTime(value) {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(date);
}

export default function SupervisorDashboardPage() {
  const [requisicoes, setRequisicoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [tempFiltroStatus, setTempFiltroStatus] = useState("Todos");

  useEffect(() => {
    fetchRequisicoes();
    const interval = setInterval(fetchRequisicoes, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  async function fetchRequisicoes() {
    try {
      setLoading(true);
      const response = await api.get('/requisicao-visitante');

      if (response && typeof response === 'object' && response.sucesso && response.data) {
        setRequisicoes(response.data);
      } else if (!response || typeof response !== 'object') {
        console.warn('Back-end não está pronto. Exibindo lista vazia.');
        setRequisicoes([]);
      }
    } catch (error) {
      console.error('Erro ao carregar requisições:', error);
      setRequisicoes([]);
    } finally {
      setLoading(false);
    }
  }

  const requisicoesFiltradas = useMemo(() => {
    return requisicoes.filter(r => {
      const usuario = r.usuario || {};
      const nome = usuario.nome?.toLowerCase() || "";
      const empresa = r.empresa?.toLowerCase() || "";
      const termoBusca = busca.toLowerCase();

      const matchBusca = busca === "" || nome.includes(termoBusca) || empresa.includes(termoBusca);
      const matchStatus = filtroStatus === "Todos" || r.status === filtroStatus.toLowerCase();

      return matchBusca && matchStatus;
    });
  }, [requisicoes, busca, filtroStatus]);

  const countPendentes = requisicoes.filter((r) => r.status === 'pendente').length;
  const countAprovados = requisicoes.filter((r) => r.status === 'aprovado').length;
  const countRecusados = requisicoes.filter((r) => r.status === 'recusado').length;
  const countTotal = requisicoes.length;

  const aplicarFiltros = () => {
    setFiltroStatus(tempFiltroStatus);
  };

  const limparFiltros = () => {
    setTempFiltroStatus("Todos");
    setFiltroStatus("Todos");
    setBusca("");
  };

  return (
    <>
      <Topbar
        title="Dashboard do Supervisor"
        subtitle="Visão geral das solicitações de visitantes"
      />

      <div className="flex flex-col gap-6 p-4 md:p-6 animate-in fade-in duration-700">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Pendentes"
            value={countPendentes}
            icon={<AlertTriangle size={20} className="text-amber-600" />}
            accentVar="#d97706"
            sub={countPendentes > 0 ? 'Ação necessária' : 'Nenhuma'}
          />
          <StatCard
            label="Aprovados"
            value={countAprovados}
            icon={<CheckCircle2 size={20} className="text-green-600" />}
            accentVar="#16a34a"
            sub={`${countAprovados} visitantes`}
          />
          <StatCard
            label="Recusados"
            value={countRecusados}
            icon={<XCircle size={20} className="text-red-600" />}
            accentVar="#dc2626"
            sub={`${countRecusados} rejeitados`}
          />
          <StatCard
            label="Total"
            value={countTotal}
            icon={<Users size={20} className="text-blue-600" />}
            accentVar="#2563eb"
            sub="Requisições"
          />
        </div>

        {/* Barra de Filtros Padronizada */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 items-center gap-3 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="Buscar por nome ou empresa..."
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
                {filtroStatus !== "Todos" && (
                  <span className="ml-1 w-5 h-5 rounded-full bg-primary text-[10px] flex items-center justify-center text-primary-foreground">
                    1
                  </span>
                )}
              </Button>
            </div>

            <div className="px-3 py-2 rounded-xl bg-muted/40 border border-border/50 text-[11px] font-semibold text-muted-foreground">
              {requisicoesFiltradas.length} requisição(ões) encontrada(s)
            </div>
          </div>

          {(filtroStatus !== "Todos" || busca) && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border/40">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">Filtros ativos:</span>
              {busca && (
                <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
                  Busca: {busca}
                </span>
              )}
              {filtroStatus !== "Todos" && (
                <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
                  Status: {filtroStatus}
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

        {/* Seção: Requisições */}
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border bg-muted/20">
            <div>
              <h2 className="text-sm font-bold text-foreground">Listagem de Requisições</h2>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Histórico e pendências recentes
              </p>
            </div>
            <Clock size={20} className="text-primary opacity-50" />
          </div>

          {loading && requisicoes.length === 0 ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : requisicoesFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <AlertTriangle size={32} className="text-muted/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                Nenhuma requisição encontrada com os filtros aplicados.
              </p>
            </div>
          ) : (
            <div className="p-5 space-y-3">
              {requisicoesFiltradas.slice(0, 10).map((requisicao) => {
                const usuario = requisicao.usuario || {};
                const status = requisicao.status || 'pendente';
                const statusColor = {
                  pendente: 'bg-amber-100 text-amber-700',
                  aprovado: 'bg-green-100 text-green-700',
                  recusado: 'bg-red-100 text-red-600'
                }[status] || 'bg-gray-100 text-gray-700';

                return (
                  <div
                    key={requisicao.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors group"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{usuario.nome || '—'}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {requisicao.empresa || '—'} • {requisicao.motivo || '—'}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap">
                        {formatDateTime(requisicao.dataDaRequisicao)}
                      </span>
                      <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
                        {status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          <div className="p-4 border-t border-border bg-muted/10 text-center">
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary" asChild>
              <a href="/supervisor/aprovacoes">Ver todas as requisições</a>
            </Button>
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-500" />
              Como Funciona
            </h3>
            <ul className="space-y-3 text-xs text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 font-bold text-[10px]">1</span>
                <span>A portaria solicita a aprovação de um novo visitante</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 font-bold text-[10px]">2</span>
                <span>Você recebe a notificação e analisa os dados</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 font-bold text-[10px]">3</span>
                <span>Aprova ou rejeita a solicitação com observações</span>
              </li>
            </ul>
          </div>

          <div className="bg-green-500/5 border border-green-500/10 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green-500" />
              Segurança
            </h3>
            <ul className="space-y-3 text-xs text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-green-500 font-bold">✓</span>
                <span>Sempre verifique os dados pessoais do visitante</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 font-bold">✓</span>
                <span>Confirme se a empresa está autorizada</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 font-bold">✓</span>
                <span>Verifique a validade da solicitação</span>
              </li>
            </ul>
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
              Status da Requisição
            </label>
            <div className="grid grid-cols-1 gap-2">
              {["Todos", "Pendente", "Aprovado", "Recusado"].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setTempFiltroStatus(status)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all border ${
                    tempFiltroStatus === status
                      ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                      : "bg-background text-muted-foreground border-border/60 hover:border-primary/30 hover:bg-muted/40"
                  }`}
                >
                  <span>{status === "Todos" ? "Todos os Status" : status}</span>
                  {tempFiltroStatus === status && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </ModalFiltro>
    </>
  );
}
