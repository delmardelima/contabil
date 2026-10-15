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
  Sliders,
  Users,
  Calendar,
  AlertTriangle,
  ShieldCheck,
  X,
  Edit3,
  Percent,
  FileText
} from 'lucide-react';
import { Empresa, RegimeTributario, SocioAdministrador, VigenciaTributaria } from '../../types/contabil';
import { dbService } from '../../db/sqliteService';
import {
  maskCNPJ,
  validarCNPJ,
  maskCPF,
  validarCPF,
  maskCEP,
  maskCNAE,
  maskPhone,
  formatCurrency,
  formatPercent,
  unmask
} from '../../utils/formatters';

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
  const [activeTab, setActiveTab] = useState<'geral' | 'endereco' | 'atividades' | 'socios' | 'vigencias'>('geral');
  const [searchTerm, setSearchTerm] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  // Estado para Modal de Sócio
  const [modalSocioAberto, setModalSocioAberto] = useState(false);
  const [socioEmEdicao, setSocioEmEdicao] = useState<SocioAdministrador | null>(null);

  // Estado para Modal de Vigência
  const [modalVigenciaAberto, setModalVigenciaAberto] = useState(false);
  const [novaVigencia, setNovaVigencia] = useState<VigenciaTributaria>({
    id: Date.now(),
    inicioCompetencia: `${new Date().getFullYear()}-01`,
    regimeTributario: 'SIMPLES_NACIONAL',
    regimeApuracao: 'COMPETENCIA',
    enquadramentoSimples: 'MICROEMPRESA'
  });

  // Novo CNAE Secundário
  const [novoCnaeSecundario, setNovoCnaeSecundario] = useState('');

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
      cnpj: '',
      porteEmpresa: 'ME',
      regimeTributario: 'SIMPLES_NACIONAL',
      responsavelLegal: 'Sócio Administrador',
      cpfResponsavel: '',
      contadorNome: empresaAtiva.contadorNome || 'Helena Silveira Santos',
      contadorCRC: empresaAtiva.contadorCRC || 'CRC-SP 1SP234567/O-8',
      contadorCPF: empresaAtiva.contadorCPF || '987.654.321-11',
      mascaraPlano: '1.01.01.001.0001',
      exigeCentroCusto: true,
      exercicioAtivo: new Date().getFullYear(),
      competenciaAtiva: `${new Date().getFullYear()}-01`,
      socios: [],
      vigencias: [
        {
          id: Date.now(),
          inicioCompetencia: `${new Date().getFullYear()}-01`,
          regimeTributario: 'SIMPLES_NACIONAL',
          regimeApuracao: 'COMPETENCIA',
          enquadramentoSimples: 'MICROEMPRESA'
        }
      ]
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

  // Funções de Gestão de Sócios
  const handleAbrirModalSocio = (socio?: SocioAdministrador) => {
    if (socio) {
      setSocioEmEdicao({ ...socio });
    } else {
      setSocioEmEdicao({
        id: Date.now(),
        nome: '',
        cpf: '',
        qualificacaoRFB: '49 - Sócio-Administrador',
        percentualCapital: 0,
        dataEntrada: new Date().toISOString().slice(0, 10),
        retiraProLabore: false,
        valorProLabore: 0,
        percentualLucros: 0
      });
    }
    setModalSocioAberto(true);
  };

  const handleSalvarSocio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socioEmEdicao) return;

    const sociosAtuais = selectedEmpresa.socios || [];
    const index = sociosAtuais.findIndex(s => s.id === socioEmEdicao.id);
    let novosSocios: SocioAdministrador[];

    if (index >= 0) {
      novosSocios = sociosAtuais.map(s => s.id === socioEmEdicao.id ? socioEmEdicao : s);
    } else {
      novosSocios = [...sociosAtuais, socioEmEdicao];
    }

    setSelectedEmpresa({ ...selectedEmpresa, socios: novosSocios });
    setModalSocioAberto(false);
    setSocioEmEdicao(null);
  };

  const handleExcluirSocio = (id: number) => {
    const novosSocios = (selectedEmpresa.socios || []).filter(s => s.id !== id);
    setSelectedEmpresa({ ...selectedEmpresa, socios: novosSocios });
  };

  // Funções de Gestão de Vigências
  const handleSalvarVigencia = (e: React.FormEvent) => {
    e.preventDefault();
    const vigenciasAtuais = selectedEmpresa.vigencias || [];
    const novasVigencias = [...vigenciasAtuais, { ...novaVigencia, id: Date.now() }].sort(
      (a, b) => b.inicioCompetencia.localeCompare(a.inicioCompetencia)
    );
    setSelectedEmpresa({
      ...selectedEmpresa,
      vigencias: novasVigencias,
      regimeTributario: novasVigencias[0]?.regimeTributario || selectedEmpresa.regimeTributario
    });
    setModalVigenciaAberto(false);
  };

  const handleExcluirVigencia = (id: number) => {
    const novasVigencias = (selectedEmpresa.vigencias || []).filter(v => v.id !== id);
    setSelectedEmpresa({ ...selectedEmpresa, vigencias: novasVigencias });
  };

  // Adicionar CNAE secundário
  const handleAdicionarCnaeSecundario = () => {
    if (!novoCnaeSecundario.trim()) return;
    const formatado = maskCNAE(novoCnaeSecundario);
    const atuais = selectedEmpresa.cnaesSecundarios || [];
    if (!atuais.includes(formatado)) {
      setSelectedEmpresa({
        ...selectedEmpresa,
        cnaesSecundarios: [...atuais, formatado]
      });
    }
    setNovoCnaeSecundario('');
  };

  const handleRemoverCnaeSecundario = (cnae: string) => {
    const atuais = (selectedEmpresa.cnaesSecundarios || []).filter(c => c !== cnae);
    setSelectedEmpresa({ ...selectedEmpresa, cnaesSecundarios: atuais });
  };

  // Totalizador de Capital Social
  const totalPercentualCapital = (selectedEmpresa.socios || []).reduce(
    (acc, s) => acc + (Number(s.percentualCapital) || 0),
    0
  );
  const capitalTotalmenteIntegralizado = Math.abs(totalPercentualCapital - 100) < 0.01;

  // Validação do CNPJ
  const cnpjLimpo = unmask(selectedEmpresa.cnpj);
  const cnpjValido = cnpjLimpo.length === 14 ? validarCNPJ(selectedEmpresa.cnpj) : false;

  return (
    <div className="h-full flex flex-col p-6 bg-[#141414] text-neutral-100 select-none overflow-hidden">
      {/* Cabeçalho do Módulo */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
            <Building2 size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span>Cadastro de Empresas & Parâmetros Fiscais</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono">
                GEEMPRE
              </span>
            </h1>
            <p className="text-xs text-neutral-400">
              Controle cadastral em 5 abas, histórico de vigências, CNAEs e quadro societário (SPED / eSocial / RFB)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {mensagemSucesso && (
            <div className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-2 animate-fade-in">
              <Check size={14} />
              <span>{mensagemSucesso}</span>
            </div>
          )}

          <button
            onClick={handleNovaEmpresa}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 transition active:scale-95"
          >
            <Plus size={15} />
            <span>Nova Empresa</span>
          </button>
        </div>
      </div>

      {/* Grid de Trabalho: Lista Lateral + Formulário em 5 Abas */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 mt-4 overflow-hidden">
        {/* Painel Esquerdo: Lista de Empresas (4 colunas) */}
        <div className="md:col-span-4 bg-[#181818] border border-white/10 rounded-xl flex flex-col overflow-hidden">
          {/* Busca */}
          <div className="p-3 border-b border-white/5 bg-[#1a1a1a]">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Buscar por razão, CNPJ, código..."
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
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition flex flex-col gap-1 ${isSelected
                      ? 'bg-blue-900/30 border-blue-500/50 shadow-md'
                      : 'bg-[#1c1c1c] border-white/5 hover:border-white/15'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-neutral-400 font-bold">
                      #{String(emp.codigo).padStart(3, '0')}
                    </span>
                    {isAtivaNoSistema && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1">
                        <CheckCircle size={10} />
                        <span>Ativa no Sistema</span>
                      </span>
                    )}
                  </div>
                  <div className="font-semibold text-neutral-100 truncate">
                    {emp.razaoSocial}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono mt-1">
                    <span>{emp.cnpj || 'Sem CNPJ'}</span>
                    <span className="text-[10px] uppercase font-sans text-neutral-500">
                      {emp.regimeTributario.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Painel Direito: Formulário com 5 Abas de Detalhes (8 colunas) */}
        <div className="md:col-span-8 bg-[#181818] border border-white/10 rounded-xl flex flex-col overflow-hidden">
          {/* Barra de Abas do Formulário */}
          <div className="h-11 px-4 bg-[#1a1a1a] border-b border-white/10 flex items-center justify-between flex-shrink-0 overflow-x-auto">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('geral')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition ${activeTab === 'geral' ? 'bg-white/15 text-white font-medium shadow' : 'text-neutral-400 hover:text-white'
                  }`}
              >
                <Briefcase size={13} />
                <span>1. Geral & Identificação</span>
              </button>

              <button
                onClick={() => setActiveTab('endereco')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition ${activeTab === 'endereco' ? 'bg-white/15 text-white font-medium shadow' : 'text-neutral-400 hover:text-white'
                  }`}
              >
                <MapPin size={13} />
                <span>2. Endereço & Localização</span>
              </button>

              <button
                onClick={() => setActiveTab('atividades')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition ${activeTab === 'atividades' ? 'bg-white/15 text-white font-medium shadow' : 'text-neutral-400 hover:text-white'
                  }`}
              >
                <FileText size={13} />
                <span>3. Atividades (CNAE)</span>
              </button>

              <button
                onClick={() => setActiveTab('socios')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition ${activeTab === 'socios' ? 'bg-white/15 text-white font-medium shadow' : 'text-neutral-400 hover:text-white'
                  }`}
              >
                <Users size={13} />
                <span>4. Quadro Societário</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 font-mono">
                  {(selectedEmpresa.socios || []).length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('vigencias')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition ${activeTab === 'vigencias' ? 'bg-white/15 text-white font-medium shadow' : 'text-neutral-400 hover:text-white'
                  }`}
              >
                <Calendar size={13} />
                <span>5. Vigências & Parâmetros</span>
              </button>
            </div>

            {selectedEmpresa.id !== empresaAtiva.id && (
              <button
                type="button"
                onClick={() => onSelectEmpresa(selectedEmpresa.id)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 transition font-medium flex-shrink-0"
              >
                <CheckCircle size={13} />
                <span>Definir Ativa</span>
              </button>
            )}
          </div>

          {/* Corpo do Formulário */}
          <form onSubmit={handleSalvar} className="flex-1 flex flex-col justify-between overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">

              {/* GUIA 1: GERAL & IDENTIFICAÇÃO */}
              {activeTab === 'geral' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Código da Empresa *</label>
                      <input
                        type="number"
                        value={selectedEmpresa.codigo}
                        onChange={e => setSelectedEmpresa({ ...selectedEmpresa, codigo: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    <div className="col-span-3">
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Razão Social Completa *</label>
                      <input
                        type="text"
                        value={selectedEmpresa.razaoSocial}
                        onChange={e => setSelectedEmpresa({ ...selectedEmpresa, razaoSocial: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Nome Fantasia</label>
                      <input
                        type="text"
                        value={selectedEmpresa.nomeFantasia}
                        onChange={e => setSelectedEmpresa({ ...selectedEmpresa, nomeFantasia: e.target.value })}
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-medium text-neutral-300">CNPJ (Receita Federal) *</label>
                        {cnpjLimpo.length === 14 && (
                          <span className={`text-[10px] flex items-center gap-1 font-semibold ${cnpjValido ? 'text-emerald-400' : 'text-rose-400'
                            }`}>
                            {cnpjValido ? <Check size={11} /> : <AlertTriangle size={11} />}
                            {cnpjValido ? 'CNPJ Válido' : 'Dígito Incorreto'}
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={selectedEmpresa.cnpj}
                        onChange={e => setSelectedEmpresa({ ...selectedEmpresa, cnpj: maskCNPJ(e.target.value) })}
                        placeholder="00.000.000/0000-00"
                        maxLength={18}
                        className={`w-full px-3 py-2 bg-[#141414] border rounded-lg text-xs font-mono text-white focus:outline-none ${cnpjLimpo.length === 14 && !cnpjValido
                            ? 'border-rose-500/50 focus:border-rose-500'
                            : 'border-white/10 focus:border-blue-500'
                          }`}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Inscrição Estadual (IE)</label>
                      <input
                        type="text"
                        value={selectedEmpresa.inscricaoEstadual || ''}
                        onChange={e => setSelectedEmpresa({ ...selectedEmpresa, inscricaoEstadual: e.target.value })}
                        placeholder="Ex: 110.234.567.890"
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Inscrição Municipal (IM)</label>
                      <input
                        type="text"
                        value={selectedEmpresa.inscricaoMunicipal || ''}
                        onChange={e => setSelectedEmpresa({ ...selectedEmpresa, inscricaoMunicipal: e.target.value })}
                        placeholder="Ex: 4.567.890-1"
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Inscrição SUFRAMA</label>
                      <input
                        type="text"
                        value={selectedEmpresa.inscricaoSuframa || ''}
                        onChange={e => setSelectedEmpresa({ ...selectedEmpresa, inscricaoSuframa: e.target.value })}
                        placeholder="Ex: 90.123.456-7"
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">NIRE (Junta Comercial)</label>
                      <input
                        type="text"
                        value={selectedEmpresa.nire || ''}
                        onChange={e => setSelectedEmpresa({ ...selectedEmpresa, nire: e.target.value })}
                        placeholder="11 dígitos"
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Data de Constituição</label>
                      <input
                        type="date"
                        value={selectedEmpresa.dataConstituicao || ''}
                        onChange={e => setSelectedEmpresa({ ...selectedEmpresa, dataConstituicao: e.target.value })}
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Natureza Jurídica</label>
                      <select
                        value={selectedEmpresa.naturezaJuridica || '206-2'}
                        onChange={e => setSelectedEmpresa({ ...selectedEmpresa, naturezaJuridica: e.target.value })}
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="206-2">206-2 - Sociedade Empresária Limitada</option>
                        <option value="213-5">213-5 - Empresário Individual (EI)</option>
                        <option value="205-4">205-4 - Sociedade Anônima Fechada</option>
                        <option value="204-6">204-6 - Sociedade Anônima Aberta</option>
                        <option value="223-2">223-2 - Sociedade Simples Pura</option>
                        <option value="224-0">224-0 - Sociedade Simples Limitada</option>
                        <option value="230-5">230-5 - Empresa Individual de Resp. Ltda (EIRELI)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Porte da Empresa</label>
                      <select
                        value={selectedEmpresa.porteEmpresa || 'ME'}
                        onChange={e => setSelectedEmpresa({ ...selectedEmpresa, porteEmpresa: e.target.value as any })}
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="ME">ME - Microempresa</option>
                        <option value="EPP">EPP - Empresa de Pequeno Porte</option>
                        <option value="DEMAIS">DEMAIS - Médio / Grande Porte</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* GUIA 2: ENDEREÇO & LOCALIZAÇÃO FISCAL */}
              {activeTab === 'endereco' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">CEP *</label>
                      <input
                        type="text"
                        value={selectedEmpresa.cep || ''}
                        onChange={e => setSelectedEmpresa({ ...selectedEmpresa, cep: maskCEP(e.target.value) })}
                        placeholder="00000-000"
                        maxLength={9}
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Logradouro / Rua / Avenida</label>
                      <input
                        type="text"
                        value={selectedEmpresa.logradouro || ''}
                        onChange={e => setSelectedEmpresa({ ...selectedEmpresa, logradouro: e.target.value })}
                        placeholder="Ex: Avenida Paulista"
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Número</label>
                      <input
                        type="text"
                        value={selectedEmpresa.numero || ''}
                        onChange={e => setSelectedEmpresa({ ...selectedEmpresa, numero: e.target.value })}
                        placeholder="Ex: 1500"
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Complemento</label>
                      <input
                        type="text"
                        value={selectedEmpresa.complemento || ''}
                        onChange={e => setSelectedEmpresa({ ...selectedEmpresa, complemento: e.target.value })}
                        placeholder="Ex: Conjunto 1401"
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Bairro</label>
                      <input
                        type="text"
                        value={selectedEmpresa.bairro || ''}
                        onChange={e => setSelectedEmpresa({ ...selectedEmpresa, bairro: e.target.value })}
                        placeholder="Ex: Bela Vista"
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Estado (UF)</label>
                      <select
                        value={selectedEmpresa.uf || 'SP'}
                        onChange={e => setSelectedEmpresa({ ...selectedEmpresa, uf: e.target.value })}
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                      >
                        {['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'].map(uf => (
                          <option key={uf} value={uf}>{uf}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Município</label>
                      <input
                        type="text"
                        value={selectedEmpresa.cidade || ''}
                        onChange={e => setSelectedEmpresa({ ...selectedEmpresa, cidade: e.target.value })}
                        placeholder="Ex: São Paulo"
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-medium text-neutral-300">Código IBGE (7 dígitos) *</label>
                        <span className="text-[10px] text-amber-400 font-mono">Obrigatório SPED</span>
                      </div>
                      <input
                        type="text"
                        value={selectedEmpresa.codigoIbge || ''}
                        onChange={e => setSelectedEmpresa({ ...selectedEmpresa, codigoIbge: unmask(e.target.value).slice(0, 7) })}
                        placeholder="Ex: 3550308"
                        maxLength={7}
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-emerald-400 font-bold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/5">
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Telefone Principal</label>
                      <input
                        type="text"
                        value={selectedEmpresa.telefone || ''}
                        onChange={e => setSelectedEmpresa({ ...selectedEmpresa, telefone: maskPhone(e.target.value) })}
                        placeholder="(00) 00000-0000"
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">E-mail Fiscal / Contábil</label>
                      <input
                        type="email"
                        value={selectedEmpresa.email || ''}
                        onChange={e => setSelectedEmpresa({ ...selectedEmpresa, email: e.target.value })}
                        placeholder="contato@empresa.com.br"
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* GUIA 3: ATIVIDADES ECONÔMICAS (CNAE & TRIBUTÁRIO) */}
              {activeTab === 'atividades' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-neutral-300 mb-1">CNAE Principal (Atividade Primária) *</label>
                      <input
                        type="text"
                        value={selectedEmpresa.cnaePrincipal || ''}
                        onChange={e => setSelectedEmpresa({ ...selectedEmpresa, cnaePrincipal: maskCNAE(e.target.value) })}
                        placeholder="0000-0/00 (Ex: 6920-6/01)"
                        maxLength={9}
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono font-bold text-white focus:outline-none focus:border-blue-500"
                      />
                      <p className="text-[10px] text-neutral-400 mt-1">Classificação Nacional de Atividades Econômicas da RFB</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Anexo Simples Nacional</label>
                      <select
                        value={selectedEmpresa.anexoPadraoSimples || 'ANEXO_III'}
                        onChange={e => setSelectedEmpresa({ ...selectedEmpresa, anexoPadraoSimples: e.target.value })}
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="ANEXO_I">Anexo I - Comércio</option>
                        <option value="ANEXO_II">Anexo II - Indústria</option>
                        <option value="ANEXO_III">Anexo III - Serviços Gerais</option>
                        <option value="ANEXO_IV">Anexo IV - Serviços com INSS Patronal</option>
                        <option value="ANEXO_V">Anexo V - Serviços Sujeitos a Fator R</option>
                      </select>
                    </div>
                  </div>

                  {/* Gerenciador de CNAEs Secundários */}
                  <div className="p-4 bg-[#141414] border border-white/10 rounded-xl space-y-3">
                    <label className="block text-xs font-semibold text-neutral-200">
                      CNAEs Secundários Autorizados
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={novoCnaeSecundario}
                        onChange={e => setNovoCnaeSecundario(maskCNAE(e.target.value))}
                        placeholder="Digitar código CNAE (ex: 7020-4/00)"
                        maxLength={9}
                        className="flex-1 px-3 py-1.5 bg-[#181818] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={handleAdicionarCnaeSecundario}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition"
                      >
                        <Plus size={14} />
                        <span>Adicionar CNAE</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {(selectedEmpresa.cnaesSecundarios || []).length === 0 ? (
                        <span className="text-xs text-neutral-500 italic">Nenhum CNAE secundário cadastrado.</span>
                      ) : (
                        (selectedEmpresa.cnaesSecundarios || []).map(cnae => (
                          <div
                            key={cnae}
                            className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#1c1c1c] border border-white/10 text-xs font-mono text-neutral-200"
                          >
                            <span>{cnae}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoverCnaeSecundario(cnae)}
                              className="text-neutral-400 hover:text-rose-400 transition"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Parâmetros Trabalhistas e de Serviços */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 border-t border-white/5">
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Alíquota ISS do Município (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={selectedEmpresa.aliquotaISS || 0}
                        onChange={e => setSelectedEmpresa({ ...selectedEmpresa, aliquotaISS: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Código FPAS (Folha)</label>
                      <input
                        type="text"
                        value={selectedEmpresa.fpas || ''}
                        onChange={e => setSelectedEmpresa({ ...selectedEmpresa, fpas: e.target.value })}
                        placeholder="Ex: 515"
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Cód. Terceiros (Outras Entid.)</label>
                      <input
                        type="text"
                        value={selectedEmpresa.codigoTerceiros || ''}
                        onChange={e => setSelectedEmpresa({ ...selectedEmpresa, codigoTerceiros: e.target.value })}
                        placeholder="Ex: 0115"
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-5">
                      <input
                        type="checkbox"
                        id="checkFatorR"
                        checked={selectedEmpresa.fatorR || false}
                        onChange={e => setSelectedEmpresa({ ...selectedEmpresa, fatorR: e.target.checked })}
                        className="w-4 h-4 rounded bg-[#141414] border-white/20 text-blue-600 focus:ring-0"
                      />
                      <label htmlFor="checkFatorR" className="text-xs text-neutral-200 cursor-pointer">
                        Sujeita ao Fator R (Folha/Receita &gt;= 28%)
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* GUIA 4: QUADRO SOCIETÁRIO & ADMINISTRADORES */}
              {activeTab === 'socios' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-semibold text-white">Quadro de Sócios e Administradores (QSA)</h3>
                      <p className="text-[11px] text-neutral-400">Controle societário para DIRF, eSocial (S-2300), ECF e distribuição de lucros</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`px-3 py-1 rounded-lg border text-xs font-mono flex items-center gap-1.5 ${capitalTotalmenteIntegralizado
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        }`}>
                        <Percent size={13} />
                        <span>Capital: {formatPercent(totalPercentualCapital)}</span>
                        {capitalTotalmenteIntegralizado ? (
                          <span className="text-[10px] font-sans font-semibold ml-1">(100% OK)</span>
                        ) : (
                          <span className="text-[10px] font-sans font-semibold ml-1">(Divergente)</span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAbrirModalSocio()}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition shadow"
                      >
                        <Plus size={14} />
                        <span>Adicionar Sócio</span>
                      </button>
                    </div>
                  </div>

                  {/* Tabela de Sócios */}
                  <div className="border border-white/10 rounded-xl overflow-hidden bg-[#141414]">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#1c1c1c] text-neutral-400 border-b border-white/10 font-mono">
                        <tr>
                          <th className="py-2.5 px-4">Nome do Sócio</th>
                          <th className="py-2.5 px-3">CPF</th>
                          <th className="py-2.5 px-3">Qualificação RFB</th>
                          <th className="py-2.5 px-3 text-right">% Capital</th>
                          <th className="py-2.5 px-3 text-center">Pró-Labore</th>
                          <th className="py-2.5 px-3 text-right">Valor Pró-Labore</th>
                          <th className="py-2.5 px-4 text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-sans">
                        {(selectedEmpresa.socios || []).length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-neutral-500 text-xs italic">
                              Nenhum sócio ou administrador cadastrado no quadro societário.
                            </td>
                          </tr>
                        ) : (
                          (selectedEmpresa.socios || []).map(s => (
                            <tr key={s.id} className="hover:bg-white/[0.02] transition">
                              <td className="py-2.5 px-4 font-semibold text-white">{s.nome}</td>
                              <td className="py-2.5 px-3 font-mono text-neutral-300">{s.cpf}</td>
                              <td className="py-2.5 px-3 text-neutral-400">{s.qualificacaoRFB || '49 - Sócio-Administrador'}</td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-400">
                                {formatPercent(s.percentualCapital)}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                {s.retiraProLabore ? (
                                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                    Sim
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[10px] bg-neutral-800 text-neutral-400">
                                    Não
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono text-neutral-200">
                                {s.retiraProLabore ? formatCurrency(s.valorProLabore) : '-'}
                              </td>
                              <td className="py-2.5 px-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleAbrirModalSocio(s)}
                                    className="p-1 hover:text-blue-400 text-neutral-400 transition"
                                    title="Editar Sócio"
                                  >
                                    <Edit3 size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleExcluirSocio(s.id)}
                                    className="p-1 hover:text-rose-400 text-neutral-400 transition"
                                    title="Excluir Sócio"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* GUIA 5: VIGÊNCIAS TRIBUTÁRIAS & PARÂMETROS */}
              {activeTab === 'vigencias' && (
                <div className="space-y-4">
                  {/* Histórico de Vigências */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-semibold text-white">Histórico de Vigências Tributárias (EFPARAMETRO_VIGENCIA)</h3>
                        <p className="text-[11px] text-neutral-400">Mudanças de regime fiscal (Simples, Presumido, Real) ao longo dos anos</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setModalVigenciaAberto(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition shadow"
                      >
                        <Plus size={14} />
                        <span>Nova Vigência</span>
                      </button>
                    </div>

                    <div className="border border-white/10 rounded-xl overflow-hidden bg-[#141414]">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-[#1c1c1c] text-neutral-400 border-b border-white/10 font-mono">
                          <tr>
                            <th className="py-2.5 px-4">Início Competência</th>
                            <th className="py-2.5 px-4">Fim Competência</th>
                            <th className="py-2.5 px-4">Regime Tributário</th>
                            <th className="py-2.5 px-4">Regime de Apuração</th>
                            <th className="py-2.5 px-4 text-center">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-sans">
                          {(selectedEmpresa.vigencias || []).length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-6 text-center text-neutral-500 text-xs italic">
                                Nenhuma vigência cadastrada. O sistema utilizará o regime padrão.
                              </td>
                            </tr>
                          ) : (
                            (selectedEmpresa.vigencias || []).map(v => (
                              <tr key={v.id} className="hover:bg-white/[0.02] transition">
                                <td className="py-2.5 px-4 font-mono font-bold text-white">{v.inicioCompetencia}</td>
                                <td className="py-2.5 px-4 font-mono text-neutral-400">{v.fimCompetencia || 'Em Vigor'}</td>
                                <td className="py-2.5 px-4">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                    {v.regimeTributario.replace('_', ' ')}
                                  </span>
                                </td>
                                <td className="py-2.5 px-4 font-mono text-neutral-300">{v.regimeApuracao}</td>
                                <td className="py-2.5 px-4 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleExcluirVigencia(v.id)}
                                    className="p-1 hover:text-rose-400 text-neutral-400 transition"
                                    title="Remover Vigência"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Parâmetros Contábeis e Representantes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Máscara do Plano de Contas</label>
                      <input
                        type="text"
                        value={selectedEmpresa.mascaraPlano}
                        onChange={e => setSelectedEmpresa({ ...selectedEmpresa, mascaraPlano: e.target.value })}
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                        required
                      />
                      <p className="text-[10px] text-neutral-400 mt-1">Padrão : 1.01.01.001.0001 (5 Graus)</p>
                    </div>

                    <div className="flex items-center gap-3 pt-6">
                      <input
                        type="checkbox"
                        id="checkCentroCusto"
                        checked={selectedEmpresa.exigeCentroCusto || false}
                        onChange={e => setSelectedEmpresa({ ...selectedEmpresa, exigeCentroCusto: e.target.checked })}
                        className="w-4 h-4 rounded bg-[#141414] border-white/20 text-blue-600 focus:ring-0"
                      />
                      <label htmlFor="checkCentroCusto" className="text-xs text-neutral-200 cursor-pointer">
                        Exigir Centro de Custo em Lançamentos de Receita e Despesa
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-white/5">
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Representante Legal (Receita)</label>
                      <input
                        type="text"
                        value={selectedEmpresa.responsavelLegal || ''}
                        onChange={e => setSelectedEmpresa({ ...selectedEmpresa, responsavelLegal: e.target.value })}
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">CPF do Representante</label>
                      <input
                        type="text"
                        value={selectedEmpresa.cpfResponsavel || ''}
                        onChange={e => setSelectedEmpresa({ ...selectedEmpresa, cpfResponsavel: maskCPF(e.target.value) })}
                        maxLength={14}
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Competência Ativa</label>
                      <input
                        type="month"
                        value={selectedEmpresa.competenciaAtiva}
                        onChange={e => setSelectedEmpresa({ ...selectedEmpresa, competenciaAtiva: e.target.value })}
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Contador Responsável</label>
                      <input
                        type="text"
                        value={selectedEmpresa.contadorNome || ''}
                        onChange={e => setSelectedEmpresa({ ...selectedEmpresa, contadorNome: e.target.value })}
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Registro CRC</label>
                      <input
                        type="text"
                        value={selectedEmpresa.contadorCRC || ''}
                        onChange={e => setSelectedEmpresa({ ...selectedEmpresa, contadorCRC: e.target.value })}
                        placeholder="Ex: CRC-SP 1SP234567/O-8"
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">CPF do Contador</label>
                      <input
                        type="text"
                        value={selectedEmpresa.contadorCPF || ''}
                        onChange={e => setSelectedEmpresa({ ...selectedEmpresa, contadorCPF: maskCPF(e.target.value) })}
                        placeholder="000.000.000-00"
                        maxLength={14}
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
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
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition active:scale-95"
              >
                <Save size={15} />
                <span>Salvar Todas as Alterações</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* MODAL: ADICIONAR / EDITAR SÓCIO */}
      {modalSocioAberto && socioEmEdicao && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-white/15 rounded-xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users size={16} className="text-blue-400" />
                <span>Dados do Sócio / Administrador</span>
              </h3>
              <button
                onClick={() => setModalSocioAberto(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSalvarSocio} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  value={socioEmEdicao.nome}
                  onChange={e => setSocioEmEdicao({ ...socioEmEdicao, nome: e.target.value })}
                  className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">CPF *</label>
                  <input
                    type="text"
                    value={socioEmEdicao.cpf}
                    onChange={e => setSocioEmEdicao({ ...socioEmEdicao, cpf: maskCPF(e.target.value) })}
                    maxLength={14}
                    className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">% de Capital *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={socioEmEdicao.percentualCapital}
                    onChange={e => setSocioEmEdicao({ ...socioEmEdicao, percentualCapital: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Qualificação RFB</label>
                  <select
                    value={socioEmEdicao.qualificacaoRFB || '49 - Sócio-Administrador'}
                    onChange={e => setSocioEmEdicao({ ...socioEmEdicao, qualificacaoRFB: e.target.value })}
                    className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="49 - Sócio-Administrador">49 - Sócio-Administrador</option>
                    <option value="22 - Sócio">22 - Sócio</option>
                    <option value="05 - Administrador">05 - Administrador</option>
                    <option value="16 - Presidente">16 - Presidente</option>
                    <option value="10 - Diretor">10 - Diretor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Data de Entrada</label>
                  <input
                    type="date"
                    value={socioEmEdicao.dataEntrada}
                    onChange={e => setSocioEmEdicao({ ...socioEmEdicao, dataEntrada: e.target.value })}
                    className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-[#141414] rounded-lg border border-white/5 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="checkProLabore"
                    checked={socioEmEdicao.retiraProLabore}
                    onChange={e => setSocioEmEdicao({ ...socioEmEdicao, retiraProLabore: e.target.checked })}
                    className="w-4 h-4 rounded bg-[#181818] border-white/20 text-blue-600 focus:ring-0"
                  />
                  <label htmlFor="checkProLabore" className="text-xs text-neutral-200 cursor-pointer font-medium">
                    Sócio retira Pró-Labore mensal
                  </label>
                </div>

                {socioEmEdicao.retiraProLabore && (
                  <div className="pt-2">
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Valor do Pró-Labore (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={socioEmEdicao.valorProLabore || 0}
                      onChange={e => setSocioEmEdicao({ ...socioEmEdicao, valorProLabore: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-[#181818] border border-white/10 rounded-lg text-xs font-mono text-emerald-400 font-bold focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalSocioAberto(false)}
                  className="px-3 py-1.5 text-xs rounded-lg text-neutral-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow"
                >
                  Confirmar Sócio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADICIONAR VIGÊNCIA TRIBUTÁRIA */}
      {modalVigenciaAberto && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-white/15 rounded-xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar size={16} className="text-blue-400" />
                <span>Nova Vigência Tributária</span>
              </h3>
              <button
                onClick={() => setModalVigenciaAberto(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSalvarVigencia} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Início da Competência *</label>
                <input
                  type="month"
                  value={novaVigencia.inicioCompetencia}
                  onChange={e => setNovaVigencia({ ...novaVigencia, inicioCompetencia: e.target.value })}
                  className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Regime Tributário *</label>
                <select
                  value={novaVigencia.regimeTributario}
                  onChange={e => setNovaVigencia({ ...novaVigencia, regimeTributario: e.target.value as RegimeTributario })}
                  className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="SIMPLES_NACIONAL">Simples Nacional</option>
                  <option value="LUCRO_PRESUMIDO">Lucro Presumido</option>
                  <option value="LUCRO_REAL">Lucro Real</option>
                  <option value="IMUNE_ISENTA">Imune / Isenta</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Regime de Apuração *</label>
                <select
                  value={novaVigencia.regimeApuracao}
                  onChange={e => setNovaVigencia({ ...novaVigencia, regimeApuracao: e.target.value as any })}
                  className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="COMPETENCIA">Regime de Competência</option>
                  <option value="CAIXA">Regime de Caixa</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalVigenciaAberto(false)}
                  className="px-3 py-1.5 text-xs rounded-lg text-neutral-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow"
                >
                  Adicionar Vigência
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
