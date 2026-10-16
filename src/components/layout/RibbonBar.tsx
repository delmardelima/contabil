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
      { id: 'ativoIntangivel', label: 'Ativo Intangível (CPC 04)', icon: Sparkles },
      { id: 'leasingCpc06', label: 'Leasing (CPC 06 R2)', icon: KeyRound },
      { id: 'subvencoesIncentivos', label: 'Subvenções (CPC 07)', icon: Landmark },
      { id: 'avpCpc12', label: 'Ajuste Valor Presente (CPC 12)', icon: Calculator },
      { id: 'impairmentCpc01', label: 'Impairment (CPC 01 R1)', icon: Scale },
      { id: 'precosTransferencia', label: 'Preços de Transferência (OCDE)', icon: Globe2 },
      { id: 'ativosBiologicosCpc29', label: 'Ativos Biológicos (CPC 29)', icon: Sprout },
      { id: 'construcaoPocCpc47', label: 'Construção & POC (CPC 47)', icon: HardHat },
      { id: 'consolidacaoMepCpc18', label: 'Consolidação & MEP (CPC 18)', icon: Network },
      { id: 'hedgeAccountingCpc48', label: 'Hedge Accounting (CPC 48)', icon: ShieldCheck },
      { id: 'cooperativasSobrasPerdas', label: 'Cooperativas & Sobras (Lei 5.764)', icon: HeartHandshake },
      { id: 'ganhoCapitalAlienacao', label: 'Ganho de Capital (Lei 13.259)', icon: TrendingUp },
      { id: 'iofMutuos', label: 'IOF Mútuos Intercompany (RIOF)', icon: Coins },
      { id: 'apaPrecosTransferencia', label: 'APA & Transfer Pricing (OCDE)', icon: ShieldCheck },
      { id: 'depreciacaoAceleradaIncentivada', label: 'Depreciação Acelerada (Lei 14.871)', icon: Factory },
      { id: 'subcapitalizacaoThinCap', label: 'Subcapitalização & Thin Cap (Lei 12.249)', icon: Scale },
      { id: 'jurosSobreCapitalProprio', label: 'JCP Lei 14.789/23 & TJLP', icon: Coins },
      { id: 'cprAgronegocio', label: 'CPR & Hedge Agro (Lei 13.986)', icon: Sprout },
      { id: 'prejuizosFiscaisLalur', label: 'Prejuízos Fiscais & Trava 30%', icon: Scale },
      { id: 'cbiosRenovabio', label: 'CBIOs RenovaBio & B3 (OCPC 08)', icon: Leaf },
      { id: 'debenturesIncentivadas', label: 'Debêntures Infraestrutura (Lei 14.801)', icon: Coins },
      { id: 'incentivosSudeneSudam', label: 'Incentivos SUDENE & SUDAM (75%)', icon: Compass },
      { id: 'subvencoesInvestimentoLei14789', label: 'Subvenções Investimento (Lei 14.789)', icon: Award },
      { id: 'concessoesPublicasIcpc01', label: 'Concessões Públicas (ICPC 01)', icon: Layers },
      { id: 'revisaoVidasUteisImpairment', label: 'Revisão Vidas Úteis (CPC 27/01)', icon: RotateCcw },
      { id: 'remuneracaoAcoesCpc10', label: 'Stock Options & Ações (CPC 10)', icon: Sparkles },
      { id: 'beneficiosPosEmpregoCpc33', label: 'Benefícios Pós-Emprego (CPC 33)', icon: HeartPulse },
      { id: 'analiseDemonstracoesCfc', label: 'Análise Balanço (NBC TG)', icon: TrendingUp },
      { id: 'honorariosContabeis', label: 'Honorários & Contratos (HO)', icon: DollarSign },
      { id: 'auditoriaSpedCruzamento', label: 'Auditoria Cruzada SPED', icon: FileCheck },
      { id: 'reformaTributaria2026', label: 'Reforma Tributária 2026', icon: Sparkles },
      { id: 'razaoAuxiliar', label: 'Razão Auxiliar (Clientes/Forn)', icon: FileSpreadsheet },
      { id: 'apuracaoTrimestral', label: 'IRPJ & CSLL (Trimestral)', icon: Calculator },
      { id: 'lalur', label: 'LALUR / LACS (Lucro Real)', icon: BookOpen },
      { id: 'consolidacao', label: 'Consolidação (CPC 36)', icon: Share2 },
      { id: 'dmplDva', label: 'DMPL & DVA (CPC 26)', icon: Share2 },
      { id: 'balancoSocial', label: 'Balanço Social (ESG)', icon: Heart },
      { id: 'planejamentoTributario', label: 'Planejamento Tributário', icon: TrendingUp },
      { id: 'analiseBalanco', label: 'Análise Balanço & Índices', icon: Activity },
      { id: 'balancoAbertura', label: 'Balanço de Abertura (ITG 1000)', icon: BookOpen },
      { id: 'diopsAns', label: 'DIOPS ANS (RN 518/2022)', icon: HeartPulse },
      { id: 'ecfBlocoY', label: 'SPED ECF Bloco Y', icon: Briefcase },
      { id: 'notasExplicativas', label: 'Notas Explicativas (CPC 26)', icon: FileText },
      { id: 'emprestimosFinanciamentos', label: 'Empréstimos & Financiamentos', icon: Landmark },
      { id: 'malhaFinaAuditoria', label: 'Malha Fina & Auditoria RFB', icon: ShieldAlert },
      { id: 'protocolo', label: 'Protocolo de Docs', icon: FileText },
      { id: 'entidadesSemFinsLucrativos', label: 'Terceiro Setor & CEBAS', icon: HeartHandshake },
      { id: 'dereEconomico', label: 'DeRE (Balancete Regulatório)', icon: FileSpreadsheet },
      { id: 'scpSociedade', label: 'SCP (Soc. Conta Participação)', icon: Users },
      { id: 'apuracaoEstoquesCusteio', label: 'Apuração Estoques (CPC 16)', icon: Boxes },
      { id: 'derexSpedEcf', label: 'DEREX & Exterior (Bloco V/X)', icon: Globe2 },
      { id: 'pcldPerdasCreditos', label: 'PCLD Perdas Estimadas (CPC 48)', icon: Scale },
      { id: 'ecdDemonstracoesBlocoJ', label: 'ECD Bloco J (Demonstrações)', icon: FileSpreadsheet },
      { id: 'mepMaisValiaAgio', label: 'MEP & Mais-Valia (CPC 18)', icon: PieChart },
      { id: 'consolidacaoCpc36', label: 'Consolidação Demonstrações (CPC 36)', icon: Layers },
      { id: 'lucroPresumidoEcfP', label: 'Lucro Presumido ECF (Bloco P)', icon: Calculator },
      { id: 'lucroRealEcfBlocoN', label: 'Lucro Real ECF (Bloco N)', icon: Calculator },
      { id: 'operacoesExteriorEcfBlocoX', label: 'Operações Exterior (Bloco X)', icon: Globe2 },

      { id: 'auditoria', label: 'Auditoria & Saldos', icon: ShieldAlert },
      { id: 'redeBackup', label: 'Rede & Backup', icon: Network }
    ];
  } else if (moduloAtivo === 'escrita') {
    topTabs = [
      { id: 'dashboardFiscal', label: 'Dashboard Fiscal', icon: Receipt },
      { id: 'ecacCaixaPostal', label: 'e-CAC & DTE Postal', icon: Mail },
      { id: 'notasFiscais', label: 'Importador XML & NF-e', icon: FileText },
      { id: 'nfse', label: 'NFS-e Nacional / DPS', icon: Receipt },
      { id: 'pgdas', label: 'PGDAS-D (Simples)', icon: Calculator },
      { id: 'fatorR', label: 'Fator R (Simples)', icon: Percent },
      { id: 'defis', label: 'DEFIS (Simples)', icon: Building2 },
      { id: 'efdContribuicoes', label: 'EFD-Contribuições (PIS/COFINS)', icon: FileCode },
      { id: 'giaSintegra', label: 'GIA & SINTEGRA', icon: Scale },
      { id: 'icmsSubstituicaoTributaria', label: 'ICMS-ST (Conv. 142)', icon: Scale },
      { id: 'creditoPresumidoAgroIpi', label: 'Crédito Presumido Agro/IPI', icon: Wheat },
      { id: 'blocoKAvancadoEstoque', label: 'Auditoria Estoque & Bloco K', icon: Boxes },
      { id: 'retencoesConstrucaoCivil', label: 'Retenções Construção Civil (CNO)', icon: HardHat },
      { id: 'cideRemessasExterior', label: 'CIDE & Remessas Exterior', icon: Coins },
      { id: 'pisCofinsReceitasFinanceiras', label: 'PIS/COFINS Rec. Financeiras', icon: Coins },
      { id: 'combustiveisMonofasicoLmc', label: 'Combustíveis & LMC (Ad Rem)', icon: Fuel },
      { id: 'auditoriaSpedCruzamento', label: 'Auditoria Cruzada SPED', icon: FileCheck },
      { id: 'dirf', label: 'DIRF (RFB)', icon: FileText },
      { id: 'carneLeao', label: 'Livro Caixa & Carnê-Leão', icon: BookOpen },
      { id: 'issqnDief', label: 'DIEF & ISSQN', icon: Building2 },
      { id: 'malhaFinaAuditoria', label: 'Malha Fina & Auditoria RFB', icon: ShieldAlert },
      { id: 'dimob', label: 'DIMOB (Imobiliária)', icon: Home },
      { id: 'dmed', label: 'DMED (Saúde)', icon: HeartPulse },
      { id: 'ciap', label: 'CIAP (Bloco G 1/48)', icon: Layers },
      { id: 'inventarioEstoque', label: 'Inventário Mod 7 (Bloco H)', icon: Boxes },
      { id: 'lcdpr', label: 'Livro Caixa Rural (LCDPR)', icon: BookOpen },
      { id: 'conciliacaoCartoes1600', label: 'Cartões Reg. 1600', icon: CreditCard },
      { id: 'retencoes', label: 'Retenções na Fonte (DARF)', icon: Receipt },
      { id: 'reinf', label: 'EFD-Reinf XML (v2.01)', icon: FileCode },
      { id: 'difal', label: 'DIFAL & DeSTDA (GNRE)', icon: Scale },
      { id: 'perDcomp', label: 'PER/DCOMP Web', icon: Scale },
      { id: 'ipiBlocoK', label: 'Apuração IPI & Bloco K', icon: Factory },
      { id: 'ipiCreditoBasico', label: 'IPI Crédito Básico & Ressarcimento', icon: Factory },
      { id: 'retIncorporacaoMcmv', label: 'RET Incorporação & MCMV (Lei 10.931)', icon: Building2 },
      { id: 'creditoAcumuladoIcms', label: 'Crédito Acumulado ICMS (e-CredAc)', icon: Coins },
      { id: 'reintegraExportacao', label: 'REINTEGRA Exportação (Lei 12.546)', icon: Ship },
      { id: 'fcbfCompensacao', label: 'FCBF Compensação ICMS (EC 132)', icon: Landmark },
      { id: 'programaMover', label: 'Programa Mover (Lei 14.902)', icon: Car },
      { id: 'reidiInfraestrutura', label: 'REIDI Infraestrutura (Lei 11.488)', icon: Building2 },
      { id: 'drawbackIntegrado', label: 'Drawback Integrado & Siscomex', icon: Anchor },
      { id: 'creditoPisCofinsImobilizado', label: 'PIS/COFINS Imobilizado (F120/F130)', icon: Coins },
      { id: 'sicalcAcrescimosDarf', label: 'Sicalc DARF (Lei 9.430/96)', icon: Calculator },
      { id: 'cprbDesoneracao', label: 'CPRB Desoneração (Lei 12.546)', icon: Scale },
      { id: 'pisCofinsFinanceiras', label: 'PIS/COFINS Financeiras (Bloco I)', icon: Landmark },
      { id: 'declaracoesEstaduais', label: 'Declarações Estaduais ICMS (DIME/DAPI)', icon: Scale },
      { id: 'retImobiliarioScp', label: 'RET Imobiliário & SCP (Lei 10.931)', icon: Building2 },
      { id: 'zfmSuframa', label: 'ZFM & Benefícios SUFRAMA', icon: Compass },
      { id: 'difalNaoContribuinteFcp', label: 'DIFAL Consumidor Final & FCP', icon: Scale },
      { id: 'cessaoMaoDeObraRetencoes', label: 'Cessão Mão de Obra (INSS 11%)', icon: HardHat },
      { id: 'simplesRegimeCaixa', label: 'Simples Regime Caixa (CGSN 140)', icon: Wallet },
      { id: 'creditoPresumidoAgro', label: 'Crédito Agro (PIS/COFINS)', icon: Wheat },
      { id: 'substituicaoPisCofins', label: 'PIS/COFINS ST & Monofásico', icon: Package },
      { id: 'subvencoesInvestimentoNovo', label: 'Subvenções Investimento (Lei 14.789)', icon: Building2 },
      { id: 'pisCofinsImportacao', label: 'PIS/COFINS Importação (+1%)', icon: Anchor },
      { id: 'drawbackIntermediario', label: 'Drawback Intermediário', icon: Anchor },
      { id: 'retencoesReinf4000', label: 'Retenções Reinf (R-4000)', icon: Receipt },
      { id: 'fci', label: 'FCI (Conteúdo Importação)', icon: Globe2 },
      { id: 'dimeDcip', label: 'DIME & DCIP (SC)', icon: Building2 },
      { id: 'siscredParana', label: 'Siscred PR (ICMS)', icon: Coins },
      { id: 'fundosEquilibrioFiscal', label: 'Fundos Equilíbrio (FEEF/FOT)', icon: Coins },
      { id: 'cteTransporteFrete', label: 'CT-e / MDF-e Transporte Frete', icon: Truck },
      { id: 'dapiMgIcms', label: 'DAPI-MG ICMS (Dec. 48.589)', icon: Landmark },
      { id: 'dctfMensalTradicional', label: 'DCTF Mensal Tradicional', icon: FileCheck },
      { id: 'ipiSelosControle', label: 'IPI Selos de Controle (Mod. 8)', icon: Factory },
      { id: 'spedFiscalBlocoD', label: 'SPED Fiscal Bloco D', icon: Truck },
      { id: 'spedContribuicoesBloco1', label: 'SPED Contrib. Bloco 1 (Tema 69)', icon: Scale },
      { id: 'reinfSerieR4000', label: 'EFD-Reinf Série R-4000', icon: Receipt },
      { id: 'spedFiscalBlocoE', label: 'SPED Fiscal Bloco E (ICMS/ST)', icon: Landmark },
      { id: 'spedFiscalBloc1', label: 'SPED Fiscal Bloco 1 (1601/1200)', icon: CreditCard },

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
      { id: 'pontoEletronico', label: 'Ponto & Banco Horas', icon: Clock },
      { id: 'sst', label: 'SST & Afastamentos (eSocial)', icon: ShieldCheck },
      { id: 'beneficios', label: 'Gestão Benefícios (VT/VR)', icon: CreditCard },
      { id: 'rescisao', label: 'Rescisão Contratual (TRCT)', icon: UserMinus },
      { id: 'esocial', label: 'Central eSocial XML', icon: FileCode },
      { id: 'esocialRemuneracaoPgtos', label: 'eSocial S-1200 / S-1210', icon: FileCode },
      { id: 'sstESocialS2220S2240', label: 'SST S-2220/2240 (PPP A4)', icon: Stethoscope },
      { id: 'catESocialS2210', label: 'CAT S-2210 Acidentes', icon: Ambulance },
      { id: 'tsveESocialS2300', label: 'TSVE eSocial (S-2300)', icon: GraduationCap },
      { id: 'esocialRuralS1260', label: 'Rural & CPRB (S-1260/1280)', icon: Wheat },
      { id: 'processosESocialS2500', label: 'Processos Trabalhistas (S-2500/2501)', icon: Gavel },

      { id: 'dctfWeb', label: 'DCTFWeb & DARF', icon: FileCheck2 },
      { id: 'dirf', label: 'Informe DIRF / IRPF', icon: FileText },
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
      { id: 'boletosHonorarios', label: 'Boletos Bancários & PIX', icon: CreditCard },
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

              <button
                onClick={() => onNavigate('simplesRegimeCaixa', 'Simples Nacional - Regime de Caixa', Wallet)}
                className="flex items-center space-x-1.5 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium rounded border border-white/10 transition-colors text-xs"
              >
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Simples Regime Caixa</span>
              </button>

              <button
                onClick={() => onNavigate('creditoPresumidoAgro', 'Crédito Presumido Agro (PIS/COFINS)', Wheat)}
                className="flex items-center space-x-1.5 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium rounded border border-white/10 transition-colors text-xs"
              >
                <Wheat className="w-3.5 h-3.5 text-amber-400" />
                <span>Crédito Presumido Agro</span>
              </button>

              <button
                onClick={() => onNavigate('substituicaoPisCofins', 'PIS/COFINS ST & Monofásico', Package)}
                className="flex items-center space-x-1.5 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium rounded border border-white/10 transition-colors text-xs"
              >
                <Package className="w-3.5 h-3.5 text-indigo-400" />
                <span>PIS/COFINS ST</span>
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
