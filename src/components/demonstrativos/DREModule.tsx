import React from 'react';
import { ContaContabil, LancamentoContabil } from '../../types/contabil';
import { AccountingEngine } from '../../engine/accountingEngine';
import { exportToCSV } from '../../utils/exportUtils';
import { PieChart, TrendingUp, Percent, DollarSign, Download } from 'lucide-react';

interface DREModuleProps {
  contas: ContaContabil[];
  lancamentos: LancamentoContabil[];
}

export const DREModule: React.FC<DREModuleProps> = ({ contas, lancamentos }) => {
  const {
    items,
    receitaLiquida,
    lucroBruto,
    resultadoOperacional,
    lucroLiquido
  } = AccountingEngine.generateIncomeStatement(contas, lancamentos);

  const margemBruta = receitaLiquida > 0 ? (lucroBruto / receitaLiquida) * 100 : 0;
  const margemLiquida = receitaLiquida > 0 ? (lucroLiquido / receitaLiquida) * 100 : 0;

  const handleExportCSV = () => {
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
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#141414] text-neutral-200 overflow-y-auto p-4 select-none">
      {/* Cards de Métricas e Margens Executivas */}
      <div className="grid grid-cols-4 gap-4 mb-4">
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

      {/* Grade Dedutiva da DRE */}
      <div className="bg-[#181818] border border-white/10 rounded-xl shadow-lg overflow-hidden">
        <div className="px-4 py-3 bg-neutral-900/80 border-b border-white/10 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <PieChart className="w-4 h-4 text-blue-400" />
            <span className="font-bold text-neutral-200">Demonstração do Resultado do Exercício (DRE Dedutiva)</span>
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
            <span className="text-neutral-400 font-mono text-[11px]">Exercício 2026 • Regime de Competência</span>
          </div>
        </div>

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
                  className={`transition-colors ${
                    isTotalGeral
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
                  <td className={`py-2.5 px-4 text-right font-mono font-semibold ${
                    isSubtrai ? 'text-rose-400' : isTotalGeral ? 'text-emerald-400' : 'text-neutral-200'
                  }`}>
                    {isSubtrai ? `(${item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})` : item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded font-mono font-medium text-[11px] ${
                      isTotalGeral ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-800 text-neutral-400'
                    }`}>
                      {(item.analiseVerticalPerc ?? 0).toFixed(2)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
