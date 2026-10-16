import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Plus,
  RefreshCw,
  Printer,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  FileText,
  Search,
  Filter,
  Calculator,
  Calendar,
  Edit,
  Trash2,
  ShieldCheck,
  DollarSign,
  ArrowRightLeft,
  FileCheck2,
  Clock,
  Building,
  Activity,
  Layers,
  Sparkles,
  HelpCircle,
  Award,
  Sliders,
  Compass
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  Empresa,
  ItemRevisaoPatrimonial,
  ResumoRevisaoPatrimonial,
  TipoAvaliacaoPatrimonial,
  MetodologiaValorRecuperavel,
  StatusLaudoPatrimonial
} from '../../types/contabil';

interface RevisaoVidasUteisModuleProps {
  empresaAtiva: Empresa | null;
  onOpenReportPreview?: (config: {
    titulo: string;
    subtitulo: string;
    conteudoHtml: string;
    imprimirDireto?: boolean;
  }) => void;
}

export const RevisaoVidasUteisModule: React.FC<RevisaoVidasUteisModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [resumo, setResumo] = useState<ResumoRevisaoPatrimonial | null>(null);
  const [anoFiltro, setAnoFiltro] = useState<number>(2026);
  const [abaAtiva, setAbaAtiva] = useState<'laudos' | 'simulador' | 'normas'>('laudos');
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');

  // Modal formulário
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemEdicao, setItemEdicao] = useState<ItemRevisaoPatrimonial | null>(null);

  // Formulário State
  const [codigoPatrimonialOuUgc, setCodigoPatrimonialOuUgc] = useState('');
  const [descricaoBemOuUgc, setDescricaoBemOuUgc] = useState('');
  const [categoriaAtivo, setCategoriaAtivo] = useState('Máquinas e Equipamentos Industriais');
  const [tipoAvaliacao, setTipoAvaliacao] = useState<TipoAvaliacaoPatrimonial>('REVISAO_VIDA_UTIL_CPC27');
  const [dataAvaliacaoLaudo, setDataAvaliacaoLaudo] = useState('2026-01-20');
  const [engenheiroPeritoResponsavel, setEngenheiroPeritoResponsavel] = useState('Eng. Ricardo Sampaio');
  const [registroCreaCreci, setRegistroCreaCreci] = useState('CREA-SP 189432/D - IBAPE-SP');
  const [valorCustoHistoricoBRL, setValorCustoHistoricoBRL] = useState(5000000);
  const [depreciacaoAcumuladaAnteriorBRL, setDepreciacaoAcumuladaAnteriorBRL] = useState(2500000);
  const [vidaUtilAnteriorAnos, setVidaUtilAnteriorAnos] = useState(10);
  const [novaVidaUtilEconomicaRemanescenteAnos, setNovaVidaUtilEconomicaRemanescenteAnos] = useState(12);
  const [novoValorResidualEstimadoBRL, setNovoValorResidualEstimadoBRL] = useState(300000);
  const [valorRecuperavelApuradoBRL, setValorRecuperavelApuradoBRL] = useState<number | undefined>(undefined);
  const [metodologiaValorRecuperavel, setMetodologiaValorRecuperavel] = useState<MetodologiaValorRecuperavel>('VALOR_EM_USO_FCD');
  const [taxaDescontoWaccUtilizadaPercentual, setTaxaDescontoWaccUtilizadaPercentual] = useState(11.5);
  const [status, setStatus] = useState<StatusLaudoPatrimonial>('CONCLUIDO_HOMOLOGADO');
  const [observacoes, setObservacoes] = useState('');

  // Simulador de Fluxo de Caixa Descontado (FCD) / Ajuste Prospectivo
  const [simCustoAquisicao, setSimCustoAquisicao] = useState(3000000);
  const [simDeprecAcumulada, setSimDeprecAcumulada] = useState(1200000);
  const [simResidual, setSimResidual] = useState(200000);
  const [simNovaVidaAnos, setSimNovaVidaAnos] = useState(8);
  const [simFluxoCaixaAno1, setSimFluxoCaixaAno1] = useState(400000);
  const [simCrescimentoFluxo, setSimCrescimentoFluxo] = useState(3);
  const [simTaxaWacc, setSimTaxaWacc] = useState(12);

  const carregarDados = () => {
    if (!empresaAtiva) return;
    const data = dbService.getRevisaoPatrimonial(empresaAtiva.id, anoFiltro);
    setResumo(data);
  };

  useEffect(() => {
    carregarDados();
  }, [empresaAtiva, anoFiltro]);

  const handleNovo = () => {
    setItemEdicao(null);
    setCodigoPatrimonialOuUgc(`IMOB-${Math.floor(1000 + Math.random() * 9000)}`);
    setDescricaoBemOuUgc('Centro de Usinagem CNC de Alta Precisão 5 Eixos');
    setCategoriaAtivo('Máquinas e Equipamentos Industriais');
    setTipoAvaliacao('REVISAO_VIDA_UTIL_CPC27');
    setDataAvaliacaoLaudo(new Date().toISOString().split('T')[0]);
    setEngenheiroPeritoResponsavel('Eng. Carlos Eduardo Pinheiro');
    setRegistroCreaCreci('CREA-RJ 204918/D');
    setValorCustoHistoricoBRL(4200000);
    setDepreciacaoAcumuladaAnteriorBRL(1800000);
    setVidaUtilAnteriorAnos(10);
    setNovaVidaUtilEconomicaRemanescenteAnos(8);
    setNovoValorResidualEstimadoBRL(250000);
    setValorRecuperavelApuradoBRL(undefined);
    setMetodologiaValorRecuperavel('VALOR_EM_USO_FCD');
    setTaxaDescontoWaccUtilizadaPercentual(11.5);
    setStatus('CONCLUIDO_HOMOLOGADO');
    setObservacoes('');
    setIsModalOpen(true);
  };

  const handleEditar = (item: ItemRevisaoPatrimonial) => {
    setItemEdicao(item);
    setCodigoPatrimonialOuUgc(item.codigoPatrimonialOuUgc);
    setDescricaoBemOuUgc(item.descricaoBemOuUgc);
    setCategoriaAtivo(item.categoriaAtivo);
    setTipoAvaliacao(item.tipoAvaliacao);
    setDataAvaliacaoLaudo(item.dataAvaliacaoLaudo);
    setEngenheiroPeritoResponsavel(item.engenheiroPeritoResponsavel);
    setRegistroCreaCreci(item.registroCreaCreci);
    setValorCustoHistoricoBRL(item.valorCustoHistoricoBRL);
    setDepreciacaoAcumuladaAnteriorBRL(item.depreciacaoAcumuladaAnteriorBRL);
    setVidaUtilAnteriorAnos(item.vidaUtilAnteriorAnos);
    setNovaVidaUtilEconomicaRemanescenteAnos(item.novaVidaUtilEconomicaRemanescenteAnos);
    setNovoValorResidualEstimadoBRL(item.novoValorResidualEstimadoBRL);
    setValorRecuperavelApuradoBRL(item.valorRecuperavelApuradoBRL);
    setMetodologiaValorRecuperavel(item.metodologiaValorRecuperavel || 'VALOR_EM_USO_FCD');
    setTaxaDescontoWaccUtilizadaPercentual(item.taxaDescontoWaccUtilizadaPercentual || 11.5);
    setStatus(item.status);
    setObservacoes(item.observacoes || '');
    setIsModalOpen(true);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaAtiva) return;

    const valorContabilLiquido = Math.max(0, valorCustoHistoricoBRL - depreciacaoAcumuladaAnteriorBRL);
    const novaTaxa = novaVidaUtilEconomicaRemanescenteAnos > 0
      ? Math.round((100 / novaVidaUtilEconomicaRemanescenteAnos) * 100) / 100
      : 0;

    // Cálculo do ajuste prospectivo de depreciação anual (CPC 27 item 51 & CPC 23)
    const baseDepreciavelRemanescente = Math.max(0, valorContabilLiquido - novoValorResidualEstimadoBRL);
    const novaDepreciacaoAnual = novaVidaUtilEconomicaRemanescenteAnos > 0
      ? Math.round((baseDepreciavelRemanescente / novaVidaUtilEconomicaRemanescenteAnos) * 100) / 100
      : 0;

    const depreciacaoAnteriorAnual = vidaUtilAnteriorAnos > 0
      ? Math.round((valorCustoHistoricoBRL / vidaUtilAnteriorAnos) * 100) / 100
      : 0;

    const impactoDepreciacaoAnual = novaDepreciacaoAnual - depreciacaoAnteriorAnual;

    // Impairment (CPC 01)
    let perdaImpairment = 0;
    if (tipoAvaliacao === 'IMPAIRMENT_UGC_CPC01' && valorRecuperavelApuradoBRL !== undefined) {
      perdaImpairment = Math.max(0, valorContabilLiquido - valorRecuperavelApuradoBRL);
    }

    const item: ItemRevisaoPatrimonial = {
      id: itemEdicao ? itemEdicao.id : `rev-${Date.now()}`,
      empresaId: empresaAtiva.id,
      codigoPatrimonialOuUgc,
      descricaoBemOuUgc,
      categoriaAtivo,
      tipoAvaliacao,
      dataAvaliacaoLaudo,
      engenheiroPeritoResponsavel,
      registroCreaCreci,
      valorCustoHistoricoBRL,
      depreciacaoAcumuladaAnteriorBRL,
      valorContabilLiquidoAtualBRL: valorContabilLiquido,
      vidaUtilAnteriorAnos,
      novaVidaUtilEconomicaRemanescenteAnos,
      novoValorResidualEstimadoBRL,
      novaTaxaDepreciacaoAnualPercentual: novaTaxa,
      impactoDepreciacaoAnualFuturaBRL: impactoDepreciacaoAnual,
      valorRecuperavelApuradoBRL: tipoAvaliacao === 'IMPAIRMENT_UGC_CPC01' ? valorRecuperavelApuradoBRL : undefined,
      metodologiaValorRecuperavel: tipoAvaliacao === 'IMPAIRMENT_UGC_CPC01' ? metodologiaValorRecuperavel : undefined,
      taxaDescontoWaccUtilizadaPercentual: tipoAvaliacao === 'IMPAIRMENT_UGC_CPC01' ? taxaDescontoWaccUtilizadaPercentual : undefined,
      perdaImpairmentReconhecerBRL: perdaImpairment,
      status,
      integradoContabil: itemEdicao ? itemEdicao.integradoContabil : false,
      observacoes: observacoes.trim() ? observacoes.trim() : undefined
    };

    const res = dbService.salvarItemRevisaoPatrimonial(item);
    if (res.sucesso) {
      setIsModalOpen(false);
      carregarDados();
    } else {
      alert(res.mensagem);
    }
  };

  const handleExcluir = (id: string, codigo: string) => {
    if (confirm(`Tem certeza que deseja remover a avaliação técnica do item "${codigo}"?`)) {
      dbService.excluirItemRevisaoPatrimonial(id);
      carregarDados();
    }
  };

  const handleIntegrar = (id: string) => {
    const res = dbService.integrarAjustePatrimonialContabil(id);
    alert(res.mensagem);
    carregarDados();
  };

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatPercent = (val: number) => {
    return `${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
  };

  // Filtragem da lista
  const itensFiltrados = (resumo?.itens || []).filter(item => {
    const matchBusca =
      item.codigoPatrimonialOuUgc.toLowerCase().includes(busca.toLowerCase()) ||
      item.descricaoBemOuUgc.toLowerCase().includes(busca.toLowerCase()) ||
      item.engenheiroPeritoResponsavel.toLowerCase().includes(busca.toLowerCase());
    const matchTipo = filtroTipo === 'TODOS' || item.tipoAvaliacao === filtroTipo;
    const matchStatus = filtroStatus === 'TODOS' || item.status === filtroStatus;
    return matchBusca && matchTipo && matchStatus;
  });

  const handleImprimirRelatorio = () => {
    if (!resumo || !empresaAtiva) return;

    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #111; padding: 20px;">
        <div style="border-bottom: 2px solid #8b5cf6; padding-bottom: 12px; margin-bottom: 20px;">
          <h1 style="font-size: 20px; font-weight: bold; margin: 0; color: #6d28d9;">DEMONSTRATIVO DE REVISÃO DE VIDAS ÚTEIS E TESTE DE RECUPERABILIDADE</h1>
          <p style="font-size: 12px; color: #555; margin: 4px 0 0 0;">CPC 27 Item 51 / CPC 01 (R1) / NBC TG 27 / NBC TG 01 - Exercício Fiscal ${anoFiltro}</p>
        </div>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-bottom: 20px; font-size: 12px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div><strong>Empresa:</strong> ${empresaAtiva.razaoSocial}</div>
            <div><strong>CNPJ:</strong> ${empresaAtiva.cnpj}</div>
            <div><strong>Exercício:</strong> ${anoFiltro}</div>
            <div><strong>Total Laudos Avaliados:</strong> ${resumo.totalItensAvaliados}</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px;">
          <div style="background: #f1f5f9; padding: 10px; border-radius: 6px; border-left: 4px solid #8b5cf6;">
            <div style="font-size: 10px; color: #64748b; text-transform: uppercase;">Valor Contábil Líquido</div>
            <div style="font-size: 15px; font-weight: bold; color: #0f172a; margin-top: 4px;">${formatBRL(resumo.valorContabilTotalAvaliadosBRL)}</div>
          </div>
          <div style="background: #f1f5f9; padding: 10px; border-radius: 6px; border-left: 4px solid #0284c7;">
            <div style="font-size: 10px; color: #64748b; text-transform: uppercase;">Ajuste Prospectivo Depreciação</div>
            <div style="font-size: 15px; font-weight: bold; color: #0f172a; margin-top: 4px;">${formatBRL(resumo.ajusteProspectivoDepreciacaoAnualBRL)}</div>
          </div>
          <div style="background: #f1f5f9; padding: 10px; border-radius: 6px; border-left: 4px solid #ef4444;">
            <div style="font-size: 10px; color: #64748b; text-transform: uppercase;">Perdas por Impairment</div>
            <div style="font-size: 15px; font-weight: bold; color: #b91c1c; margin-top: 4px;">${formatBRL(resumo.totalPerdasImpairmentReconhecidasBRL)}</div>
          </div>
          <div style="background: #f1f5f9; padding: 10px; border-radius: 6px; border-left: 4px solid #10b981;">
            <div style="font-size: 10px; color: #64748b; text-transform: uppercase;">Status de Auditoria</div>
            <div style="font-size: 15px; font-weight: bold; color: #047857; margin-top: 4px;">HOMOLOGADO</div>
          </div>
        </div>

        <h3 style="font-size: 14px; font-weight: bold; color: #334155; margin-bottom: 8px;">Itens Patrimoniais e Unidades Geradoras de Caixa (UGC)</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 24px;">
          <thead>
            <tr style="background: #e2e8f0; color: #334155; text-align: left;">
              <th style="padding: 8px; border: 1px solid #cbd5e1;">Código / Bem ou UGC</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">Perito Responsável</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">Tipo / Norma</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">V. Contábil Líquido</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Vida Útil Remanescente</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">V. Residual Estimado</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">Perda Impairment</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${resumo.itens
              .map(
                i => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">${i.codigoPatrimonialOuUgc}<br/><span style="font-size: 9px; font-weight: normal; color: #64748b;">${i.descricaoBemOuUgc}</span></td>
                <td style="padding: 8px; border: 1px solid #cbd5e1;">${i.engenheiroPeritoResponsavel}<br/><span style="font-size: 9px; color: #64748b;">${i.registroCreaCreci}</span></td>
                <td style="padding: 8px; border: 1px solid #cbd5e1;">${i.tipoAvaliacao === 'REVISAO_VIDA_UTIL_CPC27' ? 'CPC 27 (Vida Útil)' : 'CPC 01 (Impairment)'}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">${formatBRL(i.valorContabilLiquidoAtualBRL)}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">${i.novaVidaUtilEconomicaRemanescenteAnos} anos</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">${formatBRL(i.novoValorResidualEstimadoBRL)}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; color: ${i.perdaImpairmentReconhecerBRL > 0 ? '#b91c1c' : '#334155'}; font-weight: ${i.perdaImpairmentReconhecerBRL > 0 ? 'bold' : 'normal'};">${formatBRL(i.perdaImpairmentReconhecerBRL)}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">
                  <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; background: ${
                    i.status === 'APLICADO_CONTABILIDADE' ? '#dcfce7; color: #166534;' : '#fef9c3; color: #854d0e;'
                  }">${i.status.replace(/_/g, ' ')}</span>
                </td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <div style="font-size: 11px; line-height: 1.5; color: #475569; border-top: 1px solid #e2e8f0; padding-top: 12px;">
          <p><strong>Fundamentação Técnica e Normativa:</strong></p>
          <p>1. <strong>CPC 27 item 51 & CPC 23:</strong> O valor residual e a vida útil econômica de um ativo imobilizado devem ser revisados pelo menos ao final de cada exercício financeiro. As alterações decorrentes são tratadas como mudança de estimativa contábil com efeito puramente <em>prospectivo</em>.</p>
          <p>2. <strong>CPC 01 (R1) / NBC TG 01:</strong> O teste de recuperabilidade é conduzido anualmente ou mediante evidência objetiva de desvalorização. O valor recuperável consiste no maior montante entre o Valor Justo Líquido de Despesas de Venda e o Valor em Uso (Fluxo de Caixa Descontado pelo WACC da UGC).</p>
        </div>

        <div style="margin-top: 50px; display: flex; justify-content: space-between; text-align: center;">
          <div style="width: 45%; border-top: 1px solid #334155; padding-top: 8px;">
            <p style="margin: 0; font-weight: bold; font-size: 12px;">Engenheiro / Perito Avaliador</p>
            <p style="margin: 0; font-size: 10px; color: #64748b;">CREA / IBAPE / Laudo Técnico</p>
          </div>
          <div style="width: 45%; border-top: 1px solid #334155; padding-top: 8px;">
            <p style="margin: 0; font-weight: bold; font-size: 12px;">Contador Responsável / Auditoria Externa</p>
            <p style="margin: 0; font-size: 10px; color: #64748b;">CRC Ativo / NBC TG 01 / CPC 27</p>
          </div>
        </div>
      </div>
    `;

    if (onOpenReportPreview) {
      onOpenReportPreview({
        titulo: 'Demonstrativo de Revisão de Vidas Úteis e Teste de Recuperabilidade',
        subtitulo: `Empresa: ${empresaAtiva.razaoSocial} | Exercício: ${anoFiltro}`,
        conteudoHtml: html
      });
    }
  };

  // Cálculos do simulador CPC 27 / CPC 01
  const simValorContabilAtual = Math.max(0, simCustoAquisicao - simDeprecAcumulada);
  const simBaseDepreciavel = Math.max(0, simValorContabilAtual - simResidual);
  const simNovaDeprecAnual = simNovaVidaAnos > 0 ? simBaseDepreciavel / simNovaVidaAnos : 0;
  
  // FCD 5 anos + perpetuidade
  let simValorEmUsoFCD = 0;
  const taxaWaccDecimal = simTaxaWacc / 100;
  for (let t = 1; t <= 5; t++) {
    const fct = simFluxoCaixaAno1 * Math.pow(1 + simCrescimentoFluxo / 100, t - 1);
    simValorEmUsoFCD += fct / Math.pow(1 + taxaWaccDecimal, t);
  }
  // Perpetuidade
  const fluxoAno5 = simFluxoCaixaAno1 * Math.pow(1 + simCrescimentoFluxo / 100, 4);
  const perpetuidade = (fluxoAno5 * (1 + 0.02)) / Math.max(0.01, (taxaWaccDecimal - 0.02));
  simValorEmUsoFCD += perpetuidade / Math.pow(1 + taxaWaccDecimal, 5);

  const simPerdaImpairment = Math.max(0, simValorContabilAtual - simValorEmUsoFCD);

  return (
    <div className="space-y-6">
      {/* Header com identificação e ações */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1e1e1e] border border-[#2d2d2d] p-5 rounded-lg shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-950/40 border border-purple-800/50 rounded-lg text-purple-400">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
              Revisão Periódica de Vidas Úteis & Impairment
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-900/50 text-purple-300 border border-purple-700/50 font-normal">
                CPC 27 item 51 / CPC 01 (R1) / NBC TG 01
              </span>
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Laudos periciais de engenharia, ajuste prospectivo de depreciação e teste de recuperabilidade de Unidades Geradoras de Caixa (UGC)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={anoFiltro}
            onChange={e => setAnoFiltro(Number(e.target.value))}
            className="bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-purple-500"
          >
            <option value={2026}>Exercício 2026</option>
            <option value={2025}>Exercício 2025</option>
            <option value={2024}>Exercício 2024</option>
          </select>

          <button
            onClick={carregarDados}
            title="Atualizar dados"
            className="p-2 bg-[#262626] hover:bg-[#333333] border border-[#3d3d3d] rounded text-gray-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleImprimirRelatorio}
            className="flex items-center space-x-1.5 bg-[#262626] hover:bg-[#333333] border border-[#3d3d3d] text-purple-400 px-3 py-1.5 rounded text-xs font-medium transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Relatório A4</span>
          </button>

          <button
            onClick={handleNovo}
            className="flex items-center space-x-1.5 bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Laudo / Avaliação</span>
          </button>
        </div>
      </div>

      {/* Cards de Métricas Consolidadas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#1e1e1e] border border-[#2d2d2d] p-4 rounded-lg">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Itens / UGCs Avaliadas</span>
            <Building className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-gray-100">{resumo?.totalItensAvaliados || 0}</div>
          <div className="text-[11px] text-gray-500 mt-1">Laudos Técnicos Homologados</div>
        </div>

        <div className="bg-[#1e1e1e] border border-[#2d2d2d] p-4 rounded-lg">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Valor Contábil Líquido</span>
            <DollarSign className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-lg font-bold text-blue-400 truncate">
            {formatBRL(resumo?.valorContabilTotalAvaliadosBRL || 0)}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">Ativo Imobilizado Analisado</div>
        </div>

        <div className="bg-[#1e1e1e] border border-[#2d2d2d] p-4 rounded-lg">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Ajuste Depreciação Anual</span>
            <Sliders className="w-4 h-4 text-teal-400" />
          </div>
          <div className={`text-lg font-bold truncate ${
            (resumo?.ajusteProspectivoDepreciacaoAnualBRL || 0) < 0 ? 'text-teal-400' : 'text-amber-400'
          }`}>
            {formatBRL(resumo?.ajusteProspectivoDepreciacaoAnualBRL || 0)}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">Impacto Prospectivo (CPC 27)</div>
        </div>

        <div className="bg-[#1e1e1e] border border-[#2d2d2d] p-4 rounded-lg">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Perdas por Impairment</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-lg font-bold text-rose-400 truncate">
            {formatBRL(resumo?.totalPerdasImpairmentReconhecidasBRL || 0)}
          </div>
          <div className="text-[11px] text-rose-600 mt-1">Desvalorização Recuperabilidade</div>
        </div>
      </div>

      {/* Abas de Navegação */}
      <div className="border-b border-[#2d2d2d] flex space-x-4">
        <button
          onClick={() => setAbaAtiva('laudos')}
          className={`pb-2.5 px-2 text-xs font-medium border-b-2 transition-colors flex items-center space-x-2 ${
            abaAtiva === 'laudos'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Laudos & Avaliações ({itensFiltrados.length})</span>
        </button>

        <button
          onClick={() => setAbaAtiva('simulador')}
          className={`pb-2.5 px-2 text-xs font-medium border-b-2 transition-colors flex items-center space-x-2 ${
            abaAtiva === 'simulador'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Simulador CPC 27 / FCD & Impairment</span>
        </button>

        <button
          onClick={() => setAbaAtiva('normas')}
          className={`pb-2.5 px-2 text-xs font-medium border-b-2 transition-colors flex items-center space-x-2 ${
            abaAtiva === 'normas'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Racional Técnico & CPC 27/01</span>
        </button>
      </div>

      {/* ABA 1: LAUDOS */}
      {abaAtiva === 'laudos' && (
        <div className="space-y-4">
          {/* Filtros */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#1e1e1e] border border-[#2d2d2d] p-3 rounded-lg text-xs">
            <div className="flex items-center space-x-2 flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar por código patrimonial, UGC, descrição ou perito..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1.5">
                <span className="text-gray-400">Tipo:</span>
                <select
                  value={filtroTipo}
                  onChange={e => setFiltroTipo(e.target.value)}
                  className="bg-[#262626] border border-[#3d3d3d] rounded px-2 py-1 text-gray-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="TODOS">Todos os Tipos</option>
                  <option value="REVISAO_VIDA_UTIL_CPC27">Revisão Vida Útil (CPC 27)</option>
                  <option value="IMPAIRMENT_UGC_CPC01">Impairment UGC (CPC 01)</option>
                </select>
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="text-gray-400">Status:</span>
                <select
                  value={filtroStatus}
                  onChange={e => setFiltroStatus(e.target.value)}
                  className="bg-[#262626] border border-[#3d3d3d] rounded px-2 py-1 text-gray-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="TODOS">Todos os Status</option>
                  <option value="EM_ELABORACAO">Em Elaboração</option>
                  <option value="CONCLUIDO_HOMOLOGADO">Homologado</option>
                  <option value="APLICADO_CONTABILIDADE">Aplicado na Contabilidade</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grid de Itens */}
          {itensFiltrados.length === 0 ? (
            <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-12 text-center text-gray-500">
              <RotateCcw className="w-12 h-12 mx-auto text-gray-600 mb-3" />
              <p className="text-sm font-medium">Nenhum laudo patrimonial ou teste de impairment encontrado.</p>
              <button
                onClick={handleNovo}
                className="mt-4 inline-flex items-center space-x-1.5 text-xs text-purple-400 hover:text-purple-300"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar primeira avaliação técnica</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {itensFiltrados.map(item => (
                <div
                  key={item.id}
                  className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-4 hover:border-[#3d3d3d] transition-all space-y-3"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 border-b border-[#2d2d2d] pb-3">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-[#262626] border border-[#383838] rounded-md mt-0.5">
                        {item.tipoAvaliacao === 'REVISAO_VIDA_UTIL_CPC27' ? (
                          <Clock className="w-4 h-4 text-purple-400" />
                        ) : (
                          <Activity className="w-4 h-4 text-rose-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-100 text-sm">{item.codigoPatrimonialOuUgc}</span>
                          <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                              item.status === 'APLICADO_CONTABILIDADE'
                                ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400'
                                : item.status === 'CONCLUIDO_HOMOLOGADO'
                                ? 'bg-purple-950/60 border-purple-800/60 text-purple-300'
                                : 'bg-gray-800 border-gray-700 text-gray-400'
                            }`}
                          >
                            {item.status.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-950/60 border border-blue-800/60 text-blue-300">
                            {item.tipoAvaliacao === 'REVISAO_VIDA_UTIL_CPC27' ? 'CPC 27 (Vida Útil)' : 'CPC 01 (Impairment UGC)'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          <span className="text-gray-300 font-medium">{item.descricaoBemOuUgc}</span> • {item.categoriaAtivo}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-end lg:self-center">
                      <button
                        onClick={() => handleIntegrar(item.id)}
                        className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs transition-colors border ${
                          item.integradoContabil
                            ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-400 hover:bg-emerald-900/30'
                            : 'bg-purple-950/40 border-purple-800/60 text-purple-300 hover:bg-purple-900/50'
                        }`}
                      >
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>{item.integradoContabil ? 'Reintegrar Ajuste' : 'Integrar Lote Contábil'}</span>
                      </button>

                      <button
                        onClick={() => handleEditar(item)}
                        className="p-1.5 bg-[#262626] hover:bg-[#333333] border border-[#3d3d3d] text-gray-300 rounded transition-colors"
                        title="Editar avaliação"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleExcluir(item.id, item.codigoPatrimonialOuUgc)}
                        className="p-1.5 bg-[#262626] hover:bg-red-950/50 border border-[#3d3d3d] text-red-400 rounded transition-colors"
                        title="Excluir avaliação"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Detalhes Financeiros */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs bg-[#242424] p-3 rounded border border-[#2e2e2e]">
                    <div>
                      <div className="text-gray-500 text-[10px]">Custo Histórico</div>
                      <div className="text-gray-200 font-mono mt-0.5">{formatBRL(item.valorCustoHistoricoBRL)}</div>
                    </div>

                    <div>
                      <div className="text-gray-500 text-[10px]">Deprec. Acumulada</div>
                      <div className="text-gray-400 font-mono mt-0.5">{formatBRL(item.depreciacaoAcumuladaAnteriorBRL)}</div>
                    </div>

                    <div>
                      <div className="text-gray-500 text-[10px]">V. Contábil Líquido</div>
                      <div className="text-blue-400 font-semibold font-mono mt-0.5">
                        {formatBRL(item.valorContabilLiquidoAtualBRL)}
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-500 text-[10px]">Vida Útil Remanescente</div>
                      <div className="text-purple-300 font-semibold mt-0.5">
                        {item.novaVidaUtilEconomicaRemanescenteAnos} anos ({item.novaTaxaDepreciacaoAnualPercentual}% a.a.)
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-500 text-[10px]">Novo Valor Residual</div>
                      <div className="text-teal-400 font-semibold font-mono mt-0.5">
                        {formatBRL(item.novoValorResidualEstimadoBRL)}
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-500 text-[10px]">Perda Impairment</div>
                      <div className={`font-bold font-mono mt-0.5 ${
                        item.perdaImpairmentReconhecerBRL > 0 ? 'text-rose-400' : 'text-gray-400'
                      }`}>
                        {formatBRL(item.perdaImpairmentReconhecerBRL)}
                      </div>
                    </div>
                  </div>

                  {/* Rodapé do card: Perito, Laudo & Ajuste Prospectivo */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-gray-400 gap-2 px-1">
                    <div className="flex items-center space-x-4">
                      <span>
                        Perito: <strong className="text-gray-200">{item.engenheiroPeritoResponsavel}</strong> ({item.registroCreaCreci})
                      </span>
                      <span>
                        Laudo: <strong className="text-gray-300">{item.dataAvaliacaoLaudo}</strong>
                      </span>
                      {item.impactoDepreciacaoAnualFuturaBRL !== 0 && (
                        <span>
                          Impacto Quota Anual: <strong className={item.impactoDepreciacaoAnualFuturaBRL < 0 ? 'text-teal-300' : 'text-amber-300'}>
                            {formatBRL(item.impactoDepreciacaoAnualFuturaBRL)}
                          </strong>
                        </span>
                      )}
                    </div>
                    {item.observacoes && (
                      <div className="text-gray-500 italic truncate max-w-xs" title={item.observacoes}>
                        {item.observacoes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ABA 2: SIMULADOR CPC 27 / FCD & IMPAIRMENT */}
      {abaAtiva === 'simulador' && (
        <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-5 space-y-6">
          <div className="border-b border-[#2d2d2d] pb-3">
            <h3 className="text-sm font-semibold text-gray-100 flex items-center space-x-2">
              <Calculator className="w-4 h-4 text-purple-400" />
              <span>Simulador de Vida Útil Prospectiva & Fluxo de Caixa Descontado (FCD)</span>
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Avalie o impacto prospectivo de recálculo de quota de depreciação (CPC 27 / CPC 23) e o teste de impairment por Valor em Uso pelo custo médio ponderado de capital (WACC).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Entradas */}
            <div className="space-y-4 bg-[#242424] p-4 rounded-lg border border-[#2e2e2e]">
              <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center space-x-2">
                <Compass className="w-4 h-4 text-purple-400" />
                <span>Dados Contábeis e Operacionais</span>
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Custo de Aquisição (BRL)</label>
                  <input
                    type="number"
                    value={simCustoAquisicao}
                    onChange={e => setSimCustoAquisicao(Number(e.target.value))}
                    className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Deprec. Acumulada (BRL)</label>
                  <input
                    type="number"
                    value={simDeprecAcumulada}
                    onChange={e => setSimDeprecAcumulada(Number(e.target.value))}
                    className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Novo Residual Estimado (BRL)</label>
                  <input
                    type="number"
                    value={simResidual}
                    onChange={e => setSimResidual(Number(e.target.value))}
                    className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Nova Vida Útil (anos)</label>
                  <input
                    type="number"
                    value={simNovaVidaAnos}
                    onChange={e => setSimNovaVidaAnos(Number(e.target.value))}
                    className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="border-t border-[#333] pt-3">
                <div className="text-xs font-semibold text-gray-300 mb-2">Parâmetros do Teste de Impairment (FCD)</div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">FC Ano 1 (BRL)</label>
                    <input
                      type="number"
                      value={simFluxoCaixaAno1}
                      onChange={e => setSimFluxoCaixaAno1(Number(e.target.value))}
                      className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded px-2 py-1 text-xs text-gray-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Cresc. Anual (%)</label>
                    <input
                      type="number"
                      value={simCrescimentoFluxo}
                      onChange={e => setSimCrescimentoFluxo(Number(e.target.value))}
                      className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded px-2 py-1 text-xs text-gray-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">WACC (% a.a.)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={simTaxaWacc}
                      onChange={e => setSimTaxaWacc(Number(e.target.value))}
                      className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded px-2 py-1 text-xs text-gray-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Resultados */}
            <div className="space-y-4 bg-[#242424] p-4 rounded-lg border border-[#2e2e2e]">
              <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Impacto Contábil Apurado</span>
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#1c1c1c] p-3 rounded border border-blue-900/40">
                  <div className="text-[11px] text-blue-400 font-medium">Valor Contábil Líquido</div>
                  <div className="text-base font-bold text-gray-100 mt-1">{formatBRL(simValorContabilAtual)}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">Base anterior à revisão</div>
                </div>

                <div className="bg-[#1c1c1c] p-3 rounded border border-teal-900/40">
                  <div className="text-[11px] text-teal-400 font-medium">Nova Quota Depreciação</div>
                  <div className="text-base font-bold text-gray-100 mt-1">{formatBRL(simNovaDeprecAnual)}/ano</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">Prospectivo (CPC 27 item 51)</div>
                </div>
              </div>

              <div className="bg-[#1c1c1c] p-3 rounded border border-[#333333] space-y-2 text-xs">
                <div className="flex justify-between text-gray-300">
                  <span>Valor em Uso Projetado (FCD + Perpetuidade):</span>
                  <span className="font-semibold text-purple-400">{formatBRL(simValorEmUsoFCD)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Valor Recuperável vs Contábil:</span>
                  <span className={`font-semibold ${simPerdaImpairment > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {simPerdaImpairment > 0 ? `Desvalorização de ${formatBRL(simPerdaImpairment)}` : 'Sem Perda (Ativo Recuperável)'}
                  </span>
                </div>
              </div>

              {simPerdaImpairment > 0 && (
                <div className="bg-rose-950/30 border border-rose-800/40 p-3 rounded text-[11px] text-rose-300 leading-relaxed">
                  <strong>Ajuste Obrigatório:</strong> O valor contábil excede o valor recuperável apurado pelo FCD. Reconheça a perda por redução ao valor recuperável em contrapartida ao resultado do exercício.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: NORMAS & PROCEDIMENTOS TÉCNICOS */}
      {abaAtiva === 'normas' && (
        <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-5 space-y-5">
          <div className="border-b border-[#2d2d2d] pb-3">
            <h3 className="text-sm font-semibold text-gray-100 flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-purple-400" />
              <span>Diretrizes e Racional Técnico: CPC 27 item 51 & CPC 01 (R1)</span>
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Princípios contábeis aplicáveis à revisão de estimativas de vida útil e impairment de ativos não circulantes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-[#242424] border border-[#2e2e2e] p-4 rounded-lg space-y-2">
              <div className="flex items-center space-x-2 text-purple-400 font-semibold">
                <Clock className="w-4 h-4" />
                <span>Revisão Periódica de Vidas Úteis (CPC 27 item 51 / NBC TG 27)</span>
              </div>
              <p className="text-gray-300 text-[11px] leading-relaxed">
                O valor residual e a vida útil econômica de um ativo imobilizado devem ser revisados pelo menos ao final de cada exercício. Se as expectativas diferirem das estimativas anteriores, a alteração deve ser tratada como mudança de estimativa contábil conforme o CPC 23.
              </p>
              <ul className="list-disc list-inside text-gray-400 text-[10px] space-y-1">
                <li><strong>Efeito Prospectivo:</strong> A depreciação é recalculada sobre o valor contábil líquido remanescente pelo novo prazo sem retificar anos anteriores;</li>
                <li><strong>Laudo de Engenharia:</strong> Exige respaldo técnico de peritos registrados no CREA ou IBAPE para fins societários e fiscais;</li>
                <li><strong>Subconta Vinculada:</strong> Segregação de quotas para controle de IRPJ/CSLL societário x fiscal (Lei 12.973/14).</li>
              </ul>
            </div>

            <div className="bg-[#242424] border border-[#2e2e2e] p-4 rounded-lg space-y-2">
              <div className="flex items-center space-x-2 text-rose-400 font-semibold">
                <Activity className="w-4 h-4" />
                <span>Teste de Recuperabilidade / Impairment (CPC 01 (R1) / NBC TG 01)</span>
              </div>
              <p className="text-gray-300 text-[11px] leading-relaxed">
                Assegura que os ativos não estejam registrados por valor superior ao seu valor recuperável (maior entre Valor Justo Líquido de Despesas de Venda e Valor em Uso).
              </p>
              <ul className="list-disc list-inside text-gray-400 text-[10px] space-y-1">
                <li><strong>Unidade Geradora de Caixa (UGC):</strong> Menor grupo identificável de ativos que gera entradas de caixa amplamente independentes;</li>
                <li><strong>WACC (Custo Médio Ponderado):</strong> Taxa de desconto antes de impostos que reflete avaliações atuais de mercado do valor da moeda e riscos específicos;</li>
                <li><strong>Contabilização:</strong> D - Despesa com Perda por Impairment (Resultado) / C - Provisão para Redução ao Valor Recuperável (Redutora do Ativo).</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CRIAÇÃO / EDIÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 overflow-y-auto">
          <div className="bg-[#1e1e1e] border border-[#3d3d3d] rounded-lg max-w-3xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#2d2d2d] pb-3">
              <h3 className="text-base font-bold text-gray-100 flex items-center space-x-2">
                <RotateCcw className="w-5 h-5 text-purple-400" />
                <span>{itemEdicao ? 'Editar Laudo de Avaliação Patrimonial' : 'Novo Laudo de Avaliação / Impairment'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvar} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Código Patrimonial ou UGC *</label>
                  <input
                    type="text"
                    required
                    value={codigoPatrimonialOuUgc}
                    onChange={e => setCodigoPatrimonialOuUgc(e.target.value)}
                    placeholder="Ex: UGC-FABRICA-01 ou IMOB-842"
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Categoria do Ativo *</label>
                  <input
                    type="text"
                    required
                    value={categoriaAtivo}
                    onChange={e => setCategoriaAtivo(e.target.value)}
                    placeholder="Ex: Máquinas e Equipamentos Industriais"
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Descrição do Bem ou da UGC *</label>
                <input
                  type="text"
                  required
                  value={descricaoBemOuUgc}
                  onChange={e => setDescricaoBemOuUgc(e.target.value)}
                  placeholder="Ex: Centro de Usinagem CNC de Alta Precisão 5 Eixos"
                  className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Tipo de Avaliação *</label>
                  <select
                    value={tipoAvaliacao}
                    onChange={e => setTipoAvaliacao(e.target.value as TipoAvaliacaoPatrimonial)}
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-purple-500"
                  >
                    <option value="REVISAO_VIDA_UTIL_CPC27">Revisão Vida Útil (CPC 27)</option>
                    <option value="IMPAIRMENT_UGC_CPC01">Impairment UGC (CPC 01)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Data do Laudo / Avaliação *</label>
                  <input
                    type="date"
                    required
                    value={dataAvaliacaoLaudo}
                    onChange={e => setDataAvaliacaoLaudo(e.target.value)}
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Status do Laudo *</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as StatusLaudoPatrimonial)}
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-purple-500"
                  >
                    <option value="EM_ELABORACAO">Em Elaboração</option>
                    <option value="CONCLUIDO_HOMOLOGADO">Homologado</option>
                    <option value="APLICADO_CONTABILIDADE">Aplicado na Contabilidade</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Engenheiro / Perito Responsável *</label>
                  <input
                    type="text"
                    required
                    value={engenheiroPeritoResponsavel}
                    onChange={e => setEngenheiroPeritoResponsavel(e.target.value)}
                    placeholder="Ex: Eng. Ricardo Sampaio"
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Registro Profissional (CREA / IBAPE) *</label>
                  <input
                    type="text"
                    required
                    value={registroCreaCreci}
                    onChange={e => setRegistroCreaCreci(e.target.value)}
                    placeholder="Ex: CREA-SP 189432/D"
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Custo Histórico (BRL) *</label>
                  <input
                    type="number"
                    required
                    value={valorCustoHistoricoBRL}
                    onChange={e => setValorCustoHistoricoBRL(Number(e.target.value))}
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Deprec. Acumulada Anterior (BRL) *</label>
                  <input
                    type="number"
                    required
                    value={depreciacaoAcumuladaAnteriorBRL}
                    onChange={e => setDepreciacaoAcumuladaAnteriorBRL(Number(e.target.value))}
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Vida Útil Anterior (anos)</label>
                  <input
                    type="number"
                    value={vidaUtilAnteriorAnos}
                    onChange={e => setVidaUtilAnteriorAnos(Number(e.target.value))}
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Nova Vida Útil Remanescente (anos) *</label>
                  <input
                    type="number"
                    required
                    value={novaVidaUtilEconomicaRemanescenteAnos}
                    onChange={e => setNovaVidaUtilEconomicaRemanescenteAnos(Number(e.target.value))}
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Novo Valor Residual Estimado (BRL)</label>
                  <input
                    type="number"
                    value={novoValorResidualEstimadoBRL}
                    onChange={e => setNovoValorResidualEstimadoBRL(Number(e.target.value))}
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {tipoAvaliacao === 'IMPAIRMENT_UGC_CPC01' && (
                <div className="p-3 bg-[#242424] rounded-lg border border-purple-900/40 space-y-3">
                  <div className="text-xs font-semibold text-purple-300">Parâmetros do Teste de Recuperabilidade (CPC 01)</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-gray-400 text-[11px] mb-1">Valor Recuperável Apurado (BRL)</label>
                      <input
                        type="number"
                        value={valorRecuperavelApuradoBRL || 0}
                        onChange={e => setValorRecuperavelApuradoBRL(Number(e.target.value))}
                        className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded px-2 py-1 text-gray-100 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-[11px] mb-1">Metodologia</label>
                      <select
                        value={metodologiaValorRecuperavel}
                        onChange={e => setMetodologiaValorRecuperavel(e.target.value as MetodologiaValorRecuperavel)}
                        className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded px-2 py-1 text-gray-100 focus:outline-none focus:border-purple-500"
                      >
                        <option value="VALOR_EM_USO_FCD">Valor em Uso (FCD)</option>
                        <option value="VALOR_JUSTO_LIQUIDO_VENDA">Valor Justo Líquido de Venda</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-400 text-[11px] mb-1">Taxa WACC (% a.a.)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={taxaDescontoWaccUtilizadaPercentual}
                        onChange={e => setTaxaDescontoWaccUtilizadaPercentual(Number(e.target.value))}
                        className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded px-2 py-1 text-gray-100 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-gray-300 font-medium mb-1">Observações do Laudo Técnico</label>
                <textarea
                  rows={2}
                  value={observacoes}
                  onChange={e => setObservacoes(e.target.value)}
                  placeholder="Justificativa técnica da obsolescência física/tecnológica, inspeções visuais realizadas, número do laudo pericial..."
                  className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-[#2d2d2d]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#262626] hover:bg-[#333333] border border-[#3d3d3d] text-gray-300 rounded text-xs font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-semibold shadow-sm transition-colors"
                >
                  Salvar Avaliação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
