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
  enquadramentoSimples?: 'MICROEMPRESA' | 'EPP' | 'MEI' | 'NAO_OPTANTE';
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
  crcContador?: string;
  contadorCPF?: string;
  contadorResponsavel?: string;
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
  grupo?: string;
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

export type TipoOrigemLancamentoCaixa =
  | 'Normal'
  | 'Zeramento'
  | 'Patrimônio'
  | 'Escrita'
  | 'Saídas EF'
  | 'Entradas EF'
  | 'Serviços EF'
  | 'Pagto Guia EF';

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
  tipoOrigemCaixa?: TipoOrigemLancamentoCaixa;
  contaCaixaId?: number;
  operacaoCaixa?: 'ENTRADA' | 'SAIDA';
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

export type PerfilUsuario = 'ADMIN' | 'CONTADOR' | 'ANALISTA' | 'ASSISTENTE' | 'AUDITOR';

export type PermissaoSistema =
  | 'contabilidade'
  | 'escrita'
  | 'folha'
  | 'honorarios'
  | 'admin'
  | 'excluir'
  | 'fechar_lote'
  | 'zeramento'
  | 'parametros'
  | 'usuarios_backup'
  | 'contabilidade_view'
  | 'contabilidade_edit'
  | 'contabilidade_close'
  | 'escrita_view'
  | 'escrita_edit'
  | 'folha_view'
  | 'folha_edit'
  | 'honorarios_view'
  | 'honorarios_edit'
  | 'geral_view'
  | 'admin_full'
  | 'auditoria_view'
  | 'contabilidade.visualizar'
  | 'contabilidade.lancar'
  | 'contabilidade.excluir'
  | 'contabilidade.fechar'
  | 'escrita.visualizar'
  | 'escrita.lancar'
  | 'escrita.apurar'
  | 'folha.visualizar'
  | 'folha.calcular'
  | 'honorarios.gerir'
  | 'admin.empresas'
  | 'admin.parametros'
  | 'admin.usuarios'
  | 'admin.backup';

export const MODULO_PERMISSOES: Record<string, PermissaoSistema> = {
  usuarios: 'admin_full',
  redeBackup: 'admin_full',
  parametros: 'admin_full',
  empresas: 'admin_full',
  zeramento: 'contabilidade_close',
  transporteSaldos: 'contabilidade_close',
  auditoria: 'auditoria_view',
  dashboardFiscal: 'escrita_view',
  notasFiscais: 'escrita_view',
  nfse: 'escrita_view',
  pgdas: 'escrita_view',
  ciap: 'escrita_view',
  lcdpr: 'escrita_view',
  inventarioEstoque: 'escrita_view',
  cartoes: 'escrita_view',
  retencoes: 'escrita_view',
  reinf: 'escrita_view',
  difal: 'escrita_view',
  perDcomp: 'escrita_view',
  ipiBlocoK: 'escrita_view',
  participantes: 'escrita_view',
  produtos: 'escrita_view',
  acumuladores: 'escrita_view',
  apuracaoFiscal: 'escrita_view',
  calendarioFiscal: 'escrita_view',
  dashboardFolha: 'folha_view',
  colaboradores: 'folha_view',
  rubricas: 'folha_view',
  calculoFolha: 'folha_view',
  pontoEletronico: 'folha_view',
  sst: 'folha_view',
  esocial: 'folha_view',
  dctfWeb: 'folha_view',
  provisoesFolha: 'folha_view',
  rescisao: 'folha_view',
  beneficios: 'folha_view',
  analiseBalanco: 'contabilidade_view',
  protocolo: 'geral_view',
  dashboardHonorarios: 'honorarios_view',
  contratosHonorarios: 'honorarios_view',
  faturamentoHonorarios: 'honorarios_view',
  boletosHonorarios: 'honorarios_view',
  ecfBlocoY: 'contabilidade_view',
  dimob: 'escrita_view',
  dmed: 'escrita_view',
  efdContribuicoes: 'escrita_view',
  notasExplicativas: 'contabilidade_view',
  giaSintegra: 'escrita_view',
  dirf: 'escrita_view',
  emprestimosFinanciamentos: 'contabilidade_view',
  issqnDief: 'escrita_view',
  malhaFinaAuditoria: 'auditoria_view',
  defis: 'escrita_view',
  carneLeao: 'escrita_view',
  ecacCaixaPostal: 'escrita_view',
  fatorR: 'escrita_view',
  ativoIntangivel: 'contabilidade_view',
  leasingCpc06: 'contabilidade_view',
  icmsSubstituicaoTributaria: 'escrita_view',
  conciliacaoCartoes1600: 'escrita_view',
  subvencoesIncentivos: 'contabilidade_view',
  creditoPresumidoAgroIpi: 'escrita_view',
  reformaTributaria2026: 'contabilidade_view',
  avpCpc12: 'contabilidade_view',
  blocoKAvancadoEstoque: 'escrita_view',
  retencoesConstrucaoCivil: 'escrita_view',
  impairmentCpc01: 'contabilidade_view',
  precosTransferencia: 'contabilidade_view',
  cideRemessasExterior: 'escrita_view',
  ativosBiologicosCpc29: 'contabilidade_view',
  construcaoPocCpc47: 'contabilidade_view',
  consolidacaoMepCpc18: 'contabilidade_view',
  pisCofinsReceitasFinanceiras: 'escrita_view',
  combustiveisMonofasicoLmc: 'escrita_view',
  auditoriaSpedCruzamento: 'auditoria_view',
  ipiCreditoBasico: 'escrita_view',
  hedgeAccountingCpc48: 'contabilidade_view',
  retIncorporacaoMcmv: 'escrita_view',
  cooperativasSobrasPerdas: 'contabilidade_view',
  creditoAcumuladoIcms: 'escrita_view',
  ganhoCapitalAlienacao: 'contabilidade_view',
  reintegraExportacao: 'escrita_view',
  iofMutuos: 'contabilidade_view',
  apaPrecosTransferencia: 'contabilidade_view',
  fcbfCompensacao: 'escrita_view',
  depreciacaoAceleradaIncentivada: 'contabilidade_view',
  subcapitalizacaoThinCap: 'contabilidade_view',
  programaMover: 'escrita_view',
  jurosSobreCapitalProprio: 'contabilidade_view',
  cprAgronegocio: 'contabilidade_view',
  reidiInfraestrutura: 'escrita_view',
  prejuizosFiscaisLalur: 'contabilidade_view',
  cbiosRenovabio: 'contabilidade_view',
  drawbackIntegrado: 'escrita_view',
  debenturesIncentivadas: 'contabilidade_view',
  incentivosSudeneSudam: 'contabilidade_view',
  subvencoesInvestimentoLei14789: 'contabilidade_view',
  concessoesPublicasIcpc01: 'contabilidade_view',
  revisaoVidasUteisImpairment: 'contabilidade_view',
  creditoPisCofinsImobilizado: 'escrita_view',
  remuneracaoAcoesCpc10: 'contabilidade_view',
  beneficiosPosEmpregoCpc33: 'contabilidade_view',
  analiseDemonstracoesCfc: 'contabilidade_view',
  honorariosContabeis: 'contabilidade_view',
  sicalcAcrescimosDarf: 'escrita_view',
  cprbDesoneracao: 'escrita_view',
  pisCofinsFinanceiras: 'escrita_view',
  declaracoesEstaduais: 'escrita_view',
  balancoAbertura: 'contabilidade_view',
  retImobiliarioScp: 'escrita_view',
  zfmSuframa: 'escrita_view',
  difalNaoContribuinteFcp: 'escrita_view',
  cessaoMaoDeObraRetencoes: 'escrita_view',
  simplesRegimeCaixa: 'escrita_view',
  creditoPresumidoAgro: 'escrita_view',
  substituicaoPisCofins: 'escrita_view',
  subvencoesInvestimentoNovo: 'contabilidade_view',
  pisCofinsImportacao: 'escrita_view',
  entidadesSemFinsLucrativos: 'contabilidade_view',
  drawbackIntermediario: 'escrita_view',
  retencoesReinf4000: 'escrita_view',
  fci: 'escrita_view',
  dimeDcip: 'escrita_view',
  siscredParana: 'escrita_view',
  dereEconomico: 'contabilidade_view',
  fundosEquilibrioFiscal: 'escrita_view',
  scpSociedade: 'contabilidade_view',
  apuracaoEstoquesCusteio: 'contabilidade_view',
  cteTransporteFrete: 'escrita_view',
  derexSpedEcf: 'contabilidade_view',
  dapiMgIcms: 'escrita_view',
  pcldPerdasCreditos: 'contabilidade_view',
  dctfMensalTradicional: 'escrita_view',
  esocialRemuneracaoPgtos: 'folha_view',
  ecdDemonstracoesBlocoJ: 'contabilidade_view',
  ipiSelosControle: 'escrita_view'
};

export interface DocumentoStudio {
  id: number;
  empresaId: number;
  tipo: 'ATA_ASSEMBLEIA' | 'CONTRATO_SOCIAL' | 'DISTRATO' | 'CARTA_RESPONSABILIDADE' | 'NOTAS_EXPLICATIVAS' | 'RELATORIO_DIRETORIA' | 'NOTA_EXPLICATIVA' | 'TERMO_ABERTURA_ENCERRAMENTO';
  titulo: string;
  conteudoHtml: string;
  dataAtualizacao?: string;
  updatedAt?: string;
  ultimaModificacao?: string;
  exercicioAno?: number;
}

export interface Usuario {
  id: number;
  login: string;
  nome: string;
  email: string;
  cargo?: string;
  crc?: string;
  cpf?: string;
  perfil: PerfilUsuario;
  ativo: boolean;
  permissoes?: string[];
  senhaHash?: string;
  ultimoAcesso?: string;
  createdAt?: string;
}

export interface SessaoUsuario {
  token: string;
  usuarioId?: number;
  login?: string;
  nome?: string;
  usuarioNome?: string;
  email?: string;
  perfil?: PerfilUsuario;
  permissoes?: string[];
  iniciadoEm?: string;
  iniciadaEm?: string;
  expiraEm: string;
  usuario: Usuario;
}

export interface AuditoriaLog {
  id: number;
  dataHora: string;
  usuarioId?: number;
  usuarioNome: string;
  usuarioPerfil?: PerfilUsuario | string;
  empresaId?: number;
  modulo: string;
  operacao?: 'INCLUSAO' | 'EDICAO' | 'EXCLUSAO' | 'ENCERRAMENTO' | 'FECHAMENTO' | 'IMPORTACAO' | 'EXPORTACAO' | 'PROCESSAMENTO' | 'LOGIN' | 'LOGOUT' | 'ACESSO_NEGADO' | 'SEGURANCA' | string;
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
  tipoOperacao?: 'ENTRADA' | 'SAIDA' | 'SERVICO' | string;
  status?: string;
  acumuladorId: number;
  cfop: string;
  participanteId?: number;
  participanteNome?: string;
  destinatarioOuRemetente?: string;
  cnpjCpf?: string;
  clienteFornecedorNome?: string;
  clienteFornecedorCnpj?: string;
  participanteCnpj?: string;
  uf?: string;
  valorTotal: number;
  baseCalculoICMS?: number;
  baseICMS?: number;
  valorICMS?: number;
  baseCalculoPIS?: number;
  valorPIS?: number;
  baseCalculoCOFINS?: number;
  valorCOFINS?: number;
  baseCalculoISS?: number;
  valorISS?: number;
  retencaoIRRF?: number;
  valorIRRF?: number;
  retencaoCSRF?: number;
  valorCSLL?: number;
  retencaoINSS?: number;
  valorINSS?: number;
  itens?: ItemNotaFiscal[];
  parcelas?: ParcelaNotaFiscal[];
  integradaContabil?: boolean;
  integradoContabil?: boolean;
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
  valorINSS?: number;
  valorINSSPatronal?: number;
  valorFGTS?: number;
  valorLiquido?: number;
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

// ----------------------------------------------------
// RESCISÃO CONTRATUAL & TRCT OFICIAL (Portaria MTE nº 1.057/2012 / CLT / Lei 12.506/2011)
// ----------------------------------------------------
export type MotivoRescisao = 
  | 'SEM_JUSTA_CAUSA' 
  | 'PEDIDO_DEMISSAO' 
  | 'JUSTA_CAUSA' 
  | 'ACORDO_MUTUO' 
  | 'TERMINO_EXPERIENCIA' 
  | 'RESCISAO_ANTECIPADA';

export type TipoAvisoPrevio = 'TRABALHADO' | 'INDENIZADO' | 'DISPENSADO';

export interface VerbaRescisoriaItem {
  codigo: string;
  descricao: string;
  rubricaTipo: 'PROVENTO' | 'DESCONTO';
  valor: number;
  baseInss: boolean;
  baseFgts: boolean;
  baseIrrf: boolean;
}

export interface RescisaoContratual {
  id: number;
  empresaId: number;
  colaboradorId: number;
  colaboradorNome: string;
  cargo: string;
  dataAdmissao: string;
  dataDemissao: string;
  dataAvisoPrevio: string;
  motivo: MotivoRescisao;
  tipoAviso: TipoAvisoPrevio;
  diasAvisoLei12506: number; // 30 + 3 por ano trabalhado (máx 90)
  salarioBase: number;
  
  // Proventos Rescisórios
  saldoSalarioDias: number;
  saldoSalarioValor: number;
  decimoTerceiroAvos: number;
  decimoTerceiroValor: number;
  feriasProporcionaisAvos: number;
  feriasProporcionaisValor: number;
  tercoConstitucionalFeriasProp: number;
  feriasVencidasValor: number;
  tercoConstitucionalFeriasVenc: number;
  avisoPrevioIndenizadoValor: number;
  totalProventosBruto: number;

  // Descontos Oficiais
  inssRescisao: number;
  irrfRescisao: number;
  outrasDeducoes: number;
  totalDescontos: number;

  // Total Líquido
  valorLiquidoRescisorio: number;

  // FGTS e Multa Rescisória
  saldoFgtsParaFinsRescisorios: number;
  aliquotaMultaFgts: number; // 40% ou 20%
  valorMultaFgts: number;

  // Integração Contábil
  statusIntegracaoContabil: boolean;
  loteContabilId?: number;
  observacoes?: string;
}

// ----------------------------------------------------
// DEMONSTRAÇÃO DAS MUTAÇÕES DO PATRIMÔNIO LÍQUIDO (DMPL - CPC 26) & VALOR ADICIONADO (DVA - CPC 09)
// ----------------------------------------------------
export interface LinhaDmpl {
  id: string;
  descricao: string;
  capitalSocial: number;
  reservasCapital: number;
  reservasLucros: number;
  acoesTesouraria: number; // Negativo
  lucrosPrejuizosAcumulados: number;
  totalPl: number;
}

export interface QuadroDmpl {
  ano: number;
  empresaId: number;
  linhas: LinhaDmpl[];
  totalFinalPl: number;
}

export interface ItemDva {
  codigo: string;
  descricao: string;
  nivel: number;
  valor: number;
}

export interface DemonstracaoDva {
  ano: number;
  empresaId: number;
  geracaoValor: ItemDva[];
  distribuicaoValor: ItemDva[];
  valorAdicionadoTotal: number;
}

// ----------------------------------------------------
// LIVRO REGISTRO DE INVENTÁRIO MODELO 7 & SPED BLOCO H (RIR/2018 / RICMS)
// ----------------------------------------------------
export interface ItemInventarioEstoque {
  id: number;
  empresaId: number;
  ano: number;
  dataInventario: string; // YYYY-12-31
  codigoItem: string;
  descricaoItem: string;
  tipoItemSped: string; // 00, 01, 02, etc.
  unidadeMedida: string;
  quantidade: number;
  custoMedioUnitario: number;
  valorTotal: number;
  indicadorPropriedade: '0' | '1' | '2'; // 0-Item próprio em posse do informante, 1-Item próprio em poder de terceiros, 2-Item de terceiros em poder do informante
  contaContabilId?: number;
  contaContabilCodigo?: string;
  participantesCnpjCpf?: string;
}

export interface InventarioEstoqueModelo7 {
  ano: number;
  empresaId: number;
  dataInventario: string;
  motivoInventario: string; // 01-No encerramento do período
  totalEstoque: number;
  itens: ItemInventarioEstoque[];
  geradoEm: string;
}

// ----------------------------------------------------
// SIMPLES NACIONAL AVANÇADO & PGDAS-D (LC 123/2006 & CGSN 140/2018)
// ----------------------------------------------------
export type AnexoSimplesNacional = 'ANEXO_I' | 'ANEXO_II' | 'ANEXO_III' | 'ANEXO_IV' | 'ANEXO_V';

export interface FaixaSimplesNacional {
  faixa: number; // 1 a 6
  limiteInferior: number;
  limiteSuperior: number;
  aliquotaNominal: number; // ex: 0.04 (4%)
  deducao: number; // ex: 5940.00
  distribuicao: {
    irpj: number; // % sobre o total
    csll: number;
    cofins: number;
    pis: number;
    cpp: number;
    icms?: number;
    ipi?: number;
    iss?: number;
  };
}

export interface SegregacaoReceitaPgdas {
  id: string;
  anexo: AnexoSimplesNacional;
  descricaoAtividade: string;
  valorReceitaBruta: number;
  valorImuneIsento: number;
  valorSubstituicaoTributaria: number; // ST ICMS ou Monofásico PIS/COFINS
  valorTributavel: number;
  aliquotaEfetiva: number;
  valorDevido: number;
  detalhamentoTributos: {
    irpj: number;
    csll: number;
    cofins: number;
    pis: number;
    cpp: number;
    icms: number;
    ipi: number;
    iss: number;
  };
}

export interface ApuracaoPgdas {
  id: number;
  empresaId: number;
  competencia: string; // YYYY-MM
  dataVencimento: string; // dia 20 do mês subsequente
  rbt12: number; // Receita Bruta dos últimos 12 meses
  faturamentoMes: number;
  folhaSalarios12Meses: number; // Para cálculo do Fator R
  fatorR: number; // folhaSalarios12Meses / rbt12
  enquadraFatorR: boolean; // >= 0.28 vai p/ Anexo III, < 0.28 vai p/ Anexo V
  segregacoes: SegregacaoReceitaPgdas[];
  totalDevidoDas: number;
  numeroDas: string;
  codigoBarrasDas: string;
  qrCodePixDas: string;
  statusIntegracaoContabil: boolean;
  loteContabilId?: number;
  dataApuracao: string;
}

// ----------------------------------------------------
// GESTÃO DE BENEFÍCIOS & VALE-TRANSPORTE / REFEIÇÃO (LEI 7.418/1985 & CLT)
// ----------------------------------------------------
export type TipoBeneficio = 'VALE_TRANSPORTE' | 'VALE_REFEICAO' | 'VALE_ALIMENTACAO' | 'PLANO_SAUDE' | 'PLANO_ODONTO' | 'SEGURO_VIDA';

export interface BeneficioPlano {
  id: number;
  empresaId: number;
  tipo: TipoBeneficio;
  nome: string;
  operadora: string;
  valorFacialUnitario: number; // Ex: R$ 5,00 por passagem ou R$ 35,00 por dia de VR
  percentualDescontoLegal: number; // Ex: 6% para VT, até 20% para VR, 0 a 100% coparticipação
  valorMensalidadeFixa?: number; // Para convênio médico/odonto
  ativo: boolean;
}

export interface BeneficioColaboradorItem {
  id: number;
  empresaId: number;
  colaboradorId: number;
  colaboradorNome: string;
  planoId: number;
  tipo: TipoBeneficio;
  diasUteisMes: number;
  quantidadeDiaria: number; // ex: 2 passagens/dia
  valorTotalBeneficio: number; // dias * qtd * valorFacial
  descontoColaborador: number; // Limitado a 6% do salário base para VT
  custoEmpregador: number; // valorTotalBeneficio - descontoColaborador
  coparticipacao: number;
}

export interface FechamentoBeneficiosCompetencia {
  competencia: string; // YYYY-MM
  empresaId: number;
  totalBeneficiosFornecidos: number;
  totalDescontoEmpregados: number;
  totalCustoEmpresa: number;
  totalValeTransporte: number;
  totalValeRefeicaoAlimentacao: number;
  totalPlanosSaudeOdonto: number;
  itens: BeneficioColaboradorItem[];
  statusIntegracaoContabil: boolean;
  loteContabilId?: number;
  fechadoEm: string;
}

// ----------------------------------------------------
// BALANÇO SOCIAL MODELO IBASE & SUSTENTABILIDADE / ESG (NBC T 15 / CFC)
// ----------------------------------------------------
export interface LinhaBalancoSocial {
  codigo: string;
  descricao: string;
  valorPeriodo: number;
  percentualSobreFolha?: number; // % F.P.B.
  percentualSobreReceita?: number; // % R.L.
}

export interface SecaoBalancoSocial {
  titulo: string;
  linhas: LinhaBalancoSocial[];
  totalSecao: number;
  percentualTotalSobreReceita?: number;
}

export interface IndicadorCorpoFuncionalIbase {
  descricao: string;
  quantidadeInicio: number;
  quantidadeFim: number;
  percentualDoTotal: number;
}

export interface BalancoSocialIbase {
  ano: number;
  empresaId: number;
  receitaLiquida: number;
  resultadoOperacional: number;
  folhaPagamentoBruta: number;
  indicadoresSociaisInternos: SecaoBalancoSocial;
  indicadoresSociaisExternos: SecaoBalancoSocial;
  indicadoresAmbientais: SecaoBalancoSocial;
  indicadoresCorpoFuncional: IndicadorCorpoFuncionalIbase[];
  informacoesCidadania: {
    regrasDisseminadas: boolean;
    dialogoSindical: boolean;
    previdenciaPrivadaInstituida: boolean;
    participacaoLucrosInstituida: boolean;
  };
  geradoEm: string;
}

// ==========================================
// SPRINT 17: DIFAL PARTILHA INTERESTADUAL (EC 87/2015 & BLOCO E)
// ==========================================
export interface ItemDifalPartilhaSaida {
  id: string;
  notaFiscalId?: number;
  numeroNota: number;
  serie: string;
  dataEmissao: string;
  cliente: string;
  cnpjCpf: string;
  ufOrigem: string;
  ufDestino: string;
  valorTotalOperacao: number;
  baseCalculoICMS: number;
  aliquotaInterestadual: number;
  aliquotaInternaDestino: number;
  percentualDifal: number;
  aliquotaFCP: number;
  valorDifalDestino: number;
  valorFCPDestino: number;
  valorTotalDevido: number;
  codigoReceitaGNRE: string;
  guiaTipo: 'GNRE' | 'DARE';
  statusPagamento: 'PENDENTE' | 'PAGO';
}

export interface ApuracaoDifalUfDestino {
  uf: string;
  nomeEstado: string;
  totalOperacoes: number;
  valorTotalBase: number;
  totalDifalDevido: number;
  totalFcpDevido: number;
  totalGeralRecolher: number;
  codigoReceita: string;
  linhaDigitavel: string;
  guiaTipo: 'GNRE' | 'DARE';
  vencimento: string;
  statusGuia: 'GERADA' | 'PAGA';
}

export interface BlocoESpedPartilha {
  registroE300: string;
  registrosE310: string[];
  registrosE316: string[];
  conteudoSpedTxt: string;
}

export interface ResumoPartilhaInterestadual {
  empresaId: number;
  competencia: string;
  itens: ItemDifalPartilhaSaida[];
  apuracoesPorUf: ApuracaoDifalUfDestino[];
  totalGeralDifal: number;
  totalGeralFCP: number;
  totalGeralRecolher: number;
  spedBlocoE: BlocoESpedPartilha;
  statusIntegracao: 'PENDENTE' | 'INTEGRADO';
}

// ==========================================
// SPRINT 17: CONTROLE DE PONTO ELETRÔNICO & BANCO DE HORAS (PORTARIA MTP 671/2021)
// ==========================================
export type TipoDiaPonto = 'UTIL' | 'SABADO' | 'DOMINGO' | 'FERIADO';

export interface MarcacaoPonto {
  id: string;
  colaboradorId: number;
  data: string; // YYYY-MM-DD
  diaSemana: string;
  diaTipo: TipoDiaPonto;
  entrada1: string; // HH:MM
  saida1: string; // HH:MM
  entrada2: string; // HH:MM
  saida2: string; // HH:MM
  horasTrabalhadasMinutos: number;
  horasPrevistasMinutos: number;
  saldoMinutos: number;
  horasExtras50Minutos: number;
  horasExtras100Minutos: number;
  adicionalNoturnoMinutos: number;
  atrasoFaltaMinutos: number;
  ocorrencia?: string;
  fonteOrigem: 'REP' | 'MANUAL' | 'AFD';
}

export interface EspelhoPontoColaborador {
  colaboradorId: number;
  nomeColaborador: string;
  cpf: string;
  pis: string;
  cargo: string;
  departamento: string;
  jornadaDescricao: string;
  competencia: string;
  dias: MarcacaoPonto[];
  totalHorasTrabalhadas: string;
  totalHorasPrevistas: string;
  totalHorasExtras50: number; // horas decimais
  totalHorasExtras100: number; // horas decimais
  totalAdicionalNoturnoHoras: number; // horas decimais
  totalFaltasAtrasosHoras: number; // horas decimais
  bancoHorasSaldoAnterior: number; // horas decimais
  bancoHorasCreditoMes: number;
  bancoHorasDebitoMes: number;
  bancoHorasSaldoAtual: number;
}

export interface ArquivoAfdRegistro {
  nsr: number;
  tipo: '1' | '2' | '3' | '4' | '5';
  data: string;
  hora: string;
  pis: string;
  dadosBrutos: string;
}

// ==========================================
// SPRINT 17: PLANEJAMENTO TRIBUTÁRIO COMPARATIVO
// ==========================================
export type RegimeTributarioComparativo = 'SIMPLES_NACIONAL' | 'LUCRO_PRESUMIDO' | 'LUCRO_REAL';

export interface ParametrosPlanejamentoTributario {
  anoExercicio: number;
  receitaBrutaRevenda: number;
  receitaBrutaServicos: number;
  custoMercadoriasInsumos: number;
  despesasOperacionaisDedutiveis: number;
  folhaSalariosCltAnual: number;
  proLaboreAnual: number;
  aliquotaIcmsMedia: number;
  aliquotaIss: number;
}

export interface CenarioTributario {
  regime: RegimeTributarioComparativo;
  nomeRegime: string;
  impostosFederais: {
    irpj: number;
    csll: number;
    pis: number;
    cofins: number;
    totalFederal: number;
  };
  impostosEstaduais: {
    icms: number;
  };
  impostosMunicipais: {
    iss: number;
  };
  encargosPrevidenciariosFolha: {
    cppPatronal: number;
    ratFap: number;
    terceirosOutrasEntidades: number;
    totalFolha: number;
  };
  cargaTributariaTotal: number;
  aliquotaEfetivaSobreFaturamento: number;
  lucroLiquidoAposImpostos: number;
  vantagens: string[];
  desvantagens: string[];
}

export interface EstudoPlanejamentoTributario {
  empresaId: number;
  dataElaboracao: string;
  parametros: ParametrosPlanejamentoTributario;
  cenarios: {
    simples: CenarioTributario;
    presumido: CenarioTributario;
    real: CenarioTributario;
  };
  regimeRecomendado: RegimeTributarioComparativo;
  economiaAnualEstimada: number;
  parecerTecnico: string;
  responsavelTecnico: {
    nome: string;
    crc: string;
  };
}

// ==========================================
// SPRINT 18: LALUR & LACS DIGITAL (SPED ECF BLOCO M)
// ==========================================
export type TipoTributoLalur = 'IRPJ' | 'CSLL';
export type TipoLancamentoLalurParteA = 'ADICAO' | 'EXCLUSAO' | 'COMPENSACAO';
export type OrigemLancamentoLalur = 'MANUAL' | 'CONTABILIDADE' | 'CSLL_AUTOMATICO';

export interface LalurParteAItem {
  id: number;
  empresaId: number;
  periodo: string; // Ex: '2026-1T', '2026-2T' ou '2026'
  tipoTributo: TipoTributoLalur;
  tipoLancamento: TipoLancamentoLalurParteA;
  codigoLinhaEcf: string; // Código de relacionamento com Bloco M da ECF (ex: 'M300.10', 'M350.20')
  descricao: string;
  valor: number;
  origem: OrigemLancamentoLalur;
  contaContabilId?: number;
  contaParteBId?: number;
  historico?: string;
}

export interface LalurParteBConta {
  id: number;
  empresaId: number;
  codigo: string;
  descricao: string;
  tributo: TipoTributoLalur;
  ehPrejuizoFiscal: boolean; // Prejuízo fiscal a compensar (IRPJ) ou base negativa (CSLL)
  dataCriacao: string;
  dataLimiteUso?: string;
  saldoInicial: number;
  totalAdicoesPeriodo: number;
  totalBaixasPeriodo: number;
  saldoAtual: number;
  tipoTributacao: 'DIFERIDO_TEMPORARIO' | 'PREJUIZO_FISCAL' | 'OUTROS';
}

export interface ApuracaoLalurPeriodo {
  id: number;
  empresaId: number;
  periodo: string; // '2026-1T' ou '2026'
  formaTributacao: 'LUCRO_REAL_TRIMESTRAL' | 'LUCRO_REAL_ANUAL_ESTIMATIVA';
  
  // IRPJ
  lucroLiquidoAntesImpostos: number;
  totalAdicoesIRPJ: number;
  totalExclusoesIRPJ: number;
  lucroRealAntesCompensacaoIRPJ: number;
  limiteCompensacaoPrejuizoIRPJ: number; // 30% do Lucro Real antes da compensação
  prejuizoCompensadoIRPJ: number;
  lucroRealFinalIRPJ: number;
  aliquotaBasicaIRPJ: number; // 15%
  valorIRPJBasico: number;
  parcelaIsentaAdicional: number; // R$ 20.000/mês ou R$ 60.000/trimestre
  baseAdicionalIRPJ: number;
  aliquotaAdicionalIRPJ: number; // 10%
  valorAdicionalIRPJ: number;
  deducoesIncentivosIRPJ: number;
  retencoesFonteIRPJ: number;
  irpjFinalDevido: number;

  // CSLL
  totalAdicoesCSLL: number;
  totalExclusoesCSLL: number;
  baseCalculoAntesCompensacaoCSLL: number;
  limiteCompensacaoBaseNegativaCSLL: number; // 30%
  baseNegativaCompensadaCSLL: number;
  baseCalculoFinalCSLL: number;
  aliquotaCSLL: number; // 9%
  retencoesFonteCSLL: number;
  csllFinalDevida: number;

  dataApuracao: string;
  status: 'ABERTO' | 'APURADO' | 'ENCERRADO' | 'INTEGRADO_CONTABIL';
}

// ==========================================
// SPRINT 18: SST & CONTROLE DE AFASTAMENTOS (eSOCIAL S-2210/S-2220/S-2240/S-2230)
// ==========================================
export type MotivoAfastamentoEsocial = 
  | '01_ACIDENTE_TRABALHO_INSS' 
  | '03_DOENCA_NAO_OCUPACIONAL_INSS' 
  | '17_LICENCA_MATERNIDADE_120D' 
  | '21_FERIAS_REGULAMENTARES' 
  | '05_ABORTAMENTO_NAO_CRIMINOSO'
  | '20_SUSPENSAO_DISCIPLINAR'
  | '99_OUTROS_AFASTAMENTOS';

export interface AfastamentoColaborador {
  id: number;
  empresaId: number;
  colaboradorId: number;
  colaboradorNome: string;
  matriculaEsocial?: string;
  motivo: MotivoAfastamentoEsocial;
  codigoMotivoEsocial: string; // Ex: '01', '03', '17', '21'
  descricaoMotivo: string;
  dataInicio: string;
  dataRetornoPrevista?: string;
  dataRetornoEfetiva?: string;
  diasAfastamentoTotal: number;
  diasPagoEmpregador: number; // Primeiros 15 dias para doença/acidente
  diasBeneficioInss: number; // A partir do 16º dia
  cid10?: string;
  nomeMedico?: string;
  crmMedico?: string;
  ufCrm?: string;
  observacoes?: string;
  status: 'EM_ANDAMENTO' | 'RETORNADO';
  eventoS2230Enviado: boolean;
  reciboEsocial?: string;
}

export type TipoExameOcupacional = 
  | 'ADMISSIONAL' 
  | 'PERIODICO' 
  | 'RETORNO_TRABALHO' 
  | 'MUDANCA_RISCO' 
  | 'DEMISSIONAL';

export interface AtestadoSaudeOcupacional {
  id: number;
  empresaId: number;
  colaboradorId: number;
  colaboradorNome: string;
  tipoExame: TipoExameOcupacional;
  dataExame: string;
  dataValidade?: string;
  medicoExaminador: string;
  crmExaminador: string;
  ufExaminador: string;
  medicoCoordenadorPcmso: string;
  crmCoordenador: string;
  ufCoordenador: string;
  resultadoAptidao: 'APTO' | 'INAPTO';
  examesComplementares: {
    nomeExame: string;
    dataRealizacao: string;
    resultado: 'NORMAL' | 'ALTERADO';
  }[];
  eventoS2220Enviado: boolean;
  reciboEsocial?: string;
}

export interface FatorRiscoAmbiental {
  id: number;
  empresaId: number;
  colaboradorId: number;
  colaboradorNome: string;
  cargo: string;
  setor: string;
  dataInicio: string;
  dataFim?: string;
  tipoRisco: 'FISICO' | 'QUIMICO' | 'BIOLOGICO' | 'ERGONOMICO' | 'MECANICO_ACIDENTE' | 'AUSENCIA_RISCO';
  codigoTabela24: string; // Tabela 24 do eSocial (ex: '01.01.001' Ruído, '05.01.001' Ausência)
  descricaoAgenteNocivo: string;
  intensidadeConcentracao: string; // Ex: '85 dB(A)', '1.5 mg/m³', 'NA'
  tecnicaUtilizada: string; // Ex: 'NHO-01 / Dosimetria', 'NR-15 Anexo 1', 'NA'
  epcEficaz: boolean;
  epiEficaz: boolean;
  caEpi?: string; // Certificado de Aprovação do EPI
  responsavelTecnico: {
    nome: string;
    registroProfissional: string; // CREA ou CRM
    ufRegistro: string;
  };
  eventoS2240Enviado: boolean;
  reciboEsocial?: string;
}

// CAT - Comunicação de Acidente de Trabalho (eSocial S-2210)
export interface CatAcidenteTrabalho {
  id: number;
  empresaId: number;
  colaboradorId: number;
  colaboradorNome: string;
  tipoAcidente: 'TIPICO' | 'TRAJETO' | 'DOENCA_PROFISSIONAL';
  dataHoraAcidente: string;
  localAcidente: string;
  parteCorpoAtingida: string;
  agenteCausador: string;
  houveMorte: boolean;
  atendimentoMedico: {
    dataAtendimento: string;
    nomeHospital: string;
    cid10: string;
    crmMedico: string;
    nomeMedico: string;
  };
  numeroCat: string;
  eventoS2210Enviado: boolean;
  reciboEsocial?: string;
}

// PER/DCOMP Web (IN RFB nº 2.055/2021)
export type TipoCreditoPerDcomp = 
  | 'PAGAMENTO_INDEVIDO_A_MAIOR' 
  | 'SALDO_NEGATIVO_IRPJ' 
  | 'SALDO_NEGATIVO_CSLL' 
  | 'PIS_NAO_CUMULATIVO' 
  | 'COFINS_NAO_CUMULATIVO' 
  | 'RETENCAO_LEI_9711_INSS';

export interface CreditoTributarioPerDcomp {
  id: number;
  empresaId: number;
  tipoCredito: TipoCreditoPerDcomp;
  periodoApuracao: string; // YYYY-MM ou Trimestre
  dataPagamentoConstituicao: string;
  valorOriginal: number;
  taxaSelicAcumulada: number; // Em percentual, ex: 8.45%
  valorJurosSelic: number;
  valorTotalAtualizado: number;
  valorJaUtilizado: number;
  saldoDisponivel: number;
  status: 'DISPONIVEL' | 'COMPENSADO_PARCIAL' | 'TOTALMENTE_UTILIZADO';
}

export interface DebitoCompensadoPerDcomp {
  id: number;
  tributo: 'IRPJ' | 'CSLL' | 'PIS' | 'COFINS' | 'IPI' | 'INSS_PREVIDENCIARIO';
  codigoReceitaDarf: string; // Ex: '1708', '5952', '1097', '2172', '0561'
  periodoApuracao: string;
  dataVencimento: string;
  valorPrincipal: number;
  valorMulta: number;
  valorJuros: number;
  valorTotalDebito: number;
  valorCompensado: number;
}

export interface DeclaracaoPerDcomp {
  id: number;
  empresaId: number;
  numeroPerDcomp: string; // Ex: 'PERDCOMP-2026-0001'
  dataTransmissao: string;
  tipoCredito: TipoCreditoPerDcomp;
  creditoId: number;
  valorCreditoOriginal: number;
  valorCreditoAtualizadoSelic: number;
  debitosCompensados: DebitoCompensadoPerDcomp[];
  totalDebitosCompensados: number;
  saldoRemanescenteCredito: number;
  integradoContabilidade: boolean;
  numeroLoteContabil?: number;
}

// Livro Registro de Apuração do IPI (Modelo 8) & Bloco K (RIPI / EFD-ICMS/IPI)
export interface ItemApuracaoIpi {
  id: number;
  empresaId: number;
  competencia: string; // YYYY-MM
  tipo: 'DEBITO_SAIDA' | 'CREDITO_ENTRADA' | 'OUTROS_DEBITOS' | 'OUTROS_CREDITOS' | 'ESTORNO_DEBITO' | 'ESTORNO_CREDITO';
  cfop: string;
  descricaoOperacao: string;
  baseCalculo: number;
  aliquotaMediaIpi: number;
  valorIpi: number;
  numeroDocumento?: string;
}

export interface ApuracaoMensalIpi {
  id: number;
  empresaId: number;
  competencia: string; // YYYY-MM
  totalDebitosSaidas: number;
  outrosDebitos: number;
  estornosCreditos: number;
  totalGeralDebitos: number;

  totalCreditosEntradas: number;
  outrosCreditos: number;
  estornosDebitos: number;
  saldoCredorPeriodoAnterior: number;
  totalGeralCreditos: number;

  saldoApuradoIpi: number; // > 0 a recolher, < 0 saldo credor acumulado
  saldoCredorTransportar: number;
  ipiARecolher: number;
  codigoReceitaDarf: string; // '1097' para produtos manufaturados
  dataVencimento: string; // Dia 25 do mês subsequente
  integradoContabilidade: boolean;
  numeroLoteContabil?: number;
}

export interface RegistroK200EstoqueEscriturado {
  id: number;
  empresaId: number;
  competencia: string;
  dataEstoque: string;
  codigoItem: string;
  descricaoItem: string;
  tipoItem: '00_MERCADORIA_REVENDA' | '01_MATERIA_PRIMA' | '02_EMBALAGEM' | '03_PRODUTO_PROCESSO' | '04_PRODUTO_ACABADO';
  unidadeMedida: string;
  quantidadeEstoque: number;
  custoUnitarioMedio: number;
  valorTotalEstoque: number;
  indicadorPropriedade: '0_EMPRESA_EM_SEU_PODER' | '1_EMPRESA_EM_PODER_TERCEIROS' | '2_TERCEIROS_EM_PODER_EMPRESA';
}

// -----------------------------------------------------------------
// ANÁLISE DAS DEMONSTRAÇÕES CONTÁBEIS & ÍNDICES ECONÔMICO-FINANCEIROS
// -----------------------------------------------------------------
export interface IndicesLiquidez {
  liquidezImediata: number; // Disponibilidades / Passivo Circulante
  liquidezCorrente: number; // Ativo Circulante / Passivo Circulante
  liquidezSeca: number; // (Ativo Circulante - Estoques) / Passivo Circulante
  liquidezGeral: number; // (Ativo Circulante + RLP) / (Passivo Circulante + ELP)
}

export interface IndicesEndividamento {
  endividamentoGeral: number; // (PC + ELP) / Ativo Total * 100
  participacaoCapitalTerceiros: number; // (PC + ELP) / PL * 100
  composicaoEndividamentoCurtoPrazo: number; // PC / (PC + ELP) * 100
  imobilizacaoPatrimonioLiquido: number; // Ativo Imobilizado / PL * 100
  imobilizacaoRecursosNaoCorrentes: number; // Ativo Imobilizado / (PL + ELP) * 100
}

export interface IndicesRentabilidade {
  giroAtivo: number; // Receita Líquida / Ativo Total
  margemOperacional: number; // Lucro Operacional / Receita Líquida * 100
  margemLiquida: number; // Lucro Líquido / Receita Líquida * 100
  retornoSobreAtivo: number; // ROA: Lucro Líquido / Ativo Total * 100
  retornoSobrePatrimonioLiquido: number; // ROE: Lucro Líquido / PL * 100
}

export interface AnaliseTermometroKanitz {
  fatorZ: number; // 0.05*ROE + 1.65*LG + 3.55*LS - 1.06*LC - 0.33*EG
  classificacao: 'SOLVENTE' | 'PENUMBRA_ALERTA' | 'INSOLVENTE';
  interpretacao: string;
}

export interface ItemAnaliseVerticalHorizontal {
  classificacao: string;
  descricaoConta: string;
  grau: number;
  saldoExercicioAnterior: number;
  saldoExercicioAtual: number;
  analiseVerticalAnteriorPercent: number; // AV% do período anterior
  analiseVerticalAtualPercent: number; // AV% do período atual
  variacaoHorizontalNominal: number; // Atual - Anterior
  analiseHorizontalPercent: number; // ((Atual - Anterior) / Anterior) * 100
}

export interface RelatorioAnaliseBalanco {
  empresaId: number;
  exercicioAtual: number;
  exercicioAnterior: number;
  totalAtivo: number;
  totalPassivoCirculante: number;
  totalPassivoNaoCirculante: number;
  totalPatrimonioLiquido: number;
  receitaLiquida: number;
  lucroOperacional: number;
  lucroLiquido: number;
  liquidez: IndicesLiquidez;
  endividamento: IndicesEndividamento;
  rentabilidade: IndicesRentabilidade;
  kanitz: AnaliseTermometroKanitz;
  itensAnaliseBalanco: ItemAnaliseVerticalHorizontal[];
  itensAnaliseDRE: ItemAnaliseVerticalHorizontal[];
}

// -----------------------------------------------------------------
// PROTOCOLO DE ENTREGA & RECEBIMENTO DE DOCUMENTOS (GEPROTOCOLO)
// -----------------------------------------------------------------
export type TipoMovimentoProtocolo = 'SAIDA_ESCRITORIO' | 'ENTRADA_ESCRITORIO';
export type StatusProtocolo = 'EMITIDO' | 'ENTREGUE' | 'CONFIRMADO_ASSINADO' | 'CANCELADO';

export interface ItemProtocoloDocumento {
  id: string;
  descricaoDocumento: string;
  competencia?: string;
  dataVencimento?: string;
  valorOriginal?: number;
  quantidadeVias: number;
  tipoVia: 'ORIGINAL' | 'COPIA' | 'DIGITAL';
  observacao?: string;
}

export interface ProtocoloDocumento {
  id: number;
  empresaId: number;
  numeroProtocolo: string; // Ex: 2026/00142
  tipoMovimento: TipoMovimentoProtocolo;
  dataHoraEmissao: string;
  competencia: string;
  usuarioResponsavelNome: string;
  nomeContatoRecepcao: string;
  documentoContatoRecepcao?: string; // CPF ou RG
  emailContatoNotificacao?: string;
  telefoneContato?: string;
  dataHoraEntregaEfetiva?: string;
  status: StatusProtocolo;
  observacoesGerais?: string;
  itens: ItemProtocoloDocumento[];
  exigeAssinaturaFisica: boolean;
  reciboAssinadoUrl?: string;
}

// -----------------------------------------------------------------
// BOLETOS BANCÁRIOS & COBRANÇA DE HONORÁRIOS COM PIX (CNAB 240/400)
// -----------------------------------------------------------------
export type StatusBoleto = 'EMITIDO' | 'REGISTRADO_BANCO' | 'LIQUIDADO_PAGO' | 'VENCIDO' | 'BAIXADO_CANCELADO';

export interface BoletoBancario {
  id: number;
  faturaId: number;
  empresaId: number;
  codigoBanco: '001' | '237' | '341' | '033' | '756' | '748';
  nomeBanco: string;
  agencia: string;
  contaCorrente: string;
  carteira: string;
  numeroDocumento: string;
  nossoNumero: string;
  linhaDigitavel: string;
  codigoBarras: string;
  dataEmissao: string;
  dataVencimento: string;
  valorBoleto: number;
  multaAposVencimentoPercentual: number; // Geralmente 2%
  jurosMoraMensalPercentual: number; // Geralmente 1% a.m.
  descontoAteVencimento?: number;
  pixQrCodePayload?: string;
  pixCopiaECola?: string;
  status: StatusBoleto;
  dataPagamento?: string;
  valorPago?: number;
  instrucoesSacado: string[];
}

// -----------------------------------------------------------------
// SPRINT 20: SPED ECF BLOCO Y (INFORMAÇÕES GERAIS, ECONÔMICAS E QSA)
// -----------------------------------------------------------------
export interface RegistroY540 {
  id: string;
  cnpjEstabelecimento: string;
  codigoCnae: string;
  descricaoCnae: string;
  receitaVendaBensProprios: number;
  receitaVendaBensRevenda: number;
  receitaPrestacaoServicos: number;
  receitaExportacao: number;
  outrasReceitasOperacionais: number;
  totalReceitaAtividade: number;
}

export interface RegistroY570 {
  id: string;
  cnpjFontePagadora: string;
  nomeFontePagadora: string;
  orgaoPublico: boolean;
  codigoReceita: string; // Ex: '1708', '5952'
  rendimentoBruto: number;
  irrfRetido: number;
  csllRetida: number;
}

export interface RegistroY600 {
  id: string;
  paisResidencia: string; // '105' Brasil
  indicadorPfPj: 'PF' | 'PJ';
  cpfCnpj: string;
  nomeSocioDirigente: string;
  qualificacaoSocio: string; // '49' Sócio-Administrador, '22' Sócio, etc.
  percentualCapitalTotal: number;
  percentualCapitalVotante: number;
  rendimentoBrutoProlabore: number;
  lucrosDividendosPagos: number; // Isentos
  jurosSobreCapitalProprio: number;
  demaisRendimentos: number;
  irrfRetidoSocio: number;
}

export interface RegistroY672 {
  capitalSocialIntegralizado: number;
  comprasMercadoriasRevenda: number;
  comprasMateriasPrimas: number;
  folhaSalariosBruta: number;
  ativoTotalFinal: number;
  saldoFinalCaixaBancos: number;
}

export interface EcfBlocoYDados {
  empresaId: number;
  anoExercicio: number;
  registrosY540: RegistroY540[];
  registrosY570: RegistroY570[];
  registrosY600: RegistroY600[];
  registroY672: RegistroY672;
  dataAtualizacao: string;
}

// -----------------------------------------------------------------
// SPRINT 20: DIMOB (DECLARAÇÃO DE INFORMAÇÕES SOBRE ATIVIDADES IMOBILIÁRIAS)
// -----------------------------------------------------------------
export interface RendimentoMensalLocacao {
  mes: number; // 1 a 12
  rendimentoBruto: number;
  valorComissao: number;
  impostoRetidoFonte: number;
  rendimentoLiquidoLocador: number;
}

export interface FichaLocacaoDimob {
  id: string;
  empresaId: number;
  anoReferencia: number;
  numeroContrato: string;
  dataContrato: string;
  codigoImovel: string;
  tipoImovel: 'URBANO' | 'RURAL';
  enderecoImovel: string;
  cepImovel: string;
  municipioImovel: string;
  ufImovel: string;
  locadorCpfCnpj: string;
  locadorNome: string;
  locatarioCpfCnpj: string;
  locatarioNome: string;
  rendimentosMensais: RendimentoMensalLocacao[];
  totalAnualBruto: number;
  totalAnualComissao: number;
  totalAnualIrrf: number;
  totalAnualLiquido: number;
}

export interface FichaIntermediacaoVendaDimob {
  id: string;
  empresaId: number;
  anoReferencia: number;
  numeroContrato: string;
  dataContrato: string;
  codigoImovel: string;
  enderecoImovel: string;
  municipioImovel: string;
  ufImovel: string;
  cepImovel: string;
  vendedorCpfCnpj: string;
  vendedorNome: string;
  compradorCpfCnpj: string;
  compradorNome: string;
  dataTransacao: string;
  valorTotalVenda: number;
  valorComissaoImobiliaria: number;
  numeroNotaFiscal?: string;
}

export interface DeclaracaoDimob {
  empresaId: number;
  anoCalendario: number;
  anoReferencia: number;
  retificadora: boolean;
  numeroReciboAnterior?: string;
  responsavelNome: string;
  responsavelCpf: string;
  fichasLocacao: FichaLocacaoDimob[];
  fichasIntermediacao: FichaIntermediacaoVendaDimob[];
  totalGeralLocacoesBruto: number;
  totalGeralComissoesLocacao: number;
  totalGeralVendas: number;
  totalGeralComissoesVenda: number;
  arquivoDimobTxt?: string;
  dataGeracao: string;
}

// -----------------------------------------------------------------
// SPRINT 20: DMED (DECLARAÇÃO DE SERVIÇOS MÉDICOS E DE SAÚDE)
// -----------------------------------------------------------------
export interface RegistroRopServicoMedico {
  id: string;
  empresaId: number;
  anoCalendario: number;
  responsavelCpf: string;
  responsavelNome: string;
  beneficiarioCpf?: string;
  beneficiarioNome: string;
  beneficiarioDataNascimento: string;
  parentescoBeneficiario: 'TITULAR' | 'CONJUGE_COMPANHEIRO' | 'FILHO_ENTEADO' | 'PAIS' | 'OUTRO';
  tipoServicoSaude: 'CONSULTA_MEDICA' | 'ODONTOLOGIA' | 'PSICOLOGIA' | 'FISIOTERAPIA' | 'FONOAUDIOLOGIA' | 'EXAMES_LABORATORIAIS' | 'HOSPITALAR_CIRURGICO';
  profissionalCrmCro: string;
  profissionalNome: string;
  dataAtendimento: string;
  numeroReciboNfse: string;
  valorPago: number;
  valorReembolsado: number;
  valorDedutivel: number;
}

export interface RegistroDdmPlanoSaude {
  id: string;
  empresaId: number;
  anoCalendario: number;
  registroAnsOperadora: string;
  nomeOperadora: string;
  responsavelCpf: string;
  responsavelNome: string;
  numeroContrato: string;
  valorAnualPago: number;
  beneficiariosQtd: number;
}

export interface DeclaracaoDmed {
  empresaId: number;
  anoCalendario: number;
  anoReferencia: number;
  retificadora: boolean;
  numeroReciboAnterior?: string;
  responsavelNome: string;
  responsavelCpf: string;
  servicosPrestados: RegistroRopServicoMedico[];
  planosSaude: RegistroDdmPlanoSaude[];
  totalValorPagoServicos: number;
  totalValorReembolsado: number;
  totalValorDedutivel: number;
  arquivoDmedTxt?: string;
  dataGeracao: string;
}

// -----------------------------------------------------------------
// SPRINT 21: EFD-CONTRIBUIÇÕES (PIS/PASEP E COFINS - LEIS 10.637 / 10.833 / IN 1.252)
// -----------------------------------------------------------------
export type TipoRegimeContribuicao = 'CUMULATIVO' | 'NAO_CUMULATIVO' | 'MISTO';
export type MetodoApropriacaoCreditos = 'DIRETA' | 'PROPORCIONAL';

export interface RegistroM210PisApuracao {
  id: string;
  codigoContribuicao: string; // '01' - Não Cumulativo 1,65%, '02' - Cumulativo 0,65%, '31' - Diferenciada, etc.
  cstPis: string; // '01', '02', '03', '04', '06', '50', etc.
  descricao: string;
  valorReceitaBruta: number;
  valorExclusoes: number;
  valorBaseCalculo: number;
  aliquotaPercentual: number; // 0.65 ou 1.65
  valorContribuicaoApurada: number;
  valorCreditoDescontado: number;
  valorContribuicaoDevida: number;
}

export interface RegistroM610CofinsApuracao {
  id: string;
  codigoContribuicao: string; // '01' - Não Cumulativo 7,60%, '02' - Cumulativo 3,00%, etc.
  cstCofins: string;
  descricao: string;
  valorReceitaBruta: number;
  valorExclusoes: number;
  valorBaseCalculo: number;
  aliquotaPercentual: number; // 3.00 ou 7.60
  valorContribuicaoApurada: number;
  valorCreditoDescontado: number;
  valorContribuicaoDevida: number;
}

export interface RegistroF100OperacaoCredito {
  id: string;
  empresaId: number;
  competencia: string; // YYYY-MM
  indicadorOperacao: 'CREDITO' | 'RECEITA';
  naturezaBaseCalculo: string; // '01' - Aquisição Bens para Revenda, '02' - Energia Elétrica, '03' - Aluguéis de Prédios, '04' - Aluguéis de Máquinas/Equipamentos, '05' - Arrendamento Mercantil, '06' - Armazenagem e Frete, '07' - Vale Transporte e Refeição
  cstPis: string;
  cstCofins: string;
  dataOperacao: string;
  valorOperacao: number;
  valorBaseCalculoPis: number;
  aliquotaPis: number;
  valorPis: number;
  valorBaseCalculoCofins: number;
  aliquotaCofins: number;
  valorCofins: number;
  participanteNome?: string;
  participanteCnpjCpf?: string;
  contaContabilDebitoId?: number;
  contaContabilCreditoId?: number;
  descricao: string;
}

export interface RegistroF600RetencaoFonte {
  id: string;
  empresaId: number;
  competencia: string; // YYYY-MM
  tipoRetencao: 'PRIVADO_CSRF' | 'ORGAO_PUBLICO_FEDERAL' | 'ORGAO_ESTADUAL_MUNICIPAL';
  fontePagadoraCnpj: string;
  fontePagadoraRazaoSocial: string;
  dataRetencao: string;
  valorRendimentoBruto: number;
  valorRetidoPis: number;
  valorRetidoCofins: number;
  naturezaRetencao: string;
}

export interface DeclaracaoEfdContribuicoes {
  empresaId: number;
  competencia: string; // YYYY-MM
  regimeTributario: TipoRegimeContribuicao;
  metodoApropriacao: MetodoApropriacaoCreditos;
  tipoEscrituracao: 'ORIGINAL' | 'RETIFICADORA';
  numeroReciboAnterior?: string;
  operacoesF100: RegistroF100OperacaoCredito[];
  retencoesF600: RegistroF600RetencaoFonte[];
  apuracaoPis: RegistroM210PisApuracao[];
  apuracaoCofins: RegistroM610CofinsApuracao[];
  totalPisDebito: number;
  totalPisCredito: number;
  totalPisRetido: number;
  saldoPisRecolher: number;
  totalCofinsDebito: number;
  totalCofinsCredito: number;
  totalCofinsRetido: number;
  saldoCofinsRecolher: number;
  arquivoTxtEfd?: string;
  dataGeracao: string;
}

// -----------------------------------------------------------------
// SPRINT 21: NOTAS EXPLICATIVAS ÀS DEMONSTRAÇÕES CONTÁBEIS (NBC TG 26 / CPC 26)
// -----------------------------------------------------------------
export interface LinhaTabelaNotaExplicativa {
  conta?: string;
  descricao: string;
  anoAtual: number;
  anoAnterior: number;
  observacao?: string;
}

export interface TabelaDadosNotaExplicativa {
  cabecalhos: string[];
  linhas: LinhaTabelaNotaExplicativa[];
  totalAtual?: number;
  totalAnterior?: number;
}

export interface SecaoNotaExplicativa {
  numeroNota: number;
  titulo: string;
  codigoReferencia: string; // 'CONTEXTO_OPERACIONAL', 'BASE_APRESENTACAO', 'POLITICAS_CONTABEIS', 'CAIXA_EQUIVALENTES', 'CLIENTES_PECLD', 'ESTOQUES', 'IMOBILIZADO', 'FORNECEDORES_OBRIGACOES', 'EMPRESTIMOS', 'PROVISOES_CONTINGENCIAS', 'PATRIMONIO_LIQUIDO', 'PARTES_RELACIONADAS', 'EVENTOS_SUBSEQUENTES'
  conteudoTexto: string;
  tabelaDados?: TabelaDadosNotaExplicativa;
  ativa: boolean;
}

export interface ConjuntoNotasExplicativas {
  id: string;
  empresaId: number;
  anoExercicio: number;
  anoAnterior: number;
  tituloDocumento: string;
  subtitulo: string;
  dataEncerramento: string;
  dataPublicacao: string;
  secoes: SecaoNotaExplicativa[];
  contadorNome: string;
  contadorCrc: string;
  administradorNome: string;
  administradorCargo: string;
  declaracaoConformidadeCfc: boolean;
  ultimaAtualizacao: string;
}

// -----------------------------------------------------------------
// SPRINT 21: GIA ELETRÔNICA ESTADUAL (ICMS / ST) & SINTEGRA (CONVÊNIO 57/95)
// -----------------------------------------------------------------
export interface ResumoCfopGia {
  id: string;
  cfop: string;
  natureza: 'ENTRADA' | 'SAIDA';
  origemDestino: 'INTERNA' | 'INTERESTADUAL' | 'EXTERIOR';
  descricao: string;
  valorContabil: number;
  baseCalculo: number;
  impostoDebitadoOuCreditado: number;
  isentasOuNaoTributadas: number;
  outras: number;
  aliquotaMedia: number;
}

export interface OcorrenciaAjusteGia {
  id: string;
  tipoAjuste: 'OUTROS_CREDITOS' | 'ESTORNO_DEBITOS' | 'OUTROS_DEBITOS' | 'ESTORNO_CREDITOS' | 'DEDUCAO_LEGAL';
  codigoSubanexo: string;
  descricao: string;
  fundamentoLegal: string;
  valor: number;
}

export interface DeclaracaoGiaEletronica {
  empresaId: number;
  competencia: string; // YYYY-MM
  inscricaoEstadual: string;
  regimeTributacaoEstadual: 'RPA' | 'SIMPLES_NACIONAL';
  tipoDeclaracao: 'ORIGINAL' | 'SUBSTITUTIVA';
  resumoCfops: ResumoCfopGia[];
  ajustesOcorrencias: OcorrenciaAjusteGia[];
  saldoCredorAnterior: number;
  totalDebitoImposto: number;
  totalCreditoImposto: number;
  totalOutrosCreditos: number;
  totalEstornoDebitos: number;
  totalOutrosDebitos: number;
  totalEstornoCreditos: number;
  totalDeducoes: number;
  impostoRecolher: number;
  saldoCredorSeguinte: number;
  // ICMS Substituição Tributária (ST)
  icmsStBaseCalculo: number;
  icmsStValorDevido: number;
  icmsStRecolher: number;
  arquivoGiaTxt?: string;
  arquivoSintegraTxt?: string;
  dataGeracao: string;
}

// -----------------------------------------------------------------
// SPRINT 22: DIRF (DECLARAÇÃO DO IMPOSTO DE RENDA RETIDO NA FONTE)
// Instrução Normativa RFB nº 1.990/2020 e Art. 718 do RIR/2018
// -----------------------------------------------------------------
export interface RendimentoMensalDirf {
  mes: number; // 1 a 12
  rendimentoBruto: number;
  previdenciaOficial: number;
  dependentes: number;
  pensaoAlimenticia: number;
  outrasDeducoes: number;
  irrfRetido: number;
}

export interface BeneficiarioDirf {
  id: string;
  empresaId: number;
  anoCalendario: number;
  tipoBeneficiario: 'PF' | 'PJ';
  cpfCnpj: string;
  nomeRazaoSocial: string;
  codigoReceita: string; // Ex: '0561', '0588', '1708', '3208', '5952'
  descricaoCodigo: string;
  molestiaGrave?: boolean;
  previdenciaComplementarTotal?: number;
  meses: RendimentoMensalDirf[];
  totalRendimentoBruto: number;
  totalPrevidencia: number;
  totalDependentes: number;
  totalPensao: number;
  totalIrrf: number;
}

export interface DeclaracaoDirf {
  empresaId: number;
  anoCalendario: number;
  anoReferencia: number;
  naturezaDeclarante: 'PJ_GERAL' | 'PJ_IMUNE_ISENTA' | 'ORGAO_PUBLICO';
  tipoDeclaracao: 'ORIGINAL' | 'RETIFICADORA';
  numeroReciboAnterior?: string;
  responsavelNome: string;
  responsavelCpf: string;
  responsavelTelefone: string;
  responsavelEmail: string;
  beneficiarios: BeneficiarioDirf[];
  totalBeneficiariosPf: number;
  totalBeneficiariosPj: number;
  totalRendimentosTributaveis: number;
  totalIrrfRetido: number;
  arquivoTxt?: string;
  dataGeracao: string;
}

// -----------------------------------------------------------------
// SPRINT 22: CONTROLE DE EMPRÉSTIMOS, FINANCIAMENTOS E MÚTUOS
// CPC 38 / CPC 48 / IFRS 9 / NBC TG 38 & Lei Federal nº 6.404/76
// -----------------------------------------------------------------
export type TipoOperacaoCredito =
  | 'EMPRESTIMO_BANCARIO'
  | 'FINANCIAMENTO_FINAME'
  | 'CAPITAL_GIRO'
  | 'MUTUO_PARTES_LIGADAS'
  | 'LEASING_FINANCEIRO'
  | 'CHEQUE_ESPECIAL';

export type SistemaAmortizacao = 'PRICE' | 'SAC' | 'BULLET' | 'PERSONALIZADA';

export type StatusContratoCredito = 'ATIVO' | 'LIQUIDADO' | 'RENEGOCIADO' | 'CANCELADO';

export interface ParcelaAmortizacao {
  numeroParcela: number;
  dataVencimento: string; // YYYY-MM-DD
  competencia: string; // YYYY-MM
  valorPrestacao: number;
  amortizacaoPrincipal: number;
  jurosEncargos: number;
  outrasTaxas?: number;
  saldoDevedorFinal: number;
  segregacao: 'CURTO_PRAZO' | 'LONGO_PRAZO'; // CP (<= 12 meses) | LP (> 12 meses)
  status: 'VINCENDA' | 'PAGA' | 'EM_ATRASO';
  dataPagamento?: string;
  valorPago?: number;
  apropriadoContabil: boolean;
}

export interface ContratoFinanciamento {
  id: string;
  empresaId: number;
  numeroContrato: string;
  descricao: string;
  instituicaoFinanceira: string;
  tipoOperacao: TipoOperacaoCredito;
  sistemaAmortizacao: SistemaAmortizacao;
  dataContratacao: string; // YYYY-MM-DD
  dataPrimeiroVencimento: string;
  prazoMeses: number;
  carenciaMeses: number;
  valorContratadoPrincipal: number;
  taxaJurosMensal: number; // ex: 1.45%
  taxaJurosAnual: number;
  indexador: 'PREFIXADO' | 'CDI' | 'IPCA' | 'SELIC' | 'TJLP';
  percentualIndexador?: number;
  custoEfetivoTotalCet: number;
  iofFinanciado: number;
  seguroFinanciado: number;
  tacTarifa: number;
  valorLiquidoLiberado: number;
  status: StatusContratoCredito;
  // Contas Contábeis de Amarração
  contaPassivoCurtoPrazoId: number; // ex: 2.1.02.01 (Empréstimos CP)
  contaPassivoLongoPrazoId: number; // ex: 2.2.02.01 (Empréstimos LP)
  contaEncargosApropriarCpId: number; // Redutora CP 2.1.02.99
  contaEncargosApropriarLpId: number; // Redutora LP 2.2.02.99
  contaDespesaJurosId: number; // Resultado 4.1.03.01 (Despesas Financeiras)
  contaBancariaLiberacaoId: number; // Ativo 1.1.01.02 (Banco C/C)
  parcelas: ParcelaAmortizacao[];
  totalAmortizado: number;
  saldoDevedorPrincipal: number;
  saldoCurtoPrazo: number;
  saldoLongoPrazo: number;
  totalJurosAFuturo: number;
  observacoes?: string;
}

// -----------------------------------------------------------------
// SPRINT 22: DIEF / DECLARAÇÃO DE INFORMAÇÕES ECONÔMICO-FISCAIS
// E APURAÇÃO CENTRALIZADA DE ISSQN (LEI COMPLEMENTAR Nº 116/2003)
// -----------------------------------------------------------------
export interface ItemServicoLc116 {
  item: string; // ex: '01.07'
  descricao: string;
  aliquotaPadrao: number; // %
  municipioIncidencia: 'LOCAL_ESTABELECIMENTO' | 'LOCAL_PRESTACAO';
}

export interface RegistroServicoIssqn {
  id: string;
  empresaId: number;
  competencia: string; // YYYY-MM
  tipoOperacao: 'PRESTADO' | 'TOMADO';
  numeroDocumento: string; // NFS-e
  dataEmissao: string;
  participanteCnpjCpf: string;
  participanteNome: string;
  municipioTomador: string;
  municipioPrestador: string;
  codigoMunicipioIbge: string;
  itemLc116: string; // ex: '01.07'
  descricaoServico: string;
  valorServico: number;
  deducoesLegais: number; // materiais, subempreitadas
  baseCalculoIss: number;
  aliquotaIss: number; // % ex: 3.0
  valorIss: number;
  issRetido: boolean;
  regimeTributacao: 'TRIBUTAVEL' | 'ISENTO' | 'IMUNE' | 'SUSPENSO' | 'SIMPLES_NACIONAL';
}

export interface DeclaracaoIssqnDief {
  empresaId: number;
  competencia: string; // YYYY-MM
  tipoDeclaracao: 'ORIGINAL' | 'RETIFICADORA';
  inscricaoMunicipal: string;
  codigoMunicipioIbge: string;
  nomeMunicipio: string;
  servicos: RegistroServicoIssqn[];
  totalServicosPrestados: number;
  totalDeducoesPrestados: number;
  baseCalculoProprio: number;
  issProprioDevido: number;
  totalServicosTomados: number;
  baseCalculoRetido: number;
  issRetidoDevido: number;
  compensacoesCredito: number;
  totalIssRecolher: number;
  codigoBarrasGuiaDam: string;
  dataVencimentoDam: string;
  arquivoDiefTxt?: string;
  arquivoDmsJson?: string;
  dataGeracao: string;
}

// -----------------------------------------------------------------
// SPRINT 23: CENTRAL DE AUDITORIA CRUZADA E MALHA FINA ELETRÔNICA RFB
// Cruzamento de EFD x DIRF x DCTFWeb x eSocial x ECF x Contábil
// -----------------------------------------------------------------
export type NivelRiscoAuditoria = 'CONCILIADO' | 'ALERTA_LEVE' | 'MALHA_FINA_ALTO_RISCO';

export interface ItemRegraAuditoriaCruzada {
  id: string;
  codigoRegra: string; // Ex: 'AUD-RFB-01'
  titulo: string;
  descricao?: string;
  obrigacoesEnvolvidas: string[];
  valorOrigemA: number;
  rotuloOrigemA: string;
  valorOrigemB: number;
  rotuloOrigemB: string;
  diferenca: number;
  percentualDiferenca: number;
  nivelRisco: NivelRiscoAuditoria;
  fundamentoLegal: string;
  recomendacao: string;
}

export interface LaudoAuditoriaMalhaFina {
  empresaId: number;
  anoExercicio: number;
  competencia: string;
  scoreConformidade: number; // 0 a 100
  statusGeral: 'APROVADO_SEM_RESSALVAS' | 'APROVADO_COM_APONTAMENTOS' | 'RETENCAO_EM_MALHA_IMINENTE';
  totalRegrasAnalisadas: number;
  totalConformes: number;
  totalAlertas: number;
  totalRiscoAlto: number;
  itens: ItemRegraAuditoriaCruzada[];
  dataAuditoria: string;
  auditorResponsavel: string;
}

// -----------------------------------------------------------------
// SPRINT 23: DEFIS (DECLARAÇÃO DE INFORMAÇÕES SOCIOECONÔMICAS E FISCAIS)
// Resolução CGSN nº 140/2018 e Art. 66 a 72 da LC nº 123/2006
// -----------------------------------------------------------------
export interface DadosSocioDefis {
  cpf: string;
  nome: string;
  percentualCapital: number;
  rendimentoIsentoDistribuido: number; // Lucro Efetivo Isento
  rendimentoTributavelProLabore: number;
  impostoRetido: number;
}

export interface DeclaracaoDefis {
  empresaId: number;
  anoCalendario: number;
  anoExercicio: number;
  tipoDeclaracao: 'ORIGINAL' | 'RETIFICADORA';
  numeroReciboAnterior?: string;
  estoqueInicial: number;
  estoqueFinal: number;
  saldoCaixaBancosInicial: number;
  saldoCaixaBancosFinal: number;
  totalAquisicaoMercadorias: number;
  totalDespesasOperacionais: number;
  totalEntradas: number;
  totalDespesas: number;
  lucroContabilApurado: number;
  totalRendimentosDistribuidos: number;
  numeroEmpregadosInicio: number;
  numeroEmpregadosFim: number;
  socios: DadosSocioDefis[];
  declaracaoEntregue: boolean;
  dataGeracao: string;
  termoResponsabilidade: string;
}

// -----------------------------------------------------------------
// SPRINT 23: LIVRO CAIXA DIGITAL & APURAÇÃO DE CARNÊ-LEÃO
// Instrução Normativa RFB nº 1.500/2014 & Lei Federal nº 7.713/1988
// -----------------------------------------------------------------
export type TipoLancamentoCarneLeao = 'RECEITA' | 'DESPESA_CUSTEIO';

export interface LancamentoLivroCaixaCarneLeao {
  id: string;
  empresaId: number;
  data: string; // YYYY-MM-DD
  competencia: string; // YYYY-MM
  tipo: TipoLancamentoCarneLeao;
  categoria:
    | 'TRABALHO_NAO_ASSALARIADO'
    | 'ALUGUEL_RECEBIDO'
    | 'EXTERIOR'
    | 'ALUGUEL_CONSULTORIO'
    | 'ENERGIA_AGUA_TELEFONE'
    | 'MATERIAL_CONSUMO'
    | 'SALARIOS_ENCARGOS_SECRETARIA'
    | 'CONSELHO_CLASSE_ANUIDADE'
    | 'OUTRAS_DESPESAS_CUSTEIO';
  numeroDocumento: string;
  historico: string;
  valor: number;
  dedutivel: boolean;
  cpfBeneficiarioOuPagador?: string;
}

export interface ApuracaoMensalCarneLeao {
  id: string;
  empresaId: number;
  competencia: string; // YYYY-MM
  anoCalendario: number;
  totalRendimentosTributaveis: number;
  totalDespesasCusteioDedutiveis: number;
  excessoDeducoesMesAnterior: number;
  deducaoLivroCaixaEfetiva: number;
  excessoDeducoesParaMesSeguinte: number;
  previdenciaOficialAutonomo: number;
  dependentesQuantidade: number;
  valorDeducaoDependentes: number;
  pensaoAlimenticia: number;
  baseCalculoImposto: number;
  aliquotaEfetiva: number;
  parcelaDeduzirTabela: number;
  irrfDevido: number;
  irrfRetidoNaFonteCompensavel: number;
  darfRecolher: number;
  codigoReceitaDarf: '0190';
  codigoBarrasDarf: string;
  dataVencimento: string;
  statusPagamento: 'PENDENTE' | 'PAGO';
  dataGeracao: string;
}

// =================================================================
// SPRINT 24: ECAC & CAIXA POSTAL FISCAL ELETRÔNICA (DTE & CNDs)
// IN RFB nº 2.066/2022 e Portaria Conjunta RFB/PGFN nº 1.751/2014
// =================================================================
export type TipoMensagemDte =
  | 'INTIMACAO_FISCAL'
  | 'AVISO_COBRANCA'
  | 'MALHA_FISCAL'
  | 'MUDANCA_REGIME'
  | 'COMUNICADO_GERAL';

export type PrioridadeMensagemDte = 'ALTA' | 'MEDIA' | 'BAIXA';
export type StatusMensagemDte = 'NAO_LIDA' | 'LIDA' | 'RESPONDIDA_CONCLUIDA';

export interface MensagemCaixaPostalDte {
  id: string;
  empresaId: number;
  orgaoEmissor: 'RECEITA_FEDERAL' | 'PGFN' | 'SEFAZ_ESTADUAL' | 'PREFEITURA_MUNICIPAL';
  tipo: TipoMensagemDte;
  numeroProcessoOuNotificacao: string;
  assunto: string;
  resumoConteudo: string;
  conteudoIntegralHtml: string;
  dataEnvio: string; // YYYY-MM-DD
  prazoCienciaData: string; // Data limite para ciência
  prazoRespostaData?: string; // Data limite para atendimento
  status: StatusMensagemDte;
  prioridade: PrioridadeMensagemDte;
  exigeAtendimento: boolean;
}

export type TipoCertidaoNegativa =
  | 'CND_FEDERAL_PGFN'
  | 'CRF_FGTS'
  | 'CNDT_TRABALHISTA'
  | 'CND_ESTADUAL_ICMS'
  | 'CND_MUNICIPAL_ISS';

export type StatusCertidao =
  | 'REGULAR_NEGATIVA'
  | 'POSITIVA_COM_EFEITO_DE_NEGATIVA'
  | 'IRREGULAR_POSITIVA'
  | 'EXPIRADA';

export interface CertidaoNegativaDebito {
  id: string;
  empresaId: number;
  tipo: TipoCertidaoNegativa;
  orgaoEmissor: string;
  numeroControle: string;
  dataEmissao: string;
  dataValidade: string;
  status: StatusCertidao;
  diasParaVencer: number;
  observacoes: string;
  urlVerificacaoQrCode?: string;
}

// =================================================================
// SPRINT 24: APURAÇÃO DO FATOR R & SEGREGAÇÃO SIMPLES NACIONAL
// Art. 18, §§ 5º-J, 5º-M da LC nº 123/2006 e Resolução CGSN nº 140/2018
// =================================================================
export interface MesFatorR {
  competencia: string; // YYYY-MM
  receitaBrutaServicosMes: number;
  folhaSalariosMes: number; // Salários + Pró-labore + Encargos
}

export interface ApuracaoFatorR {
  empresaId: number;
  competenciaAtual: string; // YYYY-MM
  rbt12: number; // Receita Bruta Total últimos 12 meses
  fs12: number; // Folha de Salários últimos 12 meses
  fatorRPercentual: number; // (FS12 / RBT12) * 100
  fatorRDecimal: number;
  enquadramentoAnexo: 'ANEXO_III' | 'ANEXO_V';
  aliquotaEfetivaAplicavel: number;
  economiaTributariaEstimada: number;
  historico12Meses: MesFatorR[];
  statusApuracao: 'ENQUADRADO_ANEXO_III_FAVORAVEL' | 'RETIDO_ANEXO_V_ONEROSO';
  dataApuracao: string;
}

// =================================================================
// SPRINT 24: ATIVO INTANGÍVEL & AMORTIZAÇÃO (CPC 04 / NBC TG 04)
// Art. 179 da Lei nº 6.404/1976 e IAS 38
// =================================================================
export type CategoriaIntangivel =
  | 'SOFTWARE_SISTEMAS'
  | 'MARCAS_PATENTES'
  | 'CONCESSOES_DIREITOS'
  | 'GOODWILL_FUNDO_COMERCIO'
  | 'DESENVOLVIMENTO_TECNOLOGICO';

export type TipoVidaUtil = 'DEFINIDA' | 'INDEFINIDA';

export interface BemIntangivel {
  id: string;
  empresaId: number;
  codigoIdentificador: string;
  descricao: string;
  categoria: CategoriaIntangivel;
  tipoVidaUtil: TipoVidaUtil;
  vidaUtilMeses?: number;
  taxaAmortizacaoAnual: number; // em %
  dataAquisicao: string;
  inicioAmortizacao: string;
  custoAquisicao: number;
  valorResidual: number;
  amortizacaoAcumulada: number;
  valorContabilLiquido: number;
  quotaMensalAmortizacao: number;
  contaAtivoIntangivelId: number;
  contaAmortizacaoAcumuladaId: number;
  contaDespesaAmortizacaoId: number;
  status: 'ATIVO' | 'TOTALMENTE_AMORTIZADO' | 'BAIXADO';
  observacoes?: string;
}

// =================================================================
// SPRINT 25: ARRENDAMENTO MERCANTIL / LEASING (CPC 06 (R2) / IFRS 16)
// NBC TG 06 - Ativo Direito de Uso & Passivo de Arrendamento
// =================================================================
export type TipoAtivoLeasing =
  | 'IMOVEIS'
  | 'VEICULOS'
  | 'MAQUINAS_EQUIPAMENTOS'
  | 'TI_SERVIDORES';

export type StatusContratoLeasing = 'ATIVO' | 'ENCERRADO' | 'RESCINDIDO';

export interface ContratoLeasingCPC06 {
  id: string;
  empresaId: number;
  numeroContrato: string;
  arrendador: string;
  descricaoBem: string;
  tipoAtivo: TipoAtivoLeasing;
  dataContrato: string;
  dataInicio: string;
  prazoMeses: number;
  taxaDescontoAnual: number; // Taxa de desconto incremental / WACC (% a.a.)
  valorParcelaMensal: number;
  valorTotalNominal: number;
  valorPresenteInicial: number; // Reconhecimento inicial Ativo Direito de Uso
  saldoDireitoUso: number; // Valor contábil líquido remanescente
  saldoPassivoArrendamento: number; // Passivo total a valor presente
  passivoCirculante: number; // Parcelas vencíveis em até 12 meses
  passivoNaoCirculante: number; // Parcelas vencíveis após 12 meses
  amortizacaoMensalDireitoUso: number;
  jurosApropriarMes: number;
  contaDireitoUsoId: number;
  contaAmortizacaoAcumuladaId: number;
  contaPassivoCirculanteId: number;
  contaPassivoNaoCirculanteId: number;
  contaDespesaJurosId: number;
  contaDespesaAmortizacaoId: number;
  status: StatusContratoLeasing;
  observacoes?: string;
}

// =================================================================
// SPRINT 25: APURAÇÃO DE ICMS-ST, MVA AJUSTADA & GNRE (CONVÊNIO ICMS 142/2018)
// DeSTDA e Ajuste SINIEF
// =================================================================
export type ModalidadeIcmsST = 'MVA_AJUSTADA' | 'PAUTA_FISCAL' | 'PRECO_TABELADO';

export interface ItemCalculoIcmsST {
  id: string;
  empresaId: number;
  descricaoMercadoria: string;
  ncm: string;
  cest: string;
  ufOrigem: string;
  ufDestino: string;
  valorOperacao: number;
  valorFreteSeguroOutros: number;
  valorIpi: number;
  aliquotaInterestadual: number; // em %
  aliquotaInternaDestino: number; // em %
  mvaOriginal: number; // em %
  mvaAjustada: number; // calculada matematicamente em %
  baseCalculoIcmsProprio: number;
  valorIcmsProprio: number;
  baseCalculoIcmsST: number;
  valorIcmsST: number;
  codigoGnre: string; // Ex: '10008-0'
  codigoBarrasGnre?: string;
  dataVencimento: string;
  statusGuia: 'PENDENTE' | 'PAGO' | 'COMPENSADO';
}

export interface ApuracaoMensalIcmsST {
  competencia: string;
  empresaId: number;
  totalOperacoesComST: number;
  totalBaseCalculoST: number;
  totalIcmsProprioDeduzido: number;
  totalIcmsSTDevido: number;
  itens: ItemCalculoIcmsST[];
}

// =================================================================
// SPRINT 25: CONCILIAÇÃO DE CARTÕES & ADQUIRENTES (SPED REGISTRO 1600)
// Cruzamento de Vendas Brutas, Taxa MDR e Créditos Bancários
// =================================================================
export type AdquirenteCartao = 'CIELO' | 'REDE' | 'STONE' | 'PAGSEGURO' | 'GETNET' | 'MERCADO_PAGO';
export type BandeiraCartao = 'VISA' | 'MASTERCARD' | 'ELO' | 'AMEX' | 'HIPERCARD' | 'PIX_POS';
export type TipoTransacaoCartao = 'DEBITO' | 'CREDITO_VISTA' | 'CREDITO_PARCELADO' | 'PIX_MAQUININHA';

export interface OperacaoCartao1600 {
  id: string;
  empresaId: number;
  dataVenda: string;
  dataLiquidacao: string;
  adquirente: AdquirenteCartao;
  bandeira: BandeiraCartao;
  tipoTransacao: TipoTransacaoCartao;
  numeroNsu: string;
  valorBruto: number;
  percentualTaxaMdr: number;
  valorTaxaMdr: number;
  valorLiquido: number;
  statusConciliacao: 'CONCILIADO' | 'DIVERGENTE' | 'PENDENTE';
  integradoContabil: boolean;
}

export interface ResumoCartoes1600 {
  competencia: string;
  empresaId: number;
  totalBrutoVendas: number;
  totalTaxasMdr: number;
  totalLiquidoCreditado: number;
  ticketMedio: number;
  totalOperacoes: number;
  transacoes: OperacaoCartao1600[];
}

// =================================================================
// SPRINT 26: CONTROLE DE SUBVENÇÕES GOVERNAMENTAIS (CPC 07 (R1) / LEIS 12.973/14 & 14.789/23)
// Reserva de Incentivos Fiscais no PL e Crédito Fiscal IRPJ 25%
// =================================================================
export type TipoSubvencao = 
  | 'IMPLANTACAO_EXPANSAO' 
  | 'CUSTEIO_OPERACIONAL' 
  | 'CREDITO_PRESUMIDO_ICMS' 
  | 'DOACAO_TERRENO_PUBLICO' 
  | 'ISENCAO_REDUCAO_TRIBUTARIA';

export type EnquadramentoLegalSubvencao = 
  | 'LEI_12973_ART30' 
  | 'LEI_14789_CREDITO_25' 
  | 'CPC07_SUBVENCAO_RECEITA';

export type StatusSubvencao = 'HABILITADA' | 'EM_ANALISE_RFB' | 'APROVADA_UTILIZADA' | 'GLOSADA';

export interface SubvencaoGovernamental {
  id: string;
  empresaId: number;
  enteConcessor: string; // Ex: 'SEFAZ/GO - Fomentar', 'SUDENE - IRPJ 75%', 'Prefeitura Municipal'
  tipoSubvencao: TipoSubvencao;
  enquadramentoLegal: EnquadramentoLegalSubvencao;
  numeroAtoConcessao: string;
  dataConcessao: string;
  dataHabilitacaoRfb?: string;
  valorTotalSubvencao: number;
  valorApropriadoExercicio: number;
  destinacaoReservaIncentivosPL: number; // D: Lucros Acumulados / C: Reserva de Incentivos Fiscais no PL
  creditoFiscalIscricao25?: number; // 25% IRPJ Lei 14.789/23
  status: StatusSubvencao;
  cumpreRequisitosNaoDistribuicao: boolean; // Vedado distribuir como dividendos
  observacoes?: string;
  integradoContabil: boolean;
}

// =================================================================
// SPRINT 26: CRÉDITO PRESUMIDO DE IPI EXPORTAÇÃO E PIS/COFINS AGRO (LEIS 9.363/96 & 10.925/04)
// Ressarcimento de Insumos e Cadeia Agroindustrial
// =================================================================
export type TipoCreditoPresumido = 
  | 'IPI_RESSARCIMENTO_EXPORTACAO' 
  | 'PIS_COFINS_AGRO_GRAOS' 
  | 'PIS_COFINS_AGRO_LEITE' 
  | 'PIS_COFINS_AGRO_CARNES' 
  | 'PIS_COFINS_AGRO_CAFE';

export type CadeiaProdutivaAgro = 
  | 'SOJA_MILHO' 
  | 'LEITE_DERIVADOS' 
  | 'BOVINOS_SUINOS_AVES' 
  | 'CAFE_EM_GRAO' 
  | 'EXPORTACAO_MANUFATURADOS_GERAL';

export type OrigemAquisicaoInsumo = 
  | 'PRODUTOR_RURAL_PF' 
  | 'COOPERATIVA_RURAL' 
  | 'PJ_SUSPENSAO_ISENCAO' 
  | 'MERCADO_INTERNO_CONVENCIONAL';

export interface ItemCreditoPresumido {
  id: string;
  empresaId: number;
  competencia: string; // YYYY-MM
  tipo: TipoCreditoPresumido;
  cadeia: CadeiaProdutivaAgro;
  origemAquisicao: OrigemAquisicaoInsumo;
  descricaoOperacao: string;
  documentoOrigem: string;
  dataEmissao: string;
  baseCalculoAquisicao: number;
  aliquotaCreditoPresumido: number; // em %
  valorCreditoPresumido: number;
  numeroDcompPedidoRessarcimento?: string;
  statusApropriacao: 'CALCULADO' | 'COMPENSADO_DCOMP' | 'RESSARCIDO_CONTA';
  integradoContabil: boolean;
}

export interface ApuracaoCreditoPresumidoAgroIpi {
  competencia: string;
  empresaId: number;
  totalBaseInsumosAgro: number;
  totalBaseExportacao: number;
  totalCreditoPisApurado: number;
  totalCreditoCofinsApurado: number;
  totalCreditoIpiExportacao: number;
  totalGeralCreditosPresumidos: number;
  itens: ItemCreditoPresumido[];
}

// =================================================================
// SPRINT 26: SIMULADOR DE TRANSIÇÃO DA REFORMA TRIBUTÁRIA 2026 (EC 132/23 & PLP 68/24)
// CBS 0.9%, IBS 0.1%, Split Payment, Crédito Financeiro Amplo & IVA Dual
// =================================================================
export interface CenarioReformaTributaria {
  id: string;
  empresaId: number;
  nomeCenario: string;
  faturamentoMensalEstimado: number;
  percentualInsumosComCredito: number; // % de insumos com crédito financeiro
  valorInsumosBensCapital: number;
  aliquotaCbs2026: number; // padrão 0.9%
  aliquotaIbs2026: number; // padrão 0.1%
  aliquotaPisAtual: number; // 0.65% ou 1.65%
  aliquotaCofinsAtual: number; // 3.00% ou 7.60%
  aliquotaIcmsAtual: number; // 12% a 18%
  aliquotaIssAtual: number; // 2% a 5%
  aliquotaIvaDualDefinitiva: number; // padrão 26.5% (CBS 8.8% + IBS 17.7%)
  aplicaImpostoSeletivo: boolean;
  aliquotaImpostoSeletivo?: number;
  impactoSplitPaymentDias: number; // retenção imediata em D+0 vs prazo tradicional
}

export interface SimulacaoIbsCbs2026 {
  cenarioId: string;
  empresaId: number;
  dataSimulacao: string;
  faturamentoBruto: number;
  // Teste 2026 (CBS 0,9% + IBS 0,1% compensáveis com PIS/COFINS)
  cbsTeste2026: number;
  ibsTeste2026: number;
  totalIvaTeste2026: number;
  compensacaoPisCofins2026: number;
  saldoLiquidoRecolher2026: number;
  // Regime Atual
  totalPisCofinsAtual: number;
  totalIcmsIssAtual: number;
  cargaTributariaAtualTotal: number;
  percentualCargaAtual: number;
  // Regime Definitivo Pós-Transição
  debitoIvaDualPleno: number;
  creditoIvaDualInsumosAtivo: number;
  impostoSeletivoValor: number;
  cargaTributariaNovaTotal: number;
  percentualCargaNova: number;
  diferencaCargaNominal: number; // Carga Nova - Carga Atual
  impactoFluxoCaixaSplitPayment: number;
  parecerOrientativo: string;
}

// =================================================================
// SPRINT 27: AJUSTE A VALOR PRESENTE - AVP (CPC 12 / NBC TG 12 / LEI 11.638/07)
// Mensuração e Desconto de Recebíveis e Fornecedores a Longo Prazo
// =================================================================
export type TipoOperacaoAVP = 'CLIENTES_RECEBER' | 'FORNECEDORES_PAGAR';
export type MetodoCalculoAVP = 'JUROS_EXPONENCIAL' | 'LINEAR_PRO_RATA';
export type StatusContratoAVP = 'ATIVO' | 'APROPRIADO_TOTAL' | 'CANCELADO';

export interface ContratoAVPCpc12 {
  id: string;
  empresaId: number;
  tipoOperacao: TipoOperacaoAVP;
  numeroDocumento: string; // Ex: CTR-VENDA-2026/044 ou NF-e 009.812
  contraparteNome: string;
  contraparteCpfCnpj: string;
  dataOperacao: string; // YYYY-MM-DD
  dataVencimentoFinal: string;
  prazoMeses: number;
  valorNominalFuturo: number; // Valor de Face / Futuro (FV)
  taxaDescontoAnual: number; // em % a.a. (Ex: 11.75% taxa Selic/Mercado)
  taxaDescontoMensal: number; // calculada em % a.m.
  valorPresenteCalculado: number; // PV = FV / (1 + i)^n
  valorAjustePresente: number; // AVP = FV - PV
  valorApropriadoAcumulado: number;
  saldoRemanescenteAVP: number;
  metodo: MetodoCalculoAVP;
  status: StatusContratoAVP;
  contaPatrimonialId: number; // Conta Clientes (Ativo) ou Fornecedores (Passivo)
  contaRedutoraAvpId: number; // (-) AVP Clientes ou (-) AVP Fornecedores
  contaResultadoJurosId: number; // Receitas Financeiras AVP ou Despesas Financeiras AVP
  observacoes?: string;
  integradoContabil: boolean;
}

export interface DemonstrativoMensalAVP {
  competencia: string;
  empresaId: number;
  totalContratosAtivos: number;
  totalNominalFuturo: number;
  totalValorPresente: number;
  totalAvpAcumulado: number;
  totalApropriacaoCompetencia: number;
  contratos: ContratoAVPCpc12[];
}

// =================================================================
// SPRINT 27: AUDITORIA DE ESTOQUES & BLOCO K AVANÇADO (SPED REGISTROS K280 E K220 / ART. 303 RIR)
// Perdas Normais do Processo, Quebras Tributáveis e Reclassificações
// =================================================================
export type TipoMovimentacaoInternaK = 
  | 'K220_RECLASSIFICACAO' 
  | 'K280_CORRECAO_APONTAMENTO' 
  | 'PERDA_PROCESSO_NORMAL' 
  | 'QUEBRA_ANORMAL_EXTRAVIO';

export type MotivoAjusteEstoque = 
  | 'PERDA_EVAPORACAO_NORMAL' 
  | 'QUEBRA_TRANSPORTE' 
  | 'DETERIORACAO_VALIDADE' 
  | 'FURTO_EXTRAVIO' 
  | 'DESMEMBRAMENTO_INSUMO' 
  | 'REEMBALAGEM_PRODUTO' 
  | 'CORRECAO_INVENTARIO';

export interface ItemAjusteBlocoK {
  id: string;
  empresaId: number;
  dataMovimento: string;
  competencia: string; // YYYY-MM
  tipo: TipoMovimentacaoInternaK;
  motivo: MotivoAjusteEstoque;
  produtoOrigemId: number;
  codigoProdutoOrigem: string;
  descricaoProdutoOrigem: string;
  unidadeOrigem: string;
  quantidadeOrigem: number;
  custoUnitarioOrigem: number;
  valorTotalOrigem: number;
  produtoDestinoId?: number;
  codigoProdutoDestino?: string;
  descricaoProdutoDestino?: string;
  unidadeDestino?: string;
  quantidadeDestino?: number;
  exigeEstornoCreditoFiscal: boolean; // Furto/extravio/deterioração requer estorno de ICMS/PIS/COFINS conf Art. 303 RIR
  valorEstornoIcms?: number;
  valorEstornoPisCofins?: number;
  numeroLaudoPericial?: string;
  integradoContabil: boolean;
  observacoes?: string;
}

export interface ResumoBlocoKAvancado {
  competencia: string;
  empresaId: number;
  totalPerdasNormaisCPV: number;
  totalQuebrasAnormaisDRE: number;
  totalReclassificacoesK220: number;
  totalCorrecoesK280: number;
  totalEstornosTributarios: number;
  itens: ItemAjusteBlocoK[];
}

// =================================================================
// SPRINT 27: RETENÇÕES PREVIDENCIÁRIAS NA CONSTRUÇÃO CIVIL (IN RFB 2.110/2022 ART. 112 / LEI 8.212/91)
// Empreitada Global, Dedução de Materiais, CNO e EFD-Reinf R-2010
// =================================================================
export type TipoResponsabilidadeObra = 'EMPREITADA_TOTAL' | 'EMPREITADA_PARCIAL' | 'SUBEMPREITADA';
export type RegimePrevidenciarioObra = 'RETENCAO_11_CONVENCIONAL' | 'RETENCAO_3_5_CPRB_DESONERADA';

export interface RetencaoObraConstrucaoCivil {
  id: string;
  empresaId: number;
  cnoNumero: string; // Cadastro Nacional de Obras
  nomeObra: string;
  tipoResponsabilidade: TipoResponsabilidadeObra;
  regimePrevidenciario: RegimePrevidenciarioObra;
  numeroNotaFiscal: string;
  dataEmissaoNota: string;
  prestadorCnpj: string;
  prestadorRazaoSocial: string;
  valorBrutoNota: number;
  percentualDeducaoMaterial: number; // até 50% legal
  valorDeducaoMaterialEquipamento: number;
  baseCalculoRetencaoINSS: number;
  aliquotaRetencao: number; // 11% ou 3.5%
  valorRetencaoINSS: number;
  valorRetencaoISS: number;
  valorLiquidoPagar: number;
  codigoDarfPrevidenciario: string; // Ex: '1162' ou DCTFWeb
  statusGuia: 'PENDENTE' | 'PAGO' | 'COMPENSADO';
  integradoReinfR2010: boolean;
  integradoContabil: boolean;
  observacoes?: string;
}

export interface ApuracaoRetencoesConstrucao {
  competencia: string;
  empresaId: number;
  totalBrutoObras: number;
  totalDeducoesMateriais: number;
  totalBaseCalculoRetencoes: number;
  totalInssRetido: number;
  totalIssRetido: number;
  totalLiquidoObras: number;
  obras: RetencaoObraConstrucaoCivil[];
}

// =================================================================
// SPRINT 28: TESTE DE RECUPERABILIDADE DE ATIVOS - IMPAIRMENT (CPC 01 R1 / NBC TG 01 / IAS 36)
// Mensuração do Valor Recuperável (Valor Justo Líquido vs Valor em Uso FCD)
// =================================================================
export type TipoAtivoImpairment = 'IMOBILIZADO' | 'INTANGIVEL' | 'GOODWILL' | 'UGC_UNIDADE_GERADORA';
export type MetodoValorRecuperavel = 'VALOR_EM_USO_FCD' | 'VALOR_JUSTO_LIQUIDO_VENDA';
export type StatusTesteImpairment = 'ATIVO' | 'AJUSTADO_PERDA' | 'REVERTIDO';

export interface TesteRecuperabilidadeCpc01 {
  id: string;
  empresaId: number;
  dataTeste: string; // YYYY-MM-DD
  exercicio: number;
  tipoAtivo: TipoAtivoImpairment;
  identificacaoAtivoOuUgc: string; // Ex: 'Linha Fabril de Usinagem CNC' ou 'Goodwill Aquisição Beta'
  valorContabilBruto: number;
  depreciacaoAmortizacaoAcumulada: number;
  valorContabilLiquido: number; // VCL = Bruto - Depreciação
  valorJustoLiquidoVenda: number;
  valorEmUsoFcd: number; // Fluxo de Caixa Descontado
  taxaDescontoWacc: number; // % a.a. (Ex: 13.50%)
  projecaoAnos: number; // Anos de projeção do FCD
  valorRecuperavelApurado: number; // Max(ValorJusto, ValorEmUso)
  perdaImpairmentApurada: number; // Se VCL > ValorRecuperavel: VCL - ValorRecuperavel, senão 0
  perdaReconhecidaAnteriormente: number;
  ajusteProvisaoExercicio: number;
  status: StatusTesteImpairment;
  laudoPericialNumero?: string;
  peritoResponsavel?: string;
  integradoContabil: boolean;
  observacoes?: string;
}

export interface ResumoImpairmentCpc01 {
  exercicio: number;
  empresaId: number;
  totalAtivosTestados: number;
  totalValorContabilLiquido: number;
  totalValorRecuperavel: number;
  totalPerdasReconhecidas: number;
  totalReversoesPermitidas: number;
  testes: TesteRecuperabilidadeCpc01[];
}

// =================================================================
// SPRINT 28: PREÇOS DE TRANSFERÊNCIA - TRANSFER PRICING (LEI 14.596/2023 / IN RFB 2.161/23 - OCDE)
// Princípio Arm's Length, Métodos Transacionais, Ajuste Positivo no LALUR/LACS
// =================================================================
export type MetodoPrecoTransferencia = 
  | 'PIC_PRECO_INDEPENDENTE_COMPARAVEL' 
  | 'PRL_PRECO_REVENDA_MENOS_LUCRO' 
  | 'MCL_CUSTO_MAIS_LUCRO' 
  | 'MLT_MARGEM_LIQUIDA_TRANSACAO' 
  | 'RLP_DIVISAO_LUCRO';

export type TipoOperacaoVinculada = 
  | 'IMPORTACAO_BENS' 
  | 'EXPORTACAO_BENS' 
  | 'SERVICOS_INTANGIVEIS' 
  | 'FINANCEIRO_MUTUO';

export interface OperacaoPrecoTransferencia {
  id: string;
  empresaId: number;
  exercicio: number;
  tipoOperacao: TipoOperacaoVinculada;
  metodoUtilizado: MetodoPrecoTransferencia;
  contraparteVinculadaNome: string;
  paisJurisdicao: string; // Ex: 'Suíça', 'Estados Unidos', 'Ilhas Cayman'
  jurisdicaoTributacaoFavorecida: boolean; // Paraíso Fiscal (IN 1.037/10)
  descricaoItemOuTransacao: string;
  volumeQuantidade: number;
  precoPraticadoUnitario: number;
  valorTotalPraticado: number;
  precoParametroArmLengthUnitario: number;
  valorTotalParametroArmLength: number;
  intervaloInterquartilMin: number;
  intervaloInterquartilMax: number;
  ajustePositivoLalurApurado: number; // Ajuste no LALUR/LACS
  statusApuracao: 'CONFORME_ARMS_LENGTH' | 'AJUSTE_EXIGIDO' | 'HOMOLOGADO_RFB';
  integradoLalur: boolean;
  observacoes?: string;
}

export interface DossieTransferPricing {
  exercicio: number;
  empresaId: number;
  totalOperacoesVinculadas: number;
  totalValorPraticado: number;
  totalValorParametro: number;
  totalAjustePositivoIRPJ: number;
  totalAjustePositivoCSLL: number;
  operacoes: OperacaoPrecoTransferencia[];
}

// =================================================================
// SPRINT 28: CIDE-REMESSAS E TRIBUTAÇÃO DE SERVIÇOS DO EXTERIOR (LEI 10.168/00 / IN RFB 1.455/14)
// Royalties, Serviços Técnicos, IRRF, CIDE 10%, PIS/COFINS-Importação, IOF e TDT
// =================================================================
export type NaturezaRemessaExterior = 
  | 'ROYALTIES_MARCAS_PATENTES' 
  | 'SERVICOS_TECNICOS_ASSISTENCIA' 
  | 'LICENCA_SOFTWARE_SAAS' 
  | 'SERVICOS_ADMINISTRATIVOS_COST_SHARING' 
  | 'JUROS_DIVIDENDOS';

export interface RemessaExteriorTributada {
  id: string;
  empresaId: number;
  dataRemessa: string; // YYYY-MM-DD
  competencia: string; // YYYY-MM
  natureza: NaturezaRemessaExterior;
  beneficiarioNome: string;
  paisDestino: string;
  temTratadoDuplaTributacao: boolean;
  moedaEstrangeira: 'USD' | 'EUR' | 'GBP';
  taxaCambioPtax: number;
  valorMoedaEstrangeira: number;
  valorConvertidoBRL: number;
  aliquotaCide: number; // 10.0%
  valorCide: number;
  aliquotaIrrf: number; // 15.0% ou 25.0%
  valorIrrfFonte: number;
  aliquotaPisImportacao: number; // 1.65%
  valorPisImportacao: number;
  aliquotaCofinsImportacao: number; // 7.60%
  valorCofinsImportacao: number;
  aliquotaIofCambio: number; // 0.38%
  valorIofCambio: number;
  aliquotaIssqnImportacao: number; // 5.0%
  valorIssqnImportacao: number;
  custoTotalTributarioRemessa: number; // Soma de CIDE + IRRF + PIS + COFINS + IOF + ISS
  custoEfetivoTotalOperacao: number; // Remessa + Impostos
  statusDarf: 'PENDENTE' | 'PAGO' | 'COMPENSADO';
  codigoDarfCide: string; // '8741'
  codigoDarfIrrf: string; // '0422'
  integradoContabil: boolean;
  observacoes?: string;
}

export interface ApuracaoRemessasExterior {
  competencia: string;
  empresaId: number;
  totalRemessasBRL: number;
  totalCide: number;
  totalIrrf: number;
  totalPisCofinsImportacao: number;
  totalIofIssqn: number;
  totalCustoTributarioGeral: number;
  remessas: RemessaExteriorTributada[];
}

// ==========================================
// SPRINT 29 - MÓDULO 1: ATIVOS BIOLÓGICOS E PRODUTOS AGRÍCOLAS (CPC 29 / NBC TG 29 / IAS 41)
// ==========================================

export type TipoAtivoBiologico = 'CONSUMIVEL' | 'PRODUCAO_PLANTA_PORTADORA' | 'PRODUTO_AGRICOLA_COLHEITA';
export type CategoriaAtivoBiologico = 'PECUARIA_BOVINA' | 'LAVOURA_TEMPORARIA' | 'FLORESTA_COMERCIAL' | 'CULTURA_PERMANENTE';
export type UnidadeMedidaBiologica = 'CABECAS' | 'HECTARES' | 'TONELADAS' | 'SACAS_60KG' | 'ARROBAS_15KG';
export type EstagioMaturacaoBiologico = 'EM_DESENVOLVIMENTO' | 'PRONTO_PARA_COLHEITA_ABATE' | 'COLHIDO';

export interface AtivoBiologicoCpc29 {
  id: number;
  empresaId: number;
  codigoItem: string;
  descricao: string;
  tipo: TipoAtivoBiologico;
  categoria: CategoriaAtivoBiologico;
  unidadeMedida: UnidadeMedidaBiologica;
  quantidade: number;
  custoHistoricoAquisicao: number;
  cotacaoMercadoUnitario: number;
  despesasEstimadasVendaUnitario: number;
  valorJustoUnitarioLiquido: number; // cotacao - despesas
  valorJustoTotalLiquido: number; // quantidade * valorJustoUnitarioLiquido
  saldoContabilAnterior: number;
  variacaoValorJusto: number; // valorJustoTotalLiquido - saldoContabilAnterior
  dataAvaliacao: string;
  estagioMaturacao: EstagioMaturacaoBiologico;
  integradoContabil: boolean;
  numeroLaudoAvaliacao: string;
  responsavelTecnicoAgronomo: string;
  observacoes?: string;
}

export interface ResumoAtivosBiologicos {
  totalItens: number;
  valorTotalJusto: number;
  totalGanhosValorJusto: number;
  totalPerdasValorJusto: number;
  saldoLiquidoVariacaoDRE: number;
  itens: AtivoBiologicoCpc29[];
}

// ==========================================
// SPRINT 29 - MÓDULO 2: CONTRATOS DE CONSTRUÇÃO E INCORPORAÇÃO IMOBILIÁRIA - MÉTODO POC (CPC 47 / OCPC 01 / LEI 10.931/04)
// ==========================================

export type RegimeTributarioObra = 'RET_AFETACAO_4' | 'LUCRO_PRESUMIDO_OBRA' | 'LUCRO_REAL_OBRA';
export type StatusObraPoc = 'EM_ANDAMENTO' | 'CONCLUIDA' | 'PARALISADA';

export interface ContratoObraPoc {
  id: number;
  empresaId: number;
  codigoEmpreendimento: string;
  nomeEmpreendimento: string;
  matriculaRGI: string;
  cno: string;
  patrimonioAfetacao: boolean;
  regimeTributario: RegimeTributarioObra;
  aliquotaRet: number; // 4.0% RET ou 1.0% MCMV
  dataInicio: string;
  dataPrevisaoTermino: string;
  status: StatusObraPoc;
  custoTotalOrcado: number;
  custoIncorridoAcumulado: number;
  percentualEvolucaoPoc: number; // (custoIncorrido / orcado) * 100
  valorTotalVendasContratadas: number;
  receitaApropriadaAcumulada: number; // (POC % * totalVendas)
  receitaApropriadaPeriodo: number;
  faturamentoEmitidoAcumulado: number;
  saldoAtivoPassivoContrato: number; // receitaApropriada - faturamentoEmitido
  impostoRetApurado: number; // aliquotaRet * faturamento/recebimento
  integradoContabil: boolean;
  engenheiroResponsavelCrea: string;
  observacoes?: string;
}

export interface ResumoConstrucaoPoc {
  totalObras: number;
  custoTotalOrcadoGeral: number;
  custoTotalIncorridoGeral: number;
  mediaPocPonderada: number;
  totalReceitasApropriadas: number;
  totalAtivoContrato: number;
  totalPassivoContrato: number;
  totalTributoRet: number;
  obras: ContratoObraPoc[];
}

// ==========================================
// SPRINT 29 - MÓDULO 3: DEMONSTRAÇÕES CONSOLIDADAS & EQUIVALÊNCIA PATRIMONIAL - MEP (CPC 18 / CPC 36 / IAS 28)
// ==========================================

export type TipoRelacaoSocietaria = 'CONTROLADA_DIRETA' | 'CONTROLADA_INDIRETA' | 'COLIGADA' | 'JOINT_VENTURE';

export interface ParticipacaoSocietariaMep {
  id: number;
  empresaInvestidoraId: number;
  investidaRazaoSocial: string;
  investidaCnpj: string;
  relacao: TipoRelacaoSocietaria;
  percentualParticipacao: number; // ex: 60.0%
  patrimonioLiquidoInvestida: number;
  lucroPrejuizoPeriodoInvestida: number;
  ajustesPlNaoRealizados: number; // lucros não realizados em estoques
  patrimonioLiquidoAjustado: number;
  valorInvestimentoMepTeorico: number; // percentual * patrimonioLiquidoAjustado
  saldoContabilInvestimentoAnterior: number;
  resultadoEquivalenciaPatrimonial: number; // valorTeorico - saldoAnterior
  dividendosRecebidosPeriodo: number;
  dataApuracao: string;
  integradoContabil: boolean;
  observacoes?: string;
}

export interface LinhaConsolidacaoDemonstrativo {
  id: string;
  codigoConta: string;
  descricaoConta: string;
  tipoGrupo: 'ATIVO' | 'PASSIVO' | 'PATRIMONIO_LIQUIDO' | 'RECEITA' | 'CUSTOS_DESPESAS';
  saldoControladora: number;
  saldoControladas: number;
  eliminacoesDebito: number;
  eliminacoesCredito: number;
  saldoConsolidado: number;
  participacaoNaoControladores: number;
}

export interface QuadroConsolidacaoMep {
  dataCompetencia: string;
  empresaInvestidoraId: number;
  totalInvestimentosColigadas: number;
  totalResultadoEquivalencia: number;
  totalEliminacoesIntercompany: number;
  participacoes: ParticipacaoSocietariaMep[];
  balancoConsolidado: LinhaConsolidacaoDemonstrativo[];
}

// ==========================================
// SPRINT 30 - MÓDULO 1: APURAÇÃO DE PIS E COFINS SOBRE RECEITAS FINANCEIRAS (DECRETO 8.426/2015)
// ==========================================

export type TipoReceitaFinanceira =
  | 'JUROS_CAPITAL_PROPRIO'
  | 'RENDIMENTO_APLICACAO_RENDA_FIXA'
  | 'VARIACAO_CAMBIAL_ATIVA'
  | 'DESCONTO_OBTIDO'
  | 'OPERACAO_HEDGE_COBERTURA'
  | 'JUROS_MORA_RECEBIDOS';

export interface ItemReceitaFinanceiraTributada {
  id: number;
  empresaId: number;
  competencia: string; // YYYY-MM
  data: string; // YYYY-MM-DD
  tipo: TipoReceitaFinanceira;
  descricao: string;
  instituicaoFinanceiraOuPagador: string;
  valorBrutoReceita: number;
  temIsencaoAliquotaZero: boolean;
  fundamentacaoIsencao?: string;
  baseCalculoEfetiva: number;
  aliquotaPis: number; // 0.65%
  valorPisApurado: number;
  aliquotaCofins: number; // 4.00%
  valorCofinsApurado: number;
  totalPisCofins: number;
  codigoDarfPis: string; // '6912'
  codigoDarfCofins: string; // '5856'
  integradoContabil: boolean;
  observacoes?: string;
}

export interface ResumoPisCofinsReceitasFinanceiras {
  competencia: string;
  empresaId: number;
  totalReceitasBrutas: number;
  totalReceitasTributaveis: number;
  totalReceitasIsentas: number;
  totalPis: number;
  totalCofins: number;
  totalTributosDevidos: number;
  itens: ItemReceitaFinanceiraTributada[];
}

// ==========================================
// SPRINT 30 - MÓDULO 2: CONTROLE DE COMBUSTÍVEIS MONOFÁSICOS & LMC (LC 192/2022 / CONVÊNIO 15/2023)
// ==========================================

export type TipoCombustivelMonofasico =
  | 'GASOLINA_C'
  | 'OLEO_DIESEL_S10'
  | 'OLEO_DIESEL_S500'
  | 'ETANOL_HIDRATADO'
  | 'GLP_GAS_COZINHA'
  | 'BIODIESEL_B100';

export type UnidadeMedidaCombustivel = 'LITROS' | 'QUILOGRAMAS' | 'METROS_CUBICOS';

export interface ItemMovimentoLmc {
  id: number;
  empresaId: number;
  dataMovimento: string; // YYYY-MM-DD
  numeroTanque: number;
  tipoCombustivel: TipoCombustivelMonofasico;
  unidadeMedida: UnidadeMedidaCombustivel;
  estoqueAbertura: number;
  volumeRecebidoNotasFiscais: number;
  volumeVendidoEncerrantesBicos: number;
  estoqueEscrituralFechamento: number; // Abertura + Entradas - Vendas
  estoqueFisicoMedicaoRegua: number;
  diferencaVolumetricaSobraOuPerda: number; // Fisico - Escritural
  percentualPerda: number;
  toleranciaLegalAtendida: boolean; // ate 0,6% ANP
  aliquotaIcmsAdRemPorLitro: number; // R$ 1,37 Gasolina, R$ 1,06 Diesel (LC 192/22)
  valorIcmsAdRemMonofasico: number;
  cstPisCofinsMonofasico: string; // '04'
  integradoContabil: boolean;
  observacoes?: string;
}

export interface ResumoLmcCombustiveis {
  dataMovimento: string;
  empresaId: number;
  totalVolumeVendidoLitros: number;
  totalPerdasVolumeLitros: number;
  totalIcmsMonofasicoAdRem: number;
  conformidadeAnpGeral: boolean;
  tanques: ItemMovimentoLmc[];
}

// ==========================================
// SPRINT 30 - MÓDULO 3: AUDITORIA DE OBRIGAÇÕES E CRUZAMENTO SPED ECD x ECF x EFD-CONTRIBUIÇÕES
// ==========================================

export type SeveridadeInconsistencia = 'CRITICA_AUTUACAO' | 'ALERTA_MALHA_FINA' | 'INFORMATIVA_CONFORME';
export type ModuloOrigemSped =
  | 'ECD_J100_J150'
  | 'ECF_BLOCO_L_M'
  | 'EFD_CONTRIBUICOES_M210_M610'
  | 'EFD_FISCAL_ICMS_IPI';

export interface RegraCruzamentoSped {
  id: string;
  codigoRegra: string;
  descricaoRegra: string;
  baseLegal: string;
  modulo1: ModuloOrigemSped;
  modulo2: ModuloOrigemSped;
  valorOrigemModulo1: number;
  valorOrigemModulo2: number;
  diferencaApontada: number;
  severidade: SeveridadeInconsistencia;
  status: 'INCONSISTENTE' | 'CONFORME' | 'JUSTIFICADA';
  recomendacaoAcao: string;
}

export interface RelatorioAuditoriaCruzamentoSped {
  dataAuditoria: string;
  exercicio: number;
  empresaId: number;
  totalRegrasAuditadas: number;
  totalInconsistenciasCriticas: number;
  totalAlertas: number;
  totalConformes: number;
  contingenciaTributariaEstimada: number;
  regras: RegraCruzamentoSped[];
}

// ==========================================
// SPRINT 31 - MÓDULO 1: APURAÇÃO DE IPI NO REGIME DE CRÉDITO BÁSICO & RESSARCIMENTO (RIPI / DECRETO 7.212/2010 / IN RFB 2.055/2021)
// ==========================================

export type TipoInsumoIpi = 'MATERIA_PRIMA' | 'PRODUTO_INTERMEDIARIO' | 'MATERIAL_EMBALAGEM';
export type PeriodoApuracaoIpi = 'DECENDIAL' | 'MENSAL';

export interface ItemEntradaCreditoIpi {
  id: string;
  empresaId: number;
  dataEntrada: string; // YYYY-MM-DD
  numeroNotaFiscal: string;
  chaveAcessoNfe: string;
  fornecedorNome: string;
  fornecedorCnpj: string;
  descricaoItem: string;
  ncm: string;
  tipoInsumo: TipoInsumoIpi;
  valorContabilItem: number;
  baseCalculoIpi: number;
  aliquotaIpi: number; // ex: 5%, 10%, 15%
  valorIpiCreditado: number;
  cfopEntrada: string; // ex: '1.101', '2.101'
  cstIpiEntrada: string; // ex: '00' (Entrada com recuperação de crédito)
}

export interface ItemSaidaDebitoIpi {
  id: string;
  empresaId: number;
  dataSaida: string; // YYYY-MM-DD
  numeroNotaFiscal: string;
  clienteNome: string;
  clienteCnpj: string;
  descricaoItem: string;
  ncm: string;
  valorContabilItem: number;
  baseCalculoIpi: number;
  aliquotaIpi: number;
  valorIpiDebitado: number;
  cfopSaida: string; // ex: '5.101', '6.101'
  cstIpiSaida: string; // ex: '50' (Saída tributada)
  isExportacaoImune: boolean; // Se True, saída imune com manutenção de créditos conf. Lei 9.779/99
}

export interface ApuracaoIpiPeriodo {
  id: string;
  empresaId: number;
  periodo: string; // YYYY-MM ou YYYY-MM-D1/D2/D3
  tipoPeriodo: PeriodoApuracaoIpi;
  saldoCredorPeriodoAnterior: number;
  totalCreditosEntradasInsumos: number;
  totalOutrosCreditosAjustes: number;
  totalDebitosSaidasTributadas: number;
  totalEstornosCreditos: number;
  saldoApuradoIpi: number; // Positivo = A Recolher / Negativo = Saldo Credor Acumulado
  statusApuracao: 'DEVEDOR_A_RECOLHER' | 'CREDOR_ACUMULADO' | 'EQUILIBRADO';
  valorGuiaDarfRecolher: number;
  codigoDarfIpi: string; // '1097' (IPI Indústria em Geral)
  dataVencimentoDarf: string;
  pedidoRessarcimentoDcompNumero?: string;
  integradoContabil: boolean;
  entradas: ItemEntradaCreditoIpi[];
  saidas: ItemSaidaDebitoIpi[];
}

export interface ResumoIpiRessarcimento {
  competencia: string;
  empresaId: number;
  totalCreditoInsumos: number;
  totalDebitoVendas: number;
  saldoCredorAcumuladoRessarcivel: number;
  totalExportacoesManutencaoCredito: number;
  periodos: ApuracaoIpiPeriodo[];
}

// ==========================================
// SPRINT 31 - MÓDULO 2: INSTRUMENTOS FINANCEIROS DERIVATIVOS & CONTABILIDADE DE HEDGE (CPC 48 / NBC TG 48 / IFRS 9)
// ==========================================

export type CategoriaHedgeAccounting = 
  | 'HEDGE_VALOR_JUSTO' 
  | 'HEDGE_FLUXO_CAIXA' 
  | 'HEDGE_INVESTIMENTO_LIQUIDO_EXTERIOR';

export type TipoInstrumentoDerivativo = 
  | 'SWAP_CAMBIAL_TAXAS' 
  | 'TERMO_NDF_NON_DELIVERABLE_FORWARD' 
  | 'OPCOES_PUT_CALL' 
  | 'CONTRATOS_FUTUROS_B3';

export type StatusHedge = 'DESIGNADO_ATIVO' | 'ENCERRADO_LIQUIDADO' | 'DESCONTINUADO_INEFETIVO';

export interface ContratoHedgeAccounting {
  id: string;
  empresaId: number;
  codigoDesignacao: string; // ex: 'HDG-2026-001'
  categoria: CategoriaHedgeAccounting;
  tipoDerivativo: TipoInstrumentoDerivativo;
  itemObjetoHedgeDescricao: string; // Ex: 'Receitas de Exportação de Soja 2026/27 (USD 5.000.000)'
  instrumentoHedgeDescricao: string; // Ex: 'NDF Compra USD/BRL Banco Santander Taxa R$ 5,65'
  instituicaoContraparte: string;
  dataDesignacao: string; // YYYY-MM-DD
  dataVencimentoOperacao: string;
  nocionalMoedaEstrangeira: number; // ex: 5000000 USD
  taxaContratadaStrike: number; // ex: 5.65
  valorJustoAtualDerivativo: number; // Ganho ou perda a mercado (MtM)
  valorJustoItemObjetoHedge: number; // Variação do item protegido
  percentualEfetividadeApurada: number; // ex: 98.5% (Tolerância legal: 80% a 125%)
  efetividadeNoIntervaloLegal: boolean; // True se 80% <= Efetividade <= 125%
  parcelaEfetivaReconhecidaPL_DRA: number; // Ajuste de Avaliação Patrimonial (Outros Resultados Abrangentes)
  parcelaInefetivaReconhecidaDRE: number; // Resultado Financeiro Imediato
  status: StatusHedge;
  integradoContabil: boolean;
  observacoes?: string;
}

export interface ResumoHedgeAccounting {
  empresaId: number;
  dataPosicao: string;
  totalNocionalContratadoBRL: number;
  totalValorJustoDerivativos: number;
  totalAlocadoPatrimonioLiquidoDra: number;
  totalInefetividadeDRE: number;
  todasOperacoesEfetivas: boolean;
  contratos: ContratoHedgeAccounting[];
}

// ==========================================
// SPRINT 31 - MÓDULO 3: CONTROLE E APURAÇÃO DO RET - REGIME ESPECIAL DE TRIBUTAÇÃO (LEI 10.931/2004 / MCMV 1% E 4%)
// ==========================================

export type ModalidadeRet = 
  | 'RET_GERAL_4_PORCENTO' 
  | 'RET_SOCIAL_MCMV_1_PORCENTO';

export interface EmpreendimentoAfetacaoRet {
  id: string;
  empresaId: number;
  cnpjAfetacaoSpe: string; // CNPJ específico da afetação / filial
  nomeEmpreendimento: string;
  termoAfetacaoCartorioRgi: string; // Matrícula e Registro de Imóveis
  modalidade: ModalidadeRet;
  aliquotaUnificada: number; // 4.0% ou 1.0%
  bancoContaVinculada: string; // Banco e C/C exclusiva do Patrimônio de Afetação
  numeroContaVinculada: string;
  dataAdesaoRetRFB: string;
  status: 'EM_CONSTRUCAO' | 'CONCLUIDO_HABITE_SE' | 'ENCERRADO';
}

export interface ApuracaoMensalRet {
  id: string;
  empresaId: number;
  empreendimentoId: string;
  nomeEmpreendimento: string;
  cnpjAfetacaoSpe: string;
  competencia: string; // YYYY-MM
  dataVencimentoDarf: string; // Dia 20 do mês subsequente
  receitasRecebidasUnidadesConstrucao: number;
  receitasRecebidasUnidadesProntas: number;
  outrasReceitasOperacionais: number;
  baseCalculoEfetivaRet: number;
  aliquotaRet: number; // 4% ou 1%
  valorTotalDarf4095: number;
  rateioTributos: {
    irpj: number; // 1.26% ou 0.31%
    csll: number; // 0.66% ou 0.16%
    pis: number; // 0.37% ou 0.09%
    cofins: number; // 1.71% ou 0.44%
  };
  saldoBancarioContaAfetacao: number;
  conciliacaoBancariaValidada: boolean;
  statusDarf: 'PENDENTE' | 'PAGO' | 'COMPENSADO';
  integradoContabil: boolean;
  observacoes?: string;
}

export interface ResumoRetAfetacao {
  competencia: string;
  empresaId: number;
  totalReceitaArrecadadaPeriodo: number;
  totalTributosRetDevidos: number;
  totalObrasAfetadas: number;
  apuracoes: ApuracaoMensalRet[];
  empreendimentos: EmpreendimentoAfetacaoRet[];
}

// ==========================================
// SPRINT 32 - MÓDULO 1: CONTABILIDADE DE COOPERATIVAS E DISTRIBUIÇÃO DE SOBRAS / PERDAS (LEI 5.764/71 / ITG 2004)
// ==========================================

export type TipoAtoCooperativo = 'ATO_COOPERATIVO' | 'ATO_NAO_COOPERATIVO';

export interface CooperadoAssociado {
  id: string;
  matriculaCooperado: string;
  nome: string;
  cpfCnpj: string;
  quotaParteCapital: number;
  volumeOperacoesExercicio: number; // Valor transacionado no ano
  percentualParticipacaoOperacoes: number; // % do total operado
  valorSobrasDistribuidas: number; // Proporcional
}

export interface ApuracaoSobrasCooperativa {
  id: string;
  empresaId: number;
  exercicio: number; // ex: 2026
  dataApuracao: string;
  receitaAtosCooperados: number; // Isento IRPJ/CSLL
  despesasAtosCooperados: number;
  sobraBrutaCooperada: number;
  receitaAtosNaoCooperados: number; // Tributado
  despesasAtosNaoCooperados: number;
  resultadoNaoCooperado: number;
  baseCalculoIrpjCsllNaoCooperado: number;
  irpjDevidoNaoCooperado: number; // 15% + 10%
  csllDevidaNaoCooperado: number; // 9%
  sobraLiquidaExercicioAposTributos: number;
  percentualFundoReserva: number; // Mínimo 10% (Art. 28, I, Lei 5.764/71)
  valorFundoReserva: number;
  percentualFates: number; // Mínimo 5% Fundo Assist. Técnica Educacional (Art. 28, II)
  valorFates: number;
  outrasDestinacoesEstatutarias: number;
  sobrasLiquidasDisponiveisAgo: number; // Rateio aos cooperados
  status: 'EM_APURACAO' | 'APROVADO_AGO' | 'HOMOLOGADO_CONTABIL';
  integradoContabil: boolean;
  cooperados: CooperadoAssociado[];
  observacoes?: string;
}

export interface ResumoCooperativa {
  exercicio: number;
  empresaId: number;
  totalAtosCooperadosReceita: number;
  totalAtosNaoCooperadosReceita: number;
  totalSobrasLiquidas: number;
  totalFundoReserva: number;
  totalFates: number;
  totalSobrasRateadas: number;
  apuracoes: ApuracaoSobrasCooperativa[];
}

// ==========================================
// SPRINT 32 - MÓDULO 2: CRÉDITO ACUMULADO DE ICMS (E-CREDAC SP / PORTARIA CAT 26/2010 / RICMS)
// ==========================================

export type HipoteseGeradoraCreditoAcumulado = 
  | 'INCISO_I_ALIQUOTA_DIFERENCIADA' // Saída interestadual 4%/7%/12% c/ entrada 18%
  | 'INCISO_II_REDUCAO_BASE_CALCULO' // Redução BC com manutenção de crédito
  | 'INCISO_III_SAIDAS_IMUNES_EXPORTACAO'; // Exportação com manutenção integral (LC 87/96)

export interface ItemGeradorCreditoAcumulado {
  id: string;
  empresaId: number;
  competencia: string; // YYYY-MM
  numeroNfe: string;
  chaveNfe: string;
  dataEmissao: string;
  clienteDestinatario: string;
  ufDestino: string;
  cfop: string;
  hipoteseGeradora: HipoteseGeradoraCreditoAcumulado;
  valorOperacao: number;
  baseCalculoIcms: number;
  aliquotaIcmsSaida: number;
  debitoIcmsSaida: number;
  custoInsumosEntradaEquivalente: number;
  aliquotaMediaEntrada: number; // ex: 18%
  creditoEntradaEquivalente: number;
  creditoAcumuladoGerado: number; // Max(0, Entrada - Saída)
  statusHomologacaoSefaz: 'GERADO_ESCRITURAL' | 'SUBMETIDO_ECREDAC' | 'HOMOLOGADO_SEFAZ' | 'UTILIZADO_TRANSFERIDO';
  numeroProtocoloSefaz?: string;
}

export interface ResumoCreditoAcumuladoIcms {
  competencia: string;
  empresaId: number;
  totalCreditoAcumuladoGeradoPeriodo: number;
  totalHomologadoSefaz: number;
  totalTransferidoUtilizado: number;
  saldoDisponivelParaApropriacao: number;
  itens: ItemGeradorCreditoAcumulado[];
}

// ==========================================
// SPRINT 32 - MÓDULO 3: GESTÃO E APURAÇÃO DE GANHO DE CAPITAL NA ALIENAÇÃO DE BENS DO ATIVO PERMANENTE (IN RFB 1.500/14 / LEI 13.259/16)
// ==========================================

export type TipoBemAtivoPermanente = 
  | 'IMOVEL_TERRENO_EDIFICACAO'
  | 'MAQUINAS_EQUIPAMENTOS_FABRIS'
  | 'VEICULOS_TRANSPORTE'
  | 'PARTICIPACOES_SOCIETARIAS_QUOTAS'
  | 'ATIVO_INTANGIVEL_MARCAS_PATENTES';

export interface ItemAlienacaoGanhoCapital {
  id: string;
  empresaId: number;
  descricaoBem: string;
  tipoBem: TipoBemAtivoPermanente;
  numeroPatrimonialTombo: string;
  dataAquisicao: string;
  dataAlienacao: string;
  valorAquisicaoOriginal: number;
  custoAdicoesBenfeitorias: number;
  depreciacaoAmortizacaoAcumulada: number;
  valorContabilLiquido: number; // (Aquisicao + Benfeitorias - Depreciacao)
  valorAlienacaoVenda: number;
  despesasAlienacaoComissao: number;
  ganhoCapitalLiquidoApurado: number; // Max(0, ValorVenda - Despesas - ValorContabilLiquido)
  enquadramentoTributario: 'LUCRO_REAL' | 'LUCRO_PRESUMIDO' | 'PESSOA_FISICA_EQUIPARADA';
  aliquotaEfetivaGanhoCapital: number; // Progressiva de 15% a 22,5% (Lei 13.259/2016)
  faixaProgressivaDescricao: string;
  valorImpostoDevidoDarf: number;
  codigoReceitaDarf: string; // '4600' (PF) ou '2089' / '2432' (PJ)
  dataVencimentoDarf: string;
  statusDarf: 'PENDENTE' | 'PAGO';
  integradoContabil: boolean;
  observacoes?: string;
}

export interface ResumoGanhoCapitalAlienacao {
  anoExercicio: number;
  empresaId: number;
  totalValorAlienacoes: number;
  totalValorContabilBaixado: number;
  totalGanhoCapitalLiquido: number;
  totalImpostoDevido: number;
  itens: ItemAlienacaoGanhoCapital[];
}

// ==========================================
// SPRINT 33 - MÓDULO 1: REINTEGRA - REGIME ESPECIAL DE REINTEGRAÇÃO DE VALORES TRIBUTÁRIOS (LEI 12.546/2011 / DEC 8.415/2015)
// ==========================================

export type StatusReintegra = 
  | 'APURADO'
  | 'EM_ANALISE' 
  | 'SOLICITADO_PERDCOMP'
  | 'APROVADO_PERDCOMP' 
  | 'RESSARCIDO_CONTA' 
  | 'COMPENSADO'
  | 'COMPENSADO_TRIBUTOS';

export interface ItemExportacaoReintegra {
  id: string;
  empresaId: number;
  numeroDUE?: string; // Declaração Única de Exportação
  numeroDueExportacao?: string;
  chaveAcessoDue?: string;
  dataAverbacaoEmbarque?: string;
  dataAverbacaoExportacao?: string;
  numeroNotaFiscalExportacao?: string;
  numeroNotaFiscal?: string;
  chaveNfe?: string;
  numeroChaveNfeExportacao?: string;
  codigoNcm: string;
  descricaoProdutoManufaturado?: string;
  descricaoMercadoriaManufaturada?: string;
  paisDestino: string;
  valorFobMoedaEstrangeira: number;
  moedaExportacao?: 'USD' | 'EUR' | 'GBP' | 'BRL';
  moedaOperacao?: 'USD' | 'EUR' | 'GBP' | 'BRL';
  taxaCambialPtaxAverbacao?: number;
  taxaCambioPtax?: number;
  valorFobReaisBRL?: number;
  valorFobBRL?: number;
  percentualInsumoImportado: number; // Não pode exceder 40% (Dec 8.415/2015)
  aliquotaReintegraPercentual?: number; // 0.1% a 3.0%
  percentualReintegraAplicado?: number;
  valorCreditoReintegraCalculado?: number;
  valorCreditoReintegraBRL?: number;
  numeroPedidoPerDcomp?: string;
  numeroProcessoPerdcomp?: string;
  naturezaCreditoDcomp?: string;
  statusCredito?: StatusReintegra;
  status?: StatusReintegra;
  integradoContabil: boolean;
  loteContabilId?: number;
  observacoes?: string;
}

export interface ResumoReintegraExportacao {
  anoExercicio?: number;
  empresaId: number;
  competencia?: string;
  totalDues?: number;
  totalFobExportadoPeriodo?: number;
  totalFobExportadoBRL?: number;
  totalCreditoReintegraApurado?: number;
  totalCreditoReintegraBRL?: number;
  totalCreditoCompensado?: number;
  totalCreditoPendenteReceita?: number;
  itens?: ItemExportacaoReintegra[];
  operacoes?: ItemExportacaoReintegra[];
}

// ==========================================
// SPRINT 33 - MÓDULO 2: IOF SOBRE MÚTUOS INTERCOMPANY & OPERAÇÕES DE CRÉDITO (DEC 6.306/2007 - RIOF / LEI 9.779/1999)
// ==========================================

export type TipoTomadorMutuo = 
  | 'PESSOA_JURIDICA_COLIGADA' 
  | 'PESSOA_JURIDICA_CONTROLADA' 
  | 'SOCIO_PESSOA_FISICA' 
  | 'DIRETOR_PESSOA_FISICA';

export type ModalidadeMutuo = 
  | 'VALOR_FIXO_VENCIMENTO_CERTO' 
  | 'CONTA_CORRENTE_ROTATIVO_SALDO_VARIAVEL';

export interface ContratoMutuoIntercompany {
  id: string;
  empresaId: number;
  numeroContrato: string;
  mutuanteCnpjRazao: string;
  mutuarioNomeCnpjCpf: string;
  tipoTomador: TipoTomadorMutuo;
  modalidade: ModalidadeMutuo;
  dataContratoLibera: string;
  dataVencimentoFinal: string;
  prazoDiasTotal: number;
  valorPrincipalMutuo: number;
  taxaJurosPactuadaAno: number; // Ex: 100% CDI ou taxa pré
  aliquotaIofDiaria: number; // 0.0041% (PJ) ou 0.0082% (PF)
  aliquotaIofAdicional: number; // 0.38% flat
  valorIofDiarioTotal: number;
  valorIofAdicionalTotal: number;
  valorTotalIofDevido: number;
  codigoReceitaDarf: string; // '1150' (PJ) ou '7895' (PF)
  dataVencimentoDarf: string; // 3º dia útil do decêndio subsequente
  statusDarf: 'PENDENTE' | 'RECOLHIDO';
  integradoContabil: boolean;
  observacoes?: string;
}

export interface ResumoIofMutuos {
  anoExercicio: number;
  empresaId: number;
  totalPrincipalMutuado: number;
  totalIofAdicional: number;
  totalIofDiario: number;
  totalIofDevidoDarf: number;
  contratos: ContratoMutuoIntercompany[];
}

// ==========================================
// SPRINT 33 - MÓDULO 3: APA (ADVANCE PRICING ARRANGEMENTS) & PREÇOS DE TRANSFERÊNCIA (LEI 14.596/2023 / IN RFB 2.161/2023)
// ==========================================

export type TipoAcordoApa = 
  | 'UNILATERAL_RFB' 
  | 'BILATERAL_MAP_OCDE' 
  | 'MULTILATERAL';

export type StatusApa = 
  | 'SOLICITADO_PROTOCOLO' 
  | 'EM_NEGOCIACAO_RFB' 
  | 'HOMOLOGADO_VIGENTE' 
  | 'REVISAO_SOLICITADA' 
  | 'EXPIRADO';

export interface AcordoPrevioPrecoApa {
  id: string;
  empresaId: number;
  numeroProcessoRFB: string;
  tipoAcordo: TipoAcordoApa;
  paisJurisdicaoVinculada: string;
  entidadeEstrangeiraVinculada: string;
  tipoTransacaoControlada: 'IMPORTACAO_MATERIA_PRIMA' | 'EXPORTACAO_PRODUTOS' | 'ROYALTIES_LICENCA' | 'SERVICOS_INTRAGRUPO';
  metodoEleito: MetodoPrecoTransferencia;
  pllIndicadorRentabilidade: string; // Mark-up custos, Margem Operacional
  intervaloArmLengthMin: number; // %
  intervaloArmLengthMediana: number; // %
  intervaloArmLengthMax: number; // %
  dataInicioVigencia: string;
  dataFimVigencia: string;
  statusApa: StatusApa;
  volumeAnualTransacionadoBRL: number;
  margemPraticadaEfetiva: number;
  necessitaAjusteCompensatorio: boolean;
  valorAjusteCompensatorioBRL: number;
  integradoContabil: boolean;
  observacoes?: string;
}

export interface ResumoApaTransferPricing {
  anoExercicio: number;
  empresaId: number;
  totalAcordosVigentes: number;
  totalVolumeTransacionadoBRL: number;
  totalAjustesCompensatoriosApurados: number;
  acordos: AcordoPrevioPrecoApa[];
}

// ==========================================
// SPRINT 34 - MÓDULO 1: FUNDO DE COMPENSAÇÃO DE BENEFÍCIOS FISCAIS (FCBF / LC 160/2017 / EC 132/2023 / PLP 68/2024)
// ==========================================

export type TipoBeneficioIcmsFcbf = 
  | 'CREDITO_PRESUMIDO_ICMS'
  | 'ISENCAO_ICMS'
  | 'REDUCAO_BASE_CALCULO'
  | 'DIFERIMENTO_COM_DESONERACAO';

export type StatusHabilitacaoFcbf = 
  | 'HABILITADO_CONFAZ'
  | 'SUBMETIDO_COMITE_GESTOR_IBS'
  | 'HOMOLOGADO_DIREITO_CREDITORIO'
  | 'EM_ANALISE_RECEITA_FEDERAL';

export interface HabilitacaoBeneficioFcbf {
  id: string;
  empresaId: number;
  numeroAtoConcessivo: string;
  ufConcessora: string;
  tipoBeneficio: TipoBeneficioIcmsFcbf;
  descricaoIncentivo: string;
  fundamentoLegalEstadual: string;
  registroConfazNumero: string;
  dataInicioVigencia: string;
  dataFimVigenciaPrevista: string;
  valorMedioAnualBeneficioBRL: number;
  statusHabilitacao: StatusHabilitacaoFcbf;
  cronogramaCompensacaoTransitoriedade: {
    ano2029: number; // 90%
    ano2030: number; // 80%
    ano2031: number; // 70%
    ano2032: number; // 60%
  };
  totalEstimadoCompensacaoUniaoBRL: number;
  integradoContabil: boolean;
  observacoes?: string;
}

export interface ResumoFcbfCompensacao {
  anoExercicio: number;
  empresaId: number;
  totalBeneficiosHabilitados: number;
  totalValorAnualBeneficiosBRL: number;
  totalCompensacaoPrevistaPeriodoBRL: number;
  habilitacoes: HabilitacaoBeneficioFcbf[];
}

// ==========================================
// SPRINT 34 - MÓDULO 2: DEPRECIAÇÃO ACELERADA INCENTIVADA (LEI 14.871/2024 / DECRETO 12.175/2024)
// ==========================================

export type CategoriaBemIncentivado = 
  | 'MAQUINAS_FABRIS_PRODUCAO'
  | 'EQUIPAMENTOS_INDUSTRIAIS_AUTOMACAO'
  | 'APARELHOS_INSTRUMENTOS_MEDICAO'
  | 'SISTEMAS_ROBOTICOS_MANUFATURA';

export interface BemDepreciacaoAcelerada {
  id: string;
  empresaId: number;
  numeroPatrimonioTombo: string;
  descricaoBem: string;
  categoria: CategoriaBemIncentivado;
  dataAquisicao: string;
  dataInstalacaoDisponibilizacao: string;
  numeroNotaFiscal: string;
  chaveNfe: string;
  valorAquisicaoOriginal: number;
  vidaUtilSocietariaAnos: number;
  taxaDepreciacaoSocietariaAnual: number;
  depreciacaoSocietariaAcumulada: number;
  depreciacaoFiscalAceleradaAcumulada: number; // 50% ano 1, 50% ano 2
  exclusaoParteALalurPeriodo: number;
  adicaoParteALalurFutura: number;
  saldoParteBContaLalur: number;
  anoInstalacao: number;
  statusDepreciacao: 'EM_DEPRECIACAO_ACELERADA' | 'TOTALMENTE_DEPRECIADO_FISCAL' | 'BAIXADO';
  integradoContabil: boolean;
  observacoes?: string;
}

export interface ResumoDepreciacaoAcelerada {
  anoExercicio: number;
  empresaId: number;
  totalBensHabilitados: number;
  totalCustoAquisicaoBRL: number;
  totalDepreciacaoSocietariaAno: number;
  totalDepreciacaoAceleradaFiscalAno: number;
  totalExclusaoLalurPeriodo: number;
  totalSaldoParteBLalur: number;
  bens: BemDepreciacaoAcelerada[];
}

// ==========================================
// SPRINT 34 - MÓDULO 3: SUBCAPITALIZAÇÃO - THIN CAPITALIZATION RULES (LEI 12.249/2010 / IN RFB 1.154/2011)
// ==========================================

export type TipoJurisdicaoCredora = 
  | 'PESSOA_VINCULADA_REGIME_COMUM'
  | 'PARAISO_FISCAL_OU_REGIME_PRIVILEGIADO';

export interface ContratoSubcapitalizacaoThinCap {
  id: string;
  empresaId: number;
  numeroContratoDivida: string;
  entidadeCredoraExterior: string;
  paisJurisdicaoCredora: string;
  tipoJurisdicao: TipoJurisdicaoCredora;
  percentualParticipacaoSocietariaPL: number;
  valorPatrimonioLiquidoReferenciaBRL: number;
  valorSaldoEndividamentoMedioBRL: number;
  limiteMaximoEndividamentoBRL: number;
  razaoEndividamentoApurada: number;
  ultrapassouLimiteLegal: boolean;
  despesaTotalJurosPeriodoBRL: number;
  jurosDedutiveisBRL: number;
  jurosIndedutiveisAdicaoLalurBRL: number;
  dataCalculo: string;
  integradoContabil: boolean;
  observacoes?: string;
}

export interface ResumoSubcapitalizacaoThinCap {
  anoExercicio: number;
  empresaId: number;
  totalPatrimonioLiquidoEmpresa: number;
  totalEndividamentoExteriorBRL: number;
  totalDespesasJurosExteriorBRL: number;
  totalJurosDedutiveisBRL: number;
  totalJurosIndedutiveisLalurBRL: number;
  conformidadeGeral: boolean;
  contratos: ContratoSubcapitalizacaoThinCap[];
}

// ==========================================
// PROGRAMA MOVER - MOBILIDADE VERDE & INOVAÇÃO (LEI 14.902/2024)
// ==========================================

export type TipoDispendioMover = 
  | 'PESQUISA_DESENVOLVIMENTO'
  | 'ENGENHARIA_AUTOMOTIVA'
  | 'DESCARBONIZACAO_FABRIL'
  | 'INVESTIMENTO_CAPITAL_PRODUCAO';

export type StatusHabilitacaoMover = 
  | 'EM_ANALISE_MDIC'
  | 'HABILITADO_PORTARIA'
  | 'HOMOLOGADO_RECEITA'
  | 'CANCELADO';

export interface ProjetoHabilitadoMover {
  id: string;
  empresaId: number;
  numeroPortariaMdic: string;
  nomeProjeto: string;
  tipoDispendio: TipoDispendioMover;
  status: StatusHabilitacaoMover;
  valorDispendioPrevistoBRL: number;
  percentualCreditoFinanceiro: number; // ex: 50% a 320% conforme o grau de nacionalização e descarbonização
  valorCreditoApuradoBRL: number;
  valorCompensadoIrpjCsllBRL: number;
  valorSaldoRessarcivelBRL: number;
  dataHabilitacao: string;
  integradoContabil: boolean;
  observacoes?: string;
}

export interface ResumoProgramaMover {
  anoExercicio: number;
  empresaId: number;
  totalProjetosHabilitados: number;
  totalDispendiosQualificadosBRL: number;
  totalCreditosFinanceirosApuradosBRL: number;
  totalCompensadoTributosFederaisBRL: number;
  saldoDisponivelRessarcimentoBRL: number;
  projetos: ProjetoHabilitadoMover[];
}

// ==========================================
// JUROS SOBRE O CAPITAL PRÓPRIO - JCP PÓS-REFORMA (LEI 14.789/2023)
// ==========================================

export type FormaPagamentoJcp = 
  | 'CREDITADO_EM_CONTA'
  | 'PAGO_EM_DINHEIRO'
  | 'CAPITALIZADO';

export interface ApuracaoJcpExercicio {
  id: string;
  empresaId: number;
  anoExercicio: number;
  dataDeliberacao: string;
  formaPagamento: FormaPagamentoJcp;
  // Base do PL e Exclusões da Lei 14.789/23
  patrimonioLiquidoContabilBRL: number;
  reservasIncentivosFiscaisExcluidasBRL: number;
  avpSubvencoesExcluidasBRL: number;
  plAjustadoCalculoTJLP_BRL: number;
  taxaTJLP_Anual: number; // ex: 6.85% a.a.
  valorLimiteTjlpPL_BRL: number;
  // Duplo Limite Legal de Dedutibilidade (§ 1º Art. 9º Lei 9.249/95)
  lucroLiquidoAntesJcpBRL: number;
  limite50PorcentoLucroLiquidoBRL: number;
  reservasLucrosAcumuladasBRL: number;
  limite50PorcentoReservasBRL: number;
  // Deliberação e Retenção IRRF
  valorJcpDeliberadoBRL: number;
  aliquotaIrrfFonte: number; // 15% regra geral
  valorIrrfFonteRetidoBRL: number;
  valorJcpLiquidoBeneficiariosBRL: number;
  parcelaDedutivelExclusaoLalurBRL: number;
  parcelaIndedutivelBRL: number;
  integradoContabil: boolean;
  observacoes?: string;
}

export interface ResumoJcpPeriodo {
  anoExercicio: number;
  empresaId: number;
  totalJcpDeliberadoBRL: number;
  totalIrrfFonteRetidoBRL: number;
  totalJcpLiquidoBRL: number;
  totalExclusaoParteALalurBRL: number;
  totalIndedutivelBRL: number;
  apuracoes: ApuracaoJcpExercicio[];
}

// ==========================================
// CÉDULA DE PRODUTO RURAL - CPR & HEDGE AGRO (LEI 13.986/2020 / CPC 48)
// ==========================================

export type TipoCpr = 'CPR_FINANCEIRA' | 'CPR_FISICA';

export type ModalidadeHedgeAgro = 
  | 'BARTER_INSUMOS'
  | 'SWAP_COMMODITY'
  | 'TERMO_FUTURO'
  | 'CUSTODIA_SIMPLES';

export type StatusCpr = 
  | 'EMITIDA'
  | 'REGISTRADA_B3'
  | 'LIQUIDADA'
  | 'EM_DEFAULT';

export interface TituloCprAgro {
  id: string;
  empresaId: number;
  numeroCpr: string;
  tipoCpr: TipoCpr;
  emitenteProdutorOuCooperativa: string;
  cpfCnpjEmitente: string;
  commodityAgricola: string; // Soja, Milho, Algodão, Café, Boi Gordo
  quantidadeUnidade: number; // Sacas, Arrobas, Toneladas
  unidadeMedida: string;
  valorNominalEmissaoBRL: number;
  taxaJurosAnual: number;
  dataEmissao: string;
  dataVencimento: string;
  cotacaoMercadoAtual: number; // B3 / CEPEA
  valorJustoMtM_BRL: number; // Mark-to-Market CPC 48
  variacaoMtM_PeriodoBRL: number;
  modalidadeHedge: ModalidadeHedgeAgro;
  statusCpr: StatusCpr;
  registradoB3: boolean;
  codigoRegistroB3?: string;
  integradoContabil: boolean;
  observacoes?: string;
}

export interface ResumoCprAgro {
  anoExercicio: number;
  empresaId: number;
  totalTitulosCustodia: number;
  valorTotalNominalBRL: number;
  valorTotalJustoMtM_BRL: number;
  variacaoTotalMtM_BRL: number;
  titulos: TituloCprAgro[];
}

// ==========================================
// REIDI - REGIME ESPECIAL DE INCENTIVOS PARA O DESENVOLVIMENTO DA INFRAESTRUTURA (LEI 11.488/2007 / DEC. 6.144/2007)
// ==========================================

export type SetorProjetoReidi = 
  | 'TRANSPORTES'
  | 'ENERGIA'
  | 'SANEAMENTO_BASICO'
  | 'PORTOS'
  | 'TELECOMUNICACOES'
  | 'IRRIGACAO';

export type StatusHabilitacaoReidi = 
  | 'EM_ANALISE'
  | 'HABILITADO'
  | 'CO_HABILITADO'
  | 'CONCLUIDO'
  | 'CANCELADO';

export interface ProjetoHabilitadoReidi {
  id: string;
  empresaId: number;
  numeroAtoDeclaratorioExecutivo: string; // ADE publicado no DOU pela RFB
  portariaMinisterial: string; // Portaria do Ministério Setorial (MME, MT, MCID, etc.)
  nomeProjeto: string;
  setor: SetorProjetoReidi;
  dataHabilitacao: string;
  previsaoTermino: string;
  status: StatusHabilitacaoReidi;
  valorTotalEstimadoObraBRL: number;
  aquisicoesComSuspensaoPisCofinsBRL: number;
  aliquotaSuspensaoPisPercentual: number; // 1.65%
  aliquotaSuspensaoCofinsPercentual: number; // 7.60%
  economiaFiscalTotalBRL: number; // 9.25% sobre aquisições elegíveis
  notasFiscaisVinculadasCount: number;
  integradoContabil: boolean;
  observacoes?: string;
}

export interface ResumoReidi {
  anoExercicio: number;
  empresaId: number;
  totalProjetos: number;
  totalAquisicoesSuspensaoBRL: number;
  totalEconomiaFiscalBRL: number;
  projetos: ProjetoHabilitadoReidi[];
}

// ==========================================
// PREJUÍZOS FISCAIS & BASE NEGATIVA DE CSLL - TRAVA DE 30% E PARTE B (RIR/2018 / LEI 9.065/95)
// ==========================================

export type TipoPrejuizoFiscal = 'OPERACIONAL' | 'NAO_OPERACIONAL';
export type OrigemPrejuizo = 'PROPRIO' | 'INCORPORACAO' | 'FUSAO' | 'CISAO';

export interface LancamentoParteBPrejuizo {
  id: string;
  empresaId: number;
  exercicioOrigem: number;
  tipo: TipoPrejuizoFiscal;
  origem: OrigemPrejuizo;
  saldoInicialPrejuizoIrpjBRL: number;
  saldoInicialBaseNegativaCsllBRL: number;
  compensadoExercicioIrpjBRL: number;
  compensadoExercicioCsllBRL: number;
  saldoRemanescenteIrpjBRL: number;
  saldoRemanescenteCsllBRL: number;
  codigoContaParteB: string; // Ex: 'LALUR-B-PF-2024'
  limiteTrava30Aplicado: boolean;
  integradoContabil: boolean;
  observacoes?: string;
}

export interface ResumoPrejuizosFiscais {
  anoExercicio: number;
  empresaId: number;
  lucroRealAntesCompensacaoBRL: number;
  resultadoCsllAntesCompensacaoBRL: number;
  tetoCompensacao30IrpjBRL: number; // 30% do Lucro Real
  tetoCompensacao30CsllBRL: number; // 30% da Base CSLL
  totalCompensadoPeriodoIrpjBRL: number;
  totalCompensadoPeriodoCsllBRL: number;
  saldoAcumuladoDisponivelIrpjBRL: number;
  saldoAcumuladoDisponivelCsllBRL: number;
  economiaTributariaPeriodoBRL: number; // IRPJ 25% + CSLL 9% economizados
  lancamentos: LancamentoParteBPrejuizo[];
}

// ==========================================
// CRÉDITOS DE DESCARBONIZAÇÃO DO RENOVABIO - CBIOS (LEI 13.576/2017 / DEC. 9.888/2019 / OCPC 08)
// ==========================================

export type TipoBiocombustivelCbio = 
  | 'ETANOL_ANIDRO'
  | 'ETANOL_HIDRATADO'
  | 'BIODIESEL'
  | 'BIOMETANO'
  | 'AVGU';

export type StatusCbio = 
  | 'CUSTODIA'
  | 'BLOQUEADO_APOSENTADORIA'
  | 'APOSENTADO'
  | 'NEGOCIADO_B3';

export interface TituloCbio {
  id: string;
  empresaId: number;
  numeroLastroAnp: string; // Certificado de Lastro ANP
  tipoBiocombustivel: TipoBiocombustivelCbio;
  quantidadeCbios: number; // 1 CBIO = 1 t CO2e abatido
  dataEmissao: string;
  dataNegociacao?: string;
  custoAquisicaoUnitarioBRL: number;
  cotacaoMercadoB3UnitarioBRL: number;
  valorTotalJustoBRL: number; // Quantidade * Cotação B3
  ganhoMtMAcumuladoBRL: number;
  valorAlienacaoTotalBRL?: number;
  irrf15RetidoB3BRL?: number; // IRRF 15% definitivo Art. 60 Lei 13.986/20
  status: StatusCbio;
  instituicaoCustodiante: string; // B3 S.A.
  integradoContabil: boolean;
  observacoes?: string;
}

export interface ResumoCbiosRenovabio {
  anoExercicio: number;
  empresaId: number;
  totalCbiosCustodia: number;
  totalCbiosAposentados: number;
  valorEstoqueMercadoBRL: number;
  lucroRealizadoPeriodoBRL: number;
  irrfTotalRetidoFonteBRL: number;
  cbios: TituloCbio[];
}

// ==========================================
// SPRINT 37 - MÓDULO 1: DRAWBACK INTEGRADO (SUSPENSÃO E ISENÇÃO) & COMÉRCIO EXTERIOR (PORTARIA SECEX 44/2020 / DEC 6.759/2009 / LEI 11.945/2009)
// ==========================================

export type ModalidadeDrawback = 
  | 'SUSPENSAO' 
  | 'ISENCAO' 
  | 'INTERMEDIARIO';

export type StatusAtoConcessorio = 
  | 'REGISTRADO' 
  | 'EM_VIGOR' 
  | 'COMPROVADO' 
  | 'INADIMPLIDO' 
  | 'PRORROGADO';

export interface AtoConcessorioDrawback {
  id: string;
  empresaId: number;
  numeroAtoConcessorio: string; // Ex: 2026/0014523-1
  modalidade: ModalidadeDrawback;
  dataEmissao: string;
  dataValidade: string;
  prazoProrrogadoAte?: string;
  produtoFinalExportar: string;
  ncmProdutoFinal: string;
  moedaAto: 'USD' | 'EUR' | 'BRL';
  valorPrevistoExportacaoFOB: number;
  valorExportadoComprovadoFOB: number;
  numeroDUEComprovacao?: string;
  chaveDue?: string;
  valorPrevistoImportacaoCIF: number;
  valorImportadoRealizadoCIF: number;
  numeroDeclaracaoImportacaoDI?: string;
  valorInsumosNacionaisAdquiridos: number;
  tributosSuspensosTotais: number; // II + IPI + PIS + COFINS + ICMS
  tributosII: number;
  tributosIPI: number;
  tributosPIS: number;
  tributosCOFINS: number;
  tributosICMS: number;
  percentualComprovacao: number; // FOB exportado / FOB previsto * 100
  statusAto: StatusAtoConcessorio;
  integradoContabil: boolean;
  observacoes?: string;
}

export interface ResumoDrawback {
  anoExercicio: number;
  empresaId: number;
  totalAtosAtivos: number;
  totalExportacaoCompromissadaFOB: number;
  totalExportacaoRealizadaFOB: number;
  totalTributosSuspensosBRL: number;
  totalInsumosImportadosCIF: number;
  totalInsumosNacionais: number;
  atos: AtoConcessorioDrawback[];
}

// ==========================================
// SPRINT 37 - MÓDULO 2: DEBÊNTURES INCENTIVADAS E DE INFRAESTRUTURA (LEI 12.431/2011 / LEI 14.801/2024 / CPC 48)
// ==========================================

export type TipoDebenture = 
  | 'INFRAESTRUTURA_LEI_14801' 
  | 'INCENTIVADA_LEI_12431' 
  | 'PADRAO_NAO_INCENTIVADA';

export type StatusEmissaoDebenture = 
  | 'EM_ANALISE' 
  | 'EMITIDA_ATIVA' 
  | 'RESGATADA' 
  | 'CANCELADA';

export interface TituloDebenture {
  id: string;
  empresaId: number;
  serieNumero: string; // Ex: DEB-2026/01
  tipoDebenture: TipoDebenture;
  descricaoProjetoMinisterio: string; // Ex: Usina Fotovoltaica RenovaSol - Portaria MME 842/2025
  setorPrioritario: string; // Ex: Energia Renovável, Saneamento, Rodovias
  dataEmissao: string;
  dataVencimento: string;
  prazoMeses: number;
  quantidadeTitulos: number;
  valorNominalUnitario: number;
  valorTotalEmissao: number;
  remuneracaoIndexador: string; // IPCA + 6.25% a.a. ou CDI + 1.20% a.a.
  taxaJurosAnual: number;
  custoTransacaoEmissao: number; // CPC 08 apropriado
  despesaJurosPeriodo: number;
  beneficioDeducaoAdicional30Percentual: number; // Lei 14.801/2024: 30% dos juros adicionais deduzidos
  economiaFiscal30IRPJCSLL: number; // 34% (25% IRPJ + 9% CSLL) sobre a dedução adicional
  status: StatusEmissaoDebenture;
  agenteFiduciario: string;
  integradoContabil: boolean;
  observacoes?: string;
}

export interface ResumoDebentures {
  anoExercicio: number;
  empresaId: number;
  totalDebenturesEmitidasBRL: number;
  totalJurosPagosPeriodoBRL: number;
  totalDeducaoAdicionalLei14801BRL: number;
  totalEconomiaTributariaBRL: number;
  debentures: TituloDebenture[];
}

// ==========================================
// SPRINT 37 - MÓDULO 3: INCENTIVOS REGIONAIS DE IRPJ - SUDENE E SUDAM (MP 2.199-14/2001 / LEI 13.799/2018 / IN RFB 2.091/2022)
// ==========================================

export type RegiaoIncentivoRegional = 'SUDENE' | 'SUDAM';

export type ModalidadeProjetoRegional = 
  | 'INSTALACAO_NOVA' 
  | 'DIVERSIFICACAO' 
  | 'MODERNIZACAO_TOTAL' 
  | 'MODERNIZACAO_PARCIAL';

export type StatusLaudoRegional = 
  | 'EM_ANALISE_SUPERINTENDENCIA' 
  | 'LAUDO_EXPEDIDO_VIGENTE' 
  | 'SUSPENSO' 
  | 'EXPIRADO';

export interface ProjetoIncentivadoRegional {
  id: string;
  empresaId: number;
  regiao: RegiaoIncentivoRegional;
  numeroLaudoConstitutivo: string; // Ex: LAUDO-SUDENE-2024-089
  dataExpedicaoLaudo: string;
  prazoVigenciaAnos: number; // 10 anos
  dataLimiteFimBeneficio: string;
  municipioEstadoUnidade: string; // Ex: Cabo de Santo Agostinho - PE
  atividadeIncentivada: string;
  modalidadeProjeto: ModalidadeProjetoRegional;
  percentualReducaoImposto: number; // 75%
  opcaoReinvestimento30Percentual: boolean; // 30% do IRPJ devido
  lucroLiquidoExercicio: number;
  lucroExploracaoApurado: number;
  irpjPadraoDevidoSemBeneficio: number;
  valorReducao75IRPJ: number; // 75% sobre IRPJ do Lucro da Exploração
  irpjEfetivoPagar: number;
  valorDestinadoReservaIncentivosPL: number; // Art. 195-A Lei 6.404/76
  statusLaudo: StatusLaudoRegional;
  integradoContabil: boolean;
  observacoes?: string;
}

export interface ResumoIncentivosRegionais {
  anoExercicio: number;
  empresaId: number;
  regiaoAtiva: string;
  totalLucroExploracaoBRL: number;
  totalReducao75AproveitadaBRL: number;
  totalDestinadoReservaPLBRL: number;
  totalReinvestimentoApuradoBRL: number;
  projetos: ProjetoIncentivadoRegional[];
}

// ==========================================
// SPRINT 38 - MÓDULO 1: SUBVENÇÕES PARA INVESTIMENTO (LEI 14.789/2023 / IN RFB 2.170/2023 / PARECER COSIT 01/2024 / CPC 07)
// ==========================================

export type TipoSubvencaoOrigem = 
  | 'ESTADUAL_ICMS' 
  | 'MUNICIPAL_ISS_IPTU' 
  | 'FEDERAL_UNIAO' 
  | 'OUTROS';

export type StatusHabilitacaoSubvencao = 
  | 'EM_ANALISE_RFB' 
  | 'HABILITADO_DEFERIDO' 
  | 'INDEFERIDO' 
  | 'CANCELADO';

export type FinalidadeSubvencao = 
  | 'IMPLANTACAO_EMPREENDIMENTO' 
  | 'EXPANSAO_EMPREENDIMENTO';

export interface ProjetoSubvencaoInvestimento {
  id: string;
  empresaId: number;
  numeroProcessoHabilitacaoRFB: string; // Ex: 13000.720194/2026-11
  dataProtocoloHabilitacao: string;
  dataDecisaoHabilitacao?: string;
  enteConcessor: string; // Ex: Governo do Estado de Pernambuco (PRODEPE)
  atoConcessaoEnte: string; // Ex: Decreto Estadual nº 54.321/2024
  tipoSubvencao: TipoSubvencaoOrigem;
  finalidade: FinalidadeSubvencao;
  descricaoEmpreendimento: string; // Ex: Implantação de Linha de Montagem de Inversores Solares
  valorTotalInvestimentoImobilizadoBRL: number;
  depreciacaoAmortizacaoComputadaExercicioBRL: number;
  aliquotaCreditoFiscalPercentual: number; // 25% IRPJ (Art. 6º Lei 14.789/2023)
  valorCreditoFiscalApuradoBRL: number; // 25% x Depreciação Computada
  valorCreditoCompensadoPerDcompBRL: number;
  saldoCreditoDisponivelBRL: number;
  statusHabilitacao: StatusHabilitacaoSubvencao;
  integradoContabil: boolean;
  observacoes?: string;
}

export interface ResumoSubvencoesInvestimento {
  anoExercicio: number;
  empresaId: number;
  totalInvestimentoImobilizadoBRL: number;
  totalDepreciacaoElegivelBRL: number;
  totalCreditoFiscalApurado25BRL: number;
  totalCompensadoPerDcompBRL: number;
  saldoCreditoRemanescenteBRL: number;
  projetos: ProjetoSubvencaoInvestimento[];
}

// ==========================================
// SPRINT 38 - MÓDULO 2: CONTRATOS DE CONCESSÃO DE SERVIÇOS PÚBLICOS (ICPC 01 (R1) / IFRIC 12 / NBC TG 01)
// ==========================================

export type ModeloConcessao = 
  | 'ATIVO_FINANCEIRO' 
  | 'ATIVO_INTANGIVEL' 
  | 'BIFURCADO_HIBRIDO';

export type StatusContratoConcessao = 
  | 'FASE_CONSTRUCAO' 
  | 'FASE_OPERACAO' 
  | 'ENCERRADO';

export type SetorConcessao = 
  | 'RODOVIAS_PEDAGIO' 
  | 'SANEAMENTO_BASICO' 
  | 'DISTRIBUICAO_ENERGIA' 
  | 'ILUMINACAO_PUBLICA' 
  | 'PORTOS_AEROPORTOS';

export interface ContratoConcessaoPublica {
  id: string;
  empresaId: number;
  numeroContratoEdital: string; // Ex: CONC-ROD-2024/002
  poderConcedente: string; // Ex: ANTT - Agência Nacional de Transportes Terrestres
  objetoConcessao: string; // Ex: Concessão Rodoviária Rodovia do Sol - Lote 04
  setor: SetorConcessao;
  modelo: ModeloConcessao;
  dataAssinatura: string;
  dataInicioOperacao: string;
  prazoAnos: number;
  dataTerminoConcessao: string;
  taxaInternaRetornoTIR: number; // Ex: 8.75% a.a.
  investimentoTotalCapexEstimadoBRL: number;
  custoConstrucaoIncorridoAcumuladoBRL: number;
  margemLucroConstrucaoPercentual: number; // CPC 47 PoC ex: 10%
  receitaConstrucaoReconhecidaBRL: number;
  saldoAtivoFinanceiroConcessaoBRL: number;
  saldoAtivoIntangivelConcessaoBRL: number;
  receitaOperacaoTarifariaPeriodoBRL: number;
  status: StatusContratoConcessao;
  integradoContabil: boolean;
  observacoes?: string;
}

export interface ResumoConcessoesPublicas {
  anoExercicio: number;
  empresaId: number;
  totalContratosAtivos: number;
  totalCapexCompromissadoBRL: number;
  saldoConsolidadoAtivoFinanceiroBRL: number;
  saldoConsolidadoAtivoIntangivelBRL: number;
  totalReceitaConstrucaoPeriodoBRL: number;
  totalReceitaOperacaoTarifariaBRL: number;
  contratos: ContratoConcessaoPublica[];
}

// ==========================================
// SPRINT 38 - MÓDULO 3: REVISÃO DE VIDAS ÚTEIS & TESTE DE RECUPERABILIDADE (CPC 27 / CPC 01 (R1) / NBC TG 01 / NBC TG 27)
// ==========================================

export type TipoAvaliacaoPatrimonial = 
  | 'REVISAO_VIDA_UTIL_CPC27' 
  | 'IMPAIRMENT_UGC_CPC01';

export type MetodologiaValorRecuperavel = 
  | 'VALOR_EM_USO_FCD' 
  | 'VALOR_JUSTO_LIQUIDO_VENDA';

export type StatusLaudoPatrimonial = 
  | 'EM_ELABORACAO' 
  | 'CONCLUIDO_HOMOLOGADO' 
  | 'APLICADO_CONTABILIDADE';

export interface ItemRevisaoPatrimonial {
  id: string;
  empresaId: number;
  codigoPatrimonialOuUgc: string; // Ex: UGC-FABRICA-01 ou BEM-IMOB-842
  descricaoBemOuUgc: string; // Ex: Linha Robotizada de Solda e Estamparia
  categoriaAtivo: string;
  tipoAvaliacao: TipoAvaliacaoPatrimonial;
  dataAvaliacaoLaudo: string;
  engenheiroPeritoResponsavel: string;
  registroCreaCreci: string;
  valorCustoHistoricoBRL: number;
  depreciacaoAcumuladaAnteriorBRL: number;
  valorContabilLiquidoAtualBRL: number;
  vidaUtilAnteriorAnos: number;
  novaVidaUtilEconomicaRemanescenteAnos: number;
  novoValorResidualEstimadoBRL: number;
  novaTaxaDepreciacaoAnualPercentual: number;
  impactoDepreciacaoAnualFuturaBRL: number; // ajuste prospectivo
  valorRecuperavelApuradoBRL?: number;
  metodologiaValorRecuperavel?: MetodologiaValorRecuperavel;
  taxaDescontoWaccUtilizadaPercentual?: number;
  perdaImpairmentReconhecerBRL: number; // Math.max(0, valorContabil - valorRecuperavel)
  status: StatusLaudoPatrimonial;
  integradoContabil: boolean;
  observacoes?: string;
}

export interface ResumoRevisaoPatrimonial {
  anoExercicio: number;
  empresaId: number;
  totalItensAvaliados: number;
  valorContabilTotalAvaliadosBRL: number;
  ajusteProspectivoDepreciacaoAnualBRL: number;
  totalPerdasImpairmentReconhecidasBRL: number;
  itens: ItemRevisaoPatrimonial[];
}

// ==========================================
// SPRINT 39 - MÓDULO 1: CRÉDITOS DE PIS/COFINS SOBRE IMOBILIZADO (LEI 10.833/03 / BLOCO F120/F130 EFD-CONTRIBUIÇÕES)
// ==========================================

export type MetodoApropriacaoPisCofins = 
  | 'AQUISICAO_48_MESES'       // 1/48 avos sobre valor de aquisição (F120)
  | 'AQUISICAO_24_MESES_MAQ'   // 1/24 avos para máquinas e equipamentos industriais (Lei 11.051/04) (F120)
  | 'DEPRECIACAO_MENSAL_F130';  // Cálculo com base no encargo mensal de depreciação fiscal (F130)

export type StatusCreditoPisCofins = 
  | 'EM_APROPRIACAO' 
  | 'CONCLUIDO' 
  | 'SUSPENSO';

export interface BemCreditoPisCofins {
  id: string;
  empresaId: number;
  codigoBem: string; // Ex: MAQ-IND-0104
  descricaoBem: string; // Ex: Torno CNC Multitask 7 Eixos
  categoriaAtivo: string; // Máquinas, Equipamentos, Edificações
  numeroNotaFiscal: string;
  dataAquisicao: string; // YYYY-MM-DD
  valorAquisicaoBRL: number;
  metodoApropriacao: MetodoApropriacaoPisCofins;
  prazoMesesTotal: number; // 48, 24, etc.
  mesesApropriados: number;
  saldoBaseCreditoRemanescenteBRL: number;
  baseCreditoMensalBRL: number;
  aliquotaPisPercentual: number; // 1.65%
  aliquotaCofinsPercentual: number; // 7.60%
  creditoPisMensalBRL: number;
  creditoCofinsMensalBRL: number;
  creditoTotalMensalBRL: number; // PIS + COFINS (9.25%)
  creditoTotalAcumuladoApropriadoBRL: number;
  status: StatusCreditoPisCofins;
  integradoContabil: boolean;
  observacoes?: string;
}

export interface ResumoCreditoPisCofinsImobilizado {
  anoExercicio: number;
  empresaId: number;
  totalBensEmApropriacao: number;
  valorTotalBaseAquisicaoBRL: number;
  creditoMensalConsolidadoPisBRL: number;
  creditoMensalConsolidadoCofinsBRL: number;
  creditoMensalConsolidadoTotalBRL: number;
  creditoAcumuladoExercicioBRL: number;
  itens: BemCreditoPisCofins[];
}

// ==========================================
// SPRINT 39 - MÓDULO 2: REMUNERAÇÃO BASEADA EM AÇÕES (CPC 10 (R1) / IFRS 2 / TEMA 1.226 STJ)
// ==========================================

export type TipoPlanoAcoes = 
  | 'STOCK_OPTIONS_EQUITY'     // Opções liquidadas em ações (Patrimônio Líquido)
  | 'PHANTOM_SHARES_CASH'      // Ações fantasma liquidadas em dinheiro (Passivo Financeiro)
  | 'RESTRICTED_SHARES_RSU';   // Ações restritas com vesting temporal/performance

export type StatusPlanoAcoes = 
  | 'EM_VESTING' 
  | 'EXERCIDO_LIQUIDADO' 
  | 'CANCELADO_EXPIRADO';

export interface ConcessaoOpcaoAcoes {
  id: string;
  empresaId: number;
  numeroPlanoEdital: string; // Ex: SOP-2024/02
  nomeBeneficiario: string; // Ex: Diretor de Tecnologia / Executivo
  cargoBeneficiario: string;
  tipoPlano: TipoPlanoAcoes;
  dataOutorgaGrantDate: string; // Data da aprovação em AGE/Conselho
  dataInicioVesting: string;
  dataFimVesting: string;
  prazoVestingMeses: number; // Ex: 36 ou 48 meses
  mesesDecorridos: number;
  quantidadeOpcoesOutorgadas: number;
  precoExercicioStrikeBRL: number;
  precoAcaoNaOutorgaSpotBRL: number;
  taxaLivreRiscoSelicPercentual: number; // Ex: 10.75% a.a.
  volatilidadeEsperadaPercentual: number; // Ex: 35.0%
  valorJustoUnitarioBlackScholesBRL: number; // Fair Value por opção
  valorJustoTotalOutorgaBRL: number; // Quantidade * Fair Value Unitário
  despesaApropriadaAcumuladaBRL: number; // Reconhecida no Resultado
  saldoApropriarVestingBRL: number;
  despesaMensalCompetenciaBRL: number;
  status: StatusPlanoAcoes;
  integradoContabil: boolean;
  observacoes?: string;
}

export interface ResumoRemuneracaoAcoes {
  anoExercicio: number;
  empresaId: number;
  totalPlanosAtivos: number;
  totalOpcoesOutorgadas: number;
  valorJustoTotalCompromissadoBRL: number;
  despesaReconhecidaExercicioBRL: number;
  saldoReservaOpcoesPL_BRL: number; // Saldo de opções no Patrimônio Líquido
  concessoes: ConcessaoOpcaoAcoes[];
}

// ==========================================
// SPRINT 39 - MÓDULO 3: BENEFÍCIOS PÓS-EMPREGO & AVALIAÇÃO ATUARIAL (CPC 33 (R1) / IAS 19 / RES. CNPC 32)
// ==========================================

export type ModalidadePlanoPrevidencia = 
  | 'BENEFICIO_DEFINIDO_BD'     // Patrocinador assume risco atuarial e financeiro
  | 'CONTRIBUICAO_VARIAVEL_CV'  // Híbrido com benefício programado
  | 'CONTRIBUICAO_DEFINIDA_CD'; // Risco exclusivo do participante

export type StatusPlanoPrevidencia = 
  | 'ATIVO_SUPERAVITARIO' 
  | 'ATIVO_DEFICITARIO' 
  | 'EM_EQUILIBRIO';

export interface AvaliacaoAtuarialPlano {
  id: string;
  empresaId: number;
  codigoPlanoSusepPrevic: string; // Ex: PREV-PATROC-2024-001
  nomeEntidadeFechadaEFPC: string; // Ex: Fundação de Seguridade Social Multipatrocinada
  modalidade: ModalidadePlanoPrevidencia;
  dataAvaliacaoAtuarial: string;
  atuarioResponsavel: string;
  registroIbaAtuario: string; // Ex: IBA nº 1.482
  obrigacaoAtuarialTotalVBO_BRL: number; // Valor Presente das Obrigações Atuariais (PUCM)
  ativosGarantidoresDoPlanoBRL: number; // Valor Justo dos Ativos Garantidores
  superavitOuDeficitAtuarialLiquidoBRL: number; // Ativos - Obrigações
  taxaDescontoAtuarialNominalPercentual: number; // Ex: 9.80% a.a. (NTN-B)
  taxaInflacaoEsperadaIPCA_Percentual: number; // Ex: 4.0%
  custoServicoCorrenteExercicioBRL: number; // Reconhecido no Resultado
  custoServicoPassadoExercicioBRL: number;
  jurosLiquidosSobrePassivoAtuarialBRL: number;
  ganhosOuPerdasAtuariaisRemensuracaoDRA_BRL: number; // Reconhecido em Outros Resultados Abrangentes no PL
  contribuicaoEfetivaPagaPatrocinadorBRL: number;
  status: StatusPlanoPrevidencia;
  integradoContabil: boolean;
  observacoes?: string;
}

export interface ResumoBeneficiosPosEmprego {
  anoExercicio: number;
  empresaId: number;
  totalPlanosPatrocinados: number;
  obrigacaoAtuarialConsolidadaBRL: number;
  ativosGarantidoresConsolidadosBRL: number;
  deficitOuSuperavitLiquidoConsolidadoBRL: number;
  despesaTotalPrevidenciaExercicioBRL: number;
  planos: AvaliacaoAtuarialPlano[];
}

// ==========================================
// SPRINT 40 - MÓDULO 1: ANÁLISE ECONÔMICO-FINANCEIRA DAS DEMONSTRAÇÕES CONTÁBEIS (NBC TG / CFC / DOMÍNIO CONTÁBIL)
// ==========================================

export type GrupoContaAnalise = 
  | 'ATIVO_CIRCULANTE' 
  | 'ATIVO_NAO_CIRCULANTE' 
  | 'PASSIVO_CIRCULANTE' 
  | 'PASSIVO_NAO_CIRCULANTE' 
  | 'PATRIMONIO_LIQUIDO' 
  | 'RECEITA_BRUTA' 
  | 'DEDUCOES_RECEITA' 
  | 'RECEITA_LIQUIDA'
  | 'CUSTOS' 
  | 'LUCRO_BRUTO'
  | 'DESPESAS_OPERACIONAIS' 
  | 'RESULTADO_OPERACIONAL'
  | 'RESULTADO_FINANCEIRO' 
  | 'IRPJ_CSLL' 
  | 'LUCRO_LIQUIDO';

export interface LinhaAnaliseDemonstracao {
  contaCodigo: string;
  classificacao: string;
  descricao: string;
  grupo: GrupoContaAnalise;
  saldoExercicioAnteriorBRL: number;
  saldoExercicioAtualBRL: number;
  analiseVerticalAnteriorPercentual: number; // % sobre Ativo Total ou Receita Líquida
  analiseVerticalAtualPercentual: number;
  analiseHorizontalPercentual: number; // ((Atual - Anterior) / Anterior) * 100
  variacaoNominalBRL: number; // Atual - Anterior
}

export type ClassificacaoSolvenciaKanitz = 
  | 'EXCELENTE_SOLVENTE' // Z > 0
  | 'PENUMBRA_ALERTA'    // -3 <= Z <= 0
  | 'INSOLVENTE_RISCO';  // Z < -3

export interface IndicesBalancoPatrimonial {
  // Liquidez
  liquidezImediata: number;   // Disponibilidades / Passivo Circulante
  liquidezCorrente: number;   // Ativo Circulante / Passivo Circulante
  liquidezSeca: number;       // (Ativo Circulante - Estoques) / Passivo Circulante
  liquidezGeral: number;      // (Ativo Circulante + RLP) / (Passivo Circulante + ELP)

  // Endividamento & Estrutura de Capital
  endividamentoGeral: number; // (Passivo Circulante + Passivo Não Circulante) / Ativo Total
  composicaoEndividamento: number; // Passivo Circulante / (PC + PNC)
  imobilizacaoPatrimonioLiquido: number; // Ativo Imobilizado / Patrimônio Líquido
  imobilizacaoRecursosNaoCorrentes: number; // Ativo Imobilizado / (PL + PNC)

  // Rentabilidade & Retorno
  margemBruta: number;        // Lucro Bruto / Receita Líquida
  margemOperacional: number;  // Lucro Operacional / Receita Líquida
  margemLiquida: number;      // Lucro Líquido / Receita Líquida
  giroAtivo: number;          // Receita Líquida / Ativo Total
  retornoSobreAtivoROA: number; // Lucro Líquido / Ativo Total
  retornoSobrePatrimonioLiquidoROE: number; // Lucro Líquido / Patrimônio Líquido

  // Modelos Preditivos de Solvência
  termometroKanitz: number;   // Fator de Insolvência Kanitz: 0.05*X1 + 1.65*X2 + 3.55*X3 - 1.06*X4 - 0.33*X5
  altmanZScore: number;       // Z-Score adaptado: 1.2*X1 + 1.4*X2 + 3.3*X3 + 0.6*X4 + 0.999*X5
  classificacaoSolvencia: ClassificacaoSolvenciaKanitz;
}

export interface AnaliseEconomicoFinanceiraCompleta {
  empresaId: number;
  anoExercicioAtual: number;
  anoExercicioAnterior: number;
  balancoLinhas: LinhaAnaliseDemonstracao[];
  dreLinhas: LinhaAnaliseDemonstracao[];
  indices: IndicesBalancoPatrimonial;
  parecerAnalitico: string;
}

// ==========================================
// SPRINT 40 - MÓDULO 2: GESTÃO DE HONORÁRIOS CONTÁBEIS & CONTRATOS (DOMÍNIO HONORÁRIOS / RES. CFC 1.457 / NBC PG 01)
// ==========================================

export type TipoContratoHonorario = 
  | 'MENSAL_FIXO' 
  | 'MENSAL_VARIAVEL_COLABORADORES' 
  | 'MENSAL_VARIAVEL_NOTAS' 
  | 'SERVICO_PONTUAL';

export type IndiceReajusteHonorario = 
  | 'IPCA' 
  | 'IGPM' 
  | 'INPC' 
  | 'SALARIO_MINIMO' 
  | 'FIXO_ACORDADO';

export type StatusContratoHonorario = 
  | 'ATIVO' 
  | 'SUSPENSO' 
  | 'CANCELADO' 
  | 'RESCINDIDO';

export interface ContratoHonorarioContabil {
  id: string;
  empresaId: number; // Empresa Contratante (Cliente da Contabilidade)
  clienteRazaoSocial: string;
  clienteCnpj: string;
  numeroContrato: string; // Ex: HON-2024/042
  tipoContrato: TipoContratoHonorario;
  dataInicio: string;
  dataRenovacao: string;
  valorMensalidadeBaseBRL: number;
  diaVencimentoBoleto: number; // Ex: 10
  indiceReajuste: IndiceReajusteHonorario;
  percentualUltimoReajuste: number;
  dataUltimoReajuste: string;
  servicosInclusos: string[];
  limiteColaboradoresInclusos: number;
  limiteNotasFiscaisInclusas: number;
  tarifaPorColaboradorExcedenteBRL: number;
  tarifaPorNotaExcedenteBRL: number;
  possuiDecimoTerceiroHonorario: boolean;
  status: StatusContratoHonorario;
  observacoes?: string;
}

export type StatusFaturamentoHonorario = 
  | 'PENDENTE' 
  | 'PAGO' 
  | 'VENCIDO' 
  | 'CANCELADO';

export interface FaturamentoHonorarioItem {
  id: string;
  contratoId: string;
  empresaId: number;
  clienteRazaoSocial: string;
  clienteCnpj: string;
  competencia: string; // Ex: '10/2026'
  valorMensalidadeBRL: number;
  valorServicosExtrasBRL: number;
  descricaoServicosExtras?: string;
  valorTotalBRL: number;
  dataVencimento: string;
  nossoNumeroBoleto: string; // Ex: '00018472931'
  linhaDigitavel: string;
  codigoPixCopiaECola: string;
  status: StatusFaturamentoHonorario;
  dataPagamento?: string;
  valorPagoBRL?: number;
  integradoContabil: boolean;
}

export interface ResumoHonorariosContabeis {
  empresaId: number;
  totalContratosAtivos: number;
  receitaMensalRecorrenteMRR_BRL: number;
  totalFaturadoMesBRL: number;
  totalRecebidoMesBRL: number;
  totalInadimplenteBRL: number;
  contratos: ContratoHonorarioContabil[];
  faturamentos: FaturamentoHonorarioItem[];
}

// ==========================================
// SPRINT 40 - MÓDULO 3: SICALC & ACRÉSCIMOS LEGAIS DARF (LEI 9.430/96 ART. 61 / DOMÍNIO SICALCAA)
// ==========================================

export type CodigoReceitaDarf = 
  | '2089'  // IRPJ Lucro Presumido
  | '2372'  // CSLL Lucro Presumido
  | '2432'  // IRPJ Lucro Real Estimativa/Ajuste
  | '6012'  // CSLL Lucro Real Estimativa/Ajuste
  | '5952'  // Retenções CSRF (PIS/COFINS/CSLL 4,65%)
  | '1708'  // Retenção IRRF PJ (1,5%)
  | '0561'  // IRRF Trabalho Assalariado
  | '8109'  // PIS Não-Cumulativo
  | '6106'  // COFINS Não-Cumulativa
  | '1162'; // IPI Indústria

export type StatusCalculoDarf = 'PENDENTE' | 'CALCULADO' | 'PAGO';

export interface CalculoAcrescimosDarf {
  id: string;
  empresaId: number;
  codigoReceita: CodigoReceitaDarf;
  descricaoTributo: string;
  periodoApuracao: string; // Ex: '30/09/2026'
  dataVencimentoOriginal: string; // Ex: '31/10/2026'
  dataPagamentoProjetada: string; // Ex: '15/12/2026'
  valorPrincipalBRL: number;
  diasAtrasoCorridos: number;
  aliquotaMultaMoraPercentual: number; // 0,33% ao dia corrido até 20%
  valorMultaMoraBRL: number;
  taxaSelicAcumuladaPercentual: number; // SELIC acumulada + 1%
  valorJurosMoraBRL: number;
  valorTotalDarfBRL: number; // Principal + Multa + Juros
  numeroReferencia?: string;
  codigoBarrasFebraban: string; // 4 blocos numéricos com DV Módulo 10
  linhaDigitavelFebraban: string;
  qrCodePixPagTesouro: string;
  status: StatusCalculoDarf;
  integradoContabil: boolean;
  observacoes?: string;
}

export interface ResumoSicalcAcrescimos {
  empresaId: number;
  totalGuiasCalculadas: number;
  totalValorPrincipalBRL: number;
  totalMultaMoraBRL: number;
  totalJurosSelicBRL: number;
  totalGeralDarfBRL: number;
  guias: CalculoAcrescimosDarf[];
}




























// ============================================================================
// SPRINT 41: DIOPS ANS, CPRB (DESONERAÇÃO FOLHA) & PIS/COFINS FINANCEIRAS
// ============================================================================

// --- 1. DIOPS ANS (Agência Nacional de Saúde Suplementar - RN 518/2022 e 527/2022) ---
export type ModalidadeOperadoraAns = 
  | 'MEDICINA_GRUPO'
  | 'COOPERATIVA_MEDICA'
  | 'AUTOGESTAO'
  | 'FILANTROPIA'
  | 'ODONTOLOGIA_GRUPO'
  | 'SEGURADORA_SAUDE';

export type PorteOperadoraAns = 'PEQUENO' | 'MEDIO' | 'GRANDE';

export interface ProvisaoTecnicaAns {
  id: string;
  codigoContaAns: string;
  nomeProvisao: string;
  tipo: 'PEONA' | 'PIC' | 'PEONA_SUS' | 'REMISSAO' | 'SINISTROS_A_LIQUIDAR' | 'OUTRAS_PROVISOES';
  valorConstituidoBRL: number;
  valorAtivosGarantidoresBRL: number;
  suficienciaCoberturaBRL: number;
  metodoCalculo: string;
  statusCobertura: 'SUFICIENTE' | 'DEFICITARIO';
}

export interface CapitalBaseadoRiscoAns {
  capitalBaseBRL: number;
  riscoSubscricaoBRL: number;
  riscoCreditoBRL: number;
  riscoMercadoBRL: number;
  riscoOperacionalLegalBRL: number;
  capitalRegulatorioRequeridoBRL: number;
  patrimonioLiquidoAjustadoBRL: number;
  margemSolvenciaPercentual: number;
  situacaoSolvencia: 'ENQUADRADA' | 'DESENQUADRADA';
}

export interface DemonstrativoDiopsAns {
  id: string;
  empresaId: number;
  registroAns: string;
  razaoSocialOperadora: string;
  cnpjOperadora: string;
  modalidade: ModalidadeOperadoraAns;
  porte: PorteOperadoraAns;
  trimestreReferencia: '1T' | '2T' | '3T' | '4T';
  exercicioAno: number;
  dataGeracaoXml: string;
  versaoXsdAns: string;
  hashXmlSha256: string;
  totalContraprestacoesEfetivasBRL: number;
  totalSinistrosEventosIndenizaveisBRL: number;
  sinistralidadePercentual: number;
  provisoesTecnicas: ProvisaoTecnicaAns[];
  totalProvisoesTecnicasBRL: number;
  totalAtivosGarantidoresBRL: number;
  indiceCoberturaProvisoesPercentual: number;
  capitalRisco: CapitalBaseadoRiscoAns;
  statusTransmissaoAns: 'PENDENTE' | 'VALIDADO' | 'TRANSMITIDO_COM_SUCESSO' | 'RECUSADO';
  numeroReciboProtocoloAns?: string;
  integradoContabil: boolean;
  loteContabilId?: number;
  observacoes?: string;
}

export interface ResumoDiopsAns {
  empresaId: number;
  registroAns: string;
  totalDemonstrativos: number;
  ultimoTrimestre: string;
  sinistralidadeMediaPercentual: number;
  totalProvisoesBRL: number;
  totalAtivosGarantidoresBRL: number;
  indiceCoberturaGeralPercentual: number;
  patrimonioLiquidoAjustadoBRL: number;
  capitalRequeridoBRL: number;
  margemSolvenciaPercentual: number;
  demonstrativos: DemonstrativoDiopsAns[];
}

// --- 2. CPRB - Desoneração da Folha de Pagamento & Evento R-2060 EFD-Reinf (Lei 12.546/2011 / Lei 14.973/2024) ---
export type SetorDesoneradoCprb =
  | 'TI_TIC'
  | 'CALL_CENTER'
  | 'TRANSPORTE_RODOVIARIO_PASSAGEIROS'
  | 'CONSTRUCAO_CIVIL_OBRAS'
  | 'TEXTIL_CONFECCAO'
  | 'CALCADOS_COURO'
  | 'OUTROS_SETORES';

export interface AjusteCprbReinf {
  id: string;
  tipoAjuste: 'ACRESCIMO' | 'REDUCAO';
  origemAjuste: '01_ACAO_JUDICIAL' | '02_PROCESSO_ADMINISTRATIVO';
  numeroProcesso: string;
  codigoAjuste: string;
  descricaoAjuste: string;
  valorAjusteBRL: number;
}

export interface ApuracaoCprbCompetencia {
  id: string;
  empresaId: number;
  competencia: string;
  setor: SetorDesoneradoCprb;
  codigoAtividadeReinf: string;
  descricaoAtividade: string;
  aliquotaPercentual: number;
  receitaBrutaTotalBRL: number;
  deducaoExportacoesDiretasBRL: number;
  deducaoVendasCanceladasDescontosBRL: number;
  deducaoIpiIcmsStBRL: number;
  baseCalculoCprbBRL: number;
  valorCprbApuradoBRL: number;
  ajustes: AjusteCprbReinf[];
  totalAjustesAcrescimoBRL: number;
  totalAjustesReducaoBRL: number;
  valorCprbLiquidoRecolherBRL: number;
  codigoReceitaDarf: string;
  dataVencimentoDarf: string;
  codigoBarrasDarfFebraban: string;
  statusApuracao: 'ABERTA' | 'FECHADA' | 'TRANSMITIDA_REINF' | 'INTEGRADA_CONTABIL';
  eventoReinfId?: string;
  reciboReinfProtocolo?: string;
  integradoContabil: boolean;
  loteContabilId?: number;
  observacoes?: string;
}

export interface ResumoCprb {
  empresaId: number;
  totalCompetenciasApuradas: number;
  totalReceitaBrutaBRL: number;
  totalBaseCalculoBRL: number;
  totalCprbRecolherBRL: number;
  apuracoes: ApuracaoCprbCompetencia[];
}

// --- 3. PIS/COFINS Entidades Financeiras & Equiparadas (Lei 9.718/1998 Art. 3º § 6º / Bloco I EFD-Contribuições) ---
export type TipoEntidadeFinanceira =
  | 'BANCO_MULTIPLO_COMERCIAL'
  | 'COOPERATIVA_CREDITO'
  | 'DTVM_CTVM'
  | 'FINANCEIRA_CREDITO_INVESTIMENTO'
  | 'SEGURADORA_CAPITALIZACAO'
  | 'CAMBIO_LEASING';

export interface DeducaoIntermediacaoFinanceira {
  id: string;
  codigoTipoDeducao: string;
  descricaoDeducao: string;
  incideSobre: 'PIS_E_COFINS' | 'PIS_APENAS' | 'COFINS_APENAS';
  valorDeducaoBRL: number;
  dispositivoLegal: string;
}

export interface ApuracaoPisCofinsFinanceiro {
  id: string;
  empresaId: number;
  competencia: string;
  tipoEntidade: TipoEntidadeFinanceira;
  razaoSocial: string;
  cnpj: string;
  receitasIntermediacaoFinanceiraBRL: number;
  receitasPrestacaoServicosTarifasBRL: number;
  receitasPremiosSegurosBRL: number;
  receitasVariacoesMonetariasAtivasBRL: number;
  outrasReceitasOperacionaisBRL: number;
  receitaBrutaTotalFinanceiraBRL: number;
  deducoes: DeducaoIntermediacaoFinanceira[];
  totalDeducoesAutorizadasBRL: number;
  baseCalculoPisBRL: number;
  baseCalculoCofinsBRL: number;
  aliquotaPisPercentual: number;
  aliquotaCofinsPercentual: number;
  valorPisApuradoBRL: number;
  valorCofinsApuradoBRL: number;
  totalPisCofinsDevidoBRL: number;
  registrosBlocoIGerados: {
    i010Identificacao: string;
    totalRegistrosI100: number;
    totalRegistrosI200Deducoes: number;
    totalRegistrosI300Complemento: number;
  };
  codigoReceitaDarfPis: string;
  codigoReceitaDarfCofins: string;
  dataVencimento: string;
  statusApuracao: 'CALCULADO' | 'FECHADO' | 'TRANSMITIDO_EFD' | 'INTEGRADO_CONTABIL';
  integradoContabil: boolean;
  loteContabilId?: number;
  observacoes?: string;
}

export interface ResumoPisCofinsFinanceiro {
  empresaId: number;
  totalCompetenciasApuradas: number;
  totalReceitaFinanceiraBRL: number;
  totalDeducoesCaptacaoBRL: number;
  totalBaseCalculoBRL: number;
  totalPisDevidoBRL: number;
  totalCofinsDevidoBRL: number;
  totalTributosDevidosBRL: number;
  apuracoes: ApuracaoPisCofinsFinanceiro[];
}


// ============================================================================
// SPRINT 42: DECLARAÇÕES ESTADUAIS ICMS, BALANÇO DE ABERTURA & RET IMOBILIÁRIO
// ============================================================================

// --- 1. DECLARAÇÕES ESTADUAIS ICMS (DAPI MG / DIME SC / DIEF CE / DIEF MA) ---
export type UfDeclaracaoIcms = 'MG' | 'SC' | 'CE' | 'MA';
export type TipoDeclaracaoEstadual = 'DAPI_MODELO_1' | 'DIME_SC' | 'DIEF_CE' | 'DIEF_MA';

export interface LinhaValorAdicionadoMunicipio {
  id: string;
  codigoMunicipioIbge: string;
  nomeMunicipio: string;
  valorOperacoesPropriasBRL: number;
  percentualRateio: number;
}

export interface DeclaracaoEstadualIcms {
  id: string;
  empresaId: number;
  tipoDeclaracao: TipoDeclaracaoEstadual;
  uf: UfDeclaracaoIcms;
  competencia: string; // YYYY-MM
  finalidade: '01_NORMAL' | '02_SUBSTITUTIVA';
  // Débitos de ICMS
  totalDebitosSaidasTributadasBRL: number;
  outrosDebitosBRL: number;
  estornosCreditoBRL: number;
  totalDebitosApuradosBRL: number;
  // Créditos de ICMS
  totalCreditosEntradasTributadasBRL: number;
  outrosCreditosBRL: number;
  estornosDebitoBRL: number;
  saldoCredorPeriodoAnteriorBRL: number;
  totalCreditosApuradosBRL: number;
  // Saldo e Deduções
  saldoDevedorApuradoBRL: number;
  saldoCredorTransportarBRL: number;
  deducoesIncentivosBRL: number; // TTD SC / Prodepe / Fundo de Amparo
  valorIcmsEfetivoRecolherBRL: number;
  // Detalhamento Municipal
  distribuicaoMunicipios: LinhaValorAdicionadoMunicipio[];
  // Transmissão & Guia Estadual
  codigoReceitaDae: string; // Ex: '313-1' (MG), '1449' (SC), '1015' (CE)
  dataVencimentoDae: string;
  codigoBarrasDaeFebraban: string;
  statusDeclaracao: 'ABERTA' | 'VALIDADA' | 'TRANSMITIDA' | 'INTEGRADA_CONTABIL';
  numeroReciboProtocolo?: string;
  hashArquivoValidado?: string;
  integradoContabil: boolean;
  loteContabilId?: number;
  observacoes?: string;
}

export interface ResumoDeclaracoesEstaduaisIcms {
  empresaId: number;
  totalDeclaracoes: number;
  totalDebitosGeraisBRL: number;
  totalCreditosGeraisBRL: number;
  totalIcmsRecolherBRL: number;
  declaracoes: DeclaracaoEstadualIcms[];
}

// --- 2. BALANÇO DE ABERTURA (ITG 1000 / NBC TG 1000 / Domínio CTSALDO) ---
export type GrupoContaBalancoAbertura = 
  | 'ATIVO_CIRCULANTE'
  | 'ATIVO_NAO_CIRCULANTE'
  | 'PASSIVO_CIRCULANTE'
  | 'PASSIVO_NAO_CIRCULANTE'
  | 'PATRIMONIO_LIQUIDO';

export interface ItemBalancoAbertura {
  id: string;
  contaContabilId: number;
  classificacaoConta: string;
  nomeConta: string;
  grupo: GrupoContaBalancoAbertura;
  natureza: 'DEVEDORA' | 'CREDORA';
  saldoInicialBRL: number;
  criterioAvaliacao: 'CUSTO_HISTORICO' | 'CUSTO_ATRIBUIDO_VALOR_JUSTO' | 'CONCILIACAO_DOCUMENTAL';
  documentoSuporte: string; // Ex: 'Inventário Físico Estoques', 'Extrato Bancário 31/12', 'Circularização Fornecedores'
  observacoes?: string;
}

export interface BalancoAberturaEmpresa {
  id: string;
  empresaId: number;
  razaoSocial: string;
  cnpj: string;
  dataCorteAbertura: string; // Ex: '2026-01-01'
  normaAdotada: 'ITG_1000_MICRO_EPP' | 'NBC_TG_1000_PME' | 'NBC_TG_COMPLETA';
  motivoAbertura: 'PRIMEIRA_ESCRITURACAO_REGULAR' | 'TRANSICAO_LIVRO_CAIXA' | 'CONVERSAO_SISTEMA_DOMINIO';
  itens: ItemBalancoAbertura[];
  totalAtivoInicialBRL: number;
  totalPassivoExigivelInicialBRL: number;
  patrimonioLiquidoAberturaBRL: number; // totalAtivo - totalPassivo
  diferencaBalanceamentoBRL: number; // Deve ser estritamente zero
  statusBalanco: 'EM_LEVANTAMENTO' | 'CONCILIADO' | 'FECHADO_INTEGRADO';
  termoAberturaTexto: string;
  termoEncerramentoTexto: string;
  contadorNome: string;
  contadorCrc: string;
  representanteLegalNome: string;
  representanteLegalCpf: string;
  dataFechamento?: string;
  loteContabilId?: number;
}

export interface ResumoBalancosAbertura {
  empresaId: number;
  possuiBalancoAberturaFechado: boolean;
  ultimoBalanco?: BalancoAberturaEmpresa;
  balancos: BalancoAberturaEmpresa[];
}

// --- 3. RET IMOBILIÁRIO & SCP (Lei nº 10.931/2004 / IN RFB nº 2.179/2024) ---
export type TipoEmpreendimentoImobiliario =
  | 'INCORPORACAO_IMOBILIARIA_RET'
  | 'LOTEAMENTO_URBANO'
  | 'CONDOMINIO_FECHADO'
  | 'CONSTRUCAO_IMOVEIS_VENDA';

export type NaturezaAfetacaoRet = 'PROPRIO' | 'SCP_SOCIEDADE_CONTA_PARTICIPACAO';

export interface EmpreendimentoImobiliarioRet {
  id: string;
  empresaId: number;
  codigoEmpreendimento: string; // Ex: 'EMP-01'
  nomeEmpreendimento: string;
  tipo: TipoEmpreendimentoImobiliario;
  natureza: NaturezaAfetacaoRet;
  cnpjAfetacaoOuScp?: string; // CNPJ próprio da afetação ou da SCP
  matriculaRgi: string; // Registro no Cartório de Imóveis
  cartorioRegistroImoveis: string;
  aliquotaRetUnificadaPercentual: number; // 4.00% padrão ou 1.00% MCMV
  enquadramentoMcmv: boolean;
  dataInicioObras: string;
  previsaoConclusao: string;
  totalUnidadesPrevistas: number;
  unidadesVendidas: number;
  percentualConclusaoPoc: number;
  // Valores Contábeis e Orçamentários
  custoTotalOrcadoBRL: number;
  custoIncorridoAcumuladoBRL: number;
  receitaTotalContratadaBRL: number;
  receitaRecebidaAcumuladaBRL: number;
  statusObra: 'PLANEJAMENTO' | 'EM_CONSTRUCAO' | 'CONCLUIDO_HABITE_SE';
  observacoes?: string;
}

export interface ApuracaoMensalRetImobiliario {
  id: string;
  empreendimentoId: string;
  empresaId: number;
  competencia: string; // YYYY-MM
  nomeEmpreendimento: string;
  cnpjAfetacaoOuScp: string;
  receitaVendasRecebidasMesBRL: number; // Base de cálculo do RET
  aliquotaRetPercentual: number; // 4.00 ou 1.00
  // Decomposição dos Tributos Unificados
  valorIrpjRetBRL: number; // 1.26% (ou 0.31% MCMV)
  valorCsllRetBRL: number; // 0.66% (ou 0.16% MCMV)
  valorPisRetBRL: number; // 0.37% (ou 0.09% MCMV)
  valorCofinsRetBRL: number; // 1.71% (ou 0.44% MCMV)
  valorTotalRetRecolherBRL: number; // Total 4.00% (ou 1.00%)
  codigoReceitaDarf: string; // '4095' (RET Incorporação Imobiliária)
  dataVencimentoDarf: string;
  codigoBarrasDarfFebraban: string;
  statusApuracao: 'CALCULADO' | 'PAGO' | 'INTEGRADO_CONTABIL';
  integradoContabil: boolean;
  loteContabilId?: number;
  observacoes?: string;
}

export interface ResumoEmpreendimentosImobiliarios {
  empresaId: number;
  totalEmpreendimentos: number;
  totalReceitasRecebidasMesBRL: number;
  totalRetRecolherBRL: number;
  empreendimentos: EmpreendimentoImobiliarioRet[];
  apuracoesMensais: ApuracaoMensalRetImobiliario[];
}

// ============================================================================
// SPRINT 43: ZFM SUFRAMA, DIFAL NÃO CONTRIBUINTE FECOEP & CESSÃO MÃO DE OBRA
// ============================================================================

// --- 1. ZONA FRANCA DE MANAUS & BENEFÍCIOS SUFRAMA (Dec-Lei 288/67 / Lei 10.996/04) ---
export type TipoBeneficioSuframa = 'ZONA_FRANCA_MANAUS' | 'AREA_LIVRE_COMERCIO' | 'AMAZONIA_OCIDENTAL';

export type StatusPinSuframa = 
  | 'PIN_GERADO' 
  | 'EM_TRANSITO' 
  | 'CONFERIDO_POSTO_FISCAL' 
  | 'VISTORIADO_INTERNADO' 
  | 'CANCELADO';

export interface OperacaoSuframa {
  id: string;
  empresaId: number;
  numeroNotaFiscal: string;
  dataEmissao: string;
  destinatarioRazaoSocial: string;
  destinatarioCnpj: string;
  inscricaoSuframa: string;
  municipioDestino: string;
  ufDestino: 'AM' | 'RR' | 'AP' | 'RO' | 'AC';
  tipoBeneficio: TipoBeneficioSuframa;
  cfop: string; // Ex: '6.109', '6.110'
  valorTotalProdutosBRL: number;
  aliquotaIcmsDesoneradoPercentual: number; // 7.00% ou 12.00%
  valorIcmsDesoneradoBRL: number; // Abatimento na NF
  aliquotaPisZeroPercentual: number; // 0.00% (CST 06)
  valorEconomiaPisBRL: number; // Ex: 1.65%
  aliquotaCofinsZeroPercentual: number; // 0.00% (CST 06)
  valorEconomiaCofinsBRL: number; // Ex: 7.60%
  valorLiquidoFaturadoBRL: number; // total - icmsDesonerado
  numeroPinSuframa: string; // Protocolo de Ingresso de Mercadoria Nacional
  dataInternamento?: string;
  statusPin: StatusPinSuframa;
  chaveNfe: string;
  integradoContabil: boolean;
  loteContabilId?: number;
  observacoes?: string;
}

export interface ResumoOperacoesSuframa {
  empresaId: number;
  totalOperacoes: number;
  totalFaturamentoBrutoBRL: number;
  totalIcmsDesoneradoBRL: number;
  totalEconomiaPisCofinsBRL: number;
  totalOperacoesInternadas: number;
  operacoes: OperacaoSuframa[];
}

// --- 2. DIFAL NÃO CONTRIBUINTE & FECOEP (EC 87/2015 / LC 190/2022 / Convênio 236/2021) ---
export type TipoOperacaoDifalNc = 'SAIDA_MERCADORIA_CONSUMIDOR_FINAL' | 'PRESTACAO_SERVICO_TRANSPORTE';

export interface ApuracaoOperacaoDifalNc {
  id: string;
  empresaId: number;
  numeroNotaFiscal: string;
  chaveNfe: string;
  dataEmissao: string;
  consumidorFinalNome: string;
  consumidorFinalCpfCnpj: string;
  ufOrigem: string; // Ex: 'SP'
  ufDestino: string; // Ex: 'RJ', 'BA', 'PE'
  valorTotalOperacaoBRL: number;
  baseCalculoDifalBRL: number;
  aliquotaInterestadualPercentual: number; // 4.0%, 7.0% ou 12.0%
  aliquotaInternaDestinoPercentual: number; // Ex: 20.0%, 18.0%
  aliquotaFecoepPercentual: number; // Adicional FCP (1.0% a 4.0%)
  diferencialAliquotaLiquidoPercentual: number; // AliqInterna - AliqInter
  valorDifalDestinoBRL: number; // Base * DifAliq
  valorFecoepDestinoBRL: number; // Base * AliqFecoep
  valorTotalGnreRecolherBRL: number; // Difal + Fecoep
  codigoReceitaGnre: string; // '10010-2' por operação ou '10011-0' por apuração
  codigoBarrasGnreFebraban: string;
  dataVencimento: string;
  statusPagamento: 'PENDENTE' | 'PAGO' | 'CONCILIADO_SEFAZ';
  integradoContabil: boolean;
  loteContabilId?: number;
  observacoes?: string;
}

export interface ResumoDifalConsumidorFinal {
  empresaId: number;
  competencia: string;
  totalOperacoes: number;
  totalBaseCalculoBRL: number;
  totalDifalDestinoBRL: number;
  totalFecoepDestinoBRL: number;
  totalGnreBRL: number;
  operacoes: ApuracaoOperacaoDifalNc[];
}

// --- 3. CESSÃO DE MÃO DE OBRA & RETENÇÕES EM SUBCONTRATAÇÃO (Lei 8.212/91 / IN RFB 2.110/22) ---
export type TipoContratoMaoDeObra =
  | 'LIMPEZA_CONSERVACAO'
  | 'VIGILANCIA_SEGURANCA'
  | 'CONSTRUCAO_CIVIL_EMPREITADA'
  | 'MANUTENCAO_PREDIAL_INDUSTRIAL'
  | 'TRABALHO_TEMPORARIO';

export interface RetencaoMaoDeObraNota {
  id: string;
  empresaId: number;
  tipoPapel: 'TOMADOR_SERVICO' | 'PRESTADOR_SERVICO';
  numeroNotaFiscal: string;
  serie: string;
  dataEmissao: string;
  razaoSocialContraparte: string;
  cnpjContraparte: string;
  tipoContrato: TipoContratoMaoDeObra;
  optanteCprbDesoneracao: boolean; // Se true, 3.5%; se false, 11%
  aliquotaInssRetencaoPercentual: number; // 11.00 ou 3.50
  valorBrutoNotaBRL: number;
  valorDeducaoMateriaisEquipamentosBRL: number; // Dedução permitida (até 50%)
  valorDeducaoSubcontratacaoBRL: number; // Abatimento de subcontratadas
  baseCalculoInssRetencaoBRL: number; // Bruto - deduções
  valorInssRetidoCalculadoBRL: number; // Base * Alíquota
  codigoReceitaDarfDctfWeb: string; // '2631' ou Reinf R-2010/R-2020
  numeroProcessoJudicial?: string;
  statusRetencao: 'APURADO' | 'DECLARADO_REINF' | 'COMPENSADO' | 'RECOLHIDO';
  integradoContabil: boolean;
  loteContabilId?: number;
  observacoes?: string;
}

export interface ResumoRetencoesMaoDeObra {
  empresaId: number;
  totalNotas: number;
  totalValorBrutoBRL: number;
  totalDeducoesLegaisBRL: number;
  totalBaseCalculoBRL: number;
  totalInssRetidoBRL: number;
  notas: RetencaoMaoDeObraNota[];
}

// ============================================================================
// SPRINT 44: SIMPLES REGIME DE CAIXA, CRÉDITO PRESUMIDO AGRO & PIS/COFINS ST
// ============================================================================

// --- 1. SIMPLES NACIONAL NO REGIME DE CAIXA (Res. CGSN 140/2018 / LC 123/2006 Art. 18 § 3º) ---
export type AnexoSimplesNacionalCaixa =
  | 'ANEXO_I_COMERCIO'
  | 'ANEXO_II_INDUSTRIA'
  | 'ANEXO_III_SERVICOS'
  | 'ANEXO_IV_SERVICOS'
  | 'ANEXO_V_FATOR_R';

export type FormaLiquidacaoCaixa =
  | 'PIX'
  | 'BOLETO_BANCARIO'
  | 'CARTAO_CREDITO'
  | 'CARTAO_DEBITO'
  | 'TRANSFERENCIA_TED'
  | 'DINHEIRO';

export type StatusParcelaCaixa =
  | 'A_RECEBER'
  | 'RECEBIDO_TOTAL'
  | 'RECEBIDO_PARCIAL'
  | 'INADIMPLENTE';

export interface ParcelaRecebimentoSimples {
  id: string;
  empresaId: number;
  numeroDocumentoOrigem: string; // Ex: NF-e 1024/1
  serie: string;
  dataEmissaoCompetencia: string; // YYYY-MM-DD
  dataVencimento: string; // YYYY-MM-DD
  dataLiquidacaoEfetiva?: string; // YYYY-MM-DD
  clienteRazaoSocial: string;
  clienteCnpjCpf: string;
  anexoSimples: AnexoSimplesNacionalCaixa;
  valorOriginalTituloBRL: number;
  valorRecebidoNoMesBRL: number;
  saldoRemanescenteDiferidoBRL: number;
  formaLiquidacao: FormaLiquidacaoCaixa;
  contaBancariaDestino: string;
  status: StatusParcelaCaixa;
  aliquotaEfetivaSimplesEstimada: number;
  valorSimplesApuradoBRL: number;
  integradoContabil: boolean;
  loteContabilId?: number;
  observacoes?: string;
}

export interface ApuracaoPgdasCaixa {
  id: string;
  empresaId: number;
  competencia: string; // YYYY-MM
  totalFaturadoCompetenciaBRL: number;
  totalRecebidoCaixaBRL: number;
  saldoDiferidoAcumuladoBRL: number;
  receitaRbt12BRL: number;
  valorDasCaixaBRL: number;
  valorDasCompetenciaEstimadoBRL: number;
  diferimentoTributarioBRL: number; // DasCompetencia - DasCaixa
  statusDeclaracao: 'EM_DIGITACAO' | 'TRANSMITIDO_PGDAS' | 'DAS_GERADO' | 'QUITADO';
  numeroReciboPgdas?: string;
  codigoBarrasDasFebraban?: string;
}

export interface ResumoSimplesRegimeCaixa {
  empresaId: number;
  competencia: string;
  totalParcelasRecebidas: number;
  totalValorRecebidoBRL: number;
  totalSaldoDiferidoBRL: number;
  totalDasCaixaBRL: number;
  parcelas: ParcelaRecebimentoSimples[];
  apuracoesMensais: ApuracaoPgdasCaixa[];
}

// --- 2. CRÉDITO PRESUMIDO DE PIS E COFINS NO AGRONEGÓCIO (Art. 8º Lei 10.925/2004 / IN RFB 2.121/2022) ---
export type TipoInsumoAgropecuario =
  | 'LEITE_IN_NATURA'
  | 'GRAOS_SOJA_MILHO'
  | 'CARNES_BOVINA_SUINA_AVES'
  | 'CAFE_EM_GRAO'
  | 'CEREAIS_TRIGO_ARROZ'
  | 'CANA_DE_ACUCAR';

export type OrigemProdutorAgro =
  | 'PESSOA_FISICA_PRODUTOR_RURAL'
  | 'COOPERATIVA_AGROPECUARIA'
  | 'PRODUTOR_RURAL_PJ_ISENTO';

export type PercentualAliquotaPresumida = 60.0 | 35.0 | 50.0 | 20.0;

export interface InsumoAgropecuarioCredito {
  id: string;
  empresaId: number;
  numeroDocumentoFiscal: string;
  serie: string;
  dataEntrada: string;
  produtorNomeRazaoSocial: string;
  produtorCpfCnpj: string;
  produtorUf: string;
  tipoInsumo: TipoInsumoAgropecuario;
  origemProdutor: OrigemProdutorAgro;
  descricaoProduto: string;
  quantidadeUnidade: number;
  unidadeMedida: string; // Ex: 'Litros', 'Sacas (60kg)', 'Kg', 'Toneladas'
  valorAquisicaoInsumoBRL: number;
  percentualCreditoPresumidoAplicado: PercentualAliquotaPresumida; // 60% ou 35%
  aliquotaEfetivaPisPresumidoPercentual: number; // Ex: 0.99% ou 0.5775%
  aliquotaEfetivaCofinsPresumidoPercentual: number; // Ex: 4.56% ou 2.66%
  valorCreditoPresumidoPisBRL: number;
  valorCreditoPresumidoCofinsBRL: number;
  valorTotalCreditoPresumidoBRL: number;
  codigoBaseCreditoEfd: string; // Ex: '13 - Aquisição agropecuária Lei 10.925/04'
  cstPisCofinsEntrada: string; // '73 - Aquisição a alíquota zero com crédito presumido'
  statusCredito: 'APURADO' | 'ESCRITURADO_EFD' | 'RESSARCIDO_PERDCOMP' | 'COMPENSADO';
  integradoContabil: boolean;
  loteContabilId?: number;
  observacoes?: string;
}

export interface ApuracaoCreditoPresumidoAgro {
  id: string;
  empresaId: number;
  competencia: string;
  totalComprasProdutorRuralBRL: number;
  totalCreditoPisAgroBRL: number;
  totalCreditoCofinsAgroBRL: number;
  totalCreditoPresumidoAgroBRL: number;
  saldoCredorTransferivelPerdcompBRL: number;
}

export interface ResumoCreditoPresumidoAgro {
  empresaId: number;
  competencia: string;
  totalOperacoes: number;
  totalValorAquisicaoBRL: number;
  totalCreditoPisBRL: number;
  totalCreditoCofinsBRL: number;
  totalGeralCreditoPresumidoBRL: number;
  insumos: InsumoAgropecuarioCredito[];
}

// --- 3. SUBSTITUIÇÃO TRIBUTÁRIA DE PIS E COFINS MONOFÁSICO/ST (Leis 10.485/2002, 9.718/1998, 10.147/2000) ---
export type SegmentoSubstituicaoPisCofins =
  | 'AUTOPECAS_VEICULOS'
  | 'BEBIDAS_FRIAS_CERVEJAS'
  | 'CIGARROS_TABACO'
  | 'FARMACEUTICOS_COSMETICOS'
  | 'COMBUSTIVEIS_LUBRIFICANTES';

export type PapelCadeiaPisCofins =
  | 'SUBSTITUTO_FABRICANTE_IMPORTADOR'
  | 'SUBSTITUIDO_DISTRIBUIDOR'
  | 'SUBSTITUIDO_VAREJISTA';

export interface ItemSubstituicaoPisCofins {
  id: string;
  empresaId: number;
  tipoOperacao: 'SAIDA_SUBSTITUTO' | 'ENTRADA_SUBSTITUIDO' | 'SAIDA_SUBSTITUIDO';
  papelCadeia: PapelCadeiaPisCofins;
  segmento: SegmentoSubstituicaoPisCofins;
  numeroNotaFiscal: string;
  serie: string;
  dataOperacao: string;
  razaoSocialContraparte: string;
  cnpjContraparte: string;
  ufContraparte: string;
  codigoProdutoNcm: string;
  descricaoItem: string;
  valorMercadoriaBRL: number;
  percentualMvaAjustada: number; // MVA (%)
  baseCalculoPisCofinsStBRL: number; // ValorMercadoria * (1 + Mva/100)
  aliquotaPisStPercentual: number; // Ex: 1.65% ou retenção específica
  aliquotaCofinsStPercentual: number; // Ex: 7.60% ou retenção específica
  valorPisStCalculadoBRL: number;
  valorCofinsStCalculadoBRL: number;
  valorTotalPisCofinsStBRL: number;
  cstPisCofins: string; // '05' (ST) ou '04' (Monofásico) ou '01'
  codigoReceitaDarfPisSt: string; // '6912'
  codigoReceitaDarfCofinsSt: string; // '6824'
  codigoBarrasDarfFebraban: string;
  statusRecolhimento: 'RETIDO_FONTE' | 'DARF_GERADO' | 'RECOLHIDO' | 'DESONERADO_SAIDA_SUBSTITUIDO';
  integradoContabil: boolean;
  loteContabilId?: number;
  observacoes?: string;
}

export interface ApuracaoPisCofinsST {
  id: string;
  empresaId: number;
  competencia: string;
  totalBaseStBRL: number;
  totalPisStDevidoBRL: number;
  totalCofinsStDevidoBRL: number;
  totalPisCofinsStGeralBRL: number;
  totalVendasIsentasSubstituidoBRL: number;
}

export interface ResumoPisCofinsST {
  empresaId: number;
  competencia: string;
  totalItens: number;
  totalBaseStBRL: number;
  totalPisStBRL: number;
  totalCofinsStBRL: number;
  totalGeralStBRL: number;
  totalDesoneracaoSubstituidoBRL: number;
  itens: ItemSubstituicaoPisCofins[];
}

// ============================================================================
// SPRINT 45: SUBVENÇÕES IRPJ (LEI 14.789/23) & PIS/COFINS IMPORTAÇÃO
// ============================================================================

// --- 2. SUBVENÇÕES PARA INVESTIMENTO - CRÉDITO FISCAL IRPJ (Lei nº 14.789/2023 / IN RFB nº 2.170/2023) ---
export type TipoAtoConcessivoSubvencao =
  | 'PRODEPE_PE'
  | 'TTD_SC'
  | 'PRODUZIR_GO'
  | 'FUNDOPEM_RS'
  | 'FOMENTAR_BA'
  | 'PARCEIROS_SP';

export interface ItemSubvencaoInvestimentoNovo {
  id: string;
  empresaId: number;
  numeroHabilitacaoRFB: string; // Habilitação formal RFB
  tipoIncentivoEstadual: TipoAtoConcessivoSubvencao;
  ufConcessora: string;
  numeroLeiDecretoEstadual: string;
  nomeProjetoImplantacaoExpansao: string;
  competencia: string;
  valorDespesaDepreciacaoBRL: number; // Base do crédito
  aliquotaCreditoFiscalPercentual: number; // 25.00%
  valorCreditoFiscalIrpjBRL: number; // Depreciação * 25%
  valorSubvencaoEstadualAproveitadaBRL: number;
  statusAproveitamento: 'APURADO' | 'HABILITADO_RFB' | 'COMPENSADO' | 'TRANSFERIDO_RESERVA_PL';
  integradoContabil: boolean;
  loteContabilId?: number;
  observacoes?: string;
}

export interface ResumoSubvencoesInvestimentoNovo {
  empresaId: number;
  competencia: string;
  totalProjetosHabilitados: number;
  totalDepreciacaoElegivelBRL: number;
  totalCreditoFiscalIrpjBRL: number;
  itens: ItemSubvencaoInvestimentoNovo[];
}

// --- 3. PIS/COFINS IMPORTAÇÃO COM ADICIONAL DE 1% (Lei nº 10.865/2004 / IN RFB nº 2.121/2022) ---
export interface ItemPisCofinsImportacao {
  id: string;
  empresaId: number;
  numeroDeclaracaoImportacao: string; // DI / DUIMP
  dataDesembaracoAduaneiro: string;
  numeroAdicao: string;
  exportadorEstrangeiroNome: string;
  paisOrigem: string;
  codigoNcm: string;
  descricaoMercadoria: string;
  sujeitoAdicionalUmPorcentoCofins: boolean;
  valorAduaneiroCifBRL: number;
  valorImpostoImportacaoBRL: number;
  valorIpiImportacaoBRL: number;
  baseCalculoPisCofinsImportacaoBRL: number;
  aliquotaPisImportacaoPercentual: number; // 2.10%
  aliquotaCofinsImportacaoPercentual: number; // 9.65% ou 10.65%
  valorPisImportacaoBRL: number;
  valorCofinsImportacaoBRL: number;
  valorAdicionalUmPorcentoCofinsBRL: number; // Parcela vedada ao crédito
  valorTotalPisCofinsImportacaoBRL: number;
  valorCreditoPermitidoAtivoBRL: number; // Creditável no Ativo
  valorCustoEstoqueNaoCreditavelBRL: number; // Incorporado ao Estoque
  codigoReceitaDarfPisImportacao: string; // '5602'
  codigoReceitaDarfCofinsImportacao: string; // '5629'
  statusDesembaraco: 'DESEMBARACADO' | 'DARF_PAGO' | 'CONCILIADO_SISCOMEX';
  integradoContabil: boolean;
  loteContabilId?: number;
  observacoes?: string;
}

export interface ResumoPisCofinsImportacao {
  empresaId: number;
  competencia: string;
  totalDeclaracoes: number;
  totalValorAduaneiroBRL: number;
  totalPisImportacaoBRL: number;
  totalCofinsImportacaoBRL: number;
  totalAdicionalUmPorcentoBRL: number;
  totalCreditoAtivoBRL: number;
  declaracoes: ItemPisCofinsImportacao[];
}

// ============================================================================
// SPRINT 46: TERCEIRO SETOR (ITG 2002), DRAWBACK INTERMEDIÁRIO & REINF SÉRIE R-4000
// ============================================================================

// --- 1. CONTABILIDADE DE ENTIDADES SEM FINS LUCRATIVOS - IMUNES E ISENTAS (ITG 2002 R1 / LEI 12.101/09 CEBAS) ---
export type TipoEntidadeSemFinsLucrativos =
  | 'ASSOCIACAO'
  | 'FUNDACAO'
  | 'ENTIDADE_RELIGIOSA'
  | 'SINDICATO_ASSOCIACAO_PROFISSIONAL'
  | 'ONG_OSCIP'
  | 'CEBAS_SAUDE'
  | 'CEBAS_EDUCACAO'
  | 'CEBAS_ASSISTENCIA_SOCIAL';

export type TipoOrigemRecursoTerceiroSetor =
  | 'RECURSO_PROPRIO_DESRESTRITO' // Mensalidades, anuidades, doações livres
  | 'CONVENIO_PUBLICO_MROSC'     // Termo de Fomento/Colaboração Lei 13.019/14
  | 'DOACAO_VINCULADA_RESTRITA'   // Doação para fim específico
  | 'GRATUIDADE_CEBAS'            // Bolsas de estudo, atendimentos SUS gratuitos
  | 'SUBVENCAO_GOVERNAMENTAL';

export interface ItemProjetoConvenioTerceiroSetor {
  id: string;
  empresaId: number;
  codigoProjeto: string;
  nomeProjeto: string;
  tipoEntidade: TipoEntidadeSemFinsLucrativos;
  orgaoConcedente?: string; // Ex: Ministério da Saúde, Sec. Educação, FNDE
  numeroInstrumentoMrosc?: string; // Número do Termo de Fomento / Parceria
  origemRecurso: TipoOrigemRecursoTerceiroSetor;
  dataInicioVigencia: string;
  dataTerminoVigencia: string;
  valorTotalRepasseAprovadoBRL: number;
  valorRecebidoContaVinculadaBRL: number;
  valorDespesasExecutadasBRL: number;
  valorReceitaReconhecidaResultadoBRL: number; // Conforme execução do plano de trabalho
  saldoPassivoReceitaDiferidaBRL: number; // Repasse recebido ainda não executado
  rendimentosAplicacaoFinanceiraBRL: number; // Obrigatório devolver ou aplicar no projeto
  valorGratuidadeAplicadaCebasBRL: number; // Para comprovação da cota de isenção
  statusProjeto: 'EM_EXECUCAO' | 'PRESTACAO_CONTAS_ENVIADA' | 'APROVADO_TCE_TCU' | 'CONCLUIDO';
  integradoContabil: boolean;
  loteContabilId?: number;
  observacoes?: string;
}

export interface DemonstracaoSuperavitDeficit {
  empresaId: number;
  exercicio: number;
  receitasComRestricaoBRL: number;
  receitasSemRestricaoBRL: number;
  totalReceitasOperacionaisBRL: number;
  despesasProjetosVinculadosBRL: number;
  despesasAdministrativasGeraisBRL: number;
  despesasPessoalEncargosBRL: number;
  gratuidadeAssistenciaSocialEducacaoBRL: number;
  totalDespesasOperacionaisBRL: number;
  superavitOuDeficitOperacionalBRL: number;
  destinacaoFundoPatrimonialBRL: number;
  destinacaoReservaEstatutariaBRL: number;
}

export interface ResumoEntidadeSemFinsLucrativos {
  empresaId: number;
  exercicio: number;
  totalProjetosAtivos: number;
  totalRepassesConveniosBRL: number;
  totalExecutadoPeriodoBRL: number;
  totalReceitasDiferidasPassivoBRL: number;
  totalGratuidadeCebasBRL: number;
  superavitPeriodoBRL: number;
  projetos: ItemProjetoConvenioTerceiroSetor[];
  demonstracao: DemonstracaoSuperavitDeficit;
}

// --- 2. DRAWBACK INTERMEDIÁRIO & FORNECIMENTO NO MERCADO INTERNO (DECRETO 6.759/2009 ARTS. 383 A 426) ---
export type ModalidadeDrawbackIntermediario = 'SUSPENSAO' | 'ISENCAO' | 'RESTITUICAO';

export type StatusAtoDrawbackIntermediario = 
  | 'REGISTRADO_SISCOMEX'
  | 'PARCIALMENTE_COMPROVADO'
  | 'TOTALMENTE_COMPROVADO'
  | 'INADIMPLIDO';

export interface ItemDrawbackIntermediario {
  id: string;
  empresaId: number;
  numeroAtoConcessorioIntermediario: string; // Registrado no Siscomex
  dataEmissaoAto: string;
  dataValidadeAto: string;
  modalidade: ModalidadeDrawbackIntermediario;
  razaoSocialExportadorFinal: string;
  cnpjExportadorFinal: string;
  numeroNotaFiscalRemessaIntermediaria: string; // CFOP 5.127 ou 6.127
  chaveNfeRemessa: string;
  dataRemessa: string;
  descricaoProdutoIntermediario: string;
  codigoNcmProdutoIntermediario: string;
  valorFornecimentoBRL: number;
  valorIiSuspensoBRL: number;
  valorIpiSuspensoBRL: number;
  valorPisSuspensoBRL: number;
  valorCofinsSuspensoBRL: number;
  valorIcmsSuspensoBRL: number;
  valorTotalTributosSuspensosBRL: number;
  numeroDueExportadorFinal?: string;
  chaveNfeExportacaoFinal?: string;
  dataAverbacaoExportadorFinal?: string;
  percentualComprovado: number; // 0% a 100%
  status: StatusAtoDrawbackIntermediario;
  integradoContabil: boolean;
  loteContabilId?: number;
  observacoes?: string;
}

export interface ResumoDrawbackIntermediario {
  empresaId: number;
  competencia: string;
  totalAtosConcessorios: number;
  totalFornecimentoIntermediarioBRL: number;
  totalTributosSuspensosBRL: number;
  totalTributosComprovadosBRL: number;
  totalTributosRiscoInadimplementoBRL: number;
  atos: ItemDrawbackIntermediario[];
}

// --- 3. RETENÇÕES NA FONTE - SÉRIE R-4000 EFD-REINF & DARF (IN RFB 2.043/2021 / IN RFB 2.145/2023) ---
export type TipoEventoReinf4000 =
  | 'R-4010_PF' // Rendimentos pagos a pessoa física
  | 'R-4020_PJ' // Pagamentos a pessoa jurídica
  | 'R-4040_NAO_IDENTIFICADO' // Pagamentos a beneficiários não identificados
  | 'R-4080_AUTO_RETENCAO'; // Auto-retenção por operadoras de cartões e agências de publicidade

export interface ItemRetencaoReinf4000 {
  id: string;
  empresaId: number;
  tipoEvento: TipoEventoReinf4000;
  numeroDocumentoFiscal: string; // Número NF-e ou RPS/NFS-e
  dataFatoGerador: string;
  dataPagamento: string;
  beneficiarioCpfCnpj: string;
  beneficiarioNomeRazaoSocial: string;
  codigoNaturezaRendimento: string; // Ex: '13002' - TI, '15001' - Limpeza, '10001' - Autônomo PF
  descricaoServico: string;
  valorBrutoRendimentoBRL: number;
  baseCalculoIrrfBRL: number;
  aliquotaIrrfPercentual: number; // Ex: 1.5%, 15.0%, etc.
  valorIrrfRetidoBRL: number;
  codigoReceitaDarfIrrf: string; // '1708', '0588', '3208', '0422'
  baseCalculoCrfBRL: number;
  aliquotaPisRetidoPercentual: number; // 0.65%
  valorPisRetidoBRL: number;
  aliquotaCofinsRetidoPercentual: number; // 3.00%
  valorCofinsRetidoBRL: number;
  aliquotaCsllRetidoPercentual: number; // 1.00%
  valorCsllRetidoBRL: number;
  valorTotalCrfRetidoBRL: number; // 4.65%
  codigoReceitaDarfCrf: string; // '5952'
  dispensadoRetencaoMinima: boolean; // Valor inferior a R$ 10,00
  valorLiquidoPagoBRL: number;
  idReciboReinf?: string;
  statusTransmissao: 'PENDENTE' | 'GERADO_XML' | 'TRANSMITIDO_RECIBO' | 'CONCILIADO_DCTFWEB';
  integradoContabil: boolean;
  loteContabilId?: number;
  observacoes?: string;
}

export interface ResumoRetencoesReinf4000 {
  empresaId: number;
  competencia: string;
  totalEventosR4000: number;
  totalRendimentoBrutoBRL: number;
  totalIrrfRetidoBRL: number;
  totalPisRetidoBRL: number;
  totalCofinsRetidoBRL: number;
  totalCsllRetidoBRL: number;
  totalCrfRetidoBRL: number;
  totalGeralRetencoesFederaisBRL: number;
  retencoes: ItemRetencaoReinf4000[];
}

// =================================================================
// SPRINT 47: FCI, DIME-SC / DCIP & SISCRED PARANÁ
// =================================================================

// --- 1. FCI - FICHA DE CONTEÚDO DE IMPORTAÇÃO (RESOLUÇÃO SF 13/2012 & CONVÊNIO ICMS 38/2013) ---
export type FaixaConteudoImportacao = 'ATE_40_PORCENTO' | 'SUPERIOR_40_PORCENTO';
export type OrigemMercadoriaFci =
  | '0_NACIONAL'
  | '3_NACIONAL_MERCADORIA_OU_BEM_COM_CONTEUDO_IMPORTACAO_SUPERIOR_40'
  | '5_NACIONAL_MERCADORIA_OU_BEM_COM_CONTEUDO_IMPORTACAO_ATE_40'
  | '8_NACIONAL_MERCADORIA_OU_BEM_COM_CONTEUDO_IMPORTACAO_SUPERIOR_70';

export interface ItemFci {
  id: string;
  empresaId: number;
  codigoItem: string;
  descricaoItem: string;
  ncm: string;
  unidadeMedida: string;
  valorParcelaImportadaBRL: number; // P: parcela importada do exterior
  valorSaidaInterestadualBRL: number; // S: valor da saída interestadual deduzidos tributos
  percentualConteudoImportacao: number; // CI = (P / S) * 100
  faixaConteudo: FaixaConteudoImportacao;
  aliquotaIcmsInterestadual: number; // 4.0% se > 40%, 7% ou 12% se <= 40%
  cstOrigemSugerido: string; // '3' se > 40%, '5' se <= 40%
  numeroControleFci: string; // UUID/Protocolo SEFAZ para preencher tag <nFCI> da NF-e
  protocoloEnvioSefaz?: string;
  dataHomologacao?: string;
  statusFci: 'RASCUNHO' | 'VALIDADO' | 'TRANSMITIDO' | 'HOMOLOGADO';
  observacoes?: string;
}

export interface ResumoFci {
  empresaId: number;
  competencia: string;
  totalItensFci: number;
  totalItensComAliquota4: number;
  totalItensComAliquotaNormal: number;
  mediaConteudoImportacaoPercentual: number;
  totalValorParcelaImportadaBRL: number;
  totalValorSaidaInterestadualBRL: number;
  itens: ItemFci[];
}

// --- 2. DIME-SC & DCIP - ICMS E MOVIMENTO ECONÔMICO SANTA CATARINA (PORTARIA SEF 286/1995) ---
export type TipoDcip =
  | 'PRODEC'
  | 'PRO_EMPREGO'
  | 'TTD_409_IMPORTACAO'
  | 'TTD_410'
  | 'CREDITO_PRESUMIDO_AGRO'
  | 'CREDITO_ATIVO_PERMANENTE'
  | 'OUTROS_BENEFICIOS';

export interface ItemDcip {
  id: string;
  empresaId: number;
  numeroDcip: string;
  tipoDcip: TipoDcip;
  codigoBeneficio: string; // Ex: 'SC800001', 'SC810002'
  competencia: string;
  descricao: string;
  valorCreditoBRL: number;
  processoAdministrativo?: string;
  status: 'HOMOLOGADO' | 'PENDENTE';
}

export interface DeclaracaoDimeSc {
  id: string;
  empresaId: number;
  competencia: string;
  versaoLayout: string;
  // Quadro 01: Dados Gerais e Movimento Econômico
  quadro01: {
    faturamentoBrutoBRL: number;
    entradasTotaisBRL: number;
    saidasTotaisBRL: number;
    totalOperacoesComTributacaoBRL: number;
  };
  // Quadro 02: Débitos do Imposto
  quadro02: {
    debitosSaidasPropriasBRL: number;
    outrosDebitosBRL: number;
    estornoCreditosBRL: number;
    totalDebitosBRL: number;
  };
  // Quadro 03: Créditos do Imposto
  quadro03: {
    creditosEntradasBRL: number;
    outrosCreditosBRL: number;
    estornoDebitosBRL: number;
    saldoCredorPeriodoAnteriorBRL: number;
    totalCreditosBRL: number;
  };
  // Quadro 04: Créditos Presumidos e Especiais vinculados ao DCIP
  quadro04: {
    totalCreditosPresumidosDcipBRL: number;
    itensDcip: ItemDcip[];
  };
  // Quadro 09: Cálculo do Saldo Devedor ou Credor
  quadro09: {
    saldoApuradoBRL: number; // Positivo = Devedor, Negativo = Credor
    saldoCredorTransportarBRL: number;
    impostoARecolherBRL: number;
  };
  // Quadro 11: Discriminação dos Pagamentos / DARE
  quadro11: {
    dareIcmsNormalBRL: number;
    dareFundoSocialBRL: number; // 1% Fundo Social / Fundo da Infância
    codigoReceitaDare: string; // '1449' ICMS Normal, '1644' Fundo Social
    dataVencimento: string; // Dia 10 do mês subsequente
    linhaDigitavelDare?: string;
  };
  status: 'ABERTO' | 'APURADO' | 'ARQUIVO_GERADO' | 'TRANSMITIDO';
  integradoContabil: boolean;
  loteContabilId?: number;
}

// --- 3. SISCRED PARANÁ - CRÉDITOS ACUMULADOS DE ICMS (NPF 084/2017 & DEC. ESTADUAL 7.871/2017) ---
export type TipoOrigemCreditoSiscred =
  | 'EXPORTACAO'
  | 'DIFERIMENTO'
  | 'SUSPENSAO'
  | 'REDUCAO_BASE_CALCULO'
  | 'ISENCAO_MANUTENCAO';

export type TipoDestinacaoCreditoSiscred =
  | 'TRANSFERENCIA_FORNECEDOR_INSUMOS'
  | 'AQUISICAO_ATIVO_IMOBILIZADO'
  | 'LIQUIDACAO_DIVIDA_ATIVA'
  | 'COMPENSACAO_PROPRIA';

export interface OperacaoContaCorrenteSiscred {
  id: string;
  empresaId: number;
  dataOperacao: string;
  competencia: string;
  tipoMovimento: 'CREDITO_GERADO' | 'HABILITACAO_RECEITA' | 'TRANSFERENCIA_SAIDA' | 'ESTORNO';
  origemCredito?: TipoOrigemCreditoSiscred;
  destinacao?: TipoDestinacaoCreditoSiscred;
  numeroProcessoSEFAZ: string;
  cnpjFavorecido?: string;
  razaoSocialFavorecido?: string;
  chaveNfeVinculada?: string;
  valorOperacaoBRL: number;
  saldoContaCorrenteBRL: number;
  statusHomologacao: 'PENDENTE_ANALISE' | 'HOMOLOGADO_CADASTRO' | 'REJEITADO';
  integradoContabil: boolean;
  loteContabilId?: number;
  observacoes?: string;
}

export interface ResumoSiscredPr {
  empresaId: number;
  competencia: string;
  saldoInicialBRL: number;
  totalCreditosGeradosBRL: number;
  totalCreditosHabilitadosBRL: number;
  totalTransferenciasUtilizadasBRL: number;
  saldoFinalDisponivelBRL: number;
  limiteOperacionalMensalLomBRL: number; // LOM calculado pela SEFAZ/PR
  operacoes: OperacaoContaCorrenteSiscred[];
}

// ============================================================================
// SPRINT 48: REGULAÇÃO, FUNDOS ESTADUAIS & ESTRUTURAS SOCIETÁRIAS AVANÇADAS
// ============================================================================

// --- 1. DERE - DEMONSTRAÇÃO DE RECURSOS E ENCARGOS / BALANCETE REGULATÓRIO ---
// (Schema XSD v1.1.0 Domínio Sistemas: envioLoteDere, evtPGCC-v1_0_3, evtBalancete-v1_0_1)

export type PlanoCtaRefTipo = '1' | '2' | '3' | '4' | '5'; // 1: COSIF, 2: ANS, 3: SUSEP, 4: SPED, 5: PREVIC
export type FreqEncerramento = 'A' | 'S' | 'Q' | 'T' | 'B' | 'M'; // Anual, Semestral, Quadrimestral, Trimestral, Bimestral, Mensal

export interface ItemContaPgcc {
  cCta: string; // Código completo (ex: 110101000)
  cCtaInterna: string; // Código interno (ex: 110101)
  cDbrMista: string; // Desdobramento conta mista (000 a 999)
  nomeCta: string;
  indCta: 'S' | 'A'; // Sintética | Analítica
  descCta?: string; // Descrição detalhada da natureza
  cCtaSup?: string; // Conta hierárquica superior
  cCtaRef: string; // Conta no plano referencial (COSIF/ANS/SUSEP/SPED/PREVIC)
  nivelCta: number;
  natCta: 'C' | 'D' | 'V'; // Credora, Devedora, Variável
  codNat: number; // 1: Ativo, 2: Passivo, 3: PL, 4: Resultado
}

export interface ItemContaBalanceteDere {
  cCta: string;
  nomeCta: string;
  natSaldoInic: 'D' | 'C';
  vSaldoInic: number;
  vMovDebt: number;
  vAjusteDebt?: number;
  vMovCred: number;
  vAjusteCred?: number;
  natSaldoFinal: 'D' | 'C';
  vSaldoFinal: number;
  natVApur?: 'D' | 'C';
  vApur: number;
}

export interface EventoPgccDere {
  id: string;
  empresaId: number;
  tpOper: '1' | '2' | '3'; // 1-Inclusão, 2-Alteração, 3-Exclusão
  tpAmb: '1' | '2'; // 1-Produção, 2-Produção Restrita
  aplicEmi: '1' | '2'; // 1-Aplicativo Empresa, 2-Governamental
  verAplic: string;
  iniValid: string; // YYYY-MM-DD
  fimValid?: string;
  planoCtaRef: PlanoCtaRefTipo;
  freqEncerr: FreqEncerramento;
  contas: ItemContaPgcc[];
  status: 'RASCUNHO' | 'VALIDADO' | 'TRANSMITIDO';
  dataGravacao: string;
}

export interface DeclaracaoLoteDere {
  id: string;
  empresaId: number;
  cnpjRaiz: string; // 8 dígitos alfanuméricos
  competencia: string; // AAAA-MM
  tpAmb: '1' | '2';
  planoRef: 'COSIF' | 'ANS' | 'SUSEP' | 'SPED' | 'PREVIC';
  status: 'RASCUNHO' | 'VALIDADO' | 'ARQUIVO_GERADO' | 'TRANSMITIDO';
  protocoloEnvio?: string;
  reciboEntrega?: string;
  dataGeracao?: string;
  itensBalancete: ItemContaBalanceteDere[];
  totalAtivoBRL: number;
  totalPassivoBRL: number;
  totalReceitasBRL: number;
  totalDespesasBRL: number;
  resultadoExercicioBRL: number;
}

export interface ResumoDereEconomico {
  empresaId: number;
  competencia: string;
  planoContasComentado: EventoPgccDere;
  declaracaoAtual?: DeclaracaoLoteDere;
  historicoDeclaracoes: DeclaracaoLoteDere[];
}

// --- 2. FUNDOS DE EQUILÍBRIO FISCAL ESTADUAIS (FEEF / FOT / PROTEGE - CONVÊNIO ICMS 42/2016) ---

export type TipoFundoEquilibrioEstadual =
  | 'FEEF_RJ'   // RJ: Lei 7.428/2016 (Fundo Estadual de Equilíbrio Fiscal)
  | 'FOT_SC'    // SC: Lei 17.762/2019 (Fundo de Apoio à Educação e Transporte)
  | 'PROTEGE_GO'// GO: Lei 14.469/2003 (Fundo de Proteção Social)
  | 'FEM_MG'    // MG: Fundo de Erradicação da Miséria
  | 'FEPAF_BA'  // BA: Fundo Estadual de Combate e Erradicação da Pobreza
  | 'FEEF_PE';  // PE: Lei 15.865/2016

export interface ItemApuracaoFundoEquilibrio {
  id: string;
  empresaId: number;
  competencia: string;
  fundo: TipoFundoEquilibrioEstadual;
  dispositivoLegal: string; // Ex: TARE 014/2023, Decreto Estadual nº 28.590
  tipoBeneficio: 'ISENCAO' | 'REDUCAO_BASE' | 'CREDITO_PRESUMIDO' | 'DIFERIMENTO_PARCIAL';
  baseCalculoDesoneracaoBRL: number;
  aliquotaBeneficioPercent: number;
  valorDesoneradoBRL: number; // Montante do incentivo fiscal fruído
  aliquotaFundoPercent: number; // Alíquota do Fundo: 10% a 15% (regra Convênio ICMS 42/2016)
  valorDevidoFundoBRL: number; // Valor apurado para depósito compulsório
  dataVencimento: string; // Dia 20 do mês subsequente
  statusPagamento: 'A_RECOLHER' | 'RECOLHIDO' | 'SUSPENSO_JUDICIAL';
  codigoReceitaGuia: string; // DARE 1644 (SC), GNRE 021-3 (RJ), DARE 5013 (GO)
  chaveNfeReferencia?: string;
  integradoContabil: boolean;
  loteContabilId?: number;
  observacoes?: string;
}

export interface ResumoFundosEquilibrioFiscal {
  empresaId: number;
  competencia: string;
  totalIncentivosFruidosBRL: number;
  totalDevidoFundosBRL: number;
  totalRecolhidoBRL: number;
  totalPendenteRecolhimentoBRL: number;
  itens: ItemApuracaoFundoEquilibrio[];
}

// --- 3. SCP - SOCIEDADE EM CONTA DE PARTICIPAÇÃO (CC ARTS. 991-996 / IN RFB 2.179/2024 / DOMÍNIO scpcad01.pbd) ---

export type PapelSocioScp = 'SOCIO_OSTENSIVO' | 'SOCIO_PARTICIPANTE';
export type TipoFormaEscrituracaoScp = 'LIVROS_PROPRIOS_CNPJ_SCP' | 'SUBCONTAS_LIVROS_OSTENSIVO';

export interface SocioScp {
  id: string;
  nomeOuRazaoSocial: string;
  cpfCnpj: string;
  papel: PapelSocioScp;
  percentualParticipacao: number; // Percentual no capital social e lucros
  capitalSubscritoBRL: number;
  capitalIntegralizadoBRL: number;
  contaContabilCapital: string;
  contaContabilDistribuicao: string;
}

export interface ContratoScp {
  id: string;
  empresaId: number;
  codigoScp: string; // Ex: SCP-001
  nomeScp: string; // Nome / Razão do Empreendimento
  cnpjScp?: string; // CNPJ específico opcional emitido conforme IN RFB 2.179/2024
  dataInicio: string;
  dataTerminoPrevista?: string;
  status: 'ATIVO' | 'ENCERRADO' | 'EM_LIQUIDACAO';
  formaEscrituracao: TipoFormaEscrituracaoScp;
  objetoEmpreendimento: string;
  centroCustoResultadoId: string;
  capitalTotalBRL: number;
  saldoDisponivelDistribuicaoBRL: number;
  socios: SocioScp[];
}

export interface DistribuicaoResultadoScp {
  id: string;
  contratoScpId: string;
  empresaId: number;
  competencia: string;
  resultadoLiquidoApuradoBRL: number;
  dataApuracao: string;
  dataDistribuicao: string;
  itensRateio: {
    socioId: string;
    nomeSocio: string;
    cpfCnpj: string;
    papel: PapelSocioScp;
    percentual: number;
    valorDistribuidoBRL: number;
    retencaoIrrfBRL: number; // 0.00 isento Art. 10 Lei 9.249/95
    valorLiquidoPagoBRL: number;
    contaDebito: string;
    contaCredito: string;
  }[];
  integradoContabil: boolean;
  loteContabilId?: number;
  observacoes?: string;
}

export interface ResumoSociedadeContaParticipacao {
  empresaId: number;
  totalScpsAtivas: number;
  capitalTotalInvestidoBRL: number;
  totalResultadosApuradosBRL: number;
  totalLucrosDistribuidosIsentosBRL: number;
  contratos: ContratoScp[];
  distribuicoes: DistribuicaoResultadoScp[];
}

// ============================================================================
// SPRINT 49: CUSTEIO DE ESTOQUES, TRANSPORTE DE CARGAS & SPED ECF EXTERIOR
// ============================================================================

// --- 1. APURAÇÃO DE ESTOQUES & MÉTODOS DE CUSTEIO (CPC 16 R1 / RIR 2018 / DOMÍNIO esapuracaoestoque.pbd) ---

export type MetodoCusteioEstoque = 'PEPS_FIFO' | 'MEDIA_PONDERADA_MOVEL' | 'PRECO_ESPECIFICO';

export type TipoMovimentacaoEstoque =
  | 'SALDO_INICIAL'
  | 'ENTRADA_COMPRA'
  | 'ENTRADA_PRODUCAO'
  | 'SAIDA_VENDA'
  | 'SAIDA_CONSUMO_PROCESSO'
  | 'AJUSTE_INVENTARIO_PERDA'
  | 'AJUSTE_INVENTARIO_GANHO';

export interface ItemMovimentoKardex {
  id: string;
  data: string;
  documento: string; // Ex: NF-e 001.294, OP 402/26
  tipo: TipoMovimentacaoEstoque;
  quantidade: number;
  custoUnitarioBRL: number; // Sem impostos recuperáveis (ICMS/PIS/COFINS)
  custoTotalBRL: number;
  saldoQuantidade: number;
  custoMedioUnitarioBRL: number;
  saldoValorTotalBRL: number;
}

export interface FichaEstoqueProduto {
  id: string;
  empresaId: number;
  codigoProduto: string; // Conforme SPED Bloco 0200
  descricao: string;
  unidadeMedida: string;
  ncm: string;
  tipoItem: 'MERCADORIA_REVENDA' | 'MATERIA_PRIMA' | 'PRODUTO_ACABADO' | 'EMBALAGEM';
  metodoCusteio: MetodoCusteioEstoque;
  contaContabilEstoque: string; // Ativo Circulante (1.01.04...)
  contaContabilCmvCpv: string;  // Resultado (4.01.01...)
  saldoInicialQuantidade: number;
  saldoInicialCustoUnitarioBRL: number;
  saldoInicialValorTotalBRL: number;
  movimentacoes: ItemMovimentoKardex[];
  saldoFinalQuantidade: number;
  custoMedioFinalBRL: number;
  saldoFinalValorTotalBRL: number;
  cmvPeriodoBRL: number;
}

export interface ApuracaoMensalEstoqueCusteio {
  id: string;
  empresaId: number;
  competencia: string; // AAAA-MM
  metodoPadrao: MetodoCusteioEstoque;
  totalEstoqueInicialBRL: number;
  totalEntradasBRL: number;
  totalSaidasCmvBRL: number;
  totalEstoqueFinalBRL: number;
  variacaoEstoquePeriodoBRL: number;
  dataApuracao: string;
  integradoContabil: boolean;
  loteContabilId?: number;
  fichas: FichaEstoqueProduto[];
}

export interface ResumoApuracaoEstoques {
  empresaId: number;
  competencia: string;
  totalProdutosApurados: number;
  valorTotalEstoqueBRL: number;
  totalCmvPeriodoBRL: number;
  fichas: FichaEstoqueProduto[];
  apuracaoAtual?: ApuracaoMensalEstoqueCusteio;
}

// --- 2. CT-e & MDF-e - TRANSPORTE RODOVIÁRIO DE CARGAS & CRÉDITO ICMS (DOMÍNIO esifixocte01.pbd) ---

export type TipoTomadorFrete = 'REMETENTE' | 'DESTINATARIO' | 'EXPEDIDOR' | 'RECEBEDOR' | 'OUTROS';

export type ModalidadeFrete =
  | '0_CIF_REMETENTE'
  | '1_FOB_DESTINATARIO'
  | '2_TERCEIROS'
  | '3_PROPRIO_REMETENTE'
  | '4_PROPRIO_DESTINATARIO'
  | '9_SEM_FRETE';

export interface ConhecimentoTransporteCte {
  id: string;
  empresaId: number;
  numeroCte: string;
  serie: string;
  chaveAcesso: string; // 44 posições
  dataEmissao: string;
  competencia: string;
  tipoDocumento: 'CTE_NORMAL' | 'CTE_COMPLEMENTAR' | 'CTE_SUBSTITUICAO';
  cnpjEmitente: string;
  razaoSocialEmitente: string;
  ufOrigem: string;
  ufDestino: string;
  cfop: string; // 1.352, 2.352, 1.353, 2.353, 5.352, 6.352
  cstIcms: string; // 00, 20, 40, 60
  tomador: TipoTomadorFrete;
  modalidade: ModalidadeFrete;
  valorFreteBRL: number;
  baseCalculoIcmsBRL: number;
  aliquotaIcmsPercent: number;
  valorIcmsBRL: number;
  creditoApropriadoBRL: number; // Valor do crédito de ICMS recuperável para apuração fiscal
  chavesNfeTransportadas: string[];
  integradoContabil: boolean;
  loteContabilId?: number;
  observacoes?: string;
}

export interface ManifestoEletronicoMdfe {
  id: string;
  empresaId: number;
  numeroMdfe: string;
  serie: string;
  chaveAcesso: string;
  dataEmissao: string;
  ufInicio: string;
  ufFim: string;
  placaVeiculo: string;
  rntrc: string;
  quantidadeCtes: number;
  valorTotalCargaBRL: number;
  pesoBrutoTotalKg: number;
  status: 'AUTORIZADO' | 'ENCERRADO' | 'CANCELADO';
}

export interface ResumoTransporteCteMdfe {
  empresaId: number;
  competencia: string;
  totalCtes: number;
  totalFreteContratadoBRL: number;
  totalCreditosIcmsFreteBRL: number;
  totalMdfesEmitidos: number;
  ctes: ConhecimentoTransporteCte[];
  mdfes: ManifestoEletronicoMdfe[];
}

// --- 3. SPED ECF BLOCO V & BLOCO X - DEREX & OPERAÇÕES NO EXTERIOR (IN RFB 2.003/2021 / DOMÍNIO ctspedecf01.pbd) ---

export type TipoOperacaoExterior =
  | 'EXPORTACAO_BENS'
  | 'SERVICO_PRESTADO'
  | 'SERVICO_TOMADO'
  | 'ROYALTIES'
  | 'DIVIDENDOS'
  | 'APORTE_CAPITAL'
  | 'MANUTENCAO_CONTA_EXTERIOR';

export interface RegistroV020Derex {
  id: string;
  empresaId: number;
  anoExercicio: number;
  codigoInstituicaoBancaria: string;
  nomeInstituicao: string;
  numeroConta: string;
  paisConta: string; // Nome e código BACEN
  moeda: 'USD' | 'EUR' | 'GBP' | 'CHF' | 'BRL';
  saldoInicialMoeda: number;
  totalIngressosMoeda: number;
  totalUtilizacoesMoeda: number;
  saldoFinalMoeda: number;
  saldoFinalBRL: number; // Convertido por PTAX Bacen de encerramento
}

export interface RegistroX300OperacaoExterior {
  id: string;
  empresaId: number;
  competencia: string;
  tipoOperacao: TipoOperacaoExterior;
  paisDestinoOrigem: string;
  razaoSocialExterior: string;
  naturezaOperacao: string; // Ex: Licença de Uso Software, Assistência Técnica
  moedaOriginal: 'USD' | 'EUR' | 'BRL';
  valorMoedaOriginal: number;
  taxaCambioPtax: number;
  valorConvertidoBRL: number;
  aliquotaIrrfFontePercent: number; // 15% regra geral ou 25% jurisdição favorecida
  valorIrrfFonteBRL: number;
  aliquotaCidePercent: number; // 10% royalties/serviços técnicos (Lei 10.168/2000)
  valorCideBRL: number;
  codigoReceitaDarf: string; // 0473 (IRRF Serviços Exterior), 8741 (CIDE Remessas)
  integradoContabil: boolean;
  loteContabilId?: number;
  observacoes?: string;
}

export interface ResumoSpedEcfBlocoVX {
  empresaId: number;
  anoExercicio: number;
  totalContasExteriorDerexBRL: number;
  totalRemessasExteriorBRL: number;
  totalIrrfRetidoExteriorBRL: number;
  totalCideRecolhidaBRL: number;
  contasDerex: RegistroV020Derex[];
  operacoesExterior: RegistroX300OperacaoExterior[];
}

// ============================================================================
// SPRINT 50: DAPI-MG, PCLD (CPC 48) & DCTF MENSAL TRADICIONAL
// ============================================================================

// --- 1. DAPI-MG - DEMONSTRATIVO DE APURAÇÃO DO ICMS DE MINAS GERAIS (DECRETO 48.589/2023 - RICMS-MG / DOMÍNIO esrmg01.pbd) ---

export type TipoCampoDapiMg =
  | '66_OUTROS_CREDITOS'
  | '73_ESTORNO_DEBITOS'
  | '79_OUTROS_DEBITOS_ESPECIAIS'
  | '90_DEDUCOES_INCENTIVOS'
  | '98_COMPENSACOES_CREDITOS';

export interface ItemOutroCreditoDapi {
  id: string;
  campoDapi: TipoCampoDapiMg;
  codigoAjuste: string; // Ex: MG020001, MG030015
  descricao: string;
  dispositivoLegal: string; // Ex: Art. 75, Anexo VIII do RICMS-MG
  valorBRL: number;
}

export interface QuadroDapiMg {
  quadro02Entradas: {
    valorContabilTotal: number;
    baseCalculoIcms: number;
    impostoCreditado: number;
    isentasNaoTributadas: number;
    outrasEntradas: number;
    entradasInternas: number;
    entradasInterestaduais: number;
  };
  quadro03Saidas: {
    valorContabilTotal: number;
    baseCalculoIcms: number;
    impostoDebitado: number;
    isentasNaoTributadas: number;
    outrasSaidas: number;
    saidasInternas: number;
    saidasInterestaduais: number;
    saidasExterior: number;
  };
  quadro04Apuracao: {
    totalDebitosSaidas: number;
    outrosDebitos: number;
    estornoCreditos: number;
    totalCreditosEntradas: number;
    outrosCreditosCpo66: number;
    estornoDebitosCpo73: number;
    saldoCredorPeriodoAnterior: number;
    saldoDevedorApurado: number;
    saldoCredorTransportar: number;
    deducoesIncentivosCpo90: number;
    compensacoesCpo98: number;
    icmsNormalRecolher: number;
    icmsStRecolher: number;
    recomposicaoAliqRecolher: number;
    totalGeralDaeBRL: number;
  };
}

export interface DeclaracaoDapiMg {
  id: string;
  empresaId: number;
  competencia: string; // AAAA-MM
  tipoDeclaracao: 'DAPI_01_NORMAL' | 'DAPI_01_SUBSTITUTA';
  numeroReciboAnterior?: string;
  inscricaoEstadualMg: string;
  regimeRecolhimento: 'DEBITO_CREDITO' | 'ISENTO_IMUNE' | 'MICROEMPRESA';
  quadro: QuadroDapiMg;
  detalhesOutrosCreditos: ItemOutroCreditoDapi[];
  codigoReceitaDae: string; // 313-1 ICMS Normal, 317-0 ICMS ST
  dataVencimentoDae: string;
  integradoContabil: boolean;
  loteContabilId?: number;
  statusTransmissao: 'DIGITACAO' | 'GERADA_MAGNETICO' | 'TRANSMITIDA_SIARE';
}

export interface ResumoDapiMg {
  empresaId: number;
  competencia: string;
  declaracaoAtual: DeclaracaoDapiMg;
  totalDebitosBRL: number;
  totalCreditosBRL: number;
  saldoIcmsRecolherBRL: number;
  saldoCredorTransportarBRL: number;
}

// --- 2. PCLD - PROVISÃO PARA CRÉDITOS DE LIQUIDAÇÃO DUVIDOSA (CPC 48 / IFRS 9 / LEI 9.430/96 / DOMÍNIO ctpcdl01.pbd) ---

export type FaixaAtrasoPcld =
  | 'EM_DIA'
  | 'ATE_30_DIAS'
  | '31_A_60_DIAS'
  | '61_A_90_DIAS'
  | '91_A_180_DIAS'
  | '181_A_360_DIAS'
  | 'SUPERIOR_360_DIAS';

export type TipoGarantiaCredito = 'SEM_GARANTIA' | 'GARANTIA_REAL_HIPOTECA' | 'AVAL_FIANCA';

export type StatusRecuperacaoCredito =
  | 'EM_COBRANCA_ADMINISTRATIVA'
  | 'EM_COBRANCA_JUDICIAL'
  | 'FALENCIA_RECUPERACAO_JUDICIAL'
  | 'BAIXADO_PERDA_DEFINITIVA'
  | 'RECUPERADO';

export type EnquadramentoFiscalLei9430 =
  | 'DEDUTIVEL_ATE_15K_6M'
  | 'DEDUTIVEL_15K_A_100K_1ANO'
  | 'DEDUTIVEL_MAIOR_100K_JUDICIAL'
  | 'INDEDUTIVEL_TEMPORARIO_LALUR';

export interface ItemContaReceberPcld {
  id: string;
  empresaId: number;
  clienteNomeRazaoSocial: string;
  clienteCpfCnpj: string;
  numeroTituloNfe: string;
  dataEmissao: string;
  dataVencimento: string;
  diasAtraso: number;
  faixaAtraso: FaixaAtrasoPcld;
  valorNominalBRL: number;
  tipoGarantia: TipoGarantiaCredito;
  statusCobranca: StatusRecuperacaoCredito;
  percentualPerdaEsperadaCpc48: number;
  valorProvisaoContabilBRL: number;
  enquadramentoFiscal: EnquadramentoFiscalLei9430;
  valorDedutivelFiscalBRL: number;
  valorIndedutivelLalurParteABRL: number;
  observacoes?: string;
}

export interface ApuracaoPcldPeriodo {
  id: string;
  empresaId: number;
  periodoCompetencia: string;
  totalCarteiraReceberBRL: number;
  totalProvisaoContabilCpc48BRL: number;
  totalPerdasDedutiveisFiscaisBRL: number;
  totalAdicaoLalurIndedutivelBRL: number;
  dataApuracao: string;
  integradoContabil: boolean;
  loteContabilId?: number;
  itens: ItemContaReceberPcld[];
}

export interface ResumoPcld {
  empresaId: number;
  periodoCompetencia: string;
  apuracao: ApuracaoPcldPeriodo;
  indiceInadimplenciaGeralPercent: number;
}

// --- 3. DCTF MENSAL TRADICIONAL (IN RFB nº 2.005/2021 & IN RFB nº 1.599/2015 / DOMÍNIO esf02.pbd / esr17.pbd) ---

export type FormaTributacaoLucroDctf =
  | 'LUCRO_REAL_ESTIMATIVA'
  | 'LUCRO_REAL_TRIMESTRAL'
  | 'LUCRO_PRESUMIDO'
  | 'LUCRO_ARBITRADO'
  | 'IMUNE_ISENTA';

export type QualificacaoPjDctf = 'PJ_GERAL' | 'FINANCEIRA' | 'SOCIEDADE_CORRETORA' | 'SEGUROS_PREVIDENCIA';

export type SituacaoEspecialDctf =
  | 'NORMAL'
  | 'EXTINCAO'
  | 'FUSAO'
  | 'INCORPORACAO_INCORPORADA'
  | 'INCORPORACAO_INCORPORADORA'
  | 'CISAO_TOTAL'
  | 'CISAO_PARCIAL';

export type TipoTributoDctf =
  | 'IRPJ'
  | 'CSLL'
  | 'PIS_PASEP'
  | 'COFINS'
  | 'IPI'
  | 'IRRF'
  | 'CIDE'
  | 'IOF'
  | 'RET_PAGTO_UNIFICADO';

export interface DebitoApuradoDctf {
  id: string;
  tributo: TipoTributoDctf;
  codigoReceita: string; // Ex: 2089, 2372, 5856, 2172, 0473, 1708, 8741
  descricaoTributo: string;
  periodicidade: 'MENSAL' | 'TRIMESTRAL';
  periodoApuracao: string;
  dataVencimento: string;
  valorPrincipalDevidoBRL: number;
  pagamentosDarf: {
    dataPagamento: string;
    quota?: number;
    valorPagoBRL: number;
    darfAutenticacaoBancaria?: string;
  }[];
  compensacoesDcomp: {
    numeroDcomp: string;
    dataTransmissao: string;
    valorCompensadoBRL: number;
  }[];
  suspensaoJudicial: {
    numeroProcesso: string;
    varaJudicial: string;
    valorSuspensoBRL: number;
  }[];
  saldoDevedorRemanescenteBRL: number;
}

export interface DeclaracaoDctfMensal {
  id: string;
  empresaId: number;
  competencia: string; // AAAA-MM
  tipoDeclaracao: 'ORIGINAL' | 'RETIFICADORA';
  reciboEntregaAnterior?: string;
  formaTributacao: FormaTributacaoLucroDctf;
  qualificacaoPj: QualificacaoPjDctf;
  situacaoEspecial: SituacaoEspecialDctf;
  possuiScp: boolean;
  levantouBalancoSuspensao: boolean;
  debitos: DebitoApuradoDctf[];
  totalDebitosDeclaradosBRL: number;
  totalPagamentosDarfBRL: number;
  totalCompensacoesDcompBRL: number;
  totalSuspensaoJudicialBRL: number;
  saldoTotalPagarBRL: number;
  statusTransmissao: 'DIGITACAO' | 'VALIDADO_PVA' | 'TRANSMITIDO_RECIBO';
  reciboTransmissao?: string;
}

export interface ResumoDctfMensal {
  empresaId: number;
  competencia: string;
  declaracao: DeclaracaoDctfMensal;
}

// ==========================================
// SPRINT 51 - TIPOS & SCHEMAS OFICIAIS
// ==========================================

// --- 1. eSocial S-1200 & S-1210 (Folha de Pagamento) ---
export type TipoAmbienteESocial = 1 | 2; // 1 - Produção | 2 - Produção Restrita / Homologação
export type TipoInscricaoEmpregador = 1 | 2; // 1 - CNPJ | 2 - CPF

export interface RubricaFolhaItem {
  id: string;
  codRubr: string;
  ideTabRubr: string;
  descricao: string;
  tipoRubrica: '1 - Vencimento' | '2 - Desconto' | '3 - Informativa' | '4 - Informativa Dedutora';
  tpIncCP: string; // 11-Mensal, 12-13º, 00-Não é base
  tpIncIRRF: string; // 11-Remuneração mensal, 12-13º, 31-Férias, 00-Sem retenção
  tpIncFGTS: string; // 11-Base FGTS mensal, 12-Base FGTS 13º, 00-Não é base
  qtdRubr: number;
  fatorRubr: number;
  vrRubr: number;
}

export interface DemonstrativoDevValores {
  ideDmDev: string;
  codCateg: number; // 101 - Empregado Geral, 721 - Contribuinte Individual / Pró-Labore
  cbo: string;
  matricula: string;
  cargo: string;
  remunPerApur: RubricaFolhaItem[];
  totalVencimentos: number;
  totalDescontos: number;
  valorLiquido: number;
  baseCalculoInss: number;
  valorInssRetido: number;
  baseCalculoIrrf: number;
  valorIrrfRetido: number;
  baseCalculoFgts: number;
  valorFgts: number;
}

export interface EventoRemuneracaoS1200 {
  id: string;
  empresaId: number;
  colaboradorId: number;
  cpfTrabalhador: string;
  nomeTrabalhador: string;
  competencia: string; // AAAA-MM
  tipoInscricao: TipoInscricaoEmpregador;
  numeroInscricao: string;
  tipoAmbiente: TipoAmbienteESocial;
  indRetificacao: 1 | 2; // 1-Original, 2-Retificador
  nrReciboRetificado?: string;
  demonstrativos: DemonstrativoDevValores[];
  status: 'RASCUNHO' | 'GERADO_XML' | 'ASSINADO_ICP' | 'TRANSMITIDO' | 'ERRO_SCHEMA';
  reciboTransmissao?: string;
  dataTransmissao?: string;
  xmlConteudo?: string;
}

export interface EventoPagamentoS1210 {
  id: string;
  empresaId: number;
  colaboradorId: number;
  cpfBeneficiario: string;
  nomeBeneficiario: string;
  dataPagamento: string;
  tipoPagamento: '1 - Folha Mensal' | '2 - Férias' | '3 - 13º Salário' | '4 - Rescisão';
  periodoReferencia: string; // AAAA-MM
  ideDmDev: string;
  valorLiquidoPago: number;
  status: 'RASCUNHO' | 'GERADO_XML' | 'TRANSMITIDO';
  reciboTransmissao?: string;
  dataTransmissao?: string;
  xmlConteudo?: string;
}

export interface ResumoESocialS1200S1210 {
  empresaId: number;
  competencia: string;
  eventosS1200: EventoRemuneracaoS1200[];
  eventosS1210: EventoPagamentoS1210[];
  totalColaboradores: number;
  totalFolhaBruta: number;
  totalInssRetido: number;
  totalIrrfRetido: number;
  totalFgts: number;
  totalLiquido: number;
}

// --- 2. ECD Bloco J - Demonstrações Contábeis Regulatórias (Contabilidade) ---
export type TipoDemonstracaoEcd = 'J100_BALANCO' | 'J150_DRE' | 'J210_DMPL' | 'J800_NOTAS';
export type IndicadorNaturezaContaEcd = '01 - Ativo' | '02 - Passivo' | '03 - Patrimônio Líquido' | '04 - Resultado' | '05 - Compensação';

export interface RegistroJ100Balanco {
  id: string;
  codigoAglutinacao: string; // Ex: '1.01', '1.01.01.001'
  nivel: number;
  tipoConta: 'S' | 'A'; // S - Sintética, A - Analítica
  descricao: string;
  valorSaldoInicial: number;
  indicadorDcInicial: 'D' | 'C';
  valorSaldoFinal: number;
  indicadorDcFinal: 'D' | 'C';
  notaExplicativaRef?: string;
}

export interface RegistroJ150Dre {
  id: string;
  codigoAglutinacao: string;
  nivel: number;
  tipoConta: 'S' | 'A';
  descricao: string;
  valorSaldoInicial: number;
  indicadorDcInicial: 'D' | 'C';
  valorSaldoFinal: number;
  indicadorDcFinal: 'D' | 'C';
  indicadorGrupoDRE: 'RECEITA_BRUTA' | 'DEDUCOES' | 'CUSTOS' | 'DESPESAS_OPERACIONAIS' | 'RESULTADO_FINANCEIRO' | 'OUTRAS' | 'TRIBUTOS_LUCRO' | 'LUCRO_LIQUIDO';
}

export interface RegistroJ210Dmpl {
  id: string;
  codigoAglutinacao: string;
  descricaoFato: string;
  saldoInicial: number;
  aumentosCapital: number;
  lucroPrejuizoPeriodo: number;
  distribuicaoDividendos: number;
  constituicaoReservas: number;
  saldoFinal: number;
}

export interface RegistroJ930Signatario {
  id: string;
  nome: string;
  cpf: string;
  qualificacao: '900 - Contador' | '206 - Diretor' | '207 - Administrador' | '309 - Procurador';
  numeroInscricaoCrc?: string;
  ufCrc?: string;
  email: string;
  telefone: string;
}

export interface DeclaracaoEcdBlocoJ {
  id: string;
  empresaId: number;
  anoCalendario: number;
  dataInicioPeriodo: string;
  dataFimPeriodo: string;
  identificadorDemonstracao: string; // '1 - Balanço Geral Anual / DRE'
  cabecalhoJ005Descricao: string;
  linhasJ100: RegistroJ100Balanco[];
  linhasJ150: RegistroJ150Dre[];
  linhasJ210: RegistroJ210Dmpl[];
  signatariosJ930: RegistroJ930Signatario[];
  termoEncerramentoJ900: string;
  totalLinhasBlocoJ: number;
  statusValidacao: 'CONFORME' | 'DIVERGENCIA_BALANCO' | 'ASSINADO';
  reciboEntregaEcd?: string;
}

export interface ResumoEcdBlocoJ {
  declaracao: DeclaracaoEcdBlocoJ;
  totalAtivo: number;
  totalPassivoPl: number;
  diferencaAtivoPassivo: number;
  resultadoLiquidoExercicio: number;
}

// --- 3. Apuração do IPI & Selos de Controle (Escrita Fiscal) ---
export type TipoProdutoSeloIpi = 'BEBIDAS_QUENTES_WHISKY' | 'BEBIDAS_VODKA_CACHACA' | 'CIGARROS_CIGARRILHAS' | 'VINHOS_ESPECIAIS';
export type TipoMovimentacaoSelo = 'ENTRADA_REQUISICAO_RFB' | 'SAIDA_APLICACAO_PRODUCAO' | 'PERDA_AVARIA_QUEBRA' | 'DEVOLUCAO_INUTILIZACAO';

export interface MovimentoSeloControle {
  id: string;
  data: string;
  tipoMovimentacao: TipoMovimentacaoSelo;
  numeroDocumentoGuia: string;
  serieSelo: string;
  numeroInicial: number;
  numeroFinal: number;
  quantidade: number;
  observacoes: string;
}

export interface ItemSeloControle {
  id: string;
  empresaId: number;
  codigoProduto: string;
  descricao: string;
  corSelo: string;
  tipoProduto: TipoProdutoSeloIpi;
  saldoInicial: number;
  entradasMes: number;
  saidasAplicacao: number;
  perdasAvarias: number;
  saldoFinal: number;
  movimentacoes: MovimentoSeloControle[];
}

export interface ItemLivroIpiModelo8 {
  id: string;
  natureza: 'DEBITO' | 'CREDITO';
  codigoAjuste: string; // '001', '002', '101', etc.
  descricao: string;
  baseCalculo: number;
  aliquota: number;
  valorIpi: number;
  origem: 'NOTAS_SAIDA' | 'NOTAS_ENTRADA' | 'ESTORNO' | 'OUTROS_CREDITOS_RESSARCIMENTO';
}

export interface ApuracaoIpiModelo8 {
  id: string;
  empresaId: number;
  competencia: string; // AAAA-MM
  periodoApuracao: 'MENSAL' | 'DECENDIAL';
  numeroLivro: number;
  folhaInicial: number;
  folhaFinal: number;
  dataUltimoLancamento: string;
  totalDebitosSaidas: number;
  outrosDebitos: number;
  estornoCreditos: number;
  totalGeralDebitos: number;
  totalCreditosEntradas: number;
  outrosCreditos: number;
  estornoDebitos: number;
  saldoCredorAnterior: number;
  totalGeralCreditos: number;
  saldoDevedorRecolher: number;
  saldoCredorTransportar: number;
  codigoReceitaDarf: string; // '5123' ou '5110'
  vencimentoDarf: string;
  dataEncerramento: string;
  status: 'ABERTA' | 'FECHADA_LIVRO_GERADO' | 'INTEGRADA_CONTABILIDADE';
  itens: ItemLivroIpiModelo8[];
}

export interface ResumoApuracaoIpiSelos {
  empresaId: number;
  competencia: string;
  apuracao: ApuracaoIpiModelo8;
  selos: ItemSeloControle[];
  totalSelosDisponiveis: number;
  totalSelosAplicados: number;
  totalAvarias: number;
}

// ============================================================================
// SPRINT 52: eSocial SST (S-2220 / S-2240) - SAÚDE E SEGURANÇA DO TRABALHO
// Conforme Portaria Conjunta MTP/RFB nº 02/2021, NR-07, NR-09, IN INSS nº 128/2022
// e Schemas Oficiais evtMonit.xsd & evtExpRisco.xsd (v_S_01_03_00)
// ============================================================================

export type TipoExameOcupacionalS2220 =
  | '0_ADMISSIONAL'
  | '1_PERIODICO'
  | '2_RETORNO_TRABALHO'
  | '3_MUDANCA_RISCO'
  | '4_MONITORACAO_PONTUAL'
  | '9_DEMISSIONAL';

export type ResultadoAso =
  | '1_APTO'
  | '2_INAPTO'
  | '3_APTO_COM_RESTRICAO';

export type TipoExameComplementar = '1_INICIAL' | '2_SEQUENCIAL';
export type ResultadoExameComplementar = '1_NORMAL' | '2_ALTERADO' | '3_ESTAVEL' | '4_AGRAVAMENTO';

export interface ItemExameComplementarAso {
  codigoProcedimento: string; // Tabela 27 do eSocial (ex: '0295' Audiometria, '0634' Espirometria, '1177' Hemograma)
  descricaoProcedimento: string;
  dataExame: string;
  ordemExame: TipoExameComplementar;
  resultado: ResultadoExameComplementar;
}

export interface EventoAsoS2220 {
  id: string;
  empresaId: number;
  trabalhadorCpf: string;
  trabalhadorNome: string;
  matricula: string;
  cargoDescricao: string;
  tipoExame: TipoExameOcupacionalS2220;
  dataAso: string;
  resultadoAso: ResultadoAso;
  medicoExaminador: {
    nome: string;
    crm: string;
    ufCrm: string;
    cpf?: string;
  };
  medicoCoordenadorPcmso: {
    nome: string;
    crm: string;
    ufCrm: string;
  };
  examesComplementares: ItemExameComplementarAso[];
  observacoesRestricao?: string;
  xmlGerado?: string;
  statusEnvio: 'PENDENTE' | 'ASSINADO' | 'TRANSMITIDO' | 'VALIDADO_RETORNO';
  numeroReciboESocial?: string;
}

export interface ItemEpiSst {
  caEpi: string; // Certificado de Aprovação do MTE
  descricao: string;
  eficaz: boolean;
  periodicidadeTroca: string;
  higienizacaoAdequada: boolean;
}

export interface ItemAgenteNocivoRisco {
  id: string;
  codigoAgente: string; // Tabela 24 do eSocial (ex: '01.01.001', '02.01.001', '05.01.001')
  descricaoAgente: string;
  tipoAgente: 'FISICO' | 'QUIMICO' | 'BIOLOGICO' | 'ERGONOMICO' | 'MECANICO_ACIDENTE' | 'AUSENCIA_RISCO';
  tipoAvaliacao: 'QUANTITATIVA' | 'QUALITATIVA';
  intensidadeConcentracao?: number;
  unidadeMedida?: string; // ex: 'dB(A)', 'mg/m3', 'ppm'
  limiteTolerancia?: number;
  tecnicaMedicao?: string; // ex: 'NHO-01 Fundacentro', 'Dosimetria'
  utilizaEpc: boolean;
  epcEficaz: boolean;
  utilizaEpi: boolean;
  epis: ItemEpiSst[];
}

export interface EventoCondicaoAmbientalS2240 {
  id: string;
  empresaId: number;
  trabalhadorCpf: string;
  trabalhadorNome: string;
  matricula: string;
  cargoDescricao: string;
  setorLotacao: string;
  cbo: string;
  dataInicioCondicao: string;
  dataFimCondicao?: string;
  descricaoAmbienteTrabalho: string;
  descricaoAtividadesExecutadas: string;
  codigoOcorrenciaGfip: string; // '' (Sem aposentadoria especial), '02' (15 anos), '03' (20 anos), '04' (25 anos)
  agentesNocivos: ItemAgenteNocivoRisco[];
  responsavelRegistros: {
    nome: string;
    registroProfissional: string;
    tipoRegistro: 'CRM' | 'CREA';
    ufRegistro: string;
    cpf: string;
  };
  xmlGerado?: string;
  statusEnvio: 'PENDENTE' | 'ASSINADO' | 'TRANSMITIDO' | 'VALIDADO_RETORNO';
  numeroReciboESocial?: string;
}

export interface ResumoSstESocial {
  empresaId: number;
  competencia: string;
  asos: EventoAsoS2220[];
  condicoesAmbientais: EventoCondicaoAmbientalS2240[];
  totalAsosRegistrados: number;
  totalLaudosAmbientais: number;
  totalExpostosRiscoEspecial: number;
  totalSemRisco: number;
}

// ============================================================================
// SPRINT 52: SPED FISCAL BLOCO D - SERVIÇOS DE TRANSPORTE E COMUNICAÇÃO
// Conforme Guia Prático da EFD ICMS/IPI v3.1.6, Ajuste SINIEF 02/2009
// e Módulo Domínio Escrita esr45.pbd / esf21.pbd (Reg. D100, D110, D120, D190, D500)
// ============================================================================

export type TipoOperacaoTransporte = '0_ENTRADA_TOMADOR' | '1_SAIDA_PRESTADOR';
export type TipoEmitenteTransporte = '0_EMISSAO_PROPRIA' | '1_TERCEIROS';

export type ModeloDocumentoTransporte =
  | '07_NOTA_FISCAL_SERVICO_TRANSPORTE'
  | '08_CONHECIMENTO_RODOVIARIO'
  | '09_CONHECIMENTO_AQUAVIARIO'
  | '10_CONHECIMENTO_AEREO'
  | '11_CONHECIMENTO_FERROVIARIO'
  | '26_CONHECIMENTO_MULTIMODAL'
  | '57_CTE_ELETRONICO'
  | '67_CTE_OS_OUTROS_SERVICOS'
  | '21_SERVICO_COMUNICACAO'
  | '22_SERVICO_TELECOMUNICACAO';

export type TipoFreteCte = '0_CIF_REMETENTE' | '1_FOB_DESTINATARIO' | '2_TERCEIROS' | '9_SEM_FRETE';
export type SituacaoDocumentoFiscalD100 = '00_REGULAR' | '02_CANCELADO' | '04_DENEGADO' | '05_INUTILIZADO';

export interface ItemRegistroD110 {
  numeroItem: number;
  codigoItemServico: string;
  descricaoItem: string;
  valorServico: number;
  valorOutrosEncargos: number;
  valorPedagio: number;
  valorSeguro: number;
}

export interface ItemAnaliticoRegistroD190 {
  cstIcms: string; // '00', '20', '40', '60', '90'
  cfop: string; // '1352', '2352', '5352', '6352'
  aliquotaIcms: number; // 12, 18, 7, 0
  valorOperacao: number;
  baseCalculoIcms: number;
  valorIcms: number;
  valorOutrasDespesas: number;
}

export interface DocumentoTransporteD100 {
  id: string;
  empresaId: number;
  tipoOperacao: TipoOperacaoTransporte;
  tipoEmitente: TipoEmitenteTransporte;
  modelo: ModeloDocumentoTransporte;
  situacao: SituacaoDocumentoFiscalD100;
  serie: string;
  subserie?: string;
  numeroDocumento: string;
  chaveCte: string;
  dataEmissao: string;
  dataAquisicaoPrestacao: string;
  tipoCte: '0_NORMAL' | '1_COMPLEMENTO' | '2_ANULACAO' | '3_SUBSTITUTO';
  chaveCteReferenciada?: string;
  tipoFrete: TipoFreteCte;
  participanteCnpjCpf: string;
  participanteRazaoSocial: string;
  participanteUf: string;
  municipioOrigem: { codigoIbge: string; nome: string; uf: string }; // D120
  municipioDestino: { codigoIbge: string; nome: string; uf: string }; // D120
  veiculo?: { placa: string; uf: string }; // D130
  valorTotalDocumento: number;
  valorDesconto: number;
  valorServico: number;
  baseCalculoIcms: number;
  aliquotaIcms: number;
  valorIcms: number;
  valorNaoTributado: number;
  itensD110: ItemRegistroD110[];
  analiticoD190: ItemAnaliticoRegistroD190[];
}

export interface DocumentoComunicacaoD500 {
  id: string;
  empresaId: number;
  tipoOperacao: '0_ENTRADA' | '1_SAIDA';
  modelo: '21_COMUNICACAO' | '22_TELECOMUNICACAO';
  situacao: SituacaoDocumentoFiscalD100;
  serie: string;
  numeroDocumento: string;
  dataEmissao: string;
  dataPrestacao: string;
  participanteCnpjCpf: string;
  participanteRazaoSocial: string;
  participanteUf: string;
  valorTotalDocumento: number;
  valorDesconto: number;
  valorServicos: number;
  baseCalculoIcms: number;
  valorIcms: number;
  valorPis: number;
  valorCofins: number;
  cfop: string;
  cstIcms: string;
  aliquotaIcms: number;
}

export interface ResumoSpedBlocoD {
  empresaId: number;
  competencia: string; // AAAA-MM
  documentosTransporte: DocumentoTransporteD100[];
  documentosComunicacao: DocumentoComunicacaoD500[];
  totalTransporteEntradasBRL: number;
  totalCreditoIcmsTransporteBRL: number;
  totalTransporteSaidasBRL: number;
  totalDebitoIcmsTransporteBRL: number;
  totalComunicacaoTomadaBRL: number;
  totalCreditoIcmsComunicacaoBRL: number;
  saldoIcmsBlocoDBRL: number;
}

// ============================================================================
// SPRINT 52: EQUIVALÊNCIA PATRIMONIAL AVANÇADA & MAIS-VALIA (CPC 15 / CPC 18)
// Conforme Lei nº 6.404/76 arts. 248-250, Lei nº 12.973/14, RIR/2018 arts. 416-425
// e Domínio Contábil / LALUR ctc04.pbd / ctc05.pbd
// ============================================================================

export type TipoInvestimentoMep = 'COLIGADA' | 'CONTROLADA' | 'JOINT_VENTURE_CONJUNTA';

export interface InvestimentoParticipacaoMep {
  id: string;
  empresaId: number; // Investidora
  investidaRazaoSocial: string;
  investidaCnpj: string;
  investidaPais: string;
  tipoInvestimento: TipoInvestimentoMep;
  percentualCapitalTotal: number;
  percentualCapitalVotante: number;
  dataAquisicao: string;
  custoTotalAquisicaoBRL: number;
  plInvestidaNaAquisicaoBRL: number;
  fracaoPlAdquiridaBRL: number; // plInvestidaNaAquisicao * %
  maisValiaAtivosIdentificaveisBRL: number; // PPA a Fair value
  goodwillRentabilidadeFuturaBRL: number; // Ágio residual
  ganhoCompraVantajosaBRL: number; // Deságio bargain purchase
  contaContabilInvestimentoPl: string; // Ex: 1.03.01.01.001
  contaContabilMaisValia: string; // Ex: 1.03.01.02.001
  contaContabilGoodwill: string; // Ex: 1.03.01.03.001
}

export interface ApuracaoPeriodicaMep {
  id: string;
  investimentoId: string;
  empresaId: number;
  competencia: string; // AAAA-MM ou AAAA
  patrimonioLiquidoPeriodoInvestidaBRL: number;
  lucroPrejuizoLiquidoInvestidaBRL: number;
  lucrosNaoRealizadosIntercompanyBRL: number; // Dedução de estoques não realizados com terceiros
  outrosResultadosAbrangentesInvestidaBRL: number; // ORA / Variação Cambial
  baseCalculoMepBRL: number; // (Lucro/Prej - LucrosNãoRealizados)
  resultadoMepCalculadoBRL: number; // baseCalculoMep * %
  tipoResultadoMep: 'RECEITA_MEP_POSITIVA' | 'DESPESA_MEP_NEGATIVA';
  amortizacaoMaisValiaPeriodoBRL: number; // Depreciação econômica da mais-valia
  ajusteImpairmentGoodwillBRL: number; // Teste CPC 01
  dividendosDistribuidosPeriodoBRL: number; // Redução do custo do investimento
  saldoContabilInvestimentoFinalBRL: number;
  ajusteLalurParteA: {
    tipo: 'EXCLUSAO_RECEITA_MEP' | 'ADICAO_PERDA_MEP';
    valor: number;
    codigoLalur: string; // Linha ECF / LALUR
  };
  controleLalurParteB: {
    contaSubcontaMaisValia: string;
    saldoMaisValiaBRL: number;
    saldoGoodwillBRL: number;
  };
  statusIntegracao: 'CALCULADO' | 'INTEGRADO_CONTABIL' | 'INTEGRADO_LALUR';
  dataProcessamento: string;
}

export interface ResumoMepMaisValia {
  empresaId: number;
  exercicio: string;
  investimentos: InvestimentoParticipacaoMep[];
  apuracoes: ApuracaoPeriodicaMep[];
  totalInvestimentosAtivoBRL: number;
  totalReceitaMepPeriodoBRL: number;
  totalDespesaMepPeriodoBRL: number;
  totalAmortizacaoMaisValiaBRL: number;
  impactoLalurParteAExclusoesBRL: number;
  impactoLalurParteAAdicoesBRL: number;
}

// ============================================================================
// SPRINT 53: eSocial S-2210 - COMUNICAÇÃO DE ACIDENTE DE TRABALHO (CAT)
// Conforme Portaria SEPRT nº 4.334/2021, Lei 8.213/91 art. 22 e evtCAT.xsd (v_S_01_03_00)
// ============================================================================

export type TipoAcidenteTrabalho = '1_TIPICO' | '2_DOENCA' | '3_TRAJETO';
export type TipoCatESocial = '1_INICIAL' | '2_REABERTURA' | '3_OBITO';
export type IniciativaCat = '1_EMPREGADOR' | '2_ORDEM_JUDICIAL' | '3_DETERMINACAO_FISCAL';
export type TipoLocalAcidente = '1_ESTABELECIMENTO_EMPREGADOR' | '2_TERCEIROS' | '3_VIA_PUBLICA' | '4_AREA_RURAL' | '5_EMBARCACAO' | '9_OUTROS';
export type LateralidadeParteAtingida = '0_NAO_APLICAVEL' | '1_ESQUERDA' | '2_DIREITA' | '3_AMBAS';

export interface EventoCatS2210 {
  id: string;
  empresaId: number;
  trabalhadorCpf: string;
  trabalhadorNome: string;
  matricula: string;
  cargoDescricao: string;
  dataAcidente: string;
  horaAcidente: string; // HH:MM
  horasTrabalhadasAntesAcidente: string; // HH:MM
  tipoAcidente: TipoAcidenteTrabalho;
  tipoCat: TipoCatESocial;
  houveObito: boolean;
  dataObito?: string;
  comunicouPolicia: boolean;
  codigoSituacaoGeradora: string; // Tabela 15 eSocial
  descricaoSituacaoGeradora: string;
  iniciativa: IniciativaCat;
  localAcidente: {
    tipoLocal: TipoLocalAcidente;
    nomeLocal: string;
    logradouro: string;
    numero: string;
    bairro: string;
    cep: string;
    municipio: string;
    uf: string;
  };
  parteAtingida: {
    codigo: string; // Tabela 13 eSocial
    descricao: string;
    lateralidade: LateralidadeParteAtingida;
  };
  agenteCausador: {
    codigo: string; // Tabela 14/15 eSocial
    descricao: string;
  };
  atestadoMedico: {
    dataAtendimento: string;
    horaAtendimento: string;
    houveInternacao: boolean;
    diasAfastamentoProvaveis: number;
    houveAfastamento: boolean;
    naturezaLesao: string; // Tabela 17 eSocial
    codigoCid10: string; // Ex: 'S61.0'
    descricaoDiagnostico: string;
    medico: {
      nome: string;
      crm: string;
      ufCrm: string;
    };
  };
  catOrigemNumeroRecibo?: string;
  xmlGerado?: string;
  statusEnvio: 'PENDENTE' | 'ASSINADO' | 'TRANSMITIDO' | 'VALIDADO_RETORNO';
  numeroReciboESocial?: string;
}

export interface ResumoCatESocial {
  empresaId: number;
  competencia: string;
  cats: EventoCatS2210[];
  totalCats: number;
  totalAcidentesTipicos: number;
  totalAcidentesTrajeto: number;
  totalDoencasTrabalho: number;
  totalComAfastamento: number;
}

// ============================================================================
// SPRINT 53: SPED CONTRIBUIÇÕES BLOCO 1 - PROCESSOS & EXCLUSÃO ICMS (TEMA 69 STF)
// Conforme IN RFB nº 1.252/2012, Guia EFD-Contribuições v1.35 e Domínio esr45.pbd
// ============================================================================

export type TipoProcessoSped = '1_JUSTICA_FEDERAL' | '2_JUSTICA_ESTADUAL' | '3_SECEX_SRF' | '9_OUTROS';

export interface ProcessoReferenciado1010 {
  id: string;
  empresaId: number;
  numeroProcesso: string; // Ex: '5001234-88.2023.4.01.3800'
  tipoProcesso: TipoProcessoSped;
  secaoJudiciaria: string; // Vara / Tribunal
  vara: string;
  dataSentencaDespacho: string;
  naturezaAcao: string;
  statusProcesso: 'TRANSITADO_JULGADO' | 'LIMINAR_DEFERIDA' | 'EM_ANDAMENTO';
}

export interface DetalhamentoOperacaoProcesso1011 {
  id: string;
  processoId: string;
  empresaId: number;
  competencia: string; // AAAA-MM
  numeroDocumento: string;
  chaveNfe: string;
  dataEmissao: string;
  cfop: string;
  cstPisCofins: string;
  valorTotalOperacao: number;
  valorIcmsDestacadoExcluido: number; // Exclusão Tema 69 STF
  baseCalculoLiquidaPisCofins: number; // Base líquida
  aliquotaPis: number; // 1.65%
  aliquotaCofins: number; // 7.60%
  valorPisApurado: number;
  valorCofinsApurado: number;
  economiaTributariaPeriodo: number; // (ICMS excluído * 9.25%)
}

export interface ControleCreditoPisCofins1100_1500 {
  id: string;
  empresaId: number;
  periodoGeracao: string; // AAAA-MM
  tributo: 'PIS' | 'COFINS';
  origemCredito: '01_PROPRIO' | '02_TRANSFERIDO_FUSAO_CISAO';
  valorCreditoDisponivel: number;
  valorCreditoUtilizadoDesconto: number;
  valorCreditoUtilizadoCompensacao: number;
  saldoCreditoTransportar: number;
}

export interface ResumoSpedContribuicoesBloco1 {
  empresaId: number;
  competencia: string;
  processos: ProcessoReferenciado1010[];
  operacoesDetalhadas: DetalhamentoOperacaoProcesso1011[];
  creditosPis1100: ControleCreditoPisCofins1100_1500[];
  creditosCofins1500: ControleCreditoPisCofins1100_1500[];
  totalExclusaoIcmsBRL: number;
  totalEconomiaPisCofinsBRL: number;
  totalCreditosDisponiveisBRL: number;
}

// ============================================================================
// SPRINT 53: CONSOLIDAÇÃO DE DEMONSTRAÇÕES CONTÁBEIS (CPC 36 R3 / LEI 6.404)
// Pronunciamento Técnico CPC 36 (R3), NBC TG 36, Art. 249 Lei 6.404/76 e Domínio ctr07.pbd
// ============================================================================

export interface EmpresaGrupoConsolidacao {
  empresaId: number;
  razaoSocial: string;
  cnpj: string;
  papel: 'CONTROLADORA_MATRIZ' | 'CONTROLADA_SUBSIDIARIA';
  percentualParticipacao: number;
}

export type TipoEliminacaoConsolidacao =
  | '1_SALDO_RECIPROCO_MUTUO'
  | '2_SALDO_RECIPROCO_CLIENTES_FORNECEDORES'
  | '3_RECEITA_DESPESA_RECIPROCA'
  | '4_LUCRO_NAO_REALIZADO_ESTOQUE'
  | '5_INVESTIMENTO_PL_CONTROLADA';

export interface LancamentoEliminacaoIntercompany {
  id: string;
  tipoEliminacao: TipoEliminacaoConsolidacao;
  descricao: string;
  empresaOrigemId: number;
  empresaDestinoId: number;
  contaDebitoConsolidado: string;
  contaCreditoConsolidado: string;
  valorBRL: number;
}

export interface LinhaDemonstrativoConsolidado {
  contaCodigo: string;
  contaDescricao: string;
  grupo: 'ATIVO' | 'PASSIVO' | 'PATRIMONIO_LIQUIDO' | 'RECEITA' | 'CUSTO_DESPESA';
  saldoMatrizBRL: number;
  saldoControlada1BRL: number;
  saldoControlada2BRL?: number;
  somaIndividualBRL: number;
  debitosEliminacaoBRL: number;
  creditosEliminacaoBRL: number;
  saldoConsolidadoFinalBRL: number;
}

export interface DemonstracaoConsolidadaCpc36 {
  id: string;
  empresaControladoraId: number;
  exercicio: string;
  dataConsolidacao: string;
  empresas: EmpresaGrupoConsolidacao[];
  eliminacoes: LancamentoEliminacaoIntercompany[];
  linhasBalanco: LinhaDemonstrativoConsolidado[];
  linhasDre: LinhaDemonstrativoConsolidado[];
  totalAtivoConsolidadoBRL: number;
  totalPassivoConsolidadoBRL: number;
  totalPlConsolidadoBRL: number;
  participacaoNaoControladoresBRL: number; // Minority Interest
  lucroLiquidoConsolidadoBRL: number;
  lucroAtribuivelControladoresBRL: number;
  lucroAtribuivelNaoControladoresBRL: number;
}

// ============================================================================
// SPRINT 54: eSocial S-2300 / S-2306 / S-2399 - TRABALHADORES SEM VÍNCULO (TSVE)
// Conforme MOS v. S-1.3, Portaria Conjunta SEPRT/RFB 71/2021 e Domínio fo01.pbd
// ============================================================================

export type CategoriaTrabalhadorTsve =
  | '701_AUTONOMO'
  | '721_DIRETOR_COM_FGTS'
  | '722_DIRETOR_SEM_FGTS'
  | '731_COOPERADO'
  | '901_ESTAGIARIO'
  | '902_ESTAGIARIO_COMPLEMENTAR';

export type NaturezaEstagio = 'O_OBRIGATORIO' | 'N_NAO_OBRIGATORIO';

export type NivelEstagio =
  | '1_FUNDAMENTAL'
  | '2_MEDIO'
  | '3_FORMACAO_PROFISSIONAL'
  | '4_SUPERIOR'
  | '8_ESPECIAL'
  | '9_POS_GRADUACAO';

export type MotivoTerminoTsve =
  | '01_EXONERACAO_RESCISAO'
  | '02_TERMINO_CONTRATO'
  | '03_RESCISAO_ANTECIPADA'
  | '04_FALECIMENTO'
  | '05_CONTRATACAO_EFETIVA';

export interface DadosEstagiario {
  naturezaEstagio: NaturezaEstagio;
  nivelEstagio: NivelEstagio;
  areaAtuacao: string;
  numeroApoliceSeguro: string;
  seguradoraNome: string;
  valorBolsaBRL: number;
  valorAuxilioTransporteBRL: number;
  dataPrevisaoTermino: string;
  instituicaoEnsino: {
    cnpj: string;
    razaoSocial: string;
    logradouro: string;
    numero: string;
    bairro: string;
    municipio: string;
    uf: string;
  };
  agenteIntegracao?: {
    cnpj: string;
    razaoSocial: string;
  };
  supervisorEstagio: {
    nome: string;
    cpf: string;
    cargo: string;
  };
}

export interface TrabalhadorSemVinculoS2300 {
  id: string;
  empresaId: number;
  matriculaTsve: string;
  cpf: string;
  nome: string;
  sexo: 'M' | 'F';
  dataNascimento: string;
  categoria: CategoriaTrabalhadorTsve;
  dataInicio: string;
  cargo: string;
  cbo: string;
  remuneracaoMensalBRL: number;
  dadosEstagiario?: DadosEstagiario;
  dadosAutonomo?: {
    numeroInscricaoInssPis: string;
    aliquotaInssRetencao: number; // 11%
    aliquotaIssRetencao: number; // 2% a 5%
    dadosBancarios: string;
  };
  diretorNaoEmpregado?: {
    opcaoFgts: boolean;
    dataOpcaoFgts?: string;
  };
  statusContrato: 'ATIVO' | 'ALTERADO' | 'ENCERRADO';
  dataTermino?: string;
  motivoTermino?: MotivoTerminoTsve;
  statusESocial: 'PENDENTE' | 'TRANSMITIDO' | 'VALIDADO';
  reciboESocial?: string;
  xmlS2300?: string;
  xmlS2399?: string;
}

export interface ResumoModuloTsve {
  empresaId: number;
  competencia: string;
  totalTsveAtivos: number;
  totalEstagiarios: number;
  totalAutonomosRpa: number;
  totalDiretores: number;
  totalTransmitidosESocial: number;
  trabalhadores: TrabalhadorSemVinculoS2300[];
}

// ============================================================================
// SPRINT 54: SPED ECF BLOCO P - APURAÇÃO DO LUCRO PRESUMIDO
// Conforme Manual ECF v10, IN RFB nº 2.004/2021, Lei 9.249/95 e Domínio ctr07.pbd
// ============================================================================

export type TrimestreEcf = '1T' | '2T' | '3T' | '4T';

export interface DemonstrativoLucroPresumidoEcfP {
  id: string;
  empresaId: number;
  anoExercicio: number;
  trimestre: TrimestreEcf;
  periodoDescricao: string; // Ex: '01/01/2026 a 31/03/2026'
  // Registro P200: Base IRPJ
  receitaBrutaVendasMercadorias8: number;
  basePresumidaMercadorias8: number;
  receitaBrutaServicosGerais32: number;
  basePresumidaServicos32: number;
  receitaBrutaTransportes16: number;
  basePresumidaTransportes16: number;
  outrasReceitasAcrecimosIrpj: number;
  baseCalculoTotalIrpj: number;
  // Registro P300: Apuração IRPJ
  aliquotaBasicaIrpj: number; // 15%
  impostoIrpjBasico: number;
  limiteIsencaoAdicionalIrpj: number; // 60.000,00 trimestral
  baseCalculoAdicionalIrpj: number;
  aliquotaAdicionalIrpj: number; // 10%
  adicionalIrpjDevido: number;
  irpjTotalDevido: number;
  deducoesRetencoesFonteIrpj: number;
  saldoIrpjPagar: number;
  // Registro P400: Base CSLL
  receitaBrutaComercioCsll12: number;
  basePresumidaComercio12: number;
  receitaBrutaServicosCsll32: number;
  basePresumidaServicosCsll32: number;
  outrasReceitasAcrecimosCsll: number;
  baseCalculoTotalCsll: number;
  // Registro P500: Apuração CSLL
  aliquotaGeralCsll: number; // 9%
  csllTotalDevida: number;
  deducoesRetencoesFonteCsll: number;
  saldoCsllPagar: number;
  // DARFs
  darfIrpjCodigo: '2089';
  darfCsllCodigo: '2372';
  vencimentoDarf: string;
  linhasP100Balanco: LinhaDemonstrativoConsolidado[];
  linhasP150Dre: LinhaDemonstrativoConsolidado[];
}

// ============================================================================
// SPRINT 54: EFD-REINF R-4000 (R-4010, R-4020, R-4040, R-4080)
// Conforme IN RFB nº 2.043/2021, Manual EFD-Reinf v2.1.2.1 e Domínio esr45.pbd
// ============================================================================

export type TipoRetencaoReinf4000 =
  | 'R4010_PF_PAGTO'
  | 'R4020_PJ_SERVICO'
  | 'R4040_BENEFICIARIO_NAO_IDENTIFICADO'
  | 'R4080_AUTO_RETENCAO';

export interface ItemRetencaoReinfSerieR4000 {
  id: string;
  empresaId: number;
  competencia: string; // YYYY-MM
  dataPagamentoFatoGerador: string;
  tipoEvento: TipoRetencaoReinf4000;
  naturezaRendimento: string; // Tabela 01 EFD-Reinf (Ex: '13001', '15001', '17001')
  beneficiarioCpfCnpj: string;
  beneficiarioRazaoSocial: string;
  numeroDocumentoFiscal: string;
  valorBrutoRendimentoBRL: number;
  baseCalculoRetencaoBRL: number;
  aliquotaIrrf: number;
  valorIrrfRetidoBRL: number;
  aliquotaCsll: number;
  valorCsllRetidoBRL: number;
  aliquotaPis: number;
  valorPisRetidoBRL: number;
  aliquotaCofins: number;
  valorCofinsRetidoBRL: number;
  totalRetencoesFonteBRL: number;
  codigoReceitaDarf: string; // Ex: '1708', '5952', '0588', '8045'
  statusEnvio: 'PENDENTE' | 'TRANSMITIDO' | 'FECHADO_R4099';
  reciboReinf?: string;
  xmlGerado?: string;
}

export interface ResumoReinfSerieR4000 {
  empresaId: number;
  competencia: string;
  totalEventosR4010: number;
  totalEventosR4020: number;
  totalEventosR4040: number;
  totalEventosR4080: number;
  totalRendimentosBrutosBRL: number;
  totalIrrfRetidoBRL: number;
  totalCsllRetidoBRL: number;
  totalPisRetidoBRL: number;
  totalCofinsRetidoBRL: number;
  totalGeralRetidoBRL: number;
  itens: ItemRetencaoReinfSerieR4000[];
}

// ============================================================================
// SPRINT 55: eSocial S-1260/S-1270/S-1280, SPED ECF BLOCO N & SPED FISCAL BLOCO E
// ============================================================================

// --- 1. eSocial S-1260 / S-1270 / S-1280 (Comercialização Rural Funrural, Avulsos & CPRB Proporcional) ---
export type TipoComercializacaoRuralS1260 =
  | '1_ADQUIRENTE_PJ' // Venda para PJ (retenção na fonte pelo adquirente)
  | '2_CONSUMIDOR_PF' // Venda no varejo para PF (recolhimento pelo produtor rural)
  | '3_EXPORTACAO' // Exportação direta de produtos agropecuários (isento)
  | '7_PRODUTOR_RURAL_PF' // Venda para outro produtor rural PF
  | '8_INTERMEDIARIO_PF' // Venda por intermediário PF
  | '9_PAA_ALIMENTOS'; // Programa de Aquisição de Alimentos

export interface ItemComercializacaoRuralS1260 {
  id: string;
  empresaId: number;
  competencia: string; // YYYY-MM
  tipoComercializacao: TipoComercializacaoRuralS1260;
  numeroDocumentoNf: string;
  dataEmissao: string;
  compradorNomeRazao: string;
  compradorCpfCnpj: string;
  valorBrutoProducaoBRL: number;
  aliquotaPrevidenciaFunrural: number; // 1,2% (Lei 13.606/2018)
  valorPrevidenciaFunruralBRL: number;
  aliquotaGilratRural: number; // 0,1%
  valorGilratRuralBRL: number;
  aliquotaSenarRural: number; // 0,2%
  valorSenarRuralBRL: number;
  totalContribuicaoDevidaBRL: number; // 1,5% total
  responsavelRecolhimento: 'SUB_ROGAÇÃO_ADQUIRENTE' | 'PRODUTOR_TITULAR';
  statusTransmissao: 'PENDENTE' | 'TRANSMITIDO' | 'FECHADO_S1299';
  reciboEsocial?: string;
  xmlGerado?: string;
}

export interface ItemContratacaoAvulsosS1270 {
  id: string;
  empresaId: number;
  competencia: string; // YYYY-MM
  sindicatoCnpj: string;
  sindicatoRazaoSocial: string;
  codigoTomadorCno?: string;
  valorBrutoRemuneracaoAvulsosBRL: number;
  baseCalculoPrevidenciariaBRL: number;
  aliquotaEncargosPatronais: number; // 20% CPP + RAT + Terceiros
  valorEncargoPatronalBRL: number;
  statusTransmissao: 'PENDENTE' | 'TRANSMITIDO';
}

export interface InformacoesComplementaresS1280 {
  id: string;
  empresaId: number;
  competencia: string; // YYYY-MM
  indicativoDesoneracaoCprb: '0_NAO_DESONERADA' | '1_TOTALMENTE_DESONERADA' | '2_PARCIALMENTE_DESONERADA';
  fatorProporcionalidadeReducao: number; // Ex: 0.7245 (72,45% da receita bruta é desonerada)
  receitaBrutaAtividadesDesoneradasBRL: number;
  receitaBrutaTotalEmpresaBRL: number;
  reducaoAliquotaPatronalCalculada: number; // Ex: 20% * (1 - 0.7245) = 5,51% efetiva
  indicativoAcordoInternacionalIsencao: boolean;
  statusTransmissao: 'PENDENTE' | 'TRANSMITIDO';
}

export interface ResumoEventosPeriodicosFolhaS1260S1280 {
  empresaId: number;
  competencia: string;
  rural: ItemComercializacaoRuralS1260[];
  avulsos: ItemContratacaoAvulsosS1270[];
  infoComplementar: InformacoesComplementaresS1280;
  totalValorProducaoRuralBRL: number;
  totalFunruralRecolherBRL: number;
  totalRemuneracaoAvulsosBRL: number;
  totalEncargosAvulsosBRL: number;
}

// --- 2. SPED ECF Bloco N - Cálculo do IRPJ e da CSLL (Lucro Real Anual / Trimestral) ---
export type FormaApuracaoLucroReal = 'TRIMESTRAL' | 'ANUAL_ESTIMATIVA_MENSAL';

export interface DemonstrativoLucroRealEcfBlocoN {
  id: string;
  empresaId: number;
  anoExercicio: number;
  periodoApuracao: '1T' | '2T' | '3T' | '4T' | 'ANUAL_DEZ';
  formaTributacao: FormaApuracaoLucroReal;

  // REGISTRO N500 / N600 - IRPJ LUCRO REAL
  lucroLiquidoAntesTributosBRL: number;
  totalAdicoesLalurBRL: number;
  totalExclusoesLalurBRL: number;
  lucroRealAntesPrejuizosBRL: number;
  compensacaoPrejuizosFiscaisTrava30BRL: number; // Máximo 30% do lucro real
  baseCalculoEfetivaIrpjBRL: number;
  aliquotaBaseIrpj: number; // 15%
  valorIrpjBaseBRL: number;
  limiteIsencaoAdicionalBRL: number; // R$ 60.000 no trimestre ou R$ 240.000 no ano
  baseCalculoAdicionalIrpjBRL: number;
  aliquotaAdicionalIrpj: number; // 10%
  valorAdicionalIrpjBRL: number;
  totalIrpjApuradoBRL: number; // Base + Adicional

  // Deduções e Incentivos Fiscais IRPJ (N600)
  deducaoPatAlimentacaoBRL: number; // Lei 6.321/76
  deducaoLeiRouanetBRL: number; // Lei 8.313/91
  deducaoAudiovisualBRL: number; // Lei 8.685/93
  totalIncentivosFiscaisBRL: number;
  irpjRetidoFonteBRL: number; // IRRF s/ aplicações financeiras e serviços
  irpjPagoEstimativasMensaisBRL: number; // Valores recolhidos no decorrer do ano
  saldoIrpjRecolherBRL: number;
  saldoNegativoIrpjCompensarBRL: number;

  // REGISTRO N650 / N660 - CSLL LUCRO REAL
  resultadoContabilAntesCsllBRL: number;
  totalAdicoesLacsBRL: number;
  totalExclusoesLacsBRL: number;
  baseCsllAntesCompensacaoBRL: number;
  compensacaoBaseNegativaCsllTrava30BRL: number; // Máximo 30%
  baseCalculoEfetivaCsllBRL: number;
  aliquotaCsll: number; // 9% geral (ou 15%/20% financeiras)
  totalCsllApuradaBRL: number;
  csllRetidaFonteBRL: number; // CSRF 1% código 5952
  csllPagaEstimativasMensaisBRL: number;
  saldoCsllRecolherBRL: number;
  saldoNegativoCsllCompensarBRL: number;

  statusApuracao: 'SIMULADO' | 'ENCERRADO' | 'TRANSMITIDO_ECF';
  darfIrpjCodigo: string; // '2456' ou '0220'
  darfCsllCodigo: string; // '6773' ou '2484'
  dataVencimentoDarf: string;
}

// --- 3. SPED Fiscal Bloco E - Apuração Oficial ICMS Próprio, ICMS-ST e DIFAL ---
export interface RegistroE110IcmsProprio {
  totalDebitosOperacoesBRL: number; // Saídas e serviços
  totalAjustesDebitoBRL: number; // Registro E111
  totalEstornosCreditoBRL: number;
  totalCreditosOperacoesBRL: number; // Entradas e aquisições
  totalAjustesCreditoBRL: number; // Registro E111
  totalEstornosDebitoBRL: number;
  saldoCredorPeriodoAnteriorBRL: number;
  saldoDevedorApuradoBRL: number;
  saldoCredorTransportarBRL: number;
  totalDeducoesIncentivosBRL: number;
  icmsRecolherEfetivoBRL: number;
  codigoReceitaDae: string;
  dataVencimentoDae: string;
}

export interface RegistroE210IcmsStUf {
  ufFavorecida: string; // 'SP', 'MG', 'RJ', 'PR', 'RS', etc.
  totalDebitosRetencaoStBRL: number;
  totalAjustesDebitoStBRL: number;
  totalCreditosDevolucaoStBRL: number;
  totalAjustesCreditoStBRL: number;
  saldoCredorAnteriorStBRL: number;
  icmsStRecolherBRL: number;
  saldoCredorTransportarStBRL: number;
  codigoReceitaGnre: string; // '10009-9' ou estadual
  guiaGnreNumero: string;
}

export interface RegistroE310DifalFcpUf {
  ufDestino: string;
  totalDebitosDifalBRL: number;
  totalDebitosFcpBRL: number;
  totalCreditosDevolucaoDifalBRL: number;
  totalCreditosDevolucaoFcpBRL: number;
  saldoCredorAnteriorDifalBRL: number;
  saldoCredorAnteriorFcpBRL: number;
  difalRecolherBRL: number;
  fcpRecolherBRL: number;
  codigoReceitaDifalGnre: string; // '10010-2'
  codigoReceitaFcpGnre: string; // '10012-9'
}

export interface ApuracaoSpedFiscalBlocoE {
  id: string;
  empresaId: number;
  competencia: string; // YYYY-MM
  proprioE110: RegistroE110IcmsProprio;
  stE210: RegistroE210IcmsStUf[];
  difalE310: RegistroE310DifalFcpUf[];
  totalGeralIcmsRecolherBRL: number;
  statusFechamento: 'ABERTO' | 'CONCILIADO' | 'TRANSMITIDO_SPED';
}

// ============================================================================
// SPRINT 56: eSocial S-2500/S-2501, SPED ECF BLOCO X & SPED FISCAL BLOCO 1
// ============================================================================

// --- 1. eSocial S-2500 / S-2501 (Processos Trabalhistas & Tributos Judiciais) ---
export type TipoOrigemProcessoTrabalhista = 
  | '1_JUSTICA_DO_TRABALHO' 
  | '2_CCP_COMISSAO_CONCILIACAO_PREVIA' 
  | '3_NINTER_NUCLEO_INTERSINDICAL';

export interface VerbaProcessoTrabalhista {
  id: string;
  codigoRubrica: string;
  descricaoVerba: string;
  tipoNatureza: 'REMUNERATORIA' | 'INDENIZATORIA';
  valorBRL: number;
  incidenciaInss: boolean;
  incidenciaFgts: boolean;
  incidenciaIrrf: boolean;
  periodoReferenciaMesAno: string; // MM/YYYY
}

export interface ProcessoTrabalhistaS2500 {
  id: string;
  empresaId: number;
  numeroProcessoCnj: string; // Ex: '0001234-56.2025.5.02.0001'
  origemProcesso: TipoOrigemProcessoTrabalhista;
  varaTribunal: string; // Ex: '01ª Vara do Trabalho de São Paulo - TRT 2ª Região'
  ufVara: string;
  municipioIbgeVara: string;
  dataSentencaAcordo: string; // YYYY-MM-DD
  cpfTrabalhador: string;
  nomeTrabalhador: string;
  matriculaOriginal: string;
  cargoFuncao: string;
  dataAdmissaoOriginal: string;
  dataDemissaoOriginal: string;
  houveReconhecimentoVinculo: boolean;
  dataAdmissaoReconhecida?: string;
  dataDemissaoReconhecida?: string;
  motivoDesligamentoJudicial: string;
  valorTotalCondenacaoBRL: number;
  valorTotalRemuneratorioBRL: number;
  valorTotalIndenizatorioBRL: number;
  fgtsDepositadoEmJuizoBRL: number;
  verbas: VerbaProcessoTrabalhista[];
  statusTransmissao: 'PENDENTE' | 'TRANSMITIDO' | 'ERRO_RETORNO';
  reciboS2500?: string;
  xmlGerado?: string;
}

export interface TributosProcessoTrabalhistaS2501 {
  id: string;
  empresaId: number;
  processoId: string;
  numeroProcessoCnj: string;
  competenciaEnvio: string; // YYYY-MM
  cpfTrabalhador: string;
  nomeTrabalhador: string;
  // Encargos Previdenciários (INSS)
  baseCalculoInssSeguradoBRL: number;
  inssSeguradoRetidoBRL: number;
  baseCalculoInssPatronalBRL: number;
  inssPatronalDevidoBRL: number; // 20%
  inssRatDevidoBRL: number; // RAT * FAP
  inssTerceirosDevidoBRL: number; // Outras Entidades
  totalInssRecolherBRL: number;
  // IRRF RRA (Rendimentos Recebidos Acumuladamente - Art. 12-A Lei 7.713/88)
  baseCalculoIrrfRraBRL: number;
  quantidadeMesesRra: number; // NM (Número de Meses) para tabela progressiva multiplicada
  deducaoPrevidenciaOficialIrrfBRL: number;
  deducaoDespesasJudiciaisAdvogadoBRL: number;
  baseCalculoEfetivaIrrfRraBRL: number;
  valorIrrfDevidoRraBRL: number;
  // DARF e Recolhimento Judicial
  darfCodigoReceita: string; // '6092' (IRRF) ou DCTFWeb Trabalhista
  dataVencimentoDarf: string;
  statusTransmissao: 'PENDENTE' | 'TRANSMITIDO' | 'CONCILIADO';
  reciboS2501?: string;
  xmlGerado?: string;
}

export interface ResumoProcessosTrabalhistasS2500S2501 {
  empresaId: number;
  totalProcessos: number;
  totalCondenacoesBRL: number;
  totalVerbasRemuneratoriasBRL: number;
  totalVerbasIndenizatoriasBRL: number;
  totalInssJudicialBRL: number;
  totalIrrfRraJudicialBRL: number;
  totalFgtsJudicialBRL: number;
  processos: ProcessoTrabalhistaS2500[];
  tributos: TributosProcessoTrabalhistaS2501[];
}

// --- 2. SPED ECF Bloco X - Operações com o Exterior, Preços de Transferência & Incentivos ---
export interface RegistroX280Incentivos {
  id: string;
  tipoIncentivo: 'SUDENE_SUDAM' | 'LEI_DO_BEM_11196' | 'ROTA_2030_MOVER' | 'PAT_ALIMENTACAO' | 'INOVA_AGRO';
  descricaoProjeto: string;
  atoAprovacaoNumero: string;
  valorBeneficioApuradoBRL: number;
  valorInvestidoPesquisaDesenvolvimentoBRL: number;
}

export interface RegistroX300OperacoesExterior {
  id: string;
  tipoOperacao: 'EXPORTACAO' | 'IMPORTACAO' | 'SERVICO_INTANGIVEL' | 'ROYALTIES';
  paisJurisdicao: string; // Código ISO ex: '840' - Estados Unidos, '756' - Suíça
  nomePais: string;
  entidadeExteriorRazao: string;
  nifEntidadeExterior: string;
  ehParteVinculada: boolean;
  metodoTransferPricing: 'PIC_PRECO_INDEPENDENTE' | 'PRL_PRECO_REVENDA' | 'CPL_CUSTO_PRODUCAO' | 'MLN_MARGEM_LIQUIDA' | 'DRL_DIVISAO_LUCRO';
  valorPraticadoMoedaEstrangeira: number;
  moeda: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CHF';
  taxaCambioUtilizada: number;
  valorTotalPraticadoBRL: number;
  valorParametroTransferPricingBRL: number;
  ajusteLucroRealLalurBRL: number; // Excesso de custo ou insuficiência de receita
}

export interface RegistroX320Vinculadas {
  id: string;
  nifExterior: string;
  razaoSocialExterior: string;
  paisCodigo: string;
  paisNome: string;
  relacionamentoSocietario: 'CONTROLADORA' | 'CONTROLADA' | 'COLIGADA' | 'FILIAL_SUCURSAL';
  percentualParticipacaoVotante: number;
  jurisdicaoTributacaoFavorecida: boolean; // Paraíso fiscal / regime fiscal privilegiado
}

export interface RegistroX340ParticipacaoExterior {
  id: string;
  paisCodigo: string;
  paisNome: string;
  razaoSocialInvestida: string;
  lucroPeriodoMoedaOrigem: number;
  lucroPeriodoBRL: number;
  impostoRendaPagoNoExteriorBRL: number;
  creditoImpostoExteriorCompensavelBRL: number;
  metodoEquivalenciaPatrimonialBRL: number;
}

export interface DemonstrativoEcfBlocoX {
  id: string;
  empresaId: number;
  anoExercicio: number;
  totalOperacoesExteriorBRL: number;
  totalAjustesTransferPricingBRL: number;
  totalIncentivosFiscaisBRL: number;
  totalCreditoTributoExteriorBRL: number;
  operacoes: RegistroX300OperacoesExterior[];
  vinculadas: RegistroX320Vinculadas[];
  participacoes: RegistroX340ParticipacaoExterior[];
  incentivos: RegistroX280Incentivos[];
  statusValidacaoEcf: 'EM_ELABORACAO' | 'VALIDADO_SEM_ERROS' | 'TRANSMITIDO';
}

// --- 3. SPED Fiscal Bloco 1 - Outras Informações, Créditos Acumulados & Meios Eletrônicos (1601) ---
export interface Registro1200CreditoIcms {
  id: string;
  competencia: string; // YYYY-MM
  codigoCreditoAcumulado: string; // Ex: 'CR-001/2026'
  origemCredito: 'EXPORTACAO' | 'DIFERIMENTO' | 'REDUCAO_BASE_CALCULO' | 'ISENCAO_MANUTENCAO';
  saldoCredorInicialBRL: number;
  creditoGeradoPeriodoBRL: number;
  creditoUtilizadoProprioBRL: number;
  creditoTransferidoTerceirosBRL: number;
  saldoCredorFinalTransportarBRL: number;
}

export interface Registro1400ValorAdicionadoMunicipio {
  id: string;
  competencia: string; // YYYY-MM
  codigoMunicipioIbge: string; // Ex: '3550308' - São Paulo
  nomeMunicipio: string;
  uf: string;
  valorOperacoesPropriasBRL: number; // Saídas de produção/serviços
  valorAdicionadoCalculadoBRL: number; // Base do Índice de Participação dos Municípios (IPM)
  aliquotaIpmPercentual: number;
}

export interface Registro1601OperacoesPagamentoEletronico {
  id: string;
  competencia: string; // YYYY-MM
  codigoInstituicaoPagamento: string; // Ex: 'PAG-001'
  nomeInstituicao: string; // Ex: 'Cielo S.A.', 'Rede S.A.', 'Stone Pagamentos', 'Mercado Pago'
  cnpjInstituicaoPagamento: string;
  tipoOperacaoInstrumento: 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'PIX' | 'CARTEIRA_DIGITAL' | 'TRANSFERENCIA_BANCARIA';
  valorTotalOperacoesBRL: number;
  valorTaxaIntermediacaoBRL: number;
  valorLiquidoRecebidoBRL: number;
  intermediadorMarketplaceCnpj?: string;
  intermediadorMarketplaceNome?: string;
}

export interface ResumoSpedFiscalBloco1 {
  id: string;
  empresaId: number;
  competencia: string; // YYYY-MM
  creditosIcms1200: Registro1200CreditoIcms[];
  valorAdicionado1400: Registro1400ValorAdicionadoMunicipio[];
  pagamentosEletronicos1601: Registro1601OperacoesPagamentoEletronico[];
  totalCreditoAcumuladoFinalBRL: number;
  totalValorAdicionadoMunicipiosBRL: number;
  totalVendasInstrumentosEletronicosBRL: number;
  totalTaxasIntermediacaoBRL: number;
  statusBloco1: 'EM_ANALISE' | 'CONCILIADO_SPED' | 'TRANSMITIDO';
}











