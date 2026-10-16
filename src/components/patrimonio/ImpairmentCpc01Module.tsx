import React, { useState } from 'react';
import { dbService } from '../../db/sqliteService';
import {
  Empresa,
  TesteRecuperabilidadeCpc01,
  TipoAtivoImpairment,
  StatusTesteImpairment,
  ResumoImpairmentCpc01
} from '../../types/contabil';
import {
  Scale,
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle2,
  Download,
  Printer,
  X,
  FileText,
  TrendingDown,
  TrendingUp,
  Percent,
  Layers,
  ShieldAlert,
  Calculator,
  RefreshCw,
  Building,
  DollarSign
} from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

interface ImpairmentCpc01ModuleProps {
  empresaAtiva: Empresa;
  onOpenReportPreview?: (config: {
    titulo: string;
    subtitulo: string;
    conteudo?: React.ReactNode;
    linhas?: any[];
  }) => void;
}

export const ImpairmentCpc01Module: React.FC<ImpairmentCpc01ModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [exercicio, setExercicio] = useState<number>(empresaAtiva.exercicioAtivo || 2026);
  const [testes, setTestes] = useState<TesteRecuperabilidadeCpc01[]>(() =>
    dbService.getTestesImpairment(empresaAtiva.id, empresaAtiva.exercicioAtivo || 2026)
  );
  const [filtroTexto, setFiltroTexto] = useState<string>('');
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editando, setEditando] = useState<TesteRecuperabilidadeCpc01 | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string>('');
  const [showSimuladorFcd, setShowSimuladorFcd] = useState<boolean>(false);

  // Form State
  const [dataTeste, setDataTeste] = useState<string>(new Date().toISOString().slice(0, 10));
  const [tipoAtivo, setTipoAtivo] = useState<TipoAtivoImpairment>('IMOBILIZADO');
  const [identificacaoAtivoOuUgc, setIdentificacaoAtivoOuUgc] = useState<string>('');
  const [valorContabilBruto, setValorContabilBruto] = useState<string>('500000,00');
  const [depreciacaoAmortizacaoAcumulada, setDepreciacaoAmortizacaoAcumulada] = useState<string>('120000,00');
  const [valorJustoLiquidoVenda, setValorJustoLiquidoVenda] = useState<string>('350000,00');
  const [valorEmUsoFcd, setValorEmUsoFcd] = useState<string>('370000,00');
  const [taxaDescontoWacc, setTaxaDescontoWacc] = useState<string>('13,50');
  const [projecaoAnos, setProjecaoAnos] = useState<number>(5);
  const [perdaReconhecidaAnteriormente, setPerdaReconhecidaAnteriormente] = useState<string>('0,00');
  const [status, setStatus] = useState<StatusTesteImpairment>('ATIVO');
  const [laudoPericialNumero, setLaudoPericialNumero] = useState<string>('');
  const [peritoResponsavel, setPeritoResponsavel] = useState<string>('');
  const [observacoes, setObservacoes] = useState<string>('');

  // Simulador FCD State
  const [fluxoAnual, setFluxoAnual] = useState<number>(100000);
  const [simWacc, setSimWacc] = useState<number>(13.5);
  const [simAnos, setSimAnos] = useState<number>(5);
  const [simCrescimentoPerp, setSimCrescimentoPerp] = useState<number>(2.5);

  const handleRecarregar = () => {
    setTestes(dbService.getTestesImpairment(empresaAtiva.id, exercicio));
  };

  const parseValor = (valStr: string): number => {
    const cleaned = valStr.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  // Cálculo de Valor em Uso via Fluxo de Caixa Descontado (FCD)
  const calcularFcd = (fluxo: number, waccPerc: number, anos: number, perpPerc: number): number => {
    const k = waccPerc / 100;
    const g = perpPerc / 100;
    let somaPv = 0;
    for (let t = 1; t <= anos; t++) {
      somaPv += fluxo / Math.pow(1 + k, t);
    }
    // Valor Residual / Perpetuidade = (Fluxo_(n) * (1 + g)) / (k - g)
    if (k > g) {
      const fluxoN = fluxo * Math.pow(1 + g, anos);
      const vpPerpetuidade = (fluxoN * (1 + g)) / (k - g);
      somaPv += vpPerpetuidade / Math.pow(1 + k, anos);
    }
    return Math.round(somaPv * 100) / 100;
  };

  const abrirModalNovo = () => {
    setEditando(null);
    setDataTeste(new Date().toISOString().slice(0, 10));
    setTipoAtivo('IMOBILIZADO');
    setIdentificacaoAtivoOuUgc('');
    setValorContabilBruto('500000,00');
    setDepreciacaoAmortizacaoAcumulada('120000,00');
    setValorJustoLiquidoVenda('350000,00');
    setValorEmUsoFcd('370000,00');
    setTaxaDescontoWacc('13,50');
    setProjecaoAnos(5);
    setPerdaReconhecidaAnteriormente('0,00');
    setStatus('ATIVO');
    setLaudoPericialNumero(`LAUDO-IMP-${exercicio}/${Math.floor(100 + Math.random() * 900)}`);
    setPeritoResponsavel('Eng. / Contador Perito Registrado CNPC');
    setObservacoes('');
    setShowModal(true);
  };

  const abrirModalEditar = (t: TesteRecuperabilidadeCpc01) => {
    setEditando(t);
    setDataTeste(t.dataTeste);
    setTipoAtivo(t.tipoAtivo);
    setIdentificacaoAtivoOuUgc(t.identificacaoAtivoOuUgc);
    setValorContabilBruto(t.valorContabilBruto.toFixed(2).replace('.', ','));
    setDepreciacaoAmortizacaoAcumulada(t.depreciacaoAmortizacaoAcumulada.toFixed(2).replace('.', ','));
    setValorJustoLiquidoVenda(t.valorJustoLiquidoVenda.toFixed(2).replace('.', ','));
    setValorEmUsoFcd(t.valorEmUsoFcd.toFixed(2).replace('.', ','));
    setTaxaDescontoWacc(t.taxaDescontoWacc.toFixed(2).replace('.', ','));
    setProjecaoAnos(t.projecaoAnos);
    setPerdaReconhecidaAnteriormente(t.perdaReconhecidaAnteriormente.toFixed(2).replace('.', ','));
    setStatus(t.status);
    setLaudoPericialNumero(t.laudoPericialNumero || '');
    setPeritoResponsavel(t.peritoResponsavel || '');
    setObservacoes(t.observacoes || '');
    setShowModal(true);
  };

  const handleSalvarTeste = (e: React.FormEvent) => {
    e.preventDefault();
    const bruto = parseValor(valorContabilBruto);
    const dep = parseValor(depreciacaoAmortizacaoAcumulada);
    const vcl = Math.max(0, bruto - dep);
    const vJusto = parseValor(valorJustoLiquidoVenda);
    const vUso = parseValor(valorEmUsoFcd);
    const vRecuperavel = Math.max(vJusto, vUso);
    const perdaApurada = vcl > vRecuperavel ? Math.round((vcl - vRecuperavel) * 100) / 100 : 0;
    const perdaAnt = parseValor(perdaReconhecidaAnteriormente);
    const wacc = parseValor(taxaDescontoWacc);

    const novoStatus: StatusTesteImpairment = perdaApurada > 0 ? 'AJUSTADO_PERDA' : 'ATIVO';

    const testeData: TesteRecuperabilidadeCpc01 = {
      id: editando ? editando.id : `imp_${Date.now()}`,
      empresaId: empresaAtiva.id,
      dataTeste,
      exercicio,
      tipoAtivo,
      identificacaoAtivoOuUgc,
      valorContabilBruto: bruto,
      depreciacaoAmortizacaoAcumulada: dep,
      valorContabilLiquido: vcl,
      valorJustoLiquidoVenda: vJusto,
      valorEmUsoFcd: vUso,
      taxaDescontoWacc: wacc,
      projecaoAnos,
      valorRecuperavelApurado: vRecuperavel,
      perdaImpairmentApurada: perdaApurada,
      perdaReconhecidaAnteriormente: perdaAnt,
      ajusteProvisaoExercicio: perdaApurada,
      status: novoStatus,
      laudoPericialNumero,
      peritoResponsavel,
      integradoContabil: editando ? editando.integradoContabil : false,
      observacoes
    };

    dbService.salvarTesteImpairment(testeData);
    handleRecarregar();
    setShowModal(false);
    setMensagemSucesso(`Teste de recuperabilidade para "${identificacaoAtivoOuUgc}" registrado com sucesso!`);
    setTimeout(() => setMensagemSucesso(''), 5000);
  };

  const handleExcluirTeste = (id: string, nome: string) => {
    if (confirm(`Excluir o teste de recuperabilidade de "${nome}"?`)) {
      dbService.excluirTesteImpairment(id);
      handleRecarregar();
      setMensagemSucesso(`Teste excluído.`);
      setTimeout(() => setMensagemSucesso(''), 4000);
    }
  };

  const handleIntegrarContabil = (testeId: string) => {
    const res = dbService.integrarImpairmentContabil(testeId);
    if (res.sucesso) {
      handleRecarregar();
      setMensagemSucesso(res.mensagem);
      setTimeout(() => setMensagemSucesso(''), 6000);
    } else {
      alert(res.mensagem);
    }
  };

  // Consolidação
  const resumo: ResumoImpairmentCpc01 = dbService.getResumoImpairment(empresaAtiva.id, exercicio);

  // Filtros
  const testesFiltrados = testes.filter(t => {
    const matchTexto = t.identificacaoAtivoOuUgc.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      (t.laudoPericialNumero && t.laudoPericialNumero.toLowerCase().includes(filtroTexto.toLowerCase())) ||
      (t.peritoResponsavel && t.peritoResponsavel.toLowerCase().includes(filtroTexto.toLowerCase()));
    const matchTipo = filtroTipo === 'TODOS' || t.tipoAtivo === filtroTipo;
    const matchStatus = filtroStatus === 'TODOS' || t.status === filtroStatus;
    return matchTexto && matchTipo && matchStatus;
  });

  const handleExportarCSV = () => {
    const rows = testesFiltrados.map(t => ({
      ID: t.id,
      DataTeste: t.dataTeste,
      Exercicio: t.exercicio,
      Tipo: t.tipoAtivo,
      IdentificacaoAtivoUGC: t.identificacaoAtivoOuUgc,
      ValorContabilBruto: t.valorContabilBruto,
      DepreciacaoAcumulada: t.depreciacaoAmortizacaoAcumulada,
      ValorContabilLiquido: t.valorContabilLiquido,
      ValorJustoVenda: t.valorJustoLiquidoVenda,
      ValorEmUsoFCD: t.valorEmUsoFcd,
      TaxaWACC: t.taxaDescontoWacc,
      ValorRecuperavel: t.valorRecuperavelApurado,
      PerdaImpairment: t.perdaImpairmentApurada,
      Status: t.status,
      Laudo: t.laudoPericialNumero || 'N/A',
      Perito: t.peritoResponsavel || 'N/A',
      IntegradoContabil: t.integradoContabil ? 'SIM' : 'NÃO'
    }));
    exportToCSV(rows, `teste_recuperabilidade_cpc01_${exercicio}_${empresaAtiva.cnpj.replace(/\D/g, '')}`);
  };

  const handleImprimirLaudo = () => {
    if (!onOpenReportPreview) return;

    onOpenReportPreview({
      titulo: 'LAUDO DE AVALIAÇÃO DE RECUPERABILIDADE DE ATIVOS (IMPAIRMENT TEST)',
      subtitulo: `CPC 01 (R1) / NBC TG 01 (R4) / IAS 36 - Exercício Social ${exercicio}`,
      conteudo: (
        <div className="p-8 space-y-6 text-slate-800 text-xs">
          <div className="border-b-2 border-slate-700 pb-3 flex justify-between items-end">
            <div>
              <h1 className="text-xl font-bold uppercase tracking-wider">{empresaAtiva.razaoSocial}</h1>
              <p className="text-slate-600">CNPJ: {empresaAtiva.cnpj} | Exercício Social: {exercicio}</p>
              <p className="text-slate-600 font-semibold mt-1">PARECER TÉCNICO DE REDUÇÃO AO VALOR RECUPERÁVEL DE ATIVOS</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded border border-red-300">
                CPC 01 (R1) / NBC TG 01
              </span>
              <p className="text-[10px] text-slate-500 mt-1">Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          {/* Cards Resumo */}
          <div className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-300">
            <div>
              <span className="text-slate-500 block text-[10px]">ATIVOS / UGCS TESTADOS</span>
              <span className="font-bold text-sm text-slate-900">{resumo.totalAtivosTestados} un</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">VALOR CONTÁBIL LÍQUIDO (VCL)</span>
              <span className="font-bold text-sm text-blue-800">
                R$ {resumo.totalValorContabilLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">VALOR RECUPERÁVEL TOTAL</span>
              <span className="font-bold text-sm text-emerald-800">
                R$ {resumo.totalValorRecuperavel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">PERDAS POR IMPAIRMENT</span>
              <span className="font-bold text-sm text-rose-800">
                R$ {resumo.totalPerdasReconhecidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Tabela de Testes */}
          <div>
            <h2 className="font-bold text-sm uppercase text-slate-800 mb-2 border-b border-slate-300 pb-1">
              Relação Analítica de Testes de Recuperabilidade Realizados
            </h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-200 text-slate-700 text-[10px] uppercase">
                  <th className="p-2 border border-slate-300">Ativo / UGC Avaliada</th>
                  <th className="p-2 border border-slate-300">Categoria</th>
                  <th className="p-2 border border-slate-300 text-right">VCL (R$)</th>
                  <th className="p-2 border border-slate-300 text-right">V. Justo (R$)</th>
                  <th className="p-2 border border-slate-300 text-right">V. em Uso (R$)</th>
                  <th className="p-2 border border-slate-300 text-right">Recuperável (R$)</th>
                  <th className="p-2 border border-slate-300 text-right">Perda Impairment</th>
                  <th className="p-2 border border-slate-300 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {testesFiltrados.map((t, idx) => (
                  <tr key={t.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="p-2 border border-slate-300">
                      <div className="font-bold">{t.identificacaoAtivoOuUgc}</div>
                      <div className="text-[10px] text-slate-600">Laudo: {t.laudoPericialNumero || 'S/N'}</div>
                    </td>
                    <td className="p-2 border border-slate-300">
                      <span className="text-[9px] px-1 py-0.5 rounded font-bold bg-slate-200 text-slate-800">
                        {t.tipoAtivo}
                      </span>
                    </td>
                    <td className="p-2 border border-slate-300 text-right font-mono">
                      R$ {t.valorContabilLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2 border border-slate-300 text-right font-mono text-slate-600">
                      R$ {t.valorJustoLiquidoVenda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2 border border-slate-300 text-right font-mono text-blue-700 font-semibold">
                      R$ {t.valorEmUsoFcd.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2 border border-slate-300 text-right font-mono font-bold text-emerald-800">
                      R$ {t.valorRecuperavelApurado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2 border border-slate-300 text-right font-mono font-bold text-rose-800">
                      {t.perdaImpairmentApurada > 0
                        ? `R$ ${t.perdaImpairmentApurada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                        : '-'}
                    </td>
                    <td className="p-2 border border-slate-300 text-center">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                        t.status === 'AJUSTADO_PERDA'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Fundamentação Normativa */}
          <div className="border border-slate-300 bg-slate-50 p-4 rounded text-[11px] leading-relaxed">
            <h3 className="font-bold text-slate-800 uppercase mb-1">Fundamentação Contábil e Regras de Escrituração (CPC 01 R1 / NBC TG 01):</h3>
            <p className="text-slate-700">
              O Pronunciamento Técnico CPC 01 (R1) determina que a entidade deve avaliar ao fim de cada período de reporte se há alguma indicação de que um ativo possa ter sofrido desvalorização. Se houver indicação, ou anualmente no caso de ágio por rentabilidade futura (Goodwill) e ativos intangíveis com vida útil indefinida, a entidade deve estimar o valor recuperável do ativo, definido como o maior valor entre o seu valor justo líquido de despesas de alienação e o seu valor em uso (estimado via fluxo de caixa descontado à taxa WACC). Se o valor contábil líquido exceder o valor recuperável, uma perda por desvalorização deve ser imediatamente reconhecida no resultado do período.
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
            <span className="p-1.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
              <Scale className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-100">
              Teste de Recuperabilidade de Ativos - Impairment (CPC 01 R1 / NBC TG 01)
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Mensuração do Valor Recuperável (Valor Justo vs Valor em Uso FCD / WACC), Provisão para Desvalorização e Laudo
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Exercício Selector */}
          <select
            value={exercicio}
            onChange={e => {
              const a = parseInt(e.target.value) || 2026;
              setExercicio(a);
              setTestes(dbService.getTestesImpairment(empresaAtiva.id, a));
            }}
            className="bg-[#242424] border border-[#383838] rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-red-500 font-mono"
          >
            <option value={2026}>Exercício 2026</option>
            <option value={2025}>Exercício 2025</option>
            <option value={2024}>Exercício 2024</option>
          </select>

          <button
            onClick={() => setShowSimuladorFcd(!showSimuladorFcd)}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
              showSimuladorFcd
                ? 'bg-red-600/30 text-red-300 border-red-500/40'
                : 'bg-[#242424] text-slate-300 border-[#383838] hover:bg-[#2e2e2e]'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-red-400" />
            Calculadora FCD / WACC
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
            Laudo Pericial A4
          </button>
          <button
            onClick={abrirModalNovo}
            className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-red-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Novo Teste CPC 01
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
              <span>Ativos / UGCs Avaliadas</span>
              <Layers className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-xl font-bold text-slate-100 mt-1 font-mono">
              {resumo.totalAtivosTestados} un
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Imobilizado, Intangível e Goodwill</div>
          </div>

          <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-3.5 shadow-sm">
            <div className="flex justify-between items-center text-slate-400 text-xs">
              <span>Valor Contábil Líquido</span>
              <DollarSign className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xl font-bold text-blue-400 mt-1 font-mono">
              R$ {resumo.totalValorContabilLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Custo Histórico Líquido</div>
          </div>

          <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-3.5 shadow-sm">
            <div className="flex justify-between items-center text-slate-400 text-xs">
              <span>Valor Recuperável Total</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">
              R$ {resumo.totalValorRecuperavel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Max(Valor Justo, Valor em Uso)</div>
          </div>

          <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-3.5 shadow-sm">
            <div className="flex justify-between items-center text-slate-400 text-xs">
              <span>Perdas por Desvalorização</span>
              <TrendingDown className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-xl font-bold text-rose-400 mt-1 font-mono">
              R$ {resumo.totalPerdasReconhecidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Provisão CPC 01 na DRE</div>
          </div>

          <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-3.5 shadow-sm">
            <div className="flex justify-between items-center text-slate-400 text-xs">
              <span>Reversões Possíveis</span>
              <RefreshCw className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-xl font-bold text-indigo-400 mt-1 font-mono">
              {resumo.totalReversoesPermitidas} ativo(s)
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Veda reversão em Goodwill</div>
          </div>
        </div>

        {/* Simulador FCD / WACC (Collapsible) */}
        {showSimuladorFcd && (
          <div className="bg-[#1f191a] border border-red-500/30 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-red-500/20 pb-2">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-red-400" />
                <h2 className="text-sm font-bold text-red-200">
                  Simulador de Fluxo de Caixa Descontado (FCD) para Valor em Uso (CPC 01)
                </h2>
              </div>
              <span className="text-[11px] text-red-300 font-mono">
                VP = ∑ [FC_t / (1 + WACC)^t] + Perpetuidade
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Fluxo de Caixa Operacional Anual
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs text-slate-400">R$</span>
                  <input
                    type="number"
                    value={fluxoAnual}
                    onChange={e => setFluxoAnual(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#121217] border border-[#4a2e30] rounded px-8 py-1.5 text-xs text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Taxa de Desconto WACC (% a.a.)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={simWacc}
                  onChange={e => setSimWacc(parseFloat(e.target.value) || 1)}
                  className="w-full bg-[#121217] border border-[#4a2e30] rounded px-3 py-1.5 text-xs text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Horizonte de Projeção (Anos)
                </label>
                <input
                  type="number"
                  value={simAnos}
                  onChange={e => setSimAnos(parseInt(e.target.value) || 1)}
                  className="w-full bg-[#121217] border border-[#4a2e30] rounded px-3 py-1.5 text-xs text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Crescimento Perpétuo g (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={simCrescimentoPerp}
                  onChange={e => setSimCrescimentoPerp(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#121217] border border-[#4a2e30] rounded px-3 py-1.5 text-xs text-slate-100 font-mono"
                />
              </div>
            </div>

            {/* Resultado do FCD */}
            {(() => {
              const fcdTotal = calcularFcd(fluxoAnual, simWacc, simAnos, simCrescimentoPerp);
              return (
                <div className="bg-[#140e10] p-3 rounded border border-red-500/20 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">Valor em Uso Projetado (FCD Total): </span>
                    <span className="font-bold text-red-300 font-mono text-sm ml-1">
                      R$ {fcdTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Calculado com {simAnos} anos de fluxo explícito + Perpetuidade de Gordon ({simCrescimentoPerp}%)
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Tabela de Testes e Filtros */}
        <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg overflow-hidden shadow-sm">
          {/* Barra de Filtros */}
          <div className="p-3 border-b border-[#2d2d2d] flex flex-col sm:flex-row justify-between items-center gap-3 bg-[#181818]">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar ativo, laudo ou perito..."
                  value={filtroTexto}
                  onChange={e => setFiltroTexto(e.target.value)}
                  className="w-full bg-[#121212] border border-[#333] rounded pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <select
                value={filtroTipo}
                onChange={e => setFiltroTipo(e.target.value)}
                className="bg-[#121212] border border-[#333] rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-red-500"
              >
                <option value="TODOS">Todos os Ativos</option>
                <option value="IMOBILIZADO">Ativo Imobilizado</option>
                <option value="INTANGIVEL">Ativo Intangível</option>
                <option value="GOODWILL">Goodwill (Ágio)</option>
                <option value="UGC_UNIDADE_GERADORA">UGC (Unidade Geradora de Caixa)</option>
              </select>

              <select
                value={filtroStatus}
                onChange={e => setFiltroStatus(e.target.value)}
                className="bg-[#121212] border border-[#333] rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-red-500"
              >
                <option value="TODOS">Todos os Status</option>
                <option value="ATIVO">Sem Perda (Conforme)</option>
                <option value="AJUSTADO_PERDA">Com Perda por Desvalorização</option>
                <option value="REVERTIDO">Revertido</option>
              </select>
            </div>

            <div className="text-xs text-slate-400">
              Mostrando <span className="font-bold text-slate-200">{testesFiltrados.length}</span> teste(s)
            </div>
          </div>

          {/* Tabela Analítica */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#161616] text-slate-400 border-b border-[#2d2d2d] text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-3">Ativo / UGC Avaliada</th>
                  <th className="py-2.5 px-3">Tipo</th>
                  <th className="py-2.5 px-3 text-right">VCL (Contábil)</th>
                  <th className="py-2.5 px-3 text-right">Valor Justo</th>
                  <th className="py-2.5 px-3 text-right">Valor em Uso (FCD)</th>
                  <th className="py-2.5 px-3 text-right">Valor Recuperável</th>
                  <th className="py-2.5 px-3 text-right">Perda Impairment</th>
                  <th className="py-2.5 px-3 text-center">Status / Laudo</th>
                  <th className="py-2.5 px-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {testesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500">
                      Nenhum teste de recuperabilidade de ativos registrado no exercício {exercicio}.
                    </td>
                  </tr>
                ) : (
                  testesFiltrados.map(t => (
                    <tr key={t.id} className="hover:bg-[#222] transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-200">{t.identificacaoAtivoOuUgc}</div>
                        <div className="text-[10px] text-slate-400">Perito: {t.peritoResponsavel || 'Não informado'}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{t.dataTeste}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#262626] text-slate-300 border border-[#383838]">
                          {t.tipoAtivo}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-200 font-semibold">
                        R$ {t.valorContabilLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        <div className="text-[10px] text-slate-500">Bruto: R$ {t.valorContabilBruto.toLocaleString('pt-BR')}</div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                        R$ {t.valorJustoLiquidoVenda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-blue-400 font-semibold">
                        R$ {t.valorEmUsoFcd.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        <div className="text-[10px] text-slate-500">WACC: {t.taxaDescontoWacc}%</div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-bold">
                        R$ {t.valorRecuperavelApurado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">
                        {t.perdaImpairmentApurada > 0 ? (
                          <span className="text-rose-400">
                            R$ {t.perdaImpairmentApurada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-slate-500 font-normal">Sem perda</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          t.status === 'AJUSTADO_PERDA'
                            ? 'bg-rose-950/60 text-rose-300 border-rose-500/30'
                            : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                        }`}>
                          {t.status}
                        </span>
                        <div className="text-[9px] text-slate-500 mt-0.5">
                          {t.integradoContabil ? 'Contabilizado' : 'Pendente Diário'}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {t.perdaImpairmentApurada > 0 && !t.integradoContabil && (
                            <button
                              onClick={() => handleIntegrarContabil(t.id)}
                              title="Contabilizar Perda no Diário Geral"
                              className="p-1 rounded hover:bg-rose-950/60 text-rose-400 border border-rose-500/30 transition-colors"
                            >
                              <TrendingDown className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => abrirModalEditar(t)}
                            title="Editar Teste"
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleExcluirTeste(t.id, t.identificacaoAtivoOuUgc)}
                            title="Excluir Teste"
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

      {/* Modal Novo / Editar Teste */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-[#2d2d2d] flex justify-between items-center bg-[#202020]">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-red-400" />
                <h2 className="text-base font-bold text-slate-100">
                  {editando ? 'Editar Teste de Recuperabilidade' : 'Novo Teste de Recuperabilidade de Ativo (CPC 01 R1)'}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarTeste} className="p-5 space-y-4 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Data do Teste *
                  </label>
                  <input
                    type="date"
                    required
                    value={dataTeste}
                    onChange={e => setDataTeste(e.target.value)}
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Categoria do Ativo *
                  </label>
                  <select
                    value={tipoAtivo}
                    onChange={e => setTipoAtivo(e.target.value as TipoAtivoImpairment)}
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-red-500"
                  >
                    <option value="IMOBILIZADO">Ativo Imobilizado (CPC 27)</option>
                    <option value="INTANGIVEL">Ativo Intangível (CPC 04)</option>
                    <option value="GOODWILL">Goodwill / Ágio (CPC 15)</option>
                    <option value="UGC_UNIDADE_GERADORA">UGC - Unidade Geradora de Caixa</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Taxa WACC (% a.a.) *
                  </label>
                  <input
                    type="text"
                    required
                    value={taxaDescontoWacc}
                    onChange={e => setTaxaDescontoWacc(e.target.value)}
                    placeholder="13,50"
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Identificação do Ativo ou UGC *
                </label>
                <input
                  type="text"
                  required
                  value={identificacaoAtivoOuUgc}
                  onChange={e => setIdentificacaoAtivoOuUgc(e.target.value)}
                  placeholder="Ex: Prensa Hidráulica 500T ou Planta Fabril Unidade Sul"
                  className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Valor Contábil Bruto (R$) *
                  </label>
                  <input
                    type="text"
                    required
                    value={valorContabilBruto}
                    onChange={e => setValorContabilBruto(e.target.value)}
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Depreciação / Amortização Acumulada (R$) *
                  </label>
                  <input
                    type="text"
                    required
                    value={depreciacaoAmortizacaoAcumulada}
                    onChange={e => setDepreciacaoAmortizacaoAcumulada(e.target.value)}
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Valor Justo Líquido de Despesas de Venda (R$) *
                  </label>
                  <input
                    type="text"
                    required
                    value={valorJustoLiquidoVenda}
                    onChange={e => setValorJustoLiquidoVenda(e.target.value)}
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Valor em Uso (Fluxo de Caixa Descontado) (R$) *
                  </label>
                  <input
                    type="text"
                    required
                    value={valorEmUsoFcd}
                    onChange={e => setValorEmUsoFcd(e.target.value)}
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Prévia do Teste de Impairment */}
              {(() => {
                const b = parseValor(valorContabilBruto);
                const d = parseValor(depreciacaoAmortizacaoAcumulada);
                const vcl = Math.max(0, b - d);
                const vj = parseValor(valorJustoLiquidoVenda);
                const vu = parseValor(valorEmUsoFcd);
                const vRec = Math.max(vj, vu);
                const perda = vcl > vRec ? vcl - vRec : 0;
                return (
                  <div className="p-3 rounded-lg bg-[#241517] border border-red-500/30 text-xs space-y-1">
                    <div className="font-semibold text-red-300 flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5" />
                      Resultado do Teste de Recuperabilidade (CPC 01 R1):
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <div>
                        <span className="text-[10px] text-slate-400 block">VCL Contábil:</span>
                        <span className="font-mono font-bold text-slate-200">
                          R$ {vcl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Valor Recuperável:</span>
                        <span className="font-mono font-bold text-emerald-400">
                          R$ {vRec.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Perda por Impairment:</span>
                        <span className={`font-mono font-bold ${perda > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                          {perda > 0 ? `R$ ${perda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Sem Perda'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Número do Laudo Pericial de Avaliação
                  </label>
                  <input
                    type="text"
                    value={laudoPericialNumero}
                    onChange={e => setLaudoPericialNumero(e.target.value)}
                    placeholder="Ex: LAUDO-AVAL-2026/044"
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Perito Responsável / Órgão de Classe
                  </label>
                  <input
                    type="text"
                    value={peritoResponsavel}
                    onChange={e => setPeritoResponsavel(e.target.value)}
                    placeholder="Nome do Perito / IBAPE / CREA / CRC"
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Observações e Justificativa Econômica
                </label>
                <textarea
                  rows={2}
                  value={observacoes}
                  onChange={e => setObservacoes(e.target.value)}
                  placeholder="Causas de obsolescência, perda de mercado, pressupostos do WACC..."
                  className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-red-500"
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
                  className="px-4 py-2 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md shadow-red-600/30"
                >
                  {editando ? 'Atualizar Teste' : 'Salvar Teste CPC 01'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
