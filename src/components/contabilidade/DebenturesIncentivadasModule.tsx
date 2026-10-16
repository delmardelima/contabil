import React, { useState, useEffect } from 'react';
import {
  Coins,
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
  Landmark,
  Building2,
  Percent,
  Clock,
  Briefcase
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  Empresa,
  TituloDebenture,
  ResumoDebentures,
  TipoDebenture,
  StatusEmissaoDebenture
} from '../../types/contabil';

interface DebenturesIncentivadasModuleProps {
  empresaAtiva: Empresa | null;
  onOpenReportPreview?: (config: {
    titulo: string;
    subtitulo: string;
    conteudoHtml: string;
    imprimirDireto?: boolean;
  }) => void;
}

export const DebenturesIncentivadasModule: React.FC<DebenturesIncentivadasModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [resumo, setResumo] = useState<ResumoDebentures | null>(null);
  const [anoFiltro, setAnoFiltro] = useState<number>(2026);
  const [abaAtiva, setAbaAtiva] = useState<'debentures' | 'comparativo' | 'legislacao'>('debentures');
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');

  // Modal formulário
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemEdicao, setItemEdicao] = useState<TituloDebenture | null>(null);

  // Formulário
  const [serieNumero, setSerieNumero] = useState('');
  const [tipoDebenture, setTipoDebenture] = useState<TipoDebenture>('INFRAESTRUTURA_LEI_14801');
  const [descricaoProjetoMinisterio, setDescricaoProjetoMinisterio] = useState('');
  const [setorPrioritario, setSetorPrioritario] = useState('Energia Renovável');
  const [dataEmissao, setDataEmissao] = useState('2026-01-10');
  const [dataVencimento, setDataVencimento] = useState('2036-01-10');
  const [prazoMeses, setPrazoMeses] = useState(120);
  const [quantidadeTitulos, setQuantidadeTitulos] = useState(10000);
  const [valorNominalUnitario, setValorNominalUnitario] = useState(1000);
  const [remuneracaoIndexador, setRemuneracaoIndexador] = useState('IPCA + 6,50% a.a.');
  const [taxaJurosAnual, setTaxaJurosAnual] = useState(6.50);
  const [custoTransacaoEmissao, setCustoTransacaoEmissao] = useState(250000);
  const [despesaJurosPeriodo, setDespesaJurosPeriodo] = useState(650000);
  const [status, setStatus] = useState<StatusEmissaoDebenture>('EMITIDA_ATIVA');
  const [agenteFiduciario, setAgenteFiduciario] = useState('Pentágono DTVM S.A.');
  const [observacoes, setObservacoes] = useState('');

  // Simulador comparativo de Custo Efetivo WACC
  const [simVolumeEmissao, setSimVolumeEmissao] = useState(20000000);
  const [simTaxaJurosNominal, setSimTaxaJurosNominal] = useState(7.00);

  const carregarDados = () => {
    if (!empresaAtiva) return;
    const data = dbService.getDebentures(empresaAtiva.id, anoFiltro);
    setResumo(data);
  };

  useEffect(() => {
    carregarDados();
  }, [empresaAtiva, anoFiltro]);

  const handleNovo = () => {
    setItemEdicao(null);
    setSerieNumero(`DEB-2026/${Math.floor(10 + Math.random() * 90)}-INFRA`);
    setTipoDebenture('INFRAESTRUTURA_LEI_14801');
    setDescricaoProjetoMinisterio('Parque Eólico e Usinas Fotovoltaicas - Portaria MME');
    setSetorPrioritario('Energia Renovável');
    setDataEmissao(new Date().toISOString().split('T')[0]);
    const venc = new Date();
    venc.setFullYear(venc.getFullYear() + 10);
    setDataVencimento(venc.toISOString().split('T')[0]);
    setPrazoMeses(120);
    setQuantidadeTitulos(10000);
    setValorNominalUnitario(1000);
    setRemuneracaoIndexador('IPCA + 6,50% a.a.');
    setTaxaJurosAnual(6.50);
    setCustoTransacaoEmissao(250000);
    setDespesaJurosPeriodo(650000);
    setStatus('EMITIDA_ATIVA');
    setAgenteFiduciario('Pentágono DTVM S.A.');
    setObservacoes('');
    setIsModalOpen(true);
  };

  const handleEditar = (item: TituloDebenture) => {
    setItemEdicao(item);
    setSerieNumero(item.serieNumero);
    setTipoDebenture(item.tipoDebenture);
    setDescricaoProjetoMinisterio(item.descricaoProjetoMinisterio);
    setSetorPrioritario(item.setorPrioritario);
    setDataEmissao(item.dataEmissao);
    setDataVencimento(item.dataVencimento);
    setPrazoMeses(item.prazoMeses);
    setQuantidadeTitulos(item.quantidadeTitulos);
    setValorNominalUnitario(item.valorNominalUnitario);
    setRemuneracaoIndexador(item.remuneracaoIndexador);
    setTaxaJurosAnual(item.taxaJurosAnual);
    setCustoTransacaoEmissao(item.custoTransacaoEmissao);
    setDespesaJurosPeriodo(item.despesaJurosPeriodo);
    setStatus(item.status);
    setAgenteFiduciario(item.agenteFiduciario);
    setObservacoes(item.observacoes || '');
    setIsModalOpen(true);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaAtiva) return;

    const valorTotalEmissao = quantidadeTitulos * valorNominalUnitario;
    const beneficio30 = tipoDebenture === 'INFRAESTRUTURA_LEI_14801'
      ? Math.round((despesaJurosPeriodo * 0.30) * 100) / 100
      : 0;
    const economiaFiscal = Math.round((beneficio30 * 0.34) * 100) / 100; // 25% IRPJ + 9% CSLL

    const item: TituloDebenture = {
      id: itemEdicao ? itemEdicao.id : `deb-${Date.now()}`,
      empresaId: empresaAtiva.id,
      serieNumero,
      tipoDebenture,
      descricaoProjetoMinisterio,
      setorPrioritario,
      dataEmissao,
      dataVencimento,
      prazoMeses,
      quantidadeTitulos,
      valorNominalUnitario,
      valorTotalEmissao,
      remuneracaoIndexador,
      taxaJurosAnual,
      custoTransacaoEmissao,
      despesaJurosPeriodo,
      beneficioDeducaoAdicional30Percentual: beneficio30,
      economiaFiscal30IRPJCSLL: economiaFiscal,
      status,
      agenteFiduciario,
      integradoContabil: itemEdicao ? itemEdicao.integradoContabil : false,
      observacoes: observacoes || undefined
    };

    const res = dbService.salvarTituloDebenture(item);
    if (res.sucesso) {
      setIsModalOpen(false);
      carregarDados();
    }
  };

  const handleExcluir = (id: string) => {
    if (window.confirm('Confirma a exclusão deste título de debênture?')) {
      const res = dbService.excluirTituloDebenture(id);
      if (res.sucesso) carregarDados();
    }
  };

  const handleIntegrar = (id: string) => {
    const res = dbService.integrarJurosDebenturesLalur(id);
    alert(res.mensagem);
    carregarDados();
  };

  const debenturesFiltradas = resumo?.debentures.filter(item => {
    const matchBusca = 
      item.serieNumero.toLowerCase().includes(busca.toLowerCase()) ||
      item.descricaoProjetoMinisterio.toLowerCase().includes(busca.toLowerCase()) ||
      item.setorPrioritario.toLowerCase().includes(busca.toLowerCase()) ||
      item.agenteFiduciario.toLowerCase().includes(busca.toLowerCase());

    const matchTipo = filtroTipo === 'TODOS' || item.tipoDebenture === filtroTipo;
    const matchStatus = filtroStatus === 'TODOS' || item.status === filtroStatus;

    return matchBusca && matchTipo && matchStatus;
  }) || [];

  const handleImprimirRelatorio = () => {
    if (!onOpenReportPreview || !empresaAtiva || !resumo) return;

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #111;">
        <div style="text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px;">
          <h2 style="margin: 0; color: #1e3a8a; text-transform: uppercase;">Controle de Debêntures Incentivadas e de Infraestrutura</h2>
          <p style="margin: 4px 0; font-size: 13px; color: #4b5563;">
            Lei Federal nº 12.431/2011 • Lei Federal nº 14.801/2024 (Dedução Adicional 30%) • CPC 08 / CPC 48
          </p>
          <p style="margin: 2px 0; font-size: 12px; color: #6b7280;">
            Empresa: <strong>${empresaAtiva.razaoSocial}</strong> • CNPJ: ${empresaAtiva.cnpj} • Exercício: ${resumo.anoExercicio}
          </p>
        </div>

        <div style="display: flex; gap: 15px; margin-bottom: 20px;">
          <div style="flex: 1; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; background: #f8fafc;">
            <div style="font-size: 11px; color: #64748b;">TOTAL EMITIDO (PASSIVO)</div>
            <div style="font-size: 18px; font-weight: bold; color: #0f172a;">R$ ${resumo.totalDebenturesEmitidasBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
          <div style="flex: 1; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; background: #f8fafc;">
            <div style="font-size: 11px; color: #64748b;">JUROS PAGOS / APROPRIADOS</div>
            <div style="font-size: 18px; font-weight: bold; color: #2563eb;">R$ ${resumo.totalJurosPagosPeriodoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
          <div style="flex: 1; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; background: #f8fafc;">
            <div style="font-size: 11px; color: #64748b;">DEDUÇÃO EXTRA 30% (LEI 14.801)</div>
            <div style="font-size: 18px; font-weight: bold; color: #16a34a;">R$ ${resumo.totalDeducaoAdicionalLei14801BRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
          <div style="flex: 1; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; background: #f8fafc;">
            <div style="font-size: 11px; color: #64748b;">ECONOMIA TRIBUTÁRIA (34%)</div>
            <div style="font-size: 18px; font-weight: bold; color: #d97706;">R$ ${resumo.totalEconomiaTributariaBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 25px;">
          <thead>
            <tr style="background: #1e293b; color: #fff;">
              <th style="padding: 8px; text-align: left; border: 1px solid #334155;">Série / Emissão</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #334155;">Regime / Lei</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #334155;">Projeto Prioritário / Setor</th>
              <th style="padding: 8px; text-align: right; border: 1px solid #334155;">Volume Total</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #334155;">Indexador</th>
              <th style="padding: 8px; text-align: right; border: 1px solid #334155;">Juros Período</th>
              <th style="padding: 8px; text-align: right; border: 1px solid #334155;">Dedução 30%</th>
              <th style="padding: 8px; text-align: right; border: 1px solid #334155;">Economia Fiscal</th>
              <th style="padding: 8px; text-align: center; border: 1px solid #334155;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${resumo.debentures.map(d => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px; border: 1px solid #e2e8f0; font-family: monospace; font-weight: bold;">${d.serieNumero}</td>
                <td style="padding: 8px; border: 1px solid #e2e8f0;">
                  ${d.tipoDebenture === 'INFRAESTRUTURA_LEI_14801' ? 'Lei 14.801/24 (Emissor)' : 'Lei 12.431/11 (Investidor)'}
                </td>
                <td style="padding: 8px; border: 1px solid #e2e8f0;">${d.descricaoProjetoMinisterio}<br><span style="color:#64748b;">${d.setorPrioritario}</span></td>
                <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold;">R$ ${d.valorTotalEmissao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="padding: 8px; border: 1px solid #e2e8f0;">${d.remuneracaoIndexador}</td>
                <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right;">R$ ${d.despesaJurosPeriodo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right; color: #16a34a; font-weight: bold;">
                  R$ ${d.beneficioDeducaoAdicional30Percentual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right; color: #d97706; font-weight: bold;">
                  R$ ${d.economiaFiscal30IRPJCSLL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold;">
                  ${d.status}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="border-top: 1px dashed #cbd5e1; padding-top: 15px; font-size: 10px; color: #64748b; line-height: 1.5;">
          <strong>Fundamentação Legal & Reflexos no LALUR:</strong><br>
          1. <strong>Debêntures de Infraestrutura (Lei nº 14.801/2024):</strong> A pessoa jurídica emissora pode deduzir, na apuração do Lucro Real e da base de cálculo da CSLL, montante adicional equivalente a 30% do valor dos juros pagos a título de remuneração desses títulos.<br>
          2. <strong>Contabilização & CPC 08 / CPC 48:</strong> Os custos diretos de transação da emissão são apropriados pelo método da Taxa Interna de Retorno (TIR) ao longo do prazo de vigência dos títulos.<br>
          3. <strong>Registro no e-LALUR / e-LACS:</strong> O benefício dos 30% adicionais é lançado na Parte A como exclusão sem correspondência patrimonial direta.
        </div>
      </div>
    `;

    onOpenReportPreview({
      titulo: 'Controle de Debêntures Incentivadas e de Infraestrutura',
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
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">Debêntures Incentivadas e de Infraestrutura</h1>
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Lei 14.801/24 (Dedução 30%) • Lei 12.431/11
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Captação em Mercado de Capitais, Dedução Adicional de 30% de Juros no Lucro Real/CSLL e Custo Amortizado (CPC 48)
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
            Nova Emissão de Debêntures
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 p-6 border-b border-white/5 bg-[#141414]">
        <div className="p-4 rounded-xl bg-[#1b1b1b] border border-white/5 relative overflow-hidden group hover:border-emerald-500/30 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Emitido em Carteira</span>
            <Coins className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-mono">
            R$ {(resumo?.totalDebenturesEmitidasBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-semibold">{resumo?.debentures.length || 0} Séries</span> no Passivo Não Circulante
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#1b1b1b] border border-white/5 relative overflow-hidden group hover:border-blue-500/30 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Juros Apropriados no Exercício</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400 mt-2 font-mono">
            R$ {(resumo?.totalJurosPagosPeriodoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Despesas Financeiras Reconhecidas</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#1b1b1b] border border-white/5 relative overflow-hidden group hover:border-purple-500/30 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Dedução Extra 30% (Lei 14.801)</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400 mt-2 font-mono">
            R$ {(resumo?.totalDeducaoAdicionalLei14801BRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Exclusão no e-Lalur / e-Lacs</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#1b1b1b] border border-white/5 relative overflow-hidden group hover:border-amber-500/30 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Economia Fiscal Efetiva (34%)</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-2 font-mono">
            R$ {(resumo?.totalEconomiaTributariaBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>25% IRPJ + 9% CSLL s/ Adicional</span>
          </div>
        </div>
      </div>

      {/* Abas */}
      <div className="flex items-center justify-between px-6 border-b border-white/5 bg-[#181818]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAbaAtiva('debentures')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition ${
              abaAtiva === 'debentures'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Coins className="w-4 h-4" />
            Títulos de Debêntures ({debenturesFiltradas.length})
          </button>

          <button
            onClick={() => setAbaAtiva('comparativo')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition ${
              abaAtiva === 'comparativo'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calculator className="w-4 h-4" />
            Simulador Lei 14.801/24 vs Lei 12.431/11
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
            Fundamentos Lei 14.801/2024 & CPC 48
          </button>
        </div>

        {abaAtiva === 'debentures' && (
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por Série, Projeto, Setor ou Agente..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-64 bg-[#202020] text-xs text-white pl-8 pr-3 py-1.5 rounded-lg border border-white/5 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="bg-[#202020] text-xs text-slate-300 px-3 py-1.5 rounded-lg border border-white/5 focus:outline-none focus:border-emerald-500"
            >
              <option value="TODOS">Todos os Modelos</option>
              <option value="INFRAESTRUTURA_LEI_14801">Lei 14.801/24 (Dedução Emissor 30%)</option>
              <option value="INCENTIVADA_LEI_12431">Lei 12.431/11 (Isenção Investidor)</option>
              <option value="PADRAO_NAO_INCENTIVADA">Padrão Não Incentivada</option>
            </select>

            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="bg-[#202020] text-xs text-slate-300 px-3 py-1.5 rounded-lg border border-white/5 focus:outline-none focus:border-emerald-500"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="EMITIDA_ATIVA">Emitida / Ativa</option>
              <option value="EM_ANALISE">Em Análise</option>
              <option value="RESGATADA">Resgatada</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
          </div>
        )}
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-auto p-6">
        {abaAtiva === 'debentures' && (
          <div className="bg-[#181818] rounded-xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#202020] text-slate-400 font-semibold border-b border-white/5">
                    <th className="py-3 px-4">Série / Emissão</th>
                    <th className="py-3 px-4">Regime Legal</th>
                    <th className="py-3 px-4">Projeto Prioritário / Setor</th>
                    <th className="py-3 px-4 text-right">Volume Emitido</th>
                    <th className="py-3 px-4 text-left">Remuneração</th>
                    <th className="py-3 px-4 text-right">Juros Período</th>
                    <th className="py-3 px-4 text-right">Dedução 30%</th>
                    <th className="py-3 px-4 text-right">Economia 34%</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Integração</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {debenturesFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-slate-500">
                        Nenhuma emissão de debêntures localizada para os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    debenturesFiltradas.map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition">
                        <td className="py-3 px-4">
                          <div className="font-mono font-semibold text-white">{item.serieNumero}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            Venc: {item.dataVencimento} ({item.prazoMeses}m)
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            item.tipoDebenture === 'INFRAESTRUTURA_LEI_14801'
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                              : item.tipoDebenture === 'INCENTIVADA_LEI_12431'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                          }`}>
                            {item.tipoDebenture === 'INFRAESTRUTURA_LEI_14801' ? 'Lei 14.801 (Emissor)' : 'Lei 12.431 (PF)'}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <div className="truncate text-slate-200 font-medium" title={item.descricaoProjetoMinisterio}>
                            {item.descricaoProjetoMinisterio}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {item.setorPrioritario} • Agente: {item.agenteFiduciario}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-white">
                          R$ {item.valorTotalEmissao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          <div className="text-[10px] text-slate-500 font-normal">
                            {item.quantidadeTitulos.toLocaleString('pt-BR')} tit. a R$ {item.valorNominalUnitario}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-300">
                          {item.remuneracaoIndexador}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-300">
                          R$ {item.despesaJurosPeriodo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                          {item.beneficioDeducaoAdicional30Percentual > 0 ? (
                            `R$ ${item.beneficioDeducaoAdicional30Percentual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-amber-400">
                          {item.economiaFiscal30IRPJCSLL > 0 ? (
                            `R$ ${item.economiaFiscal30IRPJCSLL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            item.status === 'EMITIDA_ATIVA'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : item.status === 'EM_ANALISE'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {item.integradoContabil ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                              <CheckCircle className="w-3.5 h-3.5" />
                              e-LALUR OK
                            </span>
                          ) : (
                            <button
                              onClick={() => handleIntegrar(item.id)}
                              className="px-2 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white text-[11px] font-medium border border-emerald-500/30 transition"
                            >
                              Integrar
                            </button>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleEditar(item)}
                              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-white/5 transition"
                              title="Editar Emissão"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleExcluir(item.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-white/5 transition"
                              title="Excluir Emissão"
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

        {abaAtiva === 'comparativo' && (
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-1 bg-[#181818] p-6 rounded-xl border border-white/5 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                <Calculator className="w-4 h-4" />
                Simulador de Custo Efetivo da Dívida
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Compare o custo financeiro líquido após os efeitos tributários da dedução convencional e do bônus adicional de 30% da Lei 14.801/2024.
              </p>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1.5">
                  Volume de Emissão Planejado (R$)
                </label>
                <input
                  type="number"
                  step="500000"
                  value={simVolumeEmissao}
                  onChange={(e) => setSimVolumeEmissao(Number(e.target.value))}
                  className="w-full bg-[#202020] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1.5">
                  Taxa de Juros Anual Paga (% a.a.)
                </label>
                <input
                  type="number"
                  step="0.10"
                  value={simTaxaJurosNominal}
                  onChange={(e) => setSimTaxaJurosNominal(Number(e.target.value))}
                  className="w-full bg-[#202020] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs space-y-2">
                <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                  <Percent className="w-4 h-4" />
                  Alavancagem Fiscal Lei 14.801/2024
                </div>
                <div className="text-slate-300 leading-relaxed">
                  A dedução padrão no Lucro Real gera 34% de economia. Com os 30% adicionais da Lei 14.801/24, a economia total sobre os juros salta para <strong>44,20%</strong> (1,30 x 34%).
                </div>
              </div>
            </div>

            <div className="col-span-2 bg-[#181818] p-6 rounded-xl border border-white/5 space-y-6">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
                Matriz Comparativa de Custo Efetivo Pós-Tributos
              </h3>

              {(() => {
                const jurosBrutosAnuais = (simVolumeEmissao * simTaxaJurosNominal) / 100;
                
                // Cenário 1: Debênture Comum ou Lei 12.431/11 (apenas dedução normal de 34% no Lucro Real)
                const economiaNormal34 = jurosBrutosAnuais * 0.34;
                const custoLiquidoNormal = jurosBrutosAnuais - economiaNormal34;
                const taxaEfetivaNormal = (custoLiquidoNormal / simVolumeEmissao) * 100;

                // Cenário 2: Lei 14.801/24 (Dedução de 130% dos juros no Lucro Real/CSLL)
                const deducaoAdicional30 = jurosBrutosAnuais * 0.30;
                const economiaAdicionalLei14801 = deducaoAdicional30 * 0.34;
                const economiaTotalLei14801 = economiaNormal34 + economiaAdicionalLei14801;
                const custoLiquidoLei14801 = jurosBrutosAnuais - economiaTotalLei14801;
                const taxaEfetivaLei14801 = (custoLiquidoLei14801 / simVolumeEmissao) * 100;

                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-[#202020] border border-white/5 space-y-2">
                        <span className="text-[11px] text-slate-400 font-medium">Lei 12.431/2011 (Convencional)</span>
                        <div className="text-xl font-bold text-slate-200 font-mono">
                          {taxaEfetivaNormal.toFixed(2)}% a.a.
                        </div>
                        <div className="text-xs text-slate-400">
                          Juros Líquidos: R$ {custoLiquidoNormal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Benefício fiscal restrito ao investidor (PF isento de IRRF)
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-2">
                        <span className="text-[11px] text-purple-300 font-medium">Lei 14.801/2024 (Infraestrutura)</span>
                        <div className="text-xl font-bold text-purple-300 font-mono">
                          {taxaEfetivaLei14801.toFixed(2)}% a.a.
                        </div>
                        <div className="text-xs text-purple-200">
                          Juros Líquidos: R$ {custoLiquidoLei14801.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] text-emerald-400 font-semibold">
                          Economia Adicional: R$ {economiaAdicionalLei14801.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/ano
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#141414] border border-white/5 space-y-3">
                      <h4 className="text-xs font-semibold text-white">Demonstrativo da Vantagem Competitiva:</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        A emissão sob a égide da Lei 14.801/2024 reduz o custo efetivo de captação da empresa de{' '}
                        <strong className="text-white">{taxaEfetivaNormal.toFixed(2)}%</strong> para{' '}
                        <strong className="text-emerald-400">{taxaEfetivaLei14801.toFixed(2)}%</strong> ao ano, representando um ganho financeiro direto no caixa operacional da entidade.
                      </p>
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
                <Landmark className="w-5 h-5 text-emerald-400" />
                Quadro Regulatório das Debêntures no Brasil
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Evolução legislativa entre a Lei 12.431/2011 e a moderna Lei 14.801/2024
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#141414] border border-white/5 space-y-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  LEI Nº 12.431/2011
                </span>
                <h3 className="text-xs font-bold text-white">Incentivo ao Investidor</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Concede isenção de IRRF para pessoas físicas residentes no Brasil e alíquota de 15% para não residentes. Não traz benefício fiscal direto para a PJ emissora além da dedução usual de despesas de juros.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#141414] border border-white/5 space-y-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  LEI Nº 14.801/2024
                </span>
                <h3 className="text-xs font-bold text-white">Incentivo Direto à PJ Emissora</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Autoriza a emissora a deduzir 30% adicional sobre os juros na determinação do Lucro Real e da base de cálculo da CSLL, viabilizando captações institucionais de longo prazo com menor spread.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#141414] border border-white/5 space-y-3">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Custos de Transação e Custo Amortizado (CPC 08 / CPC 48)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                As debêntures devem ser mensuradas pelo custo amortizado utilizando o método da Taxa Interna de Retorno (TIR). Custos com rating, estruturação bancária e assessoria jurídica (CPC 08) são apropriados ao resultado proporcionalmente ao longo do prazo da dívida.
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
                <Landmark className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  {itemEdicao ? 'Editar Emissão de Debêntures' : 'Nova Emissão de Debêntures'}
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
                    Número de Série / Código *
                  </label>
                  <input
                    type="text"
                    required
                    value={serieNumero}
                    onChange={(e) => setSerieNumero(e.target.value)}
                    placeholder="Ex: DEB-2026/01-INFRA"
                    className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">
                    Regime Legal da Emissão *
                  </label>
                  <select
                    value={tipoDebenture}
                    onChange={(e) => setTipoDebenture(e.target.value as TipoDebenture)}
                    className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="INFRAESTRUTURA_LEI_14801">Lei 14.801/2024 (Dedução Adicional 30% Emissor)</option>
                    <option value="INCENTIVADA_LEI_12431">Lei 12.431/2011 (Isenção PF Investidor)</option>
                    <option value="PADRAO_NAO_INCENTIVADA">Padrão Não Incentivada</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="text-xs text-slate-300 font-medium block mb-1">
                    Projeto Prioritário / Portaria Ministerial *
                  </label>
                  <input
                    type="text"
                    required
                    value={descricaoProjetoMinisterio}
                    onChange={(e) => setDescricaoProjetoMinisterio(e.target.value)}
                    placeholder="Ex: Usina Solar Fotovoltaica RenovaSol - Portaria MME"
                    className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Setor Prioritário</label>
                  <input
                    type="text"
                    required
                    value={setorPrioritario}
                    onChange={(e) => setSetorPrioritario(e.target.value)}
                    placeholder="Energia Renovável"
                    className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Data Emissão</label>
                  <input
                    type="date"
                    required
                    value={dataEmissao}
                    onChange={(e) => setDataEmissao(e.target.value)}
                    className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Data Vencimento</label>
                  <input
                    type="date"
                    required
                    value={dataVencimento}
                    onChange={(e) => setDataVencimento(e.target.value)}
                    className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Prazo (Meses)</label>
                  <input
                    type="number"
                    required
                    value={prazoMeses}
                    onChange={(e) => setPrazoMeses(Number(e.target.value))}
                    className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Quantidade de Títulos</label>
                  <input
                    type="number"
                    required
                    value={quantidadeTitulos}
                    onChange={(e) => setQuantidadeTitulos(Number(e.target.value))}
                    className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Valor Unitário Nominal (R$)</label>
                  <input
                    type="number"
                    required
                    value={valorNominalUnitario}
                    onChange={(e) => setValorNominalUnitario(Number(e.target.value))}
                    className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Volume Total (R$)</label>
                  <div className="bg-[#0f0f0f] text-xs text-emerald-400 font-mono px-3 py-2 rounded-lg border border-white/10 font-bold">
                    R$ {(quantidadeTitulos * valorNominalUnitario).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Indexador Remuneração</label>
                  <input
                    type="text"
                    required
                    value={remuneracaoIndexador}
                    onChange={(e) => setRemuneracaoIndexador(e.target.value)}
                    placeholder="IPCA + 6,50% a.a."
                    className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Taxa Juros Anual (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={taxaJurosAnual}
                    onChange={(e) => setTaxaJurosAnual(Number(e.target.value))}
                    className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Despesa Juros Período (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={despesaJurosPeriodo}
                    onChange={(e) => setDespesaJurosPeriodo(Number(e.target.value))}
                    className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Custos Transação CPC 08 (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={custoTransacaoEmissao}
                    onChange={(e) => setCustoTransacaoEmissao(Number(e.target.value))}
                    className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Agente Fiduciário</label>
                  <input
                    type="text"
                    value={agenteFiduciario}
                    onChange={(e) => setAgenteFiduciario(e.target.value)}
                    className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Observações e Escritura</label>
                <textarea
                  rows={2}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Detalhes sobre a emissão, garantias reais e assembleias de debenturistas..."
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
                  Salvar Emissão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
