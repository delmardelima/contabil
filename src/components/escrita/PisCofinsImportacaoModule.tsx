import React, { useState, useEffect } from 'react';
import {
  Anchor,
  Globe2,
  DollarSign,
  FileText,
  Printer,
  Plus,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Building,
  Calendar,
  Layers,
  Percent,
  X,
  CreditCard,
  FileCheck,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  Package,
  Search,
  Scale,
  Landmark,
  Barcode
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  ItemPisCofinsImportacao,
  ResumoPisCofinsImportacao
} from '../../types/contabil';

export const PisCofinsImportacaoModule: React.FC = () => {
  const [resumo, setResumo] = useState<ResumoPisCofinsImportacao | null>(null);
  const [selectedDi, setSelectedDi] = useState<ItemPisCofinsImportacao | null>(null);
  const [activeTab, setActiveTab] = useState<'declaracoes' | 'guias_darf' | 'vedacao_adicional_1' | 'laudo_a4'>('declaracoes');
  const [filtroAdicional, setFiltroAdicional] = useState<string>('TODOS');
  const [termoBusca, setTermoBusca] = useState('');

  // Modais
  const [modalNovaDi, setModalNovaDi] = useState(false);

  // Feedbacks
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  // Form State
  const [formDi, setFormDi] = useState<Partial<ItemPisCofinsImportacao>>({
    numeroDeclaracaoImportacao: '',
    dataDesembaracoAduaneiro: new Date().toISOString().split('T')[0],
    numeroAdicao: '001',
    exportadorEstrangeiroNome: '',
    paisOrigem: 'Alemanha (DE)',
    codigoNcm: '8482.10.10',
    descricaoMercadoria: '',
    sujeitoAdicionalUmPorcentoCofins: true,
    valorAduaneiroCifBRL: 100000,
    valorImpostoImportacaoBRL: 14000,
    valorIpiImportacaoBRL: 10000,
    observacoes: ''
  });

  const carregarDados = () => {
    const dados = dbService.getPisCofinsImportacao();
    setResumo(dados);
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleSalvarNovaDi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDi.numeroDeclaracaoImportacao || !formDi.exportadorEstrangeiroNome || !formDi.valorAduaneiroCifBRL) {
      setMensagemErro('Preencha os campos obrigatórios da Declaração de Importação.');
      return;
    }

    const cif = Number(formDi.valorAduaneiroCifBRL || 0);
    const ii = Number(formDi.valorImpostoImportacaoBRL || 0);
    const ipi = Number(formDi.valorIpiImportacaoBRL || 0);
    const baseCalculo = Number((cif + ii + ipi).toFixed(2));

    const aliqPis = 2.10;
    const temAdicional = Boolean(formDi.sujeitoAdicionalUmPorcentoCofins);
    const aliqCofins = temAdicional ? 10.65 : 9.65;

    const vlrPis = Number(((baseCalculo * aliqPis) / 100).toFixed(2));
    const vlrCofins = Number(((baseCalculo * aliqCofins) / 100).toFixed(2));
    const vlrAdicional = temAdicional ? Number(((baseCalculo * 1.0) / 100).toFixed(2)) : 0;
    const vlrTotal = Number((vlrPis + vlrCofins).toFixed(2));

    // Apenas PIS (2.1%) e COFINS Básica (9.65%) são creditáveis. O 1% adicional integra o estoque.
    const vlrCreditoAtivo = Number((vlrPis + (vlrCofins - vlrAdicional)).toFixed(2));
    const vlrCustoEstoque = vlrAdicional;

    const nova: ItemPisCofinsImportacao = {
      id: `imp-pc-${Date.now()}`,
      empresaId: resumo?.empresaId || 1,
      numeroDeclaracaoImportacao: formDi.numeroDeclaracaoImportacao,
      dataDesembaracoAduaneiro: formDi.dataDesembaracoAduaneiro || new Date().toISOString().split('T')[0],
      numeroAdicao: formDi.numeroAdicao || '001',
      exportadorEstrangeiroNome: formDi.exportadorEstrangeiroNome,
      paisOrigem: formDi.paisOrigem || 'Alemanha (DE)',
      codigoNcm: formDi.codigoNcm || '0000.00.00',
      descricaoMercadoria: formDi.descricaoMercadoria || 'Mercadoria Importada',
      sujeitoAdicionalUmPorcentoCofins: temAdicional,
      valorAduaneiroCifBRL: cif,
      valorImpostoImportacaoBRL: ii,
      valorIpiImportacaoBRL: ipi,
      baseCalculoPisCofinsImportacaoBRL: baseCalculo,
      aliquotaPisImportacaoPercentual: aliqPis,
      aliquotaCofinsImportacaoPercentual: aliqCofins,
      valorPisImportacaoBRL: vlrPis,
      valorCofinsImportacaoBRL: vlrCofins,
      valorAdicionalUmPorcentoCofinsBRL: vlrAdicional,
      valorTotalPisCofinsImportacaoBRL: vlrTotal,
      valorCreditoPermitidoAtivoBRL: vlrCreditoAtivo,
      valorCustoEstoqueNaoCreditavelBRL: vlrCustoEstoque,
      codigoReceitaDarfPisImportacao: '5602',
      codigoReceitaDarfCofinsImportacao: '5629',
      statusDesembaraco: 'DESEMBARACADO',
      integradoContabil: false,
      observacoes: formDi.observacoes || ''
    };

    const res = dbService.salvarItemPisCofinsImportacao(nova);
    if (res.sucesso) {
      setMensagemSucesso(res.mensagem);
      setModalNovaDi(false);
      carregarDados();
    } else {
      setMensagemErro('Erro ao cadastrar Declaração de Importação.');
    }
  };

  const handleIntegrarContabil = (id: string) => {
    const res = dbService.integrarPisCofinsImportacaoContabil(id);
    if (res.sucesso) {
      setMensagemSucesso(res.mensagem);
      carregarDados();
    } else {
      setMensagemErro(res.mensagem);
    }
  };

  const declaracoesFiltradas = (resumo?.declaracoes || []).filter(item => {
    const matchAdic = filtroAdicional === 'TODOS' ||
      (filtroAdicional === 'COM_ADICIONAL' && item.sujeitoAdicionalUmPorcentoCofins) ||
      (filtroAdicional === 'SEM_ADICIONAL' && !item.sujeitoAdicionalUmPorcentoCofins);
    const matchBusca = termoBusca === '' ||
      item.numeroDeclaracaoImportacao.toLowerCase().includes(termoBusca.toLowerCase()) ||
      item.exportadorEstrangeiroNome.toLowerCase().includes(termoBusca.toLowerCase()) ||
      item.descricaoMercadoria.toLowerCase().includes(termoBusca.toLowerCase()) ||
      item.codigoNcm.toLowerCase().includes(termoBusca.toLowerCase());
    return matchAdic && matchBusca;
  });

  return (
    <div className="flex flex-col h-full bg-[#121212] text-gray-200 overflow-y-auto">
      {/* Top Banner / Header */}
      <div className="border-b border-gray-800 bg-[#181818] px-6 py-4 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-900/30">
            <Anchor className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-wide">
                PIS e COFINS sobre Importação & Adicional de 1%
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Lei nº 10.865/2004 Art. 8º § 21 & IN RFB 2.121/2022
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Tributação aduaneira • Segregação de créditos no Ativo (2,1% e 9,65%) vs Custo de Estoque não-creditável (1% adicional)
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
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            Laudo A4
          </button>
          <button
            onClick={() => setModalNovaDi(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-900/40 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Nova DI / DUIMP
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
          onClick={() => setActiveTab('declaracoes')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition ${
            activeTab === 'declaracoes'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Declarações de Importação (DI) ({resumo?.declaracoes.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('guias_darf')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition ${
            activeTab === 'guias_darf'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Landmark className="w-4 h-4" />
          Guias DARF Aduaneiras (5602 / 5629)
        </button>
        <button
          onClick={() => setActiveTab('vedacao_adicional_1')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition ${
            activeTab === 'vedacao_adicional_1'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Vedação de Crédito Adicional 1% (Art. 15 § 1º-A)
        </button>
        <button
          onClick={() => setActiveTab('laudo_a4')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition ${
            activeTab === 'laudo_a4'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Printer className="w-4 h-4" />
          Demonstrativo Aduaneiro A4
        </button>
      </div>

      {/* Main Content Area */}
      <div className="p-6 flex-1">
        {/* TAB 1: DECLARAÇÕES */}
        {activeTab === 'declaracoes' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#1b1b1b] border border-gray-800 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Valor Aduaneiro CIF Total</span>
                  <Globe2 className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white tracking-tight">
                  R$ {(resumo?.totalValorAduaneiroBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-gray-400 mt-2">
                  {resumo?.totalDeclaracoes || 0} DIs desembaraçadas
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#1b1b1b] border border-gray-800 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Crédito Ativo (PIS/COFINS)</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-emerald-400 tracking-tight">
                  R$ {(resumo?.totalCreditoAtivoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-emerald-300 mt-2">
                  Recuperável no regime não-cumulativo
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#1b1b1b] border border-gray-800 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Custo Estoque (Adicional 1%)</span>
                  <DollarSign className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-amber-400 tracking-tight">
                  R$ {(resumo?.totalAdicionalUmPorcentoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-amber-300/80 mt-2">
                  Vedado ao crédito (Lei 10.865/04)
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#1b1b1b] border border-gray-800 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Total PIS/COFINS Pago</span>
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-purple-300 tracking-tight">
                  R$ {((resumo?.totalPisImportacaoBRL || 0) + (resumo?.totalCofinsImportacaoBRL || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-gray-400 mt-2">
                  DARF 5602 + DARF 5629
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
                    placeholder="Buscar DI, exportador ou NCM..."
                    className="w-full pl-9 pr-3 py-1.5 bg-[#121212] border border-gray-700 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span>Adicional 1%:</span>
                  <select
                    value={filtroAdicional}
                    onChange={e => setFiltroAdicional(e.target.value)}
                    className="bg-[#121212] border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="TODOS">Todas as Importações</option>
                    <option value="COM_ADICIONAL">Com Adicional 1% (10,65%)</option>
                    <option value="SEM_ADICIONAL">Sem Adicional (9,65%)</option>
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
                      <th className="py-3 px-4">DI / Desembaraço</th>
                      <th className="py-3 px-4">Exportador / Origem</th>
                      <th className="py-3 px-4">NCM / Mercadoria</th>
                      <th className="py-3 px-4 text-right">Valor CIF (BRL)</th>
                      <th className="py-3 px-4 text-right">Base PIS/COFINS</th>
                      <th className="py-3 px-4 text-center">Alíq. COFINS</th>
                      <th className="py-3 px-4 text-right">PIS Import. (2,1%)</th>
                      <th className="py-3 px-4 text-right">COFINS Import.</th>
                      <th className="py-3 px-4 text-right">Crédito Ativo</th>
                      <th className="py-3 px-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {declaracoesFiltradas.map(di => (
                      <tr key={di.id} className="hover:bg-[#1d1d1d] transition">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white font-mono">{di.numeroDeclaracaoImportacao}</div>
                          <div className="text-[11px] text-gray-400 mt-0.5">{di.dataDesembaracoAduaneiro} (Ad. {di.numeroAdicao})</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-200">{di.exportadorEstrangeiroNome}</div>
                          <div className="text-[11px] text-blue-400 mt-0.5">{di.paisOrigem}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-gray-300 font-medium">{di.descricaoMercadoria}</div>
                          <div className="text-[10px] text-gray-500 font-mono mt-0.5">NCM: {di.codigoNcm}</div>
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-white">
                          R$ {di.valorAduaneiroCifBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-gray-300">
                          R$ {di.baseCalculoPisCofinsImportacaoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {di.sujeitoAdicionalUmPorcentoCofins ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30" title="9,65% básica + 1% adicional não-creditável">
                              10,65% (+1%)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-800 text-gray-300 border border-gray-700">
                              9,65%
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-emerald-400">
                          R$ {di.valorPisImportacaoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-blue-400">
                          R$ {di.valorCofinsImportacaoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-purple-300">
                          R$ {di.valorCreditoPermitidoAtivoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          {di.valorCustoEstoqueNaoCreditavelBRL > 0 && (
                            <div className="text-[10px] text-amber-400 font-normal">
                              + R$ {di.valorCustoEstoqueNaoCreditavelBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} Estoque
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            {di.integradoContabil ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <FileCheck className="w-3 h-3" />
                                Integrado
                              </span>
                            ) : (
                              <button
                                onClick={() => handleIntegrarContabil(di.id)}
                                className="px-2.5 py-1 rounded bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-600/40 text-[11px] font-semibold transition flex items-center gap-1"
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

        {/* TAB 2: GUIAS DARF */}
        {activeTab === 'guias_darf' && (
          <div className="space-y-6">
            <div className="p-5 rounded-xl bg-[#181818] border border-gray-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-3">
                <Landmark className="w-4 h-4 text-blue-400" />
                Guias DARF de Importação Aduaneira (Siscomex)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-[#1e1e1e] to-[#171717] border border-gray-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-emerald-400">DARF Código 5602 - PIS/PASEP Importação</span>
                    <span className="text-gray-400">Vencimento: Na data do registro</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    R$ {(resumo?.totalPisImportacaoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Débito automático em conta corrente vinculada ao Siscomex no desembaraço.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-[#1e1e1e] to-[#171717] border border-gray-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-blue-400">DARF Código 5629 - COFINS Importação</span>
                    <span className="text-gray-400">Vencimento: Na data do registro</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    R$ {(resumo?.totalCofinsImportacaoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Inclui a alíquota básica de 9,65% e o adicional setorial de 1 ponto percentual.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: VEDAÇÃO ADICIONAL 1% */}
        {activeTab === 'vedacao_adicional_1' && (
          <div className="space-y-6">
            <div className="p-5 rounded-xl bg-[#181818] border border-gray-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-3">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Vedação Legal de Crédito do Adicional de 1% (Art. 15 § 1º-A Lei 10.865/04)
              </h3>
              <div className="space-y-3 text-xs text-gray-300">
                <p className="text-gray-400">
                  O adicional de 1% (um ponto percentual) da alíquota da COFINS-Importação, previsto no § 21 do art. 8º da Lei nº 10.865/2004, foi instituído com finalidade extrafiscal de proteção à indústria nacional.
                </p>
                <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/40 text-amber-200">
                  <div className="font-bold text-amber-300 mb-1">Impacto Contábil Obrigatório:</div>
                  O valor correspondente ao adicional de 1% não gera direito a desconto de créditos da COFINS na sistemática não-cumulativa. Dessa forma, deve ser contabilizado como acréscimo direto ao custo de aquisição da mercadoria no Ativo Circulante (Estoques).
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
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition"
              >
                <Printer className="w-4 h-4" />
                Imprimir Demonstrativo A4
              </button>
            </div>

            <div className="max-w-4xl mx-auto bg-white text-gray-900 p-8 rounded-xl shadow-2xl border border-gray-300 font-sans text-xs print:p-0 print:border-none print:shadow-none">
              <div className="border-b-2 border-gray-900 pb-4 mb-4 flex justify-between items-start">
                <div>
                  <h2 className="text-base font-extrabold uppercase tracking-tight text-gray-900">
                    Demonstrativo de PIS e COFINS - Importação Aduaneira
                  </h2>
                  <div className="text-xs font-bold text-gray-700">
                    APURAÇÃO TRIBUTÁRIA E SEGREGAÇÃO DE CRÉDITOS (LEI Nº 10.865/2004)
                  </div>
                  <div className="text-[11px] text-gray-600 mt-1">
                    Importadora: <strong>EMPRESA PADRAO LTDA</strong> • CNPJ: <strong>01.234.567/0001-89</strong>
                  </div>
                </div>
                <div className="text-right text-[11px] text-gray-600">
                  <div>Competência: <strong>{resumo?.competencia}</strong></div>
                  <div>Emissão: <strong>{new Date().toLocaleDateString('pt-BR')}</strong></div>
                  <div>Regime: <strong>Não-Cumulativo</strong></div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-4 p-3 bg-gray-50 border border-gray-300 rounded text-center">
                <div>
                  <div className="text-[10px] text-gray-500 font-semibold uppercase">Total Valor CIF (BRL)</div>
                  <div className="text-sm font-bold text-gray-900">
                    R$ {(resumo?.totalValorAduaneiroBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-emerald-700 font-semibold uppercase">PIS Importação (2,1%)</div>
                  <div className="text-sm font-bold text-emerald-800">
                    R$ {(resumo?.totalPisImportacaoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-blue-700 font-semibold uppercase">COFINS Importação</div>
                  <div className="text-sm font-bold text-blue-800">
                    R$ {(resumo?.totalCofinsImportacaoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-amber-700 font-semibold uppercase">Adicional 1% (Estoque)</div>
                  <div className="text-sm font-bold text-amber-800">
                    R$ {(resumo?.totalAdicionalUmPorcentoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <table className="w-full text-left border border-gray-300 text-[11px]">
                  <thead className="bg-gray-100 font-bold border-b border-gray-300">
                    <tr>
                      <th className="p-1.5 border-r border-gray-300">DI / Adição</th>
                      <th className="p-1.5 border-r border-gray-300">Exportador / Origem</th>
                      <th className="p-1.5 border-r border-gray-300">NCM</th>
                      <th className="p-1.5 border-r border-gray-300 text-right">Valor CIF</th>
                      <th className="p-1.5 border-r border-gray-300 text-right">Base PIS/COFINS</th>
                      <th className="p-1.5 border-r border-gray-300 text-center">Alíq. COFINS</th>
                      <th className="p-1.5 border-r border-gray-300 text-right">PIS</th>
                      <th className="p-1.5 border-r border-gray-300 text-right">COFINS</th>
                      <th className="p-1.5 text-right">Crédito Ativo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(resumo?.declaracoes || []).map((di, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="p-1.5 border-r border-gray-300 font-mono font-semibold">{di.numeroDeclaracaoImportacao}</td>
                        <td className="p-1.5 border-r border-gray-300">{di.exportadorEstrangeiroNome} ({di.paisOrigem})</td>
                        <td className="p-1.5 border-r border-gray-300 font-mono">{di.codigoNcm}</td>
                        <td className="p-1.5 border-r border-gray-300 text-right">
                          R$ {di.valorAduaneiroCifBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-1.5 border-r border-gray-300 text-right">
                          R$ {di.baseCalculoPisCofinsImportacaoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-1.5 border-r border-gray-300 text-center">{di.aliquotaCofinsImportacaoPercentual}%</td>
                        <td className="p-1.5 border-r border-gray-300 text-right text-emerald-800">
                          R$ {di.valorPisImportacaoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-1.5 border-r border-gray-300 text-right text-blue-800">
                          R$ {di.valorCofinsImportacaoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-1.5 text-right font-bold text-gray-900">
                          R$ {di.valorCreditoPermitidoAtivoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 pt-4 border-t border-gray-300 flex justify-between items-end text-[11px] text-gray-700">
                <div className="space-y-1">
                  <div>Recolhimento: <strong>DARF 5602 (PIS Importação) e DARF 5629 (COFINS Importação)</strong></div>
                  <div>Tratamento Fiscal: <strong>Adicional 1% incorporado ao custo contábil dos estoques</strong></div>
                </div>
                <div className="text-center w-64 border-t border-gray-800 pt-1">
                  <div className="font-bold text-gray-900">Despachante / Responsável Aduaneiro</div>
                  <div className="text-[10px] text-gray-500">SDA Siscomex • Validação Oficial</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: NOVA DI */}
      {modalNovaDi && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#181818] border border-gray-800 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-400" />
                Registrar Declaração de Importação (DI / DUIMP)
              </h3>
              <button onClick={() => setModalNovaDi(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSalvarNovaDi} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Número DI / DUIMP *</label>
                  <input
                    type="text"
                    required
                    value={formDi.numeroDeclaracaoImportacao}
                    onChange={e => setFormDi({ ...formDi, numeroDeclaracaoImportacao: e.target.value })}
                    placeholder="DI 26/0890123-4"
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Data Desembaraço</label>
                  <input
                    type="date"
                    value={formDi.dataDesembaracoAduaneiro}
                    onChange={e => setFormDi({ ...formDi, dataDesembaracoAduaneiro: e.target.value })}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Exportador Estrangeiro *</label>
                  <input
                    type="text"
                    required
                    value={formDi.exportadorEstrangeiroNome}
                    onChange={e => setFormDi({ ...formDi, exportadorEstrangeiroNome: e.target.value })}
                    placeholder="Nome da empresa estrangeira"
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">País Origem</label>
                  <input
                    type="text"
                    value={formDi.paisOrigem}
                    onChange={e => setFormDi({ ...formDi, paisOrigem: e.target.value })}
                    placeholder="Alemanha (DE)"
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">NCM</label>
                  <input
                    type="text"
                    value={formDi.codigoNcm}
                    onChange={e => setFormDi({ ...formDi, codigoNcm: e.target.value })}
                    placeholder="8482.10.10"
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Incide Adicional 1% COFINS?</label>
                  <select
                    value={formDi.sujeitoAdicionalUmPorcentoCofins ? 'SIM' : 'NAO'}
                    onChange={e => setFormDi({ ...formDi, sujeitoAdicionalUmPorcentoCofins: e.target.value === 'SIM' })}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="SIM">Sim (Alíquota 10,65%)</option>
                    <option value="NAO">Não (Alíquota 9,65%)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Valor Aduaneiro CIF (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formDi.valorAduaneiroCifBRL}
                    onChange={e => setFormDi({ ...formDi, valorAduaneiroCifBRL: Number(e.target.value) })}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Imposto Importação (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formDi.valorImpostoImportacaoBRL}
                    onChange={e => setFormDi({ ...formDi, valorImpostoImportacaoBRL: Number(e.target.value) })}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">IPI Importação (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formDi.valorIpiImportacaoBRL}
                    onChange={e => setFormDi({ ...formDi, valorIpiImportacaoBRL: Number(e.target.value) })}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Descrição da Mercadoria</label>
                <input
                  type="text"
                  value={formDi.descricaoMercadoria}
                  onChange={e => setFormDi({ ...formDi, descricaoMercadoria: e.target.value })}
                  placeholder="Ex: Rolamentos de esferas de alta precisão"
                  className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-gray-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalNovaDi(false)}
                  className="px-3 py-1.5 rounded-lg bg-[#242424] hover:bg-[#2b2b2b] text-gray-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-900/30"
                >
                  Salvar Declaração de Importação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
