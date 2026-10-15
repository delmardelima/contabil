import { ContaContabil, LancamentoContabil, BalanceteItem, BalancoItem, DREItemCalculado, NaturezaConta } from '../types/contabil';

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
}
