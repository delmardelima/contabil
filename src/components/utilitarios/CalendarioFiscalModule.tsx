import React, { useState, useMemo } from 'react';
import { Empresa, ObrigacaoFiscal, EsferaObrigacao, StatusObrigacao } from '../../types/contabil';
import { dbService } from '../../db/sqliteService';
import { ReportPrintPreviewModal } from '../layout/ReportPrintPreviewModal';
import { exportToCSV } from '../../utils/exportUtils';
import { 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Printer, 
  FileSpreadsheet, 
  Filter, 
  Search, 
  Building2, 
  ShieldCheck, 
  ExternalLink, 
  Copy, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Send,
  AlertCircle,
  Tag
} from 'lucide-react';

interface CalendarioFiscalModuleProps {
  empresa: Empresa;
}

export const CalendarioFiscalModule: React.FC<CalendarioFiscalModuleProps> = ({ empresa }) => {
  const [modoVisualizacao, setModoVisualizacao] = useState<'CALENDARIO' | 'CHECKLIST'>('CALENDARIO');
  const [filtroEsfera, setFiltroEsfera] = useState<'TODAS' | EsferaObrigacao>('TODAS');
  const [filtroStatus, setFiltroStatus] = useState<'TODOS' | StatusObrigacao>('TODOS');
  const [buscaTexto, setBuscaTexto] = useState<string>('');
  
  // Estado de Obrigações
  const [obrigacoes, setObrigacoes] = useState<ObrigacaoFiscal[]>(() => {
    return dbService.getObrigacoesFiscais(empresa.id, empresa.competenciaAtiva);
  });
  
  const [diaSelecionado, setDiaSelecionado] = useState<number | null>(20);
  const [selectedObrigacao, setSelectedObrigacao] = useState<ObrigacaoFiscal | null>(null);
  
  // Modais
  const [modalTransmitirOpen, setModalTransmitirOpen] = useState<boolean>(false);
  const [protocoloInput, setProtocoloInput] = useState<string>('');
  const [reciboInput, setReciboInput] = useState<string>('');
  const [mensagemSucesso, setMensagemSucesso] = useState<string>('');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // Ano e Mês da Competência
  const [anoStr, mesStr] = empresa.competenciaAtiva.split('-');
  const ano = parseInt(anoStr) || 2026;
  const mes = parseInt(mesStr) || 10;

  // Filtragem
  const obrigacoesFiltradas = useMemo(() => {
    return obrigacoes.filter(o => {
      const matchEsfera = filtroEsfera === 'TODAS' || o.esfera === filtroEsfera;
      const matchStatus = filtroStatus === 'TODOS' || o.status === filtroStatus;
      const matchTexto = !buscaTexto.trim() || 
        o.sigla.toLowerCase().includes(buscaTexto.toLowerCase()) || 
        o.nome.toLowerCase().includes(buscaTexto.toLowerCase()) ||
        (o.responsavel && o.responsavel.toLowerCase().includes(buscaTexto.toLowerCase()));
      return matchEsfera && matchStatus && matchTexto;
    });
  }, [obrigacoes, filtroEsfera, filtroStatus, buscaTexto]);

  // Totais Executivos
  const totais = useMemo(() => {
    const total = obrigacoes.length;
    const entregues = obrigacoes.filter(o => o.status === 'ENTREGUE').length;
    const aVencer = obrigacoes.filter(o => o.status === 'A_VENCER').length;
    const emAtraso = obrigacoes.filter(o => o.status === 'EM_ATRASO').length;
    const valorTotal = obrigacoes.reduce((acc, o) => acc + (o.valorEstimado || 0), 0);
    return { total, entregues, aVencer, emAtraso, valorTotal };
  }, [obrigacoes]);

  // Transmissão / Conclusão
  const handleConfirmarTransmissao = () => {
    if (!selectedObrigacao) return;
    const prot = protocoloInput.trim() || `REC-${Date.now().toString().slice(-8)}`;
    const rec = reciboInput.trim() || `PROT-${ano}${mes}-${Math.floor(Math.random() * 900000 + 100000)}`;

    dbService.marcarObrigacaoEntregue(selectedObrigacao.id, prot, rec);
    setObrigacoes(dbService.getObrigacoesFiscais(empresa.id, empresa.competenciaAtiva));
    setModalTransmitirOpen(false);
    setSelectedObrigacao(null);
    setProtocoloInput('');
    setReciboInput('');
    setMensagemSucesso(`Obrigação ${selectedObrigacao.sigla} marcada como transmitida com sucesso! Protocolo: ${prot}`);
    setTimeout(() => setMensagemSucesso(''), 5000);
  };

  // Exportar Checklist para CSV
  const handleExportarCSV = () => {
    const headers = ['Sigla', 'Obrigação', 'Esfera', 'Vencimento', 'Valor (R$)', 'Status', 'Protocolo', 'Responsável'];
    const rows = obrigacoesFiltradas.map(o => [
      o.sigla,
      o.nome,
      o.esfera,
      o.dataVencimento,
      o.valorEstimado || 0,
      o.status,
      o.protocoloTransmissao || '-',
      o.responsavel || '-'
    ]);
    exportToCSV(`Calendario_Fiscal_${empresa.competenciaAtiva}`, rows, headers);
  };

  // Dias do mês atual para o Calendário
  const diasNoMes = new Date(ano, mes, 0).getDate();
  const primeiroDiaSemana = new Date(ano, mes - 1, 1).getDay(); // 0: Dom, 1: Seg...

  // Mapeia obrigações por dia
  const mapaDiasObrigacoes = useMemo(() => {
    const map = new Map<number, ObrigacaoFiscal[]>();
    for (const o of obrigacoes) {
      const dia = parseInt(o.dataVencimento.split('-')[2]);
      if (dia) {
        const cur = map.get(dia) || [];
        cur.push(o);
        map.set(dia, cur);
      }
    }
    return map;
  }, [obrigacoes]);

  const obrigacoesDoDiaSelecionado = diaSelecionado ? (mapaDiasObrigacoes.get(diaSelecionado) || []) : [];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#141414] text-neutral-200 overflow-hidden select-none font-sans">
      {/* 1. Header do Módulo */}
      <div className="px-5 py-3.5 bg-[#181818] border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-neutral-100 flex items-center space-x-2">
              <span>Controle de Obrigações Acessórias & Calendário Fiscal</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-mono font-medium border border-amber-500/30">
                Competência: {empresa.competenciaAtiva}
              </span>
            </h2>
            <p className="text-[11px] text-neutral-400">
              {empresa.razaoSocial} • Gestão de Prazos Tributários, Previdenciários e Trabalhistas
            </p>
          </div>
        </div>

        {/* Controles de Ação e Alternância de Modo */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-[#101010] p-0.5 rounded-lg border border-white/10 text-xs">
            <button
              onClick={() => setModoVisualizacao('CALENDARIO')}
              className={`px-3 py-1 rounded font-medium transition ${
                modoVisualizacao === 'CALENDARIO' ? 'bg-amber-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Calendário Mensal
            </button>
            <button
              onClick={() => setModoVisualizacao('CHECKLIST')}
              className={`px-3 py-1 rounded font-medium transition ${
                modoVisualizacao === 'CHECKLIST' ? 'bg-amber-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Checklist / Prazos
            </button>
          </div>

          <button
            onClick={handleExportarCSV}
            className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-white/10 hover:bg-neutral-800 text-xs font-medium text-neutral-300 hover:text-white transition flex items-center space-x-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition flex items-center space-x-1.5 shadow-md shadow-amber-900/30"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Checklist A4</span>
          </button>
        </div>
      </div>

      {/* 2. Banner de Mensagem de Sucesso */}
      {mensagemSucesso && (
        <div className="px-5 py-2.5 bg-emerald-950/80 border-b border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{mensagemSucesso}</span>
          </div>
          <button onClick={() => setMensagemSucesso('')} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* 3. KPI Cards Executivos */}
      <div className="px-5 py-3 bg-[#161616] border-b border-white/10 grid grid-cols-5 gap-3">
        <div className="p-2.5 bg-[#1b1b1b] border border-white/10 rounded-xl">
          <span className="text-[10px] text-neutral-400 uppercase font-semibold">Total de Obrigações</span>
          <p className="text-lg font-bold font-mono text-neutral-100 mt-0.5">{totais.total}</p>
          <span className="text-[10px] text-neutral-500 font-mono">No mês de {empresa.competenciaAtiva}</span>
        </div>

        <div className="p-2.5 bg-[#1b1b1b] border border-white/10 rounded-xl">
          <span className="text-[10px] text-neutral-400 uppercase font-semibold">A Vencer / No Prazo</span>
          <p className="text-lg font-bold font-mono text-amber-400 mt-0.5">{totais.aVencer}</p>
          <span className="text-[10px] text-neutral-500 font-mono">Prazos regulares</span>
        </div>

        <div className="p-2.5 bg-[#1b1b1b] border border-white/10 rounded-xl">
          <span className="text-[10px] text-neutral-400 uppercase font-semibold">Transmitidas / Entregues</span>
          <p className="text-lg font-bold font-mono text-emerald-400 mt-0.5">{totais.entregues}</p>
          <span className="text-[10px] text-neutral-500 font-mono">Com recibo e protocolo</span>
        </div>

        <div className="p-2.5 bg-[#1b1b1b] border border-white/10 rounded-xl">
          <span className="text-[10px] text-neutral-400 uppercase font-semibold">Pendentes / Em Atraso</span>
          <p className="text-lg font-bold font-mono text-rose-400 mt-0.5">{totais.emAtraso}</p>
          <span className="text-[10px] text-neutral-500 font-mono">Atenção imediata</span>
        </div>

        <div className="p-2.5 bg-[#1b1b1b] border border-white/10 rounded-xl">
          <span className="text-[10px] text-neutral-400 uppercase font-semibold">Total Tributário Estimado</span>
          <p className="text-lg font-bold font-mono text-neutral-100 mt-0.5">
            R$ {totais.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-neutral-500 font-mono">Guias da competência</span>
        </div>
      </div>

      {/* 4. Barra de Filtros */}
      <div className="px-5 py-2.5 bg-[#171717] border-b border-white/10 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 bg-neutral-900 border border-white/10 px-2.5 py-1 rounded-md">
            <Search className="w-3.5 h-3.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar por sigla, nome ou responsável..."
              value={buscaTexto}
              onChange={(e) => setBuscaTexto(e.target.value)}
              className="bg-transparent text-neutral-200 outline-none w-64 text-xs"
            />
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-neutral-400">Esfera:</span>
            <select
              value={filtroEsfera}
              onChange={(e) => setFiltroEsfera(e.target.value as any)}
              className="bg-neutral-900 border border-white/10 rounded px-2 py-1 text-neutral-200 outline-none text-xs"
            >
              <option value="TODAS">Todas as Esferas</option>
              <option value="FEDERAL">Federal (RFB)</option>
              <option value="ESTADUAL">Estadual (SEFAZ)</option>
              <option value="MUNICIPAL">Municipal (Prefeitura)</option>
              <option value="TRABALHISTA">Trabalhista (MTE / CEF)</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-neutral-400">Status:</span>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value as any)}
              className="bg-neutral-900 border border-white/10 rounded px-2 py-1 text-neutral-200 outline-none text-xs"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="A_VENCER">A Vencer</option>
              <option value="VENCE_HOJE">Vence Hoje</option>
              <option value="EM_ATRASO">Em Atraso</option>
              <option value="ENTREGUE">Entregues</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5. Conteúdo: CALENDÁRIO MENSAL vs CHECKLIST */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4">
        {modoVisualizacao === 'CALENDARIO' ? (
          <div className="grid grid-cols-3 gap-5">
            {/* Grade do Calendário Mensal (2 Colunas) */}
            <div className="col-span-2 bg-[#181818] border border-white/10 rounded-xl p-4 shadow-lg space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h3 className="font-bold text-sm text-neutral-100 flex items-center space-x-2">
                  <span>Outubro de {ano}</span>
                  <span className="text-xs text-neutral-400 font-normal">({diasNoMes} dias)</span>
                </h3>
                <div className="flex items-center space-x-3 text-[11px] font-mono">
                  <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-amber-400" /><span>A Vencer</span></span>
                  <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /><span>Entregue</span></span>
                  <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-rose-400" /><span>Atraso</span></span>
                </div>
              </div>

              {/* Dias da Semana */}
              <div className="grid grid-cols-7 gap-1 text-center font-semibold text-[11px] text-neutral-400 uppercase py-1">
                <span>Dom</span>
                <span>Seg</span>
                <span>Ter</span>
                <span>Qua</span>
                <span>Qui</span>
                <span>Sex</span>
                <span>Sáb</span>
              </div>

              {/* Grid dos Dias */}
              <div className="grid grid-cols-7 gap-1.5 font-mono text-xs">
                {/* Espaços vazios do início */}
                {Array.from({ length: primeiroDiaSemana }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="h-20 bg-neutral-900/20 rounded-lg border border-transparent" />
                ))}

                {/* Dias do Mês */}
                {Array.from({ length: diasNoMes }).map((_, idx) => {
                  const dia = idx + 1;
                  const obsDoDia = mapaDiasObrigacoes.get(dia) || [];
                  const isSelected = diaSelecionado === dia;
                  const hasObs = obsDoDia.length > 0;

                  return (
                    <div
                      key={dia}
                      onClick={() => setDiaSelecionado(dia)}
                      className={`h-20 p-1.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected 
                          ? 'bg-blue-950/40 border-blue-500 shadow-md ring-1 ring-blue-500/50' 
                          : hasObs 
                            ? 'bg-neutral-900/90 border-white/15 hover:border-white/30' 
                            : 'bg-neutral-900/40 border-white/5 hover:bg-neutral-900/70'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className={`text-xs font-bold ${isSelected ? 'text-blue-400' : 'text-neutral-300'}`}>
                          {dia}
                        </span>
                        {hasObs && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1 py-0.2 rounded font-semibold">
                            {obsDoDia.length}
                          </span>
                        )}
                      </div>

                      {/* Badges de Obrigações no dia */}
                      <div className="space-y-0.5 overflow-hidden">
                        {obsDoDia.slice(0, 2).map(o => (
                          <div 
                            key={o.id} 
                            className={`text-[9px] px-1 py-0.5 rounded truncate font-sans font-semibold flex items-center justify-between ${
                              o.status === 'ENTREGUE' 
                                ? 'bg-emerald-500/20 text-emerald-300' 
                                : o.status === 'EM_ATRASO' 
                                  ? 'bg-rose-500/20 text-rose-300' 
                                  : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            <span>{o.sigla}</span>
                          </div>
                        ))}
                        {obsDoDia.length > 2 && (
                          <span className="text-[8px] text-neutral-500 block text-right font-sans">
                            +{obsDoDia.length - 2} mais
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Painel Lateral: Obrigações do Dia Selecionado */}
            <div className="bg-[#181818] border border-white/10 rounded-xl p-4 shadow-lg space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-200">
                    Prazos do Dia {diaSelecionado ? `${diaSelecionado}/${mes}/${ano}` : 'Selecionado'}
                  </h3>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    {obrigacoesDoDiaSelecionado.length} item(ns)
                  </span>
                </div>

                <div className="pt-2 space-y-3 overflow-y-auto max-h-[460px] custom-scrollbar">
                  {obrigacoesDoDiaSelecionado.map(o => (
                    <div 
                      key={o.id} 
                      className="p-3 bg-neutral-900 rounded-xl border border-white/10 space-y-2 hover:border-white/20 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-neutral-100 flex items-center space-x-1.5">
                          <Tag className="w-3.5 h-3.5 text-amber-400" />
                          <span>{o.sigla}</span>
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          o.status === 'ENTREGUE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {o.status === 'ENTREGUE' ? 'ENTREGUE' : 'A VENCER'}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-300 font-medium leading-snug">{o.nome}</p>

                      <div className="text-[11px] font-mono text-neutral-400 space-y-0.5 pt-1 border-t border-white/5">
                        <div className="flex justify-between">
                          <span>Esfera:</span>
                          <span className="text-neutral-200 font-semibold">{o.esfera}</span>
                        </div>
                        {o.valorEstimado ? (
                          <div className="flex justify-between">
                            <span>Valor Previsto:</span>
                            <span className="text-emerald-400 font-bold">R$ {o.valorEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                        ) : null}
                        {o.protocoloTransmissao ? (
                          <div className="flex justify-between text-neutral-400">
                            <span>Protocolo:</span>
                            <span className="text-neutral-300 font-mono text-[10px] truncate max-w-xs">{o.protocoloTransmissao}</span>
                          </div>
                        ) : null}
                      </div>

                      {/* Ações do Card */}
                      <div className="pt-2 flex items-center justify-end space-x-2">
                        {o.status !== 'ENTREGUE' ? (
                          <button
                            onClick={() => {
                              setSelectedObrigacao(o);
                              setModalTransmitirOpen(true);
                            }}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold flex items-center space-x-1"
                          >
                            <Send className="w-3 h-3" />
                            <span>Informar Protocolo</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-400 font-mono flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Entregue em {o.dataTransmissao}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {obrigacoesDoDiaSelecionado.length === 0 && (
                    <div className="py-12 text-center text-neutral-500 text-xs">
                      Nenhum vencimento fiscal ou trabalhista cadastrado para este dia.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* MODO CHECKLIST / TABELA DETALHADA */
          <div className="bg-[#181818] border border-white/10 rounded-xl overflow-hidden shadow-lg">
            <div className="p-3 bg-neutral-900 border-b border-white/10 flex items-center justify-between text-xs font-semibold text-neutral-300">
              <span>CHECKLIST DE OBRIGAÇÕES FISCAIS, TRIBUTÁRIAS E SOCIAIS (COMPETÊNCIA {empresa.competenciaAtiva})</span>
              <span className="font-mono text-neutral-500">Total: {obrigacoesFiltradas.length} obrigações</span>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-neutral-900/60 border-b border-white/10 text-neutral-400 font-medium text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 w-28">Sigla</th>
                  <th className="py-2.5 px-3">Descrição da Obrigação</th>
                  <th className="py-2.5 px-3 w-28 text-center">Esfera</th>
                  <th className="py-2.5 px-3 w-24">Vencimento</th>
                  <th className="py-2.5 px-3 w-28 text-right">Valor Guia (R$)</th>
                  <th className="py-2.5 px-3 w-32 text-center">Status</th>
                  <th className="py-2.5 px-3 w-40">Protocolo / Recibo</th>
                  <th className="py-2.5 px-3 w-28 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {obrigacoesFiltradas.map(o => (
                  <tr key={o.id} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 px-3 font-mono font-bold text-neutral-100 flex items-center space-x-1.5">
                      <Tag className="w-3.5 h-3.5 text-amber-400" />
                      <span>{o.sigla}</span>
                    </td>
                    <td className="py-2.5 px-3 text-neutral-200">
                      <span className="font-medium block">{o.nome}</span>
                      <span className="text-[10px] text-neutral-500 font-mono">Resp: {o.responsavel || 'Equipe Fiscal'}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-neutral-800 text-neutral-300 border border-white/10">
                        {o.esfera}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-neutral-300">
                      {new Date(o.dataVencimento + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                      {o.valorEstimado ? `R$ ${o.valorEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        o.status === 'ENTREGUE'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : o.status === 'EM_ATRASO'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {o.status === 'ENTREGUE' ? 'ENTREGUE' : o.status === 'EM_ATRASO' ? 'ATRASADO' : 'A VENCER'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-neutral-400 truncate max-w-xs">
                      {o.protocoloTransmissao ? (
                        <div>
                          <span className="text-neutral-200 font-semibold block truncate">{o.protocoloTransmissao}</span>
                          <span className="text-[10px] text-neutral-500">Transm: {o.dataTransmissao}</span>
                        </div>
                      ) : (
                        <span className="text-neutral-600 italic">Pendente envio</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {o.status !== 'ENTREGUE' ? (
                        <button
                          onClick={() => {
                            setSelectedObrigacao(o);
                            setModalTransmitirOpen(true);
                          }}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-medium"
                        >
                          Entregar
                        </button>
                      ) : (
                        <span className="text-emerald-400 font-bold text-xs">✓</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. MODAL TRANSMITIR / MARCAR COMO ENTREGUE */}
      {modalTransmitirOpen && selectedObrigacao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#181818] border border-white/10 rounded-xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-sm font-bold text-neutral-100 flex items-center space-x-2">
                <Send className="w-4 h-4 text-emerald-400" />
                <span>Confirmar Entrega / Transmissão</span>
              </h3>
              <button onClick={() => setModalTransmitirOpen(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <div className="text-xs space-y-3 font-sans">
              <div className="p-3 bg-neutral-900 rounded-lg border border-white/5 space-y-1">
                <span className="text-xs font-bold text-neutral-200 block">{selectedObrigacao.sigla} - {selectedObrigacao.nome}</span>
                <span className="text-[11px] text-neutral-400 font-mono block">Vencimento: {selectedObrigacao.dataVencimento}</span>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Número do Protocolo Oficial Receitanet / eSocial</label>
                <input
                  type="text"
                  placeholder="Ex: ECD-SP-2026-9876543210-99"
                  value={protocoloInput}
                  onChange={(e) => setProtocoloInput(e.target.value)}
                  className="w-full bg-neutral-900 border border-white/10 rounded p-2 text-neutral-100 font-mono outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Número do Recibo / Autenticação Bancária</label>
                <input
                  type="text"
                  placeholder="Ex: REC-3526-8877665544"
                  value={reciboInput}
                  onChange={(e) => setReciboInput(e.target.value)}
                  className="w-full bg-neutral-900 border border-white/10 rounded p-2 text-neutral-100 font-mono outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2 border-t border-white/10">
              <button
                onClick={() => setModalTransmitirOpen(false)}
                className="px-3 py-1.5 rounded bg-neutral-800 text-neutral-300 hover:text-white text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarTransmissao}
                className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-900/40"
              >
                Confirmar Transmissão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL PRINT PREVIEW CHECKLIST A4 */}
      <ReportPrintPreviewModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        empresa={empresa}
        tituloRelatorio="CHECKLIST OFICIAL DE CUMPRIMENTO DE OBRIGAÇÕES FISCAIS E SOCIAIS"
        subtitulo={`Demonstrativo de Conformidade Tributária e Trabalhista • Competência ${empresa.competenciaAtiva}`}
        periodo={`Competência: ${empresa.competenciaAtiva}`}
        orientacaoPadrao="landscape"
      >
        <div className="space-y-4">
          <table className="w-full text-left text-[9px] border-collapse">
            <thead>
              <tr className="border-b-2 border-neutral-900 font-bold uppercase">
                <th className="py-1 px-2">Sigla</th>
                <th className="py-1 px-2">Obrigação Acessória / Guia</th>
                <th className="py-1 px-1 text-center">Esfera</th>
                <th className="py-1 px-2">Vencimento</th>
                <th className="py-1 px-2 text-right">Valor Estimado (R$)</th>
                <th className="py-1 px-2 text-center">Status</th>
                <th className="py-1 px-2">Protocolo de Envio</th>
                <th className="py-1 px-2">Responsável</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {obrigacoesFiltradas.map(o => (
                <tr key={o.id}>
                  <td className="py-1 px-2 font-mono font-bold">{o.sigla}</td>
                  <td className="py-1 px-2">{o.nome}</td>
                  <td className="py-1 px-1 text-center font-mono">{o.esfera}</td>
                  <td className="py-1 px-2 font-mono">{new Date(o.dataVencimento + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                  <td className="py-1 px-2 text-right font-mono font-bold">
                    {o.valorEstimado ? o.valorEstimado.toFixed(2) : '-'}
                  </td>
                  <td className="py-1 px-2 text-center font-bold">
                    {o.status === 'ENTREGUE' ? 'ENTREGUE' : 'A VENCER'}
                  </td>
                  <td className="py-1 px-2 font-mono text-[8px]">{o.protocoloTransmissao || '-'}</td>
                  <td className="py-1 px-2">{o.responsavel || '-'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-neutral-900 font-bold font-mono text-[9px]">
                <td colSpan={4} className="py-1.5 px-2 text-right uppercase">TOTAL TRIBUTÁRIO ESTIMADO:</td>
                <td className="py-1.5 px-2 text-right">R$ {totais.valorTotal.toFixed(2)}</td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </ReportPrintPreviewModal>
    </div>
  );
};
