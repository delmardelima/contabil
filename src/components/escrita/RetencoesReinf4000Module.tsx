import React, { useState, useEffect } from 'react';
import {
  Receipt,
  FileCode,
  DollarSign,
  FileText,
  Printer,
  Plus,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Building,
  Calendar,
  Layers,
  Percent,
  X,
  CreditCard,
  FileCheck,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  Search,
  Scale,
  Landmark,
  Barcode,
  Send,
  Copy,
  Users
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  ItemRetencaoReinf4000,
  ResumoRetencoesReinf4000,
  TipoEventoReinf4000
} from '../../types/contabil';

export const RetencoesReinf4000Module: React.FC = () => {
  const [resumo, setResumo] = useState<ResumoRetencoesReinf4000 | null>(null);
  const [selectedRet, setSelectedRet] = useState<ItemRetencaoReinf4000 | null>(null);
  const [activeTab, setActiveTab] = useState<'eventos_r4000' | 'apuracao_darf' | 'gerador_xml' | 'comprovante_a4'>('eventos_r4000');
  const [filtroEvento, setFiltroEvento] = useState<string>('TODOS');
  const [termoBusca, setTermoBusca] = useState('');

  // Modais
  const [modalNovaRetencao, setModalNovaRetencao] = useState(false);
  const [modalXmlAberto, setModalXmlAberto] = useState(false);
  const [xmlVisualizacao, setXmlVisualizacao] = useState('');

  // Feedbacks
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  // Form State
  const [formTipoEvento, setFormTipoEvento] = useState<TipoEventoReinf4000>('R-4020_PJ');
  const [formNumeroDoc, setFormNumeroDoc] = useState('');
  const [formDataPagto, setFormDataPagto] = useState('2026-03-20');
  const [formBeneficiarioCpfCnpj, setFormBeneficiarioCpfCnpj] = useState('');
  const [formBeneficiarioNome, setFormBeneficiarioNome] = useState('');
  const [formNaturezaRend, setFormNaturezaRend] = useState('13002');
  const [formDescricao, setFormDescricao] = useState('');
  const [formValorBruto, setFormValorBruto] = useState(10000);
  const [formAliqIrrf, setFormAliqIrrf] = useState(1.5);
  const [formValorIrrf, setFormValorIrrf] = useState(150);
  const [formAliqPis, setFormAliqPis] = useState(0.65);
  const [formValorPis, setFormValorPis] = useState(65);
  const [formAliqCofins, setFormAliqCofins] = useState(3.0);
  const [formValorCofins, setFormValorCofins] = useState(300);
  const [formAliqCsll, setFormAliqCsll] = useState(1.0);
  const [formValorCsll, setFormValorCsll] = useState(100);
  const [formObservacoes, setFormObservacoes] = useState('');

  const carregarDados = () => {
    const dados = dbService.getRetencoesReinf4000();
    setResumo(dados);
    if (dados.retencoes.length > 0 && !selectedRet) {
      setSelectedRet(dados.retencoes[0]);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleRecalcularValores = (bruto: number, tipoEv: TipoEventoReinf4000, aliqIr: number) => {
    setFormValorBruto(bruto);
    const ir = Math.round(bruto * (aliqIr / 100) * 100) / 100;
    setFormValorIrrf(ir);

    if (tipoEv === 'R-4020_PJ') {
      const pis = Math.round(bruto * 0.0065 * 100) / 100;
      const cofins = Math.round(bruto * 0.03 * 100) / 100;
      const csll = Math.round(bruto * 0.01 * 100) / 100;
      setFormValorPis(pis);
      setFormValorCofins(cofins);
      setFormValorCsll(csll);
    } else {
      setFormValorPis(0);
      setFormValorCofins(0);
      setFormValorCsll(0);
    }
  };

  const handleSalvarRetencao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNumeroDoc || !formBeneficiarioNome) {
      setMensagemErro('Preencha o número do documento fiscal e o beneficiário.');
      return;
    }

    const totalCrf = formValorPis + formValorCofins + formValorCsll;
    const dispensa = (formValorIrrf + totalCrf) > 0 && (formValorIrrf + totalCrf) < 10.0;
    const liquido = Math.round((formValorBruto - (dispensa ? 0 : (formValorIrrf + totalCrf))) * 100) / 100;

    const nova: ItemRetencaoReinf4000 = {
      id: `reinf4-${Date.now()}`,
      empresaId: resumo?.empresaId || 1,
      tipoEvento: formTipoEvento,
      numeroDocumentoFiscal: formNumeroDoc,
      dataFatoGerador: formDataPagto,
      dataPagamento: formDataPagto,
      beneficiarioCpfCnpj: formBeneficiarioCpfCnpj || '00.000.000/0001-00',
      beneficiarioNomeRazaoSocial: formBeneficiarioNome,
      codigoNaturezaRendimento: formNaturezaRend,
      descricaoServico: formDescricao || 'Serviços prestados sujeitos a retenção',
      valorBrutoRendimentoBRL: Number(formValorBruto),
      baseCalculoIrrfBRL: Number(formValorBruto),
      aliquotaIrrfPercentual: Number(formAliqIrrf),
      valorIrrfRetidoBRL: Number(formValorIrrf),
      codigoReceitaDarfIrrf: formTipoEvento === 'R-4010_PF' ? '0588' : '1708',
      baseCalculoCrfBRL: formTipoEvento === 'R-4020_PJ' ? Number(formValorBruto) : 0,
      aliquotaPisRetidoPercentual: formTipoEvento === 'R-4020_PJ' ? Number(formAliqPis) : 0,
      valorPisRetidoBRL: Number(formValorPis),
      aliquotaCofinsRetidoPercentual: formTipoEvento === 'R-4020_PJ' ? Number(formAliqCofins) : 0,
      valorCofinsRetidoBRL: Number(formValorCofins),
      aliquotaCsllRetidoPercentual: formTipoEvento === 'R-4020_PJ' ? Number(formAliqCsll) : 0,
      valorCsllRetidoBRL: Number(formValorCsll),
      valorTotalCrfRetidoBRL: totalCrf,
      codigoReceitaDarfCrf: formTipoEvento === 'R-4020_PJ' ? '5952' : '',
      dispensadoRetencaoMinima: dispensa,
      valorLiquidoPagoBRL: liquido,
      statusTransmissao: 'PENDENTE',
      integradoContabil: false,
      observacoes: formObservacoes || 'Retenção na fonte série R-4000 EFD-Reinf.'
    };

    const res = dbService.salvarRetencaoReinf4000(nova);
    if (res.sucesso) {
      setMensagemSucesso(res.mensagem);
      setModalNovaRetencao(false);
      carregarDados();
    } else {
      setMensagemErro('Erro ao registrar retenção na fonte.');
    }
  };

  const handleGerarXml = (id: string) => {
    const res = dbService.gerarXmlReinf4000(id);
    if (res.sucesso) {
      setXmlVisualizacao(res.xml);
      setModalXmlAberto(true);
      carregarDados();
    } else {
      setMensagemErro(res.mensagem);
    }
  };

  const handleIntegrarContabil = (id: string) => {
    const res = dbService.integrarRetencaoReinf4000Contabil(id);
    if (res.sucesso) {
      setMensagemSucesso(res.mensagem);
      carregarDados();
    } else {
      setMensagemErro(res.mensagem);
    }
  };

  const retencoesFiltradas = (resumo?.retencoes || []).filter(item => {
    const matchEvento = filtroEvento === 'TODOS' || item.tipoEvento === filtroEvento;
    const matchBusca = termoBusca === '' ||
      item.numeroDocumentoFiscal.toLowerCase().includes(termoBusca.toLowerCase()) ||
      item.beneficiarioNomeRazaoSocial.toLowerCase().includes(termoBusca.toLowerCase()) ||
      item.beneficiarioCpfCnpj.includes(termoBusca);
    return matchEvento && matchBusca;
  });

  return (
    <div className="flex flex-col h-full bg-[#121212] text-gray-200 overflow-y-auto">
      {/* Top Banner / Header */}
      <div className="border-b border-gray-800 bg-[#181818] px-6 py-4 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400">
            <FileCode className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-wide">
                Retenções Federais & EFD-Reinf Série R-4000 (IN RFB nº 2.043/2021)
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                R-4010 PF • R-4020 PJ • R-4080
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                DCTFWEB AUTOMÁTICA
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Gestão de retenções na fonte de IRRF (1708/0588) e CRF 4,65% (DARF 5952 PIS/COFINS/CSLL) com geração de XML e dispensa legal.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setModalNovaRetencao(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Nova Retenção R-4000
          </button>
          <button
            onClick={() => setActiveTab('comprovante_a4')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 rounded-lg transition"
          >
            <Printer className="w-3.5 h-3.5" />
            Comprovante Rendimentos A4
          </button>
          <button
            onClick={carregarDados}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
            title="Atualizar dados"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Feedbacks */}
      {mensagemSucesso && (
        <div className="mx-6 mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{mensagemSucesso}</span>
          </div>
          <button onClick={() => setMensagemSucesso(null)} className="text-emerald-400 hover:text-emerald-200">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {mensagemErro && (
        <div className="mx-6 mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{mensagemErro}</span>
          </div>
          <button onClick={() => setMensagemErro(null)} className="text-rose-400 hover:text-rose-200">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-[#181818] border border-gray-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Eventos R-4000</span>
            <FileCode className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-white">{resumo?.totalEventosR4000 || 0}</div>
          <div className="text-[10px] text-gray-500 mt-1">Registros na competência 2026-03</div>
        </div>

        <div className="bg-[#181818] border border-gray-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Rendimento Bruto</span>
            <DollarSign className="w-4 h-4 text-gray-300" />
          </div>
          <div className="text-xl font-bold text-gray-200">
            R$ {(resumo?.totalRendimentoBrutoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-gray-500 mt-1">Base de cálculo dos serviços</div>
        </div>

        <div className="bg-[#181818] border border-gray-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">IRRF Retido Total</span>
            <Receipt className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400">
            R$ {(resumo?.totalIrrfRetidoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-amber-400/70 mt-1">DARF 1708 (PJ) e 0588 (PF)</div>
        </div>

        <div className="bg-[#181818] border border-gray-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">CRF 4,65% (PIS/COF/CS)</span>
            <Landmark className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-cyan-400">
            R$ {(resumo?.totalCrfRetidoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-cyan-400/70 mt-1">DARF 5952 Retenções Sociais</div>
        </div>

        <div className="bg-[#181818] border border-gray-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Total Retido (Passivo)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400">
            R$ {(resumo?.totalGeralRetencoesFederaisBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-emerald-400/70 mt-1">Abatido do fornecedor / a pagar</div>
        </div>

        <div className="bg-[#181818] border border-gray-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Integração DCTFWeb</span>
            <CheckCircle className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-purple-400">100% OK</div>
          <div className="text-[10px] text-purple-400/70 mt-1">Guias unificadas no e-CAC</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-800 px-6 flex gap-4">
        <button
          onClick={() => setActiveTab('eventos_r4000')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition ${
            activeTab === 'eventos_r4000'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Eventos Transmitidos Série R-4000 ({resumo?.retencoes?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('apuracao_darf')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition ${
            activeTab === 'apuracao_darf'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Barcode className="w-4 h-4" />
          Guias DARF 1708 / 0588 / 5952
        </button>
        <button
          onClick={() => setActiveTab('gerador_xml')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition ${
            activeTab === 'gerador_xml'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <FileCode className="w-4 h-4" />
          XML Reinf Schema v2.01.02
        </button>
        <button
          onClick={() => setActiveTab('comprovante_a4')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition ${
            activeTab === 'comprovante_a4'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          Comprovante Anual de Retenção A4
        </button>
      </div>

      {/* Tab 1: Eventos R-4000 */}
      {activeTab === 'eventos_r4000' && (
        <div className="p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-[#181818] p-4 rounded-xl border border-gray-800">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Buscar por NF, prestador ou CPF/CNPJ..."
                  value={termoBusca}
                  onChange={e => setTermoBusca(e.target.value)}
                  className="pl-9 pr-4 py-1.5 bg-[#121212] border border-gray-700 rounded-lg text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 w-72"
                />
              </div>

              <select
                value={filtroEvento}
                onChange={e => setFiltroEvento(e.target.value)}
                className="bg-[#121212] border border-gray-700 text-gray-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
              >
                <option value="TODOS">Todos os Eventos R-4000</option>
                <option value="R-4010_PF">R-4010 - Rendimentos Pagos a PF</option>
                <option value="R-4020_PJ">R-4020 - Retenções Pagas a PJ</option>
                <option value="R-4080_AUTO_RETENCAO">R-4080 - Auto-Retenção (Cartões/Agências)</option>
              </select>
            </div>

            <div className="text-xs text-gray-400">
              Exibindo <span className="font-semibold text-white">{retencoesFiltradas.length}</span> registros
            </div>
          </div>

          <div className="bg-[#181818] border border-gray-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#202020] border-b border-gray-800 text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Evento / Documento</th>
                    <th className="py-3 px-4">Beneficiário (Prestador)</th>
                    <th className="py-3 px-4">Natureza Rend.</th>
                    <th className="py-3 px-4 text-right">Rendimento Bruto</th>
                    <th className="py-3 px-4 text-right">IRRF Retido</th>
                    <th className="py-3 px-4 text-right">CRF (4,65%)</th>
                    <th className="py-3 px-4 text-right">Líquido Pago</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {retencoesFiltradas.map(ret => (
                    <tr key={ret.id} className="hover:bg-[#1d1d1d] transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-blue-400 text-[11px]">{ret.tipoEvento.split('_')[0]}</span>
                          <span className="text-gray-300 font-medium">{ret.numeroDocumentoFiscal}</span>
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5">Pagto: {ret.dataPagamento}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-white">{ret.beneficiarioNomeRazaoSocial}</div>
                        <div className="text-[10px] text-gray-500 font-mono mt-0.5">{ret.beneficiarioCpfCnpj}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-gray-800 text-gray-300 border border-gray-700">
                          {ret.codigoNaturezaRendimento}
                        </span>
                        <div className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{ret.descricaoServico}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-300">
                        R$ {ret.valorBrutoRendimentoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-amber-400">
                        R$ {ret.valorIrrfRetidoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        <div className="text-[10px] text-gray-500 font-normal">DARF {ret.codigoReceitaDarfIrrf}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-cyan-400">
                        R$ {ret.valorTotalCrfRetidoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        {ret.codigoReceitaDarfCrf && (
                          <div className="text-[10px] text-gray-500 font-normal">DARF {ret.codigoReceitaDarfCrf}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-emerald-400">
                        R$ {ret.valorLiquidoPagoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          ret.statusTransmissao === 'TRANSMITIDO_RECIBO'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : ret.statusTransmissao === 'GERADO_XML'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {ret.statusTransmissao}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleGerarXml(ret.id)}
                            className="p-1 text-gray-400 hover:text-blue-400 hover:bg-gray-800 rounded transition"
                            title="Gerar / Ver XML Reinf"
                          >
                            <FileCode className="w-4 h-4" />
                          </button>

                          {ret.integradoContabil ? (
                            <span className="p-1 text-emerald-400" title="Integrado no Diário">
                              <CheckCircle className="w-4 h-4" />
                            </span>
                          ) : (
                            <button
                              onClick={() => handleIntegrarContabil(ret.id)}
                              className="px-2 py-0.5 text-[10px] font-semibold bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded transition"
                              title="Integrar Contabilmente"
                            >
                              Integrar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Guias DARF */}
      {activeTab === 'apuracao_darf' && resumo && (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
          <div className="bg-[#181818] border border-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-white mb-2">Apuração de Guias DARF na Fonte (Vencimento dia 20 do Mês Subsequente)</h3>
            <p className="text-xs text-gray-400 mb-6">
              Demonstrativo consolidado das retenções a recolher via DARF Numerado gerado pela DCTFWeb.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-[#141414] border border-gray-800 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-white">DARF 1708</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">IRRF PJ</span>
                </div>
                <div className="text-xs text-gray-400 mb-2">Serviços profissionais e vigilância (1% a 1.5%)</div>
                <div className="text-2xl font-bold text-amber-400 mb-4">
                  R$ {(resumo.retencoes.filter(r => r.codigoReceitaDarfIrrf === '1708').reduce((acc, r) => acc + r.valorIrrfRetidoBRL, 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-gray-500 font-mono">Vencimento: 20/04/2026</div>
              </div>

              <div className="p-4 bg-[#141414] border border-gray-800 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-white">DARF 0588</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">IRRF PF</span>
                </div>
                <div className="text-xs text-gray-400 mb-2">Trabalho sem vínculo e aluguéis (Tabela Progressiva)</div>
                <div className="text-2xl font-bold text-blue-400 mb-4">
                  R$ {(resumo.retencoes.filter(r => r.codigoReceitaDarfIrrf === '0588').reduce((acc, r) => acc + r.valorIrrfRetidoBRL, 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-gray-500 font-mono">Vencimento: 20/04/2026</div>
              </div>

              <div className="p-4 bg-[#141414] border border-gray-800 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-white">DARF 5952</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">CRF 4,65%</span>
                </div>
                <div className="text-xs text-gray-400 mb-2">PIS (0,65%), COFINS (3,00%) e CSLL (1,00%)</div>
                <div className="text-2xl font-bold text-cyan-400 mb-4">
                  R$ {resumo.totalCrfRetidoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-gray-500 font-mono">Vencimento: 20/04/2026</div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-[#121212] rounded-lg border border-gray-800 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div className="text-xs text-gray-300">
                <strong>Regra de Dispensa Mínima (Art. 67 Lei nº 9.430/96):</strong> É dispensada a retenção de imposto de renda e de contribuições sociais de valor igual ou inferior a <strong>R$ 10,00</strong>.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Visualizador XML Reinf */}
      {activeTab === 'gerador_xml' && (
        <div className="p-6 max-w-4xl mx-auto space-y-4">
          <div className="bg-[#181818] border border-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-white mb-2">Visualizador de Schema XML EFD-Reinf v2.01.02</h3>
            <p className="text-xs text-gray-400 mb-4">
              Clique no botão de código ao lado de qualquer lançamento da tabela de eventos para carregar e inspecionar a árvore XML em conformidade com o manual da Receita Federal.
            </p>

            <div className="bg-[#121212] border border-gray-800 rounded-lg p-4 font-mono text-xs text-emerald-400 overflow-x-auto max-h-96">
              {xmlVisualizacao ? (
                <pre>{xmlVisualizacao}</pre>
              ) : (
                <div className="text-gray-500 text-center py-12">
                  Nenhum evento selecionado. Volte à aba de eventos e clique no ícone de XML.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Comprovante Anual A4 */}
      {activeTab === 'comprovante_a4' && (
        <div className="p-6 max-w-4xl mx-auto space-y-4">
          <div className="flex justify-end gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir Comprovante de Rendimentos A4
            </button>
          </div>

          <div className="bg-white text-gray-900 p-8 rounded-xl shadow-lg border border-gray-300 font-sans text-xs">
            {/* Header */}
            <div className="border-b-2 border-gray-800 pb-4 mb-4 flex justify-between items-start">
              <div>
                <h1 className="text-base font-bold text-gray-900 tracking-wide uppercase">
                  COMPROVANTE DE RENDIMENTOS PAGOS E DE RETENÇÃO DO IMPOSTO NA FONTE
                </h1>
                <p className="text-[11px] text-gray-600">
                  Emitido em estrita conformidade com a Instrução Normativa RFB nº 2.043/2021 (EFD-Reinf Série R-4000)
                </p>
              </div>
              <div className="text-right text-[10px] text-gray-500 font-mono">
                <div>Ano-Calendário: 2026</div>
                <div>Emissão: {new Date().toLocaleDateString('pt-BR')}</div>
              </div>
            </div>

            {/* Fonte Pagadora */}
            <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-300">
              <div className="font-bold text-gray-700 text-[10px] uppercase mb-1">1. Fonte Pagadora (Pessoa Jurídica)</div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>Nome Empresarial: <strong>EMPRESA ATIVA MATRIZ S/A</strong></div>
                <div>CNPJ: <strong>00.000.000/0001-91</strong></div>
              </div>
            </div>

            {/* Tabela de Beneficiários e Retenções */}
            <div className="mb-6">
              <div className="font-bold text-gray-700 text-[10px] uppercase mb-2">2. Rendimentos Tributáveis e Retenções Efetuadas</div>
              <table className="w-full text-left text-[11px] border border-gray-300">
                <thead className="bg-gray-100 font-semibold border-b border-gray-300">
                  <tr>
                    <th className="p-1.5">Beneficiário</th>
                    <th className="p-1.5">CPF / CNPJ</th>
                    <th className="p-1.5">Documento</th>
                    <th className="p-1.5 text-right">Rendimento Bruto</th>
                    <th className="p-1.5 text-right">IRRF Retido</th>
                    <th className="p-1.5 text-right">CRF Retido</th>
                    <th className="p-1.5 text-right">Valor Líquido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(resumo?.retencoes || []).map((r, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-1.5 font-medium">{r.beneficiarioNomeRazaoSocial}</td>
                      <td className="p-1.5 font-mono text-[10px]">{r.beneficiarioCpfCnpj}</td>
                      <td className="p-1.5">{r.numeroDocumentoFiscal}</td>
                      <td className="p-1.5 text-right">R$ {r.valorBrutoRendimentoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td className="p-1.5 text-right text-amber-800 font-semibold">R$ {r.valorIrrfRetidoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td className="p-1.5 text-right text-cyan-800 font-semibold">R$ {r.valorTotalCrfRetidoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td className="p-1.5 text-right text-emerald-800 font-bold">R$ {r.valorLiquidoPagoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Informações Complementares */}
            <div className="mb-6 p-3 bg-gray-50 rounded border border-gray-300 text-[10px] text-gray-600 leading-relaxed">
              As informações constantes deste comprovante foram regularmente transmitidas à Receita Federal do Brasil por meio dos eventos da série R-4000 da EFD-Reinf e integradas na DCTFWeb, substituindo a DIRF nos termos da IN RFB nº 2.096/2022.
            </div>

            {/* Assinaturas */}
            <div className="mt-12 pt-8 border-t border-gray-400 grid grid-cols-2 gap-12 text-center text-xs">
              <div>
                <div className="border-b border-gray-600 pb-1 mb-1 font-semibold text-gray-900">
                  DEPARTAMENTO FISCAL / TRIBUTÁRIO
                </div>
                <div className="text-[10px] text-gray-500">Responsável pela Retenção na Fonte</div>
              </div>
              <div>
                <div className="border-b border-gray-600 pb-1 mb-1 font-semibold text-gray-900">
                  CONTADOR RESPONSÁVEL TÉCNICO
                </div>
                <div className="text-[10px] text-gray-500">CRC/SP Ativo nº 1SP999999/O-0</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nova Retenção */}
      {modalNovaRetencao && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#181818] border border-gray-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl text-gray-200">
            <div className="flex justify-between items-center border-b border-gray-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Cadastrar Retenção na Fonte (Série R-4000)</h3>
              </div>
              <button onClick={() => setModalNovaRetencao(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarRetencao} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Tipo de Evento Reinf</label>
                  <select
                    value={formTipoEvento}
                    onChange={e => {
                      const novoTipo = e.target.value as TipoEventoReinf4000;
                      setFormTipoEvento(novoTipo);
                      handleRecalcularValores(formValorBruto, novoTipo, formAliqIrrf);
                    }}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white"
                  >
                    <option value="R-4020_PJ">R-4020 - Retenção em Pagamento a PJ</option>
                    <option value="R-4010_PF">R-4010 - Pagamento a Pessoa Física</option>
                    <option value="R-4080_AUTO_RETENCAO">R-4080 - Auto-Retenção (Cartão / Agência)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Nº Documento Fiscal *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: NFS-e 002.450"
                    value={formNumeroDoc}
                    onChange={e => setFormNumeroDoc(e.target.value)}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">CPF / CNPJ Beneficiário</label>
                  <input
                    type="text"
                    placeholder="00.000.000/0001-00"
                    value={formBeneficiarioCpfCnpj}
                    onChange={e => setFormBeneficiarioCpfCnpj(e.target.value)}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Razão Social / Nome *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Auditoria e Consultoria Tributária Ltda"
                    value={formBeneficiarioNome}
                    onChange={e => setFormBeneficiarioNome(e.target.value)}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Cód. Natureza Rendimento</label>
                  <input
                    type="text"
                    placeholder="Ex: 13002 ou 15001"
                    value={formNaturezaRend}
                    onChange={e => setFormNaturezaRend(e.target.value)}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Data Pagamento / Fato Gerador</label>
                  <input
                    type="date"
                    value={formDataPagto}
                    onChange={e => setFormDataPagto(e.target.value)}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Valor Bruto do Rendimento (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formValorBruto}
                  onChange={e => handleRecalcularValores(Number(e.target.value), formTipoEvento, formAliqIrrf)}
                  className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white text-base font-bold"
                />
              </div>

              <div className="p-3 bg-[#121212] rounded-lg border border-gray-800 space-y-2">
                <div className="text-gray-300 font-semibold text-[11px]">Retenções Federais Calculadas (R$):</div>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] text-gray-500">IRRF ({formAliqIrrf}%)</label>
                    <input type="number" step="0.01" value={formValorIrrf} onChange={e => setFormValorIrrf(Number(e.target.value))} className="w-full bg-[#181818] border border-gray-700 rounded p-1 text-amber-400 text-[11px] font-bold" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500">PIS (0,65%)</label>
                    <input type="number" step="0.01" value={formValorPis} onChange={e => setFormValorPis(Number(e.target.value))} className="w-full bg-[#181818] border border-gray-700 rounded p-1 text-cyan-300 text-[11px]" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500">COFINS (3,00%)</label>
                    <input type="number" step="0.01" value={formValorCofins} onChange={e => setFormValorCofins(Number(e.target.value))} className="w-full bg-[#181818] border border-gray-700 rounded p-1 text-cyan-300 text-[11px]" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500">CSLL (1,00%)</label>
                    <input type="number" step="0.01" value={formValorCsll} onChange={e => setFormValorCsll(Number(e.target.value))} className="w-full bg-[#181818] border border-gray-700 rounded p-1 text-cyan-300 text-[11px]" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setModalNovaRetencao(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold shadow-sm"
                >
                  Salvar Retenção
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Visualização XML */}
      {modalXmlAberto && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#181818] border border-gray-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl text-gray-200">
            <div className="flex justify-between items-center border-b border-gray-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">XML Oficial EFD-Reinf Série R-4000</h3>
              </div>
              <button onClick={() => setModalXmlAberto(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#121212] border border-gray-800 rounded-lg p-4 font-mono text-xs text-emerald-400 overflow-x-auto max-h-96">
              <pre>{xmlVisualizacao}</pre>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-800 mt-4">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(xmlVisualizacao);
                  setMensagemSucesso('XML copiado para a área de transferência.');
                  setModalXmlAberto(false);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-xs shadow-sm"
              >
                <Copy className="w-4 h-4" />
                Copiar XML
              </button>
              <button
                onClick={() => setModalXmlAberto(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-semibold text-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
