import React, { useState } from 'react';
import { dbService } from '../../db/sqliteService';
import {
  Empresa,
  ContratoAVPCpc12,
  TipoOperacaoAVP,
  MetodoCalculoAVP,
  StatusContratoAVP,
  DemonstrativoMensalAVP
} from '../../types/contabil';
import {
  Calculator,
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
  TrendingDown,
  TrendingUp,
  Percent,
  Calendar,
  DollarSign,
  Layers,
  ArrowRight
} from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

interface AjusteValorPresenteModuleProps {
  empresaAtiva: Empresa;
  onOpenReportPreview?: (config: {
    titulo: string;
    subtitulo: string;
    conteudo?: React.ReactNode;
    linhas?: any[];
  }) => void;
}

export const AjusteValorPresenteModule: React.FC<AjusteValorPresenteModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [contratos, setContratos] = useState<ContratoAVPCpc12[]>(() => dbService.getContratosAVP(empresaAtiva.id));
  const [filtroTexto, setFiltroTexto] = useState<string>('');
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editando, setEditando] = useState<ContratoAVPCpc12 | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string>('');
  const [showSimulador, setShowSimulador] = useState<boolean>(false);

  // Form State
  const [tipoOperacao, setTipoOperacao] = useState<TipoOperacaoAVP>('CLIENTES_RECEBER');
  const [numeroDocumento, setNumeroDocumento] = useState<string>('');
  const [contraparteNome, setContraparteNome] = useState<string>('');
  const [contraparteCpfCnpj, setContraparteCpfCnpj] = useState<string>('');
  const [dataOperacao, setDataOperacao] = useState<string>(new Date().toISOString().slice(0, 10));
  const [dataVencimentoFinal, setDataVencimentoFinal] = useState<string>('');
  const [prazoMeses, setPrazoMeses] = useState<number>(24);
  const [valorNominalFuturo, setValorNominalFuturo] = useState<string>('120000,00');
  const [taxaDescontoAnual, setTaxaDescontoAnual] = useState<string>('11,75');
  const [metodo, setMetodo] = useState<MetodoCalculoAVP>('JUROS_EXPONENCIAL');
  const [status, setStatus] = useState<StatusContratoAVP>('ATIVO');
  const [observacoes, setObservacoes] = useState<string>('');

  // Simulador State
  const [simFV, setSimFV] = useState<number>(100000);
  const [simMeses, setSimMeses] = useState<number>(24);
  const [simTaxaAnual, setSimTaxaAnual] = useState<number>(12);

  const handleRecarregar = () => {
    setContratos(dbService.getContratosAVP(empresaAtiva.id));
  };

  const parseValor = (valStr: string): number => {
    const cleaned = valStr.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  // Funções matemáticas financeiras CPC 12
  const calcularTaxaMensal = (taxaAnualPerc: number): number => {
    const iAnual = taxaAnualPerc / 100;
    // (1 + i_a)^(1/12) - 1
    const iMensal = Math.pow(1 + iAnual, 1 / 12) - 1;
    return Math.round(iMensal * 10000) / 100; // em % com 4 casas
  };

  const calcularPresentValue = (fv: number, taxaAnualPerc: number, meses: number): { pv: number; avp: number; taxaMensal: number } => {
    const iMensal = (Math.pow(1 + (taxaAnualPerc / 100), 1 / 12) - 1);
    const pv = fv / Math.pow(1 + iMensal, meses);
    const avp = fv - pv;
    return {
      pv: Math.round(pv * 100) / 100,
      avp: Math.round(avp * 100) / 100,
      taxaMensal: Math.round(iMensal * 10000) / 100
    };
  };

  const abrirModalNovo = () => {
    setEditando(null);
    setTipoOperacao('CLIENTES_RECEBER');
    setNumeroDocumento(`CTR-${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`);
    setContraparteNome('');
    setContraparteCpfCnpj('');
    setDataOperacao(new Date().toISOString().slice(0, 10));
    const dVenc = new Date();
    dVenc.setMonth(dVenc.getMonth() + 24);
    setDataVencimentoFinal(dVenc.toISOString().slice(0, 10));
    setPrazoMeses(24);
    setValorNominalFuturo('120000,00');
    setTaxaDescontoAnual('11,75');
    setMetodo('JUROS_EXPONENCIAL');
    setStatus('ATIVO');
    setObservacoes('');
    setShowModal(true);
  };

  const abrirModalEditar = (c: ContratoAVPCpc12) => {
    setEditando(c);
    setTipoOperacao(c.tipoOperacao);
    setNumeroDocumento(c.numeroDocumento);
    setContraparteNome(c.contraparteNome);
    setContraparteCpfCnpj(c.contraparteCpfCnpj);
    setDataOperacao(c.dataOperacao);
    setDataVencimentoFinal(c.dataVencimentoFinal);
    setPrazoMeses(c.prazoMeses);
    setValorNominalFuturo(c.valorNominalFuturo.toFixed(2).replace('.', ','));
    setTaxaDescontoAnual(c.taxaDescontoAnual.toFixed(2).replace('.', ','));
    setMetodo(c.metodo);
    setStatus(c.status);
    setObservacoes(c.observacoes || '');
    setShowModal(true);
  };

  const handleSalvarContrato = (e: React.FormEvent) => {
    e.preventDefault();
    const fv = parseValor(valorNominalFuturo);
    const taxaA = parseValor(taxaDescontoAnual);
    const { pv, avp, taxaMensal } = calcularPresentValue(fv, taxaA, prazoMeses);

    const offsetId = (empresaAtiva.id - 1) * 100;
    const contaPatrimonial = tipoOperacao === 'CLIENTES_RECEBER' ? offsetId + 4 : offsetId + 15;
    const contaRedutora = tipoOperacao === 'CLIENTES_RECEBER' ? offsetId + 5 : offsetId + 16;
    const contaResultado = tipoOperacao === 'CLIENTES_RECEBER' ? offsetId + 41 : offsetId + 47;

    const contratoData: ContratoAVPCpc12 = {
      id: editando ? editando.id : `avp_${Date.now()}`,
      empresaId: empresaAtiva.id,
      tipoOperacao,
      numeroDocumento,
      contraparteNome,
      contraparteCpfCnpj,
      dataOperacao,
      dataVencimentoFinal,
      prazoMeses,
      valorNominalFuturo: fv,
      taxaDescontoAnual: taxaA,
      taxaDescontoMensal: taxaMensal,
      valorPresenteCalculado: pv,
      valorAjustePresente: avp,
      valorApropriadoAcumulado: editando ? editando.valorApropriadoAcumulado : 0,
      saldoRemanescenteAVP: editando ? editando.saldoRemanescenteAVP : avp,
      metodo,
      status,
      contaPatrimonialId: contaPatrimonial,
      contaRedutoraAvpId: contaRedutora,
      contaResultadoJurosId: contaResultado,
      observacoes,
      integradoContabil: editando ? editando.integradoContabil : false
    };

    dbService.salvarContratoAVP(contratoData);
    handleRecarregar();
    setShowModal(false);
    setMensagemSucesso(`Contrato ${numeroDocumento} de AVP salvo com sucesso!`);
    setTimeout(() => setMensagemSucesso(''), 5000);
  };

  const handleExcluirContrato = (id: string, numero: string) => {
    if (confirm(`Deseja realmente excluir o contrato de AVP ${numero}?`)) {
      dbService.excluirContratoAVP(id);
      handleRecarregar();
      setMensagemSucesso(`Contrato ${numero} excluído.`);
      setTimeout(() => setMensagemSucesso(''), 4000);
    }
  };

  const handleApropriarMensal = (id: string, numero: string) => {
    const res = dbService.apropriarMensalAVP(id);
    if (res.sucesso) {
      handleRecarregar();
      setMensagemSucesso(res.mensagem);
      setTimeout(() => setMensagemSucesso(''), 6000);
    } else {
      alert(res.mensagem);
    }
  };

  // Cálculos consolidados
  const totalNominal = contratos.reduce((s, i) => s + (i.valorNominalFuturo || 0), 0);
  const totalPV = contratos.reduce((s, i) => s + (i.valorPresenteCalculado || 0), 0);
  const totalAVP = contratos.reduce((s, i) => s + (i.valorAjustePresente || 0), 0);
  const totalApropriado = contratos.reduce((s, i) => s + (i.valorApropriadoAcumulado || 0), 0);
  const totalSaldoRemanescente = contratos.reduce((s, i) => s + (i.saldoRemanescenteAVP || 0), 0);
  const contratosAtivos = contratos.filter(c => c.status === 'ATIVO');

  // Filtros
  const contratosFiltrados = contratos.filter(c => {
    const matchTexto = c.numeroDocumento.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      c.contraparteNome.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      c.contraparteCpfCnpj.includes(filtroTexto);
    const matchTipo = filtroTipo === 'TODOS' || c.tipoOperacao === filtroTipo;
    const matchStatus = filtroStatus === 'TODOS' || c.status === filtroStatus;
    return matchTexto && matchTipo && matchStatus;
  });

  const handleExportarCSV = () => {
    const rows = contratosFiltrados.map(c => ({
      ID: c.id,
      Documento: c.numeroDocumento,
      Contraparte: c.contraparteNome,
      CNPJ_CPF: c.contraparteCpfCnpj,
      TipoOperacao: c.tipoOperacao,
      DataOperacao: c.dataOperacao,
      VencimentoFinal: c.dataVencimentoFinal,
      PrazoMeses: c.prazoMeses,
      TaxaAnual: c.taxaDescontoAnual,
      TaxaMensal: c.taxaDescontoMensal,
      ValorNominalFV: c.valorNominalFuturo,
      ValorPresentePV: c.valorPresenteCalculado,
      AjustePresenteAVP: c.valorAjustePresente,
      ApropriadoAcumulado: c.valorApropriadoAcumulado,
      SaldoRemanescente: c.saldoRemanescenteAVP,
      Metodo: c.metodo,
      Status: c.status,
      IntegradoContabil: c.integradoContabil ? 'SIM' : 'NÃO'
    }));
    exportToCSV(rows, `ajuste_valor_presente_cpc12_${empresaAtiva.cnpj.replace(/\D/g, '')}`);
  };

  const handleImprimirRelatorio = () => {
    if (!onOpenReportPreview) return;

    onOpenReportPreview({
      titulo: 'DEMONSTRATIVO DE AJUSTE A VALOR PRESENTE - AVP',
      subtitulo: `CPC 12 / NBC TG 12 | Lei 11.638/2007 - Exercício ${empresaAtiva.exercicioAtivo}`,
      conteudo: (
        <div className="p-8 space-y-6 text-slate-800 text-xs">
          <div className="border-b-2 border-slate-700 pb-3 flex justify-between items-end">
            <div>
              <h1 className="text-xl font-bold uppercase tracking-wider">{empresaAtiva.razaoSocial}</h1>
              <p className="text-slate-600">CNPJ: {empresaAtiva.cnpj} | Enquadramento: {empresaAtiva.regimeTributario}</p>
              <p className="text-slate-600 font-semibold mt-1">DOSSIÊ TÉCNICO DE MENSURAÇÃO E DESCONTO A VALOR PRESENTE (CPC 12)</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded border border-indigo-300">
                CPC 12 / NBC TG 12
              </span>
              <p className="text-[10px] text-slate-500 mt-1">Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          {/* Cards Resumo */}
          <div className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-300">
            <div>
              <span className="text-slate-500 block text-[10px]">TOTAL NOMINAL (FV)</span>
              <span className="font-bold text-sm text-slate-900">
                R$ {totalNominal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">VALOR PRESENTE (PV)</span>
              <span className="font-bold text-sm text-blue-800">
                R$ {totalPV.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">AVP ACUMULADO (DESCONTO)</span>
              <span className="font-bold text-sm text-amber-800">
                R$ {totalAVP.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">SALDO A APROPRIAR</span>
              <span className="font-bold text-sm text-emerald-800">
                R$ {totalSaldoRemanescente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Relação de Contratos */}
          <div>
            <h2 className="font-bold text-sm uppercase text-slate-800 mb-2 border-b border-slate-300 pb-1">
              Contratos Analíticos Sujeitos a Desconto a Valor Presente
            </h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-200 text-slate-700 text-[10px] uppercase">
                  <th className="p-2 border border-slate-300">Documento / Contraparte</th>
                  <th className="p-2 border border-slate-300">Tipo</th>
                  <th className="p-2 border border-slate-300 text-center">Prazo (m)</th>
                  <th className="p-2 border border-slate-300 text-right">Taxa a.a.</th>
                  <th className="p-2 border border-slate-300 text-right">Nominal FV (R$)</th>
                  <th className="p-2 border border-slate-300 text-right">Presente PV (R$)</th>
                  <th className="p-2 border border-slate-300 text-right">Saldo AVP (R$)</th>
                  <th className="p-2 border border-slate-300 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {contratosFiltrados.map((c, idx) => (
                  <tr key={c.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="p-2 border border-slate-300">
                      <div className="font-bold">{c.numeroDocumento}</div>
                      <div className="text-[10px] text-slate-600">{c.contraparteNome} ({c.contraparteCpfCnpj})</div>
                    </td>
                    <td className="p-2 border border-slate-300">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        c.tipoOperacao === 'CLIENTES_RECEBER' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {c.tipoOperacao === 'CLIENTES_RECEBER' ? 'Clientes (Ativo)' : 'Fornec. (Passivo)'}
                      </span>
                    </td>
                    <td className="p-2 border border-slate-300 text-center font-mono">{c.prazoMeses}</td>
                    <td className="p-2 border border-slate-300 text-right font-mono">{c.taxaDescontoAnual.toFixed(2)}%</td>
                    <td className="p-2 border border-slate-300 text-right font-mono">
                      R$ {c.valorNominalFuturo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2 border border-slate-300 text-right font-mono font-bold text-blue-900">
                      R$ {c.valorPresenteCalculado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2 border border-slate-300 text-right font-mono text-amber-900 font-bold">
                      R$ {c.saldoRemanescenteAVP.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2 border border-slate-300 text-center">
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 border text-slate-700 font-semibold">
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Fundamentação Normativa CPC 12 */}
          <div className="border border-slate-300 bg-slate-50 p-4 rounded text-[11px] leading-relaxed">
            <h3 className="font-bold text-slate-800 uppercase mb-1">Fundamentação Contábil e Regras de Escrituração (CPC 12 / NBC TG 12):</h3>
            <p className="text-slate-700">
              Conforme o item 14 do Pronunciamento Técnico CPC 12 e Artigo 183 da Lei Federal nº 11.638/2007, elementos integrantes do ativo e do passivo decorrentes de operações de longo prazo serão ajustados a valor presente, sendo os demais ajustados quando houver efeito relevante. A diferença apurada entre o valor nominal futuro e o valor presente calculado representa o encargo financeiro embutido, que é reconhecido como receita ou despesa financeira pro-rata tempore ao longo dos períodos de vigência do contrato.
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
            <span className="p-1.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Calculator className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-100">
              Gestão de Ajuste a Valor Presente - AVP (CPC 12 / NBC TG 12)
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Desconto de Fluxos Futuros de Recebíveis e Fornecedores a Longo Prazo, Apropriação de Juros e Diário Geral
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowSimulador(!showSimulador)}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
              showSimulador
                ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/40'
                : 'bg-[#242424] text-slate-300 border-[#383838] hover:bg-[#2e2e2e]'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5 text-indigo-400" />
            Simulador Financeiro
          </button>
          <button
            onClick={handleExportarCSV}
            className="px-3 py-1.5 rounded bg-[#242424] hover:bg-[#2e2e2e] text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-[#383838] transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            Exportar CSV
          </button>
          <button
            onClick={handleImprimirRelatorio}
            className="px-3 py-1.5 rounded bg-[#242424] hover:bg-[#2e2e2e] text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-[#383838] transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            Dossiê A4
          </button>
          <button
            onClick={abrirModalNovo}
            className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Novo Contrato AVP
          </button>
        </div>
      </div>

      {mensagemSucesso && (
        <div className="bg-emerald-950/40 border-b border-emerald-500/30 px-4 py-2.5 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{mensagemSucesso}</span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-3.5 shadow-sm">
            <div className="flex justify-between items-center text-slate-400 text-xs">
              <span>Contratos Ativos</span>
              <Layers className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-xl font-bold text-slate-100 mt-1 font-mono">
              {contratosAtivos.length} <span className="text-xs font-normal text-slate-400">/ {contratos.length}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Operações de longo prazo</div>
          </div>

          <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-3.5 shadow-sm">
            <div className="flex justify-between items-center text-slate-400 text-xs">
              <span>Valor Nominal (FV)</span>
              <DollarSign className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-xl font-bold text-slate-100 mt-1 font-mono">
              R$ {totalNominal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Valor de face contratado</div>
          </div>

          <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-3.5 shadow-sm">
            <div className="flex justify-between items-center text-slate-400 text-xs">
              <span>Valor Presente (PV)</span>
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xl font-bold text-blue-400 mt-1 font-mono">
              R$ {totalPV.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Mensuração inicial líquida</div>
          </div>

          <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-3.5 shadow-sm">
            <div className="flex justify-between items-center text-slate-400 text-xs">
              <span>Ajuste AVP Total</span>
              <TrendingDown className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-bold text-amber-400 mt-1 font-mono">
              R$ {totalAVP.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Juros implícitos a apropriar</div>
          </div>

          <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-3.5 shadow-sm">
            <div className="flex justify-between items-center text-slate-400 text-xs">
              <span>Saldo Remanescente</span>
              <Percent className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">
              R$ {totalSaldoRemanescente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Apropriado: R$ {totalApropriado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Simulador Interativo CPC 12 (Collapsible) */}
        {showSimulador && (
          <div className="bg-[#1a1a24] border border-indigo-500/30 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-bold text-indigo-200">
                  Simulador de Cálculo e Desconto a Valor Presente (Fórmula Exponencial CPC 12)
                </h2>
              </div>
              <span className="text-[11px] text-indigo-300 font-mono">
                PV = FV / (1 + i)^n
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Valor Nominal Futuro (FV)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs text-slate-400">R$</span>
                  <input
                    type="number"
                    value={simFV}
                    onChange={e => setSimFV(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#121217] border border-[#3b3b4f] rounded px-8 py-1.5 text-xs text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Prazo de Liquidação (Meses)
                </label>
                <input
                  type="number"
                  value={simMeses}
                  onChange={e => setSimMeses(parseInt(e.target.value) || 1)}
                  className="w-full bg-[#121217] border border-[#3b3b4f] rounded px-3 py-1.5 text-xs text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Taxa de Desconto Anual (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={simTaxaAnual}
                  onChange={e => setSimTaxaAnual(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#121217] border border-[#3b3b4f] rounded px-3 py-1.5 text-xs text-slate-100 font-mono"
                />
              </div>
            </div>

            {/* Resultado da Simulação */}
            {(() => {
              const res = calcularPresentValue(simFV, simTaxaAnual, simMeses);
              const parcelaMensal = res.avp / (simMeses || 1);
              return (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-[#12121a] p-3 rounded border border-indigo-500/20 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Taxa Mensal Equivalente:</span>
                    <span className="font-bold text-indigo-300 font-mono">{res.taxaMensal.toFixed(4)}% a.m.</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Valor Presente (PV):</span>
                    <span className="font-bold text-blue-400 font-mono">
                      R$ {res.pv.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Ajuste Total (AVP):</span>
                    <span className="font-bold text-amber-400 font-mono">
                      R$ {res.avp.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Apropriação Média Mensal:</span>
                    <span className="font-bold text-emerald-400 font-mono">
                      R$ {parcelaMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / mês
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Tabela e Filtros */}
        <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg overflow-hidden shadow-sm">
          {/* Barra de Filtros */}
          <div className="p-3 border-b border-[#2d2d2d] flex flex-col sm:flex-row justify-between items-center gap-3 bg-[#181818]">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar documento ou contraparte..."
                  value={filtroTexto}
                  onChange={e => setFiltroTexto(e.target.value)}
                  className="w-full bg-[#121212] border border-[#333] rounded pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={filtroTipo}
                onChange={e => setFiltroTipo(e.target.value)}
                className="bg-[#121212] border border-[#333] rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="TODOS">Todos os Tipos</option>
                <option value="CLIENTES_RECEBER">Clientes a Receber (Ativo)</option>
                <option value="FORNECEDORES_PAGAR">Fornecedores a Pagar (Passivo)</option>
              </select>

              <select
                value={filtroStatus}
                onChange={e => setFiltroStatus(e.target.value)}
                className="bg-[#121212] border border-[#333] rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="TODOS">Todos os Status</option>
                <option value="ATIVO">Ativos</option>
                <option value="APROPRIADO_TOTAL">100% Apropriados</option>
                <option value="CANCELADO">Cancelados</option>
              </select>
            </div>

            <div className="text-xs text-slate-400">
              Mostrando <span className="font-bold text-slate-200">{contratosFiltrados.length}</span> contrato(s)
            </div>
          </div>

          {/* Tabela de Contratos */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#161616] text-slate-400 border-b border-[#2d2d2d] text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-3">Documento / Contraparte</th>
                  <th className="py-2.5 px-3">Tipo</th>
                  <th className="py-2.5 px-3 text-center">Prazo</th>
                  <th className="py-2.5 px-3 text-right">Taxa Anual</th>
                  <th className="py-2.5 px-3 text-right">Nominal (FV)</th>
                  <th className="py-2.5 px-3 text-right">Presente (PV)</th>
                  <th className="py-2.5 px-3 text-right">Ajuste AVP</th>
                  <th className="py-2.5 px-3 text-right">Saldo Remanescente</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {contratosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-500">
                      Nenhum contrato de Ajuste a Valor Presente encontrado.
                    </td>
                  </tr>
                ) : (
                  contratosFiltrados.map(c => (
                    <tr key={c.id} className="hover:bg-[#222] transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-200">{c.numeroDocumento}</div>
                        <div className="text-[11px] text-slate-400">{c.contraparteNome}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{c.contraparteCpfCnpj}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.tipoOperacao === 'CLIENTES_RECEBER'
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                        }`}>
                          {c.tipoOperacao === 'CLIENTES_RECEBER' ? 'Clientes (Ativo)' : 'Fornecedores (Passivo)'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-300">
                        {c.prazoMeses} m
                        <div className="text-[10px] text-slate-500">{c.dataVencimentoFinal}</div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                        {c.taxaDescontoAnual.toFixed(2)}%
                        <div className="text-[10px] text-slate-500">({c.taxaDescontoMensal.toFixed(2)}% a.m.)</div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-200 font-semibold">
                        R$ {c.valorNominalFuturo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-blue-400 font-bold">
                        R$ {c.valorPresenteCalculado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-amber-400 font-bold">
                        R$ {c.valorAjustePresente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-bold">
                        R$ {c.saldoRemanescenteAVP.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          c.status === 'ATIVO'
                            ? 'bg-blue-950/50 text-blue-300 border-blue-500/30'
                            : c.status === 'APROPRIADO_TOTAL'
                            ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {c.status === 'ATIVO' && c.saldoRemanescenteAVP > 0 && (
                            <button
                              onClick={() => handleApropriarMensal(c.id, c.numeroDocumento)}
                              title="Apropriar Parcela Mensal no Diário Geral"
                              className="p-1 rounded hover:bg-indigo-950/60 text-indigo-400 border border-indigo-500/30 transition-colors"
                            >
                              <TrendingUp className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => abrirModalEditar(c)}
                            title="Editar Contrato"
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleExcluirContrato(c.id, c.numeroDocumento)}
                            title="Excluir Contrato"
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

      {/* Modal Novo / Editar Contrato */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-[#2d2d2d] flex justify-between items-center bg-[#202020]">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold text-slate-100">
                  {editando ? 'Editar Contrato de AVP' : 'Novo Contrato de Ajuste a Valor Presente (CPC 12)'}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarContrato} className="p-5 space-y-4 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Tipo de Operação *
                  </label>
                  <select
                    value={tipoOperacao}
                    onChange={e => setTipoOperacao(e.target.value as TipoOperacaoAVP)}
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="CLIENTES_RECEBER">Clientes a Receber (Ativo Circ./RLP)</option>
                    <option value="FORNECEDORES_PAGAR">Fornecedores a Pagar (Passivo Circ./ELP)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Número do Documento / Contrato *
                  </label>
                  <input
                    type="text"
                    required
                    value={numeroDocumento}
                    onChange={e => setNumeroDocumento(e.target.value)}
                    placeholder="Ex: CTR-VENDA-2026/044 ou NF 009.812"
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Nome da Contraparte (Cliente/Fornecedor) *
                  </label>
                  <input
                    type="text"
                    required
                    value={contraparteNome}
                    onChange={e => setContraparteNome(e.target.value)}
                    placeholder="Razão Social ou Nome Completo"
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    CNPJ / CPF da Contraparte *
                  </label>
                  <input
                    type="text"
                    required
                    value={contraparteCpfCnpj}
                    onChange={e => setContraparteCpfCnpj(e.target.value)}
                    placeholder="00.000.000/0000-00"
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Data da Operação *
                  </label>
                  <input
                    type="date"
                    required
                    value={dataOperacao}
                    onChange={e => setDataOperacao(e.target.value)}
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Prazo em Meses *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={240}
                    value={prazoMeses}
                    onChange={e => {
                      const m = parseInt(e.target.value) || 1;
                      setPrazoMeses(m);
                      const d = new Date(dataOperacao || new Date());
                      d.setMonth(d.getMonth() + m);
                      setDataVencimentoFinal(d.toISOString().slice(0, 10));
                    }}
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Vencimento Final
                  </label>
                  <input
                    type="date"
                    value={dataVencimentoFinal}
                    onChange={e => setDataVencimentoFinal(e.target.value)}
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Valor Nominal de Face (FV - Future Value) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs text-slate-400">R$</span>
                    <input
                      type="text"
                      required
                      value={valorNominalFuturo}
                      onChange={e => setValorNominalFuturo(e.target.value)}
                      placeholder="0,00"
                      className="w-full bg-[#121212] border border-[#333] rounded pl-9 pr-3 py-1.5 text-xs text-slate-100 font-mono font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Taxa de Desconto Anual (% a.a.) *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={taxaDescontoAnual}
                      onChange={e => setTaxaDescontoAnual(e.target.value)}
                      placeholder="Ex: 11,75"
                      className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                    />
                    <span className="absolute right-3 top-2 text-xs text-slate-400">% a.a.</span>
                  </div>
                </div>
              </div>

              {/* Prévia do Cálculo Dinâmico */}
              {(() => {
                const fv = parseValor(valorNominalFuturo);
                const tAnual = parseValor(taxaDescontoAnual);
                const { pv, avp, taxaMensal } = calcularPresentValue(fv, tAnual, prazoMeses);
                return (
                  <div className="p-3 rounded-lg bg-[#222] border border-indigo-500/20 text-xs space-y-1">
                    <div className="font-semibold text-indigo-300 mb-1 flex items-center gap-1.5">
                      <Calculator className="w-3.5 h-3.5" />
                      Apuração Automatizada do Desconto (CPC 12):
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Taxa Mensal:</span>
                        <span className="font-mono font-bold text-slate-200">{taxaMensal.toFixed(4)}% a.m.</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Valor Presente (PV):</span>
                        <span className="font-mono font-bold text-blue-400">
                          R$ {pv.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Ajuste AVP (FV - PV):</span>
                        <span className="font-mono font-bold text-amber-400">
                          R$ {avp.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Observações e Justificativa Econômica
                </label>
                <textarea
                  rows={2}
                  value={observacoes}
                  onChange={e => setObservacoes(e.target.value)}
                  placeholder="Justificativa da taxa adotada, histórico do contrato ou garantias..."
                  className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
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
                  className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30"
                >
                  {editando ? 'Atualizar Contrato' : 'Salvar Contrato de AVP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
