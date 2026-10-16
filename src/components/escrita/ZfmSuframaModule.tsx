import React, { useState, useEffect } from 'react';
import {
  Compass,
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
  MapPin,
  ShieldCheck,
  ChevronRight,
  Truck,
  Barcode
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  OperacaoSuframa,
  ResumoOperacoesSuframa,
  TipoBeneficioSuframa,
  StatusPinSuframa
} from '../../types/contabil';

export const ZfmSuframaModule: React.FC = () => {
  const [resumo, setResumo] = useState<ResumoOperacoesSuframa | null>(null);
  const [selectedOp, setSelectedOp] = useState<OperacaoSuframa | null>(null);
  const [activeTab, setActiveTab] = useState<'operacoes' | 'pin_vistoria' | 'economia' | 'sped'>('operacoes');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');

  // Modals
  const [modalNovaOp, setModalNovaOp] = useState(false);
  const [modalStatusPin, setModalStatusPin] = useState(false);
  const [modalLaudoA4, setModalLaudoA4] = useState(false);

  // Feedbacks
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  // Form State: Nova Operação
  const [formOp, setFormOp] = useState<Partial<OperacaoSuframa>>({
    numeroNotaFiscal: '',
    dataEmissao: new Date().toISOString().split('T')[0],
    destinatarioRazaoSocial: '',
    destinatarioCnpj: '',
    inscricaoSuframa: '',
    municipioDestino: 'Manaus',
    ufDestino: 'AM',
    tipoBeneficio: 'ZONA_FRANCA_MANAUS',
    cfop: '6.109',
    valorTotalProdutosBRL: 100000,
    aliquotaIcmsDesoneradoPercentual: 7.0,
    aliquotaPisZeroPercentual: 0.0,
    aliquotaCofinsZeroPercentual: 0.0,
    numeroPinSuframa: '',
    statusPin: 'PIN_GERADO',
    chaveNfe: '',
    observacoes: ''
  });

  // Form State: Atualizar PIN
  const [novoStatusPin, setNovoStatusPin] = useState<StatusPinSuframa>('VISTORIADO_INTERNADO');

  const carregarDados = () => {
    try {
      const data = dbService.getOperacoesSuframa();
      setResumo(data);
      if (data.operacoes.length > 0) {
        if (!selectedOp || !data.operacoes.some(o => o.id === selectedOp.id)) {
          setSelectedOp(data.operacoes[0]);
        } else {
          const atual = data.operacoes.find(o => o.id === selectedOp.id);
          if (atual) setSelectedOp(atual);
        }
      }
    } catch (e: any) {
      setMensagemErro('Erro ao carregar dados SUFRAMA: ' + e.message);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleIntegrarContabil = (id: string) => {
    const res = dbService.integrarSuframaContabil(id);
    if (res.sucesso) {
      setMensagemSucesso(res.mensagem);
      carregarDados();
    } else {
      setMensagemErro(res.mensagem);
    }
  };

  const handleSalvarNovaOp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formOp.numeroNotaFiscal || !formOp.destinatarioRazaoSocial || !formOp.inscricaoSuframa) {
      setMensagemErro('Preencha os campos obrigatórios da operação.');
      return;
    }

    const valorProd = Number(formOp.valorTotalProdutosBRL) || 0;
    const aliqIcms = Number(formOp.aliquotaIcmsDesoneradoPercentual) || 7.0;
    const valorIcmsDesonerado = Math.round(((valorProd * aliqIcms) / 100) * 100) / 100;
    const economiaPis = Math.round(((valorProd * 1.65) / 100) * 100) / 100;
    const economiaCofins = Math.round(((valorProd * 7.60) / 100) * 100) / 100;
    const valorLiquido = valorProd - valorIcmsDesonerado;
    const pin = formOp.numeroPinSuframa || `PIN-2026-${Math.floor(1000000 + Math.random() * 9000000)}`;

    const nova: OperacaoSuframa = {
      id: 'suf-' + Date.now(),
      empresaId: 1,
      numeroNotaFiscal: formOp.numeroNotaFiscal,
      dataEmissao: formOp.dataEmissao || new Date().toISOString().split('T')[0],
      destinatarioRazaoSocial: formOp.destinatarioRazaoSocial,
      destinatarioCnpj: formOp.destinatarioCnpj || '00.000.000/0001-00',
      inscricaoSuframa: formOp.inscricaoSuframa,
      municipioDestino: formOp.municipioDestino || 'Manaus',
      ufDestino: (formOp.ufDestino as any) || 'AM',
      tipoBeneficio: (formOp.tipoBeneficio as any) || 'ZONA_FRANCA_MANAUS',
      cfop: formOp.cfop || '6.109',
      valorTotalProdutosBRL: valorProd,
      aliquotaIcmsDesoneradoPercentual: aliqIcms,
      valorIcmsDesoneradoBRL: valorIcmsDesonerado,
      aliquotaPisZeroPercentual: 0.0,
      valorEconomiaPisBRL: economiaPis,
      aliquotaCofinsZeroPercentual: 0.0,
      valorEconomiaCofinsBRL: economiaCofins,
      valorLiquidoFaturadoBRL: valorLiquido,
      numeroPinSuframa: pin,
      statusPin: 'PIN_GERADO',
      chaveNfe: formOp.chaveNfe || `35260401234567000189550010000${Math.floor(100000 + Math.random() * 900000)}1000000000`,
      integradoContabil: false,
      observacoes: formOp.observacoes || 'Benefício Fiscal ZFM/ALC Convênio ICMS 65/88 e Lei 10.996/04.'
    };

    const res = dbService.salvarOperacaoSuframa(nova);
    if (res.sucesso) {
      setMensagemSucesso(res.mensagem);
      setModalNovaOp(false);
      carregarDados();
    } else {
      setMensagemErro(res.mensagem);
    }
  };

  const handleAtualizarPin = () => {
    if (!selectedOp) return;
    const dataIntern = novoStatusPin === 'VISTORIADO_INTERNADO' ? new Date().toISOString().split('T')[0] : undefined;
    const res = dbService.atualizarStatusPinSuframa(selectedOp.id, novoStatusPin, dataIntern);
    if (res.sucesso) {
      setMensagemSucesso(res.mensagem);
      setModalStatusPin(false);
      carregarDados();
    } else {
      setMensagemErro(res.mensagem);
    }
  };

  const operacoesFiltradas = (resumo?.operacoes || []).filter(op => {
    if (filtroStatus === 'TODOS') return true;
    return op.statusPin === filtroStatus;
  });

  const formatBRL = (val: number) => {
    return (val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0d0f12] text-gray-100 overflow-hidden font-sans">
      {/* Header */}
      <div className="h-14 border-b border-gray-800 bg-[#14161b] px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
              Zona Franca de Manaus & Benefícios SUFRAMA
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/50 px-2 py-0.5 rounded-full font-mono">
                Dec-Lei 288/67 • Convênio 65/88 • Lei 10.996/04
              </span>
            </h1>
            <p className="text-xs text-gray-400">
              Desoneração de ICMS na NF-e • Alíquota Zero PIS/COFINS (CST 06) • Gestão de PIN & Internamento
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setModalLaudoA4(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs rounded border border-gray-700 transition shadow-sm"
          >
            <Printer className="w-4 h-4 text-gray-400" />
            <span>Laudo de Internamento A4</span>
          </button>
          <button
            onClick={() => setModalNovaOp(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Operação SUFRAMA</span>
          </button>
          <button
            onClick={carregarDados}
            className="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-700 transition"
            title="Atualizar Dados"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications */}
      {mensagemSucesso && (
        <div className="bg-emerald-950/80 border-b border-emerald-800/60 px-6 py-2 flex items-center justify-between text-xs text-emerald-200">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{mensagemSucesso}</span>
          </div>
          <button onClick={() => setMensagemSucesso(null)} className="text-emerald-400 hover:text-emerald-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {mensagemErro && (
        <div className="bg-rose-950/80 border-b border-rose-800/60 px-6 py-2 flex items-center justify-between text-xs text-rose-200">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{mensagemErro}</span>
          </div>
          <button onClick={() => setMensagemErro(null)} className="text-rose-400 hover:text-rose-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 p-6 bg-[#0e1015] border-b border-gray-800/80">
        <div className="bg-[#14161d] p-4 rounded-xl border border-gray-800/70 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full group-hover:bg-blue-500/10 transition-all"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Faturamento Bruto ZFM/ALC</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-bold text-white font-mono">
              {formatBRL(resumo?.totalFaturamentoBrutoBRL || 0)}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-gray-500">{resumo?.totalOperacoes || 0} notas emitidas para a região</p>
        </div>

        <div className="bg-[#14161d] p-4 rounded-xl border border-gray-800/70 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full group-hover:bg-amber-500/10 transition-all"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">ICMS Desonerado (Abatido)</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-bold text-amber-400 font-mono">
              {formatBRL(resumo?.totalIcmsDesoneradoBRL || 0)}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-gray-500">Desconto obrigatório no valor total da NF-e</p>
        </div>

        <div className="bg-[#14161d] p-4 rounded-xl border border-gray-800/70 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full group-hover:bg-emerald-500/10 transition-all"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Economia PIS/COFINS Zero</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-bold text-emerald-400 font-mono">
              {formatBRL(resumo?.totalEconomiaPisCofinsBRL || 0)}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-gray-500">Alíquota 0,00% aplicada na venda (CST 06)</p>
        </div>

        <div className="bg-[#14161d] p-4 rounded-xl border border-gray-800/70 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full group-hover:bg-purple-500/10 transition-all"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Status de Internamento PIN</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-400">
              {resumo?.totalOperacoesInternadas || 0} / {resumo?.totalOperacoes || 0}
            </span>
            <span className="text-xs text-gray-400">Internados</span>
          </div>
          <p className="mt-1 text-[11px] text-gray-500">Vistorias físicas e eletrônicas homologadas</p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="px-6 pt-3 bg-[#111318] border-b border-gray-800 flex items-center justify-between">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('operacoes')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'operacoes'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10 rounded-t'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Operações Fiscais ZFM / ALC</span>
          </button>

          <button
            onClick={() => setActiveTab('pin_vistoria')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'pin_vistoria'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10 rounded-t'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Rastreamento do PIN & Vistoria</span>
          </button>

          <button
            onClick={() => setActiveTab('economia')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'economia'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10 rounded-t'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Demonstrativo de Economia Tributária</span>
          </button>

          <button
            onClick={() => setActiveTab('sped')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'sped'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10 rounded-t'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Barcode className="w-4 h-4" />
            <span>Escrituração SPED Fiscal & EFD-Contribuições</span>
          </button>
        </div>

        {activeTab === 'operacoes' && (
          <div className="flex items-center space-x-2 pb-2">
            <span className="text-xs text-gray-400">Filtrar por PIN:</span>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="bg-gray-800 text-gray-200 text-xs px-2.5 py-1 rounded border border-gray-700 outline-none"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="PIN_GERADO">PIN Gerado</option>
              <option value="EM_TRANSITO">Em Trânsito</option>
              <option value="CONFERIDO_POSTO_FISCAL">Conferido Posto Fiscal</option>
              <option value="VISTORIADO_INTERNADO">Vistoriado / Internado</option>
            </select>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* TAB 1: OPERAÇÕES FISCAIS */}
        {activeTab === 'operacoes' && (
          <div className="space-y-6">
            <div className="bg-[#14161f] border border-gray-800 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#181b24] text-gray-400 border-b border-gray-800 font-mono">
                  <tr>
                    <th className="py-3 px-4">Nota Fiscal</th>
                    <th className="py-3 px-4">Data</th>
                    <th className="py-3 px-4">Destinatário & UF</th>
                    <th className="py-3 px-4">Inscrição SUFRAMA</th>
                    <th className="py-3 px-4">CFOP</th>
                    <th className="py-3 px-4 text-right">Valor Bruto</th>
                    <th className="py-3 px-4 text-right text-amber-400">ICMS Desonerado</th>
                    <th className="py-3 px-4 text-right text-emerald-400">Valor Líquido NF</th>
                    <th className="py-3 px-4">Número do PIN</th>
                    <th className="py-3 px-4 text-center">Status Internamento</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 font-mono">
                  {operacoesFiltradas.map((op) => (
                    <tr
                      key={op.id}
                      onClick={() => setSelectedOp(op)}
                      className={`hover:bg-gray-800/40 transition cursor-pointer ${
                        selectedOp?.id === op.id ? 'bg-[#181d2a]' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-bold text-white">{op.numeroNotaFiscal}</td>
                      <td className="py-3 px-4 text-gray-400">{op.dataEmissao}</td>
                      <td className="py-3 px-4 font-sans text-gray-200">
                        {op.destinatarioRazaoSocial}
                        <span className="ml-1 text-[10px] text-gray-500 font-mono">({op.ufDestino})</span>
                      </td>
                      <td className="py-3 px-4 text-emerald-400 font-bold">{op.inscricaoSuframa}</td>
                      <td className="py-3 px-4 text-gray-300">{op.cfop}</td>
                      <td className="py-3 px-4 text-right text-gray-200 font-bold">{formatBRL(op.valorTotalProdutosBRL)}</td>
                      <td className="py-3 px-4 text-right text-amber-400 font-bold">-{formatBRL(op.valorIcmsDesoneradoBRL)}</td>
                      <td className="py-3 px-4 text-right text-emerald-400 font-bold">{formatBRL(op.valorLiquidoFaturadoBRL)}</td>
                      <td className="py-3 px-4 text-gray-300 font-bold">{op.numeroPinSuframa}</td>
                      <td className="py-3 px-4 text-center font-sans">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            op.statusPin === 'VISTORIADO_INTERNADO'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : op.statusPin === 'CONFERIDO_POSTO_FISCAL'
                              ? 'bg-blue-950 text-blue-300 border border-blue-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {op.statusPin === 'VISTORIADO_INTERNADO'
                            ? 'Internado'
                            : op.statusPin === 'CONFERIDO_POSTO_FISCAL'
                            ? 'Posto Fiscal'
                            : op.statusPin === 'EM_TRANSITO'
                            ? 'Em Trânsito'
                            : 'PIN Gerado'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5 font-sans">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOp(op);
                              setModalStatusPin(true);
                            }}
                            className="p-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-700 transition"
                            title="Atualizar Status do PIN"
                          >
                            <Truck className="w-3.5 h-3.5 text-blue-400" />
                          </button>
                          {!op.integradoContabil && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleIntegrarContabil(op.id);
                              }}
                              className="px-2 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-[10px] rounded transition flex items-center gap-1"
                              title="Integrar Desoneração Contábil"
                            >
                              <Database className="w-3 h-3" />
                              <span>Integrar</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Selected Operation Detail Card */}
            {selectedOp && (
              <div className="bg-[#14161f] border border-gray-800 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Compass className="w-4 h-4 text-emerald-400" />
                      Detalhamento do Benefício Fiscal: {selectedOp.numeroNotaFiscal} - {selectedOp.destinatarioRazaoSocial}
                    </h3>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">
                      Chave NFe: {selectedOp.chaveNfe} • PIN: {selectedOp.numeroPinSuframa}
                    </p>
                  </div>
                  <button
                    onClick={() => setModalStatusPin(true)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded transition flex items-center gap-1.5"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Atualizar Vistoria PIN</span>
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-4 text-xs font-mono">
                  <div className="p-3 bg-gray-900/60 rounded border border-gray-800">
                    <span className="text-gray-400 font-sans block text-[11px]">Valor Bruto Produtos</span>
                    <span className="text-sm font-bold text-gray-100">{formatBRL(selectedOp.valorTotalProdutosBRL)}</span>
                    <span className="text-[10px] text-gray-500 block font-sans">Preço de tabela normal</span>
                  </div>
                  <div className="p-3 bg-gray-900/60 rounded border border-gray-800">
                    <span className="text-gray-400 font-sans block text-[11px]">ICMS Desonerado (7%)</span>
                    <span className="text-sm font-bold text-amber-400">-{formatBRL(selectedOp.valorIcmsDesoneradoBRL)}</span>
                    <span className="text-[10px] text-amber-500/80 block font-sans">Abatimento Conv. ICMS 65/88</span>
                  </div>
                  <div className="p-3 bg-gray-900/60 rounded border border-gray-800">
                    <span className="text-gray-400 font-sans block text-[11px]">PIS / COFINS Alíquota Zero</span>
                    <span className="text-sm font-bold text-emerald-400">
                      +{formatBRL(selectedOp.valorEconomiaPisBRL + selectedOp.valorEconomiaCofinsBRL)}
                    </span>
                    <span className="text-[10px] text-emerald-500/80 block font-sans">Economia Lei 10.996/04</span>
                  </div>
                  <div className="p-3 bg-gray-900/60 rounded border border-gray-800">
                    <span className="text-gray-400 font-sans block text-[11px]">Total Líquido da Fatura</span>
                    <span className="text-sm font-bold text-blue-400">{formatBRL(selectedOp.valorLiquidoFaturadoBRL)}</span>
                    <span className="text-[10px] text-blue-500/80 block font-sans">Valor a cobrar do adquirente</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-lg text-xs text-emerald-200/90 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-emerald-300">Cláusula de Desoneração e Abatimento:</span>
                    <p className="mt-0.5 text-gray-300 leading-relaxed font-sans">
                      O benefício fiscal da isenção de ICMS é condicionado à efetiva demonstração do abatimento no preço da mercadoria, devendo constar expressamente no corpo da NF-e o valor desonerado e a indicação legal: 
                      <code className="bg-gray-800 px-1 py-0.5 rounded text-amber-300 mx-1">
                        "Remessa com isenção do ICMS nos termos do Convênio ICMS nº 65/88 e alíquota zero de PIS/COFINS conforme Art. 2º da Lei nº 10.996/2004."
                      </code>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: RASTREAMENTO DO PIN & VISTORIA */}
        {activeTab === 'pin_vistoria' && (
          <div className="bg-[#14161f] border border-gray-800 rounded-xl p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400" />
                Ciclo Operacional do PIN (Protocolo de Ingresso de Mercadoria Nacional)
              </h2>
              <p className="text-xs text-gray-400">
                Acompanhamento das 4 etapas regulamentares da Portaria SUFRAMA nº 529/2006 para comprovação fiscal
              </p>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-gray-900/60 border border-gray-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs">1</span>
                  <span className="text-[10px] text-gray-400 font-mono">WS SUFRAMA</span>
                </div>
                <h4 className="text-xs font-bold text-white">Geração do PIN</h4>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Emissão eletrônica do número PIN vinculado à Chave da NF-e de saída e à Inscrição SUFRAMA ativa do adquirente.
                </p>
              </div>

              <div className="p-4 bg-gray-900/60 border border-gray-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xs">2</span>
                  <span className="text-[10px] text-gray-400 font-mono">SEFAZ / CANHOTO</span>
                </div>
                <h4 className="text-xs font-bold text-white">Transporte & Trânsito</h4>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Carga em deslocamento rodoviário ou fluvial com manifesto MDF-e acompanhada do DANFE com indicação do PIN.
                </p>
              </div>

              <div className="p-4 bg-gray-900/60 border border-gray-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-xs">3</span>
                  <span className="text-[10px] text-gray-400 font-mono">POSTO FISCAL</span>
                </div>
                <h4 className="text-xs font-bold text-white">Conferência Física</h4>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Apresentação da carga no Posto de Fiscalização de Fronteira da SEFAZ e leitura ótica dos lacres e código de barras.
                </p>
              </div>

              <div className="p-4 bg-gray-900/60 border border-gray-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">4</span>
                  <span className="text-[10px] text-emerald-400 font-mono">HOMOLOGADO</span>
                </div>
                <h4 className="text-xs font-bold text-white">Vistoria & Internamento</h4>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Vistoria técnica presencial/eletrônica pela SUFRAMA e emissão da Certidão de Internamento definitiva.
                </p>
              </div>
            </div>

            <div className="border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-3 bg-[#181b24] border-b border-gray-800 font-bold text-xs text-white">
                Rastreio das Operações e Prazos de Vistoria (Limite de 120 dias)
              </div>
              <div className="divide-y divide-gray-800/70 text-xs font-mono">
                {(resumo?.operacoes || []).map((op) => (
                  <div key={op.id} className="p-4 flex items-center justify-between hover:bg-gray-800/30 transition">
                    <div>
                      <div className="flex items-center gap-2 font-bold text-white">
                        <span>{op.numeroPinSuframa}</span>
                        <span className="text-gray-400 font-normal">| {op.numeroNotaFiscal}</span>
                        <span className="text-emerald-400 font-sans font-medium text-[11px]">({op.destinatarioRazaoSocial})</span>
                      </div>
                      <span className="text-gray-500 text-[11px]">
                        Emissão: {op.dataEmissao} • UF Destino: {op.ufDestino} • Internamento:{' '}
                        {op.dataInternamento || 'Pendente de homologação'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-sans font-semibold ${
                          op.statusPin === 'VISTORIADO_INTERNADO'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {op.statusPin === 'VISTORIADO_INTERNADO' ? 'Internado com Sucesso' : op.statusPin}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedOp(op);
                          setModalStatusPin(true);
                        }}
                        className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded border border-gray-700 text-xs font-sans"
                      >
                        Alterar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DEMONSTRATIVO DE ECONOMIA */}
        {activeTab === 'economia' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#14161f] border border-gray-800 rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-white flex items-center gap-2">
                  <Percent className="w-4 h-4 text-emerald-400" />
                  Decomposição das Economias Tributárias (ZFM/ALC)
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-gray-900/60 rounded border border-gray-800 flex justify-between items-center">
                    <div>
                      <span className="text-gray-300 font-bold">Isenção de ICMS Desonerado:</span>
                      <p className="text-[11px] text-gray-500">Convênio ICMS 65/88 (alíquota interestadual de 7%)</p>
                    </div>
                    <span className="text-sm font-bold font-mono text-amber-400">
                      {formatBRL(resumo?.totalIcmsDesoneradoBRL || 0)}
                    </span>
                  </div>

                  <div className="p-3 bg-gray-900/60 rounded border border-gray-800 flex justify-between items-center">
                    <div>
                      <span className="text-gray-300 font-bold">Alíquota Zero de PIS/PASEP:</span>
                      <p className="text-[11px] text-gray-500">Art. 2º Lei 10.996/2004 (CST 06 - 1,65% economizado)</p>
                    </div>
                    <span className="text-sm font-bold font-mono text-emerald-400">
                      {formatBRL((resumo?.totalOperacoes || 0) > 0 ? (resumo?.operacoes.reduce((acc, o) => acc + o.valorEconomiaPisBRL, 0) || 0) : 0)}
                    </span>
                  </div>

                  <div className="p-3 bg-gray-900/60 rounded border border-gray-800 flex justify-between items-center">
                    <div>
                      <span className="text-gray-300 font-bold">Alíquota Zero de COFINS:</span>
                      <p className="text-[11px] text-gray-500">Art. 2º Lei 10.996/2004 (CST 06 - 7,60% economizado)</p>
                    </div>
                    <span className="text-sm font-bold font-mono text-emerald-400">
                      {formatBRL((resumo?.totalOperacoes || 0) > 0 ? (resumo?.operacoes.reduce((acc, o) => acc + o.valorEconomiaCofinsBRL, 0) || 0) : 0)}
                    </span>
                  </div>

                  <div className="p-3 bg-emerald-950/40 rounded border border-emerald-800/60 flex justify-between items-center">
                    <span className="font-bold text-emerald-200">Economia Fiscal Consolidada Total:</span>
                    <span className="text-base font-bold font-mono text-emerald-400">
                      {formatBRL((resumo?.totalIcmsDesoneradoBRL || 0) + (resumo?.totalEconomiaPisCofinsBRL || 0))}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-[#14161f] border border-gray-800 rounded-xl p-5 shadow-sm space-y-3">
                <h3 className="text-xs font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  Risco Fiscal de Glosa e Cobrança Retroativa
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Caso a mercadoria destinada à ZFM ou Área de Livre Comércio não tenha seu PIN internado pela SUFRAMA no prazo legal de 120 (cento e vinte) dias contados da emissão da NF-e:
                </p>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-rose-950/30 border border-rose-900/40 rounded text-rose-200">
                    <strong>1. Exigência do ICMS:</strong> O estado de origem (ex: SEFAZ/SP) cobrará o ICMS desonerado de 7% com multa de mora e juros da taxa SELIC.
                  </div>
                  <div className="p-2.5 bg-rose-950/30 border border-rose-900/40 rounded text-rose-200">
                    <strong>2. Perda da Alíquota Zero de PIS/COFINS:</strong> A RFB reclassificará as saídas para a tributação normal (9,25%), emitindo auto de infração.
                  </div>
                  <div className="p-2.5 bg-emerald-950/30 border border-emerald-900/40 rounded text-emerald-200">
                    <strong>3. Solução ERP Contábil:</strong> Monitoramento automatizado de PINs e alerta prévio de decurso de prazo aos 90 dias.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ESCRITURAÇÃO SPED */}
        {activeTab === 'sped' && (
          <div className="bg-[#14161f] border border-gray-800 rounded-xl p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Barcode className="w-4 h-4 text-emerald-400" />
                Mapeamento dos Registros SPED Fiscal (EFD ICMS/IPI) e EFD-Contribuições
              </h2>
              <p className="text-xs text-gray-400">
                Estrutura exata gerada para os arquivos magnéticos do Sistema Público de Escrituração Digital
              </p>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 bg-gray-900 rounded border border-gray-800">
                <div className="text-amber-400 font-bold mb-1">|0150| - Cadastro de Participante com Inscrição SUFRAMA</div>
                <code className="text-gray-300 text-[11px] block">
                  |0150|CLI-AMAZONIA|Polo Industrial Amazônia Eletrônicos S.A.|1058|04821993000144||048219930|1302603|201048923|Av. dos Buritis|1200||Distrito Industrial|
                </code>
                <span className="text-[10px] text-gray-500 font-sans block mt-1">Campo 10: Inscrição na SUFRAMA (obrigatório para desoneração válida)</span>
              </div>

              <div className="p-3 bg-gray-900 rounded border border-gray-800">
                <div className="text-amber-400 font-bold mb-1">|C100| e |C190| - Documento Fiscal com ICMS Desonerado</div>
                <code className="text-gray-300 text-[11px] block">
                  |C100|1|0|CLI-AMAZONIA|55|00|1|45892|35260301234567000189550010000458921008472910|12032026|12032026|418500,00|1|0,00|0,00|450000,00|9|0,00|0,00|0,00|0,00|0,00|0,00|0,00|0,00|0,00|31500,00|
                </code>
                <span className="text-[10px] text-gray-500 font-sans block mt-1">Campo 27 do C100: Valor do ICMS desonerado (R$ 31.500,00)</span>
              </div>

              <div className="p-3 bg-gray-900 rounded border border-gray-800">
                <div className="text-emerald-400 font-bold mb-1">|C170| da EFD-Contribuições - CST 06 (Alíquota Zero ZFM)</div>
                <code className="text-gray-300 text-[11px] block">
                  |C170|1|PROD-ELET-01|Placa Mãe Industrial Multicamada|100|UN|450000,00|31500,00|0|040|6109|06|450000,00|0,0000||0,00|06|450000,00|0,0000||0,00||
                </code>
                <span className="text-[10px] text-gray-500 font-sans block mt-1">CST 06: Operação Tributável a Alíquota Zero (Art. 2º da Lei nº 10.996/2004)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: NOVA OPERAÇÃO SUFRAMA */}
      {modalNovaOp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#14161f] border border-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-5 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-400" />
                Cadastrar Operação Fiscal com Benefício SUFRAMA
              </h3>
              <button onClick={() => setModalNovaOp(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSalvarNovaOp} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1">Número da NF-e *</label>
                  <input
                    type="text"
                    required
                    value={formOp.numeroNotaFiscal}
                    onChange={(e) => setFormOp({ ...formOp, numeroNotaFiscal: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-100 font-mono"
                    placeholder="NF-e 046.500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Data de Emissão</label>
                  <input
                    type="date"
                    required
                    value={formOp.dataEmissao}
                    onChange={(e) => setFormOp({ ...formOp, dataEmissao: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1">Razão Social do Destinatário *</label>
                  <input
                    type="text"
                    required
                    value={formOp.destinatarioRazaoSocial}
                    onChange={(e) => setFormOp({ ...formOp, destinatarioRazaoSocial: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-100"
                    placeholder="Ex: Amazonas Informática S.A."
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">CNPJ do Destinatário</label>
                  <input
                    type="text"
                    value={formOp.destinatarioCnpj}
                    onChange={(e) => setFormOp({ ...formOp, destinatarioCnpj: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-100 font-mono"
                    placeholder="00.000.000/0001-00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1">Inscrição SUFRAMA *</label>
                  <input
                    type="text"
                    required
                    value={formOp.inscricaoSuframa}
                    onChange={(e) => setFormOp({ ...formOp, inscricaoSuframa: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-100 font-mono"
                    placeholder="20.104.892-3"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Município / UF Destino</label>
                  <input
                    type="text"
                    value={formOp.municipioDestino}
                    onChange={(e) => setFormOp({ ...formOp, municipioDestino: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-100"
                    placeholder="Manaus"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">UF Destino</label>
                  <select
                    value={formOp.ufDestino}
                    onChange={(e) => setFormOp({ ...formOp, ufDestino: e.target.value as any })}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-100"
                  >
                    <option value="AM">Amazonas (AM)</option>
                    <option value="RR">Roraima (RR)</option>
                    <option value="AP">Amapá (AP)</option>
                    <option value="RO">Rondônia (RO)</option>
                    <option value="AC">Acre (AC)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1">Tipo de Benefício Regional</label>
                  <select
                    value={formOp.tipoBeneficio}
                    onChange={(e) => setFormOp({ ...formOp, tipoBeneficio: e.target.value as any })}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-100"
                  >
                    <option value="ZONA_FRANCA_MANAUS">Zona Franca de Manaus (ZFM)</option>
                    <option value="AREA_LIVRE_COMERCIO">Área de Livre Comércio (ALC)</option>
                    <option value="AMAZONIA_OCIDENTAL">Amazônia Ocidental</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">CFOP da Operação</label>
                  <select
                    value={formOp.cfop}
                    onChange={(e) => setFormOp({ ...formOp, cfop: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-100 font-mono"
                  >
                    <option value="6.109">6.109 - Venda de produção do estabelecimento ZFM</option>
                    <option value="6.110">6.110 - Venda de mercadoria adquirida de terceiros ZFM</option>
                    <option value="6.107">6.107 - Venda produção estabelecimento ALC</option>
                    <option value="6.108">6.108 - Venda mercadoria terceiros ALC</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1">Valor Total dos Produtos (BRL) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formOp.valorTotalProdutosBRL}
                    onChange={(e) => setFormOp({ ...formOp, valorTotalProdutosBRL: Number(e.target.value) })}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-100 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Alíquota ICMS Desonerado (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formOp.aliquotaIcmsDesoneradoPercentual}
                    onChange={(e) => setFormOp({ ...formOp, aliquotaIcmsDesoneradoPercentual: Number(e.target.value) })}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-100 font-mono text-sm"
                  />
                  <span className="text-[10px] text-gray-500 mt-0.5 block">Normalmente 7,00% da origem para a Região Norte</span>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Número do PIN (Opcional - se vazio, gerado automático)</label>
                <input
                  type="text"
                  value={formOp.numeroPinSuframa}
                  onChange={(e) => setFormOp({ ...formOp, numeroPinSuframa: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-100 font-mono"
                  placeholder="PIN-2026-XXXXXXX"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setModalNovaOp(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded"
                >
                  Salvar Operação SUFRAMA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ATUALIZAR STATUS PIN */}
      {modalStatusPin && selectedOp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#14161f] border border-gray-800 rounded-xl w-full max-w-md shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-400" />
                Atualizar Status do PIN {selectedOp.numeroPinSuframa}
              </h3>
              <button onClick={() => setModalStatusPin(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-gray-300 space-y-3">
              <div>
                <label className="block text-gray-400 mb-1">Novo Status da Vistoria SUFRAMA:</label>
                <select
                  value={novoStatusPin}
                  onChange={(e) => setNovoStatusPin(e.target.value as StatusPinSuframa)}
                  className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-100 text-xs"
                >
                  <option value="PIN_GERADO">1. PIN Gerado no WebService</option>
                  <option value="EM_TRANSITO">2. Carga em Trânsito com MDF-e</option>
                  <option value="CONFERIDO_POSTO_FISCAL">3. Conferência no Posto Fiscal de Fronteira</option>
                  <option value="VISTORIADO_INTERNADO">4. Vistoriado & Internado (Definitivo)</option>
                  <option value="CANCELADO">5. Cancelado / Mercadoria Rejeitada</option>
                </select>
              </div>

              <div className="p-3 bg-gray-900 rounded border border-gray-800 font-mono text-[11px] space-y-1">
                <div>Nota: <span className="text-white">{selectedOp.numeroNotaFiscal}</span></div>
                <div>Destinatário: <span className="text-white">{selectedOp.destinatarioRazaoSocial}</span></div>
                <div>Valor Desonerado: <span className="text-amber-400">{formatBRL(selectedOp.valorIcmsDesoneradoBRL)}</span></div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-800 text-xs">
              <button
                type="button"
                onClick={() => setModalStatusPin(false)}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAtualizarPin}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded"
              >
                Confirmar Atualização
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LAUDO DE INTERNAMENTO A4 */}
      {modalLaudoA4 && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-gray-900 rounded-xl w-full max-w-4xl shadow-2xl p-8 overflow-y-auto max-h-[95vh] font-serif">
            <div className="flex items-center justify-between border-b pb-4 mb-6">
              <div>
                <h2 className="text-lg font-bold tracking-wide text-gray-900 uppercase">
                  Certidão de Internamento & Regularidade Fiscal SUFRAMA
                </h2>
                <p className="text-xs text-gray-600 font-sans">
                  Superintendência da Zona Franca de Manaus • Convênio ICMS 65/88 e Lei Federal nº 10.996/2004
                </p>
              </div>
              <button onClick={() => setModalLaudoA4(false)} className="text-gray-500 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 text-xs text-gray-800 leading-relaxed font-sans">
              <div className="p-4 bg-gray-50 rounded border border-gray-200">
                <h4 className="font-bold text-sm text-gray-900 mb-2">1. DADOS DO REMETENTE E DA NOTA FISCAL DESONERADA</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><strong>Remetente:</strong> Studio Pro Industrial & Comercial Ltda.</div>
                  <div><strong>CNPJ Remetente:</strong> 01.234.567/0001-89 (São Paulo - SP)</div>
                  <div><strong>Destinatário:</strong> {selectedOp?.destinatarioRazaoSocial || 'Polo Industrial Amazônia Eletrônicos S.A.'}</div>
                  <div><strong>Inscrição SUFRAMA:</strong> {selectedOp?.inscricaoSuframa || '20.104.892-3'}</div>
                  <div><strong>Nota Fiscal / Chave:</strong> {selectedOp?.numeroNotaFiscal} ({selectedOp?.dataEmissao})</div>
                  <div><strong>Protocolo PIN:</strong> {selectedOp?.numeroPinSuframa}</div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-sm text-gray-900 mb-2">2. DEMONSTRATIVO ANALÍTICO DOS BENEFÍCIOS TRIBUTÁRIOS</h4>
                <table className="w-full text-xs text-left border">
                  <thead className="bg-gray-100 font-semibold border-b">
                    <tr>
                      <th className="p-2">Nota Fiscal</th>
                      <th className="p-2">Destino</th>
                      <th className="p-2 text-right">Valor Mercadorias</th>
                      <th className="p-2 text-right text-amber-700">ICMS Desonerado (7%)</th>
                      <th className="p-2 text-right text-emerald-700">PIS/COFINS Zero (9,25%)</th>
                      <th className="p-2 text-right">Valor Líquido NF</th>
                      <th className="p-2 text-center">Status PIN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-mono">
                    {(resumo?.operacoes || []).map((op) => (
                      <tr key={op.id}>
                        <td className="p-2 font-bold">{op.numeroNotaFiscal}</td>
                        <td className="p-2 font-sans">{op.municipioDestino}/{op.ufDestino}</td>
                        <td className="p-2 text-right">{formatBRL(op.valorTotalProdutosBRL)}</td>
                        <td className="p-2 text-right font-bold text-amber-700">-{formatBRL(op.valorIcmsDesoneradoBRL)}</td>
                        <td className="p-2 text-right font-bold text-emerald-700">+{formatBRL(op.valorEconomiaPisBRL + op.valorEconomiaCofinsBRL)}</td>
                        <td className="p-2 text-right font-bold">{formatBRL(op.valorLiquidoFaturadoBRL)}</td>
                        <td className="p-2 text-center font-sans text-[10px]">{op.statusPin}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <h4 className="font-bold text-sm text-gray-900 mb-2">3. DECLARAÇÃO DE EFETIVO INTERNAMENTO E COMPROVAÇÃO FISCAL</h4>
                <p className="text-justify text-xs text-gray-700">
                  Atestamos que os bens e produtos objeto das notas fiscais retro mencionadas foram efetivamente desembaraçados, vistoriados física e eletronicamente pelos agentes fiscais credenciados nos postos de controle da SUFRAMA e da SEFAZ, encontrando-se devidamente internados e incorporados à atividade econômica na Zona Franca de Manaus / Área de Livre Comércio, fazendo jus em caráter irretratável à desoneração do ICMS e à desoneração do PIS e da COFINS, nos termos da legislação federal e dos convênios do CONFAZ vigentes.
                </p>
              </div>

              <div className="pt-10 grid grid-cols-2 gap-8 text-center border-t text-xs">
                <div>
                  <div className="border-t border-gray-400 w-48 mx-auto mb-1"></div>
                  <strong className="block">Auditor Fiscal SEFAZ / SUFRAMA</strong>
                  <span className="text-gray-600">Posto de Fiscalização e Desembaraço</span>
                  <span className="text-gray-500 block font-mono">Matrícula: 84.920-1</span>
                </div>
                <div>
                  <div className="border-t border-gray-400 w-48 mx-auto mb-1"></div>
                  <strong className="block">Marcus Vinicius Carvalho</strong>
                  <span className="text-gray-600">Contador Responsável Técnico</span>
                  <span className="text-gray-500 block font-mono">CRC 1SP298450/O-2</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-4 mt-6">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Certidão A4</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
