import React, { useState, useEffect } from 'react';
import {
  Compass,
  Plus,
  RefreshCw,
  Printer,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  FileText,
  Search,
  Filter,
  Calculator,
  Calendar,
  Edit,
  Trash2,
  ShieldCheck,
  DollarSign,
  ArrowRightLeft,
  FileCheck2,
  Globe2,
  HelpCircle,
  Layers,
  Sparkles,
  FileSpreadsheet,
  MapPin,
  Building,
  Factory,
  Percent,
  Clock,
  Award
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  Empresa,
  ProjetoIncentivadoRegional,
  ResumoIncentivosRegionais,
  RegiaoIncentivoRegional,
  ModalidadeProjetoRegional,
  StatusLaudoRegional
} from '../../types/contabil';

interface IncentivosSudeneSudamModuleProps {
  empresaAtiva: Empresa | null;
  onOpenReportPreview?: (config: {
    titulo: string;
    subtitulo: string;
    conteudoHtml: string;
    imprimirDireto?: boolean;
  }) => void;
}

export const IncentivosSudeneSudamModule: React.FC<IncentivosSudeneSudamModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [resumo, setResumo] = useState<ResumoIncentivosRegionais | null>(null);
  const [anoFiltro, setAnoFiltro] = useState<number>(2026);
  const [abaAtiva, setAbaAtiva] = useState<'projetos' | 'demonstrativo' | 'legislacao'>('projetos');
  const [busca, setBusca] = useState('');
  const [filtroRegiao, setFiltroRegiao] = useState<string>('TODOS');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');

  // Modal formulário
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemEdicao, setItemEdicao] = useState<ProjetoIncentivadoRegional | null>(null);

  // Formulário
  const [regiao, setRegiao] = useState<RegiaoIncentivoRegional>('SUDENE');
  const [numeroLaudoConstitutivo, setNumeroLaudoConstitutivo] = useState('');
  const [dataExpedicaoLaudo, setDataExpedicaoLaudo] = useState('2024-01-15');
  const [prazoVigenciaAnos, setPrazoVigenciaAnos] = useState(10);
  const [municipioEstadoUnidade, setMunicipioEstadoUnidade] = useState('');
  const [atividadeIncentivada, setAtividadeIncentivada] = useState('');
  const [modalidadeProjeto, setModalidadeProjeto] = useState<ModalidadeProjetoRegional>('INSTALACAO_NOVA');
  const [percentualReducaoImposto, setPercentualReducaoImposto] = useState(75);
  const [opcaoReinvestimento30Percentual, setOpcaoReinvestimento30Percentual] = useState(false);
  const [lucroLiquidoExercicio, setLucroLiquidoExercicio] = useState(10000000);
  const [receitasFinanceirasExcluir, setReceitasFinanceirasExcluir] = useState(800000);
  const [receitasNaoOperacionaisExcluir, setReceitasNaoOperacionaisExcluir] = useState(200000);
  const [statusLaudo, setStatusLaudo] = useState<StatusLaudoRegional>('LAUDO_EXPEDIDO_VIGENTE');
  const [observacoes, setObservacoes] = useState('');

  // Ficha de Demonstração do Lucro da Exploração
  const [lucroLiquidoContabil, setLucroLiquidoContabil] = useState(12000000);
  const [recFinanDemonstrativo, setRecFinanDemonstrativo] = useState(950000);
  const [outrasExclusoesDemonstrativo, setOutrasExclusoesDemonstrativo] = useState(300000);

  const carregarDados = () => {
    if (!empresaAtiva) return;
    const data = dbService.getIncentivosRegionais(empresaAtiva.id, anoFiltro);
    setResumo(data);
  };

  useEffect(() => {
    carregarDados();
  }, [empresaAtiva, anoFiltro]);

  const handleNovo = () => {
    setItemEdicao(null);
    setRegiao('SUDENE');
    setNumeroLaudoConstitutivo(`LAUDO-SUDENE-${anoFiltro}-${Math.floor(100 + Math.random() * 900)}`);
    setDataExpedicaoLaudo(new Date().toISOString().split('T')[0]);
    setPrazoVigenciaAnos(10);
    setMunicipioEstadoUnidade('Cabo de Santo Agostinho - PE');
    setAtividadeIncentivada('Fabricação de Máquinas e Equipamentos Industriais');
    setModalidadeProjeto('INSTALACAO_NOVA');
    setPercentualReducaoImposto(75);
    setOpcaoReinvestimento30Percentual(false);
    setLucroLiquidoExercicio(10000000);
    setReceitasFinanceirasExcluir(800000);
    setReceitasNaoOperacionaisExcluir(200000);
    setStatusLaudo('LAUDO_EXPEDIDO_VIGENTE');
    setObservacoes('');
    setIsModalOpen(true);
  };

  const handleEditar = (item: ProjetoIncentivadoRegional) => {
    setItemEdicao(item);
    setRegiao(item.regiao);
    setNumeroLaudoConstitutivo(item.numeroLaudoConstitutivo);
    setDataExpedicaoLaudo(item.dataExpedicaoLaudo);
    setPrazoVigenciaAnos(item.prazoVigenciaAnos);
    setMunicipioEstadoUnidade(item.municipioEstadoUnidade);
    setAtividadeIncentivada(item.atividadeIncentivada);
    setModalidadeProjeto(item.modalidadeProjeto);
    setPercentualReducaoImposto(item.percentualReducaoImposto);
    setOpcaoReinvestimento30Percentual(item.opcaoReinvestimento30Percentual);
    setLucroLiquidoExercicio(item.lucroLiquidoExercicio);
    const dif = Math.max(0, item.lucroLiquidoExercicio - item.lucroExploracaoApurado);
    setReceitasFinanceirasExcluir(dif);
    setReceitasNaoOperacionaisExcluir(0);
    setStatusLaudo(item.statusLaudo);
    setObservacoes(item.observacoes || '');
    setIsModalOpen(true);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaAtiva) return;

    // Cálculo do Lucro da Exploração: Lucro Líquido - Receitas Financeiras - Receitas Não Operacionais
    const lucroExploracao = Math.max(0, lucroLiquidoExercicio - receitasFinanceirasExcluir - receitasNaoOperacionaisExcluir);
    
    // IRPJ padrão: 15% básico + 10% adicional (acima de R$ 240k anual)
    const adicional10 = Math.max(0, (lucroExploracao - 240000) * 0.10);
    const irpjPadrao = (lucroExploracao * 0.15) + adicional10;

    // Redução de 75%
    const reducao75 = Math.round((irpjPadrao * (percentualReducaoImposto / 100)) * 100) / 100;
    const irpjPagar = Math.max(0, irpjPadrao - reducao75);

    // Destinação para Reserva de Incentivos Fiscais no PL (Art. 195-A Lei 6.404/76)
    const destinadoPL = reducao75;

    // Data limite fim benefício
    const dataFim = new Date(dataExpedicaoLaudo);
    dataFim.setFullYear(dataFim.getFullYear() + prazoVigenciaAnos);

    const item: ProjetoIncentivadoRegional = {
      id: itemEdicao ? itemEdicao.id : `sud-${Date.now()}`,
      empresaId: empresaAtiva.id,
      regiao,
      numeroLaudoConstitutivo,
      dataExpedicaoLaudo,
      prazoVigenciaAnos,
      dataLimiteFimBeneficio: dataFim.toISOString().split('T')[0],
      municipioEstadoUnidade,
      atividadeIncentivada,
      modalidadeProjeto,
      percentualReducaoImposto,
      opcaoReinvestimento30Percentual,
      lucroLiquidoExercicio,
      lucroExploracaoApurado: lucroExploracao,
      irpjPadraoDevidoSemBeneficio: irpjPadrao,
      valorReducao75IRPJ: reducao75,
      irpjEfetivoPagar: irpjPagar,
      valorDestinadoReservaIncentivosPL: destinadoPL,
      statusLaudo,
      integradoContabil: itemEdicao ? itemEdicao.integradoContabil : false,
      observacoes: observacoes || undefined
    };

    const res = dbService.salvarProjetoRegional(item);
    if (res.sucesso) {
      setIsModalOpen(false);
      carregarDados();
    }
  };

  const handleExcluir = (id: string) => {
    if (window.confirm('Confirma a exclusão deste Projeto Incentivado Regional?')) {
      const res = dbService.excluirProjetoRegional(id);
      if (res.sucesso) carregarDados();
    }
  };

  const handleIntegrar = (id: string) => {
    const res = dbService.integrarReducaoSudeneContabil(id);
    alert(res.mensagem);
    carregarDados();
  };

  const projetosFiltrados = resumo?.projetos.filter(item => {
    const matchBusca = 
      item.numeroLaudoConstitutivo.toLowerCase().includes(busca.toLowerCase()) ||
      item.municipioEstadoUnidade.toLowerCase().includes(busca.toLowerCase()) ||
      item.atividadeIncentivada.toLowerCase().includes(busca.toLowerCase());

    const matchRegiao = filtroRegiao === 'TODOS' || item.regiao === filtroRegiao;
    const matchStatus = filtroStatus === 'TODOS' || item.statusLaudo === filtroStatus;

    return matchBusca && matchRegiao && matchStatus;
  }) || [];

  const handleImprimirRelatorio = () => {
    if (!onOpenReportPreview || !empresaAtiva || !resumo) return;

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #111;">
        <div style="text-align: center; border-bottom: 2px solid #059669; padding-bottom: 12px; margin-bottom: 20px;">
          <h2 style="margin: 0; color: #065f46; text-transform: uppercase;">Demonstrativo de Incentivos Fiscais Regionais (SUDENE / SUDAM)</h2>
          <p style="margin: 4px 0; font-size: 13px; color: #4b5563;">
            Redução de 75% do IRPJ sobre o Lucro da Exploração • MP nº 2.199-14/2001 • Lei nº 13.799/2018 • Art. 195-A Lei 6.404/76
          </p>
          <p style="margin: 2px 0; font-size: 12px; color: #6b7280;">
            Empresa: <strong>${empresaAtiva.razaoSocial}</strong> • CNPJ: ${empresaAtiva.cnpj} • Exercício: ${resumo.anoExercicio}
          </p>
        </div>

        <div style="display: flex; gap: 15px; margin-bottom: 20px;">
          <div style="flex: 1; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; background: #f8fafc;">
            <div style="font-size: 11px; color: #64748b;">LUCRO DA EXPLORAÇÃO TOTAL</div>
            <div style="font-size: 18px; font-weight: bold; color: #0f172a;">R$ ${resumo.totalLucroExploracaoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
          <div style="flex: 1; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; background: #f8fafc;">
            <div style="font-size: 11px; color: #64748b;">REDUÇÃO 75% IRPJ APURADA</div>
            <div style="font-size: 18px; font-weight: bold; color: #059669;">R$ ${resumo.totalReducao75AproveitadaBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
          <div style="flex: 1; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; background: #f8fafc;">
            <div style="font-size: 11px; color: #64748b;">RESERVA DE INCENTIVOS (PL)</div>
            <div style="font-size: 18px; font-weight: bold; color: #2563eb;">R$ ${resumo.totalDestinadoReservaPLBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
          <div style="flex: 1; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; background: #f8fafc;">
            <div style="font-size: 11px; color: #64748b;">OPÇÃO REINVESTIMENTO (30%)</div>
            <div style="font-size: 18px; font-weight: bold; color: #d97706;">R$ ${resumo.totalReinvestimentoApuradoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 25px;">
          <thead>
            <tr style="background: #1e293b; color: #fff;">
              <th style="padding: 8px; text-align: left; border: 1px solid #334155;">Laudo Constitutivo</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #334155;">Região / Unidade</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #334155;">Atividade Incentivada</th>
              <th style="padding: 8px; text-align: right; border: 1px solid #334155;">Lucro Exploração</th>
              <th style="padding: 8px; text-align: right; border: 1px solid #334155;">IRPJ Integral</th>
              <th style="padding: 8px; text-align: right; border: 1px solid #334155;">Redução 75%</th>
              <th style="padding: 8px; text-align: right; border: 1px solid #334155;">IRPJ a Recolher</th>
              <th style="padding: 8px; text-align: center; border: 1px solid #334155;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${resumo.projetos.map(p => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px; border: 1px solid #e2e8f0; font-family: monospace; font-weight: bold;">
                  ${p.numeroLaudoConstitutivo}<br>
                  <span style="font-size: 10px; color: #64748b;">Val: ${p.dataLimiteFimBeneficio}</span>
                </td>
                <td style="padding: 8px; border: 1px solid #e2e8f0;">
                  <strong style="color: ${p.regiao === 'SUDENE' ? '#059669' : '#0284c7'};">${p.regiao}</strong><br>
                  ${p.municipioEstadoUnidade}
                </td>
                <td style="padding: 8px; border: 1px solid #e2e8f0;">
                  ${p.atividadeIncentivada}<br>
                  <span style="color:#64748b; font-size: 10px;">Modalidade: ${p.modalidadeProjeto}</span>
                </td>
                <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold;">
                  R$ ${p.lucroExploracaoApurado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right;">
                  R$ ${p.irpjPadraoDevidoSemBeneficio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right; color: #059669; font-weight: bold;">
                  R$ ${p.valorReducao75IRPJ.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right; color: #dc2626; font-weight: bold;">
                  R$ ${p.irpjEfetivoPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold;">
                  ${p.statusLaudo}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="border-top: 1px dashed #cbd5e1; padding-top: 15px; font-size: 10px; color: #64748b; line-height: 1.5;">
          <strong>Obrigações Societárias & Fiscais do Incentivo Regional:</strong><br>
          1. <strong>Reserva de Incentivos Fiscais (Art. 195-A da Lei nº 6.404/1976):</strong> O valor da redução do imposto deve ser integralmente creditado na conta de Reserva de Incentivos Fiscais no Patrimônio Líquido.<br>
          2. <strong>Vedação de Distribuição de Dividendos:</strong> A quantia correspondente à redução de IRPJ não poderá ser distribuída aos sócios ou acionistas sob forma de dividendos ou restituição de capital em dinheiro, sob pena de perda imediata do benefício e cobrança do imposto acrescido de multa de ofício.<br>
          3. <strong>Lucro da Exploração:</strong> Corresponde ao lucro líquido contábil ajustado pelas exclusões legais de receitas financeiras, receitas não operacionais e subvenções governamentais.
        </div>
      </div>
    `;

    onOpenReportPreview({
      titulo: 'Demonstrativo de Incentivos Regionais SUDENE / SUDAM',
      subtitulo: `Exercício ${resumo.anoExercicio} • ${empresaAtiva.razaoSocial}`,
      conteudoHtml: html
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#121212] text-slate-100 overflow-hidden font-sans">
      {/* Header Superior */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#181818]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">Incentivos Regionais de IRPJ - SUDENE & SUDAM</h1>
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Redução 75% Lucro da Exploração • Art. 195-A LSA
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Laudos Constitutivos, Apuração do Lucro da Exploração e Destinação Obrigatória à Reserva de Incentivos Fiscais no PL
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#202020] px-3 py-1.5 rounded-lg border border-white/5">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-300">Exercício:</span>
            <select
              value={anoFiltro}
              onChange={(e) => setAnoFiltro(Number(e.target.value))}
              className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value={2026} className="bg-[#202020]">2026</option>
              <option value={2025} className="bg-[#202020]">2025</option>
              <option value={2024} className="bg-[#202020]">2024</option>
            </select>
          </div>

          <button
            onClick={carregarDados}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition border border-white/5"
            title="Atualizar dados"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleImprimirRelatorio}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-medium border border-white/10 transition"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            Imprimir Relatório
          </button>

          <button
            onClick={handleNovo}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            Novo Projeto Regional
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 p-6 border-b border-white/5 bg-[#141414]">
        <div className="p-4 rounded-xl bg-[#1b1b1b] border border-white/5 relative overflow-hidden group hover:border-emerald-500/30 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Lucro da Exploração Consolidado</span>
            <Factory className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-mono">
            R$ {(resumo?.totalLucroExploracaoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-semibold">{resumo?.projetos.length || 0} Projetos</span> em Operação
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#1b1b1b] border border-white/5 relative overflow-hidden group hover:border-emerald-500/30 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Redução 75% IRPJ Aproveitada</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2 font-mono">
            R$ {(resumo?.totalReducao75AproveitadaBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Economia Efetiva no IRPJ Anual</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#1b1b1b] border border-white/5 relative overflow-hidden group hover:border-blue-500/30 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Destinação à Reserva PL (Art. 195-A)</span>
            <Building className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400 mt-2 font-mono">
            R$ {(resumo?.totalDestinadoReservaPLBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Patrimônio Líquido Inalienável</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#1b1b1b] border border-white/5 relative overflow-hidden group hover:border-amber-500/30 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Reinvestimento Apurado (30%)</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-2 font-mono">
            R$ {(resumo?.totalReinvestimentoApuradoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Para Modernização Industrial</span>
          </div>
        </div>
      </div>

      {/* Abas de Navegação */}
      <div className="flex items-center justify-between px-6 border-b border-white/5 bg-[#181818]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAbaAtiva('projetos')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition ${
              abaAtiva === 'projetos'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            Laudos Constitutivos & Projetos ({projetosFiltrados.length})
          </button>

          <button
            onClick={() => setAbaAtiva('demonstrativo')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition ${
              abaAtiva === 'demonstrativo'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calculator className="w-4 h-4" />
            Demonstrativo do Lucro da Exploração
          </button>

          <button
            onClick={() => setAbaAtiva('legislacao')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition ${
              abaAtiva === 'legislacao'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            Marco Legal SUDENE/SUDAM & Regras de PL
          </button>
        </div>

        {abaAtiva === 'projetos' && (
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por Laudo, Município ou Atividade..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-64 bg-[#202020] text-xs text-white pl-8 pr-3 py-1.5 rounded-lg border border-white/5 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <select
              value={filtroRegiao}
              onChange={(e) => setFiltroRegiao(e.target.value)}
              className="bg-[#202020] text-xs text-slate-300 px-3 py-1.5 rounded-lg border border-white/5 focus:outline-none focus:border-emerald-500"
            >
              <option value="TODOS">Todas as Regiões</option>
              <option value="SUDENE">SUDENE (Nordeste / MG / ES)</option>
              <option value="SUDAM">SUDAM (Amazônia Legal)</option>
            </select>

            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="bg-[#202020] text-xs text-slate-300 px-3 py-1.5 rounded-lg border border-white/5 focus:outline-none focus:border-emerald-500"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="LAUDO_EXPEDIDO_VIGENTE">Laudo Expedido Vigente</option>
              <option value="EM_ANALISE_SUPERINTENDENCIA">Em Análise</option>
              <option value="SUSPENSO">Suspenso</option>
              <option value="EXPIRADO">Expirado</option>
            </select>
          </div>
        )}
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-auto p-6">
        {abaAtiva === 'projetos' && (
          <div className="bg-[#181818] rounded-xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#202020] text-slate-400 font-semibold border-b border-white/5">
                    <th className="py-3 px-4">Laudo Constitutivo</th>
                    <th className="py-3 px-4">Região / Município</th>
                    <th className="py-3 px-4">Atividade / Modalidade</th>
                    <th className="py-3 px-4 text-right">Lucro da Exploração</th>
                    <th className="py-3 px-4 text-right">IRPJ sem Benefício</th>
                    <th className="py-3 px-4 text-right">Redução 75%</th>
                    <th className="py-3 px-4 text-right">IRPJ a Recolher</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Reserva PL</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {projetosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-500">
                        Nenhum projeto incentivado regional localizado para os filtros informados.
                      </td>
                    </tr>
                  ) : (
                    projetosFiltrados.map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition">
                        <td className="py-3 px-4">
                          <div className="font-mono font-semibold text-white">{item.numeroLaudoConstitutivo}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            Venc: {item.dataLimiteFimBeneficio} ({item.prazoVigenciaAnos}a)
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            item.regiao === 'SUDENE'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          }`}>
                            {item.regiao}
                          </span>
                          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            {item.municipioEstadoUnidade}
                          </div>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <div className="truncate text-slate-200 font-medium" title={item.atividadeIncentivada}>
                            {item.atividadeIncentivada}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {item.modalidadeProjeto}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-white">
                          R$ {item.lucroExploracaoApurado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-300">
                          R$ {item.irpjPadraoDevidoSemBeneficio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                          R$ {item.valorReducao75IRPJ.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          <div className="text-[10px] text-slate-500 font-normal">
                            (75% Redução)
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-rose-400">
                          R$ {item.irpjEfetivoPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            item.statusLaudo === 'LAUDO_EXPEDIDO_VIGENTE'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                          }`}>
                            {item.statusLaudo}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {item.integradoContabil ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-blue-400 font-medium">
                              <CheckCircle className="w-3.5 h-3.5" />
                              PL Creditado
                            </span>
                          ) : (
                            <button
                              onClick={() => handleIntegrar(item.id)}
                              className="px-2 py-1 rounded bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white text-[11px] font-medium border border-blue-500/30 transition"
                            >
                              Destinar PL
                            </button>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleEditar(item)}
                              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-white/5 transition"
                              title="Editar Projeto"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleExcluir(item.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-white/5 transition"
                              title="Excluir Projeto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

        {abaAtiva === 'demonstrativo' && (
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-1 bg-[#181818] p-6 rounded-xl border border-white/5 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                <Calculator className="w-4 h-4" />
                Simulador do Lucro da Exploração
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ajuste os valores contábeis da DRE para verificar a base elegível à redução de 75% e a segregação de receitas operacionais e não operacionais.
              </p>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1.5">
                  Lucro Líquido Contábil antes do IRPJ/CSLL (R$)
                </label>
                <input
                  type="number"
                  step="100000"
                  value={lucroLiquidoContabil}
                  onChange={(e) => setLucroLiquidoContabil(Number(e.target.value))}
                  className="w-full bg-[#202020] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1.5">
                  (-) Receitas Financeiras a Excluir (R$)
                </label>
                <input
                  type="number"
                  step="10000"
                  value={recFinanDemonstrativo}
                  onChange={(e) => setRecFinanDemonstrativo(Number(e.target.value))}
                  className="w-full bg-[#202020] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1.5">
                  (-) Outras Receitas Não Operacionais / Subvenções (R$)
                </label>
                <input
                  type="number"
                  step="10000"
                  value={outrasExclusoesDemonstrativo}
                  onChange={(e) => setOutrasExclusoesDemonstrativo(Number(e.target.value))}
                  className="w-full bg-[#202020] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs space-y-2">
                <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Blindagem da Ficha ECF
                </div>
                <div className="text-slate-300 leading-relaxed">
                  Os valores calculados alimentam automaticamente as fichas de Apuração do IRPJ sobre Lucro Real da ECF (Blocos N e X).
                </div>
              </div>
            </div>

            <div className="col-span-2 bg-[#181818] p-6 rounded-xl border border-white/5 space-y-6">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                Demonstrativo de Ajustes & Benefício Fiscal Efetivo
              </h3>

              {(() => {
                const baseLucroExploracao = Math.max(0, lucroLiquidoContabil - recFinanDemonstrativo - outrasExclusoesDemonstrativo);
                const irpjBasico15 = baseLucroExploracao * 0.15;
                const irpjAdicional10 = Math.max(0, (baseLucroExploracao - 240000) * 0.10);
                const irpjTotalIntegral = irpjBasico15 + irpjAdicional10;
                const valorReducao75 = irpjTotalIntegral * 0.75;
                const irpjFinalPagar = irpjTotalIntegral - valorReducao75;

                return (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-[#202020] border border-white/5 space-y-3">
                      <div className="flex items-center justify-between text-xs pb-2 border-b border-white/5">
                        <span className="text-slate-400">Lucro Líquido Contábil do Exercício:</span>
                        <span className="font-mono text-white font-bold">R$ {lucroLiquidoContabil.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs pb-2 border-b border-white/5 text-rose-400">
                        <span>(-) Receitas Financeiras Excluídas:</span>
                        <span className="font-mono font-bold">- R$ {recFinanDemonstrativo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs pb-2 border-b border-white/5 text-rose-400">
                        <span>(-) Receitas Não Operacionais Excluídas:</span>
                        <span className="font-mono font-bold">- R$ {outrasExclusoesDemonstrativo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm pt-1 text-emerald-400 font-bold">
                        <span>(=) Lucro da Exploração Apurado:</span>
                        <span className="font-mono text-base">R$ {baseLucroExploracao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-[#141414] border border-white/5">
                        <span className="text-[11px] text-slate-400">IRPJ Sem Benefício</span>
                        <div className="text-lg font-bold text-slate-300 font-mono mt-1">
                          R$ {irpjTotalIntegral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <span className="text-[10px] text-slate-500">15% + 10% Adicional</span>
                      </div>

                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <span className="text-[11px] text-emerald-400 font-medium">Redução de 75% (Economia)</span>
                        <div className="text-lg font-bold text-emerald-400 font-mono mt-1">
                          R$ {valorReducao75.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <span className="text-[10px] text-emerald-300/80">Crédito no PL (Art. 195-A)</span>
                      </div>

                      <div className="p-4 rounded-xl bg-[#141414] border border-white/5">
                        <span className="text-[11px] text-slate-400">IRPJ Efetivo a Pagar (DARF)</span>
                        <div className="text-lg font-bold text-rose-400 font-mono mt-1">
                          R$ {irpjFinalPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <span className="text-[10px] text-slate-500">25% restante do imposto</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {abaAtiva === 'legislacao' && (
          <div className="bg-[#181818] p-6 rounded-xl border border-white/5 space-y-6 max-w-4xl">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" />
                Marco Regulatório dos Incentivos Regionais (SUDENE / SUDAM)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Regras tributárias, societárias e restrições patrimoniais aplicáveis
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#141414] border border-white/5 space-y-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  MP Nº 2.199-14/2001 & LEI Nº 13.799/2018
                </span>
                <h3 className="text-xs font-bold text-white">Redução de 75% do IRPJ</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  As pessoas jurídicas com empreendimentos industriais ou agroindustriais protocolados nas áreas de atuação da SUDENE ou SUDAM fazem jus à redução de 75% do IRPJ pelo prazo improrrogável de 10 anos.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#141414] border border-white/5 space-y-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  ARTIGO 195-A DA LEI Nº 6.404/1976 (LSA)
                </span>
                <h3 className="text-xs font-bold text-white">Reserva de Incentivos Fiscais no PL</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  A parcela do lucro líquido correspondente à redução do IRPJ deve ser integralmente destinada à Reserva de Incentivos Fiscais, sendo vedada sua distribuição sob a forma de dividendos.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#141414] border border-white/5 space-y-3">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Risco de Descumprimento & Perda do Benefício
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                A inobservância da retenção na Reserva do PL ou a distribuição indevida dos recursos aos sócios enseja a imediata cobrança do IRPJ dispensado acrescido de multa de ofício de 75% e juros de mora pela taxa SELIC, além do cancelamento definitivo do Laudo Constitutivo.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal Formulário */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#222]">
              <div className="flex items-center gap-2.5">
                <Compass className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  {itemEdicao ? 'Editar Projeto Regional' : 'Novo Projeto Regional (SUDENE / SUDAM)'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvar} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">
                    Superintendência Regional *
                  </label>
                  <select
                    value={regiao}
                    onChange={(e) => setRegiao(e.target.value as RegiaoIncentivoRegional)}
                    className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="SUDENE">SUDENE (Nordeste, Norte de MG e ES)</option>
                    <option value="SUDAM">SUDAM (Amazônia Legal)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">
                    Número do Laudo Constitutivo *
                  </label>
                  <input
                    type="text"
                    required
                    value={numeroLaudoConstitutivo}
                    onChange={(e) => setNumeroLaudoConstitutivo(e.target.value)}
                    placeholder="Ex: LAUDO-SUDENE-2024-0089"
                    className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Data Expedição</label>
                  <input
                    type="date"
                    required
                    value={dataExpedicaoLaudo}
                    onChange={(e) => setDataExpedicaoLaudo(e.target.value)}
                    className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Vigência (Anos)</label>
                  <input
                    type="number"
                    required
                    value={prazoVigenciaAnos}
                    onChange={(e) => setPrazoVigenciaAnos(Number(e.target.value))}
                    className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Modalidade Projeto</label>
                  <select
                    value={modalidadeProjeto}
                    onChange={(e) => setModalidadeProjeto(e.target.value as ModalidadeProjetoRegional)}
                    className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="INSTALACAO_NOVA">Instalação Nova</option>
                    <option value="MODERNIZACAO_TOTAL">Modernização Total</option>
                    <option value="MODERNIZACAO_PARCIAL">Modernização Parcial</option>
                    <option value="DIVERSIFICACAO">Diversificação</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">
                    Município / Estado da Unidade *
                  </label>
                  <input
                    type="text"
                    required
                    value={municipioEstadoUnidade}
                    onChange={(e) => setMunicipioEstadoUnidade(e.target.value)}
                    placeholder="Ex: Feira de Santana - BA"
                    className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">
                    Atividade Produtiva Incentivada *
                  </label>
                  <input
                    type="text"
                    required
                    value={atividadeIncentivada}
                    onChange={(e) => setAtividadeIncentivada(e.target.value)}
                    placeholder="Ex: Indústria Química de Resinas e Biopolímeros"
                    className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Lucro Líquido Exercício (R$)</label>
                  <input
                    type="number"
                    step="10000"
                    required
                    value={lucroLiquidoExercicio}
                    onChange={(e) => setLucroLiquidoExercicio(Number(e.target.value))}
                    className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">(-) Rec. Financeiras (R$)</label>
                  <input
                    type="number"
                    step="1000"
                    value={receitasFinanceirasExcluir}
                    onChange={(e) => setReceitasFinanceirasExcluir(Number(e.target.value))}
                    className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">(-) Rec. Não Operacionais (R$)</label>
                  <input
                    type="number"
                    step="1000"
                    value={receitasNaoOperacionaisExcluir}
                    onChange={(e) => setReceitasNaoOperacionaisExcluir(Number(e.target.value))}
                    className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-[#141414] rounded-lg border border-white/5">
                <input
                  type="checkbox"
                  id="chkReinvestimento"
                  checked={opcaoReinvestimento30Percentual}
                  onChange={(e) => setOpcaoReinvestimento30Percentual(e.target.checked)}
                  className="rounded border-white/20 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="chkReinvestimento" className="text-xs text-slate-200 cursor-pointer">
                  Optar por Reinvestimento de 30% do IRPJ em projeto de aquisição de máquinas e equipamentos novos
                </label>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Observações do Laudo</label>
                <textarea
                  rows={2}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Informações do parecer técnico da superintendência e compromissos assumidos..."
                  className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition"
                >
                  Salvar Projeto Regional
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
