import React, { useState, useEffect, useMemo } from 'react';
import { dbService } from './db/sqliteService';
import { 
  Empresa, 
  ContaContabil, 
  HistoricoPadrao, 
  LancamentoContabil, 
  DocumentoStudio,
  ModuloSistema,
  CentroCusto,
  PermissaoSistema,
  SessaoUsuario,
  MODULO_PERMISSOES
} from './types/contabil';
import { AccountingEngine } from './engine/accountingEngine';

// Layout & Navegação
import { TitleBar } from './components/layout/TitleBar';
import { RibbonBar } from './components/layout/RibbonBar';
import { Sidebar } from './components/layout/Sidebar';
import { StatusBar } from './components/layout/StatusBar';
import { CommandPalette } from './components/command/CommandPalette';
import { ReportPrintPreviewModal } from './components/layout/ReportPrintPreviewModal';
import { AuthGuardModal } from './components/auth/AuthGuardModal';

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
import { PlanejamentoTributarioModule } from './components/contabilidade/PlanejamentoTributarioModule';

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
import { PerDcompModule } from './components/escrita/PerDcompModule';
import { IpiBlocoKModule } from './components/escrita/IpiBlocoKModule';

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
import { PontoEletronicoModule } from './components/folha/PontoEletronicoModule';
import { SstModule } from './components/folha/SstModule';

import { DashboardHonorariosModule } from './components/honorarios/DashboardHonorariosModule';
import { ContratosHonorariosModule } from './components/honorarios/ContratosHonorariosModule';
import { FaturamentoHonorariosModule } from './components/honorarios/FaturamentoHonorariosModule';
import { BoletosHonorariosModule } from './components/honorarios/BoletosHonorariosModule';
import { AnaliseBalancoModule } from './components/demonstrativos/AnaliseBalancoModule';
import { ProtocoloModule } from './components/utilitarios/ProtocoloModule';
import { EcfBlocoYModule } from './components/contabilidade/EcfBlocoYModule';
import { DimobModule } from './components/escrita/DimobModule';
import { DmedModule } from './components/escrita/DmedModule';
import { EfdContribuicoesModule } from './components/escrita/EfdContribuicoesModule';
import { NotasExplicativasModule } from './components/contabilidade/NotasExplicativasModule';
import { GiaSintegraModule } from './components/escrita/GiaSintegraModule';
import { DirfModule } from './components/escrita/DirfModule';
import { FinanciamentosMutuosModule } from './components/contabilidade/FinanciamentosMutuosModule';
import { IssqnDiefModule } from './components/escrita/IssqnDiefModule';
import { MalhaFinaAuditoriaModule } from './components/auditoria/MalhaFinaAuditoriaModule';
import { DefisModule } from './components/escrita/DefisModule';
import { CarneLeaoModule } from './components/escrita/CarneLeaoModule';
import { EcacDteModule } from './components/escrita/EcacDteModule';
import { FatorRModule } from './components/escrita/FatorRModule';
import { AtivoIntangivelModule } from './components/patrimonio/AtivoIntangivelModule';
import { LeasingCpc06Module } from './components/patrimonio/LeasingCpc06Module';
import { IcmsStModule } from './components/escrita/IcmsStModule';
import { ConciliacaoCartoes1600Module } from './components/escrita/ConciliacaoCartoes1600Module';
import { SubvencoesGovernamentaisModule } from './components/contabilidade/SubvencoesGovernamentaisModule';
import { CreditoPresumidoAgroIpiModule } from './components/escrita/CreditoPresumidoAgroIpiModule';
import { ReformaTributaria2026Module } from './components/contabilidade/ReformaTributaria2026Module';
import { AjusteValorPresenteModule } from './components/contabilidade/AjusteValorPresenteModule';
import { BlocoKAvancadoEstoqueModule } from './components/escrita/BlocoKAvancadoEstoqueModule';
import { RetencoesConstrucaoCivilModule } from './components/escrita/RetencoesConstrucaoCivilModule';
import { ImpairmentCpc01Module } from './components/patrimonio/ImpairmentCpc01Module';
import { PrecosTransferenciaModule } from './components/contabilidade/PrecosTransferenciaModule';
import { CideRemessasExteriorModule } from './components/escrita/CideRemessasExteriorModule';
import { AtivosBiologicosCpc29Module } from './components/patrimonio/AtivosBiologicosCpc29Module';
import { ConstrucaoPocCpc47Module } from './components/contabilidade/ConstrucaoPocCpc47Module';
import { ConsolidacaoMepCpc18Module } from './components/demonstrativos/ConsolidacaoMepCpc18Module';
import { PisCofinsReceitasFinanceirasModule } from './components/escrita/PisCofinsReceitasFinanceirasModule';
import { CombustiveisMonofasicoLmcModule } from './components/escrita/CombustiveisMonofasicoLmcModule';
import { AuditoriaSpedCruzamentoModule } from './components/auditoria/AuditoriaSpedCruzamentoModule';
import { IpiCreditoBasicoModule } from './components/escrita/IpiCreditoBasicoModule';
import { HedgeAccountingCpc48Module } from './components/contabilidade/HedgeAccountingCpc48Module';
import { RetIncorporacaoMcmvModule } from './components/escrita/RetIncorporacaoMcmvModule';
import { CooperativasSobrasPerdasModule } from './components/contabilidade/CooperativasSobrasPerdasModule';
import { CreditoAcumuladoIcmsModule } from './components/escrita/CreditoAcumuladoIcmsModule';
import { GanhoCapitalAlienacaoModule } from './components/patrimonio/GanhoCapitalAlienacaoModule';
import { ReintegraExportacaoModule } from './components/escrita/ReintegraExportacaoModule';
import { IofMutuosModule } from './components/contabilidade/IofMutuosModule';
import { ApaPrecosTransferenciaModule } from './components/contabilidade/ApaPrecosTransferenciaModule';
import { FcbfCompensacaoModule } from './components/escrita/FcbfCompensacaoModule';
import { DepreciacaoAceleradaIncentivadaModule } from './components/patrimonio/DepreciacaoAceleradaIncentivadaModule';
import { SubcapitalizacaoThinCapModule } from './components/contabilidade/SubcapitalizacaoThinCapModule';
import { ProgramaMoverModule } from './components/escrita/ProgramaMoverModule';
import { JcpApuracaoModule } from './components/contabilidade/JcpApuracaoModule';
import { CprAgroHedgeModule } from './components/contabilidade/CprAgroHedgeModule';
import { ReidiInfraestruturaModule } from './components/escrita/ReidiInfraestruturaModule';
import { PrejuizosFiscaisLalurModule } from './components/contabilidade/PrejuizosFiscaisLalurModule';
import { CbiosRenovabioModule } from './components/contabilidade/CbiosRenovabioModule';
import { DrawbackIntegradoModule } from './components/escrita/DrawbackIntegradoModule';
import { DebenturesIncentivadasModule } from './components/contabilidade/DebenturesIncentivadasModule';
import { IncentivosSudeneSudamModule } from './components/contabilidade/IncentivosSudeneSudamModule';
import { SubvencoesInvestimentoModule } from './components/contabilidade/SubvencoesInvestimentoModule';
import { ConcessoesPublicasModule } from './components/contabilidade/ConcessoesPublicasModule';
import { RevisaoVidasUteisModule } from './components/patrimonio/RevisaoVidasUteisModule';
import { CreditoPisCofinsImobilizadoModule } from './components/escrita/CreditoPisCofinsImobilizadoModule';
import { RemuneracaoAcoesModule } from './components/contabilidade/RemuneracaoAcoesModule';
import { BeneficiosPosEmpregoModule } from './components/contabilidade/BeneficiosPosEmpregoModule';
import { AnaliseDemonstracoesModule } from './components/contabilidade/AnaliseDemonstracoesModule';
import { HonorariosContabeisModule } from './components/honorarios/HonorariosContabeisModule';
import { SicalcAcrescimosDarfModule } from './components/escrita/SicalcAcrescimosDarfModule';
import { DiopsAnsModule } from './components/contabilidade/DiopsAnsModule';
import { CprbDesoneracaoModule } from './components/escrita/CprbDesoneracaoModule';
import { PisCofinsInstituicoesFinanceirasModule } from './components/escrita/PisCofinsInstituicoesFinanceirasModule';
import { DeclaracoesEstaduaisIcmsModule } from './components/escrita/DeclaracoesEstaduaisIcmsModule';
import { BalancoAberturaModule } from './components/contabilidade/BalancoAberturaModule';
import { RetImobiliarioScpModule } from './components/escrita/RetImobiliarioScpModule';
import { ZfmSuframaModule } from './components/escrita/ZfmSuframaModule';
import { DifalNaoContribuinteFcpModule } from './components/escrita/DifalNaoContribuinteFcpModule';
import { CessaoMaoDeObraRetencoesModule } from './components/escrita/CessaoMaoDeObraRetencoesModule';
import { SimplesNacionalRegimeCaixaModule } from './components/escrita/SimplesNacionalRegimeCaixaModule';
import { CreditoPresumidoAgroPisCofinsModule } from './components/escrita/CreditoPresumidoAgroPisCofinsModule';
import { SubstituicaoTributariaPisCofinsModule } from './components/escrita/SubstituicaoTributariaPisCofinsModule';
import { SubvencoesInvestimentoNovoModule } from './components/contabilidade/SubvencoesInvestimentoNovoModule';
import { PisCofinsImportacaoModule } from './components/escrita/PisCofinsImportacaoModule';
import { EntidadesSemFinsLucrativosModule } from './components/contabilidade/EntidadesSemFinsLucrativosModule';
import { DrawbackIntermediarioModule } from './components/escrita/DrawbackIntermediarioModule';
import { RetencoesReinf4000Module } from './components/escrita/RetencoesReinf4000Module';
import { FciModule } from './components/escrita/FciModule';
import { DimeDcipModule } from './components/escrita/DimeDcipModule';
import { SiscredParanaModule } from './components/escrita/SiscredParanaModule';
import { DereEconomicoModule } from './components/contabilidade/DereEconomicoModule';
import { FundosEquilibrioFiscalModule } from './components/escrita/FundosEquilibrioFiscalModule';
import { ScpSociedadeContaParticipacaoModule } from './components/contabilidade/ScpSociedadeContaParticipacaoModule';
import { ApuracaoEstoquesCusteioModule } from './components/contabilidade/ApuracaoEstoquesCusteioModule';
import { CteTransporteFreteModule } from './components/escrita/CteTransporteFreteModule';
import { DerexSpedEcfModule } from './components/contabilidade/DerexSpedEcfModule';
import { DapiMgIcmsModule } from './components/escrita/DapiMgIcmsModule';
import { PcldPerdasCreditosModule } from './components/contabilidade/PcldPerdasCreditosModule';
import { DctfMensalModule } from './components/escrita/DctfMensalModule';
import { ESocialRemuneracaoPgtosModule } from './components/folha/ESocialRemuneracaoPgtosModule';
import { EcdDemonstracoesBlocoJModule } from './components/contabilidade/EcdDemonstracoesBlocoJModule';
import { IpiSelosControleModule } from './components/escrita/IpiSelosControleModule';
import { SstESocialS2220S2240Module } from './components/folha/SstESocialS2220S2240Module';
import { SpedFiscalBlocoDModule } from './components/escrita/SpedFiscalBlocoDModule';
import { MepMaisValiaAgioModule } from './components/contabilidade/MepMaisValiaAgioModule';
import { CatESocialS2210Module } from './components/folha/CatESocialS2210Module';
import { SpedContribuicoesBloco1Module } from './components/escrita/SpedContribuicoesBloco1Module';
import { ConsolidacaoDemonstracoesCpc36Module } from './components/contabilidade/ConsolidacaoDemonstracoesCpc36Module';
import { TsveESocialS2300Module } from './components/folha/TsveESocialS2300Module';
import { LucroPresumidoEcfBlocoPModule } from './components/contabilidade/LucroPresumidoEcfBlocoPModule';
import { ReinfSerieR4000Module } from './components/escrita/ReinfSerieR4000Module';
import { EsocialEventosPeriodicosS1260S1280Module } from './components/folha/EsocialEventosPeriodicosS1260S1280Module';
import { LucroRealEcfBlocoNModule } from './components/contabilidade/LucroRealEcfBlocoNModule';
import { SpedFiscalBlocoEModule } from './components/escrita/SpedFiscalBlocoEModule';
import { ProcessosTrabalhistasESocialS2500Module } from './components/folha/ProcessosTrabalhistasESocialS2500Module';
import { OperacoesExteriorEcfBlocoXModule } from './components/contabilidade/OperacoesExteriorEcfBlocoXModule';
import { SpedFiscalBloco1Module } from './components/escrita/SpedFiscalBloco1Module';

import {
  LayoutDashboard,
  BookOpen,
  Scale,
  Gavel,
  PieChart,
  FileSpreadsheet,
  FolderTree,
  Landmark,
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
  Heart,
  Clock,
  ShieldCheck,
  Factory,
  Activity,
  Briefcase,
  Home,
  HeartPulse,
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
  Truck,
  Stethoscope,
  Ambulance,
  GraduationCap
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

  // Sessão de Autenticação Ativa (Token + Dados do Usuário)
  const [sessao, setSessao] = useState<SessaoUsuario | null>(() => dbService.getSessaoAtiva());
  const [accessDeniedNotice, setAccessDeniedNotice] = useState<{ title: string; modulo: string; role: string } | null>(null);

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

  // Recalcular totais e diferença DxC em tempo real (memoizado para alta performance)
  const trialBalance = useMemo(
    () => AccountingEngine.generateTrialBalance(contas, lancamentos, 5, false, false),
    [contas, lancamentos]
  );
  const totalDebitos = trialBalance.totalDebitos;
  const totalCreditos = trialBalance.totalCreditos;
  const diferencaDxC = Math.abs(totalDebitos - totalCreditos);

  const isTabOpen = (moduleId: string) => tabs.some(t => t.moduleId === moduleId);

  const handleLogout = () => {
    dbService.logout();
    setSessao(null);
    setTabs([
      { id: 'dashboard', moduleId: 'dashboard', title: 'Dashboard Executivo', icon: LayoutDashboard, closable: false }
    ]);
    setActiveTabId('dashboard');
  };

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
      case 'ativoIntangivel': return { title: 'Ativo Intangível (CPC 04)', icon: Sparkles };
      case 'leasingCpc06': return { title: 'Leasing CPC 06 (R2)', icon: KeyRound };
      case 'subvencoesIncentivos': return { title: 'Subvenções CPC 07 (R1)', icon: Landmark };
      case 'avpCpc12': return { title: 'Ajuste Valor Presente (CPC 12)', icon: Calculator };
      case 'impairmentCpc01': return { title: 'Impairment (CPC 01 R1)', icon: Scale };
      case 'precosTransferencia': return { title: 'Preços de Transferência (OCDE)', icon: Globe2 };
      case 'ativosBiologicosCpc29': return { title: 'Ativos Biológicos (CPC 29)', icon: Sprout };
      case 'construcaoPocCpc47': return { title: 'Construção & POC (CPC 47)', icon: HardHat };
      case 'consolidacaoMepCpc18': return { title: 'Consolidação & MEP (CPC 18)', icon: Network };
      case 'reformaTributaria2026': return { title: 'Reforma Tributária 2026', icon: Sparkles };
      case 'inventarioPatrimonial': return { title: 'Inventário & Baixas CPC 27', icon: Archive };
      case 'apuracaoTrimestral': return { title: 'Apuração IRPJ & CSLL (Trimestral)', icon: Calculator };
      case 'lalur': return { title: 'LALUR / LACS (Lucro Real)', icon: BookOpen };
      case 'consolidacao': return { title: 'Consolidação Matriz & Filiais (CPC 36)', icon: Share2 };
      case 'dmplDva': return { title: 'DMPL & DVA (CPC 26/09)', icon: Share2 };
      case 'balancoSocial': return { title: 'Balanço Social (IBASE / ESG)', icon: Heart };
      case 'planejamentoTributario': return { title: 'Planejamento Tributário Anual', icon: TrendingUp };
      case 'analiseBalanco': return { title: 'Análise Balanço & Índices (NBC TG)', icon: Activity };
      case 'ecfBlocoY': return { title: 'SPED ECF Bloco Y (Econômico)', icon: Briefcase };
      case 'notasExplicativas': return { title: 'Notas Explicativas (CPC 26)', icon: FileText };
      case 'emprestimosFinanciamentos': return { title: 'Empréstimos & Financiamentos (CPC 48)', icon: Landmark };
      case 'hedgeAccountingCpc48': return { title: 'Hedge Accounting & Derivativos (CPC 48)', icon: ShieldCheck };
      case 'cooperativasSobrasPerdas': return { title: 'Cooperativas & Sobras/Perdas (Lei 5.764)', icon: HeartHandshake };
      case 'ganhoCapitalAlienacao': return { title: 'Ganho de Capital no Ativo (Lei 13.259)', icon: TrendingUp };
      case 'iofMutuos': return { title: 'IOF Mútuos Intercompany (RIOF)', icon: Coins };
      case 'apaPrecosTransferencia': return { title: 'APA & Transfer Pricing (OCDE)', icon: ShieldCheck };
      case 'depreciacaoAceleradaIncentivada': return { title: 'Depreciação Acelerada (Lei 14.871)', icon: Factory };
      case 'subcapitalizacaoThinCap': return { title: 'Subcapitalização & Thin Cap (Lei 12.249)', icon: Scale };
      case 'jurosSobreCapitalProprio': return { title: 'JCP - Juros s/ Capital Próprio', icon: Coins };
      case 'cprAgronegocio': return { title: 'CPR Agro & Hedge (CPC 48)', icon: Sprout };
      case 'prejuizosFiscaisLalur': return { title: 'Prejuízos Fiscais & Trava 30%', icon: Scale };
      case 'cbiosRenovabio': return { title: 'CBIOs RenovaBio & B3 (OCPC 08)', icon: Leaf };
      case 'debenturesIncentivadas': return { title: 'Debêntures Infraestrutura (Lei 14.801)', icon: Coins };
      case 'incentivosSudeneSudam': return { title: 'Incentivos SUDENE & SUDAM (75%)', icon: Compass };
      case 'subvencoesInvestimentoLei14789': return { title: 'Subvenções Investimento (Lei 14.789)', icon: Award };
      case 'concessoesPublicasIcpc01': return { title: 'Concessões Públicas (ICPC 01)', icon: Layers };
      case 'revisaoVidasUteisImpairment': return { title: 'Revisão Vidas Úteis & Impairment', icon: RotateCcw };
      case 'remuneracaoAcoesCpc10': return { title: 'Stock Options & Ações (CPC 10)', icon: Sparkles };
      case 'beneficiosPosEmpregoCpc33': return { title: 'Benefícios Pós-Emprego (CPC 33)', icon: HeartPulse };
      case 'analiseDemonstracoesCfc': return { title: 'Análise Balanço (NBC TG)', icon: TrendingUp };
      case 'honorariosContabeis': return { title: 'Honorários & Contratos (HO)', icon: DollarSign };
      case 'protocolo': return { title: 'Protocolo de Documentos & Malotes', icon: FileText };
      case 'razaoAuxiliar': return { title: 'Razão Auxiliar (Clientes/Forn)', icon: FileSpreadsheet };
      case 'entidadesSemFinsLucrativos': return { title: 'Terceiro Setor & CEBAS', icon: HeartHandshake };

      // Escrita Fiscal
      case 'dashboardFiscal': return { title: 'Dashboard Fiscal', icon: Receipt };
      case 'ecacCaixaPostal': return { title: 'e-CAC & DTE Postal', icon: Mail };
      case 'notasFiscais': return { title: 'Notas Fiscais & XML', icon: FileText };
      case 'nfse': return { title: 'NFS-e Nacional / DPS', icon: Receipt };
      case 'pgdas': return { title: 'PGDAS-D & Simples Nacional', icon: Calculator };
      case 'fatorR': return { title: 'Apuração Fator R (Simples)', icon: Percent };
      case 'defis': return { title: 'DEFIS (Simples Nacional)', icon: Building2 };
      case 'efdContribuicoes': return { title: 'EFD-Contribuições (PIS/COFINS)', icon: FileCode };
      case 'giaSintegra': return { title: 'GIA & SINTEGRA Estadual', icon: Scale };
      case 'icmsSubstituicaoTributaria': return { title: 'ICMS-ST & MVA Ajustada', icon: Scale };
      case 'creditoPresumidoAgroIpi': return { title: 'Crédito Presumido Agro/IPI', icon: Wheat };
      case 'blocoKAvancadoEstoque': return { title: 'Auditoria Estoque & Bloco K', icon: Boxes };
      case 'retencoesConstrucaoCivil': return { title: 'Retenções Construção Civil (CNO)', icon: HardHat };
      case 'cideRemessasExterior': return { title: 'CIDE & Remessas Exterior', icon: Coins };
      case 'pisCofinsReceitasFinanceiras': return { title: 'PIS/COFINS Rec. Financeiras', icon: Coins };
      case 'combustiveisMonofasicoLmc': return { title: 'Combustíveis & LMC (Ad Rem)', icon: Fuel };
      case 'auditoriaSpedCruzamento': return { title: 'Auditoria Cruzada SPED', icon: FileCheck };
      case 'dirf': return { title: 'DIRF (RFB)', icon: FileText };
      case 'carneLeao': return { title: 'Livro Caixa & Carnê-Leão', icon: BookOpen };
      case 'issqnDief': return { title: 'DIEF & ISSQN Municipal', icon: Building2 };
      case 'malhaFinaAuditoria': return { title: 'Malha Fina & Auditoria RFB', icon: ShieldAlert };
      case 'dimob': return { title: 'DIMOB (Ativ. Imobiliárias)', icon: Home };
      case 'dmed': return { title: 'DMED (Serviços de Saúde)', icon: HeartPulse };
      case 'ciap': return { title: 'CIAP Bloco G (Ativo Permanente)', icon: Layers };
      case 'lcdpr': return { title: 'Livro Caixa Rural (LCDPR)', icon: BookOpen };
      case 'inventarioEstoque': return { title: 'Livro Registro de Inventário Modelo 7 (SPED Bloco H)', icon: Boxes };
      case 'cartoes': return { title: 'Vendas Cartões & Operadoras (1600)', icon: CreditCard };
      case 'conciliacaoCartoes1600': return { title: 'Cartões & MDR (Reg. 1600)', icon: CreditCard };
      case 'retencoes': return { title: 'Retenções na Fonte & DARF', icon: Receipt };
      case 'reinf': return { title: 'EFD-Reinf em XML (v2.01)', icon: FileCode };
      case 'difal': return { title: 'DIFAL & DeSTDA (GNRE)', icon: Scale };
      case 'perDcomp': return { title: 'PER/DCOMP Web & Créditos Compensáveis', icon: Scale };
      case 'ipiBlocoK': return { title: 'Apuração IPI & Bloco K', icon: Factory };
      case 'ipiCreditoBasico': return { title: 'IPI Crédito Básico & Ressarcimento', icon: Factory };
      case 'retIncorporacaoMcmv': return { title: 'RET Incorporação & MCMV (Lei 10.931)', icon: Building2 };
      case 'creditoAcumuladoIcms': return { title: 'Crédito Acumulado ICMS (e-CredAc)', icon: Coins };
      case 'reintegraExportacao': return { title: 'REINTEGRA Exportação (Lei 12.546)', icon: Ship };
      case 'simplesRegimeCaixa': return { title: 'Simples Nacional (Regime Caixa)', icon: Calculator };
      case 'creditoPresumidoAgro': return { title: 'Crédito Presumido PIS/COFINS Agro', icon: Wheat };
      case 'substituicaoPisCofins': return { title: 'Substituição Tributária PIS/COFINS', icon: Scale };
      case 'subvencoesInvestimentoNovo': return { title: 'Subvenções Investimento (Lei 14.789)', icon: Building2 };
      case 'pisCofinsImportacao': return { title: 'PIS/COFINS Importação (Lei 10.865)', icon: Anchor };
      case 'drawbackIntermediario': return { title: 'Drawback Intermediário', icon: Anchor };
      case 'retencoesReinf4000': return { title: 'Retenções Federais Reinf (R-4000)', icon: Receipt };
      case 'fci': return { title: 'FCI - Conteúdo de Importação', icon: Globe2 };
      case 'dimeDcip': return { title: 'DIME & DCIP (Santa Catarina)', icon: Building2 };
      case 'siscredParana': return { title: 'Siscred Paraná (ICMS Acumulado)', icon: Coins };
      case 'dereEconomico': return { title: 'DeRE - Balancete Regulatório (XSD v1.1.0)', icon: FileSpreadsheet };
      case 'fundosEquilibrioFiscal': return { title: 'Fundos Equilíbrio Fiscal (FEEF/FOT/PROTEGE)', icon: Coins };
      case 'scpSociedade': return { title: 'SCP - Sociedade em Conta de Participação', icon: Users };
      case 'apuracaoEstoquesCusteio': return { title: 'Apuração de Estoques & Kardex (CPC 16)', icon: Boxes };
      case 'cteTransporteFrete': return { title: 'CT-e & MDF-e Transporte Frete', icon: Truck };
      case 'derexSpedEcf': return { title: 'DEREX & Exterior (SPED ECF V/X)', icon: Globe2 };
      case 'dapiMgIcms': return { title: 'DAPI-MG ICMS (Dec. 48.589/23)', icon: Landmark };
      case 'pcldPerdasCreditos': return { title: 'PCLD Perdas Estimadas (CPC 48 / Lei 9.430)', icon: Scale };
      case 'dctfMensalTradicional': return { title: 'DCTF Mensal Tradicional (RFB)', icon: FileCheck };
      case 'esocialRemuneracaoPgtos': return { title: 'eSocial S-1200 & S-1210 - Remuneração e Pagamentos', icon: FileCode };
      case 'ecdDemonstracoesBlocoJ': return { title: 'ECD Bloco J - Demonstrações Contábeis (Balanço/DRE)', icon: FileSpreadsheet };
      case 'mepMaisValiaAgio': return { title: 'Equivalência Patrimonial & Mais-Valia (CPC 18)', icon: PieChart };
      case 'ipiSelosControle': return { title: 'Apuração do IPI & Selos de Controle (Livro Modelo 8)', icon: Factory };
      case 'spedFiscalBlocoD': return { title: 'SPED Fiscal Bloco D (Transporte & Telecom)', icon: Truck };
      case 'sstESocialS2220S2240': return { title: 'eSocial SST (S-2220 / S-2240) & PPP', icon: Stethoscope };
      case 'catESocialS2210': return { title: 'eSocial S-2210 (CAT Acidente de Trabalho)', icon: Ambulance };
      case 'spedContribuicoesBloco1': return { title: 'SPED Contribuições Bloco 1 (Processos & Tema 69 STF)', icon: Scale };
      case 'consolidacaoCpc36': return { title: 'Consolidação de Demonstrações (CPC 36 R3)', icon: Layers };
      case 'tsveESocialS2300': return { title: 'eSocial TSVE (S-2300 / S-2306 / S-2399)', icon: GraduationCap };
      case 'lucroPresumidoEcfP': return { title: 'Lucro Presumido SPED ECF (Bloco P)', icon: Calculator };
      case 'reinfSerieR4000': return { title: 'EFD-Reinf Série R-4000 (Retenções na Fonte)', icon: Receipt };
      case 'esocialRuralS1260': return { title: 'eSocial S-1260 & S-1280 (Rural & Desoneração CPRB)', icon: Wheat };
      case 'lucroRealEcfBlocoN': return { title: 'Lucro Real SPED ECF (Bloco N - IRPJ/CSLL)', icon: Calculator };
      case 'spedFiscalBlocoE': return { title: 'SPED Fiscal Bloco E (Apuração ICMS/ST/DIFAL)', icon: Landmark };
      case 'processosESocialS2500': return { title: 'eSocial Processos Trabalhistas (S-2500 / S-2501)', icon: Gavel };
      case 'operacoesExteriorEcfBlocoX': return { title: 'SPED ECF Bloco X (Exterior & Preços de Transferência)', icon: Globe2 };
      case 'spedFiscalBloco1': return { title: 'SPED Fiscal Bloco 1 (Meios Eletrônicos 1601 & Créditos 1200)', icon: CreditCard };

      case 'fcbfCompensacao': return { title: 'FCBF Compensação ICMS (EC 132)', icon: Landmark };
      case 'programaMover': return { title: 'Programa Mover (Créditos P&D)', icon: Car };
      case 'reidiInfraestrutura': return { title: 'REIDI Infraestrutura (Lei 11.488)', icon: Building2 };
      case 'drawbackIntegrado': return { title: 'Drawback Integrado & Siscomex', icon: Anchor };
      case 'creditoPisCofinsImobilizado': return { title: 'PIS/COFINS Imobilizado (F120/F130)', icon: Coins };
      case 'sicalcAcrescimosDarf': return { title: 'Sicalc DARF (Lei 9.430/96)', icon: Calculator };
      case 'participantes': return { title: 'Participantes SPED', icon: Users };
      case 'produtos': return { title: 'Itens & Produtos', icon: Package };
      case 'acumuladores': return { title: 'Acumuladores Fiscais', icon: Layers };
      case 'apuracaoFiscal': return { title: 'Apuração DAS & Guias', icon: Calculator };
      case 'calendarioFiscal': return { title: 'Calendário Fiscal & Obrigações', icon: Calendar };

      // Folha
      case 'dashboardFolha': return { title: 'Dashboard da Folha', icon: Users };
      case 'calculoFolha': return { title: 'Cálculo da Folha & Holerite', icon: Calculator };
      case 'pontoEletronico': return { title: 'Ponto Eletrônico & Banco de Horas (Portaria 671)', icon: Clock };
      case 'sst': return { title: 'SST & Afastamentos (eSocial)', icon: ShieldCheck };
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
      case 'boletosHonorarios': return { title: 'Boletos Bancários & Cobrança PIX', icon: CreditCard };

      default: return { title: moduleId, icon: FileText };
    }
  };

  // Gerenciador de Abertura de Abas
  const handleOpenModule = (moduleId: string, title?: string, icon?: LucideIcon) => {
    // 1. Verificação Granular de Permissão (RBAC)
    const requiredPerm = MODULO_PERMISSOES[moduleId] || 'contabilidade_view';
    if (!dbService.temPermissao(requiredPerm)) {
      const meta = getModuleMeta(moduleId);
      setAccessDeniedNotice({
        title: title || meta.title,
        modulo: moduleId,
        role: sessao?.usuario.perfil || 'DESCONHECIDO'
      });
      return;
    }

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

  // Guarda de Autenticação Corporativa (Primeiro Acesso / Login)
  if (!sessao) {
    return (
      <div className={`h-screen w-screen flex flex-col overflow-hidden ${isDark ? 'dark bg-[#141414]' : 'bg-[#f8f9fa] text-neutral-900'}`}>
        <AuthGuardModal
          onAuthenticated={(novaSessao) => {
            setSessao(novaSessao);
            const emps = dbService.getEmpresas();
            setEmpresas(emps);
            const emp = dbService.getActiveEmpresa();
            setEmpresaAtiva(emp);
            setContas(dbService.getContas(emp.id));
            setHistoricos(dbService.getHistoricos(emp.id));
            setLancamentos(dbService.getLancamentos(emp.id));
            setDocumentos(dbService.getDocumentos(emp.id));
            setCentrosCusto(dbService.getCentrosCusto(emp.id));
          }}
        />
      </div>
    );
  }

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden ${isDark ? 'dark bg-[#141414]' : 'bg-[#f8f9fa] text-neutral-900'}`}>
      {/* 1. Custom TitleBar Windows 11 com Seletor Global de 4 Módulos & Sessão RBAC */}
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
        sessao={sessao}
        onLogout={handleLogout}
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
            {isTabOpen('dashboard') && (
              <div className={`h-full w-full ${activeTabId === 'dashboard' ? 'block' : 'hidden'}`}>
                <DashboardModule
                  empresa={empresaAtiva}
                  lancamentos={lancamentos}
                  contas={contas}
                  onNavigate={handleOpenModule}
                />
              </div>
            )}

            {/* Lançamentos Contábeis */}
            {isTabOpen('lancamentos') && (
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
            )}

            {/* Importação OFX & Conciliação Bancária */}
            {isTabOpen('importacaoConciliacao') && (
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
            )}

            {/* Exportação SPED ECD */}
            {isTabOpen('exportacaoContabil') && (
              <div className={`h-full w-full ${activeTabId === 'exportacaoContabil' ? 'block' : 'hidden'}`}>
                <ExportacaoContabilModule
                  empresa={empresaAtiva}
                  contas={contas}
                  lancamentos={lancamentos}
                  onOpenReportPreview={(tipo) => handleOpenModule(tipo.toLowerCase())}
                />
              </div>
            )}

            {/* Balancete de Verificação */}
            {isTabOpen('balancete') && (
              <div className={`h-full w-full ${activeTabId === 'balancete' ? 'block' : 'hidden'}`}>
                <BalanceteModule
                  contas={contas}
                  lancamentos={lancamentos}
                  onOpenRazaoConta={handleOpenRazaoConta}
                />
              </div>
            )}

            {/* Balanço Patrimonial */}
            {isTabOpen('balanco') && (
              <div className={`h-full w-full ${activeTabId === 'balanco' ? 'block' : 'hidden'}`}>
                <BalancoModule
                  contas={contas}
                  lancamentos={lancamentos}
                />
              </div>
            )}

            {/* DRE */}
            {isTabOpen('dre') && (
              <div className={`h-full w-full ${activeTabId === 'dre' ? 'block' : 'hidden'}`}>
                <DREModule
                  contas={contas}
                  lancamentos={lancamentos}
                />
              </div>
            )}

            {/* DLPA */}
            {isTabOpen('dlpa') && (
              <div className={`h-full w-full ${activeTabId === 'dlpa' ? 'block' : 'hidden'}`}>
                <DLPAModule
                  empresa={empresaAtiva}
                  onOpenReportPreview={handleOpenCustomPrintPreview}
                />
              </div>
            )}

            {/* DFC */}
            {isTabOpen('dfc') && (
              <div className={`h-full w-full ${activeTabId === 'dfc' ? 'block' : 'hidden'}`}>
                <DFCModule
                  empresa={empresaAtiva}
                  onOpenReportPreview={handleOpenCustomPrintPreview}
                />
              </div>
            )}

            {/* Livros Oficiais */}
            {isTabOpen('livros') && (
              <div className={`h-full w-full ${activeTabId === 'livros' ? 'block' : 'hidden'}`}>
                <LivrosOficiaisModule
                  empresa={empresaAtiva}
                  contas={contas}
                  lancamentos={lancamentos}
                  initialContaId={razaoSelectedContaId}
                />
              </div>
            )}

            {/* Document Studio A4 */}
            {isTabOpen('documentStudio') && (
              <div className={`h-full w-full ${activeTabId === 'documentStudio' ? 'block' : 'hidden'}`}>
                <DocumentStudioModule
                  empresa={empresaAtiva}
                  contas={contas}
                  lancamentos={lancamentos}
                  documentos={documentos}
                  onSaveDocumento={handleSaveDocumento}
                />
              </div>
            )}

            {/* Plano de Contas */}
            {isTabOpen('planoContas') && (
              <div className={`h-full w-full ${activeTabId === 'planoContas' ? 'block' : 'hidden'}`}>
                <PlanoContasModule
                  contas={contas}
                  empresaId={empresaAtiva.id}
                  mascaraPlano={empresaAtiva.mascaraPlano}
                  onSaveConta={handleSaveConta}
                  onDeleteConta={handleDeleteConta}
                />
              </div>
            )}

            {/* Zeramento de Exercício */}
            {isTabOpen('zeramento') && (
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
            )}

            {/* Calendário Fiscal & Obrigações Legais */}
            {isTabOpen('calendarioFiscal') && (
              <div className={`h-full w-full ${activeTabId === 'calendarioFiscal' ? 'block' : 'hidden'}`}>
                <CalendarioFiscalModule empresa={empresaAtiva} />
              </div>
            )}

            {/* Empresas */}
            {isTabOpen('empresas') && (
              <div className={`h-full w-full ${activeTabId === 'empresas' ? 'block' : 'hidden'}`}>
                <EmpresasModule
                  empresaAtiva={empresaAtiva}
                  onSelectEmpresa={handleSelectEmpresa}
                />
              </div>
            )}

            {/* Parâmetros Contábeis */}
            {isTabOpen('parametros') && (
              <div className={`h-full w-full ${activeTabId === 'parametros' ? 'block' : 'hidden'}`}>
                <ParametrosModule
                  empresa={empresaAtiva}
                  contas={contas}
                />
              </div>
            )}

            {/* Usuários */}
            {isTabOpen('usuarios') && (
              <div className={`h-full w-full ${activeTabId === 'usuarios' ? 'block' : 'hidden'}`}>
                <UsuariosModule />
              </div>
            )}

            {/* Rede & Backup */}
            {isTabOpen('redeBackup') && (
              <div className={`h-full w-full ${activeTabId === 'redeBackup' ? 'block' : 'hidden'}`}>
                <RedeBackupModule />
              </div>
            )}

            {/* Centros de Custo */}
            {isTabOpen('centrosCusto') && (
              <div className={`h-full w-full ${activeTabId === 'centrosCusto' ? 'block' : 'hidden'}`}>
                <CentrosCustoModule empresa={empresaAtiva} />
              </div>
            )}

            {/* Lançamentos Padrão */}
            {isTabOpen('lancamentosPadrao') && (
              <div className={`h-full w-full ${activeTabId === 'lancamentosPadrao' ? 'block' : 'hidden'}`}>
                <LancamentosPadraoModule
                  empresa={empresaAtiva}
                  contas={contas}
                  historicos={historicos}
                />
              </div>
            )}

            {/* Estrutura DRE */}
            {isTabOpen('estruturaDRE') && (
              <div className={`h-full w-full ${activeTabId === 'estruturaDRE' ? 'block' : 'hidden'}`}>
                <EstruturaDREModule empresa={empresaAtiva} />
              </div>
            )}

            {/* Históricos */}
            {isTabOpen('historicos') && (
              <div className={`h-full w-full ${activeTabId === 'historicos' ? 'block' : 'hidden'}`}>
                <HistoricosModule empresa={empresaAtiva} />
              </div>
            )}

            {/* Lotes */}
            {isTabOpen('lotes') && (
              <div className={`h-full w-full ${activeTabId === 'lotes' ? 'block' : 'hidden'}`}>
                <LotesModule
                  empresa={empresaAtiva}
                  lancamentos={lancamentos}
                />
              </div>
            )}

            {/* Auditoria Contábil */}
            {isTabOpen('auditoria') && (
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
            )}

            {/* Transporte de Saldos */}
            {isTabOpen('transporteSaldos') && (
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
            )}

            {/* Ativo Imobilizado & Depreciação */}
            {isTabOpen('ativoImobilizado') && (
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
            )}

            {/* Inventário Patrimonial & Baixas CPC 27 */}
            {isTabOpen('inventarioPatrimonial') && (
              <div className={`h-full w-full ${activeTabId === 'inventarioPatrimonial' ? 'block' : 'hidden'}`}>
                <InventarioPatrimonioModule />
              </div>
            )}

            {/* Consolidação Contábil (CPC 36 / Matriz & Filiais) */}
            {isTabOpen('consolidacao') && (
              <div className={`h-full w-full ${activeTabId === 'consolidacao' ? 'block' : 'hidden'}`}>
                <ConsolidacaoModule
                  empresa={empresaAtiva}
                  onOpenReportPreview={handleOpenCustomPrintPreview}
                />
              </div>
            )}

            {/* Demonstração das Mutações do Patrimônio Líquido (DMPL CPC 26) & Demonstração do Valor Adicionado (DVA CPC 09) */}
            {isTabOpen('dmplDva') && (
              <div className={`h-full w-full ${activeTabId === 'dmplDva' ? 'block' : 'hidden'}`}>
                <DmplDvaModule />
              </div>
            )}

            {/* Balanço Social Modelo IBASE & Sustentabilidade ESG (NBC T 15 / CFC) */}
            {isTabOpen('balancoSocial') && (
              <div className={`h-full w-full ${activeTabId === 'balancoSocial' ? 'block' : 'hidden'}`}>
                <BalancoSocialModule />
              </div>
            )}

            {/* Apuração Trimestral IRPJ & CSLL (Lucro Presumido) */}
            {isTabOpen('apuracaoTrimestral') && (
              <div className={`h-full w-full ${activeTabId === 'apuracaoTrimestral' ? 'block' : 'hidden'}`}>
                <ApuracaoTrimestralModule
                  empresa={empresaAtiva}
                  onOpenReportPreview={handleOpenCustomPrintPreview}
                  onIntegracaoSucesso={() => {
                    setLancamentos(dbService.getLancamentos(empresaAtiva.id));
                  }}
                />
              </div>
            )}

            {/* Livro Eletrônico LALUR & LACS (Lucro Real / Bloco M SPED ECF) */}
            {isTabOpen('lalur') && (
              <div className={`h-full w-full ${activeTabId === 'lalur' ? 'block' : 'hidden'}`}>
                <LalurLacsModule />
              </div>
            )}

            {/* Razão Auxiliar & Conciliação de Clientes e Fornecedores */}
            {isTabOpen('razaoAuxiliar') && (
              <div className={`h-full w-full ${activeTabId === 'razaoAuxiliar' ? 'block' : 'hidden'}`}>
                <RazaoAuxiliarModule />
              </div>
            )}

            {/* ESCRITA FISCAL */}
            {isTabOpen('dashboardFiscal') && (
              <div className={`h-full w-full ${activeTabId === 'dashboardFiscal' ? 'block' : 'hidden'}`}>
                <DashboardFiscalModule
                  empresa={empresaAtiva}
                  onNavigate={handleOpenModule}
                />
              </div>
            )}

            {isTabOpen('acumuladores') && (
              <div className={`h-full w-full ${activeTabId === 'acumuladores' ? 'block' : 'hidden'}`}>
                <AcumuladoresModule
                  empresaId={empresaAtiva.id}
                  contas={contas}
                  historicos={historicos}
                />
              </div>
            )}

            {isTabOpen('notasFiscais') && (
              <div className={`h-full w-full ${activeTabId === 'notasFiscais' ? 'block' : 'hidden'}`}>
                <NotasFiscaisModule empresa={empresaAtiva} />
              </div>
            )}

            {/* Vendas Cartões & Operadoras (SPED 1600) */}
            {isTabOpen('cartoes') && (
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
            )}

            {/* Central de Retenções na Fonte (DIRF / EFD-Reinf / DCTFWeb) */}
            {isTabOpen('retencoes') && (
              <div className={`h-full w-full ${activeTabId === 'retencoes' ? 'block' : 'hidden'}`}>
                <RetencoesModule
                  empresa={empresaAtiva}
                  onOpenReportPreview={handleOpenCustomPrintPreview}
                  onIntegracaoSucesso={() => {
                    setLancamentos(dbService.getLancamentos(empresaAtiva.id));
                  }}
                />
              </div>
            )}

            {/* Apuração do DIFAL & DeSTDA (GNRE) */}
            {isTabOpen('difal') && (
              <div className={`h-full w-full ${activeTabId === 'difal' ? 'block' : 'hidden'}`}>
                <DifalModule
                  empresa={empresaAtiva}
                  onOpenReportPreview={handleOpenCustomPrintPreview}
                  onIntegracaoSucesso={() => {
                    setLancamentos(dbService.getLancamentos(empresaAtiva.id));
                  }}
                />
              </div>
            )}

            {/* NFS-e Nacional / DPS & Faturamento de Serviços */}
            {isTabOpen('nfse') && (
              <div className={`h-full w-full ${activeTabId === 'nfse' ? 'block' : 'hidden'}`}>
                <NfseModule />
              </div>
            )}

            {/* Controle de Crédito de ICMS do Ativo Permanente (CIAP Bloco G) */}
            {isTabOpen('ciap') && (
              <div className={`h-full w-full ${activeTabId === 'ciap' ? 'block' : 'hidden'}`}>
                <CiapModule />
              </div>
            )}

            {/* Livro Caixa Digital do Produtor Rural (LCDPR) */}
            {isTabOpen('lcdpr') && (
              <div className={`h-full w-full ${activeTabId === 'lcdpr' ? 'block' : 'hidden'}`}>
                <LcdprModule />
              </div>
            )}

            {/* Livro Registro de Inventário Modelo 7 & EFD-ICMS/IPI Bloco H */}
            {isTabOpen('inventarioEstoque') && (
              <div className={`h-full w-full ${activeTabId === 'inventarioEstoque' ? 'block' : 'hidden'}`}>
                <InventarioEstoqueModule />
              </div>
            )}

            {/* Apuração PGDAS-D & Simples Nacional Avançado (LC 123/2006) */}
            {isTabOpen('pgdas') && (
              <div className={`h-full w-full ${activeTabId === 'pgdas' ? 'block' : 'hidden'}`}>
                <PgdasModule />
              </div>
            )}

            {/* Central EFD-Reinf em XML (v2.01.02) */}
            {isTabOpen('reinf') && (
              <div className={`h-full w-full ${activeTabId === 'reinf' ? 'block' : 'hidden'}`}>
                <ReinfXmlModule />
              </div>
            )}

            {isTabOpen('participantes') && (
              <div className={`h-full w-full ${activeTabId === 'participantes' ? 'block' : 'hidden'}`}>
                <ParticipantesModule empresaAtiva={empresaAtiva} />
              </div>
            )}

            {isTabOpen('produtos') && (
              <div className={`h-full w-full ${activeTabId === 'produtos' ? 'block' : 'hidden'}`}>
                <ProdutosServicosModule empresaAtiva={empresaAtiva} />
              </div>
            )}

            {isTabOpen('apuracaoFiscal') && (
              <div className={`h-full w-full ${activeTabId === 'apuracaoFiscal' ? 'block' : 'hidden'}`}>
                <ApuracaoFiscalModule
                  empresa={empresaAtiva}
                  onOpenReportPreview={handleOpenCustomPrintPreview}
                  onIntegracaoSucesso={() => {
                    setLancamentos(dbService.getLancamentos(empresaAtiva.id));
                  }}
                />
              </div>
            )}

            {/* FOLHA DE PAGAMENTO */}
            {isTabOpen('dashboardFolha') && (
              <div className={`h-full w-full ${activeTabId === 'dashboardFolha' ? 'block' : 'hidden'}`}>
                <DashboardFolhaModule
                  empresa={empresaAtiva}
                  onNavigate={handleOpenModule}
                />
              </div>
            )}

            {isTabOpen('colaboradores') && (
              <div className={`h-full w-full ${activeTabId === 'colaboradores' ? 'block' : 'hidden'}`}>
                <ColaboradoresModule
                  empresa={empresaAtiva}
                  centrosCusto={centrosCusto}
                />
              </div>
            )}

            {isTabOpen('rubricas') && (
              <div className={`h-full w-full ${activeTabId === 'rubricas' ? 'block' : 'hidden'}`}>
                <RubricasTabelasModule contas={contas} />
              </div>
            )}

            {isTabOpen('calculoFolha') && (
              <div className={`h-full w-full ${activeTabId === 'calculoFolha' ? 'block' : 'hidden'}`}>
                <CalculoFolhaModule
                  empresa={empresaAtiva}
                  onOpenReportPreview={handleOpenCustomPrintPreview}
                  onIntegracaoSucesso={() => {
                    setLancamentos(dbService.getLancamentos(empresaAtiva.id));
                  }}
                />
              </div>
            )}

            {/* Central eSocial - Eventos Periódicos S-1200 / S-1210 em XML */}
            {isTabOpen('esocial') && (
              <div className={`h-full w-full ${activeTabId === 'esocial' ? 'block' : 'hidden'}`}>
                <ESocialXmlModule />
              </div>
            )}

            {/* Central DCTFWeb & Fechamento Previdenciário S-1299 */}
            {isTabOpen('dctfWeb') && (
              <div className={`h-full w-full ${activeTabId === 'dctfWeb' ? 'block' : 'hidden'}`}>
                <DctfWebModule />
              </div>
            )}

            {/* Provisões Mensais de Férias e 13º Salário */}
            {isTabOpen('provisoesFolha') && (
              <div className={`h-full w-full ${activeTabId === 'provisoesFolha' ? 'block' : 'hidden'}`}>
                <ProvisoesFolhaModule
                  empresa={empresaAtiva}
                  onOpenReportPreview={handleOpenCustomPrintPreview}
                  onIntegracaoSucesso={() => {
                    setLancamentos(dbService.getLancamentos(empresaAtiva.id));
                  }}
                />
              </div>
            )}

            {/* Rescisão Contratual & TRCT Oficial (Portaria MTE 1.057/2012 & Lei 12.506/2011) */}
            {isTabOpen('rescisao') && (
              <div className={`h-full w-full ${activeTabId === 'rescisao' ? 'block' : 'hidden'}`}>
                <RescisaoModule />
              </div>
            )}

            {/* Gestão de Benefícios & Vale-Transporte / Refeição (Lei 7.418/1985 & CLT) */}
            {isTabOpen('beneficios') && (
              <div className={`h-full w-full ${activeTabId === 'beneficios' ? 'block' : 'hidden'}`}>
                <BeneficiosModule />
              </div>
            )}

            {/* HONORÁRIOS CONTÁBEIS */}
            {isTabOpen('dashboardHonorarios') && (
              <div className={`h-full w-full ${activeTabId === 'dashboardHonorarios' ? 'block' : 'hidden'}`}>
                <DashboardHonorariosModule
                  empresa={empresaAtiva}
                  onNavigate={handleOpenModule}
                />
              </div>
            )}

            {isTabOpen('contratosHonorarios') && (
              <div className={`h-full w-full ${activeTabId === 'contratosHonorarios' ? 'block' : 'hidden'}`}>
                <ContratosHonorariosModule empresas={empresas} />
              </div>
            )}

            {isTabOpen('faturamentoHonorarios') && (
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
            )}

            {isTabOpen('planejamentoTributario') && (
              <div className={`h-full w-full ${activeTabId === 'planejamentoTributario' ? 'block' : 'hidden'}`}>
                <PlanejamentoTributarioModule
                  empresa={empresaAtiva}
                  onOpenReportPreview={handleOpenCustomPrintPreview}
                />
              </div>
            )}

            {isTabOpen('pontoEletronico') && (
              <div className={`h-full w-full ${activeTabId === 'pontoEletronico' ? 'block' : 'hidden'}`}>
                <PontoEletronicoModule
                  empresa={empresaAtiva}
                  onOpenReportPreview={handleOpenCustomPrintPreview}
                  onIntegracaoSucesso={() => {
                    setLancamentos(dbService.getLancamentos(empresaAtiva.id));
                  }}
                />
              </div>
            )}

            {isTabOpen('sst') && (
              <div className={`h-full w-full ${activeTabId === 'sst' ? 'block' : 'hidden'}`}>
                <SstModule
                  empresa={empresaAtiva}
                  onOpenReportPreview={(title, subtitle, content) => 
                    handleOpenCustomPrintPreview({ titulo: title, subtitulo: subtitle, conteudo: content })
                  }
                />
              </div>
            )}

            {isTabOpen('perDcomp') && (
              <div className={`h-full w-full ${activeTabId === 'perDcomp' ? 'block' : 'hidden'}`}>
                <PerDcompModule
                  empresa={empresaAtiva}
                  onOpenReportPreview={(title, subtitle, content) => 
                    handleOpenCustomPrintPreview({ titulo: title, subtitulo: subtitle, conteudo: content })
                  }
                  onIntegracaoSucesso={() => {
                    setLancamentos(dbService.getLancamentos(empresaAtiva.id));
                  }}
                />
              </div>
            )}

            {isTabOpen('ipiBlocoK') && (
              <div className={`h-full w-full ${activeTabId === 'ipiBlocoK' ? 'block' : 'hidden'}`}>
                <IpiBlocoKModule
                  empresa={empresaAtiva}
                  onOpenReportPreview={(title, subtitle, content) => 
                    handleOpenCustomPrintPreview({ titulo: title, subtitulo: subtitle, conteudo: content })
                  }
                  onIntegracaoSucesso={() => {
                    setLancamentos(dbService.getLancamentos(empresaAtiva.id));
                  }}
                />
              </div>
            )}

            {isTabOpen('analiseBalanco') && (
              <div className={`h-full w-full ${activeTabId === 'analiseBalanco' ? 'block' : 'hidden'}`}>
                <AnaliseBalancoModule
                  empresa={empresaAtiva}
                  onOpenReportPreview={(title, subtitle, content) => 
                    handleOpenCustomPrintPreview({ titulo: title, subtitulo: subtitle, conteudo: content })
                  }
                />
              </div>
            )}

            {isTabOpen('protocolo') && (
              <div className={`h-full w-full ${activeTabId === 'protocolo' ? 'block' : 'hidden'}`}>
                <ProtocoloModule
                  empresa={empresaAtiva}
                  onOpenReportPreview={(title, subtitle, content) => 
                    handleOpenCustomPrintPreview({ titulo: title, subtitulo: subtitle, conteudo: content })
                  }
                />
              </div>
            )}

            {isTabOpen('boletosHonorarios') && (
              <div className={`h-full w-full ${activeTabId === 'boletosHonorarios' ? 'block' : 'hidden'}`}>
                <BoletosHonorariosModule
                  empresa={empresaAtiva}
                  onOpenReportPreview={(title, subtitle, content) => 
                    handleOpenCustomPrintPreview({ titulo: title, subtitulo: subtitle, conteudo: content })
                  }
                  onIntegracaoSucesso={() => {
                    setLancamentos(dbService.getLancamentos(empresaAtiva.id));
                  }}
                />
              </div>
            )}

            {/* SPED ECF Bloco Y (Informações Gerais, Econômicas e QSA) */}
            {isTabOpen('ecfBlocoY') && (
              <div className={`h-full w-full ${activeTabId === 'ecfBlocoY' ? 'block' : 'hidden'}`}>
                <EcfBlocoYModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={(title, subtitle, content) => 
                    handleOpenCustomPrintPreview({ titulo: title, subtitulo: subtitle, conteudo: content })
                  }
                />
              </div>
            )}

            {/* DIMOB (Declaração de Informações sobre Atividades Imobiliárias - IN RFB 1.987/2020) */}
            {isTabOpen('dimob') && (
              <div className={`h-full w-full ${activeTabId === 'dimob' ? 'block' : 'hidden'}`}>
                <DimobModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={(title, subtitle, content) => 
                    handleOpenCustomPrintPreview({ titulo: title, subtitulo: subtitle, conteudo: content })
                  }
                />
              </div>
            )}

            {/* DMED (Declaração de Serviços Médicos e de Saúde - IN RFB 2.072/2022) */}
            {isTabOpen('dmed') && (
              <div className={`h-full w-full ${activeTabId === 'dmed' ? 'block' : 'hidden'}`}>
                <DmedModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={(title, subtitle, content) => 
                    handleOpenCustomPrintPreview({ titulo: title, subtitulo: subtitle, conteudo: content })
                  }
                />
              </div>
            )}

            {/* EFD-Contribuições (PIS/PASEP e COFINS - IN RFB nº 1.252/2012) */}
            {isTabOpen('efdContribuicoes') && (
              <div className={`h-full w-full ${activeTabId === 'efdContribuicoes' ? 'block' : 'hidden'}`}>
                <EfdContribuicoesModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={(title, subtitle, content) => 
                    handleOpenCustomPrintPreview({ titulo: title, subtitulo: subtitle, conteudo: content })
                  }
                />
              </div>
            )}

            {/* Notas Explicativas às Demonstrações Contábeis (NBC TG 26 / CPC 26) */}
            {isTabOpen('notasExplicativas') && (
              <div className={`h-full w-full ${activeTabId === 'notasExplicativas' ? 'block' : 'hidden'}`}>
                <NotasExplicativasModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={(title, subtitle, content) => 
                    handleOpenCustomPrintPreview({ titulo: title, subtitulo: subtitle, conteudo: content })
                  }
                />
              </div>
            )}

            {/* GIA Eletrônica Estadual (ICMS / ST) & SINTEGRA */}
            {isTabOpen('giaSintegra') && (
              <div className={`h-full w-full ${activeTabId === 'giaSintegra' ? 'block' : 'hidden'}`}>
                <GiaSintegraModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={(title, subtitle, content) => 
                    handleOpenCustomPrintPreview({ titulo: title, subtitulo: subtitle, conteudo: content })
                  }
                />
              </div>
            )}

            {/* DIRF (IN RFB 1.990/2020) */}
            {isTabOpen('dirf') && (
              <div className={`h-full w-full ${activeTabId === 'dirf' ? 'block' : 'hidden'}`}>
                <DirfModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={(title, subtitle, content) => 
                    handleOpenCustomPrintPreview({ titulo: title, subtitulo: subtitle, conteudo: content })
                  }
                />
              </div>
            )}

            {/* Controle de Empréstimos, Financiamentos e Mútuos (CPC 38 / 48 / IFRS 9) */}
            {isTabOpen('emprestimosFinanciamentos') && (
              <div className={`h-full w-full ${activeTabId === 'emprestimosFinanciamentos' ? 'block' : 'hidden'}`}>
                <FinanciamentosMutuosModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={(title, subtitle, content) => 
                    handleOpenCustomPrintPreview({ titulo: title, subtitulo: subtitle, conteudo: content })
                  }
                />
              </div>
            )}

            {/* DIEF & Apuração de ISSQN Centralizada (LC 116/2003) */}
            {isTabOpen('issqnDief') && (
              <div className={`h-full w-full ${activeTabId === 'issqnDief' ? 'block' : 'hidden'}`}>
                <IssqnDiefModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={(title, subtitle, content) => 
                    handleOpenCustomPrintPreview({ titulo: title, subtitulo: subtitle, conteudo: content })
                  }
                />
              </div>
            )}

            {/* Central de Cruzamento e Malha Fina Eletrônica RFB */}
            {isTabOpen('malhaFinaAuditoria') && (
              <div className={`h-full w-full ${activeTabId === 'malhaFinaAuditoria' ? 'block' : 'hidden'}`}>
                <MalhaFinaAuditoriaModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={handleOpenCustomPrintPreview}
                />
              </div>
            )}

            {/* DEFIS - Declaração de Informações Socioeconômicas e Fiscais */}
            {isTabOpen('defis') && (
              <div className={`h-full w-full ${activeTabId === 'defis' ? 'block' : 'hidden'}`}>
                <DefisModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={handleOpenCustomPrintPreview}
                />
              </div>
            )}

            {/* Livro Caixa Digital & Apuração de Carnê-Leão */}
            {isTabOpen('carneLeao') && (
              <div className={`h-full w-full ${activeTabId === 'carneLeao' ? 'block' : 'hidden'}`}>
                <CarneLeaoModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={handleOpenCustomPrintPreview}
                />
              </div>
            )}

            {/* e-CAC & Caixa Postal Fiscal Eletrônica (DTE RFB / SEFAZ / CNDs) */}
            {isTabOpen('ecacCaixaPostal') && (
              <div className={`h-full w-full ${activeTabId === 'ecacCaixaPostal' ? 'block' : 'hidden'}`}>
                <EcacDteModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={handleOpenCustomPrintPreview}
                />
              </div>
            )}

            {/* Apuração do Fator R e Segregação Simples Nacional (LC 123/2006 Art. 18) */}
            {isTabOpen('fatorR') && (
              <div className={`h-full w-full ${activeTabId === 'fatorR' ? 'block' : 'hidden'}`}>
                <FatorRModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={handleOpenCustomPrintPreview}
                />
              </div>
            )}

            {/* Bens do Ativo Intangível e Amortização (CPC 04 / NBC TG 04 / IAS 38) */}
            {isTabOpen('ativoIntangivel') && (
              <div className={`h-full w-full ${activeTabId === 'ativoIntangivel' ? 'block' : 'hidden'}`}>
                <AtivoIntangivelModule
                  empresa={empresaAtiva}
                  onOpenReportPreview={handleOpenCustomPrintPreview}
                  onIntegracaoSucesso={() => {
                    setLancamentos(dbService.getLancamentos(empresaAtiva.id));
                  }}
                />
              </div>
            )}

            {/* Arrendamento Mercantil / Leasing (CPC 06 R2 / NBC TG 06 / IFRS 16) */}
            {isTabOpen('leasingCpc06') && (
              <div className={`h-full w-full ${activeTabId === 'leasingCpc06' ? 'block' : 'hidden'}`}>
                <LeasingCpc06Module
                  empresa={empresaAtiva}
                  onOpenReportPreview={handleOpenCustomPrintPreview}
                  onIntegracaoSucesso={() => {
                    setLancamentos(dbService.getLancamentos(empresaAtiva.id));
                  }}
                />
              </div>
            )}

            {/* ICMS Substituição Tributária (ICMS-ST) & DeSTDA (Convênio ICMS 142/2018) */}
            {isTabOpen('icmsSubstituicaoTributaria') && (
              <div className={`h-full w-full ${activeTabId === 'icmsSubstituicaoTributaria' ? 'block' : 'hidden'}`}>
                <IcmsStModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={handleOpenCustomPrintPreview}
                />
              </div>
            )}

            {/* Conciliação de Vendas em Cartões & Adquirentes (SPED Registro 1600) */}
            {isTabOpen('conciliacaoCartoes1600') && (
              <div className={`h-full w-full ${activeTabId === 'conciliacaoCartoes1600' ? 'block' : 'hidden'}`}>
                <ConciliacaoCartoes1600Module
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={handleOpenCustomPrintPreview}
                  onIntegracaoSucesso={() => {
                    setLancamentos(dbService.getLancamentos(empresaAtiva.id));
                  }}
                />
              </div>
            )}

            {/* Subvenções Governamentais para Investimentos (CPC 07 R1 / Leis 12.973 & 14.789) */}
            {isTabOpen('subvencoesIncentivos') && (
              <div className={`h-full w-full ${activeTabId === 'subvencoesIncentivos' ? 'block' : 'hidden'}`}>
                <SubvencoesGovernamentaisModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={handleOpenCustomPrintPreview}
                />
              </div>
            )}

            {/* Crédito Presumido de IPI Exportação e PIS/COFINS Agro (Leis 9.363/96 e 10.925/04) */}
            {isTabOpen('creditoPresumidoAgroIpi') && (
              <div className={`h-full w-full ${activeTabId === 'creditoPresumidoAgroIpi' ? 'block' : 'hidden'}`}>
                <CreditoPresumidoAgroIpiModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={handleOpenCustomPrintPreview}
                />
              </div>
            )}

            {/* Simulador de Transição da Reforma Tributária 2026 (EC 132/23 & PLP 68/24) */}
            {isTabOpen('reformaTributaria2026') && (
              <div className={`h-full w-full ${activeTabId === 'reformaTributaria2026' ? 'block' : 'hidden'}`}>
                <ReformaTributaria2026Module
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={handleOpenCustomPrintPreview}
                />
              </div>
            )}

            {/* Gestão de Ajuste a Valor Presente - AVP (CPC 12 / NBC TG 12 / Lei 11.638/07) */}
            {isTabOpen('avpCpc12') && (
              <div className={`h-full w-full ${activeTabId === 'avpCpc12' ? 'block' : 'hidden'}`}>
                <AjusteValorPresenteModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={handleOpenCustomPrintPreview}
                />
              </div>
            )}

            {/* Auditoria de Estoques e Bloco K Avançado (SPED K280 e K220 / Art. 303 RIR) */}
            {isTabOpen('blocoKAvancadoEstoque') && (
              <div className={`h-full w-full ${activeTabId === 'blocoKAvancadoEstoque' ? 'block' : 'hidden'}`}>
                <BlocoKAvancadoEstoqueModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={handleOpenCustomPrintPreview}
                />
              </div>
            )}

            {/* Apuração de Retenções Previdenciárias na Construção Civil (IN RFB 2.110/22 / CNO) */}
            {isTabOpen('retencoesConstrucaoCivil') && (
              <div className={`h-full w-full ${activeTabId === 'retencoesConstrucaoCivil' ? 'block' : 'hidden'}`}>
                <RetencoesConstrucaoCivilModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={handleOpenCustomPrintPreview}
                />
              </div>
            )}

            {/* Teste de Recuperabilidade de Ativos - Impairment Test (CPC 01 (R1) / NBC TG 01 (R4)) */}
            {isTabOpen('impairmentCpc01') && (
              <div className={`h-full w-full ${activeTabId === 'impairmentCpc01' ? 'block' : 'hidden'}`}>
                <ImpairmentCpc01Module
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={handleOpenCustomPrintPreview}
                />
              </div>
            )}

            {/* Apuração de Preços de Transferência - Transfer Pricing (Lei 14.596/23 / IN RFB 2.161/23) */}
            {isTabOpen('precosTransferencia') && (
              <div className={`h-full w-full ${activeTabId === 'precosTransferencia' ? 'block' : 'hidden'}`}>
                <PrecosTransferenciaModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={handleOpenCustomPrintPreview}
                />
              </div>
            )}

            {/* CIDE-Remessas e Tributação de Serviços Importados do Exterior (Lei 10.168/00 / IN RFB 1.455/14) */}
            {isTabOpen('cideRemessasExterior') && (
              <div className={`h-full w-full ${activeTabId === 'cideRemessasExterior' ? 'block' : 'hidden'}`}>
                <CideRemessasExteriorModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={handleOpenCustomPrintPreview}
                />
              </div>
            )}

            {/* Ativos Biológicos e Produtos Agrícolas (CPC 29 / NBC TG 29 / IAS 41) */}
            {isTabOpen('ativosBiologicosCpc29') && (
              <div className={`h-full w-full ${activeTabId === 'ativosBiologicosCpc29' ? 'block' : 'hidden'}`}>
                <AtivosBiologicosCpc29Module
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={handleOpenCustomPrintPreview}
                />
              </div>
            )}

            {/* Contratos de Construção & Incorporação Imobiliária - Método POC (CPC 47 / OCPC 01) */}
            {isTabOpen('construcaoPocCpc47') && (
              <div className={`h-full w-full ${activeTabId === 'construcaoPocCpc47' ? 'block' : 'hidden'}`}>
                <ConstrucaoPocCpc47Module
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={handleOpenCustomPrintPreview}
                />
              </div>
            )}

            {/* Demonstrações Consolidadas & Equivalência Patrimonial - MEP (CPC 18 / CPC 36) */}
            {isTabOpen('consolidacaoMepCpc18') && (
              <div className={`h-full w-full ${activeTabId === 'consolidacaoMepCpc18' ? 'block' : 'hidden'}`}>
                <ConsolidacaoMepCpc18Module
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={handleOpenCustomPrintPreview}
                />
              </div>
            )}

            {/* Apuração PIS/COFINS sobre Receitas Financeiras (Decreto 8.426/2015) */}
            {isTabOpen('pisCofinsReceitasFinanceiras') && (
              <div className={`h-full w-full ${activeTabId === 'pisCofinsReceitasFinanceiras' ? 'block' : 'hidden'}`}>
                <PisCofinsReceitasFinanceirasModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={(config) => 
                    handleOpenCustomPrintPreview({
                      titulo: config.titulo,
                      subtitulo: config.subtitulo,
                      conteudo: <div dangerouslySetInnerHTML={{ __html: config.conteudoHtml }} />
                    })
                  }
                />
              </div>
            )}

            {/* Controle de Combustíveis Monofásicos & Livro de Movimentação - LMC (Portaria ANP 26/92 & LC 192/22) */}
            {isTabOpen('combustiveisMonofasicoLmc') && (
              <div className={`h-full w-full ${activeTabId === 'combustiveisMonofasicoLmc' ? 'block' : 'hidden'}`}>
                <CombustiveisMonofasicoLmcModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={(config) => 
                    handleOpenCustomPrintPreview({
                      titulo: config.titulo,
                      subtitulo: config.subtitulo,
                      conteudo: <div dangerouslySetInnerHTML={{ __html: config.conteudoHtml }} />
                    })
                  }
                />
              </div>
            )}

            {/* Auditoria de Obrigações Acessórias e Cruzamento SPED ECD vs ECF vs EFD-Contribuições */}
            {isTabOpen('auditoriaSpedCruzamento') && (
              <div className={`h-full w-full ${activeTabId === 'auditoriaSpedCruzamento' ? 'block' : 'hidden'}`}>
                <AuditoriaSpedCruzamentoModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={(config) => 
                    handleOpenCustomPrintPreview({
                      titulo: config.titulo,
                      subtitulo: config.subtitulo,
                      conteudo: <div dangerouslySetInnerHTML={{ __html: config.conteudoHtml }} />
                    })
                  }
                />
              </div>
            )}

            {/* Apuração de IPI no Regime de Crédito Básico & Ressarcimento Trimestral (RIPI Decreto 7.212/10 / IN RFB 2.055/21) */}
            {isTabOpen('ipiCreditoBasico') && (
              <div className={`h-full w-full ${activeTabId === 'ipiCreditoBasico' ? 'block' : 'hidden'}`}>
                <IpiCreditoBasicoModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={(config) => 
                    handleOpenCustomPrintPreview({
                      titulo: config.titulo,
                      subtitulo: config.subtitulo,
                      conteudo: <div dangerouslySetInnerHTML={{ __html: config.conteudoHtml }} />
                    })
                  }
                />
              </div>
            )}

            {/* Hedge Accounting & Contabilidade de Derivativos (CPC 48 / NBC TG 48 / IFRS 9) */}
            {isTabOpen('hedgeAccountingCpc48') && (
              <div className={`h-full w-full ${activeTabId === 'hedgeAccountingCpc48' ? 'block' : 'hidden'}`}>
                <HedgeAccountingCpc48Module
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={(config) => 
                    handleOpenCustomPrintPreview({
                      titulo: config.titulo,
                      subtitulo: config.subtitulo,
                      conteudo: <div dangerouslySetInnerHTML={{ __html: config.conteudoHtml }} />
                    })
                  }
                />
              </div>
            )}

            {/* Controle e Apuração do RET - Regime Especial de Tributação (Lei 10.931/2004 / MCMV 1% e 4%) */}
            {isTabOpen('retIncorporacaoMcmv') && (
              <div className={`h-full w-full ${activeTabId === 'retIncorporacaoMcmv' ? 'block' : 'hidden'}`}>
                <RetIncorporacaoMcmvModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={(config) => 
                    handleOpenCustomPrintPreview({
                      titulo: config.titulo,
                      subtitulo: config.subtitulo,
                      conteudo: <div dangerouslySetInnerHTML={{ __html: config.conteudoHtml }} />
                    })
                  }
                />
              </div>
            )}

            {/* Contabilidade de Sociedades Cooperativas (Lei 5.764/71 / ITG 2004) */}
            {isTabOpen('cooperativasSobrasPerdas') && (
              <div className={`h-full w-full ${activeTabId === 'cooperativasSobrasPerdas' ? 'block' : 'hidden'}`}>
                <CooperativasSobrasPerdasModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={(config) => 
                    handleOpenCustomPrintPreview({
                      titulo: config.titulo,
                      subtitulo: config.subtitulo,
                      conteudo: <div dangerouslySetInnerHTML={{ __html: config.conteudoHtml }} />
                    })
                  }
                />
              </div>
            )}

            {/* Sistema de Crédito Acumulado de ICMS (e-CredAc SP / Portaria CAT 26/2010 / Art. 71 RICMS) */}
            {isTabOpen('creditoAcumuladoIcms') && (
              <div className={`h-full w-full ${activeTabId === 'creditoAcumuladoIcms' ? 'block' : 'hidden'}`}>
                <CreditoAcumuladoIcmsModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={(config) => 
                    handleOpenCustomPrintPreview({
                      titulo: config.titulo,
                      subtitulo: config.subtitulo,
                      conteudo: <div dangerouslySetInnerHTML={{ __html: config.conteudoHtml }} />
                    })
                  }
                />
              </div>
            )}

            {/* Ganho de Capital na Alienação de Bens do Ativo Permanente (Lei 13.259/2016 / IN RFB 1.500) */}
            {isTabOpen('ganhoCapitalAlienacao') && (
              <div className={`h-full w-full ${activeTabId === 'ganhoCapitalAlienacao' ? 'block' : 'hidden'}`}>
                <GanhoCapitalAlienacaoModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={(config) => 
                    handleOpenCustomPrintPreview({
                      titulo: config.titulo,
                      subtitulo: config.subtitulo,
                      conteudo: <div dangerouslySetInnerHTML={{ __html: config.conteudoHtml }} />
                    })
                  }
                />
              </div>
            )}

            {/* REINTEGRA - Ressarcimento Tributário a Exportadores (Lei 12.546/2011 / Dec. 8.415/2015) */}
            {isTabOpen('reintegraExportacao') && (
              <div className={`h-full w-full ${activeTabId === 'reintegraExportacao' ? 'block' : 'hidden'}`}>
                <ReintegraExportacaoModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={(config: any) => 
                    handleOpenCustomPrintPreview({
                      titulo: config.titulo,
                      subtitulo: config.subtitulo,
                      conteudo: <div dangerouslySetInnerHTML={{ __html: config.conteudoHtml }} />
                    })
                  }
                />
              </div>
            )}

            {/* IOF sobre Mútuos Intercompany & Operações de Crédito (Dec. 6.306/2007 / Lei 9.779/1999) */}
            {isTabOpen('iofMutuos') && (
              <div className={`h-full w-full ${activeTabId === 'iofMutuos' ? 'block' : 'hidden'}`}>
                <IofMutuosModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={(config) => 
                    handleOpenCustomPrintPreview({
                      titulo: config.titulo,
                      subtitulo: config.subtitulo,
                      conteudo: <div dangerouslySetInnerHTML={{ __html: config.conteudoHtml }} />
                    })
                  }
                />
              </div>
            )}

            {/* APA & Acordos Prévios de Preços de Transferência (Lei 14.596/2023 / IN RFB 2.161/2023) */}
            {isTabOpen('apaPrecosTransferencia') && (
              <div className={`h-full w-full ${activeTabId === 'apaPrecosTransferencia' ? 'block' : 'hidden'}`}>
                <ApaPrecosTransferenciaModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={(config) => 
                    handleOpenCustomPrintPreview({
                      titulo: config.titulo,
                      subtitulo: config.subtitulo,
                      conteudo: <div dangerouslySetInnerHTML={{ __html: config.conteudoHtml }} />
                    })
                  }
                />
              </div>
            )}

            {/* FCBF - Fundo de Compensação de Benefícios Fiscais (EC 132/2023 / Art. 159-A CF/88) */}
            {isTabOpen('fcbfCompensacao') && (
              <div className={`h-full w-full ${activeTabId === 'fcbfCompensacao' ? 'block' : 'hidden'}`}>
                <FcbfCompensacaoModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={(config) => 
                    handleOpenCustomPrintPreview({
                      titulo: config.titulo,
                      subtitulo: config.subtitulo,
                      conteudo: <div dangerouslySetInnerHTML={{ __html: config.conteudoHtml }} />
                    })
                  }
                />
              </div>
            )}

            {/* Depreciação Acelerada Incentivada (Lei 14.871/2024 / Dec. 12.175/2024) */}
            {isTabOpen('depreciacaoAceleradaIncentivada') && (
              <div className={`h-full w-full ${activeTabId === 'depreciacaoAceleradaIncentivada' ? 'block' : 'hidden'}`}>
                <DepreciacaoAceleradaIncentivadaModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={(config) => 
                    handleOpenCustomPrintPreview({
                      titulo: config.titulo,
                      subtitulo: config.subtitulo,
                      conteudo: <div dangerouslySetInnerHTML={{ __html: config.conteudoHtml }} />
                    })
                  }
                />
              </div>
            )}

            {/* Subcapitalização & Regras de Thin Capitalization (Lei 12.249/2010 Arts. 24 e 25 / IN RFB 1.154/2011) */}
            {isTabOpen('subcapitalizacaoThinCap') && (
              <div className={`h-full w-full ${activeTabId === 'subcapitalizacaoThinCap' ? 'block' : 'hidden'}`}>
                <SubcapitalizacaoThinCapModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={(config) => 
                    handleOpenCustomPrintPreview({
                      titulo: config.titulo,
                      subtitulo: config.subtitulo,
                      conteudo: <div dangerouslySetInnerHTML={{ __html: config.conteudoHtml }} />
                    })
                  }
                />
              </div>
            )}

            {/* Programa Mover - Mobilidade Verde & Descarbonização (Lei 14.902/2024 / Dec. 12.053/2024) */}
            {isTabOpen('programaMover') && (
              <div className={`h-full w-full ${activeTabId === 'programaMover' ? 'block' : 'hidden'}`}>
                <ProgramaMoverModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={(config) => 
                    handleOpenCustomPrintPreview({
                      titulo: config.titulo,
                      subtitulo: config.subtitulo,
                      conteudo: <div dangerouslySetInnerHTML={{ __html: config.conteudoHtml }} />
                    })
                  }
                />
              </div>
            )}

            {/* JCP - Juros sobre o Capital Próprio (Art. 9º Lei 9.249/95 / Lei 14.789/2023) */}
            {isTabOpen('jurosSobreCapitalProprio') && (
              <div className={`h-full w-full ${activeTabId === 'jurosSobreCapitalProprio' ? 'block' : 'hidden'}`}>
                <JcpApuracaoModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={(config) => 
                    handleOpenCustomPrintPreview({
                      titulo: config.titulo,
                      subtitulo: config.subtitulo,
                      conteudo: <div dangerouslySetInnerHTML={{ __html: config.conteudoHtml }} />
                    })
                  }
                />
              </div>
            )}

            {/* CPR Agro & Hedge de Commodities (Lei 13.986/2020 / CPC 48 / IFRS 9 - Barter e B3) */}
            {isTabOpen('cprAgronegocio') && (
              <div className={`h-full w-full ${activeTabId === 'cprAgronegocio' ? 'block' : 'hidden'}`}>
                <CprAgroHedgeModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={(config) => 
                    handleOpenCustomPrintPreview({
                      titulo: config.titulo,
                      subtitulo: config.subtitulo,
                      conteudo: <div dangerouslySetInnerHTML={{ __html: config.conteudoHtml }} />
                    })
                  }
                />
              </div>
            )}

            {/* REIDI - Regime Especial de Incentivos para a Infraestrutura (Lei 11.488/2007) */}
            {isTabOpen('reidiInfraestrutura') && (
              <div className={`h-full w-full ${activeTabId === 'reidiInfraestrutura' ? 'block' : 'hidden'}`}>
                <ReidiInfraestruturaModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={(config) => 
                    handleOpenCustomPrintPreview({
                      titulo: config.titulo,
                      subtitulo: config.subtitulo,
                      conteudo: <div dangerouslySetInnerHTML={{ __html: config.conteudoHtml }} />
                    })
                  }
                />
              </div>
            )}

            {/* Prejuízos Fiscais & Trava de 30% no LALUR (Arts. 509 a 515 RIR/2018 / Lei 9.065/95) */}
            {isTabOpen('prejuizosFiscaisLalur') && (
              <div className={`h-full w-full ${activeTabId === 'prejuizosFiscaisLalur' ? 'block' : 'hidden'}`}>
                <PrejuizosFiscaisLalurModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={(config) => 
                    handleOpenCustomPrintPreview({
                      titulo: config.titulo,
                      subtitulo: config.subtitulo,
                      conteudo: <div dangerouslySetInnerHTML={{ __html: config.conteudoHtml }} />
                    })
                  }
                />
              </div>
            )}

            {/* Créditos de Descarbonização do RenovaBio - CBIOs na B3 (Lei 13.576/2017 / OCPC 08) */}
            {isTabOpen('cbiosRenovabio') && (
              <div className={`h-full w-full ${activeTabId === 'cbiosRenovabio' ? 'block' : 'hidden'}`}>
                <CbiosRenovabioModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={(config) => 
                    handleOpenCustomPrintPreview({
                      titulo: config.titulo,
                      subtitulo: config.subtitulo,
                      conteudo: <div dangerouslySetInnerHTML={{ __html: config.conteudoHtml }} />
                    })
                  }
                />
              </div>
            )}

            {/* Drawback Integrado - Comércio Exterior (Portaria Secex 44/2020 / Dec. 6.759/2009) */}
            {isTabOpen('drawbackIntegrado') && (
              <div className={`h-full w-full ${activeTabId === 'drawbackIntegrado' ? 'block' : 'hidden'}`}>
                <DrawbackIntegradoModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={(config) => 
                    handleOpenCustomPrintPreview({
                      titulo: config.titulo,
                      subtitulo: config.subtitulo,
                      conteudo: <div dangerouslySetInnerHTML={{ __html: config.conteudoHtml }} />
                    })
                  }
                />
              </div>
            )}

            {/* Debêntures Incentivadas e de Infraestrutura (Lei 14.801/2024 / Lei 12.431/2011 / CPC 48) */}
            {isTabOpen('debenturesIncentivadas') && (
              <div className={`h-full w-full ${activeTabId === 'debenturesIncentivadas' ? 'block' : 'hidden'}`}>
                <DebenturesIncentivadasModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={(config) => 
                    handleOpenCustomPrintPreview({
                      titulo: config.titulo,
                      subtitulo: config.subtitulo,
                      conteudo: <div dangerouslySetInnerHTML={{ __html: config.conteudoHtml }} />
                    })
                  }
                />
              </div>
            )}

            {/* Incentivos Regionais de IRPJ - SUDENE e SUDAM (MP 2.199-14/2001 / Lei 13.799/2018) */}
            {isTabOpen('incentivosSudeneSudam') && (
              <div className={`h-full w-full ${activeTabId === 'incentivosSudeneSudam' ? 'block' : 'hidden'}`}>
                <IncentivosSudeneSudamModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={(config) => 
                    handleOpenCustomPrintPreview({
                      titulo: config.titulo,
                      subtitulo: config.subtitulo,
                      conteudo: <div dangerouslySetInnerHTML={{ __html: config.conteudoHtml }} />
                    })
                  }
                />
              </div>
            )}

            {/* Subvenções para Investimento (Lei 14.789/2023 / IN RFB 2.170/2023 / CPC 07) */}
            {isTabOpen('subvencoesInvestimentoLei14789') && (
              <div className={`h-full w-full ${activeTabId === 'subvencoesInvestimentoLei14789' ? 'block' : 'hidden'}`}>
                <SubvencoesInvestimentoModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={(config) => 
                    handleOpenCustomPrintPreview({
                      titulo: config.titulo,
                      subtitulo: config.subtitulo,
                      conteudo: <div dangerouslySetInnerHTML={{ __html: config.conteudoHtml }} />
                    })
                  }
                />
              </div>
            )}

            {/* Contratos de Concessão de Serviços Públicos (ICPC 01 (R1) / IFRIC 12 / CPC 47) */}
            {isTabOpen('concessoesPublicasIcpc01') && (
              <div className={`h-full w-full ${activeTabId === 'concessoesPublicasIcpc01' ? 'block' : 'hidden'}`}>
                <ConcessoesPublicasModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={(config) => 
                    handleOpenCustomPrintPreview({
                      titulo: config.titulo,
                      subtitulo: config.subtitulo,
                      conteudo: <div dangerouslySetInnerHTML={{ __html: config.conteudoHtml }} />
                    })
                  }
                />
              </div>
            )}

            {/* Revisão Periódica de Vidas Úteis & Teste de Recuperabilidade (CPC 27 item 51 / CPC 01 (R1) / NBC TG 01) */}
            {isTabOpen('revisaoVidasUteisImpairment') && (
              <div className={`h-full w-full ${activeTabId === 'revisaoVidasUteisImpairment' ? 'block' : 'hidden'}`}>
                <RevisaoVidasUteisModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={(config) => 
                    handleOpenCustomPrintPreview({
                      titulo: config.titulo,
                      subtitulo: config.subtitulo,
                      conteudo: <div dangerouslySetInnerHTML={{ __html: config.conteudoHtml }} />
                    })
                  }
                />
              </div>
            )}

            {/* Créditos de PIS e COFINS sobre Ativo Imobilizado (Lei nº 10.833/2003 / Bloco F120 e F130) */}
            {isTabOpen('creditoPisCofinsImobilizado') && (
              <div className={`h-full w-full ${activeTabId === 'creditoPisCofinsImobilizado' ? 'block' : 'hidden'}`}>
                <CreditoPisCofinsImobilizadoModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={(config) => 
                    handleOpenCustomPrintPreview({
                      titulo: config.titulo,
                      subtitulo: config.subtitulo,
                      conteudo: <div dangerouslySetInnerHTML={{ __html: config.conteudoHtml }} />
                    })
                  }
                />
              </div>
            )}

            {/* Remuneração Baseada em Ações - Stock Options & Phantom Shares (CPC 10 (R1) / IFRS 2 / Tema 1.226 STJ) */}
            {isTabOpen('remuneracaoAcoesCpc10') && (
              <div className={`h-full w-full ${activeTabId === 'remuneracaoAcoesCpc10' ? 'block' : 'hidden'}`}>
                <RemuneracaoAcoesModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={(config) => 
                    handleOpenCustomPrintPreview({
                      titulo: config.titulo,
                      subtitulo: config.subtitulo,
                      conteudo: <div dangerouslySetInnerHTML={{ __html: config.conteudoHtml }} />
                    })
                  }
                />
              </div>
            )}

            {/* Planos de Benefícios Pós-Emprego e Avaliação Atuarial (CPC 33 (R1) / IAS 19 / Previdência Complementar) */}
            {isTabOpen('beneficiosPosEmpregoCpc33') && (
              <div className={`h-full w-full ${activeTabId === 'beneficiosPosEmpregoCpc33' ? 'block' : 'hidden'}`}>
                <BeneficiosPosEmpregoModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={(config) => 
                    handleOpenCustomPrintPreview({
                      titulo: config.titulo,
                      subtitulo: config.subtitulo,
                      conteudo: <div dangerouslySetInnerHTML={{ __html: config.conteudoHtml }} />
                    })
                  }
                />
              </div>
            )}

            {/* Análise Econômico-Financeira das Demonstrações Contábeis (NBC TG / CFC / Domínio Contábil) */}
            {isTabOpen('analiseDemonstracoesCfc') && (
              <div className={`h-full w-full ${activeTabId === 'analiseDemonstracoesCfc' ? 'block' : 'hidden'}`}>
                <AnaliseDemonstracoesModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={(config) => 
                    handleOpenCustomPrintPreview({
                      titulo: config.titulo,
                      subtitulo: config.subtitulo,
                      conteudo: <div dangerouslySetInnerHTML={{ __html: config.conteudoHtml }} />
                    })
                  }
                />
              </div>
            )}

            {/* Gestão de Honorários Contábeis & Contratos (Domínio Honorários / Res. CFC 1.457/2013) */}
            {isTabOpen('honorariosContabeis') && (
              <div className={`h-full w-full ${activeTabId === 'honorariosContabeis' ? 'block' : 'hidden'}`}>
                <HonorariosContabeisModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={(config) => 
                    handleOpenCustomPrintPreview({
                      titulo: config.titulo,
                      subtitulo: config.subtitulo,
                      conteudo: <div dangerouslySetInnerHTML={{ __html: config.conteudoHtml }} />
                    })
                  }
                />
              </div>
            )}

            {/* Sicalc & Memória de Acréscimos Legais DARF (Lei nº 9.430/1996 Art. 61 / Domínio SicalcAA) */}
            {isTabOpen('sicalcAcrescimosDarf') && (
              <div className={`h-full w-full ${activeTabId === 'sicalcAcrescimosDarf' ? 'block' : 'hidden'}`}>
                <SicalcAcrescimosDarfModule
                  empresaAtiva={empresaAtiva}
                  onOpenReportPreview={(config) => 
                    handleOpenCustomPrintPreview({
                      titulo: config.titulo,
                      subtitulo: config.subtitulo,
                      conteudo: <div dangerouslySetInnerHTML={{ __html: config.conteudoHtml }} />
                    })
                  }
                />
              </div>
            )}

            {/* DIOPS ANS - Saúde Suplementar & Provisões Técnicas Regulatórias (RN nº 518/2022) */}
            {isTabOpen('diopsAns') && (
              <div className={`h-full w-full ${activeTabId === 'diopsAns' ? 'block' : 'hidden'}`}>
                <DiopsAnsModule />
              </div>
            )}

            {/* CPRB - Desoneração da Folha de Pagamento & Evento R-2060 EFD-Reinf (Lei nº 12.546/2011) */}
            {isTabOpen('cprbDesoneracao') && (
              <div className={`h-full w-full ${activeTabId === 'cprbDesoneracao' ? 'block' : 'hidden'}`}>
                <CprbDesoneracaoModule />
              </div>
            )}

            {/* PIS e COFINS das Entidades Financeiras & Equiparadas (Lei nº 9.718/1998 Art. 3º § 6º) */}
            {isTabOpen('pisCofinsFinanceiras') && (
              <div className={`h-full w-full ${activeTabId === 'pisCofinsFinanceiras' ? 'block' : 'hidden'}`}>
                <PisCofinsInstituicoesFinanceirasModule />
              </div>
            )}

            {/* Declarações Estaduais ICMS - DIME SC, DAPI MG, DIEF CE/MA */}
            {isTabOpen('declaracoesEstaduais') && (
              <div className={`h-full w-full ${activeTabId === 'declaracoesEstaduais' ? 'block' : 'hidden'}`}>
                <DeclaracoesEstaduaisIcmsModule />
              </div>
            )}

            {/* Balanço de Abertura & Transição do Livro Caixa (ITG 1000 / NBC TG 1000) */}
            {isTabOpen('balancoAbertura') && (
              <div className={`h-full w-full ${activeTabId === 'balancoAbertura' ? 'block' : 'hidden'}`}>
                <BalancoAberturaModule />
              </div>
            )}

            {/* RET Imobiliário & Sociedade em Conta de Participação - SCP (Lei 10.931/2004 / IN RFB 2.179/2024) */}
            {isTabOpen('retImobiliarioScp') && (
              <div className={`h-full w-full ${activeTabId === 'retImobiliarioScp' ? 'block' : 'hidden'}`}>
                <RetImobiliarioScpModule />
              </div>
            )}

            {/* Zona Franca de Manaus & Benefícios SUFRAMA (Dec-Lei 288/1967 / Lei 10.996/2004) */}
            {isTabOpen('zfmSuframa') && (
              <div className={`h-full w-full ${activeTabId === 'zfmSuframa' ? 'block' : 'hidden'}`}>
                <ZfmSuframaModule />
              </div>
            )}

            {/* DIFAL Consumidor Final & FECOEP (EC nº 87/2015 / LC nº 190/2022) */}
            {isTabOpen('difalNaoContribuinteFcp') && (
              <div className={`h-full w-full ${activeTabId === 'difalNaoContribuinteFcp' ? 'block' : 'hidden'}`}>
                <DifalNaoContribuinteFcpModule />
              </div>
            )}

            {/* Retenção Previdenciária em Cessão de Mão de Obra e Empreitada (Lei 8.212/1991 / IN RFB 2.110/2022) */}
            {isTabOpen('cessaoMaoDeObraRetencoes') && (
              <div className={`h-full w-full ${activeTabId === 'cessaoMaoDeObraRetencoes' ? 'block' : 'hidden'}`}>
                <CessaoMaoDeObraRetencoesModule />
              </div>
            )}

            {/* Simples Nacional - Regime de Caixa (Res. CGSN 140/2018 / LC 123/2006 Art. 18 § 3º) */}
            {isTabOpen('simplesRegimeCaixa') && (
              <div className={`h-full w-full ${activeTabId === 'simplesRegimeCaixa' ? 'block' : 'hidden'}`}>
                <SimplesNacionalRegimeCaixaModule />
              </div>
            )}

            {/* Crédito Presumido de PIS e COFINS no Agronegócio (Art. 8º Lei 10.925/2004 / IN RFB 2.121/2022) */}
            {isTabOpen('creditoPresumidoAgro') && (
              <div className={`h-full w-full ${activeTabId === 'creditoPresumidoAgro' ? 'block' : 'hidden'}`}>
                <CreditoPresumidoAgroPisCofinsModule />
              </div>
            )}

            {/* Substituição Tributária de PIS e COFINS Monofásico/ST (Leis 10.485/02, 9.718/98 & 10.147/00) */}
            {isTabOpen('substituicaoPisCofins') && (
              <div className={`h-full w-full ${activeTabId === 'substituicaoPisCofins' ? 'block' : 'hidden'}`}>
                <SubstituicaoTributariaPisCofinsModule />
              </div>
            )}

            {/* Subvenções para Investimento - Marco Novo (Lei nº 14.789/2023 / IN RFB 2.170/2023) */}
            {isTabOpen('subvencoesInvestimentoNovo') && (
              <div className={`h-full w-full ${activeTabId === 'subvencoesInvestimentoNovo' ? 'block' : 'hidden'}`}>
                <SubvencoesInvestimentoNovoModule />
              </div>
            )}

            {/* PIS/COFINS Importação & Adicional de 1% (Lei nº 10.865/2004 / IN RFB 2.121/2022) */}
            {isTabOpen('pisCofinsImportacao') && (
              <div className={`h-full w-full ${activeTabId === 'pisCofinsImportacao' ? 'block' : 'hidden'}`}>
                <PisCofinsImportacaoModule />
              </div>
            )}

            {/* Terceiro Setor & Entidades Sem Fins Lucrativos (ITG 2002 R1 / LC 187/2021) */}
            {isTabOpen('entidadesSemFinsLucrativos') && (
              <div className={`h-full w-full ${activeTabId === 'entidadesSemFinsLucrativos' ? 'block' : 'hidden'}`}>
                <EntidadesSemFinsLucrativosModule />
              </div>
            )}

            {/* Drawback Intermediário (Decreto nº 6.759/2009 / Portaria SECEX) */}
            {isTabOpen('drawbackIntermediario') && (
              <div className={`h-full w-full ${activeTabId === 'drawbackIntermediario' ? 'block' : 'hidden'}`}>
                <DrawbackIntermediarioModule />
              </div>
            )}

            {/* Retenções Federais na Fonte & EFD-Reinf Série R-4000 (IN RFB nº 2.043/2021 & 2.145/2023) */}
            {isTabOpen('retencoesReinf4000') && (
              <div className={`h-full w-full ${activeTabId === 'retencoesReinf4000' ? 'block' : 'hidden'}`}>
                <RetencoesReinf4000Module />
              </div>
            )}

            {/* FCI - Ficha de Conteúdo de Importação (Resolução SF 13/2012 / Convênio ICMS 38/2013) */}
            {isTabOpen('fci') && (
              <div className={`h-full w-full ${activeTabId === 'fci' ? 'block' : 'hidden'}`}>
                <FciModule />
              </div>
            )}

            {/* DIME-SC & DCIP (Portaria SEF nº 286/1995 / SAT-SC) */}
            {isTabOpen('dimeDcip') && (
              <div className={`h-full w-full ${activeTabId === 'dimeDcip' ? 'block' : 'hidden'}`}>
                <DimeDcipModule />
              </div>
            )}

            {/* Siscred PR - Créditos Acumulados de ICMS (NPF nº 084/2017 & Dec. 7.871/2017) */}
            {isTabOpen('siscredParana') && (
              <div className={`h-full w-full ${activeTabId === 'siscredParana' ? 'block' : 'hidden'}`}>
                <SiscredParanaModule />
              </div>
            )}

            {/* DeRE - Demonstração de Recursos e Encargos / Balancete Regulatório (Schemas XSD v1.1.0) */}
            {isTabOpen('dereEconomico') && (
              <div className={`h-full w-full ${activeTabId === 'dereEconomico' ? 'block' : 'hidden'}`}>
                <DereEconomicoModule />
              </div>
            )}

            {/* Fundos de Equilíbrio Fiscal Estaduais (FEEF / FOT / PROTEGE - Convênio ICMS 42/2016) */}
            {isTabOpen('fundosEquilibrioFiscal') && (
              <div className={`h-full w-full ${activeTabId === 'fundosEquilibrioFiscal' ? 'block' : 'hidden'}`}>
                <FundosEquilibrioFiscalModule />
              </div>
            )}

            {/* SCP - Sociedade em Conta de Participação (CC Arts. 991-996 / IN RFB 2.179/2024) */}
            {isTabOpen('scpSociedade') && (
              <div className={`h-full w-full ${activeTabId === 'scpSociedade' ? 'block' : 'hidden'}`}>
                <ScpSociedadeContaParticipacaoModule />
              </div>
            )}

            {/* Apuração de Estoques & Métodos de Custeio (CPC 16 R1 / RIR 2018 / Domínio esapuracaoestoque.pbd) */}
            {isTabOpen('apuracaoEstoquesCusteio') && (
              <div className={`h-full w-full ${activeTabId === 'apuracaoEstoquesCusteio' ? 'block' : 'hidden'}`}>
                <ApuracaoEstoquesCusteioModule />
              </div>
            )}

            {/* CT-e & MDF-e Transporte Rodoviário de Cargas & Crédito ICMS (Ajuste SINIEF 09/2007 / Domínio esifixocte01.pbd) */}
            {isTabOpen('cteTransporteFrete') && (
              <div className={`h-full w-full ${activeTabId === 'cteTransporteFrete' ? 'block' : 'hidden'}`}>
                <CteTransporteFreteModule />
              </div>
            )}

            {/* SPED ECF Bloco V & Bloco X - DEREX & Operações no Exterior (IN RFB 2.003/2021 / Domínio ctspedecf01.pbd) */}
            {isTabOpen('derexSpedEcf') && (
              <div className={`h-full w-full ${activeTabId === 'derexSpedEcf' ? 'block' : 'hidden'}`}>
                <DerexSpedEcfModule />
              </div>
            )}

            {/* DAPI-MG Modelo 01 - Declaração de Apuração do ICMS (RICMS-MG Dec. 48.589/23 / Domínio esrmg01.pbd) */}
            {isTabOpen('dapiMgIcms') && (
              <div className={`h-full w-full ${activeTabId === 'dapiMgIcms' ? 'block' : 'hidden'}`}>
                <DapiMgIcmsModule />
              </div>
            )}

            {/* PCLD - Provisão para Perdas em Créditos de Liquidação Duvidosa (CPC 48 / Lei 9.430/96 Arts. 9-14) */}
            {isTabOpen('pcldPerdasCreditos') && (
              <div className={`h-full w-full ${activeTabId === 'pcldPerdasCreditos' ? 'block' : 'hidden'}`}>
                <PcldPerdasCreditosModule />
              </div>
            )}

            {/* DCTF Mensal Tradicional - Declaração de Débitos e Créditos Tributários Federais (IN RFB 2.005/2021 / Domínio esr17.pbd) */}
            {isTabOpen('dctfMensalTradicional') && (
              <div className={`h-full w-full ${activeTabId === 'dctfMensalTradicional' ? 'block' : 'hidden'}`}>
                <DctfMensalModule />
              </div>
            )}

            {/* eSocial S-1200 & S-1210 - Remuneração e Pagamentos da Folha (MOS v. S-1.3 Oficial) */}
            {isTabOpen('esocialRemuneracaoPgtos') && (
              <div className={`h-full w-full ${activeTabId === 'esocialRemuneracaoPgtos' ? 'block' : 'hidden'}`}>
                <ESocialRemuneracaoPgtosModule />
              </div>
            )}

            {/* ECD Bloco J - Demonstrações Contábeis Regulatórias (Leiaute 9 / IN RFB 2.003 / Domínio ctr07.pbd) */}
            {isTabOpen('ecdDemonstracoesBlocoJ') && (
              <div className={`h-full w-full ${activeTabId === 'ecdDemonstracoesBlocoJ' ? 'block' : 'hidden'}`}>
                <EcdDemonstracoesBlocoJModule />
              </div>
            )}

            {/* Apuração do IPI & Selos de Controle - Livro Modelo 8 (Dec. 7.212/2010 RIPI / Domínio esm15.pbd) */}
            {isTabOpen('ipiSelosControle') && (
              <div className={`h-full w-full ${activeTabId === 'ipiSelosControle' ? 'block' : 'hidden'}`}>
                <IpiSelosControleModule />
              </div>
            )}

            {/* Equivalência Patrimonial Avançada & Mais-Valia de Ativos (CPC 15 / CPC 18 / Lei 12.973 / Domínio ctc04.pbd) */}
            {isTabOpen('mepMaisValiaAgio') && (
              <div className={`h-full w-full ${activeTabId === 'mepMaisValiaAgio' ? 'block' : 'hidden'}`}>
                <MepMaisValiaAgioModule />
              </div>
            )}

            {/* SPED Fiscal Bloco D - Serviços de Transporte & Comunicação (Guia Prático EFD v3.1.6 / Domínio esr45.pbd) */}
            {isTabOpen('spedFiscalBlocoD') && (
              <div className={`h-full w-full ${activeTabId === 'spedFiscalBlocoD' ? 'block' : 'hidden'}`}>
                <SpedFiscalBlocoDModule />
              </div>
            )}

            {/* eSocial S-2220 & S-2240 - Saúde e Segurança do Trabalho / SST & PPP Eletrônico (Portaria MTP/RFB 02/2021) */}
            {isTabOpen('sstESocialS2220S2240') && (
              <div className={`h-full w-full ${activeTabId === 'sstESocialS2220S2240' ? 'block' : 'hidden'}`}>
                <SstESocialS2220S2240Module />
              </div>
            )}

            {/* eSocial S-2210 - Comunicação de Acidente de Trabalho / CAT (Portaria SEPRT 4.334/2021) */}
            {isTabOpen('catESocialS2210') && (
              <div className={`h-full w-full ${activeTabId === 'catESocialS2210' ? 'block' : 'hidden'}`}>
                <CatESocialS2210Module />
              </div>
            )}

            {/* SPED Contribuições Bloco 1 - Processos Judiciais & Exclusão ICMS Tema 69 STF */}
            {isTabOpen('spedContribuicoesBloco1') && (
              <div className={`h-full w-full ${activeTabId === 'spedContribuicoesBloco1' ? 'block' : 'hidden'}`}>
                <SpedContribuicoesBloco1Module />
              </div>
            )}

            {/* Consolidação de Demonstrações Contábeis CPC 36 (R3) / NBC TG 36 / Lei 6.404/76 */}
            {isTabOpen('consolidacaoCpc36') && (
              <div className={`h-full w-full ${activeTabId === 'consolidacaoCpc36' ? 'block' : 'hidden'}`}>
                <ConsolidacaoDemonstracoesCpc36Module />
              </div>
            )}

            {/* eSocial TSVE S-2300 / S-2306 / S-2399 - Trabalhador Sem Vínculo de Emprego */}
            {isTabOpen('tsveESocialS2300') && (
              <div className={`h-full w-full ${activeTabId === 'tsveESocialS2300' ? 'block' : 'hidden'}`}>
                <TsveESocialS2300Module empresaId={empresaAtiva?.id || 1} />
              </div>
            )}

            {/* SPED ECF Bloco P - Apuração do Lucro Presumido (IRPJ & CSLL) */}
            {isTabOpen('lucroPresumidoEcfP') && (
              <div className={`h-full w-full ${activeTabId === 'lucroPresumidoEcfP' ? 'block' : 'hidden'}`}>
                <LucroPresumidoEcfBlocoPModule empresaId={empresaAtiva?.id || 1} />
              </div>
            )}

            {/* EFD-Reinf Série R-4000 - Retenções na Fonte (R-4010, R-4020, R-4040, R-4080) */}
            {isTabOpen('reinfSerieR4000') && (
              <div className={`h-full w-full ${activeTabId === 'reinfSerieR4000' ? 'block' : 'hidden'}`}>
                <ReinfSerieR4000Module empresaId={empresaAtiva?.id || 1} />
              </div>
            )}

            {/* eSocial S-1260 & S-1280 - Comercialização Rural & Desoneração CPRB */}
            {isTabOpen('esocialRuralS1260') && (
              <div className={`h-full w-full ${activeTabId === 'esocialRuralS1260' ? 'block' : 'hidden'}`}>
                <EsocialEventosPeriodicosS1260S1280Module empresaId={empresaAtiva?.id || 1} />
              </div>
            )}

            {/* SPED ECF Bloco N - Apuração do Lucro Real (IRPJ & CSLL) */}
            {isTabOpen('lucroRealEcfBlocoN') && (
              <div className={`h-full w-full ${activeTabId === 'lucroRealEcfBlocoN' ? 'block' : 'hidden'}`}>
                <LucroRealEcfBlocoNModule empresaId={empresaAtiva?.id || 1} />
              </div>
            )}

            {/* SPED Fiscal Bloco E - Apuração Oficial ICMS, ST e DIFAL */}
            {isTabOpen('spedFiscalBlocoE') && (
              <div className={`h-full w-full ${activeTabId === 'spedFiscalBlocoE' ? 'block' : 'hidden'}`}>
                <SpedFiscalBlocoEModule empresaId={empresaAtiva?.id || 1} />
              </div>
            )}

            {/* eSocial S-2500 & S-2501 - Processos Trabalhistas e Tributos Judiciais */}
            {isTabOpen('processosESocialS2500') && (
              <div className={`h-full w-full ${activeTabId === 'processosESocialS2500' ? 'block' : 'hidden'}`}>
                <ProcessosTrabalhistasESocialS2500Module empresaId={empresaAtiva?.id || 1} />
              </div>
            )}

            {/* SPED ECF Bloco X - Operações com o Exterior & Preços de Transferência */}
            {isTabOpen('operacoesExteriorEcfBlocoX') && (
              <div className={`h-full w-full ${activeTabId === 'operacoesExteriorEcfBlocoX' ? 'block' : 'hidden'}`}>
                <OperacoesExteriorEcfBlocoXModule empresaId={empresaAtiva?.id || 1} />
              </div>
            )}

            {/* SPED Fiscal Bloco 1 - Meios de Pagamento Eletrônico (1601), Créditos Acumulados & IPM */}
            {isTabOpen('spedFiscalBloco1') && (
              <div className={`h-full w-full ${activeTabId === 'spedFiscalBloco1' ? 'block' : 'hidden'}`}>
                <SpedFiscalBloco1Module empresaId={empresaAtiva?.id || 1} />
              </div>
            )}
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

      {/* 7. Modal de Alerta de Permissão Negada (RBAC Fluent) */}
      {accessDeniedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#181818] border border-rose-500/30 rounded-xl shadow-2xl max-w-md w-full p-6 text-neutral-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <ShieldAlert size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-base text-neutral-100">Acesso Restrito (RBAC)</h3>
                <p className="text-xs text-neutral-400">Controle de Segurança Corporativo</p>
              </div>
            </div>
            
            <p className="text-sm text-neutral-300 leading-relaxed mb-4">
              O seu perfil de usuário atual (<span className="font-semibold text-rose-400">{accessDeniedNotice.role}</span>) não possui privilégios para acessar o módulo <span className="font-semibold text-neutral-100">"{accessDeniedNotice.title}"</span>.
            </p>
            <p className="text-xs text-neutral-400 bg-neutral-900/60 p-3 rounded-lg border border-white/5 mb-6">
              Caso necessite de autorização, solicite ao Administrador / Contador Chefe a inclusão da respectiva permissão no cadastro de usuários.
            </p>

            <div className="flex justify-end">
              <button
                onClick={() => setAccessDeniedNotice(null)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg border border-white/10 transition"
              >
                Compreendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
