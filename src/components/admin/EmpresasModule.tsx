import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Save, 
  Trash2, 
  CheckCircle, 
  Search, 
  Check, 
  Briefcase, 
  MapPin, 
  UserCheck, 
  Sliders 
} from 'lucide-react';
import { Empresa, RegimeTributario } from '../../types/contabil';
import { dbService } from '../../db/sqliteService';

interface EmpresasModuleProps {
  empresaAtiva: Empresa;
  onSelectEmpresa: (id: number) => void;
}

export const EmpresasModule: React.FC<EmpresasModuleProps> = ({
  empresaAtiva,
  onSelectEmpresa
}) => {
  const [empresas, setEmpresas] = useState<Empresa[]>(dbService.getEmpresas());
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa>(empresaAtiva);
  const [activeTab, setActiveTab] = useState<'dados' | 'endereco' | 'responsaveis' | 'parametros'>('dados');
  const [searchTerm, setSearchTerm] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  const filteredEmpresas = empresas.filter(e => 
    e.razaoSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.cnpj.includes(searchTerm) ||
    String(e.codigo).includes(searchTerm)
  );

  const handleNovaEmpresa = () => {
    const proximoCodigo = empresas.reduce((max, e) => Math.max(max, e.codigo), 0) + 1;
    const nova: Empresa = {
      id: Date.now(),
      codigo: proximoCodigo,
      razaoSocial: 'NOVA EMPRESA CLIENTE LTDA',
      nomeFantasia: 'Nova Empresa',
      cnpj: '00.000.000/0001-00',
      regimeTributario: 'SIMPLES_NACIONAL',
      responsavelLegal: 'Sócio Administrador',
      cpfResponsavel: '000.000.000-00',
      contadorNome: empresaAtiva.contadorNome || 'Contador Responsável',
      contadorCRC: empresaAtiva.contadorCRC || 'CRC-SP 000000/O-0',
      mascaraPlano: '1.01.01.001.0001',
      exercicioAtivo: new Date().getFullYear(),
      competenciaAtiva: `${new Date().getFullYear()}-01`
    };
    setSelectedEmpresa(nova);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    dbService.saveEmpresa(selectedEmpresa);
    const atualizadas = dbService.getEmpresas();
    setEmpresas(atualizadas);
    setMensagemSucesso('Dados da empresa salvos com sucesso!');
    setTimeout(() => setMensagemSucesso(null), 3000);
  };

  const handleExcluir = (id: number) => {
    if (empresas.length <= 1) {
      alert('Não é possível excluir a única empresa cadastrada.');
      return;
    }
    if (window.confirm(`Tem certeza que deseja excluir a empresa ${selectedEmpresa.razaoSocial}?`)) {
      dbService.deleteEmpresa(id);
      const atualizadas = dbService.getEmpresas();
      setEmpresas(atualizadas);
      setSelectedEmpresa(atualizadas[0]);
      onSelectEmpresa(atualizadas[0].id);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 bg-[#141414] text-neutral-100 select-none overflow-hidden">
      {/* Cabeçalho do Módulo */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
            <Building2 size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">
              Cadastro de Empresas & Filiais
            </h1>
            <p className="text-xs text-neutral-400">
              Controle cadastral, regimes tributários e parâmetros estruturais dos clientes
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
            onClick={handleNovaEmpresa}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 transition"
          >
            <Plus size={15} />
            <span>Nova Empresa</span>
          </button>
        </div>
      </div>

      {/* Grid de Trabalho: Lista Lateral + Formulário em Abas */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 mt-4 overflow-hidden">
        {/* Painel Esquerdo: Lista de Empresas (4 colunas) */}
        <div className="md:col-span-4 bg-[#181818] border border-white/10 rounded-xl flex flex-col overflow-hidden">
          {/* Busca */}
          <div className="p-3 border-b border-white/5 bg-[#1a1a1a]">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Buscar por razão, CNPJ..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#141414] border border-white/10 rounded-lg text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Lista Rolável */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
            {filteredEmpresas.map(emp => {
              const isSelected = emp.id === selectedEmpresa.id;
              const isAtivaNoSistema = emp.id === empresaAtiva.id;

              return (
                <div
                  key={emp.id}
                  onClick={() => setSelectedEmpresa(emp)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition flex flex-col gap-1 ${
                    isSelected 
                      ? 'bg-blue-900/30 border-blue-500/50 shadow-md' 
                      : 'bg-[#1c1c1c] border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-neutral-400 font-bold">
                      #{String(emp.codigo).padStart(3, '0')}
                    </span>
                    {isAtivaNoSistema && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                        Ativa no Sistema
                      </span>
                    )}
                  </div>
                  <div className="font-semibold text-neutral-100 truncate">
                    {emp.razaoSocial}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono mt-1">
                    <span>{emp.cnpj}</span>
                    <span className="text-[10px] uppercase font-sans text-neutral-500">
                      {emp.regimeTributario.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Painel Direito: Formulário com Abas de Detalhes (8 colunas) */}
        <div className="md:col-span-8 bg-[#181818] border border-white/10 rounded-xl flex flex-col overflow-hidden">
          {/* Barra de Abas do Formulário */}
          <div className="h-11 px-4 bg-[#1a1a1a] border-b border-white/10 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('dados')}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-md transition ${
                  activeTab === 'dados' ? 'bg-white/15 text-white font-medium' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Briefcase size={14} />
                <span>Identificação</span>
              </button>

              <button
                onClick={() => setActiveTab('endereco')}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-md transition ${
                  activeTab === 'endereco' ? 'bg-white/15 text-white font-medium' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <MapPin size={14} />
                <span>Endereço & Contato</span>
              </button>

              <button
                onClick={() => setActiveTab('responsaveis')}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-md transition ${
                  activeTab === 'responsaveis' ? 'bg-white/15 text-white font-medium' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <UserCheck size={14} />
                <span>Representante & CRC</span>
              </button>

              <button
                onClick={() => setActiveTab('parametros')}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-md transition ${
                  activeTab === 'parametros' ? 'bg-white/15 text-white font-medium' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Sliders size={14} />
                <span>Parâmetros</span>
              </button>
            </div>

            {selectedEmpresa.id !== empresaAtiva.id && (
              <button
                onClick={() => onSelectEmpresa(selectedEmpresa.id)}
                className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-md bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 transition font-medium"
              >
                <CheckCircle size={14} />
                <span>Definir como Empresa Ativa</span>
              </button>
            )}
          </div>

          {/* Corpo do Formulário */}
          <form onSubmit={handleSalvar} className="flex-1 flex flex-col justify-between overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* ABA 1: IDENTIFICAÇÃO */}
              {activeTab === 'dados' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Código da Empresa</label>
                    <input
                      type="number"
                      value={selectedEmpresa.codigo}
                      onChange={e => setSelectedEmpresa({ ...selectedEmpresa, codigo: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Regime Tributário</label>
                    <select
                      value={selectedEmpresa.regimeTributario}
                      onChange={e => setSelectedEmpresa({ ...selectedEmpresa, regimeTributario: e.target.value as RegimeTributario })}
                      className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="SIMPLES_NACIONAL">Simples Nacional</option>
                      <option value="LUCRO_PRESUMIDO">Lucro Presumido</option>
                      <option value="LUCRO_REAL">Lucro Real</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Razão Social Oficial</label>
                    <input
                      type="text"
                      value={selectedEmpresa.razaoSocial}
                      onChange={e => setSelectedEmpresa({ ...selectedEmpresa, razaoSocial: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Nome Fantasia</label>
                    <input
                      type="text"
                      value={selectedEmpresa.nomeFantasia}
                      onChange={e => setSelectedEmpresa({ ...selectedEmpresa, nomeFantasia: e.target.value })}
                      className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-neutral-300 mb-1">CNPJ</label>
                    <input
                      type="text"
                      value={selectedEmpresa.cnpj}
                      onChange={e => setSelectedEmpresa({ ...selectedEmpresa, cnpj: e.target.value })}
                      className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Inscrição Estadual</label>
                    <input
                      type="text"
                      value={selectedEmpresa.inscricaoEstadual || ''}
                      onChange={e => setSelectedEmpresa({ ...selectedEmpresa, inscricaoEstadual: e.target.value })}
                      className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-neutral-300 mb-1">NIRE</label>
                    <input
                      type="text"
                      value={selectedEmpresa.nire || ''}
                      onChange={e => setSelectedEmpresa({ ...selectedEmpresa, nire: e.target.value })}
                      className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* ABA 2: ENDEREÇO & CONTATO */}
              {activeTab === 'endereco' && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Logradouro</label>
                    <input
                      type="text"
                      value={selectedEmpresa.logradouro || ''}
                      onChange={e => setSelectedEmpresa({ ...selectedEmpresa, logradouro: e.target.value })}
                      className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Número</label>
                    <input
                      type="text"
                      value={selectedEmpresa.numero || ''}
                      onChange={e => setSelectedEmpresa({ ...selectedEmpresa, numero: e.target.value })}
                      className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Complemento</label>
                    <input
                      type="text"
                      value={selectedEmpresa.complemento || ''}
                      onChange={e => setSelectedEmpresa({ ...selectedEmpresa, complemento: e.target.value })}
                      className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Bairro</label>
                    <input
                      type="text"
                      value={selectedEmpresa.bairro || ''}
                      onChange={e => setSelectedEmpresa({ ...selectedEmpresa, bairro: e.target.value })}
                      className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-neutral-300 mb-1">CEP</label>
                    <input
                      type="text"
                      value={selectedEmpresa.cep || ''}
                      onChange={e => setSelectedEmpresa({ ...selectedEmpresa, cep: e.target.value })}
                      className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Cidade</label>
                    <input
                      type="text"
                      value={selectedEmpresa.cidade || ''}
                      onChange={e => setSelectedEmpresa({ ...selectedEmpresa, cidade: e.target.value })}
                      className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-neutral-300 mb-1">UF</label>
                    <input
                      type="text"
                      value={selectedEmpresa.uf || ''}
                      onChange={e => setSelectedEmpresa({ ...selectedEmpresa, uf: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Telefone</label>
                    <input
                      type="text"
                      value={selectedEmpresa.telefone || ''}
                      onChange={e => setSelectedEmpresa({ ...selectedEmpresa, telefone: e.target.value })}
                      className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-neutral-300 mb-1">E-mail de Contato</label>
                    <input
                      type="email"
                      value={selectedEmpresa.email || ''}
                      onChange={e => setSelectedEmpresa({ ...selectedEmpresa, email: e.target.value })}
                      className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* ABA 3: REPRESENTANTES & CRC */}
              {activeTab === 'responsaveis' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <h3 className="text-xs font-bold uppercase text-neutral-400 border-b border-white/10 pb-1 mb-2">
                      Representante Legal / Titular
                    </h3>
                  </div>

                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Nome do Titular / Sócio</label>
                    <input
                      type="text"
                      value={selectedEmpresa.responsavelLegal}
                      onChange={e => setSelectedEmpresa({ ...selectedEmpresa, responsavelLegal: e.target.value })}
                      className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-neutral-300 mb-1">CPF do Titular</label>
                    <input
                      type="text"
                      value={selectedEmpresa.cpfResponsavel}
                      onChange={e => setSelectedEmpresa({ ...selectedEmpresa, cpfResponsavel: e.target.value })}
                      className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="col-span-2 mt-4">
                    <h3 className="text-xs font-bold uppercase text-neutral-400 border-b border-white/10 pb-1 mb-2">
                      Contabilista Responsável (CRC)
                    </h3>
                  </div>

                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Nome do Contador</label>
                    <input
                      type="text"
                      value={selectedEmpresa.contadorNome}
                      onChange={e => setSelectedEmpresa({ ...selectedEmpresa, contadorNome: e.target.value })}
                      className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Número do CRC</label>
                    <input
                      type="text"
                      value={selectedEmpresa.contadorCRC}
                      onChange={e => setSelectedEmpresa({ ...selectedEmpresa, contadorCRC: e.target.value })}
                      className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              )}

              {/* ABA 4: PARÂMETROS */}
              {activeTab === 'parametros' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Máscara do Plano de Contas</label>
                    <input
                      type="text"
                      value={selectedEmpresa.mascaraPlano}
                      onChange={e => setSelectedEmpresa({ ...selectedEmpresa, mascaraPlano: e.target.value })}
                      className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                    <p className="text-[10px] text-neutral-400 mt-1">Padrão Domínio: 1.01.01.001.0001 (5 Graus)</p>
                  </div>

                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Exercício Ativo</label>
                    <input
                      type="number"
                      value={selectedEmpresa.exercicioAtivo}
                      onChange={e => setSelectedEmpresa({ ...selectedEmpresa, exercicioAtivo: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Competência de Trabalho</label>
                    <input
                      type="month"
                      value={selectedEmpresa.competenciaAtiva}
                      onChange={e => setSelectedEmpresa({ ...selectedEmpresa, competenciaAtiva: e.target.value })}
                      className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Rodapé com Ações de Gravação e Exclusão */}
            <div className="p-4 bg-[#1a1a1a] border-t border-white/10 flex items-center justify-between flex-shrink-0">
              <button
                type="button"
                onClick={() => handleExcluir(selectedEmpresa.id)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition"
              >
                <Trash2 size={15} />
                <span>Excluir Empresa</span>
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition"
              >
                <Save size={15} />
                <span>Salvar Alterações</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
