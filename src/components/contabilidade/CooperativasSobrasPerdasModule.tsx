import React, { useState, useEffect } from 'react';
import {
  Users,
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
  Layers,
  Edit,
  Trash2,
  ShieldCheck,
  Scale,
  DollarSign,
  HeartHandshake,
  Landmark,
  PieChart,
  UserCheck,
  HelpCircle,
  Clock,
  Sparkles,
  FileCheck2
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  ApuracaoSobrasCooperativa,
  CooperadoAssociado,
  Empresa,
  ResumoCooperativa
} from '../../types/contabil';

interface CooperativasSobrasPerdasModuleProps {
  empresaAtiva: Empresa | null;
  onOpenReportPreview?: (config: {
    titulo: string;
    subtitulo: string;
    conteudoHtml: string;
    imprimirDireto?: boolean;
  }) => void;
}

export const CooperativasSobrasPerdasModule: React.FC<CooperativasSobrasPerdasModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [resumo, setResumo] = useState<ResumoCooperativa | null>(null);
  const [exercicio, setExercicio] = useState<number>(2025);
  const [abaAtiva, setAbaAtiva] = useState<'apuracao' | 'cooperados' | 'fundos' | 'legislacao'>('apuracao');
  const [busca, setBusca] = useState('');

  // Modais
  const [isModalApuracaoOpen, setIsModalApuracaoOpen] = useState(false);
  const [itemEdicao, setItemEdicao] = useState<ApuracaoSobrasCooperativa | null>(null);

  // Form Apuração
  const [formExercicio, setFormExercicio] = useState<number>(2025);
  const [formDataApuracao, setFormDataApuracao] = useState('2026-03-15');
  const [formReceitaAtosCoop, setFormReceitaAtosCoop] = useState<number>(4850000);
  const [formDespesaAtosCoop, setFormDespesaAtosCoop] = useState<number>(3920000);
  const [formReceitaNaoCoop, setFormReceitaNaoCoop] = useState<number>(620000);
  const [formDespesaNaoCoop, setFormDespesaNaoCoop] = useState<number>(480000);
  const [formPercFundoReserva, setFormPercFundoReserva] = useState<number>(10.0);
  const [formPercFates, setFormPercFates] = useState<number>(5.0);
  const [formOutrasDestinacoes, setFormOutrasDestinacoes] = useState<number>(0);
  const [formStatus, setFormStatus] = useState<'EM_APURACAO' | 'APROVADO_AGO' | 'HOMOLOGADO_CONTABIL'>('APROVADO_AGO');
  const [formObs, setFormObs] = useState('');

  const carregarDados = () => {
    if (!empresaAtiva) return;
    const res = dbService.getApuracoesCooperativa(empresaAtiva.id, exercicio);
    setResumo(res);
  };

  useEffect(() => {
    carregarDados();
  }, [empresaAtiva, exercicio]);

  const abrirModalNovaApuracao = () => {
    setItemEdicao(null);
    setFormExercicio(exercicio);
    setFormDataApuracao(new Date().toISOString().split('T')[0]);
    setFormReceitaAtosCoop(3500000);
    setFormDespesaAtosCoop(2800000);
    setFormReceitaNaoCoop(400000);
    setFormDespesaNaoCoop(320000);
    setFormPercFundoReserva(10.0);
    setFormPercFates(5.0);
    setFormOutrasDestinacoes(0);
    setFormStatus('EM_APURACAO');
    setFormObs('');
    setIsModalApuracaoOpen(true);
  };

  const abrirModalEditarApuracao = (item: ApuracaoSobrasCooperativa) => {
    setItemEdicao(item);
    setFormExercicio(item.exercicio);
    setFormDataApuracao(item.dataApuracao);
    setFormReceitaAtosCoop(item.receitaAtosCooperados);
    setFormDespesaAtosCoop(item.despesasAtosCooperados);
    setFormReceitaNaoCoop(item.receitaAtosNaoCooperados);
    setFormDespesaNaoCoop(item.despesasAtosNaoCooperados);
    setFormPercFundoReserva(item.percentualFundoReserva);
    setFormPercFates(item.percentualFates);
    setFormOutrasDestinacoes(item.outrasDestinacoesEstatutarias || 0);
    setFormStatus(item.status);
    setFormObs(item.observacoes || '');
    setIsModalApuracaoOpen(true);
  };

  const handleSalvarApuracao = () => {
    if (!empresaAtiva) return;

    const sobraCoop = formReceitaAtosCoop - formDespesaAtosCoop;
    const resNaoCoop = formReceitaNaoCoop - formDespesaNaoCoop;
    let irpj = 0;
    let csll = 0;

    if (resNaoCoop > 0) {
      const baseIrpj = resNaoCoop * 0.15;
      const excedente = Math.max(0, resNaoCoop - 240000);
      irpj = Math.round((baseIrpj + excedente * 0.10) * 100) / 100;
      csll = Math.round((resNaoCoop * 0.09) * 100) / 100;
    }

    const sobraLiq = Math.round((sobraCoop + resNaoCoop - irpj - csll) * 100) / 100;
    const vlrFundoReserva = Math.round(sobraLiq * (formPercFundoReserva / 100) * 100) / 100;
    const vlrFates = Math.round(sobraLiq * (formPercFates / 100) * 100) / 100;
    const sobrasAgo = Math.max(0, Math.round((sobraLiq - vlrFundoReserva - vlrFates - formOutrasDestinacoes) * 100) / 100);

    const cooperadosExistentes = itemEdicao?.cooperados || [
      {
        id: 'coop-1',
        matriculaCooperado: 'COOP-01',
        nome: 'Cooperado Associado Alpha',
        cpfCnpj: '111.222.333-44',
        quotaParteCapital: 20000,
        volumeOperacoesExercicio: formReceitaAtosCoop * 0.5,
        percentualParticipacaoOperacoes: 50.0,
        valorSobrasDistribuidas: sobrasAgo * 0.5
      },
      {
        id: 'coop-2',
        matriculaCooperado: 'COOP-02',
        nome: 'Cooperado Associado Beta',
        cpfCnpj: '555.666.777-88',
        quotaParteCapital: 20000,
        volumeOperacoesExercicio: formReceitaAtosCoop * 0.5,
        percentualParticipacaoOperacoes: 50.0,
        valorSobrasDistribuidas: sobrasAgo * 0.5
      }
    ];

    const item: ApuracaoSobrasCooperativa = {
      id: itemEdicao?.id || `coop-${Date.now()}`,
      empresaId: empresaAtiva.id,
      exercicio: formExercicio,
      dataApuracao: formDataApuracao,
      receitaAtosCooperados: formReceitaAtosCoop,
      despesasAtosCooperados: formDespesaAtosCoop,
      sobraBrutaCooperada: sobraCoop,
      receitaAtosNaoCooperados: formReceitaNaoCoop,
      despesasAtosNaoCooperados: formDespesaNaoCoop,
      resultadoNaoCooperado: resNaoCoop,
      baseCalculoIrpjCsllNaoCooperado: resNaoCoop > 0 ? resNaoCoop : 0,
      irpjDevidoNaoCooperado: irpj,
      csllDevidaNaoCooperado: csll,
      sobraLiquidaExercicioAposTributos: sobraLiq,
      percentualFundoReserva: formPercFundoReserva,
      valorFundoReserva: vlrFundoReserva,
      percentualFates: formPercFates,
      valorFates: vlrFates,
      outrasDestinacoesEstatutarias: formOutrasDestinacoes,
      sobrasLiquidasDisponiveisAgo: sobrasAgo,
      status: formStatus,
      integradoContabil: itemEdicao?.integradoContabil || false,
      cooperados: cooperadosExistentes,
      observacoes: formObs
    };

    dbService.salvarApuracaoCooperativa(item);
    setIsModalApuracaoOpen(false);
    carregarDados();
  };

  const handleExcluirApuracao = (id: string) => {
    if (confirm('Deseja excluir esta apuração de sobras da cooperativa?')) {
      dbService.excluirApuracaoCooperativa(id);
      carregarDados();
    }
  };

  const handleIntegrarContabil = (id: string) => {
    const res = dbService.integrarSobrasCooperativaContabil(id);
    alert(res.mensagem);
    carregarDados();
  };

  // Relatório A4
  const imprimirLaudoCooperativoA4 = () => {
    if (!empresaAtiva || !resumo) return;

    const apur = resumo.apuracoes[0];
    if (!apur) {
      alert('Nenhuma apuração disponível para emissão do relatório.');
      return;
    }

    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #111; padding: 24px; max-width: 900px; margin: 0 auto; line-height: 1.4;">
        <div style="border-bottom: 2px solid #047857; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <h1 style="margin: 0; font-size: 18px; text-transform: uppercase; color: #047857;">DEMONSTRAÇÃO DE SOBRAS OU PERDAS DO EXERCÍCIO</h1>
            <p style="margin: 4px 0 0; font-size: 12px; color: #555;">Contabilidade de Sociedades Cooperativas - Lei Federal nº 5.764/1971 e ITG 2004 / NBC TG 2004 (CFC)</p>
          </div>
          <div style="text-align: right; font-size: 11px; color: #666;">
            <strong>Exercício Social:</strong> ${apur.exercicio}<br>
            <strong>Emissão:</strong> ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}
          </div>
        </div>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-bottom: 16px; font-size: 12px;">
          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 8px;">
            <div><strong>Sociedade Cooperativa:</strong> ${empresaAtiva.razaoSocial}</div>
            <div><strong>CNPJ:</strong> ${empresaAtiva.cnpj}</div>
            <div><strong>Regime Societário:</strong> Lei Federal nº 5.764/1971 (Direito Cooperativo)</div>
            <div><strong>Status da Assembleia:</strong> ${apur.status === 'APROVADO_AGO' ? 'Aprovado em Assembleia Geral Ordinária (AGO)' : 'Em Fase de Apuração'}</div>
          </div>
        </div>

        <h3 style="font-size: 13px; text-transform: uppercase; color: #1e293b; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 8px;">
          1. Segregação Contábil entre Atos Cooperativos e Não Cooperativos
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 16px;">
          <thead>
            <tr style="background-color: #f1f5f9; text-align: left; border-bottom: 1px solid #94a3b8;">
              <th style="padding: 6px;">Discriminação das Contas de Resultado</th>
              <th style="padding: 6px; text-right: right;">Atos Cooperativos (Associados)</th>
              <th style="padding: 6px; text-align: right;">Atos Não Cooperativos (Terceiros)</th>
              <th style="padding: 6px; text-align: right;">Total Consolidado</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 6px;">Receitas Operacionais Brutas</td>
              <td style="padding: 6px; text-align: right; font-family: monospace;">R$ ${apur.receitaAtosCooperados.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              <td style="padding: 6px; text-align: right; font-family: monospace;">R$ ${apur.receitaAtosNaoCooperados.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              <td style="padding: 6px; text-align: right; font-family: monospace; font-weight: bold;">R$ ${(apur.receitaAtosCooperados + apur.receitaAtosNaoCooperados).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 6px;">(-) Custos e Despesas Operacionais Vinculadas</td>
              <td style="padding: 6px; text-align: right; font-family: monospace; color: #dc2626;">(R$ ${apur.despesasAtosCooperados.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})</td>
              <td style="padding: 6px; text-align: right; font-family: monospace; color: #dc2626;">(R$ ${apur.despesasAtosNaoCooperados.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})</td>
              <td style="padding: 6px; text-align: right; font-family: monospace; font-weight: bold; color: #dc2626;">(R$ ${(apur.despesasAtosCooperados + apur.despesasAtosNaoCooperados).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})</td>
            </tr>
            <tr style="background-color: #f8fafc; font-weight: bold; border-bottom: 1px solid #cbd5e1;">
              <td style="padding: 6px;">Resultado Bruto / Sobras Brutas Antes dos Tributos</td>
              <td style="padding: 6px; text-align: right; font-family: monospace; color: #047857;">R$ ${apur.sobraBrutaCooperada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              <td style="padding: 6px; text-align: right; font-family: monospace; color: #0284c7;">R$ ${apur.resultadoNaoCooperado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              <td style="padding: 6px; text-align: right; font-family: monospace;">R$ ${(apur.sobraBrutaCooperada + apur.resultadoNaoCooperado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 6px;">(-) Tributos Federais Incidentes (IRPJ 15%+10% e CSLL 9% sobre Atos com Terceiros)</td>
              <td style="padding: 6px; text-align: right; font-family: monospace; color: #16a34a;">ISENTO (Art. 79 Lei 5.764)</td>
              <td style="padding: 6px; text-align: right; font-family: monospace; color: #dc2626;">(R$ ${(apur.irpjDevidoNaoCooperado + apur.csllDevidaNaoCooperado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})</td>
              <td style="padding: 6px; text-align: right; font-family: monospace; color: #dc2626;">(R$ ${(apur.irpjDevidoNaoCooperado + apur.csllDevidaNaoCooperado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})</td>
            </tr>
            <tr style="background-color: #ecfdf5; font-weight: bold; border-top: 2px solid #047857;">
              <td style="padding: 6px; color: #065f46;">SOBRA LÍQUIDA DO EXERCÍCIO (À DISPOSIÇÃO DA ASSEMBLEIA)</td>
              <td colspan="3" style="padding: 6px; text-align: right; font-family: monospace; font-size: 13px; color: #047857;">
                R$ ${apur.sobraLiquidaExercicioAposTributos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </td>
            </tr>
          </tbody>
        </table>

        <h3 style="font-size: 13px; text-transform: uppercase; color: #1e293b; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 8px;">
          2. Destinações Estatutárias Obrigatórias (Art. 28 da Lei Federal nº 5.764/1971)
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 16px;">
          <thead>
            <tr style="background-color: #f1f5f9; text-align: left; border-bottom: 1px solid #94a3b8;">
              <th style="padding: 6px;">Fundo Estatutário</th>
              <th style="padding: 6px; text-align: center;">Exigência Legal Mínima</th>
              <th style="padding: 6px; text-align: center;">% Aplicado</th>
              <th style="padding: 6px; text-align: right;">Valor Destinado (R$)</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 6px;"><strong>Fundo de Reserva Legal</strong> (Cobertura de perdas e estabilidade)</td>
              <td style="padding: 6px; text-align: center;">Mínimo 10,00%</td>
              <td style="padding: 6px; text-align: center; font-weight: 600;">${apur.percentualFundoReserva.toFixed(1)}%</td>
              <td style="padding: 6px; text-align: right; font-family: monospace; font-weight: bold; color: #047857;">R$ ${apur.valorFundoReserva.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 6px;"><strong>FATES - Fundo de Assistência Técnica, Educacional e Moral</strong></td>
              <td style="padding: 6px; text-align: center;">Mínimo 5,00%</td>
              <td style="padding: 6px; text-align: center; font-weight: 600;">${apur.percentualFates.toFixed(1)}%</td>
              <td style="padding: 6px; text-align: right; font-family: monospace; font-weight: bold; color: #0284c7;">R$ ${apur.valorFates.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr style="background-color: #f0fdf4; font-weight: bold; border-top: 1px solid #047857;">
              <td colspan="3" style="padding: 6px; text-align: right;">SOBRAS LÍQUIDAS DISPONÍVEIS PARA RATEIO AOS ASSOCIADOS:</td>
              <td style="padding: 6px; text-align: right; font-family: monospace; font-size: 13px; color: #15803d;">R$ ${apur.sobrasLiquidasDisponiveisAgo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            </tr>
          </tbody>
        </table>

        <h3 style="font-size: 13px; text-transform: uppercase; color: #1e293b; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 8px;">
          3. Rateio Proporcional de Sobras aos Cooperados (Conforme Volume de Operações)
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 24px;">
          <thead>
            <tr style="background-color: #f1f5f9; text-align: left; border-bottom: 1px solid #94a3b8;">
              <th style="padding: 6px;">Matrícula / Cooperado</th>
              <th style="padding: 6px;">CPF/CNPJ</th>
              <th style="padding: 6px; text-align: right;">Capital Subscrito</th>
              <th style="padding: 6px; text-align: right;">Volume Operado no Ano</th>
              <th style="padding: 6px; text-align: center;">% Part.</th>
              <th style="padding: 6px; text-align: right;">Sobra Rateada (R$)</th>
            </tr>
          </thead>
          <tbody>
            ${apur.cooperados.map(c => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 6px;"><strong>${c.matriculaCooperado}</strong> - ${c.nome}</td>
                <td style="padding: 6px; font-family: monospace;">${c.cpfCnpj}</td>
                <td style="padding: 6px; text-align: right; font-family: monospace;">R$ ${c.quotaParteCapital.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="padding: 6px; text-align: right; font-family: monospace;">R$ ${c.volumeOperacoesExercicio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="padding: 6px; text-align: center; font-weight: 600;">${c.percentualParticipacaoOperacoes.toFixed(1)}%</td>
                <td style="padding: 6px; text-align: right; font-family: monospace; font-weight: bold; color: #047857;">R$ ${c.valorSobrasDistribuidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; margin-bottom: 24px; font-size: 10px; color: #475569; background-color: #f8fafc;">
          <strong>Notas Regulatórias e Fundamentação Cooperativa:</strong><br>
          1. <strong>Ato Cooperativo (Art. 79 da Lei nº 5.764/1971):</strong> Os atos praticados entre a cooperativa e seus associados não implicam operação de mercado nem contrato de compra e venda mercantil, razão pela qual não geram resultado econômico de lucro nem sofrem incidência de IRPJ e CSLL.<br>
          2. <strong>Ato Não Cooperativo (Art. 86 da Lei nº 5.764/1971):</strong> As operações realizadas com terceiros não cooperados constituem atos mercantis regulares, cujos resultados são apurados em conta segregada e submetidos à incidência integral de IRPJ (15% + 10%) e CSLL (9%).<br>
          3. <strong>Retenção dos Fundos Obrigatórios (Art. 28):</strong> É vedada a distribuição do Fundo de Reserva e do FATES entre os associados, mesmo em caso de liquidação ou dissolução da sociedade cooperativa.
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; text-align: center; font-size: 11px;">
          <div>
            <div style="border-top: 1px solid #334155; padding-top: 4px; margin-top: 40px;">
              <strong>Diretor Presidente / Conselho de Administração</strong><br>
              Sociedade Cooperativa
            </div>
          </div>
          <div>
            <div style="border-top: 1px solid #334155; padding-top: 4px; margin-top: 40px;">
              <strong>Contador Responsável</strong><br>
              CRC/SP nº 1SP999999/O-0
            </div>
          </div>
        </div>
      </div>
    `;

    if (onOpenReportPreview) {
      onOpenReportPreview({
        titulo: `Demonstração de Sobras ou Perdas - Exercício ${apur.exercicio}`,
        subtitulo: `Apuração Cooperativa e Destinações Estatutárias - ${empresaAtiva.razaoSocial}`,
        conteudoHtml: html,
        imprimirDireto: false
      });
    }
  };

  const apuracaoAtual = resumo?.apuracoes[0];

  return (
    <div className="space-y-6">
      {/* Header com Contexto Cooperativo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1f1f1f] p-5 rounded-lg border border-[#333333] shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-lg text-emerald-400">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-wide">
                Contabilidade de Cooperativas (Lei 5.764/1971 / ITG 2004)
              </h2>
              <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-900/40 text-emerald-300 border border-emerald-700/60 rounded">
                Sobras, Fundo de Reserva & FATES
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Segregação de Atos Cooperativos vs Não Cooperativos, Destinações Estatutárias e Rateio de Sobras Líquidas aos Associados
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#141414] border border-[#333333] rounded px-3 py-1.5 text-xs">
            <Calendar className="w-4 h-4 text-emerald-400 mr-2" />
            <span className="text-neutral-400 mr-2">Exercício:</span>
            <input
              type="number"
              value={exercicio}
              onChange={(e) => setExercicio(parseInt(e.target.value) || 2025)}
              className="bg-transparent text-white focus:outline-none cursor-pointer font-mono text-xs w-16"
            />
          </div>

          <button
            onClick={carregarDados}
            title="Atualizar Dados"
            className="p-2 bg-[#2a2a2a] hover:bg-[#333333] text-neutral-300 rounded border border-[#444444] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={imprimirLaudoCooperativoA4}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2a2a2a] hover:bg-[#333333] text-white rounded border border-[#444444] text-xs font-medium transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Laudo A4</span>
          </button>

          <button
            onClick={abrirModalNovaApuracao}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Apuração</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sobra Líquida Total */}
        <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#333333] shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Sobra Líquida Total</span>
            <span className="p-1.5 bg-emerald-950/50 text-emerald-400 rounded border border-emerald-800/60">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">
            R$ {(resumo?.totalSobrasLiquidas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 flex items-center text-xs text-neutral-400">
            <span className="text-neutral-300 font-medium mr-1">Exercício</span>
            <span className="text-neutral-200">{exercicio} (após IRPJ/CSLL terceiros)</span>
          </div>
        </div>

        {/* Fundo de Reserva Legal (10%) */}
        <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#333333] shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Fundo de Reserva (10%)</span>
            <span className="p-1.5 bg-teal-950/50 text-teal-400 rounded border border-teal-800/60">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-teal-400">
            R$ {(resumo?.totalFundoReserva || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 flex items-center text-xs text-neutral-400">
            <span className="text-teal-400 font-semibold mr-1">Art. 28, I, Lei 5.764</span>
            <span>Reserva Indivisível</span>
          </div>
        </div>

        {/* FATES (5%) */}
        <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#333333] shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">FATES (5%)</span>
            <span className="p-1.5 bg-blue-950/50 text-blue-400 rounded border border-blue-800/60">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-blue-400">
            R$ {(resumo?.totalFates || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 flex items-center text-xs text-neutral-400">
            <span className="text-blue-400 font-medium mr-1">Assist. Técnica / Educ.</span>
            <span>Passivo Exigível</span>
          </div>
        </div>

        {/* Sobras Rateadas aos Cooperados */}
        <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#333333] shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Sobras p/ Rateio (AGO)</span>
            <span className="p-1.5 bg-amber-950/50 text-amber-400 rounded border border-amber-800/60">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-400">
            R$ {(resumo?.totalSobrasRateadas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 flex items-center text-xs text-neutral-400">
            <span className="text-amber-400 font-medium mr-1">Disponível AGO</span>
            <span>rateio proporcional</span>
          </div>
        </div>
      </div>

      {/* Abas */}
      <div className="flex items-center justify-between border-b border-[#333333] pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAbaAtiva('apuracao')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-t-md border-b-2 transition-all ${
              abaAtiva === 'apuracao'
                ? 'border-emerald-500 text-emerald-400 bg-[#252525]'
                : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-[#1a1a1a]'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Demonstração de Sobras/Perdas</span>
          </button>

          <button
            onClick={() => setAbaAtiva('cooperados')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-t-md border-b-2 transition-all ${
              abaAtiva === 'cooperados'
                ? 'border-emerald-500 text-emerald-400 bg-[#252525]'
                : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-[#1a1a1a]'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Quadro de Rateio por Associado</span>
          </button>

          <button
            onClick={() => setAbaAtiva('fundos')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-t-md border-b-2 transition-all ${
              abaAtiva === 'fundos'
                ? 'border-emerald-500 text-emerald-400 bg-[#252525]'
                : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-[#1a1a1a]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Fundos Estatutários (F. Reserva & FATES)</span>
          </button>

          <button
            onClick={() => setAbaAtiva('legislacao')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-t-md border-b-2 transition-all ${
              abaAtiva === 'legislacao'
                ? 'border-emerald-500 text-emerald-400 bg-[#252525]'
                : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-[#1a1a1a]'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Regramento da Lei 5.764 & ITG 2004</span>
          </button>
        </div>
      </div>

      {/* Conteúdo Aba 1: Demonstração de Sobras */}
      {abaAtiva === 'apuracao' && apuracaoAtual && (
        <div className="space-y-4">
          <div className="bg-[#1a1a1a] rounded-lg border border-[#333333] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-400" />
                <span>Demonstrativo Analítico do Resultado - Exercício {apuracaoAtual.exercicio}</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleIntegrarContabil(apuracaoAtual.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                    apuracaoAtual.integradoContabil
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 cursor-default'
                      : 'bg-emerald-700 hover:bg-emerald-600 text-white shadow-sm'
                  }`}
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>{apuracaoAtual.integradoContabil ? 'Integrado ao Diário' : 'Integrar ao Diário Geral'}</span>
                </button>
                <button
                  onClick={() => abrirModalEditarApuracao(apuracaoAtual)}
                  className="p-1.5 bg-[#252525] hover:bg-[#333333] text-neutral-300 hover:text-white rounded border border-[#444444]"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Painel Atos Cooperados */}
              <div className="bg-[#222222] p-4 rounded border border-[#333333] space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                    Atos Cooperativos (Associados)
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Isento IRPJ / CSLL
                  </span>
                </div>
                <div className="text-xs space-y-1.5 pt-2 text-neutral-300">
                  <div className="flex justify-between">
                    <span>Receitas de Atos Cooperativos:</span>
                    <span className="font-mono text-white">R$ {apuracaoAtual.receitaAtosCooperados.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>(-) Custos e Despesas:</span>
                    <span className="font-mono text-rose-400">(R$ {apuracaoAtual.despesasAtosCooperados.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-[#333333] pt-1 text-emerald-300">
                    <span>Sobra Bruta Cooperada:</span>
                    <span className="font-mono">R$ {apuracaoAtual.sobraBrutaCooperada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Painel Atos Não Cooperados */}
              <div className="bg-[#222222] p-4 rounded border border-[#333333] space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wide">
                    Atos Não Cooperativos (Terceiros)
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-950 text-sky-300 border border-sky-800">
                    Tributado (Lucro Real)
                  </span>
                </div>
                <div className="text-xs space-y-1.5 pt-2 text-neutral-300">
                  <div className="flex justify-between">
                    <span>Receitas com Terceiros:</span>
                    <span className="font-mono text-white">R$ {apuracaoAtual.receitaAtosNaoCooperados.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>(-) Custos e Despesas:</span>
                    <span className="font-mono text-rose-400">(R$ {apuracaoAtual.despesasAtosNaoCooperados.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-[#333333] pt-1 text-sky-300">
                    <span>Resultado com Terceiros:</span>
                    <span className="font-mono">R$ {apuracaoAtual.resultadoNaoCooperado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-neutral-400 pt-1 text-[11px]">
                    <span>(-) IRPJ Devido (15%+10%):</span>
                    <span className="font-mono text-rose-400">R$ {apuracaoAtual.irpjDevidoNaoCooperado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-neutral-400 text-[11px]">
                    <span>(-) CSLL Devida (9%):</span>
                    <span className="font-mono text-rose-400">R$ {apuracaoAtual.csllDevidaNaoCooperado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Totalizador da Sobra Líquida */}
            <div className="p-3 bg-[#171717] rounded border border-[#2e2e2e] flex flex-col md:flex-row justify-between items-center gap-2">
              <span className="text-xs font-semibold text-neutral-300">
                Sobra Líquida do Exercício após Tributos:
              </span>
              <span className="text-lg font-bold font-mono text-emerald-400">
                R$ {apuracaoAtual.sobraLiquidaExercicioAposTributos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo Aba 2: Rateio aos Cooperados */}
      {abaAtiva === 'cooperados' && apuracaoAtual && (
        <div className="bg-[#1a1a1a] rounded-lg border border-[#333333] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Quadro Demonstrativo de Rateio das Sobras Líquidas aos Associados</h3>
              <p className="text-xs text-neutral-400">
                Rateio proporcional ao volume de operações realizadas no exercício, conforme preconiza o Art. 24 da Lei 5.764/71.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#242424] text-neutral-300 font-semibold border-b border-[#333333]">
                  <th className="p-3">Matrícula / Cooperado</th>
                  <th className="p-3">CPF / CNPJ</th>
                  <th className="p-3 text-right">Quota-Parte Capital</th>
                  <th className="p-3 text-right">Volume Operado (R$)</th>
                  <th className="p-3 text-center">% Participação</th>
                  <th className="p-3 text-right">Sobra Rateada (R$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2e2e2e]">
                {apuracaoAtual.cooperados.map((c) => (
                  <tr key={c.id} className="hover:bg-[#222222]">
                    <td className="p-3 font-medium text-white">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-emerald-400" />
                        <span>{c.matriculaCooperado} - {c.nome}</span>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-neutral-300">{c.cpfCnpj}</td>
                    <td className="p-3 text-right font-mono text-neutral-200">
                      {c.quotaParteCapital.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right font-mono text-neutral-200">
                      {c.volumeOperacoesExercicio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-emerald-400">
                      {c.percentualParticipacaoOperacoes.toFixed(1)}%
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-400 text-sm">
                      {c.valorSobrasDistribuidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Conteúdo Aba 3: Fundos Estatutários */}
      {abaAtiva === 'fundos' && apuracaoAtual && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#1a1a1a] p-5 rounded-lg border border-[#333333] space-y-3">
            <div className="flex items-center gap-2 text-teal-400">
              <ShieldCheck className="w-5 h-5" />
              <h4 className="text-sm font-bold text-white">Fundo de Reserva Legal</h4>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Destinado a reparar perdas e atender ao desenvolvimento das atividades da cooperativa. A legislação estabelece a retenção mínima obrigatória de 10% (dez por cento) das sobras líquidas do exercício.
            </p>
            <div className="p-3 bg-[#222222] rounded border border-[#333333] space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-400">Percentual Aplicado:</span>
                <span className="font-mono text-teal-400 font-bold">{apuracaoAtual.percentualFundoReserva.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Valor Retido no Exercício:</span>
                <span className="font-mono text-white font-bold text-sm">R$ {apuracaoAtual.valorFundoReserva.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between pt-1 text-[11px] text-neutral-500">
                <span>Classificação Contábil:</span>
                <span>Patrimônio Líquido (Reserva Indivisível)</span>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1a1a] p-5 rounded-lg border border-[#333333] space-y-3">
            <div className="flex items-center gap-2 text-blue-400">
              <Sparkles className="w-5 h-5" />
              <h4 className="text-sm font-bold text-white">FATES - Fundo de Assistência Técnica, Educacional e Moral</h4>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Destinado à prestação de assistência aos associados, seus familiares e aos empregados da cooperativa. A legislação exige a destinação mínima de 5% (cinco por cento) das sobras líquidas.
            </p>
            <div className="p-3 bg-[#222222] rounded border border-[#333333] space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-400">Percentual Aplicado:</span>
                <span className="font-mono text-blue-400 font-bold">{apuracaoAtual.percentualFates.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Valor Retido no Exercício:</span>
                <span className="font-mono text-white font-bold text-sm">R$ {apuracaoAtual.valorFates.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between pt-1 text-[11px] text-neutral-500">
                <span>Classificação Contábil:</span>
                <span>Passivo Exigível (Não Circulante)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo Aba 4: Legislação */}
      {abaAtiva === 'legislacao' && (
        <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#333333] space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <Scale className="w-5 h-5" />
            <span>Fundamentos Legais do Regime Jurídico e Tributário Cooperativo</span>
          </div>

          <div className="space-y-3 text-xs text-neutral-300 leading-relaxed">
            <div className="p-3.5 bg-[#222222] rounded border border-[#333333]">
              <strong className="text-white block mb-1">Lei Federal nº 5.764/1971 - Estatuto do Cooperativismo</strong>
              <p>
                Define as diretrizes das sociedades cooperativas no Brasil. Estabelece a distinção basilar entre atos cooperativos (art. 79) e atos não cooperativos (art. 86 e 87), determinando a destinação compulsória de no mínimo 10% para o Fundo de Reserva e 5% para o FATES.
              </p>
            </div>

            <div className="p-3.5 bg-[#222222] rounded border border-[#333333]">
              <strong className="text-white block mb-1">ITG 2004 / NBC TG 2004 - Conselho Federal de Contabilidade (CFC)</strong>
              <p>
                Regulamenta as normas contábeis aplicáveis às entidades cooperativas, orientando a segregação de receitas, custos e despesas em planos de contas analíticos específicos para demonstrar com clareza as sobras ou perdas à disposição da Assembleia Geral Ordinária.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Nova / Edição Apuração Cooperativa */}
      {isModalApuracaoOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#1f1f1f] border border-[#333333] rounded-lg max-w-lg w-full p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-emerald-400" />
              <span>{itemEdicao ? 'Editar Apuração de Sobras' : 'Nova Apuração de Sobras da Cooperativa'}</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Exercício Social (Ano)</label>
                  <input
                    type="number"
                    value={formExercicio}
                    onChange={(e) => setFormExercicio(parseInt(e.target.value) || 2025)}
                    className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Data da Apuração / Fechamento</label>
                  <input
                    type="date"
                    value={formDataApuracao}
                    onChange={(e) => setFormDataApuracao(e.target.value)}
                    className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Receitas Atos Cooperados (R$)</label>
                  <input
                    type="number"
                    value={formReceitaAtosCoop}
                    onChange={(e) => setFormReceitaAtosCoop(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Despesas Atos Cooperados (R$)</label>
                  <input
                    type="number"
                    value={formDespesaAtosCoop}
                    onChange={(e) => setFormDespesaAtosCoop(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Receitas Atos Não Cooperados (R$)</label>
                  <input
                    type="number"
                    value={formReceitaNaoCoop}
                    onChange={(e) => setFormReceitaNaoCoop(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Despesas Atos Não Cooperados (R$)</label>
                  <input
                    type="number"
                    value={formDespesaNaoCoop}
                    onChange={(e) => setFormDespesaNaoCoop(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">% Fundo de Reserva (Mín. 10%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formPercFundoReserva}
                    onChange={(e) => setFormPercFundoReserva(parseFloat(e.target.value) || 10.0)}
                    className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">% FATES (Mín. 5%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formPercFates}
                    onChange={(e) => setFormPercFates(parseFloat(e.target.value) || 5.0)}
                    className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Status da Deliberação</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="EM_APURACAO">Em Apuração Preliminar</option>
                  <option value="APROVADO_AGO">Aprovado em Assembleia Geral Ordinária (AGO)</option>
                  <option value="HOMOLOGADO_CONTABIL">Homologado e Escriturado no Balanço</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Observações da Apuração</label>
                <input
                  type="text"
                  value={formObs}
                  onChange={(e) => setFormObs(e.target.value)}
                  placeholder="Ex: Deliberação conforme Ata da AGO realizada em 15/03/2026."
                  className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#333333] flex justify-end gap-2">
              <button
                onClick={() => setIsModalApuracaoOpen(false)}
                className="px-3.5 py-1.5 bg-[#2a2a2a] hover:bg-[#333333] text-neutral-300 rounded text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvarApuracao}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded text-xs transition-colors shadow-sm"
              >
                Calcular e Salvar Apuração
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
