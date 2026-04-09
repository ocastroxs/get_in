'use client';
import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Check, Calendar, Shield, Eye, User, Star } from 'lucide-react';

const CadastroFuncionario = () => {
  // ==========================================
  // 1. ESTADO CENTRAL
  // ==========================================
  const [passoAtual, setPassoAtual] = useState(1);
  const [formData, setFormData] = useState({
    // Passo 1: Dados
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    matricula: '',
    dataAdmissao: '',
    
    // Passo 2: Perfil
    nivel_acesso: '', 
    turno: '',
    departamento: '',
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

  // ==========================================
  // 2. MÁSCARAS E HANDLERS
  // ==========================================
  const maskCPF = (value) => value.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
  const maskPhone = (value) => value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4,5})(\d)/, '$1-$2').replace(/(-\d{4})\d+?$/, '$1');
  const maskDate = (value) => value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').replace(/(\d{2})(\d)/, '$1/$2').replace(/(\/\d{4})\d+?$/, '$1');

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    if (name === 'cpf') formattedValue = maskCPF(value);
    if (name === 'telefone') formattedValue = maskPhone(value);
    if (name === 'dataAdmissao') formattedValue = maskDate(value);
    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };

  const selecionarNivelAcesso = (nivel) => setFormData(prev => ({ ...prev, nivel_acesso: nivel }));

  const toggleSetor = (setorId) => {
    setFormData(prev => ({
      ...prev,
      setores: { ...prev.setores, [setorId]: !prev.setores[setorId] }
    }));
  };

  const proximoPasso = () => setPassoAtual(prev => prev + 1);
  const passoAnterior = () => setPassoAtual(prev => prev - 1);

  // ==========================================
  // 3. INTEGRAÇÃO COM O BACKEND
  // ==========================================
  const finalizarCadastro = async () => {
    setErro('');
    if (formData.senha !== formData.confirmarSenha) {
      setErro('As senhas não coincidem!');
      return;
    }

    const setoresPermitidos = Object.keys(formData.setores).filter(k => formData.setores[k]);

    const payloadBackend = {
      nome: formData.nome,
      email: formData.email,
      senha: formData.senha,
      nivel_acesso: formData.nivel_acesso,
      cpf: formData.cpf,
      telefone: formData.telefone,
      departamento: formData.departamento,
      turno: formData.turno,
      setores_permitidos: setoresPermitidos
    };

    console.log("Enviando para a API:", payloadBackend);
    alert('Simulação: Cadastro confirmado com sucesso! Verifique o console (F12).');
  };

  // ==========================================
  // 4. CONFIGURAÇÃO DOS SETORES E TAGS
  // ==========================================
  const setoresConfig = [
    { id: 'producao', label: 'Produção', tag: 'Área restrita', tagColor: 'text-red-500 bg-red-50', dotColor: 'bg-red-500' },
    { id: 'laboratorio', label: 'Laboratório', tag: 'Área restrita', tagColor: 'text-red-500 bg-red-50', dotColor: 'bg-yellow-400' },
    { id: 'almoxarifado', label: 'Almoxarifado', tag: 'Livre', tagColor: 'text-green-600 bg-green-50', dotColor: 'bg-green-500' },
    { id: 'administrativo', label: 'Administrativo', tag: 'Livre', tagColor: 'text-green-600 bg-green-50', dotColor: 'bg-[#4DA8EA]' },
    { id: 'portaria', label: 'Portaria', tag: 'Livre', tagColor: 'text-green-600 bg-green-50', dotColor: 'bg-purple-500' },
  ];

  const renderizarTagPerfil = () => {
    if (formData.nivel_acesso === 'gerente') return <span className="px-3 py-1 bg-[#FFF4ED] text-[#E47B44] text-xs font-bold rounded-md capitalize">Gerente</span>;
    if (formData.nivel_acesso === 'supervisor') return <span className="px-3 py-1 bg-[#EAF7ED] text-[#34A853] text-xs font-bold rounded-md capitalize">Supervisor</span>;
    if (formData.nivel_acesso === 'funcionario') return <span className="px-3 py-1 bg-[#F3E8FF] text-[#9333EA] text-xs font-bold rounded-md capitalize">Funcionário</span>;
    if (formData.nivel_acesso === 'portaria') return <span className="px-3 py-1 bg-[#EBF3FB] text-[#4DA8EA] text-xs font-bold rounded-md capitalize">Portaria</span>;
    return <span className="text-gray-400 text-sm">Não selecionado</span>;
  };

  // ==========================================
  // 5. RENDERIZAÇÃO DAS ETAPAS
  // ==========================================
  const renderizarPasso = () => {
    switch (passoAtual) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-[#0A2540] mb-1">Dados pessoais</h2>
              <p className="text-sm text-gray-500">Informações básicas de identificação do funcionário.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 mb-2">Nome completo</label>
                <input type="text" name="nome" value={formData.nome} onChange={handleChange} placeholder="Ex: Ana Carolina Lima" className="px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4DA8EA]" />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 mb-2">CPF</label>
                <input type="text" name="cpf" value={formData.cpf} onChange={handleChange} placeholder="000.000.000-00" maxLength={14} className="px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4DA8EA]" />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 mb-2">E-mail</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="ana@visitatrack.com" className="px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4DA8EA]" />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 mb-2">Telefone</label>
                <input type="tel" name="telefone" value={formData.telefone} onChange={handleChange} placeholder="(11) 99999-9999" maxLength={15} className="px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4DA8EA]" />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 mb-2">Matrícula</label>
                <input type="text" name="matricula" value={formData.matricula} onChange={handleChange} placeholder="FUN-2024-001" className="px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4DA8EA]" />
              </div>
              <div className="flex flex-col relative">
                <label className="text-xs font-semibold text-gray-600 mb-2">Data de admissão</label>
                <div className="relative">
                  <input type="text" name="dataAdmissao" value={formData.dataAdmissao} onChange={handleChange} placeholder="dd/mm/aaaa" maxLength={10} className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4DA8EA]" />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-[#0A2540] mb-1">Perfil de acesso</h2>
              <p className="text-sm text-gray-500">Selecione o nível de permissão e o turno de trabalho.</p>
            </div>

            {/* Layout em 4 colunas para caber o gerente na ponta direita */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              <div onClick={() => selecionarNivelAcesso('portaria')} className={`cursor-pointer rounded-xl p-5 flex flex-col items-center text-center transition-all border-2 ${formData.nivel_acesso === 'portaria' ? 'border-[#0A2540] bg-[#f8fafc]' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                <div className="w-10 h-10 rounded-full bg-[#EBF3FB] flex items-center justify-center mb-3 text-[#4DA8EA]"><Shield className="w-5 h-5" /></div>
                <h3 className="font-bold text-[#0A2540] text-sm mb-1">Portaria</h3>
                <p className="text-[10px] text-gray-500 leading-tight">Controle de visitantes</p>
              </div>

              <div onClick={() => selecionarNivelAcesso('funcionario')} className={`cursor-pointer rounded-xl p-5 flex flex-col items-center text-center transition-all border-2 ${formData.nivel_acesso === 'funcionario' ? 'border-[#0A2540] bg-[#f8fafc]' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                <div className="w-10 h-10 rounded-full bg-[#F3E8FF] flex items-center justify-center mb-3 text-[#9333EA]"><User className="w-5 h-5" /></div>
                <h3 className="font-bold text-[#0A2540] text-sm mb-1">Funcionário</h3>
                <p className="text-[10px] text-gray-500 leading-tight">Acesso padrão aos setores</p>
              </div>

              <div onClick={() => selecionarNivelAcesso('supervisor')} className={`cursor-pointer rounded-xl p-5 flex flex-col items-center text-center transition-all border-2 ${formData.nivel_acesso === 'supervisor' ? 'border-[#0A2540] bg-[#f8fafc]' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                <div className="w-10 h-10 rounded-full bg-[#EAF7ED] flex items-center justify-center mb-3 text-[#34A853]"><Eye className="w-5 h-5" /></div>
                <h3 className="font-bold text-[#0A2540] text-sm mb-1">Supervisor</h3>
                <p className="text-[10px] text-gray-500 leading-tight">Aprova acessos restritos</p>
              </div>

              <div onClick={() => selecionarNivelAcesso('gerente')} className={`cursor-pointer rounded-xl p-5 flex flex-col items-center text-center transition-all border-2 ${formData.nivel_acesso === 'gerente' ? 'border-[#0A2540] bg-[#f8fafc]' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                <div className="w-10 h-10 rounded-full bg-[#FCECE3] flex items-center justify-center mb-3 text-[#E47B44]"><Star className="w-5 h-5" /></div>
                <h3 className="font-bold text-[#0A2540] text-sm mb-1">Gerente</h3>
                <p className="text-[10px] text-gray-500 leading-tight">Gestão de equipe e relatórios</p>
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mt-2">
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 mb-2">Turno de trabalho</label>
                <select name="turno" value={formData.turno} onChange={handleChange} className="px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#4DA8EA]">
                  <option value="">Selecione o turno</option>
                  <option value="Administrativo — 08h às 18h">Administrativo — 08h às 18h</option>
                  <option value="Manhã (06:00 - 14:00)">Manhã (06:00 - 14:00)</option>
                  <option value="Tarde (14:00 - 22:00)">Tarde (14:00 - 22:00)</option>
                  <option value="Noite (22:00 - 06:00)">Noite (22:00 - 06:00)</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 mb-2">Departamento</label>
                <select name="departamento" value={formData.departamento} onChange={handleChange} className="px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#4DA8EA]">
                  <option value="">Selecione</option>
                  <option value="Administrativo">Administrativo</option>
                  <option value="Recepção">Recepção</option>
                  <option value="Segurança">Segurança</option>
                  <option value="TI">TI</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 mb-2">Senha de Acesso (Backend)</label>
                <input type="password" name="senha" value={formData.senha} onChange={handleChange} placeholder="********" className="px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4DA8EA]" />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 mb-2">Confirmar Senha</label>
                <input type="password" name="confirmarSenha" value={formData.confirmarSenha} onChange={handleChange} placeholder="********" className="px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4DA8EA]" />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-[#0A2540] mb-1">Setores permitidos</h2>
              <p className="text-sm text-gray-500">Defina em quais áreas este funcionário pode registrar passagem via RFID.</p>
            </div>
            
            <div className="space-y-3">
              {setoresConfig.map((setor) => {
                const isChecked = formData.setores[setor.id];
                return (
                  <div key={setor.id} className="flex items-center justify-between p-4 bg-white border border-[#E2E8F0] rounded-xl shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${setor.dotColor}`}></div>
                      <span className="text-sm font-semibold text-[#0A2540]">{setor.label}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${setor.tagColor}`}>{setor.tag}</span>
                    </div>
                    <button type="button" onClick={() => toggleSetor(setor.id)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isChecked ? 'bg-[#0A2540]' : 'bg-gray-200'}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isChecked ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-2 animate-in fade-in slide-in-from-right-4">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-[#0A2540] mb-1">Revisão do cadastro</h2>
              <p className="text-sm text-gray-500">Confira todas as informações antes de confirmar.</p>
            </div>

            <div className="mt-8">
              <h3 className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-2 border-b border-gray-200 pb-2">Dados Pessoais</h3>
              <div className="space-y-0">
                <div className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-500">Nome</span>
                  <span className="text-sm font-semibold text-[#0A2540]">{formData.nome || '-'}</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-500">CPF</span>
                  <span className="text-sm font-semibold text-[#0A2540]">{formData.cpf || '-'}</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-500">E-mail</span>
                  <span className="text-sm font-semibold text-[#0A2540]">{formData.email || '-'}</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-500">Telefone</span>
                  <span className="text-sm font-semibold text-[#0A2540]">{formData.telefone || '-'}</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-500">Matrícula</span>
                  <span className="text-sm font-semibold text-[#0A2540]">{formData.matricula || '-'}</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-2 border-b border-gray-200 pb-2">Perfil de Acesso</h3>
              <div className="space-y-0">
                <div className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-500">Perfil</span>
                  {renderizarTagPerfil()}
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-500">Turno</span>
                  <span className="text-sm font-semibold text-[#0A2540] capitalize">{formData.turno || '-'}</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-500">Departamento</span>
                  <span className="text-sm font-semibold text-[#0A2540] capitalize">{formData.departamento || '-'}</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-3 border-b border-gray-200 pb-2">Setores Habilitados</h3>
              <div className="flex flex-wrap gap-2">
                {setoresConfig
                  .filter(setor => formData.setores[setor.id])
                  .map(setor => (
                    <span key={setor.id} className="px-3 py-1.5 bg-[#F1F5F9] text-[#0A2540] text-xs font-semibold rounded-md shadow-sm">
                      {setor.label}
                    </span>
                  ))}
                {Object.values(formData.setores).every(v => !v) && (
                  <span className="text-sm text-gray-400">Nenhum setor habilitado</span>
                )}
              </div>
            </div>

            {erro && <p className="text-red-500 text-sm font-semibold mt-4">{erro}</p>}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-10 font-sans">
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#0A2540] mb-2 tracking-tight">Novo Funcionário</h1>
          <p className="text-gray-500 text-sm">Preencha os dados abaixo para cadastrar um funcionário no sistema.</p>
        </div>

        <div className="flex items-center mb-10 w-full max-w-2xl">
          {['Dados', 'Perfil', 'Setores', 'Revisão'].map((label, index) => {
            const numeroPasso = index + 1;
            const isAtivo = passoAtual === numeroPasso;
            const isConcluido = passoAtual > numeroPasso;

            return (
              <React.Fragment key={label}>
                <div className="flex flex-col items-center relative z-10 w-12">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold mb-2 transition-colors ${isAtivo ? 'bg-[#4DA8EA] text-white shadow-sm' : isConcluido ? 'bg-[#0A2540] text-white' : 'bg-white border border-gray-200 text-gray-400'}`}>
                    {isConcluido ? <Check className="w-5 h-5" /> : numeroPasso}
                  </div>
                  <span className={`text-[11px] font-bold ${isAtivo ? 'text-[#4DA8EA]' : isConcluido ? 'text-[#0A2540]' : 'text-gray-400'}`}>{label}</span>
                </div>
                {index < 3 && (
                  <div className={`flex-1 h-px mx-[-10px] mt-[-20px] z-0 transition-colors ${isConcluido ? 'bg-[#0A2540]' : 'bg-[#E2E8F0]'}`}></div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-8 max-w-3xl">
          <form onSubmit={(e) => e.preventDefault()}>
            
            {renderizarPasso()}

            <div className="pt-8 mt-8 border-t border-[#E2E8F0] flex justify-between items-center">
              {passoAtual > 1 ? (
                <button type="button" onClick={passoAnterior} className="text-gray-600 px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center hover:bg-gray-50 border border-gray-200 transition-colors shadow-sm">
                  <ArrowLeft className="mr-2 w-4 h-4" /> Voltar
                </button>
              ) : <div></div>}

              {passoAtual < 4 ? (
                <button type="button" onClick={proximoPasso} className="bg-[#0A2540] hover:bg-[#133c66] text-white px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center transition-colors shadow-sm">
                  {passoAtual === 3 ? 'Revisar cadastro' : 'Próximo passo'} <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              ) : (
                <button type="button" onClick={finalizarCadastro} className="bg-[#10B981] hover:bg-[#059669] text-white px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center transition-colors shadow-sm">
                  <Check className="mr-2 w-4 h-4" /> Confirmar cadastro 
                </button>
              )}
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};

export default CadastroFuncionario;