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
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function PermissoesPage() {
  const [abaAtiva, setAbaAtiva] = useState('funcionarios');
  const [loading, setLoading] = useState(false);
  const [busca, setBusca] = useState('');

  const handleSalvar = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Configurações de permissão salvas com sucesso!");
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      
      {/* Cabeçalho */}
      <header className="flex items-center justify-between">
        <div className="animate-in fade-in slide-in-from-left-4 duration-700 delay-100">
          <h1 className="text-xl font-semibold text-foreground">Controle de Permissões</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Defina os níveis de acesso para cada perfil do sistema</p>
        </div>

        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-700 delay-200">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1.5"
            onClick={() => {
              setBusca('');
              setAbaAtiva('funcionarios');
            }}
          >
            <RotateCcw size={13} />
            Descartar
          </Button>
          <Button 
            size="sm" 
            className="gap-1.5"
            onClick={handleSalvar}
            disabled={loading}
          >
            {loading ? (
              <>
                <RotateCcw size={13} className="animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save size={13} />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Card Principal */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
        
        {/* Toolbar e Abas */}
        <div className="p-4 border-b border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-2">
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

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                type="text" 
                placeholder="Buscar funcionalidade..." 
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-9 w-9"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Legenda */}
        <div className="px-6 py-3 bg-muted/30 border-b border-border flex flex-wrap items-center gap-6 text-xs font-medium text-muted-foreground">
          <div className="flex items-center gap-2">
            <Badge status="allow" /> 
            <span>Permitida</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge status="deny" /> 
            <span>Bloqueada</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge status="read" /> 
            <span>Somente Leitura</span>
          </div>
          <div className="ml-auto text-muted-foreground italic">
            Clique nos ícones para alternar as permissões
          </div>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          {abaAtiva === 'funcionarios' ? <TabelaFuncionarios busca={busca} /> : <TabelaVisitantes busca={busca} />}
        </div>
      </div>

    </div>
  );
}

// Componentes Auxiliares

function TabButton({ active, onClick, label }) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
        active 
          ? 'bg-primary text-primary-foreground' 
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
      }`}
    >
      {label}
    </button>
  );
}

function TabelaFuncionarios({ busca }) {
  const linhas = [
    { categoria: 'Visitantes', itens: [
      { titulo: 'Cadastrar visitante', desc: 'Registrar novo visitante no sistema', p: 'allow', s: 'read', a: 'allow' },
      { titulo: 'Editar dados de visitante', desc: 'Alterar informações durante a visita', p: 'read', s: 'allow', a: 'allow' },
      { titulo: 'Check-out / encerrar visita', desc: 'Finalizar visita e devolver crachá', p: 'allow', s: 'allow', a: 'allow' },
      { titulo: 'Excluir visitante', desc: 'Remover registro permanentemente', p: 'deny', s: 'deny', a: 'allow' },
    ]},
    { categoria: 'Aprovações de Acesso', itens: [
      { titulo: 'Solicitar aprovação', desc: 'Enviar pedido de entrada ao supervisor', p: 'allow', s: 'deny', a: 'allow' },
      { titulo: 'Aprovar / negar acesso', desc: 'Decisão de entrada em setor restrito', p: 'deny', s: 'allow', a: 'allow' },
    ]}
  ];

  const linhasFiltradas = linhas.map(cat => ({
    ...cat,
    itens: cat.itens.filter(item => 
      item.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      item.desc.toLowerCase().includes(busca.toLowerCase())
    )
  })).filter(cat => cat.itens.length > 0);

  return (
    <table className="w-full text-left">
      <thead>
        <tr className="bg-muted/40 border-b border-border">
          <th className="py-3 px-6 text-xs font-semibold text-foreground uppercase tracking-wider">Funcionalidade</th>
          <th className="py-3 px-6 text-center"><HeaderIcon icon={Shield} label="Portaria" /></th>
          <th className="py-3 px-6 text-center"><HeaderIcon icon={Eye} label="Supervisor" /></th>
          <th className="py-3 px-6 text-center"><HeaderIcon icon={ShieldAlert} label="Administrador" /></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {linhasFiltradas.map((categoria, catIdx) => (
          <tbody key={catIdx}>
            <SectionRow title={categoria.categoria} />
            {categoria.itens.map((item, idx) => (
              <PermissionRow 
                key={idx}
                title={item.titulo} 
                desc={item.desc} 
                p={item.p} 
                s={item.s} 
                a={item.a} 
              />
            ))}
          </tbody>
        ))}
      </tbody>
    </table>
  );
}

function TabelaVisitantes({ busca }) {
  const linhas = [
    { titulo: 'Visualizar mapa do prédio', desc: 'Ver mapa de rotas liberadas', p: 'allow', s: 'allow', a: 'allow' },
    { titulo: 'Acesso ao refeitório', desc: 'Permissão para entrar na área de alimentação', p: 'deny', s: 'allow', a: 'allow' },
    { titulo: 'Gerar QR Code de entrada', desc: 'Criar passe temporário na catraca', p: 'read', s: 'allow', a: 'allow' },
  ];

  const linhasFiltradas = linhas.filter(item => 
    item.titulo.toLowerCase().includes(busca.toLowerCase()) ||
    item.desc.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <table className="w-full text-left">
      <thead>
        <tr className="bg-muted/40 border-b border-border">
          <th className="py-3 px-6 text-xs font-semibold text-foreground uppercase tracking-wider">Funcionalidade (App)</th>
          <th className="py-3 px-6 text-center"><HeaderIcon icon={Eye} label="Comum" /></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        <SectionRow title="Acesso pelo Aplicativo" />
        {linhasFiltradas.map((item, idx) => (
          <PermissionRow 
            key={idx}
            title={item.titulo} 
            desc={item.desc} 
            p={item.p} 
            s={item.s} 
            a={item.a} 
            isVisitante={true}
          />
        ))}
      </tbody>
    </table>
  );
}

function HeaderIcon({ icon: Icon, label }) {
  return (
    <div className="flex flex-col items-center gap-1.5 group cursor-default">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
    </div>
  );
}

function SectionRow({ title }) {
  return (
    <tr className="bg-muted/20">
      <td colSpan="4" className="py-2.5 px-6">
        <div className="flex items-center space-x-2">
          <div className="w-1 h-1 rounded-full bg-primary/60"></div>
          <span className="text-xs font-semibold text-foreground uppercase tracking-wide opacity-70">
            {title}
          </span>
        </div>
      </td>
    </tr>
  );
}

function PermissionRow({ title, desc, p: initialP, s: initialS, a: initialA, isVisitante = false }) {
  const [p, setP] = useState(initialP);
  const [s, setS] = useState(initialS);
  const [a, setA] = useState(initialA);

  const alternarStatus = (statusAtual) => {
    if (statusAtual === 'allow') return 'deny';
    if (statusAtual === 'deny') return 'read';
    return 'allow';
  };

  return (
    <tr className="hover:bg-muted/20 transition-colors group">
      <td className="py-3 px-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{title}</p>
            <p className="text-xs text-muted-foreground font-normal mt-0.5">{desc}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
        </div>
      </td>
      
      <td className="py-3 px-6 text-center">
        <button 
          onClick={() => setP(alternarStatus(p))} 
          className="hover:scale-110 active:scale-95 transition-transform inline-flex"
          title="Clique para alterar"
        >
          <Badge status={p} />
        </button>
      </td>

      {!isVisitante && (
        <>
          <td className="py-3 px-6 text-center">
            <button 
              onClick={() => setS(alternarStatus(s))} 
              className="hover:scale-110 active:scale-95 transition-transform inline-flex"
              title="Clique para alterar"
            >
              <Badge status={s} />
            </button>
          </td>

          <td className="py-3 px-6 text-center">
            <button 
              onClick={() => setA(alternarStatus(a))} 
              className="hover:scale-110 active:scale-95 transition-transform inline-flex"
              title="Clique para alterar"
            >
              <Badge status={a} />
            </button>
          </td>
        </>
      )}
    </tr>
  );
}

function Badge({ status }) {
  const styles = {
    allow: "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400",
    deny: "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400",
    read: "bg-yellow-100 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400"
  };

  const icons = {
    allow: <Check className="w-3.5 h-3.5" strokeWidth={3} />,
    deny: <X className="w-3.5 h-3.5" strokeWidth={3} />,
    read: <Minus className="w-3.5 h-3.5" strokeWidth={3} />
  };

  return (
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border border-current/20 transition-all ${styles[status] || styles.deny}`}>
      {icons[status] || icons.deny}
    </div>
  );
}
