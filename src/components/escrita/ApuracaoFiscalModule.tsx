import React, { useState } from 'react';
import { dbService } from '../../db/sqliteService';
import { Empresa, ApuracaoFiscal, NotaFiscal } from '../../types/contabil';
import {
  Calculator,
  Receipt,
  Layers,
  Printer,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  TrendingUp,
  FileCheck,
  Zap,
  ArrowRight,
  Barcode,
  Calendar,
  Download,
  Percent,
  FileSpreadsheet
} from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

interface ApuracaoFiscalModuleProps {
  empresa: Empresa;
  onOpenReportPreview?: (config: {
    tipo: 'APURACAO_FISCAL' | 'GUIA_DAS' | 'LIVRO_ENTRADAS' | 'LIVRO_SAIDAS';
    titulo: string;
    subtitulo: string;
    linhas: { descricao: string; valor: number; isTotal?: boolean; isHeader?: boolean }[];
  }) => void;
  onIntegracaoSucesso?: () => void;
}

export const ApuracaoFiscalModule: React.FC<ApuracaoFiscalModuleProps> = ({
  empresa,
  onOpenReportPreview,
  onIntegracaoSucesso
}) => {
  const [subAba, setSubAba] = useState<'APURACAO' | 'SEGREGAÇÃO' | 'GUIAS' | 'MEMORIA_CALCULO'>('APURACAO');
  const [apuracao, setApuracao] = useState<ApuracaoFiscal | null>(() => {
    return dbService.getApuracaoFiscal(empresa.id, empresa.competenciaAtiva) || null;
  });
  const [calculando, setCalculando] = useState<boolean>(false);
  const [mensagem, setMensagem] = useState<string>('');

  const notas = dbService.getNotasFiscais(empresa.id);
  const [ano, mes] = empresa.competenciaAtiva.split('-');
  const notasCompetencia = notas.filter(n => n.dataEmissao.startsWith(`${ano}-${mes}`));

  const totalSaidas = notasCompetencia.filter(n => n.tipo === 'SAIDA').reduce((acc, n) => acc + n.valorTotal, 0);
  const totalServicos = notasCompetencia.filter(n => n.tipo === 'SERVICO').reduce((acc, n) => acc + n.valorTotal, 0);
  const totalEntradas = notasCompetencia.filter(n => n.tipo === 'ENTRADA').reduce((acc, n) => acc + n.valorTotal, 0);
  const faturamentoMes = totalSaidas + totalServicos;

  // Processar Apuração Oficial da Competência
  const handleCalcularApuracao = () => {
    setCalculando(true);
    setTimeout(() => {
      const isSimples = empresa.regimeTributario === 'SIMPLES_NACIONAL';

      if (isSimples) {
        const novaApuracao = dbService.calcularSimplesNacionalComSegregacao(empresa.id, empresa.competenciaAtiva);
        setApuracao(novaApuracao);
        setCalculando(false);
        setMensagem(`Apuração do Simples Nacional com Segregação (ST & Monofásicos) processada! Economia Tributária Gerada: R$ ${(novaApuracao.economiaTributariaSegregacao || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`);
        setTimeout(() => setMensagem(''), 6000);
        return;
      }

      // Lucro Presumido
      const icmsDebito = Math.round((totalSaidas * 0.18) * 100) / 100;
      const icmsCredito = Math.round((totalEntradas * 0.12) * 100) / 100;
      const icmsPagar = Math.max(0, icmsDebito - icmsCredito);

      const pis = Math.round((faturamentoMes * 0.0065) * 100) / 100;
      const cofins = Math.round((faturamentoMes * 0.03) * 100) / 100;
      const iss = Math.round((totalServicos * 0.05) * 100) / 100;
      const baseIRPJ = (totalSaidas * 0.08) + (totalServicos * 0.32);
      const irpj = Math.round((baseIRPJ * 0.15) * 100) / 100;
      const baseCSLL = (totalSaidas * 0.12) + (totalServicos * 0.32);
      const csll = Math.round((baseCSLL * 0.09) * 100) / 100;

      const imposto = icmsPagar + pis + cofins + iss + irpj + csll;
      const aliq = faturamentoMes > 0 ? imposto / faturamentoMes : 0;
      const det: Record<string, number> = {
        'ICMS Próprio (Débito x Crédito)': icmsPagar,
        'PIS Cumulativo (0,65%)': pis,
        'COFINS Cumulativa (3,00%)': cofins,
        'ISSQN Municipal (5,00%)': iss,
        'IRPJ Presumido (15%)': irpj,
        'CSLL Presumida (9%)': csll
      };

      const novaApuracao: ApuracaoFiscal = {
        id: Date.now(),
        empresaId: empresa.id,
        competencia: empresa.competenciaAtiva,
        regime: empresa.regimeTributario,
        receitaBruta: faturamentoMes,
        faturamentoTotal: faturamentoMes,
        rbt12: 1250000.00,
        impostoDevido: imposto,
        aliquotaEfetiva: aliq,
        valorICMSApurado: icmsPagar,
        valorPISApurado: pis,
        valorCOFINSApurado: cofins,
        valorISSApurado: iss,
        valorIRPJApurado: irpj,
        valorCSLLApurado: csll,
        detalhamentoImpostos: det,
        guiaGerada: true,
        dataVencimento: `${ano}-${(parseInt(mes) % 12 + 1).toString().padStart(2, '0')}-20`,
        status: 'CALCULADA'
      };

      dbService.saveApuracaoFiscal(novaApuracao);
      setApuracao(novaApuracao);
      setCalculando(false);
      setMensagem(`Apuração de tributos de ${empresa.competenciaAtiva} calculada com sucesso.`);
      setTimeout(() => setMensagem(''), 5000);
    }, 400);
  };

  // Integração Contábil Automática da Apuração
  const handleIntegrarContabilidade = () => {
    const res = dbService.integrarApuracaoContabil(empresa.id, empresa.competenciaAtiva);
    if (!res.success) {
      setMensagem('Não há impostos apurados para integração contábil nesta competência.');
      return;
    }

    setMensagem(`Apuração integrada com sucesso! Lote gerado com ${res.partidasGeradas} partidas contábeis (Total: R$ ${res.totalImposto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}).`);
    setApuracao(dbService.getApuracaoFiscal(empresa.id, empresa.competenciaAtiva) || null);
    if (onIntegracaoSucesso) onIntegracaoSucesso();
    setTimeout(() => setMensagem(''), 6000);
  };

  // Imprimir Relatório de Apuração A4
  const handleImprimirRelatorioA4 = () => {
    if (!onOpenReportPreview || !apuracao) return;

    const linhas: { descricao: string; valor: number; isTotal?: boolean; isHeader?: boolean }[] = [
      { descricao: '--- DEMONSTRATIVO DE BASES FISCAIS & FATURAMENTO ---', valor: 0, isHeader: true },
      { descricao: '1. Faturamento Total de Saídas / Venda de Mercadorias', valor: totalSaidas },
      { descricao: '2. Faturamento Total de Prestação de Serviços', valor: totalServicos },
      { descricao: '(=) RECEITA BRUTA OPERACIONAL DA COMPETÊNCIA', valor: faturamentoMes, isTotal: true },
      { descricao: '3. Total de Entradas / Compras com Crédito Tributário', valor: totalEntradas },
      { descricao: '--- DISCRIMINAÇÃO DOS TRIBUTOS APURADOS ---', valor: 0, isHeader: true }
    ];

    if (apuracao.detalhamentoImpostos) {
      for (const [imposto, val] of Object.entries(apuracao.detalhamentoImpostos)) {
        linhas.push({ descricao: imposto, valor: val });
      }
    }

    linhas.push({
      descricao: `(=) TOTAL CONSOLIDADO DE TRIBUTOS A RECOLHER (Alíq. Efetiva: ${((apuracao.aliquotaEfetiva || 0) * 100).toFixed(2)}%)`,
      valor: apuracao.impostoDevido || 0,
      isTotal: true
    });

    onOpenReportPreview({
      tipo: 'APURACAO_FISCAL',
      titulo: `DEMONSTRATIVO DE APURAÇÃO DE TRIBUTOS (${empresa.regimeTributario})`,
      subtitulo: `Competência: ${empresa.competenciaAtiva} • Empresa: ${empresa.razaoSocial} • CNPJ: ${empresa.cnpj}`,
      linhas
    });
  };

  // Imprimir Guia DAS / DARF Individual A4
  const handleImprimirGuiaIndividual = (nomeGuia: string, valor: number, codigoReceita: string) => {
    if (!onOpenReportPreview) return;

    const linhas = [
      { descricao: '--- INFORMAÇÕES DO DOCUMENTO DE ARRECADAÇÃO ---', valor: 0, isHeader: true },
      { descricao: `Documento: ${nomeGuia}`, valor },
      { descricao: `Código de Receita Oficial: ${codigoReceita}`, valor: 0 },
      { descricao: `Período de Apuração: ${empresa.competenciaAtiva}`, valor: 0 },
      { descricao: `Data de Vencimento: ${apuracao?.dataVencimento || '20/11/2026'}`, valor: 0 },
      { descricao: '(=) VALOR TOTAL A RECOLHER', valor, isTotal: true },
      { descricao: 'Código de Barras / Linha Digitável:', valor: 0, isHeader: true },
      { descricao: '85830000001-2 36890385261-0 01001202610-8 00000000000-0', valor: 0 }
    ];

    onOpenReportPreview({
      tipo: 'GUIA_DAS',
      titulo: `GUIA OFICIAL DE RECOLHIMENTO - ${nomeGuia}`,
      subtitulo: `Contribuinte: ${empresa.razaoSocial} • CNPJ: ${empresa.cnpj} • Vencimento: ${apuracao?.dataVencimento || '20/11/2026'}`,
      linhas
    });
  };

  // Exportar Apuração para Excel
  const handleExportarExcel = () => {
    const headers = ['Descrição do Tributo / Base', 'Valor (R$)'];
    const rows = [
      ['Faturamento de Mercadorias (Saídas)', totalSaidas],
      ['Faturamento de Serviços', totalServicos],
      ['Receita Bruta Total', faturamentoMes],
      ['Compras / Entradas do Mês', totalEntradas]
    ];

    if (apuracao?.detalhamentoImpostos) {
      for (const [k, v] of Object.entries(apuracao.detalhamentoImpostos)) {
        rows.push([k, v]);
      }
    }

    rows.push(['Total de Impostos Devidos', apuracao?.impostoDevido || 0]);
    exportToCSV(`Apuracao_Fiscal_${empresa.competenciaAtiva}`, rows, headers);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#141414] text-neutral-200 overflow-hidden select-none font-sans">
      {/* Header */}
      <div className="px-5 py-3.5 bg-[#181818] border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-neutral-100 flex items-center space-x-2">
              <span>Apuração de Tributos, DAS & Guias Fiscais</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono font-medium border border-emerald-500/30">
                Competência: {empresa.competenciaAtiva}
              </span>
            </h2>
            <p className="text-[11px] text-neutral-400">
              Regime: <strong className="text-neutral-200">{empresa.regimeTributario}</strong> • Padrão  Sistemas
            </p>
          </div>
        </div>

        {/* Toggle de Sub-Aba */}
        <div className="flex items-center bg-[#101010] p-0.5 rounded-lg border border-white/10">
          <button
            onClick={() => setSubAba('APURACAO')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition flex items-center space-x-1.5 ${subAba === 'APURACAO'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
              }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Apuração Mensal</span>
          </button>
          <button
            onClick={() => setSubAba('SEGREGAÇÃO')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition flex items-center space-x-1.5 ${subAba === 'SEGREGAÇÃO'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
              }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Segregação ST / Monofásico</span>
          </button>
          <button
            onClick={() => setSubAba('GUIAS')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition flex items-center space-x-1.5 ${subAba === 'GUIAS'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
              }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Guias & Códigos DARF</span>
          </button>
          <button
            onClick={() => setSubAba('MEMORIA_CALCULO')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition flex items-center space-x-1.5 ${subAba === 'MEMORIA_CALCULO'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
              }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Notas da Competência</span>
          </button>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCalcularApuracao}
            disabled={calculando}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded text-xs font-medium flex items-center space-x-1.5 transition shadow-sm"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>{calculando ? 'Calculando...' : 'Processar Apuração'}</span>
          </button>

          <button
            onClick={handleIntegrarContabilidade}
            disabled={!apuracao}
            className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded text-xs font-medium flex items-center space-x-1.5 transition shadow-sm"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Integrar Contabilidade</span>
          </button>

          <button
            onClick={handleImprimirRelatorioA4}
            disabled={!apuracao}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 text-neutral-300 rounded border border-white/10 text-xs font-medium flex items-center space-x-1.5 transition"
          >
            <Printer className="w-3.5 h-3.5 text-sky-400" />
            <span>Relatório A4</span>
          </button>
        </div>
      </div>

      {/* Alerta de Mensagem */}
      {mensagem && (
        <div className="px-5 py-2.5 bg-emerald-950/80 border-b border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{mensagem}</span>
          </div>
          <button onClick={() => setMensagem('')} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Conteúdo Principal */}
      <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
        {subAba === 'APURACAO' && (
          <div className="space-y-4">
            {/* Banner de Inteligência Tributária (Selo de Eficiência do Escritório) */}
            {apuracao?.economiaTributariaSegregacao && apuracao.economiaTributariaSegregacao > 0 ? (
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center justify-between shadow-lg">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-emerald-300 flex items-center space-x-2">
                      <span>Inteligência Tributária Aplicada: Segregação ST & Monofásicos</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono border border-emerald-500/30">
                        LC 123/2006 Art. 18 § 4º-A
                      </span>
                    </h3>
                    <p className="text-xs text-neutral-300 mt-0.5">
                      DAS sem segregação seria <span className="line-through text-neutral-400">R$ {apuracao.dasSemSegregacao?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>. Com o expurgo de ICMS ST e PIS/COFINS Monofásicos, o DAS efetivo a recolher é <strong className="text-emerald-400">R$ {apuracao.valorDAS?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>.
                    </p>
                  </div>
                </div>
                <div className="text-right font-mono pl-5 border-l border-emerald-500/20 flex-shrink-0">
                  <span className="text-[10px] text-emerald-400/80 block uppercase font-bold">Economia Gerada</span>
                  <span className="text-lg font-black text-emerald-300">
                    R$ {apuracao.economiaTributariaSegregacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-emerald-400 block font-semibold">
                    ({apuracao.percentualEconomia?.toFixed(1)}% de redução direta)
                  </span>
                </div>
              </div>
            ) : null}

            {/* KPI Cards de Faturamento e Imposto */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#181818] border border-white/10 rounded-xl p-4 shadow">
                <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
                  <span>Receita Bruta Total</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xl font-bold font-mono text-neutral-100">
                  R$ {faturamentoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <span className="text-[11px] text-neutral-400 mt-1 block">
                  Saídas: R$ {totalSaidas.toFixed(2)} • Serviços: R$ {totalServicos.toFixed(2)}
                </span>
              </div>

              <div className="bg-[#181818] border border-white/10 rounded-xl p-4 shadow">
                <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
                  <span>Compras / Entradas</span>
                  <Layers className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-xl font-bold font-mono text-blue-400">
                  R$ {totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <span className="text-[11px] text-neutral-400 mt-1 block">
                  Créditos fiscais aproveitados
                </span>
              </div>

              <div className="bg-[#181818] border border-white/10 rounded-xl p-4 shadow">
                <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
                  <span>Alíquota Efetiva</span>
                  <Percent className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-xl font-bold font-mono text-amber-400">
                  {apuracao ? `${((apuracao.aliquotaEfetiva || 0) * 100).toFixed(2)}%` : 'Pendente'}
                </div>
                <span className="text-[11px] text-neutral-400 mt-1 block">
                  {empresa.regimeTributario === 'SIMPLES_NACIONAL' ? 'Cálculo PGDAS-D Anexo I' : 'Presunção Lucro Presumido'}
                </span>
              </div>

              <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 shadow">
                <div className="flex items-center justify-between text-emerald-400 text-xs mb-1">
                  <span className="font-semibold">Total Imposto Devido</span>
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xl font-bold font-mono text-emerald-400">
                  R$ {(apuracao ? (apuracao.impostoDevido || 0) : 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <span className="text-[11px] text-emerald-400/80 mt-1 block">
                  Vencimento: {apuracao?.dataVencimento || '20/11/2026'}
                </span>
              </div>
            </div>

            {/* Painel com Discriminação dos Tributos */}
            <div className="bg-[#181818] border border-white/10 rounded-xl shadow-lg overflow-hidden">
              <div className="px-5 py-3 bg-[#1e1e1e] border-b border-white/10 flex items-center justify-between">
                <h3 className="text-xs font-semibold text-neutral-200 flex items-center space-x-2">
                  <Receipt className="w-4 h-4 text-emerald-400" />
                  <span>Detalhamento dos Tributos Apurados na Competência</span>
                </h3>
                <button
                  onClick={handleExportarExcel}
                  className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded border border-white/10 text-xs flex items-center space-x-1"
                >
                  <Download className="w-3 h-3 text-emerald-400" />
                  <span>Exportar Planilha</span>
                </button>
              </div>

              {apuracao && apuracao.detalhamentoImpostos ? (
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-neutral-900 border-b border-white/10 text-neutral-400 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">Tributo / Enquadramento</th>
                      <th className="py-2.5 px-4 w-32 text-center">Fato Gerador</th>
                      <th className="py-2.5 px-4 w-32 text-right">Base de Cálculo</th>
                      <th className="py-2.5 px-4 w-28 text-right">Alíquota</th>
                      <th className="py-2.5 px-4 w-36 text-right text-emerald-400">Valor Devido</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono text-[12px]">
                    {Object.entries(apuracao.detalhamentoImpostos).map(([tributo, valor], idx) => (
                      <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-2.5 px-4 font-sans font-medium text-neutral-200">
                          {tributo}
                        </td>
                        <td className="py-2.5 px-4 text-center font-sans text-neutral-400 text-[11px]">
                          Faturamento
                        </td>
                        <td className="py-2.5 px-4 text-right text-neutral-300">
                          R$ {faturamentoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-4 text-right text-neutral-400">
                          {((valor / (faturamentoMes || 1)) * 100).toFixed(2)}%
                        </td>
                        <td className="py-2.5 px-4 text-right font-bold text-emerald-400">
                          R$ {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-neutral-900/80 border-t-2 border-white/10 font-bold text-xs">
                    <tr>
                      <td colSpan={4} className="py-3 px-4 text-right text-neutral-300 uppercase tracking-wider">
                        Total de Tributos a Recolher:
                      </td>
                      <td className="py-3 px-4 text-right text-emerald-400 font-mono text-sm">
                        R$ {(apuracao.impostoDevido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              ) : (
                <div className="p-8 text-center text-neutral-400 text-xs">
                  <Calculator className="w-8 h-8 mx-auto mb-2 text-neutral-600" />
                  <p>Nenhuma apuração gerada para a competência {empresa.competenciaAtiva}.</p>
                  <button
                    onClick={handleCalcularApuracao}
                    className="mt-3 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium"
                  >
                    Processar Apuração Agora
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {subAba === 'SEGREGAÇÃO' && (
          <div className="space-y-4">
            {/* Header da Segregação */}
            <div className="p-4 bg-[#181818] border border-white/10 rounded-xl flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-100 flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Segregação Legal de Receitas do Simples Nacional</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono border border-emerald-500/30">
                    Lei Complementar nº 123/2006 Art. 18 § 4º-A
                  </span>
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Exclusão das parcelas de ICMS (Substituição Tributária) e PIS/COFINS (regime Monofásico) da guia DAS oficial.
                </p>
              </div>
              <button
                onClick={handleCalcularApuracao}
                disabled={calculando}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-emerald-900/30"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Recalcular Segregação</span>
              </button>
            </div>

            {/* 4 Cards de Faixas Tributárias Segregadas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Faixa 1 */}
              <div className="p-3.5 bg-[#181818] border border-white/10 rounded-xl space-y-1">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold block">1. Tributação Integral</span>
                <span className="text-xs text-neutral-300 font-medium block">Mercadorias e Serviços Comuns</span>
                <p className="text-lg font-bold font-mono text-neutral-100 pt-1">
                  R$ {(apuracao?.receitaTributadaIntegral || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <div className="text-[11px] text-neutral-500 font-mono flex justify-between pt-1 border-t border-white/5">
                  <span>Alíquota: <strong>8,39%</strong></span>
                  <span className="text-neutral-400">DAS: R$ {Math.round(((apuracao?.receitaTributadaIntegral || 0) * 0.0839) * 100 / 100).toFixed(2)}</span>
                </div>
              </div>

              {/* Faixa 2 */}
              <div className="p-3.5 bg-[#181818] border border-blue-500/20 rounded-xl space-y-1">
                <span className="text-[10px] text-blue-400 uppercase font-semibold block">2. ICMS Substituição Tributária</span>
                <span className="text-xs text-neutral-300 font-medium block">CST 60 / CSOSN 500 (ST Pago)</span>
                <p className="text-lg font-bold font-mono text-blue-400 pt-1">
                  R$ {(apuracao?.receitaSegregadaST || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <div className="text-[11px] text-neutral-500 font-mono flex justify-between pt-1 border-t border-white/5">
                  <span>Alíquota: <strong className="text-blue-300">5,54%</strong></span>
                  <span className="text-emerald-400 font-semibold">-34% ICMS</span>
                </div>
              </div>

              {/* Faixa 3 */}
              <div className="p-3.5 bg-[#181818] border border-amber-500/20 rounded-xl space-y-1">
                <span className="text-[10px] text-amber-400 uppercase font-semibold block">3. PIS/COFINS Monofásicos</span>
                <span className="text-xs text-neutral-300 font-medium block">CST 02/04 (Alíquota Zero Varejo)</span>
                <p className="text-lg font-bold font-mono text-amber-400 pt-1">
                  R$ {(apuracao?.receitaSegregadaMonofasico || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <div className="text-[11px] text-neutral-500 font-mono flex justify-between pt-1 border-t border-white/5">
                  <span>Alíquota: <strong className="text-amber-300">7,09%</strong></span>
                  <span className="text-emerald-400 font-semibold">-15,5% Federais</span>
                </div>
              </div>

              {/* Faixa 4 */}
              <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-1">
                <span className="text-[10px] text-emerald-400 uppercase font-semibold block">4. ST + Monofásicos Simultâneos</span>
                <span className="text-xs text-emerald-200 font-medium block">Autopeças, Lubrificantes, Cosméticos</span>
                <p className="text-lg font-bold font-mono text-emerald-300 pt-1">
                  R$ {(apuracao?.receitaSegregadaSTeMonofasico || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <div className="text-[11px] text-neutral-400 font-mono flex justify-between pt-1 border-t border-emerald-500/20">
                  <span>Alíquota: <strong className="text-emerald-400">4,24%</strong></span>
                  <span className="text-emerald-300 font-bold">-49,5% Isenção</span>
                </div>
              </div>
            </div>

            {/* Painel de Auditoria de Itens Faturados */}
            <div className="bg-[#181818] border border-white/10 rounded-xl shadow-lg overflow-hidden">
              <div className="p-3 bg-neutral-900 border-b border-white/10 flex items-center justify-between text-xs font-semibold text-neutral-300">
                <span>ITENS FATURADOS NA COMPETÊNCIA & ENQUADRAMENTO DE SEGREGAÇÃO</span>
                <span className="font-mono text-neutral-500">Cruzamento de NCM, CFOP e CST</span>
              </div>
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-neutral-900/60 border-b border-white/10 text-neutral-400 font-medium text-[11px]">
                  <tr>
                    <th className="py-2 px-3 w-16 text-center">NF-e</th>
                    <th className="py-2 px-3 w-24">Código</th>
                    <th className="py-2 px-3">Descrição do Produto / Mercadoria</th>
                    <th className="py-2 px-3 w-20 text-center">NCM</th>
                    <th className="py-2 px-3 w-16 text-center">CFOP</th>
                    <th className="py-2 px-3 w-16 text-center">CST ICMS</th>
                    <th className="py-2 px-3 w-16 text-center">CST PIS</th>
                    <th className="py-2 px-3 w-28 text-right">Valor Total</th>
                    <th className="py-2 px-3 w-40 text-center">Status de Segregação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                  {notasCompetencia.filter(n => n.tipo === 'SAIDA' || n.tipo === 'SERVICO').flatMap(n =>
                    (n.itens || []).map(item => {
                      const isST = item.cstICMS === '60' || item.cfop === '5.405';
                      const isMono = item.cstPIS === '04' || item.ncm?.startsWith('8507') || item.ncm?.startsWith('2710');
                      return (
                        <tr key={`${n.id}-${item.id}`} className="hover:bg-white/[0.02]">
                          <td className="py-2 px-3 text-center text-neutral-400">#{n.numero}</td>
                          <td className="py-2 px-3 text-neutral-300">{item.codigoProduto}</td>
                          <td className="py-2 px-3 font-sans text-neutral-200">{item.descricao}</td>
                          <td className="py-2 px-3 text-center text-neutral-400">{item.ncm}</td>
                          <td className="py-2 px-3 text-center font-bold text-neutral-300">{item.cfop}</td>
                          <td className="py-2 px-3 text-center text-neutral-400">{item.cstICMS || '00'}</td>
                          <td className="py-2 px-3 text-center text-neutral-400">{item.cstPIS || '01'}</td>
                          <td className="py-2 px-3 text-right font-bold text-neutral-100">
                            R$ {item.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {isST && isMono ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                ST + Monofásico (-49,5%)
                              </span>
                            ) : isST ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                ICMS ST (-34%)
                              </span>
                            ) : isMono ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                Monofásico (-15,5%)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-800 text-neutral-400">
                                Tributação Integral
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {subAba === 'GUIAS' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Guia DAS (Simples Nacional) */}
              {empresa.regimeTributario === 'SIMPLES_NACIONAL' && apuracao && (
                <div className="bg-[#181818] border border-emerald-500/30 rounded-xl p-4 shadow flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold border border-emerald-500/30">
                        PGDAS-D • GUIA ÚNICA
                      </span>
                      <span className="text-xs text-neutral-400 font-mono">
                        Venc: {apuracao.dataVencimento || '20/11/2026'}
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-sm">
                      Documento de Arrecadação do Simples Nacional (DAS)
                    </h4>

                    <div className="text-xs text-neutral-400 space-y-1 font-mono pt-1">
                      <div>Contribuinte: <span className="text-neutral-200">{empresa.razaoSocial}</span></div>
                      <div>CNPJ: <span className="text-neutral-200">{empresa.cnpj}</span></div>
                      <div>Competência: <span className="text-neutral-200">{empresa.competenciaAtiva}</span></div>
                    </div>

                    <div className="p-3 bg-[#121212] rounded border border-white/5 space-y-1 mt-2">
                      <span className="text-[10px] text-neutral-400 block">Linha Digitável / Código de Barras:</span>
                      <span className="font-mono text-[11px] text-amber-400 block tracking-wider">
                        85830000001-2 36890385261-0 01001202610-8 00000000000-0
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between mt-3">
                    <div className="text-sm font-bold font-mono text-emerald-400">
                      R$ {(apuracao.valorDAS || apuracao.impostoDevido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <button
                      onClick={() => handleImprimirGuiaIndividual('Documento de Arrecadação do Simples Nacional (DAS)', apuracao.valorDAS || apuracao.impostoDevido || 0, 'DAS-PGDAS')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium flex items-center space-x-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Imprimir DAS A4</span>
                    </button>
                  </div>
                </div>
              )}

              {/* DARF PIS */}
              {apuracao && (apuracao.valorPISApurado || 0) > 0 && (
                <div className="bg-[#181818] border border-white/10 rounded-xl p-4 shadow flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-bold border border-blue-500/30">
                        DARF • CÓD. 8109
                      </span>
                      <span className="text-xs text-neutral-400 font-mono">
                        Venc: 25/11/2026
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-sm">
                      DARF - PIS sobre Faturamento Mensal
                    </h4>
                    <p className="text-xs text-neutral-400 font-mono">
                      Receita de PIS Cumulativo / Não Cumulativo
                    </p>
                  </div>
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between mt-3">
                    <div className="text-sm font-bold font-mono text-blue-400">
                      R$ {(apuracao.valorPISApurado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <button
                      onClick={() => handleImprimirGuiaIndividual('DARF PIS s/ Faturamento', apuracao.valorPISApurado || 0, '8109')}
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs font-medium flex items-center space-x-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Imprimir DARF</span>
                    </button>
                  </div>
                </div>
              )}

              {/* DARF COFINS */}
              {apuracao && (apuracao.valorCOFINSApurado || 0) > 0 && (
                <div className="bg-[#181818] border border-white/10 rounded-xl p-4 shadow flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-bold border border-blue-500/30">
                        DARF • CÓD. 2172
                      </span>
                      <span className="text-xs text-neutral-400 font-mono">
                        Venc: 25/11/2026
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-sm">
                      DARF - COFINS sobre Faturamento Mensal
                    </h4>
                    <p className="text-xs text-neutral-400 font-mono">
                      Receita de COFINS Cumulativa (3,00%)
                    </p>
                  </div>
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between mt-3">
                    <div className="text-sm font-bold font-mono text-blue-400">
                      R$ {(apuracao.valorCOFINSApurado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <button
                      onClick={() => handleImprimirGuiaIndividual('DARF COFINS s/ Faturamento', apuracao.valorCOFINSApurado || 0, '2172')}
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs font-medium flex items-center space-x-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Imprimir DARF</span>
                    </button>
                  </div>
                </div>
              )}

              {/* DAE ICMS */}
              {apuracao && (apuracao.valorICMSApurado || 0) > 0 && (
                <div className="bg-[#181818] border border-white/10 rounded-xl p-4 shadow flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded font-bold border border-indigo-500/30">
                        DAE / GARE • CÓD. 046-2
                      </span>
                      <span className="text-xs text-neutral-400 font-mono">
                        Venc: 20/11/2026
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-sm">
                      DAE - ICMS Operações Próprias Estadual
                    </h4>
                    <p className="text-xs text-neutral-400 font-mono">
                      Saldo Devedor de ICMS (Débitos - Créditos)
                    </p>
                  </div>
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between mt-3">
                    <div className="text-sm font-bold font-mono text-indigo-400">
                      R$ {(apuracao.valorICMSApurado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <button
                      onClick={() => handleImprimirGuiaIndividual('DAE ICMS Próprio', apuracao.valorICMSApurado || 0, '046-2')}
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs font-medium flex items-center space-x-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Imprimir DAE</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {subAba === 'MEMORIA_CALCULO' && (
          <div className="bg-[#181818] border border-white/10 rounded-xl overflow-hidden shadow">
            <div className="px-5 py-3 bg-[#1e1e1e] border-b border-white/10 flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-200">
                Memória de Notas Fiscais da Competência {empresa.competenciaAtiva} ({notasCompetencia.length} documentos)
              </span>
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-neutral-900 border-b border-white/10 text-neutral-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3 w-16 text-center">Modelo</th>
                  <th className="py-2.5 px-3 w-20">Número</th>
                  <th className="py-2.5 px-3 w-24">Emissão</th>
                  <th className="py-2.5 px-3">Destinatário / Participante</th>
                  <th className="py-2.5 px-3 w-20 text-center">Tipo</th>
                  <th className="py-2.5 px-3 w-32 text-right">Valor Total</th>
                  <th className="py-2.5 px-3 w-28 text-right">ICMS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                {notasCompetencia.map(n => (
                  <tr key={n.id} className="hover:bg-white/[0.02]">
                    <td className="py-2 px-3 text-center text-neutral-400">{n.modelo}</td>
                    <td className="py-2 px-3 text-white font-bold">{n.numero}</td>
                    <td className="py-2 px-3 text-neutral-300">{n.dataEmissao}</td>
                    <td className="py-2 px-3 font-sans text-neutral-200">{n.participanteNome}</td>
                    <td className="py-2 px-3 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${n.tipo === 'SAIDA' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                        {n.tipo}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-white">
                      R$ {n.valorTotal.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-right text-neutral-400">
                      R$ {(n.valorICMS || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 bg-[#181818] border-t border-white/10 flex flex-wrap items-center justify-between text-xs font-mono gap-3">
        <div className="text-neutral-400">
          Documentos Fiscais no Mês: <strong className="text-neutral-200 font-bold">{notasCompetencia.length}</strong> • Regime: <strong className="text-neutral-200">{empresa.regimeTributario}</strong>
        </div>
        <div className="flex items-center space-x-5">
          <span>Faturamento: <strong className="text-neutral-100">R$ {faturamentoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
          <span>•</span>
          <span>Status da Apuração: <strong className={apuracao ? 'text-emerald-400' : 'text-amber-400'}>{apuracao ? 'CALCULADA' : 'PENDENTE'}</strong></span>
          <span>•</span>
          <span>Imposto a Recolher: <strong className="text-emerald-400">R$ {(apuracao ? (apuracao.impostoDevido || 0) : 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
        </div>
      </div>
    </div>
  );
};
