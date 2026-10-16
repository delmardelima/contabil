import React, { useState, useEffect } from 'react';
import {
  Wallet,
  DollarSign,
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingUp,
  FileText,
  Printer,
  Plus,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Search,
  Building,
  CreditCard,
  Percent,
  X,
  FileCheck,
  Landmark,
  ShieldCheck,
  ChevronRight,
  Clock,
  ArrowDownCircle,
  HelpCircle
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  ParcelaRecebimentoSimples,
  ApuracaoPgdasCaixa,
  ResumoSimplesRegimeCaixa,
  AnexoSimplesNacionalCaixa,
  FormaLiquidacaoCaixa,
  StatusParcelaCaixa
} from '../../types/contabil';

export const SimplesNacionalRegimeCaixaModule: React.FC = () => {
  const [resumo, setResumo] = useState<ResumoSimplesRegimeCaixa | null>(null);
  const [selectedParcela, setSelectedParcela] = useState<ParcelaRecebimentoSimples | null>(null);
  const [activeTab, setActiveTab] = useState<'visao_geral' | 'parcelas_duplicatas' | 'comparativo_pgdas' | 'relatorio_a4'>('visao_geral');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  const [filtroAnexo, setFiltroAnexo] = useState<string>('TODOS');
  const [termoBusca, setTermoBusca] = useState('');

  // Modais
  const [modalNovaParcela, setModalNovaParcela] = useState(false);
  const [modalLiquidar, setModalLiquidar] = useState(false);
  const [modalDetalhe, setModalDetalhe] = useState(false);

  // Feedbacks
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  // Form State: Nova Parcela
  const [formParcela, setFormParcela] = useState<Partial<ParcelaRecebimentoSimples>>({
    numeroDocumentoOrigem: '',
    serie: '1',
    dataEmissaoCompetencia: new Date().toISOString().split('T')[0],
    dataVencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    clienteRazaoSocial: '',
    clienteCnpjCpf: '',
    anexoSimples: 'ANEXO_I_COMERCIO',
    valorOriginalTituloBRL: 10000,
    valorRecebidoNoMesBRL: 0,
    saldoRemanescenteDiferidoBRL: 10000,
    formaLiquidacao: 'BOLETO_BANCARIO',
    contaBancariaDestino: 'Banco do Brasil - C/C 19280-4',
    status: 'A_RECEBER',
    aliquotaEfetivaSimplesEstimada: 4.80,
    valorSimplesApuradoBRL: 0,
    observacoes: ''
  });

  // Form State: Liquidação
  const [formLiquidacao, setFormLiquidacao] = useState({
    valorLiquidacao: 0,
    dataLiquidacao: new Date().toISOString().split('T')[0],
    forma: 'PIX' as FormaLiquidacaoCaixa,
    contaBancaria: 'Banco do Brasil - C/C 19280-4'
  });

  const carregarDados = () => {
    const dados = dbService.getSimplesRegimeCaixa();
    setResumo(dados);
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleSalvarNovaParcela = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formParcela.numeroDocumentoOrigem || !formParcela.clienteRazaoSocial || !formParcela.valorOriginalTituloBRL) {
      setMensagemErro('Preencha os campos obrigatórios (Documento, Cliente e Valor).');
      return;
    }

    const vlrOrig = Number(formParcela.valorOriginalTituloBRL);
    const vlrRec = Number(formParcela.valorRecebidoNoMesBRL || 0);
    const saldoDif = Math.max(0, vlrOrig - vlrRec);
    const aliq = Number(formParcela.aliquotaEfetivaSimplesEstimada || 4.80);
    const vlrSimples = Number(((vlrRec * aliq) / 100).toFixed(2));
    const status: StatusParcelaCaixa = vlrRec === 0 ? 'A_RECEBER' : (saldoDif === 0 ? 'RECEBIDO_TOTAL' : 'RECEBIDO_PARCIAL');

    const nova: ParcelaRecebimentoSimples = {
      id: `snc-${Date.now()}`,
      empresaId: resumo?.empresaId || 1,
      numeroDocumentoOrigem: formParcela.numeroDocumentoOrigem,
      serie: formParcela.serie || '1',
      dataEmissaoCompetencia: formParcela.dataEmissaoCompetencia || new Date().toISOString().split('T')[0],
      dataVencimento: formParcela.dataVencimento || '',
      dataLiquidacaoEfetiva: vlrRec > 0 ? (formParcela.dataLiquidacaoEfetiva || new Date().toISOString().split('T')[0]) : undefined,
      clienteRazaoSocial: formParcela.clienteRazaoSocial,
      clienteCnpjCpf: formParcela.clienteCnpjCpf || '00.000.000/0001-00',
      anexoSimples: (formParcela.anexoSimples || 'ANEXO_I_COMERCIO') as AnexoSimplesNacionalCaixa,
      valorOriginalTituloBRL: vlrOrig,
      valorRecebidoNoMesBRL: vlrRec,
      saldoRemanescenteDiferidoBRL: saldoDif,
      formaLiquidacao: (formParcela.formaLiquidacao || 'BOLETO_BANCARIO') as FormaLiquidacaoCaixa,
      contaBancariaDestino: formParcela.contaBancariaDestino || 'Banco do Brasil - C/C 19280-4',
      status,
      aliquotaEfetivaSimplesEstimada: aliq,
      valorSimplesApuradoBRL: vlrSimples,
      integradoContabil: false,
      observacoes: formParcela.observacoes || ''
    };

    const res = dbService.salvarParcelaSimplesCaixa(nova);
    if (res.sucesso) {
      setMensagemSucesso(res.mensagem);
      setModalNovaParcela(false);
      carregarDados();
    } else {
      setMensagemErro('Erro ao registrar parcela no regime de caixa.');
    }
  };

  const abrirModalLiquidar = (parc: ParcelaRecebimentoSimples) => {
    setSelectedParcela(parc);
    setFormLiquidacao({
      valorLiquidacao: parc.saldoRemanescenteDiferidoBRL > 0 ? parc.saldoRemanescenteDiferidoBRL : parc.valorOriginalTituloBRL,
      dataLiquidacao: new Date().toISOString().split('T')[0],
      forma: 'PIX',
      contaBancaria: parc.contaBancariaDestino || 'Banco do Brasil - C/C 19280-4'
    });
    setModalLiquidar(true);
  };

  const handleConfirmarLiquidacao = () => {
    if (!selectedParcela) return;
    const res = dbService.liquidarParcelaSimplesCaixa(
      selectedParcela.id,
      Number(formLiquidacao.valorLiquidacao),
      formLiquidacao.dataLiquidacao,
      formLiquidacao.forma,
      formLiquidacao.contaBancaria
    );
    if (res.sucesso) {
      setMensagemSucesso(res.mensagem);
      setModalLiquidar(false);
      carregarDados();
    } else {
      setMensagemErro(res.mensagem);
    }
  };

  const handleIntegrarContabil = (id: string) => {
    const res = dbService.integrarSimplesCaixaContabil(id);
    if (res.sucesso) {
      setMensagemSucesso(res.mensagem);
      carregarDados();
    } else {
      setMensagemErro(res.mensagem);
    }
  };

  // Filtragem
  const parcelasFiltradas = (resumo?.parcelas || []).filter(p => {
    const matchStatus = filtroStatus === 'TODOS' || p.status === filtroStatus;
    const matchAnexo = filtroAnexo === 'TODOS' || p.anexoSimples === filtroAnexo;
    const matchBusca = termoBusca === '' ||
      p.numeroDocumentoOrigem.toLowerCase().includes(termoBusca.toLowerCase()) ||
      p.clienteRazaoSocial.toLowerCase().includes(termoBusca.toLowerCase()) ||
      p.clienteCnpjCpf.toLowerCase().includes(termoBusca.toLowerCase());
    return matchStatus && matchAnexo && matchBusca;
  });

  const apuracaoAtual = resumo?.apuracoesMensais[0] || null;

  return (
    <div className="flex flex-col h-full bg-[#121212] text-gray-200 overflow-y-auto">
      {/* Top Banner / Header */}
      <div className="border-b border-gray-800 bg-[#181818] px-6 py-4 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-900/30">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-wide">
                Simples Nacional - Regime de Caixa
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Res. CGSN 140/2018 Arts. 16 a 20
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Tributação exclusiva sobre duplicatas e receitas efetivamente liquidadas • Diferimento tributário legal e conciliação bancária
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => carregarDados()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#242424] hover:bg-[#2e2e2e] text-gray-300 text-xs font-medium border border-gray-700 transition"
            title="Recarregar dados"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Atualizar
          </button>
          <button
            onClick={() => setActiveTab('relatorio_a4')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#242424] hover:bg-[#2e2e2e] text-gray-300 text-xs font-medium border border-gray-700 transition"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            Demonstrativo A4
          </button>
          <button
            onClick={() => setModalNovaParcela(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-900/40 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Nova Parcela / Título
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
          onClick={() => setActiveTab('visao_geral')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition ${
            activeTab === 'visao_geral'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Visão Geral & Conciliação Caixa vs Competência
        </button>
        <button
          onClick={() => setActiveTab('parcelas_duplicatas')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition ${
            activeTab === 'parcelas_duplicatas'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Gestão de Títulos & Liquidações Financeiras ({resumo?.parcelas.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('comparativo_pgdas')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition ${
            activeTab === 'comparativo_pgdas'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          PGDAS-D Caixa vs Competência & Guia DAS
        </button>
        <button
          onClick={() => setActiveTab('relatorio_a4')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition ${
            activeTab === 'relatorio_a4'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Printer className="w-4 h-4" />
          Demonstrativo Oficial A4 (CGSN 140)
        </button>
      </div>

      {/* Main Content Area */}
      <div className="p-6 flex-1">
        {/* TAB 1: VISÃO GERAL */}
        {activeTab === 'visao_geral' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#1b1b1b] border border-gray-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Faturado Competência</span>
                  <Calendar className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white tracking-tight">
                  R$ {(apuracaoAtual?.totalFaturadoCompetenciaBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-[11px] text-gray-400">
                  <span className="text-blue-400 font-medium">Notas emitidas</span> no período fiscal
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#1b1b1b] border border-gray-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Liquidado no Caixa</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-emerald-400 tracking-tight">
                  R$ {(resumo?.totalValorRecebidoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-[11px] text-gray-400">
                  <span className="text-emerald-400 font-medium">{resumo?.totalParcelasRecebidas || 0} títulos</span> liquidados no mês
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#1b1b1b] border border-gray-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Saldo Diferido a Receber</span>
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-amber-400 tracking-tight">
                  R$ {(resumo?.totalSaldoDiferidoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-[11px] text-amber-300/80">
                  <span>Tributação postergada p/ liquidação</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#1b1b1b] border border-gray-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Diferimento Fiscal DAS</span>
                  <ArrowDownCircle className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-purple-300 tracking-tight">
                  R$ {(apuracaoAtual?.diferimentoTributarioBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-[11px] text-gray-400">
                  <span className="text-purple-400 font-medium">Economia temporária</span> de fluxo de caixa
                </div>
              </div>
            </div>

            {/* Quadro Comparativo & Normativo */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 p-5 rounded-xl bg-[#181818] border border-gray-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Balanço Comparativo Mensal: Regime de Caixa vs Regime de Competência
                  </h3>
                  <span className="text-xs text-gray-400">Competência {resumo?.competencia}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-[#202020] border border-gray-700/60">
                    <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>Regime de Caixa (Adotado)</span>
                      <CheckCircle className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-xs text-gray-400 mb-3">Tributação apenas sobre o dinheiro que entrou na conta</div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between border-b border-gray-800 pb-1">
                        <span className="text-gray-400">Receita Tributada no Mês:</span>
                        <span className="font-semibold text-white">
                          R$ {(resumo?.totalValorRecebidoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-gray-800 pb-1">
                        <span className="text-gray-400">DAS Apurado no Caixa:</span>
                        <span className="font-bold text-emerald-400">
                          R$ {(apuracaoAtual?.valorDasCaixaBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="text-gray-400">Alíquota Efetiva Ponderada:</span>
                        <span className="font-medium text-gray-300">
                          {apuracaoAtual && apuracaoAtual.totalRecebidoCaixaBRL > 0
                            ? ((apuracaoAtual.valorDasCaixaBRL / apuracaoAtual.totalRecebidoCaixaBRL) * 100).toFixed(2)
                            : '5.18'}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-[#202020] border border-gray-700/60">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>Regime de Competência (Simulado)</span>
                      <Calendar className="w-3.5 h-3.5 text-gray-500" />
                    </div>
                    <div className="text-xs text-gray-400 mb-3">Tributação integral no momento da emissão da nota</div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between border-b border-gray-800 pb-1">
                        <span className="text-gray-400">Faturamento Bruto Emitido:</span>
                        <span className="font-semibold text-white">
                          R$ {(apuracaoAtual?.totalFaturadoCompetenciaBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-gray-800 pb-1">
                        <span className="text-gray-400">DAS Estimado na Competência:</span>
                        <span className="font-bold text-rose-400">
                          R$ {(apuracaoAtual?.valorDasCompetenciaEstimadoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="text-gray-400">Impacto Imediato de Caixa:</span>
                        <span className="font-semibold text-purple-300">
                          - R$ {(apuracaoAtual?.diferimentoTributarioBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} economizados hoje
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Barra de Progresso Diferimento */}
                <div className="pt-2">
                  <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                    <span>Taxa de Realização Financeira (Recebido vs Faturado):</span>
                    <span className="text-emerald-400 font-bold">
                      {apuracaoAtual && apuracaoAtual.totalFaturadoCompetenciaBRL > 0
                        ? ((apuracaoAtual.totalRecebidoCaixaBRL / apuracaoAtual.totalFaturadoCompetenciaBRL) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          apuracaoAtual && apuracaoAtual.totalFaturadoCompetenciaBRL > 0
                            ? (apuracaoAtual.totalRecebidoCaixaBRL / apuracaoAtual.totalFaturadoCompetenciaBRL) * 100
                            : 45
                        )}%`
                      }}
                    />
                    <div
                      className="bg-amber-500/80 h-full transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          apuracaoAtual && apuracaoAtual.totalFaturadoCompetenciaBRL > 0
                            ? (apuracaoAtual.saldoDiferidoAcumuladoBRL / apuracaoAtual.totalFaturadoCompetenciaBRL) * 100
                            : 55
                        )}%`
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                      Recebido & Tributado
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                      Diferido a Receber (Sem DAS no Mês)
                    </span>
                  </div>
                </div>
              </div>

              {/* Regras e Fundamentação */}
              <div className="p-5 rounded-xl bg-[#181818] border border-gray-800 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    Diretrizes Legais CGSN 140/2018
                  </h3>
                  <div className="space-y-2.5 text-xs text-gray-300">
                    <div className="p-2.5 rounded-lg bg-[#222222] border border-gray-700/50">
                      <div className="font-semibold text-emerald-400 mb-0.5">Art. 16 - Opção Irretratável</div>
                      <p className="text-[11px] text-gray-400">
                        A opção pelo Regime de Caixa é válida para todo o ano-calendário e aplica-se estritamente à base de apuração mensal do DAS.
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#222222] border border-gray-700/50">
                      <div className="font-semibold text-blue-400 mb-0.5">Art. 18 - Livro Caixa e Extratos</div>
                      <p className="text-[11px] text-gray-400">
                        Exige escrituração do Livro Caixa e identificação rigorosa da duplicata/documento vinculado a cada quitação bancária.
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#222222] border border-gray-700/50">
                      <div className="font-semibold text-amber-400 mb-0.5">Art. 19 - RBT12 no Regime de Caixa</div>
                      <p className="text-[11px] text-gray-400">
                        O enquadramento nos limites e sublimites bem como a determinação da alíquota nominal utilizam a receita acumulada auferida.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('parcelas_duplicatas')}
                  className="w-full py-2.5 px-3 rounded-lg bg-[#242424] hover:bg-[#2b2b2b] text-gray-200 text-xs font-semibold border border-gray-700 flex items-center justify-center gap-1.5 transition"
                >
                  Gerenciar Duplicatas no Caixa
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GESTÃO DE PARCELAS / DUPLICATAS */}
        {activeTab === 'parcelas_duplicatas' && (
          <div className="space-y-4">
            {/* Filter and Action Bar */}
            <div className="p-4 rounded-xl bg-[#181818] border border-gray-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
                <div className="relative flex-1 max-w-xs">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={termoBusca}
                    onChange={e => setTermoBusca(e.target.value)}
                    placeholder="Buscar nota, duplicata ou cliente..."
                    className="w-full pl-9 pr-3 py-1.5 bg-[#121212] border border-gray-700 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span>Status:</span>
                  <select
                    value={filtroStatus}
                    onChange={e => setFiltroStatus(e.target.value)}
                    className="bg-[#121212] border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="TODOS">Todos os Status</option>
                    <option value="RECEBIDO_TOTAL">Quitado Total</option>
                    <option value="RECEBIDO_PARCIAL">Quitado Parcial</option>
                    <option value="A_RECEBER">A Receber (Diferido)</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span>Anexo:</span>
                  <select
                    value={filtroAnexo}
                    onChange={e => setFiltroAnexo(e.target.value)}
                    className="bg-[#121212] border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="TODOS">Todos os Anexos</option>
                    <option value="ANEXO_I_COMERCIO">Anexo I - Comércio</option>
                    <option value="ANEXO_II_INDUSTRIA">Anexo II - Indústria</option>
                    <option value="ANEXO_III_SERVICOS">Anexo III - Serviços</option>
                    <option value="ANEXO_IV_SERVICOS">Anexo IV - Serviços CPP Fora</option>
                    <option value="ANEXO_V_FATOR_R">Anexo V - Serviços Fator R</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">
                  Exibindo <strong>{parcelasFiltradas.length}</strong> títulos
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-gray-800 bg-[#161616] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#202020] text-gray-400 border-b border-gray-800 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">Documento / Venc.</th>
                      <th className="py-3 px-4">Cliente / CNPJ</th>
                      <th className="py-3 px-4">Anexo Simples</th>
                      <th className="py-3 px-4 text-right">Valor Original</th>
                      <th className="py-3 px-4 text-right">Recebido no Mês</th>
                      <th className="py-3 px-4 text-right">Saldo Diferido</th>
                      <th className="py-3 px-4 text-center">Status Caixa</th>
                      <th className="py-3 px-4 text-right">DAS Apurado</th>
                      <th className="py-3 px-4 text-center">Contábil</th>
                      <th className="py-3 px-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {parcelasFiltradas.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-8 text-center text-gray-500">
                          Nenhuma parcela localizada com os filtros selecionados.
                        </td>
                      </tr>
                    ) : (
                      parcelasFiltradas.map(parc => (
                        <tr key={parc.id} className="hover:bg-[#1d1d1d] transition">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-white">{parc.numeroDocumentoOrigem}</div>
                            <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3" />
                              Venc: {parc.dataVencimento}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-200">{parc.clienteRazaoSocial}</div>
                            <div className="text-[11px] text-gray-500 font-mono">{parc.clienteCnpjCpf}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-800 text-gray-300 border border-gray-700">
                              {parc.anexoSimples.replace('ANEXO_', '').replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-gray-300">
                            R$ {parc.valorOriginalTituloBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-emerald-400">
                            R$ {parc.valorRecebidoNoMesBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            {parc.dataLiquidacaoEfetiva && (
                              <div className="text-[10px] text-gray-500 font-normal">
                                Liq: {parc.dataLiquidacaoEfetiva}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-amber-400">
                            R$ {parc.saldoRemanescenteDiferidoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {parc.status === 'RECEBIDO_TOTAL' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                Total Quitado
                              </span>
                            )}
                            {parc.status === 'RECEBIDO_PARCIAL' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                Quitado Parcial
                              </span>
                            )}
                            {parc.status === 'A_RECEBER' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                A Receber
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="font-bold text-white">
                              R$ {parc.valorSimplesApuradoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-[10px] text-gray-500">
                              Aliq: {parc.aliquotaEfetivaSimplesEstimada.toFixed(2)}%
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {parc.integradoContabil ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <FileCheck className="w-3 h-3" />
                                Integrado
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-800 text-gray-400">
                                Pendente
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {parc.status !== 'RECEBIDO_TOTAL' && (
                                <button
                                  onClick={() => abrirModalLiquidar(parc)}
                                  className="px-2 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-600/40 text-[11px] font-semibold transition flex items-center gap-1"
                                  title="Registrar recebimento financeiro no caixa"
                                >
                                  <DollarSign className="w-3 h-3" />
                                  Liquidar
                                </button>
                              )}
                              {!parc.integradoContabil && parc.valorRecebidoNoMesBRL > 0 && (
                                <button
                                  onClick={() => handleIntegrarContabil(parc.id)}
                                  className="px-2 py-1 rounded bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-600/40 text-[11px] font-semibold transition flex items-center gap-1"
                                  title="Gerar lançamento contábil no Diário Geral"
                                >
                                  <FileCheck className="w-3 h-3" />
                                  Integrar
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: COMPARATIVO PGDAS-D & GUIA DAS */}
        {activeTab === 'comparativo_pgdas' && apuracaoAtual && (
          <div className="space-y-6">
            <div className="p-5 rounded-xl bg-[#181818] border border-gray-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-400" />
                    Apuração Fiscal PGDAS-D no Regime de Caixa
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Declaração transmitida com base na receita líquida recebida • Código Recibo: <strong className="text-gray-200 font-mono">{apuracaoAtual.numeroReciboPgdas}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {apuracaoAtual.statusDeclaracao.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Detalhes de Alíquotas e Valores */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-[#202020] border border-gray-800 space-y-1">
                  <div className="text-xs text-gray-400 font-medium">Receita Bruta Total Acumulada (RBT12)</div>
                  <div className="text-xl font-bold text-white">
                    R$ {apuracaoAtual.receitaRbt12BRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[11px] text-gray-500">Faixa 2 do Simples Nacional</div>
                </div>

                <div className="p-4 rounded-lg bg-[#202020] border border-gray-800 space-y-1">
                  <div className="text-xs text-gray-400 font-medium">Valor Total do DAS no Caixa</div>
                  <div className="text-xl font-bold text-emerald-400">
                    R$ {apuracaoAtual.valorDasCaixaBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[11px] text-emerald-300">Apuração regular conforme LC 123/06</div>
                </div>

                <div className="p-4 rounded-lg bg-[#202020] border border-gray-800 space-y-1">
                  <div className="text-xs text-gray-400 font-medium">Diferimento Tributário Garantido</div>
                  <div className="text-xl font-bold text-purple-300">
                    R$ {apuracaoAtual.diferimentoTributarioBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[11px] text-purple-300/80">Postergação para recebimento futuro</div>
                </div>
              </div>

              {/* Guia DAS com Código de Barras */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#202020] to-[#1a1a1a] border border-emerald-700/40 mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">Documento de Arrecadação do Simples Nacional (DAS)</span>
                  </div>
                  <span className="text-xs text-gray-400">Vencimento: 20/04/2026</span>
                </div>

                <div className="p-3 rounded-lg bg-[#121212] border border-gray-700 flex flex-col md:flex-row items-center justify-between gap-3">
                  <div className="font-mono text-xs text-emerald-400 tracking-wider">
                    {apuracaoAtual.codigoBarrasDasFebraban || '858700000032 400000851001 926042000000 000000000000'}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(apuracaoAtual.codigoBarrasDasFebraban || '');
                      setMensagemSucesso('Linha digitável do DAS copiada para a área de transferência.');
                    }}
                    className="px-3 py-1 rounded bg-[#252525] hover:bg-[#303030] text-gray-200 text-xs font-semibold border border-gray-600 transition"
                  >
                    Copiar Linha Digitável
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DEMONSTRATIVO OFICIAL A4 */}
        {activeTab === 'relatorio_a4' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition"
              >
                <Printer className="w-4 h-4" />
                Imprimir Relatório Oficial A4
              </button>
            </div>

            {/* Document Sheet A4 */}
            <div className="max-w-4xl mx-auto bg-white text-gray-900 p-8 rounded-xl shadow-2xl border border-gray-300 font-sans text-xs print:p-0 print:border-none print:shadow-none">
              {/* Header Oficial */}
              <div className="border-b-2 border-gray-900 pb-4 mb-4 flex justify-between items-start">
                <div>
                  <h2 className="text-base font-extrabold uppercase tracking-tight text-gray-900">
                    Demonstrativo Fiscal de Receitas e Conciliação - Simples Nacional
                  </h2>
                  <div className="text-xs font-bold text-gray-700">
                    OPÇÃO PELO REGIME DE CAIXA (RESOLUÇÃO CGSN Nº 140/2018 ARTS. 16 A 20)
                  </div>
                  <div className="text-[11px] text-gray-600 mt-1">
                    Empresa: <strong>EMPRESA PADRAO LTDA</strong> • CNPJ: <strong>01.234.567/0001-89</strong>
                  </div>
                </div>
                <div className="text-right text-[11px] text-gray-600">
                  <div>Competência: <strong>{resumo?.competencia}</strong></div>
                  <div>Emissão: <strong>{new Date().toLocaleDateString('pt-BR')}</strong></div>
                  <div>Regime: <strong>Caixa (Art. 18 § 3º LC 123/06)</strong></div>
                </div>
              </div>

              {/* Quadro Resumo */}
              <div className="grid grid-cols-4 gap-2 mb-4 p-3 bg-gray-50 border border-gray-300 rounded text-center">
                <div>
                  <div className="text-[10px] text-gray-500 font-semibold uppercase">Total Faturado (Competência)</div>
                  <div className="text-sm font-bold text-gray-900">
                    R$ {(apuracaoAtual?.totalFaturadoCompetenciaBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-emerald-700 font-semibold uppercase">Total Liquidado (Caixa)</div>
                  <div className="text-sm font-bold text-emerald-800">
                    R$ {(resumo?.totalValorRecebidoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-amber-700 font-semibold uppercase">Saldo Diferido a Receber</div>
                  <div className="text-sm font-bold text-amber-800">
                    R$ {(resumo?.totalSaldoDiferidoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-700 font-semibold uppercase">DAS Apurado a Recolher</div>
                  <div className="text-sm font-bold text-gray-900">
                    R$ {(apuracaoAtual?.valorDasCaixaBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Tabela de Duplicatas */}
              <div className="mb-6">
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2 border-b border-gray-300 pb-1">
                  1. Relação de Duplicatas, Liquidações Financeiras e Diferimentos
                </h4>
                <table className="w-full text-left border border-gray-300 text-[11px]">
                  <thead className="bg-gray-100 font-bold border-b border-gray-300">
                    <tr>
                      <th className="p-1.5 border-r border-gray-300">Doc / NF-e</th>
                      <th className="p-1.5 border-r border-gray-300">Cliente / Tomador</th>
                      <th className="p-1.5 border-r border-gray-300 text-center">Anexo</th>
                      <th className="p-1.5 border-r border-gray-300 text-right">Vlr. Título</th>
                      <th className="p-1.5 border-r border-gray-300 text-right">Vlr. Liquidado</th>
                      <th className="p-1.5 border-r border-gray-300 text-right">Saldo Diferido</th>
                      <th className="p-1.5 border-r border-gray-300 text-center">Forma / Data</th>
                      <th className="p-1.5 text-right">DAS (Caixa)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(resumo?.parcelas || []).map((p, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="p-1.5 border-r border-gray-300 font-semibold">{p.numeroDocumentoOrigem}</td>
                        <td className="p-1.5 border-r border-gray-300">{p.clienteRazaoSocial}</td>
                        <td className="p-1.5 border-r border-gray-300 text-center">{p.anexoSimples.replace('ANEXO_', '')}</td>
                        <td className="p-1.5 border-r border-gray-300 text-right">
                          R$ {p.valorOriginalTituloBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-1.5 border-r border-gray-300 text-right font-bold text-emerald-800">
                          R$ {p.valorRecebidoNoMesBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-1.5 border-r border-gray-300 text-right text-amber-800">
                          R$ {p.saldoRemanescenteDiferidoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-1.5 border-r border-gray-300 text-center text-[10px]">
                          {p.dataLiquidacaoEfetiva ? `${p.formaLiquidacao} (${p.dataLiquidacaoEfetiva})` : 'Pendente'}
                        </td>
                        <td className="p-1.5 text-right font-semibold">
                          R$ {p.valorSimplesApuradoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Termo e Assinatura */}
              <div className="mt-8 pt-4 border-t border-gray-300 flex justify-between items-end text-[11px] text-gray-700">
                <div className="space-y-1">
                  <div>Recibo PGDAS-D: <strong>{apuracaoAtual?.numeroReciboPgdas}</strong></div>
                  <div>Certificado de Regularidade Fiscal CGSN Res. 140/2018</div>
                  <div className="text-[10px] text-gray-500">Documento gerado eletronicamente pelo ERP Contábil Studio Pro</div>
                </div>

                <div className="text-center w-64 border-t border-gray-800 pt-1">
                  <div className="font-bold text-gray-900">Contador Responsável CRC/SP</div>
                  <div className="text-[10px] text-gray-500">CRC 1SP999999/O-0 • Validação Digital</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: NOVA PARCELA */}
      {modalNovaParcela && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#181818] border border-gray-800 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                Registrar Novo Título / Parcela no Regime de Caixa
              </h3>
              <button onClick={() => setModalNovaParcela(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSalvarNovaParcela} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Doc. Origem (NF-e / Recibo) *</label>
                  <input
                    type="text"
                    required
                    value={formParcela.numeroDocumentoOrigem}
                    onChange={e => setFormParcela({ ...formParcela, numeroDocumentoOrigem: e.target.value })}
                    placeholder="Ex: NF-e 001.080/1"
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Série</label>
                  <input
                    type="text"
                    value={formParcela.serie}
                    onChange={e => setFormParcela({ ...formParcela, serie: e.target.value })}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Razão Social do Cliente / Tomador *</label>
                <input
                  type="text"
                  required
                  value={formParcela.clienteRazaoSocial}
                  onChange={e => setFormParcela({ ...formParcela, clienteRazaoSocial: e.target.value })}
                  placeholder="Nome do cliente"
                  className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">CNPJ / CPF</label>
                  <input
                    type="text"
                    value={formParcela.clienteCnpjCpf}
                    onChange={e => setFormParcela({ ...formParcela, clienteCnpjCpf: e.target.value })}
                    placeholder="00.000.000/0001-00"
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Anexo Simples Nacional</label>
                  <select
                    value={formParcela.anexoSimples}
                    onChange={e => setFormParcela({ ...formParcela, anexoSimples: e.target.value as AnexoSimplesNacionalCaixa })}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ANEXO_I_COMERCIO">Anexo I - Comércio</option>
                    <option value="ANEXO_II_INDUSTRIA">Anexo II - Indústria</option>
                    <option value="ANEXO_III_SERVICOS">Anexo III - Serviços em Geral</option>
                    <option value="ANEXO_IV_SERVICOS">Anexo IV - Serviços (CPP fora)</option>
                    <option value="ANEXO_V_FATOR_R">Anexo V - Fator R</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Valor Original (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formParcela.valorOriginalTituloBRL}
                    onChange={e => setFormParcela({ ...formParcela, valorOriginalTituloBRL: Number(e.target.value) })}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Recebido no Mês (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formParcela.valorRecebidoNoMesBRL}
                    onChange={e => setFormParcela({ ...formParcela, valorRecebidoNoMesBRL: Number(e.target.value) })}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Alíq. Estimada (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formParcela.aliquotaEfetivaSimplesEstimada}
                    onChange={e => setFormParcela({ ...formParcela, aliquotaEfetivaSimplesEstimada: Number(e.target.value) })}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Data Emissão (Competência)</label>
                  <input
                    type="date"
                    value={formParcela.dataEmissaoCompetencia}
                    onChange={e => setFormParcela({ ...formParcela, dataEmissaoCompetencia: e.target.value })}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Data Vencimento</label>
                  <input
                    type="date"
                    value={formParcela.dataVencimento}
                    onChange={e => setFormParcela({ ...formParcela, dataVencimento: e.target.value })}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalNovaParcela(false)}
                  className="px-3 py-1.5 rounded-lg bg-[#242424] hover:bg-[#2b2b2b] text-gray-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-900/30"
                >
                  Salvar Título
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LIQUIDAÇÃO */}
      {modalLiquidar && selectedParcela && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#181818] border border-gray-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Liquidar Título no Regime de Caixa
              </h3>
              <button onClick={() => setModalLiquidar(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-lg bg-[#222222] border border-gray-700 space-y-1 text-xs">
              <div className="text-gray-400">Documento: <strong className="text-white">{selectedParcela.numeroDocumentoOrigem}</strong></div>
              <div className="text-gray-400">Cliente: <strong className="text-gray-200">{selectedParcela.clienteRazaoSocial}</strong></div>
              <div className="text-gray-400">Valor Original: <strong className="text-gray-200">R$ {selectedParcela.valorOriginalTituloBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Valor Efetivamente Recebido (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formLiquidacao.valorLiquidacao}
                  onChange={e => setFormLiquidacao({ ...formLiquidacao, valorLiquidacao: Number(e.target.value) })}
                  className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Data da Entrada no Caixa</label>
                  <input
                    type="date"
                    value={formLiquidacao.dataLiquidacao}
                    onChange={e => setFormLiquidacao({ ...formLiquidacao, dataLiquidacao: e.target.value })}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Meio de Liquidação</label>
                  <select
                    value={formLiquidacao.forma}
                    onChange={e => setFormLiquidacao({ ...formLiquidacao, forma: e.target.value as FormaLiquidacaoCaixa })}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="PIX">PIX</option>
                    <option value="BOLETO_BANCARIO">Boleto Bancário</option>
                    <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                    <option value="CARTAO_DEBITO">Cartão de Débito</option>
                    <option value="TRANSFERENCIA_TED">Transferência TED</option>
                    <option value="DINHEIRO">Dinheiro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Conta Bancária de Destino</label>
                <input
                  type="text"
                  value={formLiquidacao.contaBancaria}
                  onChange={e => setFormLiquidacao({ ...formLiquidacao, contaBancaria: e.target.value })}
                  className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-gray-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalLiquidar(false)}
                className="px-3 py-1.5 rounded-lg bg-[#242424] hover:bg-[#2b2b2b] text-gray-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarLiquidacao}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-900/30"
              >
                Confirmar Recebimento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
