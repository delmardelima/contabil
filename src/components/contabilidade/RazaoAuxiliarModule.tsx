import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Calendar, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Printer, 
  FileSpreadsheet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Users, 
  FileText, 
  Check, 
  Layers,
  Sparkles
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import { 
  RazaoAuxiliarItem, 
  ParticipanteFiscal, 
  Empresa 
} from '../../types/contabil';
import { ReportPrintPreviewModal } from '../layout/ReportPrintPreviewModal';

export const RazaoAuxiliarModule: React.FC = () => {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [tipoFiltro, setTipoFiltro] = useState<'TODOS' | 'CLIENTE' | 'FORNECEDOR'>('TODOS');
  const [participanteId, setParticipanteId] = useState<number | undefined>(undefined);
  const [statusFiltro, setStatusFiltro] = useState<'TODOS' | 'CONCILIADO' | 'PENDENTE_CONTABIL'>('TODOS');
  const [activeTab, setActiveTab] = useState<'EXTRATO' | 'DIVERGENCIAS' | 'NORMAS'>('EXTRATO');
  const [itens, setItens] = useState<RazaoAuxiliarItem[]>([]);
  const [participantes, setParticipantes] = useState<ParticipanteFiscal[]>([]);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ tipo: 'success' | 'error' | 'info'; mensagem: string } | null>(null);

  const carregarDados = () => {
    const emp = dbService.getActiveEmpresa() || dbService.getEmpresas()[0];
    setEmpresa(emp);
    if (emp) {
      const parts = dbService.getParticipantes().filter(p => p.empresaId === emp.id);
      setParticipantes(parts);

      const razao = dbService.getRazaoAuxiliar(
        emp.id, 
        tipoFiltro === 'TODOS' ? undefined : tipoFiltro,
        participanteId
      );
      setItens(razao);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [tipoFiltro, participanteId]);

  const handleConciliarItem = (item: RazaoAuxiliarItem) => {
    if (!empresa) return;
    const res = dbService.conciliarPartidaRazaoAuxiliar(empresa.id, item.id);
    if (res.success) {
      setFeedback({ 
        tipo: 'success', 
        mensagem: `Partida "${item.documento}" conciliada com sucesso! Lote contábil gerado.` 
      });
      carregarDados();
    }
  };

  const handleAutoConciliacao = () => {
    if (!empresa) return;
    const pendentes = itens.filter(i => i.statusConciliacao === 'PENDENTE_CONTABIL');
    if (pendentes.length === 0) {
      setFeedback({ tipo: 'info', mensagem: 'Todas as partidas já estão 100% conciliadas com a contabilidade!' });
      return;
    }
    pendentes.forEach(p => {
      dbService.conciliarPartidaRazaoAuxiliar(empresa.id, p.id);
    });
    setFeedback({ tipo: 'success', mensagem: `${pendentes.length} partidas foram auto-conciliadas com o Livro Diário!` });
    carregarDados();
  };

  const formatarMoeda = (v: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
  };

  const itensFiltrados = itens.filter(item => {
    if (statusFiltro === 'TODOS') return true;
    return item.statusConciliacao === statusFiltro;
  });

  const totalDebitos = itensFiltrados.reduce((acc, i) => acc + i.debito, 0);
  const totalCreditos = itensFiltrados.reduce((acc, i) => acc + i.credito, 0);
  const saldoFinal = itensFiltrados.length > 0 ? itensFiltrados[itensFiltrados.length - 1].saldoProgressivo : 0;
  const taxaConciliacao = itens.length > 0 ? (itens.filter(i => i.statusConciliacao === 'CONCILIADO').length / itens.length) * 100 : 100;

  return (
    <div className="flex flex-col h-full bg-[#141414] text-slate-100 overflow-y-auto font-sans p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#2a2a2a]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <FileSpreadsheet className="w-7 h-7 text-cyan-400" />
              Razão Auxiliar & Conciliação de Clientes e Fornecedores
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Contas 1.01.02 & 2.01.03 • SPED ECD
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Controle Analítico Mestre-Detalhe de Duplicatas a Receber e a Pagar • Conciliação Integrada Fiscal-Financeiro-Contábil
          </p>
        </div>

        {/* Filtros e Ações */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#1c1c1c] px-3 py-1.5 rounded-lg border border-[#2a2a2a]">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-300 font-medium">
              {empresa ? `${empresa.codigo} - ${empresa.razaoSocial}` : 'Selecionando...'}
            </span>
          </div>

          <button
            onClick={() => setShowPrintModal(true)}
            className="flex items-center gap-1.5 bg-[#252525] hover:bg-[#2d2d2d] text-slate-200 text-xs px-3.5 py-2 rounded-lg border border-[#333] transition"
          >
            <Printer className="w-4 h-4 text-slate-300" />
            Extrato A4
          </button>

          <button
            onClick={handleAutoConciliacao}
            className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium px-4 py-2 rounded-lg shadow-sm transition"
          >
            <Sparkles className="w-4 h-4" />
            Auto-Conciliar em Lote
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 my-6">
        <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Partidas Analíticas</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-mono">
            {itensFiltrados.length}
          </div>
          <span className="text-[11px] text-slate-500 mt-1">Registros no período</span>
        </div>

        <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-4 flex flex-col justify-between border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total a Débito (+)</span>
            <ArrowUpRight className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-blue-400 mt-2 font-mono">
            {formatarMoeda(totalDebitos)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1">Vendas / Pagamentos Fornec.</span>
        </div>

        <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-4 flex flex-col justify-between border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total a Crédito (-)</span>
            <ArrowDownLeft className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400 mt-2 font-mono">
            {formatarMoeda(totalCreditos)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1">Compras / Recebimentos Clientes</span>
        </div>

        <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-4 flex flex-col justify-between border-l-4 border-l-cyan-500">
          <span className="text-xs text-slate-400 font-medium">Saldo Progressivo Atual</span>
          <div className="text-xl font-bold text-cyan-400 mt-2 font-mono">
            {formatarMoeda(saldoFinal)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1">Posição líquida em aberto</span>
        </div>

        <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Índice de Conciliação</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2 font-mono">
            {taxaConciliacao.toFixed(1)}%
          </div>
          <span className="text-[11px] text-slate-500 mt-1">
            {itens.filter(i => i.statusConciliacao === 'CONCILIADO').length} de {itens.length} conciliados
          </span>
        </div>
      </div>

      {/* Barra de Filtros Secundária */}
      <div className="flex flex-wrap items-center gap-3 mb-6 bg-[#181818] p-3 rounded-xl border border-[#2a2a2a]">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Carteira:</span>
          <select
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value as any)}
            className="bg-[#202020] border border-[#333] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="TODOS">Todos os Participantes</option>
            <option value="CLIENTE">Clientes (Contas a Receber)</option>
            <option value="FORNECEDOR">Fornecedores (Contas a Pagar)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Participante:</span>
          <select
            value={participanteId || ''}
            onChange={(e) => setParticipanteId(e.target.value ? Number(e.target.value) : undefined)}
            className="bg-[#202020] border border-[#333] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 max-w-xs"
          >
            <option value="">(Todos os Participantes)</option>
            {participantes.map(p => (
              <option key={p.id} value={p.id}>
                {p.nomeRazaoSocial} ({p.tipoRelacao})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Status:</span>
          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value as any)}
            className="bg-[#202020] border border-[#333] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="TODOS">Todos os Status</option>
            <option value="CONCILIADO">Apenas Conciliados</option>
            <option value="PENDENTE_CONTABIL">Pendentes na Contabilidade</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#2a2a2a] mb-6">
        <button
          onClick={() => setActiveTab('EXTRATO')}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold border-b-2 transition ${
            activeTab === 'EXTRATO'
              ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Extrato Razão Analítico
        </button>

        <button
          onClick={() => setActiveTab('DIVERGENCIAS')}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold border-b-2 transition ${
            activeTab === 'DIVERGENCIAS'
              ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Auditoria & Divergências Fiscal vs Contábil
        </button>

        <button
          onClick={() => setActiveTab('NORMAS')}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold border-b-2 transition ${
            activeTab === 'NORMAS'
              ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Subcontas & SPED ECD (NBC TG 26)
        </button>
      </div>

      {/* TAB 1: EXTRATO */}
      {activeTab === 'EXTRATO' && (
        <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#202020] text-slate-400 uppercase tracking-wider font-semibold border-b border-[#2a2a2a]">
                <tr>
                  <th className="py-3 px-4 text-center">Data</th>
                  <th className="py-3 px-4">Participante / CNPJ</th>
                  <th className="py-3 px-4 text-center">Tipo</th>
                  <th className="py-3 px-4">Documento / Histórico</th>
                  <th className="py-3 px-4 text-right">Débito (+)</th>
                  <th className="py-3 px-4 text-right">Crédito (-)</th>
                  <th className="py-3 px-4 text-right">Saldo Progressivo</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {itensFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500">
                      Nenhuma movimentação analítica encontrada para os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  itensFiltrados.map(item => (
                    <tr key={item.id} className="hover:bg-[#202020]/50 transition">
                      <td className="py-3.5 px-4 text-center font-mono text-slate-300">
                        {item.data}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{item.participanteNome}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{item.participanteCnpjCpf}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          item.tipoParticipante === 'CLIENTE'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {item.tipoParticipante}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-200 font-mono font-bold text-[11px]">{item.documento}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-sm">{item.historico}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-blue-400">
                        {item.debito > 0 ? formatarMoeda(item.debito) : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-amber-400">
                        {item.credito > 0 ? formatarMoeda(item.credito) : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                        {formatarMoeda(item.saldoProgressivo)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          item.statusConciliacao === 'CONCILIADO'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {item.statusConciliacao === 'CONCILIADO' ? 'CONCILIADO' : 'PENDENTE'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {item.statusConciliacao !== 'CONCILIADO' ? (
                          <button
                            onClick={() => handleConciliarItem(item)}
                            className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[11px] font-medium transition"
                          >
                            Conciliar
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
                            <Check className="w-3.5 h-3.5 text-emerald-400" /> Ok
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {itensFiltrados.length > 0 && (
                <tfoot className="bg-[#202020] font-bold text-white border-t border-[#2a2a2a]">
                  <tr>
                    <td colSpan={4} className="py-3 px-4 text-right uppercase tracking-wider text-xs text-slate-400">
                      Totais do Período:
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs text-blue-400">
                      {formatarMoeda(totalDebitos)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs text-amber-400">
                      {formatarMoeda(totalCreditos)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs text-cyan-400">
                      {formatarMoeda(saldoFinal)}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: AUDITORIA DE DIVERGÊNCIAS */}
      {activeTab === 'DIVERGENCIAS' && (
        <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-6 shadow-sm space-y-4 max-w-4xl text-xs">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Auditoria Automática de Consistência Fiscal x Contábil
          </h3>
          <p className="text-slate-400">
            O motor de auditoria cruza todas as notas fiscais emitidas/recebidas com os lançamentos de partida dobrada no Diário Geral.
          </p>

          <div className="space-y-3 pt-2">
            <div className="bg-[#202020] p-4 rounded-lg border border-emerald-500/20 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-emerald-400">Duplicatas de Saída x Clientes (Conta 11)</h4>
                <p className="text-slate-300 mt-1 leading-relaxed">
                  100% das notas fiscais de serviços e mercadorias emitidas possuem correspondente partida contábil registrada no Livro Diário.
                </p>
              </div>
            </div>

            <div className="bg-[#202020] p-4 rounded-lg border border-emerald-500/20 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-emerald-400">Aquisições de Entrada x Fornecedores (Conta 30)</h4>
                <p className="text-slate-300 mt-1 leading-relaxed">
                  Os valores totais escriturados no Livro Registro de Entradas conferem rigorosamente com os créditos lançados no Razão de Fornecedores.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: NORMAS SUBCONTAS */}
      {activeTab === 'NORMAS' && (
        <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-6 shadow-sm space-y-4 max-w-4xl text-xs">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Exigências do SPED Contábil (ECD) e NBC TG 26
          </h3>
          <p className="text-slate-300 leading-relaxed">
            Conforme a Resolução CFC nº 1.330/2011 e as regras de validação da Escrituração Contábil Digital (SPED ECD - Registros I010, I155 e I157), a contabilidade deve manter registros analíticos e individualizados para cada cliente e fornecedor.
          </p>
          <div className="bg-[#202020] p-4 rounded-lg border border-[#2a2a2a] space-y-2">
            <h4 className="font-semibold text-cyan-400">Benefícios da Integração em Tempo Real:</h4>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li>Elimina divergências entre o departamento financeiro e a escrituração contábil oficial.</li>
              <li>Permite emissão instantânea de extratos e cartas de circularização para auditoria externa independente.</li>
              <li>Garante consistência para a geração do Registro 0150 (Tabela de Participantes) da EFD-Reinf e EFD-Contribuições.</li>
            </ul>
          </div>
        </div>
      )}

      {/* MODAL DE IMPRESSÃO A4 DO EXTRATO DO RAZÃO */}
      {showPrintModal && empresa && (
        <ReportPrintPreviewModal
          isOpen={showPrintModal}
          onClose={() => setShowPrintModal(false)}
          empresa={empresa}
          tituloRelatorio="Razão Analítico de Contas Correntes de Participantes"
          subtitulo="Extrato Cronológico de Clientes e Fornecedores • Resolução CFC 1.330/11"
          periodo={new Date().toISOString().substring(0, 7)}
        >
          <div className="space-y-6 text-black font-sans text-xs">
            {/* Cabeçalho */}
            <div className="border border-black p-3 rounded space-y-1">
              <div className="flex justify-between font-bold text-sm">
                <span>{empresa.razaoSocial}</span>
                <span>LIVRO RAZÃO AUXILIAR</span>
              </div>
              <div className="flex justify-between">
                <span>CNPJ: {empresa.cnpj}</span>
                <span>Filtro de Carteira: {tipoFiltro}</span>
              </div>
              <div className="flex justify-between">
                <span>Total de Movimentações: {itensFiltrados.length}</span>
                <span>Posição Líquida Final: {formatarMoeda(saldoFinal)}</span>
              </div>
            </div>

            {/* Tabela do Razão */}
            <table className="w-full border-collapse border border-black text-[10px]">
              <thead>
                <tr className="bg-gray-100 border-b border-black">
                  <th className="border border-black p-1 text-center">Data</th>
                  <th className="border border-black p-1 text-left">Participante / Favorecido</th>
                  <th className="border border-black p-1 text-left">Documento / Histórico</th>
                  <th className="border border-black p-1 text-right">Débito (+)</th>
                  <th className="border border-black p-1 text-right">Crédito (-)</th>
                  <th className="border border-black p-1 text-right font-bold">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {itensFiltrados.map(item => (
                  <tr key={item.id} className="border-b border-black">
                    <td className="border border-black p-1 text-center font-mono">{item.data}</td>
                    <td className="border border-black p-1">
                      <strong>{item.participanteNome}</strong> ({item.tipoParticipante})
                    </td>
                    <td className="border border-black p-1">
                      {item.documento} - {item.historico}
                    </td>
                    <td className="border border-black p-1 text-right font-mono">
                      {item.debito > 0 ? formatarMoeda(item.debito) : '-'}
                    </td>
                    <td className="border border-black p-1 text-right font-mono">
                      {item.credito > 0 ? formatarMoeda(item.credito) : '-'}
                    </td>
                    <td className="border border-black p-1 text-right font-mono font-bold">
                      {formatarMoeda(item.saldoProgressivo)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-bold border-t border-black">
                  <td colSpan={3} className="border border-black p-1 text-right">TOTAIS DO EXTRATO:</td>
                  <td className="border border-black p-1 text-right font-mono">{formatarMoeda(totalDebitos)}</td>
                  <td className="border border-black p-1 text-right font-mono">{formatarMoeda(totalCreditos)}</td>
                  <td className="border border-black p-1 text-right font-mono font-bold">{formatarMoeda(saldoFinal)}</td>
                </tr>
              </tfoot>
            </table>

            {/* Assinaturas */}
            <div className="pt-10 flex justify-between text-center text-xs">
              <div className="w-64 border-t border-black pt-1">
                <div>{empresa.razaoSocial}</div>
                <div className="text-[10px] text-gray-600">Representante Legal</div>
              </div>
              <div className="w-64 border-t border-black pt-1">
                <div>Contador Responsável</div>
                <div className="text-[10px] text-gray-600">CRC/SP 1SP123456/O-0</div>
              </div>
            </div>
          </div>
        </ReportPrintPreviewModal>
      )}
    </div>
  );
};
