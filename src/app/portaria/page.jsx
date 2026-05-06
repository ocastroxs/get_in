"use client";
import { useState, useEffect, useMemo } from "react";
import {
  Users, Clock, AlertTriangle, Search, X, Plus,
  CheckCircle2, XCircle, Loader2, LogOut, Phone, MapPin, Building2, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";

// ─── HELPERS & CONFIG ────────────────────────────────────────────────────────
const STATUS_LABEL = {
  ativo: "Dentro",
  saida: "Saída",
  pendente: "Pendente",
  alerta: "Alerta"
};

const STATUS_STYLE = {
  ativo: "bg-green-100 text-green-700 border-l-4 border-green-500",
  saida: "bg-blue-100 text-blue-700 border-l-4 border-blue-500",
  pendente: "bg-amber-100 text-amber-700 border-l-4 border-amber-500",
  alerta: "bg-red-100 text-red-600 border-l-4 border-red-500"
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
      const payload = {
        nome: form.nome,
        cpf: form.cpf.replace(/\D/g, ""),
        empresa: form.empresa,
        setor: form.setor,
        motivo: form.motivo,
        telefone: form.telefone,
        dataEntrada: new Date().toISOString()
      };

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
      <div className="bg-card rounded-xl border border-border w-full max-w-md shadow-xl animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
          <h2 className="text-lg font-bold text-foreground">Novo Visitante</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
          >
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              Nome Completo *
            </label>
            <Input
              type="text"
              placeholder="João Silva"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className="h-10 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                CPF *
              </label>
              <Input
                type="text"
                placeholder="000.000.000-00"
                value={form.cpf}
                onChange={handleCPFChange}
                className="h-10 text-sm"
                maxLength="14"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Telefone
              </label>
              <Input
                type="tel"
                placeholder="(11) 99999-9999"
                value={form.telefone}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                className="h-10 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              Empresa *
            </label>
            <Input
              type="text"
              placeholder="Empresa XYZ"
              value={form.empresa}
              onChange={(e) => setForm({ ...form, empresa: e.target.value })}
              className="h-10 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Setor
              </label>
              <select
                value={form.setor}
                onChange={(e) => setForm({ ...form, setor: e.target.value })}
                className="h-10 w-full px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              >
                <option>Recepção</option>
                <option>Administrativo</option>
                <option>Produção</option>
                <option>Laboratório</option>
                <option>Almoxarifado</option>
                <option>Diretoria</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Motivo
              </label>
              <select
                value={form.motivo}
                onChange={(e) => setForm({ ...form, motivo: e.target.value })}
                className="h-10 w-full px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              >
                <option>Visita</option>
                <option>Entrega</option>
                <option>Manutenção</option>
                <option>Reunião</option>
                <option>Outro</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-2 p-4 border-t border-border bg-muted/20">
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
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={14} className="mr-2 animate-spin" />
                Registrando...
              </>
            ) : (
              <>
                <Plus size={14} className="mr-2" />
                Registrar
              </>
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
  const [ocorrencia, setOcorrencia] = useState("");

  async function handleCheckout() {
    setLoading(true);
    try {
      const payload = {
        id: visitante?.id,
        dataSaida: new Date().toISOString(),
        ocorrencia: ocorrencia || null
      };

      const response = await api.post('/portaria/checkout', payload);

      if (response.sucesso) {
        alert("Check-out realizado com sucesso!");
        onConfirm();
        onClose();
        setOcorrencia("");
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

  const tempoPermanen = visitante.entrada ? 
    Math.round((new Date() - new Date(visitante.entrada)) / 60000) : 0;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl border border-border w-full max-w-md shadow-xl animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-red-500/10 to-transparent">
          <h2 className="text-lg font-bold text-foreground">Confirmar Check-out</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
          >
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-3 border border-border/50">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground uppercase">Nome</span>
              </div>
              <span className="text-sm font-medium text-foreground text-right">{visitante.nome}</span>
            </div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground uppercase">Empresa</span>
              </div>
              <span className="text-sm font-medium text-foreground text-right">{visitante.empresa}</span>
            </div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground uppercase">Setor</span>
              </div>
              <span className="text-sm font-medium text-foreground text-right">{visitante.setor}</span>
            </div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground uppercase">Permanência</span>
              </div>
              <span className="text-sm font-medium text-foreground text-right">{tempoPermanen} min</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              Observações (opcional)
            </label>
            <textarea
              placeholder="Ex: Crachá devolvido, sem ocorrências..."
              value={ocorrencia}
              onChange={(e) => setOcorrencia(e.target.value)}
              className="w-full h-20 px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none"
            />
          </div>

          <p className="text-xs text-muted-foreground bg-amber-50 border border-amber-200 rounded p-2">
            ⚠️ Esta ação registrará a saída do visitante. Certifique-se de que o crachá foi devolvido.
          </p>
        </div>

        <div className="flex gap-2 p-4 border-t border-border bg-muted/20">
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
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={14} className="mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <LogOut size={14} className="mr-2" />
                Check-out
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── CARTÃO DE VISITANTE (ESTILO OPERACIONAL) ────────────────────────────────
function CartaoVisitante({ visitante, onCheckout }) {
  const tempoPermanen = visitante.entrada ? 
    Math.round((new Date() - new Date(visitante.entrada)) / 60000) : 0;

  return (
    <div className={`rounded-lg p-4 ${STATUS_STYLE[visitante.status]} transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-base">{visitante.nome}</h3>
          <p className="text-xs opacity-75">{visitante.cpf}</p>
        </div>
        <span className="text-xs font-semibold uppercase px-2 py-1 bg-white/50 rounded">
          {STATUS_LABEL[visitante.status]}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div className="flex items-center gap-1">
          <Building2 size={14} />
          <span className="truncate">{visitante.empresa}</span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin size={14} />
          <span className="truncate">{visitante.setor}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar size={14} />
          <span className="text-xs">{visitante.entrada}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={14} />
          <span className="text-xs">{tempoPermanen} min</span>
        </div>
      </div>

      {visitante.status === "ativo" && (
        <Button
          size="sm"
          onClick={() => onCheckout(visitante)}
          className="w-full bg-red-600 hover:bg-red-700 text-white text-xs"
        >
          <LogOut size={14} className="mr-1" />
          Check-out
        </Button>
      )}

      {visitante.status === "pendente" && (
        <div className="text-xs font-semibold text-amber-700 bg-white/50 rounded px-2 py-1 text-center">
          Aguardando aprovação
        </div>
      )}
    </div>
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

  useEffect(() => {
    fetchVisitantes();
    const interval = setInterval(fetchVisitantes, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  async function fetchVisitantes() {
    try {
      setLoading(true);
      const response = await api.get('/portaria/visitantes-presentes');

      if (response.sucesso && response.data) {
        setVisitantes(response.data);
        const dentro = response.data.filter(v => v.status === "ativo").length;
        const saidas_hoje = response.data.filter(v => v.status === "saida").length;
        const pendentes = response.data.filter(v => v.status === "pendente").length;

        setStats({ dentro, saidas_hoje, pendentes });
      }
    } catch (error) {
      console.error("Erro ao carregar visitantes:", error);
    } finally {
      setLoading(false);
    }
  }

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header Operacional */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-6 rounded-b-2xl shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Portaria</h1>
          <p className="text-primary-foreground/80 text-sm">Controle de entrada e saída de visitantes</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Cards de Status - Estilo Operacional */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-green-700 uppercase">Dentro</p>
                <p className="text-3xl font-bold text-green-700 mt-1">{stats.dentro}</p>
              </div>
              <Users size={32} className="text-green-300" />
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-blue-700 uppercase">Saídas Hoje</p>
                <p className="text-3xl font-bold text-blue-700 mt-1">{stats.saidas_hoje}</p>
              </div>
              <LogOut size={32} className="text-blue-300" />
            </div>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-amber-700 uppercase">Pendentes</p>
                <p className="text-3xl font-bold text-amber-700 mt-1">{stats.pendentes}</p>
              </div>
              <Clock size={32} className="text-amber-300" />
            </div>
          </div>
        </div>

        {/* Barra de Ação */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Buscar por nome, CPF ou empresa..."
              className="pl-10 h-11 text-sm"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            {busca && (
              <button
                onClick={() => setBusca("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <Button
            onClick={() => setModalAberto(true)}
            className="bg-green-600 hover:bg-green-700 text-white h-11 px-6 text-sm font-semibold"
          >
            <Plus size={18} className="mr-2" />
            Novo Visitante
          </Button>
        </div>

        {/* Filtros de Status */}
        <div className="flex gap-2 flex-wrap">
          {["Todos", "ativo", "saida", "pendente"].map((status) => (
            <button
              key={status}
              onClick={() => setFiltroStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filtroStatus === status
                  ? "bg-primary text-white shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {status === "ativo" ? "Dentro" : status === "saida" ? "Saída" : status === "pendente" ? "Pendentes" : "Todos"}
            </button>
          ))}
        </div>

        {/* Visitantes - Grid Operacional */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="animate-spin mb-3" size={32} />
            <span className="text-sm">Carregando visitantes...</span>
          </div>
        ) : visitantesFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <AlertTriangle size={32} className="mb-3 opacity-50" />
            <span className="text-sm">Nenhum visitante encontrado</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visitantesFiltrados.map((v) => (
              <CartaoVisitante
                key={v.id}
                visitante={v}
                onCheckout={handleCheckout}
              />
            ))}
          </div>
        )}

        {/* Informação de Registros */}
        {!loading && visitantesFiltrados.length > 0 && (
          <div className="text-center text-xs text-muted-foreground py-4">
            Exibindo {visitantesFiltrados.length} de {visitantes.length} visitante(s)
          </div>
        )}
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
    </div>
  );
}
