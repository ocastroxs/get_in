"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Clock,
  Loader2,
  LogOut,
  Mail,
  Phone,
  QrCode,
  Search,
  Users,
  X,
  Filter,
  Check,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatCard from "@/components/StatCard";
import Topbar from "@/components/Topbar";
import ModalFiltro from "@/components/ui/ModalFiltro";
import { api } from "@/services/api";
import { exportTableToPdf } from "@/lib/exportPdf";

const STATUS_LABEL = {
  ativo: "Dentro",
  saida: "Saída",
  pendente: "Pendente",
  alerta: "Alerta",
  recusado: "Recusado"
};

const STATUS_STYLE = {
  ativo: "bg-green-100 text-green-700",
  saida: "bg-blue-100 text-blue-700",
  pendente: "bg-amber-100 text-amber-700",
  alerta: "bg-red-100 text-red-600",
  recusado: "bg-red-100 text-red-600"
};

const STATUS_DOT = {
  ativo: "bg-green-500",
  saida: "bg-blue-500",
  pendente: "bg-amber-500",
  alerta: "bg-red-500",
  recusado: "bg-red-500"
};

const STATUS_FILTERS = [
  { label: "Todos", value: "Todos" },
  { label: "Dentro", value: "ativo" },
  { label: "Pendente", value: "pendente" },
  { label: "Saída", value: "saida" }
];

const BACKEND_STATUS_TO_PORTARIA = {
  aprovado: "ativo",
  ativo: "ativo",
  dentro: "ativo",
  liberado: "ativo",
  pendente: "pendente",
  recusado: "recusado",
  rejeitado: "recusado",
  negado: "recusado",
  saida: "saida",
  saiu: "saida",
  finalizado: "saida",
  concluido: "saida",
  alerta: "alerta"
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

function normalizeStatus(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (normalized.includes("aguard")) {
    return "pendente";
  }

  return BACKEND_STATUS_TO_PORTARIA[normalized] || normalized || "pendente";
}

function getResponseArray(response, keys = []) {
  if (!response || typeof response !== "object" || !response.sucesso) {
    return [];
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  for (const key of keys) {
    if (Array.isArray(response.data?.[key])) {
      return response.data[key];
    }

    if (Array.isArray(response[key])) {
      return response[key];
    }
  }

  return [];
}

function normalizeVisitante(visitante) {
  const usuario = visitante?.usuario || {};
  const departamento = visitante?.departamento || visitante?.setores || {};
  const departamentoNome = typeof departamento === "string" ? departamento : departamento?.nome;
  const descricao = visitante?.descricao || "";
  const dataEntrada = pickFirst(
    visitante?.dataEntrada,
    visitante?.entrada,
    visitante?.dataDeEntrada,
    visitante?.dataDaEntrada,
    visitante?.dataDaRequisicao
  );
  const dataSaida = pickFirst(
    visitante?.dataSaida,
    visitante?.saida,
    visitante?.dataDeSaida,
    visitante?.dataDaSaida
  );
  const status = !visitante?.status && dataEntrada && !dataSaida
    ? "ativo"
    : normalizeStatus(visitante?.status);

  return {
    ...visitante,
    id: pickFirst(visitante?.id, visitante?.idLog, visitante?.idRegistro, visitante?.idRequisicao),
    nome: pickFirst(visitante?.nome, visitante?.visitante, usuario?.nome, getDescricaoValue(descricao, "Visitante")),
    cpf: pickFirst(visitante?.cpf, usuario?.cpf, getDescricaoValue(descricao, "CPF")),
    telefone: pickFirst(
      visitante?.telefone,
      visitante?.celular,
      visitante?.cel,
      usuario?.celular,
      usuario?.telefone,
      getDescricaoValue(descricao, "Telefone")
    ),
    email: pickFirst(
      visitante?.email,
      usuario?.email,
      getDescricaoValue(descricao, "Email"),
      getDescricaoValue(descricao, "E-mail")
    ),
    empresa: pickFirst(
      visitante?.empresa,
      visitante?.empresa_visitante,
      usuario?.empresa,
      getDescricaoValue(descricao, "Empresa")
    ),
    setor: pickFirst(visitante?.setor, departamentoNome, getDescricaoValue(descricao, "Setor")),
    dataEntrada,
    dataSaida,
    status,
    statusOriginal: visitante?.status,
    podeCheckout: Boolean(
      visitante?.podeCheckout ||
        (dataEntrada && !dataSaida && status === "ativo")
    )
  };
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

function formatDuration(startDate) {
  if (!startDate) return "—";

  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) {
    return "—";
  }

  const diffInMinutes = Math.max(0, Math.round((Date.now() - start.getTime()) / 60000));
  const hours = Math.floor(diffInMinutes / 60);
  const minutes = diffInMinutes % 60;

  if (hours === 0) {
    return `${minutes} min`;
  }

  return `${hours}h ${minutes.toString().padStart(2, "0")}min`;
}

function getSetorLabel(visitante) {
  if (Array.isArray(visitante?.setoresAcesso) && visitante.setoresAcesso.length > 0) {
    return visitante.setoresAcesso.join(", ");
  }

  return visitante?.setor || "—";
}

function ModalCheckout({ isOpen, onClose, visitante, onConfirm }) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    try {
      const payload = {
        id: visitante?.id,
        dataSaida: new Date().toISOString()
      };

      const response = await api.post("/portaria/checkout", payload);

      if (response.sucesso) {
        alert("Check-out realizado com sucesso!");
        onConfirm();
        onClose();
      } else {
        alert(response.mensagem || "Erro ao realizar check-out.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen || !visitante) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md animate-in zoom-in-95 rounded-xl border border-border bg-card shadow-lg duration-300 fade-in">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-semibold text-foreground">Check-out</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 transition-colors hover:bg-muted"
            type="button"
          >
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-4 p-4">
          <div className="space-y-3 rounded-lg bg-muted/40 p-3">
            <div className="flex items-start gap-2">
              <Users size={16} className="mt-0.5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Visitante</p>
                <p className="text-sm font-medium text-foreground">{visitante.nome || "—"}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Building2 size={16} className="mt-0.5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Empresa</p>
                <p className="text-sm font-medium text-foreground">{visitante.empresa || "—"}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock size={16} className="mt-0.5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Tempo de Permanência</p>
                <p className="text-sm font-medium text-foreground">{formatDuration(visitante.dataEntrada)}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Observações
            </label>
            <textarea
              placeholder="Adicione observações sobre a visita (opcional)"
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              rows="3"
            />
          </div>
        </div>

        <div className="flex gap-2 border-t border-border p-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
            type="button"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCheckout}
            className="flex-1 bg-red-600 hover:bg-red-700"
            disabled={loading}
            type="button"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <LogOut size={14} className="mr-2" />
                Confirmar Saída
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function LinhaVisitante({ visitante, onCheckout }) {
  const status = visitante.status || "ativo";
  const statusClass = STATUS_STYLE[status] || STATUS_STYLE.ativo;
  const dotClass = STATUS_DOT[status] || STATUS_DOT.ativo;

  return (
    <tr className="border-b border-border transition-colors hover:bg-muted/50">
      <td className="px-4 py-3">
        <p className="text-sm font-bold text-foreground">{visitante.nome || "—"}</p>
      </td>
      <td className="px-4 py-3 text-sm text-foreground">{visitante.empresa || "—"}</td>
      <td className="px-4 py-3 text-sm text-foreground">{getSetorLabel(visitante)}</td>
      <td className="px-4 py-3 whitespace-nowrap text-[11px] font-mono text-muted-foreground">
        {formatDateTime(visitante.dataEntrada)}
      </td>
      <td className="px-4 py-3">
        <p className="flex items-center gap-1.5 whitespace-nowrap text-xs text-muted-foreground">
          <Phone size={12} />
          <span>{visitante.telefone || "—"}</span>
        </p>
      </td>
      <td className="px-4 py-3">
        <p className="flex max-w-[240px] items-center gap-1.5 truncate text-xs text-muted-foreground">
          <Mail size={12} className="shrink-0" />
          <span className="truncate">{visitante.email || "—"}</span>
        </p>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-2 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusClass}`}>
          <span className={`h-2 w-2 rounded-full ${dotClass}`} />
          {STATUS_LABEL[status] || STATUS_LABEL.ativo}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2 whitespace-nowrap">
          <Button size="sm" variant="outline" className="h-8 gap-1.5 text-[10px] font-bold uppercase rounded-lg" type="button">
            <QrCode size={12} />
            <span className="hidden xl:inline">Crachá</span>
          </Button>

          {status === "ativo" && visitante.podeCheckout && (
            <Button
              size="sm"
              onClick={() => onCheckout(visitante)}
              className="h-8 gap-1.5 bg-red-600 text-[10px] font-bold uppercase hover:bg-red-700 rounded-lg"
              type="button"
            >
              <LogOut size={12} />
              <span className="hidden xl:inline">Saída</span>
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function PortariaPage() {
  const [visitantes, setVisitantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [modalCheckoutAberto, setModalCheckoutAberto] = useState(false);
  const [visitanteSelecionado, setVisitanteSelecionado] = useState(null);
  
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
  const [tempFiltroStatus, setTempFiltroStatus] = useState("Todos");

  useEffect(() => {
    fetchVisitantes();
    const interval = setInterval(fetchVisitantes, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  async function fetchVisitantes() {
    try {
      setLoading(true);
      const response = await api.get("/portaria/vlocal");
      const visitantesPortaria = getResponseArray(response, ["dados", "visitantes"]);

      if (response?.sucesso) {
        setVisitantes(visitantesPortaria.map(normalizeVisitante));
      } else {
        console.warn("Back-end nao retornou visitantes da portaria.");
        setVisitantes([]);
      }
    } catch (error) {
      console.error("Erro ao carregar visitantes:", error);
      setVisitantes([]);
    } finally {
      setLoading(false);
    }
  }

  const visitantesFiltrados = useMemo(() => {
    return visitantes.filter((visitante) => {
      const nome = visitante?.nome?.toLowerCase() || "";
      const cpf = visitante?.cpf || "";
      const empresa = visitante?.empresa?.toLowerCase() || "";
      const setor = getSetorLabel(visitante).toLowerCase();
      const telefone = visitante?.telefone?.toLowerCase() || "";
      const email = visitante?.email?.toLowerCase() || "";
      const termoBusca = busca.toLowerCase();

      const matchBusca =
        busca === "" ||
        nome.includes(termoBusca) ||
        cpf.includes(busca) ||
        empresa.includes(termoBusca) ||
        setor.includes(termoBusca) ||
        telefone.includes(termoBusca) ||
        email.includes(termoBusca);

      const matchStatus = filtroStatus === "Todos" || visitante.status === filtroStatus;

      return matchBusca && matchStatus;
    });
  }, [visitantes, busca, filtroStatus]);

  function handleCheckout(visitante) {
    setVisitanteSelecionado(visitante);
    setModalCheckoutAberto(true);
  }

  function handleConfirmacao() {
    fetchVisitantes();
  }

  const aplicarFiltros = () => {
    setFiltroStatus(tempFiltroStatus);
  };

  const limparFiltros = () => {
    setTempFiltroStatus("Todos");
    setFiltroStatus("Todos");
    setBusca("");
  };

  const exportarPDF = async () => {
    if (visitantesFiltrados.length === 0) {
      alert("Não há dados para exportar.");
      return;
    }

    try {
      await exportTableToPdf({
        title: "Visitantes presentes",
        subtitle: "Controle de acesso da portaria",
        fileName: `visitantes_presentes_${new Date().toISOString().split("T")[0]}.pdf`,
        filters: [
          busca ? `Busca: ${busca}` : null,
          filtroStatus !== "Todos" ? `Status: ${STATUS_LABEL[filtroStatus] || filtroStatus}` : null,
        ].filter(Boolean),
        columns: [
          { header: "Nome", weight: 1.5 },
          { header: "Empresa", weight: 1.2 },
          { header: "Setor", weight: 1 },
          { header: "Entrada", weight: 1.1 },
          { header: "Celular", weight: 1 },
          { header: "E-mail", weight: 1.4 },
          { header: "Status", weight: 0.8 },
        ],
        rows: visitantesFiltrados.map((v) => [
          v.nome,
          v.empresa,
          getSetorLabel(v),
          formatDateTime(v.dataEntrada),
          v.telefone,
          v.email,
          STATUS_LABEL[v.status] || "Dentro",
        ]),
      });
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      alert("Não foi possível exportar o PDF.");
    }
  };

  const countDentro = visitantes.filter((v) => v.status === "ativo").length;
  const countPendentes = visitantes.filter((v) => v.status === "pendente").length;
  const countSaidas = visitantes.filter((v) => v.status === "saida").length;

  return (
    <>
      <Topbar
        title="Portaria"
        subtitle="Controle de acesso e visitantes presentes"
        buttonText="Novo Visitante"
        buttonHref="/portaria/novo"
      />

      <div className="flex flex-col gap-6 p-4 md:p-6 animate-in fade-in duration-700">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard
            label="Visitantes Dentro"
            value={countDentro}
            icon={<Users size={20} className="text-green-600" />}
            accentVar="#16a34a"
            sub="No local agora"
          />
          <StatCard
            label="Pendentes"
            value={countPendentes}
            icon={<Clock size={20} className="text-amber-600" />}
            accentVar="#d97706"
            sub="Aguardando aprovação"
          />
          <StatCard
            label="Saídas"
            value={countSaidas}
            icon={<LogOut size={20} className="text-blue-600" />}
            accentVar="#2563eb"
            sub="Com saída registrada"
          />
        </div>

        {/* Barra de Filtros Padronizada */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 items-center gap-3 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="Buscar por nome, empresa, setor, celular ou e-mail..."
                  className="pl-10 h-11 rounded-xl border-border/60 bg-background/80 text-sm"
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
                {filtroStatus !== "Todos" && (
                  <span className="ml-1 w-5 h-5 rounded-full bg-primary text-[10px] flex items-center justify-center text-primary-foreground">
                    1
                  </span>
                )}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={exportarPDF}
                variant="outline"
                className="h-11 px-4 gap-2 rounded-xl border-border/60 bg-background/80 text-sm font-medium"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Exportar PDF</span>
              </Button>
              <div className="px-3 py-2 rounded-xl bg-muted/40 border border-border/50 text-[11px] font-semibold text-muted-foreground">
                {visitantesFiltrados.length} presente(s)
              </div>
            </div>
          </div>

          {(filtroStatus !== "Todos" || busca) && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border/40">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">Filtros ativos:</span>
              {busca && (
                <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
                  Busca: {busca}
                </span>
              )}
              {filtroStatus !== "Todos" && (
                <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
                  Status: {STATUS_LABEL[filtroStatus] || filtroStatus}
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

        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/20">
            <h3 className="font-bold text-sm text-foreground">Visitantes no Local</h3>
            <p className="text-xs text-muted-foreground">{visitantesFiltrados.length} visitantes encontrados</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="px-4 py-3">Visitante</th>
                  <th className="px-4 py-3">Empresa</th>
                  <th className="px-4 py-3">Setor</th>
                  <th className="px-4 py-3">Entrada</th>
                  <th className="px-4 py-3">Celular</th>
                  <th className="px-4 py-3">E-mail</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading && visitantes.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Loader2 className="animate-spin" size={24} />
                        <span className="text-sm">Carregando visitantes...</span>
                      </div>
                    </td>
                  </tr>
                ) : visitantesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-20 text-center text-sm text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-12 w-12 text-muted/30" />
                        <p>Nenhum visitante presente no momento.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  visitantesFiltrados.map((v, index) => (
                    <LinhaVisitante
                      key={`${v.id || "visitante"}-${v.dataEntrada || v.status || index}`}
                      visitante={v}
                      onCheckout={handleCheckout}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ModalCheckout
        isOpen={modalCheckoutAberto}
        onClose={() => setModalCheckoutAberto(false)}
        visitante={visitanteSelecionado}
        onConfirm={handleConfirmacao}
      />

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
              Status de Permanência
            </label>
            <div className="grid grid-cols-1 gap-2">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setTempFiltroStatus(f.value)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all border ${
                    tempFiltroStatus === f.value
                      ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                      : "bg-background text-muted-foreground border-border/60 hover:border-primary/30 hover:bg-muted/40"
                  }`}
                >
                  <span>{f.label}</span>
                  {tempFiltroStatus === f.value && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </ModalFiltro>
    </>
  );
}
