'use client';

import { useState, useMemo } from 'react';
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
  ChevronRight,
  Lock,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ─── Dados de Permissões ─────────────────────────────────────────────────────

const PERMISSOES_FUNCIONARIOS = [
  {
    categoria: 'Visitantes',
    icon: Eye,
    cor: 'text-blue-600',
    funcionalidades: [
      { titulo: 'Cadastrar visitante', desc: 'Registrar novo visitante no sistema', portaria: 'allow', supervisor: 'read', admin: 'allow' },
      { titulo: 'Editar dados de visitante', desc: 'Alterar informações durante a visita', portaria: 'read', supervisor: 'allow', admin: 'allow' },
      { titulo: 'Check-out / encerrar visita', desc: 'Finalizar visita e devolver crachá', portaria: 'allow', supervisor: 'allow', admin: 'allow' },
      { titulo: 'Excluir visitante', desc: 'Remover registro permanentemente', portaria: 'deny', supervisor: 'deny', admin: 'allow' },
    ]
  },
  {
    categoria: 'Aprovações de Acesso',
    icon: Lock,
    cor: 'text-orange-600',
    funcionalidades: [
      { titulo: 'Solicitar aprovação', desc: 'Enviar pedido de entrada ao supervisor', portaria: 'allow', supervisor: 'deny', admin: 'allow' },
      { titulo: 'Aprovar / negar acesso', desc: 'Decisão de entrada em setor restrito', portaria: 'deny', supervisor: 'allow', admin: 'allow' },
    ]
  },
  {
    categoria: 'Relatórios e Análises',
    icon: AlertCircle,
    cor: 'text-green-600',
    funcionalidades: [
      { titulo: 'Visualizar relatórios', desc: 'Acessar dados de circulação e movimentação', portaria: 'deny', supervisor: 'allow', admin: 'allow' },
      { titulo: 'Exportar dados', desc: 'Baixar relatórios em CSV ou PDF', portaria: 'deny', supervisor: 'read', admin: 'allow' },
    ]
  }
];

const PERMISSOES_VISITANTES = [
  { titulo: 'Visualizar mapa do prédio', desc: 'Ver mapa de rotas liberadas', visitante: 'allow' },
  { titulo: 'Acesso ao refeitório', desc: 'Permissão para entrar na área de alimentação', visitante: 'deny' },
  { titulo: 'Gerar QR Code de entrada', desc: 'Criar passe temporário na catraca', visitante: 'read' },
];

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

  const handleDescartar = () => {
    setBusca('');
    setAbaAtiva('funcionarios');
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      
      {/* Cabeçalho */}
      <header className="flex items-center justify-between">
        <div className="animate-in fade-in slide-in-from-left-4 duration-700 delay-100">
          <h1 className="text-2xl font-bold text-foreground">Controle de Permissões</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie os níveis de acesso para cada perfil do sistema</p>
        </div>

        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-700 delay-200">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1.5"
            onClick={handleDescartar}
          >
            <RotateCcw size={14} />
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
                <RotateCcw size={14} className="animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save size={14} />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Abas e Filtros */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex gap-2">
          <TabButton 
            active={abaAtiva === 'funcionarios'} 
            onClick={() => { setAbaAtiva('funcionarios'); setBusca(''); }}
            label="Perfis Internos"
            icon={Shield}
          />
          <TabButton 
            active={abaAtiva === 'visitantes'} 
            onClick={() => { setAbaAtiva('visitantes'); setBusca(''); }}
            label="Acesso de Visitantes"
            icon={Eye}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="Buscar funcionalidade..." 
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-10 w-10"
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Conteúdo Principal */}
      {abaAtiva === 'funcionarios' ? (
        <TabelaFuncionarios busca={busca} />
      ) : (
        <TabelaVisitantes busca={busca} />
      )}

    </div>
  );
}

// ─── Componentes Auxiliares ─────────────────────────────────────────────────

function TabButton({ active, onClick, label, icon: Icon }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
        active 
          ? 'bg-primary text-primary-foreground shadow-md' 
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

function TabelaFuncionarios({ busca }) {
  const categoriasFiltradas = useMemo(() => {
    return PERMISSOES_FUNCIONARIOS.map(cat => ({
      ...cat,
      funcionalidades: cat.funcionalidades.filter(item => 
        item.titulo.toLowerCase().includes(busca.toLowerCase()) ||
        item.desc.toLowerCase().includes(busca.toLowerCase())
      )
    })).filter(cat => cat.funcionalidades.length > 0);
  }, [busca]);

  return (
    <div className="space-y-4">
      {categoriasFiltradas.map((categoria, catIdx) => (
        <div key={catIdx} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${catIdx * 100}ms` }}>
          {/* Header da Categoria */}
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className={`w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center ${categoria.cor}`}>
              <categoria.icon size={18} />
            </div>
            <div>
              <h3 className="font-bold text-foreground">{categoria.categoria}</h3>
              <p className="text-xs text-muted-foreground">{categoria.funcionalidades.length} funcionalidade(s)</p>
            </div>
          </div>

          {/* Card da Categoria */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="divide-y divide-border">
              {categoria.funcionalidades.map((func, idx) => (
                <PermissionRowFuncionario 
                  key={idx}
                  {...func}
                  index={idx}
                />
              ))}
            </div>
          </div>
        </div>
      ))}

      {categoriasFiltradas.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhuma funcionalidade encontrada</p>
        </div>
      )}
    </div>
  );
}

function TabelaVisitantes({ busca }) {
  const funcionalidadesFiltradas = useMemo(() => {
    return PERMISSOES_VISITANTES.filter(item => 
      item.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      item.desc.toLowerCase().includes(busca.toLowerCase())
    );
  }, [busca]);

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="divide-y divide-border">
        {/* Header */}
        <div className="px-6 py-4 bg-muted/30 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Eye size={18} />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Acesso pelo Aplicativo</h3>
              <p className="text-xs text-muted-foreground">{funcionalidadesFiltradas.length} permissão(ões)</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Visitante</span>
          </div>
        </div>

        {/* Linhas */}
        {funcionalidadesFiltradas.map((func, idx) => (
          <PermissionRowVisitante 
            key={idx}
            {...func}
            index={idx}
          />
        ))}
      </div>

      {funcionalidadesFiltradas.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhuma funcionalidade encontrada</p>
        </div>
      )}
    </div>
  );
}

function PermissionRowFuncionario({ titulo, desc, portaria, supervisor, admin, index }) {
  const [p, setP] = useState(portaria);
  const [s, setS] = useState(supervisor);
  const [a, setA] = useState(admin);

  const alternarStatus = (statusAtual) => {
    if (statusAtual === 'allow') return 'deny';
    if (statusAtual === 'deny') return 'read';
    return 'allow';
  };

  return (
    <tr className="hover:bg-muted/20 transition-colors group animate-in fade-in slide-in-from-left-2 duration-500" style={{ animationDelay: `${index * 50}ms` }}>
      <td className="py-4 px-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{titulo}</p>
            <p className="text-xs text-muted-foreground font-normal mt-1">{desc}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 ml-4" />
        </div>
      </td>
      
      <td className="py-4 px-6 text-center">
        <button 
          onClick={() => setP(alternarStatus(p))} 
          className="hover:scale-110 active:scale-95 transition-transform inline-flex"
          title="Clique para alterar"
        >
          <Badge status={p} />
        </button>
      </td>

      <td className="py-4 px-6 text-center">
        <button 
          onClick={() => setS(alternarStatus(s))} 
          className="hover:scale-110 active:scale-95 transition-transform inline-flex"
          title="Clique para alterar"
        >
          <Badge status={s} />
        </button>
      </td>

      <td className="py-4 px-6 text-center">
        <button 
          onClick={() => setA(alternarStatus(a))} 
          className="hover:scale-110 active:scale-95 transition-transform inline-flex"
          title="Clique para alterar"
        >
          <Badge status={a} />
        </button>
      </td>
    </tr>
  );
}

function PermissionRowVisitante({ titulo, desc, visitante, index }) {
  const [status, setStatus] = useState(visitante);

  const alternarStatus = (statusAtual) => {
    if (statusAtual === 'allow') return 'deny';
    if (statusAtual === 'deny') return 'read';
    return 'allow';
  };

  return (
    <tr className="hover:bg-muted/20 transition-colors group animate-in fade-in slide-in-from-left-2 duration-500" style={{ animationDelay: `${index * 50}ms` }}>
      <td className="py-4 px-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{titulo}</p>
            <p className="text-xs text-muted-foreground font-normal mt-1">{desc}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 ml-4" />
        </div>
      </td>
      
      <td className="py-4 px-6 text-center">
        <button 
          onClick={() => setStatus(alternarStatus(status))} 
          className="hover:scale-110 active:scale-95 transition-transform inline-flex"
          title="Clique para alterar"
        >
          <Badge status={status} />
        </button>
      </td>
    </tr>
  );
}

function Badge({ status }) {
  const styles = {
    allow: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 border-green-200 dark:border-green-800",
    deny: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border-red-200 dark:border-red-800",
    read: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800"
  };

  const icons = {
    allow: <Check className="w-4 h-4" strokeWidth={3} />,
    deny: <X className="w-4 h-4" strokeWidth={3} />,
    read: <Minus className="w-4 h-4" strokeWidth={3} />
  };

  const labels = {
    allow: "Permitida",
    deny: "Bloqueada",
    read: "Leitura"
  };

  return (
    <div className={`inline-flex flex-col items-center gap-1 px-3 py-2 rounded-lg border font-semibold text-xs transition-all ${styles[status] || styles.deny}`}>
      {icons[status] || icons.deny}
      <span className="text-[10px] font-medium">{labels[status]}</span>
    </div>
  );
}
