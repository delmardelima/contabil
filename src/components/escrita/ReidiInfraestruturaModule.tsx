import React, { useState, useEffect } from 'react';
import {
  Building2,
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
  Zap,
  HardHat,
  Ship,
  Phone,
  Droplets,
  Layers,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  Empresa,
  ProjetoHabilitadoReidi,
  ResumoReidi,
  SetorProjetoReidi,
  StatusHabilitacaoReidi
} from '../../types/contabil';

interface ReidiInfraestruturaModuleProps {
  empresaAtiva: Empresa | null;
  onOpenReportPreview?: (config: {
    titulo: string;
    subtitulo: string;
    conteudoHtml: string;
    imprimirDireto?: boolean;
  }) => void;
}

export const ReidiInfraestruturaModule: React.FC<ReidiInfraestruturaModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [resumo, setResumo] = useState<ResumoReidi | null>(null);
  const [anoFiltro, setAnoFiltro] = useState<number>(2026);
  const [abaAtiva, setAbaAtiva] = useState<'projetos' | 'simulador' | 'legislacao'>('projetos');
  const [busca, setBusca] = useState('');

  // Modal formulário
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemEdicao, setItemEdicao] = useState<ProjetoHabilitadoReidi | null>(null);

  // Formulário
  const [numeroAtoDeclaratorioExecutivo, setNumeroAtoDeclaratorioExecutivo] = useState('');
  const [portariaMinisterial, setPortariaMinisterial] = useState('');
  const [nomeProjeto, setNomeProjeto] = useState('');
  const [setor, setSetor] = useState<SetorProjetoReidi>('ENERGIA');
  const [dataHabilitacao, setDataHabilitacao] = useState('2026-01-15');
  const [previsaoTermino, setPrevisaoTermino] = useState('2028-12-31');
  const [status, setStatus] = useState<StatusHabilitacaoReidi>('HABILITADO');
  const [valorTotalEstimadoObraBRL, setValorTotalEstimadoObraBRL] = useState(15000000);
  const [aquisicoesComSuspensaoPisCofinsBRL, setAquisicoesComSuspensaoPisCofinsBRL] = useState(10000000);
  const [aliquotaSuspensaoPisPercentual, setAliquotaSuspensaoPisPercentual] = useState(1.65);
  const [aliquotaSuspensaoCofinsPercentual, setAliquotaSuspensaoCofinsPercentual] = useState(7.60);
  const [notasFiscaisVinculadasCount, setNotasFiscaisVinculadasCount] = useState(45);
  const [observacoes, setObservacoes] = useState('');

  // Simulador de Economia e Alavancagem Financeira
  const [simAquisicoes, setSimAquisicoes] = useState(25000000);
  const [simPrazoObraMeses, setSimPrazoObraMeses] = useState(24);
  const [simCustoCapitalCdi, setSimCustoCapitalCdi] = useState(11.25);

  const carregarDados = () => {
    if (!empresaAtiva) return;
    const data = dbService.getReidi(empresaAtiva.id, anoFiltro);
    setResumo(data);
  };

  useEffect(() => {
    carregarDados();
  }, [empresaAtiva, anoFiltro]);

  const handleNovo = () => {
    setItemEdicao(null);
    setNumeroAtoDeclaratorioExecutivo('');
    setPortariaMinisterial('');
    setNomeProjeto('');
    setSetor('ENERGIA');
    setDataHabilitacao(new Date().toISOString().split('T')[0]);
    setPrevisaoTermino('2028-12-31');
    setStatus('HABILITADO');
    setValorTotalEstimadoObraBRL(10000000);
    setAquisicoesComSuspensaoPisCofinsBRL(7000000);
    setAliquotaSuspensaoPisPercentual(1.65);
    setAliquotaSuspensaoCofinsPercentual(7.60);
    setNotasFiscaisVinculadasCount(0);
    setObservacoes('');
    setIsModalOpen(true);
  };

  const handleEditar = (p: ProjetoHabilitadoReidi) => {
    setItemEdicao(p);
    setNumeroAtoDeclaratorioExecutivo(p.numeroAtoDeclaratorioExecutivo);
    setPortariaMinisterial(p.portariaMinisterial);
    setNomeProjeto(p.nomeProjeto);
    setSetor(p.setor);
    setDataHabilitacao(p.dataHabilitacao);
    setPrevisaoTermino(p.previsaoTermino);
    setStatus(p.status);
    setValorTotalEstimadoObraBRL(p.valorTotalEstimadoObraBRL);
    setAquisicoesComSuspensaoPisCofinsBRL(p.aquisicoesComSuspensaoPisCofinsBRL);
    setAliquotaSuspensaoPisPercentual(p.aliquotaSuspensaoPisPercentual);
    setAliquotaSuspensaoCofinsPercentual(p.aliquotaSuspensaoCofinsPercentual);
    setNotasFiscaisVinculadasCount(p.notasFiscaisVinculadasCount);
    setObservacoes(p.observacoes || '');
    setIsModalOpen(true);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaAtiva) return;

    const aliqTotal = aliquotaSuspensaoPisPercentual + aliquotaSuspensaoCofinsPercentual;
    const economia = Math.round((aquisicoesComSuspensaoPisCofinsBRL * (aliqTotal / 100)) * 100) / 100;

    const item: ProjetoHabilitadoReidi = {
      id: itemEdicao?.id || `reidi-${Date.now()}`,
      empresaId: empresaAtiva.id,
      numeroAtoDeclaratorioExecutivo,
      portariaMinisterial,
      nomeProjeto,
      setor,
      dataHabilitacao,
      previsaoTermino,
      status,
      valorTotalEstimadoObraBRL,
      aquisicoesComSuspensaoPisCofinsBRL,
      aliquotaSuspensaoPisPercentual,
      aliquotaSuspensaoCofinsPercentual,
      economiaFiscalTotalBRL: economia,
      notasFiscaisVinculadasCount,
      integradoContabil: itemEdicao ? itemEdicao.integradoContabil : false,
      observacoes
    };

    dbService.salvarProjetoReidi(item);
    setIsModalOpen(false);
    carregarDados();
  };

  const handleExcluir = (id: string) => {
    if (confirm('Confirma a exclusão deste projeto habilitado no REIDI?')) {
      dbService.excluirProjetoReidi(id);
      carregarDados();
    }
  };

  const handleIntegrar = (id: string) => {
    const res = dbService.integrarReidiContabil(id);
    alert(res.mensagem);
    carregarDados();
  };

  const formatarMoeda = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getSetorIcon = (s: SetorProjetoReidi) => {
    switch (s) {
      case 'ENERGIA': return <Zap className="w-4 h-4 text-amber-400" />;
      case 'TRANSPORTES': return <HardHat className="w-4 h-4 text-blue-400" />;
      case 'SANEAMENTO_BASICO': return <Droplets className="w-4 h-4 text-cyan-400" />;
      case 'PORTOS': return <Ship className="w-4 h-4 text-indigo-400" />;
      case 'TELECOMUNICACOES': return <Phone className="w-4 h-4 text-purple-400" />;
      case 'IRRIGACAO': return <Droplets className="w-4 h-4 text-emerald-400" />;
      default: return <Building2 className="w-4 h-4 text-neutral-400" />;
    }
  };

  const getStatusBadge = (st: StatusHabilitacaoReidi) => {
    switch (st) {
      case 'HABILITADO':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Habilitado RFB</span>;
      case 'CO_HABILITADO':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">Co-Habilitado (Consórcio)</span>;
      case 'EM_ANALISE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">Em Análise RFB</span>;
      case 'CONCLUIDO':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-500/10 text-neutral-300 border border-neutral-500/20">Obra Concluída (Alíq. Zero)</span>;
      case 'CANCELADO':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">Cancelado</span>;
    }
  };

  const emitirLaudoA4 = () => {
    if (!empresaAtiva || !resumo) return;

    const dataAtual = new Date().toLocaleDateString('pt-BR');
    const html = `
      <div style="font-family: 'Inter', Arial, sans-serif; color: #111; padding: 24px; line-height: 1.5;">
        <div style="border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 20px;">
          <table style="width: 100%;">
            <tr>
              <td>
                <h1 style="margin: 0; font-size: 18px; font-weight: bold; text-transform: uppercase;">
                  ${empresaAtiva.razaoSocial}
                </h1>
                <p style="margin: 2px 0; font-size: 11px; color: #444;">
                  CNPJ: ${empresaAtiva.cnpj} | Inscrição Estadual: ${empresaAtiva.inscricaoEstadual || 'Isento'}
                </p>
                <p style="margin: 2px 0; font-size: 11px; color: #444;">
                  Regime Tributário: ${empresaAtiva.regimeTributario} | Exercício: ${anoFiltro}
                </p>
              </td>
              <td style="text-align: right; vertical-align: top;">
                <span style="font-size: 10px; font-weight: bold; border: 1px solid #000; padding: 4px 8px; border-radius: 4px;">
                  REIDI - LEI 11.488/2007
                </span>
                <p style="margin: 4px 0 0 0; font-size: 10px; color: #666;">Data: ${dataAtual}</p>
              </td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px;">
            DEMONSTRATIVO ANALÍTICO DE FRUIÇÃO DO REIDI
          </h2>
          <p style="margin: 3px 0 0 0; font-size: 11px; color: #555;">
            Regime Especial de Incentivos para o Desenvolvimento da Infraestrutura (Decreto nº 6.144/2007 e IN RFB nº 2.121/2022)
          </p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px;">
          <tr style="background-color: #f2f2f2;">
            <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Indicador Consolidado</th>
            <th style="border: 1px solid #ccc; padding: 8px; text-align: right;">Valores Homologados (R$)</th>
          </tr>
          <tr>
            <td style="border: 1px solid #ccc; padding: 8px;">Total de Projetos de Infraestrutura Habilitados</td>
            <td style="border: 1px solid #ccc; padding: 8px; text-align: right; font-weight: bold;">${resumo.totalProjetos} projetos</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ccc; padding: 8px;">Aquisições Elegíveis com Suspensão Tributária (Imobilizado)</td>
            <td style="border: 1px solid #ccc; padding: 8px; text-align: right; font-weight: bold;">${formatarMoeda(resumo.totalAquisicoesSuspensaoBRL)}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ccc; padding: 8px;">Suspensão de PIS/PASEP (1,65%)</td>
            <td style="border: 1px solid #ccc; padding: 8px; text-align: right; font-weight: bold; color: #0066cc;">${formatarMoeda(resumo.totalAquisicoesSuspensaoBRL * 0.0165)}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ccc; padding: 8px;">Suspensão de COFINS (7,60%)</td>
            <td style="border: 1px solid #ccc; padding: 8px; text-align: right; font-weight: bold; color: #0066cc;">${formatarMoeda(resumo.totalAquisicoesSuspensaoBRL * 0.0760)}</td>
          </tr>
          <tr style="background-color: #e6f7ff;">
            <td style="border: 1px solid #ccc; padding: 8px; font-weight: bold;">Economia Tributária Efetiva no Fluxo de Caixa (9,25%)</td>
            <td style="border: 1px solid #ccc; padding: 8px; text-align: right; font-weight: bold; color: #0066cc; font-size: 12px;">${formatarMoeda(resumo.totalEconomiaFiscalBRL)}</td>
          </tr>
        </table>

        <h3 style="font-size: 12px; text-transform: uppercase; margin-bottom: 8px; border-bottom: 1px solid #ccc; padding-bottom: 4px;">
          Relação de Projetos e Atos Declaratórios Executivos (ADE / DOU)
        </h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 10px;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="border: 1px solid #ddd; padding: 6px; text-align: left;">ADE / Portaria</th>
              <th style="border: 1px solid #ddd; padding: 6px; text-align: left;">Nome do Projeto</th>
              <th style="border: 1px solid #ddd; padding: 6px; text-align: left;">Setor</th>
              <th style="border: 1px solid #ddd; padding: 6px; text-align: right;">Orçamento Obra</th>
              <th style="border: 1px solid #ddd; padding: 6px; text-align: right;">Compras c/ Suspensão</th>
              <th style="border: 1px solid #ddd; padding: 6px; text-align: right;">Economia Fiscal</th>
            </tr>
          </thead>
          <tbody>
            ${resumo.projetos.map(p => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 6px;">
                  <strong>${p.numeroAtoDeclaratorioExecutivo}</strong><br/>
                  <span style="color: #666; font-size: 9px;">${p.portariaMinisterial}</span>
                </td>
                <td style="border: 1px solid #ddd; padding: 6px;">${p.nomeProjeto}</td>
                <td style="border: 1px solid #ddd; padding: 6px;">${p.setor}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: right;">${formatarMoeda(p.valorTotalEstimadoObraBRL)}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-weight: bold;">${formatarMoeda(p.aquisicoesComSuspensaoPisCofinsBRL)}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-weight: bold; color: #0066cc;">${formatarMoeda(p.economiaFiscalTotalBRL)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="font-size: 10px; color: #555; background: #fafafa; border: 1px solid #eee; padding: 10px; border-radius: 4px; margin-bottom: 30px;">
          <strong>Notas Regulatórias e Fundamento Legal:</strong><br/>
          1. O benefício do REIDI consiste na suspensão da exigência da Contribuição para o PIS/PASEP e da COFINS incidentes sobre as vendas e importações de máquinas, aparelhos, instrumentos e equipamentos novos, bem como de materiais de construção destinados ao ativo imobilizado do projeto habilitado (Art. 3º da Lei nº 11.488/2007).<br/>
          2. A suspensão se converte definitivamente em alíquota zero após a incorporação física ou aplicação dos bens e materiais de construção na obra do projeto aprovado pelo respectivo Ministério Setorial.<br/>
          3. Em cumprimento à IN RFB nº 2.121/2022, as notas fiscais de aquisição com suspensão contêm a expressão legal obrigatória e o número do Ato Declaratório Executivo (ADE).
        </div>

        <table style="width: 100%; margin-top: 40px; font-size: 11px;">
          <tr>
            <td style="width: 50%; text-align: center; padding-right: 20px;">
              <div style="border-top: 1px solid #000; padding-top: 6px;">
                <strong>${empresaAtiva.razaoSocial}</strong><br/>
                Representante Legal / Diretor de Engenharia
              </div>
            </td>
            <td style="width: 50%; text-align: center; padding-left: 20px;">
              <div style="border-top: 1px solid #000; padding-top: 6px;">
                <strong>${empresaAtiva.contadorNome || 'Responsável Técnico'}</strong><br/>
                Contador Chefe - CRC ${empresaAtiva.crcContador || 'Ativo'}
              </div>
            </td>
          </tr>
        </table>
      </div>
    `;

    if (onOpenReportPreview) {
      onOpenReportPreview({
        titulo: 'DEMONSTRATIVO ANALÍTICO DO REIDI (LEI 11.488/2007)',
        subtitulo: 'Acompanhamento de Projetos Habilitados, Suspensão de PIS/COFINS e Alíquota Zero',
        conteudoHtml: html
      });
    }
  };

  const projetosFiltrados = (resumo?.projetos || []).filter(p => {
    const termo = busca.toLowerCase();
    return (
      p.nomeProjeto.toLowerCase().includes(termo) ||
      p.numeroAtoDeclaratorioExecutivo.toLowerCase().includes(termo) ||
      p.portariaMinisterial.toLowerCase().includes(termo) ||
      p.setor.toLowerCase().includes(termo)
    );
  });

  // Cálculo simulador
  const simEconomiaPis = Math.round(simAquisicoes * 0.0165);
  const simEconomiaCofins = Math.round(simAquisicoes * 0.0760);
  const simEconomiaTotal = simEconomiaPis + simEconomiaCofins;
  // Ganho financeiro por não desembolsar tributos durante o prazo da obra
  const simGanhoFinanceiro = Math.round(simEconomiaTotal * ((simCustoCapitalCdi / 100) * (simPrazoObraMeses / 12)));
  const simBeneficioGlobal = simEconomiaTotal + simGanhoFinanceiro;

  return (
    <div className="h-full flex flex-col bg-[#141414] text-neutral-100 text-xs">
      {/* Top Header */}
      <div className="px-4 py-3 bg-[#181818] border-b border-white/5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-bold text-neutral-100">
                REIDI - Regime Especial de Incentivos para a Infraestrutura
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                LEI 11.488/2007
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Suspensão de PIS/PASEP e COFINS em bens de capital e materiais para obras de infraestrutura
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-[#202020] border border-white/10 rounded-lg p-0.5">
            <button
              onClick={() => setAbaAtiva('projetos')}
              className={`px-3 py-1 rounded-md transition font-medium text-xs flex items-center gap-1.5 ${
                abaAtiva === 'projetos'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Projetos Habilitados
            </button>
            <button
              onClick={() => setAbaAtiva('simulador')}
              className={`px-3 py-1 rounded-md transition font-medium text-xs flex items-center gap-1.5 ${
                abaAtiva === 'simulador'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              Simulador Capex
            </button>
            <button
              onClick={() => setAbaAtiva('legislacao')}
              className={`px-3 py-1 rounded-md transition font-medium text-xs flex items-center gap-1.5 ${
                abaAtiva === 'legislacao'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Fundamento Legal
            </button>
          </div>

          <button
            onClick={emitirLaudoA4}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-white/10 transition"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span>Laudo A4</span>
          </button>

          <button
            onClick={handleNovo}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-600/20 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Projeto</span>
          </button>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-[#181818] border border-white/5 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[11px] text-neutral-400 uppercase font-medium">Projetos Habilitados</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-neutral-100">{resumo?.totalProjetos || 0}</span>
              <span className="text-[10px] text-emerald-400 font-medium">Atos ADE RFB</span>
            </div>
            <span className="text-[10px] text-neutral-500 mt-1">Habilitação nos ministérios setoriais</span>
          </div>

          <div className="bg-[#181818] border border-white/5 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[11px] text-neutral-400 uppercase font-medium">Compras com Suspensão</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-blue-400">
                {formatarMoeda(resumo?.totalAquisicoesSuspensaoBRL || 0)}
              </span>
              <span className="text-[10px] text-blue-400 font-mono">Bens + Insumos</span>
            </div>
            <span className="text-[10px] text-neutral-500 mt-1">Máquinas e materiais de construção</span>
          </div>

          <div className="bg-[#181818] border border-white/5 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[11px] text-neutral-400 uppercase font-medium">Economia PIS/COFINS (9,25%)</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-emerald-400">
                {formatarMoeda(resumo?.totalEconomiaFiscalBRL || 0)}
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                Sem Retenção
              </span>
            </div>
            <span className="text-[10px] text-neutral-500 mt-1">Ganho direto de caixa no Capex</span>
          </div>

          <div className="bg-[#181818] border border-white/5 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[11px] text-neutral-400 uppercase font-medium">Alíquota Pós-Conclusão</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-purple-400">0,00%</span>
              <span className="text-[10px] text-purple-400 font-medium">Alíquota Zero</span>
            </div>
            <span className="text-[10px] text-neutral-500 mt-1">Conversão definitiva pós-incorporação</span>
          </div>
        </div>

        {/* ABA: PROJETOS */}
        {abaAtiva === 'projetos' && (
          <div className="space-y-3">
            {/* Barra de Filtros */}
            <div className="flex items-center justify-between bg-[#181818] border border-white/5 p-2 rounded-lg">
              <div className="flex items-center space-x-2 flex-1 max-w-md">
                <Search className="w-3.5 h-3.5 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Filtrar por projeto, ADE, portaria ministerial ou setor..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="bg-transparent border-none text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none w-full"
                />
              </div>

              <div className="flex items-center space-x-2 text-neutral-400">
                <span>Ano Base:</span>
                <select
                  value={anoFiltro}
                  onChange={(e) => setAnoFiltro(Number(e.target.value))}
                  className="bg-[#202020] border border-white/10 rounded px-2 py-1 text-xs text-neutral-200"
                >
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                  <option value={2024}>2024</option>
                </select>
              </div>
            </div>

            {/* Grid de Projetos */}
            <div className="bg-[#181818] border border-white/5 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] uppercase font-bold text-neutral-400 bg-white/[0.02]">
                    <th className="py-2.5 px-3">Projeto & Portaria</th>
                    <th className="py-2.5 px-3">Setor</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Orçamento Obra</th>
                    <th className="py-2.5 px-3 text-right">Compras Suspensão</th>
                    <th className="py-2.5 px-3 text-right">Economia 9,25%</th>
                    <th className="py-2.5 px-3 text-center">Contabilizado</th>
                    <th className="py-2.5 px-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {projetosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-neutral-500 text-xs">
                        Nenhum projeto de infraestrutura cadastrado no REIDI para os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    projetosFiltrados.map((p) => (
                      <tr key={p.id} className="hover:bg-white/[0.02] transition">
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-neutral-200">{p.nomeProjeto}</div>
                          <div className="text-[10px] text-neutral-500 font-mono">
                            {p.numeroAtoDeclaratorioExecutivo} | {p.portariaMinisterial}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center space-x-1.5">
                            {getSetorIcon(p.setor)}
                            <span className="font-medium text-neutral-300">{p.setor}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          {getStatusBadge(p.status)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-neutral-300">
                          {formatarMoeda(p.valorTotalEstimadoObraBRL)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold text-blue-400">
                          {formatarMoeda(p.aquisicoesComSuspensaoPisCofinsBRL)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                          {formatarMoeda(p.economiaFiscalTotalBRL)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {p.integradoContabil ? (
                            <span className="inline-flex items-center text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-medium">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Integrado
                            </span>
                          ) : (
                            <button
                              onClick={() => handleIntegrar(p.id)}
                              className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 transition"
                            >
                              Integrar D/C
                            </button>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => handleEditar(p)}
                              className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-neutral-200 transition"
                              title="Editar Projeto"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleExcluir(p.id)}
                              className="p-1 hover:bg-rose-500/10 rounded text-neutral-400 hover:text-rose-400 transition"
                              title="Excluir"
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

        {/* ABA: SIMULADOR CAPEX */}
        {abaAtiva === 'simulador' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#181818] border border-white/5 rounded-xl p-4 space-y-4">
              <h3 className="text-xs font-bold text-neutral-200 uppercase flex items-center space-x-2">
                <Calculator className="w-4 h-4 text-blue-400" />
                <span>Parâmetros de Investimento</span>
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] text-neutral-400">Aquisições de Máquinas & Materiais (R$)</label>
                  <input
                    type="number"
                    value={simAquisicoes}
                    onChange={(e) => setSimAquisicoes(Number(e.target.value))}
                    className="w-full mt-1 bg-[#202020] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-neutral-200 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400">Prazo de Execução da Obra (Meses)</label>
                  <input
                    type="number"
                    value={simPrazoObraMeses}
                    onChange={(e) => setSimPrazoObraMeses(Number(e.target.value))}
                    className="w-full mt-1 bg-[#202020] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-neutral-200 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400">Custo Médio de Capital / CDI (% a.a.)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={simCustoCapitalCdi}
                    onChange={(e) => setSimCustoCapitalCdi(Number(e.target.value))}
                    className="w-full mt-1 bg-[#202020] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-neutral-200 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[11px] text-blue-300">
                <div className="font-semibold mb-1">Como Funciona a Suspensão:</div>
                O fornecedor emite NF com suspensão de PIS (1,65%) e COFINS (7,60%). A construtora não desembolsa os 9,25% e não precisa pleitear restituição futura, preservando a liquidez durante o Capex.
              </div>
            </div>

            <div className="md:col-span-2 bg-[#181818] border border-white/5 rounded-xl p-4 space-y-4">
              <h3 className="text-xs font-bold text-neutral-200 uppercase flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Resultados da Simulação Capex</span>
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#202020] border border-white/5 rounded-lg">
                  <span className="text-[11px] text-neutral-400">Suspensão de PIS (1,65%)</span>
                  <div className="text-base font-bold font-mono text-neutral-200 mt-1">
                    {formatarMoeda(simEconomiaPis)}
                  </div>
                </div>

                <div className="p-3 bg-[#202020] border border-white/5 rounded-lg">
                  <span className="text-[11px] text-neutral-400">Suspensão de COFINS (7,60%)</span>
                  <div className="text-base font-bold font-mono text-neutral-200 mt-1">
                    {formatarMoeda(simEconomiaCofins)}
                  </div>
                </div>

                <div className="p-3 bg-[#202020] border border-white/5 rounded-lg">
                  <span className="text-[11px] text-neutral-400">Economia Tributária Direta (9,25%)</span>
                  <div className="text-base font-bold font-mono text-emerald-400 mt-1">
                    {formatarMoeda(simEconomiaTotal)}
                  </div>
                </div>

                <div className="p-3 bg-[#202020] border border-white/5 rounded-lg">
                  <span className="text-[11px] text-neutral-400">Ganho Financeiro de Fluxo de Caixa</span>
                  <div className="text-base font-bold font-mono text-blue-400 mt-1">
                    {formatarMoeda(simGanhoFinanceiro)}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-blue-900/20 to-emerald-900/20 border border-blue-500/30 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-neutral-200 uppercase">Benefício Econômico Total do REIDI</span>
                  <p className="text-[11px] text-neutral-400 mt-0.5">Soma da economia fiscal e custo financeiro evitado</p>
                </div>
                <div className="text-2xl font-bold font-mono text-emerald-400">
                  {formatarMoeda(simBeneficioGlobal)}
                </div>
              </div>

              <div className="space-y-2 text-[11px] text-neutral-400">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Eliminação de saldo credor acumulado de PIS/COFINS de difícil ressarcimento.</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Redução direta da necessidade de capital de giro e financiamento bancário para a obra.</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Conversão em alíquota zero após incorporação definitiva aos bens do projeto.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA: FUNDAMENTO LEGAL */}
        {abaAtiva === 'legislacao' && (
          <div className="bg-[#181818] border border-white/5 rounded-xl p-5 space-y-4 leading-relaxed text-xs text-neutral-300">
            <h3 className="text-sm font-bold text-neutral-100 uppercase border-b border-white/5 pb-2">
              Regime Jurídico e Engenharia Reversa do REIDI (Lei Federal nº 11.488/2007)
            </h3>

            <div className="space-y-3">
              <p>
                O <strong>Regime Especial de Incentivos para o Desenvolvimento da Infraestrutura (REIDI)</strong> foi instituído pelos artigos 1º a 5º da Lei nº 11.488/2007 e regulamentado pelo Decreto nº 6.144/2007 e Instrução Normativa RFB nº 2.121/2022 (artigos 598 a 612).
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3">
                <div className="p-3 bg-neutral-900/60 rounded-lg border border-white/5 space-y-2">
                  <div className="font-bold text-neutral-100 flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    <span>Setores Elegíveis de Infraestrutura</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-neutral-400 text-[11px]">
                    <li><strong>Transportes:</strong> rodovias, ferrovias, hidrovias, aeroportos.</li>
                    <li><strong>Energia:</strong> geração, transmissão e distribuição de energia elétrica.</li>
                    <li><strong>Saneamento Básico:</strong> abastecimento de água e esgotamento sanitário.</li>
                    <li><strong>Portos:</strong> terminais portuários e instalações portuárias públicas e privadas.</li>
                    <li><strong>Telecomunicações:</strong> redes de fibra óptica e infraestrutura celular.</li>
                    <li><strong>Irrigação:</strong> projetos públicos de irrigação em áreas prioritárias.</li>
                  </ul>
                </div>

                <div className="p-3 bg-neutral-900/60 rounded-lg border border-white/5 space-y-2">
                  <div className="font-bold text-neutral-100 flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Benefícios Tributários Aplicáveis</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-neutral-400 text-[11px]">
                    <li><strong>Suspensão de PIS/PASEP (1,65%)</strong> nas vendas e importações de bens novos e materiais.</li>
                    <li><strong>Suspensão de COFINS (7,60%)</strong> nas vendas e importações de bens novos e materiais.</li>
                    <li><strong>Conversão em Alíquota Zero:</strong> A suspensão converte-se em alíquota zero após a incorporação física do bem ao projeto habilitado.</li>
                    <li><strong>Co-Habilitação:</strong> Empresas consorciadas e empreiteiras contratadas podem co-habilitar-se para usufruir do regime.</li>
                  </ul>
                </div>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-300 text-[11px]">
                <strong>Atenção aos Riscos Fiscais:</strong> Caso os bens ou materiais de construção adquiridos com suspensão não sejam incorporados à obra do projeto habilitado, ou haja desvio de finalidade, a pessoa jurídica beneficiária fica obrigada a recolher o PIS e a COFINS não pagos com juros Selic e multa de mora ou de ofício (Art. 5º da Lei 11.488/2007).
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Novo / Editar Projeto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#1c1c1c] border border-white/10 rounded-xl shadow-2xl max-w-2xl w-full p-5 text-neutral-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-sm text-neutral-100 flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-blue-400" />
                <span>{itemEdicao ? 'Editar Projeto REIDI' : 'Cadastrar Projeto Habilitado no REIDI'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-200 text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvar} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-neutral-400">Ato Declaratório Executivo (ADE RFB) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: ADE DRF/SDR nº 18/2024"
                    value={numeroAtoDeclaratorioExecutivo}
                    onChange={(e) => setNumeroAtoDeclaratorioExecutivo(e.target.value)}
                    className="w-full mt-1 bg-[#222] border border-white/10 rounded px-2.5 py-1.5 text-xs text-neutral-200"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400">Portaria Ministerial Setorial *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Portaria MME nº 412/2024"
                    value={portariaMinisterial}
                    onChange={(e) => setPortariaMinisterial(e.target.value)}
                    className="w-full mt-1 bg-[#222] border border-white/10 rounded px-2.5 py-1.5 text-xs text-neutral-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-neutral-400">Nome Oficial do Projeto de Infraestrutura *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Complexo Eólico Serra do Mel III"
                  value={nomeProjeto}
                  onChange={(e) => setNomeProjeto(e.target.value)}
                  className="w-full mt-1 bg-[#222] border border-white/10 rounded px-2.5 py-1.5 text-xs text-neutral-200"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-neutral-400">Setor de Infraestrutura *</label>
                  <select
                    value={setor}
                    onChange={(e) => setSetor(e.target.value as SetorProjetoReidi)}
                    className="w-full mt-1 bg-[#222] border border-white/10 rounded px-2.5 py-1.5 text-xs text-neutral-200"
                  >
                    <option value="ENERGIA">Energia</option>
                    <option value="TRANSPORTES">Transportes</option>
                    <option value="SANEAMENTO_BASICO">Saneamento Básico</option>
                    <option value="PORTOS">Portos</option>
                    <option value="TELECOMUNICACOES">Telecomunicações</option>
                    <option value="IRRIGACAO">Irrigação</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400">Data Habilitação DOU *</label>
                  <input
                    type="date"
                    required
                    value={dataHabilitacao}
                    onChange={(e) => setDataHabilitacao(e.target.value)}
                    className="w-full mt-1 bg-[#222] border border-white/10 rounded px-2.5 py-1.5 text-xs text-neutral-200"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400">Previsão Conclusão Obra *</label>
                  <input
                    type="date"
                    required
                    value={previsaoTermino}
                    onChange={(e) => setPrevisaoTermino(e.target.value)}
                    className="w-full mt-1 bg-[#222] border border-white/10 rounded px-2.5 py-1.5 text-xs text-neutral-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-neutral-400">Status Habilitação *</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as StatusHabilitacaoReidi)}
                    className="w-full mt-1 bg-[#222] border border-white/10 rounded px-2.5 py-1.5 text-xs text-neutral-200"
                  >
                    <option value="HABILITADO">Habilitado</option>
                    <option value="CO_HABILITADO">Co-Habilitado</option>
                    <option value="EM_ANALISE">Em Análise</option>
                    <option value="CONCLUIDO">Concluído</option>
                    <option value="CANCELADO">Cancelado</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400">Orçamento Total Obra (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={valorTotalEstimadoObraBRL}
                    onChange={(e) => setValorTotalEstimadoObraBRL(Number(e.target.value))}
                    className="w-full mt-1 bg-[#222] border border-white/10 rounded px-2.5 py-1.5 text-xs text-neutral-200 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400">Compras c/ Suspensão (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={aquisicoesComSuspensaoPisCofinsBRL}
                    onChange={(e) => setAquisicoesComSuspensaoPisCofinsBRL(Number(e.target.value))}
                    className="w-full mt-1 bg-[#222] border border-white/10 rounded px-2.5 py-1.5 text-xs text-neutral-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-neutral-400">Observações & Notas de Auditoria</label>
                <textarea
                  rows={2}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Detalhamento dos equipamentos e materiais vinculados ao projeto..."
                  className="w-full mt-1 bg-[#222] border border-white/10 rounded px-2.5 py-1.5 text-xs text-neutral-200"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition shadow-lg shadow-blue-600/20"
                >
                  Salvar Projeto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
