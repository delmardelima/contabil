import React, { useState, useEffect } from 'react';
import {
  Landmark,
  Scale,
  Receipt,
  FileCode,
  Printer,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  Layers,
  Percent,
  Search,
  Copy,
  Download,
  ShieldCheck,
  Send,
  DollarSign,
  ArrowRight,
  Barcode,
  Truck,
  PlusCircle
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import { ApuracaoSpedFiscalBlocoE, RegistroE210IcmsStUf, RegistroE310DifalFcpUf } from '../../types/contabil';

interface SpedBlocoEProps {
  empresaId?: number;
}

export const SpedFiscalBlocoEModule: React.FC<SpedBlocoEProps> = ({ empresaId = 1 }) => {
  const [competencia, setCompetencia] = useState<string>('2026-03');
  const [activeTab, setActiveTab] = useState<'ICMS_PROPRIO_E110' | 'ICMS_ST_E210' | 'DIFAL_FCP_E310' | 'GUIA_DAE_A4' | 'TXT_SPED_BLOCO_E'>('ICMS_PROPRIO_E110');
  const [apuracao, setApuracao] = useState<ApuracaoSpedFiscalBlocoE | null>(null);
  const [txtGerado, setTxtGerado] = useState<string>('');
  const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'info'; texto: string } | null>(null);

  // Campos editáveis do E110
  const [debitosOp, setDebitosOp] = useState<number>(145800);
  const [ajustesDeb, setAjustesDeb] = useState<number>(2400);
  const [creditosOp, setCreditosOp] = useState<number>(88500);
  const [ajustesCred, setAjustesCred] = useState<number>(3200);
  const [saldoCredAnt, setSaldoCredAnt] = useState<number>(12000);
  const [deducoes, setDeducoes] = useState<number>(4500);

  const carregarDados = () => {
    const d = dbService.getApuracaoSpedFiscalBlocoE(empresaId, competencia);
    setApuracao(d);
    setDebitosOp(d.proprioE110.totalDebitosOperacoesBRL);
    setAjustesDeb(d.proprioE110.totalAjustesDebitoBRL);
    setCreditosOp(d.proprioE110.totalCreditosOperacoesBRL);
    setAjustesCred(d.proprioE110.totalAjustesCreditoBRL);
    setSaldoCredAnt(d.proprioE110.saldoCredorPeriodoAnteriorBRL);
    setDeducoes(d.proprioE110.totalDeducoesIncentivosBRL);
  };

  useEffect(() => {
    carregarDados();
  }, [empresaId, competencia]);

  const formatBRL = (val: number) => {
    return (val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Cálculos dinâmicos em tempo real do E110
  const totalDebitos = debitosOp + ajustesDeb;
  const totalCreditos = creditosOp + ajustesCred + saldoCredAnt;
  const saldoApurado = totalDebitos - totalCreditos;
  const saldoDevedor = saldoApurado > 0 ? saldoApurado : 0;
  const saldoCredorTransportar = saldoApurado < 0 ? Math.abs(saldoApurado) : 0;
  const icmsRecolher = Math.max(0, saldoDevedor - deducoes);

  // Totais ST e DIFAL
  const totalStRecolher = (apuracao?.stE210 || []).reduce((a, b) => a + b.icmsStRecolherBRL, 0);
  const totalDifalRecolher = (apuracao?.difalE310 || []).reduce((a, b) => a + b.difalRecolherBRL, 0);
  const totalFcpRecolher = (apuracao?.difalE310 || []).reduce((a, b) => a + b.fcpRecolherBRL, 0);
  const totalGeralIcms = icmsRecolher + totalStRecolher + totalDifalRecolher + totalFcpRecolher;

  const handleSalvarApuracao = () => {
    if (!apuracao) return;

    const novaApur: ApuracaoSpedFiscalBlocoE = {
      ...apuracao,
      competencia,
      proprioE110: {
        ...apuracao.proprioE110,
        totalDebitosOperacoesBRL: debitosOp,
        totalAjustesDebitoBRL: ajustesDeb,
        totalCreditosOperacoesBRL: creditosOp,
        totalAjustesCreditoBRL: ajustesCred,
        saldoCredorPeriodoAnteriorBRL: saldoCredAnt,
        saldoDevedorApuradoBRL: saldoDevedor,
        saldoCredorTransportarBRL: saldoCredorTransportar,
        totalDeducoesIncentivosBRL: deducoes,
        icmsRecolherEfetivoBRL: icmsRecolher
      },
      totalGeralIcmsRecolherBRL: totalGeralIcms,
      statusFechamento: 'CONCILIADO'
    };

    const res = dbService.salvarApuracaoSpedFiscalBlocoE(novaApur);
    if (res.sucesso) {
      setApuracao(novaApur);
      setFeedback({ tipo: 'sucesso', texto: res.mensagem });
    }
  };

  const handleGerarTxtBlocoE = () => {
    const res = dbService.gerarArquivoSpedFiscalBlocE(empresaId, competencia);
    if (res.sucesso) {
      setTxtGerado(res.txt);
      setActiveTab('TXT_SPED_BLOCO_E');
      setFeedback({ tipo: 'info', texto: res.mensagem });
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#121212] text-zinc-100 overflow-hidden font-sans">
      {/* HEADER PRINCIPAL */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#181818]">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-white">SPED Fiscal Bloco E - Apuração do ICMS</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-medium">
                Guia Prático EFD v3.1.6 & Convênio 142/2018
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Apuração Consolidada: ICMS Próprio (E110), ICMS Substituição Tributária (E210) e DIFAL / FECOEP (E310)
            </p>
          </div>
        </div>

        {/* CONTROLES DO HEADER */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-[#242424] px-3 py-1.5 rounded-md border border-zinc-700">
            <Calendar className="w-4 h-4 text-zinc-400 mr-2" />
            <span className="text-xs text-zinc-400 mr-2">Competência:</span>
            <input
              type="month"
              value={competencia}
              onChange={e => setCompetencia(e.target.value)}
              className="bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={handleSalvarApuracao}
            className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-semibold shadow-sm transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Salvar Apuração Bloco E</span>
          </button>

          <button
            onClick={carregarDados}
            title="Atualizar dados"
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* FEEDBACK BANNER */}
      {feedback && (
        <div className={`px-6 py-2 text-xs flex items-center justify-between ${
          feedback.tipo === 'sucesso' ? 'bg-emerald-950/60 text-emerald-300 border-b border-emerald-800' : 'bg-blue-950/60 text-blue-300 border-b border-blue-800'
        }`}>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{feedback.texto}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-zinc-400 hover:text-white">✕</button>
        </div>
      )}

      {/* KPI CARDS */}
      <div className="grid grid-cols-5 gap-3 px-6 py-3 bg-[#161616] border-b border-zinc-800 text-xs">
        <div className="p-3 bg-[#1e1e1e] rounded-lg border border-zinc-800">
          <div className="text-zinc-400 flex items-center justify-between">
            <span>ICMS Próprio (E110)</span>
            <span className="px-1.5 py-0.2 bg-blue-500/20 text-blue-300 rounded text-[10px]">DAE Próprio</span>
          </div>
          <div className="text-base font-bold text-white mt-1">
            {formatBRL(icmsRecolher)}
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">
            Débitos: {formatBRL(totalDebitos)} | Créditos: {formatBRL(totalCreditos)}
          </div>
        </div>

        <div className="p-3 bg-[#1e1e1e] rounded-lg border border-zinc-800">
          <div className="text-zinc-400 flex items-center justify-between">
            <span>ICMS-ST Interestadual (E210)</span>
            <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded text-[10px]">GNRE ST</span>
          </div>
          <div className="text-base font-bold text-amber-400 mt-1">
            {formatBRL(totalStRecolher)}
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">
            {apuracao?.stE210.length || 0} UFs favorecidas apuradas
          </div>
        </div>

        <div className="p-3 bg-[#1e1e1e] rounded-lg border border-zinc-800">
          <div className="text-zinc-400 flex items-center justify-between">
            <span>DIFAL Não Contribuinte (E310)</span>
            <span className="px-1.5 py-0.2 bg-purple-500/20 text-purple-300 rounded text-[10px]">EC 87/15</span>
          </div>
          <div className="text-base font-bold text-purple-400 mt-1">
            {formatBRL(totalDifalRecolher)}
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">
            GNRE Cód. 10010-2
          </div>
        </div>

        <div className="p-3 bg-[#1e1e1e] rounded-lg border border-zinc-800">
          <div className="text-zinc-400 flex items-center justify-between">
            <span>FECOEP Fundo Pobreza</span>
            <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded text-[10px]">FCP</span>
          </div>
          <div className="text-base font-bold text-emerald-400 mt-1">
            {formatBRL(totalFcpRecolher)}
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">
            GNRE Cód. 10012-9
          </div>
        </div>

        <div className="p-3 bg-blue-950/30 rounded-lg border border-blue-500/30">
          <div className="text-blue-300 flex items-center justify-between font-semibold">
            <span>Total Guias ICMS</span>
            <Landmark className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-base font-extrabold text-blue-300 mt-1">
            {formatBRL(totalGeralIcms)}
          </div>
          <div className="text-[10px] text-blue-400/80 mt-1">
            Próprio + ST + DIFAL + FCP
          </div>
        </div>
      </div>

      {/* TABS DE NAVEGAÇÃO */}
      <div className="flex items-center px-6 border-b border-zinc-800 bg-[#141414] text-xs">
        <button
          onClick={() => setActiveTab('ICMS_PROPRIO_E110')}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium transition-colors ${
            activeTab === 'ICMS_PROPRIO_E110'
              ? 'border-blue-500 text-blue-400 bg-zinc-800/40'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>ICMS Próprio (Registro E110)</span>
        </button>

        <button
          onClick={() => setActiveTab('ICMS_ST_E210')}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium transition-colors ${
            activeTab === 'ICMS_ST_E210'
              ? 'border-blue-500 text-blue-400 bg-zinc-800/40'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>ICMS-ST por UF (Registro E210)</span>
        </button>

        <button
          onClick={() => setActiveTab('DIFAL_FCP_E310')}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium transition-colors ${
            activeTab === 'DIFAL_FCP_E310'
              ? 'border-blue-500 text-blue-400 bg-zinc-800/40'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Percent className="w-4 h-4" />
          <span>DIFAL & FCP por Destino (Registro E310)</span>
        </button>

        <button
          onClick={() => setActiveTab('GUIA_DAE_A4')}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium transition-colors ${
            activeTab === 'GUIA_DAE_A4'
              ? 'border-blue-500 text-blue-400 bg-zinc-800/40'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>Guia DAE / GNRE A4</span>
        </button>

        <button
          onClick={() => {
            handleGerarTxtBlocoE();
          }}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium transition-colors ${
            activeTab === 'TXT_SPED_BLOCO_E'
              ? 'border-blue-500 text-blue-400 bg-zinc-800/40'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Arquivo TXT Bloco E</span>
        </button>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="flex-1 overflow-auto p-6 bg-[#121212]">
        {/* ABA 1: ICMS PRÓPRIO E110 */}
        {activeTab === 'ICMS_PROPRIO_E110' && (
          <div className="max-w-4xl mx-auto space-y-4 text-xs">
            <div className="bg-[#181818] p-5 rounded-lg border border-zinc-800 space-y-4">
              <div className="border-b border-zinc-800 pb-2">
                <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Scale className="w-4 h-4 text-blue-400" />
                  <span>Livro Registro de Apuração do ICMS Próprio (Registro E110)</span>
                </h2>
                <p className="text-zinc-400 mt-0.5">
                  Demonstração dos débitos pelas saídas, créditos pelas entradas e ajustes fiscais estaduais (E111).
                </p>
              </div>

              {/* DÉBITOS */}
              <div className="p-3 bg-[#202020] rounded border border-zinc-700 space-y-3">
                <div className="font-semibold text-zinc-200 flex justify-between">
                  <span>I - DÉBITO DO IMPOSTO</span>
                  <span className="font-mono text-white">{formatBRL(totalDebitos)}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 mb-1">Por Saídas e Prestações com Débito (CFOP 5/6xxx):</label>
                    <input
                      type="number"
                      step="0.01"
                      value={debitosOp}
                      onChange={e => setDebitosOp(parseFloat(e.target.value) || 0)}
                      className="w-full bg-[#2a2a2a] border border-zinc-600 rounded p-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">Ajustes a Débito do Imposto (Registro E111):</label>
                    <input
                      type="number"
                      step="0.01"
                      value={ajustesDeb}
                      onChange={e => setAjustesDeb(parseFloat(e.target.value) || 0)}
                      className="w-full bg-[#2a2a2a] border border-zinc-600 rounded p-2 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* CRÉDITOS */}
              <div className="p-3 bg-[#202020] rounded border border-zinc-700 space-y-3">
                <div className="font-semibold text-zinc-200 flex justify-between">
                  <span>II - CRÉDITO DO IMPOSTO</span>
                  <span className="font-mono text-white">{formatBRL(totalCreditos)}</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-zinc-400 mb-1">Por Entradas e Aquisições (CFOP 1/2xxx):</label>
                    <input
                      type="number"
                      step="0.01"
                      value={creditosOp}
                      onChange={e => setCreditosOp(parseFloat(e.target.value) || 0)}
                      className="w-full bg-[#2a2a2a] border border-zinc-600 rounded p-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">Ajustes a Crédito do Imposto (E111):</label>
                    <input
                      type="number"
                      step="0.01"
                      value={ajustesCred}
                      onChange={e => setAjustesCred(parseFloat(e.target.value) || 0)}
                      className="w-full bg-[#2a2a2a] border border-zinc-600 rounded p-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">Saldo Credor do Mês Anterior Transportado:</label>
                    <input
                      type="number"
                      step="0.01"
                      value={saldoCredAnt}
                      onChange={e => setSaldoCredAnt(parseFloat(e.target.value) || 0)}
                      className="w-full bg-[#2a2a2a] border border-zinc-600 rounded p-2 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* RESULTADO E DEDUÇÕES */}
              <div className="p-3 bg-[#202020] rounded border border-zinc-700 space-y-3">
                <div className="font-semibold text-zinc-200">
                  <span>III - APURAÇÃO DO SALDO & DEDUÇÕES</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <span className="text-zinc-500 block text-[11px]">Saldo Devedor Apurado:</span>
                    <strong className="text-white font-mono text-sm">{formatBRL(saldoDevedor)}</strong>
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">Deduções / Incentivos Regionais:</label>
                    <input
                      type="number"
                      step="0.01"
                      value={deducoes}
                      onChange={e => setDeducoes(parseFloat(e.target.value) || 0)}
                      className="w-full bg-[#2a2a2a] border border-zinc-600 rounded p-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[11px]">Saldo Credor a Transportar:</span>
                    <strong className="text-emerald-400 font-mono text-sm">{formatBRL(saldoCredorTransportar)}</strong>
                  </div>
                </div>
              </div>

              {/* TOTAL A RECOLHER */}
              <div className="p-4 bg-blue-950/20 border border-blue-500/30 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-zinc-400 block text-xs">Valor do ICMS Efetivo a Recolher:</span>
                  <strong className="text-xl font-bold text-blue-300 font-mono">{formatBRL(icmsRecolher)}</strong>
                  <span className="text-[11px] text-zinc-500 block">Guia DAE Estadual | Vencimento: 20/04/2026</span>
                </div>
                <button
                  onClick={() => setActiveTab('GUIA_DAE_A4')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold flex items-center space-x-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Emitir DAE</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: ICMS-ST E210 */}
        {activeTab === 'ICMS_ST_E210' && (
          <div className="space-y-4 text-xs">
            <div className="bg-[#181818] p-4 rounded-lg border border-zinc-800">
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <Truck className="w-4 h-4 text-amber-400" />
                <span>Registros E200 / E210: Apuração do ICMS Substituição Tributária por UF Favorecida</span>
              </h2>
              <p className="text-zinc-400 mt-1">
                Controle das retenções de ICMS-ST nas operações interestaduais com emissão de GNRE favorecendo a SEFAZ de destino (Convênio ICMS 142/2018).
              </p>
            </div>

            <div className="bg-[#181818] rounded-lg border border-zinc-800 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#202020] text-zinc-400 border-b border-zinc-800 select-none">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">UF Favorecida</th>
                    <th className="py-2.5 px-4 font-semibold">Número da Guia GNRE</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Débitos de Retenção ST</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Créditos / Devoluções</th>
                    <th className="py-2.5 px-4 font-semibold text-right">ICMS-ST a Recolher</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Código GNRE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono">
                  {(apuracao?.stE210 || []).map((st, idx) => (
                    <tr key={idx} className="hover:bg-zinc-800/40">
                      <td className="py-3 px-4 font-sans font-bold text-white flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px] border border-amber-500/30">
                          {st.ufFavorecida}
                        </span>
                        <span>SEFAZ/{st.ufFavorecida}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-zinc-300">{st.guiaGnreNumero}</td>
                      <td className="py-3 px-4 text-right font-bold text-white">{formatBRL(st.totalDebitosRetencaoStBRL)}</td>
                      <td className="py-3 px-4 text-right text-zinc-400">{formatBRL(st.totalCreditosDevolucaoStBRL)}</td>
                      <td className="py-3 px-4 text-right font-bold text-amber-400">{formatBRL(st.icmsStRecolherBRL)}</td>
                      <td className="py-3 px-4 text-center font-sans">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {st.codigoReceitaGnre}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 3: DIFAL & FCP E310 */}
        {activeTab === 'DIFAL_FCP_E310' && (
          <div className="space-y-4 text-xs">
            <div className="bg-[#181818] p-4 rounded-lg border border-zinc-800">
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <Percent className="w-4 h-4 text-purple-400" />
                <span>Registros E300 / E310: DIFAL e FECOEP por UF de Destino (Não Contribuinte)</span>
              </h2>
              <p className="text-zinc-400 mt-1">
                Apuração das operações de venda interestadual a consumidor final não contribuinte do ICMS conforme a Emenda Constitucional nº 87/2015 e LC nº 190/2022.
              </p>
            </div>

            <div className="bg-[#181818] rounded-lg border border-zinc-800 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#202020] text-zinc-400 border-b border-zinc-800 select-none">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">UF Destino</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Débitos DIFAL</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Débitos FCP</th>
                    <th className="py-2.5 px-4 font-semibold text-right">DIFAL a Recolher</th>
                    <th className="py-2.5 px-4 font-semibold text-right">FCP a Recolher</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Códigos GNRE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono">
                  {(apuracao?.difalE310 || []).map((d, idx) => (
                    <tr key={idx} className="hover:bg-zinc-800/40">
                      <td className="py-3 px-4 font-sans font-bold text-white flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-[10px] border border-purple-500/30">
                          {d.ufDestino}
                        </span>
                        <span>Destino: {d.ufDestino}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-white">{formatBRL(d.totalDebitosDifalBRL)}</td>
                      <td className="py-3 px-4 text-right text-emerald-400">{formatBRL(d.totalDebitosFcpBRL)}</td>
                      <td className="py-3 px-4 text-right font-bold text-purple-400">{formatBRL(d.difalRecolherBRL)}</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-400">{formatBRL(d.fcpRecolherBRL)}</td>
                      <td className="py-3 px-4 text-center font-sans">
                        <span className="text-[10px] text-zinc-400">
                          {d.codigoReceitaDifalGnre} / {d.codigoReceitaFcpGnre}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 4: GUIA DAE A4 */}
        {activeTab === 'GUIA_DAE_A4' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-[#181818] p-3 rounded-lg border border-zinc-800 text-xs">
              <div className="flex items-center space-x-2">
                <Printer className="w-4 h-4 text-blue-400" />
                <span className="font-semibold text-white">Documento de Arrecadação Estadual - DAE / GNRE (Modelo A4 Oficial)</span>
              </div>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold flex items-center space-x-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Guia DAE</span>
              </button>
            </div>

            {/* GUIA DAE TIMBRADA A4 */}
            <div className="max-w-3xl mx-auto bg-white text-zinc-900 p-8 rounded shadow-2xl font-sans text-xs border border-zinc-400 space-y-4">
              <div className="flex items-center justify-between border-b-2 border-black pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-zinc-800 text-white flex items-center justify-center font-extrabold text-sm rounded">
                    DAE
                  </div>
                  <div>
                    <div className="font-bold text-sm uppercase">SECRETARIA DA FAZENDA ESTADUAL</div>
                    <div className="font-extrabold text-base uppercase text-zinc-800">
                      DOCUMENTO DE ARRECADAÇÃO ESTADUAL - ICMS
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 block">Número do Documento:</span>
                  <strong className="font-mono text-sm">2026.03.994812-7</strong>
                </div>
              </div>

              {/* DADOS DA GUIA */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-zinc-400 rounded p-3 space-y-2">
                  <div>
                    <span className="text-[10px] text-zinc-500 block">Razão Social:</span>
                    <strong className="text-zinc-900">INDÚSTRIA E COMÉRCIO CONTÁBIL STUDIO PRO S/A</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">CNPJ do Contribuinte:</span>
                    <strong className="text-zinc-900 font-mono">12.345.678/0001-90</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">Inscrição Estadual (IE):</span>
                    <strong className="text-zinc-900 font-mono">123.456.789.110</strong>
                  </div>
                </div>

                <div className="border border-zinc-400 rounded p-3 space-y-2">
                  <div>
                    <span className="text-[10px] text-zinc-500 block">Código da Receita:</span>
                    <strong className="text-zinc-900 font-mono">046-2 (ICMS Normal - Regime Periódico)</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">Mês/Ano de Referência:</span>
                    <strong className="text-zinc-900 font-mono">{competencia}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">Data de Vencimento:</span>
                    <strong className="text-red-700 font-mono text-sm">20/04/2026</strong>
                  </div>
                  <div className="pt-1 border-t border-zinc-300 flex justify-between items-center">
                    <span className="text-xs font-bold text-zinc-800">VALOR PRINCIPAL:</span>
                    <strong className="text-base font-extrabold text-zinc-900 font-mono">{formatBRL(icmsRecolher)}</strong>
                  </div>
                </div>
              </div>

              {/* CÓDIGO DE BARRAS FEBRABAN */}
              <div className="border border-zinc-400 rounded p-4 text-center bg-zinc-50 space-y-2">
                <div className="font-mono text-sm tracking-widest text-zinc-800 font-bold">
                  85830000000-4 40000000000-8 04620260320-1 99481270001-3
                </div>
                <div className="h-12 bg-zinc-800 flex items-center justify-center text-white tracking-widest font-mono text-xs">
                  ||||| |||| |||||||| ||||| |||||| |||||||||| ||||| |||||||| ||||||| |||||||||| |||||||||||
                </div>
                <div className="text-[10px] text-zinc-500">
                  Autenticação Mecânica no Verso / Pagável em toda a rede bancária autorizada e canais PIX
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 5: TXT SPED BLOCO E */}
        {activeTab === 'TXT_SPED_BLOCO_E' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-[#181818] p-3 rounded-lg border border-zinc-800 text-xs">
              <div className="flex items-center space-x-2">
                <FileCode className="w-4 h-4 text-blue-400" />
                <span className="font-semibold text-white">Arquivo Oficial do Bloco E do SPED Fiscal (Guia Prático EFD)</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(txtGerado);
                    setFeedback({ tipo: 'sucesso', texto: 'Conteúdo TXT copiado com sucesso.' });
                  }}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-xs flex items-center space-x-1.5 border border-zinc-700"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar TXT</span>
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([txtGerado], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `SPED_FISCAL_BLOCO_E_${competencia}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold flex items-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar .txt</span>
                </button>
              </div>
            </div>

            <div className="bg-[#141414] rounded-lg border border-zinc-800 p-4 overflow-auto max-h-[500px]">
              <pre className="text-xs font-mono text-blue-300 leading-relaxed whitespace-pre-wrap">
                {txtGerado || 'Clique em "Arquivo TXT Bloco E" para gerar a escrituração oficial.'}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
