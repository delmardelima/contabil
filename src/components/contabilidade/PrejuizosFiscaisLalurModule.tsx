import React, { useState, useEffect } from 'react';
import {
  Scale,
  Plus,
  RefreshCw,
  Printer,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  FileText,
  Search,
  Filter,
  Calculator,
  Calendar,
  Edit,
  Trash2,
  ShieldCheck,
  Building2,
  DollarSign,
  ArrowRightLeft,
  FileCheck2,
  Globe2,
  HelpCircle,
  Zap,
  BookOpen,
  PieChart,
  Layers,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  Empresa,
  LancamentoParteBPrejuizo,
  ResumoPrejuizosFiscais,
  TipoPrejuizoFiscal,
  OrigemPrejuizo
} from '../../types/contabil';

interface PrejuizosFiscaisLalurModuleProps {
  empresaAtiva: Empresa | null;
  onOpenReportPreview?: (config: {
    titulo: string;
    subtitulo: string;
    conteudoHtml: string;
    imprimirDireto?: boolean;
  }) => void;
}

export const PrejuizosFiscaisLalurModule: React.FC<PrejuizosFiscaisLalurModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [resumo, setResumo] = useState<ResumoPrejuizosFiscais | null>(null);
  const [anoFiltro, setAnoFiltro] = useState<number>(2026);
  const [abaAtiva, setAbaAtiva] = useState<'lancamentos' | 'simulador' | 'legislacao'>('lancamentos');
  const [busca, setBusca] = useState('');

  // Modal formulário
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemEdicao, setItemEdicao] = useState<LancamentoParteBPrejuizo | null>(null);

  // Modal de compensação
  const [isModalCompensarOpen, setIsModalCompensarOpen] = useState(false);
  const [valorCompensarIrpj, setValorCompensarIrpj] = useState(0);
  const [valorCompensarCsll, setValorCompensarCsll] = useState(0);

  // Formulário de Cadastro/Edição
  const [exercicioOrigem, setExercicioOrigem] = useState(2025);
  const [tipo, setTipo] = useState<TipoPrejuizoFiscal>('OPERACIONAL');
  const [origem, setOrigem] = useState<OrigemPrejuizo>('PROPRIO');
  const [saldoInicialPrejuizoIrpjBRL, setSaldoInicialPrejuizoIrpjBRL] = useState(1000000);
  const [saldoInicialBaseNegativaCsllBRL, setSaldoInicialBaseNegativaCsllBRL] = useState(1000000);
  const [compensadoExercicioIrpjBRL, setCompensadoExercicioIrpjBRL] = useState(0);
  const [compensadoExercicioCsllBRL, setCompensadoExercicioCsllBRL] = useState(0);
  const [codigoContaParteB, setCodigoContaParteB] = useState('LALUR-B-PF-2025');
  const [limiteTrava30Aplicado, setLimiteTrava30Aplicado] = useState(true);
  const [observacoes, setObservacoes] = useState('');

  // Simulador interativo da Trava de 30%
  const [simLucroReal, setSimLucroReal] = useState(5000000);
  const [simPrejuizoDisponivel, setSimPrejuizoDisponivel] = useState(2500000);

  const carregarDados = () => {
    if (!empresaAtiva) return;
    const data = dbService.getPrejuizosFiscaisLalur(empresaAtiva.id, anoFiltro);
    setResumo(data);
  };

  useEffect(() => {
    carregarDados();
  }, [empresaAtiva, anoFiltro]);

  const handleNovo = () => {
    setItemEdicao(null);
    setExercicioOrigem(2025);
    setTipo('OPERACIONAL');
    setOrigem('PROPRIO');
    setSaldoInicialPrejuizoIrpjBRL(1000000);
    setSaldoInicialBaseNegativaCsllBRL(1000000);
    setCompensadoExercicioIrpjBRL(0);
    setCompensadoExercicioCsllBRL(0);
    setCodigoContaParteB(`LALUR-B-PF-${Date.now()}`);
    setLimiteTrava30Aplicado(true);
    setObservacoes('');
    setIsModalOpen(true);
  };

  const handleEditar = (l: LancamentoParteBPrejuizo) => {
    setItemEdicao(l);
    setExercicioOrigem(l.exercicioOrigem);
    setTipo(l.tipo);
    setOrigem(l.origem);
    setSaldoInicialPrejuizoIrpjBRL(l.saldoInicialPrejuizoIrpjBRL);
    setSaldoInicialBaseNegativaCsllBRL(l.saldoInicialBaseNegativaCsllBRL);
    setCompensadoExercicioIrpjBRL(l.compensadoExercicioIrpjBRL);
    setCompensadoExercicioCsllBRL(l.compensadoExercicioCsllBRL);
    setCodigoContaParteB(l.codigoContaParteB);
    setLimiteTrava30Aplicado(l.limiteTrava30Aplicado);
    setObservacoes(l.observacoes || '');
    setIsModalOpen(true);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaAtiva) return;

    const item: LancamentoParteBPrejuizo = {
      id: itemEdicao?.id || `pf-${Date.now()}`,
      empresaId: empresaAtiva.id,
      exercicioOrigem,
      tipo,
      origem,
      saldoInicialPrejuizoIrpjBRL,
      saldoInicialBaseNegativaCsllBRL,
      compensadoExercicioIrpjBRL,
      compensadoExercicioCsllBRL,
      saldoRemanescenteIrpjBRL: Math.max(0, saldoInicialPrejuizoIrpjBRL - compensadoExercicioIrpjBRL),
      saldoRemanescenteCsllBRL: Math.max(0, saldoInicialBaseNegativaCsllBRL - compensadoExercicioCsllBRL),
      codigoContaParteB,
      limiteTrava30Aplicado,
      integradoContabil: itemEdicao ? itemEdicao.integradoContabil : true,
      observacoes
    };

    dbService.salvarLancamentoPrejuizoParteB(item);
    setIsModalOpen(false);
    carregarDados();
  };

  const handleExcluir = (id: string) => {
    if (confirm('Confirma a exclusão deste registro de controle da Parte B do LALUR/LACS?')) {
      dbService.excluirLancamentoPrejuizoParteB(id);
      carregarDados();
    }
  };

  const abrirModalCompensar = () => {
    if (!resumo) return;
    setValorCompensarIrpj(Math.min(resumo.tetoCompensacao30IrpjBRL, resumo.saldoAcumuladoDisponivelIrpjBRL));
    setValorCompensarCsll(Math.min(resumo.tetoCompensacao30CsllBRL, resumo.saldoAcumuladoDisponivelCsllBRL));
    setIsModalCompensarOpen(true);
  };

  const handleConfirmarCompensacao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaAtiva) return;

    const res = dbService.compensarPrejuizoExercicio(
      empresaAtiva.id,
      anoFiltro,
      valorCompensarIrpj,
      valorCompensarCsll
    );

    alert(res.mensagem);
    if (res.sucesso) {
      setIsModalCompensarOpen(false);
      carregarDados();
    }
  };

  const formatarMoeda = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const emitirLaudoA4 = () => {
    if (!empresaAtiva || !resumo) return;

    const dataAtual = new Date().toLocaleDateString('pt-BR');
    const html = `
      <div style="font-family: 'Inter', Arial, sans-serif; color: #111; padding: 24px; line-height: 1.5;">
        <div style="border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 20px;">
          <table style="width: 100%;">
            <tr>
              <td>
                <h1 style="margin: 0; font-size: 18px; font-weight: bold; text-transform: uppercase;">
                  ${empresaAtiva.razaoSocial}
                </h1>
                <p style="margin: 2px 0; font-size: 11px; color: #444;">
                  CNPJ: ${empresaAtiva.cnpj} | Livro Eletrônico LALUR / LACS (SPED ECF Bloco M)
                </p>
                <p style="margin: 2px 0; font-size: 11px; color: #444;">
                  Tributação: Lucro Real Trimestral/Anual | Ano-Calendário: ${anoFiltro}
                </p>
              </td>
              <td style="text-align: right; vertical-align: top;">
                <span style="font-size: 10px; font-weight: bold; border: 1px solid #000; padding: 4px 8px; border-radius: 4px;">
                  PARTE B - TRAVA 30%
                </span>
                <p style="margin: 4px 0 0 0; font-size: 10px; color: #666;">Data: ${dataAtual}</p>
              </td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px;">
            MAPA DE COMPENSAÇÃO DE PREJUÍZOS FISCAIS E BASE NEGATIVA DA CSLL
          </h2>
          <p style="margin: 3px 0 0 0; font-size: 11px; color: #555;">
            Em estrita conformidade com os Arts. 509 a 515 do RIR/2018 (Decreto nº 9.580/18) e Lei nº 9.065/1995
          </p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px;">
          <tr style="background-color: #f2f2f2;">
            <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Memória de Cálculo da Trava Legal de 30%</th>
            <th style="border: 1px solid #ccc; padding: 8px; text-align: right;">Valores Homologados (R$)</th>
          </tr>
          <tr>
            <td style="border: 1px solid #ccc; padding: 8px;">Lucro Real Apurado Antes da Compensação (e-LALUR Parte A)</td>
            <td style="border: 1px solid #ccc; padding: 8px; text-align: right; font-weight: bold;">${formatarMoeda(resumo.lucroRealAntesCompensacaoBRL)}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ccc; padding: 8px;">Resultado Ajustado da CSLL Antes da Compensação (e-LACS Parte A)</td>
            <td style="border: 1px solid #ccc; padding: 8px; text-align: right; font-weight: bold;">${formatarMoeda(resumo.resultadoCsllAntesCompensacaoBRL)}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ccc; padding: 8px;">Limite Máximo Permitido de Compensação de IRPJ (Trava 30%)</td>
            <td style="border: 1px solid #ccc; padding: 8px; text-align: right; font-weight: bold; color: #0066cc;">${formatarMoeda(resumo.tetoCompensacao30IrpjBRL)}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ccc; padding: 8px;">Limite Máximo Permitido de Compensação de CSLL (Trava 30%)</td>
            <td style="border: 1px solid #ccc; padding: 8px; text-align: right; font-weight: bold; color: #0066cc;">${formatarMoeda(resumo.tetoCompensacao30CsllBRL)}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ccc; padding: 8px;">Prejuízo Fiscal Efetivamente Compensado no Período (IRPJ)</td>
            <td style="border: 1px solid #ccc; padding: 8px; text-align: right; font-weight: bold; color: #2e7d32;">${formatarMoeda(resumo.totalCompensadoPeriodoIrpjBRL)}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ccc; padding: 8px;">Base Negativa Efetivamente Compensada no Período (CSLL)</td>
            <td style="border: 1px solid #ccc; padding: 8px; text-align: right; font-weight: bold; color: #2e7d32;">${formatarMoeda(resumo.totalCompensadoPeriodoCsllBRL)}</td>
          </tr>
          <tr style="background-color: #e8f5e9;">
            <td style="border: 1px solid #ccc; padding: 8px; font-weight: bold;">Economia Tributária Efetiva no Exercício (IRPJ 25% + CSLL 9%)</td>
            <td style="border: 1px solid #ccc; padding: 8px; text-align: right; font-weight: bold; color: #2e7d32; font-size: 12px;">${formatarMoeda(resumo.economiaTributariaPeriodoBRL)}</td>
          </tr>
        </table>

        <h3 style="font-size: 12px; text-transform: uppercase; margin-bottom: 8px; border-bottom: 1px solid #ccc; padding-bottom: 4px;">
          Controle Analítico de Saldos na Parte B do e-LALUR / e-LACS (M010 / M410)
        </h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 10px;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="border: 1px solid #ddd; padding: 6px; text-align: left;">Conta Parte B</th>
              <th style="border: 1px solid #ddd; padding: 6px; text-align: left;">Ano Origem</th>
              <th style="border: 1px solid #ddd; padding: 6px; text-align: left;">Tipo / Origem</th>
              <th style="border: 1px solid #ddd; padding: 6px; text-align: right;">Saldo Inicial</th>
              <th style="border: 1px solid #ddd; padding: 6px; text-align: right;">Compensado (IRPJ)</th>
              <th style="border: 1px solid #ddd; padding: 6px; text-align: right;">Saldo Remanescente</th>
            </tr>
          </thead>
          <tbody>
            ${resumo.lancamentos.map(l => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 6px;">
                  <strong>${l.codigoContaParteB}</strong><br/>
                  <span style="color: #666; font-size: 9px;">${l.observacoes || '-'}</span>
                </td>
                <td style="border: 1px solid #ddd; padding: 6px;">${l.exercicioOrigem}</td>
                <td style="border: 1px solid #ddd; padding: 6px;">${l.tipo} (${l.origem})</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: right;">${formatarMoeda(l.saldoInicialPrejuizoIrpjBRL)}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-weight: bold; color: #2e7d32;">${formatarMoeda(l.compensadoExercicioIrpjBRL)}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-weight: bold; color: #0066cc;">${formatarMoeda(l.saldoRemanescenteIrpjBRL)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="font-size: 10px; color: #555; background: #fafafa; border: 1px solid #eee; padding: 10px; border-radius: 4px; margin-bottom: 30px;">
          <strong>Parecer Regulatório e Normas Aplicadas:</strong><br/>
          1. <strong>Regra da Trava de 30%:</strong> Nos termos do Art. 15 da Lei nº 9.065/1995 e Art. 509 do RIR/2018, o prejuízo fiscal apurado pela pessoa jurídica poderá ser compensado em períodos subsequentes, limitado a 30% (trinta por cento) do Lucro Real antes da própria compensação.<br/>
          2. <strong>Prejuízos Não Operacionais:</strong> Conforme Art. 511 do RIR/2018, os prejuízos não operacionais somente poderão ser compensados com lucros da mesma natureza, sob controle segregado na Parte B.<br/>
          3. <strong>Sem Prescrição Temporal:</strong> O direito à compensação de prejuízos fiscais não decai pelo decurso de prazo, permanecendo disponível enquanto a entidade mantiver suas operações e escrituração regular.
        </div>

        <table style="width: 100%; margin-top: 40px; font-size: 11px;">
          <tr>
            <td style="width: 50%; text-align: center; padding-right: 20px;">
              <div style="border-top: 1px solid #000; padding-top: 6px;">
                <strong>${empresaAtiva.razaoSocial}</strong><br/>
                Diretor Financeiro / Controller
              </div>
            </td>
            <td style="width: 50%; text-align: center; padding-left: 20px;">
              <div style="border-top: 1px solid #000; padding-top: 6px;">
                <strong>${empresaAtiva.contadorNome || 'Responsável Técnico'}</strong><br/>
                Contador Chefe - CRC ${empresaAtiva.crcContador || 'Ativo'}
              </div>
            </td>
          </tr>
        </table>
      </div>
    `;

    if (onOpenReportPreview) {
      onOpenReportPreview({
        titulo: 'MAPA DE COMPENSAÇÃO DE PREJUÍZOS FISCAIS - PARTE B LALUR',
        subtitulo: 'Demonstrativo da Trava de 30% e Evolução de Saldos (e-LALUR / e-LACS)',
        conteudoHtml: html
      });
    }
  };

  const lancamentosFiltrados = (resumo?.lancamentos || []).filter(l => {
    const termo = busca.toLowerCase();
    return (
      l.codigoContaParteB.toLowerCase().includes(termo) ||
      l.exercicioOrigem.toString().includes(termo) ||
      l.tipo.toLowerCase().includes(termo) ||
      l.origem.toLowerCase().includes(termo)
    );
  });

  // Cálculo simulador
  const simTeto30 = Math.round(simLucroReal * 0.30);
  const simCompensacaoEfetiva = Math.min(simTeto30, simPrejuizoDisponivel);
  const simLucroTributavelFinal = simLucroReal - simCompensacaoEfetiva;
  const simImpostosSemCompensacao = Math.round(simLucroReal * 0.34);
  const simImpostosComCompensacao = Math.round(simLucroTributavelFinal * 0.34);
  const simEconomiaReal = simImpostosSemCompensacao - simImpostosComCompensacao;

  return (
    <div className="h-full flex flex-col bg-[#141414] text-neutral-100 text-xs">
      {/* Top Header */}
      <div className="px-4 py-3 bg-[#181818] border-b border-white/5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-bold text-neutral-100">
                Prejuízos Fiscais & Base Negativa de CSLL (Trava de 30%)
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                RIR/2018 ART. 509
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Escrituração da Parte B do e-LALUR/e-LACS e controle da limitação legal de 30% na compensação
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-[#202020] border border-white/10 rounded-lg p-0.5">
            <button
              onClick={() => setAbaAtiva('lancamentos')}
              className={`px-3 py-1 rounded-md transition font-medium text-xs flex items-center gap-1.5 ${
                abaAtiva === 'lancamentos'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Saldos Parte B
            </button>
            <button
              onClick={() => setAbaAtiva('simulador')}
              className={`px-3 py-1 rounded-md transition font-medium text-xs flex items-center gap-1.5 ${
                abaAtiva === 'simulador'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              Simulador Trava 30%
            </button>
            <button
              onClick={() => setAbaAtiva('legislacao')}
              className={`px-3 py-1 rounded-md transition font-medium text-xs flex items-center gap-1.5 ${
                abaAtiva === 'legislacao'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Regras e Sucessão
            </button>
          </div>

          <button
            onClick={emitirLaudoA4}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-white/10 transition"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span>Mapa A4</span>
          </button>

          <button
            onClick={abrirModalCompensar}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-600/20 transition"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Compensar no Exercício</span>
          </button>

          <button
            onClick={handleNovo}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-white/10 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Conta Parte B</span>
          </button>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-[#181818] border border-white/5 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[11px] text-neutral-400 uppercase font-medium">Saldo Disponível IRPJ</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-blue-400">
                {formatarMoeda(resumo?.saldoAcumuladoDisponivelIrpjBRL || 0)}
              </span>
              <span className="text-[10px] text-blue-400 font-medium font-mono">Parte B</span>
            </div>
            <span className="text-[10px] text-neutral-500 mt-1">Prejuízos acumulados passíveis de uso</span>
          </div>

          <div className="bg-[#181818] border border-white/5 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[11px] text-neutral-400 uppercase font-medium">Teto Máximo Legal (Trava 30%)</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-amber-400">
                {formatarMoeda(resumo?.tetoCompensacao30IrpjBRL || 0)}
              </span>
              <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-1.5 py-0.5 rounded">
                30% Lucro Real
              </span>
            </div>
            <span className="text-[10px] text-neutral-500 mt-1">Limite máx. dedutível neste período</span>
          </div>

          <div className="bg-[#181818] border border-white/5 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[11px] text-neutral-400 uppercase font-medium">Compensado no Período</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-emerald-400">
                {formatarMoeda(resumo?.totalCompensadoPeriodoIrpjBRL || 0)}
              </span>
              <span className="text-[10px] text-emerald-400 font-medium">LALUR Parte A</span>
            </div>
            <span className="text-[10px] text-neutral-500 mt-1">Abatimento aplicado na apuração</span>
          </div>

          <div className="bg-[#181818] border border-white/5 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[11px] text-neutral-400 uppercase font-medium">Economia Fiscal (34%)</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-purple-400">
                {formatarMoeda(resumo?.economiaTributariaPeriodoBRL || 0)}
              </span>
              <span className="text-[10px] text-purple-400 font-medium">IRPJ + CSLL</span>
            </div>
            <span className="text-[10px] text-neutral-500 mt-1">Economia líquida de tributos</span>
          </div>
        </div>

        {/* ABA: LANÇAMENTOS / PARTE B */}
        {abaAtiva === 'lancamentos' && (
          <div className="space-y-3">
            {/* Barra de Filtros */}
            <div className="flex items-center justify-between bg-[#181818] border border-white/5 p-2 rounded-lg">
              <div className="flex items-center space-x-2 flex-1 max-w-md">
                <Search className="w-3.5 h-3.5 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Filtrar por código de conta, exercício, tipo ou origem..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="bg-transparent border-none text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none w-full"
                />
              </div>

              <div className="flex items-center space-x-2 text-neutral-400">
                <span>Exercício:</span>
                <select
                  value={anoFiltro}
                  onChange={(e) => setAnoFiltro(Number(e.target.value))}
                  className="bg-[#202020] border border-white/10 rounded px-2 py-1 text-xs text-neutral-200"
                >
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                  <option value={2024}>2024</option>
                </select>
              </div>
            </div>

            {/* Tabela de Contas Parte B */}
            <div className="bg-[#181818] border border-white/5 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] uppercase font-bold text-neutral-400 bg-white/[0.02]">
                    <th className="py-2.5 px-3">Conta Parte B (SPED M010)</th>
                    <th className="py-2.5 px-3">Ano Origem</th>
                    <th className="py-2.5 px-3">Tipo & Origem</th>
                    <th className="py-2.5 px-3 text-right">Saldo Inicial</th>
                    <th className="py-2.5 px-3 text-right">Compensado</th>
                    <th className="py-2.5 px-3 text-right">Saldo Remanescente</th>
                    <th className="py-2.5 px-3 text-center">Trava 30%</th>
                    <th className="py-2.5 px-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {lancamentosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-neutral-500 text-xs">
                        Nenhuma conta de prejuízo fiscal cadastrada na Parte B do e-LALUR.
                      </td>
                    </tr>
                  ) : (
                    lancamentosFiltrados.map((l) => (
                      <tr key={l.id} className="hover:bg-white/[0.02] transition">
                        <td className="py-2.5 px-3">
                          <div className="font-mono font-semibold text-neutral-200">{l.codigoContaParteB}</div>
                          <div className="text-[10px] text-neutral-500">
                            {l.observacoes || 'Conta de controle de prejuízo'}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-neutral-300">
                          {l.exercicioOrigem}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center space-x-1.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              l.tipo === 'OPERACIONAL'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              {l.tipo}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-mono">({l.origem})</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-neutral-300">
                          {formatarMoeda(l.saldoInicialPrejuizoIrpjBRL)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-400">
                          {formatarMoeda(l.compensadoExercicioIrpjBRL)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-400">
                          {formatarMoeda(l.saldoRemanescenteIrpjBRL)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {l.limiteTrava30Aplicado ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              30% Aplicado
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[9px] text-neutral-500">
                              Não Aplicável
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => handleEditar(l)}
                              className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-neutral-200 transition"
                              title="Editar Conta"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleExcluir(l.id)}
                              className="p-1 hover:bg-rose-500/10 rounded text-neutral-400 hover:text-rose-400 transition"
                              title="Excluir"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA: SIMULADOR TRAVA 30% */}
        {abaAtiva === 'simulador' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#181818] border border-white/5 rounded-xl p-4 space-y-4">
              <h3 className="text-xs font-bold text-neutral-200 uppercase flex items-center space-x-2">
                <Calculator className="w-4 h-4 text-emerald-400" />
                <span>Variáveis de Apuração</span>
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] text-neutral-400">Lucro Real Apurado Antes da Compensação (R$)</label>
                  <input
                    type="number"
                    value={simLucroReal}
                    onChange={(e) => setSimLucroReal(Number(e.target.value))}
                    className="w-full mt-1 bg-[#202020] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-neutral-200 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400">Saldo Disponível na Parte B (R$)</label>
                  <input
                    type="number"
                    value={simPrejuizoDisponivel}
                    onChange={(e) => setSimPrejuizoDisponivel(Number(e.target.value))}
                    className="w-full mt-1 bg-[#202020] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-neutral-200 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[11px] text-emerald-300">
                <div className="font-semibold mb-1">A Trava Legal:</div>
                A legislação federal veda abater mais de 30% do Lucro Real em cada exercício fiscal. Mesmo dispondo de prejuízos suficientes para zerar o lucro, a empresa sempre tributará no mínimo 70% daquele resultado.
              </div>
            </div>

            <div className="md:col-span-2 bg-[#181818] border border-white/5 rounded-xl p-4 space-y-4">
              <h3 className="text-xs font-bold text-neutral-200 uppercase flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span>Simulação do Impacto Tributário</span>
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#202020] border border-white/5 rounded-lg">
                  <span className="text-[11px] text-neutral-400">Teto Máximo Permitido (30%)</span>
                  <div className="text-base font-bold font-mono text-amber-400 mt-1">
                    {formatarMoeda(simTeto30)}
                  </div>
                </div>

                <div className="p-3 bg-[#202020] border border-white/5 rounded-lg">
                  <span className="text-[11px] text-neutral-400">Compensação Efetiva Aplicada</span>
                  <div className="text-base font-bold font-mono text-emerald-400 mt-1">
                    {formatarMoeda(simCompensacaoEfetiva)}
                  </div>
                </div>

                <div className="p-3 bg-[#202020] border border-white/5 rounded-lg">
                  <span className="text-[11px] text-neutral-400">Lucro Real Tributável Final</span>
                  <div className="text-base font-bold font-mono text-neutral-200 mt-1">
                    {formatarMoeda(simLucroTributavelFinal)}
                  </div>
                </div>

                <div className="p-3 bg-[#202020] border border-white/5 rounded-lg">
                  <span className="text-[11px] text-neutral-400">Prejuízo Remanescente Parte B</span>
                  <div className="text-base font-bold font-mono text-blue-400 mt-1">
                    {formatarMoeda(Math.max(0, simPrejuizoDisponivel - simCompensacaoEfetiva))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-emerald-900/20 to-blue-900/20 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-neutral-200 uppercase">Economia Direta de IRPJ & CSLL (34%)</span>
                  <p className="text-[11px] text-neutral-400 mt-0.5">Tributos evitados em razão da compensação de prejuízos</p>
                </div>
                <div className="text-2xl font-bold font-mono text-emerald-400">
                  {formatarMoeda(simEconomiaReal)}
                </div>
              </div>

              <div className="space-y-2 text-[11px] text-neutral-400">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Alíquota de IRPJ (15% padrão + 10% adicional sobre excedente de R$ 20.000/mês).</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Alíquota de CSLL (9% sobre o resultado ajustado).</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Geração de partida automática de baixa na conta Parte B e dedução na Parte A da ECF.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA: LEGISLAÇÃO E SUCESSÃO */}
        {abaAtiva === 'legislacao' && (
          <div className="bg-[#181818] border border-white/5 rounded-xl p-5 space-y-4 leading-relaxed text-xs text-neutral-300">
            <h3 className="text-sm font-bold text-neutral-100 uppercase border-b border-white/5 pb-2">
              Regras Jurídicas de Compensação e Operações Societárias (RIR/2018)
            </h3>

            <div className="space-y-3">
              <p>
                A compensação de prejuízos fiscais é regulada pelo <strong>Regulamento do Imposto sobre a Renda (Decreto nº 9.580/2018)</strong>, com normas estritas de apuração, conservação e restrição em reorganizações societárias:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3">
                <div className="p-3 bg-neutral-900/60 rounded-lg border border-white/5 space-y-2">
                  <div className="font-bold text-neutral-100 flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Perda de Prejuízos em Cisão, Fusão e Incorporação</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-neutral-400 text-[11px]">
                    <li><strong>Sociedade Extinta (Art. 514 RIR/2018):</strong> A pessoa jurídica cindida, fundida ou incorporada não pode transferir seus prejuízos fiscais para a sociedade incorporadora ou sucessora.</li>
                    <li><strong>Sociedade Incorporadora:</strong> Pode compensar seus próprios prejuízos fiscais anteriores, desde que não haja alteração substancial do controle societário e do ramo de atividade (Art. 513).</li>
                    <li><strong>Cisão Parcial:</strong> Os prejuízos fiscais da sociedade cindida decaem proporcionalmente à parcela do patrimônio líquido cindida.</li>
                  </ul>
                </div>

                <div className="p-3 bg-neutral-900/60 rounded-lg border border-white/5 space-y-2">
                  <div className="font-bold text-neutral-100 flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Segregação de Prejuízos Não Operacionais</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-neutral-400 text-[11px]">
                    <li><strong>Definição (Art. 511 RIR/2018):</strong> Prejuízos decorrentes de alienação de bens do ativo imobilizado, intangível ou de investimentos quando o custo for superior ao valor de venda.</li>
                    <li><strong>Controle Separado:</strong> Devem ser escriturados em subcontas segregadas na Parte B do LALUR.</li>
                    <li><strong>Exclusividade de Compensação:</strong> Apenas podem ser compensados com resultados positivos não operacionais (ganhos de capital futuros).</li>
                  </ul>
                </div>
              </div>

              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-300 text-[11px]">
                <strong>Constitucionalidade da Trava de 30%:</strong> O Supremo Tribunal Federal (STF), no julgamento do RE 592.891 (Tema 117 de Repercussão Geral), fixou a tese de que a limitação da compensação de prejuízos fiscais do IRPJ e da base negativa da CSLL a 30% do Lucro Real é plenamente constitucional, não violando o conceito de renda nem o princípio do não confisco.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Compensar no Exercício */}
      {isModalCompensarOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#1c1c1c] border border-white/10 rounded-xl shadow-2xl max-w-lg w-full p-5 text-neutral-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-sm text-neutral-100 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Compensar Prejuízos no Exercício ({anoFiltro})</span>
              </h3>
              <button
                onClick={() => setIsModalCompensarOpen(false)}
                className="text-neutral-400 hover:text-neutral-200 text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmarCompensacao} className="space-y-4 mt-4">
              <div className="p-3 bg-neutral-900/60 rounded-lg border border-white/5 space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Teto Legal IRPJ (30% Lucro Real):</span>
                  <span className="font-mono font-bold text-amber-400">{formatarMoeda(resumo?.tetoCompensacao30IrpjBRL || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Saldo Disponível na Parte B:</span>
                  <span className="font-mono text-blue-400">{formatarMoeda(resumo?.saldoAcumuladoDisponivelIrpjBRL || 0)}</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-neutral-400">Valor a Compensar de Prejuízo Fiscal IRPJ (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={valorCompensarIrpj}
                  onChange={(e) => setValorCompensarIrpj(Number(e.target.value))}
                  className="w-full mt-1 bg-[#222] border border-white/10 rounded px-2.5 py-1.5 text-xs text-neutral-200 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400">Valor a Compensar de Base Negativa CSLL (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={valorCompensarCsll}
                  onChange={(e) => setValorCompensarCsll(Number(e.target.value))}
                  className="w-full mt-1 bg-[#222] border border-white/10 rounded px-2.5 py-1.5 text-xs text-neutral-200 font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalCompensarOpen(false)}
                  className="px-4 py-2 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition shadow-lg shadow-emerald-600/20"
                >
                  Confirmar Escrituração
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nova / Editar Conta Parte B */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#1c1c1c] border border-white/10 rounded-xl shadow-2xl max-w-lg w-full p-5 text-neutral-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-sm text-neutral-100 flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span>{itemEdicao ? 'Editar Conta Parte B' : 'Cadastrar Conta Parte B no LALUR'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-200 text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvar} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-neutral-400">Código Conta Parte B *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: LALUR-B-PF-2024"
                    value={codigoContaParteB}
                    onChange={(e) => setCodigoContaParteB(e.target.value)}
                    className="w-full mt-1 bg-[#222] border border-white/10 rounded px-2.5 py-1.5 text-xs text-neutral-200 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400">Ano Calendário Origem *</label>
                  <input
                    type="number"
                    required
                    value={exercicioOrigem}
                    onChange={(e) => setExercicioOrigem(Number(e.target.value))}
                    className="w-full mt-1 bg-[#222] border border-white/10 rounded px-2.5 py-1.5 text-xs text-neutral-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-neutral-400">Tipo de Prejuízo *</label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as TipoPrejuizoFiscal)}
                    className="w-full mt-1 bg-[#222] border border-white/10 rounded px-2.5 py-1.5 text-xs text-neutral-200"
                  >
                    <option value="OPERACIONAL">Operacional</option>
                    <option value="NAO_OPERACIONAL">Não Operacional</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400">Origem do Saldo *</label>
                  <select
                    value={origem}
                    onChange={(e) => setOrigem(e.target.value as OrigemPrejuizo)}
                    className="w-full mt-1 bg-[#222] border border-white/10 rounded px-2.5 py-1.5 text-xs text-neutral-200"
                  >
                    <option value="PROPRIO">Próprio da PJ</option>
                    <option value="INCORPORACAO">Incorporação de Sociedade</option>
                    <option value="FUSAO">Fusão Societária</option>
                    <option value="CISAO">Cisão Parcial</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-neutral-400">Saldo Inicial Prejuízo IRPJ (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={saldoInicialPrejuizoIrpjBRL}
                    onChange={(e) => setSaldoInicialPrejuizoIrpjBRL(Number(e.target.value))}
                    className="w-full mt-1 bg-[#222] border border-white/10 rounded px-2.5 py-1.5 text-xs text-neutral-200 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400">Saldo Inicial Base Negativa CSLL (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={saldoInicialBaseNegativaCsllBRL}
                    onChange={(e) => setSaldoInicialBaseNegativaCsllBRL(Number(e.target.value))}
                    className="w-full mt-1 bg-[#222] border border-white/10 rounded px-2.5 py-1.5 text-xs text-neutral-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-neutral-400">Notas de Escrituração & Histórico</label>
                <textarea
                  rows={2}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Detalhamento da origem do prejuízo apurado na ECF..."
                  className="w-full mt-1 bg-[#222] border border-white/10 rounded px-2.5 py-1.5 text-xs text-neutral-200"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition shadow-lg shadow-blue-600/20"
                >
                  Salvar Conta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
