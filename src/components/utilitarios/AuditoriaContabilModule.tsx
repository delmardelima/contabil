import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  RotateCcw, 
  Filter, 
  ArrowRight,
  TrendingDown,
  Layers
} from 'lucide-react';
import { Empresa, ContaContabil, LancamentoContabil, BalanceteItem } from '../../types/contabil';
import { AccountingEngine } from '../../engine/accountingEngine';

interface AuditoriaContabilModuleProps {
  empresa: Empresa;
  contas: ContaContabil[];
  lancamentos: LancamentoContabil[];
  onNavigateToConta?: (contaId: number) => void;
}

export const AuditoriaContabilModule: React.FC<AuditoriaContabilModuleProps> = ({
  empresa,
  contas,
  lancamentos,
  onNavigateToConta
}) => {
  const [activeTab, setActiveTab] = useState<'invertidos' | 'furos' | 'dxc'>('invertidos');

  // Cálculos contábeis
  const trialBalance = AccountingEngine.generateTrialBalance(contas, lancamentos, 5, false, false);

  // 1. Auditoria de Saldos Invertidos (Conta Devedora com saldo Credor ou vice-versa)
  const contasInvertidas: BalanceteItem[] = trialBalance.items.filter((c: BalanceteItem) => {
    if (c.tipo !== 'A' || c.saldoAtual === 0) return false;
    return c.saldoAtualNatureza !== c.natureza;
  });

  // 2. Auditoria de Furos de Numeração de Partidas
  const numerosPartidas = lancamentos.map(l => l.numeroPartida).sort((a, b) => a - b);
  const furosNumeracao: number[] = [];
  if (numerosPartidas.length > 0) {
    const min = numerosPartidas[0];
    const max = numerosPartidas[numerosPartidas.length - 1];
    const numSet = new Set(numerosPartidas);
    for (let i = min; i <= max; i++) {
      if (!numSet.has(i)) {
        furosNumeracao.push(i);
      }
    }
  }

  // 3. Auditoria de Diferença DxC
  const totalDebitos = trialBalance.totalDebitos;
  const totalCreditos = trialBalance.totalCreditos;
  const diferencaDxC = trialBalance.diferencaDxC;

  return (
    <div className="h-full flex flex-col p-6 bg-[#141414] text-neutral-100 select-none overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
            <ShieldAlert size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-3">
              <span>Auditoria Contábil Automatizada & Inconsistências</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono font-semibold">
                CFC / NBC TG
              </span>
            </h1>
            <p className="text-xs text-neutral-400">
              Varredura de saldos invertidos, furos na sequência do diário e diferenças nas partidas dobradas
            </p>
          </div>
        </div>

        {/* Abas de Auditoria */}
        <div className="flex bg-[#1a1a1a] p-1 rounded-lg border border-white/10">
          <button
            onClick={() => setActiveTab('invertidos')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-md transition ${
              activeTab === 'invertidos' ? 'bg-white/15 text-white font-medium' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <AlertTriangle size={14} className={contasInvertidas.length > 0 ? 'text-rose-400' : 'text-emerald-400'} />
            <span>Saldos Invertidos ({contasInvertidas.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('furos')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-md transition ${
              activeTab === 'furos' ? 'bg-white/15 text-white font-medium' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Layers size={14} />
            <span>Furos de Numeração ({furosNumeracao.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('dxc')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-md transition ${
              activeTab === 'dxc' ? 'bg-white/15 text-white font-medium' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <CheckCircle2 size={14} className={diferencaDxC === 0 ? 'text-emerald-400' : 'text-rose-400'} />
            <span>Consistência DxC</span>
          </button>
        </div>
      </div>

      {/* ABA 1: SALDOS INVERTIDOS */}
      {activeTab === 'invertidos' && (
        <div className="flex-1 bg-[#181818] border border-white/10 rounded-xl flex flex-col mt-4 overflow-hidden">
          <div className="p-3 bg-[#1a1a1a] border-b border-white/10 flex justify-between items-center text-xs text-neutral-400">
            <span className="font-semibold uppercase">
              Contas com saldo contrário à sua natureza contábil devedora ou credora
            </span>
            <span className="font-mono text-neutral-300">
              {contasInvertidas.length} inconsistência(s) detectada(s)
            </span>
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar">
            {contasInvertidas.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="text-sm font-bold text-white">Nenhum Saldo Invertido Detectado</h3>
                <p className="text-xs text-neutral-400 max-w-md">
                  Todas as contas ativas do plano de contas apresentam saldo condizente com a sua natureza devedora ou credora.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#202020] text-neutral-400 uppercase text-[10px] font-semibold sticky top-0 border-b border-white/10 z-10">
                  <tr>
                    <th className="py-2.5 px-4 w-24">Cód. Red.</th>
                    <th className="py-2.5 px-4 w-36">Classificação</th>
                    <th className="py-2.5 px-4">Nome da Conta</th>
                    <th className="py-2.5 px-4 w-28 text-center">Natureza Oficial</th>
                    <th className="py-2.5 px-4 w-28 text-center">Saldo Atual</th>
                    <th className="py-2.5 px-4 w-36 text-right">Valor do Saldo</th>
                    <th className="py-2.5 px-4 w-32 text-center">Diagnóstico</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {contasInvertidas.map(conta => (
                    <tr key={conta.id} className="hover:bg-white/5 transition">
                      <td className="py-3 px-4 font-mono font-bold text-neutral-300">
                        {conta.codigoReduzido}
                      </td>
                      <td className="py-3 px-4 font-mono text-neutral-400">
                        {conta.classificacao}
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">
                        {conta.nome}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/10 text-neutral-300 font-bold">
                          {conta.natureza === 'D' ? 'DEVEDORA (D)' : 'CREDORA (C)'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
                          {conta.saldoAtualNatureza === 'D' ? 'DEVEDOR (D)' : 'CREDOR (C)'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-right text-rose-400">
                        R$ {Math.abs(conta.saldoAtual).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-[10px] text-rose-300 font-medium">
                          Saldo Invertido
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ABA 2: FUROS DE NUMERAÇÃO */}
      {activeTab === 'furos' && (
        <div className="flex-1 bg-[#181818] border border-white/10 rounded-xl flex flex-col mt-4 overflow-hidden p-6 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Auditoria da Sequência do Livro Diário</h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Identifica furos de numeração que ferem a exigência legal de partidas cronológicas e ininterruptas no Diário Oficial.
            </p>
          </div>

          {furosNumeracao.length === 0 ? (
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 flex items-center gap-3 text-xs">
              <CheckCircle2 size={18} />
              <div>
                <p className="font-bold">Sequência Contábil Perfeita</p>
                <p className="text-[11px] text-emerald-400/80">
                  Todas as partidas estão sequenciadas numericamente sem saltos ou cancelamentos sem rastro.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/30 text-rose-300 text-xs">
                Atenção: foram encontrados {furosNumeracao.length} números faltantes na sequência de lançamentos:
              </div>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 bg-[#141414] rounded-lg border border-white/10">
                {furosNumeracao.map(n => (
                  <span key={n} className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 font-mono text-xs border border-rose-500/30">
                    Partida #{n}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ABA 3: CONSISTÊNCIA DXC */}
      {activeTab === 'dxc' && (
        <div className="flex-1 bg-[#181818] border border-white/10 rounded-xl flex flex-col mt-4 overflow-hidden p-6 space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-[#141414] border border-white/10">
              <span className="text-xs text-neutral-400 block mb-1">Total de Débitos do Período</span>
              <span className="text-xl font-bold font-mono text-blue-400">
                R$ {totalDebitos.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="p-5 rounded-xl bg-[#141414] border border-white/10">
              <span className="text-xs text-neutral-400 block mb-1">Total de Créditos do Período</span>
              <span className="text-xl font-bold font-mono text-indigo-400">
                R$ {totalCreditos.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className={`p-5 rounded-xl border ${
              diferencaDxC === 0 ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-rose-950/20 border-rose-500/30'
            }`}>
              <span className="text-xs text-neutral-400 block mb-1">Diferença Débito x Crédito</span>
              <span className={`text-xl font-bold font-mono ${diferencaDxC === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                R$ {diferencaDxC.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#141414] border border-white/5 text-xs text-neutral-300 leading-relaxed">
            {diferencaDxC === 0 ? (
              <p className="text-emerald-400 font-medium">
                ✓ Princípio das Partidas Dobradas validado. Débitos rigorosamente equivalentes aos créditos. O Balanço e Balancete estão aptos para emissão oficial e registro.
              </p>
            ) : (
              <p className="text-rose-400 font-medium">
                ✕ Inconsistência grave detectada: a diferença entre débitos e créditos impede a homologação do balanço patrimonial. Revise os lançamentos do período ou lotes abertos.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
