import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ContaContabil, 
  HistoricoPadrao, 
  LancamentoContabil, 
  PartidaMultiplaItem, 
  CentroCusto, 
  LoteContabil, 
  LancamentoPadrao,
  RateioCentroCusto,
  TipoOrigemLancamentoCaixa
} from '../../types/contabil';
import { dbService } from '../../db/sqliteService';
import { 
  Plus, 
  Trash2, 
  Copy, 
  History, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Search, 
  Download,
  RotateCcw,
  Edit2,
  PieChart,
  Repeat,
  Save,
  Check,
  CheckSquare,
  Square,
  Split,
  ChevronDown,
  ChevronRight,
  Info,
  X,
  ExternalLink,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';
import { formatCurrency, formatPercent } from '../../utils/formatters';

interface LancamentosModuleProps {
  contas: ContaContabil[];
  historicos: HistoricoPadrao[];
  lancamentos: LancamentoContabil[];
  empresaId: number;
  onAddLancamento: (l: Omit<LancamentoContabil, 'id' | 'createdAt'>) => void;
  onDeleteLancamento: (id: number) => void;
  onDuplicateLancamento: (l: LancamentoContabil) => void;
  onEditLancamento?: (l: LancamentoContabil) => void;
  onEstornoLancamento?: (id: number) => void;
}

export const LancamentosModule: React.FC<LancamentosModuleProps> = ({
  contas,
  historicos,
  lancamentos,
  empresaId,
  onAddLancamento,
  onDeleteLancamento,
  onDuplicateLancamento,
  onEditLancamento,
  onEstornoLancamento
}) => {
  // Modo de Partida: CAIXA (w_cadlancxa - Simplificado Entrada/Saída), SIMPLES (w_cadlan - 1D x 1C) ou MULTIPLA (1:N, N:N)
  const [modo, setModo] = useState<'CAIXA' | 'SIMPLES' | 'MULTIPLA'>('CAIXA');

  // Centros de custo, lotes e lançamentos padrão da empresa
  const centrosCusto = dbService.getCentrosCusto(empresaId);
  const lotes = dbService.getLotes(empresaId);
  const lancamentosPadrao = dbService.getLancamentosPadrao(empresaId);

  // Contas analíticas
  const contasAnaliticas = useMemo(() => contas.filter(c => c.tipo === 'A'), [contas]);

  // Contas Caixa / Bancos (w_contas_caixa / dw_sel_contas_caixa - Disponibilidades 1.01.01)
  const contasCaixaDisponiveis = useMemo(() => {
    const disp = contasAnaliticas.filter(
      c => c.classificacao.startsWith('1.01.01') || c.nome.toLowerCase().includes('caixa') || c.nome.toLowerCase().includes('banco')
    );
    return disp.length > 0 ? disp : contasAnaliticas.slice(0, 2);
  }, [contasAnaliticas]);

  // Estado para Lançamentos no Caixa (w_cadlancxa)
  const [contaCaixaSelecionadaId, setContaCaixaSelecionadaId] = useState<number>(
    () => contasCaixaDisponiveis[0]?.id || 0
  );
  const [operacaoCaixa, setOperacaoCaixa] = useState<'ENTRADA' | 'SAIDA'>('ENTRADA');
  const [codContrapartidaCaixa, setCodContrapartidaCaixa] = useState<string>('');
  const [tipoOrigemCaixa, setTipoOrigemCaixa] = useState<TipoOrigemLancamentoCaixa>('Normal');
  const [filtroContaCaixaGrid, setFiltroContaCaixaGrid] = useState<boolean>(false);

  useEffect(() => {
    if ((!contaCaixaSelecionadaId || !contasCaixaDisponiveis.some(c => c.id === contaCaixaSelecionadaId)) && contasCaixaDisponiveis.length > 0) {
      setContaCaixaSelecionadaId(contasCaixaDisponiveis[0].id);
    }
  }, [contasCaixaDisponiveis, contaCaixaSelecionadaId]);

  const contaCaixaAtual = useMemo(
    () => contas.find(c => c.id === contaCaixaSelecionadaId) || contasCaixaDisponiveis[0],
    [contas, contaCaixaSelecionadaId, contasCaixaDisponiveis]
  );

  const contaContrapartidaObj = useMemo(
    () => contasAnaliticas.find(c => c.codigoReduzido.toString() === codContrapartidaCaixa || c.classificacao === codContrapartidaCaixa),
    [contasAnaliticas, codContrapartidaCaixa]
  );

  // Saldo em tempo real da Conta Caixa selecionada (dw_sel_contas_caixa)
  const resumoCaixaSelecionado = useMemo(() => {
    if (!contaCaixaAtual) return { saldoAnterior: 0, totalEntradas: 0, totalSaidas: 0, saldoAtual: 0 };
    const saldoAnterior = contaCaixaAtual.saldoAnterior || 0;
    let totalEntradas = 0;
    let totalSaidas = 0;
    for (const l of lancamentos) {
      if (l.contaDebitoId === contaCaixaAtual.id) totalEntradas += l.valor;
      if (l.contaCreditoId === contaCaixaAtual.id) totalSaidas += l.valor;
    }
    const saldoAtual = saldoAnterior + totalEntradas - totalSaidas;
    return { saldoAnterior, totalEntradas, totalSaidas, saldoAtual };
  }, [contaCaixaAtual, lancamentos]);

  // Form Partida Simples
  const [dataLanc, setDataLanc] = useState(new Date().toISOString().split('T')[0]);
  const [codDebito, setCodDebito] = useState<string>('');
  const [codCredito, setCodCredito] = useState<string>('');
  const [valor, setValor] = useState<string>('');
  const [codHistorico, setCodHistorico] = useState<string>('');
  const [complemento, setComplemento] = useState<string>('');
  const [centroCustoId, setCentroCustoId] = useState<number>(0);
  const [loteId, setLoteId] = useState<number>(lotes[0]?.id || 1);
  const [erroMsg, setErroMsg] = useState<string>('');

  // Rateio Gerencial Multi-Centros de Custo (Partida Simples)
  const [habilitarRateio, setHabilitarRateio] = useState<boolean>(false);
  const [rateios, setRateios] = useState<RateioCentroCusto[]>(() => {
    if (centrosCusto.length >= 2) {
      return [
        { id: 1, centroCustoId: centrosCusto[0].id, percentual: 50, valor: 0 },
        { id: 2, centroCustoId: centrosCusto[1].id, percentual: 50, valor: 0 }
      ];
    } else if (centrosCusto.length === 1) {
      return [{ id: 1, centroCustoId: centrosCusto[0].id, percentual: 100, valor: 0 }];
    }
    return [];
  });

  // Partida Múltipla Grade
  const [multiplasItens, setMultiplasItens] = useState<PartidaMultiplaItem[]>([
    { id: '1', tipo: 'DEBITO', contaId: 0, valor: 0, complemento: '' },
    { id: '2', tipo: 'CREDITO', contaId: 0, valor: 0, complemento: '' }
  ]);

  // Modal Edição Direta
  const [editandoLancamento, setEditandoLancamento] = useState<LancamentoContabil | null>(null);
  const [editDebitoId, setEditDebitoId] = useState<number>(0);
  const [editCreditoId, setEditCreditoId] = useState<number>(0);
  const [editValor, setEditValor] = useState<string>('');
  const [editComplemento, setEditComplemento] = useState<string>('');
  const [editData, setEditData] = useState<string>('');
  const [editCentroCustoId, setEditCentroCustoId] = useState<number>(0);
  const [editHabilitarRateio, setEditHabilitarRateio] = useState<boolean>(false);
  const [editRateios, setEditRateios] = useState<RateioCentroCusto[]>([]);

  // Modal Detalhes do Rateio de um Lançamento
  const [detalheRateioLanc, setDetalheRateioLanc] = useState<LancamentoContabil | null>(null);

  // Seleção e Exclusão em Lote
  const [selecionados, setSelecionados] = useState<number[]>([]);

  // Modal F2 (Busca Rápida de Contas e Históricos)
  const [showF2Modal, setShowF2Modal] = useState<boolean>(false);
  const [f2Tipo, setF2Tipo] = useState<'DEBITO' | 'CREDITO' | 'HISTORICO'>('DEBITO');
  const [f2Query, setF2Query] = useState<string>('');
  const [f2SelectedIndex, setF2SelectedIndex] = useState<number>(0);
  const f2InputRef = useRef<HTMLInputElement>(null);

  // Modal F11 (Contas e Históricos Recentes)
  const [showF11Modal, setShowF11Modal] = useState<boolean>(false);

  // Filtro de listagem
  const [filtroTexto, setFiltroTexto] = useState('');

  // Refs para navegação fluida por Enter
  const inputDebitoRef = useRef<HTMLInputElement>(null);
  const inputCreditoRef = useRef<HTMLInputElement>(null);
  const inputContrapartidaRef = useRef<HTMLInputElement>(null);
  const inputValorRef = useRef<HTMLInputElement>(null);
  const inputHistRef = useRef<HTMLInputElement>(null);
  const inputComplRef = useRef<HTMLInputElement>(null);

  // Encontrar conta selecionada no form
  const contaDebitoObj = contas.find(c => c.codigoReduzido.toString() === codDebito || c.classificacao === codDebito);
  const contaCreditoObj = contas.find(c => c.codigoReduzido.toString() === codCredito || c.classificacao === codCredito);
  const historicoObj = historicos.find(h => h.codigo.toString() === codHistorico);

  // Parse do valor numérico da partida
  const valorNumPartida = useMemo(() => {
    const val = parseFloat(valor.replace(/\./g, '').replace(',', '.'));
    return isNaN(val) ? 0 : val;
  }, [valor]);

  // Recalcular valores de rateio quando valor da partida ou % do rateio mudar
  useEffect(() => {
    if (habilitarRateio && valorNumPartida > 0) {
      setRateios(prev => prev.map(r => ({
        ...r,
        valor: parseFloat(((valorNumPartida * (r.percentual || 0)) / 100).toFixed(2))
      })));
    }
  }, [valorNumPartida, habilitarRateio]);

  // Totais do Rateio Atual
  const totalPercRateio = useMemo(() => {
    return rateios.reduce((s, r) => s + (Number(r.percentual) || 0), 0);
  }, [rateios]);

  const totalValorRateio = useMemo(() => {
    return rateios.reduce((s, r) => s + (Number(r.valor) || 0), 0);
  }, [rateios]);

  const rateioBalanceado = Math.abs(totalPercRateio - 100) < 0.05;

  // Escuta teclas de atalho: F2 (Busca Rápida), F8 (Rateio), F11 (Frequentes)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        // Determina contexto do F2
        if (document.activeElement === inputCreditoRef.current) {
          abrirF2('CREDITO');
        } else if (document.activeElement === inputHistRef.current) {
          abrirF2('HISTORICO');
        } else {
          abrirF2('DEBITO');
        }
      } else if (e.key === 'F8') {
        e.preventDefault();
        setHabilitarRateio(prev => !prev);
      } else if (e.key === 'F11') {
        e.preventDefault();
        setShowF11Modal(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const abrirF2 = (tipo: 'DEBITO' | 'CREDITO' | 'HISTORICO') => {
    setF2Tipo(tipo);
    setF2Query('');
    setF2SelectedIndex(0);
    setShowF2Modal(true);
    setTimeout(() => f2InputRef.current?.focus(), 80);
  };

  // Filtragem dos itens para o Modal F2
  const f2ItensFiltrados = useMemo(() => {
    const q = f2Query.trim().toLowerCase();
    if (f2Tipo === 'HISTORICO') {
      if (!q) return historicos;
      return historicos.filter(h => 
        h.codigo.toString().includes(q) || 
        h.descricao.toLowerCase().includes(q)
      );
    } else {
      if (!q) return contasAnaliticas;
      return contasAnaliticas.filter(c => 
        c.codigoReduzido.toString().includes(q) || 
        c.classificacao.toLowerCase().includes(q) || 
        c.nome.toLowerCase().includes(q)
      );
    }
  }, [f2Tipo, f2Query, historicos, contasAnaliticas]);

  const handleSelectF2Item = (item: ContaContabil | HistoricoPadrao) => {
    if (f2Tipo === 'HISTORICO') {
      const h = item as HistoricoPadrao;
      setCodHistorico(h.codigo.toString());
      setShowF2Modal(false);
      setTimeout(() => inputComplRef.current?.focus(), 50);
    } else if (modo === 'CAIXA') {
      const c = item as ContaContabil;
      setCodContrapartidaCaixa(c.codigoReduzido.toString());
      setShowF2Modal(false);
      setTimeout(() => inputValorRef.current?.focus(), 50);
    } else if (f2Tipo === 'DEBITO') {
      const c = item as ContaContabil;
      setCodDebito(c.codigoReduzido.toString());
      setShowF2Modal(false);
      setTimeout(() => inputCreditoRef.current?.focus(), 50);
    } else if (f2Tipo === 'CREDITO') {
      const c = item as ContaContabil;
      setCodCredito(c.codigoReduzido.toString());
      setShowF2Modal(false);
      setTimeout(() => inputValorRef.current?.focus(), 50);
    }
  };

  // Aplicação Rápida de Lançamento Padrão
  const handleAplicarLancamentoPadrao = (padraoId: number) => {
    const p = lancamentosPadrao.find(item => item.id === padraoId);
    if (!p) return;

    const cDeb = contas.find(c => c.id === p.contaDebitoId);
    const cCred = contas.find(c => c.id === p.contaCreditoId);
    const h = historicos.find(hist => hist.id === p.historicoId);

    if (cDeb) setCodDebito(cDeb.codigoReduzido.toString());
    if (cCred) setCodCredito(cCred.codigoReduzido.toString());
    if (h) setCodHistorico(h.codigo.toString());
    if (p.complemento || p.complementoPadrao) setComplemento(p.complemento || p.complementoPadrao || '');

    // Se estiver no modo CAIXA (w_cadlancxa), identifica automaticamente se a conta Caixa/Banco foi debitada (Entrada) ou creditada (Saída)
    if (cDeb && contasCaixaDisponiveis.some(cx => cx.id === cDeb.id)) {
      setContaCaixaSelecionadaId(cDeb.id);
      setOperacaoCaixa('ENTRADA');
      if (cCred) setCodContrapartidaCaixa(cCred.codigoReduzido.toString());
    } else if (cCred && contasCaixaDisponiveis.some(cx => cx.id === cCred.id)) {
      setContaCaixaSelecionadaId(cCred.id);
      setOperacaoCaixa('SAIDA');
      if (cDeb) setCodContrapartidaCaixa(cDeb.codigoReduzido.toString());
    }
  };

  // Gravar Lançamento Rápido no Caixa (w_cadlancxa - Entrada / Saída)
  const handleGravarCaixa = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErroMsg('');

    if (!contaCaixaAtual || contaCaixaAtual.tipo !== 'A') {
      setErroMsg('Selecione uma Conta Caixa ou Banco válida (w_contas_caixa).');
      return;
    }
    if (!contaContrapartidaObj || contaContrapartidaObj.tipo !== 'A') {
      setErroMsg('Selecione a Conta Contrapartida analítica (ex: Clientes, Receita de Vendas, Fornecedores, DAS Simples).');
      inputContrapartidaRef.current?.focus();
      return;
    }
    if (contaCaixaAtual.id === contaContrapartidaObj.id) {
      setErroMsg('A Conta Contrapartida não pode ser igual à própria Conta Caixa/Banco selecionada.');
      return;
    }
    const numValor = parseFloat(valor.replace(/\./g, '').replace(',', '.'));
    if (isNaN(numValor) || numValor <= 0) {
      setErroMsg('Informe um valor monetário positivo válido para o movimento de Caixa.');
      inputValorRef.current?.focus();
      return;
    }

    // Validação de Rateio se ativo
    if (habilitarRateio) {
      if (rateios.length === 0) {
        setErroMsg('Adicione ao menos um Centro de Custo no rateio.');
        return;
      }
      if (!rateioBalanceado) {
        setErroMsg(`O rateio de Centros de Custo deve somar 100% (atual: ${totalPercRateio.toFixed(2)}%).`);
        return;
      }
    }

    // Regra w_cadlancxa (contabil.exe):
    // ENTRADA no Caixa/Banco -> Debita Conta Caixa/Banco, Credita Conta Contrapartida
    // SAÍDA do Caixa/Banco   -> Debita Conta Contrapartida, Credita Conta Caixa/Banco
    const debitoFinalId = operacaoCaixa === 'ENTRADA' ? contaCaixaAtual.id : contaContrapartidaObj.id;
    const creditoFinalId = operacaoCaixa === 'ENTRADA' ? contaContrapartidaObj.id : contaCaixaAtual.id;

    onAddLancamento({
      empresaId,
      numeroPartida: lancamentos.length + 1,
      loteId: loteId || undefined,
      dataLancamento: dataLanc,
      tipoPartida: 'SIMPLES',
      contaDebitoId: debitoFinalId,
      contaCreditoId: creditoFinalId,
      valor: numValor,
      centroCustoId: !habilitarRateio && centroCustoId ? centroCustoId : undefined,
      rateios: habilitarRateio ? JSON.parse(JSON.stringify(rateios)) : undefined,
      historicoId: historicoObj?.id,
      complementoHistorico: complemento || `${operacaoCaixa === 'ENTRADA' ? 'Entrada' : 'Saída'} Caixa/Banco - ${contaContrapartidaObj.nome}`,
      tipoOrigemCaixa,
      contaCaixaId: contaCaixaAtual.id,
      operacaoCaixa
    });

    setCodContrapartidaCaixa('');
    setValor('');
    setCodHistorico('');
    setComplemento('');
    setTimeout(() => inputContrapartidaRef.current?.focus(), 50);
  };

  // Funções de Rateio Multi-Centros
  const handleAddLinhaRateio = () => {
    const defaultCC = centrosCusto.find(cc => !rateios.some(r => r.centroCustoId === cc.id)) || centrosCusto[0];
    if (!defaultCC) {
      alert('Nenhum Centro de Custo disponível para adicionar.');
      return;
    }
    const novo: RateioCentroCusto = {
      id: Date.now(),
      centroCustoId: defaultCC.id,
      percentual: 0,
      valor: 0
    };
    setRateios([...rateios, novo]);
  };

  const handleRemoveLinhaRateio = (id: string | number) => {
    if (rateios.length <= 1) {
      alert('O rateio precisa de pelo menos 1 linha.');
      return;
    }
    setRateios(rateios.filter(r => r.id !== id));
  };

  const handleDistribuirIgualmenteRateio = () => {
    if (rateios.length === 0) return;
    const percIgual = parseFloat((100 / rateios.length).toFixed(2));
    const resto = parseFloat((100 - (percIgual * (rateios.length - 1))).toFixed(2));

    const atualizados = rateios.map((r, idx) => {
      const p = idx === rateios.length - 1 ? resto : percIgual;
      const v = valorNumPartida > 0 ? parseFloat(((valorNumPartida * p) / 100).toFixed(2)) : 0;
      return { ...r, percentual: p, valor: v };
    });
    setRateios(atualizados);
  };

  const handlePercentualRateioChange = (id: string | number, novoPerc: number) => {
    setRateios(prev => prev.map(r => {
      if (r.id !== id) return r;
      const v = valorNumPartida > 0 ? parseFloat(((valorNumPartida * novoPerc) / 100).toFixed(2)) : 0;
      return { ...r, percentual: novoPerc, valor: v };
    }));
  };

  const handleValorRateioChange = (id: string | number, novoVal: number) => {
    setRateios(prev => prev.map(r => {
      if (r.id !== id) return r;
      const p = valorNumPartida > 0 ? parseFloat(((novoVal / valorNumPartida) * 100).toFixed(2)) : 0;
      return { ...r, percentual: p, valor: novoVal };
    }));
  };

  // Gravar Partida Simples
  const handleGravarSimples = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErroMsg('');

    if (!contaDebitoObj || contaDebitoObj.tipo !== 'A') {
      setErroMsg('Selecione uma Conta Débito válida e do tipo ANALÍTICA.');
      inputDebitoRef.current?.focus();
      return;
    }
    if (!contaCreditoObj || contaCreditoObj.tipo !== 'A') {
      setErroMsg('Selecione uma Conta Crédito válida e do tipo ANALÍTICA.');
      inputCreditoRef.current?.focus();
      return;
    }
    if (contaDebitoObj.id === contaCreditoObj.id) {
      setErroMsg('A conta de Débito não pode ser idêntica à conta de Crédito.');
      return;
    }
    const numValor = parseFloat(valor.replace(/\./g, '').replace(',', '.'));
    if (isNaN(numValor) || numValor <= 0) {
      setErroMsg('Informe um valor monetário positivo válido.');
      inputValorRef.current?.focus();
      return;
    }

    // Validação de Rateio
    if (habilitarRateio) {
      if (rateios.length === 0) {
        setErroMsg('Adicione ao menos um Centro de Custo no rateio.');
        return;
      }
      if (!rateioBalanceado) {
        setErroMsg(`O rateio de Centros de Custo deve somar 100% (atual: ${totalPercRateio.toFixed(2)}%).`);
        return;
      }
    }

    onAddLancamento({
      empresaId,
      numeroPartida: lancamentos.length + 1,
      loteId: loteId || undefined,
      dataLancamento: dataLanc,
      tipoPartida: 'SIMPLES',
      contaDebitoId: contaDebitoObj.id,
      contaCreditoId: contaCreditoObj.id,
      valor: numValor,
      centroCustoId: !habilitarRateio && centroCustoId ? centroCustoId : undefined,
      rateios: habilitarRateio ? JSON.parse(JSON.stringify(rateios)) : undefined,
      historicoId: historicoObj?.id,
      complementoHistorico: complemento,
      tipoOrigemCaixa: 'Normal'
    });

    // Limpa campos para o próximo lançamento mantendo a data e foca no débito
    setCodDebito('');
    setCodCredito('');
    setValor('');
    setCodHistorico('');
    setComplemento('');
    setTimeout(() => inputDebitoRef.current?.focus(), 50);
  };

  // Gravar Partida Múltipla Garantindo o Mesmo numeroPartida
  const handleGravarMultipla = () => {
    const debitos = multiplasItens.filter(i => i.tipo === 'DEBITO' && i.contaId && i.valor > 0);
    const creditos = multiplasItens.filter(i => i.tipo === 'CREDITO' && i.contaId && i.valor > 0);

    const totDeb = debitos.reduce((acc, i) => acc + i.valor, 0);
    const totCred = creditos.reduce((acc, i) => acc + i.valor, 0);

    if (Math.abs(totDeb - totCred) > 0.01) {
      alert('Total de Débitos diverge do Total de Créditos na Partida Múltipla.');
      return;
    }

    const proximoNumeroPartida = lancamentos.length + 1;

    // Casos de Decomposição: 1:N (1 Débito para N Créditos), N:1 (N Débitos para 1 Crédito), ou N:N
    if (debitos.length === 1) {
      const debUnico = debitos[0];
      for (const c of creditos) {
        onAddLancamento({
          empresaId,
          numeroPartida: proximoNumeroPartida,
          loteId: loteId || undefined,
          dataLancamento: dataLanc,
          tipoPartida: 'MULTIPLA',
          contaDebitoId: debUnico.contaId,
          contaCreditoId: c.contaId,
          valor: c.valor,
          centroCustoId: c.centroCustoId || centroCustoId || undefined,
          complementoHistorico: c.complemento || debUnico.complemento || 'Partida Múltipla Composta'
        });
      }
    } else if (creditos.length === 1) {
      const credUnico = creditos[0];
      for (const d of debitos) {
        onAddLancamento({
          empresaId,
          numeroPartida: proximoNumeroPartida,
          loteId: loteId || undefined,
          dataLancamento: dataLanc,
          tipoPartida: 'MULTIPLA',
          contaDebitoId: d.contaId,
          contaCreditoId: credUnico.contaId,
          valor: d.valor,
          centroCustoId: d.centroCustoId || centroCustoId || undefined,
          complementoHistorico: d.complemento || credUnico.complemento || 'Partida Múltipla Composta'
        });
      }
    } else {
      // N:N proporção contábil direta
      for (const d of debitos) {
        for (const c of creditos) {
          const valorProporcional = (d.valor * c.valor) / totDeb;
          onAddLancamento({
            empresaId,
            numeroPartida: proximoNumeroPartida,
            loteId: loteId || undefined,
            dataLancamento: dataLanc,
            tipoPartida: 'MULTIPLA',
            contaDebitoId: d.contaId,
            contaCreditoId: c.contaId,
            valor: parseFloat(valorProporcional.toFixed(2)),
            centroCustoId: d.centroCustoId || c.centroCustoId || centroCustoId || undefined,
            complementoHistorico: d.complemento || c.complemento || 'Partida Múltipla Composta N:N'
          });
        }
      }
    }

    setModo('SIMPLES');
    setMultiplasItens([
      { id: '1', tipo: 'DEBITO', contaId: 0, valor: 0, complemento: '' },
      { id: '2', tipo: 'CREDITO', contaId: 0, valor: 0, complemento: '' }
    ]);
  };

  // Abrir Modal de Edição Direta
  const handleAbrirEditar = (l: LancamentoContabil) => {
    setEditandoLancamento(l);
    setEditDebitoId(l.contaDebitoId || 0);
    setEditCreditoId(l.contaCreditoId || 0);
    setEditValor(l.valor.toFixed(2).replace('.', ','));
    setEditComplemento(l.complementoHistorico);
    setEditData(l.dataLancamento);
    setEditCentroCustoId(l.centroCustoId || 0);
    setEditHabilitarRateio(!!(l.rateios && l.rateios.length > 0));
    setEditRateios(l.rateios ? JSON.parse(JSON.stringify(l.rateios)) : []);
  };

  const handleSalvarEdicao = () => {
    if (!editandoLancamento) return;
    const valNum = parseFloat(editValor.replace(/\./g, '').replace(',', '.'));
    if (isNaN(valNum) || valNum <= 0) return;

    if (editHabilitarRateio) {
      const somaPerc = editRateios.reduce((s, r) => s + (Number(r.percentual) || 0), 0);
      if (Math.abs(somaPerc - 100) > 0.05) {
        alert(`O rateio deve totalizar 100% (atual: ${somaPerc.toFixed(2)}%).`);
        return;
      }
    }

    const atualizado: LancamentoContabil = {
      ...editandoLancamento,
      contaDebitoId: editDebitoId,
      contaCreditoId: editCreditoId,
      valor: valNum,
      complementoHistorico: editComplemento,
      dataLancamento: editData,
      centroCustoId: !editHabilitarRateio && editCentroCustoId ? editCentroCustoId : undefined,
      rateios: editHabilitarRateio ? editRateios : undefined
    };

    if (onEditLancamento) {
      onEditLancamento(atualizado);
    } else {
      dbService.updateLancamento(atualizado);
    }
    setEditandoLancamento(null);
  };

  // Estorno Automático 1-Clique (Inverte Débito e Crédito)
  const handleEstorno = (l: LancamentoContabil) => {
    if (confirm(`Confirmar estorno automático da partida nº ${l.numeroPartida} no valor de R$ ${l.valor.toFixed(2)}?`)) {
      if (onEstornoLancamento) {
        onEstornoLancamento(l.id);
      } else {
        dbService.estornarLancamento(l.id);
      }
    }
  };

  // Ações em Lote (Batch Delete)
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelecionados(lancamentosFiltrados.map(l => l.id));
    } else {
      setSelecionados([]);
    }
  };

  const handleToggleSelectOne = (id: number) => {
    setSelecionados(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleExcluirLote = () => {
    if (selecionados.length === 0) return;
    if (confirm(`Excluir permanentemente as ${selecionados.length} partidas contábeis selecionadas?`)) {
      for (const id of selecionados) {
        onDeleteLancamento(id);
      }
      setSelecionados([]);
    }
  };

  // Cálculo DxC de Partida Múltipla
  const totalMultiploDebito = multiplasItens.filter(i => i.tipo === 'DEBITO').reduce((acc, i) => acc + (i.valor || 0), 0);
  const totalMultiploCredito = multiplasItens.filter(i => i.tipo === 'CREDITO').reduce((acc, i) => acc + (i.valor || 0), 0);
  const diferencaMultipla = Math.abs(totalMultiploDebito - totalMultiploCredito);

  // Filtragem da lista (com suporte ao filtro por Conta Caixa de w_cadlancxa)
  const lancamentosFiltrados = useMemo(() => {
    return lancamentos.filter(l => {
      if (modo === 'CAIXA' && filtroContaCaixaGrid && contaCaixaAtual) {
        if (l.contaDebitoId !== contaCaixaAtual.id && l.contaCreditoId !== contaCaixaAtual.id) {
          return false;
        }
      }
      if (!filtroTexto) return true;
      const txt = filtroTexto.toLowerCase();
      const deb = contas.find(c => c.id === l.contaDebitoId)?.nome.toLowerCase() || '';
      const cred = contas.find(c => c.id === l.contaCreditoId)?.nome.toLowerCase() || '';
      const compl = l.complementoHistorico.toLowerCase();
      return deb.includes(txt) || cred.includes(txt) || compl.includes(txt) || l.valor.toString().includes(txt) || l.numeroPartida.toString().includes(txt);
    });
  }, [lancamentos, filtroTexto, contas, modo, filtroContaCaixaGrid, contaCaixaAtual]);

  // Helper de identificação da origem do lançamento (idêntico a w_cadlancxa em contabil.exe)
  const obterOrigemLancamento = (l: LancamentoContabil): TipoOrigemLancamentoCaixa => {
    if (l.tipoOrigemCaixa) return l.tipoOrigemCaixa;
    if (l.isZeramento) return 'Zeramento';
    const compl = (l.complementoHistorico || '').toLowerCase();
    if (compl.includes('deprecia')) return 'Patrimônio';
    if (compl.includes('das') || compl.includes('guia') || compl.includes('pgdas')) return 'Pagto Guia EF';
    if (compl.includes('nfs-e') || compl.includes('serviço') || compl.includes('servico')) return 'Serviços EF';
    if (compl.includes('venda') || compl.includes('saída') || compl.includes('nf-e')) return 'Saídas EF';
    if (compl.includes('compra') || compl.includes('fornecedor') || compl.includes('entrada')) return 'Entradas EF';
    return 'Normal';
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#141414] text-neutral-200 overflow-hidden select-none">
      {/* Top Header do Módulo: Alternador Lançamento no Caixa (w_cadlancxa) / Partida Simples (w_cadlan) / Múltipla */}
      <div className="px-4 py-2.5 bg-[#181818] border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Modo de Digitação:</span>
          <div className="flex items-center bg-neutral-900 rounded-lg p-0.5 border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setModo('CAIXA')}
              className={`px-3 py-1 rounded-md font-medium transition-all flex items-center space-x-1.5 ${
                modo === 'CAIXA'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="Modo Simplificado para Pequenos Escritórios (Entrada / Saída no Caixa ou Banco - w_cadlancxa)"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Lançamento Rápido no Caixa / Banco (Entrada / Saída)</span>
            </button>
            <button
              type="button"
              onClick={() => setModo('SIMPLES')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                modo === 'SIMPLES'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Partida Dobrada (1D x 1C)
            </button>
            <button
              type="button"
              onClick={() => setModo('MULTIPLA')}
              className={`px-3 py-1 rounded-md font-medium transition-all flex items-center space-x-1 ${
                modo === 'MULTIPLA'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Partida Múltipla (1:N)</span>
            </button>
          </div>

          {/* Toggle Rateio Gerencial */}
          {(modo === 'SIMPLES' || modo === 'CAIXA') && (
            <button
              type="button"
              onClick={() => setHabilitarRateio(prev => !prev)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center space-x-1.5 transition-colors ${
                habilitarRateio 
                  ? 'bg-purple-600/20 text-purple-300 border-purple-500/40 shadow-sm' 
                  : 'bg-neutral-800 text-neutral-400 border-white/10 hover:text-neutral-200'
              }`}
              title="Ativar/desativar rateio multi-centros de custo (F8)"
            >
              <Split className="w-3.5 h-3.5 text-purple-400" />
              <span>Rateio CC</span>
              <kbd className="bg-black/30 px-1 py-0.2 rounded text-[10px] font-mono border border-white/10">F8</kbd>
            </button>
          )}
        </div>

        {/* Lançamento Padrão & Atalho F11 */}
        <div className="flex items-center space-x-2">
          {lancamentosPadrao.length > 0 && (
            <select
              onChange={(e) => {
                if (e.target.value) handleAplicarLancamentoPadrao(Number(e.target.value));
              }}
              defaultValue=""
              className="bg-neutral-900 border border-white/10 rounded px-2.5 py-1 text-xs text-neutral-300 outline-none max-w-[220px]"
            >
              <option value="" disabled>Modelos Prontos (DAS, Vendas)...</option>
              {lancamentosPadrao.map(p => (
                <option key={p.id} value={p.id}>{p.codigo} - {p.descricao}</option>
              ))}
            </select>
          )}

          <button
            onClick={() => abrirF2('DEBITO')}
            className="flex items-center space-x-1.5 px-2.5 py-1 bg-neutral-800/80 hover:bg-neutral-800 rounded border border-white/10 text-neutral-300 text-xs transition-colors"
            title="Buscar Conta ou Histórico (F2)"
          >
            <Search className="w-3.5 h-3.5 text-blue-400" />
            <span>Busca Rápida</span>
            <kbd className="bg-neutral-900 px-1.5 py-0.5 rounded text-[10px] font-mono border border-white/10">F2</kbd>
          </button>

          <button
            onClick={() => setShowF11Modal(true)}
            className="flex items-center space-x-1.5 px-2.5 py-1 bg-neutral-800/80 hover:bg-neutral-800 rounded border border-white/10 text-neutral-300 text-xs transition-colors"
          >
            <History className="w-3.5 h-3.5 text-indigo-400" />
            <span>Frequentes</span>
            <kbd className="bg-neutral-900 px-1.5 py-0.5 rounded text-[10px] font-mono border border-white/10">F11</kbd>
          </button>
        </div>
      </div>

      {/* Formulário Modo Lançamentos no Caixa (w_cadlancxa) vs Partida Simples (w_cadlan) vs Partida Múltipla */}
      {modo === 'CAIXA' ? (
        <form onSubmit={handleGravarCaixa} className="p-4 bg-[#1c1c1c] border-b border-white/10 space-y-3">
          {erroMsg && (
            <div className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{erroMsg}</span>
            </div>
          )}

          {/* Barra Superior do Caixa: Seletor de Conta Caixa/Banco (w_contas_caixa) + Saldos em Tempo Real */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-lg bg-[#141414] border border-white/10 text-xs">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
                <Wallet className="w-4 h-4" />
                <span>Conta Caixa / Banco Ativa:</span>
              </div>
              <select
                value={contaCaixaAtual?.id || ''}
                onChange={(e) => setContaCaixaSelecionadaId(Number(e.target.value))}
                className="bg-[#1c1c1c] border border-emerald-500/30 rounded px-2.5 py-1 text-neutral-100 font-mono font-semibold outline-none focus:border-emerald-500"
              >
                {contasCaixaDisponiveis.map(cx => (
                  <option key={cx.id} value={cx.id}>
                    {cx.codigoReduzido} - {cx.nome} ({cx.classificacao})
                  </option>
                ))}
              </select>

              <label className="flex items-center space-x-1.5 text-[11px] text-neutral-400 cursor-pointer ml-2">
                <input
                  type="checkbox"
                  checked={filtroContaCaixaGrid}
                  onChange={(e) => setFiltroContaCaixaGrid(e.target.checked)}
                  className="rounded bg-neutral-900 border-white/20 text-emerald-600 focus:ring-0"
                />
                <span>Filtrar grade abaixo apenas por esta conta</span>
              </label>
            </div>

            {/* Resumo Dinâmico de Entradas, Saídas e Saldo Atual do Caixa */}
            <div className="flex items-center space-x-4 font-mono text-xs">
              <div>
                <span className="text-neutral-500 mr-1">Entradas (D):</span>
                <span className="text-emerald-400 font-semibold">{formatCurrency(resumoCaixaSelecionado.totalEntradas)}</span>
              </div>
              <div>
                <span className="text-neutral-500 mr-1">Saídas (C):</span>
                <span className="text-rose-400 font-semibold">{formatCurrency(resumoCaixaSelecionado.totalSaidas)}</span>
              </div>
              <div className="px-2.5 py-0.5 rounded bg-white/5 border border-white/10">
                <span className="text-neutral-400 mr-1.5">Saldo Atual:</span>
                <span className={`font-bold ${resumoCaixaSelecionado.saldoAtual >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatCurrency(Math.abs(resumoCaixaSelecionado.saldoAtual))} {resumoCaixaSelecionado.saldoAtual >= 0 ? 'D' : 'C'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-3 text-xs">
            {/* 1. Data */}
            <div className="col-span-2">
              <label className="block text-[11px] font-medium text-neutral-400 mb-1">Data do Movimento</label>
              <input
                type="date"
                value={dataLanc}
                onChange={(e) => setDataLanc(e.target.value)}
                className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-100 font-mono focus:border-blue-500 outline-none"
              />
            </div>

            {/* 2. Operação no Caixa: Entrada vs Saída */}
            <div className="col-span-3">
              <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                Natureza do Movimento no Caixa
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setOperacaoCaixa('ENTRADA')}
                  className={`py-1.5 px-2 rounded font-semibold flex items-center justify-center space-x-1 border transition-all ${
                    operacaoCaixa === 'ENTRADA'
                      ? 'bg-emerald-600/25 border-emerald-500 text-emerald-300 shadow-sm'
                      : 'bg-[#121212] border-white/10 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Entrada (+)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOperacaoCaixa('SAIDA')}
                  className={`py-1.5 px-2 rounded font-semibold flex items-center justify-center space-x-1 border transition-all ${
                    operacaoCaixa === 'SAIDA'
                      ? 'bg-rose-600/25 border-rose-500 text-rose-300 shadow-sm'
                      : 'bg-[#121212] border-white/10 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
                  <span>Saída (-)</span>
                </button>
              </div>
            </div>

            {/* 3. Conta Contrapartida (Cliente, Receita, Fornecedor, Despesa, Guia DAS) */}
            <div className="col-span-4">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-blue-400">
                  {operacaoCaixa === 'ENTRADA'
                    ? 'Origem do Recebimento (Credita Contrapartida) [F2]'
                    : 'Destino do Pagamento (Debita Contrapartida) [F2]'}
                </label>
                <button
                  type="button"
                  onClick={() => abrirF2(operacaoCaixa === 'ENTRADA' ? 'CREDITO' : 'DEBITO')}
                  className="text-[10px] text-blue-400/80 hover:text-blue-300"
                >
                  Pesquisar (F2)
                </button>
              </div>
              <div className="flex space-x-1.5">
                <input
                  ref={inputContrapartidaRef}
                  type="text"
                  placeholder="Red."
                  value={codContrapartidaCaixa}
                  onChange={(e) => setCodContrapartidaCaixa(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      inputValorRef.current?.focus();
                    }
                  }}
                  className="w-16 bg-[#121212] border border-white/10 rounded px-2 py-1.5 text-neutral-100 font-mono focus:border-blue-500 outline-none"
                />
                <select
                  value={contaContrapartidaObj?.id || ''}
                  onChange={(e) => {
                    const c = contas.find(item => item.id === Number(e.target.value));
                    if (c) setCodContrapartidaCaixa(c.codigoReduzido.toString());
                  }}
                  className="flex-1 bg-[#121212] border border-white/10 rounded px-2 py-1.5 text-neutral-200 focus:border-blue-500 outline-none truncate"
                >
                  <option value="">Selecione a Conta (Ex: Vendas, Clientes, Fornecedores, DAS)...</option>
                  {contasAnaliticas
                    .filter(c => c.id !== contaCaixaAtual?.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>{c.codigoReduzido} - {c.nome}</option>
                    ))}
                </select>
              </div>
            </div>

            {/* 4. Valor */}
            <div className="col-span-3">
              <label className="block text-[11px] font-medium text-emerald-400 mb-1">Valor do Movimento (R$)</label>
              <input
                ref={inputValorRef}
                type="text"
                placeholder="0,00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    inputHistRef.current?.focus();
                  }
                }}
                className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-100 font-mono font-semibold text-right focus:border-blue-500 outline-none"
              />
            </div>

            {/* 5. Origem (Tipo w_cadlancxa) */}
            <div className="col-span-2">
              <label className="block text-[11px] font-medium text-neutral-400 mb-1">Tipo / Origem</label>
              <select
                value={tipoOrigemCaixa}
                onChange={(e) => setTipoOrigemCaixa(e.target.value as TipoOrigemLancamentoCaixa)}
                className="w-full bg-[#121212] border border-white/10 rounded px-2 py-1.5 text-neutral-200 outline-none truncate"
              >
                <option value="Normal">Normal (Caixa/Banco)</option>
                <option value="Saídas EF">Saídas EF (Vendas Comércio)</option>
                <option value="Serviços EF">Serviços EF (NFS-e Prestados)</option>
                <option value="Entradas EF">Entradas EF (Compras)</option>
                <option value="Pagto Guia EF">Pagto Guia EF (DAS / Impostos)</option>
              </select>
            </div>

            {/* 6. Histórico Padrão */}
            <div className="col-span-3">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-neutral-400">Histórico Padrão (F2)</label>
                <button
                  type="button"
                  onClick={() => abrirF2('HISTORICO')}
                  className="text-[10px] text-neutral-400 hover:text-neutral-200"
                >
                  Pesquisar
                </button>
              </div>
              <div className="flex space-x-1.5">
                <input
                  ref={inputHistRef}
                  type="text"
                  placeholder="Cód."
                  value={codHistorico}
                  onChange={(e) => setCodHistorico(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      inputComplRef.current?.focus();
                    }
                  }}
                  className="w-14 bg-[#121212] border border-white/10 rounded px-2 py-1.5 text-neutral-100 font-mono focus:border-blue-500 outline-none"
                />
                <select
                  value={historicoObj?.id || ''}
                  onChange={(e) => {
                    const h = historicos.find(item => item.id === Number(e.target.value));
                    if (h) setCodHistorico(h.codigo.toString());
                  }}
                  className="flex-1 bg-[#121212] border border-white/10 rounded px-2 py-1.5 text-neutral-200 focus:border-blue-500 outline-none truncate"
                >
                  <option value="">Histórico...</option>
                  {historicos.map((h) => (
                    <option key={h.id} value={h.id}>{h.codigo} - {h.descricao}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 7. Complemento */}
            <div className="col-span-5">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-neutral-400">Complemento / Descrição do Movimento</label>
                {contaCaixaAtual && contaContrapartidaObj && (
                  <span className="text-[10px] font-mono text-neutral-400">
                    Partida Automática: <strong className="text-blue-400">D: {operacaoCaixa === 'ENTRADA' ? contaCaixaAtual.codigoReduzido : contaContrapartidaObj.codigoReduzido}</strong> • <strong className="text-indigo-400">C: {operacaoCaixa === 'ENTRADA' ? contaContrapartidaObj.codigoReduzido : contaCaixaAtual.codigoReduzido}</strong>
                  </span>
                )}
              </div>
              <input
                ref={inputComplRef}
                type="text"
                placeholder="Ex: Recebimento PIX Cliente / Pagto Guia DAS Simples Nacional"
                value={complemento}
                onChange={(e) => setComplemento(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleGravarCaixa();
                  }
                }}
                className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-100 focus:border-blue-500 outline-none"
              />
            </div>

            {/* 8. Botão Gravar no Caixa */}
            <div className="col-span-2 flex items-end">
              <button
                type="submit"
                className={`w-full py-1.5 text-white font-medium rounded shadow transition-colors flex items-center justify-center space-x-1.5 ${
                  operacaoCaixa === 'ENTRADA'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'bg-blue-600 hover:bg-blue-500'
                }`}
              >
                <span>{operacaoCaixa === 'ENTRADA' ? 'Gravar Entrada' : 'Gravar Saída'}</span>
                <kbd className="bg-black/30 px-1 rounded text-[10px] font-mono">↵</kbd>
              </button>
            </div>
          </div>
        </form>
      ) : modo === 'SIMPLES' ? (
        <form onSubmit={handleGravarSimples} className="p-4 bg-[#1c1c1c] border-b border-white/10 space-y-3">
          {erroMsg && (
            <div className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{erroMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-12 gap-3 text-xs">
            {/* 1. Data */}
            <div className="col-span-2">
              <label className="block text-[11px] font-medium text-neutral-400 mb-1">Data Lançamento</label>
              <input
                type="date"
                value={dataLanc}
                onChange={(e) => setDataLanc(e.target.value)}
                className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-100 font-mono focus:border-blue-500 outline-none"
              />
            </div>

            {/* 2. Conta Débito */}
            <div className="col-span-3">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-blue-400">Conta Débito (F2)</label>
                <button
                  type="button"
                  onClick={() => abrirF2('DEBITO')}
                  className="text-[10px] text-blue-400/80 hover:text-blue-300"
                >
                  Pesquisar
                </button>
              </div>
              <div className="flex space-x-1.5">
                <input
                  ref={inputDebitoRef}
                  type="text"
                  placeholder="Red."
                  value={codDebito}
                  onChange={(e) => setCodDebito(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      inputCreditoRef.current?.focus();
                    }
                  }}
                  className="w-16 bg-[#121212] border border-white/10 rounded px-2 py-1.5 text-neutral-100 font-mono focus:border-blue-500 outline-none"
                />
                <select
                  value={contaDebitoObj?.id || ''}
                  onChange={(e) => {
                    const c = contas.find(item => item.id === Number(e.target.value));
                    if (c) setCodDebito(c.codigoReduzido.toString());
                  }}
                  className="flex-1 bg-[#121212] border border-white/10 rounded px-2 py-1.5 text-neutral-200 focus:border-blue-500 outline-none truncate"
                >
                  <option value="">Selecione Conta Débito...</option>
                  {contasAnaliticas.map((c) => (
                    <option key={c.id} value={c.id}>{c.codigoReduzido} - {c.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3. Conta Crédito */}
            <div className="col-span-3">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-indigo-400">Conta Crédito (F2)</label>
                <button
                  type="button"
                  onClick={() => abrirF2('CREDITO')}
                  className="text-[10px] text-indigo-400/80 hover:text-indigo-300"
                >
                  Pesquisar
                </button>
              </div>
              <div className="flex space-x-1.5">
                <input
                  ref={inputCreditoRef}
                  type="text"
                  placeholder="Red."
                  value={codCredito}
                  onChange={(e) => setCodCredito(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      inputValorRef.current?.focus();
                    }
                  }}
                  className="w-16 bg-[#121212] border border-white/10 rounded px-2 py-1.5 text-neutral-100 font-mono focus:border-blue-500 outline-none"
                />
                <select
                  value={contaCreditoObj?.id || ''}
                  onChange={(e) => {
                    const c = contas.find(item => item.id === Number(e.target.value));
                    if (c) setCodCredito(c.codigoReduzido.toString());
                  }}
                  className="flex-1 bg-[#121212] border border-white/10 rounded px-2 py-1.5 text-neutral-200 focus:border-blue-500 outline-none truncate"
                >
                  <option value="">Selecione Conta Crédito...</option>
                  {contasAnaliticas.map((c) => (
                    <option key={c.id} value={c.id}>{c.codigoReduzido} - {c.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 4. Valor */}
            <div className="col-span-2">
              <label className="block text-[11px] font-medium text-emerald-400 mb-1">Valor da Partida (R$)</label>
              <input
                ref={inputValorRef}
                type="text"
                placeholder="0,00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    inputHistRef.current?.focus();
                  }
                }}
                className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-100 font-mono font-semibold text-right focus:border-blue-500 outline-none"
              />
            </div>

            {/* 5. Centro de Custo Simples (se Rateio desabilitado) ou Lote */}
            {!habilitarRateio ? (
              <div className="col-span-2">
                <label className="block text-[11px] font-medium text-neutral-400 mb-1">Centro de Custo</label>
                <select
                  value={centroCustoId}
                  onChange={(e) => setCentroCustoId(Number(e.target.value))}
                  className="w-full bg-[#121212] border border-white/10 rounded px-2 py-1.5 text-neutral-200 outline-none truncate"
                >
                  <option value={0}>Nenhum Centro</option>
                  {centrosCusto.map(cc => (
                    <option key={cc.id} value={cc.id}>{cc.codigo} - {cc.nome}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="col-span-2">
                <label className="block text-[11px] font-medium text-neutral-400 mb-1">Lote</label>
                <select
                  value={loteId}
                  onChange={(e) => setLoteId(Number(e.target.value))}
                  className="w-full bg-[#121212] border border-white/10 rounded px-2 py-1.5 text-neutral-200 outline-none truncate"
                >
                  {lotes.map(l => (
                    <option key={l.id} value={l.id}>Lote #{l.numeroLote || l.numero}</option>
                  ))}
                </select>
              </div>
            )}

            {/* 6. Histórico Padrão */}
            <div className="col-span-4">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-neutral-400">Histórico Padrão (F2)</label>
                <button
                  type="button"
                  onClick={() => abrirF2('HISTORICO')}
                  className="text-[10px] text-neutral-400 hover:text-neutral-200"
                >
                  Pesquisar
                </button>
              </div>
              <div className="flex space-x-1.5">
                <input
                  ref={inputHistRef}
                  type="text"
                  placeholder="Cód."
                  value={codHistorico}
                  onChange={(e) => setCodHistorico(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      inputComplRef.current?.focus();
                    }
                  }}
                  className="w-16 bg-[#121212] border border-white/10 rounded px-2 py-1.5 text-neutral-100 font-mono focus:border-blue-500 outline-none"
                />
                <select
                  value={historicoObj?.id || ''}
                  onChange={(e) => {
                    const h = historicos.find(item => item.id === Number(e.target.value));
                    if (h) setCodHistorico(h.codigo.toString());
                  }}
                  className="flex-1 bg-[#121212] border border-white/10 rounded px-2 py-1.5 text-neutral-200 focus:border-blue-500 outline-none truncate"
                >
                  <option value="">Selecione Histórico...</option>
                  {historicos.map((h) => (
                    <option key={h.id} value={h.id}>{h.codigo} - {h.descricao}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 7. Complemento */}
            <div className="col-span-6">
              <label className="block text-[11px] font-medium text-neutral-400 mb-1">Complemento / Descrição</label>
              <input
                ref={inputComplRef}
                type="text"
                placeholder="Ex: Ref. NF-e 4921 Prestação de Serviços de Consultoria"
                value={complemento}
                onChange={(e) => setComplemento(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleGravarSimples();
                  }
                }}
                className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-100 focus:border-blue-500 outline-none"
              />
            </div>

            {/* 8. Botão Gravar */}
            <div className="col-span-2 flex items-end">
              <button
                type="submit"
                className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded shadow transition-colors flex items-center justify-center space-x-1.5"
              >
                <span>Gravar Partida</span>
                <kbd className="bg-blue-700/60 px-1 rounded text-[10px] font-mono">↵</kbd>
              </button>
            </div>
          </div>

          {/* Sub-painel de Rateio Gerencial Multi-Centros de Custo */}
          {habilitarRateio && (
            <div className="p-3 bg-[#161616] border border-purple-500/20 rounded-lg space-y-2 mt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Split className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-semibold text-purple-300">Grade de Rateio Gerencial de Centros de Custo:</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleDistribuirIgualmenteRateio}
                    className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] rounded border border-white/10"
                  >
                    Distribuir Igualmente
                  </button>
                  <button
                    type="button"
                    onClick={handleAddLinhaRateio}
                    className="px-2 py-0.5 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-[11px] rounded border border-purple-500/30 flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Adicionar Centro</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                {rateios.map((r, idx) => (
                  <div key={r.id} className="grid grid-cols-12 gap-2 items-center text-xs">
                    <div className="col-span-6">
                      <select
                        value={r.centroCustoId}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setRateios(prev => prev.map(item => item.id === r.id ? { ...item, centroCustoId: val } : item));
                        }}
                        className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1 text-neutral-200 outline-none"
                      >
                        {centrosCusto.map(cc => (
                          <option key={cc.id} value={cc.id}>
                            {cc.codigo} - {cc.nome}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-2">
                      <div className="flex items-center bg-[#121212] border border-white/10 rounded px-2 py-1">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="%"
                          value={r.percentual || ''}
                          onChange={(e) => handlePercentualRateioChange(r.id, parseFloat(e.target.value) || 0)}
                          className="w-full bg-transparent text-right font-mono text-purple-300 outline-none"
                        />
                        <span className="text-neutral-500 ml-1">%</span>
                      </div>
                    </div>

                    <div className="col-span-3">
                      <div className="flex items-center bg-[#121212] border border-white/10 rounded px-2 py-1">
                        <span className="text-neutral-500 mr-1">R$</span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0,00"
                          value={r.valor || ''}
                          onChange={(e) => handleValorRateioChange(r.id, parseFloat(e.target.value) || 0)}
                          className="w-full bg-transparent text-right font-mono text-emerald-400 outline-none"
                        />
                      </div>
                    </div>

                    <div className="col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveLinhaRateio(r.id)}
                        className="p-1 hover:bg-rose-500/20 text-neutral-500 hover:text-rose-400 rounded"
                        title="Remover Centro"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totalizador do Rateio */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-neutral-400">Totalizadores do Rateio:</span>
                <div className={`px-2.5 py-1 rounded font-mono text-xs font-semibold flex items-center space-x-2 border ${
                  rateioBalanceado 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                }`}>
                  <span>Soma: {totalPercRateio.toFixed(2)}%</span>
                  <span>•</span>
                  <span>{formatCurrency(totalValorRateio)}</span>
                  <span>•</span>
                  <span>{rateioBalanceado ? 'Balanceado 100% ✅' : `Diferença: ${(100 - totalPercRateio).toFixed(2)}% ⚠️`}</span>
                </div>
              </div>
            </div>
          )}
        </form>
      ) : (
        /* Partida Múltipla / Composta */
        <div className="p-4 bg-[#1c1c1c] border-b border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-neutral-300">Grade de Lançamento Composto (Mesmo Nº de Partida):</span>
            </div>

            <div className={`px-2.5 py-1 rounded text-xs font-mono font-medium flex items-center space-x-2 ${
              diferencaMultipla === 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30 animate-pulse'
            }`}>
              <span>Déb: {formatCurrency(totalMultiploDebito)}</span>
              <span>•</span>
              <span>Créd: {formatCurrency(totalMultiploCredito)}</span>
              <span>•</span>
              <strong>DxC: {formatCurrency(diferencaMultipla)}</strong>
            </div>
          </div>

          <div className="space-y-1.5">
            {multiplasItens.map((item, idx) => (
              <div key={item.id} className="flex items-center space-x-2 text-xs">
                <select
                  value={item.tipo}
                  onChange={(e) => {
                    const next = [...multiplasItens];
                    next[idx].tipo = e.target.value as 'DEBITO' | 'CREDITO';
                    setMultiplasItens(next);
                  }}
                  className={`w-24 px-2 py-1 rounded font-semibold text-xs border ${
                    item.tipo === 'DEBITO'
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                      : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                  }`}
                >
                  <option value="DEBITO">DÉBITO</option>
                  <option value="CREDITO">CRÉDITO</option>
                </select>

                <select
                  value={item.contaId || ''}
                  onChange={(e) => {
                    const next = [...multiplasItens];
                    next[idx].contaId = Number(e.target.value);
                    setMultiplasItens(next);
                  }}
                  className="flex-1 bg-[#121212] border border-white/10 rounded px-2 py-1 text-neutral-200 outline-none truncate"
                >
                  <option value="">Selecione Conta Analítica...</option>
                  {contasAnaliticas.map((c) => (
                    <option key={c.id} value={c.id}>{c.codigoReduzido} - {c.nome}</option>
                  ))}
                </select>

                <input
                  type="number"
                  placeholder="Valor R$"
                  value={item.valor || ''}
                  onChange={(e) => {
                    const next = [...multiplasItens];
                    next[idx].valor = parseFloat(e.target.value) || 0;
                    setMultiplasItens(next);
                  }}
                  className="w-32 bg-[#121212] border border-white/10 rounded px-2 py-1 text-right font-mono text-neutral-100 outline-none"
                />

                <input
                  type="text"
                  placeholder="Complemento de histórico..."
                  value={item.complemento}
                  onChange={(e) => {
                    const next = [...multiplasItens];
                    next[idx].complemento = e.target.value;
                    setMultiplasItens(next);
                  }}
                  className="flex-1 bg-[#121212] border border-white/10 rounded px-2 py-1 text-neutral-200 outline-none"
                />

                <button
                  onClick={() => {
                    if (multiplasItens.length > 2) {
                      setMultiplasItens(multiplasItens.filter((_, i) => i !== idx));
                    }
                  }}
                  className="p-1 hover:bg-rose-500/20 text-neutral-500 hover:text-rose-400 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => {
                setMultiplasItens([
                  ...multiplasItens,
                  { id: Date.now().toString(), tipo: 'CREDITO', contaId: 0, valor: 0, complemento: '' }
                ]);
              }}
              className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded border border-white/10 flex items-center space-x-1.5 text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Linha</span>
            </button>

            <button
              disabled={diferencaMultipla !== 0 || multiplasItens.some(i => !i.contaId || i.valor <= 0)}
              onClick={handleGravarMultipla}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium rounded shadow transition-colors text-xs flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Gravar Partida Múltipla</span>
            </button>
          </div>
        </div>
      )}

      {/* Grade de Lançamentos Registrados */}
      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              Diário de Lançamentos ({lancamentosFiltrados.length})
            </span>

            {/* Barra de Ações em Lote */}
            {selecionados.length > 0 && (
              <div className="flex items-center space-x-2 bg-rose-500/10 border border-rose-500/30 px-3 py-1 rounded-lg animate-fadeIn">
                <span className="text-xs text-rose-300 font-semibold">{selecionados.length} selecionado(s)</span>
                <button
                  onClick={handleExcluirLote}
                  className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-[11px] font-semibold flex items-center space-x-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Excluir Selecionados</span>
                </button>
                <button
                  onClick={() => setSelecionados([])}
                  className="px-1.5 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 text-[11px] rounded"
                >
                  Limpar
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                const headers = ['Partida', 'Data', 'Conta Débito', 'Conta Crédito', 'Valor', 'Histórico / Complemento', 'Centro de Custo / Rateio'];
                const rows = lancamentosFiltrados.map(l => {
                  const deb = contas.find(c => c.id === l.contaDebitoId)?.nome || '';
                  const cred = contas.find(c => c.id === l.contaCreditoId)?.nome || '';
                  const ccInfo = l.rateios && l.rateios.length > 0 
                    ? `Rateio (${l.rateios.length} Centros)` 
                    : l.centroCustoId ? (centrosCusto.find(cc => cc.id === l.centroCustoId)?.nome || '') : 'Sem CC';
                  return [l.numeroPartida, l.dataLancamento, deb, cred, l.valor, l.complementoHistorico, ccInfo];
                });
                exportToCSV(`Lancamentos_Contabeis_${new Date().toISOString().split('T')[0]}`, rows, headers);
              }}
              className="flex items-center space-x-1.5 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded border border-white/10 text-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exportar Excel</span>
            </button>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Filtrar por conta, valor ou histórico..."
                value={filtroTexto}
                onChange={(e) => setFiltroTexto(e.target.value)}
                className="bg-neutral-900 border border-white/10 rounded pl-8 pr-3 py-1 text-xs text-neutral-200 outline-none w-64 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Tabela de Lançamentos */}
        <div className="flex-1 bg-[#181818] border border-white/10 rounded-lg overflow-y-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-neutral-900/90 sticky top-0 border-b border-white/10 text-neutral-400 font-medium z-10">
              <tr>
                <th className="py-2 px-2.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selecionados.length === lancamentosFiltrados.length && lancamentosFiltrados.length > 0}
                    onChange={handleSelectAll}
                    className="rounded bg-neutral-900 border-white/20 text-blue-600 focus:ring-0"
                  />
                </th>
                <th className="py-2 px-3 w-16 text-center">Partida</th>
                <th className="py-2 px-3 w-24">Data</th>
                <th className="py-2 px-3 w-48">Conta Débito</th>
                <th className="py-2 px-3 w-48">Conta Crédito</th>
                <th className="py-2 px-3 w-32 text-right">Valor (R$)</th>
                <th className="py-2 px-3">Histórico / Centro de Custo</th>
                <th className="py-2 px-3 w-28 text-center">Tipo (Origem)</th>
                <th className="py-2 px-3 w-28 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {lancamentosFiltrados.map((l) => {
                const debito = contas.find(c => c.id === l.contaDebitoId);
                const credito = contas.find(c => c.id === l.contaCreditoId);
                const hist = historicos.find(h => h.id === l.historicoId);
                const ccObj = centrosCusto.find(cc => cc.id === l.centroCustoId);
                const isSelected = selecionados.includes(l.id);
                const origem = obterOrigemLancamento(l);
                const isEntradaCaixa = contaCaixaAtual && l.contaDebitoId === contaCaixaAtual.id;
                const isSaidaCaixa = contaCaixaAtual && l.contaCreditoId === contaCaixaAtual.id;

                return (
                  <tr key={l.id} className={`hover:bg-white/[0.02] transition-colors group ${isSelected ? 'bg-blue-600/10' : ''}`}>
                    <td className="py-2 px-2.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectOne(l.id)}
                        className="rounded bg-neutral-900 border-white/20 text-blue-600 focus:ring-0"
                      />
                    </td>
                    <td className="py-2 px-3 text-center font-mono text-neutral-500">#{l.numeroPartida}</td>
                    <td className="py-2 px-3 font-mono text-neutral-300">
                      {new Date(l.dataLancamento + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-2 px-3">
                      <div className="font-medium text-blue-400">{debito?.nome || 'Conta Inexistente'}</div>
                      <div className="text-[10px] text-neutral-500 font-mono">Red: {debito?.codigoReduzido} • {debito?.classificacao}</div>
                    </td>
                    <td className="py-2 px-3">
                      <div className="font-medium text-indigo-400">{credito?.nome || 'Conta Inexistente'}</div>
                      <div className="text-[10px] text-neutral-500 font-mono">Red: {credito?.codigoReduzido} • {credito?.classificacao}</div>
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-semibold text-emerald-400">
                      <div className="flex items-center justify-end space-x-1.5">
                        {modo === 'CAIXA' && isEntradaCaixa && (
                          <span className="text-[10px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">+E</span>
                        )}
                        {modo === 'CAIXA' && isSaidaCaixa && (
                          <span className="text-[10px] px-1 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">-S</span>
                        )}
                        <span>{formatCurrency(l.valor)}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-neutral-300">
                      <div className="flex items-center space-x-1.5 flex-wrap">
                        {hist && <span className="font-semibold text-neutral-400">[{hist.codigo}]</span>}
                        <span>{l.complementoHistorico || (hist?.descricao)}</span>
                        
                        {/* Tags de Centro de Custo ou Rateio */}
                        {l.rateios && l.rateios.length > 0 ? (
                          <button
                            onClick={() => setDetalheRateioLanc(l)}
                            className="inline-flex items-center space-x-1 px-1.5 py-0.5 bg-purple-500/15 border border-purple-500/30 text-purple-300 rounded text-[10px] hover:bg-purple-500/25 transition"
                            title="Clique para ver o detalhamento do rateio"
                          >
                            <Split className="w-2.5 h-2.5" />
                            <span>Rateio ({l.rateios.length} Centros)</span>
                          </button>
                        ) : ccObj ? (
                          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 bg-neutral-800 text-neutral-400 rounded text-[10px]">
                            <span>CC: {ccObj.codigo}</span>
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono border ${
                        origem === 'Normal'
                          ? 'bg-neutral-800 text-neutral-300 border-white/10'
                          : origem === 'Zeramento'
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : origem === 'Pagto Guia EF'
                          ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                          : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                      }`}>
                        {origem}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center space-x-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleAbrirEditar(l)}
                          className="p-1 hover:bg-white/10 text-neutral-400 hover:text-neutral-200 rounded"
                          title="Editar Lançamento"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleEstorno(l)}
                          className="p-1 hover:bg-amber-500/20 text-neutral-400 hover:text-amber-300 rounded"
                          title="Estorno Automático (Inverter DxC)"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDuplicateLancamento(l)}
                          className="p-1 hover:bg-blue-500/20 text-neutral-400 hover:text-blue-300 rounded"
                          title="Duplicar Partida"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteLancamento(l.id)}
                          className="p-1 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 rounded"
                          title="Excluir Lançamento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal F2 (Busca Rápida de Contas e Históricos) */}
      {showF2Modal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#1c1c1c] border border-white/10 rounded-xl shadow-2xl p-4 text-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-blue-400" />
                <span className="font-semibold text-neutral-100">
                  Busca Rápida de {f2Tipo === 'DEBITO' ? 'Conta Débito' : f2Tipo === 'CREDITO' ? 'Conta Crédito' : 'Histórico Padrão'} (F2)
                </span>
              </div>
              <button onClick={() => setShowF2Modal(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                ref={f2InputRef}
                type="text"
                placeholder="Digite o código reduzido, classificação ou nome..."
                value={f2Query}
                onChange={(e) => {
                  setF2Query(e.target.value);
                  setF2SelectedIndex(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setShowF2Modal(false);
                  } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setF2SelectedIndex(prev => Math.min(prev + 1, f2ItensFiltrados.length - 1));
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setF2SelectedIndex(prev => Math.max(prev - 1, 0));
                  } else if (e.key === 'Enter') {
                    e.preventDefault();
                    if (f2ItensFiltrados[f2SelectedIndex]) {
                      handleSelectF2Item(f2ItensFiltrados[f2SelectedIndex]);
                    }
                  }
                }}
                className="w-full pl-9 pr-3 py-2 bg-[#121212] border border-blue-500 rounded-lg text-neutral-100 font-mono text-xs outline-none"
              />
            </div>

            <div className="max-h-72 overflow-y-auto custom-scrollbar space-y-1">
              {f2ItensFiltrados.length === 0 ? (
                <div className="text-center py-6 text-neutral-500">Nenhum registro encontrado.</div>
              ) : (
                f2ItensFiltrados.map((item, idx) => {
                  const isConta = f2Tipo !== 'HISTORICO';
                  const c = item as ContaContabil;
                  const h = item as HistoricoPadrao;
                  const isCurrentSelected = idx === f2SelectedIndex;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectF2Item(item)}
                      onMouseEnter={() => setF2SelectedIndex(idx)}
                      className={`p-2.5 rounded-lg border transition-colors cursor-pointer flex items-center justify-between ${
                        isCurrentSelected 
                          ? 'bg-blue-600/20 border-blue-500/40 text-neutral-100' 
                          : 'bg-neutral-900/50 border-white/5 hover:border-white/10 text-neutral-300'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-xs flex items-center space-x-2">
                          <span className="font-mono text-blue-400">
                            {isConta ? c.codigoReduzido : h.codigo}
                          </span>
                          <span>-</span>
                          <span>{isConta ? c.nome : h.descricao}</span>
                        </div>
                        {isConta && (
                          <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                            Classificação: {c.classificacao} • Natureza: {c.natureza === 'D' ? 'Devedora' : 'Credora'}
                          </div>
                        )}
                      </div>
                      <div className="text-[10px] text-neutral-500 font-mono">
                        {isCurrentSelected && '↵ Selecionar'}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-neutral-500">
              <span>Use ↑ ↓ para navegar, ↵ Enter para confirmar, Esc para fechar</span>
              <span>Total: {f2ItensFiltrados.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalhes do Rateio */}
      {detalheRateioLanc && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#1c1c1c] border border-white/10 rounded-xl shadow-2xl p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <Split className="w-4 h-4 text-purple-400" />
                <span className="font-semibold text-neutral-100">
                  Rateio Gerencial da Partida #{detalheRateioLanc.numeroPartida}
                </span>
              </div>
              <button onClick={() => setDetalheRateioLanc(null)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-neutral-400">
                <span>Valor Total da Partida:</span>
                <span className="font-mono font-bold text-neutral-100">{formatCurrency(detalheRateioLanc.valor)}</span>
              </div>

              <div className="divide-y divide-white/5 border border-white/10 rounded-lg overflow-hidden bg-neutral-900/50">
                {detalheRateioLanc.rateios?.map((r, i) => {
                  const cc = centrosCusto.find(c => c.id === r.centroCustoId);
                  return (
                    <div key={i} className="p-2.5 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-neutral-200">{cc?.nome || 'Centro de Custo'}</div>
                        <div className="text-[10px] text-neutral-500 font-mono">Cód: {cc?.codigo}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-purple-300">{formatPercent(r.percentual)}</div>
                        <div className="font-mono text-emerald-400">{formatCurrency(r.valor)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 text-right">
              <button
                onClick={() => setDetalheRateioLanc(null)}
                className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edição Direta de Lançamento */}
      {editandoLancamento && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1c] border border-white/10 rounded-xl w-full max-w-lg p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-semibold text-neutral-100">
              Editar Lançamento #{editandoLancamento.numeroPartida}
            </h3>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-neutral-400 mb-1">Data:</label>
                  <input
                    type="date"
                    value={editData}
                    onChange={(e) => setEditData(e.target.value)}
                    className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-100 font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Valor (R$):</label>
                  <input
                    type="text"
                    value={editValor}
                    onChange={(e) => setEditValor(e.target.value)}
                    className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-100 font-mono font-bold text-right outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Conta Débito:</label>
                <select
                  value={editDebitoId}
                  onChange={(e) => setEditDebitoId(Number(e.target.value))}
                  className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-200 outline-none"
                >
                  {contasAnaliticas.map(c => (
                    <option key={c.id} value={c.id}>{c.codigoReduzido} - {c.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Conta Crédito:</label>
                <select
                  value={editCreditoId}
                  onChange={(e) => setEditCreditoId(Number(e.target.value))}
                  className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-200 outline-none"
                >
                  {contasAnaliticas.map(c => (
                    <option key={c.id} value={c.id}>{c.codigoReduzido} - {c.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Complemento / Descrição:</label>
                <input
                  type="text"
                  value={editComplemento}
                  onChange={(e) => setEditComplemento(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-100 outline-none"
                />
              </div>

              {/* Centro de Custo / Rateio na Edição */}
              <div className="pt-2 border-t border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-neutral-400 font-medium">Alocação de Centro de Custo / Rateio:</label>
                  <label className="flex items-center space-x-1.5 cursor-pointer text-purple-300">
                    <input
                      type="checkbox"
                      checked={editHabilitarRateio}
                      onChange={(e) => setEditHabilitarRateio(e.target.checked)}
                      className="rounded bg-neutral-900 border-white/20 text-purple-600 focus:ring-0"
                    />
                    <span>Multi-Centros (Rateio)</span>
                  </label>
                </div>

                {!editHabilitarRateio ? (
                  <select
                    value={editCentroCustoId}
                    onChange={(e) => setEditCentroCustoId(Number(e.target.value))}
                    className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-200 outline-none"
                  >
                    <option value={0}>Sem Centro de Custo</option>
                    {centrosCusto.map(cc => (
                      <option key={cc.id} value={cc.id}>{cc.codigo} - {cc.nome}</option>
                    ))}
                  </select>
                ) : (
                  <div className="space-y-2 p-3 bg-neutral-900/60 rounded border border-purple-500/20">
                    <div className="space-y-1.5">
                      {editRateios.map((r, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <select
                            value={r.centroCustoId}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              const next = [...editRateios];
                              next[i].centroCustoId = val;
                              setEditRateios(next);
                            }}
                            className="flex-1 bg-[#121212] border border-white/10 rounded px-2 py-1 text-neutral-200 outline-none"
                          >
                            {centrosCusto.map(cc => (
                              <option key={cc.id} value={cc.id}>{cc.codigo} - {cc.nome}</option>
                            ))}
                          </select>
                          <input
                            type="number"
                            placeholder="%"
                            value={r.percentual || ''}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              const next = [...editRateios];
                              next[i].percentual = val;
                              const vNum = parseFloat(editValor.replace(/\./g, '').replace(',', '.')) || 0;
                              next[i].valor = parseFloat(((vNum * val) / 100).toFixed(2));
                              setEditRateios(next);
                            }}
                            className="w-20 bg-[#121212] border border-white/10 rounded px-2 py-1 text-right font-mono text-purple-300 outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setEditRateios(editRateios.filter((_, idx) => idx !== i))}
                            className="p-1 hover:bg-rose-500/20 text-neutral-500 hover:text-rose-400 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const defaultCC = centrosCusto[0]?.id || 1;
                        setEditRateios([...editRateios, { id: Date.now(), centroCustoId: defaultCC, percentual: 0, valor: 0 }]);
                      }}
                      className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-[11px] flex items-center space-x-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Adicionar Linha</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-white/10">
              <button
                onClick={() => setEditandoLancamento(null)}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvarEdicao}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition shadow-lg shadow-blue-600/20"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal F11 */}
      {showF11Modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#202020] border border-white/10 rounded-xl shadow-2xl p-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <History className="w-4 h-4 text-blue-400" />
                <span className="font-semibold text-neutral-200">Consulta Rápida de Contas e Históricos (F11)</span>
              </div>
              <button onClick={() => setShowF11Modal(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <div className="mt-3 space-y-3">
              <div>
                <span className="font-medium text-neutral-400 uppercase tracking-wider text-[10px]">Contas Analíticas Recorrentes:</span>
                <div className="grid grid-cols-2 gap-1.5 mt-1">
                  {contasAnaliticas.slice(0, 8).map(c => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setCodDebito(c.codigoReduzido.toString());
                        setShowF11Modal(false);
                      }}
                      className="p-2 bg-neutral-900/60 border border-white/5 hover:border-blue-500 rounded text-left transition-colors"
                    >
                      <div className="font-medium text-neutral-200">{c.codigoReduzido} - {c.nome}</div>
                      <div className="text-[10px] text-neutral-500 font-mono">{c.classificacao}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-medium text-neutral-400 uppercase tracking-wider text-[10px]">Históricos Padrão Frequentes:</span>
                <div className="space-y-1 mt-1">
                  {historicos.slice(0, 5).map(h => (
                    <button
                      key={h.id}
                      onClick={() => {
                        setCodHistorico(h.codigo.toString());
                        setShowF11Modal(false);
                      }}
                      className="w-full p-2 bg-neutral-900/60 border border-white/5 hover:border-blue-500 rounded text-left transition-colors"
                    >
                      <div className="font-medium text-neutral-300">[{h.codigo}] {h.descricao}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 text-right">
              <button
                onClick={() => setShowF11Modal(false)}
                className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-200"
              >
                Fechar (Esc)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
