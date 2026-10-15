import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard,
  Plus,
  Printer,
  CheckCircle2,
  AlertCircle,
  Building2,
  DollarSign,
  TrendingDown,
  Layers,
  Calendar,
  Users,
  ShieldCheck,
  FileCheck2,
  Bus,
  Utensils,
  HeartPulse,
  Award,
  Edit2,
  Trash2
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import { 
  Empresa, 
  Colaborador, 
  BeneficioPlano, 
  BeneficioColaboradorItem, 
  FechamentoBeneficiosCompetencia, 
  TipoBeneficio 
} from '../../types/contabil';
import { ReportPrintPreviewModal } from '../layout/ReportPrintPreviewModal';

export const BeneficiosModule: React.FC = () => {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [competencia, setCompetencia] = useState<string>('2026-04');
  const [planos, setPlanos] = useState<BeneficioPlano[]>([]);
  const [fechamento, setFechamento] = useState<FechamentoBeneficiosCompetencia | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'mapa' | 'planos' | 'termo'>('mapa');

  // Filtros
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modais
  const [showNovoPlanoModal, setShowNovoPlanoModal] = useState(false);
  const [showPrintMapaModal, setShowPrintMapaModal] = useState(false);
  const [showPrintTermoModal, setShowPrintTermoModal] = useState(false);
  const [selectedColabTermo, setSelectedColabTermo] = useState<Colaborador | null>(null);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [feedbackMsg, setFeedbackMsg] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  // Form Novo Plano
  const [formTipo, setFormTipo] = useState<TipoBeneficio>('VALE_TRANSPORTE');
  const [formNome, setFormNome] = useState('');
  const [formOperadora, setFormOperadora] = useState('');
  const [formValorFacial, setFormValorFacial] = useState<number>(5.00);
  const [formDescontoLegal, setFormDescontoLegal] = useState<number>(6.0);
  const [formMensalidade, setFormMensalidade] = useState<number>(0);

  const carregarDados = () => {
    const emp = dbService.getActiveEmpresa();
    if (emp) {
      setEmpresa(emp);
      const pls = dbService.getPlanosBeneficios(emp.id);
      setPlanos(pls);
      const cols = dbService.getColaboradores(emp.id);
      setColaboradores(cols);
      if (cols.length > 0 && !selectedColabTermo) {
        setSelectedColabTermo(cols[0]);
      }
      const fech = dbService.getFechamentoBeneficios(emp.id, competencia);
      setFechamento(fech);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [competencia]);

  const handleSalvarPlano = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresa || !formNome) return;

    const novoPlano: BeneficioPlano = {
      id: Date.now(),
      empresaId: empresa.id,
      tipo: formTipo,
      nome: formNome,
      operadora: formOperadora || 'Operadora',
      valorFacialUnitario: formValorFacial,
      percentualDescontoLegal: formDescontoLegal,
      valorMensalidadeFixa: formMensalidade,
      ativo: true
    };

    dbService.salvarPlanoBeneficio(novoPlano);
    setShowNovoPlanoModal(false);
    setFormNome('');
    setFormOperadora('');
    setFeedbackMsg({ tipo: 'success', texto: `Plano "${novoPlano.nome}" cadastrado com sucesso!` });
    carregarDados();
  };

  const handleIntegrarContabil = () => {
    if (!empresa) return;
    const res = dbService.integrarBeneficiosContabil(empresa.id, competencia);
    if (res.sucesso) {
      setFeedbackMsg({ tipo: 'success', texto: `${res.mensagem} (Lote nº ${res.loteId})` });
      carregarDados();
    } else {
      setFeedbackMsg({ tipo: 'error', texto: res.mensagem });
    }
  };

  const itensFiltrados = useMemo(() => {
    if (!fechamento) return [];
    return fechamento.itens.filter(item => {
      const matchTipo = filtroTipo === 'TODOS' || item.tipo === filtroTipo;
      const matchSearch = item.colaboradorNome.toLowerCase().includes(searchTerm.toLowerCase());
      return matchTipo && matchSearch;
    });
  }, [fechamento, filtroTipo, searchTerm]);

  return (
    <div className="h-full flex flex-col bg-[#141414] text-neutral-200 overflow-hidden font-sans">
      {/* Top Header */}
      <div className="h-14 border-b border-white/10 bg-[#181818] px-6 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-indigo-400">
            <CreditCard size={18} />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
              Gestão de Benefícios & Vale-Transporte / Refeição
              <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
                Lei 7.418/1985 & CLT Art. 458
              </span>
            </h1>
            <p className="text-xs text-neutral-400">
              Controle de Cartões, Teto Legal de Desconto de 6% do Salário Base e Integração Contábil
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-[#1c1c1c] border border-white/10 rounded-lg px-2.5 py-1 text-xs">
            <Calendar size={13} className="text-neutral-400 mr-2" />
            <span className="text-neutral-400 mr-1.5">Competência:</span>
            <input
              type="month"
              value={competencia}
              onChange={(e) => setCompetencia(e.target.value)}
              className="bg-transparent border-0 text-neutral-200 font-mono text-xs focus:ring-0 p-0 cursor-pointer"
            />
          </div>

          <button
            onClick={() => setShowNovoPlanoModal(true)}
            className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition shadow-sm"
          >
            <Plus size={14} />
            <span>Novo Plano de Benefício</span>
          </button>

          <button
            onClick={() => setShowPrintMapaModal(true)}
            className="flex items-center space-x-1.5 bg-[#1c1c1c] hover:bg-neutral-800 border border-white/10 text-neutral-200 px-3 py-1.5 rounded-lg text-xs font-medium transition"
          >
            <Printer size={14} />
            <span>Mapa A4</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackMsg && (
        <div className={`px-6 py-2 text-xs flex items-center justify-between border-b ${
          feedbackMsg.tipo === 'success' ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40' : 'bg-red-950/60 text-red-300 border-red-800/40'
        }`}>
          <div className="flex items-center space-x-2">
            {feedbackMsg.tipo === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            <span>{feedbackMsg.texto}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-xs hover:opacity-75">×</button>
        </div>
      )}

      {/* Sub-Tabs Bar */}
      <div className="h-10 border-b border-white/10 bg-[#161616] px-6 flex items-center space-x-4 flex-shrink-0">
        <button
          onClick={() => setActiveSubTab('mapa')}
          className={`h-full flex items-center space-x-2 text-xs font-medium border-b-2 transition ${
            activeSubTab === 'mapa' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Layers size={13} />
          <span>Mapa Mensal de Benefícios</span>
        </button>

        <button
          onClick={() => setActiveSubTab('planos')}
          className={`h-full flex items-center space-x-2 text-xs font-medium border-b-2 transition ${
            activeSubTab === 'planos' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <CreditCard size={13} />
          <span>Planos & Operadoras Credenciadas</span>
        </button>

        <button
          onClick={() => setActiveSubTab('termo')}
          className={`h-full flex items-center space-x-2 text-xs font-medium border-b-2 transition ${
            activeSubTab === 'termo' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Bus size={13} />
          <span>Termo de Opção / Declaração de VT A4</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {fechamento && activeSubTab === 'mapa' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-5 gap-4">
              <div className="p-4 bg-[#181818] border border-white/10 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-neutral-400 text-xs">
                  <span>Total Benefícios</span>
                  <DollarSign size={14} className="text-indigo-400" />
                </div>
                <div className="text-lg font-bold font-mono text-neutral-100">
                  R$ {fechamento.totalBeneficiosFornecidos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-[10px] text-neutral-500">Valor facial total concedido</p>
              </div>

              <div className="p-4 bg-[#181818] border border-white/10 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-neutral-400 text-xs">
                  <span>Desconto Empregados</span>
                  <TrendingDown size={14} className="text-amber-400" />
                </div>
                <div className="text-lg font-bold font-mono text-amber-400">
                  R$ {fechamento.totalDescontoEmpregados.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-[10px] text-neutral-500">Teto legal 6% VT + coparticipação</p>
              </div>

              <div className="p-4 bg-[#181818] border border-white/10 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-neutral-400 text-xs">
                  <span>Custo Líquido Empresa</span>
                  <Building2 size={14} className="text-emerald-400" />
                </div>
                <div className="text-lg font-bold font-mono text-emerald-400">
                  R$ {fechamento.totalCustoEmpresa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-[10px] text-neutral-500">Despesa operacional dedutível</p>
              </div>

              <div className="p-4 bg-[#181818] border border-white/10 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-neutral-400 text-xs">
                  <span>Vale-Transporte Total</span>
                  <Bus size={14} className="text-blue-400" />
                </div>
                <div className="text-lg font-bold font-mono text-neutral-100">
                  R$ {fechamento.totalValeTransporte.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-[10px] text-neutral-500">Tarifas urbanas / intermunicipais</p>
              </div>

              <div className="p-4 bg-[#181818] border border-white/10 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-neutral-400 text-xs">
                  <span>Status Contábil</span>
                  <FileCheck2 size={14} className={fechamento.statusIntegracaoContabil ? 'text-emerald-400' : 'text-neutral-500'} />
                </div>
                <div className="text-sm font-semibold flex items-center gap-1.5 pt-1">
                  {fechamento.statusIntegracaoContabil ? (
                    <span className="text-emerald-400 flex items-center gap-1 text-xs">
                      <CheckCircle2 size={13} /> Integrado (Lote {fechamento.loteContabilId})
                    </span>
                  ) : (
                    <button
                      onClick={handleIntegrarContabil}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-medium transition"
                    >
                      Apropriar Despesa
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-neutral-500">Partidas D: 4.1.01.03 / C: 2.1.03.05</p>
              </div>
            </div>

            {/* Filtros e Tabela do Mapa */}
            <div className="bg-[#181818] border border-white/10 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
                  <Users size={16} className="text-indigo-400" />
                  Relação Nominal dos Colaboradores & Apuração Individual de Benefícios
                </h3>

                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    placeholder="Buscar colaborador..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-[#141414] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 w-52"
                  />
                  <select
                    value={filtroTipo}
                    onChange={(e) => setFiltroTipo(e.target.value)}
                    className="bg-[#141414] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="TODOS">Todos os Benefícios</option>
                    <option value="VALE_TRANSPORTE">Vale-Transporte (VT)</option>
                    <option value="VALE_REFEICAO">Vale-Refeição (VR)</option>
                    <option value="PLANO_SAUDE">Plano de Saúde</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#1c1c1c] text-neutral-400 uppercase text-[10px] font-mono border-y border-white/5">
                    <tr>
                      <th className="py-2.5 px-3">Colaborador</th>
                      <th className="py-2.5 px-3">Tipo Benefício</th>
                      <th className="py-2.5 px-3 text-center">Dias Úteis</th>
                      <th className="py-2.5 px-3 text-center">Qtd/Dia</th>
                      <th className="py-2.5 px-3 text-right">Valor Total (R$)</th>
                      <th className="py-2.5 px-3 text-right">Desconto Empregado</th>
                      <th className="py-2.5 px-3 text-right">Custo Empresa (R$)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {itensFiltrados.map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.02]">
                        <td className="py-2.5 px-3 font-sans font-medium text-neutral-200">
                          {item.colaboradorNome}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            item.tipo === 'VALE_TRANSPORTE' 
                              ? 'bg-blue-500/10 text-blue-300 border-blue-500/20'
                              : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                          }`}>
                            {item.tipo.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center text-neutral-400">{item.diasUteisMes}</td>
                        <td className="py-2.5 px-3 text-center text-neutral-400">{item.quantidadeDiaria}</td>
                        <td className="py-2.5 px-3 text-right font-semibold text-neutral-100">
                          R$ {item.valorTotalBeneficio.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-amber-400">
                          R$ {item.descontoColaborador.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                          R$ {item.custoEmpregador.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-white/10 font-bold font-mono text-xs bg-[#1a1a1a]">
                      <td colSpan={4} className="py-3 px-3 uppercase text-neutral-300">TOTAIS DO MAPA DE BENEFÍCIOS:</td>
                      <td className="py-3 px-3 text-right text-neutral-100">
                        R$ {itensFiltrados.reduce((acc, i) => acc + i.valorTotalBeneficio, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right text-amber-400">
                        R$ {itensFiltrados.reduce((acc, i) => acc + i.descontoColaborador, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right text-emerald-400 text-sm">
                        R$ {itensFiltrados.reduce((acc, i) => acc + i.custoEmpregador, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Planos Cadastrados */}
        {activeSubTab === 'planos' && (
          <div className="space-y-6">
            <div className="bg-[#181818] border border-white/10 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-100">Planos e Operadoras de Benefícios Corporativos</h3>
                  <p className="text-xs text-neutral-400">Convênios e tarifas vigentes para o cálculo automático na Folha</p>
                </div>
                <button
                  onClick={() => setShowNovoPlanoModal(true)}
                  className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition shadow-sm"
                >
                  <Plus size={14} />
                  <span>Novo Plano</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {planos.map((plano) => (
                  <div key={plano.id} className="p-4 bg-[#1c1c1c] border border-white/5 rounded-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <div className="flex items-center space-x-2">
                        {plano.tipo === 'VALE_TRANSPORTE' ? <Bus size={16} className="text-blue-400" /> :
                         plano.tipo === 'VALE_REFEICAO' ? <Utensils size={16} className="text-amber-400" /> :
                         <HeartPulse size={16} className="text-red-400" />}
                        <span className="font-semibold text-sm text-neutral-200">{plano.nome}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                        ATIVO
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div>
                        <span className="text-neutral-500 block text-[10px]">Operadora / Convênio:</span>
                        <span className="text-neutral-200 font-sans">{plano.operadora}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block text-[10px]">Valor Facial Unitário:</span>
                        <span className="text-neutral-200">R$ {plano.valorFacialUnitario.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block text-[10px]">Desconto Regulamentar:</span>
                        <span className="text-amber-400 font-bold">{plano.percentualDescontoLegal}%</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block text-[10px]">Mensalidade Fixa:</span>
                        <span className="text-neutral-300">R$ {(plano.valorMensalidadeFixa || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Termo de Opção de VT */}
        {activeSubTab === 'termo' && (
          <div className="max-w-xl mx-auto space-y-4">
            <div className="bg-[#181818] border border-white/10 rounded-xl p-5 space-y-4 shadow-xl">
              <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
                <Bus size={16} className="text-blue-400" />
                Emissão do Termo de Opção e Declaração de Vale-Transporte
              </h3>
              <p className="text-xs text-neutral-400">
                Declaração obrigatória conforme o Decreto nº 95.247/1987 e a Lei nº 7.418/1985 com trajetos residência-trabalho.
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-neutral-400 block mb-1">Selecione o Colaborador:</label>
                  <select
                    value={selectedColabTermo?.id || ''}
                    onChange={(e) => {
                      const col = colaboradores.find(c => c.id === parseInt(e.target.value));
                      if (col) setSelectedColabTermo(col);
                    }}
                    className="w-full bg-[#141414] border border-white/10 rounded-lg p-2 text-neutral-200 focus:outline-none focus:border-indigo-500"
                  >
                    {colaboradores.map(c => (
                      <option key={c.id} value={c.id}>{c.nome} - CPF: {c.cpf} ({c.cargo})</option>
                    ))}
                  </select>
                </div>

                {selectedColabTermo && (
                  <div className="p-3 bg-[#141414] rounded-lg border border-white/5 space-y-1 font-mono text-[11px]">
                    <div><span className="text-neutral-500">Salário Base:</span> R$ {(selectedColabTermo.salarioBase || 0).toFixed(2)}</div>
                    <div><span className="text-neutral-500">Teto Legal Desconto (6%):</span> R$ {((selectedColabTermo.salarioBase || 0) * 0.06).toFixed(2)}</div>
                    <div><span className="text-neutral-500">Endereço Residencial:</span> {selectedColabTermo.logradouro || 'Endereço residencial cadastrado'}</div>
                  </div>
                )}

                <button
                  onClick={() => setShowPrintTermoModal(true)}
                  className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg font-medium transition shadow-sm mt-4"
                >
                  <Printer size={14} />
                  <span>Imprimir Termo de Opção A4 com Assinaturas</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal A4 do Mapa Mensal de Benefícios */}
      {showPrintMapaModal && fechamento && empresa && (
        <ReportPrintPreviewModal
          isOpen={showPrintMapaModal}
          onClose={() => setShowPrintMapaModal(false)}
          empresa={empresa}
          tituloRelatorio="MAPA MENSAL DE CONCESSÃO DE BENEFÍCIOS (VT / VR / SAÚDE)"
          subtitulo="Demonstrativo Analítico de Descontos e Subsídio Legal do Empregador"
          periodo={`Competência: ${competencia}`}
        >
          <div className="space-y-4 text-black font-sans text-xs">
            <div className="border border-black p-3 space-y-2">
              <div className="font-bold text-sm border-b border-black pb-1 uppercase">
                1. RESUMO DOS CUSTOS DE BENEFÍCIOS NA COMPETÊNCIA
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div><span className="font-semibold">Total Benefícios Fornecidos:</span> R$ {fechamento.totalBeneficiosFornecidos.toFixed(2)}</div>
                <div><span className="font-semibold">Total Desconto Colaboradores:</span> R$ {fechamento.totalDescontoEmpregados.toFixed(2)}</div>
                <div><span className="font-semibold">Custo Líquido Empresa:</span> R$ {fechamento.totalCustoEmpresa.toFixed(2)}</div>
              </div>
            </div>

            <div className="border border-black">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-100 border-b border-black font-mono uppercase text-[10px]">
                    <th className="p-2 text-left">Colaborador</th>
                    <th className="p-2 text-left">Benefício</th>
                    <th className="p-2 text-center">Dias</th>
                    <th className="p-2 text-right">Valor Total (R$)</th>
                    <th className="p-2 text-right">Desconto (R$)</th>
                    <th className="p-2 text-right">Custo Empresa (R$)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300 font-mono">
                  {fechamento.itens.map(item => (
                    <tr key={item.id}>
                      <td className="p-2 font-sans">{item.colaboradorNome}</td>
                      <td className="p-2">{item.tipo}</td>
                      <td className="p-2 text-center">{item.diasUteisMes}</td>
                      <td className="p-2 text-right">R$ {item.valorTotalBeneficio.toFixed(2)}</td>
                      <td className="p-2 text-right">R$ {item.descontoColaborador.toFixed(2)}</td>
                      <td className="p-2 text-right font-bold">R$ {item.custoEmpregador.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-black font-bold font-mono">
                    <td colSpan={3} className="p-2 text-right uppercase">TOTAIS DO PERÍODO:</td>
                    <td className="p-2 text-right">R$ {fechamento.totalBeneficiosFornecidos.toFixed(2)}</td>
                    <td className="p-2 text-right">R$ {fechamento.totalDescontoEmpregados.toFixed(2)}</td>
                    <td className="p-2 text-right">R$ {fechamento.totalCustoEmpresa.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
              <div className="border-t border-black pt-1">
                Responsável pelo Departamento Pessoal
              </div>
              <div className="border-t border-black pt-1">
                Diretoria Financeira / Contabilidade
              </div>
            </div>
          </div>
        </ReportPrintPreviewModal>
      )}

      {/* Modal A4 Termo de Opção de Vale-Transporte */}
      {showPrintTermoModal && selectedColabTermo && empresa && (
        <ReportPrintPreviewModal
          isOpen={showPrintTermoModal}
          onClose={() => setShowPrintTermoModal(false)}
          empresa={empresa}
          tituloRelatorio="TERMO DE OPÇÃO E DECLARAÇÃO DE VALE-TRANSPORTE"
          subtitulo="Conforme Decreto Federal nº 95.247/1987 e Lei nº 7.418/1985"
          periodo="Exercício 2026"
        >
          <div className="space-y-6 text-black font-sans text-xs leading-relaxed">
            <div className="border border-black p-4 space-y-2">
              <div className="font-bold uppercase border-b border-black pb-1">I - QUALIFICAÇÃO DO BENEFICIÁRIO</div>
              <div className="grid grid-cols-2 gap-2">
                <div><span className="font-semibold">Nome:</span> {selectedColabTermo.nome}</div>
                <div><span className="font-semibold">CPF:</span> {selectedColabTermo.cpf}</div>
                <div><span className="font-semibold">Cargo:</span> {selectedColabTermo.cargo}</div>
                <div><span className="font-semibold">Salário Base:</span> R$ {(selectedColabTermo.salarioBase || 0).toFixed(2)}</div>
                <div className="col-span-2"><span className="font-semibold">Endereço Residencial:</span> {selectedColabTermo.logradouro || 'São Paulo - SP'}</div>
              </div>
            </div>

            <div className="border border-black p-4 space-y-2">
              <div className="font-bold uppercase border-b border-black pb-1">II - DECLARAÇÃO DE OPÇÃO</div>
              <p>
                Declaro, nos termos da Lei nº 7.418, de 16 de dezembro de 1985, regulamentada pelo Decreto nº 95.247, de 17 de novembro de 1987, 
                que <strong>OPTO</strong> pela utilização do Vale-Transporte para o deslocamento residência-trabalho e vice-versa, 
                autorizando expressamente o desconto de até <strong>6% (seis por cento)</strong> do meu salário básico mensal.
              </p>
              <div className="p-3 bg-gray-50 border border-gray-300 font-mono text-[11px] space-y-1">
                <div>Meio de Transporte Utilizado: Ônibus Urbano / Metrô SPTrans</div>
                <div>Tarifa Facial Vigente: R$ 5,00 por passagem</div>
                <div>Quantidade Diária Solicitada: 02 (duas) viagens por dia útil</div>
              </div>
            </div>

            <div className="border border-black p-4 space-y-2">
              <div className="font-bold uppercase border-b border-black pb-1">III - COMPROMISSO LEGAL</div>
              <p>
                Comprometo-me a utilizar o benefício estritamente para os deslocamentos necessários ao desempenho das minhas funções laborais, 
                ficando ciente de que a declaração falsa ou o uso indevido do Vale-Transporte constitui falta grave passível de demissão por justa causa (Art. 482 da CLT).
              </p>
            </div>

            <div className="pt-12 grid grid-cols-2 gap-12 text-center text-xs">
              <div className="border-t border-black pt-1">
                {selectedColabTermo.nome}<br />
                Assinatura do Colaborador
              </div>
              <div className="border-t border-black pt-1">
                {empresa.razaoSocial}<br />
                Assinatura do Empregador
              </div>
            </div>
          </div>
        </ReportPrintPreviewModal>
      )}

      {/* Modal Novo Plano */}
      {showNovoPlanoModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-white/10 rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
              <Plus size={16} className="text-indigo-400" />
              Cadastrar Novo Plano de Benefício
            </h3>

            <form onSubmit={handleSalvarPlano} className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">Tipo de Benefício:</label>
                <select
                  value={formTipo}
                  onChange={(e) => setFormTipo(e.target.value as TipoBeneficio)}
                  className="w-full bg-[#141414] border border-white/10 rounded-lg p-2 text-neutral-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="VALE_TRANSPORTE">Vale-Transporte (VT)</option>
                  <option value="VALE_REFEICAO">Vale-Refeição (VR)</option>
                  <option value="VALE_ALIMENTACAO">Vale-Alimentação (VA)</option>
                  <option value="PLANO_SAUDE">Plano de Saúde Corporativo</option>
                  <option value="PLANO_ODONTO">Plano Odontológico</option>
                  <option value="SEGURO_VIDA">Seguro de Vida em Grupo</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Nome do Plano:</label>
                <input
                  type="text"
                  required
                  value={formNome}
                  onChange={(e) => setFormNome(e.target.value)}
                  placeholder="Ex: Flash Card Flex Refeição"
                  className="w-full bg-[#141414] border border-white/10 rounded-lg p-2 text-neutral-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Operadora / Fornecedor:</label>
                <input
                  type="text"
                  value={formOperadora}
                  onChange={(e) => setFormOperadora(e.target.value)}
                  placeholder="Ex: Flash / SPTrans / Bradesco"
                  className="w-full bg-[#141414] border border-white/10 rounded-lg p-2 text-neutral-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Valor Facial Unitário (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formValorFacial}
                    onChange={(e) => setFormValorFacial(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#141414] border border-white/10 rounded-lg p-2 text-neutral-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">% Desconto Legal:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formDescontoLegal}
                    onChange={(e) => setFormDescontoLegal(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#141414] border border-white/10 rounded-lg p-2 text-neutral-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowNovoPlanoModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-white/10 text-neutral-300 hover:bg-neutral-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition"
                >
                  Salvar Plano
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
