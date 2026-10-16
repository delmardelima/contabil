import React, { useState, useEffect } from 'react';
import {
  Activity,
  ShieldCheck,
  FileText,
  Send,
  Printer,
  Plus,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Building,
  TrendingUp,
  Percent,
  Search,
  ExternalLink,
  Lock,
  Layers,
  HeartPulse,
  Database,
  Calendar,
  X
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import { DemonstrativoDiopsAns, ProvisaoTecnicaAns, ResumoDiopsAns } from '../../types/contabil';

export const DiopsAnsModule: React.FC = () => {
  const [resumo, setResumo] = useState<ResumoDiopsAns | null>(null);
  const [selectedDemo, setSelectedDemo] = useState<DemonstrativoDiopsAns | null>(null);
  const [activeTab, setActiveTab] = useState<'demonstrativos' | 'provisoes' | 'cbr' | 'xml'>('demonstrativos');
  const [filtroTexto, setFiltroTexto] = useState('');
  const [modalImprimir, setModalImprimir] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  const carregarDados = () => {
    try {
      const data = dbService.getDemonstrativosDiopsAns();
      setResumo(data);
      if (data.demonstrativos.length > 0) {
        if (!selectedDemo || !data.demonstrativos.some(d => d.id === selectedDemo.id)) {
          setSelectedDemo(data.demonstrativos[0]);
        } else {
          const atualizado = data.demonstrativos.find(d => d.id === selectedDemo.id);
          if (atualizado) setSelectedDemo(atualizado);
        }
      }
    } catch (e: any) {
      setMensagemErro('Erro ao carregar demonstrativos DIOPS: ' + e.message);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleTransmitirXml = (demoId: string) => {
    const res = dbService.transmitirXmlDiopsAns(demoId);
    if (res.sucesso) {
      setMensagemSucesso(res.mensagem);
      carregarDados();
    } else {
      setMensagemErro(res.mensagem);
    }
  };

  const handleIntegrarContabilidade = (demoId: string) => {
    const res = dbService.integrarProvisoesAnsContabil(demoId);
    if (res.sucesso) {
      setMensagemSucesso(res.mensagem);
      carregarDados();
    } else {
      setMensagemErro(res.mensagem);
    }
  };

  const demonstrativoAtual = selectedDemo || (resumo && resumo.demonstrativos[0]) || null;

  return (
    <div className="flex flex-col h-full bg-[#121212] text-gray-100 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#1a1a1a] border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-white">DIOPS ANS - Saúde Suplementar</h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-900/40 text-blue-300 border border-blue-800">
                RN nº 518/2022 & RN 527/2022
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-900/40 text-emerald-300 border border-emerald-800">
                Registro ANS: {resumo?.registroAns || '359050'}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Documento de Informações Periódicas, Provisões Técnicas Atuariais (PEONA/PIC) e Capital Baseado em Risco (CBR)
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
          {demonstrativoAtual && (
            <>
              <button
                onClick={() => handleTransmitirXml(demonstrativoAtual.id)}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded transition shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Transmitir XML ANS</span>
              </button>
              <button
                onClick={() => handleIntegrarContabilidade(demonstrativoAtual.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded transition shadow-sm ${
                  demonstrativoAtual.integradoContabil
                    ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700 cursor-default'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>{demonstrativoAtual.integradoContabil ? 'Contabilizado' : 'Integrar Diário'}</span>
              </button>
              <button
                onClick={() => setModalImprimir(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-gray-700 hover:bg-gray-600 text-white rounded transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Laudo A4 Timbrado</span>
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
            <span>Contraprestações Efetivas</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight">
            R$ {(demonstrativoAtual?.totalContraprestacoesEfetivasBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">Receita bruta operacional de planos</div>
        </div>

        <div className="p-4 bg-[#1a1a1a] rounded-xl border border-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Sinistralidade Operacional</span>
            <Percent className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400 tracking-tight">
            {(demonstrativoAtual?.sinistralidadePercentual || 0).toFixed(2)}%
          </div>
          <div className="text-[11px] text-gray-500 mt-1">Sinistros / Contraprestações (Meta &lt; 75%)</div>
        </div>

        <div className="p-4 bg-[#1a1a1a] rounded-xl border border-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Provisões Técnicas (PEONA/PIC)</span>
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight">
            R$ {(demonstrativoAtual?.totalProvisoesTecnicasBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-blue-400/80 mt-1">Passivo Regulatório Exigível</div>
        </div>

        <div className="p-4 bg-[#1a1a1a] rounded-xl border border-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Ativos Garantidores Vinculados</span>
            <Lock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 tracking-tight">
            {(demonstrativoAtual?.indiceCoberturaProvisoesPercentual || 0).toFixed(2)}%
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-1">
            R$ {(demonstrativoAtual?.totalAtivosGarantidoresBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (Suficiente &ge; 100%)
          </div>
        </div>

        <div className="p-4 bg-[#1a1a1a] rounded-xl border border-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Margem Solvência (CBR)</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-purple-300 tracking-tight">
            {(demonstrativoAtual?.capitalRisco.margemSolvenciaPercentual || 0).toFixed(2)}%
          </div>
          <div className="text-[11px] text-purple-400/80 mt-1">
            PLA R$ {((demonstrativoAtual?.capitalRisco.patrimonioLiquidoAjustadoBRL || 0) / 1000000).toFixed(2)}M (Enquadrada)
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-1 px-6 border-b border-gray-800 bg-[#161616]">
        <button
          onClick={() => setActiveTab('demonstrativos')}
          className={`px-4 py-3 text-xs font-semibold border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'demonstrativos'
              ? 'border-blue-500 text-blue-400 bg-blue-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Demonstrativos Trimestrais ({resumo?.demonstrativos.length || 0})</span>
        </button>
        <button
          onClick={() => setActiveTab('provisoes')}
          className={`px-4 py-3 text-xs font-semibold border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'provisoes'
              ? 'border-blue-500 text-blue-400 bg-blue-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Provisões Técnicas & Ativos Vinculados ({demonstrativoAtual?.provisoesTecnicas.length || 0})</span>
        </button>
        <button
          onClick={() => setActiveTab('cbr')}
          className={`px-4 py-3 text-xs font-semibold border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'cbr'
              ? 'border-blue-500 text-blue-400 bg-blue-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Capital Baseado em Risco (CBR / PLA)</span>
        </button>
        <button
          onClick={() => setActiveTab('xml')}
          className={`px-4 py-3 text-xs font-semibold border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'xml'
              ? 'border-blue-500 text-blue-400 bg-blue-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>XML Oficial & Validador ANS ({demonstrativoAtual?.versaoXsdAns || 'Diops2026.xsd'})</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Tab 1: Demonstrativos Trimestrais */}
        {activeTab === 'demonstrativos' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative w-80">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filtrar por ano, trimestre ou protocolo..."
                  value={filtroTexto}
                  onChange={e => setFiltroTexto(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#1a1a1a] border border-gray-700 rounded text-gray-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-800 bg-[#181818]">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#202020] text-gray-400 font-semibold border-b border-gray-800">
                  <tr>
                    <th className="py-3 px-4">Período</th>
                    <th className="py-3 px-4">Operadora / CNPJ</th>
                    <th className="py-3 px-4">Modalidade</th>
                    <th className="py-3 px-4 text-right">Contraprestações</th>
                    <th className="py-3 px-4 text-right">Sinistros</th>
                    <th className="py-3 px-4 text-right">Provisões Técnicas</th>
                    <th className="py-3 px-4 text-center">Cobertura Ativos</th>
                    <th className="py-3 px-4 text-center">Status Transmissão</th>
                    <th className="py-3 px-4 text-center">Contábil</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {resumo?.demonstrativos
                    .filter(d => 
                      d.trimestreReferencia.toLowerCase().includes(filtroTexto.toLowerCase()) ||
                      String(d.exercicioAno).includes(filtroTexto) ||
                      (d.numeroReciboProtocoloAns && d.numeroReciboProtocoloAns.toLowerCase().includes(filtroTexto.toLowerCase()))
                    )
                    .map(d => {
                      const isSelected = selectedDemo?.id === d.id;
                      return (
                        <tr
                          key={d.id}
                          onClick={() => setSelectedDemo(d)}
                          className={`hover:bg-gray-800/50 cursor-pointer transition ${isSelected ? 'bg-blue-900/20' : ''}`}
                        >
                          <td className="py-3 px-4 font-mono font-bold text-white">
                            {d.trimestreReferencia}/{d.exercicioAno}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-200">{d.razaoSocialOperadora}</div>
                            <div className="text-[11px] text-gray-500 font-mono">Reg. ANS: {d.registroAns} | CNPJ: {d.cnpjOperadora}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-gray-800 text-gray-300 border border-gray-700">
                              {d.modalidade.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-emerald-400">
                            R$ {d.totalContraprestacoesEfetivasBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-rose-400">
                            R$ {d.totalSinistrosEventosIndenizaveisBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            <div className="text-[10px] text-gray-500 font-sans">({d.sinistralidadePercentual.toFixed(1)}%)</div>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-white">
                            R$ {d.totalProvisoesTecnicasBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                              d.indiceCoberturaProvisoesPercentual >= 100
                                ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-800'
                                : 'bg-rose-900/40 text-rose-300 border border-rose-800'
                            }`}>
                              {d.indiceCoberturaProvisoesPercentual.toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-blue-900/40 text-blue-300 border border-blue-800 flex items-center justify-center space-x-1">
                              <CheckCircle className="w-3 h-3 text-blue-400" />
                              <span>{d.statusTransmissaoAns.replace(/_/g, ' ')}</span>
                            </span>
                            {d.numeroReciboProtocoloAns && (
                              <div className="text-[9px] text-gray-500 font-mono mt-0.5">{d.numeroReciboProtocoloAns}</div>
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
                                setSelectedDemo(d);
                                setModalImprimir(true);
                              }}
                              className="p-1 hover:bg-gray-700 text-gray-400 hover:text-white rounded"
                              title="Imprimir Laudo ANS"
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

        {/* Tab 2: Provisões Técnicas */}
        {activeTab === 'provisoes' && demonstrativoAtual && (
          <div className="space-y-6">
            <div className="p-4 bg-[#1a1a1a] rounded-xl border border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>Provisões Técnicas Regulatórias ANS - {demonstrativoAtual.trimestreReferencia}/{demonstrativoAtual.exercicioAno}</span>
                  <span className="text-xs font-normal text-gray-400">(RN nº 518/2022 Art. 2º e 3º)</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Exigência prudencial de constituição no passivo e vinculação de ativos garantidores em custódia especial Bacen/B3
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">Total Provisões Técnicas</div>
                <div className="text-lg font-mono font-bold text-blue-400">
                  R$ {demonstrativoAtual.totalProvisoesTecnicasBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-800 bg-[#181818]">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#202020] text-gray-400 font-semibold border-b border-gray-800">
                  <tr>
                    <th className="py-3 px-4">Conta ANS</th>
                    <th className="py-3 px-4">Provisão Regulatória</th>
                    <th className="py-3 px-4">Método de Cálculo / Modelo</th>
                    <th className="py-3 px-4 text-right">Valor Constituído</th>
                    <th className="py-3 px-4 text-right">Ativos Garantidores</th>
                    <th className="py-3 px-4 text-right">Suficiência (Folga)</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 font-mono">
                  {demonstrativoAtual.provisoesTecnicas.map(p => (
                    <tr key={p.id} className="hover:bg-gray-800/40">
                      <td className="py-3 px-4 text-blue-400 font-bold">{p.codigoContaAns}</td>
                      <td className="py-3 px-4 font-sans font-medium text-white">{p.nomeProvisao}</td>
                      <td className="py-3 px-4 font-sans text-xs text-gray-400">{p.metodoCalculo}</td>
                      <td className="py-3 px-4 text-right text-white">
                        R$ {p.valorConstituidoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right text-emerald-400">
                        R$ {p.valorAtivosGarantidoresBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right text-indigo-400">
                        +R$ {p.suficienciaCoberturaBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center font-sans">
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-900/40 text-emerald-300 border border-emerald-800">
                          {p.statusCobertura}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-[#1f1f1f] font-mono font-bold text-white border-t border-gray-700">
                  <tr>
                    <td colSpan={3} className="py-3 px-4 text-right font-sans">TOTAIS REGULATÓRIOS CONSOLIDADOS:</td>
                    <td className="py-3 px-4 text-right text-white">
                      R$ {demonstrativoAtual.totalProvisoesTecnicasBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-400">
                      R$ {demonstrativoAtual.totalAtivosGarantidoresBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right text-indigo-400">
                      +R$ {(demonstrativoAtual.totalAtivosGarantidoresBRL - demonstrativoAtual.totalProvisoesTecnicasBRL).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center text-emerald-400 font-sans">
                      {demonstrativoAtual.indiceCoberturaProvisoesPercentual.toFixed(2)}%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Capital Baseado em Risco */}
        {activeTab === 'cbr' && demonstrativoAtual && (
          <div className="space-y-6">
            <div className="p-4 bg-[#1a1a1a] rounded-xl border border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>Demonstrativo do Capital Baseado em Risco (CBR) e Margem de Solvência</span>
                  <span className="text-xs font-normal text-purple-400">(RN nº 527/2022)</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Comparação do Patrimônio Líquido Ajustado (PLA) com o Capital Regulatório Requerido (CR)
                </p>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-bold">
                SITUAÇÃO: {demonstrativoAtual.capitalRisco.situacaoSolvencia}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Box Risco */}
              <div className="p-5 bg-[#181818] rounded-xl border border-gray-800 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-800 pb-2">
                  1. Componentes do Capital Baseado em Risco (CBR)
                </h4>
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center text-gray-300">
                    <span className="font-sans">Capital Base (Modalidade e Porte):</span>
                    <span className="font-bold text-white">
                      R$ {demonstrativoAtual.capitalRisco.capitalBaseBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-gray-300">
                    <span className="font-sans">Risco de Subscrição (Eventos Médicos):</span>
                    <span className="text-blue-400">
                      R$ {demonstrativoAtual.capitalRisco.riscoSubscricaoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-gray-300">
                    <span className="font-sans">Risco de Crédito (Inadimplência de Planos):</span>
                    <span className="text-amber-400">
                      R$ {demonstrativoAtual.capitalRisco.riscoCreditoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-gray-300">
                    <span className="font-sans">Risco de Mercado (Flutuação de Taxas/Ativos):</span>
                    <span className="text-indigo-400">
                      R$ {demonstrativoAtual.capitalRisco.riscoMercadoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-gray-300">
                    <span className="font-sans">Risco Operacional e Legal:</span>
                    <span className="text-gray-400">
                      R$ {demonstrativoAtual.capitalRisco.riscoOperacionalLegalBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-gray-800 flex justify-between items-center text-sm font-bold text-white">
                    <span className="font-sans">Capital Regulatório Requerido (CR):</span>
                    <span className="text-rose-400">
                      R$ {demonstrativoAtual.capitalRisco.capitalRegulatorioRequeridoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Box Solvencia */}
              <div className="p-5 bg-[#181818] rounded-xl border border-gray-800 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-800 pb-2">
                  2. Margem de Solvência & Adequação Prudencial
                </h4>
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center text-gray-300">
                    <span className="font-sans">Patrimônio Líquido Ajustado (PLA):</span>
                    <span className="font-bold text-emerald-400 text-sm">
                      R$ {demonstrativoAtual.capitalRisco.patrimonioLiquidoAjustadoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-gray-300">
                    <span className="font-sans">Capital Requerido (CR):</span>
                    <span className="text-white">
                      R$ {demonstrativoAtual.capitalRisco.capitalRegulatorioRequeridoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-gray-300">
                    <span className="font-sans">Excesso / Folga Prudencial de Capital:</span>
                    <span className="text-indigo-400 font-bold">
                      +R$ {(demonstrativoAtual.capitalRisco.patrimonioLiquidoAjustadoBRL - demonstrativoAtual.capitalRisco.capitalRegulatorioRequeridoBRL).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-gray-800 flex justify-between items-center text-base font-bold">
                    <span className="font-sans text-gray-200">Margem de Solvência:</span>
                    <span className="text-emerald-400">
                      {demonstrativoAtual.capitalRisco.margemSolvenciaPercentual.toFixed(2)}%
                    </span>
                  </div>
                  <div className="p-3 bg-emerald-950/30 border border-emerald-800/60 rounded text-[11px] font-sans text-emerald-300">
                    Operadora plenamente solvível e enquadrada nos critérios prudenciais da ANS, sem necessidade de Plano de Recuperação Assistencial ou Termo de Ajustamento.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: XML Oficial ANS */}
        {activeTab === 'xml' && demonstrativoAtual && (
          <div className="space-y-4">
            <div className="p-4 bg-[#1a1a1a] rounded-xl border border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>Estrutura XML DIOPS - {demonstrativoAtual.versaoXsdAns}</span>
                  <span className="text-xs font-mono text-gray-400">Hash SHA-256: {demonstrativoAtual.hashXmlSha256}</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Validação sintática e semântica de regras pelo motor Java JNI DiopsFinanceiroClientJNI
                </p>
              </div>
              <button
                onClick={() => handleTransmitirXml(demonstrativoAtual.id)}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded transition shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Revalidar e Transmitir</span>
              </button>
            </div>

            <div className="p-4 bg-[#0d0d0d] rounded-xl border border-gray-800 font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed">
              <pre>{`<?xml version="1.0" encoding="UTF-8"?>
<ans:diopsFinanceiro xmlns:ans="http://www.ans.gov.br/padroes/diops/2026/schemas/Diops2026.xsd"
                    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <ans:cabecalho>
    <ans:identificacaoTransacao>
      <ans:tipoTransacao>DIOPS_FINANCEIRO</ans:tipoTransacao>
      <ans:registroAns>${demonstrativoAtual.registroAns}</ans:registroAns>
      <ans:cnpj>${demonstrativoAtual.cnpjOperadora}</ans:cnpj>
      <ans:razaoSocial>${demonstrativoAtual.razaoSocialOperadora}</ans:razaoSocial>
      <ans:periodoReferencia>
        <ans:ano>${demonstrativoAtual.exercicioAno}</ans:ano>
        <ans:trimestre>${demonstrativoAtual.trimestreReferencia}</ans:trimestre>
      </ans:periodoReferencia>
      <ans:dataGeracao>${demonstrativoAtual.dataGeracaoXml}</ans:dataGeracao>
    </ans:identificacaoTransacao>
  </ans:cabecalho>
  <ans:demonstrativoFinanceiro>
    <ans:contraprestacoesEfetivas>${demonstrativoAtual.totalContraprestacoesEfetivasBRL.toFixed(2)}</ans:contraprestacoesEfetivas>
    <ans:sinistrosIndenizaveis>${demonstrativoAtual.totalSinistrosEventosIndenizaveisBRL.toFixed(2)}</ans:sinistrosIndenizaveis>
    <ans:provisoesTecnicas>
${demonstrativoAtual.provisoesTecnicas.map(p => `      <ans:provisao contaAns="${p.codigoContaAns}" tipo="${p.tipo}">
        <ans:valorConstituido>${p.valorConstituidoBRL.toFixed(2)}</ans:valorConstituido>
        <ans:ativosGarantidores>${p.valorAtivosGarantidoresBRL.toFixed(2)}</ans:ativosGarantidores>
        <ans:metodoAtuarial>${p.metodoCalculo}</ans:metodoAtuarial>
      </ans:provisao>`).join('\n')}
    </ans:provisoesTecnicas>
    <ans:capitalBaseadoRisco>
      <ans:capitalBase>${demonstrativoAtual.capitalRisco.capitalBaseBRL.toFixed(2)}</ans:capitalBase>
      <ans:riscoSubscricao>${demonstrativoAtual.capitalRisco.riscoSubscricaoBRL.toFixed(2)}</ans:riscoSubscricao>
      <ans:riscoCredito>${demonstrativoAtual.capitalRisco.riscoCreditoBRL.toFixed(2)}</ans:riscoCredito>
      <ans:riscoMercado>${demonstrativoAtual.capitalRisco.riscoMercadoBRL.toFixed(2)}</ans:riscoMercado>
      <ans:capitalRequerido>${demonstrativoAtual.capitalRisco.capitalRegulatorioRequeridoBRL.toFixed(2)}</ans:capitalRequerido>
      <ans:patrimonioLiquidoAjustado>${demonstrativoAtual.capitalRisco.patrimonioLiquidoAjustadoBRL.toFixed(2)}</ans:patrimonioLiquidoAjustado>
      <ans:margemSolvenciaPercentual>${demonstrativoAtual.capitalRisco.margemSolvenciaPercentual.toFixed(2)}</ans:margemSolvenciaPercentual>
    </ans:capitalBaseadoRisco>
  </ans:demonstrativoFinanceiro>
  <ans:assinaturaDigital>
    <ans:hashSha256>${demonstrativoAtual.hashXmlSha256}</ans:hashSha256>
    <ans:reciboProtocolo>${demonstrativoAtual.numeroReciboProtocoloAns || 'PENDENTE'}</ans:reciboProtocolo>
  </ans:assinaturaDigital>
</ans:diopsFinanceiro>`}</pre>
            </div>
          </div>
        )}
      </div>

      {/* Modal A4 Timbrado */}
      {modalImprimir && demonstrativoAtual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white text-gray-900 w-full max-w-4xl h-[90vh] overflow-y-auto rounded-lg shadow-2xl flex flex-col font-sans p-8 print:p-0">
            {/* Action Bar */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-300 print:hidden">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                Visualização de Impressão A4 - Laudo Regulatório DIOPS ANS
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center space-x-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir</span>
                </button>
                <button
                  onClick={() => setModalImprimir(false)}
                  className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-xs font-semibold"
                >
                  Fechar
                </button>
              </div>
            </div>

            {/* Timbrado Document Content */}
            <div className="border border-gray-400 p-8 space-y-6 flex-1 flex flex-col justify-between">
              <div>
                {/* Header Timbrado */}
                <div className="flex items-center justify-between border-b-2 border-gray-800 pb-4">
                  <div>
                    <h2 className="text-lg font-black tracking-tight uppercase text-gray-900">
                      {demonstrativoAtual.razaoSocialOperadora}
                    </h2>
                    <div className="text-xs text-gray-600">
                      Registro ANS nº {demonstrativoAtual.registroAns} | CNPJ: {demonstrativoAtual.cnpjOperadora} | Modalidade: {demonstrativoAtual.modalidade.replace('_', ' ')}
                    </div>
                    <div className="text-xs text-gray-500">
                      Operadora de Planos Privados de Assistência à Saúde - Regulamentação Lei 9.656/1998
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="px-2.5 py-1 bg-gray-900 text-white font-mono text-xs font-bold uppercase rounded">
                      DIOPS / ANS
                    </div>
                    <div className="text-xs font-mono font-bold text-gray-800 mt-1">
                      {demonstrativoAtual.trimestreReferencia}/{demonstrativoAtual.exercicioAno}
                    </div>
                  </div>
                </div>

                <div className="text-center my-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                    LAUDO REGULATÓRIO DE SUFICIÊNCIA DAS PROVISÕES TÉCNICAS E SOLVÊNCIA
                  </h3>
                  <p className="text-xs text-gray-600">
                    Em conformidade com as Resoluções Normativas ANS nº 518/2022, nº 527/2022 e Instruções Normativas DIOPS-Financeiro
                  </p>
                </div>

                {/* 1. Sumário Econômico Assistencial */}
                <div className="space-y-2 mt-4">
                  <h4 className="text-xs font-bold uppercase text-gray-800 border-b border-gray-300 pb-1">
                    1. Demonstração de Resultado Assistencial do Trimestre
                  </h4>
                  <table className="w-full text-xs font-mono border border-gray-300">
                    <tbody className="divide-y divide-gray-300">
                      <tr>
                        <td className="py-1.5 px-3 font-sans bg-gray-50">Receita de Contraprestações Efetivas de Planos de Saúde:</td>
                        <td className="py-1.5 px-3 text-right font-bold">
                          R$ {demonstrativoAtual.totalContraprestacoesEfetivasBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 font-sans bg-gray-50">Eventos / Sinistros Médicos Hospitalares Indenizáveis Conhecidos:</td>
                        <td className="py-1.5 px-3 text-right text-rose-700 font-bold">
                          R$ {demonstrativoAtual.totalSinistrosEventosIndenizaveisBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 font-sans bg-gray-50">Índice Geral de Sinistralidade Operacional:</td>
                        <td className="py-1.5 px-3 text-right font-bold text-amber-700">
                          {demonstrativoAtual.sinistralidadePercentual.toFixed(2)}% (Enquadrado na meta prudencial &lt; 75%)
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 2. Provisões Técnicas e Ativos Vinculados */}
                <div className="space-y-2 mt-4">
                  <h4 className="text-xs font-bold uppercase text-gray-800 border-b border-gray-300 pb-1">
                    2. Quadro Geral de Provisões Técnicas Regulatórias & Ativos Vinculados
                  </h4>
                  <table className="w-full text-xs font-mono border border-gray-300">
                    <thead className="bg-gray-100 font-sans text-gray-700">
                      <tr>
                        <th className="py-1.5 px-2 text-left">Código ANS</th>
                        <th className="py-1.5 px-2 text-left">Denominação da Provisão</th>
                        <th className="py-1.5 px-2 text-right">Constituído</th>
                        <th className="py-1.5 px-2 text-right">Ativos Bacen/B3</th>
                        <th className="py-1.5 px-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-300">
                      {demonstrativoAtual.provisoesTecnicas.map(p => (
                        <tr key={p.id}>
                          <td className="py-1 px-2">{p.codigoContaAns}</td>
                          <td className="py-1 px-2 font-sans">{p.nomeProvisao}</td>
                          <td className="py-1 px-2 text-right">R$ {p.valorConstituidoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          <td className="py-1 px-2 text-right text-emerald-800 font-bold">R$ {p.valorAtivosGarantidoresBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          <td className="py-1 px-2 text-center font-sans font-bold text-emerald-700">{p.statusCobertura}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-100 font-bold border-t border-gray-400">
                      <tr>
                        <td colSpan={2} className="py-1.5 px-2 font-sans">TOTAL REGULATÓRIO / COBERTURA GERAL:</td>
                        <td className="py-1.5 px-2 text-right">R$ {demonstrativoAtual.totalProvisoesTecnicasBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="py-1.5 px-2 text-right text-emerald-800">R$ {demonstrativoAtual.totalAtivosGarantidoresBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="py-1.5 px-2 text-center font-sans text-emerald-800">{demonstrativoAtual.indiceCoberturaProvisoesPercentual.toFixed(2)}%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* 3. Margem de Solvência CBR */}
                <div className="space-y-2 mt-4">
                  <h4 className="text-xs font-bold uppercase text-gray-800 border-b border-gray-300 pb-1">
                    3. Indicador de Solvência e Capital Baseado em Risco (RN 527/2022)
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                    <div className="p-3 bg-gray-50 border border-gray-300 rounded space-y-1">
                      <div>Capital Regulatório Requerido (CR): R$ {demonstrativoAtual.capitalRisco.capitalRegulatorioRequeridoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                      <div>Patrimônio Líquido Ajustado (PLA): R$ {demonstrativoAtual.capitalRisco.patrimonioLiquidoAjustadoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    </div>
                    <div className="p-3 bg-gray-50 border border-gray-300 rounded space-y-1">
                      <div className="font-bold text-emerald-800">Margem de Solvência: {demonstrativoAtual.capitalRisco.margemSolvenciaPercentual.toFixed(2)}%</div>
                      <div>Situação Regulatória: ENQUADRADA COM FOLGA PRUDENCIAL</div>
                    </div>
                  </div>
                </div>

                {/* Protocolo WebService */}
                <div className="p-3 bg-gray-100 border border-gray-300 rounded text-xs font-mono mt-4">
                  <div>Recibo de Transmissão ANS: <span className="font-bold">{demonstrativoAtual.numeroReciboProtocoloAns || 'TRANSMITIDO VIA WEBSERVICE'}</span></div>
                  <div>Hash do Arquivo XML SHA-256: {demonstrativoAtual.hashXmlSha256}</div>
                </div>
              </div>

              {/* Assinaturas */}
              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-gray-300 text-center text-xs">
                <div>
                  <div className="border-b border-gray-600 mb-1 w-64 mx-auto"></div>
                  <div className="font-bold text-gray-900">Dr. Roberto Albuquerque Sampaio</div>
                  <div className="text-gray-600">Diretor Técnico Médico - CRM/SP 104.920</div>
                  <div className="text-gray-500 text-[10px]">Responsável Técnico Assistencial ANS</div>
                </div>
                <div>
                  <div className="border-b border-gray-600 mb-1 w-64 mx-auto"></div>
                  <div className="font-bold text-gray-900">Marcus Vinicius Carvalho</div>
                  <div className="text-gray-600">Contador Responsável - CRC 1SP298450/O-2</div>
                  <div className="text-gray-500 text-[10px]">Perito Contábil e Auditor Independente</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
