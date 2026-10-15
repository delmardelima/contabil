import React from 'react';
import { Empresa, Colaborador, FolhaMensal } from '../../types/contabil';
import { dbService } from '../../db/sqliteService';
import { 
  Users, 
  DollarSign, 
  Briefcase, 
  Receipt, 
  FileCheck2, 
  Calculator, 
  ArrowUpRight, 
  ShieldCheck,
  Building,
  UserCheck
} from 'lucide-react';

interface DashboardFolhaModuleProps {
  empresa: Empresa;
  onNavigate: (module: string) => void;
}

export const DashboardFolhaModule: React.FC<DashboardFolhaModuleProps> = ({
  empresa,
  onNavigate
}) => {
  const colaboradores = dbService.getColaboradores(empresa.id);
  const folhas = dbService.getFolhasCalculadas(empresa.id, empresa.competenciaAtiva);

  const ativos = colaboradores.filter(c => c.status === 'ATIVO');
  const empregados = ativos.filter(c => c.tipoVinculo === 'CLT');
  const socios = ativos.filter(c => c.tipoVinculo === 'PRO_LABORE');

  const totalBruto = folhas.reduce((acc, f) => acc + (f.totalProventos || 0), 0);
  const totalLiquido = folhas.reduce((acc, f) => acc + (f.salarioLiquido || 0), 0);
  const totalINSS = folhas.reduce((acc, f) => acc + (f.inssSegurado || 0) + (f.inssPatronal || 0), 0);
  const totalFGTS = folhas.reduce((acc, f) => acc + (f.fgts || 0), 0);
  const totalIRRF = folhas.reduce((acc, f) => acc + (f.irrf || 0), 0);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#141414] text-neutral-200 overflow-y-auto p-6 space-y-6 select-none custom-scrollbar">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-xl font-bold text-neutral-100">Painel do Departamento Pessoal & Folha</h1>
            <span className="text-xs bg-emerald-500/20 text-emerald-400 font-mono px-2 py-0.5 rounded">
              eSocial / CLT
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Empresa: <strong className="text-neutral-200">{empresa.razaoSocial}</strong> • Competência Ativa: <strong className="text-neutral-200 font-mono">{empresa.competenciaAtiva}</strong>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('calculoFolha')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium flex items-center space-x-2 transition shadow-md shadow-emerald-900/30"
          >
            <Calculator className="w-4 h-4" />
            <span>Processar Folha / Holerites</span>
          </button>
        </div>
      </div>

      {/* Grid de 4 Cards de Indicadores Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Colaboradores Ativos */}
        <div className="p-4 bg-[#181818] rounded-xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Colaboradores & Vínculos</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-100">
            {ativos.length}
          </div>
          <div className="text-[11px] text-neutral-400">
            {empregados.length} CLT (Empregados) • {socios.length} Pró-Labore
          </div>
        </div>

        {/* Card 2: Salário Bruto Folha */}
        <div className="p-4 bg-[#181818] rounded-xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Total Bruto da Folha</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            R$ {totalBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-neutral-400">
            Salários Base + Pró-Labore + Horas Extras
          </div>
        </div>

        {/* Card 3: Encargos Previdenciários (INSS) */}
        <div className="p-4 bg-[#181818] rounded-xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>INSS Total (Patronal + Segurados)</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            R$ {totalINSS.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-neutral-400">
            Previdência Social (DCTFWeb / DARF)
          </div>
        </div>

        {/* Card 4: FGTS da Competência */}
        <div className="p-4 bg-[#181818] rounded-xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>FGTS Mensal (8%)</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-purple-400">
            R$ {totalFGTS.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-neutral-400">
            Fundo de Garantia (FGTS Digital)
          </div>
        </div>
      </div>

      {/* Seção de Resumo Operacional */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Folha Líquida e Distribuição */}
        <div className="lg:col-span-2 bg-[#181818] rounded-xl border border-white/10 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-neutral-100 flex items-center space-x-2">
            <Briefcase className="w-4 h-4 text-emerald-400" />
            <span>Demonstrativo Geral da Competência ({empresa.competenciaAtiva})</span>
          </h3>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-3 bg-neutral-900 rounded-lg flex justify-between items-center">
              <span className="font-sans text-neutral-300">Total de Proventos (Salários / Vencimentos Brutos)</span>
              <span className="text-neutral-100 font-bold">R$ {totalBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="p-3 bg-neutral-900 rounded-lg flex justify-between items-center text-rose-400">
              <span className="font-sans text-neutral-400">(-) Descontos de INSS dos Colaboradores</span>
              <span>- R$ {folhas.reduce((acc, f) => acc + (f.inssSegurado || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="p-3 bg-neutral-900 rounded-lg flex justify-between items-center text-rose-400">
              <span className="font-sans text-neutral-400">(-) Descontos de IRRF na Fonte</span>
              <span>- R$ {totalIRRF.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex justify-between items-center font-bold text-sm">
              <span className="font-sans text-emerald-300">(=) Total Líquido a Pagar aos Colaboradores</span>
              <span className="text-emerald-400">R$ {totalLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="pt-2 flex items-center space-x-3">
            <button
              onClick={() => onNavigate('colaboradores')}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs transition"
            >
              Cadastros de Empregados & Sócios
            </button>
            <button
              onClick={() => onNavigate('rubricas')}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs transition"
            >
              Tabela de Rubricas & Alíquotas
            </button>
          </div>
        </div>

        {/* Informações Legais & Obrigações DP */}
        <div className="bg-[#181818] rounded-xl border border-white/10 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-neutral-100 flex items-center space-x-2">
            <FileCheck2 className="w-4 h-4 text-emerald-400" />
            <span>Prazos do Departamento Pessoal</span>
          </h3>

          <div className="space-y-3 text-xs font-mono">
            <div className="p-2.5 bg-neutral-900 rounded border border-white/5 flex items-center justify-between">
              <div>
                <div className="font-sans font-semibold text-neutral-200">Pagamento de Salários (5º Dia Útil)</div>
                <div className="text-[10px] text-neutral-500">Crédito em conta bancária</div>
              </div>
              <span className="text-emerald-400 font-bold">07/{empresa.competenciaAtiva.split('-')[1]}</span>
            </div>

            <div className="p-2.5 bg-neutral-900 rounded border border-white/5 flex items-center justify-between">
              <div>
                <div className="font-sans font-semibold text-neutral-200">FGTS Digital</div>
                <div className="text-[10px] text-neutral-500">Vencimento via Pix Caixa</div>
              </div>
              <span className="text-purple-400 font-bold">20/{empresa.competenciaAtiva.split('-')[1]}</span>
            </div>

            <div className="p-2.5 bg-neutral-900 rounded border border-white/5 flex items-center justify-between">
              <div>
                <div className="font-sans font-semibold text-neutral-200">DCTFWeb / DARF Previdenciário</div>
                <div className="text-[10px] text-neutral-500">INSS Patronal e Segurados</div>
              </div>
              <span className="text-amber-400 font-bold">20/{empresa.competenciaAtiva.split('-')[1]}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
