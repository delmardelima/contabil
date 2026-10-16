import React, { useState } from 'react';
import { dbService } from '../../db/sqliteService';
import {
  Empresa,
  RetencaoObraConstrucaoCivil,
  TipoResponsabilidadeObra,
  RegimePrevidenciarioObra,
  ApuracaoRetencoesConstrucao
} from '../../types/contabil';
import {
  HardHat,
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle2,
  Download,
  Printer,
  X,
  FileText,
  Building2,
  DollarSign,
  Percent,
  Layers,
  ShieldCheck,
  Check,
  ArrowRight,
  SendHorizontal
} from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

interface RetencoesConstrucaoCivilModuleProps {
  empresaAtiva: Empresa;
  onOpenReportPreview?: (config: {
    titulo: string;
    subtitulo: string;
    conteudo?: React.ReactNode;
    linhas?: any[];
  }) => void;
}

export const RetencoesConstrucaoCivilModule: React.FC<RetencoesConstrucaoCivilModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [competencia, setCompetencia] = useState<string>('2026-03');
  const [retencoes, setRetencoes] = useState<RetencaoObraConstrucaoCivil[]>(() =>
    dbService.getRetencoesConstrucao(empresaAtiva.id, '2026-03')
  );
  const [filtroTexto, setFiltroTexto] = useState<string>('');
  const [filtroResponsabilidade, setFiltroResponsabilidade] = useState<string>('TODOS');
  const [filtroRegime, setFiltroRegime] = useState<string>('TODOS');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editando, setEditando] = useState<RetencaoObraConstrucaoCivil | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string>('');

  // Form State
  const [cnoNumero, setCnoNumero] = useState<string>('');
  const [nomeObra, setNomeObra] = useState<string>('');
  const [tipoResponsabilidade, setTipoResponsabilidade] = useState<TipoResponsabilidadeObra>('EMPREITADA_TOTAL');
  const [regimePrevidenciario, setRegimePrevidenciario] = useState<RegimePrevidenciarioObra>('RETENCAO_11_CONVENCIONAL');
  const [numeroNotaFiscal, setNumeroNotaFiscal] = useState<string>('');
  const [dataEmissaoNota, setDataEmissaoNota] = useState<string>(new Date().toISOString().slice(0, 10));
  const [prestadorCnpj, setPrestadorCnpj] = useState<string>('');
  const [prestadorRazaoSocial, setPrestadorRazaoSocial] = useState<string>('');
  const [valorBrutoNota, setValorBrutoNota] = useState<string>('85000,00');
  const [percentualDeducaoMaterial, setPercentualDeducaoMaterial] = useState<number>(50);
  const [aliquotaIss, setAliquotaIss] = useState<string>('5,00');
  const [codigoDarfPrevidenciario, setCodigoDarfPrevidenciario] = useState<string>('1162 - DCTFWeb Obras');
  const [statusGuia, setStatusGuia] = useState<'PENDENTE' | 'PAGO' | 'COMPENSADO'>('PENDENTE');
  const [observacoes, setObservacoes] = useState<string>('');

  const handleRecarregar = () => {
    setRetencoes(dbService.getRetencoesConstrucao(empresaAtiva.id, competencia));
  };

  const parseValor = (valStr: string): number => {
    const cleaned = valStr.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  const calcularValores = (bruto: number, percDed: number, regime: RegimePrevidenciarioObra, aliqIssPerc: number) => {
    const valorDeducao = Math.round(bruto * (percDed / 100) * 100) / 100;
    const baseINSS = Math.max(0, Math.round((bruto - valorDeducao) * 100) / 100);
    const aliqINSS = regime === 'RETENCAO_3_5_CPRB_DESONERADA' ? 3.5 : 11.0;
    const valorINSS = Math.round(baseINSS * (aliqINSS / 100) * 100) / 100;
    const valorISS = Math.round(bruto * (aliqIssPerc / 100) * 100) / 100;
    const liquido = Math.max(0, Math.round((bruto - valorINSS - valorISS) * 100) / 100);

    return {
      valorDeducao,
      baseINSS,
      aliqINSS,
      valorINSS,
      valorISS,
      liquido
    };
  };

  const abrirModalNovo = () => {
    setEditando(null);
    setCnoNumero(`90.001.${Math.floor(100000 + Math.random() * 900000)}/71`);
    setNomeObra('Residencial Torres do Parque - Torre B');
    setTipoResponsabilidade('EMPREITADA_TOTAL');
    setRegimePrevidenciario('RETENCAO_11_CONVENCIONAL');
    setNumeroNotaFiscal(`NF-e ${Math.floor(10000 + Math.random() * 90000)}`);
    setDataEmissaoNota(new Date().toISOString().slice(0, 10));
    setPrestadorCnpj('28.192.831/0001-90');
    setPrestadorRazaoSocial('Estruturas & Fundações Brasil Ltda');
    setValorBrutoNota('85000,00');
    setPercentualDeducaoMaterial(50);
    setAliquotaIss('5,00');
    setCodigoDarfPrevidenciario('1162 - DCTFWeb Obras');
    setStatusGuia('PENDENTE');
    setObservacoes('');
    setShowModal(true);
  };

  const abrirModalEditar = (r: RetencaoObraConstrucaoCivil) => {
    setEditando(r);
    setCnoNumero(r.cnoNumero);
    setNomeObra(r.nomeObra);
    setTipoResponsabilidade(r.tipoResponsabilidade);
    setRegimePrevidenciario(r.regimePrevidenciario);
    setNumeroNotaFiscal(r.numeroNotaFiscal);
    setDataEmissaoNota(r.dataEmissaoNota);
    setPrestadorCnpj(r.prestadorCnpj);
    setPrestadorRazaoSocial(r.prestadorRazaoSocial);
    setValorBrutoNota(r.valorBrutoNota.toFixed(2).replace('.', ','));
    setPercentualDeducaoMaterial(r.percentualDeducaoMaterial);
    const issPerc = r.valorBrutoNota > 0 ? (r.valorRetencaoISS / r.valorBrutoNota) * 100 : 5;
    setAliquotaIss(issPerc.toFixed(2).replace('.', ','));
    setCodigoDarfPrevidenciario(r.codigoDarfPrevidenciario);
    setStatusGuia(r.statusGuia);
    setObservacoes(r.observacoes || '');
    setShowModal(true);
  };

  const handleSalvarRetencao = (e: React.FormEvent) => {
    e.preventDefault();
    const bruto = parseValor(valorBrutoNota);
    const issAliq = parseValor(aliquotaIss);
    const { valorDeducao, baseINSS, aliqINSS, valorINSS, valorISS, liquido } = calcularValores(
      bruto,
      percentualDeducaoMaterial,
      regimePrevidenciario,
      issAliq
    );

    const retencaoData: RetencaoObraConstrucaoCivil = {
      id: editando ? editando.id : `ret_cno_${Date.now()}`,
      empresaId: empresaAtiva.id,
      cnoNumero,
      nomeObra,
      tipoResponsabilidade,
      regimePrevidenciario,
      numeroNotaFiscal,
      dataEmissaoNota,
      prestadorCnpj,
      prestadorRazaoSocial,
      valorBrutoNota: bruto,
      percentualDeducaoMaterial,
      valorDeducaoMaterialEquipamento: valorDeducao,
      baseCalculoRetencaoINSS: baseINSS,
      aliquotaRetencao: aliqINSS,
      valorRetencaoINSS: valorINSS,
      valorRetencaoISS: valorISS,
      valorLiquidoPagar: liquido,
      codigoDarfPrevidenciario,
      statusGuia,
      integradoReinfR2010: editando ? editando.integradoReinfR2010 : true,
      integradoContabil: editando ? editando.integradoContabil : false,
      observacoes
    };

    dbService.salvarRetencaoConstrucao(retencaoData);
    handleRecarregar();
    setShowModal(false);
    setMensagemSucesso(`Retenção da obra ${cnoNumero} salva com sucesso!`);
    setTimeout(() => setMensagemSucesso(''), 5000);
  };

  const handleExcluirRetencao = (id: string, nf: string) => {
    if (confirm(`Excluir retenção da NF ${nf}?`)) {
      dbService.excluirRetencaoConstrucao(id);
      handleRecarregar();
      setMensagemSucesso(`Retenção excluída.`);
      setTimeout(() => setMensagemSucesso(''), 4000);
    }
  };

  const handleIntegrarContabil = () => {
    const res = dbService.integrarRetencoesConstrucaoContabil(empresaAtiva.id, competencia);
    if (res.sucesso) {
      handleRecarregar();
      setMensagemSucesso(res.mensagem);
      setTimeout(() => setMensagemSucesso(''), 7000);
    } else {
      alert(res.mensagem);
    }
  };

  // Consolidação
  const apuracao: ApuracaoRetencoesConstrucao = dbService.getApuracaoRetencoesConstrucao(empresaAtiva.id, competencia);

  // Filtros
  const retencoesFiltradas = retencoes.filter(r => {
    const matchTexto = r.cnoNumero.includes(filtroTexto) ||
      r.nomeObra.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      r.prestadorRazaoSocial.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      r.prestadorCnpj.includes(filtroTexto) ||
      r.numeroNotaFiscal.toLowerCase().includes(filtroTexto.toLowerCase());
    const matchResp = filtroResponsabilidade === 'TODOS' || r.tipoResponsabilidade === filtroResponsabilidade;
    const matchRegime = filtroRegime === 'TODOS' || r.regimePrevidenciario === filtroRegime;
    return matchTexto && matchResp && matchRegime;
  });

  const handleExportarCSV = () => {
    const rows = retencoesFiltradas.map(r => ({
      ID: r.id,
      CNO: r.cnoNumero,
      Obra: r.nomeObra,
      Responsabilidade: r.tipoResponsabilidade,
      Regime: r.regimePrevidenciario,
      NotaFiscal: r.numeroNotaFiscal,
      DataEmissao: r.dataEmissaoNota,
      PrestadorCNPJ: r.prestadorCnpj,
      PrestadorRazao: r.prestadorRazaoSocial,
      ValorBruto: r.valorBrutoNota,
      PercDeducaoMaterial: r.percentualDeducaoMaterial,
      ValorDeducaoMaterial: r.valorDeducaoMaterialEquipamento,
      BaseCalculoINSS: r.baseCalculoRetencaoINSS,
      AliquotaINSS: r.aliquotaRetencao,
      RetencaoINSS: r.valorRetencaoINSS,
      RetencaoISS: r.valorRetencaoISS,
      ValorLiquido: r.valorLiquidoPagar,
      GuiaStatus: r.statusGuia,
      ReinfR2010: r.integradoReinfR2010 ? 'SIM' : 'NÃO',
      IntegradoContabil: r.integradoContabil ? 'SIM' : 'NÃO'
    }));
    exportToCSV(rows, `retencoes_construcao_cno_${competencia}_${empresaAtiva.cnpj.replace(/\D/g, '')}`);
  };

  const handleImprimirRelatorio = () => {
    if (!onOpenReportPreview) return;

    onOpenReportPreview({
      titulo: 'DEMONSTRATIVO DE RETENÇÕES PREVIDENCIÁRIAS NA CONSTRUÇÃO CIVIL',
      subtitulo: `IN RFB nº 2.110/2022 Art. 112 | Lei 8.212/91 | EFD-Reinf Evento R-2010 - Competência ${competencia}`,
      conteudo: (
        <div className="p-8 space-y-6 text-slate-800 text-xs">
          <div className="border-b-2 border-slate-700 pb-3 flex justify-between items-end">
            <div>
              <h1 className="text-xl font-bold uppercase tracking-wider">{empresaAtiva.razaoSocial}</h1>
              <p className="text-slate-600">CNPJ: {empresaAtiva.cnpj} | CNO Tomador Principal: {retencoes[0]?.cnoNumero || '90.001.29410/71'}</p>
              <p className="text-slate-600 font-semibold mt-1">MAPA FISCAL DE RETENÇÕES PREVIDENCIÁRIAS E TRIBUTÁRIAS POR OBRA</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded border border-orange-300">
                EFD-REINF R-2010 / DCTFWEB
              </span>
              <p className="text-[10px] text-slate-500 mt-1">Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          {/* Cards Resumo */}
          <div className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-300">
            <div>
              <span className="text-slate-500 block text-[10px]">TOTAL BRUTO DAS OBRAS</span>
              <span className="font-bold text-sm text-slate-900">
                R$ {apuracao.totalBrutoObras.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">DEDUÇÃO MATERIAIS (ATÉ 50%)</span>
              <span className="font-bold text-sm text-blue-800">
                R$ {apuracao.totalDeducoesMateriais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">INSS RETIDO (11% / 3,5%)</span>
              <span className="font-bold text-sm text-orange-800">
                R$ {apuracao.totalInssRetido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">VALOR LÍQUIDO A PAGAR</span>
              <span className="font-bold text-sm text-emerald-800">
                R$ {apuracao.totalLiquidoObras.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Tabela de Obras */}
          <div>
            <h2 className="font-bold text-sm uppercase text-slate-800 mb-2 border-b border-slate-300 pb-1">
              Relação Analítica de Notas e Retenções por CNO
            </h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-200 text-slate-700 text-[10px] uppercase">
                  <th className="p-2 border border-slate-300">CNO / Obra</th>
                  <th className="p-2 border border-slate-300">Prestador / NF</th>
                  <th className="p-2 border border-slate-300 text-right">Valor Bruto</th>
                  <th className="p-2 border border-slate-300 text-right">Dedução Mat.</th>
                  <th className="p-2 border border-slate-300 text-right">Base INSS</th>
                  <th className="p-2 border border-slate-300 text-right">INSS Retido</th>
                  <th className="p-2 border border-slate-300 text-right">Líquido</th>
                  <th className="p-2 border border-slate-300 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {retencoesFiltradas.map((r, idx) => (
                  <tr key={r.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="p-2 border border-slate-300">
                      <div className="font-bold text-slate-900">{r.cnoNumero}</div>
                      <div className="text-[10px] text-slate-600">{r.nomeObra}</div>
                    </td>
                    <td className="p-2 border border-slate-300">
                      <div className="font-semibold text-slate-800">{r.prestadorRazaoSocial}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{r.numeroNotaFiscal} - {r.prestadorCnpj}</div>
                    </td>
                    <td className="p-2 border border-slate-300 text-right font-mono">
                      R$ {r.valorBrutoNota.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2 border border-slate-300 text-right font-mono text-blue-700">
                      R$ {r.valorDeducaoMaterialEquipamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2 border border-slate-300 text-right font-mono">
                      R$ {r.baseCalculoRetencaoINSS.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2 border border-slate-300 text-right font-mono font-bold text-orange-800">
                      R$ {r.valorRetencaoINSS.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({r.aliquotaRetencao}%)
                    </td>
                    <td className="p-2 border border-slate-300 text-right font-mono font-bold text-emerald-800">
                      R$ {r.valorLiquidoPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2 border border-slate-300 text-center">
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 border text-slate-700 font-bold">
                        {r.statusGuia}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Enquadramento Legal */}
          <div className="border border-slate-300 bg-slate-50 p-4 rounded text-[11px] leading-relaxed">
            <h3 className="font-bold text-slate-800 uppercase mb-1">Regramento Previdenciário (IN RFB nº 2.110/2022 Art. 112 / Lei nº 8.212/91):</h3>
            <p className="text-slate-700">
              A empresa contratante de serviços prestados mediante cessão de mão de obra ou empreitada, inclusive em obras de construção civil, deverá reter 11% (onze por cento) do valor bruto da nota fiscal, fatura ou recibo de prestação de serviços e recolher a importância retida em nome da empresa contratada no âmbito da DCTFWeb e EFD-Reinf (Evento R-2010). Caso os materiais ou equipamentos fornecidos pelo contratado estejam expressamente discriminados no contrato e na nota fiscal, o valor da base de cálculo da retenção não poderá ser inferior a 50% (cinquenta por cento) do valor bruto. Se a contratada for optante pela CPRB (Lei nº 12.546/2011), a alíquota da retenção é reduzida para 3,5%.
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
            <span className="p-1.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <HardHat className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-100">
              Retenções Previdenciárias na Construção Civil (IN RFB 2.110/22 / CNO)
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Apuração de Retenção Previdenciária (11% ou 3,5% CPRB), Deduções Legais de Materiais, CNO e EFD-Reinf R-2010
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Competência Selector */}
          <input
            type="month"
            value={competencia}
            onChange={e => {
              setCompetencia(e.target.value);
              setRetencoes(dbService.getRetencoesConstrucao(empresaAtiva.id, e.target.value));
            }}
            className="bg-[#242424] border border-[#383838] rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-orange-500 font-mono"
          />

          <button
            onClick={handleIntegrarContabil}
            className="px-3 py-1.5 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 border border-emerald-500/30 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
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
            onClick={handleImprimirRelatorio}
            className="px-3 py-1.5 rounded bg-[#242424] hover:bg-[#2e2e2e] text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-[#383838] transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            Dossiê CNO A4
          </button>
          <button
            onClick={abrirModalNovo}
            className="px-3 py-1.5 rounded bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-orange-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Nova Medição / NF
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
              <span>Total Bruto das Obras</span>
              <Building2 className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-xl font-bold text-slate-100 mt-1 font-mono">
              R$ {apuracao.totalBrutoObras.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">{retencoes.length} medições registradas</div>
          </div>

          <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-3.5 shadow-sm">
            <div className="flex justify-between items-center text-slate-400 text-xs">
              <span>Dedução Materiais (até 50%)</span>
              <Percent className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xl font-bold text-blue-400 mt-1 font-mono">
              R$ {apuracao.totalDeducoesMateriais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Art. 121 IN 2.110/22</div>
          </div>

          <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-3.5 shadow-sm">
            <div className="flex justify-between items-center text-slate-400 text-xs">
              <span>Base Efetiva INSS</span>
              <Layers className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-xl font-bold text-slate-200 mt-1 font-mono">
              R$ {apuracao.totalBaseCalculoRetencoes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Base cálculo para 11% / 3,5%</div>
          </div>

          <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-3.5 shadow-sm">
            <div className="flex justify-between items-center text-slate-400 text-xs">
              <span>INSS Retido (DCTFWeb)</span>
              <HardHat className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-xl font-bold text-orange-400 mt-1 font-mono">
              R$ {apuracao.totalInssRetido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Reinf Evento R-2010</div>
          </div>

          <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-3.5 shadow-sm">
            <div className="flex justify-between items-center text-slate-400 text-xs">
              <span>Líquido a Pagar</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">
              R$ {apuracao.totalLiquidoObras.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              ISS Retido: R$ {apuracao.totalIssRetido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
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
                  placeholder="Buscar CNO, obra, prestador, CNPJ..."
                  value={filtroTexto}
                  onChange={e => setFiltroTexto(e.target.value)}
                  className="w-full bg-[#121212] border border-[#333] rounded pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              <select
                value={filtroResponsabilidade}
                onChange={e => setFiltroResponsabilidade(e.target.value)}
                className="bg-[#121212] border border-[#333] rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
              >
                <option value="TODOS">Todas as Empreitadas</option>
                <option value="EMPREITADA_TOTAL">Empreitada Total</option>
                <option value="EMPREITADA_PARCIAL">Empreitada Parcial</option>
                <option value="SUBEMPREITADA">Subempreitada</option>
              </select>

              <select
                value={filtroRegime}
                onChange={e => setFiltroRegime(e.target.value)}
                className="bg-[#121212] border border-[#333] rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
              >
                <option value="TODOS">Todos os Regimes</option>
                <option value="RETENCAO_11_CONVENCIONAL">Retenção 11% (Convencional)</option>
                <option value="RETENCAO_3_5_CPRB_DESONERADA">Retenção 3,5% (CPRB Desonerada)</option>
              </select>
            </div>

            <div className="text-xs text-slate-400">
              Mostrando <span className="font-bold text-slate-200">{retencoesFiltradas.length}</span> medição(ões)
            </div>
          </div>

          {/* Tabela Analítica */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#161616] text-slate-400 border-b border-[#2d2d2d] text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-3">CNO / Obra</th>
                  <th className="py-2.5 px-3">Nota Fiscal / Prestador</th>
                  <th className="py-2.5 px-3 text-center">Responsabilidade</th>
                  <th className="py-2.5 px-3 text-right">Valor Bruto</th>
                  <th className="py-2.5 px-3 text-right">Dedução Mat. (50%)</th>
                  <th className="py-2.5 px-3 text-right">Base INSS</th>
                  <th className="py-2.5 px-3 text-right">INSS Retido</th>
                  <th className="py-2.5 px-3 text-right">Líquido Pagar</th>
                  <th className="py-2.5 px-3 text-center">EFD-Reinf / DCTF</th>
                  <th className="py-2.5 px-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {retencoesFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-500">
                      Nenhuma retenção de obra encontrada para a competência {competencia}.
                    </td>
                  </tr>
                ) : (
                  retencoesFiltradas.map(r => (
                    <tr key={r.id} className="hover:bg-[#222] transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-200 font-mono">{r.cnoNumero}</div>
                        <div className="text-[11px] text-slate-400">{r.nomeObra}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-200">{r.numeroNotaFiscal}</div>
                        <div className="text-[11px] text-slate-400">{r.prestadorRazaoSocial}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{r.prestadorCnpj}</div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#262626] text-slate-300 border border-[#383838]">
                          {r.tipoResponsabilidade}
                        </span>
                        <div className="text-[9px] text-orange-400 mt-0.5 font-semibold">
                          {r.regimePrevidenciario === 'RETENCAO_3_5_CPRB_DESONERADA' ? 'CPRB 3,5%' : 'INSS 11%'}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-200 font-semibold">
                        R$ {r.valorBrutoNota.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-blue-400 font-medium">
                        R$ {r.valorDeducaoMaterialEquipamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        <div className="text-[10px] text-slate-500">({r.percentualDeducaoMaterial}%)</div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-200">
                        R$ {r.baseCalculoRetencaoINSS.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-orange-400 font-bold">
                        R$ {r.valorRetencaoINSS.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        <div className="text-[10px] text-slate-500">({r.aliquotaRetencao}%)</div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-bold">
                        R$ {r.valorLiquidoPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        {r.valorRetencaoISS > 0 && (
                          <div className="text-[9px] text-slate-500 font-normal">
                            ISS: R$ {r.valorRetencaoISS.toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-500/30 font-mono">
                            R-2010
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${
                            r.statusGuia === 'PAGO'
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                              : 'bg-amber-950/60 text-amber-300 border-amber-500/30'
                          }`}>
                            {r.statusGuia}
                          </span>
                        </div>
                        <div className="text-[9px] text-slate-500 mt-0.5">
                          {r.integradoContabil ? 'Contabilizado' : 'Pendente Diário'}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => abrirModalEditar(r)}
                            title="Editar Medição"
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleExcluirRetencao(r.id, r.numeroNotaFiscal)}
                            title="Excluir Medição"
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

      {/* Modal Nova / Editar Medição */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-[#2d2d2d] flex justify-between items-center bg-[#202020]">
              <div className="flex items-center gap-2">
                <HardHat className="w-5 h-5 text-orange-400" />
                <h2 className="text-base font-bold text-slate-100">
                  {editando ? 'Editar Medição / Retenção de Obra' : 'Nova Medição com Retenção na Construção Civil'}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarRetencao} className="p-5 space-y-4 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Número do CNO (Cadastro Nacional de Obras) *
                  </label>
                  <input
                    type="text"
                    required
                    value={cnoNumero}
                    onChange={e => setCnoNumero(e.target.value)}
                    placeholder="90.001.00000/00"
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Nome / Identificação da Obra *
                  </label>
                  <input
                    type="text"
                    required
                    value={nomeObra}
                    onChange={e => setNomeObra(e.target.value)}
                    placeholder="Ex: Condomínio Residencial Horizonte"
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Tipo de Responsabilidade na Obra *
                  </label>
                  <select
                    value={tipoResponsabilidade}
                    onChange={e => setTipoResponsabilidade(e.target.value as TipoResponsabilidadeObra)}
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
                  >
                    <option value="EMPREITADA_TOTAL">Empreitada Total (Construtora Titular CNO)</option>
                    <option value="EMPREITADA_PARCIAL">Empreitada Parcial</option>
                    <option value="SUBEMPREITADA">Subempreitada</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Regime Previdenciário do Prestador *
                  </label>
                  <select
                    value={regimePrevidenciario}
                    onChange={e => setRegimePrevidenciario(e.target.value as RegimePrevidenciarioObra)}
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
                  >
                    <option value="RETENCAO_11_CONVENCIONAL">Retenção Convencional 11% (Art. 112)</option>
                    <option value="RETENCAO_3_5_CPRB_DESONERADA">Retenção 3,5% (Optante CPRB / Lei 12.546)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Número Nota Fiscal *
                  </label>
                  <input
                    type="text"
                    required
                    value={numeroNotaFiscal}
                    onChange={e => setNumeroNotaFiscal(e.target.value)}
                    placeholder="NF-e 000.000"
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Data Emissão *
                  </label>
                  <input
                    type="date"
                    required
                    value={dataEmissaoNota}
                    onChange={e => setDataEmissaoNota(e.target.value)}
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Status DCTFWeb
                  </label>
                  <select
                    value={statusGuia}
                    onChange={e => setStatusGuia(e.target.value as any)}
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
                  >
                    <option value="PENDENTE">Pendente</option>
                    <option value="PAGO">Pago</option>
                    <option value="COMPENSADO">Compensado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    CNPJ do Prestador *
                  </label>
                  <input
                    type="text"
                    required
                    value={prestadorCnpj}
                    onChange={e => setPrestadorCnpj(e.target.value)}
                    placeholder="00.000.000/0000-00"
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Razão Social do Prestador *
                  </label>
                  <input
                    type="text"
                    required
                    value={prestadorRazaoSocial}
                    onChange={e => setPrestadorRazaoSocial(e.target.value)}
                    placeholder="Nome Empresarial da Contratada"
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Valor Bruto da NF (R$) *
                  </label>
                  <input
                    type="text"
                    required
                    value={valorBrutoNota}
                    onChange={e => setValorBrutoNota(e.target.value)}
                    placeholder="0,00"
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 font-mono font-bold focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Dedução de Material (% até 50%) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    required
                    value={percentualDeducaoMaterial}
                    onChange={e => setPercentualDeducaoMaterial(Math.min(50, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Alíquota ISS Retido (%)
                  </label>
                  <input
                    type="text"
                    value={aliquotaIss}
                    onChange={e => setAliquotaIss(e.target.value)}
                    placeholder="5,00"
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Simulação Dinâmica da Retenção */}
              {(() => {
                const b = parseValor(valorBrutoNota);
                const issA = parseValor(aliquotaIss);
                const vals = calcularValores(b, percentualDeducaoMaterial, regimePrevidenciario, issA);
                return (
                  <div className="p-3 rounded-lg bg-[#241c18] border border-orange-500/30 text-xs space-y-1.5">
                    <div className="font-semibold text-orange-300 flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5" />
                      Cálculo de Retenção Previdenciária & Impostos Municipais:
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Dedução Materiais:</span>
                        <span className="font-mono font-bold text-blue-400">
                          R$ {vals.valorDeducao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Base INSS:</span>
                        <span className="font-mono font-bold text-slate-200">
                          R$ {vals.baseINSS.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">INSS ({vals.aliqINSS}%):</span>
                        <span className="font-mono font-bold text-orange-400">
                          R$ {vals.valorINSS.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Líquido a Pagar:</span>
                        <span className="font-mono font-bold text-emerald-400">
                          R$ {vals.liquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Observações e Cláusulas Contratuais
                </label>
                <textarea
                  rows={2}
                  value={observacoes}
                  onChange={e => setObservacoes(e.target.value)}
                  placeholder="Cláusula de fornecimento de materiais ou equipamentos, medição nº..."
                  className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
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
                  className="px-4 py-2 rounded bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-all shadow-md shadow-orange-600/30"
                >
                  {editando ? 'Atualizar Medição' : 'Salvar Medição / Retenção'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
