"use client";

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
import UserAvatar from '@/components/ui/UserAvatar';
import { api } from '@/services/api';

export default function ConfiguracoesPage() {
  const { user } = useAuth();
  const [abaAtiva, setAbaAtiva] = useState('perfil');
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estado de Perfil
  const [perfil, setPerfil] = useState({
    nome: user?.nome || 'Usuário',
    email: user?.email || 'usuario@getin.com',
    telefone: user?.telefone || '',
    departamento: user?.departamento || '',
    funcao: user?.funcao || 'Usuário do Sistema',
    dataAdmissao: user?.dataAdmissao || '',
  });

  const [perfilOriginal, setPerfilOriginal] = useState(perfil);

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

  const [notificacoesOriginal, setNotificacoesOriginal] = useState(notificacoes);

  // Estado de Preferências
  const [preferencias, setPreferencias] = useState({
    tema: 'claro',
    idioma: 'pt-BR',
    formatoData: 'DD/MM/YYYY',
    formatoHora: '24h',
    notificacoesAudio: true,
    notificacoesDesktop: true,
  });

  const [preferenciasOriginal, setPreferenciasOriginal] = useState(preferencias);

  // Carrega configurações do usuário ao montar
  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  const carregarConfiguracoes = async () => {
    try {
      // 🔌 Endpoints futuros: /user/settings ou /configuracoes
      // Por enquanto, usamos dados do usuário autenticado
      if (user) {
        const novosPerfil = {
          nome: user.nome || 'Usuário',
          email: user.email || 'usuario@getin.com',
          telefone: user.telefone || '',
          departamento: user.departamento || '',
          funcao: user.funcao || 'Usuário do Sistema',
          dataAdmissao: user.dataAdmissao || '',
        };
        setPerfil(novosPerfil);
        setPerfilOriginal(novosPerfil);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const handleSalvarPerfil = async () => {
    setLoading(true);
    try {
      // 🔌 Endpoint futuro: PUT /user/profile
      const response = await api.put('/user/profile', {
        nome: perfil.nome,
        email: perfil.email,
        telefone: perfil.telefone,
        departamento: perfil.departamento,
      });

      if (response.sucesso) {
        setSucesso(true);
        setPerfilOriginal(perfil);
        setTimeout(() => setSucesso(false), 3000);
      } else {
        alert('Erro ao salvar perfil. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      alert('Erro ao salvar perfil. Tente novamente.');
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
      // 🔌 Endpoint futuro: PUT /user/password
      const response = await api.put('/user/password', {
        senhaAtual: seguranca.senhaAtual,
        novaSenha: seguranca.novaSenha,
      });

      if (response.sucesso) {
        setSucesso(true);
        setSeguranca({
          senhaAtual: '',
          novaSenha: '',
          confirmarSenha: '',
          autenticacaoDois: seguranca.autenticacaoDois,
          sessoesCodigo: seguranca.sessoesCodigo,
        });
        setTimeout(() => setSucesso(false), 3000);
      } else {
        alert('Erro ao alterar senha. Verifique sua senha atual.');
      }
    } catch (error) {
      console.error('Erro ao salvar segurança:', error);
      alert('Erro ao alterar senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSalvarNotificacoes = async () => {
    setLoading(true);
    try {
      // 🔌 Endpoint futuro: PUT /user/notifications
      const response = await api.put('/user/notifications', notificacoes);

      if (response.sucesso) {
        setSucesso(true);
        setNotificacoesOriginal(notificacoes);
        setTimeout(() => setSucesso(false), 3000);
      } else {
        alert('Erro ao salvar notificações. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao salvar notificações:', error);
      alert('Erro ao salvar notificações. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSalvarPreferencias = async () => {
    setLoading(true);
    try {
      // 🔌 Endpoint futuro: PUT /user/preferences
      const response = await api.put('/user/preferences', preferencias);

      if (response.sucesso) {
        setSucesso(true);
        setPreferenciasOriginal(preferencias);
        setTimeout(() => setSucesso(false), 3000);
      } else {
        alert('Erro ao salvar preferências. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao salvar preferências:', error);
      alert('Erro ao salvar preferências. Tente novamente.');
    } finally {
      setLoading(false);
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
              <UserAvatar 
                name={perfil.nome} 
                email={perfil.email} 
                className="w-20 h-20 text-2xl" 
              />
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground">{perfil.nome}</h2>
                <p className="text-sm text-muted-foreground">{perfil.funcao}</p>
              </div>
              <Button variant="outline" size="sm" disabled>
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
                  onClick={() => setPerfil(perfilOriginal)}
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
                    Alterar Senha
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* TAB: NOTIFICAÇÕES */}
        {abaAtiva === 'notificacoes' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Mail size={18} />
                Notificações por Email
              </h3>
              <div className="space-y-3">
                <CheckboxItem
                  label="Novo visitante registrado"
                  checked={notificacoes.emailNovoVisitante}
                  onChange={(checked) => setNotificacoes({ ...notificacoes, emailNovoVisitante: checked })}
                />
                <CheckboxItem
                  label="Check-in/Check-out"
                  checked={notificacoes.emailCheckIn}
                  onChange={(checked) => setNotificacoes({ ...notificacoes, emailCheckIn: checked })}
                />
                <CheckboxItem
                  label="Alertas de segurança"
                  checked={notificacoes.emailAlerta}
                  onChange={(checked) => setNotificacoes({ ...notificacoes, emailAlerta: checked })}
                />
                <CheckboxItem
                  label="Relatórios periódicos"
                  checked={notificacoes.emailRelatorio}
                  onChange={(checked) => setNotificacoes({ ...notificacoes, emailRelatorio: checked })}
                />
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-border">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Bell size={18} />
                Notificações Push
              </h3>
              <div className="space-y-3">
                <CheckboxItem
                  label="Notificações gerais"
                  checked={notificacoes.pushNotificacoes}
                  onChange={(checked) => setNotificacoes({ ...notificacoes, pushNotificacoes: checked })}
                />
                <CheckboxItem
                  label="Alertas críticos"
                  checked={notificacoes.pushAlertas}
                  onChange={(checked) => setNotificacoes({ ...notificacoes, pushAlertas: checked })}
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
                  onClick={() => setNotificacoes(notificacoesOriginal)}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Tema</label>
                <select
                  value={preferencias.tema}
                  onChange={(e) => setPreferencias({ ...preferencias, tema: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                >
                  <option value="claro">Claro</option>
                  <option value="escuro">Escuro</option>
                  <option value="auto">Automático</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Idioma</label>
                <select
                  value={preferencias.idioma}
                  onChange={(e) => setPreferencias({ ...preferencias, idioma: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (USA)</option>
                  <option value="es-ES">Español (España)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Formato de Data</label>
                <select
                  value={preferencias.formatoData}
                  onChange={(e) => setPreferencias({ ...preferencias, formatoData: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
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
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                >
                  <option value="24h">24 horas</option>
                  <option value="12h">12 horas (AM/PM)</option>
                </select>
              </div>
            </div>

            <div className="space-y-3 pt-6 border-t border-border">
              <CheckboxItem
                label="Som nas notificações"
                checked={preferencias.notificacoesAudio}
                onChange={(checked) => setPreferencias({ ...preferencias, notificacoesAudio: checked })}
              />
              <CheckboxItem
                label="Notificações do desktop"
                checked={preferencias.notificacoesDesktop}
                onChange={(checked) => setPreferencias({ ...preferencias, notificacoesDesktop: checked })}
              />
            </div>

            {/* Botões de Ação */}
            <div className="flex items-center justify-between pt-6 border-t border-border">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setPreferencias(preferenciasOriginal)}
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
    </div>
  );
}

// ─── Componentes Auxiliares ─────────────────────────────────────────────────

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 pb-3 px-4 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
        active
          ? 'text-foreground border-b-2 border-primary'
          : 'text-muted-foreground hover:text-foreground border-b-2 border-transparent'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function CheckboxItem({ label, checked, onChange }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
      <Checkbox
        checked={checked}
        onCheckedChange={onChange}
        className="w-5 h-5"
      />
      <label className="text-sm font-medium text-foreground cursor-pointer flex-1">
        {label}
      </label>
    </div>
  );
}
