"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Users, Search, X, Download, Plus,
  Check, Shield, User, Eye, Star,
  Mail, Phone, Building2, Briefcase,
  Trash2, Edit, Loader2, Filter
} from "lucide-react";
import StatCard from "@/components/StatCard";
import Topbar from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ModalFiltro from "@/components/ui/ModalFiltro";
import { api } from "@/services/api";

// ─── HELPERS & CONFIG ────────────────────────────────────────────────────────

const TIPO_LABEL = {
  func: "Funcionário",
  port: "Portaria",
  sup: "Supervisor",
  ger: "Gerente",
  adm: "Administrador"
};

const TIPO_STYLE = {
  func: "bg-purple-100 text-purple-700",
  port: "bg-blue-100 text-blue-700",
  sup: "bg-green-100 text-green-700",
  ger: "bg-orange-100 text-orange-700",
  adm: "bg-red-100 text-red-700",
};

const TIPO_ICON = {
  func: <User size={14} />,
  port: <Shield size={14} />,
  sup: <Eye size={14} />,
  ger: <Star size={14} />,
  adm: <Briefcase size={14} />,
};

function toCSV(rows) {
  const cols = ["Nome", "CPF", "Email", "Telefone", "Departamento", "Tipo"];
  const lines = rows.map((r) =>
    [r.nome, r.cpf, r.email, r.celular || r.telefone || "—", r.departamento || "—", TIPO_LABEL[r.tipo] || r.tipo].join(";")
  );
  return [cols.join(";"), ...lines].join("\n");
}

function downloadCSV(data) {
  const blob = new Blob([toCSV(data)], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = "funcionarios.csv"; a.click();
  URL.revokeObjectURL(url);
}

// ─── LINHA DA TABELA ─────────────────────────────────────────────────────────

function LinhaFuncionario({ f }) {
  if (!f || !f.nome) return null;
  
  return (
    <tr className="border-b border-border transition-colors duration-300 hover:bg-primary/[0.035]">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
            {(f.nome || "?").charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-sm text-foreground whitespace-nowrap">{f.nome || "Sem nome"}</div>
            <div className="text-[11px] text-muted-foreground font-mono">{f.cpf || "—"}</div>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Mail size={12} /> {f.email || "—"}
          </div>
          {f.celular && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Phone size={12} /> {f.celular}
            </div>
          )}
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1.5 text-sm text-foreground">
          <Building2 size={14} className="text-muted-foreground" />
          {f.departamento || "Geral"}
        </div>
      </td>
      <td className="py-3 px-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${TIPO_STYLE[f.tipo] || "bg-gray-100 text-gray-700"}`}>
          {TIPO_ICON[f.tipo] || <User size={14} />}
          {TIPO_LABEL[f.tipo] || f.tipo || "Sem tipo"}
        </span>
      </td>
      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button className="rounded-xl p-2 text-muted-foreground transition-all duration-300 hover:bg-primary/8 hover:text-primary">
            <Edit size={16} />
          </button>
          <button className="rounded-xl p-2 text-muted-foreground transition-all duration-300 hover:bg-destructive/8 hover:text-destructive">
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────

export default function FuncionariosPage() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
  const [tempFiltroTipo, setTempFiltroTipo] = useState("Todos");

  const carregarFuncionarios = async () => {
    setLoading(true);
    try {
      const response = await api.get('/func');
      if (response.sucesso) {
        setFuncionarios(response.data || []);
      }
    } catch (error) {
      console.error("Erro ao carregar funcionários:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarFuncionarios();
  }, []);

  const filtrados = useMemo(() => {
    return funcionarios.filter((f) => {
      const matchTipo = filtroTipo === "Todos" || f.tipo === filtroTipo;
      const matchBusca = busca.trim() === "" ||
        f.nome.toLowerCase().includes(busca.toLowerCase()) ||
        f.cpf.includes(busca) ||
        f.email.toLowerCase().includes(busca.toLowerCase());
      return matchTipo && matchBusca;
    });
  }, [funcionarios, filtroTipo, busca]);

  const stats = useMemo(() => ({
    total: funcionarios.length,
    gerentes: funcionarios.filter(f => f.tipo === 'ger').length,
    supervisores: funcionarios.filter(f => f.tipo === 'sup').length,
    portaria: funcionarios.filter(f => f.tipo === 'port').length,
  }), [funcionarios]);

  const aplicarFiltros = () => {
    setFiltroTipo(tempFiltroTipo);
  };

  const limparFiltros = () => {
    setTempFiltroTipo("Todos");
    setFiltroTipo("Todos");
    setBusca("");
  };

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-700">
      <Topbar
        title="Dashboard Funcionários"
        subtitle="Gestão de colaboradores e níveis de acesso do sistema"
        secondaryButtonText="Exportar CSV"
        onSecondaryButtonClick={() => downloadCSV(filtrados)}
        buttonText="Novo Funcionário"
        onButtonClick={() => window.location.href = '/dashboard/funcionarios/registrarFuncionario'}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Total"
          value={stats.total}
          valueClassName="text-primary"
          icon={<Users size={17} className="text-primary" />}
          sub="colaboradores"
          accentVar="var(--primary)"
        />
        <StatCard
          label="Gerentes"
          value={stats.gerentes}
          valueClassName="text-foreground"
          icon={<Star size={17} className="text-foreground" />}
          sub="liderança"
          accentVar="var(--chart-4)"
        />
        <StatCard
          label="Supervisores"
          value={stats.supervisores}
          valueClassName="text-secondary"
          icon={<Eye size={17} className="text-secondary" />}
          sub="supervisão"
          accentVar="var(--chart-2)"
        />
        <StatCard
          label="Portaria"
          value={stats.portaria}
          valueClassName="text-primary"
          icon={<Shield size={17} className="text-primary" />}
          sub="acesso"
          accentVar="var(--primary)"
        />
      </div>

      {/* Barra de Filtros Padronizada */}
      <div className="bg-card border border-border rounded-[24px] p-5 shadow-md">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 items-center gap-3 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Buscar por nome, CPF ou email..."
                className="pl-10 h-11 rounded-xl border-border/60 bg-background/80 text-sm transition-all duration-300 focus-visible:border-primary/40 focus-visible:ring-primary/20"
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
              className="h-11 px-4 gap-2 rounded-xl border-border/60 bg-background/80 transition-all duration-300 hover:border-primary/20 hover:bg-white hover:shadow-sm"
            >
              <Filter size={16} />
              <span className="hidden sm:inline">Filtros</span>
              {filtroTipo !== "Todos" && (
                <span className="ml-1 w-5 h-5 rounded-full bg-primary text-[10px] flex items-center justify-center text-primary-foreground">
                  1
                </span>
              )}
            </Button>
          </div>

          <div className="px-3 py-2 rounded-xl bg-muted/40 border border-border/50 text-[11px] font-semibold text-muted-foreground">
            {filtrados.length} resultado(s)
          </div>
        </div>

        {(filtroTipo !== "Todos" || busca) && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border/40">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">Filtros ativos:</span>
            {busca && (
              <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
                Busca: {busca}
              </span>
            )}
            {filtroTipo !== "Todos" && (
              <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
                Nível: {TIPO_LABEL[filtroTipo] || filtroTipo}
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

      <div className="bg-card border border-border rounded-[24px] overflow-hidden shadow-md">
        <div className="p-4 border-b border-border bg-muted/20">
          <h3 className="font-bold text-sm">Listagem de Colaboradores</h3>
          <p className="text-xs text-muted-foreground">Gerenciamento de acessos</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-muted/40 border-b border-border text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-4">Funcionário</th>
                <th className="py-3 px-4">Contato</th>
                <th className="py-3 px-4">Departamento</th>
                <th className="py-3 px-4">Nível de Acesso</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      <p className="text-sm text-muted-foreground">Carregando funcionários...</p>
                    </div>
                  </td>
                </tr>
              ) : filtrados.length > 0 ? (
                filtrados.map((f) => (
                  <LinhaFuncionario key={f.id} f={f} />
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="w-12 h-12 text-muted/30" />
                      <p className="text-sm text-muted-foreground">Nenhum funcionário encontrado.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border bg-muted/20 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Mostrando <strong>{filtrados.length}</strong> de <strong>{funcionarios.length}</strong> funcionários
          </p>
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
              Nível de Acesso
            </label>
            <div className="grid grid-cols-1 gap-2">
              {["Todos", "ger", "sup", "port", "func"].map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => setTempFiltroTipo(tipo)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all border ${
                    tempFiltroTipo === tipo
                      ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                      : "bg-background text-muted-foreground border-border/60 hover:border-primary/30 hover:bg-muted/40"
                  }`}
                >
                  <span>{tipo === "Todos" ? "Todos os Níveis" : TIPO_LABEL[tipo]}</span>
                  {tempFiltroTipo === tipo && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
            <p className="text-[10px] text-purple-600 leading-relaxed">
              <strong>Info:</strong> Filtrar por nível de acesso ajuda a gerenciar permissões e visualizar grupos específicos de colaboradores.
            </p>
          </div>
        </div>
      </ModalFiltro>
    </div>
  );
}
