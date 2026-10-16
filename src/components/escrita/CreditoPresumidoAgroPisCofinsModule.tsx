import React, { useState, useEffect } from 'react';
import {
  Wheat,
  FileText,
  DollarSign,
  Printer,
  Plus,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Building,
  Calendar,
  Layers,
  Send,
  Database,
  Search,
  ExternalLink,
  Percent,
  X,
  CreditCard,
  FileCheck,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  Truck,
  Scale
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  InsumoAgropecuarioCredito,
  ResumoCreditoPresumidoAgro,
  TipoInsumoAgropecuario,
  OrigemProdutorAgro,
  PercentualAliquotaPresumida
} from '../../types/contabil';

export const CreditoPresumidoAgroPisCofinsModule: React.FC = () => {
  const [resumo, setResumo] = useState<ResumoCreditoPresumidoAgro | null>(null);
  const [selectedInsumo, setSelectedInsumo] = useState<InsumoAgropecuarioCredito | null>(null);
  const [activeTab, setActiveTab] = useState<'aquisicoes' | 'efd_contribuicoes' | 'saldo_perdcomp' | 'laudo_a4'>('aquisicoes');
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');
  const [termoBusca, setTermoBusca] = useState('');

  // Modais
  const [modalNovoInsumo, setModalNovoInsumo] = useState(false);
  const [modalDetalhe, setModalDetalhe] = useState(false);

  // Feedbacks
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  // Form State: Nova Aquisição Agro
  const [formInsumo, setFormInsumo] = useState<Partial<InsumoAgropecuarioCredito>>({
    numeroDocumentoFiscal: '',
    serie: '1',
    dataEntrada: new Date().toISOString().split('T')[0],
    produtorNomeRazaoSocial: '',
    produtorCpfCnpj: '',
    produtorUf: 'MG',
    tipoInsumo: 'LEITE_IN_NATURA',
    origemProdutor: 'PESSOA_FISICA_PRODUTOR_RURAL',
    descricaoProduto: '',
    quantidadeUnidade: 1000,
    unidadeMedida: 'Litros',
    valorAquisicaoInsumoBRL: 50000,
    percentualCreditoPresumidoAplicado: 60.0,
    codigoBaseCreditoEfd: '13 - Aquisição agropecuária Lei 10.925/04',
    cstPisCofinsEntrada: '73 - Aquisição a alíquota zero com crédito presumido',
    observacoes: ''
  });

  const carregarDados = () => {
    const dados = dbService.getCreditoPresumidoAgro();
    setResumo(dados);
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleSalvarNovoInsumo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formInsumo.numeroDocumentoFiscal || !formInsumo.produtorNomeRazaoSocial || !formInsumo.valorAquisicaoInsumoBRL) {
      setMensagemErro('Preencha os campos obrigatórios da aquisição agropecuária.');
      return;
    }

    const vlrAquisicao = Number(formInsumo.valorAquisicaoInsumoBRL);
    const pct = Number(formInsumo.percentualCreditoPresumidoAplicado || 35.0) as PercentualAliquotaPresumida;

    // Alíquotas conforme Art. 8º Lei 10.925/2004:
    // 60% de 1.65% = 0.99% PIS; 60% de 7.60% = 4.56% COFINS
    // 35% de 1.65% = 0.5775% PIS; 35% de 7.60% = 2.66% COFINS
    let aliqPis = 0.5775;
    let aliqCofins = 2.66;
    if (pct === 60.0) {
      aliqPis = 0.99;
      aliqCofins = 4.56;
    } else if (pct === 50.0) {
      aliqPis = 0.825;
      aliqCofins = 3.80;
    } else if (pct === 20.0) {
      aliqPis = 0.33;
      aliqCofins = 1.52;
    }

    const vlrPis = Number(((vlrAquisicao * aliqPis) / 100).toFixed(2));
    const vlrCofins = Number(((vlrAquisicao * aliqCofins) / 100).toFixed(2));
    const totalCred = Number((vlrPis + vlrCofins).toFixed(2));

    const novo: InsumoAgropecuarioCredito = {
      id: `agro-${Date.now()}`,
      empresaId: resumo?.empresaId || 1,
      numeroDocumentoFiscal: formInsumo.numeroDocumentoFiscal,
      serie: formInsumo.serie || '1',
      dataEntrada: formInsumo.dataEntrada || new Date().toISOString().split('T')[0],
      produtorNomeRazaoSocial: formInsumo.produtorNomeRazaoSocial,
      produtorCpfCnpj: formInsumo.produtorCpfCnpj || '000.000.000-00',
      produtorUf: formInsumo.produtorUf || 'MG',
      tipoInsumo: (formInsumo.tipoInsumo || 'LEITE_IN_NATURA') as TipoInsumoAgropecuario,
      origemProdutor: (formInsumo.origemProdutor || 'PESSOA_FISICA_PRODUTOR_RURAL') as OrigemProdutorAgro,
      descricaoProduto: formInsumo.descricaoProduto || 'Insumo agropecuário para agroindústria',
      quantidadeUnidade: Number(formInsumo.quantidadeUnidade || 1),
      unidadeMedida: formInsumo.unidadeMedida || 'Kg',
      valorAquisicaoInsumoBRL: vlrAquisicao,
      percentualCreditoPresumidoAplicado: pct,
      aliquotaEfetivaPisPresumidoPercentual: aliqPis,
      aliquotaEfetivaCofinsPresumidoPercentual: aliqCofins,
      valorCreditoPresumidoPisBRL: vlrPis,
      valorCreditoPresumidoCofinsBRL: vlrCofins,
      valorTotalCreditoPresumidoBRL: totalCred,
      codigoBaseCreditoEfd: '13 - Aquisição agropecuária Lei 10.925/04',
      cstPisCofinsEntrada: '73 - Aquisição a alíquota zero com crédito presumido',
      statusCredito: 'APURADO',
      integradoContabil: false,
      observacoes: formInsumo.observacoes || ''
    };

    const res = dbService.salvarInsumoAgroCredito(novo);
    if (res.sucesso) {
      setMensagemSucesso(res.mensagem);
      setModalNovoInsumo(false);
      carregarDados();
    } else {
      setMensagemErro('Erro ao cadastrar insumo agropecuário.');
    }
  };

  const handleIntegrarContabil = (id: string) => {
    const res = dbService.integrarCreditoPresumidoAgroContabil(id);
    if (res.sucesso) {
      setMensagemSucesso(res.mensagem);
      carregarDados();
    } else {
      setMensagemErro(res.mensagem);
    }
  };

  const insumosFiltrados = (resumo?.insumos || []).filter(item => {
    const matchTipo = filtroTipo === 'TODOS' || item.tipoInsumo === filtroTipo;
    const matchBusca = termoBusca === '' ||
      item.numeroDocumentoFiscal.toLowerCase().includes(termoBusca.toLowerCase()) ||
      item.produtorNomeRazaoSocial.toLowerCase().includes(termoBusca.toLowerCase()) ||
      item.descricaoProduto.toLowerCase().includes(termoBusca.toLowerCase());
    return matchTipo && matchBusca;
  });

  return (
    <div className="flex flex-col h-full bg-[#121212] text-gray-200 overflow-y-auto">
      {/* Top Banner / Header */}
      <div className="border-b border-gray-800 bg-[#181818] px-6 py-4 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-600 to-yellow-700 text-white shadow-lg shadow-amber-900/30">
            <Wheat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-wide">
                Crédito Presumido de PIS e COFINS - Agronegócio
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Lei nº 10.925/2004 Art. 8º & IN RFB 2.121/2022
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Desconto de crédito presumido de até 60% s/ matérias-primas agropecuárias adquiridas de pessoas físicas e cooperativas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => carregarDados()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#242424] hover:bg-[#2e2e2e] text-gray-300 text-xs font-medium border border-gray-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Atualizar
          </button>
          <button
            onClick={() => setActiveTab('laudo_a4')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#242424] hover:bg-[#2e2e2e] text-gray-300 text-xs font-medium border border-gray-700 transition"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            Memória de Cálculo A4
          </button>
          <button
            onClick={() => setModalNovoInsumo(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md shadow-amber-900/40 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Nova Aquisição Agro
          </button>
        </div>
      </div>

      {/* Alerts */}
      {mensagemSucesso && (
        <div className="mx-6 mt-4 p-3 rounded-lg bg-emerald-900/30 border border-emerald-700/50 flex items-center justify-between text-xs text-emerald-300 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{mensagemSucesso}</span>
          </div>
          <button onClick={() => setMensagemSucesso(null)} className="text-gray-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      {mensagemErro && (
        <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-900/30 border border-rose-700/50 flex items-center justify-between text-xs text-rose-300 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{mensagemErro}</span>
          </div>
          <button onClick={() => setMensagemErro(null)} className="text-gray-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-800 bg-[#151515] px-6 flex items-center gap-1">
        <button
          onClick={() => setActiveTab('aquisicoes')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition ${
            activeTab === 'aquisicoes'
              ? 'border-amber-500 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Aquisições de Produtores Rurais & Cooperativas ({resumo?.insumos.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('efd_contribuicoes')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition ${
            activeTab === 'efd_contribuicoes'
              ? 'border-amber-500 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Database className="w-4 h-4" />
          EFD-Contribuições (Blocos M100 / M500 - Base 13)
        </button>
        <button
          onClick={() => setActiveTab('saldo_perdcomp')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition ${
            activeTab === 'saldo_perdcomp'
              ? 'border-amber-500 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Scale className="w-4 h-4" />
          Ressarcimento / Compensação (PER/DCOMP Web)
        </button>
        <button
          onClick={() => setActiveTab('laudo_a4')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition ${
            activeTab === 'laudo_a4'
              ? 'border-amber-500 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Printer className="w-4 h-4" />
          Memória de Cálculo Oficial A4
        </button>
      </div>

      {/* Main Content Area */}
      <div className="p-6 flex-1">
        {/* TAB 1: AQUISIÇÕES */}
        {activeTab === 'aquisicoes' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#1b1b1b] border border-gray-800 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Compras Produtores Rurais</span>
                  <Wheat className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-white tracking-tight">
                  R$ {(resumo?.totalValorAquisicaoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-gray-400 mt-2">
                  <span className="text-amber-400 font-semibold">{resumo?.totalOperacoes || 0} notas de entrada</span> no mês
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#1b1b1b] border border-gray-800 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Crédito Presumido PIS</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-emerald-400 tracking-tight">
                  R$ {(resumo?.totalCreditoPisBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-gray-400 mt-2">
                  Alíquotas de <span className="text-emerald-400 font-semibold">0,99%</span> e <span className="text-emerald-400 font-semibold">0,5775%</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#1b1b1b] border border-gray-800 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Crédito Presumido COFINS</span>
                  <DollarSign className="w-4 h-4 text-teal-400" />
                </div>
                <div className="text-2xl font-bold text-teal-400 tracking-tight">
                  R$ {(resumo?.totalCreditoCofinsBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-gray-400 mt-2">
                  Alíquotas de <span className="text-teal-400 font-semibold">4,56%</span> e <span className="text-teal-400 font-semibold">2,66%</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#1b1b1b] border border-gray-800 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Total Geral de Crédito</span>
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-purple-300 tracking-tight">
                  R$ {(resumo?.totalGeralCreditoPresumidoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-purple-300/80 mt-2">
                  Benefício líquido recuperável no Ativo
                </div>
              </div>
            </div>

            {/* Filter and Table */}
            <div className="p-4 rounded-xl bg-[#181818] border border-gray-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
                <div className="relative flex-1 max-w-xs">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={termoBusca}
                    onChange={e => setTermoBusca(e.target.value)}
                    placeholder="Buscar produtor, NF ou produto..."
                    className="w-full pl-9 pr-3 py-1.5 bg-[#121212] border border-gray-700 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span>Insumo Agro:</span>
                  <select
                    value={filtroTipo}
                    onChange={e => setFiltroTipo(e.target.value)}
                    className="bg-[#121212] border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="TODOS">Todos os Insumos</option>
                    <option value="LEITE_IN_NATURA">Leite In Natura (60%)</option>
                    <option value="GRAOS_SOJA_MILHO">Grãos Soja e Milho (35%)</option>
                    <option value="CARNES_BOVINA_SUINA_AVES">Carnes / Animais Abate (35%)</option>
                    <option value="CAFE_EM_GRAO">Café em Grão</option>
                    <option value="CEREAIS_TRIGO_ARROZ">Cereais / Trigo / Arroz</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-gray-800 bg-[#161616] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#202020] text-gray-400 border-b border-gray-800 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">Doc Fiscal / Data</th>
                      <th className="py-3 px-4">Produtor Rural / Origem</th>
                      <th className="py-3 px-4">Produto Agropecuário</th>
                      <th className="py-3 px-4 text-right">Qtd / Unidade</th>
                      <th className="py-3 px-4 text-right">Valor Compra</th>
                      <th className="py-3 px-4 text-center">Aliq. Presumida</th>
                      <th className="py-3 px-4 text-right">PIS Presumido</th>
                      <th className="py-3 px-4 text-right">COFINS Presumido</th>
                      <th className="py-3 px-4 text-right">Crédito Total</th>
                      <th className="py-3 px-4 text-center">Status / Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {insumosFiltrados.map(item => (
                      <tr key={item.id} className="hover:bg-[#1d1d1d] transition">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">{item.numeroDocumentoFiscal}</div>
                          <div className="text-[11px] text-gray-400 mt-0.5">{item.dataEntrada}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-200">{item.produtorNomeRazaoSocial}</div>
                          <div className="text-[11px] text-gray-500 font-mono">
                            {item.produtorCpfCnpj} • UF: {item.produtorUf}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-gray-300 font-medium">{item.descricaoProduto}</div>
                          <div className="text-[10px] text-amber-400/80 mt-0.5">
                            {item.tipoInsumo.replace(/_/g, ' ')}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-gray-300">
                          {item.quantidadeUnidade.toLocaleString('pt-BR')} {item.unidadeMedida}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-white">
                          R$ {item.valorAquisicaoInsumoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            {item.percentualCreditoPresumidoAplicado}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-emerald-400">
                          R$ {item.valorCreditoPresumidoPisBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          <div className="text-[10px] text-gray-500">
                            ({item.aliquotaEfetivaPisPresumidoPercentual}%)
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-teal-400">
                          R$ {item.valorCreditoPresumidoCofinsBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          <div className="text-[10px] text-gray-500">
                            ({item.aliquotaEfetivaCofinsPresumidoPercentual}%)
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-purple-300">
                          R$ {item.valorTotalCreditoPresumidoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            {item.integradoContabil ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <FileCheck className="w-3 h-3" />
                                Integrado
                              </span>
                            ) : (
                              <button
                                onClick={() => handleIntegrarContabil(item.id)}
                                className="px-2.5 py-1 rounded bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-600/40 text-[11px] font-semibold transition flex items-center gap-1"
                              >
                                <FileCheck className="w-3 h-3" />
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

        {/* TAB 2: EFD-CONTRIBUIÇÕES */}
        {activeTab === 'efd_contribuicoes' && (
          <div className="space-y-6">
            <div className="p-5 rounded-xl bg-[#181818] border border-gray-800 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-amber-400" />
                  Mapeamento nos Blocos M100 e M500 da EFD-Contribuições
                </h3>
                <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  CST 73 • Código de Base de Crédito 13
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-[#202020] border border-gray-800 space-y-3">
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Bloco M100 / M105 - Crédito PIS/PASEP Agropecuário</span>
                    <Percent className="w-4 h-4" />
                  </div>
                  <div className="space-y-1.5 text-xs text-gray-300">
                    <div className="flex justify-between border-b border-gray-800 pb-1">
                      <span className="text-gray-400">Código do Tipo de Crédito:</span>
                      <span className="font-semibold text-white">108 - Crédito Presumido Agroindústria</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-800 pb-1">
                      <span className="text-gray-400">Base de Cálculo Total (Insumos):</span>
                      <span className="font-semibold text-white">
                        R$ {(resumo?.totalValorAquisicaoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-gray-800 pb-1">
                      <span className="text-gray-400">Valor Total do Crédito PIS Apurado:</span>
                      <span className="font-bold text-emerald-400">
                        R$ {(resumo?.totalCreditoPisBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-[#202020] border border-gray-800 space-y-3">
                  <div className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Bloco M500 / M505 - Crédito COFINS Agropecuário</span>
                    <Percent className="w-4 h-4" />
                  </div>
                  <div className="space-y-1.5 text-xs text-gray-300">
                    <div className="flex justify-between border-b border-gray-800 pb-1">
                      <span className="text-gray-400">Código do Tipo de Crédito:</span>
                      <span className="font-semibold text-white">108 - Crédito Presumido Agroindústria</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-800 pb-1">
                      <span className="text-gray-400">Base de Cálculo Total (Insumos):</span>
                      <span className="font-semibold text-white">
                        R$ {(resumo?.totalValorAquisicaoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-gray-800 pb-1">
                      <span className="text-gray-400">Valor Total do Crédito COFINS Apurado:</span>
                      <span className="font-bold text-teal-400">
                        R$ {(resumo?.totalCreditoCofinsBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SALDO PER/DCOMP */}
        {activeTab === 'saldo_perdcomp' && (
          <div className="space-y-6">
            <div className="p-5 rounded-xl bg-[#181818] border border-gray-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-purple-400" />
                Compensação Tributária & Ressarcimento em Dinheiro (PER/DCOMP Web)
              </h3>
              <p className="text-xs text-gray-400">
                Conforme Art. 15 da Lei nº 10.865/2004 e IN RFB nº 2.055/2021, o saldo credor acumulado de créditos presumidos da agroindústria que não puder ser deduzido das saídas pode ser ressarcido em espécie ou compensado com quaisquer tributos administrados pela RFB (IRPJ, CSLL, Previdência Patronal).
              </p>

              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/40 text-xs text-purple-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Saldo Credor Disponível para Pedido de Ressarcimento:</div>
                  <div className="text-lg font-bold text-purple-300 mt-0.5">
                    R$ {(resumo?.totalGeralCreditoPresumidoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <button
                  onClick={() => setMensagemSucesso('Arquivo de exportação PER/DCOMP gerado com sucesso.')}
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold transition shadow-md"
                >
                  Exportar Lote PER/DCOMP
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: LAUDO OFICIAL A4 */}
        {activeTab === 'laudo_a4' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md transition"
              >
                <Printer className="w-4 h-4" />
                Imprimir Memória de Cálculo A4
              </button>
            </div>

            <div className="max-w-4xl mx-auto bg-white text-gray-900 p-8 rounded-xl shadow-2xl border border-gray-300 font-sans text-xs print:p-0 print:border-none print:shadow-none">
              <div className="border-b-2 border-gray-900 pb-4 mb-4 flex justify-between items-start">
                <div>
                  <h2 className="text-base font-extrabold uppercase tracking-tight text-gray-900">
                    Memória de Cálculo de Crédito Presumido de PIS e COFINS
                  </h2>
                  <div className="text-xs font-bold text-gray-700">
                    AGRONEGÓCIO & AGROINDÚSTRIA (ART. 8º DA LEI Nº 10.925/2004)
                  </div>
                  <div className="text-[11px] text-gray-600 mt-1">
                    Beneficiária: <strong>EMPRESA PADRAO LTDA (AGROINDÚSTRIA)</strong> • CNPJ: <strong>01.234.567/0001-89</strong>
                  </div>
                </div>
                <div className="text-right text-[11px] text-gray-600">
                  <div>Competência: <strong>{resumo?.competencia}</strong></div>
                  <div>Emissão: <strong>{new Date().toLocaleDateString('pt-BR')}</strong></div>
                  <div>Regime: <strong>Não-Cumulativo</strong></div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-gray-50 border border-gray-300 rounded text-center">
                <div>
                  <div className="text-[10px] text-gray-500 font-semibold uppercase">Total Aquisições Agro</div>
                  <div className="text-sm font-bold text-gray-900">
                    R$ {(resumo?.totalValorAquisicaoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-emerald-700 font-semibold uppercase">Crédito Presumido PIS</div>
                  <div className="text-sm font-bold text-emerald-800">
                    R$ {(resumo?.totalCreditoPisBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-teal-700 font-semibold uppercase">Crédito Presumido COFINS</div>
                  <div className="text-sm font-bold text-teal-800">
                    R$ {(resumo?.totalCreditoCofinsBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <table className="w-full text-left border border-gray-300 text-[11px]">
                  <thead className="bg-gray-100 font-bold border-b border-gray-300">
                    <tr>
                      <th className="p-1.5 border-r border-gray-300">NF-e Entrada</th>
                      <th className="p-1.5 border-r border-gray-300">Produtor Rural / Cooperativa</th>
                      <th className="p-1.5 border-r border-gray-300">Insumo</th>
                      <th className="p-1.5 border-r border-gray-300 text-right">Valor Compra</th>
                      <th className="p-1.5 border-r border-gray-300 text-center">% Presumido</th>
                      <th className="p-1.5 border-r border-gray-300 text-right">PIS</th>
                      <th className="p-1.5 border-r border-gray-300 text-right">COFINS</th>
                      <th className="p-1.5 text-right">Total Crédito</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(resumo?.insumos || []).map((ins, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="p-1.5 border-r border-gray-300 font-semibold">{ins.numeroDocumentoFiscal}</td>
                        <td className="p-1.5 border-r border-gray-300">{ins.produtorNomeRazaoSocial}</td>
                        <td className="p-1.5 border-r border-gray-300">{ins.descricaoProduto}</td>
                        <td className="p-1.5 border-r border-gray-300 text-right">
                          R$ {ins.valorAquisicaoInsumoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-1.5 border-r border-gray-300 text-center">{ins.percentualCreditoPresumidoAplicado}%</td>
                        <td className="p-1.5 border-r border-gray-300 text-right text-emerald-800">
                          R$ {ins.valorCreditoPresumidoPisBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-1.5 border-r border-gray-300 text-right text-teal-800">
                          R$ {ins.valorCreditoPresumidoCofinsBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-1.5 text-right font-bold text-gray-900">
                          R$ {ins.valorTotalCreditoPresumidoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 pt-4 border-t border-gray-300 flex justify-between items-end text-[11px] text-gray-700">
                <div className="space-y-1">
                  <div>Base Legal: <strong>Art. 8º da Lei nº 10.925/2004 e IN RFB nº 2.121/2022</strong></div>
                  <div>Escrituração: <strong>EFD-Contribuições Blocos M100/M500</strong></div>
                </div>
                <div className="text-center w-64 border-t border-gray-800 pt-1">
                  <div className="font-bold text-gray-900">Responsável Contábil / Tributário</div>
                  <div className="text-[10px] text-gray-500">CRC Ativo • Auditoria Fiscal</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: NOVA AQUISIÇÃO AGRO */}
      {modalNovoInsumo && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#181818] border border-gray-800 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                Registrar Aquisição Agropecuária com Crédito Presumido
              </h3>
              <button onClick={() => setModalNovoInsumo(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSalvarNovoInsumo} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Nota Fiscal de Entrada *</label>
                  <input
                    type="text"
                    required
                    value={formInsumo.numeroDocumentoFiscal}
                    onChange={e => setFormInsumo({ ...formInsumo, numeroDocumentoFiscal: e.target.value })}
                    placeholder="Ex: NFP-e 000.550"
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Data de Entrada</label>
                  <input
                    type="date"
                    value={formInsumo.dataEntrada}
                    onChange={e => setFormInsumo({ ...formInsumo, dataEntrada: e.target.value })}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Nome / Razão Social do Produtor Rural *</label>
                <input
                  type="text"
                  required
                  value={formInsumo.produtorNomeRazaoSocial}
                  onChange={e => setFormInsumo({ ...formInsumo, produtorNomeRazaoSocial: e.target.value })}
                  placeholder="Nome do produtor rural pessoa física ou cooperativa"
                  className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">CPF / CNPJ</label>
                  <input
                    type="text"
                    value={formInsumo.produtorCpfCnpj}
                    onChange={e => setFormInsumo({ ...formInsumo, produtorCpfCnpj: e.target.value })}
                    placeholder="CPF ou CNPJ"
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">UF Origem</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={formInsumo.produtorUf}
                    onChange={e => setFormInsumo({ ...formInsumo, produtorUf: e.target.value.toUpperCase() })}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Origem Legal</label>
                  <select
                    value={formInsumo.origemProdutor}
                    onChange={e => setFormInsumo({ ...formInsumo, origemProdutor: e.target.value as OrigemProdutorAgro })}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="PESSOA_FISICA_PRODUTOR_RURAL">Pessoa Física</option>
                    <option value="COOPERATIVA_AGROPECUARIA">Cooperativa</option>
                    <option value="PRODUTOR_RURAL_PJ_ISENTO">Produtor Rural Isento</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Tipo de Insumo</label>
                  <select
                    value={formInsumo.tipoInsumo}
                    onChange={e => {
                      const val = e.target.value as TipoInsumoAgropecuario;
                      const pct = val === 'LEITE_IN_NATURA' ? 60.0 : 35.0;
                      setFormInsumo({ ...formInsumo, tipoInsumo: val, percentualCreditoPresumidoAplicado: pct });
                    }}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="LEITE_IN_NATURA">Leite In Natura (60% da alíquota)</option>
                    <option value="GRAOS_SOJA_MILHO">Grãos (Soja/Milho - 35%)</option>
                    <option value="CARNES_BOVINA_SUINA_AVES">Carnes / Animais Abate (35%)</option>
                    <option value="CAFE_EM_GRAO">Café em Grão (35%)</option>
                    <option value="CEREAIS_TRIGO_ARROZ">Cereais (35%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">% Crédito Presumido</label>
                  <select
                    value={formInsumo.percentualCreditoPresumidoAplicado}
                    onChange={e => setFormInsumo({ ...formInsumo, percentualCreditoPresumidoAplicado: Number(e.target.value) as PercentualAliquotaPresumida })}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value={60.0}>60% (PIS 0,99% / COFINS 4,56%)</option>
                    <option value={35.0}>35% (PIS 0,5775% / COFINS 2,66%)</option>
                    <option value={50.0}>50% (PIS 0,825% / COFINS 3,80%)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Valor Total da Compra (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formInsumo.valorAquisicaoInsumoBRL}
                    onChange={e => setFormInsumo({ ...formInsumo, valorAquisicaoInsumoBRL: Number(e.target.value) })}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Descrição do Produto</label>
                  <input
                    type="text"
                    value={formInsumo.descricaoProduto}
                    onChange={e => setFormInsumo({ ...formInsumo, descricaoProduto: e.target.value })}
                    placeholder="Ex: Leite cru resfriado"
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalNovoInsumo(false)}
                  className="px-3 py-1.5 rounded-lg bg-[#242424] hover:bg-[#2b2b2b] text-gray-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-900/30"
                >
                  Apurar Crédito Presumido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
