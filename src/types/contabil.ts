// Tipos Fundamentais do Sistema Contábil (Baseado na Engenharia Reversa de C:\Contabil\contabil.exe)

export type RegimeTributario = 'SIMPLES_NACIONAL' | 'LUCRO_PRESUMIDO' | 'LUCRO_REAL' | 'IMUNE_ISENTA';
export type NaturezaConta = 'D' | 'C';
export type TipoConta = 'S' | 'A'; // Sintética | Analítica

export interface Empresa {
  id: number;
  codigo: number;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  nire?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  responsavelLegal?: string;
  cpfResponsavel?: string;
  contadorNome?: string;
  contadorCRC?: string;
  contadorCPF?: string;
  telefone?: string;
  email?: string;
  regimeTributario: RegimeTributario;
  exercicioAtivo: number;
  competenciaAtiva: string; // YYYY-MM
  mascaraPlano: string;
  exigeCentroCusto?: boolean;
}

export interface ContaContabil {
  id: number;
  empresaId: number;
  classificacao: string; // Ex: '1.01.01.001.0001'
  codigoReduzido: number;
  nome: string;
  tipo: TipoConta;
  natureza: NaturezaConta;
  grau: number;
  saldoAnterior: number;
  saldoAtual?: number;
  contaPaiId?: number;
  aceitaLancamento?: boolean;
}

export interface HistoricoPadrao {
  id: number;
  empresaId: number;
  codigo: number;
  descricao: string;
  exigeComplemento?: boolean;
}

export interface CentroCusto {
  id: number;
  empresaId: number;
  codigo: string;
  nome: string;
  tipo: 'S' | 'A';
}

export interface LancamentoPadrao {
  id: number;
  empresaId: number;
  codigo: number;
  descricao: string;
  contaDebitoId?: number;
  contaCreditoId?: number;
  historicoId?: number;
  complemento?: string;
  complementoPadrao?: string;
}

export interface LoteContabil {
  id: number;
  empresaId: number;
  numero: number;
  numeroLote?: number;
  descricao: string;
  dataLote: string;
  status: 'ABERTO' | 'FECHADO' | 'RASCUNHO';
  totalDebito: number;
  totalCredito: number;
}

export interface LancamentoContabil {
  id: number;
  empresaId: number;
  numeroPartida: number;
  loteId?: number;
  dataLancamento: string;
  tipoPartida: 'SIMPLES' | 'MULTIPLA';
  contaDebitoId?: number;
  contaCreditoId?: number;
  valor: number;
  centroCustoId?: number;
  historicoId?: number;
  complementoHistorico: string;
  isZeramento?: boolean;
  usuarioId?: number;
  usuarioNome?: string;
  createdAt: string;
}

export interface PartidaMultiplaItem {
  id: string;
  tipo: 'DEBITO' | 'CREDITO';
  contaId: number;
  valor: number;
  centroCustoId?: number;
  historicoId?: number;
  complemento: string;
}

export interface BalanceteItem {
  id: number;
  classificacao: string;
  codigoReduzido: number;
  nome: string;
  grau: number;
  tipo: TipoConta;
  natureza: NaturezaConta;
  saldoAnterior: number;
  debitos: number;
  creditos: number;
  saldoAtual: number;
  saldoAtualNatureza: NaturezaConta;
}

export interface BalancoItem {
  classificacao: string;
  nome: string;
  grau: number;
  tipo: TipoConta;
  saldo: number;
  isPassivoDescoberto?: boolean;
}

export interface DREEstruturaLinha {
  id: number;
  empresaId: number;
  ordem: number;
  descricao: string;
  tipoLinha: 'CONTA' | 'SUBTOTAL' | 'TOTAL_GERAL';
  operacao: 'SOMA' | 'SUBTRAI';
  prefixoContas?: string;
  isBasePercentual?: boolean;
}

export interface DREItemCalculado {
  id: number;
  ordem: number;
  descricao: string;
  tipoLinha: 'CONTA' | 'SUBTOTAL' | 'TOTAL_GERAL';
  operacao: 'SOMA' | 'SUBTRAI';
  valor: number;
  analiseVerticalPerc: number;
  analiseHorizontalPerc?: number;
}

export interface DocumentoStudio {
  id: number;
  empresaId: number;
  titulo: string;
  tipo: 'NOTA_EXPLICATIVA' | 'TERMO_ABERTURA' | 'TERMO_ENCERRAMENTO' | 'RELATORIO_DIRETORIA';
  exercicioAno: number;
  conteudoHtml: string;
  updatedAt: string;
}

export type PerfilUsuario = 'ADMIN' | 'ANALISTA' | 'ASSISTENTE' | 'CONSULTA';

export interface Usuario {
  id: number;
  nome: string;
  login: string;
  senha?: string;
  perfil: PerfilUsuario;
  email: string;
  ativo: boolean;
}

export interface AuditoriaLog {
  id: number;
  dataHora: string;
  usuarioNome: string;
  modulo: string;
  acao: string;
  descricao: string;
}

export interface ParametrosEmpresa {
  empresaId: number;
  regimeContabil: 'COMPETENCIA' | 'CAIXA';
  bloquearLancamentosAte?: string;
  obrigaCentroCusto: boolean;
  permiteDiferencaDxC: boolean;
  avancaPaginaTrocaGrupo: boolean;
  contaDestinoZeramentoId: number;
  contaLucrosAcumuladosId: number;
  contaPrejuizosAcumuladosId: number;
  numeroLivroDiario: number;
  numeroFolhaInicial: number;
}

export interface ConfiguracaoRede {
  modo: 'SERVIDOR' | 'ESTACAO';
  serverHost: string;
  serverPort: number;
  isOnline?: boolean;
}

// ----------------------------------------------------
// SUÍTE MULTI-MÓDULO OFICIAL
// ----------------------------------------------------
export type ModuloSistema = 'contabilidade' | 'escrita' | 'folha' | 'honorarios';

// ----------------------------------------------------
// ESCRITA FISCAL (EF)
// ----------------------------------------------------
export interface AcumuladorFiscal {
  id: number;
  empresaId: number;
  codigo: number;
  descricao: string;
  cfopPadrao: string;
  tipoOperacao?: 'ENTRADA' | 'SAIDA' | 'SERVICO';
  incideICMS: boolean;
  aliquotaICMS?: number;
  incideIPI?: boolean;
  incidePIS: boolean;
  aliquotaPIS?: number;
  incideCOFINS: boolean;
  aliquotaCOFINS?: number;
  incideISS: boolean;
  aliquotaISS?: number;
  incideSimples: boolean;
  // Integração Contábil Automática
  contaDebitoValor?: number;
  contaCreditoValor?: number;
  contaCreditoICMS?: number;
  contaCreditoPIS?: number;
  contaCreditoCOFINS?: number;
  contaContabilDebitoId?: number;
  contaContabilCreditoId?: number;
  contaICMSDebitoId?: number;
  contaICMSCreditoId?: number;
  contaPISDebitoId?: number;
  contaPISCreditoId?: number;
  contaCOFINSDebitoId?: number;
  contaCOFINSCreditoId?: number;
  historicoId?: number;
}

export interface NotaFiscal {
  id: number;
  empresaId: number;
  numero: string | number;
  serie: string;
  chaveAcesso?: string;
  dataEmissao: string;
  dataEntradaSaida?: string;
  tipo: 'ENTRADA' | 'SAIDA' | 'SERVICO';
  acumuladorId: number;
  cfop: string;
  destinatarioOuRemetente?: string;
  cnpjCpf?: string;
  clienteFornecedorNome?: string;
  clienteFornecedorCnpj?: string;
  valorTotal: number;
  baseCalculoICMS?: number;
  valorICMS?: number;
  baseCalculoPIS?: number;
  valorPIS?: number;
  baseCalculoCOFINS?: number;
  valorCOFINS?: number;
  baseCalculoISS?: number;
  valorISS?: number;
  retencaoIRRF?: number;
  retencaoCSRF?: number;
  retencaoINSS?: number;
  integradaContabil?: boolean;
}

export interface ApuracaoFiscal {
  id: number;
  empresaId: number;
  competencia: string; // YYYY-MM
  regimeTributario?: RegimeTributario;
  regime?: RegimeTributario;
  faturamentoTotal?: number;
  receitaBruta?: number;
  rbt12?: number;
  impostoDevido?: number;
  aliquotaEfetiva?: number;
  aliquotaEfetivaDAS?: number;
  valorDAS?: number;
  valorICMSApurado?: number;
  valorPISApurado?: number;
  valorCOFINSApurado?: number;
  valorISSApurado?: number;
  valorIRPJApurado?: number;
  valorCSLLApurado?: number;
  detalhamentoImpostos?: Record<string, number>;
  guiaGerada?: boolean;
  dataVencimento?: string;
  status?: 'CALCULADA' | 'ENCERRADA';
  integradaContabil?: boolean;
}

// ----------------------------------------------------
// FOLHA DE PAGAMENTO (FO / DP)
// ----------------------------------------------------
export interface Colaborador {
  id: number;
  empresaId: number;
  matricula: string | number;
  nome: string;
  cpf: string;
  cargo: string;
  departamento?: string;
  tipoVinculo: 'CLT' | 'PRO_LABORE' | 'ESTAGIO' | 'AUTONOMO';
  salarioBase: number;
  dependentesIRRF: number;
  dependentesSalarioFamilia?: number;
  dataAdmissao: string;
  centroCustoId?: number;
  bancoNome?: string;
  agencia?: string;
  contaBancaria?: string;
  dadosBancarios?: { chavePix?: string };
  ativo?: boolean;
  status?: 'ATIVO' | 'AFASTADO' | 'DESLIGADO';
}

export interface RubricaFolha {
  id: number;
  empresaId?: number;
  codigo: string | number;
  nome: string;
  tipo: 'PROVENTO' | 'DESCONTO' | 'INFORMATIVA';
  incideINSS: boolean;
  incideFGTS: boolean;
  incideIRRF: boolean;
  contaDebitoId?: number;
  contaCreditoId?: number;
}

export interface CalculoFolhaItem {
  id: number;
  colaboradorId: number;
  colaboradorNome: string;
  colaboradorCargo: string;
  tipoVinculo: 'CLT' | 'PRO_LABORE';
  salarioBase: number;
  totalProventos: number;
  inssDesconto: number;
  irrfDesconto: number;
  outrosDescontos: number;
  totalDescontos: number;
  salarioLiquido: number;
  fgtsEmpresa: number;
  inssPatronal: number;
}

export interface FolhaMensal {
  id: number;
  empresaId: number;
  colaboradorId?: number;
  competencia: string;
  tipoFolha?: 'MENSAL' | 'FERIAS' | 'DECIMO_TERCEIRO' | 'RESCISAO';
  dataCalculo: string;
  proventos?: any[];
  descontos?: any[];
  totalProventos?: number;
  totalDescontos?: number;
  salarioLiquido?: number;
  baseINSS?: number;
  inssSegurado?: number;
  inssPatronal?: number;
  baseFGTS?: number;
  fgts?: number;
  baseIRRF?: number;
  irrf?: number;
  totalBruto?: number;
  totalLiquido?: number;
  totalINSSSegurados?: number;
  totalINSSPatronal?: number;
  totalFGTS?: number;
  totalIRRF?: number;
  status?: 'ABERTA' | 'FECHADA';
  itens?: CalculoFolhaItem[];
  integradaContabil?: boolean;
}

// ----------------------------------------------------
// HONORÁRIOS CONTÁBEIS (HO)
// ----------------------------------------------------
export interface ContratoHonorario {
  id: number;
  empresaId: number;
  numeroContrato?: string;
  valorMensalBase?: number;
  valorMensal?: number;
  diaVencimento: number;
  indexadorReajuste: 'IGPM' | 'IPCA' | 'SALARIO_MINIMO' | 'FIXO';
  mesReajuste: number;
  cobra13Honorario: boolean;
  dataInicio: string;
  ativo?: boolean;
  status?: 'ATIVO' | 'CANCELADO' | 'SUSPENSO';
}

export interface FaturaHonorario {
  id: number;
  empresaId: number;
  competencia: string;
  numeroFatura?: string;
  valorHonorarioBase?: number;
  valorBase?: number;
  valorServicosExtras?: number;
  servicosExtras?: { descricao: string; valor: number }[];
  valorTotal: number;
  dataEmissao?: string;
  dataVencimento: string;
  dataPagamento?: string;
  status: 'PENDENTE' | 'PAGO' | 'CANCELADO' | 'ATRASADO';
  servicosExtrasDescricao?: string;
  integradaContabil?: boolean;
}

// ----------------------------------------------------
// CONCILIAÇÃO BANCÁRIA, AUTO-MAPPING & SPED ECD
// ----------------------------------------------------
export interface RegraConciliacao {
  id: number;
  empresaId: number;
  palavraChave: string;
  contaDebitoId: number;
  contaCreditoId: number;
  historicoId: number;
  complementoPadrao?: string;
}

export interface ExtratoTransacao {
  id: string;
  data: string;
  tipo: 'DEBITO' | 'CREDITO' | 'D' | 'C';
  valor: number;
  documento: string;
  historicoOriginal: string;
  contaDebitoId?: number;
  contaCreditoId?: number;
  historicoId?: number;
  complemento?: string;
  regraAplicada?: string;
  classificado?: boolean;
  status?: 'CLASSIFICADO' | 'PENDENTE';
}

export interface DLPAItem {
  id: number;
  empresaId?: number;
  exercicio?: number;
  ordem?: number;
  descricao: string;
  valor: number;
  tipo?: 'SALDO_INICIAL' | 'AJUSTE' | 'LUCRO_EXERCICIO' | 'DESTINACAO' | 'SALDO_FINAL' | 'AUMENTO' | 'DIMINUICAO' | 'SALDO';
}

export interface DFCItem {
  id: number;
  empresaId?: number;
  exercicio?: number;
  ordem?: number;
  grupo: 'OPERACIONAL' | 'INVESTIMENTO' | 'FINANCIAMENTO' | 'VARIACAO_LIQUIDA';
  descricao: string;
  valor: number;
}
