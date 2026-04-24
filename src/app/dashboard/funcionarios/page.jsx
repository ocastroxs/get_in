"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Users, Search, Filter, X, Download, Plus,
  ChevronDown, Check, Shield, User, Eye, Star,
  Mail, Phone, CreditCard, Building2, Briefcase,
  Trash2, Edit, MoreVertical, Loader2
} from "lucide-react";
import Topbar from "@/components/Topbar";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { FUNCIONARIOS_MOCK } from "@/lib/mockData";

// ─── helpers ────────────────────────────────────────────────────────────────

const TIPO_LABEL = {
  func: "Funcionário",
  port: "Portaria",
  sup: "Supervisor",
  ger: "Gerente"
};

const TIPO_STYLE = {
  func: "bg-purple-100 text-purple-700",
  port: "bg-blue-100 text-blue-700",
  sup: "bg-green-100 text-green-700",
  ger: "bg-orange-100 text-orange-700",
};

const TIPO_ICON = {
  func: <User size={14} />,
  port: <Shield size={14} />,
  sup: <Eye size={14} />,
  ger: <Star size={14} />,
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

// ─── Linha da Tabela ─────────────────────────────────────────────────────────

function LinhaFuncionario({ f, index }) {
  return (
    <tr className="border-b border-border hover:bg-accent/40 transition-all animate-in fade-in slide-in-from-left-2 duration-500" style={{ animationDelay: `${index * 50}ms` }}>
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
            {f.nome.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-sm text-foreground whitespace-nowrap">{f.nome}</div>
            <div className="text-[11px] text-muted-foreground font-mono">{f.cpf}</div>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Mail size={12} /> {f.email}
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
          {TIPO_LABEL[f.tipo] || f.tipo}
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

// ─── Página principal ────────────────────────────────────────────────────────

export default function FuncionariosPage() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("Todos");

  useEffect(() => {
    async function fetchFuncionarios() {
      try {
        setLoading(true);
        // O endpoint /user/read retorna todos os usuários (incluindo funcionários)
        const data = await api.get('/user/read');
        
        if (data && data.sucesso && Array.isArray(data.dados)) {
          // Filtrar apenas quem não é visitante (ou mostrar todos se preferir)
          // No contexto de "Funcionários", geralmente queremos quem tem acesso ao sistema
          const lista = data.dados.map(u => ({
            ...u,
            departamento: u.departamento_nome || u.departamento || "Geral"
          }));
          setFuncionarios(lista);
        } else {
          // Fallback para dados de simulação
          setFuncionarios(FUNCIONARIOS_MOCK);
        }
      } catch (error) {
        console.error('Erro ao buscar funcionários:', error);
        // Fallback para dados de simulação em caso de erro
        setFuncionarios(FUNCIONARIOS_MOCK);
      } finally {
        setLoading(false);
      }
    }
    fetchFuncionarios();
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Funcionários</h1>
          <p className="text-sm text-muted-foreground">Gerencie os colaboradores e níveis de acesso do sistema.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => downloadCSV(filtrados)}>
            <Download size={16} /> Exportar
          </Button>
          <Button size="sm" className="gap-2" onClick={() => window.location.href = '/registrarFuncionario'}>
            <Plus size={16} /> Novo Funcionário
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Colaboradores" value={stats.total} icon={<Users size={20} className="text-primary" />} accentVar="var(--primary)" />
        <StatCard label="Gerentes" value={stats.gerentes} valueClassName="text-chart-4" icon={<Star size={20} className="text-chart-4" />} accentVar="var(--chart-4)" />
        <StatCard label="Supervisores" value={stats.supervisores} valueClassName="text-chart-2" icon={<Eye size={20} className="text-chart-2" />} accentVar="var(--chart-2)" />
        <StatCard label="Portaria" value={stats.portaria} valueClassName="text-chart-3" icon={<Shield size={20} className="text-chart-3" />} accentVar="var(--chart-3)" />
      </div>

      {/* Filtros */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Buscar por nome, CPF ou email..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <div className="flex items-center gap-1 mr-2 text-xs font-medium text-muted-foreground">
              <Filter size={14} /> Filtrar:
            </div>
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
            { (busca || filtroTipo !== "Todos") && (
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

      {/* Tabela */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Funcionário</th>
                <th className="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contato</th>
                <th className="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Departamento</th>
                <th className="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nível de Acesso</th>
                <th className="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Ações</th>
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
                filtrados.map((f, i) => (
                  <LinhaFuncionario key={f.id || i} f={f} index={i} />
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
