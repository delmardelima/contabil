import React, { useState, useEffect } from 'react';
import { dbService } from './db/sqliteService';
import { 
  Empresa, 
  ContaContabil, 
  HistoricoPadrao, 
  LancamentoContabil, 
  DocumentoStudio,
  ModuloSistema,
  CentroCusto
} from './types/contabil';
import { AccountingEngine } from './engine/accountingEngine';

// Layout & Navegação
import { TitleBar } from './components/layout/TitleBar';
import { RibbonBar } from './components/layout/RibbonBar';
import { Sidebar } from './components/layout/Sidebar';
import { StatusBar } from './components/layout/StatusBar';
import { CommandPalette } from './components/command/CommandPalette';
import { ReportPrintPreviewModal } from './components/layout/ReportPrintPreviewModal';

// Módulos Contabilidade
import { DashboardModule } from './components/dashboard/DashboardModule';
import { LancamentosModule } from './components/lancamentos/LancamentosModule';
import { BalanceteModule } from './components/demonstrativos/BalanceteModule';
import { BalancoModule } from './components/demonstrativos/BalancoModule';
import { DREModule } from './components/demonstrativos/DREModule';
import { DLPAModule } from './components/demonstrativos/DLPAModule';
import { DFCModule } from './components/demonstrativos/DFCModule';
import { LivrosOficiaisModule } from './components/livros/LivrosOficiaisModule';
import { DocumentStudioModule } from './components/documentStudio/DocumentStudioModule';
import { PlanoContasModule } from './components/plano/PlanoContasModule';
import { ZeramentoModule } from './components/zeramento/ZeramentoModule';
import { ImportacaoConciliacaoModule } from './components/contabilidade/ImportacaoConciliacaoModule';
import { ExportacaoContabilModule } from './components/contabilidade/ExportacaoContabilModule';

// Módulos Admin & Cadastros
import { EmpresasModule } from './components/admin/EmpresasModule';
import { ParametrosModule } from './components/admin/ParametrosModule';
import { UsuariosModule } from './components/admin/UsuariosModule';
import { RedeBackupModule } from './components/admin/RedeBackupModule';
import { CentrosCustoModule } from './components/cadastros/CentrosCustoModule';
import { LancamentosPadraoModule } from './components/cadastros/LancamentosPadraoModule';
import { EstruturaDREModule } from './components/cadastros/EstruturaDREModule';
import { HistoricosModule } from './components/cadastros/HistoricosModule';
import { LotesModule } from './components/movimentos/LotesModule';
import { AuditoriaContabilModule } from './components/utilitarios/AuditoriaContabilModule';
import { TransporteSaldosModule } from './components/utilitarios/TransporteSaldosModule';
import { AtivoImobilizadoModule } from './components/patrimonio/AtivoImobilizadoModule';
import { CalendarioFiscalModule } from './components/utilitarios/CalendarioFiscalModule';
import { ConsolidacaoModule } from './components/demonstrativos/ConsolidacaoModule';
import { DmplDvaModule } from './components/demonstrativos/DmplDvaModule';
import { BalancoSocialModule } from './components/demonstrativos/BalancoSocialModule';
import { ApuracaoTrimestralModule } from './components/contabilidade/ApuracaoTrimestralModule';
import { LalurLacsModule } from './components/contabilidade/LalurLacsModule';
import { RazaoAuxiliarModule } from './components/contabilidade/RazaoAuxiliarModule';

// Módulos Escrita Fiscal
import { DashboardFiscalModule } from './components/escrita/DashboardFiscalModule';
import { AcumuladoresModule } from './components/escrita/AcumuladoresModule';
import { NotasFiscaisModule } from './components/escrita/NotasFiscaisModule';
import { ApuracaoFiscalModule } from './components/escrita/ApuracaoFiscalModule';
import { ParticipantesModule } from './components/escrita/ParticipantesModule';
import { ProdutosServicosModule } from './components/escrita/ProdutosServicosModule';
import { CartoesModule } from './components/escrita/CartoesModule';
import { RetencoesModule } from './components/escrita/RetencoesModule';
import { DifalModule } from './components/escrita/DifalModule';
import { ReinfXmlModule } from './components/escrita/ReinfXmlModule';
import { NfseModule } from './components/escrita/NfseModule';
import { CiapModule } from './components/patrimonio/CiapModule';
import { InventarioPatrimonioModule } from './components/patrimonio/InventarioPatrimonioModule';
import { LcdprModule } from './components/escrita/LcdprModule';
import { InventarioEstoqueModule } from './components/escrita/InventarioEstoqueModule';
import { PgdasModule } from './components/escrita/PgdasModule';

// Módulos Folha de Pagamento
import { DashboardFolhaModule } from './components/folha/DashboardFolhaModule';
import { ColaboradoresModule } from './components/folha/ColaboradoresModule';
import { RubricasTabelasModule } from './components/folha/RubricasTabelasModule';
import { CalculoFolhaModule } from './components/folha/CalculoFolhaModule';
import { ProvisoesFolhaModule } from './components/folha/ProvisoesFolhaModule';
import { ESocialXmlModule } from './components/folha/ESocialXmlModule';
import { DctfWebModule } from './components/folha/DctfWebModule';
import { RescisaoModule } from './components/folha/RescisaoModule';
import { BeneficiosModule } from './components/folha/BeneficiosModule';

// Módulos Honorários
import { DashboardHonorariosModule } from './components/honorarios/DashboardHonorariosModule';
import { ContratosHonorariosModule } from './components/honorarios/ContratosHonorariosModule';
import { FaturamentoHonorariosModule } from './components/honorarios/FaturamentoHonorariosModule';

import {
  LayoutDashboard,
  BookOpen,
  Scale,
  PieChart,
  FileSpreadsheet,
  FolderTree,
  FileText,
  RefreshCw,
  Building2,
  Sliders,
  Users,
  Network,
  Repeat,
  Layers,
  ShieldAlert,
  ArrowRightLeft,
  X,
  LucideIcon,
  Zap,
  FileCode,
  TrendingUp,
  DollarSign,
  Receipt,
  Calculator,
  CreditCard,
  Package,
  Archive,
  Calendar,
  Share2,
  FileCheck2,
  Boxes,
  UserMinus,
  Heart
} from 'lucide-react';

export interface WorkspaceTab {
  id: string;
  moduleId: string;
  title: string;
  icon: LucideIcon;
  closable: boolean;
}

export const App: React.FC = () => {
  // 1. Módulo Ativo Global (URL param ?modulo=contabilidade|escrita|folha|honorarios)
  const [moduloAtivo, setModuloAtivo] = useState<ModuloSistema>(() => {
    const params = new URLSearchParams(window.location.search);
    const mod = params.get('modulo') as ModuloSistema;
    if (mod && ['contabilidade', 'escrita', 'folha', 'honorarios'].includes(mod)) {
      return mod;
    }
    return 'contabilidade';
  });

  // Estado dos Dados Mestre
  const [empresas, setEmpresas] = useState<Empresa[]>(dbService.getEmpresas());
  const [empresaAtiva, setEmpresaAtiva] = useState<Empresa>(dbService.getActiveEmpresa());
  const [contas, setContas] = useState<ContaContabil[]>(dbService.getContas());
  const [historicos, setHistoricos] = useState<HistoricoPadrao[]>(dbService.getHistoricos());
  const [lancamentos, setLancamentos] = useState<LancamentoContabil[]>(dbService.getLancamentos());
  const [documentos, setDocumentos] = useState<DocumentoStudio[]>(dbService.getDocumentos());
  const [centrosCusto, setCentrosCusto] = useState<CentroCusto[]>(dbService.getCentrosCusto());

  // Gerenciador de Abas Dinâmicas (Multi-Tab Workspace MDI)
  const [tabs, setTabs] = useState<WorkspaceTab[]>([
    { id: 'dashboard', moduleId: 'dashboard', title: 'Dashboard Executivo', icon: LayoutDashboard, closable: false },
    { id: 'lancamentos', moduleId: 'lancamentos', title: 'Lançamentos', icon: BookOpen, closable: true },
    { id: 'balancete', moduleId: 'balancete', title: 'Balancete', icon: Scale, closable: true }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('dashboard');

  // Layout & Modais
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState<boolean>(false);
  const [isDark, setIsDark] = useState<boolean>(true);
  const [razaoSelectedContaId, setRazaoSelectedContaId] = useState<number | undefined>(undefined);

  // Estado Customizado para Impressão de Demonstrativos Especiais
  const [customPrintConfig, setCustomPrintConfig] = useState<{
    tipo?: any;
    titulo: string;
    subtitulo: string;
    linhas?: { descricao: string; valor: number; isTotal?: boolean; isHeader?: boolean }[];
    conteudo?: React.ReactNode;
  } | null>(null);

  // Recalcular totais e diferença DxC em tempo real
  const trialBalance = AccountingEngine.generateTrialBalance(contas, lancamentos, 5, false, false);
  const totalDebitos = trialBalance.totalDebitos;
  const totalCreditos = trialBalance.totalCreditos;
  const diferencaDxC = Math.abs(totalDebitos - totalCreditos);

  // Alternador de Módulo Global
  const handleSelectModulo = (novoModulo: ModuloSistema) => {
    setModuloAtivo(novoModulo);
    // Atualiza query param na URL sem reload
    const url = new URL(window.location.href);
    url.searchParams.set('modulo', novoModulo);
    window.history.replaceState({}, '', url.toString());

    // Abre a tela principal daquele departamento
    if (novoModulo === 'contabilidade') {
      handleOpenModule('dashboard', 'Dashboard Executivo', LayoutDashboard);
    } else if (novoModulo === 'escrita') {
      handleOpenModule('dashboardFiscal', 'Dashboard Fiscal', Receipt);
    } else if (novoModulo === 'folha') {
      handleOpenModule('dashboardFolha', 'Dashboard da Folha', Users);
    } else if (novoModulo === 'honorarios') {
      handleOpenModule('dashboardHonorarios', 'Dashboard Financeiro', DollarSign);
    }
  };

  // Mapeamento de Ícones e Títulos
  const getModuleMeta = (moduleId: string): { title: string; icon: LucideIcon } => {
    switch (moduleId) {
      case 'dashboard': return { title: 'Dashboard Executivo', icon: LayoutDashboard };
      case 'lancamentos': return { title: 'Lançamentos Contábeis', icon: BookOpen };
      case 'importacaoConciliacao': return { title: 'Importação OFX & Conciliação', icon: Zap };
      case 'exportacaoContabil': return { title: 'Exportação SPED ECD', icon: FileCode };
      case 'balancete': return { title: 'Balancete de Verificação', icon: Scale };
      case 'balanco': return { title: 'Balanço Patrimonial', icon: Scale };
      case 'dre': return { title: 'Demonstração do Resultado', icon: PieChart };
      case 'dlpa': return { title: 'Mutação PL / DLPA', icon: TrendingUp };
      case 'dfc': return { title: 'Fluxo de Caixa (DFC)', icon: DollarSign };
      case 'livros': return { title: 'Diário & Razão', icon: BookOpen };
      case 'documentStudio': return { title: 'Document Studio A4', icon: FileSpreadsheet };
      case 'planoContas': return { title: 'Plano de Contas', icon: FolderTree };
      case 'zeramento': return { title: 'Zeramento (ARE)', icon: RefreshCw };
      case 'empresas': return { title: 'Empresas & Filiais', icon: Building2 };
      case 'parametros': return { title: 'Parâmetros Contábeis', icon: Sliders };
      case 'usuarios': return { title: 'Usuários & Auditoria', icon: Users };
      case 'redeBackup': return { title: 'Rede Local & Backup', icon: Network };
      case 'centrosCusto': return { title: 'Centros de Custo', icon: PieChart };
      case 'lancamentosPadrao': return { title: 'Lançamentos Padrão', icon: Repeat };
      case 'estruturaDRE': return { title: 'Estrutura da DRE', icon: Layers };
      case 'historicos': return { title: 'Históricos Padrão', icon: FileText };
      case 'lotes': return { title: 'Gestão de Lotes', icon: Layers };
      case 'auditoria': return { title: 'Auditoria de Saldos', icon: ShieldAlert };
      case 'transporteSaldos': return { title: 'Transporte de Saldos', icon: ArrowRightLeft };
      case 'ativoImobilizado': return { title: 'Ativo Imobilizado & Depreciação', icon: Archive };
      case 'inventarioPatrimonial': return { title: 'Inventário & Baixas CPC 27', icon: Archive };
      case 'apuracaoTrimestral': return { title: 'Apuração IRPJ & CSLL (Trimestral)', icon: Calculator };
      case 'lalur': return { title: 'LALUR / LACS (Lucro Real)', icon: BookOpen };
      case 'consolidacao': return { title: 'Consolidação Matriz & Filiais (CPC 36)', icon: Share2 };
      case 'dmplDva': return { title: 'DMPL & DVA (CPC 26/09)', icon: Share2 };
      case 'balancoSocial': return { title: 'Balanço Social (IBASE / ESG)', icon: Heart };
      case 'razaoAuxiliar': return { title: 'Razão Auxiliar (Clientes/Forn)', icon: FileSpreadsheet };

      // Escrita Fiscal
      case 'dashboardFiscal': return { title: 'Dashboard Fiscal', icon: Receipt };
      case 'notasFiscais': return { title: 'Notas Fiscais & XML', icon: FileText };
      case 'nfse': return { title: 'NFS-e Nacional / DPS', icon: Receipt };
      case 'pgdas': return { title: 'PGDAS-D & Simples Nacional', icon: Calculator };
      case 'ciap': return { title: 'CIAP Bloco G (Ativo Permanente)', icon: Layers };
      case 'lcdpr': return { title: 'Livro Caixa Rural (LCDPR)', icon: BookOpen };
      case 'inventarioEstoque': return { title: 'Livro Registro de Inventário Modelo 7 (SPED Bloco H)', icon: Boxes };
      case 'cartoes': return { title: 'Vendas Cartões & Operadoras (1600)', icon: CreditCard };
      case 'retencoes': return { title: 'Retenções na Fonte & DARF', icon: Receipt };
      case 'reinf': return { title: 'EFD-Reinf em XML (v2.01)', icon: FileCode };
      case 'difal': return { title: 'DIFAL & DeSTDA (GNRE)', icon: Scale };
      case 'participantes': return { title: 'Participantes SPED', icon: Users };
      case 'produtos': return { title: 'Itens & Produtos', icon: Package };
      case 'acumuladores': return { title: 'Acumuladores Fiscais', icon: Layers };
      case 'apuracaoFiscal': return { title: 'Apuração DAS & Guias', icon: Calculator };
      case 'calendarioFiscal': return { title: 'Calendário Fiscal & Obrigações', icon: Calendar };

      // Folha
      case 'dashboardFolha': return { title: 'Dashboard da Folha', icon: Users };
      case 'calculoFolha': return { title: 'Cálculo da Folha & Holerite', icon: Calculator };
      case 'beneficios': return { title: 'Gestão de Benefícios (VT/VR)', icon: CreditCard };
      case 'esocial': return { title: 'Central eSocial XML (S-1200/1210)', icon: FileCode };
      case 'dctfWeb': return { title: 'DCTFWeb & DARF Previdenciário', icon: FileCheck2 };
      case 'provisoesFolha': return { title: 'Provisões Mensais (Férias/13º)', icon: Layers };
      case 'rescisao': return { title: 'Rescisão Contratual & TRCT Oficial', icon: UserMinus };
      case 'colaboradores': return { title: 'Colaboradores & Sócios', icon: Users };
      case 'rubricas': return { title: 'Rubricas & Tabelas', icon: Sliders };

      // Honorários
      case 'dashboardHonorarios': return { title: 'Dashboard Financeiro', icon: DollarSign };
      case 'contratosHonorarios': return { title: 'Contratos de Honorários', icon: FileText };
      case 'faturamentoHonorarios': return { title: 'Faturamento & Baixas', icon: Receipt };

      default: return { title: moduleId, icon: FileText };
    }
  };

  // Gerenciador de Abertura de Abas
  const handleOpenModule = (moduleId: string, title?: string, icon?: LucideIcon) => {
    const meta = getModuleMeta(moduleId);
    const resolvedTitle = title || meta.title;
    const resolvedIcon = icon || meta.icon;

    const existing = tabs.find(t => t.moduleId === moduleId);
    if (existing) {
      setActiveTabId(existing.id);
      return;
    }

    const newTab: WorkspaceTab = {
      id: moduleId,
      moduleId,
      title: resolvedTitle,
      icon: resolvedIcon,
      closable: true
    };

    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  const handleCloseTab = (tabId: string) => {
    const tabIndex = tabs.findIndex(t => t.id === tabId);
    if (tabIndex === -1) return;
    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);

    if (activeTabId === tabId) {
      const nextActive = newTabs[Math.max(0, tabIndex - 1)];
      if (nextActive) {
        setActiveTabId(nextActive.id);
      }
    }
  };

  // Atalhos Globais de Teclado
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      // Ctrl+K -> Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
      // Ctrl+W -> Fechar Aba Ativa
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        const current = tabs.find(t => t.id === activeTabId);
        if (current && current.closable) {
          handleCloseTab(current.id);
        }
      }
      // F2 -> Abrir Lançamentos
      if (e.key === 'F2') {
        e.preventDefault();
        handleOpenModule('lancamentos');
      }
      // F4 -> Abrir Balancete
      if (e.key === 'F4') {
        e.preventDefault();
        handleOpenModule('balancete');
      }
      // F3 -> Abrir Plano de Contas
      if (e.key === 'F3') {
        e.preventDefault();
        handleOpenModule('planoContas');
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [tabs, activeTabId]);

  // Sincronização e Handlers de Dados
  const handleSelectEmpresa = (id: number) => {
    dbService.setActiveEmpresa(id);
    const emp = dbService.getActiveEmpresa();
    setEmpresaAtiva(emp);
    setContas(dbService.getContas(id));
    setHistoricos(dbService.getHistoricos(id));
    setLancamentos(dbService.getLancamentos(id));
    setDocumentos(dbService.getDocumentos(id));
    setCentrosCusto(dbService.getCentrosCusto(id));
  };

  const handleAddLancamento = (l: Omit<LancamentoContabil, 'id' | 'createdAt'>) => {
    dbService.addLancamento(l);
    setLancamentos(dbService.getLancamentos(empresaAtiva.id));
  };

  const handleEditLancamento = (l: LancamentoContabil) => {
    dbService.updateLancamento(l);
    setLancamentos(dbService.getLancamentos(empresaAtiva.id));
  };

  const handleEstornoLancamento = (id: number) => {
    dbService.estornarLancamento(id);
    setLancamentos(dbService.getLancamentos(empresaAtiva.id));
  };

  const handleDeleteLancamento = (id: number) => {
    dbService.deleteLancamento(id);
    setLancamentos(dbService.getLancamentos(empresaAtiva.id));
  };

  const handleDuplicateLancamento = (l: LancamentoContabil) => {
    handleAddLancamento({
      empresaId: l.empresaId,
      numeroPartida: lancamentos.length + 1,
      loteId: l.loteId,
      dataLancamento: l.dataLancamento,
      tipoPartida: l.tipoPartida,
      contaDebitoId: l.contaDebitoId,
      contaCreditoId: l.contaCreditoId,
      valor: l.valor,
      centroCustoId: l.centroCustoId,
      rateios: l.rateios ? JSON.parse(JSON.stringify(l.rateios)) : undefined,
      historicoId: l.historicoId,
      complementoHistorico: `${l.complementoHistorico} (Cópia)`
    });
  };

  const handleSaveConta = (conta: ContaContabil) => {
    dbService.saveConta(conta);
    setContas(dbService.getContas(empresaAtiva.id));
  };

  const handleDeleteConta = (id: number) => {
    const res = dbService.deleteConta(id);
    if (!res.success) {
      alert(res.message || 'Erro ao excluir conta.');
      return;
    }
    setContas(dbService.getContas(empresaAtiva.id));
  };

  const handleSaveDocumento = (doc: DocumentoStudio) => {
    dbService.saveDocumento(doc);
    setDocumentos(dbService.getDocumentos(empresaAtiva.id));
  };

  const handleExecutarZeramento = (novos: Omit<LancamentoContabil, 'id' | 'createdAt'>[]) => {
    for (const n of novos) {
      dbService.addLancamento(n);
    }
    setLancamentos(dbService.getLancamentos(empresaAtiva.id));
    handleOpenModule('balancete');
  };

  const handleOpenRazaoConta = (contaId: number) => {
    setRazaoSelectedContaId(contaId);
    handleOpenModule('livros');
  };

  // Disparador de Relatório A4 Customizado
  const handleOpenCustomPrintPreview = (config: {
    tipo?: any;
    titulo: string;
    subtitulo: string;
    linhas?: { descricao: string; valor: number; isTotal?: boolean; isHeader?: boolean }[];
    conteudo?: React.ReactNode;
  }) => {
    setCustomPrintConfig(config);
    setIsPrintPreviewOpen(true);
  };

  // Identifica o módulo ativo atual
  const currentTab = tabs.find(t => t.id === activeTabId);
  const activeModuleId = currentTab?.moduleId || 'dashboard';

  // Renderizador do Conteúdo do Print Preview Modal
  const renderPrintPreviewContent = () => {
    if (customPrintConfig) {
      if (customPrintConfig.conteudo) {
        return customPrintConfig.conteudo;
      }
      if (customPrintConfig.linhas) {
        return (
          <div className="space-y-4">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="border-b-2 border-neutral-900 font-bold uppercase text-[10px]">
                  <th className="py-2 px-3">Item / Discriminação do Evento</th>
                  <th className="py-2 px-3 text-right w-40">Valor (R$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {customPrintConfig.linhas.map((l, idx) => (
                  <tr 
                    key={idx} 
                    className={l.isTotal ? 'font-bold bg-neutral-100 border-t-2 border-neutral-900' : l.isHeader ? 'font-bold text-neutral-800 bg-neutral-50' : ''}
                  >
                    <td className="py-1.5 px-3">{l.descricao}</td>
                    <td className={`py-1.5 px-3 text-right font-mono ${l.valor < 0 ? 'text-rose-600' : ''}`}>
                      {l.isHeader && l.valor === 0 ? '' : l.valor < 0 ? `(${Math.abs(l.valor).toFixed(2)})` : l.valor.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
    }

    if (activeModuleId === 'balancete') {
      return (
        <div className="space-y-4">
          <table className="w-full text-left text-[10px] border-collapse">
            <thead>
              <tr className="border-b-2 border-neutral-900 font-bold uppercase text-[9px]">
                <th className="py-1 px-1">Classificação</th>
                <th className="py-1 px-1 text-center">Red.</th>
                <th className="py-1 px-2">Descrição da Conta</th>
                <th className="py-1 px-2 text-right">Saldo Anterior</th>
                <th className="py-1 px-2 text-right">Débitos</th>
                <th className="py-1 px-2 text-right">Créditos</th>
                <th className="py-1 px-2 text-right">Saldo Atual</th>
                <th className="py-1 px-1 text-center">D/C</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {trialBalance.items.map(item => (
                <tr key={item.id} className={item.tipo === 'S' ? 'font-bold bg-neutral-50' : ''}>
                  <td className="py-1 px-1 font-mono">{item.classificacao}</td>
                  <td className="py-1 px-1 font-mono text-center">{item.codigoReduzido}</td>
                  <td className="py-1 px-2" style={{ paddingLeft: `${item.grau * 6}px` }}>{item.nome}</td>
                  <td className="py-1 px-2 font-mono text-right">{item.saldoAnterior.toFixed(2)}</td>
                  <td className="py-1 px-2 font-mono text-right">{item.debitos.toFixed(2)}</td>
                  <td className="py-1 px-2 font-mono text-right">{item.creditos.toFixed(2)}</td>
                  <td className="py-1 px-2 font-mono text-right">{item.saldoAtual.toFixed(2)}</td>
                  <td className="py-1 px-1 font-mono text-center font-bold">{item.saldoAtualNatureza}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-neutral-900 font-bold font-mono text-[10px]">
                <td colSpan={4} className="py-2 px-1 text-right">TOTAIS DO BALANCETE:</td>
                <td className="py-2 px-2 text-right">R$ {totalDebitos.toFixed(2)}</td>
                <td className="py-2 px-2 text-right">R$ {totalCreditos.toFixed(2)}</td>
                <td colSpan={2} className="py-2 px-2 text-right">
                  Diferença: R$ {diferencaDxC.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      );
    }

    if (activeModuleId === 'balanco') {
      const bs = AccountingEngine.generateBalanceSheet(contas, lancamentos);
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold border-b-2 border-neutral-900 pb-1 uppercase text-xs">Ativo Total</h3>
              <table className="w-full text-[10px] mt-2">
                <tbody>
                  {bs.ativo.map(item => (
                    <tr key={item.classificacao} className={item.tipo === 'S' ? 'font-bold' : ''}>
                      <td className="py-0.5 font-mono w-24">{item.classificacao}</td>
                      <td className="py-0.5">{item.nome}</td>
                      <td className="py-0.5 font-mono text-right">R$ {item.saldo.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-neutral-900 font-bold font-mono">
                    <td colSpan={2} className="py-1.5 uppercase">TOTAL DO ATIVO:</td>
                    <td className="py-1.5 text-right">R$ {bs.totalAtivo.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div>
              <h3 className="font-bold border-b-2 border-neutral-900 pb-1 uppercase text-xs">Passivo & Patrimônio Líquido</h3>
              <table className="w-full text-[10px] mt-2">
                <tbody>
                  {bs.passivo.map(item => (
                    <tr key={item.classificacao} className={item.tipo === 'S' ? 'font-bold' : ''}>
                      <td className="py-0.5 font-mono w-24">{item.classificacao}</td>
                      <td className="py-0.5">{item.nome}</td>
                      <td className="py-0.5 font-mono text-right">R$ {item.saldo.toFixed(2)}</td>
                    </tr>
                  ))}
                  {bs.patrimonioLiquido.map(item => (
                    <tr key={item.classificacao} className={item.tipo === 'S' ? 'font-bold' : ''}>
                      <td className="py-0.5 font-mono w-24">{item.classificacao}</td>
                      <td className="py-0.5">{item.nome}</td>
                      <td className="py-0.5 font-mono text-right">R$ {item.saldo.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-neutral-900 font-bold font-mono">
                    <td colSpan={2} className="py-1.5 uppercase">TOTAL PASSIVO + PL:</td>
                    <td className="py-1.5 text-right">R$ {(bs.totalPassivo + bs.totalPL).toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      );
    }

    if (activeModuleId === 'dre') {
      const dre = AccountingEngine.generateIncomeStatement(contas, lancamentos);
      return (
        <div className="space-y-4">
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="border-b-2 border-neutral-900 font-bold uppercase text-[10px]">
                <th className="py-1.5 px-2">Linha</th>
                <th className="py-1.5 px-2">Demonstração das Contas de Resultado</th>
                <th className="py-1.5 px-4 text-right">Valor Período (R$)</th>
                <th className="py-1.5 px-4 text-right">Análise Vertical (% AV)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {dre.items.map(i => (
                <tr key={i.id ?? i.ordem} className={i.tipoLinha !== 'CONTA' ? 'font-bold bg-neutral-50' : ''}>
                  <td className="py-1.5 px-2 font-mono text-neutral-500">{i.ordem}</td>
                  <td className="py-1.5 px-2 uppercase">{i.descricao}</td>
                  <td className="py-1.5 px-4 font-mono text-right">
                    {i.operacao === 'SUBTRAI' ? `(${i.valor.toFixed(2)})` : i.valor.toFixed(2)}
                  </td>
                  <td className="py-1.5 px-4 font-mono text-right font-semibold">
                    {(i.analiseVerticalPerc ?? 0).toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // Default Fallback
    return (
      <div className="space-y-4">
        <h3 className="font-bold text-sm uppercase border-b pb-2">Relação de Partidas da Escrituração Contábil</h3>
        <table className="w-full text-[10px] border-collapse">
          <thead>
            <tr className="border-b-2 border-neutral-900 font-bold uppercase">
              <th className="py-1 px-1">Nº</th>
              <th className="py-1 px-2">Data</th>
              <th className="py-1 px-2">Conta Débito</th>
              <th className="py-1 px-2">Conta Crédito</th>
              <th className="py-1 px-3">Histórico / Complemento</th>
              <th className="py-1 px-2 text-right">Valor (R$)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {lancamentos.slice(0, 30).map(l => (
              <tr key={l.id}>
                <td className="py-1 px-1 font-mono font-bold">#{l.numeroPartida}</td>
                <td className="py-1 px-2 font-mono">{l.dataLancamento}</td>
                <td className="py-1 px-2 font-mono">{contas.find(c => c.id === l.contaDebitoId)?.codigoReduzido || '-'}</td>
                <td className="py-1 px-2 font-mono">{contas.find(c => c.id === l.contaCreditoId)?.codigoReduzido || '-'}</td>
                <td className="py-1 px-3">{l.complementoHistorico}</td>
                <td className="py-1 px-2 font-mono text-right">R$ {l.valor.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden ${isDark ? 'dark bg-[#141414]' : 'bg-[#f8f9fa] text-neutral-900'}`}>
      {/* 1. Custom TitleBar Windows 11 com Seletor Global de 4 Módulos */}
      <TitleBar
        empresa={empresaAtiva}
        empresas={empresas}
        onSelectEmpresa={handleSelectEmpresa}
        diferencaDxC={diferencaDxC}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        moduloAtivo={moduloAtivo}
        onSelectModulo={handleSelectModulo}
      />

      {/* 2. RibbonBar Adaptável por Módulo */}
      <RibbonBar
        activeModuleId={activeModuleId}
        onNavigate={handleOpenModule}
        onNewLancamento={() => handleOpenModule('lancamentos')}
        onPrintPreview={() => {
          setCustomPrintConfig(null);
          setIsPrintPreviewOpen(true);
        }}
        moduloAtivo={moduloAtivo}
      />

      {/* 3. Área Principal: Sidebar Dinâmica + Multi-Tab Workspace MDI */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeModuleId={activeModuleId}
          onNavigate={handleOpenModule}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          moduloAtivo={moduloAtivo}
        />

        <div className="flex-1 flex flex-col overflow-hidden bg-[#141414]">
          {/* Barra de Abas MDI */}
          <div className="h-9 bg-[#181818] border-b border-white/10 flex items-center px-2 space-x-1 select-none overflow-x-auto custom-scrollbar flex-shrink-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.id === activeTabId;

              return (
                <div
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  className={`group flex items-center space-x-2 px-3 py-1.5 rounded-t-lg text-xs font-medium cursor-pointer transition-all border-t border-x ${
                    isActive
                      ? 'bg-[#141414] text-neutral-100 border-white/10 border-b-transparent shadow-sm'
                      : 'bg-[#1c1c1c] text-neutral-400 border-transparent hover:bg-neutral-800 hover:text-neutral-200'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-blue-400' : 'text-neutral-500'} />
                  <span className="truncate max-w-[140px]">{tab.title}</span>

                  {tab.closable && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCloseTab(tab.id);
                      }}
                      className="p-0.5 rounded hover:bg-white/10 text-neutral-400 hover:text-white transition opacity-60 group-hover:opacity-100"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Conteúdo Dinâmico com Preservação de Estado */}
          <main className="flex-1 overflow-hidden relative">
            {/* Dashboard Executivo */}
            <div className={`h-full w-full ${activeTabId === 'dashboard' ? 'block' : 'hidden'}`}>
              <DashboardModule
                empresa={empresaAtiva}
                lancamentos={lancamentos}
                contas={contas}
                onNavigate={handleOpenModule}
              />
            </div>

            {/* Lançamentos Contábeis */}
            <div className={`h-full w-full ${activeTabId === 'lancamentos' ? 'block' : 'hidden'}`}>
              <LancamentosModule
                contas={contas}
                historicos={historicos}
                lancamentos={lancamentos}
                empresaId={empresaAtiva.id}
                onAddLancamento={handleAddLancamento}
                onDeleteLancamento={handleDeleteLancamento}
                onDuplicateLancamento={handleDuplicateLancamento}
                onEditLancamento={handleEditLancamento}
                onEstornoLancamento={handleEstornoLancamento}
              />
            </div>

            {/* Importação OFX & Conciliação Bancária */}
            <div className={`h-full w-full ${activeTabId === 'importacaoConciliacao' ? 'block' : 'hidden'}`}>
              <ImportacaoConciliacaoModule
                empresaId={empresaAtiva.id}
                contas={contas}
                historicos={historicos}
                onLoteGerado={() => {
                  setLancamentos(dbService.getLancamentos(empresaAtiva.id));
                  handleOpenModule('lancamentos');
                }}
              />
            </div>

            {/* Exportação SPED ECD */}
            <div className={`h-full w-full ${activeTabId === 'exportacaoContabil' ? 'block' : 'hidden'}`}>
              <ExportacaoContabilModule
                empresa={empresaAtiva}
                contas={contas}
                lancamentos={lancamentos}
                onOpenReportPreview={(tipo) => handleOpenModule(tipo.toLowerCase())}
              />
            </div>

            {/* Balancete de Verificação */}
            <div className={`h-full w-full ${activeTabId === 'balancete' ? 'block' : 'hidden'}`}>
              <BalanceteModule
                contas={contas}
                lancamentos={lancamentos}
                onOpenRazaoConta={handleOpenRazaoConta}
              />
            </div>

            {/* Balanço Patrimonial */}
            <div className={`h-full w-full ${activeTabId === 'balanco' ? 'block' : 'hidden'}`}>
              <BalancoModule
                contas={contas}
                lancamentos={lancamentos}
              />
            </div>

            {/* DRE */}
            <div className={`h-full w-full ${activeTabId === 'dre' ? 'block' : 'hidden'}`}>
              <DREModule
                contas={contas}
                lancamentos={lancamentos}
              />
            </div>

            {/* DLPA */}
            <div className={`h-full w-full ${activeTabId === 'dlpa' ? 'block' : 'hidden'}`}>
              <DLPAModule
                empresa={empresaAtiva}
                onOpenReportPreview={handleOpenCustomPrintPreview}
              />
            </div>

            {/* DFC */}
            <div className={`h-full w-full ${activeTabId === 'dfc' ? 'block' : 'hidden'}`}>
              <DFCModule
                empresa={empresaAtiva}
                onOpenReportPreview={handleOpenCustomPrintPreview}
              />
            </div>

            {/* Livros Oficiais */}
            <div className={`h-full w-full ${activeTabId === 'livros' ? 'block' : 'hidden'}`}>
              <LivrosOficiaisModule
                empresa={empresaAtiva}
                contas={contas}
                lancamentos={lancamentos}
                initialContaId={razaoSelectedContaId}
              />
            </div>

            {/* Document Studio A4 */}
            <div className={`h-full w-full ${activeTabId === 'documentStudio' ? 'block' : 'hidden'}`}>
              <DocumentStudioModule
                empresa={empresaAtiva}
                contas={contas}
                lancamentos={lancamentos}
                documentos={documentos}
                onSaveDocumento={handleSaveDocumento}
              />
            </div>

            {/* Plano de Contas */}
            <div className={`h-full w-full ${activeTabId === 'planoContas' ? 'block' : 'hidden'}`}>
              <PlanoContasModule
                contas={contas}
                empresaId={empresaAtiva.id}
                mascaraPlano={empresaAtiva.mascaraPlano}
                onSaveConta={handleSaveConta}
                onDeleteConta={handleDeleteConta}
              />
            </div>

            {/* Zeramento de Exercício */}
            <div className={`h-full w-full ${activeTabId === 'zeramento' ? 'block' : 'hidden'}`}>
              <ZeramentoModule
                empresaId={empresaAtiva.id}
                empresa={empresaAtiva}
                contas={contas}
                lancamentos={lancamentos}
                historicos={historicos}
                onExecutarZeramento={handleExecutarZeramento}
                onOpenReportPreview={handleOpenCustomPrintPreview}
              />
            </div>

            {/* Calendário Fiscal & Obrigações Legais */}
            <div className={`h-full w-full ${activeTabId === 'calendarioFiscal' ? 'block' : 'hidden'}`}>
              <CalendarioFiscalModule empresa={empresaAtiva} />
            </div>

            {/* Empresas */}
            <div className={`h-full w-full ${activeTabId === 'empresas' ? 'block' : 'hidden'}`}>
              <EmpresasModule
                empresaAtiva={empresaAtiva}
                onSelectEmpresa={handleSelectEmpresa}
              />
            </div>

            {/* Parâmetros Contábeis */}
            <div className={`h-full w-full ${activeTabId === 'parametros' ? 'block' : 'hidden'}`}>
              <ParametrosModule
                empresa={empresaAtiva}
                contas={contas}
              />
            </div>

            {/* Usuários */}
            <div className={`h-full w-full ${activeTabId === 'usuarios' ? 'block' : 'hidden'}`}>
              <UsuariosModule />
            </div>

            {/* Rede & Backup */}
            <div className={`h-full w-full ${activeTabId === 'redeBackup' ? 'block' : 'hidden'}`}>
              <RedeBackupModule />
            </div>

            {/* Centros de Custo */}
            <div className={`h-full w-full ${activeTabId === 'centrosCusto' ? 'block' : 'hidden'}`}>
              <CentrosCustoModule empresa={empresaAtiva} />
            </div>

            {/* Lançamentos Padrão */}
            <div className={`h-full w-full ${activeTabId === 'lancamentosPadrao' ? 'block' : 'hidden'}`}>
              <LancamentosPadraoModule
                empresa={empresaAtiva}
                contas={contas}
                historicos={historicos}
              />
            </div>

            {/* Estrutura DRE */}
            <div className={`h-full w-full ${activeTabId === 'estruturaDRE' ? 'block' : 'hidden'}`}>
              <EstruturaDREModule empresa={empresaAtiva} />
            </div>

            {/* Históricos */}
            <div className={`h-full w-full ${activeTabId === 'historicos' ? 'block' : 'hidden'}`}>
              <HistoricosModule empresa={empresaAtiva} />
            </div>

            {/* Lotes */}
            <div className={`h-full w-full ${activeTabId === 'lotes' ? 'block' : 'hidden'}`}>
              <LotesModule
                empresa={empresaAtiva}
                lancamentos={lancamentos}
              />
            </div>

            {/* Auditoria Contábil */}
            <div className={`h-full w-full ${activeTabId === 'auditoria' ? 'block' : 'hidden'}`}>
              <AuditoriaContabilModule
                empresa={empresaAtiva}
                contas={contas}
                lancamentos={lancamentos}
                onRefreshData={() => {
                  setContas(dbService.getContas(empresaAtiva.id));
                  setLancamentos(dbService.getLancamentos(empresaAtiva.id));
                }}
              />
            </div>

            {/* Transporte de Saldos */}
            <div className={`h-full w-full ${activeTabId === 'transporteSaldos' ? 'block' : 'hidden'}`}>
              <TransporteSaldosModule
                empresa={empresaAtiva}
                contas={contas}
                lancamentos={lancamentos}
                onTransporteConcluido={() => {
                  setEmpresas(dbService.getEmpresas());
                  setContas(dbService.getContas(empresaAtiva.id));
                  setEmpresaAtiva(dbService.getActiveEmpresa());
                }}
              />
            </div>

            {/* Ativo Imobilizado & Depreciação */}
            <div className={`h-full w-full ${activeTabId === 'ativoImobilizado' ? 'block' : 'hidden'}`}>
              <AtivoImobilizadoModule
                empresa={empresaAtiva}
                contas={contas}
                onIntegracaoSucesso={() => {
                  setLancamentos(dbService.getLancamentos(empresaAtiva.id));
                }}
                onOpenReportPreview={handleOpenCustomPrintPreview}
              />
            </div>

            {/* Inventário Patrimonial & Baixas CPC 27 */}
            <div className={`h-full w-full ${activeTabId === 'inventarioPatrimonial' ? 'block' : 'hidden'}`}>
              <InventarioPatrimonioModule />
            </div>

            {/* Consolidação Contábil (CPC 36 / Matriz & Filiais) */}
            <div className={`h-full w-full ${activeTabId === 'consolidacao' ? 'block' : 'hidden'}`}>
              <ConsolidacaoModule
                empresa={empresaAtiva}
                onOpenReportPreview={handleOpenCustomPrintPreview}
              />
            </div>

            {/* Demonstração das Mutações do Patrimônio Líquido (DMPL CPC 26) & Demonstração do Valor Adicionado (DVA CPC 09) */}
            <div className={`h-full w-full ${activeTabId === 'dmplDva' ? 'block' : 'hidden'}`}>
              <DmplDvaModule />
            </div>

            {/* Balanço Social Modelo IBASE & Sustentabilidade ESG (NBC T 15 / CFC) */}
            <div className={`h-full w-full ${activeTabId === 'balancoSocial' ? 'block' : 'hidden'}`}>
              <BalancoSocialModule />
            </div>

            {/* Apuração Trimestral IRPJ & CSLL (Lucro Presumido) */}
            <div className={`h-full w-full ${activeTabId === 'apuracaoTrimestral' ? 'block' : 'hidden'}`}>
              <ApuracaoTrimestralModule
                empresa={empresaAtiva}
                onOpenReportPreview={handleOpenCustomPrintPreview}
                onIntegracaoSucesso={() => {
                  setLancamentos(dbService.getLancamentos(empresaAtiva.id));
                }}
              />
            </div>

            {/* Livro Eletrônico LALUR & LACS (Lucro Real / Bloco M SPED ECF) */}
            <div className={`h-full w-full ${activeTabId === 'lalur' ? 'block' : 'hidden'}`}>
              <LalurLacsModule />
            </div>

            {/* Razão Auxiliar & Conciliação de Clientes e Fornecedores */}
            <div className={`h-full w-full ${activeTabId === 'razaoAuxiliar' ? 'block' : 'hidden'}`}>
              <RazaoAuxiliarModule />
            </div>

            {/* ESCRITA FISCAL */}
            <div className={`h-full w-full ${activeTabId === 'dashboardFiscal' ? 'block' : 'hidden'}`}>
              <DashboardFiscalModule
                empresa={empresaAtiva}
                onNavigate={handleOpenModule}
              />
            </div>

            <div className={`h-full w-full ${activeTabId === 'acumuladores' ? 'block' : 'hidden'}`}>
              <AcumuladoresModule
                empresaId={empresaAtiva.id}
                contas={contas}
                historicos={historicos}
              />
            </div>

            <div className={`h-full w-full ${activeTabId === 'notasFiscais' ? 'block' : 'hidden'}`}>
              <NotasFiscaisModule empresa={empresaAtiva} />
            </div>

            {/* Vendas Cartões & Operadoras (SPED 1600) */}
            <div className={`h-full w-full ${activeTabId === 'cartoes' ? 'block' : 'hidden'}`}>
              <CartoesModule
                empresa={empresaAtiva}
                contas={contas}
                onOpenReportPreview={handleOpenCustomPrintPreview}
                onIntegracaoSucesso={() => {
                  setLancamentos(dbService.getLancamentos(empresaAtiva.id));
                }}
              />
            </div>

            {/* Central de Retenções na Fonte (DIRF / EFD-Reinf / DCTFWeb) */}
            <div className={`h-full w-full ${activeTabId === 'retencoes' ? 'block' : 'hidden'}`}>
              <RetencoesModule
                empresa={empresaAtiva}
                onOpenReportPreview={handleOpenCustomPrintPreview}
                onIntegracaoSucesso={() => {
                  setLancamentos(dbService.getLancamentos(empresaAtiva.id));
                }}
              />
            </div>

            {/* Apuração do DIFAL & DeSTDA (GNRE) */}
            <div className={`h-full w-full ${activeTabId === 'difal' ? 'block' : 'hidden'}`}>
              <DifalModule
                empresa={empresaAtiva}
                onOpenReportPreview={handleOpenCustomPrintPreview}
                onIntegracaoSucesso={() => {
                  setLancamentos(dbService.getLancamentos(empresaAtiva.id));
                }}
              />
            </div>

            {/* NFS-e Nacional / DPS & Faturamento de Serviços */}
            <div className={`h-full w-full ${activeTabId === 'nfse' ? 'block' : 'hidden'}`}>
              <NfseModule />
            </div>

            {/* Controle de Crédito de ICMS do Ativo Permanente (CIAP Bloco G) */}
            <div className={`h-full w-full ${activeTabId === 'ciap' ? 'block' : 'hidden'}`}>
              <CiapModule />
            </div>

            {/* Livro Caixa Digital do Produtor Rural (LCDPR) */}
            <div className={`h-full w-full ${activeTabId === 'lcdpr' ? 'block' : 'hidden'}`}>
              <LcdprModule />
            </div>

            {/* Livro Registro de Inventário Modelo 7 & EFD-ICMS/IPI Bloco H */}
            <div className={`h-full w-full ${activeTabId === 'inventarioEstoque' ? 'block' : 'hidden'}`}>
              <InventarioEstoqueModule />
            </div>

            {/* Apuração PGDAS-D & Simples Nacional Avançado (LC 123/2006) */}
            <div className={`h-full w-full ${activeTabId === 'pgdas' ? 'block' : 'hidden'}`}>
              <PgdasModule />
            </div>

            {/* Central EFD-Reinf em XML (v2.01.02) */}
            <div className={`h-full w-full ${activeTabId === 'reinf' ? 'block' : 'hidden'}`}>
              <ReinfXmlModule />
            </div>

            <div className={`h-full w-full ${activeTabId === 'participantes' ? 'block' : 'hidden'}`}>
              <ParticipantesModule empresaAtiva={empresaAtiva} />
            </div>

            <div className={`h-full w-full ${activeTabId === 'produtos' ? 'block' : 'hidden'}`}>
              <ProdutosServicosModule empresaAtiva={empresaAtiva} />
            </div>

            <div className={`h-full w-full ${activeTabId === 'apuracaoFiscal' ? 'block' : 'hidden'}`}>
              <ApuracaoFiscalModule
                empresa={empresaAtiva}
                onOpenReportPreview={handleOpenCustomPrintPreview}
                onIntegracaoSucesso={() => {
                  setLancamentos(dbService.getLancamentos(empresaAtiva.id));
                }}
              />
            </div>

            {/* FOLHA DE PAGAMENTO */}
            <div className={`h-full w-full ${activeTabId === 'dashboardFolha' ? 'block' : 'hidden'}`}>
              <DashboardFolhaModule
                empresa={empresaAtiva}
                onNavigate={handleOpenModule}
              />
            </div>

            <div className={`h-full w-full ${activeTabId === 'colaboradores' ? 'block' : 'hidden'}`}>
              <ColaboradoresModule
                empresa={empresaAtiva}
                centrosCusto={centrosCusto}
              />
            </div>

            <div className={`h-full w-full ${activeTabId === 'rubricas' ? 'block' : 'hidden'}`}>
              <RubricasTabelasModule contas={contas} />
            </div>

            <div className={`h-full w-full ${activeTabId === 'calculoFolha' ? 'block' : 'hidden'}`}>
              <CalculoFolhaModule
                empresa={empresaAtiva}
                onOpenReportPreview={handleOpenCustomPrintPreview}
                onIntegracaoSucesso={() => {
                  setLancamentos(dbService.getLancamentos(empresaAtiva.id));
                }}
              />
            </div>

            {/* Central eSocial - Eventos Periódicos S-1200 / S-1210 em XML */}
            <div className={`h-full w-full ${activeTabId === 'esocial' ? 'block' : 'hidden'}`}>
              <ESocialXmlModule />
            </div>

            {/* Central DCTFWeb & Fechamento Previdenciário S-1299 */}
            <div className={`h-full w-full ${activeTabId === 'dctfWeb' ? 'block' : 'hidden'}`}>
              <DctfWebModule />
            </div>

            {/* Provisões Mensais de Férias e 13º Salário */}
            <div className={`h-full w-full ${activeTabId === 'provisoesFolha' ? 'block' : 'hidden'}`}>
              <ProvisoesFolhaModule
                empresa={empresaAtiva}
                onOpenReportPreview={handleOpenCustomPrintPreview}
                onIntegracaoSucesso={() => {
                  setLancamentos(dbService.getLancamentos(empresaAtiva.id));
                }}
              />
            </div>

            {/* Rescisão Contratual & TRCT Oficial (Portaria MTE 1.057/2012 & Lei 12.506/2011) */}
            <div className={`h-full w-full ${activeTabId === 'rescisao' ? 'block' : 'hidden'}`}>
              <RescisaoModule />
            </div>

            {/* Gestão de Benefícios & Vale-Transporte / Refeição (Lei 7.418/1985 & CLT) */}
            <div className={`h-full w-full ${activeTabId === 'beneficios' ? 'block' : 'hidden'}`}>
              <BeneficiosModule />
            </div>

            {/* HONORÁRIOS CONTÁBEIS */}
            <div className={`h-full w-full ${activeTabId === 'dashboardHonorarios' ? 'block' : 'hidden'}`}>
              <DashboardHonorariosModule
                empresa={empresaAtiva}
                onNavigate={handleOpenModule}
              />
            </div>

            <div className={`h-full w-full ${activeTabId === 'contratosHonorarios' ? 'block' : 'hidden'}`}>
              <ContratosHonorariosModule empresas={empresas} />
            </div>

            <div className={`h-full w-full ${activeTabId === 'faturamentoHonorarios' ? 'block' : 'hidden'}`}>
              <FaturamentoHonorariosModule
                empresa={empresaAtiva}
                empresas={empresas}
                contas={contas}
                onOpenReportPreview={handleOpenCustomPrintPreview}
                onIntegracaoSucesso={() => {
                  setLancamentos(dbService.getLancamentos(empresaAtiva.id));
                }}
              />
            </div>
          </main>
        </div>
      </div>

      {/* 4. Barra de Status Inferior Windows 11 */}
      <StatusBar
        empresa={empresaAtiva}
        totalLancamentos={lancamentos.length}
        totalDebitos={totalDebitos}
        totalCreditos={totalCreditos}
        diferencaDxC={diferencaDxC}
      />

      {/* 5. Command Palette Global (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectModule={handleOpenModule}
        contas={contas}
        empresas={empresas}
        onSelectEmpresa={handleSelectEmpresa}
        onNewLancamento={() => handleOpenModule('lancamentos')}
      />

      {/* 6. Modal Oficial de Print Preview A4 com Assinaturas CFC / CRC */}
      <ReportPrintPreviewModal
        isOpen={isPrintPreviewOpen}
        onClose={() => {
          setIsPrintPreviewOpen(false);
          setCustomPrintConfig(null);
        }}
        empresa={empresaAtiva}
        tituloRelatorio={
          customPrintConfig?.titulo ||
          (activeModuleId === 'balancete' ? 'BALANCETE DE VERIFICAÇÃO' :
           activeModuleId === 'balanco' ? 'BALANÇO PATRIMONIAL' :
           activeModuleId === 'dre' ? 'DEMONSTRAÇÃO DO RESULTADO DO EXERCÍCIO (DRE)' :
           activeModuleId === 'dlpa' ? 'DEMONSTRAÇÃO DE LUCROS OU PREJUÍZOS ACUMULADOS (DLPA)' :
           activeModuleId === 'dfc' ? 'DEMONSTRAÇÃO DOS FLUXOS DE CAIXA (DFC)' :
           activeModuleId === 'livros' ? 'LIVRO DIÁRIO GERAL / RAZÃO ANALÍTICO' :
           activeModuleId === 'planoContas' ? 'PLANO DE CONTAS REFERENCIAL' :
           'DEMONSTRATIVO CONTÁBIL OFICIAL')
        }
        subtitulo={
          customPrintConfig?.subtitulo ||
          "Emitido em estrita conformidade com as Normas Brasileiras de Contabilidade (NBC TG / CFC)"
        }
        periodo={`01/01/${empresaAtiva.exercicioAtivo} a 31/10/${empresaAtiva.exercicioAtivo}`}
        orientacaoPadrao={activeModuleId === 'balancete' ? 'landscape' : 'portrait'}
      >
        {renderPrintPreviewContent()}
      </ReportPrintPreviewModal>
    </div>
  );
};

export default App;
