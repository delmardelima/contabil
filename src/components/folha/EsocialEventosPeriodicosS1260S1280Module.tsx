import React, { useState, useEffect } from 'react';
import {
  Sprout,
  Users,
  FileCode,
  FileText,
  Printer,
  PlusCircle,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  Layers,
  Percent,
  Search,
  Copy,
  Download,
  ShieldCheck,
  Send,
  DollarSign,
  Briefcase,
  Wheat,
  Scale,
  Landmark,
  BadgeAlert
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  ItemComercializacaoRuralS1260,
  ItemContratacaoAvulsosS1270,
  InformacoesComplementaresS1280,
  ResumoEventosPeriodicosFolhaS1260S1280,
  TipoComercializacaoRuralS1260
} from '../../types/contabil';

interface EsocialPeriodicosProps {
  empresaId?: number;
}

export const EsocialEventosPeriodicosS1260S1280Module: React.FC<EsocialPeriodicosProps> = ({ empresaId = 1 }) => {
  const [competencia, setCompetencia] = useState<string>('2026-03');
  const [activeTab, setActiveTab] = useState<'RURAL_S1260' | 'AVULSOS_S1270' | 'DESONERACAO_S1280' | 'DEMONSTRATIVO_A4' | 'XML_PREVIEW'>('RURAL_S1260');
  const [resumo, setResumo] = useState<ResumoEventosPeriodicosFolhaS1260S1280 | null>(null);
  const [selectedRural, setSelectedRural] = useState<ItemComercializacaoRuralS1260 | null>(null);
  const [xmlVisualizacao, setXmlVisualizacao] = useState<string>('');
  const [xmlTitulo, setXmlTitulo] = useState<string>('');
  const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'info'; texto: string } | null>(null);

  // Form Novo S-1260
  const [modalNovoRural, setModalNovoRural] = useState(false);
  const [formTipoComerc, setFormTipoComerc] = useState<TipoComercializacaoRuralS1260>('1_ADQUIRENTE_PJ');
  const [formNumDoc, setFormNumDoc] = useState('');
  const [formDataEmissao, setFormDataEmissao] = useState('2026-03-15');
  const [formCompradorNome, setFormCompradorNome] = useState('');
  const [formCompradorCpfCnpj, setFormCompradorCpfCnpj] = useState('');
  const [formValorBruto, setFormValorBruto] = useState<number>(0);
  const [formRespRecolhimento, setFormRespRecolhimento] = useState<'SUB_ROGAÇÃO_ADQUIRENTE' | 'PRODUTOR_TITULAR'>('SUB_ROGAÇÃO_ADQUIRENTE');

  // Form S-1280
  const [indicativoDeson, setIndicativoDeson] = useState<'0_NAO_DESONERADA' | '1_TOTALMENTE_DESONERADA' | '2_PARCIALMENTE_DESONERADA'>('2_PARCIALMENTE_DESONERADA');
  const [recDesonerada, setRecDesonerada] = useState<number>(750000);
  const [recTotal, setRecTotal] = useState<number>(1000000);
  const [isentoAcordo, setIsentoAcordo] = useState<boolean>(false);

  const carregarDados = () => {
    const dados = dbService.getEventosPeriodicosFolhaS1260S1280(empresaId, competencia);
    setResumo(dados);
    if (dados.rural.length > 0 && !selectedRural) {
      setSelectedRural(dados.rural[0]);
    }
    if (dados.infoComplementar) {
      setIndicativoDeson(dados.infoComplementar.indicativoDesoneracaoCprb);
      setRecDesonerada(dados.infoComplementar.receitaBrutaAtividadesDesoneradasBRL);
      setRecTotal(dados.infoComplementar.receitaBrutaTotalEmpresaBRL);
      setIsentoAcordo(dados.infoComplementar.indicativoAcordoInternacionalIsencao);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [empresaId, competencia]);

  const formatBRL = (val: number) => {
    return (val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleSalvarS1260 = () => {
    if (!formNumDoc || formValorBruto <= 0) {
      alert('Preencha o número do documento fiscal e o valor da produção.');
      return;
    }

    const vlrPrev = Math.round(formValorBruto * 0.012 * 100) / 100; // 1,2%
    const vlrGilrat = Math.round(formValorBruto * 0.001 * 100) / 100; // 0,1%
    const vlrSenar = Math.round(formValorBruto * 0.002 * 100) / 100; // 0,2%
    const total = vlrPrev + vlrGilrat + vlrSenar; // 1,5%

    const novoItem: ItemComercializacaoRuralS1260 = {
      id: `rural-${Date.now()}`,
      empresaId,
      competencia,
      tipoComercializacao: formTipoComerc,
      numeroDocumentoNf: formNumDoc,
      dataEmissao: formDataEmissao,
      compradorNomeRazao: formCompradorNome || 'COMPRADOR DIVERSOS',
      compradorCpfCnpj: formCompradorCpfCnpj || '00.000.000/0000-00',
      valorBrutoProducaoBRL: formValorBruto,
      aliquotaPrevidenciaFunrural: 1.2,
      valorPrevidenciaFunruralBRL: vlrPrev,
      aliquotaGilratRural: 0.1,
      valorGilratRuralBRL: vlrGilrat,
      aliquotaSenarRural: 0.2,
      valorSenarRuralBRL: vlrSenar,
      totalContribuicaoDevidaBRL: total,
      responsavelRecolhimento: formRespRecolhimento,
      statusTransmissao: 'PENDENTE'
    };

    const res = dbService.salvarComercializacaoRuralS1260(novoItem);
    if (res.sucesso) {
      setFeedback({ tipo: 'sucesso', texto: res.mensagem });
      setModalNovoRural(false);
      carregarDados();
      setSelectedRural(novoItem);
    }
  };

  const handleSalvarS1280 = () => {
    const fator = recTotal > 0 ? Math.round((recDesonerada / recTotal) * 10000) / 10000 : 0;
    const aliqPatronalEfetiva = Math.round(20.0 * (1 - fator) * 100) / 100;

    const info: InformacoesComplementaresS1280 = {
      id: `info-1280-${empresaId}-${competencia}`,
      empresaId,
      competencia,
      indicativoDesoneracaoCprb: indicativoDeson,
      fatorProporcionalidadeReducao: fator,
      receitaBrutaAtividadesDesoneradasBRL: recDesonerada,
      receitaBrutaTotalEmpresaBRL: recTotal,
      reducaoAliquotaPatronalCalculada: aliqPatronalEfetiva,
      indicativoAcordoInternacionalIsencao: isentoAcordo,
      statusTransmissao: 'PENDENTE'
    };

    const res = dbService.salvarInfoComplementarS1280(info);
    if (res.sucesso) {
      setFeedback({ tipo: 'sucesso', texto: 'Informações Complementares S-1280 (CPRB Proporcional) salvas com sucesso.' });
      carregarDados();
    }
  };

  const handleGerarXmlS1260 = (item: ItemComercializacaoRuralS1260) => {
    const res = dbService.gerarXmlS1260(item.id);
    if (res.sucesso) {
      setXmlVisualizacao(res.xml);
      setXmlTitulo(`eSocial S-1260 - Comercialização Produção Rural (Doc: ${item.numeroDocumentoNf})`);
      setActiveTab('XML_PREVIEW');
      setFeedback({ tipo: 'info', texto: res.mensagem });
    }
  };

  const handleGerarXmlS1280 = () => {
    const res = dbService.gerarXmlS1280(empresaId, competencia);
    if (res.sucesso) {
      setXmlVisualizacao(res.xml);
      setXmlTitulo(`eSocial S-1280 - Informações Complementares da Folha (${competencia})`);
      setActiveTab('XML_PREVIEW');
      setFeedback({ tipo: 'info', texto: res.mensagem });
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#121212] text-zinc-100 overflow-hidden font-sans">
      {/* HEADER PRINCIPAL */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#181818]">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-600/20 text-emerald-400 rounded-lg border border-emerald-500/30">
            <Wheat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-white">eSocial S-1260 & S-1280</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                MOS S-1.3 & IN RFB 2.110/2022
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Comercialização Rural (Funrural 1,5%), Avulsos Não Portuários (S-1270) e Desoneração da Folha CPRB Proporcional (S-1280)
            </p>
          </div>
        </div>

        {/* CONTROLES DO HEADER */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-[#242424] px-3 py-1.5 rounded-md border border-zinc-700">
            <Calendar className="w-4 h-4 text-zinc-400 mr-2" />
            <span className="text-xs text-zinc-400 mr-2">Competência:</span>
            <input
              type="month"
              value={competencia}
              onChange={e => setCompetencia(e.target.value)}
              className="bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => setModalNovoRural(true)}
            className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-semibold shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Lançar Venda Rural (S-1260)</span>
          </button>

          <button
            onClick={carregarDados}
            title="Atualizar dados"
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* FEEDBACK BANNER */}
      {feedback && (
        <div className={`px-6 py-2 text-xs flex items-center justify-between ${
          feedback.tipo === 'sucesso' ? 'bg-emerald-950/60 text-emerald-300 border-b border-emerald-800' : 'bg-blue-950/60 text-blue-300 border-b border-blue-800'
        }`}>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{feedback.texto}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-zinc-400 hover:text-white">✕</button>
        </div>
      )}

      {/* KPI CARDS */}
      <div className="grid grid-cols-5 gap-3 px-6 py-3 bg-[#161616] border-b border-zinc-800 text-xs">
        <div className="p-3 bg-[#1e1e1e] rounded-lg border border-zinc-800">
          <div className="text-zinc-400 flex items-center justify-between">
            <span>Produção Rural Bruta</span>
            <Wheat className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-base font-bold text-white mt-1">
            {formatBRL(resumo?.totalValorProducaoRuralBRL || 0)}
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">
            {resumo?.rural.length || 0} notas de comercialização
          </div>
        </div>

        <div className="p-3 bg-[#1e1e1e] rounded-lg border border-zinc-800">
          <div className="text-zinc-400 flex items-center justify-between">
            <span>Funrural Total (1,5%)</span>
            <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded text-[10px]">1,2% + 0,1% + 0,2%</span>
          </div>
          <div className="text-base font-bold text-emerald-400 mt-1">
            {formatBRL(resumo?.totalFunruralRecolherBRL || 0)}
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">
            Previdência, GILRAT e SENAR
          </div>
        </div>

        <div className="p-3 bg-[#1e1e1e] rounded-lg border border-zinc-800">
          <div className="text-zinc-400 flex items-center justify-between">
            <span>Avulsos Não Portuários</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-base font-bold text-blue-400 mt-1">
            {formatBRL(resumo?.totalRemuneracaoAvulsosBRL || 0)}
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">
            S-1270 Sindicato de Classe
          </div>
        </div>

        <div className="p-3 bg-[#1e1e1e] rounded-lg border border-zinc-800">
          <div className="text-zinc-400 flex items-center justify-between">
            <span>Fator Redução CPRB</span>
            <Percent className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-base font-bold text-amber-400 mt-1">
            {((resumo?.infoComplementar.fatorProporcionalidadeReducao || 0) * 100).toFixed(2)}%
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">
            S-1280 Desoneração Proporcional
          </div>
        </div>

        <div className="p-3 bg-emerald-950/30 rounded-lg border border-emerald-500/30">
          <div className="text-emerald-300 flex items-center justify-between font-semibold">
            <span>CPP Patronal Efetiva</span>
            <Scale className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-base font-extrabold text-emerald-300 mt-1">
            {(resumo?.infoComplementar.reducaoAliquotaPatronalCalculada || 20).toFixed(2)}%
          </div>
          <div className="text-[10px] text-emerald-400/80 mt-1">
            Folha ajustada pelo S-1280
          </div>
        </div>
      </div>

      {/* NAVEGAÇÃO ENTRE ABAS */}
      <div className="flex items-center px-6 border-b border-zinc-800 bg-[#141414] text-xs">
        <button
          onClick={() => setActiveTab('RURAL_S1260')}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium transition-colors ${
            activeTab === 'RURAL_S1260'
              ? 'border-emerald-500 text-emerald-400 bg-zinc-800/40'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Sprout className="w-4 h-4" />
          <span>Comercialização Rural (S-1260)</span>
        </button>

        <button
          onClick={() => setActiveTab('AVULSOS_S1270')}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium transition-colors ${
            activeTab === 'AVULSOS_S1270'
              ? 'border-emerald-500 text-emerald-400 bg-zinc-800/40'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Trabalhadores Avulsos (S-1270)</span>
        </button>

        <button
          onClick={() => setActiveTab('DESONERACAO_S1280')}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium transition-colors ${
            activeTab === 'DESONERACAO_S1280'
              ? 'border-emerald-500 text-emerald-400 bg-zinc-800/40'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Desoneração da Folha CPRB (S-1280)</span>
        </button>

        <button
          onClick={() => setActiveTab('DEMONSTRATIVO_A4')}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium transition-colors ${
            activeTab === 'DEMONSTRATIVO_A4'
              ? 'border-emerald-500 text-emerald-400 bg-zinc-800/40'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>Demonstrativo Oficial A4</span>
        </button>

        <button
          onClick={() => setActiveTab('XML_PREVIEW')}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium transition-colors ${
            activeTab === 'XML_PREVIEW'
              ? 'border-emerald-500 text-emerald-400 bg-zinc-800/40'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Visualizador de XML eSocial</span>
        </button>
      </div>

      {/* ÁREA DE CONTEÚDO */}
      <div className="flex-1 overflow-auto p-6 bg-[#121212]">
        {/* ABA 1: COMERCIALIZAÇÃO RURAL S-1260 */}
        {activeTab === 'RURAL_S1260' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-[#181818] p-3 rounded-lg border border-zinc-800 text-xs">
              <div className="flex items-center space-x-2">
                <Wheat className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-white">Notas Fiscais de Comercialização da Produção Rural PF</span>
              </div>
              <button
                onClick={() => setModalNovoRural(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center space-x-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Nova Venda Rural</span>
              </button>
            </div>

            <div className="bg-[#181818] rounded-lg border border-zinc-800 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#202020] text-zinc-400 border-b border-zinc-800 select-none">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Tipo Comercialização</th>
                    <th className="py-2.5 px-4 font-semibold">Documento / Emissão</th>
                    <th className="py-2.5 px-4 font-semibold">Comprador / Adquirente</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Valor Bruto</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Previdência (1,2%)</th>
                    <th className="py-2.5 px-4 font-semibold text-right">GILRAT (0,1%)</th>
                    <th className="py-2.5 px-4 font-semibold text-right">SENAR (0,2%)</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Total Funrural (1,5%)</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Responsável</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono">
                  {resumo?.rural.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-zinc-500 font-sans">
                        Nenhuma comercialização rural cadastrada para {competencia}.
                      </td>
                    </tr>
                  ) : (
                    resumo?.rural.map(item => (
                      <tr
                        key={item.id}
                        className={`hover:bg-zinc-800/40 transition-colors cursor-pointer ${
                          selectedRural?.id === item.id ? 'bg-emerald-950/20' : ''
                        }`}
                        onClick={() => setSelectedRural(item)}
                      >
                        <td className="py-3 px-4 font-sans">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            {item.tipoComercializacao}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-sans">
                          <div className="font-semibold text-white">{item.numeroDocumentoNf}</div>
                          <div className="text-[11px] text-zinc-400">{item.dataEmissao}</div>
                        </td>
                        <td className="py-3 px-4 font-sans">
                          <div className="text-zinc-200 truncate max-w-xs">{item.compradorNomeRazao}</div>
                          <div className="text-[10px] text-zinc-500 font-mono">{item.compradorCpfCnpj}</div>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-white">
                          {formatBRL(item.valorBrutoProducaoBRL)}
                        </td>
                        <td className="py-3 px-4 text-right text-emerald-400">
                          {formatBRL(item.valorPrevidenciaFunruralBRL)}
                        </td>
                        <td className="py-3 px-4 text-right text-emerald-400">
                          {formatBRL(item.valorGilratRuralBRL)}
                        </td>
                        <td className="py-3 px-4 text-right text-emerald-400">
                          {formatBRL(item.valorSenarRuralBRL)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-300">
                          {formatBRL(item.totalContribuicaoDevidaBRL)}
                        </td>
                        <td className="py-3 px-4 text-center font-sans">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                            {item.responsavelRecolhimento}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-sans">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGerarXmlS1260(item);
                            }}
                            title="Gerar XML eSocial S-1260"
                            className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-zinc-700 rounded transition-colors"
                          >
                            <FileCode className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 2: TRABALHADORES AVULSOS S-1270 */}
        {activeTab === 'AVULSOS_S1270' && (
          <div className="space-y-4">
            <div className="bg-[#181818] p-4 rounded-lg border border-zinc-800 text-xs">
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>Evento S-1270: Contratação de Trabalhadores Avulsos Não Portuários</span>
              </h2>
              <p className="text-zinc-400 mt-1">
                Remunerações pagas a trabalhadores avulsos intermediados por sindicatos de classe (arrumadores, ensacadores, etc.) com cálculo patronal de CPP 20% + RAT + Terceiros.
              </p>
            </div>

            <div className="bg-[#181818] rounded-lg border border-zinc-800 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#202020] text-zinc-400 border-b border-zinc-800 select-none">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Sindicato Intermediador</th>
                    <th className="py-2.5 px-4 font-semibold">Código CNO / Estabelecimento</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Remuneração Bruta</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Base Previdenciária</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Encargo Patronal (20%)</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Status eSocial</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono">
                  {resumo?.avulsos.map(item => (
                    <tr key={item.id} className="hover:bg-zinc-800/40">
                      <td className="py-3 px-4 font-sans">
                        <div className="font-semibold text-white">{item.sindicatoRazaoSocial}</div>
                        <div className="text-[11px] text-zinc-400">{item.sindicatoCnpj}</div>
                      </td>
                      <td className="py-3 px-4 font-sans">{item.codigoTomadorCno || 'Estabelecimento Principal'}</td>
                      <td className="py-3 px-4 text-right font-bold text-white">{formatBRL(item.valorBrutoRemuneracaoAvulsosBRL)}</td>
                      <td className="py-3 px-4 text-right text-zinc-300">{formatBRL(item.baseCalculoPrevidenciariaBRL)}</td>
                      <td className="py-3 px-4 text-right font-bold text-blue-400">{formatBRL(item.valorEncargoPatronalBRL)}</td>
                      <td className="py-3 px-4 text-center font-sans">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold">
                          {item.statusTransmissao}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 3: DESONERAÇÃO DA FOLHA CPRB S-1280 */}
        {activeTab === 'DESONERACAO_S1280' && (
          <div className="max-w-4xl mx-auto bg-[#181818] p-6 rounded-lg border border-zinc-800 shadow-sm space-y-6 text-xs">
            <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <Scale className="w-5 h-5 text-amber-400" />
                  <span>Configuração e Memória de Cálculo do Evento S-1280 (CPRB Proporcional)</span>
                </h2>
                <p className="text-zinc-400 mt-1">
                  Apuração do Fator de Proporcionalidade para empresas com atividades mistas enquadradas na Lei nº 12.546/2011.
                </p>
              </div>

              <button
                onClick={handleGerarXmlS1280}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold flex items-center space-x-1.5"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Gerar XML S-1280</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-3">
                <label className="block text-zinc-400 mb-1 font-semibold">Indicativo de Desoneração da Folha:</label>
                <select
                  value={indicativoDeson}
                  onChange={e => setIndicativoDeson(e.target.value as any)}
                  className="w-full bg-[#242424] border border-zinc-700 rounded p-2 text-white font-sans text-xs"
                >
                  <option value="0_NAO_DESONERADA">0 - Não Aplicável / Folha Integral (20% CPP)</option>
                  <option value="1_TOTALMENTE_DESONERADA">1 - Empresa com Desoneração Total da Folha (100% CPRB)</option>
                  <option value="2_PARCIALMENTE_DESONERADA">2 - Empresa com Desoneração Parcial / Atividades Mistas (Fator de Redução)</option>
                </select>
              </div>

              {indicativoDeson === '2_PARCIALMENTE_DESONERADA' && (
                <>
                  <div>
                    <label className="block text-zinc-400 mb-1">Receita Atividades Desoneradas (R$):</label>
                    <input
                      type="number"
                      step="0.01"
                      value={recDesonerada}
                      onChange={e => setRecDesonerada(parseFloat(e.target.value) || 0)}
                      className="w-full bg-[#242424] border border-zinc-700 rounded p-2 text-white font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1">Receita Bruta Total da Empresa (R$):</label>
                    <input
                      type="number"
                      step="0.01"
                      value={recTotal}
                      onChange={e => setRecTotal(parseFloat(e.target.value) || 0)}
                      className="w-full bg-[#242424] border border-zinc-700 rounded p-2 text-white font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1">Fator de Redução Calculado:</label>
                    <div className="bg-[#2a2a2a] border border-zinc-700 rounded p-2 text-amber-400 font-mono font-bold text-sm">
                      {recTotal > 0 ? ((recDesonerada / recTotal) * 100).toFixed(2) : 0}%
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* QUADRO DE IMPACTO NA FOLHA */}
            <div className="p-4 bg-[#202020] rounded-lg border border-zinc-700 space-y-3">
              <div className="font-semibold text-white flex items-center space-x-2">
                <BadgeAlert className="w-4 h-4 text-emerald-400" />
                <span>Demonstrativo do Impacto na Contribuição Previdenciária Patronal (CPP)</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-zinc-300">
                <div className="p-3 bg-[#262626] rounded border border-zinc-700">
                  <span className="text-zinc-500 block text-[11px]">Alíquota Patronal Padrão:</span>
                  <strong className="text-white text-sm font-mono">20,00%</strong>
                </div>
                <div className="p-3 bg-[#262626] rounded border border-zinc-700">
                  <span className="text-zinc-500 block text-[11px]">Percentual de Redução:</span>
                  <strong className="text-amber-400 text-sm font-mono">
                    {indicativoDeson === '1_TOTALMENTE_DESONERADA' ? '100,00%' : indicativoDeson === '2_PARCIALMENTE_DESONERADA' && recTotal > 0 ? `${((recDesonerada / recTotal) * 100).toFixed(2)}%` : '0,00%'}
                  </strong>
                </div>
                <div className="p-3 bg-emerald-950/20 rounded border border-emerald-500/30">
                  <span className="text-emerald-400 block text-[11px]">Alíquota Efetiva na Folha:</span>
                  <strong className="text-emerald-300 text-sm font-mono font-bold">
                    {indicativoDeson === '1_TOTALMENTE_DESONERADA' ? '0,00%' : indicativoDeson === '2_PARCIALMENTE_DESONERADA' && recTotal > 0 ? `${(20.0 * (1 - (recDesonerada / recTotal))).toFixed(2)}%` : '20,00%'}
                  </strong>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-zinc-800">
              <button
                onClick={handleSalvarS1280}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold shadow flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Salvar Informações S-1280</span>
              </button>
            </div>
          </div>
        )}

        {/* ABA 4: DEMONSTRATIVO OFICIAL A4 */}
        {activeTab === 'DEMONSTRATIVO_A4' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-[#181818] p-3 rounded-lg border border-zinc-800 text-xs">
              <div className="flex items-center space-x-2">
                <Printer className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-white">Demonstrativo de Apuração da Produção Rural e CPRB (Modelo A4)</span>
              </div>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center space-x-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Relatório</span>
              </button>
            </div>

            {/* FOLHA A4 TIMBRADA */}
            <div className="max-w-4xl mx-auto bg-white text-zinc-900 p-8 rounded shadow-2xl font-sans text-xs border border-zinc-300">
              <div className="text-center border-b-2 border-black pb-3 mb-4">
                <div className="font-bold text-sm uppercase">SISTEMA PÚBLICO DE ESCRITURAÇÃO DIGITAL - eSOCIAL</div>
                <div className="font-extrabold text-base uppercase text-zinc-800 mt-1">
                  DEMONSTRATIVO OFICIAL DE APURAÇÃO DO FUNRURAL E CPRB PROPORCIONAL
                </div>
                <div className="text-[11px] text-zinc-600 mt-0.5">
                  Eventos S-1260 e S-1280 | Competência: <strong>{competencia}</strong> | IN RFB nº 2.110/2022
                </div>
              </div>

              {/* DADOS DO CONTRIBUINTE */}
              <div className="border border-zinc-400 rounded p-3 mb-4">
                <div className="font-bold text-zinc-800 mb-1 text-[11px] uppercase">1. Identificação do Empregador / Produtor Rural</div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <span className="text-zinc-500 block text-[10px]">Nome Empresarial:</span>
                    <strong className="text-zinc-900">INDÚSTRIA E COMÉRCIO CONTÁBIL STUDIO PRO S/A</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">CNPJ / CAEPF:</span>
                    <strong className="text-zinc-900 font-mono">12.345.678/0001-90</strong>
                  </div>
                </div>
              </div>

              {/* DEMONSTRATIVO FUNRURAL */}
              <div className="border border-zinc-400 rounded p-3 mb-4">
                <div className="font-bold text-zinc-800 mb-2 text-[11px] uppercase">2. Comercialização da Produção Rural (Evento S-1260)</div>
                <table className="w-full text-left text-xs mb-2">
                  <thead className="bg-zinc-100 border-b border-zinc-300 font-semibold text-zinc-700">
                    <tr>
                      <th className="p-1.5">Documento</th>
                      <th className="p-1.5">Adquirente</th>
                      <th className="p-1.5 text-right">Valor Produção</th>
                      <th className="p-1.5 text-right">Prev. (1,2%)</th>
                      <th className="p-1.5 text-right">GILRAT (0,1%)</th>
                      <th className="p-1.5 text-right">SENAR (0,2%)</th>
                      <th className="p-1.5 text-right">Total Funrural</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 font-mono">
                    {resumo?.rural.map(r => (
                      <tr key={r.id}>
                        <td className="p-1.5 font-sans">{r.numeroDocumentoNf}</td>
                        <td className="p-1.5 font-sans">{r.compradorNomeRazao}</td>
                        <td className="p-1.5 text-right font-bold">{formatBRL(r.valorBrutoProducaoBRL)}</td>
                        <td className="p-1.5 text-right">{formatBRL(r.valorPrevidenciaFunruralBRL)}</td>
                        <td className="p-1.5 text-right">{formatBRL(r.valorGilratRuralBRL)}</td>
                        <td className="p-1.5 text-right">{formatBRL(r.valorSenarRuralBRL)}</td>
                        <td className="p-1.5 text-right font-bold text-emerald-800">{formatBRL(r.totalContribuicaoDevidaBRL)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-zinc-100 font-bold border-t border-zinc-300">
                    <tr>
                      <td colSpan={2} className="p-1.5 text-right">TOTAL GERAL:</td>
                      <td className="p-1.5 text-right font-mono">{formatBRL(resumo?.totalValorProducaoRuralBRL || 0)}</td>
                      <td colSpan={3} className="p-1.5"></td>
                      <td className="p-1.5 text-right font-mono text-emerald-800">{formatBRL(resumo?.totalFunruralRecolherBRL || 0)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* DEMONSTRATIVO S-1280 */}
              <div className="border border-zinc-400 rounded p-3 mb-6">
                <div className="font-bold text-zinc-800 mb-2 text-[11px] uppercase">3. Memória de Cálculo CPRB Proporcional (Evento S-1280)</div>
                <div className="grid grid-cols-2 gap-4 text-zinc-800">
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Indicativo de Desoneração:</span>
                    <strong>{resumo?.infoComplementar.indicativoDesoneracaoCprb}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Fator de Proporcionalidade:</span>
                    <strong className="font-mono text-emerald-800">
                      {((resumo?.infoComplementar.fatorProporcionalidadeReducao || 0) * 100).toFixed(4)}%
                    </strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Receita Desonerada / Receita Total:</span>
                    <span className="font-mono">
                      {formatBRL(resumo?.infoComplementar.receitaBrutaAtividadesDesoneradasBRL || 0)} / {formatBRL(resumo?.infoComplementar.receitaBrutaTotalEmpresaBRL || 0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Alíquota Efetiva da Folha (CPP):</span>
                    <strong className="font-mono text-emerald-800 text-sm">
                      {(resumo?.infoComplementar.reducaoAliquotaPatronalCalculada || 20).toFixed(2)}%
                    </strong>
                  </div>
                </div>
              </div>

              {/* ASSINATURAS */}
              <div className="grid grid-cols-2 gap-8 text-center pt-8 border-t border-zinc-300">
                <div>
                  <div className="border-b border-zinc-500 w-3/4 mx-auto mb-1"></div>
                  <div className="text-[11px] font-bold text-zinc-800">EMPREGADOR / PRODUTOR RURAL</div>
                  <div className="text-[10px] text-zinc-500">Responsável Tributário</div>
                </div>
                <div>
                  <div className="border-b border-zinc-500 w-3/4 mx-auto mb-1"></div>
                  <div className="text-[11px] font-bold text-zinc-800">RESPONSÁVEL TÉCNICO CONTÁBIL</div>
                  <div className="text-[10px] text-zinc-500">CRC Habilitado</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 5: XML PREVIEW */}
        {activeTab === 'XML_PREVIEW' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-[#181818] p-3 rounded-lg border border-zinc-800 text-xs">
              <div className="flex items-center space-x-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-white">{xmlTitulo || 'Visualizador XML eSocial'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(xmlVisualizacao);
                    setFeedback({ tipo: 'sucesso', texto: 'XML copiado com sucesso.' });
                  }}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-xs flex items-center space-x-1.5 border border-zinc-700"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar XML</span>
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([xmlVisualizacao], { type: 'application/xml' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `eSocial_${competencia}.xml`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar .xml</span>
                </button>
              </div>
            </div>

            <div className="bg-[#141414] rounded-lg border border-zinc-800 p-4 overflow-auto max-h-[500px]">
              <pre className="text-xs font-mono text-emerald-300 leading-relaxed whitespace-pre-wrap">
                {xmlVisualizacao || 'Selecione um evento ou clique em "Gerar XML" para visualizar o arquivo oficial.'}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* MODAL NOVO RURAL S-1260 */}
      {modalNovoRural && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#181818] border border-zinc-700 rounded-lg max-w-xl w-full p-6 space-y-4 text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <span>Nova Comercialização da Produção Rural (S-1260)</span>
              </h3>
              <button onClick={() => setModalNovoRural(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-zinc-400 mb-1">Tipo de Comercialização:</label>
                <select
                  value={formTipoComerc}
                  onChange={e => {
                    const val = e.target.value as TipoComercializacaoRuralS1260;
                    setFormTipoComerc(val);
                    if (val === '1_ADQUIRENTE_PJ') {
                      setFormRespRecolhimento('SUB_ROGAÇÃO_ADQUIRENTE');
                    } else {
                      setFormRespRecolhimento('PRODUTOR_TITULAR');
                    }
                  }}
                  className="w-full bg-[#242424] border border-zinc-700 rounded p-2 text-white font-sans"
                >
                  <option value="1_ADQUIRENTE_PJ">1 - Venda para PJ (Sub-rogação adquirente)</option>
                  <option value="2_CONSUMIDOR_PF">2 - Venda no varejo a Consumidor PF (Recolhimento pelo Produtor)</option>
                  <option value="3_EXPORTACAO">3 - Exportação direta de produtos agropecuários (Isento)</option>
                  <option value="7_PRODUTOR_RURAL_PF">7 - Venda para outro Produtor Rural PF</option>
                  <option value="8_INTERMEDIARIO_PF">8 - Venda por intermediário PF</option>
                  <option value="9_PAA_ALIMENTOS">9 - Programa de Aquisição de Alimentos (PAA)</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Número do Documento / NFe:</label>
                <input
                  type="text"
                  value={formNumDoc}
                  onChange={e => setFormNumDoc(e.target.value)}
                  placeholder="Ex: NFe 10492"
                  className="w-full bg-[#242424] border border-zinc-700 rounded p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Data de Emissão:</label>
                <input
                  type="date"
                  value={formDataEmissao}
                  onChange={e => setFormDataEmissao(e.target.value)}
                  className="w-full bg-[#242424] border border-zinc-700 rounded p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Nome / Razão do Comprador:</label>
                <input
                  type="text"
                  value={formCompradorNome}
                  onChange={e => setFormCompradorNome(e.target.value)}
                  placeholder="Nome ou Cooperativa"
                  className="w-full bg-[#242424] border border-zinc-700 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">CPF ou CNPJ do Comprador:</label>
                <input
                  type="text"
                  value={formCompradorCpfCnpj}
                  onChange={e => setFormCompradorCpfCnpj(e.target.value)}
                  placeholder="00.000.000/0000-00"
                  className="w-full bg-[#242424] border border-zinc-700 rounded p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Valor Bruto da Produção (R$):</label>
                <input
                  type="number"
                  step="0.01"
                  value={formValorBruto}
                  onChange={e => setFormValorBruto(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#242424] border border-zinc-700 rounded p-2 text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Responsável pelo Recolhimento:</label>
                <input
                  type="text"
                  readOnly
                  value={formRespRecolhimento}
                  className="w-full bg-[#202020] border border-zinc-700 rounded p-2 text-zinc-400 font-sans"
                />
              </div>
            </div>

            {/* PREVISÃO DE ENCARGOS */}
            <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded flex justify-between">
              <div>
                <span className="text-zinc-400 block text-[10px]">Previdência (1,2%):</span>
                <strong className="text-emerald-300 font-mono">{formatBRL(formValorBruto * 0.012)}</strong>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px]">GILRAT (0,1%):</span>
                <strong className="text-emerald-300 font-mono">{formatBRL(formValorBruto * 0.001)}</strong>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px]">SENAR (0,2%):</span>
                <strong className="text-emerald-300 font-mono">{formatBRL(formValorBruto * 0.002)}</strong>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px]">Total Funrural (1,5%):</span>
                <strong className="text-white font-mono font-bold">{formatBRL(formValorBruto * 0.015)}</strong>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-zinc-800">
              <button
                onClick={() => setModalNovoRural(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvarS1260}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded text-xs shadow flex items-center space-x-1"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Salvar Venda Rural</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
