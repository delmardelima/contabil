import React, { useState, useEffect } from 'react';
import {
  Calculator,
  BookOpen,
  DollarSign,
  FileText,
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
  Scale,
  Landmark,
  BadgeAlert,
  Sliders,
  FileSpreadsheet,
  FileCode
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import { DemonstrativoLucroRealEcfBlocoN, FormaApuracaoLucroReal } from '../../types/contabil';

interface LucroRealProps {
  empresaId?: number;
}

export const LucroRealEcfBlocoNModule: React.FC<LucroRealProps> = ({ empresaId = 1 }) => {
  const [ano, setAno] = useState<number>(2026);
  const [periodo, setPeriodo] = useState<string>('1T');
  const [activeTab, setActiveTab] = useState<'APURACAO_IRPJ' | 'APURACAO_CSLL' | 'RELATORIO_A4' | 'GERADOR_TXT'>('APURACAO_IRPJ');
  const [demo, setDemo] = useState<DemonstrativoLucroRealEcfBlocoN | null>(null);
  const [txtGerado, setTxtGerado] = useState<string>('');
  const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'info'; texto: string } | null>(null);

  // Estados editáveis da apuração
  const [lucroLiquido, setLucroLiquido] = useState<number>(480000);
  const [adicoesLalur, setAdicoesLalur] = useState<number>(85000);
  const [exclusoesLalur, setExclusoesLalur] = useState<number>(45000);
  const [incentivoPat, setIncentivoPat] = useState<number>(3400);
  const [irrfRetido, setIrrfRetido] = useState<number>(8500);
  const [irrfEstimativas, setIrrfEstimativas] = useState<number>(0);
  const [csrfRetido, setCsrfRetido] = useState<number>(3640);
  const [csllEstimativas, setCsllEstimativas] = useState<number>(0);

  const carregarDados = () => {
    const d = dbService.getLucroRealEcfBlocoN(empresaId, ano, periodo);
    setDemo(d);
    setLucroLiquido(d.lucroLiquidoAntesTributosBRL);
    setAdicoesLalur(d.totalAdicoesLalurBRL);
    setExclusoesLalur(d.totalExclusoesLalurBRL);
    setIncentivoPat(d.deducaoPatAlimentacaoBRL);
    setIrrfRetido(d.irpjRetidoFonteBRL);
    setIrrfEstimativas(d.irpjPagoEstimativasMensaisBRL);
    setCsrfRetido(d.csllRetidaFonteBRL);
    setCsllEstimativas(d.csllPagaEstimativasMensaisBRL);
  };

  useEffect(() => {
    carregarDados();
  }, [empresaId, ano, periodo]);

  const formatBRL = (val: number) => {
    return (val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Cálculos dinâmicos em tempo real
  const lucroRealAntesPrej = Math.max(0, lucroLiquido + adicoesLalur - exclusoesLalur);
  const trava30MaxPrej = Math.round(lucroRealAntesPrej * 0.30 * 100) / 100;
  const baseEfetivaIrpj = Math.max(0, lucroRealAntesPrej - trava30MaxPrej);
  const irpjBase = Math.round(baseEfetivaIrpj * 0.15 * 100) / 100;

  const limiteAdicional = periodo === 'ANUAL_DEZ' ? 240000 : 60000;
  const baseAdicional = Math.max(0, baseEfetivaIrpj - limiteAdicional);
  const irpjAdicional = Math.round(baseAdicional * 0.10 * 100) / 100;
  const totalIrpjApurado = irpjBase + irpjAdicional;

  const maxIncentivoPat = Math.round(irpjBase * 0.04 * 100) / 100; // Limite 4% do IRPJ devido
  const incentivoPatEfetivo = Math.min(incentivoPat, maxIncentivoPat);

  const saldoIrpj = totalIrpjApurado - incentivoPatEfetivo - irrfRetido - irrfEstimativas;
  const saldoIrpjRecolher = Math.max(0, saldoIrpj);
  const saldoNegativoIrpj = saldoIrpj < 0 ? Math.abs(saldoIrpj) : 0;

  // CSLL
  const baseCsllAntesPrej = lucroRealAntesPrej;
  const trava30Csll = Math.round(baseCsllAntesPrej * 0.30 * 100) / 100;
  const baseEfetivaCsll = Math.max(0, baseCsllAntesPrej - trava30Csll);
  const totalCsllApurada = Math.round(baseEfetivaCsll * 0.09 * 100) / 100;
  const saldoCsll = totalCsllApurada - csrfRetido - csllEstimativas;
  const saldoCsllRecolher = Math.max(0, saldoCsll);
  const saldoNegativoCsll = saldoCsll < 0 ? Math.abs(saldoCsll) : 0;

  const handleSalvarApuracao = () => {
    if (!demo) return;

    const novoDemo: DemonstrativoLucroRealEcfBlocoN = {
      ...demo,
      anoExercicio: ano,
      periodoApuracao: periodo as any,
      lucroLiquidoAntesTributosBRL: lucroLiquido,
      totalAdicoesLalurBRL: adicoesLalur,
      totalExclusoesLalurBRL: exclusoesLalur,
      lucroRealAntesPrejuizosBRL: lucroRealAntesPrej,
      compensacaoPrejuizosFiscaisTrava30BRL: trava30MaxPrej,
      baseCalculoEfetivaIrpjBRL: baseEfetivaIrpj,
      aliquotaBaseIrpj: 15.0,
      valorIrpjBaseBRL: irpjBase,
      limiteIsencaoAdicionalBRL: limiteAdicional,
      baseCalculoAdicionalIrpjBRL: baseAdicional,
      aliquotaAdicionalIrpj: 10.0,
      valorAdicionalIrpjBRL: irpjAdicional,
      totalIrpjApuradoBRL: totalIrpjApurado,
      deducaoPatAlimentacaoBRL: incentivoPatEfetivo,
      totalIncentivosFiscaisBRL: incentivoPatEfetivo,
      irpjRetidoFonteBRL: irrfRetido,
      irpjPagoEstimativasMensaisBRL: irrfEstimativas,
      saldoIrpjRecolherBRL: saldoIrpjRecolher,
      saldoNegativoIrpjCompensarBRL: saldoNegativoIrpj,
      resultadoContabilAntesCsllBRL: lucroLiquido,
      totalAdicoesLacsBRL: adicoesLalur,
      totalExclusoesLacsBRL: exclusoesLalur,
      baseCsllAntesCompensacaoBRL: baseCsllAntesPrej,
      compensacaoBaseNegativaCsllTrava30BRL: trava30Csll,
      baseCalculoEfetivaCsllBRL: baseEfetivaCsll,
      aliquotaCsll: 9.0,
      totalCsllApuradaBRL: totalCsllApurada,
      csllRetidaFonteBRL: csrfRetido,
      csllPagaEstimativasMensaisBRL: csllEstimativas,
      saldoCsllRecolherBRL: saldoCsllRecolher,
      saldoNegativoCsllCompensarBRL: saldoNegativoCsll,
      statusApuracao: 'ENCERRADO'
    };

    const res = dbService.salvarLucroRealEcfBlocoN(novoDemo);
    if (res.sucesso) {
      setDemo(novoDemo);
      setFeedback({ tipo: 'sucesso', texto: res.mensagem });
    }
  };

  const handleGerarTxtBlocoN = () => {
    const res = dbService.gerarArquivoEcfBlocoNTxt(empresaId, ano, periodo);
    if (res.sucesso) {
      setTxtGerado(res.txt);
      setActiveTab('GERADOR_TXT');
      setFeedback({ tipo: 'info', texto: res.mensagem });
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#121212] text-zinc-100 overflow-hidden font-sans">
      {/* HEADER PRINCIPAL */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#181818]">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-white">SPED ECF Bloco N - Lucro Real</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-medium">
                Manual ECF v10 & RIR/2018
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Cálculo do IRPJ (15% + Adicional 10% Art. 542) e CSLL (9% Lei 9.249) com LALUR/LACS e Trava dos 30%
            </p>
          </div>
        </div>

        {/* CONTROLES DO HEADER */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-[#242424] px-3 py-1.5 rounded-md border border-zinc-700">
            <Calendar className="w-4 h-4 text-zinc-400 mr-2" />
            <span className="text-xs text-zinc-400 mr-2">Exercício:</span>
            <select
              value={ano}
              onChange={e => setAno(Number(e.target.value))}
              className="bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer"
            >
              <option value={2026} className="bg-zinc-800">2026</option>
              <option value={2025} className="bg-zinc-800">2025</option>
            </select>
          </div>

          <div className="flex items-center bg-[#242424] px-3 py-1.5 rounded-md border border-zinc-700">
            <span className="text-xs text-zinc-400 mr-2">Período:</span>
            <select
              value={periodo}
              onChange={e => setPeriodo(e.target.value)}
              className="bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer"
            >
              <option value="1T" className="bg-zinc-800">1º Trimestre (Jan-Mar)</option>
              <option value="2T" className="bg-zinc-800">2º Trimestre (Abr-Jun)</option>
              <option value="3T" className="bg-zinc-800">3º Trimestre (Jul-Set)</option>
              <option value="4T" className="bg-zinc-800">4º Trimestre (Out-Dez)</option>
              <option value="ANUAL_DEZ" className="bg-zinc-800">Anual Ajuste (Dezembro)</option>
            </select>
          </div>

          <button
            onClick={handleSalvarApuracao}
            className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-semibold shadow-sm transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Salvar Apuração Bloco N</span>
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
      <div className="grid grid-cols-6 gap-3 px-6 py-3 bg-[#161616] border-b border-zinc-800 text-xs">
        <div className="p-3 bg-[#1e1e1e] rounded-lg border border-zinc-800">
          <div className="text-zinc-400 flex items-center justify-between">
            <span>Lucro Líquido Contábil</span>
            <DollarSign className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-base font-bold text-white mt-1">
            {formatBRL(lucroLiquido)}
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">
            DRE antes de IRPJ/CSLL
          </div>
        </div>

        <div className="p-3 bg-[#1e1e1e] rounded-lg border border-zinc-800">
          <div className="text-zinc-400 flex items-center justify-between">
            <span>Lucro Real (LALUR)</span>
            <BookOpen className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-base font-bold text-purple-400 mt-1">
            {formatBRL(lucroRealAntesPrej)}
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">
            + {formatBRL(adicoesLalur)} - {formatBRL(exclusoesLalur)}
          </div>
        </div>

        <div className="p-3 bg-[#1e1e1e] rounded-lg border border-zinc-800">
          <div className="text-zinc-400 flex items-center justify-between">
            <span>Trava 30% Prejuízos</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-base font-bold text-amber-400 mt-1">
            {formatBRL(trava30MaxPrej)}
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">
            Art. 580 RIR/2018
          </div>
        </div>

        <div className="p-3 bg-[#1e1e1e] rounded-lg border border-zinc-800">
          <div className="text-zinc-400 flex items-center justify-between">
            <span>Base Efetiva IRPJ</span>
            <Scale className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-base font-bold text-blue-400 mt-1">
            {formatBRL(baseEfetivaIrpj)}
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">
            Excedente: {formatBRL(baseAdicional)}
          </div>
        </div>

        <div className="p-3 bg-amber-950/20 rounded-lg border border-amber-500/30">
          <div className="text-amber-300 flex items-center justify-between font-semibold">
            <span>DARF IRPJ a Recolher</span>
            <span className="px-1.5 py-0.2 bg-amber-500/30 text-amber-200 rounded text-[10px]">Cód 2456</span>
          </div>
          <div className="text-base font-extrabold text-amber-400 mt-1">
            {formatBRL(saldoIrpjRecolher)}
          </div>
          <div className="text-[10px] text-amber-300/80 mt-1">
            15% + 10% Adic - Incentivos
          </div>
        </div>

        <div className="p-3 bg-emerald-950/20 rounded-lg border border-emerald-500/30">
          <div className="text-emerald-300 flex items-center justify-between font-semibold">
            <span>DARF CSLL a Recolher</span>
            <span className="px-1.5 py-0.2 bg-emerald-500/30 text-emerald-200 rounded text-[10px]">Cód 6773</span>
          </div>
          <div className="text-base font-extrabold text-emerald-400 mt-1">
            {formatBRL(saldoCsllRecolher)}
          </div>
          <div className="text-[10px] text-emerald-300/80 mt-1">
            9% sobre base ajustada
          </div>
        </div>
      </div>

      {/* TABS DE NAVEGAÇÃO */}
      <div className="flex items-center px-6 border-b border-zinc-800 bg-[#141414] text-xs">
        <button
          onClick={() => setActiveTab('APURACAO_IRPJ')}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium transition-colors ${
            activeTab === 'APURACAO_IRPJ'
              ? 'border-blue-500 text-blue-400 bg-zinc-800/40'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Apuração do IRPJ (Registros N500 / N600)</span>
        </button>

        <button
          onClick={() => setActiveTab('APURACAO_CSLL')}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium transition-colors ${
            activeTab === 'APURACAO_CSLL'
              ? 'border-blue-500 text-blue-400 bg-zinc-800/40'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Apuração da CSLL (Registros N650 / N660)</span>
        </button>

        <button
          onClick={() => setActiveTab('RELATORIO_A4')}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium transition-colors ${
            activeTab === 'RELATORIO_A4'
              ? 'border-blue-500 text-blue-400 bg-zinc-800/40'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>Demonstrativo Oficial Bloco N A4</span>
        </button>

        <button
          onClick={() => {
            handleGerarTxtBlocoN();
          }}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium transition-colors ${
            activeTab === 'GERADOR_TXT'
              ? 'border-blue-500 text-blue-400 bg-zinc-800/40'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Arquivo TXT SPED ECF (Bloco N)</span>
        </button>
      </div>

      {/* ÁREA DE CONTEÚDO */}
      <div className="flex-1 overflow-auto p-6 bg-[#121212]">
        {/* ABA 1: APURAÇÃO IRPJ */}
        {activeTab === 'APURACAO_IRPJ' && (
          <div className="max-w-4xl mx-auto space-y-4 text-xs">
            {/* MEMÓRIA DE CÁLCULO EDITÁVEL */}
            <div className="bg-[#181818] p-5 rounded-lg border border-zinc-800 space-y-4">
              <div className="border-b border-zinc-800 pb-2">
                <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Calculator className="w-4 h-4 text-blue-400" />
                  <span>Registro N500: Base de Cálculo do IRPJ sobre o Lucro Real</span>
                </h2>
                <p className="text-zinc-400 mt-0.5">
                  Preenchimento dos ajustes do LALUR Parte A e aplicação da trava de 30% na compensação de prejuízos fiscais.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-zinc-400 mb-1">Lucro Líquido Contábil (DRE):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={lucroLiquido}
                    onChange={e => setLucroLiquido(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#242424] border border-zinc-700 rounded p-2 text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">(+) Adições LALUR Parte A:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={adicoesLalur}
                    onChange={e => setAdicoesLalur(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#242424] border border-zinc-700 rounded p-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">(-) Exclusões LALUR Parte A:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={exclusoesLalur}
                    onChange={e => setExclusoesLalur(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#242424] border border-zinc-700 rounded p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-800/80">
                <div className="p-3 bg-[#202020] rounded border border-zinc-700">
                  <span className="text-zinc-500 block text-[11px]">Lucro Real Antes de Compensação:</span>
                  <strong className="text-white text-sm font-mono">{formatBRL(lucroRealAntesPrej)}</strong>
                </div>

                <div className="p-3 bg-[#202020] rounded border border-zinc-700">
                  <span className="text-zinc-500 block text-[11px]">Compensação de Prejuízos Fiscais (Trava 30%):</span>
                  <strong className="text-amber-400 text-sm font-mono">- {formatBRL(trava30MaxPrej)}</strong>
                </div>
              </div>

              <div className="p-3 bg-blue-950/20 border border-blue-500/30 rounded flex justify-between items-center">
                <div>
                  <span className="text-zinc-400 block text-[11px]">Base Efetiva de Cálculo do IRPJ:</span>
                  <strong className="text-blue-300 font-mono text-base">{formatBRL(baseEfetivaIrpj)}</strong>
                </div>
                <div className="text-right">
                  <span className="text-zinc-400 block text-[11px]">Base do Adicional de IRPJ (Excedente a R$ 60k/trimestre):</span>
                  <strong className="text-white font-mono text-sm">{formatBRL(baseAdicional)}</strong>
                </div>
              </div>
            </div>

            {/* REGISTRO N600: CÁLCULO E DEDUÇÕES */}
            <div className="bg-[#181818] p-5 rounded-lg border border-zinc-800 space-y-4">
              <div className="border-b border-zinc-800 pb-2">
                <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Landmark className="w-4 h-4 text-amber-400" />
                  <span>Registro N600: Demonstração do IRPJ Devido e Deduções Legais</span>
                </h2>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-[#202020] rounded border border-zinc-700">
                  <span className="text-zinc-500 block text-[11px]">IRPJ Alíquota Padrão (15%):</span>
                  <strong className="text-white font-mono text-sm">{formatBRL(irpjBase)}</strong>
                </div>

                <div className="p-3 bg-[#202020] rounded border border-zinc-700">
                  <span className="text-zinc-500 block text-[11px]">Adicional de IRPJ (10%):</span>
                  <strong className="text-white font-mono text-sm">{formatBRL(irpjAdicional)}</strong>
                </div>

                <div className="p-3 bg-[#202020] rounded border border-zinc-700">
                  <span className="text-zinc-500 block text-[11px]">Total IRPJ Apurado:</span>
                  <strong className="text-amber-400 font-mono text-sm font-bold">{formatBRL(totalIrpjApurado)}</strong>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-zinc-400 mb-1">Incentivo PAT (Lei 6.321/76):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={incentivoPat}
                    onChange={e => setIncentivoPat(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#242424] border border-zinc-700 rounded p-2 text-white font-mono"
                  />
                  <span className="text-[10px] text-zinc-500 mt-0.5 block">Limite legal 4%: {formatBRL(maxIncentivoPat)}</span>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">IRRF Retido na Fonte (Aplicações/Serviços):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={irrfRetido}
                    onChange={e => setIrrfRetido(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#242424] border border-zinc-700 rounded p-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Estimativas Mensais Pagas:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={irrfEstimativas}
                    onChange={e => setIrrfEstimativas(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#242424] border border-zinc-700 rounded p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-zinc-400 block text-xs">Saldo de IRPJ a Recolher via DARF:</span>
                  <strong className="text-xl font-bold text-amber-400 font-mono">{formatBRL(saldoIrpjRecolher)}</strong>
                  <span className="text-[11px] text-zinc-500 block">Código de Receita: 2456 (Trimestral) | Vencimento: 30/04/2026</span>
                </div>
                {saldoNegativoIrpj > 0 && (
                  <div className="text-right">
                    <span className="text-zinc-400 block text-xs">Saldo Negativo a Compensar (PER/DCOMP):</span>
                    <strong className="text-lg font-bold text-emerald-400 font-mono">{formatBRL(saldoNegativoIrpj)}</strong>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: APURAÇÃO CSLL */}
        {activeTab === 'APURACAO_CSLL' && (
          <div className="max-w-4xl mx-auto space-y-4 text-xs">
            <div className="bg-[#181818] p-5 rounded-lg border border-zinc-800 space-y-4">
              <div className="border-b border-zinc-800 pb-2">
                <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Scale className="w-4 h-4 text-emerald-400" />
                  <span>Registros N650 / N660: Apuração da CSLL no Lucro Real (LACS Parte A)</span>
                </h2>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-[#202020] rounded border border-zinc-700">
                  <span className="text-zinc-500 block text-[11px]">Base de Cálculo Antes de Compensação:</span>
                  <strong className="text-white font-mono text-sm">{formatBRL(baseCsllAntesPrej)}</strong>
                </div>

                <div className="p-3 bg-[#202020] rounded border border-zinc-700">
                  <span className="text-zinc-500 block text-[11px]">Compensação de Base Negativa (30%):</span>
                  <strong className="text-amber-400 font-mono text-sm">- {formatBRL(trava30Csll)}</strong>
                </div>

                <div className="p-3 bg-[#202020] rounded border border-zinc-700">
                  <span className="text-zinc-500 block text-[11px]">Base Efetiva da CSLL:</span>
                  <strong className="text-emerald-400 font-mono text-sm font-bold">{formatBRL(baseEfetivaCsll)}</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 mb-1">CSLL Retida na Fonte (CSRF 1% - Cód. 5952):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={csrfRetido}
                    onChange={e => setCsrfRetido(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#242424] border border-zinc-700 rounded p-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">CSLL Paga por Estimativa Mensal:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={csllEstimativas}
                    onChange={e => setCsllEstimativas(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#242424] border border-zinc-700 rounded p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-zinc-400 block text-xs">CSLL Total Apurada (9%):</span>
                  <strong className="text-base text-zinc-200 font-mono">{formatBRL(totalCsllApurada)}</strong>
                  <span className="text-[11px] text-zinc-500 block">Alíquota geral de 9% (Lei nº 9.249/1995)</span>
                </div>
                <div className="text-right">
                  <span className="text-zinc-400 block text-xs">Saldo de CSLL a Recolher via DARF:</span>
                  <strong className="text-xl font-bold text-emerald-400 font-mono">{formatBRL(saldoCsllRecolher)}</strong>
                  <span className="text-[11px] text-zinc-500 block">Código: 6773 | Vencimento: 30/04/2026</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 3: RELATÓRIO A4 */}
        {activeTab === 'RELATORIO_A4' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-[#181818] p-3 rounded-lg border border-zinc-800 text-xs">
              <div className="flex items-center space-x-2">
                <Printer className="w-4 h-4 text-blue-400" />
                <span className="font-semibold text-white">Demonstrativo Oficial de Apuração do Lucro Real (Modelo A4 SPED ECF)</span>
              </div>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold flex items-center space-x-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Relatório</span>
              </button>
            </div>

            {/* FOLHA A4 TIMBRADA */}
            <div className="max-w-4xl mx-auto bg-white text-zinc-900 p-8 rounded shadow-2xl font-sans text-xs border border-zinc-300">
              <div className="text-center border-b-2 border-black pb-3 mb-4">
                <div className="font-bold text-sm uppercase">SISTEMA PÚBLICO DE ESCRITURAÇÃO DIGITAL - SPED ECF</div>
                <div className="font-extrabold text-base uppercase text-zinc-800 mt-1">
                  DEMONSTRATIVO OFICIAL DO CÁLCULO DO IRPJ E DA CSLL - LUCRO REAL (BLOCO N)
                </div>
                <div className="text-[11px] text-zinc-600 mt-0.5">
                  Ano-Calendário: <strong>{ano}</strong> | Período: <strong>{periodo}</strong> | Instrução Normativa RFB nº 2.004/2021
                </div>
              </div>

              {/* IDENTIFICAÇÃO */}
              <div className="border border-zinc-400 rounded p-3 mb-4">
                <div className="font-bold text-zinc-800 mb-1 text-[11px] uppercase">1. Identificação da Pessoa Jurídica</div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <span className="text-zinc-500 block text-[10px]">Razão Social:</span>
                    <strong className="text-zinc-900">INDÚSTRIA E COMÉRCIO CONTÁBIL STUDIO PRO S/A</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">CNPJ:</span>
                    <strong className="text-zinc-900 font-mono">12.345.678/0001-90</strong>
                  </div>
                </div>
              </div>

              {/* DEMONSTRATIVO IRPJ */}
              <div className="border border-zinc-400 rounded p-3 mb-4">
                <div className="font-bold text-zinc-800 mb-2 text-[11px] uppercase">2. Apuração do IRPJ sobre o Lucro Real (Registros N500 / N600)</div>
                <table className="w-full text-left text-xs">
                  <tbody className="divide-y divide-zinc-200 font-mono">
                    <tr>
                      <td className="p-1.5 font-sans">Lucro Líquido do Período antes do IRPJ e da CSLL (DRE)</td>
                      <td className="p-1.5 text-right font-bold text-zinc-900">{formatBRL(lucroLiquido)}</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 font-sans">(+) Adições ao Lucro Real (LALUR Parte A)</td>
                      <td className="p-1.5 text-right text-zinc-700">{formatBRL(adicoesLalur)}</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 font-sans">(-) Exclusões do Lucro Real (LALUR Parte A)</td>
                      <td className="p-1.5 text-right text-zinc-700">- {formatBRL(exclusoesLalur)}</td>
                    </tr>
                    <tr className="bg-zinc-50 font-bold">
                      <td className="p-1.5 font-sans">(=) Lucro Real do Período antes da Compensação</td>
                      <td className="p-1.5 text-right">{formatBRL(lucroRealAntesPrej)}</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 font-sans">(-) Compensação de Prejuízos Fiscais (Limite Legal 30% - Art. 580 RIR)</td>
                      <td className="p-1.5 text-right text-amber-800">- {formatBRL(trava30MaxPrej)}</td>
                    </tr>
                    <tr className="bg-zinc-100 font-bold text-zinc-900">
                      <td className="p-1.5 font-sans">(=) Base de Cálculo Efetiva do IRPJ</td>
                      <td className="p-1.5 text-right">{formatBRL(baseEfetivaIrpj)}</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 font-sans">IRPJ Alíquota Básica (15%)</td>
                      <td className="p-1.5 text-right">{formatBRL(irpjBase)}</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 font-sans">Adicional de IRPJ (10% sobre base excedente a R$ 60.000,00)</td>
                      <td className="p-1.5 text-right">{formatBRL(irpjAdicional)}</td>
                    </tr>
                    <tr className="bg-zinc-50 font-bold">
                      <td className="p-1.5 font-sans">Total IRPJ Devido</td>
                      <td className="p-1.5 text-right text-amber-800">{formatBRL(totalIrpjApurado)}</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 font-sans">(-) Deduções de Incentivos Fiscais (PAT Lei 6.321/76)</td>
                      <td className="p-1.5 text-right text-emerald-800">- {formatBRL(incentivoPatEfetivo)}</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 font-sans">(-) IRRF Retido na Fonte</td>
                      <td className="p-1.5 text-right text-emerald-800">- {formatBRL(irrfRetido)}</td>
                    </tr>
                    <tr className="bg-zinc-200 font-extrabold text-sm text-zinc-900">
                      <td className="p-1.5 font-sans">(=) SALDO DE IRPJ A RECOLHER (DARF CÓDIGO 2456)</td>
                      <td className="p-1.5 text-right">{formatBRL(saldoIrpjRecolher)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* DEMONSTRATIVO CSLL */}
              <div className="border border-zinc-400 rounded p-3 mb-6">
                <div className="font-bold text-zinc-800 mb-2 text-[11px] uppercase">3. Apuração da CSLL sobre o Lucro Real (Registros N650 / N660)</div>
                <table className="w-full text-left text-xs">
                  <tbody className="divide-y divide-zinc-200 font-mono">
                    <tr>
                      <td className="p-1.5 font-sans">Base de Cálculo da CSLL antes de Compensação</td>
                      <td className="p-1.5 text-right font-bold text-zinc-900">{formatBRL(baseCsllAntesPrej)}</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 font-sans">(-) Compensação de Base Negativa de CSLL (Limite 30%)</td>
                      <td className="p-1.5 text-right text-amber-800">- {formatBRL(trava30Csll)}</td>
                    </tr>
                    <tr className="bg-zinc-100 font-bold text-zinc-900">
                      <td className="p-1.5 font-sans">(=) Base de Cálculo Efetiva da CSLL</td>
                      <td className="p-1.5 text-right">{formatBRL(baseEfetivaCsll)}</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 font-sans">CSLL Devida à Alíquota Geral de 9%</td>
                      <td className="p-1.5 text-right">{formatBRL(totalCsllApurada)}</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 font-sans">(-) CSLL Retida na Fonte (CSRF 1% Cód. 5952)</td>
                      <td className="p-1.5 text-right text-emerald-800">- {formatBRL(csrfRetido)}</td>
                    </tr>
                    <tr className="bg-zinc-200 font-extrabold text-sm text-zinc-900">
                      <td className="p-1.5 font-sans">(=) SALDO DE CSLL A RECOLHER (DARF CÓDIGO 6773)</td>
                      <td className="p-1.5 text-right">{formatBRL(saldoCsllRecolher)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* ASSINATURAS */}
              <div className="grid grid-cols-2 gap-8 text-center pt-8 border-t border-zinc-300">
                <div>
                  <div className="border-b border-zinc-500 w-3/4 mx-auto mb-1"></div>
                  <div className="text-[11px] font-bold text-zinc-800">DIRETORIA EXECUTIVA / ADMINISTRADOR</div>
                  <div className="text-[10px] text-zinc-500">Contribuinte Responsável</div>
                </div>
                <div>
                  <div className="border-b border-zinc-500 w-3/4 mx-auto mb-1"></div>
                  <div className="text-[11px] font-bold text-zinc-800">CONTADOR RESPONSÁVEL</div>
                  <div className="text-[10px] text-zinc-500">CRC Habilitado</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 4: GERADOR TXT */}
        {activeTab === 'GERADOR_TXT' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-[#181818] p-3 rounded-lg border border-zinc-800 text-xs">
              <div className="flex items-center space-x-2">
                <FileCode className="w-4 h-4 text-blue-400" />
                <span className="font-semibold text-white">Arquivo Oficial do Bloco N do SPED ECF (Validação PVA RFB)</span>
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
                    a.download = `SPED_ECF_BLOCO_N_${ano}_${periodo}.txt`;
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
                {txtGerado || 'Clique em "Arquivo TXT SPED ECF" para gerar o Bloco N oficial.'}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
