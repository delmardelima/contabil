import React, { useState } from 'react';
import { ContaContabil, LancamentoContabil } from '../../types/contabil';
import { AccountingEngine } from '../../engine/accountingEngine';
import { exportToCSV } from '../../utils/exportUtils';
import {
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Download,
  Calendar,
  BarChart3,
  Sliders,
  Plus,
  X,
  EyeOff,
  ListChecks
} from 'lucide-react';

interface BalanceteModuleProps {
  contas: ContaContabil[];
  lancamentos: LancamentoContabil[];
  onOpenRazaoConta?: (contaId: number) => void;
}

const DEFAULT_RESUMO_10_CONTAS = [
  '1.01.01.001.0001', // Caixa Geral Matriz
  '1.01.01.002.0001', // Bancos Conta Movimento
  '1.01.02.001.0001', // Clientes / Duplicatas a Receber
  '1.01.03.001.0001', // Estoque de Mercadorias
  '2.01.01.001.0001', // Fornecedores Nacionais
  '2.01.02.001.0001', // Salários e Pró-Labore a Pagar
  '2.01.03.001.0001', // Simples Nacional (DAS) / Tributos a Recolher
  '2.03',             // Patrimônio Líquido
  '3.01',             // Receita Operacional Bruta
  '4'                 // Custos e Despesas Operacionais
];

export const BalanceteModule: React.FC<BalanceteModuleProps> = ({
  contas,
  lancamentos,
  onOpenRazaoConta
}) => {
  const [modoVisualizacao, setModoVisualizacao] = useState<'MENSAL' | 'EVOLUCAO_12_MESES'>('MENSAL');
  const [grauMax, setGrauMax] = useState<number>(5);
  const [apenasComMovimento, setApenasComMovimento] = useState<boolean>(false);
  const [desconsiderarZeramento, setDesconsiderarZeramento] = useState<boolean>(false);
  const [anoReferencia, setAnoReferencia] = useState<number>(2026);

  // Opções extraídas de Balancete_Contabilidade.htm e Op__es_Contabilidade.htm (contabil.exe)
  const [imprimirPlanoModo, setImprimirPlanoModo] = useState<'TOTAL' | 'PARCIAL'>('TOTAL');
  const [grupoParcialPrefix, setGrupoParcialPrefix] = useState<string>('1');
  const [destacarSinteticas, setDestacarSinteticas] = useState<boolean>(true);
  const [emitirResumoFinal, setEmitirResumoFinal] = useState<boolean>(true);
  const [exibirResumo10Contas, setExibirResumo10Contas] = useState<boolean>(true);
  const [showConfigResumoModal, setShowConfigResumoModal] = useState<boolean>(false);

  // Guia Resumo do Balancete (No máximo 10 contas - Op__es_Contabilidade.htm)
  const [resumo10Classificacoes, setResumo10Classificacoes] = useState<string[]>(() => {
    const validas = DEFAULT_RESUMO_10_CONTAS.filter(cls => contas.some(c => c.classificacao === cls));
    if (validas.length > 0) return validas.slice(0, 10);
    return contas.slice(0, 10).map(c => c.classificacao);
  });
  const [novaContaResumoCls, setNovaContaResumoCls] = useState<string>('');

  // Guia Contas (Contas sintéticas omitidas do relatório - Balancete_Contabilidade.htm)
  const [contasSinteticasOmitidas, setContasSinteticasOmitidas] = useState<string[]>([]);
  const [novaSinteticaOmitidaCls, setNovaSinteticaOmitidaCls] = useState<string>('');

  // Balancete Padrão Mensal
  const { items: rawItems, totalDebitos, totalCreditos, diferencaDxC } = AccountingEngine.generateTrialBalance(
    contas,
    lancamentos,
    grauMax,
    apenasComMovimento,
    desconsiderarZeramento
  );

  // Aplica filtros "Imprimir plano: Total / Parcial" e "Guia Contas (Omitir sintéticas)" de contabil.exe
  const items = rawItems.filter(item => {
    if (imprimirPlanoModo === 'PARCIAL' && !item.classificacao.startsWith(grupoParcialPrefix)) {
      return false;
    }
    if (contasSinteticasOmitidas.some(omitCls => item.classificacao === omitCls || item.classificacao.startsWith(omitCls + '.'))) {
      return false;
    }
    return true;
  });

  // Balancete Completo (Grau 5) para alimentar a Guia Resumo do Balancete (até 10 contas) e o Resumo no Final
  const fullTrialBalance = AccountingEngine.generateTrialBalance(
    contas,
    lancamentos,
    5,
    false,
    desconsiderarZeramento
  );

  const resumo10ContasCalculado = resumo10Classificacoes
    .map(cls => fullTrialBalance.items.find(i => i.classificacao === cls))
    .filter((i): i is NonNullable<typeof i> => Boolean(i));

  // Cálculo do "Emitir resumo no final" (Ativo, Passivo, PL, Receitas, Despesas, Contas Devedoras e Contas Credoras)
  const getSaldoGrupo = (prefix: string) => {
    const sintetica = fullTrialBalance.items.find(i => i.classificacao === prefix);
    if (sintetica) return { saldo: sintetica.saldoAtual, natureza: sintetica.saldoAtualNatureza };
    const analiticas = fullTrialBalance.items.filter(i => i.tipo === 'A' && i.classificacao.startsWith(prefix));
    let total = 0;
    for (const a of analiticas) {
      total += a.saldoAtualNatureza === 'D' ? a.saldoAtual : -a.saldoAtual;
    }
    return { saldo: Math.abs(total), natureza: (total >= 0 ? 'D' : 'C') as 'D' | 'C' };
  };

  const resumoFinalGrupos = {
    ativo: getSaldoGrupo('1'),
    passivoExigivel: (() => {
      const pc = getSaldoGrupo('2.01');
      const pnc = getSaldoGrupo('2.02');
      return { saldo: pc.saldo + pnc.saldo, natureza: 'C' as const };
    })(),
    patrimonioLiquido: getSaldoGrupo('2.03'),
    receitas: getSaldoGrupo('3'),
    despesasCustos: getSaldoGrupo('4'),
    totalSaldosDevedores: fullTrialBalance.items
      .filter(i => i.tipo === 'A' && i.saldoAtualNatureza === 'D')
      .reduce((s, i) => s + i.saldoAtual, 0),
    totalSaldosCredores: fullTrialBalance.items
      .filter(i => i.tipo === 'A' && i.saldoAtualNatureza === 'C')
      .reduce((s, i) => s + i.saldoAtual, 0)
  };

  // Balancete Evolução 12 Meses (Multi-Período Domínio Sistemas)
  const multiPeriodItems = AccountingEngine.generateMultiPeriodBalancete(
    contas,
    lancamentos,
    anoReferencia,
    Math.min(grauMax, 3)
  );

  const mesesHeaders = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  const handleAdicionarContaResumo = () => {
    if (!novaContaResumoCls) return;
    if (resumo10Classificacoes.length >= 10) {
      alert('Obs. (Opções Contabilidade): É permitido configurar no máximo 10 (dez) contas no Resumo do Balancete.');
      return;
    }
    if (!resumo10Classificacoes.includes(novaContaResumoCls)) {
      setResumo10Classificacoes([...resumo10Classificacoes, novaContaResumoCls]);
    }
    setNovaContaResumoCls('');
  };

  const handleRemoverContaResumo = (cls: string) => {
    setResumo10Classificacoes(resumo10Classificacoes.filter(c => c !== cls));
  };

  const handleAdicionarSinteticaOmitida = () => {
    if (!novaSinteticaOmitidaCls) return;
    if (!contasSinteticasOmitidas.includes(novaSinteticaOmitidaCls)) {
      setContasSinteticasOmitidas([...contasSinteticasOmitidas, novaSinteticaOmitidaCls]);
    }
    setNovaSinteticaOmitidaCls('');
  };

  const handleExportCSV = () => {
    if (modoVisualizacao === 'MENSAL') {
      const headers = ['Classificação', 'Código Reduzido', 'Nome da Conta', 'Tipo', 'Grau', 'Saldo Anterior', 'Débitos', 'Créditos', 'Saldo Atual', 'Natureza'];
      const rows = items.map(i => [
        i.classificacao,
        i.codigoReduzido,
        i.nome,
        i.tipo === 'S' ? 'Sintética' : 'Analítica',
        i.grau,
        i.saldoAnterior,
        i.debitos,
        i.creditos,
        i.saldoAtual,
        i.saldoAtualNatureza
      ]);
      exportToCSV(`Balancete_Verificacao_${new Date().toISOString().split('T')[0]}`, rows, headers);
    } else {
      const headers = ['Classificação', 'Código Reduzido', 'Nome da Conta', 'Grau', 'Tipo', ...mesesHeaders, 'Acumulado 2026'];
      const rows = multiPeriodItems.map(i => [
        i.classificacao,
        i.codigoReduzido || '',
        i.nome,
        i.grau,
        i.tipo === 'S' ? 'Sintética' : 'Analítica',
        ...i.meses.map(v => v !== 0 ? v : 0),
        i.totalAno
      ]);
      exportToCSV(`Balancete_Evolucao_12Meses_${anoReferencia}`, rows, headers);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#141414] text-neutral-200 overflow-hidden select-none">
      {/* Sub-header de visualização e filtros */}
      <div className="px-4 py-2.5 bg-[#181818] border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Toggle de Modo: Mensal vs 12 Meses */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-[#101010] p-0.5 rounded-lg border border-white/10">
            <button
              onClick={() => setModoVisualizacao('MENSAL')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition flex items-center space-x-1.5 ${
                modoVisualizacao === 'MENSAL'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Balancete Mensal</span>
            </button>
            <button
              onClick={() => setModoVisualizacao('EVOLUCAO_12_MESES')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition flex items-center space-x-1.5 ${
                modoVisualizacao === 'EVOLUCAO_12_MESES'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Evolução 12 Meses</span>
            </button>
          </div>

          <div className="h-4 w-[1px] bg-white/10 mx-1 hidden sm:block" />

          {/* Filtros de Grau, Plano Total/Parcial e Opções */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-1.5">
              <span className="text-neutral-400 text-[11px]">Grau máx.:</span>
              <select
                value={grauMax}
                onChange={(e) => setGrauMax(Number(e.target.value))}
                className="bg-[#121212] border border-white/10 rounded px-2 py-0.5 text-neutral-200 outline-none text-[11px]"
              >
                <option value={1}>Grau 1</option>
                <option value={2}>Grau 2</option>
                <option value={3}>Grau 3</option>
                {modoVisualizacao === 'MENSAL' && (
                  <>
                    <option value={4}>Grau 4</option>
                    <option value={5}>Grau 5 (Analítico)</option>
                  </>
                )}
              </select>
            </div>

            {modoVisualizacao === 'MENSAL' ? (
              <>
                <div className="flex items-center space-x-1.5">
                  <span className="text-neutral-400 text-[11px]">Imprimir plano:</span>
                  <select
                    value={imprimirPlanoModo}
                    onChange={(e) => setImprimirPlanoModo(e.target.value as 'TOTAL' | 'PARCIAL')}
                    className="bg-[#121212] border border-white/10 rounded px-2 py-0.5 text-neutral-200 outline-none text-[11px]"
                  >
                    <option value="TOTAL">Total (Todos os Grupos)</option>
                    <option value="PARCIAL">Parcial (Por Grupo)</option>
                  </select>
                  {imprimirPlanoModo === 'PARCIAL' && (
                    <select
                      value={grupoParcialPrefix}
                      onChange={(e) => setGrupoParcialPrefix(e.target.value)}
                      className="bg-[#121212] border border-blue-500/40 rounded px-2 py-0.5 text-blue-300 outline-none text-[11px] font-mono"
                    >
                      <option value="1">1 - Ativo</option>
                      <option value="2.01">2.01 - Passivo Circulante</option>
                      <option value="2.03">2.03 - Patrimônio Líquido</option>
                      <option value="3">3 - Receitas</option>
                      <option value="4">4 - Custos e Despesas</option>
                    </select>
                  )}
                </div>

                <label className="flex items-center space-x-1.5 cursor-pointer text-neutral-300 text-[11px]">
                  <input
                    type="checkbox"
                    checked={apenasComMovimento}
                    onChange={(e) => setApenasComMovimento(e.target.checked)}
                    className="rounded bg-neutral-900 border-white/20 text-blue-600 focus:ring-0"
                  />
                  <span>Com movimento</span>
                </label>

                <label className="flex items-center space-x-1.5 cursor-pointer text-neutral-300 text-[11px]">
                  <input
                    type="checkbox"
                    checked={desconsiderarZeramento}
                    onChange={(e) => setDesconsiderarZeramento(e.target.checked)}
                    className="rounded bg-neutral-900 border-white/20 text-blue-600 focus:ring-0"
                  />
                  <span>Desconsiderar zeramento</span>
                </label>

                <label className="flex items-center space-x-1.5 cursor-pointer text-neutral-300 text-[11px]">
                  <input
                    type="checkbox"
                    checked={destacarSinteticas}
                    onChange={(e) => setDestacarSinteticas(e.target.checked)}
                    className="rounded bg-neutral-900 border-white/20 text-blue-600 focus:ring-0"
                  />
                  <span>Destacar sintéticas</span>
                </label>

                <label className="flex items-center space-x-1.5 cursor-pointer text-neutral-300 text-[11px]">
                  <input
                    type="checkbox"
                    checked={emitirResumoFinal}
                    onChange={(e) => setEmitirResumoFinal(e.target.checked)}
                    className="rounded bg-neutral-900 border-white/20 text-blue-600 focus:ring-0"
                  />
                  <span>Emitir resumo no final</span>
                </label>
              </>
            ) : (
              <div className="flex items-center space-x-1.5">
                <span className="text-neutral-400 text-[11px]">Exercício:</span>
                <select
                  value={anoReferencia}
                  onChange={(e) => setAnoReferencia(Number(e.target.value))}
                  className="bg-[#121212] border border-white/10 rounded px-2 py-0.5 text-neutral-200 outline-none text-[11px]"
                >
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Botões Guia Resumo (Até 10 Contas), Exportar Excel e Equilíbrio DxC */}
        <div className="flex items-center space-x-2">
          {modoVisualizacao === 'MENSAL' && (
            <>
              <button
                onClick={() => setExibirResumo10Contas(!exibirResumo10Contas)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded border transition-colors text-[11px] font-medium ${
                  exibirResumo10Contas
                    ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                    : 'bg-neutral-800 border-white/10 text-neutral-400 hover:text-neutral-200'
                }`}
                title="Exibir/Ocultar Guia Resumo do Balancete (até 10 contas-chave)"
              >
                <ListChecks className="w-3.5 h-3.5" />
                <span>Resumo ({resumo10Classificacoes.length}/10)</span>
              </button>

              <button
                onClick={() => setShowConfigResumoModal(true)}
                className="flex items-center space-x-1 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded border border-white/10 transition-colors text-[11px]"
                title="Configurar Guia Resumo do Balancete (até 10 contas) e Guia Contas Omitidas"
              >
                <Sliders className="w-3.5 h-3.5 text-sky-400" />
                <span>Opções / Contas</span>
              </button>
            </>
          )}

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded border border-white/10 transition-colors text-xs"
            title="Exportar Balancete para Excel / CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exportar Excel</span>
          </button>

          {modoVisualizacao === 'MENSAL' && (
            <div className={`flex items-center space-x-2 px-2.5 py-1 rounded font-mono font-medium text-xs ${
              diferencaDxC === 0
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
            }`}>
              {diferencaDxC === 0 ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>DxC EQUILIBRADO</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>DIF: R$ {diferencaDxC.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Painel Guia Resumo do Balancete (Até 10 Contas - Op__es_Contabilidade.htm) */}
      {modoVisualizacao === 'MENSAL' && exibirResumo10Contas && resumo10ContasCalculado.length > 0 && (
        <div className="px-4 py-2.5 bg-[#161616] border-b border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-neutral-300 flex items-center space-x-1.5">
              <ListChecks className="w-3.5 h-3.5 text-blue-400" />
              <span>Guia Resumo do Balancete — Contas-Chave para Conferência Rápida (Máx. 10 Contas)</span>
            </span>
            <button
              onClick={() => setShowConfigResumoModal(true)}
              className="text-[11px] text-sky-400 hover:underline flex items-center space-x-1"
            >
              <span>Personalizar 10 contas ({resumo10Classificacoes.length}/10)</span>
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {resumo10ContasCalculado.map((conta) => (
              <div
                key={conta.id}
                onDoubleClick={() => onOpenRazaoConta && conta.tipo === 'A' && onOpenRazaoConta(conta.id)}
                className="bg-[#1c1c1c] border border-white/10 hover:border-blue-500/30 rounded-lg px-2.5 py-2 transition cursor-pointer"
                title={`${conta.classificacao} - ${conta.nome} (Duplo clique para Razão)`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                  <span>{conta.classificacao}</span>
                  {conta.codigoReduzido && <span>Red: {conta.codigoReduzido}</span>}
                </div>
                <div className="text-[11px] font-medium text-neutral-200 truncate mt-0.5">
                  {conta.nome}
                </div>
                <div className="mt-1 flex items-center justify-between font-mono text-xs font-bold">
                  <span className={conta.saldoAtualNatureza === 'D' ? 'text-blue-400' : 'text-emerald-400'}>
                    R$ {conta.saldoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className={`text-[10px] px-1 rounded ${
                    conta.saldoAtualNatureza === 'D'
                      ? 'bg-blue-500/15 text-blue-300'
                      : 'bg-emerald-500/15 text-emerald-300'
                  }`}>
                    {conta.saldoAtualNatureza}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grade do Balancete */}
      <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3">
        {modoVisualizacao === 'MENSAL' ? (
          <>
            <div className="bg-[#181818] border border-white/10 rounded-lg overflow-hidden shadow-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-neutral-900/90 sticky top-0 border-b border-white/10 text-neutral-400 font-medium z-10">
                  <tr>
                    <th className="py-2.5 px-3 w-36">Classificação</th>
                    <th className="py-2.5 px-2 w-16 text-center">Red.</th>
                    <th className="py-2.5 px-3">Nome da Conta Contábil</th>
                    <th className="py-2.5 px-3 w-32 text-right">Saldo Anterior</th>
                    <th className="py-2.5 px-3 w-32 text-right">Débitos (R$)</th>
                    <th className="py-2.5 px-3 w-32 text-right">Créditos (R$)</th>
                    <th className="py-2.5 px-3 w-36 text-right">Saldo Atual (R$)</th>
                    <th className="py-2.5 px-2 w-12 text-center">Nat.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {items.map((item) => {
                    const isSintetica = item.tipo === 'S';
                    const paddingGrau = (item.grau - 1) * 16;

                    return (
                      <tr
                        key={item.id}
                        onDoubleClick={() => onOpenRazaoConta && item.tipo === 'A' && onOpenRazaoConta(item.id)}
                        className={`transition-colors ${
                          isSintetica
                            ? `bg-neutral-900/40 ${destacarSinteticas ? 'font-semibold text-neutral-100' : 'font-normal text-neutral-300'}`
                            : 'hover:bg-blue-600/10 cursor-pointer text-neutral-300'
                        }`}
                        title={item.tipo === 'A' ? 'Clique duplo para abrir Razão da Conta' : undefined}
                      >
                        <td className="py-2 px-3 font-mono text-neutral-400">{item.classificacao}</td>
                        <td className="py-2 px-2 text-center font-mono text-neutral-500">
                          {item.tipo === 'A' ? item.codigoReduzido : ''}
                        </td>
                        <td className="py-2 px-3">
                          <div style={{ paddingLeft: `${paddingGrau}px` }} className="flex items-center space-x-1.5">
                            <span className={isSintetica && destacarSinteticas ? 'text-white font-semibold' : 'text-neutral-200'}>
                              {item.nome}
                            </span>
                            {item.tipo === 'A' && (
                              <ArrowUpRight className="w-3 h-3 text-neutral-600 opacity-0 group-hover:opacity-100" />
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-neutral-400">
                          {item.saldoAnterior.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-blue-400">
                          {item.debitos > 0 ? item.debitos.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-indigo-400">
                          {item.creditos > 0 ? item.creditos.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}
                        </td>
                        <td className={`py-2 px-3 text-right font-mono ${
                          isSintetica && destacarSinteticas ? 'font-semibold text-neutral-100' : 'text-emerald-400'
                        }`}>
                          {item.saldoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-neutral-400">
                          {item.saldoAtualNatureza}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {/* Totais do Balancete */}
                <tfoot className="bg-neutral-900 border-t-2 border-white/20 font-mono font-bold text-xs">
                  <tr>
                    <td colSpan={4} className="py-3 px-3 text-right uppercase tracking-wider text-neutral-300">
                      Totais das Contas Analíticas:
                    </td>
                    <td className="py-3 px-3 text-right text-blue-400">
                      R$ {totalDebitos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-right text-indigo-400">
                      R$ {totalCreditos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td colSpan={2} className="py-3 px-3 text-right text-emerald-400">
                      Diferença: R$ {diferencaDxC.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Quadro "Emitir resumo no final" (Balancete_Contabilidade.htm) */}
            {emitirResumoFinal && (
              <div className="bg-[#181818] border border-white/10 rounded-lg p-4 shadow-lg">
                <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-white/10">
                  <h3 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
                    Resumo Final do Balancete (Ativo, Passivo, Patrimônio Líquido, Receitas, Despesas e Contas Devedoras/Credoras)
                  </h3>
                  <span className="text-[11px] font-mono text-neutral-400">
                    Diferença Devedoras x Credoras: R$ {Math.abs(resumoFinalGrupos.totalSaldosDevedores - resumoFinalGrupos.totalSaldosCredores).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 font-mono text-xs">
                  <div className="bg-[#141414] p-2.5 rounded border border-white/10">
                    <span className="text-[10px] font-sans text-neutral-400 block">1. Total Ativo</span>
                    <strong className="text-blue-400">
                      R$ {resumoFinalGrupos.ativo.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({resumoFinalGrupos.ativo.natureza})
                    </strong>
                  </div>
                  <div className="bg-[#141414] p-2.5 rounded border border-white/10">
                    <span className="text-[10px] font-sans text-neutral-400 block">2. Passivo Exigível</span>
                    <strong className="text-indigo-400">
                      R$ {resumoFinalGrupos.passivoExigivel.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({resumoFinalGrupos.passivoExigivel.natureza})
                    </strong>
                  </div>
                  <div className="bg-[#141414] p-2.5 rounded border border-white/10">
                    <span className="text-[10px] font-sans text-neutral-400 block">2.03. Patr. Líquido</span>
                    <strong className={resumoFinalGrupos.patrimonioLiquido.natureza === 'D' ? 'text-amber-400' : 'text-emerald-400'}>
                      R$ {resumoFinalGrupos.patrimonioLiquido.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({resumoFinalGrupos.patrimonioLiquido.natureza})
                    </strong>
                  </div>
                  <div className="bg-[#141414] p-2.5 rounded border border-white/10">
                    <span className="text-[10px] font-sans text-neutral-400 block">3. Total Receitas</span>
                    <strong className="text-emerald-400">
                      R$ {resumoFinalGrupos.receitas.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({resumoFinalGrupos.receitas.natureza})
                    </strong>
                  </div>
                  <div className="bg-[#141414] p-2.5 rounded border border-white/10">
                    <span className="text-[10px] font-sans text-neutral-400 block">4. Custos / Despesas</span>
                    <strong className="text-rose-400">
                      R$ {resumoFinalGrupos.despesasCustos.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({resumoFinalGrupos.despesasCustos.natureza})
                    </strong>
                  </div>
                  <div className="bg-[#141414] p-2.5 rounded border border-white/10">
                    <span className="text-[10px] font-sans text-neutral-400 block">Contas Devedoras (D)</span>
                    <strong className="text-blue-300">
                      R$ {resumoFinalGrupos.totalSaldosDevedores.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </strong>
                  </div>
                  <div className="bg-[#141414] p-2.5 rounded border border-white/10">
                    <span className="text-[10px] font-sans text-neutral-400 block">Contas Credoras (C)</span>
                    <strong className="text-indigo-300">
                      R$ {resumoFinalGrupos.totalSaldosCredores.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Evolução Comparativa 12 Meses (Multi-Período) */
          <div className="bg-[#181818] border border-white/10 rounded-lg overflow-x-auto shadow-lg custom-scrollbar">
            <table className="w-full text-left text-[11px] border-collapse min-w-[1300px]">
              <thead className="bg-neutral-900/95 sticky top-0 border-b border-white/10 text-neutral-400 font-semibold uppercase tracking-wider text-[10px] z-10">
                <tr>
                  <th className="py-2.5 px-3 w-28 sticky left-0 bg-[#181818] z-20">Classificação</th>
                  <th className="py-2.5 px-3 min-w-[200px] sticky left-28 bg-[#181818] z-20 border-r border-white/10">Conta Contábil</th>
                  {mesesHeaders.map(m => (
                    <th key={m} className="py-2.5 px-2 text-right w-24">{m}</th>
                  ))}
                  <th className="py-2.5 px-3 text-right w-32 bg-blue-950/20 text-blue-300 font-bold border-l border-white/10">
                    Acumulado {anoReferencia}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {multiPeriodItems.map((item) => {
                  const isSintetica = item.tipo === 'S';
                  const paddingGrau = (item.grau - 1) * 12;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-white/[0.02] transition-colors ${
                        isSintetica ? 'bg-neutral-900/30 font-bold text-neutral-100' : 'text-neutral-300'
                      }`}
                    >
                      <td className="py-2 px-3 text-neutral-400 sticky left-0 bg-[#181818] z-10">{item.classificacao}</td>
                      <td className="py-2 px-3 sticky left-28 bg-[#181818] z-10 border-r border-white/10 font-sans">
                        <div style={{ paddingLeft: `${paddingGrau}px` }}>
                          <span className={isSintetica ? 'text-white' : 'text-neutral-200'}>{item.nome}</span>
                        </div>
                      </td>
                      {item.meses.map((val, idx) => (
                        <td
                          key={idx}
                          className={`py-2 px-2 text-right ${
                            val > 0 ? (isSintetica ? 'text-neutral-200' : 'text-emerald-400') : (val < 0 ? 'text-rose-400' : 'text-neutral-600')
                          }`}
                        >
                          {val !== 0 ? val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                        </td>
                      ))}
                      <td
                        className={`py-2 px-3 text-right font-bold border-l border-white/10 bg-blue-950/10 ${
                          item.totalAno > 0 ? 'text-emerald-400' : (item.totalAno < 0 ? 'text-rose-400' : 'text-neutral-500')
                        }`}
                      >
                        {item.totalAno.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Configuração: Guia Resumo do Balancete (Máx. 10 Contas) & Guia Contas Sintéticas Omitidas */}
      {showConfigResumoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#232323] border border-white/10 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden text-xs">
            <div className="px-5 py-3.5 bg-[#1c1c1c] border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-neutral-100">
                  Opções do Balancete — Guia Resumo (Máx. 10 Contas) & Guia Contas Omitidas
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Configuração fiel à Guia Resumo do Balancete (Opções Contabilidade) e Guia Contas do Balancete
                </p>
              </div>
              <button
                onClick={() => setShowConfigResumoModal(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
              {/* Seção 1: Guia Resumo do Balancete (Máximo 10 contas) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-neutral-200 flex items-center space-x-1.5">
                    <ListChecks className="w-4 h-4 text-blue-400" />
                    <span>1. Guia Resumo do Balancete (Obs.: No máximo 10 contas)</span>
                  </span>
                  <span className="font-mono text-[11px] text-blue-400">
                    {resumo10Classificacoes.length} / 10 contas selecionadas
                  </span>
                </div>

                <div className="flex items-center space-x-2 mb-3">
                  <select
                    value={novaContaResumoCls}
                    onChange={(e) => setNovaContaResumoCls(e.target.value)}
                    className="flex-1 bg-[#141414] border border-white/10 rounded px-3 py-1.5 text-neutral-200 outline-none"
                  >
                    <option value="">Selecione uma conta contábil para incluir no Resumo...</option>
                    {contas.map(c => (
                      <option key={c.id} value={c.classificacao}>
                        {c.classificacao} {c.codigoReduzido ? `(Red. ${c.codigoReduzido})` : ''} — {c.nome} [{c.tipo === 'S' ? 'Sintética' : 'Analítica'}]
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAdicionarContaResumo}
                    disabled={!novaContaResumoCls || resumo10Classificacoes.length >= 10}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded font-medium flex items-center space-x-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Incluir</span>
                  </button>
                </div>

                <div className="bg-[#181818] border border-white/10 rounded-lg divide-y divide-white/5">
                  {resumo10Classificacoes.map((cls, idx) => {
                    const c = contas.find(x => x.classificacao === cls);
                    return (
                      <div key={cls} className="px-3 py-2 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-[11px] text-neutral-500 w-5">{idx + 1}.</span>
                          <span className="font-mono text-blue-400">{cls}</span>
                          <span className="text-neutral-200">{c?.nome || 'Conta Contábil'}</span>
                        </div>
                        <button
                          onClick={() => handleRemoverContaResumo(cls)}
                          className="text-rose-400 hover:text-rose-300 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-[10px]"
                        >
                          Excluir
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Seção 2: Guia Contas (Omitir Contas Sintéticas) */}
              <div className="pt-3 border-t border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-neutral-200 flex items-center space-x-1.5">
                    <EyeOff className="w-4 h-4 text-amber-400" />
                    <span>2. Guia Contas — Contas Sintéticas que deseja omitir do relatório</span>
                  </span>
                  <span className="font-mono text-[11px] text-amber-400">
                    {contasSinteticasOmitidas.length} omitida(s)
                  </span>
                </div>

                <div className="flex items-center space-x-2 mb-3">
                  <select
                    value={novaSinteticaOmitidaCls}
                    onChange={(e) => setNovaSinteticaOmitidaCls(e.target.value)}
                    className="flex-1 bg-[#141414] border border-white/10 rounded px-3 py-1.5 text-neutral-200 outline-none"
                  >
                    <option value="">Selecione uma conta Sintética para omitir do Balancete...</option>
                    {contas.filter(c => c.tipo === 'S').map(c => (
                      <option key={c.id} value={c.classificacao}>
                        {c.classificacao} — {c.nome} (Grau {c.grau})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAdicionarSinteticaOmitida}
                    disabled={!novaSinteticaOmitidaCls}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white rounded font-medium flex items-center space-x-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Omitir Grupo</span>
                  </button>
                </div>

                {contasSinteticasOmitidas.length > 0 ? (
                  <div className="bg-[#181818] border border-white/10 rounded-lg divide-y divide-white/5">
                    {contasSinteticasOmitidas.map(cls => {
                      const c = contas.find(x => x.classificacao === cls);
                      return (
                        <div key={cls} className="px-3 py-2 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-amber-400">{cls}</span>
                            <span className="text-neutral-200">{c?.nome}</span>
                          </div>
                          <button
                            onClick={() => setContasSinteticasOmitidas(contasSinteticasOmitidas.filter(x => x !== cls))}
                            className="text-neutral-300 hover:text-white px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px]"
                          >
                            Restaurar
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[11px] text-neutral-500 italic">
                    Nenhuma conta sintética omitida no momento.
                  </p>
                )}
              </div>
            </div>

            <div className="px-5 py-3 bg-[#1c1c1c] border-t border-white/10 flex justify-end">
              <button
                onClick={() => setShowConfigResumoModal(false)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium transition"
              >
                Concluir Configuração
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

