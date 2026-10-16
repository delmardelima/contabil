import { 
  ContaContabil, 
  LancamentoContabil, 
  BalanceteItem, 
  BalancoItem, 
  DREItemCalculado, 
  NaturezaConta,
  BalanceteMultiPeriodoItem,
  DREMultiPeriodoItem,
  RelatorioAnaliseBalanco,
  IndicesLiquidez,
  IndicesEndividamento,
  IndicesRentabilidade,
  AnaliseTermometroKanitz,
  ItemAnaliseVerticalHorizontal
} from '../types/contabil';

export class AccountingEngine {
  /**
   * Calcula os saldos atualizados de todas as contas contábeis (analíticas e sintéticas em cascata)
   */
  public static calculateBalances(
    contas: ContaContabil[],
    lancamentos: LancamentoContabil[],
    desconsiderarZeramento: boolean = false
  ): Map<number, { debitos: number; creditos: number; saldoAtual: number; saldoAnterior: number }> {
    const balanceMap = new Map<number, { debitos: number; creditos: number; saldoAtual: number; saldoAnterior: number }>();

    // Inicializa todas as contas com saldo anterior
    for (const c of contas) {
      balanceMap.set(c.id, {
        debitos: 0,
        creditos: 0,
        saldoAnterior: c.saldoAnterior || 0,
        saldoAtual: c.saldoAnterior || 0
      });
    }

    // Filtra lançamentos se for para desconsiderar zeramento
    const activeLancamentos = desconsiderarZeramento
      ? lancamentos.filter(l => !l.isZeramento)
      : lancamentos;

    // Processa os lançamentos sobre as contas analíticas
    for (const l of activeLancamentos) {
      if (l.contaDebitoId && balanceMap.has(l.contaDebitoId)) {
        const item = balanceMap.get(l.contaDebitoId)!;
        item.debitos += l.valor;
      }
      if (l.contaCreditoId && balanceMap.has(l.contaCreditoId)) {
        const item = balanceMap.get(l.contaCreditoId)!;
        item.creditos += l.valor;
      }
    }

    // Calcula saldo atual das contas analíticas com base na sua natureza
    for (const c of contas) {
      if (c.tipo === 'A') {
        const item = balanceMap.get(c.id)!;
        if (c.natureza === 'D') {
          item.saldoAtual = item.saldoAnterior + item.debitos - item.creditos;
        } else {
          item.saldoAtual = item.saldoAnterior + item.creditos - item.debitos;
        }
      }
    }

    // Consolidação em cascata para contas sintéticas (ordena por grau decrescente: 5 -> 4 -> 3 -> 2 -> 1)
    const contasOrdenadas = [...contas].sort((a, b) => b.grau - a.grau);

    for (const c of contas) {
      if (c.tipo === 'S') {
        const item = balanceMap.get(c.id)!;
        item.debitos = 0;
        item.creditos = 0;
        item.saldoAnterior = 0;
        item.saldoAtual = 0;

        // Soma todas as contas filhas analíticas cuja classificação começa com o prefixo da sintética
        const prefix = c.classificacao + '.';
        for (const child of contas) {
          if (child.tipo === 'A' && child.classificacao.startsWith(prefix)) {
            const childItem = balanceMap.get(child.id)!;
            item.debitos += childItem.debitos;
            item.creditos += childItem.creditos;
            item.saldoAnterior += childItem.saldoAnterior;
            // Se a filha tiver mesma natureza ou inverter
            item.saldoAtual += childItem.saldoAtual;
          }
        }
      }
    }

    return balanceMap;
  }

  /**
   * Gera o Balancete de Verificação completo com opção de filtro por grau e omissão de contas zeradas
   */
  public static generateTrialBalance(
    contas: ContaContabil[],
    lancamentos: LancamentoContabil[],
    grauMaximo: number = 5,
    apenasComMovimento: boolean = false,
    desconsiderarZeramento: boolean = false
  ): { items: BalanceteItem[]; totalDebitos: number; totalCreditos: number; diferencaDxC: number } {
    const balances = this.calculateBalances(contas, lancamentos, desconsiderarZeramento);
    const items: BalanceteItem[] = [];
    let totalDebitos = 0;
    let totalCreditos = 0;

    const contasFiltradas = contas
      .filter(c => c.grau <= grauMaximo)
      .sort((a, b) => a.classificacao.localeCompare(b.classificacao, undefined, { numeric: true }));

    for (const c of contasFiltradas) {
      const b = balances.get(c.id) || { debitos: 0, creditos: 0, saldoAtual: 0, saldoAnterior: 0 };

      if (apenasComMovimento && b.debitos === 0 && b.creditos === 0 && b.saldoAtual === 0) {
        continue;
      }

      if (c.tipo === 'A') {
        totalDebitos += b.debitos;
        totalCreditos += b.creditos;
      }

      let saldoAtualNatureza: NaturezaConta = c.natureza;
      if (b.saldoAtual < 0) {
        saldoAtualNatureza = c.natureza === 'D' ? 'C' : 'D';
      }

      items.push({
        id: c.id,
        classificacao: c.classificacao,
        codigoReduzido: c.codigoReduzido,
        nome: c.nome,
        grau: c.grau,
        tipo: c.tipo,
        natureza: c.natureza,
        saldoAnterior: b.saldoAnterior,
        debitos: b.debitos,
        creditos: b.creditos,
        saldoAtual: Math.abs(b.saldoAtual),
        saldoAtualNatureza
      });
    }

    const diferencaDxC = Math.abs(totalDebitos - totalCreditos);

    return { items, totalDebitos, totalCreditos, diferencaDxC };
  }

  /**
   * Gera o Balanço Patrimonial estruturado (Ativo, Passivo e Patrimônio Líquido)
   * Aplica Resolução CFC 847/99 (Passivo a Descoberto quando PL < 0)
   */
  public static generateBalanceSheet(
    contas: ContaContabil[],
    lancamentos: LancamentoContabil[],
    grauMaximo: number = 4
  ): {
    ativo: BalancoItem[];
    passivo: BalancoItem[];
    patrimonioLiquido: BalancoItem[];
    totalAtivo: number;
    totalPassivo: number;
    totalPL: number;
    isEquilibrado: boolean;
    isPassivoDescoberto: boolean;
  } {
    const balances = this.calculateBalances(contas, lancamentos, false);

    const getGroupItems = (prefix: string) => {
      return contas
        .filter(c => c.classificacao.startsWith(prefix) && c.grau <= grauMaximo)
        .sort((a, b) => a.classificacao.localeCompare(b.classificacao, undefined, { numeric: true }))
        .map(c => {
          const b = balances.get(c.id);
          return {
            classificacao: c.classificacao,
            nome: c.nome,
            grau: c.grau,
            tipo: c.tipo,
            saldo: b ? b.saldoAtual : 0
          };
        });
    };

    const ativo = getGroupItems('1');
    const passivo = getGroupItems('2.01').concat(getGroupItems('2.02'));
    const patrimonioLiquido = getGroupItems('2.03');

    // Totais principais (Grau 1 e Grau 2)
    const contaAtivoGeral = contas.find(c => c.classificacao === '1');
    const contaPLGeral = contas.find(c => c.classificacao === '2.03');

    const totalAtivo = contaAtivoGeral ? (balances.get(contaAtivoGeral.id)?.saldoAtual || 0) : 0;
    const totalPL = contaPLGeral ? (balances.get(contaPLGeral.id)?.saldoAtual || 0) : 0;

    // Passivo total = Passivo Circulante + Passivo Não Circulante
    let totalPassivo = 0;
    const contaPC = contas.find(c => c.classificacao === '2.01');
    const contaPNC = contas.find(c => c.classificacao === '2.02');
    if (contaPC) totalPassivo += (balances.get(contaPC.id)?.saldoAtual || 0);
    if (contaPNC) totalPassivo += (balances.get(contaPNC.id)?.saldoAtual || 0);

    const isPassivoDescoberto = totalPL < 0;
    const diferenca = Math.abs(totalAtivo - (totalPassivo + totalPL));
    const isEquilibrado = diferenca < 0.05;

    return {
      ativo,
      passivo,
      patrimonioLiquido,
      totalAtivo,
      totalPassivo,
      totalPL,
      isEquilibrado,
      isPassivoDescoberto
    };
  }

  /**
   * Gera a D.R.E. (Demonstração do Resultado do Exercício) Dedutiva com Análise Vertical (%)
   */
  public static generateIncomeStatement(
    contas: ContaContabil[],
    lancamentos: LancamentoContabil[]
  ): {
    items: DREItemCalculado[];
    receitaBruta: number;
    receitaLiquida: number;
    lucroBruto: number;
    resultadoOperacional: number;
    lucroLiquido: number;
  } {
    const balances = this.calculateBalances(contas, lancamentos, true); // Ignora zeramento para calcular o resultado econômico real

    // Receita Operacional Bruta (3.01)
    let receitaBruta = 0;
    for (const c of contas) {
      if (c.tipo === 'A' && c.classificacao.startsWith('3.01')) {
        receitaBruta += (balances.get(c.id)?.saldoAtual || 0);
      }
    }

    // Deduções da Receita Bruta (3.02)
    let deducoes = 0;
    for (const c of contas) {
      if (c.tipo === 'A' && c.classificacao.startsWith('3.02')) {
        deducoes += (balances.get(c.id)?.saldoAtual || 0);
      }
    }

    const receitaLiquida = receitaBruta - deducoes;
    const baseAV = receitaLiquida > 0 ? receitaLiquida : (receitaBruta > 0 ? receitaBruta : 1);

    // Custos dos Serviços / Mercadorias (4.01)
    let custos = 0;
    for (const c of contas) {
      if (c.tipo === 'A' && c.classificacao.startsWith('4.01')) {
        custos += (balances.get(c.id)?.saldoAtual || 0);
      }
    }

    const lucroBruto = receitaLiquida - custos;

    // Despesas Operacionais (4.02 a 4.05)
    let despesasOperacionais = 0;
    for (const c of contas) {
      if (c.tipo === 'A' && (c.classificacao.startsWith('4.02') || c.classificacao.startsWith('4.03') || c.classificacao.startsWith('4.04'))) {
        despesasOperacionais += (balances.get(c.id)?.saldoAtual || 0);
      }
    }

    const resultadoOperacional = lucroBruto - despesasOperacionais;
    const lucroLiquido = resultadoOperacional;

    const items: DREItemCalculado[] = [
      {
        id: 1,
        ordem: 1,
        descricao: '(=) RECEITA OPERACIONAL BRUTA',
        tipoLinha: 'SUBTOTAL',
        operacao: 'SOMA',
        valor: receitaBruta,
        analiseVerticalPerc: (receitaBruta / baseAV) * 100
      },
      {
        id: 2,
        ordem: 2,
        descricao: '(-) Deduções da Receita Bruta e Tributos sobre Vendas',
        tipoLinha: 'CONTA',
        operacao: 'SUBTRAI',
        valor: deducoes,
        analiseVerticalPerc: (deducoes / baseAV) * 100
      },
      {
        id: 3,
        ordem: 3,
        descricao: '(=) RECEITA OPERACIONAL LÍQUIDA',
        tipoLinha: 'SUBTOTAL',
        operacao: 'SOMA',
        valor: receitaLiquida,
        analiseVerticalPerc: 100.0
      },
      {
        id: 4,
        ordem: 4,
        descricao: '(-) Custos dos Serviços Prestados e Mercadorias',
        tipoLinha: 'CONTA',
        operacao: 'SUBTRAI',
        valor: custos,
        analiseVerticalPerc: (custos / baseAV) * 100
      },
      {
        id: 5,
        ordem: 5,
        descricao: '(=) RESULTADO OPERACIONAL BRUTO (LUCRO BRUTO)',
        tipoLinha: 'SUBTOTAL',
        operacao: 'SOMA',
        valor: lucroBruto,
        analiseVerticalPerc: (lucroBruto / baseAV) * 100
      },
      {
        id: 6,
        ordem: 6,
        descricao: '(-) Despesas Administrativas, Pessoal e Gerais',
        tipoLinha: 'CONTA',
        operacao: 'SUBTRAI',
        valor: despesasOperacionais,
        analiseVerticalPerc: (despesasOperacionais / baseAV) * 100
      },
      {
        id: 7,
        ordem: 7,
        descricao: '(=) RESULTADO LÍQUIDO DO EXERCÍCIO',
        tipoLinha: 'TOTAL_GERAL',
        operacao: 'SOMA',
        valor: lucroLiquido,
        analiseVerticalPerc: (lucroLiquido / baseAV) * 100
      }
    ];

    return {
      items,
      receitaBruta,
      receitaLiquida,
      lucroBruto,
      resultadoOperacional,
      lucroLiquido
    };
  }

  /**
   * Executa a Rotina de Zeramento / Encerramento do Exercício
   * Gera lançamentos de contrapartida para todas as contas de resultado e transfere para conta de Lucros/Prejuízos
   */
  public static executeZeramento(
    empresaId: number,
    contas: ContaContabil[],
    lancamentos: LancamentoContabil[],
    dataZeramento: string,
    contaDestinoId: number,
    historicoId: number
  ): Omit<LancamentoContabil, 'id' | 'createdAt'>[] {
    const balances = this.calculateBalances(contas, lancamentos, true);
    const novosLancamentos: Omit<LancamentoContabil, 'id' | 'createdAt'>[] = [];
    let numeroPartida = 9000;

    for (const c of contas) {
      // Contas analíticas de Receitas (3) e Custos/Despesas (4)
      if (c.tipo === 'A' && (c.classificacao.startsWith('3.') || c.classificacao.startsWith('4.'))) {
        const b = balances.get(c.id);
        if (b && b.saldoAtual !== 0) {
          numeroPartida++;
          const valor = Math.abs(b.saldoAtual);

          if (c.natureza === 'C') {
            // Conta Credora (ex: Receita): debita a conta para zerar e credita a conta de ARE/Lucros
            novosLancamentos.push({
              empresaId,
              numeroPartida,
              dataLancamento: dataZeramento,
              tipoPartida: 'SIMPLES',
              contaDebitoId: c.id,
              contaCreditoId: contaDestinoId,
              valor,
              historicoId,
              complementoHistorico: `Zeramento de encerramento - ${c.nome}`,
              isZeramento: true
            });
          } else {
            // Conta Devedora (ex: Despesa): credita a conta para zerar e debita a conta de ARE/Lucros
            novosLancamentos.push({
              empresaId,
              numeroPartida,
              dataLancamento: dataZeramento,
              tipoPartida: 'SIMPLES',
              contaDebitoId: contaDestinoId,
              contaCreditoId: c.id,
              valor,
              historicoId,
              complementoHistorico: `Zeramento de encerramento - ${c.nome}`,
              isZeramento: true
            });
          }
        }
      }
    }

    return novosLancamentos;
  }

  /**
   * Gera o Balancete Comparativo Multi-Período (Evolução 12 Meses - Jan a Dez)
   */
  public static generateMultiPeriodBalancete(
    contas: ContaContabil[],
    lancamentos: LancamentoContabil[],
    ano: number = 2026,
    grauMaximo: number = 3
  ): BalanceteMultiPeriodoItem[] {
    const contasFiltradas = contas
      .filter(c => c.grau <= grauMaximo)
      .sort((a, b) => a.classificacao.localeCompare(b.classificacao, undefined, { numeric: true }));

    // Pre-calcular balancetes de cada mês (acumulado até o mês)
    const monthlyBalances: Map<number, { debitos: number; creditos: number; saldoAtual: number; saldoAnterior: number }>[] = [];
    
    for (let m = 1; m <= 12; m++) {
      const mesStr = m.toString().padStart(2, '0');
      const maxDate = `${ano}-${mesStr}-31`;
      // Lançamentos acumulados até o fim deste mês, desconsiderando zeramento para manter visibilidade
      const lancsAteMes = lancamentos.filter(l => l.dataLancamento <= maxDate && !l.isZeramento);
      monthlyBalances.push(this.calculateBalances(contas, lancsAteMes, true));
    }

    const items: BalanceteMultiPeriodoItem[] = [];

    for (const c of contasFiltradas) {
      const mesesValores: number[] = [];
      for (let m = 0; m < 12; m++) {
        const b = monthlyBalances[m].get(c.id);
        mesesValores.push(b ? b.saldoAtual : 0);
      }
      
      const totalAno = mesesValores[11] || 0; // Saldo em 31/12

      items.push({
        id: c.id,
        classificacao: c.classificacao,
        codigoReduzido: c.codigoReduzido || 0,
        nome: c.nome,
        grau: c.grau,
        tipo: c.tipo,
        natureza: c.natureza,
        meses: mesesValores,
        totalAno
      });
    }

    return items;
  }

  /**
   * Gera a DRE Comparativa Multi-Período (Evolução 12 Meses - Jan a Dez)
   */
  public static generateMultiPeriodDRE(
    contas: ContaContabil[],
    lancamentos: LancamentoContabil[],
    ano: number = 2026
  ): DREMultiPeriodoItem[] {
    const dreMeses: {
      receitaBruta: number;
      deducoes: number;
      receitaLiquida: number;
      custos: number;
      lucroBruto: number;
      despesas: number;
      lucroLiquido: number;
    }[] = [];

    for (let m = 1; m <= 12; m++) {
      const mesStr = m.toString().padStart(2, '0');
      const prefixoMes = `${ano}-${mesStr}`;
      const lancsMes = lancamentos.filter(l => l.dataLancamento.startsWith(prefixoMes) && !l.isZeramento);
      const res = this.generateIncomeStatement(contas, lancsMes);
      
      const ded = res.items.find(i => i.descricao.includes('Deduções'))?.valor || 0;
      const cust = res.items.find(i => i.descricao.includes('Custos'))?.valor || 0;
      const desp = res.items.find(i => i.descricao.includes('Despesas'))?.valor || 0;

      dreMeses.push({
        receitaBruta: res.receitaBruta,
        deducoes: ded,
        receitaLiquida: res.receitaLiquida,
        custos: cust,
        lucroBruto: res.lucroBruto,
        despesas: desp,
        lucroLiquido: res.lucroLiquido
      });
    }

    const templateLinhas = [
      { ordem: 1, descricao: '1. RECEITA OPERACIONAL BRUTA', key: 'receitaBruta' as const, tipoLinha: 'CONTA' as const, operacao: 'SOMA' as const },
      { ordem: 2, descricao: '2. (-) Deduções da Receita Bruta e Tributos', key: 'deducoes' as const, tipoLinha: 'CONTA' as const, operacao: 'SUBTRAI' as const },
      { ordem: 3, descricao: '3. (=) RECEITA OPERACIONAL LÍQUIDA', key: 'receitaLiquida' as const, tipoLinha: 'SUBTOTAL' as const, operacao: 'SOMA' as const },
      { ordem: 4, descricao: '4. (-) Custos dos Serviços Prestados / Mercadorias', key: 'custos' as const, tipoLinha: 'CONTA' as const, operacao: 'SUBTRAI' as const },
      { ordem: 5, descricao: '5. (=) LUCRO BRUTO OPERACIONAL', key: 'lucroBruto' as const, tipoLinha: 'SUBTOTAL' as const, operacao: 'SOMA' as const },
      { ordem: 6, descricao: '6. (-) Despesas Operacionais e Administrativas', key: 'despesas' as const, tipoLinha: 'CONTA' as const, operacao: 'SUBTRAI' as const },
      { ordem: 7, descricao: '7. (=) RESULTADO LÍQUIDO DO EXERCÍCIO', key: 'lucroLiquido' as const, tipoLinha: 'TOTAL_GERAL' as const, operacao: 'SOMA' as const }
    ];

    return templateLinhas.map(t => {
      const meses = dreMeses.map(d => d[t.key]);
      const totalAno = meses.reduce((a, b) => a + b, 0);
      const mediaMensal = totalAno / 12;

      return {
        ordem: t.ordem,
        descricao: t.descricao,
        tipoLinha: t.tipoLinha,
        operacao: t.operacao,
        meses,
        totalAno,
        mediaMensal
      };
    });
  }

  /**
   * Gera o Relatório Completo de Análise das Demonstrações Contábeis & Índices Econômico-Financeiros
   * (Análise Horizontal/Vertical, Coeficientes de Liquidez, Endividamento, Rentabilidade e Termômetro de Kanitz)
   */
  public static generateFinancialAnalysis(
    empresaId: number,
    contas: ContaContabil[],
    lancamentos: LancamentoContabil[],
    exercicioAtual: number = 2026,
    exercicioAnterior: number = 2025
  ): RelatorioAnaliseBalanco {
    const balances = this.calculateBalances(contas, lancamentos, false);
    const balancesSemZeramento = this.calculateBalances(contas, lancamentos, true);

    // Identificar contas-chave de balanço
    let totalAtivoAtual = 0;
    let totalAtivoAnterior = 0;
    let ativoCirculanteAtual = 0;
    let disponibilidadesAtual = 0;
    let estoquesAtual = 0;
    let rlpAtual = 0;
    let imobilizadoAtual = 0;

    let passivoCirculanteAtual = 0;
    let passivoNaoCirculanteAtual = 0;
    let patrimonioLiquidoAtual = 0;

    for (const c of contas) {
      const b = balances.get(c.id);
      const sAtual = b ? b.saldoAtual : 0;
      const sAnt = c.saldoAnterior || 0;

      if (c.classificacao === '1') {
        totalAtivoAtual = sAtual;
        totalAtivoAnterior = sAnt;
      } else if (c.classificacao === '1.01' || c.classificacao === '1.1') {
        ativoCirculanteAtual = sAtual;
      } else if (c.classificacao.startsWith('1.01.01') || c.classificacao.startsWith('1.1.01')) {
        if (c.tipo === 'A') disponibilidadesAtual += sAtual;
      } else if (c.classificacao.startsWith('1.01.04') || c.classificacao.startsWith('1.1.04')) {
        if (c.tipo === 'A') estoquesAtual += sAtual;
      } else if (c.classificacao === '1.02.01' || c.classificacao === '1.2.01') {
        rlpAtual = sAtual;
      } else if (c.classificacao === '1.02.03' || c.classificacao === '1.2.03') {
        imobilizadoAtual = sAtual;
      } else if (c.classificacao === '2.01' || c.classificacao === '2.1') {
        passivoCirculanteAtual = sAtual;
      } else if (c.classificacao === '2.02' || c.classificacao === '2.2') {
        passivoNaoCirculanteAtual = sAtual;
      } else if (c.classificacao === '2.03' || c.classificacao === '2.3') {
        patrimonioLiquidoAtual = sAtual;
      }
    }

    // Se as contas sintéticas de topo não estavam com saldo preenchido, calcula somando grupos
    if (totalAtivoAtual === 0 && contas.length > 0) {
      for (const c of contas) {
        if (c.tipo === 'A' && c.classificacao.startsWith('1')) {
          totalAtivoAtual += (balances.get(c.id)?.saldoAtual || 0);
          totalAtivoAnterior += (c.saldoAnterior || 0);
        }
      }
    }

    // DRE e Resultados Econômicos
    const dre = this.generateIncomeStatement(contas, lancamentos);
    const receitaLiquida = dre.receitaLiquida || 1;
    const lucroOperacional = dre.resultadoOperacional;
    const lucroLiquido = dre.lucroLiquido;

    // 1. Índices de Liquidez
    const pc = passivoCirculanteAtual > 0 ? passivoCirculanteAtual : 1;
    const pTotal = (passivoCirculanteAtual + passivoNaoCirculanteAtual) > 0 ? (passivoCirculanteAtual + passivoNaoCirculanteAtual) : 1;

    const liquidez: IndicesLiquidez = {
      liquidezImediata: Math.round((disponibilidadesAtual / pc) * 100) / 100,
      liquidezCorrente: Math.round((ativoCirculanteAtual / pc) * 100) / 100,
      liquidezSeca: Math.round(((ativoCirculanteAtual - estoquesAtual) / pc) * 100) / 100,
      liquidezGeral: Math.round(((ativoCirculanteAtual + rlpAtual) / pTotal) * 100) / 100
    };

    // 2. Índices de Endividamento
    const ativTotal = totalAtivoAtual > 0 ? totalAtivoAtual : 1;
    const pl = Math.abs(patrimonioLiquidoAtual) > 0 ? Math.abs(patrimonioLiquidoAtual) : 1;

    const endividamento: IndicesEndividamento = {
      endividamentoGeral: Math.round(((passivoCirculanteAtual + passivoNaoCirculanteAtual) / ativTotal) * 10000) / 100,
      participacaoCapitalTerceiros: Math.round(((passivoCirculanteAtual + passivoNaoCirculanteAtual) / pl) * 10000) / 100,
      composicaoEndividamentoCurtoPrazo: Math.round((passivoCirculanteAtual / pTotal) * 10000) / 100,
      imobilizacaoPatrimonioLiquido: Math.round((imobilizadoAtual / pl) * 10000) / 100,
      imobilizacaoRecursosNaoCorrentes: Math.round((imobilizadoAtual / (pl + passivoNaoCirculanteAtual)) * 10000) / 100
    };

    // 3. Índices de Rentabilidade
    const rentabilidade: IndicesRentabilidade = {
      giroAtivo: Math.round((receitaLiquida / ativTotal) * 100) / 100,
      margemOperacional: Math.round((lucroOperacional / receitaLiquida) * 10000) / 100,
      margemLiquida: Math.round((lucroLiquido / receitaLiquida) * 10000) / 100,
      retornoSobreAtivo: Math.round((lucroLiquido / ativTotal) * 10000) / 100,
      retornoSobrePatrimonioLiquido: Math.round((lucroLiquido / pl) * 10000) / 100
    };

    // 4. Termômetro de Insolvência de Stephen Kanitz
    // Fator Z = 0.05*ROE + 1.65*LG + 3.55*LS - 1.06*LC - 0.33*EG
    const fatorZCalc = (
      0.05 * (rentabilidade.retornoSobrePatrimonioLiquido) +
      1.65 * liquidez.liquidezGeral +
      3.55 * liquidez.liquidezSeca -
      1.06 * liquidez.liquidezCorrente -
      0.33 * (endividamento.endividamentoGeral / 100)
    );
    const fatorZ = Math.round(fatorZCalc * 100) / 100;

    let classifKanitz: 'SOLVENTE' | 'PENUMBRA_ALERTA' | 'INSOLVENTE' = 'SOLVENTE';
    let interpKanitz = 'A empresa opera em faixa de solvência segura e confortável, com excelente capacidade de honrar obrigações correntes.';
    if (fatorZ < -3) {
      classifKanitz = 'INSOLVENTE';
      interpKanitz = 'Zona de alto risco de insolvência financeira. Exige renegociação de dívidas e reforço urgente no capital de giro.';
    } else if (fatorZ <= 0) {
      classifKanitz = 'PENUMBRA_ALERTA';
      interpKanitz = 'Zona de penumbra / alerta moderado. Recomendada atenção à composição de endividamento e controle rigoroso de custos.';
    }

    const kanitz: AnaliseTermometroKanitz = {
      fatorZ,
      classificacao: classifKanitz,
      interpretacao: interpKanitz
    };

    // 5. Itens de Análise Vertical (AV%) e Horizontal (AH%) do Balanço
    const baseAtivoAnt = totalAtivoAnterior > 0 ? totalAtivoAnterior : 1;
    const baseAtivoAtual = totalAtivoAtual > 0 ? totalAtivoAtual : 1;

    const itensAnaliseBalanco: ItemAnaliseVerticalHorizontal[] = contas
      .filter(c => (c.classificacao.startsWith('1') || c.classificacao.startsWith('2')) && c.grau <= 3)
      .sort((a, b) => a.classificacao.localeCompare(b.classificacao, undefined, { numeric: true }))
      .map(c => {
        const sAtual = balances.get(c.id)?.saldoAtual || 0;
        const sAnt = c.saldoAnterior || 0;
        const avAnt = Math.round((sAnt / baseAtivoAnt) * 10000) / 100;
        const avAtual = Math.round((sAtual / baseAtivoAtual) * 10000) / 100;
        const varNominal = sAtual - sAnt;
        const ah = sAnt !== 0 ? Math.round(((sAtual - sAnt) / Math.abs(sAnt)) * 10000) / 100 : 0;

        return {
          classificacao: c.classificacao,
          descricaoConta: c.nome,
          grau: c.grau,
          saldoExercicioAnterior: sAnt,
          saldoExercicioAtual: sAtual,
          analiseVerticalAnteriorPercent: avAnt,
          analiseVerticalAtualPercent: avAtual,
          variacaoHorizontalNominal: varNominal,
          analiseHorizontalPercent: ah
        };
      });

    // 6. Itens de Análise Vertical (AV%) e Horizontal (AH%) da DRE
    const itensAnaliseDRE: ItemAnaliseVerticalHorizontal[] = contas
      .filter(c => (c.classificacao.startsWith('3') || c.classificacao.startsWith('4')) && c.grau <= 3)
      .sort((a, b) => a.classificacao.localeCompare(b.classificacao, undefined, { numeric: true }))
      .map(c => {
        const sAtual = balancesSemZeramento.get(c.id)?.saldoAtual || 0;
        const sAnt = c.saldoAnterior || 0;
        const avAnt = Math.round((sAnt / (receitaLiquida || 1)) * 10000) / 100;
        const avAtual = Math.round((sAtual / (receitaLiquida || 1)) * 10000) / 100;
        const varNominal = sAtual - sAnt;
        const ah = sAnt !== 0 ? Math.round(((sAtual - sAnt) / Math.abs(sAnt)) * 10000) / 100 : 0;

        return {
          classificacao: c.classificacao,
          descricaoConta: c.nome,
          grau: c.grau,
          saldoExercicioAnterior: sAnt,
          saldoExercicioAtual: sAtual,
          analiseVerticalAnteriorPercent: avAnt,
          analiseVerticalAtualPercent: avAtual,
          variacaoHorizontalNominal: varNominal,
          analiseHorizontalPercent: ah
        };
      });

    return {
      empresaId,
      exercicioAtual,
      exercicioAnterior,
      totalAtivo: totalAtivoAtual,
      totalPassivoCirculante: passivoCirculanteAtual,
      totalPassivoNaoCirculante: passivoNaoCirculanteAtual,
      totalPatrimonioLiquido: patrimonioLiquidoAtual,
      receitaLiquida,
      lucroOperacional,
      lucroLiquido,
      liquidez,
      endividamento,
      rentabilidade,
      kanitz,
      itensAnaliseBalanco,
      itensAnaliseDRE
    };
  }
}
