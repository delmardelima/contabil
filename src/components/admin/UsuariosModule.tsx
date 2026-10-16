import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  Shield, 
  History, 
  Plus, 
  Save, 
  Search, 
  Check, 
  Key,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { Usuario, PerfilUsuario, PermissaoSistema, AuditoriaLog } from '../../types/contabil';
import { dbService, getPermissoesPadraoPerfil } from '../../db/sqliteService';

const CATALOGO_PERMISSOES: { id: PermissaoSistema; label: string; grupo: string }[] = [
  { id: 'contabilidade.visualizar', label: 'Visualizar Balancetes, DRE e Livros', grupo: 'Contabilidade' },
  { id: 'contabilidade.lancar', label: 'Incluir e Editar Partidas Dobradas', grupo: 'Contabilidade' },
  { id: 'contabilidade.excluir', label: 'Excluir Partidas e Lotes Contábeis', grupo: 'Contabilidade' },
  { id: 'contabilidade.fechar', label: 'Zeramento de Exercício e Fechamento de Lotes', grupo: 'Contabilidade' },
  { id: 'escrita.visualizar', label: 'Visualizar Livros Fiscais e Notas', grupo: 'Escrita Fiscal' },
  { id: 'escrita.lancar', label: 'Escriturar NF-e/NFS-e e Importar XML', grupo: 'Escrita Fiscal' },
  { id: 'escrita.apurar', label: 'Apurar Tributos (ICMS, PIS/COFINS, IRPJ, PGDAS)', grupo: 'Escrita Fiscal' },
  { id: 'folha.visualizar', label: 'Visualizar Colaboradores e Folhas', grupo: 'Folha & DP' },
  { id: 'folha.calcular', label: 'Calcular Folha, Férias, 13º, TRCT e eSocial', grupo: 'Folha & DP' },
  { id: 'honorarios.gerir', label: 'Gerir Contratos e Faturas de Honorários', grupo: 'Honorários' },
  { id: 'admin.empresas', label: 'Cadastrar e Alterar Empresas e Sócios', grupo: 'Administração' },
  { id: 'admin.parametros', label: 'Alterar Parâmetros Contábeis e Bloqueio', grupo: 'Administração' },
  { id: 'admin.usuarios', label: 'Gerir Usuários, Senhas e Permissões RBAC', grupo: 'Administração' },
  { id: 'admin.backup', label: 'Executar Backup, Restauração e Limpeza de Banco', grupo: 'Administração' }
];

export const UsuariosModule: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>(() => dbService.getUsuarios());
  const [currentUser, setCurrentUser] = useState<Usuario>(() => dbService.getCurrentUser());
  const [auditoriaLogs, setAuditoriaLogs] = useState<AuditoriaLog[]>(() => dbService.getAuditoriaLogs());
  const [activeTab, setActiveTab] = useState<'usuarios' | 'auditoria'>('usuarios');
  
  const [selectedUser, setSelectedUser] = useState<Usuario>(() => dbService.getCurrentUser());
  const [novaSenha, setNovaSenha] = useState<string>('');
  const [buscaAuditoria, setBuscaAuditoria] = useState('');
  const [filtroAcao, setFiltroAcao] = useState<string>('TODAS');
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  const isAdmin = currentUser.perfil === 'ADMIN' || dbService.temPermissao('admin.usuarios');

  const handleNovoUsuario = () => {
    if (!isAdmin) {
      setMensagemErro('Apenas usuários com permissão administrativa podem criar operadores.');
      return;
    }
    const novo: Usuario = {
      id: 0,
      nome: '',
      login: '',
      perfil: 'ANALISTA',
      email: '',
      crc: '',
      cpf: '',
      ativo: true,
      permissoes: getPermissoesPadraoPerfil('ANALISTA')
    };
    setSelectedUser(novo);
    setNovaSenha('');
    setMensagemErro(null);
  };

  const handlePerfilChange = (novoPerfil: PerfilUsuario) => {
    setSelectedUser({
      ...selectedUser,
      perfil: novoPerfil,
      permissoes: getPermissoesPadraoPerfil(novoPerfil)
    });
  };

  const handleTogglePermissao = (perm: PermissaoSistema) => {
    const atuais = selectedUser.permissoes || getPermissoesPadraoPerfil(selectedUser.perfil);
    const existe = atuais.includes(perm);
    const novas = existe ? atuais.filter(p => p !== perm) : [...atuais, perm];
    setSelectedUser({ ...selectedUser, permissoes: novas });
  };

  const handleSalvarUsuario = (e: React.FormEvent) => {
    e.preventDefault();
    setMensagemErro(null);

    if (!isAdmin && selectedUser.id !== currentUser.id) {
      setMensagemErro('Sem permissão para alterar outros usuários.');
      return;
    }

    if (!selectedUser.id && novaSenha.trim().length < 6) {
      setMensagemErro('Para um novo usuário, informe uma senha inicial com pelo menos 6 caracteres.');
      return;
    }

    const res = dbService.saveUsuario(selectedUser, novaSenha.trim() || undefined);
    if (!res.success) {
      setMensagemErro(res.message || 'Erro ao salvar usuário.');
      return;
    }
    const atualizados = dbService.getUsuarios();
    setUsuarios(atualizados);
    const atualizado = atualizados.find(u => u.login === selectedUser.login) || selectedUser;
    setSelectedUser(atualizado);
    if (atualizado.id === currentUser.id) {
      setCurrentUser(atualizado);
    }
    setNovaSenha('');
    setAuditoriaLogs(dbService.getAuditoriaLogs());
    setMensagemSucesso('Usuário e permissões RBAC gravados com sucesso!');
    setTimeout(() => setMensagemSucesso(null), 3000);
  };

  const handleExcluirUsuario = (id: number) => {
    setMensagemErro(null);
    const res = dbService.deleteUsuario(id);
    if (!res.success) {
      setMensagemErro(res.message || 'Erro ao excluir usuário.');
      return;
    }
    const atualizados = dbService.getUsuarios();
    setUsuarios(atualizados);
    if (atualizados.length > 0) {
      setSelectedUser(atualizados[0]);
    }
    setAuditoriaLogs(dbService.getAuditoriaLogs());
    setMensagemSucesso(res.message || 'Usuário excluído com sucesso.');
    setTimeout(() => setMensagemSucesso(null), 3000);
  };

  const filteredLogs = auditoriaLogs.filter(log => {
    const matchTexto =
      (log.usuarioNome || '').toLowerCase().includes(buscaAuditoria.toLowerCase()) ||
      (log.modulo || '').toLowerCase().includes(buscaAuditoria.toLowerCase()) ||
      (log.acao || '').toLowerCase().includes(buscaAuditoria.toLowerCase()) ||
      (log.descricao || log.detalhes || '').toLowerCase().includes(buscaAuditoria.toLowerCase());
    const matchAcao = filtroAcao === 'TODAS' || log.acao === filtroAcao;
    return matchTexto && matchAcao;
  });

  const permissoesSelecionadas = selectedUser.permissoes || getPermissoesPadraoPerfil(selectedUser.perfil);

  return (
    <div className="h-full flex flex-col p-6 bg-[#141414] text-neutral-100 select-none overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
            <Users size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-3">
              <span>Controle de Acesso (RBAC), Usuários & Trilha de Auditoria</span>
            </h1>
            <p className="text-xs text-neutral-400">
              Sessão autenticada: <strong className="text-white">{currentUser.nome}</strong> ({currentUser.perfil}) {currentUser.crc ? `• CRC: ${currentUser.crc}` : ''}
            </p>
          </div>
        </div>

        {/* Abas e Notificação */}
        <div className="flex items-center gap-3">
          {mensagemErro && (
            <div className="text-xs px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-2">
              <AlertCircle size={14} />
              <span>{mensagemErro}</span>
            </div>
          )}

          {mensagemSucesso && (
            <div className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-2">
              <Check size={14} />
              <span>{mensagemSucesso}</span>
            </div>
          )}

          <div className="flex bg-[#1a1a1a] p-1 rounded-lg border border-white/10">
            <button
              onClick={() => setActiveTab('usuarios')}
              className={`flex items-center gap-2 px-3 py-1 text-xs rounded-md transition ${
                activeTab === 'usuarios' ? 'bg-white/15 text-white font-medium' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <UserCheck size={14} />
              <span>Operadores & Permissões ({usuarios.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('auditoria');
                setAuditoriaLogs(dbService.getAuditoriaLogs());
              }}
              className={`flex items-center gap-2 px-3 py-1 text-xs rounded-md transition ${
                activeTab === 'auditoria' ? 'bg-white/15 text-white font-medium' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <History size={14} />
              <span>Trilha de Auditoria ({auditoriaLogs.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* ABA 1: USUÁRIOS E PERFIS */}
      {activeTab === 'usuarios' && (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 mt-4 overflow-hidden">
          {/* Lista de Usuários (4 cols) */}
          <div className="md:col-span-4 bg-[#181818] border border-white/10 rounded-xl flex flex-col overflow-hidden">
            <div className="p-3 border-b border-white/5 bg-[#1a1a1a] flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-300 uppercase">Equipe do Escritório</span>
              {isAdmin && (
                <button
                  onClick={handleNovoUsuario}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-blue-600 hover:bg-blue-500 text-white font-medium transition"
                >
                  <Plus size={13} />
                  <span>Novo Operador</span>
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
              {usuarios.map(u => {
                const isSelected = u.id === selectedUser.id;
                const isCurrent = u.id === currentUser.id;

                return (
                  <div
                    key={u.id}
                    onClick={() => {
                      setSelectedUser(u);
                      setNovaSenha('');
                      setMensagemErro(null);
                    }}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition flex flex-col gap-1.5 ${
                      isSelected ? 'bg-blue-900/30 border-blue-500/50' : 'bg-[#1c1c1c] border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{u.nome}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        u.perfil === 'ADMIN' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-white/10 text-neutral-300'
                      }`}>
                        {u.perfil}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-neutral-400">
                      <span>Login: <strong className="text-neutral-200 font-mono">{u.login}</strong></span>
                      {isCurrent ? (
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                          <Check size={12} /> Sessão Ativa
                        </span>
                      ) : (
                        <span className={`text-[10px] ${u.ativo ? 'text-neutral-400' : 'text-red-400'}`}>
                          {u.ativo ? 'Ativo' : 'Bloqueado'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detalhes do Usuário Selecionado (8 cols) */}
          <div className="md:col-span-8 bg-[#181818] border border-white/10 rounded-xl flex flex-col overflow-hidden">
            <div className="h-11 px-4 bg-[#1a1a1a] border-b border-white/10 flex items-center justify-between flex-shrink-0">
              <span className="text-xs font-semibold text-neutral-300 flex items-center gap-2">
                <Shield size={14} className="text-blue-400" />
                <span>{selectedUser.id ? `Editar Operador: ${selectedUser.nome}` : 'Cadastrar Novo Operador'}</span>
              </span>
              {selectedUser.id > 0 && selectedUser.id !== currentUser.id && isAdmin && (
                <button
                  type="button"
                  onClick={() => handleExcluirUsuario(selectedUser.id)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] bg-red-500/15 hover:bg-red-500/30 text-red-300 border border-red-500/30 transition"
                >
                  <Trash2 size={12} />
                  <span>Excluir Usuário</span>
                </button>
              )}
            </div>

            <form onSubmit={handleSalvarUsuario} className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Nome Completo *</label>
                    <input
                      type="text"
                      value={selectedUser.nome}
                      onChange={e => setSelectedUser({ ...selectedUser, nome: e.target.value })}
                      className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Perfil RBAC *</label>
                    <select
                      value={selectedUser.perfil}
                      disabled={!isAdmin}
                      onChange={e => handlePerfilChange(e.target.value as PerfilUsuario)}
                      className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                    >
                      <option value="ADMIN">ADMIN (Contador Chefe)</option>
                      <option value="CONTADOR">CONTADOR (Fechamentos & SPED)</option>
                      <option value="ANALISTA">ANALISTA (Contábil, Fiscal & DP)</option>
                      <option value="ASSISTENTE">ASSISTENTE (Digitação Operacional)</option>
                      <option value="AUDITOR">AUDITOR (Somente Leitura & Auditoria)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Login de Acesso *</label>
                    <input
                      type="text"
                      value={selectedUser.login}
                      onChange={e => setSelectedUser({ ...selectedUser, login: e.target.value })}
                      className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">E-mail Corporativo *</label>
                    <input
                      type="email"
                      value={selectedUser.email}
                      onChange={e => setSelectedUser({ ...selectedUser, email: e.target.value })}
                      className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1 flex items-center gap-1">
                      <Key size={12} className="text-amber-400" />
                      <span>{selectedUser.id ? 'Redefinir Senha (Opcional)' : 'Senha Inicial *'}</span>
                    </label>
                    <input
                      type="password"
                      value={novaSenha}
                      onChange={e => setNovaSenha(e.target.value)}
                      placeholder={selectedUser.id ? 'Deixe em branco p/ manter' : 'Mínimo 6 caracteres'}
                      className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Registro CRC (Contadores)</label>
                    <input
                      type="text"
                      value={selectedUser.crc || ''}
                      onChange={e => setSelectedUser({ ...selectedUser, crc: e.target.value })}
                      placeholder="Ex: 1SP254890/O-5"
                      className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">CPF do Operador</label>
                    <input
                      type="text"
                      value={selectedUser.cpf || ''}
                      onChange={e => setSelectedUser({ ...selectedUser, cpf: e.target.value })}
                      placeholder="000.000.000-00"
                      className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedUser.ativo}
                        disabled={!isAdmin}
                        onChange={e => setSelectedUser({ ...selectedUser, ativo: e.target.checked })}
                        className="w-4 h-4 rounded bg-[#141414] border-white/20 text-blue-600 focus:ring-0"
                      />
                      <span className="text-xs font-medium text-neutral-200">Operador Ativo</span>
                    </label>
                  </div>
                </div>

                {/* Matriz Granular de Permissões RBAC */}
                <div className="pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                      Matriz Granular de Permissões por Módulo
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      {permissoesSelecionadas.length} de {CATALOGO_PERMISSOES.length} permissões habilitadas
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {CATALOGO_PERMISSOES.map(perm => {
                      const checked = selectedUser.perfil === 'ADMIN' || permissoesSelecionadas.includes(perm.id);
                      return (
                        <label
                          key={perm.id}
                          className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                            checked ? 'bg-blue-950/20 border-blue-500/30 text-neutral-100' : 'bg-[#141414] border-white/5 text-neutral-400'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={!isAdmin || selectedUser.perfil === 'ADMIN'}
                            onChange={() => handleTogglePermissao(perm.id)}
                            className="mt-0.5 rounded bg-[#121212] border-white/20 text-blue-600"
                          />
                          <div>
                            <div className="font-medium leading-tight">{perm.label}</div>
                            <div className="text-[10px] text-neutral-500 font-mono mt-0.5">{perm.grupo} • {perm.id}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#1a1a1a] border-t border-white/10 flex justify-between items-center flex-shrink-0">
                <span className="text-[11px] text-neutral-400">
                  As senhas são armazenadas exclusivamente com hash criptográfico SHA-256 + Salt.
                </span>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition"
                >
                  <Save size={15} />
                  <span>Salvar Operador & Permissões</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ABA 2: TRILHA DE AUDITORIA */}
      {activeTab === 'auditoria' && (
        <div className="flex-1 bg-[#181818] border border-white/10 rounded-xl flex flex-col mt-4 overflow-hidden">
          {/* Barra de Filtro de Auditoria */}
          <div className="p-3 bg-[#1a1a1a] border-b border-white/10 flex items-center justify-between gap-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative w-80">
                <Search size={14} className="absolute left-3 top-2.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Filtrar por usuário, ação, módulo ou detalhes..."
                  value={buscaAuditoria}
                  onChange={e => setBuscaAuditoria(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-[#141414] border border-white/10 rounded-lg text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <select
                value={filtroAcao}
                onChange={e => setFiltroAcao(e.target.value)}
                className="px-3 py-1.5 bg-[#141414] border border-white/10 rounded-lg text-xs text-neutral-200 outline-none focus:border-blue-500"
              >
                <option value="TODAS">Todas as Operações</option>
                <option value="LOGIN">Login / Autenticação</option>
                <option value="FALHA_LOGIN">Falhas de Login</option>
                <option value="LOGOUT">Logout</option>
                <option value="ACESSO_NEGADO">Acesso Negado (RBAC)</option>
                <option value="INCLUSAO">Inclusões</option>
                <option value="EDICAO">Edições / Alterações</option>
                <option value="EXCLUSAO">Exclusões</option>
                <option value="FECHAMENTO">Fechamentos / Zeramento</option>
              </select>
            </div>
            <span className="text-xs font-mono text-neutral-400">
              Eventos auditados: {filteredLogs.length}
            </span>
          </div>

          {/* Tabela de Logs */}
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#202020] text-neutral-400 uppercase text-[10px] font-semibold sticky top-0 border-b border-white/10 z-10">
                <tr>
                  <th className="py-2.5 px-4 w-40">Data / Hora</th>
                  <th className="py-2.5 px-4 w-48">Usuário Responsável</th>
                  <th className="py-2.5 px-4 w-32">Módulo</th>
                  <th className="py-2.5 px-4 w-32">Operação</th>
                  <th className="py-2.5 px-4">Descrição Detalhada do Evento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-neutral-500 text-xs">
                      Nenhum evento registrado na trilha de auditoria para o filtro selecionado.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-white/5 transition">
                      <td className="py-2.5 px-4 font-mono text-[11px] text-neutral-400 whitespace-nowrap">
                        {log.dataHora}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-neutral-200 whitespace-nowrap">
                        {log.usuarioNome}
                      </td>
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                          {log.modulo}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          log.acao === 'EXCLUSAO' || log.acao === 'FALHA_LOGIN' || log.acao === 'ACESSO_NEGADO'
                            ? 'bg-red-500/20 text-red-300'
                            : log.acao === 'LOGIN' || log.acao === 'INCLUSAO'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-white/10 text-neutral-300'
                        }`}>
                          {log.acao}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-neutral-300">
                        {log.descricao || log.detalhes}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
