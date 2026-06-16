"use client";

import { useMemo, useState } from "react";
import { Check, Eye, Filter, RotateCcw, Save, Search, X } from "lucide-react";
import Topbar from "@/components/Topbar";
import ModalFiltro from "@/components/ui/ModalFiltro";
import PaginationControls from "@/components/ui/PaginationControls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { usePagination } from "@/hooks/usePagination";
import { api } from "@/services/api";

const PERMISSOES_PADRAO = [
  {
    categoria: "VISITANTES",
    funcionalidades: [
      { titulo: "Cadastrar visitante", desc: "Registrar novo visitante no sistema", portaria: "allow", supervisor: "allow", admin: "allow" },
      { titulo: "Editar dados de visitante", desc: "Alterar informações durante a visita", portaria: "read", supervisor: "allow", admin: "allow" },
      { titulo: "Check-out / encerrar visita", desc: "Finalizar visita e devolver crachá", portaria: "allow", supervisor: "allow", admin: "allow" },
      { titulo: "Excluir visitante", desc: "Remover registro permanentemente", portaria: "deny", supervisor: "deny", admin: "allow" },
    ],
  },
  {
    categoria: "APROVAÇÕES DE ACESSO",
    funcionalidades: [
      { titulo: "Solicitar aprovação", desc: "Enviar pedido de entrada ao supervisor", portaria: "allow", supervisor: "deny", admin: "allow" },
      { titulo: "Aprovar / negar acesso", desc: "Decisão de entrada em setor restrito", portaria: "deny", supervisor: "allow", admin: "allow" },
      { titulo: "Verificar pendências", desc: "Visualizar solicitações aguardando aprovação", portaria: "read", supervisor: "allow", admin: "allow" },
    ],
  },
  {
    categoria: "CRACHAS E RFID",
    funcionalidades: [
      { titulo: "Vincular crachá a visitante", desc: "Associar tag RFID ao registro", portaria: "allow", supervisor: "deny", admin: "allow" },
      { titulo: "Bloquear / desativar tag", desc: "Revogar acesso de uma tag específica", portaria: "deny", supervisor: "allow", admin: "allow" },
      { titulo: "Gerenciar estoque de tags", desc: "Cadastrar e controlar tags disponíveis", portaria: "deny", supervisor: "deny", admin: "allow" },
    ],
  },
  {
    categoria: "RELATÓRIOS E AUDITORIA",
    funcionalidades: [
      { titulo: "Histórico de circulação", desc: "Trilha de movimentação por setor", portaria: "read", supervisor: "allow", admin: "allow" },
      { titulo: "Exportar relatório", desc: "Baixar dados em PDF ou CSV", portaria: "deny", supervisor: "read", admin: "allow" },
      { titulo: "Log de auditoria do sistema", desc: "Acessar registros de ações do sistema", portaria: "deny", supervisor: "deny", admin: "allow" },
    ],
  },
  {
    categoria: "CONFIGURAÇÕES",
    funcionalidades: [
      { titulo: "Gerenciar funcionários", desc: "Cadastrar, editar e remover usuários", portaria: "deny", supervisor: "deny", admin: "allow" },
      { titulo: "Gerenciar setores", desc: "Criar e editar setores da empresa", portaria: "deny", supervisor: "deny", admin: "allow" },
      { titulo: "Editar permissões", desc: "Alterar níveis de acesso de perfis", portaria: "deny", supervisor: "deny", admin: "allow" },
    ],
  },
];

const PERMISSOES_VISITANTES_PADRAO = [
  { titulo: "Visualizar mapa do prédio", desc: "Ver mapa de rotas liberadas", visitante: "allow" },
  { titulo: "Acesso ao refeitório", desc: "Permissão para entrar na área de alimentação", visitante: "deny" },
  { titulo: "Gerar QR Code de entrada", desc: "Criar passe temporário na catraca", visitante: "read" },
];

const CATEGORY_LABELS = {
  VISITANTES: "Visitantes",
  "APROVACOES DE ACESSO": "Aprovações de acesso",
  "CRACHAS E RFID": "Crachás e RFID",
  "RELATÓRIOS E AUDITORIA": "Relatórios e auditoria",
  CONFIGURACOES: "Configurações",
};

function normalizeKey(value) {
  const text = String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();

  if (text.includes("APROVA")) return "APROVAÇÕES DE ACESSO";
  if (text.includes("CRACH")) return "CRACHAS E RFID";
  if (text.includes("RELAT")) return "RELATÓRIOS E AUDITORIA";
  if (text.includes("CONFIG")) return "CONFIGURAÇÕES";
  if (text.includes("VISIT")) return "VISITANTES";

  return text;
}

function getCategoryLabel(category) {
  return CATEGORY_LABELS[normalizeKey(category)] || String(category || "Categoria");
}

export default function PermissoesPage() {
  const [abaAtiva, setAbaAtiva] = useState("funcionarios");
  const [loading, setLoading] = useState(false);
  const [busca, setBusca] = useState("");
  const [permissoesFuncionarios, setPermissoesFuncionarios] = useState(PERMISSOES_PADRAO);
  const [permissoesVisitantes, setPermissoesVisitantes] = useState(PERMISSOES_VISITANTES_PADRAO);
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");
  const [tempFiltroCategoria, setTempFiltroCategoria] = useState("Todas");

  const carregarPermissoes = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);

    try {
      const response = await api.get("/permissoes");
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

  useAutoRefresh(carregarPermissoes);

  const categoriasUnicas = useMemo(() => {
    const categorias = permissoesFuncionarios.map((categoria) => getCategoryLabel(categoria.categoria));
    return ["Todas", ...new Set(categorias)];
  }, [permissoesFuncionarios]);

  const handleSalvar = async () => {
    setLoading(true);

    try {
      const response = await api.post("/permissoes", {
        funcionarios: permissoesFuncionarios,
        visitantes: permissoesVisitantes,
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
    setBusca("");
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

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      <div className="flex flex-col gap-4">
        <Topbar
          title="Permissões"
          subtitle="Determine com mais clareza o que cada perfil e visitante pode acessar no sistema."
        />

        <div className="flex gap-6 overflow-x-auto border-b border-border">
          <TabButton
            active={abaAtiva === "funcionarios"}
            onClick={() => {
              setAbaAtiva("funcionarios");
              setBusca("");
            }}
            label="Funcionários"
          />
          <TabButton
            active={abaAtiva === "visitantes"}
            onClick={() => {
              setAbaAtiva("visitantes");
              setBusca("");
            }}
            label="Visitantes"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex w-full flex-1 items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Buscar funcionalidade ou descrição..."
                className="h-11 rounded-xl border-border/60 bg-background/80 pl-10 text-[15px] transition-all duration-300 focus-visible:border-primary/40 focus-visible:ring-primary/20"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
              />
              {busca && (
                <button
                  type="button"
                  onClick={() => setBusca("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Limpar busca"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {abaAtiva === "funcionarios" && (
              <Button
                type="button"
                onClick={() => setModalFiltroAberto(true)}
                variant="outline"
                className="h-11 gap-2 rounded-xl border-border/60 bg-background/80 px-4"
              >
                <Filter size={16} />
                <span className="hidden text-sm sm:inline">Filtrar Categorias</span>
                {filtroCategoria !== "Todas" && (
                  <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                    1
                  </span>
                )}
              </Button>
            )}
          </div>

          <div className="hidden flex-wrap items-center gap-4 text-[11px] font-bold uppercase text-muted-foreground lg:flex">
            <Legenda color="bg-green-100 border-green-300" label="Permitida" />
            <Legenda color="bg-red-100 border-red-300" label="Bloqueado" />
            <Legenda color="bg-yellow-100 border-yellow-300" label="Leitura" />
          </div>
        </div>

        {(filtroCategoria !== "Todas" || busca) && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/40 pt-4">
            <span className="mr-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Filtros ativos:</span>
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

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {abaAtiva === "funcionarios" ? (
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

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={handleDescartar}
          disabled={loading}
          className="h-10 gap-2 rounded-xl border-border/60 bg-background/80"
        >
          <RotateCcw size={15} />
          Descartar
        </Button>
        <Button type="button" onClick={handleSalvar} disabled={loading} className="h-10 gap-2 rounded-xl">
          <Save size={15} />
          {loading ? "Salvando..." : "Aplicar alterações"}
        </Button>
      </div>

      <ModalFiltro
        isOpen={modalFiltroAberto}
        onClose={() => setModalFiltroAberto(false)}
        onApply={aplicarFiltros}
        onClear={limparFiltros}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="ml-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Categoria de Funcionalidade
            </label>
            <div className="grid grid-cols-1 gap-2">
              {categoriasUnicas.map((categoria) => (
                <button
                  key={categoria}
                  type="button"
                  onClick={() => setTempFiltroCategoria(categoria)}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-xs font-semibold transition-all ${
                    tempFiltroCategoria === categoria
                      ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "border-border/60 bg-background text-muted-foreground hover:border-primary/30 hover:bg-muted/40"
                  }`}
                >
                  <span>{categoria === "Todas" ? "Todas as Categorias" : categoria}</span>
                  {tempFiltroCategoria === categoria && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </ModalFiltro>
    </div>
  );
}

function TabButton({ active, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap border-b-2 px-1 pb-3 text-[15px] font-semibold transition-all duration-200 ${
        active
          ? "border-primary text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function Legenda({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`h-2.5 w-2.5 rounded-full border ${color}`} />
      <span>{label}</span>
    </div>
  );
}

function TabelaFuncionarios({ permissoes, setPermissoes, busca, filtroCategoria }) {
  const linhasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return permissoes.flatMap((categoria, categoriaIndex) => {
      const categoriaLabel = getCategoryLabel(categoria.categoria);
      if (filtroCategoria !== "Todas" && categoriaLabel !== filtroCategoria) return [];

      return (categoria.funcionalidades || [])
        .map((item, itemIndex) => ({ ...item, categoriaLabel, categoriaIndex, itemIndex }))
        .filter((item) => {
          if (!termo) return true;
          return item.titulo.toLowerCase().includes(termo) || item.desc.toLowerCase().includes(termo);
        });
    });
  }, [permissoes, busca, filtroCategoria]);

  const {
    page,
    setPage,
    pageSize,
    totalItems,
    totalPages,
    paginatedItems,
  } = usePagination(linhasFiltradas);

  const togglePermissao = (categoriaIndex, itemIndex, perfil) => {
    setPermissoes((current) =>
      current.map((categoria, currentCategoriaIndex) => {
        if (currentCategoriaIndex !== categoriaIndex) return categoria;

        return {
          ...categoria,
          funcionalidades: categoria.funcionalidades.map((item, currentItemIndex) => {
            if (currentItemIndex !== itemIndex) return item;
            const ciclos = { allow: "read", read: "deny", deny: "allow" };
            return { ...item, [perfil]: ciclos[item[perfil]] || "allow" };
          }),
        };
      })
    );
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <th className="min-w-[320px] px-4 py-3">Funcionalidade</th>
              <th className="w-24 px-4 py-3 text-center">Portaria</th>
              <th className="w-24 px-4 py-3 text-center">Supervisor</th>
              <th className="w-24 px-4 py-3 text-center">Admin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  Nenhuma funcionalidade encontrada.
                </td>
              </tr>
            ) : (
              paginatedItems.map((item) => (
                <tr key={`${item.categoriaIndex}-${item.itemIndex}-${item.titulo}`} className="transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary">{item.categoriaLabel}</p>
                    <p className="text-sm font-bold text-foreground">{item.titulo}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <PermissaoBadge status={item.portaria} onClick={() => togglePermissao(item.categoriaIndex, item.itemIndex, "portaria")} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <PermissaoBadge status={item.supervisor} onClick={() => togglePermissao(item.categoriaIndex, item.itemIndex, "supervisor")} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <PermissaoBadge status={item.admin} onClick={() => togglePermissao(item.categoriaIndex, item.itemIndex, "admin")} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <PaginationControls
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        currentCount={paginatedItems.length}
        onPageChange={setPage}
        itemLabel="permissão(ões)"
      />
    </>
  );
}

function TabelaVisitantes({ permissoes, setPermissoes, busca }) {
  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return permissoes
      .map((item, index) => ({ ...item, index }))
      .filter((item) => !termo || item.titulo.toLowerCase().includes(termo) || item.desc.toLowerCase().includes(termo));
  }, [permissoes, busca]);

  const {
    page,
    setPage,
    pageSize,
    totalItems,
    totalPages,
    paginatedItems,
  } = usePagination(filtradas);

  const togglePermissao = (index) => {
    setPermissoes((current) =>
      current.map((item, currentIndex) => {
        if (currentIndex !== index) return item;
        const ciclos = { allow: "read", read: "deny", deny: "allow" };
        return { ...item, visitante: ciclos[item.visitante] || "allow" };
      })
    );
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Acesso do Visitante</th>
              <th className="w-32 px-4 py-3 text-center">Permissão</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  Nenhuma permissão encontrada.
                </td>
              </tr>
            ) : (
              paginatedItems.map((item) => (
                <tr key={item.titulo} className="transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="text-sm font-bold text-foreground">{item.titulo}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <PermissaoBadge status={item.visitante} onClick={() => togglePermissao(item.index)} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <PaginationControls
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        currentCount={paginatedItems.length}
        onPageChange={setPage}
        itemLabel="permissão(ões)"
      />
    </>
  );
}

function PermissaoBadge({ status, onClick }) {
  const styles = {
    allow: "bg-green-100 text-green-700 border-green-200 hover:bg-green-200",
    read: "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200",
    deny: "bg-red-100 text-red-700 border-red-200 hover:bg-red-200",
  };

  const icons = {
    allow: <Check size={12} />,
    read: <Eye size={12} />,
    deny: <X size={12} />,
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-all ${styles[status] || styles.deny}`}
      aria-label="Alterar permissão"
    >
      {icons[status] || icons.deny}
    </button>
  );
}
