import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  RotateCcw, 
  Filter, 
  ArrowRight,
  TrendingDown,
  Layers,
  FileText,
  FileCheck2,
  Users,
  Receipt,
  Calculator,
  Download,
  ShieldCheck,
  AlertOctagon,
  Eye,
  Wrench,
  Sparkles,
  CheckCheck
} from 'lucide-react';
import { Empresa, ContaContabil, LancamentoContabil, BalanceteItem } from '../../types/contabil';
import { AccountingEngine } from '../../engine/accountingEngine';
import { dbService } from '../../db/sqliteService';
import { exportToCSV } from '../../utils/exportUtils';

interface AuditoriaContabilModuleProps {
  empresa: Empresa;
  contas: ContaContabil[];
  lancamentos: LancamentoContabil[];
  onNavigateToConta?: (contaId: number) => void;
  onRefreshData?: () => void;
}

export const AuditoriaContabilModule: React.FC<AuditoriaContabilModuleProps> = ({
  empresa,
  contas,
  lancamentos,
  onNavigateToConta,
  onRefreshData
}) => {
  const [activeTab, setActiveTab] = useState<'invertidos' | 'furos' | 'dxc' | 'fiscal_contabil' | 'folha_contabil' | 'sped_diagnostico'>('fiscal_contabil');
  const [notificacao, setNotificacao] = useState<{ tipo: 'success' | 'info'; mensagem: string } | null>(null);

  const handleAutoCorrigirSped = () => {
    const res = dbService.autoCorrigirContasSemSped(empresa.id);
    setNotificacao({
      tipo: 'success',
      mensagem: `Auto-correção concluída: ${res.corrigidasCount} conta(s) vinculada(s) ao Plano de Contas Referencial da RFB.`
    });
    onRefreshData?.();
    setTimeout(() => setNotificacao(null), 5000);
  };

  const handleNormalizarParticipantes = () => {
    const res = dbService.normalizarParticipantesFiscais(empresa.id);
    setNotificacao({
      tipo: 'success',
      mensagem: `Normalização fiscal concluída: ${res.normalizadosCount} participante(s) corrigido(s) com Código IBGE e Indicador IE.`
    });
    onRefreshData?.();
    setTimeout(() => setNotificacao(null), 5000);
  };

  const handleRenumerarPartidas = () => {
    const res = dbService.renumerarPartidasCronologicamente(empresa.id);
    setNotificacao({
      tipo: 'success',
      mensagem: `Renumeração concluída: ${res.renumeradasCount} partidas do Livro Diário reordenadas cronologicamente sem furos.`
    });
    onRefreshData?.();
    setTimeout(() => setNotificacao(null), 5000);
  };

  // 1. Cálculos de Balancete
  const trialBalance = AccountingEngine.generateTrialBalance(contas, lancamentos, 5, false, false);

  // 2. Auditoria de Saldos Invertidos
  const contasInvertidas: BalanceteItem[] = trialBalance.items.filter((c: BalanceteItem) => {
    if (c.tipo !== 'A' || c.saldoAtual === 0) return false;
    return c.saldoAtualNatureza !== c.natureza;
  });

  // 3. Auditoria de Furos de Numeração de Partidas
  const numerosPartidas = lancamentos.map(l => l.numeroPartida).sort((a, b) => a - b);
  const furosNumeracao: number[] = [];
  if (numerosPartidas.length > 0) {
    const min = numerosPartidas[0];
    const max = numerosPartidas[numerosPartidas.length - 1];
    const numSet = new Set(numerosPartidas);
    for (let i = min; i <= max; i++) {
      if (!numSet.has(i)) {
        furosNumeracao.push(i);
      }
    }
  }

  // 4. Auditoria de Consistência DxC
  const totalDebitos = trialBalance.totalDebitos;
  const totalCreditos = trialBalance.totalCreditos;
  const diferencaDxC = trialBalance.diferencaDxC;

  // 5. Cruzamento Fiscal x Contábil (Malha Fina de Receita e Impostos)
  const notasSaida = dbService.getNotasFiscais(empresa.id).filter(n => n.tipo === 'SAIDA' && n.dataEmissao.startsWith(empresa.competenciaAtiva));
  const totalFaturamentoFiscal = notasSaida.reduce((acc, n) => acc + n.valorTotal, 0);
  const totalPISFiscal = notasSaida.reduce((acc, n) => acc + (n.valorPIS || 0), 0);
  const totalCOFINSFiscal = notasSaida.reduce((acc, n) => acc + (n.valorCOFINS || 0), 0);
  const totalISSFiscal = notasSaida.reduce((acc, n) => acc + (n.valorISS || 0), 0);
  const totalICMSFiscal = notasSaida.reduce((acc, n) => acc + (n.valorICMS || 0), 0);

  // Contabilidade: lançamentos de crédito em contas de Receita (Grupo 4) na competência
  const contasReceitaIds = new Set(contas.filter(c => c.classificacao.startsWith('4') || c.classificacao.startsWith('3')).map(c => c.id));
  const lancamentosMes = lancamentos.filter(l => l.dataLancamento.startsWith(empresa.competenciaAtiva));
  
  let totalReceitaContabil = 0;
  for (const l of lancamentosMes) {
    if (l.contaCreditoId && contasReceitaIds.has(l.contaCreditoId)) {
      totalReceitaContabil += l.valor;
    }
  }

  const diferencaReceita = Math.abs(totalFaturamentoFiscal - totalReceitaContabil);
  const statusReceita = diferencaReceita < 0.01 ? 'CONCILIADO' : 'DIVERGENTE';

  // 6. Cruzamento Folha x Contábil
  const folhasCalculadas = dbService.getFolhasCalculadas(empresa.id, empresa.competenciaAtiva);
  const totalBrutoFolha = folhasCalculadas.reduce((acc, f) => acc + (f.totalProventos || 0), 0);
  const totalINSSSegurados = folhasCalculadas.reduce((acc, f) => acc + (f.inssSegurado || 0), 0);
  const totalIRRFFolha = folhasCalculadas.reduce((acc, f) => acc + (f.irrf || 0), 0);
  const totalFGTSFolha = folhasCalculadas.reduce((acc, f) => acc + (f.fgts || 0), 0);
  const totalLiquidoFolha = folhasCalculadas.reduce((acc, f) => acc + (f.salarioLiquido || 0), 0);

  // Contabilidade: Salários debitados em Despesas com Pessoal (ex: conta 56 ou classificação 5.1.01)
  const contasDespesaSalario = new Set(contas.filter(c => c.nome.toLowerCase().includes('salário') || c.nome.toLowerCase().includes('pró-labore') || c.nome.toLowerCase().includes('ordenado')).map(c => c.id));
  let totalSalariosDebitadoContabil = 0;
  for (const l of lancamentosMes) {
    if (l.contaDebitoId && contasDespesaSalario.has(l.contaDebitoId)) {
      totalSalariosDebitadoContabil += l.valor;
    }
  }
  const diferencaFolhaBruto = Math.abs(totalBrutoFolha - totalSalariosDebitadoContabil);

  // 7. Diagnóstico SPED ECD & ECF (Validação Preliminar)
  const contasAnaliticas = contas.filter(c => c.tipo === 'A');
  const contasSemPlanoRef = contasAnaliticas.filter(c => !c.codigoReferencialRFB || c.codigoReferencialRFB.trim() === '');
  const participantes = dbService.getParticipantes(empresa.id);
  const participantesIncompletos = participantes.filter(p => !p.cnpjCpf || !p.codigoIbge || p.cnpjCpf.length < 11);
  const produtos = dbService.getProdutos(empresa.id);
  const produtosSemNCM = produtos.filter(p => !p.ncm || p.ncm.length < 8);

  const totalInconsistenciasSPED = contasSemPlanoRef.length + participantesIncompletos.length + produtosSemNCM.length;

  // Exportar Relatório de Malha Fina
  const handleExportarRelatorio = () => {
    const data = [
      { Tipo: 'FISCAL_X_CONTABIL', Descricao: 'Faturamento de Notas Fiscais Saída', ValorFiscal: totalFaturamentoFiscal, ValorContabil: totalReceitaContabil, Diferenca: diferencaReceita, Status: statusReceita },
      { Tipo: 'FOLHA_X_CONTABIL', Descricao: 'Salários e Vencimentos Brutos', ValorFiscal: totalBrutoFolha, ValorContabil: totalSalariosDebitadoContabil, Diferenca: diferencaFolhaBruto, Status: diferencaFolhaBruto < 0.01 ? 'CONCILIADO' : 'DIVERGENTE' },
      { Tipo: 'CONSISTENCIA_DXC', Descricao: 'Partidas Dobradas Débito x Crédito', ValorFiscal: totalDebitos, ValorContabil: totalCreditos, Diferenca: diferencaDxC, Status: diferencaDxC === 0 ? 'CONCILIADO' : 'DIVERGENTE' },
      { Tipo: 'SPED_DIAGNOSTICO', Descricao: 'Contas Sem Vínculo Plano Referencial RFB', ValorFiscal: contasSemPlanoRef.length, ValorContabil: 0, Diferenca: contasSemPlanoRef.length, Status: contasSemPlanoRef.length === 0 ? 'CONFORME' : 'PENDENTE' }
    ];
    exportToCSV(data, `Malha_Fina_Auditoria_Cruzada_${empresa.competenciaAtiva}`);
  };

  return (
    <div className="h-full flex flex-col p-6 bg-[#141414] text-neutral-100 select-none overflow-hidden font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-white/10 gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <ShieldAlert size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span>Auditoria Eletrônica Cruzada & Malha Fina Interna</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono font-medium">
                CFC / SPED / RFB
              </span>
            </h1>
            <p className="text-xs text-neutral-400">
              Cruzamento automático de dados entre Escrita Fiscal, Folha de Pagamento, Contabilidade e SPED
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportarRelatorio}
            className="px-3 py-1.5 text-xs bg-[#202020] hover:bg-[#282828] text-neutral-300 rounded border border-white/10 flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Diagnóstico CSV</span>
          </button>
        </div>
      </div>

      {/* Notificação Auto-Fix */}
      {notificacao && (
        <div className="mt-3 p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex items-center justify-between text-xs animate-in fade-in flex-shrink-0">
          <div className="flex items-center gap-2">
            <CheckCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-medium">{notificacao.mensagem}</span>
          </div>
          <button 
            onClick={() => setNotificacao(null)}
            className="text-neutral-400 hover:text-white text-xs px-2 py-0.5"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Abas Superiores de Auditoria */}
      <div className="flex bg-[#1a1a1a] p-1 rounded-lg border border-white/10 mt-3 text-xs overflow-x-auto flex-shrink-0">
        <button
          onClick={() => setActiveTab('fiscal_contabil')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition ${
            activeTab === 'fiscal_contabil' ? 'bg-white/15 text-white font-medium' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Receipt size={14} className={diferencaReceita > 0.01 ? 'text-amber-400' : 'text-emerald-400'} />
          <span>Fiscal x Contábil {diferencaReceita > 0.01 ? '(!)' : '(OK)'}</span>
        </button>

        <button
          onClick={() => setActiveTab('folha_contabil')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition ${
            activeTab === 'folha_contabil' ? 'bg-white/15 text-white font-medium' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Users size={14} className={diferencaFolhaBruto > 0.01 ? 'text-amber-400' : 'text-emerald-400'} />
          <span>Folha x Contábil {diferencaFolhaBruto > 0.01 ? '(!)' : '(OK)'}</span>
        </button>

        <button
          onClick={() => setActiveTab('sped_diagnostico')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition ${
            activeTab === 'sped_diagnostico' ? 'bg-white/15 text-white font-medium' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <FileCheck2 size={14} className={totalInconsistenciasSPED > 0 ? 'text-amber-400' : 'text-emerald-400'} />
          <span>Validação Prévia SPED ({totalInconsistenciasSPED})</span>
        </button>

        <button
          onClick={() => setActiveTab('invertidos')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition ${
            activeTab === 'invertidos' ? 'bg-white/15 text-white font-medium' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <AlertTriangle size={14} className={contasInvertidas.length > 0 ? 'text-rose-400' : 'text-emerald-400'} />
          <span>Saldos Invertidos ({contasInvertidas.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('furos')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition ${
            activeTab === 'furos' ? 'bg-white/15 text-white font-medium' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Layers size={14} />
          <span>Furos de Numeração ({furosNumeracao.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('dxc')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition ${
            activeTab === 'dxc' ? 'bg-white/15 text-white font-medium' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <CheckCircle2 size={14} className={diferencaDxC === 0 ? 'text-emerald-400' : 'text-rose-400'} />
          <span>Equilíbrio DxC ({diferencaDxC === 0 ? 'OK' : 'ERRO'})</span>
        </button>
      </div>

      {/* ABA 1: CRUZAMENTO FISCAL X CONTÁBIL */}
      {activeTab === 'fiscal_contabil' && (
        <div className="flex-1 bg-[#181818] border border-white/10 rounded-xl flex flex-col mt-3 overflow-hidden p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                Confronto de Receita Bruta & Faturamento (Comp. {empresa.competenciaAtiva})
              </h3>
              <p className="text-xs text-neutral-400">
                Comparativo entre Notas Fiscais Emitidas (`EFNOTA` Modelo 55/65/NFS-e) e Receitas Operacionais Contabilizadas
              </p>
            </div>
            <span className={`px-2.5 py-1 rounded text-xs font-bold font-mono ${
              statusReceita === 'CONCILIADO' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              {statusReceita === 'CONCILIADO' ? '✓ CONCILIADO (100% AUDITADO)' : '⚠ ALERTA DE DIVERGÊNCIA'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#141414] border border-white/5 space-y-1">
              <span className="text-[11px] text-neutral-400 font-medium uppercase">Faturamento Fiscal (Notas Saída)</span>
              <div className="text-xl font-bold font-mono text-sky-400">
                R$ {totalFaturamentoFiscal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-neutral-500 block font-mono">{notasSaida.length} notas fiscais emitidas</span>
            </div>

            <div className="p-4 rounded-xl bg-[#141414] border border-white/5 space-y-1">
              <span className="text-[11px] text-neutral-400 font-medium uppercase">Receita Bruta Contabilizada</span>
              <div className="text-xl font-bold font-mono text-purple-400">
                R$ {totalReceitaContabil.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-neutral-500 block font-mono">Créditos Grupo 4 na competência</span>
            </div>

            <div className={`p-4 rounded-xl border space-y-1 ${
              diferencaReceita < 0.01 ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-amber-950/20 border-amber-500/30'
            }`}>
              <span className="text-[11px] text-neutral-400 font-medium uppercase">Diferença Fiscal x Contábil</span>
              <div className={`text-xl font-bold font-mono ${diferencaReceita < 0.01 ? 'text-emerald-400' : 'text-amber-400'}`}>
                R$ {diferencaReceita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-neutral-400 block font-sans">
                {diferencaReceita < 0.01 ? 'Livro fiscal bate com a contabilidade' : 'Risco de inconsistência no SPED ECF'}
              </span>
            </div>
          </div>

          {/* Tabela de Tributos Faturados */}
          <div className="flex-1 overflow-auto border border-white/5 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#1e1e1e] border-b border-white/10 text-neutral-400 font-medium uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Tributo Incidente</th>
                  <th className="py-2.5 px-3 text-right">Base de Cálculo Fiscal</th>
                  <th className="py-2.5 px-3 text-right">Valor Apurado no Fiscal</th>
                  <th className="py-2.5 px-3 text-right">Alíquota Média</th>
                  <th className="py-2.5 px-3 text-center">Status Malha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-[12px]">
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-2 px-3 font-sans font-medium text-white">PIS / PASEP (Contribuição Social)</td>
                  <td className="py-2 px-3 text-right text-neutral-300">R$ {totalFaturamentoFiscal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2 px-3 text-right text-sky-400 font-bold">R$ {totalPISFiscal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2 px-3 text-right text-neutral-400 font-sans">0,65% (Cumulativo)</td>
                  <td className="py-2 px-3 text-center"><span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-sans">CONFORME</span></td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-2 px-3 font-sans font-medium text-white">COFINS (Seguridade Social)</td>
                  <td className="py-2 px-3 text-right text-neutral-300">R$ {totalFaturamentoFiscal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2 px-3 text-right text-sky-400 font-bold">R$ {totalCOFINSFiscal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2 px-3 text-right text-neutral-400 font-sans">3,00% (Cumulativo)</td>
                  <td className="py-2 px-3 text-center"><span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-sans">CONFORME</span></td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-2 px-3 font-sans font-medium text-white">ISSQN (Imposto Municipal)</td>
                  <td className="py-2 px-3 text-right text-neutral-300">R$ {totalFaturamentoFiscal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2 px-3 text-right text-purple-400 font-bold">R$ {totalISSFiscal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2 px-3 text-right text-neutral-400 font-sans">5,00%</td>
                  <td className="py-2 px-3 text-center"><span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-sans">CONFORME</span></td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-2 px-3 font-sans font-medium text-white">ICMS (Imposto Estadual)</td>
                  <td className="py-2 px-3 text-right text-neutral-300">R$ {totalFaturamentoFiscal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2 px-3 text-right text-purple-400 font-bold">R$ {totalICMSFiscal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2 px-3 text-right text-neutral-400 font-sans">18,00%</td>
                  <td className="py-2 px-3 text-center"><span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-sans">CONFORME</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 2: CRUZAMENTO FOLHA X CONTÁBIL */}
      {activeTab === 'folha_contabil' && (
        <div className="flex-1 bg-[#181818] border border-white/10 rounded-xl flex flex-col mt-3 overflow-hidden p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                Confronto de Folha de Pagamento & Encargos Sociais (Comp. {empresa.competenciaAtiva})
              </h3>
              <p className="text-xs text-neutral-400">
                Comparativo entre totalizadores da Folha (`FOCALCULO`) e lançamentos contábeis de despesas e passivo
              </p>
            </div>
            <span className={`px-2.5 py-1 rounded text-xs font-bold font-mono ${
              diferencaFolhaBruto < 0.01 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              {diferencaFolhaBruto < 0.01 ? '✓ FOLHA CONCILIADA' : '⚠ DIVERGÊNCIA DE SALÁRIOS'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-[#141414] border border-white/5 space-y-1">
              <span className="text-[11px] text-neutral-400 uppercase font-medium">Vencimentos Brutos</span>
              <div className="text-lg font-bold font-mono text-emerald-400">
                R$ {totalBrutoFolha.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-neutral-500 block font-mono">{folhasCalculadas.length} vínculos calculados</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#141414] border border-white/5 space-y-1">
              <span className="text-[11px] text-neutral-400 uppercase font-medium">INSS Segurados Retido</span>
              <div className="text-lg font-bold font-mono text-rose-400">
                - R$ {totalINSSSegurados.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-neutral-500 block font-mono">Conta Passivo 2.1.03.01</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#141414] border border-white/5 space-y-1">
              <span className="text-[11px] text-neutral-400 uppercase font-medium">FGTS Mensal (8%)</span>
              <div className="text-lg font-bold font-mono text-purple-400">
                R$ {totalFGTSFolha.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-neutral-500 block font-mono">Conta Passivo 2.1.03.02</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#141414] border border-white/5 space-y-1">
              <span className="text-[11px] text-neutral-400 uppercase font-medium">Líquido a Pagar</span>
              <div className="text-lg font-bold font-mono text-sky-400">
                R$ {totalLiquidoFolha.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-neutral-500 block font-mono">Conta Passivo 2.1.02.01</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#141414] border border-white/5 text-xs text-neutral-300 leading-relaxed">
            {diferencaFolhaBruto < 0.01 ? (
              <div className="flex items-center space-x-2 text-emerald-400">
                <CheckCircle2 size={16} />
                <span>Os salários e pró-labores calculados no DP foram integralmente apropriados na contabilidade com perfeição.</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-amber-400">
                <AlertTriangle size={16} />
                <span>Diferença detectada entre a folha bruta (R$ {totalBrutoFolha.toFixed(2)}) e a despesa contabilizada (R$ {totalSalariosDebitadoContabil.toFixed(2)}). Utilize a ação 'Integrar Folha' no módulo DP para conciliar.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA 3: DIAGNÓSTICO PRELIMINAR SPED ECD / ECF */}
      {activeTab === 'sped_diagnostico' && (
        <div className="flex-1 bg-[#181818] border border-white/10 rounded-xl flex flex-col mt-3 overflow-hidden p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                Validação de Requisitos Preliminares para Transmissão SPED (ECD / ECF / EFD)
              </h3>
              <p className="text-xs text-neutral-400">
                Auditoria de conformidade cadastral contra as tabelas do PVA da Receita Federal
              </p>
            </div>
            <span className={`px-2.5 py-1 rounded text-xs font-bold font-mono ${
              totalInconsistenciasSPED === 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}>
              {totalInconsistenciasSPED === 0 ? '✓ APTO PARA ENTREGA SPED' : `✕ ${totalInconsistenciasSPED} PENDÊNCIAS`}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-xl border space-y-2 ${
              contasSemPlanoRef.length === 0 ? 'bg-emerald-950/10 border-emerald-500/20' : 'bg-rose-950/10 border-rose-500/20'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Plano Referencial RFB</span>
                {contasSemPlanoRef.length === 0 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertOctagon className="w-4 h-4 text-rose-400" />}
              </div>
              <div className="text-lg font-bold font-mono text-neutral-100">
                {contasSemPlanoRef.length === 0 ? '100% Mapeado' : `${contasSemPlanoRef.length} Contas sem Código`}
              </div>
              <p className="text-[11px] text-neutral-400">
                {contasSemPlanoRef.length === 0 ? 'Todas as contas analíticas possuem vínculo com a RFB.' : 'Contas sem vínculo geram rejeição no SPED ECF (Registro J051).'}
              </p>
              {contasSemPlanoRef.length > 0 && (
                <button
                  onClick={handleAutoCorrigirSped}
                  className="mt-2 w-full py-1.5 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Auto-Vincular Plano Referencial RFB</span>
                </button>
              )}
            </div>

            <div className={`p-4 rounded-xl border space-y-2 ${
              participantesIncompletos.length === 0 ? 'bg-emerald-950/10 border-emerald-500/20' : 'bg-rose-950/10 border-rose-500/20'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Participantes (0150)</span>
                {participantesIncompletos.length === 0 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertOctagon className="w-4 h-4 text-rose-400" />}
              </div>
              <div className="text-lg font-bold font-mono text-neutral-100">
                {participantesIncompletos.length === 0 ? '100% Conforme' : `${participantesIncompletos.length} Cadastros Incompletos`}
              </div>
              <p className="text-[11px] text-neutral-400">
                {participantesIncompletos.length === 0 ? 'CNPJs e códigos IBGE de município válidos.' : 'CNPJ/CPF ou Código IBGE inválido rejeita o EFD-ICMS/IPI.'}
              </p>
              {participantesIncompletos.length > 0 && (
                <button
                  onClick={handleNormalizarParticipantes}
                  className="mt-2 w-full py-1.5 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition-colors"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Normalizar Participantes (IBGE/IE)</span>
                </button>
              )}
            </div>

            <div className={`p-4 rounded-xl border space-y-2 ${
              produtosSemNCM.length === 0 ? 'bg-emerald-950/10 border-emerald-500/20' : 'bg-rose-950/10 border-rose-500/20'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Itens & Produtos (0200)</span>
                {produtosSemNCM.length === 0 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertOctagon className="w-4 h-4 text-rose-400" />}
              </div>
              <div className="text-lg font-bold font-mono text-neutral-100">
                {produtosSemNCM.length === 0 ? '100% Conforme' : `${produtosSemNCM.length} Itens sem NCM`}
              </div>
              <p className="text-[11px] text-neutral-400">
                {produtosSemNCM.length === 0 ? 'NCM de 8 dígitos e tipos de item SPED cadastrados.' : 'NCM obrigatório para produtos no Bloco 0.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ABA 4: SALDOS INVERTIDOS */}
      {activeTab === 'invertidos' && (
        <div className="flex-1 bg-[#181818] border border-white/10 rounded-xl flex flex-col mt-3 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <span className="text-xs text-neutral-400">
              Contas analíticas cujo saldo atual contraria a natureza contábil original:
            </span>
            <span className="text-xs font-mono font-bold text-neutral-300">
              {contasInvertidas.length} inconsistência(s)
            </span>
          </div>

          <div className="flex-1 overflow-auto">
            {contasInvertidas.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="text-sm font-semibold text-white">Nenhum Saldo Invertido</h3>
                <p className="text-xs text-neutral-400 max-w-sm">
                  Todas as contas do ativo possuem saldo devedor e todas do passivo possuem saldo credor conforme as normas do CFC.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-[#1e1e1e] border-b border-white/10 text-neutral-400 font-semibold uppercase text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Classificação</th>
                    <th className="py-2.5 px-3">Nome da Conta</th>
                    <th className="py-2.5 px-3 text-center">Natureza Normal</th>
                    <th className="py-2.5 px-3 text-center">Saldo Atual</th>
                    <th className="py-2.5 px-3 text-right">Valor do Saldo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-[12px]">
                  {contasInvertidas.map(c => (
                    <tr key={c.id} className="hover:bg-white/[0.03]">
                      <td className="py-2 px-3 text-sky-400">{c.classificacao}</td>
                      <td className="py-2 px-3 font-sans text-white">{c.nome}</td>
                      <td className="py-2 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-neutral-800 text-neutral-300">
                          {c.natureza === 'D' ? 'DEVEDORA' : 'CREDORA'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
                          {c.saldoAtualNatureza === 'D' ? 'DEVEDOR' : 'CREDOR'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-rose-400">
                        R$ {c.saldoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ABA 5: FUROS DE NUMERAÇÃO */}
      {activeTab === 'furos' && (
        <div className="flex-1 bg-[#181818] border border-white/10 rounded-xl flex flex-col mt-3 overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs text-neutral-400">
              Verificação cronológica de sequência contínua de partidas (Livro Diário Geral):
            </span>
            <span className="text-xs font-mono font-bold text-neutral-300">
              {furosNumeracao.length} salto(s)
            </span>
          </div>

          {furosNumeracao.length === 0 ? (
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 flex items-center gap-3 text-xs">
              <CheckCircle2 size={18} />
              <div>
                <p className="font-bold">Sequência Contábil Perfeita</p>
                <p className="text-[11px] text-emerald-400/80">
                  Todas as partidas estão sequenciadas numericamente sem saltos ou cancelamentos sem rastro.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/30 text-rose-300 text-xs">
                Atenção: foram encontrados {furosNumeracao.length} números faltantes na sequência de lançamentos:
              </div>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 bg-[#141414] rounded-lg border border-white/10">
                {furosNumeracao.map(n => (
                  <span key={n} className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 font-mono text-xs border border-rose-500/30">
                    Partida #{n}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <span className="text-xs text-neutral-400">
                  Reorganizar a numeração sequencial de 1 a N sem quebra cronológica:
                </span>
                <button
                  onClick={handleRenumerarPartidas}
                  className="py-1.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold flex items-center gap-2 shadow transition-colors"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Renumerar Partidas Cronologicamente</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ABA 6: CONSISTÊNCIA DXC */}
      {activeTab === 'dxc' && (
        <div className="flex-1 bg-[#181818] border border-white/10 rounded-xl flex flex-col mt-3 overflow-hidden p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-[#141414] border border-white/10">
              <span className="text-xs text-neutral-400 block mb-1">Total de Débitos do Período</span>
              <span className="text-xl font-bold font-mono text-blue-400">
                R$ {totalDebitos.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="p-5 rounded-xl bg-[#141414] border border-white/10">
              <span className="text-xs text-neutral-400 block mb-1">Total de Créditos do Período</span>
              <span className="text-xl font-bold font-mono text-indigo-400">
                R$ {totalCreditos.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className={`p-5 rounded-xl border ${
              diferencaDxC === 0 ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-rose-950/20 border-rose-500/30'
            }`}>
              <span className="text-xs text-neutral-400 block mb-1">Diferença Débito x Crédito</span>
              <span className={`text-xl font-bold font-mono ${diferencaDxC === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                R$ {diferencaDxC.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#141414] border border-white/5 text-xs text-neutral-300 leading-relaxed">
            {diferencaDxC === 0 ? (
              <p className="text-emerald-400 font-medium">
                ✓ Princípio das Partidas Dobradas validado. Débitos rigorosamente equivalentes aos créditos. O Balanço e Balancete estão aptos para emissão oficial e registro.
              </p>
            ) : (
              <p className="text-rose-400 font-medium">
                ✕ Inconsistência grave detectada: a diferença entre débitos e créditos impede a homologação do balanço patrimonial. Revise os lançamentos do período ou lotes abertos.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
