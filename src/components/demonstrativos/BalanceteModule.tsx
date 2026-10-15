import React, { useState } from 'react';
import { ContaContabil, LancamentoContabil } from '../../types/contabil';
import { AccountingEngine } from '../../engine/accountingEngine';
import { exportToCSV } from '../../utils/exportUtils';
import { CheckCircle2, AlertCircle, Filter, ArrowUpRight, Download } from 'lucide-react';

interface BalanceteModuleProps {
  contas: ContaContabil[];
  lancamentos: LancamentoContabil[];
  onOpenRazaoConta?: (contaId: number) => void;
}

export const BalanceteModule: React.FC<BalanceteModuleProps> = ({
  contas,
  lancamentos,
  onOpenRazaoConta
}) => {
  const [grauMax, setGrauMax] = useState<number>(5);
  const [apenasComMovimento, setApenasComMovimento] = useState<boolean>(false);
  const [desconsiderarZeramento, setDesconsiderarZeramento] = useState<boolean>(false);

  const { items, totalDebitos, totalCreditos, diferencaDxC } = AccountingEngine.generateTrialBalance(
    contas,
    lancamentos,
    grauMax,
    apenasComMovimento,
    desconsiderarZeramento
  );

  const handleExportCSV = () => {
    const headers = ['Classificação', 'Código Reduzido', 'Nome da Conta', 'Tipo', 'Grau', 'Saldo Anterior', 'Débitos', 'Créditos', 'Saldo Atual', 'Natureza'];
    const rows = items.map(i => [
      i.classificacao,
      i.codigoReduzido,
      i.nome,
      i.tipo === 'S' ? 'Sintética' : 'Analítica',
      i.grau,
      i.saldoAnterior,
      i.debitos,
      i.creditos,
      i.saldoAtual,
      i.saldoAtualNatureza
    ]);
    exportToCSV(`Balancete_Verificacao_${new Date().toISOString().split('T')[0]}`, rows, headers);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#141414] text-neutral-200 overflow-hidden select-none">
      {/* Barra de Filtros e Opções do Balancete */}
      <div className="px-4 py-3 bg-[#1c1c1c] border-b border-white/10 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-semibold text-neutral-300">Filtros do Balancete:</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-neutral-400">Grau Máximo:</span>
            <select
              value={grauMax}
              onChange={(e) => setGrauMax(Number(e.target.value))}
              className="bg-neutral-900 border border-white/10 rounded px-2 py-1 text-neutral-200 outline-none"
            >
              <option value={1}>Grau 1 (Grupos Principais)</option>
              <option value={2}>Grau 2 (Subgrupos)</option>
              <option value={3}>Grau 3 (Sintéticas Nível 3)</option>
              <option value={4}>Grau 4 (Subcontas)</option>
              <option value={5}>Grau 5 (Analítico Completo)</option>
            </select>
          </div>

          <label className="flex items-center space-x-1.5 cursor-pointer text-neutral-300">
            <input
              type="checkbox"
              checked={apenasComMovimento}
              onChange={(e) => setApenasComMovimento(e.target.checked)}
              className="rounded bg-neutral-900 border-white/20 text-blue-600 focus:ring-0"
            />
            <span>Apenas contas com movimento</span>
          </label>

          <label className="flex items-center space-x-1.5 cursor-pointer text-neutral-300">
            <input
              type="checkbox"
              checked={desconsiderarZeramento}
              onChange={(e) => setDesconsiderarZeramento(e.target.checked)}
              className="rounded bg-neutral-900 border-white/20 text-blue-600 focus:ring-0"
            />
            <span>Desconsiderar zeramento (Auditoria pré-fechamento)</span>
          </label>
        </div>

        {/* Resumo de Equilíbrio DxC + Botão Exportar Excel */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded border border-white/10 transition-colors"
            title="Exportar Balancete para Excel / CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exportar Excel (CSV)</span>
          </button>

          <div className={`flex items-center space-x-2 px-3 py-1 rounded font-mono font-medium ${
            diferencaDxC === 0 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
          }`}>
            {diferencaDxC === 0 ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>DxC EQUILIBRADO • D = C</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4" />
                <span>DIFERENÇA: R$ {diferencaDxC.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Grade do Balancete */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="bg-[#181818] border border-white/10 rounded-lg overflow-hidden shadow-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-neutral-900/90 sticky top-0 border-b border-white/10 text-neutral-400 font-medium">
              <tr>
                <th className="py-2.5 px-3 w-36">Classificação</th>
                <th className="py-2.5 px-2 w-16 text-center">Red.</th>
                <th className="py-2.5 px-3">Nome da Conta Contábil</th>
                <th className="py-2.5 px-3 w-32 text-right">Saldo Anterior</th>
                <th className="py-2.5 px-3 w-32 text-right">Débitos (R$)</th>
                <th className="py-2.5 px-3 w-32 text-right">Créditos (R$)</th>
                <th className="py-2.5 px-3 w-36 text-right">Saldo Atual (R$)</th>
                <th className="py-2.5 px-2 w-12 text-center">Nat.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {items.map((item) => {
                const isSintetica = item.tipo === 'S';
                const paddingGrau = (item.grau - 1) * 16;

                return (
                  <tr
                    key={item.id}
                    onDoubleClick={() => onOpenRazaoConta && item.tipo === 'A' && onOpenRazaoConta(item.id)}
                    className={`transition-colors ${
                      isSintetica
                        ? 'bg-neutral-900/40 font-semibold text-neutral-100'
                        : 'hover:bg-blue-600/10 cursor-pointer text-neutral-300'
                    }`}
                    title={item.tipo === 'A' ? 'Clique duplo para abrir Razão da Conta' : undefined}
                  >
                    <td className="py-2 px-3 font-mono text-neutral-400">{item.classificacao}</td>
                    <td className="py-2 px-2 text-center font-mono text-neutral-500">
                      {item.tipo === 'A' ? item.codigoReduzido : ''}
                    </td>
                    <td className="py-2 px-3">
                      <div style={{ paddingLeft: `${paddingGrau}px` }} className="flex items-center space-x-1.5">
                        <span className={isSintetica ? 'text-white' : 'text-neutral-200'}>{item.nome}</span>
                        {item.tipo === 'A' && (
                          <ArrowUpRight className="w-3 h-3 text-neutral-600 opacity-0 group-hover:opacity-100" />
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-neutral-400">
                      {item.saldoAnterior.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-blue-400">
                      {item.debitos > 0 ? item.debitos.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-indigo-400">
                      {item.creditos > 0 ? item.creditos.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}
                    </td>
                    <td className={`py-2 px-3 text-right font-mono font-semibold ${isSintetica ? 'text-neutral-100' : 'text-emerald-400'}`}>
                      {item.saldoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-2 text-center font-mono font-bold text-neutral-400">
                      {item.saldoAtualNatureza}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Totais do Balancete */}
            <tfoot className="bg-neutral-900 border-t-2 border-white/20 font-mono font-bold text-xs">
              <tr>
                <td colSpan={4} className="py-3 px-3 text-right uppercase tracking-wider text-neutral-300">
                  Totais das Contas Analíticas:
                </td>
                <td className="py-3 px-3 text-right text-blue-400">
                  R$ {totalDebitos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-3 text-right text-indigo-400">
                  R$ {totalCreditos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td colSpan={2} className="py-3 px-3 text-right text-emerald-400">
                  Diferença: R$ {diferencaDxC.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
