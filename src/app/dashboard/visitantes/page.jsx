"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Users, ArrowRightLeft, Clock3,
  Search, X, Plus, Check, Loader2,
  Eye
} from "lucide-react";
import StatCard from "@/components/StatCard";
import Topbar from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import ModalFiltro from "@/components/ui/ModalFiltro";
import { api } from "@/services/api";

const STATUS_LABEL = {
  ativo: "Ativo",
  expirado: "Expirado",
  finalizado: "Finalizado",
  pendente: "Pendente",
};

const STATUS_STYLE = {
  ativo: "bg-primary/10 text-primary",
  expirado: "bg-destructive/10 text-destructive",
  finalizado: "bg-muted text-foreground",
  pendente: "bg-muted text-muted-foreground",
};

const STATUS_DOT = {
  ativo: "bg-primary",
  expirado: "bg-destructive",
  finalizado: "bg-foreground",
  pendente: "bg-muted-foreground",
};

const LIMITE_ALERTA_HORAS = 8;

function normalizarArrayResponse(response, keys = []) {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.dados)) return response.dados;

  for (const key of keys) {
    if (Array.isArray(response?.[key])) return response[key];
    if (Array.isArray(response?.data?.[key])) return response.data[key];
    if (Array.isArray(response?.dados?.[key])) return response.dados[key];
  }

  return [];
}

function parseData(value) {
  if (!value) return null;
  const data = new Date(String(value).replace(" ", "T"));
  return Number.isNaN(data.getTime()) ? null : data;
}

function formatarDataHora(value) {
  const data = parseData(value);
  if (!data) return value || "-";
  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getEntrada(item) {
  return item?.dataEntrada || item?.entrada || item?.dataDeEntrada || item?.dataDaRequisicao;
}

function getSaida(item) {
  return item?.dataSaida || item?.saida || item?.dataDeSaida;
}

function normalizarStatus(item, origem) {
  if (origem === "pendencias") return "pendente";

  const status = String(item?.status || item?.solicitacao || "").toLowerCase();
  const saida = getSaida(item);
  const entrada = parseData(getEntrada(item));

  if (saida || status.includes("saida") || status.includes("finalizado") || status.includes("conclu")) {
    return "finalizado";
  }

  if (status.includes("pendente")) {
    return "pendente";
  }

  if (status.includes("expir") || status.includes("alerta") || status.includes("semsaida")) {
    return "expirado";
  }

  if (entrada) {
    const horas = (Date.now() - entrada.getTime()) / (1000 * 60 * 60);
    if (horas >= LIMITE_ALERTA_HORAS) return "expirado";
  }

  return "ativo";
}

function normalizarVisitante(item, origem, index) {
  const usuario = item?.usuario || {};

  return {
    id: `${origem}-${item?.id || item?.idUsuario || item?.idLog || index}`,
    idOriginal: item?.id,
    nome: item?.nome || item?.visitante || usuario?.nome || "Visitante",
    empresa: item?.empresa || usuario?.empresas?.nome || "-",
    cpf: item?.cpf || usuario?.cpf || "-",
    setor: Array.isArray(item?.setores) ? item.setores.join(", ") : item?.setor || item?.setores?.nome || "-",
    entrada: formatarDataHora(getEntrada(item)),
    saida: getSaida(item) ? formatarDataHora(getSaida(item)) : "-",
    status: normalizarStatus(item, origem),
  };
}

function toCSV(rows) {
  const cols = ["Nome", "Empresa", "CPF", "Setor", "Entrada", "Saida", "Status"];
  const lines = rows.map((r) =>
    [r.nome, r.empresa, r.cpf, r.setor, r.entrada, r.saida ?? "-", STATUS_LABEL[r.status] ?? r.status].join(";")
  );
  return [cols.join(";"), ...lines].join("\n");
}

function downloadCSV(data) {
  const blob = new Blob([toCSV(data)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "visitantes.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function ModalNovoVisitante({ setores, onClose, onSave }) {
  const [form, setForm] = useState({
    nome: "",
    empresa: "",
    cpf: "",
    email: "",
    celular: "",
    idSetor: "",
    motivo: "",
  });
  const [loading, setLoading] = useState(false);

  const maskCPF = (value) =>
    value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");

  async function handleSubmit() {
    if (!form.nome || !form.empresa || !form.cpf || !form.email || !form.idSetor) {
      alert("Preencha os campos obrigatorios.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        nome: form.nome,
        empresa: form.empresa,
        cpf: form.cpf,
        email: form.email,
        celular: form.celular,
        idSetor: Number(form.idSetor),
        motivo: form.motivo || "Visita",
        validade: new Date().toISOString(),
      };

      const response = await api.post("/visitante", payload);

      if (response.sucesso) {
        onSave();
        onClose();
      } else {
        alert(response.mensagem || "Erro ao registrar visitante.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="mx-4 w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-xl animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Plus size={16} className="text-primary" />
            </div>
            <h2 className="font-semibold text-foreground">Novo Visitante</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground transition-colors hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <p className="text-xs text-muted-foreground">
            Registre um novo visitante no sistema. Todos os campos marcados com * são obrigatórios.
          </p>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Nome completo *</label>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Ex: Marina Souza"
              className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground transition placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Empresa *</label>
            <input
              type="text"
              value={form.empresa}
              onChange={(e) => setForm({ ...form, empresa: e.target.value })}
              placeholder="Ex: Nutrilab"
              className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground transition placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">CPF *</label>
            <input
              type="text"
              value={form.cpf}
              onChange={(e) => setForm({ ...form, cpf: maskCPF(e.target.value) })}
              placeholder="000.000.000-00"
              className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground transition placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">E-mail *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="visitante@empresa.com"
              className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground transition placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Celular</label>
            <input
              type="text"
              value={form.celular}
              onChange={(e) => setForm({ ...form, celular: e.target.value })}
              placeholder="(11) 99999-9999"
              className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground transition placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Setor *</label>
            <select
              value={form.idSetor}
              onChange={(e) => setForm({ ...form, idSetor: e.target.value })}
              className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Selecione</option>
              {setores.map((setor) => (
                <option key={setor.id} value={setor.id}>
                  {setor.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Motivo da Visita</label>
            <input
              type="text"
              value={form.motivo}
              onChange={(e) => setForm({ ...form, motivo: e.target.value })}
              placeholder="Ex: Visita Tecnica"
              className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground transition placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/30 px-6 py-4">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button size="sm" className="gap-1.5" onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
            Registrar Visitante
          </Button>
        </div>
      </div>
    </div>
  );
}

function ModalDetalhesVisitante({ visitante, onClose }) {
  if (!visitante) return null;

  const detalhes = [
    { label: "Nome", value: visitante.nome },
    { label: "CPF", value: visitante.cpf },
    { label: "Empresa", value: visitante.empresa },
    { label: "Setor", value: visitante.setor },
    { label: "Entrada", value: visitante.entrada },
    { label: "Saida", value: visitante.saida || "-" },
    { label: "Status", value: STATUS_LABEL[visitante.status] || visitante.status },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-sm font-bold text-foreground">Detalhes do Visitante</h2>
            <p className="text-xs text-muted-foreground">Registro completo da visita</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Fechar detalhes"
          >
            <X size={18} />
          </button>
        </div>
        <div className="space-y-3 px-6 py-5">
          {detalhes.map((item) => (
            <div key={item.label} className="flex items-start justify-between gap-4 border-b border-border/40 pb-2 last:border-0 last:pb-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{item.label}</span>
              <span className="text-right text-sm font-medium text-foreground">{item.value || "-"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LinhaVisitante({ visitante, onDetalhes }) {
  return (
    <tr className="border-b border-border transition-colors duration-300 hover:bg-primary/[0.035]">
      <td className="px-4 py-3">
        <div className="text-sm font-medium text-foreground">{visitante.nome}</div>
        <div className="font-mono text-[10px] text-muted-foreground">{visitante.cpf}</div>
      </td>
      <td className="px-4 py-3 text-sm font-medium whitespace-nowrap text-primary">{visitante.empresa}</td>
      <td className="px-4 py-3">
        <div className="text-xs font-semibold text-foreground">{visitante.setor || "-"}</div>
      </td>
      <td className="px-4 py-3 text-sm text-foreground">{visitante.entrada || "-"}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground">{visitante.saida ?? "-"}</td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
            STATUS_STYLE[visitante.status] ?? "bg-muted text-muted-foreground"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[visitante.status] ?? "bg-muted-foreground"}`} />
          {STATUS_LABEL[visitante.status] || visitante.status}
        </span>
      </td>
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={() => onDetalhes(visitante)}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-all duration-300 hover:bg-primary/8 hover:text-primary"
          aria-label={`Ver detalhes de ${visitante.nome}`}
        >
          <Eye size={14} />
        </button>
      </td>
    </tr>
  );
}

export default function VisitantesPage() {
  const [visitantes, setVisitantes] = useState([]);
  const [setores, setSetores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [visitanteDetalhes, setVisitanteDetalhes] = useState(null);
  const [statusFiltro, setStatusFiltro] = useState("Todos");
  const [tempStatusFiltro, setTempStatusFiltro] = useState("Todos");
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
  const [busca, setBusca] = useState("");

  const carregarVisitantes = async () => {
    setLoading(true);
    try {
      const [localResponse, pendenciasResponse, historicoResponse, setoresResponse] = await Promise.all([
        api.get("/portaria/vlocal"),
        api.get("/portaria/pendencias"),
        api.get("/portaria/historico"),
        api.get("/setores"),
      ]);

      const visitantesLocal = normalizarArrayResponse(localResponse, ["visitantes", "dados"])
        .map((item, index) => normalizarVisitante(item, "vlocal", index));
      const pendencias = normalizarArrayResponse(pendenciasResponse, ["pendencias", "dados"])
        .map((item, index) => normalizarVisitante(item, "pendencias", index));
      const historico = normalizarArrayResponse(historicoResponse, ["historico", "dados"])
        .map((item, index) => normalizarVisitante(item, "historico", index));

      const visitantesPorId = new Map();
      [...visitantesLocal, ...pendencias, ...historico].forEach((visitante) => {
        visitantesPorId.set(visitante.id, visitante);
      });

      setVisitantes([...visitantesPorId.values()]);

      if (setoresResponse.sucesso) {
        setSetores(normalizarArrayResponse(setoresResponse, ["setores", "dados"]));
      }
    } catch (error) {
      console.error("Erro ao carregar visitantes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarVisitantes();
  }, []);

  const filtrados = useMemo(() => {
    return visitantes.filter((visitante) => {
      const matchStatus = statusFiltro === "Todos" || visitante.status === statusFiltro;
      const query = busca.trim().toLowerCase();
      const matchBusca =
        !query ||
        visitante.nome?.toLowerCase().includes(query) ||
        visitante.empresa?.toLowerCase().includes(query) ||
        visitante.cpf?.includes(query);

      return matchStatus && matchBusca;
    });
  }, [visitantes, statusFiltro, busca]);

  const stats = useMemo(() => ({
    total:       visitantes.length,
    ativos:      visitantes.filter((v) => v.status === "ativo").length,
    finalizados: visitantes.filter((v) => v.status === "finalizado").length,
    expirados:   visitantes.filter((v) => v.status === "expirado").length,
  }), [visitantes]);

  const aplicarFiltros = () => {
    setStatusFiltro(tempStatusFiltro);
  };

  const limparFiltros = () => {
    setStatusFiltro("Todos");
    setTempStatusFiltro("Todos");
    setBusca("");
  };

  return (
    <>
      {modalAberto && (
        <ModalNovoVisitante
          setores={setores}
          onClose={() => setModalAberto(false)}
          onSave={carregarVisitantes}
        />
      )}
      <ModalDetalhesVisitante visitante={visitanteDetalhes} onClose={() => setVisitanteDetalhes(null)} />

      <div className="flex flex-col gap-6">
        <Topbar
          title="Visitantes"
          subtitle="Gestao de acesso e monitoramento de visitantes"
          secondaryButtonText="Download"
          onSecondaryButtonClick={() => downloadCSV(filtrados)}
          buttonText="Novo Visitante"
          onButtonClick={() => setModalAberto(true)}
        />

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            label="Total de Visitas"
            value={stats.total}
            icon={<Users size={17} className="text-primary" />}
            sub="Registros no sistema"
            accentVar="var(--primary)"
          />
          <StatCard
            label="Ativos Agora"
            value={stats.ativos}
            valueClassName="text-secondary"
            icon={<Check size={17} className="text-secondary" />}
            sub="Dentro da empresa"
            accentVar="var(--chart-2)"
          />
          <StatCard
            label="Finalizados"
            value={stats.finalizados}
            valueClassName="text-foreground"
            icon={<ArrowRightLeft size={17} className="text-foreground" />}
            sub="Visitas concluídas"
            accentVar="var(--foreground)"
          />
          <StatCard
            label="Expirados"
            value={stats.expirados}
            valueClassName="text-destructive"
            icon={<Clock3 size={17} className="text-destructive" />}
            sub="saida pendente"
            accentVar="var(--destructive)"
          />
        </div>

        <div className="overflow-hidden rounded-[24px] border border-border bg-card shadow-md">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Registro de Visitantes</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar visitante..."
                  className="h-9 w-52 rounded-xl border border-border/70 bg-background/80 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                {busca && (
                  <button onClick={() => setBusca("")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground">
                    <X size={11} />
                  </button>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 gap-2 rounded-xl border-border/70 bg-background/80 transition-all duration-300 hover:border-primary/20 hover:bg-white hover:shadow-sm"
                onClick={() => setModalFiltroAberto(true)}
              >
                Filtros
                {statusFiltro !== "Todos" ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                    1
                  </span>
                ) : null}
              </Button>
            </div>
          </div>

          {(statusFiltro !== "Todos" || busca) && (
            <div className="flex flex-wrap items-center gap-2 px-4 py-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">Filtros ativos:</span>
              {busca && (
                <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
                  Busca: {busca}
                </span>
              )}
              {statusFiltro !== "Todos" && (
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

        {/* Tabela de Visitantes */}
        <div className="overflow-hidden rounded-[24px] border border-border bg-card shadow-md">
          <div className="p-4 border-b border-border bg-muted/20">
            <h3 className="font-bold text-sm">Listagem de Visitantes</h3>
            <p className="text-xs text-muted-foreground">Monitoramento em tempo real</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {["Visitante", "Empresa", "Setor", "Entrada", "Saída", "Status", "Ações"].map((col) => (
                    <th key={col} className="py-2.5 px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Loader2 className="animate-spin" size={24} />
                        <span className="text-sm">Carregando visitantes...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                      Nenhum visitante encontrado com os filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  filtrados.map((visitante) => (
                    <LinhaVisitante
                      key={visitante.id}
                      visitante={visitante}
                      onDetalhes={setVisitanteDetalhes}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
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
              Status da Visita
            </label>
            <div className="grid grid-cols-2 gap-2">
              {["Todos", "ativo", "expirado", "finalizado", "pendente"].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setTempStatusFiltro(status)}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                    tempStatusFiltro === status
                      ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                      : "bg-background text-muted-foreground border-border/60 hover:border-primary/30 hover:bg-muted/40"
                  }`}
                >
                  {STATUS_LABEL[status] || status}
                  {tempStatusFiltro === status && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>
          
        </div>
      </ModalFiltro>
    </>
  );
}
