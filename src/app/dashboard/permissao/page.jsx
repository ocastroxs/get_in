'use client';

import { useState } from 'react';
import { 
  Shield, 
  Eye, 
  ShieldAlert, 
  Check, 
  Minus, 
  X, 
  RotateCcw, 
  Save,
  Search,
  Filter,
  Info,
  ChevronRight
} from 'lucide-react';

export default function PermissoesPage() {
  const [abaAtiva, setAbaAtiva] = useState('funcionarios');
  const [loading, setLoading] = useState(false);

  const handleSalvar = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Configurações de permissão salvas com sucesso!");
    }, 1000);
  };

  return (
    <div className="flex min-h-screen relative overflow-hidden">


      <main className="flex-1 p-10 relative z-10 overflow-y-auto max-h-screen custom-scrollbar">
        <div className="max-w-6xl mx-auto space-y-2">
          
          {/* Cabeçalho de Vidro */}
          <header className="bg-white/70 backdrop-blur-xl p-5 rounded-sm shadow-xl shadow-blue-950/5 border border-white/20 flex flex-col md:flex-row justify-between items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-[#0A2540] rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-[#0A2540] tracking-tight">
                  Controle de Permissões
                </h1>
                <p className="text-sm text-gray-500 font-medium flex items-center mt-1">
                  <Info className="w-3.5 h-3.5 mr-1.5 text-[#4DA8EA]" />
                  Defina os níveis de acesso para cada perfil do sistema.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-5 py-3 text-xs font-bold text-gray-600 bg-white/50 border border-gray-200 rounded-2xl hover:bg-white hover:shadow-md transition-all active:scale-95 group">
                <RotateCcw className="w-4 h-4 group-hover:-rotate-180 transition-transform duration-500" />
                Descartar
              </button>
              <button 
                onClick={handleSalvar}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 text-xs font-bold text-white bg-[#0A2540] rounded-2xl hover:bg-[#133c66] shadow-lg shadow-blue-950/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </header>

          {/* Área Principal de Vidro */}
          <div className="bg-white/60 backdrop-blur-lg rounded-sm shadow-2xl shadow-blue-950/5 border border-white/30 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            
            {/* Toolbar e Abas */}
            <div className="p-3 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex p-1.5 bg-gray-100/50 rounded-2xl w-full md:w-auto">
                <TabButton 
                  active={abaAtiva === 'funcionarios'} 
                  onClick={() => setAbaAtiva('funcionarios')}
                  label="Perfis Internos"
                />
                <TabButton 
                  active={abaAtiva === 'visitantes'} 
                  onClick={() => setAbaAtiva('visitantes')}
                  label="Acesso de Visitantes"
                />
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Buscar funcionalidade..." 
                    className="w-full pl-11 pr-4 py-3 bg-white/50 border border-gray-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#4DA8EA] transition-all"
                  />
                </div>
                <button className="p-3 bg-white/50 border border-gray-200 rounded-2xl hover:bg-white transition-all">
                  <Filter className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Legenda Estilizada */}
            <div className="px-8 py-4 bg-white/20 border-b border-gray-100 flex flex-wrap items-center gap-8 text-[10px] font-bold uppercase tracking-widest text-gray-500">
              <div className="flex items-center gap-2"><Badge status="allow" /> <span className="text-green-600">Permitida</span></div>
              <div className="flex items-center gap-2"><Badge status="deny" /> <span className="text-red-500">Bloqueada</span></div>
              <div className="flex items-center gap-2"><Badge status="read" /> <span className="text-yellow-600">Somente Leitura</span></div>
              <div className="ml-auto flex items-center text-gray-400 normal-case italic font-medium tracking-normal">
                Clique nos ícones para alternar as permissões
              </div>
            </div>

            {/* Tabela */}
            <div className="overflow-x-auto custom-scrollbar">
              {abaAtiva === 'funcionarios' ? <TabelaFuncionarios /> : <TabelaVisitantes />}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

// Componentes Auxiliares

function TabButton({ active, onClick, label }) {
  return (
    <button 
      onClick={onClick}
      className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
        active 
          ? 'bg-white text-[#0A2540] shadow-sm' 
          : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {label}
    </button>
  );
}

function TabelaFuncionarios() {
  return (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="bg-[#0A2540]/5">
          <th className="py-4 px-6 text-[10px] font-black text-[#0A2540] uppercase tracking-[0.2em] w-1/2">Funcionalidade</th>
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
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="bg-[#0A2540]/5">
          <th className="py-4 px-6 text-[10px] font-black text-[#0A2540] uppercase tracking-[0.2em] w-1/2">Funcionalidade (App)</th>
          <th className="py-4 px-6 text-center"><HeaderIcon icon={Eye} label="Comum" /></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        <SectionRow title="Acesso pelo Aplicativo" />
        <PermissionRow title="Visualizar mapa do prédio" desc="Ver mapa de rotas liberadas" p="allow" s="allow" a="allow" />
        <PermissionRow title="Acesso ao refeitório" desc="Permissão para entrar na área de alimentação" p="deny" s="allow" a="allow" />
        <PermissionRow title="Gerar QR Code de entrada" desc="Criar passe temporário na catraca" p="read" s="allow" a="allow" />
      </tbody>
    </table>
  );
}

function HeaderIcon({ icon: Icon, label }) {
  return (
    <div className="flex flex-col items-center gap-2 group cursor-default">
      <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#4DA8EA] shadow-sm group-hover:scale-110 transition-transform">
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
    </div>
  );
}

function SectionRow({ title }) {
  return (
    <tr className="bg-gray-50/30">
      <td colSpan="4" className="py-2 px-5">
        <div className="flex items-center space-x-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#4DA8EA]"></div>
          <span className="text-[10px] font-black text-[#0A2540] uppercase tracking-[0.2em] opacity-60">
            {title}
          </span>
        </div>
      </td>
    </tr>
  );
}

function PermissionRow({ title, desc, p: initialP, s: initialS, a: initialA }) {
  const [p, setP] = useState(initialP);
  const [s, setS] = useState(initialS);
  const [a, setA] = useState(initialA);

  const alternarStatus = (statusAtual) => {
    if (statusAtual === 'allow') return 'deny';
    if (statusAtual === 'deny') return 'read';
    return 'allow';
  };

  return (
    <tr className="hover:bg-white/40 transition-all group">
      <td className="py-3 px-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-[#0A2540] group-hover:text-[#4DA8EA] transition-colors">{title}</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">{desc}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
        </div>
      </td>
      
      <td className="py-5 px-8 text-center">
        <button onClick={() => setP(alternarStatus(p))} className="hover:scale-125 active:scale-90 transition-all"><Badge status={p} /></button>
      </td>

      <td className="py-5 px-8 text-center">
        <button onClick={() => setS(alternarStatus(s))} className="hover:scale-125 active:scale-90 transition-all"><Badge status={s} /></button>
      </td>

      {initialA !== undefined && (
        <td className="py-5 px-8 text-center">
          <button onClick={() => setA(alternarStatus(a))} className="hover:scale-125 active:scale-90 transition-all"><Badge status={a} /></button>
        </td>
      )}
    </tr>
  );
}

function Badge({ status }) {
  const styles = {
    allow: "bg-green-100 text-green-600 shadow-green-100/50",
    deny: "bg-red-100 text-red-500 shadow-red-100/50",
    read: "bg-yellow-100 text-yellow-600 shadow-yellow-100/50"
  };

  const icons = {
    allow: <Check className="w-3.5 h-3.5" strokeWidth={3} />,
    deny: <X className="w-3.5 h-3.5" strokeWidth={3} />,
    read: <Minus className="w-3.5 h-3.5" strokeWidth={3} />
  };

  return (
    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${styles[status] || styles.deny} shadow-lg border border-white transition-all`}>
      {icons[status] || icons.deny}
    </div>
  );
}
