import React, { useState } from 'react';
import { ModuloSistema } from '../../types/contabil';
import {
  LayoutDashboard,
  Building2,
  Sliders,
  Users,
  Network,
  ListTree,
  FileText,
  PieChart,
  Repeat,
  Layers,
  BookOpen,
  Scale,
  BarChart3,
  FileCheck2,
  FileSpreadsheet,
  ShieldAlert,
  ArrowRightLeft,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Menu,
  LucideIcon,
  Zap,
  FileCode,
  TrendingUp,
  Receipt,
  Briefcase,
  DollarSign,
  Calculator,
  CreditCard,
  Archive,
  BarChart2
} from 'lucide-react';

export interface NavItem {
  id: string;
  title: string;
  icon: LucideIcon;
  badge?: string;
  shortcut?: string;
}

export interface NavGroup {
  id: string;
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  activeModuleId: string;
  onNavigate: (itemId: string, title: string, icon: LucideIcon) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  moduloAtivo: ModuloSistema;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModuleId,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  moduloAtivo
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    admin: true,
    cadastros: true,
    movimentos: true,
    automacoes: true,
    relatorios: true,
    utilitarios: false,
    fiscal_mov: true,
    fiscal_cad: true,
    folha_proc: true,
    folha_cad: true,
    honorarios_mov: true,
    honorarios_cad: true
  });

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Grupos por Módulo
  let navGroups: NavGroup[] = [];

  if (moduloAtivo === 'contabilidade') {
    navGroups = [
      {
        id: 'admin',
        title: 'CONTROLE & ADMINISTRAÇÃO',
        items: [
          { id: 'empresas', title: 'Empresas & Filiais', icon: Building2 },
          { id: 'parametros', title: 'Parâmetros Contábeis', icon: Sliders },
          { id: 'usuarios', title: 'Usuários & Auditoria', icon: Users },
          { id: 'redeBackup', title: 'Rede LAN & Backup', icon: Network, badge: 'ACID' }
        ]
      },
      {
        id: 'cadastros',
        title: 'CADASTROS DO ESCRITÓRIO',
        items: [
          { id: 'planoContas', title: 'Plano de Contas', icon: ListTree, shortcut: 'F3' },
          { id: 'historicos', title: 'Históricos Padrão', icon: FileText },
          { id: 'centrosCusto', title: 'Centros de Custo', icon: PieChart },
          { id: 'lancamentosPadrao', title: 'Lançamentos Padrão', icon: Repeat },
          { id: 'estruturaDRE', title: 'Estrutura da D.R.E.', icon: Layers }
        ]
      },
      {
        id: 'movimentos',
        title: 'MOVIMENTAÇÃO CONTÁBIL',
        items: [
          { id: 'lancamentos', title: 'Digitação de Lançamentos', icon: BookOpen, shortcut: 'F2' },
          { id: 'lotes', title: 'Gestão de Lotes', icon: Layers },
          { id: 'zeramento', title: 'Encerramento de Período (ARE)', icon: FileCheck2 }
        ]
      },
      {
        id: 'automacoes',
        title: 'AUTOMAÇÃO & SPED',
        items: [
          { id: 'importacaoConciliacao', title: 'Importação OFX & Conciliação', icon: Zap, badge: 'AUTO' },
          { id: 'exportacaoContabil', title: 'Exportação SPED ECD', icon: FileCode, badge: 'ECD' }
        ]
      },
      {
        id: 'relatorios',
        title: 'RELATÓRIOS & DEMONSTRATIVOS',
        items: [
          { id: 'balancete', title: 'Balancete de Verificação', icon: Scale, shortcut: 'F4' },
          { id: 'balanco', title: 'Balanço Patrimonial', icon: Scale },
          { id: 'dre', title: 'Demonstração de Resultado (DRE)', icon: BarChart3 },
          { id: 'dlpa', title: 'Lucros/Prejuízos (DLPA)', icon: TrendingUp },
          { id: 'dfc', title: 'Fluxo de Caixa (DFC)', icon: DollarSign },
          { id: 'livros', title: 'Livro Diário & Razão Analítico', icon: BookOpen },
          { id: 'documentStudio', title: 'Document Studio (Termos A4)', icon: FileSpreadsheet }
        ]
      },
      {
        id: 'utilitarios',
        title: 'UTILITÁRIOS & FERRAMENTAS',
        items: [
          { id: 'auditoria', title: 'Auditoria de Saldos Invertidos', icon: ShieldAlert, badge: 'CFC' },
          { id: 'transporteSaldos', title: 'Transporte de Saldos Anual', icon: ArrowRightLeft }
        ]
      }
    ];
  } else if (moduloAtivo === 'escrita') {
    navGroups = [
      {
        id: 'fiscal_mov',
        title: 'MOVIMENTAÇÃO FISCAL',
        items: [
          { id: 'notasFiscais', title: 'Importador XML & Notas', icon: FileText, badge: 'XML' },
          { id: 'apuracaoFiscal', title: 'Apuração DAS / ICMS / PIS', icon: Calculator, badge: 'GUIA' }
        ]
      },
      {
        id: 'fiscal_cad',
        title: 'CONFIGURAÇÕES FISCAIS',
        items: [
          { id: 'acumuladores', title: 'Acumuladores Fiscais', icon: Layers, badge: 'CFOP' },
          { id: 'parametros', title: 'Parâmetros de Tributação', icon: Sliders },
          { id: 'empresas', title: 'Dados Cadastrais da Empresa', icon: Building2 }
        ]
      },
      {
        id: 'relatorios',
        title: 'LIVROS & RELATÓRIOS FISCAIS',
        items: [
          { id: 'livros', title: 'Livros de Entradas e Saídas', icon: BookOpen },
          { id: 'documentStudio', title: 'Termos de Abertura/Encerramento', icon: FileSpreadsheet }
        ]
      }
    ];
  } else if (moduloAtivo === 'folha') {
    navGroups = [
      {
        id: 'folha_proc',
        title: 'PROCESSAMENTO DA FOLHA',
        items: [
          { id: 'calculoFolha', title: 'Cálculo da Folha & Holerites', icon: Calculator, badge: 'A4' },
          { id: 'colaboradores', title: 'Cadastro de Empregados e Sócios', icon: Users, badge: 'CLT' }
        ]
      },
      {
        id: 'folha_cad',
        title: 'PARÂMETROS & ENCARGOS',
        items: [
          { id: 'rubricas', title: 'Rubricas & Tabelas INSS/IRRF', icon: Sliders },
          { id: 'centrosCusto', title: 'Departamentos e Centros de Custo', icon: PieChart },
          { id: 'empresas', title: 'Dados da Empresa Empregadora', icon: Building2 }
        ]
      },
      {
        id: 'relatorios',
        title: 'RELATÓRIOS DO DP',
        items: [
          { id: 'documentStudio', title: 'Document Studio (Contratos/Termos)', icon: FileSpreadsheet }
        ]
      }
    ];
  } else if (moduloAtivo === 'honorarios') {
    navGroups = [
      {
        id: 'honorarios_mov',
        title: 'FATURAMENTO & RECEBIMENTOS',
        items: [
          { id: 'faturamentoHonorarios', title: 'Faturamento em Lote & Baixas', icon: Receipt, badge: 'LOTE' },
          { id: 'contratosHonorarios', title: 'Contratos Mensais de Clientes', icon: FileText, badge: 'MRR' }
        ]
      },
      {
        id: 'honorarios_cad',
        title: 'CONFIGURAÇÃO FINANCEIRA',
        items: [
          { id: 'empresas', title: 'Cadastro de Clientes do Escritório', icon: Building2 },
          { id: 'parametros', title: 'Parâmetros de Honorários', icon: Sliders }
        ]
      },
      {
        id: 'relatorios',
        title: 'RELATÓRIOS FINANCEIROS',
        items: [
          { id: 'documentStudio', title: 'Document Studio (Contratos A4)', icon: FileSpreadsheet }
        ]
      }
    ];
  }

  // Dashboard fixo correspondente ao módulo
  const dashboardItem = {
    contabilidade: { id: 'dashboard', title: 'Dashboard Executivo', icon: LayoutDashboard },
    escrita: { id: 'dashboardFiscal', title: 'Dashboard Fiscal', icon: Receipt },
    folha: { id: 'dashboardFolha', title: 'Dashboard da Folha', icon: Users },
    honorarios: { id: 'dashboardHonorarios', title: 'Dashboard Financeiro', icon: DollarSign }
  }[moduloAtivo];

  return (
    <aside 
      className={`h-full bg-[#181818] border-r border-white/10 flex flex-col transition-all duration-200 select-none z-30 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Botão de recolhimento da sidebar */}
      <div className="h-10 px-3 border-b border-white/5 flex items-center justify-between text-neutral-400">
        {!isCollapsed && (
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 pl-1">
            {moduloAtivo.toUpperCase()}
          </span>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 hover:bg-white/10 hover:text-white rounded-md transition ml-auto"
          title={isCollapsed ? 'Expandir Menu Lateral' : 'Recolher Menu Lateral'}
        >
          {isCollapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Item Fixado: Dashboard do Módulo */}
      <div className="p-2 border-b border-white/5">
        <button
          onClick={() => onNavigate(dashboardItem.id, dashboardItem.title, dashboardItem.icon)}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition ${
            activeModuleId === dashboardItem.id
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-neutral-300 hover:bg-white/5 hover:text-white'
          }`}
          title={dashboardItem.title}
        >
          <dashboardItem.icon size={18} className="flex-shrink-0 text-blue-400" />
          {!isCollapsed && <span>{dashboardItem.title}</span>}
        </button>
      </div>

      {/* Lista de Grupos de Navegação com Accordion */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-3 custom-scrollbar">
        {navGroups.map((group) => {
          const isExpanded = expandedGroups[group.id] ?? true;

          return (
            <div key={group.id} className="space-y-1">
              {/* Header do Grupo */}
              {!isCollapsed ? (
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 hover:text-neutral-200 transition"
                >
                  <span>{group.title}</span>
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
              ) : (
                <div className="h-2" />
              )}

              {/* Itens do Grupo */}
              {(isExpanded || isCollapsed) && (
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeModuleId === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => onNavigate(item.id, item.title, Icon)}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs transition group relative ${
                          isActive
                            ? 'bg-white/10 text-white font-medium'
                            : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-200'
                        }`}
                        title={isCollapsed ? `${item.title} ${item.shortcut ? `(${item.shortcut})` : ''}` : undefined}
                      >
                        <Icon size={16} className={`flex-shrink-0 ${isActive ? 'text-blue-400' : 'text-neutral-500 group-hover:text-neutral-300'}`} />

                        {!isCollapsed && (
                          <>
                            <span className="flex-1 text-left truncate">{item.title}</span>

                            {item.shortcut && (
                              <kbd className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-neutral-900 border border-white/10 text-neutral-400">
                                {item.shortcut}
                              </kbd>
                            )}

                            {item.badge && (
                              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-blue-500/20 text-blue-400 font-semibold">
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};
