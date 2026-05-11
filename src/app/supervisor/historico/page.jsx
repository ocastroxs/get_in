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
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Topbar from '@/components/Topbar';
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

  return (
    <>
      <Topbar
        title="Histórico de Aprovações"
        subtitle="Visualize todas as requisições processadas"
      />

      <div className="flex flex-col gap-6 animate-in fade-in duration-700">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Pendentes
                </p>
                <p className="text-3xl font-bold text-amber-600">{countPendentes}</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <AlertTriangle size={24} className="text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Aprovados
                </p>
                <p className="text-3xl font-bold text-green-600">{countAprovados}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle2 size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Recusados
                </p>
                <p className="text-3xl font-bold text-red-600">{countRecusados}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle size={24} className="text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  type="text"
                  placeholder="Buscar por nome, CPF ou empresa..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2 w-full lg:w-auto">
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="px-4 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
              >
                <option value="todos">Todos</option>
                <option value="pendente">Pendentes</option>
                <option value="aprovado">Aprovados</option>
                <option value="recusado">Recusados</option>
              </select>
              <Button
                onClick={handleExportarCSV}
                variant="outline"
                className="gap-2"
                type="button"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Exportar</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Tabela de Requisições */}
        <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : requisicoesFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <AlertTriangle size={32} className="text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                {busca || filtroStatus !== 'todos'
                  ? 'Nenhuma requisição encontrada com os filtros aplicados.'
                  : 'Nenhuma requisição encontrada no momento.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Visitante
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Empresa
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Departamento
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Motivo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Data da Requisição
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
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
        <div className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
          <h3 className="text-sm font-bold text-foreground mb-3">Sobre o Histórico</h3>
          <p className="text-sm text-foreground">
            Este histórico contém todas as requisições de visitantes processadas. Você pode filtrar por status,
            buscar por nome/CPF/empresa e exportar os dados em formato CSV para análise posterior.
          </p>
        </div>
      </div>
    </>
  );
}
