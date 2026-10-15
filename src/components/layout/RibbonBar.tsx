import React from 'react';
import { ModuloSistema } from '../../types/contabil';
import { 
  FileSpreadsheet, 
  BookOpen, 
  Scale, 
  PieChart, 
  ScrollText, 
  FolderTree, 
  FileText, 
  RefreshCw, 
  Printer, 
  PlusCircle, 
  CheckCheck, 
  LayoutDashboard, 
  Sliders, 
  Users, 
  Network, 
  Layers, 
  ShieldAlert, 
  ArrowRightLeft,
  LucideIcon,
  Zap,
  FileCode,
  TrendingUp,
  Receipt,
  DollarSign,
  Calculator,
  CreditCard,
  Package,
  Calendar,
  Share2,
  Archive,
  FileCheck2
} from 'lucide-react';

interface RibbonBarProps {
  activeModuleId: string;
  onNavigate: (moduleId: string, title?: string, icon?: LucideIcon) => void;
  onNewLancamento: () => void;
  onPrintPreview: () => void;
  moduloAtivo: ModuloSistema;
}

export const RibbonBar: React.FC<RibbonBarProps> = ({
  activeModuleId,
  onNavigate,
  onNewLancamento,
  onPrintPreview,
  moduloAtivo
}) => {
  let topTabs: { id: string; label: string; icon: LucideIcon }[] = [];

  if (moduloAtivo === 'contabilidade') {
    topTabs = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'lancamentos', label: 'Lançamentos (F2)', icon: BookOpen },
      { id: 'importacaoConciliacao', label: 'Importação OFX', icon: Zap },
      { id: 'exportacaoContabil', label: 'SPED ECD Oficial', icon: FileCode },
      { id: 'balancete', label: 'Balancete (F4)', icon: Scale },
      { id: 'balanco', label: 'Balanço Patrimonial', icon: Scale },
      { id: 'dre', label: 'D.R.E.', icon: PieChart },
      { id: 'dlpa', label: 'D.L.P.A.', icon: TrendingUp },
      { id: 'dfc', label: 'D.F.C.', icon: DollarSign },
      { id: 'livros', label: 'Diário & Razão', icon: ScrollText },
      { id: 'calendarioFiscal', label: 'Calendário Fiscal', icon: Calendar },
      { id: 'documentStudio', label: 'Document Studio A4', icon: FileSpreadsheet },
      { id: 'planoContas', label: 'Plano de Contas', icon: FolderTree },
      { id: 'lotes', label: 'Lotes (CTLOTE)', icon: Layers },
      { id: 'zeramento', label: 'Zeramento (ARE)', icon: RefreshCw },
      { id: 'inventarioPatrimonial', label: 'Inventário CPC 27', icon: Archive },
      { id: 'razaoAuxiliar', label: 'Razão Auxiliar (Clientes/Forn)', icon: FileSpreadsheet },
      { id: 'apuracaoTrimestral', label: 'IRPJ & CSLL (Trimestral)', icon: Calculator },
      { id: 'lalur', label: 'LALUR / LACS (Lucro Real)', icon: BookOpen },
      { id: 'consolidacao', label: 'Consolidação (CPC 36)', icon: Share2 },
      { id: 'auditoria', label: 'Auditoria & Saldos', icon: ShieldAlert },
      { id: 'redeBackup', label: 'Rede & Backup', icon: Network }
    ];
  } else if (moduloAtivo === 'escrita') {
    topTabs = [
      { id: 'dashboardFiscal', label: 'Dashboard Fiscal', icon: Receipt },
      { id: 'notasFiscais', label: 'Importador XML & NF-e', icon: FileText },
      { id: 'nfse', label: 'NFS-e Nacional / DPS', icon: Receipt },
      { id: 'ciap', label: 'CIAP (Bloco G 1/48)', icon: Layers },
      { id: 'lcdpr', label: 'Livro Caixa Rural (LCDPR)', icon: BookOpen },
      { id: 'cartoes', label: 'Vendas Cartões (1600)', icon: CreditCard },
      { id: 'retencoes', label: 'Retenções na Fonte (DARF)', icon: Receipt },
      { id: 'reinf', label: 'EFD-Reinf XML (v2.01)', icon: FileCode },
      { id: 'difal', label: 'DIFAL & DeSTDA (GNRE)', icon: Scale },
      { id: 'participantes', label: 'Participantes SPED', icon: Users },
      { id: 'produtos', label: 'Itens & Produtos', icon: Package },
      { id: 'acumuladores', label: 'Acumuladores (CFOP)', icon: Layers },
      { id: 'apuracaoFiscal', label: 'Apuração DAS / Guias', icon: Calculator },
      { id: 'calendarioFiscal', label: 'Calendário Fiscal', icon: Calendar },
      { id: 'livros', label: 'Livros Fiscais', icon: BookOpen },
      { id: 'documentStudio', label: 'Document Studio A4', icon: FileSpreadsheet }
    ];
  } else if (moduloAtivo === 'folha') {
    topTabs = [
      { id: 'dashboardFolha', label: 'Dashboard Folha', icon: Users },
      { id: 'calculoFolha', label: 'Processar Folha / Holerites', icon: Calculator },
      { id: 'esocial', label: 'Central eSocial XML', icon: FileCode },
      { id: 'dctfWeb', label: 'DCTFWeb & DARF', icon: FileCheck2 },
      { id: 'provisoesFolha', label: 'Provisões (Férias/13º)', icon: Layers },
      { id: 'colaboradores', label: 'Empregados e Sócios', icon: Users },
      { id: 'rubricas', label: 'Rubricas & Tabelas INSS/IRRF', icon: Sliders },
      { id: 'calendarioFiscal', label: 'Calendário Legal', icon: Calendar },
      { id: 'documentStudio', label: 'Document Studio A4', icon: FileSpreadsheet }
    ];
  } else if (moduloAtivo === 'honorarios') {
    topTabs = [
      { id: 'dashboardHonorarios', label: 'Dashboard Financeiro', icon: DollarSign },
      { id: 'faturamentoHonorarios', label: 'Faturamento em Lote & Baixas', icon: Receipt },
      { id: 'nfse', label: 'NFS-e Nacional / DPS', icon: Receipt },
      { id: 'contratosHonorarios', label: 'Contratos Mensais (MRR)', icon: FileText },
      { id: 'documentStudio', label: 'Document Studio A4', icon: FileSpreadsheet }
    ];
  }

  return (
    <div className="bg-[#1c1c1c] border-b border-white/10 select-none text-xs flex-shrink-0">
      {/* Abas Superiores do Ribbon */}
      <div className="flex items-center px-2 space-x-0.5 border-b border-white/5 bg-[#171717] overflow-x-auto custom-scrollbar">
        {topTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeModuleId === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id, tab.label, Icon)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 border-b-2 text-xs transition-colors whitespace-nowrap font-medium ${
                isActive
                  ? 'border-blue-500 text-blue-400 bg-neutral-900/60'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Faixa de Ferramentas e Atalhos Rápidos */}
      <div className="p-2 flex items-center justify-between bg-[#191919]">
        <div className="flex items-center space-x-2">
          {moduloAtivo === 'contabilidade' && (
            <>
              <button
                onClick={onNewLancamento}
                className="flex items-center space-x-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded shadow transition-colors text-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Nova Partida (F2)</span>
              </button>

              <button
                onClick={() => onNavigate('importacaoConciliacao', 'Importação OFX & Conciliação', Zap)}
                className="flex items-center space-x-1.5 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium rounded border border-white/10 transition-colors text-xs"
              >
                <Zap className="w-3.5 h-3.5 text-blue-400" />
                <span>Importar OFX</span>
              </button>

              <button
                onClick={() => onNavigate('exportacaoContabil', 'Exportação SPED ECD', FileCode)}
                className="flex items-center space-x-1.5 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium rounded border border-white/10 transition-colors text-xs"
              >
                <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                <span>Gerar SPED ECD</span>
              </button>
            </>
          )}

          {moduloAtivo === 'escrita' && (
            <>
              <button
                onClick={() => onNavigate('notasFiscais', 'Importador XML & Notas', FileText)}
                className="flex items-center space-x-1.5 px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded shadow transition-colors text-xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Importar XML de NF-e</span>
              </button>

              <button
                onClick={() => onNavigate('apuracaoFiscal', 'Apuração DAS / ICMS / PIS', Calculator)}
                className="flex items-center space-x-1.5 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium rounded border border-white/10 transition-colors text-xs"
              >
                <Calculator className="w-3.5 h-3.5 text-amber-400" />
                <span>Calcular Apuração / Guias</span>
              </button>
            </>
          )}

          {moduloAtivo === 'folha' && (
            <>
              <button
                onClick={() => onNavigate('calculoFolha', 'Cálculo da Folha & Holerites', Calculator)}
                className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded shadow transition-colors text-xs"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Processar Folha Mensal</span>
              </button>

              <button
                onClick={() => onNavigate('colaboradores', 'Cadastro de Empregados e Sócios', Users)}
                className="flex items-center space-x-1.5 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium rounded border border-white/10 transition-colors text-xs"
              >
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>Novo Vínculo / Colaborador</span>
              </button>
            </>
          )}

          {moduloAtivo === 'honorarios' && (
            <>
              <button
                onClick={() => onNavigate('faturamentoHonorarios', 'Faturamento em Lote & Baixas', Receipt)}
                className="flex items-center space-x-1.5 px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded shadow transition-colors text-xs"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Faturamento em Lote</span>
              </button>

              <button
                onClick={() => onNavigate('contratosHonorarios', 'Contratos Mensais de Clientes', FileText)}
                className="flex items-center space-x-1.5 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium rounded border border-white/10 transition-colors text-xs"
              >
                <FileText className="w-3.5 h-3.5 text-purple-400" />
                <span>Contratos MRR</span>
              </button>
            </>
          )}
        </div>

        {/* Lado Direito: Preview de Impressão A4 */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onPrintPreview}
            className="flex items-center space-x-1.5 px-3 py-1 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 rounded border border-white/10 text-xs transition-colors"
            title="Visualização e Impressão em Folha A4 Oficial"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span>Impressão A4</span>
          </button>
        </div>
      </div>
    </div>
  );
};
