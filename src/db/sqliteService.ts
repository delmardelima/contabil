import {
  Empresa,
  ContaContabil,
  HistoricoPadrao,
  LancamentoContabil,
  DocumentoStudio,
  CentroCusto,
  LancamentoPadrao,
  LoteContabil,
  Usuario,
  AuditoriaLog,
  ParametrosEmpresa,
  ConfiguracaoRede,
  ModuloSistema,
  AcumuladorFiscal,
  NotaFiscal,
  ApuracaoFiscal,
  Colaborador,
  RubricaFolha,
  FolhaMensal,
  ContratoHonorario,
  FaturaHonorario,
  RegraConciliacao,
  ExtratoTransacao,
  DLPAItem,
  DFCItem,
  ParticipanteFiscal,
  ProdutoServico,
  AtivoImobilizado,
  VariaveisColaborador,
  ProvisaoColaborador,
  CalculoFerias,
  CalculoDecimoTerceiro,
  CalculoRescisao,
  ReajusteContratoLote,
  LinhaLivroEntradas,
  LinhaLivroSaidas,
  ResumoApuracaoICMSLivro,
  ObrigacaoFiscal,
  PropostaDestinacaoResultado,
  SocioDistribuicao,
  AdministradoraCartao,
  VendaCartaoOperadora,
  BalanceteConsolidadoLinha,
  DREConsolidadaLinha,
  GuiaRetencaoFonte,
  ProvisaoItemFolha,
  ProvisaoFolhaResumo,
  ItemDifalApuracao,
  ResumoDifalCompetencia,
  ApuracaoTrimestralIRPJCSLL,
  LancamentoLalurParteA,
  ContaParteBLalur,
  MovimentoParteBLalur,
  ApuracaoLucroRealLalur,
  EventoReinf,
  ResumoReinfCompetencia,
  NfseEmissao,
  ItemCiap,
  ItemCiapCalculado,
  ApuracaoCiapCompetencia,
  EventoESocial,
  ResumoESocialCompetencia,
  RazaoAuxiliarItem,
  ApuracaoDctfWeb,
  BaixaAtivoImobilizado,
  ItemInventarioPatrimonial,
  ImovelRuralLCDPR,
  LancamentoLCDPR,
  ResumoMensalLCDPR,
  MotivoRescisao,
  TipoAvisoPrevio,
  RescisaoContratual,
  LinhaDmpl,
  QuadroDmpl,
  ItemDva,
  DemonstracaoDva,
  ItemInventarioEstoque,
  InventarioEstoqueModelo7,
  AnexoSimplesNacional,
  FaixaSimplesNacional,
  SegregacaoReceitaPgdas,
  ApuracaoPgdas,
  TipoBeneficio,
  BeneficioPlano,
  BeneficioColaboradorItem,
  FechamentoBeneficiosCompetencia,
  LinhaBalancoSocial,
  SecaoBalancoSocial,
  IndicadorCorpoFuncionalIbase,
  BalancoSocialIbase
} from '../types/contabil';

const STORAGE_KEYS = {
  SNAPSHOT: 'contabil_master_snapshot_v3',
  REDE_CONFIG: 'contabil_rede_config_v2',
  CURRENT_USER: 'contabil_current_user_v2'
};

// Seed de dados contábeis profissionais (Padrão CFC / CPC / )
const SEED_EMPRESA: Empresa = {
  id: 1,
  codigo: 1,
  razaoSocial: 'AMIL LABS TECNOLOGIA & AUDITORIA CONTÁBIL LTDA',
  nomeFantasia: 'Amil Labs Contabilidade Digital',
  cnpj: '12.345.678/0001-90',
  inscricaoEstadual: '110.234.567.890',
  inscricaoMunicipal: '4.567.890-1',
  inscricaoSuframa: '90.123.456-7',
  nire: '35212345678',
  dataConstituicao: '2018-05-10',
  naturezaJuridica: '206-2 - Sociedade Empresária Limitada',
  porteEmpresa: 'ME',
  logradouro: 'Avenida Paulista',
  numero: '1500',
  complemento: 'Andar 14 - Cj 1401',
  bairro: 'Bela Vista',
  cidade: 'São Paulo',
  uf: 'SP',
  cep: '01310-200',
  codigoIbge: '3550308',
  cnaePrincipal: '6920-6/01',
  cnaesSecundarios: ['7020-4/00', '8219-9/99', '6201-5/01'],
  anexoPadraoSimples: 'ANEXO_III',
  fatorR: true,
  aliquotaISS: 5.0,
  fpas: '515',
  codigoTerceiros: '0115',
  rat: 2.0,
  fap: 1.0,
  telefone: '(11) 3245-8900',
  email: 'contato@amillabs.com.br',
  regimeTributario: 'LUCRO_PRESUMIDO',
  responsavelLegal: 'Carlos Eduardo Mendes',
  cpfResponsavel: '123.456.789-00',
  contadorNome: 'Dra. Helena Silveira Santos',
  contadorCRC: 'CRC-SP 1SP234567/O-8',
  contadorCPF: '987.654.321-11',
  mascaraPlano: '1.01.01.001.0001',
  exigeCentroCusto: true,
  exercicioAtivo: 2026,
  competenciaAtiva: '2026-10',
  socios: [
    {
      id: 1,
      nome: 'Carlos Eduardo Mendes',
      cpf: '123.456.789-00',
      qualificacaoRFB: '49 - Sócio-Administrador',
      percentualCapital: 60,
      dataEntrada: '2018-05-10',
      retiraProLabore: true,
      valorProLabore: 7500.00,
      percentualLucros: 60
    },
    {
      id: 2,
      nome: 'Dra. Mariana Costa Mendes',
      cpf: '234.567.890-11',
      qualificacaoRFB: '22 - Sócio',
      percentualCapital: 40,
      dataEntrada: '2018-05-10',
      retiraProLabore: false,
      percentualLucros: 40
    }
  ],
  vigencias: [
    {
      id: 1,
      inicioCompetencia: '2024-01',
      fimCompetencia: '2024-12',
      regimeTributario: 'SIMPLES_NACIONAL',
      regimeApuracao: 'COMPETENCIA',
      enquadramentoSimples: 'MICROEMPRESA'
    },
    {
      id: 2,
      inicioCompetencia: '2025-01',
      regimeTributario: 'LUCRO_PRESUMIDO',
      regimeApuracao: 'COMPETENCIA'
    }
  ]
};

const SEED_PARAMETROS: ParametrosEmpresa = {
  empresaId: 1,
  regimeContabil: 'COMPETENCIA',
  bloquearLancamentosAte: '2025-12-31',
  obrigaCentroCusto: false,
  permiteDiferencaDxC: true,
  avancaPaginaTrocaGrupo: true,
  contaDestinoZeramentoId: 41, // ARE
  contaLucrosAcumuladosId: 40,
  contaPrejuizosAcumuladosId: 40,
  numeroLivroDiario: 1,
  numeroFolhaInicial: 1
};

const SEED_CENTROS_CUSTO: CentroCusto[] = [
  { id: 1, empresaId: 1, codigo: '01', nome: 'ADMINISTRAÇÃO GERAL', tipo: 'S' },
  { id: 2, empresaId: 1, codigo: '01.01', nome: 'Diretoria e Jurídico', tipo: 'A' },
  { id: 3, empresaId: 1, codigo: '01.02', nome: 'Financeiro e Contabilidade', tipo: 'A' },
  { id: 4, empresaId: 1, codigo: '02', nome: 'OPERAÇÕES E ENGENHARIA', tipo: 'S' },
  { id: 5, empresaId: 1, codigo: '02.01', nome: 'Desenvolvimento e Software', tipo: 'A' },
  { id: 6, empresaId: 1, codigo: '02.02', nome: 'Auditoria e Consultoria Externa', tipo: 'A' }
];

const SEED_LOTES: LoteContabil[] = [
  {
    id: 1,
    empresaId: 1,
    numero: 1,
    descricao: 'Lote Mensal de Abertura e Movimento - 10/2026',
    dataLote: '2026-10-01',
    status: 'FECHADO',
    totalDebito: 112700.00,
    totalCredito: 112700.00
  }
];

const SEED_LANCAMENTOS_PADRAO: LancamentoPadrao[] = [
  {
    id: 1,
    empresaId: 1,
    codigo: 101,
    descricao: 'Recebimento de Cliente via Banco Itaú',
    contaDebitoId: 6, // Banco Itaú
    contaCreditoId: 11, // Duplicatas a Receber
    historicoId: 1,
    complemento: 'Ref. liquidação de títulos clientes'
  },
  {
    id: 2,
    empresaId: 1,
    codigo: 102,
    descricao: 'Pagamento de Fornecedor via Itaú',
    contaDebitoId: 30, // Fornecedores
    contaCreditoId: 6, // Banco Itaú
    historicoId: 2,
    complemento: 'Ref. quitação de duplicata fornecedor'
  },
  {
    id: 3,
    empresaId: 1,
    codigo: 103,
    descricao: 'Apropriação da Folha Salarial',
    contaDebitoId: 56, // Despesas com Salários
    contaCreditoId: 26, // Salários a Pagar
    historicoId: 3,
    complemento: 'Competência mensal folha'
  }
];

const SEED_USUARIOS: Usuario[] = [
  {
    id: 1,
    nome: 'Dra. Helena Silveira Santos (Contadora Chefe)',
    login: 'admin',
    perfil: 'ADMIN',
    email: 'helena.santos@amillabs.com.br',
    ativo: true
  },
  {
    id: 2,
    nome: 'Marcos Vinicius Rezende (Analista Sênior)',
    login: 'marcos',
    perfil: 'ANALISTA',
    email: 'marcos.rezende@amillabs.com.br',
    ativo: true
  },
  {
    id: 3,
    nome: 'Juliana Beatriz Costa (Assistente Contábil)',
    login: 'juliana',
    perfil: 'ASSISTENTE',
    email: 'juliana.costa@amillabs.com.br',
    ativo: true
  }
];

const SEED_AUDITORIA: AuditoriaLog[] = [
  {
    id: 1,
    dataHora: '2026-10-01 08:30:12',
    usuarioNome: 'Dra. Helena Silveira Santos',
    modulo: 'ADMINISTRAÇÃO',
    acao: 'INICIALIZAÇÃO',
    descricao: 'Abertura do exercício social 2026 e importação do plano referencial.'
  },
  {
    id: 2,
    dataHora: '2026-10-02 10:02:45',
    usuarioNome: 'Marcos Vinicius Rezende',
    modulo: 'LANÇAMENTOS',
    acao: 'INCLUSÃO',
    descricao: 'Partida nº 1 gravada no valor de R$ 45.000,00.'
  }
];

// Plano de Contas Referencial  / CFC
const SEED_CONTAS: ContaContabil[] = [
  // 1. ATIVO
  { id: 1, empresaId: 1, classificacao: '1', codigoReduzido: 1, nome: 'ATIVO TOTAL', tipo: 'S', natureza: 'D', grau: 1, saldoAnterior: 1050300.50 },
  { id: 2, empresaId: 1, classificacao: '1.01', codigoReduzido: 10, nome: 'ATIVO CIRCULANTE', tipo: 'S', natureza: 'D', grau: 2, saldoAnterior: 650300.50 },
  { id: 3, empresaId: 1, classificacao: '1.01.01', codigoReduzido: 100, nome: 'Disponibilidades Financeiras', tipo: 'S', natureza: 'D', grau: 3, saldoAnterior: 310300.50 },
  { id: 4, empresaId: 1, classificacao: '1.01.01.001', codigoReduzido: 1001, nome: 'Caixa Geral', tipo: 'S', natureza: 'D', grau: 4, saldoAnterior: 15300.50 },
  { id: 5, empresaId: 1, classificacao: '1.01.01.001.0001', codigoReduzido: 101, nome: 'Caixa Pequeno Escritório', tipo: 'A', natureza: 'D', grau: 5, saldoAnterior: 15300.50 },
  { id: 6, empresaId: 1, classificacao: '1.01.01.002.0001', codigoReduzido: 102, nome: 'Banco Itaú S/A - Ag. 0912 C/C 45120-8', tipo: 'A', natureza: 'D', grau: 5, saldoAnterior: 295000.00 },
  { id: 10, empresaId: 1, classificacao: '1.01.02', codigoReduzido: 110, nome: 'Créditos e Contas a Receber', tipo: 'S', natureza: 'D', grau: 3, saldoAnterior: 240000.00 },
  { id: 11, empresaId: 1, classificacao: '1.01.02.001.0001', codigoReduzido: 111, nome: 'Clientes - Duplicatas a Receber', tipo: 'A', natureza: 'D', grau: 5, saldoAnterior: 240000.00 },
  { id: 14, empresaId: 1, classificacao: '1.01.03', codigoReduzido: 120, nome: 'Estoques e Mercadorias', tipo: 'S', natureza: 'D', grau: 3, saldoAnterior: 100000.00 },
  { id: 15, empresaId: 1, classificacao: '1.01.03.001.0001', codigoReduzido: 121, nome: 'Estoque de Mercadorias para Revenda', tipo: 'A', natureza: 'D', grau: 5, saldoAnterior: 100000.00 },
  { id: 16, empresaId: 1, classificacao: '1.01.04.001.0001', codigoReduzido: 131, nome: 'ICMS a Recuperar', tipo: 'A', natureza: 'D', grau: 5, saldoAnterior: 18000.00 },
  { id: 17, empresaId: 1, classificacao: '1.01.04.002.0001', codigoReduzido: 132, nome: 'PIS/COFINS a Recuperar', tipo: 'A', natureza: 'D', grau: 5, saldoAnterior: 7500.00 },
  { id: 18, empresaId: 1, classificacao: '1.02', codigoReduzido: 20, nome: 'ATIVO NÃO CIRCULANTE', tipo: 'S', natureza: 'D', grau: 2, saldoAnterior: 400000.00 },
  { id: 19, empresaId: 1, classificacao: '1.02.01.001.0001', codigoReduzido: 201, nome: 'Imóveis Administrativos Sede', tipo: 'A', natureza: 'D', grau: 5, saldoAnterior: 300000.00 },
  { id: 20, empresaId: 1, classificacao: '1.02.01.002.0001', codigoReduzido: 202, nome: 'Equipamentos de Informática e Servidores', tipo: 'A', natureza: 'D', grau: 5, saldoAnterior: 100000.00 },

  // 2. PASSIVO E PATRIMÔNIO LÍQUIDO
  { id: 21, empresaId: 1, classificacao: '2', codigoReduzido: 2, nome: 'PASSIVO E PATRIMÔNIO LÍQUIDO', tipo: 'S', natureza: 'C', grau: 1, saldoAnterior: 1050300.50 },
  { id: 22, empresaId: 1, classificacao: '2.01', codigoReduzido: 21, nome: 'PASSIVO CIRCULANTE', tipo: 'S', natureza: 'C', grau: 2, saldoAnterior: 241300.00 },
  { id: 26, empresaId: 1, classificacao: '2.01.01.001.0001', codigoReduzido: 301, nome: 'Salários e Ordenados a Pagar', tipo: 'A', natureza: 'C', grau: 5, saldoAnterior: 35000.00 },
  { id: 27, empresaId: 1, classificacao: '2.01.01.002.0001', codigoReduzido: 302, nome: 'INSS e Previdência Social a Recolher', tipo: 'A', natureza: 'C', grau: 5, saldoAnterior: 9800.00 },
  { id: 28, empresaId: 1, classificacao: '2.01.01.003.0001', codigoReduzido: 303, nome: 'FGTS a Recolher', tipo: 'A', natureza: 'C', grau: 5, saldoAnterior: 3200.00 },
  { id: 29, empresaId: 1, classificacao: '2.01.02.001.0001', codigoReduzido: 311, nome: 'Simples Nacional / DAS a Recolher', tipo: 'A', natureza: 'C', grau: 5, saldoAnterior: 12500.00 },
  { id: 30, empresaId: 1, classificacao: '2.01.03.001.0001', codigoReduzido: 321, nome: 'Fornecedores Nacionais a Pagar', tipo: 'A', natureza: 'C', grau: 5, saldoAnterior: 180800.00 },
  { id: 35, empresaId: 1, classificacao: '2.03', codigoReduzido: 23, nome: 'PATRIMÔNIO LÍQUIDO', tipo: 'S', natureza: 'C', grau: 2, saldoAnterior: 809000.50 },
  { id: 36, empresaId: 1, classificacao: '2.03.01.001.0001', codigoReduzido: 501, nome: 'Capital Social Integralizado', tipo: 'A', natureza: 'C', grau: 5, saldoAnterior: 600000.00 },
  { id: 37, empresaId: 1, classificacao: '2.03.02.001.0001', codigoReduzido: 502, nome: 'Reserva Legal', tipo: 'A', natureza: 'C', grau: 5, saldoAnterior: 50000.00 },
  { id: 40, empresaId: 1, classificacao: '2.03.03.001.0001', codigoReduzido: 505, nome: 'Lucros ou Prejuízos Acumulados', tipo: 'A', natureza: 'C', grau: 5, saldoAnterior: 159000.50 },
  { id: 41, empresaId: 1, classificacao: '2.03.04.001.0001', codigoReduzido: 599, nome: 'Conta Transitória de ARE', tipo: 'A', natureza: 'C', grau: 5, saldoAnterior: 0.00 },

  // 3. RECEITAS
  { id: 42, empresaId: 1, classificacao: '3', codigoReduzido: 3, nome: 'RECEITAS OPERACIONAIS', tipo: 'S', natureza: 'C', grau: 1, saldoAnterior: 0 },
  { id: 43, empresaId: 1, classificacao: '3.01.01.001.0001', codigoReduzido: 601, nome: 'Receita Bruta com Venda de Mercadorias', tipo: 'A', natureza: 'C', grau: 5, saldoAnterior: 0 },
  { id: 44, empresaId: 1, classificacao: '3.01.01.002.0001', codigoReduzido: 602, nome: 'Receita com Prestação de Serviços Digitais', tipo: 'A', natureza: 'C', grau: 5, saldoAnterior: 0 },
  { id: 45, empresaId: 1, classificacao: '3.01.02.001.0001', codigoReduzido: 611, nome: '(-) Tributos Incidentes sobre Vendas', tipo: 'A', natureza: 'D', grau: 5, saldoAnterior: 0 },

  // 4. DESPESAS E CUSTOS
  { id: 50, empresaId: 1, classificacao: '4', codigoReduzido: 4, nome: 'CUSTOS E DESPESAS OPERACIONAIS', tipo: 'S', natureza: 'D', grau: 1, saldoAnterior: 0 },
  { id: 55, empresaId: 1, classificacao: '4.01.01.001.0001', codigoReduzido: 701, nome: 'Custo das Mercadorias Vendidas (CMV)', tipo: 'A', natureza: 'D', grau: 5, saldoAnterior: 0 },
  { id: 56, empresaId: 1, classificacao: '4.01.02.001.0001', codigoReduzido: 711, nome: 'Despesas com Salários e Ordenados', tipo: 'A', natureza: 'D', grau: 5, saldoAnterior: 0 },
  { id: 57, empresaId: 1, classificacao: '4.01.02.002.0001', codigoReduzido: 712, nome: 'Despesas com Serviços de TI e Nuvem', tipo: 'A', natureza: 'D', grau: 5, saldoAnterior: 0 },
  { id: 58, empresaId: 1, classificacao: '4.01.03.001.0001', codigoReduzido: 721, nome: 'Despesas com Tarifas Bancárias', tipo: 'A', natureza: 'D', grau: 5, saldoAnterior: 0 },
  { id: 59, empresaId: 1, classificacao: '4.01.04.001.0001', codigoReduzido: 731, nome: 'Despesas de Aluguel e Instalações', tipo: 'A', natureza: 'D', grau: 5, saldoAnterior: 0 }
];

const SEED_LANCAMENTOS: LancamentoContabil[] = [
  {
    id: 1,
    empresaId: 1,
    numeroPartida: 1,
    loteId: 1,
    dataLancamento: '2026-10-02',
    tipoPartida: 'SIMPLES',
    contaDebitoId: 6, // Banco Itaú
    contaCreditoId: 44, // Receita de Serviços
    valor: 45000.00,
    historicoId: 1,
    complementoHistorico: 'Ref. Contrato anual de suporte e licença software',
    createdAt: '2026-10-02T10:00:00Z'
  },
  {
    id: 2,
    empresaId: 1,
    numeroPartida: 2,
    loteId: 1,
    dataLancamento: '2026-10-05',
    tipoPartida: 'SIMPLES',
    contaDebitoId: 56, // Despesas com Salários
    contaCreditoId: 26, // Salários a Pagar
    valor: 28500.00,
    historicoId: 3,
    complementoHistorico: 'Competência 10/2026 equipe técnica e desenvolvimento',
    createdAt: '2026-10-05T14:30:00Z'
  },
  {
    id: 3,
    empresaId: 1,
    numeroPartida: 3,
    loteId: 1,
    dataLancamento: '2026-10-07',
    tipoPartida: 'SIMPLES',
    contaDebitoId: 26, // Salários a Pagar
    contaCreditoId: 6, // Banco Itaú
    valor: 28500.00,
    historicoId: 2,
    complementoHistorico: 'Liquidação da folha via TED em lote Itaú',
    createdAt: '2026-10-07T11:15:00Z'
  },
  {
    id: 4,
    empresaId: 1,
    numeroPartida: 4,
    loteId: 1,
    dataLancamento: '2026-10-10',
    tipoPartida: 'SIMPLES',
    contaDebitoId: 57, // Despesas TI/Nuvem
    contaCreditoId: 6, // Banco Itaú
    valor: 4200.00,
    historicoId: 2,
    complementoHistorico: 'AWS Cloud Services fatura #94821',
    createdAt: '2026-10-10T16:00:00Z'
  },
  {
    id: 5,
    empresaId: 1,
    numeroPartida: 5,
    loteId: 1,
    dataLancamento: '2026-10-12',
    tipoPartida: 'SIMPLES',
    contaDebitoId: 59, // Aluguel
    contaCreditoId: 6, // Banco Itaú
    valor: 6500.00,
    historicoId: 2,
    complementoHistorico: 'Locação conjunto 1401 Edifício Trade Center',
    createdAt: '2026-10-12T09:20:00Z'
  }
];

const SEED_DOCUMENTOS: DocumentoStudio[] = [
  {
    id: 1,
    empresaId: 1,
    titulo: 'Notas Explicativas - Exercício 2026',
    tipo: 'NOTA_EXPLICATIVA',
    exercicioAno: 2026,
    conteudoHtml: '<h2>1. Contexto Operacional</h2><p>A <strong>AMIL LABS TECNOLOGIA & AUDITORIA CONTÁBIL LTDA</strong> atua no desenvolvimento de software de alta performance e auditoria contábil digital.</p><h2>2. Apresentação das Demonstrações</h2><p>Demonstrações elaboradas em consonância com as Normas Brasileiras de Contabilidade (NBC TG / CPC).</p>',
    updatedAt: new Date().toISOString()
  }
];

const SEED_HISTORICOS: HistoricoPadrao[] = [
  { id: 1, empresaId: 1, codigo: 1, descricao: 'Recebimento de cliente referente a serviços prestados' },
  { id: 2, empresaId: 1, codigo: 2, descricao: 'Pagamento efetuado a fornecedores via transferência bancária' },
  { id: 3, empresaId: 1, codigo: 3, descricao: 'Valor referente à provisão da folha de pagamento mensal' },
  { id: 4, empresaId: 1, codigo: 4, descricao: 'Despesa com tarifa bancária e manutenção de conta' }
];

// Seeds Multi-Módulo (Escrita, Folha, Honorários, Conciliação)
const SEED_ACUMULADORES: AcumuladorFiscal[] = [
  {
    id: 1,
    empresaId: 1,
    codigo: 1,
    descricao: 'Compra de Mercadorias para Comercialização',
    cfopPadrao: '1.102',
    tipoOperacao: 'ENTRADA',
    incideICMS: true,
    aliquotaICMS: 18.0,
    incidePIS: true,
    aliquotaPIS: 1.65,
    incideCOFINS: true,
    aliquotaCOFINS: 7.6,
    incideISS: false,
    incideSimples: false,
    contaContabilDebitoId: 15, // Estoque
    contaContabilCreditoId: 30, // Fornecedores
    contaICMSDebitoId: 16, // ICMS a Recuperar
    contaICMSCreditoId: 30,
    historicoId: 2
  },
  {
    id: 2,
    empresaId: 1,
    codigo: 2,
    descricao: 'Venda de Mercadorias no Estado',
    cfopPadrao: '5.102',
    tipoOperacao: 'SAIDA',
    incideICMS: true,
    aliquotaICMS: 18.0,
    incidePIS: true,
    aliquotaPIS: 0.65,
    incideCOFINS: true,
    aliquotaCOFINS: 3.0,
    incideISS: false,
    incideSimples: true,
    contaContabilDebitoId: 11, // Clientes
    contaContabilCreditoId: 43, // Receita Vendas
    historicoId: 1
  },
  {
    id: 3,
    empresaId: 1,
    codigo: 3,
    descricao: 'Prestação de Serviços de Desenvolvimento e Consultoria',
    cfopPadrao: '5.933',
    tipoOperacao: 'SERVICO',
    incideICMS: false,
    incidePIS: true,
    aliquotaPIS: 0.65,
    incideCOFINS: true,
    aliquotaCOFINS: 3.0,
    incideISS: true,
    aliquotaISS: 5.0,
    incideSimples: true,
    contaContabilDebitoId: 11, // Clientes
    contaContabilCreditoId: 44, // Receita Serviços
    historicoId: 1
  },
  {
    id: 4,
    empresaId: 1,
    codigo: 4,
    descricao: 'Aquisição de Serviços Tomados (Nuvem / TI)',
    cfopPadrao: '1.933',
    tipoOperacao: 'ENTRADA',
    incideICMS: false,
    incidePIS: false,
    incideCOFINS: false,
    incideISS: true,
    aliquotaISS: 5.0,
    incideSimples: false,
    contaContabilDebitoId: 57, // Despesas TI
    contaContabilCreditoId: 30, // Fornecedores
    historicoId: 2
  }
];

const SEED_NOTAS_FISCAIS: NotaFiscal[] = [
  {
    id: 1,
    empresaId: 1,
    numero: 1051,
    serie: '1',
    modelo: '55',
    chaveAcesso: '35261012345678000190550010000010511234567890',
    dataEmissao: '2026-10-02',
    dataEntradaSaida: '2026-10-02',
    tipo: 'SAIDA',
    acumuladorId: 3,
    cfop: '5.933',
    clienteFornecedorNome: 'BANCO DIGITAL ALPHA S/A',
    clienteFornecedorCnpj: '09.876.543/0001-21',
    valorTotal: 45000.00,
    baseCalculoICMS: 0,
    valorICMS: 0,
    baseCalculoPIS: 45000.00,
    valorPIS: 292.50,
    baseCalculoCOFINS: 45000.00,
    valorCOFINS: 1350.00,
    baseCalculoISS: 45000.00,
    valorISS: 2250.00,
    retencaoIRRF: 675.00,
    integradaContabil: true,
    itens: [
      {
        id: 101,
        numeroItem: 1,
        codigoProduto: 'SRV-001',
        descricao: 'Consultoria e Auditoria Contábil Empresarial Mensal',
        ncm: '00000000',
        cfop: '5.933',
        unidade: 'UN',
        quantidade: 1,
        valorUnitario: 45000.00,
        valorTotal: 45000.00,
        cstPIS: '01',
        baseCalculoPIS: 45000.00,
        aliquotaPIS: 0.65,
        valorPIS: 292.50,
        cstCOFINS: '01',
        baseCalculoCOFINS: 45000.00,
        aliquotaCOFINS: 3.0,
        valorCOFINS: 1350.00
      }
    ]
  },
  {
    id: 2,
    empresaId: 1,
    numero: 8820,
    serie: 'E',
    modelo: '55',
    chaveAcesso: '35261001234567000188550010000088201987654321',
    dataEmissao: '2026-10-08',
    dataEntradaSaida: '2026-10-08',
    tipo: 'ENTRADA',
    acumuladorId: 4,
    cfop: '1.933',
    clienteFornecedorNome: 'AMAZON WEB SERVICES BRASIL LTDA',
    clienteFornecedorCnpj: '15.419.093/0001-44',
    valorTotal: 12800.00,
    baseCalculoICMS: 0,
    valorICMS: 0,
    baseCalculoPIS: 0,
    valorPIS: 0,
    baseCalculoCOFINS: 0,
    valorCOFINS: 0,
    baseCalculoISS: 12800.00,
    valorISS: 640.00,
    retencaoIRRF: 192.00,
    retencaoCSRF: 595.20,
    integradaContabil: false,
    itens: [
      {
        id: 201,
        numeroItem: 1,
        codigoProduto: 'SRV-AWS',
        descricao: 'Hospedagem em Nuvem e Infraestrutura Cloud Dedicada',
        ncm: '00000000',
        cfop: '1.933',
        unidade: 'UN',
        quantidade: 1,
        valorUnitario: 12800.00,
        valorTotal: 12800.00
      }
    ]
  },
  {
    id: 3,
    empresaId: 1,
    numero: 1052,
    serie: '1',
    modelo: '55',
    chaveAcesso: '35261012345678000190550010000010521234567891',
    dataEmissao: '2026-10-15',
    dataEntradaSaida: '2026-10-15',
    tipo: 'SAIDA',
    acumuladorId: 3,
    cfop: '5.933',
    clienteFornecedorNome: 'GRUPO VAREJO BRASIL S/A',
    clienteFornecedorCnpj: '33.111.222/0001-88',
    valorTotal: 38500.00,
    baseCalculoICMS: 0,
    valorICMS: 0,
    baseCalculoPIS: 38500.00,
    valorPIS: 250.25,
    baseCalculoCOFINS: 38500.00,
    valorCOFINS: 1155.00,
    baseCalculoISS: 38500.00,
    valorISS: 1925.00,
    retencaoIRRF: 577.50,
    integradaContabil: false,
    itens: [
      {
        id: 301,
        numeroItem: 1,
        codigoProduto: 'SRV-002',
        descricao: 'Implantação de ERP Contábil e Treinamento de Equipe',
        ncm: '00000000',
        cfop: '5.933',
        unidade: 'UN',
        quantidade: 1,
        valorUnitario: 38500.00,
        valorTotal: 38500.00,
        cstPIS: '01',
        baseCalculoPIS: 38500.00,
        aliquotaPIS: 0.65,
        valorPIS: 250.25,
        cstCOFINS: '01',
        baseCalculoCOFINS: 38500.00,
        aliquotaCOFINS: 3.0,
        valorCOFINS: 1155.00
      }
    ]
  },
  {
    id: 4,
    empresaId: 1,
    numero: 2040,
    serie: '1',
    modelo: '55',
    chaveAcesso: '35261012345678000190550010000020401234567892',
    dataEmissao: '2026-10-18',
    dataEntradaSaida: '2026-10-18',
    tipo: 'SAIDA',
    acumuladorId: 1,
    cfop: '5.102',
    clienteFornecedorNome: 'INDÚSTRIA E COMÉRCIO BETA LTDA',
    clienteFornecedorCnpj: '45.678.901/0001-34',
    valorTotal: 52000.00,
    baseCalculoICMS: 52000.00,
    valorICMS: 9360.00,
    baseCalculoPIS: 52000.00,
    valorPIS: 338.00,
    baseCalculoCOFINS: 52000.00,
    valorCOFINS: 1560.00,
    baseCalculoISS: 0,
    valorISS: 0,
    integradaContabil: false,
    itens: [
      {
        id: 401,
        numeroItem: 1,
        codigoProduto: 'EQP-001',
        descricao: 'Servidor Dell PowerEdge R650 32GB Xeon Silver',
        ncm: '84715010',
        cfop: '5.102',
        unidade: 'UN',
        quantidade: 2,
        valorUnitario: 21000.00,
        valorTotal: 42000.00,
        cstICMS: '00',
        baseCalculoICMS: 42000.00,
        aliquotaICMS: 18.0,
        valorICMS: 7560.00,
        cstPIS: '01',
        baseCalculoPIS: 42000.00,
        aliquotaPIS: 0.65,
        valorPIS: 273.00,
        cstCOFINS: '01',
        baseCalculoCOFINS: 42000.00,
        aliquotaCOFINS: 3.0,
        valorCOFINS: 1260.00
      },
      {
        id: 402,
        numeroItem: 2,
        codigoProduto: 'MON-001',
        descricao: 'Monitor Profissional Dell UltraSharp 27" 4K IPS',
        ncm: '85285220',
        cfop: '5.102',
        unidade: 'UN',
        quantidade: 4,
        valorUnitario: 2500.00,
        valorTotal: 10000.00,
        cstICMS: '00',
        baseCalculoICMS: 10000.00,
        aliquotaICMS: 18.0,
        valorICMS: 1800.00,
        cstPIS: '01',
        baseCalculoPIS: 10000.00,
        aliquotaPIS: 0.65,
        valorPIS: 65.00,
        cstCOFINS: '01',
        baseCalculoCOFINS: 10000.00,
        aliquotaCOFINS: 3.0,
        valorCOFINS: 300.00
      }
    ]
  },
  {
    id: 5,
    empresaId: 1,
    numero: 2041,
    serie: '1',
    modelo: '55',
    chaveAcesso: '35261012345678000190550010000020411234567893',
    dataEmissao: '2026-10-22',
    dataEntradaSaida: '2026-10-22',
    tipo: 'SAIDA',
    acumuladorId: 1,
    cfop: '5.405',
    clienteFornecedorNome: 'AUTO PEÇAS E CENTRO AUTOMOTIVO VELOZ LTDA',
    clienteFornecedorCnpj: '21.435.678/0001-99',
    valorTotal: 42000.00,
    baseCalculoICMS: 0,
    valorICMS: 0,
    baseCalculoPIS: 0,
    valorPIS: 0,
    baseCalculoCOFINS: 0,
    valorCOFINS: 0,
    baseCalculoISS: 0,
    valorISS: 0,
    integradaContabil: false,
    itens: [
      {
        id: 501,
        numeroItem: 1,
        codigoProduto: 'AUT-001',
        descricao: 'Bateria Automotiva Heliar Free 60Ah 12V Selada (ST + Monofásico)',
        ncm: '85071010',
        cfop: '5.405',
        unidade: 'PC',
        quantidade: 50,
        valorUnitario: 520.00,
        valorTotal: 26000.00,
        cstICMS: '60', // ICMS ST Cobrado Anteriormente
        baseCalculoICMS: 0,
        aliquotaICMS: 0,
        valorICMS: 0,
        cstPIS: '04', // Monofásico Alíquota Zero no Varejo
        baseCalculoPIS: 0,
        aliquotaPIS: 0,
        valorPIS: 0,
        cstCOFINS: '04',
        baseCalculoCOFINS: 0,
        aliquotaCOFINS: 0,
        valorCOFINS: 0
      },
      {
        id: 502,
        numeroItem: 2,
        codigoProduto: 'AUT-002',
        descricao: 'Óleo Lubrificante Sintético Mobil 1 5W-30 Galão 4L (ST + Monofásico)',
        ncm: '27101932',
        cfop: '5.405',
        unidade: 'GL',
        quantidade: 80,
        valorUnitario: 200.00,
        valorTotal: 16000.00,
        cstICMS: '60',
        baseCalculoICMS: 0,
        aliquotaICMS: 0,
        valorICMS: 0,
        cstPIS: '04',
        baseCalculoPIS: 0,
        aliquotaPIS: 0,
        valorPIS: 0,
        cstCOFINS: '04',
        baseCalculoCOFINS: 0,
        aliquotaCOFINS: 0,
        valorCOFINS: 0
      }
    ]
  },
  {
    id: 6,
    empresaId: 1,
    numero: 9105,
    serie: '1',
    modelo: '55',
    chaveAcesso: '43261072381189000110550010000091051987654322',
    dataEmissao: '2026-10-10',
    dataEntradaSaida: '2026-10-12',
    tipo: 'ENTRADA',
    acumuladorId: 2,
    cfop: '1.102',
    clienteFornecedorNome: 'DELL COMPUTADORES DO BRASIL LTDA',
    clienteFornecedorCnpj: '72.381.189/0001-10',
    valorTotal: 36000.00,
    baseCalculoICMS: 36000.00,
    valorICMS: 6480.00, // 18% Creditado
    baseCalculoPIS: 36000.00,
    valorPIS: 234.00,
    baseCalculoCOFINS: 36000.00,
    valorCOFINS: 1080.00,
    baseCalculoISS: 0,
    valorISS: 0,
    integradaContabil: false,
    itens: [
      {
        id: 601,
        numeroItem: 1,
        codigoProduto: 'EQP-001',
        descricao: 'Servidor Dell PowerEdge R650 32GB Xeon Silver',
        ncm: '84715010',
        cfop: '1.102',
        unidade: 'UN',
        quantidade: 2,
        valorUnitario: 18000.00,
        valorTotal: 36000.00,
        cstICMS: '00',
        baseCalculoICMS: 36000.00,
        aliquotaICMS: 18.0,
        valorICMS: 6480.00,
        cstPIS: '50',
        baseCalculoPIS: 36000.00,
        aliquotaPIS: 0.65,
        valorPIS: 234.00,
        cstCOFINS: '50',
        baseCalculoCOFINS: 36000.00,
        aliquotaCOFINS: 3.0,
        valorCOFINS: 1080.00
      }
    ]
  },
  {
    id: 7,
    empresaId: 1,
    numero: 9106,
    serie: '1',
    modelo: '55',
    chaveAcesso: '35261061222333000144550010000091061987654323',
    dataEmissao: '2026-10-14',
    dataEntradaSaida: '2026-10-16',
    tipo: 'ENTRADA',
    acumuladorId: 2,
    cfop: '1.403',
    clienteFornecedorNome: 'DISTRIBUIDORA NACIONAL DE AUTOPEÇAS S/A',
    clienteFornecedorCnpj: '61.222.333/0001-44',
    valorTotal: 28000.00,
    baseCalculoICMS: 0,
    valorICMS: 0, // ST já recolhido pelo substituto
    baseCalculoPIS: 0,
    valorPIS: 0,
    baseCalculoCOFINS: 0,
    valorCOFINS: 0,
    baseCalculoISS: 0,
    valorISS: 0,
    integradaContabil: false,
    itens: [
      {
        id: 701,
        numeroItem: 1,
        codigoProduto: 'AUT-001',
        descricao: 'Bateria Automotiva Heliar Free 60Ah 12V Selada',
        ncm: '85071010',
        cfop: '1.403',
        unidade: 'PC',
        quantidade: 70,
        valorUnitario: 400.00,
        valorTotal: 28000.00,
        cstICMS: '60',
        baseCalculoICMS: 0,
        aliquotaICMS: 0,
        valorICMS: 0
      }
    ]
  },
  {
    id: 8,
    empresaId: 1,
    numero: 9107,
    serie: '1',
    modelo: '55',
    chaveAcesso: '35261043210987000112550010000091071987654324',
    dataEmissao: '2026-10-20',
    dataEntradaSaida: '2026-10-21',
    tipo: 'ENTRADA',
    acumuladorId: 2,
    cfop: '1.556',
    clienteFornecedorNome: 'KALUNGA COMÉRCIO E INDÚSTRIA GRÁFICA LTDA',
    clienteFornecedorCnpj: '43.210.987/0001-12',
    valorTotal: 4500.00,
    baseCalculoICMS: 0,
    valorICMS: 0,
    baseCalculoPIS: 0,
    valorPIS: 0,
    baseCalculoCOFINS: 0,
    valorCOFINS: 0,
    baseCalculoISS: 0,
    valorISS: 0,
    integradaContabil: false,
    itens: [
      {
        id: 801,
        numeroItem: 1,
        codigoProduto: 'MAT-001',
        descricao: 'Papel Sulfite A4 Report 75g Caixa com 10 Resmas e Suprimentos de Escritório',
        ncm: '48025610',
        cfop: '1.556',
        unidade: 'CX',
        quantidade: 15,
        valorUnitario: 300.00,
        valorTotal: 4500.00,
        cstICMS: '90',
        baseCalculoICMS: 0,
        aliquotaICMS: 0,
        valorICMS: 0
      }
    ]
  }
];

const SEED_APURACOES_FISCAIS: ApuracaoFiscal[] = [
  {
    id: 1,
    empresaId: 1,
    competencia: '2026-10',
    regimeTributario: 'LUCRO_PRESUMIDO',
    faturamentoTotal: 83500.00,
    rbt12: 980000.00,
    valorPISApurado: 542.75,
    valorCOFINSApurado: 2505.00,
    valorISSApurado: 4175.00,
    valorIRPJApurado: 4008.00,
    valorCSLLApurado: 2404.80,
    status: 'CALCULADA',
    integradaContabil: false
  }
];

const SEED_OBRIGACOES_FISCAIS: ObrigacaoFiscal[] = [
  {
    id: 1,
    empresaId: 1,
    sigla: 'DAS',
    nome: 'Documento de Arrecadação do Simples Nacional (PGDAS-D)',
    esfera: 'FEDERAL',
    competencia: '2026-10',
    dataVencimento: '2026-11-20',
    dataLimiteEnvio: '2026-11-20',
    valorEstimado: 7824.30,
    status: 'A_VENCER',
    responsavel: 'Helena Silveira (Fiscal)',
    codigoBarras: '85830000001-2 36890385261-0 01001202610-8 00000000000-0',
    observacoes: 'Apuração com segregação de ICMS ST e PIS/COFINS Monofásicos calculada'
  },
  {
    id: 2,
    empresaId: 1,
    sigla: 'FGTS_DIGITAL',
    nome: 'FGTS Digital Mensal - Fundo de Garantia (Portaria MTE)',
    esfera: 'TRABALHISTA',
    competencia: '2026-10',
    dataVencimento: '2026-11-20',
    dataLimiteEnvio: '2026-11-20',
    valorEstimado: 1954.40,
    status: 'A_VENCER',
    responsavel: 'Carlos DP',
    codigoBarras: '85830000001-9 19544000000-0 20261020000-1 00000000000-0',
    observacoes: 'Guia Pix emitida via Conectividade / FGTS Digital'
  },
  {
    id: 3,
    empresaId: 1,
    sigla: 'DCTFWEB',
    nome: 'DCTFWeb Mensal - Declaração de Débitos e Créditos Previdenciários',
    esfera: 'FEDERAL',
    competencia: '2026-10',
    dataVencimento: '2026-11-15',
    dataLimiteEnvio: '2026-11-15',
    valorEstimado: 3880.00,
    status: 'A_VENCER',
    responsavel: 'Helena Silveira',
    observacoes: 'Alimentada automaticamente pelo eSocial e EFD-Reinf'
  },
  {
    id: 4,
    empresaId: 1,
    sigla: 'ESOCIAL',
    nome: 'eSocial S-1299 - Fechamento dos Eventos Periódicos da Folha',
    esfera: 'TRABALHISTA',
    competencia: '2026-10',
    dataVencimento: '2026-11-15',
    dataLimiteEnvio: '2026-11-15',
    valorEstimado: 0,
    status: 'A_VENCER',
    responsavel: 'Carlos DP',
    observacoes: 'Transmissão XML dos eventos S-1200 e S-1210'
  },
  {
    id: 5,
    empresaId: 1,
    sigla: 'EFD_REINF',
    nome: 'EFD-Reinf Série R-4000 - Retenções na Fonte de IRRF e CSRF',
    esfera: 'FEDERAL',
    competencia: '2026-10',
    dataVencimento: '2026-11-15',
    dataLimiteEnvio: '2026-11-15',
    valorEstimado: 1252.50,
    status: 'A_VENCER',
    responsavel: 'Helena Silveira',
    observacoes: 'Retenções sobre notas de serviços tomados e honorários'
  },
  {
    id: 6,
    empresaId: 1,
    sigla: 'DAE_ICMS',
    nome: 'DAE / GARE ICMS Operações Próprias SP (Cód. 046-2)',
    esfera: 'ESTADUAL',
    competencia: '2026-10',
    dataVencimento: '2026-11-20',
    dataLimiteEnvio: '2026-11-20',
    valorEstimado: 2880.00,
    status: 'A_VENCER',
    responsavel: 'Helena Silveira',
    codigoBarras: '85830000002-8 88000000000-0 20261020000-1 00000000000-0'
  },
  {
    id: 7,
    empresaId: 1,
    sigla: 'DARM_ISS',
    nome: 'ISSQN Próprio - Prefeitura Municipal de São Paulo',
    esfera: 'MUNICIPAL',
    competencia: '2026-10',
    dataVencimento: '2026-11-10',
    dataLimiteEnvio: '2026-11-10',
    valorEstimado: 4175.00,
    status: 'A_VENCER',
    responsavel: 'Helena Silveira'
  },
  {
    id: 8,
    empresaId: 1,
    sigla: 'SPED_FISCAL',
    nome: 'EFD ICMS/IPI - SPED Fiscal Mensal',
    esfera: 'ESTADUAL',
    competencia: '2026-10',
    dataVencimento: '2026-11-20',
    dataLimiteEnvio: '2026-11-20',
    valorEstimado: 0,
    status: 'PENDENTE',
    responsavel: 'Helena Silveira'
  },
  {
    id: 9,
    empresaId: 1,
    sigla: 'SPED_ECD',
    nome: 'SPED ECD - Escrituração Contábil Digital (Livro Diário/Razão)',
    esfera: 'FEDERAL',
    competencia: '2025-12',
    dataVencimento: '2026-06-30',
    dataLimiteEnvio: '2026-06-30',
    valorEstimado: 0,
    status: 'ENTREGUE',
    dataTransmissao: '2026-06-25',
    protocoloTransmissao: 'ECD-SP-2026-9876543210-99',
    reciboEnvio: 'REC-ECD-3526-8877665544',
    responsavel: 'Dra. Helena Silveira Santos'
  },
  {
    id: 10,
    empresaId: 1,
    sigla: 'SPED_ECF',
    nome: 'SPED ECF - Escrituração Contábil Fiscal (IRPJ / CSLL)',
    esfera: 'FEDERAL',
    competencia: '2025-12',
    dataVencimento: '2026-07-31',
    dataLimiteEnvio: '2026-07-31',
    valorEstimado: 0,
    status: 'ENTREGUE',
    dataTransmissao: '2026-07-28',
    protocoloTransmissao: 'ECF-RFB-2026-1234567890-01',
    reciboEnvio: 'REC-ECF-RFB-9988776655',
    responsavel: 'Dra. Helena Silveira Santos'
  }
];

const SEED_PARTICIPANTES: ParticipanteFiscal[] = [
  {
    id: 1,
    empresaId: 1,
    codigo: 'FORN001',
    nomeRazaoSocial: 'DELL COMPUTADORES DO BRASIL LTDA',
    nomeFantasia: 'Dell Technologies',
    tipoPessoa: 'J',
    cnpjCpf: '72.381.189/0001-10',
    inscricaoEstadual: '148.520.123.119',
    contribuinteICMS: '1',
    uf: 'SP',
    municipio: 'Eldorado do Sul',
    codigoIbge: '4306932',
    tipoRelacao: 'FORNECEDOR',
    contaContabilId: 30, // Fornecedores a Pagar
    email: 'fiscal@dell.com.br',
    telefone: '(11) 4004-0100',
    ativo: true
  },
  {
    id: 2,
    empresaId: 1,
    codigo: 'CLI001',
    nomeRazaoSocial: 'BANCO DIGITAL ALPHA S/A',
    nomeFantasia: 'Banco Alpha',
    tipoPessoa: 'J',
    cnpjCpf: '09.876.543/0001-21',
    inscricaoEstadual: '',
    contribuinteICMS: '9',
    uf: 'SP',
    municipio: 'São Paulo',
    codigoIbge: '3550308',
    tipoRelacao: 'CLIENTE',
    contaContabilId: 11, // Clientes a Receber
    email: 'financeiro@alpha.banco.br',
    telefone: '(11) 3300-5500',
    ativo: true
  },
  {
    id: 3,
    empresaId: 1,
    codigo: 'CLI002',
    nomeRazaoSocial: 'INDÚSTRIA E COMÉRCIO BETA LTDA',
    nomeFantasia: 'Beta Componentes',
    tipoPessoa: 'J',
    cnpjCpf: '45.678.901/0001-34',
    inscricaoEstadual: '112.334.556.778',
    contribuinteICMS: '1',
    uf: 'SP',
    municipio: 'Campinas',
    codigoIbge: '3509502',
    tipoRelacao: 'CLIENTE',
    contaContabilId: 11,
    email: 'contabil@beta.ind.br',
    telefone: '(19) 3200-1122',
    ativo: true
  },
  {
    id: 4,
    empresaId: 1,
    codigo: 'TRAN001',
    nomeRazaoSocial: 'EXPRESSO SÃO PAULO LOGÍSTICA & TRANSPORTES LTDA',
    nomeFantasia: 'Expresso SP Log',
    tipoPessoa: 'J',
    cnpjCpf: '19.283.746/0001-55',
    inscricaoEstadual: '109.876.543.210',
    contribuinteICMS: '1',
    uf: 'SP',
    municipio: 'Guarulhos',
    codigoIbge: '3518800',
    tipoRelacao: 'TRANSPORTADORA',
    contaContabilId: 30,
    email: 'cte@expressosplog.com.br',
    telefone: '(11) 2468-1357',
    ativo: true
  }
];

const SEED_PRODUTOS: ProdutoServico[] = [
  {
    id: 1,
    empresaId: 1,
    codigo: 'SRV-001',
    descricao: 'Consultoria e Auditoria Contábil Empresarial Mensal',
    tipoItemSped: '09', // Serviços
    ncm: '00000000',
    unidadeMedida: 'UN',
    cstPISCOFINSPadrao: '01',
    aliquotaPIS: 0.65,
    aliquotaCOFINS: 3.0,
    precoUnitarioVenda: 5000.00,
    precoUnitarioCusto: 0,
    contaContabilReceitaId: 44, // Receita de Serviços
    ativo: true
  },
  {
    id: 2,
    empresaId: 1,
    codigo: 'SRV-002',
    descricao: 'Implantação de ERP Contábil e Treinamento de Equipe',
    tipoItemSped: '09',
    ncm: '00000000',
    unidadeMedida: 'UN',
    cstPISCOFINSPadrao: '01',
    aliquotaPIS: 0.65,
    aliquotaCOFINS: 3.0,
    precoUnitarioVenda: 12000.00,
    precoUnitarioCusto: 3500.00,
    contaContabilReceitaId: 44,
    ativo: true
  },
  {
    id: 3,
    empresaId: 1,
    codigo: 'EQP-001',
    descricao: 'Servidor Dell PowerEdge R650 32GB Xeon Silver',
    codigoBarras: '7891234567890',
    tipoItemSped: '08', // Ativo Imobilizado
    ncm: '84715010',
    unidadeMedida: 'UN',
    cstICMSPadrao: '00',
    aliquotaICMS: 18.0,
    aliquotaIPI: 10.0,
    precoUnitarioCusto: 18500.00,
    contaContabilInventarioId: 18, // Equipamentos de Informática
    ativo: true
  },
  {
    id: 4,
    empresaId: 1,
    codigo: 'MAT-001',
    descricao: 'Papel Sulfite A4 Report 75g Caixa com 10 Resmas',
    codigoBarras: '7898234567891',
    tipoItemSped: '07', // Material Uso e Consumo
    ncm: '48025610',
    unidadeMedida: 'CX',
    cstICMSPadrao: '00',
    aliquotaICMS: 18.0,
    precoUnitarioCusto: 280.00,
    contaContabilCustoId: 57, // Material de Escritório
    ativo: true
  }
];

const SEED_COLABORADORES: Colaborador[] = [
  {
    id: 1,
    empresaId: 1,
    matricula: 101,
    matriculaeSocial: 'MATR-000101',
    nome: 'Lucas Gabriel Silveira',
    cpf: '234.567.890-12',
    dataNascimento: '1988-06-14',
    sexo: 'M',
    estadoCivil: 'CASADO',
    grauInstrucao: 'SUPERIOR_COMPLETO',
    racaCor: 'BRANCA',
    logradouro: 'Rua Augusta',
    numero: '1200',
    bairro: 'Consolação',
    cidade: 'São Paulo',
    uf: 'SP',
    cep: '01304-001',
    ctpsNumero: '1234567',
    ctpsSerie: '0010',
    ctpsUF: 'SP',
    rgNumero: '34.567.890-X',
    rgOrgaoEmissor: 'SSP/SP',
    pisPasep: '120.34567.89-1',
    tituloEleitor: '123456780123',
    categoriaeSocial: '101',
    cbo: '2124-05',
    cargo: 'Engenheiro de Software Sênior',
    departamento: 'Engenharia de Sistemas',
    tipoVinculo: 'CLT',
    salarioBase: 12500.00,
    tipoPagamento: 'MENSALISTA',
    jornadaSemanal: 40,
    dependentesIRRF: 1,
    dependentesSalarioFamilia: 0,
    listaDependentes: [
      {
        id: 1,
        nome: 'Enzo Silveira',
        cpf: '567.890.123-45',
        dataNascimento: '2016-04-10',
        parentesco: 'FILHO',
        finsIRRF: true,
        finsSalarioFamilia: false
      }
    ],
    dataAdmissao: '2023-03-01',
    centroCustoId: 5,
    bancoNome: 'Banco Itaú',
    agencia: '0912',
    contaBancaria: '44821-0',
    dadosBancarios: { chavePix: '23456789012' },
    ativo: true,
    status: 'ATIVO'
  },
  {
    id: 2,
    empresaId: 1,
    matricula: 102,
    matriculaeSocial: 'MATR-000102',
    nome: 'Mariana Oliveira Prado',
    cpf: '345.678.901-23',
    dataNascimento: '1994-11-20',
    sexo: 'F',
    estadoCivil: 'SOLTEIRO',
    grauInstrucao: 'SUPERIOR_COMPLETO',
    racaCor: 'PARDA',
    logradouro: 'Alameda Santos',
    numero: '800',
    bairro: 'Cerqueira César',
    cidade: 'São Paulo',
    uf: 'SP',
    cep: '01418-100',
    ctpsNumero: '2345678',
    ctpsSerie: '0020',
    ctpsUF: 'SP',
    rgNumero: '45.678.901-2',
    rgOrgaoEmissor: 'SSP/SP',
    pisPasep: '130.45678.90-2',
    tituloEleitor: '234567890134',
    categoriaeSocial: '101',
    cbo: '2522-10',
    cargo: 'Analista Contábil Pleno',
    departamento: 'Controladoria & Fiscal',
    tipoVinculo: 'CLT',
    salarioBase: 6200.00,
    tipoPagamento: 'MENSALISTA',
    jornadaSemanal: 44,
    dependentesIRRF: 0,
    dependentesSalarioFamilia: 0,
    listaDependentes: [],
    dataAdmissao: '2024-01-15',
    centroCustoId: 3,
    bancoNome: 'Banco Santander',
    agencia: '3310',
    contaBancaria: '12900-5',
    dadosBancarios: { chavePix: 'mariana.prado@email.com' },
    ativo: true,
    status: 'ATIVO'
  },
  {
    id: 3,
    empresaId: 1,
    matricula: 103,
    matriculaeSocial: 'MATR-000103',
    nome: 'Renato Dias Batista',
    cpf: '456.789.012-34',
    dataNascimento: '1998-02-05',
    sexo: 'M',
    estadoCivil: 'CASADO',
    grauInstrucao: 'MEDIO_COMPLETO',
    racaCor: 'BRANCA',
    logradouro: 'Rua Domingos de Morais',
    numero: '450',
    bairro: 'Vila Mariana',
    cidade: 'São Paulo',
    uf: 'SP',
    cep: '04010-000',
    ctpsNumero: '3456789',
    ctpsSerie: '0030',
    ctpsUF: 'SP',
    rgNumero: '56.789.012-3',
    rgOrgaoEmissor: 'SSP/SP',
    pisPasep: '140.56789.01-3',
    tituloEleitor: '345678900145',
    categoriaeSocial: '101',
    cbo: '4110-10',
    cargo: 'Assistente Administrativo',
    departamento: 'Administração',
    tipoVinculo: 'CLT',
    salarioBase: 3100.00,
    tipoPagamento: 'MENSALISTA',
    jornadaSemanal: 44,
    dependentesIRRF: 1,
    dependentesSalarioFamilia: 1,
    listaDependentes: [
      {
        id: 2,
        nome: 'Arthur Dias Batista',
        cpf: '678.901.234-56',
        dataNascimento: '2021-08-15',
        parentesco: 'FILHO',
        finsIRRF: true,
        finsSalarioFamilia: true
      }
    ],
    dataAdmissao: '2025-05-02',
    centroCustoId: 2,
    bancoNome: 'Banco Bradesco',
    agencia: '1202',
    contaBancaria: '98432-1',
    dadosBancarios: { chavePix: '45678901234' },
    ativo: true,
    status: 'ATIVO'
  },
  {
    id: 4,
    empresaId: 1,
    matricula: 201,
    matriculaeSocial: 'MATR-000201',
    nome: 'Carlos Eduardo Mendes',
    cpf: '123.456.789-00',
    dataNascimento: '1975-09-30',
    sexo: 'M',
    estadoCivil: 'CASADO',
    grauInstrucao: 'POS_GRADUACAO',
    racaCor: 'BRANCA',
    logradouro: 'Avenida Paulista',
    numero: '1500',
    complemento: 'Andar 14',
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    uf: 'SP',
    cep: '01310-200',
    rgNumero: '23.456.789-0',
    rgOrgaoEmissor: 'SSP/SP',
    pisPasep: '110.12345.67-0',
    categoriaeSocial: '721', // Diretor Não Empregado com FGTS / Pró-labore
    cbo: '1210-10',
    cargo: 'Sócio Diretor Executivo',
    departamento: 'Diretoria Geral',
    tipoVinculo: 'PRO_LABORE',
    salarioBase: 15000.00,
    tipoPagamento: 'MENSALISTA',
    jornadaSemanal: 40,
    dependentesIRRF: 2,
    dependentesSalarioFamilia: 0,
    listaDependentes: [
      {
        id: 3,
        nome: 'Beatriz Mendes',
        cpf: '789.012.345-67',
        dataNascimento: '2010-12-05',
        parentesco: 'FILHO',
        finsIRRF: true,
        finsSalarioFamilia: false
      },
      {
        id: 4,
        nome: 'Mariana Costa Mendes',
        cpf: '234.567.890-11',
        dataNascimento: '1978-04-22',
        parentesco: 'CONJUGE',
        finsIRRF: true,
        finsSalarioFamilia: false
      }
    ],
    dataAdmissao: '2022-01-10',
    centroCustoId: 2,
    bancoNome: 'Banco Itaú',
    agencia: '0912',
    contaBancaria: '10982-3',
    dadosBancarios: { chavePix: 'carlos.mendes@amillabs.com.br' },
    ativo: true,
    status: 'ATIVO'
  }
];

const SEED_RUBRICAS: RubricaFolha[] = [
  { id: 1, empresaId: 1, codigo: 101, nome: 'Salário Base Mensal', tipo: 'PROVENTO', incideINSS: true, incideFGTS: true, incideIRRF: true, contaDebitoId: 56, contaCreditoId: 26 },
  { id: 2, empresaId: 1, codigo: 102, nome: 'Pró-Labore Diretores', tipo: 'PROVENTO', incideINSS: true, incideFGTS: false, incideIRRF: true, contaDebitoId: 56, contaCreditoId: 26 },
  { id: 3, empresaId: 1, codigo: 103, nome: 'Horas Extras 50%', tipo: 'PROVENTO', incideINSS: true, incideFGTS: true, incideIRRF: true, contaDebitoId: 56, contaCreditoId: 26 },
  { id: 4, empresaId: 1, codigo: 201, nome: 'Desconto INSS Segurados', tipo: 'DESCONTO', incideINSS: false, incideFGTS: false, incideIRRF: false, contaDebitoId: 26, contaCreditoId: 27 },
  { id: 5, empresaId: 1, codigo: 202, nome: 'Desconto IRRF Retido na Fonte', tipo: 'DESCONTO', incideINSS: false, incideFGTS: false, incideIRRF: false, contaDebitoId: 26, contaCreditoId: 27 },
  { id: 6, empresaId: 1, codigo: 203, nome: 'Desconto Vale Transporte', tipo: 'DESCONTO', incideINSS: false, incideFGTS: false, incideIRRF: false, contaDebitoId: 26, contaCreditoId: 57 }
];

const SEED_FOLHAS: FolhaMensal[] = [
  {
    id: 1,
    empresaId: 1,
    competencia: '2026-10',
    dataCalculo: '2026-10-31',
    totalBruto: 36800.00,
    totalLiquido: 28240.25,
    totalINSSSegurados: 3912.45,
    totalINSSPatronal: 4360.00,
    totalFGTS: 1744.00,
    totalIRRF: 4647.30,
    status: 'ABERTA',
    itens: [
      {
        id: 1,
        colaboradorId: 1,
        colaboradorNome: 'Lucas Gabriel Silveira',
        colaboradorCargo: 'Engenheiro de Software Sênior',
        tipoVinculo: 'CLT',
        salarioBase: 12500.00,
        totalProventos: 12500.00,
        inssDesconto: 908.85,
        irrfDesconto: 2125.40,
        outrosDescontos: 0,
        totalDescontos: 3034.25,
        salarioLiquido: 9465.75,
        fgtsEmpresa: 1000.00,
        inssPatronal: 2500.00
      },
      {
        id: 2,
        colaboradorId: 2,
        colaboradorNome: 'Mariana Oliveira Prado',
        colaboradorCargo: 'Analista Contábil Pleno',
        tipoVinculo: 'CLT',
        salarioBase: 6200.00,
        totalProventos: 6200.00,
        inssDesconto: 694.75,
        irrfDesconto: 628.90,
        outrosDescontos: 0,
        totalDescontos: 1323.65,
        salarioLiquido: 4876.35,
        fgtsEmpresa: 496.00,
        inssPatronal: 1240.00
      },
      {
        id: 3,
        colaboradorId: 3,
        colaboradorNome: 'Renato Dias Batista',
        colaboradorCargo: 'Assistente Administrativo',
        tipoVinculo: 'CLT',
        salarioBase: 3100.00,
        totalProventos: 3100.00,
        inssDesconto: 278.85,
        irrfDesconto: 63.00,
        outrosDescontos: 186.00,
        totalDescontos: 527.85,
        salarioLiquido: 2572.15,
        fgtsEmpresa: 248.00,
        inssPatronal: 620.00
      },
      {
        id: 4,
        colaboradorId: 4,
        colaboradorNome: 'Carlos Eduardo Mendes',
        colaboradorCargo: 'Sócio Diretor Executivo',
        tipoVinculo: 'PRO_LABORE',
        salarioBase: 15000.00,
        totalProventos: 15000.00,
        inssDesconto: 908.85,
        irrfDesconto: 2830.00,
        outrosDescontos: 0,
        totalDescontos: 3738.85,
        salarioLiquido: 11261.15,
        fgtsEmpresa: 0,
        inssPatronal: 0
      }
    ],
    integradaContabil: false
  }
];

const SEED_CONTRATOS: ContratoHonorario[] = [
  {
    id: 1,
    empresaId: 1,
    numeroContrato: 'CT-2026/001',
    valorMensalBase: 3850.00,
    diaVencimento: 15,
    indexadorReajuste: 'IPCA',
    mesReajuste: 1,
    cobra13Honorario: true,
    dataInicio: '2023-01-01',
    ativo: true
  }
];

const SEED_FATURAS: FaturaHonorario[] = [
  {
    id: 1,
    empresaId: 1,
    competencia: '2026-10',
    numeroFatura: 'FAT-2026-1001',
    valorHonorarioBase: 3850.00,
    valorServicosExtras: 650.00,
    valorTotal: 4500.00,
    dataVencimento: '2026-10-15',
    dataPagamento: '2026-10-14',
    status: 'PAGO',
    servicosExtrasDescricao: 'Elaboração de 3ª Alteração Contratual na JUCESP',
    integradaContabil: false
  }
];

const SEED_REGRAS_CONCILIACAO: RegraConciliacao[] = [
  { id: 1, empresaId: 1, palavraChave: 'PIX RECEBIDO', contaDebitoId: 6, contaCreditoId: 11, historicoId: 1, complementoPadrao: 'Recebimento de cliente via PIX' },
  { id: 2, empresaId: 1, palavraChave: 'TARIFA', contaDebitoId: 58, contaCreditoId: 6, historicoId: 4, complementoPadrao: 'Tarifa bancária mensal de manutenção' },
  { id: 3, empresaId: 1, palavraChave: 'PAGTO FORNECEDOR', contaDebitoId: 30, contaCreditoId: 6, historicoId: 2, complementoPadrao: 'Quitação de títulos fornecedores' },
  { id: 4, empresaId: 1, palavraChave: 'AWS', contaDebitoId: 57, contaCreditoId: 6, historicoId: 2, complementoPadrao: 'Serviços de infraestrutura cloud AWS' },
  { id: 5, empresaId: 1, palavraChave: 'FOLHA', contaDebitoId: 26, contaCreditoId: 6, historicoId: 2, complementoPadrao: 'Pagamento líquido de salários e ordenados' },
  { id: 6, empresaId: 1, palavraChave: 'PRO-LABORE', contaDebitoId: 26, contaCreditoId: 6, historicoId: 2, complementoPadrao: 'Retirada de pró-labore sócios' }
];

const SEED_ATIVOS_IMOBILIZADOS: AtivoImobilizado[] = [
  {
    id: 1,
    empresaId: 1,
    codigo: 'IMOB-001',
    descricao: 'Servidor Dell PowerEdge R650 32GB Xeon Silver',
    grupo: 'INFORMATICA',
    dataAquisicao: '2025-01-10',
    dataInicioDepreciacao: '2025-01-01',
    valorOriginal: 18500.00,
    valorResidual: 1850.00,
    taxaDepreciacaoAnual: 20.0,
    vidaUtilMeses: 60,
    contaAtivoId: 20,
    contaDepreciacaoAcumuladaId: 20,
    contaDespesaDepreciacaoId: 57,
    depreciacaoAcumulada: 3885.00,
    valorContabilAtual: 14615.00,
    ativo: true
  },
  {
    id: 2,
    empresaId: 1,
    codigo: 'IMOB-002',
    descricao: 'Notebooks Dell XPS 15 para Equipe de Engenharia (3 Unidades)',
    grupo: 'INFORMATICA',
    dataAquisicao: '2025-06-15',
    dataInicioDepreciacao: '2025-06-01',
    valorOriginal: 27000.00,
    valorResidual: 2700.00,
    taxaDepreciacaoAnual: 20.0,
    vidaUtilMeses: 60,
    contaAtivoId: 20,
    contaDepreciacaoAcumuladaId: 20,
    contaDespesaDepreciacaoId: 57,
    depreciacaoAcumulada: 3645.00,
    valorContabilAtual: 23355.00,
    ativo: true
  },
  {
    id: 3,
    empresaId: 1,
    codigo: 'IMOB-003',
    descricao: 'Mobiliário Ergonômico de Escritório e Estações de Trabalho',
    grupo: 'MOVEIS',
    dataAquisicao: '2024-03-01',
    dataInicioDepreciacao: '2024-03-01',
    valorOriginal: 35000.00,
    valorResidual: 3500.00,
    taxaDepreciacaoAnual: 10.0,
    vidaUtilMeses: 120,
    contaAtivoId: 20,
    contaDepreciacaoAcumuladaId: 20,
    contaDespesaDepreciacaoId: 57,
    depreciacaoAcumulada: 5250.00,
    valorContabilAtual: 29750.00,
    ativo: true
  }
];

const SEED_VARIAVEIS_COLABORADORES: VariaveisColaborador[] = [
  {
    id: 1,
    empresaId: 1,
    colaboradorId: 3,
    competencia: '2026-10',
    horasExtras50: 8,
    horasExtras100: 2,
    adicionalNoturnoHoras: 0,
    grauInsalubridade: 'NENHUM',
    periculosidade: false,
    faltasDias: 0,
    faltasHoras: 0,
    adiantamentoSalarial: 0,
    descontoValeTransporte: true
  }
];

const SEED_CALCULOS_FERIAS: CalculoFerias[] = [
  {
    id: 1,
    empresaId: 1,
    colaboradorId: 3,
    colaboradorNome: 'Renato Dias Batista',
    matricula: 103,
    cargo: 'Assistente Administrativo',
    salarioBase: 3100.00,
    periodoAquisitivoInicio: '2025-05-02',
    periodoAquisitivoFim: '2026-05-01',
    dataInicioGozo: '2026-10-01',
    diasGozo: 30,
    dataFimGozo: '2026-10-30',
    abonoPecuniario: false,
    diasAbono: 0,
    adiantarDecimoTerceiro: false,
    valorDiasFerias: 3100.00,
    valorTercoConstitucional: 1033.33,
    valorAbonoPecuniario: 0,
    valorTercoAbono: 0,
    valorAdiantamento13: 0,
    valorTotalProventos: 4133.33,
    baseCalculoINSS: 4133.33,
    valorINSS: 392.97,
    baseCalculoIRRF: 3550.77,
    valorIRRF: 143.18,
    valorTotalDescontos: 536.15,
    valorLiquidoReceber: 3597.18,
    dataPagamento: '2026-09-29',
    status: 'PAGO',
    integradaContabil: true
  }
];

const SEED_CALCULOS_DECIMO_TERCEIRO: CalculoDecimoTerceiro[] = [
  {
    id: 1,
    empresaId: 1,
    colaboradorId: 3,
    colaboradorNome: 'Renato Dias Batista',
    matricula: 103,
    cargo: 'Assistente Administrativo',
    salarioBase: 3100.00,
    competencia: '2026-11',
    ano: 2026,
    parcela: 'PRIMEIRA',
    mesesTrabalhadosAvos: 12,
    valorIntegral: 3100.00,
    valorBrutoParcela: 1550.00,
    valorAdiantamentoDeduzido: 0,
    baseINSS: 0,
    valorINSS: 0,
    baseIRRF: 0,
    valorIRRF: 0,
    baseFGTS: 1550.00,
    valorFGTS: 124.00,
    valorLiquidoParcela: 1550.00,
    dataPagamento: '2026-11-28',
    status: 'CALCULADO',
    integradaContabil: false
  }
];

const SEED_CALCULOS_RESCISAO: CalculoRescisao[] = [
  {
    id: 1,
    empresaId: 1,
    colaboradorId: 3,
    colaboradorNome: 'Renato Dias Batista',
    matricula: 103,
    cargo: 'Assistente Administrativo',
    cpf: '456.789.012-34',
    dataAdmissao: '2025-05-02',
    dataDemissao: '2026-10-31',
    salarioBase: 3100.00,
    motivoRescisao: 'SEM_JUSTA_CAUSA',
    tipoAvisoPrevio: 'INDENIZADO',
    diasAvisoPrevio: 33,
    diasTrabalhadosMes: 30,
    avosDecimoTerceiro: 10,
    avosDecimoIndenizado: 1,
    avosFeriasProporcionais: 6,
    avosFeriasIndenizadas: 1,
    temFeriasVencidas: false,
    saldoSalario: 3100.00,
    avisoPrevioIndenizado: 3410.00,
    decimoTerceiroProporcional: 2583.33,
    decimoTerceiroIndenizado: 258.33,
    feriasVencidas: 0,
    tercoFeriasVencidas: 0,
    feriasProporcionais: 1550.00,
    tercoFeriasProporcionais: 516.67,
    feriasIndenizadas: 258.33,
    tercoFeriasIndenizadas: 86.11,
    totalBrutoVerbas: 11762.77,
    inssSaldoSalario: 265.84,
    inssDecimoTerceiro: 204.38,
    irrfSaldoSalario: 0,
    irrfDecimoTerceiro: 0,
    avisoPrevioDescontado: 0,
    outrasDeducoes: 0,
    totalDeducoes: 470.22,
    saldoLiquidoRescisao: 11292.55,
    saldoBaseFGTS: 4200.00,
    multaRescisoriaFGTS: 1680.00,
    codigoSaqueFGTS: '01',
    dataPagamento: '2026-11-10',
    status: 'CALCULADO',
    integradaContabil: false
  }
];

const SEED_ADMINISTRADORAS_CARTAO: AdministradoraCartao[] = [
  {
    id: 1,
    empresaId: 1,
    codigo: 1,
    cnpj: '01.027.058/0001-91',
    razaoSocial: 'CIELO S.A.',
    nomeFantasia: 'Cielo',
    inscricaoEstadual: '111.222.333.444',
    taxaMDRCreditoVista: 2.39,
    taxaMDRCreditoParcelado: 3.89,
    taxaMDRDebito: 1.19,
    prazoDiasRepasseCredito: 30,
    prazoDiasRepasseDebito: 1,
    contaAtivoId: 6,
    contaDespesaTaxaId: 57,
    ativo: true
  },
  {
    id: 2,
    empresaId: 1,
    codigo: 2,
    cnpj: '01.425.787/0001-04',
    razaoSocial: 'REDE S.A.',
    nomeFantasia: 'Rede',
    inscricaoEstadual: '222.333.444.555',
    taxaMDRCreditoVista: 2.19,
    taxaMDRCreditoParcelado: 3.69,
    taxaMDRDebito: 1.09,
    prazoDiasRepasseCredito: 30,
    prazoDiasRepasseDebito: 1,
    contaAtivoId: 6,
    contaDespesaTaxaId: 57,
    ativo: true
  },
  {
    id: 3,
    empresaId: 1,
    codigo: 3,
    cnpj: '16.501.555/0001-57',
    razaoSocial: 'STONE PAGAMENTOS S.A.',
    nomeFantasia: 'Stone',
    inscricaoEstadual: '333.444.555.666',
    taxaMDRCreditoVista: 1.99,
    taxaMDRCreditoParcelado: 3.49,
    taxaMDRDebito: 0.99,
    prazoDiasRepasseCredito: 30,
    prazoDiasRepasseDebito: 1,
    contaAtivoId: 6,
    contaDespesaTaxaId: 57,
    ativo: true
  },
  {
    id: 4,
    empresaId: 1,
    codigo: 4,
    cnpj: '08.561.701/0001-01',
    razaoSocial: 'PAGSEGURO INTERNET S.A.',
    nomeFantasia: 'PagBank / PagSeguro',
    inscricaoEstadual: '444.555.666.777',
    taxaMDRCreditoVista: 2.49,
    taxaMDRCreditoParcelado: 3.99,
    taxaMDRDebito: 1.25,
    prazoDiasRepasseCredito: 14,
    prazoDiasRepasseDebito: 1,
    contaAtivoId: 6,
    contaDespesaTaxaId: 57,
    ativo: true
  }
];

const SEED_VENDAS_CARTAO: VendaCartaoOperadora[] = [
  {
    id: 1,
    empresaId: 1,
    competencia: '2026-10',
    administradoraId: 1,
    administradoraNome: 'CIELO S.A.',
    cnpjAdministradora: '01.027.058/0001-91',
    valorCredito: 48500.00,
    valorDebito: 24200.00,
    valorTotalBruto: 72700.00,
    taxaMDREstimada: 1447.13,
    valorLiquidoReceber: 71252.87,
    retencaoIRRF: 21.71,
    status: 'CONCILIADO'
  },
  {
    id: 2,
    empresaId: 1,
    competencia: '2026-10',
    administradoraId: 3,
    administradoraNome: 'STONE PAGAMENTOS S.A.',
    cnpjAdministradora: '16.501.555/0001-57',
    valorCredito: 32400.00,
    valorDebito: 18100.00,
    valorTotalBruto: 50500.00,
    taxaMDREstimada: 823.95,
    valorLiquidoReceber: 49676.05,
    retencaoIRRF: 12.36,
    status: 'PENDENTE'
  }
];

const SEED_CONTAS_PARTE_B_LALUR: ContaParteBLalur[] = [
  {
    id: 1,
    empresaId: 1,
    codigo: 'PF-001',
    descricao: 'Prejuízo Fiscal Operacional Acumulado de Exercícios Anteriores (IRPJ)',
    tipoTributo: 'IRPJ',
    tipoConta: 'PREJUIZO_FISCAL',
    dataCadastro: '2024-12-31',
    saldoInicial: 120000.00,
    saldoAtual: 120000.00,
    identificadorSpedEcf: 'M010_PF01'
  },
  {
    id: 2,
    empresaId: 1,
    codigo: 'BN-001',
    descricao: 'Base de Cálculo Negativa de CSLL Acumulada de Períodos Anteriores',
    tipoTributo: 'CSLL',
    tipoConta: 'BASE_NEGATIVA',
    dataCadastro: '2024-12-31',
    saldoInicial: 95000.00,
    saldoAtual: 95000.00,
    identificadorSpedEcf: 'M010_BN01'
  },
  {
    id: 3,
    empresaId: 1,
    codigo: 'DA-002',
    descricao: 'Depreciação Acelerada Incentivada - Máquinas e Equipamentos Industriais',
    tipoTributo: 'IRPJ',
    tipoConta: 'DEPRECIACAO_ACELERADA',
    dataCadastro: '2025-06-30',
    saldoInicial: 35000.00,
    saldoAtual: 35000.00,
    identificadorSpedEcf: 'M010_DA02'
  }
];

const SEED_LANCAMENTOS_PARTE_A: LancamentoLalurParteA[] = [
  {
    id: 1,
    empresaId: 1,
    ano: 2026,
    periodo: '2026-1T',
    data: '2026-03-31',
    tipo: 'ADICAO',
    tributo: 'AMBOS',
    codigoHistorico: 'M300.01',
    descricao: 'Multas Punitivas por Infração Fiscal / Tributária (Art. 344 do RIR/2018)',
    valor: 14500.00,
    contaContabilNome: '4.02.01.05.0003 - Multas e Infrações Fiscais'
  },
  {
    id: 2,
    empresaId: 1,
    ano: 2026,
    periodo: '2026-1T',
    data: '2026-03-31',
    tipo: 'ADICAO',
    tributo: 'IRPJ',
    codigoHistorico: 'M300.05',
    descricao: 'Brindes, Doações e Despesas de Representação não dedutíveis (Art. 249 Lei 6.404/76)',
    valor: 8200.00,
    contaContabilNome: '4.02.01.05.0008 - Doações e Contribuições'
  },
  {
    id: 3,
    empresaId: 1,
    ano: 2026,
    periodo: '2026-1T',
    data: '2026-03-31',
    tipo: 'ADICAO',
    tributo: 'AMBOS',
    codigoHistorico: 'M300.12',
    descricao: 'Provisões não dedutíveis - Perdas Estimadas de Créditos de Liquidação Duvidosa (PCLD)',
    valor: 18000.00,
    contaContabilNome: '4.02.01.03.0005 - Despesa com PCLD'
  },
  {
    id: 4,
    empresaId: 1,
    ano: 2026,
    periodo: '2026-1T',
    data: '2026-03-31',
    tipo: 'EXCLUSAO',
    tributo: 'AMBOS',
    codigoHistorico: 'M300.30',
    descricao: 'Receitas de Equivalência Patrimonial / Dividendos de Outras PJs (Art. 379 do RIR/2018)',
    valor: 35000.00,
    contaContabilNome: '3.01.02.01.0001 - Receita de Participações Societárias / MEP'
  },
  {
    id: 5,
    empresaId: 1,
    ano: 2026,
    periodo: '2026-1T',
    data: '2026-03-31',
    tipo: 'EXCLUSAO',
    tributo: 'IRPJ',
    codigoHistorico: 'M300.42',
    descricao: 'Depreciação Acelerada Incentivada - Controle com contrapartida na Parte B',
    valor: 12000.00,
    contaContabilNome: '4.02.01.04.0001 - Despesa de Depreciação',
    contaParteBVinculadaId: 3,
    contaParteBNome: 'DA-002 - Depreciação Acelerada Incentivada'
  }
];

const SEED_EVENTOS_REINF: EventoReinf[] = [
  {
    id: 1,
    empresaId: 1,
    tipoEvento: 'R-1000',
    nomeEvento: 'Informações do Contribuinte',
    competencia: '2026-10',
    status: 'TRANSMITIDO',
    numeroRecibo: '1.202610.948271-01',
    dataGeracao: '2026-10-01 09:30:00',
    dataTransmissao: '2026-10-01 09:35:12',
    xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Reinf xmlns="http://www.reinf.esocial.gov.br/schemas/evtInfoContribuinte/v2_01_02">
  <evtInfoContri id="ID100000000000001">
    <ideEvento>
      <tpAmb>1</tpAmb>
      <procEmi>1</procEmi>
      <verProc>ContabilStudioPro_2026.1</verProc>
    </ideEvento>
    <ideContri>
      <tpInsc>1</tpInsc>
      <nrInsc>12345678000195</nrInsc>
    </ideContri>
    <infoContri>
      <inclusao>
        <idePeriodo>
          <iniValid>2026-01</iniValid>
        </idePeriodo>
        <infoCadastro>
          <classTrib>99</classTrib>
          <indEscrituracao>1</indEscrituracao>
          <indDesoneracao>0</indDesoneracao>
          <indAcordoIsenMulta>0</indAcordoIsenMulta>
          <contato>
            <nmCtt>Roberto Mendes da Silva</nmCtt>
            <cpfCtt>12345678901</cpfCtt>
            <foneFixo>1133334444</foneFixo>
            <email>fiscal@empresaexemplo.com.br</email>
          </contato>
          <softwareHouse>
            <cnpjSoftHouse>11222333000144</cnpjSoftHouse>
            <nmRazao>AMILLABS TECNOLOGIA CONTABIL LTDA</nmRazao>
            <nmCont>Suporte Tecnico</nmCont>
            <email>suporte@amillabs.com.br</email>
          </softwareHouse>
        </infoCadastro>
      </inclusao>
    </infoContri>
  </evtInfoContri>
</Reinf>`,
    detalhes: {
      totalBaseCalculo: 0,
      totalRetencao: 0
    }
  },
  {
    id: 2,
    empresaId: 1,
    tipoEvento: 'R-2010',
    nomeEvento: 'Retenção Contribuição Previdenciária - Serviços Tomados',
    competencia: '2026-10',
    status: 'VALIDADO',
    dataGeracao: '2026-10-15 14:00:00',
    xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Reinf xmlns="http://www.reinf.esocial.gov.br/schemas/evtTomadorServicos/v2_01_02">
  <evtServTom id="ID201000000000001">
    <ideEvento>
      <perApur>2026-10</perApur>
      <tpAmb>1</tpAmb>
      <procEmi>1</procEmi>
      <verProc>ContabilStudioPro_2026.1</verProc>
    </ideEvento>
    <ideContri>
      <tpInsc>1</tpInsc>
      <nrInsc>12345678000195</nrInsc>
    </ideContri>
    <infoServTom>
      <ideEstabObra>
        <tpInscEstab>1</tpInscEstab>
        <nrInscEstab>12345678000195</nrInscEstab>
        <idePrestServ>
          <cnpjPrestador>22333444000155</cnpjPrestador>
          <vlrTotalBruto>32000.00</vlrTotalBruto>
          <vlrTotalBaseRet>32000.00</vlrTotalBaseRet>
          <vlrTotalRetPrinc>3520.00</vlrTotalRetPrinc>
          <nfs>
            <serie>1</serie>
            <numDocto>4520</numDocto>
            <dtEmisNF>2026-10-05</dtEmisNF>
            <vlrBruto>32000.00</vlrBruto>
            <infoTpServ>
              <tpServ>100000001</tpServ>
              <vlrBaseRet>32000.00</vlrBaseRet>
              <vlrRetencao>3520.00</vlrRetencao>
            </infoTpServ>
          </nfs>
        </idePrestServ>
      </ideEstabObra>
    </infoServTom>
  </evtServTom>
</Reinf>`,
    detalhes: {
      totalBaseCalculo: 32000.00,
      totalRetencao: 3520.00,
      codigoReceita: '2631',
      prestadorTomador: 'SEGURANÇA E VIGILÂNCIA PATRIMONIAL LTDA',
      cnpjCpf: '22.333.444/0001-55'
    }
  },
  {
    id: 3,
    empresaId: 1,
    tipoEvento: 'R-4020',
    nomeEvento: 'Retenções na Fonte - Pagamentos a PJ (IRRF / CSRF)',
    competencia: '2026-10',
    status: 'VALIDADO',
    dataGeracao: '2026-10-15 14:15:00',
    xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Reinf xmlns="http://www.reinf.esocial.gov.br/schemas/evtRetencaoPJ/v2_01_02">
  <evtRetPJ id="ID402000000000001">
    <ideEvento>
      <perApur>2026-10</perApur>
      <tpAmb>1</tpAmb>
      <procEmi>1</procEmi>
      <verProc>ContabilStudioPro_2026.1</verProc>
    </ideEvento>
    <ideContri>
      <tpInsc>1</tpInsc>
      <nrInsc>12345678000195</nrInsc>
    </ideContri>
    <ideEstab>
      <tpInsc>1</tpInsc>
      <nrInsc>12345678000195</nrInsc>
      <ideBenef>
        <cnpjBenef>15419093000144</cnpjBenef>
        <idePgto>
          <natRend>13007</natRend>
          <observacao>Serviços de Assessoria Técnica e Nuvem</observacao>
          <infoPgto>
            <dtFG>2026-10-08</dtFG>
            <vlrBruto>12800.00</vlrBruto>
            <retencoes>
              <vlrIR>192.00</vlrIR>
              <vlrCSLL>128.00</vlrCSLL>
              <vlrCofins>384.00</vlrCofins>
              <vlrPP>83.20</vlrPP>
              <vlrAgreg>595.20</vlrAgreg>
            </retencoes>
          </infoPgto>
        </idePgto>
      </ideBenef>
    </ideEstab>
  </evtRetPJ>
</Reinf>`,
    detalhes: {
      totalBaseCalculo: 12800.00,
      totalRetencao: 787.20,
      codigoReceita: '1708 / 5952',
      prestadorTomador: 'AMAZON WEB SERVICES BRASIL LTDA',
      cnpjCpf: '15.419.093/0001-44',
      naturezaRendimento: '13007 - Serviços de Assessoria Técnica Especializada'
    }
  }
];

const SEED_NFSE_EMISSAO: NfseEmissao[] = [
  {
    id: 1,
    empresaId: 1,
    numeroDPS: 101,
    serieDPS: '1',
    numeroNfse: '20260000000101',
    codigoVerificacao: 'ABC8-9921-XF88',
    dataEmissao: '2026-10-05 10:15:00',
    competencia: '2026-10',
    tomadorId: 1,
    tomadorRazaoSocial: 'INDUSTRIA METALURGICA PAULISTA S/A',
    tomadorCnpjCpf: '11.222.333/0001-81',
    tomadorEmail: 'financeiro@metalurgicapaulista.com.br',
    tomadorEndereco: 'Av. das Indústrias, 1500 - Galpão 3',
    tomadorCidade: 'São Paulo',
    tomadorUf: 'SP',
    tomadorCodigoIbge: '3550308',
    itemLc116: '17.19 - Contabilidade, consultoria tributária e auditoria',
    codigoTributacaoNacional: '17.19.01',
    discriminacaoServico: 'Honorários Profissionais Contábeis e Assessoria Fiscal/Trabalhista ref. competência 10/2026 conforme Contrato de Prestação de Serviços nº 2026/01.',
    valorServicos: 6850.00,
    valorDeducoes: 0,
    baseCalculoISS: 6850.00,
    aliquotaISS: 5.0,
    valorISS: 342.50,
    issRetido: false,
    retencaoIRRF: 102.75, // 1,5%
    retencaoPIS: 44.53, // 0,65%
    retencaoCOFINS: 205.50, // 3,0%
    retencaoCSLL: 68.50, // 1,0%
    retencaoINSS: 0,
    valorTotalRetencoes: 421.28,
    valorLiquidoNfse: 6428.72,
    status: 'EMITIDA',
    faturaHonorarioId: 1,
    integradaFiscal: true,
    integradaContabil: true
  },
  {
    id: 2,
    empresaId: 1,
    numeroDPS: 102,
    serieDPS: '1',
    numeroNfse: '20260000000102',
    codigoVerificacao: 'J9K2-7711-BR94',
    dataEmissao: '2026-10-10 11:30:00',
    competencia: '2026-10',
    tomadorId: 2,
    tomadorRazaoSocial: 'COMERCIO E DISTRIBUIDORA ALIANCA LTDA',
    tomadorCnpjCpf: '22.333.444/0001-92',
    tomadorEmail: 'contato@distribuidoraalianca.com.br',
    tomadorEndereco: 'Rua das Flores, 420',
    tomadorCidade: 'Campinas',
    tomadorUf: 'SP',
    tomadorCodigoIbge: '3509502',
    itemLc116: '17.19 - Contabilidade, consultoria tributária e auditoria',
    codigoTributacaoNacional: '17.19.01',
    discriminacaoServico: 'Serviços contábeis mensais, conciliação e escrituração SPED EFD Contribuições e ECD/ECF ref. 10/2026.',
    valorServicos: 4200.00,
    valorDeducoes: 0,
    baseCalculoISS: 4200.00,
    aliquotaISS: 5.0,
    valorISS: 210.00,
    issRetido: false,
    retencaoIRRF: 63.00,
    retencaoPIS: 27.30,
    retencaoCOFINS: 126.00,
    retencaoCSLL: 42.00,
    retencaoINSS: 0,
    valorTotalRetencoes: 258.30,
    valorLiquidoNfse: 3941.70,
    status: 'EMITIDA',
    faturaHonorarioId: 2,
    integradaFiscal: true,
    integradaContabil: true
  }
];

const SEED_ITENS_CIAP: ItemCiap[] = [
  {
    id: 1,
    empresaId: 1,
    codigoBem: 'CIAP-001',
    descricaoBem: 'Torno CNC Industrial Mazak Quick Turn',
    dataEntrada: '2025-01-10',
    numeroNotaFiscal: '10420',
    serieNotaFiscal: '1',
    fornecedorNome: 'MAZAK SULAMERICANA LTDA',
    fornecedorCnpj: '02.441.988/0001-90',
    valorTotalBem: 240000.00,
    valorICMSOriginal: 43200.00,
    parcelaAtual: 22,
    totalParcelas: 48,
    parcelaMesICMS: 900.00,
    saldoICMSRemanescente: 23400.00,
    status: 'ATIVO'
  },
  {
    id: 2,
    empresaId: 1,
    codigoBem: 'CIAP-002',
    descricaoBem: 'Centro de Usinagem Vertical Romi D800',
    dataEntrada: '2025-06-15',
    numeroNotaFiscal: '3201',
    serieNotaFiscal: '1',
    fornecedorNome: 'INDUSTRIAS ROMI S.A.',
    fornecedorCnpj: '56.720.252/0001-88',
    valorTotalBem: 380000.00,
    valorICMSOriginal: 68400.00,
    parcelaAtual: 17,
    totalParcelas: 48,
    parcelaMesICMS: 1425.00,
    saldoICMSRemanescente: 44175.00,
    status: 'ATIVO'
  },
  {
    id: 3,
    empresaId: 1,
    codigoBem: 'CIAP-003',
    descricaoBem: 'Injetora de Plástico Hidráulica 250T',
    dataEntrada: '2026-02-20',
    numeroNotaFiscal: '5514',
    serieNotaFiscal: '2',
    fornecedorNome: 'HAITIAN BRASIL MAQUINAS LTDA',
    fornecedorCnpj: '07.391.222/0001-33',
    valorTotalBem: 180000.00,
    valorICMSOriginal: 32400.00,
    parcelaAtual: 9,
    totalParcelas: 48,
    parcelaMesICMS: 675.00,
    saldoICMSRemanescente: 26325.00,
    status: 'ATIVO'
  }
];

const SEED_EVENTOS_ESOCIAL: EventoESocial[] = [
  {
    id: 1,
    empresaId: 1,
    tipoEvento: 'S-1200',
    nomeEvento: 'Remuneração de Trabalhador vinculado ao RGPS',
    colaboradorId: 1,
    colaboradorNome: 'CARLOS EDUARDO SILVA',
    colaboradorCpf: '123.456.789-01',
    matricula: 'EMP-001',
    competencia: '2026-10',
    dataGeracao: '2026-10-15 11:00:00',
    status: 'VALIDADO',
    bases: {
      baseINSS: 4500.00,
      baseFGTS: 4500.00,
      baseIRRF: 3850.20,
      valorLiquido: 3752.45
    },
    xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtRemun/v_S_01_02_00">
  <evtRemun id="ID1123456780001952026101511000000001">
    <ideEvento>
      <indRetif>1</indRetif>
      <perApur>2026-10</perApur>
      <tpAmb>1</tpAmb>
      <procEmi>1</procEmi>
      <verProc>ContabilStudioPro_2026.1</verProc>
    </ideEvento>
    <ideEmpregador>
      <tpInsc>1</tpInsc>
      <nrInsc>12345678000195</nrInsc>
    </ideEmpregador>
    <ideTrabalhador>
      <cpfTrab>12345678901</cpfTrab>
      <infoComplem>
        <nmTrab>CARLOS EDUARDO SILVA</nmTrab>
        <dtNascto>1988-05-12</dtNascto>
      </infoComplem>
    </ideTrabalhador>
    <dmDev>
      <ideDmDev>FOLHA_MENSAL_102026</ideDmDev>
      <infoPerApur>
        <ideEstabLot>
          <tpInsc>1</tpInsc>
          <nrInsc>12345678000195</nrInsc>
          <codLotacao>LOT-001</codLotacao>
          <remunPerApur>
            <matricula>EMP-001</matricula>
            <itensRemun>
              <codRubr>1001</codRubr>
              <ideTabRubr>TAB-RUBR</ideTabRubr>
              <qtdRubr>30</qtdRubr>
              <fatorRubr>1.0</fatorRubr>
              <vrRubr>4500.00</vrRubr>
              <indApurIR>0</indApurIR>
            </itensRemun>
          </remunPerApur>
        </ideEstabLot>
      </infoPerApur>
    </dmDev>
  </evtRemun>
</eSocial>`
  },
  {
    id: 2,
    empresaId: 1,
    tipoEvento: 'S-1210',
    nomeEvento: 'Pagamentos de Rendimentos do Trabalho',
    colaboradorId: 1,
    colaboradorNome: 'CARLOS EDUARDO SILVA',
    colaboradorCpf: '123.456.789-01',
    matricula: 'EMP-001',
    competencia: '2026-10',
    dataGeracao: '2026-10-15 11:15:00',
    status: 'VALIDADO',
    bases: {
      baseINSS: 4500.00,
      baseFGTS: 4500.00,
      baseIRRF: 3850.20,
      valorLiquido: 3752.45
    },
    xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtPgtos/v_S_01_02_00">
  <evtPgtos id="ID1123456780001952026101511150000001">
    <ideEvento>
      <indRetif>1</indRetif>
      <perApur>2026-10</perApur>
      <tpAmb>1</tpAmb>
      <procEmi>1</procEmi>
      <verProc>ContabilStudioPro_2026.1</verProc>
    </ideEvento>
    <ideEmpregador>
      <tpInsc>1</tpInsc>
      <nrInsc>12345678000195</nrInsc>
    </ideEmpregador>
    <ideBenef>
      <cpfBenef>12345678901</cpfBenef>
      <infoPgto>
        <dtPgto>2026-11-05</dtPgto>
        <tpPgto>1</tpPgto>
        <perRef>2026-10</perRef>
        <ideDmDev>FOLHA_MENSAL_102026</ideDmDev>
        <vrLiq>3752.45</vrLiq>
      </infoPgto>
    </ideBenef>
  </evtPgtos>
</eSocial>`
  }
];

const SEED_BAIXAS_ATIVOS: BaixaAtivoImobilizado[] = [
  {
    id: 1,
    empresaId: 1,
    ativoId: 2,
    codigoBem: 'VEIC-001',
    descricaoBem: 'Veículo Utilitário Fiorino 1.4 Flex',
    dataAquisicao: '2022-03-10',
    dataBaixa: '2026-02-15',
    motivoBaixa: 'VENDA',
    valorAquisicaoOriginal: 65000.00,
    depreciacaoAcumuladaData: 48750.00,
    valorContabilResidual: 16250.00,
    valorVendaAlienacao: 28000.00,
    resultadoOperacao: 11750.00,
    tipoResultado: 'GANHO_CAPITAL',
    aliquotaIRPJGanho: 15.0,
    aliquotaCSLLGanho: 9.0,
    impostoDevidoGanho: 2820.00,
    numeroNotaFiscalVenda: '1099',
    serieNotaFiscalVenda: '1',
    compradorNome: 'AUTO PEÇAS E MOTORES BRASIL LTDA',
    compradorCnpjCpf: '11.222.333/0001-44',
    estornoCiapNecessario: false,
    saldoCiapEstornado: 0,
    integradoContabil: true,
    loteContabilId: 105
  }
];

const SEED_INVENTARIO_PATRIMONIAL: ItemInventarioPatrimonial[] = [
  {
    id: 1,
    empresaId: 1,
    ativoId: 1,
    codigoPatrimonio: 'PAT-00101',
    descricao: 'Servidor Dell PowerEdge R750 com 128GB RAM',
    centroCustoId: 1,
    centroCustoNome: 'Administração Geral',
    departamento: 'Tecnologia da Informação',
    responsavelNome: 'LUCAS MENDES',
    responsavelCpf: '222.333.444-55',
    localizacaoFisica: 'Data Center - Rack 02 - Slot 04',
    dataTombamento: '2025-01-15',
    estadoConservacao: 'EXCELENTE',
    situacaoInventario: 'LOCALIZADO',
    qrCodeIdentificador: 'PAT00101-DELL-R750-TI'
  },
  {
    id: 2,
    empresaId: 1,
    ativoId: 2,
    codigoPatrimonio: 'PAT-00102',
    descricao: 'Torno CNC Mazak Quick Turn Industrial',
    centroCustoId: 2,
    centroCustoNome: 'Produção / Operacional',
    departamento: 'Usinagem Industrial',
    responsavelNome: 'MARCOS ROBERTO',
    responsavelCpf: '333.444.555-66',
    localizacaoFisica: 'Galpão Fabril B - Linha 1',
    dataTombamento: '2025-01-10',
    estadoConservacao: 'EXCELENTE',
    situacaoInventario: 'LOCALIZADO',
    qrCodeIdentificador: 'PAT00102-MAZAK-CNC'
  },
  {
    id: 3,
    empresaId: 1,
    ativoId: 3,
    codigoPatrimonio: 'PAT-00103',
    descricao: 'Estação de Trabalho Dell Precision 5820',
    centroCustoId: 1,
    centroCustoNome: 'Administração Geral',
    departamento: 'Controladoria & Auditoria',
    responsavelNome: 'BEATRIZ LIMA',
    responsavelCpf: '444.555.666-77',
    localizacaoFisica: 'Andar 14 - Sala de Auditoria',
    dataTombamento: '2025-06-20',
    estadoConservacao: 'BOM',
    situacaoInventario: 'LOCALIZADO',
    qrCodeIdentificador: 'PAT00103-DELL-PRECISION'
  }
];

const SEED_IMOVEIS_RURAIS: ImovelRuralLCDPR[] = [
  {
    id: 1,
    empresaId: 1,
    codigoImovel: '001',
    nirf: '12345678',
    codigoIncra: '98765432100',
    nomeImovel: 'Fazenda Agropecuária Santa Cruz',
    endereco: 'Rodovia SP-330 Km 214 - Zona Rural',
    municipio: 'Ribeirão Preto',
    uf: 'SP',
    codigoIbge: '3543402',
    tipoExploracao: '1',
    percentualParticipacao: 100.00
  }
];

const SEED_LANCAMENTOS_LCDPR: LancamentoLCDPR[] = [
  {
    id: 1,
    empresaId: 1,
    ano: 2026,
    data: '2026-01-15',
    imovelRuralId: 1,
    imovelNome: 'Fazenda Agropecuária Santa Cruz',
    contaBancaria: 'Banco do Brasil C/C 45900-1 (Ag. 0048)',
    tipoDocumento: '1',
    numeroDocumento: 'NF-e 1420',
    participanteNome: 'COOPERATIVA AGROINDUSTRIAL COAMO',
    participanteCnpjCpf: '75.643.218/0001-90',
    tipoLancamento: 'RECEITA',
    descricao: 'Venda de 1.200 sacas de Soja Safra 2025/2026',
    valorEntrada: 156000.00,
    valorSaida: 0,
    saldoProgressivo: 156000.00
  },
  {
    id: 2,
    empresaId: 1,
    ano: 2026,
    data: '2026-01-28',
    imovelRuralId: 1,
    imovelNome: 'Fazenda Agropecuária Santa Cruz',
    contaBancaria: 'Banco do Brasil C/C 45900-1 (Ag. 0048)',
    tipoDocumento: '1',
    numeroDocumento: 'NF-e 8841',
    participanteNome: 'FERTILIZANTES E DEFENSIVOS PAULISTA S/A',
    participanteCnpjCpf: '03.882.119/0001-52',
    tipoLancamento: 'DESPESA',
    descricao: 'Aquisição de Adubação NPK e Defensivos para Milho Safrinha',
    valorEntrada: 0,
    valorSaida: 48200.00,
    saldoProgressivo: 107800.00
  },
  {
    id: 3,
    empresaId: 1,
    ano: 2026,
    data: '2026-02-10',
    imovelRuralId: 1,
    imovelNome: 'Fazenda Agropecuária Santa Cruz',
    contaBancaria: 'Banco do Brasil C/C 45900-1 (Ag. 0048)',
    tipoDocumento: '1',
    numeroDocumento: 'NF-e 9920',
    participanteNome: 'PETROBRAS DISTRIBUIDORA DE COMBUSTÍVEIS',
    participanteCnpjCpf: '33.000.167/0001-01',
    tipoLancamento: 'DESPESA',
    descricao: 'Aquisição de Óleo Diesel S10 para Tratores e Colheitadeiras',
    valorEntrada: 0,
    valorSaida: 24500.00,
    saldoProgressivo: 83300.00
  }
];

const SEED_RESCISOES_TRCT: RescisaoContratual[] = [
  {
    id: 1,
    empresaId: 1,
    colaboradorId: 3,
    colaboradorNome: 'JULIANA PEREIRA LIMA',
    cargo: 'Assistente Administrativo Pleno',
    dataAdmissao: '2023-04-10',
    dataDemissao: '2026-03-31',
    dataAvisoPrevio: '2026-03-01',
    motivo: 'SEM_JUSTA_CAUSA',
    tipoAviso: 'TRABALHADO',
    diasAvisoLei12506: 36,
    salarioBase: 3800.00,
    saldoSalarioDias: 30,
    saldoSalarioValor: 3800.00,
    decimoTerceiroAvos: 3,
    decimoTerceiroValor: 950.00,
    feriasProporcionaisAvos: 12,
    feriasProporcionaisValor: 3800.00,
    tercoConstitucionalFeriasProp: 1266.67,
    feriasVencidasValor: 0,
    tercoConstitucionalFeriasVenc: 0,
    avisoPrevioIndenizadoValor: 760.00,
    totalProventosBruto: 10576.67,
    inssRescisao: 372.40,
    irrfRescisao: 114.85,
    outrasDeducoes: 0,
    totalDescontos: 487.25,
    valorLiquidoRescisorio: 10089.42,
    saldoFgtsParaFinsRescisorios: 12450.00,
    aliquotaMultaFgts: 40,
    valorMultaFgts: 4980.00,
    statusIntegracaoContabil: true,
    loteContabilId: 140,
    observacoes: 'Homologação concluída com quitação bancária e liberação das guias de seguro-desemprego e chave FGTS.'
  }
];

const SEED_ITENS_INVENTARIO_ESTOQUE: ItemInventarioEstoque[] = [
  {
    id: 1,
    empresaId: 1,
    ano: 2026,
    dataInventario: '2026-12-31',
    codigoItem: 'PROD-001',
    descricaoItem: 'Servidor Dell PowerEdge T150 Xeon E-2314',
    tipoItemSped: '00',
    unidadeMedida: 'UN',
    quantidade: 14,
    custoMedioUnitario: 8950.00,
    valorTotal: 125300.00,
    indicadorPropriedade: '0',
    contaContabilCodigo: '1.01.03.001.0001'
  },
  {
    id: 2,
    empresaId: 1,
    ano: 2026,
    dataInventario: '2026-12-31',
    codigoItem: 'PROD-002',
    descricaoItem: 'Switch Gerenciável 24 Portas Gigabit L2 PoE+',
    tipoItemSped: '00',
    unidadeMedida: 'UN',
    quantidade: 35,
    custoMedioUnitario: 1450.00,
    valorTotal: 50750.00,
    indicadorPropriedade: '0',
    contaContabilCodigo: '1.01.03.001.0001'
  },
  {
    id: 3,
    empresaId: 1,
    ano: 2026,
    dataInventario: '2026-12-31',
    codigoItem: 'PROD-003',
    descricaoItem: 'Bobina Cabo de Rede UTP Cat6 305m Homologado',
    tipoItemSped: '01',
    unidadeMedida: 'CX',
    quantidade: 80,
    custoMedioUnitario: 420.00,
    valorTotal: 33600.00,
    indicadorPropriedade: '0',
    contaContabilCodigo: '1.01.03.002.0001'
  },
  {
    id: 4,
    empresaId: 1,
    ano: 2026,
    dataInventario: '2026-12-31',
    codigoItem: 'PROD-004',
    descricaoItem: 'Nobreak Senoidal Online Dupla Conversão 3kVA',
    tipoItemSped: '00',
    unidadeMedida: 'UN',
    quantidade: 8,
    custoMedioUnitario: 4100.00,
    valorTotal: 32800.00,
    indicadorPropriedade: '0',
    contaContabilCodigo: '1.01.03.001.0001'
  }
];

const SEED_APURACOES_PGDAS: ApuracaoPgdas[] = [
  {
    id: 1,
    empresaId: 1,
    competencia: '2026-04',
    dataVencimento: '2026-05-20',
    rbt12: 1250000.00,
    faturamentoMes: 115000.00,
    folhaSalarios12Meses: 385000.00,
    fatorR: 0.308,
    enquadraFatorR: true,
    segregacoes: [
      {
        id: 'SEG-1',
        anexo: 'ANEXO_III',
        descricaoAtividade: 'Serviços de Consultoria de TI & Suporte Técnico (Fator R >= 28%)',
        valorReceitaBruta: 85000.00,
        valorImuneIsento: 0,
        valorSubstituicaoTributaria: 0,
        valorTributavel: 85000.00,
        aliquotaEfetiva: 0.1315,
        valorDevido: 11177.50,
        detalhamentoTributos: {
          irpj: 447.10,
          csll: 391.21,
          cofins: 1432.96,
          pis: 310.73,
          cpp: 4851.04,
          icms: 0,
          ipi: 0,
          iss: 3744.46
        }
      },
      {
        id: 'SEG-2',
        anexo: 'ANEXO_I',
        descricaoAtividade: 'Revenda de Peças e Periféricos de Informática no Mercado Interno',
        valorReceitaBruta: 30000.00,
        valorImuneIsento: 0,
        valorSubstituicaoTributaria: 6000.00,
        valorTributavel: 30000.00,
        aliquotaEfetiva: 0.0890,
        valorDevido: 2457.00,
        detalhamentoTributos: {
          irpj: 135.14,
          csll: 85.99,
          cofins: 312.98,
          pis: 67.81,
          cpp: 1019.65,
          icms: 835.43,
          ipi: 0,
          iss: 0
        }
      }
    ],
    totalDevidoDas: 13634.50,
    numeroDas: '01.2026.04.88776655.12',
    codigoBarrasDas: '85870000136-3 34500179202-6 60520260488-8 77665512001-9',
    qrCodePixDas: '00020126580014br.gov.bcb.pix0136pgdas-arrecadacao-das@receita.fazenda.gov.br520400005303986540813634.505802BR5925RECEITA FEDERAL DO BRASIL6009SAO PAULO62240520DAS20260488776655126304D1B8',
    statusIntegracaoContabil: true,
    loteContabilId: 145,
    dataApuracao: '2026-05-02'
  }
];

const SEED_PLANOS_BENEFICIOS: BeneficioPlano[] = [
  {
    id: 1,
    empresaId: 1,
    tipo: 'VALE_TRANSPORTE',
    nome: 'SPTrans Bilhete Único Urbano',
    operadora: 'SPTrans / EMTU',
    valorFacialUnitario: 5.00,
    percentualDescontoLegal: 6.0,
    ativo: true
  },
  {
    id: 2,
    empresaId: 1,
    tipo: 'VALE_REFEICAO',
    nome: 'VR Refeição Flash Card Flex',
    operadora: 'Flash Benefícios S.A.',
    valorFacialUnitario: 38.00,
    percentualDescontoLegal: 10.0,
    ativo: true
  },
  {
    id: 3,
    empresaId: 1,
    tipo: 'PLANO_SAUDE',
    nome: 'Bradesco Saúde Top Nacional Flex',
    operadora: 'Bradesco Seguros',
    valorFacialUnitario: 0,
    percentualDescontoLegal: 20.0,
    valorMensalidadeFixa: 480.00,
    ativo: true
  },
  {
    id: 4,
    empresaId: 1,
    tipo: 'PLANO_ODONTO',
    nome: 'OdontoPrev Dental Corporativo',
    operadora: 'OdontoPrev',
    valorFacialUnitario: 0,
    percentualDescontoLegal: 100.0,
    valorMensalidadeFixa: 32.50,
    ativo: true
  }
];

const SEED_FECHAMENTOS_BENEFICIOS: FechamentoBeneficiosCompetencia[] = [
  {
    competencia: '2026-04',
    empresaId: 1,
    totalBeneficiosFornecidos: 2364.00,
    totalDescontoEmpregados: 546.00,
    totalCustoEmpresa: 1818.00,
    totalValeTransporte: 440.00,
    totalValeRefeicaoAlimentacao: 1672.00,
    totalPlanosSaudeOdonto: 252.00,
    itens: [
      {
        id: 1,
        empresaId: 1,
        colaboradorId: 1,
        colaboradorNome: 'CARLOS ALBERTO SILVA',
        planoId: 1,
        tipo: 'VALE_TRANSPORTE',
        diasUteisMes: 22,
        quantidadeDiaria: 2,
        valorTotalBeneficio: 220.00,
        descontoColaborador: 210.00,
        custoEmpregador: 10.00,
        coparticipacao: 0
      },
      {
        id: 2,
        empresaId: 1,
        colaboradorId: 1,
        colaboradorNome: 'CARLOS ALBERTO SILVA',
        planoId: 2,
        tipo: 'VALE_REFEICAO',
        diasUteisMes: 22,
        quantidadeDiaria: 1,
        valorTotalBeneficio: 836.00,
        descontoColaborador: 83.60,
        custoEmpregador: 752.40,
        coparticipacao: 0
      },
      {
        id: 3,
        empresaId: 1,
        colaboradorId: 2,
        colaboradorNome: 'ANA PAULA FERREIRA',
        planoId: 1,
        tipo: 'VALE_TRANSPORTE',
        diasUteisMes: 22,
        quantidadeDiaria: 2,
        valorTotalBeneficio: 220.00,
        descontoColaborador: 168.00,
        custoEmpregador: 52.00,
        coparticipacao: 0
      },
      {
        id: 4,
        empresaId: 1,
        colaboradorId: 2,
        colaboradorNome: 'ANA PAULA FERREIRA',
        planoId: 2,
        tipo: 'VALE_REFEICAO',
        diasUteisMes: 22,
        quantidadeDiaria: 1,
        valorTotalBeneficio: 836.00,
        descontoColaborador: 83.60,
        custoEmpregador: 752.40,
        coparticipacao: 0
      }
    ],
    statusIntegracaoContabil: true,
    loteContabilId: 146,
    fechadoEm: '2026-04-30'
  }
];

export class DatabaseService {
  private empresas: Empresa[] = [];
  private contas: ContaContabil[] = [];
  private historicos: HistoricoPadrao[] = [];
  private lancamentos: LancamentoContabil[] = [];
  private documentos: DocumentoStudio[] = [];
  private centrosCusto: CentroCusto[] = [];
  private lancamentosPadrao: LancamentoPadrao[] = [];
  private lotes: LoteContabil[] = [];
  private usuarios: Usuario[] = [];
  private auditoria: AuditoriaLog[] = [];
  private parametros: ParametrosEmpresa = SEED_PARAMETROS;
  private redeConfig: ConfiguracaoRede = {
    modo: 'SERVIDOR',
    serverHost: 'localhost',
    serverPort: 4590,
    isOnline: true
  };
  private currentUser: Usuario = SEED_USUARIOS[0];
  private activeEmpresaId: number = 1;

  // Multi-Módulos
  private acumuladores: AcumuladorFiscal[] = [];
  private notasFiscais: NotaFiscal[] = [];
  private apuracoesFiscais: ApuracaoFiscal[] = [];
  private participantes: ParticipanteFiscal[] = [];
  private produtos: ProdutoServico[] = [];
  private colaboradores: Colaborador[] = [];
  private rubricasFolha: RubricaFolha[] = [];
  private folhasMensais: FolhaMensal[] = [];
  private contratosHonorarios: ContratoHonorario[] = [];
  private faturasHonorarios: FaturaHonorario[] = [];
  private regrasConciliacao: RegraConciliacao[] = [];
  private variaveisColaboradores: VariaveisColaborador[] = [];
  private ativosImobilizados: AtivoImobilizado[] = [];
  private calculosFerias: CalculoFerias[] = [];
  private calculosDecimoTerceiro: CalculoDecimoTerceiro[] = [];
  private calculosRescisao: CalculoRescisao[] = [];
  private obrigacoesFiscais: ObrigacaoFiscal[] = [];
  private administradorasCartao: AdministradoraCartao[] = [];
  private vendasCartao: VendaCartaoOperadora[] = [];
  private contasParteBLalur: ContaParteBLalur[] = [];
  private lancamentosParteA: LancamentoLalurParteA[] = [];
  private movimentosParteBLalur: MovimentoParteBLalur[] = [];
  private eventosReinf: EventoReinf[] = [];
  private nfseEmitidas: NfseEmissao[] = [];
  private itensCiap: ItemCiap[] = [];
  private eventosESocial: EventoESocial[] = [];
  private baixasAtivos: BaixaAtivoImobilizado[] = [];
  private itensInventario: ItemInventarioPatrimonial[] = [];
  private imoveisRurais: ImovelRuralLCDPR[] = [];
  private lancamentosLcdpr: LancamentoLCDPR[] = [];
  private rescisoesTrct: RescisaoContratual[] = [];
  private itensInventarioEstoque: ItemInventarioEstoque[] = [];
  private apuracoesPgdas: ApuracaoPgdas[] = [];
  private planosBeneficios: BeneficioPlano[] = [];
  private fechamentosBeneficios: FechamentoBeneficiosCompetencia[] = [];

  constructor() {
    this.initDatabase();
    this.connectServerIfAvailable();
  }

  private initDatabase() {
    const raw = localStorage.getItem(STORAGE_KEYS.SNAPSHOT);
    if (raw) {
      try {
        const snap = JSON.parse(raw);
        this.empresas = snap.empresas || [SEED_EMPRESA];
        this.contas = snap.contas || SEED_CONTAS;
        this.historicos = snap.historicos || SEED_HISTORICOS;
        this.lancamentos = snap.lancamentos || SEED_LANCAMENTOS;
        this.documentos = snap.documentos || SEED_DOCUMENTOS;
        this.centrosCusto = snap.centrosCusto || SEED_CENTROS_CUSTO;
        this.lancamentosPadrao = snap.lancamentosPadrao || SEED_LANCAMENTOS_PADRAO;
        this.lotes = snap.lotes || SEED_LOTES;
        this.usuarios = snap.usuarios || SEED_USUARIOS;
        this.auditoria = snap.auditoria || SEED_AUDITORIA;
        this.parametros = snap.parametros || SEED_PARAMETROS;
        this.activeEmpresaId = snap.activeEmpresaId || 1;

        this.acumuladores = snap.acumuladores || SEED_ACUMULADORES;
        this.notasFiscais = snap.notasFiscais || SEED_NOTAS_FISCAIS;
        this.apuracoesFiscais = snap.apuracoesFiscais || SEED_APURACOES_FISCAIS;
        this.participantes = snap.participantes || SEED_PARTICIPANTES;
        this.produtos = snap.produtos || SEED_PRODUTOS;
        this.colaboradores = snap.colaboradores || SEED_COLABORADORES;
        this.rubricasFolha = snap.rubricasFolha || SEED_RUBRICAS;
        this.folhasMensais = snap.folhasMensais || SEED_FOLHAS;
        this.contratosHonorarios = snap.contratosHonorarios || SEED_CONTRATOS;
        this.faturasHonorarios = snap.faturasHonorarios || SEED_FATURAS;
        this.regrasConciliacao = snap.regrasConciliacao || SEED_REGRAS_CONCILIACAO;
        this.variaveisColaboradores = snap.variaveisColaboradores || SEED_VARIAVEIS_COLABORADORES;
        this.ativosImobilizados = snap.ativosImobilizados || SEED_ATIVOS_IMOBILIZADOS;
        this.calculosFerias = snap.calculosFerias || SEED_CALCULOS_FERIAS;
        this.calculosDecimoTerceiro = snap.calculosDecimoTerceiro || SEED_CALCULOS_DECIMO_TERCEIRO;
        this.calculosRescisao = snap.calculosRescisao || SEED_CALCULOS_RESCISAO;
        this.obrigacoesFiscais = snap.obrigacoesFiscais || SEED_OBRIGACOES_FISCAIS;
        this.administradorasCartao = snap.administradorasCartao || SEED_ADMINISTRADORAS_CARTAO;
        this.vendasCartao = snap.vendasCartao || SEED_VENDAS_CARTAO;
        this.contasParteBLalur = snap.contasParteBLalur || SEED_CONTAS_PARTE_B_LALUR;
        this.lancamentosParteA = snap.lancamentosParteA || SEED_LANCAMENTOS_PARTE_A;
        this.eventosReinf = snap.eventosReinf || SEED_EVENTOS_REINF;
        this.nfseEmitidas = snap.nfseEmitidas || SEED_NFSE_EMISSAO;
        this.itensCiap = snap.itensCiap || SEED_ITENS_CIAP;
        this.eventosESocial = snap.eventosESocial || SEED_EVENTOS_ESOCIAL;
        this.baixasAtivos = snap.baixasAtivos || SEED_BAIXAS_ATIVOS;
        this.itensInventario = snap.itensInventario || SEED_INVENTARIO_PATRIMONIAL;
        this.imoveisRurais = snap.imoveisRurais || SEED_IMOVEIS_RURAIS;
        this.lancamentosLcdpr = snap.lancamentosLcdpr || SEED_LANCAMENTOS_LCDPR;
        this.rescisoesTrct = snap.rescisoesTrct || SEED_RESCISOES_TRCT;
        this.itensInventarioEstoque = snap.itensInventarioEstoque || SEED_ITENS_INVENTARIO_ESTOQUE;
        this.apuracoesPgdas = snap.apuracoesPgdas || SEED_APURACOES_PGDAS;
        this.planosBeneficios = snap.planosBeneficios || SEED_PLANOS_BENEFICIOS;
        this.fechamentosBeneficios = snap.fechamentosBeneficios || SEED_FECHAMENTOS_BENEFICIOS;
      } catch (e) {
        this.carregarSeeds();
      }
    } else {
      this.carregarSeeds();
    }

    const rawRede = localStorage.getItem(STORAGE_KEYS.REDE_CONFIG);
    if (rawRede) {
      try { this.redeConfig = JSON.parse(rawRede); } catch (e) { }
    }

    const rawUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (rawUser) {
      try { this.currentUser = JSON.parse(rawUser); } catch (e) { }
    }
  }

  private carregarSeeds() {
    this.empresas = [SEED_EMPRESA];
    this.contas = [...SEED_CONTAS];
    this.historicos = [...SEED_HISTORICOS];
    this.lancamentos = [...SEED_LANCAMENTOS];
    this.documentos = [...SEED_DOCUMENTOS];
    this.centrosCusto = [...SEED_CENTROS_CUSTO];
    this.lancamentosPadrao = [...SEED_LANCAMENTOS_PADRAO];
    this.lotes = [...SEED_LOTES];
    this.usuarios = [...SEED_USUARIOS];
    this.auditoria = [...SEED_AUDITORIA];
    this.parametros = { ...SEED_PARAMETROS };
    this.activeEmpresaId = 1;

    this.acumuladores = [...SEED_ACUMULADORES];
    this.notasFiscais = [...SEED_NOTAS_FISCAIS];
    this.apuracoesFiscais = [...SEED_APURACOES_FISCAIS];
    this.participantes = [...SEED_PARTICIPANTES];
    this.produtos = [...SEED_PRODUTOS];
    this.colaboradores = [...SEED_COLABORADORES];
    this.rubricasFolha = [...SEED_RUBRICAS];
    this.folhasMensais = [...SEED_FOLHAS];
    this.contratosHonorarios = [...SEED_CONTRATOS];
    this.faturasHonorarios = [...SEED_FATURAS];
    this.regrasConciliacao = [...SEED_REGRAS_CONCILIACAO];
    this.variaveisColaboradores = [...SEED_VARIAVEIS_COLABORADORES];
    this.ativosImobilizados = [...SEED_ATIVOS_IMOBILIZADOS];
    this.calculosFerias = [...SEED_CALCULOS_FERIAS];
    this.calculosDecimoTerceiro = [...SEED_CALCULOS_DECIMO_TERCEIRO];
    this.calculosRescisao = [...SEED_CALCULOS_RESCISAO];
    this.obrigacoesFiscais = [...SEED_OBRIGACOES_FISCAIS];
    this.administradorasCartao = [...SEED_ADMINISTRADORAS_CARTAO];
    this.vendasCartao = [...SEED_VENDAS_CARTAO];
    this.contasParteBLalur = [...SEED_CONTAS_PARTE_B_LALUR];
    this.lancamentosParteA = [...SEED_LANCAMENTOS_PARTE_A];
    this.eventosReinf = [...SEED_EVENTOS_REINF];
    this.nfseEmitidas = [...SEED_NFSE_EMISSAO];
    this.itensCiap = [...SEED_ITENS_CIAP];
    this.eventosESocial = [...SEED_EVENTOS_ESOCIAL];
    this.baixasAtivos = [...SEED_BAIXAS_ATIVOS];
    this.itensInventario = [...SEED_INVENTARIO_PATRIMONIAL];
    this.imoveisRurais = [...SEED_IMOVEIS_RURAIS];
    this.lancamentosLcdpr = [...SEED_LANCAMENTOS_LCDPR];
    this.rescisoesTrct = [...SEED_RESCISOES_TRCT];
    this.itensInventarioEstoque = [...SEED_ITENS_INVENTARIO_ESTOQUE];
    this.apuracoesPgdas = [...SEED_APURACOES_PGDAS];
    this.planosBeneficios = [...SEED_PLANOS_BENEFICIOS];
    this.fechamentosBeneficios = [...SEED_FECHAMENTOS_BENEFICIOS];

    this.persistSnapshot();
  }

  public persistSnapshot() {
    const snap = {
      empresas: this.empresas,
      contas: this.contas,
      historicos: this.historicos,
      lancamentos: this.lancamentos,
      documentos: this.documentos,
      centrosCusto: this.centrosCusto,
      lancamentosPadrao: this.lancamentosPadrao,
      lotes: this.lotes,
      usuarios: this.usuarios,
      auditoria: this.auditoria,
      parametros: this.parametros,
      activeEmpresaId: this.activeEmpresaId,
      acumuladores: this.acumuladores,
      notasFiscais: this.notasFiscais,
      apuracoesFiscais: this.apuracoesFiscais,
      participantes: this.participantes,
      produtos: this.produtos,
      colaboradores: this.colaboradores,
      rubricasFolha: this.rubricasFolha,
      folhasMensais: this.folhasMensais,
      contratosHonorarios: this.contratosHonorarios,
      faturasHonorarios: this.faturasHonorarios,
      regrasConciliacao: this.regrasConciliacao,
      variaveisColaboradores: this.variaveisColaboradores,
      ativosImobilizados: this.ativosImobilizados,
      calculosFerias: this.calculosFerias,
      calculosDecimoTerceiro: this.calculosDecimoTerceiro,
      calculosRescisao: this.calculosRescisao,
      obrigacoesFiscais: this.obrigacoesFiscais,
      administradorasCartao: this.administradorasCartao,
      vendasCartao: this.vendasCartao,
      contasParteBLalur: this.contasParteBLalur,
      lancamentosParteA: this.lancamentosParteA,
      eventosReinf: this.eventosReinf,
      nfseEmitidas: this.nfseEmitidas,
      itensCiap: this.itensCiap,
      eventosESocial: this.eventosESocial,
      baixasAtivos: this.baixasAtivos,
      itensInventario: this.itensInventario,
      imoveisRurais: this.imoveisRurais,
      lancamentosLcdpr: this.lancamentosLcdpr,
      rescisoesTrct: this.rescisoesTrct,
      itensInventarioEstoque: this.itensInventarioEstoque,
      apuracoesPgdas: this.apuracoesPgdas,
      planosBeneficios: this.planosBeneficios,
      fechamentosBeneficios: this.fechamentosBeneficios,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.SNAPSHOT, JSON.stringify(snap));
    this.syncToServer(snap);
  }

  private async syncToServer(data: any) {
    try {
      const url = `http://${this.redeConfig.serverHost}:${this.redeConfig.serverPort}/api/save`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      this.redeConfig.isOnline = true;
    } catch (e) {
      this.redeConfig.isOnline = false;
    }
  }

  public async connectServerIfAvailable() {
    try {
      const url = `http://${this.redeConfig.serverHost}:${this.redeConfig.serverPort}/api/data`;
      const res = await fetch(url);
      const json = await res.json();
      if (json && json.success && json.data) {
        const d = json.data;
        if (d.empresas) this.empresas = d.empresas;
        if (d.contas) this.contas = d.contas;
        if (d.historicos) this.historicos = d.historicos;
        if (d.lancamentos) this.lancamentos = d.lancamentos;
        if (d.documentos) this.documentos = d.documentos;
        if (d.centrosCusto) this.centrosCusto = d.centrosCusto;
        if (d.lancamentosPadrao) this.lancamentosPadrao = d.lancamentosPadrao;
        if (d.lotes) this.lotes = d.lotes;
        if (d.usuarios) this.usuarios = d.usuarios;
        if (d.parametros) this.parametros = d.parametros;
        if (d.acumuladores) this.acumuladores = d.acumuladores;
        if (d.notasFiscais) this.notasFiscais = d.notasFiscais;
        if (d.apuracoesFiscais) this.apuracoesFiscais = d.apuracoesFiscais;
        if (d.participantes) this.participantes = d.participantes;
        if (d.produtos) this.produtos = d.produtos;
        if (d.colaboradores) this.colaboradores = d.colaboradores;
        if (d.rubricasFolha) this.rubricasFolha = d.rubricasFolha;
        if (d.folhasMensais) this.folhasMensais = d.folhasMensais;
        if (d.contratosHonorarios) this.contratosHonorarios = d.contratosHonorarios;
        if (d.faturasHonorarios) this.faturasHonorarios = d.faturasHonorarios;
        if (d.regrasConciliacao) this.regrasConciliacao = d.regrasConciliacao;
        this.redeConfig.isOnline = true;
      }
    } catch (e) {
      this.redeConfig.isOnline = false;
    }
  }

  public registrarAuditoria(modulo: string, acao: string, descricao: string) {
    const log: AuditoriaLog = {
      id: Date.now(),
      dataHora: new Date().toISOString().replace('T', ' ').substring(0, 19),
      usuarioNome: this.currentUser?.nome || 'Sistema',
      modulo,
      acao,
      descricao
    };
    this.auditoria.unshift(log);
    this.persistSnapshot();
  }

  public get isOnline(): boolean {
    return Boolean(this.redeConfig.isOnline);
  }

  public exportBackupJson(): string {
    return JSON.stringify({
      empresas: this.empresas,
      contas: this.contas,
      historicos: this.historicos,
      lancamentos: this.lancamentos,
      documentos: this.documentos,
      centrosCusto: this.centrosCusto,
      lancamentosPadrao: this.lancamentosPadrao,
      lotes: this.lotes,
      usuarios: this.usuarios,
      parametros: this.parametros,
      auditoria: this.auditoria,
      acumuladores: this.acumuladores,
      notasFiscais: this.notasFiscais,
      apuracoesFiscais: this.apuracoesFiscais,
      colaboradores: this.colaboradores,
      rubricasFolha: this.rubricasFolha,
      folhasMensais: this.folhasMensais,
      contratosHonorarios: this.contratosHonorarios,
      faturasHonorarios: this.faturasHonorarios,
      regrasConciliacao: this.regrasConciliacao
    }, null, 2);
  }

  public restaurarBackupJSON(jsonStr: string): boolean {
    try {
      const snap = JSON.parse(jsonStr);
      if (snap.empresas && snap.contas) {
        this.empresas = snap.empresas;
        this.contas = snap.contas;
        this.historicos = snap.historicos || [];
        this.lancamentos = snap.lancamentos || [];
        this.documentos = snap.documentos || [];
        this.centrosCusto = snap.centrosCusto || [];
        this.lancamentosPadrao = snap.lancamentosPadrao || [];
        this.lotes = snap.lotes || [];
        this.usuarios = snap.usuarios || [];
        this.parametros = snap.parametros || SEED_PARAMETROS;
        this.acumuladores = snap.acumuladores || SEED_ACUMULADORES;
        this.notasFiscais = snap.notasFiscais || SEED_NOTAS_FISCAIS;
        this.apuracoesFiscais = snap.apuracoesFiscais || SEED_APURACOES_FISCAIS;
        this.colaboradores = snap.colaboradores || SEED_COLABORADORES;
        this.rubricasFolha = snap.rubricasFolha || SEED_RUBRICAS;
        this.folhasMensais = snap.folhasMensais || SEED_FOLHAS;
        this.contratosHonorarios = snap.contratosHonorarios || SEED_CONTRATOS;
        this.faturasHonorarios = snap.faturasHonorarios || SEED_FATURAS;
        this.regrasConciliacao = snap.regrasConciliacao || SEED_REGRAS_CONCILIACAO;
        this.persistSnapshot();
        this.registrarAuditoria('SISTEMA', 'RESTAURAÇÃO', 'Banco de dados restaurado com sucesso.');
        return true;
      }
    } catch (e) { }
    return false;
  }

  public importBackupJson(jsonStr: string): boolean {
    return this.restaurarBackupJSON(jsonStr);
  }

  // APIs Empresa
  public getEmpresas(): Empresa[] { return [...this.empresas]; }
  public getEmpresa(id: number): Empresa | undefined { return this.empresas.find(e => e.id === id); }
  public getActiveEmpresa(): Empresa {
    return this.empresas.find(e => e.id === this.activeEmpresaId) || this.empresas[0] || SEED_EMPRESA;
  }
  public setActiveEmpresa(id: number) {
    this.activeEmpresaId = id;
    this.registrarAuditoria('EMPRESA', 'SELEÇÃO', `Empresa ativa alterada para ID ${id}.`);
    this.persistSnapshot();
  }
  public saveEmpresa(emp: Empresa) {
    const idx = this.empresas.findIndex(e => e.id === emp.id);
    if (idx >= 0) {
      this.empresas[idx] = emp;
      this.registrarAuditoria('EMPRESA', 'ALTERAÇÃO', `Empresa ${emp.razaoSocial} atualizada.`);
    } else {
      emp.id = Date.now();
      this.empresas.push(emp);
      this.registrarAuditoria('EMPRESA', 'CADASTRO', `Nova empresa ${emp.razaoSocial} cadastrada.`);
    }
    this.persistSnapshot();
  }
  public deleteEmpresa(id: number): { success: boolean; message?: string } {
    if (this.empresas.length <= 1) {
      return { success: false, message: 'Não é possível excluir a única empresa cadastrada.' };
    }
    const emp = this.empresas.find(e => e.id === id);
    this.empresas = this.empresas.filter(e => e.id !== id);
    if (this.activeEmpresaId === id) {
      this.activeEmpresaId = this.empresas[0].id;
    }
    this.registrarAuditoria('EMPRESA', 'EXCLUSÃO', `Empresa ${emp?.razaoSocial} excluída.`);
    this.persistSnapshot();
    return { success: true };
  }

  // APIs Contas
  public getContas(empresaId?: number): ContaContabil[] {
    const empId = empresaId || this.activeEmpresaId;
    return this.contas.filter(c => c.empresaId === empId);
  }
  public getContaById(id: number): ContaContabil | undefined {
    return this.contas.find(c => c.id === id);
  }
  public saveConta(conta: ContaContabil) {
    const idx = this.contas.findIndex(c => c.id === conta.id);
    if (idx >= 0) {
      this.contas[idx] = conta;
      this.registrarAuditoria('PLANO_CONTAS', 'ALTERAÇÃO', `Conta ${conta.codigoReduzido} - ${conta.nome} alterada.`);
    } else {
      conta.id = Date.now();
      this.contas.push(conta);
      this.registrarAuditoria('PLANO_CONTAS', 'CADASTRO', `Conta ${conta.codigoReduzido} - ${conta.nome} criada.`);
    }
    this.persistSnapshot();
  }
  public deleteConta(id: number): { success: boolean; message?: string } {
    const hasLancamentos = this.lancamentos.some(l => l.contaDebitoId === id || l.contaCreditoId === id);
    if (hasLancamentos) {
      return { success: false, message: 'Não é possível excluir esta conta contábil pois existem lançamentos vinculados a ela.' };
    }
    const conta = this.getContaById(id);
    this.contas = this.contas.filter(c => c.id !== id);
    this.registrarAuditoria('PLANO_CONTAS', 'EXCLUSÃO', `Conta ${conta?.codigoReduzido} - ${conta?.nome} excluída.`);
    this.persistSnapshot();
    return { success: true };
  }

  // APIs Lançamentos
  public getLancamentos(empresaId?: number): LancamentoContabil[] {
    const empId = empresaId || this.activeEmpresaId;
    return this.lancamentos.filter(l => l.empresaId === empId).sort((a, b) => b.id - a.id);
  }
  public addLancamento(lanc: Omit<LancamentoContabil, 'id' | 'createdAt'>): LancamentoContabil {
    const novo: LancamentoContabil = {
      ...lanc,
      id: Date.now() + Math.floor(Math.random() * 1000),
      usuarioNome: this.currentUser?.nome || 'Sistema',
      createdAt: new Date().toISOString()
    };
    this.lancamentos.unshift(novo);
    this.registrarAuditoria('LANÇAMENTOS', 'INCLUSÃO', `Partida nº ${novo.numeroPartida} gravada no valor de R$ ${novo.valor.toFixed(2)}.`);
    this.persistSnapshot();
    return novo;
  }
  public updateLancamento(lanc: LancamentoContabil) {
    const idx = this.lancamentos.findIndex(l => l.id === lanc.id);
    if (idx >= 0) {
      this.lancamentos[idx] = lanc;
      this.registrarAuditoria('LANÇAMENTOS', 'EDIÇÃO', `Partida nº ${lanc.numeroPartida} alterada para R$ ${lanc.valor.toFixed(2)}.`);
      this.persistSnapshot();
    }
  }
  public deleteLancamento(id: number) {
    const l = this.lancamentos.find(item => item.id === id);
    this.lancamentos = this.lancamentos.filter(item => item.id !== id);
    this.registrarAuditoria('LANÇAMENTOS', 'EXCLUSÃO', `Partida nº ${l?.numeroPartida} excluída.`);
    this.persistSnapshot();
  }
  public estornarLancamento(lancamentoId: number): LancamentoContabil | null {
    const original = this.lancamentos.find(l => l.id === lancamentoId);
    if (!original) return null;

    const estorno: Omit<LancamentoContabil, 'id' | 'createdAt'> = {
      empresaId: original.empresaId,
      numeroPartida: this.lancamentos.length + 1,
      loteId: original.loteId,
      dataLancamento: new Date().toISOString().slice(0, 10),
      tipoPartida: original.tipoPartida,
      contaDebitoId: original.contaCreditoId, // Inverte Débito e Crédito
      contaCreditoId: original.contaDebitoId,
      valor: original.valor,
      centroCustoId: original.centroCustoId,
      historicoId: original.historicoId,
      complementoHistorico: `Estorno referente à partida nº ${original.numeroPartida} de ${original.dataLancamento}`,
      usuarioNome: this.currentUser?.nome
    };

    return this.addLancamento(estorno);
  }

  // APIs Históricos
  public getHistoricos(empresaId?: number): HistoricoPadrao[] {
    const empId = empresaId || this.activeEmpresaId;
    return this.historicos.filter(h => h.empresaId === empId);
  }
  public saveHistorico(h: HistoricoPadrao) {
    const idx = this.historicos.findIndex(item => item.id === h.id);
    if (idx >= 0) this.historicos[idx] = h;
    else { h.id = Date.now(); this.historicos.push(h); }
    this.persistSnapshot();
  }
  public deleteHistorico(id: number) {
    this.historicos = this.historicos.filter(h => h.id !== id);
    this.persistSnapshot();
  }

  // APIs Centros de Custo
  public getCentrosCusto(empresaId?: number): CentroCusto[] {
    const empId = empresaId || this.activeEmpresaId;
    return this.centrosCusto.filter(c => c.empresaId === empId);
  }
  public saveCentroCusto(c: CentroCusto) {
    const idx = this.centrosCusto.findIndex(item => item.id === c.id);
    if (idx >= 0) this.centrosCusto[idx] = c;
    else { c.id = Date.now(); this.centrosCusto.push(c); }
    this.persistSnapshot();
  }
  public deleteCentroCusto(id: number) {
    this.centrosCusto = this.centrosCusto.filter(c => c.id !== id);
    this.persistSnapshot();
  }

  // APIs Lançamentos Padrão
  public getLancamentosPadrao(empresaId?: number): LancamentoPadrao[] {
    const empId = empresaId || this.activeEmpresaId;
    return this.lancamentosPadrao.filter(l => l.empresaId === empId);
  }
  public saveLancamentoPadrao(lp: LancamentoPadrao) {
    const idx = this.lancamentosPadrao.findIndex(item => item.id === lp.id);
    if (idx >= 0) this.lancamentosPadrao[idx] = lp;
    else { lp.id = Date.now(); this.lancamentosPadrao.push(lp); }
    this.persistSnapshot();
  }
  public deleteLancamentoPadrao(id: number) {
    this.lancamentosPadrao = this.lancamentosPadrao.filter(l => l.id !== id);
    this.persistSnapshot();
  }

  // APIs Lotes
  public getLotes(empresaId?: number): LoteContabil[] {
    const empId = empresaId || this.activeEmpresaId;
    return this.lotes.filter(l => l.empresaId === empId);
  }
  public saveLote(lote: LoteContabil) {
    const idx = this.lotes.findIndex(item => item.id === lote.id);
    if (idx >= 0) this.lotes[idx] = lote;
    else { lote.id = Date.now(); this.lotes.push(lote); }
    this.persistSnapshot();
  }

  // APIs Documentos
  public getDocumentos(empresaId?: number): DocumentoStudio[] {
    const empId = empresaId || this.activeEmpresaId;
    return this.documentos.filter(d => d.empresaId === empId);
  }
  public saveDocumento(doc: DocumentoStudio) {
    const idx = this.documentos.findIndex(d => d.id === doc.id);
    doc.updatedAt = new Date().toISOString();
    if (idx >= 0) this.documentos[idx] = doc;
    else { doc.id = Date.now(); this.documentos.push(doc); }
    this.persistSnapshot();
  }

  // APIs Usuários & Autenticação
  public getUsuarios(): Usuario[] { return [...this.usuarios]; }
  public getCurrentUser(): Usuario { return this.currentUser; }
  public setCurrentUser(user: Usuario) {
    this.currentUser = user;
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    this.registrarAuditoria('SEGURANÇA', 'LOGIN', `Usuário ${user.nome} (${user.login}) autenticado.`);
  }
  public saveUsuario(user: Usuario) {
    const idx = this.usuarios.findIndex(u => u.id === user.id);
    if (idx >= 0) this.usuarios[idx] = user;
    else { user.id = Date.now(); this.usuarios.push(user); }
    this.persistSnapshot();
  }

  // APIs Parâmetros
  public getParametros(empresaId?: number): ParametrosEmpresa {
    return { ...this.parametros, empresaId: empresaId || this.activeEmpresaId };
  }
  public saveParametros(params: ParametrosEmpresa) {
    this.parametros = params;
    this.registrarAuditoria('PARÂMETROS', 'ATUALIZAÇÃO', 'Parâmetros contábeis atualizados.');
    this.persistSnapshot();
  }

  // APIs Auditoria & Rede
  public getAuditoriaLogs(): AuditoriaLog[] { return [...this.auditoria]; }
  public getRedeConfig(): ConfiguracaoRede { return { ...this.redeConfig }; }
  public saveRedeConfig(config: ConfiguracaoRede) {
    this.redeConfig = config;
    localStorage.setItem(STORAGE_KEYS.REDE_CONFIG, JSON.stringify(config));
    this.connectServerIfAvailable();
  }

  // --------------------------------------------------------------------------
  // MÓDULO ESCRITA FISCAL (EF) - SPED 0150 & 0200
  // --------------------------------------------------------------------------
  public getParticipantes(empresaId?: number): ParticipanteFiscal[] {
    const empId = empresaId || this.activeEmpresaId;
    return this.participantes.filter(p => p.empresaId === empId);
  }
  public saveParticipante(p: ParticipanteFiscal) {
    const idx = this.participantes.findIndex(item => item.id === p.id);
    if (idx >= 0) {
      this.participantes[idx] = p;
    } else {
      p.id = Date.now();
      this.participantes.unshift(p);
    }
    this.persistSnapshot();
    this.registrarAuditoria('ESCRITA', 'CADASTRO_PARTICIPANTE', `Participante ${p.codigo} - ${p.nomeRazaoSocial} salvo.`);
  }
  public deleteParticipante(id: number) {
    const p = this.participantes.find(item => item.id === id);
    this.participantes = this.participantes.filter(item => item.id !== id);
    this.persistSnapshot();
    if (p) {
      this.registrarAuditoria('ESCRITA', 'EXCLUSAO_PARTICIPANTE', `Participante ${p.codigo} - ${p.nomeRazaoSocial} excluído.`);
    }
  }

  public getProdutos(empresaId?: number): ProdutoServico[] {
    const empId = empresaId || this.activeEmpresaId;
    return this.produtos.filter(prod => prod.empresaId === empId);
  }
  public saveProduto(prod: ProdutoServico) {
    const idx = this.produtos.findIndex(item => item.id === prod.id);
    if (idx >= 0) {
      this.produtos[idx] = prod;
    } else {
      prod.id = Date.now();
      this.produtos.unshift(prod);
    }
    this.persistSnapshot();
    this.registrarAuditoria('ESCRITA', 'CADASTRO_PRODUTO', `Item SPED ${prod.codigo} - ${prod.descricao} salvo.`);
  }
  public deleteProduto(id: number) {
    const prod = this.produtos.find(item => item.id === id);
    this.produtos = this.produtos.filter(item => item.id !== id);
    this.persistSnapshot();
    if (prod) {
      this.registrarAuditoria('ESCRITA', 'EXCLUSAO_PRODUTO', `Item SPED ${prod.codigo} - ${prod.descricao} excluído.`);
    }
  }

  public getAcumuladores(empresaId?: number): AcumuladorFiscal[] {
    const empId = empresaId || this.activeEmpresaId;
    return this.acumuladores.filter(a => a.empresaId === empId);
  }
  public saveAcumulador(a: AcumuladorFiscal) {
    const idx = this.acumuladores.findIndex(item => item.id === a.id);
    if (idx >= 0) this.acumuladores[idx] = a;
    else { a.id = Date.now(); this.acumuladores.push(a); }
    this.persistSnapshot();
  }
  public deleteAcumulador(id: number) {
    this.acumuladores = this.acumuladores.filter(a => a.id !== id);
    this.persistSnapshot();
  }

  public getNotasFiscais(empresaId?: number): NotaFiscal[] {
    const empId = empresaId || this.activeEmpresaId;
    return this.notasFiscais.filter(n => n.empresaId === empId).sort((a, b) => (Number(b.numero) || 0) - (Number(a.numero) || 0));
  }
  public saveNotaFiscal(nf: NotaFiscal) {
    const idx = this.notasFiscais.findIndex(item => item.id === nf.id);
    if (idx >= 0) this.notasFiscais[idx] = nf;
    else { nf.id = Date.now(); this.notasFiscais.unshift(nf); }
    this.persistSnapshot();
  }
  public deleteNotaFiscal(id: number) {
    this.notasFiscais = this.notasFiscais.filter(n => n.id !== id);
    this.persistSnapshot();
  }

  public getApuracoesFiscais(empresaId?: number): ApuracaoFiscal[] {
    const empId = empresaId || this.activeEmpresaId;
    return this.apuracoesFiscais.filter(a => a.empresaId === empId);
  }
  public getApuracaoFiscal(empresaIdOrComp?: number | string, compOrEmpresaId?: string | number): ApuracaoFiscal | undefined {
    let empId = this.activeEmpresaId;
    let comp: string | undefined;

    if (typeof empresaIdOrComp === 'number') {
      empId = empresaIdOrComp;
      if (typeof compOrEmpresaId === 'string') comp = compOrEmpresaId;
    } else if (typeof empresaIdOrComp === 'string') {
      comp = empresaIdOrComp;
      if (typeof compOrEmpresaId === 'number') empId = compOrEmpresaId;
    }

    if (comp) {
      return this.apuracoesFiscais.find(a => a.empresaId === empId && a.competencia === comp);
    }
    return this.apuracoesFiscais.find(a => a.empresaId === empId);
  }
  public saveApuracaoFiscal(ap: ApuracaoFiscal) {
    const idx = this.apuracoesFiscais.findIndex(item => item.id === ap.id);
    if (idx >= 0) this.apuracoesFiscais[idx] = ap;
    else { ap.id = Date.now(); this.apuracoesFiscais.unshift(ap); }
    this.persistSnapshot();
  }

  // --------------------------------------------------------------------------
  // LIVROS FISCAIS OFICIAIS (ESCRITA FISCAL / PADRÃO  SISTEMAS)
  // --------------------------------------------------------------------------
  public gerarLivroEntradas(empresaId?: number, dataInicial?: string, dataFinal?: string): LinhaLivroEntradas[] {
    const empId = empresaId || this.activeEmpresaId;
    let notas = this.notasFiscais.filter(n => n.empresaId === empId && n.tipo === 'ENTRADA');

    if (dataInicial) {
      notas = notas.filter(n => (n.dataEntradaSaida || n.dataEmissao) >= dataInicial);
    }
    if (dataFinal) {
      notas = notas.filter(n => (n.dataEntradaSaida || n.dataEmissao) <= dataFinal);
    }

    notas.sort((a, b) => new Date(a.dataEntradaSaida || a.dataEmissao).getTime() - new Date(b.dataEntradaSaida || b.dataEmissao).getTime() || (Number(a.numero) || 0) - (Number(b.numero) || 0));

    return notas.map((n, idx) => {
      const part = this.participantes.find(p => p.cnpjCpf === n.clienteFornecedorCnpj || p.id === n.participanteId);
      const isST = n.cfop?.startsWith('1.403') || n.cfop?.startsWith('2.403');
      const isUsoConsumo = n.cfop?.startsWith('1.556') || n.cfop?.startsWith('2.556');
      const baseICMS = n.baseCalculoICMS || 0;
      const valorICMS = n.valorICMS || 0;
      const aliqICMS = baseICMS > 0 && valorICMS > 0 ? Math.round((valorICMS / baseICMS) * 100) : 0;

      const isentas = isST ? (n.valorTotal - baseICMS) : 0;
      const outras = isUsoConsumo ? n.valorTotal : (!isST && baseICMS === 0 ? n.valorTotal : 0);

      return {
        id: n.id || idx + 1,
        dataEntrada: n.dataEntradaSaida || n.dataEmissao,
        dataEmissao: n.dataEmissao,
        especie: n.modelo === '55' ? 'NF-e 55' : 'Doc. Fiscal',
        serie: n.serie || '1',
        numero: n.numero,
        emitenteNome: n.clienteFornecedorNome || part?.nomeRazaoSocial || 'FORNECEDOR',
        emitenteCnpjCpf: n.clienteFornecedorCnpj || part?.cnpjCpf || '',
        emitenteUf: part?.uf || 'SP',
        cfop: n.cfop || '1.102',
        valorContabil: n.valorTotal,
        baseCalculoICMS: baseICMS,
        aliquotaICMS: aliqICMS,
        impostoCreditadoICMS: valorICMS,
        isentasNaoTributadasICMS: Math.max(0, isentas),
        outrasICMS: Math.max(0, outras),
        impostoCreditadoIPI: 0,
        observacoes: isST ? 'ICMS Retido por ST na origem' : (isUsoConsumo ? 'Material Uso/Consumo s/ crédito' : 'Operação tributada integralmente')
      };
    });
  }

  public gerarLivroSaidas(empresaId?: number, dataInicial?: string, dataFinal?: string): LinhaLivroSaidas[] {
    const empId = empresaId || this.activeEmpresaId;
    let notas = this.notasFiscais.filter(n => n.empresaId === empId && (n.tipo === 'SAIDA' || n.tipo === 'SERVICO'));

    if (dataInicial) {
      notas = notas.filter(n => n.dataEmissao >= dataInicial);
    }
    if (dataFinal) {
      notas = notas.filter(n => n.dataEmissao <= dataFinal);
    }

    notas.sort((a, b) => new Date(a.dataEmissao).getTime() - new Date(b.dataEmissao).getTime() || (Number(a.numero) || 0) - (Number(b.numero) || 0));

    return notas.map((n, idx) => {
      const part = this.participantes.find(p => p.cnpjCpf === n.clienteFornecedorCnpj || p.id === n.participanteId);
      const isST = n.cfop?.startsWith('5.405') || n.cfop?.startsWith('6.405');
      const isServico = n.tipo === 'SERVICO' || n.cfop?.startsWith('5.933');
      const baseICMS = isServico ? 0 : (n.baseCalculoICMS || 0);
      const valorICMS = isServico ? 0 : (n.valorICMS || 0);
      const aliqICMS = baseICMS > 0 && valorICMS > 0 ? Math.round((valorICMS / baseICMS) * 100) : 0;

      const isentas = isST ? (n.valorTotal - baseICMS) : 0;
      const outras = isServico ? n.valorTotal : (!isST && baseICMS === 0 ? n.valorTotal : 0);

      return {
        id: n.id || idx + 1,
        dataEmissao: n.dataEmissao,
        dataSaida: n.dataEntradaSaida || n.dataEmissao,
        especie: isServico ? 'NFS-e' : (n.modelo === '55' ? 'NF-e 55' : 'NFC-e 65'),
        serie: n.serie || '1',
        numero: n.numero,
        destinatarioNome: n.clienteFornecedorNome || part?.nomeRazaoSocial || 'CLIENTE',
        destinatarioCnpjCpf: n.clienteFornecedorCnpj || part?.cnpjCpf || '',
        destinatarioUf: part?.uf || 'SP',
        cfop: n.cfop || (isServico ? '5.933' : '5.102'),
        valorContabil: n.valorTotal,
        baseCalculoICMS: baseICMS,
        aliquotaICMS: aliqICMS,
        impostoDebitadoICMS: valorICMS,
        isentasNaoTributadasICMS: Math.max(0, isentas),
        outrasICMS: Math.max(0, outras),
        icmsSTRetido: isST ? 0 : undefined,
        observacoes: isServico ? `ISS Retido: R$ ${(n.retencaoIRRF || 0).toFixed(2)}` : (isST ? 'ICMS ST Cobrado Anteriormente' : 'Venda tributada integralmente')
      };
    });
  }

  public gerarApuracaoICMSLivro(empresaId?: number, competencia?: string): ResumoApuracaoICMSLivro {
    const empId = empresaId || this.activeEmpresaId;
    const comp = competencia || this.getEmpresa(empId)?.competenciaAtiva || '2026-10';
    const [ano, mes] = comp.split('-');

    const notasComp = this.notasFiscais.filter(n => n.empresaId === empId && n.dataEmissao.startsWith(`${ano}-${mes}`));
    const notasEntrada = notasComp.filter(n => n.tipo === 'ENTRADA');
    const notasSaida = notasComp.filter(n => n.tipo === 'SAIDA');
    const notasServico = notasComp.filter(n => n.tipo === 'SERVICO' || n.cfop === '5.933');

    const totalDebitoPorSaidas = notasSaida.reduce((acc, n) => acc + (n.valorICMS || 0), 0);
    const outrosDebitos = 0;
    const estornoCreditos = 0;
    const totalDebitos = totalDebitoPorSaidas + outrosDebitos + estornoCreditos;

    const totalCreditoPorEntradas = notasEntrada.reduce((acc, n) => acc + (n.valorICMS || 0), 0);
    const outrosCreditos = 0;
    const estornoDebitos = 0;
    const saldoCredorAnterior = 0;
    const totalCreditos = totalCreditoPorEntradas + outrosCreditos + estornoDebitos + saldoCredorAnterior;

    const saldoDevedorApurado = Math.max(0, totalDebitos - totalCreditos);
    const saldoCredorATransportar = Math.max(0, totalCreditos - totalDebitos);

    // ISSQN
    const receitaServicos = notasServico.reduce((acc, n) => acc + n.valorTotal, 0);
    const deducoesBaseISS = 0;
    const baseCalculoISS = Math.max(0, receitaServicos - deducoesBaseISS);
    const aliquotaISS = 5.0; // 5%
    const issProprioDevido = Math.round((baseCalculoISS * (aliquotaISS / 100)) * 100) / 100;
    const issRetidoFonte = notasServico.reduce((acc, n) => acc + (n.retencaoIRRF || 0), 0);
    const issLiquidoARecolher = Math.max(0, issProprioDevido - issRetidoFonte);

    return {
      competencia: comp,
      totalDebitoPorSaidas,
      outrosDebitos,
      estornoCreditos,
      totalDebitos,
      totalCreditoPorEntradas,
      outrosCreditos,
      estornoDebitos,
      saldoCredorAnterior,
      totalCreditos,
      saldoDevedorApurado,
      saldoCredorATransportar,
      receitaServicos,
      deducoesBaseISS,
      baseCalculoISS,
      aliquotaISS,
      issProprioDevido,
      issRetidoFonte,
      issLiquidoARecolher
    };
  }

  // --------------------------------------------------------------------------
  // MOTOR LEGAL: SIMPLES NACIONAL COM SEGREGAÇÃO (ST ICMS & MONOFÁSICO PIS/COFINS)
  // LC 123/2006 Art. 18 § 4º-A & Resolução CGSN 140/2018
  // --------------------------------------------------------------------------
  public calcularSimplesNacionalComSegregacao(empresaId?: number, competencia?: string): ApuracaoFiscal {
    const empId = empresaId || this.activeEmpresaId;
    const emp = this.getEmpresa(empId);
    const comp = competencia || emp?.competenciaAtiva || '2026-10';
    const [ano, mes] = comp.split('-');

    const notas = this.getNotasFiscais(empId).filter(n => n.dataEmissao.startsWith(`${ano}-${mes}`));
    const notasSaida = notas.filter(n => n.tipo === 'SAIDA' || n.tipo === 'SERVICO');

    let receitaTributadaIntegral = 0;
    let receitaSegregadaST = 0;
    let receitaSegregadaMonofasico = 0;
    let receitaSegregadaSTeMonofasico = 0;

    for (const nf of notasSaida) {
      if (nf.itens && nf.itens.length > 0) {
        for (const item of nf.itens) {
          const isST = item.cstICMS === '60' || item.cstICMS === '10' || item.cstICMS === '30' || item.cstICMS === '70' || item.cfop === '5.405' || item.cfop === '6.405';
          const isMonofasico = item.cstPIS === '04' || item.cstPIS === '02' || item.cstCOFINS === '04' || item.ncm?.startsWith('8507') || item.ncm?.startsWith('2710') || item.ncm?.startsWith('8708') || item.ncm?.startsWith('3004');

          if (isST && isMonofasico) {
            receitaSegregadaSTeMonofasico += item.valorTotal;
          } else if (isST) {
            receitaSegregadaST += item.valorTotal;
          } else if (isMonofasico) {
            receitaSegregadaMonofasico += item.valorTotal;
          } else {
            receitaTributadaIntegral += item.valorTotal;
          }
        }
      } else {
        // Fallback por cabeçalho da nota
        const isST = nf.cfop?.startsWith('5.405') || nf.cfop?.startsWith('6.405');
        if (isST) {
          receitaSegregadaSTeMonofasico += nf.valorTotal;
        } else {
          receitaTributadaIntegral += nf.valorTotal;
        }
      }
    }

    const receitaBrutaTotal = receitaTributadaIntegral + receitaSegregadaST + receitaSegregadaMonofasico + receitaSegregadaSTeMonofasico;
    const rbt12 = 1250000.00; // Receita Bruta 12 Meses: Faixa 3 Anexo I (Alíquota nominal 9,50%, dedução R$ 13.860,00)

    // Alíquota efetiva base do Anexo I
    const aliqEfetivaBase = rbt12 > 0 ? ((rbt12 * 0.0950) - 13860.00) / rbt12 : 0.0839; // ~8,3912%

    // Fatias percentuais dos tributos no Anexo I:
    // CPP: 41.50%, ICMS: 34.00%, PIS: 2.76%, COFINS: 12.74%, IRPJ: 5.50%, CSLL: 3.50%
    const aliqIntegral = aliqEfetivaBase;
    const aliqSemICMS = aliqEfetivaBase * (1 - 0.3400); // 5,538%
    const aliqSemPISCOFINS = aliqEfetivaBase * (1 - 0.0276 - 0.1274); // 7,090%
    const aliqSemICMSEMonofasico = aliqEfetivaBase * (1 - 0.3400 - 0.0276 - 0.1274); // 4,237%

    const dasIntegral = receitaTributadaIntegral * aliqIntegral;
    const dasST = receitaSegregadaST * aliqSemICMS;
    const dasMonofasico = receitaSegregadaMonofasico * aliqSemPISCOFINS;
    const dasSTeMonofasico = receitaSegregadaSTeMonofasico * aliqSemICMSEMonofasico;

    const valorDASReal = Math.round((dasIntegral + dasST + dasMonofasico + dasSTeMonofasico) * 100) / 100;
    const dasSemSegregacao = Math.round((receitaBrutaTotal * aliqEfetivaBase) * 100) / 100;
    const economiaTributaria = Math.round((dasSemSegregacao - valorDASReal) * 100) / 100;
    const percentualEconomia = dasSemSegregacao > 0 ? (economiaTributaria / dasSemSegregacao) * 100 : 0;

    const det: Record<string, number> = {
      'Simples Nacional - CPP (Previdência Patronal)': Math.round((valorDASReal * 0.4150) * 100) / 100,
      'Simples Nacional - ICMS Próprio (s/ ST)': Math.round((dasIntegral * 0.3400 + dasMonofasico * 0.3400) * 100) / 100,
      'Simples Nacional - PIS/PASEP (s/ Monofásicos)': Math.round((dasIntegral * 0.0276 + dasST * 0.0276) * 100) / 100,
      'Simples Nacional - COFINS (s/ Monofásicos)': Math.round((dasIntegral * 0.1274 + dasST * 0.1274) * 100) / 100,
      'Simples Nacional - IRPJ': Math.round((valorDASReal * 0.0550) * 100) / 100,
      'Simples Nacional - CSLL': Math.round((valorDASReal * 0.0350) * 100) / 100
    };

    const apuracao: ApuracaoFiscal = {
      id: Date.now(),
      empresaId: empId,
      competencia: comp,
      regime: 'SIMPLES_NACIONAL',
      regimeTributario: 'SIMPLES_NACIONAL',
      receitaBruta: receitaBrutaTotal,
      faturamentoTotal: receitaBrutaTotal,
      rbt12,
      impostoDevido: valorDASReal,
      valorDAS: valorDASReal,
      aliquotaEfetiva: receitaBrutaTotal > 0 ? (valorDASReal / receitaBrutaTotal) : aliqEfetivaBase,
      aliquotaEfetivaDAS: receitaBrutaTotal > 0 ? (valorDASReal / receitaBrutaTotal) : aliqEfetivaBase,
      valorICMSApurado: det['Simples Nacional - ICMS Próprio (s/ ST)'],
      valorPISApurado: det['Simples Nacional - PIS/PASEP (s/ Monofásicos)'],
      valorCOFINSApurado: det['Simples Nacional - COFINS (s/ Monofásicos)'],
      valorISSApurado: 0,
      valorIRPJApurado: det['Simples Nacional - IRPJ'],
      valorCSLLApurado: det['Simples Nacional - CSLL'],
      detalhamentoImpostos: det,
      guiaGerada: true,
      dataVencimento: `${ano}-${(parseInt(mes) % 12 + 1).toString().padStart(2, '0')}-20`,
      status: 'CALCULADA',
      // Campos de Segregação
      receitaTributadaIntegral: Math.round(receitaTributadaIntegral * 100) / 100,
      receitaSegregadaST: Math.round(receitaSegregadaST * 100) / 100,
      receitaSegregadaMonofasico: Math.round(receitaSegregadaMonofasico * 100) / 100,
      receitaSegregadaSTeMonofasico: Math.round(receitaSegregadaSTeMonofasico * 100) / 100,
      dasSemSegregacao,
      economiaTributariaSegregacao: economiaTributaria,
      percentualEconomia: Math.round(percentualEconomia * 100) / 100,
      anexoSimples: 'Anexo I - Comércio'
    };

    this.saveApuracaoFiscal(apuracao);
    return apuracao;
  }

  // Integração Automática: Escrita Fiscal -> Contabilidade
  public gerarIntegracaoFiscalContabil(arg1: number | string, arg2?: string | number): {
    success: boolean;
    partidasGeradas: number;
    lancamentosCriados: number;
    count: number;
    loteId: number;
    lote: LoteContabil;
    valorTotal: number;
  } {
    let empId = this.activeEmpresaId;
    let competencia = new Date().toISOString().slice(0, 7);

    if (typeof arg1 === 'number') {
      empId = arg1;
      if (typeof arg2 === 'string') competencia = arg2;
    } else if (typeof arg1 === 'string') {
      competencia = arg1;
      if (typeof arg2 === 'number') empId = arg2;
    }

    const notasDaComp = this.notasFiscais.filter(n => n.empresaId === empId && n.dataEmissao.startsWith(competencia) && !n.integradaContabil);

    const loteVazio: LoteContabil = {
      id: Date.now(),
      empresaId: empId,
      numero: this.lotes.length + 1,
      numeroLote: this.lotes.length + 1,
      descricao: `Lote de Integração Escrita Fiscal - Comp. ${competencia}`,
      dataLote: `${competencia}-28`,
      status: 'FECHADO',
      totalDebito: 0,
      totalCredito: 0
    };

    if (notasDaComp.length === 0) {
      return { success: false, partidasGeradas: 0, lancamentosCriados: 0, count: 0, loteId: 0, lote: loteVazio, valorTotal: 0 };
    }

    const proximoNumLote = this.lotes.reduce((m, l) => Math.max(m, l.numero), 0) + 1;
    const lote: LoteContabil = {
      id: Date.now(),
      empresaId: empId,
      numero: proximoNumLote,
      numeroLote: proximoNumLote,
      descricao: `Lote de Integração Escrita Fiscal - Comp. ${competencia}`,
      dataLote: `${competencia}-28`,
      status: 'FECHADO',
      totalDebito: 0,
      totalCredito: 0
    };

    let totalD = 0;
    let totalC = 0;
    let partidasCount = 0;

    for (const nf of notasDaComp) {
      const acumulador = this.acumuladores.find(a => a.id === nf.acumuladorId);
      const debitoId = acumulador?.contaContabilDebitoId || (nf.tipo === 'ENTRADA' ? 15 : 11);
      const creditoId = acumulador?.contaContabilCreditoId || (nf.tipo === 'ENTRADA' ? 30 : 44);

      this.addLancamento({
        empresaId: empId,
        numeroPartida: this.lancamentos.length + 1,
        loteId: lote.id,
        dataLancamento: nf.dataEmissao,
        tipoPartida: 'SIMPLES',
        contaDebitoId: debitoId,
        contaCreditoId: creditoId,
        valor: nf.valorTotal,
        historicoId: acumulador?.historicoId || 1,
        complementoHistorico: `NF-e nº ${nf.numero} - ${nf.clienteFornecedorNome}`,
        usuarioNome: 'Integração Fiscal'
      });

      totalD += nf.valorTotal;
      totalC += nf.valorTotal;
      partidasCount++;

      nf.integradaContabil = true;
    }

    lote.totalDebito = totalD;
    lote.totalCredito = totalC;
    this.lotes.push(lote);

    this.persistSnapshot();
    this.registrarAuditoria('INTEGRAÇÃO_FISCAL', 'PROCESSAMENTO', `Integração de ${partidasCount} notas da competência ${competencia} geradas no Lote nº ${lote.numero}.`);

    return {
      success: true,
      partidasGeradas: partidasCount,
      lancamentosCriados: partidasCount,
      count: partidasCount,
      loteId: lote.id,
      lote,
      valorTotal: totalD
    };
  }

  // Integração de Apuração Fiscal (Tributos Devidos DAS / ICMS / PIS / COFINS / IRPJ / CSLL) -> Contabilidade
  public integrarApuracaoContabil(empresaId: number, competencia: string): {
    success: boolean;
    partidasGeradas: number;
    loteId: number;
    totalImposto: number;
  } {
    const ap = this.getApuracaoFiscal(empresaId, competencia);
    if (!ap || !ap.impostoDevido || ap.impostoDevido <= 0) {
      return { success: false, partidasGeradas: 0, loteId: 0, totalImposto: 0 };
    }

    const proximoNumLote = this.lotes.reduce((m, l) => Math.max(m, l.numero), 0) + 1;
    const loteId = Date.now();
    const lote: LoteContabil = {
      id: loteId,
      empresaId,
      numero: proximoNumLote,
      numeroLote: proximoNumLote,
      descricao: `Lote de Provisão de Tributos e Impostos Fiscais - Comp. ${competencia}`,
      dataLote: `${competencia}-28`,
      status: 'FECHADO',
      totalDebito: 0,
      totalCredito: 0
    };

    let partidas = 0;
    let totalGeral = 0;

    if (ap.regime === 'SIMPLES_NACIONAL' || ap.valorDAS) {
      const vDAS = ap.valorDAS || ap.impostoDevido;
      this.addLancamento({
        empresaId,
        numeroPartida: this.lancamentos.length + 1,
        loteId,
        dataLancamento: `${competencia}-28`,
        tipoPartida: 'SIMPLES',
        contaDebitoId: 45, // (-) Tributos Incidentes sobre Vendas
        contaCreditoId: 29, // Simples Nacional / DAS a Recolher
        valor: vDAS,
        historicoId: 3,
        complementoHistorico: `Provisão Guia DAS Simples Nacional Comp. ${competencia}`
      });
      partidas++;
      totalGeral += vDAS;
    } else {
      if (ap.detalhamentoImpostos) {
        for (const [impostoNome, valor] of Object.entries(ap.detalhamentoImpostos)) {
          if (valor > 0) {
            this.addLancamento({
              empresaId,
              numeroPartida: this.lancamentos.length + 1,
              loteId,
              dataLancamento: `${competencia}-28`,
              tipoPartida: 'SIMPLES',
              contaDebitoId: 45,
              contaCreditoId: 29,
              valor: Math.round(valor * 100) / 100,
              historicoId: 3,
              complementoHistorico: `Provisão de ${impostoNome} Comp. ${competencia}`
            });
            partidas++;
            totalGeral += valor;
          }
        }
      }
    }

    lote.totalDebito = totalGeral;
    lote.totalCredito = totalGeral;
    this.lotes.push(lote);

    ap.integradaContabil = true;
    this.saveApuracaoFiscal(ap);

    this.persistSnapshot();
    this.registrarAuditoria('INTEGRAÇÃO_FISCAL', 'PROCESSAMENTO', `Integração contábil da apuração de tributos de ${competencia} gerou o Lote nº ${lote.numero} com ${partidas} partidas.`);

    return {
      success: true,
      partidasGeradas: partidas,
      loteId,
      totalImposto: totalGeral
    };
  }

  // --------------------------------------------------------------------------
  // MÓDULO FOLHA DE PAGAMENTO (FO)
  // --------------------------------------------------------------------------
  public getColaboradores(empresaId?: number): Colaborador[] {
    const empId = empresaId || this.activeEmpresaId;
    return this.colaboradores.filter(c => c.empresaId === empId);
  }
  public saveColaborador(c: Colaborador) {
    const idx = this.colaboradores.findIndex(item => item.id === c.id);
    if (idx >= 0) this.colaboradores[idx] = c;
    else { c.id = Date.now(); this.colaboradores.push(c); }
    this.persistSnapshot();
  }
  public deleteColaborador(id: number) {
    this.colaboradores = this.colaboradores.filter(c => c.id !== id);
    this.persistSnapshot();
  }

  public getRubricasFolha(empresaId?: number): RubricaFolha[] {
    const empId = empresaId || this.activeEmpresaId;
    return this.rubricasFolha.filter(r => !r.empresaId || r.empresaId === empId);
  }
  public getRubricas(empresaId?: number): RubricaFolha[] {
    return this.getRubricasFolha(empresaId);
  }
  public saveRubricaFolha(r: RubricaFolha) {
    const idx = this.rubricasFolha.findIndex(item => item.id === r.id);
    if (idx >= 0) this.rubricasFolha[idx] = r;
    else { r.id = Date.now(); this.rubricasFolha.push(r); }
    this.persistSnapshot();
  }
  public saveRubrica(r: RubricaFolha) {
    this.saveRubricaFolha(r);
  }
  public deleteRubrica(id: number) {
    this.rubricasFolha = this.rubricasFolha.filter(r => r.id !== id);
    this.persistSnapshot();
  }

  public getFolhasMensais(empresaId?: number): FolhaMensal[] {
    const empId = empresaId || this.activeEmpresaId;
    return this.folhasMensais.filter(f => f.empresaId === empId);
  }
  public getFolhasCalculadas(empresaId?: number, competencia?: string): FolhaMensal[] {
    const empId = empresaId || this.activeEmpresaId;
    if (competencia) {
      return this.folhasMensais.filter(f => f.empresaId === empId && f.competencia === competencia);
    }
    return this.folhasMensais.filter(f => f.empresaId === empId);
  }
  public saveFolhaMensal(folha: FolhaMensal) {
    const idx = this.folhasMensais.findIndex(item => item.id === folha.id);
    if (idx >= 0) this.folhasMensais[idx] = folha;
    else { folha.id = Date.now(); this.folhasMensais.push(folha); }
    this.persistSnapshot();
  }

  // Integração Automática: Folha de Pagamento -> Contabilidade
  public gerarIntegracaoFolhaContabil(arg1: number | string, arg2?: string | number): {
    success: boolean;
    partidasGeradas: number;
    count: number;
    loteId: number;
    lote: LoteContabil;
    totalBruto: number;
  } {
    let empId = this.activeEmpresaId;
    let competencia = new Date().toISOString().slice(0, 7);

    if (typeof arg1 === 'number') {
      empId = arg1;
      if (typeof arg2 === 'string') competencia = arg2;
    } else if (typeof arg1 === 'string') {
      competencia = arg1;
      if (typeof arg2 === 'number') empId = arg2;
    }

    const folha = this.folhasMensais.find(f => f.empresaId === empId && f.competencia === competencia);

    const proximoNumLote = this.lotes.reduce((m, l) => Math.max(m, l.numero), 0) + 1;
    const lote: LoteContabil = {
      id: Date.now(),
      empresaId: empId,
      numero: proximoNumLote,
      numeroLote: proximoNumLote,
      descricao: `Lote de Integração Folha de Pagamento - Comp. ${competencia}`,
      dataLote: `${competencia}-30`,
      status: 'FECHADO',
      totalDebito: 0,
      totalCredito: 0
    };

    if (!folha) {
      return { success: false, partidasGeradas: 0, count: 0, loteId: 0, lote, totalBruto: 0 };
    }

    let totalD = 0;
    let totalC = 0;
    let partidas = 0;

    const totalBruto = folha.totalBruto ?? folha.totalProventos ?? 0;
    const totalINSS = folha.totalINSSSegurados ?? folha.inssSegurado ?? 0;
    const totalFGTS = folha.totalFGTS ?? folha.fgts ?? 0;

    // 1. Apropriação de Salários e Pró-Labore Brutos
    // D: 56 (Despesas com Salários), C: 26 (Salários e Ordenados a Pagar)
    if (totalBruto > 0) {
      this.addLancamento({
        empresaId: empId,
        numeroPartida: this.lancamentos.length + 1,
        loteId: lote.id,
        dataLancamento: `${competencia}-30`,
        tipoPartida: 'SIMPLES',
        contaDebitoId: 56,
        contaCreditoId: 26,
        valor: totalBruto,
        historicoId: 3,
        complementoHistorico: `Apropriação da Folha Salarial e Pró-Labore ref. ${competencia}`,
        usuarioNome: 'Integração DP'
      });
      totalD += totalBruto;
      totalC += totalBruto;
      partidas++;
    }

    // 2. Retenção de INSS dos Segurados
    // D: 26 (Salários a Pagar), C: 27 (INSS a Recolher)
    if (totalINSS > 0) {
      this.addLancamento({
        empresaId: empId,
        numeroPartida: this.lancamentos.length + 1,
        loteId: lote.id,
        dataLancamento: `${competencia}-30`,
        tipoPartida: 'SIMPLES',
        contaDebitoId: 26,
        contaCreditoId: 27,
        valor: totalINSS,
        historicoId: 3,
        complementoHistorico: `Retenção de INSS Segurados sobre Folha ref. ${competencia}`,
        usuarioNome: 'Integração DP'
      });
      totalD += totalINSS;
      totalC += totalINSS;
      partidas++;
    }

    // 3. Encargos de FGTS da Empresa
    // D: 56 (Despesas com Pessoal - FGTS), C: 28 (FGTS a Recolher)
    if (totalFGTS > 0) {
      this.addLancamento({
        empresaId: empId,
        numeroPartida: this.lancamentos.length + 1,
        loteId: lote.id,
        dataLancamento: `${competencia}-30`,
        tipoPartida: 'SIMPLES',
        contaDebitoId: 56,
        contaCreditoId: 28,
        valor: totalFGTS,
        historicoId: 3,
        complementoHistorico: `Provisão de FGTS s/ Folha de Pagamento ref. ${competencia}`,
        usuarioNome: 'Integração DP'
      });
      totalD += totalFGTS;
      totalC += totalFGTS;
      partidas++;
    }

    lote.totalDebito = totalD;
    lote.totalCredito = totalC;
    this.lotes.push(lote);

    folha.integradaContabil = true;
    this.persistSnapshot();
    this.registrarAuditoria('INTEGRAÇÃO_FOLHA', 'PROCESSAMENTO', `Integração da folha ${competencia} concluída com ${partidas} lançamentos no Lote nº ${lote.numero}.`);

    return {
      success: true,
      partidasGeradas: partidas,
      count: partidas,
      loteId: lote.id,
      lote,
      totalBruto
    };
  }

  // --------------------------------------------------------------------------
  // PROVISÕES MENSAIS DE FÉRIAS E 13º SALÁRIO (CLT / CFC)
  // --------------------------------------------------------------------------
  public calcularProvisoesMensais(empresaId?: number, competencia?: string): ProvisaoColaborador[] {
    const empId = empresaId || this.activeEmpresaId;
    const comp = competencia || this.getActiveEmpresa().competenciaAtiva;
    const colabs = this.getColaboradores(empId).filter(c => c.status === 'ATIVO');

    return colabs.map(colab => {
      const sal = colab.salarioBase || 0;
      const isCLT = colab.tipoVinculo === 'CLT';

      // 1/12 avos de férias e 1/3 constitucional
      const provFerias = isCLT ? Math.round((sal / 12) * 100) / 100 : 0;
      const provTerco = isCLT ? Math.round((provFerias / 3) * 100) / 100 : 0;

      // 1/12 avos de 13º salário
      const prov13 = isCLT ? Math.round((sal / 12) * 100) / 100 : 0;

      // Encargos Sociais s/ Provisões: CPP 20% + FGTS 8%
      const baseEncargos = provFerias + provTerco + prov13;
      const inssPatronal = isCLT ? Math.round((baseEncargos * 0.20) * 100) / 100 : 0;
      const fgts = isCLT ? Math.round((baseEncargos * 0.08) * 100) / 100 : 0;

      const totalMes = provFerias + provTerco + prov13 + inssPatronal + fgts;

      return {
        id: colab.id,
        empresaId: empId,
        colaboradorId: colab.id,
        colaboradorNome: colab.nome,
        matricula: colab.matricula,
        competencia: comp,
        salarioBase: sal,
        provisaoFerias: provFerias,
        provisaoTercoConstitucional: provTerco,
        provisaoDecimoTerceiro: prov13,
        encargosINSSPatronal: inssPatronal,
        encargosFGTS: fgts,
        totalProvisaoMes: totalMes
      };
    });
  }

  public integrarProvisoesContabil(empresaId: number, competencia: string): {
    success: boolean;
    partidasGeradas: number;
    loteId: number;
    totalProvisao: number;
  } {
    const provisoes = this.calcularProvisoesMensais(empresaId, competencia);
    const elegiveis = provisoes.filter(p => p.totalProvisaoMes > 0);

    if (elegiveis.length === 0) {
      return { success: false, partidasGeradas: 0, loteId: 0, totalProvisao: 0 };
    }

    const proximoNumLote = this.lotes.reduce((m, l) => Math.max(m, l.numero), 0) + 1;
    const loteId = Date.now();
    const lote: LoteContabil = {
      id: loteId,
      empresaId,
      numero: proximoNumLote,
      numeroLote: proximoNumLote,
      descricao: `Lote de Provisão Mensal de Férias e 13º Salário - Comp. ${competencia}`,
      dataLote: `${competencia}-28`,
      status: 'FECHADO',
      totalDebito: 0,
      totalCredito: 0
    };

    let totalGeral = 0;
    let partidas = 0;

    for (const p of elegiveis) {
      // 1. Provisão de Férias (+ 1/3): D: 56 (Despesas com Provisão Férias), C: 26 (Provisão Férias a Pagar)
      const totalFeriasTerco = p.provisaoFerias + p.provisaoTercoConstitucional;
      if (totalFeriasTerco > 0) {
        this.addLancamento({
          empresaId,
          numeroPartida: this.lancamentos.length + 1,
          loteId,
          dataLancamento: `${competencia}-28`,
          tipoPartida: 'SIMPLES',
          contaDebitoId: 56,
          contaCreditoId: 26,
          valor: totalFeriasTerco,
          historicoId: 3,
          complementoHistorico: `Provisão de 1/12 avos de Férias (+1/3) ref. ${competencia} - ${p.colaboradorNome}`,
          usuarioNome: 'Módulo Folha'
        });
        totalGeral += totalFeriasTerco;
        partidas++;
      }

      // 2. Provisão de 13º Salário: D: 56 (Despesas com Provisão 13º), C: 26 (Provisão 13º a Pagar)
      if (p.provisaoDecimoTerceiro > 0) {
        this.addLancamento({
          empresaId,
          numeroPartida: this.lancamentos.length + 1,
          loteId,
          dataLancamento: `${competencia}-28`,
          tipoPartida: 'SIMPLES',
          contaDebitoId: 56,
          contaCreditoId: 26,
          valor: p.provisaoDecimoTerceiro,
          historicoId: 3,
          complementoHistorico: `Provisão de 1/12 avos de 13º Salário ref. ${competencia} - ${p.colaboradorNome}`,
          usuarioNome: 'Módulo Folha'
        });
        totalGeral += p.provisaoDecimoTerceiro;
        partidas++;
      }

      // 3. Encargos Sociais s/ Provisões: D: 56 (Despesa Encargos), C: 27 (Encargos Sociais s/ Provisões)
      const totalEncargos = p.encargosINSSPatronal + p.encargosFGTS;
      if (totalEncargos > 0) {
        this.addLancamento({
          empresaId,
          numeroPartida: this.lancamentos.length + 1,
          loteId,
          dataLancamento: `${competencia}-28`,
          tipoPartida: 'SIMPLES',
          contaDebitoId: 56,
          contaCreditoId: 27,
          valor: totalEncargos,
          historicoId: 3,
          complementoHistorico: `Encargos Sociais Patronais s/ Provisões ref. ${competencia} - ${p.colaboradorNome}`,
          usuarioNome: 'Módulo Folha'
        });
        totalGeral += totalEncargos;
        partidas++;
      }
    }

    lote.totalDebito = Math.round(totalGeral * 100) / 100;
    lote.totalCredito = Math.round(totalGeral * 100) / 100;
    this.lotes.push(lote);

    this.persistSnapshot();
    this.registrarAuditoria('INTEGRAÇÃO_PROVISÕES', 'PROCESSAMENTO', `Provisões mensais de ${competencia} integradas à contabilidade: ${partidas} lançamentos no lote nº ${lote.numero}, total R$ ${totalGeral.toFixed(2)}.`);

    return {
      success: true,
      partidasGeradas: partidas,
      loteId,
      totalProvisao: totalGeral
    };
  }

  // --------------------------------------------------------------------------
  // CÁLCULO E GESTÃO DE FÉRIAS (CLT / ART. 129 A 145)
  // --------------------------------------------------------------------------
  public getCalculosFerias(empresaId?: number): CalculoFerias[] {
    const empId = empresaId || this.activeEmpresaId;
    return this.calculosFerias.filter(f => f.empresaId === empId);
  }

  public salvarCalculoFerias(f: CalculoFerias): void {
    const idx = this.calculosFerias.findIndex(item => item.id === f.id);
    if (idx >= 0) {
      this.calculosFerias[idx] = f;
    } else {
      if (!f.id) f.id = Date.now();
      this.calculosFerias.unshift(f);
    }
    this.persistSnapshot();
    this.registrarAuditoria('FÉRIAS', 'GRAVAÇÃO', `Cálculo de férias do colaborador ${f.colaboradorNome} salvo com sucesso. Líquido: R$ ${f.valorLiquidoReceber.toFixed(2)}.`);
  }

  public deleteCalculoFerias(id: number): void {
    this.calculosFerias = this.calculosFerias.filter(f => f.id !== id);
    this.persistSnapshot();
  }

  public calcularFeriasColaborador(params: {
    empresaId: number;
    colaboradorId: number;
    periodoAquisitivoInicio: string;
    periodoAquisitivoFim: string;
    dataInicioGozo: string;
    diasGozo: number;
    abonoPecuniario: boolean;
    diasAbono: number;
    adiantarDecimoTerceiro: boolean;
  }): CalculoFerias {
    const colab = this.getColaboradores(params.empresaId).find(c => c.id === params.colaboradorId);
    if (!colab) throw new Error('Colaborador não encontrado.');

    const sal = colab.salarioBase || 0;
    const diasG = params.diasGozo || 30;
    const diasAb = params.abonoPecuniario ? (params.diasAbono || 10) : 0;

    // 1. Proventos
    const valorDiasFerias = Math.round(((sal / 30) * diasG) * 100) / 100;
    const valorTerco = Math.round((valorDiasFerias / 3) * 100) / 100;
    const valorAbono = diasAb > 0 ? Math.round(((sal / 30) * diasAb) * 100) / 100 : 0;
    const valorTercoAb = diasAb > 0 ? Math.round((valorAbono / 3) * 100) / 100 : 0;
    const valorAdiant13 = params.adiantarDecimoTerceiro ? Math.round((sal * 0.5) * 100) / 100 : 0;
    const totalProventos = valorDiasFerias + valorTerco + valorAbono + valorTercoAb + valorAdiant13;

    // 2. Base e Desconto INSS (Abono pecuniário e 1/3 abono são isentos de INSS)
    const baseINSS = valorDiasFerias + valorTerco;
    let valorINSS = 0;
    if (colab.tipoVinculo === 'CLT') {
      if (baseINSS <= 1518.00) valorINSS = Math.round((baseINSS * 0.075) * 100) / 100;
      else if (baseINSS <= 2793.88) valorINSS = Math.round((baseINSS * 0.09 - 22.77) * 100) / 100;
      else if (baseINSS <= 4190.83) valorINSS = Math.round((baseINSS * 0.12 - 106.59) * 100) / 100;
      else if (baseINSS <= 8157.41) valorINSS = Math.round((baseINSS * 0.14 - 190.40) * 100) / 100;
      else valorINSS = 951.63;
    }

    // 3. Base e Desconto IRRF (Tributação Exclusiva em Férias - Não soma com o mês)
    const depIRRF = colab.dependentesIRRF || 0;
    const deducaoDependentes = depIRRF * 189.59;
    const baseIRRF = Math.max(0, baseINSS - valorINSS - deducaoDependentes);
    let valorIRRF = 0;
    if (baseIRRF > 2259.20) {
      if (baseIRRF <= 2826.65) valorIRRF = Math.round((baseIRRF * 0.075 - 169.44) * 100) / 100;
      else if (baseIRRF <= 3751.05) valorIRRF = Math.round((baseIRRF * 0.15 - 381.44) * 100) / 100;
      else if (baseIRRF <= 4664.68) valorIRRF = Math.round((baseIRRF * 0.225 - 662.77) * 100) / 100;
      else valorIRRF = Math.round((baseIRRF * 0.275 - 896.00) * 100) / 100;
    }

    const totalDescontos = valorINSS + valorIRRF;
    const liquido = Math.round((totalProventos - totalDescontos) * 100) / 100;

    // Data fim do gozo
    const dtGozo = new Date(params.dataInicioGozo);
    const dtFim = new Date(dtGozo);
    dtFim.setDate(dtFim.getDate() + diasG - 1);
    const dataFimStr = dtFim.toISOString().split('T')[0];

    // Data de pagamento: 2 dias antes do início do gozo (Art. 145 CLT)
    const dtPagto = new Date(dtGozo);
    dtPagto.setDate(dtPagto.getDate() - 2);
    const dataPagtoStr = dtPagto.toISOString().split('T')[0];

    return {
      id: Date.now(),
      empresaId: params.empresaId,
      colaboradorId: colab.id,
      colaboradorNome: colab.nome,
      matricula: colab.matricula,
      cargo: colab.cargo || 'Colaborador',
      salarioBase: sal,
      periodoAquisitivoInicio: params.periodoAquisitivoInicio,
      periodoAquisitivoFim: params.periodoAquisitivoFim,
      dataInicioGozo: params.dataInicioGozo,
      diasGozo: diasG,
      dataFimGozo: dataFimStr,
      abonoPecuniario: params.abonoPecuniario,
      diasAbono: diasAb,
      adiantarDecimoTerceiro: params.adiantarDecimoTerceiro,
      valorDiasFerias,
      valorTercoConstitucional: valorTerco,
      valorAbonoPecuniario: valorAbono,
      valorTercoAbono: valorTercoAb,
      valorAdiantamento13: valorAdiant13,
      valorTotalProventos: totalProventos,
      baseCalculoINSS: baseINSS,
      valorINSS,
      baseCalculoIRRF: baseIRRF,
      valorIRRF,
      valorTotalDescontos: totalDescontos,
      valorLiquidoReceber: liquido,
      dataPagamento: dataPagtoStr,
      status: 'CALCULADO',
      integradaContabil: false
    };
  }

  public integrarFeriasContabil(feriasId: number): { success: boolean; loteId: number } {
    const ferias = this.calculosFerias.find(f => f.id === feriasId);
    if (!ferias) return { success: false, loteId: 0 };

    const proximoNumLote = this.lotes.reduce((m, l) => Math.max(m, l.numero), 0) + 1;
    const loteId = Date.now();
    const lote: LoteContabil = {
      id: loteId,
      empresaId: ferias.empresaId,
      numero: proximoNumLote,
      numeroLote: proximoNumLote,
      descricao: `Lote de Quitação de Férias - ${ferias.colaboradorNome} (${ferias.diasGozo} dias)`,
      dataLote: ferias.dataPagamento,
      status: 'FECHADO',
      totalDebito: ferias.valorTotalProventos,
      totalCredito: ferias.valorTotalProventos
    };

    // 1. D: 26 - Provisão de Férias a Pagar (baixa da provisão constituída)
    // C: 21 - Salários e Férias a Pagar (valor líquido a pagar ao funcionário)
    this.addLancamento({
      empresaId: ferias.empresaId,
      numeroPartida: this.lancamentos.length + 1,
      loteId,
      dataLancamento: ferias.dataPagamento,
      tipoPartida: 'SIMPLES',
      contaDebitoId: 26,
      contaCreditoId: 21,
      valor: ferias.valorLiquidoReceber,
      historicoId: 3,
      complementoHistorico: `Quitação líquida de férias gozo ${ferias.dataInicioGozo} a ${ferias.dataFimGozo} - ${ferias.colaboradorNome}`,
      usuarioNome: 'Módulo Folha'
    });

    // 2. Retenção de INSS s/ Férias: C: 22 (INSS a Recolher)
    if (ferias.valorINSS > 0) {
      this.addLancamento({
        empresaId: ferias.empresaId,
        numeroPartida: this.lancamentos.length + 1,
        loteId,
        dataLancamento: ferias.dataPagamento,
        tipoPartida: 'SIMPLES',
        contaDebitoId: 26,
        contaCreditoId: 22,
        valor: ferias.valorINSS,
        historicoId: 3,
        complementoHistorico: `INSS retido sobre férias - ${ferias.colaboradorNome}`,
        usuarioNome: 'Módulo Folha'
      });
    }

    // 3. Retenção de IRRF s/ Férias: C: 23 (IRRF a Recolher)
    if (ferias.valorIRRF > 0) {
      this.addLancamento({
        empresaId: ferias.empresaId,
        numeroPartida: this.lancamentos.length + 1,
        loteId,
        dataLancamento: ferias.dataPagamento,
        tipoPartida: 'SIMPLES',
        contaDebitoId: 26,
        contaCreditoId: 23,
        valor: ferias.valorIRRF,
        historicoId: 3,
        complementoHistorico: `IRRF retido na fonte sobre férias - ${ferias.colaboradorNome}`,
        usuarioNome: 'Módulo Folha'
      });
    }

    this.lotes.push(lote);
    ferias.integradaContabil = true;
    ferias.status = 'PAGO';
    this.persistSnapshot();
    this.registrarAuditoria('INTEGRAÇÃO_FÉRIAS', 'PROCESSAMENTO', `Férias do colaborador ${ferias.colaboradorNome} integradas no lote nº ${lote.numero}.`);

    return { success: true, loteId };
  }

  // --------------------------------------------------------------------------
  // CÁLCULO E GESTÃO DE 13º SALÁRIO (1ª E 2ª PARCELA)
  // --------------------------------------------------------------------------
  public getCalculosDecimoTerceiro(empresaId?: number, ano?: number): CalculoDecimoTerceiro[] {
    const empId = empresaId || this.activeEmpresaId;
    return this.calculosDecimoTerceiro.filter(d => d.empresaId === empId && (!ano || d.ano === ano));
  }

  public salvarCalculoDecimoTerceiro(d: CalculoDecimoTerceiro): void {
    const idx = this.calculosDecimoTerceiro.findIndex(item => item.id === d.id);
    if (idx >= 0) {
      this.calculosDecimoTerceiro[idx] = d;
    } else {
      if (!d.id) d.id = Date.now();
      this.calculosDecimoTerceiro.unshift(d);
    }
    this.persistSnapshot();
  }

  public calcularDecimoTerceiro(empresaId: number, ano: number, parcela: 'PRIMEIRA' | 'SEGUNDA'): CalculoDecimoTerceiro[] {
    const colabs = this.getColaboradores(empresaId).filter(c => c.status === 'ATIVO' && c.tipoVinculo === 'CLT');
    const resultados: CalculoDecimoTerceiro[] = [];

    for (const colab of colabs) {
      const sal = colab.salarioBase || 0;

      // Cálculo de avos no ano
      let mesesAvos = 12;
      if (colab.dataAdmissao) {
        const dtAdm = new Date(colab.dataAdmissao);
        if (dtAdm.getFullYear() === ano) {
          const mesAdm = dtAdm.getMonth() + 1;
          const diaAdm = dtAdm.getDate();
          mesesAvos = 12 - mesAdm + 1;
          if (diaAdm > 14) mesesAvos -= 1; // Art. 1º § 2º Lei 4.090/62 (mais de 14 dias)
        }
      }
      mesesAvos = Math.max(1, Math.min(12, mesesAvos));

      const valorIntegral = Math.round(((sal / 12) * mesesAvos) * 100) / 100;

      if (parcela === 'PRIMEIRA') {
        const valorBruto = Math.round((valorIntegral * 0.5) * 100) / 100;
        const fgts = Math.round((valorBruto * 0.08) * 100) / 100;

        const calc: CalculoDecimoTerceiro = {
          id: Date.now() + colab.id,
          empresaId,
          colaboradorId: colab.id,
          colaboradorNome: colab.nome,
          matricula: colab.matricula,
          cargo: colab.cargo || 'Colaborador',
          salarioBase: sal,
          competencia: `${ano}-11`,
          ano,
          parcela: 'PRIMEIRA',
          mesesTrabalhadosAvos: mesesAvos,
          valorIntegral,
          valorBrutoParcela: valorBruto,
          valorAdiantamentoDeduzido: 0,
          baseINSS: 0,
          valorINSS: 0,
          baseIRRF: 0,
          valorIRRF: 0,
          baseFGTS: valorBruto,
          valorFGTS: fgts,
          valorLiquidoParcela: valorBruto,
          dataPagamento: `${ano}-11-30`,
          status: 'CALCULADO',
          integradaContabil: false
        };
        resultados.push(calc);
        this.salvarCalculoDecimoTerceiro(calc);
      } else {
        // Segunda parcela: valor integral menos adiantamento, com INSS e IRRF
        const adiantamentoExistente = this.calculosDecimoTerceiro.find(d =>
          d.empresaId === empresaId && d.colaboradorId === colab.id && d.ano === ano && d.parcela === 'PRIMEIRA'
        );
        const valorAdiantado = adiantamentoExistente ? adiantamentoExistente.valorBrutoParcela : Math.round((valorIntegral * 0.5) * 100) / 100;

        // INSS sobre valor total do 13º
        let valorINSS = 0;
        if (valorIntegral <= 1518.00) valorINSS = Math.round((valorIntegral * 0.075) * 100) / 100;
        else if (valorIntegral <= 2793.88) valorINSS = Math.round((valorIntegral * 0.09 - 22.77) * 100) / 100;
        else if (valorIntegral <= 4190.83) valorINSS = Math.round((valorIntegral * 0.12 - 106.59) * 100) / 100;
        else if (valorIntegral <= 8157.41) valorINSS = Math.round((valorIntegral * 0.14 - 190.40) * 100) / 100;
        else valorINSS = 951.63;

        // IRRF sobre valor total do 13º
        const depIRRF = colab.dependentesIRRF || 0;
        const deducaoDep = depIRRF * 189.59;
        const baseIRRF = Math.max(0, valorIntegral - valorINSS - deducaoDep);
        let valorIRRF = 0;
        if (baseIRRF > 2259.20) {
          if (baseIRRF <= 2826.65) valorIRRF = Math.round((baseIRRF * 0.075 - 169.44) * 100) / 100;
          else if (baseIRRF <= 3751.05) valorIRRF = Math.round((baseIRRF * 0.15 - 381.44) * 100) / 100;
          else if (baseIRRF <= 4664.68) valorIRRF = Math.round((baseIRRF * 0.225 - 662.77) * 100) / 100;
          else valorIRRF = Math.round((baseIRRF * 0.275 - 896.00) * 100) / 100;
        }

        const saldoLiquido = Math.max(0, Math.round((valorIntegral - valorAdiantado - valorINSS - valorIRRF) * 100) / 100);
        const baseFGTS = Math.max(0, valorIntegral - valorAdiantado);
        const fgts = Math.round((baseFGTS * 0.08) * 100) / 100;

        const calc: CalculoDecimoTerceiro = {
          id: Date.now() + colab.id,
          empresaId,
          colaboradorId: colab.id,
          colaboradorNome: colab.nome,
          matricula: colab.matricula,
          cargo: colab.cargo || 'Colaborador',
          salarioBase: sal,
          competencia: `${ano}-12`,
          ano,
          parcela: 'SEGUNDA',
          mesesTrabalhadosAvos: mesesAvos,
          valorIntegral,
          valorBrutoParcela: valorIntegral,
          valorAdiantamentoDeduzido: valorAdiantado,
          baseINSS: valorIntegral,
          valorINSS,
          baseIRRF,
          valorIRRF,
          baseFGTS,
          valorFGTS: fgts,
          valorLiquidoParcela: saldoLiquido,
          dataPagamento: `${ano}-12-20`,
          status: 'CALCULADO',
          integradaContabil: false
        };
        resultados.push(calc);
        this.salvarCalculoDecimoTerceiro(calc);
      }
    }

    this.registrarAuditoria('13º_SALÁRIO', 'PROCESSAMENTO', `Cálculo da ${parcela} parcela do 13º salário ano ${ano} processado para ${resultados.length} colaboradores.`);
    return resultados;
  }

  public integrarDecimoTerceiroContabil(empresaId: number, ano: number, parcela: 'PRIMEIRA' | 'SEGUNDA'): {
    success: boolean;
    loteId: number;
    totalValor: number;
  } {
    const calculos = this.calculosDecimoTerceiro.filter(d => d.empresaId === empresaId && d.ano === ano && d.parcela === parcela && !d.integradaContabil);
    if (calculos.length === 0) return { success: false, loteId: 0, totalValor: 0 };

    const proximoNumLote = this.lotes.reduce((m, l) => Math.max(m, l.numero), 0) + 1;
    const loteId = Date.now();
    const dataLote = parcela === 'PRIMEIRA' ? `${ano}-11-30` : `${ano}-12-20`;
    let totalLote = 0;

    const lote: LoteContabil = {
      id: loteId,
      empresaId,
      numero: proximoNumLote,
      numeroLote: proximoNumLote,
      descricao: `Lote de Quitação do 13º Salário (${parcela === 'PRIMEIRA' ? '1ª Parcela Adiantamento' : '2ª Parcela Quitação'}) - Exercício ${ano}`,
      dataLote,
      status: 'FECHADO',
      totalDebito: 0,
      totalCredito: 0
    };

    for (const d of calculos) {
      if (parcela === 'PRIMEIRA') {
        // D: 27 - Provisão 13º Salário a Pagar / C: 21 - Salários e 13º a Pagar
        this.addLancamento({
          empresaId,
          numeroPartida: this.lancamentos.length + 1,
          loteId,
          dataLancamento: dataLote,
          tipoPartida: 'SIMPLES',
          contaDebitoId: 27,
          contaCreditoId: 21,
          valor: d.valorLiquidoParcela,
          historicoId: 3,
          complementoHistorico: `Adiantamento 50% de 13º Salário - ${d.colaboradorNome}`,
          usuarioNome: 'Módulo Folha'
        });
        totalLote += d.valorLiquidoParcela;
      } else {
        // Segunda Parcela: Quitação do valor líquido restante + retenções
        this.addLancamento({
          empresaId,
          numeroPartida: this.lancamentos.length + 1,
          loteId,
          dataLancamento: dataLote,
          tipoPartida: 'SIMPLES',
          contaDebitoId: 27,
          contaCreditoId: 21,
          valor: d.valorLiquidoParcela,
          historicoId: 3,
          complementoHistorico: `Quitação final de 13º Salário - ${d.colaboradorNome}`,
          usuarioNome: 'Módulo Folha'
        });
        totalLote += d.valorLiquidoParcela;

        if (d.valorINSS > 0) {
          this.addLancamento({
            empresaId,
            numeroPartida: this.lancamentos.length + 1,
            loteId,
            dataLancamento: dataLote,
            tipoPartida: 'SIMPLES',
            contaDebitoId: 27,
            contaCreditoId: 22,
            valor: d.valorINSS,
            historicoId: 3,
            complementoHistorico: `INSS retido na fonte s/ 13º Salário integral - ${d.colaboradorNome}`,
            usuarioNome: 'Módulo Folha'
          });
          totalLote += d.valorINSS;
        }

        if (d.valorIRRF > 0) {
          this.addLancamento({
            empresaId,
            numeroPartida: this.lancamentos.length + 1,
            loteId,
            dataLancamento: dataLote,
            tipoPartida: 'SIMPLES',
            contaDebitoId: 27,
            contaCreditoId: 23,
            valor: d.valorIRRF,
            historicoId: 3,
            complementoHistorico: `IRRF retido na fonte s/ 13º Salário integral - ${d.colaboradorNome}`,
            usuarioNome: 'Módulo Folha'
          });
          totalLote += d.valorIRRF;
        }
      }
      d.integradaContabil = true;
      d.status = 'PAGO';
    }

    lote.totalDebito = Math.round(totalLote * 100) / 100;
    lote.totalCredito = Math.round(totalLote * 100) / 100;
    this.lotes.push(lote);
    this.persistSnapshot();
    this.registrarAuditoria('INTEGRAÇÃO_13', 'PROCESSAMENTO', `${parcela} parcela do 13º salário ${ano} integrada no lote nº ${lote.numero}, total R$ ${totalLote.toFixed(2)}.`);

    return { success: true, loteId, totalValor: totalLote };
  }

  // --------------------------------------------------------------------------
  // CÁLCULO E GESTÃO DE RESCISÃO CONTRATUAL (TRCT OFICIAL - PORTARIA 1.057/MTE)
  // --------------------------------------------------------------------------
  public getCalculosRescisao(empresaId?: number): CalculoRescisao[] {
    const empId = empresaId || this.activeEmpresaId;
    return this.calculosRescisao.filter(r => r.empresaId === empId);
  }

  public salvarCalculoRescisao(r: CalculoRescisao): void {
    const idx = this.calculosRescisao.findIndex(item => item.id === r.id);
    if (idx >= 0) {
      this.calculosRescisao[idx] = r;
    } else {
      if (!r.id) r.id = Date.now();
      this.calculosRescisao.unshift(r);
    }
    this.persistSnapshot();
    this.registrarAuditoria('RESCISÃO', 'GRAVAÇÃO', `Cálculo de rescisão (TRCT) do colaborador ${r.colaboradorNome} salvo. Líquido: R$ ${r.saldoLiquidoRescisao.toFixed(2)}.`);
  }

  public deleteCalculoRescisao(id: number): void {
    this.calculosRescisao = this.calculosRescisao.filter(r => r.id !== id);
    this.persistSnapshot();
  }

  public calcularRescisaoColaborador(params: {
    empresaId: number;
    colaboradorId: number;
    dataDemissao: string;
    motivoRescisao: 'SEM_JUSTA_CAUSA' | 'PEDIDO_DEMISSAO' | 'COM_JUSTA_CAUSA' | 'TERMINO_CONTRATO' | 'ACORDO_MUTUO';
    tipoAvisoPrevio: 'INDENIZADO' | 'TRABALHADO' | 'DISPENSADO' | 'DESCONTADO';
    temFeriasVencidas: boolean;
    saldoBaseFGTS: number;
  }): CalculoRescisao {
    const colab = this.getColaboradores(params.empresaId).find(c => c.id === params.colaboradorId);
    if (!colab) throw new Error('Colaborador não encontrado.');

    const sal = colab.salarioBase || 0;
    const dtDem = new Date(params.dataDemissao);
    const dtAdm = new Date(colab.dataAdmissao || `${dtDem.getFullYear() - 1}-01-01`);

    // Anos completos de serviço para a Lei 12.506/2011 (Aviso Prévio Proporcional)
    const diffTime = Math.abs(dtDem.getTime() - dtAdm.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const anosCompletos = Math.floor(diffDays / 365);
    const diasAvisoPrevio = Math.min(90, 30 + (anosCompletos * 3));

    // Dias trabalhados no mês do desligamento
    const diasTrabalhadosMes = dtDem.getDate();

    // 1. Saldo de Salário
    const saldoSalario = Math.round(((sal / 30) * diasTrabalhadosMes) * 100) / 100;

    // 2. Aviso Prévio Indenizado
    let avisoPrevioIndenizado = 0;
    let avisoPrevioDescontado = 0;
    if (params.motivoRescisao === 'SEM_JUSTA_CAUSA' && params.tipoAvisoPrevio === 'INDENIZADO') {
      avisoPrevioIndenizado = Math.round(((sal / 30) * diasAvisoPrevio) * 100) / 100;
    } else if (params.motivoRescisao === 'ACORDO_MUTUO' && params.tipoAvisoPrevio === 'INDENIZADO') {
      avisoPrevioIndenizado = Math.round((((sal / 30) * diasAvisoPrevio) * 0.5) * 100) / 100; // 50% pelo Art. 484-A
    } else if (params.motivoRescisao === 'PEDIDO_DEMISSAO' && params.tipoAvisoPrevio === 'DESCONTADO') {
      avisoPrevioDescontado = sal;
    }

    // 3. 13º Salário Proporcional e Indenizado
    const mesDemissao = dtDem.getMonth() + 1;
    let avos13 = mesDemissao;
    if (diasTrabalhadosMes < 15) avos13 -= 1;
    avos13 = Math.max(0, Math.min(12, avos13));

    let decimoTerceiroProporcional = 0;
    let decimoTerceiroIndenizado = 0;
    let avos13Indenizado = 0;

    if (params.motivoRescisao !== 'COM_JUSTA_CAUSA') {
      decimoTerceiroProporcional = Math.round(((sal / 12) * avos13) * 100) / 100;
      if (avisoPrevioIndenizado > 0) {
        // Projeção do aviso prévio projeta mais 1 avo de 13º se > 15 dias
        avos13Indenizado = Math.round(diasAvisoPrevio / 30);
        decimoTerceiroIndenizado = Math.round(((sal / 12) * avos13Indenizado) * 100) / 100;
      }
    }

    // 4. Férias Vencidas e Proporcionais
    let feriasVencidas = 0;
    let tercoVencidas = 0;
    if (params.temFeriasVencidas && params.motivoRescisao !== 'COM_JUSTA_CAUSA') {
      feriasVencidas = sal;
      tercoVencidas = Math.round((sal / 3) * 100) / 100;
    }

    let avosFerias = Math.max(1, Math.min(12, (diffDays % 365) / 30));
    avosFerias = Math.floor(avosFerias);
    let feriasProporcionais = 0;
    let tercoProporcionais = 0;
    let feriasIndenizadas = 0;
    let tercoIndenizadas = 0;
    let avosFeriasIndenizadas = 0;

    if (params.motivoRescisao !== 'COM_JUSTA_CAUSA') {
      feriasProporcionais = Math.round(((sal / 12) * avosFerias) * 100) / 100;
      tercoProporcionais = Math.round((feriasProporcionais / 3) * 100) / 100;

      if (avisoPrevioIndenizado > 0) {
        avosFeriasIndenizadas = Math.round(diasAvisoPrevio / 30);
        feriasIndenizadas = Math.round(((sal / 12) * avosFeriasIndenizadas) * 100) / 100;
        tercoIndenizadas = Math.round((feriasIndenizadas / 3) * 100) / 100;
      }
    }

    const totalBruto = saldoSalario + avisoPrevioIndenizado + decimoTerceiroProporcional + decimoTerceiroIndenizado +
      feriasVencidas + tercoVencidas + feriasProporcionais + tercoProporcionais +
      feriasIndenizadas + tercoIndenizadas;

    // 5. Deduções
    // INSS sobre Saldo de Salário
    let inssSaldo = 0;
    if (saldoSalario <= 1518.00) inssSaldo = Math.round((saldoSalario * 0.075) * 100) / 100;
    else if (saldoSalario <= 2793.88) inssSaldo = Math.round((saldoSalario * 0.09 - 22.77) * 100) / 100;
    else if (saldoSalario <= 4190.83) inssSaldo = Math.round((saldoSalario * 0.12 - 106.59) * 100) / 100;
    else inssSaldo = Math.min(951.63, Math.round((saldoSalario * 0.14 - 190.40) * 100) / 100);

    // INSS sobre 13º Salário Rescisório
    let inss13 = 0;
    if (decimoTerceiroProporcional > 0) {
      if (decimoTerceiroProporcional <= 1518.00) inss13 = Math.round((decimoTerceiroProporcional * 0.075) * 100) / 100;
      else inss13 = Math.round((decimoTerceiroProporcional * 0.09 - 22.77) * 100) / 100;
    }

    // IRRF
    const totalDeducoes = inssSaldo + inss13 + avisoPrevioDescontado;
    const liquidoRescisao = Math.max(0, Math.round((totalBruto - totalDeducoes) * 100) / 100);

    // Multa FGTS
    let percMulta = 0;
    let codSaque = '01';
    if (params.motivoRescisao === 'SEM_JUSTA_CAUSA') {
      percMulta = 0.40;
      codSaque = '01';
    } else if (params.motivoRescisao === 'ACORDO_MUTUO') {
      percMulta = 0.20;
      codSaque = '02';
    } else if (params.motivoRescisao === 'TERMINO_CONTRATO') {
      percMulta = 0.00;
      codSaque = '04';
    } else {
      percMulta = 0.00;
      codSaque = 'NÃO_LIBERADO';
    }
    const multaFGTS = Math.round((params.saldoBaseFGTS * percMulta) * 100) / 100;

    // Data de pagamento da rescisão: até 10 dias corridos após o término (Art. 477 § 6º CLT)
    const dtPag = new Date(dtDem);
    dtPag.setDate(dtPag.getDate() + 10);
    const dataPagtoStr = dtPag.toISOString().split('T')[0];

    return {
      id: Date.now(),
      empresaId: params.empresaId,
      colaboradorId: colab.id,
      colaboradorNome: colab.nome,
      matricula: colab.matricula,
      cargo: colab.cargo || 'Colaborador',
      cpf: colab.cpf,
      dataAdmissao: colab.dataAdmissao || '2025-01-01',
      dataDemissao: params.dataDemissao,
      salarioBase: sal,
      motivoRescisao: params.motivoRescisao,
      tipoAvisoPrevio: params.tipoAvisoPrevio,
      diasAvisoPrevio,
      diasTrabalhadosMes,
      avosDecimoTerceiro: avos13,
      avosDecimoIndenizado: avos13Indenizado,
      avosFeriasProporcionais: avosFerias,
      avosFeriasIndenizadas: avosFeriasIndenizadas,
      temFeriasVencidas: params.temFeriasVencidas,
      saldoSalario,
      avisoPrevioIndenizado,
      decimoTerceiroProporcional,
      decimoTerceiroIndenizado,
      feriasVencidas,
      tercoFeriasVencidas: tercoVencidas,
      feriasProporcionais,
      tercoFeriasProporcionais: tercoProporcionais,
      feriasIndenizadas,
      tercoFeriasIndenizadas: tercoIndenizadas,
      totalBrutoVerbas: totalBruto,
      inssSaldoSalario: inssSaldo,
      inssDecimoTerceiro: inss13,
      irrfSaldoSalario: 0,
      irrfDecimoTerceiro: 0,
      avisoPrevioDescontado,
      outrasDeducoes: 0,
      totalDeducoes,
      saldoLiquidoRescisao: liquidoRescisao,
      saldoBaseFGTS: params.saldoBaseFGTS,
      multaRescisoriaFGTS: multaFGTS,
      codigoSaqueFGTS: codSaque,
      dataPagamento: dataPagtoStr,
      status: 'CALCULADO',
      integradaContabil: false
    };
  }

  public integrarRescisaoContabil(rescisaoId: number): { success: boolean; loteId: number; totalLiquido: number } {
    const r = this.calculosRescisao.find(item => item.id === rescisaoId);
    if (!r) return { success: false, loteId: 0, totalLiquido: 0 };

    const proximoNumLote = this.lotes.reduce((m, l) => Math.max(m, l.numero), 0) + 1;
    const loteId = Date.now();
    const lote: LoteContabil = {
      id: loteId,
      empresaId: r.empresaId,
      numero: proximoNumLote,
      numeroLote: proximoNumLote,
      descricao: `Lote de Rescisão de Contrato (TRCT) - ${r.colaboradorNome}`,
      dataLote: r.dataPagamento,
      status: 'FECHADO',
      totalDebito: r.totalBrutoVerbas,
      totalCredito: r.totalBrutoVerbas
    };

    // 1. D: 56 (Despesas Rescisórias / Indenizações) -> C: 21 (Rescisões a Pagar)
    this.addLancamento({
      empresaId: r.empresaId,
      numeroPartida: this.lancamentos.length + 1,
      loteId,
      dataLancamento: r.dataPagamento,
      tipoPartida: 'SIMPLES',
      contaDebitoId: 56,
      contaCreditoId: 21,
      valor: r.saldoLiquidoRescisao,
      historicoId: 3,
      complementoHistorico: `Quitação líquida de rescisão contratual (TRCT) - ${r.colaboradorNome}`,
      usuarioNome: 'Módulo Folha'
    });

    // 2. Retenção de INSS
    const totalINSS = r.inssSaldoSalario + r.inssDecimoTerceiro;
    if (totalINSS > 0) {
      this.addLancamento({
        empresaId: r.empresaId,
        numeroPartida: this.lancamentos.length + 1,
        loteId,
        dataLancamento: r.dataPagamento,
        tipoPartida: 'SIMPLES',
        contaDebitoId: 56,
        contaCreditoId: 22,
        valor: totalINSS,
        historicoId: 3,
        complementoHistorico: `INSS retido na fonte em rescisão (TRCT) - ${r.colaboradorNome}`,
        usuarioNome: 'Módulo Folha'
      });
    }

    this.lotes.push(lote);
    r.integradaContabil = true;
    r.status = 'QUITADO';
    this.persistSnapshot();
    this.registrarAuditoria('INTEGRAÇÃO_RESCISÃO', 'PROCESSAMENTO', `Rescisão do colaborador ${r.colaboradorNome} integrada no lote nº ${lote.numero}.`);

    return { success: true, loteId, totalLiquido: r.saldoLiquidoRescisao };
  }

  // --------------------------------------------------------------------------
  // MÓDULO HONORÁRIOS CONTÁBEIS (HO) - REAJUSTE EM LOTE
  // --------------------------------------------------------------------------
  public reajustarContratosEmLote(params: ReajusteContratoLote): {
    success: boolean;
    contratosAtualizados: number;
    diferencaMRR: number;
  } {
    let count = 0;
    let mrrAnterior = 0;
    let mrrNovo = 0;

    for (const id of params.contratosIds) {
      const c = this.contratosHonorarios.find(item => item.id === id);
      if (c && c.ativo !== false) {
        const valAtual = c.valorMensalBase || c.valorMensal || 0;
        mrrAnterior += valAtual;

        const novoVal = Math.round(valAtual * (1 + params.percentual / 100) * 100) / 100;
        mrrNovo += novoVal;

        c.valorMensalBase = novoVal;
        c.valorMensal = novoVal;
        c.indexadorReajuste = params.indice;
        count++;
      }
    }

    const diferencaMRR = Math.round((mrrNovo - mrrAnterior) * 100) / 100;
    this.persistSnapshot();
    this.registrarAuditoria(
      'HONORÁRIOS',
      'REAJUSTE_LOTE',
      `Reajuste em lote concluído para ${count} contratos pelo índice ${params.indice} (${params.percentual}%). Aumento de MRR: R$ ${diferencaMRR.toFixed(2)}.`
    );

    return {
      success: true,
      contratosAtualizados: count,
      diferencaMRR
    };
  }

  // --------------------------------------------------------------------------
  // CONCILIAÇÃO BANCÁRIA: MEMORIZAR REGRA COM 1 CLIQUE (AUTO-LEARNING)
  // --------------------------------------------------------------------------
  public memorizarRegraConciliacao(
    empresaId: number,
    palavraChave: string,
    contaDebitoId: number,
    contaCreditoId: number,
    historicoId?: number,
    complemento?: string
  ): RegraConciliacao {
    const palavraClean = palavraChave.trim().toUpperCase();
    const jaExiste = this.regrasConciliacao.find(
      r => r.empresaId === empresaId && r.palavraChave.toUpperCase() === palavraClean
    );

    let regra: RegraConciliacao;
    if (jaExiste) {
      jaExiste.contaDebitoId = contaDebitoId;
      jaExiste.contaCreditoId = contaCreditoId;
      if (historicoId) jaExiste.historicoId = historicoId;
      if (complemento) jaExiste.complementoPadrao = complemento;
      regra = jaExiste;
    } else {
      regra = {
        id: Date.now(),
        empresaId,
        palavraChave: palavraClean,
        contaDebitoId,
        contaCreditoId,
        historicoId: historicoId || 1,
        complementoPadrao: complemento || palavraClean
      };
      this.regrasConciliacao.push(regra);
    }

    this.persistSnapshot();
    this.registrarAuditoria('CONCILIAÇÃO', 'MEMORIZAR_REGRA', `Regra De-Para memorizada para "${palavraClean}": D:${contaDebitoId} / C:${contaCreditoId}.`);
    return regra;
  }

  // --------------------------------------------------------------------------
  // MÓDULO HONORÁRIOS CONTÁBEIS (HO)
  // --------------------------------------------------------------------------
  public getContratosHonorarios(empresaId?: number): ContratoHonorario[] {
    if (empresaId) {
      return this.contratosHonorarios.filter(c => c.empresaId === empresaId);
    }
    return this.contratosHonorarios;
  }
  public saveContratoHonorario(c: ContratoHonorario) {
    const idx = this.contratosHonorarios.findIndex(item => item.id === c.id);
    if (idx >= 0) this.contratosHonorarios[idx] = c;
    else { c.id = Date.now(); this.contratosHonorarios.push(c); }
    this.persistSnapshot();
  }
  public deleteContratoHonorario(id: number) {
    this.contratosHonorarios = this.contratosHonorarios.filter(c => c.id !== id);
    this.persistSnapshot();
  }

  public getFaturasHonorarios(filtro?: number | string): FaturaHonorario[] {
    if (typeof filtro === 'string') {
      return this.faturasHonorarios.filter(f => f.competencia === filtro);
    }
    if (typeof filtro === 'number') {
      return this.faturasHonorarios.filter(f => f.empresaId === filtro);
    }
    return this.faturasHonorarios;
  }
  public saveFaturaHonorario(f: FaturaHonorario) {
    const idx = this.faturasHonorarios.findIndex(item => item.id === f.id);
    if (idx >= 0) this.faturasHonorarios[idx] = f;
    else { f.id = Date.now(); this.faturasHonorarios.unshift(f); }
    this.persistSnapshot();
  }
  public deleteFaturaHonorario(id: number) {
    this.faturasHonorarios = this.faturasHonorarios.filter(f => f.id !== id);
    this.persistSnapshot();
  }

  // Faturamento em Lote de todas as empresas com franquias automáticas e retenções na fonte
  public gerarFaturamentoMensalHonorarios(competencia: string): { success: boolean; faturasGeradas: number } {
    let count = 0;
    for (const contrato of this.contratosHonorarios.filter(c => c.ativo !== false && c.status !== 'CANCELADO')) {
      const jaExiste = this.faturasHonorarios.some(f => f.empresaId === contrato.empresaId && f.competencia === competencia);
      if (!jaExiste) {
        const valBase = contrato.valorMensalBase ?? contrato.valorMensal ?? 0;

        // Apuração Automática de Excedente de Folha
        const colabs = this.colaboradores.filter(c => c.empresaId === contrato.empresaId && c.status === 'ATIVO');
        const qtdColab = colabs.length;
        const franquiaColab = contrato.franquiaEmpregados || 0;
        const excedenteColabQtd = Math.max(0, qtdColab - franquiaColab);
        const valorExcedenteFolha = excedenteColabQtd * (contrato.valorExcedenteEmpregado || 0);

        // Apuração Automática de Excedente Fiscal (Notas Fiscais do Período)
        const notas = this.notasFiscais.filter(n => n.empresaId === contrato.empresaId && n.dataEmissao.startsWith(competencia));
        const qtdNotas = notas.length;
        const franquiaNotas = contrato.franquiaNotas || 0;
        const excedenteNotasQtd = Math.max(0, qtdNotas - franquiaNotas);
        const valorExcedenteFiscal = excedenteNotasQtd * (contrato.valorExcedenteNota || 0);

        const valorBrutoTotal = valBase + valorExcedenteFolha + valorExcedenteFiscal;

        // Retenções Tributárias na Fonte (Padrão RFB / Município)
        let valorIRRFRetido = 0;
        if (contrato.retencaoIRRF) {
          const irCalc = valorBrutoTotal * 0.015; // IRRF 1,5%
          if (irCalc >= 10.00) valorIRRFRetido = Math.round(irCalc * 100) / 100;
        }

        let valorCSRFRetido = 0;
        if (contrato.retencaoCSRF) {
          const csrfCalc = valorBrutoTotal * 0.0465; // CSRF 4,65% (PIS 0,65% + COFINS 3% + CSLL 1%)
          if (csrfCalc >= 10.00) valorCSRFRetido = Math.round(csrfCalc * 100) / 100;
        }

        let valorISSRetido = 0;
        if (contrato.aliquotaISS && contrato.aliquotaISS > 0) {
          valorISSRetido = Math.round((valorBrutoTotal * (contrato.aliquotaISS / 100)) * 100) / 100;
        }

        const valorLiquido = Math.max(0, valorBrutoTotal - valorIRRFRetido - valorCSRFRetido - valorISSRetido);

        const fatura: FaturaHonorario = {
          id: Date.now() + count,
          empresaId: contrato.empresaId,
          competencia,
          numeroFatura: `FAT-${competencia.replace('-', '')}-${String(contrato.empresaId).padStart(3, '0')}`,
          valorHonorarioBase: valBase,
          valorBase: valBase,
          qtdEmpregadosApurados: qtdColab,
          qtdNotasApuradas: qtdNotas,
          valorExcedenteFolha,
          valorExcedenteFiscal,
          valorServicosExtras: 0,
          servicosExtras: [],
          valorBrutoTotal,
          valorIRRFRetido,
          valorCSRFRetido,
          valorISSRetido,
          valorLiquidoFatura: valorLiquido,
          valorTotal: valorLiquido > 0 ? valorLiquido : valorBrutoTotal,
          dataVencimento: `${competencia}-${String(contrato.diaVencimento).padStart(2, '0')}`,
          status: 'PENDENTE'
        };
        this.faturasHonorarios.unshift(fatura);
        count++;
      }
    }
    this.persistSnapshot();
    this.registrarAuditoria('HONORÁRIOS', 'FATURAMENTO_LOTE', `Geração em lote de ${count} faturas de honorários para ${competencia} com apuração de excedentes de folha/fiscal.`);
    return { success: true, faturasGeradas: count };
  }


  // Integração de Honorários -> Contabilidade
  public gerarIntegracaoHonorariosContabil(arg1: number | string, arg2?: string | number): {
    success: boolean;
    partidasGeradas: number;
    count: number;
    loteId: number;
    lote: LoteContabil;
    totalRecebido: number;
  } {
    let empId = this.activeEmpresaId;
    let competencia = new Date().toISOString().slice(0, 7);

    if (typeof arg1 === 'number') {
      empId = arg1;
      if (typeof arg2 === 'string') competencia = arg2;
    } else if (typeof arg1 === 'string') {
      competencia = arg1;
      if (typeof arg2 === 'number') empId = arg2;
    }

    const faturasPagas = this.faturasHonorarios.filter(f => f.empresaId === empId && f.competencia === competencia && f.status === 'PAGO' && !f.integradaContabil);

    const proximoNumLote = this.lotes.reduce((m, l) => Math.max(m, l.numero), 0) + 1;
    const lote: LoteContabil = {
      id: Date.now(),
      empresaId: empId,
      numero: proximoNumLote,
      numeroLote: proximoNumLote,
      descricao: `Lote de Faturamento de Honorários - Comp. ${competencia}`,
      dataLote: `${competencia}-15`,
      status: 'FECHADO',
      totalDebito: 0,
      totalCredito: 0
    };

    if (faturasPagas.length === 0) {
      return { success: false, partidasGeradas: 0, count: 0, loteId: 0, lote, totalRecebido: 0 };
    }

    let total = 0;
    for (const fat of faturasPagas) {
      this.addLancamento({
        empresaId: empId,
        numeroPartida: this.lancamentos.length + 1,
        loteId: lote.id,
        dataLancamento: fat.dataPagamento || `${competencia}-15`,
        tipoPartida: 'SIMPLES',
        contaDebitoId: 6,
        contaCreditoId: 44,
        valor: fat.valorTotal,
        historicoId: 1,
        complementoHistorico: `Liquidação Fatura Honorários nº ${fat.numeroFatura || fat.id}`,
        usuarioNome: 'Integração Honorários'
      });
      total += fat.valorTotal;
      fat.integradaContabil = true;
    }

    lote.totalDebito = total;
    lote.totalCredito = total;
    this.lotes.push(lote);

    this.persistSnapshot();
    return {
      success: true,
      partidasGeradas: faturasPagas.length,
      count: faturasPagas.length,
      loteId: lote.id,
      lote,
      totalRecebido: total
    };
  }

  // --------------------------------------------------------------------------
  // CONCILIAÇÃO BANCÁRIA INTELIGENTE & AUTO-MAPPING
  // --------------------------------------------------------------------------
  public getRegrasConciliacao(empresaId?: number): RegraConciliacao[] {
    const empId = empresaId || this.activeEmpresaId;
    return this.regrasConciliacao.filter(r => r.empresaId === empId);
  }
  public saveRegraConciliacao(r: RegraConciliacao) {
    const idx = this.regrasConciliacao.findIndex(item => item.id === r.id);
    if (idx >= 0) this.regrasConciliacao[idx] = r;
    else { r.id = Date.now(); this.regrasConciliacao.push(r); }
    this.persistSnapshot();
  }
  public deleteRegraConciliacao(id: number) {
    this.regrasConciliacao = this.regrasConciliacao.filter(r => r.id !== id);
    this.persistSnapshot();
  }

  public autoClassificarExtrato(transacoes: ExtratoTransacao[], empresaId?: number, contaBancariaId?: number): ExtratoTransacao[] {
    const empId = empresaId || this.activeEmpresaId;
    const regras = this.getRegrasConciliacao(empId);

    return transacoes.map(t => {
      const texto = (t.historicoOriginal || '').toUpperCase();
      const regraEncontrada = regras.find(r => texto.includes(r.palavraChave.toUpperCase()));

      if (regraEncontrada) {
        return {
          ...t,
          contaDebitoId: regraEncontrada.contaDebitoId,
          contaCreditoId: regraEncontrada.contaCreditoId,
          historicoId: regraEncontrada.historicoId,
          complemento: regraEncontrada.complementoPadrao || t.historicoOriginal,
          classificado: true,
          status: 'CLASSIFICADO'
        };
      }

      if (contaBancariaId) {
        if (t.valor > 0) {
          // Entrada no banco
          return {
            ...t,
            contaDebitoId: contaBancariaId,
            status: t.contaCreditoId ? 'CLASSIFICADO' : 'PENDENTE',
            classificado: !!t.contaCreditoId
          };
        } else {
          // Saída do banco
          return {
            ...t,
            contaCreditoId: contaBancariaId,
            status: t.contaDebitoId ? 'CLASSIFICADO' : 'PENDENTE',
            classificado: !!t.contaDebitoId
          };
        }
      }

      return t;
    });
  }

  public gerarLoteDoExtrato(
    transacoes: ExtratoTransacao[],
    empresaIdOrNome?: number | string,
    nomeOuEmpresaId?: string | number
  ): { success: boolean; loteId: number; lote: LoteContabil; count: number; partidasCriadas: number; totalValor: number } {
    let empId = this.activeEmpresaId;
    let nomeLote = `Lote Importação Extrato - ${new Date().toISOString().slice(0, 10)}`;

    if (typeof empresaIdOrNome === 'number') {
      empId = empresaIdOrNome;
      if (typeof nomeOuEmpresaId === 'string') nomeLote = nomeOuEmpresaId;
    } else if (typeof empresaIdOrNome === 'string') {
      nomeLote = empresaIdOrNome;
      if (typeof nomeOuEmpresaId === 'number') empId = nomeOuEmpresaId;
    }

    const classificadas = transacoes.filter(t => (t.status === 'CLASSIFICADO' || t.classificado) && t.contaDebitoId && t.contaCreditoId);

    const proximoNumLote = this.lotes.reduce((m, l) => Math.max(m, l.numero), 0) + 1;
    const lote: LoteContabil = {
      id: Date.now(),
      empresaId: empId,
      numero: proximoNumLote,
      numeroLote: proximoNumLote,
      descricao: nomeLote,
      dataLote: new Date().toISOString().slice(0, 10),
      status: 'FECHADO',
      totalDebito: 0,
      totalCredito: 0
    };

    if (classificadas.length === 0) {
      return { success: false, loteId: 0, lote, count: 0, partidasCriadas: 0, totalValor: 0 };
    }

    let total = 0;
    for (const t of classificadas) {
      this.addLancamento({
        empresaId: empId,
        numeroPartida: this.lancamentos.length + 1,
        loteId: lote.id,
        dataLancamento: t.data,
        tipoPartida: 'SIMPLES',
        contaDebitoId: t.contaDebitoId,
        contaCreditoId: t.contaCreditoId,
        valor: Math.abs(t.valor),
        historicoId: t.historicoId || 1,
        complementoHistorico: t.complemento || t.historicoOriginal,
        usuarioNome: 'Conciliação Automática'
      });
      total += Math.abs(t.valor);
    }

    lote.totalDebito = total;
    lote.totalCredito = total;
    this.lotes.push(lote);

    this.persistSnapshot();
    this.registrarAuditoria('CONCILIAÇÃO', 'IMPORTAÇÃO', `Lote nº ${lote.numero} gerado a partir de extrato com ${classificadas.length} partidas.`);

    return {
      success: true,
      loteId: lote.id,
      lote,
      count: classificadas.length,
      partidasCriadas: classificadas.length,
      totalValor: total
    };
  }

  // --------------------------------------------------------------------------
  // VARIÁVEIS MENSAIS DE FOLHA DE PAGAMENTO (FO)
  // --------------------------------------------------------------------------
  public getVariaveisColaboradores(empresaId?: number, competencia?: string): VariaveisColaborador[] {
    const empId = empresaId || this.activeEmpresaId;
    return this.variaveisColaboradores.filter(v => {
      const matchEmp = !v.empresaId || v.empresaId === empId;
      const matchComp = !competencia || v.competencia === competencia;
      return matchEmp && matchComp;
    });
  }

  public getVariavelColaborador(colaboradorId: number, competencia: string): VariaveisColaborador | undefined {
    return this.variaveisColaboradores.find(v => v.colaboradorId === colaboradorId && v.competencia === competencia);
  }

  public saveVariaveisColaborador(v: VariaveisColaborador) {
    const idx = this.variaveisColaboradores.findIndex(item =>
      (v.id && item.id === v.id) ||
      (item.colaboradorId === v.colaboradorId && item.competencia === v.competencia)
    );
    if (idx >= 0) {
      this.variaveisColaboradores[idx] = { ...this.variaveisColaboradores[idx], ...v };
    } else {
      v.id = Date.now();
      this.variaveisColaboradores.push(v);
    }
    this.persistSnapshot();
  }

  public deleteVariaveisColaborador(id: number) {
    this.variaveisColaboradores = this.variaveisColaboradores.filter(v => v.id !== id);
    this.persistSnapshot();
  }

  // --------------------------------------------------------------------------
  // ATIVO IMOBILIZADO & DEPRECIAÇÃO PATRIMONIAL (CT / IMOBILIZADO)
  // --------------------------------------------------------------------------
  public getAtivosImobilizados(empresaId?: number): AtivoImobilizado[] {
    const empId = empresaId || this.activeEmpresaId;
    return this.ativosImobilizados.filter(a => a.empresaId === empId);
  }

  public saveAtivoImobilizado(ativo: AtivoImobilizado) {
    const idx = this.ativosImobilizados.findIndex(a => a.id === ativo.id);
    if (idx >= 0) {
      this.ativosImobilizados[idx] = ativo;
    } else {
      ativo.id = Date.now();
      this.ativosImobilizados.push(ativo);
    }
    this.persistSnapshot();
    this.registrarAuditoria('ATIVO_IMOBILIZADO', 'CADASTRO', `Registro do bem patrimonial ${ativo.codigo} - ${ativo.descricao} salvo.`);
  }

  public deleteAtivoImobilizado(id: number) {
    const bem = this.ativosImobilizados.find(a => a.id === id);
    this.ativosImobilizados = this.ativosImobilizados.filter(a => a.id !== id);
    this.persistSnapshot();
    if (bem) {
      this.registrarAuditoria('ATIVO_IMOBILIZADO', 'EXCLUSÃO', `Bem patrimonial ${bem.codigo} - ${bem.descricao} excluído.`);
    }
  }

  public calcularDepreciacaoPeriodo(empresaId: number, competencia: string): {
    ativo: AtivoImobilizado;
    valorMensal: number;
    depreciacaoAcumuladaProjetada: number;
    saldoResidualContabil: number;
  }[] {
    const ativos = this.getAtivosImobilizados(empresaId).filter(a => a.ativo);
    return ativos.map(ativo => {
      // Depreciação Linear Mensal: (Valor Original - Residual) * (Taxa Anual / 100 / 12)
      const baseCalculo = Math.max(0, ativo.valorOriginal - (ativo.valorResidual || 0));
      const valorMensal = Math.round((baseCalculo * (ativo.taxaDepreciacaoAnual / 100 / 12)) * 100) / 100;

      const depAtual = ativo.depreciacaoAcumulada || 0;
      const depAcumuladaProjetada = Math.min(baseCalculo, depAtual + valorMensal);
      const saldoResidualContabil = Math.max(ativo.valorResidual || 0, ativo.valorOriginal - depAcumuladaProjetada);

      return {
        ativo,
        valorMensal,
        depreciacaoAcumuladaProjetada: depAcumuladaProjetada,
        saldoResidualContabil
      };
    });
  }

  public integrarDepreciacaoContabil(empresaId: number, competencia: string): {
    success: boolean;
    partidasGeradas: number;
    loteId: number;
    totalDepreciado: number;
  } {
    const calculos = this.calcularDepreciacaoPeriodo(empresaId, competencia);
    if (calculos.length === 0) {
      return { success: false, partidasGeradas: 0, loteId: 0, totalDepreciado: 0 };
    }

    const proximoNumLote = this.lotes.reduce((m, l) => Math.max(m, l.numero), 0) + 1;
    const loteId = Date.now();
    const lote: LoteContabil = {
      id: loteId,
      empresaId,
      numero: proximoNumLote,
      numeroLote: proximoNumLote,
      descricao: `Lote de Depreciação Mensal do Ativo Imobilizado - Comp. ${competencia}`,
      dataLote: `${competencia}-28`,
      status: 'FECHADO',
      totalDebito: 0,
      totalCredito: 0
    };

    let total = 0;
    let partidas = 0;

    for (const item of calculos) {
      if (item.valorMensal <= 0) continue;

      // D: Conta de Despesa de Depreciação (Resultado)
      // C: Conta de Depreciação Acumulada (Ativo Redutora)
      const contaDeb = item.ativo.contaDespesaDepreciacaoId || 57;
      const contaCred = item.ativo.contaDepreciacaoAcumuladaId || 20;

      this.addLancamento({
        empresaId,
        numeroPartida: this.lancamentos.length + 1,
        loteId: lote.id,
        dataLancamento: `${competencia}-28`,
        tipoPartida: 'SIMPLES',
        contaDebitoId: contaDeb,
        contaCreditoId: contaCred,
        valor: item.valorMensal,
        historicoId: 3,
        complementoHistorico: `Quota de Depreciação ref. ${competencia} do bem ${item.ativo.codigo} - ${item.ativo.descricao}`,
        usuarioNome: 'Módulo Imobilizado'
      });

      // Atualiza depreciação acumulada do bem
      item.ativo.depreciacaoAcumulada = item.depreciacaoAcumuladaProjetada;
      item.ativo.valorContabilAtual = item.saldoResidualContabil;
      this.saveAtivoImobilizado(item.ativo);

      total += item.valorMensal;
      partidas++;
    }

    lote.totalDebito = total;
    lote.totalCredito = total;
    this.lotes.push(lote);

    this.persistSnapshot();
    this.registrarAuditoria('INTEGRAÇÃO_IMOBILIZADO', 'PROCESSAMENTO', `Depreciação mensal de ${competencia} integrada à contabilidade: ${partidas} lançamentos no lote nº ${lote.numero}, total R$ ${total.toFixed(2)}.`);

    return {
      success: true,
      partidasGeradas: partidas,
      loteId,
      totalDepreciado: total
    };
  }

  // --------------------------------------------------------------------------
  // DEMONSTRATIVOS DLPA E DFC
  // --------------------------------------------------------------------------
  private dlpaItens: Record<string, DLPAItem[]> = {};
  private dfcItens: Record<string, DFCItem[]> = {};

  public getDLPA(empresaId: number, exercicio: number): DLPAItem[] {
    const key = `${empresaId}_${exercicio}`;
    if (this.dlpaItens[key]) return this.dlpaItens[key];

    const padrao: DLPAItem[] = [
      { id: 1, empresaId, exercicio, ordem: 1, descricao: 'Saldo no Início do Período', valor: 85400.00, tipo: 'SALDO_INICIAL' },
      { id: 2, empresaId, exercicio, ordem: 2, descricao: 'Ajustes de Exercícios Anteriores', valor: 0.00, tipo: 'AJUSTE' },
      { id: 3, empresaId, exercicio, ordem: 3, descricao: 'Lucro Líquido do Exercício (DRE)', valor: 42150.00, tipo: 'LUCRO_EXERCICIO' },
      { id: 4, empresaId, exercicio, ordem: 4, descricao: 'Transferência para Reserva Legal (5%)', valor: -2107.50, tipo: 'DESTINACAO' },
      { id: 5, empresaId, exercicio, ordem: 5, descricao: 'Distribuição de Lucros / Dividendos', valor: -30000.00, tipo: 'DESTINACAO' },
      { id: 6, empresaId, exercicio, ordem: 6, descricao: 'Saldo no Fim do Período', valor: 95442.50, tipo: 'SALDO_FINAL' }
    ];
    this.dlpaItens[key] = padrao;
    return padrao;
  }

  public saveDLPA(empresaId: number, exercicio: number, itens: DLPAItem[]) {
    const key = `${empresaId}_${exercicio}`;
    this.dlpaItens[key] = itens;
    this.persistSnapshot();
  }

  public getDFC(empresaId: number, exercicio: number): DFCItem[] {
    const key = `${empresaId}_${exercicio}`;
    if (this.dfcItens[key]) return this.dfcItens[key];

    const padrao: DFCItem[] = [
      { id: 1, empresaId, exercicio, ordem: 1, grupo: 'OPERACIONAL', descricao: 'Lucro Líquido do Exercício', valor: 42150.00 },
      { id: 2, empresaId, exercicio, ordem: 2, grupo: 'OPERACIONAL', descricao: '(+) Depreciação e Amortização Acumulada', valor: 5400.00 },
      { id: 3, empresaId, exercicio, ordem: 3, grupo: 'OPERACIONAL', descricao: '(+/-) Variação em Contas a Receber / Clientes', valor: -12800.00 },
      { id: 4, empresaId, exercicio, ordem: 4, grupo: 'OPERACIONAL', descricao: '(+/-) Variação em Estoques e Mercadorias', valor: -4500.00 },
      { id: 5, empresaId, exercicio, ordem: 5, grupo: 'OPERACIONAL', descricao: '(+/-) Variação em Fornecedores e Obrigações Fiscais', valor: 18200.00 },
      { id: 6, empresaId, exercicio, ordem: 6, grupo: 'INVESTIMENTO', descricao: 'Aquisição de Imobilizado (Equipamentos de TI)', valor: -8500.00 },
      { id: 7, empresaId, exercicio, ordem: 7, grupo: 'FINANCIAMENTO', descricao: 'Amortização de Empréstimos Bancários', valor: -6000.00 },
      { id: 8, empresaId, exercicio, ordem: 8, grupo: 'FINANCIAMENTO', descricao: 'Distribuição de Lucros aos Sócios', valor: -25000.00 }
    ];
    this.dfcItens[key] = padrao;
    return padrao;
  }

  public saveDFC(empresaId: number, exercicio: number, itens: DFCItem[]) {
    const key = `${empresaId}_${exercicio}`;
    this.dfcItens[key] = itens;
    this.persistSnapshot();
  }

  // --------------------------------------------------------------------------
  // GERADOR DO SPED ECD (ESCRITURAÇÃO CONTÁBIL DIGITAL) OFICIAL
  // --------------------------------------------------------------------------
  public gerarSpedECD(empresaId?: number, ano?: number): string {
    const emp = this.getEmpresas().find(e => e.id === (empresaId || this.activeEmpresaId)) || this.getActiveEmpresa();
    const anoRef = ano || emp.exercicioAtivo;
    const contasEmp = this.getContas(emp.id);
    const lancsEmp = this.getLancamentos(emp.id).filter(l => l.dataLancamento.startsWith(String(anoRef)));

    const linhas: string[] = [];

    // BLOCO 0: Abertura e Identificação
    linhas.push(`|0000|LECD|0101${anoRef}|3112${anoRef}|${emp.razaoSocial.toUpperCase()}|${emp.cnpj.replace(/\D/g, '')}|${emp.uf}|${emp.inscricaoEstadual?.replace(/\D/g, '') || ''}|3550308||0|1|||`);
    linhas.push('|0001|0|');
    linhas.push(`|0007|00|`);
    linhas.push('|0990|4|');

    // BLOCO I: Lançamentos Contábeis
    linhas.push('|I001|0|');
    linhas.push(`|I010|G|1.00|`);

    // I050: Plano de Contas
    for (const c of contasEmp) {
      linhas.push(`|I050|0101${anoRef}|01|${c.tipo}|${c.grau}|${c.codigoReduzido}|${c.classificacao}|${c.nome.toUpperCase()}|`);
    }

    // I150 e I155: Saldos
    linhas.push(`|I150|0101${anoRef}|3112${anoRef}|`);
    for (const c of contasEmp.filter(c => c.tipo === 'A')) {
      const saldoIni = Math.abs(c.saldoAnterior).toFixed(2);
      const indIni = c.natureza;
      linhas.push(`|I155|${c.codigoReduzido}|${c.codigoReduzido}|${saldoIni}|${indIni}|0.00|0.00|${saldoIni}|${indIni}|`);
    }

    // I200 e I250: Lançamentos e Partidas
    for (const l of lancsEmp) {
      const dataFmt = l.dataLancamento.replace(/-/g, '');
      linhas.push(`|I200|${l.numeroPartida}|${dataFmt}|${l.valor.toFixed(2)}|N|`);
      if (l.contaDebitoId) {
        linhas.push(`|I250|${l.contaDebitoId}||${l.valor.toFixed(2)}|D|||${l.complementoHistorico}|`);
      }
      if (l.contaCreditoId) {
        linhas.push(`|I250|${l.contaCreditoId}||${l.valor.toFixed(2)}|C|||${l.complementoHistorico}|`);
      }
    }
    linhas.push(`|I990|${linhas.length}|`);

    // BLOCO J: Demonstrações Contábeis
    linhas.push('|J001|0|');
    linhas.push(`|J005|0101${anoRef}|3112${anoRef}|1|BALANÇO PATRIMONIAL E DRE|`);
    linhas.push('|J990|3|');

    // BLOCO 9: Encerramento
    linhas.push('|9001|0|');
    linhas.push(`|9900|0000|1|`);
    linhas.push(`|9900|I050|${contasEmp.length}|`);
    linhas.push(`|9900|I200|${lancsEmp.length}|`);
    linhas.push('|9990|5|');
    linhas.push(`|9999|${linhas.length + 1}|`);

    this.registrarAuditoria('SPED_ECD', 'EXPORTAÇÃO', `Arquivo SPED ECD do exercício ${anoRef} gerado com sucesso.`);

    return linhas.join('\r\n');
  }

  // --------------------------------------------------------------------------
  // GERADOR DO SPED ECF (ESCRITURAÇÃO CONTÁBIL FISCAL) OFICIAL
  // --------------------------------------------------------------------------
  public gerarSpedECF(empresaId?: number, ano?: number): string {
    const emp = this.getEmpresas().find(e => e.id === (empresaId || this.activeEmpresaId)) || this.getActiveEmpresa();
    const anoRef = ano || emp.exercicioAtivo;
    const contasEmp = this.getContas(emp.id);
    const lancsEmp = this.getLancamentos(emp.id).filter(l => l.dataLancamento.startsWith(String(anoRef)));
    const ccs = this.getCentrosCusto(emp.id);

    const linhas: string[] = [];

    // BLOCO 0: Abertura, Identificação e Parâmetros
    linhas.push(`|0000|LECF|10.00|${emp.razaoSocial.toUpperCase()}|${emp.cnpj.replace(/\\D/g, '')}|0101${anoRef}|3112${anoRef}|0|0||||`);
    linhas.push('|0001|0|');
    const codFormaTrib = emp.regimeTributario === 'LUCRO_REAL' ? '1' : emp.regimeTributario === 'LUCRO_PRESUMIDO' ? '3' : '5';
    linhas.push(`|0010|${codFormaTrib}|C|N||N|N|N|01|N|N|||||`);
    linhas.push('|0020|0|N|N|N|N|N|N|N|N|N|N|N|N|N|N|N|N|N|N|N|N|N|N|');
    linhas.push('|0990|5|');

    // BLOCO J: Plano de Contas e Mapeamento
    linhas.push('|J001|0|');
    for (const c of contasEmp) {
      const nat = c.naturezaSped || (c.classificacao.startsWith('1') ? '01' : c.classificacao.startsWith('2') ? '02' : c.classificacao.startsWith('3') ? '03' : '04');
      linhas.push(`|J050|0101${anoRef}|${c.classificacao}|${c.tipo}|${c.grau}|${c.codigoReduzido}|${c.nome.toUpperCase()}|${nat}|`);
      if (c.tipo === 'A') {
        const ref = c.codigoReferencialRFB || `${c.classificacao}.00`;
        linhas.push(`|J051|${c.codigoReduzido}|${ref}|${ccs[0]?.codigo || ''}|`);
      }
    }
    for (const cc of ccs) {
      linhas.push(`|J100|${cc.codigo}|${cc.nome.toUpperCase()}|`);
    }
    linhas.push(`|J990|${linhas.filter(l => l.startsWith('|J')).length + 1}|`);

    // BLOCO K: Saldos das Contas Contábeis e Referenciais
    linhas.push('|K001|0|');
    linhas.push(`|K030|0101${anoRef}|3112${anoRef}|A00|`);
    for (const c of contasEmp.filter(c => c.tipo === 'A')) {
      const saldoIni = Math.abs(c.saldoAnterior).toFixed(2);
      const indIni = c.natureza;
      linhas.push(`|K155|${c.codigoReduzido}|${ccs[0]?.codigo || ''}|${saldoIni}|${indIni}|0.00|0.00|${saldoIni}|${indIni}|`);
    }
    linhas.push(`|K990|${linhas.filter(l => l.startsWith('|K')).length + 1}|`);

    // BLOCO P: Balanço e Apuração do Lucro Presumido
    linhas.push('|P001|0|');
    linhas.push(`|P030|0101${anoRef}|3112${anoRef}|A00|`);
    linhas.push(`|P100|1|ATIVO TOTAL|1050300.50|D|`);
    linhas.push(`|P100|2|PASSIVO E PATRIMONIO LIQUIDO|1050300.50|C|`);
    linhas.push(`|P150|3|RECEITA OPERACIONAL BRUTA|450000.00|C|`);
    linhas.push(`|P200|P200|RECEITA BRUTA COM VENDAS E SERVICOS|450000.00|`);
    linhas.push(`|P400|P400|BASE DE CALCULO DA CSLL|450000.00|`);
    linhas.push(`|P990|7|`);

    // BLOCO 9: Encerramento
    linhas.push('|9001|0|');
    linhas.push('|9900|0000|1|');
    linhas.push('|9900|0010|1|');
    linhas.push('|9900|J050|' + contasEmp.length + '|');
    linhas.push('|9900|K155|' + contasEmp.filter(c => c.tipo === 'A').length + '|');
    linhas.push('|9990|6|');
    linhas.push(`|9999|${linhas.length + 1}|`);

    this.registrarAuditoria('SPED_ECF', 'EXPORTAÇÃO', `Arquivo SPED ECF do exercício ${anoRef} gerado com sucesso.`);
    return linhas.join('\r\n');
  }

  // --------------------------------------------------------------------------
  // GERADOR DO SPED FISCAL EFD-ICMS/IPI OFICIAL
  // --------------------------------------------------------------------------
  public gerarSpedFiscalEFD(empresaId?: number, comp?: string): string {
    const emp = this.getEmpresas().find(e => e.id === (empresaId || this.activeEmpresaId)) || this.getActiveEmpresa();
    const competencia = comp || emp.competenciaAtiva;
    const [ano, mes] = competencia.split('-');
    const dataIni = `01${mes}${ano}`;
    const ultimoDia = new Date(Number(ano), Number(mes), 0).getDate();
    const dataFim = `${ultimoDia}${mes}${ano}`;

    const parts = this.getParticipantes(emp.id);
    const prods = this.getProdutos(emp.id);
    const notas = this.getNotasFiscais(emp.id).filter(n => n.dataEmissao.startsWith(`${ano}-${mes}`));

    const linhas: string[] = [];

    // BLOCO 0: Abertura e Identificação
    linhas.push(`|0000|018|0|${dataIni}|${dataFim}|${emp.razaoSocial.toUpperCase()}|${emp.cnpj.replace(/\\D/g, '')}|${emp.uf}|${emp.inscricaoEstadual?.replace(/\\D/g, '') || ''}|${emp.codigoIbge || '3550308'}||A|1|`);
    linhas.push('|0001|0|');
    linhas.push(`|0005|${(emp.nomeFantasia || emp.razaoSocial).toUpperCase()}|${emp.cep?.replace(/\\D/g, '') || '01310100'}|${(emp.logradouro || 'AV PAULISTA').toUpperCase()}|${emp.numero || '1000'}|${emp.complemento || ''}|${(emp.bairro || 'BELA VISTA').toUpperCase()}|${emp.telefone?.replace(/\\D/g, '') || '1130000000'}|${emp.email || 'contabil@empresa.com.br'}|`);
    linhas.push(`|0100|${(emp.contadorNome || 'HELENA SILVEIRA').toUpperCase()}|${emp.contadorCPF?.replace(/\\D/g, '') || '12345678909'}|${emp.contadorCRC || 'SP-123456/O'}|${emp.cnpj.replace(/\\D/g, '')}|01310100|AV PAULISTA|1000||BELA VISTA|1130000000||helena@amillabs.com.br|3550308|`);

    // 0150: Participantes
    for (const p of parts) {
      linhas.push(`|0150|${p.codigo}|${p.nomeRazaoSocial.toUpperCase()}|1058|${p.cnpjCpf.replace(/\\D/g, '')}||${p.inscricaoEstadual?.replace(/\\D/g, '') || ''}|${p.codigoIbge || '3550308'}||${p.logradouro || ''}|${p.numero || ''}|${p.complemento || ''}|${p.bairro || ''}|`);
    }

    // 0190: Unidades de Medida
    linhas.push('|0190|UN|UNIDADE|');
    linhas.push('|0190|PC|PECA|');
    linhas.push('|0190|CX|CAIXA|');
    linhas.push('|0190|SV|SERVICO|');

    // 0200: Produtos e Serviços
    for (const prod of prods) {
      linhas.push(`|0200|${prod.codigo}|${prod.descricao.toUpperCase()}|||${prod.unidadeMedida}|${prod.tipoItemSped}|${prod.ncm.replace(/\\D/g, '')}||${prod.cest?.replace(/\\D/g, '') || ''}|${prod.aliquotaICMS || '18.00'}|`);
    }
    linhas.push(`|0990|${linhas.length + 1}|`);

    // BLOCO C: Documentos Fiscais I - Mercadorias
    linhas.push('|C001|0|');
    let totalICMSDeb = 0;
    let totalICMSCred = 0;

    for (const n of notas) {
      const indOper = n.tipo === 'SAIDA' ? '1' : '0';
      const indEmit = n.tipo === 'SAIDA' ? '0' : '1';
      const codPart = n.participanteId ? (parts.find(p => p.id === n.participanteId)?.codigo || '001') : '001';
      const dtDoc = n.dataEmissao.replace(/-/g, '').slice(6, 8) + n.dataEmissao.replace(/-/g, '').slice(4, 6) + n.dataEmissao.replace(/-/g, '').slice(0, 4);
      const chave = n.chaveAcesso || `352610${emp.cnpj.replace(/\\D/g, '')}55001${String(n.numero).padStart(9, '0')}100000001`;

      const vICMS = n.valorICMS || 0;
      const vBC_ICMS = n.baseCalculoICMS || 0;
      const vPIS = n.valorPIS || 0;
      const vBC_PIS = n.baseCalculoPIS || 0;
      const vCOFINS = n.valorCOFINS || 0;
      const vBC_COFINS = n.baseCalculoCOFINS || 0;

      if (n.tipo === 'SAIDA') totalICMSDeb += vICMS;
      else if (n.tipo === 'ENTRADA') totalICMSCred += vICMS;

      // C100 Mestre da Nota Fiscal
      linhas.push(`|C100|${indOper}|${indEmit}|${codPart}|55|00|${n.serie}|${n.numero}|${chave}|${dtDoc}|${dtDoc}|${n.valorTotal.toFixed(2)}|1|0.00|0.00|${n.valorTotal.toFixed(2)}|9|0.00|0.00|0.00|${vBC_ICMS.toFixed(2)}|${vICMS.toFixed(2)}|0.00|0.00|0.00|${vPIS.toFixed(2)}|${vCOFINS.toFixed(2)}|0.00|0.00|`);

      // C170 Detalhe dos Itens
      if (n.itens && n.itens.length > 0) {
        for (const it of n.itens) {
          const itBC_ICMS = it.baseCalculoICMS || 0;
          const itAliqICMS = it.aliquotaICMS || 0;
          const itValICMS = it.valorICMS || 0;
          const itBC_PIS = it.baseCalculoPIS || 0;
          const itAliqPIS = it.aliquotaPIS || 0;
          const itValPIS = it.valorPIS || 0;
          const itBC_COFINS = it.baseCalculoCOFINS || 0;
          const itAliqCOFINS = it.aliquotaCOFINS || 0;
          const itValCOFINS = it.valorCOFINS || 0;

          linhas.push(`|C170|${it.numeroItem}|${it.codigoProduto}|${it.descricao.toUpperCase()}|${it.quantidade.toFixed(2)}|${it.unidade}|${it.valorTotal.toFixed(2)}|0.00|0|${it.cstICMS || '00'}|${it.cfop}|${it.cfop}|${itBC_ICMS.toFixed(2)}|${itAliqICMS.toFixed(2)}|${itValICMS.toFixed(2)}|0.00|0.00|0.00|0|0.00|${it.cstPIS || '01'}|${itBC_PIS.toFixed(2)}|${itAliqPIS.toFixed(2)}||${itValPIS.toFixed(2)}|${it.cstCOFINS || '01'}|${itBC_COFINS.toFixed(2)}|${itAliqCOFINS.toFixed(2)}||${itValCOFINS.toFixed(2)}||`);
        }
      } else {
        linhas.push(`|C170|1|${prods[0]?.codigo || 'PROD-001'}|MERCADORIA PADRAO|1.00|UN|${n.valorTotal.toFixed(2)}|0.00|0|00|${n.cfop}|${n.cfop}|${vBC_ICMS.toFixed(2)}|18.00|${vICMS.toFixed(2)}|0.00|0.00|0.00|0|0.00|01|${vBC_PIS.toFixed(2)}|0.65||${vPIS.toFixed(2)}|01|${vBC_COFINS.toFixed(2)}|3.00||${vCOFINS.toFixed(2)}||`);
      }

      // C190 Analítico da Nota
      linhas.push(`|C190|000|${n.cfop}|18.00|${n.valorTotal.toFixed(2)}|${vBC_ICMS.toFixed(2)}|${vICMS.toFixed(2)}|0.00|0.00|0.00|0.00||`);
    }
    linhas.push(`|C990|${linhas.filter(l => l.startsWith('|C')).length + 1}|`);

    // BLOCO E: Apuração do ICMS Próprio
    linhas.push('|E001|0|');
    linhas.push(`|E100|${dataIni}|${dataFim}|`);
    const icmsSaldo = Math.max(0, totalICMSDeb - totalICMSCred);
    linhas.push(`|E110|${totalICMSDeb.toFixed(2)}|0.00|${totalICMSDeb.toFixed(2)}|${totalICMSCred.toFixed(2)}|0.00|${totalICMSCred.toFixed(2)}|${icmsSaldo.toFixed(2)}|0.00|0.00|0.00|${icmsSaldo.toFixed(2)}|0.00|`);
    if (icmsSaldo > 0) {
      linhas.push(`|E116|000|${icmsSaldo.toFixed(2)}|20${mes}${ano}|046-2||||||`);
    }
    linhas.push(`|E990|${linhas.filter(l => l.startsWith('|E')).length + 1}|`);

    // BLOCO 9: Encerramento
    linhas.push('|9001|0|');
    linhas.push('|9900|0000|1|');
    linhas.push('|9900|0150|' + parts.length + '|');
    linhas.push('|9900|0200|' + prods.length + '|');
    linhas.push('|9900|C100|' + notas.length + '|');
    linhas.push('|9990|6|');
    linhas.push(`|9999|${linhas.length + 1}|`);

    this.registrarAuditoria('SPED_FISCAL', 'EXPORTAÇÃO', `Arquivo EFD-ICMS/IPI da competência ${competencia} gerado com sucesso.`);
    return linhas.join('\r\n');
  }

  // --------------------------------------------------------------------------
  // GERADOR DO SPED EFD-CONTRIBUIÇÕES (PIS/COFINS) OFICIAL
  // --------------------------------------------------------------------------
  public gerarSpedContribuicoes(empresaId?: number, comp?: string): string {
    const emp = this.getEmpresas().find(e => e.id === (empresaId || this.activeEmpresaId)) || this.getActiveEmpresa();
    const competencia = comp || emp.competenciaAtiva;
    const [ano, mes] = competencia.split('-');
    const dataIni = `01${mes}${ano}`;
    const ultimoDia = new Date(Number(ano), Number(mes), 0).getDate();
    const dataFim = `${ultimoDia}${mes}${ano}`;

    const parts = this.getParticipantes(emp.id);
    const notas = this.getNotasFiscais(emp.id).filter(n => n.dataEmissao.startsWith(`${ano}-${mes}`));

    const linhas: string[] = [];

    // BLOCO 0: Abertura e Identificação
    linhas.push(`|0000|006|0|${dataIni}|${dataFim}|${emp.razaoSocial.toUpperCase()}|${emp.cnpj.replace(/\\D/g, '')}|${emp.uf}|${emp.codigoIbge || '3550308'}||1|1|`);
    linhas.push('|0001|0|');
    linhas.push(`|0100|${(emp.contadorNome || 'HELENA SILVEIRA').toUpperCase()}|${emp.contadorCPF?.replace(/\\D/g, '') || '12345678909'}|${emp.contadorCRC || 'SP-123456/O'}|${emp.cnpj.replace(/\\D/g, '')}|01310100|AV PAULISTA|1000||BELA VISTA|1130000000||helena@amillabs.com.br|3550308|`);
    linhas.push(`|0110|1|2|2|`);
    linhas.push(`|0140|0001|MATRIZ|${emp.cnpj.replace(/\\D/g, '')}|${emp.uf}|${emp.inscricaoEstadual?.replace(/\\D/g, '') || ''}|${emp.codigoIbge || '3550308'}|||`);
    linhas.push('|0990|6|');

    // BLOCO A: Serviços (NFS-e)
    linhas.push('|A001|0|');
    const notasServico = notas.filter(n => n.tipo === 'SERVICO');
    for (const ns of notasServico) {
      const dtDoc = ns.dataEmissao.replace(/-/g, '').slice(6, 8) + ns.dataEmissao.replace(/-/g, '').slice(4, 6) + ns.dataEmissao.replace(/-/g, '').slice(0, 4);
      const nsBC_PIS = ns.baseCalculoPIS || 0;
      const nsValPIS = ns.valorPIS || 0;
      const nsBC_COFINS = ns.baseCalculoCOFINS || 0;
      const nsValCOFINS = ns.valorCOFINS || 0;
      linhas.push(`|A100|1|0|001|01|00|${ns.numero}|${dtDoc}|${dtDoc}|${ns.valorTotal.toFixed(2)}|1|0.00|${ns.valorTotal.toFixed(2)}|${nsBC_PIS.toFixed(2)}|${nsValPIS.toFixed(2)}|${nsBC_COFINS.toFixed(2)}|${nsValCOFINS.toFixed(2)}|0.00|0.00|`);
    }
    linhas.push(`|A990|${linhas.filter(l => l.startsWith('|A')).length + 1}|`);

    // BLOCO C: Mercadorias
    linhas.push('|C001|0|');
    const notasMerc = notas.filter(n => n.tipo !== 'SERVICO');
    let sumPIS = 0;
    let sumCOFINS = 0;
    let sumBasePIS = 0;

    for (const nm of notasMerc) {
      const indOper = nm.tipo === 'SAIDA' ? '1' : '0';
      const dtDoc = nm.dataEmissao.replace(/-/g, '').slice(6, 8) + nm.dataEmissao.replace(/-/g, '').slice(4, 6) + nm.dataEmissao.replace(/-/g, '').slice(0, 4);
      const nmValPIS = nm.valorPIS || 0;
      const nmValCOFINS = nm.valorCOFINS || 0;
      const nmBC_PIS = nm.baseCalculoPIS || 0;
      const nmBC_ICMS = nm.baseCalculoICMS || 0;
      const nmValICMS = nm.valorICMS || 0;

      if (nm.tipo === 'SAIDA') {
        sumPIS += nmValPIS;
        sumCOFINS += nmValCOFINS;
        sumBasePIS += nmBC_PIS;
      }
      linhas.push(`|C100|${indOper}|0|001|55|00|${nm.serie}|${nm.numero}|${nm.chaveAcesso || ''}|${dtDoc}|${dtDoc}|${nm.valorTotal.toFixed(2)}|1|0.00|0.00|${nm.valorTotal.toFixed(2)}|9|0.00|0.00|0.00|${nmBC_ICMS.toFixed(2)}|${nmValICMS.toFixed(2)}|0.00|0.00|0.00|${nmValPIS.toFixed(2)}|${nmValCOFINS.toFixed(2)}|0.00|0.00|`);
    }
    linhas.push(`|C990|${linhas.filter(l => l.startsWith('|C')).length + 1}|`);

    // BLOCO M: Apuração PIS e COFINS
    linhas.push('|M001|0|');
    linhas.push(`|M200|${sumPIS.toFixed(2)}|0.00|0.00|0.00|0.00|0.00|${sumPIS.toFixed(2)}|0.00|0.00|${sumPIS.toFixed(2)}|`);
    linhas.push(`|M210|01|${sumBasePIS.toFixed(2)}|${sumBasePIS.toFixed(2)}|0.6500||${sumPIS.toFixed(2)}|0.00|||${sumPIS.toFixed(2)}|`);
    linhas.push(`|M600|${sumCOFINS.toFixed(2)}|0.00|0.00|0.00|0.00|0.00|${sumCOFINS.toFixed(2)}|0.00|0.00|${sumCOFINS.toFixed(2)}|`);
    linhas.push(`|M610|01|${sumBasePIS.toFixed(2)}|${sumBasePIS.toFixed(2)}|3.0000||${sumCOFINS.toFixed(2)}|0.00|||${sumCOFINS.toFixed(2)}|`);
    linhas.push('|M990|6|');

    // BLOCO 9: Encerramento
    linhas.push('|9001|0|');
    linhas.push('|9900|0000|1|');
    linhas.push('|9900|C100|' + notasMerc.length + '|');
    linhas.push('|9900|M200|1|');
    linhas.push('|9900|M600|1|');
    linhas.push('|9990|6|');
    linhas.push(`|9999|${linhas.length + 1}|`);

    this.registrarAuditoria('SPED_CONTRIBUICOES', 'EXPORTAÇÃO', `Arquivo EFD-Contribuições da competência ${competencia} gerado com sucesso.`);
    return linhas.join('\r\n');
  }

  // --------------------------------------------------------------------------
  // CONTROLE DE OBRIGAÇÕES ACESSÓRIAS & CALENDÁRIO FISCAL
  // --------------------------------------------------------------------------
  public getObrigacoesFiscais(empresaId?: number, competencia?: string): ObrigacaoFiscal[] {
    const empId = empresaId || this.activeEmpresaId;
    return this.obrigacoesFiscais
      .filter(o => o.empresaId === empId && (!competencia || o.competencia === competencia))
      .sort((a, b) => new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime());
  }

  public saveObrigacaoFiscal(ob: ObrigacaoFiscal) {
    const idx = this.obrigacoesFiscais.findIndex(item => item.id === ob.id);
    if (idx >= 0) this.obrigacoesFiscais[idx] = ob;
    else { ob.id = Date.now(); this.obrigacoesFiscais.push(ob); }
    this.persistSnapshot();
    this.registrarAuditoria('OBRIGAÇÕES', 'SALVAR', `Obrigação ${ob.sigla} da competência ${ob.competencia} atualizada.`);
  }

  public deleteObrigacaoFiscal(id: number) {
    this.obrigacoesFiscais = this.obrigacoesFiscais.filter(o => o.id !== id);
    this.persistSnapshot();
  }

  public marcarObrigacaoEntregue(id: number, protocolo: string, recibo?: string) {
    const ob = this.obrigacoesFiscais.find(o => o.id === id);
    if (ob) {
      ob.status = 'ENTREGUE';
      ob.dataTransmissao = new Date().toISOString().split('T')[0];
      ob.protocoloTransmissao = protocolo;
      if (recibo) ob.reciboEnvio = recibo;
      this.persistSnapshot();
      this.registrarAuditoria('OBRIGAÇÕES', 'TRANSMISSÃO', `Obrigação ${ob.sigla} marcada como entregue com protocolo ${protocolo}.`);
    }
  }

  // --------------------------------------------------------------------------
  // ASSISTENTE DE FECHAMENTO ANUAL & DESTINAÇÃO DO RESULTADO (LEI 6.404/76)
  // --------------------------------------------------------------------------
  public calcularDestinacaoResultado(empresaId: number, exercicio: number, percentualDistribuicao: number = 90): PropostaDestinacaoResultado {
    const emp = this.getEmpresa(empresaId) || this.getActiveEmpresa();

    // Apura o lucro a partir das receitas e despesas
    const receitas = this.contas.filter(c => c.tipo === 'A' && c.classificacao.startsWith('4')).reduce((acc, c) => acc + (c.saldoAtual || c.saldoAnterior || 0), 0);
    const despesas = this.contas.filter(c => c.tipo === 'A' && (c.classificacao.startsWith('5') || c.classificacao.startsWith('6'))).reduce((acc, c) => acc + (c.saldoAtual || c.saldoAnterior || 0), 0);

    let lucroLiquidoApurado = Math.abs(receitas - despesas);
    if (lucroLiquidoApurado === 0) lucroLiquidoApurado = 148500.00; // Valor de referência para demonstração

    const percentualReservaLegal = 5; // 5% do Lucro Líquido (Art. 193 Lei 6.404/76)
    const valorReservaLegal = Math.round((lucroLiquidoApurado * (percentualReservaLegal / 100)) * 100) / 100;
    const baseDistribuivel = lucroLiquidoApurado - valorReservaLegal;

    const valorTotalDistribuir = Math.round((baseDistribuivel * (percentualDistribuicao / 100)) * 100) / 100;
    const valorRetencaoExpansao = Math.round((baseDistribuivel - valorTotalDistribuir) * 100) / 100;

    const socios = emp.socios || [
      { id: 1, nome: 'Carlos Eduardo Mendes', cpf: '123.456.789-00', percentualCapital: 60, retiraProLabore: true, dataEntrada: '2018-05-10' },
      { id: 2, nome: 'Dra. Mariana Costa Mendes', cpf: '234.567.890-11', percentualCapital: 40, retiraProLabore: false, dataEntrada: '2018-05-10' }
    ];

    const distribuicaoSocios: SocioDistribuicao[] = socios.map(s => ({
      socioId: s.id,
      socioNome: s.nome,
      cpf: s.cpf,
      percentual: s.percentualCapital,
      valorDividendo: Math.round((valorTotalDistribuir * (s.percentualCapital / 100)) * 100) / 100
    }));

    return {
      empresaId,
      exercicio,
      lucroLiquidoApurado,
      percentualReservaLegal,
      valorReservaLegal,
      percentualDistribuicao,
      valorTotalDistribuir,
      distribuicaoSocios,
      valorRetencaoExpansao,
      dataAprovacao: `${exercicio}-12-31`
    };
  }

  public integrarDestinacaoResultadoContabil(empresaId: number, proposta: PropostaDestinacaoResultado): { success: boolean; loteId: number; partidas: number } {
    const proximoNumLote = this.lotes.reduce((m, l) => Math.max(m, l.numero), 0) + 1;
    const loteId = Date.now();

    const lote: LoteContabil = {
      id: loteId,
      empresaId,
      numero: proximoNumLote,
      numeroLote: proximoNumLote,
      descricao: `Encerramento do Exercício ${proposta.exercicio} - Destinação do Resultado`,
      dataLote: `${proposta.exercicio}-12-31`,
      status: 'FECHADO',
      totalDebito: proposta.lucroLiquidoApurado,
      totalCredito: proposta.lucroLiquidoApurado
    };

    let partidaNum = this.lancamentos.length + 1;

    // 1. D: Lucro Líquido do Exercício (ARE) -> C: Reserva Legal (5%)
    this.addLancamento({
      empresaId,
      numeroPartida: partidaNum++,
      loteId,
      dataLancamento: `${proposta.exercicio}-12-31`,
      tipoPartida: 'SIMPLES',
      contaDebitoId: 41, // Lucro Líquido do Exercício
      contaCreditoId: 42, // Reserva Legal
      valor: proposta.valorReservaLegal,
      historicoId: 8,
      complementoHistorico: `Constituição de Reserva Legal (5%) ref. Exercício ${proposta.exercicio} conf. Art. 193 Lei 6.404/76`
    });

    // 2. D: Lucro Líquido -> C: Dividendos e Lucros a Pagar aos Sócios
    this.addLancamento({
      empresaId,
      numeroPartida: partidaNum++,
      loteId,
      dataLancamento: `${proposta.exercicio}-12-31`,
      tipoPartida: 'SIMPLES',
      contaDebitoId: 41, // Lucro Líquido do Exercício
      contaCreditoId: 28, // Lucros e Dividendos a Pagar
      valor: proposta.valorTotalDistribuir,
      historicoId: 8,
      complementoHistorico: `Distribuição de Dividendos e Lucros aos Sócios (${proposta.percentualDistribuicao}% do resultado) ref. Exercício ${proposta.exercicio}`
    });

    // 3. D: Lucro Líquido -> C: Reserva de Lucros para Expansão (Retenção)
    if (proposta.valorRetencaoExpansao > 0) {
      this.addLancamento({
        empresaId,
        numeroPartida: partidaNum++,
        loteId,
        dataLancamento: `${proposta.exercicio}-12-31`,
        tipoPartida: 'SIMPLES',
        contaDebitoId: 41,
        contaCreditoId: 43, // Reserva Estatutária / Expansão
        valor: proposta.valorRetencaoExpansao,
        historicoId: 8,
        complementoHistorico: `Retenção de Lucros para Investimentos e Expansão ref. Exercício ${proposta.exercicio}`
      });
    }

    this.lotes.push(lote);
    this.persistSnapshot();
    this.registrarAuditoria('FECHAMENTO', 'DESTINAÇÃO_LUCRO', `Destinação do Resultado do Exercício ${proposta.exercicio} integrada com sucesso no lote nº ${lote.numero}.`);

    return {
      success: true,
      loteId,
      partidas: proposta.valorRetencaoExpansao > 0 ? 3 : 2
    };
  }

  // ----------------------------------------------------
  // GESTÃO DE ADMINISTRADORAS E VENDAS COM CARTÕES (SPED 1600)
  // ----------------------------------------------------
  public getAdministradorasCartao(empresaId: number): AdministradoraCartao[] {
    return this.administradorasCartao.filter(a => a.empresaId === empresaId);
  }

  public saveAdministradoraCartao(admin: AdministradoraCartao): void {
    const idx = this.administradorasCartao.findIndex(a => a.id === admin.id);
    if (idx >= 0) {
      this.administradorasCartao[idx] = admin;
    } else {
      this.administradorasCartao.push({
        ...admin,
        id: admin.id || Date.now()
      });
    }
    this.persistSnapshot();
    this.registrarAuditoria('FISCAL', 'ADMINISTRADORA_CARTAO', `Administradora "${admin.razaoSocial}" salva com sucesso.`);
  }

  public deleteAdministradoraCartao(id: number): void {
    this.administradorasCartao = this.administradorasCartao.filter(a => a.id !== id);
    this.persistSnapshot();
  }

  public getVendasCartao(empresaId: number, competencia: string): VendaCartaoOperadora[] {
    let itens = this.vendasCartao.filter(v => v.empresaId === empresaId && v.competencia === competencia);
    if (itens.length === 0) {
      itens = this.extrairVendasCartaoDasNotasFiscais(empresaId, competencia);
      this.vendasCartao.push(...itens);
      this.persistSnapshot();
    }
    return itens;
  }

  public saveVendaCartao(venda: VendaCartaoOperadora): void {
    const idx = this.vendasCartao.findIndex(v => v.id === venda.id);
    if (idx >= 0) {
      this.vendasCartao[idx] = venda;
    } else {
      this.vendasCartao.push({
        ...venda,
        id: venda.id || Date.now()
      });
    }
    this.persistSnapshot();
  }

  public extrairVendasCartaoDasNotasFiscais(empresaId: number, competencia: string): VendaCartaoOperadora[] {
    const notas = this.getNotasFiscais(empresaId).filter(n => n.tipo === 'SAIDA' && n.dataEmissao.startsWith(competencia));
    const totalVendas = notas.reduce((acc, n) => acc + n.valorTotal, 0);
    const admins = this.getAdministradorasCartao(empresaId);

    if (admins.length === 0) return [];

    const resultado: VendaCartaoOperadora[] = [];
    const parcelas = [0.45, 0.35, 0.20]; // Proporção de mercado simulada

    admins.slice(0, 3).forEach((adm, idx) => {
      const share = parcelas[idx] || 0.15;
      const valorTotalBruto = Math.round((totalVendas * share) * 100) / 100;
      const valorCredito = Math.round((valorTotalBruto * 0.65) * 100) / 100;
      const valorDebito = Math.round((valorTotalBruto - valorCredito) * 100) / 100;

      const taxaMDREstimada = Math.round(((valorCredito * (adm.taxaMDRCreditoVista / 100)) + (valorDebito * (adm.taxaMDRDebito / 100))) * 100) / 100;
      const valorLiquidoReceber = Math.round((valorTotalBruto - taxaMDREstimada) * 100) / 100;
      const retencaoIRRF = Math.round((taxaMDREstimada * 0.015) * 100) / 100; // 1,5% s/ comissão

      resultado.push({
        id: Date.now() + idx,
        empresaId,
        competencia,
        administradoraId: adm.id,
        administradoraNome: adm.razaoSocial,
        cnpjAdministradora: adm.cnpj,
        valorCredito,
        valorDebito,
        valorTotalBruto,
        taxaMDREstimada,
        valorLiquidoReceber,
        retencaoIRRF,
        status: 'CONCILIADO'
      });
    });

    return resultado;
  }

  public integrarVendasCartaoContabil(empresaId: number, venda: VendaCartaoOperadora): { success: boolean; loteId: number } {
    const proximoNumLote = this.lotes.reduce((m, l) => Math.max(m, l.numero), 0) + 1;
    const loteId = Date.now();

    const lote: LoteContabil = {
      id: loteId,
      empresaId,
      numero: proximoNumLote,
      numeroLote: proximoNumLote,
      descricao: `Integração de Vendas com Cartões: ${venda.administradoraNome} (${venda.competencia})`,
      dataLote: `${venda.competencia}-28`,
      status: 'FECHADO',
      totalDebito: venda.valorTotalBruto,
      totalCredito: venda.valorTotalBruto
    };

    let partidaNum = this.lancamentos.length + 1;

    // 1. D: Administradora de Cartão a Receber (Ativo) -> R$ Líquido
    this.addLancamento({
      empresaId,
      numeroPartida: partidaNum++,
      loteId,
      dataLancamento: `${venda.competencia}-28`,
      tipoPartida: 'SIMPLES',
      contaDebitoId: 6, // Administradoras / Banco
      contaCreditoId: 44, // Receita de Vendas / Clientes
      valor: venda.valorLiquidoReceber,
      historicoId: 1,
      complementoHistorico: `Vendas com Cartão ${venda.administradoraNome} líq. repasse ref. ${venda.competencia}`
    });

    // 2. D: Despesas com Taxas de Cartão MDR (Resultado) -> Taxa Retida
    this.addLancamento({
      empresaId,
      numeroPartida: partidaNum++,
      loteId,
      dataLancamento: `${venda.competencia}-28`,
      tipoPartida: 'SIMPLES',
      contaDebitoId: 57, // Despesas Financeiras / Taxas MDR
      contaCreditoId: 44, // Receita Bruta
      valor: venda.taxaMDREstimada,
      historicoId: 2,
      complementoHistorico: `Taxa MDR retida s/ vendas de cartão ${venda.administradoraNome}`
    });

    venda.status = 'INTEGRADO';
    venda.dataIntegracao = new Date().toISOString();
    this.saveVendaCartao(venda);

    this.lotes.push(lote);
    this.persistSnapshot();
    this.registrarAuditoria('CONTABILIDADE', 'INTEGRACAO_CARTOES', `Vendas de cartão ${venda.administradoraNome} integradas no lote nº ${lote.numero}.`);

    return { success: true, loteId };
  }

  // ----------------------------------------------------
  // CONSOLIDAÇÃO DE DEMONSTRAÇÕES CONTÁBEIS (CPC 36 - MATRIZ & FILIAIS)
  // ----------------------------------------------------
  public gerarBalanceteConsolidado(empresaId: number): BalanceteConsolidadoLinha[] {
    const contasAnaliticas = this.contas.filter(c => c.empresaId === empresaId);

    return contasAnaliticas.map(c => {
      const saldoMatriz = c.saldoAtual !== undefined ? Math.abs(c.saldoAtual) : Math.abs(c.saldoAnterior || 0);
      // Simulação da Filial 01 (45% da Matriz conforme padrão do CPC 36 para grupo econômico)
      const saldoFiliais = Math.round((saldoMatriz * 0.45) * 100) / 100;

      // Eliminação de saldos intercompany (contas correntes entre filiais 1.01.03 ou 2.01.03)
      let eliminacoes = 0;
      if (c.classificacao.includes('03') || c.nome.toLowerCase().includes('intercompany') || c.nome.toLowerCase().includes('filial')) {
        eliminacoes = Math.round((saldoFiliais * 0.8) * 100) / 100;
      }

      const saldoConsolidado = Math.round((saldoMatriz + saldoFiliais - eliminacoes) * 100) / 100;

      return {
        classificacao: c.classificacao,
        nome: c.nome,
        grau: c.grau,
        tipo: c.tipo,
        saldoMatriz,
        saldoFiliais,
        eliminacoes,
        saldoConsolidado
      };
    });
  }

  public gerarDREConsolidada(empresaId: number): DREConsolidadaLinha[] {
    const balanceteConsolidado = this.gerarBalanceteConsolidado(empresaId);

    const calcGrupo = (prefix: string) => {
      const itens = balanceteConsolidado.filter(b => b.tipo === 'A' && b.classificacao.startsWith(prefix));
      const mat = itens.reduce((acc, i) => acc + i.saldoMatriz, 0);
      const fil = itens.reduce((acc, i) => acc + i.saldoFiliais, 0);
      const elim = itens.reduce((acc, i) => acc + i.eliminacoes, 0);
      return { mat, fil, elim, cons: mat + fil - elim };
    };

    const rec = calcGrupo('4.01') || calcGrupo('3.01');
    const ded = calcGrupo('4.02') || calcGrupo('3.02');
    const recLiq = { mat: rec.mat - ded.mat, fil: rec.fil - ded.fil, elim: 0, cons: rec.cons - ded.cons };
    const custos = calcGrupo('4.03') || calcGrupo('5.01');
    const lucroBruto = { mat: recLiq.mat - custos.mat, fil: recLiq.fil - custos.fil, elim: 0, cons: recLiq.cons - custos.cons };
    const desp = calcGrupo('5.02') || calcGrupo('5');
    const resultado = { mat: lucroBruto.mat - desp.mat, fil: lucroBruto.fil - desp.fil, elim: 0, cons: lucroBruto.cons - desp.cons };

    return [
      { descricao: '1. RECEITA OPERACIONAL BRUTA', valorMatriz: rec.mat, valorFiliais: rec.fil, eliminacoesIntercompany: rec.elim, valorConsolidado: rec.cons, isHeader: true },
      { descricao: '2. (-) DEDUÇÕES E TRIBUTOS SOBRE VENDAS', valorMatriz: ded.mat, valorFiliais: ded.fil, eliminacoesIntercompany: ded.elim, valorConsolidado: ded.cons },
      { descricao: '3. (=) RECEITA LÍQUIDA CONSOLIDADA', valorMatriz: recLiq.mat, valorFiliais: recLiq.fil, eliminacoesIntercompany: 0, valorConsolidado: recLiq.cons, isTotal: true },
      { descricao: '4. (-) CUSTOS DAS MERCADORIAS E SERVIÇOS', valorMatriz: custos.mat, valorFiliais: custos.fil, eliminacoesIntercompany: custos.elim, valorConsolidado: custos.cons },
      { descricao: '5. (=) RESULTADO OPERACIONAL BRUTO', valorMatriz: lucroBruto.mat, valorFiliais: lucroBruto.fil, eliminacoesIntercompany: 0, valorConsolidado: lucroBruto.cons, isTotal: true },
      { descricao: '6. (-) DESPESAS OPERACIONAIS E ADMINISTRATIVAS', valorMatriz: desp.mat, valorFiliais: desp.fil, eliminacoesIntercompany: desp.elim, valorConsolidado: desp.cons },
      { descricao: '7. (=) LUCRO LÍQUIDO CONSOLIDADO DO GRUPO (CPC 36)', valorMatriz: resultado.mat, valorFiliais: resultado.fil, eliminacoesIntercompany: 0, valorConsolidado: resultado.cons, isTotal: true }
    ];
  }

  // Rotina de Transporte de Saldos Anuais
  public executarTransporteSaldos(anoOrigem: number, anoDestino: number): { success: boolean; contasTransportadas: number } {
    let count = 0;
    for (const c of this.contas) {
      if (c.tipo === 'A' && (c.classificacao.startsWith('1') || c.classificacao.startsWith('2'))) {
        c.saldoAnterior = c.saldoAtual !== undefined ? c.saldoAtual : c.saldoAnterior;
        count++;
      }
    }
    const emp = this.getActiveEmpresa();
    emp.exercicioAtivo = anoDestino;
    emp.competenciaAtiva = `${anoDestino}-01`;
    this.saveEmpresa(emp);
    this.persistSnapshot();
    this.registrarAuditoria('ENCERRAMENTO', 'TRANSPORTE_SALDOS', `Transporte de saldos concluído de ${anoOrigem} para ${anoDestino}. (${count} contas atualizadas).`);
    return { success: true, contasTransportadas: count };
  }

  // ----------------------------------------------------
  // ROTINAS DE AUTO-CORREÇÃO DA AUDITORIA CONTÁBIL (AUTO-FIX)
  // ----------------------------------------------------
  public autoCorrigirContasSemSped(empresaId: number): { corrigidasCount: number } {
    let count = 0;
    for (const c of this.contas) {
      if (c.empresaId === empresaId && (!c.codigoReferencialRFB || !c.naturezaSped)) {
        if (c.classificacao.startsWith('1')) {
          c.naturezaSped = '01';
          c.codigoReferencialRFB = `1.01.01.${c.codigoReduzido.toString().padStart(4, '0')}`;
        } else if (c.classificacao.startsWith('2.03')) {
          c.naturezaSped = '03';
          c.codigoReferencialRFB = `2.03.01.${c.codigoReduzido.toString().padStart(4, '0')}`;
        } else if (c.classificacao.startsWith('2')) {
          c.naturezaSped = '02';
          c.codigoReferencialRFB = `2.01.01.${c.codigoReduzido.toString().padStart(4, '0')}`;
        } else if (c.classificacao.startsWith('3') || c.classificacao.startsWith('4')) {
          c.naturezaSped = '04';
          c.codigoReferencialRFB = `3.01.01.${c.codigoReduzido.toString().padStart(4, '0')}`;
        } else {
          c.naturezaSped = '05';
          c.codigoReferencialRFB = `5.01.01.${c.codigoReduzido.toString().padStart(4, '0')}`;
        }
        count++;
      }
    }
    this.persistSnapshot();
    this.registrarAuditoria('AUDITORIA', 'AUTO_CORRECAO_SPED', `Auto-correção aplicada em ${count} contas contábeis sem vínculo referencial da RFB.`);
    return { corrigidasCount: count };
  }

  public renumerarPartidasCronologicamente(empresaId: number): { renumeradasCount: number } {
    const lancs = this.lancamentos.filter(l => l.empresaId === empresaId);
    lancs.sort((a, b) => a.dataLancamento.localeCompare(b.dataLancamento) || a.numeroPartida - b.numeroPartida);

    let count = 0;
    lancs.forEach((l, idx) => {
      l.numeroPartida = idx + 1;
      count++;
    });

    this.persistSnapshot();
    this.registrarAuditoria('AUDITORIA', 'RENUMERACAO_PARTIDAS', `Renumeração cronológica realizada em ${count} partidas do Livro Diário.`);
    return { renumeradasCount: count };
  }

  public normalizarParticipantesFiscais(empresaId: number): { normalizadosCount: number } {
    let count = 0;
    for (const p of this.participantes) {
      if (p.empresaId === empresaId) {
        if (!p.codigoIbge || p.codigoIbge.trim().length !== 7) {
          p.codigoIbge = p.uf === 'RJ' ? '3304557' : p.uf === 'MG' ? '3106200' : p.uf === 'PR' ? '4106902' : '3550308';
          count++;
        }
        if (!p.indicadorIE) {
          p.indicadorIE = '1';
        }
      }
    }
    this.persistSnapshot();
    this.registrarAuditoria('AUDITORIA', 'NORMALIZACAO_PARTICIPANTES', `Cadastros fiscais de ${count} participantes normalizados para conformidade SPED Registro 0150.`);
    return { normalizadosCount: count };
  }

  // --------------------------------------------------------------------------
  // PROVISÕES MENSAIS DE FÉRIAS E 13º SALÁRIO (MAPA A4 / CPC)
  // --------------------------------------------------------------------------
  public getProvisoesFolhaResumo(empresaId?: number, competencia?: string): ProvisaoFolhaResumo {
    const empId = empresaId || this.activeEmpresaId;
    const comp = competencia || this.getActiveEmpresa().competenciaAtiva;
    const colabs = this.getColaboradores(empId).filter(c => c.status === 'ATIVO' && c.tipoVinculo === 'CLT');

    const itens: ProvisaoItemFolha[] = colabs.map((colab, idx) => {
      const sal = colab.salarioBase || 0;
      const provFerias = Math.round((sal / 12) * 100) / 100;
      const provTerco = Math.round((provFerias / 3) * 100) / 100;
      const totalFeriasColab = provFerias + provTerco;
      const fgtsFerias = Math.round((totalFeriasColab * 0.08) * 100) / 100;
      const inssFerias = Math.round((totalFeriasColab * 0.20) * 100) / 100;
      const totalGeralFerias = totalFeriasColab + fgtsFerias + inssFerias;

      const prov13o = Math.round((sal / 12) * 100) / 100;
      const fgts13o = Math.round((prov13o * 0.08) * 100) / 100;
      const inss13o = Math.round((prov13o * 0.20) * 100) / 100;
      const totalGeral13o = prov13o + fgts13o + inss13o;

      const totalMes = totalGeralFerias + totalGeral13o;

      return {
        id: idx + 1,
        colaboradorId: colab.id,
        colaboradorNome: colab.nome,
        colaboradorCargo: colab.cargo,
        dataAdmissao: colab.dataAdmissao,
        salarioBase: sal,
        mesesAquisitivosFerias: 10,
        mesesAquisitivos13o: 10,
        valorProvisaoFerias: provFerias,
        valorTercoConstitucional: provTerco,
        valorFGTSFerias: fgtsFerias,
        valorINSSPatronalFerias: inssFerias,
        totalProvisaoFerias: totalGeralFerias,
        valorProvisao13o: prov13o,
        valorFGTS13o: fgts13o,
        valorINSSPatronal13o: inss13o,
        totalProvisao13o: totalGeral13o,
        totalProvisaoMes: totalMes
      };
    });

    const totalFerias = itens.reduce((acc, i) => acc + i.valorProvisaoFerias, 0);
    const totalTerco = itens.reduce((acc, i) => acc + i.valorTercoConstitucional, 0);
    const totalFGTSFerias = itens.reduce((acc, i) => acc + i.valorFGTSFerias, 0);
    const totalINSSFerias = itens.reduce((acc, i) => acc + i.valorINSSPatronalFerias, 0);

    const total13o = itens.reduce((acc, i) => acc + i.valorProvisao13o, 0);
    const totalFGTS13o = itens.reduce((acc, i) => acc + i.valorFGTS13o, 0);
    const totalINSS13o = itens.reduce((acc, i) => acc + i.valorINSSPatronal13o, 0);

    const totalGeralProvisao = itens.reduce((acc, i) => acc + i.totalProvisaoMes, 0);

    const jaIntegrado = this.lancamentos.some(l =>
      l.empresaId === empId &&
      l.dataLancamento.startsWith(comp) &&
      l.complementoHistorico.toLowerCase().includes('provisão de 1/12')
    );

    return {
      competencia: comp,
      empresaId: empId,
      totalFerias,
      totalTerco,
      totalFGTSFerias,
      totalINSSFerias,
      total13o,
      totalFGTS13o,
      totalINSS13o,
      totalGeralProvisao,
      integradoContabil: jaIntegrado,
      dataIntegracao: jaIntegrado ? `${comp}-28` : undefined,
      itens
    };
  }

  // --------------------------------------------------------------------------
  // CENTRAL DE RETENÇÕES TRIBUTÁRIAS NA FONTE (IRRF / CSRF / INSS / ISS)
  // --------------------------------------------------------------------------
  public getGuiasRetencaoFonte(empresaId?: number, competencia?: string): GuiaRetencaoFonte[] {
    const empId = empresaId || this.activeEmpresaId;
    const comp = competencia || this.getActiveEmpresa().competenciaAtiva;
    const notas = this.getNotasFiscais(empId).filter(n => n.dataEmissao.startsWith(comp));

    const guias: GuiaRetencaoFonte[] = [];

    // 1. Serviços Tomados (Entradas) - Retenções a Recolher (Passivo)
    const notasEntrada = notas.filter(n => n.tipo === 'ENTRADA');

    // A) IRRF Tomados (Código 1708)
    const notasIRRFTomado = notasEntrada.filter(n => (n.retencaoIRRF || 0) > 0);
    const totalIRRFTomado = notasIRRFTomado.reduce((acc, n) => acc + (n.retencaoIRRF || 0), 0);
    const baseIRRFTomado = notasIRRFTomado.reduce((acc, n) => acc + n.valorTotal, 0);
    if (totalIRRFTomado > 0) {
      guias.push({
        id: 1,
        empresaId: empId,
        competencia: comp,
        codigoReceita: '1708',
        descricaoTributo: 'IRRF - Rendimentos de Serviços Profissionais PJ',
        tipoOperacao: 'TOMADO',
        baseCalculo: baseIRRFTomado,
        aliquota: 1.5,
        valorPrincipal: totalIRRFTomado,
        dataVencimento: `${comp.substring(0, 4)}-${String(Number(comp.substring(5, 7)) + 1).padStart(2, '0')}-20`,
        status: 'ABERTO',
        codigoBarrasDarf: '85830000001-9 70800012026-3 10202600170-8 00000000000-0',
        integradaContabil: false,
        detalhesNotas: notasIRRFTomado.map(n => ({
          notaId: n.id,
          numeroNota: n.numero,
          participanteNome: n.clienteFornecedorNome || 'Fornecedor',
          cnpjCpf: n.clienteFornecedorCnpj || '',
          valorNota: n.valorTotal,
          valorRetido: n.retencaoIRRF || 0
        }))
      });
    }

    // B) CSRF 4,65% Tomados (Código 5952)
    const notasCSRFTomado = notasEntrada.filter(n => (n.retencaoCSRF || 0) > 0);
    const totalCSRFTomado = notasCSRFTomado.reduce((acc, n) => acc + (n.retencaoCSRF || 0), 0);
    const baseCSRFTomado = notasCSRFTomado.reduce((acc, n) => acc + n.valorTotal, 0);
    if (totalCSRFTomado > 0) {
      guias.push({
        id: 2,
        empresaId: empId,
        competencia: comp,
        codigoReceita: '5952',
        descricaoTributo: 'CSRF - Retenção de Contribuições (PIS/COFINS/CSLL 4,65%)',
        tipoOperacao: 'TOMADO',
        baseCalculo: baseCSRFTomado,
        aliquota: 4.65,
        valorPrincipal: totalCSRFTomado,
        dataVencimento: `${comp.substring(0, 4)}-${String(Number(comp.substring(5, 7)) + 1).padStart(2, '0')}-20`,
        status: 'ABERTO',
        codigoBarrasDarf: '85830000005-9 52000012026-1 10202600595-2 00000000000-0',
        integradaContabil: false,
        detalhesNotas: notasCSRFTomado.map(n => ({
          notaId: n.id,
          numeroNota: n.numero,
          participanteNome: n.clienteFornecedorNome || 'Fornecedor',
          cnpjCpf: n.clienteFornecedorCnpj || '',
          valorNota: n.valorTotal,
          valorRetido: n.retencaoCSRF || 0
        }))
      });
    }

    // C) INSS Cessão de Mão de Obra Tomados (Código 2631)
    const notasINSSTomado = notasEntrada.filter(n => (n.retencaoINSS || 0) > 0);
    const totalINSSTomado = notasINSSTomado.reduce((acc, n) => acc + (n.retencaoINSS || 0), 0);
    const baseINSSTomado = notasINSSTomado.reduce((acc, n) => acc + n.valorTotal, 0);
    if (totalINSSTomado > 0) {
      guias.push({
        id: 3,
        empresaId: empId,
        competencia: comp,
        codigoReceita: '2631',
        descricaoTributo: 'INSS - Retenção 11% Cessão de Mão de Obra',
        tipoOperacao: 'TOMADO',
        baseCalculo: baseINSSTomado,
        aliquota: 11.0,
        valorPrincipal: totalINSSTomado,
        dataVencimento: `${comp.substring(0, 4)}-${String(Number(comp.substring(5, 7)) + 1).padStart(2, '0')}-20`,
        status: 'ABERTO',
        codigoBarrasDarf: '85830000002-6 31000012026-5 10202600263-1 00000000000-0',
        integradaContabil: false,
        detalhesNotas: notasINSSTomado.map(n => ({
          notaId: n.id,
          numeroNota: n.numero,
          participanteNome: n.clienteFornecedorNome || 'Fornecedor',
          cnpjCpf: n.clienteFornecedorCnpj || '',
          valorNota: n.valorTotal,
          valorRetido: n.retencaoINSS || 0
        }))
      });
    }

    // 2. Serviços Prestados (Saídas) - Retenções a Compensar no Ativo
    const notasSaida = notas.filter(n => n.tipo === 'SAIDA');
    const notasIRRFPrestado = notasSaida.filter(n => (n.retencaoIRRF || 0) > 0);
    const totalIRRFPrestado = notasIRRFPrestado.reduce((acc, n) => acc + (n.retencaoIRRF || 0), 0);
    const baseIRRFPrestado = notasIRRFPrestado.reduce((acc, n) => acc + n.valorTotal, 0);
    if (totalIRRFPrestado > 0) {
      guias.push({
        id: 4,
        empresaId: empId,
        competencia: comp,
        codigoReceita: 'IRRF_COMP',
        descricaoTributo: 'IRRF a Compensar na Fonte (Crédito Tributário - Serviços Próprios)',
        tipoOperacao: 'PRESTADO',
        baseCalculo: baseIRRFPrestado,
        aliquota: 1.5,
        valorPrincipal: totalIRRFPrestado,
        dataVencimento: `${comp.substring(0, 4)}-${String(Number(comp.substring(5, 7)) + 1).padStart(2, '0')}-20`,
        status: 'COMPENSADO',
        integradaContabil: true,
        detalhesNotas: notasIRRFPrestado.map(n => ({
          notaId: n.id,
          numeroNota: n.numero,
          participanteNome: n.clienteFornecedorNome || 'Cliente',
          cnpjCpf: n.clienteFornecedorCnpj || '',
          valorNota: n.valorTotal,
          valorRetido: n.retencaoIRRF || 0
        }))
      });
    }

    return guias;
  }

  public integrarRetencoesContabil(empresaId: number, competencia: string, guiaId: number): { success: boolean; loteId: number } {
    const guias = this.getGuiasRetencaoFonte(empresaId, competencia);
    const guia = guias.find(g => g.id === guiaId);
    if (!guia || guia.valorPrincipal <= 0) return { success: false, loteId: 0 };

    const proximoNumLote = this.lotes.reduce((m, l) => Math.max(m, l.numero), 0) + 1;
    const loteId = Date.now();
    const lote: LoteContabil = {
      id: loteId,
      empresaId,
      numero: proximoNumLote,
      numeroLote: proximoNumLote,
      descricao: `Retenção na Fonte ${guia.codigoReceita} - ${guia.descricaoTributo} Comp. ${competencia}`,
      dataLote: `${competencia}-28`,
      status: 'FECHADO',
      totalDebito: guia.valorPrincipal,
      totalCredito: guia.valorPrincipal
    };

    if (guia.tipoOperacao === 'TOMADO') {
      // D: Fornecedores Nacionais (conta 30) - Abatimento da retenção da duplicata
      // C: Impostos Retidos a Recolher (conta 27)
      this.addLancamento({
        empresaId,
        numeroPartida: this.lancamentos.length + 1,
        loteId,
        dataLancamento: `${competencia}-28`,
        tipoPartida: 'SIMPLES',
        contaDebitoId: 30,
        contaCreditoId: 27,
        valor: guia.valorPrincipal,
        historicoId: 2,
        complementoHistorico: `Retenção na fonte ${guia.codigoReceita} ref. notas fiscais de tomados da comp. ${competencia}`,
        usuarioNome: 'Central de Retenções'
      });
    } else {
      // D: Impostos a Recuperar/Compensar no Ativo (conta 12)
      // C: Clientes a Receber (conta 11)
      this.addLancamento({
        empresaId,
        numeroPartida: this.lancamentos.length + 1,
        loteId,
        dataLancamento: `${competencia}-28`,
        tipoPartida: 'SIMPLES',
        contaDebitoId: 12,
        contaCreditoId: 11,
        valor: guia.valorPrincipal,
        historicoId: 2,
        complementoHistorico: `Retenção sofrida na fonte ref. serviços prestados comp. ${competencia}`,
        usuarioNome: 'Central de Retenções'
      });
    }

    this.lotes.push(lote);
    this.persistSnapshot();
    this.registrarAuditoria('INTEGRAÇÃO_RETENÇÕES', 'PROCESSAMENTO', `Guia de retenção ${guia.codigoReceita} (R$ ${guia.valorPrincipal.toFixed(2)}) integrada com sucesso.`);

    return { success: true, loteId };
  }

  // --------------------------------------------------------------------------
  // DIFAL - DIFERENCIAL DE ALÍQUOTA & DESTDA (EC 87/2015 / LC 190/2022)
  // --------------------------------------------------------------------------
  public getResumoDifalCompetencia(empresaId?: number, competencia?: string): ResumoDifalCompetencia {
    const empId = empresaId || this.activeEmpresaId;
    const comp = competencia || this.getActiveEmpresa().competenciaAtiva;
    const emp = this.getEmpresas().find(e => e.id === empId) || this.getActiveEmpresa();

    // Notas de entrada interestaduais para Uso e Consumo ou Ativo
    const itens: ItemDifalApuracao[] = [
      {
        id: 1,
        notaFiscalId: 101,
        numeroNota: '4482',
        dataEmissao: `${comp}-05`,
        destinatarioRemetente: 'DELL COMPUTADORES DO BRASIL LTDA',
        cnpjCpf: '72.381.189/0001-10',
        ufOrigem: 'RS',
        ufDestino: emp.uf || 'SP',
        tipoOperacao: 'ENTRADA_ATIVO_IMOBILIZADO',
        cfop: '2.551',
        valorOperacao: 18500.00,
        baseCalculoICMS: 18500.00,
        aliquotaInterestadual: 12.0,
        aliquotaInternaDestino: 18.0,
        percentualDifal: 6.0,
        fundoCombatePobrezaPerc: 0.0,
        valorFCP: 0.0,
        valorDifal: 1110.00,
        valorTotalDevido: 1110.00,
        integradoContabil: false
      },
      {
        id: 2,
        notaFiscalId: 102,
        numeroNota: '9821',
        dataEmissao: `${comp}-14`,
        destinatarioRemetente: 'KALUNGA COMÉRCIO E INDÚSTRIA GRÁFICA LTDA',
        cnpjCpf: '43.283.811/0001-50',
        ufOrigem: 'MG',
        ufDestino: emp.uf || 'SP',
        tipoOperacao: 'ENTRADA_USO_CONSUMO',
        cfop: '2.556',
        valorOperacao: 4200.00,
        baseCalculoICMS: 4200.00,
        aliquotaInterestadual: 12.0,
        aliquotaInternaDestino: 18.0,
        percentualDifal: 6.0,
        fundoCombatePobrezaPerc: 0.0,
        valorFCP: 0.0,
        valorDifal: 252.00,
        valorTotalDevido: 252.00,
        integradoContabil: false
      },
      {
        id: 3,
        notaFiscalId: 103,
        numeroNota: '1209',
        dataEmissao: `${comp}-22`,
        destinatarioRemetente: 'TECH IMPORTAÇÃO E DISTRIBUIÇÃO ELETRÔNICOS S/A',
        cnpjCpf: '11.222.333/0001-99',
        ufOrigem: 'SC',
        ufDestino: emp.uf || 'SP',
        tipoOperacao: 'ENTRADA_USO_CONSUMO',
        cfop: '2.556',
        valorOperacao: 8900.00,
        baseCalculoICMS: 8900.00,
        aliquotaInterestadual: 4.0, // Alíquota Resolução SF 13/2012 para importados
        aliquotaInternaDestino: 18.0,
        percentualDifal: 14.0,
        fundoCombatePobrezaPerc: 1.0,
        valorFCP: 89.00,
        valorDifal: 1246.00,
        valorTotalDevido: 1335.00,
        integradoContabil: false
      }
    ];

    const totalBaseCalculo = itens.reduce((acc, i) => acc + i.baseCalculoICMS, 0);
    const totalDifalDevido = itens.reduce((acc, i) => acc + i.valorDifal, 0);
    const totalFCP = itens.reduce((acc, i) => acc + (i.valorFCP || 0), 0);
    const totalGeralGuia = totalDifalDevido + totalFCP;

    const jaIntegrado = this.lancamentos.some(l =>
      l.empresaId === empId &&
      l.dataLancamento.startsWith(comp) &&
      l.complementoHistorico.toLowerCase().includes('diferencial de alíquota icms')
    );

    return {
      competencia: comp,
      empresaId: empId,
      totalOperacoes: itens.length,
      totalBaseCalculo,
      totalDifalDevido,
      totalFCP,
      totalGeralGuia,
      status: jaIntegrado ? 'INTEGRADO' : 'APURADO',
      codigoReceitaGNRE: '10008-0',
      linhaDigitavelGNRE: '85830000002-7 69700012026-9 10202600100-0 80000000000-0',
      itens
    };
  }

  public integrarDifalContabil(empresaId: number, competencia: string): { success: boolean; loteId: number; total: number } {
    const resumo = this.getResumoDifalCompetencia(empresaId, competencia);
    if (resumo.totalGeralGuia <= 0) return { success: false, loteId: 0, total: 0 };

    const proximoNumLote = this.lotes.reduce((m, l) => Math.max(m, l.numero), 0) + 1;
    const loteId = Date.now();
    const lote: LoteContabil = {
      id: loteId,
      empresaId,
      numero: proximoNumLote,
      numeroLote: proximoNumLote,
      descricao: `ICMS Diferencial de Alíquota (DIFAL / GNRE) Comp. ${competencia}`,
      dataLote: `${competencia}-28`,
      status: 'FECHADO',
      totalDebito: resumo.totalGeralGuia,
      totalCredito: resumo.totalGeralGuia
    };

    // D: Despesas Tributárias / ICMS Diferencial de Alíquota (conta 58)
    // C: ICMS a Recolher (conta 27)
    this.addLancamento({
      empresaId,
      numeroPartida: this.lancamentos.length + 1,
      loteId,
      dataLancamento: `${competencia}-28`,
      tipoPartida: 'SIMPLES',
      contaDebitoId: 58,
      contaCreditoId: 27,
      valor: resumo.totalGeralGuia,
      historicoId: 2,
      complementoHistorico: `Diferencial de Alíquota ICMS (DIFAL EC 87/15) s/ compras interestaduais de uso/ativo comp. ${competencia}`,
      usuarioNome: 'Módulo Fiscal DIFAL'
    });

    this.lotes.push(lote);
    this.persistSnapshot();
    this.registrarAuditoria('INTEGRAÇÃO_DIFAL', 'PROCESSAMENTO', `DIFAL de ${competencia} integrado com sucesso: R$ ${resumo.totalGeralGuia.toFixed(2)} no lote nº ${lote.numero}.`);

    return { success: true, loteId, total: resumo.totalGeralGuia };
  }

  // --------------------------------------------------------------------------
  // APURAÇÃO TRIMESTRAL IRPJ / CSLL (LUCRO PRESUMIDO - LEI 9.249/95)
  // --------------------------------------------------------------------------
  public getApuracaoTrimestralIRPJCSLL(empresaId?: number, ano?: number, trimestre?: 1 | 2 | 3 | 4): ApuracaoTrimestralIRPJCSLL {
    const empId = empresaId || this.activeEmpresaId;
    const anoRef = ano || 2026;
    const tri = trimestre || 3; // Padrão 3º Trimestre (Jul a Set) ou 4º

    const descricoes = {
      1: `1º Trimestre / ${anoRef} (Janeiro a Março)`,
      2: `2º Trimestre / ${anoRef} (Abril a Junho)`,
      3: `3º Trimestre / ${anoRef} (Julho a Setembro)`,
      4: `4º Trimestre / ${anoRef} (Outubro a Dezembro)`
    };

    // Receita de Serviços do Trimestre
    const recComercio = 45000.00;
    const recServicos = 245000.00;
    const totalRec = recComercio + recServicos;

    // Presunções IRPJ: 8% Comércio + 32% Serviços
    const basePresIRPJCom = Math.round((recComercio * 0.08) * 100) / 100;
    const basePresIRPJSrv = Math.round((recServicos * 0.32) * 100) / 100;
    const baseTotalIRPJ = basePresIRPJCom + basePresIRPJSrv;

    const irpjNormal = Math.round((baseTotalIRPJ * 0.15) * 100) / 100;
    const limiteTrimestre = 60000.00; // R$ 20.000 por mês
    const excedente = Math.max(0, baseTotalIRPJ - limiteTrimestre);
    const adicionalIRPJ = Math.round((excedente * 0.10) * 100) / 100;
    const totalIRPJ = irpjNormal + adicionalIRPJ;
    const irrfRetido = 3675.00; // Retenções na fonte sofridas no trimestre
    const liqIRPJ = Math.max(0, totalIRPJ - irrfRetido);

    // Presunções CSLL: 12% Comércio + 32% Serviços
    const basePresCSLLCom = Math.round((recComercio * 0.12) * 100) / 100;
    const basePresCSLLSrv = Math.round((recServicos * 0.32) * 100) / 100;
    const baseTotalCSLL = basePresCSLLCom + basePresCSLLSrv;
    const totalCSLL = Math.round((baseTotalCSLL * 0.09) * 100) / 100;
    const csrfRetido = 2450.00; // CSLL retida na fonte 1%
    const liqCSLL = Math.max(0, totalCSLL - csrfRetido);

    const mesFim = tri === 1 ? '03' : tri === 2 ? '06' : tri === 3 ? '09' : '12';
    const mesVenc1 = tri === 1 ? '04' : tri === 2 ? '07' : tri === 3 ? '10' : '01';
    const anoVenc = tri === 4 ? anoRef + 1 : anoRef;

    const jaIntegrado = this.lancamentos.some(l =>
      l.empresaId === empId &&
      l.complementoHistorico.toLowerCase().includes(`irpj lucro presumido ${tri}º tri`)
    );

    return {
      id: tri,
      empresaId: empId,
      ano: anoRef,
      trimestre: tri,
      periodoDescricao: descricoes[tri],
      receitaBrutaComercio: recComercio,
      receitaBrutaServicos: recServicos,
      totalReceitaBruta: totalRec,
      basePresumidaIRPJComercio: basePresIRPJCom,
      basePresumidaIRPJServicos: basePresIRPJSrv,
      baseCalculoTotalIRPJ: baseTotalIRPJ,
      aliquotaNormalIRPJ: 15.0,
      valorIRPJNormal: irpjNormal,
      limiteTrimestralAdicional: limiteTrimestre,
      baseExcedenteAdicional: excedente,
      valorAdicionalIRPJ: adicionalIRPJ,
      totalIRPJDevido: totalIRPJ,
      irrfRetidoDedutivel: irrfRetido,
      valorLiquidoIRPJARecolher: liqIRPJ,
      codigoReceitaDARFIRPJ: '2089',
      basePresumidaCSLLComercio: basePresCSLLCom,
      basePresumidaCSLLServicos: basePresCSLLSrv,
      baseCalculoTotalCSLL: baseTotalCSLL,
      aliquotaCSLL: 9.0,
      totalCSLLDevido: totalCSLL,
      csrfRetidoDedutivel: csrfRetido,
      valorLiquidoCSLLARecolher: liqCSLL,
      codigoReceitaDARFCSLL: '2372',
      optouQuotas: false,
      quantidadeQuotas: 1,
      dataVencimentoQuota1: `${anoVenc}-${mesVenc1}-30`,
      integradoContabil: jaIntegrado,
      dataIntegracao: jaIntegrado ? `${anoRef}-${mesFim}-30` : undefined
    };
  }

  public integrarApuracaoTrimestralContabil(empresaId: number, apuracaoId: number): { success: boolean; loteId: number } {
    const apuracao = this.getApuracaoTrimestralIRPJCSLL(empresaId, 2026, apuracaoId as 1 | 2 | 3 | 4);
    if (!apuracao) return { success: false, loteId: 0 };

    const proximoNumLote = this.lotes.reduce((m, l) => Math.max(m, l.numero), 0) + 1;
    const loteId = Date.now();
    const totalGeral = apuracao.valorLiquidoIRPJARecolher + apuracao.valorLiquidoCSLLARecolher;

    const lote: LoteContabil = {
      id: loteId,
      empresaId,
      numero: proximoNumLote,
      numeroLote: proximoNumLote,
      descricao: `Provisão Trimestral IRPJ e CSLL - ${apuracao.periodoDescricao}`,
      dataLote: `${apuracao.ano}-09-30`,
      status: 'FECHADO',
      totalDebito: totalGeral,
      totalCredito: totalGeral
    };

    // 1. Provisão de IRPJ (D: Despesas Tributárias Resultado conta 58, C: IRPJ a Recolher Passivo conta 27)
    this.addLancamento({
      empresaId,
      numeroPartida: this.lancamentos.length + 1,
      loteId,
      dataLancamento: `${apuracao.ano}-09-30`,
      tipoPartida: 'SIMPLES',
      contaDebitoId: 58,
      contaCreditoId: 27,
      valor: apuracao.valorLiquidoIRPJARecolher,
      historicoId: 2,
      complementoHistorico: `Provisão IRPJ Lucro Presumido ${apuracao.trimestre}º Tri/${apuracao.ano} Cód 2089`,
      usuarioNome: 'Apuração IRPJ/CSLL'
    });

    // 2. Provisão de CSLL (D: Despesas Tributárias Resultado conta 58, C: CSLL a Recolher Passivo conta 27)
    this.addLancamento({
      empresaId,
      numeroPartida: this.lancamentos.length + 1,
      loteId,
      dataLancamento: `${apuracao.ano}-09-30`,
      tipoPartida: 'SIMPLES',
      contaDebitoId: 58,
      contaCreditoId: 27,
      valor: apuracao.valorLiquidoCSLLARecolher,
      historicoId: 2,
      complementoHistorico: `Provisão CSLL Lucro Presumido ${apuracao.trimestre}º Tri/${apuracao.ano} Cód 2372`,
      usuarioNome: 'Apuração IRPJ/CSLL'
    });

    this.lotes.push(lote);
    this.persistSnapshot();
    this.registrarAuditoria('INTEGRAÇÃO_TRIMESTRAL_IRPJ_CSLL', 'PROCESSAMENTO', `Apuração ${apuracao.periodoDescricao} integrada: IRPJ R$ ${apuracao.valorLiquidoIRPJARecolher.toFixed(2)}, CSLL R$ ${apuracao.valorLiquidoCSLLARecolher.toFixed(2)}.`);

    return { success: true, loteId };
  }

  // --------------------------------------------------------------------------
  // LALUR & LACS (LIVRO ELETRÔNICO DE APURAÇÃO DO LUCRO REAL - SPED ECF BLOCO M)
  // --------------------------------------------------------------------------
  public getContasParteBLalur(empresaId?: number): ContaParteBLalur[] {
    const empId = empresaId || this.activeEmpresaId;
    return this.contasParteBLalur.filter(c => c.empresaId === empId);
  }

  public saveContaParteBLalur(conta: ContaParteBLalur): void {
    const idx = this.contasParteBLalur.findIndex(c => c.id === conta.id);
    if (idx >= 0) {
      this.contasParteBLalur[idx] = conta;
    } else {
      conta.id = Date.now();
      this.contasParteBLalur.push(conta);
    }
    this.persistSnapshot();
  }

  public deleteContaParteBLalur(id: number): void {
    this.contasParteBLalur = this.contasParteBLalur.filter(c => c.id !== id);
    this.persistSnapshot();
  }

  public getLancamentosParteA(empresaId?: number, periodo?: string): LancamentoLalurParteA[] {
    const empId = empresaId || this.activeEmpresaId;
    let list = this.lancamentosParteA.filter(l => l.empresaId === empId);
    if (periodo) {
      list = list.filter(l => l.periodo === periodo);
    }
    return list;
  }

  public saveLancamentoParteA(lanc: LancamentoLalurParteA): void {
    const idx = this.lancamentosParteA.findIndex(l => l.id === lanc.id);
    if (idx >= 0) {
      this.lancamentosParteA[idx] = lanc;
    } else {
      lanc.id = Date.now();
      this.lancamentosParteA.push(lanc);
    }
    this.persistSnapshot();
  }

  public deleteLancamentoParteA(id: number): void {
    this.lancamentosParteA = this.lancamentosParteA.filter(l => l.id !== id);
    this.persistSnapshot();
  }

  public getApuracaoLucroRealLalur(empresaId?: number, ano?: number, periodo?: string): ApuracaoLucroRealLalur {
    const empId = empresaId || this.activeEmpresaId;
    const anoRef = ano || 2026;
    const per = periodo || `${anoRef}-1T`;

    // 1. Lucro Líquido Contábil antes dos tributos (Base DRE)
    const lucroLiquidoAntesTributos = 385000.00;

    // 2. Adições e Exclusões da Parte A
    const lancamentos = this.getLancamentosParteA(empId, per);
    const adicoes = lancamentos.filter(l => l.tipo === 'ADICAO');
    const exclusoes = lancamentos.filter(l => l.tipo === 'EXCLUSAO');

    // Totais IRPJ
    const totalAdicoesIRPJ = adicoes
      .filter(l => l.tributo === 'IRPJ' || l.tributo === 'AMBOS')
      .reduce((sum, l) => sum + l.valor, 0);
    const totalExclusoesIRPJ = exclusoes
      .filter(l => l.tributo === 'IRPJ' || l.tributo === 'AMBOS')
      .reduce((sum, l) => sum + l.valor, 0);

    const lucroRealAntesCompensacao = Math.max(0, lucroLiquidoAntesTributos + totalAdicoesIRPJ - totalExclusoesIRPJ);

    // 3. Compensação de Prejuízo Fiscal (Trava Legal de 30% - Art. 42 da Lei 8.981/95)
    const limiteCompensacaoPrejuizo = Math.round((lucroRealAntesCompensacao * 0.30) * 100) / 100;
    const contaPF = this.contasParteBLalur.find(c => c.empresaId === empId && c.tipoConta === 'PREJUIZO_FISCAL');
    const saldoPFDisponivel = contaPF ? contaPF.saldoAtual : 0;
    const prejuizoFiscalCompensado = Math.min(limiteCompensacaoPrejuizo, saldoPFDisponivel);

    const lucroRealApurado = Math.max(0, lucroRealAntesCompensacao - prejuizoFiscalCompensado);

    // 4. IRPJ: 15% Normal + 10% Adicional s/ parcela > R$ 60.000,00 trimestral
    const aliquotaIRPJNormal = 15.0;
    const valorIRPJNormal = Math.round((lucroRealApurado * (aliquotaIRPJNormal / 100)) * 100) / 100;
    const limiteTrimestralAdicional = 60000.00;
    const baseExcedenteAdicional = Math.max(0, lucroRealApurado - limiteTrimestralAdicional);
    const aliquotaAdicionalIRPJ = 10.0;
    const valorAdicionalIRPJ = Math.round((baseExcedenteAdicional * (aliquotaAdicionalIRPJ / 100)) * 100) / 100;
    const totalIRPJDevido = valorIRPJNormal + valorAdicionalIRPJ;

    const irrfRetidoDedutivel = 3850.00;
    const incentivosFiscaisDedutiveis = 1500.00; // PAT / Lei Rouanet
    const estimativasPagasIRPJ = 0.00;
    const valorLiquidoIRPJARecolher = Math.max(0, totalIRPJDevido - irrfRetidoDedutivel - incentivosFiscaisDedutiveis - estimativasPagasIRPJ);

    // 5. LACS - CSLL
    const totalAdicoesCSLL = adicoes
      .filter(l => l.tributo === 'CSLL' || l.tributo === 'AMBOS')
      .reduce((sum, l) => sum + l.valor, 0);
    const totalExclusoesCSLL = exclusoes
      .filter(l => l.tributo === 'CSLL' || l.tributo === 'AMBOS')
      .reduce((sum, l) => sum + l.valor, 0);

    const baseCalculoCSLLAntesCompensacao = Math.max(0, lucroLiquidoAntesTributos + totalAdicoesCSLL - totalExclusoesCSLL);
    const limiteCompensacaoBaseNegativa = Math.round((baseCalculoCSLLAntesCompensacao * 0.30) * 100) / 100;
    const contaBN = this.contasParteBLalur.find(c => c.empresaId === empId && c.tipoConta === 'BASE_NEGATIVA');
    const saldoBNDisponivel = contaBN ? contaBN.saldoAtual : 0;
    const baseNegativaCSLLCompensada = Math.min(limiteCompensacaoBaseNegativa, saldoBNDisponivel);
    const baseCalculoFinalCSLL = Math.max(0, baseCalculoCSLLAntesCompensacao - baseNegativaCSLLCompensada);

    const aliquotaCSLL = 9.0;
    const totalCSLLDevido = Math.round((baseCalculoFinalCSLL * (aliquotaCSLL / 100)) * 100) / 100;
    const csrfRetidoDedutivel = 2450.00;
    const estimativasPagasCSLL = 0.00;
    const valorLiquidoCSLLARecolher = Math.max(0, totalCSLLDevido - csrfRetidoDedutivel - estimativasPagasCSLL);

    const jaIntegrado = this.lancamentos.some(l =>
      l.empresaId === empId &&
      l.complementoHistorico.toLowerCase().includes(`irpj lucro real ${per.toLowerCase()}`)
    );

    return {
      id: 1,
      empresaId: empId,
      ano: anoRef,
      periodo: per,
      dataApuracao: `${anoRef}-03-31`,
      lucroLiquidoAntesTributos,
      totalAdicoesIRPJ,
      totalExclusoesIRPJ,
      lucroRealAntesCompensacao,
      limiteCompensacaoPrejuizo,
      prejuizoFiscalCompensado,
      lucroRealApurado,
      aliquotaIRPJNormal,
      valorIRPJNormal,
      limiteTrimestralAdicional,
      baseExcedenteAdicional,
      aliquotaAdicionalIRPJ,
      valorAdicionalIRPJ,
      totalIRPJDevido,
      irrfRetidoDedutivel,
      incentivosFiscaisDedutiveis,
      estimativasPagasIRPJ,
      valorLiquidoIRPJARecolher,
      codigoReceitaDARFIRPJ: '2432',
      totalAdicoesCSLL,
      totalExclusoesCSLL,
      baseCalculoCSLLAntesCompensacao,
      limiteCompensacaoBaseNegativa,
      baseNegativaCSLLCompensada,
      baseCalculoFinalCSLL,
      aliquotaCSLL,
      totalCSLLDevido,
      csrfRetidoDedutivel,
      estimativasPagasCSLL,
      valorLiquidoCSLLARecolher,
      codigoReceitaDARFCSLL: '6012',
      adicoesDetalhes: adicoes,
      exclusoesDetalhes: exclusoes,
      integradoContabil: jaIntegrado,
      dataIntegracao: jaIntegrado ? `${anoRef}-03-31` : undefined
    };
  }

  public integrarApuracaoLucroRealContabil(empresaId: number, apuracaoPeriodo: string): { success: boolean; loteId: number } {
    const apuracao = this.getApuracaoLucroRealLalur(empresaId, 2026, apuracaoPeriodo);
    if (!apuracao) return { success: false, loteId: 0 };

    const proximoNumLote = this.lotes.reduce((m, l) => Math.max(m, l.numero), 0) + 1;
    const loteId = Date.now();
    const totalGeral = apuracao.valorLiquidoIRPJARecolher + apuracao.valorLiquidoCSLLARecolher;

    const lote: LoteContabil = {
      id: loteId,
      empresaId,
      numero: proximoNumLote,
      numeroLote: proximoNumLote,
      descricao: `Provisão de IRPJ e CSLL - Lucro Real Lalur/Lacs ${apuracao.periodo}`,
      dataLote: apuracao.dataApuracao,
      status: 'FECHADO',
      totalDebito: totalGeral,
      totalCredito: totalGeral
    };

    // 1. Partida de IRPJ (D: Despesas Tributárias Resultado conta 58, C: IRPJ a Recolher Passivo conta 27)
    this.addLancamento({
      empresaId,
      numeroPartida: this.lancamentos.length + 1,
      loteId,
      dataLancamento: apuracao.dataApuracao,
      tipoPartida: 'SIMPLES',
      contaDebitoId: 58,
      contaCreditoId: 27,
      valor: apuracao.valorLiquidoIRPJARecolher,
      historicoId: 2,
      complementoHistorico: `Provisão IRPJ Lucro Real ${apuracao.periodo} DARF 2432`,
      usuarioNome: 'Lalur/Lacs Engine'
    });

    // 2. Partida de CSLL (D: Despesas Tributárias Resultado conta 58, C: CSLL a Recolher Passivo conta 27)
    this.addLancamento({
      empresaId,
      numeroPartida: this.lancamentos.length + 1,
      loteId,
      dataLancamento: apuracao.dataApuracao,
      tipoPartida: 'SIMPLES',
      contaDebitoId: 58,
      contaCreditoId: 27,
      valor: apuracao.valorLiquidoCSLLARecolher,
      historicoId: 2,
      complementoHistorico: `Provisão CSLL Lucro Real ${apuracao.periodo} DARF 6012`,
      usuarioNome: 'Lalur/Lacs Engine'
    });

    // 3. Atualizar saldo de Prejuízo Fiscal e Base Negativa na Parte B caso compensado
    if (apuracao.prejuizoFiscalCompensado > 0) {
      const contaPF = this.contasParteBLalur.find(c => c.empresaId === empresaId && c.tipoConta === 'PREJUIZO_FISCAL');
      if (contaPF) {
        contaPF.saldoAtual = Math.max(0, contaPF.saldoAtual - apuracao.prejuizoFiscalCompensado);
      }
    }
    if (apuracao.baseNegativaCSLLCompensada > 0) {
      const contaBN = this.contasParteBLalur.find(c => c.empresaId === empresaId && c.tipoConta === 'BASE_NEGATIVA');
      if (contaBN) {
        contaBN.saldoAtual = Math.max(0, contaBN.saldoAtual - apuracao.baseNegativaCSLLCompensada);
      }
    }

    this.lotes.push(lote);
    this.persistSnapshot();
    this.registrarAuditoria('INTEGRAÇÃO_LALUR_LUCRO_REAL', 'PROCESSAMENTO', `Apuração Lalur/Lacs ${apuracao.periodo} integrada: IRPJ R$ ${apuracao.valorLiquidoIRPJARecolher.toFixed(2)}, CSLL R$ ${apuracao.valorLiquidoCSLLARecolher.toFixed(2)}.`);

    return { success: true, loteId };
  }

  // --------------------------------------------------------------------------
  // EFD-REINF (ESCRITURAÇÃO FISCAL DIGITAL DE RETENÇÕES E OUTRAS INFORMAÇÕES FISCAIS)
  // --------------------------------------------------------------------------
  public getResumoReinfCompetencia(empresaId?: number, competencia?: string): ResumoReinfCompetencia {
    const empId = empresaId || this.activeEmpresaId;
    const comp = competencia || '2026-10';

    let eventos = this.eventosReinf.filter(e => e.empresaId === empId && e.competencia === comp);
    if (eventos.length === 0) {
      // Se ainda não existirem para a competência, gerar a partir dos seeds
      eventos = SEED_EVENTOS_REINF.map(e => ({ ...e, empresaId: empId, competencia: comp }));
      this.eventosReinf.push(...eventos);
      this.persistSnapshot();
    }

    const r1000 = eventos.filter(e => e.tipoEvento === 'R-1000').length;
    const r2010 = eventos.filter(e => e.tipoEvento === 'R-2010').length;
    const r4020 = eventos.filter(e => e.tipoEvento === 'R-4020').length;

    const totalINSS = eventos
      .filter(e => e.tipoEvento === 'R-2010')
      .reduce((sum, e) => sum + (e.detalhes.totalRetencao || 0), 0);
    const totalIRRF = eventos
      .filter(e => e.tipoEvento === 'R-4020')
      .reduce((sum, e) => sum + (e.detalhes.totalRetencao ? e.detalhes.totalRetencao * 0.2439 : 0), 0); // ~1.5% de 6.15%
    const totalCSRF = eventos
      .filter(e => e.tipoEvento === 'R-4020')
      .reduce((sum, e) => sum + (e.detalhes.totalRetencao ? e.detalhes.totalRetencao * 0.7561 : 0), 0); // ~4.65% de 6.15%

    const todosTransmitidos = eventos.every(e => e.status === 'TRANSMITIDO');

    return {
      competencia: comp,
      empresaId: empId,
      totalEventos: eventos.length,
      eventosR1000: r1000,
      eventosR2010: r2010,
      eventosR4020: r4020,
      totalRetencaoINSS: Math.round(totalINSS * 100) / 100,
      totalRetencaoIRRF: Math.round(totalIRRF * 100) / 100,
      totalRetencaoCSRF: Math.round(totalCSRF * 100) / 100,
      totalGeralRetencoes: Math.round((totalINSS + totalIRRF + totalCSRF) * 100) / 100,
      statusGeral: todosTransmitidos ? 'TRANSMITIDO' : 'PRONTO',
      eventos
    };
  }

  public gerarXmlEventoReinf(empresaId: number, tipo: 'R-1000' | 'R-2010' | 'R-4020', competencia: string): EventoReinf {
    const empresa = this.getEmpresa(empresaId) || this.empresas[0];
    const cnpjNumeros = (empresa.cnpj || '12345678000195').replace(/\D/g, '');
    const idUnico = Date.now();

    let xml = '';
    let detalhes: any = {};
    let nomeEvento = '';

    if (tipo === 'R-1000') {
      nomeEvento = 'Informações do Contribuinte';
      detalhes = { totalBaseCalculo: 0, totalRetencao: 0 };
      xml = `<?xml version="1.0" encoding="UTF-8"?>
<Reinf xmlns="http://www.reinf.esocial.gov.br/schemas/evtInfoContribuinte/v2_01_02">
  <evtInfoContri id="ID1${cnpjNumeros.padEnd(14, '0')}${idUnico.toString().slice(-5)}">
    <ideEvento>
      <tpAmb>1</tpAmb>
      <procEmi>1</procEmi>
      <verProc>ContabilStudioPro_2026.1</verProc>
    </ideEvento>
    <ideContri>
      <tpInsc>1</tpInsc>
      <nrInsc>${cnpjNumeros}</nrInsc>
    </ideContri>
    <infoContri>
      <inclusao>
        <idePeriodo>
          <iniValid>${competencia}</iniValid>
        </idePeriodo>
        <infoCadastro>
          <classTrib>${empresa.regimeTributario === 'SIMPLES_NACIONAL' ? '01' : '99'}</classTrib>
          <indEscrituracao>1</indEscrituracao>
          <indDesoneracao>0</indDesoneracao>
          <indAcordoIsenMulta>0</indAcordoIsenMulta>
          <contato>
            <nmCtt>${empresa.responsavelLegal || 'Administrador Responsável'}</nmCtt>
            <cpfCtt>${(empresa.cpfResponsavel || '12345678901').replace(/\D/g, '')}</cpfCtt>
            <foneFixo>${(empresa.telefone || '1133334444').replace(/\D/g, '')}</foneFixo>
            <email>${empresa.email || 'fiscal@empresa.com.br'}</email>
          </contato>
          <softwareHouse>
            <cnpjSoftHouse>11222333000144</cnpjSoftHouse>
            <nmRazao>AMILLABS TECNOLOGIA CONTABIL LTDA</nmRazao>
            <nmCont>Suporte Técnico Especializado</nmCont>
            <email>suporte@amillabs.com.br</email>
          </softwareHouse>
        </infoCadastro>
      </inclusao>
    </infoContri>
  </evtInfoContri>
</Reinf>`;
    } else if (tipo === 'R-2010') {
      nomeEvento = 'Retenção Contribuição Previdenciária - Serviços Tomados';
      const base = 32000.00;
      const inss = 3520.00;
      detalhes = {
        totalBaseCalculo: base,
        totalRetencao: inss,
        codigoReceita: '2631',
        prestadorTomador: 'SEGURANÇA E VIGILÂNCIA PATRIMONIAL LTDA',
        cnpjCpf: '22.333.444/0001-55'
      };
      xml = `<?xml version="1.0" encoding="UTF-8"?>
<Reinf xmlns="http://www.reinf.esocial.gov.br/schemas/evtTomadorServicos/v2_01_02">
  <evtServTom id="ID2${cnpjNumeros.padEnd(14, '0')}${idUnico.toString().slice(-5)}">
    <ideEvento>
      <perApur>${competencia}</perApur>
      <tpAmb>1</tpAmb>
      <procEmi>1</procEmi>
      <verProc>ContabilStudioPro_2026.1</verProc>
    </ideEvento>
    <ideContri>
      <tpInsc>1</tpInsc>
      <nrInsc>${cnpjNumeros}</nrInsc>
    </ideContri>
    <infoServTom>
      <ideEstabObra>
        <tpInscEstab>1</tpInscEstab>
        <nrInscEstab>${cnpjNumeros}</nrInscEstab>
        <idePrestServ>
          <cnpjPrestador>22333444000155</cnpjPrestador>
          <vlrTotalBruto>${base.toFixed(2)}</vlrTotalBruto>
          <vlrTotalBaseRet>${base.toFixed(2)}</vlrTotalBaseRet>
          <vlrTotalRetPrinc>${inss.toFixed(2)}</vlrTotalRetPrinc>
          <nfs>
            <serie>1</serie>
            <numDocto>4520</numDocto>
            <dtEmisNF>${competencia}-05</dtEmisNF>
            <vlrBruto>${base.toFixed(2)}</vlrBruto>
            <infoTpServ>
              <tpServ>100000001</tpServ>
              <vlrBaseRet>${base.toFixed(2)}</vlrBaseRet>
              <vlrRetencao>${inss.toFixed(2)}</vlrRetencao>
            </infoTpServ>
          </nfs>
        </idePrestServ>
      </ideEstabObra>
    </infoServTom>
  </evtServTom>
</Reinf>`;
    } else {
      nomeEvento = 'Retenções na Fonte - Pagamentos a PJ (IRRF / CSRF)';
      const base = 12800.00;
      const irrf = 192.00;
      const csrf = 595.20;
      detalhes = {
        totalBaseCalculo: base,
        totalRetencao: irrf + csrf,
        codigoReceita: '1708 / 5952',
        prestadorTomador: 'AMAZON WEB SERVICES BRASIL LTDA',
        cnpjCpf: '15.419.093/0001-44',
        naturezaRendimento: '13007 - Serviços de Assessoria Técnica Especializada'
      };
      xml = `<?xml version="1.0" encoding="UTF-8"?>
<Reinf xmlns="http://www.reinf.esocial.gov.br/schemas/evtRetencaoPJ/v2_01_02">
  <evtRetPJ id="ID4${cnpjNumeros.padEnd(14, '0')}${idUnico.toString().slice(-5)}">
    <ideEvento>
      <perApur>${competencia}</perApur>
      <tpAmb>1</tpAmb>
      <procEmi>1</procEmi>
      <verProc>ContabilStudioPro_2026.1</verProc>
    </ideEvento>
    <ideContri>
      <tpInsc>1</tpInsc>
      <nrInsc>${cnpjNumeros}</nrInsc>
    </ideContri>
    <ideEstab>
      <tpInsc>1</tpInsc>
      <nrInsc>${cnpjNumeros}</nrInsc>
      <ideBenef>
        <cnpjBenef>15419093000144</cnpjBenef>
        <idePgto>
          <natRend>13007</natRend>
          <observacao>Serviços de Assessoria Técnica e Nuvem</observacao>
          <infoPgto>
            <dtFG>${competencia}-08</dtFG>
            <vlrBruto>${base.toFixed(2)}</vlrBruto>
            <retencoes>
              <vlrIR>${irrf.toFixed(2)}</vlrIR>
              <vlrCSLL>128.00</vlrCSLL>
              <vlrCofins>384.00</vlrCofins>
              <vlrPP>83.20</vlrPP>
              <vlrAgreg>${csrf.toFixed(2)}</vlrAgreg>
            </retencoes>
          </infoPgto>
        </idePgto>
      </ideBenef>
    </ideEstab>
  </evtRetPJ>
</Reinf>`;
    }

    const novoEvento: EventoReinf = {
      id: idUnico,
      empresaId,
      tipoEvento: tipo,
      nomeEvento,
      competencia,
      status: 'VALIDADO',
      dataGeracao: new Date().toISOString().replace('T', ' ').slice(0, 19),
      xmlContent: xml,
      detalhes
    };

    this.eventosReinf.push(novoEvento);
    this.persistSnapshot();
    return novoEvento;
  }

  public transmitirEventosReinf(empresaId: number, competencia: string, eventoIds?: number[]): { success: boolean; recibos: { eventoId: number; recibo: string }[] } {
    const eventos = this.eventosReinf.filter(e =>
      e.empresaId === empresaId &&
      e.competencia === competencia &&
      (!eventoIds || eventoIds.includes(e.id))
    );

    const agora = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const recibos: { eventoId: number; recibo: string }[] = [];

    eventos.forEach((evt, idx) => {
      const protocoloRandom = Math.floor(100000 + Math.random() * 900000);
      const recibo = `1.${competencia.replace('-', '')}.${protocoloRandom}-${(idx + 1).toString().padStart(2, '0')}`;
      evt.status = 'TRANSMITIDO';
      evt.numeroRecibo = recibo;
      evt.dataTransmissao = agora;
      recibos.push({ eventoId: evt.id, recibo });
    });

    this.persistSnapshot();
    this.registrarAuditoria('TRANSMISSAO_EFD_REINF', 'COMUNICACAO', `Transmitidos ${eventos.length} eventos da EFD-Reinf ref. ${competencia} com sucesso.`);
    return { success: true, recibos };
  }

  // --------------------------------------------------------------------------
  // NFS-e NACIONAL / ABRASF & FATURAMENTO DE SERVIÇOS
  // --------------------------------------------------------------------------
  public getNfseEmitidas(empresaId?: number, competencia?: string): NfseEmissao[] {
    const empId = empresaId || this.activeEmpresaId;
    let list = this.nfseEmitidas.filter(n => n.empresaId === empId);
    if (competencia) {
      list = list.filter(n => n.competencia === competencia);
    }
    return list;
  }

  public emitirNfseDPS(empresaId: number, dados: Partial<NfseEmissao>): NfseEmissao {
    const emp = this.getEmpresa(empresaId) || this.empresas[0];
    const proximoDPS = this.nfseEmitidas.reduce((m, n) => Math.max(m, n.numeroDPS), 100) + 1;
    const agora = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const comp = dados.competencia || emp.competenciaAtiva || '2026-10';

    const vlrServ = dados.valorServicos || 5000.00;
    const aliqISS = dados.aliquotaISS || 5.0;
    const vlrISS = Math.round((vlrServ * (aliqISS / 100)) * 100) / 100;
    const retIRRF = dados.retencaoIRRF !== undefined ? dados.retencaoIRRF : Math.round((vlrServ * 0.015) * 100) / 100;
    const retPIS = dados.retencaoPIS !== undefined ? dados.retencaoPIS : Math.round((vlrServ * 0.0065) * 100) / 100;
    const retCOFINS = dados.retencaoCOFINS !== undefined ? dados.retencaoCOFINS : Math.round((vlrServ * 0.030) * 100) / 100;
    const retCSLL = dados.retencaoCSLL !== undefined ? dados.retencaoCSLL : Math.round((vlrServ * 0.010) * 100) / 100;
    const retINSS = dados.retencaoINSS || 0;
    const totalRet = retIRRF + retPIS + retCOFINS + retCSLL + retINSS;
    const vlrLiquido = vlrServ - totalRet;

    const hashRandom = Math.random().toString(36).substring(2, 6).toUpperCase();
    const hashRandom2 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const codigoVerificacao = `${hashRandom}-${hashRandom2}-2026`;
    const numNfse = `2026${proximoDPS.toString().padStart(10, '0')}`;

    const xmlDPS = `<?xml version="1.0" encoding="UTF-8"?>
<DPS xmlns="http://www.sped.fazenda.gov.br/nfse" versao="1.00">
  <infDPS Id="DPS${emp.cnpj.replace(/\D/g, '')}${proximoDPS}">
    <tpAmb>1</tpAmb>
    <dhEmi>${agora}</dhEmi>
    <verAplic>ContabilStudioPro_2026.1</verAplic>
    <dCompet>${comp}-01</dCompet>
    <prest>
      <CNPJ>${emp.cnpj.replace(/\D/g, '')}</CNPJ>
      <xNome>${emp.razaoSocial}</xNome>
    </prest>
    <toma>
      <CNPJ>${(dados.tomadorCnpjCpf || '11222333000181').replace(/\D/g, '')}</CNPJ>
      <xNome>${dados.tomadorRazaoSocial || 'CLIENTE TOMADOR'}</xNome>
      <end>
        <xLgr>${dados.tomadorEndereco || 'Av. Paulista'}</xLgr>
        <xMun>${dados.tomadorCidade || 'São Paulo'}</xMun>
        <UF>${dados.tomadorUf || 'SP'}</UF>
      </end>
    </toma>
    <serv>
      <cTribNac>${dados.codigoTributacaoNacional || '17.19.01'}</cTribNac>
      <cLocIncid>${dados.tomadorCodigoIbge || '3550308'}</cLocIncid>
      <xDescServ>${dados.discriminacaoServico || 'Honorários Contábeis'}</xDescServ>
    </serv>
    <valores>
      <vServPrest>${vlrServ.toFixed(2)}</vServPrest>
      <vISS>${vlrISS.toFixed(2)}</vISS>
      <vIR>${retIRRF.toFixed(2)}</vIR>
      <vCSLL>${retCSLL.toFixed(2)}</vCSLL>
      <vPIS>${retPIS.toFixed(2)}</vPIS>
      <vCOFINS>${retCOFINS.toFixed(2)}</vCOFINS>
      <vLiq>${vlrLiquido.toFixed(2)}</vLiq>
    </valores>
  </infDPS>
</DPS>`;

    const novaNfse: NfseEmissao = {
      id: Date.now(),
      empresaId,
      numeroDPS: proximoDPS,
      serieDPS: '1',
      numeroNfse: numNfse,
      codigoVerificacao,
      dataEmissao: agora,
      competencia: comp,
      tomadorId: dados.tomadorId,
      tomadorRazaoSocial: dados.tomadorRazaoSocial || 'CLIENTE TOMADOR S/A',
      tomadorCnpjCpf: dados.tomadorCnpjCpf || '11.222.333/0001-81',
      tomadorEmail: dados.tomadorEmail || 'financeiro@cliente.com.br',
      tomadorEndereco: dados.tomadorEndereco || 'Av. Paulista, 1000',
      tomadorCidade: dados.tomadorCidade || 'São Paulo',
      tomadorUf: dados.tomadorUf || 'SP',
      tomadorCodigoIbge: dados.tomadorCodigoIbge || '3550308',
      itemLc116: dados.itemLc116 || '17.19 - Contabilidade, consultoria tributária e auditoria',
      codigoTributacaoNacional: dados.codigoTributacaoNacional || '17.19.01',
      discriminacaoServico: dados.discriminacaoServico || 'Honorários contábeis e assessoria fiscal.',
      valorServicos: vlrServ,
      valorDeducoes: 0,
      baseCalculoISS: vlrServ,
      aliquotaISS: aliqISS,
      valorISS: vlrISS,
      issRetido: dados.issRetido || false,
      retencaoIRRF: retIRRF,
      retencaoPIS: retPIS,
      retencaoCOFINS: retCOFINS,
      retencaoCSLL: retCSLL,
      retencaoINSS: retINSS,
      valorTotalRetencoes: totalRet,
      valorLiquidoNfse: vlrLiquido,
      status: 'EMITIDA',
      faturaHonorarioId: dados.faturaHonorarioId,
      xmlNfse: xmlDPS,
      integradaFiscal: false,
      integradaContabil: false
    };

    this.nfseEmitidas.unshift(novaNfse);
    this.persistSnapshot();
    this.registrarAuditoria('EMISSAO_NFSE_NACIONAL', 'INCLUSAO', `NFS-e Nº ${numNfse} emitida para ${novaNfse.tomadorRazaoSocial} no valor de R$ ${vlrServ.toFixed(2)}.`);

    return novaNfse;
  }

  public cancelarNfse(id: number, motivo: string): boolean {
    const nfse = this.nfseEmitidas.find(n => n.id === id);
    if (!nfse) return false;
    nfse.status = 'CANCELADA';
    this.persistSnapshot();
    this.registrarAuditoria('CANCELAMENTO_NFSE', 'EXCLUSAO', `NFS-e Nº ${nfse.numeroNfse} cancelada. Motivo: ${motivo}`);
    return true;
  }

  public integrarNfseFiscalContabil(id: number): { success: boolean; notaId: number; loteId: number } {
    const nfse = this.nfseEmitidas.find(n => n.id === id);
    if (!nfse || nfse.status !== 'EMITIDA') return { success: false, notaId: 0, loteId: 0 };

    // 1. Escriturar na Escrita Fiscal (EFNOTA)
    const proximaNotaNum = this.notasFiscais.length + 1;
    const notaFiscalId = Date.now();
    const nota: NotaFiscal = {
      id: notaFiscalId,
      empresaId: nfse.empresaId,
      numero: nfse.numeroDPS,
      serie: nfse.serieDPS,
      modelo: 'NFS-e',
      chaveAcesso: `35${nfse.competencia.replace('-', '')}${nfse.tomadorCnpjCpf.replace(/\D/g, '')}00000000000000000000`,
      dataEmissao: nfse.dataEmissao.split(' ')[0],
      dataEntradaSaida: nfse.dataEmissao.split(' ')[0],
      tipo: 'SAIDA',
      acumuladorId: 3,
      cfop: '5.933',
      clienteFornecedorNome: nfse.tomadorRazaoSocial,
      clienteFornecedorCnpj: nfse.tomadorCnpjCpf,
      valorTotal: nfse.valorServicos,
      baseCalculoICMS: 0,
      valorICMS: 0,
      baseCalculoPIS: nfse.valorServicos,
      valorPIS: nfse.retencaoPIS,
      baseCalculoCOFINS: nfse.valorServicos,
      valorCOFINS: nfse.retencaoCOFINS,
      baseCalculoISS: nfse.baseCalculoISS,
      valorISS: nfse.valorISS,
      retencaoIRRF: nfse.retencaoIRRF,
      retencaoCSRF: nfse.retencaoPIS + nfse.retencaoCOFINS + nfse.retencaoCSLL,
      integradaContabil: true,
      itens: [
        {
          id: Date.now() + 1,
          numeroItem: 1,
          codigoProduto: 'SRV-CONTAB',
          descricao: nfse.discriminacaoServico,
          ncm: '00000000',
          cfop: '5.933',
          unidade: 'UN',
          quantidade: 1,
          valorUnitario: nfse.valorServicos,
          valorTotal: nfse.valorServicos
        }
      ]
    };
    this.notasFiscais.push(nota);

    // 2. Integrar na Contabilidade (Diário Geral)
    const proximoNumLote = this.lotes.reduce((m, l) => Math.max(m, l.numero), 0) + 1;
    const loteId = Date.now() + 2;

    const lote: LoteContabil = {
      id: loteId,
      empresaId: nfse.empresaId,
      numero: proximoNumLote,
      numeroLote: proximoNumLote,
      descricao: `Faturamento e Emissão NFS-e Nº ${nfse.numeroDPS} - ${nfse.tomadorRazaoSocial}`,
      dataLote: nfse.dataEmissao.split(' ')[0],
      status: 'FECHADO',
      totalDebito: nfse.valorServicos,
      totalCredito: nfse.valorServicos
    };

    // Partida 1: D - Clientes a Receber (Ativo conta 6), C - Receita de Serviços (Resultado conta 41)
    this.addLancamento({
      empresaId: nfse.empresaId,
      numeroPartida: this.lancamentos.length + 1,
      loteId,
      dataLancamento: nfse.dataEmissao.split(' ')[0],
      tipoPartida: 'SIMPLES',
      contaDebitoId: 6,
      contaCreditoId: 41,
      valor: nfse.valorServicos,
      historicoId: 1,
      complementoHistorico: `Vlr ref. emissão NFS-e Nº ${nfse.numeroDPS} s/ prestação de serviços a ${nfse.tomadorRazaoSocial}`,
      usuarioNome: 'NFS-e Faturamento'
    });

    this.lotes.push(lote);
    nfse.integradaFiscal = true;
    nfse.integradaContabil = true;
    this.persistSnapshot();
    this.registrarAuditoria('INTEGRAÇÃO_NFSE_FISCAL_CONTABIL', 'PROCESSAMENTO', `NFS-e Nº ${nfse.numeroDPS} escriturada no fiscal e contabilizada com sucesso.`);

    return { success: true, notaId: notaFiscalId, loteId };
  }

  // ----------------------------------------------------
  // CIAP - CONTROLE DE CRÉDITO DE ICMS DO ATIVO PERMANENTE (SPED FISCAL BLOCO G / LC 87/96)
  // ----------------------------------------------------
  public getItensCiap(empresaId?: number): ItemCiap[] {
    if (empresaId) {
      return this.itensCiap.filter(i => i.empresaId === empresaId);
    }
    return this.itensCiap;
  }

  public saveItemCiap(item: Partial<ItemCiap> & { empresaId: number; codigoBem: string; descricaoBem: string }): ItemCiap {
    const totalParcelas = item.totalParcelas || 48;
    const valorICMS = Number(item.valorICMSOriginal || 0);
    const parcelaMes = Number((valorICMS / totalParcelas).toFixed(2));
    const parcelaAtual = item.parcelaAtual || 1;
    const saldoRemanescente = item.saldoICMSRemanescente !== undefined
      ? item.saldoICMSRemanescente
      : Number((valorICMS - ((parcelaAtual - 1) * parcelaMes)).toFixed(2));

    let itemSalvo: ItemCiap;
    if (item.id && item.id > 0) {
      const idx = this.itensCiap.findIndex(i => i.id === item.id);
      if (idx >= 0) {
        this.itensCiap[idx] = {
          ...this.itensCiap[idx],
          ...item,
          totalParcelas,
          parcelaMesICMS: parcelaMes,
          saldoICMSRemanescente: saldoRemanescente,
          status: item.status || (parcelaAtual > totalParcelas ? 'CONCLUIDO' : 'ATIVO')
        };
        itemSalvo = this.itensCiap[idx];
      } else {
        itemSalvo = {
          id: item.id,
          empresaId: item.empresaId,
          codigoBem: item.codigoBem,
          descricaoBem: item.descricaoBem,
          dataEntrada: item.dataEntrada || new Date().toISOString().split('T')[0],
          numeroNotaFiscal: item.numeroNotaFiscal || '1',
          serieNotaFiscal: item.serieNotaFiscal || '1',
          fornecedorNome: item.fornecedorNome || 'FORNECEDOR DIVERSOS',
          fornecedorCnpj: item.fornecedorCnpj || '00.000.000/0001-00',
          valorTotalBem: Number(item.valorTotalBem || 0),
          valorICMSOriginal: valorICMS,
          parcelaAtual,
          totalParcelas,
          parcelaMesICMS: parcelaMes,
          saldoICMSRemanescente: saldoRemanescente,
          status: item.status || 'ATIVO'
        };
        this.itensCiap.push(itemSalvo);
      }
    } else {
      const novoId = this.itensCiap.length > 0 ? Math.max(...this.itensCiap.map(i => i.id)) + 1 : 1;
      itemSalvo = {
        id: novoId,
        empresaId: item.empresaId,
        codigoBem: item.codigoBem,
        descricaoBem: item.descricaoBem,
        dataEntrada: item.dataEntrada || new Date().toISOString().split('T')[0],
        numeroNotaFiscal: item.numeroNotaFiscal || '1',
        serieNotaFiscal: item.serieNotaFiscal || '1',
        fornecedorNome: item.fornecedorNome || 'FORNECEDOR DIVERSOS',
        fornecedorCnpj: item.fornecedorCnpj || '00.000.000/0001-00',
        valorTotalBem: Number(item.valorTotalBem || 0),
        valorICMSOriginal: valorICMS,
        parcelaAtual,
        totalParcelas,
        parcelaMesICMS: parcelaMes,
        saldoICMSRemanescente: saldoRemanescente,
        status: 'ATIVO'
      };
      this.itensCiap.push(itemSalvo);
    }

    this.persistSnapshot();
    this.registrarAuditoria('CADASTRO_CIAP', 'INCLUSAO', `Bem CIAP ${itemSalvo.codigoBem} - ${itemSalvo.descricaoBem} registrado/atualizado.`);
    return itemSalvo;
  }

  public getApuracaoCiapCompetencia(empresaId: number, competencia: string): ApuracaoCiapCompetencia {
    const saidas = this.notasFiscais.filter(n => n.empresaId === empresaId && n.tipo === 'SAIDA' && n.dataEmissao.startsWith(competencia));

    let totalSaidasGerais = saidas.reduce((acc, n) => acc + (n.valorTotal || 0), 0);
    let totalSaidasTributadas = saidas.reduce((acc, n) => acc + (n.baseCalculoICMS || 0), 0);

    if (totalSaidasGerais === 0) {
      totalSaidasGerais = 485200.00;
      totalSaidasTributadas = 412420.00;
    }

    const fatorApropriacao = totalSaidasGerais > 0
      ? Number((totalSaidasTributadas / totalSaidasGerais).toFixed(4))
      : 0.8500;

    const bensAtivos = this.itensCiap.filter(i => i.empresaId === empresaId && i.status === 'ATIVO');

    const itensCalculados: ItemCiapCalculado[] = bensAtivos.map(item => {
      const creditoMes = Number((item.parcelaMesICMS * fatorApropriacao).toFixed(2));
      const saldoApos = Number(Math.max(0, item.saldoICMSRemanescente - creditoMes).toFixed(2));
      return {
        ...item,
        fatorApropriacao,
        creditoApropriadoMes: creditoMes,
        saldoAposApropriacao: saldoApos
      };
    });

    const totalCreditoApropriadoMes = Number(itensCalculados.reduce((acc, i) => acc + i.creditoApropriadoMes, 0).toFixed(2));
    const totalSaldoRemanescente = Number(itensCalculados.reduce((acc, i) => acc + i.saldoAposApropriacao, 0).toFixed(2));

    return {
      id: Date.now(),
      competencia,
      empresaId,
      totalSaidasTributadas,
      totalSaidasGerais,
      fatorApropriacao,
      totalCreditoApropriadoMes,
      totalSaldoRemanescente,
      itens: itensCalculados,
      integradoFiscal: false,
      integradoContabil: false
    };
  }

  public integrarCiapFiscalContabil(empresaId: number, competencia: string): { success: boolean; loteId: number; totalCredito: number } {
    const apuracao = this.getApuracaoCiapCompetencia(empresaId, competencia);
    if (apuracao.totalCreditoApropriadoMes <= 0) {
      return { success: false, loteId: 0, totalCredito: 0 };
    }

    this.itensCiap.forEach(item => {
      if (item.empresaId === empresaId && item.status === 'ATIVO') {
        const calc = apuracao.itens.find(c => c.id === item.id);
        if (calc) {
          item.parcelaAtual += 1;
          item.saldoICMSRemanescente = calc.saldoAposApropriacao;
          if (item.parcelaAtual > item.totalParcelas || item.saldoICMSRemanescente <= 0) {
            item.status = 'CONCLUIDO';
          }
        }
      }
    });

    const apFiscal = this.apuracoesFiscais.find(a => a.empresaId === empresaId && a.competencia === competencia);
    if (apFiscal) {
      apFiscal.valorICMSApurado = Number(Math.max(0, (apFiscal.valorICMSApurado || 0) - apuracao.totalCreditoApropriadoMes).toFixed(2));
    }

    const proximoNumLote = this.lotes.reduce((m, l) => Math.max(m, l.numero), 0) + 1;
    const loteId = Date.now();

    const lote: LoteContabil = {
      id: loteId,
      empresaId,
      numero: proximoNumLote,
      numeroLote: proximoNumLote,
      descricao: `Apropriação Mensal ICMS Ativo Permanente (CIAP 1/48 - Bloco G) - Comp. ${competencia}`,
      dataLote: `${competencia}-28`,
      status: 'FECHADO',
      totalDebito: apuracao.totalCreditoApropriadoMes,
      totalCredito: apuracao.totalCreditoApropriadoMes
    };

    this.addLancamento({
      empresaId,
      numeroPartida: this.lancamentos.length + 1,
      loteId,
      dataLancamento: `${competencia}-28`,
      tipoPartida: 'SIMPLES',
      contaDebitoId: 16,
      contaCreditoId: 19,
      valor: apuracao.totalCreditoApropriadoMes,
      historicoId: 1,
      complementoHistorico: `Apropriação parcela CIAP 1/48 avos conf. Art. 20 §5º LC 87/96 (Fator: ${(apuracao.fatorApropriacao * 100).toFixed(2)}%) - Comp. ${competencia}`,
      usuarioNome: 'CIAP Bloco G'
    });

    this.lotes.push(lote);
    this.persistSnapshot();
    this.registrarAuditoria('INTEGRACAO_CIAP', 'PROCESSAMENTO', `Apropriação CIAP Comp. ${competencia} integrada no valor de R$ ${apuracao.totalCreditoApropriadoMes.toFixed(2)}.`);

    return { success: true, loteId, totalCredito: apuracao.totalCreditoApropriadoMes };
  }

  // ----------------------------------------------------
  // eSocial - EVENTOS PERIÓDICOS EM XML (S-1200 / S-1210)
  // ----------------------------------------------------
  public getEventosESocial(empresaId?: number, competencia?: string): EventoESocial[] {
    let list = this.eventosESocial;
    if (empresaId) {
      list = list.filter(e => e.empresaId === empresaId);
    }
    if (competencia) {
      list = list.filter(e => e.competencia === competencia);
    }
    return list;
  }

  public getResumoESocialCompetencia(empresaId: number, competencia: string): ResumoESocialCompetencia {
    const eventos = this.getEventosESocial(empresaId, competencia);
    const colaboradores = this.colaboradores.filter(c => c.empresaId === empresaId && c.status === 'ATIVO');

    const folha = this.folhasMensais.filter(f => f.empresaId === empresaId && f.competencia === competencia);
    const folhaBrutaTotal = Number(folha.reduce((acc, f) => acc + (f.totalProventos || 0), 0).toFixed(2)) || 14850.00;
    const inssTotalSegurados = Number(folha.reduce((acc, f) => acc + (f.inssSegurado || 0), 0).toFixed(2)) || 1324.50;
    const inssTotalPatronal = Number((folhaBrutaTotal * 0.288).toFixed(2));
    const fgtsTotal = Number(folha.reduce((acc, f) => acc + ((f.baseFGTS ? f.baseFGTS * 0.08 : 0) || 0), 0).toFixed(2)) || 1188.00;

    const todosTransmitidos = eventos.length > 0 && eventos.every(e => e.status === 'TRANSMITIDO');

    return {
      competencia,
      empresaId,
      totalColaboradores: colaboradores.length,
      totalEventosS1200: eventos.filter(e => e.tipoEvento === 'S-1200').length,
      totalEventosS1210: eventos.filter(e => e.tipoEvento === 'S-1210').length,
      folhaBrutaTotal,
      inssTotalSegurados,
      inssTotalPatronal,
      fgtsTotal,
      statusGeral: todosTransmitidos ? 'TRANSMITIDO' : (eventos.length > 0 ? 'PRONTO' : 'PENDENTE'),
      eventos
    };
  }

  public gerarXmlESocial(empresaId: number, tipo: 'S-1200' | 'S-1210', colaboradorId: number, competencia: string): EventoESocial {
    const colab = this.colaboradores.find(c => c.id === colaboradorId) || this.colaboradores[0];
    const empresa = this.empresas.find(e => e.id === empresaId) || this.empresas[0];
    const folha = this.folhasMensais.find(f => f.colaboradorId === colaboradorId && f.competencia === competencia);

    const baseBruta: number = (folha && folha.totalProventos) ? folha.totalProventos : (colab && colab.salarioBase ? colab.salarioBase : 4500.00);
    const baseINSS: number = baseBruta;
    const baseFGTS: number = baseBruta;
    const inss: number = (folha && folha.inssSegurado) ? folha.inssSegurado : Number((baseBruta * 0.09).toFixed(2));
    const baseIRRF: number = Number(Math.max(0, baseBruta - inss).toFixed(2));
    const valorLiquido: number = (folha && folha.salarioLiquido) ? folha.salarioLiquido : Number((baseBruta - inss).toFixed(2));

    const idEvento = `ID1${empresa.cnpj.replace(/\D/g, '')}${new Date().getFullYear()}${String(Date.now()).slice(-8)}`;

    let xml = '';
    if (tipo === 'S-1200') {
      xml = `<?xml version="1.0" encoding="UTF-8"?>
<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtRemun/v_S_01_02_00">
  <evtRemun Id="${idEvento}">
    <ideEvento>
      <indRetif>1</indRetif>
      <perApur>${competencia}</perApur>
      <tpAmb>1</tpAmb>
      <procEmi>1</procEmi>
      <verProc>AntigravityERP_v2.0</verProc>
    </ideEvento>
    <ideEmpregador>
      <tpInsc>1</tpInsc>
      <nrInsc>${empresa.cnpj.replace(/\D/g, '')}</nrInsc>
    </ideEmpregador>
    <ideTrabalhador>
      <cpfTrab>${colab.cpf.replace(/\D/g, '')}</cpfTrab>
      <infoComplem>
        <nmTrab>${colab.nome.toUpperCase()}</nmTrab>
        <dtNascto>${colab.dataNascimento || '1990-01-01'}</dtNascto>
      </infoComplem>
    </ideTrabalhador>
    <dmDev>
      <ideDmDev>DMDEV_${colab.id}_${competencia.replace('-', '')}</ideDmDev>
      <codCateg>${colab.categoriaeSocial || '101'}</codCateg>
      <infoPerApur>
        <ideEstabLot>
          <tpInsc>1</tpInsc>
          <nrInsc>${empresa.cnpj.replace(/\D/g, '')}</nrInsc>
          <codLotacao>01</codLotacao>
          <remunPerApur>
            <matricula>${String(colab.matricula)}</matricula>
            <itensRemun>
              <codRubr>1000</codRubr>
              <ideTabRubr>TAB01</ideTabRubr>
              <qtdRubr>30.00</qtdRubr>
              <vrRubr>${baseBruta.toFixed(2)}</vrRubr>
              <indApurIR>0</indApurIR>
            </itensRemun>
            <itensRemun>
              <codRubr>2000</codRubr>
              <ideTabRubr>TAB01</ideTabRubr>
              <vrRubr>${inss.toFixed(2)}</vrRubr>
              <indApurIR>0</indApurIR>
            </itensRemun>
          </remunPerApur>
        </ideEstabLot>
      </infoPerApur>
    </dmDev>
  </evtRemun>
</eSocial>`;
    } else {
      xml = `<?xml version="1.0" encoding="UTF-8"?>
<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtPgtos/v_S_01_02_00">
  <evtPgtos Id="${idEvento}">
    <ideEvento>
      <indRetif>1</indRetif>
      <perApur>${competencia}</perApur>
      <tpAmb>1</tpAmb>
      <procEmi>1</procEmi>
      <verProc>AntigravityERP_v2.0</verProc>
    </ideEvento>
    <ideEmpregador>
      <tpInsc>1</tpInsc>
      <nrInsc>${empresa.cnpj.replace(/\D/g, '')}</nrInsc>
    </ideEmpregador>
    <ideBenef>
      <cpfBenef>${colab.cpf.replace(/\D/g, '')}</cpfBenef>
      <infoPgto>
        <dtPgto>${competencia}-05</dtPgto>
        <tpPgto>1</tpPgto>
        <perRef>${competencia}</perRef>
        <ideDmDev>DMDEV_${colab.id}_${competencia.replace('-', '')}</ideDmDev>
        <vrLiq>${valorLiquido.toFixed(2)}</vrLiq>
      </infoPgto>
    </ideBenef>
  </evtPgtos>
</eSocial>`;
    }

    const novoEvento: EventoESocial = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      empresaId,
      tipoEvento: tipo,
      nomeEvento: tipo === 'S-1200' ? `Remuneração do Trabalhador - ${colab.nome}` : `Pagamentos de Rendimentos - ${colab.nome}`,
      colaboradorId: colab.id,
      colaboradorNome: colab.nome,
      colaboradorCpf: colab.cpf,
      matricula: String(colab.matricula),
      competencia,
      dataGeracao: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'PRONTO',
      xmlContent: xml,
      bases: {
        baseINSS,
        baseFGTS,
        baseIRRF,
        valorLiquido
      }
    };

    this.eventosESocial = this.eventosESocial.filter(e => !(e.empresaId === empresaId && e.tipoEvento === tipo && e.colaboradorId === colaboradorId && e.competencia === competencia));
    this.eventosESocial.push(novoEvento);
    this.persistSnapshot();
    this.registrarAuditoria('GERACAO_XML_ESOCIAL', 'INCLUSAO', `Evento ${tipo} gerado para ${colab.nome} ref. ${competencia}.`);

    return novoEvento;
  }

  public transmitirEventosESocial(empresaId: number, competencia: string): { success: boolean; recibos: { eventoId: number; recibo: string }[] } {
    const eventos = this.eventosESocial.filter(e => e.empresaId === empresaId && e.competencia === competencia);
    if (eventos.length === 0) {
      return { success: false, recibos: [] };
    }

    const timestamp = Date.now();
    const recibosGerados: { eventoId: number; recibo: string }[] = [];

    eventos.forEach((ev, idx) => {
      ev.status = 'TRANSMITIDO';
      ev.dataTransmissao = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const nrRecibo = `1.2.${competencia.replace('-', '')}.${String(timestamp).slice(-10)}${String(idx + 1).padStart(4, '0')}-9`;
      ev.numeroRecibo = nrRecibo;
      recibosGerados.push({ eventoId: ev.id, recibo: nrRecibo });
    });

    this.persistSnapshot();
    this.registrarAuditoria('TRANSMISSAO_ESOCIAL', 'PROCESSAMENTO', `${eventos.length} eventos do eSocial transmitidos com sucesso para a competência ${competencia}.`);
    return { success: true, recibos: recibosGerados };
  }

  // ----------------------------------------------------
  // RAZÃO AUXILIAR DE CLIENTES & FORNECEDORES (CONCILIAÇÃO FISCAL-FINANCEIRA-CONTÁBIL)
  // ----------------------------------------------------
  public getRazaoAuxiliar(empresaId: number, tipoParticipante?: 'CLIENTE' | 'FORNECEDOR', participanteId?: number): RazaoAuxiliarItem[] {
    const itens: RazaoAuxiliarItem[] = [];

    let idContador = 1;
    let saldoAcumulado = 0;

    this.notasFiscais.forEach(nf => {
      if (nf.empresaId !== empresaId) return;

      const part = this.participantes.find(p => p.cnpjCpf === nf.clienteFornecedorCnpj || p.nomeRazaoSocial === nf.clienteFornecedorNome);
      if (participanteId && (!part || part.id !== participanteId)) return;

      if (nf.tipo === 'SAIDA' && (!tipoParticipante || tipoParticipante === 'CLIENTE')) {
        saldoAcumulado += nf.valorTotal;
        itens.push({
          id: idContador++,
          empresaId,
          participanteId: part ? part.id : 0,
          participanteNome: nf.clienteFornecedorNome || (part ? part.nomeRazaoSocial : 'CLIENTE DIVERSO'),
          participanteCnpjCpf: nf.clienteFornecedorCnpj || (part ? part.cnpjCpf : '00.000.000/0000-00'),
          tipoParticipante: 'CLIENTE',
          data: nf.dataEmissao,
          documento: `NF-e ${nf.numero} S:${nf.serie}`,
          historico: `Emissão NF-e Saída s/ venda mercadoria/serviço`,
          debito: nf.valorTotal,
          credito: 0,
          saldoProgressivo: Number(saldoAcumulado.toFixed(2)),
          statusConciliacao: nf.integradaContabil ? 'CONCILIADO' : 'PENDENTE_CONTABIL',
          notaFiscalId: nf.id
        });
      } else if (nf.tipo === 'ENTRADA' && (!tipoParticipante || tipoParticipante === 'FORNECEDOR')) {
        saldoAcumulado += nf.valorTotal;
        itens.push({
          id: idContador++,
          empresaId,
          participanteId: part ? part.id : 0,
          participanteNome: nf.clienteFornecedorNome || (part ? part.nomeRazaoSocial : 'FORNECEDOR DIVERSO'),
          participanteCnpjCpf: nf.clienteFornecedorCnpj || (part ? part.cnpjCpf : '00.000.000/0000-00'),
          tipoParticipante: 'FORNECEDOR',
          data: nf.dataEntradaSaida || nf.dataEmissao,
          documento: `NF-e ${nf.numero} S:${nf.serie}`,
          historico: `Aquisição / Entrada de produtos / serviços fornecedor`,
          debito: 0,
          credito: nf.valorTotal,
          saldoProgressivo: Number(saldoAcumulado.toFixed(2)),
          statusConciliacao: nf.integradaContabil ? 'CONCILIADO' : 'PENDENTE_CONTABIL',
          notaFiscalId: nf.id
        });
      }
    });

    this.lancamentos.forEach(l => {
      if (l.empresaId !== empresaId) return;

      if (l.contaCreditoId === 11 && (!tipoParticipante || tipoParticipante === 'CLIENTE')) {
        saldoAcumulado -= l.valor;
        itens.push({
          id: idContador++,
          empresaId,
          participanteId: participanteId || 0,
          participanteNome: 'CLIENTES DIVERSOS / CARTEIRA',
          participanteCnpjCpf: '00.000.000/0000-00',
          tipoParticipante: 'CLIENTE',
          data: l.dataLancamento,
          documento: `LOTE #${l.loteId} P:${l.numeroPartida}`,
          historico: l.complementoHistorico || 'Recebimento de duplicata via Banco / Caixa',
          debito: 0,
          credito: l.valor,
          saldoProgressivo: Number(saldoAcumulado.toFixed(2)),
          statusConciliacao: 'CONCILIADO',
          lancamentoContabilId: l.id
        });
      }

      if (l.contaDebitoId === 30 && (!tipoParticipante || tipoParticipante === 'FORNECEDOR')) {
        saldoAcumulado -= l.valor;
        itens.push({
          id: idContador++,
          empresaId,
          participanteId: participanteId || 0,
          participanteNome: 'FORNECEDORES DIVERSOS',
          participanteCnpjCpf: '00.000.000/0000-00',
          tipoParticipante: 'FORNECEDOR',
          data: l.dataLancamento,
          documento: `LOTE #${l.loteId} P:${l.numeroPartida}`,
          historico: l.complementoHistorico || 'Pagamento efetuado a fornecedor',
          debito: l.valor,
          credito: 0,
          saldoProgressivo: Number(saldoAcumulado.toFixed(2)),
          statusConciliacao: 'CONCILIADO',
          lancamentoContabilId: l.id
        });
      }
    });

    if (itens.length === 0) {
      itens.push(
        {
          id: 1,
          empresaId,
          participanteId: 1,
          participanteNome: 'DELL COMPUTADORES DO BRASIL LTDA',
          participanteCnpjCpf: '72.381.189/0001-10',
          tipoParticipante: 'FORNECEDOR',
          data: '2026-02-05',
          documento: 'NF-e 45892 S:1',
          historico: 'Aquisição de Servidores e Estações Dell PowerEdge',
          debito: 0,
          credito: 48500.00,
          saldoProgressivo: 48500.00,
          statusConciliacao: 'CONCILIADO',
          notaFiscalId: 101
        },
        {
          id: 2,
          empresaId,
          participanteId: 1,
          participanteNome: 'DELL COMPUTADORES DO BRASIL LTDA',
          participanteCnpjCpf: '72.381.189/0001-10',
          tipoParticipante: 'FORNECEDOR',
          data: '2026-02-15',
          documento: 'TED BANCO 341',
          historico: 'Pagamento 1ª Parcela Dell s/ NF-e 45892',
          debito: 24250.00,
          credito: 0,
          saldoProgressivo: 24250.00,
          statusConciliacao: 'CONCILIADO',
          lancamentoContabilId: 201
        },
        {
          id: 3,
          empresaId,
          participanteId: 2,
          participanteNome: 'BANCO ALPHA INVESTIMENTOS S/A',
          participanteCnpjCpf: '01.234.567/0001-89',
          tipoParticipante: 'CLIENTE',
          data: '2026-02-10',
          documento: 'NFS-e 1024 S:1',
          historico: 'Prestação de Serviços de Auditoria e Consultoria Contábil',
          debito: 18500.00,
          credito: 0,
          saldoProgressivo: 18500.00,
          statusConciliacao: 'CONCILIADO',
          notaFiscalId: 102
        },
        {
          id: 4,
          empresaId,
          participanteId: 2,
          participanteNome: 'BANCO ALPHA INVESTIMENTOS S/A',
          participanteCnpjCpf: '01.234.567/0001-89',
          tipoParticipante: 'CLIENTE',
          data: '2026-02-28',
          documento: 'PIX RECEBIDO',
          historico: 'Liquidação de honorários ref. NFS-e 1024',
          debito: 0,
          credito: 18500.00,
          saldoProgressivo: 0.00,
          statusConciliacao: 'CONCILIADO',
          lancamentoContabilId: 202
        }
      );
    }

    return itens.sort((a, b) => a.data.localeCompare(b.data));
  }

  public conciliarPartidaRazaoAuxiliar(empresaId: number, itemId: number): { success: boolean; loteId?: number } {
    const proximoNumLote = this.lotes.reduce((m, l) => Math.max(m, l.numero), 0) + 1;
    const loteId = Date.now();

    const lote: LoteContabil = {
      id: loteId,
      empresaId,
      numero: proximoNumLote,
      numeroLote: proximoNumLote,
      descricao: `Conciliação Manual Razão Auxiliar Item #${itemId}`,
      dataLote: new Date().toISOString().split('T')[0],
      status: 'FECHADO',
      totalDebito: 1000.00,
      totalCredito: 1000.00
    };

    this.lotes.push(lote);
    this.persistSnapshot();
    this.registrarAuditoria('CONCILIACAO_RAZAO_AUXILIAR', 'PROCESSAMENTO', `Item #${itemId} do Razão Auxiliar conciliado com sucesso.`);
    return { success: true, loteId };
  }

  // ----------------------------------------------------
  // DCTFWeb & FECHAMENTO eSocial S-1299
  // ----------------------------------------------------
  public getApuracaoDctfWeb(empresaId: number, competencia: string): ApuracaoDctfWeb {
    const folha = this.folhasMensais.filter(f => f.empresaId === empresaId && f.competencia === competencia);
    const folhaBruta = Number(folha.reduce((acc, f) => acc + (f.totalProventos || 0), 0).toFixed(2)) || 14850.00;
    const inssSegurados = Number(folha.reduce((acc, f) => acc + (f.inssSegurado || 0), 0).toFixed(2)) || 1324.50;
    const inssPatronal = Number((folhaBruta * 0.20).toFixed(2));
    const inssRatFap = Number((folhaBruta * 0.03).toFixed(2));
    const inssTerceiros = Number((folhaBruta * 0.058).toFixed(2));
    const totalDebitosPrevidenciarios = Number((inssSegurados + inssPatronal + inssRatFap + inssTerceiros).toFixed(2));

    const deducaoSalarioFamilia = 135.00;
    const deducaoSalarioMaternidade = 0;
    const retencaoLei9711Tomadores = 0;
    const totalDeducoes = Number((deducaoSalarioFamilia + deducaoSalarioMaternidade + retencaoLei9711Tomadores).toFixed(2));
    const saldoLiquidoDARF = Number(Math.max(0, totalDebitosPrevidenciarios - totalDeducoes).toFixed(2));

    const [ano, mes] = competencia.split('-').map(Number);
    const mesVenc = mes === 12 ? 1 : mes + 1;
    const anoVenc = mes === 12 ? ano + 1 : ano;
    const dataVencimento = `${anoVenc}-${String(mesVenc).padStart(2, '0')}-20`;

    const codigoBarras = `858900000${Math.floor(saldoLiquidoDARF * 100)}1138${competencia.replace('-', '')}00000000123456789012345`;
    const pixQrCode = `00020126580014br.gov.bcb.pix0136${Math.random().toString(36).substring(2, 15)}520400005303986540${saldoLiquidoDARF.toFixed(2)}5802BR5925RECEITA FEDERAL DO BRASIL6009SAO PAULO62070503***6304`;

    const evS1299 = this.eventosESocial.find(e => e.empresaId === empresaId && e.nomeEvento.includes('S-1299') && e.competencia === competencia);

    return {
      id: Date.now(),
      empresaId,
      competencia,
      status: evS1299 ? 'TRANSMITIDA' : 'ABERTA',
      dataFechamento: evS1299 ? evS1299.dataTransmissao : undefined,
      reciboFechamentoS1299: evS1299 ? evS1299.numeroRecibo : undefined,
      folhaBruta,
      inssSegurados,
      inssPatronal,
      inssRatFap,
      inssTerceiros,
      totalDebitosPrevidenciarios,
      deducaoSalarioFamilia,
      deducaoSalarioMaternidade,
      retencaoLei9711Tomadores,
      totalDeducoes,
      saldoLiquidoDARF,
      codigoReceitaDARF: '1138',
      dataVencimento,
      codigoBarras,
      pixQrCode,
      integradoContabil: false
    };
  }

  public fecharESocialS1299(empresaId: number, competencia: string): { success: boolean; eventoId: number; recibo: string; dctfWeb: ApuracaoDctfWeb } {
    const empresa = this.empresas.find(e => e.id === empresaId) || this.empresas[0];
    const dctfWeb = this.getApuracaoDctfWeb(empresaId, competencia);
    const timestamp = Date.now();
    const nrRecibo = `1.2.${competencia.replace('-', '')}.S1299${String(timestamp).slice(-10)}-1`;
    const idEvento = `ID1${empresa.cnpj.replace(/\D/g, '')}${new Date().getFullYear()}${String(timestamp).slice(-8)}`;

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtFechaEvPer/v_S_01_02_00">
  <evtFechaEvPer Id="${idEvento}">
    <ideEvento>
      <indRetif>1</indRetif>
      <perApur>${competencia}</perApur>
      <tpAmb>1</tpAmb>
      <procEmi>1</procEmi>
      <verProc>AntigravityERP_v2.0</verProc>
    </ideEvento>
    <ideEmpregador>
      <tpInsc>1</tpInsc>
      <nrInsc>${empresa.cnpj.replace(/\D/g, '')}</nrInsc>
    </ideEmpregador>
    <infoFech>
      <evtRemun>S</evtRemun>
      <evtPgtos>S</evtPgtos>
      <evtAqProd>N</evtAqProd>
      <evtComProd>N</evtComProd>
      <evtContrProc>N</evtContrProc>
    </infoFech>
  </evtFechaEvPer>
</eSocial>`;

    const novoEvento: EventoESocial = {
      id: timestamp,
      empresaId,
      tipoEvento: 'S-1000',
      nomeEvento: `Fechamento dos Eventos Periódicos S-1299 - Comp. ${competencia}`,
      competencia,
      dataGeracao: new Date().toISOString().replace('T', ' ').substring(0, 19),
      dataTransmissao: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'TRANSMITIDO',
      numeroRecibo: nrRecibo,
      xmlContent: xml,
      bases: {
        baseINSS: dctfWeb.folhaBruta,
        baseFGTS: dctfWeb.folhaBruta,
        baseIRRF: dctfWeb.folhaBruta - dctfWeb.inssSegurados,
        valorLiquido: dctfWeb.saldoLiquidoDARF
      }
    };

    this.eventosESocial = this.eventosESocial.filter(e => !(e.empresaId === empresaId && e.nomeEvento.includes('S-1299') && e.competencia === competencia));
    this.eventosESocial.push(novoEvento);

    dctfWeb.status = 'TRANSMITIDA';
    dctfWeb.dataFechamento = novoEvento.dataTransmissao;
    dctfWeb.reciboFechamentoS1299 = nrRecibo;
    dctfWeb.xmlFechamentoS1299 = xml;

    this.persistSnapshot();
    this.registrarAuditoria('FECHAMENTO_ESOCIAL_S1299', 'PROCESSAMENTO', `Folha fechada (S-1299) e DCTFWeb gerada para comp. ${competencia}. DARF R$ ${dctfWeb.saldoLiquidoDARF.toFixed(2)}.`);

    return { success: true, eventoId: novoEvento.id, recibo: nrRecibo, dctfWeb };
  }

  public integrarDctfWebContabil(empresaId: number, competencia: string): { success: boolean; loteId: number } {
    const dctf = this.getApuracaoDctfWeb(empresaId, competencia);
    const proximoNumLote = this.lotes.reduce((m, l) => Math.max(m, l.numero), 0) + 1;
    const loteId = Date.now();

    const lote: LoteContabil = {
      id: loteId,
      empresaId,
      numero: proximoNumLote,
      numeroLote: proximoNumLote,
      descricao: `Provisão de Encargos Previdenciários DCTFWeb (INSS Patronal + Terceiros) - Comp. ${competencia}`,
      dataLote: `${competencia}-28`,
      status: 'FECHADO',
      totalDebito: dctf.inssPatronal + dctf.inssRatFap + dctf.inssTerceiros,
      totalCredito: dctf.inssPatronal + dctf.inssRatFap + dctf.inssTerceiros
    };

    const totalEncargosPatronais = Number((dctf.inssPatronal + dctf.inssRatFap + dctf.inssTerceiros).toFixed(2));

    this.addLancamento({
      empresaId,
      numeroPartida: this.lancamentos.length + 1,
      loteId,
      dataLancamento: `${competencia}-28`,
      tipoPartida: 'SIMPLES',
      contaDebitoId: 56,
      contaCreditoId: 27,
      valor: totalEncargosPatronais,
      historicoId: 3,
      complementoHistorico: `Vlr. ref. provisão encargos patronais previdenciários e terceiros DCTFWeb comp. ${competencia}`,
      usuarioNome: 'DCTFWeb Oficial'
    });

    this.lotes.push(lote);
    dctf.integradoContabil = true;
    this.persistSnapshot();
    this.registrarAuditoria('INTEGRACAO_DCTFWEB', 'PROCESSAMENTO', `Encargos DCTFWeb Comp. ${competencia} contabilizados com sucesso no valor de R$ ${totalEncargosPatronais.toFixed(2)}.`);

    return { success: true, loteId };
  }

  // ----------------------------------------------------
  // GESTÃO PATRIMONIAL, BAIXAS & INVENTÁRIO (CPC 27)
  // ----------------------------------------------------
  public getBaixasAtivos(empresaId?: number): BaixaAtivoImobilizado[] {
    if (empresaId) {
      return this.baixasAtivos.filter(b => b.empresaId === empresaId);
    }
    return this.baixasAtivos;
  }

  public registrarBaixaAtivo(dados: {
    empresaId: number;
    ativoId: number;
    dataBaixa: string;
    motivoBaixa: 'VENDA' | 'DESCARTE_SUCATEAMENTO' | 'PERDA_SINISTRO' | 'DOACAO';
    valorVendaAlienacao: number;
    numeroNotaFiscalVenda?: string;
    serieNotaFiscalVenda?: string;
    compradorNome?: string;
    compradorCnpjCpf?: string;
  }): BaixaAtivoImobilizado {
    const ativo = this.ativosImobilizados.find(a => a.id === dados.ativoId) || this.ativosImobilizados[0];
    const valorAquisicaoOriginal = ativo ? ativo.valorOriginal : 50000.00;
    const depreciacaoAcumulada = ativo ? (ativo.depreciacaoAcumulada || (valorAquisicaoOriginal * 0.40)) : 20000.00;
    const valorContabilResidual = Number(Math.max(0, valorAquisicaoOriginal - depreciacaoAcumulada).toFixed(2));

    const valorVenda = Number(dados.valorVendaAlienacao || 0);
    const resultadoOperacao = Number((valorVenda - valorContabilResidual).toFixed(2));
    const tipoResultado: 'GANHO_CAPITAL' | 'PERDA_CAPITAL' | 'NEUTRO' = 
      resultadoOperacao > 0 ? 'GANHO_CAPITAL' : (resultadoOperacao < 0 ? 'PERDA_CAPITAL' : 'NEUTRO');

    const impostoDevidoGanho = tipoResultado === 'GANHO_CAPITAL'
      ? Number((resultadoOperacao * 0.24).toFixed(2))
      : 0;

    const novaBaixa: BaixaAtivoImobilizado = {
      id: Date.now(),
      empresaId: dados.empresaId,
      ativoId: dados.ativoId,
      codigoBem: ativo ? (ativo.codigo || 'BEM-001') : 'BEM-001',
      descricaoBem: ativo ? (ativo.descricao || 'Ativo Imobilizado') : 'Ativo Imobilizado',
      dataAquisicao: ativo ? ativo.dataAquisicao : '2023-01-10',
      dataBaixa: dados.dataBaixa,
      motivoBaixa: dados.motivoBaixa,
      valorAquisicaoOriginal,
      depreciacaoAcumuladaData: depreciacaoAcumulada,
      valorContabilResidual,
      valorVendaAlienacao: valorVenda,
      resultadoOperacao,
      tipoResultado,
      aliquotaIRPJGanho: 15.0,
      aliquotaCSLLGanho: 9.0,
      impostoDevidoGanho,
      numeroNotaFiscalVenda: dados.numeroNotaFiscalVenda,
      serieNotaFiscalVenda: dados.serieNotaFiscalVenda || '1',
      compradorNome: dados.compradorNome,
      compradorCnpjCpf: dados.compradorCnpjCpf,
      estornoCiapNecessario: false,
      saldoCiapEstornado: 0,
      integradoContabil: false
    };

    if (ativo) {
      ativo.status = 'BAIXADO';
    }

    const proximoNumLote = this.lotes.reduce((m, l) => Math.max(m, l.numero), 0) + 1;
    const loteId = Date.now() + 1;
    const lote: LoteContabil = {
      id: loteId,
      empresaId: dados.empresaId,
      numero: proximoNumLote,
      numeroLote: proximoNumLote,
      descricao: `Baixa de Ativo Imobilizado (${novaBaixa.codigoBem}) - ${novaBaixa.motivoBaixa}`,
      dataLote: dados.dataBaixa,
      status: 'FECHADO',
      totalDebito: valorAquisicaoOriginal,
      totalCredito: valorAquisicaoOriginal
    };

    this.addLancamento({
      empresaId: dados.empresaId,
      numeroPartida: this.lancamentos.length + 1,
      loteId,
      dataLancamento: dados.dataBaixa,
      tipoPartida: 'SIMPLES',
      contaDebitoId: 19,
      contaCreditoId: 18,
      valor: depreciacaoAcumulada,
      historicoId: 1,
      complementoHistorico: `Estorno de depreciação acumulada ref. baixa ${novaBaixa.codigoBem}`,
      usuarioNome: 'Gestão Patrimonial'
    });

    if (valorVenda > 0) {
      this.addLancamento({
        empresaId: dados.empresaId,
        numeroPartida: this.lancamentos.length + 2,
        loteId,
        dataLancamento: dados.dataBaixa,
        tipoPartida: 'SIMPLES',
        contaDebitoId: 6,
        contaCreditoId: 43,
        valor: valorVenda,
        historicoId: 1,
        complementoHistorico: `Recebimento ref. alienação de ativo ${novaBaixa.codigoBem} a ${novaBaixa.compradorNome || 'DIVERSOS'}`,
        usuarioNome: 'Gestão Patrimonial'
      });
    }

    this.lotes.push(lote);
    novaBaixa.integradoContabil = true;
    novaBaixa.loteContabilId = loteId;

    this.baixasAtivos.unshift(novaBaixa);
    this.persistSnapshot();
    this.registrarAuditoria('BAIXA_ATIVO_PATRIMONIO', 'PROCESSAMENTO', `Ativo ${novaBaixa.codigoBem} baixado com ${novaBaixa.tipoResultado}: R$ ${novaBaixa.resultadoOperacao.toFixed(2)}.`);

    return novaBaixa;
  }

  public getItensInventarioPatrimonial(empresaId?: number): ItemInventarioPatrimonial[] {
    if (empresaId) {
      return this.itensInventario.filter(i => i.empresaId === empresaId);
    }
    return this.itensInventario;
  }

  public saveItemInventario(item: Partial<ItemInventarioPatrimonial> & { empresaId: number; ativoId: number; codigoPatrimonio: string; descricao: string }): ItemInventarioPatrimonial {
    let itemSalvo: ItemInventarioPatrimonial;
    if (item.id && item.id > 0) {
      const idx = this.itensInventario.findIndex(i => i.id === item.id);
      if (idx >= 0) {
        this.itensInventario[idx] = { ...this.itensInventario[idx], ...item };
        itemSalvo = this.itensInventario[idx];
      } else {
        itemSalvo = {
          id: item.id,
          empresaId: item.empresaId,
          ativoId: item.ativoId,
          codigoPatrimonio: item.codigoPatrimonio,
          descricao: item.descricao,
          centroCustoId: item.centroCustoId || 1,
          centroCustoNome: item.centroCustoNome || 'Administração Geral',
          departamento: item.departamento || 'Geral',
          responsavelNome: item.responsavelNome || 'RESPONSÁVEL',
          responsavelCpf: item.responsavelCpf || '000.000.000-00',
          localizacaoFisica: item.localizacaoFisica || 'Sede da Empresa',
          dataTombamento: item.dataTombamento || new Date().toISOString().split('T')[0],
          estadoConservacao: item.estadoConservacao || 'BOM',
          situacaoInventario: item.situacaoInventario || 'LOCALIZADO',
          qrCodeIdentificador: `${item.codigoPatrimonio}-${item.empresaId}`
        };
        this.itensInventario.push(itemSalvo);
      }
    } else {
      const novoId = this.itensInventario.length > 0 ? Math.max(...this.itensInventario.map(i => i.id)) + 1 : 1;
      itemSalvo = {
        id: novoId,
        empresaId: item.empresaId,
        ativoId: item.ativoId,
        codigoPatrimonio: item.codigoPatrimonio,
        descricao: item.descricao,
        centroCustoId: item.centroCustoId || 1,
        centroCustoNome: item.centroCustoNome || 'Administração Geral',
        departamento: item.departamento || 'Geral',
        responsavelNome: item.responsavelNome || 'RESPONSÁVEL',
        responsavelCpf: item.responsavelCpf || '000.000.000-00',
        localizacaoFisica: item.localizacaoFisica || 'Sede da Empresa',
        dataTombamento: item.dataTombamento || new Date().toISOString().split('T')[0],
        estadoConservacao: item.estadoConservacao || 'BOM',
        situacaoInventario: 'LOCALIZADO',
        qrCodeIdentificador: `${item.codigoPatrimonio}-${item.empresaId}`
      };
      this.itensInventario.push(itemSalvo);
    }

    this.persistSnapshot();
    this.registrarAuditoria('INVENTARIO_PATRIMONIAL', 'INCLUSAO', `Plaqueta ${itemSalvo.codigoPatrimonio} cadastrada/atualizada.`);
    return itemSalvo;
  }

  // ----------------------------------------------------
  // LIVRO CAIXA DIGITAL DO PRODUTOR RURAL - LCDPR
  // ----------------------------------------------------
  public getImoveisRurais(empresaId?: number): ImovelRuralLCDPR[] {
    if (empresaId) {
      return this.imoveisRurais.filter(i => i.empresaId === empresaId);
    }
    return this.imoveisRurais;
  }

  public saveImovelRural(imovel: Partial<ImovelRuralLCDPR> & { empresaId: number; nomeImovel: string; nirf: string }): ImovelRuralLCDPR {
    let itemSalvo: ImovelRuralLCDPR;
    if (imovel.id) {
      const idx = this.imoveisRurais.findIndex(i => i.id === imovel.id);
      if (idx !== -1) {
        this.imoveisRurais[idx] = { ...this.imoveisRurais[idx], ...imovel };
        itemSalvo = this.imoveisRurais[idx];
      } else {
        itemSalvo = { ...(imovel as ImovelRuralLCDPR) };
        this.imoveisRurais.push(itemSalvo);
      }
    } else {
      const novoId = this.imoveisRurais.length > 0 ? Math.max(...this.imoveisRurais.map(i => i.id)) + 1 : 1;
      const codImovel = String(novoId).padStart(3, '0');
      itemSalvo = {
        id: novoId,
        empresaId: imovel.empresaId,
        codigoImovel: imovel.codigoImovel || codImovel,
        nirf: imovel.nirf,
        codigoIncra: imovel.codigoIncra || '',
        nomeImovel: imovel.nomeImovel,
        endereco: imovel.endereco || '',
        municipio: imovel.municipio || '',
        uf: imovel.uf || 'SP',
        codigoIbge: imovel.codigoIbge || '3543402',
        tipoExploracao: imovel.tipoExploracao || '1',
        percentualParticipacao: Number(imovel.percentualParticipacao || 100)
      };
      this.imoveisRurais.push(itemSalvo);
    }
    this.persistSnapshot();
    this.registrarAuditoria('IMOVEL_RURAL_LCDPR', 'SALVAMENTO', `Imóvel Rural ${itemSalvo.nomeImovel} (${itemSalvo.nirf}) salvo.`);
    return itemSalvo;
  }

  public deleteLancamentoLCDPR(id: number): boolean {
    const idx = this.lancamentosLcdpr.findIndex(l => l.id === id);
    if (idx !== -1) {
      const rem = this.lancamentosLcdpr.splice(idx, 1)[0];
      const listaAno = this.lancamentosLcdpr.filter(l => l.empresaId === rem.empresaId && l.ano === rem.ano).sort((a, b) => a.data.localeCompare(b.data));
      let saldo = 0;
      listaAno.forEach(l => {
        saldo = Number((saldo + l.valorEntrada - l.valorSaida).toFixed(2));
        l.saldoProgressivo = saldo;
      });
      this.persistSnapshot();
      this.registrarAuditoria('LANCAMENTO_LCDPR', 'EXCLUSAO', `Lançamento LCDPR ID ${id} excluído com sucesso.`);
      return true;
    }
    return false;
  }

  public getLancamentosLCDPR(empresaId: number, ano: number): LancamentoLCDPR[] {
    return this.lancamentosLcdpr.filter(l => l.empresaId === empresaId && l.ano === ano).sort((a, b) => a.data.localeCompare(b.data));
  }

  public saveLancamentoLCDPR(lanc: Partial<LancamentoLCDPR> & { empresaId: number; ano: number; data: string; descricao: string; tipoLancamento: 'RECEITA' | 'DESPESA' }): LancamentoLCDPR {
    const listaAno = this.getLancamentosLCDPR(lanc.empresaId, lanc.ano);
    let saldoAnterior = listaAno.length > 0 ? listaAno[listaAno.length - 1].saldoProgressivo : 0;

    const valorEntrada = lanc.tipoLancamento === 'RECEITA' ? Number(lanc.valorEntrada || 0) : 0;
    const valorSaida = lanc.tipoLancamento === 'DESPESA' ? Number(lanc.valorSaida || 0) : 0;
    const saldoAtual = Number((saldoAnterior + valorEntrada - valorSaida).toFixed(2));

    const novoId = this.lancamentosLcdpr.length > 0 ? Math.max(...this.lancamentosLcdpr.map(l => l.id)) + 1 : 1;
    const imovel = this.imoveisRurais.find(i => i.id === lanc.imovelRuralId) || this.imoveisRurais[0];

    const novoLanc: LancamentoLCDPR = {
      id: novoId,
      empresaId: lanc.empresaId,
      ano: lanc.ano,
      data: lanc.data,
      imovelRuralId: imovel ? imovel.id : 1,
      imovelNome: imovel ? imovel.nomeImovel : 'Fazenda Rural',
      contaBancaria: lanc.contaBancaria || 'Banco do Brasil C/C 45900-1',
      tipoDocumento: lanc.tipoDocumento || '1',
      numeroDocumento: lanc.numeroDocumento || 'NF-e 001',
      participanteNome: lanc.participanteNome || 'DIVERSOS',
      participanteCnpjCpf: lanc.participanteCnpjCpf || '00.000.000/0001-00',
      tipoLancamento: lanc.tipoLancamento,
      descricao: lanc.descricao,
      valorEntrada,
      valorSaida,
      saldoProgressivo: saldoAtual
    };

    this.lancamentosLcdpr.push(novoLanc);
    this.persistSnapshot();
    this.registrarAuditoria('LANCAMENTO_LCDPR', 'INCLUSAO', `Lançamento LCDPR de R$ ${(valorEntrada || valorSaida).toFixed(2)} registrado com sucesso.`);
    return novoLanc;
  }

  public gerarArquivoTxtLCDPR(empresaId: number, ano: number): string {
    const empresa = this.empresas.find(e => e.id === empresaId) || this.empresas[0];
    const imoveis = this.getImoveisRurais(empresaId);
    const lancamentos = this.getLancamentosLCDPR(empresaId, ano);

    const lines: string[] = [];
    let contadorLinha = 1;

    lines.push(`0000|LCDPR|0013|${empresa.cnpj.replace(/\D/g, '')}|${empresa.razaoSocial.toUpperCase()}|0|0||0101${ano}|3112${ano}`);
    contadorLinha++;

    lines.push(`0010|1`);
    contadorLinha++;

    imoveis.forEach(im => {
      lines.push(`0030|${im.codigoImovel}|BRA|${im.codigoIncra}|${im.nirf}|${im.nomeImovel.toUpperCase()}|${im.endereco.toUpperCase()}|${im.municipio.toUpperCase()}|${im.uf}|${im.codigoIbge}|${im.tipoExploracao}|${im.percentualParticipacao.toFixed(2).replace('.', ',')}`);
      contadorLinha++;
    });

    lines.push(`0040|001|001|BANCO DO BRASIL S/A|0048|459001`);
    contadorLinha++;

    lancamentos.forEach(l => {
      const vlrEntradaStr = l.valorEntrada > 0 ? l.valorEntrada.toFixed(2).replace('.', ',') : '0,00';
      const vlrSaidaStr = l.valorSaida > 0 ? l.valorSaida.toFixed(2).replace('.', ',') : '0,00';
      const saldoStr = l.saldoProgressivo.toFixed(2).replace('.', ',');
      const dataFormatada = l.data.split('-').reverse().join('');
      lines.push(`Q100|${dataFormatada}|001|001|${l.numeroDocumento}|${l.tipoDocumento}|${l.descricao.toUpperCase()}|${l.participanteCnpjCpf.replace(/\D/g, '')}|${l.tipoLancamento === 'RECEITA' ? '1' : '2'}|${vlrEntradaStr}|${vlrSaidaStr}|${saldoStr}|P`);
      contadorLinha++;
    });

    for (let m = 1; m <= 12; m++) {
      const mesStr = `${ano}-${String(m).padStart(2, '0')}`;
      const lancsMes = lancamentos.filter(l => l.data.startsWith(mesStr));
      const totEntradas = lancsMes.reduce((acc, l) => acc + l.valorEntrada, 0);
      const totSaidas = lancsMes.reduce((acc, l) => acc + l.valorSaida, 0);
      const saldoMes = totEntradas - totSaidas;
      lines.push(`Q200|${String(m).padStart(2, '0')}${ano}|${totEntradas.toFixed(2).replace('.', ',')}|${totSaidas.toFixed(2).replace('.', ',')}|${saldoMes.toFixed(2).replace('.', ',')}|P`);
      contadorLinha++;
    }

    contadorLinha++;
    lines.push(`9999|${contadorLinha}`);

    return lines.join('\r\n');
  }

  // ----------------------------------------------------
  // RESCISÃO TRABALHISTA & TRCT (Portaria MTE nº 1.057/2012)
  // ----------------------------------------------------
  public getRescisoes(empresaId?: number): RescisaoContratual[] {
    if (empresaId) {
      return this.rescisoesTrct.filter(r => r.empresaId === empresaId);
    }
    return this.rescisoesTrct;
  }

  public calcularRescisao(params: {
    empresaId: number;
    colaboradorId: number;
    dataDemissao: string;
    dataAviso: string;
    motivo: MotivoRescisao;
    tipoAviso: TipoAvisoPrevio;
    saldoFgts: number;
    feriasVencidas: boolean;
    outrasDeducoes?: number;
    observacoes?: string;
  }): RescisaoContratual {
    const colab = this.colaboradores.find(c => c.id === params.colaboradorId) || this.colaboradores[0];
    const salarioBase = colab ? (colab.salarioBase || 3500) : 3500;
    const dataAdm = colab ? new Date(colab.dataAdmissao) : new Date('2024-01-01');
    const dataDem = new Date(params.dataDemissao);

    // Lei 12.506/2011: 30 dias + 3 dias por ano trabalhado (máx 90 dias)
    let anosCompletos = dataDem.getFullYear() - dataAdm.getFullYear();
    const m = dataDem.getMonth() - dataAdm.getMonth();
    if (m < 0 || (m === 0 && dataDem.getDate() < dataAdm.getDate())) {
      anosCompletos--;
    }
    anosCompletos = Math.max(0, anosCompletos);
    const diasAvisoLei12506 = Math.min(90, 30 + (anosCompletos * 3));

    // Saldo de Salários do mês do desligamento
    const diaDemissao = dataDem.getDate();
    const saldoSalarioDias = Math.min(30, diaDemissao);
    const saldoSalarioValor = Number(((salarioBase / 30) * saldoSalarioDias).toFixed(2));

    // 13º Salário Proporcional
    const mesDemissao = dataDem.getMonth() + 1;
    let decimoTerceiroAvos = mesDemissao - (diaDemissao >= 15 ? 0 : 1);
    if (params.motivo === 'JUSTA_CAUSA') {
      decimoTerceiroAvos = 0;
    }
    decimoTerceiroAvos = Math.max(0, Math.min(12, decimoTerceiroAvos));
    const decimoTerceiroValor = Number(((salarioBase / 12) * decimoTerceiroAvos).toFixed(2));

    // Férias Proporcionais + 1/3
    let feriasProporcionaisAvos = Math.max(1, Math.min(12, mesDemissao));
    if (params.motivo === 'JUSTA_CAUSA') {
      feriasProporcionaisAvos = 0;
    }
    const feriasProporcionaisValor = Number(((salarioBase / 12) * feriasProporcionaisAvos).toFixed(2));
    const tercoConstitucionalFeriasProp = Number((feriasProporcionaisValor / 3).toFixed(2));

    // Férias Vencidas + 1/3
    const feriasVencidasValor = params.feriasVencidas ? salarioBase : 0;
    const tercoConstitucionalFeriasVenc = params.feriasVencidas ? Number((salarioBase / 3).toFixed(2)) : 0;

    // Aviso Prévio Indenizado
    let avisoPrevioIndenizadoValor = 0;
    if (params.motivo === 'SEM_JUSTA_CAUSA' && params.tipoAviso === 'INDENIZADO') {
      avisoPrevioIndenizadoValor = Number(((salarioBase / 30) * diasAvisoLei12506).toFixed(2));
    } else if (params.motivo === 'SEM_JUSTA_CAUSA' && params.tipoAviso === 'TRABALHADO' && diasAvisoLei12506 > 30) {
      avisoPrevioIndenizadoValor = Number(((salarioBase / 30) * (diasAvisoLei12506 - 30)).toFixed(2));
    } else if (params.motivo === 'ACORDO_MUTUO' && params.tipoAviso === 'INDENIZADO') {
      avisoPrevioIndenizadoValor = Number(((salarioBase / 30) * diasAvisoLei12506 * 0.5).toFixed(2));
    }

    const totalProventosBruto = Number((
      saldoSalarioValor + 
      decimoTerceiroValor + 
      feriasProporcionaisValor + 
      tercoConstitucionalFeriasProp + 
      feriasVencidasValor + 
      tercoConstitucionalFeriasVenc + 
      avisoPrevioIndenizadoValor
    ).toFixed(2));

    // Descontos: INSS
    let inssSaldo = 0;
    if (saldoSalarioValor <= 1412.00) inssSaldo = saldoSalarioValor * 0.075;
    else if (saldoSalarioValor <= 2666.68) inssSaldo = 1412 * 0.075 + (saldoSalarioValor - 1412) * 0.09;
    else if (saldoSalarioValor <= 4000.03) inssSaldo = 1412 * 0.075 + (2666.68 - 1412) * 0.09 + (saldoSalarioValor - 2666.68) * 0.12;
    else inssSaldo = 1412 * 0.075 + (2666.68 - 1412) * 0.09 + (4000.03 - 2666.68) * 0.12 + (Math.min(saldoSalarioValor, 7786.02) - 4000.03) * 0.14;

    let inssDecimo = 0;
    if (decimoTerceiroValor > 0) {
      if (decimoTerceiroValor <= 1412.00) inssDecimo = decimoTerceiroValor * 0.075;
      else if (decimoTerceiroValor <= 2666.68) inssDecimo = 1412 * 0.075 + (decimoTerceiroValor - 1412) * 0.09;
      else inssDecimo = 1412 * 0.075 + (2666.68 - 1412) * 0.09 + (decimoTerceiroValor - 2666.68) * 0.12;
    }
    const inssRescisao = Number((inssSaldo + inssDecimo).toFixed(2));

    // Desconto: IRRF
    const baseIrrf = saldoSalarioValor + decimoTerceiroValor - inssRescisao;
    let irrfRescisao = 0;
    if (baseIrrf > 2259.20 && baseIrrf <= 2826.65) irrfRescisao = (baseIrrf * 0.075) - 169.44;
    else if (baseIrrf > 2826.65 && baseIrrf <= 3751.05) irrfRescisao = (baseIrrf * 0.15) - 381.44;
    else if (baseIrrf > 3751.05 && baseIrrf <= 4664.68) irrfRescisao = (baseIrrf * 0.225) - 662.77;
    else if (baseIrrf > 4664.68) irrfRescisao = (baseIrrf * 0.275) - 896.00;
    irrfRescisao = Number(Math.max(0, irrfRescisao).toFixed(2));

    const outrasDeducoes = Number(params.outrasDeducoes || 0);
    const totalDescontos = Number((inssRescisao + irrfRescisao + outrasDeducoes).toFixed(2));
    const valorLiquidoRescisorio = Number((totalProventosBruto - totalDescontos).toFixed(2));

    // FGTS e Multa
    let aliquotaMultaFgts = 0;
    if (params.motivo === 'SEM_JUSTA_CAUSA') aliquotaMultaFgts = 40;
    else if (params.motivo === 'ACORDO_MUTUO') aliquotaMultaFgts = 20;
    const valorMultaFgts = Number((params.saldoFgts * (aliquotaMultaFgts / 100)).toFixed(2));

    const novoId = this.rescisoesTrct.length > 0 ? Math.max(...this.rescisoesTrct.map(r => r.id)) + 1 : 1;

    return {
      id: novoId,
      empresaId: params.empresaId,
      colaboradorId: colab ? colab.id : 1,
      colaboradorNome: colab ? colab.nome : 'COLABORADOR',
      cargo: colab ? colab.cargo : 'Cargo',
      dataAdmissao: colab ? colab.dataAdmissao : '2024-01-01',
      dataDemissao: params.dataDemissao,
      dataAvisoPrevio: params.dataAviso,
      motivo: params.motivo,
      tipoAviso: params.tipoAviso,
      diasAvisoLei12506,
      salarioBase,
      saldoSalarioDias,
      saldoSalarioValor,
      decimoTerceiroAvos,
      decimoTerceiroValor,
      feriasProporcionaisAvos,
      feriasProporcionaisValor,
      tercoConstitucionalFeriasProp,
      feriasVencidasValor,
      tercoConstitucionalFeriasVenc,
      avisoPrevioIndenizadoValor,
      totalProventosBruto,
      inssRescisao,
      irrfRescisao,
      outrasDeducoes,
      totalDescontos,
      valorLiquidoRescisorio,
      saldoFgtsParaFinsRescisorios: params.saldoFgts,
      aliquotaMultaFgts,
      valorMultaFgts,
      statusIntegracaoContabil: false,
      observacoes: params.observacoes || ''
    };
  }

  public salvarRescisao(rescisao: RescisaoContratual): RescisaoContratual {
    const idx = this.rescisoesTrct.findIndex(r => r.id === rescisao.id);
    if (idx !== -1) {
      this.rescisoesTrct[idx] = { ...rescisao };
    } else {
      this.rescisoesTrct.push(rescisao);
    }
    this.persistSnapshot();
    this.registrarAuditoria('RESCISAO_TRCT', 'GRAVACAO', `Rescisão de ${rescisao.colaboradorNome} salva com sucesso.`);
    return rescisao;
  }

  public integrarRescisaoTrctContabil(rescisaoId: number): { sucesso: boolean; loteId: number; mensagem: string } {
    const resc = this.rescisoesTrct.find(r => r.id === rescisaoId);
    if (!resc) {
      return { sucesso: false, loteId: 0, mensagem: 'Rescisão não encontrada.' };
    }
    if (resc.statusIntegracaoContabil) {
      return { sucesso: true, loteId: resc.loteContabilId || 0, mensagem: 'Rescisão já integrada contabilmente.' };
    }

    const novoLoteId = this.lotes.length > 0 ? Math.max(...this.lotes.map(l => l.id)) + 1 : 1;
    const novoLoteNumero = this.lotes.length > 0 ? Math.max(...this.lotes.map(l => l.numero)) + 1 : 1;

    const contaDespesa = this.contas.find(c => c.classificacao.startsWith('3.01.01') || c.classificacao.startsWith('4.01.01')) || this.contas[10];
    const contaInss = this.contas.find(c => c.nome.toLowerCase().includes('inss a recolher')) || this.contas[12];
    const contaIrrf = this.contas.find(c => c.nome.toLowerCase().includes('irrf a recolher')) || this.contas[13];
    const contaSalariosPagar = this.contas.find(c => c.nome.toLowerCase().includes('salários a pagar')) || this.contas[14];

    const lancamentosRescisao: LancamentoContabil[] = [];
    const novoLancId = this.lancamentos.length > 0 ? Math.max(...this.lancamentos.map(l => l.id)) + 1 : 1;

    lancamentosRescisao.push({
      id: novoLancId,
      empresaId: resc.empresaId,
      numeroPartida: 1,
      loteId: novoLoteId,
      dataLancamento: resc.dataDemissao,
      tipoPartida: 'SIMPLES',
      contaDebitoId: contaDespesa.id,
      contaCreditoId: contaSalariosPagar.id,
      valor: resc.valorLiquidoRescisorio,
      historicoId: 1,
      complementoHistorico: `Vlr. ref. quitação rescisória de ${resc.colaboradorNome} (TRCT)`,
      createdAt: new Date().toISOString()
    });

    if (resc.inssRescisao > 0) {
      lancamentosRescisao.push({
        id: novoLancId + 1,
        empresaId: resc.empresaId,
        numeroPartida: 2,
        loteId: novoLoteId,
        dataLancamento: resc.dataDemissao,
        tipoPartida: 'SIMPLES',
        contaDebitoId: contaDespesa.id,
        contaCreditoId: contaInss.id,
        valor: resc.inssRescisao,
        historicoId: 1,
        complementoHistorico: `Retenção INSS sobre verbas rescisórias de ${resc.colaboradorNome}`,
        createdAt: new Date().toISOString()
      });
    }

    if (resc.irrfRescisao > 0) {
      lancamentosRescisao.push({
        id: novoLancId + 2,
        empresaId: resc.empresaId,
        numeroPartida: 3,
        loteId: novoLoteId,
        dataLancamento: resc.dataDemissao,
        tipoPartida: 'SIMPLES',
        contaDebitoId: contaDespesa.id,
        contaCreditoId: contaIrrf.id,
        valor: resc.irrfRescisao,
        historicoId: 1,
        complementoHistorico: `Retenção IRRF sobre verbas rescisórias de ${resc.colaboradorNome}`,
        createdAt: new Date().toISOString()
      });
    }

    this.lancamentos.push(...lancamentosRescisao);

    this.lotes.push({
      id: novoLoteId,
      empresaId: resc.empresaId,
      numero: novoLoteNumero,
      numeroLote: novoLoteNumero,
      descricao: `Rescisão Trabalhista TRCT - ${resc.colaboradorNome}`,
      dataLote: resc.dataDemissao,
      status: 'FECHADO',
      totalDebito: resc.totalProventosBruto,
      totalCredito: resc.totalProventosBruto
    });

    resc.statusIntegracaoContabil = true;
    resc.loteContabilId = novoLoteId;

    this.persistSnapshot();
    this.registrarAuditoria('RESCISAO_TRCT', 'INTEGRACAO_CONTABIL', `Lote nº ${novoLoteNumero} gerado com sucesso para a rescisão de ${resc.colaboradorNome}.`);
    return { sucesso: true, loteId: novoLoteId, mensagem: `Lote Contábil nº ${novoLoteNumero} gerado com ${lancamentosRescisao.length} partidas dobradas.` };
  }

  // ----------------------------------------------------
  // DEMONSTRAÇÃO DAS MUTAÇÕES DO PATRIMÔNIO LÍQUIDO (DMPL - CPC 26) & DVA (CPC 09)
  // ----------------------------------------------------
  public getQuadroDmpl(empresaId: number, ano: number): QuadroDmpl {
    const empresa = this.empresas.find(e => e.id === empresaId) || this.empresas[0];
    const capitalSocialBase = empresa.capitalSocial || 500000.00;
    
    const dreLinhas = this.gerarDREConsolidada(empresaId);
    const lucroLinha = dreLinhas.find(l => l.descricao.includes('LUCRO LÍQUIDO'));
    const lucroLiquido = (lucroLinha && lucroLinha.valorConsolidado > 0) ? lucroLinha.valorConsolidado : 184500.00;
    const reservaLegal = Number((lucroLiquido * 0.05).toFixed(2));
    const reservaEstatutaria = Number((lucroLiquido * 0.10).toFixed(2));
    const dividendos = Number((lucroLiquido * 0.25).toFixed(2));
    const lucrosRetidos = Number((lucroLiquido - reservaLegal - reservaEstatutaria - dividendos).toFixed(2));

    const linhas: LinhaDmpl[] = [
      {
        id: '1',
        descricao: `Saldos em 01/01/${ano}`,
        capitalSocial: capitalSocialBase,
        reservasCapital: 25000.00,
        reservasLucros: 85000.00,
        acoesTesouraria: 0,
        lucrosPrejuizosAcumulados: 0,
        totalPl: capitalSocialBase + 25000.00 + 85000.00
      },
      {
        id: '2',
        descricao: 'Ajustes de Exercícios Anteriores (NBC TG 23)',
        capitalSocial: 0,
        reservasCapital: 0,
        reservasLucros: 0,
        acoesTesouraria: 0,
        lucrosPrejuizosAcumulados: 4200.00,
        totalPl: 4200.00
      },
      {
        id: '3',
        descricao: 'Aumento de Capital Social por Subscrição',
        capitalSocial: 100000.00,
        reservasCapital: 0,
        reservasLucros: 0,
        acoesTesouraria: 0,
        lucrosPrejuizosAcumulados: 0,
        totalPl: 100000.00
      },
      {
        id: '4',
        descricao: `Lucro Líquido do Exercício de ${ano}`,
        capitalSocial: 0,
        reservasCapital: 0,
        reservasLucros: 0,
        acoesTesouraria: 0,
        lucrosPrejuizosAcumulados: lucroLiquido,
        totalPl: lucroLiquido
      },
      {
        id: '5',
        descricao: 'Constituição de Reserva Legal (5% Lei 6.404/76)',
        capitalSocial: 0,
        reservasCapital: 0,
        reservasLucros: reservaLegal,
        acoesTesouraria: 0,
        lucrosPrejuizosAcumulados: -reservaLegal,
        totalPl: 0
      },
      {
        id: '6',
        descricao: 'Constituição de Reserva Estatutária e Expansão',
        capitalSocial: 0,
        reservasCapital: 0,
        reservasLucros: reservaEstatutaria,
        acoesTesouraria: 0,
        lucrosPrejuizosAcumulados: -reservaEstatutaria,
        totalPl: 0
      },
      {
        id: '7',
        descricao: 'Distribuição de Dividendos Obrigatórios e Propostos',
        capitalSocial: 0,
        reservasCapital: 0,
        reservasLucros: 0,
        acoesTesouraria: 0,
        lucrosPrejuizosAcumulados: -dividendos,
        totalPl: -dividendos
      },
      {
        id: '8',
        descricao: `Saldos Finais em 31/12/${ano}`,
        capitalSocial: capitalSocialBase + 100000.00,
        reservasCapital: 25000.00,
        reservasLucros: 85000.00 + reservaLegal + reservaEstatutaria,
        acoesTesouraria: 0,
        lucrosPrejuizosAcumulados: 4200.00 + lucrosRetidos,
        totalPl: (capitalSocialBase + 100000.00) + 25000.00 + (85000.00 + reservaLegal + reservaEstatutaria) + (4200.00 + lucrosRetidos)
      }
    ];

    const totalFinalPl = linhas[linhas.length - 1].totalPl;
    return { ano, empresaId, linhas, totalFinalPl };
  }

  public getDemonstracaoDva(empresaId: number, ano: number): DemonstracaoDva {
    const dreLinhas = this.gerarDREConsolidada(empresaId);
    const recLinha = dreLinhas.find(l => l.descricao.includes('RECEITA OPERACIONAL BRUTA'));
    const receitaBruta = (recLinha && recLinha.valorConsolidado > 0) ? recLinha.valorConsolidado : 890000.00;
    const custosLinha = dreLinhas.find(l => l.descricao.includes('CUSTOS'));
    const custosInsumos = (custosLinha && custosLinha.valorConsolidado > 0) ? custosLinha.valorConsolidado : 320000.00;
    const servicosTerceiros = 65000.00;
    const depreciacao = 18500.00;
    const valorAdicionadoBruto = receitaBruta - custosInsumos - servicosTerceiros;
    const valorAdicionadoLiquido = valorAdicionadoBruto - depreciacao;
    const valorAdicionadoTotal = valorAdicionadoLiquido;

    const geracaoValor: ItemDva[] = [
      { codigo: '1', descricao: 'RECEITAS', nivel: 1, valor: receitaBruta },
      { codigo: '1.1', descricao: 'Venda de mercadorias, produtos e serviços', nivel: 2, valor: receitaBruta },
      { codigo: '2', descricao: 'INSUMOS ADQUIRIDOS DE TERCEIROS', nivel: 1, valor: custosInsumos + servicosTerceiros },
      { codigo: '2.1', descricao: 'Custos das mercadorias e produtos vendidos', nivel: 2, valor: custosInsumos },
      { codigo: '2.2', descricao: 'Materiais, energia e serviços de terceiros', nivel: 2, valor: servicosTerceiros },
      { codigo: '3', descricao: 'VALOR ADICIONADO BRUTO (1 - 2)', nivel: 1, valor: valorAdicionadoBruto },
      { codigo: '4', descricao: 'RETENÇÕES (Depreciação, amortização e exaustão)', nivel: 1, valor: depreciacao },
      { codigo: '5', descricao: 'VALOR ADICIONADO LÍQUIDO PRODUZIDO PELA ENTIDADE (3 - 4)', nivel: 1, valor: valorAdicionadoLiquido },
      { codigo: '6', descricao: 'VALOR ADICIONADO TOTAL A DISTRIBUIR', nivel: 1, valor: valorAdicionadoTotal }
    ];

    const despesasPessoal = 195000.00;
    const impostosFederais = 62000.00;
    const impostosEstaduais = 48000.00;
    const jurosAlugueis = 24000.00;
    const lucrosAcionistas = valorAdicionadoTotal - (despesasPessoal + impostosFederais + impostosEstaduais + jurosAlugueis);

    const distribuicaoValor: ItemDva[] = [
      { codigo: '7.1', descricao: 'PESSOAL & ENCARGOS (Salários, Benefícios e FGTS)', nivel: 1, valor: despesasPessoal },
      { codigo: '7.2', descricao: 'IMPOSTOS, TAXAS E CONTRIBUIÇÕES', nivel: 1, valor: impostosFederais + impostosEstaduais },
      { codigo: '7.2.1', descricao: 'Federais (IRPJ, CSLL, PIS, COFINS, INSS Patronal)', nivel: 2, valor: impostosFederais },
      { codigo: '7.2.2', descricao: 'Estaduais e Municipais (ICMS, ISSQN)', nivel: 2, valor: impostosEstaduais },
      { codigo: '7.3', descricao: 'REMUNERAÇÃO DE CAPITAIS DE TERCEIROS (Juros e Aluguéis)', nivel: 1, valor: jurosAlugueis },
      { codigo: '7.4', descricao: 'REMUNERAÇÃO DE CAPITAIS PRÓPRIOS (Lucros Retidos e Dividendos)', nivel: 1, valor: lucrosAcionistas }
    ];

    return { ano, empresaId, geracaoValor, distribuicaoValor, valorAdicionadoTotal };
  }

  // ----------------------------------------------------
  // LIVRO REGISTRO DE INVENTÁRIO MODELO 7 & SPED BLOCO H
  // ----------------------------------------------------
  public getInventarioEstoque(empresaId: number, ano: number): InventarioEstoqueModelo7 {
    const itens = this.itensInventarioEstoque.filter(i => i.empresaId === empresaId && i.ano === ano);
    const totalEstoque = itens.reduce((acc, i) => acc + i.valorTotal, 0);
    return {
      ano,
      empresaId,
      dataInventario: `${ano}-12-31`,
      motivoInventario: '01 - No encerramento do período social',
      totalEstoque,
      itens,
      geradoEm: new Date().toISOString()
    };
  }

  public saveItemInventarioEstoque(item: Partial<ItemInventarioEstoque>): ItemInventarioEstoque {
    let itemSalvo: ItemInventarioEstoque;
    const qtd = Number(item.quantidade || 0);
    const custo = Number(item.custoMedioUnitario || 0);
    const total = Number((qtd * custo).toFixed(2));

    if (item.id) {
      const idx = this.itensInventarioEstoque.findIndex(i => i.id === item.id);
      if (idx !== -1) {
        this.itensInventarioEstoque[idx] = {
          ...this.itensInventarioEstoque[idx],
          ...item,
          quantidade: qtd,
          custoMedioUnitario: custo,
          valorTotal: total
        };
        itemSalvo = this.itensInventarioEstoque[idx];
      } else {
        itemSalvo = { ...(item as ItemInventarioEstoque), valorTotal: total };
        this.itensInventarioEstoque.push(itemSalvo);
      }
    } else {
      const novoId = this.itensInventarioEstoque.length > 0 ? Math.max(...this.itensInventarioEstoque.map(i => i.id)) + 1 : 1;
      itemSalvo = {
        id: novoId,
        empresaId: item.empresaId || 1,
        ano: item.ano || 2026,
        dataInventario: item.dataInventario || `${item.ano || 2026}-12-31`,
        codigoItem: item.codigoItem || `PROD-${novoId}`,
        descricaoItem: item.descricaoItem || 'Item de Estoque',
        tipoItemSped: item.tipoItemSped || '00',
        unidadeMedida: item.unidadeMedida || 'UN',
        quantidade: qtd,
        custoMedioUnitario: custo,
        valorTotal: total,
        indicadorPropriedade: item.indicadorPropriedade || '0',
        contaContabilCodigo: item.contaContabilCodigo || '1.01.03.001.0001'
      };
      this.itensInventarioEstoque.push(itemSalvo);
    }
    this.persistSnapshot();
    this.registrarAuditoria('INVENTARIO_ESTOQUE', 'SALVAMENTO', `Item de estoque ${itemSalvo.codigoItem} (${itemSalvo.descricaoItem}) cadastrado/atualizado.`);
    return itemSalvo;
  }

  public deleteItemInventarioEstoque(id: number): boolean {
    const idx = this.itensInventarioEstoque.findIndex(i => i.id === id);
    if (idx !== -1) {
      const rem = this.itensInventarioEstoque.splice(idx, 1)[0];
      this.persistSnapshot();
      this.registrarAuditoria('INVENTARIO_ESTOQUE', 'EXCLUSAO', `Item ${rem.codigoItem} excluído do inventário.`);
      return true;
    }
    return false;
  }

  public gerarSpedFiscalBlocoH(empresaId: number, ano: number): string {
    const inventario = this.getInventarioEstoque(empresaId, ano);
    const lines: string[] = [];
    let contadorLinhas = 0;

    lines.push(`|H001|0|`);
    contadorLinhas++;

    const dtInvFormatada = inventario.dataInventario.split('-').reverse().join('');
    const totalEstoqueStr = inventario.totalEstoque.toFixed(2).replace('.', ',');
    lines.push(`|H005|${dtInvFormatada}|${totalEstoqueStr}|01|`);
    contadorLinhas++;

    inventario.itens.forEach(it => {
      const qtdStr = it.quantidade.toFixed(3).replace('.', ',');
      const custoStr = it.custoMedioUnitario.toFixed(6).replace('.', ',');
      const totalStr = it.valorTotal.toFixed(2).replace('.', ',');
      lines.push(`|H010|${it.codigoItem}|${it.unidadeMedida}|${qtdStr}|${custoStr}|${totalStr}|${it.indicadorPropriedade}|||||${it.contaContabilCodigo || ''}||`);
      contadorLinhas++;
    });

    contadorLinhas++;
    lines.push(`|H990|${contadorLinhas}|`);
    return lines.join('\r\n');
  }

  // ==========================================
  // SIMPLES NACIONAL AVANÇADO & PGDAS-D
  // ==========================================
  public getTabelasSimplesNacional(): Record<AnexoSimplesNacional, FaixaSimplesNacional[]> {
    return {
      ANEXO_I: [
        { faixa: 1, limiteInferior: 0, limiteSuperior: 180000, aliquotaNominal: 0.0400, deducao: 0, distribuicao: { irpj: 5.5, csll: 3.5, cofins: 12.74, pis: 2.76, cpp: 41.5, icms: 34.0 } },
        { faixa: 2, limiteInferior: 180000.01, limiteSuperior: 360000, aliquotaNominal: 0.0730, deducao: 5940, distribuicao: { irpj: 5.5, csll: 3.5, cofins: 12.74, pis: 2.76, cpp: 41.5, icms: 34.0 } },
        { faixa: 3, limiteInferior: 360000.01, limiteSuperior: 720000, aliquotaNominal: 0.0950, deducao: 13860, distribuicao: { irpj: 5.5, csll: 3.5, cofins: 12.74, pis: 2.76, cpp: 41.5, icms: 34.0 } },
        { faixa: 4, limiteInferior: 720000.01, limiteSuperior: 1800000, aliquotaNominal: 0.1070, deducao: 22500, distribuicao: { irpj: 5.5, csll: 3.5, cofins: 12.74, pis: 2.76, cpp: 41.5, icms: 34.0 } },
        { faixa: 5, limiteInferior: 1800000.01, limiteSuperior: 3600000, aliquotaNominal: 0.1430, deducao: 87300, distribuicao: { irpj: 5.5, csll: 3.5, cofins: 12.74, pis: 2.76, cpp: 41.5, icms: 34.0 } },
        { faixa: 6, limiteInferior: 3600000.01, limiteSuperior: 4800000, aliquotaNominal: 0.1900, deducao: 378000, distribuicao: { irpj: 13.5, csll: 10.0, cofins: 28.27, pis: 6.13, cpp: 42.1, icms: 0 } }
      ],
      ANEXO_II: [
        { faixa: 1, limiteInferior: 0, limiteSuperior: 180000, aliquotaNominal: 0.0450, deducao: 0, distribuicao: { irpj: 5.5, csll: 3.5, cofins: 11.51, pis: 2.49, cpp: 37.5, icms: 32.0, ipi: 7.5 } },
        { faixa: 2, limiteInferior: 180000.01, limiteSuperior: 360000, aliquotaNominal: 0.0780, deducao: 5940, distribuicao: { irpj: 5.5, csll: 3.5, cofins: 11.51, pis: 2.49, cpp: 37.5, icms: 32.0, ipi: 7.5 } },
        { faixa: 3, limiteInferior: 360000.01, limiteSuperior: 720000, aliquotaNominal: 0.1000, deducao: 13860, distribuicao: { irpj: 5.5, csll: 3.5, cofins: 11.51, pis: 2.49, cpp: 37.5, icms: 32.0, ipi: 7.5 } },
        { faixa: 4, limiteInferior: 720000.01, limiteSuperior: 1800000, aliquotaNominal: 0.1120, deducao: 22500, distribuicao: { irpj: 5.5, csll: 3.5, cofins: 11.51, pis: 2.49, cpp: 37.5, icms: 32.0, ipi: 7.5 } },
        { faixa: 5, limiteInferior: 1800000.01, limiteSuperior: 3600000, aliquotaNominal: 0.1470, deducao: 85500, distribuicao: { irpj: 5.5, csll: 3.5, cofins: 11.51, pis: 2.49, cpp: 37.5, icms: 32.0, ipi: 7.5 } },
        { faixa: 6, limiteInferior: 3600000.01, limiteSuperior: 4800000, aliquotaNominal: 0.3000, deducao: 720000, distribuicao: { irpj: 8.5, csll: 7.5, cofins: 20.96, pis: 4.54, cpp: 23.5, icms: 0, ipi: 35.0 } }
      ],
      ANEXO_III: [
        { faixa: 1, limiteInferior: 0, limiteSuperior: 180000, aliquotaNominal: 0.0600, deducao: 0, distribuicao: { irpj: 4.0, csll: 3.5, cofins: 12.82, pis: 2.78, cpp: 43.4, iss: 33.5 } },
        { faixa: 2, limiteInferior: 180000.01, limiteSuperior: 360000, aliquotaNominal: 0.1120, deducao: 9360, distribuicao: { irpj: 4.0, csll: 3.5, cofins: 12.82, pis: 2.78, cpp: 43.4, iss: 33.5 } },
        { faixa: 3, limiteInferior: 360000.01, limiteSuperior: 720000, aliquotaNominal: 0.1350, deducao: 17640, distribuicao: { irpj: 4.0, csll: 3.5, cofins: 12.82, pis: 2.78, cpp: 43.4, iss: 33.5 } },
        { faixa: 4, limiteInferior: 720000.01, limiteSuperior: 1800000, aliquotaNominal: 0.1600, deducao: 35640, distribuicao: { irpj: 4.0, csll: 3.5, cofins: 12.82, pis: 2.78, cpp: 43.4, iss: 33.5 } },
        { faixa: 5, limiteInferior: 1800000.01, limiteSuperior: 3600000, aliquotaNominal: 0.2100, deducao: 125640, distribuicao: { irpj: 4.0, csll: 3.5, cofins: 12.82, pis: 2.78, cpp: 43.4, iss: 33.5 } },
        { faixa: 6, limiteInferior: 3600000.01, limiteSuperior: 4800000, aliquotaNominal: 0.3300, deducao: 648000, distribuicao: { irpj: 35.0, csll: 15.0, cofins: 16.03, pis: 3.47, cpp: 30.5, iss: 0 } }
      ],
      ANEXO_IV: [
        { faixa: 1, limiteInferior: 0, limiteSuperior: 180000, aliquotaNominal: 0.0450, deducao: 0, distribuicao: { irpj: 18.8, csll: 15.2, cofins: 17.67, pis: 3.83, cpp: 0, iss: 44.5 } },
        { faixa: 2, limiteInferior: 180000.01, limiteSuperior: 360000, aliquotaNominal: 0.0900, deducao: 8100, distribuicao: { irpj: 18.8, csll: 15.2, cofins: 17.67, pis: 3.83, cpp: 0, iss: 44.5 } },
        { faixa: 3, limiteInferior: 360000.01, limiteSuperior: 720000, aliquotaNominal: 0.1020, deducao: 12420, distribuicao: { irpj: 18.8, csll: 15.2, cofins: 17.67, pis: 3.83, cpp: 0, iss: 44.5 } },
        { faixa: 4, limiteInferior: 720000.01, limiteSuperior: 1800000, aliquotaNominal: 0.1400, deducao: 39780, distribuicao: { irpj: 18.8, csll: 15.2, cofins: 17.67, pis: 3.83, cpp: 0, iss: 44.5 } },
        { faixa: 5, limiteInferior: 1800000.01, limiteSuperior: 3600000, aliquotaNominal: 0.2200, deducao: 183780, distribuicao: { irpj: 18.8, csll: 15.2, cofins: 17.67, pis: 3.83, cpp: 0, iss: 44.5 } },
        { faixa: 6, limiteInferior: 3600000.01, limiteSuperior: 4800000, aliquotaNominal: 0.3300, deducao: 828000, distribuicao: { irpj: 53.5, csll: 21.5, cofins: 20.55, pis: 4.45, cpp: 0, iss: 0 } }
      ],
      ANEXO_V: [
        { faixa: 1, limiteInferior: 0, limiteSuperior: 180000, aliquotaNominal: 0.1550, deducao: 0, distribuicao: { irpj: 25.0, csll: 15.0, cofins: 14.10, pis: 3.05, cpp: 28.85, iss: 14.0 } },
        { faixa: 2, limiteInferior: 180000.01, limiteSuperior: 360000, aliquotaNominal: 0.1800, deducao: 4500, distribuicao: { irpj: 23.0, csll: 15.0, cofins: 14.10, pis: 3.05, cpp: 27.85, iss: 17.0 } },
        { faixa: 3, limiteInferior: 360000.01, limiteSuperior: 720000, aliquotaNominal: 0.1950, deducao: 9900, distribuicao: { irpj: 24.0, csll: 15.0, cofins: 14.10, pis: 3.05, cpp: 23.85, iss: 20.0 } },
        { faixa: 4, limiteInferior: 720000.01, limiteSuperior: 1800000, aliquotaNominal: 0.2050, deducao: 17100, distribuicao: { irpj: 21.0, csll: 15.0, cofins: 14.10, pis: 3.05, cpp: 23.85, iss: 23.0 } },
        { faixa: 5, limiteInferior: 1800000.01, limiteSuperior: 3600000, aliquotaNominal: 0.2300, deducao: 62100, distribuicao: { irpj: 23.0, csll: 12.5, cofins: 14.10, pis: 3.05, cpp: 23.85, iss: 23.5 } },
        { faixa: 6, limiteInferior: 3600000.01, limiteSuperior: 4800000, aliquotaNominal: 0.3050, deducao: 540000, distribuicao: { irpj: 35.0, csll: 15.5, cofins: 16.03, pis: 3.47, cpp: 30.0, iss: 0 } }
      ]
    };
  }

  public getApuracaoPgdas(empresaId: number, competencia: string): ApuracaoPgdas {
    const encontrada = this.apuracoesPgdas.find(a => a.empresaId === empresaId && a.competencia === competencia);
    if (encontrada) return encontrada;

    const [anoStr, mesStr] = competencia.split('-');
    const ano = parseInt(anoStr) || 2026;
    const mes = parseInt(mesStr) || 4;

    const notas = this.getNotasFiscais(empresaId);
    let rbt12 = 1250000.00;
    let folha12 = 385000.00;

    const fatorR = folha12 > 0 ? Number((folha12 / rbt12).toFixed(4)) : 0.308;
    const enquadraFatorR = fatorR >= 0.28;

    const notasComp = notas.filter(n => n.dataEmissao.startsWith(competencia));
    const totalSaidas = notasComp.filter(n => n.tipo === 'SAIDA').reduce((acc, n) => acc + n.valorTotal, 0) || 30000.00;
    const totalServicos = notasComp.filter(n => n.tipo === 'SERVICO').reduce((acc, n) => acc + n.valorTotal, 0) || 85000.00;
    const faturamentoMes = totalSaidas + totalServicos;

    const tabelas = this.getTabelasSimplesNacional();

    // Segregação 1: Serviços
    const anexoServico: AnexoSimplesNacional = enquadraFatorR ? 'ANEXO_III' : 'ANEXO_V';
    const faixaServ = tabelas[anexoServico].find(f => rbt12 >= f.limiteInferior && rbt12 <= f.limiteSuperior) || tabelas[anexoServico][2];
    const aliqEfetivaServ = Number((((rbt12 * faixaServ.aliquotaNominal) - faixaServ.deducao) / rbt12).toFixed(4));
    const valorDevidoServ = Number((totalServicos * aliqEfetivaServ).toFixed(2));

    const distServ = faixaServ.distribuicao;
    const tributosServ = {
      irpj: Number(((valorDevidoServ * distServ.irpj) / 100).toFixed(2)),
      csll: Number(((valorDevidoServ * distServ.csll) / 100).toFixed(2)),
      cofins: Number(((valorDevidoServ * distServ.cofins) / 100).toFixed(2)),
      pis: Number(((valorDevidoServ * distServ.pis) / 100).toFixed(2)),
      cpp: Number(((valorDevidoServ * distServ.cpp) / 100).toFixed(2)),
      icms: 0,
      ipi: 0,
      iss: Number(((valorDevidoServ * (distServ.iss || 0)) / 100).toFixed(2))
    };

    // Segregação 2: Comércio
    const faixaCom = tabelas.ANEXO_I.find(f => rbt12 >= f.limiteInferior && rbt12 <= f.limiteSuperior) || tabelas.ANEXO_I[2];
    const aliqEfetivaCom = Number((((rbt12 * faixaCom.aliquotaNominal) - faixaCom.deducao) / rbt12).toFixed(4));
    const valorDevidoCom = Number((totalSaidas * aliqEfetivaCom).toFixed(2));
    const distCom = faixaCom.distribuicao;
    const tributosCom = {
      irpj: Number(((valorDevidoCom * distCom.irpj) / 100).toFixed(2)),
      csll: Number(((valorDevidoCom * distCom.csll) / 100).toFixed(2)),
      cofins: Number(((valorDevidoCom * distCom.cofins) / 100).toFixed(2)),
      pis: Number(((valorDevidoCom * distCom.pis) / 100).toFixed(2)),
      cpp: Number(((valorDevidoCom * distCom.cpp) / 100).toFixed(2)),
      icms: Number(((valorDevidoCom * (distCom.icms || 0)) / 100).toFixed(2)),
      ipi: 0,
      iss: 0
    };

    const segregacoes: SegregacaoReceitaPgdas[] = [
      {
        id: `SEG-SERV-${competencia}`,
        anexo: anexoServico,
        descricaoAtividade: `Prestação de Serviços Especializados (Fator R ${(fatorR * 100).toFixed(1)}%)`,
        valorReceitaBruta: totalServicos,
        valorImuneIsento: 0,
        valorSubstituicaoTributaria: 0,
        valorTributavel: totalServicos,
        aliquotaEfetiva: aliqEfetivaServ,
        valorDevido: valorDevidoServ,
        detalhamentoTributos: tributosServ
      },
      {
        id: `SEG-COM-${competencia}`,
        anexo: 'ANEXO_I',
        descricaoAtividade: 'Revenda de Mercadorias sem ST no Mercado Interno',
        valorReceitaBruta: totalSaidas,
        valorImuneIsento: 0,
        valorSubstituicaoTributaria: 0,
        valorTributavel: totalSaidas,
        aliquotaEfetiva: aliqEfetivaCom,
        valorDevido: valorDevidoCom,
        detalhamentoTributos: tributosCom
      }
    ];

    const totalDevidoDas = Number((valorDevidoServ + valorDevidoCom).toFixed(2));
    const proxMes = mes === 12 ? 1 : mes + 1;
    const proxAno = mes === 12 ? ano + 1 : ano;
    const dataVenc = `${proxAno}-${String(proxMes).padStart(2, '0')}-20`;

    const novoId = this.apuracoesPgdas.length > 0 ? Math.max(...this.apuracoesPgdas.map(a => a.id)) + 1 : 1;
    const novaApuracao: ApuracaoPgdas = {
      id: novoId,
      empresaId,
      competencia,
      dataVencimento: dataVenc,
      rbt12,
      faturamentoMes,
      folhaSalarios12Meses: folha12,
      fatorR,
      enquadraFatorR,
      segregacoes,
      totalDevidoDas,
      numeroDas: `01.${ano}.${String(mes).padStart(2, '0')}.${Math.floor(10000000 + Math.random() * 90000000)}.12`,
      codigoBarrasDas: `85870000${String(Math.floor(totalDevidoDas)).padStart(5, '0')}-3 ${String(Math.floor(Math.random() * 90000000000))}-6 60520260488-8 77665512001-9`,
      qrCodePixDas: `00020126580014br.gov.bcb.pix0136pgdas-${competencia}@receita.fazenda.gov.br5204000053039865408${totalDevidoDas.toFixed(2)}5802BR5925RECEITA FEDERAL DO BRASIL6009SAO PAULO62240520DAS${competencia}6304D1B8`,
      statusIntegracaoContabil: false,
      dataApuracao: new Date().toISOString().substring(0, 10)
    };

    this.apuracoesPgdas.push(novaApuracao);
    this.persistSnapshot();
    return novaApuracao;
  }

  public salvarApuracaoPgdas(apuracao: ApuracaoPgdas): ApuracaoPgdas {
    const idx = this.apuracoesPgdas.findIndex(a => a.id === apuracao.id);
    if (idx !== -1) {
      this.apuracoesPgdas[idx] = { ...apuracao };
    } else {
      this.apuracoesPgdas.push(apuracao);
    }
    this.persistSnapshot();
    this.registrarAuditoria('PGDAS_D', 'GRAVACAO', `Apuração PGDAS-D ref. ${apuracao.competencia} salva (R$ ${apuracao.totalDevidoDas.toFixed(2)}).`);
    return apuracao;
  }

  public integrarPgdasContabil(apuracaoId: number): { sucesso: boolean; loteId: number; mensagem: string } {
    const apuracao = this.apuracoesPgdas.find(a => a.id === apuracaoId);
    if (!apuracao) {
      return { sucesso: false, loteId: 0, mensagem: 'Apuração PGDAS-D não encontrada.' };
    }
    if (apuracao.statusIntegracaoContabil) {
      return { sucesso: true, loteId: apuracao.loteContabilId || 0, mensagem: 'Apuração já integrada na contabilidade.' };
    }

    const novoLoteId = this.lotes.length > 0 ? Math.max(...this.lotes.map(l => l.id)) + 1 : 1;
    const contaDespesa = this.contas.find(c => c.nome.toLowerCase().includes('simples nacional') && (c.classificacao.startsWith('3') || c.classificacao.startsWith('4'))) || this.contas[15] || this.contas[0];
    const contaPassivo = this.contas.find(c => c.nome.toLowerCase().includes('simples nacional a recolher')) || this.contas[16] || this.contas[1];

    const novoLancId = this.lancamentos.length > 0 ? Math.max(...this.lancamentos.map(l => l.id)) + 1 : 1;
    const lanc: LancamentoContabil = {
      id: novoLancId,
      empresaId: apuracao.empresaId,
      numeroPartida: 1,
      loteId: novoLoteId,
      dataLancamento: apuracao.dataVencimento,
      tipoPartida: 'SIMPLES',
      contaDebitoId: contaDespesa.id,
      contaCreditoId: contaPassivo.id,
      valor: apuracao.totalDevidoDas,
      historicoId: 1,
      complementoHistorico: `Vlr. ref. apropriação Simples Nacional DAS PGDAS-D ref. comp. ${apuracao.competencia}`,
      createdAt: new Date().toISOString()
    };

    this.lancamentos.push(lanc);
    apuracao.statusIntegracaoContabil = true;
    apuracao.loteContabilId = novoLoteId;

    this.persistSnapshot();
    this.registrarAuditoria('PGDAS_D', 'INTEGRACAO_CONTABIL', `Lote nº ${novoLoteId} gerado para apuração PGDAS-D comp. ${apuracao.competencia}.`);
    return { sucesso: true, loteId: novoLoteId, mensagem: 'Integração contábil do Simples Nacional realizada com sucesso!' };
  }

  // ==========================================
  // GESTÃO DE BENEFÍCIOS (VT / VR / SAÚDE)
  // ==========================================
  public getPlanosBeneficios(empresaId?: number): BeneficioPlano[] {
    const empId = empresaId || this.activeEmpresaId;
    return this.planosBeneficios.filter(p => p.empresaId === empId);
  }

  public salvarPlanoBeneficio(plano: BeneficioPlano): BeneficioPlano {
    const idx = this.planosBeneficios.findIndex(p => p.id === plano.id);
    if (idx !== -1) {
      this.planosBeneficios[idx] = { ...plano };
    } else {
      plano.id = this.planosBeneficios.length > 0 ? Math.max(...this.planosBeneficios.map(p => p.id)) + 1 : 1;
      this.planosBeneficios.push(plano);
    }
    this.persistSnapshot();
    this.registrarAuditoria('BENEFICIOS', 'SALVAMENTO_PLANO', `Plano ${plano.nome} (${plano.tipo}) salvo.`);
    return plano;
  }

  public getFechamentoBeneficios(empresaId: number, competencia: string): FechamentoBeneficiosCompetencia {
    const fechamento = this.fechamentosBeneficios.find(f => f.empresaId === empresaId && f.competencia === competencia);
    if (fechamento) return fechamento;

    const colaboradores = this.getColaboradores(empresaId).filter(c => c.status === 'ATIVO');
    const planos = this.getPlanosBeneficios(empresaId).filter(p => p.ativo);

    const planoVt = planos.find(p => p.tipo === 'VALE_TRANSPORTE') || {
      id: 1, empresaId, tipo: 'VALE_TRANSPORTE' as TipoBeneficio, nome: 'Vale-Transporte Urbano', operadora: 'SPTrans', valorFacialUnitario: 5.00, percentualDescontoLegal: 6.0, ativo: true
    };
    const planoVr = planos.find(p => p.tipo === 'VALE_REFEICAO') || {
      id: 2, empresaId, tipo: 'VALE_REFEICAO' as TipoBeneficio, nome: 'Vale-Refeição Flex', operadora: 'Flash', valorFacialUnitario: 38.00, percentualDescontoLegal: 10.0, ativo: true
    };

    const diasUteis = 22;
    const itens: BeneficioColaboradorItem[] = [];
    let itemId = 1;

    colaboradores.forEach(colab => {
      const salarioBase = colab.salarioBase || 2500;
      const totalVt = diasUteis * 2 * planoVt.valorFacialUnitario;
      const tetoDescontoVt = (salarioBase * planoVt.percentualDescontoLegal) / 100;
      const descontoVt = Math.min(totalVt, tetoDescontoVt);
      const custoEmpresaVt = Math.max(0, totalVt - descontoVt);

      itens.push({
        id: itemId++,
        empresaId,
        colaboradorId: colab.id,
        colaboradorNome: colab.nome,
        planoId: planoVt.id,
        tipo: 'VALE_TRANSPORTE',
        diasUteisMes: diasUteis,
        quantidadeDiaria: 2,
        valorTotalBeneficio: totalVt,
        descontoColaborador: Number(descontoVt.toFixed(2)),
        custoEmpregador: Number(custoEmpresaVt.toFixed(2)),
        coparticipacao: 0
      });

      const totalVr = diasUteis * 1 * planoVr.valorFacialUnitario;
      const descontoVr = (totalVr * planoVr.percentualDescontoLegal) / 100;
      const custoEmpresaVr = Math.max(0, totalVr - descontoVr);

      itens.push({
        id: itemId++,
        empresaId,
        colaboradorId: colab.id,
        colaboradorNome: colab.nome,
        planoId: planoVr.id,
        tipo: 'VALE_REFEICAO',
        diasUteisMes: diasUteis,
        quantidadeDiaria: 1,
        valorTotalBeneficio: totalVr,
        descontoColaborador: Number(descontoVr.toFixed(2)),
        custoEmpregador: Number(custoEmpresaVr.toFixed(2)),
        coparticipacao: 0
      });
    });

    const totalBeneficiosFornecidos = Number(itens.reduce((acc, i) => acc + i.valorTotalBeneficio, 0).toFixed(2));
    const totalDescontoEmpregados = Number(itens.reduce((acc, i) => acc + i.descontoColaborador, 0).toFixed(2));
    const totalCustoEmpresa = Number(itens.reduce((acc, i) => acc + i.custoEmpregador, 0).toFixed(2));

    const totalValeTransporte = Number(itens.filter(i => i.tipo === 'VALE_TRANSPORTE').reduce((acc, i) => acc + i.valorTotalBeneficio, 0).toFixed(2));
    const totalValeRefeicaoAlimentacao = Number(itens.filter(i => i.tipo === 'VALE_REFEICAO' || i.tipo === 'VALE_ALIMENTACAO').reduce((acc, i) => acc + i.valorTotalBeneficio, 0).toFixed(2));
    const totalPlanosSaudeOdonto = Number(itens.filter(i => i.tipo === 'PLANO_SAUDE' || i.tipo === 'PLANO_ODONTO').reduce((acc, i) => acc + i.valorTotalBeneficio, 0).toFixed(2));

    const novoFechamento: FechamentoBeneficiosCompetencia = {
      competencia,
      empresaId,
      totalBeneficiosFornecidos,
      totalDescontoEmpregados,
      totalCustoEmpresa,
      totalValeTransporte,
      totalValeRefeicaoAlimentacao,
      totalPlanosSaudeOdonto,
      itens,
      statusIntegracaoContabil: false,
      fechadoEm: new Date().toISOString().substring(0, 10)
    };

    this.fechamentosBeneficios.push(novoFechamento);
    this.persistSnapshot();
    return novoFechamento;
  }

  public salvarFechamentoBeneficios(fechamento: FechamentoBeneficiosCompetencia): void {
    const idx = this.fechamentosBeneficios.findIndex(f => f.empresaId === fechamento.empresaId && f.competencia === fechamento.competencia);
    if (idx !== -1) {
      this.fechamentosBeneficios[idx] = { ...fechamento };
    } else {
      this.fechamentosBeneficios.push(fechamento);
    }
    this.persistSnapshot();
    this.registrarAuditoria('BENEFICIOS', 'FECHAMENTO', `Mapa de benefícios ref. ${fechamento.competencia} salvo com sucesso.`);
  }

  public integrarBeneficiosContabil(empresaId: number, competencia: string): { sucesso: boolean; loteId: number; mensagem: string } {
    const fechamento = this.getFechamentoBeneficios(empresaId, competencia);
    if (fechamento.statusIntegracaoContabil) {
      return { sucesso: true, loteId: fechamento.loteContabilId || 0, mensagem: 'Benefícios já integrados contabilmente.' };
    }

    const novoLoteId = this.lotes.length > 0 ? Math.max(...this.lotes.map(l => l.id)) + 1 : 1;
    const contaDespesaBeneficios = this.contas.find(c => c.nome.toLowerCase().includes('benefícios') || c.classificacao.startsWith('3.01.01') || c.classificacao.startsWith('4.01.01')) || this.contas[10];
    const contaBeneficiosPagar = this.contas.find(c => c.nome.toLowerCase().includes('benefícios a pagar') || c.classificacao.startsWith('2.01.03')) || this.contas[14];

    const novoLancId = this.lancamentos.length > 0 ? Math.max(...this.lancamentos.map(l => l.id)) + 1 : 1;
    const lanc: LancamentoContabil = {
      id: novoLancId,
      empresaId,
      numeroPartida: 1,
      loteId: novoLoteId,
      dataLancamento: `${competencia}-28`,
      tipoPartida: 'SIMPLES',
      contaDebitoId: contaDespesaBeneficios.id,
      contaCreditoId: contaBeneficiosPagar.id,
      valor: fechamento.totalCustoEmpresa,
      historicoId: 1,
      complementoHistorico: `Vlr. ref. provisão de custo patronal de benefícios aos colaboradores (VT/VR) comp. ${competencia}`,
      createdAt: new Date().toISOString()
    };

    this.lancamentos.push(lanc);
    fechamento.statusIntegracaoContabil = true;
    fechamento.loteContabilId = novoLoteId;

    this.persistSnapshot();
    this.registrarAuditoria('BENEFICIOS', 'INTEGRACAO_CONTABIL', `Lote nº ${novoLoteId} gerado para benefícios ref. ${competencia}.`);
    return { sucesso: true, loteId: novoLoteId, mensagem: 'Integração contábil de benefícios realizada com sucesso!' };
  }

  // ==========================================
  // BALANÇO SOCIAL MODELO IBASE (NBC T 15 / CFC)
  // ==========================================
  public getBalancoSocialIbase(empresaId: number, ano: number): BalancoSocialIbase {
    const dreLinhas = this.gerarDREConsolidada(empresaId);
    const recLinha = dreLinhas.find(l => l.descricao.includes('RECEITA') || l.descricao.includes('LÍQUIDA'));
    const receitaLiquida = (recLinha && recLinha.valorConsolidado > 0) ? recLinha.valorConsolidado : 3850000.00;
    const resLinha = dreLinhas.find(l => l.descricao.includes('RESULTADO') || l.descricao.includes('OPERACIONAL'));
    const resultadoOperacional = (resLinha && resLinha.valorConsolidado > 0) ? resLinha.valorConsolidado : 780000.00;
    const folhaPagamentoBruta = 850000.00;

    const calcPercFPB = (v: number) => Number(((v / folhaPagamentoBruta) * 100).toFixed(2));
    const calcPercRL = (v: number) => Number(((v / receitaLiquida) * 100).toFixed(2));

    const linhasInternos: LinhaBalancoSocial[] = [
      { codigo: '1.1', descricao: 'Alimentação / Refeição e Cesta Básica (PAT)', valorPeriodo: 48500.00, percentualSobreFolha: calcPercFPB(48500), percentualSobreReceita: calcPercRL(48500) },
      { codigo: '1.2', descricao: 'Previdência Social Obrigatória (INSS Patronal + GILRAT)', valorPeriodo: 187000.00, percentualSobreFolha: calcPercFPB(187000), percentualSobreReceita: calcPercRL(187000) },
      { codigo: '1.3', descricao: 'Fundo de Garantia por Tempo de Serviço (FGTS)', valorPeriodo: 68000.00, percentualSobreFolha: calcPercFPB(68000), percentualSobreReceita: calcPercRL(68000) },
      { codigo: '1.4', descricao: 'Assistência Médica e Odontológica Corporativa', valorPeriodo: 39600.00, percentualSobreFolha: calcPercFPB(39600), percentualSobreReceita: calcPercRL(39600) },
      { codigo: '1.5', descricao: 'Segurança e Medicina do Trabalho (EPI, PCMSO, PGR)', valorPeriodo: 14200.00, percentualSobreFolha: calcPercFPB(14200), percentualSobreReceita: calcPercRL(14200) },
      { codigo: '1.6', descricao: 'Educação, Capacitação e Desenvolvimento Profissional', valorPeriodo: 26800.00, percentualSobreFolha: calcPercFPB(26800), percentualSobreReceita: calcPercRL(26800) },
      { codigo: '1.7', descricao: 'Auxílio-Creche e Suporte à Primeira Infância', valorPeriodo: 8400.00, percentualSobreFolha: calcPercFPB(8400), percentualSobreReceita: calcPercRL(8400) },
      { codigo: '1.8', descricao: 'Participação nos Lucros ou Resultados (PLR / CLT)', valorPeriodo: 55000.00, percentualSobreFolha: calcPercFPB(55000), percentualSobreReceita: calcPercRL(55000) }
    ];
    const totalInternos = Number(linhasInternos.reduce((acc, l) => acc + l.valorPeriodo, 0).toFixed(2));

    const tributosTotais = 512000.00;
    const linhasExternos: LinhaBalancoSocial[] = [
      { codigo: '2.1', descricao: 'Projetos Comunitários de Apoio a Escolas e Moradia', valorPeriodo: 35000.00, percentualSobreReceita: calcPercRL(35000) },
      { codigo: '2.2', descricao: 'Apoio à Cultura, Música e Preservação do Patrimônio', valorPeriodo: 18500.00, percentualSobreReceita: calcPercRL(18500) },
      { codigo: '2.3', descricao: 'Apoio ao Esporte Amador e Inclusão Juvenil', valorPeriodo: 12000.00, percentualSobreReceita: calcPercRL(12000) },
      { codigo: '2.4', descricao: 'Total de Tributos e Encargos Recolhidos ao Governo', valorPeriodo: tributosTotais, percentualSobreReceita: calcPercRL(tributosTotais) }
    ];
    const totalExternos = Number(linhasExternos.reduce((acc, l) => acc + l.valorPeriodo, 0).toFixed(2));

    const linhasAmbientais: LinhaBalancoSocial[] = [
      { codigo: '3.1', descricao: 'Investimentos em Eficiência Energética e Energia Solar', valorPeriodo: 42000.00, percentualSobreReceita: calcPercRL(42000) },
      { codigo: '3.2', descricao: 'Reciclagem, Coleta Seletiva e Descarte Correto de E-Waste', valorPeriodo: 11500.00, percentualSobreReceita: calcPercRL(11500) },
      { codigo: '3.3', descricao: 'Auditorias e Certificações Ambientais ESG / ISO 14001', valorPeriodo: 16000.00, percentualSobreReceita: calcPercRL(16000) }
    ];
    const totalAmbientais = Number(linhasAmbientais.reduce((acc, l) => acc + l.valorPeriodo, 0).toFixed(2));

    const colaboradores = this.getColaboradores(empresaId);
    const totalColabs = Math.max(1, colaboradores.length);

    const corpoFuncional: IndicadorCorpoFuncionalIbase[] = [
      { descricao: 'Número total de empregados ao final do período', quantidadeInicio: totalColabs, quantidadeFim: totalColabs, percentualDoTotal: 100 },
      { descricao: 'Admissões realizadas durante o exercício', quantidadeInicio: 2, quantidadeFim: 2, percentualDoTotal: Number(((2 / totalColabs) * 100).toFixed(1)) },
      { descricao: 'Desligamentos ocorridos no exercício', quantidadeInicio: 1, quantidadeFim: 1, percentualDoTotal: Number(((1 / totalColabs) * 100).toFixed(1)) },
      { descricao: 'Participação feminina no quadro de colaboradores', quantidadeInicio: Math.round(totalColabs * 0.45), quantidadeFim: Math.round(totalColabs * 0.45), percentualDoTotal: 45.0 },
      { descricao: 'Colaboradores negros e pardos', quantidadeInicio: Math.round(totalColabs * 0.38), quantidadeFim: Math.round(totalColabs * 0.38), percentualDoTotal: 38.0 },
      { descricao: 'Colaboradores com mais de 45 anos de idade', quantidadeInicio: Math.round(totalColabs * 0.25), quantidadeFim: Math.round(totalColabs * 0.25), percentualDoTotal: 25.0 },
      { descricao: 'Pessoas com Deficiência (PCDs)', quantidadeInicio: Math.max(1, Math.round(totalColabs * 0.05)), quantidadeFim: Math.max(1, Math.round(totalColabs * 0.05)), percentualDoTotal: 5.0 }
    ];

    return {
      ano,
      empresaId,
      receitaLiquida,
      resultadoOperacional,
      folhaPagamentoBruta,
      indicadoresSociaisInternos: {
        titulo: '1. INDICADORES SOCIAIS INTERNOS',
        linhas: linhasInternos,
        totalSecao: totalInternos,
        percentualTotalSobreReceita: calcPercRL(totalInternos)
      },
      indicadoresSociaisExternos: {
        titulo: '2. INDICADORES SOCIAIS EXTERNOS',
        linhas: linhasExternos,
        totalSecao: totalExternos,
        percentualTotalSobreReceita: calcPercRL(totalExternos)
      },
      indicadoresAmbientais: {
        titulo: '3. INDICADORES AMBIENTAIS',
        linhas: linhasAmbientais,
        totalSecao: totalAmbientais,
        percentualTotalSobreReceita: calcPercRL(totalAmbientais)
      },
      indicadoresCorpoFuncional: corpoFuncional,
      informacoesCidadania: {
        regrasDisseminadas: true,
        dialogoSindical: true,
        previdenciaPrivadaInstituida: true,
        participacaoLucrosInstituida: true
      },
      geradoEm: new Date().toISOString()
    };
  }
}

export const dbService = new DatabaseService();
