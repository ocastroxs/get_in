"use client";

import { useState } from 'react';
import Sidebar from '@/components/ui/sidebar';
import { Shield, Eye, ShieldAlert, Check, Minus, X, RotateCcw } from 'lucide-react';

export default function PermissoesPage() {
  // Estado que controla qual aba está visível no momento
  const [abaAtiva, setAbaAtiva] = useState('funcionarios');

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          
          {/* Cabeçalho */}
          <header className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-blue-950 tracking-tight">
                Permissões
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Gerencie o que cada perfil e visitante pode acessar no sistema.
              </p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                <RotateCcw className="w-4 h-4" />
                Descartar
              </button>
              <button 
                onClick={() => alert("Alterações salvas no banco de dados!")}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-950 rounded-lg hover:bg-blue-900 transition-colors"
              >
                <Check className="w-4 h-4" />
                Salvar alterações
              </button>
            </div>
          </header>

          {/* Abas Interativas */}
          <div className="flex gap-6 border-b border-gray-200 mb-6">
            <button 
              onClick={() => setAbaAtiva('funcionarios')}
              className={`pb-3 text-sm font-semibold transition-colors ${
                abaAtiva === 'funcionarios' 
                  ? 'text-blue-950 border-b-2 border-blue-950' 
                  : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
              }`}
            >
              Funcionários
            </button>
            <button 
              onClick={() => setAbaAtiva('visitantes')}
              className={`pb-3 text-sm font-semibold transition-colors ${
                abaAtiva === 'visitantes' 
                  ? 'text-blue-950 border-b-2 border-blue-950' 
                  : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
              }`}
            >
              Visitantes
            </button>
          </div>

          {/* Legenda */}
          <div className="flex items-center gap-6 mb-6 text-sm text-gray-600">
            <div className="flex items-center gap-2"><Badge status="allow" /> Permitida</div>
            <div className="flex items-center gap-2"><Badge status="deny" /> Bloqueada</div>
            <div className="flex items-center gap-2"><Badge status="read" /> Somente leitura</div>
            <span className="text-gray-400">|</span>
            <span className="text-gray-500 italic">clique para alternar</span>
          </div>

          {/* Renderização Condicional: Mostra a tabela correspondente à aba escolhida */}
          <div className="border border-gray-200 rounded-xl overflow-hidden animate-in fade-in duration-300">
            {abaAtiva === 'funcionarios' ? <TabelaFuncionarios /> : <TabelaVisitantes />}
          </div>

        </div>
      </main>
    </div>
  );
}

// 
// COMPONENTES DAS TABELAS
// 

function TabelaFuncionarios() {
  return (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="bg-blue-950 text-white">
          <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider w-1/2">Funcionalidade</th>
          <th className="py-4 px-6 text-center"><HeaderIcon icon={Shield} label="Portaria" /></th>
          <th className="py-4 px-6 text-center"><HeaderIcon icon={Eye} label="Supervisor" /></th>
          <th className="py-4 px-6 text-center"><HeaderIcon icon={ShieldAlert} label="Administrador" /></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        <SectionRow title="Visitantes" />
        <PermissionRow title="Cadastrar visitante" desc="Registrar novo visitante no sistema" p="allow" s="read" a="allow" />
        <PermissionRow title="Editar dados de visitante" desc="Alterar informações durante a visita" p="read" s="allow" a="allow" />
        <PermissionRow title="Check-out / encerrar visita" desc="Finalizar visita e devolver crachá" p="allow" s="allow" a="allow" />
        <PermissionRow title="Excluir visitante" desc="Remover registro permanentemente" p="deny" s="deny" a="allow" />

        <SectionRow title="Aprovações de Acesso" />
        <PermissionRow title="Solicitar aprovação" desc="Enviar pedido de entrada ao supervisor" p="allow" s="deny" a="allow" />
        <PermissionRow title="Aprovar / negar acesso" desc="Decisão de entrada em setor restrito" p="deny" s="allow" a="allow" />
      </tbody>
    </table>
  );
}

function TabelaVisitantes() {
  return (
    <table className="w-full text-left border-collapse bg-gray-50">
      <thead>
        <tr className="bg-gray-800 text-white">
          <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider w-1/2">Funcionalidade (App do Visitante)</th>
          <th className="py-4 px-6 text-center"><HeaderIcon icon={Eye} label="Visitante Comum" /></th>
          <th className="py-4 px-6 text-center"><HeaderIcon icon={ShieldAlert} label="Visitante VIP" /></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 bg-white">
        <SectionRow title="Acesso pelo Aplicativo" />
        <PermissionRow title="Visualizar mapa do prédio" desc="Ver mapa de rotas liberadas" p="allow" s="allow" a="allow" />
        <PermissionRow title="Acesso ao refeitório" desc="Permissão para entrar na área de alimentação" p="deny" s="allow" a="allow" />
        <PermissionRow title="Gerar QR Code de entrada" desc="Criar passe temporário na catraca" p="read" s="allow" a="allow" />
      </tbody>
    </table>
  );
}

// 
// COMPONENTES AUXILIARES (UI)
// 

function HeaderIcon({ icon: Icon, label }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <Icon className="w-5 h-5 text-gray-300" />
      <span className="text-xs font-semibold">{label}</span>
    </div>
  );
}

function SectionRow({ title }) {
  return (
    <tr className="bg-gray-50">
      <td colSpan="4" className="py-2 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">
        {title}
      </td>
    </tr>
  );
}

function PermissionRow({ title, desc, p: initialP, s: initialS, a: initialA }) {
  
   
    const [p, setP] = useState(initialP);
    const [s, setS] = useState(initialS);
    const [a, setA] = useState(initialA);
  
    // 2. Função que decide qual é a próxima cor/status após o clique
    const alternarStatus = (statusAtual) => {
      if (statusAtual === 'allow') return 'deny';  // Se tava verde, fica vermelho
      if (statusAtual === 'deny') return 'read';   // Se tava vermelho, fica amarelo
      return 'allow';                              // Se tava amarelo, volta pro verde
    };
  
    return (
      <tr className="hover:bg-gray-50/50 transition-colors">
        <td className="py-3 px-6">
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
        </td>
        
        {/* Coluna 1: Portaria / Visitante Comum */}
        <td className="py-3 px-6 text-center">
          <button 
            onClick={() => setP(alternarStatus(p))} 
            className="hover:scale-110 active:scale-95 transition-transform"
            title="Clique para alterar"
          >
            <Badge status={p} />
          </button>
        </td>
  
        {/* Coluna 2: Supervisor / Visitante VIP */}
        <td className="py-3 px-6 text-center">
          <button 
            onClick={() => setS(alternarStatus(s))} 
            className="hover:scale-110 active:scale-95 transition-transform"
            title="Clique para alterar"
          >
            <Badge status={s} />
          </button>
        </td>
  
        {/* Coluna 3: Administrador (Só aparece se a propriedade 'a' foi passada) */}
        {initialA !== undefined && (
          <td className="py-3 px-6 text-center">
            <button 
              onClick={() => setA(alternarStatus(a))} 
              className="hover:scale-110 active:scale-95 transition-transform"
              title="Clique para alterar"
            >
              <Badge status={a} />
            </button>
          </td>
        )}
      </tr>
    );
  }
  
  function Badge({ status }) {
    const styles = {
      allow: "bg-green-100 text-green-600",
      deny: "bg-red-100 text-red-500",
      read: "bg-yellow-100 text-yellow-600"
    };
  
    const icons = {
      allow: <Check className="w-3.5 h-3.5" strokeWidth={3} />,
      deny: <X className="w-3.5 h-3.5" strokeWidth={3} />,
      read: <Minus className="w-3.5 h-3.5" strokeWidth={3} />
    };
  
    return (
      <div className={`w-6 h-6 rounded flex items-center justify-center ${styles[status] || styles.deny} shadow-sm border border-transparent hover:border-gray-200`}>
        {icons[status] || icons.deny}
      </div>
    );
}