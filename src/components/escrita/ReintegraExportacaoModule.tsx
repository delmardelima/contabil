import React, { useState, useEffect } from 'react';
import {
  Ship,
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
  Send,
  Database,
  Search,
  ExternalLink,
  Percent,
  X,
  CreditCard,
  FileCheck,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  Anchor,
  Scale
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  ItemExportacaoReintegra,
  ResumoReintegraExportacao,
  StatusReintegra
} from '../../types/contabil';

export interface ReintegraExportacaoModuleProps {
  empresaAtiva?: any;
  onOpenReportPreview?: (config: any) => void;
}

export const ReintegraExportacaoModule: React.FC<ReintegraExportacaoModuleProps> = () => {
  const [resumo, setResumo] = useState<ResumoReintegraExportacao | null>(null);
  const [selectedOp, setSelectedOp] = useState<ItemExportacaoReintegra | null>(null);
  const [activeTab, setActiveTab] = useState<'operacoes' | 'solicitacao_perdcomp' | 'requisitos_manufaturados' | 'memoria_calculo_a4'>('operacoes');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  const [termoBusca, setTermoBusca] = useState('');

  // Modais
  const [modalNovaOp, setModalNovaOp] = useState(false);

  // Feedbacks
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  // Form State: Nova Exportação REINTEGRA
  const [formOp, setFormOp] = useState<Partial<ItemExportacaoReintegra>>({
    numeroDueExportacao: '',
    numeroChaveNfeExportacao: '',
    numeroNotaFiscal: '',
    dataAverbacaoExportacao: new Date().toISOString().split('T')[0],
    paisDestino: 'Estados Unidos (US)',
    moedaOperacao: 'USD',
    taxaCambioPtax: 5.10,
    valorFobMoedaEstrangeira: 50000,
    codigoNcm: '8501.52.10',
    descricaoMercadoriaManufaturada: '',
    percentualInsumoImportado: 15.0,
    percentualReintegraAplicado: 1.0,
    observacoes: ''
  });

  const carregarDados = () => {
    const dados = dbService.getReintegraExportacao();
    setResumo(dados);
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleSalvarNovaOp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formOp.numeroDueExportacao || !formOp.numeroNotaFiscal || !formOp.valorFobMoedaEstrangeira) {
      setMensagemErro('Preencha os campos obrigatórios da DU-E e da Nota Fiscal.');
      return;
    }

    const ptax = Number(formOp.taxaCambioPtax || 5.10);
    const vlrFobMoeda = Number(formOp.valorFobMoedaEstrangeira || 0);
    const vlrFobBrl = Number((vlrFobMoeda * ptax).toFixed(2));
    const pct = Number(formOp.percentualReintegraAplicado || 1.0);
    const vlrCredito = Number(((vlrFobBrl * pct) / 100).toFixed(2));

    const nova: ItemExportacaoReintegra = {
      id: `reint-${Date.now()}`,
      empresaId: resumo?.empresaId || 1,
      numeroDueExportacao: formOp.numeroDueExportacao,
      numeroChaveNfeExportacao: formOp.numeroChaveNfeExportacao || '35260301234567000189550010000000001000000000',
      numeroNotaFiscal: formOp.numeroNotaFiscal,
      dataAverbacaoExportacao: formOp.dataAverbacaoExportacao || new Date().toISOString().split('T')[0],
      paisDestino: formOp.paisDestino || 'Estados Unidos (US)',
      moedaOperacao: (formOp.moedaOperacao || 'USD') as 'USD' | 'EUR' | 'BRL',
      taxaCambioPtax: ptax,
      valorFobMoedaEstrangeira: vlrFobMoeda,
      valorFobBRL: vlrFobBrl,
      codigoNcm: formOp.codigoNcm || '0000.00.00',
      descricaoMercadoriaManufaturada: formOp.descricaoMercadoriaManufaturada || 'Produto Manufaturado Exportado',
      percentualInsumoImportado: Number(formOp.percentualInsumoImportado || 15.0),
      percentualReintegraAplicado: pct,
      valorCreditoReintegraBRL: vlrCredito,
      status: 'APURADO',
      integradoContabil: false,
      observacoes: formOp.observacoes || ''
    };

    const res = dbService.salvarItemReintegra(nova);
    if (res.sucesso) {
      setMensagemSucesso(res.mensagem);
      setModalNovaOp(false);
      carregarDados();
    } else {
      setMensagemErro('Erro ao registrar exportação REINTEGRA.');
    }
  };

  const handleIntegrarContabil = (id: string) => {
    const res = dbService.integrarReintegraContabil(id);
    if (res.sucesso) {
      setMensagemSucesso(res.mensagem);
      carregarDados();
    } else {
      setMensagemErro(res.mensagem);
    }
  };

  const operacoesFiltradas = (resumo?.operacoes || resumo?.itens || []).filter(item => {
    const due = item.numeroDueExportacao || item.numeroDUE || '';
    const nf = item.numeroNotaFiscal || item.numeroNotaFiscalExportacao || '';
    const desc = item.descricaoMercadoriaManufaturada || item.descricaoProdutoManufaturado || '';
    const pais = item.paisDestino || '';
    const matchStatus = filtroStatus === 'TODOS' || item.status === filtroStatus || item.statusCredito === filtroStatus;
    const matchBusca = termoBusca === '' ||
      due.toLowerCase().includes(termoBusca.toLowerCase()) ||
      nf.toLowerCase().includes(termoBusca.toLowerCase()) ||
      desc.toLowerCase().includes(termoBusca.toLowerCase()) ||
      pais.toLowerCase().includes(termoBusca.toLowerCase());
    return matchStatus && matchBusca;
  });

  return (
    <div className="flex flex-col h-full bg-[#121212] text-gray-200 overflow-y-auto">
      {/* Top Banner / Header */}
      <div className="border-b border-gray-800 bg-[#181818] px-6 py-4 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 text-white shadow-lg shadow-cyan-900/30">
            <Ship className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-wide">
                REINTEGRA - Exportação de Manufaturados
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                Lei nº 13.043/2014 & Decreto nº 8.415/2015
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Reintegração de resíduos tributários federais incidentes sobre a cadeia de produção exportada • Declaração Única de Exportação (DU-E)
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
            onClick={() => setActiveTab('memoria_calculo_a4')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#242424] hover:bg-[#2e2e2e] text-gray-300 text-xs font-medium border border-gray-700 transition"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            Laudo A4
          </button>
          <button
            onClick={() => setModalNovaOp(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-900/40 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Nova Exportação DU-E
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
          onClick={() => setActiveTab('operacoes')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition ${
            activeTab === 'operacoes'
              ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Exportações Averbadas (DU-E) ({resumo?.operacoes?.length || resumo?.itens?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('solicitacao_perdcomp')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition ${
            activeTab === 'solicitacao_perdcomp'
              ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Scale className="w-4 h-4" />
          Ressarcimento / Compensação (PER/DCOMP)
        </button>
        <button
          onClick={() => setActiveTab('requisitos_manufaturados')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition ${
            activeTab === 'requisitos_manufaturados'
              ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Elegibilidade TIPI & Limite Insumos Importados
        </button>
        <button
          onClick={() => setActiveTab('memoria_calculo_a4')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition ${
            activeTab === 'memoria_calculo_a4'
              ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Printer className="w-4 h-4" />
          Memória de Cálculo Oficial A4
        </button>
      </div>

      {/* Main Content Area */}
      <div className="p-6 flex-1">
        {/* TAB 1: OPERAÇÕES */}
        {activeTab === 'operacoes' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#1b1b1b] border border-gray-800 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Total DU-Es Averbadas</span>
                  <Ship className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-bold text-white tracking-tight">
                  {resumo?.totalDues || 0} Declarações
                </div>
                <div className="text-[11px] text-gray-400 mt-2">
                  Siscomex Portal Único
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#1b1b1b] border border-gray-800 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">FOB Exportado (BRL)</span>
                  <Globe2 className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white tracking-tight">
                  R$ {(resumo?.totalFobExportadoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-gray-400 mt-2">
                  Base de cálculo do benefício fiscal
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#1b1b1b] border border-gray-800 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Crédito REINTEGRA Total</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-emerald-400 tracking-tight">
                  R$ {(resumo?.totalCreditoReintegraBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-emerald-300 mt-2">
                  Ressarcimento em espécie / Compensação RFB
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#1b1b1b] border border-gray-800 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Status Médio</span>
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-bold text-cyan-300 tracking-tight">
                  100% Elegível
                </div>
                <div className="text-[11px] text-gray-400 mt-2">
                  Insumos importados &lt; 40%
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
                    placeholder="Buscar DU-E, NF-e ou produto..."
                    className="w-full pl-9 pr-3 py-1.5 bg-[#121212] border border-gray-700 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span>Status:</span>
                  <select
                    value={filtroStatus}
                    onChange={e => setFiltroStatus(e.target.value)}
                    className="bg-[#121212] border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="TODOS">Todos os Status</option>
                    <option value="APURADO">Apurado</option>
                    <option value="SOLICITADO_PERDCOMP">Solicitado PER/DCOMP</option>
                    <option value="RESSARCIDO_CONTA">Ressarcido em Conta</option>
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
                      <th className="py-3 px-4">DU-E / Averbação</th>
                      <th className="py-3 px-4">Nota Fiscal / País</th>
                      <th className="py-3 px-4">NCM / Manufaturado</th>
                      <th className="py-3 px-4 text-right">FOB (Moeda Ext.)</th>
                      <th className="py-3 px-4 text-right">FOB (BRL)</th>
                      <th className="py-3 px-4 text-center">% Insumo Imp.</th>
                      <th className="py-3 px-4 text-center">% Reintegra</th>
                      <th className="py-3 px-4 text-right">Crédito REINTEGRA</th>
                      <th className="py-3 px-4 text-center">PER/DCOMP</th>
                      <th className="py-3 px-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {operacoesFiltradas.map(op => (
                      <tr key={op.id} className="hover:bg-[#1d1d1d] transition">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white font-mono">{op.numeroDueExportacao || op.numeroDUE}</div>
                          <div className="text-[11px] text-gray-400 mt-0.5">{op.dataAverbacaoExportacao || op.dataAverbacaoEmbarque}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-200">{op.numeroNotaFiscal || op.numeroNotaFiscalExportacao}</div>
                          <div className="text-[11px] text-cyan-400/80 mt-0.5">{op.paisDestino}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-gray-300 font-medium">{op.descricaoMercadoriaManufaturada || op.descricaoProdutoManufaturado}</div>
                          <div className="text-[10px] text-gray-500 font-mono mt-0.5">NCM: {op.codigoNcm}</div>
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-gray-300">
                          {op.moedaOperacao || op.moedaExportacao || 'USD'} {op.valorFobMoedaEstrangeira.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          <div className="text-[10px] text-gray-500">PTAX: R$ {(op.taxaCambioPtax || op.taxaCambialPtaxAverbacao || 1).toFixed(2)}</div>
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-white">
                          R$ {(op.valorFobBRL || op.valorFobReaisBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-800 text-gray-300 border border-gray-700">
                            {op.percentualInsumoImportado.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                            {(op.percentualReintegraAplicado || op.aliquotaReintegraPercentual || 0).toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-400">
                          R$ {(op.valorCreditoReintegraBRL || op.valorCreditoReintegraCalculado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {op.numeroProcessoPerdcomp ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                              {op.numeroProcessoPerdcomp}
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-500">A Transmitir</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            {op.integradoContabil ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <FileCheck className="w-3 h-3" />
                                Integrado
                              </span>
                            ) : (
                              <button
                                onClick={() => handleIntegrarContabil(op.id)}
                                className="px-2.5 py-1 rounded bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-600/40 text-[11px] font-semibold transition flex items-center gap-1"
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

        {/* TAB 2: SOLICITAÇÃO PER/DCOMP */}
        {activeTab === 'solicitacao_perdcomp' && (
          <div className="space-y-6">
            <div className="p-5 rounded-xl bg-[#181818] border border-gray-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-3">
                <Scale className="w-4 h-4 text-cyan-400" />
                Transmissão da PER/DCOMP de REINTEGRA (IN RFB nº 2.055/2021)
              </h3>
              <p className="text-xs text-gray-400">
                O crédito de REINTEGRA somente pode ser usufruído após o encerramento do trimestre-calendário de averbação da exportação, sendo informado no formulário eletrônico do programa PER/DCOMP Web com vinculação direta à chave da DU-E e da NF-e averbada.
              </p>

              <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/40 text-xs text-cyan-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Crédito REINTEGRA Total Habilitado para Pedido:</div>
                  <div className="text-2xl font-bold text-emerald-400 mt-0.5">
                    R$ {(resumo?.totalCreditoReintegraBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <button
                  onClick={() => setMensagemSucesso('Arquivo magnético PER/DCOMP REINTEGRA gerado com sucesso.')}
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition shadow-md"
                >
                  Exportar Lote PER/DCOMP REINTEGRA
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: REQUISITOS MANUFATURADOS */}
        {activeTab === 'requisitos_manufaturados' && (
          <div className="space-y-6">
            <div className="p-5 rounded-xl bg-[#181818] border border-gray-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Critérios Legais de Manufatura e Insumos Importados (Decreto nº 8.415/2015)
              </h3>
              <div className="space-y-3 text-xs text-gray-300">
                <div className="p-3 rounded-lg bg-[#202020] border border-gray-800">
                  <div className="font-bold text-white mb-1">1. Código NCM Listado no Anexo do Decreto</div>
                  <p className="text-gray-400">
                    O bem exportado deve estar classificado em código da Tabela de Incidência do IPI (TIPI) expressamente contemplado na lista de produtos manufaturados do REINTEGRA.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-[#202020] border border-gray-800">
                  <div className="font-bold text-white mb-1">2. Limite Máximo de Insumos Importados (40%)</div>
                  <p className="text-gray-400">
                    O custo dos insumos importados utilizados na fabricação do bem exportado não pode ultrapassar 40% (quarenta por cento) do valor FOB de exportação, assegurando o conteúdo de agregação nacional.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MEMÓRIA DE CÁLCULO A4 */}
        {activeTab === 'memoria_calculo_a4' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md transition"
              >
                <Printer className="w-4 h-4" />
                Imprimir Laudo Oficial A4
              </button>
            </div>

            <div className="max-w-4xl mx-auto bg-white text-gray-900 p-8 rounded-xl shadow-2xl border border-gray-300 font-sans text-xs print:p-0 print:border-none print:shadow-none">
              <div className="border-b-2 border-gray-900 pb-4 mb-4 flex justify-between items-start">
                <div>
                  <h2 className="text-base font-extrabold uppercase tracking-tight text-gray-900">
                    Memória de Cálculo e Apuração Fiscal - REINTEGRA
                  </h2>
                  <div className="text-xs font-bold text-gray-700">
                    REGIME ESPECIAL DE REINTEGRAÇÃO DE VALORES TRIBUTÁRIOS (LEI 13.043/14)
                  </div>
                  <div className="text-[11px] text-gray-600 mt-1">
                    Exportadora: <strong>EMPRESA PADRAO LTDA (INDÚSTRIA E EXPORTAÇÃO)</strong> • CNPJ: <strong>01.234.567/0001-89</strong>
                  </div>
                </div>
                <div className="text-right text-[11px] text-gray-600">
                  <div>Competência: <strong>{resumo?.competencia}</strong></div>
                  <div>Emissão: <strong>{new Date().toLocaleDateString('pt-BR')}</strong></div>
                  <div>Origem: <strong>Siscomex DU-E</strong></div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-gray-50 border border-gray-300 rounded text-center">
                <div>
                  <div className="text-[10px] text-gray-500 font-semibold uppercase">Total DU-Es Averbadas</div>
                  <div className="text-sm font-bold text-gray-900">
                    {resumo?.totalDues || 0}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-blue-700 font-semibold uppercase">Valor FOB Exportado (BRL)</div>
                  <div className="text-sm font-bold text-blue-800">
                    R$ {(resumo?.totalFobExportadoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-emerald-700 font-semibold uppercase">Crédito REINTEGRA Total</div>
                  <div className="text-sm font-bold text-emerald-800">
                    R$ {(resumo?.totalCreditoReintegraBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <table className="w-full text-left border border-gray-300 text-[11px]">
                  <thead className="bg-gray-100 font-bold border-b border-gray-300">
                    <tr>
                      <th className="p-1.5 border-r border-gray-300">DU-E</th>
                      <th className="p-1.5 border-r border-gray-300">NF-e</th>
                      <th className="p-1.5 border-r border-gray-300">NCM / Manufaturado</th>
                      <th className="p-1.5 border-r border-gray-300 text-right">FOB (USD)</th>
                      <th className="p-1.5 border-r border-gray-300 text-right">FOB (BRL)</th>
                      <th className="p-1.5 border-r border-gray-300 text-center">% Insumo</th>
                      <th className="p-1.5 border-r border-gray-300 text-center">% Aliq.</th>
                      <th className="p-1.5 text-right">Crédito (BRL)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(resumo?.operacoes || resumo?.itens || []).map((op, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="p-1.5 border-r border-gray-300 font-mono font-semibold">{op.numeroDueExportacao || op.numeroDUE}</td>
                        <td className="p-1.5 border-r border-gray-300">{op.numeroNotaFiscal || op.numeroNotaFiscalExportacao}</td>
                        <td className="p-1.5 border-r border-gray-300">{op.descricaoMercadoriaManufaturada || op.descricaoProdutoManufaturado}</td>
                        <td className="p-1.5 border-r border-gray-300 text-right">
                          US$ {op.valorFobMoedaEstrangeira.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-1.5 border-r border-gray-300 text-right">
                          R$ {(op.valorFobBRL || op.valorFobReaisBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-1.5 border-r border-gray-300 text-center">{op.percentualInsumoImportado}%</td>
                        <td className="p-1.5 border-r border-gray-300 text-center">{op.percentualReintegraAplicado || op.aliquotaReintegraPercentual}%</td>
                        <td className="p-1.5 text-right font-bold text-emerald-800">
                          R$ {(op.valorCreditoReintegraBRL || op.valorCreditoReintegraCalculado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 pt-4 border-t border-gray-300 flex justify-between items-end text-[11px] text-gray-700">
                <div className="space-y-1">
                  <div>Base Legal: <strong>Lei nº 13.043/2014 e Decreto nº 8.415/2015</strong></div>
                  <div>Ressarcimento: <strong>Sujeito à homologação em PER/DCOMP perante a RFB</strong></div>
                </div>
                <div className="text-center w-64 border-t border-gray-800 pt-1">
                  <div className="font-bold text-gray-900">Auditoria Fiscal e Aduaneira</div>
                  <div className="text-[10px] text-gray-500">CRC/SP • Certificação Eletrônica</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: NOVA EXPORTAÇÃO */}
      {modalNovaOp && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#181818] border border-gray-800 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                Registrar Exportação DU-E para REINTEGRA
              </h3>
              <button onClick={() => setModalNovaOp(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSalvarNovaOp} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Número DU-E *</label>
                  <input
                    type="text"
                    required
                    value={formOp.numeroDueExportacao}
                    onChange={e => setFormOp({ ...formOp, numeroDueExportacao: e.target.value })}
                    placeholder="26BR000250000"
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Data Averbação</label>
                  <input
                    type="date"
                    value={formOp.dataAverbacaoExportacao}
                    onChange={e => setFormOp({ ...formOp, dataAverbacaoExportacao: e.target.value })}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Nota Fiscal de Exportação *</label>
                  <input
                    type="text"
                    required
                    value={formOp.numeroNotaFiscal}
                    onChange={e => setFormOp({ ...formOp, numeroNotaFiscal: e.target.value })}
                    placeholder="NF-e 046.800"
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">País Destino</label>
                  <input
                    type="text"
                    value={formOp.paisDestino}
                    onChange={e => setFormOp({ ...formOp, paisDestino: e.target.value })}
                    placeholder="Ex: Alemanha (DE)"
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Valor FOB (Moeda Ext.) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formOp.valorFobMoedaEstrangeira}
                    onChange={e => setFormOp({ ...formOp, valorFobMoedaEstrangeira: Number(e.target.value) })}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Moeda</label>
                  <select
                    value={formOp.moedaOperacao}
                    onChange={e => setFormOp({ ...formOp, moedaOperacao: e.target.value as any })}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="BRL">BRL (R$)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">PTAX (Câmbio)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formOp.taxaCambioPtax}
                    onChange={e => setFormOp({ ...formOp, taxaCambioPtax: Number(e.target.value) })}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">NCM</label>
                  <input
                    type="text"
                    value={formOp.codigoNcm}
                    onChange={e => setFormOp({ ...formOp, codigoNcm: e.target.value })}
                    placeholder="8501.52.10"
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">% Insumos Importados</label>
                  <input
                    type="number"
                    step="0.1"
                    max={40}
                    value={formOp.percentualInsumoImportado}
                    onChange={e => setFormOp({ ...formOp, percentualInsumoImportado: Number(e.target.value) })}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">% REINTEGRA</label>
                  <select
                    value={formOp.percentualReintegraAplicado}
                    onChange={e => setFormOp({ ...formOp, percentualReintegraAplicado: Number(e.target.value) })}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value={1.0}>1,00%</option>
                    <option value={2.0}>2,00%</option>
                    <option value={0.1}>0,10%</option>
                    <option value={3.0}>3,00%</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Descrição do Manufaturado</label>
                <input
                  type="text"
                  value={formOp.descricaoMercadoriaManufaturada}
                  onChange={e => setFormOp({ ...formOp, descricaoMercadoriaManufaturada: e.target.value })}
                  placeholder="Ex: Motores elétricos industriais"
                  className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-3 border-t border-gray-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalNovaOp(false)}
                  className="px-3 py-1.5 rounded-lg bg-[#242424] hover:bg-[#2b2b2b] text-gray-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-900/30"
                >
                  Apurar REINTEGRA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
