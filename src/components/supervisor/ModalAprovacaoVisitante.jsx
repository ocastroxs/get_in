'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  Building2,
  Clock,
  Loader2,
  X,
  Users,
  CheckCircle2,
  XCircle,
  MapPin,
  Mail,
  Phone,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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

export default function ModalAprovacaoVisitante({ isOpen, onClose, requisicao, onConfirm }) {
  const [loading, setLoading] = useState(false);
  const [observacoes, setObservacoes] = useState('');
  const [acao, setAcao] = useState(null); // 'aprovar' ou 'rejeitar'

  async function handleAcao(novaAcao) {
    setAcao(novaAcao);
    setLoading(true);

    try {
      const payload = {
        id: requisicao?.id,
        status: novaAcao === 'aprovar' ? 'aprovado' : 'recusado',
        observacoes: observacoes || null
      };

      const response = await api.put(`/requisicao-visitante/${requisicao?.id}`, payload);

      if (response.sucesso) {
        alert(
          novaAcao === 'aprovar'
            ? 'Visitante aprovado com sucesso!'
            : 'Visitante rejeitado com sucesso!'
        );
        onConfirm();
        onClose();
        setObservacoes('');
        setAcao(null);
      } else {
        alert(response.mensagem || 'Erro ao processar requisição.');
      }
    } catch (error) {
      console.error(error);
      alert('Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
      setAcao(null);
    }
  }

  if (!isOpen || !requisicao) return null;

  const usuario = requisicao.usuario || {};
  const departamento = requisicao.departamento || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl animate-in zoom-in rounded-xl border border-border bg-card shadow-lg duration-300 fade-in max-h-[90vh] overflow-y-auto">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-border p-6 sticky top-0 bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 rounded-xl">
              <AlertTriangle size={20} className="text-amber-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Aprovação de Visitante</h2>
              <p className="text-xs text-muted-foreground">Solicitação pendente de aprovação</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 transition-colors hover:bg-muted"
            type="button"
            disabled={loading}
          >
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="space-y-6 p-6">
          {/* Dados Pessoais */}
          <div className="space-y-3 rounded-lg bg-muted/40 p-4 border border-border/50">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Users size={16} className="text-primary" />
              Dados do Visitante
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Nome</p>
                <p className="text-sm font-medium text-foreground">{usuario.nome || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">CPF</p>
                <p className="text-sm font-medium text-foreground">{usuario.cpf || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Email</p>
                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Mail size={14} className="text-muted-foreground" />
                  {usuario.email || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Telefone</p>
                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Phone size={14} className="text-muted-foreground" />
                  {usuario.celular || '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Dados da Empresa */}
          <div className="space-y-3 rounded-lg bg-muted/40 p-4 border border-border/50">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Building2 size={16} className="text-primary" />
              Dados da Empresa
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Empresa</p>
                <p className="text-sm font-medium text-foreground">{requisicao.empresa || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Motivo da Visita</p>
                <p className="text-sm font-medium text-foreground">{requisicao.motivo || '—'}</p>
              </div>
            </div>
          </div>

          {/* Dados do Departamento */}
          <div className="space-y-3 rounded-lg bg-muted/40 p-4 border border-border/50">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <MapPin size={16} className="text-primary" />
              Departamento de Destino
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Departamento</p>
                <p className="text-sm font-medium text-foreground">{departamento.nome || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Responsável</p>
                <p className="text-sm font-medium text-foreground">{departamento.responsavel || '—'}</p>
              </div>
            </div>
          </div>

          {/* Informações de Validade */}
          {requisicao.validade && (
            <div className="space-y-3 rounded-lg bg-blue-500/10 p-4 border border-blue-500/20">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Clock size={16} className="text-blue-500" />
                Validade
              </h3>
              <p className="text-sm font-medium text-foreground">
                {formatDateTime(requisicao.validade)}
              </p>
            </div>
          )}

          {/* Descrição/Observações da Requisição */}
          {requisicao.descricao && (
            <div className="space-y-3 rounded-lg bg-muted/40 p-4 border border-border/50">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <FileText size={16} className="text-primary" />
                Descrição da Requisição
              </h3>
              <p className="text-sm text-foreground">{requisicao.descricao}</p>
            </div>
          )}

          {/* Campo de Observações do Supervisor */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Observações (Opcional)
            </label>
            <textarea
              placeholder="Adicione observações sobre a aprovação ou rejeição (opcional)"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              rows="3"
              disabled={loading}
            />
          </div>
        </div>

        {/* Rodapé com Ações */}
        <div className="flex gap-2 border-t border-border p-6 sticky bottom-0 bg-card">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
            type="button"
          >
            Cancelar
          </Button>
          <Button
            onClick={() => handleAcao('rejeitar')}
            className="flex-1 bg-red-600 hover:bg-red-700"
            disabled={loading || acao === 'aprovar'}
            type="button"
          >
            {loading && acao === 'rejeitar' ? (
              <>
                <Loader2 size={14} className="mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <XCircle size={14} className="mr-2" />
                Rejeitar
              </>
            )}
          </Button>
          <Button
            onClick={() => handleAcao('aprovar')}
            className="flex-1 bg-green-600 hover:bg-green-700"
            disabled={loading || acao === 'rejeitar'}
            type="button"
          >
            {loading && acao === 'aprovar' ? (
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
