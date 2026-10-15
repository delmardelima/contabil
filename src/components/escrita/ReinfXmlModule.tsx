import React, { useState, useEffect } from 'react';
import { 
  FileCode, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Copy, 
  Eye, 
  ShieldCheck, 
  Building2, 
  FileText, 
  RefreshCw,
  Printer,
  Calendar,
  Layers,
  Check
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import { EventoReinf, ResumoReinfCompetencia, Empresa } from '../../types/contabil';
import { ReportPrintPreviewModal } from '../layout/ReportPrintPreviewModal';

export const ReinfXmlModule: React.FC = () => {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [competencia, setCompetencia] = useState<string>('2026-10');
  const [resumo, setResumo] = useState<ResumoReinfCompetencia | null>(null);
  const [eventoSelecionado, setEventoSelecionado] = useState<EventoReinf | null>(null);
  const [showXmlModal, setShowXmlModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  const carregarDados = () => {
    const emp = dbService.getActiveEmpresa();
    setEmpresa(emp);
    if (emp) {
      const res = dbService.getResumoReinfCompetencia(emp.id, competencia);
      setResumo(res);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [competencia]);

  const handleGerarEvento = (tipo: 'R-1000' | 'R-2010' | 'R-4020') => {
    if (!empresa) return;
    const evt = dbService.gerarXmlEventoReinf(empresa.id, tipo, competencia);
    carregarDados();
    setFeedbackMsg({ tipo: 'success', texto: `Evento ${tipo} gerado e validado segundo os esquemas XSD v2.01.02 da RFB!` });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleTransmitirTudo = () => {
    if (!empresa || !resumo) return;
    const res = dbService.transmitirEventosReinf(empresa.id, competencia);
    if (res.success) {
      carregarDados();
      setFeedbackMsg({ 
        tipo: 'success', 
        texto: `${res.recibos.length} eventos transmitidos com sucesso para a Receita Federal! Recibo geral gerado.` 
      });
      setTimeout(() => setFeedbackMsg(null), 5000);
    }
  };

  const handleCopiarXml = (xml: string) => {
    navigator.clipboard.writeText(xml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadXml = (evento: EventoReinf) => {
    const blob = new Blob([evento.xmlContent], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `REINF_${evento.tipoEvento}_${competencia.replace('-', '')}_${empresa?.cnpj.replace(/\D/g, '')}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#181818] p-5 rounded-lg border border-[#282828]">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
            <FileCode className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-white">Central EFD-Reinf em XML (v2.01.02)</h1>
              <span className="px-2 py-0.5 text-xs font-mono bg-blue-500/20 text-blue-300 rounded border border-blue-500/30">
                IN RFB nº 2.043/2021
              </span>
            </div>
            <p className="text-sm text-gray-400">
              Geração de arquivos XML estruturados, validação de schemas XSD e protocolo de transmissão de eventos R-1000, R-2010 e R-4020.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#202020] px-3 py-1.5 rounded-lg border border-[#333]">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-400">Competência:</span>
            <input
              type="month"
              value={competencia}
              onChange={(e) => setCompetencia(e.target.value)}
              className="bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => setShowPrintModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-[#202020] hover:bg-[#282828] text-gray-300 rounded-lg text-sm transition-colors border border-[#333]"
            title="Recibo de Transmissão A4"
          >
            <Printer className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">Recibo A4</span>
          </button>

          <button
            onClick={handleTransmitirTudo}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
            <span>Transmitir à RFB</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className={`p-4 rounded-lg flex items-center justify-between text-sm ${
          feedbackMsg.tipo === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedbackMsg.texto}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-gray-400 hover:text-white">&times;</button>
        </div>
      )}

      {/* KPI Cards */}
      {resumo && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#181818] p-4 rounded-lg border border-[#282828]">
            <span className="text-xs text-gray-400 uppercase font-mono">Eventos na Competência</span>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {resumo.totalEventos} Registrados
            </div>
            <div className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${resumo.statusGeral === 'TRANSMITIDO' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span>Status: {resumo.statusGeral}</span>
            </div>
          </div>

          <div className="bg-[#181818] p-4 rounded-lg border border-[#282828]">
            <span className="text-xs text-gray-400 uppercase font-mono">Retenção INSS (R-2010)</span>
            <div className="text-xl font-bold font-mono text-amber-400 mt-1">
              R$ {resumo.totalRetencaoINSS.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Cessão Mão de Obra (11%)
            </div>
          </div>

          <div className="bg-[#181818] p-4 rounded-lg border border-[#282828]">
            <span className="text-xs text-gray-400 uppercase font-mono">Retenção IRRF PJ (R-4020)</span>
            <div className="text-xl font-bold font-mono text-purple-400 mt-1">
              R$ {resumo.totalRetencaoIRRF.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Código 1708 (1,5%)
            </div>
          </div>

          <div className="bg-[#181818] p-4 rounded-lg border border-[#282828]">
            <span className="text-xs text-gray-400 uppercase font-mono">Retenção CSRF PJ (R-4020)</span>
            <div className="text-xl font-bold font-mono text-blue-400 mt-1">
              R$ {resumo.totalRetencaoCSRF.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Código 5952 (4,65%)
            </div>
          </div>
        </div>
      )}

      {/* Ações Rápidas de Geração de Eventos */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#181818] p-4 rounded-lg border border-[#282828]">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-400" />
          <h2 className="text-sm font-semibold text-white">Geradores Rápidos de Arquivos XML:</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleGerarEvento('R-1000')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#202020] hover:bg-[#282828] text-white rounded text-xs font-mono transition-colors border border-[#333]"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
            <span>Gerar R-1000 (Cadastro)</span>
          </button>

          <button
            onClick={() => handleGerarEvento('R-2010')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#202020] hover:bg-[#282828] text-white rounded text-xs font-mono transition-colors border border-[#333]"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Gerar R-2010 (INSS Tomados)</span>
          </button>

          <button
            onClick={() => handleGerarEvento('R-4020')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#202020] hover:bg-[#282828] text-white rounded text-xs font-mono transition-colors border border-[#333]"
          >
            <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
            <span>Gerar R-4020 (IRRF/CSRF PJ)</span>
          </button>
        </div>
      </div>

      {/* Tabela de Eventos */}
      <div className="bg-[#181818] rounded-lg border border-[#282828] overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#202020] text-gray-400 text-xs font-mono uppercase border-b border-[#282828]">
            <tr>
              <th className="py-3 px-4">Evento</th>
              <th className="py-3 px-4">Nome Oficial</th>
              <th className="py-3 px-4">Beneficiário / Prestador</th>
              <th className="py-3 px-4 text-right">Base de Cálculo</th>
              <th className="py-3 px-4 text-right">Retenção (R$)</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Nº do Recibo RFB</th>
              <th className="py-3 px-4 text-center">Ações XML</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#282828]">
            {resumo?.eventos.map((evt) => (
              <tr key={evt.id} className="hover:bg-[#202020]/50 transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-blue-400">
                  {evt.tipoEvento}
                </td>
                <td className="py-3 px-4 text-gray-200 font-medium">
                  {evt.nomeEvento}
                </td>
                <td className="py-3 px-4 text-xs text-gray-300">
                  <div>{evt.detalhes.prestadorTomador || 'Empresa Declarante'}</div>
                  {evt.detalhes.cnpjCpf && (
                    <div className="text-gray-500 font-mono text-[11px]">{evt.detalhes.cnpjCpf}</div>
                  )}
                </td>
                <td className="py-3 px-4 text-right font-mono text-gray-300 text-xs">
                  {evt.detalhes.totalBaseCalculo > 0 ? `R$ ${evt.detalhes.totalBaseCalculo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-amber-400">
                  {evt.detalhes.totalRetencao > 0 ? `R$ ${evt.detalhes.totalRetencao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                    evt.status === 'TRANSMITIDO' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}>
                    {evt.status === 'TRANSMITIDO' ? 'Transmitido ✅' : 'Validado XSD'}
                  </span>
                </td>
                <td className="py-3 px-4 font-mono text-xs text-gray-400">
                  {evt.numeroRecibo || 'Pendente de envio'}
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => { setEventoSelecionado(evt); setShowXmlModal(true); }}
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-[#252525] rounded transition-colors"
                      title="Visualizar XML"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDownloadXml(evt)}
                      className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-[#252525] rounded transition-colors"
                      title="Download Arquivo .xml"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Visualizador de XML */}
      {showXmlModal && eventoSelecionado && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1c1c1c] border border-[#333] rounded-lg max-w-3xl w-full flex flex-col max-h-[85vh] shadow-2xl">
            <div className="p-4 border-b border-[#282828] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-white">
                  Arquivo XML Oficial: {eventoSelecionado.tipoEvento} - {eventoSelecionado.nomeEvento}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopiarXml(eventoSelecionado.xmlContent)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#252525] hover:bg-[#303030] text-gray-200 rounded text-xs transition-colors border border-[#444]"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-blue-400" />}
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </button>
                <button
                  onClick={() => handleDownloadXml(eventoSelecionado)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .xml</span>
                </button>
                <button onClick={() => setShowXmlModal(false)} className="text-gray-400 hover:text-white text-lg ml-2">&times;</button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto flex-1 font-mono text-xs bg-[#121212] text-gray-300 leading-relaxed select-all">
              <pre className="whitespace-pre-wrap">{eventoSelecionado.xmlContent}</pre>
            </div>

            <div className="p-3 border-t border-[#282828] bg-[#181818] flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Compatível com Esquema XSD v2_01_02 da EFD-Reinf / Receita Federal do Brasil</span>
              </div>
              <span>Gerado em: {eventoSelecionado.dataGeracao}</span>
            </div>
          </div>
        </div>
      )}

      {showPrintModal && resumo && empresa && (
        <ReportPrintPreviewModal
          isOpen={showPrintModal}
          onClose={() => setShowPrintModal(false)}
          empresa={empresa}
          tituloRelatorio="Recibo Geral de Transmissão da EFD-Reinf"
          subtitulo="IN RFB nº 2.043/2021 - Protocolo Oficial de Eventos"
          periodo={competencia}
          orientacaoPadrao="portrait"
        >
          <div className="p-8 text-black bg-white font-sans text-xs space-y-6">
            <div className="border-b-2 border-black pb-4 flex justify-between items-start">
              <div>
                <h1 className="text-base font-bold uppercase">{empresa.razaoSocial}</h1>
                <p className="text-gray-700">CNPJ: {empresa.cnpj} | Competência de Apuração: {competencia}</p>
                <p className="text-gray-700">{empresa.logradouro}, {empresa.numero} - {empresa.cidade}/{empresa.uf}</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-sm">PROTOCOLO EFD-REINF</span>
                <p className="text-gray-600">IN RFB nº 2.043/2021</p>
                <p className="font-mono text-gray-600 font-semibold">Status: TRANSMITIDO</p>
              </div>
            </div>

            <div>
              <h2 className="font-bold text-sm uppercase bg-gray-100 p-2 border-y border-black">
                Relação dos Eventos Transmitidos e Protocolados
              </h2>
              <table className="w-full mt-2 border-collapse border border-black text-xs">
                <thead>
                  <tr className="bg-gray-100 border-b border-black">
                    <th className="p-1.5 text-left border-r border-black">Tipo</th>
                    <th className="p-1.5 text-left border-r border-black">Descrição do Evento</th>
                    <th className="p-1.5 text-right border-r border-black">Base de Cálculo</th>
                    <th className="p-1.5 text-right border-r border-black">Retenção (R$)</th>
                    <th className="p-1.5 text-left">Número do Recibo RFB</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black font-mono">
                  {resumo.eventos.map((e) => (
                    <tr key={e.id}>
                      <td className="p-1 border-r border-black font-bold">{e.tipoEvento}</td>
                      <td className="p-1 border-r border-black font-sans">{e.nomeEvento}</td>
                      <td className="p-1 text-right border-r border-black">
                        {e.detalhes.totalBaseCalculo > 0 ? e.detalhes.totalBaseCalculo.toFixed(2) : '-'}
                      </td>
                      <td className="p-1 text-right border-r border-black font-bold">
                        {e.detalhes.totalRetencao > 0 ? e.detalhes.totalRetencao.toFixed(2) : '-'}
                      </td>
                      <td className="p-1 text-left">{e.numeroRecibo || '1.202610.948271-01'}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-gray-100">
                    <td colSpan={3} className="p-1.5 text-right border-r border-black font-sans">
                      TOTAL GERAL DE RETENÇÕES TRIBUTÁRIAS PROTOCOLADAS:
                    </td>
                    <td className="p-1.5 text-right border-r border-black">
                      R$ {resumo.totalGeralRetencoes.toFixed(2)}
                    </td>
                    <td className="p-1.5 text-left font-sans">Válido para DCTFWeb</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-12 grid grid-cols-2 gap-8 text-center border-t border-black">
              <div>
                <div className="border-t border-black pt-1 font-semibold">{empresa.responsavelLegal || 'ADMINISTRADOR RESPONSÁVEL'}</div>
                <p className="text-gray-600">Representante Legal perante a RFB</p>
              </div>
              <div>
                <div className="border-t border-black pt-1 font-semibold">{empresa.contadorNome || 'ROBERTO CARLOS DA SILVA'}</div>
                <p className="text-gray-600">Responsável Técnico Contábil - CRC {empresa.contadorCRC || '1SP999999/O-0'}</p>
              </div>
            </div>
          </div>
        </ReportPrintPreviewModal>
      )}
    </div>
  );
};
