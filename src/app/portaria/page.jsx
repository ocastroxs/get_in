"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Users, Clock, LogOut, AlertTriangle, Search, X, Plus,
  CheckCircle2, XCircle, Loader2, Download, QrCode, Phone, MapPin, Building2, Calendar, Eye, EyeOff
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

  const tempoPermanen = Math.round((new Date() - new Date(visitante.dataEntrada)) / 60000);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl border border-border w-full max-w-md shadow-lg animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Check-out</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
          >
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-muted/40 rounded-lg p-3 space-y-3">
            <div className="flex items-start gap-2">
              <Users size={16} className="text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Visitante</p>
                <p className="text-sm font-medium text-foreground">{visitante.nome}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Building2 size={16} className="text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Empresa</p>
                <p className="text-sm font-medium text-foreground">{visitante.empresa}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock size={16} className="text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Tempo de Permanência</p>
                <p className="text-sm font-medium text-foreground">{tempoPermanen} minutos</p>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              Observações
            </label>
            <textarea
              placeholder="Adicione observações sobre a visita (opcional)"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none"
              rows="3"
            />
          </div>
        </div>

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

// ─── CARTÃO DE VISITANTE ─────────────────────────────────────────────────────
function CartaoVisitante({ visitante, onCheckout }) {
  const statusClass = STATUS_STYLE[visitante.status] || STATUS_STYLE.ativo;
  const dotClass = STATUS_DOT[visitante.status] || STATUS_DOT.ativo;

  return (
    <div className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{visitante.nome}</h3>
          <p className="text-xs text-muted-foreground">{visitante.cpf}</p>
        </div>
        <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${statusClass}`}>
          {STATUS_LABEL[visitante.status]}
        </span>
      </div>

      <div className="space-y-2 mb-4 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Building2 size={14} />
          <span>{visitante.empresa}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin size={14} />
          <span>{visitante.setor}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock size={14} />
          <span>{visitante.dataEntrada}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="flex-1 text-xs">
          <QrCode size={12} className="mr-1" />
          Crachá
        </Button>
        {visitante.status === "ativo" && (
          <Button
            size="sm"
            onClick={() => onCheckout(visitante)}
            className="flex-1 text-xs bg-red-600 hover:bg-red-700"
          >
            <LogOut size={12} className="mr-1" />
            Saída
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── PÁGINA PRINCIPAL ────────────────────────────────────────────────────────
export default function PortariaPage() {
  const [visitantes, setVisitantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
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

      if (response && typeof response === 'object' && response.sucesso && response.data) {
        setVisitantes(response.data);
      } else if (!response || typeof response !== 'object') {
        console.warn("Back-end não está pronto. Exibindo lista vazia.");
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

  function handleConfirmacao() {
    fetchVisitantes();
  }

  return (
    <>
      <Topbar
        title="Operação Portaria"
        subtitle="Gerenciamento de entrada e saída de visitantes"
      />

      {/* Botão Flutuante para Novo Visitante */}
      <div className="fixed bottom-6 right-6 z-40">
        <Link href="/portaria/novo">
          <Button className="rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
            <Plus size={24} />
          </Button>
        </Link>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard
          label="Visitantes Presentes"
          value={visitantes.filter(v => v.status === "ativo").length}
          icon={<Users size={20} className="text-blue-600" />}
        />
        <StatCard
          label="Aguardando Aprovação"
          value={visitantes.filter(v => v.status === "pendente").length}
          icon={<AlertTriangle size={20} className="text-amber-600" />}
        />
        <StatCard
          label="Saídas Hoje"
          value={visitantes.filter(v => v.status === "saida").length}
          icon={<LogOut size={20} className="text-green-600" />}
        />
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="bg-card border border-border rounded-xl p-4 mb-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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

          <div className="flex flex-wrap items-center gap-2">
            {["Todos", "Ativo", "Pendente", "Saida"].map((status) => (
              <button
                key={status}
                onClick={() => setFiltroStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filtroStatus === status
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid de Visitantes */}
      <div>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="animate-spin mb-2" size={24} />
            <span className="text-sm">Carregando visitantes...</span>
          </div>
        ) : visitantesFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Users className="mb-2 opacity-50" size={32} />
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
      </div>

      {/* Modal de Check-out */}
      <ModalCheckout
        isOpen={modalCheckoutAberto}
        onClose={() => setModalCheckoutAberto(false)}
        visitante={visitanteSelecionado}
        onConfirm={handleConfirmacao}
      />
    </>
  );
}
