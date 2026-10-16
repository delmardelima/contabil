import React, { useState, useEffect } from 'react';
import {
  Network,
  Plus,
  RefreshCw,
  Printer,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  FileText,
  Search,
  Filter,
  Building,
  Scale,
  Percent,
  Layers,
  Edit,
  Trash2,
  GitBranch,
  Split
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  Empresa,
  ParticipacaoSocietariaMep,
  LinhaConsolidacaoDemonstrativo,
  QuadroConsolidacaoMep,
  TipoRelacaoSocietaria
} from '../../types/contabil';

interface ConsolidacaoMepCpc18ModuleProps {
  empresaAtiva: Empresa | null;
  onOpenReportPreview?: (config: {
    titulo: string;
    subtitulo: string;
    conteudoHtml: string;
    imprimirDireto?: boolean;
  }) => void;
}

export const ConsolidacaoMepCpc18Module: React.FC<ConsolidacaoMepCpc18ModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [quadro, setQuadro] = useState<QuadroConsolidacaoMep | null>(null);
  const [busca, setBusca] = useState('');
  const [filtroRelacao, setFiltroRelacao] = useState<string>('TODAS');
  const [abaAtiva, setAbaAtiva] = useState<'mep' | 'consolidacao' | 'normas'>('mep');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ParticipacaoSocietariaMep | null>(null);

  // Form Fields
  const [investidaRazaoSocial, setInvestidaRazaoSocial] = useState('');
  const [investidaCnpj, setInvestidaCnpj] = useState('');
  const [relacao, setRelacao] = useState<TipoRelacaoSocietaria>('CONTROLADA_DIRETA');
  const [percentualParticipacao, setPercentualParticipacao] = useState<number>(60.0);
  const [patrimonioLiquidoInvestida, setPatrimonioLiquidoInvestida] = useState<number>(10000000);
  const [lucroPrejuizoPeriodoInvestida, setLucroPrejuizoPeriodoInvestida] = useState<number>(1500000);
  const [ajustesPlNaoRealizados, setAjustesPlNaoRealizados] = useState<number>(0);
  const [saldoContabilInvestimentoAnterior, setSaldoContabilInvestimentoAnterior] = useState<number>(5500000);
  const [dividendosRecebidosPeriodo, setDividendosRecebidosPeriodo] = useState<number>(200000);
  const [dataApuracao, setDataApuracao] = useState('2026-03-31');
  const [observacoes, setObservacoes] = useState('');

  const carregarDados = () => {
    if (!empresaAtiva) return;
    const q = dbService.getQuadroConsolidacaoMep(empresaAtiva.id);
    setQuadro(q);
  };

  useEffect(() => {
    carregarDados();
  }, [empresaAtiva]);

  const handleOpenNovo = () => {
    setEditingItem(null);
    setInvestidaRazaoSocial('');
    setInvestidaCnpj('');
    setRelacao('CONTROLADA_DIRETA');
    setPercentualParticipacao(60.0);
    setPatrimonioLiquidoInvestida(12000000);
    setLucroPrejuizoPeriodoInvestida(1800000);
    setAjustesPlNaoRealizados(-150000);
    setSaldoContabilInvestimentoAnterior(6500000);
    setDividendosRecebidosPeriodo(250000);
    setDataApuracao(new Date().toISOString().split('T')[0]);
    setObservacoes('');
    setIsModalOpen(true);
  };

  const handleOpenEditar = (item: ParticipacaoSocietariaMep) => {
    setEditingItem(item);
    setInvestidaRazaoSocial(item.investidaRazaoSocial);
    setInvestidaCnpj(item.investidaCnpj);
    setRelacao(item.relacao);
    setPercentualParticipacao(item.percentualParticipacao);
    setPatrimonioLiquidoInvestida(item.patrimonioLiquidoInvestida);
    setLucroPrejuizoPeriodoInvestida(item.lucroPrejuizoPeriodoInvestida);
    setAjustesPlNaoRealizados(item.ajustesPlNaoRealizados);
    setSaldoContabilInvestimentoAnterior(item.saldoContabilInvestimentoAnterior);
    setDividendosRecebidosPeriodo(item.dividendosRecebidosPeriodo);
    setDataApuracao(item.dataApuracao);
    setObservacoes(item.observacoes || '');
    setIsModalOpen(true);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaAtiva) return;

    const plAjust = Math.round((patrimonioLiquidoInvestida + ajustesPlNaoRealizados) * 100) / 100;
    const valMep = Math.round((percentualParticipacao / 100) * plAjust * 100) / 100;
    const rep = Math.round((valMep - saldoContabilInvestimentoAnterior) * 100) / 100;

    const item: ParticipacaoSocietariaMep = {
      id: editingItem ? editingItem.id : Date.now(),
      empresaInvestidoraId: empresaAtiva.id,
      investidaRazaoSocial,
      investidaCnpj,
      relacao,
      percentualParticipacao: Number(percentualParticipacao),
      patrimonioLiquidoInvestida: Number(patrimonioLiquidoInvestida),
      lucroPrejuizoPeriodoInvestida: Number(lucroPrejuizoPeriodoInvestida),
      ajustesPlNaoRealizados: Number(ajustesPlNaoRealizados),
      patrimonioLiquidoAjustado: plAjust,
      valorInvestimentoMepTeorico: valMep,
      saldoContabilInvestimentoAnterior: Number(saldoContabilInvestimentoAnterior),
      resultadoEquivalenciaPatrimonial: rep,
      dividendosRecebidosPeriodo: Number(dividendosRecebidosPeriodo),
      dataApuracao,
      integradoContabil: editingItem ? editingItem.integradoContabil : false,
      observacoes
    };

    dbService.salvarParticipacaoMep(item);
    setIsModalOpen(false);
    carregarDados();
  };

  const handleExcluir = (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta participação societária?')) {
      dbService.excluirParticipacaoMep(id);
      carregarDados();
    }
  };

  const handleIntegrarContabil = (id: number) => {
    const res = dbService.integrarResultadoMepContabil(id);
    alert(res.mensagem);
    carregarDados();
  };

  const handleEmitirConsolidadoA4 = () => {
    if (!onOpenReportPreview || !empresaAtiva || !quadro) return;

    const linhasHtml = quadro.balancoConsolidado
      .map(
        l => `
        <tr style="border-bottom: 1px solid #ddd; ${l.tipoGrupo === 'PATRIMONIO_LIQUIDO' ? 'background-color: #fafafa;' : ''}">
          <td style="padding: 6px; font-family: monospace; font-weight: bold;">${l.codigoConta}</td>
          <td style="padding: 6px;">${l.descricaoConta}</td>
          <td style="padding: 6px; text-align: right; font-family: monospace;">R$ ${l.saldoControladora.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
          <td style="padding: 6px; text-align: right; font-family: monospace;">R$ ${l.saldoControladas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
          <td style="padding: 6px; text-align: right; font-family: monospace; color: #dc2626;">${l.eliminacoesDebito > 0 ? `R$ ${l.eliminacoesDebito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}</td>
          <td style="padding: 6px; text-align: right; font-family: monospace; color: #dc2626;">${l.eliminacoesCredito > 0 ? `R$ ${l.eliminacoesCredito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}</td>
          <td style="padding: 6px; text-align: right; font-family: monospace; font-weight: bold; color: #4338ca;">R$ ${l.saldoConsolidado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        </tr>
      `
      )
      .join('');

    const html = `
      <div style="font-family: Arial, sans-serif; font-size: 10pt; color: #111; line-height: 1.4;">
        <div style="text-align: center; border-bottom: 2px solid #4f46e5; padding-bottom: 12px; margin-bottom: 16px;">
          <h2 style="margin: 0; color: #3730a3; font-size: 14pt; text-transform: uppercase;">
            ${empresaAtiva.razaoSocial} E CONTROLADAS (GRUPO ECONÔMICO)
          </h2>
          <div style="font-size: 8.5pt; color: #555; margin-top: 3px;">
            CNPJ Controladora: ${empresaAtiva.cnpj} | Competência de Consolidação: ${quadro.dataCompetencia}
          </div>
          <h3 style="margin: 10px 0 0 0; color: #111; font-size: 12pt;">
            DEMONSTRAÇÕES CONTÁBEIS CONSOLIDADAS (CPC 36 / CPC 18 / IAS 28)
          </h3>
          <div style="font-size: 8.5pt; color: #4f46e5; font-weight: bold; margin-top: 2px;">
            Balanço Patrimonial Consolidado e Folha de Trabalho de Eliminações Intercompany
          </div>
        </div>

        <div style="margin-bottom: 14px; background-color: #eef2ff; border: 1px solid #c7d2fe; padding: 10px; border-radius: 4px; font-size: 9pt;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="width: 30%; font-weight: bold; color: #3730a3;">Total Investimentos MEP:</td>
              <td style="width: 20%; font-family: monospace; font-weight: bold;">R$ ${quadro.totalInvestimentosColigadas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              <td style="width: 30%; font-weight: bold; color: #3730a3;">Resultado REP no Período:</td>
              <td style="width: 20%; font-family: monospace; font-weight: bold; color: #166534;">+ R$ ${quadro.totalResultadoEquivalencia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #3730a3;">Eliminações Intercompany:</td>
              <td style="font-family: monospace; font-weight: bold; color: #dc2626;">R$ ${quadro.totalEliminacoesIntercompany.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              <td style="font-weight: bold; color: #3730a3;">Investidas Vinculadas:</td>
              <td>${quadro.participacoes.length} Empresas (Controladas e Coligadas)</td>
            </tr>
          </table>
        </div>

        <h4 style="color: #3730a3; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-top: 14px; margin-bottom: 8px; font-size: 10pt;">
          FOLHA DE TRABALHO DE CONSOLIDAÇÃO MULTI-EMPRESA (WORKSHEET)
        </h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 8pt; margin-bottom: 16px;">
          <thead>
            <tr style="background-color: #4338ca; color: white;">
              <th style="padding: 5px; border: 1px solid #4338ca; text-align: left;">Conta</th>
              <th style="padding: 5px; border: 1px solid #4338ca; text-align: left;">Descrição da Rubrica</th>
              <th style="padding: 5px; border: 1px solid #4338ca; text-align: right;">Controladora (R$)</th>
              <th style="padding: 5px; border: 1px solid #4338ca; text-align: right;">Controladas (R$)</th>
              <th style="padding: 5px; border: 1px solid #4338ca; text-align: right;">Eliminações D (R$)</th>
              <th style="padding: 5px; border: 1px solid #4338ca; text-align: right;">Eliminações C (R$)</th>
              <th style="padding: 5px; border: 1px solid #4338ca; text-align: right;">Consolidado (R$)</th>
            </tr>
          </thead>
          <tbody>
            ${linhasHtml}
          </tbody>
        </table>

        <div style="margin-top: 35px; display: flex; justify-content: space-between; text-align: center;">
          <div style="width: 45%;">
            <div style="border-top: 1px solid #333; padding-top: 5px; font-weight: bold; font-size: 9pt;">
              Diretoria Executiva / Relações com Investidores
            </div>
            <div style="font-size: 8pt; color: #555;">
              ${empresaAtiva.razaoSocial}
            </div>
          </div>
          <div style="width: 45%;">
            <div style="border-top: 1px solid #333; padding-top: 5px; font-weight: bold; font-size: 9pt;">
              Contador Responsável Técnico
            </div>
            <div style="font-size: 8pt; color: #555;">
              CRC Oficial Ativo — Demonstrações Consolidadas CPC 36
            </div>
          </div>
        </div>
      </div>
    `;

    onOpenReportPreview({
      titulo: 'DEMONSTRAÇÕES CONTÁBEIS CONSOLIDADAS (CPC 36 / CPC 18)',
      subtitulo: `${empresaAtiva.razaoSocial} e Controladas - Exercício 2026`,
      conteudoHtml: html
    });
  };

  const participacoesFiltradas = (quadro?.participacoes || []).filter(item => {
    const matchBusca =
      item.investidaRazaoSocial.toLowerCase().includes(busca.toLowerCase()) ||
      item.investidaCnpj.toLowerCase().includes(busca.toLowerCase());
    const matchRel = filtroRelacao === 'TODAS' || item.relacao === filtroRelacao;
    return matchBusca && matchRel;
  });

  return (
    <div className="h-full flex flex-col bg-[#141414] text-neutral-200">
      {/* Top Header */}
      <div className="p-4 bg-[#181818] border-b border-[#262626] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-indigo-950/60 border border-indigo-700/50 text-indigo-400">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-semibold text-white tracking-wide">
                Consolidação Contábil & Equivalência Patrimonial (CPC 18 / CPC 36)
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-indigo-900/60 text-indigo-300 border border-indigo-700/60">
                MEP & IFRS 10
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Método de Equivalência Patrimonial em Coligadas/Controladas, folha de trabalho de consolidação e eliminação de lucros intercompany
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={carregarDados}
            className="p-2 text-neutral-400 hover:text-white hover:bg-[#262626] rounded transition-colors"
            title="Recarregar dados"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleEmitirConsolidadoA4}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-neutral-200 bg-[#252525] hover:bg-[#303030] border border-[#383838] rounded transition-colors"
          >
            <Printer className="w-4 h-4 text-indigo-400" />
            <span>Demonstração Consolidada A4</span>
          </button>
          <button
            onClick={handleOpenNovo}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Participação Societária</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Bar */}
      <div className="grid grid-cols-5 gap-3 p-4 bg-[#161616] border-b border-[#242424]">
        <div className="p-3 rounded-lg bg-[#1a1a1a] border border-[#282828]">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs">Investimentos MEP</span>
            <Building className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-base font-bold text-indigo-400 font-mono">
            R$ {(quadro?.totalInvestimentosColigadas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Saldo patrimonial ativo</div>
        </div>

        <div className="p-3 rounded-lg bg-[#1a1a1a] border border-[#282828]">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs">Resultado REP (DRE)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className={`text-base font-bold font-mono ${(quadro?.totalResultadoEquivalencia || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {(quadro?.totalResultadoEquivalencia || 0) >= 0 ? '+' : ''} R$ {(quadro?.totalResultadoEquivalencia || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Receita / Despesa de equivalência</div>
        </div>

        <div className="p-3 rounded-lg bg-[#1a1a1a] border border-[#282828]">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs">Eliminações Intercompany</span>
            <Split className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-base font-bold text-amber-400 font-mono">
            R$ {(quadro?.totalEliminacoesIntercompany || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Lucros em estoques & mútuos</div>
        </div>

        <div className="p-3 rounded-lg bg-[#1a1a1a] border border-[#282828]">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs">Investidas Registradas</span>
            <GitBranch className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-base font-bold text-white font-mono">
            {quadro?.participacoes.length || 0}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Controladas e coligadas</div>
        </div>

        <div className="p-3 rounded-lg bg-[#1a1a1a] border border-[#282828]">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs">Não Controladores</span>
            <Percent className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-base font-bold text-purple-400 font-mono">
            R$ 4.500.000,00
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Minority Interest segregado</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1 px-4 border-b border-[#262626] bg-[#181818]">
        <button
          onClick={() => setAbaAtiva('mep')}
          className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
            abaAtiva === 'mep'
              ? 'border-indigo-500 text-indigo-400 bg-[#202020]'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          Participações Societárias & Apuração MEP
        </button>
        <button
          onClick={() => setAbaAtiva('consolidacao')}
          className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
            abaAtiva === 'consolidacao'
              ? 'border-indigo-500 text-indigo-400 bg-[#202020]'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          Folha de Consolidação Multi-Empresa (Worksheet)
        </button>
        <button
          onClick={() => setAbaAtiva('normas')}
          className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
            abaAtiva === 'normas'
              ? 'border-indigo-500 text-indigo-400 bg-[#202020]'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          Critérios de Eliminação CPC 36 / Lei 6.404
        </button>
      </div>

      {/* Content: MEP Tab */}
      {abaAtiva === 'mep' && (
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-3 gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-neutral-500" />
              <input
                type="text"
                placeholder="Buscar por razão social ou CNPJ da investida..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#1a1a1a] border border-[#2a2a2a] rounded text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-3.5 h-3.5 text-neutral-500" />
              <select
                value={filtroRelacao}
                onChange={e => setFiltroRelacao(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-[#1a1a1a] border border-[#2a2a2a] rounded text-neutral-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="TODAS">Todas as Relações Societárias</option>
                <option value="CONTROLADA_DIRETA">Controlada Direta</option>
                <option value="CONTROLADA_INDIRETA">Controlada Indireta</option>
                <option value="COLIGADA">Coligada</option>
                <option value="JOINT_VENTURE">Joint Venture</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-auto rounded border border-[#262626] bg-[#171717]">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-[#1f1f1f] text-neutral-300 sticky top-0 border-b border-[#2a2a2a]">
                <tr>
                  <th className="p-2.5 font-semibold">Investida / CNPJ</th>
                  <th className="p-2.5 font-semibold">Relação Societária</th>
                  <th className="p-2.5 font-semibold text-center">% Part.</th>
                  <th className="p-2.5 font-semibold text-right">PL Investida</th>
                  <th className="p-2.5 font-semibold text-right">Ajustes / Lucros Não Realiz.</th>
                  <th className="p-2.5 font-semibold text-right">Investimento Teórico MEP</th>
                  <th className="p-2.5 font-semibold text-right">Resultado MEP (REP)</th>
                  <th className="p-2.5 font-semibold text-center">Status</th>
                  <th className="p-2.5 font-semibold text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#242424]">
                {participacoesFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-6 text-center text-neutral-500">
                      Nenhuma participação societária encontrada. Clique em "Nova Participação Societária" para cadastrar.
                    </td>
                  </tr>
                ) : (
                  participacoesFiltradas.map(item => (
                    <tr key={item.id} className="hover:bg-[#1d1d1d] transition-colors">
                      <td className="p-2.5">
                        <div className="font-semibold text-white">{item.investidaRazaoSocial}</div>
                        <div className="text-[10px] text-neutral-500 font-mono mt-0.5">{item.investidaCnpj}</div>
                      </td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#222] border border-[#333] text-neutral-300">
                          {item.relacao.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-2.5 text-center font-mono font-bold text-indigo-400">
                        {item.percentualParticipacao.toFixed(2)}%
                      </td>
                      <td className="p-2.5 text-right font-mono text-neutral-300">
                        R$ {item.patrimonioLiquidoInvestida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        <div className="text-[10px] text-neutral-500 font-normal">
                          Lucro: R$ {item.lucroPrejuizoPeriodoInvestida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="p-2.5 text-right font-mono text-amber-400">
                        {item.ajustesPlNaoRealizados !== 0 ? `R$ ${item.ajustesPlNaoRealizados.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                      </td>
                      <td className="p-2.5 text-right font-mono font-semibold text-indigo-300">
                        R$ {item.valorInvestimentoMepTeorico.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        <div className="text-[10px] text-neutral-500 font-normal">
                          Ant: R$ {item.saldoContabilInvestimentoAnterior.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="p-2.5 text-right font-mono">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          item.resultadoEquivalenciaPatrimonial >= 0
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-700/60'
                            : 'bg-rose-950/80 text-rose-400 border border-rose-700/60'
                        }`}>
                          {item.resultadoEquivalenciaPatrimonial >= 0 ? '+' : ''} R$ {item.resultadoEquivalenciaPatrimonial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="p-2.5 text-center">
                        {item.integradoContabil ? (
                          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                            <CheckCircle className="w-3 h-3" />
                            <span>Integrado</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] bg-amber-950/60 text-amber-400 border border-amber-800/40">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Pendente</span>
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => handleIntegrarContabil(item.id)}
                            className="p-1 text-emerald-400 hover:bg-emerald-950/50 rounded transition-colors"
                            title="Integrar REP no Diário Geral"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditar(item)}
                            className="p-1 text-neutral-400 hover:bg-neutral-800 rounded transition-colors"
                            title="Editar Participação"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleExcluir(item.id)}
                            className="p-1 text-rose-400 hover:bg-rose-950/50 rounded transition-colors"
                            title="Excluir Participação"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Content: Folha de Consolidação */}
      {abaAtiva === 'consolidacao' && (
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center space-x-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Matriz de Consolidação & Eliminações Contábeis</span>
            </h2>
            <button
              onClick={handleEmitirConsolidadoA4}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Relatório Consolidado A4</span>
            </button>
          </div>

          <div className="flex-1 overflow-auto rounded border border-[#262626] bg-[#171717]">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-[#1f1f1f] text-neutral-300 sticky top-0 border-b border-[#2a2a2a]">
                <tr>
                  <th className="p-2.5 font-semibold">Conta</th>
                  <th className="p-2.5 font-semibold">Descrição da Rubrica</th>
                  <th className="p-2.5 font-semibold text-right">Controladora (R$)</th>
                  <th className="p-2.5 font-semibold text-right">Controladas (R$)</th>
                  <th className="p-2.5 font-semibold text-right">Eliminações D (R$)</th>
                  <th className="p-2.5 font-semibold text-right">Eliminações C (R$)</th>
                  <th className="p-2.5 font-semibold text-right">Consolidado Final (R$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#242424]">
                {(quadro?.balancoConsolidado || []).map(linha => (
                  <tr key={linha.id} className="hover:bg-[#1d1d1d] transition-colors">
                    <td className="p-2.5 font-mono font-bold text-neutral-300">{linha.codigoConta}</td>
                    <td className="p-2.5 font-medium text-white">{linha.descricaoConta}</td>
                    <td className="p-2.5 text-right font-mono text-neutral-300">
                      R$ {linha.saldoControladora.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2.5 text-right font-mono text-neutral-300">
                      R$ {linha.saldoControladas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2.5 text-right font-mono text-rose-400">
                      {linha.eliminacoesDebito > 0 ? `R$ ${linha.eliminacoesDebito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td className="p-2.5 text-right font-mono text-rose-400">
                      {linha.eliminacoesCredito > 0 ? `R$ ${linha.eliminacoesCredito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td className="p-2.5 text-right font-mono font-bold text-indigo-400 text-sm">
                      R$ {linha.saldoConsolidado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Content: Normas */}
      {abaAtiva === 'normas' && (
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-4 text-xs leading-relaxed text-neutral-300">
            <div className="p-4 rounded-lg bg-[#181818] border border-[#262626]">
              <h3 className="text-sm font-semibold text-indigo-400 mb-2 flex items-center space-x-2">
                <Scale className="w-4 h-4" />
                <span>Normas de Consolidação e Equivalência Patrimonial (CPC 18 e CPC 36)</span>
              </h3>
              <ul className="list-disc pl-5 space-y-1.5 text-neutral-400">
                <li>
                  <strong className="text-neutral-200">Equivalência Patrimonial (CPC 18):</strong> Aplicável a investimentos em coligadas sobre as quais a investidora tenha influência significativa, controladas e joint ventures. O valor do investimento é ajustado para refletir a parcela da investidora no lucro ou prejuízo do exercício.
                </li>
                <li>
                  <strong className="text-neutral-200">Eliminação de Saldos Mútuos (CPC 36):</strong> Devem ser eliminados integralmente todos os ativos e passivos, patrimônio líquido, receitas, despesas e fluxos de caixa decorrentes de transações entre as entidades do grupo (créditos e débitos recíprocos).
                </li>
                <li>
                  <strong className="text-neutral-200">Eliminação de Lucros Não Realizados:</strong> Lucros e prejuízos resultantes de transações intragrupo reconhecidos em estoques ou imobilizado devem ser eliminados na proporção da participação da controladora até que os bens sejam vendidos a terceiros independentes.
                </li>
                <li>
                  <strong className="text-neutral-200">Participação dos Não Controladores:</strong> A parcela do patrimônio líquido e dos resultados das controladas pertencente a terceiros acionistas é apresentada separadamente no Balanço e na DRE.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#1c1c1c] border border-[#2e2e2e] rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-[#2e2e2e] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white flex items-center space-x-2">
                <Network className="w-4 h-4 text-indigo-400" />
                <span>{editingItem ? 'Editar Participação Societária' : 'Nova Participação Societária (CPC 18)'}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvar} className="flex-1 overflow-auto p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Razão Social da Investida:</label>
                  <input
                    type="text"
                    required
                    value={investidaRazaoSocial}
                    onChange={e => setInvestidaRazaoSocial(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#242424] border border-[#333] rounded text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-300 mb-1">CNPJ da Investida:</label>
                  <input
                    type="text"
                    required
                    placeholder="00.000.000/0000-00"
                    value={investidaCnpj}
                    onChange={e => setInvestidaCnpj(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#242424] border border-[#333] rounded text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Relação Societária:</label>
                  <select
                    value={relacao}
                    onChange={e => setRelacao(e.target.value as TipoRelacaoSocietaria)}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#242424] border border-[#333] rounded text-neutral-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="CONTROLADA_DIRETA">Controlada Direta (&gt;50%)</option>
                    <option value="CONTROLADA_INDIRETA">Controlada Indireta</option>
                    <option value="COLIGADA">Coligada (Influência Significativa)</option>
                    <option value="JOINT_VENTURE">Joint Venture (Controle Conjunto)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Percentual de Participação (%):</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={percentualParticipacao}
                    onChange={e => setPercentualParticipacao(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#242424] border border-[#333] rounded text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Patrimônio Líquido da Investida (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={patrimonioLiquidoInvestida}
                    onChange={e => setPatrimonioLiquidoInvestida(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#242424] border border-[#333] rounded text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Lucro Líquido do Período (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={lucroPrejuizoPeriodoInvestida}
                    onChange={e => setLucroPrejuizoPeriodoInvestida(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#242424] border border-[#333] rounded text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Ajustes de PL (Lucros Não Realizados):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={ajustesPlNaoRealizados}
                    onChange={e => setAjustesPlNaoRealizados(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#242424] border border-[#333] rounded text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Saldo Contábil Anterior do Investimento (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={saldoContabilInvestimentoAnterior}
                    onChange={e => setSaldoContabilInvestimentoAnterior(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#242424] border border-[#333] rounded text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Dividendos Recebidos no Período (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={dividendosRecebidosPeriodo}
                    onChange={e => setDividendosRecebidosPeriodo(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#242424] border border-[#333] rounded text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Data da Apuração:</label>
                  <input
                    type="date"
                    required
                    value={dataApuracao}
                    onChange={e => setDataApuracao(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#242424] border border-[#333] rounded text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-neutral-300 mb-1">Observações:</label>
                <textarea
                  rows={2}
                  value={observacoes}
                  onChange={e => setObservacoes(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-[#242424] border border-[#333] rounded text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-[#2e2e2e] flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white bg-[#252525] rounded transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded transition-colors"
                >
                  Salvar Participação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
