"use client";

import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Clock, 
  MoreHorizontal, 
  Activity, 
  Map, 
  Users, 
  ArrowRight,
  AlertTriangle,
  RefreshCw,
  Building2,
  Navigation
} from "lucide-react";
import StatCard from "@/components/StatCard";
import { STATS_CIRCULACAO, CIRCULACAO_LISTA, OCUPACAO_SETORES } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CirculacaoPage() {
  const [busca, setBusca] = useState("");

  const registrosFiltrados = CIRCULACAO_LISTA.filter(reg => {
    const matchesBusca = reg.pessoa.toLowerCase().includes(busca.toLowerCase()) || 
                         reg.origem.toLowerCase().includes(busca.toLowerCase()) ||
                         reg.destino.toLowerCase().includes(busca.toLowerCase());
    return matchesBusca;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Circulação Interna</h1>
          <p className="text-sm text-muted-foreground">
            Monitoramento de fluxo e ocupação em tempo real • 29 de julho de 2025
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw size={14} /> Atualizar
          </Button>
          <Button size="sm" className="gap-2 bg-sidebar-primary text-sidebar-primary-foreground">
            <Map size={14} /> Ver Mapa de Calor
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Movimentações Hoje"
          value={STATS_CIRCULACAO.totalMovimentos.value}
          icon={<Activity size={18} className="text-blue-500" />}
          sub={STATS_CIRCULACAO.totalMovimentos.sub}
          delta={STATS_CIRCULACAO.totalMovimentos.delta}
          deltaDir={STATS_CIRCULACAO.totalMovimentos.deltaDir}
          accentVar="#3b82f6"
        />
        <StatCard
          label="Ocupação Atual"
          value={`${STATS_CIRCULACAO.ocupacaoAtual.value}%`}
          icon={<Users size={18} className="text-green-500" />}
          sub={STATS_CIRCULACAO.ocupacaoAtual.sub}
          accentVar="#10b981"
        />
        <StatCard
          label="Setor Mais Ativo"
          value={STATS_CIRCULACAO.setorMaisAtivo.nome}
          valueClassName="text-xl"
          icon={<Navigation size={18} className="text-purple-500" />}
          sub={`${STATS_CIRCULACAO.setorMaisAtivo.movimentos} movimentos registrados`}
          accentVar="#8b5cf6"
        />
        <StatCard
          label="Tempo Médio / Setor"
          value={STATS_CIRCULACAO.tempoMedio.value}
          icon={<Clock size={18} className="text-yellow-500" />}
          sub={STATS_CIRCULACAO.tempoMedio.sub}
          accentVar="#f59e0b"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ocupação por Setor */}
        <div className="lg:col-span-1 bg-card rounded-xl border border-border p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm">Ocupação por Setor</h3>
            <Building2 size={16} className="text-muted-foreground" />
          </div>
          <div className="space-y-4">
            {OCUPACAO_SETORES.map((setor) => (
              <div key={setor.setor} className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-medium">
                  <span>{setor.setor}</span>
                  <span className="text-muted-foreground">{setor.atual}/{setor.max} pessoas</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(setor.atual / setor.max) * 100}%`,
                      backgroundColor: setor.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="pt-2">
            <Button variant="ghost" className="w-full text-xs text-muted-foreground hover:text-foreground">
              Ver detalhes de todos os setores
            </Button>
          </div>
        </div>

        {/* Logs de Circulação */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm">Logs de Circulação</h3>
              <p className="text-[10px] text-muted-foreground">
                Últimas movimentações internas detectadas
              </p>
            </div>
            <div className="relative w-48 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={12} />
              <Input 
                placeholder="Buscar pessoa ou setor..." 
                className="pl-8 h-8 text-[10px]"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="px-4 py-3">Pessoa</th>
                  <th className="px-4 py-3">Fluxo</th>
                  <th className="px-4 py-3">Horário</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {registrosFiltrados.map((reg) => (
                  <tr key={reg.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-4 py-3">
                      <p className="text-xs font-bold leading-none">{reg.pessoa}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{reg.tipo}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-[11px] font-medium">
                        <span className="text-muted-foreground">{reg.origem}</span>
                        <ArrowRight size={12} className="text-muted-foreground" />
                        <span className="text-foreground">{reg.destino}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[11px] font-bold">
                      {reg.horario}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${reg.statusBg}`} />
                        <span className={`text-[10px] font-bold ${reg.statusColor} uppercase tracking-wider`}>
                          {reg.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreHorizontal size={12} className="text-muted-foreground" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Alertas de Circulação */}
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl p-4 flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center shrink-0">
          <AlertTriangle className="text-red-600 dark:text-red-400" size={20} />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-red-800 dark:text-red-300">Alerta de Permanência Excedida</h4>
          <p className="text-xs text-red-700 dark:text-red-400 mt-1">
            O visitante <strong>Ricardo Pereira</strong> está no setor de <strong>Manutenção</strong> há mais de 2 horas. O tempo previsto era de 45 minutos.
          </p>
        </div>
        <Button size="sm" variant="outline" className="border-red-200 text-red-700 hover:bg-red-100 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/50">
          Verificar Local
        </Button>
      </div>
    </div>
  );
}
