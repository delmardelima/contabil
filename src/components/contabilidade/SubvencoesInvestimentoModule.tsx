import React, { useState, useEffect } from 'react';
import {
  Award,
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
  Building,
  Factory,
  Percent,
  Clock,
  Landmark
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  Empresa,
  ProjetoSubvencaoInvestimento,
  ResumoSubvencoesInvestimento,
  TipoSubvencaoOrigem,
  StatusHabilitacaoSubvencao,
  FinalidadeSubvencao
} from '../../types/contabil';

interface SubvencoesInvestimentoModuleProps {
  empresaAtiva: Empresa | null;
  onOpenReportPreview?: (config: {
    titulo: string;
    subtitulo: string;
    conteudoHtml: string;
    imprimirDireto?: boolean;
  }) => void;
}

export const SubvencoesInvestimentoModule: React.FC<SubvencoesInvestimentoModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [resumo, setResumo] = useState<ResumoSubvencoesInvestimento | null>(null);
  const [anoFiltro, setAnoFiltro] = useState<number>(2026);
  const [abaAtiva, setAbaAtiva] = useState<'projetos' | 'simulador' | 'legislacao'>('projetos');
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');

  // Modal formulário
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemEdicao, setItemEdicao] = useState<ProjetoSubvencaoInvestimento | null>(null);

  // Formulário
  const [numeroProcessoHabilitacaoRFB, setNumeroProcessoHabilitacaoRFB] = useState('');
  const [dataProtocoloHabilitacao, setDataProtocoloHabilitacao] = useState('2026-01-18');
  const [dataDecisaoHabilitacao, setDataDecisaoHabilitacao] = useState('');
  const [enteConcessor, setEnteConcessor] = useState('Governo do Estado de Pernambuco - PRODEPE');
  const [atoConcessaoEnte, setAtoConcessaoEnte] = useState('Decreto Estadual nº 54.321/2024');
  const [tipoSubvencao, setTipoSubvencao] = useState<TipoSubvencaoOrigem>('ESTADUAL_ICMS');
  const [finalidade, setFinalidade] = useState<FinalidadeSubvencao>('IMPLANTACAO_EMPREENDIMENTO');
  const [descricaoEmpreendimento, setDescricaoEmpreendimento] = useState('');
  const [valorTotalInvestimentoImobilizadoBRL, setValorTotalInvestimentoImobilizadoBRL] = useState(20000000);
  const [depreciacaoAmortizacaoComputadaExercicioBRL, setDepreciacaoAmortizacaoComputadaExercicioBRL] = useState(2000000);
  const [aliquotaCreditoFiscalPercentual, setAliquotaCreditoFiscalPercentual] = useState(25);
  const [valorCreditoCompensadoPerDcompBRL, setValorCreditoCompensadoPerDcompBRL] = useState(0);
  const [statusHabilitacao, setStatusHabilitacao] = useState<StatusHabilitacaoSubvencao>('HABILITADO_DEFERIDO');
  const [observacoes, setObservacoes] = useState('');

  // Simulador Lei 14.789/23 vs Lei 12.973/14
  const [simDepreciacaoAnual, setSimDepreciacaoAnual] = useState(5000000);
  const [simLucroRealAntesBeneficio, setSimLucroRealAntesBeneficio] = useState(15000000);

  const carregarDados = () => {
    if (!empresaAtiva) return;
    const data = dbService.getSubvencoesInvestimento(empresaAtiva.id, anoFiltro);
    setResumo(data);
  };

  useEffect(() => {
    carregarDados();
  }, [empresaAtiva, anoFiltro]);

  const handleNovo = () => {
    setItemEdicao(null);
    setNumeroProcessoHabilitacaoRFB(`13000.${Math.floor(100000 + Math.random() * 900000)}/${anoFiltro}-11`);
    setDataProtocoloHabilitacao(new Date().toISOString().split('T')[0]);
    setDataDecisaoHabilitacao('');
    setEnteConcessor('Governo do Estado de Pernambuco - PRODEPE');
    setAtoConcessaoEnte('Decreto Estadual nº 54.321/2024');
    setTipoSubvencao('ESTADUAL_ICMS');
    setFinalidade('IMPLANTACAO_EMPREENDIMENTO');
    setDescricaoEmpreendimento('Implantação de Nova Linha Automatizada de Produção');
    setValorTotalInvestimentoImobilizadoBRL(20000000);
    setDepreciacaoAmortizacaoComputadaExercicioBRL(2000000);
    setAliquotaCreditoFiscalPercentual(25);
    setValorCreditoCompensadoPerDcompBRL(0);
    setStatusHabilitacao('HABILITADO_DEFERIDO');
    setObservacoes('');
    setIsModalOpen(true);
  };

  const handleEditar = (item: ProjetoSubvencaoInvestimento) => {
    setItemEdicao(item);
    setNumeroProcessoHabilitacaoRFB(item.numeroProcessoHabilitacaoRFB);
    setDataProtocoloHabilitacao(item.dataProtocoloHabilitacao);
    setDataDecisaoHabilitacao(item.dataDecisaoHabilitacao || '');
    setEnteConcessor(item.enteConcessor);
    setAtoConcessaoEnte(item.atoConcessaoEnte);
    setTipoSubvencao(item.tipoSubvencao);
    setFinalidade(item.finalidade);
    setDescricaoEmpreendimento(item.descricaoEmpreendimento);
    setValorTotalInvestimentoImobilizadoBRL(item.valorTotalInvestimentoImobilizadoBRL);
    setDepreciacaoAmortizacaoComputadaExercicioBRL(item.depreciacaoAmortizacaoComputadaExercicioBRL);
    setAliquotaCreditoFiscalPercentual(item.aliquotaCreditoFiscalPercentual);
    setValorCreditoCompensadoPerDcompBRL(item.valorCreditoCompensadoPerDcompBRL);
    setStatusHabilitacao(item.statusHabilitacao);
    setObservacoes(item.observacoes || '');
    setIsModalOpen(true);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaAtiva) return;

    const creditoApurado = Math.round((depreciacaoAmortizacaoComputadaExercicioBRL * (aliquotaCreditoFiscalPercentual / 100)) * 100) / 100;
    const saldo = Math.max(0, creditoApurado - valorCreditoCompensadoPerDcompBRL);

    const item: ProjetoSubvencaoInvestimento = {
      id: itemEdicao ? itemEdicao.id : `subv-${Date.now()}`,
      empresaId: empresaAtiva.id,
      numeroProcessoHabilitacaoRFB,
      dataProtocoloHabilitacao,
      dataDecisaoHabilitacao: dataDecisaoHabilitacao || undefined,
      enteConcessor,
      atoConcessaoEnte,
      tipoSubvencao,
      finalidade,
      descricaoEmpreendimento,
      valorTotalInvestimentoImobilizadoBRL,
      depreciacaoAmortizacaoComputadaExercicioBRL,
      aliquotaCreditoFiscalPercentual,
      valorCreditoFiscalApuradoBRL: creditoApurado,
      valorCreditoCompensadoPerDcompBRL,
      saldoCreditoDisponivelBRL: saldo,
      statusHabilitacao,
      integradoContabil: itemEdicao ? itemEdicao.integradoContabil : false,
      observacoes: observacoes || undefined
    };

    const res = dbService.salvarProjetoSubvencao(item);
    if (res.sucesso) {
      setIsModalOpen(false);
      carregarDados();
    }
  };

  const handleExcluir = (id: string) => {
    if (window.confirm('Confirma a exclusão deste processo de subvenção?')) {
      const res = dbService.excluirProjetoSubvencao(id);
      if (res.sucesso) carregarDados();
    }
  };

  const handleIntegrar = (id: string) => {
    const res = dbService.integrarCreditoSubvencaoContabil(id);
    alert(res.mensagem);
    carregarDados();
  };

  const projetosFiltrados = resumo?.projetos.filter(item => {
    const matchBusca = 
      item.numeroProcessoHabilitacaoRFB.toLowerCase().includes(busca.toLowerCase()) ||
      item.enteConcessor.toLowerCase().includes(busca.toLowerCase()) ||
      item.descricaoEmpreendimento.toLowerCase().includes(busca.toLowerCase()) ||
      item.atoConcessaoEnte.toLowerCase().includes(busca.toLowerCase());

    const matchTipo = filtroTipo === 'TODOS' || item.tipoSubvencao === filtroTipo;
    const matchStatus = filtroStatus === 'TODOS' || item.statusHabilitacao === filtroStatus;

    return matchBusca && matchTipo && matchStatus;
  }) || [];

  const handleImprimirRelatorio = () => {
    if (!onOpenReportPreview || !empresaAtiva || !resumo) return;

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #111;">
        <div style="text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px;">
          <h2 style="margin: 0; color: #1e3a8a; text-transform: uppercase;">Demonstrativo de Crédito Fiscal de Subvenções para Investimento</h2>
          <p style="margin: 4px 0; font-size: 13px; color: #4b5563;">
            Lei Federal nº 14.789/2023 • Instrução Normativa RFB nº 2.170/2023 • Parecer Normativo Cosit nº 01/2024
          </p>
          <p style="margin: 2px 0; font-size: 12px; color: #6b7280;">
            Empresa: <strong>${empresaAtiva.razaoSocial}</strong> • CNPJ: ${empresaAtiva.cnpj} • Exercício: ${resumo.anoExercicio}
          </p>
        </div>

        <div style="display: flex; gap: 15px; margin-bottom: 20px;">
          <div style="flex: 1; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; background: #f8fafc;">
            <div style="font-size: 11px; color: #64748b;">INVESTIMENTO TOTAL (IMOBILIZADO)</div>
            <div style="font-size: 18px; font-weight: bold; color: #0f172a;">R$ ${resumo.totalInvestimentoImobilizadoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
          <div style="flex: 1; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; background: #f8fafc;">
            <div style="font-size: 11px; color: #64748b;">DEPRECIAÇÃO COMPUTADA (BASE)</div>
            <div style="font-size: 18px; font-weight: bold; color: #2563eb;">R$ ${resumo.totalDepreciacaoElegivelBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
          <div style="flex: 1; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; background: #f8fafc;">
            <div style="font-size: 11px; color: #64748b;">CRÉDITO FISCAL APURADO (25%)</div>
            <div style="font-size: 18px; font-weight: bold; color: #16a34a;">R$ ${resumo.totalCreditoFiscalApurado25BRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
          <div style="flex: 1; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; background: #f8fafc;">
            <div style="font-size: 11px; color: #64748b;">SALDO DISPONÍVEL (PER/DCOMP)</div>
            <div style="font-size: 18px; font-weight: bold; color: #d97706;">R$ ${resumo.saldoCreditoRemanescenteBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 25px;">
          <thead>
            <tr style="background: #1e293b; color: #fff;">
              <th style="padding: 8px; text-align: left; border: 1px solid #334155;">Processo Habilitação RFB</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #334155;">Ente Concessor / Ato</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #334155;">Empreendimento / Finalidade</th>
              <th style="padding: 8px; text-align: right; border: 1px solid #334155;">Investimento</th>
              <th style="padding: 8px; text-align: right; border: 1px solid #334155;">Depreciação Base</th>
              <th style="padding: 8px; text-align: right; border: 1px solid #334155;">Crédito 25%</th>
              <th style="padding: 8px; text-align: right; border: 1px solid #334155;">Compensado</th>
              <th style="padding: 8px; text-align: center; border: 1px solid #334155;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${resumo.projetos.map(p => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px; border: 1px solid #e2e8f0; font-family: monospace; font-weight: bold;">
                  ${p.numeroProcessoHabilitacaoRFB}<br>
                  <span style="font-size: 10px; color: #64748b;">Prot: ${p.dataProtocoloHabilitacao}</span>
                </td>
                <td style="padding: 8px; border: 1px solid #e2e8f0;">
                  ${p.enteConcessor}<br>
                  <span style="color:#64748b; font-size: 10px;">${p.atoConcessaoEnte}</span>
                </td>
                <td style="padding: 8px; border: 1px solid #e2e8f0;">
                  ${p.descricaoEmpreendimento}<br>
                  <span style="color:#64748b; font-size: 10px;">${p.finalidade}</span>
                </td>
                <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right;">
                  R$ ${p.valorTotalInvestimentoImobilizadoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold;">
                  R$ ${p.depreciacaoAmortizacaoComputadaExercicioBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right; color: #16a34a; font-weight: bold;">
                  R$ ${p.valorCreditoFiscalApuradoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right; color: #2563eb;">
                  R$ ${p.valorCreditoCompensadoPerDcompBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold;">
                  ${p.statusHabilitacao}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="border-top: 1px dashed #cbd5e1; padding-top: 15px; font-size: 10px; color: #64748b; line-height: 1.5;">
          <strong>Regras do Novo Regime Tributário da Lei nº 14.789/2023:</strong><br>
          1. <strong>Extinção da Exclusão no LALUR:</strong> As receitas de subvenção para investimento passaram a ser integralmente tributadas na DRE e LALUR.<br>
          2. <strong>Apuracão do Crédito Fiscal (Art. 6º):</strong> A pessoa jurídica habilitada previamente na RFB faz jus a crédito fiscal de 25% de IRPJ calculado sobre as quotas de depreciação, amortização ou exaustão de bens do ativo não circulante vinculados à implantação ou expansão do empreendimento econômico.<br>
          3. <strong>Compensação ou Ressarcimento:</strong> O crédito apurado é passível de compensação com débitos próprios de quaisquer tributos administrados pela RFB via PER/DCOMP Web ou ressarcimento financeiro direto.
        </div>
      </div>
    `;

    onOpenReportPreview({
      titulo: 'Demonstrativo de Crédito Fiscal de Subvenções',
      subtitulo: `Exercício ${resumo.anoExercicio} • ${empresaAtiva.razaoSocial}`,
      conteudoHtml: html
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#121212] text-slate-100 overflow-hidden font-sans">
      {/* Header Superior */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#181818]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">Subvenções para Investimento (Lei 14.789/2023)</h1>
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                Crédito Fiscal 25% IRPJ • IN RFB 2.170/23
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Habilitação Prévia RFB, Base de Depreciação Computada de Implantação/Expansão e Compensação via PER/DCOMP
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
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            Novo Projeto Habilitado
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 p-6 border-b border-white/5 bg-[#141414]">
        <div className="p-4 rounded-xl bg-[#1b1b1b] border border-white/5 relative overflow-hidden group hover:border-blue-500/30 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Investimento Vinculado</span>
            <Factory className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-mono">
            R$ {(resumo?.totalInvestimentoImobilizadoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-blue-400 font-semibold">{resumo?.projetos.length || 0} Projetos</span> de Implantação/Expansão
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#1b1b1b] border border-white/5 relative overflow-hidden group hover:border-purple-500/30 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Depreciação Elegível do Exercício</span>
            <Calculator className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400 mt-2 font-mono">
            R$ {(resumo?.totalDepreciacaoElegivelBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Base Efetiva de Cálculo (Art. 6º)</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#1b1b1b] border border-white/5 relative overflow-hidden group hover:border-emerald-500/30 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Crédito Fiscal Apurado (25%)</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2 font-mono">
            R$ {(resumo?.totalCreditoFiscalApurado25BRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Ativo Tributário a Recuperar</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#1b1b1b] border border-white/5 relative overflow-hidden group hover:border-amber-500/30 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Saldo Disponível p/ PER/DCOMP</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-2 font-mono">
            R$ {(resumo?.saldoCreditoRemanescenteBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Compensado: R$ {(resumo?.totalCompensadoPerDcompBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</span>
          </div>
        </div>
      </div>

      {/* Abas */}
      <div className="flex items-center justify-between px-6 border-b border-white/5 bg-[#181818]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAbaAtiva('projetos')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition ${
              abaAtiva === 'projetos'
                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            Processos Habilitados na RFB ({projetosFiltrados.length})
          </button>

          <button
            onClick={() => setAbaAtiva('simulador')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition ${
              abaAtiva === 'simulador'
                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calculator className="w-4 h-4" />
            Simulador Lei 14.789/23 vs Lei 12.973/14
          </button>

          <button
            onClick={() => setAbaAtiva('legislacao')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition ${
              abaAtiva === 'legislacao'
                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            Regras de Habilitação & Parecer Cosit 01/24
          </button>
        </div>

        {abaAtiva === 'projetos' && (
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por Processo, Ente ou Empreendimento..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-64 bg-[#202020] text-xs text-white pl-8 pr-3 py-1.5 rounded-lg border border-white/5 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="bg-[#202020] text-xs text-slate-300 px-3 py-1.5 rounded-lg border border-white/5 focus:outline-none focus:border-blue-500"
            >
              <option value="TODOS">Todas as Origens</option>
              <option value="ESTADUAL_ICMS">Estadual (ICMS / Prodepe / Prodeic)</option>
              <option value="MUNICIPAL_ISS_IPTU">Municipal (ISS / IPTU)</option>
              <option value="FEDERAL_UNIAO">Federal (União)</option>
            </select>

            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="bg-[#202020] text-xs text-slate-300 px-3 py-1.5 rounded-lg border border-white/5 focus:outline-none focus:border-blue-500"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="HABILITADO_DEFERIDO">Habilitado Deferido</option>
              <option value="EM_ANALISE_RFB">Em Análise RFB</option>
              <option value="INDEFERIDO">Indeferido</option>
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
                    <th className="py-3 px-4">Processo RFB</th>
                    <th className="py-3 px-4">Ente / Ato Concessório</th>
                    <th className="py-3 px-4">Empreendimento / Finalidade</th>
                    <th className="py-3 px-4 text-right">Investimento Total</th>
                    <th className="py-3 px-4 text-right">Depreciação Base</th>
                    <th className="py-3 px-4 text-right">Crédito 25%</th>
                    <th className="py-3 px-4 text-right">Compensado</th>
                    <th className="py-3 px-4 text-right">Saldo Disponível</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Contábil</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {projetosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-slate-500">
                        Nenhum projeto de subvenção para investimento localizado para os filtros informados.
                      </td>
                    </tr>
                  ) : (
                    projetosFiltrados.map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition">
                        <td className="py-3 px-4">
                          <div className="font-mono font-semibold text-white">{item.numeroProcessoHabilitacaoRFB}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            Prot: {item.dataProtocoloHabilitacao}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            item.tipoSubvencao === 'ESTADUAL_ICMS'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          }`}>
                            {item.enteConcessor}
                          </span>
                          <div className="text-[11px] text-slate-500 mt-1">
                            {item.atoConcessaoEnte}
                          </div>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <div className="truncate text-slate-200 font-medium" title={item.descricaoEmpreendimento}>
                            {item.descricaoEmpreendimento}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {item.finalidade === 'IMPLANTACAO_EMPREENDIMENTO' ? 'Implantação Nova' : 'Expansão de Capacidade'}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-300">
                          R$ {item.valorTotalInvestimentoImobilizadoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-white">
                          R$ {item.depreciacaoAmortizacaoComputadaExercicioBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                          R$ {item.valorCreditoFiscalApuradoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-blue-400">
                          R$ {item.valorCreditoCompensadoPerDcompBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-amber-400">
                          R$ {item.saldoCreditoDisponivelBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            item.statusHabilitacao === 'HABILITADO_DEFERIDO'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : item.statusHabilitacao === 'EM_ANALISE_RFB'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {item.statusHabilitacao}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {item.integradoContabil ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Ativo OK
                            </span>
                          ) : (
                            <button
                              onClick={() => handleIntegrar(item.id)}
                              className="px-2 py-1 rounded bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white text-[11px] font-medium border border-blue-500/30 transition"
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

        {abaAtiva === 'simulador' && (
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-1 bg-[#181818] p-6 rounded-xl border border-white/5 space-y-4">
              <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
                <Calculator className="w-4 h-4" />
                Simulador Comparativo de Regimes
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Compare o efeito de caixa entre a antiga exclusão integral do LALUR (Art. 30 Lei 12.973/14) e o atual Crédito Fiscal de 25% sobre a depreciação (Lei 14.789/23).
              </p>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1.5">
                  Depreciação dos Bens do Empreendimento (R$/ano)
                </label>
                <input
                  type="number"
                  step="100000"
                  value={simDepreciacaoAnual}
                  onChange={(e) => setSimDepreciacaoAnual(Number(e.target.value))}
                  className="w-full bg-[#202020] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1.5">
                  Lucro Real Projetado antes do Benefício (R$)
                </label>
                <input
                  type="number"
                  step="500000"
                  value={simLucroRealAntesBeneficio}
                  onChange={(e) => setSimLucroRealAntesBeneficio(Number(e.target.value))}
                  className="w-full bg-[#202020] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20 text-xs space-y-2">
                <div className="font-semibold text-blue-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Compensabilidade Ampla
                </div>
                <div className="text-slate-300 leading-relaxed">
                  Diferente da simples exclusão no LALUR, o crédito fiscal de 25% da Lei 14.789/23 pode ser compensado com <strong>quaisquer tributos federais</strong> (inclusive PIS, COFINS e contribuição previdenciária patronal via PER/DCOMP).
                </div>
              </div>
            </div>

            <div className="col-span-2 bg-[#181818] p-6 rounded-xl border border-white/5 space-y-6">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
                Impacto Financeiro e Tributário Comparado
              </h3>

              {(() => {
                // Lei 14.789/2023: Crédito de 25% direto sobre a depreciação
                const creditoFiscalNovoRegime = simDepreciacaoAnual * 0.25;
                const irpjCsllSemBeneficio = simLucroRealAntesBeneficio * 0.34;
                const tributoDevidoAposCredito = Math.max(0, irpjCsllSemBeneficio - creditoFiscalNovoRegime);

                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-[#202020] border border-white/5 space-y-2">
                        <span className="text-[11px] text-slate-400 font-medium">Tributação Sem Benefício (34%)</span>
                        <div className="text-xl font-bold text-slate-200 font-mono">
                          R$ {irpjCsllSemBeneficio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-xs text-slate-400">
                          Base de Cálculo Integral de IRPJ e CSLL
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                        <span className="text-[11px] text-emerald-300 font-medium">Crédito Fiscal Apurado (Lei 14.789/23)</span>
                        <div className="text-xl font-bold text-emerald-400 font-mono">
                          R$ {creditoFiscalNovoRegime.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-xs text-emerald-200">
                          25% sobre a quota anual de depreciação computada
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#141414] border border-white/5 space-y-3">
                      <h4 className="text-xs font-semibold text-white">Análise da Eficiência do Crédito Fiscal:</h4>
                      <div className="flex items-center justify-between text-xs text-slate-300 pb-2 border-b border-white/5">
                        <span>Carga Efetiva de IRPJ/CSLL após Crédito Fiscal:</span>
                        <span className="font-mono font-bold text-white">R$ {tributoDevidoAposCredito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span>Alíquota Efetiva Pós-Incentivo:</span>
                        <span className="font-mono font-bold text-emerald-400">{((tributoDevidoAposCredito / simLucroRealAntesBeneficio) * 100).toFixed(2)}%</span>
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
                <Landmark className="w-5 h-5 text-blue-400" />
                Marco Regulatório das Subvenções (Lei 14.789/2023)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Substituição do Artigo 30 da Lei 12.973/2014 pelo regime de crédito fiscal da União
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#141414] border border-white/5 space-y-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  LEI Nº 14.789/2023
                </span>
                <h3 className="text-xs font-bold text-white">Instituição do Crédito Fiscal</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Determina que os incentivos concedidos pelos Entes Federativos (ICMS/ISS) passam a compor a receita bruta tributável de IRPJ, CSLL, PIS e COFINS, garantindo em contrapartida crédito fiscal de 25% de IRPJ sobre as despesas de depreciação de bens da implantação/expansão.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#141414] border border-white/5 space-y-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  INSTRUÇÃO NORMATIVA RFB Nº 2.170/2023
                </span>
                <h3 className="text-xs font-bold text-white">Procedimento de Habilitação Prévia</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Estabelece a obrigatoriedade de protocolo no e-CAC de pedido de habilitação prévia contendo ato concessório do ente e plano de investimentos com cronograma físico-financeiro detalhado.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#141414] border border-white/5 space-y-3">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Parecer Normativo Cosit nº 01/2024
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                O Fisco Federal fixou a interpretação de que somente geram crédito fiscal os dispêndios diretamente atrelados à aquisição de bens do ativo imobilizado fabril ou intangível que aumentem a capacidade instalada do empreendimento incentivado.
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
                <Award className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold text-white">
                  {itemEdicao ? 'Editar Processo de Subvenção' : 'Novo Processo de Subvenção (Lei 14.789/23)'}
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
                    Número do Processo de Habilitação RFB *
                  </label>
                  <input
                    type="text"
                    required
                    value={numeroProcessoHabilitacaoRFB}
                    onChange={(e) => setNumeroProcessoHabilitacaoRFB(e.target.value)}
                    placeholder="Ex: 13000.720194/2026-11"
                    className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">
                    Origem da Subvenção *
                  </label>
                  <select
                    value={tipoSubvencao}
                    onChange={(e) => setTipoSubvencao(e.target.value as TipoSubvencaoOrigem)}
                    className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-blue-500"
                  >
                    <option value="ESTADUAL_ICMS">Estadual (ICMS - PRODEPE/DESENVOLVE)</option>
                    <option value="MUNICIPAL_ISS_IPTU">Municipal (ISS/IPTU)</option>
                    <option value="FEDERAL_UNIAO">Federal (União)</option>
                    <option value="OUTROS">Outros Entes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">
                    Ente Concessor *
                  </label>
                  <input
                    type="text"
                    required
                    value={enteConcessor}
                    onChange={(e) => setEnteConcessor(e.target.value)}
                    placeholder="Ex: Governo do Estado de Pernambuco"
                    className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">
                    Ato de Concessão do Ente *
                  </label>
                  <input
                    type="text"
                    required
                    value={atoConcessaoEnte}
                    onChange={(e) => setAtoConcessaoEnte(e.target.value)}
                    placeholder="Ex: Decreto Estadual nº 54.321/2024"
                    className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Data Protocolo</label>
                  <input
                    type="date"
                    required
                    value={dataProtocoloHabilitacao}
                    onChange={(e) => setDataProtocoloHabilitacao(e.target.value)}
                    className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Data Decisão RFB</label>
                  <input
                    type="date"
                    value={dataDecisaoHabilitacao}
                    onChange={(e) => setDataDecisaoHabilitacao(e.target.value)}
                    className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Finalidade *</label>
                  <select
                    value={finalidade}
                    onChange={(e) => setFinalidade(e.target.value as FinalidadeSubvencao)}
                    className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-blue-500"
                  >
                    <option value="IMPLANTACAO_EMPREENDIMENTO">Implantação Nova</option>
                    <option value="EXPANSAO_EMPREENDIMENTO">Expansão de Empreendimento</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Descrição do Empreendimento e Linhas Produtivas *
                </label>
                <input
                  type="text"
                  required
                  value={descricaoEmpreendimento}
                  onChange={(e) => setDescricaoEmpreendimento(e.target.value)}
                  placeholder="Ex: Implantação de Linha de Fabricação de Inversores Solares"
                  className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Investimento Imobilizado (R$)</label>
                  <input
                    type="number"
                    step="10000"
                    required
                    value={valorTotalInvestimentoImobilizadoBRL}
                    onChange={(e) => setValorTotalInvestimentoImobilizadoBRL(Number(e.target.value))}
                    className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Depreciação Base Anual (R$)</label>
                  <input
                    type="number"
                    step="1000"
                    required
                    value={depreciacaoAmortizacaoComputadaExercicioBRL}
                    onChange={(e) => setDepreciacaoAmortizacaoComputadaExercicioBRL(Number(e.target.value))}
                    className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Crédito 25% Apurado (R$)</label>
                  <div className="bg-[#0f0f0f] text-xs text-emerald-400 font-mono px-3 py-2 rounded-lg border border-white/10 font-bold">
                    R$ {(depreciacaoAmortizacaoComputadaExercicioBRL * 0.25).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Compensado via PER/DCOMP (R$)</label>
                  <input
                    type="number"
                    step="1000"
                    value={valorCreditoCompensadoPerDcompBRL}
                    onChange={(e) => setValorCreditoCompensadoPerDcompBRL(Number(e.target.value))}
                    className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Status da Habilitação RFB</label>
                  <select
                    value={statusHabilitacao}
                    onChange={(e) => setStatusHabilitacao(e.target.value as StatusHabilitacaoSubvencao)}
                    className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-blue-500"
                  >
                    <option value="HABILITADO_DEFERIDO">Habilitado Deferido</option>
                    <option value="EM_ANALISE_RFB">Em Análise RFB</option>
                    <option value="INDEFERIDO">Indeferido</option>
                    <option value="CANCELADO">Cancelado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Observações Técnicas</label>
                <textarea
                  rows={2}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Informações sobre o laudo de vistoria, bens elegíveis e demonstrativo DRE..."
                  className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-blue-500"
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
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 transition"
                >
                  Salvar Projeto de Subvenção
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
