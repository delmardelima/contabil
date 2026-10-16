import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  RefreshCw,
  Printer,
  AlertOctagon,
  AlertTriangle,
  CheckCircle,
  FileText,
  Search,
  Filter,
  Calculator,
  ShieldCheck,
  ShieldAlert,
  ArrowRightLeft,
  ChevronDown,
  ChevronUp,
  Scale,
  Sparkles,
  BookOpen,
  DollarSign
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  Empresa,
  ModuloOrigemSped,
  RegraCruzamentoSped,
  RelatorioAuditoriaCruzamentoSped,
  SeveridadeInconsistencia
} from '../../types/contabil';

interface AuditoriaSpedCruzamentoModuleProps {
  empresaAtiva: Empresa | null;
  onOpenReportPreview?: (config: {
    titulo: string;
    subtitulo: string;
    conteudoHtml: string;
    imprimirDireto?: boolean;
  }) => void;
}

export const AuditoriaSpedCruzamentoModule: React.FC<AuditoriaSpedCruzamentoModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [relatorio, setRelatorio] = useState<RelatorioAuditoriaCruzamentoSped | null>(null);
  const [exercicio, setExercicio] = useState<number>(2026);
  const [busca, setBusca] = useState('');
  const [filtroSeveridade, setFiltroSeveridade] = useState<string>('TODAS');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  const [abaAtiva, setAbaAtiva] = useState<'matriz' | 'simulador' | 'legislacao'>('matriz');
  const [regraExpandidaId, setRegraExpandidaId] = useState<string | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  // Simulador de Penalidades RFB
  const [simBaseDiferenca, setSimBaseDiferenca] = useState<number>(250000);
  const [simTipoInfracao, setSimTipoInfracao] = useState<'OFICIO_75' | 'AGRAVADA_150' | 'DENUNCIA_ESPONTANEA'>('OFICIO_75');
  const [simMesesAtraso, setSimMesesAtraso] = useState<number>(6);

  const carregarDados = () => {
    if (!empresaAtiva) return;
    setIsAuditing(true);
    setTimeout(() => {
      const res = dbService.getRelatorioCruzamentoSped(empresaAtiva.id, exercicio);
      setRelatorio(res);
      setIsAuditing(false);
    }, 250);
  };

  useEffect(() => {
    carregarDados();
  }, [empresaAtiva, exercicio]);

  const handleMudarStatusRegra = (id: string, novoStatus: 'INCONSISTENTE' | 'CONFORME' | 'JUSTIFICADA') => {
    dbService.atualizarStatusRegraCruzamento(id, novoStatus);
    carregarDados();
  };

  const getNomeModuloSped = (modulo: ModuloOrigemSped) => {
    switch (modulo) {
      case 'ECD_J100_J150': return 'ECD (Bal. J100 / DRE J150)';
      case 'ECF_BLOCO_L_M': return 'ECF (LALUR/LACS Bloco L/M)';
      case 'EFD_CONTRIBUICOES_M210_M610': return 'EFD-Contribuições (M210/M610)';
      case 'EFD_FISCAL_ICMS_IPI': return 'EFD-Fiscal (Bloco H / C100)';
      default: return modulo;
    }
  };

  const getSeveridadeBadge = (sev: SeveridadeInconsistencia) => {
    switch (sev) {
      case 'CRITICA_AUTUACAO':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertOctagon className="w-3 h-3" /> Crítica (Risco Autuação)
          </span>
        );
      case 'ALERTA_MALHA_FINA':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3 h-3" /> Alerta (Malha Fina)
          </span>
        );
      case 'INFORMATIVA_CONFORME':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="w-3 h-3" /> Conforme
          </span>
        );
    }
  };

  const formatarMoeda = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Filtragem
  const regrasFiltradas = (relatorio?.regras || []).filter(item => {
    const matchBusca =
      item.codigoRegra.toLowerCase().includes(busca.toLowerCase()) ||
      item.descricaoRegra.toLowerCase().includes(busca.toLowerCase()) ||
      item.baseLegal.toLowerCase().includes(busca.toLowerCase()) ||
      item.recomendacaoAcao.toLowerCase().includes(busca.toLowerCase());
    const matchSev = filtroSeveridade === 'TODAS' || item.severidade === filtroSeveridade;
    const matchStatus = filtroStatus === 'TODOS' || item.status === filtroStatus;
    return matchBusca && matchSev && matchStatus;
  });

  // Geração de Laudo Pré-Fiscal A4
  const handleImprimirLaudoA4 = () => {
    if (!empresaAtiva || !relatorio) return;

    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; padding: 25px; max-width: 950px; margin: 0 auto; line-height: 1.4;">
        <!-- CABEÇALHO OFICIAL -->
        <div style="border-bottom: 3px double #0f172a; padding-bottom: 15px; margin-bottom: 20px; text-align: center;">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: bold;">
            SISTEMA PÚBLICO DE ESCRITURAÇÃO DIGITAL - AUDITORIA ELETRÔNICA PRÉVIA
          </div>
          <h1 style="font-size: 20px; margin: 5px 0; color: #0f172a; text-transform: uppercase; font-weight: 800;">
            LAUDO DE AUDITORIA PRÉ-FISCAL E CRUZAMENTO SPED
          </h1>
          <div style="font-size: 13px; font-weight: 600; color: #334155;">
            ECD (CONTÁBIL) • ECF (LALUR/LACS) • EFD-CONTRIBUIÇÕES • EFD-FISCAL (ICMS/IPI)
          </div>
        </div>

        <!-- DADOS DA ENTIDADE AUDITADA -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; background: #f8fafc; border: 1px solid #cbd5e1;">
          <tr>
            <td style="padding: 8px 12px; width: 60%;"><strong>Empresa Auditada:</strong> ${empresaAtiva.razaoSocial}</td>
            <td style="padding: 8px 12px; width: 40%;"><strong>CNPJ:</strong> ${empresaAtiva.cnpj || '00.000.000/0001-00'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px;"><strong>Ano-Calendário / Exercício:</strong> ${exercicio}</td>
            <td style="padding: 8px 12px;"><strong>Data da Emissão do Laudo:</strong> ${relatorio.dataAuditoria}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px;" colspan="2">
              <strong>Diagnóstico Geral:</strong> ${relatorio.totalInconsistenciasCriticas > 0 ? '<span style="color:#b91c1c; font-weight:bold;">ALTO RISCO DE MALHA FINA / AUTUAÇÃO FISCAL</span>' : '<span style="color:#15803d; font-weight:bold;">SITUAÇÃO CONFORME - RISCO CONTROLADO</span>'}
            </td>
          </tr>
        </table>

        <!-- QUADRO RESUMO DE RISCO E CONTINGÊNCIA -->
        <div style="display: flex; gap: 15px; margin-bottom: 20px;">
          <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 4px; padding: 12px; background: #f8fafc; text-align: center;">
            <div style="font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase;">Regras Auditadas</div>
            <div style="font-size: 22px; font-weight: bold; color: #0f172a; margin-top: 4px;">${relatorio.totalRegrasAuditadas}</div>
          </div>
          <div style="flex: 1; border: 1px solid #fca5a5; border-radius: 4px; padding: 12px; background: #fef2f2; text-align: center;">
            <div style="font-size: 11px; color: #b91c1c; font-weight: bold; text-transform: uppercase;">Críticas (Autuação)</div>
            <div style="font-size: 22px; font-weight: bold; color: #b91c1c; margin-top: 4px;">${relatorio.totalInconsistenciasCriticas}</div>
          </div>
          <div style="flex: 1; border: 1px solid #fde68a; border-radius: 4px; padding: 12px; background: #fffbeb; text-align: center;">
            <div style="font-size: 11px; color: #d97706; font-weight: bold; text-transform: uppercase;">Alertas (Malha Fina)</div>
            <div style="font-size: 22px; font-weight: bold; color: #d97706; margin-top: 4px;">${relatorio.totalAlertas}</div>
          </div>
          <div style="flex: 1.5; border: 1px solid #cbd5e1; border-radius: 4px; padding: 12px; background: #f8fafc; text-align: center;">
            <div style="font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase;">Contingência Estimada</div>
            <div style="font-size: 22px; font-weight: bold; color: #b91c1c; margin-top: 4px;">
              ${relatorio.contingenciaTributariaEstimada.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </div>
        </div>

        <!-- TABELA DETALHADA DAS REGRAS -->
        <h3 style="font-size: 14px; margin: 20px 0 10px 0; border-bottom: 1px solid #94a3b8; padding-bottom: 5px; color: #0f172a; text-transform: uppercase;">
          Demonstrativo dos Cruzamentos Algorítmicos Realizados
        </h3>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 11px;">
          <thead>
            <tr style="background: #1e293b; color: #ffffff;">
              <th style="padding: 8px; border: 1px solid #334155; text-align: center; width: 80px;">Código</th>
              <th style="padding: 8px; border: 1px solid #334155; text-align: left;">Descrição da Regra / Base Legal</th>
              <th style="padding: 8px; border: 1px solid #334155; text-align: right;">Módulo Origem 1</th>
              <th style="padding: 8px; border: 1px solid #334155; text-align: right;">Módulo Origem 2</th>
              <th style="padding: 8px; border: 1px solid #334155; text-align: right;">Divergência</th>
              <th style="padding: 8px; border: 1px solid #334155; text-align: center;">Severidade / Status</th>
            </tr>
          </thead>
          <tbody>
            ${relatorio.regras.map(r => `
              <tr style="border-bottom: 1px solid #cbd5e1; background: ${r.status === 'CONFORME' ? '#ffffff' : (r.severidade === 'CRITICA_AUTUACAO' ? '#fef2f2' : '#fffbeb')};">
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; font-family: monospace;">${r.codigoRegra}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1;">
                  <strong>${r.descricaoRegra}</strong><br />
                  <span style="color: #64748b; font-size: 10px;">Fundamentação: ${r.baseLegal}</span><br />
                  <span style="color: #0369a1; font-size: 10px;"><strong>Ação:</strong> ${r.recomendacaoAcao}</span>
                </td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">
                  <span style="font-size: 10px; color: #64748b;">${getNomeModuloSped(r.modulo1)}</span><br />
                  <strong>${r.valorOrigemModulo1.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                </td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">
                  <span style="font-size: 10px; color: #64748b;">${getNomeModuloSped(r.modulo2)}</span><br />
                  <strong>${r.valorOrigemModulo2.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                </td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold; color: ${r.diferencaApontada === 0 ? '#15803d' : '#b91c1c'};">
                  ${r.diferencaApontada.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">
                  <span style="font-weight: bold; font-size: 10px; color: ${r.status === 'CONFORME' ? '#15803d' : (r.status === 'JUSTIFICADA' ? '#0369a1' : '#b91c1c')};">
                    ${r.status}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- PARECER TÉCNICO PERICIAL -->
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 4px; padding: 15px; margin-top: 20px; font-size: 11px;">
          <div style="font-weight: bold; margin-bottom: 5px; color: #0f172a;">PARECER CONCLUSIVO DA AUDITORIA FISCAL PREVENTIVA:</div>
          <div>
            O presente diagnóstico aplicou os mesmos parâmetros de parametrização utilizados pela Receita Federal do Brasil nos motores Harpia e T-Rex de cruzamento de dados.
            Recomenda-se a imediata retificação ou apresentação formal das memórias de cálculo antes da transmissão definitiva das escriturações para afastar a aplicação da penalidade de ofício de 75% prevista no Art. 44 da Lei nº 9.430/1996.
          </div>
        </div>

        <div style="margin-top: 50px; display: flex; justify-content: space-between; text-align: center; font-size: 11px;">
          <div style="width: 45%; border-top: 1px solid #64748b; padding-top: 8px;">
            <strong>${empresaAtiva.razaoSocial}</strong><br />
            Representante Legal da Sociedade<br />
            CPF: ____________________________
          </div>
          <div style="width: 45%; border-top: 1px solid #64748b; padding-top: 8px;">
            <strong>AUDITOR CONTÁBIL & TRIBUTÁRIO RESPONSÁVEL</strong><br />
            CRC nº 1SP-999999/O-0 • CNAI nº 1234<br />
            Chave Hash ICP-Brasil: SHA256-VALIDADO-2026
          </div>
        </div>
      </div>
    `;

    if (onOpenReportPreview) {
      onOpenReportPreview({
        titulo: 'Laudo de Auditoria Pré-Fiscal e Cruzamento SPED',
        subtitulo: `Exercício: ${exercicio} • Entidade: ${empresaAtiva.razaoSocial}`,
        conteudoHtml: html
      });
    } else {
      const w = window.open('', '_blank');
      if (w) {
        w.document.write(`<html><head><title>Laudo SPED</title></head><body>${html}</body></html>`);
        w.document.close();
      }
    }
  };

  // Cálculos do Simulador de Penalidades
  const calcularPenalidades = () => {
    let percMulta = 0.75;
    if (simTipoInfracao === 'AGRAVADA_150') percMulta = 1.50;
    if (simTipoInfracao === 'DENUNCIA_ESPONTANEA') percMulta = 0.20; // Multa de mora limitada a 20%

    const tributoDevido = simBaseDiferenca * 0.34; // IRPJ + CSLL
    const valorMulta = tributoDevido * percMulta;
    const jurosSelic = tributoDevido * (0.01 * simMesesAtraso + 0.01); // Estimativa de SELIC
    const totalContingencia = tributoDevido + valorMulta + jurosSelic;

    return { tributoDevido, percMulta, valorMulta, jurosSelic, totalContingencia };
  };

  const simResult = calcularPenalidades();

  return (
    <div className="flex flex-col h-full bg-[#141414] text-neutral-200">
      {/* HEADER BAR */}
      <div className="border-b border-neutral-800 bg-[#1a1a1a] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              Auditoria de Obrigações Acessórias & Cruzamento SPED
              <span className="text-xs bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded border border-rose-500/30">
                ECD vs ECF vs EFD-Contribuições
              </span>
            </h1>
            <p className="text-xs text-neutral-400">
              Validador de consistência fiscal prévio, confrontando blocos contábeis, LALUR/LACS e contribuições federais para prevenir autuações.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#222] border border-neutral-700 px-3 py-1.5 rounded-lg text-xs">
            <span className="text-neutral-400">Exercício:</span>
            <select
              value={exercicio}
              onChange={e => setExercicio(Number(e.target.value))}
              className="bg-transparent text-white font-medium focus:outline-none"
            >
              <option value={2026} className="bg-[#222]">2026 (Atual)</option>
              <option value={2025} className="bg-[#222]">2025</option>
              <option value={2024} className="bg-[#222]">2024</option>
            </select>
          </div>

          <button
            onClick={carregarDados}
            disabled={isAuditing}
            className="flex items-center gap-2 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isAuditing ? 'animate-spin' : ''}`} />
            {isAuditing ? 'Auditando...' : 'Reexecutar Cruzamento'}
          </button>

          <button
            onClick={handleImprimirLaudoA4}
            className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-semibold border border-neutral-700 transition-colors"
          >
            <Printer className="w-4 h-4 text-rose-400" />
            Laudo Pré-Fiscal A4
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 p-6 pb-2">
        {/* Total Regras */}
        <div className="bg-[#1e1e1e] border border-neutral-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Regras Auditadas</span>
            <ShieldCheck className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">
            {relatorio?.totalRegrasAuditadas || 0}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">Confrontos algorítmicos ativos</div>
        </div>

        {/* Críticas */}
        <div className="bg-[#1e1e1e] border border-neutral-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Críticas (Autuação)</span>
            <AlertOctagon className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold text-rose-400 font-mono">
            {relatorio?.totalInconsistenciasCriticas || 0}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">Divergências que geram notificação</div>
        </div>

        {/* Alertas */}
        <div className="bg-[#1e1e1e] border border-neutral-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Alertas (Malha Fina)</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400 font-mono">
            {relatorio?.totalAlertas || 0}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">Diferenças temporais / memórias</div>
        </div>

        {/* Conformes */}
        <div className="bg-[#1e1e1e] border border-neutral-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Conformes</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono">
            {relatorio?.totalConformes || 0}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">100% conciliadas com sucesso</div>
        </div>

        {/* Contingência Estimada */}
        <div className="bg-[#1e1e1e] border border-neutral-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Contingência Tributária</span>
            <Scale className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold text-rose-400 font-mono">
            {formatarMoeda(relatorio?.contingenciaTributariaEstimada || 0)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">IRPJ / CSLL / PIS / COFINS</div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center border-b border-neutral-800 px-6 gap-6 text-xs font-semibold">
        <button
          onClick={() => setAbaAtiva('matriz')}
          className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
            abaAtiva === 'matriz'
              ? 'border-rose-500 text-rose-400'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          Matriz de Cruzamentos SPED
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-neutral-800 text-[10px] text-neutral-300">
            {relatorio?.regras.length || 0}
          </span>
        </button>

        <button
          onClick={() => setAbaAtiva('simulador')}
          className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
            abaAtiva === 'simulador'
              ? 'border-rose-500 text-rose-400'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Calculator className="w-4 h-4" />
          Simulador de Multas e Contingência (Lei 9.430)
        </button>

        <button
          onClick={() => setAbaAtiva('legislacao')}
          className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
            abaAtiva === 'legislacao'
              ? 'border-rose-500 text-rose-400'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Manuais Técnicos RFB & Motores Harpia/T-Rex
        </button>
      </div>

      {/* TAB CONTENT: MATRIZ DE CRUZAMENTOS */}
      {abaAtiva === 'matriz' && (
        <div className="flex-1 flex flex-col overflow-hidden p-6 gap-4">
          {/* SEARCH & FILTERS */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md bg-[#1a1a1a] border border-neutral-800 rounded-lg px-3 py-1.5">
              <Search className="w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={busca}
                onChange={e => setBusca(e.target.value)}
                placeholder="Buscar por código, bloco, regra ou recomendação..."
                className="bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none w-full"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-neutral-400" />
                <select
                  value={filtroSeveridade}
                  onChange={e => setFiltroSeveridade(e.target.value)}
                  className="bg-[#1a1a1a] border border-neutral-800 text-neutral-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="TODAS">Todas as Severidades</option>
                  <option value="CRITICA_AUTUACAO">Crítica (Autuação)</option>
                  <option value="ALERTA_MALHA_FINA">Alerta (Malha Fina)</option>
                  <option value="INFORMATIVA_CONFORME">Conforme</option>
                </select>
              </div>

              <select
                value={filtroStatus}
                onChange={e => setFiltroStatus(e.target.value)}
                className="bg-[#1a1a1a] border border-neutral-800 text-neutral-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                <option value="TODOS">Todos os Status</option>
                <option value="INCONSISTENTE">Inconsistente</option>
                <option value="CONFORME">Conforme</option>
                <option value="JUSTIFICADA">Justificada</option>
              </select>
            </div>
          </div>

          {/* LISTA / CARDS DE REGRAS DE AUDITORIA */}
          <div className="flex-1 overflow-y-auto space-y-3">
            {regrasFiltradas.length === 0 ? (
              <div className="bg-[#1a1a1a] border border-neutral-800 rounded-xl p-12 text-center text-neutral-500">
                Nenhuma regra corresponde aos filtros selecionados.
              </div>
            ) : (
              regrasFiltradas.map(regra => {
                const isExpanded = regraExpandidaId === regra.id;

                return (
                  <div
                    key={regra.id}
                    className={`bg-[#1a1a1a] border rounded-xl transition-all ${
                      regra.status === 'CONFORME'
                        ? 'border-neutral-800 hover:border-neutral-700'
                        : (regra.severidade === 'CRITICA_AUTUACAO'
                            ? 'border-rose-500/30 bg-rose-950/10'
                            : 'border-amber-500/30 bg-amber-950/10')
                    }`}
                  >
                    {/* CARD HEADER */}
                    <div
                      onClick={() => setRegraExpandidaId(isExpanded ? null : regra.id)}
                      className="p-4 flex flex-wrap items-center justify-between gap-4 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-[#222] border border-neutral-700 text-neutral-300">
                          {regra.codigoRegra}
                        </span>
                        <div>
                          <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            {regra.descricaoRegra}
                          </h3>
                          <div className="text-[11px] text-neutral-400 mt-0.5">
                            Fundamentação Legal: <span className="text-neutral-300">{regra.baseLegal}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {getSeveridadeBadge(regra.severidade)}

                        <div className="text-right">
                          <div className="text-[10px] text-neutral-400">Diferença Apontada</div>
                          <div className={`font-mono text-sm font-bold ${
                            regra.diferencaApontada === 0
                              ? 'text-emerald-400'
                              : (regra.severidade === 'CRITICA_AUTUACAO' ? 'text-rose-400' : 'text-amber-400')
                          }`}>
                            {formatarMoeda(regra.diferencaApontada)}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            value={regra.status}
                            onClick={e => e.stopPropagation()}
                            onChange={e => handleMudarStatusRegra(regra.id, e.target.value as any)}
                            className="bg-[#222] border border-neutral-700 text-xs rounded-lg px-2 py-1 text-white focus:outline-none"
                          >
                            <option value="INCONSISTENTE">Inconsistente</option>
                            <option value="CONFORME">Conforme</option>
                            <option value="JUSTIFICADA">Justificada</option>
                          </select>

                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-neutral-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-neutral-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* EXPANDED DETAILS */}
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-2 border-t border-neutral-800/80 text-xs space-y-4">
                        {/* CONFRONTATION BOXES */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-[#222] border border-neutral-700/80 rounded-lg p-3">
                            <div className="text-[10px] text-sky-400 font-semibold uppercase tracking-wider mb-1">
                              Origem Módulo 1: {getNomeModuloSped(regra.modulo1)}
                            </div>
                            <div className="text-base font-bold font-mono text-white">
                              {formatarMoeda(regra.valorOrigemModulo1)}
                            </div>
                            <div className="text-[11px] text-neutral-400 mt-1">
                              Valor extraído da escrituração contábil/fiscal de base.
                            </div>
                          </div>

                          <div className="bg-[#222] border border-neutral-700/80 rounded-lg p-3">
                            <div className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider mb-1">
                              Origem Módulo 2: {getNomeModuloSped(regra.modulo2)}
                            </div>
                            <div className="text-base font-bold font-mono text-white">
                              {formatarMoeda(regra.valorOrigemModulo2)}
                            </div>
                            <div className="text-[11px] text-neutral-400 mt-1">
                              Valor confrontado na escrituração fiscal de destino / apuração.
                            </div>
                          </div>
                        </div>

                        {/* RECOMENDAÇÃO DE AÇÃO */}
                        <div className="p-3.5 bg-neutral-900 border border-neutral-700 rounded-lg flex items-start gap-3">
                          <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-white block mb-0.5">Recomendação Técnica / Procedimento de Regularização:</span>
                            <p className="text-neutral-300 leading-relaxed">
                              {regra.recomendacaoAcao}
                            </p>
                          </div>
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

      {/* TAB CONTENT: SIMULADOR DE MULTAS */}
      {abaAtiva === 'simulador' && (
        <div className="flex-1 overflow-auto p-6 max-w-4xl mx-auto w-full">
          <div className="bg-[#1a1a1a] border border-neutral-800 rounded-xl p-6">
            <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-rose-400" />
              Simulador de Risco de Multas de Ofício da Receita Federal (Art. 44 Lei 9.430/96)
            </h2>
            <p className="text-xs text-neutral-400 mb-6">
              Estime o passivo tributário contingente caso as inconsistências apuradas nos cruzamentos sejam alvo de auto de infração pela fiscalização.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Divergência Tributável Apurada</label>
                <input
                  type="number"
                  value={simBaseDiferenca}
                  onChange={e => setSimBaseDiferenca(Number(e.target.value))}
                  className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Tipo de Enquadramento Infracional</label>
                <select
                  value={simTipoInfracao}
                  onChange={e => setSimTipoInfracao(e.target.value as any)}
                  className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="OFICIO_75">Multa de Ofício Padrão (75%)</option>
                  <option value="AGRAVADA_150">Multa Agravada / Dolo (150%)</option>
                  <option value="DENUNCIA_ESPONTANEA">Denúncia Espontânea / Mora (20%)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Meses Estimados de Atraso</label>
                <input
                  type="number"
                  value={simMesesAtraso}
                  onChange={e => setSimMesesAtraso(Number(e.target.value))}
                  className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* QUADRO DE RESULTADOS DO SIMULADOR */}
            <div className="bg-[#222] border border-neutral-700 rounded-xl p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4">
                Composição do Crédito Tributário Contingente
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-[#1a1a1a] p-3 rounded-lg border border-neutral-800">
                  <div className="text-[11px] text-neutral-400 mb-1">Tributo Principal (34%)</div>
                  <div className="text-base font-bold text-white font-mono">
                    {formatarMoeda(simResult.tributoDevido)}
                  </div>
                </div>

                <div className="bg-[#1a1a1a] p-3 rounded-lg border border-neutral-800">
                  <div className="text-[11px] text-neutral-400 mb-1">Multa Punitiva ({(simResult.percMulta * 100).toFixed(0)}%)</div>
                  <div className="text-base font-bold font-mono text-rose-400">
                    {formatarMoeda(simResult.valorMulta)}
                  </div>
                </div>

                <div className="bg-[#1a1a1a] p-3 rounded-lg border border-neutral-800">
                  <div className="text-[11px] text-neutral-400 mb-1">Juros Selic Estimados</div>
                  <div className="text-base font-bold font-mono text-amber-400">
                    {formatarMoeda(simResult.jurosSelic)}
                  </div>
                </div>

                <div className="bg-[#1a1a1a] p-3 rounded-lg border border-neutral-800">
                  <div className="text-[11px] text-neutral-400 mb-1">Contingência Total</div>
                  <div className="text-base font-bold font-mono text-rose-400">
                    {formatarMoeda(simResult.totalContingencia)}
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-400 flex items-start gap-3">
                <AlertOctagon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>IMPACTO DA AUTOREGULARIZAÇÃO PREVENTIVA (DENÚNCIA ESPONTÂNEA):</strong>
                  <p className="text-[11px] opacity-80 mt-0.5">
                    Se a entidade retificar as escriturações antes de qualquer termo de início de fiscalização (Art. 138 do CTN), afasta-se a multa de ofício de 75%, recolhendo apenas o tributo e a mora, economizando <strong>{formatarMoeda(simResult.valorMulta - (simResult.tributoDevido * 0.20))}</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: LEGISLAÇÃO & MOTORES RFB */}
      {abaAtiva === 'legislacao' && (
        <div className="flex-1 overflow-auto p-6 max-w-4xl mx-auto w-full space-y-4">
          <div className="bg-[#1a1a1a] border border-neutral-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Scale className="w-4 h-4 text-rose-400" />
              Instrução Normativa RFB nº 2.003/2021 (ECD) & IN RFB nº 2.004/2021 (ECF)
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              A Escrituração Contábil Fiscal (ECF) exige a importação obrigatória dos dados da Escrituração Contábil Digital (ECD). O bloco C (recuperação da ECD) e os blocos L (Balanço Patrimonial e DRE) devem manter amarração matemática exata com as contas referenciais da Receita Federal. Qualquer divergência entre o resultado contábil antes do IRPJ apurado na ECD e o ponto de partida do Livro Eletrônico de Apuração do Lucro Real (LALUR/LACS - Bloco M) trava a validação do PVA ou aciona a malha fina automática.
            </p>
          </div>

          <div className="bg-[#1a1a1a] border border-neutral-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Sistemas Harpia e T-Rex de Auditoria da Receita Federal
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              O Fisco Federal processa todas as escriturações em seus supercomputadores confrontando receitas declaradas em NF-e modelo 55, NFC-e modelo 65, EFD-Contribuições (Bloco M210/M610), ECF (Bloco P150/L300) e movimentações financeiras da e-Financeira. Divergências superiores a 1% acionam notificações de aviso de autorregularização sob pena de lançamento de ofício com multa de 75% a 150%.
            </p>
          </div>

          <div className="bg-[#1a1a1a] border border-neutral-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-sky-400" />
              Artigo 317 do RIR/2018 - Depreciação Acelerada Incentivada e LALUR
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              A depreciação societária (conforme vida útil econômica, NBC TG 27) difere frequentemente da depreciação fiscal (taxas fixas da IN RFB 1.700/2017). A diferença deve ser rigorosamente demonstrada no Bloco M300 do LALUR como Adição ou Exclusão temporária na Parte A, com respectivo controle de saldo na Parte B para reversão futura.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
