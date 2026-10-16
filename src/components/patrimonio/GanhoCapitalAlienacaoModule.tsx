import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Plus,
  RefreshCw,
  Printer,
  Archive,
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
  Building,
  Truck,
  Sparkles,
  FileCheck2,
  PieChart,
  HelpCircle,
  Percent
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  Empresa,
  ItemAlienacaoGanhoCapital,
  ResumoGanhoCapitalAlienacao,
  TipoBemAtivoPermanente
} from '../../types/contabil';

interface GanhoCapitalAlienacaoModuleProps {
  empresaAtiva: Empresa | null;
  onOpenReportPreview?: (config: {
    titulo: string;
    subtitulo: string;
    conteudoHtml: string;
    imprimirDireto?: boolean;
  }) => void;
}

export const GanhoCapitalAlienacaoModule: React.FC<GanhoCapitalAlienacaoModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [resumo, setResumo] = useState<ResumoGanhoCapitalAlienacao | null>(null);
  const [anoExercicio, setAnoExercicio] = useState<number>(2026);
  const [abaAtiva, setAbaAtiva] = useState<'alienacoes' | 'progressao' | 'legislacao'>('alienacoes');
  const [busca, setBusca] = useState('');

  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemEdicao, setItemEdicao] = useState<ItemAlienacaoGanhoCapital | null>(null);

  // Form Item
  const [formDescricao, setFormDescricao] = useState('');
  const [formTipoBem, setFormTipoBem] = useState<TipoBemAtivoPermanente>('IMOVEL_TERRENO_EDIFICACAO');
  const [formNumeroTombo, setFormNumeroTombo] = useState('');
  const [formDataAquisicao, setFormDataAquisicao] = useState('2019-01-10');
  const [formDataAlienacao, setFormDataAlienacao] = useState('2026-03-20');
  const [formValorAquisicao, setFormValorAquisicao] = useState<number>(1500000);
  const [formCustoBenfeitorias, setFormCustoBenfeitorias] = useState<number>(200000);
  const [formDepreciacaoAcum, setFormDepreciacaoAcum] = useState<number>(350000);
  const [formValorVenda, setFormValorVenda] = useState<number>(2800000);
  const [formDespesaComissao, setFormDespesaComissao] = useState<number>(80000);
  const [formEnquadramento, setFormEnquadramento] = useState<'LUCRO_REAL' | 'LUCRO_PRESUMIDO' | 'PESSOA_FISICA_EQUIPARADA'>('LUCRO_PRESUMIDO');
  const [formVencimentoDarf, setFormVencimentoDarf] = useState('2026-04-30');
  const [formStatusDarf, setFormStatusDarf] = useState<'PENDENTE' | 'PAGO'>('PENDENTE');
  const [formObs, setFormObs] = useState('');

  const carregarDados = () => {
    if (!empresaAtiva) return;
    const res = dbService.getGanhoCapitalAlienacao(empresaAtiva.id, anoExercicio);
    setResumo(res);
  };

  useEffect(() => {
    carregarDados();
  }, [empresaAtiva, anoExercicio]);

  const abrirModalNovo = () => {
    setItemEdicao(null);
    setFormDescricao('');
    setFormTipoBem('IMOVEL_TERRENO_EDIFICACAO');
    setFormNumeroTombo('');
    setFormDataAquisicao('2019-01-10');
    setFormDataAlienacao(new Date().toISOString().split('T')[0]);
    setFormValorAquisicao(1000000);
    setFormCustoBenfeitorias(100000);
    setFormDepreciacaoAcum(250000);
    setFormValorVenda(2200000);
    setFormDespesaComissao(50000);
    setFormEnquadramento('LUCRO_PRESUMIDO');
    setFormVencimentoDarf('2026-04-30');
    setFormStatusDarf('PENDENTE');
    setFormObs('');
    setIsModalOpen(true);
  };

  const abrirModalEditar = (item: ItemAlienacaoGanhoCapital) => {
    setItemEdicao(item);
    setFormDescricao(item.descricaoBem);
    setFormTipoBem(item.tipoBem);
    setFormNumeroTombo(item.numeroPatrimonialTombo);
    setFormDataAquisicao(item.dataAquisicao);
    setFormDataAlienacao(item.dataAlienacao);
    setFormValorAquisicao(item.valorAquisicaoOriginal);
    setFormCustoBenfeitorias(item.custoAdicoesBenfeitorias);
    setFormDepreciacaoAcum(item.depreciacaoAmortizacaoAcumulada);
    setFormValorVenda(item.valorAlienacaoVenda);
    setFormDespesaComissao(item.despesasAlienacaoComissao);
    setFormEnquadramento(item.enquadramentoTributario);
    setFormVencimentoDarf(item.dataVencimentoDarf);
    setFormStatusDarf(item.statusDarf);
    setFormObs(item.observacoes || '');
    setIsModalOpen(true);
  };

  const handleSalvar = () => {
    if (!empresaAtiva) return;

    const vlrContabil = Math.max(0, formValorAquisicao + formCustoBenfeitorias - formDepreciacaoAcum);
    const receitaLiq = formValorVenda - formDespesaComissao;
    const ganho = Math.max(0, receitaLiq - vlrContabil);

    let imposto = 0;
    let aliqEfetiva = 15.0;
    let faixa = 'Até R$ 5.000.000,00 (15%)';

    if (ganho <= 5000000) {
      imposto = ganho * 0.15;
      aliqEfetiva = 15.0;
      faixa = 'Até R$ 5.000.000,00 (15%)';
    } else if (ganho <= 10000000) {
      imposto = (5000000 * 0.15) + ((ganho - 5000000) * 0.175);
      aliqEfetiva = Math.round((imposto / ganho) * 10000) / 100;
      faixa = 'De R$ 5M a R$ 10M (17,5%)';
    } else if (ganho <= 30000000) {
      imposto = (5000000 * 0.15) + (5000000 * 0.175) + ((ganho - 10000000) * 0.20);
      aliqEfetiva = Math.round((imposto / ganho) * 10000) / 100;
      faixa = 'De R$ 10M a R$ 30M (20%)';
    } else {
      imposto = (5000000 * 0.15) + (5000000 * 0.175) + (20000000 * 0.20) + ((ganho - 30000000) * 0.225);
      aliqEfetiva = Math.round((imposto / ganho) * 10000) / 100;
      faixa = 'Acima de R$ 30M (22,5%)';
    }

    const item: ItemAlienacaoGanhoCapital = {
      id: itemEdicao?.id || `gc-${Date.now()}`,
      empresaId: empresaAtiva.id,
      descricaoBem: formDescricao || 'Bem do Ativo Imobilizado',
      tipoBem: formTipoBem,
      numeroPatrimonialTombo: formNumeroTombo || 'PAT-0001',
      dataAquisicao: formDataAquisicao,
      dataAlienacao: formDataAlienacao,
      valorAquisicaoOriginal: formValorAquisicao,
      custoAdicoesBenfeitorias: formCustoBenfeitorias,
      depreciacaoAmortizacaoAcumulada: formDepreciacaoAcum,
      valorContabilLiquido: vlrContabil,
      valorAlienacaoVenda: formValorVenda,
      despesasAlienacaoComissao: formDespesaComissao,
      ganhoCapitalLiquidoApurado: ganho,
      enquadramentoTributario: formEnquadramento,
      aliquotaEfetivaGanhoCapital: aliqEfetiva,
      faixaProgressivaDescricao: faixa,
      valorImpostoDevidoDarf: Math.round(imposto * 100) / 100,
      codigoReceitaDarf: formEnquadramento === 'PESSOA_FISICA_EQUIPARADA' ? '4600' : '2089',
      dataVencimentoDarf: formVencimentoDarf,
      statusDarf: formStatusDarf,
      integradoContabil: itemEdicao?.integradoContabil || false,
      observacoes: formObs
    };

    dbService.salvarItemGanhoCapital(item);
    setIsModalOpen(false);
    carregarDados();
  };

  const handleExcluir = (id: string) => {
    if (confirm('Deseja excluir esta apuração de alienação de bem?')) {
      dbService.excluirItemGanhoCapital(id);
      carregarDados();
    }
  };

  const handleIntegrarContabil = (id: string) => {
    const res = dbService.integrarGanhoCapitalContabil(id);
    alert(res.mensagem);
    carregarDados();
  };

  // Laudo Pericial A4
  const imprimirLaudoAlienacaoA4 = () => {
    if (!empresaAtiva || !resumo) return;

    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #111; padding: 24px; max-width: 900px; margin: 0 auto; line-height: 1.4;">
        <div style="border-bottom: 2px solid #b45309; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <h1 style="margin: 0; font-size: 18px; text-transform: uppercase; color: #b45309;">LAUDO DE APURAÇÃO DO GANHO DE CAPITAL NA ALIENAÇÃO DE BENS</h1>
            <p style="margin: 4px 0 0; font-size: 12px; color: #555;">Memória de Cálculo do IRPJ sobre Ganhos de Capital - Art. 21 da Lei nº 8.981/1995 c/ redação da Lei nº 13.259/2016</p>
          </div>
          <div style="text-align: right; font-size: 11px; color: #666;">
            <strong>Ano-Calendário:</strong> ${anoExercicio}<br>
            <strong>Emissão:</strong> ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}
          </div>
        </div>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-bottom: 16px; font-size: 12px;">
          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 8px;">
            <div><strong>Empresa Alienante:</strong> ${empresaAtiva.razaoSocial}</div>
            <div><strong>CNPJ:</strong> ${empresaAtiva.cnpj}</div>
            <div><strong>Regime de Tributação:</strong> Lucro Presumido / Lucro Real</div>
            <div><strong>Total de Ativos Baixados:</strong> ${resumo.itens.length}</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px;">
          <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px; border-radius: 6px; text-align: center;">
            <div style="font-size: 10px; font-weight: 600; color: #475569; text-transform: uppercase;">Valor Bruto de Venda</div>
            <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-top: 4px;">R$ ${resumo.totalValorAlienacoes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
          <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 10px; border-radius: 6px; text-align: center;">
            <div style="font-size: 10px; font-weight: 600; color: #991b1b; text-transform: uppercase;">Custo Contábil Baixado</div>
            <div style="font-size: 15px; font-weight: 700; color: #dc2626; margin-top: 4px;">R$ ${resumo.totalValorContabilBaixado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 10px; border-radius: 6px; text-align: center;">
            <div style="font-size: 10px; font-weight: 600; color: #166534; text-transform: uppercase;">Ganho de Capital Líquido</div>
            <div style="font-size: 15px; font-weight: 700; color: #15803d; margin-top: 4px;">R$ ${resumo.totalGanhoCapitalLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
          <div style="background: #fffbeb; border: 1px solid #fde68a; padding: 10px; border-radius: 6px; text-align: center;">
            <div style="font-size: 10px; font-weight: 600; color: #92400e; text-transform: uppercase;">Total IRPJ Devido</div>
            <div style="font-size: 15px; font-weight: 700; color: #b45309; margin-top: 4px;">R$ ${resumo.totalImpostoDevido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        <h3 style="font-size: 13px; text-transform: uppercase; color: #334155; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 8px;">
          Demonstrativo Individualizado por Bem Alienado
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 16px;">
          <thead>
            <tr style="background-color: #f1f5f9; text-align: left; border-bottom: 1px solid #94a3b8;">
              <th style="padding: 6px;">Descrição do Bem / Tombo</th>
              <th style="padding: 6px; text-align: center;">Aquisição / Venda</th>
              <th style="padding: 6px; text-align: right;">Custo Original</th>
              <th style="padding: 6px; text-align: right;">Deprec. Acum.</th>
              <th style="padding: 6px; text-align: right;">Valor Contábil</th>
              <th style="padding: 6px; text-align: right;">Valor Venda</th>
              <th style="padding: 6px; text-align: right;">Ganho Líquido</th>
              <th style="padding: 6px; text-align: right;">IRPJ Devido</th>
            </tr>
          </thead>
          <tbody>
            ${resumo.itens.map(i => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 6px;">
                  <strong>${i.descricaoBem}</strong><br>
                  <span style="font-size: 9px; color: #64748b;">Tombo: ${i.numeroPatrimonialTombo} (${i.tipoBem})</span>
                </td>
                <td style="padding: 6px; text-align: center; font-family: monospace; font-size: 10px;">
                  ${i.dataAquisicao}<br>${i.dataAlienacao}
                </td>
                <td style="padding: 6px; text-align: right; font-family: monospace;">R$ ${i.valorAquisicaoOriginal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="padding: 6px; text-align: right; font-family: monospace; color: #dc2626;">(R$ ${i.depreciacaoAmortizacaoAcumulada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})</td>
                <td style="padding: 6px; text-align: right; font-family: monospace;">R$ ${i.valorContabilLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="padding: 6px; text-align: right; font-family: monospace;">R$ ${i.valorAlienacaoVenda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="padding: 6px; text-align: right; font-family: monospace; font-weight: bold; color: #15803d;">R$ ${i.ganhoCapitalLiquidoApurado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="padding: 6px; text-align: right; font-family: monospace; font-weight: bold; color: #b45309;">
                  R$ ${i.valorImpostoDevidoDarf.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}<br>
                  <span style="font-size: 9px; font-weight: normal; color: #64748b;">(${i.aliquotaEfetivaGanhoCapital.toFixed(1)}%)</span>
                </td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style="background-color: #f8fafc; font-weight: bold; border-top: 2px solid #b45309;">
              <td colspan="6" style="padding: 6px; text-align: right;">TOTAIS ACUMULADOS:</td>
              <td style="padding: 6px; text-align: right; font-family: monospace; color: #15803d;">R$ ${resumo.totalGanhoCapitalLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              <td style="padding: 6px; text-align: right; font-family: monospace; color: #b45309;">R$ ${resumo.totalImpostoDevido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            </tr>
          </tfoot>
        </table>

        <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; margin-bottom: 24px; font-size: 10px; color: #475569; background-color: #f8fafc;">
          <strong>Fundamentação Tributária (Lei nº 13.259/2016 e RIR/2018):</strong><br>
          1. <strong>Apuração do Ganho de Capital:</strong> Corresponde à diferença positiva entre o valor de alienação e o custo contábil do bem (custo corrigido deduzido da depreciação ou amortização acumulada até a data da operação).<br>
          2. <strong>Tabela Progressiva:</strong> Aplicação das alíquotas escalonadas de 15% (até 5M), 17,5% (de 5M a 10M), 20% (de 10M a 30M) e 22,5% (sobre a parcela que exceder 30M).<br>
          3. <strong>Tributação na PJ:</strong> Nas pessoas jurídicas tributadas pelo Lucro Presumido, o ganho de capital integra a base de cálculo diretamente no trimestre da alienação (sem aplicação dos percentuais de presunção de 8% ou 32%).
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; text-align: center; font-size: 11px;">
          <div>
            <div style="border-top: 1px solid #334155; padding-top: 4px; margin-top: 40px;">
              <strong>Diretoria Financeira / Patrimonial</strong><br>
              Responsável pela Alienação
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
        titulo: `Laudo de Ganho de Capital - Ano ${anoExercicio}`,
        subtitulo: `Apuração e Memória de Cálculo Tributário - ${empresaAtiva.razaoSocial}`,
        conteudoHtml: html,
        imprimirDireto: false
      });
    }
  };

  const itensFiltrados = resumo?.itens.filter(i => {
    const termo = busca.toLowerCase();
    return (
      i.descricaoBem.toLowerCase().includes(termo) ||
      i.numeroPatrimonialTombo.toLowerCase().includes(termo)
    );
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header com Contexto */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1f1f1f] p-5 rounded-lg border border-[#333333] shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-950/60 border border-amber-800/80 rounded-lg text-amber-400">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-wide">
                Ganho de Capital na Alienação de Bens do Ativo Permanente
              </h2>
              <span className="px-2 py-0.5 text-xs font-semibold bg-amber-900/40 text-amber-300 border border-amber-700/60 rounded">
                Lei nº 13.259/2016 / IN RFB 1.500
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Baixa Contábil do Imobilizado, Apuração do Ganho Líquido, Tabela Progressiva (15% a 22,5%) e Geração de DARF
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#141414] border border-[#333333] rounded px-3 py-1.5 text-xs">
            <Calendar className="w-4 h-4 text-amber-400 mr-2" />
            <span className="text-neutral-400 mr-2">Exercício:</span>
            <input
              type="number"
              value={anoExercicio}
              onChange={(e) => setAnoExercicio(parseInt(e.target.value) || 2026)}
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
            onClick={imprimirLaudoAlienacaoA4}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2a2a2a] hover:bg-[#333333] text-white rounded border border-[#444444] text-xs font-medium transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Laudo A4</span>
          </button>

          <button
            onClick={abrirModalNovo}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Alienação</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Vendas Alienadas */}
        <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#333333] shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Valor Bruto Alienado</span>
            <span className="p-1.5 bg-neutral-800 text-neutral-300 rounded border border-neutral-700">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white">
            R$ {(resumo?.totalValorAlienacoes || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 flex items-center text-xs text-neutral-400">
            <span className="text-neutral-300 font-medium mr-1">Preço de Venda</span>
            <span>dos bens baixados</span>
          </div>
        </div>

        {/* Custo Contábil Líquido Baixado */}
        <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#333333] shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Custo Contábil Baixado</span>
            <span className="p-1.5 bg-rose-950/50 text-rose-400 rounded border border-rose-800/60">
              <Archive className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-400">
            R$ {(resumo?.totalValorContabilBaixado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 flex items-center text-xs text-neutral-400">
            <span className="text-rose-400 font-semibold mr-1">Baixa de Ativo</span>
            <span>líquido de depreciação</span>
          </div>
        </div>

        {/* Ganho de Capital Líquido */}
        <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#333333] shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Ganho de Capital Líquido</span>
            <span className="p-1.5 bg-emerald-950/50 text-emerald-400 rounded border border-emerald-800/60">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">
            R$ {(resumo?.totalGanhoCapitalLiquido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 flex items-center text-xs text-neutral-400">
            <span className="text-emerald-400 font-medium mr-1">Base Tributável</span>
            <span>de IRPJ no período</span>
          </div>
        </div>

        {/* Total Imposto Devido */}
        <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#333333] shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Total Imposto Devido</span>
            <span className="p-1.5 bg-amber-950/50 text-amber-400 rounded border border-amber-800/60">
              <Calculator className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-400">
            R$ {(resumo?.totalImpostoDevido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 flex items-center text-xs text-neutral-400">
            <span className="text-amber-400 font-semibold mr-1">DARF 2089 / 4600</span>
            <span>Tabela Progressiva</span>
          </div>
        </div>
      </div>

      {/* Navegação de Abas */}
      <div className="flex items-center justify-between border-b border-[#333333] pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAbaAtiva('alienacoes')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-t-md border-b-2 transition-all ${
              abaAtiva === 'alienacoes'
                ? 'border-amber-500 text-amber-400 bg-[#252525]'
                : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-[#1a1a1a]'
            }`}
          >
            <Archive className="w-4 h-4" />
            <span>Alienações Registradas ({resumo?.itens.length || 0})</span>
          </button>

          <button
            onClick={() => setAbaAtiva('progressao')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-t-md border-b-2 transition-all ${
              abaAtiva === 'progressao'
                ? 'border-amber-500 text-amber-400 bg-[#252525]'
                : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-[#1a1a1a]'
            }`}
          >
            <Percent className="w-4 h-4" />
            <span>Faixas Progressivas (Lei 13.259)</span>
          </button>

          <button
            onClick={() => setAbaAtiva('legislacao')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-t-md border-b-2 transition-all ${
              abaAtiva === 'legislacao'
                ? 'border-amber-500 text-amber-400 bg-[#252525]'
                : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-[#1a1a1a]'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Regras Tributárias & Contábeis</span>
          </button>
        </div>
      </div>

      {/* Conteúdo Aba 1: Alienações */}
      {abaAtiva === 'alienacoes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 bg-[#1a1a1a] p-3 rounded-lg border border-[#333333]">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por descrição do bem ou número de tombo..."
                className="w-full bg-[#141414] border border-[#333333] rounded pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="text-xs text-neutral-400 font-mono">
              Registros: {itensFiltrados.length}
            </div>
          </div>

          <div className="overflow-x-auto bg-[#1a1a1a] rounded-lg border border-[#333333] shadow-md">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#242424] text-neutral-300 font-semibold border-b border-[#333333]">
                  <th className="p-3">Descrição do Bem / Tombo</th>
                  <th className="p-3">Tipo do Bem</th>
                  <th className="p-3 text-center">Data Alienação</th>
                  <th className="p-3 text-right">Custo Líquido (R$)</th>
                  <th className="p-3 text-right">Valor Venda (R$)</th>
                  <th className="p-3 text-right">Ganho Líquido (R$)</th>
                  <th className="p-3 text-center">Alíquota</th>
                  <th className="p-3 text-right">Imposto Devido (R$)</th>
                  <th className="p-3 text-center">Status DARF</th>
                  <th className="p-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2e2e2e]">
                {itensFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-neutral-500">
                      Nenhuma alienação de bem cadastrada para este exercício.
                    </td>
                  </tr>
                ) : (
                  itensFiltrados.map((i) => (
                    <tr key={i.id} className="hover:bg-[#222222] transition-colors">
                      <td className="p-3 font-medium text-white">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-amber-400 flex-shrink-0" />
                          <div>
                            <div>{i.descricaoBem}</div>
                            <span className="text-[10px] font-mono text-neutral-400">Tombo: {i.numeroPatrimonialTombo}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-neutral-300">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700">
                          {i.tipoBem === 'IMOVEL_TERRENO_EDIFICACAO' ? 'Imóvel' : i.tipoBem === 'MAQUINAS_EQUIPAMENTOS_FABRIS' ? 'Máquinas' : 'Veículos/Outros'}
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono text-neutral-300">
                        {i.dataAlienacao}
                      </td>
                      <td className="p-3 text-right font-mono text-neutral-200">
                        {i.valorContabilLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right font-mono text-neutral-200">
                        {i.valorAlienacaoVenda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-400">
                        {i.ganhoCapitalLiquidoApurado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-center font-mono font-semibold text-amber-400">
                        {i.aliquotaEfetivaGanhoCapital.toFixed(1)}%
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-amber-400 text-sm">
                        {i.valorImpostoDevidoDarf.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            i.statusDarf === 'PAGO'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {i.statusDarf}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleIntegrarContabil(i.id)}
                            title={i.integradoContabil ? "Já integrado à contabilidade" : "Integrar ao Diário Geral"}
                            className={`p-1.5 rounded transition-colors ${
                              i.integradoContabil
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 cursor-default'
                                : 'bg-[#2a2a2a] hover:bg-amber-900/50 text-neutral-300 hover:text-amber-300 border border-[#444444]'
                            }`}
                          >
                            <FileCheck2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => abrirModalEditar(i)}
                            title="Editar"
                            className="p-1.5 bg-[#2a2a2a] hover:bg-[#333333] text-neutral-300 hover:text-white rounded border border-[#444444] transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleExcluir(i.id)}
                            title="Excluir"
                            className="p-1.5 bg-[#2a2a2a] hover:bg-red-950/60 text-neutral-400 hover:text-red-400 rounded border border-[#444444] transition-colors"
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

      {/* Conteúdo Aba 2: Faixas Progressivas */}
      {abaAtiva === 'progressao' && (
        <div className="bg-[#1a1a1a] p-5 rounded-lg border border-[#333333] space-y-4">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Percent className="w-5 h-5" />
            <span>Tabela Progressiva de Tributação do Ganho de Capital (Lei Federal nº 13.259/2016)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#242424] text-neutral-300 font-semibold border-b border-[#333333]">
                  <th className="p-3">Faixa de Ganho de Capital Líquido (R$)</th>
                  <th className="p-3 text-center">Alíquota Marginal</th>
                  <th className="p-3">Parcela a Deduzir / Regra de Cálculo</th>
                  <th className="p-3">Dispositivo Legal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2e2e2e]">
                <tr className="hover:bg-[#222222]">
                  <td className="p-3 font-medium text-white">Até R$ 5.000.000,00</td>
                  <td className="p-3 text-center font-bold text-emerald-400 font-mono">15,00%</td>
                  <td className="p-3 text-neutral-300">Incidência direta sobre a totalidade do ganho</td>
                  <td className="p-3 font-mono text-neutral-400">Art. 21, I, Lei 8.981/95</td>
                </tr>
                <tr className="hover:bg-[#222222]">
                  <td className="p-3 font-medium text-white">De R$ 5.000.000,01 até R$ 10.000.000,00</td>
                  <td className="p-3 text-center font-bold text-sky-400 font-mono">17,50%</td>
                  <td className="p-3 text-neutral-300">R$ 750.000,00 + 17,5% sobre o excedente a R$ 5M</td>
                  <td className="p-3 font-mono text-neutral-400">Art. 21, II, Lei 8.981/95</td>
                </tr>
                <tr className="hover:bg-[#222222]">
                  <td className="p-3 font-medium text-white">De R$ 10.000.000,01 até R$ 30.000.000,00</td>
                  <td className="p-3 text-center font-bold text-amber-400 font-mono">20,00%</td>
                  <td className="p-3 text-neutral-300">R$ 1.625.000,00 + 20% sobre o excedente a R$ 10M</td>
                  <td className="p-3 font-mono text-neutral-400">Art. 21, III, Lei 8.981/95</td>
                </tr>
                <tr className="hover:bg-[#222222]">
                  <td className="p-3 font-medium text-white">Acima de R$ 30.000.000,00</td>
                  <td className="p-3 text-center font-bold text-rose-400 font-mono">22,50%</td>
                  <td className="p-3 text-neutral-300">R$ 5.625.000,00 + 22,5% sobre o excedente a R$ 30M</td>
                  <td className="p-3 font-mono text-neutral-400">Art. 21, IV, Lei 8.981/95</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Conteúdo Aba 3: Legislação */}
      {abaAtiva === 'legislacao' && (
        <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#333333] space-y-4">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
            <Scale className="w-5 h-5" />
            <span>Fundamentos Legais e Contábeis (NBC TG 27 / RIR 2018)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-neutral-300 leading-relaxed">
            <div className="p-4 bg-[#222222] rounded border border-[#333333] space-y-2">
              <h4 className="font-bold text-white text-sm">Tratamento no Lucro Presumido</h4>
              <p>
                Nas pessoas jurídicas tributadas com base no Lucro Presumido, o ganho de capital obtido na alienação de bens do ativo imobilizado não se submete aos coeficientes de presunção de 8% ou 32%.
              </p>
              <p>
                O ganho líquido integral é somado diretamente à base de cálculo do IRPJ e da CSLL no trimestre de competência do fechamento do negócio (Art. 595 do RIR/2018).
              </p>
            </div>

            <div className="p-4 bg-[#222222] rounded border border-[#333333] space-y-2">
              <h4 className="font-bold text-white text-sm">Baixa Contábil segundo o CPC 27 (Ativo Imobilizado)</h4>
              <p>
                O desreconhecimento do ativo imobilizado deve ocorrer na data em que a entidade transferir os riscos e benefícios substanciais da propriedade do bem.
              </p>
              <p>
                A depreciação acumulada é baixada contra o custo original, e o resultado residual (ganho ou perda) é evidenciado em Outras Receitas/Despesas Operacionais na DRE.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Nova / Edição Alienação */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#1f1f1f] border border-[#333333] rounded-lg max-w-lg w-full p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-amber-400" />
              <span>{itemEdicao ? 'Editar Alienação de Ativo' : 'Nova Alienação e Apuração de Ganho de Capital'}</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Descrição do Bem Patrimonial</label>
                <input
                  type="text"
                  value={formDescricao}
                  onChange={(e) => setFormDescricao(e.target.value)}
                  placeholder="Ex: Galpão Industrial nº 04 / Prensa Hidráulica 500T"
                  className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Tipo do Ativo</label>
                  <select
                    value={formTipoBem}
                    onChange={(e) => setFormTipoBem(e.target.value as any)}
                    className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="IMOVEL_TERRENO_EDIFICACAO">Imóvel / Terreno / Edificação</option>
                    <option value="MAQUINAS_EQUIPAMENTOS_FABRIS">Máquinas & Equipamentos</option>
                    <option value="VEICULOS_TRANSPORTE">Veículos de Transporte</option>
                    <option value="PARTICIPACOES_SOCIETARIAS_QUOTAS">Participações Societárias</option>
                    <option value="ATIVO_INTANGIVEL_MARCAS_PATENTES">Ativo Intangível / Marcas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Nº Tombo / Placa / Registro</label>
                  <input
                    type="text"
                    value={formNumeroTombo}
                    onChange={(e) => setFormNumeroTombo(e.target.value)}
                    placeholder="IMOB-0102"
                    className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Data Aquisição</label>
                  <input
                    type="date"
                    value={formDataAquisicao}
                    onChange={(e) => setFormDataAquisicao(e.target.value)}
                    className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Data Alienação / Venda</label>
                  <input
                    type="date"
                    value={formDataAlienacao}
                    onChange={(e) => setFormDataAlienacao(e.target.value)}
                    className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Custo Aquisição (R$)</label>
                  <input
                    type="number"
                    value={formValorAquisicao}
                    onChange={(e) => setFormValorAquisicao(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Benfeitorias (R$)</label>
                  <input
                    type="number"
                    value={formCustoBenfeitorias}
                    onChange={(e) => setFormCustoBenfeitorias(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Deprec. Acumulada (R$)</label>
                  <input
                    type="number"
                    value={formDepreciacaoAcum}
                    onChange={(e) => setFormDepreciacaoAcum(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Valor Venda / Alienação (R$)</label>
                  <input
                    type="number"
                    value={formValorVenda}
                    onChange={(e) => setFormValorVenda(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Despesas / Corretagem (R$)</label>
                  <input
                    type="number"
                    value={formDespesaComissao}
                    onChange={(e) => setFormDespesaComissao(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Enquadramento Tributário</label>
                  <select
                    value={formEnquadramento}
                    onChange={(e) => setFormEnquadramento(e.target.value as any)}
                    className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="LUCRO_PRESUMIDO">Lucro Presumido (DARF 2089)</option>
                    <option value="LUCRO_REAL">Lucro Real (DARF 2432 / Ajuste)</option>
                    <option value="PESSOA_FISICA_EQUIPARADA">Pessoa Física Equiparada (DARF 4600)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Vencimento DARF</label>
                  <input
                    type="date"
                    value={formVencimentoDarf}
                    onChange={(e) => setFormVencimentoDarf(e.target.value)}
                    className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Observações da Operação</label>
                <input
                  type="text"
                  value={formObs}
                  onChange={(e) => setFormObs(e.target.value)}
                  placeholder="Ex: Alienação com quitação via TED em conta corrente da empresa."
                  className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#333333] flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-3.5 py-1.5 bg-[#2a2a2a] hover:bg-[#333333] text-neutral-300 rounded text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvar}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded text-xs transition-colors shadow-sm"
              >
                Calcular e Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
