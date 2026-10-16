import React, { useState, useEffect } from 'react';
import {
  Globe2,
  Building2,
  DollarSign,
  FileText,
  FileCode,
  Download,
  Copy,
  PlusCircle,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRightLeft,
  Percent,
  Calendar,
  Sparkles,
  TrendingUp,
  Landmark,
  Scale,
  Award
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  DemonstrativoEcfBlocoX,
  RegistroX300OperacoesExterior,
  RegistroX320Vinculadas,
  RegistroX340ParticipacaoExterior,
  RegistroX280Incentivos
} from '../../types/contabil';

interface BlocoXProps {
  empresaId?: number;
}

export const OperacoesExteriorEcfBlocoXModule: React.FC<BlocoXProps> = ({ empresaId = 1 }) => {
  const [anoExercicio, setAnoExercicio] = useState<number>(2026);
  const [activeTab, setActiveTab] = useState<'OPERACOES_X300' | 'VINCULADAS_X320_X340' | 'INCENTIVOS_X280' | 'DEMONSTRATIVO_A4' | 'TXT_ECF'>('OPERACOES_X300');
  const [blocoX, setBlocoX] = useState<DemonstrativoEcfBlocoX | null>(null);
  const [selectedOperacao, setSelectedOperacao] = useState<RegistroX300OperacoesExterior | null>(null);
  const [txtGerado, setTxtGerado] = useState<string>('');
  const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'info'; texto: string } | null>(null);

  // Form Nova Operação X300
  const [modalNovaOp, setModalNovaOp] = useState(false);
  const [formTipoOp, setFormTipoOp] = useState<'EXPORTACAO' | 'IMPORTACAO' | 'SERVICO_INTANGIVEL' | 'ROYALTIES'>('EXPORTACAO');
  const [formPaisCod, setFormPaisCod] = useState('840');
  const [formPaisNome, setFormPaisNome] = useState('ESTADOS UNIDOS DA AMERICA');
  const [formEntidadeRazao, setFormEntidadeRazao] = useState('');
  const [formNif, setFormNif] = useState('');
  const [formEhVinculada, setFormEhVinculada] = useState(true);
  const [formMetodoTp, setFormMetodoTp] = useState<'PIC_PRECO_INDEPENDENTE' | 'PRL_PRECO_REVENDA' | 'CPL_CUSTO_PRODUCAO' | 'MLN_MARGEM_LIQUIDA' | 'DRL_DIVISAO_LUCRO'>('PRL_PRECO_REVENDA');
  const [formValorMoeda, setFormValorMoeda] = useState<number>(100000);
  const [formMoeda, setFormMoeda] = useState<'USD' | 'EUR' | 'GBP' | 'JPY' | 'CHF'>('USD');
  const [formTaxaCambio, setFormTaxaCambio] = useState<number>(5.25);
  const [formValorParametroBRL, setFormValorParametroBRL] = useState<number>(550000);

  const carregarDados = () => {
    const dados = dbService.getOperacoesExteriorEcfBlocoX(empresaId, anoExercicio);
    setBlocoX(dados);
    if (dados.operacoes.length > 0 && !selectedOperacao) {
      setSelectedOperacao(dados.operacoes[0]);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [empresaId, anoExercicio]);

  const exibirAlerta = (texto: string, tipo: 'sucesso' | 'info' = 'sucesso') => {
    setFeedback({ tipo, texto });
    setTimeout(() => setFeedback(null), 4500);
  };

  const handleSalvarOperacao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEntidadeRazao || !formNif) {
      alert('Informe a razão social e o NIF da entidade no exterior.');
      return;
    }

    const valorTotalPraticado = Number(formValorMoeda) * Number(formTaxaCambio);
    // Para exportação: se parâmetro > praticado, ajuste = parâmetro - praticado
    // Para importação: se praticado > parâmetro, excesso = praticado - parâmetro
    let ajuste = 0;
    if (formTipoOp === 'EXPORTACAO') {
      ajuste = Math.max(0, Number(formValorParametroBRL) - valorTotalPraticado);
    } else {
      ajuste = Math.max(0, valorTotalPraticado - Number(formValorParametroBRL));
    }

    const novaOp: RegistroX300OperacoesExterior = {
      id: `x300-${Date.now()}`,
      tipoOperacao: formTipoOp,
      paisJurisdicao: formPaisCod,
      nomePais: formPaisNome,
      entidadeExteriorRazao: formEntidadeRazao,
      nifEntidadeExterior: formNif,
      ehParteVinculada: formEhVinculada,
      metodoTransferPricing: formMetodoTp,
      valorPraticadoMoedaEstrangeira: Number(formValorMoeda),
      moeda: formMoeda,
      taxaCambioUtilizada: Number(formTaxaCambio),
      valorTotalPraticadoBRL: valorTotalPraticado,
      valorParametroTransferPricingBRL: Number(formValorParametroBRL),
      ajusteLucroRealLalurBRL: ajuste
    };

    if (blocoX) {
      const atualizado: DemonstrativoEcfBlocoX = {
        ...blocoX,
        operacoes: [...blocoX.operacoes, novaOp],
        totalOperacoesExteriorBRL: blocoX.totalOperacoesExteriorBRL + valorTotalPraticado,
        totalAjustesTransferPricingBRL: blocoX.totalAjustesTransferPricingBRL + ajuste
      };
      dbService.salvarOperacoesExteriorEcfBlocoX(atualizado);
      setBlocoX(atualizado);
      setSelectedOperacao(novaOp);
      setModalNovaOp(false);
      exibirAlerta(`Operação internacional com ${formEntidadeRazao} adicionada.`);
    }
  };

  const handleGerarTxt = () => {
    const res = dbService.gerarArquivoEcfBlocoXTxt(empresaId, anoExercicio);
    if (res.sucesso) {
      setTxtGerado(res.txt);
      setActiveTab('TXT_ECF');
      exibirAlerta(res.mensagem);
    }
  };

  const copiarTxt = () => {
    navigator.clipboard.writeText(txtGerado);
    exibirAlerta('Arquivo TXT copiado para a área de transferência!');
  };

  const baixarTxt = () => {
    const element = document.createElement('a');
    const file = new Blob([txtGerado], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `SPED_ECF_BLOCO_X_${empresaId}_${anoExercicio}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    exibirAlerta('Download do arquivo TXT iniciado.');
  };

  return (
    <div className="p-6 bg-[#121212] min-h-screen text-slate-200">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-zinc-800 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Globe2 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
                SPED ECF Bloco X
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-950/60 border border-blue-800/40 text-blue-400 font-mono">
                  Exterior & Preços de Transferência
                </span>
              </h1>
              <p className="text-sm text-zinc-400 mt-0.5">
                Operações Internacionais, Vinculadas (X320), Participações (X340), Transfer Pricing (Lei 14.596/23) e Incentivos (X280)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300">
            <Calendar className="w-3.5 h-3.5 mr-2 text-zinc-400" />
            <span>Ano-Exercício:</span>
            <select
              value={anoExercicio}
              onChange={(e) => setAnoExercicio(Number(e.target.value))}
              className="bg-transparent text-white font-bold ml-2 outline-none cursor-pointer"
            >
              <option value={2026} className="bg-zinc-900">2026</option>
              <option value={2025} className="bg-zinc-900">2025</option>
            </select>
          </div>

          <button
            onClick={() => setModalNovaOp(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg shadow-lg shadow-blue-600/20 transition-all text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Nova Operação Exterior
          </button>

          <button
            onClick={handleGerarTxt}
            className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm transition-all"
            title="Gerar TXT PVA ECF"
          >
            <FileCode className="w-4 h-4 text-blue-400" />
            Gerar TXT
          </button>
        </div>
      </div>

      {/* FEEDBACK ALERT */}
      {feedback && (
        <div className="mt-4 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 flex items-center justify-between animate-fadeIn text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedback.texto}</span>
          </div>
          <span className="text-xs text-emerald-500 uppercase tracking-wider font-semibold">Sucesso</span>
        </div>
      )}

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium uppercase tracking-wider">
            <span>Operações Internacionais</span>
            <Globe2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">
            R$ {(blocoX?.totalOperacoesExteriorBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-zinc-500 mt-1">
            Volume Total Praticado
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium uppercase tracking-wider">
            <span>Ajustes Transfer Pricing</span>
            <Scale className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-400">
            R$ {(blocoX?.totalAjustesTransferPricingBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-zinc-500 mt-1">
            Adições no LALUR (Lucro Real)
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium uppercase tracking-wider">
            <span>Incentivos Fiscais (X280)</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400">
            R$ {(blocoX?.totalIncentivosFiscaisBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-zinc-500 mt-1">
            Lei do Bem & PAT
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium uppercase tracking-wider">
            <span>Crédito Tributo Exterior</span>
            <Landmark className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-400">
            R$ {(blocoX?.totalCreditoTributoExteriorBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-zinc-500 mt-1">
            Compensável IRPJ/CSLL
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-zinc-800 mt-8 space-x-2">
        <button
          onClick={() => setActiveTab('OPERACOES_X300')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'OPERACOES_X300'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          Operações X300 ({blocoX?.operacoes.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('VINCULADAS_X320_X340')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'VINCULADAS_X320_X340'
              ? 'border-purple-500 text-purple-400 bg-purple-500/5'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Vinculadas (X320) & Participações (X340)
        </button>

        <button
          onClick={() => setActiveTab('INCENTIVOS_X280')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'INCENTIVOS_X280'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Award className="w-4 h-4" />
          Incentivos Fiscais X280 ({blocoX?.incentivos.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('DEMONSTRATIVO_A4')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'DEMONSTRATIVO_A4'
              ? 'border-amber-500 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          Demonstrativo A4
        </button>

        <button
          onClick={() => setActiveTab('TXT_ECF')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'TXT_ECF'
              ? 'border-sky-500 text-sky-400 bg-sky-500/5'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileCode className="w-4 h-4" />
          Arquivo TXT PVA ECF
        </button>
      </div>

      {/* TAB CONTENT: OPERAÇÕES X300 */}
      {activeTab === 'OPERACOES_X300' && (
        <div className="mt-6 space-y-6">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-blue-400" />
                  Operações com o Exterior e Cálculo de Preços de Transferência (X300)
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Conformidade com a Lei nº 14.596/2023, métodos OCDE e determinação de ajustes no LALUR
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-300">
                <thead className="bg-zinc-800/40 text-xs uppercase font-medium text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">País / Jurisdição</th>
                    <th className="px-4 py-3">Entidade Exterior</th>
                    <th className="px-4 py-3">Método TP</th>
                    <th className="px-4 py-3 text-right">Valor Moeda Origem</th>
                    <th className="px-4 py-3 text-right">Valor Praticado BRL</th>
                    <th className="px-4 py-3 text-right">Parâmetro BRL</th>
                    <th className="px-4 py-3 text-right">Ajuste LALUR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono text-xs">
                  {blocoX?.operacoes.map((op) => (
                    <tr
                      key={op.id}
                      onClick={() => setSelectedOperacao(op)}
                      className={`hover:bg-zinc-800/30 cursor-pointer transition-colors ${
                        selectedOperacao?.id === op.id ? 'bg-blue-950/20 border-l-2 border-blue-500' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            op.tipoOperacao === 'EXPORTACAO'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                              : 'bg-rose-950 text-rose-400 border border-rose-800/40'
                          }`}
                        >
                          {op.tipoOperacao}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-sans">
                        <span className="text-white font-medium">{op.nomePais}</span>
                        <span className="text-zinc-500 text-[10px] block font-mono">ISO: {op.paisJurisdicao}</span>
                      </td>
                      <td className="px-4 py-3 font-sans">
                        <span className="text-zinc-200">{op.entidadeExteriorRazao}</span>
                        <span className="text-zinc-500 text-[10px] block font-mono">NIF: {op.nifEntidadeExterior}</span>
                      </td>
                      <td className="px-4 py-3 font-sans">
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-blue-300 border border-zinc-700 text-[10px] font-bold">
                          {op.metodoTransferPricing.split('_')[0]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-300">
                        {op.moeda} {op.valorPraticadoMoedaEstrangeira.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-white">
                        R$ {op.valorTotalPraticadoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-400">
                        R$ {op.valorParametroTransferPricingBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-amber-400">
                        {op.ajusteLucroRealLalurBRL > 0
                          ? `R$ ${op.ajusteLucroRealLalurBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* PAINEL DE CONCILIAÇÃO TRANSFER PRICING */}
          {selectedOperacao && (
            <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
                <Scale className="w-4 h-4 text-amber-400" />
                Demonstrativo de Ajuste Fiscal (Arm's Length) - {selectedOperacao.entidadeExteriorRazao}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 font-mono text-xs">
                <div className="p-3 bg-zinc-950/60 rounded border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px] uppercase font-sans">Valor Praticado (BRL)</span>
                  <span className="text-base font-bold text-white mt-1 block">
                    R$ {selectedOperacao.valorTotalPraticadoBRL.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-zinc-500">Taxa Câmbio: R$ {selectedOperacao.taxaCambioUtilizada.toFixed(4)}</span>
                </div>

                <div className="p-3 bg-zinc-950/60 rounded border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px] uppercase font-sans">Preço Parâmetro Arm's Length</span>
                  <span className="text-base font-bold text-sky-400 mt-1 block">
                    R$ {selectedOperacao.valorParametroTransferPricingBRL.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-zinc-500">Método: {selectedOperacao.metodoTransferPricing}</span>
                </div>

                <div className="p-3 bg-zinc-950/60 rounded border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px] uppercase font-sans">Ajuste Fiscal LALUR</span>
                  <span className="text-base font-bold text-amber-400 mt-1 block">
                    R$ {selectedOperacao.ajusteLucroRealLalurBRL.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-amber-500/80">Adição à Base IRPJ/CSLL</span>
                </div>

                <div className="p-3 bg-zinc-950/60 rounded border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px] uppercase font-sans">Parte Vinculada / Paraíso</span>
                  <span className="text-sm font-bold text-emerald-400 mt-1 block">
                    {selectedOperacao.ehParteVinculada ? 'SIM (VINCULADA)' : 'NÃO VINCULADA'}
                  </span>
                  <span className="text-[10px] text-zinc-500">NIF: {selectedOperacao.nifEntidadeExterior}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: VINCULADAS & PARTICIPAÇÕES */}
      {activeTab === 'VINCULADAS_X320_X340' && (
        <div className="mt-6 space-y-6">
          {/* TABELA X320 */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-400" />
                Pessoas Jurídicas Vinculadas no Exterior (Registro X320)
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Identificação de controladoras, controladas e coligadas no exterior
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-300">
                <thead className="bg-zinc-800/40 text-xs uppercase font-medium text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="px-4 py-3">País</th>
                    <th className="px-4 py-3">Razão Social Exterior</th>
                    <th className="px-4 py-3">NIF Exterior</th>
                    <th className="px-4 py-3">Relacionamento Societário</th>
                    <th className="px-4 py-3 text-right">% Participação</th>
                    <th className="px-4 py-3 text-center">Paraíso Fiscal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono text-xs">
                  {blocoX?.vinculadas.map((v) => (
                    <tr key={v.id} className="hover:bg-zinc-800/30">
                      <td className="px-4 py-3 font-sans font-medium text-white">{v.paisNome}</td>
                      <td className="px-4 py-3 font-sans text-zinc-200">{v.razaoSocialExterior}</td>
                      <td className="px-4 py-3 text-zinc-400">{v.nifExterior}</td>
                      <td className="px-4 py-3 font-sans">
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-purple-300 border border-zinc-700 text-[10px] font-bold">
                          {v.relacionamentoSocietario}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-white">{v.percentualParticipacaoVotante.toFixed(2)}%</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            v.jurisdicaoTributacaoFavorecida
                              ? 'bg-rose-950 text-rose-400 border border-rose-800/40'
                              : 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                          }`}
                        >
                          {v.jurisdicaoTributacaoFavorecida ? 'SIM' : 'NÃO'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* TABELA X340 */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Landmark className="w-4 h-4 text-emerald-400" />
                Participações Societárias e Tributação em Bases Universais (Registro X340)
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Lucros auferidos no exterior, MEP e imposto de renda pago no exterior compensável
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-300">
                <thead className="bg-zinc-800/40 text-xs uppercase font-medium text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="px-4 py-3">País</th>
                    <th className="px-4 py-3">Empresa Investida</th>
                    <th className="px-4 py-3 text-right">Lucro Moeda Origem</th>
                    <th className="px-4 py-3 text-right">Lucro Convertido (BRL)</th>
                    <th className="px-4 py-3 text-right">Tributo Pago Exterior</th>
                    <th className="px-4 py-3 text-right">Crédito Compensável</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono text-xs">
                  {blocoX?.participacoes.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-800/30">
                      <td className="px-4 py-3 font-sans font-medium text-white">{p.paisNome}</td>
                      <td className="px-4 py-3 font-sans text-zinc-200">{p.razaoSocialInvestida}</td>
                      <td className="px-4 py-3 text-right text-zinc-300">
                        {p.lucroPeriodoMoedaOrigem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-white">
                        R$ {p.lucroPeriodoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-right text-rose-400">
                        R$ {p.impostoRendaPagoNoExteriorBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-400">
                        R$ {p.creditoImpostoExteriorCompensavelBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: INCENTIVOS FISCAIS X280 */}
      {activeTab === 'INCENTIVOS_X280' && (
        <div className="mt-6 bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-zinc-800">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              Atividades Incentivadas e Benefícios Fiscais (Registro X280)
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Inovação Tecnológica (Lei do Bem 11.196/05), PAT, Rota 2030/Mover e Inova Agro
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-800/40 text-xs uppercase font-medium text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3">Tipo do Incentivo</th>
                  <th className="px-4 py-3">Ato Concessivo / Portaria</th>
                  <th className="px-4 py-3">Descrição do Projeto</th>
                  <th className="px-4 py-3 text-right">Investimento P&D</th>
                  <th className="px-4 py-3 text-right">Benefício Fiscal Apurado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono text-xs">
                {blocoX?.incentivos.map((inc) => (
                  <tr key={inc.id} className="hover:bg-zinc-800/30">
                    <td className="px-4 py-3 font-sans">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-emerald-300 border border-zinc-700 text-[10px] font-bold">
                        {inc.tipoIncentivo}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-white">{inc.atoAprovacaoNumero}</td>
                    <td className="px-4 py-3 font-sans text-zinc-300 max-w-md truncate">{inc.descricaoProjeto}</td>
                    <td className="px-4 py-3 text-right text-zinc-300">
                      R$ {inc.valorInvestidoPesquisaDesenvolvimentoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-400">
                      R$ {inc.valorBeneficioApuradoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: DEMONSTRATIVO A4 */}
      {activeTab === 'DEMONSTRATIVO_A4' && blocoX && (
        <div className="mt-6 bg-white text-zinc-900 p-8 rounded-xl shadow-2xl max-w-4xl mx-auto font-sans">
          {/* CABEÇALHO TIMBRADO */}
          <div className="flex items-center justify-between border-b-2 border-zinc-800 pb-4">
            <div>
              <h2 className="text-xl font-bold uppercase tracking-wider text-zinc-900">
                Demonstrativo de Operações com o Exterior & Preços de Transferência
              </h2>
              <p className="text-xs text-zinc-600 mt-0.5">
                SPED ECF Bloco X | Exercício: {blocoX.anoExercicio} | Emissão Contábil Studio Pro
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold px-2 py-1 bg-zinc-100 border border-zinc-300 rounded">
                STATUS: {blocoX.statusValidacaoEcf}
              </span>
            </div>
          </div>

          {/* QUADRO DE OPERAÇÕES INTERNACIONAIS */}
          <div className="mt-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2">
              Registro X300 - Operações com Pessoas Vinculadas e Não Vinculadas
            </h4>
            <table className="w-full text-xs text-left border border-zinc-300">
              <thead className="bg-zinc-100 text-zinc-700 uppercase font-semibold border-b border-zinc-300">
                <tr>
                  <th className="p-2">Tipo</th>
                  <th className="p-2">Entidade Exterior</th>
                  <th className="p-2">País</th>
                  <th className="p-2">Método</th>
                  <th className="p-2 text-right">Praticado (BRL)</th>
                  <th className="p-2 text-right">Ajuste LALUR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 font-mono">
                {blocoX.operacoes.map((op) => (
                  <tr key={op.id}>
                    <td className="p-2 font-bold">{op.tipoOperacao}</td>
                    <td className="p-2 font-sans">{op.entidadeExteriorRazao}</td>
                    <td className="p-2 font-sans">{op.nomePais}</td>
                    <td className="p-2 font-sans">{op.metodoTransferPricing.split('_')[0]}</td>
                    <td className="p-2 text-right">R$ {op.valorTotalPraticadoBRL.toFixed(2)}</td>
                    <td className="p-2 text-right font-bold text-amber-700">R$ {op.ajusteLucroRealLalurBRL.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="bg-zinc-100 font-bold">
                  <td colSpan={4} className="p-2 text-right uppercase">Total Volume Internacional:</td>
                  <td className="p-2 text-right">R$ {blocoX.totalOperacoesExteriorBRL.toFixed(2)}</td>
                  <td className="p-2 text-right text-amber-700">R$ {blocoX.totalAjustesTransferPricingBRL.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* TOTALIZADORES RESUMIDOS */}
          <div className="mt-6 grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-3 bg-zinc-100 rounded border border-zinc-200">
              <span className="text-zinc-600 block">Total Ajustes Transfer Pricing</span>
              <span className="font-mono text-sm font-bold text-amber-800">
                R$ {blocoX.totalAjustesTransferPricingBRL.toFixed(2)}
              </span>
            </div>
            <div className="p-3 bg-zinc-100 rounded border border-zinc-200">
              <span className="text-zinc-600 block">Incentivos Fiscais (Lei do Bem)</span>
              <span className="font-mono text-sm font-bold text-emerald-800">
                R$ {blocoX.totalIncentivosFiscaisBRL.toFixed(2)}
              </span>
            </div>
            <div className="p-3 bg-zinc-100 rounded border border-zinc-200">
              <span className="text-zinc-600 block">Crédito de Tributo Exterior</span>
              <span className="font-mono text-sm font-bold text-purple-800">
                R$ {blocoX.totalCreditoTributoExteriorBRL.toFixed(2)}
              </span>
            </div>
          </div>

          {/* ASSINATURAS */}
          <div className="mt-12 pt-8 border-t border-zinc-300 grid grid-cols-2 gap-8 text-center text-xs text-zinc-600">
            <div>
              <div className="border-b border-zinc-400 pb-1 mb-1 font-semibold text-zinc-800">
                DIRETORIA DE OPERAÇÕES INTERNACIONAIS
              </div>
              <span>Responsável Técnico</span>
            </div>
            <div>
              <div className="border-b border-zinc-400 pb-1 mb-1 font-semibold text-zinc-800">
                CONTROLADORIA & AUDITORIA FISCAL
              </div>
              <span>CRC Vinculado</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: TXT ECF */}
      {activeTab === 'TXT_ECF' && (
        <div className="mt-6 bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode className="w-5 h-5 text-sky-400" />
              <h3 className="font-semibold text-white text-sm">Estrutura de Arquivo SPED ECF Bloco X</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={copiarTxt}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs flex items-center gap-1.5 transition-all"
              >
                <Copy className="w-3.5 h-3.5" />
                Copiar
              </button>
              <button
                onClick={baixarTxt}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20"
              >
                <Download className="w-3.5 h-3.5" />
                Baixar TXT ECF
              </button>
            </div>
          </div>
          <div className="p-4 bg-zinc-950 font-mono text-xs text-sky-300/90 overflow-x-auto max-h-[550px] leading-relaxed">
            <pre>{txtGerado || 'Clique em "Gerar TXT" para compilar os registros X001 a X990.'}</pre>
          </div>
        </div>
      )}

      {/* MODAL NOVA OPERAÇÃO X300 */}
      {modalNovaOp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Globe2 className="w-5 h-5 text-blue-400" />
                Nova Operação com o Exterior (Registro X300)
              </h3>
              <button
                onClick={() => setModalNovaOp(false)}
                className="text-zinc-400 hover:text-white text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSalvarOperacao} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Tipo da Operação</label>
                  <select
                    value={formTipoOp}
                    onChange={(e) => setFormTipoOp(e.target.value as any)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white"
                  >
                    <option value="EXPORTACAO">Exportação de Mercadorias</option>
                    <option value="IMPORTACAO">Importação de Mercadorias</option>
                    <option value="SERVICO_INTANGIVEL">Serviços / Intangíveis</option>
                    <option value="ROYALTIES">Royalties / Assistência Técnica</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Método Transfer Pricing (Lei 14.596/23)</label>
                  <select
                    value={formMetodoTp}
                    onChange={(e) => setFormMetodoTp(e.target.value as any)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white"
                  >
                    <option value="PRL_PRECO_REVENDA">PRL - Preço de Revenda Menos Lucro</option>
                    <option value="PIC_PRECO_INDEPENDENTE">PIC - Preço Independente Comparável</option>
                    <option value="CPL_CUSTO_PRODUCAO">CPL - Custo de Produção Mais Lucro</option>
                    <option value="MLN_MARGEM_LIQUIDA">MLN - Margem Líquida da Operação</option>
                    <option value="DRL_DIVISAO_LUCRO">DRL - Divisão do Lucro</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-zinc-400 mb-1">Razão Social da Entidade no Exterior</label>
                  <input
                    type="text"
                    value={formEntidadeRazao}
                    onChange={(e) => setFormEntidadeRazao(e.target.value)}
                    placeholder="Ex: GLOBAL ALLIANCE ENTERPRISE INC"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">NIF (Tax ID / Identificador)</label>
                  <input
                    type="text"
                    value={formNif}
                    onChange={(e) => setFormNif(e.target.value)}
                    placeholder="US-12345678"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">País / Jurisdição</label>
                  <input
                    type="text"
                    value={formPaisNome}
                    onChange={(e) => setFormPaisNome(e.target.value)}
                    placeholder="ESTADOS UNIDOS DA AMERICA"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Código do País (Bacen/ISO)</label>
                  <input
                    type="text"
                    value={formPaisCod}
                    onChange={(e) => setFormPaisCod(e.target.value)}
                    placeholder="840"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-zinc-950/60 rounded border border-zinc-800 space-y-3">
                <span className="font-semibold text-white block">Valores Praticados e Preço Parâmetro</span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-zinc-400 mb-1">Moeda Estrangeira</label>
                    <select
                      value={formMoeda}
                      onChange={(e) => setFormMoeda(e.target.value as any)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white font-bold"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="CHF">CHF (Fr)</option>
                      <option value="JPY">JPY (¥)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">Valor na Moeda</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formValorMoeda}
                      onChange={(e) => setFormValorMoeda(Number(e.target.value))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">Taxa de Câmbio (R$)</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={formTaxaCambio}
                      onChange={(e) => setFormTaxaCambio(Number(e.target.value))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">Parâmetro Arm's Length (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formValorParametroBRL}
                      onChange={(e) => setFormValorParametroBRL(Number(e.target.value))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-sky-400 font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="chkVinculada"
                  checked={formEhVinculada}
                  onChange={(e) => setFormEhVinculada(e.target.checked)}
                  className="rounded bg-zinc-800 border-zinc-700 text-blue-600 focus:ring-0"
                />
                <label htmlFor="chkVinculada" className="text-zinc-300">
                  Entidade é Pessoa Jurídica Vinculada ou Residente em País com Tributação Favorecida (Paraíso Fiscal)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setModalNovaOp(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium shadow-md shadow-blue-600/20"
                >
                  Salvar Operação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
