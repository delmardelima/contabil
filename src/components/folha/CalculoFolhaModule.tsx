import React, { useState } from 'react';
import { dbService } from '../../db/sqliteService';
import { Empresa, Colaborador, FolhaMensal, VariaveisColaborador, ProvisaoColaborador } from '../../types/contabil';
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
  TrendingUp
} from 'lucide-react';

interface CalculoFolhaModuleProps {
  empresa: Empresa;
  onOpenReportPreview?: (config: {
    tipo: 'HOLERITE' | 'RESUMO_FOLHA';
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
  const [abaAtiva, setAbaAtiva] = useState<'FOLHA_MENSAL' | 'PROVISOES'>('FOLHA_MENSAL');
  const [folhas, setFolhas] = useState<FolhaMensal[]>(() => {
    return dbService.getFolhasCalculadas(empresa.id, empresa.competenciaAtiva);
  });
  const [colaboradores, setColaboradores] = useState<Colaborador[]>(() => dbService.getColaboradores(empresa.id));
  const [provisoes, setProvisoes] = useState<ProvisaoColaborador[]>(() => {
    return dbService.calcularProvisoesMensais(empresa.id, empresa.competenciaAtiva);
  });
  const [processando, setProcessando] = useState<boolean>(false);
  const [mensagem, setMensagem] = useState<string>('');
  
  // Modal de Lançamento de Variáveis
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

  // Abrir Modal de Variáveis do Colaborador
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
    setMensagem(`Variáveis de ${colabSelecionado.nome} para ${empresa.competenciaAtiva} salvas com sucesso.`);
    setTimeout(() => setMensagem(''), 4000);
  };

  // Processamento em lote da folha com motor oficial CLT / RFB 2026
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

        // Obter variáveis salvas para a competência
        const vars = dbService.getVariavelColaborador(colab.id, empresa.competenciaAtiva);

        // 1. Proventos
        const proventos: any[] = [];
        
        // Rubrica Salário Base ou Pró-Labore
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
          // Horas Extras 50%
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

          // Horas Extras 100%
          if (vars.horasExtras100 && vars.horasExtras100 > 0) {
            const valHE100 = Math.round((vars.horasExtras100 * valorHora * 2.0) * 100) / 100;
            proventos.push({
              rubricaId: 3,
              codigo: '011',
              nome: 'Horas Extras 100% (Domingos/Feriados)',
              tipo: 'PROVENTO',
              referencia: vars.horasExtras100,
              valor: valHE100
            });
            totalVariaveis += valHE100;
          }

          // Adicional Noturno (20%)
          if (vars.adicionalNoturnoHoras && vars.adicionalNoturnoHoras > 0) {
            const valNot = Math.round((vars.adicionalNoturnoHoras * valorHora * 0.20) * 100) / 100;
            proventos.push({
              rubricaId: 3,
              codigo: '015',
              nome: 'Adicional Noturno (20%)',
              tipo: 'PROVENTO',
              referencia: vars.adicionalNoturnoHoras,
              valor: valNot
            });
            totalVariaveis += valNot;
          }

          // DSR sobre Variáveis (HE + Noturno)
          if (totalVariaveis > 0) {
            const valDSR = Math.round(((totalVariaveis / 25) * 5) * 100) / 100;
            proventos.push({
              rubricaId: 3,
              codigo: '020',
              nome: 'Descanso Semanal Remunerado (DSR s/ HE)',
              tipo: 'PROVENTO',
              referencia: 5,
              valor: valDSR
            });
          }

          // Insalubridade s/ Salário Mínimo (10%, 20% ou 40%)
          if (vars.grauInsalubridade && vars.grauInsalubridade !== 'NENHUM') {
            const perc = vars.grauInsalubridade === 'MINIMO' ? 0.10 : (vars.grauInsalubridade === 'MEDIO' ? 0.20 : 0.40);
            const valInsalub = Math.round((SALARIO_MINIMO_2026 * perc) * 100) / 100;
            proventos.push({
              rubricaId: 3,
              codigo: '030',
              nome: `Adicional Insalubridade (${(perc * 100).toFixed(0)}% SM)`,
              tipo: 'PROVENTO',
              referencia: perc * 100,
              valor: valInsalub
            });
          }

          // Periculosidade (30% sobre Salário Base)
          if (vars.periculosidade) {
            const valPeric = Math.round((salBase * 0.30) * 100) / 100;
            proventos.push({
              rubricaId: 3,
              codigo: '035',
              nome: 'Adicional de Periculosidade (30%)',
              tipo: 'PROVENTO',
              referencia: 30,
              valor: valPeric
            });
          }
        }

        // 2. Descontos
        const descontos: any[] = [];

        // Faltas Dias e Horas
        if (isCLT && vars) {
          if (vars.faltasDias && vars.faltasDias > 0) {
            const valFalta = Math.round((vars.faltasDias * (salBase / 30)) * 100) / 100;
            descontos.push({
              rubricaId: 6,
              codigo: '101',
              nome: 'Faltas Injustificadas (Dias)',
              tipo: 'DESCONTO',
              referencia: vars.faltasDias,
              valor: valFalta
            });
          }
          if (vars.faltasHoras && vars.faltasHoras > 0) {
            const valFaltaH = Math.round((vars.faltasHoras * valorHora) * 100) / 100;
            descontos.push({
              rubricaId: 6,
              codigo: '102',
              nome: 'Faltas / Atrasos (Horas)',
              tipo: 'DESCONTO',
              referencia: vars.faltasHoras,
              valor: valFaltaH
            });
          }
        }

        const totalBruto = proventos.reduce((acc, p) => acc + p.valor, 0);
        const totalFaltas = descontos.reduce((acc, d) => acc + d.valor, 0);
        const baseCalculoINSS = Math.max(0, totalBruto - totalFaltas);

        // INSS Progressivo 2026 Oficial
        let inssSeg = 0;
        if (isCLT) {
          if (baseCalculoINSS <= 1518.00) {
            inssSeg = baseCalculoINSS * 0.075;
          } else if (baseCalculoINSS <= 2793.88) {
            inssSeg = (1518.00 * 0.075) + ((baseCalculoINSS - 1518.00) * 0.09);
          } else if (baseCalculoINSS <= 4190.83) {
            inssSeg = (1518.00 * 0.075) + ((2793.88 - 1518.00) * 0.09) + ((baseCalculoINSS - 2793.88) * 0.12);
          } else if (baseCalculoINSS <= 8157.41) {
            inssSeg = (1518.00 * 0.075) + ((2793.88 - 1518.00) * 0.09) + ((4190.83 - 2793.88) * 0.12) + ((baseCalculoINSS - 4190.83) * 0.14);
          } else {
            inssSeg = 951.63; // Teto INSS 2026
          }
        } else {
          // Pró-Labore: 11% retido (limitado ao teto)
          inssSeg = Math.min(baseCalculoINSS * 0.11, 897.31);
        }
        inssSeg = Math.round(inssSeg * 100) / 100;

        descontos.push({
          rubricaId: 4,
          codigo: '100',
          nome: isCLT ? 'INSS Retido Segurado' : 'INSS Retido Pró-Labore (11%)',
          tipo: 'DESCONTO',
          referencia: isCLT ? ((inssSeg / (baseCalculoINSS || 1)) * 100) : 11.0,
          valor: inssSeg
        });

        // IRRF 2026: Comparação Automática Dedução Simplificada (R$ 564,80) vs Legal
        const DEDUCAO_SIMPLIFICADA_2026 = 564.80;
        const DEDUCAO_DEPENDENTE_2026 = 189.59;
        const deducaoLegal = inssSeg + ((colab.dependentesIRRF || 0) * DEDUCAO_DEPENDENTE_2026);
        const maiorDeducao = Math.max(deducaoLegal, DEDUCAO_SIMPLIFICADA_2026);
        const baseIR = Math.max(0, baseCalculoINSS - maiorDeducao);

        let irrf = 0;
        if (baseIR > 4664.68) {
          irrf = (baseIR * 0.275) - 896.00;
        } else if (baseIR > 3751.05) {
          irrf = (baseIR * 0.225) - 662.77;
        } else if (baseIR > 2826.65) {
          irrf = (baseIR * 0.15) - 381.44;
        } else if (baseIR > 2259.20) {
          irrf = (baseIR * 0.075) - 169.44;
        }
        irrf = Math.max(0, Math.round(irrf * 100) / 100);

        if (irrf > 0) {
          descontos.push({
            rubricaId: 5,
            codigo: '105',
            nome: `IRRF Retido na Fonte (${maiorDeducao === DEDUCAO_SIMPLIFICADA_2026 ? 'Dedução Simplificada R$564' : 'Deduções Legais'})`,
            tipo: 'DESCONTO',
            referencia: baseIR,
            valor: irrf
          });
        }

        // Desconto Vale Transporte (6% s/ salário base)
        if (isCLT && vars?.descontoValeTransporte) {
          const valVT = Math.min(salBase * 0.06, 280.00);
          descontos.push({
            rubricaId: 6,
            codigo: '103',
            nome: 'Desconto Vale Transporte (6% CLT)',
            tipo: 'DESCONTO',
            referencia: 6.0,
            valor: Math.round(valVT * 100) / 100
          });
        }

        // Adiantamento Salarial
        if (vars?.adiantamentoSalarial && vars.adiantamentoSalarial > 0) {
          descontos.push({
            rubricaId: 6,
            codigo: '104',
            nome: 'Adiantamento Quinzenal de Salário',
            tipo: 'DESCONTO',
            referencia: 0,
            valor: vars.adiantamentoSalarial
          });
        }

        const totalDesc = descontos.reduce((acc, d) => acc + d.valor, 0);
        const salarioLiquido = Math.max(0, Math.round((totalBruto - totalDesc) * 100) / 100);

        // Encargos Patronais da Empresa
        const inssPatronal = isCLT ? Math.round((baseCalculoINSS * 0.20) * 100) / 100 : Math.round((baseCalculoINSS * 0.11) * 100) / 100;
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
      setProcessando(false);
      setMensagem(`Folha de ${empresa.competenciaAtiva} calculada para ${calculadas.length} colaboradores com motor 2026 oficial.`);
      setTimeout(() => setMensagem(''), 5000);
    }, 350);
  };

  // Integração Contábil Automática com 1 Clique (Folha -> Contabilidade)
  const handleIntegrarContabilidade = () => {
    const res = dbService.gerarIntegracaoFolhaContabil(
      empresa.id,
      empresa.competenciaAtiva
    );

    if (res.count === 0) {
      setMensagem('Não há folha processada nesta competência para integração.');
      return;
    }

    setMensagem(`Integração concluída! Lote nº ${res.lote.numero} gerado com ${res.count} partidas contábeis (Total Bruto: R$ ${res.totalBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}).`);
    if (onIntegracaoSucesso) onIntegracaoSucesso();
    setTimeout(() => setMensagem(''), 6000);
  };

  // Recalcular Provisões Mensais de Férias e 13º
  const handleRecalcularProvisoes = () => {
    const p = dbService.calcularProvisoesMensais(empresa.id, empresa.competenciaAtiva);
    setProvisoes(p);
    setMensagem(`Provisões recalculadas para ${p.length} colaboradores (Comp. ${empresa.competenciaAtiva}).`);
    setTimeout(() => setMensagem(''), 4000);
  };

  // Integração de Provisões à Contabilidade com 1 Clique
  const handleIntegrarProvisoes = () => {
    const res = dbService.integrarProvisoesContabil(empresa.id, empresa.competenciaAtiva);
    if (!res.success) {
      setMensagem('Não há provisões elegíveis para integração nesta competência.');
      return;
    }
    setMensagem(`Integração de Provisões concluída! Lote gerado com ${res.partidasGeradas} partidas contábeis (Total: R$ ${res.totalProvisao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}).`);
    if (onIntegracaoSucesso) onIntegracaoSucesso();
    setTimeout(() => setMensagem(''), 6000);
  };

  // Imprimir Holerite Oficial A4 de um Colaborador
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
      descricao: '(=) VALOR LÍQUIDO A RECEBER',
      valor: folha.salarioLiquido || 0,
      isTotal: true
    });

    linhas.push({ descricao: '--- DEMONSTRATIVO DE BASES E FGTS ---', valor: 0, isHeader: true });
    linhas.push({ descricao: `Salário Base: R$ ${(colab.salarioBase || 0).toFixed(2)} | Base INSS: R$ ${(folha.baseINSS || 0).toFixed(2)}`, valor: folha.baseINSS || 0 });
    linhas.push({ descricao: `Base FGTS: R$ ${(folha.baseFGTS || 0).toFixed(2)} | Depósito FGTS do Mês (8%): R$ ${(folha.fgts || 0).toFixed(2)}`, valor: folha.fgts || 0 });
    linhas.push({ descricao: `Base de Cálculo IRRF: R$ ${(folha.baseIRRF || 0).toFixed(2)} | Dependentes: ${colab.dependentesIRRF || 0}`, valor: folha.irrf || 0 });

    onOpenReportPreview({
      tipo: 'HOLERITE',
      titulo: 'RECIBO DE PAGAMENTO DE SALÁRIO (HOLERITE)',
      subtitulo: `Empregador: ${empresa.razaoSocial} • CNPJ: ${empresa.cnpj} | Empregado: ${colab.matricula} - ${colab.nome} (CPF: ${colab.cpf} • Cargo: ${colab.cargo} • Admissão: ${colab.dataAdmissao}) • Comp: ${empresa.competenciaAtiva}`,
      linhas
    });
  };

  // Imprimir Resumo Geral da Folha A4
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

  // Imprimir Relatório Oficial de Provisões A4
  const handleImprimirProvisoesA4 = () => {
    if (!onOpenReportPreview) return;
    const totFerias = provisoes.reduce((acc, p) => acc + p.provisaoFerias, 0);
    const totTerco = provisoes.reduce((acc, p) => acc + p.provisaoTercoConstitucional, 0);
    const tot13 = provisoes.reduce((acc, p) => acc + p.provisaoDecimoTerceiro, 0);
    const totINSS = provisoes.reduce((acc, p) => acc + p.encargosINSSPatronal, 0);
    const totFGTS = provisoes.reduce((acc, p) => acc + p.encargosFGTS, 0);
    const totGeral = provisoes.reduce((acc, p) => acc + p.totalProvisaoMes, 0);

    const linhas = [
      { descricao: '--- DEMONSTRATIVO DE PROVISÕES MENSAIS (CPC 27 / NBC TG) ---', valor: 0, isHeader: true },
      { descricao: '1. Provisão de Férias (1/12 avos)', valor: totFerias },
      { descricao: '2. Provisão de 1/3 Constitucional de Férias', valor: totTerco },
      { descricao: '3. Provisão de 13º Salário (1/12 avos)', valor: tot13 },
      { descricao: '4. Encargos Previdenciários Patronais sobre Provisões (CPP 20%)', valor: totINSS },
      { descricao: '5. Encargos do Fundo de Garantia sobre Provisões (FGTS 8%)', valor: totFGTS },
      { descricao: '(=) TOTAL CONSOLIDADO DE PROVISÕES MENSAIS', valor: totGeral, isTotal: true },
      { descricao: '--- PARTIDAS CONTÁBEIS GERADAS NA INTEGRAÇÃO ---', valor: 0, isHeader: true },
      { descricao: 'D: 56 - Despesas com Provisão de Férias e 13º Salário (Resultado)', valor: totGeral },
      { descricao: 'C: 26 - Provisão de Férias a Pagar (Passivo Circulante)', valor: -(totFerias + totTerco) },
      { descricao: 'C: 27 - Provisão de 13º Salário a Pagar (Passivo Circulante)', valor: -tot13 },
      { descricao: 'C: 24 - Obrigações Sociais Patronais a Recolher (Passivo Circulante)', valor: -(totINSS + totFGTS) }
    ];

    onOpenReportPreview({
      tipo: 'RESUMO_FOLHA',
      titulo: 'RELATÓRIO MENSAL DE PROVISÕES TRABALHISTAS (FÉRIAS & 13º SALÁRIO)',
      subtitulo: `Competência Ativa: ${empresa.competenciaAtiva} • Empregador: ${empresa.razaoSocial} • CNPJ: ${empresa.cnpj}`,
      linhas
    });
  };

  const totalBrutoGeral = folhas.reduce((acc, f) => acc + (f.totalProventos || 0), 0);
  const totalLiquidoGeral = folhas.reduce((acc, f) => acc + (f.salarioLiquido || 0), 0);
  const totalINSSGeral = folhas.reduce((acc, f) => acc + (f.inssSegurado || 0), 0);
  const totalFGTSGeral = folhas.reduce((acc, f) => acc + (f.fgts || 0), 0);

  // Totais de Provisões
  const provSalariosCLT = provisoes.reduce((acc, p) => acc + p.salarioBase, 0);
  const provFeriasTotal = provisoes.reduce((acc, p) => acc + p.provisaoFerias + p.provisaoTercoConstitucional, 0);
  const prov13Total = provisoes.reduce((acc, p) => acc + p.provisaoDecimoTerceiro, 0);
  const provEncargosTotal = provisoes.reduce((acc, p) => acc + p.encargosINSSPatronal + p.encargosFGTS, 0);
  const provGeralTotal = provisoes.reduce((acc, p) => acc + p.totalProvisaoMes, 0);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#141414] text-neutral-200 overflow-hidden select-none font-sans">
      {/* Header */}
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
              Motor CLT 2026 oficial, apuração de provisões mensais (CPC 27) e integração contábil automática
            </p>
          </div>
        </div>

        {/* Toggle de Sub-Aba: Folha Mensal vs Provisões */}
        <div className="flex items-center bg-[#101010] p-0.5 rounded-lg border border-white/10">
          <button
            onClick={() => setAbaAtiva('FOLHA_MENSAL')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition flex items-center space-x-1.5 ${
              abaAtiva === 'FOLHA_MENSAL'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Folha Mensal & Pró-Labore</span>
          </button>
          <button
            onClick={() => {
              setAbaAtiva('PROVISOES');
              setProvisoes(dbService.calcularProvisoesMensais(empresa.id, empresa.competenciaAtiva));
            }}
            className={`px-3 py-1 rounded-md text-xs font-medium transition flex items-center space-x-1.5 ${
              abaAtiva === 'PROVISOES'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Provisões de Férias e 13º (CPC 27)</span>
          </button>
        </div>

        {/* Botões de Ação de acordo com a aba ativa */}
        <div className="flex items-center space-x-2">
          {abaAtiva === 'FOLHA_MENSAL' ? (
            <>
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
          ) : (
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
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium flex items-center space-x-1.5 transition shadow-sm"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Integrar Provisões à Contabilidade</span>
              </button>

              <button
                onClick={handleImprimirProvisoesA4}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded border border-white/10 text-xs font-medium flex items-center space-x-1.5 transition"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-400" />
                <span>Imprimir Relatório A4</span>
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

      {/* Conteúdo Principal */}
      {abaAtiva === 'FOLHA_MENSAL' ? (
        /* Grade de Holerites Calculados */
        <div className="flex-1 overflow-auto custom-scrollbar">
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
                <th className="py-2.5 px-3 w-40 text-center">Ações</th>
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
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        colab.tipoVinculo === 'PRO_LABORE' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {colab.tipoVinculo}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-neutral-200">
                      R$ {(folha ? (folha.totalProventos ?? 0) : colab.salarioBase).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right text-rose-400">
                      {folha ? `- R$ ${(folha.inssSegurado ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-rose-400">
                      {folha && (folha.irrf ?? 0) > 0 ? `- R$ ${(folha.irrf ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Isento'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-400 text-sm">
                      {folha ? `R$ ${(folha.salarioLiquido ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Pendente'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-purple-400">
                      {folha ? `R$ ${(folha.fgts ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => handleAbrirVariaveis(colab)}
                          className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded border border-white/10 text-xs flex items-center space-x-1 transition"
                          title="Lançar Horas Extras, Faltas, Insalubridade"
                        >
                          <Clock className="w-3 h-3 text-sky-400" />
                          <span>Variáveis</span>
                        </button>

                        <button
                          onClick={() => handleImprimirHolerite(colab)}
                          disabled={!folha}
                          className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 text-neutral-200 rounded border border-white/10 text-xs flex items-center space-x-1 transition"
                          title="Visualizar e Imprimir Holerite A4"
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
      ) : (
        /* Grade de Provisões de Férias e 13º Salário */
        <div className="flex-1 flex flex-col overflow-hidden p-4">
          {/* KPI Cards de Provisões */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
            <div className="bg-[#181818] border border-white/10 rounded-xl p-3 shadow">
              <span className="text-[11px] text-neutral-400 block mb-1">Base Salarial CLT</span>
              <div className="text-base font-bold font-mono text-neutral-100">
                R$ {provSalariosCLT.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-neutral-500 mt-1 block">Colaboradores Elegíveis</span>
            </div>

            <div className="bg-[#181818] border border-white/10 rounded-xl p-3 shadow">
              <span className="text-[11px] text-neutral-400 block mb-1">Provisão Férias + 1/3</span>
              <div className="text-base font-bold font-mono text-amber-400">
                R$ {provFeriasTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-amber-400/70 mt-1 block">1/12 avos + 1/3 CF/88</span>
            </div>

            <div className="bg-[#181818] border border-white/10 rounded-xl p-3 shadow">
              <span className="text-[11px] text-neutral-400 block mb-1">Provisão 13º Salário</span>
              <div className="text-base font-bold font-mono text-blue-400">
                R$ {prov13Total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-blue-400/70 mt-1 block">1/12 avos da remuneração</span>
            </div>

            <div className="bg-[#181818] border border-white/10 rounded-xl p-3 shadow">
              <span className="text-[11px] text-neutral-400 block mb-1">Encargos Patronais</span>
              <div className="text-base font-bold font-mono text-purple-400">
                R$ {provEncargosTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-purple-400/70 mt-1 block">CPP 20% + FGTS 8%</span>
            </div>

            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3 shadow">
              <span className="text-[11px] text-emerald-400 font-semibold block mb-1">Total Geral Provisões</span>
              <div className="text-base font-bold font-mono text-emerald-400">
                R$ {provGeralTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-emerald-400/80 mt-1 block">Custo Mensal Adicional</span>
            </div>
          </div>

          {/* Tabela Detalhada de Provisões */}
          <div className="flex-1 bg-[#181818] border border-white/10 rounded-xl overflow-auto custom-scrollbar shadow-lg">
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
        </div>
      )}

      {/* Footer com Totais */}
      <div className="p-3 bg-[#181818] border-t border-white/10 flex flex-wrap items-center justify-between text-xs font-mono gap-3">
        {abaAtiva === 'FOLHA_MENSAL' ? (
          <>
            <div className="text-neutral-400">
              Vínculos Calculados: <strong className="text-neutral-200 font-bold">{folhas.length}</strong> de <strong className="text-neutral-200">{colaboradores.filter(c => c.status === 'ATIVO').length}</strong> ativos
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
            <div className="text-neutral-400">
              Colaboradores CLT com Provisões Ativas: <strong className="text-neutral-200 font-bold">{provisoes.filter(p => p.salarioBase > 0).length}</strong>
            </div>
            <div className="flex items-center space-x-5">
              <span>Férias + 1/3: <strong className="text-amber-400">R$ {provFeriasTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
              <span>•</span>
              <span>13º Salário: <strong className="text-blue-400">R$ {prov13Total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
              <span>•</span>
              <span>Encargos Sociais: <strong className="text-purple-400">R$ {provEncargosTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
              <span>•</span>
              <span>Total Provisões: <strong className="text-emerald-400">R$ {provGeralTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
            </div>
          </>
        )}
      </div>

      {/* Modal de Lançamento de Variáveis do Colaborador */}
      {showVariaveisModal && colabSelecionado && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-white/15 rounded-xl w-full max-w-xl shadow-2xl overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="bg-[#202020] px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Clock className="w-5 h-5 text-sky-400" />
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Lançamento de Variáveis da Competência
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    {colabSelecionado.matricula} - {colabSelecionado.nome} ({colabSelecionado.cargo}) • Comp. {empresa.competenciaAtiva}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowVariaveisModal(false)}
                className="text-neutral-400 hover:text-white p-1 rounded hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 max-h-[75vh] overflow-y-auto space-y-4 custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                    Horas Extras 50% (Qtd)
                  </label>
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
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                    Horas Extras 100% (Qtd)
                  </label>
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
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                    Adicional Noturno (Horas)
                  </label>
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
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                    Adicional Insalubridade
                  </label>
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
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                    Faltas Injustificadas (Dias)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={faltasDias}
                    onChange={e => setFaltasDias(Number(e.target.value))}
                    className="w-full bg-[#202020] border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                    Faltas / Atrasos (Horas)
                  </label>
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
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                    Adiantamento Salarial Pago (R$)
                  </label>
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

            {/* Modal Footer */}
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
