import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Calendar, 
  Send, 
  FileCode, 
  Download, 
  Copy, 
  CheckCircle2, 
  Eye, 
  ShieldCheck, 
  Printer, 
  Users, 
  Layers, 
  Info,
  Clock,
  Sparkles
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import { 
  EventoESocial, 
  ResumoESocialCompetencia, 
  Colaborador, 
  Empresa 
} from '../../types/contabil';
import { ReportPrintPreviewModal } from '../layout/ReportPrintPreviewModal';

export const ESocialXmlModule: React.FC = () => {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [competencia, setCompetencia] = useState<string>('2026-02');
  const [activeTab, setActiveTab] = useState<'EVENTOS' | 'MONITOR' | 'REGRAS'>('EVENTOS');
  const [resumo, setResumo] = useState<ResumoESocialCompetencia | null>(null);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [selectedEvento, setSelectedEvento] = useState<EventoESocial | null>(null);
  const [showXmlModal, setShowXmlModal] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ tipo: 'success' | 'error' | 'info'; mensagem: string } | null>(null);

  const carregarDados = () => {
    const emp = dbService.getActiveEmpresa() || dbService.getEmpresas()[0];
    setEmpresa(emp);
    if (emp) {
      const colabs = dbService.getColaboradores().filter(c => c.empresaId === emp.id && c.status === 'ATIVO');
      setColaboradores(colabs);
      const res = dbService.getResumoESocialCompetencia(emp.id, competencia);
      setResumo(res);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [competencia]);

  const handleGerarLoteS1200 = () => {
    if (!empresa) return;
    colaboradores.forEach(colab => {
      dbService.gerarXmlESocial(empresa.id, 'S-1200', colab.id, competencia);
    });
    setFeedback({ tipo: 'success', mensagem: `Eventos S-1200 (Remuneração) gerados para todos os ${colaboradores.length} colaboradores!` });
    carregarDados();
  };

  const handleGerarLoteS1210 = () => {
    if (!empresa) return;
    colaboradores.forEach(colab => {
      dbService.gerarXmlESocial(empresa.id, 'S-1210', colab.id, competencia);
    });
    setFeedback({ tipo: 'success', mensagem: `Eventos S-1210 (Pagamentos) gerados para todos os ${colaboradores.length} colaboradores!` });
    carregarDados();
  };

  const handleTransmitirLote = () => {
    if (!empresa) return;
    const res = dbService.transmitirEventosESocial(empresa.id, competencia);
    if (res.success && res.recibos.length > 0) {
      setFeedback({ 
        tipo: 'success', 
        mensagem: `Sucesso! ${res.recibos.length} eventos do eSocial transmitidos e validados pelo SERPRO com recibo emitido!` 
      });
      carregarDados();
    } else {
      setFeedback({ tipo: 'error', mensagem: 'Nenhum evento pendente para transmissão nesta competência.' });
    }
  };

  const handleVisualizarXml = (evento: EventoESocial) => {
    setSelectedEvento(evento);
    setShowXmlModal(true);
    setCopied(false);
  };

  const handleCopiarXml = () => {
    if (selectedEvento) {
      navigator.clipboard.writeText(selectedEvento.xmlContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadXml = (evento: EventoESocial) => {
    const blob = new Blob([evento.xmlContent], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `eSocial_${evento.tipoEvento}_${evento.colaboradorCpf || 'EMPRESA'}_${evento.competencia}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatarMoeda = (v: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
  };

  return (
    <div className="flex flex-col h-full bg-[#141414] text-slate-100 overflow-y-auto font-sans p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#2a2a2a]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-indigo-400" />
              Central eSocial - Eventos Periódicos em XML
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Leiaute v_S_01_02_00 Oficial
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Geração Estruturada de Eventos S-1200 (Remuneração) & S-1210 (Pagamentos) • Validação de Schemas XSD e Transmissão
          </p>
        </div>

        {/* Controles de Topo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#1c1c1c] px-3 py-1.5 rounded-lg border border-[#2a2a2a]">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-300 font-medium">
              {empresa ? `${empresa.codigo} - ${empresa.razaoSocial}` : 'Selecionando...'}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-[#1c1c1c] px-3 py-1.5 rounded-lg border border-[#2a2a2a]">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input 
              type="month"
              value={competencia}
              onChange={(e) => setCompetencia(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => setShowPrintModal(true)}
            className="flex items-center gap-1.5 bg-[#252525] hover:bg-[#2d2d2d] text-slate-200 text-xs px-3.5 py-2 rounded-lg border border-[#333] transition"
          >
            <Printer className="w-4 h-4 text-slate-300" />
            Recibo A4
          </button>

          <button
            onClick={handleTransmitirLote}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-4 py-2 rounded-lg shadow-sm transition"
          >
            <Send className="w-4 h-4" />
            Transmitir eSocial
          </button>
        </div>
      </div>

      {/* Alertas */}
      {feedback && (
        <div className={`mt-4 p-3.5 rounded-lg text-xs flex items-center justify-between border ${
          feedback.tipo === 'success' ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' :
          feedback.tipo === 'error' ? 'bg-rose-950/40 border-rose-500/30 text-rose-300' :
          'bg-blue-950/40 border-blue-500/30 text-blue-300'
        }`}>
          <span>{feedback.mensagem}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* KPI Cards */}
      {resumo && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 my-6">
          <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Trabalhadores</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-2 font-mono">
              {resumo.totalColaboradores}
            </div>
            <span className="text-[11px] text-slate-500 mt-1">Colaboradores ativos</span>
          </div>

          <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-4 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-medium">Folha Bruta Total</span>
            <div className="text-xl font-bold text-slate-200 mt-2 font-mono">
              {formatarMoeda(resumo.folhaBrutaTotal)}
            </div>
            <span className="text-[11px] text-slate-500 mt-1">Base INSS/FGTS apurada</span>
          </div>

          <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-4 flex flex-col justify-between border-l-4 border-l-indigo-500">
            <span className="text-xs text-slate-400 font-medium">INSS Segurados / Patronal</span>
            <div className="text-lg font-bold text-indigo-400 mt-2 font-mono">
              {formatarMoeda(resumo.inssTotalSegurados)}
            </div>
            <span className="text-[11px] text-slate-400 mt-1">
              Patronal (28.8%): {formatarMoeda(resumo.inssTotalPatronal)}
            </span>
          </div>

          <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-4 flex flex-col justify-between border-l-4 border-l-emerald-500">
            <span className="text-xs text-slate-400 font-medium">FGTS Mensal (8%)</span>
            <div className="text-xl font-bold text-emerald-400 mt-2 font-mono">
              {formatarMoeda(resumo.fgtsTotal)}
            </div>
            <span className="text-[11px] text-slate-500 mt-1">Guia FGTS Digital</span>
          </div>

          <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-4 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-medium">Status da Competência</span>
            <div className="mt-2">
              <span className={`px-2.5 py-1 rounded text-xs font-semibold font-mono ${
                resumo.statusGeral === 'TRANSMITIDO' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : resumo.statusGeral === 'PRONTO'
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {resumo.statusGeral}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1">
              {resumo.totalEventosS1200} S-1200 • {resumo.totalEventosS1210} S-1210
            </span>
          </div>
        </div>
      )}

      {/* Ações Rápidas de Lote */}
      <div className="flex flex-wrap items-center gap-3 mb-6 bg-[#181818] p-3 rounded-xl border border-[#2a2a2a]">
        <span className="text-xs text-slate-400 font-medium px-2">Ações Rápidas de Folha:</span>
        <button
          onClick={handleGerarLoteS1200}
          className="flex items-center gap-1.5 bg-[#222] hover:bg-[#2a2a2a] text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-[#333] transition"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Gerar Lote S-1200 (Remuneração)
        </button>

        <button
          onClick={handleGerarLoteS1210}
          className="flex items-center gap-1.5 bg-[#222] hover:bg-[#2a2a2a] text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-[#333] transition"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          Gerar Lote S-1210 (Pagamentos)
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#2a2a2a] mb-6">
        <button
          onClick={() => setActiveTab('EVENTOS')}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold border-b-2 transition ${
            activeTab === 'EVENTOS'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode className="w-4 h-4" />
          Painel de Eventos Gerados ({resumo?.eventos.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('MONITOR')}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold border-b-2 transition ${
            activeTab === 'MONITOR'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          Monitor de Recibos & Transmissão
        </button>

        <button
          onClick={() => setActiveTab('REGRAS')}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold border-b-2 transition ${
            activeTab === 'REGRAS'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Info className="w-4 h-4" />
          Validação MOS & Prazos Oficiais
        </button>
      </div>

      {/* TAB 1: EVENTOS */}
      {activeTab === 'EVENTOS' && (
        <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#202020] text-slate-400 uppercase tracking-wider font-semibold border-b border-[#2a2a2a]">
                <tr>
                  <th className="py-3 px-4">Evento</th>
                  <th className="py-3 px-4">Colaborador / CPF</th>
                  <th className="py-3 px-4 text-center">Matrícula</th>
                  <th className="py-3 px-4 text-right">Base INSS</th>
                  <th className="py-3 px-4 text-right">Base FGTS</th>
                  <th className="py-3 px-4 text-right">Valor Líquido</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Protocolo / Recibo</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {!resumo || resumo.eventos.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500">
                      Nenhum evento do eSocial gerado para a competência {competencia}. Utilize os botões acima para gerar os lotes S-1200 e S-1210.
                    </td>
                  </tr>
                ) : (
                  resumo.eventos.map(ev => (
                    <tr key={ev.id} className="hover:bg-[#202020]/50 transition">
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                          ev.tipoEvento === 'S-1200' 
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                            : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        }`}>
                          {ev.tipoEvento}
                        </span>
                        <div className="text-[11px] text-slate-400 mt-1">{ev.nomeEvento}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{ev.colaboradorNome}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{ev.colaboradorCpf}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-slate-300">
                        {ev.matricula || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                        {formatarMoeda(ev.bases.baseINSS)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                        {formatarMoeda(ev.bases.baseFGTS)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-emerald-400 font-bold">
                        {formatarMoeda(ev.bases.valorLiquido)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          ev.status === 'TRANSMITIDO'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {ev.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-[11px] text-slate-300">
                        {ev.numeroRecibo || <span className="text-slate-500 italic">Pendente Envio</span>}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleVisualizarXml(ev)}
                            title="Visualizar XML Estruturado"
                            className="p-1.5 bg-[#252525] hover:bg-[#303030] rounded text-slate-300 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDownloadXml(ev)}
                            title="Baixar XML"
                            className="p-1.5 bg-[#252525] hover:bg-[#303030] rounded text-slate-300 transition"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MONITOR DE RECIBOS */}
      {activeTab === 'MONITOR' && resumo && (
        <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-6 shadow-sm space-y-4 max-w-4xl">
          <h3 className="text-sm font-semibold text-white">Protocolos e Recibos do Ambiente Nacional eSocial</h3>
          <p className="text-xs text-slate-400">
            Rastreamento de transmissões oficiais com assinatura digital e carimbo de tempo da Receita Federal do Brasil / SERPRO.
          </p>

          <div className="space-y-3 pt-2">
            {resumo.eventos.filter(e => e.status === 'TRANSMITIDO').length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                Nenhum recibo de transmissão emitido ainda para a competência {competencia}.
              </div>
            ) : (
              resumo.eventos.filter(e => e.status === 'TRANSMITIDO').map(ev => (
                <div key={ev.id} className="bg-[#202020] border border-[#2a2a2a] rounded-lg p-3.5 flex items-center justify-between text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{ev.tipoEvento}</span>
                      <span className="text-slate-400">• {ev.colaboradorNome}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                        RECEPCIONADO COM SUCESSO
                      </span>
                    </div>
                    <div className="font-mono text-slate-400 text-[11px]">
                      Nº Recibo: <span className="text-slate-200">{ev.numeroRecibo}</span>
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-slate-500">
                    <div>Data Envio: {ev.dataTransmissao || ev.dataGeracao}</div>
                    <div className="text-emerald-400 font-semibold">Código Resposta: 201</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: REGRAS & PRAZOS */}
      {activeTab === 'REGRAS' && (
        <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-6 shadow-sm space-y-4 max-w-4xl text-xs">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-400" />
            Orientações Técnicas do Manual de Orientação do eSocial (MOS)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-[#202020] p-4 rounded-lg border border-[#2a2a2a] space-y-2">
              <h4 className="font-semibold text-amber-400">Evento S-1200 (Remuneração de Trabalhador)</h4>
              <p className="text-slate-300 leading-relaxed">
                Deve ser transmitido até o dia 15 do mês subsequente ao de competência da folha de pagamento (antecipando-se caso coincida com dia não útil).
              </p>
              <p className="text-slate-300 leading-relaxed">
                Contém a totalidade das rubricas de proventos e descontos que compõem a remuneração de cada empregado, avulso ou beneficiário de pró-labore.
              </p>
            </div>

            <div className="bg-[#202020] p-4 rounded-lg border border-[#2a2a2a] space-y-2">
              <h4 className="font-semibold text-indigo-400">Evento S-1210 (Pagamentos de Rendimentos)</h4>
              <p className="text-slate-300 leading-relaxed">
                Informa a quitação financeira efetiva das remunerações e apura as retenções do Imposto de Renda Retido na Fonte (IRRF Código 0561).
              </p>
              <p className="text-slate-300 leading-relaxed">
                Rege-se pelo <strong>Regime de Caixa</strong>, considerando a data real em que os valores foram creditados na conta bancária do trabalhador.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VISUALIZADOR DE XML COM SYNTAX HIGHLIGHT */}
      {showXmlModal && selectedEvento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#181818] border border-[#333] rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-[#2a2a2a] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-indigo-400" />
                  XML do Evento {selectedEvento.tipoEvento} - {selectedEvento.colaboradorNome}
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  Schema: http://www.esocial.gov.br/schema/evt/evtRemun/v_S_01_02_00
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopiarXml}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#252525] hover:bg-[#303030] text-slate-200 text-xs rounded-lg transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
                <button
                  onClick={() => handleDownloadXml(selectedEvento)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-lg transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download .xml
                </button>
                <button
                  onClick={() => setShowXmlModal(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto font-mono text-xs text-emerald-400 bg-[#121212] select-all leading-relaxed whitespace-pre">
              {selectedEvento.xmlContent}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE IMPRESSÃO A4 OFICIAL DO RECIBO */}
      {showPrintModal && empresa && resumo && (
        <ReportPrintPreviewModal
          isOpen={showPrintModal}
          onClose={() => setShowPrintModal(false)}
          empresa={empresa}
          tituloRelatorio="Recibo de Transmissão dos Eventos Periódicos do eSocial"
          subtitulo="Sistema Simplificado de Escrituração Digital das Obrigações Previdenciárias, Trabalhistas e Fiscais"
          periodo={competencia}
        >
          <div className="space-y-6 text-black font-sans text-xs">
            {/* Cabeçalho */}
            <div className="border border-black p-3 rounded space-y-1">
              <div className="flex justify-between font-bold text-sm">
                <span>GOVERNO FEDERAL • MINISTÉRIO DO TRABALHO E EMPREGO</span>
                <span>eSocial v_S_01_02_00</span>
              </div>
              <div className="flex justify-between">
                <span>Empregador: {empresa.razaoSocial}</span>
                <span>CNPJ: {empresa.cnpj}</span>
              </div>
              <div className="flex justify-between">
                <span>Competência de Apuração: {competencia}</span>
                <span>Total de Trabalhadores: {resumo.totalColaboradores}</span>
              </div>
            </div>

            {/* Quadro de Totalização Previdenciária e Trabalhista */}
            <div className="border border-black p-3 rounded">
              <div className="font-bold border-b border-black pb-1 mb-2">1. BASES E ENCARGOS PREVIDENCIÁRIOS / TRABALHISTAS APURADOS</div>
              <div className="grid grid-cols-4 gap-2 text-[11px]">
                <div>
                  <span className="font-semibold">Folha Bruta:</span>
                  <div>{formatarMoeda(resumo.folhaBrutaTotal)}</div>
                </div>
                <div>
                  <span className="font-semibold">INSS Segurados:</span>
                  <div>{formatarMoeda(resumo.inssTotalSegurados)}</div>
                </div>
                <div>
                  <span className="font-semibold">INSS Patronal (28.8%):</span>
                  <div>{formatarMoeda(resumo.inssTotalPatronal)}</div>
                </div>
                <div>
                  <span className="font-semibold">FGTS Mensal (8%):</span>
                  <div className="font-bold">{formatarMoeda(resumo.fgtsTotal)}</div>
                </div>
              </div>
            </div>

            {/* Relação de Eventos e Recibos */}
            <div>
              <div className="font-bold mb-2">2. PROTOCOLOS E RECIBOS DE TRANSMISSÃO POR TRABALHADOR</div>
              <table className="w-full border-collapse border border-black text-[10px]">
                <thead>
                  <tr className="bg-gray-100 border-b border-black">
                    <th className="border border-black p-1 text-center">Tipo</th>
                    <th className="border border-black p-1 text-left">Trabalhador</th>
                    <th className="border border-black p-1 text-center">CPF</th>
                    <th className="border border-black p-1 text-center">Matrícula</th>
                    <th className="border border-black p-1 text-right">Base INSS</th>
                    <th className="border border-black p-1 text-right">Líquido</th>
                    <th className="border border-black p-1 text-center">Número do Recibo eSocial</th>
                  </tr>
                </thead>
                <tbody>
                  {resumo.eventos.map(ev => (
                    <tr key={ev.id} className="border-b border-black">
                      <td className="border border-black p-1 text-center font-bold">{ev.tipoEvento}</td>
                      <td className="border border-black p-1">{ev.colaboradorNome}</td>
                      <td className="border border-black p-1 text-center font-mono">{ev.colaboradorCpf}</td>
                      <td className="border border-black p-1 text-center font-mono">{ev.matricula || '-'}</td>
                      <td className="border border-black p-1 text-right">{formatarMoeda(ev.bases.baseINSS)}</td>
                      <td className="border border-black p-1 text-right">{formatarMoeda(ev.bases.valorLiquido)}</td>
                      <td className="border border-black p-1 text-center font-mono text-[9px]">{ev.numeroRecibo || 'Pendente de Envio'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Assinatura */}
            <div className="pt-10 flex justify-between text-center text-xs">
              <div className="w-64 border-t border-black pt-1">
                <div>{empresa.razaoSocial}</div>
                <div className="text-[10px] text-gray-600">Empregador / Responsável Legal</div>
              </div>
              <div className="w-64 border-t border-black pt-1">
                <div>Departamento Pessoal / Contador</div>
                <div className="text-[10px] text-gray-600">Certificado Digital ICP-Brasil A1/A3</div>
              </div>
            </div>
          </div>
        </ReportPrintPreviewModal>
      )}
    </div>
  );
};
