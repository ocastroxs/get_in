'use client';
import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Check, Calendar, Shield, Eye, User, Star, Loader2, AlertCircle } from 'lucide-react';
import Sidebar from '@/components/ui/sidebar';
import ParticlesBackground from '@/components/ui/ParticlesBackground';

const CadastroFuncionario = () => {
  // ==========================================
  // 1. ESTADO CENTRAL
  // ==========================================
  const [passoAtual, setPassoAtual] = useState(1);
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [formData, setFormData] = useState({
    // Passo 1: Dados
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    
    // Passo 2: Perfil
    nivel_acesso: '', 
    turno: '',
    idDepartamento: '',
    senha: '',
    confirmarSenha: '',
    
    // Passo 3: Setores Permitidos (Toggles)
    setores: {
      producao: true,
      laboratorio: true,
      almoxarifado: true,
      administrativo: true,
      portaria: true
    }
  });

  const [erro, setErro] = useState('');
  const [senhaForca, setSenhaForca] = useState({ label: '', color: 'bg-gray-200', percent: 0 });

  // ==========================================
  // 2. FUNÇÕES DE VALIDAÇÃO
  // ==========================================
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
        const response = await fetch(`https://get-in-ilp5.onrender.com/dep`,{
        method: 'GET', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('getin_token')}` }
        } );
        const data = await response.json();
        if (data.sucesso) setDepartamentos(data.data);
      } catch (err) { return; }
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
    const tipoMap = { 'funcionario': 'func', 'portaria': 'port', 'supervisor': 'sup', 'gerente': 'ger' };
    const payloadBackend = {
      nome: formData.nome, cpf: formData.cpf, celular: formData.telefone, email: formData.email,
      idDepartamento: parseInt(formData.idDepartamento), tipo: tipoMap[formData.nivel_acesso] || 'func',
      senha: formData.senha, imagem: null, dataDeNascimento: null
    };
    try {
      const response = await fetch('https://get-in-ilp5.onrender.com/auth', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('getin_token')}` }, body: JSON.stringify(payloadBackend)
      });
      const data = await response.json();
      if (data.sucesso) setSucesso(true);
      else setErro(data.mensagem || 'Erro ao realizar o cadastro.');
    } catch (err) { setErro('Não foi possível conectar ao servidor.'); }
    finally { setLoading(false); }
  };

  // ==========================================
  // 3. RENDERIZAÇÃO DAS ETAPAS (ESTILO ORIGINAL)
  // ==========================================
  const renderizarPasso = () => {
    if (sucesso) return (
      <div className="flex flex-col items-center justify-center py-10 space-y-4 animate-in zoom-in duration-300">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600"><Check className="w-10 h-10" strokeWidth={3} /></div>
        <h2 className="text-2xl font-bold text-[#0A2540]">Cadastro Concluído!</h2>
        <p className="text-gray-500 text-center">O funcionário foi registrado com sucesso.</p>
        <button onClick={() => window.location.reload()} className="mt-6 bg-[#0A2540] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#133c66] transition-colors">Cadastrar outro</button>
      </div>
    );

    switch (passoAtual) {
      case 1: return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[#0A2540] mb-1">Dados pessoais</h2>
            <p className="text-sm text-gray-500">Informações básicas de identificação.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div className="flex flex-col md:col-span-2">
              <label className="text-xs font-semibold text-gray-600 mb-2">Nome completo</label>
              <input type="text" name="nome" value={formData.nome} onChange={handleChange} placeholder="Ex: Ana Carolina Lima" className="px-4 py-2.5 bg-white/50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4DA8EA]" />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-600 mb-2">CPF</label>
              <input type="text" name="cpf" value={formData.cpf} onChange={handleChange} placeholder="000.000.000-00" maxLength={14} className={`px-4 py-2.5 bg-white/50 border rounded-lg text-sm focus:outline-none focus:ring-2 ${formData.cpf && !validarCPF(formData.cpf) ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-[#4DA8EA]'}`} />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-600 mb-2">Telefone</label>
              <input type="tel" name="telefone" value={formData.telefone} onChange={handleChange} placeholder="(11) 99999-9999" maxLength={15} className="px-4 py-2.5 bg-white/50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4DA8EA]" />
            </div>
            <div className="flex flex-col md:col-span-2">
              <label className="text-xs font-semibold text-gray-600 mb-2">E-mail</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="ana@visitatrack.com" className={`px-4 py-2.5 bg-white/50 border rounded-lg text-sm focus:outline-none focus:ring-2 ${formData.email && !validarEmail(formData.email) ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-[#4DA8EA]'}`} />
            </div>
          </div>
          
        </div>
      );
      case 2: return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[#0A2540] mb-1">Perfil de acesso</h2>
            <p className="text-sm text-gray-500">Selecione o nível de permissão e o turno.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['portaria', 'funcionario', 'supervisor', 'gerente'].map(nivel => (
              <div key={nivel} onClick={() => selecionarNivelAcesso(nivel)} className={`cursor-pointer rounded-xl p-5 flex flex-col items-center text-center transition-all border-2 ${formData.nivel_acesso === nivel ? 'border-[#0A2540] bg-white/80' : 'border-gray-100 bg-white/40 hover:border-gray-200'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${nivel === 'portaria' ? 'bg-[#EBF3FB] text-[#4DA8EA]' : nivel === 'funcionario' ? 'bg-[#F3E8FF] text-[#9333EA]' : nivel === 'supervisor' ? 'bg-[#EAF7ED] text-[#34A853]' : 'bg-[#FCECE3] text-[#E47B44]'}`}>
                  {nivel === 'portaria' ? <Shield className="w-5 h-5" /> : nivel === 'funcionario' ? <User className="w-5 h-5" /> : nivel === 'supervisor' ? <Eye className="w-5 h-5" /> : <Star className="w-5 h-5" />}
                </div>
                <h3 className="font-bold text-[#0A2540] text-sm mb-1 capitalize">{nivel}</h3>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mt-2">
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-600 mb-2">Departamento</label>
              <select name="idDepartamento" value={formData.idDepartamento} onChange={handleChange} className="px-4 py-2.5 bg-white/50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4DA8EA]">
                <option value="">Selecione</option>
                {departamentos.map(dep => <option key={dep.id} value={dep.id}>{dep.nome}</option>)}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-600 mb-2">Turno de trabalho</label>
              <select name="turno" value={formData.turno} onChange={handleChange} className="px-4 py-2.5 bg-white/50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4DA8EA]">
                <option value="">Selecione o turno</option>
                <option value="Administrativo">Administrativo — 08h às 18h</option>
                <option value="Manhã">Manhã (06:00 - 14:00)</option>
              </select>
            </div>
            <div className="flex flex-col relative">
              <label className="text-xs font-semibold text-gray-600 mb-2">Senha de Acesso</label>
              <input type="password" name="senha" value={formData.senha} onChange={handleChange} placeholder="********" className="px-4 py-2.5 bg-white/50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4DA8EA]" />
              {formData.senha && <div className={`h-1 mt-2 rounded-full transition-all duration-500 ${senhaForca.color}`} style={{ width: `${senhaForca.percent}%` }}></div>}
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-600 mb-2">Confirmar Senha</label>
              <input type="password" name="confirmarSenha" value={formData.confirmarSenha} onChange={handleChange} placeholder="********" className={`px-4 py-2.5 bg-white/50 border rounded-lg text-sm focus:outline-none focus:ring-2 ${formData.confirmarSenha && formData.senha !== formData.confirmarSenha ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-[#4DA8EA]'}`} />
            </div>
          </div>
        </div>
      );
      case 3: return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[#0A2540] mb-1">Setores permitidos</h2>
            <p className="text-sm text-gray-500">Defina em quais áreas este funcionário pode registrar passagem.</p>
          </div>
          <div className="space-y-3">
            {[{ id: 'producao', label: 'Produção', tag: 'Área restrita', color: 'bg-red-500' }, { id: 'laboratorio', label: 'Laboratório', tag: 'Área restrita', color: 'bg-yellow-400' }, { id: 'almoxarifado', label: 'Almoxarifado', tag: 'Livre', color: 'bg-green-500' }, { id: 'administrativo', label: 'Administrativo', tag: 'Livre', color: 'bg-[#4DA8EA]' }, { id: 'portaria', label: 'Portaria', tag: 'Livre', color: 'bg-purple-500' }].map((setor) => (
              <div key={setor.id} className="flex items-center justify-between p-4 bg-white/60 border border-gray-100 rounded-xl backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${setor.color}`}></div>
                  <span className="text-sm font-semibold text-[#0A2540]">{setor.label}</span>
                </div>
                <button type="button" onClick={() => toggleSetor(setor.id)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.setores[setor.id] ? 'bg-[#0A2540]' : 'bg-gray-200'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.setores[setor.id] ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      );
      case 4: return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[#0A2540] mb-1">Revisão do cadastro</h2>
            <p className="text-sm text-gray-500">Confira os dados antes de finalizar.</p>
          </div>
          <div className="bg-white/50 p-6 rounded-2xl border border-white/20 space-y-4">
            <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-sm text-gray-500">Nome:</span><span className="text-sm font-bold text-[#0A2540]">{formData.nome}</span></div>
            <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-sm text-gray-500">CPF:</span><span className="text-sm font-bold text-[#0A2540]">{formData.cpf}</span></div>
            <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-sm text-gray-500">E-mail:</span><span className="text-sm font-bold text-[#0A2540]">{formData.email}</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-500">Perfil:</span><span className="px-3 py-1 bg-purple-100 text-purple-600 text-[10px] font-bold rounded-md capitalize">{formData.nivel_acesso}</span></div>
          </div>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="flex min-h-screen relative overflow-hidden">
      <ParticlesBackground />
      <Sidebar />
      <main className="flex-1 p-6 md:p-10 relative z-10 flex flex-col items-center justify-center mt-16 lg:mt-0 overflow-y-auto max-h-screen custom-scrollbar">
        <div className="w-full max-w-4xl">
          
          {/* Título */}
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-3xl font-black text-[#0A2540] mb-2 tracking-tight">Novo Funcionário</h1>
            <p className="text-gray-500 font-medium">Cadastre um novo colaborador no sistema GETIN.</p>
          </div>

          {/* Stepper (Passos) */}
          <div className="flex items-center justify-between mb-12 w-full max-w-2xl mx-auto">
            {['Dados', 'Perfil', 'Setores', 'Revisão'].map((label, index) => {
              const step = index + 1;
              const isAtivo = passoAtual === step;
              const isConcluido = passoAtual > step;
              return (
                <React.Fragment key={label}>
                  <div className="flex flex-col items-center relative z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-500 ${isAtivo ? 'bg-[#4DA8EA] text-white shadow-lg shadow-blue-400/30 scale-110' : isConcluido ? 'bg-[#0A2540] text-white' : 'bg-white border-2 border-gray-200 text-gray-400'}`}>
                      {isConcluido ? <Check className="w-5 h-5" /> : step}
                    </div>
                    <span className={`mt-2 text-[10px] font-bold uppercase tracking-widest ${isAtivo ? 'text-[#4DA8EA]' : isConcluido ? 'text-[#0A2540]' : 'text-gray-400'}`}>{label}</span>
                  </div>
                  {index < 3 && <div className={`flex-1 h-0.5 mx-4 transition-colors duration-500 ${isConcluido ? 'bg-[#0A2540]' : 'bg-gray-200'}`}></div>}
                </React.Fragment>
              );
            })}
          </div>

          {/* Card de Formulário */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <form onSubmit={e => e.preventDefault()}>
              {renderizarPasso()}
              
              {erro && (
                <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 flex items-center space-x-3 animate-in slide-in-from-top-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-sm text-red-700 font-bold">{erro}</span>
                </div>
              )}

              {!sucesso && (
                <div className="mt-10 pt-8 border-t border-gray-100 flex justify-between items-center">
                  {passoAtual > 1 ? (
                    <button onClick={passoAnterior} disabled={loading} className="flex items-center text-gray-500 hover:text-[#0A2540] font-bold text-xs transition-colors disabled:opacity-50">
                      <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                    </button>
                  ) : <div></div>}

                  {passoAtual < 4 ? (
                    <button onClick={proximoPasso} className="bg-[#0A2540] hover:bg-[#133c66] text-white px-8 py-3.5 rounded-2xl font-bold text-xs flex items-center transition-all shadow-lg shadow-blue-950/20 active:scale-95">
                      Próximo Passo <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  ) : (
                    <button onClick={finalizarCadastro} disabled={loading} className="bg-[#10B981] hover:bg-[#059669] text-white px-8 py-3.5 rounded-2xl font-bold text-xs flex items-center transition-all shadow-lg shadow-green-500/20 active:scale-95 disabled:opacity-50">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                      {loading ? 'Processando...' : 'Finalizar Cadastro'}
                    </button>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CadastroFuncionario;
