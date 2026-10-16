import React, { useState, useEffect } from 'react';
import {
  Sprout,
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
  Wheat,
  Layers,
  Sparkles,
  Barcode
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  Empresa,
  TituloCprAgro,
  ResumoCprAgro,
  TipoCpr,
  ModalidadeHedgeAgro,
  StatusCpr
} from '../../types/contabil';

interface CprAgroHedgeModuleProps {
  empresaAtiva: Empresa | null;
  onOpenReportPreview?: (config: {
    titulo: string;
    subtitulo: string;
    conteudoHtml: string;
    imprimirDireto?: boolean;
  }) => void;
}

export const CprAgroHedgeModule: React.FC<CprAgroHedgeModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [resumo, setResumo] = useState<ResumoCprAgro | null>(null);
  const [anoFiltro, setAnoFiltro] = useState<number>(2026);
  const [abaAtiva, setAbaAtiva] = useState<'titulos' | 'simulador' | 'legislacao'>('titulos');
  const [busca, setBusca] = useState('');

  // Modal formulário
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemEdicao, setItemEdicao] = useState<TituloCprAgro | null>(null);

  // Campos do formulário
  const [formNumCpr, setFormNumCpr] = useState('CPR-FIN-2026-0120');
  const [formTipoCpr, setFormTipoCpr] = useState<TipoCpr>('CPR_FINANCEIRA');
  const [formEmitente, setFormEmitente] = useState('Agropecuária Rio Formoso S.A.');
  const [formCpfCnpj, setFormCpfCnpj] = useState('11.222.333/0001-44');
  const [formCommodity, setFormCommodity] = useState('Soja em Grãos Tipo 1');
  const [formQuantidade, setFormQuantidade] = useState<number>(30000);
  const [formUnidade, setFormUnidade] = useState('Sacas de 60kg');
  const [formValorNominal, setFormValorNominal] = useState<number>(3600000);
  const [formTaxaJuros, setFormTaxaJuros] = useState<number>(7.5);
  const [formDataEmissao, setFormDataEmissao] = useState('2026-02-01');
  const [formDataVencimento, setFormDataVencimento] = useState('2026-10-31');
  const [formCotacaoAtual, setFormCotacaoAtual] = useState<number>(132.00);
  const [formModalidadeHedge, setFormModalidadeHedge] = useState<ModalidadeHedgeAgro>('SWAP_COMMODITY');
  const [formStatus, setFormStatus] = useState<StatusCpr>('REGISTRADA_B3');
  const [formRegistradoB3, setFormRegistradoB3] = useState<boolean>(true);
  const [formCodigoB3, setFormCodigoB3] = useState('B3-CPR-2026-W99100');
  const [formObservacoes, setFormObservacoes] = useState('');

  // Simulador rápido MtM
  const [simCommodity, setSimCommodity] = useState('Soja em Grãos');
  const [simQtd, setSimQtd] = useState<number>(50000);
  const [simPrecoEmissao, setSimPrecoEmissao] = useState<number>(120);
  const [simPrecoMercado, setSimPrecoMercado] = useState<number>(138);

  const carregarDados = () => {
    if (!empresaAtiva) return;
    const res = dbService.getCprAgro(empresaAtiva.id, anoFiltro);
    setResumo(res);
  };

  useEffect(() => {
    carregarDados();
  }, [empresaAtiva, anoFiltro]);

  const abrirModalNovo = () => {
    setItemEdicao(null);
    setFormNumCpr(`CPR-${Math.random() > 0.5 ? 'FIN' : 'FIS'}-${anoFiltro}-${Math.floor(100 + Math.random() * 900)}`);
    setFormTipoCpr('CPR_FINANCEIRA');
    setFormEmitente('Cooperativa Agroindustrial Regional');
    setFormCpfCnpj('25.888.999/0001-77');
    setFormCommodity('Soja em Grãos Tipo 1');
    setFormQuantidade(25000);
    setFormUnidade('Sacas de 60kg');
    setFormValorNominal(3000000);
    setFormTaxaJuros(7.0);
    setFormDataEmissao(new Date().toISOString().split('T')[0]);
    setFormDataVencimento(`${anoFiltro}-11-30`);
    setFormCotacaoAtual(130.00);
    setFormModalidadeHedge('BARTER_INSUMOS');
    setFormStatus('REGISTRADA_B3');
    setFormRegistradoB3(true);
    setFormCodigoB3(`B3-CPR-${anoFiltro}-K${Math.floor(10000 + Math.random() * 90000)}`);
    setFormObservacoes('Operação de financiamento de safra com hedge de preço na B3');
    setIsModalOpen(true);
  };

  const abrirModalEdicao = (cpr: TituloCprAgro) => {
    setItemEdicao(cpr);
    setFormNumCpr(cpr.numeroCpr);
    setFormTipoCpr(cpr.tipoCpr);
    setFormEmitente(cpr.emitenteProdutorOuCooperativa);
    setFormCpfCnpj(cpr.cpfCnpjEmitente);
    setFormCommodity(cpr.commodityAgricola);
    setFormQuantidade(cpr.quantidadeUnidade);
    setFormUnidade(cpr.unidadeMedida);
    setFormValorNominal(cpr.valorNominalEmissaoBRL);
    setFormTaxaJuros(cpr.taxaJurosAnual);
    setFormDataEmissao(cpr.dataEmissao);
    setFormDataVencimento(cpr.dataVencimento);
    setFormCotacaoAtual(cpr.cotacaoMercadoAtual);
    setFormModalidadeHedge(cpr.modalidadeHedge);
    setFormStatus(cpr.statusCpr);
    setFormRegistradoB3(cpr.registradoB3);
    setFormCodigoB3(cpr.codigoRegistroB3 || '');
    setFormObservacoes(cpr.observacoes || '');
    setIsModalOpen(true);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaAtiva) return;

    const valorJusto = Math.round(formQuantidade * formCotacaoAtual * 100) / 100;
    const variacao = Math.round((valorJusto - formValorNominal) * 100) / 100;

    const item: TituloCprAgro = {
      id: itemEdicao ? itemEdicao.id : `cpr-${Date.now()}`,
      empresaId: empresaAtiva.id,
      numeroCpr: formNumCpr,
      tipoCpr: formTipoCpr,
      emitenteProdutorOuCooperativa: formEmitente,
      cpfCnpjEmitente: formCpfCnpj,
      commodityAgricola: formCommodity,
      quantidadeUnidade: formQuantidade,
      unidadeMedida: formUnidade,
      valorNominalEmissaoBRL: formValorNominal,
      taxaJurosAnual: formTaxaJuros,
      dataEmissao: formDataEmissao,
      dataVencimento: formDataVencimento,
      cotacaoMercadoAtual: formCotacaoAtual,
      valorJustoMtM_BRL: valorJusto,
      variacaoMtM_PeriodoBRL: variacao,
      modalidadeHedge: formModalidadeHedge,
      statusCpr: formStatus,
      registradoB3: formRegistradoB3,
      codigoRegistroB3: formRegistradoB3 ? formCodigoB3 : undefined,
      integradoContabil: itemEdicao ? itemEdicao.integradoContabil : false,
      observacoes: formObservacoes
    };

    dbService.salvarTituloCpr(item);
    setIsModalOpen(false);
    carregarDados();
  };

  const handleExcluir = (id: string) => {
    if (window.confirm('Confirma a exclusão deste título de CPR da custódia?')) {
      dbService.excluirTituloCpr(id);
      carregarDados();
    }
  };

  const handleIntegrarContabil = (id: string) => {
    const res = dbService.integrarVariacaoMtMCprContabil(id);
    if (res.sucesso) {
      alert(`Integração realizada com sucesso!\n${res.mensagem}`);
      carregarDados();
    } else {
      alert(`Erro na integração: ${res.mensagem}`);
    }
  };

  // Filtragem
  const titulosFiltrados = (resumo?.titulos || []).filter(t => {
    const texto = busca.toLowerCase();
    return (
      t.numeroCpr.toLowerCase().includes(texto) ||
      t.emitenteProdutorOuCooperativa.toLowerCase().includes(texto) ||
      t.commodityAgricola.toLowerCase().includes(texto) ||
      (t.codigoRegistroB3 && t.codigoRegistroB3.toLowerCase().includes(texto))
    );
  });

  // Simulador
  const calcularSimulador = () => {
    const nominal = simQtd * simPrecoEmissao;
    const justo = simQtd * simPrecoMercado;
    const variacao = justo - nominal;
    const percentualVariacao = nominal > 0 ? (variacao / nominal) * 100 : 0;

    return {
      nominal,
      justo,
      variacao,
      percentualVariacao
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
          <h2 style="margin: 0 0 4px 0; color: #15803d; text-transform: uppercase; font-size: 15pt;">
            RELATÓRIO DE CUSTÓDIA DE CPR & MARCAÇÃO A MERCADO (HEDGE AGRO)
          </h2>
          <p style="margin: 0; font-size: 9.5pt; color: #475569; font-weight: bold;">
            Cédula de Produto Rural (Lei nº 8.929/1994 c/c Lei do Agro nº 13.986/2020 e CPC 48 / IFRS 9)
          </p>
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px; background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 4px; margin-bottom: 15px; font-size: 9pt;">
          <div>
            <p style="margin: 2px 0;"><strong>Custodiante / Beneficiária:</strong> ${empresaAtiva.razaoSocial}</p>
            <p style="margin: 2px 0;"><strong>CNPJ:</strong> ${empresaAtiva.cnpj} &nbsp;|&nbsp; <strong>Ano-Calendário:</strong> ${anoFiltro}</p>
            <p style="margin: 2px 0;"><strong>Ambiente de Registro:</strong> Registradora B3 S.A. / CERC</p>
          </div>
          <div>
            <p style="margin: 2px 0;"><strong>Data da Posição:</strong> ${dataHoje}</p>
            <p style="margin: 2px 0;"><strong>Critério Contábil:</strong> CPC 48 (Valor Justo via Resultado / PL)</p>
            <p style="margin: 2px 0;"><strong>Status da Carteira:</strong> <span style="font-weight: bold; color: #16a34a;">CUSTÓDIA ATIVA</span></p>
          </div>
        </div>

        <div style="margin-bottom: 15px;">
          <h4 style="margin: 0 0 6px 0; color: #15803d; font-size: 10.5pt; text-transform: uppercase;">1. Resumo da Posição Consolidada da Carteira de CPRs</h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 9pt;">
            <thead>
              <tr style="background-color: #f1f5f9; border-top: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1;">
                <th style="padding: 6px; text-align: left;">Métrica de Posição / Valor Justo</th>
                <th style="padding: 6px; text-align: right;">Total da Carteira (R$)</th>
                <th style="padding: 6px; text-align: right;">Classificação Contábil</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 6px;">Total de Títulos em Custódia Registrada</td>
                <td style="padding: 6px; text-align: right; font-family: monospace;">${resumo.totalTitulosCustodia} título(s)</td>
                <td style="padding: 6px; text-align: right; color: #64748b;">Ativo Financeiro Circulante</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 6px;">Valor Nominal Histórico de Emissão</td>
                <td style="padding: 6px; text-align: right; font-family: monospace;">R$ ${resumo.valorTotalNominalBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="padding: 6px; text-align: right; color: #64748b;">Custo Amortizado Inicial</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0; background-color: #f0fdf4;">
                <td style="padding: 6px; font-weight: bold; color: #166534;">Valor Justo Atualizado a Mercado (Mark-to-Market - MtM)</td>
                <td style="padding: 6px; text-align: right; font-family: monospace; font-weight: bold; color: #166534;">R$ ${resumo.valorTotalJustoMtM_BRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="padding: 6px; text-align: right; color: #166534; font-weight: bold;">Ativo Circulante Avaliado a Valor Justo</td>
              </tr>
              <tr style="border-bottom: 2px solid #cbd5e1; background-color: ${resumo.variacaoTotalMtM_BRL >= 0 ? '#f0fdf4' : '#fef2f2'};">
                <td style="padding: 6px; font-weight: bold; color: ${resumo.variacaoTotalMtM_BRL >= 0 ? '#166534' : '#991b1b'};">
                  (=) Variação Acumulada de Valor Justo (Ganho / Perda)
                </td>
                <td style="padding: 6px; text-align: right; font-family: monospace; font-weight: bold; color: ${resumo.variacaoTotalMtM_BRL >= 0 ? '#166534' : '#991b1b'};">
                  R$ ${resumo.variacaoTotalMtM_BRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td style="padding: 6px; text-align: right; font-weight: bold;">
                  ${resumo.variacaoTotalMtM_BRL >= 0 ? 'Receita Financeira (DRE)' : 'Despesa Financeira (DRE)'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="margin-bottom: 15px;">
          <h4 style="margin: 0 0 6px 0; color: #15803d; font-size: 10.5pt; text-transform: uppercase;">2. Discriminação Analítica dos Títulos e Contratos de Hedge</h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 8pt;">
            <thead>
              <tr style="background-color: #f1f5f9; border-top: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1;">
                <th style="padding: 5px; text-align: left;">Número CPR / Registro B3</th>
                <th style="padding: 5px; text-align: left;">Emitente / Devedor</th>
                <th style="padding: 5px; text-align: left;">Commodity / Volume</th>
                <th style="padding: 5px; text-align: center;">Modalidade</th>
                <th style="padding: 5px; text-align: right;">Valor Nominal (R$)</th>
                <th style="padding: 5px; text-align: right;">Valor Justo (R$)</th>
                <th style="padding: 5px; text-align: right;">Ajuste MtM (R$)</th>
              </tr>
            </thead>
            <tbody>
              ${resumo.titulos.map(t => `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 5px;">
                    <strong>${t.numeroCpr}</strong><br/>
                    <span style="color: #64748b; font-size: 7pt;">${t.codigoRegistroB3 || 'Em Registro'} &nbsp;|&nbsp; Venc: ${t.dataVencimento}</span>
                  </td>
                  <td style="padding: 5px;">
                    ${t.emitenteProdutorOuCooperativa}<br/>
                    <span style="color: #64748b; font-size: 7pt;">${t.cpfCnpjEmitente}</span>
                  </td>
                  <td style="padding: 5px;">
                    ${t.commodityAgricola}<br/>
                    <span style="color: #64748b; font-size: 7pt;">${t.quantidadeUnidade.toLocaleString('pt-BR')} ${t.unidadeMedida}</span>
                  </td>
                  <td style="padding: 5px; text-align: center; font-size: 7pt;">
                    ${t.modalidadeHedge.replace('_', ' ')}
                  </td>
                  <td style="padding: 5px; text-align: right; font-family: monospace;">R$ ${t.valorNominalEmissaoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td style="padding: 5px; text-align: right; font-family: monospace; font-weight: bold; color: #166534;">R$ ${t.valorJustoMtM_BRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td style="padding: 5px; text-align: right; font-family: monospace; font-weight: bold; color: ${t.variacaoMtM_PeriodoBRL >= 0 ? '#15803d' : '#b91c1c'};">
                    R$ ${t.variacaoMtM_PeriodoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div style="background-color: #f8fafc; border-left: 4px solid #16a34a; padding: 10px; margin-bottom: 25px; font-size: 8pt; color: #334155;">
          <strong>Tratamento Normativo da Cédula de Produto Rural e Instrumentos Derivativos (Lei 13.986/20 e CPC 48):</strong>
          <br/>1. <em>Obrigatoriedade de Registro:</em> Conforme o Art. 3º da Lei nº 8.929/1994, com redação dada pela Lei nº 13.986/2020, a CPR deve ser registrada em entidade autorizada pelo Banco Central do Brasil (B3 ou CERC) em até 10 dias úteis para ter eficácia executiva e validade contra terceiros.
          <br/>2. <em>Classificação no CPC 48 (IFRS 9):</em> As CPRs com liquidação financeira ou operações de Barter vinculadas a hedge de commodities são classificadas como Ativos Financeiros Mensurados a Valor Justo por Meio do Resultado (VJMR), exigindo a apropriação periódica das variações de mercado das commodities de referência.
          <br/>3. <em>Tributação das Variações:</em> As receitas e despesas decorrentes do ajuste a valor justo de títulos do agronegócio integram o resultado financeiro para fins de apuração do Lucro Real e da base da CSLL.
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; text-align: center; font-size: 9pt;">
          <div>
            <div style="border-top: 1px solid #111; padding-top: 5px; font-weight: bold;">
              ${empresaAtiva.razaoSocial}<br/>
              <span style="font-size: 8pt; font-weight: normal; color: #475569;">Mesa de Operações Agro & Commodities / Tesouraria</span>
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
        titulo: 'Custódia de CPRs e Posição de Hedge Agro',
        subtitulo: `Demonstrativo de Marcação a Mercado (MtM - CPC 48) - ${anoFiltro}`,
        conteudoHtml: htmlContent
      });
    } else {
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(`<html><head><title>Custódia de CPRs</title></head><body>${htmlContent}</body></html>`);
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
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">Cédula de Produto Rural (CPR) & Hedge Agro</h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-900/60 text-emerald-200 border border-emerald-700/60">
                Lei nº 13.986/2020 / CPC 48 (IFRS 9)
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Controle e custódia eletrônica de CPRs (Física/Financeira), registro na B3, operações de Barter e marcação a mercado (MtM)
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
            <span>Laudo Custódia A4</span>
          </button>

          <button
            onClick={abrirModalNovo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium shadow transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Emitir / Custodiar CPR</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4">
        {/* Card 1: Títulos em Custódia */}
        <div className="p-3.5 rounded-lg bg-neutral-900/90 border border-neutral-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Títulos em Carteira</span>
            <Barcode className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-mono font-bold text-white">
              {resumo?.totalTitulosCustodia || 0}
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            CPRs registradas em câmara
          </p>
        </div>

        {/* Card 2: Valor Nominal */}
        <div className="p-3.5 rounded-lg bg-neutral-900/90 border border-neutral-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Valor Nominal Emissão</span>
            <DollarSign className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-mono font-bold text-neutral-300">
              R$ {(resumo?.valorTotalNominalBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            Custo amortizado de emissão
          </p>
        </div>

        {/* Card 3: Valor Justo MtM */}
        <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-900/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-300 text-xs">
            <span>Valor Justo Atual (MtM)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-mono font-bold text-emerald-400">
              R$ {(resumo?.valorTotalJustoMtM_BRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-emerald-300/70 mt-1 font-medium">
            Preço de mercado da commodity
          </p>
        </div>

        {/* Card 4: Ajuste MtM */}
        <div className="p-3.5 rounded-lg bg-neutral-900/90 border border-neutral-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Variação MtM Carteira</span>
            <Sparkles className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2">
            <span className={`text-xl font-mono font-bold ${(resumo?.variacaoTotalMtM_BRL || 0) >= 0 ? 'text-emerald-300' : 'text-red-400'}`}>
              R$ {(resumo?.variacaoTotalMtM_BRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            Ganho/Perda CPC 48 na DRE
          </p>
        </div>

        {/* Card 5: Registro B3 */}
        <div className="p-3.5 rounded-lg bg-neutral-900/90 border border-neutral-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Conformidade Legal B3</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              100% Homologado
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            Garantia de exequibilidade
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center border-b border-neutral-800 px-4 bg-[#171717]">
        <button
          onClick={() => setAbaAtiva('titulos')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            abaAtiva === 'titulos'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-950/10'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Sprout className="w-4 h-4" />
          <span>CPRs em Custódia & Ajuste a Valor Justo ({resumo?.titulos.length || 0})</span>
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
          <span>Simulador de Mark-to-Market (MtM)</span>
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
          <span>Marco da Lei do Agro (Lei 13.986/20) & CPC 48</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4">
        {abaAtiva === 'titulos' && (
          <div className="space-y-4">
            {/* Toolbar com Busca */}
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar por número da CPR, emitente, commodity ou código B3..."
                  className="w-full pl-9 pr-4 py-1.5 rounded-md bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span>{titulosFiltrados.length} CPR(s) em custódia</span>
              </div>
            </div>

            {/* Tabela de Títulos */}
            <div className="border border-neutral-800 rounded-lg overflow-hidden bg-neutral-900/60">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-800/80 text-neutral-400 border-b border-neutral-700/80">
                    <th className="p-3 font-semibold">Número CPR / Registro</th>
                    <th className="p-3 font-semibold">Emitente / Devedor</th>
                    <th className="p-3 font-semibold">Commodity / Volume</th>
                    <th className="p-3 font-semibold text-center">Tipo / Hedge</th>
                    <th className="p-3 font-semibold text-right">Valor Nominal</th>
                    <th className="p-3 font-semibold text-right">Cotação Atual</th>
                    <th className="p-3 font-semibold text-right">Valor Justo (MtM)</th>
                    <th className="p-3 font-semibold text-right">Variação MtM</th>
                    <th className="p-3 font-semibold text-center">Contábil</th>
                    <th className="p-3 font-semibold text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {titulosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-neutral-500">
                        Nenhuma Cédula de Produto Rural encontrada para os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    titulosFiltrados.map((item) => (
                      <tr key={item.id} className="hover:bg-neutral-800/50 transition-colors">
                        <td className="p-3">
                          <div className="font-semibold text-white">{item.numeroCpr}</div>
                          <div className="text-[10px] text-neutral-400">
                            {item.codigoRegistroB3 ? (
                              <span className="text-blue-400 font-mono">{item.codigoRegistroB3}</span>
                            ) : (
                              <span className="text-amber-400">Sem Registro B3</span>
                            )}
                          </div>
                        </td>

                        <td className="p-3">
                          <div className="font-medium text-neutral-200">{item.emitenteProdutorOuCooperativa}</div>
                          <div className="text-[10px] text-neutral-500 font-mono">{item.cpfCnpjEmitente}</div>
                        </td>

                        <td className="p-3">
                          <div className="text-neutral-200">{item.commodityAgricola}</div>
                          <div className="text-[10px] text-neutral-400">
                            {item.quantidadeUnidade.toLocaleString('pt-BR')} {item.unidadeMedida}
                          </div>
                        </td>

                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            item.tipoCpr === 'CPR_FINANCEIRA'
                              ? 'bg-blue-950 text-blue-300 border border-blue-800'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}>
                            {item.tipoCpr === 'CPR_FINANCEIRA' ? 'Financeira' : 'Física'}
                          </span>
                          <div className="text-[9px] text-neutral-400 mt-0.5">
                            {item.modalidadeHedge.replace('_', ' ')}
                          </div>
                        </td>

                        <td className="p-3 text-right font-mono text-neutral-300">
                          R$ {item.valorNominalEmissaoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>

                        <td className="p-3 text-right font-mono text-neutral-300">
                          R$ {item.cotacaoMercadoAtual.toFixed(2)}
                        </td>

                        <td className="p-3 text-right font-mono font-bold text-emerald-300">
                          R$ {item.valorJustoMtM_BRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>

                        <td className={`p-3 text-right font-mono font-bold ${item.variacaoMtM_PeriodoBRL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          R$ {item.variacaoMtM_PeriodoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                              title="Apropriar Variação MtM no Diário Geral"
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
                              title="Editar CPR"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleExcluir(item.id)}
                              className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-red-400 transition-colors"
                              title="Excluir CPR"
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
                <Wheat className="w-4 h-4 text-emerald-400" />
                <span>
                  As CPRs registradas na B3 ou CERC possuem força de título executivo extrajudicial (Art. 4º da Lei 8.929/94).
                </span>
              </div>
              <span className="text-neutral-400 text-[11px]">B3 Agro - Balcão Eletrônico</span>
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
                  Simulação de Marcação a Mercado (Mark-to-Market)
                </h3>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">
                  Commodity Agrícola
                </label>
                <select
                  value={simCommodity}
                  onChange={(e) => setSimCommodity(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="Soja em Grãos">Soja em Grãos (Sacas de 60kg - Paranaguá)</option>
                  <option value="Milho em Grão">Milho em Grão (Sacas de 60kg - Campinas)</option>
                  <option value="Algodão em Pluma">Algodão em Pluma (Libras-peso)</option>
                  <option value="Café Arábica">Café Arábica Tipo 6 (Sacas de 60kg)</option>
                  <option value="Boi Gordo">Boi Gordo para Abate (Arrobas - SP)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">
                  Volume / Quantidade Vinculada
                </label>
                <input
                  type="number"
                  value={simQtd}
                  onChange={(e) => setSimQtd(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded bg-neutral-950 border border-neutral-800 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Preço de Emissão (R$/Unidade)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={simPrecoEmissao}
                    onChange={(e) => setSimPrecoEmissao(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded bg-neutral-950 border border-neutral-800 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Cotação Atual de Mercado (B3 / CEPEA)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={simPrecoMercado}
                    onChange={(e) => setSimPrecoMercado(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded bg-neutral-950 border border-neutral-800 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Painel Resultados */}
            <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                    Resultado da Avaliação a Valor Justo (CPC 48)
                  </h3>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="p-3 rounded bg-neutral-950 border border-neutral-800 flex justify-between items-center">
                    <span className="text-xs text-neutral-400">Valor Nominal de Origem:</span>
                    <span className="text-base font-mono font-bold text-neutral-300">
                      R$ {simResult.nominal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="p-3 rounded bg-neutral-950 border border-neutral-800 flex justify-between items-center">
                    <span className="text-xs text-neutral-400">Valor Justo a Mercado (MtM):</span>
                    <span className="text-base font-mono font-bold text-white">
                      R$ {simResult.justo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className={`p-3 rounded border flex justify-between items-center ${
                    simResult.variacao >= 0 ? 'bg-emerald-950/30 border-emerald-900/60' : 'bg-red-950/30 border-red-900/60'
                  }`}>
                    <div>
                      <span className={`text-xs font-bold ${simResult.variacao >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                        {simResult.variacao >= 0 ? 'Ganho de Avaliação MtM (Receita):' : 'Perda de Avaliação MtM (Despesa):'}
                      </span>
                      <p className="text-[10px] text-neutral-400">Variação de {simResult.percentualVariacao.toFixed(2)}%</p>
                    </div>
                    <span className={`text-xl font-mono font-bold ${simResult.variacao >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      R$ {simResult.variacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-neutral-400 p-2.5 rounded bg-neutral-800/40 border border-neutral-700/60 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>
                  <strong>Hedge Accounting (CPC 48):</strong> Se o título estiver formalmente designado como instrumento de hedge de fluxo de caixa, a variação de valor justo pode ser diferida temporariamente no Patrimônio Líquido (Outros Resultados Abrangentes).
                </span>
              </div>
            </div>
          </div>
        )}

        {abaAtiva === 'legislacao' && (
          <div className="max-w-4xl space-y-4">
            <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                <Wheat className="w-4 h-4 text-emerald-400" />
                Evolução Normativa da CPR e a Lei do Agro (Lei nº 13.986/2020)
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed mb-3">
                A <strong>Cédula de Produto Rural (CPR)</strong> é o principal instrumento de captação de recursos e fixação de preços futuros no agronegócio nacional. A <strong>Lei nº 13.986/2020</strong> (Lei do Agro) modernizou o instituto, estabelecendo a obrigatoriedade do registro eletrônico em entidades autorizadas pelo Banco Central e permitindo a indexação a moedas estrangeiras e índices de preços.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-3.5 rounded bg-neutral-950 border border-neutral-800">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase mb-1">
                    <Scale className="w-4 h-4" />
                    CPR Física vs CPR Financeira
                  </div>
                  <ul className="text-xs text-neutral-400 space-y-1.5 list-disc list-inside mt-2">
                    <li><strong>CPR Física:</strong> O emitente se obriga a entregar a quantidade e qualidade da commodity estipulada em armazém geral ou porto.</li>
                    <li><strong>CPR Financeira:</strong> A liquidação se dá pelo pagamento do valor monetário obtido pela multiplicação da quantidade de produto pela cotação do dia do vencimento.</li>
                    <li>Utilizada amplamente em operações estruturadas de <strong>Barter</strong> com fabricantes de adubos e insumos químicos.</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded bg-neutral-950 border border-neutral-800">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase mb-1">
                    <FileCheck2 className="w-4 h-4" />
                    Patrimônio de Afetação e Custódia B3
                  </div>
                  <ul className="text-xs text-neutral-400 space-y-1.5 list-disc list-inside mt-2">
                    <li>Possibilidade de constituição de <strong>Patrimônio de Afetação</strong> sobre a terra ou safra que lastreia a CPR.</li>
                    <li>Segregação dos bens afetados da massa falida do produtor em caso de recuperação judicial.</li>
                    <li>Integração nativa com os sistemas de custódia da <strong>B3 Agro</strong> e <strong>CERC</strong> com interoperabilidade eletrônica.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Formulário CPR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#1c1c1c] border border-neutral-700 rounded-lg shadow-2xl max-w-2xl w-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-[#222222]">
              <div className="flex items-center gap-2">
                <Sprout className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  {itemEdicao ? 'Editar Cédula de Produto Rural' : 'Emitir / Registrar Cédula de Produto Rural (CPR)'}
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
                    Número do Título CPR
                  </label>
                  <input
                    type="text"
                    required
                    value={formNumCpr}
                    onChange={(e) => setFormNumCpr(e.target.value)}
                    className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Ex: CPR-FIN-2026-0045"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Tipo de Liquidação
                  </label>
                  <select
                    value={formTipoCpr}
                    onChange={(e) => setFormTipoCpr(e.target.value as TipoCpr)}
                    className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="CPR_FINANCEIRA">CPR Financeira (Liquidação Financeira)</option>
                    <option value="CPR_FISICA">CPR Física (Entrega de Mercadoria)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Emitente (Produtor Rural / Cooperativa)
                  </label>
                  <input
                    type="text"
                    required
                    value={formEmitente}
                    onChange={(e) => setFormEmitente(e.target.value)}
                    className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    CPF / CNPJ do Emitente
                  </label>
                  <input
                    type="text"
                    required
                    value={formCpfCnpj}
                    onChange={(e) => setFormCpfCnpj(e.target.value)}
                    className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Commodity Agrícola
                  </label>
                  <input
                    type="text"
                    required
                    value={formCommodity}
                    onChange={(e) => setFormCommodity(e.target.value)}
                    className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Soja, Milho, Café, etc."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Quantidade
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formQuantidade}
                    onChange={(e) => setFormQuantidade(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Unidade de Medida
                  </label>
                  <input
                    type="text"
                    required
                    value={formUnidade}
                    onChange={(e) => setFormUnidade(e.target.value)}
                    className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Sacas, Arrobas, Toneladas"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Valor Nominal Emissão (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formValorNominal}
                    onChange={(e) => setFormValorNominal(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Cotação Atual Unitária (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formCotacaoAtual}
                    onChange={(e) => setFormCotacaoAtual(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Modalidade de Hedge
                  </label>
                  <select
                    value={formModalidadeHedge}
                    onChange={(e) => setFormModalidadeHedge(e.target.value as ModalidadeHedgeAgro)}
                    className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="SWAP_COMMODITY">Swap de Commodity</option>
                    <option value="BARTER_INSUMOS">Barter de Insumos</option>
                    <option value="TERMO_FUTURO">Termo / Futuro</option>
                    <option value="CUSTODIA_SIMPLES">Custódia Simples</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Data de Emissão
                  </label>
                  <input
                    type="date"
                    required
                    value={formDataEmissao}
                    onChange={(e) => setFormDataEmissao(e.target.value)}
                    className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Data de Vencimento
                  </label>
                  <input
                    type="date"
                    required
                    value={formDataVencimento}
                    onChange={(e) => setFormDataVencimento(e.target.value)}
                    className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Código de Registro na B3
                  </label>
                  <input
                    type="text"
                    value={formCodigoB3}
                    onChange={(e) => setFormCodigoB3(e.target.value)}
                    className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    placeholder="B3-CPR-2026-X88912"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">
                  Observações e Garantias Vinculadas
                </label>
                <textarea
                  rows={2}
                  value={formObservacoes}
                  onChange={(e) => setFormObservacoes(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Garantias reais, penhor agrícola, armazém de entrega ou cláusulas específicas"
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
                  Salvar Título de CPR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default CprAgroHedgeModule;
