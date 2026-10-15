import React from 'react';
import { Empresa, ContratoHonorario, FaturaHonorario } from '../../types/contabil';
import { dbService } from '../../db/sqliteService';
import { 
  DollarSign, 
  TrendingUp, 
  Receipt, 
  AlertCircle, 
  CheckCircle2, 
  CreditCard, 
  FileText, 
  Calculator,
  Calendar,
  Layers
} from 'lucide-react';

interface DashboardHonorariosModuleProps {
  empresa: Empresa;
  onNavigate: (module: string) => void;
}

export const DashboardHonorariosModule: React.FC<DashboardHonorariosModuleProps> = ({
  empresa,
  onNavigate
}) => {
  const contratos = dbService.getContratosHonorarios();
  const faturas = dbService.getFaturasHonorarios(empresa.competenciaAtiva);

  const mrr = contratos.filter(c => c.status !== 'CANCELADO').reduce((acc, c) => acc + (c.valorMensalBase ?? c.valorMensal ?? 0), 0);
  const totalFaturado = faturas.reduce((acc, f) => acc + f.valorTotal, 0);
  const totalRecebido = faturas.filter(f => f.status === 'PAGO').reduce((acc, f) => acc + f.valorTotal, 0);
  const totalPendente = faturas.filter(f => f.status === 'PENDENTE').reduce((acc, f) => acc + f.valorTotal, 0);
  const totalAtrasado = faturas.filter(f => f.status === 'ATRASADO').reduce((acc, f) => acc + f.valorTotal, 0);

  const taxaAdimplencia = totalFaturado > 0 ? (totalRecebido / totalFaturado) * 100 : 0;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#141414] text-neutral-200 overflow-y-auto p-6 space-y-6 select-none custom-scrollbar">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
            <h1 className="text-xl font-bold text-neutral-100">Gestão & Faturamento de Honorários Contábeis</h1>
            <span className="text-xs bg-purple-500/20 text-purple-400 font-mono px-2 py-0.5 rounded">
              Contratos & MRR
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Controle de receita recorrente, faturas mensais, serviços extraordinários e baixas bancárias.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('faturamentoHonorarios')}
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-medium flex items-center space-x-2 transition shadow-md shadow-purple-900/30"
          >
            <Calculator className="w-4 h-4" />
            <span>Faturar Competência ({empresa.competenciaAtiva})</span>
          </button>
        </div>
      </div>

      {/* Grid de 4 Cards de Indicadores Financeiros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: MRR (Receita Recorrente) */}
        <div className="p-4 bg-[#181818] rounded-xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Receita Recorrente (MRR)</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-purple-400">
            R$ {mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-neutral-400">
            {contratos.filter(c => c.status === 'ATIVO').length} Contratos Mensais Ativos
          </div>
        </div>

        {/* Card 2: Faturamento do Mês */}
        <div className="p-4 bg-[#181818] rounded-xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Total Faturado no Mês</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-100">
            R$ {totalFaturado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-neutral-400">
            Honorários Base + Serviços Extras
          </div>
        </div>

        {/* Card 3: Recebido / Liquidado */}
        <div className="p-4 bg-[#181818] rounded-xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Total Recebido no Caixa</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            R$ {totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-400/80">
            Adimplência: {taxaAdimplencia.toFixed(1)}%
          </div>
        </div>

        {/* Card 4: Inadimplência / Pendente */}
        <div className="p-4 bg-[#181818] rounded-xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Inadimplência / Pendente</span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400">
            R$ {(totalPendente + totalAtrasado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-neutral-400">
            {faturas.filter(f => f.status !== 'PAGO').length} Faturas a Liquidar
          </div>
        </div>
      </div>

      {/* Seção Operacional */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#181818] rounded-xl border border-white/10 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-100 flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-purple-400" />
              <span>Controle do Departamento de Cobrança</span>
            </h3>
            <button
              onClick={() => onNavigate('contratosHonorarios')}
              className="text-xs text-purple-400 hover:text-purple-300 font-medium"
            >
              Gerenciar Contratos $\rightarrow$
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-neutral-900 rounded-lg flex items-center justify-between">
              <div>
                <div className="font-semibold text-neutral-200">Geração Automática de 13º Honorário</div>
                <div className="text-[11px] text-neutral-400">Cobrança adicional para custeio de fechamento de balanços anuais</div>
              </div>
              <span className="text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                HABILITADO
              </span>
            </div>

            <div className="p-3 bg-neutral-900 rounded-lg flex items-center justify-between">
              <div>
                <div className="font-semibold text-neutral-200">Reajuste Automático por Índice (IGP-M / IPCA)</div>
                <div className="text-[11px] text-neutral-400">Aplicação automática no mês de aniversário do contrato</div>
              </div>
              <span className="text-blue-400 font-mono font-bold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                ANUAL
              </span>
            </div>
          </div>
        </div>

        {/* Ações e Atalhos */}
        <div className="bg-[#181818] rounded-xl border border-white/10 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-neutral-100 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <span>Rotinas Financeiras</span>
          </h3>

          <div className="space-y-2">
            <button
              onClick={() => onNavigate('faturamentoHonorarios')}
              className="w-full p-3 bg-neutral-900 hover:bg-neutral-800 rounded-lg border border-white/5 text-left transition flex items-center justify-between text-xs"
            >
              <div>
                <div className="font-semibold text-neutral-200">Grade de Faturas & Baixas</div>
                <div className="text-[11px] text-neutral-400">Liquiditar e emitir recibos A4</div>
              </div>
              <Receipt className="w-4 h-4 text-purple-400" />
            </button>

            <button
              onClick={() => onNavigate('contratosHonorarios')}
              className="w-full p-3 bg-neutral-900 hover:bg-neutral-800 rounded-lg border border-white/5 text-left transition flex items-center justify-between text-xs"
            >
              <div>
                <div className="font-semibold text-neutral-200">Contratos de Clientes</div>
                <div className="text-[11px] text-neutral-400">Valores, vencimentos e serviços</div>
              </div>
              <FileText className="w-4 h-4 text-purple-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
