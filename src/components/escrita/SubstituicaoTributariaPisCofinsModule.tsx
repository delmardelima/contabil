import React, { useState, useEffect } from 'react';
import {
  Layers,
  DollarSign,
  FileText,
  Printer,
  Plus,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Building,
  Calendar,
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
  Landmark,
  Barcode,
  Package
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  ItemSubstituicaoPisCofins,
  ResumoPisCofinsST,
  SegmentoSubstituicaoPisCofins,
  PapelCadeiaPisCofins
} from '../../types/contabil';

export const SubstituicaoTributariaPisCofinsModule: React.FC = () => {
  const [resumo, setResumo] = useState<ResumoPisCofinsST | null>(null);
  const [selectedItem, setSelectedItem] = useState<ItemSubstituicaoPisCofins | null>(null);
  const [activeTab, setActiveTab] = useState<'operacoes_st' | 'darf_recolhimento' | 'economia_substituido' | 'guia_oficial_a4'>('operacoes_st');
  const [filtroSegmento, setFiltroSegmento] = useState<string>('TODOS');
  const [filtroPapel, setFiltroPapel] = useState<string>('TODOS');
  const [termoBusca, setTermoBusca] = useState('');

  // Modais
  const [modalNovoItem, setModalNovoItem] = useState(false);

  // Feedbacks
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  // Form State: Nova Operação ST
  const [formItem, setFormItem] = useState<Partial<ItemSubstituicaoPisCofins>>({
    tipoOperacao: 'SAIDA_SUBSTITUTO',
    papelCadeia: 'SUBSTITUTO_FABRICANTE_IMPORTADOR',
    segmento: 'AUTOPECAS_VEICULOS',
    numeroNotaFiscal: '',
    serie: '1',
    dataOperacao: new Date().toISOString().split('T')[0],
    razaoSocialContraparte: '',
    cnpjContraparte: '',
    ufContraparte: 'SP',
    codigoProdutoNcm: '8708.29.99',
    descricaoItem: '',
    valorMercadoriaBRL: 50000,
    percentualMvaAjustada: 40.0,
    aliquotaPisStPercentual: 1.65,
    aliquotaCofinsStPercentual: 7.60,
    cstPisCofins: '05',
    codigoReceitaDarfPisSt: '6912',
    codigoReceitaDarfCofinsSt: '6824',
    observacoes: ''
  });

  const carregarDados = () => {
    const dados = dbService.getPisCofinsST();
    setResumo(dados);
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleSalvarNovoItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formItem.numeroNotaFiscal || !formItem.razaoSocialContraparte || !formItem.valorMercadoriaBRL) {
      setMensagemErro('Preencha os campos obrigatórios da operação de PIS/COFINS ST.');
      return;
    }

    const vlrMercadoria = Number(formItem.valorMercadoriaBRL);
    const mva = Number(formItem.percentualMvaAjustada || 0);
    const isSubstituto = formItem.tipoOperacao === 'SAIDA_SUBSTITUTO';

    const baseSt = isSubstituto ? Number((vlrMercadoria * (1 + mva / 100)).toFixed(2)) : 0;
    const aliqPis = isSubstituto ? Number(formItem.aliquotaPisStPercentual || 1.65) : 0;
    const aliqCofins = isSubstituto ? Number(formItem.aliquotaCofinsStPercentual || 7.60) : 0;
    const vlrPisSt = isSubstituto ? Number(((baseSt * aliqPis) / 100).toFixed(2)) : 0;
    const vlrCofinsSt = isSubstituto ? Number(((baseSt * aliqCofins) / 100).toFixed(2)) : 0;
    const totalSt = Number((vlrPisSt + vlrCofinsSt).toFixed(2));

    const novo: ItemSubstituicaoPisCofins = {
      id: `st-pc-${Date.now()}`,
      empresaId: resumo?.empresaId || 1,
      tipoOperacao: (formItem.tipoOperacao || 'SAIDA_SUBSTITUTO') as any,
      papelCadeia: (formItem.papelCadeia || 'SUBSTITUTO_FABRICANTE_IMPORTADOR') as PapelCadeiaPisCofins,
      segmento: (formItem.segmento || 'AUTOPECAS_VEICULOS') as SegmentoSubstituicaoPisCofins,
      numeroNotaFiscal: formItem.numeroNotaFiscal,
      serie: formItem.serie || '1',
      dataOperacao: formItem.dataOperacao || new Date().toISOString().split('T')[0],
      razaoSocialContraparte: formItem.razaoSocialContraparte,
      cnpjContraparte: formItem.cnpjContraparte || '00.000.000/0001-00',
      ufContraparte: formItem.ufContraparte || 'SP',
      codigoProdutoNcm: formItem.codigoProdutoNcm || '0000.00.00',
      descricaoItem: formItem.descricaoItem || 'Item sujeito a substituição tributária de PIS e COFINS',
      valorMercadoriaBRL: vlrMercadoria,
      percentualMvaAjustada: mva,
      baseCalculoPisCofinsStBRL: baseSt,
      aliquotaPisStPercentual: aliqPis,
      aliquotaCofinsStPercentual: aliqCofins,
      valorPisStCalculadoBRL: vlrPisSt,
      valorCofinsStCalculadoBRL: vlrCofinsSt,
      valorTotalPisCofinsStBRL: totalSt,
      cstPisCofins: formItem.cstPisCofins || '05',
      codigoReceitaDarfPisSt: isSubstituto ? '6912' : '0000',
      codigoReceitaDarfCofinsSt: isSubstituto ? '6824' : '0000',
      codigoBarrasDarfFebraban: isSubstituto ? `8589000000${Math.floor(totalSt)} 000000851001 926042000000 000000000000` : '',
      statusRecolhimento: isSubstituto ? 'DARF_GERADO' : 'DESONERADO_SAIDA_SUBSTITUIDO',
      integradoContabil: false,
      observacoes: formItem.observacoes || ''
    };

    const res = dbService.salvarItemSubstituicaoPisCofins(novo);
    if (res.sucesso) {
      setMensagemSucesso(res.mensagem);
      setModalNovoItem(false);
      carregarDados();
    } else {
      setMensagemErro('Erro ao registrar operação de ST PIS/COFINS.');
    }
  };

  const handleIntegrarContabil = (id: string) => {
    const res = dbService.integrarPisCofinsStContabil(id);
    if (res.sucesso) {
      setMensagemSucesso(res.mensagem);
      carregarDados();
    } else {
      setMensagemErro(res.mensagem);
    }
  };

  const itensFiltrados = (resumo?.itens || []).filter(item => {
    const matchSeg = filtroSegmento === 'TODOS' || item.segmento === filtroSegmento;
    const matchPapel = filtroPapel === 'TODOS' || item.papelCadeia === filtroPapel;
    const matchBusca = termoBusca === '' ||
      item.numeroNotaFiscal.toLowerCase().includes(termoBusca.toLowerCase()) ||
      item.razaoSocialContraparte.toLowerCase().includes(termoBusca.toLowerCase()) ||
      item.descricaoItem.toLowerCase().includes(termoBusca.toLowerCase()) ||
      item.codigoProdutoNcm.toLowerCase().includes(termoBusca.toLowerCase());
    return matchSeg && matchPapel && matchBusca;
  });

  return (
    <div className="flex flex-col h-full bg-[#121212] text-gray-200 overflow-y-auto">
      {/* Top Banner / Header */}
      <div className="border-b border-gray-800 bg-[#181818] px-6 py-4 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-lg shadow-indigo-900/30">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-wide">
                Substituição Tributária de PIS e COFINS (ST / Monofásico)
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Leis 10.485/02, 9.718/98 & 10.147/00
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Retenção e DARF 6912/6824 pelo fabricante • Alíquota zero (CST 05/04) e não bitributação para distribuidores e varejistas
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
            onClick={() => setActiveTab('guia_oficial_a4')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#242424] hover:bg-[#2e2e2e] text-gray-300 text-xs font-medium border border-gray-700 transition"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-400" />
            Memória de Cálculo A4
          </button>
          <button
            onClick={() => setModalNovoItem(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-900/40 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Nova Operação ST
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
          onClick={() => setActiveTab('operacoes_st')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition ${
            activeTab === 'operacoes_st'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Operações Sujeitas a ST ({resumo?.itens.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('darf_recolhimento')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition ${
            activeTab === 'darf_recolhimento'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Landmark className="w-4 h-4" />
          DARF de Retenção (Códigos 6912 / 6824)
        </button>
        <button
          onClick={() => setActiveTab('economia_substituido')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition ${
            activeTab === 'economia_substituido'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Desoneração no Varejo (CST 05 Alíquota Zero)
        </button>
        <button
          onClick={() => setActiveTab('guia_oficial_a4')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition ${
            activeTab === 'guia_oficial_a4'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Printer className="w-4 h-4" />
          Memória de Cálculo Oficial A4
        </button>
      </div>

      {/* Main Content Area */}
      <div className="p-6 flex-1">
        {/* TAB 1: OPERAÇÕES */}
        {activeTab === 'operacoes_st' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#1b1b1b] border border-gray-800 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Base de Cálculo ST</span>
                  <Package className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-2xl font-bold text-white tracking-tight">
                  R$ {(resumo?.totalBaseStBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-gray-400 mt-2">
                  Com agregação de <span className="text-indigo-400 font-semibold">MVA Ajustada</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#1b1b1b] border border-gray-800 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">PIS ST Devido (DARF 6912)</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-emerald-400 tracking-tight">
                  R$ {(resumo?.totalPisStBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-gray-400 mt-2">
                  Retenção na fonte pelo fabricante
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#1b1b1b] border border-gray-800 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">COFINS ST Devida (DARF 6824)</span>
                  <DollarSign className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-blue-400 tracking-tight">
                  R$ {(resumo?.totalCofinsStBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-gray-400 mt-2">
                  Retenção na fonte pelo fabricante
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#1b1b1b] border border-gray-800 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Economia Varejo (CST 05/04)</span>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-emerald-400 tracking-tight">
                  R$ {(resumo?.totalDesoneracaoSubstituidoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-emerald-300 mt-2">
                  Não incidência (9,25% poupados)
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
                    placeholder="Buscar NF, produto ou cliente..."
                    className="w-full pl-9 pr-3 py-1.5 bg-[#121212] border border-gray-700 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span>Segmento:</span>
                  <select
                    value={filtroSegmento}
                    onChange={e => setFiltroSegmento(e.target.value)}
                    className="bg-[#121212] border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="TODOS">Todos os Segmentos</option>
                    <option value="AUTOPECAS_VEICULOS">Autopeças e Veículos (Lei 10.485/02)</option>
                    <option value="BEBIDAS_FRIAS_CERVEJAS">Bebidas Frias / Cervejas (Lei 9.718/98)</option>
                    <option value="CIGARROS_TABACO">Cigarros e Tabaco</option>
                    <option value="FARMACEUTICOS_COSMETICOS">Farmacêuticos e Perfumaria (Lei 10.147/00)</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span>Papel:</span>
                  <select
                    value={filtroPapel}
                    onChange={e => setFiltroPapel(e.target.value)}
                    className="bg-[#121212] border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="TODOS">Todos os Papéis</option>
                    <option value="SUBSTITUTO_FABRICANTE_IMPORTADOR">Substituto (Recolhedor)</option>
                    <option value="SUBSTITUIDO_VAREJISTA">Substituído (Desonerado)</option>
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
                      <th className="py-3 px-4">Nota Fiscal / Data</th>
                      <th className="py-3 px-4">Papel / Segmento</th>
                      <th className="py-3 px-4">Cliente / Contraparte</th>
                      <th className="py-3 px-4">NCM / Descrição</th>
                      <th className="py-3 px-4 text-right">Valor Mercadoria</th>
                      <th className="py-3 px-4 text-right">MVA (%)</th>
                      <th className="py-3 px-4 text-right">Base ST</th>
                      <th className="py-3 px-4 text-right">PIS ST (6912)</th>
                      <th className="py-3 px-4 text-right">COFINS ST (6824)</th>
                      <th className="py-3 px-4 text-center">Status / Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {itensFiltrados.map(item => (
                      <tr key={item.id} className="hover:bg-[#1d1d1d] transition">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">{item.numeroNotaFiscal}</div>
                          <div className="text-[11px] text-gray-400 mt-0.5">{item.dataOperacao}</div>
                        </td>
                        <td className="py-3 px-4">
                          {item.papelCadeia === 'SUBSTITUTO_FABRICANTE_IMPORTADOR' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                              Substituto
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Substituído (Aliq. Zero)
                            </span>
                          )}
                          <div className="text-[10px] text-gray-500 mt-0.5">
                            {item.segmento.replace(/_/g, ' ')}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-200">{item.razaoSocialContraparte}</div>
                          <div className="text-[11px] text-gray-500 font-mono">{item.cnpjContraparte} ({item.ufContraparte})</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-gray-300 font-medium">{item.descricaoItem}</div>
                          <div className="text-[10px] text-indigo-400/80 font-mono mt-0.5">NCM: {item.codigoProdutoNcm}</div>
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-white">
                          R$ {item.valorMercadoriaBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-400 font-medium">
                          {item.percentualMvaAjustada > 0 ? `${item.percentualMvaAjustada.toFixed(1)}%` : '-'}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-gray-300">
                          {item.baseCalculoPisCofinsStBRL > 0 ? (
                            `R$ ${item.baseCalculoPisCofinsStBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                          ) : (
                            <span className="text-emerald-400 font-semibold">Desonerada</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-emerald-400">
                          {item.valorPisStCalculadoBRL > 0 ? (
                            `R$ ${item.valorPisStCalculadoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-blue-400">
                          {item.valorCofinsStCalculadoBRL > 0 ? (
                            `R$ ${item.valorCofinsStCalculadoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                          ) : (
                            '-'
                          )}
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
                                className="px-2.5 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-600/40 text-[11px] font-semibold transition flex items-center gap-1"
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

        {/* TAB 2: DARF DE RECOLHIMENTO */}
        {activeTab === 'darf_recolhimento' && (
          <div className="space-y-6">
            <div className="p-5 rounded-xl bg-[#181818] border border-gray-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-3">
                <Landmark className="w-4 h-4 text-indigo-400" />
                Guias DARF de PIS-ST e COFINS-ST (Substituto Tributário)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-[#1e1e1e] to-[#171717] border border-gray-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-emerald-400">DARF Código 6912 - PIS/PASEP Substituição Tributária</span>
                    <span className="text-gray-400">Vencimento: 25/04/2026</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    R$ {(resumo?.totalPisStBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Recolhimento centralizado na Secretaria Especial da Receita Federal do Brasil.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-[#1e1e1e] to-[#171717] border border-gray-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-blue-400">DARF Código 6824 - COFINS Substituição Tributária</span>
                    <span className="text-gray-400">Vencimento: 25/04/2026</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    R$ {(resumo?.totalCofinsStBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Apuração por competência com emissão de guia única unificada.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ECONOMIA SUBSTÍTUÍDO */}
        {activeTab === 'economia_substituido' && (
          <div className="space-y-6">
            <div className="p-5 rounded-xl bg-[#181818] border border-gray-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Desoneração Tributária na Saída de Atacadistas e Varejistas (CST 05 / 04)
              </h3>
              <p className="text-xs text-gray-400">
                Pela sistemática da substituição tributária e da incidência monofásica, as saídas promovidas por pessoas jurídicas comerciantes atacadistas ou varejistas são desoneradas de PIS e COFINS (alíquota zero), uma vez que a carga fiscal de toda a cadeia já foi integralmente suportada pelo fabricante/importador no primeiro elo.
              </p>

              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-xs text-emerald-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Economia Tributária Real Gerada no Período:</div>
                  <div className="text-2xl font-bold text-emerald-400 mt-0.5">
                    R$ {(resumo?.totalDesoneracaoSubstituidoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-1">
                    Cálculo baseado em 9,25% (PIS 1,65% + COFINS 7,60%) sobre o faturamento de produtos com CST 05/04.
                  </div>
                </div>
                <span className="px-3 py-1.5 rounded-lg bg-emerald-600/30 text-emerald-300 font-bold border border-emerald-500/40">
                  Zero Bitributação
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: GUIA OFICIAL A4 */}
        {activeTab === 'guia_oficial_a4' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition"
              >
                <Printer className="w-4 h-4" />
                Imprimir Memória de Cálculo A4
              </button>
            </div>

            <div className="max-w-4xl mx-auto bg-white text-gray-900 p-8 rounded-xl shadow-2xl border border-gray-300 font-sans text-xs print:p-0 print:border-none print:shadow-none">
              <div className="border-b-2 border-gray-900 pb-4 mb-4 flex justify-between items-start">
                <div>
                  <h2 className="text-base font-extrabold uppercase tracking-tight text-gray-900">
                    Memória de Cálculo - Substituição Tributária de PIS e COFINS
                  </h2>
                  <div className="text-xs font-bold text-gray-700">
                    APURAÇÃO TRIBUTÁRIA CONFORME LEIS 10.485/02, 9.718/98 E 10.147/00
                  </div>
                  <div className="text-[11px] text-gray-600 mt-1">
                    Empresa: <strong>EMPRESA PADRAO LTDA</strong> • CNPJ: <strong>01.234.567/0001-89</strong>
                  </div>
                </div>
                <div className="text-right text-[11px] text-gray-600">
                  <div>Competência: <strong>{resumo?.competencia}</strong></div>
                  <div>Emissão: <strong>{new Date().toLocaleDateString('pt-BR')}</strong></div>
                  <div>Regime: <strong>Substituição Tributária / Monofásico</strong></div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-4 p-3 bg-gray-50 border border-gray-300 rounded text-center">
                <div>
                  <div className="text-[10px] text-gray-500 font-semibold uppercase">Total Base ST</div>
                  <div className="text-sm font-bold text-gray-900">
                    R$ {(resumo?.totalBaseStBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-emerald-700 font-semibold uppercase">PIS ST (6912)</div>
                  <div className="text-sm font-bold text-emerald-800">
                    R$ {(resumo?.totalPisStBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-blue-700 font-semibold uppercase">COFINS ST (6824)</div>
                  <div className="text-sm font-bold text-blue-800">
                    R$ {(resumo?.totalCofinsStBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-700 font-semibold uppercase">Total Geral ST</div>
                  <div className="text-sm font-bold text-gray-900">
                    R$ {(resumo?.totalGeralStBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <table className="w-full text-left border border-gray-300 text-[11px]">
                  <thead className="bg-gray-100 font-bold border-b border-gray-300">
                    <tr>
                      <th className="p-1.5 border-r border-gray-300">NF-e</th>
                      <th className="p-1.5 border-r border-gray-300">Cliente / Destinatário</th>
                      <th className="p-1.5 border-r border-gray-300">Segmento</th>
                      <th className="p-1.5 border-r border-gray-300 text-right">Vlr. Mercadoria</th>
                      <th className="p-1.5 border-r border-gray-300 text-right">MVA</th>
                      <th className="p-1.5 border-r border-gray-300 text-right">Base ST</th>
                      <th className="p-1.5 border-r border-gray-300 text-right">PIS ST</th>
                      <th className="p-1.5 text-right">COFINS ST</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(resumo?.itens || []).map((it, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="p-1.5 border-r border-gray-300 font-semibold">{it.numeroNotaFiscal}</td>
                        <td className="p-1.5 border-r border-gray-300">{it.razaoSocialContraparte}</td>
                        <td className="p-1.5 border-r border-gray-300">{it.segmento.replace(/_/g, ' ')}</td>
                        <td className="p-1.5 border-r border-gray-300 text-right">
                          R$ {it.valorMercadoriaBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-1.5 border-r border-gray-300 text-right">
                          {it.percentualMvaAjustada > 0 ? `${it.percentualMvaAjustada}%` : '-'}
                        </td>
                        <td className="p-1.5 border-r border-gray-300 text-right">
                          R$ {it.baseCalculoPisCofinsStBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-1.5 border-r border-gray-300 text-right text-emerald-800">
                          R$ {it.valorPisStCalculadoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-1.5 text-right text-blue-800 font-semibold">
                          R$ {it.valorCofinsStCalculadoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 pt-4 border-t border-gray-300 flex justify-between items-end text-[11px] text-gray-700">
                <div className="space-y-1">
                  <div>Recolhimento: <strong>DARF 6912 (PIS) e DARF 6824 (COFINS)</strong></div>
                  <div>Vencimento Regulamentar: <strong>Dia 25 do mês subsequente</strong></div>
                </div>
                <div className="text-center w-64 border-t border-gray-800 pt-1">
                  <div className="font-bold text-gray-900">Responsável Tributário</div>
                  <div className="text-[10px] text-gray-500">CRC/SP • Escrituração Concluída</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: NOVA OPERAÇÃO ST */}
      {modalNovoItem && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#181818] border border-gray-800 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                Registrar Operação Sujeita a PIS/COFINS ST
              </h3>
              <button onClick={() => setModalNovoItem(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSalvarNovoItem} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Tipo de Operação</label>
                  <select
                    value={formItem.tipoOperacao}
                    onChange={e => {
                      const val = e.target.value as any;
                      const papel = val === 'SAIDA_SUBSTITUTO' ? 'SUBSTITUTO_FABRICANTE_IMPORTADOR' : 'SUBSTITUIDO_VAREJISTA';
                      setFormItem({ ...formItem, tipoOperacao: val, papelCadeia: papel });
                    }}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="SAIDA_SUBSTITUTO">Saída pelo Substituto (Fabricante/Importador)</option>
                    <option value="SAIDA_SUBSTITUIDO">Saída pelo Substituído (Atacado/Varejo - Isento)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Segmento</label>
                  <select
                    value={formItem.segmento}
                    onChange={e => setFormItem({ ...formItem, segmento: e.target.value as SegmentoSubstituicaoPisCofins })}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="AUTOPECAS_VEICULOS">Autopeças e Veículos (Lei 10.485/02)</option>
                    <option value="BEBIDAS_FRIAS_CERVEJAS">Bebidas Frias / Cervejas (Lei 9.718/98)</option>
                    <option value="CIGARROS_TABACO">Cigarros e Tabaco</option>
                    <option value="FARMACEUTICOS_COSMETICOS">Farmacêuticos / Perfumaria</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Nota Fiscal *</label>
                  <input
                    type="text"
                    required
                    value={formItem.numeroNotaFiscal}
                    onChange={e => setFormItem({ ...formItem, numeroNotaFiscal: e.target.value })}
                    placeholder="Ex: NF-e 045.100"
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Data Operação</label>
                  <input
                    type="date"
                    value={formItem.dataOperacao}
                    onChange={e => setFormItem({ ...formItem, dataOperacao: e.target.value })}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Razão Social do Cliente / Contraparte *</label>
                <input
                  type="text"
                  required
                  value={formItem.razaoSocialContraparte}
                  onChange={e => setFormItem({ ...formItem, razaoSocialContraparte: e.target.value })}
                  placeholder="Nome do cliente adquirente"
                  className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">CNPJ</label>
                  <input
                    type="text"
                    value={formItem.cnpjContraparte}
                    onChange={e => setFormItem({ ...formItem, cnpjContraparte: e.target.value })}
                    placeholder="00.000.000/0001-00"
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">UF</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={formItem.ufContraparte}
                    onChange={e => setFormItem({ ...formItem, ufContraparte: e.target.value.toUpperCase() })}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">NCM</label>
                  <input
                    type="text"
                    value={formItem.codigoProdutoNcm}
                    onChange={e => setFormItem({ ...formItem, codigoProdutoNcm: e.target.value })}
                    placeholder="8708.29.99"
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Valor Mercadoria (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formItem.valorMercadoriaBRL}
                    onChange={e => setFormItem({ ...formItem, valorMercadoriaBRL: Number(e.target.value) })}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">MVA Ajustada (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formItem.percentualMvaAjustada}
                    onChange={e => setFormItem({ ...formItem, percentualMvaAjustada: Number(e.target.value) })}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Descrição do Item</label>
                <input
                  type="text"
                  value={formItem.descricaoItem}
                  onChange={e => setFormItem({ ...formItem, descricaoItem: e.target.value })}
                  placeholder="Ex: Amortecedores veiculares"
                  className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-gray-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalNovoItem(false)}
                  className="px-3 py-1.5 rounded-lg bg-[#242424] hover:bg-[#2b2b2b] text-gray-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-900/30"
                >
                  Salvar Operação ST
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
