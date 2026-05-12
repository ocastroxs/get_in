'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Building2,
  Clock,
  Loader2,
  Search,
  Users,
  CheckCircle2,
  XCircle,
  Filter,
  Download,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Topbar from '@/components/Topbar';
import StatCard from '@/components/StatCard';
import ModalFiltro from '@/components/ui/ModalFiltro';
import { api } from '@/services/api';

const STATUS_LABEL = {
  pendente: 'Pendente',
  aprovado: 'Aprovado',
  recusado: 'Recusado'
};

const STATUS_STYLE = {
  pendente: 'bg-amber-100 text-amber-700',
  aprovado: 'bg-green-100 text-green-700',
  recusado: 'bg-red-100 text-red-600'
};

const STATUS_DOT = {
  pendente: 'bg-amber-500',
  aprovado: 'bg-green-500',
  recusado: 'bg-red-500'
};

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

function LinhaRequisicao({ requisicao }) {
  const status = requisicao.status || 'pendente';
  const statusClass = STATUS_STYLE[status] || STATUS_STYLE.pendente;
  const dotClass = STATUS_DOT[status] || STATUS_DOT.pendente;
  const usuario = requisicao.usuario || {};
  const departamento = requisicao.departamento || {};

  return (
    <tr className="border-b border-border transition-colors hover:bg-muted/50">
      <td className="px-4 py-3">
        <div>
          <p className="text-sm font-medium text-foreground">{usuario.nome || '—'}</p>
          <p className="text-xs text-muted-foreground">{usuario.cpf || 'CPF não informado'}</p>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-foreground">{requisicao.empresa || '—'}</td>
      <td className="px-4 py-3 text-sm text-foreground">{departamento.nome || '—'}</td>
      <td className="px-4 py-3 text-sm text-foreground">{requisicao.motivo || '—'}</td>
      <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
        {formatDateTime(requisicao.dataDaRequisicao)}
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-2 rounded-md px-2.5 py-1 text-xs font-medium ${statusClass}`}>
          <span className={`h-2 w-2 rounded-full ${dotClass}`} />
          {STATUS_LABEL[status] || STATUS_LABEL.pendente}
        </span>
      </td>
    </tr>
  );
}

export default function HistoricoSupervisorPage() {
  const [requisicoes, setRequisicoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);

  // Estados temporários para o modal de filtro
  const [tempFiltroStatus, setTempFiltroStatus] = useState('todos');

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
    return requisicoes
      .filter((requisicao) => {
        const usuario = requisicao.usuario || {};
        const nome = usuario.nome?.toLowerCase() || '';
        const cpf = usuario.cpf || '';
        const empresa = requisicao.empresa?.toLowerCase() || '';
        const termoBusca = busca.toLowerCase();

        const matchBusca =
          busca === '' ||
          nome.includes(termoBusca) ||
          cpf.includes(busca) ||
          empresa.includes(termoBusca);

        const matchStatus = filtroStatus === 'todos' || requisicao.status === filtroStatus;

        return matchBusca && matchStatus;
      })
      .sort((a, b) => new Date(b.dataDaRequisicao) - new Date(a.dataDaRequisicao));
  }, [requisicoes, busca, filtroStatus]);

  const countPendentes = requisicoes.filter((r) => r.status === 'pendente').length;
  const countAprovados = requisicoes.filter((r) => r.status === 'aprovado').length;
  const countRecusados = requisicoes.filter((r) => r.status === 'recusado').length;

  function handleExportarCSV() {
    if (requisicoesFiltradas.length === 0) {
      alert('Nenhuma requisição para exportar.');
      return;
    }

    const headers = ['Nome', 'CPF', 'Empresa', 'Departamento', 'Motivo', 'Data da Requisição', 'Status'];
    const rows = requisicoesFiltradas.map((r) => {
      const usuario = r.usuario || {};
      const departamento = r.departamento || {};
      return [
        usuario.nome || '—',
        usuario.cpf || '—',
        r.empresa || '—',
        departamento.nome || '—',
        r.motivo || '—',
        formatDateTime(r.dataDaRequisicao),
        STATUS_LABEL[r.status] || r.status
      ];
    });

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historico-requisicoes-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const aplicarFiltros = () => {
    setFiltroStatus(tempFiltroStatus);
  };

  const limparFiltros = () => {
    setTempFiltroStatus('todos');
    setFiltroStatus('todos');
    setBusca('');
  };

  return (
    <>
      <Topbar
        title="Histórico de Aprovações"
        subtitle="Visualize todas as requisições processadas"
      />

      <div className="flex flex-col gap-6 animate-in fade-in duration-700">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <StatCard
            label="Pendentes"
            value={countPendentes}
            valueClassName="text-amber-600"
            icon={<AlertTriangle size={17} className="text-amber-600" />}
            sub="Aguardando análise"
            accentVar="var(--warning)"
          />
          <StatCard
            label="Aprovados"
            value={countAprovados}
            valueClassName="text-green-600"
            icon={<CheckCircle2 size={17} className="text-green-600" />}
            sub="Visitantes autorizados"
            accentVar="var(--chart-2)"
          />
          <StatCard
            label="Recusados"
            value={countRecusados}
            valueClassName="text-red-600"
            icon={<XCircle size={17} className="text-red-600" />}
            sub="Acesso não autorizado"
            accentVar="var(--destructive)"
          />
        </div>

        {/* Barra de Busca e Filtros Padronizada */}
        <div className="bg-card border border-border rounded-2xl p-5 mb-6 shadow-sm">
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
                {(filtroStatus !== 'todos') && (
                  <span className="ml-1 w-5 h-5 rounded-full bg-primary text-[10px] flex items-center justify-center text-primary-foreground">
                    1
                  </span>
                )}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-3 py-2 rounded-xl bg-muted/40 border border-border/50 text-[11px] font-semibold text-muted-foreground">
                {requisicoesFiltradas.length} resultado(s)
              </div>
              <Button
                type="button"
                onClick={handleExportarCSV}
                variant="outline"
                className="h-11 gap-2 rounded-xl border-border/60"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Exportar CSV</span>
              </Button>
            </div>
          </div>

          {(filtroStatus !== 'todos' || busca) && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border/40">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">Filtros ativos:</span>
              {busca && (
                <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
                  Busca: {busca}
                </span>
              )}
              {filtroStatus !== 'todos' && (
                <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
                  Status: {STATUS_LABEL[filtroStatus]}
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
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/20">
            <h3 className="font-bold text-sm">Registros de Acesso</h3>
            <p className="text-xs text-muted-foreground">Listagem completa de solicitações</p>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-sm">Carregando dados...</span>
              </div>
            </div>
          ) : requisicoesFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <AlertTriangle size={32} className="text-muted-foreground mb-3 opacity-20" />
              <p className="text-sm text-muted-foreground">
                Nenhum registro encontrado com os filtros aplicados.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3 text-left">Visitante</th>
                    <th className="px-4 py-3 text-left">Empresa</th>
                    <th className="px-4 py-3 text-left">Departamento</th>
                    <th className="px-4 py-3 text-left">Motivo</th>
                    <th className="px-4 py-3 text-left">Solicitação</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requisicoesFiltradas.map((requisicao) => (
                    <LinhaRequisicao
                      key={requisicao.id}
                      requisicao={requisicao}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Informações Adicionais */}
        <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-5">
          <div className="flex gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 h-fit">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground mb-1">Sobre o Histórico</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Este histórico contém todas as requisições de visitantes processadas. Você pode filtrar por status,
                buscar por nome/CPF/empresa e exportar os dados em formato CSV para análise posterior.
              </p>
            </div>
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
            <div className="grid grid-cols-2 gap-2">
              {['todos', 'pendente', 'aprovado', 'recusado'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setTempFiltroStatus(status)}
                  className={`flex items-center justify-center px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                    tempFiltroStatus === status
                      ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                      : "bg-background text-muted-foreground border-border/60 hover:border-primary/30 hover:bg-muted/40"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
            <p className="text-[10px] text-amber-600 leading-relaxed">
              <strong>Dica:</strong> Você também pode usar a barra de busca rápida para filtrar por Nome, CPF ou Empresa sem abrir este modal.
            </p>
          </div>
        </div>
      </ModalFiltro>
    </>
  );
}
