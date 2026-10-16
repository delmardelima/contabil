import React, { useState, useMemo } from 'react';
import { 
  Empresa, 
  Colaborador,
  EspelhoPontoColaborador,
  MarcacaoPonto,
  TipoDiaPonto
} from '../../types/contabil';
import { dbService } from '../../db/sqliteService';
import { exportToCSV } from '../../utils/exportUtils';
import {
  Clock,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Calendar,
  Users,
  Zap,
  Info,
  Edit2,
  Plus,
  TrendingUp,
  TrendingDown,
  Moon,
  Coffee,
  Check,
  FileText
} from 'lucide-react';

interface PontoEletronicoModuleProps {
  empresa: Empresa;
  onOpenReportPreview?: (config: { titulo: string; subtitulo: string; conteudo: React.ReactNode }) => void;
  onIntegracaoSucesso?: () => void;
}

export const PontoEletronicoModule: React.FC<PontoEletronicoModuleProps> = ({
  empresa,
  onOpenReportPreview,
  onIntegracaoSucesso
}) => {
  const [competencia, setCompetencia] = useState(empresa.competenciaAtiva || '2026-10');
  const colaboradores = useMemo(() => dbService.getColaboradores(empresa.id), [empresa.id]);
  const [colaboradorSelecionadoId, setColaboradorSelecionadoId] = useState<number>(
    colaboradores[0]?.id || 1
  );

  const [notificacao, setNotificacao] = useState<{ tipo: 'success' | 'info'; mensagem: string } | null>(null);
  const [modalImportarAfd, setModalImportarAfd] = useState(false);
  const [textoAfd, setTextoAfd] = useState('');
  const [modalEditarDia, setModalEditarDia] = useState<MarcacaoPonto | null>(null);

  // Espelho de ponto calculado pelo motor do banco
  const espelho: EspelhoPontoColaborador = useMemo(() => {
    return dbService.getEspelhoPontoColaborador(colaboradorSelecionadoId, competencia);
  }, [colaboradorSelecionadoId, competencia]);

  const colaboradorAtual = useMemo(() => {
    return colaboradores.find(c => c.id === colaboradorSelecionadoId) || colaboradores[0];
  }, [colaboradores, colaboradorSelecionadoId]);

  // Integração com a Folha de Pagamento
  const handleIntegrarFolha = () => {
    const res = dbService.integrarVariaveisPontoFolha(empresa.id, competencia);
    if (res.sucesso) {
      setNotificacao({
        tipo: 'success',
        mensagem: res.mensagem
      });
      onIntegracaoSucesso?.();
    } else {
      setNotificacao({
        tipo: 'info',
        mensagem: 'Erro ao integrar variáveis de ponto à folha.'
      });
    }
    setTimeout(() => setNotificacao(null), 5000);
  };

  // Processar Importação AFD
  const handleProcessarAfd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textoAfd.trim()) return;

    const res = dbService.importarArquivoAfd(empresa.id, competencia, textoAfd);
    setModalImportarAfd(false);
    setTextoAfd('');
    setNotificacao({
      tipo: 'success',
      mensagem: res.mensagem
    });
    setTimeout(() => setNotificacao(null), 5000);
  };

  // Salvar Edição Manual de Ponto
  const handleSalvarEdicaoDia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalEditarDia) return;

    dbService.salvarMarcacaoPonto(modalEditarDia);
    setModalEditarDia(null);
    setNotificacao({
      tipo: 'success',
      mensagem: `Batida de ${modalEditarDia.data} atualizada com sucesso!`
    });
    setTimeout(() => setNotificacao(null), 4000);
  };

  // Exportar CSV
  const handleExportarCSV = () => {
    const dados = espelho.dias.map(d => ({
      Data: d.data,
      DiaSemana: d.diaSemana,
      TipoDia: d.diaTipo,
      Entrada1: d.entrada1,
      Saida1: d.saida1,
      Entrada2: d.entrada2,
      Saida2: d.saida2,
      MinutosTrabalhados: d.horasTrabalhadasMinutos,
      MinutosPrevistos: d.horasPrevistasMinutos,
      SaldoMinutos: d.saldoMinutos,
      HorasExtras50Minutos: d.horasExtras50Minutos,
      HorasExtras100Minutos: d.horasExtras100Minutos,
      AdicionalNoturnoMinutos: d.adicionalNoturnoMinutos,
      FaltasAtrasosMinutos: d.atrasoFaltaMinutos,
      Ocorrencia: d.ocorrencia || '',
      Origem: d.fonteOrigem
    }));
    exportToCSV(dados, `Espelho_Ponto_${colaboradorAtual?.nome}_${competencia}`);
  };

  // Emissão Oficial do Espelho de Ponto A4 (Portaria MTP 671/2021)
  const handleImprimirEspelhoA4 = () => {
    if (!onOpenReportPreview) return;

    const conteudoA4 = (
      <div className="space-y-4 text-neutral-900 font-sans p-6 bg-white min-h-[850px] text-xs">
        {/* Cabeçalho do Empregador e Portaria 671 */}
        <div className="border-b-2 border-neutral-900 pb-3 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-bold uppercase tracking-wider">{empresa.razaoSocial}</h1>
            <p className="text-[10px] text-neutral-600 font-mono">CNPJ: {empresa.cnpj} | {empresa.logradouro || ''}, {empresa.numero || 'S/N'} - {empresa.cidade || ''}/{empresa.uf || ''}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xs font-bold uppercase text-neutral-800">Espelho de Ponto Eletrônico</h2>
            <p className="text-[9px] text-neutral-500">Conforme Art. 74 CLT & Portaria MTP nº 671/2021</p>
            <p className="text-[10px] font-mono font-bold text-emerald-800">Competência: {competencia}</p>
          </div>
        </div>

        {/* Dados do Empregado */}
        <div className="grid grid-cols-3 gap-2 p-2 bg-neutral-100 rounded border border-neutral-300 text-[10px]">
          <div>
            <span className="text-neutral-500 uppercase block text-[8px]">Colaborador / Nome</span>
            <span className="font-bold">{espelho.nomeColaborador}</span>
          </div>
          <div>
            <span className="text-neutral-500 uppercase block text-[8px]">CPF / PIS-PASEP</span>
            <span className="font-mono">{espelho.cpf} | {espelho.pis}</span>
          </div>
          <div>
            <span className="text-neutral-500 uppercase block text-[8px]">Cargo / Departamento</span>
            <span>{espelho.cargo} - {espelho.departamento}</span>
          </div>
          <div className="col-span-3 pt-1 border-t border-neutral-200">
            <span className="text-neutral-500 uppercase text-[8px] mr-2">Jornada Contratual:</span>
            <span className="font-medium text-neutral-800">{espelho.jornadaDescricao}</span>
          </div>
        </div>

        {/* Tabela do Mês */}
        <div className="pt-1">
          <table className="w-full text-left text-[9px] border-collapse border border-neutral-300">
            <thead className="bg-neutral-100 font-bold uppercase text-[8px]">
              <tr>
                <th className="py-1 px-1 border border-neutral-300 text-center">Dia</th>
                <th className="py-1 px-1 border border-neutral-300">Semana</th>
                <th className="py-1 px-1 border border-neutral-300 text-center">Ent. 1</th>
                <th className="py-1 px-1 border border-neutral-300 text-center">Saí. 1</th>
                <th className="py-1 px-1 border border-neutral-300 text-center">Ent. 2</th>
                <th className="py-1 px-1 border border-neutral-300 text-center">Saí. 2</th>
                <th className="py-1 px-1 border border-neutral-300 text-center">Previsto</th>
                <th className="py-1 px-1 border border-neutral-300 text-center">Trabalhado</th>
                <th className="py-1 px-1 border border-neutral-300 text-center">Saldo</th>
                <th className="py-1 px-1 border border-neutral-300 text-center">H.E. 50%</th>
                <th className="py-1 px-1 border border-neutral-300 text-center">H.E. 100%</th>
                <th className="py-1 px-1 border border-neutral-300 text-center">Noturno</th>
                <th className="py-1 px-1 border border-neutral-300">Ocorrência</th>
              </tr>
            </thead>
            <tbody>
              {espelho.dias.map(d => {
                const isFimDeSemana = d.diaTipo === 'SABADO' || d.diaTipo === 'DOMINGO' || d.diaTipo === 'FERIADO';
                return (
                  <tr key={d.id} className={isFimDeSemana ? 'bg-neutral-50' : ''}>
                    <td className="py-0.5 px-1 border border-neutral-300 text-center font-mono">{d.data.substring(8, 10)}</td>
                    <td className="py-0.5 px-1 border border-neutral-300 text-[8px]">{d.diaSemana}</td>
                    <td className="py-0.5 px-1 border border-neutral-300 text-center font-mono">{d.entrada1 || '-'}</td>
                    <td className="py-0.5 px-1 border border-neutral-300 text-center font-mono">{d.saida1 || '-'}</td>
                    <td className="py-0.5 px-1 border border-neutral-300 text-center font-mono">{d.entrada2 || '-'}</td>
                    <td className="py-0.5 px-1 border border-neutral-300 text-center font-mono">{d.saida2 || '-'}</td>
                    <td className="py-0.5 px-1 border border-neutral-300 text-center font-mono">
                      {d.horasPrevistasMinutos > 0 ? `${Math.floor(d.horasPrevistasMinutos / 60)}:00` : '-'}
                    </td>
                    <td className="py-0.5 px-1 border border-neutral-300 text-center font-mono font-bold">
                      {d.horasTrabalhadasMinutos > 0 ? `${Math.floor(d.horasTrabalhadasMinutos / 60)}:${String(d.horasTrabalhadasMinutos % 60).padStart(2, '0')}` : '-'}
                    </td>
                    <td className="py-0.5 px-1 border border-neutral-300 text-center font-mono font-bold">
                      {d.saldoMinutos !== 0 ? (
                        <span className={d.saldoMinutos > 0 ? 'text-emerald-700' : 'text-rose-700'}>
                          {d.saldoMinutos > 0 ? '+' : ''}{d.saldoMinutos}m
                        </span>
                      ) : '-'}
                    </td>
                    <td className="py-0.5 px-1 border border-neutral-300 text-center font-mono">
                      {d.horasExtras50Minutos > 0 ? `${Math.floor(d.horasExtras50Minutos / 60)}h${d.horasExtras50Minutos % 60}m` : '-'}
                    </td>
                    <td className="py-0.5 px-1 border border-neutral-300 text-center font-mono">
                      {d.horasExtras100Minutos > 0 ? `${Math.floor(d.horasExtras100Minutos / 60)}h${d.horasExtras100Minutos % 60}m` : '-'}
                    </td>
                    <td className="py-0.5 px-1 border border-neutral-300 text-center font-mono">
                      {d.adicionalNoturnoMinutos > 0 ? `${Math.floor(d.adicionalNoturnoMinutos / 60)}h${d.adicionalNoturnoMinutos % 60}m` : '-'}
                    </td>
                    <td className="py-0.5 px-1 border border-neutral-300 text-[8px] truncate max-w-[120px]">
                      {d.ocorrencia || (isFimDeSemana ? d.diaTipo : '')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Resumo do Banco de Horas e Totais */}
        <div className="grid grid-cols-4 gap-2 p-2 bg-neutral-100 rounded border border-neutral-300 text-[10px]">
          <div>
            <span className="text-neutral-500 block text-[8px] uppercase">Horas Previstas / Trabalhadas</span>
            <span className="font-mono font-bold">{espelho.totalHorasPrevistas} / {espelho.totalHorasTrabalhadas}</span>
          </div>
          <div>
            <span className="text-neutral-500 block text-[8px] uppercase">H.E. 50% / H.E. 100%</span>
            <span className="font-mono font-bold">{espelho.totalHorasExtras50}h / {espelho.totalHorasExtras100}h</span>
          </div>
          <div>
            <span className="text-neutral-500 block text-[8px] uppercase">Adicional Noturno / Atrasos</span>
            <span className="font-mono font-bold">{espelho.totalAdicionalNoturnoHoras}h / {espelho.totalFaltasAtrasosHoras}h</span>
          </div>
          <div>
            <span className="text-neutral-500 block text-[8px] uppercase">Saldo Atual Banco de Horas</span>
            <span className="font-mono font-black text-emerald-800 text-xs">+{espelho.bancoHorasSaldoAtual}h</span>
          </div>
        </div>

        {/* Declaração de Reconhecimento e Assinaturas Portaria 671 */}
        <div className="pt-2 text-[9px] text-neutral-600 leading-tight">
          Reconheço a exatidão das marcações de ponto acima descritas, as quais representam a totalidade dos horários por mim efetivamente cumpridos no mês de referência.
        </div>

        <div className="pt-8 border-t border-neutral-400 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <div className="border-t border-neutral-900 w-3/4 mx-auto pt-1 font-bold">
              {espelho.nomeColaborador}
            </div>
            <p className="text-[10px] text-neutral-500">Assinatura do Empregado</p>
          </div>
          <div>
            <div className="border-t border-neutral-900 w-3/4 mx-auto pt-1 font-bold">
              {empresa.razaoSocial}
            </div>
            <p className="text-[10px] text-neutral-500">Empregador / Responsável de RH</p>
          </div>
        </div>
      </div>
    );

    onOpenReportPreview({
      titulo: `Espelho de Ponto Eletrônico - ${espelho.nomeColaborador}`,
      subtitulo: `${empresa.razaoSocial} - Competência ${competencia}`,
      conteudo: conteudoA4
    });
  };

  return (
    <div className="h-full flex flex-col p-6 bg-[#141414] text-neutral-100 select-none overflow-hidden font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-white/10 gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-600/10 border border-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
            <Clock size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span>Controle de Ponto Eletrônico & Banco de Horas</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono font-medium">
                Portaria MTP 671/2021 / CLT Art. 59
              </span>
            </h1>
            <p className="text-xs text-neutral-400">
              Importação de arquivos AFD (REP), espelho de ponto, cálculo de horas extras, adicional noturno e banco de horas
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Seletor de Competência */}
          <div className="flex items-center bg-[#1c1c1c] border border-white/10 rounded-lg px-2.5 py-1 text-xs">
            <Calendar className="w-3.5 h-3.5 text-neutral-400 mr-2" />
            <span className="text-neutral-400 mr-1.5">Comp:</span>
            <input
              type="month"
              value={competencia}
              onChange={e => setCompetencia(e.target.value)}
              className="bg-transparent text-white font-mono focus:outline-none text-xs"
            />
          </div>

          {/* Seletor de Colaborador */}
          <div className="flex items-center bg-[#1c1c1c] border border-white/10 rounded-lg px-2.5 py-1 text-xs">
            <Users className="w-3.5 h-3.5 text-neutral-400 mr-2" />
            <select
              value={colaboradorSelecionadoId}
              onChange={e => setColaboradorSelecionadoId(Number(e.target.value))}
              className="bg-transparent text-white font-medium focus:outline-none text-xs"
            >
              {colaboradores.map(c => (
                <option key={c.id} value={c.id} className="bg-[#1c1c1c] text-white">
                  {c.nome} ({c.cargo})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setModalImportarAfd(true)}
            className="px-3 py-1.5 text-xs bg-sky-600 hover:bg-sky-500 text-white rounded font-medium shadow flex items-center space-x-1.5 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Importar AFD (REP)</span>
          </button>

          <button
            onClick={handleImprimirEspelhoA4}
            className="px-3 py-1.5 text-xs bg-[#202020] hover:bg-[#282828] text-neutral-300 rounded border border-white/10 flex items-center space-x-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            <span>Espelho A4</span>
          </button>

          <button
            onClick={handleExportarCSV}
            className="px-3 py-1.5 text-xs bg-[#202020] hover:bg-[#282828] text-neutral-300 rounded border border-white/10 flex items-center space-x-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleIntegrarFolha}
            className="px-3 py-1.5 text-xs font-semibold rounded shadow bg-emerald-600 hover:bg-emerald-500 text-white flex items-center space-x-1.5 transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Integrar à Folha (1-Clique)</span>
          </button>
        </div>
      </div>

      {/* Notificação */}
      {notificacao && (
        <div className="mt-3 p-3 rounded-lg bg-sky-950/40 border border-sky-500/40 text-sky-300 flex items-center justify-between text-xs animate-in fade-in flex-shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-sky-400" />
            <span className="font-medium">{notificacao.mensagem}</span>
          </div>
          <button onClick={() => setNotificacao(null)} className="text-neutral-400 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {/* KPI Cards do Ponto */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 flex-shrink-0">
        <div className="p-4 rounded-xl bg-[#181818] border border-white/5 space-y-1">
          <span className="text-[11px] text-neutral-400 font-medium uppercase">Horas Previstas / Trabalhadas</span>
          <div className="text-xl font-bold font-mono text-white">
            {espelho.totalHorasTrabalhadas} <span className="text-xs text-neutral-500 font-normal">/ {espelho.totalHorasPrevistas}</span>
          </div>
          <span className="text-[10px] text-neutral-500 block font-sans">Jornada mensal de trabalho</span>
        </div>

        <div className="p-4 rounded-xl bg-[#181818] border border-white/5 space-y-1">
          <span className="text-[11px] text-neutral-400 font-medium uppercase">Horas Extras Apuradas</span>
          <div className="text-xl font-bold font-mono text-amber-400 flex items-baseline gap-2">
            <span>+{espelho.totalHorasExtras50}h</span>
            <span className="text-xs text-neutral-400 font-normal">(50%)</span>
            {espelho.totalHorasExtras100 > 0 && (
              <span className="text-xs text-rose-400 font-bold">+{espelho.totalHorasExtras100}h (100%)</span>
            )}
          </div>
          <span className="text-[10px] text-neutral-500 block font-sans">Sobreaviso e jornadas extraordinárias</span>
        </div>

        <div className="p-4 rounded-xl bg-[#181818] border border-white/5 space-y-1">
          <span className="text-[11px] text-neutral-400 font-medium uppercase">Adicional Noturno (Art. 73 CLT)</span>
          <div className="text-xl font-bold font-mono text-indigo-400 flex items-center gap-1.5">
            <Moon className="w-4 h-4 text-indigo-400" />
            <span>{espelho.totalAdicionalNoturnoHoras}h</span>
          </div>
          <span className="text-[10px] text-neutral-500 block font-sans">Hora noturna reduzida (52m30s)</span>
        </div>

        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
          <span className="text-[11px] text-emerald-300 font-medium uppercase">Saldo Banco de Horas (Acumulado)</span>
          <div className="text-xl font-bold font-mono text-emerald-300 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>+{espelho.bancoHorasSaldoAtual}h</span>
          </div>
          <span className="text-[10px] text-emerald-400/80 block font-sans">
            Crédito no mês: +{espelho.bancoHorasCreditoMes}h | Débito: -{espelho.bancoHorasDebitoMes}h
          </span>
        </div>
      </div>

      {/* Grade de Ponto Diária */}
      <div className="flex-1 bg-[#181818] border border-white/10 rounded-xl flex flex-col mt-4 overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b border-white/10 flex-shrink-0 bg-[#1e1e1e]">
          <div className="text-xs text-neutral-300 font-medium flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-sky-400" />
            <span>Espelho Mensal: <strong>{espelho.nomeColaborador}</strong> (PIS: {espelho.pis} | Matrícula: {colaboradorAtual?.matricula})</span>
          </div>
          <span className="text-[11px] text-neutral-500 font-mono">Tolerância Legal: CLT Art. 58 § 1º (±5 a 10 min/dia)</span>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-[#1e1e1e] border-b border-white/10 text-neutral-400 font-medium uppercase text-[11px] z-10">
              <tr>
                <th className="py-2 px-3 text-center">Data</th>
                <th className="py-2 px-3">Dia da Semana</th>
                <th className="py-2 px-3 text-center">Entrada 1</th>
                <th className="py-2 px-3 text-center">Saída 1</th>
                <th className="py-2 px-3 text-center">Entrada 2</th>
                <th className="py-2 px-3 text-center">Saída 2</th>
                <th className="py-2 px-3 text-center">Previsto</th>
                <th className="py-2 px-3 text-center font-bold text-white">Trabalhado</th>
                <th className="py-2 px-3 text-center font-bold">Saldo</th>
                <th className="py-2 px-3 text-center">HE 50%</th>
                <th className="py-2 px-3 text-center">HE 100%</th>
                <th className="py-2 px-3 text-center">Noturno</th>
                <th className="py-2 px-3">Ocorrência</th>
                <th className="py-2 px-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-[12px]">
              {espelho.dias.map(d => {
                const isFimDeSemana = d.diaTipo === 'SABADO' || d.diaTipo === 'DOMINGO' || d.diaTipo === 'FERIADO';
                return (
                  <tr key={d.id} className={`hover:bg-white/[0.02] ${isFimDeSemana ? 'bg-white/[0.01]' : ''}`}>
                    <td className="py-2 px-3 text-center font-bold text-neutral-300">
                      {d.data.substring(8, 10)}/{d.data.substring(5, 7)}
                    </td>
                    <td className="py-2 px-3 font-sans text-neutral-400">
                      <span className={d.diaTipo === 'FERIADO' ? 'text-amber-400 font-bold' : ''}>
                        {d.diaSemana}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center font-semibold text-sky-400">{d.entrada1 || '-'}</td>
                    <td className="py-2 px-3 text-center font-semibold text-neutral-300">{d.saida1 || '-'}</td>
                    <td className="py-2 px-3 text-center font-semibold text-neutral-300">{d.entrada2 || '-'}</td>
                    <td className="py-2 px-3 text-center font-semibold text-sky-400">{d.saida2 || '-'}</td>
                    <td className="py-2 px-3 text-center text-neutral-500">
                      {d.horasPrevistasMinutos > 0 ? `${Math.floor(d.horasPrevistasMinutos / 60)}:00` : '-'}
                    </td>
                    <td className="py-2 px-3 text-center font-bold text-white">
                      {d.horasTrabalhadasMinutos > 0 ? (
                        `${Math.floor(d.horasTrabalhadasMinutos / 60)}:${String(d.horasTrabalhadasMinutos % 60).padStart(2, '0')}`
                      ) : '-'}
                    </td>
                    <td className="py-2 px-3 text-center font-bold">
                      {d.saldoMinutos > 0 && <span className="text-emerald-400">+{d.saldoMinutos}m</span>}
                      {d.saldoMinutos < 0 && <span className="text-rose-400">{d.saldoMinutos}m</span>}
                      {d.saldoMinutos === 0 && <span className="text-neutral-600">-</span>}
                    </td>
                    <td className="py-2 px-3 text-center text-amber-400">
                      {d.horasExtras50Minutos > 0 ? `${Math.floor(d.horasExtras50Minutos / 60)}h${d.horasExtras50Minutos % 60}m` : '-'}
                    </td>
                    <td className="py-2 px-3 text-center text-rose-400 font-bold">
                      {d.horasExtras100Minutos > 0 ? `${Math.floor(d.horasExtras100Minutos / 60)}h${d.horasExtras100Minutos % 60}m` : '-'}
                    </td>
                    <td className="py-2 px-3 text-center text-indigo-400">
                      {d.adicionalNoturnoMinutos > 0 ? `${Math.floor(d.adicionalNoturnoMinutos / 60)}h${d.adicionalNoturnoMinutos % 60}m` : '-'}
                    </td>
                    <td className="py-2 px-3 font-sans text-[11px] text-neutral-400 truncate max-w-[150px]">
                      {d.ocorrencia || (isFimDeSemana ? d.diaTipo : '')}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        onClick={() => setModalEditarDia({ ...d })}
                        className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                        title="Ajustar Batidas"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Importar AFD */}
      {modalImportarAfd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#1c1c1c] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-sky-400" />
                <span>Importar Arquivo Fonte de Dados (AFD - Portaria 671)</span>
              </h3>
              <button onClick={() => setModalImportarAfd(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleProcessarAfd} className="space-y-3 text-xs">
              <p className="text-neutral-400">
                Cole o conteúdo bruto extraído do Registrador Eletrônico de Ponto (REP-C, REP-A ou REP-P):
              </p>

              <textarea
                rows={8}
                value={textoAfd}
                onChange={e => setTextoAfd(e.target.value)}
                placeholder="Exemplo:&#10;000000001301102026080212345678901&#10;000000002301102026120012345678901&#10;000000003301102026130012345678901&#10;000000004301102026170512345678901"
                className="w-full bg-[#141414] border border-white/10 rounded-lg p-3 text-emerald-400 font-mono text-xs focus:outline-none focus:border-sky-500"
                required
              />

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalImportarAfd(false)}
                  className="px-3 py-1.5 text-neutral-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded font-medium shadow"
                >
                  Processar e Importar Batidas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Ajustar Batidas do Dia */}
      {modalEditarDia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#1c1c1c] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-emerald-400" />
                <span>Ajuste de Batidas: {modalEditarDia.data} ({modalEditarDia.diaSemana})</span>
              </h3>
              <button onClick={() => setModalEditarDia(null)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSalvarEdicaoDia} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Entrada 1</label>
                  <input
                    type="time"
                    value={modalEditarDia.entrada1}
                    onChange={e => setModalEditarDia({ ...modalEditarDia, entrada1: e.target.value })}
                    className="w-full bg-[#141414] border border-white/10 rounded px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Saída 1</label>
                  <input
                    type="time"
                    value={modalEditarDia.saida1}
                    onChange={e => setModalEditarDia({ ...modalEditarDia, saida1: e.target.value })}
                    className="w-full bg-[#141414] border border-white/10 rounded px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Entrada 2</label>
                  <input
                    type="time"
                    value={modalEditarDia.entrada2}
                    onChange={e => setModalEditarDia({ ...modalEditarDia, entrada2: e.target.value })}
                    className="w-full bg-[#141414] border border-white/10 rounded px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Saída 2</label>
                  <input
                    type="time"
                    value={modalEditarDia.saida2}
                    onChange={e => setModalEditarDia({ ...modalEditarDia, saida2: e.target.value })}
                    className="w-full bg-[#141414] border border-white/10 rounded px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Ocorrência / Justificativa</label>
                <input
                  type="text"
                  value={modalEditarDia.ocorrencia || ''}
                  onChange={e => setModalEditarDia({ ...modalEditarDia, ocorrencia: e.target.value })}
                  placeholder="Ex: Atestado médico, Declaração de horas, Convocação..."
                  className="w-full bg-[#141414] border border-white/10 rounded px-2.5 py-1.5 text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalEditarDia(null)}
                  className="px-3 py-1.5 text-neutral-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium shadow"
                >
                  Salvar Ajuste
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
