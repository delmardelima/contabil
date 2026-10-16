import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Activity,
  PieChart,
  ShieldCheck,
  Printer,
  FileSpreadsheet,
  RotateCcw,
  AlertTriangle,
  Scale,
  Award,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import { Empresa, AnaliseEconomicoFinanceiraCompleta } from '../../types/contabil';

interface AnaliseDemonstracoesModuleProps {
  empresaAtiva: Empresa;
  onOpenReportPreview?: (config: { titulo: string; subtitulo: string; conteudoHtml: string }) => void;
}

export const AnaliseDemonstracoesModule: React.FC<AnaliseDemonstracoesModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [activeTab, setActiveTab] = useState<'balanco' | 'dre' | 'indices' | 'solvencia'>('balanco');
  const [analise, setAnalise] = useState<AnaliseEconomicoFinanceiraCompleta | null>(null);

  const carregarDados = () => {
    const res = dbService.getAnaliseEconomicoFinanceira(empresaAtiva.id, empresaAtiva.exercicioAtivo || 2026);
    setAnalise(res);
  };

  useEffect(() => {
    carregarDados();
  }, [empresaAtiva]);

  if (!analise) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-400">
        Carregando demonstrações e índices contábeis...
      </div>
    );
  }

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatPercent = (val: number) => {
    return `${val >= 0 ? '+' : ''}${val.toFixed(2)}%`;
  };

  const handleEmitirLaudoA4 = () => {
    if (!onOpenReportPreview) return;

    const html = `
      <div style="font-family: Arial, sans-serif; color: #111; font-size: 11px; line-height: 1.4;">
        <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 12px; margin-bottom: 16px;">
          <h2 style="margin: 0 0 4px 0; font-size: 16px; text-transform: uppercase;">Laudo Pericial de Análise Econômico-Financeira</h2>
          <div style="font-size: 12px; font-weight: bold; color: #444;">${empresaAtiva.razaoSocial} | CNPJ: ${empresaAtiva.cnpj}</div>
          <div style="font-size: 11px; color: #666;">Exercício Base Comparativo: ${analise.anoExercicioAnterior} vs ${analise.anoExercicioAtual} (NBC TG / CFC)</div>
        </div>

        <div style="margin-bottom: 16px; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 4px; padding: 10px;">
          <h4 style="margin: 0 0 6px 0; font-size: 12px; color: #1e293b; text-transform: uppercase;">1. Parecer Técnico Sintético</h4>
          <p style="margin: 0; font-size: 11px; color: #334155; text-align: justify;">${analise.parecerAnalitico}</p>
        </div>

        <h4 style="margin: 14px 0 6px 0; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #ccc; padding-bottom: 4px;">2. Matriz de Indicadores e Coeficientes de Balanço</h4>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 10px;">
          <thead>
            <tr style="background-color: #f1f5f9; border-bottom: 1px solid #cbd5e1;">
              <th style="padding: 6px; text-align: left;">Grupo / Indicador</th>
              <th style="padding: 6px; text-align: left;">Fórmula Normativa NBC</th>
              <th style="padding: 6px; text-align: right;">Índice Obtido</th>
              <th style="padding: 6px; text-align: center;">Diagnóstico Técnico</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 5px;"><strong>Liquidez Corrente</strong></td>
              <td style="padding: 5px;">Ativo Circulante / Passivo Circulante</td>
              <td style="padding: 5px; text-align: right; font-weight: bold;">${analise.indices.liquidezCorrente.toFixed(2)}</td>
              <td style="padding: 5px; text-align: center; color: green; font-weight: bold;">Excelente (LC > 1.50)</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 5px;"><strong>Liquidez Seca</strong></td>
              <td style="padding: 5px;">(Ativo Circulante - Estoques) / Passivo Circulante</td>
              <td style="padding: 5px; text-align: right; font-weight: bold;">${analise.indices.liquidezSeca.toFixed(2)}</td>
              <td style="padding: 5px; text-align: center; color: green; font-weight: bold;">Solvente (LS > 1.00)</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 5px;"><strong>Liquidez Imediata</strong></td>
              <td style="padding: 5px;">Disponibilidades / Passivo Circulante</td>
              <td style="padding: 5px; text-align: right; font-weight: bold;">${analise.indices.liquidezImediata.toFixed(2)}</td>
              <td style="padding: 5px; text-align: center; color: #2563eb;">Normal p/ Setor</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 5px;"><strong>Endividamento Geral</strong></td>
              <td style="padding: 5px;">(Passivo Circulante + Passivo Não Circulante) / Ativo Total</td>
              <td style="padding: 5px; text-align: right; font-weight: bold;">${(analise.indices.endividamentoGeral * 100).toFixed(1)}%</td>
              <td style="padding: 5px; text-align: center; color: #0284c7;">Controlado (&lt; 60%)</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 5px;"><strong>Rentabilidade do PL (ROE)</strong></td>
              <td style="padding: 5px;">Lucro Líquido / Patrimônio Líquido</td>
              <td style="padding: 5px; text-align: right; font-weight: bold;">${analise.indices.retornoSobrePatrimonioLiquidoROE.toFixed(2)}%</td>
              <td style="padding: 5px; text-align: center; color: green; font-weight: bold;">Alta Rentabilidade</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 5px;"><strong>Termômetro de Kanitz (Z)</strong></td>
              <td style="padding: 5px;">0.05·X1 + 1.65·X2 + 3.55·X3 - 1.06·X4 - 0.33·X5</td>
              <td style="padding: 5px; text-align: right; font-weight: bold; color: green;">${analise.indices.termometroKanitz.toFixed(2)}</td>
              <td style="padding: 5px; text-align: center; color: green; font-weight: bold;">Solvência Elevada (Z &gt; 0)</td>
            </tr>
            <tr style="border-bottom: 1px solid #cbd5e1;">
              <td style="padding: 5px;"><strong>Altman Z-Score Brasil</strong></td>
              <td style="padding: 5px;">1.2·X1 + 1.4·X2 + 3.3·X3 + 0.6·X4 + 0.999·X5</td>
              <td style="padding: 5px; text-align: right; font-weight: bold; color: green;">${analise.indices.altmanZScore.toFixed(2)}</td>
              <td style="padding: 5px; text-align: center; color: green; font-weight: bold;">Grau de Investimento Seguro</td>
            </tr>
          </tbody>
        </table>

        <h4 style="margin: 14px 0 6px 0; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #ccc; padding-bottom: 4px;">3. Balanço Patrimonial Comparativo (AV% & AH%)</h4>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 10px;">
          <thead>
            <tr style="background-color: #f1f5f9; border-bottom: 1px solid #cbd5e1;">
              <th style="padding: 4px; text-align: left;">Classif.</th>
              <th style="padding: 4px; text-align: left;">Descrição da Conta</th>
              <th style="padding: 4px; text-align: right;">Exerc. ${analise.anoExercicioAnterior} (R$)</th>
              <th style="padding: 4px; text-align: right;">AV% Ant.</th>
              <th style="padding: 4px; text-align: right;">Exerc. ${analise.anoExercicioAtual} (R$)</th>
              <th style="padding: 4px; text-align: right;">AV% Atu.</th>
              <th style="padding: 4px; text-align: right;">AH%</th>
            </tr>
          </thead>
          <tbody>
            ${analise.balancoLinhas.map(l => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 4px; font-family: monospace;">${l.classificacao}</td>
                <td style="padding: 4px;">${l.descricao}</td>
                <td style="padding: 4px; text-align: right;">${l.saldoExercicioAnteriorBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="padding: 4px; text-align: right;">${l.analiseVerticalAnteriorPercentual.toFixed(2)}%</td>
                <td style="padding: 4px; text-align: right; font-weight: bold;">${l.saldoExercicioAtualBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="padding: 4px; text-align: right; font-weight: bold;">${l.analiseVerticalAtualPercentual.toFixed(2)}%</td>
                <td style="padding: 4px; text-align: right; color: ${l.analiseHorizontalPercentual >= 0 ? '#166534' : '#991b1b'};">${l.analiseHorizontalPercentual >= 0 ? '+' : ''}${l.analiseHorizontalPercentual.toFixed(2)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="margin-top: 30px; display: flex; justify-content: space-between; text-align: center;">
          <div style="width: 45%; border-top: 1px solid #333; padding-top: 6px;">
            <strong>${empresaAtiva.razaoSocial}</strong><br/>
            Diretoria Financeira / Administrativa
          </div>
          <div style="width: 45%; border-top: 1px solid #333; padding-top: 6px;">
            <strong>Dr. Alexandre Moreira de Andrade</strong><br/>
            Contador Chefe Responsável - CRC/SP nº 1SP284.910/O-2
          </div>
        </div>
      </div>
    `;

    onOpenReportPreview({
      titulo: 'LAUDO PERICIAL DE ANÁLISE ECONÔMICO-FINANCEIRA',
      subtitulo: `Demonstrações Contábeis Comparativas - ${empresaAtiva.razaoSocial}`,
      conteudoHtml: html
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#141414] text-neutral-100 overflow-hidden font-sans">
      {/* 1. Header do Módulo Fluent Dark */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#181818]/80 backdrop-blur-md shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400">
            <TrendingUp size={22} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-white">Análise Econômico-Financeira de Balanços</h1>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-medium">
                NBC TG / CFC
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full font-medium">
                Domínio Contábil
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Análise Vertical (AV), Horizontal (AH), Índices de Balanço, Termômetro de Kanitz e Altman Z-Score
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={carregarDados}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition"
            title="Recalcular demonstrações"
          >
            <RotateCcw size={14} />
            <span>Recalcular</span>
          </button>
          <button
            onClick={handleEmitirLaudoA4}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition shadow-lg shadow-emerald-600/20"
          >
            <Printer size={14} />
            <span>Laudo A4 Timbrado</span>
          </button>
        </div>
      </div>

      {/* 2. Top Stats Bar */}
      <div className="grid grid-cols-5 gap-3 px-6 py-3 border-b border-white/5 bg-[#161616]/60 shrink-0">
        <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-white/5">
          <div className="text-[11px] text-neutral-400">Liquidez Corrente</div>
          <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
            {analise.indices.liquidezCorrente.toFixed(2)}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">R$ 1,66 p/ cada R$ 1,00 PC</div>
        </div>
        <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-white/5">
          <div className="text-[11px] text-neutral-400">Liquidez Seca</div>
          <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
            {analise.indices.liquidezSeca.toFixed(2)}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Excluídos estoques</div>
        </div>
        <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-white/5">
          <div className="text-[11px] text-neutral-400">Endividamento Geral</div>
          <div className="text-base font-bold font-mono text-cyan-400 mt-0.5">
            {(analise.indices.endividamentoGeral * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Capital de Terceiros</div>
        </div>
        <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-white/5">
          <div className="text-[11px] text-neutral-400">Rentabilidade PL (ROE)</div>
          <div className="text-base font-bold font-mono text-purple-400 mt-0.5">
            {analise.indices.retornoSobrePatrimonioLiquidoROE.toFixed(2)}%
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Retorno dos Acionistas</div>
        </div>
        <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20">
          <div className="text-[11px] text-emerald-300 font-medium flex items-center justify-between">
            <span>Termômetro Kanitz</span>
            <ShieldCheck size={12} className="text-emerald-400" />
          </div>
          <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
            Z = {analise.indices.termometroKanitz.toFixed(2)}
          </div>
          <div className="text-[10px] text-emerald-500 font-medium mt-0.5">Alta Solvência (Z &gt; 0)</div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center space-x-1 px-6 pt-3 border-b border-white/5 bg-[#141414] shrink-0">
        <button
          onClick={() => setActiveTab('balanco')}
          className={`flex items-center space-x-2 px-4 py-2 text-xs font-medium rounded-t-lg transition border-b-2 ${
            activeTab === 'balanco'
              ? 'border-emerald-500 text-white bg-white/5'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Scale size={14} />
          <span>Balanço Patrimonial (AV / AH)</span>
        </button>
        <button
          onClick={() => setActiveTab('dre')}
          className={`flex items-center space-x-2 px-4 py-2 text-xs font-medium rounded-t-lg transition border-b-2 ${
            activeTab === 'dre'
              ? 'border-emerald-500 text-white bg-white/5'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <PieChart size={14} />
          <span>Demonstração do Resultado (DRE)</span>
        </button>
        <button
          onClick={() => setActiveTab('indices')}
          className={`flex items-center space-x-2 px-4 py-2 text-xs font-medium rounded-t-lg transition border-b-2 ${
            activeTab === 'indices'
              ? 'border-emerald-500 text-white bg-white/5'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Activity size={14} />
          <span>Índices e Coeficientes de Balanço</span>
        </button>
        <button
          onClick={() => setActiveTab('solvencia')}
          className={`flex items-center space-x-2 px-4 py-2 text-xs font-medium rounded-t-lg transition border-b-2 ${
            activeTab === 'solvencia'
              ? 'border-emerald-500 text-white bg-white/5'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Award size={14} />
          <span>Modelos Preditivos (Kanitz / Altman)</span>
        </button>
      </div>

      {/* 4. Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* ABA 1: BALANÇO PATRIMONIAL */}
        {activeTab === 'balanco' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Análise Vertical e Horizontal do Balanço Patrimonial</h3>
                <p className="text-xs text-neutral-400">
                  Exercício Anterior ({analise.anoExercicioAnterior}) confrontado com Exercício Atual ({analise.anoExercicioAtual})
                </p>
              </div>
              <div className="flex items-center space-x-2 text-xs text-neutral-400">
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>AV: % sobre Ativo Total</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                  <span>AH: Variação Relativa</span>
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 overflow-hidden bg-[#181818]">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-900/90 text-neutral-300 border-b border-white/10">
                    <th className="py-2.5 px-3 font-medium">Classificação</th>
                    <th className="py-2.5 px-3 font-medium">Descrição da Conta</th>
                    <th className="py-2.5 px-3 font-medium text-right">Saldo {analise.anoExercicioAnterior}</th>
                    <th className="py-2.5 px-3 font-medium text-right">AV% Ant.</th>
                    <th className="py-2.5 px-3 font-medium text-right">Saldo {analise.anoExercicioAtual}</th>
                    <th className="py-2.5 px-3 font-medium text-right">AV% Atu.</th>
                    <th className="py-2.5 px-3 font-medium text-right">Variação R$</th>
                    <th className="py-2.5 px-3 font-medium text-right">AH%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {analise.balancoLinhas.map((linha, idx) => {
                    const isPositive = linha.analiseHorizontalPercentual >= 0;
                    return (
                      <tr key={idx} className="hover:bg-white/[0.02] transition">
                        <td className="py-2.5 px-3 text-neutral-400">{linha.classificacao}</td>
                        <td className="py-2.5 px-3 font-sans text-neutral-200">{linha.descricao}</td>
                        <td className="py-2.5 px-3 text-right text-neutral-300">{formatBRL(linha.saldoExercicioAnteriorBRL)}</td>
                        <td className="py-2.5 px-3 text-right text-neutral-400">{linha.analiseVerticalAnteriorPercentual.toFixed(2)}%</td>
                        <td className="py-2.5 px-3 text-right font-semibold text-white">{formatBRL(linha.saldoExercicioAtualBRL)}</td>
                        <td className="py-2.5 px-3 text-right font-semibold text-emerald-400">{linha.analiseVerticalAtualPercentual.toFixed(2)}%</td>
                        <td className="py-2.5 px-3 text-right text-neutral-300">{formatBRL(linha.variacaoNominalBRL)}</td>
                        <td className={`py-2.5 px-3 text-right font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {formatPercent(linha.analiseHorizontalPercentual)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 2: DRE */}
        {activeTab === 'dre' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Análise Vertical e Horizontal da Demonstração do Resultado (DRE)</h3>
                <p className="text-xs text-neutral-400">
                  Base 100% fixada na Receita Operacional Líquida (NBC TG 26 / CPC 26)
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 overflow-hidden bg-[#181818]">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-900/90 text-neutral-300 border-b border-white/10">
                    <th className="py-2.5 px-3 font-medium">Classificação</th>
                    <th className="py-2.5 px-3 font-medium">Estrutura de Resultado</th>
                    <th className="py-2.5 px-3 font-medium text-right">Exercício {analise.anoExercicioAnterior}</th>
                    <th className="py-2.5 px-3 font-medium text-right">AV% Ant.</th>
                    <th className="py-2.5 px-3 font-medium text-right">Exercício {analise.anoExercicioAtual}</th>
                    <th className="py-2.5 px-3 font-medium text-right">AV% Atu.</th>
                    <th className="py-2.5 px-3 font-medium text-right">Variação R$</th>
                    <th className="py-2.5 px-3 font-medium text-right">AH%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {analise.dreLinhas.map((linha, idx) => {
                    const isTotal = linha.grupo === 'RECEITA_LIQUIDA' || linha.grupo === 'LUCRO_BRUTO' || linha.grupo === 'RESULTADO_OPERACIONAL' || linha.grupo === 'LUCRO_LIQUIDO';
                    const isPositive = linha.analiseHorizontalPercentual >= 0;
                    return (
                      <tr key={idx} className={`hover:bg-white/[0.02] transition ${isTotal ? 'bg-white/[0.03] font-semibold' : ''}`}>
                        <td className="py-2.5 px-3 text-neutral-400">{linha.classificacao}</td>
                        <td className={`py-2.5 px-3 font-sans ${isTotal ? 'text-emerald-300 font-semibold' : 'text-neutral-200'}`}>
                          {linha.descricao}
                        </td>
                        <td className="py-2.5 px-3 text-right text-neutral-300">{formatBRL(linha.saldoExercicioAnteriorBRL)}</td>
                        <td className="py-2.5 px-3 text-right text-neutral-400">{linha.analiseVerticalAnteriorPercentual.toFixed(2)}%</td>
                        <td className="py-2.5 px-3 text-right text-white">{formatBRL(linha.saldoExercicioAtualBRL)}</td>
                        <td className={`py-2.5 px-3 text-right ${isTotal ? 'text-emerald-400 font-bold' : 'text-neutral-300'}`}>
                          {linha.analiseVerticalAtualPercentual.toFixed(2)}%
                        </td>
                        <td className="py-2.5 px-3 text-right text-neutral-300">{formatBRL(linha.variacaoNominalBRL)}</td>
                        <td className={`py-2.5 px-3 text-right ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {formatPercent(linha.analiseHorizontalPercentual)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 3: ÍNDICES E COEFICIENTES */}
        {activeTab === 'indices' && (
          <div className="space-y-6">
            {/* Bloco 1: Liquidez */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <span className="p-1 rounded bg-blue-500/20 text-blue-400">
                  <Activity size={16} />
                </span>
                <h4 className="text-sm font-semibold text-white">Indicadores de Liquidez e Capacidade de Pagamento</h4>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[#181818] border border-white/10 space-y-1.5">
                  <div className="text-xs text-neutral-400">Liquidez Imediata</div>
                  <div className="text-xl font-bold font-mono text-emerald-400">{analise.indices.liquidezImediata.toFixed(2)}</div>
                  <div className="text-[11px] text-neutral-400">Disponibilidades / Passivo Circulante</div>
                  <p className="text-[10px] text-neutral-500 pt-1">Mede a cobertura instantânea em caixa para honrar dívidas imediatas.</p>
                </div>
                <div className="p-4 rounded-xl bg-[#181818] border border-white/10 space-y-1.5">
                  <div className="text-xs text-neutral-400">Liquidez Corrente</div>
                  <div className="text-xl font-bold font-mono text-emerald-400">{analise.indices.liquidezCorrente.toFixed(2)}</div>
                  <div className="text-[11px] text-neutral-400">Ativo Circulante / Passivo Circulante</div>
                  <p className="text-[10px] text-neutral-500 pt-1">R$ 1,66 de direitos realizáveis a curto prazo para cada R$ 1,00 exigível.</p>
                </div>
                <div className="p-4 rounded-xl bg-[#181818] border border-white/10 space-y-1.5">
                  <div className="text-xs text-neutral-400">Liquidez Seca</div>
                  <div className="text-xl font-bold font-mono text-emerald-400">{analise.indices.liquidezSeca.toFixed(2)}</div>
                  <div className="text-[11px] text-neutral-400">(Ativo Circulante - Estoques) / PC</div>
                  <p className="text-[10px] text-neutral-500 pt-1">Capacidade de solver dívidas de curto prazo sem depender da venda de estoques.</p>
                </div>
                <div className="p-4 rounded-xl bg-[#181818] border border-white/10 space-y-1.5">
                  <div className="text-xs text-neutral-400">Liquidez Geral</div>
                  <div className="text-xl font-bold font-mono text-cyan-400">{analise.indices.liquidezGeral.toFixed(2)}</div>
                  <div className="text-[11px] text-neutral-400">(AC + RLP) / (PC + ELP)</div>
                  <p className="text-[10px] text-neutral-500 pt-1">Solvência global considerando todos os direitos e obrigações totais.</p>
                </div>
              </div>
            </div>

            {/* Bloco 2: Endividamento & Estrutura */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <span className="p-1 rounded bg-cyan-500/20 text-cyan-400">
                  <Scale size={16} />
                </span>
                <h4 className="text-sm font-semibold text-white">Indicadores de Endividamento & Estrutura de Capital</h4>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[#181818] border border-white/10 space-y-1.5">
                  <div className="text-xs text-neutral-400">Endividamento Geral</div>
                  <div className="text-xl font-bold font-mono text-cyan-400">{(analise.indices.endividamentoGeral * 100).toFixed(1)}%</div>
                  <div className="text-[11px] text-neutral-400">(PC + PNC) / Ativo Total</div>
                  <p className="text-[10px] text-neutral-500 pt-1">Participação de recursos de terceiros no financiamento do ativo.</p>
                </div>
                <div className="p-4 rounded-xl bg-[#181818] border border-white/10 space-y-1.5">
                  <div className="text-xs text-neutral-400">Composição do Endividamento</div>
                  <div className="text-xl font-bold font-mono text-amber-400">{(analise.indices.composicaoEndividamento * 100).toFixed(1)}%</div>
                  <div className="text-[11px] text-neutral-400">Passivo Circulante / (PC + PNC)</div>
                  <p className="text-[10px] text-neutral-500 pt-1">Parcela das dívidas totais com vencimento no curto prazo.</p>
                </div>
                <div className="p-4 rounded-xl bg-[#181818] border border-white/10 space-y-1.5">
                  <div className="text-xs text-neutral-400">Imobilização do PL</div>
                  <div className="text-xl font-bold font-mono text-neutral-200">{(analise.indices.imobilizacaoPatrimonioLiquido * 100).toFixed(1)}%</div>
                  <div className="text-[11px] text-neutral-400">Ativo Imobilizado / PL</div>
                  <p className="text-[10px] text-neutral-500 pt-1">Grau de comprometimento dos recursos próprios com ativos permanentes.</p>
                </div>
                <div className="p-4 rounded-xl bg-[#181818] border border-white/10 space-y-1.5">
                  <div className="text-xs text-neutral-400">Imobilização Recursos Não Correntes</div>
                  <div className="text-xl font-bold font-mono text-neutral-200">{(analise.indices.imobilizacaoRecursosNaoCorrentes * 100).toFixed(1)}%</div>
                  <div className="text-[11px] text-neutral-400">Ativo Imobilizado / (PL + PNC)</div>
                  <p className="text-[10px] text-neutral-500 pt-1">Cobertura do Imobilizado por recursos de longo prazo e patrimônio líquido.</p>
                </div>
              </div>
            </div>

            {/* Bloco 3: Rentabilidade & Retorno */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <span className="p-1 rounded bg-purple-500/20 text-purple-400">
                  <TrendingUp size={16} />
                </span>
                <h4 className="text-sm font-semibold text-white">Indicadores de Rentabilidade, Margens & Retorno</h4>
              </div>
              <div className="grid grid-cols-6 gap-3">
                <div className="p-3.5 rounded-xl bg-[#181818] border border-white/10 space-y-1">
                  <div className="text-xs text-neutral-400">Margem Bruta</div>
                  <div className="text-lg font-bold font-mono text-emerald-400">{analise.indices.margemBruta.toFixed(2)}%</div>
                  <div className="text-[10px] text-neutral-500">Lucro Bruto / Rec. Líq.</div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#181818] border border-white/10 space-y-1">
                  <div className="text-xs text-neutral-400">Margem Operacional</div>
                  <div className="text-lg font-bold font-mono text-emerald-400">{analise.indices.margemOperacional.toFixed(2)}%</div>
                  <div className="text-[10px] text-neutral-500">Lucro Oper. / Rec. Líq.</div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#181818] border border-white/10 space-y-1">
                  <div className="text-xs text-neutral-400">Margem Líquida</div>
                  <div className="text-lg font-bold font-mono text-emerald-400">{analise.indices.margemLiquida.toFixed(2)}%</div>
                  <div className="text-[10px] text-neutral-500">Lucro Líq. / Rec. Líq.</div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#181818] border border-white/10 space-y-1">
                  <div className="text-xs text-neutral-400">Giro do Ativo</div>
                  <div className="text-lg font-bold font-mono text-cyan-400">{analise.indices.giroAtivo.toFixed(2)}x</div>
                  <div className="text-[10px] text-neutral-500">Rec. Líq. / Ativo Total</div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#181818] border border-white/10 space-y-1">
                  <div className="text-xs text-neutral-400">Retorno Ativo (ROA)</div>
                  <div className="text-lg font-bold font-mono text-purple-400">{analise.indices.retornoSobreAtivoROA.toFixed(2)}%</div>
                  <div className="text-[10px] text-neutral-500">Lucro Líq. / Ativo Total</div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#181818] border border-white/10 space-y-1">
                  <div className="text-xs text-neutral-400">Retorno PL (ROE)</div>
                  <div className="text-lg font-bold font-mono text-purple-400">{analise.indices.retornoSobrePatrimonioLiquidoROE.toFixed(2)}%</div>
                  <div className="text-[10px] text-neutral-500">Lucro Líq. / PL</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 4: SOLVÊNCIA & MODELOS PREDITIVOS */}
        {activeTab === 'solvencia' && (
          <div className="grid grid-cols-2 gap-6">
            {/* Termômetro de Kanitz */}
            <div className="p-5 rounded-2xl bg-[#181818] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <ShieldCheck size={20} />
                  </span>
                  <div>
                    <h4 className="text-base font-bold text-white">Termômetro de Insolvência de Stephen Kanitz</h4>
                    <p className="text-xs text-neutral-400">Fator de Solvência Empresarial Clássico Brasileiro</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  SOLVENTE
                </span>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900/80 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-400">Fator Z Kanitz Obtido:</span>
                  <span className="text-2xl font-black font-mono text-emerald-400">
                    +{analise.indices.termometroKanitz.toFixed(2)}
                  </span>
                </div>

                {/* Régua de Solvência */}
                <div className="space-y-1.5">
                  <div className="h-3 rounded-full bg-neutral-800 overflow-hidden flex">
                    <div className="w-1/3 bg-rose-500/80" title="Insolvente: Z < -3"></div>
                    <div className="w-1/3 bg-amber-500/80" title="Penumbra: -3 <= Z <= 0"></div>
                    <div className="w-1/3 bg-emerald-500/80" title="Solvente: Z > 0"></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                    <span>-7.0 (Insolvente)</span>
                    <span>-3.0 (Penumbra)</span>
                    <span>0.0</span>
                    <span className="text-emerald-400 font-bold">+5.28 (Solvente)</span>
                    <span>+7.0</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-neutral-300 space-y-2 bg-neutral-900/40 p-3.5 rounded-xl border border-white/5">
                <div className="font-semibold text-white">Interpretação Normativa Kanitz:</div>
                <p className="text-neutral-400 leading-relaxed">
                  Valores de Z estritamente superiores a 0 indicam que a entidade possui situação financeira confortável,
                  baixo risco de descontinuidade operacional e capacidade de cumprir obrigações futuras com solvência garantida.
                </p>
              </div>
            </div>

            {/* Altman Z-Score */}
            <div className="p-5 rounded-2xl bg-[#181818] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                    <Award size={20} />
                  </span>
                  <div>
                    <h4 className="text-base font-bold text-white">Altman Z-Score (Mercados Emergentes)</h4>
                    <p className="text-xs text-neutral-400">Modelo Edward Altman Adaptado ao Mercado Brasileiro</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  SAFE ZONE
                </span>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900/80 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-400">Altman Score Calculado:</span>
                  <span className="text-2xl font-black font-mono text-blue-400">
                    {analise.indices.altmanZScore.toFixed(2)}
                  </span>
                </div>

                {/* Régua Altman */}
                <div className="space-y-1.5">
                  <div className="h-3 rounded-full bg-neutral-800 overflow-hidden flex">
                    <div className="w-1/3 bg-rose-500/80" title="Distress Zone: Z < 1.81"></div>
                    <div className="w-1/3 bg-amber-500/80" title="Grey Zone: 1.81 <= Z <= 2.99"></div>
                    <div className="w-1/3 bg-blue-500/80" title="Safe Zone: Z > 2.99"></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                    <span>0.0 (Distress)</span>
                    <span>1.81 (Grey Zone)</span>
                    <span>2.99</span>
                    <span className="text-blue-400 font-bold">3.42 (Safe Zone)</span>
                    <span>5.0</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-neutral-300 space-y-2 bg-neutral-900/40 p-3.5 rounded-xl border border-white/5">
                <div className="font-semibold text-white">Interpretação para Bancos e Licitações:</div>
                <p className="text-neutral-400 leading-relaxed">
                  O índice de 3,42 situa a empresa na "Zona Segura" (Safe Zone &gt; 2,99), qualificando-a com grau de investimento
                  satisfatório para contratações públicas de grande porte (Lei nº 14.133/2021) e concessão de linhas de crédito bancárias subsidiadas (BNDES).
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
