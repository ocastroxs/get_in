'use client';

import { useState, useEffect } from 'react';
import {
  User,
  Lock,
  Bell,
  Palette,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  LogOut,
  Trash2,
  AlertCircle,
  Check,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/lib/AuthContext';

export default function ConfiguracoesPage() {
  const { user, logout } = useAuth();
  const [abaAtiva, setAbaAtiva] = useState('perfil');
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estado de Perfil
  const [perfil, setPerfil] = useState({
    nome: user?.nome || 'Administrador',
    email: user?.email || 'admin@getin.com',
    telefone: user?.telefone || '(11) 98765-4321',
    departamento: user?.departamento || 'Administração',
    funcao: user?.funcao || 'Administrador do Sistema',
    dataAdmissao: user?.dataAdmissao || '2024-01-15',
  });

  // Estado de Segurança
  const [seguranca, setSeguranca] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: '',
    autenticacaoDois: true,
    sessoesCodigo: false,
  });

  // Estado de Notificações
  const [notificacoes, setNotificacoes] = useState({
    emailNovoVisitante: true,
    emailCheckIn: true,
    emailAlerta: true,
    emailRelatorio: false,
    pushNotificacoes: true,
    pushAlertas: true,
    smsAlertas: false,
  });

  // Estado de Preferências
  const [preferencias, setPreferencias] = useState({
    tema: 'claro',
    idioma: 'pt-BR',
    formatoData: 'DD/MM/YYYY',
    formatoHora: '24h',
    notificacoesAudio: true,
    notificacoesDesktop: true,
  });

  const handleSalvarPerfil = async () => {
    setLoading(true);
    try {
      // Simular chamada à API
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSucesso(true);
      setTimeout(() => setSucesso(false), 3000);
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSalvarSeguranca = async () => {
    if (seguranca.novaSenha !== seguranca.confirmarSenha) {
      alert('As senhas não coincidem!');
      return;
    }
    if (seguranca.novaSenha.length < 8) {
      alert('A nova senha deve ter no mínimo 8 caracteres!');
      return;
    }

    setLoading(true);
    try {
      // Simular chamada à API
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSucesso(true);
      setSeguranca({
        senhaAtual: '',
        novaSenha: '',
        confirmarSenha: '',
        autenticacaoDois: seguranca.autenticacaoDois,
        sessoesCodigo: seguranca.sessoesCodigo,
      });
      setTimeout(() => setSucesso(false), 3000);
    } catch (error) {
      console.error('Erro ao salvar segurança:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSalvarNotificacoes = async () => {
    setLoading(true);
    try {
      // Simular chamada à API
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSucesso(true);
      setTimeout(() => setSucesso(false), 3000);
    } catch (error) {
      console.error('Erro ao salvar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSalvarPreferencias = async () => {
    setLoading(true);
    try {
      // Simular chamada à API
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSucesso(true);
      setTimeout(() => setSucesso(false), 3000);
    } catch (error) {
      console.error('Erro ao salvar preferências:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (confirm('Tem certeza que deseja sair do sistema?')) {
      logout();
    }
  };

  const handleExcluirConta = () => {
    if (confirm('ATENÇÃO: Esta ação é irreversível! Deseja realmente excluir sua conta?')) {
      alert('Solicitação de exclusão enviada. Você será contatado em breve.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground">Gerencie sua conta, segurança e preferências do sistema.</p>
      </div>

      {/* Mensagem de Sucesso */}
      {sucesso && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
          <Check className="w-5 h-5 text-green-600" />
          <p className="text-sm font-medium text-green-700">Alterações salvas com sucesso!</p>
        </div>
      )}

      {/* Abas */}
      <div className="flex gap-2 border-b border-border overflow-x-auto pb-0">
        <TabButton
          active={abaAtiva === 'perfil'}
          onClick={() => setAbaAtiva('perfil')}
          icon={<User size={16} />}
          label="Perfil"
        />
        <TabButton
          active={abaAtiva === 'seguranca'}
          onClick={() => setAbaAtiva('seguranca')}
          icon={<Lock size={16} />}
          label="Segurança"
        />
        <TabButton
          active={abaAtiva === 'notificacoes'}
          onClick={() => setAbaAtiva('notificacoes')}
          icon={<Bell size={16} />}
          label="Notificações"
        />
        <TabButton
          active={abaAtiva === 'preferencias'}
          onClick={() => setAbaAtiva('preferencias')}
          icon={<Palette size={16} />}
          label="Preferências"
        />
      </div>

      {/* Conteúdo das Abas */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        {/* TAB: PERFIL */}
        {abaAtiva === 'perfil' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Avatar e Info Rápida */}
            <div className="flex items-start gap-6 pb-6 border-b border-border">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center text-2xl font-bold text-white">
                {perfil.nome.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground">{perfil.nome}</h2>
                <p className="text-sm text-muted-foreground">{perfil.funcao}</p>
                <p className="text-xs text-muted-foreground mt-1">ID: {user?.id || 'ADM-001'}</p>
              </div>
              <Button variant="outline" size="sm">
                Alterar Foto
              </Button>
            </div>

            {/* Formulário de Perfil */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Nome Completo</label>
                <Input
                  type="text"
                  value={perfil.nome}
                  onChange={(e) => setPerfil({ ...perfil, nome: e.target.value })}
                  placeholder="Seu nome completo"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <Input
                  type="email"
                  value={perfil.email}
                  onChange={(e) => setPerfil({ ...perfil, email: e.target.value })}
                  placeholder="seu.email@getin.com"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Telefone</label>
                <Input
                  type="tel"
                  value={perfil.telefone}
                  onChange={(e) => setPerfil({ ...perfil, telefone: e.target.value })}
                  placeholder="(11) 98765-4321"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Departamento</label>
                <Input
                  type="text"
                  value={perfil.departamento}
                  onChange={(e) => setPerfil({ ...perfil, departamento: e.target.value })}
                  placeholder="Seu departamento"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Função</label>
                <Input
                  type="text"
                  value={perfil.funcao}
                  disabled
                  className="w-full opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Data de Admissão</label>
                <Input
                  type="date"
                  value={perfil.dataAdmissao}
                  disabled
                  className="w-full opacity-50"
                />
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex items-center justify-between pt-6 border-t border-border">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setPerfil({
                    nome: user?.nome || 'Administrador',
                    email: user?.email || 'admin@getin.com',
                    telefone: user?.telefone || '(11) 98765-4321',
                    departamento: user?.departamento || 'Administração',
                    funcao: user?.funcao || 'Administrador do Sistema',
                    dataAdmissao: user?.dataAdmissao || '2024-01-15',
                  })}
                >
                  <RotateCcw size={14} />
                  Descartar
                </Button>
              </div>
              <Button
                size="sm"
                className="gap-2"
                onClick={handleSalvarPerfil}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* TAB: SEGURANÇA */}
        {abaAtiva === 'seguranca' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Alterar Senha */}
            <div className="space-y-4 pb-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Lock size={18} />
                Alterar Senha
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Senha Atual</label>
                  <Input
                    type="password"
                    value={seguranca.senhaAtual}
                    onChange={(e) => setSeguranca({ ...seguranca, senhaAtual: e.target.value })}
                    placeholder="Digite sua senha atual"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Nova Senha</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={seguranca.novaSenha}
                      onChange={(e) => setSeguranca({ ...seguranca, novaSenha: e.target.value })}
                      placeholder="Digite sua nova senha"
                      className="w-full pr-10"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Mínimo 8 caracteres, com letras e números</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Confirmar Nova Senha</label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={seguranca.confirmarSenha}
                      onChange={(e) => setSeguranca({ ...seguranca, confirmarSenha: e.target.value })}
                      placeholder="Confirme sua nova senha"
                      className="w-full pr-10"
                    />
                    <button
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Autenticação em Dois Fatores */}
            <div className="space-y-4 pb-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Shield size={18} />
                Autenticação em Dois Fatores
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={seguranca.autenticacaoDois}
                      onCheckedChange={(checked) =>
                        setSeguranca({ ...seguranca, autenticacaoDois: checked })
                      }
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">Autenticação por Código</p>
                      <p className="text-xs text-muted-foreground">Receba códigos por email ou SMS</p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${seguranca.autenticacaoDois ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {seguranca.autenticacaoDois ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={seguranca.sessoesCodigo}
                      onCheckedChange={(checked) =>
                        setSeguranca({ ...seguranca, sessoesCodigo: checked })
                      }
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">Gerar Códigos de Backup</p>
                      <p className="text-xs text-muted-foreground">Salve códigos para recuperação de conta</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Gerar
                  </Button>
                </div>
              </div>
            </div>

            {/* Sessões Ativas */}
            <div className="space-y-4 pb-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Sessões Ativas</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-foreground">Chrome • Windows</p>
                    <p className="text-xs text-muted-foreground">192.168.1.100 • Última atividade: agora</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-green-100 text-green-700">Atual</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-foreground">Safari • iPhone</p>
                    <p className="text-xs text-muted-foreground">192.168.1.50 • Última atividade: há 2 horas</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Encerrar
                  </Button>
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex items-center justify-between pt-6 border-t border-border">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setSeguranca({
                    senhaAtual: '',
                    novaSenha: '',
                    confirmarSenha: '',
                    autenticacaoDois: true,
                    sessoesCodigo: false,
                  })}
                >
                  <RotateCcw size={14} />
                  Descartar
                </Button>
              </div>
              <Button
                size="sm"
                className="gap-2"
                onClick={handleSalvarSeguranca}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* TAB: NOTIFICAÇÕES */}
        {abaAtiva === 'notificacoes' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Email */}
            <div className="space-y-4 pb-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Mail size={18} />
                Notificações por Email
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-foreground">Novo Visitante</p>
                    <p className="text-xs text-muted-foreground">Receba alertas quando um visitante for registrado</p>
                  </div>
                  <Checkbox
                    checked={notificacoes.emailNovoVisitante}
                    onCheckedChange={(checked) =>
                      setNotificacoes({ ...notificacoes, emailNovoVisitante: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-foreground">Check-in/Check-out</p>
                    <p className="text-xs text-muted-foreground">Notificações de entrada e saída de visitantes</p>
                  </div>
                  <Checkbox
                    checked={notificacoes.emailCheckIn}
                    onCheckedChange={(checked) =>
                      setNotificacoes({ ...notificacoes, emailCheckIn: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-foreground">Alertas de Segurança</p>
                    <p className="text-xs text-muted-foreground">Avisos de atividades suspeitas ou violações</p>
                  </div>
                  <Checkbox
                    checked={notificacoes.emailAlerta}
                    onCheckedChange={(checked) =>
                      setNotificacoes({ ...notificacoes, emailAlerta: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-foreground">Relatórios Semanais</p>
                    <p className="text-xs text-muted-foreground">Resumo semanal de atividades do sistema</p>
                  </div>
                  <Checkbox
                    checked={notificacoes.emailRelatorio}
                    onCheckedChange={(checked) =>
                      setNotificacoes({ ...notificacoes, emailRelatorio: checked })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Push */}
            <div className="space-y-4 pb-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Bell size={18} />
                Notificações Push
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-foreground">Notificações Gerais</p>
                    <p className="text-xs text-muted-foreground">Atividades importantes do sistema</p>
                  </div>
                  <Checkbox
                    checked={notificacoes.pushNotificacoes}
                    onCheckedChange={(checked) =>
                      setNotificacoes({ ...notificacoes, pushNotificacoes: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-foreground">Alertas Urgentes</p>
                    <p className="text-xs text-muted-foreground">Notificações de segurança em tempo real</p>
                  </div>
                  <Checkbox
                    checked={notificacoes.pushAlertas}
                    onCheckedChange={(checked) =>
                      setNotificacoes({ ...notificacoes, pushAlertas: checked })
                    }
                  />
                </div>
              </div>
            </div>

            {/* SMS */}
            <div className="space-y-4 pb-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Phone size={18} />
                Notificações por SMS
              </h3>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">Alertas Críticos</p>
                  <p className="text-xs text-muted-foreground">Apenas para situações de segurança crítica</p>
                </div>
                <Checkbox
                  checked={notificacoes.smsAlertas}
                  onCheckedChange={(checked) =>
                    setNotificacoes({ ...notificacoes, smsAlertas: checked })
                  }
                />
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex items-center justify-between pt-6 border-t border-border">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setNotificacoes({
                    emailNovoVisitante: true,
                    emailCheckIn: true,
                    emailAlerta: true,
                    emailRelatorio: false,
                    pushNotificacoes: true,
                    pushAlertas: true,
                    smsAlertas: false,
                  })}
                >
                  <RotateCcw size={14} />
                  Descartar
                </Button>
              </div>
              <Button
                size="sm"
                className="gap-2"
                onClick={handleSalvarNotificacoes}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* TAB: PREFERÊNCIAS */}
        {abaAtiva === 'preferencias' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Aparência */}
            <div className="space-y-4 pb-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Palette size={18} />
                Aparência
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Tema</label>
                  <select
                    value={preferencias.tema}
                    onChange={(e) => setPreferencias({ ...preferencias, tema: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="claro">Claro</option>
                    <option value="escuro">Escuro</option>
                    <option value="auto">Automático (conforme sistema)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Idioma</label>
                  <select
                    value={preferencias.idioma}
                    onChange={(e) => setPreferencias({ ...preferencias, idioma: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en-US">English (United States)</option>
                    <option value="es-ES">Español (España)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Data e Hora */}
            <div className="space-y-4 pb-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Calendar size={18} />
                Data e Hora
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Formato de Data</label>
                  <select
                    value={preferencias.formatoData}
                    onChange={(e) => setPreferencias({ ...preferencias, formatoData: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Formato de Hora</label>
                  <select
                    value={preferencias.formatoHora}
                    onChange={(e) => setPreferencias({ ...preferencias, formatoHora: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="24h">24 horas (14:30)</option>
                    <option value="12h">12 horas (2:30 PM)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Som e Desktop */}
            <div className="space-y-4 pb-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Experiência</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-foreground">Som em Notificações</p>
                    <p className="text-xs text-muted-foreground">Reproduzir som ao receber notificações</p>
                  </div>
                  <Checkbox
                    checked={preferencias.notificacoesAudio}
                    onCheckedChange={(checked) =>
                      setPreferencias({ ...preferencias, notificacoesAudio: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-foreground">Notificações Desktop</p>
                    <p className="text-xs text-muted-foreground">Mostrar notificações na área de trabalho</p>
                  </div>
                  <Checkbox
                    checked={preferencias.notificacoesDesktop}
                    onCheckedChange={(checked) =>
                      setPreferencias({ ...preferencias, notificacoesDesktop: checked })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex items-center justify-between pt-6 border-t border-border">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setPreferencias({
                    tema: 'claro',
                    idioma: 'pt-BR',
                    formatoData: 'DD/MM/YYYY',
                    formatoHora: '24h',
                    notificacoesAudio: true,
                    notificacoesDesktop: true,
                  })}
                >
                  <RotateCcw size={14} />
                  Descartar
                </Button>
              </div>
              <Button
                size="sm"
                className="gap-2"
                onClick={handleSalvarPreferencias}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Zona de Perigo */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-900 mb-2">Zona de Perigo</h3>
            <p className="text-sm text-red-700 mb-4">Estas ações são irreversíveis. Use com cautela.</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut size={14} />
                Sair do Sistema
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleExcluirConta}
              >
                <Trash2 size={14} />
                Excluir Conta
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Componentes Auxiliares ─────────────────────────────────────────────────

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm transition-all duration-200 whitespace-nowrap ${
        active
          ? 'text-primary border-b-2 border-primary'
          : 'text-muted-foreground hover:text-foreground border-b-2 border-transparent'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
