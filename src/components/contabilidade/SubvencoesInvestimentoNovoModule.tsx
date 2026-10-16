import React, { useState, useEffect } from 'react';
import {
  Building2,
  DollarSign,
  FileText,
  Printer,
  Plus,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Layers,
  Percent,
  X,
  FileCheck,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  Landmark,
  Award,
  Search,
  Scale
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  ItemSubvencaoInvestimentoNovo,
  ResumoSubvencoesInvestimentoNovo,
  TipoAtoConcessivoSubvencao
} from '../../types/contabil';

export const SubvencoesInvestimentoNovoModule: React.FC = () => {
  const [resumo, setResumo] = useState<ResumoSubvencoesInvestimentoNovo | null>(null);
  const [selectedSubv, setSelectedSubv] = useState<ItemSubvencaoInvestimentoNovo | null>(null);
  const [activeTab, setActiveTab] = useState<'projetos' | 'destinacao_pl' | 'habilitacao_rfb' | 'laudo_a4'>('projetos');
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');
  const [termoBusca, setTermoBusca] = useState('');

  // Modais
  const [modalNovoProjeto, setModalNovoProjeto] = useState(false);

  // Feedbacks
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  // Form State
  const [formSubv, setFormSubv] = useState<Partial<ItemSubvencaoInvestimentoNovo>>({
    numeroHabilitacaoRFB: '',
    tipoIncentivoEstadual: 'PRODEPE_PE',
    ufConcessora: 'PE',
    numeroLeiDecretoEstadual: '',
    nomeProjetoImplantacaoExpansao: '',
    competencia: '2026-03',
    valorDespesaDepreciacaoBRL: 100000,
    aliquotaCreditoFiscalPercentual: 25.0,
    valorSubvencaoEstadualAproveitadaBRL: 50000,
    observacoes: ''
  });

  const carregarDados = () => {
    const dados = dbService.getSubvencoesInvestimentoNovo();
    setResumo(dados);
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleSalvarNovoProjeto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSubv.numeroHabilitacaoRFB || !formSubv.nomeProjetoImplantacaoExpansao || !formSubv.valorDespesaDepreciacaoBRL) {
      setMensagemErro('Preencha os campos obrigatórios da habilitação RFB e despesas de depreciação.');
      return;
    }

    const vlrDeprec = Number(formSubv.valorDespesaDepreciacaoBRL || 0);
    const aliq = 25.0; // Padrão Lei 14.789/23
    const vlrCred = Number(((vlrDeprec * aliq) / 100).toFixed(2));

    const novo: ItemSubvencaoInvestimentoNovo = {
      id: `subv-nv-${Date.now()}`,
      empresaId: resumo?.empresaId || 1,
      numeroHabilitacaoRFB: formSubv.numeroHabilitacaoRFB,
      tipoIncentivoEstadual: (formSubv.tipoIncentivoEstadual || 'PRODEPE_PE') as TipoAtoConcessivoSubvencao,
      ufConcessora: formSubv.ufConcessora || 'PE',
      numeroLeiDecretoEstadual: formSubv.numeroLeiDecretoEstadual || 'Legislação Estadual de Incentivo',
      nomeProjetoImplantacaoExpansao: formSubv.nomeProjetoImplantacaoExpansao,
      competencia: formSubv.competencia || '2026-03',
      valorDespesaDepreciacaoBRL: vlrDeprec,
      aliquotaCreditoFiscalPercentual: aliq,
      valorCreditoFiscalIrpjBRL: vlrCred,
      valorSubvencaoEstadualAproveitadaBRL: Number(formSubv.valorSubvencaoEstadualAproveitadaBRL || 0),
      statusAproveitamento: 'HABILITADO_RFB',
      integradoContabil: false,
      observacoes: formSubv.observacoes || ''
    };

    const res = dbService.salvarItemSubvencaoNovo(novo);
    if (res.sucesso) {
      setMensagemSucesso(res.mensagem);
      setModalNovoProjeto(false);
      carregarDados();
    } else {
      setMensagemErro('Erro ao registrar projeto de subvenção.');
    }
  };

  const handleIntegrarContabil = (id: string) => {
    const res = dbService.integrarSubvencaoNovoContabil(id);
    if (res.sucesso) {
      setMensagemSucesso(res.mensagem);
      carregarDados();
    } else {
      setMensagemErro(res.mensagem);
    }
  };

  const itensFiltrados = (resumo?.itens || []).filter(item => {
    const matchTipo = filtroTipo === 'TODOS' || item.tipoIncentivoEstadual === filtroTipo;
    const matchBusca = termoBusca === '' ||
      item.numeroHabilitacaoRFB.toLowerCase().includes(termoBusca.toLowerCase()) ||
      item.nomeProjetoImplantacaoExpansao.toLowerCase().includes(termoBusca.toLowerCase()) ||
      item.ufConcessora.toLowerCase().includes(termoBusca.toLowerCase());
    return matchTipo && matchBusca;
  });

  return (
    <div className="flex flex-col h-full bg-[#121212] text-gray-200 overflow-y-auto">
      {/* Top Banner / Header */}
      <div className="border-b border-gray-800 bg-[#181818] px-6 py-4 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-700 text-white shadow-lg shadow-teal-900/30">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-wide">
                Subvenções para Investimento - Crédito Fiscal IRPJ
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-teal-500/20 text-teal-400 border border-teal-500/30">
                Novo Marco Lei nº 14.789/2023 & IN RFB nº 2.170/2023
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Crédito fiscal de 25% de IRPJ sobre depreciação de bens da implantação/expansão • Reserva de Incentivos Fiscais no PL
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => carregarDados()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#242424] hover:bg-[#2e2e2e] text-gray-300 text-xs font-medium border border-gray-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Atualizar
          </button>
          <button
            onClick={() => setActiveTab('laudo_a4')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#242424] hover:bg-[#2e2e2e] text-gray-300 text-xs font-medium border border-gray-700 transition"
          >
            <Printer className="w-3.5 h-3.5 text-teal-400" />
            Laudo A4
          </button>
          <button
            onClick={() => setModalNovoProjeto(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-md shadow-teal-900/40 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Projeto Habilitado
          </button>
        </div>
      </div>

      {/* Alerts */}
      {mensagemSucesso && (
        <div className="mx-6 mt-4 p-3 rounded-lg bg-emerald-900/30 border border-emerald-700/50 flex items-center justify-between text-xs text-emerald-300 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{mensagemSucesso}</span>
          </div>
          <button onClick={() => setMensagemSucesso(null)} className="text-gray-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      {mensagemErro && (
        <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-900/30 border border-rose-700/50 flex items-center justify-between text-xs text-rose-300 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{mensagemErro}</span>
          </div>
          <button onClick={() => setMensagemErro(null)} className="text-gray-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-800 bg-[#151515] px-6 flex items-center gap-1">
        <button
          onClick={() => setActiveTab('projetos')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition ${
            activeTab === 'projetos'
              ? 'border-teal-500 text-teal-400 bg-teal-500/5'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Projetos de Implantação / Expansão ({resumo?.itens.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('destinacao_pl')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition ${
            activeTab === 'destinacao_pl'
              ? 'border-teal-500 text-teal-400 bg-teal-500/5'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Landmark className="w-4 h-4" />
          Reserva de Incentivos Fiscais (Patrimônio Líquido)
        </button>
        <button
          onClick={() => setActiveTab('habilitacao_rfb')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition ${
            activeTab === 'habilitacao_rfb'
              ? 'border-teal-500 text-teal-400 bg-teal-500/5'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Habilitação Formal RFB & ECF
        </button>
        <button
          onClick={() => setActiveTab('laudo_a4')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition ${
            activeTab === 'laudo_a4'
              ? 'border-teal-500 text-teal-400 bg-teal-500/5'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Printer className="w-4 h-4" />
          Laudo Pericial Contábil A4
        </button>
      </div>

      {/* Main Content Area */}
      <div className="p-6 flex-1">
        {/* TAB 1: PROJETOS */}
        {activeTab === 'projetos' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#1b1b1b] border border-gray-800 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Projetos Habilitados RFB</span>
                  <Award className="w-4 h-4 text-teal-400" />
                </div>
                <div className="text-2xl font-bold text-white tracking-tight">
                  {resumo?.totalProjetosHabilitados || 0} Projetos
                </div>
                <div className="text-[11px] text-gray-400 mt-2">
                  Atos Declaratórios Executivos (ADE)
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#1b1b1b] border border-gray-800 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Depreciação Elegível</span>
                  <DollarSign className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white tracking-tight">
                  R$ {(resumo?.totalDepreciacaoElegivelBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-gray-400 mt-2">
                  Base de cálculo legal de bens do ativo
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#1b1b1b] border border-gray-800 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Crédito Fiscal IRPJ (25%)</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-emerald-400 tracking-tight">
                  R$ {(resumo?.totalCreditoFiscalIrpjBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-emerald-300 mt-2">
                  Direito creditório líquido perante a União
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#1b1b1b] border border-gray-800 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Alíquota Padrão</span>
                  <Percent className="w-4 h-4 text-teal-400" />
                </div>
                <div className="text-2xl font-bold text-teal-300 tracking-tight">
                  25,00%
                </div>
                <div className="text-[11px] text-gray-400 mt-2">
                  Art. 6º da Lei nº 14.789/2023
                </div>
              </div>
            </div>

            {/* Filter and Table */}
            <div className="p-4 rounded-xl bg-[#181818] border border-gray-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
                <div className="relative flex-1 max-w-xs">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={termoBusca}
                    onChange={e => setTermoBusca(e.target.value)}
                    placeholder="Buscar habilitação, projeto ou UF..."
                    className="w-full pl-9 pr-3 py-1.5 bg-[#121212] border border-gray-700 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span>Incentivo Estadual:</span>
                  <select
                    value={filtroTipo}
                    onChange={e => setFiltroTipo(e.target.value)}
                    className="bg-[#121212] border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-teal-500"
                  >
                    <option value="TODOS">Todos os Incentivos</option>
                    <option value="PRODEPE_PE">PRODEPE (Pernambuco)</option>
                    <option value="TTD_SC">TTD (Santa Catarina)</option>
                    <option value="PRODUZIR_GO">PRODUZIR (Goiás)</option>
                    <option value="FUNDOPEM_RS">FUNDOPEM (Rio Grande do Sul)</option>
                    <option value="FOMENTAR_BA">FOMENTAR (Bahia)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-gray-800 bg-[#161616] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#202020] text-gray-400 border-b border-gray-800 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">Habilitação RFB / UF</th>
                      <th className="py-3 px-4">Projeto Implantação / Expansão</th>
                      <th className="py-3 px-4">Lei / Decreto Estadual</th>
                      <th className="py-3 px-4 text-right">Depreciação Elegível</th>
                      <th className="py-3 px-4 text-center">Alíquota IRPJ</th>
                      <th className="py-3 px-4 text-right">Crédito Fiscal IRPJ</th>
                      <th className="py-3 px-4 text-right">Subvenção ICMS</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {itensFiltrados.map(item => (
                      <tr key={item.id} className="hover:bg-[#1d1d1d] transition">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white font-mono">{item.numeroHabilitacaoRFB}</div>
                          <div className="text-[11px] text-teal-400 mt-0.5">{item.tipoIncentivoEstadual} ({item.ufConcessora})</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-200">{item.nomeProjetoImplantacaoExpansao}</div>
                          <div className="text-[10px] text-gray-500 mt-0.5">Competência: {item.competencia}</div>
                        </td>
                        <td className="py-3 px-4 text-gray-400 text-[11px]">
                          {item.numeroLeiDecretoEstadual}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-white">
                          R$ {item.valorDespesaDepreciacaoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-400 border border-teal-500/30">
                            {item.aliquotaCreditoFiscalPercentual.toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-400">
                          R$ {item.valorCreditoFiscalIrpjBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-blue-400">
                          R$ {item.valorSubvencaoEstadualAproveitadaBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            {item.statusAproveitamento.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            {item.integradoContabil ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <FileCheck className="w-3 h-3" />
                                Integrado
                              </span>
                            ) : (
                              <button
                                onClick={() => handleIntegrarContabil(item.id)}
                                className="px-2.5 py-1 rounded bg-teal-600/20 hover:bg-teal-600/30 text-teal-400 border border-teal-600/40 text-[11px] font-semibold transition flex items-center gap-1"
                              >
                                <FileCheck className="w-3 h-3" />
                                Integrar
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
          </div>
        )}

        {/* TAB 2: DESTINAÇÃO PL */}
        {activeTab === 'destinacao_pl' && (
          <div className="space-y-6">
            <div className="p-5 rounded-xl bg-[#181818] border border-gray-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-3">
                <Landmark className="w-4 h-4 text-teal-400" />
                Reserva de Incentivos Fiscais no Patrimônio Líquido (Lei 6.404/76 Art. 195-A)
              </h3>
              <p className="text-xs text-gray-400">
                O valor do crédito fiscal de IRPJ concedido pela União, bem como o montante das subvenções econômicas aproveitadas, deve ser destinado à Reserva de Incentivos Fiscais no PL, não podendo ser distribuído aos acionistas sob pena de tributação retroativa.
              </p>

              <div className="p-4 rounded-xl bg-teal-950/20 border border-teal-800/40 text-xs text-teal-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Montante Total Vinculado à Reserva de Incentivos Fiscais:</div>
                  <div className="text-2xl font-bold text-emerald-400 mt-0.5">
                    R$ {(resumo?.totalCreditoFiscalIrpjBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-1">
                    Conta Patrimonial: 2.03.02.003 - Reserva de Incentivos Fiscais (Lei 14.789/23)
                  </div>
                </div>
                <span className="px-3 py-1.5 rounded-lg bg-teal-600/30 text-teal-300 font-bold border border-teal-500/40">
                  PL Blindado
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: HABILITAÇÃO RFB */}
        {activeTab === 'habilitacao_rfb' && (
          <div className="space-y-6">
            <div className="p-5 rounded-xl bg-[#181818] border border-gray-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Procedimento de Habilitação Prévia perante a Receita Federal (IN RFB 2.170/2023)
              </h3>
              <div className="space-y-3 text-xs text-gray-300">
                <div className="p-3 rounded-lg bg-[#202020] border border-gray-800">
                  <div className="font-bold text-white mb-1">1. Requerimento Eletrônico via e-CAC</div>
                  <p className="text-gray-400">
                    A pessoa jurídica deve requerer formalmente a habilitação perante a RFB apresentando o ato concessivo da subvenção estadual emitido antes de sua fruição.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-[#202020] border border-gray-800">
                  <div className="font-bold text-white mb-1">2. Comprovação da Implantação ou Expansão</div>
                  <p className="text-gray-400">
                    Apresentação do laudo técnico descritivo do empreendimento, cronograma de aquisições de máquinas e cronograma de investimentos no ativo imobilizado.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: LAUDO A4 */}
        {activeTab === 'laudo_a4' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md transition"
              >
                <Printer className="w-4 h-4" />
                Imprimir Laudo Pericial A4
              </button>
            </div>

            <div className="max-w-4xl mx-auto bg-white text-gray-900 p-8 rounded-xl shadow-2xl border border-gray-300 font-sans text-xs print:p-0 print:border-none print:shadow-none">
              <div className="border-b-2 border-gray-900 pb-4 mb-4 flex justify-between items-start">
                <div>
                  <h2 className="text-base font-extrabold uppercase tracking-tight text-gray-900">
                    Laudo Pericial de Crédito Fiscal de IRPJ - Subvenções
                  </h2>
                  <div className="text-xs font-bold text-gray-700">
                    APURAÇÃO TRIBUTÁRIA CONFORME LEI Nº 14.789/2023 E IN RFB Nº 2.170/2023
                  </div>
                  <div className="text-[11px] text-gray-600 mt-1">
                    Beneficiária: <strong>EMPRESA PADRAO LTDA</strong> • CNPJ: <strong>01.234.567/0001-89</strong>
                  </div>
                </div>
                <div className="text-right text-[11px] text-gray-600">
                  <div>Competência: <strong>{resumo?.competencia}</strong></div>
                  <div>Emissão: <strong>{new Date().toLocaleDateString('pt-BR')}</strong></div>
                  <div>Regime: <strong>Lucro Real</strong></div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-gray-50 border border-gray-300 rounded text-center">
                <div>
                  <div className="text-[10px] text-gray-500 font-semibold uppercase">Projetos Habilitados</div>
                  <div className="text-sm font-bold text-gray-900">
                    {resumo?.totalProjetosHabilitados || 0}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-blue-700 font-semibold uppercase">Depreciação Elegível</div>
                  <div className="text-sm font-bold text-blue-800">
                    R$ {(resumo?.totalDepreciacaoElegivelBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-emerald-700 font-semibold uppercase">Crédito Fiscal IRPJ (25%)</div>
                  <div className="text-sm font-bold text-emerald-800">
                    R$ {(resumo?.totalCreditoFiscalIrpjBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <table className="w-full text-left border border-gray-300 text-[11px]">
                  <thead className="bg-gray-100 font-bold border-b border-gray-300">
                    <tr>
                      <th className="p-1.5 border-r border-gray-300">Habilitação RFB</th>
                      <th className="p-1.5 border-r border-gray-300">Projeto</th>
                      <th className="p-1.5 border-r border-gray-300">UF / Ato Concessivo</th>
                      <th className="p-1.5 border-r border-gray-300 text-right">Depreciação</th>
                      <th className="p-1.5 border-r border-gray-300 text-center">Alíquota</th>
                      <th className="p-1.5 text-right">Crédito Fiscal IRPJ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(resumo?.itens || []).map((it, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="p-1.5 border-r border-gray-300 font-mono font-semibold">{it.numeroHabilitacaoRFB}</td>
                        <td className="p-1.5 border-r border-gray-300">{it.nomeProjetoImplantacaoExpansao}</td>
                        <td className="p-1.5 border-r border-gray-300">{it.tipoIncentivoEstadual} ({it.ufConcessora})</td>
                        <td className="p-1.5 border-r border-gray-300 text-right">
                          R$ {it.valorDespesaDepreciacaoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-1.5 border-r border-gray-300 text-center">{it.aliquotaCreditoFiscalPercentual}%</td>
                        <td className="p-1.5 text-right font-bold text-emerald-800">
                          R$ {it.valorCreditoFiscalIrpjBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 pt-4 border-t border-gray-300 flex justify-between items-end text-[11px] text-gray-700">
                <div className="space-y-1">
                  <div>Base Legal: <strong>Lei nº 14.789/2023 e Instrução Normativa RFB nº 2.170/2023</strong></div>
                  <div>Destinação: <strong>Reserva de Incentivos Fiscais no PL (Art. 195-A Lei 6.404/76)</strong></div>
                </div>
                <div className="text-center w-64 border-t border-gray-800 pt-1">
                  <div className="font-bold text-gray-900">Perito Contábil / Auditor Fiscal</div>
                  <div className="text-[10px] text-gray-500">CRC/SP • Certificação Digital</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: NOVO PROJETO */}
      {modalNovoProjeto && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#181818] border border-gray-800 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-teal-400" />
                Registrar Projeto de Subvenção para Investimento
              </h3>
              <button onClick={() => setModalNovoProjeto(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSalvarNovoProjeto} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Número Habilitação RFB *</label>
                  <input
                    type="text"
                    required
                    value={formSubv.numeroHabilitacaoRFB}
                    onChange={e => setFormSubv({ ...formSubv, numeroHabilitacaoRFB: e.target.value })}
                    placeholder="2024.PE.001928"
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Incentivo Estadual</label>
                  <select
                    value={formSubv.tipoIncentivoEstadual}
                    onChange={e => setFormSubv({ ...formSubv, tipoIncentivoEstadual: e.target.value as TipoAtoConcessivoSubvencao })}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="PRODEPE_PE">PRODEPE (PE)</option>
                    <option value="TTD_SC">TTD (SC)</option>
                    <option value="PRODUZIR_GO">PRODUZIR (GO)</option>
                    <option value="FUNDOPEM_RS">FUNDOPEM (RS)</option>
                    <option value="FOMENTAR_BA">FOMENTAR (BA)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Nome do Projeto de Implantação / Expansão *</label>
                <input
                  type="text"
                  required
                  value={formSubv.nomeProjetoImplantacaoExpansao}
                  onChange={e => setFormSubv({ ...formSubv, nomeProjetoImplantacaoExpansao: e.target.value })}
                  placeholder="Ex: Expansão da Planta Robotizada"
                  className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">UF Concessora</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={formSubv.ufConcessora}
                    onChange={e => setFormSubv({ ...formSubv, ufConcessora: e.target.value.toUpperCase() })}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Lei / Decreto Concessivo</label>
                  <input
                    type="text"
                    value={formSubv.numeroLeiDecretoEstadual}
                    onChange={e => setFormSubv({ ...formSubv, numeroLeiDecretoEstadual: e.target.value })}
                    placeholder="Decreto nº 21.959/1999"
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Depreciação Elegível do Período (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formSubv.valorDespesaDepreciacaoBRL}
                    onChange={e => setFormSubv({ ...formSubv, valorDespesaDepreciacaoBRL: Number(e.target.value) })}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white font-bold focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Subvenção ICMS Aproveitada (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formSubv.valorSubvencaoEstadualAproveitadaBRL}
                    onChange={e => setFormSubv({ ...formSubv, valorSubvencaoEstadualAproveitadaBRL: Number(e.target.value) })}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalNovoProjeto(false)}
                  className="px-3 py-1.5 rounded-lg bg-[#242424] hover:bg-[#2b2b2b] text-gray-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md shadow-teal-900/30"
                >
                  Apurar Crédito Fiscal IRPJ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
