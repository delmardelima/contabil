import React from 'react';
import { 
  Building2, 
  TrendingUp, 
  TrendingDown, 
  Scale, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  Clock, 
  ArrowUpRight,
  PlusCircle,
  FileText,
  FileSpreadsheet,
  DownloadCloud
} from 'lucide-react';
import { Empresa, ContaContabil, LancamentoContabil, BalanceteItem } from '../../types/contabil';
import { AccountingEngine } from '../../engine/accountingEngine';

interface DashboardModuleProps {
  empresa: Empresa;
  contas: ContaContabil[];
  lancamentos: LancamentoContabil[];
  onNavigate: (module: string) => void;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({
  empresa,
  contas,
  lancamentos,
  onNavigate
}) => {
  // Cálculos contábeis reais através da engine oficial
  const trialBalance = AccountingEngine.generateTrialBalance(contas, lancamentos, 5, false, false);
  const bs = AccountingEngine.generateBalanceSheet(contas, lancamentos);
  const dre = AccountingEngine.generateIncomeStatement(contas, lancamentos);

  // Totais patrimoniais
  const ativoTotal = bs.totalAtivo;
  const passivoTotal = bs.totalPassivo;
  const plTotal = bs.totalPL;

  // Receitas, Despesas e Resultado
  const receitas = dre.receitaBruta;
  const custosDespesas = Math.max(0, dre.receitaBruta - dre.lucroLiquido);
  const resultadoLiquido = dre.lucroLiquido;
  const isLucro = resultadoLiquido >= 0;

  // Verificação de contas com saldo invertido
  const contasInvertidas: BalanceteItem[] = trialBalance.items.filter((c: BalanceteItem) => {
    if (c.tipo !== 'A' || c.saldoAtual === 0) return false;
    // Se a natureza for Devedora (Ativo/Despesa), saldo negativo ou contrário é invertido
    return c.saldoAtualNatureza !== c.natureza;
  });

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto bg-[#141414] text-neutral-100 select-none space-y-6">
      {/* 1. Header do Dashboard com Dados da Empresa Ativa */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-white/10 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
              <Building2 size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-3">
                <span>{empresa.razaoSocial}</span>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  Ativa ({empresa.regimeTributario.replace('_', ' ')})
                </span>
              </h1>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">
                CNPJ: {empresa.cnpj} • Exercício Contábil: <strong className="text-neutral-200">{empresa.exercicioAtivo}</strong> • Competência: <strong className="text-neutral-200">{empresa.competenciaAtiva}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Atalhos Rápidos de Produção */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('lancamentos')}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 transition"
          >
            <PlusCircle size={15} />
            <span>Novo Lançamento (F2)</span>
          </button>

          <button
            onClick={() => onNavigate('balancete')}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-white/5 hover:bg-white/10 text-neutral-200 border border-white/10 transition"
          >
            <Scale size={15} />
            <span>Balancete (F4)</span>
          </button>
        </div>
      </div>

      {/* 2. Grid de KPIs Financeiros e Patrimoniais Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Ativo Total */}
        <div className="p-4 rounded-xl bg-[#1c1c1c] border border-white/10 shadow-lg relative overflow-hidden group hover:border-blue-500/40 transition">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Ativo Total</span>
            <TrendingUp size={16} className="text-blue-400" />
          </div>
          <div className="text-lg font-bold font-mono text-white">
            R$ {ativoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-neutral-400 mt-2">Bens e Direitos Registrados</p>
        </div>

        {/* Passivo Total */}
        <div className="p-4 rounded-xl bg-[#1c1c1c] border border-white/10 shadow-lg relative overflow-hidden group hover:border-indigo-500/40 transition">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Passivo Total</span>
            <TrendingDown size={16} className="text-indigo-400" />
          </div>
          <div className="text-lg font-bold font-mono text-white">
            R$ {passivoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-neutral-400 mt-2">Obrigações e Exigibilidades</p>
        </div>

        {/* Patrimônio Líquido */}
        <div className="p-4 rounded-xl bg-[#1c1c1c] border border-white/10 shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Patrimônio Líquido</span>
            <Scale size={16} className={plTotal >= 0 ? 'text-emerald-400' : 'text-rose-400'} />
          </div>
          <div className={`text-lg font-bold font-mono ${plTotal >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            R$ {plTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-neutral-400 mt-2">
            {plTotal < 0 ? 'Passivo a Descoberto' : 'Capital + Reservas'}
          </p>
        </div>

        {/* Receita Bruta */}
        <div className="p-4 rounded-xl bg-[#1c1c1c] border border-white/10 shadow-lg relative overflow-hidden group hover:border-blue-500/40 transition">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Receita Operacional</span>
            <TrendingUp size={16} className="text-blue-400" />
          </div>
          <div className="text-lg font-bold font-mono text-blue-300">
            R$ {receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-neutral-400 mt-2">Faturamento e Serviços</p>
        </div>

        {/* Custos e Despesas */}
        <div className="p-4 rounded-xl bg-[#1c1c1c] border border-white/10 shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Custos & Despesas</span>
            <TrendingDown size={16} className="text-amber-400" />
          </div>
          <div className="text-lg font-bold font-mono text-amber-300">
            R$ {custosDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-neutral-400 mt-2">Operacionais e Tributárias</p>
        </div>

        {/* Lucro/Prejuízo Líquido */}
        <div className={`p-4 rounded-xl border shadow-lg relative overflow-hidden transition ${
          isLucro 
            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400' 
            : 'bg-rose-950/20 border-rose-500/30 text-rose-400'
        }`}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold">{isLucro ? 'Lucro Líquido' : 'Prejuízo Líquido'}</span>
            <Scale size={16} />
          </div>
          <div className="text-lg font-bold font-mono">
            R$ {Math.abs(resultadoLiquido).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] opacity-80 mt-2">Margem Líquida D.R.E.</p>
        </div>
      </div>

      {/* 3. Painel de Auditoria Contábil, Diferença DxC e Conformidade */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Caixa de Diagnóstico da Partida Dobrada (DxC) */}
        <div className="p-5 rounded-xl bg-[#1c1c1c] border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <ShieldCheck size={18} className="text-blue-400" />
                <span>Equilíbrio Contábil (Débito x Crédito)</span>
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                trialBalance.diferencaDxC === 0 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
              }`}>
                {trialBalance.diferencaDxC === 0 ? 'CONCILIADO' : 'DIVERGÊNCIA'}
              </span>
            </div>

            <div className="mt-4 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-neutral-400">Total de Débitos:</span>
                <span className="text-blue-400 font-semibold">
                  R$ {trialBalance.totalDebitos.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-neutral-400">Total de Créditos:</span>
                <span className="text-indigo-400 font-semibold">
                  R$ {trialBalance.totalCreditos.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 bg-black/30 px-2 rounded">
                <span className="text-neutral-300 font-bold">Diferença DxC:</span>
                <span className={`font-bold ${trialBalance.diferencaDxC === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  R$ {trialBalance.diferencaDxC.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-neutral-400 mt-4 leading-relaxed">
            {trialBalance.diferencaDxC === 0 
              ? 'Todos os lançamentos do período estão estritamente equilibrados pelo método das partidas dobradas (Frei Luca Pacioli).'
              : 'Atenção: há divergência de valor entre débitos e créditos. Verifique os lotes abertos ou partidas desbalanceadas.'}
          </p>
        </div>

        {/* Alertas de Auditoria e Saldos Invertidos */}
        <div className="p-5 rounded-xl bg-[#1c1c1c] border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-400" />
                <span>Auditoria & Saldos Invertidos</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-neutral-300">
                {contasInvertidas.length} alerta(s)
              </span>
            </div>

            <div className="mt-3 space-y-2">
              {contasInvertidas.length === 0 ? (
                <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 flex items-center gap-2 text-xs">
                  <CheckCircle2 size={16} />
                  <span>Nenhuma conta com saldo invertido detectada.</span>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {contasInvertidas.map(c => (
                    <div key={c.id} className="p-2 rounded bg-rose-950/20 border border-rose-500/20 text-xs flex justify-between items-center">
                      <div>
                        <span className="font-mono text-neutral-400 mr-2">{c.codigoReduzido}</span>
                        <span className="text-neutral-200">{c.nome}</span>
                      </div>
                      <span className="font-mono font-bold text-rose-400">
                        {c.saldoAtualNatureza} R$ {Math.abs(c.saldoAtual || 0).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigate('auditoria')}
            className="w-full mt-4 py-2 px-3 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 flex items-center justify-center gap-2 transition"
          >
            <span>Abrir Painel Completo de Auditoria</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        {/* Status de Fechamento do Exercício e Lotes */}
        <div className="p-5 rounded-xl bg-[#1c1c1c] border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Clock size={18} className="text-indigo-400" />
                <span>Controle de Exercício & Lotes</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                Ativo
              </span>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="text-neutral-400">Total de Partidas Gravadas:</span>
                <span className="font-mono text-neutral-200 font-bold">{lancamentos.length}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-neutral-400">Contas no Plano:</span>
                <span className="font-mono text-neutral-200 font-bold">{contas.length}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-neutral-400">Regime Contábil:</span>
                <span className="font-mono text-neutral-200 font-bold">Competência (Oficial)</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-neutral-400">Motor de Banco de Dados:</span>
                <span className="font-mono text-emerald-400 font-bold">Local / LAN (Porta 4590)</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('zeramento')}
            className="w-full mt-4 py-2 px-3 text-xs rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 flex items-center justify-center gap-2 font-medium transition"
          >
            <span>Rotina de Zeramento / ARE</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>

      {/* 4. Acesso Rápido a Rotinas do Escritório */}
      <div className="pt-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
          Atalhos de Trabalho do Escritório
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigate('planoContas')}
            className="p-3.5 rounded-xl bg-[#1c1c1c] hover:bg-[#222222] border border-white/5 hover:border-white/20 text-left transition flex items-center gap-3 group"
          >
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20">
              <Layers size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Plano de Contas</p>
              <p className="text-[10px] text-neutral-400">Árvore hierárquica e contas</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('livros')}
            className="p-3.5 rounded-xl bg-[#1c1c1c] hover:bg-[#222222] border border-white/5 hover:border-white/20 text-left transition flex items-center gap-3 group"
          >
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20">
              <FileText size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Livro Diário & Razão</p>
              <p className="text-[10px] text-neutral-400">Emissão para registro e junta</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('balanco')}
            className="p-3.5 rounded-xl bg-[#1c1c1c] hover:bg-[#222222] border border-white/5 hover:border-white/20 text-left transition flex items-center gap-3 group"
          >
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20">
              <Scale size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Balanço Patrimonial</p>
              <p className="text-[10px] text-neutral-400">Quadro formal comparativo</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('redeBackup')}
            className="p-3.5 rounded-xl bg-[#1c1c1c] hover:bg-[#222222] border border-white/5 hover:border-white/20 text-left transition flex items-center gap-3 group"
          >
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20">
              <DownloadCloud size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Backup & Rede Local</p>
              <p className="text-[10px] text-neutral-400">Exportação .bak e sincronização</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
