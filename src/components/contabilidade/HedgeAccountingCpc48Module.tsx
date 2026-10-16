import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Plus,
  RefreshCw,
  Printer,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  FileText,
  Search,
  Filter,
  Calculator,
  ArrowRightLeft,
  ChevronDown,
  ChevronUp,
  Scale,
  Sparkles,
  BookOpen,
  DollarSign,
  Activity,
  Layers,
  Edit,
  Trash2,
  Percent
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  CategoriaHedgeAccounting,
  ContratoHedgeAccounting,
  Empresa,
  ResumoHedgeAccounting,
  StatusHedge,
  TipoInstrumentoDerivativo
} from '../../types/contabil';

interface HedgeAccountingCpc48ModuleProps {
  empresaAtiva: Empresa | null;
  onOpenReportPreview?: (config: {
    titulo: string;
    subtitulo: string;
    conteudoHtml: string;
    imprimirDireto?: boolean;
  }) => void;
}

export const HedgeAccountingCpc48Module: React.FC<HedgeAccountingCpc48ModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [resumo, setResumo] = useState<ResumoHedgeAccounting | null>(null);
  const [busca, setBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('TODAS');
  const [abaAtiva, setAbaAtiva] = useState<'carteira' | 'simulador' | 'normas'>('carteira');
  const [contratoExpandidoId, setContratoExpandidoId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContrato, setEditingContrato] = useState<ContratoHedgeAccounting | null>(null);

  // Form Fields
  const [codigoDesignacao, setCodigoDesignacao] = useState('HDG-2026-003');
  const [categoria, setCategoria] = useState<CategoriaHedgeAccounting>('HEDGE_FLUXO_CAIXA');
  const [tipoDerivativo, setTipoDerivativo] = useState<TipoInstrumentoDerivativo>('TERMO_NDF_NON_DELIVERABLE_FORWARD');
  const [itemObjeto, setItemObjeto] = useState('');
  const [instrumento, setInstrumento] = useState('');
  const [contraparte, setContraparte] = useState('');
  const [dataDesignacao, setDataDesignacao] = useState('2026-03-01');
  const [dataVencimento, setDataVencimento] = useState('2026-12-31');
  const [nocional, setNocional] = useState<number>(1000000);
  const [strike, setStrike] = useState<number>(5.70);
  const [vJustoDerivativo, setVJustoDerivativo] = useState<number>(85000);
  const [vJustoItemObjeto, setVJustoItemObjeto] = useState<number>(-87000);
  const [observacoes, setObservacoes] = useState('');

  // Simulador State
  const [simVariacaoDerivativo, setSimVariacaoDerivativo] = useState<number>(150000);
  const [simVariacaoObjeto, setSimVariacaoObjeto] = useState<number>(-152000);

  const carregarDados = () => {
    if (!empresaAtiva) return;
    const res = dbService.getContratosHedge(empresaAtiva.id);
    setResumo(res);
  };

  useEffect(() => {
    carregarDados();
  }, [empresaAtiva]);

  const handleOpenNovo = () => {
    setEditingContrato(null);
    setCodigoDesignacao(`HDG-2026-00${(resumo?.contratos.length || 0) + 1}`);
    setCategoria('HEDGE_FLUXO_CAIXA');
    setTipoDerivativo('TERMO_NDF_NON_DELIVERABLE_FORWARD');
    setItemObjeto('Receitas Futuras Altamente Prováveis de Exportação de Manufaturados');
    setInstrumento('Contrato NDF Compra USD/BRL Trava de Câmbio');
    setContraparte('Banco Bradesco S.A.');
    setDataDesignacao('2026-03-01');
    setDataVencimento('2026-12-31');
    setNocional(1000000);
    setStrike(5.70);
    setVJustoDerivativo(85000);
    setVJustoItemObjeto(-87000);
    setObservacoes('Operação designada para proteção de fluxo de caixa em conformidade com política de riscos.');
    setIsModalOpen(true);
  };

  const handleOpenEditar = (c: ContratoHedgeAccounting) => {
    setEditingContrato(c);
    setCodigoDesignacao(c.codigoDesignacao);
    setCategoria(c.categoria);
    setTipoDerivativo(c.tipoDerivativo);
    setItemObjeto(c.itemObjetoHedgeDescricao);
    setInstrumento(c.instrumentoHedgeDescricao);
    setContraparte(c.instituicaoContraparte);
    setDataDesignacao(c.dataDesignacao);
    setDataVencimento(c.dataVencimentoOperacao);
    setNocional(c.nocionalMoedaEstrangeira);
    setStrike(c.taxaContratadaStrike);
    setVJustoDerivativo(c.valorJustoAtualDerivativo);
    setVJustoItemObjeto(c.valorJustoItemObjetoHedge);
    setObservacoes(c.observacoes || '');
    setIsModalOpen(true);
  };

  const handleSalvar = () => {
    if (!empresaAtiva) return;

    const efetividade = vJustoItemObjeto !== 0
      ? Math.round((Math.abs(vJustoDerivativo) / Math.abs(vJustoItemObjeto)) * 10000) / 100
      : 100;
    const efetiva = efetividade >= 80.0 && efetividade <= 125.0;

    let pl = 0;
    let dre = 0;

    if (categoria === 'HEDGE_FLUXO_CAIXA') {
      const menorVariacao = Math.min(Math.abs(vJustoDerivativo), Math.abs(vJustoItemObjeto));
      pl = vJustoDerivativo > 0 ? menorVariacao : -menorVariacao;
      dre = Math.round((vJustoDerivativo - pl) * 100) / 100;
    } else {
      dre = vJustoDerivativo;
      pl = 0;
    }

    const item: ContratoHedgeAccounting = {
      id: editingContrato ? editingContrato.id : `hdg-${Date.now()}`,
      empresaId: empresaAtiva.id,
      codigoDesignacao,
      categoria,
      tipoDerivativo,
      itemObjetoHedgeDescricao: itemObjeto,
      instrumentoHedgeDescricao: instrumento,
      instituicaoContraparte: contraparte,
      dataDesignacao,
      dataVencimentoOperacao: dataVencimento,
      nocionalMoedaEstrangeira: nocional,
      taxaContratadaStrike: strike,
      valorJustoAtualDerivativo: vJustoDerivativo,
      valorJustoItemObjetoHedge: vJustoItemObjeto,
      percentualEfetividadeApurada: efetividade,
      efetividadeNoIntervaloLegal: efetiva,
      parcelaEfetivaReconhecidaPL_DRA: pl,
      parcelaInefetivaReconhecidaDRE: dre,
      status: 'DESIGNADO_ATIVO',
      integradoContabil: editingContrato ? editingContrato.integradoContabil : false,
      observacoes
    };

    dbService.salvarContratoHedge(item);
    setIsModalOpen(false);
    carregarDados();
  };

  const handleExcluir = (id: string) => {
    if (window.confirm('Confirma a exclusão desta designação de hedge accounting?')) {
      dbService.excluirContratoHedge(id);
      carregarDados();
    }
  };

  const handleIntegrar = (id: string) => {
    const res = dbService.integrarHedgeContabil(id);
    if (res.sucesso) {
      alert(res.mensagem);
      carregarDados();
    } else {
      alert(`Falha: ${res.mensagem}`);
    }
  };

  const getNomeCategoria = (cat: CategoriaHedgeAccounting) => {
    switch (cat) {
      case 'HEDGE_FLUXO_CAIXA': return 'Hedge de Fluxo de Caixa (DRA / PL)';
      case 'HEDGE_VALOR_JUSTO': return 'Hedge de Valor Justo (Fair Value / DRE)';
      case 'HEDGE_INVESTIMENTO_LIQUIDO_EXTERIOR': return 'Investimento Líquido no Exterior';
    }
  };

  const getNomeTipoDerivativo = (tipo: TipoInstrumentoDerivativo) => {
    switch (tipo) {
      case 'TERMO_NDF_NON_DELIVERABLE_FORWARD': return 'NDF (Termo de Moedas)';
      case 'SWAP_CAMBIAL_TAXAS': return 'Swap Financeiro (Moeda / Juros)';
      case 'OPCOES_PUT_CALL': return 'Opções Vanilla (Put / Call)';
      case 'CONTRATOS_FUTUROS_B3': return 'Futuros Negociados B3';
    }
  };

  const formatarMoeda = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const contratosFiltrados = (resumo?.contratos || []).filter(c => {
    const matchBusca =
      c.codigoDesignacao.toLowerCase().includes(busca.toLowerCase()) ||
      c.itemObjetoHedgeDescricao.toLowerCase().includes(busca.toLowerCase()) ||
      c.instrumentoHedgeDescricao.toLowerCase().includes(busca.toLowerCase()) ||
      c.instituicaoContraparte.toLowerCase().includes(busca.toLowerCase());
    const matchCat = filtroCategoria === 'TODAS' || c.categoria === filtroCategoria;
    return matchBusca && matchCat;
  });

  // Geração de Laudo Pericial de Designação e Efetividade de Hedge A4
  const handleImprimirLaudoHedgeA4 = () => {
    if (!empresaAtiva || !resumo) return;

    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; padding: 25px; max-width: 950px; margin: 0 auto; line-height: 1.4;">
        <!-- CABEÇALHO OFICIAL CPC 48 -->
        <div style="border-bottom: 3px double #0f172a; padding-bottom: 15px; margin-bottom: 20px; text-align: center;">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: bold;">
            COMITÊ DE PRONUNCIAMENTOS CONTÁBEIS • NORMAS BRASILEIRAS DE CONTABILIDADE
          </div>
          <h1 style="font-size: 20px; margin: 5px 0; color: #0f172a; text-transform: uppercase; font-weight: 800;">
            LAUDO PERICIAL DE HEDGE ACCOUNTING & TESTES DE EFETIVIDADE
          </h1>
          <div style="font-size: 13px; font-weight: 600; color: #334155;">
            PRONUNCIAMENTO TÉCNICO CPC 48 (IFRS 9) • NBC TG 48 • INSTRUMENTOS FINANCEIROS DERIVATIVOS
          </div>
        </div>

        <!-- DADOS DA ENTIDADE E POLÍTICA DE RISCO -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; background: #f8fafc; border: 1px solid #cbd5e1;">
          <tr>
            <td style="padding: 8px 12px; width: 60%;"><strong>Entidade:</strong> ${empresaAtiva.razaoSocial}</td>
            <td style="padding: 8px 12px; width: 40%;"><strong>CNPJ:</strong> ${empresaAtiva.cnpj || '00.000.000/0001-00'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px;"><strong>Data da Posição / Marcação a Mercado:</strong> ${resumo.dataPosicao}</td>
            <td style="padding: 8px 12px;"><strong>Intervalo Legal de Efetividade:</strong> 80,00% a 125,00%</td>
          </tr>
        </table>

        <!-- RESUMO DA CARTEIRA DE HEDGE -->
        <div style="display: flex; gap: 12px; margin-bottom: 20px;">
          <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 4px; padding: 10px; background: #f8fafc; text-align: center;">
            <div style="font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase;">Volume Nocional</div>
            <div style="font-size: 16px; font-weight: bold; color: #0f172a; margin-top: 3px;">${formatarMoeda(resumo.totalNocionalContratadoBRL)}</div>
          </div>
          <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 4px; padding: 10px; background: #f8fafc; text-align: center;">
            <div style="font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase;">Valor Justo (MtM)</div>
            <div style="font-size: 16px; font-weight: bold; color: #0284c7; margin-top: 3px;">${formatarMoeda(resumo.totalValorJustoDerivativos)}</div>
          </div>
          <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 4px; padding: 10px; background: #f8fafc; text-align: center;">
            <div style="font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase;">Alocado em DRA / PL</div>
            <div style="font-size: 16px; font-weight: bold; color: #16a34a; margin-top: 3px;">${formatarMoeda(resumo.totalAlocadoPatrimonioLiquidoDra)}</div>
          </div>
          <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 4px; padding: 10px; background: #f8fafc; text-align: center;">
            <div style="font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase;">Inefetividade DRE</div>
            <div style="font-size: 16px; font-weight: bold; color: #d97706; margin-top: 3px;">${formatarMoeda(resumo.totalInefetividadeDRE)}</div>
          </div>
        </div>

        <!-- DEMONSTRATIVO INDIVIDUAL DAS OPERAÇÕES DESIGNADAS -->
        <h3 style="font-size: 14px; margin: 15px 0 10px 0; border-bottom: 1px solid #94a3b8; padding-bottom: 5px; color: #0f172a; text-transform: uppercase;">
          Demonstrativo de Operações Designadas sob a Contabilidade de Hedge
        </h3>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 11px;">
          <thead>
            <tr style="background: #1e293b; color: #ffffff;">
              <th style="padding: 7px; border: 1px solid #334155; text-align: center; width: 85px;">Designação</th>
              <th style="padding: 7px; border: 1px solid #334155; text-align: left;">Item Protegido vs Instrumento de Hedge</th>
              <th style="padding: 7px; border: 1px solid #334155; text-align: center;">Categoria</th>
              <th style="padding: 7px; border: 1px solid #334155; text-align: right;">MtM Derivativo</th>
              <th style="padding: 7px; border: 1px solid #334155; text-align: center;">Efetividade (%)</th>
              <th style="padding: 7px; border: 1px solid #334155; text-align: right;">Alocação PL (DRA)</th>
              <th style="padding: 7px; border: 1px solid #334155; text-align: right;">Inefetividade DRE</th>
            </tr>
          </thead>
          <tbody>
            ${resumo.contratos.map(c => `
              <tr style="border-bottom: 1px solid #cbd5e1; background: ${c.efetividadeNoIntervaloLegal ? '#ffffff' : '#fef2f2'};">
                <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; font-family: monospace;">${c.codigoDesignacao}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1;">
                  <strong>Objeto:</strong> ${c.itemObjetoHedgeDescricao}<br />
                  <strong>Instrumento:</strong> ${c.instrumentoHedgeDescricao} (${c.instituicaoContraparte})
                </td>
                <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center; font-size: 10px;">${c.categoria}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold; font-family: monospace; color: #0284c7;">
                  ${formatarMoeda(c.valorJustoAtualDerivativo)}
                </td>
                <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: ${c.efetividadeNoIntervaloLegal ? '#16a34a' : '#b91c1c'};">
                  ${c.percentualEfetividadeApurada.toFixed(2)}%<br />
                  <span style="font-size: 9px;">${c.efetividadeNoIntervaloLegal ? 'CONFORME' : 'INEFETIVO'}</span>
                </td>
                <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: right; font-family: monospace; color: #16a34a; font-weight: bold;">
                  ${formatarMoeda(c.parcelaEfetivaReconhecidaPL_DRA)}
                </td>
                <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: right; font-family: monospace; color: #d97706; font-weight: bold;">
                  ${formatarMoeda(c.parcelaInefetivaReconhecidaDRE)}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- TERMO DE CERTIFICAÇÃO TÉCNICA -->
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 4px; padding: 15px; margin-top: 20px; font-size: 11px;">
          <div style="font-weight: bold; margin-bottom: 5px; color: #0f172a;">DECLARAÇÃO FORMAL DE DESIGNAÇÃO E EFETIVIDADE (CPC 48):</div>
          <div>
            Atestamos que todas as operações acima listadas possuem documentação formal de designação elaborada no início do relacionamento de hedge, definindo a estratégia de gerenciamento de risco, o método quantitativo de mensuração de efetividade e a identificação do risco coberto.
            As variações de valor justo foram adequadamente segregadas entre Outros Resultados Abrangentes (DRA) no Patrimônio Líquido e Resultado Financeiro na DRE, mantendo a volatilidade dos balanços patrimoniais estritamente protegida.
          </div>
        </div>

        <div style="margin-top: 50px; display: flex; justify-content: space-between; text-align: center; font-size: 11px;">
          <div style="width: 45%; border-top: 1px solid #64748b; padding-top: 8px;">
            <strong>${empresaAtiva.razaoSocial}</strong><br />
            Diretoria Financeira e de Riscos (CFO)<br />
            CPF: ____________________________
          </div>
          <div style="width: 45%; border-top: 1px solid #64748b; padding-top: 8px;">
            <strong>PERITO CONTÁBIL RESPONSÁVEL</strong><br />
            CRC nº 1SP-999999/O-0 • Especialista IFRS 9<br />
            Chave Hash ICP-Brasil: HEDGE-CPC48-CERT
          </div>
        </div>
      </div>
    `;

    if (onOpenReportPreview) {
      onOpenReportPreview({
        titulo: 'Laudo Pericial de Hedge Accounting & Teste de Efetividade',
        subtitulo: `Data: ${resumo.dataPosicao} • Entidade: ${empresaAtiva.razaoSocial}`,
        conteudoHtml: html
      });
    } else {
      const w = window.open('', '_blank');
      if (w) {
        w.document.write(`<html><head><title>Laudo Hedge Accounting CPC 48</title></head><body>${html}</body></html>`);
        w.document.close();
      }
    }
  };

  // Cálculos do Simulador de Efetividade
  const simEfetividade = simVariacaoObjeto !== 0
    ? Math.round((Math.abs(simVariacaoDerivativo) / Math.abs(simVariacaoObjeto)) * 10000) / 100
    : 100;
  const simDentroLimite = simEfetividade >= 80.0 && simEfetividade <= 125.0;

  return (
    <div className="flex flex-col h-full bg-[#141414] text-neutral-200">
      {/* HEADER BAR */}
      <div className="border-b border-neutral-800 bg-[#1a1a1a] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              Derivativos & Contabilidade de Hedge (Hedge Accounting)
              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                CPC 48 / NBC TG 48 / IFRS 9
              </span>
            </h1>
            <p className="text-xs text-neutral-400">
              Hedge de Fluxo de Caixa (DRA/PL), Hedge de Valor Justo (DRE) e testes de efetividade entre 80% e 125%.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={carregarDados}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
            title="Atualizar dados"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleImprimirLaudoHedgeA4}
            className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-semibold border border-neutral-700 transition-colors"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            Laudo Pericial A4
          </button>

          <button
            onClick={handleOpenNovo}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nova Designação de Hedge
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 p-6 pb-2">
        {/* Nocional Contratado */}
        <div className="bg-[#1e1e1e] border border-neutral-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Volume Nocional</span>
            <DollarSign className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">
            {formatarMoeda(resumo?.totalNocionalContratadoBRL || 0)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">Total de ativos/passivos protegidos</div>
        </div>

        {/* Valor Justo MtM */}
        <div className="bg-[#1e1e1e] border border-neutral-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Valor Justo (MtM)</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono">
            {formatarMoeda(resumo?.totalValorJustoDerivativos || 0)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">Marcação a mercado dos derivativos</div>
        </div>

        {/* Alocado em DRA / PL */}
        <div className="bg-[#1e1e1e] border border-neutral-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Alocado em DRA / PL</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono">
            {formatarMoeda(resumo?.totalAlocadoPatrimonioLiquidoDra || 0)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">Parcela efetiva (Cash Flow Hedge)</div>
        </div>

        {/* Inefetividade DRE */}
        <div className="bg-[#1e1e1e] border border-neutral-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Inefetividade na DRE</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400 font-mono">
            {formatarMoeda(resumo?.totalInefetividadeDRE || 0)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">Resultado financeiro imediato</div>
        </div>

        {/* Status Geral Efetividade */}
        <div className="bg-[#1e1e1e] border border-neutral-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Efetividade Global</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-base font-bold font-mono ${resumo?.todasOperacoesEfetivas ? 'text-emerald-400' : 'text-rose-400'}`}>
              {resumo?.todasOperacoesEfetivas ? '100% CONFORME' : 'ATENÇÃO: INEFETIVO'}
            </span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">Intervalo 80% a 125% CPC 48</div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center border-b border-neutral-800 px-6 gap-6 text-xs font-semibold">
        <button
          onClick={() => setAbaAtiva('carteira')}
          className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
            abaAtiva === 'carteira'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Carteira de Operações Designadas
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-neutral-800 text-[10px] text-neutral-300">
            {resumo?.contratos.length || 0}
          </span>
        </button>

        <button
          onClick={() => setAbaAtiva('simulador')}
          className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
            abaAtiva === 'simulador'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Calculator className="w-4 h-4" />
          Simulador de Efetividade (80%-125%)
        </button>

        <button
          onClick={() => setAbaAtiva('normas')}
          className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
            abaAtiva === 'normas'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Normas CPC 48 & Política de Riscos
        </button>
      </div>

      {/* TAB CONTENT: CARTEIRA */}
      {abaAtiva === 'carteira' && (
        <div className="flex-1 flex flex-col overflow-hidden p-6 gap-4">
          {/* SEARCH & FILTERS */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md bg-[#1a1a1a] border border-neutral-800 rounded-lg px-3 py-1.5">
              <Search className="w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={busca}
                onChange={e => setBusca(e.target.value)}
                placeholder="Buscar por código, objeto, derivativo ou contraparte..."
                className="bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none w-full"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-neutral-400" />
              <select
                value={filtroCategoria}
                onChange={e => setFiltroCategoria(e.target.value)}
                className="bg-[#1a1a1a] border border-neutral-800 text-neutral-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                <option value="TODAS">Todas as Categorias</option>
                <option value="HEDGE_FLUXO_CAIXA">Hedge de Fluxo de Caixa (DRA)</option>
                <option value="HEDGE_VALOR_JUSTO">Hedge de Valor Justo (DRE)</option>
                <option value="HEDGE_INVESTIMENTO_LIQUIDO_EXTERIOR">Investimento no Exterior</option>
              </select>
            </div>
          </div>

          {/* LISTA DE CONTRATOS */}
          <div className="flex-1 overflow-y-auto space-y-3">
            {contratosFiltrados.length === 0 ? (
              <div className="bg-[#1a1a1a] border border-neutral-800 rounded-xl p-12 text-center text-neutral-500">
                Nenhuma operação de hedge designada encontrada.
              </div>
            ) : (
              contratosFiltrados.map(c => {
                const isExpanded = contratoExpandidoId === c.id;

                return (
                  <div
                    key={c.id}
                    className={`bg-[#1a1a1a] border rounded-xl transition-all ${
                      c.efetividadeNoIntervaloLegal
                        ? 'border-neutral-800 hover:border-neutral-700'
                        : 'border-rose-500/30 bg-rose-950/10'
                    }`}
                  >
                    <div
                      onClick={() => setContratoExpandidoId(isExpanded ? null : c.id)}
                      className="p-4 flex flex-wrap items-center justify-between gap-4 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-[#222] border border-neutral-700 text-emerald-400">
                          {c.codigoDesignacao}
                        </span>
                        <div>
                          <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            {c.itemObjetoHedgeDescricao}
                          </h3>
                          <div className="text-[11px] text-neutral-400 mt-0.5">
                            {getNomeCategoria(c.categoria)} • Contraparte: <span className="text-neutral-300">{c.instituicaoContraparte}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-[10px] text-neutral-400">Valor Justo Derivativo</div>
                          <div className="font-mono text-sm font-bold text-white">
                            {formatarMoeda(c.valorJustoAtualDerivativo)}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-[10px] text-neutral-400">Efetividade</div>
                          <div className={`font-mono text-sm font-bold ${c.efetividadeNoIntervaloLegal ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {c.percentualEfetividadeApurada.toFixed(2)}%
                          </div>
                        </div>

                        <div>
                          {c.integradoContabil ? (
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[10px] border border-emerald-500/20">
                              Integrado
                            </span>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleIntegrar(c.id);
                              }}
                              className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 rounded text-[10px] border border-emerald-500/30 transition-colors"
                            >
                              Integrar Contábil
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditar(c);
                            }}
                            className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExcluir(c.id);
                            }}
                            className="p-1 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {isExpanded ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-5 pb-5 pt-2 border-t border-neutral-800/80 text-xs space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 font-mono">
                          <div className="bg-[#222] p-3 rounded-lg border border-neutral-700/80">
                            <span className="text-[10px] text-neutral-400 uppercase block mb-1">Instrumento Derivativo</span>
                            <span className="text-white font-bold block">{c.instrumentoHedgeDescricao}</span>
                            <span className="text-[10px] text-neutral-400 mt-1 block">Tipo: {getNomeTipoDerivativo(c.tipoDerivativo)}</span>
                          </div>

                          <div className="bg-[#222] p-3 rounded-lg border border-neutral-700/80">
                            <span className="text-[10px] text-neutral-400 uppercase block mb-1">Parâmetros Contratuais</span>
                            <span className="text-white font-bold block">Nocional: {c.nocionalMoedaEstrangeira.toLocaleString('pt-BR')}</span>
                            <span className="text-[10px] text-neutral-400 mt-1 block">Taxa Strike: {c.taxaContratadaStrike.toFixed(4)}</span>
                          </div>

                          <div className="bg-[#222] p-3 rounded-lg border border-neutral-700/80">
                            <span className="text-[10px] text-emerald-400 uppercase block mb-1">Alocação no PL (DRA)</span>
                            <span className="text-emerald-400 font-bold block">{formatarMoeda(c.parcelaEfetivaReconhecidaPL_DRA)}</span>
                            <span className="text-[10px] text-neutral-400 mt-1 block">Ajuste de Avaliação Patrimonial</span>
                          </div>

                          <div className="bg-[#222] p-3 rounded-lg border border-neutral-700/80">
                            <span className="text-[10px] text-amber-400 uppercase block mb-1">Inefetividade na DRE</span>
                            <span className="text-amber-400 font-bold block">{formatarMoeda(c.parcelaInefetivaReconhecidaDRE)}</span>
                            <span className="text-[10px] text-neutral-400 mt-1 block">Resultado Financeiro</span>
                          </div>
                        </div>

                        {c.observacoes && (
                          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-300">
                            <strong>Observações da Designação:</strong> {c.observacoes}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: SIMULADOR DE EFETIVIDADE */}
      {abaAtiva === 'simulador' && (
        <div className="flex-1 overflow-auto p-6 max-w-4xl mx-auto w-full">
          <div className="bg-[#1a1a1a] border border-neutral-800 rounded-xl p-6">
            <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-400" />
              Simulador Quantitativo de Efetividade de Hedge (Razão de Cobertura)
            </h2>
            <p className="text-xs text-neutral-400 mb-6">
              Teste a relação matemática entre a oscilação de valor justo do instrumento derivativo e do item objeto para verificar se a operação permanece elegível ao intervalo de 80% a 125% do CPC 48.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Variação do Derivativo (MtM) (R$)</label>
                <input
                  type="number"
                  value={simVariacaoDerivativo}
                  onChange={e => setSimVariacaoDerivativo(Number(e.target.value))}
                  className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Variação do Item Protegido (R$)</label>
                <input
                  type="number"
                  value={simVariacaoObjeto}
                  onChange={e => setSimVariacaoObjeto(Number(e.target.value))}
                  className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="bg-[#222] border border-neutral-700 rounded-xl p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4">
                Resultado do Teste Retrospectivo / Prospectivo
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="bg-[#1a1a1a] p-3 rounded-lg border border-neutral-800">
                  <div className="text-[11px] text-neutral-400 mb-1">Razão de Efetividade</div>
                  <div className={`text-xl font-bold font-mono ${simDentroLimite ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {simEfetividade.toFixed(2)}%
                  </div>
                </div>

                <div className="bg-[#1a1a1a] p-3 rounded-lg border border-neutral-800">
                  <div className="text-[11px] text-neutral-400 mb-1">Status de Conformidade</div>
                  <div className={`text-base font-bold ${simDentroLimite ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {simDentroLimite ? 'ALTAMENTE EFETIVO' : 'INEFETIVO (DESCONTINUAÇÃO)'}
                  </div>
                </div>

                <div className="bg-[#1a1a1a] p-3 rounded-lg border border-neutral-800">
                  <div className="text-[11px] text-neutral-400 mb-1">Tratamento Contábil</div>
                  <div className="text-xs font-semibold text-white">
                    {simDentroLimite ? 'Reconhece no PL (DRA)' : 'Transfere 100% para a DRE'}
                  </div>
                </div>
              </div>

              <div className={`mt-4 p-3 rounded-lg flex items-center gap-3 ${
                simDentroLimite ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
              }`}>
                {simDentroLimite ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertTriangle className="w-5 h-5 flex-shrink-0" />}
                <div className="text-xs">
                  <strong>{simDentroLimite ? 'OPERAÇÃO QUALIFICADA PARA HEDGE ACCOUNTING' : 'ALERTA DE DESCONTINUAÇÃO MANDATÓRIA'}</strong>
                  <p className="text-[11px] opacity-80 mt-0.5">
                    {simDentroLimite
                      ? 'A relação de compensação encontra-se dentro dos parâmetros regulamentares do CPC 48 (entre 80% e 125%). A volatilidade patrimonial permanece mitigada no Balanço.'
                      : 'A relação ultrapassa o intervalo legal. A contabilidade de hedge deve ser descontinuada prospectivamente e todos os ajustes subsequentes devem transitar de imediato pelo resultado operacional.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: NORMAS */}
      {abaAtiva === 'normas' && (
        <div className="flex-1 overflow-auto p-6 max-w-4xl mx-auto w-full space-y-4">
          <div className="bg-[#1a1a1a] border border-neutral-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-400" />
              Requisitos de Elegibilidade do CPC 48 / NBC TG 48
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Para qualificar-se à contabilização de hedge, o relacionamento deve ser formalmente designado no início da operação, identificando o objetivo de gestão de riscos, o item protegido e o instrumento de hedge. Deve existir uma relação econômica entre o item protegido e o instrumento de hedge e o risco de crédito não pode dominar as alterações de valor.
            </p>
          </div>

          <div className="bg-[#1a1a1a] border border-neutral-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              Mecanismo de Reciclagem para o Resultado (Reclassificação do PL)
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              No Hedge de Fluxo de Caixa, os ganhos ou perdas acumulados na conta de Outros Resultados Abrangentes (DRA) permanecem no Patrimônio Líquido até que a transação futura prevista afete a Demonstração do Resultado (ex: quando a exportação é faturada ou o juro é pago). Nesse momento, os valores acumulados são reciclados do PL diretamente para a mesma linha de receita ou despesa do item protegido.
            </p>
          </div>
        </div>
      )}

      {/* MODAL NOVA/EDITAR DESIGNAÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#1a1a1a] border border-neutral-800 rounded-xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                {editingContrato ? 'Editar Operação de Hedge' : 'Nova Designação Formal de Hedge Accounting'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>
            <div className="p-6 space-y-3 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-400 mb-1 block">Código da Designação</label>
                  <input type="text" value={codigoDesignacao} onChange={e => setCodigoDesignacao(e.target.value)} className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono" />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 mb-1 block">Categoria de Hedge</label>
                  <select value={categoria} onChange={e => setCategoria(e.target.value as CategoriaHedgeAccounting)} className="w-full bg-[#222] border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white">
                    <option value="HEDGE_FLUXO_CAIXA">Hedge de Fluxo de Caixa (DRA/PL)</option>
                    <option value="HEDGE_VALOR_JUSTO">Hedge de Valor Justo (DRE)</option>
                    <option value="HEDGE_INVESTIMENTO_LIQUIDO_EXTERIOR">Investimento no Exterior</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Tipo de Instrumento Derivativo</label>
                <select value={tipoDerivativo} onChange={e => setTipoDerivativo(e.target.value as TipoInstrumentoDerivativo)} className="w-full bg-[#222] border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white">
                  <option value="TERMO_NDF_NON_DELIVERABLE_FORWARD">NDF (Non-Deliverable Forward)</option>
                  <option value="SWAP_CAMBIAL_TAXAS">Swap (Moeda / Taxas de Juros)</option>
                  <option value="OPCOES_PUT_CALL">Opções de Câmbio / Commodities</option>
                  <option value="CONTRATOS_FUTUROS_B3">Contratos Futuros B3</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Descrição do Item Objeto Protegido</label>
                <input type="text" value={itemObjeto} onChange={e => setItemObjeto(e.target.value)} placeholder="Ex: Receitas de Exportação de Soja 2026/27" className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white" />
              </div>

              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Descrição do Instrumento de Hedge</label>
                <input type="text" value={instrumento} onChange={e => setInstrumento(e.target.value)} placeholder="Ex: NDF Compra USD/BRL Banco Santander" className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-400 mb-1 block">Contraparte Financeira</label>
                  <input type="text" value={contraparte} onChange={e => setContraparte(e.target.value)} placeholder="Ex: Banco Santander S.A." className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white" />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 mb-1 block">Volume Nocional</label>
                  <input type="number" value={nocional} onChange={e => setNocional(Number(e.target.value))} className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-400 mb-1 block">Valor Justo Derivativo (MtM) (R$)</label>
                  <input type="number" value={vJustoDerivativo} onChange={e => setVJustoDerivativo(Number(e.target.value))} className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono" />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 mb-1 block">Variação do Item Protegido (R$)</label>
                  <input type="number" value={vJustoItemObjeto} onChange={e => setVJustoItemObjeto(Number(e.target.value))} className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono" />
                </div>
              </div>

              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Observações da Tesouraria</label>
                <textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white h-16 resize-none" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-neutral-800 bg-[#161616]">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-1.5 text-xs text-neutral-400 hover:text-white">Cancelar</button>
              <button onClick={handleSalvar} className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold">Salvar Designação</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
