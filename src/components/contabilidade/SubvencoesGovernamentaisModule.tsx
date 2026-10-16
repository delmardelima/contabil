import React, { useState } from 'react';
import { dbService } from '../../db/sqliteService';
import { Empresa, SubvencaoGovernamental, TipoSubvencao, EnquadramentoLegalSubvencao, StatusSubvencao } from '../../types/contabil';
import {
  Landmark,
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle2,
  Download,
  Printer,
  X,
  FileText,
  Building,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Percent,
  BookOpen
} from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

interface SubvencoesGovernamentaisModuleProps {
  empresaAtiva: Empresa;
  onOpenReportPreview?: (config: {
    titulo: string;
    subtitulo: string;
    conteudo?: React.ReactNode;
    linhas?: any[];
  }) => void;
}

export const SubvencoesGovernamentaisModule: React.FC<SubvencoesGovernamentaisModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [subvencoes, setSubvencoes] = useState<SubvencaoGovernamental[]>(() => dbService.getSubvencoesGovernamentais(empresaAtiva.id));
  const [filtroTexto, setFiltroTexto] = useState<string>('');
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editando, setEditando] = useState<SubvencaoGovernamental | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string>('');

  // Form State
  const [enteConcessor, setEnteConcessor] = useState<string>('');
  const [tipoSubvencao, setTipoSubvencao] = useState<TipoSubvencao>('IMPLANTACAO_EXPANSAO');
  const [enquadramentoLegal, setEnquadramentoLegal] = useState<EnquadramentoLegalSubvencao>('LEI_12973_ART30');
  const [numeroAtoConcessao, setNumeroAtoConcessao] = useState<string>('');
  const [dataConcessao, setDataConcessao] = useState<string>(new Date().toISOString().slice(0, 10));
  const [dataHabilitacaoRfb, setDataHabilitacaoRfb] = useState<string>('');
  const [valorTotalSubvencao, setValorTotalSubvencao] = useState<string>('500000,00');
  const [valorApropriadoExercicio, setValorApropriadoExercicio] = useState<string>('150000,00');
  const [status, setStatus] = useState<StatusSubvencao>('HABILITADA');
  const [cumpreRequisitosNaoDistribuicao, setCumpreRequisitosNaoDistribuicao] = useState<boolean>(true);
  const [observacoes, setObservacoes] = useState<string>('');

  const handleRecarregar = () => {
    setSubvencoes(dbService.getSubvencoesGovernamentais(empresaAtiva.id));
  };

  const parseValor = (valStr: string): number => {
    const cleaned = valStr.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  const abrirModalNovo = () => {
    setEditando(null);
    setEnteConcessor('');
    setTipoSubvencao('IMPLANTACAO_EXPANSAO');
    setEnquadramentoLegal('LEI_12973_ART30');
    setNumeroAtoConcessao('');
    setDataConcessao(new Date().toISOString().slice(0, 10));
    setDataHabilitacaoRfb('');
    setValorTotalSubvencao('500000,00');
    setValorApropriadoExercicio('150000,00');
    setStatus('HABILITADA');
    setCumpreRequisitosNaoDistribuicao(true);
    setObservacoes('');
    setShowModal(true);
  };

  const abrirModalEditar = (sub: SubvencaoGovernamental) => {
    setEditando(sub);
    setEnteConcessor(sub.enteConcessor);
    setTipoSubvencao(sub.tipoSubvencao);
    setEnquadramentoLegal(sub.enquadramentoLegal);
    setNumeroAtoConcessao(sub.numeroAtoConcessao);
    setDataConcessao(sub.dataConcessao);
    setDataHabilitacaoRfb(sub.dataHabilitacaoRfb || '');
    setValorTotalSubvencao(sub.valorTotalSubvencao.toFixed(2).replace('.', ','));
    setValorApropriadoExercicio(sub.valorApropriadoExercicio.toFixed(2).replace('.', ','));
    setStatus(sub.status);
    setCumpreRequisitosNaoDistribuicao(sub.cumpreRequisitosNaoDistribuicao);
    setObservacoes(sub.observacoes || '');
    setShowModal(true);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    const vTotal = parseValor(valorTotalSubvencao);
    const vAprop = parseValor(valorApropriadoExercicio);

    // Se enquadrado na Lei 14.789/2023, crédito fiscal é de 25% (alíquota IRPJ) sobre despesas elegíveis
    let credito25: number | undefined = undefined;
    if (enquadramentoLegal === 'LEI_14789_CREDITO_25') {
      credito25 = Math.round(vAprop * 0.25 * 100) / 100;
    }

    const subItem: SubvencaoGovernamental = {
      id: editando ? editando.id : `sub-${Date.now()}`,
      empresaId: empresaAtiva.id,
      enteConcessor,
      tipoSubvencao,
      enquadramentoLegal,
      numeroAtoConcessao,
      dataConcessao,
      dataHabilitacaoRfb: dataHabilitacaoRfb || undefined,
      valorTotalSubvencao: vTotal,
      valorApropriadoExercicio: vAprop,
      destinacaoReservaIncentivosPL: editando ? editando.destinacaoReservaIncentivosPL : 0,
      creditoFiscalIscricao25: credito25,
      status,
      cumpreRequisitosNaoDistribuicao,
      observacoes: observacoes || undefined,
      integradoContabil: editando ? editando.integradoContabil : false
    };

    dbService.salvarSubvencaoGovernamental(subItem);
    handleRecarregar();
    setShowModal(false);
    setMensagemSucesso('Subvenção governamental salva com sucesso!');
    setTimeout(() => setMensagemSucesso(''), 4000);
  };

  const handleExcluir = (id: string) => {
    if (window.confirm('Confirma a exclusão deste registro de subvenção governamental?')) {
      dbService.excluirSubvencaoGovernamental(id);
      handleRecarregar();
      setMensagemSucesso('Registro excluído com sucesso.');
      setTimeout(() => setMensagemSucesso(''), 4000);
    }
  };

  const handleDestinarReservaPL = (subId: string) => {
    const res = dbService.destinarSubvencaoReservaIncentivosPL(subId);
    if (res.sucesso) {
      handleRecarregar();
      setMensagemSucesso(res.mensagem);
      setTimeout(() => setMensagemSucesso(''), 7000);
    } else {
      alert(res.mensagem);
    }
  };

  // Totais
  const totalConcedido = subvencoes.reduce((s, i) => s + (i.valorTotalSubvencao || 0), 0);
  const totalApropriado = subvencoes.reduce((s, i) => s + (i.valorApropriadoExercicio || 0), 0);
  const totalReservaPL = subvencoes.reduce((s, i) => s + (i.destinacaoReservaIncentivosPL || 0), 0);
  const totalCredito25 = subvencoes.reduce((s, i) => s + (i.creditoFiscalIscricao25 || 0), 0);

  // Filtros
  const subvencoesFiltradas = subvencoes.filter(s => {
    const matchTexto = s.enteConcessor.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      s.numeroAtoConcessao.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      (s.observacoes && s.observacoes.toLowerCase().includes(filtroTexto.toLowerCase()));
    const matchTipo = filtroTipo === 'TODOS' || s.tipoSubvencao === filtroTipo;
    const matchStatus = filtroStatus === 'TODOS' || s.status === filtroStatus;
    return matchTexto && matchTipo && matchStatus;
  });

  const handleExportarCSV = () => {
    const rows = subvencoesFiltradas.map(s => ({
      ID: s.id,
      EnteConcessor: s.enteConcessor,
      Tipo: s.tipoSubvencao,
      EnquadramentoLegal: s.enquadramentoLegal,
      AtoConcessao: s.numeroAtoConcessao,
      DataConcessao: s.dataConcessao,
      HabilitacaoRFB: s.dataHabilitacaoRfb || 'N/A',
      ValorTotal: s.valorTotalSubvencao,
      ValorApropriadoExercicio: s.valorApropriadoExercicio,
      DestinadoReservaPL: s.destinacaoReservaIncentivosPL,
      CreditoFiscal25: s.creditoFiscalIscricao25 || 0,
      Status: s.status,
      NaoDistribuivelDividendos: s.cumpreRequisitosNaoDistribuicao ? 'SIM' : 'NÃO',
      IntegradoContabil: s.integradoContabil ? 'SIM' : 'NÃO'
    }));
    exportToCSV(rows, `subvencoes_governamentais_cpc07_${empresaAtiva.cnpj.replace(/\D/g, '')}`);
  };

  const handleImprimirRelatorio = () => {
    if (!onOpenReportPreview) return;

    onOpenReportPreview({
      titulo: 'DEMONSTRATIVO DE SUBVENÇÕES GOVERNAMENTAIS PARA INVESTIMENTOS',
      subtitulo: `CPC 07 (R1) | Lei 12.973/2014 Art. 30 | Lei 14.789/2023 - Exercício ${empresaAtiva.exercicioAtivo}`,
      conteudo: (
        <div className="p-8 space-y-6 text-slate-800 text-xs">
          <div className="border-b-2 border-slate-700 pb-3 flex justify-between items-end">
            <div>
              <h1 className="text-xl font-bold uppercase tracking-wider">{empresaAtiva.razaoSocial}</h1>
              <p className="text-slate-600">CNPJ: {empresaAtiva.cnpj} | CRC Contador: {empresaAtiva.crcContador || 'GO-029412/O'}</p>
              <p className="text-slate-600 font-semibold mt-1">RELATÓRIO FISCAL-CONTÁBIL DE INCENTIVOS E RESERVA DE SUBVENÇÃO</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded border border-blue-300">
                LUCRO REAL / RESERVA PL
              </span>
              <p className="text-[10px] text-slate-500 mt-1">Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          {/* Cards Resumo */}
          <div className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-300">
            <div>
              <span className="text-slate-500 block text-[10px]">TOTAL CONCEDIDO</span>
              <span className="font-bold text-sm text-slate-900">
                R$ {totalConcedido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">APROPRIADO NO EXERCÍCIO</span>
              <span className="font-bold text-sm text-blue-800">
                R$ {totalApropriado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">RESERVA DE INCENTIVOS (PL)</span>
              <span className="font-bold text-sm text-emerald-800">
                R$ {totalReservaPL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">CRÉDITO FISCAL IRPJ 25%</span>
              <span className="font-bold text-sm text-amber-800">
                R$ {totalCredito25.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Tabela de Detalhamento */}
          <div>
            <h2 className="font-bold text-sm uppercase text-slate-800 mb-2 border-b border-slate-300 pb-1">
              Relação Analítica de Subvenções Governamentais Registradas
            </h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-200 text-slate-700 text-[10px] uppercase">
                  <th className="p-2 border border-slate-300">Ente Concessor / Ato</th>
                  <th className="p-2 border border-slate-300">Enquadramento Legal</th>
                  <th className="p-2 border border-slate-300 text-right">Valor Total (R$)</th>
                  <th className="p-2 border border-slate-300 text-right">Aprop. Exer. (R$)</th>
                  <th className="p-2 border border-slate-300 text-right">Reserva PL (R$)</th>
                  <th className="p-2 border border-slate-300 text-center">Créd. 25%</th>
                  <th className="p-2 border border-slate-300 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {subvencoesFiltradas.map((s, idx) => (
                  <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="p-2 border border-slate-300 font-medium">
                      <div>{s.enteConcessor}</div>
                      <div className="text-[10px] text-slate-500">Ato: {s.numeroAtoConcessao} | Conc.: {s.dataConcessao}</div>
                    </td>
                    <td className="p-2 border border-slate-300">
                      <span className="font-semibold text-blue-900">
                        {s.enquadramentoLegal === 'LEI_12973_ART30' ? 'Lei 12.973/14 Art. 30' : s.enquadramentoLegal === 'LEI_14789_CREDITO_25' ? 'Lei 14.789/23 (Crédito 25%)' : 'CPC 07 (R1)'}
                      </span>
                    </td>
                    <td className="p-2 border border-slate-300 text-right">
                      {s.valorTotalSubvencao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2 border border-slate-300 text-right font-semibold text-blue-900">
                      {s.valorApropriadoExercicio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2 border border-slate-300 text-right font-bold text-emerald-800">
                      {s.destinacaoReservaIncentivosPL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2 border border-slate-300 text-center font-semibold text-amber-900">
                      {s.creditoFiscalIscricao25 ? `R$ ${s.creditoFiscalIscricao25.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td className="p-2 border border-slate-300 text-center">
                      <span className="font-bold text-[9px] uppercase">{s.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Fundamentação Legal */}
          <div className="bg-slate-100 p-3 rounded border border-slate-300 text-[10px] text-slate-700 space-y-1">
            <p className="font-bold uppercase text-slate-900">Parecer Técnico e Requisitos Legais Mandatórios:</p>
            <p>1. <strong>Art. 30 da Lei nº 12.973/2014 & CPC 07 (R1):</strong> As subvenções para investimentos concedidas como estímulo à implantação ou expansão de empreendimentos econômicos não são computadas na base de cálculo de IRPJ e CSLL desde que mantidas na <em>Reserva de Incentivos Fiscais</em> (Conta 2.04.01.004 do Patrimônio Líquido), não podendo ser distribuídas como dividendos nem capitalizadas com restituição de capital aos sócios sob pena de tributação imediata com acréscimos legais.</p>
            <p>2. <strong>Lei nº 14.789/2023:</strong> A partir de 01/01/2024, as pessoas jurídicas habilitadas previamente perante a Secretaria Especial da Receita Federal do Brasil (RFB) podem apurar crédito fiscal de IRPJ à alíquota de 25% incidente sobre as receitas de subvenção destinadas a despesas de depreciação/amortização de bens de implantação/expansão.</p>
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
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Subvenções Governamentais para Investimentos
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-900/40 text-blue-300 border border-blue-700/50">
                  CPC 07 (R1) / Lei 12.973 / Lei 14.789
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Destinação para Reserva de Incentivos Fiscais no PL, Crédito Fiscal IRPJ 25% e Vedação de Dividendos
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={abrirModalNovo}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition shadow-md shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            Nova Subvenção
          </button>
          <button
            onClick={handleExportarCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
          <button
            onClick={handleImprimirRelatorio}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition shadow-md shadow-emerald-700/20"
          >
            <Printer className="w-4 h-4" />
            Dossiê A4 Timbrado
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-[#1e1e1e] border border-slate-800 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Concedido</span>
            <Building className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight">
            R$ {totalConcedido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Atos legais de concessão</p>
        </div>

        <div className="p-4 bg-[#1e1e1e] border border-slate-800 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Apropriado no Exercício</span>
            <TrendingUp className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-bold text-sky-400 tracking-tight">
            R$ {totalApropriado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Reconhecido na DRE (CPC 07)</p>
        </div>

        <div className="p-4 bg-[#1e1e1e] border border-slate-800 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Reserva no PL (Art. 30)</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 tracking-tight">
            R$ {totalReservaPL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Conta 2.04.01.004 do PL</p>
        </div>

        <div className="p-4 bg-[#1e1e1e] border border-slate-800 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Crédito Fiscal 25% (Lei 14.789)</span>
            <Percent className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400 tracking-tight">
            R$ {totalCredito25.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Crédito ressarcível RFB</p>
        </div>
      </div>

      {/* Filtros e Barra de Ações */}
      <div className="p-4 bg-[#1e1e1e] border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por ente concessor, ato ou observações..."
              value={filtroTexto}
              onChange={e => setFiltroTexto(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#141414] border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={filtroTipo}
            onChange={e => setFiltroTipo(e.target.value)}
            className="px-3 py-1.5 bg-[#141414] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="TODOS">Todos os Tipos</option>
            <option value="IMPLANTACAO_EXPANSAO">Implantação / Expansão</option>
            <option value="CREDITO_PRESUMIDO_ICMS">Crédito Outorgado / Presumido ICMS</option>
            <option value="DOACAO_TERRENO_PUBLICO">Doação de Imóvel Público</option>
            <option value="ISENCAO_REDUCAO_TRIBUTARIA">Isenção / Redução Tributária</option>
            <option value="CUSTEIO_OPERACIONAL">Custeio Operacional</option>
          </select>

          <select
            value={filtroStatus}
            onChange={e => setFiltroStatus(e.target.value)}
            className="px-3 py-1.5 bg-[#141414] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="TODOS">Todos os Status</option>
            <option value="HABILITADA">Habilitada</option>
            <option value="EM_ANALISE_RFB">Em Análise RFB</option>
            <option value="APROVADA_UTILIZADA">Aprovada / Utilizada</option>
            <option value="GLOSADA">Glosada</option>
          </select>
        </div>

        <div className="text-xs text-slate-400">
          Total de registros: <span className="font-semibold text-white">{subvencoesFiltradas.length}</span>
        </div>
      </div>

      {/* Tabela de Subvenções */}
      <div className="bg-[#1e1e1e] border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#181818] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Ente Concessor & Ato</th>
                <th className="p-3.5">Enquadramento Legal</th>
                <th className="p-3.5 text-right">Valor Total Concedido</th>
                <th className="p-3.5 text-right">Apropriado Exer.</th>
                <th className="p-3.5 text-right">Reserva no PL</th>
                <th className="p-3.5 text-center">Créd. Fiscal 25%</th>
                <th className="p-3.5 text-center">Vedado Dividendos</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {subvencoesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    Nenhuma subvenção governamental encontrada para os filtros aplicados.
                  </td>
                </tr>
              ) : (
                subvencoesFiltradas.map(s => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-medium text-white">
                      <div>{s.enteConcessor}</div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        {s.numeroAtoConcessao} ({s.dataConcessao})
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-950/60 text-blue-300 border border-blue-800/50">
                        {s.enquadramentoLegal === 'LEI_12973_ART30' ? 'Lei 12.973/14 Art. 30' : s.enquadramentoLegal === 'LEI_14789_CREDITO_25' ? 'Lei 14.789/23 (Crédito 25%)' : 'CPC 07 (R1)'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-medium text-slate-200">
                      R$ {s.valorTotalSubvencao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5 text-right font-semibold text-sky-400">
                      R$ {s.valorApropriadoExercicio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5 text-right font-bold text-emerald-400">
                      R$ {s.destinacaoReservaIncentivosPL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5 text-center font-semibold text-amber-400">
                      {s.creditoFiscalIscricao25 ? `R$ ${s.creditoFiscalIscricao25.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td className="p-3.5 text-center">
                      {s.cumpreRequisitosNaoDistribuicao ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Cumprido
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-rose-400 font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5" /> Risco de Glosa
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.status === 'APROVADA_UTILIZADA'
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                          : s.status === 'HABILITADA'
                          ? 'bg-blue-950/80 text-blue-300 border border-blue-700/60'
                          : s.status === 'EM_ANALISE_RFB'
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-700/60'
                          : 'bg-rose-950/80 text-rose-300 border border-rose-700/60'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {s.destinacaoReservaIncentivosPL === 0 && s.valorApropriadoExercicio > 0 && (
                          <button
                            onClick={() => handleDestinarReservaPL(s.id)}
                            title="Destinar para Reserva de Incentivos Fiscais no PL (Conta 2.04.01.004)"
                            className="px-2 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-bold flex items-center gap-1 transition"
                          >
                            <ShieldCheck className="w-3 h-3" /> Destinar PL
                          </button>
                        )}
                        <button
                          onClick={() => abrirModalEditar(s)}
                          title="Editar Subvenção"
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleExcluir(s.id)}
                          title="Excluir Registro"
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
                <Landmark className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white text-sm">
                  {editando ? 'Editar Subvenção Governamental' : 'Cadastrar Nova Subvenção Governamental'}
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
                  <label className="block text-slate-300 font-medium mb-1">Ente Concessor *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: SEFAZ/GO - Programa Fomentar"
                    value={enteConcessor}
                    onChange={e => setEnteConcessor(e.target.value)}
                    className="w-full px-3 py-2 bg-[#141414] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Tipo de Subvenção *</label>
                  <select
                    value={tipoSubvencao}
                    onChange={e => setTipoSubvencao(e.target.value as TipoSubvencao)}
                    className="w-full px-3 py-2 bg-[#141414] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="IMPLANTACAO_EXPANSAO">Implantação / Expansão Fabril</option>
                    <option value="CREDITO_PRESUMIDO_ICMS">Crédito Presumido / Outorgado de ICMS</option>
                    <option value="DOACAO_TERRENO_PUBLICO">Doação de Terreno / Imóvel Público</option>
                    <option value="ISENCAO_REDUCAO_TRIBUTARIA">Isenção / Redução Tributária (SUDENE/SUDAM)</option>
                    <option value="CUSTEIO_OPERACIONAL">Custeio Operacional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Enquadramento Legal *</label>
                  <select
                    value={enquadramentoLegal}
                    onChange={e => setEnquadramentoLegal(e.target.value as EnquadramentoLegalSubvencao)}
                    className="w-full px-3 py-2 bg-[#141414] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="LEI_12973_ART30">Lei 12.973/14 Art. 30 (Exclusão IRPJ/CSLL via Reserva PL)</option>
                    <option value="LEI_14789_CREDITO_25">Lei 14.789/23 (Crédito Fiscal de IRPJ 25% Habilitado)</option>
                    <option value="CPC07_SUBVENCAO_RECEITA">CPC 07 (R1) - Reconhecimento no Resultado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Ato Concessório / TARE *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: TARE nº 412/2023-SEFAZ"
                    value={numeroAtoConcessao}
                    onChange={e => setNumeroAtoConcessao(e.target.value)}
                    className="w-full px-3 py-2 bg-[#141414] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Data da Concessão *</label>
                  <input
                    type="date"
                    required
                    value={dataConcessao}
                    onChange={e => setDataConcessao(e.target.value)}
                    className="w-full px-3 py-2 bg-[#141414] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Habilitação Prévia RFB (Lei 14.789)</label>
                  <input
                    type="date"
                    value={dataHabilitacaoRfb}
                    onChange={e => setDataHabilitacaoRfb(e.target.value)}
                    className="w-full px-3 py-2 bg-[#141414] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Valor Total Concedido (R$) *</label>
                  <input
                    type="text"
                    required
                    value={valorTotalSubvencao}
                    onChange={e => setValorTotalSubvencao(e.target.value)}
                    className="w-full px-3 py-2 bg-[#141414] border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Apropriado no Exercício (R$) *</label>
                  <input
                    type="text"
                    required
                    value={valorApropriadoExercicio}
                    onChange={e => setValorApropriadoExercicio(e.target.value)}
                    className="w-full px-3 py-2 bg-[#141414] border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Status da Subvenção *</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as StatusSubvencao)}
                    className="w-full px-3 py-2 bg-[#141414] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="HABILITADA">Habilitada</option>
                    <option value="EM_ANALISE_RFB">Em Análise RFB</option>
                    <option value="APROVADA_UTILIZADA">Aprovada / Utilizada</option>
                    <option value="GLOSADA">Glosada</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="chkDividendos"
                    checked={cumpreRequisitosNaoDistribuicao}
                    onChange={e => setCumpreRequisitosNaoDistribuicao(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 bg-[#141414] border-slate-700 focus:ring-0"
                  />
                  <label htmlFor="chkDividendos" className="text-slate-300 cursor-pointer">
                    Vedada a distribuição como dividendos aos sócios (Art. 30 § 2º)
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Observações e Fundamentação</label>
                <textarea
                  rows={2}
                  placeholder="Informações complementares sobre o projeto de investimento..."
                  value={observacoes}
                  onChange={e => setObservacoes(e.target.value)}
                  className="w-full px-3 py-2 bg-[#141414] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition shadow-md shadow-blue-600/30"
                >
                  {editando ? 'Atualizar Subvenção' : 'Gravar Subvenção'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
