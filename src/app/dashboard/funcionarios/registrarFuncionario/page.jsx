'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, ArrowRight, Briefcase, Check, Eye, Loader2, Shield } from 'lucide-react';
import Topbar from "@/components/Topbar";
import { api } from "@/services/api";
import { cn } from "@/lib/utils";

const FIELD_BASE_CLASS =
  "h-11 w-full rounded-xl border bg-background/80 px-4 py-2.5 text-sm text-foreground shadow-xs outline-none transition-all duration-200 placeholder:text-muted-foreground placeholder:opacity-100 hover:border-primary/35 hover:bg-accent/40 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:placeholder:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/40";
const FIELD_DEFAULT_CLASS = "border-border/60";
const FIELD_ERROR_CLASS = "border-destructive/70 focus:border-destructive focus:ring-destructive/20";
const LABEL_CLASS = "mb-2 text-xs font-semibold text-muted-foreground";
const SECTION_TITLE_CLASS = "mb-1 text-lg font-bold text-foreground";
const SECTION_TEXT_CLASS = "text-sm text-muted-foreground";
const PRIMARY_ACTION_CLASS =
  "inline-flex items-center rounded-2xl bg-primary px-8 py-3.5 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/15 transition-all hover:bg-primary/85 active:scale-95 disabled:opacity-50";

const ACCESS_LEVELS = [
  {
    value: 'portaria',
    label: 'Portaria',
    Icon: Shield,
    iconClass: 'bg-primary/10 text-primary',
  },
  {
    value: 'supervisor',
    label: 'Supervisor',
    Icon: Eye,
    iconClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
  },
  {
    value: 'adm',
    label: 'Administrador',
    Icon: Briefcase,
    iconClass: 'bg-orange-500/10 text-orange-600 dark:text-orange-300',
  },
];

const SETORES_PERMITIDOS = [
  { id: 'producao', label: 'Produção', color: 'bg-red-500' },
  { id: 'laboratorio', label: 'Laboratório', color: 'bg-yellow-400' },
  { id: 'almoxarifado', label: 'Almoxarifado', color: 'bg-green-500' },
  { id: 'administrativo', label: 'Administrativo', color: 'bg-primary' },
  { id: 'portaria', label: 'Portaria', color: 'bg-purple-500' },
];

const fieldClass = (hasError = false) =>
  cn(FIELD_BASE_CLASS, hasError ? FIELD_ERROR_CLASS : FIELD_DEFAULT_CLASS);

const CadastroFuncionario = () => {
  const [passoAtual, setPassoAtual] = useState(1);
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    nivel_acesso: '',
    turno: '',
    idDepartamento: '',
    senha: '',
    confirmarSenha: '',
    setores: {
      producao: true,
      laboratorio: true,
      almoxarifado: true,
      administrativo: true,
      portaria: true,
    },
  });

  const [erro, setErro] = useState('');
  const [senhaForca, setSenhaForca] = useState({ label: '', color: 'bg-gray-200', percent: 0 });

  const validarEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validarCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma = soma + parseInt(cpf.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) soma = soma + parseInt(cpf.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;
    return true;
  };

  const checarForcaSenha = (senha) => {
    let forca = 0;
    if (senha.length >= 8) forca += 25;
    if (senha.match(/[a-z]/) && senha.match(/[A-Z]/)) forca += 25;
    if (senha.match(/\d/)) forca += 25;
    if (senha.match(/[^a-zA-Z\d]/)) forca += 25;
    if (forca === 0) return { label: 'Muito Fraca', color: 'bg-red-500', percent: 5 };
    if (forca <= 25) return { label: 'Fraca', color: 'bg-orange-500', percent: 25 };
    if (forca <= 50) return { label: 'Média', color: 'bg-yellow-500', percent: 50 };
    if (forca <= 75) return { label: 'Boa', color: 'bg-blue-400', percent: 75 };
    return { label: 'Forte', color: 'bg-green-500', percent: 100 };
  };

  useEffect(() => {
    if (formData.senha) setSenhaForca(checarForcaSenha(formData.senha));
    else setSenhaForca({ label: '', color: 'bg-gray-200', percent: 0 });
  }, [formData.senha]);

  useEffect(() => {
    const fetchDepartamentos = async () => {
      try {
        const data = await api.get('/setores');
        if (data.sucesso) setDepartamentos(data.data || []);
      } catch {
        return;
      }
    };
    fetchDepartamentos();
  }, []);

  const maskCPF = (value) => value.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
  const maskPhone = (value) => value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4,5})(\d)/, '$1-$2').replace(/(-\d{4})\d+?$/, '$1');

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    if (name === 'cpf') formattedValue = maskCPF(value);
    if (name === 'telefone') formattedValue = maskPhone(value);
    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    if (erro) setErro('');
  };

  const selecionarNivelAcesso = (nivel) => setFormData(prev => ({ ...prev, nivel_acesso: nivel }));
  const toggleSetor = (setorId) => setFormData(prev => ({ ...prev, setores: { ...prev.setores, [setorId]: !prev.setores[setorId] } }));

  const proximoPasso = () => {
    setErro('');
    if (passoAtual === 1) {
      if (!formData.nome || !formData.cpf || !formData.email) { setErro('Preencha os campos obrigatórios.'); return; }
      if (!validarCPF(formData.cpf)) { setErro('CPF inválido.'); return; }
      if (!validarEmail(formData.email)) { setErro('E-mail inválido.'); return; }
    }
    if (passoAtual === 2) {
      if (!formData.nivel_acesso || !formData.idDepartamento || !formData.senha) { setErro('Preencha os dados de perfil.'); return; }
      if (formData.senha !== formData.confirmarSenha) { setErro('As senhas não coincidem.'); return; }
      if (senhaForca.percent < 50) { setErro('A senha é muito fraca.'); return; }
    }
    setPassoAtual(prev => prev + 1);
  };

  const passoAnterior = () => setPassoAtual(prev => prev - 1);

  const finalizarCadastro = async () => {
    setErro('');
    setLoading(true);
    const tipoMap = { portaria: 'port', supervisor: 'sup', adm: 'adm' };
    const payloadBackend = {
      nome: formData.nome, cpf: formData.cpf, celular: formData.telefone, email: formData.email,
      idDepartamento: parseInt(formData.idDepartamento), tipo: tipoMap[formData.nivel_acesso] || 'port',
      senha: formData.senha, imagem: null, dataDeNascimento: null,
    };
    try {
      const data = await api.post('/auth', payloadBackend);
      if (data.sucesso) setSucesso(true);
      else setErro(data.mensagem || 'Erro ao realizar o cadastro.');
    } catch {
      setErro('Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  const renderizarPasso = () => {
    if (sucesso) return (
      <div className="flex flex-col items-center justify-center space-y-4 py-10 text-center animate-in zoom-in duration-300">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 text-green-600 dark:text-green-300">
          <Check className="h-10 w-10" strokeWidth={3} />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Cadastro Concluído!</h2>
        <p className="text-sm text-muted-foreground">O funcionário foi registrado com sucesso.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className={cn(PRIMARY_ACTION_CLASS, "mt-6")}
        >
          Cadastrar outro
        </button>
      </div>
    );

    switch (passoAtual) {
      case 1: return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <div className="mb-6">
            <h2 className={SECTION_TITLE_CLASS}>Dados pessoais</h2>
            <p className={SECTION_TEXT_CLASS}>Informações básicas de identificação.</p>
          </div>
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
            <div className="flex flex-col md:col-span-2">
              <label className={LABEL_CLASS}>Nome completo</label>
              <input type="text" name="nome" value={formData.nome} onChange={handleChange} placeholder="Ex: Ana Carolina Lima" className={fieldClass()} />
            </div>
            <div className="flex flex-col">
              <label className={LABEL_CLASS}>CPF</label>
              <input type="text" name="cpf" value={formData.cpf} onChange={handleChange} placeholder="000.000.000-00" maxLength={14} className={fieldClass(formData.cpf && !validarCPF(formData.cpf))} />
            </div>
            <div className="flex flex-col">
              <label className={LABEL_CLASS}>Telefone</label>
              <input type="tel" name="telefone" value={formData.telefone} onChange={handleChange} placeholder="(11) 99999-9999" maxLength={15} className={fieldClass()} />
            </div>
            <div className="flex flex-col md:col-span-2">
              <label className={LABEL_CLASS}>E-mail</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="ana@visitatrack.com" className={fieldClass(formData.email && !validarEmail(formData.email))} />
            </div>
          </div>
        </div>
      );
      case 2: return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <div className="mb-6">
            <h2 className={SECTION_TITLE_CLASS}>Perfil de acesso</h2>
            <p className={SECTION_TEXT_CLASS}>Selecione o nível de permissão e o turno.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {ACCESS_LEVELS.map(({ value, label, Icon, iconClass }) => {
              const isSelected = formData.nivel_acesso === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => selecionarNivelAcesso(value)}
                  className={cn(
                    "flex flex-col items-center rounded-xl border p-5 text-center transition-all",
                    isSelected
                      ? "border-primary bg-primary/10 text-foreground shadow-sm shadow-primary/10"
                      : "border-border/60 bg-background/70 text-foreground hover:border-primary/30 hover:bg-muted/40"
                  )}
                >
                  <span className={cn("mb-3 flex h-10 w-10 items-center justify-center rounded-full", iconClass)}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-bold">{label}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
            <div className="flex flex-col">
              <label className={LABEL_CLASS}>Departamento</label>
              <select name="idDepartamento" value={formData.idDepartamento} onChange={handleChange} className={cn(fieldClass(), "[&>option]:bg-background [&>option]:text-foreground")}>
                <option value="">Selecione</option>
                {departamentos.map(dep => <option key={dep.id} value={dep.id}>{dep.nome}</option>)}
              </select>
            </div>
            <div className="flex flex-col">
              <label className={LABEL_CLASS}>Turno de trabalho</label>
              <select name="turno" value={formData.turno} onChange={handleChange} className={cn(fieldClass(), "[&>option]:bg-background [&>option]:text-foreground")}>
                <option value="">Selecione o turno</option>
                <option value="manha">Manhã</option>
                <option value="tarde">Tarde</option>
                <option value="noite">Noite</option>
                <option value="comercial">Comercial</option>
              </select>
            </div>
            <div className="relative flex flex-col">
              <label className={LABEL_CLASS}>Senha de Acesso</label>
              <input type="password" name="senha" value={formData.senha} onChange={handleChange} placeholder="********" className={fieldClass()} />
              {formData.senha && <div className={cn("mt-2 h-1 rounded-full transition-all duration-500", senhaForca.color)} style={{ width: `${senhaForca.percent}%` }} />}
            </div>
            <div className="flex flex-col">
              <label className={LABEL_CLASS}>Confirmar Senha</label>
              <input type="password" name="confirmarSenha" value={formData.confirmarSenha} onChange={handleChange} placeholder="********" className={fieldClass(formData.confirmarSenha && formData.senha !== formData.confirmarSenha)} />
            </div>
          </div>
        </div>
      );
      case 3: return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <div className="mb-6">
            <h2 className={SECTION_TITLE_CLASS}>Setores permitidos</h2>
            <p className={SECTION_TEXT_CLASS}>Defina em quais áreas este funcionário pode registrar passagem.</p>
          </div>
          <div className="space-y-3">
            {SETORES_PERMITIDOS.map((setor) => (
              <div key={setor.id} className="flex items-center justify-between rounded-xl border border-border/60 bg-background/70 p-4 shadow-xs transition-colors hover:bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className={cn("h-2 w-2 rounded-full", setor.color)} />
                  <span className="text-sm font-semibold text-foreground">{setor.label}</span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleSetor(setor.id)}
                  aria-label={`${formData.setores[setor.id] ? 'Desativar' : 'Ativar'} ${setor.label}`}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full border transition-colors",
                    formData.setores[setor.id] ? 'border-primary bg-primary' : 'border-border bg-muted'
                  )}
                >
                  <span className={cn("inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform", formData.setores[setor.id] ? 'translate-x-6' : 'translate-x-1')} />
                </button>
              </div>
            ))}
          </div>
        </div>
      );
      case 4: return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <div className="mb-6">
            <h2 className={SECTION_TITLE_CLASS}>Revisão do cadastro</h2>
            <p className={SECTION_TEXT_CLASS}>Confira os dados antes de finalizar.</p>
          </div>
          <div className="space-y-4 rounded-2xl border border-border/60 bg-background/70 p-6 shadow-xs">
            <div className="flex justify-between gap-4 border-b border-border/60 pb-2"><span className="text-sm text-muted-foreground">Nome:</span><span className="text-right text-sm font-bold text-foreground">{formData.nome}</span></div>
            <div className="flex justify-between gap-4 border-b border-border/60 pb-2"><span className="text-sm text-muted-foreground">CPF:</span><span className="text-right text-sm font-bold text-foreground">{formData.cpf}</span></div>
            <div className="flex justify-between gap-4 border-b border-border/60 pb-2"><span className="text-sm text-muted-foreground">E-mail:</span><span className="text-right text-sm font-bold text-foreground">{formData.email}</span></div>
            <div className="flex justify-between gap-4"><span className="text-sm text-muted-foreground">Perfil:</span><span className="rounded-md bg-primary/10 px-3 py-1 text-[10px] font-bold text-primary">{ACCESS_LEVELS.find((level) => level.value === formData.nivel_acesso)?.label || formData.nivel_acesso}</span></div>
          </div>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="flex w-full flex-col items-center justify-center py-6">
      <div className="w-full max-w-4xl">
        <Topbar
          title="Novo Funcionário"
          subtitle="Cadastre um novo colaborador no sistema GETIN."
        />

        <div className="mx-auto mb-12 flex w-full max-w-2xl items-center justify-between">
          {['Dados', 'Perfil', 'Setores', 'Revisão'].map((label, index) => {
            const step = index + 1;
            const isAtivo = passoAtual === step;
            const isConcluido = passoAtual > step;
            return (
              <React.Fragment key={label}>
                <div className="relative z-10 flex flex-col items-center">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold transition-all duration-500",
                    isAtivo
                      ? 'scale-110 bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                      : isConcluido
                        ? 'bg-primary/90 text-primary-foreground'
                        : 'border-2 border-border bg-card text-muted-foreground'
                  )}>
                    {isConcluido ? <Check className="h-5 w-5" /> : step}
                  </div>
                  <span className={cn(
                    "mt-2 text-[10px] font-bold uppercase tracking-widest",
                    isAtivo ? 'text-primary' : isConcluido ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    {label}
                  </span>
                </div>
                {index < 3 && <div className={cn("mx-4 h-0.5 flex-1 transition-colors duration-500", isConcluido ? 'bg-primary' : 'bg-border')} />}
              </React.Fragment>
            );
          })}
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-md animate-in fade-in slide-in-from-bottom-4 duration-700 md:p-10">
          <form onSubmit={e => e.preventDefault()}>
            {renderizarPasso()}

            {erro && (
              <div className="mt-6 flex items-center gap-3 border-l-4 border-destructive bg-destructive/10 p-4 text-destructive animate-in slide-in-from-top-2">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span className="text-sm font-bold">{erro}</span>
              </div>
            )}

            {!sucesso && (
              <div className="mt-10 flex flex-col-reverse gap-3 border-t border-border/70 pt-8 sm:flex-row sm:items-center sm:justify-between">
                {passoAtual > 1 ? (
                  <button
                    type="button"
                    onClick={passoAnterior}
                    disabled={loading}
                    className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-xs font-bold text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground disabled:opacity-50"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                  </button>
                ) : <div />}

                {passoAtual < 4 ? (
                  <button type="button" onClick={proximoPasso} className={PRIMARY_ACTION_CLASS}>
                    Próximo Passo <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={finalizarCadastro}
                    disabled={loading}
                    className="inline-flex items-center rounded-2xl bg-green-600 px-8 py-3.5 text-xs font-bold text-white shadow-lg shadow-green-600/15 transition-all hover:bg-green-700 active:scale-95 disabled:opacity-50 dark:bg-green-500 dark:hover:bg-green-600"
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                    {loading ? 'Processando...' : 'Finalizar Cadastro'}
                  </button>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default CadastroFuncionario;
