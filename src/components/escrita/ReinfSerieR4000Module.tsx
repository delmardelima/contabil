import React, { useState, useEffect } from 'react';
import {
  Receipt,
  FileCode,
  DollarSign,
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
  UserCheck,
  CreditCard,
  Hash,
  Filter,
  ArrowRight,
  Landmark,
  BadgeAlert,
  FileSpreadsheet
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  ItemRetencaoReinfSerieR4000,
  ResumoReinfSerieR4000,
  TipoRetencaoReinf4000
} from '../../types/contabil';

interface ReinfSerieR4000Props {
  empresaId?: number;
}

export const ReinfSerieR4000Module: React.FC<ReinfSerieR4000Props> = ({ empresaId = 1 }) => {
  const [competencia, setCompetencia] = useState<string>('2026-03');
  const [activeTab, setActiveTab] = useState<'LISTA' | 'NOVO_EVENTO' | 'INFORME_A4' | 'APURACAO_DCTFWEB' | 'XML_PREVIEW'>('LISTA');
  const [resumo, setResumo] = useState<ResumoReinfSerieR4000 | null>(null);
  const [selectedItem, setSelectedItem] = useState<ItemRetencaoReinfSerieR4000 | null>(null);
  const [xmlVisualizacao, setXmlVisualizacao] = useState<string>('');
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');
  const [termoBusca, setTermoBusca] = useState<string>('');
  const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'info'; texto: string } | null>(null);

  // Formulário de Novo Evento R-4000
  const [formTipo, setFormTipo] = useState<TipoRetencaoReinf4000>('R4020_PJ_SERVICO');
  const [formDataPagto, setFormDataPagto] = useState<string>('2026-03-15');
  const [formNatureza, setFormNatureza] = useState<string>('15001');
  const [formBenefCpfCnpj, setFormBenefCpfCnpj] = useState<string>('');
  const [formBenefRazao, setFormBenefRazao] = useState<string>('');
  const [formNumDoc, setFormNumDoc] = useState<string>('');
  const [formValorBruto, setFormValorBruto] = useState<number>(0);
  const [formBaseCalculo, setFormBaseCalculo] = useState<number>(0);
  const [formAliqIrrf, setFormAliqIrrf] = useState<number>(1.5);
  const [formValorIrrf, setFormValorIrrf] = useState<number>(0);
  const [formAliqCsll, setFormAliqCsll] = useState<number>(1.0);
  const [formValorCsll, setFormValorCsll] = useState<number>(0);
  const [formAliqPis, setFormAliqPis] = useState<number>(0.65);
  const [formValorPis, setFormValorPis] = useState<number>(0);
  const [formAliqCofins, setFormAliqCofins] = useState<number>(3.0);
  const [formValorCofins, setFormValorCofins] = useState<number>(0);
  const [formCodDarf, setFormCodDarf] = useState<string>('5952 / 1708');

  // Recarrega os dados ao alterar a competência ou empresa
  const carregarDados = () => {
    const dados = dbService.getReinfSerieR4000(empresaId, competencia);
    setResumo(dados);
    if (dados.itens.length > 0 && !selectedItem) {
      setSelectedItem(dados.itens[0]);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [empresaId, competencia]);

  // Recálculo automático dos tributos ao alterar valores no formulário
  const handleRecalcularNovoEvento = (
    tipo: TipoRetencaoReinf4000,
    bruto: number,
    base: number,
    aliqIr: number,
    aliqCs: number,
    aliqP: number,
    aliqCof: number
  ) => {
    let irrf = 0;
    let csll = 0;
    let pis = 0;
    let cofins = 0;
    let darf = '5952 / 1708';

    if (tipo === 'R4010_PF_PAGTO') {
      irrf = Math.round((base * (aliqIr / 100)) * 100) / 100;
      csll = 0;
      pis = 0;
      cofins = 0;
      darf = '0588';
    } else if (tipo === 'R4020_PJ_SERVICO') {
      irrf = Math.round((base * (aliqIr / 100)) * 100) / 100;
      csll = Math.round((base * (aliqCs / 100)) * 100) / 100;
      pis = Math.round((base * (aliqP / 100)) * 100) / 100;
      cofins = Math.round((base * (aliqCof / 100)) * 100) / 100;
      darf = irrf > 0 ? (csll > 0 ? '1708 / 5952' : '1708') : '5952';
    } else if (tipo === 'R4040_BENEFICIARIO_NAO_IDENTIFICADO') {
      irrf = Math.round((base * 0.35) * 100) / 100;
      csll = 0;
      pis = 0;
      cofins = 0;
      darf = '2362';
    } else if (tipo === 'R4080_AUTO_RETENCAO') {
      irrf = Math.round((base * (aliqIr / 100)) * 100) / 100;
      csll = 0;
      pis = 0;
      cofins = 0;
      darf = '8045';
    }

    setFormValorIrrf(irrf);
    setFormValorCsll(csll);
    setFormValorPis(pis);
    setFormValorCofins(cofins);
    setFormCodDarf(darf);
  };

  const handleMudarTipoEvento = (tipo: TipoRetencaoReinf4000) => {
    setFormTipo(tipo);
    if (tipo === 'R4010_PF_PAGTO') {
      setFormNatureza('13001');
      setFormAliqIrrf(11.0);
      setFormAliqCsll(0);
      setFormAliqPis(0);
      setFormAliqCofins(0);
      handleRecalcularNovoEvento(tipo, formValorBruto, formBaseCalculo, 11.0, 0, 0, 0);
    } else if (tipo === 'R4020_PJ_SERVICO') {
      setFormNatureza('15001');
      setFormAliqIrrf(1.5);
      setFormAliqCsll(1.0);
      setFormAliqPis(0.65);
      setFormAliqCofins(3.0);
      handleRecalcularNovoEvento(tipo, formValorBruto, formBaseCalculo, 1.5, 1.0, 0.65, 3.0);
    } else if (tipo === 'R4040_BENEFICIARIO_NAO_IDENTIFICADO') {
      setFormNatureza('19001');
      setFormAliqIrrf(35.0);
      setFormAliqCsll(0);
      setFormAliqPis(0);
      setFormAliqCofins(0);
      setFormBenefRazao('BENEFICIÁRIO NÃO IDENTIFICADO');
      setFormBenefCpfCnpj('00.000.000/0000-00');
      handleRecalcularNovoEvento(tipo, formValorBruto, formBaseCalculo, 35.0, 0, 0, 0);
    } else if (tipo === 'R4080_AUTO_RETENCAO') {
      setFormNatureza('17001');
      setFormAliqIrrf(1.5);
      setFormAliqCsll(0);
      setFormAliqPis(0);
      setFormAliqCofins(0);
      handleRecalcularNovoEvento(tipo, formValorBruto, formBaseCalculo, 1.5, 0, 0, 0);
    }
  };

  const handleSalvarNovoEvento = () => {
    if (!formNumDoc || formValorBruto <= 0) {
      alert('Preencha o número do documento fiscal e o valor bruto.');
      return;
    }

    const totalRetencoes = formValorIrrf + formValorCsll + formValorPis + formValorCofins;
    const novoItem: ItemRetencaoReinfSerieR4000 = {
      id: `reinf-${Date.now()}`,
      empresaId,
      competencia,
      dataPagamentoFatoGerador: formDataPagto,
      tipoEvento: formTipo,
      naturezaRendimento: formNatureza,
      beneficiarioCpfCnpj: formBenefCpfCnpj,
      beneficiarioRazaoSocial: formBenefRazao || 'BENEFICIÁRIO NÃO IDENTIFICADO',
      numeroDocumentoFiscal: formNumDoc,
      valorBrutoRendimentoBRL: formValorBruto,
      baseCalculoRetencaoBRL: formBaseCalculo || formValorBruto,
      aliquotaIrrf: formAliqIrrf,
      valorIrrfRetidoBRL: formValorIrrf,
      aliquotaCsll: formAliqCsll,
      valorCsllRetidoBRL: formValorCsll,
      aliquotaPis: formAliqPis,
      valorPisRetidoBRL: formValorPis,
      aliquotaCofins: formAliqCofins,
      valorCofinsRetidoBRL: formValorCofins,
      totalRetencoesFonteBRL: totalRetencoes,
      codigoReceitaDarf: formCodDarf,
      statusEnvio: 'PENDENTE'
    };

    const res = dbService.salvarItemReinfR4000(novoItem);
    if (res.sucesso) {
      setFeedback({ tipo: 'sucesso', texto: res.mensagem });
      carregarDados();
      setSelectedItem(novoItem);
      setActiveTab('LISTA');
    }
  };

  const handleGerarXml = (item: ItemRetencaoReinfSerieR4000) => {
    const res = dbService.gerarXmlReinfR4000(item.id);
    if (res.sucesso) {
      setXmlVisualizacao(res.xml);
      setSelectedItem(item);
      setActiveTab('XML_PREVIEW');
      setFeedback({ tipo: 'info', texto: `XML do evento ${item.tipoEvento} gerado com sucesso.` });
    }
  };

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Itens filtrados
  const itensFiltrados = (resumo?.itens || []).filter(item => {
    const matchTipo = filtroTipo === 'TODOS' || item.tipoEvento === filtroTipo;
    const matchTermo =
      item.beneficiarioRazaoSocial.toLowerCase().includes(termoBusca.toLowerCase()) ||
      item.beneficiarioCpfCnpj.includes(termoBusca) ||
      item.numeroDocumentoFiscal.toLowerCase().includes(termoBusca.toLowerCase());
    return matchTipo && matchTermo;
  });

  return (
    <div className="flex flex-col h-full bg-[#121212] text-zinc-100 overflow-hidden font-sans">
      {/* HEADER DA CENTRAL EFD-REINF R-4000 */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#181818]">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-white">EFD-Reinf Série R-4000</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-medium">
                IN RFB 2.043/2021 & DCTFWeb
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Central de Retenções na Fonte: R-4010 (PF), R-4020 (PJ), R-4040 (Não Identificado) e R-4080 (Auto-Retenção)
            </p>
          </div>
        </div>

        {/* CONTROLES: COMPETÊNCIA E AÇÕES */}
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
            onClick={() => setActiveTab('NOVO_EVENTO')}
            className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-semibold shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Novo Evento R-4000</span>
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
      <div className="grid grid-cols-6 gap-3 px-6 py-3 bg-[#161616] border-b border-zinc-800 text-xs">
        <div className="p-3 bg-[#1e1e1e] rounded-lg border border-zinc-800">
          <div className="text-zinc-400 flex items-center justify-between">
            <span>Rendimento Bruto</span>
            <DollarSign className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-base font-bold text-white mt-1">
            {formatBRL(resumo?.totalRendimentosBrutosBRL || 0)}
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">
            {resumo?.itens.length || 0} eventos apurados
          </div>
        </div>

        <div className="p-3 bg-[#1e1e1e] rounded-lg border border-zinc-800">
          <div className="text-zinc-400 flex items-center justify-between">
            <span>IRRF Retido</span>
            <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded text-[10px]">Cód 1708/0588</span>
          </div>
          <div className="text-base font-bold text-amber-400 mt-1">
            {formatBRL(resumo?.totalIrrfRetidoBRL || 0)}
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">
            IRRF Fonte Fatos Geradores
          </div>
        </div>

        <div className="p-3 bg-[#1e1e1e] rounded-lg border border-zinc-800">
          <div className="text-zinc-400 flex items-center justify-between">
            <span>CSLL Retida (1,0%)</span>
            <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded text-[10px]">CSRF</span>
          </div>
          <div className="text-base font-bold text-emerald-400 mt-1">
            {formatBRL(resumo?.totalCsllRetidoBRL || 0)}
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">
            Contribuição Social 1%
          </div>
        </div>

        <div className="p-3 bg-[#1e1e1e] rounded-lg border border-zinc-800">
          <div className="text-zinc-400 flex items-center justify-between">
            <span>PIS Retido (0,65%)</span>
            <span className="px-1.5 py-0.2 bg-purple-500/20 text-purple-300 rounded text-[10px]">CSRF</span>
          </div>
          <div className="text-base font-bold text-purple-400 mt-1">
            {formatBRL(resumo?.totalPisRetidoBRL || 0)}
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">
            PIS/PASEP Lei 10.833
          </div>
        </div>

        <div className="p-3 bg-[#1e1e1e] rounded-lg border border-zinc-800">
          <div className="text-zinc-400 flex items-center justify-between">
            <span>COFINS Retida (3,0%)</span>
            <span className="px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 rounded text-[10px]">CSRF</span>
          </div>
          <div className="text-base font-bold text-indigo-400 mt-1">
            {formatBRL(resumo?.totalCofinsRetidoBRL || 0)}
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">
            COFINS Lei 10.833
          </div>
        </div>

        <div className="p-3 bg-blue-950/30 rounded-lg border border-blue-500/30">
          <div className="text-blue-300 flex items-center justify-between font-semibold">
            <span>Total Retenções DARF</span>
            <Landmark className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-base font-extrabold text-blue-300 mt-1">
            {formatBRL(resumo?.totalGeralRetidoBRL || 0)}
          </div>
          <div className="text-[10px] text-blue-400/80 mt-1">
            Integrado à DCTFWeb
          </div>
        </div>
      </div>

      {/* SUB-HEADER: TABS DE NAVEGAÇÃO */}
      <div className="flex items-center px-6 border-b border-zinc-800 bg-[#141414] text-xs">
        <button
          onClick={() => setActiveTab('LISTA')}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium transition-colors ${
            activeTab === 'LISTA'
              ? 'border-blue-500 text-blue-400 bg-zinc-800/40'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Eventos da Série R-4000 ({resumo?.itens.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('NOVO_EVENTO')}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium transition-colors ${
            activeTab === 'NOVO_EVENTO'
              ? 'border-blue-500 text-blue-400 bg-zinc-800/40'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Cadastrar Retenção</span>
        </button>

        <button
          onClick={() => setActiveTab('INFORME_A4')}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium transition-colors ${
            activeTab === 'INFORME_A4'
              ? 'border-blue-500 text-blue-400 bg-zinc-800/40'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Informe de Rendimentos A4</span>
        </button>

        <button
          onClick={() => setActiveTab('APURACAO_DCTFWEB')}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium transition-colors ${
            activeTab === 'APURACAO_DCTFWEB'
              ? 'border-blue-500 text-blue-400 bg-zinc-800/40'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>DARF / DCTFWeb</span>
        </button>

        <button
          onClick={() => setActiveTab('XML_PREVIEW')}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium transition-colors ${
            activeTab === 'XML_PREVIEW'
              ? 'border-blue-500 text-blue-400 bg-zinc-800/40'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>XML EFD-Reinf v2.01.02</span>
        </button>
      </div>

      {/* ÁREA DE CONTEÚDO PRINCIPAL */}
      <div className="flex-1 overflow-auto p-6 bg-[#121212]">
        {/* ABA 1: LISTAGEM DE EVENTOS R-4000 */}
        {activeTab === 'LISTA' && (
          <div className="space-y-4">
            {/* BARRA DE FILTROS */}
            <div className="flex items-center justify-between gap-4 bg-[#181818] p-3 rounded-lg border border-zinc-800">
              <div className="flex items-center space-x-3 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Buscar por beneficiário, CPF/CNPJ ou documento..."
                    value={termoBusca}
                    onChange={e => setTermoBusca(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-[#242424] border border-zinc-700 rounded-md text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-zinc-400" />
                  <select
                    value={filtroTipo}
                    onChange={e => setFiltroTipo(e.target.value)}
                    className="bg-[#242424] border border-zinc-700 text-xs text-white rounded-md px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
                  >
                    <option value="TODOS">Todos os Eventos</option>
                    <option value="R4010_PF_PAGTO">R-4010: PF Pagamentos</option>
                    <option value="R4020_PJ_SERVICO">R-4020: PJ Serviços</option>
                    <option value="R4040_BENEFICIARIO_NAO_IDENTIFICADO">R-4040: Não Identificado</option>
                    <option value="R4080_AUTO_RETENCAO">R-4080: Auto-Retenção</option>
                  </select>
                </div>
              </div>

              <div className="text-xs text-zinc-400">
                Mostrando <strong className="text-white">{itensFiltrados.length}</strong> de <strong className="text-white">{resumo?.itens.length || 0}</strong> eventos
              </div>
            </div>

            {/* TABELA DE EVENTOS */}
            <div className="bg-[#181818] rounded-lg border border-zinc-800 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#202020] text-zinc-400 border-b border-zinc-800 select-none">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Evento / Natureza</th>
                    <th className="py-2.5 px-4 font-semibold">Beneficiário</th>
                    <th className="py-2.5 px-4 font-semibold">Documento / Fato Gerador</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Rendimento Bruto</th>
                    <th className="py-2.5 px-4 font-semibold text-right">IRRF Retido</th>
                    <th className="py-2.5 px-4 font-semibold text-right">CSRF (4,65%)</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Total Retido</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Status / DARF</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono">
                  {itensFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-zinc-500 font-sans">
                        Nenhum evento da Série R-4000 encontrado para a competência {competencia}.
                      </td>
                    </tr>
                  ) : (
                    itensFiltrados.map(item => {
                      const csrfTotal = item.valorCsllRetidoBRL + item.valorPisRetidoBRL + item.valorCofinsRetidoBRL;
                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-zinc-800/40 transition-colors cursor-pointer ${
                            selectedItem?.id === item.id ? 'bg-blue-950/20' : ''
                          }`}
                          onClick={() => setSelectedItem(item)}
                        >
                          <td className="py-3 px-4 font-sans">
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                                item.tipoEvento === 'R4010_PF_PAGTO'
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                  : item.tipoEvento === 'R4020_PJ_SERVICO'
                                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                  : item.tipoEvento === 'R4040_BENEFICIARIO_NAO_IDENTIFICADO'
                                  ? 'bg-red-500/10 text-red-400 border-red-500/30'
                                  : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                              }`}>
                                {item.tipoEvento.split('_')[0]}
                              </span>
                              <span className="text-[11px] text-zinc-400">Nat: {item.naturezaRendimento}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-sans">
                            <div className="font-medium text-white truncate max-w-xs">
                              {item.beneficiarioRazaoSocial}
                            </div>
                            <div className="text-[11px] text-zinc-400 font-mono">
                              {item.beneficiarioCpfCnpj}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-sans">
                            <div className="text-zinc-200">{item.numeroDocumentoFiscal}</div>
                            <div className="text-[11px] text-zinc-400">{item.dataPagamentoFatoGerador}</div>
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-zinc-200">
                            {formatBRL(item.valorBrutoRendimentoBRL)}
                          </td>
                          <td className="py-3 px-4 text-right text-amber-400">
                            {formatBRL(item.valorIrrfRetidoBRL)}
                            {item.aliquotaIrrf > 0 && (
                              <div className="text-[10px] text-zinc-400">({item.aliquotaIrrf}%)</div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right text-emerald-400">
                            {formatBRL(csrfTotal)}
                            {csrfTotal > 0 && (
                              <div className="text-[10px] text-zinc-400">(4,65%)</div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-white">
                            {formatBRL(item.totalRetencoesFonteBRL)}
                          </td>
                          <td className="py-3 px-4 text-center font-sans">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              DARF {item.codigoReceitaDarf}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-sans">
                            <div className="flex items-center justify-center space-x-1.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedItem(item);
                                  setActiveTab('INFORME_A4');
                                }}
                                title="Ver Informe de Rendimentos A4"
                                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleGerarXml(item);
                                }}
                                title="Gerar e Visualizar XML Reinf"
                                className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-zinc-700 rounded transition-colors"
                              >
                                <FileCode className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* PAINEL INFORMATIVO DO EVENTO SELECIONADO */}
            {selectedItem && (
              <div className="p-4 bg-[#181818] rounded-lg border border-zinc-800 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-white">
                      Detalhamento do Evento: {selectedItem.tipoEvento} | Beneficiário: {selectedItem.beneficiarioRazaoSocial}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setActiveTab('INFORME_A4');
                      }}
                      className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-[11px] flex items-center space-x-1 border border-zinc-700"
                    >
                      <Printer className="w-3.5 h-3.5 mr-1" />
                      <span>Emitir Informe A4</span>
                    </button>
                    <button
                      onClick={() => handleGerarXml(selectedItem)}
                      className="px-2.5 py-1 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 rounded text-[11px] flex items-center space-x-1 border border-blue-500/40"
                    >
                      <FileCode className="w-3.5 h-3.5 mr-1" />
                      <span>Exportar XML</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 text-zinc-300">
                  <div>
                    <span className="text-zinc-500 block text-[11px]">Natureza do Rendimento:</span>
                    <strong className="text-white font-mono">{selectedItem.naturezaRendimento}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[11px]">Base de Cálculo Retenção:</span>
                    <strong className="text-white font-mono">{formatBRL(selectedItem.baseCalculoRetencaoBRL)}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[11px]">Código da Receita DARF:</span>
                    <strong className="text-white font-mono">{selectedItem.codigoReceitaDarf}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[11px]">Status EFD-Reinf:</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold">
                      {selectedItem.statusEnvio}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ABA 2: CADASTRO DE NOVO EVENTO R-4000 */}
        {activeTab === 'NOVO_EVENTO' && (
          <div className="max-w-4xl mx-auto bg-[#181818] p-6 rounded-lg border border-zinc-800 shadow-sm space-y-6">
            <div className="border-b border-zinc-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <PlusCircle className="w-5 h-5 text-blue-400" />
                <span>Lançamento de Retenção EFD-Reinf Série R-4000</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Lançamento conforme a Instrução Normativa RFB nº 2.043/2021 com cálculo automático de IRRF, CSLL, PIS e COFINS.
              </p>
            </div>

            {/* SELEÇÃO DO TIPO DE EVENTO */}
            <div className="grid grid-cols-4 gap-3">
              <div
                onClick={() => handleMudarTipoEvento('R4010_PF_PAGTO')}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  formTipo === 'R4010_PF_PAGTO'
                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-300'
                    : 'bg-[#202020] border-zinc-700 text-zinc-400 hover:border-zinc-600'
                }`}
              >
                <div className="font-bold text-xs">R-4010: Pessoa Física</div>
                <div className="text-[10px] mt-1 text-zinc-400">Aluguéis, RPA Autônomo, Comissões e Prêmios</div>
              </div>

              <div
                onClick={() => handleMudarTipoEvento('R4020_PJ_SERVICO')}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  formTipo === 'R4020_PJ_SERVICO'
                    ? 'bg-blue-500/10 border-blue-500/50 text-blue-300'
                    : 'bg-[#202020] border-zinc-700 text-zinc-400 hover:border-zinc-600'
                }`}
              >
                <div className="font-bold text-xs">R-4020: PJ Serviços</div>
                <div className="text-[10px] mt-1 text-zinc-400">Serviços Profissionais, TI, Limpeza, CSRF 4,65% e IRRF</div>
              </div>

              <div
                onClick={() => handleMudarTipoEvento('R4040_BENEFICIARIO_NAO_IDENTIFICADO')}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  formTipo === 'R4040_BENEFICIARIO_NAO_IDENTIFICADO'
                    ? 'bg-red-500/10 border-red-500/50 text-red-300'
                    : 'bg-[#202020] border-zinc-700 text-zinc-400 hover:border-zinc-600'
                }`}
              >
                <div className="font-bold text-xs">R-4040: Não Identificado</div>
                <div className="text-[10px] mt-1 text-zinc-400">Pagamento sem causa/identificação (IRRF 35% Art. 675 RIR)</div>
              </div>

              <div
                onClick={() => handleMudarTipoEvento('R4080_AUTO_RETENCAO')}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  formTipo === 'R4080_AUTO_RETENCAO'
                    ? 'bg-purple-500/10 border-purple-500/50 text-purple-300'
                    : 'bg-[#202020] border-zinc-700 text-zinc-400 hover:border-zinc-600'
                }`}
              >
                <div className="font-bold text-xs">R-4080: Auto-Retenção</div>
                <div className="text-[10px] mt-1 text-zinc-400">Cartões de Crédito, Agências de Publicidade (Art. 651 RIR)</div>
              </div>
            </div>

            {/* CAMPOS DO FORMULÁRIO */}
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Data Pagamento / Fato Gerador:</label>
                <input
                  type="date"
                  value={formDataPagto}
                  onChange={e => setFormDataPagto(e.target.value)}
                  className="w-full bg-[#242424] border border-zinc-700 rounded p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Natureza do Rendimento (Tab 01):</label>
                <input
                  type="text"
                  value={formNatureza}
                  onChange={e => setFormNatureza(e.target.value)}
                  placeholder="Ex: 15001, 13001, 17001"
                  className="w-full bg-[#242424] border border-zinc-700 rounded p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Número do Documento / NFS-e:</label>
                <input
                  type="text"
                  value={formNumDoc}
                  onChange={e => setFormNumDoc(e.target.value)}
                  placeholder="Ex: NFS-e 12480"
                  className="w-full bg-[#242424] border border-zinc-700 rounded p-2 text-white font-mono"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-zinc-400 mb-1">Razão Social / Nome do Beneficiário:</label>
                <input
                  type="text"
                  value={formBenefRazao}
                  onChange={e => setFormBenefRazao(e.target.value)}
                  placeholder="Nome completo ou Razão Social"
                  className="w-full bg-[#242424] border border-zinc-700 rounded p-2 text-white font-sans"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">CPF ou CNPJ do Beneficiário:</label>
                <input
                  type="text"
                  value={formBenefCpfCnpj}
                  onChange={e => setFormBenefCpfCnpj(e.target.value)}
                  placeholder="00.000.000/0000-00 ou 000.000.000-00"
                  className="w-full bg-[#242424] border border-zinc-700 rounded p-2 text-white font-mono"
                />
              </div>
            </div>

            {/* SEÇÃO DE CÁLCULO DE VALORES */}
            <div className="bg-[#202020] p-4 rounded-lg border border-zinc-700 space-y-4">
              <div className="text-xs font-semibold text-zinc-300 flex items-center justify-between border-b border-zinc-700 pb-2">
                <span>Memória de Cálculo de Retenções na Fonte</span>
                <span className="text-[11px] text-zinc-400">DARF Sugerido: <strong className="text-amber-400 font-mono">{formCodDarf}</strong></span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-zinc-400 mb-1">Valor Bruto do Rendimento (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formValorBruto}
                    onChange={e => {
                      const val = parseFloat(e.target.value) || 0;
                      setFormValorBruto(val);
                      setFormBaseCalculo(val);
                      handleRecalcularNovoEvento(formTipo, val, val, formAliqIrrf, formAliqCsll, formAliqPis, formAliqCofins);
                    }}
                    className="w-full bg-[#2a2a2a] border border-zinc-600 rounded p-2 text-white font-mono font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Base de Cálculo da Retenção (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formBaseCalculo}
                    onChange={e => {
                      const val = parseFloat(e.target.value) || 0;
                      setFormBaseCalculo(val);
                      handleRecalcularNovoEvento(formTipo, formValorBruto, val, formAliqIrrf, formAliqCsll, formAliqPis, formAliqCofins);
                    }}
                    className="w-full bg-[#2a2a2a] border border-zinc-600 rounded p-2 text-white font-mono"
                  />
                </div>
              </div>

              {/* GRIDS DE ALÍQUOTAS E VALORES CALCULADOS */}
              <div className="grid grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-[#262626] rounded border border-zinc-700">
                  <div className="text-zinc-400 flex items-center justify-between">
                    <span>IRRF</span>
                    <span className="font-mono text-amber-400">{formAliqIrrf}%</span>
                  </div>
                  <div className="mt-2 text-sm font-bold text-amber-400 font-mono">
                    {formatBRL(formValorIrrf)}
                  </div>
                </div>

                <div className="p-3 bg-[#262626] rounded border border-zinc-700">
                  <div className="text-zinc-400 flex items-center justify-between">
                    <span>CSLL Retida</span>
                    <span className="font-mono text-emerald-400">{formAliqCsll}%</span>
                  </div>
                  <div className="mt-2 text-sm font-bold text-emerald-400 font-mono">
                    {formatBRL(formValorCsll)}
                  </div>
                </div>

                <div className="p-3 bg-[#262626] rounded border border-zinc-700">
                  <div className="text-zinc-400 flex items-center justify-between">
                    <span>PIS Retido</span>
                    <span className="font-mono text-purple-400">{formAliqPis}%</span>
                  </div>
                  <div className="mt-2 text-sm font-bold text-purple-400 font-mono">
                    {formatBRL(formValorPis)}
                  </div>
                </div>

                <div className="p-3 bg-[#262626] rounded border border-zinc-700">
                  <div className="text-zinc-400 flex items-center justify-between">
                    <span>COFINS Retida</span>
                    <span className="font-mono text-indigo-400">{formAliqCofins}%</span>
                  </div>
                  <div className="mt-2 text-sm font-bold text-indigo-400 font-mono">
                    {formatBRL(formValorCofins)}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-950/20 rounded border border-blue-500/30 text-xs">
                <div>
                  <span className="text-zinc-400">Total Retido a Recolher via DARF:</span>
                  <div className="text-base font-extrabold text-blue-300 font-mono">
                    {formatBRL(formValorIrrf + formValorCsll + formValorPis + formValorCofins)}
                  </div>
                </div>
                <div>
                  <span className="text-zinc-400">Valor Líquido a Pagar ao Beneficiário:</span>
                  <div className="text-base font-extrabold text-emerald-300 font-mono">
                    {formatBRL(Math.max(0, formValorBruto - (formValorIrrf + formValorCsll + formValorPis + formValorCofins)))}
                  </div>
                </div>
              </div>
            </div>

            {/* BOTÕES DE AÇÃO */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-zinc-800">
              <button
                onClick={() => setActiveTab('LISTA')}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvarNovoEvento}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold shadow flex items-center space-x-1.5 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Salvar Evento EFD-Reinf</span>
              </button>
            </div>
          </div>
        )}

        {/* ABA 3: INFORME DE RENDIMENTOS TIMBRADO A4 */}
        {activeTab === 'INFORME_A4' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-[#181818] p-3 rounded-lg border border-zinc-800 text-xs">
              <div className="flex items-center space-x-2">
                <Printer className="w-4 h-4 text-blue-400" />
                <span className="font-semibold text-white">Comprovante de Rendimentos Pagos e de Retenção na Fonte (Modelo A4 Oficial)</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold flex items-center space-x-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Comprovante</span>
                </button>
              </div>
            </div>

            {/* FOLHA A4 TIMBRADA */}
            <div className="max-w-4xl mx-auto bg-white text-zinc-900 p-8 rounded shadow-2xl font-sans text-xs border border-zinc-300">
              {/* CABEÇALHO OFICIAL */}
              <div className="text-center border-b-2 border-black pb-3 mb-4">
                <div className="font-bold text-sm uppercase tracking-wide">
                  MINISTÉRIO DA FAZENDA - SECRETARIA DA RECEITA FEDERAL DO BRASIL
                </div>
                <div className="font-extrabold text-base uppercase text-zinc-800 mt-1">
                  COMPROVANTE DE RENDIMENTOS PAGOS E DE RETENÇÃO DE IMPOSTO DE RENDA E CONTRIBUIÇÕES NA FONTE
                </div>
                <div className="text-[11px] text-zinc-600 mt-0.5">
                  Ano-Calendário: <strong>2026</strong> | Instrução Normativa RFB nº 2.043/2021 e alterações
                </div>
              </div>

              {/* QUADRO 1: FONTE PAGADORA */}
              <div className="border border-zinc-400 rounded mb-4 overflow-hidden">
                <div className="bg-zinc-200 px-3 py-1 font-bold text-[11px] text-zinc-800 border-b border-zinc-400 uppercase">
                  1. Fonte Pagadora - Pessoa Jurídica
                </div>
                <div className="p-3 grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <span className="text-[10px] text-zinc-500 block">Nome Empresarial:</span>
                    <strong className="text-zinc-900 text-xs">INDÚSTRIA E COMÉRCIO CONTÁBIL STUDIO PRO S/A</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">CNPJ:</span>
                    <strong className="text-zinc-900 font-mono text-xs">12.345.678/0001-90</strong>
                  </div>
                </div>
              </div>

              {/* QUADRO 2: PESSOA BENEFICIÁRIA */}
              <div className="border border-zinc-400 rounded mb-4 overflow-hidden">
                <div className="bg-zinc-200 px-3 py-1 font-bold text-[11px] text-zinc-800 border-b border-zinc-400 uppercase">
                  2. Pessoa Física / Jurídica Beneficiária dos Rendimentos
                </div>
                <div className="p-3 grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <span className="text-[10px] text-zinc-500 block">Nome / Razão Social:</span>
                    <strong className="text-zinc-900 text-xs">{selectedItem?.beneficiarioRazaoSocial || 'Selecionar evento na lista'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">CPF / CNPJ:</span>
                    <strong className="text-zinc-900 font-mono text-xs">{selectedItem?.beneficiarioCpfCnpj || '00.000.000/0000-00'}</strong>
                  </div>
                </div>
              </div>

              {/* QUADRO 3: RENDIMENTOS TRIBUTÁVEIS E RETENÇÕES */}
              <div className="border border-zinc-400 rounded mb-4 overflow-hidden">
                <div className="bg-zinc-200 px-3 py-1 font-bold text-[11px] text-zinc-800 border-b border-zinc-400 uppercase">
                  3. Discriminação dos Rendimentos e Retenções na Fonte
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-100 border-b border-zinc-300">
                    <tr>
                      <th className="py-2 px-3 font-semibold text-zinc-700">Descrição do Rendimento</th>
                      <th className="py-2 px-3 font-semibold text-zinc-700">Fato Gerador / Doc</th>
                      <th className="py-2 px-3 font-semibold text-right text-zinc-700">Rendimento Bruto</th>
                      <th className="py-2 px-3 font-semibold text-right text-zinc-700">IRRF Retido</th>
                      <th className="py-2 px-3 font-semibold text-right text-zinc-700">CSRF (CSLL/PIS/COFINS)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 font-mono">
                    <tr>
                      <td className="py-2 px-3 font-sans">
                        {selectedItem?.tipoEvento === 'R4010_PF_PAGTO'
                          ? 'Rendimentos de Trabalho Não Assalariado / Aluguéis'
                          : selectedItem?.tipoEvento === 'R4020_PJ_SERVICO'
                          ? 'Serviços Prestados por Pessoa Jurídica'
                          : selectedItem?.tipoEvento === 'R4040_BENEFICIARIO_NAO_IDENTIFICADO'
                          ? 'Pagamentos a Beneficiários Não Identificados'
                          : 'Comissões sobre Vendas com Cartões de Crédito'}
                        <span className="block text-[10px] text-zinc-500 font-mono">Natureza: {selectedItem?.naturezaRendimento}</span>
                      </td>
                      <td className="py-2 px-3 font-sans">
                        {selectedItem?.numeroDocumentoFiscal}
                        <span className="block text-[10px] text-zinc-500 font-mono">{selectedItem?.dataPagamentoFatoGerador}</span>
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-zinc-900">
                        {formatBRL(selectedItem?.valorBrutoRendimentoBRL || 0)}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-amber-700">
                        {formatBRL(selectedItem?.valorIrrfRetidoBRL || 0)}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-700">
                        {formatBRL((selectedItem?.valorCsllRetidoBRL || 0) + (selectedItem?.valorPisRetidoBRL || 0) + (selectedItem?.valorCofinsRetidoBRL || 0))}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-zinc-100 border-t border-zinc-300 font-semibold text-zinc-800">
                    <tr>
                      <td colSpan={2} className="py-2 px-3 text-right">TOTAIS APURADOS:</td>
                      <td className="py-2 px-3 text-right font-mono font-bold">
                        {formatBRL(selectedItem?.valorBrutoRendimentoBRL || 0)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-amber-800">
                        {formatBRL(selectedItem?.valorIrrfRetidoBRL || 0)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-emerald-800">
                        {formatBRL((selectedItem?.valorCsllRetidoBRL || 0) + (selectedItem?.valorPisRetidoBRL || 0) + (selectedItem?.valorCofinsRetidoBRL || 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* QUADRO 4: INFORMAÇÕES COMPLEMENTARES */}
              <div className="border border-zinc-400 rounded mb-6 p-3">
                <div className="text-[10px] font-bold text-zinc-800 uppercase mb-1">
                  4. Informações Complementares
                </div>
                <p className="text-[11px] text-zinc-600 leading-relaxed font-sans">
                  Valores apurados e retidos na fonte nos termos da legislação federal vigente (Instrução Normativa RFB nº 2.043/2021).
                  Os valores declarados foram transmitidos ao Sistema Público de Escrituração Digital (EFD-Reinf) sob o evento{' '}
                  <strong className="text-zinc-800">{selectedItem?.tipoEvento}</strong> e incorporados à DCTFWeb para compensação ou emissão de DARF numerado.
                  Este comprovante é válido para fins de Declaração de Ajuste Anual do IRPF ou apuração de IRPJ/CSLL/PIS/COFINS das pessoas jurídicas.
                </p>
              </div>

              {/* ASSINATURAS */}
              <div className="grid grid-cols-2 gap-8 text-center pt-6 border-t border-zinc-300">
                <div>
                  <div className="border-b border-zinc-500 w-3/4 mx-auto mb-1"></div>
                  <div className="text-[11px] font-bold text-zinc-800">INDÚSTRIA E COMÉRCIO CONTÁBIL STUDIO PRO</div>
                  <div className="text-[10px] text-zinc-500">Fonte Pagadora Responsável</div>
                </div>
                <div>
                  <div className="border-b border-zinc-500 w-3/4 mx-auto mb-1"></div>
                  <div className="text-[11px] font-bold text-zinc-800">{selectedItem?.beneficiarioRazaoSocial || 'Beneficiário'}</div>
                  <div className="text-[10px] text-zinc-500">Recebedor dos Rendimentos</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 4: APURAÇÃO CONSOLIDADA E DCTFWEB */}
        {activeTab === 'APURACAO_DCTFWEB' && (
          <div className="space-y-4">
            <div className="bg-[#181818] p-4 rounded-lg border border-zinc-800">
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <Landmark className="w-5 h-5 text-blue-400" />
                <span>Integração EFD-Reinf Série R-4000 com DCTFWeb</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Conforme a IN RFB nº 2.043/2021, as retenções de IRRF e CSRF declaradas nos eventos R-4010, R-4020, R-4040 e R-4080 alimentam automaticamente a DCTFWeb da competência {competencia}, dispensando a DIRF anual.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* DARF IRRF 1708/0588 */}
              <div className="bg-[#181818] p-5 rounded-lg border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <span className="font-bold text-white text-xs">DARF IRRF (Cód. 1708 / 0588)</span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">Vencimento: 20/04/2026</span>
                </div>

                <div className="text-xs space-y-2 text-zinc-300">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Eventos R-4010 (Pessoa Física):</span>
                    <strong className="text-white font-mono">
                      {formatBRL((resumo?.itens || []).filter(i => i.tipoEvento === 'R4010_PF_PAGTO').reduce((a, b) => a + b.valorIrrfRetidoBRL, 0))}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Eventos R-4020 (Pessoa Jurídica):</span>
                    <strong className="text-white font-mono">
                      {formatBRL((resumo?.itens || []).filter(i => i.tipoEvento === 'R4020_PJ_SERVICO').reduce((a, b) => a + b.valorIrrfRetidoBRL, 0))}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Eventos R-4040 (Não Identificado):</span>
                    <strong className="text-white font-mono">
                      {formatBRL((resumo?.itens || []).filter(i => i.tipoEvento === 'R4040_BENEFICIARIO_NAO_IDENTIFICADO').reduce((a, b) => a + b.valorIrrfRetidoBRL, 0))}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Eventos R-4080 (Auto-Retenção):</span>
                    <strong className="text-white font-mono">
                      {formatBRL((resumo?.itens || []).filter(i => i.tipoEvento === 'R4080_AUTO_RETENCAO').reduce((a, b) => a + b.valorIrrfRetidoBRL, 0))}
                    </strong>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-zinc-800 text-sm">
                    <span className="font-bold text-zinc-200">Total DARF IRRF a Recolher:</span>
                    <strong className="text-amber-400 font-mono font-bold">
                      {formatBRL(resumo?.totalIrrfRetidoBRL || 0)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* DARF CSRF 5952 */}
              <div className="bg-[#181818] p-5 rounded-lg border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                    <span className="font-bold text-white text-xs">DARF CSRF (Cód. 5952 - 4,65%)</span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">Vencimento: 20/04/2026</span>
                </div>

                <div className="text-xs space-y-2 text-zinc-300">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">CSLL Retida (1,0%):</span>
                    <strong className="text-white font-mono">{formatBRL(resumo?.totalCsllRetidoBRL || 0)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">PIS Retido (0,65%):</span>
                    <strong className="text-white font-mono">{formatBRL(resumo?.totalPisRetidoBRL || 0)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">COFINS Retida (3,0%):</span>
                    <strong className="text-white font-mono">{formatBRL(resumo?.totalCofinsRetidoBRL || 0)}</strong>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-zinc-800 text-sm">
                    <span className="font-bold text-zinc-200">Total DARF CSRF a Recolher:</span>
                    <strong className="text-emerald-400 font-mono font-bold">
                      {formatBRL((resumo?.totalCsllRetidoBRL || 0) + (resumo?.totalPisRetidoBRL || 0) + (resumo?.totalCofinsRetidoBRL || 0))}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* EVENTO R-4099 FECHAMENTO */}
            <div className="p-4 bg-blue-950/20 border border-blue-500/30 rounded-lg flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-blue-300 flex items-center space-x-2">
                  <BadgeAlert className="w-4 h-4 text-blue-400" />
                  <span>Fechamento da Série R-4000 (Evento R-4099)</span>
                </div>
                <div className="text-zinc-400 mt-1">
                  O evento R-4099 consolida todos os eventos da série R-4000 na competência {competencia} e envia para a DCTFWeb.
                </div>
              </div>
              <button
                onClick={() => {
                  setFeedback({ tipo: 'sucesso', texto: `Evento R-4099 (Fechamento) da competência ${competencia} transmitido com sucesso ao SPED.` });
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded shadow transition-colors"
              >
                Transmitir Fechamento R-4099
              </button>
            </div>
          </div>
        )}

        {/* ABA 5: XML PREVIEW */}
        {activeTab === 'XML_PREVIEW' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-[#181818] p-3 rounded-lg border border-zinc-800 text-xs">
              <div className="flex items-center space-x-2">
                <FileCode className="w-4 h-4 text-blue-400" />
                <span className="font-semibold text-white">Visualizador de XML EFD-Reinf v2.01.02</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    if (xmlVisualizacao) {
                      navigator.clipboard.writeText(xmlVisualizacao);
                      setFeedback({ tipo: 'sucesso', texto: 'XML copiado para a área de transferência.' });
                    }
                  }}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-xs flex items-center space-x-1.5 border border-zinc-700"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar XML</span>
                </button>
                <button
                  onClick={() => {
                    if (xmlVisualizacao) {
                      const blob = new Blob([xmlVisualizacao], { type: 'application/xml' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `EFD_REINF_${selectedItem?.tipoEvento || 'R4000'}_${competencia}.xml`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold flex items-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar .xml</span>
                </button>
              </div>
            </div>

            <div className="bg-[#141414] rounded-lg border border-zinc-800 p-4 overflow-auto max-h-[500px]">
              <pre className="text-xs font-mono text-blue-300 leading-relaxed whitespace-pre-wrap">
                {xmlVisualizacao || 'Selecione um evento na lista e clique em "Gerar XML" para visualizar o arquivo oficial.'}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
