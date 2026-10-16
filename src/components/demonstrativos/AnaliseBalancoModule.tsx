import React, { useState, useMemo } from 'react';
import { Empresa, RelatorioAnaliseBalanco } from '../../types/contabil';
import { dbService } from '../../db/sqliteService';
import { exportToCSV } from '../../utils/exportUtils';
import {
  TrendingUp,
  Scale,
  ShieldCheck,
  AlertTriangle,
  Printer,
  FileSpreadsheet,
  Calendar,
  Layers,
  Percent,
  CheckCircle2,
  HelpCircle,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Compass,
  PieChart
} from 'lucide-react';

interface AnaliseBalancoModuleProps {
  empresa: Empresa;
  onOpenReportPreview?: (title: string, subtitle: string, content: React.ReactNode, orientation?: 'portrait' | 'landscape') => void;
}

export const AnaliseBalancoModule: React.FC<AnaliseBalancoModuleProps> = ({ empresa, onOpenReportPreview }) => {
  const [exercicio, setExercico] = useState<number>(empresa.exercicioAtivo || 2026);
  const [activeTab, setActiveTab] = useState<'PAINEL' | 'DEMONSTRACOES' | 'COEFICIENTES' | 'PARECER'>('PAINEL');
  const [filtroTipo, setFiltroTipo] = useState<'TODOS' | 'BALANCO' | 'DRE'>('TODOS');
  const [buscaConta, setBuscaConta] = useState('');

  // Obter relatório completo calculado pelo motor de contabilidade
  const analise: RelatorioAnaliseBalanco = useMemo(() => {
    return dbService.getAnaliseBalanco(empresa.id, exercicio);
  }, [empresa.id, exercicio]);

  const { liquidez, endividamento, rentabilidade, kanitz } = analise;

  const handleImprimirRelatorioA4 = () => {
    if (!onOpenReportPreview) return;

    const relatorioContent = (
      <div className="font-sans text-neutral-900 space-y-6 text-xs p-2">
        <div className="border-b-2 border-neutral-900 pb-3 flex justify-between items-start">
          <div>
            <h1 className="text-base font-bold uppercase tracking-wider text-neutral-900">
              RELATÓRIO DE ANÁLISE ECONÔMICO-FINANCEIRA & ÍNDICES DAS DEMONSTRAÇÕES
            </h1>
            <p className="text-[11px] text-neutral-600 font-medium">
              Conforme Normas Brasileiras de Contabilidade (NBC TG / CFC) • Exercício Base: {exercicio} vs. {exercicio - 1}
            </p>
          </div>
          <div className="text-right text-[10px] font-mono">
            <div>CNPJ: {empresa.cnpj}</div>
            <div>Competência: {exercicio}</div>
          </div>
        </div>

        {/* Diagnóstico de Kanitz */}
        <div className="p-3 bg-neutral-50 border border-neutral-300 rounded">
          <div className="font-bold uppercase text-[11px] mb-1 flex items-center justify-between">
            <span>Diagnóstico de Solvência Empresarial (Termômetro de Stephen Kanitz)</span>
            <span className="font-mono text-sm">Fator Z: {kanitz.fatorZ > 0 ? `+${kanitz.fatorZ}` : kanitz.fatorZ}</span>
          </div>
          <p className="text-neutral-700 leading-relaxed text-[11px]">
            <strong>Classificação:</strong> {kanitz.classificacao === 'SOLVENTE' ? 'EMPRESA SOLVENTE (Zona de Segurança Financeira)' : kanitz.classificacao === 'PENUMBRA_ALERTA' ? 'ZONA DE PENUMBRA (Atenção Moderada)' : 'ALTO RISCO DE INSOLVÊNCIA'}. {kanitz.interpretacao}
          </p>
        </div>

        {/* Quadro de Coeficientes e Índices */}
        <div>
          <h3 className="font-bold uppercase border-b border-neutral-400 pb-1 mb-2">1. Coeficientes e Índices Financeiros Fundamentais</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="border border-neutral-300 p-2 rounded">
              <div className="font-bold text-neutral-800 border-b pb-1 mb-1.5">ÍNDICES DE LIQUIDEZ</div>
              <div className="space-y-1">
                <div className="flex justify-between"><span>Liquidez Imediata:</span><span className="font-bold font-mono">{liquidez.liquidezImediata.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Liquidez Corrente:</span><span className="font-bold font-mono">{liquidez.liquidezCorrente.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Liquidez Seca:</span><span className="font-bold font-mono">{liquidez.liquidezSeca.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Liquidez Geral:</span><span className="font-bold font-mono">{liquidez.liquidezGeral.toFixed(2)}</span></div>
              </div>
            </div>

            <div className="border border-neutral-300 p-2 rounded">
              <div className="font-bold text-neutral-800 border-b pb-1 mb-1.5">ESTRUTURA & ENDIVIDAMENTO</div>
              <div className="space-y-1">
                <div className="flex justify-between"><span>Endividamento Geral:</span><span className="font-bold font-mono">{endividamento.endividamentoGeral.toFixed(2)}%</span></div>
                <div className="flex justify-between"><span>Part. Capital Terceiros:</span><span className="font-bold font-mono">{endividamento.participacaoCapitalTerceiros.toFixed(2)}%</span></div>
                <div className="flex justify-between"><span>Composição Curto Prazo:</span><span className="font-bold font-mono">{endividamento.composicaoEndividamentoCurtoPrazo.toFixed(2)}%</span></div>
                <div className="flex justify-between"><span>Imobilização do PL:</span><span className="font-bold font-mono">{endividamento.imobilizacaoPatrimonioLiquido.toFixed(2)}%</span></div>
              </div>
            </div>

            <div className="border border-neutral-300 p-2 rounded">
              <div className="font-bold text-neutral-800 border-b pb-1 mb-1.5">RENTABILIDADE & RETORNO</div>
              <div className="space-y-1">
                <div className="flex justify-between"><span>Giro do Ativo:</span><span className="font-bold font-mono">{rentabilidade.giroAtivo.toFixed(2)}x</span></div>
                <div className="flex justify-between"><span>Margem Operacional:</span><span className="font-bold font-mono">{rentabilidade.margemOperacional.toFixed(2)}%</span></div>
                <div className="flex justify-between"><span>Margem Líquida:</span><span className="font-bold font-mono">{rentabilidade.margemLiquida.toFixed(2)}%</span></div>
                <div className="flex justify-between"><span>ROA (Retorno s/ Ativo):</span><span className="font-bold font-mono">{rentabilidade.retornoSobreAtivo.toFixed(2)}%</span></div>
                <div className="flex justify-between"><span>ROE (Retorno s/ PL):</span><span className="font-bold font-mono">{rentabilidade.retornoSobrePatrimonioLiquido.toFixed(2)}%</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Demonstrações Sintéticas com AV% e AH% */}
        <div>
          <h3 className="font-bold uppercase border-b border-neutral-400 pb-1 mb-2">2. Análise Vertical (AV%) e Análise Horizontal (AH%) do Balanço Patrimonial</h3>
          <table className="w-full text-left border-collapse text-[10px]">
            <thead>
              <tr className="border-b border-neutral-900 bg-neutral-100 font-bold">
                <th className="py-1 px-1.5">Classificação</th>
                <th className="py-1 px-1.5">Descrição da Conta</th>
                <th className="py-1 px-1.5 text-right">Saldo {exercicio - 1}</th>
                <th className="py-1 px-1 text-right">AV% {exercicio - 1}</th>
                <th className="py-1 px-1.5 text-right">Saldo {exercicio}</th>
                <th className="py-1 px-1 text-right">AV% {exercicio}</th>
                <th className="py-1 px-1.5 text-right">Var. Nominal (R$)</th>
                <th className="py-1 px-1 text-right">AH%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 font-mono">
              {analise.itensAnaliseBalanco.map((it, idx) => (
                <tr key={idx} className={it.grau <= 2 ? 'font-bold bg-neutral-50/50' : ''}>
                  <td className="py-1 px-1.5">{it.classificacao}</td>
                  <td className="py-1 px-1.5 font-sans">{it.descricaoConta}</td>
                  <td className="py-1 px-1.5 text-right">R$ {it.saldoExercicioAnterior.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="py-1 px-1 text-right">{it.analiseVerticalAnteriorPercent.toFixed(1)}%</td>
                  <td className="py-1 px-1.5 text-right">R$ {it.saldoExercicioAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="py-1 px-1 text-right">{it.analiseVerticalAtualPercent.toFixed(1)}%</td>
                  <td className={`py-1 px-1.5 text-right ${it.variacaoHorizontalNominal < 0 ? 'text-rose-700' : ''}`}>
                    R$ {it.variacaoHorizontalNominal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className={`py-1 px-1 text-right font-bold ${it.analiseHorizontalPercent < 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                    {it.analiseHorizontalPercent > 0 ? `+${it.analiseHorizontalPercent.toFixed(1)}%` : `${it.analiseHorizontalPercent.toFixed(1)}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Parecer do Contador Responsável */}
        <div className="pt-8 border-t border-neutral-300 mt-6 grid grid-cols-2 gap-12 text-center text-[10px]">
          <div>
            <div className="border-t border-neutral-800 pt-1 font-bold">{empresa.responsavelLegal || 'DIRETORIA EXECUTIVA / REPRESENTANTE LEGAL'}</div>
            <div className="text-neutral-500 font-mono">CPF: {empresa.cpfResponsavel || '***.***.***-**'}</div>
          </div>
          <div>
            <div className="border-t border-neutral-800 pt-1 font-bold">{empresa.contadorNome || 'CONTADOR RESPONSÁVEL TÉCNICO'}</div>
            <div className="text-neutral-500 font-mono">CRC: {empresa.contadorCRC || 'CRC-SP 123456/O-0'} • CPF: {empresa.contadorCPF || '***.***.***-**'}</div>
          </div>
        </div>
      </div>
    );

    onOpenReportPreview(
      'RELATÓRIO DE ANÁLISE ECONÔMICO-FINANCEIRA & ÍNDICES (NBC TG)',
      `Empresa: ${empresa.razaoSocial} • Exercício ${exercicio} vs. ${exercicio - 1}`,
      relatorioContent,
      'portrait'
    );
  };

  const handleExportarCSV = () => {
    const rows = [
      ['RELATORIO DE ANALISE ECONOMICO-FINANCEIRA E COEFICIENTES CONTABEIS'],
      ['EMPRESA', empresa.razaoSocial],
      ['CNPJ', empresa.cnpj],
      ['EXERCICIO ATUAL', exercicio.toString()],
      ['EXERCICIO ANTERIOR', (exercicio - 1).toString()],
      [''],
      ['INDICES DE LIQUIDEZ', 'VALOR'],
      ['Liquidez Imediata', liquidez.liquidezImediata.toFixed(2)],
      ['Liquidez Corrente', liquidez.liquidezCorrente.toFixed(2)],
      ['Liquidez Seca', liquidez.liquidezSeca.toFixed(2)],
      ['Liquidez Geral', liquidez.liquidezGeral.toFixed(2)],
      [''],
      ['INDICES DE ENDIVIDAMENTO E ESTRUTURA', 'PERCENTUAL'],
      ['Endividamento Geral', `${endividamento.endividamentoGeral.toFixed(2)}%`],
      ['Participacao de Capital de Terceiros', `${endividamento.participacaoCapitalTerceiros.toFixed(2)}%`],
      ['Composicao do Endividamento a Curto Prazo', `${endividamento.composicaoEndividamentoCurtoPrazo.toFixed(2)}%`],
      ['Imobilizacao do Patrimonio Liquido', `${endividamento.imobilizacaoPatrimonioLiquido.toFixed(2)}%`],
      [''],
      ['INDICES DE RENTABILIDADE', 'VALOR'],
      ['Giro do Ativo', `${rentabilidade.giroAtivo.toFixed(2)}x`],
      ['Margem Operacional', `${rentabilidade.margemOperacional.toFixed(2)}%`],
      ['Margem Liquida', `${rentabilidade.margemLiquida.toFixed(2)}%`],
      ['Retorno sobre Ativo (ROA)', `${rentabilidade.retornoSobreAtivo.toFixed(2)}%`],
      ['Retorno sobre Patrimonio Liquido (ROE)', `${rentabilidade.retornoSobrePatrimonioLiquido.toFixed(2)}%`],
      [''],
      ['TERMOMETRO DE KANITZ', 'CLASSIFICACAO'],
      ['Fator Z de Solvencia', kanitz.fatorZ.toFixed(2)],
      ['Situacao', kanitz.classificacao]
    ];
    exportToCSV(rows, `Analise_Economico_Financeira_${empresa.codigo}_${exercicio}.csv`);
  };

  const itensFiltrados = useMemo(() => {
    let list = filtroTipo === 'DRE' ? analise.itensAnaliseDRE : filtroTipo === 'BALANCO' ? analise.itensAnaliseBalanco : [...analise.itensAnaliseBalanco, ...analise.itensAnaliseDRE];
    if (buscaConta.trim()) {
      const q = buscaConta.toLowerCase();
      list = list.filter(i => i.descricaoConta.toLowerCase().includes(q) || i.classificacao.includes(q));
    }
    return list;
  }, [analise, filtroTipo, buscaConta]);

  return (
    <div className="h-full flex flex-col bg-[#141414] text-neutral-200 select-none overflow-hidden font-sans">
      {/* Top Bar Header */}
      <div className="p-4 bg-[#181818] border-b border-white/5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-neutral-100">Análise Econômico-Financeira & Índices</h1>
              <span className="px-2 py-0.5 text-[10px] bg-blue-500/20 text-blue-300 rounded-full font-mono border border-blue-500/30">
                NBC TG / CFC
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Análise Vertical/Horizontal do Balanço e DRE, Índices de Liquidez, Endividamento, ROA/ROE e Termômetro de Kanitz
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 bg-[#202020] px-3 py-1.5 rounded-lg border border-white/10 text-xs">
            <Calendar className="w-4 h-4 text-neutral-400" />
            <span className="text-neutral-400">Exercício Base:</span>
            <select
              value={exercicio}
              onChange={(e) => setExercico(Number(e.target.value))}
              className="bg-transparent text-neutral-100 font-bold focus:outline-none cursor-pointer"
            >
              <option value={2026} className="bg-[#202020]">2026 vs 2025</option>
              <option value={2025} className="bg-[#202020]">2025 vs 2024</option>
            </select>
          </div>

          <button
            onClick={handleExportarCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-white/10 text-xs transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handleImprimirRelatorioA4}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-lg shadow-blue-500/20 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Relatório A4</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 bg-[#171717] px-4">
        <button
          onClick={() => setActiveTab('PAINEL')}
          className={`flex items-center space-x-2 py-3 px-4 text-xs font-medium border-b-2 transition ${
            activeTab === 'PAINEL'
              ? 'border-blue-500 text-blue-400 bg-white/5'
              : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Painel Executivo & Kanitz</span>
        </button>

        <button
          onClick={() => setActiveTab('DEMONSTRACOES')}
          className={`flex items-center space-x-2 py-3 px-4 text-xs font-medium border-b-2 transition ${
            activeTab === 'DEMONSTRACOES'
              ? 'border-blue-500 text-blue-400 bg-white/5'
              : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Análise Vertical & Horizontal (AV / AH)</span>
        </button>

        <button
          onClick={() => setActiveTab('COEFICIENTES')}
          className={`flex items-center space-x-2 py-3 px-4 text-xs font-medium border-b-2 transition ${
            activeTab === 'COEFICIENTES'
              ? 'border-blue-500 text-blue-400 bg-white/5'
              : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
          }`}
        >
          <Percent className="w-4 h-4" />
          <span>Matriz de Índices & Fórmulas Legais</span>
        </button>

        <button
          onClick={() => setActiveTab('PARECER')}
          className={`flex items-center space-x-2 py-3 px-4 text-xs font-medium border-b-2 transition ${
            activeTab === 'PARECER'
              ? 'border-blue-500 text-blue-400 bg-white/5'
              : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Parecer Técnico do Contador</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {/* ABA 1: PAINEL EXECUTIVO & KANITZ */}
        {activeTab === 'PAINEL' && (
          <div className="space-y-4">
            {/* Termômetro de Kanitz Card Hero */}
            <div className={`p-4 rounded-xl border ${
              kanitz.classificacao === 'SOLVENTE'
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                : kanitz.classificacao === 'PENUMBRA_ALERTA'
                ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                : 'bg-rose-950/20 border-rose-500/30 text-rose-200'
            }`}>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center space-x-3.5">
                  <div className={`p-3 rounded-xl border ${
                    kanitz.classificacao === 'SOLVENTE'
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                      : kanitz.classificacao === 'PENUMBRA_ALERTA'
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                      : 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                  }`}>
                    {kanitz.classificacao === 'SOLVENTE' ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <AlertTriangle className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-wider opacity-75">
                      Diagnóstico de Solvência Empresarial • Termômetro de Stephen Kanitz
                    </div>
                    <div className="text-xl font-black flex items-center space-x-2">
                      <span>{kanitz.classificacao === 'SOLVENTE' ? 'EMPRESA SOLVENTE' : kanitz.classificacao === 'PENUMBRA_ALERTA' ? 'ZONA DE PENUMBRA (ALERTA)' : 'ALTO RISCO DE INSOLVÊNCIA'}</span>
                      <span className="text-xs font-mono font-normal opacity-75">
                        (Fator Z = {kanitz.fatorZ > 0 ? `+${kanitz.fatorZ}` : kanitz.fatorZ})
                      </span>
                    </div>
                    <p className="text-xs mt-1 max-w-3xl opacity-90 leading-relaxed font-sans">
                      {kanitz.interpretacao}
                    </p>
                  </div>
                </div>

                <div className="bg-black/30 px-4 py-2.5 rounded-lg border border-white/5 text-right font-mono flex-shrink-0">
                  <div className="text-[10px] text-neutral-400 uppercase">Escala Kanitz</div>
                  <div className="text-xs font-semibold text-neutral-300">
                    Z &gt; 0: <span className="text-emerald-400 font-bold">Solvente</span> | -3 a 0: <span className="text-amber-400 font-bold">Penumbra</span> | Z &lt; -3: <span className="text-rose-400 font-bold">Insolvente</span>
                  </div>
                </div>
              </div>
            </div>

            {/* KPI Cards em 3 Colunas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Coluna 1: Liquidez */}
              <div className="bg-[#181818] p-4 rounded-xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-neutral-200">
                    <Scale className="w-4 h-4 text-blue-400" />
                    <span>Índices de Liquidez</span>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-mono">Folga Financeira</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded bg-black/20 border border-white/5">
                    <span className="text-neutral-400">Liquidez Corrente (AC / PC):</span>
                    <span className={`font-mono font-bold text-sm ${liquidez.liquidezCorrente >= 1 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {liquidez.liquidezCorrente.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-black/20 border border-white/5">
                    <span className="text-neutral-400">Liquidez Seca ((AC - Est) / PC):</span>
                    <span className={`font-mono font-bold text-sm ${liquidez.liquidezSeca >= 1 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {liquidez.liquidezSeca.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-black/20 border border-white/5">
                    <span className="text-neutral-400">Liquidez Imediata (Disp / PC):</span>
                    <span className="font-mono font-bold text-sm text-blue-400">
                      {liquidez.liquidezImediata.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-black/20 border border-white/5">
                    <span className="text-neutral-400">Liquidez Geral ((AC+RLP) / (PC+ELP)):</span>
                    <span className={`font-mono font-bold text-sm ${liquidez.liquidezGeral >= 1 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {liquidez.liquidezGeral.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Coluna 2: Endividamento */}
              <div className="bg-[#181818] p-4 rounded-xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-neutral-200">
                    <Percent className="w-4 h-4 text-amber-400" />
                    <span>Estrutura de Capital & Dívida</span>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-mono">Endividamento</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded bg-black/20 border border-white/5">
                    <span className="text-neutral-400">Endividamento Geral (Passivo / Ativo):</span>
                    <span className={`font-mono font-bold text-sm ${endividamento.endividamentoGeral <= 60 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {endividamento.endividamentoGeral.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-black/20 border border-white/5">
                    <span className="text-neutral-400">Capital de Terceiros / PL:</span>
                    <span className="font-mono font-bold text-sm text-neutral-200">
                      {endividamento.participacaoCapitalTerceiros.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-black/20 border border-white/5">
                    <span className="text-neutral-400">Composição Curto Prazo (PC/Total):</span>
                    <span className="font-mono font-bold text-sm text-amber-400">
                      {endividamento.composicaoEndividamentoCurtoPrazo.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-black/20 border border-white/5">
                    <span className="text-neutral-400">Imobilização do PL:</span>
                    <span className="font-mono font-bold text-sm text-neutral-200">
                      {endividamento.imobilizacaoPatrimonioLiquido.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Coluna 3: Rentabilidade */}
              <div className="bg-[#181818] p-4 rounded-xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-neutral-200">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>Rentabilidade & Retorno</span>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-mono">Eficiência Operacional</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded bg-black/20 border border-white/5">
                    <span className="text-neutral-400">Giro do Ativo (Receita / Ativo):</span>
                    <span className="font-mono font-bold text-sm text-neutral-200">
                      {rentabilidade.giroAtivo.toFixed(2)}x
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-black/20 border border-white/5">
                    <span className="text-neutral-400">Margem Operacional (EBIT / Rec):</span>
                    <span className="font-mono font-bold text-sm text-blue-400">
                      {rentabilidade.margemOperacional.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-black/20 border border-white/5">
                    <span className="text-neutral-400">Margem Líquida (Lucro / Rec):</span>
                    <span className={`font-mono font-bold text-sm ${rentabilidade.margemLiquida > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {rentabilidade.margemLiquida.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-black/20 border border-white/5">
                    <span className="text-neutral-400">ROE (Retorno s/ PL):</span>
                    <span className="font-mono font-bold text-sm text-emerald-400">
                      {rentabilidade.retornoSobrePatrimonioLiquido.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: ANÁLISE VERTICAL & HORIZONTAL (AV / AH) */}
        {activeTab === 'DEMONSTRACOES' && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#181818] p-3 rounded-xl border border-white/10">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setFiltroTipo('TODOS')}
                  className={`px-3 py-1 rounded text-xs transition ${filtroTipo === 'TODOS' ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-300'}`}
                >
                  Todas as Contas
                </button>
                <button
                  onClick={() => setFiltroTipo('BALANCO')}
                  className={`px-3 py-1 rounded text-xs transition ${filtroTipo === 'BALANCO' ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-300'}`}
                >
                  Balanço Patrimonial (Ativo / Passivo)
                </button>
                <button
                  onClick={() => setFiltroTipo('DRE')}
                  className={`px-3 py-1 rounded text-xs transition ${filtroTipo === 'DRE' ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-300'}`}
                >
                  DRE (Receitas & Custos)
                </button>
              </div>

              <input
                type="text"
                value={buscaConta}
                onChange={(e) => setBuscaConta(e.target.value)}
                placeholder="Filtrar por classificação ou nome da conta..."
                className="bg-[#202020] border border-white/10 rounded-lg px-3 py-1 text-xs text-neutral-200 placeholder-neutral-500 w-72 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="bg-[#181818] rounded-xl border border-white/10 overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-[#222222] text-neutral-400 font-semibold text-[11px]">
                    <th className="py-2.5 px-3">Classificação</th>
                    <th className="py-2.5 px-3">Descrição da Conta</th>
                    <th className="py-2.5 px-3 text-right">Saldo {exercicio - 1}</th>
                    <th className="py-2.5 px-2 text-right">AV% ({exercicio - 1})</th>
                    <th className="py-2.5 px-3 text-right">Saldo {exercicio}</th>
                    <th className="py-2.5 px-2 text-right">AV% ({exercicio})</th>
                    <th className="py-2.5 px-3 text-right">Variação Nominal (R$)</th>
                    <th className="py-2.5 px-2 text-right">AH% (Evolução)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {itensFiltrados.map((it, idx) => {
                    const isGroup = it.grau <= 2;
                    return (
                      <tr key={idx} className={`hover:bg-white/5 transition ${isGroup ? 'font-bold bg-white/[0.02] text-neutral-100' : 'text-neutral-300'}`}>
                        <td className="py-2 px-3">{it.classificacao}</td>
                        <td className="py-2 px-3 font-sans">{it.descricaoConta}</td>
                        <td className="py-2 px-3 text-right text-neutral-400">
                          R$ {it.saldoExercicioAnterior.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-2 text-right text-neutral-400">{it.analiseVerticalAnteriorPercent.toFixed(1)}%</td>
                        <td className="py-2 px-3 text-right font-semibold text-neutral-100">
                          R$ {it.saldoExercicioAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-2 text-right text-blue-400">{it.analiseVerticalAtualPercent.toFixed(1)}%</td>
                        <td className={`py-2 px-3 text-right ${it.variacaoHorizontalNominal < 0 ? 'text-rose-400' : 'text-neutral-300'}`}>
                          R$ {it.variacaoHorizontalNominal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className={`py-2 px-2 text-right font-bold flex items-center justify-end space-x-1 ${
                          it.analiseHorizontalPercent < 0 ? 'text-rose-400' : 'text-emerald-400'
                        }`}>
                          {it.analiseHorizontalPercent > 0 ? (
                            <ArrowUpRight className="w-3.5 h-3.5 inline" />
                          ) : it.analiseHorizontalPercent < 0 ? (
                            <ArrowDownRight className="w-3.5 h-3.5 inline" />
                          ) : null}
                          <span>{it.analiseHorizontalPercent > 0 ? `+${it.analiseHorizontalPercent.toFixed(1)}%` : `${it.analiseHorizontalPercent.toFixed(1)}%`}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 3: MATRIZ DE ÍNDICES & FÓRMULAS LEGAIS */}
        {activeTab === 'COEFICIENTES' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#181818] p-4 rounded-xl border border-white/10 space-y-3">
              <div className="font-bold text-neutral-100 border-b border-white/5 pb-2 text-sm flex items-center space-x-2">
                <Scale className="w-4 h-4 text-blue-400" />
                <span>Memória de Cálculo dos Índices de Liquidez</span>
              </div>
              <div className="space-y-3 text-xs leading-relaxed text-neutral-300">
                <div className="p-2.5 rounded bg-black/20 border border-white/5">
                  <div className="font-bold text-neutral-200">1. Liquidez Imediata (ILI)</div>
                  <div className="font-mono text-neutral-400 text-[11px]">Fórmula: Disponibilidades / Passivo Circulante</div>
                  <div className="text-neutral-400 mt-1">Capacidade de quitar dívidas de curto prazo imediatamente com saldo em caixa e bancos.</div>
                </div>
                <div className="p-2.5 rounded bg-black/20 border border-white/5">
                  <div className="font-bold text-neutral-200">2. Liquidez Corrente (ILC)</div>
                  <div className="font-mono text-neutral-400 text-[11px]">Fórmula: Ativo Circulante / Passivo Circulante</div>
                  <div className="text-neutral-400 mt-1">Indica quantos reais a empresa possui no curto prazo para cada R$ 1,00 de dívida a vencer.</div>
                </div>
                <div className="p-2.5 rounded bg-black/20 border border-white/5">
                  <div className="font-bold text-neutral-200">3. Liquidez Seca (ILS)</div>
                  <div className="font-mono text-neutral-400 text-[11px]">Fórmula: (Ativo Circulante - Estoques) / Passivo Circulante</div>
                  <div className="text-neutral-400 mt-1">Mede a liquidez sem depender da venda do estoque de mercadorias.</div>
                </div>
                <div className="p-2.5 rounded bg-black/20 border border-white/5">
                  <div className="font-bold text-neutral-200">4. Liquidez Geral (ILG)</div>
                  <div className="font-mono text-neutral-400 text-[11px]">Fórmula: (Ativo Circulante + RLP) / (Passivo Circulante + ELP)</div>
                  <div className="text-neutral-400 mt-1">Demonstra a segurança financeira total de curto e longo prazo.</div>
                </div>
              </div>
            </div>

            <div className="bg-[#181818] p-4 rounded-xl border border-white/10 space-y-3">
              <div className="font-bold text-neutral-100 border-b border-white/5 pb-2 text-sm flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Memória de Cálculo de Rentabilidade & Solvência</span>
              </div>
              <div className="space-y-3 text-xs leading-relaxed text-neutral-300">
                <div className="p-2.5 rounded bg-black/20 border border-white/5">
                  <div className="font-bold text-neutral-200">1. Retorno sobre o Patrimônio Líquido (ROE)</div>
                  <div className="font-mono text-neutral-400 text-[11px]">Fórmula: (Lucro Líquido / Patrimônio Líquido) * 100</div>
                  <div className="text-neutral-400 mt-1">Mede a rentabilidade obtida pelos sócios para cada R$ 100 de capital próprio investido.</div>
                </div>
                <div className="p-2.5 rounded bg-black/20 border border-white/5">
                  <div className="font-bold text-neutral-200">2. Retorno sobre o Ativo (ROA)</div>
                  <div className="font-mono text-neutral-400 text-[11px]">Fórmula: (Lucro Líquido / Ativo Total) * 100</div>
                  <div className="text-neutral-400 mt-1">Eficiência de geração de lucros sobre a totalidade de ativos empregados.</div>
                </div>
                <div className="p-2.5 rounded bg-black/20 border border-white/5">
                  <div className="font-bold text-neutral-200">3. Modelo Preditivo de Insolvência de Stephen Kanitz</div>
                  <div className="font-mono text-emerald-400 text-[11px]">
                    Z = 0.05*ROE + 1.65*ILG + 3.55*ILS - 1.06*ILC - 0.33*EG
                  </div>
                  <div className="text-neutral-400 mt-1">
                    Método clássico brasileiro de análise discriminante multivariada para previsão de falências e saúde financeira.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 4: PARECER TÉCNICO DO CONTADOR */}
        {activeTab === 'PARECER' && (
          <div className="bg-[#181818] p-6 rounded-xl border border-white/10 max-w-4xl mx-auto space-y-6 text-xs text-neutral-300 leading-relaxed">
            <div className="border-b border-white/10 pb-4 flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-neutral-100 uppercase tracking-wide">
                  Parecer Técnico Contábil de Análise Econômico-Financeira
                </h2>
                <p className="text-neutral-400">
                  Emitido por profissional legalmente habilitado em estrita observância às NBC TG / CFC
                </p>
              </div>
              <button
                onClick={handleImprimirRelatorioA4}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition"
              >
                <Printer className="w-4 h-4" />
                <span>Visualizar Impressão Timbrada</span>
              </button>
            </div>

            <div className="space-y-4 text-justify font-sans">
              <p>
                Examinamos as Demonstrações Contábeis da entidade <strong className="text-neutral-100">{empresa.razaoSocial}</strong>, inscrita no CNPJ sob o nº <strong className="text-neutral-100">{empresa.cnpj}</strong>, compreendendo o Balanço Patrimonial e a Demonstração do Resultado do Exercício findo em 31 de dezembro de {exercicio}.
              </p>

              <h4 className="font-bold text-neutral-200 uppercase tracking-wider text-[11px] pt-2">
                1. Da Situação de Liquidez e Capacidade de Pagamento
              </h4>
              <p>
                A entidade apresentou Índice de Liquidez Corrente de <strong className="text-neutral-100">{liquidez.liquidezCorrente.toFixed(2)}</strong> e Liquidez Geral de <strong className="text-neutral-100">{liquidez.liquidezGeral.toFixed(2)}</strong>. Tais parâmetros revelam que a sociedade possui cobertura {liquidez.liquidezCorrente >= 1 ? 'satisfatória e segura' : 'restrita'} para liquidação das exigibilidades correntes sem necessidade de alienação precipitada de ativos imobilizados.
              </p>

              <h4 className="font-bold text-neutral-200 uppercase tracking-wider text-[11px] pt-2">
                2. Do Endividamento e Estrutura Patrimonial
              </h4>
              <p>
                O Grau de Endividamento Geral situou-se em <strong className="text-neutral-100">{endividamento.endividamentoGeral.toFixed(1)}%</strong> do Ativo Total, com composição de curto prazo em <strong className="text-neutral-100">{endividamento.composicaoEndividamentoCurtoPrazo.toFixed(1)}%</strong>. O índice de imobilização do Patrimônio Líquido em <strong className="text-neutral-100">{endividamento.imobilizacaoPatrimonioLiquido.toFixed(1)}%</strong> preserva margem patrimonial própria para investimentos futuros.
              </p>

              <h4 className="font-bold text-neutral-200 uppercase tracking-wider text-[11px] pt-2">
                3. Da Rentabilidade Operacional e Conclusão
              </h4>
              <p>
                O Retorno sobre o Patrimônio Líquido (ROE) atingiu <strong className="text-neutral-100">{rentabilidade.retornoSobrePatrimonioLiquido.toFixed(1)}%</strong>, ratificando a remuneração positiva do capital integralizado pelos investidores. Conforme o Termômetro de Insolvência de Stephen Kanitz, a entidade situa-se na faixa de <strong className="text-emerald-400">{kanitz.classificacao}</strong> com Fator Z = {kanitz.fatorZ}, denotando viabilidade operacional e continuidade normal de suas atividades econômicas.
              </p>
            </div>

            <div className="pt-8 border-t border-white/10 grid grid-cols-2 gap-8 text-center">
              <div>
                <div className="border-t border-neutral-600 pt-2 font-bold text-neutral-200">
                  {empresa.responsavelLegal || 'REPRESENTANTE LEGAL'}
                </div>
                <div className="text-neutral-500 font-mono text-[11px]">Sócio-Administrador • CPF: {empresa.cpfResponsavel || '***.***.***-**'}</div>
              </div>
              <div>
                <div className="border-t border-neutral-600 pt-2 font-bold text-neutral-200">
                  {empresa.contadorNome || 'CONTADOR RESPONSÁVEL'}
                </div>
                <div className="text-neutral-500 font-mono text-[11px]">Contador(a) • CRC: {empresa.contadorCRC || 'CRC-SP 123456/O-0'}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
