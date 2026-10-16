import React, { useState, useEffect } from 'react';
import {
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
  MapPin,
  Scale
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import { DeclaracaoEstadualIcms, ResumoDeclaracoesEstaduaisIcms, LinhaValorAdicionadoMunicipio } from '../../types/contabil';

export const DeclaracoesEstaduaisIcmsModule: React.FC = () => {
  const [resumo, setResumo] = useState<ResumoDeclaracoesEstaduaisIcms | null>(null);
  const [selectedDec, setSelectedDec] = useState<DeclaracaoEstadualIcms | null>(null);
  const [activeTab, setActiveTab] = useState<'declaracoes' | 'apuracao' | 'municipios' | 'arquivo'>('declaracoes');
  const [filtroUf, setFiltroUf] = useState<string>('TODAS');
  const [modalImprimir, setModalImprimir] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  const carregarDados = () => {
    try {
      const data = dbService.getDeclaracoesEstaduaisIcms();
      setResumo(data);
      if (data.declaracoes.length > 0) {
        if (!selectedDec || !data.declaracoes.some(d => d.id === selectedDec.id)) {
          setSelectedDec(data.declaracoes[0]);
        } else {
          const atual = data.declaracoes.find(d => d.id === selectedDec.id);
          if (atual) setSelectedDec(atual);
        }
      }
    } catch (e: any) {
      setMensagemErro('Erro ao carregar declarações estaduais: ' + e.message);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleTransmitir = (id: string) => {
    const res = dbService.transmitirDeclaracaoEstadual(id);
    if (res.sucesso) {
      setMensagemSucesso(res.mensagem);
      carregarDados();
    } else {
      setMensagemErro(res.mensagem);
    }
  };

  const handleIntegrarContabilidade = (id: string) => {
    const res = dbService.integrarDeclaracaoEstadualContabil(id);
    if (res.sucesso) {
      setMensagemSucesso(res.mensagem);
      carregarDados();
    } else {
      setMensagemErro(res.mensagem);
    }
  };

  const declaracaoAtual = selectedDec || (resumo && resumo.declaracoes[0]) || null;

  return (
    <div className="flex flex-col h-full bg-[#121212] text-gray-100 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#1a1a1a] border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-white">
                Declarações Estaduais de ICMS (DAPI MG / DIME SC / DIEF CE)
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-900/40 text-blue-300 border border-blue-800">
                Obrigações Estaduais do ICMS
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-900/40 text-emerald-300 border border-emerald-800">
                Guia DAE / GNRE
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Apuração de ICMS Próprio, Estornos, Tratamentos Tributários Diferenciados (TTD) e Rateio do Valor Adicionado Municipal (VAF)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => carregarDados()}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-gray-800 hover:bg-gray-700 text-gray-200 rounded border border-gray-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Atualizar</span>
          </button>
          {declaracaoAtual && (
            <>
              <button
                onClick={() => handleTransmitir(declaracaoAtual.id)}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded transition shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Transmitir SEFAZ</span>
              </button>
              <button
                onClick={() => handleIntegrarContabilidade(declaracaoAtual.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded transition shadow-sm ${
                  declaracaoAtual.integradoContabil
                    ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700 cursor-default'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>{declaracaoAtual.integradoContabil ? 'Contabilizado' : 'Integrar Diário'}</span>
              </button>
              <button
                onClick={() => setModalImprimir(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-gray-700 hover:bg-gray-600 text-white rounded transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Espelho DAE A4</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Alerts */}
      {mensagemSucesso && (
        <div className="mx-6 mt-4 p-3 bg-emerald-950/60 border border-emerald-800 rounded-lg flex items-center justify-between text-emerald-200 text-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{mensagemSucesso}</span>
          </div>
          <button onClick={() => setMensagemSucesso(null)} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {mensagemErro && (
        <div className="mx-6 mt-4 p-3 bg-rose-950/60 border border-rose-800 rounded-lg flex items-center justify-between text-rose-200 text-xs">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{mensagemErro}</span>
          </div>
          <button onClick={() => setMensagemErro(null)} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 px-6 py-4">
        <div className="p-4 bg-[#1a1a1a] rounded-xl border border-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Débitos Saídas Tributadas</span>
            <DollarSign className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight">
            R$ {(declaracaoAtual?.totalDebitosApuradosBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-rose-400/80 mt-1">ICMS destacado nas saídas estaduais</div>
        </div>

        <div className="p-4 bg-[#1a1a1a] rounded-xl border border-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Créditos Entradas Tributadas</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 tracking-tight">
            R$ {(declaracaoAtual?.totalCreditosApuradosBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-1">Créditos de compras + Saldo anterior</div>
        </div>

        <div className="p-4 bg-[#1a1a1a] rounded-xl border border-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Incentivos & Deduções (TTD)</span>
            <Percent className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-bold text-indigo-300 tracking-tight">
            R$ {(declaracaoAtual?.deducoesIncentivosBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-indigo-400/80 mt-1">Crédito Presumido TTD / Benefícios</div>
        </div>

        <div className="p-4 bg-[#1a1a1a] rounded-xl border border-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>ICMS Efetivo a Recolher (DAE)</span>
            <CreditCard className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-purple-300 tracking-tight">
            R$ {(declaracaoAtual?.valorIcmsEfetivoRecolherBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-purple-400/80 mt-1">DAE Cód. {declaracaoAtual?.codigoReceitaDae || '313-1'} Venc. {declaracaoAtual?.dataVencimentoDae || '15/04/2026'}</div>
        </div>

        <div className="p-4 bg-[#1a1a1a] rounded-xl border border-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Municípios Rateados (VAF)</span>
            <MapPin className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400 tracking-tight">
            {declaracaoAtual?.distribuicaoMunicipios.length || 0} Municípios
          </div>
          <div className="text-[11px] text-amber-400/80 mt-1">Rateio 100% valor adicionado</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-1 px-6 border-b border-gray-800 bg-[#161616]">
        <button
          onClick={() => setActiveTab('declaracoes')}
          className={`px-4 py-3 text-xs font-semibold border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'declaracoes'
              ? 'border-blue-500 text-blue-400 bg-blue-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Declarações e Guias DAE ({resumo?.declaracoes.length || 0})</span>
        </button>
        <button
          onClick={() => setActiveTab('apuracao')}
          className={`px-4 py-3 text-xs font-semibold border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'apuracao'
              ? 'border-blue-500 text-blue-400 bg-blue-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Quadro Geral da Apuração do ICMS</span>
        </button>
        <button
          onClick={() => setActiveTab('municipios')}
          className={`px-4 py-3 text-xs font-semibold border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'municipios'
              ? 'border-blue-500 text-blue-400 bg-blue-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Valor Adicionado Municipal (VAF / DIME)</span>
        </button>
        <button
          onClick={() => setActiveTab('arquivo')}
          className={`px-4 py-3 text-xs font-semibold border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'arquivo'
              ? 'border-blue-500 text-blue-400 bg-blue-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Layout Arquivo Magnético Estadual</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-auto p-6">
        {/* Tab 1: Declarações */}
        {activeTab === 'declaracoes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400 font-medium">Filtrar por UF:</span>
                {['TODAS', 'MG', 'SC', 'CE', 'MA'].map(uf => (
                  <button
                    key={uf}
                    onClick={() => setFiltroUf(uf)}
                    className={`px-2.5 py-1 text-xs rounded border transition ${
                      filtroUf === uf
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
                    }`}
                  >
                    {uf}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-800 bg-[#181818]">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#202020] text-gray-400 font-semibold border-b border-gray-800">
                  <tr>
                    <th className="py-3 px-4">Modelo / UF</th>
                    <th className="py-3 px-4">Competência</th>
                    <th className="py-3 px-4">Finalidade</th>
                    <th className="py-3 px-4 text-right">Débitos Saídas</th>
                    <th className="py-3 px-4 text-right">Créditos Entradas</th>
                    <th className="py-3 px-4 text-right">Deduções / TTD</th>
                    <th className="py-3 px-4 text-right">ICMS a Recolher</th>
                    <th className="py-3 px-4 text-center">Status SEFAZ</th>
                    <th className="py-3 px-4 text-center">Contábil</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {resumo?.declaracoes
                    .filter(d => filtroUf === 'TODAS' || d.uf === filtroUf)
                    .map(d => {
                      const isSelected = selectedDec?.id === d.id;
                      return (
                        <tr
                          key={d.id}
                          onClick={() => setSelectedDec(d)}
                          className={`hover:bg-gray-800/50 cursor-pointer transition ${isSelected ? 'bg-blue-900/20' : ''}`}
                        >
                          <td className="py-3 px-4 font-bold text-white flex items-center space-x-1.5">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-blue-900/60 text-blue-300 border border-blue-700 font-mono">
                              {d.uf}
                            </span>
                            <span>{d.tipoDeclaracao.replace('_', ' ')}</span>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-white">
                            {d.competencia}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 text-[10px] rounded bg-gray-800 text-gray-300 border border-gray-700">
                              {d.finalidade.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-rose-400">
                            R$ {d.totalDebitosApuradosBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-emerald-400">
                            R$ {d.totalCreditosApuradosBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-indigo-400">
                            {d.deducoesIncentivosBRL > 0 ? `-R$ ${d.deducoesIncentivosBRL.toFixed(2)}` : 'R$ 0,00'}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-purple-300">
                            R$ {d.valorIcmsEfetivoRecolherBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-blue-900/40 text-blue-300 border border-blue-800 flex items-center justify-center space-x-1">
                              <CheckCircle className="w-3 h-3 text-blue-400" />
                              <span>{d.statusDeclaracao}</span>
                            </span>
                            {d.numeroReciboProtocolo && (
                              <div className="text-[9px] text-gray-500 font-mono mt-0.5">{d.numeroReciboProtocolo}</div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {d.integradoContabil ? (
                              <span className="inline-flex items-center text-emerald-400 text-[11px] font-medium">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Integrado
                              </span>
                            ) : (
                              <span className="text-amber-400 text-[11px] font-medium">Pendente</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDec(d);
                                setModalImprimir(true);
                              }}
                              className="p-1 hover:bg-gray-700 text-gray-400 hover:text-white rounded"
                              title="Espelho DAE"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Quadro de Apuração */}
        {activeTab === 'apuracao' && declaracaoAtual && (
          <div className="space-y-6">
            <div className="p-4 bg-[#1a1a1a] rounded-xl border border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>Quadro Resumo de Apuração do ICMS - {declaracaoAtual.tipoDeclaracao} ({declaracaoAtual.uf})</span>
                  <span className="text-xs font-mono text-gray-400">Competência {declaracaoAtual.competencia}</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Demonstração detalhada de débitos, créditos, estornos e saldo a recolher via DAE Cód. {declaracaoAtual.codigoReceitaDae}
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">ICMS Efetivo a Recolher</div>
                <div className="text-lg font-mono font-bold text-purple-300">
                  R$ {declaracaoAtual.valorIcmsEfetivoRecolherBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Débitos */}
              <div className="p-5 bg-[#181818] rounded-xl border border-gray-800 space-y-3 font-mono text-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 border-b border-gray-800 pb-2 font-sans">
                  1. Débitos do Período (Saídas)
                </h4>
                <div className="flex justify-between items-center text-gray-300">
                  <span className="font-sans">Débito pelas Saídas Tributadas:</span>
                  <span className="font-bold text-white">R$ {declaracaoAtual.totalDebitosSaidasTributadasBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-gray-300">
                  <span className="font-sans">Outros Débitos:</span>
                  <span>R$ {declaracaoAtual.outrosDebitosBRL.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-300">
                  <span className="font-sans">Estornos de Créditos:</span>
                  <span>R$ {declaracaoAtual.estornosCreditoBRL.toFixed(2)}</span>
                </div>
                <div className="pt-3 border-t border-gray-800 flex justify-between items-center text-sm font-bold text-rose-400">
                  <span className="font-sans">TOTAL DOS DÉBITOS:</span>
                  <span>R$ {declaracaoAtual.totalDebitosApuradosBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Créditos */}
              <div className="p-5 bg-[#181818] rounded-xl border border-gray-800 space-y-3 font-mono text-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 border-b border-gray-800 pb-2 font-sans">
                  2. Créditos do Período (Entradas)
                </h4>
                <div className="flex justify-between items-center text-gray-300">
                  <span className="font-sans">Crédito pelas Entradas Tributadas:</span>
                  <span className="font-bold text-white">R$ {declaracaoAtual.totalCreditosEntradasTributadasBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-gray-300">
                  <span className="font-sans">Outros Créditos:</span>
                  <span>R$ {declaracaoAtual.outrosCreditosBRL.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-300">
                  <span className="font-sans">Saldo Credor do Mês Anterior:</span>
                  <span className="text-emerald-400 font-bold">R$ {declaracaoAtual.saldoCredorPeriodoAnteriorBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="pt-3 border-t border-gray-800 flex justify-between items-center text-sm font-bold text-emerald-400">
                  <span className="font-sans">TOTAL DOS CRÉDITOS:</span>
                  <span>R$ {declaracaoAtual.totalCreditosApuradosBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Valor Adicionado Municipal */}
        {activeTab === 'municipios' && declaracaoAtual && (
          <div className="space-y-4">
            <div className="p-4 bg-[#1a1a1a] rounded-xl border border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>Distribuição do Valor Adicionado por Município (VAF / DIME)</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Índice de participação dos municípios no rateio do ICMS e Fundo de Participação
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-800 bg-[#181818]">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#202020] text-gray-400 font-semibold border-b border-gray-800">
                  <tr>
                    <th className="py-3 px-4">Código IBGE</th>
                    <th className="py-3 px-4">Município</th>
                    <th className="py-3 px-4 text-right">Valor das Operações Próprias</th>
                    <th className="py-3 px-4 text-center">% Rateio (VAF)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 font-mono">
                  {declaracaoAtual.distribuicaoMunicipios.map(m => (
                    <tr key={m.id} className="hover:bg-gray-800/40">
                      <td className="py-3 px-4 text-blue-400 font-bold">{m.codigoMunicipioIbge}</td>
                      <td className="py-3 px-4 font-sans text-white font-medium">{m.nomeMunicipio}</td>
                      <td className="py-3 px-4 text-right text-emerald-400">
                        R$ {m.valorOperacoesPropriasBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-amber-400">
                        {m.percentualRateio.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Arquivo Magnético */}
        {activeTab === 'arquivo' && declaracaoAtual && (
          <div className="space-y-4">
            <div className="p-4 bg-[#1a1a1a] rounded-xl border border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>Estrutura do Arquivo Magnético Oficial ({declaracaoAtual.tipoDeclaracao})</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Layout homologado para os sistemas de transmissão estadual (SIARE/MG, SAT/SC, DIEF/CE)
                </p>
              </div>
              <button
                onClick={() => handleTransmitir(declaracaoAtual.id)}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded transition shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Revalidar e Transmitir</span>
              </button>
            </div>

            <div className="p-4 bg-[#0d0d0d] rounded-xl border border-gray-800 font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed">
              <pre>{`0000|${declaracaoAtual.tipoDeclaracao}|${declaracaoAtual.uf}|${declaracaoAtual.competencia.replace('-', '')}|01234567000189|AMIL CONTABIL STUDIO PRO LTDA|
1000|${declaracaoAtual.totalDebitosApuradosBRL.toFixed(2)}|${declaracaoAtual.totalDebitosSaidasTributadasBRL.toFixed(2)}|0.00|0.00|
2000|${declaracaoAtual.totalCreditosApuradosBRL.toFixed(2)}|${declaracaoAtual.totalCreditosEntradasTributadasBRL.toFixed(2)}|${declaracaoAtual.saldoCredorPeriodoAnteriorBRL.toFixed(2)}|0.00|
3000|${declaracaoAtual.saldoDevedorApuradoBRL.toFixed(2)}|${declaracaoAtual.deducoesIncentivosBRL.toFixed(2)}|${declaracaoAtual.valorIcmsEfetivoRecolherBRL.toFixed(2)}|
${declaracaoAtual.distribuicaoMunicipios.map(m => `4000|${m.codigoMunicipioIbge}|${m.valorOperacoesPropriasBRL.toFixed(2)}|${m.percentualRateio.toFixed(2)}|`).join('\n')}
9999|${declaracaoAtual.numeroReciboProtocolo || 'GERADO_LOCALMENTE'}|${declaracaoAtual.hashArquivoValidado || 'HASH_LOCAL'}|`}</pre>
            </div>
          </div>
        )}
      </div>

      {/* Modal Espelho DAE A4 Timbrado */}
      {modalImprimir && declaracaoAtual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white text-gray-900 w-full max-w-3xl h-[90vh] overflow-y-auto rounded-lg shadow-2xl flex flex-col font-sans p-8 print:p-0">
            {/* Action Bar */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-300 print:hidden">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                Visualização de Impressão - Documento de Arrecadação Estadual (DAE / {declaracaoAtual.uf})
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center space-x-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir DAE</span>
                </button>
                <button
                  onClick={() => setModalImprimir(false)}
                  className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-xs font-semibold"
                >
                  Fechar
                </button>
              </div>
            </div>

            {/* DAE Layout */}
            <div className="border-2 border-gray-900 p-6 space-y-4">
              <div className="flex border-b-2 border-gray-900 pb-3">
                <div className="w-2/3 pr-4 border-r border-gray-400 flex flex-col justify-between">
                  <div className="font-black text-xl tracking-tighter">
                    SECRETARIA DE ESTADO DE FAZENDA - SEF/{declaracaoAtual.uf}
                  </div>
                  <div className="text-xs font-bold text-gray-700 mt-1">
                    DOCUMENTO DE ARRECADAÇÃO ESTADUAL - DAE
                  </div>
                  <div className="text-sm font-black mt-2">
                    ICMS OPERAÇÕES PRÓPRIAS - {declaracaoAtual.tipoDeclaracao}
                  </div>
                  <div className="text-[10px] text-gray-600 mt-2">
                    AMIL CONTÁBIL STUDIO PRO LTDA. | CNPJ: 01.234.567/0001-89 | IE: 001.234.567.0090
                  </div>
                </div>

                <div className="w-1/3 pl-4 space-y-2 text-xs font-mono">
                  <div className="border border-gray-400 p-1.5 rounded">
                    <div className="text-[9px] text-gray-500 font-sans uppercase">Período Referência</div>
                    <div className="font-bold text-gray-900">{declaracaoAtual.competencia}</div>
                  </div>
                  <div className="border border-gray-400 p-1.5 rounded">
                    <div className="text-[9px] text-gray-500 font-sans uppercase">Código da Receita</div>
                    <div className="font-bold text-gray-900 text-sm">{declaracaoAtual.codigoReceitaDae}</div>
                  </div>
                  <div className="border border-gray-400 p-1.5 rounded">
                    <div className="text-[9px] text-gray-500 font-sans uppercase">Data de Vencimento</div>
                    <div className="font-bold text-gray-900">{declaracaoAtual.dataVencimentoDae}</div>
                  </div>
                  <div className="border border-gray-400 p-1.5 rounded bg-gray-100">
                    <div className="text-[9px] text-gray-700 font-sans uppercase font-bold">Total a Recolher</div>
                    <div className="font-black text-gray-900 text-sm">
                      R$ {declaracaoAtual.valorIcmsEfetivoRecolherBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Informações Complementares */}
              <div className="border border-gray-400 p-3 rounded text-xs">
                <div className="font-bold uppercase text-gray-700 mb-1">Informações de Apuração:</div>
                <div className="space-y-0.5 text-gray-600 font-mono text-[11px]">
                  <div>- Débitos do Período: R$ {declaracaoAtual.totalDebitosApuradosBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                  <div>- Créditos do Período: R$ {declaracaoAtual.totalCreditosApuradosBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                  <div>- Deduções / Incentivos: R$ {declaracaoAtual.deducoesIncentivosBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                  <div>- Protocolo SEFAZ: {declaracaoAtual.numeroReciboProtocolo || 'PENDENTE'}</div>
                </div>
              </div>

              {/* Código de barras FEBRABAN */}
              <div className="pt-4 text-center space-y-1">
                <div className="font-mono text-xs font-bold tracking-widest text-gray-800">
                  {declaracaoAtual.codigoBarrasDaeFebraban}
                </div>
                <div className="h-10 bg-gray-900 w-full rounded flex items-center justify-center text-white text-[10px] font-mono tracking-widest">
                  || | |||| ||| ||||| |||| || |||||| ||||| ||| |||| |||| ||||| || ||||
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
