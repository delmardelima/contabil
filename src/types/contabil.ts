// Tipos Fundamentais do Sistema Contábil

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
  capitalSocial?: number;
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
  indicadorIE?: string;
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
  // Segregação de Receitas no Simples Nacional (LC 123/2006 Art. 18 § 4º-A)
  receitaTributadaIntegral?: number;
  receitaSegregadaST?: number; // Substituição Tributária de ICMS (CST 60 / CSOSN 500)
  receitaSegregadaMonofasico?: number; // PIS/COFINS Monofásico (CST 02/04)
  receitaSegregadaSTeMonofasico?: number; // ST ICMS + PIS/COFINS Monofásico
  dasSemSegregacao?: number; // Simulação sem consultoria
  economiaTributariaSegregacao?: number; // Economia líquida obtida
  percentualEconomia?: number;
  anexoSimples?: string;
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
// FÉRIAS, 13º SALÁRIO & RESCISÃO (TRCT OFICIAL CLT)
// ----------------------------------------------------
export interface CalculoFerias {
  id: number;
  empresaId: number;
  colaboradorId: number;
  colaboradorNome: string;
  matricula: string | number;
  cargo: string;
  salarioBase: number;
  periodoAquisitivoInicio: string;
  periodoAquisitivoFim: string;
  dataInicioGozo: string;
  diasGozo: number; // 30, 20, 15, 10
  dataFimGozo: string;
  abonoPecuniario: boolean;
  diasAbono: number; // até 10
  adiantarDecimoTerceiro: boolean;
  valorDiasFerias: number;
  valorTercoConstitucional: number;
  valorAbonoPecuniario: number;
  valorTercoAbono: number;
  valorAdiantamento13: number;
  valorTotalProventos: number;
  baseCalculoINSS: number;
  valorINSS: number;
  baseCalculoIRRF: number;
  valorIRRF: number;
  valorTotalDescontos: number;
  valorLiquidoReceber: number;
  dataPagamento: string; // 2 dias antes do gozo
  status: 'CALCULADO' | 'PAGO' | 'CANCELADO';
  integradaContabil?: boolean;
}

export interface CalculoDecimoTerceiro {
  id: number;
  empresaId: number;
  colaboradorId: number;
  colaboradorNome: string;
  matricula: string | number;
  cargo: string;
  salarioBase: number;
  competencia: string; // YYYY-MM
  ano: number;
  parcela: 'PRIMEIRA' | 'SEGUNDA';
  mesesTrabalhadosAvos: number; // 1 a 12
  valorIntegral: number;
  valorBrutoParcela: number;
  valorAdiantamentoDeduzido: number; // dedução na 2ª parcela
  baseINSS: number;
  valorINSS: number;
  baseIRRF: number;
  valorIRRF: number;
  baseFGTS: number;
  valorFGTS: number;
  valorLiquidoParcela: number;
  dataPagamento: string;
  status: 'CALCULADO' | 'PAGO' | 'CANCELADO';
  integradaContabil?: boolean;
}

export interface CalculoRescisao {
  id: number;
  empresaId: number;
  colaboradorId: number;
  colaboradorNome: string;
  matricula: string | number;
  cargo: string;
  cpf: string;
  dataAdmissao: string;
  dataDemissao: string;
  salarioBase: number;
  motivoRescisao: 'SEM_JUSTA_CAUSA' | 'PEDIDO_DEMISSAO' | 'COM_JUSTA_CAUSA' | 'TERMINO_CONTRATO' | 'ACORDO_MUTUO';
  tipoAvisoPrevio: 'INDENIZADO' | 'TRABALHADO' | 'DISPENSADO' | 'DESCONTADO';
  diasAvisoPrevio: number; // 30 + 3 por ano Lei 12.506
  diasTrabalhadosMes: number;
  avosDecimoTerceiro: number;
  avosDecimoIndenizado: number;
  avosFeriasProporcionais: number;
  avosFeriasIndenizadas: number;
  temFeriasVencidas: boolean;
  // Proventos
  saldoSalario: number;
  avisoPrevioIndenizado: number;
  decimoTerceiroProporcional: number;
  decimoTerceiroIndenizado: number;
  feriasVencidas: number;
  tercoFeriasVencidas: number;
  feriasProporcionais: number;
  tercoFeriasProporcionais: number;
  feriasIndenizadas: number;
  tercoFeriasIndenizadas: number;
  totalBrutoVerbas: number;
  // Deduções
  inssSaldoSalario: number;
  inssDecimoTerceiro: number;
  irrfSaldoSalario: number;
  irrfDecimoTerceiro: number;
  avisoPrevioDescontado: number;
  outrasDeducoes: number;
  totalDeducoes: number;
  // Líquido
  saldoLiquidoRescisao: number;
  // FGTS Rescisório
  saldoBaseFGTS: number;
  multaRescisoriaFGTS: number; // 40% ou 20%
  codigoSaqueFGTS: string; // 01, 02, etc.
  dataPagamento: string;
  status: 'CALCULADO' | 'QUITADO' | 'CANCELADO';
  integradaContabil?: boolean;
}

export interface ReajusteContratoLote {
  indice: 'IPCA' | 'IGPM' | 'SALARIO_MINIMO' | 'FIXO';
  percentual: number;
  dataReajuste: string;
  competenciaAplicacao: string;
  contratosIds: number[];
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
  status?: 'ATIVO' | 'BAIXADO';
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
  bancoNome?: string;
  bancoCodigo?: string;
  contaBancariaId?: number;
  nomeArquivoOrigem?: string;
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

// ----------------------------------------------------
// LIVROS FISCAIS OFICIAIS (ESCRITA FISCAL / )
// ----------------------------------------------------
export interface LinhaLivroEntradas {
  id: number;
  dataEntrada: string;
  dataEmissao: string;
  especie: string;
  serie: string;
  numero: string | number;
  emitenteNome: string;
  emitenteCnpjCpf: string;
  emitenteUf: string;
  cfop: string;
  valorContabil: number;
  baseCalculoICMS: number;
  aliquotaICMS: number;
  impostoCreditadoICMS: number;
  isentasNaoTributadasICMS: number;
  outrasICMS: number;
  impostoCreditadoIPI?: number;
  observacoes?: string;
}

export interface LinhaLivroSaidas {
  id: number;
  dataEmissao: string;
  dataSaida?: string;
  especie: string;
  serie: string;
  numero: string | number;
  destinatarioNome: string;
  destinatarioCnpjCpf: string;
  destinatarioUf: string;
  cfop: string;
  valorContabil: number;
  baseCalculoICMS: number;
  aliquotaICMS: number;
  impostoDebitadoICMS: number;
  isentasNaoTributadasICMS: number;
  outrasICMS: number;
  icmsSTRetido?: number;
  observacoes?: string;
}

export interface ResumoApuracaoICMSLivro {
  competencia: string;
  totalDebitoPorSaidas: number;
  outrosDebitos: number;
  estornoCreditos: number;
  totalDebitos: number;
  totalCreditoPorEntradas: number;
  outrosCreditos: number;
  estornoDebitos: number;
  saldoCredorAnterior: number;
  totalCreditos: number;
  saldoDevedorApurado: number;
  saldoCredorATransportar: number;
  // ISSQN
  receitaServicos: number;
  deducoesBaseISS: number;
  baseCalculoISS: number;
  aliquotaISS: number;
  issProprioDevido: number;
  issRetidoFonte: number;
  issLiquidoARecolher: number;
}

// ----------------------------------------------------
// CALENDÁRIO FISCAL & CONTROLE DE OBRIGAÇÕES ACESSÓRIAS
// ----------------------------------------------------
export type EsferaObrigacao = 'FEDERAL' | 'ESTADUAL' | 'MUNICIPAL' | 'TRABALHISTA';
export type StatusObrigacao = 'PENDENTE' | 'A_VENCER' | 'VENCE_HOJE' | 'EM_ATRASO' | 'ENTREGUE';

export interface ObrigacaoFiscal {
  id: number;
  empresaId: number;
  sigla: string;
  nome: string;
  esfera: EsferaObrigacao;
  competencia: string; // YYYY-MM
  dataVencimento: string; // YYYY-MM-DD
  dataLimiteEnvio?: string;
  valorEstimado?: number;
  status: StatusObrigacao;
  dataTransmissao?: string;
  protocoloTransmissao?: string;
  reciboEnvio?: string;
  codigoBarras?: string;
  responsavel?: string;
  observacoes?: string;
}

// ----------------------------------------------------
// FECHAMENTO ANUAL: DESTINAÇÃO DO RESULTADO (LEI 6.404/76)
// ----------------------------------------------------
export interface SocioDistribuicao {
  socioId: number;
  socioNome: string;
  cpf: string;
  percentual: number;
  valorDividendo: number;
}

export interface PropostaDestinacaoResultado {
  empresaId: number;
  exercicio: number;
  lucroLiquidoApurado: number;
  percentualReservaLegal: number; // 5%
  valorReservaLegal: number;
  percentualDistribuicao: number; // Ex: 90%
  valorTotalDistribuir: number;
  distribuicaoSocios: SocioDistribuicao[];
  valorRetencaoExpansao: number;
  dataAprovacao: string;
}

// ----------------------------------------------------
// VENDAS COM CARTÕES DE CRÉDITO & ADMINISTRADORAS (SPED 1600)
// ----------------------------------------------------
export interface AdministradoraCartao {
  id: number;
  empresaId: number;
  codigo: number;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
  inscricaoEstadual?: string;
  taxaMDRCreditoVista: number; // %
  taxaMDRCreditoParcelado: number; // %
  taxaMDRDebito: number; // %
  prazoDiasRepasseCredito: number; // ex: 30
  prazoDiasRepasseDebito: number; // ex: 1
  contaAtivoId?: number; // Conta Contábil a Receber
  contaDespesaTaxaId?: number; // Conta Contábil Despesas com Taxa MDR
  ativo: boolean;
}

export interface VendaCartaoOperadora {
  id: number;
  empresaId: number;
  competencia: string; // YYYY-MM
  administradoraId: number;
  administradoraNome: string;
  cnpjAdministradora: string;
  valorCredito: number;
  valorDebito: number;
  valorTotalBruto: number;
  taxaMDREstimada: number;
  valorLiquidoReceber: number;
  retencaoIRRF: number; // 1,5% sobre comissão (Lei 8.981/95)
  status: 'PENDENTE' | 'CONCILIADO' | 'INTEGRADO';
  dataIntegracao?: string;
}

// ----------------------------------------------------
// DEMONSTRAÇÕES CONTÁBEIS CONSOLIDADAS (MATRIZ & FILIAIS - CPC 36)
// ----------------------------------------------------
export interface BalanceteConsolidadoLinha {
  classificacao: string;
  nome: string;
  grau: number;
  tipo: 'S' | 'A';
  saldoMatriz: number;
  saldoFiliais: number;
  eliminacoes: number; // Débitos e Créditos Intercompany
  saldoConsolidado: number;
}

export interface DREConsolidadaLinha {
  descricao: string;
  valorMatriz: number;
  valorFiliais: number;
  eliminacoesIntercompany: number;
  valorConsolidado: number;
  isTotal?: boolean;
  isHeader?: boolean;
}

// ----------------------------------------------------
// PROVISÕES MENSAIS DE FÉRIAS E 13º SALÁRIO (CPC / CLT)
// ----------------------------------------------------
export interface ProvisaoItemFolha {
  id: number;
  colaboradorId: number;
  colaboradorNome: string;
  colaboradorCargo: string;
  dataAdmissao: string;
  salarioBase: number;
  mesesAquisitivosFerias: number;
  mesesAquisitivos13o: number;
  valorProvisaoFerias: number; // 1/12 avos
  valorTercoConstitucional: number; // 1/3
  valorFGTSFerias: number; // 8%
  valorINSSPatronalFerias: number; // 20%
  totalProvisaoFerias: number;
  valorProvisao13o: number; // 1/12 avos
  valorFGTS13o: number; // 8%
  valorINSSPatronal13o: number; // 20%
  totalProvisao13o: number;
  totalProvisaoMes: number;
}

export interface ProvisaoFolhaResumo {
  competencia: string;
  empresaId: number;
  totalFerias: number;
  totalTerco: number;
  totalFGTSFerias: number;
  totalINSSFerias: number;
  total13o: number;
  totalFGTS13o: number;
  totalINSS13o: number;
  totalGeralProvisao: number;
  integradoContabil: boolean;
  dataIntegracao?: string;
  itens: ProvisaoItemFolha[];
}

// ----------------------------------------------------
// CENTRAL DE RETENÇÕES TRIBUTÁRIAS NA FONTE (DIRF / REINF)
// ----------------------------------------------------
export interface GuiaRetencaoFonte {
  id: number;
  empresaId: number;
  competencia: string; // YYYY-MM
  codigoReceita: string; // '1708', '5952', '2631', 'ISS_RETIDO'
  descricaoTributo: string;
  tipoOperacao: 'TOMADO' | 'PRESTADO'; // TOMADO -> A Recolher (Passivo), PRESTADO -> A Compensar (Ativo)
  baseCalculo: number;
  aliquota: number;
  valorPrincipal: number;
  dataVencimento: string;
  status: 'ABERTO' | 'PAGO' | 'COMPENSADO';
  numeroDocumento?: string;
  codigoBarrasDarf?: string;
  integradaContabil?: boolean;
  detalhesNotas?: {
    notaId: number;
    numeroNota: string | number;
    participanteNome: string;
    cnpjCpf: string;
    valorNota: number;
    valorRetido: number;
  }[];
}

// ----------------------------------------------------
// DIFAL - DIFERENCIAL DE ALÍQUOTA & DESTDA (EC 87/15 / LC 190/22)
// ----------------------------------------------------
export interface ItemDifalApuracao {
  id: number;
  notaFiscalId: number;
  numeroNota: string | number;
  dataEmissao: string;
  destinatarioRemetente: string;
  cnpjCpf: string;
  ufOrigem: string;
  ufDestino: string;
  tipoOperacao: 'ENTRADA_USO_CONSUMO' | 'ENTRADA_ATIVO_IMOBILIZADO' | 'SAIDA_CONSUMIDOR_FINAL';
  cfop: string;
  valorOperacao: number;
  baseCalculoICMS: number;
  aliquotaInterestadual: number; // 4%, 7%, 12%
  aliquotaInternaDestino: number; // ex: 18%
  percentualDifal: number; // interna - interestadual (ex: 6%)
  fundoCombatePobrezaPerc?: number; // FCP ex: 1% a 2%
  valorFCP?: number;
  valorDifal: number;
  valorTotalDevido: number;
  integradoContabil?: boolean;
}

export interface ResumoDifalCompetencia {
  competencia: string;
  empresaId: number;
  totalOperacoes: number;
  totalBaseCalculo: number;
  totalDifalDevido: number;
  totalFCP: number;
  totalGeralGuia: number;
  status: 'PENDENTE' | 'APURADO' | 'INTEGRADO';
  codigoReceitaGNRE: string; // ex: '10008-0'
  linhaDigitavelGNRE?: string;
  itens: ItemDifalApuracao[];
}

// ----------------------------------------------------
// APURAÇÃO TRIMESTRAL IRPJ / CSLL (LUCRO PRESUMIDO)
// ----------------------------------------------------
export interface ApuracaoTrimestralIRPJCSLL {
  id: number;
  empresaId: number;
  ano: number;
  trimestre: 1 | 2 | 3 | 4;
  periodoDescricao: string;
  receitaBrutaComercio: number;
  receitaBrutaServicos: number;
  totalReceitaBruta: number;
  basePresumidaIRPJComercio: number; // 8%
  basePresumidaIRPJServicos: number; // 32%
  baseCalculoTotalIRPJ: number;
  aliquotaNormalIRPJ: number; // 15%
  valorIRPJNormal: number;
  limiteTrimestralAdicional: number; // R$ 60.000,00
  baseExcedenteAdicional: number;
  valorAdicionalIRPJ: number; // 10%
  totalIRPJDevido: number;
  irrfRetidoDedutivel: number;
  valorLiquidoIRPJARecolher: number;
  codigoReceitaDARFIRPJ: string; // '2089'
  basePresumidaCSLLComercio: number; // 12%
  basePresumidaCSLLServicos: number; // 32%
  baseCalculoTotalCSLL: number;
  aliquotaCSLL: number; // 9%
  totalCSLLDevido: number;
  csrfRetidoDedutivel: number;
  valorLiquidoCSLLARecolher: number;
  codigoReceitaDARFCSLL: string; // '2372'
  optouQuotas: boolean;
  quantidadeQuotas: 1 | 2 | 3;
  dataVencimentoQuota1: string;
  dataVencimentoQuota2?: string;
  dataVencimentoQuota3?: string;
  integradoContabil: boolean;
  dataIntegracao?: string;
}

// ----------------------------------------------------
// LALUR & LACS (LIVRO ELETRÔNICO DE ESCRITURAÇÃO E APURAÇÃO DO LUCRO REAL - SPED ECF BLOCO M)
// ----------------------------------------------------
export interface LancamentoLalurParteA {
  id: number;
  empresaId: number;
  ano: number;
  periodo: string; // ex: '2026-1T', '2026-ANUAL'
  data: string;
  tipo: 'ADICAO' | 'EXCLUSAO';
  tributo: 'IRPJ' | 'CSLL' | 'AMBOS';
  codigoHistorico: string; // Código SPED ECF (ex: M300 / M350)
  descricao: string;
  valor: number;
  contaContabilVinculadaId?: number;
  contaContabilNome?: string;
  contaParteBVinculadaId?: number;
  contaParteBNome?: string;
}

export interface ContaParteBLalur {
  id: number;
  empresaId: number;
  codigo: string;
  descricao: string;
  tipoTributo: 'IRPJ' | 'CSLL' | 'AMBOS';
  tipoConta: 'PREJUIZO_FISCAL' | 'BASE_NEGATIVA' | 'DEPRECIACAO_ACELERADA' | 'PROVISAO_NAO_DEDUTIVEL' | 'OUTROS';
  dataCadastro: string;
  saldoInicial: number;
  saldoAtual: number;
  dataLimiteUso?: string;
  identificadorSpedEcf?: string;
}

export interface MovimentoParteBLalur {
  id: number;
  contaParteBId: number;
  data: string;
  tipoMovimento: 'ENTRADA' | 'BAIXA' | 'COMPENSACAO';
  historico: string;
  valor: number;
  saldoApos: number;
  periodoApuracao: string;
}

export interface ApuracaoLucroRealLalur {
  id: number;
  empresaId: number;
  ano: number;
  periodo: string; // '2026-1T' ou '2026-ANUAL'
  dataApuracao: string;
  lucroLiquidoAntesTributos: number; // Resultado Contábil (DRE)
  totalAdicoesIRPJ: number;
  totalExclusoesIRPJ: number;
  lucroRealAntesCompensacao: number;
  limiteCompensacaoPrejuizo: number; // 30% do lucro real antes da compensação (Art. 42 Lei 8.981/95)
  prejuizoFiscalCompensado: number;
  lucroRealApurado: number;
  aliquotaIRPJNormal: number; // 15%
  valorIRPJNormal: number;
  limiteTrimestralAdicional: number; // R$ 60.000,00 no trimestre / R$ 240.000,00 no ano
  baseExcedenteAdicional: number;
  aliquotaAdicionalIRPJ: number; // 10%
  valorAdicionalIRPJ: number;
  totalIRPJDevido: number;
  irrfRetidoDedutivel: number;
  incentivosFiscaisDedutiveis: number;
  estimativasPagasIRPJ: number;
  valorLiquidoIRPJARecolher: number;
  codigoReceitaDARFIRPJ: string; // '2432' - Trimestral ou '5993' - Ajuste Anual

  // LACS - CSLL
  totalAdicoesCSLL: number;
  totalExclusoesCSLL: number;
  baseCalculoCSLLAntesCompensacao: number;
  limiteCompensacaoBaseNegativa: number; // 30%
  baseNegativaCSLLCompensada: number;
  baseCalculoFinalCSLL: number;
  aliquotaCSLL: number; // 9%
  totalCSLLDevido: number;
  csrfRetidoDedutivel: number;
  estimativasPagasCSLL: number;
  valorLiquidoCSLLARecolher: number;
  codigoReceitaDARFCSLL: string; // '6012' - Trimestral ou '2484' - Ajuste Anual

  adicoesDetalhes: LancamentoLalurParteA[];
  exclusoesDetalhes: LancamentoLalurParteA[];
  integradoContabil: boolean;
  dataIntegracao?: string;
}

// ----------------------------------------------------
// EFD-REINF (ESCRITURAÇÃO FISCAL DIGITAL DE RETENÇÕES E OUTRAS INFORMAÇÕES FISCAIS)
// ----------------------------------------------------
export interface EventoReinf {
  id: number;
  empresaId: number;
  tipoEvento: 'R-1000' | 'R-2010' | 'R-4020' | 'R-9000';
  nomeEvento: string;
  competencia: string; // YYYY-MM
  status: 'GERADO' | 'VALIDADO' | 'TRANSMITIDO' | 'ERRO';
  xmlContent: string;
  numeroRecibo?: string;
  dataGeracao: string;
  dataTransmissao?: string;
  inconsistencias?: string[];
  detalhes: {
    totalBaseCalculo: number;
    totalRetencao: number;
    codigoReceita?: string;
    prestadorTomador?: string;
    cnpjCpf?: string;
    naturezaRendimento?: string;
  };
}

export interface ResumoReinfCompetencia {
  competencia: string;
  empresaId: number;
  totalEventos: number;
  eventosR1000: number;
  eventosR2010: number;
  eventosR4020: number;
  totalRetencaoINSS: number;
  totalRetencaoIRRF: number;
  totalRetencaoCSRF: number;
  totalGeralRetencoes: number;
  statusGeral: 'PENDENTE' | 'PRONTO' | 'TRANSMITIDO';
  eventos: EventoReinf[];
}

// ----------------------------------------------------
// NFS-e NACIONAL / ABRASF & FATURAMENTO DE SERVIÇOS
// ----------------------------------------------------
export interface NfseEmissao {
  id: number;
  empresaId: number;
  numeroDPS: number;
  serieDPS: string;
  numeroNfse?: string;
  codigoVerificacao?: string;
  dataEmissao: string;
  competencia: string; // YYYY-MM
  tomadorId?: number;
  tomadorRazaoSocial: string;
  tomadorCnpjCpf: string;
  tomadorEmail?: string;
  tomadorEndereco?: string;
  tomadorCidade?: string;
  tomadorUf?: string;
  tomadorCodigoIbge?: string;
  itemLc116: string; // '17.19 - Contabilidade, auditoria e consultoria'
  codigoTributacaoNacional: string; // '17.19.01'
  discriminacaoServico: string;
  valorServicos: number;
  valorDeducoes: number;
  baseCalculoISS: number;
  aliquotaISS: number;
  valorISS: number;
  issRetido: boolean;
  retencaoIRRF: number; // 1,5%
  retencaoPIS: number; // 0,65%
  retencaoCOFINS: number; // 3,00%
  retencaoCSLL: number; // 1,00%
  retencaoINSS: number;
  valorTotalRetencoes: number;
  valorLiquidoNfse: number;
  status: 'EMITIDA' | 'CANCELADA' | 'RASCUNHO';
  faturaHonorarioId?: number;
  xmlNfse?: string;
  integradaFiscal: boolean;
  integradaContabil: boolean;
}

// ----------------------------------------------------
// CIAP - CONTROLE DE CRÉDITO DE ICMS DO ATIVO PERMANENTE (SPED FISCAL BLOCO G / LC 87/96)
// ----------------------------------------------------
export interface ItemCiap {
  id: number;
  empresaId: number;
  ativoId?: number;
  codigoBem: string;
  descricaoBem: string;
  dataEntrada: string;
  numeroNotaFiscal: string | number;
  serieNotaFiscal: string;
  fornecedorNome: string;
  fornecedorCnpj: string;
  valorTotalBem: number;
  valorICMSOriginal: number;
  parcelaAtual: number; // ex: 1 a 48
  totalParcelas: number; // 48
  parcelaMesICMS: number; // valorICMSOriginal / 48
  saldoICMSRemanescente: number;
  status: 'ATIVO' | 'BAIXADO' | 'CONCLUIDO';
}

export interface ItemCiapCalculado extends ItemCiap {
  fatorApropriacao: number; // saídas tributadas / saídas totais
  creditoApropriadoMes: number; // parcelaMesICMS * fatorApropriacao
  saldoAposApropriacao: number;
}

export interface ApuracaoCiapCompetencia {
  id: number;
  competencia: string; // YYYY-MM
  empresaId: number;
  totalSaidasTributadas: number;
  totalSaidasGerais: number;
  fatorApropriacao: number; // Fator de 0.0000 a 1.0000
  totalCreditoApropriadoMes: number;
  totalSaldoRemanescente: number;
  itens: ItemCiapCalculado[];
  integradoFiscal: boolean;
  integradoContabil: boolean;
}

// ----------------------------------------------------
// eSocial - EVENTOS PERIÓDICOS EM XML (S-1200 & S-1210 - LEIAUTE v_S_01_02_00)
// ----------------------------------------------------
export interface EventoESocial {
  id: number;
  empresaId: number;
  tipoEvento: 'S-1200' | 'S-1210' | 'S-1000' | 'S-2200';
  nomeEvento: string;
  colaboradorId?: number;
  colaboradorNome?: string;
  colaboradorCpf?: string;
  matricula?: string;
  competencia: string; // YYYY-MM
  dataGeracao: string;
  dataTransmissao?: string;
  status: 'GERADO' | 'VALIDADO' | 'TRANSMITIDO' | 'ERRO' | 'PRONTO';
  xmlContent: string;
  numeroRecibo?: string;
  bases: {
    baseINSS: number;
    baseFGTS: number;
    baseIRRF: number;
    valorLiquido: number;
  };
}

export interface ResumoESocialCompetencia {
  competencia: string;
  empresaId: number;
  totalColaboradores: number;
  totalEventosS1200: number;
  totalEventosS1210: number;
  folhaBrutaTotal: number;
  inssTotalSegurados: number;
  inssTotalPatronal: number;
  fgtsTotal: number;
  statusGeral: 'PENDENTE' | 'PRONTO' | 'TRANSMITIDO';
  eventos: EventoESocial[];
}

// ----------------------------------------------------
// RAZÃO AUXILIAR & CONCILIAÇÃO DE CLIENTES E FORNECEDORES
// ----------------------------------------------------
export interface RazaoAuxiliarItem {
  id: number;
  empresaId: number;
  participanteId: number;
  participanteNome: string;
  participanteCnpjCpf: string;
  tipoParticipante: 'CLIENTE' | 'FORNECEDOR';
  data: string;
  documento: string; // NF-e 1052, Duplicata 01, etc.
  historico: string;
  debito: number;
  credito: number;
  saldoProgressivo: number;
  statusConciliacao: 'CONCILIADO' | 'PENDENTE_FISCAL' | 'PENDENTE_CONTABIL';
  notaFiscalId?: number;
  lancamentoContabilId?: number;
}

// ----------------------------------------------------
// DCTFWeb & FECHAMENTO DO eSocial (S-1299 & GUIA DARF PREVIDENCIÁRIA ÚNICA)
// ----------------------------------------------------
export interface ApuracaoDctfWeb {
  id: number;
  empresaId: number;
  competencia: string; // YYYY-MM
  status: 'ABERTA' | 'FECHADA' | 'TRANSMITIDA';
  dataFechamento?: string;
  reciboFechamentoS1299?: string;
  xmlFechamentoS1299?: string;
  folhaBruta: number;
  // Débitos Previdenciários
  inssSegurados: number;
  inssPatronal: number; // 20%
  inssRatFap: number; // 1% a 3% * FAP
  inssTerceiros: number; // 5.8% Salário Educação, INCRA, SENAI, SESI, SEBRAE
  totalDebitosPrevidenciarios: number;
  // Créditos / Deduções
  deducaoSalarioFamilia: number;
  deducaoSalarioMaternidade: number;
  retencaoLei9711Tomadores: number; // 11% Retenção Reinf R-2010
  totalDeducoes: number;
  // Saldo a Recolher
  saldoLiquidoDARF: number;
  codigoReceitaDARF: string; // '1138' - DARF Previdenciário DCTFWeb
  dataVencimento: string; // Dia 20 do mês subsequente
  codigoBarras: string;
  pixQrCode: string;
  integradoContabil: boolean;
}

// ----------------------------------------------------
// GESTÃO PATRIMONIAL AVANÇADA, INVENTÁRIO & BAIXAS (CPC 27)
// ----------------------------------------------------
export interface BaixaAtivoImobilizado {
  id: number;
  empresaId: number;
  ativoId: number;
  codigoBem: string;
  descricaoBem: string;
  dataAquisicao: string;
  dataBaixa: string;
  motivoBaixa: 'VENDA' | 'DESCARTE_SUCATEAMENTO' | 'PERDA_SINISTRO' | 'DOACAO';
  valorAquisicaoOriginal: number;
  depreciacaoAcumuladaData: number;
  valorContabilResidual: number; // Valor Aquisição - Depreciação Acumulada
  valorVendaAlienacao: number;
  resultadoOperacao: number; // Valor Venda - Valor Contábil Residual
  tipoResultado: 'GANHO_CAPITAL' | 'PERDA_CAPITAL' | 'NEUTRO';
  aliquotaIRPJGanho: number; // 15%
  aliquotaCSLLGanho: number; // 9%
  impostoDevidoGanho: number;
  numeroNotaFiscalVenda?: string;
  serieNotaFiscalVenda?: string;
  compradorNome?: string;
  compradorCnpjCpf?: string;
  estornoCiapNecessario: boolean;
  saldoCiapEstornado: number;
  integradoContabil: boolean;
  loteContabilId?: number;
}

export interface ItemInventarioPatrimonial {
  id: number;
  empresaId: number;
  ativoId: number;
  codigoPatrimonio: string; // Plaqueta (ex: PAT-00104)
  descricao: string;
  centroCustoId?: number;
  centroCustoNome?: string;
  departamento: string;
  responsavelNome: string;
  responsavelCpf: string;
  localizacaoFisica: string;
  dataTombamento: string;
  estadoConservacao: 'EXCELENTE' | 'BOM' | 'REGULAR' | 'RUIM' | 'INSERVIVEL';
  situacaoInventario: 'LOCALIZADO' | 'NAO_LOCALIZADO' | 'TRANSFERIDO' | 'BAIXADO';
  qrCodeIdentificador: string;
}

// ----------------------------------------------------
// LIVRO CAIXA DIGITAL DO PRODUTOR RURAL - LCDPR (IN RFB nº 1.848/2018)
// ----------------------------------------------------
export interface ImovelRuralLCDPR {
  id: number;
  empresaId: number;
  codigoImovel: string; // Código sequencial (ex: 001)
  nirf: string; // Número do Imóvel na Receita Federal (8 dígitos)
  codigoIncra: string;
  nomeImovel: string;
  endereco: string;
  municipio: string;
  uf: string;
  codigoIbge: string;
  tipoExploracao: '1' | '2' | '3' | '4'; // 1-Individual, 2-Condomínio, 3-Parceria, 4-Arrendamento
  percentualParticipacao: number; // ex: 100.00%
}

export interface LancamentoLCDPR {
  id: number;
  empresaId: number;
  ano: number;
  data: string; // YYYY-MM-DD
  imovelRuralId: number;
  imovelNome: string;
  contaBancaria: string; // ex: Banco do Brasil C/C 12345-6
  tipoDocumento: '1' | '2' | '3' | '4' | '5'; // 1-NF, 2-Fatura, 3-Recibo, 4-Contrato, 5-Outros
  numeroDocumento: string;
  participanteNome: string;
  participanteCnpjCpf: string;
  tipoLancamento: 'RECEITA' | 'DESPESA';
  descricao: string;
  valorEntrada: number; // Receitas da atividade rural
  valorSaida: number; // Despesas de custeio / investimento
  saldoProgressivo: number;
}

export interface ResumoMensalLCDPR {
  mes: string; // YYYY-MM
  receitas: number;
  despesas: number;
  saldoMes: number;
}





