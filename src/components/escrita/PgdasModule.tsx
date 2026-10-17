import React, { useState, useEffect, useMemo } from 'react';
import {
  Calculator,
  Receipt,
  Printer,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Percent,
  Layers,
  Calendar,
  Building2,
  Copy,
  Zap,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  HelpCircle,
  Barcode,
  QrCode
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import { Empresa, ApuracaoPgdas, SegregacaoReceitaPgdas, AnexoSimplesNacional } from '../../types/contabil';
import { ReportPrintPreviewModal } from '../layout/ReportPrintPreviewModal';

export const PgdasModule: React.FC = () => {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [competencia, setCompetencia] = useState<string>('2026-04');
  const [apuracao, setApuracao] = useState<ApuracaoPgdas | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'apuracao' | 'segregacoes' | 'faturamento12m' | 'das' | 'tabelas'>('apuracao');

  // Modais e Opções de Contabilização (Configurando_a_Escrita_para_fazer_os_lan_amentos_na_Contabilidade.htm)
  const [showDasModal, setShowDasModal] = useState(false);
  const [showMemoriaModal, setShowMemoriaModal] = useState(false);
  const [showDeclaracao12MModal, setShowDeclaracao12MModal] = useState(false);
  const [showDemeiModal, setShowDemeiModal] = useState(false);
  const [copiadoPix, setCopiadoPix] = useState(false);
  const [copiadoCodigo, setCopiadoCodigo] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);
  const [modoContabilizacao, setModoContabilizacao] = useState<'APENAS_MOSTRA' | 'NAO_GERA' | 'MOSTRA_E_GRAVA'>('MOSTRA_E_GRAVA');
  const [incluirQuitacaoGuia, setIncluirQuitacaoGuia] = useState<boolean>(true);
  const [partidasPreview, setPartidasPreview] = useState<Array<{
    tipoOrigem: string;
    data: string;
    contaDebitoCodigo: number;
    contaDebitoNome: string;
    contaCreditoCodigo: number;
    contaCreditoNome: string;
    valor: number;
    historico: string;
  }>>([]);

  const carregarDados = () => {
    const emp = dbService.getActiveEmpresa();
    if (emp) {
      setEmpresa(emp);
      const ap = dbService.getApuracaoPgdas(emp.id, competencia);
      setApuracao(ap);
    }
  };

  useEffect(() => {
    carregarDados();
    setPartidasPreview([]);
  }, [competencia]);

  const handleIntegrarContabil = (modoForcado?: 'APENAS_MOSTRA' | 'NAO_GERA' | 'MOSTRA_E_GRAVA') => {
    if (!apuracao) return;
    const modo = modoForcado || modoContabilizacao;
    const res = dbService.integrarPgdasContabil(apuracao.id, modo, incluirQuitacaoGuia);
    setPartidasPreview(res.partidasGeradas || []);
    if (res.sucesso) {
      setFeedbackMsg({
        tipo: 'success',
        texto: res.loteId > 0 ? `${res.mensagem} (Lote Contábil nº ${res.loteId})` : res.mensagem
      });
      carregarDados();
    } else {
      setFeedbackMsg({ tipo: 'error', texto: res.mensagem });
    }
  };

  const handleCopiarPix = () => {
    if (!apuracao) return;
    navigator.clipboard.writeText(apuracao.qrCodePixDas);
    setCopiadoPix(true);
    setTimeout(() => setCopiadoPix(false), 2500);
  };

  const handleCopiarCodigoBarras = () => {
    if (!apuracao) return;
    navigator.clipboard.writeText(apuracao.codigoBarrasDas.replace(/\D/g, ''));
    setCopiadoCodigo(true);
    setTimeout(() => setCopiadoCodigo(false), 2500);
  };

  const tabelas = useMemo(() => dbService.getTabelasSimplesNacional(), []);
  const faturamentoDemei = useMemo(() => {
    if (!empresa) return null;
    return dbService.getFaturamentoUltimoAnoEDemei(empresa.id, competencia);
  }, [empresa, competencia, apuracao]);

  return (
    <div className="h-full flex flex-col bg-[#141414] text-neutral-200 overflow-hidden font-sans">
      {/* Top Header */}
      <div className="h-14 border-b border-white/10 bg-[#181818] px-6 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 text-amber-400">
            <Calculator size={18} />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
              PGDAS-D 2026 & Simples Nacional (MEI / ME / EPP)
              <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                LC 123/2006 & CGSN 140/2018
              </span>
            </h1>
            <p className="text-xs text-neutral-400">
              Segregação por Anexos I a V, Cálculo da Alíquota Efetiva, Fator R, Guia DAS e Contabilização Automática
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
            onClick={() => setShowDasModal(true)}
            className="flex items-center space-x-1.5 bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition shadow-sm"
          >
            <Printer size={14} />
            <span>Imprimir Guia DAS A4</span>
          </button>

          <button
            onClick={() => setShowMemoriaModal(true)}
            className="flex items-center space-x-1.5 bg-[#1c1c1c] hover:bg-neutral-800 border border-white/10 text-neutral-200 px-3 py-1.5 rounded-lg text-xs font-medium transition"
          >
            <Receipt size={14} />
            <span>Memória de Cálculo A4</span>
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
          onClick={() => setActiveSubTab('apuracao')}
          className={`h-full flex items-center space-x-2 text-xs font-medium border-b-2 transition ${
            activeSubTab === 'apuracao' ? 'border-amber-500 text-amber-400' : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <TrendingUp size={13} />
          <span>Apuração & Indicadores Fiscais</span>
        </button>

        <button
          onClick={() => setActiveSubTab('segregacoes')}
          className={`h-full flex items-center space-x-2 text-xs font-medium border-b-2 transition ${
            activeSubTab === 'segregacoes' ? 'border-amber-500 text-amber-400' : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Layers size={13} />
          <span>Segregação de Receitas por Anexo</span>
        </button>

        <button
          onClick={() => setActiveSubTab('faturamento12m')}
          className={`h-full flex items-center space-x-2 text-xs font-medium border-b-2 transition ${
            activeSubTab === 'faturamento12m' ? 'border-amber-500 text-amber-400' : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <FileCheck2 size={13} />
          <span>Faturamento Último Ano & DEMEI (447)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('das')}
          className={`h-full flex items-center space-x-2 text-xs font-medium border-b-2 transition ${
            activeSubTab === 'das' ? 'border-amber-500 text-amber-400' : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Barcode size={13} />
          <span>Guia DAS & Quitação Bancária</span>
        </button>

        <button
          onClick={() => setActiveSubTab('tabelas')}
          className={`h-full flex items-center space-x-2 text-xs font-medium border-b-2 transition ${
            activeSubTab === 'tabelas' ? 'border-amber-500 text-amber-400' : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Percent size={13} />
          <span>Tabelas Oficiais Anexos I a V</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {apuracao && activeSubTab === 'apuracao' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-5 gap-4">
              <div className="p-4 bg-[#181818] border border-white/10 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-neutral-400 text-xs">
                  <span>Receita Mês</span>
                  <DollarSign size={14} className="text-amber-400" />
                </div>
                <div className="text-lg font-bold font-mono text-neutral-100">
                  R$ {apuracao.faturamentoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-[10px] text-neutral-500">Base da competência {competencia}</p>
              </div>

              <div className="p-4 bg-[#181818] border border-white/10 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-neutral-400 text-xs">
                  <span>RBT12 Acumulada</span>
                  <TrendingUp size={14} className="text-blue-400" />
                </div>
                <div className="text-lg font-bold font-mono text-neutral-100">
                  R$ {apuracao.rbt12.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-[10px] text-neutral-500">Últimos 12 meses anteriores</p>
              </div>

              <div className="p-4 bg-[#181818] border border-white/10 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-neutral-400 text-xs">
                  <span>Fator R (Folha/RBT12)</span>
                  <Percent size={14} className="text-indigo-400" />
                </div>
                <div className="text-lg font-bold font-mono flex items-center gap-2">
                  <span className={apuracao.enquadraFatorR ? 'text-emerald-400' : 'text-amber-400'}>
                    {(apuracao.fatorR * 100).toFixed(2)}%
                  </span>
                  <span className={`text-[10px] font-sans px-1.5 py-0.5 rounded border ${
                    apuracao.enquadraFatorR 
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40' 
                      : 'bg-amber-950/60 text-amber-300 border-amber-800/40'
                  }`}>
                    {apuracao.enquadraFatorR ? 'Anexo III (≥ 28%)' : 'Anexo V (< 28%)'}
                  </span>
                </div>
                <p className="text-[10px] text-neutral-500">Folha 12m: R$ {apuracao.folhaSalarios12Meses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>

              <div className="p-4 bg-[#181818] border border-white/10 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-neutral-400 text-xs">
                  <span>Total DAS a Recolher</span>
                  <Calculator size={14} className="text-emerald-400" />
                </div>
                <div className="text-lg font-bold font-mono text-emerald-400">
                  R$ {apuracao.totalDevidoDas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-[10px] text-neutral-500">Vencimento: {apuracao.dataVencimento.split('-').reverse().join('/')}</p>
              </div>

              <div className="p-4 bg-[#181818] border border-white/10 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-neutral-400 text-xs">
                  <span>Status Contábil</span>
                  <FileCheck2 size={14} className={apuracao.statusIntegracaoContabil ? 'text-emerald-400' : 'text-neutral-500'} />
                </div>
                <div className="text-sm font-semibold flex items-center gap-1.5 pt-1">
                  {apuracao.statusIntegracaoContabil ? (
                    <span className="text-emerald-400 flex items-center gap-1 text-xs">
                      <CheckCircle2 size={13} /> Integrado (Lote {apuracao.loteContabilId})
                    </span>
                  ) : (
                    <button
                      onClick={() => handleIntegrarContabil()}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-medium transition"
                    >
                      Executar Contabilização
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-neutral-500">D: 611 (Simples) / C: 311 (DAS a Recolher)</p>
              </div>
            </div>

            {/* Assistente de Contabilização na Apuração (3 Opções de Configurando_a_Escrita_para_fazer_os_lan_amentos_na_Contabilidade.htm) */}
            <div className="bg-[#181818] border border-blue-500/20 rounded-xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
                    <Zap size={16} className="text-blue-400" />
                    <span>Opções de Contabilização da Apuração (Integração Escrita Fiscal → Contabilidade)</span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Escolha se deseja apenas conferir as partidas na tela antes de gravar ou enviar diretamente para o Livro Diário e Livro Caixa
                  </p>
                </div>

                <label className="flex items-center space-x-2 bg-neutral-900 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs text-emerald-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={incluirQuitacaoGuia}
                    onChange={(e) => setIncluirQuitacaoGuia(e.target.checked)}
                    className="rounded border-neutral-700 bg-neutral-950 text-emerald-500"
                  />
                  <span>Gerar também Baixa de Pagamento da Guia DAS no Banco (`Pagto Guia EF`)</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setModoContabilizacao('APENAS_MOSTRA');
                    handleIntegrarContabil('APENAS_MOSTRA');
                  }}
                  className={`p-3 rounded-xl border text-left transition ${
                    modoContabilizacao === 'APENAS_MOSTRA'
                      ? 'bg-blue-950/30 border-blue-500/50 text-blue-200'
                      : 'bg-[#1c1c1c] border-white/10 text-neutral-300 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-blue-400">1. Apenas mostra lançamentos contábeis</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">Conferência</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Não grava no Diário. Exibe na tela os lançamentos de provisão (e pagamento) para conferência do contador iniciante.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setModoContabilizacao('NAO_GERA');
                    handleIntegrarContabil('NAO_GERA');
                  }}
                  className={`p-3 rounded-xl border text-left transition ${
                    modoContabilizacao === 'NAO_GERA'
                      ? 'bg-neutral-800 border-neutral-500 text-neutral-200'
                      : 'bg-[#1c1c1c] border-white/10 text-neutral-300 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-neutral-300">2. Não gera lançamentos contábeis</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-700 text-neutral-300">Somente Fiscal</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Apenas apura o imposto e emite a Guia DAS sem gerar nem exibir partidas contábeis.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setModoContabilizacao('MOSTRA_E_GRAVA');
                    handleIntegrarContabil('MOSTRA_E_GRAVA');
                  }}
                  className={`p-3 rounded-xl border text-left transition ${
                    modoContabilizacao === 'MOSTRA_E_GRAVA'
                      ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
                      : 'bg-[#1c1c1c] border-white/10 text-neutral-300 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-emerald-400">3. Mostra e grava lançamentos contábeis</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Gravar no Diário</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Exibe as partidas na tela e grava automaticamente no Livro Diário e no Livro Caixa Contábil.
                  </p>
                </button>
              </div>

              {partidasPreview.length > 0 && (
                <div className="border border-white/10 rounded-lg overflow-hidden bg-[#141414]">
                  <div className="px-3 py-2 bg-neutral-900 border-b border-white/10 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-neutral-300">
                      ESPELHO DAS PARTIDAS CONTÁBEIS DA APURAÇÃO ({modoContabilizacao === 'APENAS_MOSTRA' ? 'SIMULAÇÃO / CONFERÊNCIA' : 'GRAVADAS NO DIÁRIO'})
                    </span>
                    <span className="font-mono text-emerald-400">
                      Total: R$ {partidasPreview.reduce((s, p) => s + p.valor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#1c1c1c] text-neutral-400 font-mono text-[10px]">
                      <tr>
                        <th className="py-2 px-3">Data</th>
                        <th className="py-2 px-3">Origem</th>
                        <th className="py-2 px-3">Conta Débito</th>
                        <th className="py-2 px-3">Conta Crédito</th>
                        <th className="py-2 px-3">Histórico Contábil</th>
                        <th className="py-2 px-3 text-right">Valor (R$)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                      {partidasPreview.map((p, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02]">
                          <td className="py-2 px-3 text-neutral-300">{p.data.split('-').reverse().join('/')}</td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[10px]">
                              {p.tipoOrigem}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-blue-400 font-sans">
                            <span className="font-mono text-[10px] text-neutral-400 mr-1">{p.contaDebitoCodigo}</span>
                            {p.contaDebitoNome}
                          </td>
                          <td className="py-2 px-3 text-indigo-400 font-sans">
                            <span className="font-mono text-[10px] text-neutral-400 mr-1">{p.contaCreditoCodigo}</span>
                            {p.contaCreditoNome}
                          </td>
                          <td className="py-2 px-3 font-sans text-neutral-300">{p.historico}</td>
                          <td className="py-2 px-3 text-right font-bold text-emerald-400">
                            R$ {p.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Resumo da Apuração do Período */}
            <div className="bg-[#181818] border border-white/10 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
                <Receipt size={16} className="text-amber-400" />
                Quadro Resumo da Apuração Mensal por Atividade
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#1c1c1c] text-neutral-400 uppercase text-[10px] font-mono border-y border-white/5">
                    <tr>
                      <th className="py-2.5 px-3">Anexo</th>
                      <th className="py-2.5 px-3">Descrição da Atividade</th>
                      <th className="py-2.5 px-3 text-right">Receita Bruta (R$)</th>
                      <th className="py-2.5 px-3 text-right">Subst. Tributária</th>
                      <th className="py-2.5 px-3 text-right">Base Tributável</th>
                      <th className="py-2.5 px-3 text-right">Alíq. Efetiva</th>
                      <th className="py-2.5 px-3 text-right">DAS Devido (R$)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {apuracao.segregacoes.map((seg) => (
                      <tr key={seg.id} className="hover:bg-white/[0.02]">
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-bold">
                            {seg.anexo.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-sans text-neutral-300">{seg.descricaoAtividade}</td>
                        <td className="py-2.5 px-3 text-right">R$ {seg.valorReceitaBruta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="py-2.5 px-3 text-right text-neutral-400">R$ {seg.valorSubstituicaoTributaria.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="py-2.5 px-3 text-right font-semibold text-neutral-100">R$ {seg.valorTributavel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="py-2.5 px-3 text-right text-amber-400">{(seg.aliquotaEfetiva * 100).toFixed(2)}%</td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-400">R$ {seg.valorDevido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-white/10 font-bold font-mono text-xs bg-[#1a1a1a]">
                      <td colSpan={2} className="py-3 px-3 uppercase text-neutral-300">TOTAIS CONSOLIDADOS DO SIMPLES NACIONAL:</td>
                      <td className="py-3 px-3 text-right text-neutral-100">
                        R$ {apuracao.segregacoes.reduce((acc, s) => acc + s.valorReceitaBruta, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right text-neutral-400">
                        R$ {apuracao.segregacoes.reduce((acc, s) => acc + s.valorSubstituicaoTributaria, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right text-neutral-100">
                        R$ {apuracao.segregacoes.reduce((acc, s) => acc + s.valorTributavel, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right text-neutral-400">-</td>
                      <td className="py-3 px-3 text-right text-emerald-400 text-sm">
                        R$ {apuracao.totalDevidoDas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Repartição Analítica dos Tributos na DAS */}
            <div className="bg-[#181818] border border-white/10 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
                <Percent size={16} className="text-indigo-400" />
                Repartição dos Tributos Federais, Estaduais e Municipais na Guia Única
              </h3>

              <div className="grid grid-cols-4 gap-4">
                {(() => {
                  const totaisTributos = apuracao.segregacoes.reduce(
                    (acc, seg) => {
                      acc.irpj += seg.detalhamentoTributos.irpj;
                      acc.csll += seg.detalhamentoTributos.csll;
                      acc.cofins += seg.detalhamentoTributos.cofins;
                      acc.pis += seg.detalhamentoTributos.pis;
                      acc.cpp += seg.detalhamentoTributos.cpp;
                      acc.icms += seg.detalhamentoTributos.icms;
                      acc.ipi += seg.detalhamentoTributos.ipi;
                      acc.iss += seg.detalhamentoTributos.iss;
                      return acc;
                    },
                    { irpj: 0, csll: 0, cofins: 0, pis: 0, cpp: 0, icms: 0, ipi: 0, iss: 0 }
                  );

                  return (
                    <>
                      <div className="p-3 bg-[#1c1c1c] border border-white/5 rounded-lg space-y-1">
                        <div className="text-[10px] text-neutral-400 uppercase font-mono">IRPJ (Federal)</div>
                        <div className="text-sm font-bold font-mono text-neutral-200">R$ {totaisTributos.irpj.toFixed(2)}</div>
                      </div>
                      <div className="p-3 bg-[#1c1c1c] border border-white/5 rounded-lg space-y-1">
                        <div className="text-[10px] text-neutral-400 uppercase font-mono">CSLL (Federal)</div>
                        <div className="text-sm font-bold font-mono text-neutral-200">R$ {totaisTributos.csll.toFixed(2)}</div>
                      </div>
                      <div className="p-3 bg-[#1c1c1c] border border-white/5 rounded-lg space-y-1">
                        <div className="text-[10px] text-neutral-400 uppercase font-mono">COFINS (Federal)</div>
                        <div className="text-sm font-bold font-mono text-neutral-200">R$ {totaisTributos.cofins.toFixed(2)}</div>
                      </div>
                      <div className="p-3 bg-[#1c1c1c] border border-white/5 rounded-lg space-y-1">
                        <div className="text-[10px] text-neutral-400 uppercase font-mono">PIS / PASEP (Federal)</div>
                        <div className="text-sm font-bold font-mono text-neutral-200">R$ {totaisTributos.pis.toFixed(2)}</div>
                      </div>
                      <div className="p-3 bg-[#1c1c1c] border border-white/5 rounded-lg space-y-1">
                        <div className="text-[10px] text-neutral-400 uppercase font-mono">CPP Patronal Previdenciária</div>
                        <div className="text-sm font-bold font-mono text-neutral-200">R$ {totaisTributos.cpp.toFixed(2)}</div>
                      </div>
                      <div className="p-3 bg-[#1c1c1c] border border-white/5 rounded-lg space-y-1">
                        <div className="text-[10px] text-neutral-400 uppercase font-mono">ICMS (Estadual)</div>
                        <div className="text-sm font-bold font-mono text-neutral-200">R$ {totaisTributos.icms.toFixed(2)}</div>
                      </div>
                      <div className="p-3 bg-[#1c1c1c] border border-white/5 rounded-lg space-y-1">
                        <div className="text-[10px] text-neutral-400 uppercase font-mono">ISS (Municipal)</div>
                        <div className="text-sm font-bold font-mono text-neutral-200">R$ {totaisTributos.iss.toFixed(2)}</div>
                      </div>
                      <div className="p-3 bg-emerald-950/40 border border-emerald-500/20 rounded-lg space-y-1">
                        <div className="text-[10px] text-emerald-400 uppercase font-mono">TOTAL GERAL DA GUIA</div>
                        <div className="text-sm font-bold font-mono text-emerald-300">R$ {apuracao.totalDevidoDas.toFixed(2)}</div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Segregações por Anexo */}
        {apuracao && activeSubTab === 'segregacoes' && (
          <div className="space-y-6">
            <div className="bg-[#181818] border border-white/10 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-100">Memória Pormenorizada de Segregação de Receitas</h3>
                  <p className="text-xs text-neutral-400">Detalhamento por atividade com separação de imunidades, isenções e ICMS ST</p>
                </div>
              </div>

              {apuracao.segregacoes.map((seg, idx) => (
                <div key={seg.id} className="p-4 bg-[#1c1c1c] border border-white/5 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold">
                        {seg.anexo}
                      </span>
                      <span className="text-xs font-semibold text-neutral-200">{seg.descricaoAtividade}</span>
                    </div>
                    <div className="text-xs font-mono text-emerald-400 font-bold">
                      DAS: R$ {seg.valorDevido.toFixed(2)}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3 text-xs font-mono">
                    <div>
                      <span className="text-neutral-500 block text-[10px]">Receita Bruta:</span>
                      <span className="text-neutral-200">R$ {seg.valorReceitaBruta.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[10px]">Substituição Tributária / Monofásico:</span>
                      <span className="text-neutral-200">R$ {seg.valorSubstituicaoTributaria.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[10px]">Alíquota Efetiva:</span>
                      <span className="text-amber-400 font-bold">{(seg.aliquotaEfetiva * 100).toFixed(4)}%</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[10px]">Fórmula PGDAS:</span>
                      <span className="text-neutral-400 text-[10px]">(RBT12 × AlíqNom - Ded) ÷ RBT12</span>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-2 flex flex-wrap gap-4 text-[11px] font-mono text-neutral-400">
                    {seg.detalhamentoTributos.irpj > 0 && <span>IRPJ: R$ {seg.detalhamentoTributos.irpj.toFixed(2)}</span>}
                    {seg.detalhamentoTributos.csll > 0 && <span>CSLL: R$ {seg.detalhamentoTributos.csll.toFixed(2)}</span>}
                    {seg.detalhamentoTributos.cofins > 0 && <span>COFINS: R$ {seg.detalhamentoTributos.cofins.toFixed(2)}</span>}
                    {seg.detalhamentoTributos.pis > 0 && <span>PIS: R$ {seg.detalhamentoTributos.pis.toFixed(2)}</span>}
                    {seg.detalhamentoTributos.cpp > 0 && <span>CPP: R$ {seg.detalhamentoTributos.cpp.toFixed(2)}</span>}
                    {seg.detalhamentoTributos.icms > 0 && <span>ICMS: R$ {seg.detalhamentoTributos.icms.toFixed(2)}</span>}
                    {seg.detalhamentoTributos.iss > 0 && <span>ISS: R$ {seg.detalhamentoTributos.iss.toFixed(2)}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Guia DAS & Quitação */}
        {apuracao && activeSubTab === 'das' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-[#181818] border border-white/10 rounded-xl p-6 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
                    <Receipt size={24} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-neutral-100">Documento de Arrecadação do Simples Nacional (DAS)</h2>
                    <p className="text-xs text-neutral-400 font-mono">Número: {apuracao.numeroDas}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-neutral-500 uppercase block font-mono">Vencimento</span>
                  <span className="text-sm font-bold text-amber-400 font-mono">
                    {apuracao.dataVencimento.split('-').reverse().join('/')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-neutral-500">Razão Social:</span>
                  <div className="font-semibold text-neutral-200">{empresa?.razaoSocial}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-neutral-500">CNPJ:</span>
                  <div className="font-mono text-neutral-200">{empresa?.cnpj}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-neutral-500">Período de Apuração:</span>
                  <div className="font-mono text-neutral-200">{competencia}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-neutral-500">Valor Total do Documento:</span>
                  <div className="text-lg font-bold font-mono text-emerald-400">
                    R$ {apuracao.totalDevidoDas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Linha Digitável e Código de Barras */}
              <div className="p-4 bg-[#141414] border border-white/10 rounded-xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400 font-medium">Linha Digitável / Código de Barras Febraban:</span>
                  <button
                    onClick={handleCopiarCodigoBarras}
                    className="flex items-center space-x-1 text-amber-400 hover:text-amber-300 text-xs transition"
                  >
                    <Copy size={12} />
                    <span>{copiadoCodigo ? 'Copiado!' : 'Copiar Linha'}</span>
                  </button>
                </div>
                <div className="font-mono text-xs text-neutral-300 bg-[#1c1c1c] p-2.5 rounded border border-white/5 break-all">
                  {apuracao.codigoBarrasDas}
                </div>
              </div>

              {/* PIX Copia e Cola & QR Code */}
              <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                <div className="space-y-1 pr-4">
                  <div className="flex items-center space-x-1.5 text-emerald-400 text-xs font-semibold">
                    <QrCode size={14} />
                    <span>Pagamento Instantâneo via PIX (Banco Central)</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Escaneie ou copie a chave PIX Oficial gerada para quitação direta em qualquer banco.
                  </p>
                </div>
                <button
                  onClick={handleCopiarPix}
                  className="flex-shrink-0 flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
                >
                  <Copy size={13} />
                  <span>{copiadoPix ? 'PIX Copiado!' : 'Copiar PIX'}</span>
                </button>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  onClick={() => setShowDasModal(true)}
                  className="flex items-center space-x-1.5 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg text-xs font-medium transition shadow-sm"
                >
                  <Printer size={14} />
                  <span>Visualizar Guia DAS para Impressão A4</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3.5: Faturamento do Último Ano (12 Meses) & Relatório 447 - DEMEI */}
        {activeSubTab === 'faturamento12m' && faturamentoDemei && (
          <div className="space-y-6">
            {/* Banner de Controle de Enquadramento (SIMPLESN_ULTRAPASSOU_PAR) */}
            <div className="bg-[#181818] border border-white/10 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-amber-400" />
                    Termômetro de Enquadramento Legal (`SIMPLESN_ULTRAPASSOU_PAR` — LC 123/2006)
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Monitoramento automático de limites para MEI / SIMEI (R$ 81.000,00), Microempresa ME (R$ 360.000,00) e EPP (R$ 4.800.000,00)
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowDeclaracao12MModal(true)}
                    className="flex items-center space-x-1.5 bg-amber-600 hover:bg-amber-500 text-white px-3.5 py-2 rounded-lg text-xs font-medium transition shadow-sm"
                  >
                    <Printer size={14} />
                    <span>Declaração de Faturamento 12M (Bancos/Crédito) A4</span>
                  </button>

                  <button
                    onClick={() => setShowDemeiModal(true)}
                    className="flex items-center space-x-1.5 bg-[#1c1c1c] hover:bg-neutral-800 border border-white/10 text-neutral-200 px-3.5 py-2 rounded-lg text-xs font-medium transition"
                  >
                    <FileCheck2 size={14} />
                    <span>Emitir Relatório 447 - DEMEI A4</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* Limite MEI */}
                <div className="p-4 bg-[#1c1c1c] border border-white/5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-200">Teto SIMEI / MEI Anual</span>
                    <span className={`font-mono font-bold ${
                      faturamentoDemei.enquadramento.ultrapassouMei ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {faturamentoDemei.enquadramento.percentualMei.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#141414] rounded-full overflow-hidden border border-white/5">
                    <div
                      className={`h-full transition-all ${
                        faturamentoDemei.enquadramento.ultrapassouMei ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, faturamentoDemei.enquadramento.percentualMei)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-neutral-400">
                    <span>RBT12: R$ {faturamentoDemei.totais12Meses.faturamentoTotalRbt12.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    <span>Limite: R$ 81.000,00</span>
                  </div>
                </div>

                {/* Limite ME */}
                <div className="p-4 bg-[#1c1c1c] border border-white/5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-200">Teto Microempresa (ME)</span>
                    <span className={`font-mono font-bold ${
                      faturamentoDemei.enquadramento.ultrapassouMe ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {faturamentoDemei.enquadramento.percentualMe.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#141414] rounded-full overflow-hidden border border-white/5">
                    <div
                      className={`h-full transition-all ${
                        faturamentoDemei.enquadramento.ultrapassouMe ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, faturamentoDemei.enquadramento.percentualMe)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-neutral-400">
                    <span>RBT12: R$ {faturamentoDemei.totais12Meses.faturamentoTotalRbt12.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    <span>Limite: R$ 360.000,00</span>
                  </div>
                </div>

                {/* Limite EPP */}
                <div className="p-4 bg-[#1c1c1c] border border-white/5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-200">Teto Pequeno Porte (EPP)</span>
                    <span className="font-mono font-bold text-blue-400">
                      {faturamentoDemei.enquadramento.percentualEpp.toFixed(2)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#141414] rounded-full overflow-hidden border border-white/5">
                    <div
                      className="h-full bg-blue-500 transition-all"
                      style={{ width: `${Math.min(100, faturamentoDemei.enquadramento.percentualEpp)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-neutral-400">
                    <span>Média/Mês: R$ {faturamentoDemei.totais12Meses.mediaMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    <span>Limite: R$ 4.800.000,00</span>
                  </div>
                </div>
              </div>

              <div className="px-3.5 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-between text-xs text-amber-300">
                <span className="font-mono text-[11px]">{faturamentoDemei.enquadramento.alertaSimplesnUltrapassouPar}</span>
                <span className="font-mono text-[11px] text-neutral-400">
                  Período Apurado: {faturamentoDemei.competenciaInicial} a {faturamentoDemei.competenciaFinal}
                </span>
              </div>
            </div>

            {/* Quadro 1: Relação de Faturamento dos Últimos 12 Meses (Faturamento__ltimo_Ano_Escrita_Fiscal.htm & Demonstrativo_Mensal_Escrita_Fiscal.htm) */}
            <div className="bg-[#181818] border border-white/10 rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-[#1a1a1a]">
                <div>
                  <h4 className="text-xs font-semibold text-neutral-100 uppercase tracking-wider">
                    Relação de Faturamento do Último Ano — 12 Meses (Entradas, Comércio, Serviços e Acumulado)
                  </h4>
                  <p className="text-[11px] text-neutral-400">
                    Demonstrativo Mensal e Acumulado conforme Escrita Fiscal (`Faturamento__ltimo_Ano_Escrita_Fiscal.htm`)
                  </p>
                </div>
                <span className="text-xs font-mono text-amber-400 font-semibold">
                  RBT12 Total: R$ {faturamentoDemei.totais12Meses.faturamentoTotalRbt12.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#141414] text-neutral-400 text-[10px] font-mono uppercase border-b border-white/10">
                    <tr>
                      <th className="py-2.5 px-4">Mês/Ano</th>
                      <th className="py-2.5 px-4 text-right">Entradas (R$)</th>
                      <th className="py-2.5 px-4 text-right">Saídas Comércio (R$)</th>
                      <th className="py-2.5 px-4 text-right">Prest. Serviços (R$)</th>
                      <th className="py-2.5 px-4 text-right">Faturamento Mês (R$)</th>
                      <th className="py-2.5 px-4 text-right">Acumulado 12M (R$)</th>
                      <th className="py-2.5 px-4 text-right">Indexador (UFIR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                    {faturamentoDemei.meses.map((m) => (
                      <tr key={m.competencia} className={`hover:bg-white/[0.02] ${m.competencia === competencia ? 'bg-amber-500/5' : ''}`}>
                        <td className="py-2 px-4 font-bold text-neutral-200 flex items-center gap-2">
                          <span>{m.labelMes}</span>
                          {m.competencia === competencia && (
                            <span className="text-[9px] font-sans bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded">Atual</span>
                          )}
                        </td>
                        <td className="py-2 px-4 text-right text-neutral-400">
                          {m.entradasMercadorias.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-4 text-right text-neutral-200">
                          {m.totalComercio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-4 text-right text-neutral-200">
                          {m.totalServicos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-4 text-right font-semibold text-amber-400">
                          {m.faturamentoBrutoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-4 text-right text-emerald-400 font-semibold">
                          {m.acumuladoAteMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-4 text-right text-neutral-400">
                          {m.valorUfirMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-[#141414] border-t border-white/10 font-mono text-xs font-bold">
                    <tr>
                      <td className="py-2.5 px-4 text-neutral-200 uppercase">Totais 12 Meses</td>
                      <td className="py-2.5 px-4 text-right text-neutral-300">
                        R$ {faturamentoDemei.totais12Meses.entradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-4 text-right text-neutral-100">
                        R$ {faturamentoDemei.totais12Meses.comercio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-4 text-right text-neutral-100">
                        R$ {faturamentoDemei.totais12Meses.servicos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-4 text-right text-amber-400">
                        R$ {faturamentoDemei.totais12Meses.faturamentoTotalRbt12.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-4 text-right text-emerald-400">
                        Média: R$ {faturamentoDemei.totais12Meses.mediaMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-4 text-right text-neutral-300">
                        {faturamentoDemei.totais12Meses.totalUfir.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} UFIR
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Quadro 2: Demonstrativo 447 - DEMEI (Relatório Mensal das Receitas Brutas para MEI - CGSN / LC 123 Art. 26) */}
            <div className="bg-[#181818] border border-white/10 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h4 className="text-xs font-semibold text-neutral-100 uppercase tracking-wider flex items-center gap-2">
                    <Receipt size={14} className="text-amber-400" />
                    Relatório `447 - DEMEI` — Demonstrativo Mensal das Receitas Brutas (Competência {competencia})
                  </h4>
                  <p className="text-[11px] text-neutral-400">
                    Segregação automática de Receitas Com e Sem Emissão de Documento Fiscal para cumprimento do Art. 26, § 1º da LC 123/2006 (MEI / SIMEI)
                  </p>
                </div>
                <button
                  onClick={() => setShowDemeiModal(true)}
                  className="flex items-center space-x-1.5 bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
                >
                  <Printer size={13} />
                  <span>Imprimir 447 - DEMEI A4</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Receita de Comércio (I a III) */}
                <div className="p-4 bg-[#1c1c1c] border border-white/5 rounded-xl space-y-2.5 text-xs">
                  <div className="font-semibold text-amber-400 uppercase text-[11px] border-b border-white/5 pb-1.5">
                    Receita Bruta Mensal – Revenda de Mercadorias (Comércio)
                  </div>
                  <div className="flex justify-between text-neutral-300">
                    <span>I – Revenda de mercadorias com dispensa de emissão de documento fiscal:</span>
                    <span className="font-mono">R$ {faturamentoDemei.demeiMesAtual.comercioSemDoc.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-neutral-300">
                    <span>II – Revenda de mercadorias com documento fiscal emitido:</span>
                    <span className="font-mono">R$ {faturamentoDemei.demeiMesAtual.comercioComDoc.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between font-bold text-neutral-100 border-t border-white/10 pt-1.5">
                    <span>III – Total das receitas com revenda de mercadorias (I + II):</span>
                    <span className="font-mono text-amber-400">R$ {faturamentoDemei.demeiMesAtual.totalComercio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {/* Receita de Serviços (VII a IX) */}
                <div className="p-4 bg-[#1c1c1c] border border-white/5 rounded-xl space-y-2.5 text-xs">
                  <div className="font-semibold text-blue-400 uppercase text-[11px] border-b border-white/5 pb-1.5">
                    Receita Bruta Mensal – Prestação de Serviços
                  </div>
                  <div className="flex justify-between text-neutral-300">
                    <span>VII – Receita com prestação de serviços com dispensa de emissão de documento fiscal:</span>
                    <span className="font-mono">R$ {faturamentoDemei.demeiMesAtual.servicosSemDoc.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-neutral-300">
                    <span>VIII – Receita com prestação de serviços com documento fiscal emitido:</span>
                    <span className="font-mono">R$ {faturamentoDemei.demeiMesAtual.servicosComDoc.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between font-bold text-neutral-100 border-t border-white/10 pt-1.5">
                    <span>IX – Total das receitas com prestação de serviços (VII + VIII):</span>
                    <span className="font-mono text-blue-400">R$ {faturamentoDemei.demeiMesAtual.totalServicos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-[#141414] border border-white/10 rounded-xl flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-200 uppercase">
                  X – Total Geral das Receitas Brutas no Mês (III + VI + IX):
                </span>
                <span className="font-mono text-base font-bold text-emerald-400">
                  R$ {faturamentoDemei.demeiMesAtual.receitaBrutaTotalMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Tabelas Oficiais do Simples Nacional */}
        {activeSubTab === 'tabelas' && (
          <div className="space-y-6">
            <div className="bg-[#181818] border border-white/10 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
                <Percent size={16} className="text-amber-400" />
                Tabelas Oficiais de Alíquotas e Deduções do Simples Nacional (LC 123/2006 Atualizada)
              </h3>
              <p className="text-xs text-neutral-400">
                Alíquotas Nominais e Parcelas a Deduzir aplicáveis sobre a Receita Bruta dos Últimos 12 Meses (RBT12)
              </p>

              {(['ANEXO_I', 'ANEXO_II', 'ANEXO_III', 'ANEXO_IV', 'ANEXO_V'] as AnexoSimplesNacional[]).map((anexoKey) => (
                <div key={anexoKey} className="p-4 bg-[#1c1c1c] border border-white/5 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-amber-400 uppercase">
                    {anexoKey.replace('_', ' ')} - {
                      anexoKey === 'ANEXO_I' ? 'Comércio' :
                      anexoKey === 'ANEXO_II' ? 'Indústria' :
                      anexoKey === 'ANEXO_III' ? 'Serviços em Geral (Fator R ≥ 28%)' :
                      anexoKey === 'ANEXO_IV' ? 'Construção, Vigilância, Limpeza, Advocacia' :
                      'Serviços Intelectuais (Fator R < 28%)'
                    }
                  </h4>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#141414] text-neutral-400 text-[10px] font-mono">
                        <tr>
                          <th className="py-1.5 px-3">Faixa</th>
                          <th className="py-1.5 px-3">Receita Bruta em 12 Meses (R$)</th>
                          <th className="py-1.5 px-3 text-right">Alíquota Nominal</th>
                          <th className="py-1.5 px-3 text-right">Parcela a Deduzir (R$)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                        {tabelas[anexoKey].map((fx) => (
                          <tr key={fx.faixa} className="hover:bg-white/[0.02]">
                            <td className="py-1.5 px-3 font-bold">{fx.faixa}ª Faixa</td>
                            <td className="py-1.5 px-3">
                              De R$ {fx.limiteInferior.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} até R$ {fx.limiteSuperior.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-1.5 px-3 text-right text-amber-400 font-semibold">
                              {(fx.aliquotaNominal * 100).toFixed(2)}%
                            </td>
                            <td className="py-1.5 px-3 text-right text-neutral-300">
                              R$ {fx.deducao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal A4 da Guia DAS Oficial */}
      {showDasModal && apuracao && empresa && (
        <ReportPrintPreviewModal
          isOpen={showDasModal}
          onClose={() => setShowDasModal(false)}
          empresa={empresa}
          tituloRelatorio="DOCUMENTO DE ARRECADAÇÃO DO SIMPLES NACIONAL (DAS)"
          subtitulo="RECEITA FEDERAL DO BRASIL / COMITÊ GESTOR DO SIMPLES NACIONAL"
          periodo={`Competência: ${competencia} | Vencimento: ${apuracao.dataVencimento.split('-').reverse().join('/')}`}
        >
          <div className="space-y-6 text-black font-sans text-xs">
            {/* Cabeçalho da Guia */}
            <div className="border-2 border-black p-4 space-y-3">
              <div className="flex justify-between items-center border-b border-black pb-2">
                <div>
                  <h2 className="text-base font-bold uppercase">DAS - SIMPLES NACIONAL</h2>
                  <p className="text-[10px] text-gray-700">Documento de Arrecadação do Simples Nacional</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] block font-mono">Número do Documento</span>
                  <span className="text-sm font-bold font-mono">{apuracao.numeroDas}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-gray-600 block">Razão Social:</span>
                  <span className="font-bold">{empresa.razaoSocial}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-600 block">CNPJ:</span>
                  <span className="font-mono font-bold">{empresa.cnpj}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-600 block">Período de Apuração:</span>
                  <span className="font-mono font-bold">{competencia}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-600 block">Data de Vencimento:</span>
                  <span className="font-mono font-bold text-red-700 text-sm">{apuracao.dataVencimento.split('-').reverse().join('/')}</span>
                </div>
              </div>
            </div>

            {/* Demonstrativo das Atividades Tributadas */}
            <div className="border border-black">
              <div className="bg-gray-100 font-bold p-2 border-b border-black uppercase text-[11px]">
                Discriminação dos Tributos e Segregações da Receita Bruta
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-black text-[10px] uppercase font-mono">
                    <th className="p-2 text-left">Anexo</th>
                    <th className="p-2 text-left">Atividade</th>
                    <th className="p-2 text-right">Base de Cálculo (R$)</th>
                    <th className="p-2 text-right">Alíq. Efetiva</th>
                    <th className="p-2 text-right">Valor Devido (R$)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300 font-mono">
                  {apuracao.segregacoes.map((seg) => (
                    <tr key={seg.id}>
                      <td className="p-2 font-bold">{seg.anexo}</td>
                      <td className="p-2 font-sans">{seg.descricaoAtividade}</td>
                      <td className="p-2 text-right">R$ {seg.valorTributavel.toFixed(2)}</td>
                      <td className="p-2 text-right">{(seg.aliquotaEfetiva * 100).toFixed(2)}%</td>
                      <td className="p-2 text-right font-bold">R$ {seg.valorDevido.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-black font-bold font-mono">
                    <td colSpan={4} className="p-2 text-right uppercase">VALOR TOTAL DO DOCUMENTO (DAS):</td>
                    <td className="p-2 text-right text-sm">R$ {apuracao.totalDevidoDas.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Código de Barras e Autenticação */}
            <div className="border-2 border-black p-4 space-y-3">
              <div className="text-center font-mono font-bold text-sm tracking-wider">
                {apuracao.codigoBarrasDas}
              </div>
              <div className="h-10 bg-neutral-900 flex items-center justify-center text-white text-[10px] tracking-widest font-mono">
                ||||| | ||||| || |||||| | |||| ||||| ||||||| |||| ||||| |||| ||||| |||||||
              </div>
              <div className="text-center text-[10px] text-gray-600">
                Autenticação Mecânica / QR Code PIX válido para quitação em qualquer canal bancário ou aplicativo credenciado.
              </div>
            </div>
          </div>
        </ReportPrintPreviewModal>
      )}

      {/* Modal A4 de Memória de Cálculo PGDAS-D */}
      {showMemoriaModal && apuracao && empresa && (
        <ReportPrintPreviewModal
          isOpen={showMemoriaModal}
          onClose={() => setShowMemoriaModal(false)}
          empresa={empresa}
          tituloRelatorio="MEMÓRIA DE CÁLCULO PGDAS-D & ALÍQUOTA EFETIVA"
          subtitulo="Demonstrativo Técnico de Apuração conforme Resolução CGSN nº 140/2018"
          periodo={`Competência: ${competencia}`}
        >
          <div className="space-y-4 text-black font-sans text-xs">
            <div className="border border-black p-3 space-y-2">
              <div className="font-bold text-sm border-b border-black pb-1">1. PARÂMETROS GERAIS DO CONTRIBUINTE</div>
              <div className="grid grid-cols-3 gap-2">
                <div><span className="font-semibold">Receita Bruta no Mês (RPA):</span> R$ {apuracao.faturamentoMes.toFixed(2)}</div>
                <div><span className="font-semibold">Receita Bruta 12 Meses (RBT12):</span> R$ {apuracao.rbt12.toFixed(2)}</div>
                <div><span className="font-semibold">Folha Salários 12 Meses:</span> R$ {apuracao.folhaSalarios12Meses.toFixed(2)}</div>
                <div><span className="font-semibold">Fator R Apurado:</span> {(apuracao.fatorR * 100).toFixed(2)}%</div>
                <div><span className="font-semibold">Enquadramento Fator R:</span> {apuracao.enquadraFatorR ? 'Anexo III (≥ 28%)' : 'Anexo V (< 28%)'}</div>
                <div><span className="font-semibold">Regime de Apuração:</span> Competência</div>
              </div>
            </div>

            <div className="border border-black p-3 space-y-2">
              <div className="font-bold text-sm border-b border-black pb-1">2. FÓRMULA DE CÁLCULO DA ALÍQUOTA EFETIVA</div>
              <p className="text-[11px] font-mono">
                Alíquota Efetiva = [(RBT12 × Alíquota Nominal da Faixa) - Parcela a Deduzir] ÷ RBT12
              </p>
              {apuracao.segregacoes.map((seg, i) => (
                <div key={i} className="p-2 bg-gray-50 border border-gray-300 font-mono text-[11px] space-y-1">
                  <div className="font-bold text-black font-sans">{seg.anexo} - {seg.descricaoAtividade}</div>
                  <div>Base de Cálculo: R$ {seg.valorTributavel.toFixed(2)}</div>
                  <div>Alíquota Efetiva Calculada: {(seg.aliquotaEfetiva * 100).toFixed(4)}%</div>
                  <div className="font-bold">Valor Apurado para este Anexo: R$ {seg.valorDevido.toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div className="border border-black p-3 space-y-2">
              <div className="font-bold text-sm border-b border-black pb-1">3. REPARTIÇÃO DOS ENCARGOS DA GUIA ÚNICA</div>
              <p className="text-[11px]">
                O recolhimento do Simples Nacional extingue a obrigação de recolhimento individualizado dos tributos IRPJ, CSLL, PIS, COFINS, CPP, ICMS e ISS para as receitas abrangidas.
              </p>
              <div className="text-right font-bold font-mono text-sm pt-2">
                TOTAL GERAL DAS DA COMPETÊNCIA: R$ {apuracao.totalDevidoDas.toFixed(2)}
              </div>
            </div>
          </div>
        </ReportPrintPreviewModal>
      )}

      {/* Modal A4: Declaração Oficial de Faturamento dos Últimos 12 Meses (Faturamento__ltimo_Ano_Escrita_Fiscal.htm) */}
      {showDeclaracao12MModal && faturamentoDemei && empresa && (
        <ReportPrintPreviewModal
          isOpen={showDeclaracao12MModal}
          onClose={() => setShowDeclaracao12MModal(false)}
          empresa={empresa}
          tituloRelatorio="RELAÇÃO E DECLARAÇÃO OFICIAL DE FATURAMENTO DOS ÚLTIMOS 12 MESES"
          subtitulo="Demonstrativo Oficial de Receita Bruta Mensal para Instituições Financeiras, Cadastro e Licitações"
          periodo={`Período: ${faturamentoDemei.competenciaInicial} a ${faturamentoDemei.competenciaFinal}`}
        >
          <div className="space-y-4 text-black font-sans text-xs">
            <p className="text-justify leading-relaxed">
              Declaramos, para os devidos fins de comprovação junto a instituições financeiras, órgãos públicos, fornecedores e análises de crédito, que a empresa{' '}
              <strong>{empresa.razaoSocial}</strong>, inscrita no CNPJ sob o nº <strong>{empresa.cnpj}</strong>, enquadrada no regime tributário{' '}
              <strong>{empresa.regimeTributario.replace('_', ' ')} ({empresa.porteEmpresa || 'ME'})</strong>, auferiu nos últimos 12 (doze) meses a Receita Bruta Mensal discriminada abaixo, fielmente extraída da Escrita Fiscal e do Livro Diário / Caixa:
            </p>

            <table className="w-full border-collapse border border-black text-[11px] font-mono">
              <thead>
                <tr className="bg-gray-100 border-b border-black uppercase">
                  <th className="border border-black p-1.5 text-left">Mês / Ano</th>
                  <th className="border border-black p-1.5 text-right">Entradas (R$)</th>
                  <th className="border border-black p-1.5 text-right">Venda Mercadorias (R$)</th>
                  <th className="border border-black p-1.5 text-right">Prest. Serviços (R$)</th>
                  <th className="border border-black p-1.5 text-right">Receita Bruta Mês (R$)</th>
                  <th className="border border-black p-1.5 text-right">Acumulado (R$)</th>
                </tr>
              </thead>
              <tbody>
                {faturamentoDemei.meses.map((m) => (
                  <tr key={m.competencia} className="border-b border-gray-300">
                    <td className="border border-black p-1.5 font-bold">{m.labelMes}</td>
                    <td className="border border-black p-1.5 text-right">{m.entradasMercadorias.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="border border-black p-1.5 text-right">{m.totalComercio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="border border-black p-1.5 text-right">{m.totalServicos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="border border-black p-1.5 text-right font-bold">{m.faturamentoBrutoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="border border-black p-1.5 text-right">{m.acumuladoAteMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-bold border-t-2 border-black">
                  <td className="border border-black p-1.5 uppercase">TOTAL 12 MESES (RBT12)</td>
                  <td className="border border-black p-1.5 text-right">R$ {faturamentoDemei.totais12Meses.entradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="border border-black p-1.5 text-right">R$ {faturamentoDemei.totais12Meses.comercio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="border border-black p-1.5 text-right">R$ {faturamentoDemei.totais12Meses.servicos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="border border-black p-1.5 text-right">R$ {faturamentoDemei.totais12Meses.faturamentoTotalRbt12.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="border border-black p-1.5 text-right">Média: R$ {faturamentoDemei.totais12Meses.mediaMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                </tr>
              </tfoot>
            </table>

            <div className="border border-black p-2.5 text-[11px] bg-gray-50">
              <strong>Parecer de Enquadramento Fiscal:</strong> {faturamentoDemei.enquadramento.alertaSimplesnUltrapassouPar}
            </div>

            <div className="grid grid-cols-2 gap-8 pt-10 text-center">
              <div className="border-t border-black pt-2">
                <div className="font-bold">{empresa.responsavelLegal || empresa.razaoSocial}</div>
                <div className="text-[10px]">Responsável Legal / Administrador — CPF: {empresa.cpfResponsavel || '000.000.000-00'}</div>
              </div>
              <div className="border-t border-black pt-2">
                <div className="font-bold">{empresa.contadorNome || empresa.contadorResponsavel || 'Contador Responsável'}</div>
                <div className="text-[10px]">Contador Responsável — CRC: {empresa.contadorCRC || empresa.crcContador || 'CRC/SP'} — CPF: {empresa.contadorCPF || '000.000.000-00'}</div>
              </div>
            </div>
          </div>
        </ReportPrintPreviewModal>
      )}

      {/* Modal A4: Relatório 447 - DEMEI (Demonstrativo Mensal das Receitas Brutas MEI) */}
      {showDemeiModal && faturamentoDemei && empresa && (
        <ReportPrintPreviewModal
          isOpen={showDemeiModal}
          onClose={() => setShowDemeiModal(false)}
          empresa={empresa}
          tituloRelatorio="RELATÓRIO MENSAL DAS RECEITAS BRUTAS (447 - DEMEI)"
          subtitulo="Anexo Único da Resolução CGSN — Art. 26, § 1º da Lei Complementar nº 123/2006"
          periodo={`Período de Apuração: ${competencia}`}
        >
          <div className="space-y-4 text-black font-sans text-xs">
            <div className="border border-black p-3 grid grid-cols-2 gap-2">
              <div><strong>CNPJ:</strong> {empresa.cnpj}</div>
              <div><strong>Período de Apuração:</strong> {competencia}</div>
              <div className="col-span-2"><strong>Empreendedor Individual / Razão Social:</strong> {empresa.razaoSocial}</div>
            </div>

            <div className="border border-black">
              <div className="bg-gray-100 font-bold p-2 border-b border-black uppercase text-[11px]">
                RECEITA BRUTA MENSAL – REVENDA DE MERCADORIAS (COMÉRCIO)
              </div>
              <div className="p-2.5 space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="font-sans">I – Revenda de mercadorias com dispensa de emissão de documento fiscal</span>
                  <span>R$ {faturamentoDemei.demeiMesAtual.comercioSemDoc.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans">II – Revenda de mercadorias com documento fiscal emitido</span>
                  <span>R$ {faturamentoDemei.demeiMesAtual.comercioComDoc.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-black pt-1">
                  <span className="font-sans">III – Total das receitas com revenda de mercadorias (I + II)</span>
                  <span>R$ {faturamentoDemei.demeiMesAtual.totalComercio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <div className="border border-black">
              <div className="bg-gray-100 font-bold p-2 border-b border-black uppercase text-[11px]">
                RECEITA BRUTA MENSAL – VENDA DE PRODUTOS INDUSTRIALIZADOS (INDÚSTRIA)
              </div>
              <div className="p-2.5 space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="font-sans">IV – Venda de produtos industrializados com dispensa de emissão de documento fiscal</span>
                  <span>R$ 0,00</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans">V – Venda de produtos industrializados com documento fiscal emitido</span>
                  <span>R$ 0,00</span>
                </div>
                <div className="flex justify-between font-bold border-t border-black pt-1">
                  <span className="font-sans">VI – Total das receitas com venda de produtos industrializados (IV + V)</span>
                  <span>R$ 0,00</span>
                </div>
              </div>
            </div>

            <div className="border border-black">
              <div className="bg-gray-100 font-bold p-2 border-b border-black uppercase text-[11px]">
                RECEITA BRUTA MENSAL – PRESTAÇÃO DE SERVIÇOS
              </div>
              <div className="p-2.5 space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="font-sans">VII – Receita com prestação de serviços com dispensa de emissão de documento fiscal</span>
                  <span>R$ {faturamentoDemei.demeiMesAtual.servicosSemDoc.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans">VIII – Receita com prestação de serviços com documento fiscal emitido</span>
                  <span>R$ {faturamentoDemei.demeiMesAtual.servicosComDoc.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-black pt-1">
                  <span className="font-sans">IX – Total das receitas com prestação de serviços (VII + VIII)</span>
                  <span>R$ {faturamentoDemei.demeiMesAtual.totalServicos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <div className="border-2 border-black p-3 bg-gray-100 flex justify-between font-bold text-sm">
              <span>X – TOTAL GERAL DAS RECEITAS BRUTAS NO MÊS (III + VI + IX):</span>
              <span className="font-mono">R$ {faturamentoDemei.demeiMesAtual.receitaBrutaTotalMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-8 text-center">
              <div className="border-t border-black pt-2">
                <div className="font-bold">LOCAL E DATA</div>
                <div className="text-[10px]">{empresa.cidade || 'São Paulo'}/{empresa.uf || 'SP'}, {new Date().toLocaleDateString('pt-BR')}</div>
              </div>
              <div className="border-t border-black pt-2">
                <div className="font-bold">{empresa.responsavelLegal || empresa.razaoSocial}</div>
                <div className="text-[10px]">Assinatura do Empreendedor / Responsável Legal</div>
              </div>
            </div>
          </div>
        </ReportPrintPreviewModal>
      )}
    </div>
  );
};
