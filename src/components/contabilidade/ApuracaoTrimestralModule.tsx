import React, { useState, useMemo } from 'react';
import { Empresa, ApuracaoTrimestralIRPJCSLL } from '../../types/contabil';
import { dbService } from '../../db/sqliteService';
import { exportToCSV } from '../../utils/exportUtils';
import {
  Calculator,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Building2,
  ShieldCheck,
  Search,
  Zap,
  Calendar,
  Layers,
  Info,
  DollarSign,
  Receipt,
  QrCode,
  PieChart
} from 'lucide-react';

interface ApuracaoTrimestralModuleProps {
  empresa: Empresa;
  onOpenReportPreview?: (config: { titulo: string; subtitulo: string; conteudo: React.ReactNode }) => void;
  onIntegracaoSucesso?: () => void;
}

export const ApuracaoTrimestralModule: React.FC<ApuracaoTrimestralModuleProps> = ({
  empresa,
  onOpenReportPreview,
  onIntegracaoSucesso
}) => {
  const [trimestre, setTrimestre] = useState<1 | 2 | 3 | 4>(3); // 3º Trimestre
  const [ano, setAno] = useState<number>(2026);
  const [notificacao, setNotificacao] = useState<{ tipo: 'success' | 'info'; mensagem: string } | null>(null);

  // Apuração do Trimestre
  const apuracao: ApuracaoTrimestralIRPJCSLL = useMemo(() => {
    return dbService.getApuracaoTrimestralIRPJCSLL(empresa.id, ano, trimestre);
  }, [empresa.id, ano, trimestre]);

  // Integração Contábil Direta
  const handleIntegrarContabil = () => {
    const res = dbService.integrarApuracaoTrimestralContabil(empresa.id, trimestre);
    if (res.success) {
      setNotificacao({
        tipo: 'success',
        mensagem: `Provisão de IRPJ e CSLL integrada! Lote nº ${res.loteId} gerado no Livro Diário com sucesso.`
      });
      onIntegracaoSucesso?.();
    } else {
      setNotificacao({
        tipo: 'info',
        mensagem: 'Não foi possível integrar a apuração trimestral.'
      });
    }
    setTimeout(() => setNotificacao(null), 5000);
  };

  // Exportar CSV
  const handleExportarCSV = () => {
    const dados = [
      { Parametro: 'Periodo', Valor: apuracao.periodoDescricao },
      { Parametro: 'Receita Bruta Comercio', Valor: apuracao.receitaBrutaComercio },
      { Parametro: 'Receita Bruta Servicos', Valor: apuracao.receitaBrutaServicos },
      { Parametro: 'Total Receita Bruta', Valor: apuracao.totalReceitaBruta },
      { Parametro: 'Base Presumida IRPJ', Valor: apuracao.baseCalculoTotalIRPJ },
      { Parametro: 'IRPJ Normal 15%', Valor: apuracao.valorIRPJNormal },
      { Parametro: 'Adicional IRPJ 10%', Valor: apuracao.valorAdicionalIRPJ },
      { Parametro: 'Total IRPJ Devido', Valor: apuracao.totalIRPJDevido },
      { Parametro: 'IRRF Retido Dedutivel', Valor: apuracao.irrfRetidoDedutivel },
      { Parametro: 'IRPJ Liquido DARF 2089', Valor: apuracao.valorLiquidoIRPJARecolher },
      { Parametro: 'Base Presumida CSLL', Valor: apuracao.baseCalculoTotalCSLL },
      { Parametro: 'CSLL Devida 9%', Valor: apuracao.totalCSLLDevido },
      { Parametro: 'CSRF Retida Dedutivel', Valor: apuracao.csrfRetidoDedutivel },
      { Parametro: 'CSLL Liquida DARF 2372', Valor: apuracao.valorLiquidoCSLLARecolher },
      { Parametro: 'Total Tributos a Recolher', Valor: apuracao.valorLiquidoIRPJARecolher + apuracao.valorLiquidoCSLLARecolher }
    ];
    exportToCSV(dados, `Apuracao_Trimestral_IRPJ_CSLL_${ano}_Tri${trimestre}`);
  };

  // Impressão Oficial A4 da Memória de Cálculo e DARFs
  const handleImprimirMemoriaA4 = () => {
    if (!onOpenReportPreview) return;

    const conteudoA4 = (
      <div className="space-y-4 text-neutral-900 font-sans">
        <div className="border-b-2 border-neutral-900 pb-3 text-center">
          <h2 className="text-base font-bold uppercase tracking-wider">
            Demonstrativo de Apuração Trimestral do IRPJ e da CSLL (Lucro Presumido)
          </h2>
          <p className="text-xs text-neutral-600 font-mono mt-0.5">
            {empresa.razaoSocial} | CNPJ: {empresa.cnpj} | {apuracao.periodoDescricao}
          </p>
          <p className="text-[10px] text-neutral-500 uppercase mt-0.5">
            Fundamentação: Lei nº 9.249/95, Lei nº 9.430/96 e Instrução Normativa RFB nº 1.700/2017
          </p>
        </div>

        {/* Resumo da Receita Bruta do Trimestre */}
        <div className="p-3 border border-neutral-300 rounded bg-neutral-50 text-xs">
          <h3 className="font-bold uppercase text-[10px] border-b pb-1 mb-2">Composição da Receita Bruta do Trimestre</h3>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <span className="text-[10px] text-neutral-500 block">Comércio & Venda de Mercadorias</span>
              <span className="font-mono font-bold">R$ {apuracao.receitaBrutaComercio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 block">Prestação de Serviços em Geral</span>
              <span className="font-mono font-bold">R$ {apuracao.receitaBrutaServicos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-neutral-500 block font-bold">Total da Receita Bruta</span>
              <span className="font-mono font-black text-sm text-black">
                R$ {apuracao.totalReceitaBruta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Grade Comparativa IRPJ x CSLL */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          {/* Coluna IRPJ */}
          <div className="border border-neutral-300 rounded p-3 space-y-2 bg-white">
            <div className="flex items-center justify-between border-b pb-1">
              <h4 className="font-bold uppercase text-[11px] text-rose-900">IRPJ - Cód. 2089 (Presumido)</h4>
              <span className="text-[10px] font-mono font-bold bg-rose-50 text-rose-800 px-1.5 py-0.5 rounded border border-rose-200">DARF 2089</span>
            </div>
            <table className="w-full text-[10px]">
              <tbody>
                <tr>
                  <td className="py-0.5 text-neutral-600">Base Presumida Comércio (8%):</td>
                  <td className="py-0.5 text-right font-mono">R$ {apuracao.basePresumidaIRPJComercio.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-0.5 text-neutral-600">Base Presumida Serviços (32%):</td>
                  <td className="py-0.5 text-right font-mono">R$ {apuracao.basePresumidaIRPJServicos.toFixed(2)}</td>
                </tr>
                <tr className="border-t font-semibold">
                  <td className="py-0.5">Base de Cálculo Total IRPJ:</td>
                  <td className="py-0.5 text-right font-mono">R$ {apuracao.baseCalculoTotalIRPJ.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-0.5 text-neutral-600">IRPJ Normal (15%):</td>
                  <td className="py-0.5 text-right font-mono">R$ {apuracao.valorIRPJNormal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-0.5 text-neutral-600">Adicional 10% (excedente a R$ 60k):</td>
                  <td className="py-0.5 text-right font-mono">R$ {apuracao.valorAdicionalIRPJ.toFixed(2)}</td>
                </tr>
                <tr className="font-semibold text-neutral-700">
                  <td className="py-0.5">Total IRPJ Devido:</td>
                  <td className="py-0.5 text-right font-mono">R$ {apuracao.totalIRPJDevido.toFixed(2)}</td>
                </tr>
                <tr className="text-emerald-700">
                  <td className="py-0.5">(-) Retenções na Fonte (IRRF):</td>
                  <td className="py-0.5 text-right font-mono">- R$ {apuracao.irrfRetidoDedutivel.toFixed(2)}</td>
                </tr>
                <tr className="border-t-2 border-neutral-900 font-bold bg-neutral-100 text-black">
                  <td className="py-1 uppercase">IRPJ Líquido a Recolher:</td>
                  <td className="py-1 text-right font-mono text-sm">
                    R$ {apuracao.valorLiquidoIRPJARecolher.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Coluna CSLL */}
          <div className="border border-neutral-300 rounded p-3 space-y-2 bg-white">
            <div className="flex items-center justify-between border-b pb-1">
              <h4 className="font-bold uppercase text-[11px] text-sky-900">CSLL - Cód. 2372 (Presumido)</h4>
              <span className="text-[10px] font-mono font-bold bg-sky-50 text-sky-800 px-1.5 py-0.5 rounded border border-sky-200">DARF 2372</span>
            </div>
            <table className="w-full text-[10px]">
              <tbody>
                <tr>
                  <td className="py-0.5 text-neutral-600">Base Presumida Comércio (12%):</td>
                  <td className="py-0.5 text-right font-mono">R$ {apuracao.basePresumidaCSLLComercio.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-0.5 text-neutral-600">Base Presumida Serviços (32%):</td>
                  <td className="py-0.5 text-right font-mono">R$ {apuracao.basePresumidaCSLLServicos.toFixed(2)}</td>
                </tr>
                <tr className="border-t font-semibold">
                  <td className="py-0.5">Base de Cálculo Total CSLL:</td>
                  <td className="py-0.5 text-right font-mono">R$ {apuracao.baseCalculoTotalCSLL.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-0.5 text-neutral-600">Alíquota CSLL:</td>
                  <td className="py-0.5 text-right font-mono">9,00%</td>
                </tr>
                <tr className="font-semibold text-neutral-700">
                  <td className="py-0.5">Total CSLL Devida:</td>
                  <td className="py-0.5 text-right font-mono">R$ {apuracao.totalCSLLDevido.toFixed(2)}</td>
                </tr>
                <tr className="text-emerald-700">
                  <td className="py-0.5">(-) Retenções na Fonte (CSRF 1%):</td>
                  <td className="py-0.5 text-right font-mono">- R$ {apuracao.csrfRetidoDedutivel.toFixed(2)}</td>
                </tr>
                <tr className="border-t-2 border-neutral-900 font-bold bg-neutral-100 text-black">
                  <td className="py-1 uppercase">CSLL Líquida a Recolher:</td>
                  <td className="py-1 text-right font-mono text-sm">
                    R$ {apuracao.valorLiquidoCSLLARecolher.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Total Consolidado dos DARFs */}
        <div className="p-3 border-2 border-neutral-900 rounded bg-neutral-100 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold uppercase text-[11px] block">Total Geral dos Tributos Federais a Recolher</span>
            <span className="text-[10px] text-neutral-600">Vencimento da Quota Única / 1ª Quota: {apuracao.dataVencimentoQuota1}</span>
          </div>
          <span className="text-base font-black font-mono">
            R$ {(apuracao.valorLiquidoIRPJARecolher + apuracao.valorLiquidoCSLLARecolher).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Assinaturas Oficiais */}
        <div className="pt-6 grid grid-cols-2 gap-8 text-center text-xs">
          <div className="border-t border-neutral-400 pt-2">
            <p className="font-bold">{empresa.razaoSocial}</p>
            <p className="text-[10px] text-neutral-500">Diretor / Administrador Responsável</p>
          </div>
          <div className="border-t border-neutral-400 pt-2">
            <p className="font-bold">{empresa.contadorNome || 'Helena Silveira Santos'}</p>
            <p className="text-[10px] text-neutral-500">CRC: {empresa.contadorCRC || 'CRC-SP 123456/O-0'} / Contador</p>
          </div>
        </div>
      </div>
    );

    onOpenReportPreview({
      titulo: 'Memória de Cálculo - IRPJ e CSLL Trimestral',
      subtitulo: `${empresa.razaoSocial} - ${apuracao.periodoDescricao}`,
      conteudo: conteudoA4
    });
  };

  return (
    <div className="h-full flex flex-col p-6 bg-[#141414] text-neutral-100 select-none overflow-hidden font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-white/10 gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600/10 border border-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
            <Calculator size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span>Apuração Trimestral IRPJ & CSLL (Lucro Presumido)</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono font-medium">
                Lei 9.249/95 / ECF
              </span>
            </h1>
            <p className="text-xs text-neutral-400">
              Cálculo das presunções da receita (8% e 32%), adicional de 10%, compensação de IRRF e geração de DARF 2089 / 2372
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Seletor de Trimestre */}
          <div className="flex items-center bg-[#1c1c1c] border border-white/10 rounded-lg p-1 text-xs">
            <button
              onClick={() => setTrimestre(1)}
              className={`px-2.5 py-1 rounded font-medium ${trimestre === 1 ? 'bg-white/15 text-white' : 'text-neutral-400'}`}
            >
              1º Tri
            </button>
            <button
              onClick={() => setTrimestre(2)}
              className={`px-2.5 py-1 rounded font-medium ${trimestre === 2 ? 'bg-white/15 text-white' : 'text-neutral-400'}`}
            >
              2º Tri
            </button>
            <button
              onClick={() => setTrimestre(3)}
              className={`px-2.5 py-1 rounded font-medium ${trimestre === 3 ? 'bg-white/15 text-white' : 'text-neutral-400'}`}
            >
              3º Tri
            </button>
            <button
              onClick={() => setTrimestre(4)}
              className={`px-2.5 py-1 rounded font-medium ${trimestre === 4 ? 'bg-white/15 text-white' : 'text-neutral-400'}`}
            >
              4º Tri
            </button>
          </div>

          <button
            onClick={handleExportarCSV}
            className="px-3 py-1.5 text-xs bg-[#202020] hover:bg-[#282828] text-neutral-300 rounded border border-white/10 flex items-center space-x-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleImprimirMemoriaA4}
            className="px-3 py-1.5 text-xs bg-[#202020] hover:bg-[#282828] text-neutral-300 rounded border border-white/10 flex items-center space-x-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span>Memória A4</span>
          </button>

          <button
            onClick={handleIntegrarContabil}
            disabled={apuracao.integradoContabil}
            className={`px-3 py-1.5 text-xs font-semibold rounded shadow flex items-center space-x-1.5 transition-colors ${
              apuracao.integradoContabil
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-white/5'
                : 'bg-rose-600 hover:bg-rose-500 text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{apuracao.integradoContabil ? 'Provisões Integradas' : 'Integrar Provisão Contábil'}</span>
          </button>
        </div>
      </div>

      {/* Banner de Notificação */}
      {notificacao && (
        <div className="mt-3 p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex items-center justify-between text-xs animate-in fade-in flex-shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-medium">{notificacao.mensagem}</span>
          </div>
          <button onClick={() => setNotificacao(null)} className="text-neutral-400 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 flex-shrink-0">
        <div className="p-4 rounded-xl bg-[#181818] border border-white/5 space-y-1">
          <span className="text-[11px] text-neutral-400 font-medium uppercase">Receita Bruta do Trimestre</span>
          <div className="text-xl font-bold font-mono text-white">
            R$ {apuracao.totalReceitaBruta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-neutral-500 block font-mono">
            Comércio: R$ {apuracao.receitaBrutaComercio.toFixed(2)} | Serviços: R$ {apuracao.receitaBrutaServicos.toFixed(2)}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#181818] border border-white/5 space-y-1">
          <span className="text-[11px] text-neutral-400 font-medium uppercase">DARF 2089 (IRPJ a Recolher)</span>
          <div className="text-xl font-bold font-mono text-rose-400">
            R$ {apuracao.valorLiquidoIRPJARecolher.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-neutral-500 block font-mono">
            Normal: R$ {apuracao.valorIRPJNormal.toFixed(2)} | Adic. 10%: R$ {apuracao.valorAdicionalIRPJ.toFixed(2)}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#181818] border border-white/5 space-y-1">
          <span className="text-[11px] text-neutral-400 font-medium uppercase">DARF 2372 (CSLL a Recolher)</span>
          <div className="text-xl font-bold font-mono text-sky-400">
            R$ {apuracao.valorLiquidoCSLLARecolher.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-neutral-500 block font-mono">Alíquota 9% s/ base presumida</span>
        </div>

        <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-1">
          <span className="text-[11px] text-rose-300 font-medium uppercase">Total Federal do Trimestre</span>
          <div className="text-xl font-bold font-mono text-rose-300">
            R$ {(apuracao.valorLiquidoIRPJARecolher + apuracao.valorLiquidoCSLLARecolher).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-rose-400/80 block font-sans">
            {apuracao.integradoContabil ? '✓ Lote contabilizado no Diário' : 'Vencimento dia 30 subsequente'}
          </span>
        </div>
      </div>

      {/* Grade Principal Comparativa IRPJ x CSLL */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 overflow-hidden">
        {/* Painel IRPJ */}
        <div className="bg-[#181818] border border-white/10 rounded-xl p-5 flex flex-col justify-between overflow-y-auto space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-mono text-xs font-bold border border-rose-500/30">
                DARF 2089
              </span>
              <h3 className="text-sm font-semibold text-white">Imposto de Renda Pessoa Jurídica (IRPJ)</h3>
            </div>
            <span className="text-xs font-mono text-neutral-400">Base Presumida: R$ {apuracao.baseCalculoTotalIRPJ.toFixed(2)}</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-neutral-400">Receita de Comércio (Presunção 8%):</span>
              <span className="font-mono text-neutral-200">R$ {apuracao.basePresumidaIRPJComercio.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-neutral-400">Receita de Serviços (Presunção 32%):</span>
              <span className="font-mono text-neutral-200">R$ {apuracao.basePresumidaIRPJServicos.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-neutral-400">IRPJ Alíquota Normal (15%):</span>
              <span className="font-mono text-sky-400">R$ {apuracao.valorIRPJNormal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-neutral-400">Adicional de 10% s/ excedente a R$ 60.000,00:</span>
              <span className="font-mono text-amber-400">R$ {apuracao.valorAdicionalIRPJ.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5 text-emerald-400 font-semibold">
              <span>(-) Retenção de IRRF Sofrida na Fonte:</span>
              <span className="font-mono">- R$ {apuracao.irrfRetidoDedutivel.toFixed(2)}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#141414] border border-white/10 flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-neutral-300">IRPJ Líquido a Recolher</span>
            <span className="text-lg font-bold font-mono text-rose-400">
              R$ {apuracao.valorLiquidoIRPJARecolher.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Painel CSLL */}
        <div className="bg-[#181818] border border-white/10 rounded-xl p-5 flex flex-col justify-between overflow-y-auto space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-mono text-xs font-bold border border-sky-500/30">
                DARF 2372
              </span>
              <h3 className="text-sm font-semibold text-white">Contribuição Social s/ o Lucro Líquido (CSLL)</h3>
            </div>
            <span className="text-xs font-mono text-neutral-400">Base Presumida: R$ {apuracao.baseCalculoTotalCSLL.toFixed(2)}</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-neutral-400">Receita de Comércio (Presunção 12%):</span>
              <span className="font-mono text-neutral-200">R$ {apuracao.basePresumidaCSLLComercio.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-neutral-400">Receita de Serviços (Presunção 32%):</span>
              <span className="font-mono text-neutral-200">R$ {apuracao.basePresumidaCSLLServicos.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-neutral-400">Alíquota da Contribuição Social:</span>
              <span className="font-mono text-neutral-300">9,00%</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-neutral-400">Total da CSLL Apurada:</span>
              <span className="font-mono text-sky-400">R$ {apuracao.totalCSLLDevido.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5 text-emerald-400 font-semibold">
              <span>(-) Retenção de CSLL na Fonte (CSRF 1%):</span>
              <span className="font-mono">- R$ {apuracao.csrfRetidoDedutivel.toFixed(2)}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#141414] border border-white/10 flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-neutral-300">CSLL Líquida a Recolher</span>
            <span className="text-lg font-bold font-mono text-sky-400">
              R$ {apuracao.valorLiquidoCSLLARecolher.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
