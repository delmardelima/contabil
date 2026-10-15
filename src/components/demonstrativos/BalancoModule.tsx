import React from 'react';
import { ContaContabil, LancamentoContabil } from '../../types/contabil';
import { AccountingEngine } from '../../engine/accountingEngine';
import { exportToCSV } from '../../utils/exportUtils';
import { CheckCircle2, AlertTriangle, Download } from 'lucide-react';

interface BalancoModuleProps {
  contas: ContaContabil[];
  lancamentos: LancamentoContabil[];
}

export const BalancoModule: React.FC<BalancoModuleProps> = ({ contas, lancamentos }) => {
  const {
    ativo,
    passivo,
    patrimonioLiquido,
    totalAtivo,
    totalPassivo,
    totalPL,
    isEquilibrado,
    isPassivoDescoberto
  } = AccountingEngine.generateBalanceSheet(contas, lancamentos);

  const totalPassivoMaisPL = totalPassivo + totalPL;

  const handleExportCSV = () => {
    const headers = ['Grupo Patrimonial', 'Classificação', 'Descrição da Conta', 'Tipo', 'Saldo (R$)'];
    const rows: (string | number)[][] = [
      ...ativo.map(i => ['ATIVO', i.classificacao, i.nome, i.tipo === 'S' ? 'Sintética' : 'Analítica', i.saldo]),
      ...passivo.map(i => ['PASSIVO', i.classificacao, i.nome, i.tipo === 'S' ? 'Sintética' : 'Analítica', i.saldo]),
      ...patrimonioLiquido.map(i => ['PATRIMÔNIO LÍQUIDO', i.classificacao, i.nome, i.tipo === 'S' ? 'Sintética' : 'Analítica', i.saldo]),
      ['TOTAL', '', 'TOTAL DO ATIVO', 'TOTAL', totalAtivo],
      ['TOTAL', '', 'TOTAL DO PASSIVO + PL', 'TOTAL', totalPassivoMaisPL]
    ];
    exportToCSV(`Balanco_Patrimonial_${new Date().toISOString().split('T')[0]}`, rows, headers);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#141414] text-neutral-200 overflow-y-auto p-4 select-none">
      {/* Top Banner de Validação Contábil do Balanço */}
      <div className={`p-4 rounded-xl border mb-4 flex items-center justify-between shadow-lg ${
        isEquilibrado
          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
          : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
      }`}>
        <div className="flex items-center space-x-3">
          {isEquilibrado ? (
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-sm">
              {isEquilibrado
                ? 'Balanço Patrimonial Balanceado & Conforme NBC TG'
                : 'Atenção: Balanço Patrimonial Desbalanceado!'}
            </h3>
            <p className="text-xs text-neutral-400">
              {isEquilibrado
                ? 'Equação Patrimonial Estrita Satisfeita: Ativo = Passivo + Patrimônio Líquido'
                : 'Existe discrepância entre o Ativo e a soma de Passivo + PL. Verifique lançamentos pendentes.'}
            </p>
          </div>
        </div>

        {/* Cifras de Fechamento e Botão Exportar Excel */}
        <div className="flex items-center space-x-6 text-xs font-mono">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded border border-white/10 transition-colors font-sans"
            title="Exportar Balanço Patrimonial para Excel / CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exportar Excel (CSV)</span>
          </button>

          <div className="text-right">
            <span className="text-neutral-400 text-[10px] uppercase block">Total do Ativo:</span>
            <strong className="text-blue-400 text-sm">R$ {totalAtivo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
          </div>
          <span className="text-neutral-600 font-sans text-lg">=</span>
          <div className="text-right">
            <span className="text-neutral-400 text-[10px] uppercase block">Passivo + PL:</span>
            <strong className="text-indigo-400 text-sm">R$ {totalPassivoMaisPL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
          </div>
        </div>
      </div>

      {/* Alerta de Passivo a Descoberto (se PL for negativo) */}
      {isPassivoDescoberto && (
        <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-300 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>
            <strong>Resolução CFC nº 847/99:</strong> O Patrimônio Líquido encontra-se com saldo devedor/negativo. As demonstrações contábeis devem apresentar o grupo sob a denominação de <em>"Passivo a Descoberto"</em>.
          </span>
        </div>
      )}

      {/* Layout Duas Colunas: Ativo (Esquerda) vs Passivo e PL (Direita) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Coluna 1: ATIVO */}
        <div className="bg-[#181818] border border-white/10 rounded-xl p-4 shadow-lg flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <h2 className="font-bold text-neutral-100 text-sm">1. ATIVO TOTAL</h2>
            </div>
            <span className="font-mono font-bold text-blue-400 text-sm">
              R$ {totalAtivo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="space-y-1 overflow-y-auto max-h-[550px] pr-1">
            {ativo.map((item, idx) => {
              const isSintetica = item.tipo === 'S';
              const padding = (item.grau - 1) * 14;

              return (
                <div
                  key={idx}
                  style={{ paddingLeft: `${padding}px` }}
                  className={`flex items-center justify-between py-1.5 px-2 rounded text-xs transition-colors ${
                    isSintetica
                      ? 'bg-neutral-900/50 font-semibold text-neutral-100'
                      : 'text-neutral-300 hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <span className="font-mono text-neutral-500 text-[11px]">{item.classificacao}</span>
                    <span className="truncate">{item.nome}</span>
                  </div>
                  <span className={`font-mono ${isSintetica ? 'font-bold text-neutral-100' : 'text-neutral-400'}`}>
                    {item.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Coluna 2: PASSIVO E PATRIMÔNIO LÍQUIDO */}
        <div className="bg-[#181818] border border-white/10 rounded-xl p-4 shadow-lg flex flex-col space-y-4">
          {/* 2.1 Passivo Circulante e Não Circulante */}
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <h2 className="font-bold text-neutral-100 text-sm">2. PASSIVO EXIGÍVEL</h2>
              </div>
              <span className="font-mono font-bold text-indigo-400 text-sm">
                R$ {totalPassivo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="space-y-1 max-h-[260px] overflow-y-auto pr-1">
              {passivo.map((item, idx) => {
                const isSintetica = item.tipo === 'S';
                const padding = (item.grau - 1) * 14;

                return (
                  <div
                    key={idx}
                    style={{ paddingLeft: `${padding}px` }}
                    className={`flex items-center justify-between py-1.5 px-2 rounded text-xs transition-colors ${
                      isSintetica
                        ? 'bg-neutral-900/50 font-semibold text-neutral-100'
                        : 'text-neutral-300 hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <span className="font-mono text-neutral-500 text-[11px]">{item.classificacao}</span>
                      <span className="truncate">{item.nome}</span>
                    </div>
                    <span className={`font-mono ${isSintetica ? 'font-bold text-neutral-100' : 'text-neutral-400'}`}>
                      {item.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2.2 Patrimônio Líquido / Passivo a Descoberto */}
          <div className="border-t border-white/10 pt-3">
            <div className="flex items-center justify-between pb-2 mb-2">
              <div className="flex items-center space-x-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isPassivoDescoberto ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                <h2 className="font-bold text-neutral-100 text-sm">
                  {isPassivoDescoberto ? '2.03. PASSIVO A DESCOBERTO' : '2.03. PATRIMÔNIO LÍQUIDO'}
                </h2>
              </div>
              <span className={`font-mono font-bold text-sm ${isPassivoDescoberto ? 'text-amber-400' : 'text-emerald-400'}`}>
                R$ {totalPL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1">
              {patrimonioLiquido.map((item, idx) => {
                const isSintetica = item.tipo === 'S';
                const padding = (item.grau - 1) * 14;

                return (
                  <div
                    key={idx}
                    style={{ paddingLeft: `${padding}px` }}
                    className={`flex items-center justify-between py-1.5 px-2 rounded text-xs transition-colors ${
                      isSintetica
                        ? 'bg-neutral-900/50 font-semibold text-neutral-100'
                        : 'text-neutral-300 hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <span className="font-mono text-neutral-500 text-[11px]">{item.classificacao}</span>
                      <span className="truncate">{item.nome}</span>
                    </div>
                    <span className={`font-mono ${isSintetica ? 'font-bold text-neutral-100' : 'text-neutral-400'}`}>
                      {item.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
