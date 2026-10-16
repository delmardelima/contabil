import React, { useState } from 'react';
import { dbService } from '../../db/sqliteService';
import {
  Empresa,
  RemessaExteriorTributada,
  NaturezaRemessaExterior,
  ApuracaoRemessasExterior
} from '../../types/contabil';
import {
  Coins,
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
  Percent,
  Layers,
  ShieldCheck,
  Send,
  ArrowRight,
  TrendingUp,
  Globe2
} from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

interface CideRemessasExteriorModuleProps {
  empresaAtiva: Empresa;
  onOpenReportPreview?: (config: {
    titulo: string;
    subtitulo: string;
    conteudo?: React.ReactNode;
    linhas?: any[];
  }) => void;
}

export const CideRemessasExteriorModule: React.FC<CideRemessasExteriorModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [competencia, setCompetencia] = useState<string>('2026-03');
  const [remessas, setRemessas] = useState<RemessaExteriorTributada[]>(() =>
    dbService.getRemessasExterior(empresaAtiva.id, '2026-03')
  );
  const [filtroTexto, setFiltroTexto] = useState<string>('');
  const [filtroNatureza, setFiltroNatureza] = useState<string>('TODOS');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editando, setEditando] = useState<RemessaExteriorTributada | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string>('');

  // Form State
  const [dataRemessa, setDataRemessa] = useState<string>(new Date().toISOString().slice(0, 10));
  const [natureza, setNatureza] = useState<NaturezaRemessaExterior>('ROYALTIES_MARCAS_PATENTES');
  const [beneficiarioNome, setBeneficiarioNome] = useState<string>('');
  const [paisDestino, setPaisDestino] = useState<string>('Estados Unidos');
  const [temTratadoDuplaTributacao, setTemTratadoDuplaTributacao] = useState<boolean>(false);
  const [moedaEstrangeira, setMoedaEstrangeira] = useState<'USD' | 'EUR' | 'GBP'>('USD');
  const [taxaCambioPtax, setTaxaCambioPtax] = useState<string>('5,65');
  const [valorMoedaEstrangeira, setValorMoedaEstrangeira] = useState<string>('10000,00');
  const [aliquotaCide, setAliquotaCide] = useState<string>('10,00');
  const [aliquotaIrrf, setAliquotaIrrf] = useState<string>('15,00');
  const [aliquotaPisImportacao, setAliquotaPisImportacao] = useState<string>('1,65');
  const [aliquotaCofinsImportacao, setAliquotaCofinsImportacao] = useState<string>('7,60');
  const [aliquotaIssqnImportacao, setAliquotaIssqnImportacao] = useState<string>('5,00');
  const [statusDarf, setStatusDarf] = useState<'PENDENTE' | 'PAGO' | 'COMPENSADO'>('PENDENTE');
  const [observacoes, setObservacoes] = useState<string>('');

  const handleRecarregar = () => {
    setRemessas(dbService.getRemessasExterior(empresaAtiva.id, competencia));
  };

  const parseValor = (valStr: string): number => {
    const cleaned = valStr.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  const calcularTributos = (
    valMoeda: number,
    ptax: number,
    aCide: number,
    aIrrf: number,
    aPis: number,
    aCofins: number,
    aIss: number
  ) => {
    const valBRL = Math.round(valMoeda * ptax * 100) / 100;
    const vCide = Math.round(valBRL * (aCide / 100) * 100) / 100;
    const vIrrf = Math.round(valBRL * (aIrrf / 100) * 100) / 100;
    const vPis = Math.round(valBRL * (aPis / 100) * 100) / 100;
    const vCofins = Math.round(valBRL * (aCofins / 100) * 100) / 100;
    const vIof = Math.round(valBRL * 0.0038 * 100) / 100; // IOF Câmbio 0,38%
    const vIss = Math.round(valBRL * (aIss / 100) * 100) / 100;
    const totalTrib = Math.round((vCide + vIrrf + vPis + vCofins + vIof + vIss) * 100) / 100;
    const custoEfetivo = Math.round((valBRL + totalTrib) * 100) / 100;

    return {
      valBRL,
      vCide,
      vIrrf,
      vPis,
      vCofins,
      vIof,
      vIss,
      totalTrib,
      custoEfetivo
    };
  };

  const handleNaturezaChange = (nat: NaturezaRemessaExterior) => {
    setNatureza(nat);
    if (nat === 'ROYALTIES_MARCAS_PATENTES' || nat === 'SERVICOS_TECNICOS_ASSISTENCIA') {
      setAliquotaCide('10,00');
    } else {
      setAliquotaCide('0,00'); // SaaS e outros sem transferência tecnológica
    }
  };

  const abrirModalNovo = () => {
    setEditando(null);
    setDataRemessa(new Date().toISOString().slice(0, 10));
    setNatureza('ROYALTIES_MARCAS_PATENTES');
    setBeneficiarioNome('Global Software Corp.');
    setPaisDestino('Estados Unidos');
    setTemTratadoDuplaTributacao(false);
    setMoedaEstrangeira('USD');
    setTaxaCambioPtax('5,65');
    setValorMoedaEstrangeira('10000,00');
    setAliquotaCide('10,00');
    setAliquotaIrrf('15,00');
    setAliquotaPisImportacao('1,65');
    setAliquotaCofinsImportacao('7,60');
    setAliquotaIssqnImportacao('5,00');
    setStatusDarf('PENDENTE');
    setObservacoes('');
    setShowModal(true);
  };

  const abrirModalEditar = (r: RemessaExteriorTributada) => {
    setEditando(r);
    setDataRemessa(r.dataRemessa);
    setNatureza(r.natureza);
    setBeneficiarioNome(r.beneficiarioNome);
    setPaisDestino(r.paisDestino);
    setTemTratadoDuplaTributacao(r.temTratadoDuplaTributacao);
    setMoedaEstrangeira(r.moedaEstrangeira);
    setTaxaCambioPtax(r.taxaCambioPtax.toFixed(4).replace('.', ','));
    setValorMoedaEstrangeira(r.valorMoedaEstrangeira.toFixed(2).replace('.', ','));
    setAliquotaCide(r.aliquotaCide.toFixed(2).replace('.', ','));
    setAliquotaIrrf(r.aliquotaIrrf.toFixed(2).replace('.', ','));
    setAliquotaPisImportacao(r.aliquotaPisImportacao.toFixed(2).replace('.', ','));
    setAliquotaCofinsImportacao(r.aliquotaCofinsImportacao.toFixed(2).replace('.', ','));
    setAliquotaIssqnImportacao(r.aliquotaIssqnImportacao.toFixed(2).replace('.', ','));
    setStatusDarf(r.statusDarf);
    setObservacoes(r.observacoes || '');
    setShowModal(true);
  };

  const handleSalvarRemessa = (e: React.FormEvent) => {
    e.preventDefault();
    const vM = parseValor(valorMoedaEstrangeira);
    const ptax = parseValor(taxaCambioPtax);
    const aCide = parseValor(aliquotaCide);
    const aIrrf = parseValor(aliquotaIrrf);
    const aPis = parseValor(aliquotaPisImportacao);
    const aCof = parseValor(aliquotaCofinsImportacao);
    const aIss = parseValor(aliquotaIssqnImportacao);

    const { valBRL, vCide, vIrrf, vPis, vCofins, vIof, vIss, totalTrib, custoEfetivo } = calcularTributos(
      vM,
      ptax,
      aCide,
      aIrrf,
      aPis,
      aCof,
      aIss
    );

    const remessaData: RemessaExteriorTributada = {
      id: editando ? editando.id : `rem_${Date.now()}`,
      empresaId: empresaAtiva.id,
      dataRemessa,
      competencia,
      natureza,
      beneficiarioNome,
      paisDestino,
      temTratadoDuplaTributacao,
      moedaEstrangeira,
      taxaCambioPtax: ptax,
      valorMoedaEstrangeira: vM,
      valorConvertidoBRL: valBRL,
      aliquotaCide: aCide,
      valorCide: vCide,
      aliquotaIrrf: aIrrf,
      valorIrrfFonte: vIrrf,
      aliquotaPisImportacao: aPis,
      valorPisImportacao: vPis,
      aliquotaCofinsImportacao: aCof,
      valorCofinsImportacao: vCofins,
      aliquotaIofCambio: 0.38,
      valorIofCambio: vIof,
      aliquotaIssqnImportacao: aIss,
      valorIssqnImportacao: vIss,
      custoTotalTributarioRemessa: totalTrib,
      custoEfetivoTotalOperacao: custoEfetivo,
      statusDarf,
      codigoDarfCide: '8741',
      codigoDarfIrrf: '0422',
      integradoContabil: editando ? editando.integradoContabil : false,
      observacoes
    };

    dbService.salvarRemessaExterior(remessaData);
    handleRecarregar();
    setShowModal(false);
    setMensagemSucesso(`Remessa internacional para "${beneficiarioNome}" salva com sucesso!`);
    setTimeout(() => setMensagemSucesso(''), 5000);
  };

  const handleExcluirRemessa = (id: string, benef: string) => {
    if (confirm(`Excluir remessa para "${benef}"?`)) {
      dbService.excluirRemessaExterior(id);
      handleRecarregar();
      setMensagemSucesso(`Remessa excluída.`);
      setTimeout(() => setMensagemSucesso(''), 4000);
    }
  };

  const handleIntegrarContabil = (id: string) => {
    const res = dbService.integrarRemessasExteriorContabil(id);
    if (res.sucesso) {
      handleRecarregar();
      setMensagemSucesso(res.mensagem);
      setTimeout(() => setMensagemSucesso(''), 7000);
    } else {
      alert(res.mensagem);
    }
  };

  // Consolidação
  const apuracao: ApuracaoRemessasExterior = dbService.getApuracaoRemessasExterior(empresaAtiva.id, competencia);

  // Filtros
  const remessasFiltradas = remessas.filter(r => {
    const matchTexto = r.beneficiarioNome.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      r.paisDestino.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      (r.observacoes && r.observacoes.toLowerCase().includes(filtroTexto.toLowerCase()));
    const matchNatureza = filtroNatureza === 'TODOS' || r.natureza === filtroNatureza;
    return matchTexto && matchNatureza;
  });

  const handleExportarCSV = () => {
    const rows = remessasFiltradas.map(r => ({
      ID: r.id,
      Data: r.dataRemessa,
      Competencia: r.competencia,
      Beneficiario: r.beneficiarioNome,
      Pais: r.paisDestino,
      Tratado: r.temTratadoDuplaTributacao ? 'SIM' : 'NÃO',
      Natureza: r.natureza,
      Moeda: r.moedaEstrangeira,
      TaxaPTAX: r.taxaCambioPtax,
      ValorMoeda: r.valorMoedaEstrangeira,
      ValorBRL: r.valorConvertidoBRL,
      CIDE: r.valorCide,
      IRRF: r.valorIrrfFonte,
      PIS_Importacao: r.valorPisImportacao,
      COFINS_Importacao: r.valorCofinsImportacao,
      IOF: r.valorIofCambio,
      ISSQN: r.valorIssqnImportacao,
      CustoTributarioTotal: r.custoTotalTributarioRemessa,
      StatusDARF: r.statusDarf,
      IntegradoContabil: r.integradoContabil ? 'SIM' : 'NÃO'
    }));
    exportToCSV(rows, `cide_remessas_exterior_${competencia}_${empresaAtiva.cnpj.replace(/\D/g, '')}`);
  };

  const handleImprimirRelatorio = () => {
    if (!onOpenReportPreview) return;

    onOpenReportPreview({
      titulo: 'MAPA TRIBUTÁRIO DE REMESSAS AO EXTERIOR & CIDE',
      subtitulo: `Lei nº 10.168/2000 | IN RFB nº 1.455/2014 | Tratados Internacionais (TDT) - Competência ${competencia}`,
      conteudo: (
        <div className="p-8 space-y-6 text-slate-800 text-xs">
          <div className="border-b-2 border-slate-700 pb-3 flex justify-between items-end">
            <div>
              <h1 className="text-xl font-bold uppercase tracking-wider">{empresaAtiva.razaoSocial}</h1>
              <p className="text-slate-600">CNPJ: {empresaAtiva.cnpj} | Operações de Importação de Serviços e Câmbio</p>
              <p className="text-slate-600 font-semibold mt-1">DEMONSTRATIVO FISCAL DE CIDE, IRRF, PIS/COFINS E ISSQN IMPORTAÇÃO</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded border border-indigo-300">
                LEI 10.168 / IN 1.455
              </span>
              <p className="text-[10px] text-slate-500 mt-1">Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          {/* Cards Resumo */}
          <div className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-300">
            <div>
              <span className="text-slate-500 block text-[10px]">TOTAL REMESSAS (BRL)</span>
              <span className="font-bold text-sm text-slate-900">
                R$ {apuracao.totalRemessasBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">CIDE-ROYALTIES (10%)</span>
              <span className="font-bold text-sm text-indigo-800">
                R$ {apuracao.totalCide.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">IRRF NA FONTE (15%/25%)</span>
              <span className="font-bold text-sm text-amber-800">
                R$ {apuracao.totalIrrf.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">PIS/COFINS IMPORTAÇÃO (9,25%)</span>
              <span className="font-bold text-sm text-rose-800">
                R$ {apuracao.totalPisCofinsImportacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Tabela de Remessas */}
          <div>
            <h2 className="font-bold text-sm uppercase text-slate-800 mb-2 border-b border-slate-300 pb-1">
              Relação Analítica de Remessas ao Exterior no Período
            </h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-200 text-slate-700 text-[10px] uppercase">
                  <th className="p-2 border border-slate-300">Data / Beneficiário</th>
                  <th className="p-2 border border-slate-300">Natureza / País</th>
                  <th className="p-2 border border-slate-300 text-right">Moeda / PTAX</th>
                  <th className="p-2 border border-slate-300 text-right">Valor BRL</th>
                  <th className="p-2 border border-slate-300 text-right">CIDE (R$)</th>
                  <th className="p-2 border border-slate-300 text-right">IRRF (R$)</th>
                  <th className="p-2 border border-slate-300 text-right">Total Tributos</th>
                  <th className="p-2 border border-slate-300 text-center">Status DARF</th>
                </tr>
              </thead>
              <tbody>
                {remessasFiltradas.map((r, idx) => (
                  <tr key={r.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="p-2 border border-slate-300">
                      <div className="font-bold">{r.beneficiarioNome}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{r.dataRemessa}</div>
                    </td>
                    <td className="p-2 border border-slate-300">
                      <div className="font-semibold text-slate-800">{r.natureza}</div>
                      <div className="text-[10px] text-slate-600">{r.paisDestino} {r.temTratadoDuplaTributacao ? '(Com Tratado)' : ''}</div>
                    </td>
                    <td className="p-2 border border-slate-300 text-right font-mono">
                      {r.moedaEstrangeira} {r.valorMoedaEstrangeira.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      <div className="text-[9px] text-slate-500">PTAX: R$ {r.taxaCambioPtax.toFixed(4)}</div>
                    </td>
                    <td className="p-2 border border-slate-300 text-right font-mono font-bold">
                      R$ {r.valorConvertidoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2 border border-slate-300 text-right font-mono text-indigo-700 font-bold">
                      {r.valorCide > 0 ? `R$ ${r.valorCide.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td className="p-2 border border-slate-300 text-right font-mono text-amber-700 font-bold">
                      R$ {r.valorIrrfFonte.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2 border border-slate-300 text-right font-mono text-rose-800 font-bold">
                      R$ {r.custoTotalTributarioRemessa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2 border border-slate-300 text-center">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                        r.statusDarf === 'PAGO' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {r.statusDarf}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Enquadramento Legal */}
          <div className="border border-slate-300 bg-slate-50 p-4 rounded text-[11px] leading-relaxed">
            <h3 className="font-bold text-slate-800 uppercase mb-1">Regras de Tributação e Acordos Internacionais (Lei nº 10.168/2000):</h3>
            <p className="text-slate-700">
              A Contribuição de Intervenção no Domínio Econômico (CIDE-Royalties) incide à alíquota de 10% sobre as importâncias pagas, creditadas, entregues, empregadas ou remetidas a residentes ou domiciliados no exterior, a título de royalties, serviços técnicos e de assistência administrativa (Lei nº 10.168/2000, Art. 2º). Não há incidência de CIDE na contratação de licença de software de prateleira ou SaaS na nuvem desprovido de transferência tecnológica. O IRRF incide à alíquota de 15% (ou 25% para paraísos fiscais), admitida a redução pelas convenções destinadas a evitar a dupla tributação internacional (Tratados DTT).
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
              <Coins className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-100">
              CIDE-Remessas & Serviços do Exterior (Lei 10.168/00 / IN 1.455/14)
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Apuração de Tributos em Remessas Internacionais (CIDE 10%, IRRF Fonte, PIS/COFINS-Importação, IOF Câmbio e Tratados)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Competência Selector */}
          <input
            type="month"
            value={competencia}
            onChange={e => {
              setCompetencia(e.target.value);
              setRemessas(dbService.getRemessasExterior(empresaAtiva.id, e.target.value));
            }}
            className="bg-[#242424] border border-[#383838] rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          />

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
            Dossiê Câmbio A4
          </button>
          <button
            onClick={abrirModalNovo}
            className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Nova Remessa Internacional
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
              <span>Remessas em Reais (BRL)</span>
              <DollarSign className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-xl font-bold text-slate-100 mt-1 font-mono">
              R$ {apuracao.totalRemessasBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">{remessas.length} contratos liquidados</div>
          </div>

          <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-3.5 shadow-sm">
            <div className="flex justify-between items-center text-slate-400 text-xs">
              <span>CIDE Royalties (10%)</span>
              <Coins className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-xl font-bold text-indigo-400 mt-1 font-mono">
              R$ {apuracao.totalCide.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">DARF Código 8741</div>
          </div>

          <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-3.5 shadow-sm">
            <div className="flex justify-between items-center text-slate-400 text-xs">
              <span>IRRF na Fonte (15%/25%)</span>
              <Percent className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-bold text-amber-400 mt-1 font-mono">
              R$ {apuracao.totalIrrf.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">DARF Código 0422</div>
          </div>

          <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-3.5 shadow-sm">
            <div className="flex justify-between items-center text-slate-400 text-xs">
              <span>PIS/COFINS-Importação</span>
              <Layers className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-xl font-bold text-rose-400 mt-1 font-mono">
              R$ {apuracao.totalPisCofinsImportacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Alíquota conjunta 9,25%</div>
          </div>

          <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-3.5 shadow-sm">
            <div className="flex justify-between items-center text-slate-400 text-xs">
              <span>Carga Tributária Efetiva</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">
              {apuracao.totalRemessasBRL > 0
                ? `${((apuracao.totalCustoTributarioGeral / apuracao.totalRemessasBRL) * 100).toFixed(1)}%`
                : '0.0%'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Tributos: R$ {apuracao.totalCustoTributarioGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Tabela de Remessas */}
        <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg overflow-hidden shadow-sm">
          {/* Barra de Filtros */}
          <div className="p-3 border-b border-[#2d2d2d] flex flex-col sm:flex-row justify-between items-center gap-3 bg-[#181818]">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar beneficiário, país ou serviço..."
                  value={filtroTexto}
                  onChange={e => setFiltroTexto(e.target.value)}
                  className="w-full bg-[#121212] border border-[#333] rounded pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={filtroNatureza}
                onChange={e => setFiltroNatureza(e.target.value)}
                className="bg-[#121212] border border-[#333] rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="TODOS">Todas as Naturezas</option>
                <option value="ROYALTIES_MARCAS_PATENTES">Royalties / Marcas / Patentes (CIDE 10%)</option>
                <option value="SERVICOS_TECNICOS_ASSISTENCIA">Serviços Técnicos e Assistência</option>
                <option value="LICENCA_SOFTWARE_SAAS">Licença de Software SaaS (Sem CIDE)</option>
                <option value="SERVICOS_ADMINISTRATIVOS_COST_SHARING">Compartilhamento de Custos</option>
                <option value="JUROS_DIVIDENDOS">Juros / Dividendos</option>
              </select>
            </div>

            <div className="text-xs text-slate-400">
              Mostrando <span className="font-bold text-slate-200">{remessasFiltradas.length}</span> remessa(s)
            </div>
          </div>

          {/* Tabela Analítica */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#161616] text-slate-400 border-b border-[#2d2d2d] text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-3">Data / Beneficiário</th>
                  <th className="py-2.5 px-3">Natureza / País</th>
                  <th className="py-2.5 px-3 text-right">Moeda Estrangeira</th>
                  <th className="py-2.5 px-3 text-right">Valor BRL</th>
                  <th className="py-2.5 px-3 text-right">CIDE (10%)</th>
                  <th className="py-2.5 px-3 text-right">IRRF Fonte</th>
                  <th className="py-2.5 px-3 text-right">PIS/COFINS Imp.</th>
                  <th className="py-2.5 px-3 text-right">Custo Total</th>
                  <th className="py-2.5 px-3 text-center">DARF / Status</th>
                  <th className="py-2.5 px-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {remessasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-500">
                      Nenhuma remessa internacional registrada na competência {competencia}.
                    </td>
                  </tr>
                ) : (
                  remessasFiltradas.map(r => (
                    <tr key={r.id} className="hover:bg-[#222] transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-200">{r.beneficiarioNome}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{r.dataRemessa}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#262626] text-slate-300 border border-[#383838]">
                          {r.natureza}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {r.paisDestino}
                          {r.temTratadoDuplaTributacao && (
                            <span className="ml-1 text-[9px] text-blue-400 font-semibold">(Tratado TDT)</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-200">
                        {r.moedaEstrangeira} {r.valorMoedaEstrangeira.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        <div className="text-[10px] text-slate-500">PTAX: R$ {r.taxaCambioPtax.toFixed(4)}</div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-100 font-bold">
                        R$ {r.valorConvertidoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-indigo-400 font-semibold">
                        {r.valorCide > 0 ? (
                          `R$ ${r.valorCide.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                        ) : (
                          <span className="text-slate-500 text-[10px]">Isento</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-amber-400 font-semibold">
                        R$ {r.valorIrrfFonte.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        <div className="text-[10px] text-slate-500">({r.aliquotaIrrf}%)</div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-rose-400">
                        R$ {(r.valorPisImportacao + r.valorCofinsImportacao).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                        R$ {r.custoEfetivoTotalOperacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        <div className="text-[9px] text-slate-500 font-normal">
                          Trib: R$ {r.custoTotalTributarioRemessa.toFixed(2)}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          r.statusDarf === 'PAGO'
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                            : 'bg-amber-950/60 text-amber-300 border-amber-500/30'
                        }`}>
                          {r.statusDarf}
                        </span>
                        <div className="text-[9px] text-slate-500 mt-0.5">
                          {r.integradoContabil ? 'Contabilizado' : 'Pendente Diário'}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {!r.integradoContabil && (
                            <button
                              onClick={() => handleIntegrarContabil(r.id)}
                              title="Provisionar Despesas e Tributos no Diário Geral"
                              className="p-1 rounded hover:bg-indigo-950/60 text-indigo-400 border border-indigo-500/30 transition-colors"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => abrirModalEditar(r)}
                            title="Editar Remessa"
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleExcluirRemessa(r.id, r.beneficiarioNome)}
                            title="Excluir Remessa"
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

      {/* Modal Nova / Editar Remessa */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-[#2d2d2d] flex justify-between items-center bg-[#202020]">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold text-slate-100">
                  {editando ? 'Editar Remessa ao Exterior' : 'Nova Remessa Internacional com CIDE / IRRF'}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarRemessa} className="p-5 space-y-4 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Data da Remessa *
                  </label>
                  <input
                    type="date"
                    required
                    value={dataRemessa}
                    onChange={e => setDataRemessa(e.target.value)}
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Natureza da Operação *
                  </label>
                  <select
                    value={natureza}
                    onChange={e => handleNaturezaChange(e.target.value as NaturezaRemessaExterior)}
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ROYALTIES_MARCAS_PATENTES">Royalties / Marcas / Patentes (CIDE 10%)</option>
                    <option value="SERVICOS_TECNICOS_ASSISTENCIA">Serviços Técnicos e Assistência (CIDE 10%)</option>
                    <option value="LICENCA_SOFTWARE_SAAS">Licença de Software SaaS (Sem CIDE)</option>
                    <option value="SERVICOS_ADMINISTRATIVOS_COST_SHARING">Compartilhamento Custos</option>
                    <option value="JUROS_DIVIDENDOS">Juros / Dividendos</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Moeda Estrangeira *
                  </label>
                  <select
                    value={moedaEstrangeira}
                    onChange={e => setMoedaEstrangeira(e.target.value as any)}
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                  >
                    <option value="USD">USD - Dólar Americano</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - Libra Esterlina</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Nome do Beneficiário no Exterior *
                  </label>
                  <input
                    type="text"
                    required
                    value={beneficiarioNome}
                    onChange={e => setBeneficiarioNome(e.target.value)}
                    placeholder="Empresa fornecedora estrangeira"
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    País de Destino *
                  </label>
                  <input
                    type="text"
                    required
                    value={paisDestino}
                    onChange={e => setPaisDestino(e.target.value)}
                    placeholder="Ex: Estados Unidos, Alemanha, Reino Unido"
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="chkTratado"
                  checked={temTratadoDuplaTributacao}
                  onChange={e => setTemTratadoDuplaTributacao(e.target.checked)}
                  className="rounded border-[#444] text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="chkTratado" className="text-xs text-slate-300 cursor-pointer">
                  País possui Tratado Internacional para Evitar a Dupla Tributação (TDT com o Brasil)
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Valor na Moeda Estrangeira ({moedaEstrangeira}) *
                  </label>
                  <input
                    type="text"
                    required
                    value={valorMoedaEstrangeira}
                    onChange={e => setValorMoedaEstrangeira(e.target.value)}
                    placeholder="0,00"
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 font-mono font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Taxa de Câmbio PTAX de Fechamento (R$) *
                  </label>
                  <input
                    type="text"
                    required
                    value={taxaCambioPtax}
                    onChange={e => setTaxaCambioPtax(e.target.value)}
                    placeholder="5,6500"
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Alíquota CIDE (%)
                  </label>
                  <input
                    type="text"
                    value={aliquotaCide}
                    onChange={e => setAliquotaCide(e.target.value)}
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Alíquota IRRF (%)
                  </label>
                  <input
                    type="text"
                    value={aliquotaIrrf}
                    onChange={e => setAliquotaIrrf(e.target.value)}
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    PIS + COFINS (%)
                  </label>
                  <div className="px-3 py-1.5 bg-[#181818] border border-[#333] rounded text-xs font-mono text-slate-300">
                    9,25% (1,65+7,60)
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    ISSQN Importação (%)
                  </label>
                  <input
                    type="text"
                    value={aliquotaIssqnImportacao}
                    onChange={e => setAliquotaIssqnImportacao(e.target.value)}
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Simulação Dinâmica de Impostos */}
              {(() => {
                const vm = parseValor(valorMoedaEstrangeira);
                const ptax = parseValor(taxaCambioPtax);
                const aC = parseValor(aliquotaCide);
                const aI = parseValor(aliquotaIrrf);
                const aP = parseValor(aliquotaPisImportacao);
                const aCof = parseValor(aliquotaCofinsImportacao);
                const aIss = parseValor(aliquotaIssqnImportacao);

                const res = calcularTributos(vm, ptax, aC, aI, aP, aCof, aIss);

                return (
                  <div className="p-3 rounded-lg bg-[#181824] border border-indigo-500/30 text-xs space-y-1.5">
                    <div className="font-semibold text-indigo-300 flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5" />
                      Cálculo Consolidado de Tributação de Remessa Internacional:
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Total em Reais (BRL):</span>
                        <span className="font-mono font-bold text-slate-200">
                          R$ {res.valBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">CIDE (10%):</span>
                        <span className="font-mono font-bold text-indigo-400">
                          R$ {res.vCide.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">IRRF ({aI}%):</span>
                        <span className="font-mono font-bold text-amber-400">
                          R$ {res.vIrrf.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Custo Efetivo Total:</span>
                        <span className="font-mono font-bold text-emerald-400">
                          R$ {res.custoEfetivo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Observações e Dados do Contrato de Câmbio
                </label>
                <textarea
                  rows={2}
                  value={observacoes}
                  onChange={e => setObservacoes(e.target.value)}
                  placeholder="Número do contrato de câmbio, banco intermediador, cláusula de gross-up..."
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
                  {editando ? 'Atualizar Remessa' : 'Salvar Remessa Internacional'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
