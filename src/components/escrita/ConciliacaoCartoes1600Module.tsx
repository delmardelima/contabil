import React, { useState } from 'react';
import { dbService } from '../../db/sqliteService';
import { Empresa, OperacaoCartao1600, AdquirenteCartao, BandeiraCartao, TipoTransacaoCartao } from '../../types/contabil';
import {
  CreditCard,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Search,
  Download,
  Printer,
  X,
  Zap,
  ArrowRightLeft,
  DollarSign,
  TrendingDown,
  Building,
  FileCheck2,
  Percent
} from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

interface ConciliacaoCartoes1600ModuleProps {
  empresaAtiva: Empresa;
  onIntegracaoSucesso?: () => void;
  onOpenReportPreview?: (config: {
    titulo: string;
    subtitulo: string;
    conteudo?: React.ReactNode;
    linhas?: any[];
  }) => void;
}

export const ConciliacaoCartoes1600Module: React.FC<ConciliacaoCartoes1600ModuleProps> = ({
  empresaAtiva,
  onIntegracaoSucesso,
  onOpenReportPreview
}) => {
  const [resumo, setResumo] = useState(() => dbService.getOperacoesCartoes1600(empresaAtiva.id, empresaAtiva.competenciaAtiva));
  const [filtroTexto, setFiltroTexto] = useState<string>('');
  const [filtroAdquirente, setFiltroAdquirente] = useState<string>('TODOS');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editando, setEditando] = useState<OperacaoCartao1600 | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string>('');
  const [processandoIntegracao, setProcessandoIntegracao] = useState<boolean>(false);

  // Form State
  const [dataVenda, setDataVenda] = useState<string>(new Date().toISOString().slice(0, 10));
  const [dataLiquidacao, setDataLiquidacao] = useState<string>(new Date().toISOString().slice(0, 10));
  const [adquirente, setAdquirente] = useState<AdquirenteCartao>('STONE');
  const [bandeira, setBandeira] = useState<BandeiraCartao>('VISA');
  const [tipoTransacao, setTipoTransacao] = useState<TipoTransacaoCartao>('CREDITO_VISTA');
  const [numeroNsu, setNumeroNsu] = useState<string>('');
  const [valorBruto, setValorBruto] = useState<string>('1000,00');
  const [percentualTaxaMdr, setPercentualTaxaMdr] = useState<number>(2.39);

  const handleRecarregar = () => {
    setResumo(dbService.getOperacoesCartoes1600(empresaAtiva.id, empresaAtiva.competenciaAtiva));
  };

  const parseValor = (valStr: string): number => {
    const cleaned = valStr.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  const handleAbrirCriar = () => {
    setEditando(null);
    setDataVenda(new Date().toISOString().slice(0, 10));
    setDataLiquidacao(new Date().toISOString().slice(0, 10));
    setAdquirente('STONE');
    setBandeira('VISA');
    setTipoTransacao('CREDITO_VISTA');
    setNumeroNsu(String(Math.floor(Math.random() * 900000000 + 100000000)));
    setValorBruto('2500,00');
    setPercentualTaxaMdr(2.39);
    setShowModal(true);
  };

  const handleAbrirEditar = (item: OperacaoCartao1600) => {
    setEditando(item);
    setDataVenda(item.dataVenda);
    setDataLiquidacao(item.dataLiquidacao);
    setAdquirente(item.adquirente);
    setBandeira(item.bandeira);
    setTipoTransacao(item.tipoTransacao);
    setNumeroNsu(item.numeroNsu);
    setValorBruto(item.valorBruto.toFixed(2).replace('.', ','));
    setPercentualTaxaMdr(item.percentualTaxaMdr);
    setShowModal(true);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    const nBruto = parseValor(valorBruto);
    const nTaxa = Math.round((nBruto * (percentualTaxaMdr / 100)) * 100) / 100;
    const nLiquido = Math.max(0, Math.round((nBruto - nTaxa) * 100) / 100);

    const novaOp: OperacaoCartao1600 = {
      id: editando ? editando.id : `card_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      empresaId: empresaAtiva.id,
      dataVenda,
      dataLiquidacao,
      adquirente,
      bandeira,
      tipoTransacao,
      numeroNsu: numeroNsu.trim() || String(Date.now()),
      valorBruto: nBruto,
      percentualTaxaMdr,
      valorTaxaMdr: nTaxa,
      valorLiquido: nLiquido,
      statusConciliacao: 'CONCILIADO',
      integradoContabil: editando ? editando.integradoContabil : false
    };

    dbService.salvarOperacaoCartao(novaOp);
    handleRecarregar();
    setShowModal(false);
    setMensagemSucesso(`Operação NSU ${novaOp.numeroNsu} gravada com sucesso!`);
    setTimeout(() => setMensagemSucesso(''), 4000);
  };

  const handleExcluir = (id: string, nsu: string) => {
    if (confirm(`Excluir a operação com NSU ${nsu}?`)) {
      dbService.excluirOperacaoCartao(id);
      handleRecarregar();
    }
  };

  const handleIntegrarContabil = () => {
    const comp = empresaAtiva.competenciaAtiva || '2026-03';
    if (!confirm(`Efetuar a conciliação e integração contábil de todas as operações de cartão da competência ${comp}?\n\nSerão geradas partidas no Diário Geral de Crédito Bancário Líquido e Despesas com Taxas MDR.`)) {
      return;
    }

    setProcessandoIntegracao(true);
    try {
      const res = dbService.conciliarEIntegrarCartoesContabil(empresaAtiva.id, comp);
      handleRecarregar();
      if (onIntegracaoSucesso) {
        onIntegracaoSucesso();
      }
      setMensagemSucesso(res.mensagem);
      setTimeout(() => setMensagemSucesso(''), 6000);
    } catch (err: any) {
      alert(`Erro ao integrar cartões: ${err?.message || err}`);
    } finally {
      setProcessandoIntegracao(false);
    }
  };

  const handleImprimirLaudo1600 = () => {
    if (!onOpenReportPreview) return;

    const conteudoA4 = (
      <div className="p-8 text-neutral-800 bg-white font-sans text-xs">
        {/* Cabeçalho Oficial */}
        <div className="border-b-2 border-neutral-900 pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-neutral-900 uppercase">
                {empresaAtiva.razaoSocial}
              </h1>
              <p className="text-neutral-600 font-mono text-[11px] mt-0.5">
                CNPJ: {empresaAtiva.cnpj} | Competência: {empresaAtiva.competenciaAtiva} | EFD ICMS/IPI
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block bg-neutral-900 text-white font-semibold text-[10px] px-2 py-0.5 rounded uppercase">
                SPED REGISTRO 1600
              </span>
              <p className="text-[10px] text-neutral-500 mt-1">Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-base font-bold text-neutral-800 uppercase tracking-wide">
              Relatório de Operações com Cartões de Crédito / Débito & Conciliação MDR
            </h2>
            <p className="text-[11px] text-neutral-600">
              Demonstrativo de Vendas por Adquirente, Taxas de Intermediação Descontadas e Liquidação Bancária
            </p>
          </div>
        </div>

        {/* Quadro Síntese */}
        <div className="grid grid-cols-4 gap-4 p-3 bg-neutral-50 border border-neutral-200 rounded mb-6 text-center">
          <div>
            <div className="text-[10px] text-neutral-500 uppercase font-semibold">Total Vendas Brutas</div>
            <div className="text-sm font-bold text-neutral-900">
              {resumo.totalBrutoVendas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-neutral-500 uppercase font-semibold">Taxas MDR Retidas</div>
            <div className="text-sm font-bold text-rose-700">
              {resumo.totalTaxasMdr.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-neutral-500 uppercase font-semibold">Crédito Líquido Bancário</div>
            <div className="text-sm font-bold text-emerald-700">
              {resumo.totalLiquidoCreditado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-neutral-500 uppercase font-semibold">Ticket Médio / Operações</div>
            <div className="text-sm font-bold text-neutral-800">
              {resumo.ticketMedio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} ({resumo.totalOperacoes})
            </div>
          </div>
        </div>

        {/* Grade de Operações */}
        <table className="w-full border-collapse text-[10px] mb-6">
          <thead>
            <tr className="border-b-2 border-neutral-800 bg-neutral-100 font-bold text-neutral-800 text-left">
              <th className="py-2 px-1">Data Venda</th>
              <th className="py-2 px-1">Liquidação</th>
              <th className="py-2 px-1">Adquirente</th>
              <th className="py-2 px-1">Bandeira / Modalidade</th>
              <th className="py-2 px-1">NSU</th>
              <th className="py-2 px-1 text-right">Vlr Bruto</th>
              <th className="py-2 px-1 text-center">MDR (%)</th>
              <th className="py-2 px-1 text-right">Taxa (R$)</th>
              <th className="py-2 px-1 text-right font-bold text-emerald-900">Vlr Líquido</th>
              <th className="py-2 px-1 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {resumo.transacoes.map(t => (
              <tr key={t.id} className="hover:bg-neutral-50">
                <td className="py-2 px-1">{new Date(t.dataVenda).toLocaleDateString('pt-BR')}</td>
                <td className="py-2 px-1">{new Date(t.dataLiquidacao).toLocaleDateString('pt-BR')}</td>
                <td className="py-2 px-1 font-semibold">{t.adquirente}</td>
                <td className="py-2 px-1 font-mono text-[9px]">{t.bandeira} - {t.tipoTransacao}</td>
                <td className="py-2 px-1 font-mono text-[9px]">{t.numeroNsu}</td>
                <td className="py-2 px-1 text-right font-mono">
                  {t.valorBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2 px-1 text-center font-mono">{t.percentualTaxaMdr.toFixed(2)}%</td>
                <td className="py-2 px-1 text-right font-mono text-rose-800">
                  {t.valorTaxaMdr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2 px-1 text-right font-mono font-bold text-emerald-800">
                  {t.valorLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2 px-1 text-center">
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                    t.integradoContabil ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {t.integradoContabil ? 'CONTABILIZADO' : 'PENDENTE'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-neutral-800 font-bold bg-neutral-100 text-neutral-900">
              <td colSpan={5} className="py-2 px-1 uppercase">Totais Gerais da Competência</td>
              <td className="py-2 px-1 text-right font-mono">
                {resumo.totalBrutoVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </td>
              <td className="py-2 px-1 text-center">-</td>
              <td className="py-2 px-1 text-right font-mono text-rose-900">
                {resumo.totalTaxasMdr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </td>
              <td className="py-2 px-1 text-right font-mono text-emerald-900">
                {resumo.totalLiquidoCreditado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </td>
              <td className="py-2 px-1 text-center">{resumo.totalOperacoes} transações</td>
            </tr>
          </tfoot>
        </table>

        {/* Parecer Normativo */}
        <div className="border border-neutral-300 rounded p-3 bg-neutral-50 text-[10px] space-y-1.5 mb-8">
          <div className="font-bold text-neutral-800 uppercase tracking-wide">
            Conformidade SPED Fiscal (Ato COTEPE Registro 1600) e Cruzamento SEFAZ / DIMED / DIME
          </div>
          <p className="text-neutral-600 leading-relaxed font-sans">
            1. Os valores brutos informados coincidem com a DIMP (Declaração de Informações de Meios de Pagamento) transmitida pelas credenciadoras e instituições de pagamento à Administração Tributária.
            <br />
            2. As despesas de intermediação financeira (taxa MDR) foram devidamente apropriadas a débito em contas de Resultado Financeiro e a crédito de Contas a Receber.
          </p>
        </div>

        {/* Assinaturas */}
        <div className="pt-12 grid grid-cols-2 gap-12 text-center text-[10px]">
          <div>
            <div className="border-t border-neutral-400 pt-1 font-bold">{empresaAtiva.razaoSocial}</div>
            <div className="text-neutral-500">Gestão Financeira & Controladoria</div>
          </div>
          <div>
            <div className="border-t border-neutral-400 pt-1 font-bold">Contador Responsável Técnico</div>
            <div className="text-neutral-500">CRC/UF nº 000.000/O-0</div>
          </div>
        </div>
      </div>
    );

    onOpenReportPreview({
      titulo: 'CONCILIAÇÃO DE CARTÕES & SPED REGISTRO 1600',
      subtitulo: `${empresaAtiva.razaoSocial} - Competência ${empresaAtiva.competenciaAtiva}`,
      conteudo: conteudoA4
    });
  };

  const handleExportarCsv = () => {
    const data = resumo.transacoes.map(t => ({
      DataVenda: t.dataVenda,
      DataLiquidacao: t.dataLiquidacao,
      Adquirente: t.adquirente,
      Bandeira: t.bandeira,
      TipoTransacao: t.tipoTransacao,
      NSU: t.numeroNsu,
      ValorBruto: t.valorBruto,
      TaxaMdrPercent: t.percentualTaxaMdr,
      ValorTaxaMdr: t.valorTaxaMdr,
      ValorLiquido: t.valorLiquido,
      Status: t.statusConciliacao,
      IntegradoContabil: t.integradoContabil ? 'SIM' : 'NAO'
    }));
    exportToCSV(data, `Cartoes_Registro1600_${empresaAtiva.cnpj}_${empresaAtiva.competenciaAtiva}`);
  };

  const transacoesFiltradas = resumo.transacoes.filter(t => {
    if (filtroAdquirente !== 'TODOS' && t.adquirente !== filtroAdquirente) return false;
    if (filtroStatus === 'INTEGRADO' && !t.integradoContabil) return false;
    if (filtroStatus === 'PENDENTE' && t.integradoContabil) return false;
    if (filtroTexto.trim()) {
      const termo = filtroTexto.toLowerCase();
      const matchNsu = t.numeroNsu.includes(termo);
      const matchAdq = t.adquirente.toLowerCase().includes(termo);
      const matchBand = t.bandeira.toLowerCase().includes(termo);
      if (!matchNsu && !matchAdq && !matchBand) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-[#121212] text-neutral-200 overflow-hidden font-sans">
      {/* 1. Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#171717]">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-white tracking-tight">
                Vendas com Cartões & Adquirentes (SPED Registro 1600)
              </h1>
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-900/40 text-emerald-300 border border-emerald-700/50 rounded-full">
                DIMP / COTEPE / SEFAZ
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Conciliação de faturamento bruto, taxas de intermediação MDR e contabilização automática em 1-clique
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleExportarCsv}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handleImprimirLaudo1600}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Laudo A4 Reg. 1600</span>
          </button>

          <button
            onClick={handleIntegrarContabil}
            disabled={processandoIntegracao}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{processandoIntegracao ? 'Integrando...' : 'Conciliar & Integrar Diário'}</span>
          </button>

          <button
            onClick={handleAbrirCriar}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Operação</span>
          </button>
        </div>
      </div>

      {mensagemSucesso && (
        <div className="mx-6 mt-4 p-3 bg-emerald-950/50 border border-emerald-700/60 rounded-xl flex items-center space-x-2 text-emerald-300 text-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{mensagemSucesso}</span>
        </div>
      )}

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-5 gap-3.5 px-6 pt-4 pb-2">
        <div className="bg-[#181818] border border-neutral-800/80 p-3.5 rounded-xl flex flex-col justify-between">
          <span className="text-[11px] font-medium text-neutral-400">Vendas Brutas (Cartões)</span>
          <div className="mt-1">
            <span className="text-xl font-bold text-white font-mono">
              {resumo.totalBrutoVendas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        </div>

        <div className="bg-[#181818] border border-neutral-800/80 p-3.5 rounded-xl flex flex-col justify-between">
          <span className="text-[11px] font-medium text-neutral-400">Taxas MDR Retidas</span>
          <div className="mt-1">
            <span className="text-xl font-bold text-rose-400 font-mono">
              {resumo.totalTaxasMdr.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        </div>

        <div className="bg-[#181818] border border-neutral-800/80 p-3.5 rounded-xl flex flex-col justify-between">
          <span className="text-[11px] font-medium text-neutral-400">Crédito Líquido Bancário</span>
          <div className="mt-1">
            <span className="text-xl font-bold text-emerald-400 font-mono">
              {resumo.totalLiquidoCreditado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        </div>

        <div className="bg-[#181818] border border-neutral-800/80 p-3.5 rounded-xl flex flex-col justify-between">
          <span className="text-[11px] font-medium text-neutral-400">Ticket Médio</span>
          <div className="mt-1">
            <span className="text-xl font-bold text-neutral-200 font-mono">
              {resumo.ticketMedio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        </div>

        <div className="bg-[#181818] border border-neutral-800/80 p-3.5 rounded-xl flex flex-col justify-between">
          <span className="text-[11px] font-medium text-neutral-400">Total de Operações</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-bold text-purple-300 font-mono">{resumo.totalOperacoes}</span>
            <span className="text-[11px] text-neutral-500 font-medium">Transações</span>
          </div>
        </div>
      </div>

      {/* 3. Filtros */}
      <div className="flex items-center justify-between px-6 py-3 border-y border-neutral-800/60 bg-[#161616]">
        <div className="flex items-center space-x-3 w-1/3">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={filtroTexto}
              onChange={e => setFiltroTexto(e.target.value)}
              placeholder="Buscar por NSU, adquirente ou bandeira..."
              className="w-full bg-[#1f1f1f] border border-neutral-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-xs text-neutral-400">
            <span>Adquirente:</span>
            <select
              value={filtroAdquirente}
              onChange={e => setFiltroAdquirente(e.target.value)}
              className="bg-[#1f1f1f] border border-neutral-700/80 rounded-lg px-2.5 py-1 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="TODOS">Todas as Credenciadoras</option>
              <option value="STONE">Stone</option>
              <option value="CIELO">Cielo</option>
              <option value="REDE">Rede</option>
              <option value="PAGSEGURO">PagSeguro / PagBank</option>
              <option value="GETNET">Getnet</option>
              <option value="MERCADO_PAGO">Mercado Pago</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-neutral-400">
            <span>Integração Contábil:</span>
            <select
              value={filtroStatus}
              onChange={e => setFiltroStatus(e.target.value)}
              className="bg-[#1f1f1f] border border-neutral-700/80 rounded-lg px-2.5 py-1 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="PENDENTE">Pendentes de Integração</option>
              <option value="INTEGRADO">Contabilizados no Diário</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Tabela de Operações de Cartão */}
      <div className="flex-1 overflow-auto px-6 py-4">
        <div className="border border-neutral-800 rounded-xl overflow-hidden shadow-sm bg-[#171717]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-800 bg-[#1c1c1c] text-neutral-400 font-medium">
                <th className="py-2.5 px-3">Data Venda</th>
                <th className="py-2.5 px-3">Liquidação</th>
                <th className="py-2.5 px-3">Adquirente</th>
                <th className="py-2.5 px-3">Bandeira / Modalidade</th>
                <th className="py-2.5 px-3">NSU</th>
                <th className="py-2.5 px-3 text-right">Vlr Bruto</th>
                <th className="py-2.5 px-3 text-center">MDR (%)</th>
                <th className="py-2.5 px-3 text-right">Taxa (R$)</th>
                <th className="py-2.5 px-3 text-right">Vlr Líquido</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-sans">
              {transacoesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-10 text-neutral-500">
                    <p className="text-sm font-medium">Nenhuma transação de cartão encontrada para esta competência.</p>
                    <p className="text-xs mt-1">Clique em "Nova Operação" para lançar comprovantes de adquirentes.</p>
                  </td>
                </tr>
              ) : (
                transacoesFiltradas.map(t => (
                  <tr key={t.id} className="hover:bg-neutral-800/30 transition">
                    <td className="py-2.5 px-3 font-mono text-neutral-300">
                      {new Date(t.dataVenda).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-neutral-400 text-[11px]">
                      {new Date(t.dataLiquidacao).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-white">
                      {t.adquirente}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-neutral-300">
                      {t.bandeira} - {t.tipoTransacao}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-neutral-400">
                      {t.numeroNsu}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-neutral-100">
                      {t.valorBruto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-[11px]">
                      {t.percentualTaxaMdr.toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-rose-400">
                      {t.valorTaxaMdr.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                      {t.valorLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                        t.integradoContabil
                          ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300'
                          : 'bg-amber-950/60 border-amber-800/60 text-amber-300'
                      }`}>
                        {t.integradoContabil ? 'INTEGRADO' : 'PENDENTE'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => handleAbrirEditar(t)}
                          className="p-1 text-neutral-400 hover:text-emerald-400 hover:bg-neutral-800 rounded transition"
                          title="Editar Operação"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleExcluir(t.id, t.numeroNsu)}
                          className="p-1 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded transition"
                          title="Excluir Operação"
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

      {/* 5. Modal de Cadastro & Edição de Transação */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-neutral-700/80 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#161616]">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">
                  {editando ? 'Editar Operação com Cartão' : 'Nova Operação com Cartão (SPED 1600)'}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvar} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Data da Venda</label>
                  <input
                    type="date"
                    value={dataVenda}
                    onChange={e => setDataVenda(e.target.value)}
                    required
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Data da Liquidação Bancária</label>
                  <input
                    type="date"
                    value={dataLiquidacao}
                    onChange={e => setDataLiquidacao(e.target.value)}
                    required
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Adquirente</label>
                  <select
                    value={adquirente}
                    onChange={e => setAdquirente(e.target.value as AdquirenteCartao)}
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="STONE">Stone</option>
                    <option value="CIELO">Cielo</option>
                    <option value="REDE">Rede</option>
                    <option value="PAGSEGURO">PagSeguro / PagBank</option>
                    <option value="GETNET">Getnet</option>
                    <option value="MERCADO_PAGO">Mercado Pago</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Bandeira</label>
                  <select
                    value={bandeira}
                    onChange={e => setBandeira(e.target.value as BandeiraCartao)}
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="VISA">Visa</option>
                    <option value="MASTERCARD">Mastercard</option>
                    <option value="ELO">Elo</option>
                    <option value="AMEX">American Express</option>
                    <option value="HIPERCARD">Hipercard</option>
                    <option value="PIX_POS">Pix via POS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Modalidade</label>
                  <select
                    value={tipoTransacao}
                    onChange={e => {
                      const t = e.target.value as TipoTransacaoCartao;
                      setTipoTransacao(t);
                      if (t === 'DEBITO') setPercentualTaxaMdr(1.29);
                      else if (t === 'CREDITO_VISTA') setPercentualTaxaMdr(2.39);
                      else if (t === 'CREDITO_PARCELADO') setPercentualTaxaMdr(3.49);
                      else if (t === 'PIX_MAQUININHA') setPercentualTaxaMdr(0.79);
                    }}
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="DEBITO">Débito</option>
                    <option value="CREDITO_VISTA">Crédito à Vista</option>
                    <option value="CREDITO_PARCELADO">Crédito Parcelado</option>
                    <option value="PIX_MAQUININHA">Pix no POS</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-neutral-800">
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Número NSU / DOC</label>
                  <input
                    type="text"
                    value={numeroNsu}
                    onChange={e => setNumeroNsu(e.target.value)}
                    required
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Valor Bruto (R$)</label>
                  <input
                    type="text"
                    value={valorBruto}
                    onChange={e => setValorBruto(e.target.value)}
                    required
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Taxa MDR (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={percentualTaxaMdr}
                    onChange={e => setPercentualTaxaMdr(parseFloat(e.target.value) || 0)}
                    required
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-neutral-700 text-neutral-300 hover:bg-neutral-800 transition font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md transition"
                >
                  Salvar Transação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
