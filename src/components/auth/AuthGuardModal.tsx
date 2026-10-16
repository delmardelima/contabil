import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  User,
  Mail,
  KeyRound,
  Building2,
  Award,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import { SessaoUsuario, RegimeTributario } from '../../types/contabil';

interface AuthGuardModalProps {
  onAuthenticated: (sessao: SessaoUsuario) => void;
}

export const AuthGuardModal: React.FC<AuthGuardModalProps> = ({ onAuthenticated }) => {
  const [hasAdmin, setHasAdmin] = useState<boolean>(() => dbService.hasAdminCadastrado());
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Estados de Login
  const [identificador, setIdentificador] = useState<string>('');
  const [senhaLogin, setSenhaLogin] = useState<string>('');

  // Estados de Primeiro Acesso (Onboarding Contador Master + Escritório/Empresa Inicial)
  const [nomeAdmin, setNomeAdmin] = useState<string>('');
  const [emailAdmin, setEmailAdmin] = useState<string>('');
  const [loginAdmin, setLoginAdmin] = useState<string>('admin');
  const [crcAdmin, setCrcAdmin] = useState<string>('');
  const [cpfAdmin, setCpfAdmin] = useState<string>('');
  const [senhaAdmin, setSenhaAdmin] = useState<string>('');
  const [confirmarSenha, setConfirmarSenha] = useState<string>('');

  // Dados opcionais da primeira empresa já no Onboarding
  const [razaoSocialInicial, setRazaoSocialInicial] = useState<string>('');
  const [cnpjInicial, setCnpjInicial] = useState<string>('');
  const [regimeInicial, setRegimeInicial] = useState<RegimeTributario>('LUCRO_PRESUMIDO');
  const [cidadeInicial, setCidadeInicial] = useState<string>('São Paulo');
  const [ufInicial, setUfInicial] = useState<string>('SP');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const res = dbService.autenticarUsuario(identificador, senhaLogin);
    if (!res.success) {
      setErrorMsg(res.message || 'Credenciais inválidas. Verifique seu usuário e senha.');
      return;
    }
    const sessao = dbService.getSessaoAtiva();
    if (sessao) {
      onAuthenticated(sessao);
    }
  };

  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!nomeAdmin.trim() || !emailAdmin.trim() || !loginAdmin.trim()) {
      setErrorMsg('Preencha nome completo, e-mail e login do Contador Administrador.');
      return;
    }
    if (senhaAdmin.length < 6) {
      setErrorMsg('A senha de segurança deve possuir no mínimo 6 caracteres.');
      return;
    }
    if (senhaAdmin !== confirmarSenha) {
      setErrorMsg('A confirmação de senha não confere.');
      return;
    }

    try {
      const res = dbService.registrarPrimeiroAdmin({
        nome: nomeAdmin.trim(),
        email: emailAdmin.trim(),
        login: loginAdmin.trim(),
        senha: senhaAdmin,
        crc: crcAdmin.trim() || '1SP000000/O-0',
        cpf: cpfAdmin.trim()
      });

      if (!res.success) {
        setErrorMsg(res.message || 'Erro ao cadastrar administrador.');
        return;
      }

      // Se o usuário preencheu os dados da primeira empresa/escritório no onboarding, atualiza a empresa ativa
      if (razaoSocialInicial.trim()) {
        const empAtiva = dbService.getActiveEmpresa();
        dbService.saveEmpresa({
          ...empAtiva,
          razaoSocial: razaoSocialInicial.trim().toUpperCase(),
          nomeFantasia: razaoSocialInicial.trim().toUpperCase(),
          cnpj: cnpjInicial.trim(),
          regimeTributario: regimeInicial,
          cidade: cidadeInicial.trim() || 'São Paulo',
          uf: ufInicial.trim() || 'SP',
          contadorNome: nomeAdmin.trim(),
          contadorResponsavel: nomeAdmin.trim(),
          contadorCRC: crcAdmin.trim() || '1SP000000/O-0',
          crcContador: crcAdmin.trim() || '1SP000000/O-0',
          contadorCPF: cpfAdmin.trim(),
          responsavelLegal: nomeAdmin.trim(),
          cpfResponsavel: cpfAdmin.trim()
        });
      }

      setHasAdmin(true);
      const sessao = dbService.getSessaoAtiva();
      if (sessao) {
        onAuthenticated(sessao);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Erro ao inicializar ambiente de produção.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f0f0f] text-neutral-100 select-none overflow-y-auto p-6">
      {/* Background sutil estilo Windows 11 Mica */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.12),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.08),transparent_45%)]" />

      <div className="relative w-full max-w-4xl bg-[#181818] border border-white/10 rounded-xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Coluna Esquerda Institucional */}
        <div className="lg:col-span-5 bg-[#141414] border-b lg:border-b-0 lg:border-r border-white/10 p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-white">
                  Contabil Studio Pro
                </h1>
                <p className="text-[11px] text-blue-400 font-mono">
                  Production Enterprise Edition • 2026
                </p>
              </div>
            </div>

            <h2 className="text-lg font-semibold text-white leading-snug mb-3">
              {hasAdmin
                ? 'Acesso Corporativo & Controle de Sessão'
                : 'Configuração Inicial de Produção (Primeiro Acesso)'}
            </h2>
            <p className="text-xs text-neutral-400 leading-relaxed mb-6">
              {hasAdmin
                ? 'Autentique-se com suas credenciais individuais para acessar os livros contábeis, apurações fiscais, folha de pagamento e trilha de auditoria.'
                : 'Nenhum usuário cadastrado no banco de dados. Configure o Contador Administrador Master e a primeira empresa para iniciar a operação com banco limpo e normas NBC/CFC.'}
            </p>

            <div className="space-y-3 text-xs text-neutral-300">
              <div className="flex items-start space-x-2.5 bg-white/[0.02] border border-white/5 rounded-lg p-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-neutral-200">Segurança RBAC & Hash SHA-256</p>
                  <p className="text-[11px] text-neutral-400">Permissões granulares para Contadores, Analistas, Assistentes e Auditores.</p>
                </div>
              </div>
              <div className="flex items-start space-x-2.5 bg-white/[0.02] border border-white/5 rounded-lg p-3">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-neutral-200">100% Dados Reais & Normativos</p>
                  <p className="text-[11px] text-neutral-400">Plano Referencial RFB/CFC, CFOPs e Rubricas eSocial sem dados fictícios.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 mt-6 flex items-center justify-between text-[11px] text-neutral-500">
            <span>NBC TG / SPED ECD • ECF • EFD</span>
            <span className="font-mono text-emerald-400">SQLite Local Ready</span>
          </div>
        </div>

        {/* Coluna Direita: Formulário de Login ou Assistente de Primeiro Acesso */}
        <div className="lg:col-span-7 p-8 flex flex-col justify-center">
          {errorMsg && (
            <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center space-x-2.5 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {hasAdmin ? (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-white">Autenticação de Usuário</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Informe seu login ou e-mail corporativo e sua senha de acesso.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Login ou E-mail Corporativo
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      autoFocus
                      value={identificador}
                      onChange={(e) => setIdentificador(e.target.value)}
                      placeholder="Ex: admin ou contador@escritorio.com.br"
                      className="w-full bg-[#121212] border border-white/10 focus:border-blue-500 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Senha de Acesso
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={senhaLogin}
                      onChange={(e) => setSenhaLogin(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#121212] border border-white/10 focus:border-blue-500 rounded-lg pl-9 pr-10 py-2.5 text-xs text-white outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shadow-lg shadow-blue-600/25 flex items-center justify-center space-x-2 transition"
              >
                <span>Entrar no Sistema Contábil</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleOnboardingSubmit} className="space-y-4">
              <div>
                <span className="inline-block px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-semibold uppercase tracking-wider mb-1">
                  Onboarding Obrigatório
                </span>
                <h3 className="text-base font-bold text-white">Criar Contador Administrador (ADMIN)</h3>
                <p className="text-xs text-neutral-400">
                  Cadastre o responsável técnico do escritório e os dados da empresa inicial.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                    Nome Completo do Contador / Administrador *
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={nomeAdmin}
                      onChange={(e) => setNomeAdmin(e.target.value)}
                      placeholder="Ex: Dr. Roberto Almeida"
                      className="w-full bg-[#121212] border border-white/10 focus:border-blue-500 rounded-lg pl-8 pr-3 py-2 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                    Login de Acesso *
                  </label>
                  <input
                    type="text"
                    required
                    value={loginAdmin}
                    onChange={(e) => setLoginAdmin(e.target.value)}
                    placeholder="admin"
                    className="w-full bg-[#121212] border border-white/10 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-white font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                    E-mail Profissional *
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={emailAdmin}
                      onChange={(e) => setEmailAdmin(e.target.value)}
                      placeholder="contador@escritorio.com.br"
                      className="w-full bg-[#121212] border border-white/10 focus:border-blue-500 rounded-lg pl-8 pr-3 py-2 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                    Registro CRC (UF)
                  </label>
                  <div className="relative">
                    <Award className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={crcAdmin}
                      onChange={(e) => setCrcAdmin(e.target.value)}
                      placeholder="Ex: 1SP254890/O-5"
                      className="w-full bg-[#121212] border border-white/10 focus:border-blue-500 rounded-lg pl-8 pr-3 py-2 text-xs text-white font-mono outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                    CPF do Contador
                  </label>
                  <input
                    type="text"
                    value={cpfAdmin}
                    onChange={(e) => setCpfAdmin(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full bg-[#121212] border border-white/10 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-white font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                    Senha Master (mín. 6 dígitos) *
                  </label>
                  <div className="relative">
                    <KeyRound className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={senhaAdmin}
                      onChange={(e) => setSenhaAdmin(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#121212] border border-white/10 focus:border-blue-500 rounded-lg pl-8 pr-3 py-2 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                    Confirmar Senha *
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#121212] border border-white/10 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              {/* Seção rápida da Primeira Empresa / Escritório */}
              <div className="pt-3 border-t border-white/10">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-400 mb-2 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Dados da Primeira Empresa / Escritório (Opcional)</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={razaoSocialInicial}
                      onChange={(e) => setRazaoSocialInicial(e.target.value)}
                      placeholder="Razão Social da Empresa / Escritório"
                      className="w-full bg-[#121212] border border-white/10 focus:border-blue-500 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={cnpjInicial}
                      onChange={(e) => setCnpjInicial(e.target.value)}
                      placeholder="CNPJ (00.000.000/0001-00)"
                      className="w-full bg-[#121212] border border-white/10 focus:border-blue-500 rounded-lg px-3 py-1.5 text-xs text-white font-mono outline-none"
                    />
                  </div>
                  <div>
                    <select
                      value={regimeInicial}
                      onChange={(e) => setRegimeInicial(e.target.value as RegimeTributario)}
                      className="w-full bg-[#121212] border border-white/10 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                    >
                      <option value="LUCRO_PRESUMIDO">Lucro Presumido</option>
                      <option value="LUCRO_REAL">Lucro Real</option>
                      <option value="SIMPLES_NACIONAL">Simples Nacional</option>
                    </select>
                  </div>
                  <div>
                    <input
                      type="text"
                      value={cidadeInicial}
                      onChange={(e) => setCidadeInicial(e.target.value)}
                      placeholder="Cidade"
                      className="w-full bg-[#121212] border border-white/10 focus:border-blue-500 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      maxLength={2}
                      value={ufInicial}
                      onChange={(e) => setUfInicial(e.target.value.toUpperCase())}
                      placeholder="UF"
                      className="w-full bg-[#121212] border border-white/10 focus:border-blue-500 rounded-lg px-3 py-1.5 text-xs text-white font-mono outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg shadow-lg shadow-emerald-600/25 flex items-center justify-center space-x-2 transition mt-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Concluir Configuração e Acessar Ambiente de Produção</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
