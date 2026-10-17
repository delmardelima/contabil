import React, { useState } from 'react';
import { dbService } from '../../db/sqliteService';
import { 
  Empresa, 
  Colaborador, 
  FolhaMensal, 
  VariaveisColaborador, 
  ProvisaoColaborador,
  CalculoFerias,
  CalculoDecimoTerceiro,
  CalculoRescisao
} from '../../types/contabil';
import { 
  Calculator, 
  Printer, 
  CheckCircle2, 
  Zap, 
  Users, 
  Sliders, 
  Receipt, 
  Search, 
  FileText,
  Clock,
  AlertTriangle,
  X,
  Plus,
  Layers,
  Sparkles,
  Calendar,
  ShieldCheck,
  TrendingUp,
  Sun,
  Gift,
  UserMinus,
  Trash2
} from 'lucide-react';

interface CalculoFolhaModuleProps {
  empresa: Empresa;
  onOpenReportPreview?: (config: {
    tipo: 'HOLERITE' | 'RESUMO_FOLHA' | 'RECIBO_FERIAS' | 'RECIBO_13' | 'TRCT' | string;
    titulo: string;
    subtitulo: string;
    linhas: { descricao: string; valor: number; isTotal?: boolean; isHeader?: boolean }[];
  }) => void;
  onIntegracaoSucesso?: () => void;
}

export const CalculoFolhaModule: React.FC<CalculoFolhaModuleProps> = ({
  empresa,
  onOpenReportPreview,
  onIntegracaoSucesso
}) => {
  // Sub-abas completas de Folha
  const [abaAtiva, setAbaAtiva] = useState<'FOLHA_MENSAL' | 'FERIAS' | 'DECIMO_TERCEIRO' | 'RESCISAO' | 'PROVISOES'>('FOLHA_MENSAL');
  
  // Estado Folha Mensal
  const [folhas, setFolhas] = useState<FolhaMensal[]>(() => {
    return dbService.getFolhasCalculadas(empresa.id, empresa.competenciaAtiva);
  });
  const [colaboradores, setColaboradores] = useState<Colaborador[]>(() => dbService.getColaboradores(empresa.id));
  const [provisoes, setProvisoes] = useState<ProvisaoColaborador[]>(() => {
    return dbService.calcularProvisoesMensais(empresa.id, empresa.competenciaAtiva);
  });
  const [processando, setProcessando] = useState<boolean>(false);
  const [mensagem, setMensagem] = useState<string>('');
  const [baixarPagamentoCaixaBanco, setBaixarPagamentoCaixaBanco] = useState<boolean>(true);
  const [analiseSimplesFolha, setAnaliseSimplesFolha] = useState(() =>
    dbService.getAnaliseSimplesProLaboreFatorR(empresa.id, empresa.competenciaAtiva)
  );

  // ----------------------------------------------------
  // ESTADO: FÉRIAS (ART. 129 A 145 CLT)
  // ----------------------------------------------------
  const [calculosFerias, setCalculosFerias] = useState<CalculoFerias[]>(() => dbService.getCalculosFerias(empresa.id));
  const [showFeriasModal, setShowFeriasModal] = useState<boolean>(false);
  const [feriasColabId, setFeriasColabId] = useState<number>(() => colaboradores.find(c => c.tipoVinculo === 'CLT')?.id || colaboradores[0]?.id || 1);
  const [feriasAquisitivoIni, setFeriasAquisitivoIni] = useState<string>('2025-05-02');
  const [feriasAquisitivoFim, setFeriasAquisitivoFim] = useState<string>('2026-05-01');
  const [feriasGozoIni, setFeriasGozoIni] = useState<string>('2026-11-03');
  const [feriasDiasGozo, setFeriasDiasGozo] = useState<number>(30);
  const [feriasAbono, setFeriasAbono] = useState<boolean>(false);
  const [feriasDiasAbono, setFeriasDiasAbono] = useState<number>(10);
  const [feriasAdiantar13, setFeriasAdiantar13] = useState<boolean>(false);

  // ----------------------------------------------------
  // ESTADO: 13º SALÁRIO (1ª E 2ª PARCELA)
  // ----------------------------------------------------
  const [parcela13, setParcela13] = useState<'PRIMEIRA' | 'SEGUNDA'>('PRIMEIRA');
  const [ano13, setAno13] = useState<number>(2026);
  const [calculos13, setCalculos13] = useState<CalculoDecimoTerceiro[]>(() => dbService.getCalculosDecimoTerceiro(empresa.id, 2026));

  // ----------------------------------------------------
  // ESTADO: RESCISÃO CONTRATUAL (TRCT PORTARIA 1.057/MTE)
  // ----------------------------------------------------
  const [calculosRescisao, setCalculosRescisao] = useState<CalculoRescisao[]>(() => dbService.getCalculosRescisao(empresa.id));
  const [showRescisaoModal, setShowRescisaoModal] = useState<boolean>(false);
  const [rescisaoColabId, setRescisaoColabId] = useState<number>(() => colaboradores.find(c => c.tipoVinculo === 'CLT')?.id || colaboradores[0]?.id || 1);
  const [rescisaoDataDemissao, setRescisaoDataDemissao] = useState<string>('2026-10-31');
  const [rescisaoMotivo, setRescisaoMotivo] = useState<'SEM_JUSTA_CAUSA' | 'PEDIDO_DEMISSAO' | 'COM_JUSTA_CAUSA' | 'TERMINO_CONTRATO' | 'ACORDO_MUTUO'>('SEM_JUSTA_CAUSA');
  const [rescisaoTipoAviso, setRescisaoTipoAviso] = useState<'INDENIZADO' | 'TRABALHADO' | 'DISPENSADO' | 'DESCONTADO'>('INDENIZADO');
  const [rescisaoTemFeriasVencidas, setRescisaoTemFeriasVencidas] = useState<boolean>(false);
  const [rescisaoSaldoFGTS, setRescisaoSaldoFGTS] = useState<string>('4.200,00');

  // Modal de Lançamento de Variáveis (Folha Mensal)
  const [showVariaveisModal, setShowVariaveisModal] = useState<boolean>(false);
  const [colabSelecionado, setColabSelecionado] = useState<Colaborador | null>(null);
  const [horasExtras50, setHorasExtras50] = useState<number>(0);
  const [horasExtras100, setHorasExtras100] = useState<number>(0);
  const [adicionalNoturnoHoras, setAdicionalNoturnoHoras] = useState<number>(0);
  const [grauInsalubridade, setGrauInsalubridade] = useState<'NENHUM' | 'MINIMO' | 'MEDIO' | 'MAXIMO'>('NENHUM');
  const [periculosidade, setPericulosidade] = useState<boolean>(false);
  const [faltasDias, setFaltasDias] = useState<number>(0);
  const [faltasHoras, setFaltasHoras] = useState<number>(0);
  const [adiantamentoSalarial, setAdiantamentoSalarial] = useState<string>('0,00');
  const [descontoValeTransporte, setDescontoValeTransporte] = useState<boolean>(true);

  // ----------------------------------------------------
  // HANDLERS: VARIÁVEIS E FOLHA MENSAL
  // ----------------------------------------------------
  const handleAbrirVariaveis = (colab: Colaborador) => {
    setColabSelecionado(colab);
    const variavelExistente = dbService.getVariavelColaborador(colab.id, empresa.competenciaAtiva);
    if (variavelExistente) {
      setHorasExtras50(variavelExistente.horasExtras50 || 0);
      setHorasExtras100(variavelExistente.horasExtras100 || 0);
      setAdicionalNoturnoHoras(variavelExistente.adicionalNoturnoHoras || 0);
      setGrauInsalubridade(variavelExistente.grauInsalubridade || 'NENHUM');
      setPericulosidade(!!variavelExistente.periculosidade);
      setFaltasDias(variavelExistente.faltasDias || 0);
      setFaltasHoras(variavelExistente.faltasHoras || 0);
      setAdiantamentoSalarial((variavelExistente.adiantamentoSalarial || 0).toFixed(2).replace('.', ','));
      setDescontoValeTransporte(variavelExistente.descontoValeTransporte !== false);
    } else {
      setHorasExtras50(0);
      setHorasExtras100(0);
      setAdicionalNoturnoHoras(0);
      setGrauInsalubridade('NENHUM');
      setPericulosidade(false);
      setFaltasDias(0);
      setFaltasHoras(0);
      setAdiantamentoSalarial('0,00');
      setDescontoValeTransporte(colab.tipoVinculo === 'CLT');
    }
    setShowVariaveisModal(true);
  };

  const handleSalvarVariaveis = () => {
    if (!colabSelecionado) return;
    const adiantamento = parseFloat(adiantamentoSalarial.replace(/\./g, '').replace(',', '.')) || 0;

    const novaVar: VariaveisColaborador = {
      empresaId: empresa.id,
      colaboradorId: colabSelecionado.id,
      competencia: empresa.competenciaAtiva,
      horasExtras50: Number(horasExtras50),
      horasExtras100: Number(horasExtras100),
      adicionalNoturnoHoras: Number(adicionalNoturnoHoras),
      grauInsalubridade,
      periculosidade,
      faltasDias: Number(faltasDias),
      faltasHoras: Number(faltasHoras),
      adiantamentoSalarial: adiantamento,
      descontoValeTransporte
    };

    dbService.saveVariaveisColaborador(novaVar);
    setShowVariaveisModal(false);
    setMensagem(`Variáveis de ${colabSelecionado.nome} salvas com sucesso.`);
    setTimeout(() => setMensagem(''), 4000);
  };

  const handleProcessarFolha = () => {
    setProcessando(true);
    setTimeout(() => {
      const ativados = colaboradores.filter(c => c.status === 'ATIVO');
      const calculadas: FolhaMensal[] = [];
      const SALARIO_MINIMO_2026 = 1518.00;

      for (const colab of ativados) {
        const salBase = colab.salarioBase;
        const isCLT = colab.tipoVinculo === 'CLT';
        const divisorHoras = (colab.jornadaSemanal && colab.jornadaSemanal <= 40) ? 200 : 220;
        const valorHora = salBase / divisorHoras;

        const vars = dbService.getVariavelColaborador(colab.id, empresa.competenciaAtiva);

        const proventos: any[] = [];
        proventos.push({
          rubricaId: isCLT ? 1 : 2,
          codigo: isCLT ? '001' : '002',
          nome: isCLT ? 'Salário Base Mensal' : 'Retirada de Pró-Labore',
          tipo: 'PROVENTO',
          referencia: 30,
          valor: salBase
        });

        let totalVariaveis = 0;

        if (isCLT && vars) {
          if (vars.horasExtras50 && vars.horasExtras50 > 0) {
            const valHE50 = Math.round((vars.horasExtras50 * valorHora * 1.5) * 100) / 100;
            proventos.push({
              rubricaId: 3,
              codigo: '010',
              nome: 'Horas Extras 50%',
              tipo: 'PROVENTO',
              referencia: vars.horasExtras50,
              valor: valHE50
            });
            totalVariaveis += valHE50;
          }

          if (vars.horasExtras100 && vars.horasExtras100 > 0) {
            const valHE100 = Math.round((vars.horasExtras100 * valorHora * 2.0) * 100) / 100;
            proventos.push({
              rubricaId: 4,
              codigo: '011',
              nome: 'Horas Extras 100% (Domingos/Feriados)',
              tipo: 'PROVENTO',
              referencia: vars.horasExtras100,
              valor: valHE100
            });
            totalVariaveis += valHE100;
          }

          if (vars.adicionalNoturnoHoras && vars.adicionalNoturnoHoras > 0) {
            const valAdNot = Math.round((vars.adicionalNoturnoHoras * valorHora * 0.2) * 100) / 100;
            proventos.push({
              rubricaId: 5,
              codigo: '012',
              nome: 'Adicional Noturno 20%',
              tipo: 'PROVENTO',
              referencia: vars.adicionalNoturnoHoras,
              valor: valAdNot
            });
            totalVariaveis += valAdNot;
          }

          if (totalVariaveis > 0) {
            const valDSR = Math.round(((totalVariaveis / 25) * 5) * 100) / 100;
            proventos.push({
              rubricaId: 6,
              codigo: '015',
              nome: 'D.S.R. s/ Horas Extras e Variáveis',
              tipo: 'PROVENTO',
              referencia: 5,
              valor: valDSR
            });
          }

          if (vars.grauInsalubridade && vars.grauInsalubridade !== 'NENHUM') {
            const perc = vars.grauInsalubridade === 'MINIMO' ? 0.10 : vars.grauInsalubridade === 'MEDIO' ? 0.20 : 0.40;
            const valIns = Math.round((SALARIO_MINIMO_2026 * perc) * 100) / 100;
            proventos.push({
              rubricaId: 7,
              codigo: '020',
              nome: `Adicional de Insalubridade (${perc * 100}% s/ SM)`,
              tipo: 'PROVENTO',
              referencia: perc * 100,
              valor: valIns
            });
          }

          if (vars.periculosidade) {
            const valPeric = Math.round((salBase * 0.30) * 100) / 100;
            proventos.push({
              rubricaId: 8,
              codigo: '021',
              nome: 'Adicional de Periculosidade (30%)',
              tipo: 'PROVENTO',
              referencia: 30,
              valor: valPeric
            });
          }
        }

        const totalBruto = proventos.reduce((acc, p) => acc + p.valor, 0);

        const descontos: any[] = [];
        let totalFaltasVal = 0;

        if (isCLT && vars) {
          if (vars.faltasDias && vars.faltasDias > 0) {
            const valFaltaDias = Math.round(((salBase / 30) * vars.faltasDias) * 100) / 100;
            descontos.push({
              rubricaId: 9,
              codigo: '101',
              nome: 'Faltas Injustificadas (Dias)',
              tipo: 'DESCONTO',
              referencia: vars.faltasDias,
              valor: valFaltaDias
            });
            totalFaltasVal += valFaltaDias;
          }

          if (vars.faltasHoras && vars.faltasHoras > 0) {
            const valFaltaHoras = Math.round((vars.faltasHoras * valorHora) * 100) / 100;
            descontos.push({
              rubricaId: 10,
              codigo: '102',
              nome: 'Atrasos / Faltas em Horas',
              tipo: 'DESCONTO',
              referencia: vars.faltasHoras,
              valor: valFaltaHoras
            });
            totalFaltasVal += valFaltaHoras;
          }

          if (vars.descontoValeTransporte) {
            const descVT = Math.min(Math.round((salBase * 0.06) * 100) / 100, 350.00);
            if (descVT > 0) {
              descontos.push({
                rubricaId: 11,
                codigo: '105',
                nome: 'Desconto Vale Transporte (6%)',
                tipo: 'DESCONTO',
                referencia: 6,
                valor: descVT
              });
            }
          }

          if (vars.adiantamentoSalarial && vars.adiantamentoSalarial > 0) {
            descontos.push({
              rubricaId: 12,
              codigo: '110',
              nome: 'Adiantamento Salarial Quinzenal',
              tipo: 'DESCONTO',
              referencia: 0,
              valor: vars.adiantamentoSalarial
            });
          }
        }

        const baseCalculoINSS = Math.max(0, totalBruto - totalFaltasVal);
        let inssSeg = 0;

        if (isCLT) {
          if (baseCalculoINSS <= 1518.00) {
            inssSeg = baseCalculoINSS * 0.075;
          } else if (baseCalculoINSS <= 2793.88) {
            inssSeg = (baseCalculoINSS * 0.09) - 22.77;
          } else if (baseCalculoINSS <= 4190.83) {
            inssSeg = (baseCalculoINSS * 0.12) - 106.59;
          } else if (baseCalculoINSS <= 8157.41) {
            inssSeg = (baseCalculoINSS * 0.14) - 190.40;
          } else {
            inssSeg = 951.63;
          }
        } else {
          inssSeg = Math.min(baseCalculoINSS * 0.11, 897.31);
        }
        inssSeg = Math.round(inssSeg * 100) / 100;

        descontos.push({
          rubricaId: 13,
          codigo: '201',
          nome: isCLT ? 'INSS Previdência Social' : 'INSS Individual Pró-Labore (11%)',
          tipo: 'DESCONTO',
          referencia: isCLT ? (inssSeg / baseCalculoINSS) * 100 : 11,
          valor: inssSeg
        });

        const deducaoDependentes = (colab.dependentesIRRF || 0) * 189.59;
        const deducaoSimplificada = 564.80;
        const deducaoLegal = inssSeg + deducaoDependentes;
        const deducaoEfetiva = Math.max(deducaoSimplificada, deducaoLegal);
        const baseIR = Math.max(0, baseCalculoINSS - deducaoEfetiva);

        let irrf = 0;
        if (baseIR > 2259.20) {
          if (baseIR <= 2826.65) irrf = (baseIR * 0.075) - 169.44;
          else if (baseIR <= 3751.05) irrf = (baseIR * 0.15) - 381.44;
          else if (baseIR <= 4664.68) irrf = (baseIR * 0.225) - 662.77;
          else irrf = (baseIR * 0.275) - 896.00;
        }
        irrf = Math.max(0, Math.round(irrf * 100) / 100);

        if (irrf > 0) {
          descontos.push({
            rubricaId: 14,
            codigo: '205',
            nome: 'IRRF Retido na Fonte',
            tipo: 'DESCONTO',
            referencia: (irrf / baseIR) * 100,
            valor: irrf
          });
        }

        const totalDesc = descontos.reduce((acc, d) => acc + d.valor, 0);
        const salarioLiquido = Math.max(0, Math.round((totalBruto - totalDesc) * 100) / 100);

        const isSimplesOuMei = empresa.regimeTributario === 'SIMPLES_NACIONAL';
        const isMei = (empresa as any).porteEmpresa === 'MEI' || empresa.razaoSocial.toUpperCase().includes('MEI');
        // No Simples Nacional (Anexos I, II, III e V), a CPP Patronal já está embutida no DAS (0% separado na folha).
        // No MEI com 1 empregado (Art. 18-C LC 123/2006), a CPP Patronal é de 3% sobre o salário de contribuição.
        const inssPatronal = isCLT
          ? Math.round((baseCalculoINSS * (isMei ? 0.03 : isSimplesOuMei ? 0 : 0.20)) * 100) / 100
          : Math.round((baseCalculoINSS * (isSimplesOuMei ? 0 : 0.20)) * 100) / 100;
        const fgts = isCLT ? Math.round((baseCalculoINSS * 0.08) * 100) / 100 : 0;

        const folhaItem: FolhaMensal = {
          id: Date.now() + colab.id,
          empresaId: empresa.id,
          colaboradorId: colab.id,
          competencia: empresa.competenciaAtiva,
          tipoFolha: 'MENSAL',
          dataCalculo: new Date().toISOString().split('T')[0],
          proventos,
          descontos,
          totalProventos: totalBruto,
          totalDescontos: totalDesc,
          salarioLiquido,
          baseINSS: baseCalculoINSS,
          inssSegurado: inssSeg,
          inssPatronal,
          baseFGTS: isCLT ? baseCalculoINSS : 0,
          fgts,
          baseIRRF: baseIR,
          irrf
        };

        dbService.saveFolhaMensal(folhaItem);
        calculadas.push(folhaItem);
      }

      setFolhas(calculadas);
      setAnaliseSimplesFolha(dbService.getAnaliseSimplesProLaboreFatorR(empresa.id, empresa.competenciaAtiva));
      setProcessando(false);
      setMensagem(`Folha de ${empresa.competenciaAtiva} calculada para ${calculadas.length} colaboradores.`);
      setTimeout(() => setMensagem(''), 5000);
    }, 350);
  };

  const handleAjustarProLaboreSocio = (modo: 'PISO_SALARIO_MINIMO' | 'OTIMIZAR_FATOR_R_28') => {
    const res = dbService.ajustarProLaboreSocioMinimizarDas(empresa.id, modo, empresa.competenciaAtiva);
    setColaboradores(dbService.getColaboradores(empresa.id));
    setAnaliseSimplesFolha(dbService.getAnaliseSimplesProLaboreFatorR(empresa.id, empresa.competenciaAtiva));
    setMensagem(res.mensagem);
    setTimeout(() => setMensagem(''), 6000);
  };

  const handleIntegrarContabilidade = () => {
    const res = dbService.gerarIntegracaoFolhaContabil(empresa.id, empresa.competenciaAtiva, baixarPagamentoCaixaBanco);
    if (res.count === 0) {
      setMensagem('Não há folha processada nesta competência para integração.');
      return;
    }
    setMensagem(`Integração concluída! Lote nº ${res.lote.numero} gerado com ${res.count} partidas contábeis${baixarPagamentoCaixaBanco ? ' (incluindo baixa automática no Caixa/Banco)' : ''} • Total Bruto: R$ ${res.totalBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`);
    if (onIntegracaoSucesso) onIntegracaoSucesso();
    setTimeout(() => setMensagem(''), 6000);
  };

  const handleRecalcularProvisoes = () => {
    const p = dbService.calcularProvisoesMensais(empresa.id, empresa.competenciaAtiva);
    setProvisoes(p);
    setMensagem(`Provisões recalculadas para ${p.length} colaboradores.`);
    setTimeout(() => setMensagem(''), 4000);
  };

  const handleIntegrarProvisoes = () => {
    const res = dbService.integrarProvisoesContabil(empresa.id, empresa.competenciaAtiva);
    if (!res.success) {
      setMensagem('Não há provisões elegíveis para integração.');
      return;
    }
    setMensagem(`Integração de Provisões concluída! Lote gerado com ${res.partidasGeradas} partidas contábeis (Total: R$ ${res.totalProvisao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}).`);
    if (onIntegracaoSucesso) onIntegracaoSucesso();
    setTimeout(() => setMensagem(''), 6000);
  };

  const handleImprimirHolerite = (colab: Colaborador) => {
    const folha = folhas.find(f => f.colaboradorId === colab.id);
    if (!folha || !onOpenReportPreview) return;

    const linhas: { descricao: string; valor: number; isTotal?: boolean; isHeader?: boolean }[] = [];
    linhas.push({ descricao: '--- PROVENTOS E VENCIMENTOS ---', valor: 0, isHeader: true });
    (folha.proventos || []).forEach((p: any) => {
      linhas.push({
        descricao: `(+) ${p.codigo} - ${p.nome} (Ref: ${p.referencia})`,
        valor: Number(p.valor) || 0
      });
    });

    linhas.push({ descricao: '--- DESCONTOS LEGAIS E RETENÇÕES ---', valor: 0, isHeader: true });
    (folha.descontos || []).forEach((d: any) => {
      linhas.push({
        descricao: `(-) ${d.codigo} - ${d.nome} (Ref: ${Number(d.referencia || 0).toFixed(1)}%)`,
        valor: -(Number(d.valor) || 0)
      });
    });

    linhas.push({
      descricao: '(=) SALÁRIO LÍQUIDO A RECEBER',
      valor: folha.salarioLiquido || 0,
      isTotal: true
    });

    onOpenReportPreview({
      tipo: 'HOLERITE',
      titulo: 'RECIBO DE PAGAMENTO DE SALÁRIO (HOLERITE)',
      subtitulo: `Competência: ${empresa.competenciaAtiva} • Empregador: ${empresa.razaoSocial} • Colaborador: ${colab.nome} (Matrícula: ${colab.matricula} • Cargo: ${colab.cargo})`,
      linhas
    });
  };

  const handleImprimirResumoA4 = () => {
    if (!onOpenReportPreview) return;
    const totBruto = folhas.reduce((acc, f) => acc + (f.totalProventos || 0), 0);
    const totINSSSeg = folhas.reduce((acc, f) => acc + (f.inssSegurado || 0), 0);
    const totIRRF = folhas.reduce((acc, f) => acc + (f.irrf || 0), 0);
    const totINSSPat = folhas.reduce((acc, f) => acc + (f.inssPatronal || 0), 0);
    const totFGTS = folhas.reduce((acc, f) => acc + (f.fgts || 0), 0);
    const totLiquido = folhas.reduce((acc, f) => acc + (f.salarioLiquido || 0), 0);

    const linhas = [
      { descricao: '1. Total de Vencimentos e Salários Brutos', valor: totBruto },
      { descricao: '2. Total de Retenção Previdenciária dos Segurados (INSS)', valor: -totINSSSeg },
      { descricao: '3. Total de Retenção do Imposto de Renda Retido na Fonte (IRRF)', valor: -totIRRF },
      { descricao: '(=) TOTAL LÍQUIDO A PAGAR AOS COLABORADORES', valor: totLiquido, isTotal: true },
      { descricao: '4. Encargo Previdenciário Patronal Estimado (CPP 20% CLT / 11% Pró-Labore)', valor: totINSSPat, isHeader: true },
      { descricao: '5. Encargo Total de FGTS a Recolher na Competência (8%)', valor: totFGTS, isHeader: true }
    ];

    onOpenReportPreview({
      tipo: 'RESUMO_FOLHA',
      titulo: 'RESUMO CONSOLIDADO DA FOLHA DE PAGAMENTO & ENCARGOS SOCIAIS',
      subtitulo: `Competência Ativa: ${empresa.competenciaAtiva} • Empresa: ${empresa.razaoSocial} • CNPJ: ${empresa.cnpj}`,
      linhas
    });
  };

  // ----------------------------------------------------
  // HANDLERS: FÉRIAS
  // ----------------------------------------------------
  const handleCalcularESalvarFerias = () => {
    try {
      const calc = dbService.calcularFeriasColaborador({
        empresaId: empresa.id,
        colaboradorId: feriasColabId,
        periodoAquisitivoInicio: feriasAquisitivoIni,
        periodoAquisitivoFim: feriasAquisitivoFim,
        dataInicioGozo: feriasGozoIni,
        diasGozo: Number(feriasDiasGozo),
        abonoPecuniario: feriasAbono,
        diasAbono: Number(feriasDiasAbono),
        adiantarDecimoTerceiro: feriasAdiantar13
      });
      dbService.salvarCalculoFerias(calc);
      setCalculosFerias(dbService.getCalculosFerias(empresa.id));
      setShowFeriasModal(false);
      setMensagem(`Férias de ${calc.colaboradorNome} calculadas com sucesso! Líquido a receber: R$ ${calc.valorLiquidoReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`);
      setTimeout(() => setMensagem(''), 5000);
    } catch (err: any) {
      alert(err.message || 'Erro ao calcular férias.');
    }
  };

  const handleIntegrarFerias = (id: number) => {
    const res = dbService.integrarFeriasContabil(id);
    if (res.success) {
      setCalculosFerias(dbService.getCalculosFerias(empresa.id));
      setMensagem(`Férias integradas à contabilidade no Lote nº ${res.loteId}!`);
      if (onIntegracaoSucesso) onIntegracaoSucesso();
      setTimeout(() => setMensagem(''), 5000);
    }
  };

  const handleExcluirFerias = (id: number) => {
    if (confirm('Confirma a exclusão deste cálculo de férias?')) {
      dbService.deleteCalculoFerias(id);
      setCalculosFerias(dbService.getCalculosFerias(empresa.id));
    }
  };

  const handleImprimirReciboFerias = (f: CalculoFerias) => {
    if (!onOpenReportPreview) return;
    const linhas = [
      { descricao: '--- PROVENTOS DE FÉRIAS (CLT ART. 129/145) ---', valor: 0, isHeader: true },
      { descricao: `(+) Férias Gozadas (${f.diasGozo} dias: ${f.dataInicioGozo} a ${f.dataFimGozo})`, valor: f.valorDiasFerias },
      { descricao: '(+) 1/3 Constitucional sobre Férias Gozadas', valor: f.valorTercoConstitucional },
      ...(f.valorAbonoPecuniario > 0 ? [
        { descricao: `(+) Abono Pecuniário de Férias (${f.diasAbono} dias - isento)`, valor: f.valorAbonoPecuniario },
        { descricao: '(+) 1/3 Constitucional sobre Abono Pecuniário (isento)', valor: f.valorTercoAbono }
      ] : []),
      ...(f.valorAdiantamento13 > 0 ? [
        { descricao: '(+) Adiantamento de 50% do 13º Salário', valor: f.valorAdiantamento13 }
      ] : []),
      { descricao: '--- DEDUÇÕES LEGAIS & RETENÇÕES ---', valor: 0, isHeader: true },
      { descricao: '(-) Retenção Previdenciária dos Segurados (INSS Férias)', valor: -f.valorINSS },
      ...(f.valorIRRF > 0 ? [
        { descricao: '(-) Imposto de Renda Retido na Fonte (IRRF Férias Exclusivo)', valor: -f.valorIRRF }
      ] : []),
      { descricao: '(=) SALÁRIO LÍQUIDO DE FÉRIAS A RECEBER', valor: f.valorLiquidoReceber, isTotal: true },
      { descricao: `Data Limite de Pagamento: ${f.dataPagamento} (Art. 145 CLT: 2 dias antes do início do gozo)`, valor: 0, isHeader: true }
    ];

    onOpenReportPreview({
      tipo: 'RECIBO_FERIAS',
      titulo: 'RECIBO DE PAGAMENTO & AVISO DE FÉRIAS INDIVIDUAIS',
      subtitulo: `Colaborador: ${f.colaboradorNome} • Matrícula: ${f.matricula} • Cargo: ${f.cargo} • P. Aquisitivo: ${f.periodoAquisitivoInicio} a ${f.periodoAquisitivoFim}`,
      linhas
    });
  };

  // ----------------------------------------------------
  // HANDLERS: 13º SALÁRIO
  // ----------------------------------------------------
  const handleCalcular13 = () => {
    const calcs = dbService.calcularDecimoTerceiro(empresa.id, ano13, parcela13);
    setCalculos13(dbService.getCalculosDecimoTerceiro(empresa.id, ano13));
    setMensagem(`${parcela13 === 'PRIMEIRA' ? '1ª Parcela (Adiantamento)' : '2ª Parcela (Quitação)'} do 13º Salário ${ano13} calculada com sucesso para ${calcs.length} colaboradores.`);
    setTimeout(() => setMensagem(''), 5000);
  };

  const handleIntegrar13 = () => {
    const res = dbService.integrarDecimoTerceiroContabil(empresa.id, ano13, parcela13);
    if (res.success) {
      setCalculos13(dbService.getCalculosDecimoTerceiro(empresa.id, ano13));
      setMensagem(`13º Salário (${parcela13}) integrado à contabilidade! Partidas criadas no Lote nº ${res.loteId} (Total: R$ ${res.totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}).`);
      if (onIntegracaoSucesso) onIntegracaoSucesso();
      setTimeout(() => setMensagem(''), 5000);
    } else {
      setMensagem('Não há cálculos pendentes de integração para esta parcela.');
    }
  };

  const handleImprimirRecibo13 = (d: CalculoDecimoTerceiro) => {
    if (!onOpenReportPreview) return;
    const linhas = [
      { descricao: `--- DISCRIMINATIVO 13º SALÁRIO (${d.parcela === 'PRIMEIRA' ? '1ª PARCELA ADIANTAMENTO' : '2ª PARCELA QUITAÇÃO FINAL'}) ---`, valor: 0, isHeader: true },
      { descricao: `(+) Valor Integral do 13º Salário (${d.mesesTrabalhadosAvos}/12 avos)`, valor: d.valorIntegral },
      ...(d.parcela === 'PRIMEIRA' ? [
        { descricao: '(=) VALOR BRUTO DO ADIANTAMENTO (50%)', valor: d.valorBrutoParcela, isTotal: true },
        { descricao: `Encargo FGTS a Recolher (8%): R$ ${d.valorFGTS.toFixed(2)} (Sem retenção de INSS/IRRF)`, valor: d.valorFGTS, isHeader: true }
      ] : [
        { descricao: '(-) Dedução do Adiantamento da 1ª Parcela Pago', valor: -d.valorAdiantamentoDeduzido },
        { descricao: '(-) Retenção Previdenciária INSS sobre 13º Integral', valor: -d.valorINSS },
        ...(d.valorIRRF > 0 ? [{ descricao: '(-) Retenção IRRF sobre 13º Integral', valor: -d.valorIRRF }] : []),
        { descricao: '(=) SALDO LÍQUIDO DO 13º SALÁRIO A RECEBER', valor: d.valorLiquidoParcela, isTotal: true },
        { descricao: `Encargo FGTS sobre saldo (8%): R$ ${d.valorFGTS.toFixed(2)}`, valor: d.valorFGTS, isHeader: true }
      ])
    ];

    onOpenReportPreview({
      tipo: 'RECIBO_13',
      titulo: `RECIBO DE PAGAMENTO DE 13º SALÁRIO - EXERCÍCIO ${d.ano}`,
      subtitulo: `Empregador: ${empresa.razaoSocial} • Colaborador: ${d.colaboradorNome} • Matrícula: ${d.matricula} • Parcela: ${d.parcela}`,
      linhas
    });
  };

  // ----------------------------------------------------
  // HANDLERS: RESCISÃO CONTRATUAL
  // ----------------------------------------------------
  const handleCalcularESalvarRescisao = () => {
    try {
      const saldoFGTS = parseFloat(rescisaoSaldoFGTS.replace(/\./g, '').replace(',', '.')) || 0;
      const calc = dbService.calcularRescisaoColaborador({
        empresaId: empresa.id,
        colaboradorId: rescisaoColabId,
        dataDemissao: rescisaoDataDemissao,
        motivoRescisao: rescisaoMotivo,
        tipoAvisoPrevio: rescisaoTipoAviso,
        temFeriasVencidas: rescisaoTemFeriasVencidas,
        saldoBaseFGTS: saldoFGTS
      });
      dbService.salvarCalculoRescisao(calc);
      setCalculosRescisao(dbService.getCalculosRescisao(empresa.id));
      setShowRescisaoModal(false);
      setMensagem(`Rescisão contratual de ${calc.colaboradorNome} calculada com sucesso! Líquido: R$ ${calc.saldoLiquidoRescisao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`);
      setTimeout(() => setMensagem(''), 5000);
    } catch (err: any) {
      alert(err.message || 'Erro ao calcular rescisão.');
    }
  };

  const handleIntegrarRescisao = (id: number) => {
    const res = dbService.integrarRescisaoContabil(id);
    if (res.success) {
      setCalculosRescisao(dbService.getCalculosRescisao(empresa.id));
      setMensagem(`Rescisão integrada à contabilidade no Lote nº ${res.loteId} (Total: R$ ${res.totalLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}).`);
      if (onIntegracaoSucesso) onIntegracaoSucesso();
      setTimeout(() => setMensagem(''), 5000);
    }
  };

  const handleExcluirRescisao = (id: number) => {
    if (confirm('Confirma a exclusão deste cálculo de rescisão?')) {
      dbService.deleteCalculoRescisao(id);
      setCalculosRescisao(dbService.getCalculosRescisao(empresa.id));
    }
  };

  const handleImprimirTRCT = (r: CalculoRescisao) => {
    if (!onOpenReportPreview) return;
    const linhas = [
      { descricao: '--- TERMO DE RESCISÃO DO CONTRATO DE TRABALHO (PORTARIA 1.057/MTE) ---', valor: 0, isHeader: true },
      { descricao: `Motivo: ${r.motivoRescisao.replace(/_/g, ' ')} • Aviso Prévio: ${r.tipoAvisoPrevio} (${r.diasAvisoPrevio} dias)`, valor: 0, isHeader: true },
      { descricao: `Admissão: ${r.dataAdmissao} • Afastamento: ${r.dataDemissao} • Salário Base: R$ ${r.salarioBase.toFixed(2)}`, valor: 0, isHeader: true },
      { descricao: '--- VERBAS RESCISÓRIAS RESCISÓRIAS ---', valor: 0, isHeader: true },
      { descricao: `(+) Saldo de Salário (${r.diasTrabalhadosMes} dias)`, valor: r.saldoSalario },
      ...(r.avisoPrevioIndenizado > 0 ? [{ descricao: `(+) Aviso Prévio Indenizado (${r.diasAvisoPrevio} dias - Lei 12.506/11)`, valor: r.avisoPrevioIndenizado }] : []),
      ...(r.decimoTerceiroProporcional > 0 ? [{ descricao: `(+) 13º Salário Proporcional (${r.avosDecimoTerceiro}/12 avos)`, valor: r.decimoTerceiroProporcional }] : []),
      ...(r.decimoTerceiroIndenizado > 0 ? [{ descricao: `(+) 13º Salário Indenizado (${r.avosDecimoIndenizado}/12 avos)`, valor: r.decimoTerceiroIndenizado }] : []),
      ...(r.feriasVencidas > 0 ? [
        { descricao: '(+) Férias Vencidas Simples', valor: r.feriasVencidas },
        { descricao: '(+) 1/3 Constitucional s/ Férias Vencidas', valor: r.tercoFeriasVencidas }
      ] : []),
      { descricao: `(+) Férias Proporcionais (${r.avosFeriasProporcionais}/12 avos)`, valor: r.feriasProporcionais },
      { descricao: '(+) 1/3 Constitucional s/ Férias Proporcionais', valor: r.tercoFeriasProporcionais },
      ...(r.feriasIndenizadas > 0 ? [
        { descricao: `(+) Férias Indenizadas (${r.avosFeriasIndenizadas}/12 avos)`, valor: r.feriasIndenizadas },
        { descricao: '(+) 1/3 Constitucional s/ Férias Indenizadas', valor: r.tercoFeriasIndenizadas }
      ] : []),
      { descricao: '--- DEDUÇÕES LEGAIS ---', valor: 0, isHeader: true },
      { descricao: '(-) INSS sobre Saldo de Salário', valor: -r.inssSaldoSalario },
      ...(r.inssDecimoTerceiro > 0 ? [{ descricao: '(-) INSS sobre 13º Salário', valor: -r.inssDecimoTerceiro }] : []),
      ...(r.avisoPrevioDescontado > 0 ? [{ descricao: '(-) Aviso Prévio Não Cumprido Descontado', valor: -r.avisoPrevioDescontado }] : []),
      { descricao: '(=) VALOR LÍQUIDO DA RESCISÃO CONTRATUAL', valor: r.saldoLiquidoRescisao, isTotal: true },
      { descricao: `--- INFORMAÇÕES DE FGTS & RESCISÓRIAS ---`, valor: 0, isHeader: true },
      { descricao: `Saldo Base FGTS: R$ ${r.saldoBaseFGTS.toFixed(2)} • Multa Rescisória: R$ ${r.multaRescisoriaFGTS.toFixed(2)} • Cód. Saque: ${r.codigoSaqueFGTS}`, valor: r.multaRescisoriaFGTS, isHeader: true },
      { descricao: `Prazo Máximo de Quitação: ${r.dataPagamento} (Art. 477 § 6º CLT)`, valor: 0, isHeader: true }
    ];

    onOpenReportPreview({
      tipo: 'TRCT',
      titulo: 'TRCT - TERMO DE RESCISÃO DO CONTRATO DE TRABALHO',
      subtitulo: `Empregador: ${empresa.razaoSocial} • Trabalhador: ${r.colaboradorNome} • CPF: ${r.cpf} • Cargo: ${r.cargo}`,
      linhas
    });
  };

  const totalBrutoGeral = folhas.reduce((acc, f) => acc + (f.totalProventos || 0), 0);
  const totalLiquidoGeral = folhas.reduce((acc, f) => acc + (f.salarioLiquido || 0), 0);
  const totalINSSGeral = folhas.reduce((acc, f) => acc + (f.inssSegurado || 0), 0);
  const totalFGTSGeral = folhas.reduce((acc, f) => acc + (f.fgts || 0), 0);

  const provFeriasTotal = provisoes.reduce((acc, p) => acc + p.provisaoFerias + p.provisaoTercoConstitucional, 0);
  const prov13Total = provisoes.reduce((acc, p) => acc + p.provisaoDecimoTerceiro, 0);
  const provEncargosTotal = provisoes.reduce((acc, p) => acc + p.encargosINSSPatronal + p.encargosFGTS, 0);
  const provGeralTotal = provisoes.reduce((acc, p) => acc + p.totalProvisaoMes, 0);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#141414] text-neutral-200 overflow-hidden select-none font-sans">
      {/* Header com 5 Abas */}
      <div className="px-5 py-3.5 bg-[#181818] border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-neutral-100 flex items-center space-x-2">
              <span>Módulo de Folha de Pagamento & Encargos Sociais</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono font-medium border border-emerald-500/30">
                Competência: {empresa.competenciaAtiva}
              </span>
            </h2>
            <p className="text-[11px] text-neutral-400">
              Motor oficial CLT 2026: Folha Mensal, Férias com 1/3, 13º Salário, Rescisões TRCT e Provisões CPC 27
            </p>
          </div>
        </div>

        {/* Seletor de 5 Sub-Abas Fluent */}
        <div className="flex items-center bg-[#101010] p-0.5 rounded-lg border border-white/10 overflow-x-auto">
          <button
            onClick={() => setAbaAtiva('FOLHA_MENSAL')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition flex items-center space-x-1.5 whitespace-nowrap ${
              abaAtiva === 'FOLHA_MENSAL'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Folha Mensal</span>
          </button>

          <button
            onClick={() => setAbaAtiva('FERIAS')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition flex items-center space-x-1.5 whitespace-nowrap ${
              abaAtiva === 'FERIAS'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Férias (CLT)</span>
          </button>

          <button
            onClick={() => setAbaAtiva('DECIMO_TERCEIRO')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition flex items-center space-x-1.5 whitespace-nowrap ${
              abaAtiva === 'DECIMO_TERCEIRO'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>13º Salário</span>
          </button>

          <button
            onClick={() => setAbaAtiva('RESCISAO')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition flex items-center space-x-1.5 whitespace-nowrap ${
              abaAtiva === 'RESCISAO'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <UserMinus className="w-3.5 h-3.5" />
            <span>Rescisão (TRCT)</span>
          </button>

          <button
            onClick={() => {
              setAbaAtiva('PROVISOES');
              setProvisoes(dbService.calcularProvisoesMensais(empresa.id, empresa.competenciaAtiva));
            }}
            className={`px-3 py-1 rounded-md text-xs font-medium transition flex items-center space-x-1.5 whitespace-nowrap ${
              abaAtiva === 'PROVISOES'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Provisões (CPC 27)</span>
          </button>
        </div>

        {/* Botões de Ação por Aba */}
        <div className="flex items-center space-x-2">
          {abaAtiva === 'FOLHA_MENSAL' && (
            <>
              <label
                title="Ao integrar a folha na Contabilidade, lança também a baixa automática do líquido pago no Caixa/Banco (Livro Caixa)"
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded bg-[#141414] border border-white/10 text-[11px] text-neutral-300 cursor-pointer hover:border-emerald-500/40 transition"
              >
                <input
                  type="checkbox"
                  checked={baixarPagamentoCaixaBanco}
                  onChange={e => setBaixarPagamentoCaixaBanco(e.target.checked)}
                  className="rounded border-white/20 bg-neutral-900 text-emerald-500 focus:ring-0"
                />
                <span>Baixar Líquido no Caixa/Banco</span>
              </label>

              <button
                onClick={handleProcessarFolha}
                disabled={processando}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded text-xs font-medium flex items-center space-x-1.5 transition shadow-sm"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>{processando ? 'Calculando...' : 'Calcular Folha Completa'}</span>
              </button>

              <button
                onClick={handleIntegrarContabilidade}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-medium flex items-center space-x-1.5 transition shadow-sm"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Integrar Contabilidade</span>
              </button>

              <button
                onClick={handleImprimirResumoA4}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded border border-white/10 text-xs font-medium flex items-center space-x-1.5 transition"
              >
                <Printer className="w-3.5 h-3.5 text-sky-400" />
                <span>Resumo Geral A4</span>
              </button>
            </>
          )}

          {abaAtiva === 'FERIAS' && (
            <button
              onClick={() => setShowFeriasModal(true)}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-medium flex items-center space-x-1.5 transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Programar / Calcular Férias</span>
            </button>
          )}

          {abaAtiva === 'DECIMO_TERCEIRO' && (
            <>
              <select
                value={parcela13}
                onChange={e => setParcela13(e.target.value as any)}
                className="bg-[#202020] border border-white/10 rounded px-2.5 py-1 text-xs text-white outline-none"
              >
                <option value="PRIMEIRA">1ª Parcela (Adiantamento até 30/Nov)</option>
                <option value="SEGUNDA">2ª Parcela (Quitação até 20/Dez)</option>
              </select>

              <button
                onClick={handleCalcular13}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium flex items-center space-x-1.5 transition shadow-sm"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Processar 13º em Lote</span>
              </button>

              <button
                onClick={handleIntegrar13}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium flex items-center space-x-1.5 transition shadow-sm"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Integrar 13º à Contabilidade</span>
              </button>
            </>
          )}

          {abaAtiva === 'RESCISAO' && (
            <button
              onClick={() => setShowRescisaoModal(true)}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-medium flex items-center space-x-1.5 transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Calcular Nova Rescisão (TRCT)</span>
            </button>
          )}

          {abaAtiva === 'PROVISOES' && (
            <>
              <button
                onClick={handleRecalcularProvisoes}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded border border-white/10 text-xs font-medium flex items-center space-x-1.5 transition"
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Recalcular Provisões</span>
              </button>

              <button
                onClick={handleIntegrarProvisoes}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-medium flex items-center space-x-1.5 transition shadow-sm"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Integrar à Contabilidade</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Alerta de Mensagem */}
      {mensagem && (
        <div className="px-5 py-2.5 bg-emerald-950/80 border-b border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{mensagem}</span>
          </div>
          <button onClick={() => setMensagem('')} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* CONTEÚDO PRINCIPAL: ABA 1 - FOLHA MENSAL */}
      {/* ---------------------------------------------------- */}
      {abaAtiva === 'FOLHA_MENSAL' && (
        <div className="flex-1 overflow-auto custom-scrollbar">
          {/* Painel Rápido para Pequenos Escritórios: Pró-Labore de Sócios (11% INSS), Otimizador Fator R (28%) e Empregado Único MEI */}
          <div className="px-5 py-3 bg-[#181818] border-b border-white/10 grid grid-cols-1 lg:grid-cols-3 gap-3 text-xs">
            {/* Card 1: Pró-Labore Obrigatório de Sócios (11% INSS s/ FGTS) */}
            {(() => {
              const sociosAtivos = colaboradores.filter(c => c.status === 'ATIVO' && c.tipoVinculo !== 'CLT');
              const totalProLaboreAtual = sociosAtivos.reduce((s, c) => s + (c.salarioBase || 0), 0);
              return (
                <div className="bg-[#141414] p-3 rounded-lg border border-white/10 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold text-purple-300 flex items-center space-x-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                        <span>Pró-Labore de Sócios (INSS 11% s/ FGTS)</span>
                      </span>
                      <span className="text-[10px] font-mono bg-purple-500/15 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30">
                        {sociosAtivos.length} Sócio(s)
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      Retirada atual: <strong className="font-mono text-neutral-200">R$ {totalProLaboreAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> • INSS 11%: <strong className="font-mono text-rose-400">R$ {(totalProLaboreAtual * 0.11).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> (CPP Patronal já inclusa no DAS Simples).
                    </p>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-neutral-400 font-mono">
                      Piso Salário Mínimo: R$ {analiseSimplesFolha.salarioMinimoVigente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <button
                      onClick={() => handleAjustarProLaboreSocio('PISO_SALARIO_MINIMO')}
                      className="px-2.5 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded border border-purple-500/30 text-[10px] font-medium transition"
                    >
                      Aplicar 1 Salário Mínimo
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Card 2: Termômetro e Otimizador Automático do Fator R (28% - Anexo III vs Anexo V) */}
            <div className="bg-[#141414] p-3 rounded-lg border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-emerald-300 flex items-center space-x-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Otimizador Fator R ≥ 28% (LC 123/2006)</span>
                  </span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                    analiseSimplesFolha.enquadradoAnexoIII
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}>
                    Fator R: {analiseSimplesFolha.fatorRAtual.toFixed(2)}% ({analiseSimplesFolha.enquadradoAnexoIII ? 'Anexo III - 6%' : 'Anexo V - 15,5%'})
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  {analiseSimplesFolha.enquadradoAnexoIII ? (
                    <>Folha 12M (<strong className="font-mono text-neutral-200">R$ {analiseSimplesFolha.folhaAcumulada12M.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>) já garante tributação reduzida no <strong className="text-emerald-400">Anexo III (6,00%)</strong>.</>
                  ) : (
                    <>Faltam <strong className="font-mono text-amber-300">R$ {analiseSimplesFolha.complementoProLaboreSugerido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês</strong> na folha/pró-labore para migrar do Anexo V (15,5%) ao <strong className="text-emerald-400">Anexo III (6%)</strong>.</>
                  )}
                </p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-neutral-400 font-mono">
                  Economia DAS: ~R$ {analiseSimplesFolha.economiaMensalDasEstimada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
                </span>
                <button
                  onClick={() => handleAjustarProLaboreSocio('OTIMIZAR_FATOR_R_28')}
                  className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded border border-emerald-500/30 text-[10px] font-medium transition flex items-center space-x-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Otimizar Pró-Labore p/ 28%</span>
                </button>
              </div>
            </div>

            {/* Card 3: Empregado Único do MEI (Art. 18-C LC 123/2006 - CPP 3% + FGTS 8%) */}
            <div className="bg-[#141414] p-3 rounded-lg border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-sky-300 flex items-center space-x-1.5">
                    <Users className="w-3.5 h-3.5 text-sky-400" />
                    <span>Regra Empregado Único MEI (Art. 18-C LC 123)</span>
                  </span>
                  <span className="text-[10px] font-mono bg-sky-500/15 text-sky-300 px-1.5 py-0.5 rounded border border-sky-500/30">
                    DAE eSocial MEI: 11% Encargo
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Base Sal. Mínimo (<strong className="font-mono text-neutral-200">R$ {analiseSimplesFolha.resumoEmpregadoUnicoMei.salarioBaseMei.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>): CPP Patronal MEI <strong className="font-mono text-amber-300">3% (R$ {analiseSimplesFolha.resumoEmpregadoUnicoMei.inssPatronalMei3Porcento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})</strong> + FGTS <strong className="font-mono text-purple-300">8% (R$ {analiseSimplesFolha.resumoEmpregadoUnicoMei.fgtsMei8Porcento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})</strong>.
                </p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                <span className="text-neutral-400">
                  INSS Desc. Empregado: R$ {analiseSimplesFolha.resumoEmpregadoUnicoMei.inssSegurado75Porcento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-sky-300 font-semibold">
                  Guia DAE Total: R$ {analiseSimplesFolha.resumoEmpregadoUnicoMei.totalGuiaDaeMei.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-[#1e1e1e] border-b border-white/10 text-neutral-400 font-semibold uppercase tracking-wider text-[11px] z-10">
              <tr>
                <th className="py-2.5 px-3 w-16 text-center">Matr.</th>
                <th className="py-2.5 px-3">Colaborador / Beneficiário</th>
                <th className="py-2.5 px-3 w-28">CPF</th>
                <th className="py-2.5 px-3 w-24 text-center">Vínculo</th>
                <th className="py-2.5 px-3 w-28 text-right">Salário Bruto</th>
                <th className="py-2.5 px-3 w-28 text-right">Desc. INSS</th>
                <th className="py-2.5 px-3 w-24 text-right">Desc. IRRF</th>
                <th className="py-2.5 px-3 w-28 text-right">Salário Líquido</th>
                <th className="py-2.5 px-3 w-24 text-right">FGTS 8%</th>
                <th className="py-2.5 px-3 w-44 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-[12px]">
              {colaboradores.filter(c => c.status === 'ATIVO').map((colab) => {
                const folha = folhas.find(f => f.colaboradorId === colab.id);
                const vars = dbService.getVariavelColaborador(colab.id, empresa.competenciaAtiva);
                const temVariaveis = !!vars && ((vars.horasExtras50 || 0) > 0 || (vars.horasExtras100 || 0) > 0 || (vars.faltasDias || 0) > 0 || vars.periculosidade || vars.grauInsalubridade !== 'NENHUM');

                return (
                  <tr key={colab.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-2.5 px-3 text-center text-neutral-400">{colab.matricula}</td>
                    <td className="py-2.5 px-3 text-neutral-100 font-bold font-sans">
                      <div className="flex items-center space-x-2">
                        <span>{colab.nome}</span>
                        {temVariaveis && (
                          <span className="text-[10px] bg-sky-500/20 text-sky-400 px-1.5 py-0.2 rounded font-mono font-normal border border-sky-500/30">
                            Variáveis
                          </span>
                        )}
                      </div>
                      <span className="block text-[10px] text-neutral-400 font-normal">{colab.cargo}</span>
                    </td>
                    <td className="py-2.5 px-3 text-neutral-300">{colab.cpf}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-medium ${
                        colab.tipoVinculo === 'CLT'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      }`}>
                        {colab.tipoVinculo}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-neutral-200">
                      R$ {(folha ? folha.totalProventos : colab.salarioBase)?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right text-rose-400">
                      {folha?.inssSegurado ? `- R$ ${folha.inssSegurado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-rose-400">
                      {folha?.irrf ? `- R$ ${folha.irrf.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                      R$ {(folha ? folha.salarioLiquido : colab.salarioBase)?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right text-purple-400">
                      R$ {(folha ? folha.fgts : (colab.tipoVinculo === 'CLT' ? colab.salarioBase * 0.08 : 0))?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-center font-sans">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => handleAbrirVariaveis(colab)}
                          title="Lançar Horas Extras, Faltas e Adicionais"
                          className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-sky-400 rounded border border-white/10 text-[11px] font-medium flex items-center space-x-1 transition"
                        >
                          <Sliders className="w-3 h-3" />
                          <span>Variáveis</span>
                        </button>
                        <button
                          onClick={() => handleImprimirHolerite(colab)}
                          title="Imprimir Holerite Oficial A4"
                          className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded border border-white/10 text-[11px] font-medium flex items-center space-x-1 transition"
                        >
                          <Printer className="w-3 h-3 text-emerald-400" />
                          <span>Holerite</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* CONTEÚDO PRINCIPAL: ABA 2 - FÉRIAS (ART. 129 A 145 CLT) */}
      {/* ---------------------------------------------------- */}
      {abaAtiva === 'FERIAS' && (
        <div className="flex-1 overflow-auto custom-scrollbar">
          <div className="p-4 bg-[#181818] border-b border-white/10 grid grid-cols-4 gap-4 text-xs font-mono">
            <div className="bg-[#141414] p-3 rounded-lg border border-white/10">
              <span className="text-[10px] text-neutral-400 block font-sans">Total de Férias Programadas</span>
              <strong className="text-base text-neutral-100">{calculosFerias.length} período(s)</strong>
            </div>
            <div className="bg-[#141414] p-3 rounded-lg border border-white/10">
              <span className="text-[10px] text-neutral-400 block font-sans">Total Proventos de Férias</span>
              <strong className="text-base text-amber-400">
                R$ {calculosFerias.reduce((a, b) => a + b.valorTotalProventos, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </strong>
            </div>
            <div className="bg-[#141414] p-3 rounded-lg border border-white/10">
              <span className="text-[10px] text-neutral-400 block font-sans">Total Líquido a Pagar</span>
              <strong className="text-base text-emerald-400">
                R$ {calculosFerias.reduce((a, b) => a + b.valorLiquidoReceber, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </strong>
            </div>
            <div className="bg-[#141414] p-3 rounded-lg border border-white/10">
              <span className="text-[10px] text-neutral-400 block font-sans">Total Integradas à Contabilidade</span>
              <strong className="text-base text-sky-400">
                {calculosFerias.filter(f => f.integradaContabil).length} de {calculosFerias.length}
              </strong>
            </div>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-[#1e1e1e] border-b border-white/10 text-neutral-400 font-semibold uppercase tracking-wider text-[11px] z-10">
              <tr>
                <th className="py-2.5 px-3">Colaborador / Cargo</th>
                <th className="py-2.5 px-3 w-36">Período Aquisitivo</th>
                <th className="py-2.5 px-3 w-36">Período de Gozo</th>
                <th className="py-2.5 px-3 w-16 text-center">Dias</th>
                <th className="py-2.5 px-3 w-28 text-right">Férias + 1/3</th>
                <th className="py-2.5 px-3 w-24 text-right">Desc. INSS</th>
                <th className="py-2.5 px-3 w-24 text-right">Desc. IRRF</th>
                <th className="py-2.5 px-3 w-28 text-right text-emerald-400">Líquido a Pagar</th>
                <th className="py-2.5 px-3 w-28 text-center">Data Limite Pagto</th>
                <th className="py-2.5 px-3 w-24 text-center">Status</th>
                <th className="py-2.5 px-3 w-40 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-[12px]">
              {calculosFerias.map((f) => (
                <tr key={f.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="py-2.5 px-3 font-sans font-bold text-neutral-100">
                    <div>{f.colaboradorNome}</div>
                    <span className="text-[10px] text-neutral-400 font-normal">{f.cargo} • Matr. {f.matricula}</span>
                  </td>
                  <td className="py-2.5 px-3 text-neutral-300 text-[11px]">{f.periodoAquisitivoInicio} a {f.periodoAquisitivoFim}</td>
                  <td className="py-2.5 px-3 text-amber-300 text-[11px] font-semibold">{f.dataInicioGozo} a {f.dataFimGozo}</td>
                  <td className="py-2.5 px-3 text-center">{f.diasGozo}d</td>
                  <td className="py-2.5 px-3 text-right text-neutral-200">
                    R$ {(f.valorDiasFerias + f.valorTercoConstitucional).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right text-rose-400">- R$ {f.valorINSS.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right text-rose-400">- R$ {f.valorIRRF.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                    R$ {f.valorLiquidoReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-center text-sky-400 text-[11px]">{f.dataPagamento}</td>
                  <td className="py-2.5 px-3 text-center font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      f.integradaContabil 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {f.integradaContabil ? 'Integrado' : 'Pendente'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-sans">
                    <div className="flex items-center justify-center space-x-1">
                      <button
                        onClick={() => handleImprimirReciboFerias(f)}
                        title="Imprimir Recibo de Férias e Aviso A4"
                        className="p-1 hover:bg-neutral-800 text-sky-400 rounded"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      {!f.integradaContabil && (
                        <button
                          onClick={() => handleIntegrarFerias(f.id)}
                          title="Integrar à Contabilidade"
                          className="p-1 hover:bg-neutral-800 text-emerald-400 rounded"
                        >
                          <Zap className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleExcluirFerias(f.id)}
                        title="Excluir Cálculo"
                        className="p-1 hover:bg-neutral-800 text-rose-400 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* CONTEÚDO PRINCIPAL: ABA 3 - 13º SALÁRIO */}
      {/* ---------------------------------------------------- */}
      {abaAtiva === 'DECIMO_TERCEIRO' && (
        <div className="flex-1 overflow-auto custom-scrollbar">
          <div className="p-4 bg-[#181818] border-b border-white/10 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-4">
              <span className="text-neutral-300">Exercício: <strong className="text-white">{ano13}</strong></span>
              <span className="text-neutral-300">Parcela Selecionada: <strong className="text-blue-400">{parcela13 === 'PRIMEIRA' ? '1ª Parcela (50% Adiantamento)' : '2ª Parcela (Quitação)'}</strong></span>
            </div>
            <div className="flex items-center space-x-5">
              <span>Total Bruto: <strong className="text-white">R$ {calculos13.filter(c => c.parcela === parcela13).reduce((a, b) => a + b.valorBrutoParcela, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
              <span>Líquido: <strong className="text-emerald-400">R$ {calculos13.filter(c => c.parcela === parcela13).reduce((a, b) => a + b.valorLiquidoParcela, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
              <span>FGTS 8%: <strong className="text-purple-400">R$ {calculos13.filter(c => c.parcela === parcela13).reduce((a, b) => a + b.valorFGTS, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
            </div>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-[#1e1e1e] border-b border-white/10 text-neutral-400 font-semibold uppercase tracking-wider text-[11px] z-10">
              <tr>
                <th className="py-2.5 px-3 w-16 text-center">Matr.</th>
                <th className="py-2.5 px-3">Colaborador CLT</th>
                <th className="py-2.5 px-3 w-28 text-right">Salário Base</th>
                <th className="py-2.5 px-3 w-20 text-center">Avos</th>
                <th className="py-2.5 px-3 w-28 text-right">13º Integral</th>
                <th className="py-2.5 px-3 w-28 text-right text-blue-300">Valor Parcela</th>
                <th className="py-2.5 px-3 w-24 text-right text-rose-400">Desc. Adiant.</th>
                <th className="py-2.5 px-3 w-24 text-right text-rose-400">Desc. INSS</th>
                <th className="py-2.5 px-3 w-24 text-right text-rose-400">Desc. IRRF</th>
                <th className="py-2.5 px-3 w-28 text-right text-emerald-400 font-bold">Líquido 13º</th>
                <th className="py-2.5 px-3 w-28 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-[12px]">
              {calculos13.filter(d => d.parcela === parcela13).map((d) => (
                <tr key={d.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="py-2.5 px-3 text-center text-neutral-400">{d.matricula}</td>
                  <td className="py-2.5 px-3 font-sans font-medium text-neutral-100">{d.colaboradorNome}</td>
                  <td className="py-2.5 px-3 text-right text-neutral-300">R$ {d.salarioBase.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-3 text-center text-neutral-300">{d.mesesTrabalhadosAvos}/12</td>
                  <td className="py-2.5 px-3 text-right text-neutral-300">R$ {d.valorIntegral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-3 text-right text-blue-300 font-semibold">R$ {d.valorBrutoParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-3 text-right text-rose-400">{d.valorAdiantamentoDeduzido > 0 ? `- R$ ${d.valorAdiantamentoDeduzido.toFixed(2)}` : '-'}</td>
                  <td className="py-2.5 px-3 text-right text-rose-400">{d.valorINSS > 0 ? `- R$ ${d.valorINSS.toFixed(2)}` : '-'}</td>
                  <td className="py-2.5 px-3 text-right text-rose-400">{d.valorIRRF > 0 ? `- R$ ${d.valorIRRF.toFixed(2)}` : '-'}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-400">R$ {d.valorLiquidoParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-3 text-center font-sans">
                    <button
                      onClick={() => handleImprimirRecibo13(d)}
                      title="Imprimir Recibo de 13º Salário A4"
                      className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-sky-400 rounded border border-white/10 text-[11px] font-medium flex items-center space-x-1 mx-auto transition"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Recibo A4</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* CONTEÚDO PRINCIPAL: ABA 4 - RESCISÃO (TRCT OFICIAL) */}
      {/* ---------------------------------------------------- */}
      {abaAtiva === 'RESCISAO' && (
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-[#1e1e1e] border-b border-white/10 text-neutral-400 font-semibold uppercase tracking-wider text-[11px] z-10">
              <tr>
                <th className="py-2.5 px-3">Colaborador / Cargo</th>
                <th className="py-2.5 px-3 w-32">Motivo Afastamento</th>
                <th className="py-2.5 px-3 w-28 text-center">Data Demissão</th>
                <th className="py-2.5 px-3 w-24 text-center">Aviso Prévio</th>
                <th className="py-2.5 px-3 w-28 text-right">Saldo Salário</th>
                <th className="py-2.5 px-3 w-28 text-right">Verbas Rescisórias</th>
                <th className="py-2.5 px-3 w-24 text-right text-rose-400">Deduções</th>
                <th className="py-2.5 px-3 w-28 text-right text-emerald-400 font-bold">Líquido TRCT</th>
                <th className="py-2.5 px-3 w-28 text-right text-purple-400">Multa FGTS</th>
                <th className="py-2.5 px-3 w-24 text-center">Status</th>
                <th className="py-2.5 px-3 w-36 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-[12px]">
              {calculosRescisao.map((r) => (
                <tr key={r.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="py-2.5 px-3 font-sans font-bold text-neutral-100">
                    <div>{r.colaboradorNome}</div>
                    <span className="text-[10px] text-neutral-400 font-normal">{r.cargo} • CPF: {r.cpf}</span>
                  </td>
                  <td className="py-2.5 px-3 font-sans text-neutral-300 text-[11px]">
                    {r.motivoRescisao.replace(/_/g, ' ')}
                  </td>
                  <td className="py-2.5 px-3 text-center text-neutral-300">{r.dataDemissao}</td>
                  <td className="py-2.5 px-3 text-center font-sans text-[11px]">
                    <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-white/10">
                      {r.tipoAvisoPrevio} ({r.diasAvisoPrevio}d)
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-neutral-200">R$ {r.saldoSalario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-3 text-right text-neutral-200">R$ {r.totalBrutoVerbas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-3 text-right text-rose-400">- R$ {r.totalDeducoes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-400">R$ {r.saldoLiquidoRescisao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-3 text-right text-purple-400">R$ {r.multaRescisoriaFGTS.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-3 text-center font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      r.integradaContabil 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {r.integradaContabil ? 'Integrado' : 'Calculado'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-sans">
                    <div className="flex items-center justify-center space-x-1">
                      <button
                        onClick={() => handleImprimirTRCT(r)}
                        title="Imprimir TRCT Oficial Portaria 1.057"
                        className="p-1 hover:bg-neutral-800 text-sky-400 rounded"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      {!r.integradaContabil && (
                        <button
                          onClick={() => handleIntegrarRescisao(r.id)}
                          title="Integrar à Contabilidade"
                          className="p-1 hover:bg-neutral-800 text-emerald-400 rounded"
                        >
                          <Zap className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleExcluirRescisao(r.id)}
                        title="Excluir Cálculo"
                        className="p-1 hover:bg-neutral-800 text-rose-400 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* CONTEÚDO PRINCIPAL: ABA 5 - PROVISÕES CPC 27 */}
      {/* ---------------------------------------------------- */}
      {abaAtiva === 'PROVISOES' && (
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-[#1e1e1e] border-b border-white/10 text-neutral-400 font-semibold uppercase tracking-wider text-[11px] z-10">
              <tr>
                <th className="py-2.5 px-3 w-16 text-center">Matr.</th>
                <th className="py-2.5 px-3">Colaborador CLT</th>
                <th className="py-2.5 px-3 w-28 text-right">Salário Base</th>
                <th className="py-2.5 px-3 w-28 text-right text-amber-400">Férias (1/12)</th>
                <th className="py-2.5 px-3 w-24 text-right text-amber-400">1/3 Constit.</th>
                <th className="py-2.5 px-3 w-28 text-right text-blue-400">13º Sal. (1/12)</th>
                <th className="py-2.5 px-3 w-24 text-right text-purple-400">CPP 20%</th>
                <th className="py-2.5 px-3 w-24 text-right text-purple-400">FGTS 8%</th>
                <th className="py-2.5 px-3 w-32 text-right text-emerald-400">Total Provisão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-[12px]">
              {provisoes.filter(p => p.salarioBase > 0).map((prov) => (
                <tr key={prov.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="py-2.5 px-3 text-center text-neutral-400">{prov.matricula}</td>
                  <td className="py-2.5 px-3 font-sans font-medium text-neutral-200">
                    {prov.colaboradorNome}
                  </td>
                  <td className="py-2.5 px-3 text-right text-neutral-300">
                    R$ {prov.salarioBase.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right text-amber-300">
                    R$ {prov.provisaoFerias.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right text-amber-400">
                    R$ {prov.provisaoTercoConstitucional.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right text-blue-300">
                    R$ {prov.provisaoDecimoTerceiro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right text-purple-300">
                    R$ {prov.encargosINSSPatronal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right text-purple-400">
                    R$ {prov.encargosFGTS.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                    R$ {prov.totalProvisaoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer com Totais */}
      <div className="p-3 bg-[#181818] border-t border-white/10 flex flex-wrap items-center justify-between text-xs font-mono gap-3">
        {abaAtiva === 'FOLHA_MENSAL' ? (
          <>
            <div className="text-neutral-400 font-sans">
              Vínculos Calculados: <strong className="text-neutral-200 font-bold font-mono">{folhas.length}</strong> de <strong className="text-neutral-200 font-mono">{colaboradores.filter(c => c.status === 'ATIVO').length}</strong> ativos
            </div>
            <div className="flex items-center space-x-5">
              <span>Bruto: <strong className="text-neutral-100">R$ {totalBrutoGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
              <span>•</span>
              <span>INSS Segurados: <strong className="text-rose-400">- R$ {totalINSSGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
              <span>•</span>
              <span>Líquido: <strong className="text-emerald-400">R$ {totalLiquidoGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
              <span>•</span>
              <span>FGTS 8%: <strong className="text-purple-400">R$ {totalFGTSGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
            </div>
          </>
        ) : (
          <>
            <div className="text-neutral-400 font-sans">
              Registros Ativos na Sub-Aba: <strong className="text-neutral-200 font-bold font-mono">
                {abaAtiva === 'FERIAS' ? calculosFerias.length : abaAtiva === 'DECIMO_TERCEIRO' ? calculos13.length : abaAtiva === 'RESCISAO' ? calculosRescisao.length : provisoes.length}
              </strong>
            </div>
            <div className="flex items-center space-x-5">
              <span>Férias + 1/3: <strong className="text-amber-400">R$ {provFeriasTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
              <span>•</span>
              <span>13º Salário: <strong className="text-blue-400">R$ {prov13Total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
              <span>•</span>
              <span>Encargos: <strong className="text-purple-400">R$ {provEncargosTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
              <span>•</span>
              <span>Total Provisões: <strong className="text-emerald-400">R$ {provGeralTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
            </div>
          </>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* MODAL 1: PROGRAMAÇÃO E CÁLCULO DE FÉRIAS */}
      {/* ---------------------------------------------------- */}
      {showFeriasModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-white/15 rounded-xl w-full max-w-xl shadow-2xl overflow-hidden animate-scaleUp">
            <div className="bg-[#202020] px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Sun className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-semibold text-white">Programação & Cálculo de Férias</h3>
                  <p className="text-[11px] text-neutral-400">Conforme Artigos 129 a 145 da Consolidação das Leis do Trabalho (CLT)</p>
                </div>
              </div>
              <button onClick={() => setShowFeriasModal(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1">Colaborador CLT</label>
                <select
                  value={feriasColabId}
                  onChange={e => setFeriasColabId(Number(e.target.value))}
                  className="w-full bg-[#202020] border border-white/10 rounded px-3 py-1.5 text-xs text-white outline-none"
                >
                  {colaboradores.filter(c => c.tipoVinculo === 'CLT' && c.status === 'ATIVO').map(c => (
                    <option key={c.id} value={c.id}>
                      {c.matricula} - {c.nome} ({c.cargo}) - Salário: R$ {c.salarioBase.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">Período Aquisitivo Início</label>
                  <input
                    type="date"
                    value={feriasAquisitivoIni}
                    onChange={e => setFeriasAquisitivoIni(e.target.value)}
                    className="w-full bg-[#202020] border border-white/10 rounded px-3 py-1.5 text-xs text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">Período Aquisitivo Fim</label>
                  <input
                    type="date"
                    value={feriasAquisitivoFim}
                    onChange={e => setFeriasAquisitivoFim(e.target.value)}
                    className="w-full bg-[#202020] border border-white/10 rounded px-3 py-1.5 text-xs text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">Início do Gozo das Férias</label>
                  <input
                    type="date"
                    value={feriasGozoIni}
                    onChange={e => setFeriasGozoIni(e.target.value)}
                    className="w-full bg-[#202020] border border-white/10 rounded px-3 py-1.5 text-xs text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">Dias de Gozo</label>
                  <select
                    value={feriasDiasGozo}
                    onChange={e => setFeriasDiasGozo(Number(e.target.value))}
                    className="w-full bg-[#202020] border border-white/10 rounded px-3 py-1.5 text-xs text-white outline-none"
                  >
                    <option value={30}>30 dias (Integral)</option>
                    <option value={20}>20 dias (com 10 dias abono)</option>
                    <option value={15}>15 dias (1º período)</option>
                    <option value={10}>10 dias</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 space-y-2">
                <label className="flex items-center space-x-2 text-xs text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={feriasAbono}
                    onChange={e => setFeriasAbono(e.target.checked)}
                    className="rounded border-white/20 bg-neutral-800 text-amber-500"
                  />
                  <span>Venda de 1/3 de férias (Abono Pecuniário - 10 dias isentos de tributação)</span>
                </label>

                <label className="flex items-center space-x-2 text-xs text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={feriasAdiantar13}
                    onChange={e => setFeriasAdiantar13(e.target.checked)}
                    className="rounded border-white/20 bg-neutral-800 text-amber-500"
                  />
                  <span>Pagar adiantamento de 50% da 1ª parcela do 13º Salário juntamente com as férias</span>
                </label>
              </div>
            </div>

            <div className="bg-[#202020] px-5 py-3 border-t border-white/10 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowFeriasModal(false)}
                className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white bg-transparent rounded border border-white/10"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCalcularESalvarFerias}
                className="px-4 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-500 rounded shadow-sm"
              >
                Calcular e Salvar Férias
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 2: CÁLCULO DE RESCISÃO CONTRATUAL (TRCT) */}
      {/* ---------------------------------------------------- */}
      {showRescisaoModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-white/15 rounded-xl w-full max-w-xl shadow-2xl overflow-hidden animate-scaleUp">
            <div className="bg-[#202020] px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <UserMinus className="w-5 h-5 text-rose-400" />
                <div>
                  <h3 className="text-sm font-semibold text-white">Rescisão Contratual & TRCT Oficial</h3>
                  <p className="text-[11px] text-neutral-400">Portaria nº 1.057/MTE com integração contábil e apuração de FGTS</p>
                </div>
              </div>
              <button onClick={() => setShowRescisaoModal(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1">Colaborador a ser Desligado</label>
                <select
                  value={rescisaoColabId}
                  onChange={e => setRescisaoColabId(Number(e.target.value))}
                  className="w-full bg-[#202020] border border-white/10 rounded px-3 py-1.5 text-xs text-white outline-none"
                >
                  {colaboradores.filter(c => c.tipoVinculo === 'CLT').map(c => (
                    <option key={c.id} value={c.id}>
                      {c.matricula} - {c.nome} ({c.cargo}) • Salário: R$ {c.salarioBase.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">Data do Desligamento / Afastamento</label>
                  <input
                    type="date"
                    value={rescisaoDataDemissao}
                    onChange={e => setRescisaoDataDemissao(e.target.value)}
                    className="w-full bg-[#202020] border border-white/10 rounded px-3 py-1.5 text-xs text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">Motivo do Desligamento</label>
                  <select
                    value={rescisaoMotivo}
                    onChange={e => setRescisaoMotivo(e.target.value as any)}
                    className="w-full bg-[#202020] border border-white/10 rounded px-3 py-1.5 text-xs text-white outline-none"
                  >
                    <option value="SEM_JUSTA_CAUSA">1 - Demissão Sem Justa Causa pelo Empregador</option>
                    <option value="PEDIDO_DEMISSAO">2 - Pedido de Demissão pelo Empregado</option>
                    <option value="COM_JUSTA_CAUSA">3 - Demissão Com Justa Causa (Falta Grave)</option>
                    <option value="TERMINO_CONTRATO">4 - Término de Contrato de Experiência / Prazo</option>
                    <option value="ACORDO_MUTUO">5 - Rescisão por Acordo Comum (Art. 484-A CLT)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">Tipo de Aviso Prévio</label>
                  <select
                    value={rescisaoTipoAviso}
                    onChange={e => setRescisaoTipoAviso(e.target.value as any)}
                    className="w-full bg-[#202020] border border-white/10 rounded px-3 py-1.5 text-xs text-white outline-none"
                  >
                    <option value="INDENIZADO">Indenizado pelo Empregador</option>
                    <option value="TRABALHADO">Trabalhado</option>
                    <option value="DISPENSADO">Dispensado do Cumprimento</option>
                    <option value="DESCONTADO">Descontado do Empregado (Pedido)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">Saldo FGTS para Fins Rescisórios (R$)</label>
                  <input
                    type="text"
                    value={rescisaoSaldoFGTS}
                    onChange={e => setRescisaoSaldoFGTS(e.target.value)}
                    className="w-full bg-[#202020] border border-white/10 rounded px-3 py-1.5 text-xs text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-white/10">
                <label className="flex items-center space-x-2 text-xs text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rescisaoTemFeriasVencidas}
                    onChange={e => setRescisaoTemFeriasVencidas(e.target.checked)}
                    className="rounded border-white/20 bg-neutral-800 text-rose-500"
                  />
                  <span>Colaborador possui 1 período de férias vencidas pendente de gozo</span>
                </label>
              </div>
            </div>

            <div className="bg-[#202020] px-5 py-3 border-t border-white/10 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowRescisaoModal(false)}
                className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white bg-transparent rounded border border-white/10"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCalcularESalvarRescisao}
                className="px-4 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded shadow-sm"
              >
                Calcular e Emitir TRCT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 3: LANÇAMENTO DE VARIÁVEIS DO COLABORADOR */}
      {/* ---------------------------------------------------- */}
      {showVariaveisModal && colabSelecionado && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-white/15 rounded-xl w-full max-w-xl shadow-2xl overflow-hidden animate-scaleUp">
            <div className="bg-[#202020] px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Clock className="w-5 h-5 text-sky-400" />
                <div>
                  <h3 className="text-sm font-semibold text-white">Lançamento de Variáveis da Competência</h3>
                  <p className="text-[11px] text-neutral-400">
                    {colabSelecionado.matricula} - {colabSelecionado.nome} ({colabSelecionado.cargo}) • Comp. {empresa.competenciaAtiva}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowVariaveisModal(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">Horas Extras 50%</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={horasExtras50}
                    onChange={e => setHorasExtras50(Number(e.target.value))}
                    className="w-full bg-[#202020] border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">Horas Extras 100% (Domingos/Feriados)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={horasExtras100}
                    onChange={e => setHorasExtras100(Number(e.target.value))}
                    className="w-full bg-[#202020] border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">Adicional Noturno (Horas)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={adicionalNoturnoHoras}
                    onChange={e => setAdicionalNoturnoHoras(Number(e.target.value))}
                    className="w-full bg-[#202020] border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">Adicional Insalubridade</label>
                  <select
                    value={grauInsalubridade}
                    onChange={e => setGrauInsalubridade(e.target.value as any)}
                    className="w-full bg-[#202020] border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="NENHUM">Não Possui</option>
                    <option value="MINIMO">Mínimo (10% s/ SM)</option>
                    <option value="MEDIO">Médio (20% s/ SM)</option>
                    <option value="MAXIMO">Máximo (40% s/ SM)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">Faltas Injustificadas (Dias)</label>
                  <input
                    type="number"
                    min="0"
                    value={faltasDias}
                    onChange={e => setFaltasDias(Number(e.target.value))}
                    className="w-full bg-[#202020] border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">Faltas / Atrasos (Horas)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={faltasHoras}
                    onChange={e => setFaltasHoras(Number(e.target.value))}
                    className="w-full bg-[#202020] border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">Adiantamento Salarial Pago (R$)</label>
                  <input
                    type="text"
                    value={adiantamentoSalarial}
                    onChange={e => setAdiantamentoSalarial(e.target.value)}
                    placeholder="0,00"
                    className="w-full bg-[#202020] border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div className="col-span-2 space-y-2 pt-2 border-t border-white/10">
                  <label className="flex items-center space-x-2 text-xs text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={periculosidade}
                      onChange={e => setPericulosidade(e.target.checked)}
                      className="rounded border-white/20 bg-neutral-800 text-sky-500"
                    />
                    <span>Adicional de Periculosidade (30% sobre o salário base)</span>
                  </label>

                  <label className="flex items-center space-x-2 text-xs text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={descontoValeTransporte}
                      onChange={e => setDescontoValeTransporte(e.target.checked)}
                      className="rounded border-white/20 bg-neutral-800 text-sky-500"
                    />
                    <span>Desconto legal de Vale Transporte (até 6% do salário base)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-[#202020] px-5 py-3 border-t border-white/10 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowVariaveisModal(false)}
                className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white bg-transparent rounded border border-white/10"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSalvarVariaveis}
                className="px-4 py-1.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 rounded shadow-sm"
              >
                Salvar Variáveis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
