'use client';

import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Users,
  Clock,
  Loader2
} from 'lucide-react';
import Topbar from '@/components/Topbar';
import StatCard from '@/components/StatCard';
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

  const countPendentes = requisicoes.filter((r) => r.status === 'pendente').length;
  const countAprovados = requisicoes.filter((r) => r.status === 'aprovado').length;
  const countRecusados = requisicoes.filter((r) => r.status === 'recusado').length;
  const countTotal = requisicoes.length;

  const ultimasRequisicoes = requisicoes
    .sort((a, b) => new Date(b.dataDaRequisicao) - new Date(a.dataDaRequisicao))
    .slice(0, 5);

  return (
    <>
      <Topbar
        title="Dashboard do Supervisor"
        subtitle="Visão geral das solicitações de visitantes"
      />

      <div className="p-8 max-w-7xl mx-auto">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

        {/* Seção: Últimas Requisições */}
        <div className="bg-card border border-border rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-foreground">Últimas Requisições</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Visualize as requisições mais recentes
              </p>
            </div>
            <Clock size={24} className="text-primary opacity-50" />
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : ultimasRequisicoes.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <AlertTriangle size={32} className="text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                Nenhuma requisição encontrada no momento.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {ultimasRequisicoes.map((requisicao) => {
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
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{usuario.nome || '—'}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {requisicao.empresa || '—'} • {requisicao.motivo || '—'}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDateTime(requisicao.dataDaRequisicao)}
                      </span>
                      <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${statusColor}`}>
                        {status === 'pendente' && 'Pendente'}
                        {status === 'aprovado' && 'Aprovado'}
                        {status === 'recusado' && 'Recusado'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Informações Adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Card: Sobre o Fluxo */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-500" />
              Como Funciona
            </h3>
            <ul className="space-y-2 text-sm text-foreground">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">1.</span>
                <span>A portaria solicita a aprovação de um novo visitante</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">2.</span>
                <span>Você recebe a notificação e analisa os dados</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">3.</span>
                <span>Aprova ou rejeita a solicitação com observações</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">4.</span>
                <span>A portaria recebe a resposta e libera o crachá</span>
              </li>
            </ul>
          </div>

          {/* Card: Dicas */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green-500" />
              Dicas de Segurança
            </h3>
            <ul className="space-y-2 text-sm text-foreground">
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>Sempre verifique os dados pessoais do visitante</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>Confirme se a empresa está autorizada</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>Verifique a validade da solicitação</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>Deixe observações relevantes para o histórico</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
