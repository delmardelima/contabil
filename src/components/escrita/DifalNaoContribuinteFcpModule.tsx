import React, { useState, useEffect } from 'react';
import {
  Scale,
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
  Globe,
  Receipt,
  FileText
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  ApuracaoOperacaoDifalNc,
  ResumoDifalConsumidorFinal,
  TipoOperacaoDifalNc
} from '../../types/contabil';

export const DifalNaoContribuinteFcpModule: React.FC = () => {
  const [resumo, setResumo] = useState<ResumoDifalConsumidorFinal | null>(null);
  const [selectedOp, setSelectedOp] = useState<ApuracaoOperacaoDifalNc | null>(null);
  const [activeTab, setActiveTab] = useState<'operacoes' | 'gnre' | 'matriz_ufs' | 'sped'>('operacoes');
  const [filtroUf, setFiltroUf] = useState<string>('TODAS');

  // Modals
  const [modalNovaOp, setModalNovaOp] = useState(false);
  const [modalGnre, setModalGnre] = useState(false);
  const [modalLaudoA4, setModalLaudoA4] = useState(false);

  // Feedbacks
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  // Form State: Nova Apuração
  const [formOp, setFormOp] = useState<Partial<ApuracaoOperacaoDifalNc>>({
    numeroNotaFiscal: '',
    dataEmissao: new Date().toISOString().split('T')[0],
    consumidorFinalNome: '',
    consumidorFinalCpfCnpj: '',
    ufOrigem: 'SP',
    ufDestino: 'RJ',
    valorTotalOperacaoBRL: 10000,
    aliquotaInterestadualPercentual: 12.0,
    aliquotaInternaDestinoPercentual: 20.0,
    aliquotaFecoepPercentual: 2.0,
    codigoReceitaGnre: '10010-2',
    observacoes: ''
  });

  const carregarDados = () => {
    try {
      const data = dbService.getDifalConsumidorFinal();
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
      setMensagemErro('Erro ao carregar DIFAL Não Contribuinte: ' + e.message);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleIntegrarContabil = (id: string) => {
    const res = dbService.integrarDifalNcContabil(id);
    if (res.sucesso) {
      setMensagemSucesso(res.mensagem);
      carregarDados();
    } else {
      setMensagemErro(res.mensagem);
    }
  };

  const handleSalvarNovaOp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formOp.numeroNotaFiscal || !formOp.consumidorFinalNome) {
      setMensagemErro('Preencha os campos obrigatórios da operação.');
      return;
    }

    const base = Number(formOp.valorTotalOperacaoBRL) || 0;
    const aliqInter = Number(formOp.aliquotaInterestadualPercentual) || 12.0;
    const aliqDestino = Number(formOp.aliquotaInternaDestinoPercentual) || 20.0;
    const aliqFcp = Number(formOp.aliquotaFecoepPercentual) || 0.0;

    const difAliq = Math.max(0, aliqDestino - aliqInter);
    const difal = Math.round(((base * difAliq) / 100) * 100) / 100;
    const fcp = Math.round(((base * aliqFcp) / 100) * 100) / 100;
    const totalGnre = Math.round((difal + fcp) * 100) / 100;

    const nova: ApuracaoOperacaoDifalNc = {
      id: 'dif-nc-' + Date.now(),
      empresaId: 1,
      numeroNotaFiscal: formOp.numeroNotaFiscal,
      chaveNfe: formOp.chaveNfe || `35260401234567000189550010000${Math.floor(100000 + Math.random() * 900000)}1000000000`,
      dataEmissao: formOp.dataEmissao || new Date().toISOString().split('T')[0],
      consumidorFinalNome: formOp.consumidorFinalNome,
      consumidorFinalCpfCnpj: formOp.consumidorFinalCpfCnpj || '000.000.000-00',
      ufOrigem: formOp.ufOrigem || 'SP',
      ufDestino: formOp.ufDestino || 'RJ',
      valorTotalOperacaoBRL: base,
      baseCalculoDifalBRL: base,
      aliquotaInterestadualPercentual: aliqInter,
      aliquotaInternaDestinoPercentual: aliqDestino,
      aliquotaFecoepPercentual: aliqFcp,
      diferencialAliquotaLiquidoPercentual: difAliq,
      valorDifalDestinoBRL: difal,
      valorFecoepDestinoBRL: fcp,
      valorTotalGnreRecolherBRL: totalGnre,
      codigoReceitaGnre: formOp.codigoReceitaGnre || '10010-2',
      codigoBarrasGnreFebraban: `858900000000 ${Math.round(totalGnre).toString().padStart(11, '0')} 100100000000 000000000000`,
      dataVencimento: formOp.dataEmissao || new Date().toISOString().split('T')[0],
      statusPagamento: 'PENDENTE',
      integradoContabil: false,
      observacoes: formOp.observacoes || 'Apuração de DIFAL Não Contribuinte e FECOEP nos termos da LC 190/2022.'
    };

    const res = dbService.salvarOperacaoDifalNc(nova);
    if (res.sucesso) {
      setMensagemSucesso(res.mensagem);
      setModalNovaOp(false);
      carregarDados();
    } else {
      setMensagemErro(res.mensagem);
    }
  };

  const operacoesFiltradas = (resumo?.operacoes || []).filter(op => {
    if (filtroUf === 'TODAS') return true;
    return op.ufDestino === filtroUf;
  });

  const formatBRL = (val: number) => {
    return (val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0d0f12] text-gray-100 overflow-hidden font-sans">
      {/* Header */}
      <div className="h-14 border-b border-gray-800 bg-[#14161b] px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
              DIFAL Consumidor Final & FECOEP / FCP
              <span className="text-[10px] bg-rose-950 text-rose-400 border border-rose-800/50 px-2 py-0.5 rounded-full font-mono">
                EC nº 87/2015 • LC nº 190/2022 • Convênio 236/2021
              </span>
            </h1>
            <p className="text-xs text-gray-400">
              Operações Interestaduais B2C Não Contribuintes • Fundo Estadual de Combate à Pobreza • Emissão GNRE Oficial
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setModalLaudoA4(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs rounded border border-gray-700 transition shadow-sm"
          >
            <Printer className="w-4 h-4 text-gray-400" />
            <span>Memória de Cálculo A4</span>
          </button>
          <button
            onClick={() => setModalNovaOp(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium rounded transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Apuração DIFAL</span>
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
            <span className="text-xs text-gray-400 font-medium">Base de Cálculo B2C</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-bold text-white font-mono">
              {formatBRL(resumo?.totalBaseCalculoBRL || 0)}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-gray-500">{resumo?.totalOperacoes || 0} operações interestaduais</p>
        </div>

        <div className="bg-[#14161d] p-4 rounded-xl border border-gray-800/70 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full group-hover:bg-amber-500/10 transition-all"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">DIFAL Destino Líquido</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-bold text-amber-400 font-mono">
              {formatBRL(resumo?.totalDifalDestinoBRL || 0)}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-gray-500">Diferencial de alíquota para o estado de destino</p>
        </div>

        <div className="bg-[#14161d] p-4 rounded-xl border border-gray-800/70 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full group-hover:bg-purple-500/10 transition-all"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">FECOEP / FCP Destino</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-bold text-purple-400 font-mono">
              {formatBRL(resumo?.totalFecoepDestinoBRL || 0)}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-gray-500">Fundo de combate à pobreza (1% a 2%)</p>
        </div>

        <div className="bg-[#14161d] p-4 rounded-xl border border-gray-800/70 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-full group-hover:bg-rose-500/10 transition-all"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Total GNRE a Recolher</span>
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-bold text-rose-400 font-mono">
              {formatBRL(resumo?.totalGnreBRL || 0)}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-gray-500">Guias por operação (10010-2) ou apuração</p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="px-6 pt-3 bg-[#111318] border-b border-gray-800 flex items-center justify-between">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('operacoes')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'operacoes'
                ? 'border-rose-500 text-rose-400 bg-rose-500/10 rounded-t'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Operações Interestaduais B2C</span>
          </button>

          <button
            onClick={() => setActiveTab('gnre')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'gnre'
                ? 'border-rose-500 text-rose-400 bg-rose-500/10 rounded-t'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Guia GNRE Nacional Oficial</span>
          </button>

          <button
            onClick={() => setActiveTab('matriz_ufs')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'matriz_ufs'
                ? 'border-rose-500 text-rose-400 bg-rose-500/10 rounded-t'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Tabela Tributária das UFs & FCP</span>
          </button>

          <button
            onClick={() => setActiveTab('sped')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'sped'
                ? 'border-rose-500 text-rose-400 bg-rose-500/10 rounded-t'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Registro SPED Fiscal (C101)</span>
          </button>
        </div>

        {activeTab === 'operacoes' && (
          <div className="flex items-center space-x-2 pb-2">
            <span className="text-xs text-gray-400">Filtrar por UF Destino:</span>
            <select
              value={filtroUf}
              onChange={(e) => setFiltroUf(e.target.value)}
              className="bg-gray-800 text-gray-200 text-xs px-2.5 py-1 rounded border border-gray-700 outline-none"
            >
              <option value="TODAS">Todas as UFs</option>
              <option value="RJ">Rio de Janeiro (RJ)</option>
              <option value="BA">Bahia (BA)</option>
              <option value="PE">Pernambuco (PE)</option>
              <option value="MG">Minas Gerais (MG)</option>
              <option value="RS">Rio Grande do Sul (RS)</option>
            </select>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* TAB 1: OPERAÇÕES INTERESTADUAIS */}
        {activeTab === 'operacoes' && (
          <div className="space-y-6">
            <div className="bg-[#14161f] border border-gray-800 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#181b24] text-gray-400 border-b border-gray-800 font-mono">
                  <tr>
                    <th className="py-3 px-4">Nota Fiscal</th>
                    <th className="py-3 px-4">Data</th>
                    <th className="py-3 px-4">Consumidor Final</th>
                    <th className="py-3 px-4 text-center">Origem → Destino</th>
                    <th className="py-3 px-4 text-right">Base DIFAL</th>
                    <th className="py-3 px-4 text-center">Inter. / Dest. / FCP</th>
                    <th className="py-3 px-4 text-right text-amber-400">DIFAL Destino</th>
                    <th className="py-3 px-4 text-right text-purple-400">FECOEP / FCP</th>
                    <th className="py-3 px-4 text-right text-rose-400">Total GNRE</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 font-mono">
                  {operacoesFiltradas.map((op) => (
                    <tr
                      key={op.id}
                      onClick={() => setSelectedOp(op)}
                      className={`hover:bg-gray-800/40 transition cursor-pointer ${
                        selectedOp?.id === op.id ? 'bg-[#1a1722]' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-bold text-white">{op.numeroNotaFiscal}</td>
                      <td className="py-3 px-4 text-gray-400">{op.dataEmissao}</td>
                      <td className="py-3 px-4 font-sans text-gray-200">
                        {op.consumidorFinalNome}
                        <span className="block text-[10px] text-gray-500 font-mono">{op.consumidorFinalCpfCnpj}</span>
                      </td>
                      <td className="py-3 px-4 text-center text-blue-400 font-bold">
                        {op.ufOrigem} → {op.ufDestino}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-200 font-bold">{formatBRL(op.baseCalculoDifalBRL)}</td>
                      <td className="py-3 px-4 text-center text-gray-400">
                        {op.aliquotaInterestadualPercentual}% / {op.aliquotaInternaDestinoPercentual}% / +{op.aliquotaFecoepPercentual}%
                      </td>
                      <td className="py-3 px-4 text-right text-amber-400 font-bold">{formatBRL(op.valorDifalDestinoBRL)}</td>
                      <td className="py-3 px-4 text-right text-purple-400 font-bold">{formatBRL(op.valorFecoepDestinoBRL)}</td>
                      <td className="py-3 px-4 text-right text-rose-400 font-bold">{formatBRL(op.valorTotalGnreRecolherBRL)}</td>
                      <td className="py-3 px-4 text-center font-sans">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            op.statusPagamento === 'PAGO'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-rose-950 text-rose-300 border border-rose-800'
                          }`}
                        >
                          {op.statusPagamento === 'PAGO' ? 'Pago' : 'Pendente'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5 font-sans">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOp(op);
                              setModalGnre(true);
                            }}
                            className="p-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-700 transition"
                            title="Emitir Guia GNRE"
                          >
                            <Printer className="w-3.5 h-3.5 text-rose-400" />
                          </button>
                          {!op.integradoContabil && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleIntegrarContabil(op.id);
                              }}
                              className="px-2 py-1 bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 text-[10px] rounded transition flex items-center gap-1"
                              title="Integrar Provisão Contábil"
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
                      <Scale className="w-4 h-4 text-rose-400" />
                      Memória de Cálculo DIFAL & FCP: {selectedOp.numeroNotaFiscal} (Destino: {selectedOp.ufDestino})
                    </h3>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">
                      Chave NFe: {selectedOp.chaveNfe} • Destinatário: {selectedOp.consumidorFinalNome}
                    </p>
                  </div>
                  <button
                    onClick={() => setModalGnre(true)}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium rounded transition flex items-center gap-1.5"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Visualizar GNRE Oficial</span>
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-4 text-xs font-mono">
                  <div className="p-3 bg-gray-900/60 rounded border border-gray-800">
                    <span className="text-gray-400 font-sans block text-[11px]">Base de Cálculo Única</span>
                    <span className="text-sm font-bold text-gray-100">{formatBRL(selectedOp.baseCalculoDifalBRL)}</span>
                    <span className="text-[10px] text-gray-500 block font-sans">Valor total da operação com frete</span>
                  </div>
                  <div className="p-3 bg-gray-900/60 rounded border border-gray-800">
                    <span className="text-gray-400 font-sans block text-[11px]">Diferencial Líquido ({selectedOp.diferencialAliquotaLiquidoPercentual}%)</span>
                    <span className="text-sm font-bold text-amber-400">{formatBRL(selectedOp.valorDifalDestinoBRL)}</span>
                    <span className="text-[10px] text-amber-500/80 block font-sans">
                      {selectedOp.aliquotaInternaDestinoPercentual}% dest - {selectedOp.aliquotaInterestadualPercentual}% inter
                    </span>
                  </div>
                  <div className="p-3 bg-gray-900/60 rounded border border-gray-800">
                    <span className="text-gray-400 font-sans block text-[11px]">FECOEP / FCP ({selectedOp.aliquotaFecoepPercentual}%)</span>
                    <span className="text-sm font-bold text-purple-400">{formatBRL(selectedOp.valorFecoepDestinoBRL)}</span>
                    <span className="text-[10px] text-purple-500/80 block font-sans">Adicional estadual obrigatório</span>
                  </div>
                  <div className="p-3 bg-gray-900/60 rounded border border-gray-800">
                    <span className="text-gray-400 font-sans block text-[11px]">Total Guia GNRE</span>
                    <span className="text-sm font-bold text-rose-400">{formatBRL(selectedOp.valorTotalGnreRecolherBRL)}</span>
                    <span className="text-[10px] text-rose-500/80 block font-sans">Código Receita: {selectedOp.codigoReceitaGnre}</span>
                  </div>
                </div>

                <div className="p-3 bg-rose-950/20 border border-rose-900/40 rounded-lg text-xs text-rose-200/90 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-rose-300">Responsabilidade Tributária do Remetente (LC 190/2022):</span>
                    <p className="mt-0.5 text-gray-300 leading-relaxed font-sans">
                      Nas operações e prestações que destinem bens e serviços a consumidor final não contribuinte do ICMS localizado em outro estado, cabe ao remetente a responsabilidade pelo recolhimento do DIFAL e do FCP em favor do estado destinatário antes da saída da mercadoria, mediante emissão de GNRE com código 10010-2.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: GUIA GNRE OFICIAL */}
        {activeTab === 'gnre' && (
          <div className="bg-[#14161f] border border-gray-800 rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-rose-400" />
                  Guias Nacionais de Recolhimento de Tributos Estaduais (GNRE Online)
                </h2>
                <p className="text-xs text-gray-400">
                  Documentos de arrecadação emitidos para os estados de destino no padrão do Portal Nacional GNRE
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(resumo?.operacoes || []).map((op) => (
                <div key={op.id} className="p-4 bg-gray-900/60 border border-gray-800 rounded-xl space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                    <span className="font-bold text-white font-sans">{op.numeroNotaFiscal} - {op.ufDestino}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-rose-950 text-rose-400 border border-rose-800">
                      Cód: {op.codigoReceitaGnre}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-gray-300">
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-sans">Favorecido:</span>
                      <span>Governo do Estado de {op.ufDestino} (SEFAZ)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-sans">Contribuinte Remetente:</span>
                      <span className="font-sans">Studio Pro Industrial & Comercial</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-sans">Consumidor Destino:</span>
                      <span className="font-sans">{op.consumidorFinalNome}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-sans">DIFAL Próprio:</span>
                      <span className="text-amber-400">{formatBRL(op.valorDifalDestinoBRL)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-sans">Fundo de Combate à Pobreza:</span>
                      <span className="text-purple-400">{formatBRL(op.valorFecoepDestinoBRL)}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-gray-800 font-bold text-sm">
                      <span className="text-gray-400 font-sans">Valor Total GNRE:</span>
                      <span className="text-rose-400">{formatBRL(op.valorTotalGnreRecolherBRL)}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[10px] text-gray-500">Vencimento: {op.dataVencimento}</span>
                    <button
                      onClick={() => {
                        setSelectedOp(op);
                        setModalGnre(true);
                      }}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-sans flex items-center gap-1"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Imprimir GNRE</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: MATRIZ TRIBUTÁRIA DAS UFS */}
        {activeTab === 'matriz_ufs' && (
          <div className="bg-[#14161f] border border-gray-800 rounded-xl p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400" />
                Matriz de Alíquotas Internas de ICMS e FCP por Estado de Destino
              </h2>
              <p className="text-xs text-gray-400">
                Tabela de referência para parametrização do motor de cálculo de DIFAL Interestadual
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-3 bg-gray-900/60 rounded border border-gray-800 space-y-1">
                <span className="font-bold text-white font-sans">Rio de Janeiro (RJ)</span>
                <div className="flex justify-between text-gray-400">
                  <span>Alíquota Interna Geral:</span>
                  <span className="text-white">20,00%</span>
                </div>
                <div className="flex justify-between text-purple-400">
                  <span>Adicional FECOEP:</span>
                  <span>2,00%</span>
                </div>
                <div className="flex justify-between text-rose-400 font-bold pt-1 border-t border-gray-800">
                  <span>Carga Total no Destino:</span>
                  <span>22,00%</span>
                </div>
              </div>

              <div className="p-3 bg-gray-900/60 rounded border border-gray-800 space-y-1">
                <span className="font-bold text-white font-sans">Bahia (BA)</span>
                <div className="flex justify-between text-gray-400">
                  <span>Alíquota Interna Geral:</span>
                  <span className="text-white">20,50%</span>
                </div>
                <div className="flex justify-between text-purple-400">
                  <span>Adicional FCP:</span>
                  <span>2,00%</span>
                </div>
                <div className="flex justify-between text-rose-400 font-bold pt-1 border-t border-gray-800">
                  <span>Carga Total no Destino:</span>
                  <span>22,50%</span>
                </div>
              </div>

              <div className="p-3 bg-gray-900/60 rounded border border-gray-800 space-y-1">
                <span className="font-bold text-white font-sans">Pernambuco (PE)</span>
                <div className="flex justify-between text-gray-400">
                  <span>Alíquota Interna Geral:</span>
                  <span className="text-white">20,50%</span>
                </div>
                <div className="flex justify-between text-purple-400">
                  <span>Adicional FCP:</span>
                  <span>2,00%</span>
                </div>
                <div className="flex justify-between text-rose-400 font-bold pt-1 border-t border-gray-800">
                  <span>Carga Total no Destino:</span>
                  <span>22,50%</span>
                </div>
              </div>

              <div className="p-3 bg-gray-900/60 rounded border border-gray-800 space-y-1">
                <span className="font-bold text-white font-sans">Minas Gerais (MG)</span>
                <div className="flex justify-between text-gray-400">
                  <span>Alíquota Interna Geral:</span>
                  <span className="text-white">18,00%</span>
                </div>
                <div className="flex justify-between text-purple-400">
                  <span>Adicional FCP (itens seletivos):</span>
                  <span>2,00%</span>
                </div>
                <div className="flex justify-between text-rose-400 font-bold pt-1 border-t border-gray-800">
                  <span>Carga Total no Destino:</span>
                  <span>18,00% a 20,00%</span>
                </div>
              </div>

              <div className="p-3 bg-gray-900/60 rounded border border-gray-800 space-y-1">
                <span className="font-bold text-white font-sans">Rio Grande do Sul (RS)</span>
                <div className="flex justify-between text-gray-400">
                  <span>Alíquota Interna Geral:</span>
                  <span className="text-white">17,00%</span>
                </div>
                <div className="flex justify-between text-purple-400">
                  <span>Adicional AMPARA-RS:</span>
                  <span>2,00%</span>
                </div>
                <div className="flex justify-between text-rose-400 font-bold pt-1 border-t border-gray-800">
                  <span>Carga Total no Destino:</span>
                  <span>17,00% a 19,00%</span>
                </div>
              </div>

              <div className="p-3 bg-gray-900/60 rounded border border-gray-800 space-y-1">
                <span className="font-bold text-white font-sans">Ceará (CE)</span>
                <div className="flex justify-between text-gray-400">
                  <span>Alíquota Interna Geral:</span>
                  <span className="text-white">20,00%</span>
                </div>
                <div className="flex justify-between text-purple-400">
                  <span>Adicional FECOP:</span>
                  <span>2,00%</span>
                </div>
                <div className="flex justify-between text-rose-400 font-bold pt-1 border-t border-gray-800">
                  <span>Carga Total no Destino:</span>
                  <span>22,00%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SPED FISCAL REGISTRO C101 */}
        {activeTab === 'sped' && (
          <div className="bg-[#14161f] border border-gray-800 rounded-xl p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                Estrutura do Registro C101 da EFD ICMS/IPI (DIFAL da NF-e)
              </h2>
              <p className="text-xs text-gray-400">
                Informação das operações interestaduais para consumidor final não contribuinte (Guia Prático EFD)
              </p>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 bg-gray-900 rounded border border-gray-800">
                <div className="text-rose-400 font-bold mb-1">Layout do Registro C101:</div>
                <code className="text-gray-300 text-[11px] block">
                  |C101|VL_FCP_UF_DEST|VL_ICMS_UF_DEST|VL_ICMS_UF_REM|
                </code>
              </div>

              <div className="p-3 bg-gray-900 rounded border border-gray-800 space-y-2">
                <div className="text-white font-bold">Exemplo Real Escriturado (NF-e 045.910 - Destino RJ):</div>
                <code className="text-emerald-400 text-[11px] block">
                  |C101|170,00|680,00|0,00|
                </code>
                <ul className="text-gray-400 text-[11px] font-sans list-disc list-inside space-y-1">
                  <li><strong>Campo 02 (VL_FCP_UF_DEST):</strong> R$ 170,00 (Valor do Fundo de Combate à Pobreza destinado ao RJ);</li>
                  <li><strong>Campo 03 (VL_ICMS_UF_DEST):</strong> R$ 680,00 (Valor do ICMS DIFAL destinado ao estado do RJ);</li>
                  <li><strong>Campo 04 (VL_ICMS_UF_REM):</strong> R$ 0,00 (Partilha para a UF remetente extinta pela EC 87/2015 desde 2019 - 100% no destino).</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: NOVA OPERAÇÃO DIFAL */}
      {modalNovaOp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#14161f] border border-gray-800 rounded-xl w-full max-w-xl shadow-2xl">
            <div className="p-5 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-rose-400" />
                Nova Apuração de DIFAL Não Contribuinte
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
                    placeholder="NF-e 046.800"
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
                  <label className="block text-gray-400 mb-1">Nome do Consumidor Final *</label>
                  <input
                    type="text"
                    required
                    value={formOp.consumidorFinalNome}
                    onChange={(e) => setFormOp({ ...formOp, consumidorFinalNome: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-100"
                    placeholder="Nome da pessoa física ou órgão"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">CPF / CNPJ do Destinatário</label>
                  <input
                    type="text"
                    value={formOp.consumidorFinalCpfCnpj}
                    onChange={(e) => setFormOp({ ...formOp, consumidorFinalCpfCnpj: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-100 font-mono"
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1">UF Destino</label>
                  <select
                    value={formOp.ufDestino}
                    onChange={(e) => setFormOp({ ...formOp, ufDestino: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-100"
                  >
                    <option value="RJ">Rio de Janeiro (RJ)</option>
                    <option value="BA">Bahia (BA)</option>
                    <option value="PE">Pernambuco (PE)</option>
                    <option value="MG">Minas Gerais (MG)</option>
                    <option value="RS">Rio Grande do Sul (RS)</option>
                    <option value="CE">Ceará (CE)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Valor da Operação (Base DIFAL)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formOp.valorTotalOperacaoBRL}
                    onChange={(e) => setFormOp({ ...formOp, valorTotalOperacaoBRL: Number(e.target.value) })}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1">Aliq Interestadual (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formOp.aliquotaInterestadualPercentual}
                    onChange={(e) => setFormOp({ ...formOp, aliquotaInterestadualPercentual: Number(e.target.value) })}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Aliq Interna Destino (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formOp.aliquotaInternaDestinoPercentual}
                    onChange={(e) => setFormOp({ ...formOp, aliquotaInternaDestinoPercentual: Number(e.target.value) })}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Aliq FCP (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formOp.aliquotaFecoepPercentual}
                    onChange={(e) => setFormOp({ ...formOp, aliquotaFecoepPercentual: Number(e.target.value) })}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-100 font-mono"
                  />
                </div>
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
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-medium rounded"
                >
                  Calcular e Gravar DIFAL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: GUIA GNRE OFICIAL */}
      {modalGnre && selectedOp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-gray-900 rounded-xl w-full max-w-2xl shadow-2xl p-6 overflow-y-auto max-h-[95vh] font-sans">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-rose-700 text-white font-bold flex items-center justify-center rounded text-sm">
                  GNRE
                </div>
                <div>
                  <h3 className="font-bold text-base">GUIA NACIONAL DE RECOLHIMENTO DE TRIBUTOS ESTADUAIS</h3>
                  <p className="text-xs text-gray-600">PORTAL NACIONAL GNRE • CONVÊNIO SINIEF 06/89</p>
                  <p className="text-xs font-semibold text-rose-700">Governo do Estado de {selectedOp.ufDestino} - SEFAZ</p>
                </div>
              </div>
              <button onClick={() => setModalGnre(false)} className="text-gray-500 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs border p-3 rounded bg-gray-50 mb-4 font-mono">
              <div>
                <span className="text-gray-500 block">CONTRIBUINTE REMETENTE</span>
                <span className="font-bold text-gray-900 block">Studio Pro Industrial & Comercial Ltda.</span>
                <span className="text-gray-500 block mt-2">CNPJ REMETENTE</span>
                <span className="font-bold text-gray-900 block">01.234.567/0001-89 (SP)</span>
                <span className="text-gray-500 block mt-2">DESTINATÁRIO (CONSUMIDOR FINAL)</span>
                <span className="font-bold text-gray-900 block">{selectedOp.consumidorFinalNome}</span>
              </div>
              <div className="space-y-2 border-l pl-3">
                <div className="flex justify-between border-b pb-1">
                  <span className="text-gray-500">CÓDIGO RECEITA:</span>
                  <span className="font-bold text-gray-900">{selectedOp.codigoReceitaGnre}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-gray-500">DOCUMENTO ORIGEM:</span>
                  <span className="font-bold text-gray-900">{selectedOp.numeroNotaFiscal}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-gray-500">DATA VENCIMENTO:</span>
                  <span className="font-bold text-gray-900">{selectedOp.dataVencimento}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-gray-500">VALOR PRINCIPAL DIFAL:</span>
                  <span className="font-bold text-gray-900">{formatBRL(selectedOp.valorDifalDestinoBRL)}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-gray-500">VALOR ADICIONAL FCP:</span>
                  <span className="font-bold text-gray-900">{formatBRL(selectedOp.valorFecoepDestinoBRL)}</span>
                </div>
                <div className="flex justify-between pt-1 text-sm">
                  <span className="font-bold text-gray-900">VALOR TOTAL GUIA:</span>
                  <span className="font-bold text-rose-700">{formatBRL(selectedOp.valorTotalGnreRecolherBRL)}</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-gray-100 rounded border border-gray-300 text-center font-mono space-y-1 mb-4">
              <span className="text-[10px] text-gray-500 block">REPRESENTAÇÃO NUMÉRICA DO CÓDIGO DE BARRAS (PADRÃO FEBRABAN)</span>
              <p className="font-bold tracking-widest text-xs text-gray-900">{selectedOp.codigoBarrasGnreFebraban}</p>
              <div className="h-8 bg-gray-300 mt-2 flex items-center justify-center text-[10px] text-gray-600">
                ||||| | |||| ||| ||||||| ||||| |||| |||||||| |||| ||||| |||||| ||||| ||||||
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold rounded flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Guia GNRE</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LAUDO MEMÓRIA DE CÁLCULO A4 */}
      {modalLaudoA4 && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-gray-900 rounded-xl w-full max-w-4xl shadow-2xl p-8 overflow-y-auto max-h-[95vh] font-serif">
            <div className="flex items-center justify-between border-b pb-4 mb-6">
              <div>
                <h2 className="text-lg font-bold tracking-wide text-gray-900 uppercase">
                  Demonstrativo Analítico de DIFAL Consumidor Final & FCP
                </h2>
                <p className="text-xs text-gray-600 font-sans">
                  Emenda Constitucional nº 87/2015 • Lei Complementar nº 190/2022 • Convênio ICMS nº 236/2021
                </p>
              </div>
              <button onClick={() => setModalLaudoA4(false)} className="text-gray-500 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 text-xs text-gray-800 leading-relaxed font-sans">
              <div className="p-4 bg-gray-50 rounded border border-gray-200">
                <h4 className="font-bold text-sm text-gray-900 mb-2">1. INFORMAÇÕES DO REMETENTE E ENQUADRAMENTO FISCAL</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><strong>Contribuinte:</strong> Studio Pro Industrial & Comercial Ltda.</div>
                  <div><strong>CNPJ Matriz:</strong> 01.234.567/0001-89 (São Paulo - SP)</div>
                  <div><strong>Regime Tributário:</strong> Lucro Presumido / Geral</div>
                  <div><strong>Competência:</strong> Março / 2026</div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-sm text-gray-900 mb-2">2. DEMONSTRATIVO DE OPERAÇÕES E CÁLCULO DO DIFAL</h4>
                <table className="w-full text-xs text-left border">
                  <thead className="bg-gray-100 font-semibold border-b">
                    <tr>
                      <th className="p-2">Nota Fiscal</th>
                      <th className="p-2">Destinatário</th>
                      <th className="p-2 text-center">Destino</th>
                      <th className="p-2 text-right">Base DIFAL</th>
                      <th className="p-2 text-right">Aliq. Destino</th>
                      <th className="p-2 text-right text-amber-700">DIFAL (R$)</th>
                      <th className="p-2 text-right text-purple-700">FCP (R$)</th>
                      <th className="p-2 text-right text-rose-700">Total GNRE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-mono">
                    {(resumo?.operacoes || []).map((op) => (
                      <tr key={op.id}>
                        <td className="p-2 font-bold">{op.numeroNotaFiscal}</td>
                        <td className="p-2 font-sans">{op.consumidorFinalNome}</td>
                        <td className="p-2 text-center">{op.ufDestino}</td>
                        <td className="p-2 text-right">{formatBRL(op.baseCalculoDifalBRL)}</td>
                        <td className="p-2 text-right">{op.aliquotaInternaDestinoPercentual}%</td>
                        <td className="p-2 text-right font-bold text-amber-700">{formatBRL(op.valorDifalDestinoBRL)}</td>
                        <td className="p-2 text-right font-bold text-purple-700">{formatBRL(op.valorFecoepDestinoBRL)}</td>
                        <td className="p-2 text-right font-bold text-rose-700">{formatBRL(op.valorTotalGnreRecolherBRL)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <h4 className="font-bold text-sm text-gray-900 mb-2">3. DECLARAÇÃO DE RECOLHIMENTO E CONFORMIDADE FISCAL</h4>
                <p className="text-justify text-xs text-gray-700">
                  Certificamos que as apurações do diferencial de alíquotas do ICMS destinadas a consumidores finais não contribuintes atenderam aos critérios da Lei Complementar nº 190/2022 e cláusulas do Convênio ICMS nº 236/2021, com a retenção e emissão tempestiva das guias GNRE individualizadas ou consolidadas em favor das respectivas Unidades da Federação destinatárias.
                </p>
              </div>

              <div className="pt-10 grid grid-cols-2 gap-8 text-center border-t text-xs">
                <div>
                  <div className="border-t border-gray-400 w-48 mx-auto mb-1"></div>
                  <strong className="block">Marcus Vinicius Carvalho</strong>
                  <span className="text-gray-600">Contador Responsável Técnico</span>
                  <span className="text-gray-500 block font-mono">CRC 1SP298450/O-2</span>
                </div>
                <div>
                  <div className="border-t border-gray-400 w-48 mx-auto mb-1"></div>
                  <strong className="block">Roberto Albuquerque Sampaio</strong>
                  <span className="text-gray-600">Diretor Financeiro & Tributário</span>
                  <span className="text-gray-500 block font-mono">CPF: 123.456.789-00</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-4 mt-6">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Memória de Cálculo A4</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
