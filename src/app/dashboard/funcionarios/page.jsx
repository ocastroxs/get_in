"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Users, Search, X, Download, Plus,
  Check, Shield, User, Eye, Star,
  Mail, Phone, Building2, Briefcase,
  Trash2, Edit, Loader2
} from "lucide-react";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
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
    <tr className="border-b border-border hover:bg-accent/40 transition-colors">
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
          <button className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
            <Edit size={16} />
          </button>
          <button className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
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

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Dashboard Funcionários</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Gestão de colaboradores e níveis de acesso do sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadCSV(filtrados)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            <Download size={16} /> Exportar
          </button>
          <button
            onClick={() => window.location.href = '/dashboard/funcionarios/registrarFuncionario'}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} /> Novo Funcionário
          </button>
        </div>
      </header>

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
          valueClassName="text-orange-600"
          icon={<Star size={17} className="text-orange-600" />}
          sub="liderança"
          accentVar="var(--orange-500)"
        />
        <StatCard
          label="Supervisores"
          value={stats.supervisores}
          valueClassName="text-green-600"
          icon={<Eye size={17} className="text-green-600" />}
          sub="supervisão"
          accentVar="var(--green-500)"
        />
        <StatCard
          label="Portaria"
          value={stats.portaria}
          valueClassName="text-blue-600"
          icon={<Shield size={17} className="text-blue-600" />}
          sub="acesso"
          accentVar="var(--blue-500)"
        />
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              placeholder="Buscar por nome, CPF ou email..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            {["Todos", "ger", "sup", "port", "func"].map((tipo) => (
              <button
                key={tipo}
                onClick={() => setFiltroTipo(tipo)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  filtroTipo === tipo
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {tipo === "Todos" ? "Todos" : TIPO_LABEL[tipo]}
              </button>
            ))}
            {(busca || filtroTipo !== "Todos") && (
              <button 
                onClick={() => { setBusca(""); setFiltroTipo("Todos"); }}
                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                title="Limpar filtros"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                <th className="py-3 px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Funcionário</th>
                <th className="py-3 px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Contato</th>
                <th className="py-3 px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Departamento</th>
                <th className="py-3 px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Nível de Acesso</th>
                <th className="py-3 px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest text-right">Ações</th>
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
    </div>
  );
}
