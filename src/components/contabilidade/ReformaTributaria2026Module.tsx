import React, { useState, useMemo } from 'react';
import { dbService } from '../../db/sqliteService';
import {
  Empresa,
  CenarioReformaTributaria,
  SimulacaoIbsCbs2026
} from '../../types/contabil';
import {
  Sparkles,
  Sliders,
  TrendingDown,
  TrendingUp,
  Percent,
  Download,
  Printer,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Building2,
  ArrowRight,
  Info,
  Layers,
  Banknote,
  FileText
} from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

interface ReformaTributaria2026ModuleProps {
  empresaAtiva: Empresa;
  onOpenReportPreview?: (config: {
    titulo: string;
    subtitulo: string;
    conteudo?: React.ReactNode;
    linhas?: any[];
  }) => void;
}

export const ReformaTributaria2026Module: React.FC<ReformaTributaria2026ModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [cenarios, setCenarios] = useState<CenarioReformaTributaria[]>(() =>
    dbService.getCenariosReformaTributaria(empresaAtiva.id)
  );
  const [cenarioSelecionadoId, setCenarioSelecionadoId] = useState<string>(() => {
    const list = dbService.getCenariosReformaTributaria(empresaAtiva.id);
    return list[0]?.id || 'cen-01';
  });

  const [showModalNovo, setShowModalNovo] = useState<boolean>(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string>('');

  // Form State Novo Cenário
  const [nomeCenario, setNomeCenario] = useState<string>('');
  const [faturamentoEstimado, setFaturamentoEstimado] = useState<string>('500000,00');
  const [percentualInsumos, setPercentualInsumos] = useState<number>(60);
  const [aliquotaCbs2026, setAliquotaCbs2026] = useState<number>(0.90);
  const [aliquotaIbs2026, setAliquotaIbs2026] = useState<number>(0.10);
  const [aliquotaPisAtual, setAliquotaPisAtual] = useState<number>(1.65);
  const [aliquotaCofinsAtual, setAliquotaCofinsAtual] = useState<number>(7.60);
  const [aliquotaIcmsAtual, setAliquotaIcmsAtual] = useState<number>(18.00);
  const [aliquotaIssAtual, setAliquotaIssAtual] = useState<number>(0.00);
  const [aliquotaIvaDualDefinitiva, setAliquotaIvaDualDefinitiva] = useState<number>(26.50);
  const [aplicaImpostoSeletivo, setAplicaImpostoSeletivo] = useState<boolean>(false);
  const [aliquotaImpostoSeletivo, setAliquotaImpostoSeletivo] = useState<number>(5.00);
  const [impactoSplitPaymentDias, setImpactoSplitPaymentDias] = useState<number>(30);

  const cenarioAtivo = useMemo(() => {
    return cenarios.find(c => c.id === cenarioSelecionadoId) || cenarios[0];
  }, [cenarios, cenarioSelecionadoId]);

  const simulacao: SimulacaoIbsCbs2026 = useMemo(() => {
    if (!cenarioAtivo) {
      return dbService.simularImpactoReformaTributaria('cen-01');
    }
    return dbService.simularImpactoReformaTributaria(cenarioAtivo.id);
  }, [cenarioAtivo]);

  const handleRecarregar = () => {
    const list = dbService.getCenariosReformaTributaria(empresaAtiva.id);
    setCenarios(list);
    if (!list.find(c => c.id === cenarioSelecionadoId) && list.length > 0) {
      setCenarioSelecionadoId(list[0].id);
    }
  };

  const parseValor = (valStr: string): number => {
    const cleaned = valStr.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  const handleSalvarNovoCenario = (e: React.FormEvent) => {
    e.preventDefault();
    const fat = parseValor(faturamentoEstimado);
    const valorInsumos = Math.round((fat * (percentualInsumos / 100)) * 100) / 100;

    const novoCenario: CenarioReformaTributaria = {
      id: `cen-${Date.now()}`,
      empresaId: empresaAtiva.id,
      nomeCenario,
      faturamentoMensalEstimado: fat,
      percentualInsumosComCredito: percentualInsumos,
      valorInsumosBensCapital: valorInsumos,
      aliquotaCbs2026,
      aliquotaIbs2026,
      aliquotaPisAtual,
      aliquotaCofinsAtual,
      aliquotaIcmsAtual,
      aliquotaIssAtual,
      aliquotaIvaDualDefinitiva,
      aplicaImpostoSeletivo,
      aliquotaImpostoSeletivo: aplicaImpostoSeletivo ? aliquotaImpostoSeletivo : undefined,
      impactoSplitPaymentDias
    };

    dbService.salvarCenarioReformaTributaria(novoCenario);
    handleRecarregar();
    setCenarioSelecionadoId(novoCenario.id);
    setShowModalNovo(false);
    setMensagemSucesso('Novo cenário simulado criado com sucesso!');
    setTimeout(() => setMensagemSucesso(''), 4000);
  };

  const handleExcluirCenario = (id: string) => {
    if (cenarios.length <= 1) {
      alert('É necessário manter pelo menos um cenário no sistema.');
      return;
    }
    if (window.confirm('Confirma a exclusão deste cenário de simulação?')) {
      dbService.excluirCenarioReformaTributaria(id);
      handleRecarregar();
      setMensagemSucesso('Cenário excluído.');
      setTimeout(() => setMensagemSucesso(''), 4000);
    }
  };

  const handleExportarCSV = () => {
    const rows = [{
      Cenario: cenarioAtivo?.nomeCenario,
      FaturamentoEstimado: simulacao.faturamentoBruto,
      CBS_Teste_2026: simulacao.cbsTeste2026,
      IBS_Teste_2026: simulacao.ibsTeste2026,
      Total_IVA_Teste_2026: simulacao.totalIvaTeste2026,
      Compensacao_Pis_Cofins: simulacao.compensacaoPisCofins2026,
      Saldo_Liquido_Teste: simulacao.saldoLiquidoRecolher2026,
      Carga_Atual_Total: simulacao.cargaTributariaAtualTotal,
      Percentual_Carga_Atual: `${simulacao.percentualCargaAtual}%`,
      Debito_IVA_Dual_Pleno: simulacao.debitoIvaDualPleno,
      Credito_Insumos_Ativo: simulacao.creditoIvaDualInsumosAtivo,
      Imposto_Seletivo: simulacao.impostoSeletivoValor,
      Carga_Nova_Total: simulacao.cargaTributariaNovaTotal,
      Percentual_Carga_Nova: `${simulacao.percentualCargaNova}%`,
      Variacao_Nominal: simulacao.diferencaCargaNominal,
      Impacto_Split_Payment: simulacao.impactoFluxoCaixaSplitPayment
    }];
    exportToCSV(rows, `simulacao_reforma_tributaria_${cenarioAtivo?.id}_${empresaAtiva.cnpj.replace(/\D/g, '')}`);
  };

  const handleImprimirRelatorio = () => {
    if (!onOpenReportPreview || !cenarioAtivo) return;

    onOpenReportPreview({
      titulo: 'PARECER TÉCNICO EXECUTIVO - TRANSIÇÃO DA REFORMA TRIBUTÁRIA (EC 132/2023 & PLP 68/2024)',
      subtitulo: `Cenário: ${cenarioAtivo.nomeCenario} - Simulação 2026 e Transição Definitiva IVA Dual`,
      conteudo: (
        <div className="p-8 space-y-6 text-slate-800 text-xs">
          <div className="border-b-2 border-slate-700 pb-3 flex justify-between items-end">
            <div>
              <h1 className="text-xl font-bold uppercase tracking-wider">{empresaAtiva.razaoSocial}</h1>
              <p className="text-slate-600">CNPJ: {empresaAtiva.cnpj} | CRC Contador: {empresaAtiva.crcContador || 'GO-029412/O'}</p>
              <p className="text-slate-600 font-semibold mt-1">ESTUDO COMPARATIVO DE IMPACTO TRIBUTÁRIO E FLUXO DE CAIXA</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded border border-purple-300">
                PLANEJAMENTO ESTRATÉGICO 2026-2033
              </span>
              <p className="text-[10px] text-slate-500 mt-1">Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          {/* Dados do Cenário Simulado */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-300 space-y-2">
            <h2 className="font-bold text-sm uppercase text-slate-900 border-b border-slate-300 pb-1">
              Premissas do Cenário: {cenarioAtivo.nomeCenario}
            </h2>
            <div className="grid grid-cols-3 gap-3 text-[11px]">
              <div>
                <span className="text-slate-500">Faturamento Mensal Estimado:</span>
                <span className="font-bold text-slate-900 block">
                  R$ {cenarioAtivo.faturamentoMensalEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Insumos com Crédito Pleno:</span>
                <span className="font-bold text-slate-900 block">
                  {cenarioAtivo.percentualInsumosComCredito}% (R$ {cenarioAtivo.valorInsumosBensCapital.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                </span>
              </div>
              <div>
                <span className="text-slate-500">Alíquota IVA Dual Estimada:</span>
                <span className="font-bold text-blue-900 block">
                  {cenarioAtivo.aliquotaIvaDualDefinitiva.toFixed(2)}% (CBS + IBS)
                </span>
              </div>
            </div>
          </div>

          {/* Comparativo de 3 Blocos */}
          <div className="grid grid-cols-3 gap-4">
            {/* Bloco 1: Ano Teste 2026 */}
            <div className="p-4 bg-sky-50 border border-sky-300 rounded-lg space-y-2">
              <span className="font-bold text-sky-900 uppercase block text-[11px] border-b border-sky-200 pb-1">
                1. Período de Teste (2026)
              </span>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>CBS Teste (0,9%):</span>
                  <span className="font-semibold">R$ {simulacao.cbsTeste2026.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>IBS Teste (0,1%):</span>
                  <span className="font-semibold">R$ {simulacao.ibsTeste2026.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-bold text-sky-950 border-t border-sky-200 pt-1">
                  <span>Total IVA Teste (1,0%):</span>
                  <span>R$ {simulacao.totalIvaTeste2026.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-600 text-[10px]">
                  <span>(-) Compensação PIS/COFINS:</span>
                  <span>R$ {simulacao.compensacaoPisCofins2026.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-800 border-t border-sky-200 pt-1">
                  <span>Recolhimento Líquido Adic.:</span>
                  <span>R$ {simulacao.saldoLiquidoRecolher2026.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Bloco 2: Regime Atual */}
            <div className="p-4 bg-slate-50 border border-slate-300 rounded-lg space-y-2">
              <span className="font-bold text-slate-900 uppercase block text-[11px] border-b border-slate-200 pb-1">
                2. Regime Atual (PIS/COF/ICMS/ISS)
              </span>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>PIS / COFINS Atual:</span>
                  <span className="font-semibold">R$ {simulacao.totalPisCofinsAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>ICMS / ISS Atual:</span>
                  <span className="font-semibold">R$ {simulacao.totalIcmsIssAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-950 border-t border-slate-200 pt-1">
                  <span>Carga Tributária Total:</span>
                  <span>R$ {simulacao.cargaTributariaAtualTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-bold text-blue-900 text-[10px]">
                  <span>Alíquota Efetiva Atual:</span>
                  <span>{simulacao.percentualCargaAtual.toFixed(2)}%</span>
                </div>
              </div>
            </div>

            {/* Bloco 3: Regime Pleno IVA Dual */}
            <div className="p-4 bg-purple-50 border border-purple-300 rounded-lg space-y-2">
              <span className="font-bold text-purple-900 uppercase block text-[11px] border-b border-purple-200 pb-1">
                3. Transição Plena (IVA Dual)
              </span>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Débito Bruto IBS + CBS:</span>
                  <span className="font-semibold">R$ {simulacao.debitoIvaDualPleno.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>(-) Crédito Amplo Insumos:</span>
                  <span className="font-semibold">R$ {simulacao.creditoIvaDualInsumosAtivo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-bold text-purple-950 border-t border-purple-200 pt-1">
                  <span>Carga Tributária Líquida:</span>
                  <span>R$ {simulacao.cargaTributariaNovaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-bold text-purple-900 text-[10px]">
                  <span>Alíquota Efetiva Nova:</span>
                  <span>{simulacao.percentualCargaNova.toFixed(2)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Variação e Impacto de Split Payment */}
          <div className="bg-slate-100 p-4 rounded-lg border border-slate-300 flex justify-between items-center">
            <div>
              <span className="font-bold text-slate-900 uppercase block text-xs">Variação Líquida de Carga Fiscal:</span>
              <p className="text-[10px] text-slate-600">Diferença entre o IVA Dual pós-transição e a tributação cumulativa/não-cumulativa atual</p>
            </div>
            <div className="text-right">
              <div className={`text-xl font-black ${simulacao.diferencaCargaNominal <= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {simulacao.diferencaCargaNominal > 0 ? '+' : ''} R$ {simulacao.diferencaCargaNominal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-slate-500 font-semibold">
                ({simulacao.diferencaCargaNominal <= 0 ? '-' : '+'}{Math.abs(simulacao.percentualCargaNova - simulacao.percentualCargaAtual).toFixed(2)} p.p.)
              </span>
            </div>
          </div>

          {/* Parecer Técnico */}
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg space-y-1 text-slate-800 text-[11px]">
            <p className="font-bold uppercase text-amber-950 flex items-center gap-1">
              Recomendações e Parecer Técnico de Planejamento Fiscal:
            </p>
            <p>{simulacao.parecerOrientativo}</p>
            <p className="pt-2 text-[10px] text-slate-600">
              <strong>Split Payment Inteligente (Art. 50 do PLP 68/2024):</strong> O recolhimento imediato de IBS e CBS na liquidação financeira das faturas acarreta um impacto estimado no capital de giro de R$ {simulacao.impactoFluxoCaixaSplitPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ao mês, demandando renegociação de prazos médios de pagamento com fornecedores para compensar o descompasso de fluxo financeiro.
            </p>
          </div>

          {/* Assinaturas */}
          <div className="pt-10 flex justify-between text-center text-xs">
            <div className="border-t border-slate-400 w-64 pt-1">
              <p className="font-bold">{empresaAtiva.razaoSocial}</p>
              <p className="text-[10px] text-slate-600">Diretoria Executiva</p>
            </div>
            <div className="border-t border-slate-400 w-64 pt-1">
              <p className="font-bold">{empresaAtiva.contadorNome || 'Contador Responsável'}</p>
              <p className="text-[10px] text-slate-600">CRC {empresaAtiva.crcContador || 'GO-029412/O'}</p>
            </div>
          </div>
        </div>
      )
    });
  };

  return (
    <div className="p-6 bg-[#141414] min-h-screen text-slate-100 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Simulador de Transição da Reforma Tributária (2026 - 2033)
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-900/40 text-purple-300 border border-purple-700/50">
                  EC 132/2023 & PLP 68/2024
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Alíquotas de Teste 2026 (CBS 0,9% + IBS 0,1%), Split Payment e Comparativo Carga Atual vs IVA Dual Pleno
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setNomeCenario(`Cenário Simulado ${cenarios.length + 1}`);
              setShowModalNovo(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg transition shadow-md shadow-purple-600/20"
          >
            <Plus className="w-4 h-4" />
            Novo Cenário
          </button>
          <button
            onClick={handleExportarCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={handleImprimirRelatorio}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition shadow-md shadow-emerald-700/20"
          >
            <Printer className="w-4 h-4" />
            Parecer A4 Executivo
          </button>
        </div>
      </div>

      {mensagemSucesso && (
        <div className="p-3.5 bg-emerald-950/70 border border-emerald-500/50 rounded-lg text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{mensagemSucesso}</span>
        </div>
      )}

      {/* Seletor de Cenários */}
      <div className="p-4 bg-[#1e1e1e] border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Sliders className="w-5 h-5 text-purple-400 shrink-0" />
          <div>
            <span className="text-xs text-slate-400 block">Cenário Ativo:</span>
            <select
              value={cenarioSelecionadoId}
              onChange={e => setCenarioSelecionadoId(e.target.value)}
              className="bg-[#141414] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-medium focus:outline-none focus:border-purple-500"
            >
              {cenarios.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nomeCenario}
                </option>
              ))}
            </select>
          </div>
        </div>

        {cenarioAtivo && (
          <div className="flex items-center gap-4 text-xs text-slate-300">
            <div>
              <span className="text-slate-500 block text-[10px]">FATURAMENTO MENSAL</span>
              <span className="font-bold text-white">
                R$ {cenarioAtivo.faturamentoMensalEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">CRÉDITO INSUMOS</span>
              <span className="font-bold text-purple-400">
                {cenarioAtivo.percentualInsumosComCredito}%
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">IVA DUAL</span>
              <span className="font-bold text-sky-400">
                {cenarioAtivo.aliquotaIvaDualDefinitiva.toFixed(2)}%
              </span>
            </div>
            <button
              onClick={() => handleExcluirCenario(cenarioAtivo.id)}
              title="Excluir este cenário"
              className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Cards de Impacto Comparativo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Ano de Teste 2026 */}
        <div className="p-5 bg-[#1a2234] border border-sky-800/60 rounded-2xl relative overflow-hidden space-y-3">
          <div className="flex items-center justify-between text-sky-300">
            <span className="text-xs font-bold uppercase tracking-wider">Período de Teste (Ano 2026)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-sky-900/60 border border-sky-600/50 text-sky-200">
              Compensável
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span>CBS Teste (0,9%):</span>
              <span className="font-mono font-semibold text-white">
                R$ {simulacao.cbsTeste2026.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>IBS Teste (0,1%):</span>
              <span className="font-mono font-semibold text-white">
                R$ {simulacao.ibsTeste2026.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center font-bold text-sky-300 border-t border-sky-800/60 pt-2">
              <span>Total IVA Teste (1,0%):</span>
              <span className="font-mono text-sm">
                R$ {simulacao.totalIvaTeste2026.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-400">
              <span>(-) Compensação PIS/COFINS:</span>
              <span className="font-mono text-emerald-400 font-semibold">
                R$ {simulacao.compensacaoPisCofins2026.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center font-bold text-emerald-300 bg-sky-950/60 p-2 rounded-lg border border-sky-800/40">
              <span>Impacto Financeiro Líquido:</span>
              <span className="font-mono">
                R$ {simulacao.saldoLiquidoRecolher2026.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            * O valor pago de IBS e CBS em 2026 é 100% compensável com o PIS e COFINS devidos na mesma competência.
          </p>
        </div>

        {/* Card 2: Regime Atual */}
        <div className="p-5 bg-[#1e1e1e] border border-slate-800 rounded-2xl relative overflow-hidden space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Regime Atual (Antes da Reforma)</span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span>PIS / COFINS Atual:</span>
              <span className="font-mono font-semibold text-white">
                R$ {simulacao.totalPisCofinsAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>ICMS / ISS Atual:</span>
              <span className="font-mono font-semibold text-white">
                R$ {simulacao.totalIcmsIssAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center font-bold text-white border-t border-slate-800 pt-2">
              <span>Carga Tributária Total:</span>
              <span className="font-mono text-sm text-slate-100">
                R$ {simulacao.cargaTributariaAtualTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center bg-[#141414] p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 font-medium">Alíquota Efetiva:</span>
              <span className="font-bold text-amber-400 font-mono text-sm">
                {simulacao.percentualCargaAtual.toFixed(2)}%
              </span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            * Cumulativo ou não-cumulativo clássico com créditos restritos e estornos de ICMS/ISS.
          </p>
        </div>

        {/* Card 3: Regime Pleno IVA Dual */}
        <div className="p-5 bg-[#251833] border border-purple-800/60 rounded-2xl relative overflow-hidden space-y-3">
          <div className="flex items-center justify-between text-purple-300">
            <span className="text-xs font-bold uppercase tracking-wider">Regime Definitivo (IBS + CBS)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-900/60 border border-purple-600/50 text-purple-200">
              Crédito Amplo
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span>Débito Bruto CBS + IBS:</span>
              <span className="font-mono font-semibold text-white">
                R$ {simulacao.debitoIvaDualPleno.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center text-emerald-400">
              <span>(-) Crédito Insumos / Capital:</span>
              <span className="font-mono font-semibold">
                R$ {simulacao.creditoIvaDualInsumosAtivo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center font-bold text-purple-300 border-t border-purple-800/60 pt-2">
              <span>Carga Líquida IBS/CBS:</span>
              <span className="font-mono text-sm">
                R$ {simulacao.cargaTributariaNovaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center bg-purple-950/60 p-2 rounded-lg border border-purple-800/40">
              <span className="text-purple-300 font-medium">Nova Alíquota Efetiva:</span>
              <span className="font-bold text-purple-200 font-mono text-sm">
                {simulacao.percentualCargaNova.toFixed(2)}%
              </span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            * Não-cumulatividade plena com crédito financeiro integral sobre quaisquer insumos e ativos.
          </p>
        </div>
      </div>

      {/* Termômetro de Variação de Carga & Impacto de Split Payment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className={`p-5 rounded-2xl border ${
          simulacao.diferencaCargaNominal <= 0
            ? 'bg-emerald-950/30 border-emerald-500/40'
            : 'bg-rose-950/30 border-rose-500/40'
        } space-y-3`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {simulacao.diferencaCargaNominal <= 0 ? (
                <TrendingDown className="w-5 h-5 text-emerald-400" />
              ) : (
                <TrendingUp className="w-5 h-5 text-rose-400" />
              )}
              <h4 className="font-bold text-sm text-white">
                Variação Líquida de Carga Fiscal (Δ Carga)
              </h4>
            </div>
            <span className={`text-base font-black font-mono ${
              simulacao.diferencaCargaNominal <= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {simulacao.diferencaCargaNominal > 0 ? '+' : ''} R$ {simulacao.diferencaCargaNominal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / mês
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Diferença em Pontos Percentuais:</span>
            <span className="font-bold font-mono">
              {simulacao.diferencaCargaNominal <= 0 ? '-' : '+'}{Math.abs(simulacao.percentualCargaNova - simulacao.percentualCargaAtual).toFixed(2)} p.p.
            </span>
          </div>

          <div className="w-full bg-[#141414] rounded-full h-3 overflow-hidden border border-slate-800">
            <div
              className={`h-full ${simulacao.diferencaCargaNominal <= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
              style={{
                width: `${Math.min(100, Math.max(10, Math.abs(simulacao.percentualCargaNova - simulacao.percentualCargaAtual) * 10))}%`
              }}
            />
          </div>
        </div>

        <div className="p-5 bg-[#1e1e1e] border border-slate-800 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Banknote className="w-5 h-5 text-amber-400" />
              <h4 className="font-bold text-sm text-white">
                Impacto de Split Payment no Capital de Giro
              </h4>
            </div>
            <span className="text-base font-black font-mono text-amber-400">
              R$ {simulacao.impactoFluxoCaixaSplitPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / mês
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Com a retenção imediata do IBS e CBS na liquidação da venda (Split Payment D+0), a empresa perde a folga de caixa de {cenarioAtivo?.impactoSplitPaymentDias || 30} dias antes do recolhimento tradicional via DARF mensal.
          </p>
        </div>
      </div>

      {/* Parecer Orientativo */}
      <div className="p-5 bg-[#1b1c26] border border-purple-800/50 rounded-2xl space-y-2">
        <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
          <Info className="w-4 h-4" />
          <span>Parecer Estratégico de Transição Tributária</span>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed">
          {simulacao.parecerOrientativo}
        </p>
      </div>

      {/* Modal Criar Novo Cenário */}
      {showModalNovo && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1c1c1c] border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#222222]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-white text-sm">Novo Cenário de Simulação Tributária</h3>
              </div>
              <button
                onClick={() => setShowModalNovo(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSalvarNovoCenario} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-medium mb-1">Nome do Cenário *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Expansão Logística com Novo Centro de Distribuição"
                    value={nomeCenario}
                    onChange={e => setNomeCenario(e.target.value)}
                    className="w-full px-3 py-2 bg-[#141414] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Faturamento Mensal Estimado (R$) *</label>
                  <input
                    type="text"
                    required
                    value={faturamentoEstimado}
                    onChange={e => setFaturamentoEstimado(e.target.value)}
                    className="w-full px-3 py-2 bg-[#141414] border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Insumos com Crédito Amplo (%) *</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={percentualInsumos}
                    onChange={e => setPercentualInsumos(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-[#141414] border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Alíquota CBS Teste 2026 (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={aliquotaCbs2026}
                    onChange={e => setAliquotaCbs2026(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-[#141414] border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Alíquota IBS Teste 2026 (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={aliquotaIbs2026}
                    onChange={e => setAliquotaIbs2026(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-[#141414] border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">PIS Atual (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={aliquotaPisAtual}
                    onChange={e => setAliquotaPisAtual(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-[#141414] border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">COFINS Atual (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={aliquotaCofinsAtual}
                    onChange={e => setAliquotaCofinsAtual(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-[#141414] border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">ICMS Atual (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={aliquotaIcmsAtual}
                    onChange={e => setAliquotaIcmsAtual(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-[#141414] border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">ISS Atual (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={aliquotaIssAtual}
                    onChange={e => setAliquotaIssAtual(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-[#141414] border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Alíquota IVA Dual Definitiva (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={aliquotaIvaDualDefinitiva}
                    onChange={e => setAliquotaIvaDualDefinitiva(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-[#141414] border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Dias de Retenção Split Payment</label>
                  <input
                    type="number"
                    value={impactoSplitPaymentDias}
                    onChange={e => setImpactoSplitPaymentDias(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-[#141414] border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModalNovo(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg transition shadow-md shadow-purple-600/30"
                >
                  Salvar Cenário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
