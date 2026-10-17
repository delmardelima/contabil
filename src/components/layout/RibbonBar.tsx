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
  FileCheck2,
  Boxes,
  UserMinus,
  Heart,
  Clock,
  ShieldCheck,
  Factory,
  Activity,
  Briefcase,
  Home,
  HeartPulse,
  Landmark,
  Building2,
  Sparkles,
  Percent,
  Mail,
  KeyRound,
  Wheat,
  HardHat,
  Globe2,
  Coins,
  Sprout,
  Fuel,
  FileCheck,
  HeartHandshake,
  Ship,
  Car,
  Leaf,
  Anchor,
  Compass,
  Award,
  RotateCcw,
  Wallet,
  Truck,
  Stethoscope,
  Ambulance,
  GraduationCap,
  Gavel
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
      { id: 'dashboard', label: 'Painel do Contador', icon: LayoutDashboard },
      { id: 'lancamentos', label: 'Lançamentos & Caixa (F2)', icon: BookOpen },
      { id: 'importacaoConciliacao', label: 'Importar Extrato OFX', icon: Zap },
      { id: 'planoContas', label: 'Plano de Contas (F3)', icon: FolderTree },
      { id: 'balancete', label: 'Balancete (F4)', icon: Scale },
      { id: 'dre', label: 'D.R.E. Mensal/Anual', icon: PieChart },
      { id: 'balanco', label: 'Balanço Patrimonial', icon: Scale },
      { id: 'livros', label: 'Diário, Razão & Caixa', icon: ScrollText },
      { id: 'zeramento', label: 'Encerramento & Lucros', icon: RefreshCw },
      { id: 'ativoImobilizado', label: 'Bens & Depreciação', icon: Archive },
      { id: 'lotes', label: 'Lotes', icon: Layers },
      { id: 'documentStudio', label: 'Termos & Atas A4', icon: FileSpreadsheet },
      { id: 'calendarioFiscal', label: 'Agenda DAS/Simples', icon: Calendar },
      { id: 'redeBackup', label: 'Backup (.bak)', icon: Network }
    ];
  } else if (moduloAtivo === 'escrita') {
    topTabs = [
      { id: 'dashboardFiscal', label: 'Painel Simples / MEI', icon: Receipt },
      { id: 'notasFiscais', label: 'Importar XML (NF-e / NFC-e)', icon: FileText },
      { id: 'nfse', label: 'NFS-e Serviços', icon: Receipt },
      { id: 'pgdas', label: 'PGDAS-D & Guia DAS', icon: Calculator },
      { id: 'fatorR', label: 'Fator R (28%)', icon: Percent },
      { id: 'simplesRegimeCaixa', label: 'Simples Regime Caixa', icon: Wallet },
      { id: 'defis', label: 'DEFIS / DASN-SIMEI', icon: Building2 },
      { id: 'acumuladores', label: 'Acumuladores (Integração)', icon: Layers },
      { id: 'cartoes', label: 'Cartões & PIX', icon: CreditCard },
      { id: 'difal', label: 'DIFAL & DeSTDA', icon: Scale },
      { id: 'livros', label: 'Livros Fiscais', icon: BookOpen }
    ];
  } else if (moduloAtivo === 'folha') {
    topTabs = [
      { id: 'dashboardFolha', label: 'Painel DP Simplificado', icon: Users },
      { id: 'calculoFolha', label: 'Pró-Labore & Folha Mensal', icon: Calculator },
      { id: 'colaboradores', label: 'Sócios & Empregados', icon: Users },
      { id: 'rescisao', label: 'Férias & Rescisão (TRCT)', icon: UserMinus },
      { id: 'esocial', label: 'eSocial Simplificado', icon: FileCode },
      { id: 'dctfWeb', label: 'DCTFWeb & Guia INSS/FGTS', icon: FileCheck2 },
      { id: 'rubricas', label: 'Rubricas & INSS/IRRF', icon: Sliders }
    ];
  } else if (moduloAtivo === 'honorarios') {
    topTabs = [
      { id: 'dashboardHonorarios', label: 'Painel do Escritório', icon: DollarSign },
      { id: 'contratosHonorarios', label: 'Mensalidades (Clientes)', icon: FileText },
      { id: 'faturamentoHonorarios', label: 'Gerar Cobranças do Mês', icon: Receipt },
      { id: 'boletosHonorarios', label: 'Recibos & PIX', icon: CreditCard },
      { id: 'protocolo', label: 'Protocolo de Entrega', icon: FileText },
      { id: 'documentStudio', label: 'Contratos Contábeis A4', icon: FileSpreadsheet }
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
                <span>Novo Lançamento / Caixa (F2)</span>
              </button>

              <button
                onClick={() => onNavigate('importacaoConciliacao', 'Importação OFX & Conciliação', Zap)}
                className="flex items-center space-x-1.5 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium rounded border border-white/10 transition-colors text-xs"
              >
                <Zap className="w-3.5 h-3.5 text-blue-400" />
                <span>Importar Extrato Bancário (OFX)</span>
              </button>

              <button
                onClick={() => onNavigate('balancete', 'Balancete de Verificação', Scale)}
                className="flex items-center space-x-1.5 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium rounded border border-white/10 transition-colors text-xs"
              >
                <Scale className="w-3.5 h-3.5 text-emerald-400" />
                <span>Conferir Balancete (F4)</span>
              </button>

              <button
                onClick={() => onNavigate('zeramento', 'Encerramento & Lucros Isentos', RefreshCw)}
                className="flex items-center space-x-1.5 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium rounded border border-white/10 transition-colors text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                <span>Fechar Período / Distribuir Lucros</span>
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
                <span>Importar XML (NF-e / NFC-e)</span>
              </button>

              <button
                onClick={() => onNavigate('pgdas', 'PGDAS-D & Guia DAS', Calculator)}
                className="flex items-center space-x-1.5 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium rounded border border-white/10 transition-colors text-xs"
              >
                <Calculator className="w-3.5 h-3.5 text-amber-400" />
                <span>Calcular DAS (Simples Nacional)</span>
              </button>

              <button
                onClick={() => onNavigate('fatorR', 'Apuração do Fator R (28%)', Percent)}
                className="flex items-center space-x-1.5 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium rounded border border-white/10 transition-colors text-xs"
              >
                <Percent className="w-3.5 h-3.5 text-blue-400" />
                <span>Simular Fator R (Anexo III vs V)</span>
              </button>

              <button
                onClick={() => onNavigate('simplesRegimeCaixa', 'Simples Nacional - Regime de Caixa', Wallet)}
                className="flex items-center space-x-1.5 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium rounded border border-white/10 transition-colors text-xs"
              >
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Apuração por Regime de Caixa</span>
              </button>
            </>
          )}

          {moduloAtivo === 'folha' && (
            <>
              <button
                onClick={() => onNavigate('calculoFolha', 'Cálculo da Folha & Pró-Labore', Calculator)}
                className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded shadow transition-colors text-xs"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Calcular Pró-Labore / Folha</span>
              </button>

              <button
                onClick={() => onNavigate('colaboradores', 'Cadastro de Sócios e Empregados', Users)}
                className="flex items-center space-x-1.5 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium rounded border border-white/10 transition-colors text-xs"
              >
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cadastrar Sócio / Empregado</span>
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
                <span>Gerar Mensalidades do Mês</span>
              </button>

              <button
                onClick={() => onNavigate('contratosHonorarios', 'Contratos Mensais de Clientes', FileText)}
                className="flex items-center space-x-1.5 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium rounded border border-white/10 transition-colors text-xs"
              >
                <FileText className="w-3.5 h-3.5 text-purple-400" />
                <span>Contratos de Clientes</span>
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
