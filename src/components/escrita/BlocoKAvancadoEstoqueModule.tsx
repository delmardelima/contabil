import React, { useState } from 'react';
import { dbService } from '../../db/sqliteService';
import {
  Empresa,
  ItemAjusteBlocoK,
  TipoMovimentacaoInternaK,
  MotivoAjusteEstoque,
  ResumoBlocoKAvancado
} from '../../types/contabil';
import {
  Boxes,
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle2,
  Download,
  Printer,
  X,
  FileText,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Layers,
  ShieldAlert,
  RotateCcw,
  RefreshCw,
  PackageCheck
} from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

interface BlocoKAvancadoEstoqueModuleProps {
  empresaAtiva: Empresa;
  onOpenReportPreview?: (config: {
    titulo: string;
    subtitulo: string;
    conteudo?: React.ReactNode;
    linhas?: any[];
  }) => void;
}

export const BlocoKAvancadoEstoqueModule: React.FC<BlocoKAvancadoEstoqueModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [competencia, setCompetencia] = useState<string>('2026-03');
  const [itens, setItens] = useState<ItemAjusteBlocoK[]>(() => dbService.getItensAjusteBlocoK(empresaAtiva.id, '2026-03'));
  const [filtroTexto, setFiltroTexto] = useState<string>('');
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');
  const [filtroMotivo, setFiltroMotivo] = useState<string>('TODOS');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editando, setEditando] = useState<ItemAjusteBlocoK | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string>('');

  // Form State
  const [dataMovimento, setDataMovimento] = useState<string>(new Date().toISOString().slice(0, 10));
  const [tipo, setTipo] = useState<TipoMovimentacaoInternaK>('PERDA_PROCESSO_NORMAL');
  const [motivo, setMotivo] = useState<MotivoAjusteEstoque>('PERDA_EVAPORACAO_NORMAL');
  const [codigoProdutoOrigem, setCodigoProdutoOrigem] = useState<string>('MP-0010');
  const [descricaoProdutoOrigem, setDescricaoProdutoOrigem] = useState<string>('Bobina de Aço Laminado 2mm');
  const [unidadeOrigem, setUnidadeOrigem] = useState<string>('KG');
  const [quantidadeOrigem, setQuantidadeOrigem] = useState<string>('150');
  const [custoUnitarioOrigem, setCustoUnitarioOrigem] = useState<string>('8,50');
  
  // Destino (K220)
  const [codigoProdutoDestino, setCodigoProdutoDestino] = useState<string>('');
  const [descricaoProdutoDestino, setDescricaoProdutoDestino] = useState<string>('');
  const [unidadeDestino, setUnidadeDestino] = useState<string>('UN');
  const [quantidadeDestino, setQuantidadeDestino] = useState<string>('');

  // Estornos
  const [exigeEstornoCreditoFiscal, setExigeEstornoCreditoFiscal] = useState<boolean>(false);
  const [valorEstornoIcms, setValorEstornoIcms] = useState<string>('0,00');
  const [valorEstornoPisCofins, setValorEstornoPisCofins] = useState<string>('0,00');
  const [numeroLaudoPericial, setNumeroLaudoPericial] = useState<string>('');
  const [observacoes, setObservacoes] = useState<string>('');

  const handleRecarregar = () => {
    setItens(dbService.getItensAjusteBlocoK(empresaAtiva.id, competencia));
  };

  const parseValor = (valStr: string): number => {
    const cleaned = valStr.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  const calcularEstornoAutomatico = (valTotal: number, exige: boolean) => {
    if (!exige) {
      setValorEstornoIcms('0,00');
      setValorEstornoPisCofins('0,00');
      return;
    }
    // Alíquotas padrão ICMS 18% e PIS/COFINS 9.25% não-cumulativo
    const icms = Math.round(valTotal * 0.18 * 100) / 100;
    const pisCofins = Math.round(valTotal * 0.0925 * 100) / 100;
    setValorEstornoIcms(icms.toFixed(2).replace('.', ','));
    setValorEstornoPisCofins(pisCofins.toFixed(2).replace('.', ','));
  };

  const handleTipoChange = (newTipo: TipoMovimentacaoInternaK) => {
    setTipo(newTipo);
    const exige = newTipo === 'QUEBRA_ANORMAL_EXTRAVIO';
    setExigeEstornoCreditoFiscal(exige);
    const qtd = parseValor(quantidadeOrigem);
    const unit = parseValor(custoUnitarioOrigem);
    calcularEstornoAutomatico(qtd * unit, exige);

    if (newTipo === 'PERDA_PROCESSO_NORMAL') {
      setMotivo('PERDA_EVAPORACAO_NORMAL');
    } else if (newTipo === 'QUEBRA_ANORMAL_EXTRAVIO') {
      setMotivo('FURTO_EXTRAVIO');
    } else if (newTipo === 'K220_RECLASSIFICACAO') {
      setMotivo('DESMEMBRAMENTO_INSUMO');
    } else if (newTipo === 'K280_CORRECAO_APONTAMENTO') {
      setMotivo('CORRECAO_INVENTARIO');
    }
  };

  const abrirModalNovo = () => {
    setEditando(null);
    setDataMovimento(new Date().toISOString().slice(0, 10));
    setTipo('PERDA_PROCESSO_NORMAL');
    setMotivo('PERDA_EVAPORACAO_NORMAL');
    setCodigoProdutoOrigem('MP-0010');
    setDescricaoProdutoOrigem('Bobina de Aço Laminado 2mm');
    setUnidadeOrigem('KG');
    setQuantidadeOrigem('150');
    setCustoUnitarioOrigem('8,50');
    setCodigoProdutoDestino('');
    setDescricaoProdutoDestino('');
    setUnidadeDestino('UN');
    setQuantidadeDestino('');
    setExigeEstornoCreditoFiscal(false);
    setValorEstornoIcms('0,00');
    setValorEstornoPisCofins('0,00');
    setNumeroLaudoPericial(`LAUDO-${competencia.replace('-', '')}/${Math.floor(100 + Math.random() * 900)}`);
    setObservacoes('');
    setShowModal(true);
  };

  const abrirModalEditar = (item: ItemAjusteBlocoK) => {
    setEditando(item);
    setDataMovimento(item.dataMovimento);
    setTipo(item.tipo);
    setMotivo(item.motivo);
    setCodigoProdutoOrigem(item.codigoProdutoOrigem);
    setDescricaoProdutoOrigem(item.descricaoProdutoOrigem);
    setUnidadeOrigem(item.unidadeOrigem);
    setQuantidadeOrigem(item.quantidadeOrigem.toString());
    setCustoUnitarioOrigem(item.custoUnitarioOrigem.toFixed(2).replace('.', ','));
    setCodigoProdutoDestino(item.codigoProdutoDestino || '');
    setDescricaoProdutoDestino(item.descricaoProdutoDestino || '');
    setUnidadeDestino(item.unidadeDestino || 'UN');
    setQuantidadeDestino(item.quantidadeDestino ? item.quantidadeDestino.toString() : '');
    setExigeEstornoCreditoFiscal(item.exigeEstornoCreditoFiscal);
    setValorEstornoIcms(item.valorEstornoIcms ? item.valorEstornoIcms.toFixed(2).replace('.', ',') : '0,00');
    setValorEstornoPisCofins(item.valorEstornoPisCofins ? item.valorEstornoPisCofins.toFixed(2).replace('.', ',') : '0,00');
    setNumeroLaudoPericial(item.numeroLaudoPericial || '');
    setObservacoes(item.observacoes || '');
    setShowModal(true);
  };

  const handleSalvarItem = (e: React.FormEvent) => {
    e.preventDefault();
    const qtd = parseValor(quantidadeOrigem);
    const custo = parseValor(custoUnitarioOrigem);
    const total = Math.round(qtd * custo * 100) / 100;
    const estIcms = parseValor(valorEstornoIcms);
    const estPisCofins = parseValor(valorEstornoPisCofins);

    const itemData: ItemAjusteBlocoK = {
      id: editando ? editando.id : `k_${Date.now()}`,
      empresaId: empresaAtiva.id,
      dataMovimento,
      competencia,
      tipo,
      motivo,
      produtoOrigemId: 1,
      codigoProdutoOrigem,
      descricaoProdutoOrigem,
      unidadeOrigem,
      quantidadeOrigem: qtd,
      custoUnitarioOrigem: custo,
      valorTotalOrigem: total,
      codigoProdutoDestino: codigoProdutoDestino || undefined,
      descricaoProdutoDestino: descricaoProdutoDestino || undefined,
      unidadeDestino: unidadeDestino || undefined,
      quantidadeDestino: quantidadeDestino ? parseValor(quantidadeDestino) : undefined,
      exigeEstornoCreditoFiscal,
      valorEstornoIcms: exigeEstornoCreditoFiscal ? estIcms : 0,
      valorEstornoPisCofins: exigeEstornoCreditoFiscal ? estPisCofins : 0,
      numeroLaudoPericial,
      integradoContabil: editando ? editando.integradoContabil : false,
      observacoes
    };

    dbService.salvarItemAjusteBlocoK(itemData);
    handleRecarregar();
    setShowModal(false);
    setMensagemSucesso(`Movimentação do Bloco K salva com sucesso!`);
    setTimeout(() => setMensagemSucesso(''), 5000);
  };

  const handleExcluirItem = (id: string, cod: string) => {
    if (confirm(`Excluir apontamento de estoque para o produto ${cod}?`)) {
      dbService.excluirItemAjusteBlocoK(id);
      handleRecarregar();
      setMensagemSucesso(`Apontamento excluído.`);
      setTimeout(() => setMensagemSucesso(''), 4000);
    }
  };

  const handleIntegrarContabilidade = () => {
    const res = dbService.integrarAjusteEstoqueContabil(empresaAtiva.id, competencia);
    if (res.sucesso) {
      handleRecarregar();
      setMensagemSucesso(res.mensagem);
      setTimeout(() => setMensagemSucesso(''), 7000);
    } else {
      alert(res.mensagem);
    }
  };

  // Resumo
  const resumo: ResumoBlocoKAvancado = dbService.getResumoBlocoKAvancado(empresaAtiva.id, competencia);

  // Filtros
  const itensFiltrados = itens.filter(i => {
    const matchTexto = i.codigoProdutoOrigem.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      i.descricaoProdutoOrigem.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      (i.numeroLaudoPericial && i.numeroLaudoPericial.toLowerCase().includes(filtroTexto.toLowerCase()));
    const matchTipo = filtroTipo === 'TODOS' || i.tipo === filtroTipo;
    const matchMotivo = filtroMotivo === 'TODOS' || i.motivo === filtroMotivo;
    return matchTexto && matchTipo && matchMotivo;
  });

  const handleExportarCSV = () => {
    const rows = itensFiltrados.map(i => ({
      ID: i.id,
      Data: i.dataMovimento,
      Competencia: i.competencia,
      Tipo: i.tipo,
      Motivo: i.motivo,
      CodigoOrigem: i.codigoProdutoOrigem,
      DescricaoOrigem: i.descricaoProdutoOrigem,
      QtdOrigem: i.quantidadeOrigem,
      UnidadeOrigem: i.unidadeOrigem,
      CustoUnitario: i.custoUnitarioOrigem,
      ValorTotal: i.valorTotalOrigem,
      CodigoDestino: i.codigoProdutoDestino || 'N/A',
      DescricaoDestino: i.descricaoProdutoDestino || 'N/A',
      ExigeEstorno: i.exigeEstornoCreditoFiscal ? 'SIM' : 'NÃO',
      EstornoICMS: i.valorEstornoIcms || 0,
      EstornoPisCofins: i.valorEstornoPisCofins || 0,
      Laudo: i.numeroLaudoPericial || 'N/A',
      IntegradoContabil: i.integradoContabil ? 'SIM' : 'NÃO'
    }));
    exportToCSV(rows, `bloco_k_estoques_${competencia}_${empresaAtiva.cnpj.replace(/\D/g, '')}`);
  };

  const handleImprimirLaudo = () => {
    if (!onOpenReportPreview) return;

    onOpenReportPreview({
      titulo: 'LAUDO DE AUDITORIA DE ESTOQUES & APONTAMENTOS DO BLOCO K',
      subtitulo: `SPED Fiscal Registros K280 / K220 | Art. 303 do RIR/2018 - Competência ${competencia}`,
      conteudo: (
        <div className="p-8 space-y-6 text-slate-800 text-xs">
          <div className="border-b-2 border-slate-700 pb-3 flex justify-between items-end">
            <div>
              <h1 className="text-xl font-bold uppercase tracking-wider">{empresaAtiva.razaoSocial}</h1>
              <p className="text-slate-600">CNPJ: {empresaAtiva.cnpj} | Inscrição Estadual: {empresaAtiva.inscricaoEstadual}</p>
              <p className="text-slate-600 font-semibold mt-1">
                DEMONSTRATIVO ANALÍTICO DE PERDAS INDUSTRIAIS, QUEBRAS E ESTORNOS DE CRÉDITO
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded border border-amber-300">
                SPED FISCAL / BLOCO K
              </span>
              <p className="text-[10px] text-slate-500 mt-1">Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          {/* Cards Resumo */}
          <div className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-300">
            <div>
              <span className="text-slate-500 block text-[10px]">PERDAS NORMAIS (CPV)</span>
              <span className="font-bold text-sm text-emerald-800">
                R$ {resumo.totalPerdasNormaisCPV.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[9px] text-slate-500 block">Sem estorno conf. Art 303 RIR</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">QUEBRAS ANORMAIS (DRE)</span>
              <span className="font-bold text-sm text-rose-800">
                R$ {resumo.totalQuebrasAnormaisDRE.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[9px] text-slate-500 block">Extravio/Deterioração</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">ESTORNOS TRIBUTÁRIOS</span>
              <span className="font-bold text-sm text-amber-800">
                R$ {resumo.totalEstornosTributarios.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[9px] text-slate-500 block">ICMS + PIS/COFINS revertidos</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">RECLASSIFICAÇÕES K220</span>
              <span className="font-bold text-sm text-blue-800">
                R$ {resumo.totalReclassificacoesK220.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[9px] text-slate-500 block">Movimentação interna insumos</span>
            </div>
          </div>

          {/* Tabela Analítica */}
          <div>
            <h2 className="font-bold text-sm uppercase text-slate-800 mb-2 border-b border-slate-300 pb-1">
              Relação de Apontamentos de Estoque e Ajustes de Inventário
            </h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-200 text-slate-700 text-[10px] uppercase">
                  <th className="p-2 border border-slate-300">Data / Origem</th>
                  <th className="p-2 border border-slate-300">Tipo de Evento</th>
                  <th className="p-2 border border-slate-300">Motivo Regulamentar</th>
                  <th className="p-2 border border-slate-300 text-right">Qtd</th>
                  <th className="p-2 border border-slate-300 text-right">Valor Total (R$)</th>
                  <th className="p-2 border border-slate-300 text-right">Estorno Fiscal (R$)</th>
                  <th className="p-2 border border-slate-300 text-center">Laudo / Status</th>
                </tr>
              </thead>
              <tbody>
                {itensFiltrados.map((i, idx) => (
                  <tr key={i.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="p-2 border border-slate-300">
                      <div className="font-bold">{i.codigoProdutoOrigem}</div>
                      <div className="text-[10px] text-slate-600">{i.descricaoProdutoOrigem}</div>
                      <div className="text-[9px] text-slate-400 font-mono">{i.dataMovimento}</div>
                    </td>
                    <td className="p-2 border border-slate-300">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        i.tipo === 'PERDA_PROCESSO_NORMAL'
                          ? 'bg-emerald-100 text-emerald-800'
                          : i.tipo === 'QUEBRA_ANORMAL_EXTRAVIO'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {i.tipo}
                      </span>
                    </td>
                    <td className="p-2 border border-slate-300 font-mono text-[10px] text-slate-700">
                      {i.motivo}
                    </td>
                    <td className="p-2 border border-slate-300 text-right font-mono">
                      {i.quantidadeOrigem} {i.unidadeOrigem}
                    </td>
                    <td className="p-2 border border-slate-300 text-right font-mono font-bold">
                      R$ {i.valorTotalOrigem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2 border border-slate-300 text-right font-mono font-bold text-amber-800">
                      {i.exigeEstornoCreditoFiscal
                        ? `R$ ${((i.valorEstornoIcms || 0) + (i.valorEstornoPisCofins || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                        : '-'}
                    </td>
                    <td className="p-2 border border-slate-300 text-center">
                      <div className="text-[9px] font-semibold text-slate-800">{i.numeroLaudoPericial || 'S/N'}</div>
                      <span className={`text-[8px] px-1 py-0.5 rounded font-bold ${
                        i.integradoContabil ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {i.integradoContabil ? 'CONTABILIZADO' : 'PENDENTE'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Enquadramento Legal */}
          <div className="border border-slate-300 bg-slate-50 p-4 rounded text-[11px] leading-relaxed">
            <h3 className="font-bold text-slate-800 uppercase mb-1">Fundamentação Fiscal e Jurisprudência (Art. 303 do RIR/2018):</h3>
            <p className="text-slate-700">
              Conforme preceitua o Art. 303 do Regulamento do Imposto de Renda (Decreto nº 9.580/2018), integram o custo de produção as quebras e perdas razoáveis, em virtude do manuseio, transporte e descarte normal no processo fabril, devidamente comprovadas por laudo técnico firmado por perito ou autoridade competente. As quebras extraordinárias decorrentes de perecimento, avaria, deterioração ou extravio não são absorvidas no CPV e exigem o competente estorno dos créditos fiscais aforados na entrada (Art. 21, II da Lei Complementar nº 87/96 - Lei Kandir).
            </p>
          </div>
        </div>
      )
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#141414] text-slate-200">
      {/* Header */}
      <div className="border-b border-[#2d2d2d] bg-[#1a1a1a] p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Boxes className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-100">
              Auditoria de Estoques & Bloco K Avançado (K220 / K280 / Art. 303 RIR)
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Rastreabilidade de Perdas Industriais, Quebras Extraordinárias, Estornos Fiscais e Reclassificações SPED
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Competência Selector */}
          <input
            type="month"
            value={competencia}
            onChange={e => {
              setCompetencia(e.target.value);
              setItens(dbService.getItensAjusteBlocoK(empresaAtiva.id, e.target.value));
            }}
            className="bg-[#242424] border border-[#383838] rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
          />

          <button
            onClick={handleIntegrarContabilidade}
            className="px-3 py-1.5 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 border border-emerald-500/30 transition-colors"
          >
            <PackageCheck className="w-3.5 h-3.5 text-emerald-400" />
            Integrar Diário Geral
          </button>
          <button
            onClick={handleExportarCSV}
            className="px-3 py-1.5 rounded bg-[#242424] hover:bg-[#2e2e2e] text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-[#383838] transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-300" />
            Exportar CSV
          </button>
          <button
            onClick={handleImprimirLaudo}
            className="px-3 py-1.5 rounded bg-[#242424] hover:bg-[#2e2e2e] text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-[#383838] transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            Laudo Técnico A4
          </button>
          <button
            onClick={abrirModalNovo}
            className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Novo Apontamento
          </button>
        </div>
      </div>

      {mensagemSucesso && (
        <div className="bg-emerald-950/40 border-b border-emerald-500/30 px-4 py-2.5 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{mensagemSucesso}</span>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-3.5 shadow-sm">
            <div className="flex justify-between items-center text-slate-400 text-xs">
              <span>Perdas Normais (CPV)</span>
              <PackageCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">
              R$ {resumo.totalPerdasNormaisCPV.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Custo Fabril (Art. 303 RIR)</div>
          </div>

          <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-3.5 shadow-sm">
            <div className="flex justify-between items-center text-slate-400 text-xs">
              <span>Quebras Anormais (DRE)</span>
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-xl font-bold text-rose-400 mt-1 font-mono">
              R$ {resumo.totalQuebrasAnormaisDRE.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Extravio / Avaria não operacional</div>
          </div>

          <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-3.5 shadow-sm">
            <div className="flex justify-between items-center text-slate-400 text-xs">
              <span>Estornos Tributários</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-bold text-amber-400 mt-1 font-mono">
              R$ {resumo.totalEstornosTributarios.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">ICMS 18% + PIS/COFINS 9.25%</div>
          </div>

          <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-3.5 shadow-sm">
            <div className="flex justify-between items-center text-slate-400 text-xs">
              <span>Reclassificações K220</span>
              <RotateCcw className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xl font-bold text-blue-400 mt-1 font-mono">
              R$ {resumo.totalReclassificacoesK220.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Transformação interna de itens</div>
          </div>

          <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-3.5 shadow-sm">
            <div className="flex justify-between items-center text-slate-400 text-xs">
              <span>Correções K280</span>
              <RefreshCw className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-xl font-bold text-purple-400 mt-1 font-mono">
              R$ {resumo.totalCorrecoesK280.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Ajuste de inventário retroativo</div>
          </div>
        </div>

        {/* Tabela e Filtros */}
        <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg overflow-hidden shadow-sm">
          {/* Barra de Filtros */}
          <div className="p-3 border-b border-[#2d2d2d] flex flex-col sm:flex-row justify-between items-center gap-3 bg-[#181818]">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar produto, código ou laudo..."
                  value={filtroTexto}
                  onChange={e => setFiltroTexto(e.target.value)}
                  className="w-full bg-[#121212] border border-[#333] rounded pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <select
                value={filtroTipo}
                onChange={e => setFiltroTipo(e.target.value)}
                className="bg-[#121212] border border-[#333] rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="TODOS">Todos os Registros</option>
                <option value="PERDA_PROCESSO_NORMAL">Perdas Normais (Processo)</option>
                <option value="QUEBRA_ANORMAL_EXTRAVIO">Quebras Anormais (Extravio)</option>
                <option value="K220_RECLASSIFICACAO">K220 - Reclassificações</option>
                <option value="K280_CORRECAO_APONTAMENTO">K280 - Correções</option>
              </select>

              <select
                value={filtroMotivo}
                onChange={e => setFiltroMotivo(e.target.value)}
                className="bg-[#121212] border border-[#333] rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="TODOS">Todos os Motivos</option>
                <option value="PERDA_EVAPORACAO_NORMAL">Evaporação / Sucata Normal</option>
                <option value="FURTO_EXTRAVIO">Furto / Roubo / Extravio</option>
                <option value="DETERIORACAO_VALIDADE">Deterioração / Validade</option>
                <option value="DESMEMBRAMENTO_INSUMO">Desmembramento Insumo</option>
                <option value="CORRECAO_INVENTARIO">Correção de Inventário</option>
              </select>
            </div>

            <div className="text-xs text-slate-400">
              Mostrando <span className="font-bold text-slate-200">{itensFiltrados.length}</span> apontamento(s)
            </div>
          </div>

          {/* Tabela de Apontamentos */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#161616] text-slate-400 border-b border-[#2d2d2d] text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-3">Data / Produto Origem</th>
                  <th className="py-2.5 px-3">Registro SPED</th>
                  <th className="py-2.5 px-3">Motivo Regulamentar</th>
                  <th className="py-2.5 px-3 text-right">Qtd Origem</th>
                  <th className="py-2.5 px-3 text-right">Custo Unitário</th>
                  <th className="py-2.5 px-3 text-right">Valor Total</th>
                  <th className="py-2.5 px-3 text-right">Estorno Fiscal</th>
                  <th className="py-2.5 px-3 text-center">Laudo / Contábil</th>
                  <th className="py-2.5 px-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {itensFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500">
                      Nenhum registro de ajuste de estoque encontrado para a competência {competencia}.
                    </td>
                  </tr>
                ) : (
                  itensFiltrados.map(item => (
                    <tr key={item.id} className="hover:bg-[#222] transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-200">{item.codigoProdutoOrigem}</div>
                        <div className="text-[11px] text-slate-400">{item.descricaoProdutoOrigem}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{item.dataMovimento}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.tipo === 'PERDA_PROCESSO_NORMAL'
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                            : item.tipo === 'QUEBRA_ANORMAL_EXTRAVIO'
                            ? 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                            : item.tipo === 'K220_RECLASSIFICACAO'
                            ? 'bg-blue-950/60 text-blue-300 border border-blue-500/30'
                            : 'bg-purple-950/60 text-purple-300 border border-purple-500/30'
                        }`}>
                          {item.tipo}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-300">
                        {item.motivo}
                        {item.codigoProdutoDestino && (
                          <div className="text-[10px] text-blue-400 font-sans mt-0.5">
                            Destino: {item.codigoProdutoDestino} ({item.quantidadeDestino} {item.unidadeDestino})
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-200">
                        {item.quantidadeOrigem} {item.unidadeOrigem}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                        R$ {item.custoUnitarioOrigem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-100 font-bold">
                        R$ {item.valorTotalOrigem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        {item.exigeEstornoCreditoFiscal ? (
                          <div className="text-amber-400 font-bold">
                            R$ {((item.valorEstornoIcms || 0) + (item.valorEstornoPisCofins || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            <div className="text-[9px] text-amber-500 font-normal">
                              ICMS: R$ {(item.valorEstornoIcms || 0).toFixed(2)} | P/C: R$ {(item.valorEstornoPisCofins || 0).toFixed(2)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[10px]">Não exigido</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="text-[10px] text-slate-300 font-semibold">{item.numeroLaudoPericial || 'S/N'}</div>
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold mt-0.5 ${
                          item.integradoContabil
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                        }`}>
                          {item.integradoContabil ? 'INTEGRADO' : 'PENDENTE'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => abrirModalEditar(item)}
                            title="Editar Apontamento"
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleExcluirItem(item.id, item.codigoProdutoOrigem)}
                            title="Excluir Apontamento"
                            className="p-1 rounded hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-colors"
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
      </div>

      {/* Modal Novo / Editar Apontamento */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-[#2d2d2d] flex justify-between items-center bg-[#202020]">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-slate-100">
                  {editando ? 'Editar Apontamento Bloco K' : 'Novo Apontamento de Estoque / Bloco K'}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarItem} className="p-5 space-y-4 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Data do Movimento *
                  </label>
                  <input
                    type="date"
                    required
                    value={dataMovimento}
                    onChange={e => setDataMovimento(e.target.value)}
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Tipo de Movimento SPED *
                  </label>
                  <select
                    value={tipo}
                    onChange={e => handleTipoChange(e.target.value as TipoMovimentacaoInternaK)}
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="PERDA_PROCESSO_NORMAL">Perda Normal Fabril (CPV)</option>
                    <option value="QUEBRA_ANORMAL_EXTRAVIO">Quebra Anormal / Extravio (DRE)</option>
                    <option value="K220_RECLASSIFICACAO">K220 - Reclassificação Insumo</option>
                    <option value="K280_CORRECAO_APONTAMENTO">K280 - Correção de Apontamento</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Motivo Regulamentar *
                  </label>
                  <select
                    value={motivo}
                    onChange={e => setMotivo(e.target.value as MotivoAjusteEstoque)}
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="PERDA_EVAPORACAO_NORMAL">Evaporação / Cavaco Normal</option>
                    <option value="QUEBRA_TRANSPORTE">Quebra em Transporte</option>
                    <option value="DETERIORACAO_VALIDADE">Deterioração / Vencimento</option>
                    <option value="FURTO_EXTRAVIO">Furto / Extravio / Sinistro</option>
                    <option value="DESMEMBRAMENTO_INSUMO">Desmembramento de Insumo</option>
                    <option value="REEMBALAGEM_PRODUTO">Reembalagem de Produto</option>
                    <option value="CORRECAO_INVENTARIO">Correção de Inventário</option>
                  </select>
                </div>
              </div>

              {/* Origem */}
              <div className="p-3 rounded-lg bg-[#222] border border-[#2d2d2d] space-y-3">
                <div className="text-xs font-semibold text-slate-300">Produto de Origem / Baixa:</div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Código Produto *</label>
                    <input
                      type="text"
                      required
                      value={codigoProdutoOrigem}
                      onChange={e => setCodigoProdutoOrigem(e.target.value)}
                      className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[11px] text-slate-400 block mb-1">Descrição Produto *</label>
                    <input
                      type="text"
                      required
                      value={descricaoProdutoOrigem}
                      onChange={e => setDescricaoProdutoOrigem(e.target.value)}
                      className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Unidade *</label>
                    <input
                      type="text"
                      required
                      value={unidadeOrigem}
                      onChange={e => setUnidadeOrigem(e.target.value)}
                      className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 uppercase font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Quantidade *</label>
                    <input
                      type="text"
                      required
                      value={quantidadeOrigem}
                      onChange={e => {
                        setQuantidadeOrigem(e.target.value);
                        const q = parseValor(e.target.value);
                        const c = parseValor(custoUnitarioOrigem);
                        calcularEstornoAutomatico(q * c, exigeEstornoCreditoFiscal);
                      }}
                      className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Custo Unitário (R$) *</label>
                    <input
                      type="text"
                      required
                      value={custoUnitarioOrigem}
                      onChange={e => {
                        setCustoUnitarioOrigem(e.target.value);
                        const q = parseValor(quantidadeOrigem);
                        const c = parseValor(e.target.value);
                        calcularEstornoAutomatico(q * c, exigeEstornoCreditoFiscal);
                      }}
                      className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Valor Total Apurado</label>
                    <div className="px-3 py-1.5 bg-[#181818] border border-[#333] rounded text-xs font-mono font-bold text-amber-400">
                      R$ {(parseValor(quantidadeOrigem) * parseValor(custoUnitarioOrigem)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Destino se for K220 */}
              {tipo === 'K220_RECLASSIFICACAO' && (
                <div className="p-3 rounded-lg bg-[#182028] border border-blue-500/30 space-y-3">
                  <div className="text-xs font-semibold text-blue-300">Produto de Destino (K220):</div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Cód. Destino</label>
                      <input
                        type="text"
                        value={codigoProdutoDestino}
                        onChange={e => setCodigoProdutoDestino(e.target.value)}
                        placeholder="Ex: PA-0044"
                        className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[11px] text-slate-400 block mb-1">Descrição Destino</label>
                      <input
                        type="text"
                        value={descricaoProdutoDestino}
                        onChange={e => setDescricaoProdutoDestino(e.target.value)}
                        placeholder="Ex: Chapa Estampada 10x20"
                        className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Qtd. Destino</label>
                      <input
                        type="text"
                        value={quantidadeDestino}
                        onChange={e => setQuantidadeDestino(e.target.value)}
                        placeholder="Qtd"
                        className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Estornos Fiscais */}
              <div className="p-3 rounded-lg bg-[#281a18] border border-rose-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-rose-300 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exigeEstornoCreditoFiscal}
                      onChange={e => {
                        setExigeEstornoCreditoFiscal(e.target.checked);
                        const tot = parseValor(quantidadeOrigem) * parseValor(custoUnitarioOrigem);
                        calcularEstornoAutomatico(tot, e.target.checked);
                      }}
                      className="rounded border-[#444] text-rose-600 focus:ring-rose-500"
                    />
                    Exige Estorno de Crédito Fiscal (Art. 303 RIR / Art. 21 LC 87/96)
                  </label>
                  <span className="text-[10px] text-rose-400">Furto / Deterioração / Extravio</span>
                </div>

                {exigeEstornoCreditoFiscal && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[11px] text-slate-300 block mb-1">Estorno de ICMS (18%)</label>
                      <input
                        type="text"
                        value={valorEstornoIcms}
                        onChange={e => setValorEstornoIcms(e.target.value)}
                        className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-300 block mb-1">Estorno PIS/COFINS (9.25%)</label>
                      <input
                        type="text"
                        value={valorEstornoPisCofins}
                        onChange={e => setValorEstornoPisCofins(e.target.value)}
                        className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500 font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Número do Laudo Técnico / BO / Boletim Pericial
                  </label>
                  <input
                    type="text"
                    value={numeroLaudoPericial}
                    onChange={e => setNumeroLaudoPericial(e.target.value)}
                    placeholder="Ex: LAUDO-ENG-2026/044"
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Observações Fiscais
                  </label>
                  <input
                    type="text"
                    value={observacoes}
                    onChange={e => setObservacoes(e.target.value)}
                    placeholder="Justificativa técnica ou detalhes da ocorrência..."
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="p-4 border-t border-[#2d2d2d] flex justify-end gap-2 bg-[#202020] -mx-5 -mb-5 mt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded bg-[#2e2e2e] hover:bg-[#383838] text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md shadow-amber-600/30"
                >
                  {editando ? 'Atualizar Apontamento' : 'Salvar Apontamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
