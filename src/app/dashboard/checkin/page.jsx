"use client";

import React, { useState } from "react";
import {
  Search,
  Filter,
  Download,
  Printer,
  Clock,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  LogOut,
  Calendar,
  Building2,
  Users,
  ArrowRightLeft,
  Eye,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import { STATS_MOVIMENTACAO, MOVIMENTACAO_LISTA } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CheckinPage() {
  const [filtroStatus, setFiltroStatus] = useState("Todas");
  const [busca, setBusca] = useState("");

  const registrosFiltrados = MOVIMENTACAO_LISTA.filter((reg) => {
    const matchesStatus =
      filtroStatus === "Todas" ||
      (filtroStatus === "Dentro" && reg.status === "Dentro") ||
      (filtroStatus === "Saiu" && reg.status === "Saiu") ||
      (filtroStatus === "Pendente" && reg.status === "Aguard. aprovação") ||
      (filtroStatus === "Alerta" && reg.status === "Alerta");

    const matchesBusca =
      reg.visitante.toLowerCase().includes(busca.toLowerCase()) ||
      reg.cpf.includes(busca) ||
      reg.empresa.toLowerCase().includes(busca.toLowerCase());
    return matchesStatus && matchesBusca;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Check-in / Check-out</h1>
          <p className="text-sm text-muted-foreground">Indústria Alimentos Puros • Ter 08h00 - 18h • 29 de julho de 2025</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Download size={14} /> Exportar
          </Button>
          <Button size="sm" className="gap-2 bg-sky-500 hover:bg-sky-600 text-white border-none">
            <LogOut size={14} /> Fazer Check-out
          </Button>
          <Button size="sm" className="gap-2 bg-sidebar-primary text-sidebar-primary-foreground">
            <UserPlus size={14} /> Fazer Check-in
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Check-ins Hoje"
          value={STATS_MOVIMENTACAO.checkins.value}
          icon={<ArrowRightLeft size={18} className="text-blue-500" />}
          sub={STATS_MOVIMENTACAO.checkins.sub}
          delta={STATS_MOVIMENTACAO.checkins.delta}
          deltaDir={STATS_MOVIMENTACAO.checkins.deltaDir}
          accentVar="#3b82f6"
        />
        <StatCard
          label="Check-outs Hoje"
          value={STATS_MOVIMENTACAO.checkouts.value}
          icon={<LogOut size={18} className="text-green-500" />}
          sub={`${STATS_MOVIMENTACAO.checkouts.pct}% ${STATS_MOVIMENTACAO.checkouts.sub}`}
          accentVar="#10b981"
        />
        <StatCard
          label="Dentro da Empresa"
          value={STATS_MOVIMENTACAO.dentro.value}
          icon={<Users size={18} className="text-blue-400" />}
          sub={STATS_MOVIMENTACAO.dentro.sub}
          accentVar="#60a5fa"
        />
        <StatCard
          label="Pendentes"
          value={STATS_MOVIMENTACAO.pendentes.value}
          icon={<Clock size={18} className="text-yellow-500" />}
          sub={STATS_MOVIMENTACAO.pendentes.sub}
          accentVar="#f59e0b"
        />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col space-y-4 bg-card p-3 rounded-lg border border-border">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase text-muted-foreground px-2">Status:</span>
          {["Todas", "Dentro", "Saiu", "Pendente", "Alerta"].map((status) => (
            <button
              key={status}
              onClick={() => setFiltroStatus(status)}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                filtroStatus === status
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent"
              }`}
            >
              {status}
            </button>
          ))}

          <div className="h-4 w-px bg-border mx-2 hidden md:block" />

          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" className="text-xs gap-2 h-8">
              <Building2 size={14} /> Todos os Setores
            </Button>
            <Button variant="outline" size="sm" className="text-xs gap-2 h-8">
              <Users size={14} /> Todas as Empresas
            </Button>
            <Button variant="outline" size="sm" className="text-xs gap-2 h-8">
              <Calendar size={14} /> 29/07/2025
            </Button>
          </div>
        </div>

        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
          <Input
            placeholder="Buscar visitante, CPF, empresa..."
            className="pl-9 h-9 text-xs"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm">Registro de Movimentação</h3>
            <p className="text-[10px] text-muted-foreground">{registrosFiltrados.length} registros hoje • mostrando 10 por página</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Clock size={14} />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Download size={14} />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Printer size={14} />
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="px-4 py-3">Visitante</th>
                <th className="px-4 py-3">Empresa</th>
                <th className="px-4 py-3">CPF</th>
                <th className="px-4 py-3">Setor de Destino</th>
                <th className="px-4 py-3">Entrada</th>
                <th className="px-4 py-3">Saída</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {registrosFiltrados.map((reg) => (
                <tr key={reg.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-4 py-3">
                    <p className="text-xs font-bold leading-none">{reg.visitante}</p>
                  </td>
                  <td className="px-4 py-3 text-[11px] font-medium text-muted-foreground">{reg.empresa}</td>
                  <td className="px-4 py-3 text-[11px] font-medium text-muted-foreground">{reg.cpf}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md w-fit">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">{reg.setor}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[11px] font-bold">{reg.entrada}</td>
                  <td className="px-4 py-3 text-[11px] font-medium text-muted-foreground">{reg.saida}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${reg.statusBg}`} />
                      <span className={`text-[10px] font-bold ${reg.statusColor} uppercase tracking-wider`}>{reg.status}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {reg.status === "Aguard. aprovação" ? (
                        <Button size="sm" className="h-7 text-[10px] gap-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white border-none">
                          Aprovar
                        </Button>
                      ) : reg.status !== "Saiu" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[10px] gap-1.5 px-3 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                        >
                          Check-out
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Eye size={12} className="text-muted-foreground" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreHorizontal size={12} className="text-muted-foreground" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
