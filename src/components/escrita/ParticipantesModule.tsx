import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Download, 
  Check, 
  AlertTriangle, 
  X, 
  Building2, 
  User, 
  Truck, 
  Filter
} from 'lucide-react';
import { Empresa, ParticipanteFiscal, ContaContabil } from '../../types/contabil';
import { dbService } from '../../db/sqliteService';
import { 
  maskCNPJ, 
  validarCNPJ, 
  maskCPF, 
  validarCPF, 
  maskPhone, 
  unmask 
} from '../../utils/formatters';
import { exportToCSV } from '../../utils/exportUtils';

interface ParticipantesModuleProps {
  empresaAtiva: Empresa;
}

export const ParticipantesModule: React.FC<ParticipantesModuleProps> = ({ empresaAtiva }) => {
  const [participantes, setParticipantes] = useState<ParticipanteFiscal[]>(
    dbService.getParticipantes(empresaAtiva.id)
  );
  const [contas] = useState<ContaContabil[]>(
    dbService.getContas(empresaAtiva.id).filter(c => c.tipo === 'A')
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<'TODOS' | 'CLIENTE' | 'FORNECEDOR' | 'TRANSPORTADORA'>('TODOS');
  const [modalAberto, setModalAberto] = useState(false);
  const [participanteEmEdicao, setParticipanteEmEdicao] = useState<ParticipanteFiscal | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  // Recarregar participantes se a empresa mudar
  React.useEffect(() => {
    setParticipantes(dbService.getParticipantes(empresaAtiva.id));
  }, [empresaAtiva.id]);

  const filteredParticipantes = participantes.filter(p => {
    const matchFiltro = filtroTipo === 'TODOS' || p.tipoRelacao === filtroTipo || p.tipoRelacao === 'AMBOS';
    const termo = searchTerm.toLowerCase();
    const matchBusca = 
      p.nomeRazaoSocial.toLowerCase().includes(termo) ||
      (p.nomeFantasia || '').toLowerCase().includes(termo) ||
      p.codigo.toLowerCase().includes(termo) ||
      p.cnpjCpf.includes(termo) ||
      p.municipio.toLowerCase().includes(termo);
    return matchFiltro && matchBusca;
  });

  const handleNovoParticipante = () => {
    const proximoNum = participantes.length + 1;
    const novo: ParticipanteFiscal = {
      id: Date.now(),
      empresaId: empresaAtiva.id,
      codigo: `PART-${String(proximoNum).padStart(3, '0')}`,
      nomeRazaoSocial: '',
      nomeFantasia: '',
      tipoPessoa: 'J',
      cnpjCpf: '',
      inscricaoEstadual: '',
      contribuinteICMS: '1',
      uf: empresaAtiva.uf || 'SP',
      municipio: empresaAtiva.cidade || 'São Paulo',
      codigoIbge: empresaAtiva.codigoIbge || '3550308',
      tipoRelacao: 'FORNECEDOR',
      ativo: true
    };
    setParticipanteEmEdicao(novo);
    setModalAberto(true);
  };

  const handleEditar = (p: ParticipanteFiscal) => {
    setParticipanteEmEdicao({ ...p });
    setModalAberto(true);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!participanteEmEdicao) return;

    dbService.saveParticipante(participanteEmEdicao);
    setParticipantes(dbService.getParticipantes(empresaAtiva.id));
    setModalAberto(false);
    setParticipanteEmEdicao(null);
    setMensagemSucesso('Participante salvo com sucesso!');
    setTimeout(() => setMensagemSucesso(null), 3000);
  };

  const handleExcluir = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este participante?')) {
      dbService.deleteParticipante(id);
      setParticipantes(dbService.getParticipantes(empresaAtiva.id));
      setMensagemSucesso('Participante excluído com sucesso.');
      setTimeout(() => setMensagemSucesso(null), 3000);
    }
  };

  const handleExportarCSV = () => {
    const headers = [
      'Código', 'Razão Social / Nome', 'Nome Fantasia', 'Tipo', 'CNPJ/CPF', 
      'Inscr. Estadual', 'Contribuinte ICMS', 'UF', 'Município', 'Código IBGE', 'Relação', 'Status'
    ];
    const rows = filteredParticipantes.map(p => [
      p.codigo,
      p.nomeRazaoSocial,
      p.nomeFantasia || '',
      p.tipoPessoa === 'J' ? 'Jurídica' : 'Física',
      p.cnpjCpf,
      p.inscricaoEstadual || '',
      p.contribuinteICMS === '1' ? 'Contribuinte' : p.contribuinteICMS === '2' ? 'Isento' : 'Não Contribuinte',
      p.uf,
      p.municipio,
      p.codigoIbge,
      p.tipoRelacao,
      p.ativo ? 'Ativo' : 'Inativo'
    ]);
    exportToCSV(`SPED_0150_Participantes_${empresaAtiva.codigo}`, rows, headers);
  };

  // Contadores
  const totalClientes = participantes.filter(p => p.tipoRelacao === 'CLIENTE' || p.tipoRelacao === 'AMBOS').length;
  const totalFornecedores = participantes.filter(p => p.tipoRelacao === 'FORNECEDOR' || p.tipoRelacao === 'AMBOS').length;
  const totalTransportadoras = participantes.filter(p => p.tipoRelacao === 'TRANSPORTADORA').length;

  // Validação no modal
  const documentoLimpo = participanteEmEdicao ? unmask(participanteEmEdicao.cnpjCpf) : '';
  const documentoValido = participanteEmEdicao ? (
    participanteEmEdicao.tipoPessoa === 'J' 
      ? (documentoLimpo.length === 14 ? validarCNPJ(participanteEmEdicao.cnpjCpf) : false)
      : (documentoLimpo.length === 11 ? validarCPF(participanteEmEdicao.cnpjCpf) : false)
  ) : false;

  return (
    <div className="h-full flex flex-col p-6 bg-[#141414] text-neutral-100 select-none overflow-hidden">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">
            <Users size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span>Participantes Fiscais (Clientes, Fornecedores & Transportadoras)</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-mono">
                SPED Registro 0150
              </span>
            </h1>
            <p className="text-xs text-neutral-400">
              Cadastro de emitentes, destinatários e transportadoras com vinculação contábil individualizada
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {mensagemSucesso && (
            <div className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-2">
              <Check size={14} />
              <span>{mensagemSucesso}</span>
            </div>
          )}

          <button
            onClick={handleExportarCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#222] hover:bg-[#2a2a2a] text-neutral-200 border border-white/10 transition"
          >
            <Download size={14} />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handleNovoParticipante}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/25 transition active:scale-95"
          >
            <Plus size={15} />
            <span>Novo Participante (F2)</span>
          </button>
        </div>
      </div>

      {/* Cards de Métricas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 flex-shrink-0">
        <div className="p-3 bg-[#181818] border border-white/5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-neutral-400 block">Total Cadastrado</span>
            <span className="text-xl font-bold font-mono text-white">{participantes.length}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-neutral-400">
            <Users size={16} />
          </div>
        </div>

        <div className="p-3 bg-[#181818] border border-white/5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-neutral-400 block">Clientes (Destinatários)</span>
            <span className="text-xl font-bold font-mono text-emerald-400">{totalClientes}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Building2 size={16} />
          </div>
        </div>

        <div className="p-3 bg-[#181818] border border-white/5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-neutral-400 block">Fornecedores (Emitentes)</span>
            <span className="text-xl font-bold font-mono text-cyan-400">{totalFornecedores}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
            <User size={16} />
          </div>
        </div>

        <div className="p-3 bg-[#181818] border border-white/5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-neutral-400 block">Transportadoras (CT-e)</span>
            <span className="text-xl font-bold font-mono text-amber-400">{totalTransportadoras}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Truck size={16} />
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="flex items-center justify-between gap-4 mt-4 p-3 bg-[#181818] border border-white/10 rounded-xl flex-shrink-0">
        <div className="flex items-center gap-1">
          <Filter size={14} className="text-neutral-400 mr-2" />
          {(['TODOS', 'CLIENTE', 'FORNECEDOR', 'TRANSPORTADORA'] as const).map(tipo => (
            <button
              key={tipo}
              onClick={() => setFiltroTipo(tipo)}
              className={`px-3 py-1 text-xs rounded-lg transition font-medium ${
                filtroTipo === tipo 
                  ? 'bg-cyan-600 text-white shadow' 
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tipo === 'TODOS' ? 'Todos' : tipo === 'CLIENTE' ? 'Clientes' : tipo === 'FORNECEDOR' ? 'Fornecedores' : 'Transportadoras'}
            </button>
          ))}
        </div>

        <div className="relative w-80">
          <Search size={14} className="absolute left-3 top-2.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por razão, CNPJ/CPF, código..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#141414] border border-white/10 rounded-lg text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Grade de Registros (Tabela MDI) */}
      <div className="flex-1 mt-4 border border-white/10 rounded-xl overflow-hidden bg-[#181818] flex flex-col">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#1c1c1c] text-neutral-400 border-b border-white/10 font-mono sticky top-0 z-10">
              <tr>
                <th className="py-2.5 px-3 w-24">Código</th>
                <th className="py-2.5 px-4">Razão Social / Nome</th>
                <th className="py-2.5 px-3">CNPJ / CPF</th>
                <th className="py-2.5 px-3">Inscr. Estadual</th>
                <th className="py-2.5 px-3">Município / UF</th>
                <th className="py-2.5 px-3">Cód. IBGE</th>
                <th className="py-2.5 px-3 text-center">Relação</th>
                <th className="py-2.5 px-3">Conta Contábil Vinculada</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-4 text-center w-20">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {filteredParticipantes.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-neutral-500 text-xs italic">
                    Nenhum participante encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredParticipantes.map(p => {
                  const contaVinculada = contas.find(c => c.id === p.contaContabilId);

                  return (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition">
                      <td className="py-2.5 px-3 font-mono font-bold text-neutral-300">{p.codigo}</td>
                      <td className="py-2.5 px-4">
                        <div className="font-semibold text-white">{p.nomeRazaoSocial}</div>
                        {p.nomeFantasia && (
                          <div className="text-[11px] text-neutral-400">{p.nomeFantasia}</div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-neutral-300">{p.cnpjCpf}</td>
                      <td className="py-2.5 px-3 font-mono text-neutral-400">{p.inscricaoEstadual || 'ISENTO'}</td>
                      <td className="py-2.5 px-3 text-neutral-300">{p.municipio} - {p.uf}</td>
                      <td className="py-2.5 px-3 font-mono text-neutral-400">{p.codigoIbge}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          p.tipoRelacao === 'CLIENTE'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : p.tipoRelacao === 'FORNECEDOR'
                            ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                            : p.tipoRelacao === 'TRANSPORTADORA'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                        }`}>
                          {p.tipoRelacao}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {contaVinculada ? (
                          <span className="font-mono text-blue-400 text-[11px] truncate block max-w-[200px]" title={`${contaVinculada.classificacao} - ${contaVinculada.nome}`}>
                            {contaVinculada.classificacao} - {contaVinculada.nome}
                          </span>
                        ) : (
                          <span className="text-neutral-500 italic text-[11px]">Não vinculada</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          p.ativo ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-800 text-neutral-500'
                        }`}>
                          {p.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditar(p)}
                            className="p-1 hover:text-cyan-400 text-neutral-400 transition"
                            title="Editar Participante"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleExcluir(p.id)}
                            className="p-1 hover:text-rose-400 text-neutral-400 transition"
                            title="Excluir Participante"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé Totalizador */}
        <div className="p-3 bg-[#1a1a1a] border-t border-white/10 flex items-center justify-between text-xs text-neutral-400">
          <span>Mostrando {filteredParticipantes.length} de {participantes.length} participantes</span>
          <span className="font-mono text-neutral-500">Pressione F2 para novo participante • SPED Registro 0150</span>
        </div>
      </div>

      {/* MODAL: NOVO / EDITAR PARTICIPANTE */}
      {modalAberto && participanteEmEdicao && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-white/15 rounded-xl w-full max-w-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-shrink-0">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users size={16} className="text-cyan-400" />
                <span>Cadastro de Participante Fiscal (SPED 0150)</span>
              </h3>
              <button 
                onClick={() => setModalAberto(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSalvar} className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Código do Participante *</label>
                  <input
                    type="text"
                    value={participanteEmEdicao.codigo}
                    onChange={e => setParticipanteEmEdicao({ ...participanteEmEdicao, codigo: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Tipo de Pessoa *</label>
                  <select
                    value={participanteEmEdicao.tipoPessoa}
                    onChange={e => setParticipanteEmEdicao({ ...participanteEmEdicao, tipoPessoa: e.target.value as any, cnpjCpf: '' })}
                    className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="J">Pessoa Jurídica (CNPJ)</option>
                    <option value="F">Pessoa Física (CPF)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Relação Fiscal *</label>
                  <select
                    value={participanteEmEdicao.tipoRelacao}
                    onChange={e => setParticipanteEmEdicao({ ...participanteEmEdicao, tipoRelacao: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="FORNECEDOR">Fornecedor (Emitente)</option>
                    <option value="CLIENTE">Cliente (Destinatário)</option>
                    <option value="TRANSPORTADORA">Transportadora (CT-e)</option>
                    <option value="AMBOS">Ambos (Cliente e Fornecedor)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Razão Social / Nome Completo *</label>
                  <input
                    type="text"
                    value={participanteEmEdicao.nomeRazaoSocial}
                    onChange={e => setParticipanteEmEdicao({ ...participanteEmEdicao, nomeRazaoSocial: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Nome Fantasia</label>
                  <input
                    type="text"
                    value={participanteEmEdicao.nomeFantasia || ''}
                    onChange={e => setParticipanteEmEdicao({ ...participanteEmEdicao, nomeFantasia: e.target.value })}
                    className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-neutral-300">
                      {participanteEmEdicao.tipoPessoa === 'J' ? 'CNPJ *' : 'CPF *'}
                    </label>
                    {documentoLimpo.length >= 11 && (
                      <span className={`text-[10px] flex items-center gap-1 font-semibold ${
                        documentoValido ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {documentoValido ? <Check size={11} /> : <AlertTriangle size={11} />}
                        {documentoValido ? 'Válido' : 'Inválido'}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={participanteEmEdicao.cnpjCpf}
                    onChange={e => {
                      const val = participanteEmEdicao.tipoPessoa === 'J' 
                        ? maskCNPJ(e.target.value) 
                        : maskCPF(e.target.value);
                      setParticipanteEmEdicao({ ...participanteEmEdicao, cnpjCpf: val });
                    }}
                    placeholder={participanteEmEdicao.tipoPessoa === 'J' ? '00.000.000/0000-00' : '000.000.000-00'}
                    className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Inscrição Estadual (IE)</label>
                  <input
                    type="text"
                    value={participanteEmEdicao.inscricaoEstadual || ''}
                    onChange={e => setParticipanteEmEdicao({ ...participanteEmEdicao, inscricaoEstadual: e.target.value })}
                    placeholder="ISENTO se não houver"
                    className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Indicador Contribuinte ICMS</label>
                  <select
                    value={participanteEmEdicao.contribuinteICMS}
                    onChange={e => setParticipanteEmEdicao({ ...participanteEmEdicao, contribuinteICMS: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="1">1 - Contribuinte ICMS</option>
                    <option value="2">2 - Contribuinte Isento</option>
                    <option value="9">9 - Não Contribuinte</option>
                  </select>
                </div>
              </div>

              {/* Endereço e IBGE */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2 border-t border-white/5">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Estado (UF)</label>
                  <select
                    value={participanteEmEdicao.uf}
                    onChange={e => setParticipanteEmEdicao({ ...participanteEmEdicao, uf: e.target.value })}
                    className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Município *</label>
                  <input
                    type="text"
                    value={participanteEmEdicao.municipio}
                    onChange={e => setParticipanteEmEdicao({ ...participanteEmEdicao, municipio: e.target.value })}
                    className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Código IBGE (7 dígitos) *</label>
                  <input
                    type="text"
                    value={participanteEmEdicao.codigoIbge}
                    onChange={e => setParticipanteEmEdicao({ ...participanteEmEdicao, codigoIbge: unmask(e.target.value).slice(0, 7) })}
                    maxLength={7}
                    className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              {/* Vínculo Contábil e Contato */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-white/5">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Conta Contábil Vinculada (Plano de Contas)
                  </label>
                  <select
                    value={participanteEmEdicao.contaContabilId || ''}
                    onChange={e => setParticipanteEmEdicao({ 
                      ...participanteEmEdicao, 
                      contaContabilId: e.target.value ? Number(e.target.value) : undefined 
                    })}
                    className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">Selecione uma conta analítica...</option>
                    {contas.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.classificacao} - {c.nome} ({c.natureza === 'D' ? 'Devedora' : 'Credora'})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-neutral-400 mt-1">Conta para integração direta de duplicatas e lançamentos fiscais</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Telefone</label>
                  <input
                    type="text"
                    value={participanteEmEdicao.telefone || ''}
                    onChange={e => setParticipanteEmEdicao({ ...participanteEmEdicao, telefone: maskPhone(e.target.value) })}
                    placeholder="(00) 00000-0000"
                    className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={participanteEmEdicao.email || ''}
                    onChange={e => setParticipanteEmEdicao({ ...participanteEmEdicao, email: e.target.value })}
                    placeholder="contato@participante.com.br"
                    className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="checkAtivo"
                    checked={participanteEmEdicao.ativo}
                    onChange={e => setParticipanteEmEdicao({ ...participanteEmEdicao, ativo: e.target.checked })}
                    className="w-4 h-4 rounded bg-[#141414] border-white/20 text-cyan-600 focus:ring-0"
                  />
                  <label htmlFor="checkAtivo" className="text-xs text-neutral-200 cursor-pointer font-medium">
                    Participante Ativo para Movimentação
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-4 py-2 text-xs rounded-lg text-neutral-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/30 transition active:scale-95"
                >
                  Salvar Participante
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
