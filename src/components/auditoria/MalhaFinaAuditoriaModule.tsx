import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Printer,
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  Layers,
  ArrowRightLeft,
  ChevronDown,
  ChevronUp,
  Scale,
  Award,
  BookOpen
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  LaudoAuditoriaMalhaFina,
  ItemRegraAuditoriaCruzada,
  NivelRiscoAuditoria,
  Empresa
} from '../../types/contabil';

interface MalhaFinaAuditoriaModuleProps {
  empresaAtiva: Empresa;
  onOpenReportPreview?: (config: { titulo: string; subtitulo: string; conteudo?: React.ReactNode; linhas?: any[] }) => void;
}

export const MalhaFinaAuditoriaModule: React.FC<MalhaFinaAuditoriaModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [anoExercicio, setAnoExercicio] = useState<number>(2026);
  const [filtroRisco, setFiltroRisco] = useState<'TODOS' | NivelRiscoAuditoria>('TODOS');
  const [termoBusca, setTermoBusca] = useState('');
  const [laudo, setLaudo] = useState<LaudoAuditoriaMalhaFina | null>(null);
  const [isExecutando, setIsExecutando] = useState(false);
  const [expandedRegraId, setExpandedRegraId] = useState<string | null>(null);

  const carregarAuditoria = () => {
    setIsExecutando(true);
    setTimeout(() => {
      const resultado = dbService.executarAuditoriaCruzadaMalhaFina(empresaAtiva.id, anoExercicio);
      setLaudo(resultado);
      setIsExecutando(false);
    }, 350);
  };

  useEffect(() => {
    carregarAuditoria();
  }, [empresaAtiva.id, anoExercicio]);

  const regrasFiltradas = laudo?.itens.filter(item => {
    if (filtroRisco !== 'TODOS' && item.nivelRisco !== filtroRisco) return false;
    if (termoBusca) {
      const q = termoBusca.toLowerCase();
      const matchTitulo = item.titulo.toLowerCase().includes(q);
      const matchCod = item.codigoRegra.toLowerCase().includes(q);
      const matchObrig = item.obrigacoesEnvolvidas.some(o => o.toLowerCase().includes(q));
      return matchTitulo || matchCod || matchObrig;
    }
    return true;
  }) || [];

  const handleEmitirLaudoA4 = () => {
    if (!laudo || !onOpenReportPreview) return;

    const relatorioContent = (
      <div className="font-sans text-neutral-800 p-4 space-y-5">
        <div className="border-b border-neutral-300 pb-3 flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold uppercase tracking-wider text-neutral-900">
              Laudo Pericial de Auditoria Cruzada e Malha Fina Eletrônica
            </h1>
            <p className="text-xs text-neutral-600 mt-1">
              Confronto e Cruzamento de Obrigações Acessórias RFB, DCTFWeb, eSocial, EFD e Contabilidade
            </p>
          </div>
          <div className="text-right">
            <span className={`inline-block px-3 py-1 rounded text-xs font-bold tracking-wider ${
              laudo.statusGeral === 'APROVADO_SEM_RESSALVAS' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
              laudo.statusGeral === 'APROVADO_COM_APONTAMENTOS' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
              'bg-rose-100 text-rose-800 border border-rose-300'
            }`}>
              {laudo.statusGeral === 'APROVADO_SEM_RESSALVAS' ? 'APROVADO SEM RESSALVAS' :
               laudo.statusGeral === 'APROVADO_COM_APONTAMENTOS' ? 'APROVADO COM APONTAMENTOS' :
               'RETENÇÃO EM MALHA IMINENTE'}
            </span>
            <p className="text-[10px] text-neutral-500 mt-1">Score: {laudo.scoreConformidade}/100 pts</p>
          </div>
        </div>

        {/* Metadados da Empresa */}
        <div className="grid grid-cols-2 gap-4 text-xs bg-neutral-50 p-3 rounded border border-neutral-200">
          <div>
            <p><span className="font-bold">Razão Social:</span> {empresaAtiva.razaoSocial}</p>
            <p><span className="font-bold">CNPJ:</span> {empresaAtiva.cnpj}</p>
            <p><span className="font-bold">Regime Tributário:</span> {empresaAtiva.regimeTributario}</p>
          </div>
          <div>
            <p><span className="font-bold">Exercício de Auditoria:</span> {laudo.anoExercicio}</p>
            <p><span className="font-bold">Data da Execução:</span> {new Date(laudo.dataAuditoria).toLocaleDateString('pt-BR')} às {new Date(laudo.dataAuditoria).toLocaleTimeString('pt-BR')}</p>
            <p><span className="font-bold">Auditor Responsável:</span> {laudo.auditorResponsavel}</p>
          </div>
        </div>

        {/* Resumo Quantitativo */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2 border border-neutral-200 rounded bg-white">
            <div className="text-neutral-500 font-semibold">Total Regras</div>
            <div className="text-lg font-bold text-neutral-800">{laudo.totalRegrasAnalisadas}</div>
          </div>
          <div className="p-2 border border-emerald-200 rounded bg-emerald-50 text-emerald-900">
            <div className="font-semibold">Conciliadas</div>
            <div className="text-lg font-bold">{laudo.totalConformes}</div>
          </div>
          <div className="p-2 border border-amber-200 rounded bg-amber-50 text-amber-900">
            <div className="font-semibold">Alertas Leves</div>
            <div className="text-lg font-bold">{laudo.totalAlertas}</div>
          </div>
          <div className="p-2 border border-rose-200 rounded bg-rose-50 text-rose-900">
            <div className="font-semibold">Alto Risco</div>
            <div className="text-lg font-bold">{laudo.totalRiscoAlto}</div>
          </div>
        </div>

        {/* Tabela de Regras Auditadas */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
            Matriz de Confronto entre Obrigações Tributárias
          </h2>
          <table className="w-full text-[10px] border-collapse border border-neutral-300">
            <thead>
              <tr className="bg-neutral-100 text-neutral-700 text-left">
                <th className="p-1.5 border border-neutral-300">Regra</th>
                <th className="p-1.5 border border-neutral-300">Obrigações</th>
                <th className="p-1.5 border border-neutral-300 text-right">Origem A (R$)</th>
                <th className="p-1.5 border border-neutral-300 text-right">Origem B (R$)</th>
                <th className="p-1.5 border border-neutral-300 text-right">Diferença (R$)</th>
                <th className="p-1.5 border border-neutral-300 text-center">Risco</th>
              </tr>
            </thead>
            <tbody>
              {laudo.itens.map(item => (
                <tr key={item.id} className="border-b border-neutral-200">
                  <td className="p-1.5 border border-neutral-200">
                    <span className="font-bold">{item.codigoRegra}:</span> {item.titulo}
                  </td>
                  <td className="p-1.5 border border-neutral-200">
                    {item.obrigacoesEnvolvidas.join(' x ')}
                  </td>
                  <td className="p-1.5 border border-neutral-200 text-right font-mono">
                    {item.valorOrigemA.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-1.5 border border-neutral-200 text-right font-mono">
                    {item.valorOrigemB.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className={`p-1.5 border border-neutral-200 text-right font-mono font-bold ${item.diferenca > 0 ? 'text-rose-700' : 'text-neutral-600'}`}>
                    {item.diferenca.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-1.5 border border-neutral-200 text-center font-bold">
                    <span className={
                      item.nivelRisco === 'CONCILIADO' ? 'text-emerald-700' :
                      item.nivelRisco === 'ALERTA_LEVE' ? 'text-amber-700' : 'text-rose-700'
                    }>
                      {item.nivelRisco === 'CONCILIADO' ? 'CONCILIADO' : item.nivelRisco === 'ALERTA_LEVE' ? 'ALERTA' : 'ALTO RISCO'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Apontamentos e Recomendações */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
            Fundamentação Legal e Diagnóstico Técnico Pericial
          </h2>
          {laudo.itens.filter(i => i.nivelRisco !== 'CONCILIADO').length === 0 ? (
            <p className="text-xs text-emerald-800 bg-emerald-50 p-2 rounded border border-emerald-200">
              Nenhuma inconsistência fiscal foi detectada. Todos os cruzamentos de informações entre bases fiscais, declarações acessórias e balancete contábil apresentaram conformidade integral com os parâmetros da Receita Federal do Brasil.
            </p>
          ) : (
            laudo.itens.filter(i => i.nivelRisco !== 'CONCILIADO').map(item => (
              <div key={`rec-${item.id}`} className="text-xs p-2 rounded border border-neutral-200 bg-neutral-50 space-y-1">
                <div className="font-bold text-neutral-800">{item.codigoRegra} - {item.titulo}</div>
                <div className="text-neutral-600"><span className="font-semibold text-neutral-700">Fundamento Legal:</span> {item.fundamentoLegal}</div>
                <div className="text-neutral-700"><span className="font-semibold text-neutral-800">Recomendação do Auditor:</span> {item.recomendacao}</div>
              </div>
            ))
          )}
        </div>

        {/* Parecer Final e Assinatura */}
        <div className="pt-6 border-t border-neutral-300 mt-6 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <div className="border-t border-neutral-400 pt-2 w-3/4 mx-auto">
              <p className="font-bold text-neutral-800">{empresaAtiva.razaoSocial}</p>
              <p className="text-neutral-500">Representante Legal da Empresa</p>
            </div>
          </div>
          <div>
            <div className="border-t border-neutral-400 pt-2 w-3/4 mx-auto">
              <p className="font-bold text-neutral-800">{laudo.auditorResponsavel}</p>
              <p className="text-neutral-500">Auditor Contábil e Fiscal - CRC/SP</p>
            </div>
          </div>
        </div>
      </div>
    );

    onOpenReportPreview({
      titulo: 'Laudo Pericial de Auditoria Cruzada RFB',
      subtitulo: `Exercício ${laudo.anoExercicio} - ${empresaAtiva.razaoSocial}`,
      conteudo: relatorioContent
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#141414] text-neutral-200 overflow-y-auto">
      {/* Top Banner / Header */}
      <div className="p-4 border-b border-neutral-800 bg-[#181818] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h1 className="text-base font-bold text-neutral-100 flex items-center gap-2">
              Central de Cruzamento e Malha Fina Eletrônica RFB
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800">
                Auditoria Pré-Transmissão Multi-Obrigação
              </span>
            </h1>
            <p className="text-xs text-neutral-400">
              Prevenção autônoma de malha fiscal cruzando DIRF, DCTFWeb, eSocial, EFD-Reinf, EFD-Contribuições, DIEF e Balancete
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#202020] border border-neutral-700 px-2.5 py-1.5 rounded text-xs">
            <span className="text-neutral-400">Exercício:</span>
            <select
              value={anoExercicio}
              onChange={(e) => setAnoExercicio(Number(e.target.value))}
              className="bg-transparent text-neutral-200 font-bold focus:outline-none cursor-pointer"
            >
              <option value={2026} className="bg-[#202020]">2026</option>
              <option value={2025} className="bg-[#202020]">2025</option>
              <option value={2024} className="bg-[#202020]">2024</option>
            </select>
          </div>

          <button
            onClick={carregarAuditoria}
            disabled={isExecutando}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition shadow-sm disabled:opacity-50"
          >
            <RefreshCw size={14} className={isExecutando ? 'animate-spin' : ''} />
            {isExecutando ? 'Auditando...' : 'Reauditar Agora'}
          </button>

          <button
            onClick={handleEmitirLaudoA4}
            disabled={!laudo}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded text-xs font-medium transition shadow-sm"
          >
            <Printer size={14} />
            Emitir Laudo A4
          </button>
        </div>
      </div>

      {laudo && (
        <div className="p-4 space-y-4">
          {/* Dashboard Superior de Status e Score */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Score de Conformidade */}
            <div className="p-3.5 bg-[#1b1b1b] border border-neutral-800 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-[11px] text-neutral-400 font-medium">Score de Conformidade RFB</p>
                <div className="text-2xl font-bold font-mono mt-0.5 flex items-baseline gap-1">
                  <span className={
                    laudo.scoreConformidade >= 90 ? 'text-emerald-400' :
                    laudo.scoreConformidade >= 70 ? 'text-amber-400' : 'text-rose-400'
                  }>
                    {laudo.scoreConformidade}
                  </span>
                  <span className="text-xs text-neutral-500">/ 100 pts</span>
                </div>
                <p className="text-[10px] text-neutral-400 mt-1">Algoritmo preditivo de risco fiscal</p>
              </div>
              <div className="p-2.5 rounded-full bg-neutral-800/80 border border-neutral-700 text-neutral-300">
                <Award size={24} />
              </div>
            </div>

            {/* Status Geral */}
            <div className={`p-3.5 border rounded-lg flex items-center justify-between ${
              laudo.statusGeral === 'APROVADO_SEM_RESSALVAS' ? 'bg-emerald-950/20 border-emerald-800/60 text-emerald-400' :
              laudo.statusGeral === 'APROVADO_COM_APONTAMENTOS' ? 'bg-amber-950/20 border-amber-800/60 text-amber-400' :
              'bg-rose-950/20 border-rose-800/60 text-rose-400'
            }`}>
              <div>
                <p className="text-[11px] font-medium opacity-80">Parecer Geral da Auditoria</p>
                <div className="text-sm font-bold tracking-wide mt-1">
                  {laudo.statusGeral === 'APROVADO_SEM_RESSALVAS' ? 'APROVADO S/ RESSALVAS' :
                   laudo.statusGeral === 'APROVADO_COM_APONTAMENTOS' ? 'COM APONTAMENTOS' :
                   'RISCO DE MALHA IMINENTE'}
                </div>
                <p className="text-[10px] opacity-75 mt-1">
                  {laudo.statusGeral === 'APROVADO_SEM_RESSALVAS' ? 'Transmissão autorizada com segurança' :
                   laudo.statusGeral === 'APROVADO_COM_APONTAMENTOS' ? 'Requer revisão técnica preventiva' :
                   'Bloqueio recomendado antes do envio'}
                </p>
              </div>
              <div>
                {laudo.statusGeral === 'APROVADO_SEM_RESSALVAS' ? <ShieldCheck size={28} /> :
                 laudo.statusGeral === 'APROVADO_COM_APONTAMENTOS' ? <AlertTriangle size={28} /> :
                 <ShieldAlert size={28} />}
              </div>
            </div>

            {/* Total Regras e Conciliadas */}
            <div className="p-3.5 bg-[#1b1b1b] border border-neutral-800 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-[11px] text-neutral-400 font-medium">Regras 100% Conciliadas</p>
                <div className="text-2xl font-bold font-mono text-emerald-400 mt-0.5">
                  {laudo.totalConformes}
                  <span className="text-xs text-neutral-500 ml-1">de {laudo.totalRegrasAnalisadas}</span>
                </div>
                <p className="text-[10px] text-neutral-400 mt-1">Divergência menor que tolerância</p>
              </div>
              <div className="p-2.5 rounded-full bg-emerald-950/40 border border-emerald-800/50 text-emerald-400">
                <CheckCircle2 size={24} />
              </div>
            </div>

            {/* Divergências / Alertas e Alto Risco */}
            <div className="p-3.5 bg-[#1b1b1b] border border-neutral-800 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-[11px] text-neutral-400 font-medium">Inconsistências Identificadas</p>
                <div className="text-2xl font-bold font-mono text-rose-400 mt-0.5 flex items-baseline gap-2">
                  <span>{laudo.totalRiscoAlto} Alto Risco</span>
                  <span className="text-xs text-amber-400 font-normal">({laudo.totalAlertas} Alertas)</span>
                </div>
                <p className="text-[10px] text-neutral-400 mt-1">Potencial auto de infração / glosa</p>
              </div>
              <div className="p-2.5 rounded-full bg-rose-950/40 border border-rose-800/50 text-rose-400">
                <XCircle size={24} />
              </div>
            </div>
          </div>

          {/* Barra de Busca e Filtros */}
          <div className="p-3 bg-[#181818] border border-neutral-800 rounded-lg flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setFiltroRisco('TODOS')}
                className={`px-3 py-1 rounded text-xs font-medium transition ${
                  filtroRisco === 'TODOS'
                    ? 'bg-neutral-200 text-neutral-900 font-bold'
                    : 'bg-[#222] text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Todas ({laudo.totalRegrasAnalisadas})
              </button>
              <button
                onClick={() => setFiltroRisco('CONCILIADO')}
                className={`px-3 py-1 rounded text-xs font-medium transition ${
                  filtroRisco === 'CONCILIADO'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-[#222] text-emerald-400 hover:bg-emerald-950/50'
                }`}
              >
                Conciliadas ({laudo.totalConformes})
              </button>
              <button
                onClick={() => setFiltroRisco('ALERTA_LEVE')}
                className={`px-3 py-1 rounded text-xs font-medium transition ${
                  filtroRisco === 'ALERTA_LEVE'
                    ? 'bg-amber-600 text-white font-bold'
                    : 'bg-[#222] text-amber-400 hover:bg-amber-950/50'
                }`}
              >
                Alertas Leves ({laudo.totalAlertas})
              </button>
              <button
                onClick={() => setFiltroRisco('MALHA_FINA_ALTO_RISCO')}
                className={`px-3 py-1 rounded text-xs font-medium transition ${
                  filtroRisco === 'MALHA_FINA_ALTO_RISCO'
                    ? 'bg-rose-600 text-white font-bold'
                    : 'bg-[#222] text-rose-400 hover:bg-rose-950/50'
                }`}
              >
                Alto Risco ({laudo.totalRiscoAlto})
              </button>
            </div>

            <div className="relative min-w-[260px]">
              <Search size={14} className="absolute left-2.5 top-2.5 text-neutral-500" />
              <input
                type="text"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                placeholder="Filtrar por regra, obrigação ou código..."
                className="w-full bg-[#1e1e1e] border border-neutral-700 rounded pl-8 pr-3 py-1 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Lista de Regras Cruzadas */}
          <div className="space-y-3">
            {regrasFiltradas.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500 bg-[#181818] border border-neutral-800 rounded-lg">
                Nenhuma regra corresponde aos filtros selecionados.
              </div>
            ) : (
              regrasFiltradas.map(item => {
                const isExpanded = expandedRegraId === item.id;
                return (
                  <div
                    key={item.id}
                    className={`border rounded-lg transition overflow-hidden ${
                      item.nivelRisco === 'MALHA_FINA_ALTO_RISCO'
                        ? 'border-rose-800/70 bg-[#1c1414]'
                        : item.nivelRisco === 'ALERTA_LEVE'
                        ? 'border-amber-800/70 bg-[#1c1914]'
                        : 'border-neutral-800 bg-[#181818]'
                    }`}
                  >
                    <div
                      onClick={() => setExpandedRegraId(isExpanded ? null : item.id)}
                      className="p-3.5 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-neutral-800/30 select-none"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-[300px]">
                        <div className="mt-0.5">
                          {item.nivelRisco === 'CONCILIADO' ? (
                            <CheckCircle2 size={18} className="text-emerald-400" />
                          ) : item.nivelRisco === 'ALERTA_LEVE' ? (
                            <AlertTriangle size={18} className="text-amber-400" />
                          ) : (
                            <ShieldAlert size={18} className="text-rose-400" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                              {item.codigoRegra}
                            </span>
                            <h3 className="text-xs font-bold text-neutral-100">
                              {item.titulo}
                            </h3>
                          </div>
                          {item.descricao && (
                            <p className="text-[11px] text-neutral-400 mt-1 line-clamp-1">
                              {item.descricao}
                            </p>
                          )}
                          <div className="flex items-center gap-1.5 mt-2">
                            {item.obrigacoesEnvolvidas.map(ob => (
                              <span
                                key={ob}
                                className="text-[10px] px-2 py-0.5 rounded bg-[#252525] text-neutral-300 border border-neutral-700 font-mono"
                              >
                                {ob}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Valores Cruzados */}
                      <div className="flex items-center gap-6 text-xs">
                        <div className="text-right">
                          <p className="text-[10px] text-neutral-500 font-mono truncate max-w-[150px]">{item.rotuloOrigemA}</p>
                          <p className="font-mono font-bold text-neutral-200">
                            R$ {item.valorOrigemA.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>

                        <div className="text-neutral-500">
                          <ArrowRightLeft size={14} />
                        </div>

                        <div className="text-right">
                          <p className="text-[10px] text-neutral-500 font-mono truncate max-w-[150px]">{item.rotuloOrigemB}</p>
                          <p className="font-mono font-bold text-neutral-200">
                            R$ {item.valorOrigemB.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>

                        <div className="text-right min-w-[90px]">
                          <p className="text-[10px] text-neutral-500 font-mono">Divergência</p>
                          <p className={`font-mono font-bold ${item.diferenca > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                            R$ {item.diferenca.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>

                        <div className="min-w-[110px] text-center">
                          <span className={`inline-block px-2.5 py-1 rounded text-[11px] font-bold tracking-wider ${
                            item.nivelRisco === 'CONCILIADO'
                              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                              : item.nivelRisco === 'ALERTA_LEVE'
                              ? 'bg-amber-950/60 text-amber-300 border border-amber-800'
                              : 'bg-rose-950/60 text-rose-300 border border-rose-800 animate-pulse'
                          }`}>
                            {item.nivelRisco === 'CONCILIADO' ? 'CONCILIADO' : item.nivelRisco === 'ALERTA_LEVE' ? 'ALERTA' : 'ALTO RISCO'}
                          </span>
                        </div>

                        <div className="text-neutral-400">
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </div>
                    </div>

                    {/* Detalhes Expandidos (Diagnóstico, Fundamento e Recomendação) */}
                    {isExpanded && (
                      <div className="p-4 border-t border-neutral-800/80 bg-neutral-900/60 space-y-3 text-xs">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-3 bg-[#161616] border border-neutral-800 rounded">
                            <div className="flex items-center gap-1.5 font-bold text-neutral-300 mb-1">
                              <BookOpen size={14} className="text-blue-400" />
                              Fundamentação Legal e Instruções RFB
                            </div>
                            <p className="text-neutral-400 leading-relaxed">
                              {item.fundamentoLegal}
                            </p>
                          </div>

                          <div className="p-3 bg-[#161616] border border-neutral-800 rounded">
                            <div className="flex items-center gap-1.5 font-bold text-neutral-300 mb-1">
                              <Scale size={14} className="text-amber-400" />
                              Diagnóstico Pericial e Ação Preventiva
                            </div>
                            <p className="text-neutral-300 leading-relaxed">
                              {item.recomendacao}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
                          <span>Discrepância relativa: {item.percentualDiferenca.toFixed(2)}%</span>
                          <span>Código Interno de Auditoria: {item.id}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
