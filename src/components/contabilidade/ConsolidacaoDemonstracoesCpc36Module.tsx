import React, { useState, useEffect } from 'react';
import {
  Layers,
  Building,
  Building2,
  PieChart,
  Table,
  PlusCircle,
  FileText,
  Printer,
  CheckCircle2,
  AlertTriangle,
  ArrowRightLeft,
  DollarSign,
  TrendingUp,
  Percent,
  Calendar,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  DemonstracaoConsolidadaCpc36,
  LancamentoEliminacaoIntercompany,
  TipoEliminacaoConsolidacao,
  LinhaDemonstrativoConsolidado
} from '../../types/contabil';

interface ConsolidacaoProps {
  empresaId?: number;
}

export const ConsolidacaoDemonstracoesCpc36Module: React.FC<ConsolidacaoProps> = ({ empresaId = 1 }) => {
  const [exercicio, setExercicio] = useState<string>('2026');
  const [activeTab, setActiveTab] = useState<'BALANCO' | 'DRE' | 'ELIMINACOES' | 'EMPRESAS' | 'LAUDO_A4'>('BALANCO');
  const [consolidacao, setConsolidacao] = useState<DemonstracaoConsolidadaCpc36 | null>(null);
  const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'info'; texto: string } | null>(null);

  // Form de nova eliminação
  const [showNovaEliminacao, setShowNovaEliminacao] = useState<boolean>(false);
  const [novaEliminacao, setNovaEliminacao] = useState<Partial<LancamentoEliminacaoIntercompany>>({
    tipoEliminacao: '1_SALDO_RECIPROCO_MUTUO',
    descricao: 'Eliminação de Mútuo Financeiro entre Matriz e Filial/Controlada',
    empresaOrigemId: 1,
    empresaDestinoId: 2,
    contaDebitoConsolidado: '2.01.03.01',
    contaCreditoConsolidado: '1.01.03.01',
    valorBRL: 250000
  });

  const carregarDados = () => {
    const dados = dbService.getConsolidacaoCpc36(empresaId, exercicio);
    setConsolidacao(dados);
  };

  useEffect(() => {
    carregarDados();
  }, [empresaId, exercicio]);

  const handleLancarEliminacao = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `elim-${Date.now()}`;
    const eliminacao: LancamentoEliminacaoIntercompany = {
      ...(novaEliminacao as LancamentoEliminacaoIntercompany),
      id,
      valorBRL: Number(novaEliminacao.valorBRL) || 0
    };

    const res = dbService.lancarEliminacaoConsolidacao(empresaId, exercicio, eliminacao);
    if (res.sucesso) {
      setFeedback({ tipo: 'sucesso', texto: res.mensagem });
      setShowNovaEliminacao(false);
      carregarDados();
    }
  };

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getTipoEliminacaoLabel = (tipo: TipoEliminacaoConsolidacao) => {
    switch (tipo) {
      case '1_SALDO_RECIPROCO_MUTUO': return 'Mútuos e Financiamentos Recíprocos';
      case '2_SALDO_RECIPROCO_CLIENTES_FORNECEDORES': return 'Clientes vs Fornecedores Intercompany';
      case '3_RECEITA_DESPESA_RECIPROCA': return 'Vendas e Compras Recíprocas';
      case '4_LUCRO_NAO_REALIZADO_ESTOQUE': return 'Lucros Não Realizados em Estoques';
      case '5_INVESTIMENTO_PL_CONTROLADA': return 'Investimento da Controladora vs PL da Controlada';
      default: return tipo;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#121212] text-gray-200 p-4 space-y-4 overflow-y-auto">
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-[#262626] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                Consolidação de Demonstrações Contábeis (CPC 36 R3)
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                  NBC TG 36 / Art. 249 Lei 6.404/76
                </span>
              </h1>
              <p className="text-xs text-gray-400">
                Planilhas de trabalho consolidadas, matriz de eliminações intercompany e evidenciação de Participação dos Não Controladores
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#181818] border border-[#262626] px-2.5 py-1.5 rounded">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-400">Exercício Social:</span>
            <input
              type="text"
              value={exercicio}
              onChange={(e) => setExercicio(e.target.value)}
              className="bg-transparent text-xs text-white border-0 focus:outline-none font-bold w-16"
            />
          </div>

          <button
            onClick={() => setShowNovaEliminacao(true)}
            className="px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Lançar Eliminação
          </button>
        </div>
      </div>

      {/* FEEDBACK BANNER */}
      {feedback && (
        <div className="flex items-center justify-between bg-emerald-950/60 border border-emerald-700/50 text-emerald-200 px-4 py-2.5 rounded text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedback.texto}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-gray-400 hover:text-white font-mono text-xs ml-4">
            ×
          </button>
        </div>
      )}

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-[#181818] border border-[#262626] p-3 rounded flex items-center justify-between">
          <div>
            <div className="text-[10px] text-gray-400 uppercase font-semibold">Ativo Consolidado</div>
            <div className="text-xl font-bold text-white mt-0.5">
              {formatBRL(consolidacao?.totalAtivoConsolidadoBRL || 0)}
            </div>
            <div className="text-[10px] text-emerald-400 mt-0.5">Líquido de Eliminações</div>
          </div>
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
            <Building className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-[#181818] border border-[#262626] p-3 rounded flex items-center justify-between">
          <div>
            <div className="text-[10px] text-gray-400 uppercase font-semibold">Passivo Consolidado</div>
            <div className="text-xl font-bold text-amber-400 mt-0.5">
              {formatBRL(consolidacao?.totalPassivoConsolidadoBRL || 0)}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">Exigível com Terceiros</div>
          </div>
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-[#181818] border border-[#262626] p-3 rounded flex items-center justify-between">
          <div>
            <div className="text-[10px] text-gray-400 uppercase font-semibold">PL Consolidado</div>
            <div className="text-xl font-bold text-sky-400 mt-0.5">
              {formatBRL(consolidacao?.totalPlConsolidadoBRL || 0)}
            </div>
            <div className="text-[10px] text-sky-400/80 mt-0.5">Grupo Societário</div>
          </div>
          <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-lg border border-sky-500/20">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-[#181818] border border-[#262626] p-3 rounded flex items-center justify-between">
          <div>
            <div className="text-[10px] text-gray-400 uppercase font-semibold">Não Controladores</div>
            <div className="text-xl font-bold text-purple-400 mt-0.5">
              {formatBRL(consolidacao?.participacaoNaoControladoresBRL || 0)}
            </div>
            <div className="text-[10px] text-purple-400/80 mt-0.5">Minority Interest (CPC 36)</div>
          </div>
          <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
            <PieChart className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-[#181818] border border-[#262626] p-3 rounded flex items-center justify-between">
          <div>
            <div className="text-[10px] text-gray-400 uppercase font-semibold">Lucro Líquido Consolidado</div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">
              {formatBRL(consolidacao?.lucroLiquidoConsolidadoBRL || 0)}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">Controlador: {formatBRL(consolidacao?.lucroAtribuivelControladoresBRL || 0)}</div>
          </div>
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
            <Percent className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* NAVEGAÇÃO DE ABAS */}
      <div className="flex border-b border-[#262626] gap-2">
        <button
          onClick={() => setActiveTab('BALANCO')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'BALANCO'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Table className="w-3.5 h-3.5" />
          Planilha de Balanço Consolidado
        </button>

        <button
          onClick={() => setActiveTab('DRE')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'DRE'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          DRE Consolidada
        </button>

        <button
          onClick={() => setActiveTab('ELIMINACOES')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'ELIMINACOES'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          Matriz de Eliminações ({consolidacao?.eliminacoes.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('EMPRESAS')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'EMPRESAS'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          Entidades do Grupo ({consolidacao?.empresas.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('LAUDO_A4')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'LAUDO_A4'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Printer className="w-3.5 h-3.5" />
          Demonstrativo Oficial Consolidado (A4)
        </button>
      </div>

      {/* MODAL / FORM DE NOVA ELIMINAÇÃO */}
      {showNovaEliminacao && (
        <form onSubmit={handleLancarEliminacao} className="bg-[#1a1a1a] border border-emerald-500/40 p-4 rounded space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#333]">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
              Lançar Eliminação Intercompany de Consolidação
            </h3>
            <button
              type="button"
              onClick={() => setShowNovaEliminacao(false)}
              className="text-gray-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Tipo de Eliminação</label>
              <select
                value={novaEliminacao.tipoEliminacao}
                onChange={(e) => setNovaEliminacao({ ...novaEliminacao, tipoEliminacao: e.target.value as TipoEliminacaoConsolidacao })}
                className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-white"
              >
                <option value="1_SALDO_RECIPROCO_MUTUO">1 - Mútuos e Financiamentos Recíprocos</option>
                <option value="2_SALDO_RECIPROCO_CLIENTES_FORNECEDORES">2 - Clientes vs Fornecedores</option>
                <option value="3_RECEITA_DESPESA_RECIPROCA">3 - Vendas e Compras Recíprocas</option>
                <option value="4_LUCRO_NAO_REALIZADO_ESTOQUE">4 - Lucro Não Realizado em Estoque</option>
                <option value="5_INVESTIMENTO_PL_CONTROLADA">5 - Investimento Controladora vs PL</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Valor da Eliminação (R$)</label>
              <input
                type="number"
                step="0.01"
                value={novaEliminacao.valorBRL || ''}
                onChange={(e) => setNovaEliminacao({ ...novaEliminacao, valorBRL: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-white font-mono"
                required
              />
            </div>
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Descrição / Histórico</label>
              <input
                type="text"
                value={novaEliminacao.descricao || ''}
                onChange={(e) => setNovaEliminacao({ ...novaEliminacao, descricao: e.target.value })}
                className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Conta a Debitar na Consolidação</label>
              <input
                type="text"
                value={novaEliminacao.contaDebitoConsolidado || ''}
                onChange={(e) => setNovaEliminacao({ ...novaEliminacao, contaDebitoConsolidado: e.target.value })}
                className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-white font-mono"
                placeholder="Ex: 2.01.03.01"
                required
              />
            </div>
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Conta a Creditar na Consolidação</label>
              <input
                type="text"
                value={novaEliminacao.contaCreditoConsolidado || ''}
                onChange={(e) => setNovaEliminacao({ ...novaEliminacao, contaCreditoConsolidado: e.target.value })}
                className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-white font-mono"
                placeholder="Ex: 1.01.03.01"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowNovaEliminacao(false)}
              className="px-3 py-1 bg-[#252525] hover:bg-[#333] text-gray-300 rounded text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold"
            >
              Confirmar Lançamento
            </button>
          </div>
        </form>
      )}

      {/* ABA: PLANILHA DE BALANÇO CONSOLIDADO */}
      {activeTab === 'BALANCO' && (
        <div className="space-y-3">
          <div className="bg-[#181818] border border-[#262626] rounded overflow-hidden">
            <div className="p-3 bg-[#202020] border-b border-[#262626] flex justify-between items-center">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Planilha de Consolidação - Balanço Patrimonial (Exercício {exercicio})
              </span>
              <span className="text-[11px] text-gray-400">Valores expressos em Reais (R$)</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1a1a1a] text-gray-400 uppercase text-[10px] font-semibold border-b border-[#262626]">
                  <tr>
                    <th className="py-2 px-3">Código</th>
                    <th className="py-2 px-3">Descrição da Conta</th>
                    <th className="py-2 px-3 text-right">Matriz (100%)</th>
                    <th className="py-2 px-3 text-right">Beta Particip.</th>
                    <th className="py-2 px-3 text-right">Soma Indiv.</th>
                    <th className="py-2 px-3 text-right text-rose-400">Débito Elim.</th>
                    <th className="py-2 px-3 text-right text-emerald-400">Crédito Elim.</th>
                    <th className="py-2 px-3 text-right font-bold text-white">Saldo Consolidado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262626]">
                  {consolidacao?.linhasBalanco.map((l, i) => {
                    const isTotalizador = l.contaCodigo.length <= 4;
                    return (
                      <tr
                        key={i}
                        className={`hover:bg-[#202020] transition-colors ${
                          isTotalizador ? 'bg-[#1e1e1e] font-bold text-white' : 'text-gray-300'
                        }`}
                      >
                        <td className="py-2 px-3 font-mono text-[11px]">{l.contaCodigo}</td>
                        <td className="py-2 px-3">{l.contaDescricao}</td>
                        <td className="py-2 px-3 text-right font-mono">{formatBRL(l.saldoMatrizBRL)}</td>
                        <td className="py-2 px-3 text-right font-mono">{formatBRL(l.saldoControlada1BRL)}</td>
                        <td className="py-2 px-3 text-right font-mono text-gray-400">{formatBRL(l.somaIndividualBRL)}</td>
                        <td className="py-2 px-3 text-right font-mono text-rose-400">
                          {l.debitosEliminacaoBRL > 0 ? formatBRL(l.debitosEliminacaoBRL) : '-'}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-emerald-400">
                          {l.creditosEliminacaoBRL > 0 ? formatBRL(l.creditosEliminacaoBRL) : '-'}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-white">
                          {formatBRL(l.saldoConsolidadoFinalBRL)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ABA: DRE CONSOLIDADA */}
      {activeTab === 'DRE' && (
        <div className="space-y-3">
          <div className="bg-[#181818] border border-[#262626] rounded overflow-hidden">
            <div className="p-3 bg-[#202020] border-b border-[#262626] flex justify-between items-center">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Planilha de Consolidação - Demonstração do Resultado (Exercício {exercicio})
              </span>
              <span className="text-[11px] text-gray-400">Valores expressos em Reais (R$)</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1a1a1a] text-gray-400 uppercase text-[10px] font-semibold border-b border-[#262626]">
                  <tr>
                    <th className="py-2 px-3">Código</th>
                    <th className="py-2 px-3">Descrição da Linha</th>
                    <th className="py-2 px-3 text-right">Matriz (100%)</th>
                    <th className="py-2 px-3 text-right">Beta Particip.</th>
                    <th className="py-2 px-3 text-right">Soma Indiv.</th>
                    <th className="py-2 px-3 text-right text-rose-400">Eliminações</th>
                    <th className="py-2 px-3 text-right font-bold text-white">Resultado Consolidado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262626]">
                  {consolidacao?.linhasDre.map((l, i) => {
                    const isTotalizador = l.contaCodigo.length <= 4;
                    return (
                      <tr
                        key={i}
                        className={`hover:bg-[#202020] transition-colors ${
                          isTotalizador ? 'bg-[#1e1e1e] font-bold text-white' : 'text-gray-300'
                        }`}
                      >
                        <td className="py-2 px-3 font-mono text-[11px]">{l.contaCodigo}</td>
                        <td className="py-2 px-3">{l.contaDescricao}</td>
                        <td className="py-2 px-3 text-right font-mono">{formatBRL(l.saldoMatrizBRL)}</td>
                        <td className="py-2 px-3 text-right font-mono">{formatBRL(l.saldoControlada1BRL)}</td>
                        <td className="py-2 px-3 text-right font-mono text-gray-400">{formatBRL(l.somaIndividualBRL)}</td>
                        <td className="py-2 px-3 text-right font-mono text-rose-400">
                          {l.debitosEliminacaoBRL > 0 || l.creditosEliminacaoBRL > 0
                            ? formatBRL(l.debitosEliminacaoBRL || l.creditosEliminacaoBRL)
                            : '-'}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-white">
                          {formatBRL(l.saldoConsolidadoFinalBRL)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ABA: MATRIZ DE ELIMINAÇÕES */}
      {activeTab === 'ELIMINACOES' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
              Lançamentos de Eliminações Intercompany Registrados
            </h2>
            <div className="text-xs text-gray-400 font-mono">
              Total Eliminado: {formatBRL(consolidacao?.eliminacoes.reduce((a, b) => a + b.valorBRL, 0) || 0)}
            </div>
          </div>

          <div className="bg-[#181818] border border-[#262626] rounded overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#202020] text-gray-400 uppercase text-[10px] font-semibold border-b border-[#262626]">
                <tr>
                  <th className="py-2.5 px-3">Natureza da Eliminação</th>
                  <th className="py-2.5 px-3">Descrição / Histórico</th>
                  <th className="py-2.5 px-3">Débito Consolidado</th>
                  <th className="py-2.5 px-3">Crédito Consolidado</th>
                  <th className="py-2.5 px-3 text-right">Valor Eliminado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {consolidacao?.eliminacoes.map((e) => (
                  <tr key={e.id} className="hover:bg-[#202020] transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-emerald-400">
                      {getTipoEliminacaoLabel(e.tipoEliminacao)}
                    </td>
                    <td className="py-2.5 px-3 text-white">{e.descricao}</td>
                    <td className="py-2.5 px-3 font-mono text-gray-300">{e.contaDebitoConsolidado}</td>
                    <td className="py-2.5 px-3 font-mono text-gray-300">{e.contaCreditoConsolidado}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-400">
                      {formatBRL(e.valorBRL)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA: ENTIDADES DO GRUPO */}
      {activeTab === 'EMPRESAS' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {consolidacao?.empresas.map((emp) => (
              <div key={emp.empresaId} className="bg-[#181818] border border-[#262626] p-4 rounded space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#262626]">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h3 className="text-xs font-bold text-white">{emp.razaoSocial}</h3>
                      <span className="text-[10px] text-gray-400 font-mono">CNPJ: {emp.cnpj}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    emp.papel === 'CONTROLADORA_MATRIZ'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                  }`}>
                    {emp.papel.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 block">Participação no Capital:</span>
                    <span className="text-sm font-bold text-white font-mono">{emp.percentualParticipacao}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block">Método de Consolidação:</span>
                    <span className="text-xs font-semibold text-gray-300">Consolidação Integral (Global)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA: LAUDO OFICIAL CONSOLIDADO (A4) */}
      {activeTab === 'LAUDO_A4' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-[#181818] p-3 rounded border border-[#262626]">
            <div>
              <span className="text-xs text-gray-400">Demonstrações Contábeis Consolidadas - </span>
              <span className="text-xs font-bold text-white">Exercício Social {exercicio}</span>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir Relatório (A4)
            </button>
          </div>

          <div className="bg-white text-black p-8 rounded shadow-2xl max-w-4xl mx-auto space-y-6 print:m-0 print:p-0 font-serif">
            {/* CABEÇALHO */}
            <div className="border-b-2 border-black pb-4 text-center space-y-1">
              <div className="font-extrabold text-base uppercase tracking-wider">
                CONTABIL STUDIO PRO BRASIL S.A. E CONTROLADAS
              </div>
              <div className="font-bold text-xs uppercase text-gray-800">
                DEMONSTRAÇÕES CONTÁBEIS CONSOLIDADAS • EXERCÍCIO SOCIAL FINDO EM 31 DE DEZEMBRO DE {exercicio}
              </div>
              <div className="text-[10px] font-sans text-gray-600">
                Elaboradas de acordo com as Práticas Contábeis Adotadas no Brasil (CPC 36 R3 / NBC TG 36 / Lei 6.404/76)
              </div>
            </div>

            {/* BALANÇO CONSOLIDADO CONDENSADO */}
            <div className="space-y-2">
              <div className="font-bold text-xs uppercase border-b border-black pb-1">
                1. BALANÇO PATRIMONIAL CONSOLIDADO (R$ MILHARES)
              </div>
              <div className="grid grid-cols-2 gap-4 font-sans text-xs">
                {/* ATIVO */}
                <div className="border border-black p-2 space-y-1">
                  <div className="font-bold border-b border-gray-400 pb-0.5">ATIVO</div>
                  <div className="flex justify-between">
                    <span>Ativo Circulante</span>
                    <span className="font-mono font-semibold">10.720</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ativo Não Circulante (Imobilizado/Intangível)</span>
                    <span className="font-mono font-semibold">15.000</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-black pt-1">
                    <span>TOTAL DO ATIVO CONSOLIDADO</span>
                    <span className="font-mono">{formatBRL(consolidacao?.totalAtivoConsolidadoBRL || 0)}</span>
                  </div>
                </div>

                {/* PASSIVO E PL */}
                <div className="border border-black p-2 space-y-1">
                  <div className="font-bold border-b border-gray-400 pb-0.5">PASSIVO E PATRIMÔNIO LÍQUIDO</div>
                  <div className="flex justify-between">
                    <span>Passivo Circulante (Fornecedores/Obrigações)</span>
                    <span className="font-mono font-semibold">5.840</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Passivo Não Circulante (Empréstimos LP)</span>
                    <span className="font-mono font-semibold">3.800</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Patrimônio Líquido dos Controladores</span>
                    <span className="font-mono font-semibold">13.600</span>
                  </div>
                  <div className="flex justify-between text-purple-900 font-semibold">
                    <span>Participação dos Não Controladores</span>
                    <span className="font-mono font-semibold">{formatBRL(consolidacao?.participacaoNaoControladoresBRL || 0)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-black pt-1">
                    <span>TOTAL DO PASSIVO E PL</span>
                    <span className="font-mono">{formatBRL(consolidacao?.totalAtivoConsolidadoBRL || 0)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* DRE CONSOLIDADA CONDENSADA */}
            <div className="space-y-2">
              <div className="font-bold text-xs uppercase border-b border-black pb-1">
                2. DEMONSTRAÇÃO DO RESULTADO CONSOLIDADA (R$ MILHARES)
              </div>
              <div className="border border-black p-3 font-sans text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span>Receita Operacional Líquida Consolidada</span>
                  <span className="font-mono font-semibold">18.700.000,00</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>(-) Custo dos Produtos e Serviços Vendidos</span>
                  <span className="font-mono font-semibold">(11.200.000,00)</span>
                </div>
                <div className="flex justify-between font-bold border-t border-gray-300 pt-0.5">
                  <span>(=) Lucro Bruto Consolidado</span>
                  <span className="font-mono">7.500.000,00</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>(-) Despesas Operacionais e Administrativas</span>
                  <span className="font-mono font-semibold">(2.950.000,00)</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Resultado Financeiro Líquido</span>
                  <span className="font-mono font-semibold">(900.000,00)</span>
                </div>
                <div className="flex justify-between font-bold border-t-2 border-black pt-1 text-sm bg-emerald-50 p-1">
                  <span>LUCRO LÍQUIDO CONSOLIDADO DO EXERCÍCIO</span>
                  <span className="font-mono">{formatBRL(consolidacao?.lucroLiquidoConsolidadoBRL || 0)}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2 text-[11px] text-gray-800">
                  <div className="border border-gray-300 p-1.5 rounded">
                    <span className="block text-[10px] text-gray-600">Atribuível aos Acionistas Controladores:</span>
                    <span className="font-mono font-bold">{formatBRL(consolidacao?.lucroAtribuivelControladoresBRL || 0)} (86,8%)</span>
                  </div>
                  <div className="border border-gray-300 p-1.5 rounded">
                    <span className="block text-[10px] text-gray-600">Atribuível aos Não Controladores:</span>
                    <span className="font-mono font-bold">{formatBRL(consolidacao?.lucroAtribuivelNaoControladoresBRL || 0)} (13,2%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* NOTA EXPLICATIVA SOBRE ELIMINAÇÕES */}
            <div className="text-xs leading-relaxed space-y-1.5 text-justify">
              <p>
                <strong>3. NOTAS EXPLICATIVAS À CONSOLIDAÇÃO:</strong> As demonstrações contábeis individuais da Controladora e de sua Subsidiária Integral/Controlada foram consolidadas linha a linha, mediante a soma dos saldos de ativos, passivos, receitas e despesas de natureza semelhante.
              </p>
              <p>
                Foram integralmente eliminados: (a) as participações societárias da Controladora no patrimônio líquido das Controladas; (b) os saldos recíprocos de contas ativas e passivas oriundos de transações intercompany (mútuos, duplicatas mercantis e dividendos a pagar); e (c) as receitas e despesas recíprocas de vendas e serviços, bem como os lucros não realizados em estoques remanescentes no encerramento do exercício.
              </p>
            </div>

            {/* ASSINATURAS */}
            <div className="pt-8 text-xs text-center space-y-8 font-sans">
              <div className="grid grid-cols-2 gap-12 pt-4">
                <div className="border-t border-black pt-1">
                  <div className="font-bold">CARLOS EDUARDO SCHNEIDER</div>
                  <div className="text-[10px] text-gray-600">Diretor-Presidente do Grupo</div>
                </div>
                <div className="border-t border-black pt-1">
                  <div className="font-bold">DR. ROBERTO SILVEIRA BARBOSA</div>
                  <div className="text-[10px] text-gray-600">Contador Responsável - CRC-SP 1SP298451/O-4</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
