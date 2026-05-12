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
  ChevronRight,
  X,
  Check,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Topbar from '@/components/Topbar';
import StatCard from '@/components/StatCard';
import ModalFiltro from '@/components/ui/ModalFiltro';
import ModalAprovacaoVisitante from '@/components/supervisor/ModalAprovacaoVisitante';
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

function LinhaRequisicao({ requisicao, onAprovar }) {
  const status = requisicao.status || 'pendente';
  const statusClass = STATUS_STYLE[status] || STATUS_STYLE.pendente;
  const dotClass = STATUS_DOT[status] || STATUS_DOT.pendente;
  const usuario = requisicao.usuario || {};
  const departamento = requisicao.departamento || {};

  return (
    <tr className="border-b border-border transition-colors hover:bg-muted/50">
      <td className="px-4 py-3">
        <div>
          <p className="text-sm font-bold text-foreground">{usuario.nome || '—'}</p>
          <p className="text-[11px] text-muted-foreground">{usuario.cpf || 'CPF não informado'}</p>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-foreground">{requisicao.empresa || '—'}</td>
      <td className="px-4 py-3 text-sm text-foreground">{departamento.nome || '—'}</td>
      <td className="px-4 py-3 text-sm text-foreground">{requisicao.motivo || '—'}</td>
      <td className="px-4 py-3 whitespace-nowrap text-[11px] font-mono text-muted-foreground">
        {formatDateTime(requisicao.dataDaRequisicao)}
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-2 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusClass}`}>
          <span className={`h-2 w-2 rounded-full ${dotClass}`} />
          {STATUS_LABEL[status] || STATUS_LABEL.pendente}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2 whitespace-nowrap">
          {status === 'pendente' && (
            <Button
              size="sm"
              onClick={() => onAprovar(requisicao)}
              className="h-8 gap-1.5 bg-blue-600 text-[11px] font-bold hover:bg-blue-700 rounded-lg"
              type="button"
            >
              <ChevronRight size={14} />
              <span className="hidden xl:inline uppercase">Analisar</span>
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function AprovacoesSupervisorPage() {
  const [requisicoes, setRequisicoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('pendente');
  const [modalAberto, setModalAberto] = useState(false);
  const [requisicaoSelecionada, setRequisicaoSelecionada] = useState(null);
  
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
  const [tempFiltroStatus, setTempFiltroStatus] = useState("pendente");

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
    return requisicoes.filter((requisicao) => {
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
    });
  }, [requisicoes, busca, filtroStatus]);

  function handleAprovar(requisicao) {
    setRequisicaoSelecionada(requisicao);
    setModalAberto(true);
  }

  function handleConfirmacao() {
    fetchRequisicoes();
  }

  const countPendentes = requisicoes.filter((r) => r.status === 'pendente').length;
  const countAprovados = requisicoes.filter((r) => r.status === 'aprovado').length;
  const countRecusados = requisicoes.filter((r) => r.status === 'recusado').length;

  const aplicarFiltros = () => {
    setFiltroStatus(tempFiltroStatus);
  };

  const limparFiltros = () => {
    setTempFiltroStatus("pendente");
    setFiltroStatus("pendente");
    setBusca("");
  };

  const exportarCSV = () => {
    if (requisicoesFiltradas.length === 0) {
      alert("Não há dados para exportar.");
      return;
    }

    const headers = ["Visitante", "CPF", "Empresa", "Departamento", "Motivo", "Data", "Status"];
    const rows = requisicoesFiltradas.map(r => {
      const usuario = r.usuario || {};
      const departamento = r.departamento || {};
      return [
        usuario.nome || "—",
        usuario.cpf || "—",
        r.empresa || "—",
        departamento.nome || "—",
        r.motivo || "—",
        formatDateTime(r.dataDaRequisicao),
        STATUS_LABEL[r.status] || "Pendente"
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `aprovacoes_supervisor_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Topbar
        title="Aprovação de Visitantes"
        subtitle="Gerenciamento de solicitações de visitantes da portaria"
      />

      <div className="flex flex-col gap-6 p-4 md:p-6 animate-in fade-in duration-700">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                {filtroStatus !== "todos" && (
                  <span className="ml-1 w-5 h-5 rounded-full bg-primary text-[10px] flex items-center justify-center text-primary-foreground">
                    1
                  </span>
                )}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={exportarCSV}
                variant="outline"
                className="h-11 px-4 gap-2 rounded-xl border-border/60 bg-background/80 text-sm font-medium"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Exportar CSV</span>
              </Button>
              <div className="px-3 py-2 rounded-xl bg-muted/40 border border-border/50 text-[11px] font-semibold text-muted-foreground">
                {requisicoesFiltradas.length} resultado(s)
              </div>
            </div>
          </div>

          {(filtroStatus !== "todos" || busca) && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border/40">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">Filtros ativos:</span>
              {busca && (
                <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
                  Busca: {busca}
                </span>
              )}
              {filtroStatus !== "todos" && (
                <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
                  Status: {STATUS_LABEL[filtroStatus] || filtroStatus}
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
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/20">
            <h3 className="font-bold text-sm text-foreground">Listagem de Aprovações</h3>
          </div>
          
          {loading && requisicoes.length === 0 ? (
            <div className="flex items-center justify-center p-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : requisicoesFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 text-center">
              <AlertTriangle size={32} className="text-muted/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                Nenhuma requisição encontrada com os filtros aplicados.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Visitante
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Empresa
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Departamento
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Motivo
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {requisicoesFiltradas.map((requisicao) => (
                    <LinhaRequisicao
                      key={requisicao.id}
                      requisicao={requisicao}
                      onAprovar={handleAprovar}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ModalAprovacaoVisitante
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
              Status da Requisição
            </label>
            <div className="grid grid-cols-1 gap-2">
              {["todos", "pendente", "aprovado", "recusado"].map((status) => (
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
                  <span>{status === "todos" ? "Todos os Status" : STATUS_LABEL[status]}</span>
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
