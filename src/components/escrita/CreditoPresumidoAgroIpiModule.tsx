import React, { useState } from 'react';
import { dbService } from '../../db/sqliteService';
import {
  Empresa,
  ItemCreditoPresumido,
  TipoCreditoPresumido,
  CadeiaProdutivaAgro,
  OrigemAquisicaoInsumo,
  ApuracaoCreditoPresumidoAgroIpi
} from '../../types/contabil';
import {
  Wheat,
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle2,
  Download,
  Printer,
  X,
  FileText,
  DollarSign,
  Truck,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  AlertCircle
} from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

interface CreditoPresumidoAgroIpiModuleProps {
  empresaAtiva: Empresa;
  onOpenReportPreview?: (config: {
    titulo: string;
    subtitulo: string;
    conteudo?: React.ReactNode;
    linhas?: any[];
  }) => void;
}

export const CreditoPresumidoAgroIpiModule: React.FC<CreditoPresumidoAgroIpiModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [competenciaAtiva, setCompetenciaAtiva] = useState<string>('2026-03');
  const [apuracao, setApuracao] = useState<ApuracaoCreditoPresumidoAgroIpi>(() =>
    dbService.getApuracaoCreditoPresumido(empresaAtiva.id, '2026-03')
  );
  const [filtroTexto, setFiltroTexto] = useState<string>('');
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editando, setEditando] = useState<ItemCreditoPresumido | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string>('');

  // Form State
  const [tipo, setTipo] = useState<TipoCreditoPresumido>('PIS_COFINS_AGRO_GRAOS');
  const [cadeia, setCadeia] = useState<CadeiaProdutivaAgro>('SOJA_MILHO');
  const [origemAquisicao, setOrigemAquisicao] = useState<OrigemAquisicaoInsumo>('PRODUTOR_RURAL_PF');
  const [descricaoOperacao, setDescricaoOperacao] = useState<string>('');
  const [documentoOrigem, setDocumentoOrigem] = useState<string>('');
  const [dataEmissao, setDataEmissao] = useState<string>(new Date().toISOString().slice(0, 10));
  const [baseCalculoAquisicao, setBaseCalculoAquisicao] = useState<string>('100000,00');
  const [aliquotaCreditoPresumido, setAliquotaCreditoPresumido] = useState<number>(5.40);
  const [numeroDcomp, setNumeroDcomp] = useState<string>('');
  const [statusApropriacao, setStatusApropriacao] = useState<'CALCULADO' | 'COMPENSADO_DCOMP' | 'RESSARCIDO_CONTA'>('CALCULADO');

  const handleRecarregar = (comp?: string) => {
    const c = comp || competenciaAtiva;
    setApuracao(dbService.getApuracaoCreditoPresumido(empresaAtiva.id, c));
  };

  const parseValor = (valStr: string): number => {
    const cleaned = valStr.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  const handleTipoChange = (novoTipo: TipoCreditoPresumido) => {
    setTipo(novoTipo);
    if (novoTipo === 'IPI_RESSARCIMENTO_EXPORTACAO') {
      setCadeia('EXPORTACAO_MANUFATURADOS_GERAL');
      setOrigemAquisicao('MERCADO_INTERNO_CONVENCIONAL');
      setAliquotaCreditoPresumido(5.37);
      setDescricaoOperacao('Crédito Presumido de IPI conf. Lei nº 9.363/96 (Ressarcimento de PIS/COFINS em exportações de manufaturados)');
    } else if (novoTipo === 'PIS_COFINS_AGRO_GRAOS') {
      setCadeia('SOJA_MILHO');
      setOrigemAquisicao('PRODUTOR_RURAL_PF');
      setAliquotaCreditoPresumido(5.40);
      setDescricaoOperacao('Aquisição de grãos de pessoa física produtora rural (Art. 8º Lei 10.925/04)');
    } else if (novoTipo === 'PIS_COFINS_AGRO_LEITE') {
      setCadeia('LEITE_DERIVADOS');
      setOrigemAquisicao('COOPERATIVA_RURAL');
      setAliquotaCreditoPresumido(3.60);
      setDescricaoOperacao('Aquisição de leite in natura de cooperativa agropecuária (Lei 10.925/04 Art. 8º § 3º)');
    } else if (novoTipo === 'PIS_COFINS_AGRO_CARNES') {
      setCadeia('BOVINOS_SUINOS_AVES');
      setOrigemAquisicao('PRODUTOR_RURAL_PF');
      setAliquotaCreditoPresumido(4.50);
      setDescricaoOperacao('Aquisição de animais vivos de produtor rural pessoa física (Lei 12.058/09 e Lei 12.350/10)');
    } else {
      setCadeia('CAFE_EM_GRAO');
      setOrigemAquisicao('PRODUTOR_RURAL_PF');
      setAliquotaCreditoPresumido(4.00);
      setDescricaoOperacao('Aquisição de café cru em grão de produtor rural (Lei 10.925/04)');
    }
  };

  const abrirModalNovo = () => {
    setEditando(null);
    handleTipoChange('PIS_COFINS_AGRO_GRAOS');
    setDocumentoOrigem('');
    setDataEmissao(new Date().toISOString().slice(0, 10));
    setBaseCalculoAquisicao('100000,00');
    setNumeroDcomp('');
    setStatusApropriacao('CALCULADO');
    setShowModal(true);
  };

  const abrirModalEditar = (item: ItemCreditoPresumido) => {
    setEditando(item);
    setTipo(item.tipo);
    setCadeia(item.cadeia);
    setOrigemAquisicao(item.origemAquisicao);
    setDescricaoOperacao(item.descricaoOperacao);
    setDocumentoOrigem(item.documentoOrigem);
    setDataEmissao(item.dataEmissao);
    setBaseCalculoAquisicao(item.baseCalculoAquisicao.toFixed(2).replace('.', ','));
    setAliquotaCreditoPresumido(item.aliquotaCreditoPresumido);
    setNumeroDcomp(item.numeroDcompPedidoRessarcimento || '');
    setStatusApropriacao(item.statusApropriacao);
    setShowModal(true);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    const base = parseValor(baseCalculoAquisicao);
    const valorCredito = Math.round((base * (aliquotaCreditoPresumido / 100)) * 100) / 100;

    const item: ItemCreditoPresumido = {
      id: editando ? editando.id : `cp-${Date.now()}`,
      empresaId: empresaAtiva.id,
      competencia: competenciaAtiva,
      tipo,
      cadeia,
      origemAquisicao,
      descricaoOperacao,
      documentoOrigem,
      dataEmissao,
      baseCalculoAquisicao: base,
      aliquotaCreditoPresumido,
      valorCreditoPresumido: valorCredito,
      numeroDcompPedidoRessarcimento: numeroDcomp || undefined,
      statusApropriacao,
      integradoContabil: editando ? editando.integradoContabil : false
    };

    dbService.salvarItemCreditoPresumido(item);
    handleRecarregar();
    setShowModal(false);
    setMensagemSucesso('Item de crédito presumido salvo com sucesso!');
    setTimeout(() => setMensagemSucesso(''), 4000);
  };

  const handleExcluir = (id: string) => {
    if (window.confirm('Confirma a exclusão deste item de crédito presumido?')) {
      dbService.excluirItemCreditoPresumido(id);
      handleRecarregar();
      setMensagemSucesso('Registro excluído com sucesso.');
      setTimeout(() => setMensagemSucesso(''), 4000);
    }
  };

  const handleIntegrarContabil = () => {
    const res = dbService.integrarCreditoPresumidoContabil(empresaAtiva.id, competenciaAtiva);
    if (res.sucesso) {
      handleRecarregar();
      setMensagemSucesso(res.mensagem);
      setTimeout(() => setMensagemSucesso(''), 7000);
    } else {
      alert(res.mensagem);
    }
  };

  // Filtros
  const itensFiltrados = apuracao.itens.filter(i => {
    const matchTexto = i.descricaoOperacao.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      i.documentoOrigem.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      (i.numeroDcompPedidoRessarcimento && i.numeroDcompPedidoRessarcimento.toLowerCase().includes(filtroTexto.toLowerCase()));
    const matchTipo = filtroTipo === 'TODOS' || i.tipo === filtroTipo;
    return matchTexto && matchTipo;
  });

  const handleExportarCSV = () => {
    const rows = itensFiltrados.map(i => ({
      ID: i.id,
      Competencia: i.competencia,
      Tipo: i.tipo,
      Cadeia: i.cadeia,
      OrigemAquisicao: i.origemAquisicao,
      Descricao: i.descricaoOperacao,
      Documento: i.documentoOrigem,
      DataEmissao: i.dataEmissao,
      BaseCalculo: i.baseCalculoAquisicao,
      Aliquota: i.aliquotaCreditoPresumido,
      ValorCreditoPresumido: i.valorCreditoPresumido,
      DCOMP: i.numeroDcompPedidoRessarcimento || 'PENDENTE',
      Status: i.statusApropriacao,
      IntegradoContabil: i.integradoContabil ? 'SIM' : 'NÃO'
    }));
    exportToCSV(rows, `creditos_presumidos_agro_ipi_${competenciaAtiva}_${empresaAtiva.cnpj.replace(/\D/g, '')}`);
  };

  const handleImprimirRelatorio = () => {
    if (!onOpenReportPreview) return;

    onOpenReportPreview({
      titulo: 'DEMONSTRATIVO DE CRÉDITOS PRESUMIDOS - AGROINDUSTRIAL & IPI EXPORTAÇÃO',
      subtitulo: `Leis nº 9.363/1996 e 10.925/2004 - Competência ${competenciaAtiva} - Exercício ${empresaAtiva.exercicioAtivo}`,
      conteudo: (
        <div className="p-8 space-y-6 text-slate-800 text-xs">
          <div className="border-b-2 border-slate-700 pb-3 flex justify-between items-end">
            <div>
              <h1 className="text-xl font-bold uppercase tracking-wider">{empresaAtiva.razaoSocial}</h1>
              <p className="text-slate-600">CNPJ: {empresaAtiva.cnpj} | Competência de Apuração: {competenciaAtiva}</p>
              <p className="text-slate-600 font-semibold mt-1">MAPA DE RESSARCIMENTO E CRÉDITO PRESUMIDO DE PIS, COFINS E IPI</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-300">
                CRÉDITO FISCAL RESSARCÍVEL
              </span>
              <p className="text-[10px] text-slate-500 mt-1">Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          {/* Quadro Resumo */}
          <div className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-300">
            <div>
              <span className="text-slate-500 block text-[10px]">BASE INSUMOS AGRO</span>
              <span className="font-bold text-sm text-slate-900">
                R$ {apuracao.totalBaseInsumosAgro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">CRÉDITO PIS AGRO</span>
              <span className="font-bold text-sm text-blue-800">
                R$ {apuracao.totalCreditoPisApurado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">CRÉDITO COFINS AGRO</span>
              <span className="font-bold text-sm text-sky-800">
                R$ {apuracao.totalCreditoCofinsApurado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">CRÉDITO IPI EXPORTAÇÃO</span>
              <span className="font-bold text-sm text-emerald-800">
                R$ {apuracao.totalCreditoIpiExportacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-lg flex justify-between items-center">
            <div>
              <span className="text-xs font-bold text-emerald-950 uppercase">Total Geral de Créditos Presumidos Apurados:</span>
              <p className="text-[10px] text-emerald-700">Valores disponíveis para compensação tributária ou pedido de restituição em conta via PER/DCOMP</p>
            </div>
            <div className="text-xl font-black text-emerald-900">
              R$ {apuracao.totalGeralCreditosPresumidos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* Tabela de Itens */}
          <div>
            <h2 className="font-bold text-sm uppercase text-slate-800 mb-2 border-b border-slate-300 pb-1">
              Discriminação das Aquisições e Exportações Geradoras de Crédito
            </h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-200 text-slate-700 text-[10px] uppercase">
                  <th className="p-2 border border-slate-300">Documento / Data</th>
                  <th className="p-2 border border-slate-300">Operação & Cadeia</th>
                  <th className="p-2 border border-slate-300">Origem</th>
                  <th className="p-2 border border-slate-300 text-right">Base de Cálculo (R$)</th>
                  <th className="p-2 border border-slate-300 text-center">Alíq. (%)</th>
                  <th className="p-2 border border-slate-300 text-right">Crédito Presumido (R$)</th>
                  <th className="p-2 border border-slate-300 text-center">PER/DCOMP</th>
                </tr>
              </thead>
              <tbody>
                {itensFiltrados.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="p-2 border border-slate-300 font-medium">
                      <div>{item.documentoOrigem}</div>
                      <div className="text-[10px] text-slate-500">{item.dataEmissao}</div>
                    </td>
                    <td className="p-2 border border-slate-300">
                      <div className="font-semibold text-slate-900">{item.descricaoOperacao}</div>
                      <div className="text-[10px] text-slate-600">Cadeia: {item.cadeia}</div>
                    </td>
                    <td className="p-2 border border-slate-300 text-[10px]">
                      {item.origemAquisicao}
                    </td>
                    <td className="p-2 border border-slate-300 text-right font-medium">
                      {item.baseCalculoAquisicao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2 border border-slate-300 text-center font-bold text-blue-900">
                      {item.aliquotaCreditoPresumido.toFixed(2)}%
                    </td>
                    <td className="p-2 border border-slate-300 text-right font-bold text-emerald-800">
                      {item.valorCreditoPresumido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2 border border-slate-300 text-center text-[10px] font-mono">
                      {item.numeroDcompPedidoRessarcimento || 'PENDENTE'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Fundamentação Legal */}
          <div className="bg-slate-100 p-3 rounded border border-slate-300 text-[10px] text-slate-700 space-y-1">
            <p className="font-bold uppercase text-slate-900">Fundamentação Normativa RFB:</p>
            <p>1. <strong>Lei nº 10.925/2004 (Art. 8º):</strong> As pessoas jurídicas que produzam mercadorias agropecuárias ou agroindustriais podem deduzir crédito presumido da Contribuição para o PIS/PASEP e da COFINS sobre insumos adquiridos de produtor rural pessoa física ou cooperativa agropecuária.</p>
            <p>2. <strong>Lei nº 9.363/1996 e Lei nº 10.276/2001:</strong> A pessoa jurídica produtora e exportadora de mercadorias nacionais faz jus a crédito presumido do IPI, como ressarcimento das contribuições ao PIS e COFINS incidentes sobre as respectivas aquisições de matérias-primas e insumos no mercado interno.</p>
          </div>

          {/* Assinaturas */}
          <div className="pt-10 flex justify-between text-center text-xs">
            <div className="border-t border-slate-400 w-64 pt-1">
              <p className="font-bold">{empresaAtiva.razaoSocial}</p>
              <p className="text-[10px] text-slate-600">Representante Legal</p>
            </div>
            <div className="border-t border-slate-400 w-64 pt-1">
              <p className="font-bold">{empresaAtiva.contadorNome || 'Contador Responsável'}</p>
              <p className="text-[10px] text-slate-600">CRC {empresaAtiva.crcContador || 'GO-029412/O'}</p>
            </div>
          </div>
        </div>
      )
    });
  };

  return (
    <div className="p-6 bg-[#141414] min-h-screen text-slate-100 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <Wheat className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Crédito Presumido de IPI Exportação & PIS/COFINS Agro
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-900/40 text-amber-300 border border-amber-700/50">
                  Leis 9.363/96 & 10.925/04
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Ressarcimento de Insumos Agropecuários, Cadeia de Grãos/Leite/Carnes e Exportação via PER/DCOMP
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mr-2">
            <span className="text-xs text-slate-400">Competência:</span>
            <input
              type="month"
              value={competenciaAtiva}
              onChange={e => {
                setCompetenciaAtiva(e.target.value);
                handleRecarregar(e.target.value);
              }}
              className="px-2.5 py-1.5 bg-[#1e1e1e] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <button
            onClick={abrirModalNovo}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg transition shadow-md shadow-amber-600/20"
          >
            <Plus className="w-4 h-4" />
            Novo Crédito
          </button>
          <button
            onClick={handleIntegrarContabil}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition shadow-md shadow-blue-600/20"
          >
            <FileCheck2 className="w-4 h-4" />
            Integrar Diário (1-Clique)
          </button>
          <button
            onClick={handleExportarCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={handleImprimirRelatorio}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition shadow-md shadow-emerald-700/20"
          >
            <Printer className="w-4 h-4" />
            Dossiê A4
          </button>
        </div>
      </div>

      {mensagemSucesso && (
        <div className="p-3.5 bg-emerald-950/70 border border-emerald-500/50 rounded-lg text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{mensagemSucesso}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 bg-[#1e1e1e] border border-slate-800 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Base Insumos Agro</span>
            <Wheat className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-white tracking-tight">
            R$ {apuracao.totalBaseInsumosAgro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Aquisições de PF / Cooperativas</p>
        </div>

        <div className="p-4 bg-[#1e1e1e] border border-slate-800 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Base Exportação IPI</span>
            <Truck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-lg font-bold text-blue-400 tracking-tight">
            R$ {apuracao.totalBaseExportacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Insumos em manufaturados</p>
        </div>

        <div className="p-4 bg-[#1e1e1e] border border-slate-800 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Crédito PIS / COFINS</span>
            <TrendingUp className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-lg font-bold text-sky-400 tracking-tight">
            R$ {(apuracao.totalCreditoPisApurado + apuracao.totalCreditoCofinsApurado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">PIS + COFINS Agroindustrial</p>
        </div>

        <div className="p-4 bg-[#1e1e1e] border border-slate-800 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Crédito IPI Exportação</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-400 tracking-tight">
            R$ {apuracao.totalCreditoIpiExportacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Ressarcimento Lei 9.363</p>
        </div>

        <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Ressarcível</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-black text-emerald-300 tracking-tight">
            R$ {apuracao.totalGeralCreditosPresumidos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-emerald-500 mt-1">PER/DCOMP / Compensação</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="p-4 bg-[#1e1e1e] border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por descrição, documento ou número PER/DCOMP..."
              value={filtroTexto}
              onChange={e => setFiltroTexto(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#141414] border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={filtroTipo}
            onChange={e => setFiltroTipo(e.target.value)}
            className="px-3 py-1.5 bg-[#141414] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="TODOS">Todos os Modelos</option>
            <option value="PIS_COFINS_AGRO_GRAOS">PIS/COFINS Grãos (Soja/Milho)</option>
            <option value="PIS_COFINS_AGRO_LEITE">PIS/COFINS Leite e Derivados</option>
            <option value="PIS_COFINS_AGRO_CARNES">PIS/COFINS Carnes (Bov/Suí/Aves)</option>
            <option value="PIS_COFINS_AGRO_CAFE">PIS/COFINS Café em Grão</option>
            <option value="IPI_RESSARCIMENTO_EXPORTACAO">IPI Ressarcimento Exportação (Lei 9.363)</option>
          </select>
        </div>

        <div className="text-xs text-slate-400">
          Itens apurados: <span className="font-semibold text-white">{itensFiltrados.length}</span>
        </div>
      </div>

      {/* Tabela de Itens */}
      <div className="bg-[#1e1e1e] border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#181818] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Documento & Data</th>
                <th className="p-3.5">Operação / Cadeia</th>
                <th className="p-3.5">Origem Aquisição</th>
                <th className="p-3.5 text-right">Base de Aquisição</th>
                <th className="p-3.5 text-center">Alíquota</th>
                <th className="p-3.5 text-right">Crédito Presumido</th>
                <th className="p-3.5 text-center">PER/DCOMP</th>
                <th className="p-3.5 text-center">Contábil</th>
                <th className="p-3.5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {itensFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    Nenhum crédito presumido registrado nesta competência.
                  </td>
                </tr>
              ) : (
                itensFiltrados.map(i => (
                  <tr key={i.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-medium text-white">
                      <div>{i.documentoOrigem}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{i.dataEmissao}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-200">{i.descricaoOperacao}</div>
                      <div className="text-[10px] text-amber-400/90 font-medium">{i.cadeia}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {i.origemAquisicao}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-medium text-slate-200">
                      R$ {i.baseCalculoAquisicao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5 text-center font-bold text-amber-400">
                      {i.aliquotaCreditoPresumido.toFixed(2)}%
                    </td>
                    <td className="p-3.5 text-right font-bold text-emerald-400">
                      R$ {i.valorCreditoPresumido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5 text-center font-mono text-[10px]">
                      {i.numeroDcompPedidoRessarcimento ? (
                        <span className="text-blue-400 font-semibold">{i.numeroDcompPedidoRessarcimento}</span>
                      ) : (
                        <span className="text-slate-500">A GERAR</span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      {i.integradoContabil ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Lançado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-semibold">
                          <AlertCircle className="w-3.5 h-3.5" /> Pendente
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => abrirModalEditar(i)}
                          title="Editar Item"
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleExcluir(i.id)}
                          title="Excluir Item"
                          className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded transition"
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

      {/* Modal de Cadastro / Edição */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1c1c1c] border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#222222]">
              <div className="flex items-center gap-2">
                <Wheat className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-sm">
                  {editando ? 'Editar Crédito Presumido' : 'Lançar Novo Crédito Presumido'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvar} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Modalidade do Crédito Presumido *</label>
                  <select
                    value={tipo}
                    onChange={e => handleTipoChange(e.target.value as TipoCreditoPresumido)}
                    className="w-full px-3 py-2 bg-[#141414] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="PIS_COFINS_AGRO_GRAOS">PIS/COFINS Grãos (Soja/Milho - 5,4%)</option>
                    <option value="PIS_COFINS_AGRO_LEITE">PIS/COFINS Leite e Derivados (3,6%)</option>
                    <option value="PIS_COFINS_AGRO_CARNES">PIS/COFINS Carnes (Bov/Suí/Aves - 4,5%)</option>
                    <option value="PIS_COFINS_AGRO_CAFE">PIS/COFINS Café em Grão (4,0%)</option>
                    <option value="IPI_RESSARCIMENTO_EXPORTACAO">IPI Ressarcimento Exportação (Lei 9.363/96 - 5,37%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Cadeia Produtiva *</label>
                  <select
                    value={cadeia}
                    onChange={e => setCadeia(e.target.value as CadeiaProdutivaAgro)}
                    className="w-full px-3 py-2 bg-[#141414] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="SOJA_MILHO">Soja & Milho</option>
                    <option value="LEITE_DERIVADOS">Leite e Derivados</option>
                    <option value="BOVINOS_SUINOS_AVES">Bovinos, Suínos e Aves</option>
                    <option value="CAFE_EM_GRAO">Café em Grão</option>
                    <option value="EXPORTACAO_MANUFATURADOS_GERAL">Exportação de Manufaturados em Geral</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Origem da Aquisição do Insumo *</label>
                  <select
                    value={origemAquisicao}
                    onChange={e => setOrigemAquisicao(e.target.value as OrigemAquisicaoInsumo)}
                    className="w-full px-3 py-2 bg-[#141414] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="PRODUTOR_RURAL_PF">Produtor Rural Pessoa Física (Art. 8º Lei 10.925)</option>
                    <option value="COOPERATIVA_RURAL">Cooperativa Agropecuária da Agricultura Familiar</option>
                    <option value="PJ_SUSPENSAO_ISENCAO">Pessoa Jurídica com Suspensão/Isenção</option>
                    <option value="MERCADO_INTERNO_CONVENCIONAL">Mercado Interno Convencional (IPI Exportação)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Documento Fiscal / DU-E *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: NF-e 004.912/1 ou DU-E 26BR..."
                    value={documentoOrigem}
                    onChange={e => setDocumentoOrigem(e.target.value)}
                    className="w-full px-3 py-2 bg-[#141414] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Data de Emissão *</label>
                  <input
                    type="date"
                    required
                    value={dataEmissao}
                    onChange={e => setDataEmissao(e.target.value)}
                    className="w-full px-3 py-2 bg-[#141414] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Base de Cálculo de Aquisição (R$) *</label>
                  <input
                    type="text"
                    required
                    value={baseCalculoAquisicao}
                    onChange={e => setBaseCalculoAquisicao(e.target.value)}
                    className="w-full px-3 py-2 bg-[#141414] border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Alíquota Crédito Presumido (%) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={aliquotaCreditoPresumido}
                    onChange={e => setAliquotaCreditoPresumido(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-[#141414] border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Número do PER/DCOMP / Pedido</label>
                  <input
                    type="text"
                    placeholder="Ex: DCOMP-AGRO-2026/03-01"
                    value={numeroDcomp}
                    onChange={e => setNumeroDcomp(e.target.value)}
                    className="w-full px-3 py-2 bg-[#141414] border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Descrição Detalhada da Operação</label>
                <textarea
                  rows={2}
                  value={descricaoOperacao}
                  onChange={e => setDescricaoOperacao(e.target.value)}
                  className="w-full px-3 py-2 bg-[#141414] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Prévia do Cálculo */}
              <div className="bg-[#141414] p-3 rounded-lg border border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400">Crédito Presumido Calculado:</span>
                <span className="text-base font-bold text-emerald-400 font-mono">
                  R$ {(parseValor(baseCalculoAquisicao) * (aliquotaCreditoPresumido / 100)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg transition shadow-md shadow-amber-600/30"
                >
                  {editando ? 'Atualizar Item' : 'Gravar Crédito Presumido'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
