import React, { useState, useMemo } from 'react';
import {
  ContaContabil,
  LancamentoContabil,
  Empresa,
  LinhaLivroEntradas,
  LinhaLivroSaidas,
  ResumoApuracaoICMSLivro
} from '../../types/contabil';
import { dbService } from '../../db/sqliteService';
import { ReportPrintPreviewModal } from '../layout/ReportPrintPreviewModal';
import { exportToCSV } from '../../utils/exportUtils';
import {
  ScrollText,
  BookOpen,
  FileCheck,
  Calendar,
  Filter,
  Printer,
  FileSpreadsheet,
  TrendingUp,
  TrendingDown,
  Search,
  Building2,
  Hash,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Layers,
  ArrowDownRight,
  ArrowUpRight,
  FileText
} from 'lucide-react';

interface LivrosOficiaisModuleProps {
  empresa: Empresa;
  contas: ContaContabil[];
  lancamentos: LancamentoContabil[];
  initialContaId?: number;
}

type TipoLivro = 'DIARIO' | 'RAZAO' | 'ENTRADAS' | 'SAIDAS' | 'APURACAO_ICMS_ISS' | 'TERMOS';

export const LivrosOficiaisModule: React.FC<LivrosOficiaisModuleProps> = ({
  empresa,
  contas,
  lancamentos,
  initialContaId
}) => {
  const [tipoLivro, setTipoLivro] = useState<TipoLivro>('DIARIO');
  const [selectedContaId, setSelectedContaId] = useState<number>(initialContaId || 0);
  const [buscaTexto, setBuscaTexto] = useState<string>('');
  const [dataInicial, setDataInicial] = useState<string>(`${empresa.exercicioAtivo}-01-01`);
  const [dataFinal, setDataFinal] = useState<string>(`${empresa.exercicioAtivo}-12-31`);
  const [termoAlvo, setTermoAlvo] = useState<'DIARIO' | 'RAZAO' | 'ENTRADAS' | 'SAIDAS' | 'APURACAO'>('DIARIO');

  // Estado da Modal de Impressão A4
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [orientacaoRelatorio, setOrientacaoRelatorio] = useState<'portrait' | 'landscape'>('portrait');
  const [printTitulo, setPrintTitulo] = useState<string>('');
  const [printSubtitulo, setPrintSubtitulo] = useState<string>('');

  // 1. DADOS LIVRO DIÁRIO GERAL
  const lancamentosOrdenados = useMemo(() => {
    return [...lancamentos].sort((a, b) =>
      new Date(a.dataLancamento).getTime() - new Date(b.dataLancamento).getTime() || a.numeroPartida - b.numeroPartida
    );
  }, [lancamentos]);

  const totalDebitosDiario = useMemo(() => lancamentosOrdenados.reduce((acc, l) => acc + l.valor, 0), [lancamentosOrdenados]);
  const totalCreditosDiario = totalDebitosDiario;

  // 2. DADOS LIVRO RAZÃO ANALÍTICO
  const contaSelecionada = useMemo(() => contas.find(c => c.id === selectedContaId), [contas, selectedContaId]);

  const lancamentosRazao = useMemo(() => {
    let list = selectedContaId > 0
      ? lancamentosOrdenados.filter(l => l.contaDebitoId === selectedContaId || l.contaCreditoId === selectedContaId)
      : lancamentosOrdenados;
    if (buscaTexto.trim()) {
      const q = buscaTexto.toLowerCase();
      list = list.filter(l => l.complementoHistorico.toLowerCase().includes(q) || l.numeroPartida.toString().includes(q));
    }
    return list;
  }, [lancamentosOrdenados, selectedContaId, buscaTexto]);

  const totaisRazao = useMemo(() => {
    let totalD = 0;
    let totalC = 0;
    for (const l of lancamentosRazao) {
      if (l.contaDebitoId === selectedContaId) totalD += l.valor;
      if (l.contaCreditoId === selectedContaId) totalC += l.valor;
    }
    const saldoAnt = contaSelecionada?.saldoAnterior || 0;
    const isDevedora = contaSelecionada?.natureza === 'D';
    const saldoAtual = isDevedora ? (saldoAnt + totalD - totalC) : (saldoAnt + totalC - totalD);
    return { totalD, totalC, saldoAtual };
  }, [lancamentosRazao, selectedContaId, contaSelecionada]);

  // 3. DADOS LIVRO REGISTRO DE ENTRADAS (MOD. 1 / 1-A)
  const linhasEntradas = useMemo(() => {
    return dbService.gerarLivroEntradas(empresa.id, dataInicial, dataFinal);
  }, [empresa.id, dataInicial, dataFinal]);

  const totaisEntradas = useMemo(() => {
    return linhasEntradas.reduce((acc, l) => ({
      contabil: acc.contabil + l.valorContabil,
      baseICMS: acc.baseICMS + l.baseCalculoICMS,
      icmsCreditado: acc.icmsCreditado + l.impostoCreditadoICMS,
      isentas: acc.isentas + l.isentasNaoTributadasICMS,
      outras: acc.outras + l.outrasICMS
    }), { contabil: 0, baseICMS: 0, icmsCreditado: 0, isentas: 0, outras: 0 });
  }, [linhasEntradas]);

  // Resumo por CFOP nas Entradas
  const resumoCFOPEntradas = useMemo(() => {
    const mapa = new Map<string, { cfop: string; count: number; total: number; icms: number }>();
    for (const l of linhasEntradas) {
      const cur = mapa.get(l.cfop) || { cfop: l.cfop, count: 0, total: 0, icms: 0 };
      cur.count += 1;
      cur.total += l.valorContabil;
      cur.icms += l.impostoCreditadoICMS;
      mapa.set(l.cfop, cur);
    }
    return Array.from(mapa.values());
  }, [linhasEntradas]);

  // 4. DADOS LIVRO REGISTRO DE SAÍDAS (MOD. 2 / 2-A)
  const linhasSaidas = useMemo(() => {
    return dbService.gerarLivroSaidas(empresa.id, dataInicial, dataFinal);
  }, [empresa.id, dataInicial, dataFinal]);

  const totaisSaidas = useMemo(() => {
    return linhasSaidas.reduce((acc, l) => ({
      contabil: acc.contabil + l.valorContabil,
      baseICMS: acc.baseICMS + l.baseCalculoICMS,
      icmsDebitado: acc.icmsDebitado + l.impostoDebitadoICMS,
      isentas: acc.isentas + l.isentasNaoTributadasICMS,
      outras: acc.outras + l.outrasICMS
    }), { contabil: 0, baseICMS: 0, icmsDebitado: 0, isentas: 0, outras: 0 });
  }, [linhasSaidas]);

  // Resumo por CFOP nas Saídas
  const resumoCFOPSaidas = useMemo(() => {
    const mapa = new Map<string, { cfop: string; count: number; total: number; icms: number }>();
    for (const l of linhasSaidas) {
      const cur = mapa.get(l.cfop) || { cfop: l.cfop, count: 0, total: 0, icms: 0 };
      cur.count += 1;
      cur.total += l.valorContabil;
      cur.icms += l.impostoDebitadoICMS;
      mapa.set(l.cfop, cur);
    }
    return Array.from(mapa.values());
  }, [linhasSaidas]);

  // 5. DADOS LIVRO DE APURAÇÃO DO ICMS E ISS (MOD. 9)
  const apuracaoLivro = useMemo(() => {
    return dbService.gerarApuracaoICMSLivro(empresa.id, empresa.competenciaAtiva);
  }, [empresa.id, empresa.competenciaAtiva]);

  // Abertura do Modal de Impressão A4 Paginado
  const handleAbrirPrintPreview = () => {
    if (tipoLivro === 'DIARIO') {
      setPrintTitulo('LIVRO DIÁRIO GERAL (TERMO OFICIAL Nº 001)');
      setPrintSubtitulo(`Exercício Social ${empresa.exercicioAtivo} • Normas Brasileiras de Contabilidade NBC TG`);
      setOrientacaoRelatorio('portrait');
    } else if (tipoLivro === 'RAZAO') {
      setPrintTitulo(contaSelecionada ? `LIVRO RAZÃO ANALÍTICO - ${contaSelecionada.codigoReduzido} - ${contaSelecionada.nome}` : 'LIVRO RAZÃO ANALÍTICO GERAL');
      setPrintSubtitulo(`Exercício Social ${empresa.exercicioAtivo} • Período: ${dataInicial} a ${dataFinal}`);
      setOrientacaoRelatorio('landscape');
    } else if (tipoLivro === 'ENTRADAS') {
      setPrintTitulo('LIVRO REGISTRO DE ENTRADAS (MODELO 1 / 1-A)');
      setPrintSubtitulo(`Escrituração Fiscal das Operações de Entrada com Crédito de ICMS e IPI • Período: ${dataInicial} a ${dataFinal}`);
      setOrientacaoRelatorio('landscape');
    } else if (tipoLivro === 'SAIDAS') {
      setPrintTitulo('LIVRO REGISTRO DE SAÍDAS (MODELO 2 / 2-A)');
      setPrintSubtitulo(`Escrituração Fiscal das Operações de Saída com Débito de ICMS e Substituição Tributária • Período: ${dataInicial} a ${dataFinal}`);
      setOrientacaoRelatorio('landscape');
    } else if (tipoLivro === 'APURACAO_ICMS_ISS') {
      setPrintTitulo('LIVRO REGISTRO DE APURAÇÃO DO ICMS E ISS (MODELO 9)');
      setPrintSubtitulo(`Apuração Periódica de Débitos, Créditos e Fixação de Saldo do ICMS e ISSQN • Comp. ${empresa.competenciaAtiva}`);
      setOrientacaoRelatorio('portrait');
    } else if (tipoLivro === 'TERMOS') {
      setPrintTitulo(`TERMOS OFICIAIS DE ABERTURA E ENCERRAMENTO - LIVRO ${termoAlvo}`);
      setPrintSubtitulo(`Junta Comercial do Estado • Código Civil Art. 1.180 • Exercício ${empresa.exercicioAtivo}`);
      setOrientacaoRelatorio('portrait');
    }
    setIsPrintModalOpen(true);
  };

  // Exportação CSV do Livro Selecionado
  const handleExportarCSV = () => {
    if (tipoLivro === 'DIARIO') {
      const headers = ['Partida', 'Data', 'Tipo', 'Conta Débito', 'Conta Crédito', 'Histórico', 'Valor (R$)'];
      const rows = lancamentosOrdenados.map(l => {
        const d = contas.find(c => c.id === l.contaDebitoId);
        const c = contas.find(c => c.id === l.contaCreditoId);
        return [l.numeroPartida, l.dataLancamento, l.tipoPartida, `${d?.codigoReduzido} - ${d?.nome}`, `${c?.codigoReduzido} - ${c?.nome}`, l.complementoHistorico, l.valor];
      });
      exportToCSV(`Livro_Diario_${empresa.exercicioAtivo}`, rows, headers);
    } else if (tipoLivro === 'RAZAO') {
      const headers = ['Data', 'Partida', 'Contrapartida', 'Histórico', 'Débito (R$)', 'Crédito (R$)'];
      const rows = lancamentosRazao.map(l => {
        const isDeb = l.contaDebitoId === selectedContaId;
        const contra = contas.find(c => c.id === (isDeb ? l.contaCreditoId : l.contaDebitoId));
        return [l.dataLancamento, l.numeroPartida, contra?.nome || 'Diversos', l.complementoHistorico, isDeb ? l.valor : 0, !isDeb ? l.valor : 0];
      });
      exportToCSV(`Livro_Razao_${contaSelecionada ? contaSelecionada.codigoReduzido : 'Geral'}`, rows, headers);
    } else if (tipoLivro === 'ENTRADAS') {
      const headers = ['Data Entrada', 'Data Emissão', 'Espécie', 'Série', 'Número', 'Emitente', 'CNPJ/CPF', 'UF', 'CFOP', 'Valor Contábil', 'Base ICMS', 'Alíq %', 'ICMS Creditado', 'Isentas', 'Outras'];
      const rows = linhasEntradas.map(l => [l.dataEntrada, l.dataEmissao, l.especie, l.serie, l.numero, l.emitenteNome, l.emitenteCnpjCpf, l.emitenteUf, l.cfop, l.valorContabil, l.baseCalculoICMS, l.aliquotaICMS, l.impostoCreditadoICMS, l.isentasNaoTributadasICMS, l.outrasICMS]);
      exportToCSV(`Livro_Registro_Entradas_Mod1_${empresa.exercicioAtivo}`, rows, headers);
    } else if (tipoLivro === 'SAIDAS') {
      const headers = ['Data Emissão', 'Data Saída', 'Espécie', 'Série', 'Número', 'Destinatário', 'CNPJ/CPF', 'UF', 'CFOP', 'Valor Contábil', 'Base ICMS', 'Alíq %', 'ICMS Debitado', 'Isentas', 'Outras'];
      const rows = linhasSaidas.map(l => [l.dataEmissao, l.dataSaida || '', l.especie, l.serie, l.numero, l.destinatarioNome, l.destinatarioCnpjCpf, l.destinatarioUf, l.cfop, l.valorContabil, l.baseCalculoICMS, l.aliquotaICMS, l.impostoDebitadoICMS, l.isentasNaoTributadasICMS, l.outrasICMS]);
      exportToCSV(`Livro_Registro_Saidas_Mod2_${empresa.exercicioAtivo}`, rows, headers);
    } else if (tipoLivro === 'APURACAO_ICMS_ISS') {
      const headers = ['Item da Apuração', 'Valor (R$)'];
      const rows = [
        ['Total de Débito por Saídas', apuracaoLivro.totalDebitoPorSaidas],
        ['Total de Crédito por Entradas', apuracaoLivro.totalCreditoPorEntradas],
        ['Saldo Credor Anterior', apuracaoLivro.saldoCredorAnterior],
        ['Saldo Devedor a Recolher', apuracaoLivro.saldoDevedorApurado],
        ['Saldo Credor a Transportar', apuracaoLivro.saldoCredorATransportar],
        ['Receita de Serviços Prestados (ISS)', apuracaoLivro.receitaServicos],
        ['Base de Cálculo do ISS', apuracaoLivro.baseCalculoISS],
        ['ISS Próprio Devido (5%)', apuracaoLivro.issProprioDevido],
        ['ISS Retido na Fonte', apuracaoLivro.issRetidoFonte],
        ['ISS Líquido a Recolher', apuracaoLivro.issLiquidoARecolher]
      ];
      exportToCSV(`Livro_Apuracao_Mod9_${apuracaoLivro.competencia}`, rows, headers);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#141414] text-neutral-200 overflow-hidden select-none font-sans">
      {/* 1. Header do Módulo & Barra de Navegação Fluent Dark */}
      <div className="px-5 py-3 bg-[#181818] border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-neutral-100 flex items-center space-x-2">
              <span>Livros Fiscais & Contábeis Oficiais</span>
              <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-mono font-medium border border-blue-500/30">
                Exercício: {empresa.exercicioAtivo} • Livro nº 001
              </span>
            </h2>
            <p className="text-[11px] text-neutral-400">
              {empresa.razaoSocial} • CNPJ: {empresa.cnpj} • Padrão  Sistemas
            </p>
          </div>
        </div>

        {/* Botões de Ação do Header */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportarCSV}
            className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-white/10 hover:bg-neutral-800 text-xs font-medium text-neutral-300 hover:text-white transition flex items-center space-x-1.5 shadow-sm"
            title="Exportar para Excel / CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={handleAbrirPrintPreview}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition flex items-center space-x-1.5 shadow-md shadow-blue-900/30"
            title="Visualização A4 Oficial com Cabeçalho e Rodapé"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir A4 Oficial</span>
          </button>
        </div>
      </div>

      {/* 2. Barra de Abas dos Livros Oficiais */}
      <div className="px-5 py-2 bg-[#161616] border-b border-white/10 flex items-center justify-between overflow-x-auto text-xs">
        <div className="flex items-center bg-[#101010] p-0.5 rounded-lg border border-white/10">
          <button
            onClick={() => setTipoLivro('DIARIO')}
            className={`px-3 py-1.5 rounded-md font-medium transition flex items-center space-x-1.5 ${tipoLivro === 'DIARIO' ? 'bg-blue-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
          >
            <ScrollText className="w-3.5 h-3.5" />
            <span>Livro Diário Geral</span>
          </button>
          <button
            onClick={() => setTipoLivro('RAZAO')}
            className={`px-3 py-1.5 rounded-md font-medium transition flex items-center space-x-1.5 ${tipoLivro === 'RAZAO' ? 'bg-blue-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Livro Razão Analítico</span>
          </button>
          <button
            onClick={() => setTipoLivro('ENTRADAS')}
            className={`px-3 py-1.5 rounded-md font-medium transition flex items-center space-x-1.5 ${tipoLivro === 'ENTRADAS' ? 'bg-blue-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
          >
            <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
            <span>Registro de Entradas (Mod. 1)</span>
          </button>
          <button
            onClick={() => setTipoLivro('SAIDAS')}
            className={`px-3 py-1.5 rounded-md font-medium transition flex items-center space-x-1.5 ${tipoLivro === 'SAIDAS' ? 'bg-blue-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-blue-400" />
            <span>Registro de Saídas (Mod. 2)</span>
          </button>
          <button
            onClick={() => setTipoLivro('APURACAO_ICMS_ISS')}
            className={`px-3 py-1.5 rounded-md font-medium transition flex items-center space-x-1.5 ${tipoLivro === 'APURACAO_ICMS_ISS' ? 'bg-blue-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Apuração ICMS/ISS (Mod. 9)</span>
          </button>
          <button
            onClick={() => setTipoLivro('TERMOS')}
            className={`px-3 py-1.5 rounded-md font-medium transition flex items-center space-x-1.5 ${tipoLivro === 'TERMOS' ? 'bg-blue-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
          >
            <FileCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Termos Oficiais</span>
          </button>
        </div>

        {/* Filtros Contextuais */}
        <div className="flex items-center space-x-3 text-xs">
          {(tipoLivro === 'ENTRADAS' || tipoLivro === 'SAIDAS') && (
            <div className="flex items-center space-x-2 bg-neutral-900 border border-white/10 px-2 py-1 rounded-md">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              <input
                type="date"
                value={dataInicial}
                onChange={(e) => setDataInicial(e.target.value)}
                className="bg-transparent text-neutral-200 outline-none text-[11px] font-mono"
              />
              <span className="text-neutral-500">até</span>
              <input
                type="date"
                value={dataFinal}
                onChange={(e) => setDataFinal(e.target.value)}
                className="bg-transparent text-neutral-200 outline-none text-[11px] font-mono"
              />
            </div>
          )}

          {tipoLivro === 'RAZAO' && (
            <div className="flex items-center space-x-2">
              <span className="text-neutral-400">Conta:</span>
              <select
                value={selectedContaId}
                onChange={(e) => setSelectedContaId(Number(e.target.value))}
                className="bg-neutral-900 border border-white/10 rounded px-2.5 py-1 text-neutral-200 outline-none max-w-xs truncate text-xs"
              >
                <option value={0}>Todas as Contas Movimentadas</option>
                {contas.filter(c => c.tipo === 'A').map(c => (
                  <option key={c.id} value={c.id}>
                    {c.codigoReduzido} - {c.nome} ({c.classificacao})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* 3. Área de Conteúdo do Livro Selecionado */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4">
        {/* ABA 1: LIVRO DIÁRIO GERAL */}
        {tipoLivro === 'DIARIO' && (
          <div className="space-y-4">
            {/* KPI Cards do Diário */}
            <div className="grid grid-cols-4 gap-3">
              <div className="p-3 bg-[#181818] border border-white/10 rounded-xl">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold">Total de Partidas</span>
                <p className="text-xl font-bold font-mono text-neutral-100 mt-1">{lancamentosOrdenados.length}</p>
                <span className="text-[10px] text-neutral-500 font-mono">Sequencial #1 a #{lancamentosOrdenados.length}</span>
              </div>
              <div className="p-3 bg-[#181818] border border-white/10 rounded-xl">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold">Total Débitos</span>
                <p className="text-xl font-bold font-mono text-blue-400 mt-1">
                  R$ {totalDebitosDiario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <span className="text-[10px] text-neutral-500 font-mono">Movimentação a débito</span>
              </div>
              <div className="p-3 bg-[#181818] border border-white/10 rounded-xl">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold">Total Créditos</span>
                <p className="text-xl font-bold font-mono text-indigo-400 mt-1">
                  R$ {totalCreditosDiario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <span className="text-[10px] text-neutral-500 font-mono">Movimentação a crédito</span>
              </div>
              <div className="p-3 bg-[#181818] border border-white/10 rounded-xl">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold">Status de Balanceamento</span>
                <div className="flex items-center space-x-1.5 mt-1">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-bold text-emerald-400 font-mono">Partidas Dobradas 100%</span>
                </div>
                <span className="text-[10px] text-neutral-500 font-mono">Diferença DxC = R$ 0,00</span>
              </div>
            </div>

            {/* Tabela do Diário */}
            <div className="bg-[#181818] border border-white/10 rounded-xl overflow-hidden shadow-lg">
              <div className="p-3 bg-neutral-900 border-b border-white/10 flex items-center justify-between text-xs font-semibold text-neutral-300">
                <span>ESCRITURAÇÃO CRONOLÓGICA DAS TRANSAÇÕES PATRIMONIAIS</span>
                <span className="font-mono text-neutral-500">Padrão Decreto 9.580/2018 (RIR)</span>
              </div>
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-neutral-900/60 border-b border-white/10 text-neutral-400 font-medium">
                  <tr>
                    <th className="py-2.5 px-3 w-16 text-center">Partida</th>
                    <th className="py-2.5 px-3 w-24">Data</th>
                    <th className="py-2.5 px-3">Partidas Dobradas / Histórico Contábil</th>
                    <th className="py-2.5 px-3 w-32 text-right">Débito (R$)</th>
                    <th className="py-2.5 px-3 w-32 text-right">Crédito (R$)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {lancamentosOrdenados.map((l) => {
                    const debito = contas.find(c => c.id === l.contaDebitoId);
                    const credito = contas.find(c => c.id === l.contaCreditoId);

                    return (
                      <React.Fragment key={l.id}>
                        <tr className="hover:bg-white/[0.02]">
                          <td className="py-2 px-3 text-center font-mono text-neutral-500" rowSpan={2}>
                            #{l.numeroPartida}
                          </td>
                          <td className="py-2 px-3 font-mono text-neutral-400" rowSpan={2}>
                            {new Date(l.dataLancamento + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </td>
                          <td className="py-1 px-3">
                            <span className="font-semibold text-blue-400">D - {debito?.nome}</span>
                            <span className="text-[10px] text-neutral-500 font-mono ml-2">({debito?.classificacao} • Red. {debito?.codigoReduzido})</span>
                          </td>
                          <td className="py-1 px-3 text-right font-mono font-semibold text-blue-400">
                            {l.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-1 px-3 text-right font-mono text-neutral-600">-</td>
                        </tr>
                        <tr className="hover:bg-white/[0.02] border-b border-white/10">
                          <td className="py-1 px-3 pb-2.5">
                            <div className="pl-4">
                              <span className="font-semibold text-indigo-400">C - {credito?.nome}</span>
                              <span className="text-[10px] text-neutral-500 font-mono ml-2">({credito?.classificacao} • Red. {credito?.codigoReduzido})</span>
                              <div className="text-[11px] text-neutral-400 mt-0.5 italic">
                                Hist: {l.complementoHistorico || 'Transação contábil ordinária'}
                              </div>
                            </div>
                          </td>
                          <td className="py-1 px-3 text-right font-mono text-neutral-600">-</td>
                          <td className="py-1 px-3 text-right font-mono font-semibold text-indigo-400">
                            {l.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 2: LIVRO RAZÃO ANALÍTICO */}
        {tipoLivro === 'RAZAO' && (
          <div className="space-y-4">
            {contaSelecionada && (
              <div className="p-4 bg-[#181818] border border-white/10 rounded-xl flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-neutral-100 flex items-center space-x-2">
                    <span>{contaSelecionada.codigoReduzido} - {contaSelecionada.nome}</span>
                    <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded font-mono">
                      {contaSelecionada.classificacao}
                    </span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    Natureza: <strong className="text-neutral-200">{contaSelecionada.natureza === 'D' ? 'Devedora' : 'Credora'}</strong> • Grau {contaSelecionada.grau} • Conta Analítica
                  </p>
                </div>
                <div className="flex items-center space-x-6 text-right font-mono text-xs">
                  <div>
                    <span className="text-neutral-500 block text-[10px]">SALDO ANTERIOR</span>
                    <span className="font-bold text-neutral-300">
                      R$ {contaSelecionada.saldoAnterior.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px]">TOTAL DÉBITOS</span>
                    <span className="font-bold text-blue-400">
                      R$ {totaisRazao.totalD.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px]">TOTAL CRÉDITOS</span>
                    <span className="font-bold text-indigo-400">
                      R$ {totaisRazao.totalC.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="pl-4 border-l border-white/10">
                    <span className="text-neutral-500 block text-[10px]">SALDO ATUAL</span>
                    <span className="font-bold text-emerald-400 text-sm">
                      R$ {totaisRazao.saldoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-[#181818] border border-white/10 rounded-xl overflow-hidden shadow-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-neutral-900 border-b border-white/10 text-neutral-400 font-medium">
                  <tr>
                    <th className="py-2.5 px-3 w-24">Data</th>
                    <th className="py-2.5 px-3 w-16 text-center">Partida</th>
                    <th className="py-2.5 px-3 w-48">Contrapartida</th>
                    <th className="py-2.5 px-3">Histórico / Descrição</th>
                    <th className="py-2.5 px-3 w-28 text-right">Débito (R$)</th>
                    <th className="py-2.5 px-3 w-28 text-right">Crédito (R$)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {lancamentosRazao.map((l) => {
                    const isDebito = l.contaDebitoId === selectedContaId;
                    const contrapartida = contas.find(c => c.id === (isDebito ? l.contaCreditoId : l.contaDebitoId));

                    return (
                      <tr key={l.id} className="hover:bg-white/[0.02]">
                        <td className="py-2 px-3 font-mono text-neutral-400">
                          {new Date(l.dataLancamento + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-2 px-3 text-center font-mono text-neutral-500">#{l.numeroPartida}</td>
                        <td className="py-2 px-3 font-medium text-neutral-300">{contrapartida?.nome || 'Diversos'}</td>
                        <td className="py-2 px-3 text-neutral-400">{l.complementoHistorico}</td>
                        <td className="py-2 px-3 text-right font-mono text-blue-400">
                          {isDebito || selectedContaId === 0 ? l.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-indigo-400">
                          {!isDebito || selectedContaId === 0 ? l.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 3: REGISTRO DE ENTRADAS (MOD. 1 / 1-A) */}
        {tipoLivro === 'ENTRADAS' && (
          <div className="space-y-4">
            {/* KPI Cards Entradas */}
            <div className="grid grid-cols-5 gap-3">
              <div className="p-3 bg-[#181818] border border-white/10 rounded-xl">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold">Total de Documentos</span>
                <p className="text-xl font-bold font-mono text-neutral-100 mt-1">{linhasEntradas.length} NFs</p>
                <span className="text-[10px] text-neutral-500 font-mono">Entradas no período</span>
              </div>
              <div className="p-3 bg-[#181818] border border-white/10 rounded-xl">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold">Valor Contábil Total</span>
                <p className="text-xl font-bold font-mono text-neutral-100 mt-1">
                  R$ {totaisEntradas.contabil.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <span className="text-[10px] text-neutral-500 font-mono">Total das compras</span>
              </div>
              <div className="p-3 bg-[#181818] border border-white/10 rounded-xl">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold">Base de Cálculo ICMS</span>
                <p className="text-xl font-bold font-mono text-blue-400 mt-1">
                  R$ {totaisEntradas.baseICMS.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <span className="text-[10px] text-neutral-500 font-mono">Operações tributadas</span>
              </div>
              <div className="p-3 bg-[#181818] border border-white/10 rounded-xl">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold">ICMS Creditado</span>
                <p className="text-xl font-bold font-mono text-emerald-400 mt-1">
                  R$ {totaisEntradas.icmsCreditado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <span className="text-[10px] text-neutral-500 font-mono">Direito a crédito fiscal</span>
              </div>
              <div className="p-3 bg-[#181818] border border-white/10 rounded-xl">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold">Isentas / Outras</span>
                <p className="text-xl font-bold font-mono text-neutral-300 mt-1">
                  R$ {(totaisEntradas.isentas + totaisEntradas.outras).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <span className="text-[10px] text-neutral-500 font-mono">Sem crédito / ST</span>
              </div>
            </div>

            {/* Tabela do Livro Registro de Entradas */}
            <div className="bg-[#181818] border border-white/10 rounded-xl overflow-hidden shadow-lg">
              <div className="p-3 bg-neutral-900 border-b border-white/10 flex items-center justify-between text-xs font-semibold text-neutral-300">
                <span>LIVRO REGISTRO DE ENTRADAS - MODELO 1 / 1-A ( SISTEMAS)</span>
                <span className="font-mono text-neutral-500">RICMS Art. 214 • SPED Fiscal C100</span>
              </div>
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-neutral-900/60 border-b border-white/10 text-neutral-400 font-medium">
                  <tr>
                    <th className="py-2.5 px-3 w-20">Entrada</th>
                    <th className="py-2.5 px-3 w-24">Doc. Fiscal</th>
                    <th className="py-2.5 px-3">Emitente / Fornecedor</th>
                    <th className="py-2.5 px-3 w-16 text-center">CFOP</th>
                    <th className="py-2.5 px-3 w-28 text-right">Valor Contábil</th>
                    <th className="py-2.5 px-3 w-24 text-right">Base ICMS</th>
                    <th className="py-2.5 px-3 w-16 text-center">Alíq %</th>
                    <th className="py-2.5 px-3 w-24 text-right">ICMS Cred.</th>
                    <th className="py-2.5 px-3 w-24 text-right">Isentas/Outras</th>
                    <th className="py-2.5 px-3 w-40">Observações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {linhasEntradas.map((l) => (
                    <tr key={l.id} className="hover:bg-white/[0.02]">
                      <td className="py-2 px-3 font-mono text-neutral-400">
                        {new Date(l.dataEntrada + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-2 px-3 font-mono">
                        <span className="font-semibold text-neutral-200">NF {l.numero}</span>
                        <span className="text-[10px] text-neutral-500 block">Série {l.serie}</span>
                      </td>
                      <td className="py-2 px-3">
                        <span className="font-medium text-neutral-200 block truncate max-w-xs">{l.emitenteNome}</span>
                        <span className="text-[10px] font-mono text-neutral-500">{l.emitenteCnpjCpf} • {l.emitenteUf}</span>
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-semibold text-neutral-300">{l.cfop}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-neutral-100">
                        {l.valorContabil.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-blue-400">
                        {l.baseCalculoICMS > 0 ? l.baseCalculoICMS.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}
                      </td>
                      <td className="py-2 px-3 text-center font-mono text-neutral-400">
                        {l.aliquotaICMS > 0 ? `${l.aliquotaICMS}%` : '-'}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-emerald-400">
                        {l.impostoCreditadoICMS > 0 ? l.impostoCreditadoICMS.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-neutral-400">
                        {(l.isentasNaoTributadasICMS + l.outrasICMS) > 0 ? (l.isentasNaoTributadasICMS + l.outrasICMS).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}
                      </td>
                      <td className="py-2 px-3 text-[11px] text-neutral-500 truncate max-w-xs">{l.observacoes}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-neutral-900 border-t-2 border-white/20 font-mono text-xs font-bold">
                  <tr>
                    <td colSpan={4} className="py-2.5 px-3 text-right uppercase text-neutral-400">TOTAIS DE ENTRADAS:</td>
                    <td className="py-2.5 px-3 text-right text-neutral-100">
                      R$ {totaisEntradas.contabil.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right text-blue-400">
                      R$ {totaisEntradas.baseICMS.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td></td>
                    <td className="py-2.5 px-3 text-right text-emerald-400">
                      R$ {totaisEntradas.icmsCreditado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right text-neutral-400">
                      R$ {(totaisEntradas.isentas + totaisEntradas.outras).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Resumo por CFOP Entradas */}
            <div className="p-4 bg-[#181818] border border-white/10 rounded-xl space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                Resumo Analítico das Entradas por CFOP (Código Fiscal de Operações)
              </h4>
              <div className="grid grid-cols-4 gap-3 pt-1">
                {resumoCFOPEntradas.map(item => (
                  <div key={item.cfop} className="p-2.5 bg-neutral-900 rounded-lg border border-white/5 font-mono text-xs">
                    <div className="flex justify-between text-neutral-400 text-[11px]">
                      <span className="font-bold text-neutral-200">CFOP {item.cfop}</span>
                      <span>{item.count} doc(s)</span>
                    </div>
                    <div className="mt-1 flex justify-between font-semibold">
                      <span className="text-neutral-400">Total:</span>
                      <span className="text-neutral-100">R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-emerald-500">ICMS Cred:</span>
                      <span className="text-emerald-400">R$ {item.icms.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ABA 4: REGISTRO DE SAÍDAS (MOD. 2 / 2-A) */}
        {tipoLivro === 'SAIDAS' && (
          <div className="space-y-4">
            {/* KPI Cards Saídas */}
            <div className="grid grid-cols-5 gap-3">
              <div className="p-3 bg-[#181818] border border-white/10 rounded-xl">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold">Total de Documentos</span>
                <p className="text-xl font-bold font-mono text-neutral-100 mt-1">{linhasSaidas.length} NFs</p>
                <span className="text-[10px] text-neutral-500 font-mono">Saídas no período</span>
              </div>
              <div className="p-3 bg-[#181818] border border-white/10 rounded-xl">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold">Faturamento Bruto</span>
                <p className="text-xl font-bold font-mono text-neutral-100 mt-1">
                  R$ {totaisSaidas.contabil.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <span className="text-[10px] text-neutral-500 font-mono">Total faturado</span>
              </div>
              <div className="p-3 bg-[#181818] border border-white/10 rounded-xl">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold">Base de Cálculo ICMS</span>
                <p className="text-xl font-bold font-mono text-blue-400 mt-1">
                  R$ {totaisSaidas.baseICMS.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <span className="text-[10px] text-neutral-500 font-mono">Tributação normal</span>
              </div>
              <div className="p-3 bg-[#181818] border border-white/10 rounded-xl">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold">ICMS Debitado</span>
                <p className="text-xl font-bold font-mono text-rose-400 mt-1">
                  R$ {totaisSaidas.icmsDebitado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <span className="text-[10px] text-neutral-500 font-mono">Débito fiscal apurado</span>
              </div>
              <div className="p-3 bg-[#181818] border border-white/10 rounded-xl">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold">Isentas / ST / Outras</span>
                <p className="text-xl font-bold font-mono text-neutral-300 mt-1">
                  R$ {(totaisSaidas.isentas + totaisSaidas.outras).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <span className="text-[10px] text-neutral-500 font-mono">ST e Não Tributadas</span>
              </div>
            </div>

            {/* Tabela do Livro Registro de Saídas */}
            <div className="bg-[#181818] border border-white/10 rounded-xl overflow-hidden shadow-lg">
              <div className="p-3 bg-neutral-900 border-b border-white/10 flex items-center justify-between text-xs font-semibold text-neutral-300">
                <span>LIVRO REGISTRO DE SAÍDAS - MODELO 2 / 2-A ( SISTEMAS)</span>
                <span className="font-mono text-neutral-500">RICMS Art. 215 • SPED Fiscal C100</span>
              </div>
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-neutral-900/60 border-b border-white/10 text-neutral-400 font-medium">
                  <tr>
                    <th className="py-2.5 px-3 w-20">Emissão</th>
                    <th className="py-2.5 px-3 w-24">Doc. Fiscal</th>
                    <th className="py-2.5 px-3">Destinatário / Cliente</th>
                    <th className="py-2.5 px-3 w-16 text-center">CFOP</th>
                    <th className="py-2.5 px-3 w-28 text-right">Valor Contábil</th>
                    <th className="py-2.5 px-3 w-24 text-right">Base ICMS</th>
                    <th className="py-2.5 px-3 w-16 text-center">Alíq %</th>
                    <th className="py-2.5 px-3 w-24 text-right">ICMS Deb.</th>
                    <th className="py-2.5 px-3 w-24 text-right">Isentas/ST</th>
                    <th className="py-2.5 px-3 w-40">Observações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {linhasSaidas.map((l) => (
                    <tr key={l.id} className="hover:bg-white/[0.02]">
                      <td className="py-2 px-3 font-mono text-neutral-400">
                        {new Date(l.dataEmissao + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-2 px-3 font-mono">
                        <span className="font-semibold text-neutral-200">NF {l.numero}</span>
                        <span className="text-[10px] text-neutral-500 block">Série {l.serie}</span>
                      </td>
                      <td className="py-2 px-3">
                        <span className="font-medium text-neutral-200 block truncate max-w-xs">{l.destinatarioNome}</span>
                        <span className="text-[10px] font-mono text-neutral-500">{l.destinatarioCnpjCpf} • {l.destinatarioUf}</span>
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-semibold text-neutral-300">{l.cfop}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-neutral-100">
                        {l.valorContabil.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-blue-400">
                        {l.baseCalculoICMS > 0 ? l.baseCalculoICMS.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}
                      </td>
                      <td className="py-2 px-3 text-center font-mono text-neutral-400">
                        {l.aliquotaICMS > 0 ? `${l.aliquotaICMS}%` : '-'}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-rose-400">
                        {l.impostoDebitadoICMS > 0 ? l.impostoDebitadoICMS.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-neutral-400">
                        {(l.isentasNaoTributadasICMS + l.outrasICMS) > 0 ? (l.isentasNaoTributadasICMS + l.outrasICMS).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}
                      </td>
                      <td className="py-2 px-3 text-[11px] text-neutral-500 truncate max-w-xs">{l.observacoes}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-neutral-900 border-t-2 border-white/20 font-mono text-xs font-bold">
                  <tr>
                    <td colSpan={4} className="py-2.5 px-3 text-right uppercase text-neutral-400">TOTAIS DE SAÍDAS:</td>
                    <td className="py-2.5 px-3 text-right text-neutral-100">
                      R$ {totaisSaidas.contabil.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right text-blue-400">
                      R$ {totaisSaidas.baseICMS.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td></td>
                    <td className="py-2.5 px-3 text-right text-rose-400">
                      R$ {totaisSaidas.icmsDebitado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right text-neutral-400">
                      R$ {(totaisSaidas.isentas + totaisSaidas.outras).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Resumo por CFOP Saídas */}
            <div className="p-4 bg-[#181818] border border-white/10 rounded-xl space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                Resumo Analítico das Saídas por CFOP
              </h4>
              <div className="grid grid-cols-4 gap-3 pt-1">
                {resumoCFOPSaidas.map(item => (
                  <div key={item.cfop} className="p-2.5 bg-neutral-900 rounded-lg border border-white/5 font-mono text-xs">
                    <div className="flex justify-between text-neutral-400 text-[11px]">
                      <span className="font-bold text-neutral-200">CFOP {item.cfop}</span>
                      <span>{item.count} doc(s)</span>
                    </div>
                    <div className="mt-1 flex justify-between font-semibold">
                      <span className="text-neutral-400">Total:</span>
                      <span className="text-neutral-100">R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-rose-400">ICMS Deb:</span>
                      <span className="text-rose-400">R$ {item.icms.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ABA 5: APURAÇÃO DO ICMS E ISS (MOD. 9) */}
        {tipoLivro === 'APURACAO_ICMS_ISS' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* QUADRO 1: DÉBITO DO IMPOSTO */}
              <div className="p-4 bg-[#181818] border border-white/10 rounded-xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-rose-400 flex items-center space-x-2">
                    <TrendingDown className="w-4 h-4" />
                    <span>Quadro I - Débito do Imposto (ICMS)</span>
                  </h3>
                  <span className="text-[10px] font-mono text-neutral-400">Saídas e Devedores</span>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-neutral-300">001 - Pelas saídas com débito do imposto:</span>
                    <span className="font-semibold text-rose-400">
                      R$ {apuracaoLivro.totalDebitoPorSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-neutral-400">002 - Outros débitos:</span>
                    <span className="text-neutral-500">R$ 0,00</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-neutral-400">003 - Estornos de créditos:</span>
                    <span className="text-neutral-500">R$ 0,00</span>
                  </div>
                  <div className="flex justify-between pt-2 text-sm font-bold bg-neutral-900/60 p-2 rounded-lg border border-rose-500/20">
                    <span className="text-neutral-200">TOTAL DOS DÉBITOS:</span>
                    <span className="text-rose-400">
                      R$ {apuracaoLivro.totalDebitos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* QUADRO 2: CRÉDITO DO IMPOSTO */}
              <div className="p-4 bg-[#181818] border border-white/10 rounded-xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-400 flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>Quadro II - Crédito do Imposto (ICMS)</span>
                  </h3>
                  <span className="text-[10px] font-mono text-neutral-400">Entradas e Créditos</span>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-neutral-300">004 - Pelas entradas com crédito do imposto:</span>
                    <span className="font-semibold text-emerald-400">
                      R$ {apuracaoLivro.totalCreditoPorEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-neutral-400">005 - Outros créditos:</span>
                    <span className="text-neutral-500">R$ 0,00</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-neutral-400">006 - Estornos de débitos:</span>
                    <span className="text-neutral-500">R$ 0,00</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-neutral-400">007 - Saldo credor do período anterior:</span>
                    <span className="text-neutral-500">R$ 0,00</span>
                  </div>
                  <div className="flex justify-between pt-2 text-sm font-bold bg-neutral-900/60 p-2 rounded-lg border border-emerald-500/20">
                    <span className="text-neutral-200">TOTAL DOS CRÉDITOS:</span>
                    <span className="text-emerald-400">
                      R$ {apuracaoLivro.totalCreditos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* QUADRO 3: FIXAÇÃO DO SALDO & QUADRO 4: ISSQN */}
            <div className="grid grid-cols-2 gap-4">
              {/* QUADRO 3: FIXAÇÃO DO SALDO */}
              <div className="p-4 bg-[#181818] border border-white/10 rounded-xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-amber-400">
                    Quadro III - Fixação do Saldo do ICMS
                  </h3>
                  <span className="text-[10px] font-mono text-neutral-400">Resultado da Apuração</span>
                </div>
                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 bg-neutral-900 rounded-lg border border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-neutral-400 block text-[11px]">SALDO DEVEDOR APURADO A RECOLHER</span>
                      <span className="text-xs text-neutral-500">Guia DAE / GARE Cód. 046-2</span>
                    </div>
                    <span className="text-lg font-bold text-rose-400">
                      R$ {apuracaoLivro.saldoDevedorApurado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="p-3 bg-neutral-900 rounded-lg border border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-neutral-400 block text-[11px]">SALDO CREDOR A TRANSPORTAR</span>
                      <span className="text-xs text-neutral-500">Para o período seguinte</span>
                    </div>
                    <span className="text-lg font-bold text-emerald-400">
                      R$ {apuracaoLivro.saldoCredorATransportar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* QUADRO 4: APURAÇÃO DO ISSQN */}
              <div className="p-4 bg-[#181818] border border-white/10 rounded-xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-cyan-400">
                    Quadro IV - Apuração do ISSQN Municipal (LC 116/03)
                  </h3>
                  <span className="text-[10px] font-mono text-neutral-400">Prefeitura de São Paulo</span>
                </div>
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-neutral-300">Receita Bruta de Serviços Prestados:</span>
                    <span className="font-semibold text-neutral-100">
                      R$ {apuracaoLivro.receitaServicos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-neutral-400">Alíquota de ISS Municipal:</span>
                    <span className="text-neutral-300">5,00%</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-neutral-300">ISS Próprio Devido:</span>
                    <span className="font-semibold text-cyan-400">
                      R$ {apuracaoLivro.issProprioDevido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-neutral-400">(-) ISS Retido na Fonte:</span>
                    <span className="text-neutral-400">
                      (R$ {apuracaoLivro.issRetidoFonte.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 font-bold text-sm bg-neutral-900/60 p-2 rounded-lg border border-cyan-500/20">
                    <span className="text-neutral-200">ISS LÍQUIDO A RECOLHER:</span>
                    <span className="text-cyan-400">
                      R$ {apuracaoLivro.issLiquidoARecolher.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 6: TERMOS OFICIAIS */}
        {tipoLivro === 'TERMOS' && (
          <div className="space-y-4">
            <div className="p-3 bg-[#181818] border border-white/10 rounded-xl flex items-center justify-between">
              <span className="text-xs text-neutral-300 font-medium">Selecione o Livro para Emissão dos Termos:</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setTermoAlvo('DIARIO')}
                  className={`px-3 py-1 rounded text-xs font-semibold ${termoAlvo === 'DIARIO' ? 'bg-blue-600 text-white' : 'bg-neutral-900 text-neutral-400 hover:text-white'}`}
                >
                  Livro Diário
                </button>
                <button
                  onClick={() => setTermoAlvo('RAZAO')}
                  className={`px-3 py-1 rounded text-xs font-semibold ${termoAlvo === 'RAZAO' ? 'bg-blue-600 text-white' : 'bg-neutral-900 text-neutral-400 hover:text-white'}`}
                >
                  Livro Razão
                </button>
                <button
                  onClick={() => setTermoAlvo('ENTRADAS')}
                  className={`px-3 py-1 rounded text-xs font-semibold ${termoAlvo === 'ENTRADAS' ? 'bg-blue-600 text-white' : 'bg-neutral-900 text-neutral-400 hover:text-white'}`}
                >
                  Reg. Entradas (Mod. 1)
                </button>
                <button
                  onClick={() => setTermoAlvo('SAIDAS')}
                  className={`px-3 py-1 rounded text-xs font-semibold ${termoAlvo === 'SAIDAS' ? 'bg-blue-600 text-white' : 'bg-neutral-900 text-neutral-400 hover:text-white'}`}
                >
                  Reg. Saídas (Mod. 2)
                </button>
                <button
                  onClick={() => setTermoAlvo('APURACAO')}
                  className={`px-3 py-1 rounded text-xs font-semibold ${termoAlvo === 'APURACAO' ? 'bg-blue-600 text-white' : 'bg-neutral-900 text-neutral-400 hover:text-white'}`}
                >
                  Apuração ICMS (Mod. 9)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Termo de Abertura */}
              <div className="bg-[#181818] border border-white/10 rounded-xl p-6 shadow-lg">
                <h3 className="font-bold text-center text-sm mb-4 uppercase tracking-wider text-neutral-100 border-b border-white/10 pb-3">
                  TERMO DE ABERTURA - LIVRO {termoAlvo}
                </h3>
                <div className="text-xs text-neutral-300 leading-relaxed text-justify space-y-3 font-serif">
                  <p>
                    Contém este livro o número <strong>001 (um)</strong>, destinado à escrituração do <strong>LIVRO {termoAlvo === 'DIARIO' ? 'DIÁRIO GERAL' : termoAlvo === 'RAZAO' ? 'RAZÃO ANALÍTICO' : termoAlvo === 'ENTRADAS' ? 'REGISTRO DE ENTRADAS (MOD. 1)' : termoAlvo === 'SAIDAS' ? 'REGISTRO DE SAÍDAS (MOD. 2)' : 'REGISTRO DE APURAÇÃO DO ICMS (MOD. 9)'}</strong> da sociedade empresária <strong>{empresa.razaoSocial}</strong>, inscrita no CNPJ/MF sob o nº <strong>{empresa.cnpj}</strong>, Inscrição Estadual nº <strong>{empresa.inscricaoEstadual || 'ISENTO'}</strong>, com sede e foro na comarca de {(empresa.cidade || 'São Paulo')} - {empresa.uf}.
                  </p>
                  <p>
                    O presente livro compõe-se de folhas numeradas tipograficamente em ordem sequencial, que servirão para o registro autêntico e fidedigno de suas operações no exercício social de <strong>{empresa.exercicioAtivo}</strong>, atendendo a todos os preceitos do Código Civil Brasileiro (Lei nº 10.406/2002, Art. 1.180) e Normas Brasileiras de Contabilidade.
                  </p>
                  <div className="pt-8 text-center space-y-6">
                    <div>
                      <div className="w-64 border-t border-neutral-400 mx-auto" />
                      <strong className="block text-neutral-100">{empresa.responsavelLegal}</strong>
                      <div className="text-[11px] text-neutral-400">Responsável Legal - CPF: {empresa.cpfResponsavel}</div>
                    </div>
                    <div>
                      <div className="w-64 border-t border-neutral-400 mx-auto" />
                      <strong className="block text-neutral-100">{empresa.contadorNome}</strong>
                      <div className="text-[11px] text-neutral-400">Contador Responsável - CRC: {empresa.contadorCRC}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Termo de Encerramento */}
              <div className="bg-[#181818] border border-white/10 rounded-xl p-6 shadow-lg">
                <h3 className="font-bold text-center text-sm mb-4 uppercase tracking-wider text-neutral-100 border-b border-white/10 pb-3">
                  TERMO DE ENCERRAMENTO - LIVRO {termoAlvo}
                </h3>
                <div className="text-xs text-neutral-300 leading-relaxed text-justify space-y-3 font-serif">
                  <p>
                    Aos trinta e um dias do mês de dezembro do ano de <strong>{empresa.exercicioAtivo}</strong>, encerra-se o presente livro, número <strong>001 (um)</strong>, pertencente à sociedade empresária <strong>{empresa.razaoSocial}</strong>, CNPJ/MF nº <strong>{empresa.cnpj}</strong>.
                  </p>
                  <p>
                    Declaramos sob as penas da lei que todas as transações, débitos, créditos e obrigações foram escriturados com exatidão matemática, observando estritamente a legislação tributária, societária e o Regulamento do ICMS vigente.
                  </p>
                  <div className="pt-8 text-center space-y-6">
                    <div>
                      <div className="w-64 border-t border-neutral-400 mx-auto" />
                      <strong className="block text-neutral-100">{empresa.responsavelLegal}</strong>
                      <div className="text-[11px] text-neutral-400">Responsável Legal - CPF: {empresa.cpfResponsavel}</div>
                    </div>
                    <div>
                      <div className="w-64 border-t border-neutral-400 mx-auto" />
                      <strong className="block text-neutral-100">{empresa.contadorNome}</strong>
                      <div className="text-[11px] text-neutral-400">Contador Responsável - CRC: {empresa.contadorCRC}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. MODAL PRINT PREVIEW A4 PAGINADO OFICIAL INTEGRADA */}
      <ReportPrintPreviewModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        empresa={empresa}
        tituloRelatorio={printTitulo}
        subtitulo={printSubtitulo}
        periodo={`${dataInicial} a ${dataFinal}`}
        orientacaoPadrao={orientacaoRelatorio}
        numeroLivro={1}
      >
        {tipoLivro === 'DIARIO' && (
          <div className="space-y-4">
            <table className="w-full text-left text-[10px] border-collapse">
              <thead>
                <tr className="border-b-2 border-neutral-900 font-bold uppercase text-[9px]">
                  <th className="py-1 px-2 text-center w-12">Partida</th>
                  <th className="py-1 px-2 w-20">Data</th>
                  <th className="py-1 px-2">Partidas Dobradas / Histórico Contábil</th>
                  <th className="py-1 px-2 text-right w-28">Débito (R$)</th>
                  <th className="py-1 px-2 text-right w-28">Crédito (R$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {lancamentosOrdenados.map((l) => {
                  const deb = contas.find(c => c.id === l.contaDebitoId);
                  const cred = contas.find(c => c.id === l.contaCreditoId);
                  return (
                    <React.Fragment key={l.id}>
                      <tr>
                        <td className="py-1 px-2 text-center font-mono font-bold" rowSpan={2}>#{l.numeroPartida}</td>
                        <td className="py-1 px-2 font-mono" rowSpan={2}>{new Date(l.dataLancamento + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                        <td className="py-0.5 px-2 font-bold text-neutral-900">
                          D - {deb?.nome} ({deb?.classificacao})
                        </td>
                        <td className="py-0.5 px-2 text-right font-mono font-bold">{l.valor.toFixed(2)}</td>
                        <td className="py-0.5 px-2 text-right font-mono text-neutral-400">-</td>
                      </tr>
                      <tr className="border-b border-neutral-300">
                        <td className="py-0.5 px-2 pl-4 text-neutral-700">
                          C - {cred?.nome} ({cred?.classificacao})
                          <div className="text-[9px] text-neutral-500 italic mt-0.5">Hist: {l.complementoHistorico}</div>
                        </td>
                        <td className="py-0.5 px-2 text-right font-mono text-neutral-400">-</td>
                        <td className="py-0.5 px-2 text-right font-mono font-bold">{l.valor.toFixed(2)}</td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-neutral-900 font-bold font-mono text-[10px]">
                  <td colSpan={3} className="py-2 px-2 text-right uppercase">TOTAIS DO LIVRO DIÁRIO:</td>
                  <td className="py-2 px-2 text-right">R$ {totalDebitosDiario.toFixed(2)}</td>
                  <td className="py-2 px-2 text-right">R$ {totalCreditosDiario.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {tipoLivro === 'RAZAO' && (
          <div className="space-y-4">
            <table className="w-full text-left text-[10px] border-collapse">
              <thead>
                <tr className="border-b-2 border-neutral-900 font-bold uppercase text-[9px]">
                  <th className="py-1 px-2 w-20">Data</th>
                  <th className="py-1 px-2 w-12 text-center">Partida</th>
                  <th className="py-1 px-2 w-48">Contrapartida</th>
                  <th className="py-1 px-2">Histórico</th>
                  <th className="py-1 px-2 text-right w-28">Débito (R$)</th>
                  <th className="py-1 px-2 text-right w-28">Crédito (R$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {lancamentosRazao.map(l => {
                  const isDeb = l.contaDebitoId === selectedContaId;
                  const contra = contas.find(c => c.id === (isDeb ? l.contaCreditoId : l.contaDebitoId));
                  return (
                    <tr key={l.id}>
                      <td className="py-1 px-2 font-mono">{new Date(l.dataLancamento + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                      <td className="py-1 px-2 text-center font-mono">#{l.numeroPartida}</td>
                      <td className="py-1 px-2">{contra?.nome || 'Diversos'}</td>
                      <td className="py-1 px-2">{l.complementoHistorico}</td>
                      <td className="py-1 px-2 text-right font-mono">{isDeb ? l.valor.toFixed(2) : '-'}</td>
                      <td className="py-1 px-2 text-right font-mono">{!isDeb ? l.valor.toFixed(2) : '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-neutral-900 font-bold font-mono text-[10px]">
                  <td colSpan={4} className="py-2 px-2 text-right uppercase">TOTAIS DO RAZÃO:</td>
                  <td className="py-2 px-2 text-right">R$ {totaisRazao.totalD.toFixed(2)}</td>
                  <td className="py-2 px-2 text-right">R$ {totaisRazao.totalC.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {tipoLivro === 'ENTRADAS' && (
          <div className="space-y-4">
            <table className="w-full text-left text-[9px] border-collapse">
              <thead>
                <tr className="border-b-2 border-neutral-900 font-bold uppercase">
                  <th className="py-1 px-1">Entrada</th>
                  <th className="py-1 px-1">NF-e</th>
                  <th className="py-1 px-1">Emitente / Fornecedor</th>
                  <th className="py-1 px-1">CNPJ</th>
                  <th className="py-1 px-1 text-center">UF</th>
                  <th className="py-1 px-1 text-center">CFOP</th>
                  <th className="py-1 px-2 text-right">Valor Contábil</th>
                  <th className="py-1 px-2 text-right">Base ICMS</th>
                  <th className="py-1 px-1 text-center">Alíq %</th>
                  <th className="py-1 px-2 text-right">ICMS Cred.</th>
                  <th className="py-1 px-2 text-right">Isentas/Outras</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 font-sans">
                {linhasEntradas.map(l => (
                  <tr key={l.id}>
                    <td className="py-1 px-1 font-mono">{new Date(l.dataEntrada + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                    <td className="py-1 px-1 font-mono font-bold">{l.numero}</td>
                    <td className="py-1 px-1 truncate max-w-xs">{l.emitenteNome}</td>
                    <td className="py-1 px-1 font-mono text-[8px]">{l.emitenteCnpjCpf}</td>
                    <td className="py-1 px-1 text-center">{l.emitenteUf}</td>
                    <td className="py-1 px-1 text-center font-mono font-bold">{l.cfop}</td>
                    <td className="py-1 px-2 text-right font-mono font-bold">{l.valorContabil.toFixed(2)}</td>
                    <td className="py-1 px-2 text-right font-mono">{l.baseCalculoICMS.toFixed(2)}</td>
                    <td className="py-1 px-1 text-center font-mono">{l.aliquotaICMS}%</td>
                    <td className="py-1 px-2 text-right font-mono font-bold text-emerald-700">{l.impostoCreditadoICMS.toFixed(2)}</td>
                    <td className="py-1 px-2 text-right font-mono">{(l.isentasNaoTributadasICMS + l.outrasICMS).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-neutral-900 font-bold font-mono text-[9px]">
                  <td colSpan={6} className="py-1.5 px-1 text-right uppercase">TOTAIS DE ENTRADA:</td>
                  <td className="py-1.5 px-2 text-right">R$ {totaisEntradas.contabil.toFixed(2)}</td>
                  <td className="py-1.5 px-2 text-right">R$ {totaisEntradas.baseICMS.toFixed(2)}</td>
                  <td></td>
                  <td className="py-1.5 px-2 text-right text-emerald-800">R$ {totaisEntradas.icmsCreditado.toFixed(2)}</td>
                  <td className="py-1.5 px-2 text-right">R$ {(totaisEntradas.isentas + totaisEntradas.outras).toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {tipoLivro === 'SAIDAS' && (
          <div className="space-y-4">
            <table className="w-full text-left text-[9px] border-collapse">
              <thead>
                <tr className="border-b-2 border-neutral-900 font-bold uppercase">
                  <th className="py-1 px-1">Emissão</th>
                  <th className="py-1 px-1">NF-e</th>
                  <th className="py-1 px-1">Destinatário / Cliente</th>
                  <th className="py-1 px-1">CNPJ</th>
                  <th className="py-1 px-1 text-center">UF</th>
                  <th className="py-1 px-1 text-center">CFOP</th>
                  <th className="py-1 px-2 text-right">Valor Contábil</th>
                  <th className="py-1 px-2 text-right">Base ICMS</th>
                  <th className="py-1 px-1 text-center">Alíq %</th>
                  <th className="py-1 px-2 text-right">ICMS Deb.</th>
                  <th className="py-1 px-2 text-right">Isentas/ST</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 font-sans">
                {linhasSaidas.map(l => (
                  <tr key={l.id}>
                    <td className="py-1 px-1 font-mono">{new Date(l.dataEmissao + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                    <td className="py-1 px-1 font-mono font-bold">{l.numero}</td>
                    <td className="py-1 px-1 truncate max-w-xs">{l.destinatarioNome}</td>
                    <td className="py-1 px-1 font-mono text-[8px]">{l.destinatarioCnpjCpf}</td>
                    <td className="py-1 px-1 text-center">{l.destinatarioUf}</td>
                    <td className="py-1 px-1 text-center font-mono font-bold">{l.cfop}</td>
                    <td className="py-1 px-2 text-right font-mono font-bold">{l.valorContabil.toFixed(2)}</td>
                    <td className="py-1 px-2 text-right font-mono">{l.baseCalculoICMS.toFixed(2)}</td>
                    <td className="py-1 px-1 text-center font-mono">{l.aliquotaICMS}%</td>
                    <td className="py-1 px-2 text-right font-mono font-bold text-rose-700">{l.impostoDebitadoICMS.toFixed(2)}</td>
                    <td className="py-1 px-2 text-right font-mono">{(l.isentasNaoTributadasICMS + l.outrasICMS).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-neutral-900 font-bold font-mono text-[9px]">
                  <td colSpan={6} className="py-1.5 px-1 text-right uppercase">TOTAIS DE SAÍDAS:</td>
                  <td className="py-1.5 px-2 text-right">R$ {totaisSaidas.contabil.toFixed(2)}</td>
                  <td className="py-1.5 px-2 text-right">R$ {totaisSaidas.baseICMS.toFixed(2)}</td>
                  <td></td>
                  <td className="py-1.5 px-2 text-right text-rose-800">R$ {totaisSaidas.icmsDebitado.toFixed(2)}</td>
                  <td className="py-1.5 px-2 text-right">R$ {(totaisSaidas.isentas + totaisSaidas.outras).toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {tipoLivro === 'APURACAO_ICMS_ISS' && (
          <div className="space-y-4 text-[10px]">
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-neutral-300 p-2 rounded">
                <h4 className="font-bold border-b border-neutral-900 pb-1 mb-2 uppercase text-[9px]">QUADRO I - DÉBITO DO IMPOSTO</h4>
                <div className="flex justify-between py-0.5"><span>001 - Saídas com débito:</span><span className="font-mono font-bold">R$ {apuracaoLivro.totalDebitoPorSaidas.toFixed(2)}</span></div>
                <div className="flex justify-between py-0.5"><span>002 - Outros débitos:</span><span className="font-mono">R$ 0,00</span></div>
                <div className="flex justify-between py-0.5 border-t border-neutral-400 font-bold"><span>TOTAL DOS DÉBITOS:</span><span className="font-mono">R$ {apuracaoLivro.totalDebitos.toFixed(2)}</span></div>
              </div>
              <div className="border border-neutral-300 p-2 rounded">
                <h4 className="font-bold border-b border-neutral-900 pb-1 mb-2 uppercase text-[9px]">QUADRO II - CRÉDITO DO IMPOSTO</h4>
                <div className="flex justify-between py-0.5"><span>004 - Entradas com crédito:</span><span className="font-mono font-bold">R$ {apuracaoLivro.totalCreditoPorEntradas.toFixed(2)}</span></div>
                <div className="flex justify-between py-0.5"><span>007 - Saldo anterior:</span><span className="font-mono">R$ 0,00</span></div>
                <div className="flex justify-between py-0.5 border-t border-neutral-400 font-bold"><span>TOTAL DOS CRÉDITOS:</span><span className="font-mono">R$ {apuracaoLivro.totalCreditos.toFixed(2)}</span></div>
              </div>
            </div>
            <div className="border border-neutral-300 p-2 rounded">
              <h4 className="font-bold border-b border-neutral-900 pb-1 mb-2 uppercase text-[9px]">QUADRO III - FIXAÇÃO DO SALDO</h4>
              <div className="flex justify-between py-0.5 font-bold"><span>SALDO DEVEDOR APURADO A RECOLHER:</span><span className="font-mono text-neutral-900">R$ {apuracaoLivro.saldoDevedorApurado.toFixed(2)}</span></div>
              <div className="flex justify-between py-0.5"><span>SALDO CREDOR A TRANSPORTAR:</span><span className="font-mono">R$ {apuracaoLivro.saldoCredorATransportar.toFixed(2)}</span></div>
            </div>
          </div>
        )}

        {tipoLivro === 'TERMOS' && (
          <div className="p-8 text-neutral-800 space-y-6 text-xs leading-relaxed font-serif">
            <h3 className="font-bold text-center text-sm uppercase tracking-widest border-b-2 border-neutral-900 pb-2">
              TERMO DE ABERTURA - LIVRO {termoAlvo} Nº 001
            </h3>
            <p className="text-justify">
              Contém este livro o número 001 (um), destinado à escrituração das operações da sociedade empresária <strong>{empresa.razaoSocial}</strong>, inscrita no CNPJ sob o nº <strong>{empresa.cnpj}</strong>, NIRE nº 35.200.123.456, Inscrição Estadual nº {empresa.inscricaoEstadual || 'ISENTO'}, com sede no município de {(empresa.cidade || 'São Paulo')} - {empresa.uf}.
            </p>
            <p className="text-justify">
              O presente livro compõe-se de folhas tipograficamente numeradas que servirão para o registro das operações contábeis e fiscais do exercício de {empresa.exercicioAtivo}, nos termos do Artigo 1.180 da Lei Federal nº 10.406/2002.
            </p>
            <div className="pt-16 grid grid-cols-2 gap-8 text-center text-[10px]">
              <div>
                <div className="border-t border-neutral-600 w-48 mx-auto mb-1" />
                <strong>{empresa.responsavelLegal}</strong>
                <div>Responsável Legal - CPF: {empresa.cpfResponsavel}</div>
              </div>
              <div>
                <div className="border-t border-neutral-600 w-48 mx-auto mb-1" />
                <strong>{empresa.contadorNome}</strong>
                <div>Contador Responsável - CRC: {empresa.contadorCRC}</div>
              </div>
            </div>
          </div>
        )}
      </ReportPrintPreviewModal>
    </div>
  );
};
