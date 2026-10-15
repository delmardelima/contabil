import React, { useState } from 'react';
import { ContaContabil, LancamentoContabil } from '../../types/contabil';
import { AccountingEngine } from '../../engine/accountingEngine';
import { exportToCSV } from '../../utils/exportUtils';
import { PieChart, TrendingUp, Percent, DollarSign, Download, Calendar, BarChart3 } from 'lucide-react';

interface DREModuleProps {
  contas: ContaContabil[];
  lancamentos: LancamentoContabil[];
}

export const DREModule: React.FC<DREModuleProps> = ({ contas, lancamentos }) => {
  const [modoVisualizacao, setModoVisualizacao] = useState<'MENSAL' | 'EVOLUCAO_12_MESES'>('MENSAL');
  const [anoReferencia, setAnoReferencia] = useState<number>(2026);

  // DRE Padrão Mensal
  const {
    items,
    receitaLiquida,
    lucroBruto,
    resultadoOperacional,
    lucroLiquido
  } = AccountingEngine.generateIncomeStatement(contas, lancamentos);

  const margemBruta = receitaLiquida > 0 ? (lucroBruto / receitaLiquida) * 100 : 0;
  const margemLiquida = receitaLiquida > 0 ? (lucroLiquido / receitaLiquida) * 100 : 0;

  // DRE Comparativa 12 Meses ( Sistemas)
  const multiPeriodDRE = AccountingEngine.generateMultiPeriodDRE(contas, lancamentos, anoReferencia);
  const mesesHeaders = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  const recLiqAnual = multiPeriodDRE.find(d => d.descricao.includes('RECEITA OPERACIONAL LÍQUIDA'))?.totalAno || 0;
  const lucroLiqAnual = multiPeriodDRE.find(d => d.descricao.includes('RESULTADO LÍQUIDO'))?.totalAno || 0;
  const margemLiqAnual = recLiqAnual > 0 ? (lucroLiqAnual / recLiqAnual) * 100 : 0;

  const handleExportCSV = () => {
    if (modoVisualizacao === 'MENSAL') {
      const headers = ['Linha', 'Descrição da Linha', 'Tipo', 'Operação', 'Valor Período (R$)', 'Análise Vertical (%)'];
      const rows: (string | number)[][] = items.map(i => [
        i.ordem,
        i.descricao,
        i.tipoLinha || 'CONTA',
        i.operacao || 'SOMA',
        i.operacao === 'SUBTRAI' ? -i.valor : i.valor,
        ((i.analiseVerticalPerc ?? 0).toFixed(2)) + '%'
      ]);
      exportToCSV(`DRE_Dedutiva_${new Date().toISOString().split('T')[0]}`, rows, headers);
    } else {
      const headers = ['Linha', 'Descrição Dedutiva da Conta', ...mesesHeaders, `Total ${anoReferencia}`, 'Média Mensal'];
      const rows: (string | number)[][] = multiPeriodDRE.map(i => [
        i.ordem,
        i.descricao,
        ...i.meses.map(v => i.operacao === 'SUBTRAI' && v !== 0 ? -v : v),
        i.operacao === 'SUBTRAI' && i.totalAno !== 0 ? -i.totalAno : i.totalAno,
        i.operacao === 'SUBTRAI' && i.mediaMensal !== 0 ? -i.mediaMensal : i.mediaMensal
      ]);
      exportToCSV(`DRE_Evolucao_12Meses_${anoReferencia}`, rows, headers);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#141414] text-neutral-200 overflow-y-auto p-4 select-none custom-scrollbar">
      {/* Sub-header de visualização e filtros */}
      <div className="px-4 py-2.5 bg-[#181818] border border-white/10 rounded-xl mb-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-[#101010] p-0.5 rounded-lg border border-white/10">
            <button
              onClick={() => setModoVisualizacao('MENSAL')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition flex items-center space-x-1.5 ${modoVisualizacao === 'MENSAL'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
                }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>DRE Mensal Dedutiva</span>
            </button>
            <button
              onClick={() => setModoVisualizacao('EVOLUCAO_12_MESES')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition flex items-center space-x-1.5 ${modoVisualizacao === 'EVOLUCAO_12_MESES'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
                }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Evolução 12 Meses ()</span>
            </button>
          </div>

          {modoVisualizacao === 'EVOLUCAO_12_MESES' && (
            <div className="flex items-center space-x-1.5">
              <span className="text-neutral-400 text-[11px]">Exercício:</span>
              <select
                value={anoReferencia}
                onChange={(e) => setAnoReferencia(Number(e.target.value))}
                className="bg-[#121212] border border-white/10 rounded px-2 py-0.5 text-neutral-200 outline-none text-[11px]"
              >
                <option value={2026}>2026</option>
                <option value={2025}>2025</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded border border-white/10 transition-colors"
            title="Exportar DRE para Excel / CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exportar Excel (CSV)</span>
          </button>
          <span className="text-neutral-400 font-mono text-[11px]">
            {modoVisualizacao === 'MENSAL' ? 'Competência Ativa • Regime de Competência' : `Exercício ${anoReferencia} • Análise Horizontal`}
          </span>
        </div>
      </div>

      {/* Cards de Métricas e Margens Executivas */}
      {modoVisualizacao === 'MENSAL' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-3.5 shadow">
            <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
              <span>Receita Operacional Líquida</span>
              <DollarSign className="w-4 h-4 text-blue-400" />
            </div>
            <div className="font-mono font-bold text-lg text-neutral-100">
              R$ {receitaLiquida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-blue-400 mt-1 flex items-center space-x-1">
              <span>Base 100% da Análise Vertical</span>
            </div>
          </div>

          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-3.5 shadow">
            <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
              <span>Lucro Bruto Operacional</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="font-mono font-bold text-lg text-emerald-400">
              R$ {lucroBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-emerald-400/80 mt-1">
              Margem Bruta: <strong>{margemBruta.toFixed(1)}%</strong>
            </div>
          </div>

          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-3.5 shadow">
            <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
              <span>Resultado Operacional</span>
              <PieChart className="w-4 h-4 text-indigo-400" />
            </div>
            <div className={`font-mono font-bold text-lg ${resultadoOperacional >= 0 ? 'text-indigo-400' : 'text-rose-400'}`}>
              R$ {resultadoOperacional.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-neutral-400 mt-1">
              Antes dos tributos e zeramento
            </div>
          </div>

          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-3.5 shadow">
            <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
              <span>Lucro Líquido do Período</span>
              <Percent className="w-4 h-4 text-emerald-400" />
            </div>
            <div className={`font-mono font-bold text-lg ${lucroLiquido >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              R$ {lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className={`text-[11px] mt-1 ${margemLiquida >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              Margem Líquida: <strong>{margemLiquida.toFixed(1)}%</strong>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-3.5 shadow">
            <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
              <span>Receita Líquida Anual ({anoReferencia})</span>
              <DollarSign className="w-4 h-4 text-blue-400" />
            </div>
            <div className="font-mono font-bold text-lg text-neutral-100">
              R$ {recLiqAnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-neutral-400 mt-1">
              Média: R$ {(recLiqAnual / 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / mês
            </div>
          </div>

          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-3.5 shadow">
            <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
              <span>Lucro Líquido Acumulado</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className={`font-mono font-bold text-lg ${lucroLiqAnual >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              R$ {lucroLiqAnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-emerald-400/80 mt-1">
              Margem Líquida Anual: <strong>{margemLiqAnual.toFixed(1)}%</strong>
            </div>
          </div>

          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-3.5 shadow">
            <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
              <span>Média Mensal de Lucro</span>
              <PieChart className="w-4 h-4 text-indigo-400" />
            </div>
            <div className={`font-mono font-bold text-lg ${(lucroLiqAnual / 12) >= 0 ? 'text-indigo-400' : 'text-rose-400'}`}>
              R$ {(lucroLiqAnual / 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-neutral-400 mt-1">
              Base 12 meses do exercício
            </div>
          </div>

          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-3.5 shadow">
            <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
              <span>Desempenho Geral</span>
              <Percent className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="font-mono font-bold text-lg text-emerald-400">
              {lucroLiqAnual > 0 ? 'SUPERAVITÁRIO' : (lucroLiqAnual < 0 ? 'DEFICITÁRIO' : 'EQUILIBRADO')}
            </div>
            <div className="text-[11px] text-neutral-400 mt-1">
              Indicador Sintético CFC
            </div>
          </div>
        </div>
      )}

      {/* Grade Dedutiva da DRE */}
      <div className="bg-[#181818] border border-white/10 rounded-xl shadow-lg overflow-hidden">
        {modoVisualizacao === 'MENSAL' ? (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-neutral-900 border-b border-white/10 text-neutral-400 font-medium">
              <tr>
                <th className="py-2.5 px-4 w-12 text-center">Linha</th>
                <th className="py-2.5 px-4">Descrição Dedutiva da Conta / Subtotal</th>
                <th className="py-2.5 px-4 w-44 text-right">Valor Período (R$)</th>
                <th className="py-2.5 px-4 w-32 text-center">Análise Vertical (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {items.map((item) => {
                const isSubtotal = item.tipoLinha === 'SUBTOTAL';
                const isTotalGeral = item.tipoLinha === 'TOTAL_GERAL';
                const isSubtrai = item.operacao === 'SUBTRAI';

                return (
                  <tr
                    key={item.id ?? item.ordem}
                    className={`transition-colors ${isTotalGeral
                        ? 'bg-emerald-950/20 font-bold text-neutral-100 text-sm border-t-2 border-emerald-500/40'
                        : isSubtotal
                          ? 'bg-neutral-900/50 font-semibold text-neutral-100'
                          : 'hover:bg-white/[0.02] text-neutral-300'
                      }`}
                  >
                    <td className="py-2.5 px-4 text-center font-mono text-neutral-500">{item.ordem}</td>
                    <td className="py-2.5 px-4">
                      <span className={isTotalGeral ? 'text-emerald-400 font-bold' : isSubtotal ? 'text-white' : 'pl-4 text-neutral-300'}>
                        {item.descricao}
                      </span>
                    </td>
                    <td className={`py-2.5 px-4 text-right font-mono font-semibold ${isSubtrai ? 'text-rose-400' : isTotalGeral ? 'text-emerald-400' : 'text-neutral-200'
                      }`}>
                      {isSubtrai ? `(${item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})` : item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded font-mono font-medium text-[11px] ${isTotalGeral ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-800 text-neutral-400'
                        }`}>
                        {(item.analiseVerticalPerc ?? 0).toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          /* Evolução Comparativa 12 Meses DRE */
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-[11px] border-collapse min-w-[1200px]">
              <thead className="bg-neutral-900/95 sticky top-0 border-b border-white/10 text-neutral-400 font-semibold uppercase tracking-wider text-[10px] z-10">
                <tr>
                  <th className="py-2.5 px-3 w-12 text-center sticky left-0 bg-[#181818] z-20">Linha</th>
                  <th className="py-2.5 px-3 min-w-[220px] sticky left-12 bg-[#181818] z-20 border-r border-white/10">Descrição Dedutiva</th>
                  {mesesHeaders.map(m => (
                    <th key={m} className="py-2.5 px-2 text-right w-20">{m}</th>
                  ))}
                  <th className="py-2.5 px-3 text-right w-28 bg-blue-950/20 text-blue-300 font-bold border-l border-white/10">
                    Total {anoReferencia}
                  </th>
                  <th className="py-2.5 px-3 text-right w-28 bg-emerald-950/20 text-emerald-300 font-bold border-l border-white/10">
                    Média / Mês
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {multiPeriodDRE.map((item) => {
                  const isSubtotal = item.tipoLinha === 'SUBTOTAL';
                  const isTotalGeral = item.tipoLinha === 'TOTAL_GERAL';
                  const isSubtrai = item.operacao === 'SUBTRAI';

                  return (
                    <tr
                      key={item.ordem}
                      className={`hover:bg-white/[0.02] transition-colors ${isTotalGeral
                          ? 'bg-emerald-950/25 font-bold text-neutral-100 text-xs border-t-2 border-emerald-500/40'
                          : isSubtotal
                            ? 'bg-neutral-900/40 font-semibold text-white'
                            : 'text-neutral-300'
                        }`}
                    >
                      <td className="py-2.5 px-3 text-center text-neutral-500 sticky left-0 bg-[#181818] z-10">{item.ordem}</td>
                      <td className="py-2.5 px-3 sticky left-12 bg-[#181818] z-10 border-r border-white/10 font-sans">
                        <span className={isTotalGeral ? 'text-emerald-400 font-bold' : isSubtotal ? 'text-white' : 'pl-3 text-neutral-300'}>
                          {item.descricao}
                        </span>
                      </td>
                      {item.meses.map((val, idx) => (
                        <td key={idx} className={`py-2 px-2 text-right ${isSubtrai && val > 0 ? 'text-rose-400' : (isTotalGeral ? 'text-emerald-400' : (val > 0 ? 'text-neutral-200' : 'text-neutral-600'))
                          }`}>
                          {val !== 0 ? (isSubtrai ? `(${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})` : val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })) : '-'}
                        </td>
                      ))}
                      <td className={`py-2 px-3 text-right font-bold border-l border-white/10 bg-blue-950/10 ${isSubtrai ? 'text-rose-400' : (isTotalGeral ? 'text-emerald-400' : 'text-blue-300')
                        }`}>
                        {item.totalAno !== 0 ? (isSubtrai ? `(${item.totalAno.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})` : item.totalAno.toLocaleString('pt-BR', { minimumFractionDigits: 2 })) : '-'}
                      </td>
                      <td className={`py-2 px-3 text-right font-bold border-l border-white/10 bg-emerald-950/10 ${isSubtrai ? 'text-rose-400' : (isTotalGeral ? 'text-emerald-400' : 'text-emerald-300')
                        }`}>
                        {item.mediaMensal !== 0 ? (isSubtrai ? `(${item.mediaMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})` : item.mediaMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
