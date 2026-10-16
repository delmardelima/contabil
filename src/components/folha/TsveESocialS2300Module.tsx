import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Briefcase,
  UserCheck,
  FileText,
  Printer,
  PlusCircle,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Send,
  Building2,
  Calendar,
  Search,
  DollarSign,
  ClipboardList,
  Copy,
  Download,
  AlertCircle,
  ShieldCheck,
  UserX,
  CreditCard,
  User
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  TrabalhadorSemVinculoS2300,
  ResumoModuloTsve,
  CategoriaTrabalhadorTsve,
  MotivoTerminoTsve,
  NaturezaEstagio,
  NivelEstagio
} from '../../types/contabil';

interface TsveModuleProps {
  empresaId?: number;
}

export const TsveESocialS2300Module: React.FC<TsveModuleProps> = ({ empresaId = 1 }) => {
  const [competencia, setCompetencia] = useState<string>('2026-03');
  const [activeTab, setActiveTab] = useState<'LISTA' | 'TERMO_ESTAGIO' | 'RPA_A4' | 'NOVO_TSVE' | 'ENCERRAMENTO' | 'XML_PREVIEW'>('LISTA');
  const [resumo, setResumo] = useState<ResumoModuloTsve | null>(null);
  const [selectedTrab, setSelectedTrab] = useState<TrabalhadorSemVinculoS2300 | null>(null);
  const [xmlVisualizacao, setXmlVisualizacao] = useState<string>('');
  const [xmlTitulo, setXmlTitulo] = useState<string>('');
  const [filtroTexto, setFiltroTexto] = useState<string>('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('TODAS');
  const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'info'; texto: string } | null>(null);

  // Form de encerramento S-2399
  const [dtEncerramento, setDtEncerramento] = useState<string>(new Date().toISOString().slice(0, 10));
  const [motivoEncerramento, setMotivoEncerramento] = useState<MotivoTerminoTsve>('02_TERMINO_CONTRATO');

  // Form de novo TSVE
  const [novoTsve, setNovoTsve] = useState<Partial<TrabalhadorSemVinculoS2300>>({
    matriculaTsve: `TSVE-000${Math.floor(4 + Math.random() * 5)}`,
    cpf: '111.222.333-44',
    nome: 'Gabriela Duarte Siqueira',
    sexo: 'F',
    dataNascimento: '2003-08-22',
    categoria: '901_ESTAGIARIO',
    dataInicio: new Date().toISOString().slice(0, 10),
    cargo: 'Estagiária de Auditoria Fiscal',
    cbo: '4110-10',
    remuneracaoMensalBRL: 1800.00,
    dadosEstagiario: {
      naturezaEstagio: 'N_NAO_OBRIGATORIO',
      nivelEstagio: '4_SUPERIOR',
      areaAtuacao: 'Auditoria e Compliance Tributário',
      numeroApoliceSeguro: 'TOKIO-778844-SP',
      seguradoraNome: 'Tokio Marine Seguradora S.A.',
      valorBolsaBRL: 1800.00,
      valorAuxilioTransporteBRL: 220.00,
      dataPrevisaoTermino: '2027-12-31',
      instituicaoEnsino: {
        cnpj: '43.123.456/0001-99',
        razaoSocial: 'PONTIFÍCIA UNIVERSIDADE CATÓLICA - PUC',
        logradouro: 'Rua Monte Alegre',
        numero: '984',
        bairro: 'Perdizes',
        municipio: 'São Paulo',
        uf: 'SP'
      },
      agenteIntegracao: {
        cnpj: '61.451.102/0001-90',
        razaoSocial: 'CENTRO DE INTEGRAÇÃO EMPRESA ESCOLA - CIEE'
      },
      supervisorEstagio: {
        nome: 'Dra. Juliana Mendes Silveira',
        cpf: '234.567.890-11',
        cargo: 'Gerente Contábil Sênior'
      }
    }
  });

  const carregarDados = () => {
    const dados = dbService.getTsveESocial(empresaId, competencia);
    setResumo(dados);
    if (dados.trabalhadores.length > 0 && !selectedTrab) {
      setSelectedTrab(dados.trabalhadores[0]);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [empresaId, competencia]);

  const handleGerarXmlS2300 = (id: string) => {
    const res = dbService.gerarXmlS2300(id);
    if (res.sucesso) {
      setXmlVisualizacao(res.xml);
      setXmlTitulo(`eSocial S-2300 - Cadastro Inicial TSVE (ID: ${id})`);
      setActiveTab('XML_PREVIEW');
      setFeedback({ tipo: 'sucesso', texto: res.mensagem });
      carregarDados();
    }
  };

  const handleSalvarNovoTsve = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `tsve-${Date.now()}`;
    const trab: TrabalhadorSemVinculoS2300 = {
      ...(novoTsve as TrabalhadorSemVinculoS2300),
      id,
      empresaId,
      statusContrato: 'ATIVO',
      statusESocial: 'PENDENTE'
    };
    const res = dbService.salvarTrabalhadorTsve(trab);
    if (res.sucesso) {
      setFeedback({ tipo: 'sucesso', texto: res.mensagem });
      setSelectedTrab(trab);
      setActiveTab('LISTA');
      carregarDados();
    }
  };

  const handleConfirmarEncerramento = () => {
    if (!selectedTrab) return;
    const res = dbService.encerrarTsveS2399(selectedTrab.id, dtEncerramento, motivoEncerramento);
    if (res.sucesso) {
      setFeedback({ tipo: 'sucesso', texto: res.mensagem });
      setXmlVisualizacao(res.xml);
      setXmlTitulo(`eSocial S-2399 - Término de TSVE (${selectedTrab.nome})`);
      setActiveTab('XML_PREVIEW');
      carregarDados();
    }
  };

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getCategoriaLabel = (cat: CategoriaTrabalhadorTsve) => {
    switch (cat) {
      case '901_ESTAGIARIO': return 'Estagiário (Lei 11.788/08)';
      case '902_ESTAGIARIO_COMPLEMENTAR': return 'Estagiário Complementar';
      case '701_AUTONOMO': return 'Autônomo / Prestador RPA';
      case '721_DIRETOR_COM_FGTS': return 'Diretor Não Empregado (c/ FGTS)';
      case '722_DIRETOR_SEM_FGTS': return 'Diretor Não Empregado (s/ FGTS)';
      case '731_COOPERADO': return 'Cooperado de Produção';
      default: return cat;
    }
  };

  const trabalhadoresFiltrados = resumo?.trabalhadores.filter(t => {
    const matchTexto = t.nome.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      t.cpf.includes(filtroTexto) ||
      t.matriculaTsve.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      t.cargo.toLowerCase().includes(filtroTexto.toLowerCase());
    const matchCat = filtroCategoria === 'TODAS' || t.categoria === filtroCategoria;
    return matchTexto && matchCat;
  }) || [];

  return (
    <div className="flex flex-col h-full bg-[#121212] text-gray-200 p-4 space-y-4 overflow-y-auto">
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-[#262626] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                eSocial TSVE: S-2300 / S-2306 / S-2399 - Trabalhadores Sem Vínculo
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded font-mono">
                  MOS v. S-1.3 Oficial
                </span>
              </h1>
              <p className="text-xs text-gray-400">
                Gestão de Estagiários (Lei 11.788/08), Autônomos (RPA), Diretores Não Empregados e Cooperados com emissão de Termos e RPAs
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#181818] border border-[#262626] px-2.5 py-1.5 rounded">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-400">Competência:</span>
            <input
              type="month"
              value={competencia}
              onChange={(e) => setCompetencia(e.target.value)}
              className="bg-transparent text-xs text-white border-0 focus:outline-none font-medium cursor-pointer"
            />
          </div>

          <button
            onClick={() => setActiveTab('NOVO_TSVE')}
            className="px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Novo TSVE (S-2300)
          </button>
        </div>
      </div>

      {/* FEEDBACK BANNER */}
      {feedback && (
        <div className="flex items-center justify-between bg-emerald-950/60 border border-emerald-700/50 text-emerald-200 px-4 py-2.5 rounded text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedback.texto}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-gray-400 hover:text-white font-mono text-xs ml-4">
            ×
          </button>
        </div>
      )}

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-[#181818] border border-[#262626] p-3 rounded flex items-center justify-between">
          <div>
            <div className="text-[10px] text-gray-400 uppercase font-semibold">Total TSVEs Ativos</div>
            <div className="text-xl font-bold text-white mt-0.5">{resumo?.totalTsveAtivos || 0}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">Sem Vínculo Empregatício</div>
          </div>
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
            <UserCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-[#181818] border border-[#262626] p-3 rounded flex items-center justify-between">
          <div>
            <div className="text-[10px] text-gray-400 uppercase font-semibold">Estagiários (901)</div>
            <div className="text-xl font-bold text-sky-400 mt-0.5">{resumo?.totalEstagiarios || 0}</div>
            <div className="text-[10px] text-sky-400/80 mt-0.5">Termo de Estágio & Seguro</div>
          </div>
          <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-lg border border-sky-500/20">
            <GraduationCap className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-[#181818] border border-[#262626] p-3 rounded flex items-center justify-between">
          <div>
            <div className="text-[10px] text-gray-400 uppercase font-semibold">Autônomos RPA (701)</div>
            <div className="text-xl font-bold text-amber-400 mt-0.5">{resumo?.totalAutonomosRpa || 0}</div>
            <div className="text-[10px] text-amber-400/80 mt-0.5">Retenção INSS 11% / IRRF</div>
          </div>
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
            <Briefcase className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-[#181818] border border-[#262626] p-3 rounded flex items-center justify-between">
          <div>
            <div className="text-[10px] text-gray-400 uppercase font-semibold">Diretores (721/722)</div>
            <div className="text-xl font-bold text-purple-400 mt-0.5">{resumo?.totalDiretores || 0}</div>
            <div className="text-[10px] text-purple-400/80 mt-0.5">Opção FGTS Lei 8.036</div>
          </div>
          <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-[#181818] border border-[#262626] p-3 rounded flex items-center justify-between">
          <div>
            <div className="text-[10px] text-gray-400 uppercase font-semibold">Homologados eSocial</div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">{resumo?.totalTransmitidosESocial || 0}</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">Protocolo RFB / MTP</div>
          </div>
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* NAVEGAÇÃO DE ABAS */}
      <div className="flex border-b border-[#262626] gap-2">
        <button
          onClick={() => setActiveTab('LISTA')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'LISTA'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <ClipboardList className="w-3.5 h-3.5" />
          Relação de TSVEs ({resumo?.trabalhadores.length || 0})
        </button>

        <button
          onClick={() => {
            const estagiario = resumo?.trabalhadores.find(t => t.categoria.startsWith('90'));
            if (estagiario) setSelectedTrab(estagiario);
            setActiveTab('TERMO_ESTAGIO');
          }}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'TERMO_ESTAGIO'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          Termo de Estágio Oficial (A4)
        </button>

        <button
          onClick={() => {
            const autonomo = resumo?.trabalhadores.find(t => t.categoria === '701_AUTONOMO');
            if (autonomo) setSelectedTrab(autonomo);
            setActiveTab('RPA_A4');
          }}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'RPA_A4'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Recibo de Pagamento a Autônomo (RPA A4)
        </button>

        {activeTab === 'NOVO_TSVE' && (
          <button
            onClick={() => setActiveTab('NOVO_TSVE')}
            className="px-4 py-2 text-xs font-medium border-b-2 border-indigo-500 text-indigo-400 bg-indigo-500/10 flex items-center gap-2"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Cadastro de Novo TSVE
          </button>
        )}

        {activeTab === 'XML_PREVIEW' && (
          <button
            onClick={() => setActiveTab('XML_PREVIEW')}
            className="px-4 py-2 text-xs font-medium border-b-2 border-emerald-500 text-emerald-400 bg-emerald-500/10 flex items-center gap-2"
          >
            <FileCode className="w-3.5 h-3.5" />
            XML eSocial TSVE
          </button>
        )}
      </div>

      {/* ABA: LISTA DE TSVES */}
      {activeTab === 'LISTA' && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={filtroTexto}
                  onChange={(e) => setFiltroTexto(e.target.value)}
                  placeholder="Buscar por nome, CPF, matrícula ou cargo..."
                  className="w-full bg-[#181818] border border-[#262626] rounded pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-gray-400">Categoria:</span>
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="bg-[#181818] border border-[#262626] rounded px-2.5 py-1.5 text-xs text-white"
              >
                <option value="TODAS">Todas as Categorias</option>
                <option value="901_ESTAGIARIO">901 - Estagiário</option>
                <option value="701_AUTONOMO">701 - Autônomo RPA</option>
                <option value="721_DIRETOR_COM_FGTS">721 - Diretor c/ FGTS</option>
              </select>
            </div>
          </div>

          <div className="bg-[#181818] border border-[#262626] rounded overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#202020] text-gray-400 uppercase text-[10px] font-semibold border-b border-[#262626]">
                <tr>
                  <th className="py-2.5 px-3">Matrícula / Início</th>
                  <th className="py-2.5 px-3">Nome / CPF</th>
                  <th className="py-2.5 px-3">Categoria TSVE</th>
                  <th className="py-2.5 px-3">Cargo / CBO</th>
                  <th className="py-2.5 px-3 text-right">Bolsa / Remuneração</th>
                  <th className="py-2.5 px-3">Status eSocial</th>
                  <th className="py-2.5 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {trabalhadoresFiltrados.map((trab) => (
                  <tr
                    key={trab.id}
                    onClick={() => setSelectedTrab(trab)}
                    className={`hover:bg-[#202020] cursor-pointer transition-colors ${
                      selectedTrab?.id === trab.id ? 'bg-[#222222]' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono">
                      <div className="text-white font-medium">{trab.matriculaTsve}</div>
                      <div className="text-[10px] text-gray-500">Início: {trab.dataInicio}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="text-white font-medium">{trab.nome}</div>
                      <div className="text-[10px] text-gray-400">CPF: {trab.cpf}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {getCategoriaLabel(trab.categoria)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="text-gray-300">{trab.cargo}</div>
                      <div className="text-[10px] text-gray-500 font-mono">CBO: {trab.cbo}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                      {formatBRL(trab.remuneracaoMensalBRL)}
                    </td>
                    <td className="py-2.5 px-3">
                      {trab.statusESocial === 'TRANSMITIDO' || trab.statusESocial === 'VALIDADO' ? (
                        <div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3" /> Transmitido
                          </span>
                          <span className="text-[9px] text-gray-500 font-mono block mt-0.5">Recibo: {trab.reciboESocial?.slice(-10)}</span>
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1 w-fit">
                          <AlertCircle className="w-3 h-3" /> Pendente
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {trab.categoria.startsWith('90') && (
                          <button
                            onClick={() => {
                              setSelectedTrab(trab);
                              setActiveTab('TERMO_ESTAGIO');
                            }}
                            title="Emitir Termo de Compromisso de Estágio A4"
                            className="p-1.5 hover:bg-[#2b2b2b] text-sky-400 rounded transition-colors"
                          >
                            <GraduationCap className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {trab.categoria === '701_AUTONOMO' && (
                          <button
                            onClick={() => {
                              setSelectedTrab(trab);
                              setActiveTab('RPA_A4');
                            }}
                            title="Emitir Recibo RPA A4"
                            className="p-1.5 hover:bg-[#2b2b2b] text-amber-400 rounded transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleGerarXmlS2300(trab.id)}
                          title="Gerar / Transmitir XML S-2300"
                          className="p-1.5 hover:bg-[#2b2b2b] text-emerald-400 rounded transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                        {trab.statusContrato === 'ATIVO' && (
                          <button
                            onClick={() => {
                              setSelectedTrab(trab);
                              setActiveTab('ENCERRAMENTO');
                            }}
                            title="Encerrar TSVE (S-2399)"
                            className="p-1.5 hover:bg-[#2b2b2b] text-rose-400 rounded transition-colors"
                          >
                            <UserX className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA: TERMO DE ESTÁGIO OFICIAL A4 */}
      {activeTab === 'TERMO_ESTAGIO' && selectedTrab && selectedTrab.dadosEstagiario && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-[#181818] p-3 rounded border border-[#262626]">
            <div>
              <span className="text-xs text-gray-400">Termo de Compromisso de Estágio - Estagiário(a): </span>
              <span className="text-xs font-bold text-white">{selectedTrab.nome}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleGerarXmlS2300(selectedTrab.id)}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Transmitir S-2300
              </button>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimir Termo (A4)
              </button>
            </div>
          </div>

          <div className="bg-white text-black p-8 rounded shadow-2xl max-w-4xl mx-auto space-y-6 print:m-0 print:p-0 font-serif">
            {/* CABEÇALHO */}
            <div className="border-b-2 border-black pb-4 text-center space-y-1">
              <div className="font-extrabold text-base uppercase tracking-wider">
                TERMO DE COMPROMISSO DE ESTÁGIO
              </div>
              <div className="font-bold text-xs uppercase text-gray-800">
                NOS TERMOS DA LEI FEDERAL Nº 11.788, DE 25 DE SETEMBRO DE 2008
              </div>
              <div className="text-[10px] font-sans text-gray-600">
                Sistema eSocial • Evento S-2300 • Categoria 901 (Estagiário) • Matrícula {selectedTrab.matriculaTsve}
              </div>
            </div>

            {/* PARTES INTERVENIENTES */}
            <div className="space-y-3 font-sans text-xs">
              <div className="border border-black p-3 bg-gray-50">
                <span className="font-bold block text-[10px] text-gray-600">1. UNIDADE CONCEDENTE (EMPREGADOR):</span>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div>Razão Social: <strong>CONTABIL STUDIO PRO BRASIL LTDA</strong></div>
                  <div>CNPJ: <span className="font-mono">00.123.456/0001-91</span></div>
                  <div>Endereço: Avenida Paulista, 1000 - Bela Vista - São Paulo/SP</div>
                  <div>Supervisor: {selectedTrab.dadosEstagiario.supervisorEstagio.nome} ({selectedTrab.dadosEstagiario.supervisorEstagio.cargo})</div>
                </div>
              </div>

              <div className="border border-black p-3 bg-gray-50">
                <span className="font-bold block text-[10px] text-gray-600">2. INSTITUIÇÃO DE ENSINO:</span>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div>Razão Social: <strong>{selectedTrab.dadosEstagiario.instituicaoEnsino.razaoSocial}</strong></div>
                  <div>CNPJ: <span className="font-mono">{selectedTrab.dadosEstagiario.instituicaoEnsino.cnpj}</span></div>
                  <div>Endereço: {selectedTrab.dadosEstagiario.instituicaoEnsino.logradouro}, nº {selectedTrab.dadosEstagiario.instituicaoEnsino.numero} - {selectedTrab.dadosEstagiario.instituicaoEnsino.bairro} - {selectedTrab.dadosEstagiario.instituicaoEnsino.municipio}/{selectedTrab.dadosEstagiario.instituicaoEnsino.uf}</div>
                  <div>Nível / Área: Superior • {selectedTrab.dadosEstagiario.areaAtuacao}</div>
                </div>
              </div>

              <div className="border border-black p-3 bg-gray-50">
                <span className="font-bold block text-[10px] text-gray-600">3. ESTAGIÁRIO(A):</span>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div>Nome: <strong>{selectedTrab.nome}</strong></div>
                  <div>CPF: <span className="font-mono">{selectedTrab.cpf}</span></div>
                  <div>Data de Nascimento: {selectedTrab.dataNascimento}</div>
                  <div>Matrícula Interna: <span className="font-mono">{selectedTrab.matriculaTsve}</span></div>
                </div>
              </div>
            </div>

            {/* CONDICOES DO ESTÁGIO */}
            <div className="border border-black p-3 font-sans text-xs space-y-2">
              <div className="font-bold uppercase text-[10px] text-gray-800 border-b border-gray-300 pb-1">
                4. CONDIÇÕES GERAIS E BENEFÍCIOS DO ESTÁGIO
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <span className="text-gray-600 text-[10px] block">Vigência Inicial:</span>
                  <strong>{selectedTrab.dataInicio}</strong>
                </div>
                <div>
                  <span className="text-gray-600 text-[10px] block">Previsão Término:</span>
                  <strong>{selectedTrab.dadosEstagiario.dataPrevisaoTermino}</strong>
                </div>
                <div>
                  <span className="text-gray-600 text-[10px] block">Jornada Diária/Semanal:</span>
                  <strong>6 horas diárias / 30h semanais</strong>
                </div>
                <div>
                  <span className="text-gray-600 text-[10px] block">Bolsa-Auxílio Mensal:</span>
                  <strong className="text-indigo-900 font-mono">{formatBRL(selectedTrab.dadosEstagiario.valorBolsaBRL)}</strong>
                </div>
                <div>
                  <span className="text-gray-600 text-[10px] block">Auxílio Transporte:</span>
                  <strong className="font-mono">{formatBRL(selectedTrab.dadosEstagiario.valorAuxilioTransporteBRL)}</strong>
                </div>
                <div>
                  <span className="text-gray-600 text-[10px] block">Apólice de Seguro de Vida:</span>
                  <span className="font-mono font-bold text-xs">{selectedTrab.dadosEstagiario.numeroApoliceSeguro} ({selectedTrab.dadosEstagiario.seguradoraNome})</span>
                </div>
              </div>
            </div>

            {/* CLÁUSULAS */}
            <div className="text-xs leading-relaxed space-y-2 text-justify">
              <p>
                <strong>CLÁUSULA PRIMEIRA:</strong> O presente estágio não cria vínculo empregatício de qualquer natureza entre o(a) ESTAGIÁRIO(A) e a CONCEDENTE, nos termos do Art. 3º da Lei Federal nº 11.788/2008, desde que observados os requisitos legais e acadêmicos.
              </p>
              <p>
                <strong>CLÁUSULA SEGUNDA:</strong> A Concedente obriga-se a proporcionar instalações com plenas condições de saúde e segurança (SST), a designar supervisor com formação na área e a contratar, em favor do estagiário, seguro contra acidentes pessoais.
              </p>
            </div>

            {/* ASSINATURAS */}
            <div className="pt-8 text-xs text-center space-y-8 font-sans">
              <div className="grid grid-cols-3 gap-6 pt-4">
                <div className="border-t border-black pt-1">
                  <div className="font-bold">CONTABIL STUDIO PRO BRASIL LTDA</div>
                  <div className="text-[10px] text-gray-600">Unidade Concedente</div>
                </div>
                <div className="border-t border-black pt-1">
                  <div className="font-bold">{selectedTrab.dadosEstagiario.instituicaoEnsino.razaoSocial}</div>
                  <div className="text-[10px] text-gray-600">Instituição de Ensino</div>
                </div>
                <div className="border-t border-black pt-1">
                  <div className="font-bold">{selectedTrab.nome.toUpperCase()}</div>
                  <div className="text-[10px] text-gray-600">Estagiário(a)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA: RECIBO DE PAGAMENTO A AUTÔNOMO (RPA A4) */}
      {activeTab === 'RPA_A4' && selectedTrab && selectedTrab.dadosAutonomo && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-[#181818] p-3 rounded border border-[#262626]">
            <div>
              <span className="text-xs text-gray-400">Recibo de Pagamento a Autônomo (RPA) - Prestador: </span>
              <span className="text-xs font-bold text-white">{selectedTrab.nome}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleGerarXmlS2300(selectedTrab.id)}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Transmitir S-2300
              </button>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimir RPA (A4)
              </button>
            </div>
          </div>

          <div className="bg-white text-black p-8 rounded shadow-2xl max-w-4xl mx-auto space-y-6 print:m-0 print:p-0 font-serif">
            {/* CABEÇALHO RPA */}
            <div className="border-b-2 border-black pb-4 text-center space-y-1">
              <div className="font-extrabold text-base uppercase tracking-wider">
                RECIBO DE PAGAMENTO A AUTÔNOMO - RPA
              </div>
              <div className="font-bold text-xs uppercase text-gray-800">
                PRESTAÇÃO DE SERVIÇOS POR CONTRIBUINTE INDIVIDUAL (LEI Nº 8.212/91 & RIR/2018)
              </div>
              <div className="text-[10px] font-sans text-gray-600">
                eSocial Categoria 701 • Matrícula {selectedTrab.matriculaTsve} • Competência {competencia}
              </div>
            </div>

            {/* DADOS DA FONTE PAGADORA E DO PRESTADOR */}
            <div className="grid grid-cols-2 border border-black p-3 text-xs font-sans gap-2">
              <div>
                <span className="font-bold block text-[10px] text-gray-600">FONTE PAGADORA (TOMADOR):</span>
                <span className="font-bold">CONTABIL STUDIO PRO BRASIL LTDA</span>
                <span className="block text-[11px] text-gray-700 font-mono">CNPJ: 00.123.456/0001-91</span>
              </div>
              <div>
                <span className="font-bold block text-[10px] text-gray-600">PRESTADOR DE SERVIÇOS (AUTÔNOMO):</span>
                <span className="font-bold uppercase">{selectedTrab.nome}</span>
                <span className="block text-[11px] text-gray-700 font-mono">CPF: {selectedTrab.cpf} | PIS/NIT: {selectedTrab.dadosAutonomo.numeroInscricaoInssPis}</span>
              </div>
            </div>

            {/* DEMONSTRATIVO DE RENDIMENTOS E RETENÇÕES */}
            <div className="border border-black font-sans text-xs">
              <div className="bg-gray-100 p-2 font-bold uppercase text-[10px] border-b border-black">
                DISCRIMINAÇÃO DOS SERVIÇOS PRESTADOS E DESCONTOS LEGAIS
              </div>
              <div className="grid grid-cols-2 p-2 border-b border-gray-300">
                <span>Rendimento Bruto Pelos Serviços de {selectedTrab.cargo}:</span>
                <span className="font-mono font-bold text-right">{formatBRL(selectedTrab.remuneracaoMensalBRL)}</span>
              </div>
              <div className="grid grid-cols-2 p-2 border-b border-gray-300 bg-gray-50 text-rose-800">
                <span>(-) Retenção Previdenciária INSS (11% limitado ao Teto RGPS):</span>
                <span className="font-mono font-bold text-right">- R$ 935,00</span>
              </div>
              <div className="grid grid-cols-2 p-2 border-b border-gray-300 bg-gray-50 text-rose-800">
                <span>(-) Retenção de Imposto de Renda na Fonte (IRRF Tabela Progressiva):</span>
                <span className="font-mono font-bold text-right">- R$ 1.124,50</span>
              </div>
              <div className="grid grid-cols-2 p-2 border-b border-gray-300 bg-gray-50 text-rose-800">
                <span>(-) Retenção de ISSQN Municipal (5%):</span>
                <span className="font-mono font-bold text-right">- R$ 425,00</span>
              </div>
              <div className="grid grid-cols-2 p-2.5 bg-emerald-50 font-bold text-emerald-950 text-sm">
                <span>(=) VALOR LÍQUIDO PAGO AO AUTÔNOMO:</span>
                <span className="font-mono text-right">{formatBRL(selectedTrab.remuneracaoMensalBRL - 935 - 1124.5 - 425)}</span>
              </div>
            </div>

            {/* RECIBO E DECLARAÇÃO */}
            <div className="text-xs leading-relaxed text-justify space-y-3 font-sans">
              <p>
                Recebi de <strong>CONTABIL STUDIO PRO BRASIL LTDA</strong> a quantia líquida supra discriminada, correspondente aos serviços especializados prestados na competência {competencia}, dando plena, geral e irrevogável quitação.
              </p>
              <div className="text-[11px] text-gray-600">
                Dados Bancários para Crédito: {selectedTrab.dadosAutonomo.dadosBancarios}
              </div>
            </div>

            {/* ASSINATURA */}
            <div className="pt-8 text-xs text-center space-y-6 font-sans">
              <p>São Paulo, {new Date().toLocaleDateString('pt-BR')}.</p>
              <div className="max-w-xs mx-auto border-t border-black pt-1">
                <div className="font-bold">{selectedTrab.nome.toUpperCase()}</div>
                <div className="text-[10px] text-gray-600">CPF: {selectedTrab.cpf}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA: ENCERRAMENTO TSVE (S-2399) */}
      {activeTab === 'ENCERRAMENTO' && selectedTrab && (
        <div className="bg-[#181818] border border-[#262626] rounded p-4 space-y-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 pb-2 border-b border-[#262626]">
            <UserX className="w-5 h-5 text-rose-400" />
            <div>
              <h2 className="text-sm font-bold text-white">eSocial S-2399: Término de TSVE</h2>
              <p className="text-xs text-gray-400">Desligamento ou término de contrato do trabalhador sem vínculo</p>
            </div>
          </div>

          <div className="p-3 bg-[#141414] border border-[#262626] rounded text-xs space-y-1">
            <div>Colaborador: <strong className="text-white">{selectedTrab.nome}</strong></div>
            <div>Matrícula TSVE: <span className="font-mono text-indigo-400">{selectedTrab.matriculaTsve}</span></div>
            <div>Categoria: <span className="font-semibold">{getCategoriaLabel(selectedTrab.categoria)}</span></div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Data de Término do TSVE</label>
              <input
                type="date"
                value={dtEncerramento}
                onChange={(e) => setDtEncerramento(e.target.value)}
                className="w-full bg-[#1e1e1e] border border-[#333] rounded px-3 py-1.5 text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Motivo do Término (Tabela 19 eSocial)</label>
              <select
                value={motivoEncerramento}
                onChange={(e) => setMotivoEncerramento(e.target.value as MotivoTerminoTsve)}
                className="w-full bg-[#1e1e1e] border border-[#333] rounded px-3 py-1.5 text-xs text-white"
              >
                <option value="01_EXONERACAO_RESCISAO">01 - Exoneração / Rescisão a Pedido</option>
                <option value="02_TERMINO_CONTRATO">02 - Término de Contrato / Estágio por Decurso de Prazo</option>
                <option value="03_RESCISAO_ANTECIPADA">03 - Rescisão Antecipada por Iniciativa da Concedente</option>
                <option value="05_CONTRATACAO_EFETIVA">05 - Contratação Efetiva / Admissão com Vínculo CLT</option>
                <option value="04_FALECIMENTO">04 - Falecimento do Trabalhador</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#262626]">
            <button
              type="button"
              onClick={() => setActiveTab('LISTA')}
              className="px-3 py-1.5 bg-[#252525] hover:bg-[#333] text-gray-300 rounded text-xs"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmarEncerramento}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-semibold flex items-center gap-1.5"
            >
              <UserX className="w-3.5 h-3.5" />
              Transmitir Término (S-2399)
            </button>
          </div>
        </div>
      )}

      {/* ABA: FORMULÁRIO DE NOVO TSVE */}
      {activeTab === 'NOVO_TSVE' && (
        <form onSubmit={handleSalvarNovoTsve} className="bg-[#181818] border border-[#262626] rounded p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#262626]">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-indigo-400" />
              Cadastro de Trabalhador Sem Vínculo (eSocial S-2300)
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('LISTA')}
                className="px-3 py-1 bg-[#222] hover:bg-[#2a2a2a] text-gray-300 rounded text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded text-xs flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Salvar S-2300
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Nome Completo</label>
              <input
                type="text"
                value={novoTsve.nome || ''}
                onChange={(e) => setNovoTsve({ ...novoTsve, nome: e.target.value })}
                className="w-full bg-[#1e1e1e] border border-[#333] rounded px-3 py-1.5 text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">CPF</label>
              <input
                type="text"
                value={novoTsve.cpf || ''}
                onChange={(e) => setNovoTsve({ ...novoTsve, cpf: e.target.value })}
                className="w-full bg-[#1e1e1e] border border-[#333] rounded px-3 py-1.5 text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Matrícula TSVE</label>
              <input
                type="text"
                value={novoTsve.matriculaTsve || ''}
                onChange={(e) => setNovoTsve({ ...novoTsve, matriculaTsve: e.target.value })}
                className="w-full bg-[#1e1e1e] border border-[#333] rounded px-3 py-1.5 text-xs text-white font-mono"
                required
              />
            </div>
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Categoria eSocial (Tabela 01)</label>
              <select
                value={novoTsve.categoria}
                onChange={(e) => setNovoTsve({ ...novoTsve, categoria: e.target.value as CategoriaTrabalhadorTsve })}
                className="w-full bg-[#1e1e1e] border border-[#333] rounded px-3 py-1.5 text-xs text-white"
              >
                <option value="901_ESTAGIARIO">901 - Estagiário</option>
                <option value="701_AUTONOMO">701 - Autônomo / Contribuinte Individual</option>
                <option value="721_DIRETOR_COM_FGTS">721 - Diretor Não Empregado (c/ FGTS)</option>
                <option value="722_DIRETOR_SEM_FGTS">722 - Diretor Não Empregado (s/ FGTS)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Data Início</label>
              <input
                type="date"
                value={novoTsve.dataInicio || ''}
                onChange={(e) => setNovoTsve({ ...novoTsve, dataInicio: e.target.value })}
                className="w-full bg-[#1e1e1e] border border-[#333] rounded px-3 py-1.5 text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Cargo / Função</label>
              <input
                type="text"
                value={novoTsve.cargo || ''}
                onChange={(e) => setNovoTsve({ ...novoTsve, cargo: e.target.value })}
                className="w-full bg-[#1e1e1e] border border-[#333] rounded px-3 py-1.5 text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">CBO</label>
              <input
                type="text"
                value={novoTsve.cbo || ''}
                onChange={(e) => setNovoTsve({ ...novoTsve, cbo: e.target.value })}
                className="w-full bg-[#1e1e1e] border border-[#333] rounded px-3 py-1.5 text-xs text-white font-mono"
                placeholder="Ex: 4110-10"
                required
              />
            </div>
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Remuneração / Bolsa (R$)</label>
              <input
                type="number"
                step="0.01"
                value={novoTsve.remuneracaoMensalBRL || ''}
                onChange={(e) => setNovoTsve({ ...novoTsve, remuneracaoMensalBRL: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#1e1e1e] border border-[#333] rounded px-3 py-1.5 text-xs text-white font-mono"
                required
              />
            </div>
          </div>
        </form>
      )}

      {/* ABA: PREVIEW XML */}
      {activeTab === 'XML_PREVIEW' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-[#181818] p-3 rounded border border-[#262626]">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-white">{xmlTitulo || 'XML eSocial TSVE'}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(xmlVisualizacao);
                  setFeedback({ tipo: 'sucesso', texto: 'XML copiado com sucesso!' });
                }}
                className="px-2.5 py-1 bg-[#222] hover:bg-[#2a2a2a] text-gray-300 rounded text-xs flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                Copiar
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([xmlVisualizacao], { type: 'application/xml' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `eSocial_TSVE_${selectedTrab?.matriculaTsve || 'S2300'}.xml`;
                  a.click();
                }}
                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                Baixar XML
              </button>
            </div>
          </div>

          <pre className="p-4 bg-[#0d0d0d] border border-[#262626] rounded text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-[500px]">
            {xmlVisualizacao}
          </pre>
        </div>
      )}
    </div>
  );
};
