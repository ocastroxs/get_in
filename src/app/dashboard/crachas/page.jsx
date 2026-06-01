"use client";

import { getActiveLanguage } from "@/lib/i18n-core";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRightLeft,
  Check,
  CreditCard,
  Download,
  Filter,
  Loader2,
  Search,
  Trash2,
  Undo2,
  UserRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatCard from "@/components/StatCard";
import Topbar from "@/components/Topbar";
import ModalFiltro from "@/components/ui/ModalFiltro";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { api } from "@/services/api";
import { exportTableToPdf } from "@/lib/exportPdf";

const STATUS_LABEL = {
  disponivel: "Disponivel",
  emUso: "Em uso",
  perdido: "Perdido",
  alerta: "Alerta",
};

const STATUS_STYLE = {
  disponivel: "bg-gray-100 text-gray-700",
  emUso: "bg-green-100 text-green-700",
  perdido: "bg-red-100 text-red-600",
  alerta: "bg-red-100 text-red-600",
};

const STATUS_DOT = {
  disponivel: "bg-gray-500",
  emUso: "bg-green-500",
  perdido: "bg-red-500",
  alerta: "bg-red-500",
};

const STATUS_FILTER_OPTS = ["Todas", "disponivel", "emUso", "perdido", "alerta"];

function formatarData(value) {
  if (!value) return "-";

  const data = new Date(value);
  if (Number.isNaN(data.getTime())) return value;

  return data.toLocaleString(getActiveLanguage(), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTagVirtual(cracha) {
  return (cracha?.tags || []).find((tag) => !tag.fisica) || null;
}

function getCrachaNome(cracha) {
  return cracha?.id ? `TAG-${cracha.id}` : "-";
}

function getTipoUsuario(cracha) {
  const usuario = cracha?.usuario;

  if (!usuario) return null;
  if (usuario?.funcionarios?.length > 0) return "Funcionário";
  if (usuario?.requisicoesDeVisitas?.length > 0) return "Visitante";

  return "Usuario";
}

function getSetorResponsavelFromDescricao(descricao) {
  const match = String(descricao || "").match(/Setor respons[aá]vel:\s*([^|]+)/i);
  return match?.[1]?.trim() || null;
}

function getSetorReal(cracha) {
  const usuario = cracha?.usuario;
  const setorFuncionario = usuario?.funcionarios?.[0]?.setores_funcionarios_idSetorTosetores?.nome;
  const ultimaRequisicao = usuario?.requisicoesDeVisitas?.[0];
  const setorResponsavel = getSetorResponsavelFromDescricao(ultimaRequisicao?.descricao);
  const setorVisitante = ultimaRequisicao?.setores?.nome;

  return setorFuncionario || setorResponsavel || setorVisitante || null;
}

function normalizarCracha(cracha) {
  const tagVirtual = getTagVirtual(cracha);
  const statusOriginal = cracha?.status || "disponivel";
  const validade = cracha?.validade ? new Date(cracha.validade) : null;
  const expirado = validade && !Number.isNaN(validade.getTime()) && validade < new Date();
  const status = expirado && statusOriginal === "emUso" ? "alerta" : statusOriginal;

  return {
    ...cracha,
    rowKey: `cracha-${cracha.id}`,
    isTagFisicaDisponivel: false,
    status,
    statusOriginal,
    tagVirtual,
    tagCodigo: tagVirtual?.codigoTag || null,
    crachaNome: getCrachaNome(cracha),
    tipoUsuario: getTipoUsuario(cracha),
    usuarioNome: cracha?.usuario?.nome || null,
    setor: getSetorReal(cracha),
    criadoEm: formatarData(cracha?.dataDeCriacao),
    devolucao: cracha?.dataDeDevolucao ? formatarData(cracha.dataDeDevolucao) : null,
  };
}

function normalizarTagFisicaDisponivel(tag) {
  return {
    ...tag,
    rowKey: `tag-fisica-${tag.id}`,
    isTagFisicaDisponivel: true,
    status: tag?.status || "disponivel",
    statusOriginal: tag?.status || "disponivel",
    tagCodigo: tag?.codigoTag || null,
    crachaNome: tag?.codigoTag ? `RFID-${tag.codigoTag}` : "RFID-",
    tipoUsuario: null,
    usuarioNome: null,
    setor: null,
    criadoEm: formatarData(tag?.dataDeCriacao),
    devolucao: tag?.dataDeDevolucao ? formatarData(tag.dataDeDevolucao) : null,
  };
}

function ModalCadastrarCracha({ onClose, onSave }) {
  const [codigoTag, setCodigoTag] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!codigoTag.trim()) {
      alert("Preencha o codigo da TAG.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/cracha", {
        codigoTag: codigoTag.trim(),
        status: "disponivel",
        temporario: false,
      });

      if (response.sucesso) {
        onSave();
        onClose();
      } else {
        alert(response.mensagem || "Erro ao cadastrar cracha.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro de conexao com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <CreditCard size={16} className="text-primary" />
            </div>
            <h2 className="font-semibold text-foreground">Cadastrar Cracha</h2>
          </div>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <p className="text-xs text-muted-foreground">
            O cracha sera criado com uma TAG para identificacao no sistema.
          </p>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Codigo da TAG *</label>
            <input
              type="text"
              value={codigoTag}
              placeholder="Ex: VIRTUAL-DEMO-01"
              onChange={(event) => setCodigoTag(event.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/30 px-6 py-4">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button size="sm" className="gap-1.5" onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
            Confirmar Cadastro
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[status] ?? "bg-muted text-muted-foreground"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status] ?? "bg-muted-foreground"}`} />
      {STATUS_LABEL[status] || status}
    </span>
  );
}

function ValorVazio({ children }) {
  return <span className="text-xs italic text-muted-foreground">{children}</span>;
}

function CodigoTag({ codigo, vazio = "Sem TAG" }) {
  return codigo ? (
    <span className="font-mono text-xs font-semibold text-foreground">{codigo}</span>
  ) : (
    <ValorVazio>{vazio}</ValorVazio>
  );
}

function LinhaCracha({ cracha, onStatusChange, onDelete }) {
  const crachaPerdido = cracha.status === "perdido";
  const crachaDisponivel = cracha.status === "disponivel";

  return (
    <tr className="border-b border-border transition-colors duration-300 hover:bg-primary/[0.035]">
      <td className="px-4 py-3">
        <p className="text-xs font-bold text-foreground">{cracha.crachaNome}</p>
        <p className="mt-1 font-mono text-[10px] text-muted-foreground">{cracha.criadoEm}</p>
      </td>
      <td className="px-4 py-3 text-sm font-medium text-foreground whitespace-nowrap">
        {cracha.usuarioNome || <ValorVazio>Nenhum vinculado</ValorVazio>}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {cracha.tipoUsuario ? (
          <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
            {cracha.tipoUsuario}
          </span>
        ) : (
          <ValorVazio>Sem Tipo</ValorVazio>
        )}
      </td>
      <td className="px-4 py-3">
        <CodigoTag codigo={cracha.tagCodigo} vazio="Sem TAG" />
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {cracha.setor ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
            {cracha.setor}
          </span>
        ) : (
          <ValorVazio>Sem Setor</ValorVazio>
        )}
      </td>
      <td className="px-4 py-3">
        <StatusPill status={cracha.status} />
      </td>
      <td className="px-4 py-3">
        {cracha.isTagFisicaDisponivel ? (
          <div className="text-right text-xs text-muted-foreground">-</div>
        ) : (
          <div className="flex items-center justify-end gap-1.5">
            {!crachaDisponivel && (
              <button
                type="button"
                title="Marcar como disponivel"
                onClick={() => onStatusChange(cracha.id, "disponivel")}
                className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-all duration-300 hover:bg-primary/8 hover:text-primary"
              >
                <Check size={14} />
              </button>
            )}
            <button
              type="button"
              title={crachaPerdido ? "Voltar para em uso" : "Marcar como perdido"}
              onClick={() => onStatusChange(cracha.id, crachaPerdido ? "emUso" : "perdido")}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-all duration-300 ${
                crachaPerdido
                  ? "hover:bg-secondary/10 hover:text-secondary"
                  : "hover:bg-destructive/10 hover:text-destructive"
              }`}
            >
              {crachaPerdido ? <Undo2 size={14} /> : <AlertTriangle size={14} />}
            </button>
            <button
              type="button"
              title="Excluir cracha"
              onClick={() => onDelete(cracha.id)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-all duration-300 hover:bg-muted hover:text-foreground"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

export default function CrachasPage() {
  const [crachas, setCrachas] = useState([]);
  const [tagsFisicasDisponiveis, setTagsFisicasDisponiveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [statusFiltro, setStatusFiltro] = useState("Todas");
  const [busca, setBusca] = useState("");
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
  const [tempStatusFiltro, setTempStatusFiltro] = useState("Todas");

  const carregarCrachas = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const [crachasResponse, tagsResponse] = await Promise.all([
        api.get("/cracha"),
        api.get("/tags/disponiveis"),
      ]);

      if (crachasResponse.sucesso) {
        setCrachas((crachasResponse.data || []).map(normalizarCracha).sort((a, b) => a.id - b.id));
      }

      if (tagsResponse.sucesso) {
        setTagsFisicasDisponiveis(
          (tagsResponse.data || [])
            .filter((tag) => tag.fisica)
            .map(normalizarTagFisicaDisponivel)
            .sort((a, b) => a.id - b.id)
        );
      } else {
        setTagsFisicasDisponiveis([]);
      }
    } catch (error) {
      console.error("Erro ao carregar crachas:", error);
    } finally {
      setLoading(false);
    }
  };

  useAutoRefresh(carregarCrachas);

  const linhasTabela = useMemo(() => (
    [
      ...tagsFisicasDisponiveis,
      ...crachas,
    ]
  ), [tagsFisicasDisponiveis, crachas]);

  const filtrados = useMemo(() => {
    return linhasTabela.filter((cracha) => {
      const matchStatus = statusFiltro === "Todas" || cracha.status === statusFiltro;
      const q = busca.trim().toLowerCase();
      const matchBusca =
        !q ||
        String(cracha.id).includes(q) ||
        (cracha.crachaNome || "").toLowerCase().includes(q) ||
        (cracha.usuarioNome || "").toLowerCase().includes(q) ||
        (cracha.tipoUsuario || "").toLowerCase().includes(q) ||
        (cracha.tagCodigo || "").toLowerCase().includes(q);

      return matchStatus && matchBusca;
    });
  }, [linhasTabela, statusFiltro, busca]);

  const stats = useMemo(() => ({
    total: linhasTabela.length,
    emUso: linhasTabela.filter((cracha) => cracha.status === "emUso").length,
    disponiveis: linhasTabela.filter((cracha) => cracha.status === "disponivel").length,
    perdidos: linhasTabela.filter((cracha) => cracha.status === "perdido").length,
    visitantes: linhasTabela.filter((cracha) => cracha.tipoUsuario === "Visitante").length,
  }), [linhasTabela]);

  const aplicarFiltros = () => {
    setStatusFiltro(tempStatusFiltro);
  };

  const limparFiltros = () => {
    setTempStatusFiltro("Todas");
    setStatusFiltro("Todas");
    setBusca("");
  };

  async function exportarPDF() {
    if (filtrados.length === 0) {
      alert("Nao ha dados para exportar.");
      return;
    }

    try {
      await exportTableToPdf({
        title: "Crachas",
        subtitle: "Gestao de crachas e TAGs",
        fileName: `crachas_${new Date().toISOString().split("T")[0]}.pdf`,
        filters: [
          busca ? `Busca: ${busca}` : null,
          statusFiltro !== "Todas" ? `Status: ${STATUS_LABEL[statusFiltro] || statusFiltro}` : null,
        ].filter(Boolean),
        columns: [
          { header: "Cracha", weight: 1 },
          { header: "Usuario", weight: 1.3 },
          { header: "Tipo", weight: 0.9 },
          { header: "TAG", weight: 1.1 },
          { header: "Setor", weight: 1 },
          { header: "Status", weight: 0.8 },
        ],
        rows: filtrados.map((cracha) => [
          cracha.crachaNome || "-",
          cracha.usuarioNome || "-",
          cracha.tipoUsuario || "-",
          cracha.tagCodigo || "-",
          cracha.setor || "-",
          STATUS_LABEL[cracha.status] || cracha.status || "-",
        ]),
      });
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      alert("Nao foi possivel exportar o PDF.");
    }
  }

  const atualizarStatus = async (id, status) => {
    try {
      const response = await api.put(`/cracha/${id}`, { status });
      if (!response.sucesso) {
        alert(response.mensagem || "Erro ao atualizar cracha.");
        return;
      }
      await carregarCrachas();
    } catch (error) {
      console.error("Erro ao atualizar cracha:", error);
      alert("Erro de conexao com o servidor.");
    }
  };

  const excluirCracha = async (id) => {
    if (!confirm("Deseja excluir este cracha do inventario?")) return;

    try {
      const response = await api.delete(`/cracha/${id}`);
      if (!response.sucesso) {
        alert(response.mensagem || "Erro ao excluir cracha.");
        return;
      }
      await carregarCrachas();
    } catch (error) {
      console.error("Erro ao excluir cracha:", error);
      alert("Erro de conexao com o servidor.");
    }
  };

  return (
    <>
      {modalAberto && (
        <ModalCadastrarCracha
          onClose={() => setModalAberto(false)}
          onSave={carregarCrachas}
        />
      )}

      <div className="flex flex-col gap-6 animate-in fade-in duration-700">
        <Topbar
          title="Dashboard Crachas"
          subtitle="Gestao de crachas, usuarios e TAGs"
        />

        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <StatCard
            label="Total"
            value={stats.total}
            valueClassName="text-primary"
            icon={<CreditCard size={17} className="text-primary" />}
            sub="cadastrados"
            accentVar="var(--primary)"
          />
          <StatCard
            label="Em Uso"
            value={stats.emUso}
            valueClassName="text-secondary"
            icon={<ArrowRightLeft size={17} className="text-secondary" />}
            sub="vinculados"
            accentVar="var(--chart-2)"
          />
          <StatCard
            label="Disponiveis"
            value={stats.disponiveis}
            valueClassName="text-foreground"
            icon={<Check size={17} className="text-foreground" />}
            sub="em estoque"
            accentVar="var(--chart-4)"
          />
          <StatCard
            label="Perdidos"
            value={stats.perdidos}
            valueClassName="text-amber-600"
            icon={<Undo2 size={17} className="text-amber-600" />}
            sub="precisam reposicao"
            accentVar="var(--chart-3)"
          />
          <StatCard
            label="Visitantes"
            value={stats.visitantes}
            valueClassName="text-destructive"
            icon={<UserRound size={17} className="text-destructive" />}
            sub="com cracha"
            accentVar="var(--destructive)"
          />
        </div>

        <div className="rounded-[24px] border border-border bg-card p-5 shadow-md">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex w-full flex-1 items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="Buscar por ID, cracha, TAG, tipo ou usuario..."
                  className="h-11 rounded-xl border-border/60 bg-background/80 pl-10 text-sm transition-all duration-300 focus-visible:border-primary/40 focus-visible:ring-primary/20"
                  value={busca}
                  onChange={(event) => setBusca(event.target.value)}
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
                className="h-11 gap-2 rounded-xl border-border/60 bg-background/80 px-4 transition-all duration-300 hover:border-primary/20 hover:bg-white hover:shadow-sm"
              >
                <Filter size={16} />
                <span className="hidden sm:inline">Filtros</span>
                {statusFiltro !== "Todas" && (
                  <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                    1
                  </span>
                )}
              </Button>
            </div>

            <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:justify-end">
              <Button
                type="button"
                onClick={exportarPDF}
                variant="outline"
                disabled={loading || filtrados.length === 0}
                className="h-11 gap-2 rounded-xl border-border/60 bg-background/80 px-4 text-sm font-medium"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Exportar PDF</span>
              </Button>
              <div className="rounded-xl border border-border/50 bg-muted/40 px-3 py-2 text-[11px] font-semibold text-muted-foreground">
                {filtrados.length} resultado(s)
              </div>
            </div>
          </div>

          {(statusFiltro !== "Todas" || busca) && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/40 pt-4">
              <span className="mr-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Filtros ativos:</span>
              {busca && (
                <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
                  Busca: {busca}
                </span>
              )}
              {statusFiltro !== "Todas" && (
                <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
                  Status: {STATUS_LABEL[statusFiltro] || statusFiltro}
                </span>
              )}
              <Button
                variant="ghost"
                onClick={limparFiltros}
                className="h-7 px-2 text-[10px] text-muted-foreground transition-colors hover:bg-transparent hover:text-foreground"
              >
                Limpar tudo
              </Button>
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-[24px] border border-border bg-card shadow-md">
          <div className="border-b border-border bg-muted/20 p-4">
            <h3 className="text-sm font-bold">Inventario de Crachas</h3>
            <p className="text-xs text-muted-foreground">Controle de usuarios, setores e TAGs</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Cracha</th>
                  <th className="px-4 py-3">Usuário</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">TAG</th>
                  <th className="px-4 py-3">Setor</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Loader2 className="animate-spin" size={24} />
                        <span className="text-sm">Carregando crachas...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                      Nenhum cracha encontrado com os filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  filtrados.map((cracha) => (
                    <LinhaCracha
                      key={cracha.rowKey}
                      cracha={cracha}
                      onStatusChange={atualizarStatus}
                      onDelete={excluirCracha}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
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
              Status do Cracha
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {STATUS_FILTER_OPTS.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setTempStatusFiltro(status)}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-xs font-semibold transition-all ${
                    tempStatusFiltro === status
                      ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "border-border/60 bg-background text-muted-foreground hover:border-primary/30 hover:bg-muted/40"
                  }`}
                >
                  <span>{status === "Todas" ? "Todos os Status" : STATUS_LABEL[status] || status}</span>
                  {tempStatusFiltro === status && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-primary/10 bg-primary/5 p-4">
            <p className="text-[10px] leading-relaxed text-primary/80">
              Os crachas sao exibidos como TAG-1, TAG-2 e assim por diante, seguindo a ordem do ID.
            </p>
          </div>
        </div>
      </ModalFiltro>
    </>
  );
}
