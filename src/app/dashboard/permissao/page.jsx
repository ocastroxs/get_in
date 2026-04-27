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
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ─── Dados de Permissões ─────────────────────────────────────────────────────

const PERMISSOES_FUNCIONARIOS = [
  {
    categoria: 'VISITANTES',
    funcionalidades: [
      { titulo: 'Cadastrar visitante', desc: 'Registrar novo visitante no sistema', portaria: 'allow', supervisor: 'allow', admin: 'allow' },
      { titulo: 'Editar dados de visitante', desc: 'Alterar informações durante a visita', portaria: 'read', supervisor: 'allow', admin: 'allow' },
      { titulo: 'Check-out / encerrar visita', desc: 'Finalizar visita e devolver crachá', portaria: 'allow', supervisor: 'allow', admin: 'allow' },
      { titulo: 'Excluir visitante', desc: 'Remover registro permanentemente', portaria: 'deny', supervisor: 'deny', admin: 'allow' },
    ]
  },
  {
    categoria: 'APROVAÇÕES DE ACESSO',
    funcionalidades: [
      { titulo: 'Solicitar aprovação', desc: 'Enviar pedido de entrada ao supervisor', portaria: 'allow', supervisor: 'deny', admin: 'allow' },
      { titulo: 'Aprovar / negar acesso', desc: 'Decisão de entrada em setor restrito', portaria: 'deny', supervisor: 'allow', admin: 'allow' },
      { titulo: 'Verificar pendências', desc: 'Visualizar solicitações aguardando aprovação', portaria: 'read', supervisor: 'allow', admin: 'allow' },
    ]
  },
  {
    categoria: 'CRACHÁS E RFID',
    funcionalidades: [
      { titulo: 'Vincular crachá a visitante', desc: 'Associar tag RFID ao registro', portaria: 'allow', supervisor: 'deny', admin: 'allow' },
      { titulo: 'Bloquear / desativar tag', desc: 'Revogar acesso de uma tag específica', portaria: 'deny', supervisor: 'allow', admin: 'allow' },
      { titulo: 'Gerenciar estoque de tags', desc: 'Cadastrar e controlar tags disponíveis', portaria: 'deny', supervisor: 'deny', admin: 'allow' },
    ]
  },
  {
    categoria: 'RELATÓRIOS E AUDITORIA',
    funcionalidades: [
      { titulo: 'Histórico de circulação', desc: 'Trilha de movimentação por setor', portaria: 'read', supervisor: 'allow', admin: 'allow' },
      { titulo: 'Exportar relatório', desc: 'Baixar dados em PDF ou CSV', portaria: 'deny', supervisor: 'read', admin: 'allow' },
      { titulo: 'Log de auditoria do sistema', desc: 'Acessar registros de ações do sistema', portaria: 'deny', supervisor: 'deny', admin: 'allow' },
    ]
  },
  {
    categoria: 'CONFIGURAÇÕES',
    funcionalidades: [
      { titulo: 'Gerenciar funcionários', desc: 'Cadastrar, editar e remover usuários', portaria: 'deny', supervisor: 'deny', admin: 'allow' },
      { titulo: 'Gerenciar setores', desc: 'Criar e editar setores da empresa', portaria: 'deny', supervisor: 'deny', admin: 'allow' },
      { titulo: 'Editar permissões', desc: 'Alterar níveis de acesso de perfis', portaria: 'deny', supervisor: 'deny', admin: 'allow' },
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
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      
      {/* Cabeçalho */}
      <div className="flex flex-col gap-2 mb-2">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Permissões</h1>
            <p className="text-sm text-muted-foreground mt-1">Determine o que cada perfil e visitante pode acessar no sistema.</p>
          </div>
          <div className="flex items-center gap-2">
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
        </div>

        {/* Abas */}
        <div className="flex gap-6 border-b border-border mt-4">
          <TabButton 
            active={abaAtiva === 'funcionarios'} 
            onClick={() => { setAbaAtiva('funcionarios'); setBusca(''); }}
            label="Funcionários"
          />
          <TabButton 
            active={abaAtiva === 'visitantes'} 
            onClick={() => { setAbaAtiva('visitantes'); setBusca(''); }}
            label="Visitantes"
          />
        </div>
      </div>

      {/* Legenda e Busca */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-100 border border-green-300"></div>
            <span>Permitida</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-100 border border-red-300"></div>
            <span>Bloqueado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-100 border border-yellow-300"></div>
            <span>Somente leitura</span>
          </div>
          <span className="text-muted-foreground italic ml-auto">— Clique para alterar</span>
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

function TabButton({ active, onClick, label }) {
  return (
    <button 
      onClick={onClick}
      className={`pb-3 px-1 font-semibold text-sm transition-all duration-200 ${
        active 
          ? 'text-foreground border-b-2 border-primary' 
          : 'text-muted-foreground hover:text-foreground border-b-2 border-transparent'
      }`}
    >
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
    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
      {/* Cabeçalho da Tabela */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white px-6 py-4">
        <div className="grid grid-cols-4 gap-4 items-center">
          <div className="text-sm font-semibold">Funcionalidade</div>
          <div className="flex items-center justify-center gap-2">
            <Shield size={16} />
            <span className="text-xs font-semibold">Portaria</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Eye size={16} />
            <span className="text-xs font-semibold">Supervisor</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <ShieldAlert size={16} />
            <span className="text-xs font-semibold">Administrador</span>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="divide-y divide-border">
        {categoriasFiltradas.map((categoria, catIdx) => (
          <div key={catIdx}>
            {/* Seção */}
            <div className="bg-muted/40 px-6 py-2.5 border-b border-border">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">{categoria.categoria}</h3>
            </div>

            {/* Linhas */}
            {categoria.funcionalidades.map((func, idx) => (
              <PermissionRowFuncionario 
                key={idx}
                {...func}
              />
            ))}
          </div>
        ))}
      </div>

      {categoriasFiltradas.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
          <p>Nenhuma funcionalidade encontrada</p>
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
    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
      {/* Cabeçalho da Tabela */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white px-6 py-4">
        <div className="grid grid-cols-2 gap-4 items-center">
          <div className="text-sm font-semibold">Funcionalidade (App)</div>
          <div className="flex items-center justify-center gap-2">
            <Eye size={16} />
            <span className="text-xs font-semibold">Comum</span>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="divide-y divide-border">
        {/* Seção */}
        <div className="bg-muted/40 px-6 py-2.5 border-b border-border">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">ACESSO PELO APLICATIVO</h3>
        </div>

        {/* Linhas */}
        {funcionalidadesFiltradas.map((func, idx) => (
          <PermissionRowVisitante 
            key={idx}
            {...func}
          />
        ))}
      </div>

      {funcionalidadesFiltradas.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
          <p>Nenhuma funcionalidade encontrada</p>
        </div>
      )}
    </div>
  );
}

function PermissionRowFuncionario({ titulo, desc, portaria, supervisor, admin }) {
  const [p, setP] = useState(portaria);
  const [s, setS] = useState(supervisor);
  const [a, setA] = useState(admin);

  const alternarStatus = (statusAtual) => {
    if (statusAtual === 'allow') return 'deny';
    if (statusAtual === 'deny') return 'read';
    return 'allow';
  };

  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="py-4 px-6">
        <div>
          <p className="font-semibold text-sm text-foreground">{titulo}</p>
          <p className="text-xs text-muted-foreground font-normal mt-1">{desc}</p>
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

function PermissionRowVisitante({ titulo, desc, visitante }) {
  const [status, setStatus] = useState(visitante);

  const alternarStatus = (statusAtual) => {
    if (statusAtual === 'allow') return 'deny';
    if (statusAtual === 'deny') return 'read';
    return 'allow';
  };

  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="py-4 px-6">
        <div>
          <p className="font-semibold text-sm text-foreground">{titulo}</p>
          <p className="text-xs text-muted-foreground font-normal mt-1">{desc}</p>
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
    allow: "bg-green-100 border-green-200 text-green-700",
    deny: "bg-red-100 border-red-200 text-red-700",
    read: "bg-yellow-100 border-yellow-200 text-yellow-700"
  };

  const icons = {
    allow: <Check className="w-3.5 h-3.5" strokeWidth={3} />,
    deny: <X className="w-3.5 h-3.5" strokeWidth={3} />,
    read: <Minus className="w-3.5 h-3.5" strokeWidth={3} />
  };

  return (
    <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full border ${styles[status] || styles.deny}`}>
      {icons[status] || icons.deny}
    </div>
  );
}
