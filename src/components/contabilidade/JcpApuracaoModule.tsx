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
  Building2,
  DollarSign,
  ArrowRightLeft,
  FileCheck2,
  Globe2,
  HelpCircle,
  Scale,
  Percent,
  Layers,
  Sparkles,
  PieChart
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  Empresa,
  ApuracaoJcpExercicio,
  ResumoJcpPeriodo,
  FormaPagamentoJcp
} from '../../types/contabil';

interface JcpApuracaoModuleProps {
  empresaAtiva: Empresa | null;
  onOpenReportPreview?: (config: {
    titulo: string;
    subtitulo: string;
    conteudoHtml: string;
    imprimirDireto?: boolean;
  }) => void;
}

export const JcpApuracaoModule: React.FC<JcpApuracaoModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [resumo, setResumo] = useState<ResumoJcpPeriodo | null>(null);
  const [anoFiltro, setAnoFiltro] = useState<number>(2026);
  const [abaAtiva, setAbaAtiva] = useState<'apuracoes' | 'simulador' | 'legislacao'>('apuracoes');
  const [busca, setBusca] = useState('');

  // Modal formulário
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemEdicao, setItemEdicao] = useState<ApuracaoJcpExercicio | null>(null);

  // Campos do formulário
  const [formDataDeliberacao, setFormDataDeliberacao] = useState('2026-03-31');
  const [formFormaPagamento, setFormFormaPagamento] = useState<FormaPagamentoJcp>('CREDITADO_EM_CONTA');
  const [formPlContabil, setFormPlContabil] = useState<number>(25000000);
  const [formReservasIncentivosExcluidas, setFormReservasIncentivosExcluidas] = useState<number>(3500000);
  const [formAvpSubvencoesExcluidas, setFormAvpSubvencoesExcluidas] = useState<number>(500000);
  const [formTaxaTjlp, setFormTaxaTjlp] = useState<number>(6.85);
  const [formLucroAntesJcp, setFormLucroAntesJcp] = useState<number>(1850000);
  const [formReservasLucros, setFormReservasLucros] = useState<number>(4200000);
  const [formJcpDeliberado, setFormJcpDeliberado] = useState<number>(350000);
  const [formObservacoes, setFormObservacoes] = useState('');

  // Simulador rápido
  const [simPl, setSimPl] = useState<number>(30000000);
  const [simIncentivos, setSimIncentivos] = useState<number>(4000000);
  const [simTjlp, setSimTjlp] = useState<number>(6.85);
  const [simLucro, setSimLucro] = useState<number>(2500000);
  const [simReservas, setSimReservas] = useState<number>(5000000);

  const carregarDados = () => {
    if (!empresaAtiva) return;
    const res = dbService.getJcpPeriodo(empresaAtiva.id, anoFiltro);
    setResumo(res);
  };

  useEffect(() => {
    carregarDados();
  }, [empresaAtiva, anoFiltro]);

  const abrirModalNovo = () => {
    setItemEdicao(null);
    setFormDataDeliberacao(new Date().toISOString().split('T')[0]);
    setFormFormaPagamento('CREDITADO_EM_CONTA');
    setFormPlContabil(25000000);
    setFormReservasIncentivosExcluidas(3500000);
    setFormAvpSubvencoesExcluidas(500000);
    setFormTaxaTjlp(6.85);
    setFormLucroAntesJcp(1850000);
    setFormReservasLucros(4200000);
    setFormJcpDeliberado(350000);
    setFormObservacoes('Deliberação de JCP com base no balancete trimestral e nas restrições da Lei 14.789/23');
    setIsModalOpen(true);
  };

  const abrirModalEdicao = (jcp: ApuracaoJcpExercicio) => {
    setItemEdicao(jcp);
    setFormDataDeliberacao(jcp.dataDeliberacao);
    setFormFormaPagamento(jcp.formaPagamento);
    setFormPlContabil(jcp.patrimonioLiquidoContabilBRL);
    setFormReservasIncentivosExcluidas(jcp.reservasIncentivosFiscaisExcluidasBRL);
    setFormAvpSubvencoesExcluidas(jcp.avpSubvencoesExcluidasBRL);
    setFormTaxaTjlp(jcp.taxaTJLP_Anual);
    setFormLucroAntesJcp(jcp.lucroLiquidoAntesJcpBRL);
    setFormReservasLucros(jcp.reservasLucrosAcumuladasBRL);
    setFormJcpDeliberado(jcp.valorJcpDeliberadoBRL);
    setFormObservacoes(jcp.observacoes || '');
    setIsModalOpen(true);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaAtiva) return;

    const item: ApuracaoJcpExercicio = {
      id: itemEdicao ? itemEdicao.id : `jcp-${Date.now()}`,
      empresaId: empresaAtiva.id,
      anoExercicio: anoFiltro,
      dataDeliberacao: formDataDeliberacao,
      formaPagamento: formFormaPagamento,
      patrimonioLiquidoContabilBRL: formPlContabil,
      reservasIncentivosFiscaisExcluidasBRL: formReservasIncentivosExcluidas,
      avpSubvencoesExcluidasBRL: formAvpSubvencoesExcluidas,
      plAjustadoCalculoTJLP_BRL: 0,
      taxaTJLP_Anual: formTaxaTjlp,
      valorLimiteTjlpPL_BRL: 0,
      lucroLiquidoAntesJcpBRL: formLucroAntesJcp,
      limite50PorcentoLucroLiquidoBRL: 0,
      reservasLucrosAcumuladasBRL: formReservasLucros,
      limite50PorcentoReservasBRL: 0,
      valorJcpDeliberadoBRL: formJcpDeliberado,
      aliquotaIrrfFonte: 15.0,
      valorIrrfFonteRetidoBRL: 0,
      valorJcpLiquidoBeneficiariosBRL: 0,
      parcelaDedutivelExclusaoLalurBRL: 0,
      parcelaIndedutivelBRL: 0,
      integradoContabil: itemEdicao ? itemEdicao.integradoContabil : false,
      observacoes: formObservacoes
    };

    dbService.salvarApuracaoJcp(item);
    setIsModalOpen(false);
    carregarDados();
  };

  const handleExcluir = (id: string) => {
    if (window.confirm('Confirma a exclusão desta apuração de JCP?')) {
      dbService.excluirApuracaoJcp(id);
      carregarDados();
    }
  };

  const handleIntegrarContabil = (id: string) => {
    const res = dbService.integrarJcpContabilLalur(id);
    if (res.sucesso) {
      alert(`Integração de JCP realizada com sucesso!\nLançamento nº: ${res.lancamentoId}\n${res.mensagem}`);
      carregarDados();
    } else {
      alert(`Erro na integração: ${res.mensagem}`);
    }
  };

  // Filtragem
  const apuracoesFiltradas = (resumo?.apuracoes || []).filter(j => {
    const texto = busca.toLowerCase();
    return (
      j.dataDeliberacao.toLowerCase().includes(texto) ||
      j.formaPagamento.toLowerCase().includes(texto) ||
      (j.observacoes && j.observacoes.toLowerCase().includes(texto))
    );
  });

  // Simulador
  const calcularSimulador = () => {
    const plAjustado = Math.max(0, simPl - simIncentivos);
    const taxaTrimestral = (simTjlp / 100) * 0.25;
    const tetoTjlp = plAjustado * taxaTrimestral;
    const teto50Lucro = simLucro * 0.50;
    const teto50Reservas = simReservas * 0.50;
    const tetoDedutibilidade = Math.min(tetoTjlp, Math.max(teto50Lucro, teto50Reservas));
    
    // Economia Fiscal Líquida (IRPJ 25% + CSLL 9% - IRRF 15%) = 19% líquido
    const economiaIrpjCsll34 = tetoDedutibilidade * 0.34;
    const irrfRetido15 = tetoDedutibilidade * 0.15;
    const beneficioLiquido19 = tetoDedutibilidade * 0.19;

    return {
      plAjustado,
      tetoTjlp,
      teto50Lucro,
      teto50Reservas,
      tetoDedutibilidade,
      economiaIrpjCsll34,
      irrfRetido15,
      beneficioLiquido19
    };
  };

  const simResult = calcularSimulador();

  // Emissão de Ata e Laudo A4
  const emitirLaudoA4 = () => {
    if (!empresaAtiva || !resumo) return;

    const dataHoje = new Date().toLocaleDateString('pt-BR');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.45; padding: 15px;">
        <div style="text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 15px;">
          <h2 style="margin: 0 0 4px 0; color: #1e3a8a; text-transform: uppercase; font-size: 15pt;">
            DEMONSTRATIVO DE JUROS SOBRE O CAPITAL PRÓPRIO (JCP)
          </h2>
          <p style="margin: 0; font-size: 9.5pt; color: #475569; font-weight: bold;">
            Art. 9º da Lei nº 9.249/1995 c/c Filtros Restritivos da Lei nº 14.789/2023 e Deliberação CVM nº 207/1996
          </p>
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px; background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 4px; margin-bottom: 15px; font-size: 9pt;">
          <div>
            <p style="margin: 2px 0;"><strong>Entidade Pagadora:</strong> ${empresaAtiva.razaoSocial}</p>
            <p style="margin: 2px 0;"><strong>CNPJ:</strong> ${empresaAtiva.cnpj} &nbsp;|&nbsp; <strong>Ano-Base:</strong> ${anoFiltro}</p>
            <p style="margin: 2px 0;"><strong>Regime Tributário:</strong> Lucro Real Trimestral / Anual</p>
          </div>
          <div>
            <p style="margin: 2px 0;"><strong>Data de Emissão:</strong> ${dataHoje}</p>
            <p style="margin: 2px 0;"><strong>Retenção de IRRF:</strong> 15,00% (DARF Código 5706)</p>
            <p style="margin: 2px 0;"><strong>Reflexo LALUR:</strong> <span style="font-weight: bold; color: #16a34a;">EXCLUSÃO PARTE A</span></p>
          </div>
        </div>

        <div style="margin-bottom: 15px;">
          <h4 style="margin: 0 0 6px 0; color: #1e3a8a; font-size: 10.5pt; text-transform: uppercase;">1. Resumo das Deliberações e Impacto no Lucro Real</h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 9pt;">
            <thead>
              <tr style="background-color: #f1f5f9; border-top: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1;">
                <th style="padding: 6px; text-align: left;">Métrica de Apuração / Tributação</th>
                <th style="padding: 6px; text-align: right;">Total do Período (R$)</th>
                <th style="padding: 6px; text-align: right;">Tratamento Contábil / Fiscal</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 6px;">Total de Juros sobre o Capital Próprio Deliberados (Bruto)</td>
                <td style="padding: 6px; text-align: right; font-family: monospace;">R$ ${resumo.totalJcpDeliberadoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="padding: 6px; text-align: right; color: #64748b;">Débito no PL / DLPA</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0; background-color: #fef2f2;">
                <td style="padding: 6px; font-weight: bold; color: #991b1b;">(-) IRRF Retido na Fonte a Recolher (15% - DARF 5706)</td>
                <td style="padding: 6px; text-align: right; font-family: monospace; font-weight: bold; color: #991b1b;">R$ ${resumo.totalIrrfFonteRetidoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="padding: 6px; text-align: right; color: #991b1b; font-weight: bold;">Passivo Circulante Tributário</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 6px; font-weight: bold; color: #1e3a8a;">(=) Valor Líquido Disponibilizado aos Sócios / Acionistas</td>
                <td style="padding: 6px; text-align: right; font-family: monospace; font-weight: bold; color: #1e3a8a;">R$ ${resumo.totalJcpLiquidoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="padding: 6px; text-align: right; color: #1e3a8a; font-weight: bold;">JCP a Pagar (Passivo Circulante)</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0; background-color: #f0fdf4;">
                <td style="padding: 6px; font-weight: bold; color: #166534;">Parcela Dedutível no IRPJ e CSLL (Exclusão Parte A e-LALUR)</td>
                <td style="padding: 6px; text-align: right; font-family: monospace; font-weight: bold; color: #166534;">R$ ${resumo.totalExclusaoParteALalurBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="padding: 6px; text-align: right; color: #166534; font-weight: bold;">Exclusão Código M300/M350</td>
              </tr>
              <tr style="border-bottom: 2px solid #cbd5e1;">
                <td style="padding: 6px; color: #64748b;">Parcela Indedutível (se exceder os limites legais)</td>
                <td style="padding: 6px; text-align: right; font-family: monospace; color: #64748b;">R$ ${resumo.totalIndedutivelBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="padding: 6px; text-align: right; color: #64748b;">Sem Efeito Fiscal</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="margin-bottom: 15px;">
          <h4 style="margin: 0 0 6px 0; color: #1e3a8a; font-size: 10.5pt; text-transform: uppercase;">2. Memória de Cálculo Individualizada e Restrições da Lei 14.789/23</h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 8.5pt;">
            <thead>
              <tr style="background-color: #f1f5f9; border-top: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1;">
                <th style="padding: 5px; text-align: left;">Data Deliberação</th>
                <th style="padding: 5px; text-align: right;">PL Contábil (R$)</th>
                <th style="padding: 5px; text-align: right;">(-) Exclusões Lei 14.789 (R$)</th>
                <th style="padding: 5px; text-align: right;">PL Ajustado (R$)</th>
                <th style="padding: 5px; text-align: center;">TJLP (%)</th>
                <th style="padding: 5px; text-align: right;">Teto TJLP (R$)</th>
                <th style="padding: 5px; text-align: right;">JCP Deliberado (R$)</th>
                <th style="padding: 5px; text-align: right;">IRRF 15% (R$)</th>
              </tr>
            </thead>
            <tbody>
              ${resumo.apuracoes.map(j => `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 5px;">
                    <strong>${j.dataDeliberacao}</strong><br/>
                    <span style="color: #64748b; font-size: 7.5pt;">${j.formaPagamento.replace('_', ' ')}</span>
                  </td>
                  <td style="padding: 5px; text-align: right; font-family: monospace;">R$ ${j.patrimonioLiquidoContabilBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td style="padding: 5px; text-align: right; font-family: monospace; color: #dc2626;">R$ ${(j.reservasIncentivosFiscaisExcluidasBRL + j.avpSubvencoesExcluidasBRL).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td style="padding: 5px; text-align: right; font-family: monospace; font-weight: bold;">R$ ${j.plAjustadoCalculoTJLP_BRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td style="padding: 5px; text-align: center;">${j.taxaTJLP_Anual.toFixed(2)}%</td>
                  <td style="padding: 5px; text-align: right; font-family: monospace;">R$ ${j.valorLimiteTjlpPL_BRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td style="padding: 5px; text-align: right; font-family: monospace; font-weight: bold; color: #166534;">R$ ${j.valorJcpDeliberadoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td style="padding: 5px; text-align: right; font-family: monospace; color: #991b1b;">R$ ${j.valorIrrfFonteRetidoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 10px; margin-bottom: 25px; font-size: 8pt; color: #334155;">
          <strong>Fundamentação Legal e Restrições Adicionadas pela Lei nº 14.789/2023:</strong>
          <br/>1. <em>Nova Base de Cálculo do PL Ajustado (§ 8º do Art. 9º da Lei 9.249/95):</em> A partir de 01/01/2024, devem ser compulsoriamente excluídas do PL para fins de cálculo da TJLP: as reservas de incentivos fiscais decorrentes de subvenções para investimentos, as reservas de reavaliação de ativos ainda não realizadas e os ajustes a valor presente (AVP).
          <br/>2. <em>Duplo Limite de Dedutibilidade (§ 1º do Art. 9º):</em> O montante dos juros remuneratórios dedutíveis fica limitado ao maior valor entre: 50% do lucro líquido do exercício antes do JCP ou 50% do somatório dos lucros acumulados e reservas de lucros.
          <br/>3. <em>Eficiência Tributária Líquida:</em> O JCP proporciona economia de 34% (25% IRPJ + 9% CSLL) para a pessoa jurídica, contra uma retenção na fonte definitiva de 15% (DARF 5706), gerando um ganho tributário líquido consolidado de 19% sobre a quantia deliberada.
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; text-align: center; font-size: 9pt;">
          <div>
            <div style="border-top: 1px solid #111; padding-top: 5px; font-weight: bold;">
              ${empresaAtiva.razaoSocial}<br/>
              <span style="font-size: 8pt; font-weight: normal; color: #475569;">Diretoria Financeira / Relações com Investidores</span>
            </div>
          </div>
          <div>
            <div style="border-top: 1px solid #111; padding-top: 5px; font-weight: bold;">
              Perito Contábil / Auditor Independente<br/>
              <span style="font-size: 8pt; font-weight: normal; color: #475569;">CRC/SP nº 1SP999999/O-0 &nbsp;|&nbsp; CNAI nº 4589</span>
            </div>
          </div>
        </div>
      </div>
    `;

    if (onOpenReportPreview) {
      onOpenReportPreview({
        titulo: 'Demonstrativo de Juros sobre o Capital Próprio (JCP)',
        subtitulo: `Memória de Cálculo e Restrições da Lei nº 14.789/2023 - ${anoFiltro}`,
        conteudoHtml: htmlContent
      });
    } else {
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(`<html><head><title>Demonstrativo JCP</title></head><body>${htmlContent}</body></html>`);
        win.document.close();
        win.print();
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#141414] text-neutral-100 overflow-y-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-[#1a1a1a]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-950/40 text-amber-400 border border-amber-800/50 shadow-inner">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">Juros sobre o Capital Próprio (JCP)</h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-900/60 text-amber-200 border border-amber-700/60">
                Lei nº 14.789/2023 / Art. 9º Lei 9.249/95
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Apuração do limite TJLP sobre o PL Ajustado com exclusão de subvenções, duplo teto legal e exclusão no e-LALUR
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Seletor de Ano */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-neutral-900 border border-neutral-700 text-xs">
            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-neutral-400">Ano:</span>
            <select
              value={anoFiltro}
              onChange={(e) => setAnoFiltro(Number(e.target.value))}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value={2024} className="bg-neutral-900">2024</option>
              <option value={2025} className="bg-neutral-900">2025</option>
              <option value={2026} className="bg-neutral-900">2026</option>
              <option value={2027} className="bg-neutral-900">2027</option>
            </select>
          </div>

          <button
            onClick={carregarDados}
            className="p-2 rounded-md hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
            title="Atualizar Dados"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={emitirLaudoA4}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-neutral-400" />
            <span>Memória A4 Timbrada</span>
          </button>

          <button
            onClick={abrirModalNovo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium shadow transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Deliberação JCP</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4">
        {/* Card 1: JCP Deliberado */}
        <div className="p-3.5 rounded-lg bg-neutral-900/90 border border-neutral-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Total JCP Deliberado</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-mono font-bold text-amber-300">
              R$ {(resumo?.totalJcpDeliberadoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            Remuneração bruta deliberada
          </p>
        </div>

        {/* Card 2: IRRF Retido */}
        <div className="p-3.5 rounded-lg bg-red-950/30 border border-red-900/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-red-300 text-xs">
            <span>IRRF Fonte (15%)</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-mono font-bold text-red-400">
              R$ {(resumo?.totalIrrfFonteRetidoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-red-300/70 mt-1 font-medium">
            DARF Código 5706 a recolher
          </p>
        </div>

        {/* Card 3: JCP Líquido */}
        <div className="p-3.5 rounded-lg bg-neutral-900/90 border border-neutral-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>JCP Líquido Beneficiários</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-mono font-bold text-emerald-300">
              R$ {(resumo?.totalJcpLiquidoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            Crédito aos acionistas/quotistas
          </p>
        </div>

        {/* Card 4: Exclusão LALUR */}
        <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-900/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-300 text-xs">
            <span>Exclusão Parte A (LALUR)</span>
            <FileText className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-mono font-bold text-emerald-400">
              R$ {(resumo?.totalExclusaoParteALalurBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-emerald-300/70 mt-1 font-medium">
            Dedutibilidade no Lucro Real
          </p>
        </div>

        {/* Card 5: Ganho Tributário Líquido */}
        <div className="p-3.5 rounded-lg bg-neutral-900/90 border border-neutral-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Economia Líquida (19%)</span>
            <Sparkles className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-mono font-bold text-blue-300">
              R$ {(((resumo?.totalExclusaoParteALalurBRL || 0) * 0.19)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            Ganho líquido (34% IRPJ/CSLL - 15% IRRF)
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center border-b border-neutral-800 px-4 bg-[#171717]">
        <button
          onClick={() => setAbaAtiva('apuracoes')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            abaAtiva === 'apuracoes'
              ? 'border-amber-500 text-amber-400 bg-amber-950/10'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>Apurações & Deliberações do Exercício ({resumo?.apuracoes.length || 0})</span>
        </button>

        <button
          onClick={() => setAbaAtiva('simulador')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            abaAtiva === 'simulador'
              ? 'border-amber-500 text-amber-400 bg-amber-950/10'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Simulador de PL Ajustado e Limites Legais</span>
        </button>

        <button
          onClick={() => setAbaAtiva('legislacao')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            abaAtiva === 'legislacao'
              ? 'border-amber-500 text-amber-400 bg-amber-950/10'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Regras Restritivas da Lei nº 14.789/2023</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4">
        {abaAtiva === 'apuracoes' && (
          <div className="space-y-4">
            {/* Toolbar com Busca */}
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar por data, forma de pagamento ou histórico..."
                  className="w-full pl-9 pr-4 py-1.5 rounded-md bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span>{apuracoesFiltradas.length} apuração(ões) registrada(s)</span>
              </div>
            </div>

            {/* Tabela de Apurações */}
            <div className="border border-neutral-800 rounded-lg overflow-hidden bg-neutral-900/60">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-800/80 text-neutral-400 border-b border-neutral-700/80">
                    <th className="p-3 font-semibold">Data / Pagamento</th>
                    <th className="p-3 font-semibold text-right">PL Contábil</th>
                    <th className="p-3 font-semibold text-right">(-) Exclusões Lei 14.789</th>
                    <th className="p-3 font-semibold text-right">PL Ajustado</th>
                    <th className="p-3 font-semibold text-center">TJLP</th>
                    <th className="p-3 font-semibold text-right">Teto TJLP</th>
                    <th className="p-3 font-semibold text-right">JCP Deliberado</th>
                    <th className="p-3 font-semibold text-right">IRRF 15%</th>
                    <th className="p-3 font-semibold text-right">Exclusão LALUR</th>
                    <th className="p-3 font-semibold text-center">Contábil</th>
                    <th className="p-3 font-semibold text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {apuracoesFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="p-8 text-center text-neutral-500">
                        Nenhuma apuração de JCP deliberada para este exercício.
                      </td>
                    </tr>
                  ) : (
                    apuracoesFiltradas.map((item) => (
                      <tr key={item.id} className="hover:bg-neutral-800/50 transition-colors">
                        <td className="p-3">
                          <div className="font-semibold text-white">{item.dataDeliberacao}</div>
                          <div className="text-[10px] text-neutral-400">
                            {item.formaPagamento === 'CREDITADO_EM_CONTA' ? 'Creditado em Conta' :
                             item.formaPagamento === 'PAGO_EM_DINHEIRO' ? 'Pago em Dinheiro' : 'Capitalizado'}
                          </div>
                        </td>

                        <td className="p-3 text-right font-mono text-neutral-300">
                          R$ {item.patrimonioLiquidoContabilBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>

                        <td className="p-3 text-right font-mono text-red-400 font-medium">
                          R$ {(item.reservasIncentivosFiscaisExcluidasBRL + item.avpSubvencoesExcluidasBRL).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>

                        <td className="p-3 text-right font-mono font-bold text-white">
                          R$ {item.plAjustadoCalculoTJLP_BRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>

                        <td className="p-3 text-center font-mono text-neutral-300">
                          {item.taxaTJLP_Anual.toFixed(2)}%
                        </td>

                        <td className="p-3 text-right font-mono text-neutral-300">
                          R$ {item.valorLimiteTjlpPL_BRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>

                        <td className="p-3 text-right font-mono font-bold text-amber-300">
                          R$ {item.valorJcpDeliberadoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>

                        <td className="p-3 text-right font-mono font-bold text-red-400">
                          R$ {item.valorIrrfFonteRetidoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>

                        <td className="p-3 text-right font-mono font-bold text-emerald-400">
                          R$ {item.parcelaDedutivelExclusaoLalurBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>

                        <td className="p-3 text-center">
                          {item.integradoContabil ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40">
                              <FileCheck2 className="w-3 h-3" />
                              Integrado
                            </span>
                          ) : (
                            <button
                              onClick={() => handleIntegrarContabil(item.id)}
                              className="inline-flex items-center gap-1 text-[10px] text-amber-300 hover:text-white bg-amber-950/60 hover:bg-amber-900/80 px-2 py-0.5 rounded border border-amber-800 transition-colors"
                              title="Integrar Provisão de JCP e IRRF na Contabilidade e LALUR"
                            >
                              <ArrowRightLeft className="w-3 h-3" />
                              Integrar
                            </button>
                          )}
                        </td>

                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => abrirModalEdicao(item)}
                              className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
                              title="Editar Deliberação"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleExcluir(item.id)}
                              className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-red-400 transition-colors"
                              title="Excluir Deliberação"
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

            {/* Banner Informativo */}
            <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-neutral-300">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>
                  A Lei nº 14.789/2023 veda o cômputo no PL de reservas constituídas com subvenções para investimentos na base da TJLP para efeito de cálculo do JCP.
                </span>
              </div>
              <span className="text-neutral-400 text-[11px]">e-LALUR M300 (Código R-0034)</span>
            </div>
          </div>
        )}

        {abaAtiva === 'simulador' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Painel Parâmetros */}
            <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 space-y-4">
              <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
                <Calculator className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                  Parâmetros de Simulação de JCP & Restrições Legais
                </h3>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">
                  Patrimônio Líquido Total Contábil (Balanço) (R$)
                </label>
                <input
                  type="number"
                  value={simPl}
                  onChange={(e) => setSimPl(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded bg-neutral-950 border border-neutral-800 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-red-400 mb-1">
                  (-) Reservas de Incentivos Fiscais / Subvenções Excluídas (Lei 14.789/23) (R$)
                </label>
                <input
                  type="number"
                  value={simIncentivos}
                  onChange={(e) => setSimIncentivos(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded bg-neutral-950 border border-red-900/60 text-red-300 font-mono text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Taxa TJLP Anual (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={simTjlp}
                    onChange={(e) => setSimTjlp(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded bg-neutral-950 border border-neutral-800 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Lucro Líquido do Exercício (R$)
                  </label>
                  <input
                    type="number"
                    value={simLucro}
                    onChange={(e) => setSimLucro(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded bg-neutral-950 border border-neutral-800 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">
                  Saldo de Lucros Acumulados e Reservas de Lucros (R$)
                </label>
                <input
                  type="number"
                  value={simReservas}
                  onChange={(e) => setSimReservas(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded bg-neutral-950 border border-neutral-800 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Painel Resultados */}
            <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                    Limites de Dedutibilidade e Eficiência Fiscal
                  </h3>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="p-3 rounded bg-neutral-950 border border-neutral-800 flex justify-between items-center">
                    <div>
                      <span className="text-xs text-neutral-400">Patrimônio Líquido Ajustado (Base TJLP):</span>
                      <p className="text-[11px] text-neutral-500">PL Contábil (-) Subvenções e Incentivos</p>
                    </div>
                    <span className="text-base font-mono font-bold text-white">
                      R$ {simResult.plAjustado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="p-3 rounded bg-neutral-950 border border-neutral-800 flex justify-between items-center">
                    <span className="text-xs text-neutral-400">Limite Trimestral da TJLP:</span>
                    <span className="text-base font-mono font-bold text-amber-300">
                      R$ {simResult.tetoTjlp.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="p-3 rounded bg-neutral-950 border border-neutral-800 flex justify-between items-center">
                    <div>
                      <span className="text-xs text-neutral-400">Duplo Teto Legal (§ 1º Art. 9º):</span>
                      <p className="text-[10px] text-neutral-500">50% do Lucro ou 50% das Reservas</p>
                    </div>
                    <span className="text-base font-mono font-bold text-neutral-300">
                      R$ {Math.max(simResult.teto50Lucro, simResult.teto50Reservas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="p-3 rounded bg-emerald-950/30 border border-emerald-900/60 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-emerald-300">Teto Máximo Dedutível no IRPJ/CSLL:</span>
                      <p className="text-[10px] text-emerald-400/80">Exclusão permitida na Parte A do e-LALUR</p>
                    </div>
                    <span className="text-lg font-mono font-bold text-emerald-400">
                      R$ {simResult.tetoDedutibilidade.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="p-3 rounded bg-neutral-950 border border-neutral-800 flex justify-between items-center">
                    <div>
                      <span className="text-xs text-neutral-400">Ganho Tributário Líquido (19% Líquido):</span>
                      <p className="text-[10px] text-neutral-500">Economia no IRPJ/CSLL 34% (-) Retenção IRRF 15%</p>
                    </div>
                    <span className="text-lg font-mono font-bold text-blue-400">
                      R$ {simResult.beneficioLiquido19.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-neutral-400 p-2.5 rounded bg-neutral-800/40 border border-neutral-700/60 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>
                  <strong>Planejamento Societário:</strong> Deliberar JCP até o teto legal da TJLP sobre o PL Ajustado reduz substancialmente o encargo tributário em relação à mera distribuição de dividendos.
                </span>
              </div>
            </div>
          </div>
        )}

        {abaAtiva === 'legislacao' && (
          <div className="max-w-4xl space-y-4">
            <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                Alterações Trazidas pela Lei nº 14.789/2023 no Cálculo do JCP
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed mb-3">
                A <strong>Lei nº 14.789/2023</strong> introduziu o § 8º no Art. 9º da <strong>Lei nº 9.249/1995</strong>, limitando severamente os elementos contábeis que podem compor o Patrimônio Líquido para cálculo da remuneração por Juros sobre o Capital Próprio a partir de 1º de janeiro de 2024.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-3.5 rounded bg-neutral-950 border border-neutral-800">
                  <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    Contas Excluídas Compulsoriamente do PL
                  </div>
                  <ul className="text-xs text-neutral-400 space-y-1.5 list-disc list-inside mt-2">
                    <li><strong>Reservas de Incentivos Fiscais:</strong> Decorrentes de subvenções governamentais de ICMS ou União (Art. 195-A da Lei 6.404/76).</li>
                    <li><strong>Reservas de Reavaliação:</strong> De bens e direitos ainda não realizados financeiramente.</li>
                    <li><strong>Ajustes de Avaliação Patrimonial (AVP):</strong> Variações a valor justo decorrentes de combinações de negócios ou equivalência patrimonial.</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded bg-neutral-950 border border-neutral-800">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase mb-1">
                    <CheckCircle className="w-4 h-4" />
                    Contas Mantidas na Base de Cálculo
                  </div>
                  <ul className="text-xs text-neutral-400 space-y-1.5 list-disc list-inside mt-2">
                    <li><strong>Capital Social Subscrito e Integralizado</strong>.</li>
                    <li><strong>Reservas de Capital</strong> formadas por ágio na emissão de ações e doações efetivas.</li>
                    <li><strong>Reservas de Lucros</strong> (Reserva Legal, Estatutária, Retenção de Lucros).</li>
                    <li><strong>Ações em Tesouraria</strong> (como conta redutora do PL).</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Formulário Deliberação JCP */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#1c1c1c] border border-neutral-700 rounded-lg shadow-2xl max-w-2xl w-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-[#222222]">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  {itemEdicao ? 'Editar Deliberação de JCP' : 'Nova Deliberação de Juros sobre o Capital Próprio'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-white text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSalvar} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Data da Deliberação / Reunião de Sócios
                  </label>
                  <input
                    type="date"
                    required
                    value={formDataDeliberacao}
                    onChange={(e) => setFormDataDeliberacao(e.target.value)}
                    className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Forma de Liquidação / Pagamento
                  </label>
                  <select
                    value={formFormaPagamento}
                    onChange={(e) => setFormFormaPagamento(e.target.value as FormaPagamentoJcp)}
                    className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="CREDITADO_EM_CONTA">Creditado em Conta Corrente dos Sócios</option>
                    <option value="PAGO_EM_DINHEIRO">Pago em Moeda Corrente (Bancos)</option>
                    <option value="CAPITALIZADO">Capitalizado (Incorporação ao Capital Social)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    PL Contábil Balanço (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formPlContabil}
                    onChange={(e) => setFormPlContabil(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-red-400 mb-1">
                    (-) Res. Incentivos (Lei 14.789)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formReservasIncentivosExcluidas}
                    onChange={(e) => setFormReservasIncentivosExcluidas(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-red-900/60 text-red-300 font-mono text-xs focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-red-400 mb-1">
                    (-) AVP / Subvenções
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formAvpSubvencoesExcluidas}
                    onChange={(e) => setFormAvpSubvencoesExcluidas(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-red-900/60 text-red-300 font-mono text-xs focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Taxa TJLP Anual (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formTaxaTjlp}
                    onChange={(e) => setFormTaxaTjlp(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Lucro Líquido Antes JCP (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formLucroAntesJcp}
                    onChange={(e) => setFormLucroAntesJcp(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Reservas de Lucros (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formReservasLucros}
                    onChange={(e) => setFormReservasLucros(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-amber-400 mb-1">
                  Valor Bruto do JCP Deliberado (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formJcpDeliberado}
                  onChange={(e) => setFormJcpDeliberado(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-amber-600/60 text-amber-300 font-mono text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">
                  Observações e Justificativas da Ata
                </label>
                <textarea
                  rows={2}
                  value={formObservacoes}
                  onChange={(e) => setFormObservacoes(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  placeholder="Informações adicionais para a Ata de Deliberação"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium shadow transition-colors"
                >
                  Salvar e Calcular Limites
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default JcpApuracaoModule;
