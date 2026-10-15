// Tipos Fundamentais do Sistema Contábil (Baseado na Engenharia Reversa de C:\Contabil\contabil.exe e Domínio Sistemas)

export type RegimeTributario = 'SIMPLES_NACIONAL' | 'LUCRO_PRESUMIDO' | 'LUCRO_REAL' | 'IMUNE_ISENTA';
export type NaturezaConta = 'D' | 'C';
export type TipoConta = 'S' | 'A'; // Sintética | Analítica

export interface SocioAdministrador {
  id: number;
  nome: string;
  cpf: string;
  qualificacaoRFB?: string; // 49 - Sócio-Administrador, 22 - Sócio, 05 - Administrador
  percentualCapital: number;
  dataEntrada: string;
  dataSaida?: string;
  retiraProLabore: boolean;
  valorProLabore?: number;
  percentualLucros?: number;
}

export interface VigenciaTributaria {
  id: number;
  inicioCompetencia: string; // YYYY-MM
  fimCompetencia?: string; // YYYY-MM
  regimeTributario: RegimeTributario;
  regimeApuracao: 'COMPETENCIA' | 'CAIXA';
  enquadramentoSimples?: 'MICROEMPRESA' | 'EPP' | 'NAO_OPTANTE';
}

export interface Empresa {
  id: number;
  codigo: number;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  inscricaoSuframa?: string;
  nire?: string;
  dataConstituicao?: string;
  naturezaJuridica?: string;
  porteEmpresa?: 'ME' | 'EPP' | 'DEMAIS';
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  codigoIbge?: string;
  cnaePrincipal?: string;
  cnaesSecundarios?: string[];
  anexoPadraoSimples?: string;
  fatorR?: boolean;
  aliquotaISS?: number;
  codigoTerceiros?: string;
  fpas?: string;
  rat?: number;
  fap?: number;
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
  socios?: SocioAdministrador[];
  vigencias?: VigenciaTributaria[];
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
  codigoReferencialRFB?: string;
  naturezaSped?: '01' | '02' | '03' | '04' | '05'; // 01-Ativo, 02-Passivo, 03-PL, 04-Resultado, 05-Compensação
  dataInclusao?: string;
  dataInativacao?: string;
  exigeCentroCusto?: boolean;
  ativa?: boolean;
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

export interface RateioCentroCusto {
  id: string | number;
  centroCustoId: number;
  percentual: number;
  valor: number;
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
  rateios?: RateioCentroCusto[];
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
  complemento?: string;
}

export type PerfilUsuario = 'ADMIN' | 'CONTADOR' | 'ASSISTENTE' | 'AUDITOR' | 'ANALISTA';

export interface DocumentoStudio {
  id: number;
  empresaId: number;
  tipo: 'ATA_ASSEMBLEIA' | 'CONTRATO_SOCIAL' | 'DISTRATO' | 'CARTA_RESPONSABILIDADE' | 'NOTAS_EXPLICATIVAS' | 'RELATORIO_DIRETORIA' | 'NOTA_EXPLICATIVA';
  titulo: string;
  conteudoHtml: string;
  dataAtualizacao?: string;
  updatedAt?: string;
  exercicioAno?: number;
}

export interface Usuario {
  id: number;
  login: string;
  nome: string;
  email: string;
  cargo?: string;
  perfil: PerfilUsuario;
  ativo: boolean;
  permissoes?: string[];
}

export interface AuditoriaLog {
  id: number;
  dataHora: string;
  usuarioNome: string;
  modulo: string;
  operacao?: 'INCLUSAO' | 'EDICAO' | 'EXCLUSAO' | 'ENCERRAMENTO' | 'IMPORTACAO' | 'EXPORTACAO' | 'PROCESSAMENTO' | string;
  detalhes?: string;
  acao?: string;
  descricao?: string;
}

export interface ParametrosEmpresa {
  id?: number;
  empresaId: number;
  permiteDiferencaDxC: boolean;
  bloquearLancamentoDataAnterior?: boolean;
  dataFechamento?: string;
  bloquearLancamentosAte?: string;
  obrigaCentroCusto?: boolean;
  zeramentoAutomaticoAtivo?: boolean;
  contaApuracaoResultadoId?: number;
  contaLucrosAcumuladosId?: number;
  contaPrejuizosAcumuladosId?: number;
  contaDestinoZeramentoId?: number;
  regimeContabil?: 'COMPETENCIA' | 'CAIXA';
  avancaPaginaTrocaGrupo?: boolean;
  numeroLivroDiario?: number;
  numeroFolhaInicial?: number;
}

export interface ConfiguracaoRede {
  modoOperacao?: 'STANDALONE' | 'CLIENTE_LAN' | 'SERVIDOR_MASTER';
  modo?: 'STANDALONE' | 'CLIENTE_LAN' | 'SERVIDOR_MASTER' | 'SERVIDOR' | 'ESTACAO';
  servidorHost?: string;
  serverHost?: string;
  servidorPorta?: number;
  serverPort?: number;
  statusConexao?: 'ONLINE' | 'OFFLINE' | 'SINCRONIZANDO';
  isOnline?: boolean;
  ultimaSincronizacao?: string;
  totalEstacoesConectadas?: number;
}

export type ModuloSistema = 'contabilidade' | 'escrita' | 'folha' | 'honorarios';

// ----------------------------------------------------
// CADASTROS FISCAIS OBRIGATÓRIOS (SPED 0150 & 0200)
// ----------------------------------------------------
export interface ParticipanteFiscal {
  id: number;
  empresaId: number;
  codigo: string;
  nomeRazaoSocial: string;
  nomeFantasia?: string;
  tipoPessoa: 'J' | 'F';
  cnpjCpf: string;
  inscricaoEstadual?: string;
  contribuinteICMS: '1' | '2' | '9'; // 1 - Contribuinte, 2 - Isento, 9 - Não Contribuinte
  uf: string;
  municipio: string;
  codigoIbge: string;
  tipoRelacao: 'CLIENTE' | 'FORNECEDOR' | 'AMBOS' | 'TRANSPORTADORA';
  contaContabilId?: number; // Conta Cliente/Fornecedor individualizada
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  email?: string;
  telefone?: string;
  ativo: boolean;
}

export interface ProdutoServico {
  id: number;
  empresaId: number;
  codigo: string;
  descricao: string;
  codigoBarras?: string;
  tipoItemSped: '00' | '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08' | '09' | '99';
  ncm: string; // 8 dígitos
  cest?: string;
  unidadeMedida: string; // UN, KG, CX, SV, etc.
  cstICMSPadrao?: string;
  csosnPadrao?: string;
  cstPISCOFINSPadrao?: string;
  aliquotaICMS?: number;
  aliquotaIPI?: number;
  aliquotaPIS?: number;
  aliquotaCOFINS?: number;
  precoUnitarioVenda?: number;
  precoUnitarioCusto?: number;
  contaContabilInventarioId?: number;
  contaContabilReceitaId?: number;
  contaContabilCustoId?: number;
  ativo: boolean;
}

// ----------------------------------------------------
// ESCRITA FISCAL (EF)
// ----------------------------------------------------
export interface AcumuladorFiscal {
  id: number;
  empresaId: number;
  codigo: number;
  descricao: string;
  tipoOperacao?: string;
  cfopPadrao: string;
  cfopsPermitidos?: string[];
  incideICMS: boolean;
  incideIPI?: boolean;
  incidePIS: boolean;
  incideCOFINS: boolean;
  incideISS: boolean;
  incideSimples: boolean;
  aliquotaICMS?: number;
  aliquotaIPI?: number;
  aliquotaPIS?: number;
  aliquotaCOFINS?: number;
  aliquotaISS?: number;
  retencaoIRRF?: boolean;
  retencaoCSRF?: boolean;
  retencaoINSS?: boolean;
  contaContabilDebitoId?: number;
  contaContabilCreditoId?: number;
  contaDebitoValor?: number;
  contaCreditoValor?: number;
  contaDebitoICMS?: number;
  contaCreditoICMS?: number;
  contaICMSDebitoId?: number;
  contaICMSCreditoId?: number;
  contaDebitoIPI?: number;
  contaCreditoIPI?: number;
  contaDebitoPIS?: number;
  contaCreditoPIS?: number;
  contaPISDebitoId?: number;
  contaPISCreditoId?: number;
  contaDebitoCOFINS?: number;
  contaCreditoCOFINS?: number;
  contaCOFINSDebitoId?: number;
  contaCOFINSCreditoId?: number;
  contaDebitoISS?: number;
  contaCreditoISS?: number;
  historicoId?: number;
}

export interface ItemNotaFiscal {
  id: number;
  numeroItem: number;
  produtoId?: number;
  codigoProduto: string;
  descricao: string;
  ncm: string;
  cfop: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  baseCalculoICMS?: number;
  aliquotaICMS?: number;
  valorICMS?: number;
  cstICMS?: string;
  cstPIS?: string;
  baseCalculoPIS?: number;
  aliquotaPIS?: number;
  valorPIS?: number;
  cstCOFINS?: string;
  baseCalculoCOFINS?: number;
  aliquotaCOFINS?: number;
  valorCOFINS?: number;
}

export interface ParcelaNotaFiscal {
  id: number;
  numeroParcela: number;
  dataVencimento: string;
  valor: number;
  contaContabilId?: number;
}

export interface NotaFiscal {
  id: number;
  empresaId: number;
  modelo?: string;
  numero: string | number;
  serie: string;
  chaveAcesso?: string;
  dataEmissao: string;
  dataEntradaSaida?: string;
  tipo: 'ENTRADA' | 'SAIDA' | 'SERVICO';
  acumuladorId: number;
  cfop: string;
  participanteId?: number;
  participanteNome?: string;
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
  itens?: ItemNotaFiscal[];
  parcelas?: ParcelaNotaFiscal[];
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
export interface DependenteFolha {
  id: number;
  nome: string;
  cpf?: string;
  dataNascimento: string;
  parentesco: 'FILHO' | 'CONJUGE' | 'PAI_MAE' | 'OUTROS';
  finsIRRF: boolean;
  finsSalarioFamilia: boolean;
}

export interface Colaborador {
  id: number;
  empresaId: number;
  matricula: string | number;
  matriculaeSocial?: string;
  nome: string;
  cpf: string;
  dataNascimento?: string;
  sexo?: 'M' | 'F';
  estadoCivil?: 'SOLTEIRO' | 'CASADO' | 'DIVORCIADO' | 'VIUVO' | 'UNIAO_ESTAVEL';
  grauInstrucao?: string;
  racaCor?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  ctpsNumero?: string;
  ctpsSerie?: string;
  ctpsUF?: string;
  rgNumero?: string;
  rgOrgaoEmissor?: string;
  pisPasep?: string;
  tituloEleitor?: string;
  cnhNumero?: string;
  categoriaeSocial?: string; // 101 - Empregado, 721 - Diretor, etc.
  cbo?: string;
  cargo: string;
  departamento?: string;
  tipoVinculo: 'CLT' | 'PRO_LABORE' | 'ESTAGIO' | 'AUTONOMO';
  salarioBase: number;
  tipoPagamento?: 'MENSALISTA' | 'HORISTA' | 'COMISSIONISTA';
  jornadaSemanal?: number;
  dependentesIRRF: number;
  dependentesSalarioFamilia?: number;
  listaDependentes?: DependenteFolha[];
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

export interface VariaveisColaborador {
  id?: number;
  empresaId: number;
  colaboradorId: number;
  competencia: string; // YYYY-MM
  horasExtras50?: number;
  horasExtras100?: number;
  adicionalNoturnoHoras?: number;
  grauInsalubridade?: 'MINIMO' | 'MEDIO' | 'MAXIMO' | 'NENHUM'; // 10%, 20%, 40% s/ SM
  periculosidade?: boolean; // 30% s/ Salário Base
  faltasDias?: number;
  faltasHoras?: number;
  adiantamentoSalarial?: number;
  descontoValeTransporte?: boolean; // até 6%
  outrosProventos?: number;
  outrosDescontos?: number;
}

export interface ProvisaoColaborador {
  id: number;
  empresaId: number;
  colaboradorId: number;
  colaboradorNome: string;
  matricula: string | number;
  competencia: string; // YYYY-MM
  salarioBase: number;
  provisaoFerias: number; // 1/12 avos
  provisaoTercoConstitucional: number; // 1/3 s/ férias
  provisaoDecimoTerceiro: number; // 1/12 avos
  encargosINSSPatronal: number; // CPP 20% s/ total provisões
  encargosFGTS: number; // FGTS 8% s/ total provisões
  totalProvisaoMes: number;
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
  franquiaEmpregados?: number;
  valorExcedenteEmpregado?: number;
  franquiaNotas?: number;
  valorExcedenteNota?: number;
  retencaoIRRF?: boolean;
  retencaoCSRF?: boolean;
  aliquotaISS?: number;
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
  qtdEmpregadosApurados?: number;
  qtdNotasApuradas?: number;
  valorExcedenteFolha?: number;
  valorExcedenteFiscal?: number;
  valorServicosExtras?: number;
  servicosExtras?: { descricao: string; valor: number }[];
  valorBrutoTotal?: number;
  valorIRRFRetido?: number;
  valorCSRFRetido?: number;
  valorISSRetido?: number;
  valorLiquidoFatura?: number;
  valorTotal: number;
  dataEmissao?: string;
  dataVencimento: string;
  dataPagamento?: string;
  status: 'PENDENTE' | 'PAGO' | 'CANCELADO' | 'ATRASADO';
  servicosExtrasDescricao?: string;
  integradaContabil?: boolean;
}

// ----------------------------------------------------
// CONTROLE DE ATIVO IMOBILIZADO (CT / IMOBILIZADO)
// ----------------------------------------------------
export interface AtivoImobilizado {
  id: number;
  empresaId: number;
  codigo: string;
  descricao: string;
  grupo: 'VEICULOS' | 'MAQUINAS' | 'INFORMATICA' | 'MOVEIS' | 'EDIFICACOES' | 'OUTROS';
  dataAquisicao: string;
  dataInicioDepreciacao: string;
  valorOriginal: number;
  valorResidual: number;
  taxaDepreciacaoAnual: number; // % ao ano conforme RFB
  vidaUtilMeses: number;
  contaAtivoId?: number;
  contaDepreciacaoAcumuladaId?: number;
  contaDespesaDepreciacaoId?: number;
  depreciacaoAcumulada?: number;
  valorContabilAtual?: number;
  ativo: boolean;
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
}

export interface DREItemCalculado {
  id?: number;
  ordem: number;
  descricao: string;
  valor: number;
  tipo?: 'CONTA' | 'SUBTOTAL' | 'TOTAL_GERAL';
  tipoLinha: 'CONTA' | 'SUBTOTAL' | 'TOTAL_GERAL' | string;
  operacao: 'SOMA' | 'SUBTRAI' | string;
  percentualVertical?: number;
  analiseVerticalPerc: number;
}

export interface DREEstruturaLinha {
  id: number;
  empresaId: number;
  ordem: number;
  descricao: string;
  tipoLinha: 'CONTA' | 'SUBTOTAL' | 'TOTAL_GERAL';
  operacao: 'SOMA' | 'SUBTRAI';
  prefixoContas?: string;
  isBasePercentual: boolean;
}

export interface BalanceteMultiPeriodoItem {
  id: number;
  classificacao: string;
  codigoReduzido: number;
  nome: string;
  grau: number;
  tipo: TipoConta;
  natureza: NaturezaConta;
  meses: number[]; // Array com os 12 meses (Jan..Dez)
  totalAno: number;
}

export interface DREMultiPeriodoItem {
  ordem: number;
  descricao: string;
  tipoLinha: 'CONTA' | 'SUBTOTAL' | 'TOTAL_GERAL';
  operacao: 'SOMA' | 'SUBTRAI';
  meses: number[]; // Array com os 12 meses (Jan..Dez)
  totalAno: number;
  mediaMensal: number;
}
