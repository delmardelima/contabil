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
  Lock, 
  Key,
  LogIn
} from 'lucide-react';
import { Usuario, PerfilUsuario, AuditoriaLog } from '../../types/contabil';
import { dbService } from '../../db/sqliteService';

export const UsuariosModule: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>(dbService.getUsuarios());
  const [currentUser, setCurrentUser] = useState<Usuario>(dbService.getCurrentUser());
  const [auditoriaLogs, setAuditoriaLogs] = useState<AuditoriaLog[]>(dbService.getAuditoriaLogs());
  const [activeTab, setActiveTab] = useState<'usuarios' | 'auditoria'>('usuarios');
  
  // Edição de usuário
  const [selectedUser, setSelectedUser] = useState<Usuario>(currentUser);
  const [buscaAuditoria, setBuscaAuditoria] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  const handleNovoUsuario = () => {
    const novo: Usuario = {
      id: Date.now(),
      nome: 'Novo Operador',
      login: `user_${usuarios.length + 1}`,
      perfil: 'ASSISTENTE',
      email: 'operador@amillabs.com.br',
      ativo: true
    };
    setSelectedUser(novo);
  };

  const handleSalvarUsuario = (e: React.FormEvent) => {
    e.preventDefault();
    dbService.saveUsuario(selectedUser);
    setUsuarios(dbService.getUsuarios());
    setMensagemSucesso('Usuário gravado com sucesso!');
    setTimeout(() => setMensagemSucesso(null), 3000);
  };

  const handleTrocarUsuarioAtivo = (user: Usuario) => {
    dbService.setCurrentUser(user);
    setCurrentUser(user);
    setAuditoriaLogs(dbService.getAuditoriaLogs());
    setMensagemSucesso(`Sessão alterada para ${user.nome}!`);
    setTimeout(() => setMensagemSucesso(null), 3000);
  };

  const filteredLogs = auditoriaLogs.filter(log => 
    log.usuarioNome.toLowerCase().includes(buscaAuditoria.toLowerCase()) ||
    log.modulo.toLowerCase().includes(buscaAuditoria.toLowerCase()) ||
    log.acao.toLowerCase().includes(buscaAuditoria.toLowerCase()) ||
    log.descricao.toLowerCase().includes(buscaAuditoria.toLowerCase())
  );

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
              <span>Controle de Acesso, Usuários & Auditoria</span>
            </h1>
            <p className="text-xs text-neutral-400">
              Operador atual: <strong className="text-white">{currentUser.nome}</strong> ({currentUser.perfil})
            </p>
          </div>
        </div>

        {/* Abas e Notificação */}
        <div className="flex items-center gap-3">
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
              <span>Usuários & Perfis</span>
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
              <span>Trilha de Auditoria</span>
            </button>
          </div>
        </div>
      </div>

      {/* ABA 1: USUÁRIOS E PERFIS */}
      {activeTab === 'usuarios' && (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 mt-4 overflow-hidden">
          {/* Lista de Usuários (5 cols) */}
          <div className="md:col-span-5 bg-[#181818] border border-white/10 rounded-xl flex flex-col overflow-hidden">
            <div className="p-3 border-b border-white/5 bg-[#1a1a1a] flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-300 uppercase">Equipe Contábil</span>
              <button
                onClick={handleNovoUsuario}
                className="flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-blue-600 hover:bg-blue-500 text-white font-medium transition"
              >
                <Plus size={13} />
                <span>Adicionar</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
              {usuarios.map(u => {
                const isSelected = u.id === selectedUser.id;
                const isCurrent = u.id === currentUser.id;

                return (
                  <div
                    key={u.id}
                    onClick={() => setSelectedUser(u)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition flex flex-col gap-1.5 ${
                      isSelected ? 'bg-blue-900/30 border-blue-500/50' : 'bg-[#1c1c1c] border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{u.nome}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-neutral-300">
                        {u.perfil}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-neutral-400">
                      <span>Login: <strong className="text-neutral-200">{u.login}</strong></span>
                      {isCurrent ? (
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                          <Check size={12} /> Logado Agora
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTrocarUsuarioAtivo(u);
                          }}
                          className="text-[10px] text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1"
                        >
                          <LogIn size={11} /> Entrar com este
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detalhes do Usuário Selecionado (7 cols) */}
          <div className="md:col-span-7 bg-[#181818] border border-white/10 rounded-xl flex flex-col overflow-hidden">
            <div className="h-11 px-4 bg-[#1a1a1a] border-b border-white/10 flex items-center justify-between flex-shrink-0">
              <span className="text-xs font-semibold text-neutral-300">
                Editar Dados & Permissões: {selectedUser.nome}
              </span>
            </div>

            <form onSubmit={handleSalvarUsuario} className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    value={selectedUser.nome}
                    onChange={e => setSelectedUser({ ...selectedUser, nome: e.target.value })}
                    className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Login de Acesso</label>
                    <input
                      type="text"
                      value={selectedUser.login}
                      onChange={e => setSelectedUser({ ...selectedUser, login: e.target.value })}
                      className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Perfil de Permissão</label>
                    <select
                      value={selectedUser.perfil}
                      onChange={e => setSelectedUser({ ...selectedUser, perfil: e.target.value as PerfilUsuario })}
                      className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="ADMIN">ADMIN (Contador Chefe - Acesso Total)</option>
                      <option value="ANALISTA">ANALISTA (Lançamentos, Livros e Balancetes)</option>
                      <option value="ASSISTENTE">ASSISTENTE (Digitação de Partidas)</option>
                      <option value="CONSULTA">CONSULTA (Somente Leitura)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">E-mail Profissional</label>
                  <input
                    type="email"
                    value={selectedUser.email}
                    onChange={e => setSelectedUser({ ...selectedUser, email: e.target.value })}
                    className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedUser.ativo}
                      onChange={e => setSelectedUser({ ...selectedUser, ativo: e.target.checked })}
                      className="w-4 h-4 rounded bg-[#141414] border-white/20 text-blue-600 focus:ring-0"
                    />
                    <span className="text-xs font-medium text-neutral-200">Usuário Ativo no Sistema</span>
                  </label>
                </div>
              </div>

              <div className="p-4 bg-[#1a1a1a] border-t border-white/10 flex justify-end flex-shrink-0">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition"
                >
                  <Save size={15} />
                  <span>Salvar Usuário</span>
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
          <div className="p-3 bg-[#1a1a1a] border-b border-white/10 flex items-center justify-between flex-shrink-0">
            <div className="relative w-80">
              <Search size={14} className="absolute left-3 top-2.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Filtrar por usuário, ação, módulo..."
                value={buscaAuditoria}
                onChange={e => setBuscaAuditoria(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#141414] border border-white/10 rounded-lg text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <span className="text-xs font-mono text-neutral-400">
              Total de registros: {filteredLogs.length}
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
                  <th className="py-2.5 px-4 w-28">Ação</th>
                  <th className="py-2.5 px-4">Descrição do Evento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {filteredLogs.map(log => (
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
                      <span className="text-[10px] font-semibold text-neutral-300">
                        {log.acao}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-neutral-300">
                      {log.descricao}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
