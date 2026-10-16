import React, { useState, useEffect } from 'react';
import {
  Scale,
  Plus,
  RefreshCw,
  Printer,
  TrendingDown,
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
  Layers,
  AlertOctagon,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  Empresa,
  ContratoSubcapitalizacaoThinCap,
  ResumoSubcapitalizacaoThinCap,
  TipoJurisdicaoCredora
} from '../../types/contabil';

interface SubcapitalizacaoThinCapModuleProps {
  empresaAtiva: Empresa | null;
  onOpenReportPreview?: (config: {
    titulo: string;
    subtitulo: string;
    conteudoHtml: string;
    imprimirDireto?: boolean;
  }) => void;
}

export const SubcapitalizacaoThinCapModule: React.FC<SubcapitalizacaoThinCapModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [resumo, setResumo] = useState<ResumoSubcapitalizacaoThinCap | null>(null);
  const [anoFiltro, setAnoFiltro] = useState<number>(2026);
  const [abaAtiva, setAbaAtiva] = useState<'contratos' | 'simulador' | 'legislacao'>('contratos');
  const [busca, setBusca] = useState('');

  // Modal formulário
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemEdicao, setItemEdicao] = useState<ContratoSubcapitalizacaoThinCap | null>(null);

  // Campos do formulário
  const [formNumContrato, setFormNumContrato] = useState('LOAN-EXT-2026-001');
  const [formCredor, setFormCredor] = useState('Atlas Global Holdings LLC');
  const [formPais, setFormPais] = useState('Estados Unidos (EUA)');
  const [formTipoJurisdicao, setFormTipoJurisdicao] = useState<TipoJurisdicaoCredora>('PESSOA_VINCULADA_REGIME_COMUM');
  const [formParticipacaoPL, setFormParticipacaoPL] = useState<number>(75.0);
  const [formPatrimonioLiquido, setFormPatrimonioLiquido] = useState<number>(18500000);
  const [formSaldoEndividamento, setFormSaldoEndividamento] = useState<number>(32000000);
  const [formDespesaJuros, setFormDespesaJuros] = useState<number>(2240000);
  const [formObservacoes, setFormObservacoes] = useState('');

  // Simulador rápido
  const [simTipoJurisdicao, setSimTipoJurisdicao] = useState<TipoJurisdicaoCredora>('PESSOA_VINCULADA_REGIME_COMUM');
  const [simPL, setSimPL] = useState<number>(20000000);
  const [simParticipacao, setSimParticipacao] = useState<number>(100);
  const [simDivida, setSimDivida] = useState<number>(45000000);
  const [simTaxaJurosAnual, setSimTaxaJurosAnual] = useState<number>(7.5);

  const carregarDados = () => {
    if (!empresaAtiva) return;
    const res = dbService.getSubcapitalizacaoThinCap(empresaAtiva.id, anoFiltro);
    setResumo(res);
  };

  useEffect(() => {
    carregarDados();
  }, [empresaAtiva, anoFiltro]);

  const abrirModalNovo = () => {
    setItemEdicao(null);
    setFormNumContrato(`LOAN-EXT-${anoFiltro}-${Math.floor(100 + Math.random() * 900)}`);
    setFormCredor('EuroFin Invest S.A.');
    setFormPais('Luxemburgo');
    setFormTipoJurisdicao('PESSOA_VINCULADA_REGIME_COMUM');
    setFormParticipacaoPL(60.0);
    setFormPatrimonioLiquido(resumo?.totalPatrimonioLiquidoEmpresa || 18500000);
    setFormSaldoEndividamento(15000000);
    setFormDespesaJuros(1050000);
    setFormObservacoes('Contrato de mútuo com controladora internacional para capital de giro');
    setIsModalOpen(true);
  };

  const abrirModalEdicao = (contrato: ContratoSubcapitalizacaoThinCap) => {
    setItemEdicao(contrato);
    setFormNumContrato(contrato.numeroContratoDivida);
    setFormCredor(contrato.entidadeCredoraExterior);
    setFormPais(contrato.paisJurisdicaoCredora);
    setFormTipoJurisdicao(contrato.tipoJurisdicao);
    setFormParticipacaoPL(contrato.percentualParticipacaoSocietariaPL);
    setFormPatrimonioLiquido(contrato.valorPatrimonioLiquidoReferenciaBRL);
    setFormSaldoEndividamento(contrato.valorSaldoEndividamentoMedioBRL);
    setFormDespesaJuros(contrato.despesaTotalJurosPeriodoBRL);
    setFormObservacoes(contrato.observacoes || '');
    setIsModalOpen(true);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaAtiva) return;

    const item: ContratoSubcapitalizacaoThinCap = {
      id: itemEdicao ? itemEdicao.id : `subcap-${Date.now()}`,
      empresaId: empresaAtiva.id,
      numeroContratoDivida: formNumContrato,
      entidadeCredoraExterior: formCredor,
      paisJurisdicaoCredora: formPais,
      tipoJurisdicao: formTipoJurisdicao,
      percentualParticipacaoSocietariaPL: formParticipacaoPL,
      valorPatrimonioLiquidoReferenciaBRL: formPatrimonioLiquido,
      valorSaldoEndividamentoMedioBRL: formSaldoEndividamento,
      limiteMaximoEndividamentoBRL: 0,
      razaoEndividamentoApurada: 0,
      ultrapassouLimiteLegal: false,
      despesaTotalJurosPeriodoBRL: formDespesaJuros,
      jurosDedutiveisBRL: 0,
      jurosIndedutiveisAdicaoLalurBRL: 0,
      dataCalculo: new Date().toISOString().split('T')[0],
      integradoContabil: itemEdicao ? itemEdicao.integradoContabil : false,
      observacoes: formObservacoes
    };

    dbService.salvarContratoSubcapitalizacao(item);
    setIsModalOpen(false);
    carregarDados();
  };

  const handleExcluir = (id: string) => {
    if (window.confirm('Confirma a exclusão deste contrato do controle de Thin Capitalization?')) {
      dbService.excluirContratoSubcapitalizacao(id);
      carregarDados();
    }
  };

  const handleIntegrarLalur = (contratoId: string) => {
    const res = dbService.integrarJurosIndedutiveisLalur(contratoId);
    if (res.sucesso) {
      alert(`Integração realizada com sucesso!\nLançamento: ${res.lancamentoId || res.loteId}\nValor da Adição no LALUR: R$ ${(res.valorAdicao || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
      carregarDados();
    } else {
      alert(`Falha na integração: ${res.mensagem}`);
    }
  };

  // Contratos filtrados
  const contratosFiltrados = (resumo?.contratos || []).filter(c => {
    const texto = busca.toLowerCase();
    return (
      c.numeroContratoDivida.toLowerCase().includes(texto) ||
      c.entidadeCredoraExterior.toLowerCase().includes(texto) ||
      c.paisJurisdicaoCredora.toLowerCase().includes(texto)
    );
  });

  // Cálculos do simulador
  const calcularSimulador = () => {
    const plBase = simPL;
    let limite = 0;
    let razao = 0;
    let jurosAnual = simDivida * (simTaxaJurosAnual / 100);

    if (simTipoJurisdicao === 'PARAISO_FISCAL_OU_REGIME_PRIVILEGIADO') {
      limite = plBase * 0.30;
      razao = plBase > 0 ? simDivida / plBase : 0;
    } else {
      const plVinculada = plBase * (simParticipacao / 100);
      limite = plVinculada * 2.0;
      razao = plVinculada > 0 ? simDivida / plVinculada : 0;
    }

    const ultrapassou = simTipoJurisdicao === 'PARAISO_FISCAL_OU_REGIME_PRIVILEGIADO' ? razao > 0.30 : razao > 2.0;
    let jurosIndedutiveis = 0;
    let jurosDedutiveis = jurosAnual;

    if (ultrapassou && simDivida > 0) {
      const excesso = simDivida - limite;
      const razaoExcesso = excesso / simDivida;
      jurosIndedutiveis = jurosAnual * razaoExcesso;
      jurosDedutiveis = jurosAnual - jurosIndedutiveis;
    }

    const irpjCsllEstimado = jurosIndedutiveis * 0.34;

    return {
      limite,
      razao,
      ultrapassou,
      jurosAnual,
      jurosDedutiveis,
      jurosIndedutiveis,
      irpjCsllEstimado
    };
  };

  const simResult = calcularSimulador();

  // Emissão de Laudo A4
  const emitirLaudoA4 = () => {
    if (!empresaAtiva || !resumo) return;

    const dataHoje = new Date().toLocaleDateString('pt-BR');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.45; padding: 15px;">
        <div style="text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 15px;">
          <h2 style="margin: 0 0 4px 0; color: #1e3a8a; text-transform: uppercase; font-size: 16pt;">
            DEMONSTRATIVO DE SUBCAPITALIZAÇÃO E LIMITAÇÃO DE JUROS (THIN CAPITALIZATION)
          </h2>
          <p style="margin: 0; font-size: 10pt; color: #475569; font-weight: bold;">
            Arts. 24 e 25 da Lei nº 12.249/2010 c/c IN RFB nº 1.154/2011 e Lei nº 12.973/2014
          </p>
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px; background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 4px; margin-bottom: 15px; font-size: 9pt;">
          <div>
            <p style="margin: 2px 0;"><strong>Empresa Contribuinte:</strong> ${empresaAtiva.razaoSocial}</p>
            <p style="margin: 2px 0;"><strong>CNPJ:</strong> ${empresaAtiva.cnpj} &nbsp;|&nbsp; <strong>Ano-Calendário:</strong> ${anoFiltro}</p>
            <p style="margin: 2px 0;"><strong>Patrimônio Líquido de Referência:</strong> R$ ${(resumo.totalPatrimonioLiquidoEmpresa || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p style="margin: 2px 0;"><strong>Data da Apuração:</strong> ${dataHoje}</p>
            <p style="margin: 2px 0;"><strong>Regime de Apuração:</strong> Lucro Real Trimestral / Anual</p>
            <p style="margin: 2px 0;"><strong>Status Geral:</strong> <span style="font-weight: bold; color: ${resumo.conformidadeGeral ? '#16a34a' : '#dc2626'};">${resumo.conformidadeGeral ? 'EM CONFORMIDADE LEGAL' : 'AJUSTES / ADIÇÕES PARTE A EXIGIDAS'}</span></p>
          </div>
        </div>

        <div style="margin-bottom: 15px;">
          <h4 style="margin: 0 0 6px 0; color: #1e3a8a; font-size: 10.5pt; text-transform: uppercase;">1. Resumo Consolidado de Endividamento com Exterior e Juros</h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 9pt;">
            <thead>
              <tr style="background-color: #f1f5f9; border-top: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1;">
                <th style="padding: 6px; text-align: left;">Indicador Contábil/Fiscal</th>
                <th style="padding: 6px; text-align: right;">Base de Cálculo (R$)</th>
                <th style="padding: 6px; text-align: right;">Reflexo e-LALUR / e-LACS</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 6px;">Saldo Médio de Endividamento Exterior</td>
                <td style="padding: 6px; text-align: right; font-family: monospace;">R$ ${resumo.totalEndividamentoExteriorBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="padding: 6px; text-align: right; color: #64748b;">Passivo Oneroso Não Circulante</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 6px;">Despesa Financeira Total com Juros no Exterior</td>
                <td style="padding: 6px; text-align: right; font-family: monospace;">R$ ${resumo.totalDespesasJurosExteriorBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="padding: 6px; text-align: right; color: #64748b;">DRE - Despesas Financeiras</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0; background-color: #f0fdf4;">
                <td style="padding: 6px; font-weight: bold; color: #166534;">Juros Dedutíveis para Fins de IRPJ e CSLL</td>
                <td style="padding: 6px; text-align: right; font-family: monospace; font-weight: bold; color: #166534;">R$ ${resumo.totalJurosDedutiveisBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="padding: 6px; text-align: right; color: #166534; font-weight: bold;">Dedutibilidade Mantida</td>
              </tr>
              <tr style="border-bottom: 2px solid #cbd5e1; background-color: #fef2f2;">
                <td style="padding: 6px; font-weight: bold; color: #991b1b;">Juros Indedutíveis (Thin Cap) - Adição Obrigatória Parte A</td>
                <td style="padding: 6px; text-align: right; font-family: monospace; font-weight: bold; color: #991b1b;">R$ ${resumo.totalJurosIndedutiveisLalurBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="padding: 6px; text-align: right; color: #991b1b; font-weight: bold;">Adição Conta M200/M210 (IRPJ/CSLL)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="margin-bottom: 15px;">
          <h4 style="margin: 0 0 6px 0; color: #1e3a8a; font-size: 10.5pt; text-transform: uppercase;">2. Demonstrativo Individualizado por Contrato e Credor</h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 8.5pt;">
            <thead>
              <tr style="background-color: #f1f5f9; border-top: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1;">
                <th style="padding: 5px; text-align: left;">Contrato / Credor Exterior</th>
                <th style="padding: 5px; text-align: left;">Jurisdição</th>
                <th style="padding: 5px; text-align: right;">Dívida Média (R$)</th>
                <th style="padding: 5px; text-align: right;">Limite Legal (R$)</th>
                <th style="padding: 5px; text-align: center;">Razão / Alavancagem</th>
                <th style="padding: 5px; text-align: right;">Juros Totais (R$)</th>
                <th style="padding: 5px; text-align: right;">Adição LALUR (R$)</th>
              </tr>
            </thead>
            <tbody>
              ${resumo.contratos.map(c => `
                <tr style="border-bottom: 1px solid #e2e8f0; background-color: ${c.ultrapassouLimiteLegal ? '#fff5f5' : '#ffffff'};">
                  <td style="padding: 5px;">
                    <strong>${c.numeroContratoDivida}</strong><br/>
                    <span style="color: #64748b; font-size: 7.5pt;">${c.entidadeCredoraExterior} (${c.paisJurisdicaoCredora})</span>
                  </td>
                  <td style="padding: 5px; font-size: 8pt;">
                    ${c.tipoJurisdicao === 'PARAISO_FISCAL_OU_REGIME_PRIVILEGIADO' ? '<span style="color: #c2410c; font-weight: bold;">Paraíso Fiscal (0,3:1)</span>' : 'Pessoa Vinculada (2:1)'}
                  </td>
                  <td style="padding: 5px; text-align: right; font-family: monospace;">R$ ${c.valorSaldoEndividamentoMedioBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td style="padding: 5px; text-align: right; font-family: monospace;">R$ ${c.limiteMaximoEndividamentoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td style="padding: 5px; text-align: center; font-weight: bold; color: ${c.ultrapassouLimiteLegal ? '#dc2626' : '#16a34a'};">
                    ${c.razaoEndividamentoApurada.toFixed(2)}x
                  </td>
                  <td style="padding: 5px; text-align: right; font-family: monospace;">R$ ${c.despesaTotalJurosPeriodoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td style="padding: 5px; text-align: right; font-family: monospace; font-weight: bold; color: ${c.jurosIndedutiveisAdicaoLalurBRL > 0 ? '#b91c1c' : '#15803d'};">
                    R$ ${c.jurosIndedutiveisAdicaoLalurBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 10px; margin-bottom: 25px; font-size: 8pt; color: #334155;">
          <strong>Fundamentação Técnico-Legal e Critérios de Cálculo:</strong>
          <br/>1. <em>Pessoa Vinculada no Exterior (Art. 24 da Lei 12.249/2010):</em> Limite de 2x o valor da participação da vinculada no Patrimônio Líquido da mutuária brasileira.
          <br/>2. <em>Jurisdição com Tributação Favorecida ou Regime Privilegiado (Art. 25):</em> Limite de 30% (0,3x) sobre o Patrimônio Líquido total da mutuária brasileira.
          <br/>3. <em>Proporcionalidade da Indedutibilidade:</em> Conforme o §2º do Art. 24, a indedutibilidade recai proporcionalmente sobre os juros incidentes sobre a parcela do endividamento que exceder o teto estabelecido, devendo ser adicionada na Parte A do e-LALUR/e-LACS sem reversão posterior na Parte B.
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
              Perito Contábil / Auditor Tributário Independente<br/>
              <span style="font-size: 8pt; font-weight: normal; color: #475569;">CRC/SP nº 1SP999999/O-0 &nbsp;|&nbsp; CNAI nº 4589</span>
            </div>
          </div>
        </div>
      </div>
    `;

    if (onOpenReportPreview) {
      onOpenReportPreview({
        titulo: 'Demonstrativo de Subcapitalização (Thin Capitalization)',
        subtitulo: `Apuração de Limites de Alavancagem e Juros Indedutíveis - ${anoFiltro}`,
        conteudoHtml: htmlContent
      });
    } else {
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(`<html><head><title>Laudo de Subcapitalização</title></head><body>${htmlContent}</body></html>`);
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
          <div className="p-2.5 rounded-lg bg-red-950/40 text-red-400 border border-red-800/50 shadow-inner">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">Subcapitalização & Regras de Thin Capitalization</h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-red-900/60 text-red-200 border border-red-700/60">
                Lei 12.249/10 Arts. 24 e 25
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Controle de endividamento com partes vinculadas no exterior (2:1) e paraísos fiscais (0,3:1) com adições e-LALUR/e-LACS
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
            <span>Laudo Oficial A4</span>
          </button>

          <button
            onClick={abrirModalNovo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-500 text-white text-xs font-medium shadow transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Contrato Exterior</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4">
        {/* Card 1: PL de Referência */}
        <div className="p-3.5 rounded-lg bg-neutral-900/90 border border-neutral-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Patrimônio Líquido (Base)</span>
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-mono font-bold text-white">
              R$ {(resumo?.totalPatrimonioLiquidoEmpresa || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            Balanço de Encerramento do Período
          </p>
        </div>

        {/* Card 2: Endividamento Exterior */}
        <div className="p-3.5 rounded-lg bg-neutral-900/90 border border-neutral-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Endividamento Exterior</span>
            <Globe2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-mono font-bold text-amber-300">
              R$ {(resumo?.totalEndividamentoExteriorBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            Saldo médio com partes vinculadas e paraísos
          </p>
        </div>

        {/* Card 3: Total Despesas Juros */}
        <div className="p-3.5 rounded-lg bg-neutral-900/90 border border-neutral-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Despesas com Juros Ext.</span>
            <DollarSign className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-mono font-bold text-indigo-300">
              R$ {(resumo?.totalDespesasJurosExteriorBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            Lançamento a débito no Resultado Financeiro
          </p>
        </div>

        {/* Card 4: Juros Indedutíveis (Adição LALUR) */}
        <div className="p-3.5 rounded-lg bg-red-950/30 border border-red-900/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-red-300 text-xs">
            <span>Juros Indedutíveis (Thin Cap)</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-mono font-bold text-red-400">
              R$ {(resumo?.totalJurosIndedutiveisLalurBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-red-300/70 mt-1 font-medium">
            Adição Parte A LALUR (IRPJ 25% + CSLL 9%)
          </p>
        </div>

        {/* Card 5: Conformidade Geral */}
        <div className="p-3.5 rounded-lg bg-neutral-900/90 border border-neutral-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Conformidade Legal</span>
            {resumo?.conformidadeGeral ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertOctagon className="w-4 h-4 text-red-400" />
            )}
          </div>
          <div className="mt-2">
            <span className={`text-sm font-bold flex items-center gap-1.5 ${resumo?.conformidadeGeral ? 'text-emerald-400' : 'text-red-400'}`}>
              {resumo?.conformidadeGeral ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Dentro dos Limites
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  Subcapitalizada
                </>
              )}
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            {resumo?.conformidadeGeral ? 'Sem adições tributárias obrigatórias' : 'Excesso de alavancagem detectado'}
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center border-b border-neutral-800 px-4 bg-[#171717]">
        <button
          onClick={() => setAbaAtiva('contratos')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            abaAtiva === 'contratos'
              ? 'border-red-500 text-red-400 bg-red-950/10'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Contratos de Dívida Exterior & Testes de Thin Cap ({resumo?.contratos.length || 0})</span>
        </button>

        <button
          onClick={() => setAbaAtiva('simulador')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            abaAtiva === 'simulador'
              ? 'border-red-500 text-red-400 bg-red-950/10'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Simulador de Alavancagem & Impacto Fiscal</span>
        </button>

        <button
          onClick={() => setAbaAtiva('legislacao')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            abaAtiva === 'legislacao'
              ? 'border-red-500 text-red-400 bg-red-950/10'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Fundamentação Legal & Cruzamento e-LALUR</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4">
        {abaAtiva === 'contratos' && (
          <div className="space-y-4">
            {/* Toolbar com Busca */}
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar por número do contrato, credor exterior ou país..."
                  className="w-full pl-9 pr-4 py-1.5 rounded-md bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span>Filtrando por {contratosFiltrados.length} contrato(s)</span>
              </div>
            </div>

            {/* Tabela de Contratos */}
            <div className="border border-neutral-800 rounded-lg overflow-hidden bg-neutral-900/60">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-800/80 text-neutral-400 border-b border-neutral-700/80">
                    <th className="p-3 font-semibold">Contrato / Credor</th>
                    <th className="p-3 font-semibold">Jurisdição / País</th>
                    <th className="p-3 font-semibold text-right">Part. PL (%)</th>
                    <th className="p-3 font-semibold text-right">Saldo Médio Dívida</th>
                    <th className="p-3 font-semibold text-right">Limite Máximo Legal</th>
                    <th className="p-3 font-semibold text-center">Razão Apurada</th>
                    <th className="p-3 font-semibold text-right">Juros Período</th>
                    <th className="p-3 font-semibold text-right">Juros Indedutíveis</th>
                    <th className="p-3 font-semibold text-center">Status</th>
                    <th className="p-3 font-semibold text-center">LALUR</th>
                    <th className="p-3 font-semibold text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {contratosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="p-8 text-center text-neutral-500">
                        Nenhum contrato de endividamento exterior encontrado para os critérios selecionados.
                      </td>
                    </tr>
                  ) : (
                    contratosFiltrados.map((item) => {
                      const limiteRatio = item.tipoJurisdicao === 'PARAISO_FISCAL_OU_REGIME_PRIVILEGIADO' ? 0.30 : 2.0;
                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-neutral-800/50 transition-colors ${
                            item.ultrapassouLimiteLegal ? 'bg-red-950/10' : ''
                          }`}
                        >
                          <td className="p-3">
                            <div className="font-semibold text-white flex items-center gap-1.5">
                              <span>{item.numeroContratoDivida}</span>
                            </div>
                            <div className="text-[11px] text-neutral-400">
                              {item.entidadeCredoraExterior}
                            </div>
                          </td>

                          <td className="p-3">
                            <div className="text-white font-medium">{item.paisJurisdicaoCredora}</div>
                            <div className="text-[10px] mt-0.5">
                              {item.tipoJurisdicao === 'PARAISO_FISCAL_OU_REGIME_PRIVILEGIADO' ? (
                                <span className="text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/50">
                                  Paraíso Fiscal (0,3:1)
                                </span>
                              ) : (
                                <span className="text-blue-300 bg-blue-950/40 px-1.5 py-0.5 rounded border border-blue-800/50">
                                  Pessoa Vinculada (2:1)
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="p-3 text-right font-mono text-neutral-300">
                            {item.percentualParticipacaoSocietariaPL.toFixed(1)}%
                          </td>

                          <td className="p-3 text-right font-mono font-medium text-white">
                            R$ {item.valorSaldoEndividamentoMedioBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>

                          <td className="p-3 text-right font-mono text-neutral-300">
                            R$ {item.limiteMaximoEndividamentoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>

                          <td className="p-3 text-center">
                            <span
                              className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                                item.ultrapassouLimiteLegal
                                  ? 'bg-red-950 text-red-400 border border-red-800'
                                  : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              }`}
                            >
                              {item.razaoEndividamentoApurada.toFixed(2)}x / {limiteRatio.toFixed(2)}x
                            </span>
                          </td>

                          <td className="p-3 text-right font-mono text-neutral-300">
                            R$ {item.despesaTotalJurosPeriodoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>

                          <td className="p-3 text-right font-mono font-bold text-red-400">
                            {item.jurosIndedutiveisAdicaoLalurBRL > 0 ? (
                              <span>R$ {item.jurosIndedutiveisAdicaoLalurBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            ) : (
                              <span className="text-neutral-500 font-normal">R$ 0,00</span>
                            )}
                          </td>

                          <td className="p-3 text-center">
                            {item.ultrapassouLimiteLegal ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-800">
                                <AlertTriangle className="w-3 h-3" />
                                Excessivo
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                                <CheckCircle className="w-3 h-3" />
                                Conforme
                              </span>
                            )}
                          </td>

                          <td className="p-3 text-center">
                            {item.jurosIndedutiveisAdicaoLalurBRL > 0 ? (
                              item.integradoContabil ? (
                                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40">
                                  <FileCheck2 className="w-3 h-3" />
                                  Integrado
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleIntegrarLalur(item.id)}
                                  className="inline-flex items-center gap-1 text-[10px] text-amber-300 hover:text-white bg-amber-950/60 hover:bg-amber-900/80 px-2 py-0.5 rounded border border-amber-800 transition-colors"
                                  title="Integrar Adição Parte A ao e-LALUR"
                                >
                                  <ArrowRightLeft className="w-3 h-3" />
                                  Integrar
                                </button>
                              )
                            ) : (
                              <span className="text-neutral-500 text-[10px]">—</span>
                            )}
                          </td>

                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => abrirModalEdicao(item)}
                                className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
                                title="Editar Contrato"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleExcluir(item.id)}
                                className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-red-400 transition-colors"
                                title="Excluir Contrato"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Banner Informativo */}
            <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-neutral-300">
                <HelpCircle className="w-4 h-4 text-blue-400" />
                <span>
                  O cálculo proporcional de indedutibilidade segue a fórmula: <code>Juros Indedutíveis = Juros Totais × (Endividamento Médio - Limite Legal) / Endividamento Médio</code>
                </span>
              </div>
              <span className="text-neutral-400 text-[11px]">e-LALUR M200/M210 (Código R-0043)</span>
            </div>
          </div>
        )}

        {abaAtiva === 'simulador' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Painel de Parâmetros */}
            <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 space-y-4">
              <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
                <Calculator className="w-5 h-5 text-red-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                  Parâmetros de Simulação de Endividamento
                </h3>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                  Tipo de Jurisdição do Credor
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSimTipoJurisdicao('PESSOA_VINCULADA_REGIME_COMUM')}
                    className={`p-2.5 rounded text-xs font-medium border text-left transition-colors ${
                      simTipoJurisdicao === 'PESSOA_VINCULADA_REGIME_COMUM'
                        ? 'bg-blue-950/60 border-blue-500 text-blue-200'
                        : 'bg-neutral-800/40 border-neutral-700 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <div className="font-bold">Pessoa Vinculada (2:1)</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">Teto: 2x o PL proporcional</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSimTipoJurisdicao('PARAISO_FISCAL_OU_REGIME_PRIVILEGIADO')}
                    className={`p-2.5 rounded text-xs font-medium border text-left transition-colors ${
                      simTipoJurisdicao === 'PARAISO_FISCAL_OU_REGIME_PRIVILEGIADO'
                        ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                        : 'bg-neutral-800/40 border-neutral-700 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <div className="font-bold">Paraíso Fiscal (0,3:1)</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">Teto: 30% do PL total</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">
                  Patrimônio Líquido Total da Entidade Brasileira (R$)
                </label>
                <input
                  type="number"
                  value={simPL}
                  onChange={(e) => setSimPL(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded bg-neutral-950 border border-neutral-800 text-white font-mono text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              {simTipoJurisdicao === 'PESSOA_VINCULADA_REGIME_COMUM' && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-neutral-400">
                      Participação Societária da Vinculada no Capital/PL (%)
                    </label>
                    <span className="text-xs font-mono font-bold text-blue-400">{simParticipacao}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    step="1"
                    value={simParticipacao}
                    onChange={(e) => setSimParticipacao(Number(e.target.value))}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
                    <span>1%</span>
                    <span>PL Atribuível: R$ {(simPL * (simParticipacao / 100)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    <span>100%</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">
                  Saldo Médio de Endividamento Pretendido (R$)
                </label>
                <input
                  type="number"
                  value={simDivida}
                  onChange={(e) => setSimDivida(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded bg-neutral-950 border border-neutral-800 text-white font-mono text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">
                  Taxa Média Efetiva de Juros Anual do Contrato (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={simTaxaJurosAnual}
                  onChange={(e) => setSimTaxaJurosAnual(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded bg-neutral-950 border border-neutral-800 text-white font-mono text-sm focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Painel de Resultados */}
            <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
                  <TrendingDown className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                    Diagnóstico de Alavancagem e Impacto no Lucro Real
                  </h3>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="p-3 rounded bg-neutral-950 border border-neutral-800 flex justify-between items-center">
                    <div>
                      <span className="text-xs text-neutral-400">Limite Máximo de Endividamento Legal:</span>
                      <p className="text-[11px] text-neutral-500">
                        {simTipoJurisdicao === 'PESSOA_VINCULADA_REGIME_COMUM' ? '2.0x sobre a parcela do PL' : '0.30x sobre o PL Total'}
                      </p>
                    </div>
                    <span className="text-base font-mono font-bold text-white">
                      R$ {simResult.limite.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="p-3 rounded bg-neutral-950 border border-neutral-800 flex justify-between items-center">
                    <div>
                      <span className="text-xs text-neutral-400">Razão de Alavancagem Simulada:</span>
                      <p className="text-[11px] text-neutral-500">
                        {simResult.ultrapassou ? 'Alavancagem acima do teto estipulado pela Lei 12.249/10' : 'Alavancagem em conformidade com as regras de Thin Cap'}
                      </p>
                    </div>
                    <span className={`text-base font-mono font-bold ${simResult.ultrapassou ? 'text-red-400' : 'text-emerald-400'}`}>
                      {simResult.razao.toFixed(2)}x
                    </span>
                  </div>

                  <div className="p-3 rounded bg-neutral-950 border border-neutral-800 flex justify-between items-center">
                    <span className="text-xs text-neutral-400">Despesa Anual de Juros:</span>
                    <span className="text-base font-mono font-bold text-indigo-300">
                      R$ {simResult.jurosAnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="p-3 rounded bg-neutral-950 border border-emerald-900/40 flex justify-between items-center">
                    <span className="text-xs text-emerald-300">Juros Dedutíveis (Sem Ajuste):</span>
                    <span className="text-base font-mono font-bold text-emerald-400">
                      R$ {simResult.jurosDedutiveis.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="p-3 rounded bg-red-950/30 border border-red-900/60 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-red-300">Juros Indedutíveis (Adição LALUR):</span>
                      <p className="text-[10px] text-red-400/80">Adição obrigatória na apuração do Lucro Real e CSLL</p>
                    </div>
                    <span className="text-lg font-mono font-bold text-red-400">
                      R$ {simResult.jurosIndedutiveis.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="p-3 rounded bg-neutral-950 border border-neutral-800 flex justify-between items-center">
                    <div>
                      <span className="text-xs text-neutral-400">Custo Fiscal Adicional Estimado (IRPJ 25% + CSLL 9%):</span>
                      <p className="text-[10px] text-neutral-500">Impacto no recolhimento dos tributos sobre o lucro</p>
                    </div>
                    <span className="text-base font-mono font-bold text-amber-400">
                      R$ {simResult.irpjCsllEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-neutral-400 p-2.5 rounded bg-neutral-800/40 border border-neutral-700/60 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>
                  <strong>Dica de Planejamento Tributário:</strong> Aumentar o capital social ou converter parte do mútuo em AFAC (Adiantamento para Futuro Aumento de Capital) eleva o PL de referência, restabelecendo a dedutibilidade integral dos juros.
                </span>
              </div>
            </div>
          </div>
        )}

        {abaAtiva === 'legislacao' && (
          <div className="max-w-4xl space-y-4">
            <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                <Scale className="w-4 h-4 text-red-400" />
                Marco Regulatório das Regras de Subcapitalização no Brasil
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed mb-3">
                As regras brasileiras de subcapitalização (<em>Thin Capitalization Rules</em>) foram instituídas pelos Arts. 24 e 25 da <strong>Lei nº 12.249/2010</strong> e regulamentadas pela <strong>Instrução Normativa RFB nº 1.154/2011</strong>, sendo recepcionadas no Regulamento do Imposto de Renda (RIR/2018, Arts. 343 a 346).
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-3.5 rounded bg-neutral-950 border border-neutral-800">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase mb-1">
                    <Globe2 className="w-4 h-4" />
                    Pessoas Vinculadas no Exterior (Art. 24)
                  </div>
                  <ul className="text-xs text-neutral-400 space-y-1.5 list-disc list-inside mt-2">
                    <li>Aplicável a dívidas contratadas com pessoa física ou jurídica vinculada no exterior.</li>
                    <li><strong>Limite de Alavancagem:</strong> O endividamento não pode ultrapassar <strong>2 (duas) vezes</strong> o valor da participação da vinculada no Patrimônio Líquido da empresa brasileira.</li>
                    <li><strong>Limite Global de Vinculadas:</strong> O endividamento com todas as vinculadas reunidas não pode ultrapassar 2 vezes o valor do PL total da empresa.</li>
                    <li>Juros sobre o excesso são indedutíveis na apuração do Lucro Real e da base de cálculo da CSLL.</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded bg-neutral-950 border border-neutral-800">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    Paraísos Fiscais & Regimes Privilegiados (Art. 25)
                  </div>
                  <ul className="text-xs text-neutral-400 space-y-1.5 list-disc list-inside mt-2">
                    <li>Aplicável a credores domiciliados em país com tributação favorecida ou regime fiscal privilegiado (IN RFB 1.037/2010).</li>
                    <li><strong>Critério Rígido:</strong> Incide independentemente de haver ou não vínculo societário entre as partes.</li>
                    <li><strong>Limite de Alavancagem:</strong> O endividamento total não pode exceder <strong>30% (0,3 vezes)</strong> do valor do Patrimônio Líquido da entidade brasileira.</li>
                    <li>Juros proporcionais ao excedente são compulsoriamente adicionados na Parte A do e-LALUR/e-LACS.</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 p-3.5 rounded bg-neutral-950 border border-neutral-800">
                <h4 className="text-xs font-bold text-white uppercase mb-2 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-400" />
                  Mapeamento nos Registros e Contas do Sped ECF (e-LALUR / e-LACS)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 rounded bg-neutral-900 border border-neutral-800">
                    <span className="font-semibold text-neutral-300">Bloco M - Tabela Padrão:</span>
                    <p className="text-[11px] text-neutral-400 mt-1">
                      Registro <strong>M200 / M210</strong> (Lucro Real) e <strong>M600 / M610</strong> (CSLL).
                    </p>
                  </div>
                  <div className="p-2.5 rounded bg-neutral-900 border border-neutral-800">
                    <span className="font-semibold text-neutral-300">Natureza da Adição:</span>
                    <p className="text-[11px] text-neutral-400 mt-1">
                      Adição <strong>Definitiva</strong> na Parte A (sem registro na Parte B, pois os juros indedutíveis não são compensáveis em exercícios futuros).
                    </p>
                  </div>
                  <div className="p-2.5 rounded bg-neutral-900 border border-neutral-800">
                    <span className="font-semibold text-neutral-300">Cruzamento com TP:</span>
                    <p className="text-[11px] text-neutral-400 mt-1">
                      Conforme a IN RFB 2.161/23, aplica-se primeiro o teste de Preços de Transferência de taxa de juros e, subsequentemente, o teste de Thin Cap sobre o saldo de dívida.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Formulário Inserir / Editar Contrato */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#1c1c1c] border border-neutral-700 rounded-lg shadow-2xl max-w-2xl w-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-[#222222]">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-red-400" />
                <h3 className="text-sm font-bold text-white">
                  {itemEdicao ? 'Editar Contrato de Endividamento Exterior' : 'Novo Contrato de Dívida Exterior (Thin Cap)'}
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
                    Número do Contrato / Registro BACEN
                  </label>
                  <input
                    type="text"
                    required
                    value={formNumContrato}
                    onChange={(e) => setFormNumContrato(e.target.value)}
                    className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-xs text-white focus:outline-none focus:border-red-500"
                    placeholder="Ex: LOAN-EXT-2026-001"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Credor no Exterior
                  </label>
                  <input
                    type="text"
                    required
                    value={formCredor}
                    onChange={(e) => setFormCredor(e.target.value)}
                    className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-xs text-white focus:outline-none focus:border-red-500"
                    placeholder="Ex: Atlas Global Holdings LLC"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    País de Domicílio do Credor
                  </label>
                  <input
                    type="text"
                    required
                    value={formPais}
                    onChange={(e) => setFormPais(e.target.value)}
                    className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-xs text-white focus:outline-none focus:border-red-500"
                    placeholder="Ex: Luxemburgo, EUA, etc."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Tipo de Jurisdição do Credor
                  </label>
                  <select
                    value={formTipoJurisdicao}
                    onChange={(e) => setFormTipoJurisdicao(e.target.value as TipoJurisdicaoCredora)}
                    className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-xs text-white focus:outline-none focus:border-red-500 cursor-pointer"
                  >
                    <option value="PESSOA_VINCULADA_REGIME_COMUM">Pessoa Vinculada no Exterior (Limite 2:1)</option>
                    <option value="PARAISO_FISCAL_OU_REGIME_PRIVILEGIADO">Paraíso Fiscal / Regime Favorecido (Limite 0,3:1)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Patrimônio Líquido de Referência (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formPatrimonioLiquido}
                    onChange={(e) => setFormPatrimonioLiquido(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Participação Societária no PL (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    required
                    value={formParticipacaoPL}
                    onChange={(e) => setFormParticipacaoPL(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                    disabled={formTipoJurisdicao === 'PARAISO_FISCAL_OU_REGIME_PRIVILEGIADO'}
                  />
                  {formTipoJurisdicao === 'PARAISO_FISCAL_OU_REGIME_PRIVILEGIADO' && (
                    <span className="text-[10px] text-amber-400">Paraíso fiscal aplica 30% sobre o PL total diretamente.</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Saldo Médio de Endividamento no Período (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formSaldoEndividamento}
                    onChange={(e) => setFormSaldoEndividamento(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Despesa Total de Juros no Período (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formDespesaJuros}
                    onChange={(e) => setFormDespesaJuros(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">
                  Observações e Cláusulas Relevantes
                </label>
                <textarea
                  rows={2}
                  value={formObservacoes}
                  onChange={(e) => setFormObservacoes(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-xs text-white focus:outline-none focus:border-red-500"
                  placeholder="Informações adicionais sobre vencimento, moeda de origem, etc."
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
                  className="px-4 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-medium shadow transition-colors"
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
export default SubcapitalizacaoThinCapModule;
