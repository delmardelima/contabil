import React, { useState } from 'react';
import { 
  ArrowRightLeft, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  Check, 
  ShieldCheck 
} from 'lucide-react';
import { Empresa, ContaContabil, LancamentoContabil } from '../../types/contabil';
import { dbService } from '../../db/sqliteService';

interface TransporteSaldosModuleProps {
  empresa: Empresa;
  contas: ContaContabil[];
  lancamentos: LancamentoContabil[];
  onTransporteConcluido: () => void;
}

export const TransporteSaldosModule: React.FC<TransporteSaldosModuleProps> = ({
  empresa,
  contas,
  lancamentos,
  onTransporteConcluido
}) => {
  const [anoOrigem, setAnoOrigem] = useState(empresa.exercicioAtivo);
  const [anoDestino, setAnoDestino] = useState(empresa.exercicioAtivo + 1);
  const [executando, setExecutando] = useState(false);
  const [resultado, setResultado] = useState<{ success: boolean; contasTransportadas: number } | null>(null);

  const contasPatrimoniais = contas.filter(c => c.tipo === 'A' && (c.classificacao.startsWith('1') || c.classificacao.startsWith('2')));
  const contasResultadoComSaldo = contas.filter(c => c.tipo === 'A' && (c.classificacao.startsWith('3') || c.classificacao.startsWith('4')) && (c.saldoAtual || 0) !== 0);

  const handleExecutar = () => {
    if (contasResultadoComSaldo.length > 0) {
      const confirmacao = window.confirm(
        `Atenção: existem ${contasResultadoComSaldo.length} contas de resultado com saldo não zerado. O ideal é executar o Zeramento / ARE antes de transportar saldos. Deseja prosseguir mesmo assim?`
      );
      if (!confirmacao) return;
    }

    setExecutando(true);
    setTimeout(() => {
      const res = dbService.executarTransporteSaldos(anoOrigem, anoDestino);
      setResultado(res);
      setExecutando(false);
      onTransporteConcluido();
    }, 600);
  };

  return (
    <div className="h-full flex flex-col p-6 bg-[#141414] text-neutral-100 select-none overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
            <ArrowRightLeft size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-3">
              <span>Transporte de Saldos Patrimoniais & Abertura de Exercício</span>
            </h1>
            <p className="text-xs text-neutral-400">
              Rotina anual de transposição dos saldos finais de 31/12 para o saldo inicial de 01/01 do novo ano
            </p>
          </div>
        </div>
      </div>

      {/* Conteúdo Central */}
      <div className="flex-1 overflow-y-auto mt-6 max-w-3xl space-y-6 custom-scrollbar pr-2">
        {resultado && (
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 flex items-center gap-3 text-xs animate-fadeIn">
            <CheckCircle2 size={20} className="text-emerald-400" />
            <div>
              <p className="font-bold">Transporte Concluído com Sucesso!</p>
              <p className="text-[11px] text-emerald-400/80">
                Foram transportados os saldos de {resultado.contasTransportadas} contas patrimoniais para o exercício {anoDestino}. A competência ativa foi redefinida para {anoDestino}-01.
              </p>
            </div>
          </div>
        )}

        {/* Card do Assistente */}
        <div className="p-6 rounded-xl bg-[#181818] border border-white/10 space-y-6">
          <h2 className="text-sm font-semibold text-white border-b border-white/10 pb-2 flex items-center gap-2">
            <Calendar size={16} className="text-blue-400" />
            <span>Definição dos Exercícios Sociais</span>
          </h2>

          <div className="grid grid-cols-2 gap-6">
            <div className="p-4 rounded-lg bg-[#141414] border border-white/10 space-y-2">
              <label className="block text-xs font-medium text-neutral-400">Exercício de Origem (Saldos Finais em 31/12)</label>
              <input
                type="number"
                value={anoOrigem}
                onChange={e => setAnoOrigem(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#1c1c1c] border border-white/10 rounded-lg text-sm font-mono font-bold text-white focus:outline-none focus:border-blue-500"
              />
              <p className="text-[10px] text-neutral-400">Empresa atualmente operando em {anoOrigem}.</p>
            </div>

            <div className="p-4 rounded-lg bg-[#141414] border border-white/10 space-y-2">
              <label className="block text-xs font-medium text-neutral-400">Novo Exercício Social (Saldo Inicial em 01/01)</label>
              <input
                type="number"
                value={anoDestino}
                onChange={e => setAnoDestino(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#1c1c1c] border border-white/10 rounded-lg text-sm font-mono font-bold text-blue-400 focus:outline-none focus:border-blue-500"
              />
              <p className="text-[10px] text-neutral-400">Exercício a ser inaugurado no escritório.</p>
            </div>
          </div>

          {/* Regras e Impactos */}
          <div className="p-4 rounded-lg bg-[#141414] border border-white/5 space-y-2 text-xs">
            <h3 className="font-semibold text-neutral-200">Regras Contábeis Aplicadas:</h3>
            <ul className="list-disc pl-5 space-y-1 text-neutral-400 text-[11px]">
              <li>Serão transportadas <strong className="text-neutral-200">{contasPatrimoniais.length} contas analíticas patrimoniais</strong> pertencentes ao Ativo (Grupo 1) e Passivo/Patrimônio Líquido (Grupo 2).</li>
              <li>As contas de Resultado (Grupos 3 e 4) iniciam o novo exercício rigorosamente zeradas em conformidade com as Normas Brasileiras de Contabilidade.</li>
              <li>O histórico de lançamentos do ano de origem é integralmente mantido para consultas retroativas no Livro Diário e Razão.</li>
            </ul>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleExecutar}
              disabled={executando}
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
            >
              <Play size={15} />
              <span>{executando ? 'Processando Transporte...' : 'Executar Transporte e Abrir Exercício'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
