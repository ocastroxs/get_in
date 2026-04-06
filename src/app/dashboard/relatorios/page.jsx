"use client";

import React from "react";
// Importando seus componentes existentes conforme sua estrutura de pastas
import Topbar from "@/components/Topbar";
import StatCard from "@/components/StatCard";
import EntradasChart from "@/components/EntradasChart";
import TiposVisitantesChart from "@/components/TiposVisitantesChart";
import { Download, FileText, Search, SlidersHorizontal } from "lucide-react";

export default function RelatoriosPage() {
  return (
    <div className="flex flex-col gap-6 w-full pb-10 text-[#0f1419]">
      
      {/* 1. TOPBAR E BOTÕES (Reutilizando seu Topbar) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Topbar 
          title="Relatórios" 
          subtitle="Indústria Alimentos Pares • Turno 08h – 18h • 29 de julho de 2025" 
        />
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all">
            <Download className="w-4 h-4" /> Exportar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#39a3ea] text-white rounded-lg text-sm font-medium hover:bg-[#003061] transition-all shadow-sm">
            <FileText className="w-4 h-4" /> Gerar Relatório
          </button>
        </div>
      </div>

      {/* 2. FILTROS (Estilo Card igual ao Figma) */}
      <div className="bg-[#f7f8f8] p-5 rounded-2xl border border-gray-100 flex flex-wrap items-end gap-4 shadow-sm">
        <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Período</label>
          <div className="flex items-center gap-2">
            <input type="date" className="border rounded-lg px-3 py-2 text-sm w-full bg-white" defaultValue="2025-07-01" />
            <span className="text-gray-400">até</span>
            <input type="date" className="border rounded-lg px-3 py-2 text-sm w-full bg-white" defaultValue="2025-07-29" />
          </div>
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Tipo</label>
          <select className="border rounded-lg px-3 py-2 text-sm bg-white">
            <option>Todos os visitantes</option>
          </select>
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Setor</label>
          <select className="border rounded-lg px-3 py-2 text-sm bg-white">
            <option>Todos os setores</option>
          </select>
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Empresa</label>
          <select className="border rounded-lg px-3 py-2 text-sm bg-white">
            <option>Todas</option>
          </select>
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:underline">Limpar</button>
           <button className="px-6 py-2 bg-[#39a3ea] text-white rounded-lg text-sm font-bold shadow-md">Aplicar</button>
        </div>
      </div>

      {/* 3. STAT CARDS (Reutilizando seu StatCard) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total de Visitas" value="348" trend="12% vs mês anterior" trendUp={true} />
        <StatCard label="Check-outs Realizados" value="322" trend="100% registrados" trendUp={true} />
        <StatCard label="Permanência Média" value="1h 42m" trend="8 min vs mês anterior" trendUp={false} />
        <StatCard label="Alertas Gerados" value="7" trend="3 pendentes" trendUp={false} />
      </div>

      {/* 4. GRÁFICOS (Reutilizando seus componentes de Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <EntradasChart />
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <TiposVisitantesChart />
        </div>
      </div>

      {/* 5. TABELA DE HISTÓRICO (Fiel ao design) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-lg">Histórico de Visitas</h3>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Buscar visitante..." className="pl-9 pr-4 py-2 border rounded-lg text-sm w-64 outline-none focus:border-[#39a3ea]" />
            </div>
            <button className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              <SlidersHorizontal className="w-4 h-4" /> Filtros
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#f7f8f8] text-[10px] uppercase font-bold text-gray-400">
              <tr>
                <th className="px-6 py-4">Visitante</th>
                <th className="px-6 py-4">Empresa</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Setor</th>
                <th className="px-6 py-4">Entrada</th>
                <th className="px-6 py-4">Saída</th>
                <th className="px-6 py-4">Permanência</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50">
              <tr className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-bold">Marina Souza</td>
                <td className="px-6 py-4 text-gray-500">HabLab</td>
                <td className="px-6 py-4"><span className="bg-blue-50 text-blue-500 px-2 py-1 rounded text-[10px] font-bold uppercase">Técnico</span></td>
                <td className="px-6 py-4 text-gray-500">Laboratório</td>
                <td className="px-6 py-4">08:12</td>
                <td className="px-6 py-4">10:34</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="w-12">2h 22m</span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full w-20 overflow-hidden">
                       <div className="h-full bg-[#39a3ea]" style={{width: '70%'}}></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4"><span className="bg-emerald-50 text-emerald-500 px-2 py-1 rounded text-[10px] font-bold">CONCLUÍDO</span></td>
              </tr>
              {/* Adicione mais linhas conforme necessário seguindo o padrão acima */}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. GRID INFERIOR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
           <h3 className="font-bold mb-4">Setores Mais Visitados</h3>
           {/* Aqui você pode criar um componente simples ou usar uma lista com barras de progresso */}
           <div className="space-y-4">
              {['Produção', 'Laboratório', 'Almoxarifado'].map((setor, i) => (
                <div key={setor}>
                  <div className="flex justify-between text-xs mb-1"><span>{setor}</span><span className="font-bold text-gray-400">{128 - (i*30)} visitas</span></div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#39a3ea] h-full" style={{width: `${100 - (i*20)}%`}}></div>
                  </div>
                </div>
              ))}
           </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
           <h3 className="font-bold mb-4">Empresas com Mais Visitas</h3>
           <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-[10px] uppercase text-gray-400 border-b border-gray-50">
                  <th className="pb-2">Empresa</th>
                  <th className="pb-2 text-center">Visitas</th>
                  <th className="pb-2 text-center">Alertas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {['GupiTao', 'HabLab', 'Sigma Ltda'].map((empresa, i) => (
                  <tr key={empresa}>
                    <td className="py-3 font-medium">{empresa}</td>
                    <td className="py-3 text-center text-gray-500">{88 - (i*6)}</td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${i === 0 ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                        {i === 0 ? '3' : '0'}
                      </span>
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