"use client";

import { useState, useEffect, useMemo, Fragment } from 'react';
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
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ModalFiltro from "@/components/ui/ModalFiltro";
import Topbar from "@/components/Topbar";
import { api } from '@/services/api';

// ─── Dados de Permissões (estrutura padrão) ──────────────────────────────────

const PERMISSOES_PADRAO = [
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

const PERMISSOES_VISITANTES_PADRAO = [
  { titulo: 'Visualizar mapa do prédio', desc: 'Ver mapa de rotas liberadas', visitante: 'allow' },
  { titulo: 'Acesso ao refeitório', desc: 'Permissão para entrar na área de alimentação', visitante: 'deny' },
  { titulo: 'Gerar QR Code de entrada', desc: 'Criar passe temporário na catraca', visitante: 'read' },
];

export default function PermissoesPage() {
  const [abaAtiva, setAbaAtiva] = useState('funcionarios');
  const [loading, setLoading] = useState(false);
  const [busca, setBusca] = useState('');
  const [permissoesFuncionarios, setPermissoesFuncionarios] = useState(PERMISSOES_PADRAO);
  const [permissoesVisitantes, setPermissoesVisitantes] = useState(PERMISSOES_VISITANTES_PADRAO);
  
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");
  const [tempFiltroCategoria, setTempFiltroCategoria] = useState("Todas");

  const carregarPermissoes = async () => {
    setLoading(true);
    try {
      const response = await api.get('/permissoes');
      if (response.sucesso && response.data) {
        setPermissoesFuncionarios(response.data.funcionarios || PERMISSOES_PADRAO);
        setPermissoesVisitantes(response.data.visitantes || PERMISSOES_VISITANTES_PADRAO);
      }
    } catch (error) {
      console.error("Erro ao carregar permissões:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPermissoes();
  }, []);

  const handleSalvar = async () => {
    setLoading(true);
    try {
      const response = await api.post('/permissoes', {
        funcionarios: permissoesFuncionarios,
        visitantes: permissoesVisitantes
      });
      
      if (response.sucesso) {
        alert("Configurações de permissão salvas com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao salvar permissões:", error);
      alert("Erro ao salvar permissões. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleDescartar = () => {
    setBusca('');
    setFiltroCategoria("Todas");
    setTempFiltroCategoria("Todas");
    carregarPermissoes();
  };

  const aplicarFiltros = () => {
    setFiltroCategoria(tempFiltroCategoria);
  };

  const limparFiltros = () => {
    setTempFiltroCategoria("Todas");
    setFiltroCategoria("Todas");
    setBusca("");
  };

  const categoriasUnicas = ["Todas", ...new Set(PERMISSOES_PADRAO.map(c => c.categoria))];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      
      <div className="flex flex-col gap-4">
        <Topbar
          title="Permissões"
          subtitle="Determine com mais clareza o que cada perfil e visitante pode acessar no sistema."
          secondaryButtonText="Descartar"
          onSecondaryButtonClick={handleDescartar}
          buttonText={loading ? "Salvando..." : "Salvar Alterações"}
          onButtonClick={handleSalvar}
          secondaryButtonDisabled={loading}
          buttonDisabled={loading}
        />

        {/* Abas */}
        <div className="flex gap-6 border-b border-border">
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

      {/* Barra de Filtros Padronizada */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 items-center gap-3 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Buscar funcionalidade ou descrição..."
                className="pl-10 h-11 rounded-xl border-border/60 bg-background/80 text-[15px] transition-all duration-300 focus-visible:border-primary/40 focus-visible:ring-primary/20"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
              {busca && (
                <button
                  type="button"
                  onClick={() => setBusca("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            
            <Button
              type="button"
              onClick={() => setModalFiltroAberto(true)}
              variant="outline"
              className="h-11 px-4 gap-2 rounded-xl border-border/60 bg-background/80"
            >
              <Filter size={16} />
              <span className="hidden text-sm sm:inline">Filtrar Categorias</span>
              {filtroCategoria !== "Todas" && (
                <span className="ml-1 w-5 h-5 rounded-full bg-primary text-[10px] flex items-center justify-center text-primary-foreground">
                  1
                </span>
              )}
            </Button>
          </div>

          <div className="hidden lg:flex flex-wrap items-center gap-4 text-[11px] font-bold uppercase text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-green-100 border border-green-300"></div>
              <span>Permitida</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-100 border border-red-300"></div>
              <span>Bloqueado</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-100 border border-yellow-300"></div>
              <span>Leitura</span>
            </div>
          </div>
        </div>

        {(filtroCategoria !== "Todas" || busca) && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border/40">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">Filtros ativos:</span>
            {busca && (
              <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
                Busca: {busca}
              </span>
            )}
            {filtroCategoria !== "Todas" && (
              <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
                Categoria: {filtroCategoria}
              </span>
            )}
            <Button
              variant="ghost"
              onClick={limparFiltros}
              className="h-7 px-2 text-[10px] text-muted-foreground hover:text-foreground"
            >
              Limpar tudo
            </Button>
          </div>
        )}
      </div>

      {/* Conteúdo Principal */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {abaAtiva === 'funcionarios' ? (
            <TabelaFuncionarios 
              permissoes={permissoesFuncionarios}
              setPermissoes={setPermissoesFuncionarios}
              busca={busca} 
              filtroCategoria={filtroCategoria}
            />
          ) : (
            <TabelaVisitantes 
              permissoes={permissoesVisitantes}
              setPermissoes={setPermissoesVisitantes}
              busca={busca} 
            />
          )}
        </div>
      </div>

      {/* Modal de Filtro Padronizado */}
      <ModalFiltro
        isOpen={modalFiltroAberto}
        onClose={() => setModalFiltroAberto(false)}
        onApply={aplicarFiltros}
        onClear={limparFiltros}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
              Categoria de Funcionalidade
            </label>
            <div className="grid grid-cols-1 gap-2">
              {categoriasUnicas.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setTempFiltroCategoria(cat)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all border ${
                    tempFiltroCategoria === cat
                      ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                      : "bg-background text-muted-foreground border-border/60 hover:border-primary/30 hover:bg-muted/40"
                  }`}
                >
                  <span>{cat === "Todas" ? "Todas as Categorias" : cat}</span>
                  {tempFiltroCategoria === cat && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </ModalFiltro>
    </div>
  );
}

// ─── Componentes Auxiliares ─────────────────────────────────────────────────

function TabButton({ active, onClick, label }) {
  return (
    <button 
      onClick={onClick}
      className={`pb-3 px-1 font-semibold text-[15px] transition-all duration-200 ${
        active 
          ? 'text-foreground border-b-2 border-primary' 
          : 'text-muted-foreground hover:text-foreground border-b-2 border-transparent'
      }`}
    >
      {label}
    </button>
  );
}

function TabelaFuncionarios({ permissoes, setPermissoes, busca, filtroCategoria }) {
  const categoriasFiltradas = useMemo(() => {
    return permissoes.map(cat => ({
      ...cat,
      funcionalidades: cat.funcionalidades.filter(item => 
        (filtroCategoria === "Todas" || cat.categoria === filtroCategoria) &&
        (item.titulo.toLowerCase().includes(busca.toLowerCase()) ||
        item.desc.toLowerCase().includes(busca.toLowerCase()))
      )
    })).filter(cat => cat.funcionalidades.length > 0);
  }, [permissoes, busca, filtroCategoria]);

  if (categoriasFiltradas.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Search className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
        <p className="text-[15px]">Nenhuma funcionalidade encontrada.</p>
      </div>
    );
  }

  const togglePermissao = (catIndex, funcIndex, perfil) => {
    const novas = [...permissoes];
    const cat = novas[catIndex];
    const func = cat.funcionalidades[funcIndex];
    
    const ciclos = {
      'allow': 'read',
      'read': 'deny',
      'deny': 'allow'
    };
    
    func[perfil] = ciclos[func[perfil]];
    setPermissoes(novas);
  };

  return (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="bg-muted/40 border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          <th className="px-4 py-3 min-w-[300px]">Funcionalidade</th>
          <th className="px-4 py-3 text-center w-24">Portaria</th>
          <th className="px-4 py-3 text-center w-24">Supervisor</th>
          <th className="px-4 py-3 text-center w-24">Admin</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {categoriasFiltradas.map((cat, catIdx) => (
          <Fragment key={cat.categoria}>
            <tr className="bg-muted/20">
              <td colSpan="4" className="px-4 py-2 text-[11px] font-bold text-primary uppercase tracking-widest bg-primary/5">
                {cat.categoria}
              </td>
            </tr>
            {cat.funcionalidades.map((item, itemIdx) => (
              <tr key={item.titulo} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <p className="text-sm font-bold text-foreground">{item.titulo}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </td>
                <td className="px-4 py-3 text-center">
                  <PermissaoBadge status={item.portaria} onClick={() => togglePermissao(catIdx, itemIdx, 'portaria')} />
                </td>
                <td className="px-4 py-3 text-center">
                  <PermissaoBadge status={item.supervisor} onClick={() => togglePermissao(catIdx, itemIdx, 'supervisor')} />
                </td>
                <td className="px-4 py-3 text-center">
                  <PermissaoBadge status={item.admin} onClick={() => togglePermissao(catIdx, itemIdx, 'admin')} />
                </td>
              </tr>
            ))}
          </Fragment>
        ))}
      </tbody>
    </table>
  );
}

function TabelaVisitantes({ permissoes, setPermissoes, busca }) {
  const filtradas = useMemo(() => {
    return permissoes.filter(item => 
      item.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      item.desc.toLowerCase().includes(busca.toLowerCase())
    );
  }, [permissoes, busca]);

  const togglePermissao = (index) => {
    const novas = [...permissoes];
    const ciclos = { 'allow': 'read', 'read': 'deny', 'deny': 'allow' };
    novas[index].visitante = ciclos[novas[index].visitante];
    setPermissoes(novas);
  };

  return (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="bg-muted/40 border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          <th className="px-4 py-3">Acesso do Visitante</th>
          <th className="px-4 py-3 text-center w-32">Permissão</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {filtradas.map((item, idx) => (
          <tr key={item.titulo} className="hover:bg-muted/30 transition-colors">
            <td className="px-4 py-3">
              <p className="text-sm font-bold text-foreground">{item.titulo}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </td>
            <td className="px-4 py-3 text-center">
              <PermissaoBadge status={item.visitante} onClick={() => togglePermissao(idx)} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PermissaoBadge({ status, onClick }) {
  const styles = {
    allow: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200',
    read: 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200',
    deny: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200'
  };

  const icons = {
    allow: <Check size={12} />,
    read: <Eye size={12} />,
    deny: <X size={12} />
  };

  return (
    <button 
      onClick={onClick}
      className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-all ${styles[status]}`}
    >
      {icons[status]}
    </button>
  );
}
