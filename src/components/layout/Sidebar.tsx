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
          { id: 'ativoImobilizado', title: 'Ativo Imobilizado & Depreciação', icon: Archive, badge: 'CPC 27' },
          { id: 'ativoIntangivel', title: 'Ativo Intangível (CPC 04)', icon: Sparkles, badge: 'CPC 04' },
          { id: 'leasingCpc06', title: 'Leasing & Direito de Uso', icon: KeyRound, badge: 'CPC 06' },
          { id: 'subvencoesIncentivos', title: 'Subvenções CPC 07 (R1)', icon: Landmark, badge: 'LEI 14789' },
          { id: 'avpCpc12', title: 'Ajuste a Valor Presente (AVP)', icon: Calculator, badge: 'CPC 12' },
          { id: 'impairmentCpc01', title: 'Impairment de Ativos (CPC 01)', icon: Scale, badge: 'CPC 01' },
          { id: 'precosTransferencia', title: 'Preços de Transferência', icon: Globe2, badge: 'OCDE' },
          { id: 'ativosBiologicosCpc29', title: 'Ativos Biológicos (CPC 29)', icon: Sprout, badge: 'CPC 29' },
          { id: 'construcaoPocCpc47', title: 'Construção & POC (CPC 47)', icon: HardHat, badge: 'CPC 47' },
          { id: 'consolidacaoMepCpc18', title: 'Consolidação & MEP (CPC 18)', icon: Network, badge: 'CPC 18' },
          { id: 'hedgeAccountingCpc48', title: 'Hedge Accounting & Derivativos', icon: ShieldCheck, badge: 'CPC 48' },
          { id: 'cooperativasSobrasPerdas', title: 'Cooperativas & Sobras/Perdas', icon: HeartHandshake, badge: 'LEI 5764' },
          { id: 'ganhoCapitalAlienacao', title: 'Ganho de Capital no Ativo', icon: TrendingUp, badge: 'LEI 13259' },
          { id: 'iofMutuos', title: 'IOF Mútuos Intercompany', icon: Coins, badge: 'RIOF' },
          { id: 'apaPrecosTransferencia', title: 'APA & Transfer Pricing', icon: ShieldCheck, badge: 'OCDE' },
          { id: 'depreciacaoAceleradaIncentivada', title: 'Depreciação Acelerada Incentivada', icon: Factory, badge: 'LEI 14871' },
          { id: 'subcapitalizacaoThinCap', title: 'Subcapitalização & Thin Cap', icon: Scale, badge: 'LEI 12249' },
          { id: 'jurosSobreCapitalProprio', title: 'JCP - Juros s/ Capital Próprio', icon: Coins, badge: 'LEI 14789' },
          { id: 'cprAgronegocio', title: 'CPR Agro & Hedge (CPC 48)', icon: Sprout, badge: 'B3/CERC' },
          { id: 'prejuizosFiscaisLalur', title: 'Prejuízos Fiscais (Trava 30%)', icon: Scale, badge: 'RIR/18' },
          { id: 'cbiosRenovabio', title: 'CBIOs RenovaBio & B3 (OCPC 08)', icon: Leaf, badge: 'B3' },
          { id: 'debenturesIncentivadas', title: 'Debêntures Infraestrutura', icon: Coins, badge: 'LEI 14801' },
          { id: 'incentivosSudeneSudam', title: 'Incentivos SUDENE & SUDAM', icon: Compass, badge: '75% IRPJ' },
          { id: 'subvencoesInvestimentoLei14789', title: 'Subvenções Investimento', icon: Award, badge: 'LEI 14789' },
          { id: 'concessoesPublicasIcpc01', title: 'Concessões Públicas (ICPC 01)', icon: Layers, badge: 'IFRIC 12' },
          { id: 'revisaoVidasUteisImpairment', title: 'Revisão Vidas Úteis & Impairment', icon: RotateCcw, badge: 'CPC 27/01' },
          { id: 'remuneracaoAcoesCpc10', title: 'Stock Options & Ações', icon: Sparkles, badge: 'CPC 10' },
          { id: 'beneficiosPosEmpregoCpc33', title: 'Benefícios Pós-Emprego', icon: HeartPulse, badge: 'CPC 33' },
          { id: 'analiseDemonstracoesCfc', title: 'Análise Balanço (AV/AH/Kanitz)', icon: TrendingUp, badge: 'NBC TG' },
          { id: 'honorariosContabeis', title: 'Honorários & Contratos (HO)', icon: DollarSign, badge: 'CFC 1457' },
          { id: 'reformaTributaria2026', title: 'Reforma Tributária 2026', icon: Sparkles, badge: 'IBS/CBS' },
          { id: 'emprestimosFinanciamentos', title: 'Empréstimos & Financiamentos', icon: Landmark, badge: 'CPC 48' },
          { id: 'inventarioPatrimonial', title: 'Inventário & Baixas CPC 27', icon: Archive, badge: 'LAUDO' },
          { id: 'entidadesSemFinsLucrativos', title: 'Terceiro Setor & CEBAS', icon: HeartHandshake, badge: 'ITG 2002' },
          { id: 'zeramento', title: 'Encerramento de Período (ARE)', icon: FileCheck2 }
        ]
      },
      {
        id: 'automacoes',
        title: 'AUTOMAÇÃO & SPED',
        items: [
          { id: 'importacaoConciliacao', title: 'Importação OFX & Conciliação', icon: Zap, badge: 'AUTO' },
          { id: 'razaoAuxiliar', title: 'Razão Auxiliar (Clientes/Forn)', icon: FileSpreadsheet, badge: 'CONCIL' },
          { id: 'exportacaoContabil', title: 'Exportação SPED ECD', icon: FileCode, badge: 'ECD' },
          { id: 'ecfBlocoY', title: 'SPED ECF Bloco Y (Econômico)', icon: Briefcase, badge: 'BLOCO Y' },
          { id: 'auditoriaSpedCruzamento', title: 'Auditoria Cruzada SPED', icon: FileCheck, badge: 'CRUZAMENTO' }
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
          { id: 'apuracaoTrimestral', title: 'Apuração IRPJ/CSLL (Presumido)', icon: Calculator, badge: 'DARF' },
          { id: 'lalur', title: 'LALUR / LACS (Lucro Real)', icon: BookOpen, badge: 'REAL' },
          { id: 'consolidacao', title: 'Consolidação (CPC 36)', icon: Share2, badge: 'CONSOL' },
          { id: 'dmplDva', title: 'DMPL & DVA (CPC 26/09)', icon: Share2, badge: 'CPC' },
          { id: 'balancoSocial', title: 'Balanço Social (IBASE / ESG)', icon: Heart, badge: 'ESG' },
          { id: 'analiseBalanco', title: 'Análise Balanço & Índices', icon: Activity, badge: 'NBC' },
          { id: 'balancoAbertura', title: 'Balanço de Abertura (ITG 1000)', icon: BookOpen, badge: 'ITG 1000' },
          { id: 'diopsAns', title: 'DIOPS ANS (Saúde Suplementar)', icon: HeartPulse, badge: 'RN 518' },
          { id: 'dereEconomico', title: 'DeRE - Balancete Regulatório', icon: FileSpreadsheet, badge: 'DeRE' },
          { id: 'scpSociedade', title: 'SCP - Soc. Conta Participação', icon: Users, badge: 'SCP' },
          { id: 'apuracaoEstoquesCusteio', title: 'Apuração Estoques (CPC 16)', icon: Boxes, badge: 'KARDEX' },
          { id: 'derexSpedEcf', title: 'DEREX & Operações Exterior', icon: Globe2, badge: 'BLOCO V/X' },
          { id: 'pcldPerdasCreditos', title: 'PCLD - Perdas Créditos (CPC 48)', icon: ShieldAlert, badge: 'CPC 48' },
          { id: 'ecdDemonstracoesBlocoJ', title: 'ECD Bloco J (Demonstrações)', icon: FileSpreadsheet, badge: 'BLOCO J' },
          { id: 'mepMaisValiaAgio', title: 'MEP & Mais-Valia (CPC 18)', icon: PieChart, badge: 'CPC 18' },
          { id: 'consolidacaoCpc36', title: 'Consolidação Demonstrações', icon: Layers, badge: 'CPC 36' },
          { id: 'lucroPresumidoEcfP', title: 'Lucro Presumido ECF (Bloco P)', icon: Calculator, badge: 'BLOCO P' },
          { id: 'lucroRealEcfBlocoN', title: 'Lucro Real ECF (Bloco N)', icon: Calculator, badge: 'BLOCO N' },
          { id: 'operacoesExteriorEcfBlocoX', title: 'Operações Exterior ECF (Bloco X)', icon: Globe2, badge: 'BLOCO X' },

          { id: 'livros', title: 'Livro Diário & Razão Analítico', icon: BookOpen },
          { id: 'documentStudio', title: 'Document Studio (Termos A4)', icon: FileSpreadsheet }
        ]
      },
      {
        id: 'utilitarios',
        title: 'UTILITÁRIOS & FERRAMENTAS',
        items: [
          { id: 'calendarioFiscal', title: 'Calendário Fiscal & Obrigações', icon: Calendar },
          { id: 'protocolo', title: 'Protocolo de Documentos', icon: FileText, badge: 'PROTO' },
          { id: 'malhaFinaAuditoria', title: 'Malha Fina & Auditoria RFB', icon: ShieldAlert, badge: 'MALHA' },
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
          { id: 'ecacCaixaPostal', title: 'e-CAC & DTE Postal', icon: Mail, badge: 'DTE' },
          { id: 'notasFiscais', title: 'Importador XML & Notas', icon: FileText, badge: 'XML' },
          { id: 'nfse', title: 'NFS-e Nacional / DPS', icon: Receipt, badge: 'DPS' },
          { id: 'pgdas', title: 'PGDAS-D (Simples Nacional)', icon: Calculator, badge: 'DAS' },
          { id: 'fatorR', title: 'Apuração do Fator R (Anexos III/V)', icon: Percent, badge: 'FATOR R' },
          { id: 'defis', title: 'DEFIS (Simples Nacional)', icon: Building2, badge: 'DEFIS' },
          { id: 'efdContribuicoes', title: 'EFD-Contribuições (PIS/COFINS)', icon: FileCode, badge: 'BLOCO M' },
          { id: 'giaSintegra', title: 'GIA & SINTEGRA Estadual', icon: Scale, badge: 'SEFAZ' },
          { id: 'icmsSubstituicaoTributaria', title: 'ICMS-ST & MVA Ajustada', icon: Scale, badge: 'GNRE' },
          { id: 'creditoPresumidoAgroIpi', title: 'Crédito Presumido Agro/IPI', icon: Wheat, badge: '9363/10925' },
          { id: 'blocoKAvancadoEstoque', title: 'Auditoria Estoques & Bloco K', icon: Boxes, badge: 'K220/280' },
          { id: 'retencoesConstrucaoCivil', title: 'Retenções Construção Civil', icon: HardHat, badge: 'CNO/2110' },
          { id: 'cideRemessasExterior', title: 'CIDE & Remessas Exterior', icon: Coins, badge: '10.168' },
          { id: 'pisCofinsReceitasFinanceiras', title: 'PIS/COFINS Rec. Financeiras', icon: Coins, badge: 'DEC 8426' },
          { id: 'combustiveisMonofasicoLmc', title: 'Combustíveis & LMC (Ad Rem)', icon: Fuel, badge: 'ANP 26' },
          { id: 'auditoriaSpedCruzamento', title: 'Auditoria Cruzada SPED', icon: FileCheck, badge: 'ECDxECF' },
          { id: 'dirf', title: 'DIRF (Informe de Rendimentos)', icon: FileText, badge: 'IN 1990' },
          { id: 'carneLeao', title: 'Livro Caixa & Carnê-Leão', icon: BookOpen, badge: 'IRPF' },
          { id: 'issqnDief', title: 'DIEF & ISSQN Municipal', icon: Building2, badge: 'LC 116' },
          { id: 'malhaFinaAuditoria', title: 'Malha Fina & Auditoria RFB', icon: ShieldAlert, badge: 'MALHA' },
          { id: 'dimob', title: 'DIMOB (Ativ. Imobiliárias)', icon: Home, badge: 'IN 1987' },
          { id: 'dmed', title: 'DMED (Serviços de Saúde)', icon: HeartPulse, badge: 'IN 2072' },
          { id: 'ciap', title: 'CIAP Bloco G (Ativo Permanente)', icon: Layers, badge: '1/48' },
          { id: 'inventarioEstoque', title: 'Inventário Estoques (Mod 7)', icon: Boxes, badge: 'BLOCO H' },
          { id: 'lcdpr', title: 'Livro Caixa Rural (LCDPR)', icon: BookOpen, badge: 'RURAL' },
          { id: 'conciliacaoCartoes1600', title: 'Vendas Cartões & MDR', icon: CreditCard, badge: '1600' },
          { id: 'retencoes', title: 'Retenções na Fonte (DARF)', icon: Receipt, badge: 'REINF' },
          { id: 'reinf', title: 'EFD-Reinf em XML (v2.01)', icon: FileCode, badge: 'XML' },
          { id: 'difal', title: 'DIFAL & DeSTDA (GNRE)', icon: Scale, badge: 'GNRE' },
          { id: 'perDcomp', title: 'PER/DCOMP Web (Compensação)', icon: Scale, badge: 'DCOMP' },
          { id: 'ipiBlocoK', title: 'Apuração IPI & Bloco K', icon: Factory, badge: 'TIPI' },
          { id: 'ipiCreditoBasico', title: 'IPI Crédito Básico & Ressarcimento', icon: Factory, badge: 'RIPI' },
          { id: 'retIncorporacaoMcmv', title: 'RET Incorporação & MCMV', icon: Building2, badge: 'LEI 10931' },
          { id: 'creditoAcumuladoIcms', title: 'Crédito Acumulado ICMS', icon: Coins, badge: 'E-CREDAC' },
          { id: 'reintegraExportacao', title: 'REINTEGRA Exportação', icon: Ship, badge: 'LEI 12546' },
          { id: 'fcbfCompensacao', title: 'Compensação FCBF (ICMS)', icon: Landmark, badge: 'EC 132' },
          { id: 'programaMover', title: 'Programa Mover (Créditos P&D)', icon: Car, badge: 'LEI 14902' },
          { id: 'reidiInfraestrutura', title: 'REIDI Infraestrutura (PIS/COFINS)', icon: Building2, badge: 'LEI 11488' },
          { id: 'drawbackIntegrado', title: 'Drawback Integrado & Siscomex', icon: Anchor, badge: 'SECEX 44' },
          { id: 'creditoPisCofinsImobilizado', title: 'PIS/COFINS Imobilizado', icon: Coins, badge: 'F120/F130' },
          { id: 'sicalcAcrescimosDarf', title: 'Sicalc DARF (Lei 9.430/96)', icon: Calculator, badge: 'SELIC' },
          { id: 'cprbDesoneracao', title: 'CPRB Desoneração Folha', icon: Scale, badge: 'R-2060' },
          { id: 'pisCofinsFinanceiras', title: 'PIS/COFINS Ent. Financeiras', icon: Landmark, badge: 'BLOCO I' },
          { id: 'declaracoesEstaduais', title: 'Declarações Estaduais ICMS', icon: Scale, badge: 'DIME/DAPI' },
          { id: 'retImobiliarioScp', title: 'RET Imobiliário & SCP (Lei 10.931)', icon: Building2, badge: 'RET 4%' },
          { id: 'zfmSuframa', title: 'ZFM & Benefícios SUFRAMA', icon: Compass, badge: 'PIN' },
          { id: 'difalNaoContribuinteFcp', title: 'DIFAL Consumidor Final & FCP', icon: Scale, badge: 'GNRE' },
          { id: 'cessaoMaoDeObraRetencoes', title: 'Cessão Mão de Obra (INSS 11%)', icon: HardHat, badge: 'IN 2110' },
          { id: 'simplesRegimeCaixa', title: 'Simples Nacional (Regime Caixa)', icon: Wallet, badge: 'CGSN 140' },
          { id: 'creditoPresumidoAgro', title: 'Crédito Presumido Agro (PIS/COFINS)', icon: Wheat, badge: 'LEI 10925' },
          { id: 'substituicaoPisCofins', title: 'PIS/COFINS ST & Monofásico', icon: Package, badge: 'DARF 6912' },
          { id: 'reintegraExportacao', title: 'REINTEGRA (Exportação)', icon: Ship, badge: 'DU-E' },
          { id: 'subvencoesInvestimentoNovo', title: 'Subvenções Investimento (Lei 14.789)', icon: Building2, badge: 'IRPJ 25%' },
          { id: 'pisCofinsImportacao', title: 'PIS/COFINS Importação (+1%)', icon: Anchor, badge: 'DARF 5602' },
          { id: 'drawbackIntermediario', title: 'Drawback Intermediário', icon: Anchor, badge: 'CFOP 5127' },
          { id: 'retencoesReinf4000', title: 'Retenções Federais Reinf', icon: Receipt, badge: 'R-4000' },
          { id: 'fci', title: 'FCI - Conteúdo de Importação', icon: Globe2, badge: 'ICMS 4%' },
          { id: 'dimeDcip', title: 'DIME & DCIP (Santa Catarina)', icon: Building2, badge: 'SAT-SC' },
          { id: 'siscredParana', title: 'Siscred PR - Crédito ICMS', icon: Coins, badge: 'PARANÁ' },
          { id: 'fundosEquilibrioFiscal', title: 'Fundos Equilíbrio (FEEF/FOT)', icon: Coins, badge: 'CV 42/16' },
          { id: 'cteTransporteFrete', title: 'CT-e & MDF-e Frete Cargas', icon: Truck, badge: 'SINIEF 09' },
          { id: 'dapiMgIcms', title: 'DAPI-MG - Apuração ICMS', icon: Building2, badge: 'MG DAE' },
          { id: 'dctfMensalTradicional', title: 'DCTF Mensal Tradicional', icon: Receipt, badge: 'PVA RFB' },
          { id: 'ipiSelosControle', title: 'IPI & Selos de Controle', icon: Factory, badge: 'MOD 8' },
          { id: 'spedFiscalBlocoD', title: 'SPED Fiscal Bloco D (Fretes)', icon: Truck, badge: 'BLOCO D' },
          { id: 'spedContribuicoesBloco1', title: 'SPED Contrib. Bloco 1', icon: Scale, badge: 'TEMA 69' },
          { id: 'reinfSerieR4000', title: 'EFD-Reinf Série R-4000', icon: Receipt, badge: 'R-4000' },
          { id: 'spedFiscalBlocoE', title: 'SPED Fiscal Bloco E (ICMS/ST)', icon: Landmark, badge: 'BLOCO E' },
          { id: 'spedFiscalBloc1', title: 'SPED Fiscal Bloco 1 (1601/1200)', icon: CreditCard, badge: 'BLOCO 1' },

          { id: 'apuracaoFiscal', title: 'Apuração DAS / ICMS / PIS', icon: Calculator, badge: 'GUIA' }
        ]
      },
      {
        id: 'fiscal_cad',
        title: 'CADASTROS OBRIGATÓRIOS (SPED)',
        items: [
          { id: 'participantes', title: 'Participantes (Clientes/Forn)', icon: Users, badge: '0150' },
          { id: 'produtos', title: 'Produtos, Serviços & Bens', icon: Package, badge: '0200' },
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
          { id: 'pontoEletronico', title: 'Ponto & Banco de Horas', icon: Clock, badge: 'MTP 671' },
          { id: 'sst', title: 'SST & Afastamentos (eSocial)', icon: ShieldCheck, badge: 'SST' },
          { id: 'beneficios', title: 'Gestão Benefícios (VT/VR)', icon: CreditCard, badge: 'VT 6%' },
          { id: 'rescisao', title: 'Rescisão Contratual & TRCT', icon: UserMinus, badge: 'TRCT' },
          { id: 'esocial', title: 'Central eSocial XML (S-1200/1210)', icon: FileCode, badge: 'eSocial' },
          { id: 'esocialRemuneracaoPgtos', title: 'eSocial S-1200 / S-1210', icon: FileCode, badge: 'MOS S-1.3' },
          { id: 'sstESocialS2220S2240', title: 'SST S-2220/2240 & PPP', icon: Stethoscope, badge: 'PPP A4' },
          { id: 'catESocialS2210', title: 'CAT S-2210 (Acidente)', icon: Ambulance, badge: 'CAT' },
          { id: 'tsveESocialS2300', title: 'TSVE eSocial (S-2300)', icon: GraduationCap, badge: 'S-2300' },
          { id: 'esocialRuralS1260', title: 'Rural & CPRB (S-1260/1280)', icon: Wheat, badge: 'S-1260' },
          { id: 'processosESocialS2500', title: 'Processos Trabalhistas (S-2500)', icon: Gavel, badge: 'S-2500' },

          { id: 'dctfWeb', title: 'DCTFWeb & DARF Previdenciário', icon: FileCheck2, badge: 'S-1299' },
          { id: 'provisoesFolha', title: 'Provisões de Férias e 13º', icon: Layers, badge: 'CPC' },
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
          { id: 'honorariosContabeis', title: 'Gestão Geral de Honorários', icon: DollarSign, badge: 'DOMÍNIO' },
          { id: 'faturamentoHonorarios', title: 'Faturamento em Lote & Baixas', icon: Receipt, badge: 'LOTE' },
          { id: 'boletosHonorarios', title: 'Boletos Bancários & PIX', icon: CreditCard, badge: 'BOLETO' },
          { id: 'nfse', title: 'Emissão de NFS-e DPS', icon: Receipt, badge: 'NFS-e' },
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
