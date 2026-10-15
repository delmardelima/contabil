import React from 'react';
import { Empresa, NotaFiscal, ApuracaoFiscal } from '../../types/contabil';
import { dbService } from '../../db/sqliteService';
import { 
  Receipt, 
  TrendingUp, 
  TrendingDown, 
  Percent, 
  FileCheck, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight,
  Calculator,
  Layers,
  FileText
} from 'lucide-react';

interface DashboardFiscalModuleProps {
  empresa: Empresa;
  onNavigate: (module: string) => void;
}

export const DashboardFiscalModule: React.FC<DashboardFiscalModuleProps> = ({
  empresa,
  onNavigate
}) => {
  const notas = dbService.getNotasFiscais(empresa.id);
  const apuracao = dbService.getApuracaoFiscal(empresa.id, empresa.competenciaAtiva);

  // Filtrar notas da competência ativa
  const [ano, mes] = empresa.competenciaAtiva.split('-');
  const notasCompetencia = notas.filter(n => n.dataEmissao.startsWith(`${ano}-${mes}`));

  const totalSaidas = notasCompetencia
    .filter(n => n.tipo === 'SAIDA')
    .reduce((acc, n) => acc + n.valorTotal, 0);

  const totalEntradas = notasCompetencia
    .filter(n => n.tipo === 'ENTRADA')
    .reduce((acc, n) => acc + n.valorTotal, 0);

  const totalServicos = notasCompetencia
    .filter(n => n.tipo === 'SERVICO')
    .reduce((acc, n) => acc + n.valorTotal, 0);

  const faturamentoTotal = totalSaidas + totalServicos;
  const totalImpostos = (apuracao && apuracao.impostoDevido !== undefined) ? apuracao.impostoDevido : (faturamentoTotal * 0.0825);
  const cargaTributaria = faturamentoTotal > 0 ? (totalImpostos / faturamentoTotal) * 100 : 0;
  const notasNaoIntegradas = notas.filter(n => !n.integradaContabil).length;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#141414] text-neutral-200 overflow-y-auto p-6 space-y-6 select-none custom-scrollbar">
      {/* Top Banner de Boas-Vindas e Status Fiscal */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <h1 className="text-xl font-bold text-neutral-100">Painel Geral da Escrita Fiscal</h1>
            <span className="text-xs bg-amber-500/20 text-amber-400 font-mono px-2 py-0.5 rounded">
              {empresa.regimeTributario}
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Empresa: <strong className="text-neutral-200">{empresa.razaoSocial}</strong> • Competência Ativa: <strong className="text-neutral-200 font-mono">{empresa.competenciaAtiva}</strong>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('apuracaoFiscal')}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-medium flex items-center space-x-2 transition shadow-md shadow-amber-900/30"
          >
            <Calculator className="w-4 h-4" />
            <span>Calcular Guia / Apuração</span>
          </button>
        </div>
      </div>

      {/* Grid de 4 Cards de Indicadores Fiscais Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Faturamento Bruto */}
        <div className="p-4 bg-[#181818] rounded-xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Faturamento Bruto (Mês)</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-100">
            R$ {faturamentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center space-x-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Saídas R$ {totalSaidas.toFixed(2)} | Serviços R$ {totalServicos.toFixed(2)}</span>
          </div>
        </div>

        {/* Card 2: Entradas / Compras */}
        <div className="p-4 bg-[#181818] rounded-xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Entradas & Aquisições</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-100">
            R$ {totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-neutral-400 flex items-center space-x-1">
            <span>Créditos e Custos de Insumos</span>
          </div>
        </div>

        {/* Card 3: Impostos Apurados */}
        <div className="p-4 bg-[#181818] rounded-xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Tributos a Recolher</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            R$ {totalImpostos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-neutral-400">
            {empresa.regimeTributario === 'SIMPLES_NACIONAL' ? 'Guia DAS Simples Nacional' : 'ICMS + PIS/COFINS + ISS'}
          </div>
        </div>

        {/* Card 4: Carga Tributária Efetiva */}
        <div className="p-4 bg-[#181818] rounded-xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Carga Tributária Efetiva</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-100">
            {cargaTributaria.toFixed(2)}%
          </div>
          <div className="text-[11px] text-neutral-400">
            Relação Imposto / Receita Operacional
          </div>
        </div>
      </div>

      {/* Seção Central: Status das Integrações & Atalhos Fiscais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel de Alerta de Integração Contábil */}
        <div className="lg:col-span-2 bg-[#181818] rounded-xl border border-white/10 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-100 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Status de Integração Contábil (Escrita $\rightarrow$ Contabilidade)</span>
            </h3>
            <span className={`text-xs px-2.5 py-0.5 rounded font-mono ${
              notasNaoIntegradas === 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
            }`}>
              {notasNaoIntegradas === 0 ? 'Tudo Integrado' : `${notasNaoIntegradas} Pendentes`}
            </span>
          </div>

          <p className="text-xs text-neutral-400">
            Os documentos fiscais escriturados e os acumuladores configurados geram partidas dobradas automatizadas no módulo Contábil, incluindo apropriação de receitas, deduções de impostos e contas a pagar de fornecedores.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => onNavigate('notasFiscais')}
              className="p-3 bg-neutral-900 hover:bg-neutral-800 rounded-lg border border-white/5 text-left transition flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-semibold text-neutral-200">Importador de XML & Notas</div>
                <div className="text-[11px] text-neutral-400">Upload NF-e, NFC-e, NFS-e</div>
              </div>
              <FileText className="w-4 h-4 text-neutral-400" />
            </button>

            <button
              onClick={() => onNavigate('acumuladores')}
              className="p-3 bg-neutral-900 hover:bg-neutral-800 rounded-lg border border-white/5 text-left transition flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-semibold text-neutral-200">Cadastro de Acumuladores</div>
                <div className="text-[11px] text-neutral-400">Regras contábeis e CFOP</div>
              </div>
              <Layers className="w-4 h-4 text-neutral-400" />
            </button>
          </div>
        </div>

        {/* Painel Lateral: Regime & Calendário Fiscal */}
        <div className="bg-[#181818] rounded-xl border border-white/10 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-neutral-100 flex items-center space-x-2">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <span>Obrigações da Competência</span>
          </h3>

          <div className="space-y-3 text-xs font-mono">
            <div className="p-2.5 bg-neutral-900 rounded border border-white/5 flex items-center justify-between">
              <div>
                <div className="font-sans font-semibold text-neutral-200">PGDAS-D / Simples Nacional</div>
                <div className="text-[10px] text-neutral-500">Vencimento: Dia 20</div>
              </div>
              <span className="text-amber-400 font-bold">20/{mes}</span>
            </div>

            <div className="p-2.5 bg-neutral-900 rounded border border-white/5 flex items-center justify-between">
              <div>
                <div className="font-sans font-semibold text-neutral-200">SPED EFD ICMS/IPI</div>
                <div className="text-[10px] text-neutral-500">Vencimento: Dia 15</div>
              </div>
              <span className="text-blue-400 font-bold">15/{mes}</span>
            </div>

            <div className="p-2.5 bg-neutral-900 rounded border border-white/5 flex items-center justify-between">
              <div>
                <div className="font-sans font-semibold text-neutral-200">EFD-Contribuições (PIS/COFINS)</div>
                <div className="text-[10px] text-neutral-500">Vencimento: 10º dia útil</div>
              </div>
              <span className="text-neutral-400 font-bold">14/{mes}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
