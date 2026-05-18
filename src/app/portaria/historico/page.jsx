"use client";
import { useState, useEffect, useMemo } from "react";
import {
  Calendar, Download, Loader2, Search, X, Filter, LogOut, LogIn, User, Building2, MapPin, Check, Mail, Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Topbar from "@/components/Topbar";
import ModalFiltro from "@/components/ui/ModalFiltro";
import { api } from "@/services/api";
import { exportTableToPdf } from "@/lib/exportPdf";
import { formatPhone } from "@/lib/utils";

const STATUS_OPTIONS = ["Todos", "Pendente", "Aprovado", "Recusado"];

const STATUS_LABEL = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  recusado: "Recusado",
  ativo: "Ativo",
  finalizado: "Finalizado"
};

const STATUS_STYLE = {
  pendente: "bg-amber-100 text-amber-700",
  aprovado: "bg-green-100 text-green-700",
  recusado: "bg-red-100 text-red-600",
  ativo: "bg-green-100 text-green-700",
  finalizado: "bg-blue-100 text-blue-700"
};

function pickFirst(...values) {
  return (
    values.find((value) => value !== undefined && value !== null && String(value).trim() !== "") ||
    ""
  );
}

function getDescricaoValue(descricao, label) {
  if (typeof descricao !== "string") return "";

  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = descricao.match(new RegExp(`${escapedLabel}:\\s*([^|]+)`, "i"));

  return match?.[1]?.trim() || "";
}

function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(date);
}

function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function maskCPF(value) {
  return onlyDigits(value)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function normalizeRegistro(registro) {
  const usuario = registro?.usuario || {};
  const departamento = registro?.departamento || registro?.setores || {};
  const departamentoNome = typeof departamento === "string" ? departamento : departamento?.nome;
  const descricao = registro?.descricao || "";

  return {
    ...registro,
    visitante: pickFirst(registro?.visitante, registro?.nome, usuario?.nome, getDescricaoValue(descricao, "Visitante")),
    cpf: pickFirst(registro?.cpf, usuario?.cpf, getDescricaoValue(descricao, "CPF")),
    telefone: pickFirst(
      registro?.telefone,
      registro?.celular,
      usuario?.celular,
      usuario?.telefone,
      getDescricaoValue(descricao, "Telefone")
    ),
    email: pickFirst(registro?.email, usuario?.email, getDescricaoValue(descricao, "Email"), getDescricaoValue(descricao, "E-mail")),
    empresa: pickFirst(registro?.empresa, registro?.empresa_visitante, usuario?.empresa, getDescricaoValue(descricao, "Empresa")),
    setor: pickFirst(registro?.setor, departamentoNome, getDescricaoValue(descricao, "Setor")),
    dataEntrada: pickFirst(registro?.dataEntrada, registro?.dataDaRequisicao, registro?.dataDeEntrada),
    dataSaida: pickFirst(registro?.dataSaida, registro?.dataDeSaida),
    status: registro?.status || (registro?.dataSaida || registro?.dataDeSaida ? "finalizado" : "ativo"),
    observacoes: pickFirst(registro?.observacoes, descricao)
  };
}

// Helpers do historico
function getRegistroIdentity(registro) {
  const idUsuario = pickFirst(registro?.idUsuario, registro?.usuario?.id);
  const cpf = onlyDigits(registro?.cpf);
  const email = String(registro?.email || "").trim().toLowerCase();
  const nome = String(registro?.visitante || "").trim().toLowerCase();
  const idRegistro = pickFirst(registro?.id, registro?.idRequisicao);

  if (idUsuario) return `usuario:${idUsuario}`;
  if (cpf) return `cpf:${cpf}`;
  if (email) return `email:${email}`;
  if (nome) return `nome:${nome}`;

  return `registro:${idRegistro || registro?.dataEntrada || ""}`;
}

function getRegistroTimestamp(registro) {
  const datas = [
    registro?.dataSaida,
    registro?.dataEntrada,
    registro?.dataDaRequisicao,
    registro?.validade
  ];

  for (const data of datas) {
    const timestamp = new Date(data).getTime();

    if (!Number.isNaN(timestamp)) {
      return timestamp;
    }
  }

  return 0;
}

function compareRegistroRecency(a, b) {
  const timestampA = getRegistroTimestamp(a);
  const timestampB = getRegistroTimestamp(b);

  if (timestampA !== timestampB) {
    return timestampA - timestampB;
  }

  return Number(a?.id || a?.idRequisicao || 0) - Number(b?.id || b?.idRequisicao || 0);
}

function dedupeRegistrosPorVisitante(registros) {
  const registrosPorVisitante = new Map();

  registros.forEach((registro) => {
    const key = getRegistroIdentity(registro);
    const registroAtual = registrosPorVisitante.get(key);

    if (!registroAtual || compareRegistroRecency(registro, registroAtual) >= 0) {
      registrosPorVisitante.set(key, registro);
    }
  });

  return Array.from(registrosPorVisitante.values()).sort((a, b) => compareRegistroRecency(b, a));
}

// Modal de detalhes
function ModalDetalhes({ isOpen, onClose, registro }) {
  if (!isOpen || !registro) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-card rounded-2xl border border-border w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border bg-muted/20">
          <h2 className="text-lg font-bold text-foreground">Detalhes do Registro</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-muted/40 rounded-xl p-4 space-y-4 border border-border/50">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-background border border-border text-muted-foreground">
                <User size={16} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Visitante</p>
                <p className="text-sm font-semibold text-foreground">{registro.visitante}</p>
                <p className="text-xs text-muted-foreground font-mono">{maskCPF(registro.cpf) || "—"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-background border border-border text-muted-foreground">
                <Building2 size={16} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Empresa</p>
                <p className="text-sm font-semibold text-foreground">{registro.empresa}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-background border border-border text-muted-foreground">
                  <Phone size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Telefone</p>
                  <p className="text-sm font-semibold text-foreground">{formatPhone(registro.telefone) || "—"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-background border border-border text-muted-foreground">
                  <Mail size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">E-mail</p>
                  <p className="truncate text-sm font-semibold text-foreground">{registro.email || "—"}</p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-background border border-border text-muted-foreground">
                <MapPin size={16} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Setor</p>
                <p className="text-sm font-semibold text-foreground">{registro.setor}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-green-500/10 text-green-600 border border-green-500/20">
                  <LogIn size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Entrada</p>
                  <p className="text-xs font-semibold text-foreground">{formatDateTime(registro.dataEntrada)}</p>
                </div>
              </div>

              {registro.dataSaida && (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-red-500/10 text-red-600 border border-red-500/20">
                    <LogOut size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Saída</p>
                    <p className="text-xs font-semibold text-foreground">{formatDateTime(registro.dataSaida)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-border bg-muted/10">
          <Button
            onClick={onClose}
            className="w-full h-11 rounded-xl"
          >
            Fechar Detalhes
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── LINHA DO HISTÓRICO ─────────────────────────────────────────────────────
function LinhaHistorico({ registro, onDetalhes }) {
  const status = STATUS_LABEL[registro.status] || registro.status || "Ativo";
  const statusClass = STATUS_STYLE[registro.status] || "bg-muted text-muted-foreground";

  return (
    <tr className="border-b border-border hover:bg-muted/50 transition-colors">
      <td className="px-4 py-3">
        <div>
          <p className="text-sm font-medium text-foreground">{registro.visitante || "—"}</p>
          <p className="text-xs text-muted-foreground font-mono">{maskCPF(registro.cpf) || "—"}</p>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="space-y-1 text-xs text-muted-foreground">
          <p className="flex items-center gap-1.5 whitespace-nowrap">
            <Phone size={12} />
            <span>{formatPhone(registro.telefone) || "—"}</span>
          </p>
          <p className="flex max-w-[220px] items-center gap-1.5 truncate">
            <Mail size={12} className="shrink-0" />
            <span className="truncate">{registro.email || "—"}</span>
          </p>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-foreground">{registro.empresa || "—"}</td>
      <td className="px-4 py-3 text-sm text-foreground">{registro.setor || "—"}</td>
      <td className="px-4 py-3 text-xs text-muted-foreground">{formatDateTime(registro.dataEntrada)}</td>
      <td className="px-4 py-3">
        <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold ${statusClass}`}>
          {status}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onDetalhes(registro)}
          className="h-8 text-xs rounded-lg text-primary border-primary/30 hover:bg-primary/5"
        >
          Detalhes
        </Button>
      </td>
    </tr>
  );
}

// ─── PÁGINA PRINCIPAL ────────────────────────────────────────────────────────
export default function HistoricoPage() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroData, setFiltroData] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [modalAberto, setModalAberto] = useState(false);
  const [registroSelecionado, setRegistroSelecionado] = useState(null);
  
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
  const [tempFiltroStatus, setTempFiltroStatus] = useState("Todos");
  const [tempFiltroData, setTempFiltroData] = useState("");

  useEffect(() => {
    fetchHistorico();
  }, []);

  async function fetchHistorico() {
    try {
      setLoading(true);
      const response = await api.get('/requisicao-visitante');

      if (response.sucesso && Array.isArray(response.data)) {
        setRegistros(dedupeRegistrosPorVisitante(response.data.map(normalizeRegistro)));
      }
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    } finally {
      setLoading(false);
    }
  }

  const registrosFiltrados = useMemo(() => {
    return registros.filter(r => {
      const termoBusca = busca.toLowerCase();
      const telefoneFormatado = formatPhone(r.telefone).toLowerCase();
      const telefoneDigitos = onlyDigits(r.telefone);
      const termoBuscaDigitos = onlyDigits(busca);
      const cpfFormatado = maskCPF(r.cpf).toLowerCase();
      const cpfDigitos = onlyDigits(r.cpf);
      const status = STATUS_LABEL[r.status] || r.status;
      const matchBusca = busca === "" ||
        (r.visitante || "").toLowerCase().includes(termoBusca) ||
        (r.cpf || "").toLowerCase().includes(termoBusca) ||
        cpfFormatado.includes(termoBusca) ||
        (termoBuscaDigitos !== "" && cpfDigitos.includes(termoBuscaDigitos)) ||
        (r.empresa || "").toLowerCase().includes(termoBusca) ||
        (r.telefone || "").toLowerCase().includes(termoBusca) ||
        telefoneFormatado.includes(termoBusca) ||
        (termoBuscaDigitos !== "" && telefoneDigitos.includes(termoBuscaDigitos)) ||
        (r.email || "").toLowerCase().includes(termoBusca);

      const matchStatus = filtroStatus === "Todos" || status === filtroStatus;

      const matchData = filtroData === "" ||
        String(r.dataEntrada || "").includes(filtroData);

      return matchBusca && matchStatus && matchData;
    });
  }, [registros, busca, filtroStatus, filtroData]);

  const resumoStatus = useMemo(() => ({
    Todos: registros.length,
    Pendente: registros.filter((r) => r.status === "pendente").length,
    Aprovado: registros.filter((r) => r.status === "aprovado").length,
    Recusado: registros.filter((r) => r.status === "recusado").length,
  }), [registros]);

  function handleDetalhes(registro) {
    setRegistroSelecionado(registro);
    setModalAberto(true);
  }

  const aplicarFiltros = () => {
    setFiltroStatus(tempFiltroStatus);
    setFiltroData(tempFiltroData);
  };

  const limparFiltros = () => {
    setTempFiltroStatus("Todos");
    setTempFiltroData("");
    setFiltroStatus("Todos");
    setFiltroData("");
    setBusca("");
  };

  async function downloadPDF() {
    if (registrosFiltrados.length === 0) {
      alert("Não há dados para exportar.");
      return;
    }

    try {
      await exportTableToPdf({
        title: "Histórico da portaria",
        subtitle: "Registro completo de entradas e saídas",
        fileName: `historico_portaria_${new Date().toISOString().split("T")[0]}.pdf`,
        filters: [
          busca ? `Busca: ${busca}` : null,
          filtroStatus !== "Todos" ? `Status: ${filtroStatus}` : null,
          filtroData ? `Data: ${filtroData}` : null,
        ].filter(Boolean),
        columns: [
          { header: "Visitante", weight: 1.4 },
          { header: "CPF", weight: 1 },
          { header: "Telefone", weight: 1 },
          { header: "E-mail", weight: 1.4 },
          { header: "Empresa", weight: 1.2 },
          { header: "Setor", weight: 1.1 },
          { header: "Entrada", weight: 1.1 },
          { header: "Saída", weight: 1.1 },
          { header: "Status", weight: 0.8 },
        ],
        rows: registrosFiltrados.map((r) => [
          r.visitante,
          maskCPF(r.cpf),
          formatPhone(r.telefone),
          r.email,
          r.empresa,
          r.setor,
          formatDateTime(r.dataEntrada),
          formatDateTime(r.dataSaida),
          STATUS_LABEL[r.status] || r.status,
        ]),
      });
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      alert("Não foi possível exportar o PDF.");
    }
  }

  return (
    <>
      <Topbar
        title="Histórico"
        subtitle="Registro completo de entradas e saídas"
      />

      {/* Barra de Filtros Padronizada */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-6 shadow-sm animate-in fade-in duration-500">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 items-center gap-3 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Buscar por nome, CPF, telefone, e-mail ou empresa..."
                className="h-11 rounded-xl border-border/60 bg-card text-sm shadow-xs transition-all duration-200 hover:border-primary/30 hover:bg-accent/50 focus:border-primary/50 focus:ring-3 focus:ring-primary/15 pl-10"
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
              <span className="hidden sm:inline">Filtros</span>
              {(filtroStatus !== "Todos" || filtroData) && (
                <span className="ml-1 w-5 h-5 rounded-full bg-primary text-[10px] flex items-center justify-center text-primary-foreground">
                  {(filtroStatus !== "Todos" ? 1 : 0) + (filtroData ? 1 : 0)}
                </span>
              )}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={downloadPDF}
              variant="outline"
              className="h-11 px-4 gap-2 rounded-xl border-border/60 bg-background/80 text-sm font-medium"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Exportar PDF</span>
            </Button>
            <div className="px-3 py-2 rounded-xl bg-muted/40 border border-border/50 text-[11px] font-semibold text-muted-foreground">
              {registrosFiltrados.length} resultado(s)
            </div>
          </div>
        </div>

        {(filtroStatus !== "Todos" || filtroData || busca) && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border/40">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">Filtros ativos:</span>
            {busca && (
              <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
                Busca: {busca}
              </span>
            )}
            {filtroStatus !== "Todos" && (
              <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
                Status: {filtroStatus}
              </span>
            )}
            {filtroData && (
              <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
                Data: {filtroData}
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

      {/* Tabela de Histórico */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-muted/20">
          <h3 className="font-bold text-sm">Histórico de Visitantes</h3>
          <p className="text-xs text-muted-foreground">{registrosFiltrados.length} registros encontrados</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="px-4 py-3">Visitante</th>
                <th className="px-4 py-3">Contato</th>
                <th className="px-4 py-3">Empresa</th>
                <th className="px-4 py-3">Setor</th>
                <th className="px-4 py-3">Entrada</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Loader2 className="animate-spin" size={24} />
                      <span className="text-sm">Carregando histórico...</span>
                    </div>
                  </td>
                </tr>
              ) : registrosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                    Nenhum registro encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                registrosFiltrados.map((r) => (
                  <LinhaHistorico
                    key={r.id}
                    registro={r}
                    onDetalhes={handleDetalhes}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detalhes */}
      <ModalDetalhes
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        registro={registroSelecionado}
      />

      {/* Modal de Filtro Padronizado */}
      <ModalFiltro
        isOpen={modalFiltroAberto}
        onClose={() => setModalFiltroAberto(false)}
        onApply={aplicarFiltros}
        onClear={limparFiltros}
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-2">
              <Calendar size={13} />
              Data da Visita
            </label>
            <Input
              type="date"
              className="h-11 rounded-xl border-border/60 bg-background text-sm"
              value={tempFiltroData}
              onChange={(e) => setTempFiltroData(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between ml-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Filter size={13} />
                Status da Visita
              </label>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {STATUS_OPTIONS.map((status) => {
                const isActive = tempFiltroStatus === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setTempFiltroStatus(status)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all border ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                        : "bg-background text-muted-foreground border-border/60 hover:border-primary/30 hover:bg-muted/40"
                    }`}
                  >
                    <span>{status}</span>
                    <div className="flex items-center gap-2">
                      <span className={`min-w-5 h-5 px-1.5 rounded-full text-[10px] flex items-center justify-center ${
                        isActive
                          ? "bg-white/20 text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}>
                        {resumoStatus[status]}
                      </span>
                      {isActive && <Check size={14} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
            <p className="text-[10px] text-primary/80 leading-relaxed">
              <strong>Dica:</strong> Use o filtro de data para localizar registros de dias específicos ou o status para filtrar visitas em andamento.
            </p>
          </div>
        </div>
      </ModalFiltro>
    </>
  );
}
