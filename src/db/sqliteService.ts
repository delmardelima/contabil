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
  ProvisaoColaborador
} from '../types/contabil';

const STORAGE_KEYS = {
  SNAPSHOT: 'contabil_master_snapshot_v3',
  REDE_CONFIG: 'contabil_rede_config_v2',
  CURRENT_USER: 'contabil_current_user_v2'
};

// Seed de dados contábeis profissionais (Padrão CFC / CPC / Domínio)
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

// Plano de Contas Referencial Domínio / CFC
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
    integradaContabil: true
  },
  {
    id: 2,
    empresaId: 1,
    numero: 8820,
    serie: 'E',
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
    integradaContabil: false
  },
  {
    id: 3,
    empresaId: 1,
    numero: 1052,
    serie: '1',
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
    integradaContabil: false
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
      } catch (e) {
        this.carregarSeeds();
      }
    } else {
      this.carregarSeeds();
    }

    const rawRede = localStorage.getItem(STORAGE_KEYS.REDE_CONFIG);
    if (rawRede) {
      try { this.redeConfig = JSON.parse(rawRede); } catch(e) {}
    }

    const rawUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (rawUser) {
      try { this.currentUser = JSON.parse(rawUser); } catch(e) {}
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
    } catch (e) {}
    return false;
  }

  public importBackupJson(jsonStr: string): boolean {
    return this.restaurarBackupJSON(jsonStr);
  }

  // APIs Empresa
  public getEmpresas(): Empresa[] { return [...this.empresas]; }
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
}

export const dbService = new DatabaseService();
