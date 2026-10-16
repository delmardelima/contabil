import React, { useState, useEffect, useRef } from 'react';
import { ContaContabil, Empresa } from '../../types/contabil';
import { 
  Command, 
  Search, 
  FileSpreadsheet, 
  Scale, 
  BookOpen, 
  PieChart, 
  FileText, 
  FolderTree, 
  RefreshCw, 
  Building2,
  Sliders,
  Users,
  Network,
  Repeat,
  Layers,
  ShieldAlert,
  ArrowRightLeft,
  LayoutDashboard,
  X,
  LucideIcon,
  Zap,
  FileCode,
  TrendingUp,
  DollarSign,
  Receipt,
  Calculator,
  CreditCard,
  Archive,
  Lock,
  ShieldCheck,
  Factory,
  Clock,
  Boxes,
  UserMinus,
  Activity,
  Briefcase,
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
  Package,
  Truck,
  Stethoscope,
  Ambulance,
  GraduationCap,
  Gavel
} from 'lucide-react';

import { dbService } from '../../db/sqliteService';
import { MODULO_PERMISSOES } from '../../types/contabil';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModule: (moduleId: string, title?: string, icon?: LucideIcon) => void;
  contas: ContaContabil[];
  empresas: Empresa[];
  onSelectEmpresa: (id: number) => void;
  onNewLancamento: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectModule,
  contas,
  empresas,
  onSelectEmpresa,
  onNewLancamento
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const allModules = [
    // Contabilidade
    { id: 'dashboard', label: 'Dashboard Executivo Contábil', icon: LayoutDashboard },
    { id: 'lancamentos', label: 'Lançamentos Contábeis (F2)', icon: BookOpen },
    { id: 'importacaoConciliacao', label: 'Importação OFX & Conciliação Bancária', icon: Zap },
    { id: 'exportacaoContabil', label: 'Exportação SPED ECD Oficial (RFB)', icon: FileCode },
    { id: 'balancete', label: 'Balancete de Verificação (F4)', icon: Scale },
    { id: 'balanco', label: 'Balanço Patrimonial (Quadro Oficial)', icon: Scale },
    { id: 'dre', label: 'Demonstração de Resultado (D.R.E.)', icon: PieChart },
    { id: 'dlpa', label: 'Demonstração de Lucros Acumulados (DLPA)', icon: TrendingUp },
    { id: 'dfc', label: 'Demonstração do Fluxo de Caixa (DFC)', icon: DollarSign },
    { id: 'livros', label: 'Livro Diário Geral & Razão Analítico', icon: BookOpen },
    { id: 'planoContas', label: 'Plano de Contas da Empresa', icon: FolderTree },
    { id: 'documentStudio', label: 'Document Studio (Termos A4)', icon: FileSpreadsheet },
    { id: 'zeramento', label: 'Zeramento de Exercício / ARE', icon: RefreshCw },
    { id: 'lotes', label: 'Gestão de Lotes Contábeis (CTLOTE)', icon: Layers },
    { id: 'estruturaDRE', label: 'Construtor de Estrutura da DRE', icon: Layers },
    { id: 'lancamentosPadrao', label: 'Lançamentos Padrão / Automáticos', icon: Repeat },
    { id: 'centrosCusto', label: 'Centros de Custo & Departamentos', icon: PieChart },
    { id: 'historicos', label: 'Históricos Padrão', icon: FileText },
    { id: 'empresas', label: 'Cadastro de Empresas & Clientes', icon: Building2 },
    { id: 'parametros', label: 'Parâmetros Contábeis (CTPARAMETRO)', icon: Sliders },
    { id: 'usuarios', label: 'Usuários, Perfis & Trilha de Auditoria', icon: Users },
    { id: 'redeBackup', label: 'Rede Local LAN & Backup (.bak)', icon: Network },
    { id: 'auditoria', label: 'Auditoria de Saldos Invertidos & Furos', icon: ShieldAlert },
    { id: 'transporteSaldos', label: 'Transporte de Saldos Patrimoniais Anual', icon: ArrowRightLeft },
    { id: 'ativoImobilizado', label: 'Ativo Imobilizado & Depreciação Mensal (CPC 27)', icon: Archive },
    { id: 'ativoIntangivel', label: 'Controle de Bens do Ativo Intangível e Amortização (CPC 04 / NBC TG 04 / IAS 38)', icon: Sparkles },
    { id: 'leasingCpc06', label: 'Controle de Arrendamento Mercantil / Leasing (CPC 06 R2 / NBC TG 06 / IFRS 16)', icon: KeyRound },
    { id: 'subvencoesIncentivos', label: 'Controle de Subvenções Governamentais para Investimentos (CPC 07 R1 / Leis 12.973/14 & 14.789/23)', icon: Landmark },
    { id: 'avpCpc12', label: 'Gestão de Ajuste a Valor Presente - AVP (CPC 12 / NBC TG 12 / Lei 11.638/2007)', icon: Calculator },
    { id: 'impairmentCpc01', label: 'Teste de Recuperabilidade de Ativos - Impairment (CPC 01 R1 / NBC TG 01 / IAS 36)', icon: Scale },
    { id: 'precosTransferencia', label: 'Preços de Transferência - Transfer Pricing (Lei 14.596/2023 / IN RFB 2.161/23 - OCDE)', icon: Globe2 },
    { id: 'ativosBiologicosCpc29', label: 'Ativos Biológicos e Produtos Agrícolas a Valor Justo (CPC 29 / NBC TG 29 / IAS 41)', icon: Sprout },
    { id: 'construcaoPocCpc47', label: 'Contratos de Construção & Incorporação Imobiliária - Método POC & RET 4% (CPC 47 / OCPC 01)', icon: HardHat },
    { id: 'consolidacaoMepCpc18', label: 'Demonstrações Consolidadas & Equivalência Patrimonial - MEP (CPC 18 / CPC 36 / IAS 28)', icon: Network },
    { id: 'hedgeAccountingCpc48', label: 'Hedge Accounting & Contabilidade de Derivativos (CPC 48 / NBC TG 48 / IFRS 9)', icon: ShieldCheck },
    { id: 'cooperativasSobrasPerdas', label: 'Contabilidade de Cooperativas e Distribuição de Sobras / Perdas (Lei 5.764/71 / ITG 2004)', icon: HeartHandshake },
    { id: 'ganhoCapitalAlienacao', label: 'Apuração de Ganho de Capital na Alienação de Bens do Ativo Permanente (Lei 13.259/16 / IN 1.500)', icon: TrendingUp },
    { id: 'iofMutuos', label: 'IOF sobre Operações de Crédito e Mútuo Intercompany (Decreto 6.306/2007 - RIOF / Lei 9.779/1999)', icon: Coins },
    { id: 'apaPrecosTransferencia', label: 'APA & Acordos Prévios de Preços de Transferência (Lei 14.596/2023 / IN RFB 2.161/2023 - Marco OCDE)', icon: ShieldCheck },
    { id: 'depreciacaoAceleradaIncentivada', label: 'Depreciação Acelerada Incentivada de Bens do Imobilizado Fabril (Lei 14.871/2024 / Dec. 12.175/2024 - Quota 50%/50%)', icon: Factory },
    { id: 'subcapitalizacaoThinCap', label: 'Subcapitalização & Thin Capitalization Rules (Lei 12.249/2010 Arts. 24 e 25 / IN RFB 1.154/2011)', icon: Scale },
    { id: 'jurosSobreCapitalProprio', label: 'JCP - Juros sobre o Capital Próprio (Art. 9º Lei 9.249/95 / Lei 14.789/2023 - Dedução LALUR e Retenção IRRF 15%)', icon: Coins },
    { id: 'cprAgronegocio', label: 'CPR - Cédula de Produto Rural & Operações de Hedge Agrícola (Lei 13.986/2020 / CPC 48 / IFRS 9 - Barter e Registro B3)', icon: Sprout },
    { id: 'prejuizosFiscaisLalur', label: 'Prejuízos Fiscais e Base Negativa de CSLL - Trava de 30% e Parte B LALUR (RIR/2018 Arts. 509 a 515 / Lei 9.065/95)', icon: Scale },
    { id: 'cbiosRenovabio', label: 'Créditos de Descarbonização - CBIOs RenovaBio na B3 (Lei 13.576/2017 / OCPC 08 / Retenção Definitiva IRRF 15%)', icon: Leaf },
    { id: 'debenturesIncentivadas', label: 'Debêntures de Infraestrutura & Incentivadas - Dedução Adicional de 30% e Custo Amortizado TIR (Lei 14.801/2024 / Lei 12.431/2011 / CPC 48)', icon: Coins },
    { id: 'incentivosSudeneSudam', label: 'Incentivos Regionais de IRPJ - SUDENE e SUDAM (MP 2.199-14/2001 / Lei 13.799/2018 - Redução 75% Lucro da Exploração & Reserva PL Art. 195-A LSA)', icon: Compass },
    { id: 'subvencoesInvestimentoLei14789', label: 'Subvenções para Investimento - Crédito Fiscal 25% IRPJ e Habilitação RFB (Lei 14.789/2023 / IN RFB 2.170/2023 / CPC 07)', icon: Award },
    { id: 'concessoesPublicasIcpc01', label: 'Contratos de Concessão de Serviços Públicos - Bifurcação Ativo Financeiro vs Intangível & PoC Obras (ICPC 01 R1 / IFRIC 12 / CPC 47)', icon: Layers },
    { id: 'revisaoVidasUteisImpairment', label: 'Revisão Periódica de Vidas Úteis & Teste de Impairment de UGCs (CPC 27 item 51 / CPC 01 R1 / NBC TG 01 / WACC)', icon: RotateCcw },
    { id: 'remuneracaoAcoesCpc10', label: 'Remuneração Baseada em Ações - Stock Options, Phantom Shares & Black-Scholes (CPC 10 R1 / IFRS 2 / Tema 1.226 STJ)', icon: Sparkles },
    { id: 'beneficiosPosEmpregoCpc33', label: 'Planos de Benefícios Pós-Emprego & Avaliação Atuarial PUCM / EFPC (CPC 33 R1 / IAS 19 / Resolução CNPC 32)', icon: HeartPulse },
    { id: 'analiseDemonstracoesCfc', label: 'Análise Econômico-Financeira das Demonstrações Contábeis - AV, AH, Índices e Kanitz (NBC TG / CFC)', icon: TrendingUp },
    { id: 'balancoAbertura', label: 'Balanço de Abertura & Transição do Livro Caixa (ITG 1000 / NBC TG 1000 / Deemed Cost)', icon: BookOpen },
    { id: 'diopsAns', label: 'DIOPS ANS - Saúde Suplementar, Provisões Técnicas Atuariais PEONA/PIC & CBR (RN nº 518/2022 e 527/2022)', icon: HeartPulse },
    { id: 'honorariosContabeis', label: 'Gestão de Honorários Contábeis & Contratos de Prestação de Serviços (Domínio Honorários / Res. CFC 1.457)', icon: DollarSign },
    { id: 'auditoriaSpedCruzamento', label: 'Auditoria de Obrigações Acessórias & Cruzamento SPED ECD vs ECF vs EFD-Contribuições', icon: FileCheck },
    { id: 'reformaTributaria2026', label: 'Simulador de Transição da Reforma Tributária (EC 132/2023 & PLP 68/2024 - CBS 0,9% + IBS 0,1%)', icon: Sparkles },
    { id: 'analiseBalanco', label: 'Análise Balanço & Índices Financeiros (NBC TG / CFC)', icon: Activity },
    { id: 'ecfBlocoY', label: 'SPED ECF Bloco Y - Informações Gerais, Econômicas & QSA', icon: Briefcase },
    { id: 'notasExplicativas', label: 'Notas Explicativas às Demonstrações Contábeis (NBC TG 26 / CPC 26)', icon: FileText },
    { id: 'emprestimosFinanciamentos', label: 'Controle de Empréstimos, Financiamentos e Mútuos (CPC 38 / 48)', icon: Landmark },
    { id: 'malhaFinaAuditoria', label: 'Central de Cruzamento e Malha Fina Eletrônica RFB (Auditoria Pré-Transmissão Multi-Obrigação)', icon: ShieldAlert },
    { id: 'protocolo', label: 'Protocolo de Documentos & Malotes (GEPROTOCOLO)', icon: FileText },
    { id: 'entidadesSemFinsLucrativos', label: 'Entidades Sem Fins Lucrativos & Terceiro Setor - DSD, CEBAS e Convênios (ITG 2002 R1 / LC 187/2021)', icon: HeartHandshake },

    // Escrita Fiscal
    { id: 'dashboardFiscal', label: 'Dashboard Fiscal & Faturamento', icon: Receipt },
    { id: 'ecacCaixaPostal', label: 'e-CAC & Caixa Postal Fiscal Eletrônica DTE (RFB / SEFAZ / CNDs)', icon: Mail },
    { id: 'notasFiscais', label: 'Importador XML & Notas Fiscais', icon: FileText },
    { id: 'acumuladores', label: 'Acumuladores Fiscais (EFACUMULADOR)', icon: Layers },
    { id: 'pgdas', label: 'PGDAS-D (Simples Nacional & Segregação de Receitas)', icon: Calculator },
    { id: 'fatorR', label: 'Apuração do Fator R e Segregação Simples Nacional (LC 123/2006 Art. 18)', icon: Percent },
    { id: 'defis', label: 'DEFIS - Declaração de Informações Socioeconômicas e Fiscais (Resolução CGSN 140/2018)', icon: Building2 },
    { id: 'efdContribuicoes', label: 'EFD-Contribuições - PIS/PASEP e COFINS (IN RFB 1.252/2012)', icon: FileCode },
    { id: 'giaSintegra', label: 'GIA Eletrônica Estadual (ICMS / ST) & SINTEGRA Convênio 57/95', icon: Scale },
    { id: 'icmsSubstituicaoTributaria', label: 'Apuração de ICMS Substituição Tributária (ICMS-ST & MVA Ajustada - Convênio 142/2018)', icon: Scale },
    { id: 'creditoPresumidoAgroIpi', label: 'Apuração de Crédito Presumido de IPI para Exportação e PIS/COFINS Agroindustrial (Leis 9.363/96 & 10.925/04)', icon: Wheat },
    { id: 'blocoKAvancadoEstoque', label: 'Auditoria de Estoques & Bloco K Avançado (SPED K280 e K220 / Art. 303 RIR)', icon: Boxes },
    { id: 'retencoesConstrucaoCivil', label: 'Apuração de Retenções Previdenciárias na Construção Civil e Empreitada Global (IN RFB 2.110/22 / CNO)', icon: HardHat },
    { id: 'cideRemessasExterior', label: 'CIDE-Remessas & Serviços do Exterior (Lei 10.168/2000 / IN RFB 1.455/2014)', icon: Coins },
    { id: 'pisCofinsReceitasFinanceiras', label: 'Apuração de PIS/COFINS sobre Receitas Financeiras (Decreto nº 8.426/2015 / IN RFB 2.121/2022)', icon: Coins },
    { id: 'combustiveisMonofasicoLmc', label: 'Controle de Combustíveis Monofásicos & Livro de Movimentação de Combustíveis - LMC (LC 192/2022 / Portaria ANP 26/92)', icon: Fuel },
    { id: 'dirf', label: 'DIRF - Declaração do Imposto de Renda Retido na Fonte (IN RFB 1.990/2020)', icon: FileText },
    { id: 'carneLeao', label: 'Livro Caixa Digital & Apuração do Carnê-Leão (IN RFB 1.500/2014 & Lei 7.713/88)', icon: BookOpen },
    { id: 'issqnDief', label: 'DIEF & Apuração de ISSQN Centralizada (LC 116/2003)', icon: Building2 },
    { id: 'dimob', label: 'DIMOB - Declaração de Atividades Imobiliárias (IN RFB 1.987/2020)', icon: Home },
    { id: 'dmed', label: 'DMED - Declaração de Serviços Médicos e de Saúde (IN RFB 2.072/2022)', icon: HeartPulse },
    { id: 'ciap', label: 'CIAP Bloco G (Ativo Permanente 1/48)', icon: Layers },
    { id: 'inventarioEstoque', label: 'Livro Registro de Inventário Mod. 7 (Bloco H)', icon: Boxes },
    { id: 'conciliacaoCartoes1600', label: 'Conciliação Financeira de Cartões & Adquirentes (SPED Fiscal Registro 1600)', icon: CreditCard },
    { id: 'perDcomp', label: 'PER/DCOMP Web & Gestão de Créditos Compensáveis', icon: Scale },
    { id: 'ipiBlocoK', label: 'Livro Registro Apuração do IPI (Mod. 8) & Bloco K', icon: Factory },
    { id: 'ipiCreditoBasico', label: 'Apuração de IPI no Regime de Crédito Básico & Ressarcimento Trimestral (RIPI Decreto 7.212/10 / IN RFB 2.055/21)', icon: Factory },
    { id: 'retIncorporacaoMcmv', label: 'Controle e Apuração do RET - Regime Especial de Tributação (Lei 10.931/2004 / MCMV 1% e 4%)', icon: Building2 },
    { id: 'creditoAcumuladoIcms', label: 'Sistema de Crédito Acumulado de ICMS (e-CredAc SP / Portaria CAT 26/2010 / Art. 71 RICMS)', icon: Coins },
    { id: 'reintegraExportacao', label: 'REINTEGRA - Regime Especial de Reintegração de Valores Tributários para Exportadores (Lei 12.546/2011 / Dec. 8.415/2015)', icon: Ship },
    { id: 'fcbfCompensacao', label: 'Compensação do Fundo de Compensação de Benefícios Fiscais - FCBF (Art. 159-A CF/88 / EC 132/2023 - Transição 2029-2032)', icon: Landmark },
    { id: 'programaMover', label: 'Programa Mover - Mobilidade Verde e Inovação (Lei 14.902/2024 / Dec. 12.053/2024 - Créditos Financeiros P&D e Descarbonização)', icon: Car },
    { id: 'reidiInfraestrutura', label: 'REIDI - Regime Especial de Incentivos para o Desenvolvimento da Infraestrutura (Lei 11.488/2007 / Dec. 6.144/2007 - Suspensão PIS/COFINS)', icon: Building2 },
    { id: 'drawbackIntegrado', label: 'Drawback Integrado Suspensão & Isenção no Comércio Exterior (Portaria Secex 44/2020 / Dec. 6.759/2009 - Atos Siscomex & DU-E)', icon: Anchor },
    { id: 'creditoPisCofinsImobilizado', label: 'Créditos de PIS e COFINS sobre o Ativo Imobilizado (Lei 10.833/03 / Bloco F120 e F130 da EFD-Contribuições)', icon: Coins },
    { id: 'sicalcAcrescimosDarf', label: 'Sicalc & Acréscimos Legais DARF - Multa de Mora e Taxa SELIC (Lei 9.430/96 Art. 61 / Lei 8.981/95)', icon: Calculator },
    { id: 'cprbDesoneracao', label: 'CPRB - Desoneração da Folha de Pagamento & Evento R-2060 da EFD-Reinf (Lei nº 12.546/2011 / DARF 2985)', icon: Scale },
    { id: 'pisCofinsFinanceiras', label: 'PIS e COFINS das Entidades Financeiras & Equiparadas (Lei nº 9.718/98 Art. 3º § 6º / Bloco I EFD-Contribuições)', icon: Landmark },
    { id: 'declaracoesEstaduais', label: 'Declarações Estaduais ICMS - DIME SC, DAPI MG, DIEF CE/MA & VAF Municipal', icon: Scale },
    { id: 'retImobiliarioScp', label: 'RET Imobiliário & Sociedade em Conta de Participação - SCP (Lei 10.931/2004 / IN RFB 2.179/2024 / DARF 4095)', icon: Building2 },
    { id: 'zfmSuframa', label: 'Zona Franca de Manaus & Benefícios Fiscais SUFRAMA (Convênio 65/88 / Lei 10.996/04 / PIN)', icon: Compass },
    { id: 'difalNaoContribuinteFcp', label: 'DIFAL Consumidor Final & FECOEP - Fundo de Combate à Pobreza (EC 87/2015 / LC 190/2022 / GNRE)', icon: Scale },
    { id: 'cessaoMaoDeObraRetencoes', label: 'Retenção Previdenciária em Cessão de Mão de Obra e Empreitada (Lei 8.212/91 Art. 31 / IN 2.110/22 / R-2010)', icon: HardHat },
    { id: 'simplesRegimeCaixa', label: 'Simples Nacional - Regime de Caixa (Resolução CGSN nº 140/2018 / LC 123/2006 Art. 18 § 3º)', icon: Wallet },
    { id: 'creditoPresumidoAgro', label: 'Crédito Presumido de PIS e COFINS no Agronegócio (Art. 8º Lei nº 10.925/2004 / IN RFB 2.121/2022)', icon: Wheat },
    { id: 'substituicaoPisCofins', label: 'Substituição Tributária de PIS e COFINS Monofásico/ST (Leis 10.485/02, 9.718/98 & 10.147/00)', icon: Package },
    { id: 'reintegraExportacao', label: 'REINTEGRA - Exportação de Manufaturados (Lei nº 13.043/2014 / Decreto nº 8.415/2015 / DU-E)', icon: Ship },
    { id: 'subvencoesInvestimentoNovo', label: 'Subvenções para Investimento - Crédito Fiscal IRPJ 25% (Novo Marco Lei nº 14.789/2023)', icon: Building2 },
    { id: 'pisCofinsImportacao', label: 'PIS e COFINS sobre Importação & Adicional 1% (Lei nº 10.865/2004 Art. 8º § 21 / DARF 5602/5629)', icon: Anchor },
    { id: 'drawbackIntermediario', label: 'Drawback Intermediário - Insumos com Suspensão & Remessa Fabricante-Exportador (Dec. 6.759/09 / CFOP 5127)', icon: Anchor },
    { id: 'retencoesReinf4000', label: 'Retenções Federais na Fonte & EFD-Reinf Série R-4000 (IN RFB 2.043/2021 & 2.145/2023 / R-4010/R-4020)', icon: Receipt },
    { id: 'fci', label: 'FCI - Ficha de Conteúdo de Importação & Alíquota ICMS 4% (Resolução SF 13/2012 / Convênio 38/2013)', icon: Globe2 },
    { id: 'dimeDcip', label: 'DIME & DCIP - Declaração de ICMS de Santa Catarina & Créditos Prévios (Portaria SEF 286/1995 / SAT-SC)', icon: Building2 },
    { id: 'siscredParana', label: 'Siscred Paraná - Conta Corrente e Transferência de Créditos Acumulados de ICMS (NPF 084/2017 & Dec. 7.871/17)', icon: Coins },
    { id: 'dereEconomico', label: 'DeRE - Demonstração de Recursos e Encargos / Balancete Regulatório ANS/BACEN/SUSEP (Schemas XSD v1.1.0)', icon: FileSpreadsheet },
    { id: 'fundosEquilibrioFiscal', label: 'Fundos de Equilíbrio Fiscal Estaduais - FEEF/FOT/PROTEGE Depósito Compulsório 10-15% (Convênio ICMS 42/2016)', icon: Coins },
    { id: 'scpSociedade', label: 'SCP - Sociedade em Conta de Participação & Distribuição Isenta de Lucros (Código Civil Arts. 991-996 / IN RFB 2.179/2024)', icon: Users },
    { id: 'apuracaoEstoquesCusteio', label: 'Apuração de Estoques & Métodos de Custeio PEPS/Média Móvel (CPC 16 R1 / RIR 2018 / Kardex)', icon: Boxes },
    { id: 'cteTransporteFrete', label: 'CT-e & MDF-e - Transporte Rodoviário de Cargas & Crédito ICMS Frete Tomador (Ajuste SINIEF 09/2007)', icon: Truck },
    { id: 'derexSpedEcf', label: 'DEREX & Operações no Exterior - SPED ECF Bloco V & Bloco X (IN RFB 2.003/2021 / DARF 0473 / CIDE 8741)', icon: Globe2 },
    { id: 'dapiMgIcms', label: 'DAPI-MG - Demonstrativo de Apuração do ICMS de Minas Gerais (Decreto nº 48.589/2023 - RICMS-MG)', icon: Building2 },
    { id: 'pcldPerdasCreditos', label: 'PCLD - Provisão para Créditos de Liquidação Duvidosa & Perdas no Recebimento (CPC 48 / Lei nº 9.430/1996)', icon: ShieldAlert },
    { id: 'dctfMensalTradicional', label: 'DCTF Mensal Tradicional - Declaração de Débitos e Créditos Federais (IN RFB nº 2.005/2021 / PVA)', icon: Receipt },
    { id: 'ecdDemonstracoesBlocoJ', label: 'ECD Bloco J - Demonstrações Contábeis Balanço J100, DRE J150 e DMPL J210 (Leiaute 9 / IN RFB 2.003)', icon: FileSpreadsheet },
    { id: 'mepMaisValiaAgio', label: 'Equivalência Patrimonial Avançada & Mais-Valia de Ativos - CPC 15 / CPC 18 (R2) & Lei nº 12.973/2014', icon: PieChart },
    { id: 'consolidacaoCpc36', label: 'Consolidação de Demonstrações Contábeis - CPC 36 (R3) / NBC TG 36 & Lei nº 6.404/76', icon: Layers },
    { id: 'lucroPresumidoEcfP', label: 'Lucro Presumido SPED ECF (Bloco P) - Apuração Trimestral IRPJ 15%+10% e CSLL 9% (Manual ECF & RIR/2018)', icon: Calculator },
    { id: 'lucroRealEcfBlocoN', label: 'Lucro Real SPED ECF (Bloco N) - Cálculo IRPJ (15%+10%) e CSLL (9%) com LALUR/LACS (Manual ECF & RIR/2018)', icon: Calculator },
    { id: 'operacoesExteriorEcfBlocoX', label: 'Operações com o Exterior & Preços de Transferência - SPED ECF Bloco X (Lei nº 14.596/2023 & OCDE)', icon: Globe2 },
    { id: 'ipiSelosControle', label: 'Apuração do IPI & Selos de Controle - Livro Modelo 8 & Bebidas/Cigarros (Dec. 7.212/2010 RIPI)', icon: Factory },
    { id: 'spedFiscalBlocoD', label: 'SPED Fiscal Bloco D - Serviços de Transporte & Comunicação Tomados e Prestados (Guia Prático EFD v3.1.6)', icon: Truck },
    { id: 'spedContribuicoesBloco1', label: 'SPED Contribuições Bloco 1 - Processos Judiciais & Exclusão ICMS da Base do PIS/COFINS (Tema 69 STF)', icon: Scale },
    { id: 'reinfSerieR4000', label: 'EFD-Reinf Série R-4000 - Retenções na Fonte PF/PJ (R-4010, R-4020, R-4040, R-4080 / IN RFB nº 2.043/2021)', icon: Receipt },
    { id: 'spedFiscalBlocoE', label: 'SPED Fiscal Bloco E - Apuração Oficial ICMS Próprio (E110), ICMS-ST (E210) e DIFAL/FCP (E310)', icon: Landmark },
    { id: 'spedFiscalBloc1', label: 'SPED Fiscal Bloco 1 - Meios de Pagamento Eletrônico (1601 DIMP), Créditos Acumulados (1200) e IPM (1400)', icon: CreditCard },
    { id: 'apuracaoFiscal', label: 'Apuração Fiscal (DAS / ICMS / PIS / COFINS)', icon: Calculator },

    // Folha de Pagamento
    { id: 'dashboardFolha', label: 'Dashboard do Departamento Pessoal', icon: Users },
    { id: 'calculoFolha', label: 'Cálculo da Folha Mensal & Holerites A4', icon: Calculator },
    { id: 'esocialRemuneracaoPgtos', label: 'eSocial S-1200 & S-1210 - Remuneração e Pagamentos da Folha (MOS v. S-1.3 Oficial)', icon: FileCode },
    { id: 'sstESocialS2220S2240', label: 'eSocial S-2220 & S-2240 - Saúde e Segurança do Trabalho / SST & PPP Eletrônico (Portaria MTP/RFB 02/2021)', icon: Stethoscope },
    { id: 'catESocialS2210', label: 'eSocial S-2210 - Comunicação de Acidente de Trabalho (CAT) & Emissão em 4 Vias A4 (Portaria SEPRT 4.334/2021)', icon: Ambulance },
    { id: 'tsveESocialS2300', label: 'eSocial TSVE - Trabalhador Sem Vínculo de Emprego (S-2300, S-2306, S-2399 / Estágio Lei 11.788 & Autônomos)', icon: GraduationCap },
    { id: 'esocialRuralS1260', label: 'eSocial S-1260 & S-1280 - Comercialização Produção Rural (Funrural 1,5%) & CPRB Proporcional (MOS v. S-1.3)', icon: Wheat },
    { id: 'processosESocialS2500', label: 'eSocial Processos Trabalhistas & Tributos Judiciais - S-2500 & S-2501 (IRRF RRA Art. 12-A & DARF 6092)', icon: Gavel },

    { id: 'pontoEletronico', label: 'Ponto Eletrônico & Banco de Horas (Portaria 671)', icon: Clock },
    { id: 'sst', label: 'SST & Afastamentos eSocial (S-2210/S-2220/S-2240)', icon: ShieldCheck },
    { id: 'rescisao', label: 'Rescisão Contratual & TRCT Oficial', icon: UserMinus },
    { id: 'colaboradores', label: 'Cadastro de Colaboradores & Sócios', icon: Users },
    { id: 'rubricas', label: 'Tabela de Rubricas & Alíquotas INSS/IRRF', icon: Sliders },

    // Honorários
    { id: 'dashboardHonorarios', label: 'Dashboard Financeiro de Honorários', icon: DollarSign },
    { id: 'faturamentoHonorarios', label: 'Faturamento em Lote & Baixas de Honorários', icon: Receipt },
    { id: 'boletosHonorarios', label: 'Boletos Bancários & Cobrança PIX (CNAB)', icon: CreditCard },
    { id: 'contratosHonorarios', label: 'Contratos Mensais de Clientes (MRR)', icon: FileText }
  ];

  const filteredNav = allModules
    .filter(item => 
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.id.toLowerCase().includes(query.toLowerCase())
    )
    .map(item => {
      const reqPerm = MODULO_PERMISSOES[item.id];
      const hasPerm = !reqPerm || dbService.temPermissao(reqPerm);
      return { ...item, hasPerm };
    });

  const filteredContas = contas
    .filter(c => 
      c.nome.toLowerCase().includes(query.toLowerCase()) || 
      c.classificacao.includes(query) ||
      c.codigoReduzido.toString().includes(query)
    )
    .slice(0, 6);

  const filteredEmpresas = empresas
    .filter(e => e.razaoSocial.toLowerCase().includes(query.toLowerCase()) || e.cnpj.includes(query))
    .slice(0, 3);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4 select-none animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-[#1c1c1c] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra de Pesquisa */}
        <div className="p-3 border-b border-white/10 flex items-center space-x-3 bg-[#222222]">
          <Search className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar rotinas, módulos, contas contábeis ou empresas..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
            }}
            className="flex-1 bg-transparent text-neutral-100 placeholder-neutral-500 text-sm outline-none"
          />
          <kbd className="bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded text-[10px] font-mono border border-white/10">Esc</kbd>
        </div>

        {/* Resultados */}
        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-4 custom-scrollbar">
          {/* Módulos e Rotinas */}
          {filteredNav.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Rotinas & Módulos da Suíte ({filteredNav.length})
              </div>
              <div className="space-y-0.5 mt-1">
                {filteredNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectModule(item.id, item.label, Icon);
                        onClose();
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white/10 text-neutral-200 transition text-left group ${
                        !item.hasPerm ? 'opacity-65' : ''
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${item.hasPerm ? 'text-blue-400 group-hover:scale-110' : 'text-neutral-500'} transition-transform`} />
                      <span className="flex-1 font-medium">{item.label}</span>
                      {!item.hasPerm && (
                        <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                          <Lock className="w-2.5 h-2.5" />
                          Restrito
                        </span>
                      )}
                      {item.hasPerm && (
                        <span className="text-[10px] font-mono text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity">Abrir ↵</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Contas Contábeis */}
          {filteredContas.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Plano de Contas
              </div>
              <div className="space-y-0.5 mt-1">
                {filteredContas.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelectModule('planoContas', 'Plano de Contas', FolderTree);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 text-neutral-200 transition text-left"
                  >
                    <div>
                      <div className="font-medium text-neutral-200">{c.codigoReduzido} - {c.nome}</div>
                      <div className="text-[10px] text-neutral-400 font-mono">{c.classificacao} • {c.natureza === 'D' ? 'Devedora' : 'Credora'}</div>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400">Ver no Plano</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empresas */}
          {filteredEmpresas.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Empresas & Filiais
              </div>
              <div className="space-y-0.5 mt-1">
                {filteredEmpresas.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => {
                      onSelectEmpresa(e.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 text-neutral-200 transition text-left"
                  >
                    <div>
                      <div className="font-medium text-neutral-200">{e.codigo} - {e.razaoSocial}</div>
                      <div className="text-[10px] text-neutral-400 font-mono">{e.cnpj}</div>
                    </div>
                    <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-mono">Ativar Empresa</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredNav.length === 0 && filteredContas.length === 0 && filteredEmpresas.length === 0 && (
            <div className="p-8 text-center text-neutral-500">
              Nenhum resultado encontrado para "{query}".
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-[#171717] border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-400">
          <div className="flex items-center space-x-3">
            <span>Navegue com as setas ou clique</span>
            <span>•</span>
            <span>Pressione <kbd className="bg-neutral-800 px-1 rounded font-mono">Esc</kbd> para fechar</span>
          </div>
          <button
            onClick={() => {
              onNewLancamento();
              onClose();
            }}
            className="text-blue-400 hover:text-blue-300 font-medium"
          >
            + Nova Partida (F2)
          </button>
        </div>
      </div>
    </div>
  );
};
