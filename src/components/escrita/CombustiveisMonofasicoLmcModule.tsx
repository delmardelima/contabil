import React, { useState, useEffect } from 'react';
import {
  Fuel,
  Plus,
  RefreshCw,
  Printer,
  TrendingDown,
  Droplets,
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
  Gauge
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  Empresa,
  ItemMovimentoLmc,
  ResumoLmcCombustiveis,
  TipoCombustivelMonofasico,
  UnidadeMedidaCombustivel
} from '../../types/contabil';

interface CombustiveisMonofasicoLmcModuleProps {
  empresaAtiva: Empresa | null;
  onOpenReportPreview?: (config: {
    titulo: string;
    subtitulo: string;
    conteudoHtml: string;
    imprimirDireto?: boolean;
  }) => void;
}

export const CombustiveisMonofasicoLmcModule: React.FC<CombustiveisMonofasicoLmcModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [resumo, setResumo] = useState<ResumoLmcCombustiveis | null>(null);
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');
  const [dataAtiva, setDataAtiva] = useState('2026-03-31');
  const [abaAtiva, setAbaAtiva] = useState<'lmc' | 'simulador' | 'legislacao'>('lmc');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemMovimentoLmc | null>(null);

  // Form Fields
  const [numeroTanque, setNumeroTanque] = useState<number>(1);
  const [tipoCombustivel, setTipoCombustivel] = useState<TipoCombustivelMonofasico>('GASOLINA_C');
  const [unidadeMedida, setUnidadeMedida] = useState<UnidadeMedidaCombustivel>('LITROS');
  const [estoqueAbertura, setEstoqueAbertura] = useState<number>(15000);
  const [volumeRecebidoNotasFiscais, setVolumeRecebidoNotasFiscais] = useState<number>(10000);
  const [volumeVendidoEncerrantesBicos, setVolumeVendidoEncerrantesBicos] = useState<number>(8500);
  const [estoqueFisicoMedicaoRegua, setEstoqueFisicoMedicaoRegua] = useState<number>(16480);
  const [aliquotaIcmsAdRemPorLitro, setAliquotaIcmsAdRemPorLitro] = useState<number>(1.37);
  const [observacoes, setObservacoes] = useState('');

  // Simulador State
  const [simAbertura, setSimAbertura] = useState<number>(20000);
  const [simEntradas, setSimEntradas] = useState<number>(15000);
  const [simVendas, setSimVendas] = useState<number>(12000);
  const [simRegua, setSimRegua] = useState<number>(22930);
  const [simAliqAdRem, setSimAliqAdRem] = useState<number>(1.37);

  const carregarDados = () => {
    if (!empresaAtiva) return;
    const res = dbService.getResumoLmcCombustiveis(empresaAtiva.id, dataAtiva);
    setResumo(res);
  };

  useEffect(() => {
    carregarDados();
  }, [empresaAtiva, dataAtiva]);

  // Alíquotas Ad Rem de referência (Convênio ICMS 15/2023)
  const handleMudarTipoCombustivel = (tipo: TipoCombustivelMonofasico) => {
    setTipoCombustivel(tipo);
    if (tipo === 'GASOLINA_C') {
      setAliquotaIcmsAdRemPorLitro(1.37);
    } else if (tipo === 'OLEO_DIESEL_S10' || tipo === 'OLEO_DIESEL_S500' || tipo === 'BIODIESEL_B100') {
      setAliquotaIcmsAdRemPorLitro(1.06);
    } else if (tipo === 'GLP_GAS_COZINHA') {
      setAliquotaIcmsAdRemPorLitro(1.4139);
      setUnidadeMedida('QUILOGRAMAS');
    } else {
      setAliquotaIcmsAdRemPorLitro(0.0);
    }
  };

  const handleOpenNovo = () => {
    setEditingItem(null);
    setNumeroTanque((resumo?.tanques.length || 0) + 1);
    handleMudarTipoCombustivel('GASOLINA_C');
    setEstoqueAbertura(15000);
    setVolumeRecebidoNotasFiscais(10000);
    setVolumeVendidoEncerrantesBicos(8500);
    setEstoqueFisicoMedicaoRegua(16480);
    setObservacoes('');
    setIsModalOpen(true);
  };

  const handleOpenEditar = (item: ItemMovimentoLmc) => {
    setEditingItem(item);
    setNumeroTanque(item.numeroTanque);
    setTipoCombustivel(item.tipoCombustivel);
    setUnidadeMedida(item.unidadeMedida);
    setEstoqueAbertura(item.estoqueAbertura);
    setVolumeRecebidoNotasFiscais(item.volumeRecebidoNotasFiscais);
    setVolumeVendidoEncerrantesBicos(item.volumeVendidoEncerrantesBicos);
    setEstoqueFisicoMedicaoRegua(item.estoqueFisicoMedicaoRegua);
    setAliquotaIcmsAdRemPorLitro(item.aliquotaIcmsAdRemPorLitro);
    setObservacoes(item.observacoes || '');
    setIsModalOpen(true);
  };

  const handleSalvarItem = () => {
    if (!empresaAtiva) return;

    const escritural = estoqueAbertura + volumeRecebidoNotasFiscais - volumeVendidoEncerrantesBicos;
    const diferenca = estoqueFisicoMedicaoRegua - escritural;
    const baseTotal = estoqueAbertura + volumeRecebidoNotasFiscais;
    const percPerda = baseTotal > 0 ? Math.round((Math.abs(diferenca) / baseTotal) * 10000) / 100 : 0;
    const toleranciaOk = percPerda <= 0.60;
    const icmsTotal = Math.round(volumeVendidoEncerrantesBicos * aliquotaIcmsAdRemPorLitro * 100) / 100;

    const item: ItemMovimentoLmc = {
      id: editingItem ? editingItem.id : Date.now(),
      empresaId: empresaAtiva.id,
      dataMovimento: dataAtiva,
      numeroTanque,
      tipoCombustivel,
      unidadeMedida,
      estoqueAbertura,
      volumeRecebidoNotasFiscais,
      volumeVendidoEncerrantesBicos,
      estoqueEscrituralFechamento: escritural,
      estoqueFisicoMedicaoRegua,
      diferencaVolumetricaSobraOuPerda: diferenca,
      percentualPerda: percPerda,
      toleranciaLegalAtendida: toleranciaOk,
      aliquotaIcmsAdRemPorLitro,
      valorIcmsAdRemMonofasico: icmsTotal,
      cstPisCofinsMonofasico: '04',
      integradoContabil: editingItem ? editingItem.integradoContabil : false,
      observacoes
    };

    dbService.salvarMovimentoLmc(item);
    setIsModalOpen(false);
    carregarDados();
  };

  const handleExcluir = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta movimentação de tanque?')) {
      dbService.excluirMovimentoLmc(id);
      carregarDados();
    }
  };

  const handleIntegrarContabil = (id: number) => {
    const res = dbService.integrarMovimentoLmcContabil(id);
    if (res.sucesso) {
      alert(res.mensagem);
      carregarDados();
    } else {
      alert(`Falha: ${res.mensagem}`);
    }
  };

  // Cálculo ao vivo do Modal
  const modalEscritural = estoqueAbertura + volumeRecebidoNotasFiscais - volumeVendidoEncerrantesBicos;
  const modalDiferenca = estoqueFisicoMedicaoRegua - modalEscritural;
  const modalBase = estoqueAbertura + volumeRecebidoNotasFiscais;
  const modalPerc = modalBase > 0 ? (Math.abs(modalDiferenca) / modalBase) * 100 : 0;
  const modalToleranciaOk = modalPerc <= 0.60;
  const modalIcmsAdRem = volumeVendidoEncerrantesBicos * aliquotaIcmsAdRemPorLitro;

  // Filtragem
  const tanquesFiltrados = (resumo?.tanques || []).filter(item => {
    const matchBusca =
      item.tipoCombustivel.toLowerCase().includes(busca.toLowerCase()) ||
      `tanque ${item.numeroTanque}`.toLowerCase().includes(busca.toLowerCase()) ||
      (item.observacoes && item.observacoes.toLowerCase().includes(busca.toLowerCase()));
    const matchTipo = filtroTipo === 'TODOS' || item.tipoCombustivel === filtroTipo;
    return matchBusca && matchTipo;
  });

  const getNomeCombustivel = (tipo: TipoCombustivelMonofasico) => {
    switch (tipo) {
      case 'GASOLINA_C': return 'Gasolina Comum C';
      case 'OLEO_DIESEL_S10': return 'Óleo Diesel B S10';
      case 'OLEO_DIESEL_S500': return 'Óleo Diesel B S500';
      case 'ETANOL_HIDRATADO': return 'Etanol Hidratado Comum';
      case 'GLP_GAS_COZINHA': return 'GLP (Gás Liquefeito Petróleo)';
      case 'BIODIESEL_B100': return 'Biodiesel Puro B100';
      default: return tipo;
    }
  };

  const formatarMoeda = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatarLitros = (val: number, unidade: string = 'L') => {
    return `${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val)} ${unidade}`;
  };

  // Geração de Relatório Oficial do LMC (Portaria ANP 26/1992)
  const handleImprimirLmcA4 = () => {
    if (!empresaAtiva || !resumo) return;

    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; padding: 25px; max-width: 950px; margin: 0 auto; line-height: 1.4;">
        <!-- CABEÇALHO OFICIAL ANP -->
        <div style="border-bottom: 3px double #0f172a; padding-bottom: 15px; margin-bottom: 20px; text-align: center;">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: bold;">
            AGÊNCIA NACIONAL DO PETRÓLEO, GÁS NATURAL E BIOCOMBUSTÍVEIS - ANP
          </div>
          <h1 style="font-size: 20px; margin: 5px 0; color: #0f172a; text-transform: uppercase; font-weight: 800;">
            LMC - LIVRO DE MOVIMENTAÇÃO DE COMBUSTÍVEIS
          </h1>
          <div style="font-size: 13px; font-weight: 600; color: #334155;">
            PORTARIA DNC/ANP Nº 26/1992 • CONTROLE VOLUMÉTRICO DIÁRIO & TRIBUTAÇÃO MONOFÁSICA AD REM
          </div>
        </div>

        <!-- DADOS DO ESTABELECIMENTO REVENDEDOR -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; background: #f8fafc; border: 1px solid #cbd5e1;">
          <tr>
            <td style="padding: 8px 12px; width: 60%;"><strong>Posto Revendedor:</strong> ${empresaAtiva.razaoSocial}</td>
            <td style="padding: 8px 12px; width: 40%;"><strong>CNPJ:</strong> ${empresaAtiva.cnpj || '00.000.000/0001-00'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px;"><strong>Inscrição Estadual:</strong> ${empresaAtiva.inscricaoEstadual || 'Isento / Declarada'}</td>
            <td style="padding: 8px 12px;"><strong>Data da Movimentação:</strong> ${dataAtiva}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px;" colspan="2">
              <strong>Regime Tributário:</strong> Monofásico ICMS Ad Rem (LC 192/2022) • PIS/COFINS CST 04 (Alíquota Zero no Varejo)
            </td>
          </tr>
        </table>

        <!-- RESUMO DIÁRIO POR TANQUE -->
        <h3 style="font-size: 14px; margin: 15px 0 10px 0; border-bottom: 1px solid #94a3b8; padding-bottom: 5px; color: #0f172a; text-transform: uppercase;">
          1. Movimentação Volumétrica dos Tanques e Conciliação Física vs Escritural
        </h3>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px;">
          <thead>
            <tr style="background: #1e293b; color: #ffffff;">
              <th style="padding: 8px; border: 1px solid #334155; text-align: center;">Tq</th>
              <th style="padding: 8px; border: 1px solid #334155; text-align: left;">Combustível</th>
              <th style="padding: 8px; border: 1px solid #334155; text-align: right;">Estoque Abertura</th>
              <th style="padding: 8px; border: 1px solid #334155; text-align: right;">Entradas (NF)</th>
              <th style="padding: 8px; border: 1px solid #334155; text-align: right;">Vendas (Bicos)</th>
              <th style="padding: 8px; border: 1px solid #334155; text-align: right;">Estoque Escritural</th>
              <th style="padding: 8px; border: 1px solid #334155; text-align: right;">Medição Régua</th>
              <th style="padding: 8px; border: 1px solid #334155; text-align: right;">Variação (L)</th>
              <th style="padding: 8px; border: 1px solid #334155; text-align: center;">% Perda</th>
              <th style="padding: 8px; border: 1px solid #334155; text-align: center;">Tolerância (≤0,6%)</th>
            </tr>
          </thead>
          <tbody>
            ${resumo.tanques.map(t => `
              <tr style="border-bottom: 1px solid #e2e8f0; background: ${t.toleranciaLegalAtendida ? '#ffffff' : '#fef2f2'};">
                <td style="padding: 7px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">T-${t.numeroTanque}</td>
                <td style="padding: 7px; border: 1px solid #cbd5e1;">${getNomeCombustivel(t.tipoCombustivel)}</td>
                <td style="padding: 7px; border: 1px solid #cbd5e1; text-align: right;">${t.estoqueAbertura.toLocaleString('pt-BR')} L</td>
                <td style="padding: 7px; border: 1px solid #cbd5e1; text-align: right;">${t.volumeRecebidoNotasFiscais.toLocaleString('pt-BR')} L</td>
                <td style="padding: 7px; border: 1px solid #cbd5e1; text-align: right; font-weight: 600;">${t.volumeVendidoEncerrantesBicos.toLocaleString('pt-BR')} L</td>
                <td style="padding: 7px; border: 1px solid #cbd5e1; text-align: right;">${t.estoqueEscrituralFechamento.toLocaleString('pt-BR')} L</td>
                <td style="padding: 7px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold;">${t.estoqueFisicoMedicaoRegua.toLocaleString('pt-BR')} L</td>
                <td style="padding: 7px; border: 1px solid #cbd5e1; text-align: right; color: ${t.diferencaVolumetricaSobraOuPerda < 0 ? '#b91c1c' : '#15803d'}; font-weight: bold;">
                  ${t.diferencaVolumetricaSobraOuPerda > 0 ? '+' : ''}${t.diferencaVolumetricaSobraOuPerda.toLocaleString('pt-BR')} L
                </td>
                <td style="padding: 7px; border: 1px solid #cbd5e1; text-align: center;">${t.percentualPerda.toFixed(2)}%</td>
                <td style="padding: 7px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: ${t.toleranciaLegalAtendida ? '#15803d' : '#b91c1c'};">
                  ${t.toleranciaLegalAtendida ? 'CONFORME' : 'ULTRAPASSOU LIMITE'}
                </td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style="background: #f1f5f9; font-weight: bold; border-top: 2px solid #64748b;">
              <td colspan="4" style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">TOTAIS CONSOLIDADOS DO DIA:</td>
              <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; color: #0f172a;">${resumo.totalVolumeVendidoLitros.toLocaleString('pt-BR')} L</td>
              <td colspan="2" style="padding: 8px; border: 1px solid #cbd5e1;"></td>
              <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; color: #b91c1c;">-${resumo.totalPerdasVolumeLitros.toLocaleString('pt-BR')} L</td>
              <td colspan="2" style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; color: ${resumo.conformidadeAnpGeral ? '#15803d' : '#b91c1c'};">
                ${resumo.conformidadeAnpGeral ? 'STATUS REGULAR (ANP 26/92)' : 'ATENÇÃO: PERDA SUPERIOR A 0,6%'}
              </td>
            </tr>
          </tfoot>
        </table>

        <!-- MEMORIAL DE TRIBUTAÇÃO MONOFÁSICA AD REM (LC 192/2022) -->
        <h3 style="font-size: 14px; margin: 15px 0 10px 0; border-bottom: 1px solid #94a3b8; padding-bottom: 5px; color: #0f172a; text-transform: uppercase;">
          2. Demonstração Tributária - ICMS Monofásico Ad Rem & PIS/COFINS Varejo
        </h3>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 11px;">
          <thead>
            <tr style="background: #334155; color: #ffffff;">
              <th style="padding: 7px; border: 1px solid #475569; text-align: left;">Combustível</th>
              <th style="padding: 7px; border: 1px solid #475569; text-align: right;">Volume Comercializado</th>
              <th style="padding: 7px; border: 1px solid #475569; text-align: right;">Alíquota ICMS Ad Rem</th>
              <th style="padding: 7px; border: 1px solid #475569; text-align: right;">ICMS Retido Refinaria</th>
              <th style="padding: 7px; border: 1px solid #475569; text-align: center;">CST PIS/COFINS</th>
              <th style="padding: 7px; border: 1px solid #475569; text-align: right;">PIS/COFINS Posto Varejo</th>
            </tr>
          </thead>
          <tbody>
            ${resumo.tanques.map(t => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 6px; border: 1px solid #cbd5e1;">${getNomeCombustivel(t.tipoCombustivel)}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: right;">${t.volumeVendidoEncerrantesBicos.toLocaleString('pt-BR')} L</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: right;">R$ ${t.aliquotaIcmsAdRemPorLitro.toFixed(4)} / L</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold;">R$ ${t.valorIcmsAdRemMonofasico.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">CST ${t.cstPisCofinsMonofasico} (Monofásico)</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: right; color: #15803d; font-weight: bold;">R$ 0,00 (Alíquota Zero)</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style="background: #f8fafc; font-weight: bold; border-top: 2px solid #64748b;">
              <td colspan="3" style="padding: 7px; border: 1px solid #cbd5e1; text-align: right;">TOTAL ICMS MONOFÁSICO AD REM RECOLHIDO:</td>
              <td style="padding: 7px; border: 1px solid #cbd5e1; text-align: right; color: #0f172a;">R$ ${resumo.totalIcmsMonofasicoAdRem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              <td style="padding: 7px; border: 1px solid #cbd5e1; text-align: center;">-</td>
              <td style="padding: 7px; border: 1px solid #cbd5e1; text-align: right; color: #15803d;">R$ 0,00</td>
            </tr>
          </tfoot>
        </table>

        <!-- TERMO DE FECHAMENTO E ASSINATURAS -->
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 4px; padding: 15px; margin-top: 20px; font-size: 11px;">
          <div style="font-weight: bold; margin-bottom: 5px; color: #0f172a;">TERMO DE CONFORMIDADE E FISCALIZAÇÃO - PORTARIA ANP Nº 26/92:</div>
          <div>
            Declaramos que as informações aqui lançadas conferem com a medição milimétrica das réguas dos tanques e com os números dos encerrantes das bombas medidoras.
            O percentual de perda volumétrica por dilatação/contração térmica e manuseio apurado no período foi de
            <strong>${((resumo.totalPerdasVolumeLitros / (resumo.totalVolumeVendidoLitros || 1)) * 100).toFixed(2)}%</strong>,
            encontrando-se <strong>${resumo.conformidadeAnpGeral ? 'ABAIXO DA MARGEM LEGAL DE 0,60%' : 'ACIMA DA MARGEM LEGAL'}</strong> prevista pelas normas da ANP.
          </div>
        </div>

        <div style="margin-top: 50px; display: flex; justify-content: space-between; text-align: center; font-size: 11px;">
          <div style="width: 45%; border-top: 1px solid #64748b; padding-top: 8px;">
            <strong>${empresaAtiva.razaoSocial}</strong><br />
            Responsável Legal / Operador do Posto<br />
            RG / CPF: ____________________________
          </div>
          <div style="width: 45%; border-top: 1px solid #64748b; padding-top: 8px;">
            <strong>CONTADOR RESPONSÁVEL TÉCNICO</strong><br />
            CRC nº 1SP-999999/O-0 • Validador SPED / LMC<br />
            Assinatura Digital ICP-Brasil
          </div>
        </div>
      </div>
    `;

    if (onOpenReportPreview) {
      onOpenReportPreview({
        titulo: 'LMC - Livro de Movimentação de Combustíveis (Portaria ANP 26/92)',
        subtitulo: `Data: ${dataAtiva} • Empresa: ${empresaAtiva.razaoSocial}`,
        conteudoHtml: html
      });
    } else {
      const w = window.open('', '_blank');
      if (w) {
        w.document.write(`<html><head><title>LMC Oficial - ANP</title></head><body>${html}</body></html>`);
        w.document.close();
      }
    }
  };

  // Cálculos do Simulador
  const simEscritural = simAbertura + simEntradas - simVendas;
  const simDiferenca = simRegua - simEscritural;
  const simBase = simAbertura + simEntradas;
  const simPerc = simBase > 0 ? (Math.abs(simDiferenca) / simBase) * 100 : 0;
  const simToleranciaOk = simPerc <= 0.60;
  const simTotalAdRem = simVendas * simAliqAdRem;

  return (
    <div className="flex flex-col h-full bg-[#141414] text-neutral-200">
      {/* HEADER BAR */}
      <div className="border-b border-neutral-800 bg-[#1a1a1a] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
            <Fuel className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              Controle de Combustíveis Monofásicos & LMC
              <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                Portaria ANP nº 26/92 & LC nº 192/22
              </span>
            </h1>
            <p className="text-xs text-neutral-400">
              Livro de Movimentação de Combustíveis, reconciliação de tanques (tolerância 0,6%), ICMS Ad Rem e PIS/COFINS monofásico (CST 04).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#222] border border-neutral-700 px-3 py-1.5 rounded-lg text-xs">
            <Calendar className="w-4 h-4 text-neutral-400" />
            <span className="text-neutral-400">Data do LMC:</span>
            <input
              type="date"
              value={dataAtiva}
              onChange={e => setDataAtiva(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none"
            />
          </div>

          <button
            onClick={carregarDados}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
            title="Atualizar dados"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleImprimirLmcA4}
            className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-semibold border border-neutral-700 transition-colors"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            Imprimir LMC A4
          </button>

          <button
            onClick={handleOpenNovo}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Registro de Tanque
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 p-6 pb-2">
        {/* Total Vendido */}
        <div className="bg-[#1e1e1e] border border-neutral-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Volume Vendido</span>
            <Droplets className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">
            {formatarLitros(resumo?.totalVolumeVendidoLitros || 0)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">Encerrantes de bicos aferidos</div>
        </div>

        {/* Perdas Volumétricas */}
        <div className="bg-[#1e1e1e] border border-neutral-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Perda / Evaporação</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold text-rose-400 font-mono">
            {formatarLitros(resumo?.totalPerdasVolumeLitros || 0)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">Diferença física vs escritural</div>
        </div>

        {/* Tolerância ANP 0.6% */}
        <div className="bg-[#1e1e1e] border border-neutral-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Tolerância ANP</span>
            <Gauge className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-base font-bold font-mono ${resumo?.conformidadeAnpGeral ? 'text-emerald-400' : 'text-rose-400'}`}>
              {resumo?.conformidadeAnpGeral ? 'CONFORME (≤0,6%)' : 'IRREGULAR (>0,6%)'}
            </span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">Portaria DNC/ANP 26/92</div>
        </div>

        {/* ICMS Monofásico Ad Rem */}
        <div className="bg-[#1e1e1e] border border-neutral-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">ICMS Ad Rem</span>
            <Scale className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400 font-mono">
            {formatarMoeda(resumo?.totalIcmsMonofasicoAdRem || 0)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">LC 192/22 (Retido Refinaria)</div>
        </div>

        {/* PIS/COFINS Monofásico */}
        <div className="bg-[#1e1e1e] border border-neutral-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">PIS / COFINS Posto</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono">
            R$ 0,00
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">CST 04 - Alíquota Zero Varejo</div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center border-b border-neutral-800 px-6 gap-6 text-xs font-semibold">
        <button
          onClick={() => setAbaAtiva('lmc')}
          className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
            abaAtiva === 'lmc'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Fuel className="w-4 h-4" />
          Movimentação dos Tanques (LMC)
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-neutral-800 text-[10px] text-neutral-300">
            {resumo?.tanques.length || 0}
          </span>
        </button>

        <button
          onClick={() => setAbaAtiva('simulador')}
          className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
            abaAtiva === 'simulador'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Calculator className="w-4 h-4" />
          Simulador Ad Rem & Perdas
        </button>

        <button
          onClick={() => setAbaAtiva('legislacao')}
          className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
            abaAtiva === 'legislacao'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          Legislação & Normas ANP / LC 192
        </button>
      </div>

      {/* TAB CONTENT: LMC */}
      {abaAtiva === 'lmc' && (
        <div className="flex-1 flex flex-col overflow-hidden p-6 gap-4">
          {/* SEARCH & FILTERS */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md bg-[#1a1a1a] border border-neutral-800 rounded-lg px-3 py-1.5">
              <Search className="w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={busca}
                onChange={e => setBusca(e.target.value)}
                placeholder="Buscar por tanque, combustível ou observação..."
                className="bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none w-full"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-neutral-400" />
              <select
                value={filtroTipo}
                onChange={e => setFiltroTipo(e.target.value)}
                className="bg-[#1a1a1a] border border-neutral-800 text-neutral-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                <option value="TODOS">Todos os Combustíveis</option>
                <option value="GASOLINA_C">Gasolina Comum C</option>
                <option value="OLEO_DIESEL_S10">Diesel S10</option>
                <option value="OLEO_DIESEL_S500">Diesel S500</option>
                <option value="ETANOL_HIDRATADO">Etanol Hidratado</option>
                <option value="GLP_GAS_COZINHA">GLP</option>
              </select>
            </div>
          </div>

          {/* TABLE OF TANKS */}
          <div className="flex-1 bg-[#1a1a1a] border border-neutral-800 rounded-xl overflow-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#222] text-neutral-400 border-b border-neutral-800">
                  <th className="py-2.5 px-3 font-semibold text-center w-12">Tq</th>
                  <th className="py-2.5 px-3 font-semibold">Combustível</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Estoque Abertura</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Entradas (NF)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Vendas (Bicos)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Escritural</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Medição Régua</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Variação (L)</th>
                  <th className="py-2.5 px-3 font-semibold text-center">% Perda</th>
                  <th className="py-2.5 px-3 font-semibold text-right">ICMS Ad Rem</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Status ANP</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Contábil</th>
                  <th className="py-2.5 px-3 font-semibold text-center w-24">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-mono">
                {tanquesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="py-12 text-center text-neutral-500 font-sans">
                      Nenhum registro de movimentação de tanque encontrado para esta data.
                    </td>
                  </tr>
                ) : (
                  tanquesFiltrados.map(item => (
                    <tr key={item.id} className="hover:bg-neutral-800/40 transition-colors">
                      <td className="py-3 px-3 text-center font-bold text-amber-400">
                        T-{item.numeroTanque}
                      </td>
                      <td className="py-3 px-3 font-sans">
                        <div className="font-semibold text-white">{getNomeCombustivel(item.tipoCombustivel)}</div>
                        <div className="text-[10px] text-neutral-400 font-mono">CST PIS/COF: {item.cstPisCofinsMonofasico}</div>
                      </td>
                      <td className="py-3 px-3 text-right text-neutral-300">
                        {item.estoqueAbertura.toLocaleString('pt-BR')} L
                      </td>
                      <td className="py-3 px-3 text-right text-sky-400">
                        +{item.volumeRecebidoNotasFiscais.toLocaleString('pt-BR')} L
                      </td>
                      <td className="py-3 px-3 text-right text-neutral-100 font-bold">
                        {item.volumeVendidoEncerrantesBicos.toLocaleString('pt-BR')} L
                      </td>
                      <td className="py-3 px-3 text-right text-neutral-400">
                        {item.estoqueEscrituralFechamento.toLocaleString('pt-BR')} L
                      </td>
                      <td className="py-3 px-3 text-right text-emerald-400 font-bold">
                        {item.estoqueFisicoMedicaoRegua.toLocaleString('pt-BR')} L
                      </td>
                      <td className={`py-3 px-3 text-right font-bold ${item.diferencaVolumetricaSobraOuPerda < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {item.diferencaVolumetricaSobraOuPerda > 0 ? '+' : ''}{item.diferencaVolumetricaSobraOuPerda.toLocaleString('pt-BR')} L
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          item.toleranciaLegalAtendida ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {item.percentualPerda.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-amber-400 font-semibold">
                        {formatarMoeda(item.valorIcmsAdRemMonofasico)}
                      </td>
                      <td className="py-3 px-3 text-center font-sans">
                        {item.toleranciaLegalAtendida ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                            <CheckCircle className="w-3.5 h-3.5" /> Conforme
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-rose-400 font-bold">
                            <AlertTriangle className="w-3.5 h-3.5" /> Acima 0,6%
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-sans">
                        {item.integradoContabil ? (
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[10px] border border-emerald-500/20">
                            Integrado
                          </span>
                        ) : (
                          <button
                            onClick={() => handleIntegrarContabil(item.id)}
                            className="px-2 py-0.5 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 rounded text-[10px] border border-amber-500/30 transition-colors"
                          >
                            Integrar
                          </button>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-sans">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEditar(item)}
                            className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleExcluir(item.id)}
                            className="p-1 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded transition-colors"
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

      {/* TAB CONTENT: SIMULADOR */}
      {abaAtiva === 'simulador' && (
        <div className="flex-1 overflow-auto p-6 max-w-4xl mx-auto w-full">
          <div className="bg-[#1a1a1a] border border-neutral-800 rounded-xl p-6">
            <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-400" />
              Simulador de Variação Volumétrica e Tributação Monofásica Ad Rem
            </h2>
            <p className="text-xs text-neutral-400 mb-6">
              Calcule instantaneamente a perda física (evaporação térmica), teste o limite legal de 0,60% da ANP e veja a retenção de ICMS Ad Rem na fonte.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Estoque de Abertura (L)</label>
                <input
                  type="number"
                  value={simAbertura}
                  onChange={e => setSimAbertura(Number(e.target.value))}
                  className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Entradas por Notas Fiscais (L)</label>
                <input
                  type="number"
                  value={simEntradas}
                  onChange={e => setSimEntradas(Number(e.target.value))}
                  className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Vendas Aferidas pelos Encerrantes dos Bicos (L)</label>
                <input
                  type="number"
                  value={simVendas}
                  onChange={e => setSimVendas(Number(e.target.value))}
                  className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Medição Física na Régua (Fechamento) (L)</label>
                <input
                  type="number"
                  value={simRegua}
                  onChange={e => setSimRegua(Number(e.target.value))}
                  className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs text-neutral-400 mb-1 block">Alíquota ICMS Ad Rem (R$/Litro) - LC 192/22</label>
                <input
                  type="number"
                  step="0.0001"
                  value={simAliqAdRem}
                  onChange={e => setSimAliqAdRem(Number(e.target.value))}
                  className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                />
                <span className="text-[11px] text-neutral-500 mt-1 block">
                  Ex: Gasolina Comum R$ 1,37/L | Diesel S10 / S500 R$ 1,06/L (Convênio ICMS 15/2023)
                </span>
              </div>
            </div>

            {/* RESULTADOS DA SIMULAÇÃO */}
            <div className="bg-[#222] border border-neutral-700 rounded-xl p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4">
                Demonstrativo de Resultado da Conciliação
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-[#1a1a1a] p-3 rounded-lg border border-neutral-800">
                  <div className="text-[11px] text-neutral-400 mb-1">Estoque Escritural</div>
                  <div className="text-base font-bold text-white font-mono">
                    {simEscritural.toLocaleString('pt-BR')} L
                  </div>
                </div>

                <div className="bg-[#1a1a1a] p-3 rounded-lg border border-neutral-800">
                  <div className="text-[11px] text-neutral-400 mb-1">Variação Física (Perda/Sobra)</div>
                  <div className={`text-base font-bold font-mono ${simDiferenca < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {simDiferenca > 0 ? '+' : ''}{simDiferenca.toLocaleString('pt-BR')} L
                  </div>
                </div>

                <div className="bg-[#1a1a1a] p-3 rounded-lg border border-neutral-800">
                  <div className="text-[11px] text-neutral-400 mb-1">Percentual de Variação</div>
                  <div className="text-base font-bold font-mono text-amber-400">
                    {simPerc.toFixed(3)}%
                  </div>
                </div>

                <div className="bg-[#1a1a1a] p-3 rounded-lg border border-neutral-800">
                  <div className="text-[11px] text-neutral-400 mb-1">ICMS Monofásico Ad Rem</div>
                  <div className="text-base font-bold font-mono text-sky-400">
                    {formatarMoeda(simTotalAdRem)}
                  </div>
                </div>
              </div>

              <div className={`mt-4 p-3 rounded-lg flex items-center gap-3 ${
                simToleranciaOk ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
              }`}>
                {simToleranciaOk ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertTriangle className="w-5 h-5 flex-shrink-0" />}
                <div className="text-xs">
                  <strong>{simToleranciaOk ? 'TOLERÂNCIA LEGAL RESPEITADA' : 'ATENÇÃO: PERDA SUPERIOR À TOLERÂNCIA ANP'}</strong>
                  <p className="text-[11px] opacity-80 mt-0.5">
                    {simToleranciaOk
                      ? 'A variação volumétrica apurada está dentro do limite regulamentar de até 0,60% estipulado pela Portaria DNC/ANP nº 26/1992.'
                      : 'A variação ultrapassa o limite de 0,60%. O posto deve realizar aferição mecânica das bombas e laudo de calibração para evitar autuações.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: LEGISLAÇÃO */}
      {abaAtiva === 'legislacao' && (
        <div className="flex-1 overflow-auto p-6 max-w-4xl mx-auto w-full space-y-4">
          <div className="bg-[#1a1a1a] border border-neutral-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-400" />
              Lei Complementar nº 192/2022 & Convênio ICMS nº 15/2023 - Tributação Ad Rem
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              A Lei Complementar nº 192/2022 estabeleceu o regime de tributação monofásica do ICMS sobre combustíveis com alíquotas <strong>Ad Rem</strong> (fixadas em valor em reais por unidade de medida, e não em percentual ad valorem sobre o preço).
              O Convênio ICMS 15/2023 fixou o ICMS uniforme em todo o Brasil para Gasolina (R$ 1,37/L) e Diesel (R$ 1,06/L). Como a incidência é única (na refinaria ou importador), o posto revendedor varejista não destaca nem recolhe ICMS próprio nas saídas.
            </p>
          </div>

          <div className="bg-[#1a1a1a] border border-neutral-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              PIS e COFINS Monofásicos no Comércio Varejista de Combustíveis (CST 04)
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Nos termos da Lei nº 9.718/1998 e Lei nº 10.833/2003, a incidência de PIS e COFINS sobre combustíveis derivados de petróleo e biocombustíveis é concentrada na primeira etapa da cadeia.
              Os postos revendedores utilizam o <strong>CST 04 (Operação Tributável Monofásica - Alíquota Zero)</strong>, sendo isentos de tributação própria sobre as receitas de vendas desses combustíveis.
            </p>
          </div>

          <div className="bg-[#1a1a1a] border border-neutral-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-sky-400" />
              Portaria DNC/ANP nº 26/1992 - Obrigatoriedade do LMC e Margem de 0,6%
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              O Livro de Movimentação de Combustíveis (LMC) é de escrituração diária obrigatória por todos os postos revendedores. Deve ser registrado individualmente para cada tanque, confrontando as leituras dos encerrantes das bombas com as medições físicas de régua.
              A ANP reconhece uma perda natural aceitável por evaporação, expansão térmica e arraste mecânico de <strong>até 0,60% (seis décimos por cento)</strong> do volume total movimentado no período. Variações superiores exigem comunicação à distribuidora e manutenção técnica.
            </p>
          </div>
        </div>
      )}

      {/* MODAL NOVO/EDITAR TANQUE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#1a1a1a] border border-neutral-800 rounded-xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Fuel className="w-4 h-4 text-amber-400" />
                {editingItem ? 'Editar Movimentação de Tanque' : 'Novo Registro de Tanque (LMC)'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-white text-base"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-400 mb-1 block">Número do Tanque</label>
                  <input
                    type="number"
                    value={numeroTanque}
                    onChange={e => setNumeroTanque(Number(e.target.value))}
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-400 mb-1 block">Tipo de Combustível</label>
                  <select
                    value={tipoCombustivel}
                    onChange={e => handleMudarTipoCombustivel(e.target.value as TipoCombustivelMonofasico)}
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="GASOLINA_C">Gasolina Comum C</option>
                    <option value="OLEO_DIESEL_S10">Óleo Diesel S10</option>
                    <option value="OLEO_DIESEL_S500">Óleo Diesel S500</option>
                    <option value="ETANOL_HIDRATADO">Etanol Hidratado</option>
                    <option value="GLP_GAS_COZINHA">GLP (Gás de Cozinha)</option>
                    <option value="BIODIESEL_B100">Biodiesel B100</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-400 mb-1 block">Estoque Abertura (L)</label>
                  <input
                    type="number"
                    value={estoqueAbertura}
                    onChange={e => setEstoqueAbertura(Number(e.target.value))}
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-400 mb-1 block">Entradas (NF-e) (L)</label>
                  <input
                    type="number"
                    value={volumeRecebidoNotasFiscais}
                    onChange={e => setVolumeRecebidoNotasFiscais(Number(e.target.value))}
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-400 mb-1 block">Vendas (Encerrantes) (L)</label>
                  <input
                    type="number"
                    value={volumeVendidoEncerrantesBicos}
                    onChange={e => setVolumeVendidoEncerrantesBicos(Number(e.target.value))}
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-400 mb-1 block">Medição Régua (Físico) (L)</label>
                  <input
                    type="number"
                    value={estoqueFisicoMedicaoRegua}
                    onChange={e => setEstoqueFisicoMedicaoRegua(Number(e.target.value))}
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Alíquota ICMS Ad Rem (R$/L)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={aliquotaIcmsAdRemPorLitro}
                  onChange={e => setAliquotaIcmsAdRemPorLitro(Number(e.target.value))}
                  className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              {/* LIVE PREVIEW BOX */}
              <div className="p-3 bg-[#222] border border-neutral-700 rounded-lg text-xs space-y-1">
                <div className="flex justify-between text-neutral-400">
                  <span>Estoque Escritural:</span>
                  <span className="font-mono text-white">{modalEscritural.toLocaleString('pt-BR')} L</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Variação Volumétrica:</span>
                  <span className={`font-mono font-bold ${modalDiferenca < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {modalDiferenca > 0 ? '+' : ''}{modalDiferenca.toLocaleString('pt-BR')} L ({modalPerc.toFixed(2)}%)
                  </span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Status ANP (≤0,6%):</span>
                  <span className={`font-bold ${modalToleranciaOk ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {modalToleranciaOk ? 'Dentro do Limite' : 'Excedeu Limite'}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-400 pt-1 border-t border-neutral-700">
                  <span>ICMS Ad Rem Total:</span>
                  <span className="font-mono font-bold text-amber-400">{formatarMoeda(modalIcmsAdRem)}</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Observações do Operador</label>
                <textarea
                  value={observacoes}
                  onChange={e => setObservacoes(e.target.value)}
                  placeholder="Ex: Bomba aferida com aferidor padrão de 20L, sem vazamentos constatados."
                  className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 h-16 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-neutral-800 bg-[#161616]">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvarItem}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                Salvar Movimentação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
