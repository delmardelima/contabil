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
  BarChart2,
  Package,
  Calendar,
  Share2,
  Boxes,
  UserMinus,
  Heart,
  Lock,
  ShieldCheck,
  Factory,
  Clock,
  Activity,
  Home,
  HeartPulse,
  Landmark,
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

import { dbService } from '../../db/sqliteService';
import { MODULO_PERMISSOES } from '../../types/contabil';

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
          { id: 'empresas', title: 'Empresas & Clientes (MEI/Simples)', icon: Building2 },
          { id: 'parametros', title: 'Parâmetros Contábeis', icon: Sliders },
          { id: 'usuarios', title: 'Usuários & Acessos', icon: Users },
          { id: 'redeBackup', title: 'Rede LAN & Backup (.bak)', icon: Network, badge: 'ACID' }
        ]
      },
      {
        id: 'cadastros',
        title: 'CADASTROS DO ESCRITÓRIO',
        items: [
          { id: 'planoContas', title: 'Plano de Contas (ITG 1000)', icon: ListTree, shortcut: 'F3' },
          { id: 'historicos', title: 'Históricos Padrão', icon: FileText },
          { id: 'lancamentosPadrao', title: 'Lançamentos Padrão (Rápidos)', icon: Repeat },
          { id: 'centrosCusto', title: 'Centros de Custo', icon: PieChart },
          { id: 'estruturaDRE', title: 'Estrutura da D.R.E.', icon: Layers }
        ]
      },
      {
        id: 'movimentos',
        title: 'ROTINA CONTÁBIL MENSAL',
        items: [
          { id: 'lancamentos', title: 'Lançamentos & Caixa', icon: BookOpen, shortcut: 'F2' },
          { id: 'importacaoConciliacao', title: 'Importação OFX & Extratos', icon: Zap, badge: 'AUTO' },
          { id: 'lotes', title: 'Gestão de Lotes', icon: Layers },
          { id: 'ativoImobilizado', title: 'Bens & Depreciação', icon: Archive },
          { id: 'zeramento', title: 'Encerramento & Lucros Isentos', icon: FileCheck2, badge: 'ARE' }
        ]
      },
      {
        id: 'relatorios',
        title: 'RELATÓRIOS & DEMONSTRATIVOS',
        items: [
          { id: 'balancete', title: 'Balancete de Verificação', icon: Scale, shortcut: 'F4' },
          { id: 'balanco', title: 'Balanço Patrimonial (ITG 1000)', icon: Scale },
          { id: 'dre', title: 'Demonstração de Resultado (DRE)', icon: BarChart3 },
          { id: 'dlpa', title: 'Lucros Acumulados (DLPA)', icon: TrendingUp },
          { id: 'dfc', title: 'Fluxo de Caixa (DFC)', icon: DollarSign },
          { id: 'livros', title: 'Livro Diário, Razão & Caixa', icon: BookOpen },
          { id: 'balancoAbertura', title: 'Balanço de Abertura (ITG 1000)', icon: BookOpen, badge: 'ITG 1000' },
          { id: 'exportacaoContabil', title: 'Exportação SPED ECD (Opcional)', icon: FileCode, badge: 'ECD' },
          { id: 'documentStudio', title: 'Termos, Atas & Cartas (A4)', icon: FileSpreadsheet }
        ]
      },
      {
        id: 'utilitarios',
        title: 'UTILITÁRIOS DO ESCRITÓRIO',
        items: [
          { id: 'calendarioFiscal', title: 'Calendário DAS & Obrigações', icon: Calendar },
          { id: 'protocolo', title: 'Protocolo de Documentos', icon: FileText },
          { id: 'auditoria', title: 'Conferência de Saldos Invertidos', icon: ShieldAlert },
          { id: 'transporteSaldos', title: 'Virada de Ano (Transporte Saldos)', icon: ArrowRightLeft }
        ]
      }
    ];
  } else if (moduloAtivo === 'escrita') {
    navGroups = [
      {
        id: 'fiscal_mov',
        title: 'ROTINA SIMPLES NACIONAL & MEI',
        items: [
          { id: 'notasFiscais', title: 'Importador XML (NF-e / NFC-e)', icon: FileText, badge: 'XML' },
          { id: 'nfse', title: 'NFS-e Serviços Prestados/Tomados', icon: Receipt, badge: 'DPS' },
          { id: 'pgdas', title: 'Apuração PGDAS-D & Guia DAS', icon: Calculator, badge: 'DAS' },
          { id: 'fatorR', title: 'Cálculo do Fator R (28% Folha)', icon: Percent, badge: 'FATOR R' },
          { id: 'simplesRegimeCaixa', title: 'Simples Nacional (Regime Caixa)', icon: Wallet, badge: 'CAIXA' },
          { id: 'defis', title: 'Declaração Anual DEFIS / DASN-SIMEI', icon: Building2, badge: 'ANUAL' },
          { id: 'difal', title: 'DIFAL Simples & DeSTDA', icon: Scale, badge: 'GNRE' },
          { id: 'cartoes', title: 'Vendas em Cartão & PIX', icon: CreditCard },
          { id: 'retencoes', title: 'Retenções em Notas (ISS / INSS / IR)', icon: Receipt },
          { id: 'inventarioEstoque', title: 'Inventário de Estoque Anual', icon: Boxes },
          { id: 'ecacCaixaPostal', title: 'Caixa Postal e-CAC & Certidões', icon: Mail, badge: 'CND' }
        ]
      },
      {
        id: 'fiscal_cad',
        title: 'CADASTROS FISCAIS SIMPLIFICADOS',
        items: [
          { id: 'acumuladores', title: 'Acumuladores (Integração Contábil)', icon: Layers, badge: 'CFOP' },
          { id: 'participantes', title: 'Clientes & Fornecedores', icon: Users },
          { id: 'produtos', title: 'Produtos & Serviços', icon: Package },
          { id: 'empresas', title: 'Dados da Empresa (Simples/MEI)', icon: Building2 }
        ]
      },
      {
        id: 'relatorios',
        title: 'LIVROS FISCAIS & TERMOS',
        items: [
          { id: 'livros', title: 'Livros de Entradas, Saídas e ISS', icon: BookOpen },
          { id: 'calendarioFiscal', title: 'Agenda de Vencimentos (DAS/ISS)', icon: Calendar },
          { id: 'documentStudio', title: 'Declaração de Faturamento A4', icon: FileSpreadsheet }
        ]
      }
    ];
  } else if (moduloAtivo === 'folha') {
    navGroups = [
      {
        id: 'folha_proc',
        title: 'FOLHA SIMPLIFICADA & PRÓ-LABORE',
        items: [
          { id: 'calculoFolha', title: 'Folha Mensal & Pró-Labore', icon: Calculator, badge: 'HOLERITE' },
          { id: 'colaboradores', title: 'Sócios (Pró-Labore) & Empregados', icon: Users, badge: 'CADASTRO' },
          { id: 'rescisao', title: 'Férias & Rescisão (TRCT)', icon: UserMinus },
          { id: 'provisoesFolha', title: 'Provisão de Férias e 13º', icon: Layers },
          { id: 'esocial', title: 'Envio eSocial Simplificado', icon: FileCode, badge: 'eSocial' },
          { id: 'dctfWeb', title: 'DCTFWeb & Guia INSS / FGTS Digital', icon: FileCheck2, badge: 'DARF' }
        ]
      },
      {
        id: 'folha_cad',
        title: 'TABELAS & CONFIGURAÇÃO',
        items: [
          { id: 'rubricas', title: 'Eventos & Tabelas INSS/IRRF', icon: Sliders },
          { id: 'empresas', title: 'Dados do Empregador (Anexo Simples)', icon: Building2 }
        ]
      },
      {
        id: 'relatorios',
        title: 'RECIBOS & TERMOS A4',
        items: [
          { id: 'documentStudio', title: 'Recibos de Pró-Labore e Contratos', icon: FileSpreadsheet }
        ]
      }
    ];
  } else if (moduloAtivo === 'honorarios') {
    navGroups = [
      {
        id: 'honorarios_mov',
        title: 'GESTÃO DO PEQUENO ESCRITÓRIO',
        items: [
          { id: 'contratosHonorarios', title: 'Mensalidades dos Clientes', icon: FileText, badge: 'MENSAL' },
          { id: 'faturamentoHonorarios', title: 'Gerar Cobranças do Mês', icon: Receipt, badge: 'LOTE' },
          { id: 'boletosHonorarios', title: 'Recibos & Cobrança PIX', icon: CreditCard, badge: 'PIX' },
          { id: 'protocolo', title: 'Protocolo de Entrega ao Cliente', icon: FileText }
        ]
      },
      {
        id: 'honorarios_cad',
        title: 'CADASTROS DO ESCRITÓRIO',
        items: [
          { id: 'empresas', title: 'Carteira de Clientes (MEI/Simples)', icon: Building2 },
          { id: 'parametros', title: 'Dados do Contador & Escritório', icon: Sliders }
        ]
      },
      {
        id: 'relatorios',
        title: 'CONTRATOS & DOCUMENTOS',
        items: [
          { id: 'documentStudio', title: 'Contrato de Prestação Contábil A4', icon: FileSpreadsheet }
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
                    const reqPerm = MODULO_PERMISSOES[item.id];
                    const hasPerm = !reqPerm || dbService.temPermissao(reqPerm);

                    return (
                      <button
                        key={item.id}
                        onClick={() => onNavigate(item.id, item.title, Icon)}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs transition group relative ${
                          isActive
                            ? 'bg-white/10 text-white font-medium'
                            : hasPerm
                            ? 'text-neutral-400 hover:bg-white/5 hover:text-neutral-200'
                            : 'text-neutral-500 hover:bg-white/5 hover:text-neutral-300 opacity-70'
                        }`}
                        title={
                          isCollapsed
                            ? `${item.title} ${!hasPerm ? '(Acesso Restrito)' : item.shortcut ? `(${item.shortcut})` : ''}`
                            : !hasPerm
                            ? 'Acesso Restrito ao seu perfil de usuário'
                            : undefined
                        }
                      >
                        <Icon size={16} className={`flex-shrink-0 ${isActive ? 'text-blue-400' : hasPerm ? 'text-neutral-500 group-hover:text-neutral-300' : 'text-neutral-600'}`} />

                        {!isCollapsed && (
                          <>
                            <span className="flex-1 text-left truncate">{item.title}</span>

                            {!hasPerm && (
                              <Lock size={12} className="text-amber-500/80 flex-shrink-0" />
                            )}

                            {hasPerm && item.shortcut && (
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
