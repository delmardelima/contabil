import React, { useState } from 'react';
import { ContaContabil, LancamentoContabil, HistoricoPadrao } from '../../types/contabil';
import { AccountingEngine } from '../../engine/accountingEngine';
import { RefreshCw, CheckCircle2, AlertTriangle, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';

interface ZeramentoModuleProps {
  empresaId: number;
  contas: ContaContabil[];
  lancamentos: LancamentoContabil[];
  historicos: HistoricoPadrao[];
  onExecutarZeramento: (novosLancamentos: Omit<LancamentoContabil, 'id' | 'createdAt'>[]) => void;
}

export const ZeramentoModule: React.FC<ZeramentoModuleProps> = ({
  empresaId,
  contas,
  lancamentos,
  historicos,
  onExecutarZeramento
}) => {
  const [dataZeramento, setDataZeramento] = useState('2026-12-31');
  const [contaDestinoId, setContaDestinoId] = useState<number>(41); // Lucro Líquido do Exercício em Curso (ARE)
  const [historicoId, setHistoricoId] = useState<number>(8); // Zeramento de encerramento
  const [sucessoMsg, setSucessoMsg] = useState('');

  // Contas analíticas de PL elegíveis para destino
  const contasDestinoPossiveis = contas.filter(c => c.tipo === 'A' && c.classificacao.startsWith('2.03'));

  // Gera o preview dos lançamentos de zeramento
  const novosLancamentos = AccountingEngine.executeZeramento(
    empresaId,
    contas,
    lancamentos,
    dataZeramento,
    contaDestinoId,
    historicoId
  );

  const totalZerado = novosLancamentos.reduce((acc, l) => acc + l.valor, 0);

  const handleConfirmarZeramento = () => {
    if (novosLancamentos.length === 0) return;
    onExecutarZeramento(novosLancamentos);
    setSucessoMsg(`Encerramento executado com sucesso! Foram gerados ${novosLancamentos.length} lançamentos de contrapartida.`);
    setTimeout(() => setSucessoMsg(''), 5000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#141414] text-neutral-200 overflow-y-auto p-4 select-none">
      {/* Header explicativo */}
      <div className="bg-[#1c1c1c] border border-white/10 rounded-xl p-4 mb-4 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-neutral-100">
              Rotina Oficial de Apuração do Resultado do Exercício (Zeramento)
            </h2>
            <p className="text-xs text-neutral-400">
              Conforme as regras do sistema contábil, ao final do exercício as contas de resultado (Receitas, Custos e Despesas) têm seus saldos transferidos para a conta de Apuração / Lucros ou Prejuízos Acumulados.
            </p>
          </div>
        </div>
      </div>

      {sucessoMsg && (
        <div className="mb-4 p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{sucessoMsg}</span>
        </div>
      )}

      {/* Parâmetros do Zeramento */}
      <div className="bg-[#181818] border border-white/10 rounded-xl p-4 mb-4 shadow space-y-4">
        <h3 className="font-semibold text-xs text-neutral-300 uppercase tracking-wider">
          Parâmetros do Encerramento
        </h3>

        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-neutral-400 mb-1">Data do Zeramento Contábil</label>
            <input
              type="date"
              value={dataZeramento}
              onChange={(e) => setDataZeramento(e.target.value)}
              className="w-full bg-neutral-900 border border-white/10 rounded p-2 text-neutral-100 font-mono outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-neutral-400 mb-1">Conta de Destino do Resultado (Patrimônio Líquido)</label>
            <select
              value={contaDestinoId}
              onChange={(e) => setContaDestinoId(Number(e.target.value))}
              className="w-full bg-neutral-900 border border-white/10 rounded p-2 text-neutral-100 outline-none focus:border-blue-500 truncate"
            >
              {contasDestinoPossiveis.map(c => (
                <option key={c.id} value={c.id}>
                  {c.codigoReduzido} - {c.nome} ({c.classificacao})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-neutral-400 mb-1">Histórico Padrão de Zeramento</label>
            <select
              value={historicoId}
              onChange={(e) => setHistoricoId(Number(e.target.value))}
              className="w-full bg-neutral-900 border border-white/10 rounded p-2 text-neutral-100 outline-none focus:border-blue-500 truncate"
            >
              {historicos.map(h => (
                <option key={h.id} value={h.id}>
                  [{h.codigo}] {h.descricao}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <div className="text-xs text-neutral-400">
            Contas a Zerar: <strong className="text-white">{novosLancamentos.length}</strong> • Volume Total: <strong className="text-emerald-400 font-mono">R$ {totalZerado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
          </div>

          <button
            disabled={novosLancamentos.length === 0}
            onClick={handleConfirmarZeramento}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded font-medium text-xs transition-colors flex items-center space-x-2 shadow-lg"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Processar Zeramento e Fechar Período</span>
          </button>
        </div>
      </div>

      {/* Tabela de Pré-visualização dos Lançamentos de Zeramento */}
      <div className="bg-[#181818] border border-white/10 rounded-xl overflow-hidden shadow-lg flex-1">
        <div className="p-3 bg-neutral-900 border-b border-white/10 flex items-center justify-between text-xs font-semibold text-neutral-300">
          <span>PRÉ-VISUALIZAÇÃO DAS CONTRAPARTIDAS GERADAS AUTOMATICAMENTE</span>
          <span className="text-[11px] text-neutral-500 font-normal">
            As contas de resultado abaixo terão seus saldos transferidos integralmente
          </span>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-neutral-900/60 border-b border-white/10 text-neutral-400 font-medium">
            <tr>
              <th className="py-2.5 px-3 w-16 text-center">Partida</th>
              <th className="py-2.5 px-3 w-24">Data</th>
              <th className="py-2.5 px-3">Conta de Resultado (Origem)</th>
              <th className="py-2.5 px-3">Conta de Apuração (Destino)</th>
              <th className="py-2.5 px-3 w-32 text-right">Valor Zerado (R$)</th>
              <th className="py-2.5 px-3">Histórico</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-sans">
            {novosLancamentos.map((l, idx) => {
              const contaOrigem = contas.find(c => c.id === (l.contaDebitoId === contaDestinoId ? l.contaCreditoId : l.contaDebitoId));
              const contaDestino = contas.find(c => c.id === contaDestinoId);

              return (
                <tr key={idx} className="hover:bg-white/[0.02]">
                  <td className="py-2 px-3 text-center font-mono text-neutral-500">#{l.numeroPartida}</td>
                  <td className="py-2 px-3 font-mono text-neutral-400">{l.dataLancamento}</td>
                  <td className="py-2 px-3 font-medium text-neutral-200">
                    {contaOrigem?.nome}
                    <span className="text-[10px] text-neutral-500 font-mono ml-2">({contaOrigem?.classificacao})</span>
                  </td>
                  <td className="py-2 px-3 text-emerald-400 font-medium">
                    {contaDestino?.nome}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-semibold text-blue-400">
                    {l.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-3 text-neutral-400">{l.complementoHistorico}</td>
                </tr>
              );
            })}

            {novosLancamentos.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-neutral-500 text-xs">
                  Todas as contas de resultado já se encontram zeradas ou sem movimentação no período.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
