import React, { useState, useEffect } from 'react';
import {
  Car,
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
  Zap,
  Leaf,
  Layers,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  Empresa,
  ProjetoHabilitadoMover,
  ResumoProgramaMover,
  TipoDispendioMover,
  StatusHabilitacaoMover
} from '../../types/contabil';

interface ProgramaMoverModuleProps {
  empresaAtiva: Empresa | null;
  onOpenReportPreview?: (config: {
    titulo: string;
    subtitulo: string;
    conteudoHtml: string;
    imprimirDireto?: boolean;
  }) => void;
}

export const ProgramaMoverModule: React.FC<ProgramaMoverModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [resumo, setResumo] = useState<ResumoProgramaMover | null>(null);
  const [anoFiltro, setAnoFiltro] = useState<number>(2026);
  const [abaAtiva, setAbaAtiva] = useState<'projetos' | 'simulador' | 'legislacao'>('projetos');
  const [busca, setBusca] = useState('');

  // Modal formulário
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemEdicao, setItemEdicao] = useState<ProjetoHabilitadoMover | null>(null);

  // Campos do formulário
  const [formPortaria, setFormPortaria] = useState('Portaria Conjunta MDIC/MCTI nº 250/2026');
  const [formNomeProjeto, setFormNomeProjeto] = useState('Sistema Avançado de Propulsão Elétrica para Veículos Comerciais');
  const [formTipoDispendio, setFormTipoDispendio] = useState<TipoDispendioMover>('PESQUISA_DESENVOLVIMENTO');
  const [formStatus, setFormStatus] = useState<StatusHabilitacaoMover>('HABILITADO_PORTARIA');
  const [formDispendioPrevisto, setFormDispendioPrevisto] = useState<number>(5000000);
  const [formPercentualCredito, setFormPercentualCredito] = useState<number>(80.0);
  const [formCompensado, setFormCompensado] = useState<number>(2500000);
  const [formDataHabilitacao, setFormDataHabilitacao] = useState('2026-02-15');
  const [formObservacoes, setFormObservacoes] = useState('');

  // Simulador rápido
  const [simDispendio, setSimDispendio] = useState<number>(10000000);
  const [simTipo, setSimTipo] = useState<TipoDispendioMover>('PESQUISA_DESENVOLVIMENTO');
  const [simNivelNacionalizacao, setSimNivelNacionalizacao] = useState<number>(75);

  const carregarDados = () => {
    if (!empresaAtiva) return;
    const res = dbService.getProgramaMover(empresaAtiva.id, anoFiltro);
    setResumo(res);
  };

  useEffect(() => {
    carregarDados();
  }, [empresaAtiva, anoFiltro]);

  const abrirModalNovo = () => {
    setItemEdicao(null);
    setFormPortaria(`Portaria MDIC nº ${Math.floor(100 + Math.random() * 900)}/2026`);
    setFormNomeProjeto('Desenvolvimento de Módulos Eletrônicos de Gestão de Carga Rápida');
    setFormTipoDispendio('PESQUISA_DESENVOLVIMENTO');
    setFormStatus('HABILITADO_PORTARIA');
    setFormDispendioPrevisto(4500000);
    setFormPercentualCredito(80.0);
    setFormCompensado(0);
    setFormDataHabilitacao(new Date().toISOString().split('T')[0]);
    setFormObservacoes('Projeto enquadrado na linha de Inovação e Descarbonização da cadeia de fornecedores automotivos');
    setIsModalOpen(true);
  };

  const abrirModalEdicao = (proj: ProjetoHabilitadoMover) => {
    setItemEdicao(proj);
    setFormPortaria(proj.numeroPortariaMdic);
    setFormNomeProjeto(proj.nomeProjeto);
    setFormTipoDispendio(proj.tipoDispendio);
    setFormStatus(proj.status);
    setFormDispendioPrevisto(proj.valorDispendioPrevistoBRL);
    setFormPercentualCredito(proj.percentualCreditoFinanceiro);
    setFormCompensado(proj.valorCompensadoIrpjCsllBRL);
    setFormDataHabilitacao(proj.dataHabilitacao);
    setFormObservacoes(proj.observacoes || '');
    setIsModalOpen(true);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaAtiva) return;

    const creditoApurado = Math.round(formDispendioPrevisto * (formPercentualCredito / 100) * 100) / 100;
    const saldoRessarcivel = Math.max(0, Math.round((creditoApurado - formCompensado) * 100) / 100);

    const item: ProjetoHabilitadoMover = {
      id: itemEdicao ? itemEdicao.id : `mover-${Date.now()}`,
      empresaId: empresaAtiva.id,
      numeroPortariaMdic: formPortaria,
      nomeProjeto: formNomeProjeto,
      tipoDispendio: formTipoDispendio,
      status: formStatus,
      valorDispendioPrevistoBRL: formDispendioPrevisto,
      percentualCreditoFinanceiro: formPercentualCredito,
      valorCreditoApuradoBRL: creditoApurado,
      valorCompensadoIrpjCsllBRL: formCompensado,
      valorSaldoRessarcivelBRL: saldoRessarcivel,
      dataHabilitacao: formDataHabilitacao,
      integradoContabil: itemEdicao ? itemEdicao.integradoContabil : false,
      observacoes: formObservacoes
    };

    dbService.salvarProjetoMover(item);
    setIsModalOpen(false);
    carregarDados();
  };

  const handleExcluir = (id: string) => {
    if (window.confirm('Confirma a exclusão deste projeto do Programa Mover?')) {
      dbService.excluirProjetoMover(id);
      carregarDados();
    }
  };

  const handleIntegrarContabil = (id: string) => {
    const res = dbService.integrarCreditoMoverContabil(id);
    if (res.sucesso) {
      alert(`Integração realizada com sucesso!\nLançamento nº: ${res.lancamentoId}\n${res.mensagem}`);
      carregarDados();
    } else {
      alert(`Erro na integração: ${res.mensagem}`);
    }
  };

  // Filtragem
  const projetosFiltrados = (resumo?.projetos || []).filter(p => {
    const texto = busca.toLowerCase();
    return (
      p.numeroPortariaMdic.toLowerCase().includes(texto) ||
      p.nomeProjeto.toLowerCase().includes(texto) ||
      p.tipoDispendio.toLowerCase().includes(texto)
    );
  });

  // Cálculo do simulador
  const calcularSimulador = () => {
    let percBase = 50;
    if (simTipo === 'PESQUISA_DESENVOLVIMENTO') percBase = 80;
    else if (simTipo === 'ENGENHARIA_AUTOMOTIVA') percBase = 70;
    else if (simTipo === 'DESCARBONIZACAO_FABRIL') percBase = 60;
    else if (simTipo === 'INVESTIMENTO_CAPITAL_PRODUCAO') percBase = 50;

    // Bônus por taxa de nacionalização
    let bonusNacionalizacao = 0;
    if (simNivelNacionalizacao >= 80) bonusNacionalizacao = 20;
    else if (simNivelNacionalizacao >= 60) bonusNacionalizacao = 10;

    const percEfetivo = Math.min(320, percBase + bonusNacionalizacao);
    const creditoEstimado = simDispendio * (percEfetivo / 100);
    const economiaIrpjCsll34 = creditoEstimado;

    return {
      percEfetivo,
      creditoEstimado,
      economiaIrpjCsll34
    };
  };

  const simResult = calcularSimulador();

  // Emissão de Laudo A4
  const emitirLaudoA4 = () => {
    if (!empresaAtiva || !resumo) return;

    const dataHoje = new Date().toLocaleDateString('pt-BR');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.45; padding: 15px;">
        <div style="text-align: center; border-bottom: 2px solid #16a34a; padding-bottom: 12px; margin-bottom: 15px;">
          <h2 style="margin: 0 0 4px 0; color: #15803d; text-transform: uppercase; font-size: 16pt;">
            DEMONSTRATIVO DE CRÉDITOS FINANCEIROS DO PROGRAMA MOVER
          </h2>
          <p style="margin: 0; font-size: 10pt; color: #475569; font-weight: bold;">
            Mobilidade Verde e Inovação - Lei nº 14.902/2024 c/c Decreto nº 12.053/2024
          </p>
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px; background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 4px; margin-bottom: 15px; font-size: 9pt;">
          <div>
            <p style="margin: 2px 0;"><strong>Entidade Beneficiária:</strong> ${empresaAtiva.razaoSocial}</p>
            <p style="margin: 2px 0;"><strong>CNPJ Matriz:</strong> ${empresaAtiva.cnpj} &nbsp;|&nbsp; <strong>Ano-Base:</strong> ${anoFiltro}</p>
            <p style="margin: 2px 0;"><strong>Regime Tributário:</strong> Lucro Real (Indústria Automotiva e Sistemistas)</p>
          </div>
          <div>
            <p style="margin: 2px 0;"><strong>Data de Emissão:</strong> ${dataHoje}</p>
            <p style="margin: 2px 0;"><strong>Ambiente Homologado:</strong> MDIC / MCTI / RFB</p>
            <p style="margin: 2px 0;"><strong>Status da Habilitação:</strong> <span style="font-weight: bold; color: #16a34a;">VIGENTE & HOMOLOGADA</span></p>
          </div>
        </div>

        <div style="margin-bottom: 15px;">
          <h4 style="margin: 0 0 6px 0; color: #15803d; font-size: 10.5pt; text-transform: uppercase;">1. Resumo Consolidado de Créditos Financeiros Mover</h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 9pt;">
            <thead>
              <tr style="background-color: #f1f5f9; border-top: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1;">
                <th style="padding: 6px; text-align: left;">Indicador Financeiro / Tributário</th>
                <th style="padding: 6px; text-align: right;">Total Apurado (R$)</th>
                <th style="padding: 6px; text-align: right;">Destinação Legal</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 6px;">Total de Dispêndios Qualificados em P&D e Descarbonização</td>
                <td style="padding: 6px; text-align: right; font-family: monospace;">R$ ${resumo.totalDispendiosQualificadosBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="padding: 6px; text-align: right; color: #64748b;">Base de Dispêndios Habilitados</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0; background-color: #f0fdf4;">
                <td style="padding: 6px; font-weight: bold; color: #166534;">Créditos Financeiros Federais Gerados (Art. 5º da Lei 14.902/24)</td>
                <td style="padding: 6px; text-align: right; font-family: monospace; font-weight: bold; color: #166534;">R$ ${resumo.totalCreditosFinanceirosApuradosBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="padding: 6px; text-align: right; color: #166534; font-weight: bold;">Direito Creditório Homologado</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 6px;">Créditos Compensados com IRPJ / CSLL / Outros Tributos Federais</td>
                <td style="padding: 6px; text-align: right; font-family: monospace;">R$ ${resumo.totalCompensadoTributosFederaisBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="padding: 6px; text-align: right; color: #2563eb;">DCOMP Web (Compensação)</td>
              </tr>
              <tr style="border-bottom: 2px solid #cbd5e1; background-color: #fefce8;">
                <td style="padding: 6px; font-weight: bold; color: #854d0e;">Saldo Remanescente para Ressarcimento em Espécie / Futuras DCOMPs</td>
                <td style="padding: 6px; text-align: right; font-family: monospace; font-weight: bold; color: #854d0e;">R$ ${resumo.saldoDisponivelRessarcimentoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="padding: 6px; text-align: right; color: #854d0e; font-weight: bold;">Ativo Circulante Realizável</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="margin-bottom: 15px;">
          <h4 style="margin: 0 0 6px 0; color: #15803d; font-size: 10.5pt; text-transform: uppercase;">2. Relação Analítica de Projetos e Portarias Aprovadas</h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 8.5pt;">
            <thead>
              <tr style="background-color: #f1f5f9; border-top: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1;">
                <th style="padding: 5px; text-align: left;">Portaria / Processo MDIC</th>
                <th style="padding: 5px; text-align: left;">Descrição do Projeto Tecnológico</th>
                <th style="padding: 5px; text-align: center;">Linha de Dispêndio</th>
                <th style="padding: 5px; text-align: right;">Dispêndio (R$)</th>
                <th style="padding: 5px; text-align: center;">% Crédito</th>
                <th style="padding: 5px; text-align: right;">Crédito Gerado (R$)</th>
                <th style="padding: 5px; text-align: right;">Saldo Disponível (R$)</th>
              </tr>
            </thead>
            <tbody>
              ${resumo.projetos.map(p => `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 5px;">
                    <strong>${p.numeroPortariaMdic}</strong><br/>
                    <span style="color: #64748b; font-size: 7.5pt;">Habilitação: ${p.dataHabilitacao}</span>
                  </td>
                  <td style="padding: 5px;">${p.nomeProjeto}</td>
                  <td style="padding: 5px; text-align: center; font-size: 7.5pt;">${p.tipoDispendio.replace('_', ' ')}</td>
                  <td style="padding: 5px; text-align: right; font-family: monospace;">R$ ${p.valorDispendioPrevistoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td style="padding: 5px; text-align: center; font-weight: bold; color: #15803d;">${p.percentualCreditoFinanceiro.toFixed(0)}%</td>
                  <td style="padding: 5px; text-align: right; font-family: monospace; font-weight: bold; color: #166534;">R$ ${p.valorCreditoApuradoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td style="padding: 5px; text-align: right; font-family: monospace;">R$ ${p.valorSaldoRessarcivelBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div style="background-color: #f8fafc; border-left: 4px solid #16a34a; padding: 10px; margin-bottom: 25px; font-size: 8pt; color: #334155;">
          <strong>Tratamento Contábil e Fiscal do Crédito Mover (Art. 6º da Lei 14.902/2024 c/c CPC 07):</strong>
          <br/>1. <em>Reconhecimento Contábil:</em> Os créditos financeiros gerados pelo Programa Mover são reconhecidos no Ativo Circulante (Créditos Fiscais a Compensar) contra Receita de Subvenção Governamental para Investimento no Resultado do Exercício.
          <br/>2. <em>Imunidade Tributária de PIS/COFINS e IRPJ/CSLL:</em> O Art. 6º da Lei nº 14.902/2024 determina que o crédito financeiro Mover não será computado na base de cálculo do PIS/PASEP e da COFINS, e será excluído do Lucro Real e do Resultado Ajustado da CSLL na Parte A do e-LALUR/e-LACS.
          <br/>3. <em>Reserva de Incentivos Fiscais:</em> A parcela equivalente do lucro líquido deve ser destinada à Reserva de Incentivos Fiscais no Patrimônio Líquido (Art. 195-A da Lei nº 6.404/76).
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; text-align: center; font-size: 9pt;">
          <div>
            <div style="border-top: 1px solid #111; padding-top: 5px; font-weight: bold;">
              ${empresaAtiva.razaoSocial}<br/>
              <span style="font-size: 8pt; font-weight: normal; color: #475569;">Diretoria de Engenharia & Relações Governamentais</span>
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
        titulo: 'Demonstrativo do Programa Mover - Mobilidade Verde',
        subtitulo: `Apuração de Créditos Financeiros de Inovação & Descarbonização - ${anoFiltro}`,
        conteudoHtml: htmlContent
      });
    } else {
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(`<html><head><title>Laudo Programa Mover</title></head><body>${htmlContent}</body></html>`);
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
          <div className="p-2.5 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-800/50 shadow-inner">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">Programa Mover - Mobilidade Verde & Inovação</h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-900/60 text-emerald-200 border border-emerald-700/60">
                Lei nº 14.902/2024 / Dec. nº 12.053/2024
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Créditos financeiros de 50% a 320% para dispêndios em P&D, descarbonização e inovação automotiva com compensação IRPJ/CSLL
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
            <span>Dossiê Oficial A4</span>
          </button>

          <button
            onClick={abrirModalNovo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium shadow transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Habilitar Novo Projeto</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4">
        {/* Card 1: Projetos Habilitados */}
        <div className="p-3.5 rounded-lg bg-neutral-900/90 border border-neutral-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Projetos Habilitados</span>
            <Leaf className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-mono font-bold text-white">
              {resumo?.totalProjetosHabilitados || 0}
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            Portarias MDIC/MCTI em vigor
          </p>
        </div>

        {/* Card 2: Dispêndios Qualificados */}
        <div className="p-3.5 rounded-lg bg-neutral-900/90 border border-neutral-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Dispêndios P&D e Verde</span>
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-mono font-bold text-blue-300">
              R$ {(resumo?.totalDispendiosQualificadosBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            Investimentos elegíveis apurados
          </p>
        </div>

        {/* Card 3: Créditos Financeiros Mover */}
        <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-900/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-300 text-xs">
            <span>Créditos Mover Apurados</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-mono font-bold text-emerald-400">
              R$ {(resumo?.totalCreditosFinanceirosApuradosBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-emerald-300/70 mt-1 font-medium">
            Direito financeiro homologado
          </p>
        </div>

        {/* Card 4: Compensado em Tributos */}
        <div className="p-3.5 rounded-lg bg-neutral-900/90 border border-neutral-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Compensado (IRPJ/CSLL)</span>
            <ArrowRightLeft className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-mono font-bold text-indigo-300">
              R$ {(resumo?.totalCompensadoTributosFederaisBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            Abatimentos via PER/DCOMP
          </p>
        </div>

        {/* Card 5: Saldo Ressarcível */}
        <div className="p-3.5 rounded-lg bg-neutral-900/90 border border-neutral-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Saldo Realizável</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-mono font-bold text-amber-300">
              R$ {(resumo?.saldoDisponivelRessarcimentoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            Disponível para compensação/reembolso
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center border-b border-neutral-800 px-4 bg-[#171717]">
        <button
          onClick={() => setAbaAtiva('projetos')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            abaAtiva === 'projetos'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-950/10'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>Projetos & Portarias MDIC ({resumo?.projetos.length || 0})</span>
        </button>

        <button
          onClick={() => setAbaAtiva('simulador')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            abaAtiva === 'simulador'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-950/10'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Simulador de Quotas de Crédito Financeiro (50% a 320%)</span>
        </button>

        <button
          onClick={() => setAbaAtiva('legislacao')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            abaAtiva === 'legislacao'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-950/10'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Diretrizes Legais & Não Incidência PIS/COFINS/IRPJ</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4">
        {abaAtiva === 'projetos' && (
          <div className="space-y-4">
            {/* Toolbar com Busca */}
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar por portaria MDIC, nome do projeto ou linha de dispêndio..."
                  className="w-full pl-9 pr-4 py-1.5 rounded-md bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span>{projetosFiltrados.length} projeto(s) listado(s)</span>
              </div>
            </div>

            {/* Tabela de Projetos */}
            <div className="border border-neutral-800 rounded-lg overflow-hidden bg-neutral-900/60">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-800/80 text-neutral-400 border-b border-neutral-700/80">
                    <th className="p-3 font-semibold">Portaria / Projeto</th>
                    <th className="p-3 font-semibold">Linha Tecnológica</th>
                    <th className="p-3 font-semibold text-center">Status</th>
                    <th className="p-3 font-semibold text-right">Dispêndio Qualificado</th>
                    <th className="p-3 font-semibold text-center">% Crédito</th>
                    <th className="p-3 font-semibold text-right">Crédito Gerado</th>
                    <th className="p-3 font-semibold text-right">Compensado</th>
                    <th className="p-3 font-semibold text-right">Saldo Ressarcível</th>
                    <th className="p-3 font-semibold text-center">Contábil</th>
                    <th className="p-3 font-semibold text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {projetosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-neutral-500">
                        Nenhum projeto do Programa Mover cadastrado para este exercício.
                      </td>
                    </tr>
                  ) : (
                    projetosFiltrados.map((item) => (
                      <tr key={item.id} className="hover:bg-neutral-800/50 transition-colors">
                        <td className="p-3">
                          <div className="font-semibold text-white">{item.numeroPortariaMdic}</div>
                          <div className="text-[11px] text-neutral-400 max-w-xs truncate" title={item.nomeProjeto}>
                            {item.nomeProjeto}
                          </div>
                        </td>

                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-800 text-neutral-300 border border-neutral-700">
                            {item.tipoDispendio.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="p-3 text-center">
                          {item.status === 'HABILITADO_PORTARIA' && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                              <CheckCircle className="w-3 h-3" />
                              Habilitado
                            </span>
                          )}
                          {item.status === 'EM_ANALISE_MDIC' && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                              <AlertTriangle className="w-3 h-3" />
                              Em Análise
                            </span>
                          )}
                          {item.status === 'HOMOLOGADO_RECEITA' && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800">
                              <ShieldCheck className="w-3 h-3" />
                              Homologado RFB
                            </span>
                          )}
                          {item.status === 'CANCELADO' && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-800">
                              Cancelado
                            </span>
                          )}
                        </td>

                        <td className="p-3 text-right font-mono text-neutral-200">
                          R$ {item.valorDispendioPrevistoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>

                        <td className="p-3 text-center font-mono font-bold text-emerald-400">
                          {item.percentualCreditoFinanceiro.toFixed(0)}%
                        </td>

                        <td className="p-3 text-right font-mono font-bold text-emerald-300">
                          R$ {item.valorCreditoApuradoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>

                        <td className="p-3 text-right font-mono text-neutral-400">
                          R$ {item.valorCompensadoIrpjCsllBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>

                        <td className="p-3 text-right font-mono font-bold text-amber-300">
                          R$ {item.valorSaldoRessarcivelBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                              className="inline-flex items-center gap-1 text-[10px] text-emerald-300 hover:text-white bg-emerald-950/60 hover:bg-emerald-900/80 px-2 py-0.5 rounded border border-emerald-800 transition-colors"
                              title="Reconhecer Crédito Financeiro no Ativo e DRE"
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
                              title="Editar Projeto"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleExcluir(item.id)}
                              className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-red-400 transition-colors"
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

            {/* Banner Informativo */}
            <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-neutral-300">
                <Leaf className="w-4 h-4 text-emerald-400" />
                <span>
                  O crédito financeiro do Programa Mover pode ser compensado contra qualquer tributo administrado pela RFB ou ressarcido em dinheiro (Art. 5º da Lei 14.902/24).
                </span>
              </div>
              <span className="text-neutral-400 text-[11px]">PER/DCOMP Web - Tipo Crédito Mover</span>
            </div>
          </div>
        )}

        {abaAtiva === 'simulador' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Painel Parâmetros */}
            <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 space-y-4">
              <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
                <Calculator className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                  Parâmetros de Investimento em Inovação & Descarbonização
                </h3>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                  Linha Tecnológica de Dispêndio Habilitada
                </label>
                <select
                  value={simTipo}
                  onChange={(e) => setSimTipo(e.target.value as TipoDispendioMover)}
                  className="w-full px-3 py-2 rounded bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="PESQUISA_DESENVOLVIMENTO">Pesquisa & Desenvolvimento Tecnológico (Quota Base: 80%)</option>
                  <option value="ENGENHARIA_AUTOMOTIVA">Engenharia Automotiva & Software Embarcado (Quota Base: 70%)</option>
                  <option value="DESCARBONIZACAO_FABRIL">Descarbonização & Eficiência Energética Industrial (Quota Base: 60%)</option>
                  <option value="INVESTIMENTO_CAPITAL_PRODUCAO">Expansão de Linha para Veículos Eletrificados (Quota Base: 50%)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">
                  Volume de Dispêndio Previsto no Projeto (R$)
                </label>
                <input
                  type="number"
                  value={simDispendio}
                  onChange={(e) => setSimDispendio(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded bg-neutral-950 border border-neutral-800 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-neutral-400">
                    Grau de Conteúdo Local / Nacionalização de Peças (%)
                  </label>
                  <span className="text-xs font-mono font-bold text-emerald-400">{simNivelNacionalizacao}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={simNivelNacionalizacao}
                  onChange={(e) => setSimNivelNacionalizacao(Number(e.target.value))}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
                  <span>30% (Sem Bônus)</span>
                  <span>60% (+10% Bônus)</span>
                  <span>80%+ (+20% Bônus)</span>
                </div>
              </div>
            </div>

            {/* Painel Resultados */}
            <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                    Retorno Financeiro e Benefício Fiscal Estimado
                  </h3>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="p-3 rounded bg-neutral-950 border border-neutral-800 flex justify-between items-center">
                    <div>
                      <span className="text-xs text-neutral-400">Alíquota Efetiva do Crédito Mover:</span>
                      <p className="text-[11px] text-neutral-500">Base legal Art. 5º da Lei 14.902/2024</p>
                    </div>
                    <span className="text-lg font-mono font-bold text-emerald-400">
                      {simResult.percEfetivo}%
                    </span>
                  </div>

                  <div className="p-3 rounded bg-emerald-950/30 border border-emerald-900/60 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-emerald-300">Crédito Financeiro Federal Gerado:</span>
                      <p className="text-[10px] text-emerald-400/80">Disponível em DCOMP ou reembolso em espécie</p>
                    </div>
                    <span className="text-xl font-mono font-bold text-emerald-400">
                      R$ {simResult.creditoEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="p-3 rounded bg-neutral-950 border border-neutral-800 flex justify-between items-center">
                    <div>
                      <span className="text-xs text-neutral-400">Impacto Direto no Fluxo de Caixa da Entidade:</span>
                      <p className="text-[10px] text-neutral-500">Redução de desembolso tributário ou aporte financeiro</p>
                    </div>
                    <span className="text-base font-mono font-bold text-white">
                      R$ {simResult.economiaIrpjCsll34.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-neutral-400 p-2.5 rounded bg-neutral-800/40 border border-neutral-700/60 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>
                  <strong>Vantagem Estratégica:</strong> O crédito financeiro do Mover não entra na base do PIS/COFINS e é excluído do Lucro Real/CSLL na Parte A do LALUR/LACS.
                </span>
              </div>
            </div>
          </div>
        )}

        {abaAtiva === 'legislacao' && (
          <div className="max-w-4xl space-y-4">
            <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                <Car className="w-4 h-4 text-emerald-400" />
                Marco Regulatório do Programa Mover no Brasil
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed mb-3">
                O <strong>Programa Mobilidade Verde e Inovação - Mover</strong> foi instituído pela <strong>Lei nº 14.902/2024</strong> e regulamentado pelo <strong>Decreto nº 12.053/2024</strong>, substituindo com amplo alcance o antigo Rota 2030, destinando R$ 19,3 bilhões em incentivos fiscais e créditos financeiros para a transição energética automotiva brasileira até 2028.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-3.5 rounded bg-neutral-950 border border-neutral-800">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase mb-1">
                    <Zap className="w-4 h-4" />
                    Crédito Financeiro Desvinculado
                  </div>
                  <ul className="text-xs text-neutral-400 space-y-1.5 list-disc list-inside mt-2">
                    <li>Diferente de simples dedução do IRPJ, gera um <strong>crédito financeiro autônomo</strong>.</li>
                    <li>Utilizável mediante <strong>compensação com qualquer tributo administrado pela RFB</strong> (DARF Previdenciário, IRPJ, CSLL, PIS/COFINS, etc.).</li>
                    <li>Possibilidade de <strong>ressarcimento em dinheiro (cash)</strong> perante o Tesouro Nacional caso não haja débitos tributários suficientes.</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded bg-neutral-950 border border-neutral-800">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase mb-1">
                    <ShieldCheck className="w-4 h-4" />
                    Regime de Não Incidência (Art. 6º)
                  </div>
                  <ul className="text-xs text-neutral-400 space-y-1.5 list-disc list-inside mt-2">
                    <li>O crédito financeiro <strong>não integra a base de cálculo</strong> de PIS e COFINS.</li>
                    <li><strong>Não computável</strong> na apuração do Lucro Real e da base de cálculo da CSLL (Exclusão no LALUR Parte A).</li>
                    <li>O montante deve ser vertido para <strong>Reserva de Incentivos Fiscais</strong> no Patrimônio Líquido (Lei 6.404/76, Art. 195-A).</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Formulário Projeto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#1c1c1c] border border-neutral-700 rounded-lg shadow-2xl max-w-2xl w-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-[#222222]">
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  {itemEdicao ? 'Editar Projeto do Programa Mover' : 'Habilitar Projeto no Programa Mover (Lei 14.902/2024)'}
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
                    Número da Portaria / Processo MDIC
                  </label>
                  <input
                    type="text"
                    required
                    value={formPortaria}
                    onChange={(e) => setFormPortaria(e.target.value)}
                    className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Ex: Portaria MDIC nº 124/2026"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Status da Habilitação
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as StatusHabilitacaoMover)}
                    className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="HABILITADO_PORTARIA">Habilitado por Portaria</option>
                    <option value="EM_ANALISE_MDIC">Em Análise no MDIC</option>
                    <option value="HOMOLOGADO_RECEITA">Homologado pela Receita Federal</option>
                    <option value="CANCELADO">Cancelado / Revogado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">
                  Nome do Projeto Tecnológico
                </label>
                <input
                  type="text"
                  required
                  value={formNomeProjeto}
                  onChange={(e) => setFormNomeProjeto(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Descrição do projeto de pesquisa, eletrificação ou manufatura"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Linha de Dispêndio Habilitada
                  </label>
                  <select
                    value={formTipoDispendio}
                    onChange={(e) => setFormTipoDispendio(e.target.value as TipoDispendioMover)}
                    className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="PESQUISA_DESENVOLVIMENTO">Pesquisa & Desenvolvimento</option>
                    <option value="ENGENHARIA_AUTOMOTIVA">Engenharia Automotiva & Software</option>
                    <option value="DESCARBONIZACAO_FABRIL">Descarbonização Fabril</option>
                    <option value="INVESTIMENTO_CAPITAL_PRODUCAO">Investimento em Linha Produtiva</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Data da Habilitação
                  </label>
                  <input
                    type="date"
                    required
                    value={formDataHabilitacao}
                    onChange={(e) => setFormDataHabilitacao(e.target.value)}
                    className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Dispêndio Qualificado (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formDispendioPrevisto}
                    onChange={(e) => setFormDispendioPrevisto(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    % Crédito Financeiro
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="50"
                    max="320"
                    required
                    value={formPercentualCredito}
                    onChange={(e) => setFormPercentualCredito(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Compensado (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formCompensado}
                    onChange={(e) => setFormCompensado(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">
                  Observações e Enquadramento Técnico
                </label>
                <textarea
                  rows={2}
                  value={formObservacoes}
                  onChange={(e) => setFormObservacoes(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Informações adicionais sobre o parecer técnico do MDIC"
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
                  className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium shadow transition-colors"
                >
                  Salvar Projeto Mover
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default ProgramaMoverModule;
