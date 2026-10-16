import React, { useState, useEffect } from 'react';
import {
  Scale,
  FileSpreadsheet,
  FileText,
  DollarSign,
  TrendingDown,
  Building2,
  Calendar,
  Search,
  PlusCircle,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Copy,
  Download,
  Gavel,
  ShieldCheck,
  Percent,
  Layers
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  ResumoSpedContribuicoesBloco1,
  ProcessoReferenciado1010,
  DetalhamentoOperacaoProcesso1011,
  ControleCreditoPisCofins1100_1500,
  TipoProcessoSped
} from '../../types/contabil';

interface SpedBloco1Props {
  empresaId?: number;
}

export const SpedContribuicoesBloco1Module: React.FC<SpedBloco1Props> = ({ empresaId = 1 }) => {
  const [competencia, setCompetencia] = useState<string>('2026-03');
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'PROCESSOS_1010' | 'OPERACOES_1011' | 'CREDITOS_1100' | 'SPED_TXT' | 'LAUDO_A4'>('DASHBOARD');
  const [resumo, setResumo] = useState<ResumoSpedContribuicoesBloco1 | null>(null);
  const [arquivoSpedTxt, setArquivoSpedTxt] = useState<string>('');
  const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'info'; texto: string } | null>(null);
  const [filtroTexto, setFiltroTexto] = useState<string>('');

  // Modal / Form novo Processo 1010
  const [showNovoProcesso, setShowNovoProcesso] = useState<boolean>(false);
  const [novoProcesso, setNovoProcesso] = useState<Partial<ProcessoReferenciado1010>>({
    numeroProcesso: '5001234-88.2023.4.01.3800',
    tipoProcesso: '1_JUSTICA_FEDERAL',
    secaoJudiciaria: 'TRF 1ª Região - Seção Judiciária de MG',
    vara: '2ª Vara Federal Cível',
    dataSentencaDespacho: '2023-08-15',
    naturezaAcao: 'Ação Ordinária - Exclusão do ICMS destacado da base de PIS/COFINS (Tema 69 STF)',
    statusProcesso: 'TRANSITADO_JULGADO'
  });

  const carregarDados = () => {
    const dados = dbService.getSpedContribuicoesBloco1(empresaId, competencia);
    setResumo(dados);
  };

  useEffect(() => {
    carregarDados();
  }, [empresaId, competencia]);

  const handleGerarSpedTxt = () => {
    const res = dbService.gerarArquivoSpedBloco1Txt(empresaId, competencia);
    if (res.sucesso) {
      setArquivoSpedTxt(res.arquivo);
      setActiveTab('SPED_TXT');
      setFeedback({ tipo: 'sucesso', texto: res.mensagem });
    }
  };

  const handleSalvarProcesso = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `proc-${Date.now()}`;
    const proc: ProcessoReferenciado1010 = {
      ...(novoProcesso as ProcessoReferenciado1010),
      id,
      empresaId
    };
    const res = dbService.salvarProcesso1010(proc);
    if (res.sucesso) {
      setFeedback({ tipo: 'sucesso', texto: res.mensagem });
      setShowNovoProcesso(false);
      carregarDados();
    }
  };

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="flex flex-col h-full bg-[#121212] text-gray-200 p-4 space-y-4 overflow-y-auto">
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-[#262626] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                SPED Contribuições: Bloco 1 - Processos Judiciais & Tema 69 STF
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                  RE 574.706 / STF
                </span>
              </h1>
              <p className="text-xs text-gray-400">
                Registros 1010, 1011, 1100 e 1500 - Exclusão do ICMS destacado da base de cálculo do PIS e da COFINS e controle de saldos credores
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#181818] border border-[#262626] px-2.5 py-1.5 rounded">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-400">Competência:</span>
            <input
              type="month"
              value={competencia}
              onChange={(e) => setCompetencia(e.target.value)}
              className="bg-transparent text-xs text-white border-0 focus:outline-none font-medium cursor-pointer"
            />
          </div>

          <button
            onClick={handleGerarSpedTxt}
            className="px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-sm"
          >
            <FileCode className="w-3.5 h-3.5" />
            Gerar TXT Bloco 1
          </button>
        </div>
      </div>

      {/* FEEDBACK BANNER */}
      {feedback && (
        <div className="flex items-center justify-between bg-emerald-950/60 border border-emerald-700/50 text-emerald-200 px-4 py-2.5 rounded text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedback.texto}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-gray-400 hover:text-white font-mono text-xs ml-4">
            ×
          </button>
        </div>
      )}

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#181818] border border-[#262626] p-3 rounded flex items-center justify-between">
          <div>
            <div className="text-[10px] text-gray-400 uppercase font-semibold">ICMS Excluído (Tema 69)</div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">
              {formatBRL(resumo?.totalExclusaoIcmsBRL || 0)}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">Base de Cálculo Expurgada</div>
          </div>
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-[#181818] border border-[#262626] p-3 rounded flex items-center justify-between">
          <div>
            <div className="text-[10px] text-gray-400 uppercase font-semibold">Economia Tributária Líquida</div>
            <div className="text-xl font-bold text-sky-400 mt-0.5">
              {formatBRL(resumo?.totalEconomiaPisCofinsBRL || 0)}
            </div>
            <div className="text-[10px] text-sky-400/80 mt-0.5">9,25% (PIS 1,65% + COFINS 7,6%)</div>
          </div>
          <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-lg border border-sky-500/20">
            <Percent className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-[#181818] border border-[#262626] p-3 rounded flex items-center justify-between">
          <div>
            <div className="text-[10px] text-gray-400 uppercase font-semibold">Processos Referenciados</div>
            <div className="text-xl font-bold text-indigo-400 mt-0.5">
              {resumo?.processos.length || 0} Ações
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">Registro 1010 Habilitado</div>
          </div>
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
            <Gavel className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-[#181818] border border-[#262626] p-3 rounded flex items-center justify-between">
          <div>
            <div className="text-[10px] text-gray-400 uppercase font-semibold">Créditos Disponíveis (1100/1500)</div>
            <div className="text-xl font-bold text-amber-400 mt-0.5">
              {formatBRL(resumo?.totalCreditosDisponiveisBRL || 0)}
            </div>
            <div className="text-[10px] text-amber-400/80 mt-0.5">Saldo p/ Períodos Seguintes</div>
          </div>
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* NAVEGAÇÃO DE ABAS */}
      <div className="flex border-b border-[#262626] gap-2">
        <button
          onClick={() => setActiveTab('DASHBOARD')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'DASHBOARD'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Visão Geral & Impacto Tema 69
        </button>

        <button
          onClick={() => setActiveTab('PROCESSOS_1010')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'PROCESSOS_1010'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Gavel className="w-3.5 h-3.5" />
          Processos Judiciais (Reg. 1010)
        </button>

        <button
          onClick={() => setActiveTab('OPERACOES_1011')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'OPERACOES_1011'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          Detalhamento Operações (Reg. 1011)
        </button>

        <button
          onClick={() => setActiveTab('CREDITOS_1100')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'CREDITOS_1100'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          Controle de Créditos (Reg. 1100 / 1500)
        </button>

        <button
          onClick={() => setActiveTab('LAUDO_A4')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'LAUDO_A4'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Printer className="w-3.5 h-3.5" />
          Laudo Pericial A4
        </button>

        {activeTab === 'SPED_TXT' && (
          <button
            onClick={() => setActiveTab('SPED_TXT')}
            className="px-4 py-2 text-xs font-medium border-b-2 border-emerald-500 text-emerald-400 bg-emerald-500/10 flex items-center gap-2"
          >
            <FileCode className="w-3.5 h-3.5" />
            Arquivo SPED Bloco 1 (TXT)
          </button>
        )}
      </div>

      {/* ABA: DASHBOARD */}
      {activeTab === 'DASHBOARD' && (
        <div className="space-y-4">
          <div className="bg-[#181818] border border-[#262626] rounded p-4 space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Entendimento Jurisprudencial e Fundamentação do Tema 69 STF
            </h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              O Supremo Tribunal Federal, ao julgar o Recurso Extraordinário nº 574.706 (Tema 69 da Repercussão Geral), fixou a tese de que{' '}
              <strong className="text-emerald-400">"O ICMS não compõe a base de cálculo para a incidência do PIS e da COFINS"</strong>.
              Nos embargos de declaração, modulou-se os efeitos para 15/03/2017 e pacificou-se que o valor a ser excluído é o{' '}
              <strong className="text-white">ICMS destacado na nota fiscal</strong> e não o ICMS recolhido.
            </p>
            <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded text-xs text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Orientação Normativa RFB (Parecer SEI nº 7698/2021/ME e Guia Prático EFD-Contribuições):</span>{' '}
                As notas fiscais com decisão judicial devem ser escrituradas no Bloco C com os campos de PIS/COFINS preenchidos com as bases originais, e detalhadas no Registro 1011 com a indicação do valor do ICMS excluído e recálculo da base de cálculo líquida, vinculadas ao Registro 1010 correspondente.
              </div>
            </div>
          </div>

          {/* RESUMO DE ECONOMIA POR NOTA */}
          <div className="bg-[#181818] border border-[#262626] rounded p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Operações Beneficiadas na Competência {competencia}
              </h3>
              <span className="text-xs text-gray-400 font-mono">
                {resumo?.operacoesDetalhadas.length || 0} notas fiscais auditadas
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#202020] text-gray-400 uppercase text-[10px] font-semibold border-b border-[#262626]">
                  <tr>
                    <th className="py-2.5 px-3">NF-e / Emissão</th>
                    <th className="py-2.5 px-3">CFOP / CST</th>
                    <th className="py-2.5 px-3 text-right">Valor Operação</th>
                    <th className="py-2.5 px-3 text-right">ICMS Excluído</th>
                    <th className="py-2.5 px-3 text-right">Base Líquida</th>
                    <th className="py-2.5 px-3 text-right">PIS (1,65%)</th>
                    <th className="py-2.5 px-3 text-right">COFINS (7,60%)</th>
                    <th className="py-2.5 px-3 text-right">Economia Gerada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262626]">
                  {resumo?.operacoesDetalhadas.map((op) => (
                    <tr key={op.id} className="hover:bg-[#202020] transition-colors">
                      <td className="py-2 px-3 font-mono">
                        <div className="text-white font-medium">NF-e #{op.numeroDocumento}</div>
                        <div className="text-[10px] text-gray-500">{op.dataEmissao}</div>
                      </td>
                      <td className="py-2 px-3 font-mono">
                        <span className="text-gray-300 font-semibold">{op.cfop}</span>
                        <span className="text-gray-500 text-[10px] ml-1">CST {op.cstPisCofins}</span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-gray-300">
                        {formatBRL(op.valorTotalOperacao)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-emerald-400 font-bold">
                        {formatBRL(op.valorIcmsDestacadoExcluido)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-white">
                        {formatBRL(op.baseCalculoLiquidaPisCofins)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-gray-300">
                        {formatBRL(op.valorPisApurado)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-gray-300">
                        {formatBRL(op.valorCofinsApurado)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-sky-400 font-bold">
                        {formatBRL(op.economiaTributariaPeriodo)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-[#202020] font-bold text-xs border-t border-[#333]">
                  <tr>
                    <td colSpan={2} className="py-2.5 px-3 text-white">TOTAIS CONSOLIDADOS:</td>
                    <td className="py-2.5 px-3 text-right font-mono text-gray-300">
                      {formatBRL(resumo?.operacoesDetalhadas.reduce((a, b) => a + b.valorTotalOperacao, 0) || 0)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-400">
                      {formatBRL(resumo?.totalExclusaoIcmsBRL || 0)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-white">
                      {formatBRL(resumo?.operacoesDetalhadas.reduce((a, b) => a + b.baseCalculoLiquidaPisCofins, 0) || 0)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-gray-300">
                      {formatBRL(resumo?.operacoesDetalhadas.reduce((a, b) => a + b.valorPisApurado, 0) || 0)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-gray-300">
                      {formatBRL(resumo?.operacoesDetalhadas.reduce((a, b) => a + b.valorCofinsApurado, 0) || 0)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-sky-400">
                      {formatBRL(resumo?.totalEconomiaPisCofinsBRL || 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ABA: PROCESSOS REFERENCIADOS (1010) */}
      {activeTab === 'PROCESSOS_1010' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Gavel className="w-4 h-4 text-indigo-400" />
              Ações Judiciais e Processos Administrativos (Registro 1010)
            </h2>
            <button
              onClick={() => setShowNovoProcesso(true)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Adicionar Processo
            </button>
          </div>

          {showNovoProcesso && (
            <form onSubmit={handleSalvarProcesso} className="bg-[#1c1c1c] border border-indigo-500/40 p-4 rounded space-y-3">
              <div className="text-xs font-bold text-indigo-300 pb-1 border-b border-[#333]">
                Cadastrar Novo Processo Referenciado
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">Número do Processo (CNJ)</label>
                  <input
                    type="text"
                    value={novoProcesso.numeroProcesso || ''}
                    onChange={(e) => setNovoProcesso({ ...novoProcesso, numeroProcesso: e.target.value })}
                    className="w-full bg-[#141414] border border-[#333] rounded px-3 py-1.5 text-xs text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">Tipo de Processo</label>
                  <select
                    value={novoProcesso.tipoProcesso}
                    onChange={(e) => setNovoProcesso({ ...novoProcesso, tipoProcesso: e.target.value as TipoProcessoSped })}
                    className="w-full bg-[#141414] border border-[#333] rounded px-3 py-1.5 text-xs text-white"
                  >
                    <option value="1_JUSTICA_FEDERAL">1 - Justiça Federal</option>
                    <option value="2_JUSTICA_ESTADUAL">2 - Justiça Estadual</option>
                    <option value="3_SECEX_SRF">3 - SECEX / Receita Federal</option>
                    <option value="9_OUTROS">9 - Outros</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">Status da Decisão</label>
                  <select
                    value={novoProcesso.statusProcesso}
                    onChange={(e) => setNovoProcesso({ ...novoProcesso, statusProcesso: e.target.value as any })}
                    className="w-full bg-[#141414] border border-[#333] rounded px-3 py-1.5 text-xs text-white"
                  >
                    <option value="TRANSITADO_JULGADO">Transitado em Julgado</option>
                    <option value="LIMINAR_DEFERIDA">Liminar Deferida</option>
                    <option value="EM_ANDAMENTO">Em Andamento c/ Depósito Judicial</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">Seção Judiciária / Tribunal</label>
                  <input
                    type="text"
                    value={novoProcesso.secaoJudiciaria || ''}
                    onChange={(e) => setNovoProcesso({ ...novoProcesso, secaoJudiciaria: e.target.value })}
                    className="w-full bg-[#141414] border border-[#333] rounded px-3 py-1.5 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">Vara Federal / Juízo</label>
                  <input
                    type="text"
                    value={novoProcesso.vara || ''}
                    onChange={(e) => setNovoProcesso({ ...novoProcesso, vara: e.target.value })}
                    className="w-full bg-[#141414] border border-[#333] rounded px-3 py-1.5 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">Data da Sentença / Despacho</label>
                  <input
                    type="date"
                    value={novoProcesso.dataSentencaDespacho || ''}
                    onChange={(e) => setNovoProcesso({ ...novoProcesso, dataSentencaDespacho: e.target.value })}
                    className="w-full bg-[#141414] border border-[#333] rounded px-3 py-1.5 text-xs text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1">Natureza da Ação / Descrição</label>
                <input
                  type="text"
                  value={novoProcesso.naturezaAcao || ''}
                  onChange={(e) => setNovoProcesso({ ...novoProcesso, naturezaAcao: e.target.value })}
                  className="w-full bg-[#141414] border border-[#333] rounded px-3 py-1.5 text-xs text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNovoProcesso(false)}
                  className="px-3 py-1.5 bg-[#252525] hover:bg-[#333] text-gray-300 rounded text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold"
                >
                  Salvar Registro 1010
                </button>
              </div>
            </form>
          )}

          <div className="bg-[#181818] border border-[#262626] rounded overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#202020] text-gray-400 uppercase text-[10px] font-semibold border-b border-[#262626]">
                <tr>
                  <th className="py-2.5 px-3">Número do Processo</th>
                  <th className="py-2.5 px-3">Origem / Foro</th>
                  <th className="py-2.5 px-3">Natureza da Ação</th>
                  <th className="py-2.5 px-3">Data Sentença</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {resumo?.processos.map((proc) => (
                  <tr key={proc.id} className="hover:bg-[#202020] transition-colors">
                    <td className="py-2.5 px-3 font-mono font-medium text-white">
                      {proc.numeroProcesso}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="text-gray-300 font-medium">{proc.secaoJudiciaria}</div>
                      <div className="text-[10px] text-gray-500">{proc.vara}</div>
                    </td>
                    <td className="py-2.5 px-3 text-gray-300">
                      {proc.naturezaAcao}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-gray-400">
                      {proc.dataSentencaDespacho}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {proc.statusProcesso.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA: DETALHAMENTO DAS OPERAÇÕES (1011) */}
      {activeTab === 'OPERACOES_1011' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Detalhamento das Operações com Exclusão do ICMS Destacado (Registro 1011)
            </h2>
            <div className="text-xs text-gray-400">
              Total Excluído: <strong className="text-emerald-400 font-mono">{formatBRL(resumo?.totalExclusaoIcmsBRL || 0)}</strong>
            </div>
          </div>

          <div className="bg-[#181818] border border-[#262626] rounded overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#202020] text-gray-400 uppercase text-[10px] font-semibold border-b border-[#262626]">
                <tr>
                  <th className="py-2.5 px-3">Doc / Chave NF-e</th>
                  <th className="py-2.5 px-3">Data</th>
                  <th className="py-2.5 px-3">CFOP / CST</th>
                  <th className="py-2.5 px-3 text-right">Valor Bruto</th>
                  <th className="py-2.5 px-3 text-right">ICMS Destacado</th>
                  <th className="py-2.5 px-3 text-right">Base Líquida</th>
                  <th className="py-2.5 px-3 text-right">PIS (1,65%)</th>
                  <th className="py-2.5 px-3 text-right">COFINS (7,60%)</th>
                  <th className="py-2.5 px-3 text-right">Economia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {resumo?.operacoesDetalhadas.map((op) => (
                  <tr key={op.id} className="hover:bg-[#202020] transition-colors">
                    <td className="py-2 px-3 font-mono">
                      <div className="text-white font-medium">NF-e #{op.numeroDocumento}</div>
                      <div className="text-[9px] text-gray-500 truncate max-w-xs">{op.chaveNfe}</div>
                    </td>
                    <td className="py-2 px-3 font-mono text-gray-400">{op.dataEmissao}</td>
                    <td className="py-2 px-3 font-mono">
                      <span className="text-gray-200">{op.cfop}</span> | CST {op.cstPisCofins}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-gray-300">{formatBRL(op.valorTotalOperacao)}</td>
                    <td className="py-2 px-3 text-right font-mono text-emerald-400 font-bold">{formatBRL(op.valorIcmsDestacadoExcluido)}</td>
                    <td className="py-2 px-3 text-right font-mono text-white">{formatBRL(op.baseCalculoLiquidaPisCofins)}</td>
                    <td className="py-2 px-3 text-right font-mono text-gray-300">{formatBRL(op.valorPisApurado)}</td>
                    <td className="py-2 px-3 text-right font-mono text-gray-300">{formatBRL(op.valorCofinsApurado)}</td>
                    <td className="py-2 px-3 text-right font-mono text-sky-400 font-bold">{formatBRL(op.economiaTributariaPeriodo)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA: CONTROLE DE CRÉDITOS (1100 / 1500) */}
      {activeTab === 'CREDITOS_1100' && (
        <div className="space-y-4">
          <div className="bg-[#181818] border border-[#262626] rounded p-4 space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-400" />
              Controle de Saldos de Créditos Fiscais Acumulados (Registros 1100 PIS e 1500 COFINS)
            </h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              Demonstração do saldo de créditos gerados em períodos anteriores e no próprio mês, demonstrando parcelas utilizadas para desconto direto de débitos apurados, parcelas objeto de compensação tributária (DCOMP) e o saldo remanescente a transportar para os períodos de apuração subsequentes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* PIS 1100 */}
            <div className="bg-[#181818] border border-[#262626] rounded p-3 space-y-3">
              <div className="text-xs font-bold text-sky-400 flex items-center justify-between border-b border-[#262626] pb-2">
                <span>Registro 1100 - Crédito de PIS/PASEP</span>
                <span className="font-mono text-white text-[11px]">
                  Total Transportar: {formatBRL(resumo?.creditosPis1100.reduce((a, b) => a + b.saldoCreditoTransportar, 0) || 0)}
                </span>
              </div>
              <div className="space-y-2">
                {resumo?.creditosPis1100.map((c) => (
                  <div key={c.id} className="p-2.5 bg-[#141414] border border-[#2b2b2b] rounded text-xs space-y-1 font-mono">
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-300">Período Gerador: {c.periodoGeracao}</span>
                      <span className="text-sky-400">{c.origemCredito.replace('_', ' ')}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[11px] pt-1 text-gray-400">
                      <div>Disp: <span className="text-white font-bold">{formatBRL(c.valorCreditoDisponivel)}</span></div>
                      <div>Desc: <span className="text-amber-400">{formatBRL(c.valorCreditoUtilizadoDesconto)}</span></div>
                      <div>Comp: <span className="text-purple-400">{formatBRL(c.valorCreditoUtilizadoCompensacao)}</span></div>
                    </div>
                    <div className="text-right text-[11px] pt-1 border-t border-[#222]">
                      Saldo Final: <span className="text-emerald-400 font-bold">{formatBRL(c.saldoCreditoTransportar)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* COFINS 1500 */}
            <div className="bg-[#181818] border border-[#262626] rounded p-3 space-y-3">
              <div className="text-xs font-bold text-amber-400 flex items-center justify-between border-b border-[#262626] pb-2">
                <span>Registro 1500 - Crédito de COFINS</span>
                <span className="font-mono text-white text-[11px]">
                  Total Transportar: {formatBRL(resumo?.creditosCofins1500.reduce((a, b) => a + b.saldoCreditoTransportar, 0) || 0)}
                </span>
              </div>
              <div className="space-y-2">
                {resumo?.creditosCofins1500.map((c) => (
                  <div key={c.id} className="p-2.5 bg-[#141414] border border-[#2b2b2b] rounded text-xs space-y-1 font-mono">
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-300">Período Gerador: {c.periodoGeracao}</span>
                      <span className="text-amber-400">{c.origemCredito.replace('_', ' ')}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[11px] pt-1 text-gray-400">
                      <div>Disp: <span className="text-white font-bold">{formatBRL(c.valorCreditoDisponivel)}</span></div>
                      <div>Desc: <span className="text-amber-400">{formatBRL(c.valorCreditoUtilizadoDesconto)}</span></div>
                      <div>Comp: <span className="text-purple-400">{formatBRL(c.valorCreditoUtilizadoCompensacao)}</span></div>
                    </div>
                    <div className="text-right text-[11px] pt-1 border-t border-[#222]">
                      Saldo Final: <span className="text-emerald-400 font-bold">{formatBRL(c.saldoCreditoTransportar)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA: LAUDO PERICIAL A4 */}
      {activeTab === 'LAUDO_A4' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-[#181818] p-3 rounded border border-[#262626]">
            <div>
              <span className="text-xs text-gray-400">Laudo Técnico Pericial de Exclusão do ICMS - </span>
              <span className="text-xs font-bold text-white">Competência {competencia}</span>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir Laudo A4
            </button>
          </div>

          <div className="bg-white text-black p-8 rounded shadow-2xl max-w-4xl mx-auto space-y-6 print:m-0 print:p-0 font-serif">
            {/* CABEÇALHO */}
            <div className="border-b-2 border-black pb-4 text-center space-y-1">
              <div className="font-extrabold text-base uppercase tracking-wider">
                PARECER TÉCNICO-CONTÁBIL DE AUDITORIA FISCAL
              </div>
              <div className="font-bold text-xs uppercase text-gray-800">
                EXCLUSÃO DO ICMS DESTACADO DA BASE DE CÁLCULO DO PIS E DA COFINS (TEMA 69 / STF)
              </div>
              <div className="text-[11px] font-sans text-gray-600">
                EFD-Contribuições Bloco 1 • Registros 1010, 1011, 1100 e 1500 • Instrução Normativa RFB nº 1.252/2012
              </div>
            </div>

            {/* DADOS DA SOCIEDADE */}
            <div className="grid grid-cols-2 border border-black p-3 text-xs font-sans gap-2">
              <div>
                <span className="font-bold block text-[10px] text-gray-600">SOCIEDADE EMPRESÁRIA:</span>
                <span className="font-bold">CONTABIL STUDIO PRO BRASIL LTDA</span>
              </div>
              <div>
                <span className="font-bold block text-[10px] text-gray-600">CNPJ / INSCRIÇÃO ESTADUAL:</span>
                <span className="font-mono">00.123.456/0001-91 | IE: 112.334.556.778</span>
              </div>
              <div>
                <span className="font-bold block text-[10px] text-gray-600">PROCESSO JUDICIAL VINCULADO:</span>
                <span className="font-mono font-semibold">5001234-88.2023.4.01.3800 (TRF 1ª Região)</span>
              </div>
              <div>
                <span className="font-bold block text-[10px] text-gray-600">COMPETÊNCIA ANALISADA:</span>
                <span className="font-bold">{competencia}</span>
              </div>
            </div>

            {/* FUNDAMENTAÇÃO */}
            <div className="text-xs leading-relaxed space-y-2 text-justify">
              <p>
                <strong>1. FUNDAMENTAÇÃO JURÍDICA E MODULAÇÃO:</strong> Conforme decidido pelo plenário do Supremo Tribunal Federal no julgamento do RE 574.706/PR, o valor do Imposto sobre Circulação de Mercadorias e Serviços (ICMS) destacado nos documentos fiscais de saída não integra o conceito de faturamento ou receita bruta contido no Art. 195, I, 'b' da Constituição Federal de 1988, visto tratar-se de mero ingresso de valores transitórios destinados aos cofres públicos estaduais.
              </p>
              <p>
                <strong>2. METODOLOGIA DE CÁLCULO ADOTADA:</strong> Em estrita observância à modulação dos embargos declaratórios e às orientações vigentes do Guia Prático da EFD-Contribuições, procedeu-se ao expurgo integral do ICMS destacado na coluna própria das NF-e emitidas na competência, recalculando-se as bases de cálculo líquidas para incidência das alíquotas de 1,65% (PIS) e 7,60% (COFINS).
              </p>
            </div>

            {/* TABELA DE DEMONSTRAÇÃO */}
            <div className="border border-black font-sans text-xs">
              <div className="bg-gray-100 p-2 font-bold uppercase text-[10px] border-b border-black">
                QUADRO DEMONSTRATIVO DA ECONOMIA TRIBUTÁRIA APURADA
              </div>
              <div className="grid grid-cols-2 p-2 border-b border-gray-300">
                <span>Faturamento Bruto Tributável Analisado:</span>
                <span className="font-mono font-bold text-right">{formatBRL(resumo?.operacoesDetalhadas.reduce((a, b) => a + b.valorTotalOperacao, 0) || 0)}</span>
              </div>
              <div className="grid grid-cols-2 p-2 border-b border-gray-300 bg-gray-50">
                <span className="font-bold text-emerald-800">(-) ICMS Destacado Excluído (Tema 69 STF):</span>
                <span className="font-mono font-bold text-right text-emerald-800">{formatBRL(resumo?.totalExclusaoIcmsBRL || 0)}</span>
              </div>
              <div className="grid grid-cols-2 p-2 border-b border-gray-300">
                <span>(=) Base de Cálculo Efetiva Líquida:</span>
                <span className="font-mono font-bold text-right">{formatBRL(resumo?.operacoesDetalhadas.reduce((a, b) => a + b.baseCalculoLiquidaPisCofins, 0) || 0)}</span>
              </div>
              <div className="grid grid-cols-2 p-2 border-b border-gray-300">
                <span>PIS Líquido Devido (1,65%):</span>
                <span className="font-mono text-right">{formatBRL(resumo?.operacoesDetalhadas.reduce((a, b) => a + b.valorPisApurado, 0) || 0)}</span>
              </div>
              <div className="grid grid-cols-2 p-2 border-b border-gray-300">
                <span>COFINS Líquida Devida (7,60%):</span>
                <span className="font-mono text-right">{formatBRL(resumo?.operacoesDetalhadas.reduce((a, b) => a + b.valorCofinsApurado, 0) || 0)}</span>
              </div>
              <div className="grid grid-cols-2 p-2 bg-indigo-50 font-bold text-indigo-950">
                <span>(=) ECONOMIA TRIBUTÁRIA TOTAL NO PERÍODO:</span>
                <span className="font-mono text-right text-sm">{formatBRL(resumo?.totalEconomiaPisCofinsBRL || 0)}</span>
              </div>
            </div>

            {/* FECHAMENTO E ASSINATURAS */}
            <div className="pt-6 text-xs text-center space-y-8 font-sans">
              <p>São Paulo, {new Date().toLocaleDateString('pt-BR')}. Documento lavrado e certificado para fins de escrituração fiscal.</p>
              <div className="grid grid-cols-2 gap-12 pt-4">
                <div className="border-t border-black pt-1">
                  <div className="font-bold">CONTABIL STUDIO PRO BRASIL LTDA</div>
                  <div className="text-[10px] text-gray-600">Representante Legal</div>
                </div>
                <div className="border-t border-black pt-1">
                  <div className="font-bold">DR. ROBERTO SILVEIRA BARBOSA</div>
                  <div className="text-[10px] text-gray-600">Contador Responsável Técnico - CRC-SP 1SP298451/O-4</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA: SPED TXT */}
      {activeTab === 'SPED_TXT' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-[#181818] p-3 rounded border border-[#262626]">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-white">SPED Contribuições - Bloco 1 (TXT Oficial)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(arquivoSpedTxt);
                  setFeedback({ tipo: 'sucesso', texto: 'Arquivo SPED TXT copiado!' });
                }}
                className="px-2.5 py-1 bg-[#222] hover:bg-[#2a2a2a] text-gray-300 rounded text-xs flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                Copiar
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([arquivoSpedTxt], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `SPED_EFD_CONTRIBUICOES_BLOCO1_${competencia}.txt`;
                  a.click();
                }}
                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                Baixar TXT
              </button>
            </div>
          </div>

          <pre className="p-4 bg-[#0d0d0d] border border-[#262626] rounded text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-[500px]">
            {arquivoSpedTxt}
          </pre>
        </div>
      )}
    </div>
  );
};
