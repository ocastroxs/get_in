"use client";
import { useState, useEffect, useMemo } from "react";
import {
  Users, Clock, LogOut, AlertTriangle, Search, X, Plus,
  CheckCircle2, XCircle, Loader2, Download, QrCode, Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatCard from "@/components/StatCard";
import Topbar from "@/components/Topbar";
import { api } from "@/services/api";

// ─── HELPERS & CONFIG ────────────────────────────────────────────────────────
const STATUS_LABEL = {
  ativo: "Dentro",
  saida: "Saída",
  pendente: "Pendente",
  alerta: "Alerta"
};

const STATUS_STYLE = {
  ativo: "bg-green-100 text-green-700",
  saida: "bg-blue-100 text-blue-700",
  pendente: "bg-amber-100 text-amber-700",
  alerta: "bg-red-100 text-red-600"
};

const STATUS_DOT = {
  ativo: "bg-green-500",
  saida: "bg-blue-500",
  pendente: "bg-amber-500",
  alerta: "bg-red-500"
};

// ─── MODAL DE CADASTRO RÁPIDO ────────────────────────────────────────────────
function ModalCadastroRapido({ isOpen, onClose, onSave }) {
  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    empresa: "",
    setor: "Recepção",
    motivo: "Visita",
    telefone: ""
  });
  const [loading, setLoading] = useState(false);

  const maskCPF = (v) =>
    v.replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");

  const handleCPFChange = (e) => {
    setForm({ ...form, cpf: maskCPF(e.target.value) });
  };

  async function handleSubmit() {
    if (!form.nome || !form.cpf || !form.empresa) {
      alert("Preencha os campos obrigatórios: Nome, CPF e Empresa");
      return;
    }

    setLoading(true);
    try {
      // Preparar payload para o endpoint do back-end
      const payload = {
        nome: form.nome,
        cpf: form.cpf.replace(/\D/g, ""),
        empresa: form.empresa,
        setor: form.setor,
        motivo: form.motivo,
        telefone: form.telefone,
        dataEntrada: new Date().toISOString()
      };

      // Chamar endpoint de check-in (será implementado no back-end)
      const response = await api.post('/portaria/checkin', payload);

      if (response.sucesso) {
        alert("Visitante registrado com sucesso!");
        onSave();
        onClose();
        setForm({
          nome: "",
          cpf: "",
          empresa: "",
          setor: "Recepção",
          motivo: "Visita",
          telefone: ""
        });
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl border border-border w-full max-w-md shadow-lg animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Novo Visitante</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
          >
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <div className="p-4 space-y-3">
          {/* Nome */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Nome *
            </label>
            <Input
              type="text"
              placeholder="Nome completo"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className="mt-1 h-9 text-sm"
            />
          </div>

          {/* CPF */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              CPF *
            </label>
            <Input
              type="text"
              placeholder="000.000.000-00"
              value={form.cpf}
              onChange={handleCPFChange}
              className="mt-1 h-9 text-sm"
              maxLength="14"
            />
          </div>

          {/* Empresa */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Empresa *
            </label>
            <Input
              type="text"
              placeholder="Nome da empresa"
              value={form.empresa}
              onChange={(e) => setForm({ ...form, empresa: e.target.value })}
              className="mt-1 h-9 text-sm"
            />
          </div>

          {/* Setor */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Setor
            </label>
            <select
              value={form.setor}
              onChange={(e) => setForm({ ...form, setor: e.target.value })}
              className="mt-1 h-9 w-full px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            >
              <option>Recepção</option>
              <option>Administrativo</option>
              <option>Produção</option>
              <option>Laboratório</option>
              <option>Almoxarifado</option>
              <option>Diretoria</option>
            </select>
          </div>

          {/* Motivo */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Motivo
            </label>
            <select
              value={form.motivo}
              onChange={(e) => setForm({ ...form, motivo: e.target.value })}
              className="mt-1 h-9 w-full px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            >
              <option>Visita</option>
              <option>Entrega</option>
              <option>Manutenção</option>
              <option>Reunião</option>
              <option>Outro</option>
            </select>
          </div>

          {/* Telefone */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Telefone
            </label>
            <Input
              type="tel"
              placeholder="(00) 00000-0000"
              value={form.telefone}
              onChange={(e) => setForm({ ...form, telefone: e.target.value })}
              className="mt-1 h-9 text-sm"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={14} className="mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              "Registrar"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL DE CHECK-OUT ──────────────────────────────────────────────────────
function ModalCheckout({ isOpen, onClose, visitante, onConfirm }) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    try {
      const payload = {
        id: visitante?.id,
        dataSaida: new Date().toISOString()
      };

      const response = await api.post('/portaria/checkout', payload);

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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl border border-border w-full max-w-sm shadow-lg animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Confirmar Check-out</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
          >
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div className="bg-muted/40 rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Nome</span>
              <span className="text-sm font-medium text-foreground">{visitante.nome}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-muted-foreground uppercase">CPF</span>
              <span className="text-sm font-medium text-foreground">{visitante.cpf}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Empresa</span>
              <span className="text-sm font-medium text-foreground">{visitante.empresa}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Entrada</span>
              <span className="text-sm font-medium text-foreground">{visitante.entrada}</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Confirme o check-out deste visitante. Esta ação não pode ser desfeita.
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCheckout}
            className="flex-1 bg-red-600 hover:bg-red-700"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={14} className="mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              "Confirmar Check-out"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── LINHA DA TABELA ─────────────────────────────────────────────────────────
function LinhaVisitante({ visitante, onCheckout }) {
  return (
    <tr className="border-b border-border hover:bg-muted/50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${STATUS_DOT[visitante.status]}`} />
          <div>
            <p className="text-sm font-medium text-foreground">{visitante.nome}</p>
            <p className="text-xs text-muted-foreground">{visitante.cpf}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-foreground">{visitante.empresa}</td>
      <td className="px-4 py-3 text-sm text-foreground">{visitante.setor}</td>
      <td className="px-4 py-3 text-xs text-muted-foreground">{visitante.entrada}</td>
      <td className="px-4 py-3">
        <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${STATUS_STYLE[visitante.status]}`}>
          {STATUS_LABEL[visitante.status]}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        {visitante.status === "ativo" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onCheckout(visitante)}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <LogOut size={14} className="mr-1" />
            Check-out
          </Button>
        )}
      </td>
    </tr>
  );
}

// ─── PÁGINA PRINCIPAL ────────────────────────────────────────────────────────
export default function PortariaPage() {
  const [stats, setStats] = useState({
    dentro: 0,
    saidas_hoje: 0,
    pendentes: 0
  });
  const [visitantes, setVisitantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [modalAberto, setModalAberto] = useState(false);
  const [modalCheckoutAberto, setModalCheckoutAberto] = useState(false);
  const [visitanteSelecionado, setVisitanteSelecionado] = useState(null);

  // Carregar dados
  useEffect(() => {
    fetchVisitantes();
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchVisitantes, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  async function fetchVisitantes() {
    try {
      setLoading(true);
      // Chamar endpoint para listar visitantes presentes
      const response = await api.get('/portaria/visitantes-presentes');

      if (response.sucesso && response.data) {
        setVisitantes(response.data);
        // Calcular estatísticas
        const dentro = response.data.filter(v => v.status === "ativo").length;
        const saidas_hoje = response.data.filter(v => v.status === "saida").length;
        const pendentes = response.data.filter(v => v.status === "pendente").length;

        setStats({
          dentro,
          saidas_hoje,
          pendentes
        });
      }
    } catch (error) {
      console.error("Erro ao carregar visitantes:", error);
    } finally {
      setLoading(false);
    }
  }

  // Filtrar visitantes
  const visitantesFiltrados = useMemo(() => {
    return visitantes.filter(v => {
      const matchBusca = busca === "" ||
        v.nome.toLowerCase().includes(busca.toLowerCase()) ||
        v.cpf.includes(busca) ||
        v.empresa.toLowerCase().includes(busca.toLowerCase());

      const matchStatus = filtroStatus === "Todos" || v.status === filtroStatus.toLowerCase();

      return matchBusca && matchStatus;
    });
  }, [visitantes, busca, filtroStatus]);

  function handleCheckout(visitante) {
    setVisitanteSelecionado(visitante);
    setModalCheckoutAberto(true);
  }

  function handleConfirmCheckout() {
    fetchVisitantes();
  }

  return (
    <>
      <Topbar
        title="Operação Portaria"
        subtitle="Gerenciamento de entrada e saída de visitantes"
        buttonText="Novo Visitante"
      />

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard
          label="Dentro"
          value={stats.dentro}
          valueClassName="text-green-600"
          icon={<Users size={17} className="text-green-600" />}
          sub="na empresa"
          accentVar="var(--green-500)"
          compact
        />
        <StatCard
          label="Saídas"
          value={stats.saidas_hoje}
          valueClassName="text-blue-600"
          icon={<LogOut size={17} className="text-blue-600" />}
          sub="hoje"
          accentVar="var(--blue-500)"
          compact
        />
        <StatCard
          label="Pendentes"
          value={stats.pendentes}
          valueClassName="text-yellow-600"
          icon={<Clock size={17} className="text-yellow-600" />}
          sub="aprovação"
          accentVar="var(--yellow-500)"
          compact
        />
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="bg-card border border-border rounded-xl p-4 mb-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Busca */}
          <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
            <Input
              placeholder="Buscar por nome, CPF ou empresa..."
              className="pl-9 h-9 text-sm"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            {busca && (
              <button
                onClick={() => setBusca("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filtros de Status */}
          <div className="flex flex-wrap items-center gap-2">
            {["Todos", "ativo", "saida", "pendente"].map((status) => (
              <button
                key={status}
                onClick={() => setFiltroStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filtroStatus === status
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {status === "ativo" ? "Dentro" : status === "saida" ? "Saída" : status}
              </button>
            ))}
          </div>

          {/* Botão Novo Visitante */}
          <Button
            onClick={() => setModalAberto(true)}
            className="gap-2"
          >
            <Plus size={16} />
            Novo Visitante
          </Button>
        </div>
      </div>

      {/* Tabela de Visitantes */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm">Visitantes Presentes</h3>
            <p className="text-xs text-muted-foreground">{visitantesFiltrados.length} registros</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Download size={14} />
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="px-4 py-3">Visitante</th>
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
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Loader2 className="animate-spin" size={24} />
                      <span className="text-sm">Carregando visitantes...</span>
                    </div>
                  </td>
                </tr>
              ) : visitantesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                    Nenhum visitante encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                visitantesFiltrados.map((v) => (
                  <LinhaVisitante
                    key={v.id}
                    visitante={v}
                    onCheckout={handleCheckout}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modais */}
      <ModalCadastroRapido
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onSave={fetchVisitantes}
      />

      <ModalCheckout
        isOpen={modalCheckoutAberto}
        onClose={() => setModalCheckoutAberto(false)}
        visitante={visitanteSelecionado}
        onConfirm={handleConfirmCheckout}
      />
    </>
  );
}
