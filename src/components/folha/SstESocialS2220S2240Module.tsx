import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  FileCheck2,
  Stethoscope,
  HardHat,
  Activity,
  UserCheck,
  Send,
  Printer,
  Search,
  Eye,
  FileCode,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building2,
  Award,
  Layers,
  Sparkles,
  ClipboardList
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  EventoAsoS2220,
  EventoCondicaoAmbientalS2240,
  ResumoSstESocial,
  TipoExameOcupacionalS2220,
  ResultadoAso
} from '../../types/contabil';

interface SstModuleProps {
  empresaId?: number;
}

export const SstESocialS2220S2240Module: React.FC<SstModuleProps> = ({ empresaId = 1 }) => {
  const [competencia, setCompetencia] = useState<string>('2026-03');
  const [activeTab, setActiveTab] = useState<'ASO' | 'S2240' | 'PPP_PREVIEW' | 'ASO_PREVIEW' | 'XML_PREVIEW'>('ASO');
  const [resumo, setResumo] = useState<ResumoSstESocial | null>(null);
  const [selectedAso, setSelectedAso] = useState<EventoAsoS2220 | null>(null);
  const [selectedCondicao, setSelectedCondicao] = useState<EventoCondicaoAmbientalS2240 | null>(null);
  const [xmlVisualizacao, setXmlVisualizacao] = useState<string>('');
  const [xmlTitulo, setXmlTitulo] = useState<string>('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ tipo: 'sucesso' | 'info'; texto: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const carregarDados = () => {
    const dados = dbService.getSstESocial(empresaId, competencia);
    setResumo(dados);
    if (dados.asos.length > 0 && !selectedAso) {
      setSelectedAso(dados.asos[0]);
    }
    if (dados.condicoesAmbientais.length > 0 && !selectedCondicao) {
      setSelectedCondicao(dados.condicoesAmbientais[0]);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [empresaId, competencia]);

  const handleGerarXmlAso = (asoId: string) => {
    const res = dbService.gerarXmlS2220(asoId);
    if (res.sucesso) {
      setXmlVisualizacao(res.xml);
      setXmlTitulo(`eSocial S-2220 - Monitoramento da Saúde (ID: ${asoId})`);
      setActiveTab('XML_PREVIEW');
      setFeedbackMsg({ tipo: 'sucesso', texto: res.mensagem });
      carregarDados();
    }
  };

  const handleGerarXmlCondicao = (condicaoId: string) => {
    const res = dbService.gerarXmlS2240(condicaoId);
    if (res.sucesso) {
      setXmlVisualizacao(res.xml);
      setXmlTitulo(`eSocial S-2240 - Condições Ambientais e Riscos (ID: ${condicaoId})`);
      setActiveTab('XML_PREVIEW');
      setFeedbackMsg({ tipo: 'sucesso', texto: res.mensagem });
      carregarDados();
    }
  };

  const formatTipoExame = (tipo: TipoExameOcupacionalS2220) => {
    switch (tipo) {
      case '0_ADMISSIONAL': return 'Admissional';
      case '1_PERIODICO': return 'Periódico';
      case '2_RETORNO_TRABALHO': return 'Retorno ao Trabalho';
      case '3_MUDANCA_RISCO': return 'Mudança de Risco / Função';
      case '4_MONITORACAO_PONTUAL': return 'Monitoração Pontual';
      case '9_DEMISSIONAL': return 'Demissional';
      default: return tipo;
    }
  };

  const formatResultadoAso = (res: ResultadoAso) => {
    switch (res) {
      case '1_APTO': return <span className="text-emerald-400 font-semibold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Apto</span>;
      case '2_INAPTO': return <span className="text-rose-400 font-semibold flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Inapto</span>;
      case '3_APTO_COM_RESTRICAO': return <span className="text-amber-400 font-semibold flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Apto c/ Restrições</span>;
      default: return res;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#121212] text-gray-200 p-4 space-y-4 overflow-y-auto">
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#262626] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-600/20 text-rose-400 rounded border border-rose-500/30">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                eSocial S-2220 & S-2240 • Saúde e Segurança do Trabalho (SST)
                <span className="text-xs bg-rose-950 text-rose-300 px-2 py-0.5 rounded border border-rose-800 font-mono">
                  MOS S-1.3
                </span>
              </h1>
              <p className="text-xs text-gray-400">
                Portaria MTP/RFB nº 02/2021 • NR-07 (PCMSO) • NR-09 / NR-15 • IN INSS nº 128/2022 (PPP Eletrônico) • Domínio foss01.pbd
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-[#1a1a1a] border border-[#333] px-3 py-1.5 rounded text-xs">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-400">Comp:</span>
            <input
              type="month"
              value={competencia}
              onChange={(e) => setCompetencia(e.target.value)}
              className="bg-transparent border-none text-white focus:outline-none font-mono text-xs cursor-pointer"
            />
          </div>

          <button
            onClick={() => setActiveTab('PPP_PREVIEW')}
            className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors border ${
              activeTab === 'PPP_PREVIEW'
                ? 'bg-rose-700 text-white border-rose-600'
                : 'bg-[#1e1e1e] hover:bg-[#252525] text-gray-300 border-[#333]'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            Laudo PPP Eletrônico (A4)
          </button>

          <button
            onClick={() => setActiveTab('ASO_PREVIEW')}
            className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors border ${
              activeTab === 'ASO_PREVIEW'
                ? 'bg-rose-700 text-white border-rose-600'
                : 'bg-[#1e1e1e] hover:bg-[#252525] text-gray-300 border-[#333]'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            Espelho ASO (A4)
          </button>
        </div>
      </div>

      {/* FEEDBACK BANNER */}
      {feedbackMsg && (
        <div className="flex items-center justify-between bg-emerald-950/60 border border-emerald-700/50 text-emerald-200 px-4 py-2.5 rounded text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedbackMsg.texto}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-gray-400 hover:text-white font-mono text-xs ml-4">
            ×
          </button>
        </div>
      )}

      {/* CARDS DE RESUMO OPERACIONAL */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-[#181818] border border-[#262626] p-3 rounded flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-400 uppercase font-semibold">ASOs Registrados (S-2220)</div>
            <div className="text-xl font-bold text-white mt-0.5">{resumo?.totalAsosRegistrados || 0}</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">100% Homologados PCMSO</div>
          </div>
          <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-lg border border-rose-500/20">
            <Stethoscope className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#181818] border border-[#262626] p-3 rounded flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-400 uppercase font-semibold">Laudos de Risco (S-2240)</div>
            <div className="text-xl font-bold text-white mt-0.5">{resumo?.totalLaudosAmbientais || 0}</div>
            <div className="text-[10px] text-sky-400 mt-0.5">Condições Físicas & Químicas</div>
          </div>
          <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-lg border border-sky-500/20">
            <HardHat className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#181818] border border-[#262626] p-3 rounded flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-400 uppercase font-semibold">Aposentadoria Especial (GFIP)</div>
            <div className="text-xl font-bold text-amber-400 mt-0.5">{resumo?.totalExpostosRiscoEspecial || 0}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">Códigos GFIP 02, 03 ou 04</div>
          </div>
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#181818] border border-[#262626] p-3 rounded flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-400 uppercase font-semibold">Não Nocivo / Sem Riscos</div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">{resumo?.totalSemRisco || 0}</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">Cód. Tabela 24: 05.01.001</div>
          </div>
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* BARRA DE NAVEGAÇÃO DE ABAS */}
      <div className="flex border-b border-[#262626] gap-2">
        <button
          onClick={() => setActiveTab('ASO')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'ASO'
              ? 'border-rose-500 text-rose-400 bg-rose-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5" />
          Eventos S-2220 (Monitoramento da Saúde)
        </button>

        <button
          onClick={() => setActiveTab('S2240')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'S2240'
              ? 'border-rose-500 text-rose-400 bg-rose-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <HardHat className="w-3.5 h-3.5" />
          Eventos S-2240 (Condições Ambientais & PPP)
        </button>

        <button
          onClick={() => setActiveTab('PPP_PREVIEW')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'PPP_PREVIEW'
              ? 'border-rose-500 text-rose-400 bg-rose-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Printer className="w-3.5 h-3.5" />
          PPP Oficial Eletrônico (IN 128/22)
        </button>

        <button
          onClick={() => setActiveTab('ASO_PREVIEW')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'ASO_PREVIEW'
              ? 'border-rose-500 text-rose-400 bg-rose-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          Espelho ASO Timbrado (2 Vias)
        </button>

        {xmlVisualizacao && (
          <button
            onClick={() => setActiveTab('XML_PREVIEW')}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'XML_PREVIEW'
                ? 'border-rose-500 text-rose-400 bg-rose-500/10'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            XML Oficial eSocial
          </button>
        )}
      </div>

      {/* TAB 1: S-2220 ASO */}
      {activeTab === 'ASO' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar por colaborador, CPF ou cargo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#181818] border border-[#2e2e2e] rounded pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>
            <div className="text-xs text-gray-400 font-mono">
              Total listado: {resumo?.asos.length || 0} ASOs
            </div>
          </div>

          <div className="bg-[#181818] border border-[#282828] rounded overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1f1f1f] border-b border-[#2d2d2d] text-gray-400 font-medium">
                <tr>
                  <th className="py-2.5 px-3">Colaborador / CPF</th>
                  <th className="py-2.5 px-3">Matrícula & Cargo</th>
                  <th className="py-2.5 px-3">Tipo do Exame</th>
                  <th className="py-2.5 px-3">Data ASO</th>
                  <th className="py-2.5 px-3">Resultado</th>
                  <th className="py-2.5 px-3">Médico Examinador</th>
                  <th className="py-2.5 px-3">Recibo eSocial</th>
                  <th className="py-2.5 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#242424]">
                {resumo?.asos
                  .filter(a =>
                    a.trabalhadorNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    a.trabalhadorCpf.includes(searchTerm) ||
                    a.cargoDescricao.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(aso => (
                    <tr
                      key={aso.id}
                      onClick={() => setSelectedAso(aso)}
                      className={`hover:bg-[#202020] transition-colors cursor-pointer ${
                        selectedAso?.id === aso.id ? 'bg-[#222222] border-l-2 border-rose-500' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-white">{aso.trabalhadorNome}</div>
                        <div className="text-[10px] text-gray-400 font-mono">{aso.trabalhadorCpf}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="text-gray-300">{aso.cargoDescricao}</div>
                        <div className="text-[10px] text-gray-400 font-mono">Matrícula: {aso.matricula}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="bg-neutral-800 text-gray-300 px-2 py-0.5 rounded text-[11px] font-medium border border-[#333]">
                          {formatTipoExame(aso.tipoExame)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-gray-300">{aso.dataAso}</td>
                      <td className="py-2.5 px-3">{formatResultadoAso(aso.resultadoAso)}</td>
                      <td className="py-2.5 px-3">
                        <div className="text-gray-200">{aso.medicoExaminador.nome}</div>
                        <div className="text-[10px] text-gray-400 font-mono">CRM/{aso.medicoExaminador.ufCrm} {aso.medicoExaminador.crm}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-emerald-400">
                        {aso.numeroReciboESocial || 'Pendente'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleGerarXmlAso(aso.id)}
                            title="Gerar XML do Evento S-2220"
                            className="p-1.5 bg-[#252525] hover:bg-rose-900/40 text-rose-300 rounded border border-[#3a3a3a]"
                          >
                            <FileCode className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => { setSelectedAso(aso); setActiveTab('ASO_PREVIEW'); }}
                            title="Imprimir ASO A4"
                            className="p-1.5 bg-[#252525] hover:bg-[#333] text-gray-300 rounded border border-[#3a3a3a]"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* DETALHE DOS EXAMES DO ASO SELECIONADO */}
          {selectedAso && (
            <div className="bg-[#181818] border border-[#282828] p-4 rounded space-y-3">
              <div className="flex items-center justify-between border-b border-[#262626] pb-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-rose-400" />
                  <span className="font-semibold text-white text-xs">
                    Exames Complementares Realizados • {selectedAso.trabalhadorNome}
                  </span>
                </div>
                <div className="text-[11px] text-gray-400">
                  Médico Coordenador PCMSO: <span className="text-gray-200 font-medium">{selectedAso.medicoCoordenadorPcmso.nome}</span> (CRM/{selectedAso.medicoCoordenadorPcmso.ufCrm} {selectedAso.medicoCoordenadorPcmso.crm})
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {selectedAso.examesComplementares.map((ex, idx) => (
                  <div key={idx} className="bg-[#141414] border border-[#242424] p-3 rounded text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-rose-400 font-semibold">Cód. {ex.codigoProcedimento}</span>
                      <span className="bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded text-[10px] border border-emerald-800">
                        {ex.resultado.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-white font-medium text-[11px]">{ex.descricaoProcedimento}</div>
                    <div className="text-[10px] text-gray-400 flex items-center justify-between pt-1 border-t border-[#1f1f1f]">
                      <span>Data: {ex.dataExame}</span>
                      <span>Ordem: {ex.ordemExame.replace('_', ' ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: S-2240 CONDIÇÕES AMBIENTAIS */}
      {activeTab === 'S2240' && (
        <div className="space-y-4">
          <div className="bg-[#181818] border border-[#282828] rounded overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1f1f1f] border-b border-[#2d2d2d] text-gray-400 font-medium">
                <tr>
                  <th className="py-2.5 px-3">Trabalhador / Função</th>
                  <th className="py-2.5 px-3">Setor & CBO</th>
                  <th className="py-2.5 px-3">Início Condição</th>
                  <th className="py-2.5 px-3">Agentes Nocivos (Tab. 24)</th>
                  <th className="py-2.5 px-3">Ocorrência GFIP</th>
                  <th className="py-2.5 px-3">Responsável Técnico</th>
                  <th className="py-2.5 px-3">Recibo eSocial</th>
                  <th className="py-2.5 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#242424]">
                {resumo?.condicoesAmbientais.map(cond => (
                  <tr
                    key={cond.id}
                    onClick={() => setSelectedCondicao(cond)}
                    className={`hover:bg-[#202020] transition-colors cursor-pointer ${
                      selectedCondicao?.id === cond.id ? 'bg-[#222222] border-l-2 border-rose-500' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-white">{cond.trabalhadorNome}</div>
                      <div className="text-[10px] text-gray-400">{cond.cargoDescricao}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="text-gray-300">{cond.setorLotacao}</div>
                      <div className="text-[10px] text-gray-400 font-mono">CBO: {cond.cbo}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-gray-300">{cond.dataInicioCondicao}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex flex-wrap gap-1">
                        {cond.agentesNocivos.map(ag => (
                          <span
                            key={ag.id}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                              ag.tipoAgente === 'AUSENCIA_RISCO'
                                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                                : 'bg-rose-950/60 text-rose-300 border-rose-800'
                            }`}
                          >
                            {ag.codigoAgente} ({ag.tipoAgente})
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      {cond.codigoOcorrenciaGfip ? (
                        <span className="bg-amber-950 text-amber-300 px-2 py-0.5 rounded text-[10px] font-mono border border-amber-800">
                          GFIP {cond.codigoOcorrenciaGfip} (25 anos)
                        </span>
                      ) : (
                        <span className="text-gray-500 text-[11px]">- (Não especial)</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="text-gray-200">{cond.responsavelRegistros.nome}</div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        {cond.responsavelRegistros.tipoRegistro}/{cond.responsavelRegistros.ufRegistro} {cond.responsavelRegistros.registroProfissional}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-emerald-400">
                      {cond.numeroReciboESocial || 'Pendente'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleGerarXmlCondicao(cond.id)}
                          title="Gerar XML do Evento S-2240"
                          className="p-1.5 bg-[#252525] hover:bg-rose-900/40 text-rose-300 rounded border border-[#3a3a3a]"
                        >
                          <FileCode className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { setSelectedCondicao(cond); setActiveTab('PPP_PREVIEW'); }}
                          title="Visualizar PPP"
                          className="p-1.5 bg-[#252525] hover:bg-[#333] text-gray-300 rounded border border-[#3a3a3a]"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* DETALHE DOS AGENTES NOCIVOS E EPI/EPC */}
          {selectedCondicao && (
            <div className="bg-[#181818] border border-[#282828] p-4 rounded space-y-3">
              <div className="flex items-center justify-between border-b border-[#262626] pb-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-sky-400" />
                  <span className="font-semibold text-white text-xs">
                    Mapeamento de Agentes Ambientais & Medidas de Proteção (EPI/EPC) • {selectedCondicao.trabalhadorNome}
                  </span>
                </div>
                <div className="text-[11px] text-gray-400">
                  Ambiente: <span className="text-gray-200">{selectedCondicao.descricaoAmbienteTrabalho}</span>
                </div>
              </div>

              <div className="space-y-2">
                {selectedCondicao.agentesNocivos.map(ag => (
                  <div key={ag.id} className="bg-[#141414] border border-[#242424] p-3 rounded text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-white flex items-center gap-2">
                        <span className="font-mono text-sky-400">{ag.codigoAgente}</span>
                        <span>{ag.descricaoAgente}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px]">
                        {ag.intensidadeConcentracao && (
                          <span className="font-mono text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800">
                            Medição: {ag.intensidadeConcentracao} {ag.unidadeMedida} (Tol: {ag.limiteTolerancia} {ag.unidadeMedida})
                          </span>
                        )}
                        <span className="text-gray-400 font-mono text-[10px]">{ag.tecnicaMedicao}</span>
                      </div>
                    </div>

                    {ag.epis.length > 0 && (
                      <div className="pt-2 border-t border-[#1f1f1f] flex flex-wrap gap-3">
                        {ag.epis.map((epi, idx) => (
                          <div key={idx} className="bg-[#1a1a1a] border border-[#2b2b2b] px-2.5 py-1.5 rounded flex items-center gap-2 text-[11px]">
                            <HardHat className="w-3.5 h-3.5 text-gray-400" />
                            <div>
                              <span className="font-semibold text-emerald-400 font-mono">CA {epi.caEpi}</span> • {epi.descricao}
                              <span className="text-gray-500 text-[10px] ml-2">({epi.periodicidadeTroca} - Eficaz: {epi.eficaz ? 'Sim' : 'Não'})</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PPP ELETRÔNICO PREVIEW A4 */}
      {activeTab === 'PPP_PREVIEW' && selectedCondicao && (
        <div className="space-y-3">
          <div className="flex justify-end gap-2">
            <button
              onClick={() => window.print()}
              className="bg-rose-700 hover:bg-rose-600 text-white px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir PPP Oficial (A4)
            </button>
          </div>

          <div className="bg-white text-gray-900 p-8 rounded shadow-xl font-serif max-w-4xl mx-auto border border-gray-300 text-[11px] leading-relaxed">
            {/* CABEÇALHO DO LAUDO DO PPP */}
            <div className="border-b-2 border-black pb-3 mb-4 text-center">
              <div className="font-bold text-sm tracking-wide">REPÚBLICA FEDERATIVA DO BRASIL</div>
              <div className="font-semibold text-xs">MINISTÉRIO DO TRABALHO E PREVIDÊNCIA • INSTITUTO NACIONAL DO SEGURO SOCIAL</div>
              <div className="font-bold text-base mt-1 uppercase underline">
                PERFIL PROFISSIOGRÁFICO PREVIDENCIÁRIO - PPP ELETRÔNICO
              </div>
              <div className="text-[10px] text-gray-600 italic">
                Emitido nos termos do Art. 58 da Lei nº 8.213/1991 e da Instrução Normativa INSS nº 128/2022
              </div>
            </div>

            {/* SEÇÃO I: DADOS ADMINISTRATIVOS */}
            <div className="mb-4">
              <div className="bg-gray-200 font-bold px-2 py-1 uppercase text-[11px] border border-gray-400">
                Seção I • Dados Administrativos do Trabalhador e da Empresa
              </div>
              <table className="w-full border-collapse border border-gray-400 mt-1 text-[10px]">
                <tbody>
                  <tr>
                    <td className="border border-gray-400 p-1 font-bold w-1/4">1. CNPJ Empregador:</td>
                    <td className="border border-gray-400 p-1 w-1/4 font-mono">12.345.678/0001-95</td>
                    <td className="border border-gray-400 p-1 font-bold w-1/4">2. Nome Empresarial:</td>
                    <td className="border border-gray-400 p-1 w-1/4 font-bold">EMPRESA INDUSTRIAL DE BEBIDAS MINAS S.A.</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-1 font-bold">3. CNAE:</td>
                    <td className="border border-gray-400 p-1 font-mono">1101-4/01 (Fabricação de Aguardente)</td>
                    <td className="border border-gray-400 p-1 font-bold">4. Nome do Trabalhador:</td>
                    <td className="border border-gray-400 p-1 font-bold">{selectedCondicao.trabalhadorNome}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-1 font-bold">5. CPF:</td>
                    <td className="border border-gray-400 p-1 font-mono">{selectedCondicao.trabalhadorCpf}</td>
                    <td className="border border-gray-400 p-1 font-bold">6. Matrícula eSocial:</td>
                    <td className="border border-gray-400 p-1 font-mono">{selectedCondicao.matricula}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-1 font-bold">7. Cargo / Função:</td>
                    <td className="border border-gray-400 p-1 font-bold">{selectedCondicao.cargoDescricao}</td>
                    <td className="border border-gray-400 p-1 font-bold">8. CBO:</td>
                    <td className="border border-gray-400 p-1 font-mono">{selectedCondicao.cbo}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-1 font-bold">9. Período de Atividade:</td>
                    <td className="border border-gray-400 p-1 font-mono">{selectedCondicao.dataInicioCondicao} até o momento</td>
                    <td className="border border-gray-400 p-1 font-bold">10. Código GFIP Aposent. Esp.:</td>
                    <td className="border border-gray-400 p-1 font-mono font-bold text-rose-700">
                      {selectedCondicao.codigoOcorrenciaGfip ? `04 (Aposentadoria Especial 25 anos)` : 'Ausente (Não especial)'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SEÇÃO II: REGISTROS AMBIENTAIS */}
            <div className="mb-4">
              <div className="bg-gray-200 font-bold px-2 py-1 uppercase text-[11px] border border-gray-400">
                Seção II • Registros Ambientais e Fatores de Risco Ocupacional
              </div>
              <div className="p-1 border border-t-0 border-gray-400 text-[10px]">
                <div className="mb-1"><span className="font-bold">Setor:</span> {selectedCondicao.setorLotacao}</div>
                <div className="mb-1"><span className="font-bold">Descrição das Atividades:</span> {selectedCondicao.descricaoAtividadesExecutadas}</div>
              </div>

              <table className="w-full border-collapse border border-gray-400 mt-1 text-[10px]">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-400 p-1">Código (Tab. 24)</th>
                    <th className="border border-gray-400 p-1">Tipo</th>
                    <th className="border border-gray-400 p-1">Fator de Risco / Descrição</th>
                    <th className="border border-gray-400 p-1">Intensidade / Concentração</th>
                    <th className="border border-gray-400 p-1">Técnica Utilizada</th>
                    <th className="border border-gray-400 p-1">EPC / EPI Eficaz</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCondicao.agentesNocivos.map((ag, idx) => (
                    <tr key={idx}>
                      <td className="border border-gray-400 p-1 font-mono font-bold">{ag.codigoAgente}</td>
                      <td className="border border-gray-400 p-1">{ag.tipoAgente}</td>
                      <td className="border border-gray-400 p-1 font-semibold">{ag.descricaoAgente}</td>
                      <td className="border border-gray-400 p-1 font-mono">
                        {ag.intensidadeConcentracao ? `${ag.intensidadeConcentracao} ${ag.unidadeMedida}` : 'Qualitativo'}
                      </td>
                      <td className="border border-gray-400 p-1 text-[9px]">{ag.tecnicaMedicao}</td>
                      <td className="border border-gray-400 p-1 font-mono">
                        {ag.epis.length > 0 ? `Sim (CA ${ag.epis.map(e => e.caEpi).join(', ')})` : (ag.tipoAgente === 'AUSENCIA_RISCO' ? 'N/A' : 'Não')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* SEÇÃO III: MONITORAÇÃO BIOLÓGICA */}
            <div className="mb-4">
              <div className="bg-gray-200 font-bold px-2 py-1 uppercase text-[11px] border border-gray-400">
                Seção III • Resultados de Monitoração Biológica (NR-07)
              </div>
              <table className="w-full border-collapse border border-gray-400 mt-1 text-[10px]">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-400 p-1">Data Exame</th>
                    <th className="border border-gray-400 p-1">Tipo de Exame Ocupacional</th>
                    <th className="border border-gray-400 p-1">Natureza do Procedimento</th>
                    <th className="border border-gray-400 p-1">Resultado</th>
                    <th className="border border-gray-400 p-1">Médico Examinador</th>
                  </tr>
                </thead>
                <tbody>
                  {resumo?.asos
                    .filter(a => a.trabalhadorCpf === selectedCondicao.trabalhadorCpf)
                    .map(aso => (
                      <React.Fragment key={aso.id}>
                        {aso.examesComplementares.map((ex, exIdx) => (
                          <tr key={exIdx}>
                            <td className="border border-gray-400 p-1 font-mono">{ex.dataExame}</td>
                            <td className="border border-gray-400 p-1">{formatTipoExame(aso.tipoExame)}</td>
                            <td className="border border-gray-400 p-1">{ex.descricaoProcedimento}</td>
                            <td className="border border-gray-400 p-1 font-semibold text-emerald-800">{ex.resultado.replace('_', ' ')}</td>
                            <td className="border border-gray-400 p-1">{aso.medicoExaminador.nome} (CRM/{aso.medicoExaminador.ufCrm} {aso.medicoExaminador.crm})</td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                </tbody>
              </table>
            </div>

            {/* SEÇÃO IV: RESPONSÁVEIS TÉCNICOS E ASSINATURA */}
            <div>
              <div className="bg-gray-200 font-bold px-2 py-1 uppercase text-[11px] border border-gray-400">
                Seção IV • Responsáveis pelas Informações
              </div>
              <div className="border border-gray-400 border-t-0 p-3 grid grid-cols-2 gap-4 text-[10px]">
                <div>
                  <div className="font-bold">Responsável pelos Registros Ambientais:</div>
                  <div>Nome: {selectedCondicao.responsavelRegistros.nome}</div>
                  <div className="font-mono">Registro: {selectedCondicao.responsavelRegistros.tipoRegistro}/{selectedCondicao.responsavelRegistros.ufRegistro} {selectedCondicao.responsavelRegistros.registroProfissional}</div>
                  <div className="font-mono">CPF: {selectedCondicao.responsavelRegistros.cpf}</div>
                </div>
                <div>
                  <div className="font-bold">Representante Legal da Empresa:</div>
                  <div>Nome: Dr. Roberto Guimarães Alves</div>
                  <div>Diretor de Recursos Humanos e Controladoria</div>
                  <div className="font-mono mt-1 text-[9px] text-gray-500">
                    Chave eSocial S-2240: {selectedCondicao.numeroReciboESocial}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-around text-center text-[10px]">
                <div className="w-2/5 border-t border-black pt-1">
                  Assinatura do Responsável Técnico
                </div>
                <div className="w-2/5 border-t border-black pt-1">
                  Assinatura do Representante Legal
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ASO PREVIEW A4 TIMBRADO */}
      {activeTab === 'ASO_PREVIEW' && selectedAso && (
        <div className="space-y-3">
          <div className="flex justify-end gap-2">
            <button
              onClick={() => window.print()}
              className="bg-rose-700 hover:bg-rose-600 text-white px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir ASO Oficial (2 Vias)
            </button>
          </div>

          <div className="bg-white text-gray-900 p-8 rounded shadow-xl font-sans max-w-4xl mx-auto border border-gray-300 text-[11px]">
            <div className="border-b-2 border-rose-800 pb-3 mb-4 flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-rose-900">EMPRESA INDUSTRIAL DE BEBIDAS MINAS S.A.</div>
                <div className="text-[10px] text-gray-600 font-mono">CNPJ: 12.345.678/0001-95 • PCMSO NR-07</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-base uppercase text-gray-800">ATESTADO DE SAÚDE OCUPACIONAL - ASO</div>
                <div className="text-[10px] text-rose-700 font-bold uppercase">Via da Empresa & Via do Colaborador</div>
              </div>
            </div>

            <div className="bg-gray-100 p-2 border border-gray-300 rounded mb-3 grid grid-cols-2 gap-2 text-[10px]">
              <div><span className="font-bold">Colaborador:</span> {selectedAso.trabalhadorNome}</div>
              <div><span className="font-bold">CPF:</span> <span className="font-mono">{selectedAso.trabalhadorCpf}</span></div>
              <div><span className="font-bold">Função / Cargo:</span> {selectedAso.cargoDescricao}</div>
              <div><span className="font-bold">Matrícula:</span> <span className="font-mono">{selectedAso.matricula}</span></div>
              <div><span className="font-bold">Tipo de Exame:</span> <span className="font-bold text-rose-800">{formatTipoExame(selectedAso.tipoExame)}</span></div>
              <div><span className="font-bold">Data de Emissão do ASO:</span> <span className="font-mono">{selectedAso.dataAso}</span></div>
            </div>

            <div className="mb-4">
              <div className="font-bold uppercase text-[10px] text-gray-700 mb-1 border-b border-gray-300 pb-1">
                Exames Clínicos e Complementares Realizados
              </div>
              <table className="w-full text-left text-[10px] border border-gray-300">
                <thead className="bg-gray-50 border-b border-gray-300">
                  <tr>
                    <th className="p-1">Cód. Proc.</th>
                    <th className="p-1">Descrição do Procedimento Ocupacional</th>
                    <th className="p-1">Data</th>
                    <th className="p-1">Ordem</th>
                    <th className="p-1">Resultado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {selectedAso.examesComplementares.map((ex, idx) => (
                    <tr key={idx}>
                      <td className="p-1 font-mono font-bold">{ex.codigoProcedimento}</td>
                      <td className="p-1">{ex.descricaoProcedimento}</td>
                      <td className="p-1 font-mono">{ex.dataExame}</td>
                      <td className="p-1">{ex.ordemExame.replace('_', ' ')}</td>
                      <td className="p-1 font-bold text-emerald-800">{ex.resultado.replace('_', ' ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-emerald-50 border-2 border-emerald-600 p-4 rounded text-center mb-6">
              <div className="text-xs uppercase font-bold text-gray-700">Conclusão Médica Ocupacional:</div>
              <div className="text-2xl font-black text-emerald-800 tracking-wider my-1">
                {selectedAso.resultadoAso === '1_APTO' ? 'APTO PARA A FUNÇÃO' : selectedAso.resultadoAso}
              </div>
              <div className="text-[10px] text-gray-600">
                O colaborador atende integralmente aos requisitos de aptidão médica e física segundo os critérios do PCMSO / NR-07.
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-gray-300 pt-3 text-[10px]">
              <div>
                <div className="font-bold">Médico Examinador:</div>
                <div>{selectedAso.medicoExaminador.nome}</div>
                <div className="font-mono">CRM/{selectedAso.medicoExaminador.ufCrm} {selectedAso.medicoExaminador.crm}</div>
              </div>
              <div>
                <div className="font-bold">Médico Coordenador do PCMSO:</div>
                <div>{selectedAso.medicoCoordenadorPcmso.nome}</div>
                <div className="font-mono">CRM/{selectedAso.medicoCoordenadorPcmso.ufCrm} {selectedAso.medicoCoordenadorPcmso.crm}</div>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-8 text-center text-[10px]">
              <div className="border-t border-black pt-1">
                Assinatura e Carimbo do Médico Examinador
              </div>
              <div className="border-t border-black pt-1">
                Ciente do Trabalhador em: _____/_____/_________
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: XML PREVIEW */}
      {activeTab === 'XML_PREVIEW' && (
        <div className="bg-[#181818] border border-[#282828] p-4 rounded space-y-3">
          <div className="flex items-center justify-between border-b border-[#262626] pb-2">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-rose-400" />
              <span className="font-semibold text-white text-xs">{xmlTitulo}</span>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(xmlVisualizacao)}
              className="px-2.5 py-1 bg-[#252525] hover:bg-[#303030] text-gray-300 text-xs rounded border border-[#333]"
            >
              Copiar XML
            </button>
          </div>
          <pre className="bg-[#121212] p-4 rounded border border-[#222] text-xs font-mono text-emerald-400 overflow-x-auto max-h-96 leading-relaxed">
            {xmlVisualizacao}
          </pre>
        </div>
      )}
    </div>
  );
};
