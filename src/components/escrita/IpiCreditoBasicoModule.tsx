import React, { useState, useEffect } from 'react';
import {
  Factory,
  Plus,
  RefreshCw,
  Printer,
  TrendingDown,
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
  PackageCheck,
  Globe2,
  Boxes
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  ApuracaoIpiPeriodo,
  Empresa,
  ItemEntradaCreditoIpi,
  ItemSaidaDebitoIpi,
  ResumoIpiRessarcimento,
  TipoInsumoIpi
} from '../../types/contabil';

interface IpiCreditoBasicoModuleProps {
  empresaAtiva: Empresa | null;
  onOpenReportPreview?: (config: {
    titulo: string;
    subtitulo: string;
    conteudoHtml: string;
    imprimirDireto?: boolean;
  }) => void;
}

export const IpiCreditoBasicoModule: React.FC<IpiCreditoBasicoModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [resumo, setResumo] = useState<ResumoIpiRessarcimento | null>(null);
  const [competencia, setCompetencia] = useState('2026-03');
  const [abaAtiva, setAbaAtiva] = useState<'entradas' | 'saidas' | 'apuracao' | 'legislacao'>('apuracao');
  const [busca, setBusca] = useState('');

  // Modais
  const [isModalEntradaOpen, setIsModalEntradaOpen] = useState(false);
  const [isModalSaidaOpen, setIsModalSaidaOpen] = useState(false);

  // Form Entrada
  const [entData, setEntData] = useState('2026-03-10');
  const [entNumeroNfe, setEntNumeroNfe] = useState('');
  const [entChaveNfe, setEntChaveNfe] = useState('');
  const [entFornecedor, setEntFornecedor] = useState('');
  const [entCnpj, setEntCnpj] = useState('');
  const [entDescricao, setEntDescricao] = useState('');
  const [entNcm, setEntNcm] = useState('');
  const [entTipoInsumo, setEntTipoInsumo] = useState<TipoInsumoIpi>('MATERIA_PRIMA');
  const [entValorContabil, setEntValorContabil] = useState<number>(100000);
  const [entAliquota, setEntAliquota] = useState<number>(5.0);
  const [entCfop, setEntCfop] = useState('1.101');

  // Form Saída
  const [saiData, setSaiData] = useState('2026-03-15');
  const [saiNumeroNfe, setSaiNumeroNfe] = useState('');
  const [saiCliente, setSaiCliente] = useState('');
  const [saiCnpj, setSaiCnpj] = useState('');
  const [saiDescricao, setSaiDescricao] = useState('');
  const [saiNcm, setSaiNcm] = useState('');
  const [saiValorContabil, setSaiValorContabil] = useState<number>(150000);
  const [saiAliquota, setSaiAliquota] = useState<number>(10.0);
  const [saiCfop, setSaiCfop] = useState('5.101');
  const [saiIsExportacao, setSaiIsExportacao] = useState(false);

  const carregarDados = () => {
    if (!empresaAtiva) return;
    const res = dbService.getApuracoesIpi(empresaAtiva.id, competencia);
    setResumo(res);
  };

  useEffect(() => {
    carregarDados();
  }, [empresaAtiva, competencia]);

  const handleSalvarEntrada = () => {
    if (!empresaAtiva) return;
    const valorIpi = Math.round(entValorContabil * (entAliquota / 100) * 100) / 100;
    const item: ItemEntradaCreditoIpi = {
      id: `ent-${Date.now()}`,
      empresaId: empresaAtiva.id,
      dataEntrada: entData,
      numeroNotaFiscal: entNumeroNfe || '1001',
      chaveAcessoNfe: entChaveNfe || '35260300000000000000550010000010011000001001',
      fornecedorNome: entFornecedor || 'Fornecedor Industrial Padrão',
      fornecedorCnpj: entCnpj || '00.000.000/0001-00',
      descricaoItem: entDescricao || 'Insumo Industrial com Crédito',
      ncm: entNcm || '7219.33.00',
      tipoInsumo: entTipoInsumo,
      valorContabilItem: entValorContabil,
      baseCalculoIpi: entValorContabil,
      aliquotaIpi: entAliquota,
      valorIpiCreditado: valorIpi,
      cfopEntrada: entCfop,
      cstIpiEntrada: '00'
    };

    dbService.salvarItemEntradaIpi(item, competencia);
    setIsModalEntradaOpen(false);
    carregarDados();
  };

  const handleSalvarSaida = () => {
    if (!empresaAtiva) return;
    const valorIpi = saiIsExportacao ? 0 : Math.round(saiValorContabil * (saiAliquota / 100) * 100) / 100;
    const item: ItemSaidaDebitoIpi = {
      id: `sai-${Date.now()}`,
      empresaId: empresaAtiva.id,
      dataSaida: saiData,
      numeroNotaFiscal: saiNumeroNfe || '2001',
      clienteNome: saiCliente || 'Cliente Comercial Padrão',
      clienteCnpj: saiCnpj || '00.000.000/0001-00',
      descricaoItem: saiDescricao || 'Produto Industrializado',
      ncm: saiNcm || '8418.99.00',
      valorContabilItem: saiValorContabil,
      baseCalculoIpi: saiIsExportacao ? 0 : saiValorContabil,
      aliquotaIpi: saiIsExportacao ? 0 : saiAliquota,
      valorIpiDebitado: valorIpi,
      cfopSaida: saiIsExportacao ? '7.101' : saiCfop,
      cstIpiSaida: saiIsExportacao ? '55' : '50',
      isExportacaoImune: saiIsExportacao
    };

    dbService.salvarItemSaidaIpi(item, competencia);
    setIsModalSaidaOpen(false);
    carregarDados();
  };

  const handleExcluirItem = (id: string, tipo: 'ENTRADA' | 'SAIDA') => {
    if (window.confirm('Confirma a exclusão deste item da escrituração do IPI?')) {
      dbService.excluirItemIpi(id, tipo, competencia, empresaAtiva?.id);
      carregarDados();
    }
  };

  const handleIntegrarContabil = (periodoId: string) => {
    const res = dbService.integrarApuracaoIpiContabil(periodoId);
    if (res.sucesso) {
      alert(res.mensagem);
      carregarDados();
    } else {
      alert(`Falha: ${res.mensagem}`);
    }
  };

  const formatarMoeda = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const periodoAtual = resumo?.periodos[0];

  // Geração de Relatório Oficial A4 do Livro Registro de Apuração do IPI (Modelo 8)
  const handleImprimirLivroModelo8A4 = () => {
    if (!empresaAtiva || !periodoAtual) return;

    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; padding: 25px; max-width: 950px; margin: 0 auto; line-height: 1.4;">
        <!-- CABEÇALHO OFICIAL LIVRO MODELO 8 -->
        <div style="border-bottom: 3px double #0f172a; padding-bottom: 15px; margin-bottom: 20px; text-align: center;">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: bold;">
            MINISTÉRIO DA FAZENDA • SECRETARIA DA RECEITA FEDERAL DO BRASIL
          </div>
          <h1 style="font-size: 20px; margin: 5px 0; color: #0f172a; text-transform: uppercase; font-weight: 800;">
            LIVRO REGISTRO DE APURAÇÃO DO IPI - MODELO 8
          </h1>
          <div style="font-size: 13px; font-weight: 600; color: #334155;">
            DECRETO Nº 7.212/2010 (RIPI) • ART. 472 • CRÉDITO BÁSICO E MANUTENÇÃO NAS EXPORTAÇÕES
          </div>
        </div>

        <!-- DADOS DA INDÚSTRIA -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; background: #f8fafc; border: 1px solid #cbd5e1;">
          <tr>
            <td style="padding: 8px 12px; width: 60%;"><strong>Estabelecimento Industrial:</strong> ${empresaAtiva.razaoSocial}</td>
            <td style="padding: 8px 12px; width: 40%;"><strong>CNPJ:</strong> ${empresaAtiva.cnpj || '00.000.000/0001-00'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px;"><strong>Inscrição Estadual:</strong> ${empresaAtiva.inscricaoEstadual || 'Isento / Declarada'}</td>
            <td style="padding: 8px 12px;"><strong>Período de Apuração:</strong> ${periodoAtual.periodo} (${periodoAtual.tipoPeriodo})</td>
          </tr>
        </table>

        <!-- QUADRO 1: ENTRADAS E CRÉDITOS POR INSUMOS -->
        <h3 style="font-size: 14px; margin: 15px 0 10px 0; border-bottom: 1px solid #94a3b8; padding-bottom: 5px; color: #0f172a; text-transform: uppercase;">
          1. Entradas de Insumos com Direito ao Crédito Básico (MP, PI e ME)
        </h3>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px;">
          <thead>
            <tr style="background: #1e293b; color: #ffffff;">
              <th style="padding: 7px; border: 1px solid #334155; text-align: center;">Data</th>
              <th style="padding: 7px; border: 1px solid #334155; text-align: center;">NF-e</th>
              <th style="padding: 7px; border: 1px solid #334155; text-align: left;">Fornecedor / Insumo</th>
              <th style="padding: 7px; border: 1px solid #334155; text-align: center;">Tipo</th>
              <th style="padding: 7px; border: 1px solid #334155; text-align: center;">NCM</th>
              <th style="padding: 7px; border: 1px solid #334155; text-align: right;">Base de Cálculo</th>
              <th style="padding: 7px; border: 1px solid #334155; text-align: center;">Alíq (%)</th>
              <th style="padding: 7px; border: 1px solid #334155; text-align: right;">IPI Creditado</th>
            </tr>
          </thead>
          <tbody>
            ${periodoAtual.entradas.map(e => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">${e.dataEntrada}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center; font-family: monospace;">${e.numeroNotaFiscal}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1;"><strong>${e.fornecedorNome}</strong><br />${e.descricaoItem}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center; font-size: 10px;">${e.tipoInsumo}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center; font-family: monospace;">${e.ncm}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: right;">${e.baseCalculoIpi.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">${e.aliquotaIpi.toFixed(2)}%</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold; color: #15803d;">
                  ${e.valorIpiCreditado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style="background: #f1f5f9; font-weight: bold;">
              <td colspan="7" style="padding: 7px; border: 1px solid #cbd5e1; text-align: right;">TOTAL DOS CRÉDITOS DO PERÍODO:</td>
              <td style="padding: 7px; border: 1px solid #cbd5e1; text-align: right; color: #15803d;">
                ${periodoAtual.totalCreditosEntradasInsumos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </td>
            </tr>
          </tfoot>
        </table>

        <!-- QUADRO 2: SAÍDAS TRIBUTADAS & EXPORTAÇÕES -->
        <h3 style="font-size: 14px; margin: 15px 0 10px 0; border-bottom: 1px solid #94a3b8; padding-bottom: 5px; color: #0f172a; text-transform: uppercase;">
          2. Saídas Tributadas e Saídas Imunes para Exportação (Lei 9.779/99)
        </h3>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px;">
          <thead>
            <tr style="background: #334155; color: #ffffff;">
              <th style="padding: 7px; border: 1px solid #475569; text-align: center;">Data</th>
              <th style="padding: 7px; border: 1px solid #475569; text-align: center;">NF-e</th>
              <th style="padding: 7px; border: 1px solid #475569; text-align: left;">Cliente / Destinatário</th>
              <th style="padding: 7px; border: 1px solid #475569; text-align: center;">NCM / CFOP</th>
              <th style="padding: 7px; border: 1px solid #475569; text-align: right;">Valor Contábil</th>
              <th style="padding: 7px; border: 1px solid #475569; text-align: center;">Alíq (%)</th>
              <th style="padding: 7px; border: 1px solid #475569; text-align: right;">IPI Debitado</th>
            </tr>
          </thead>
          <tbody>
            ${periodoAtual.saidas.map(s => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">${s.dataSaida}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center; font-family: monospace;">${s.numeroNotaFiscal}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1;"><strong>${s.clienteNome}</strong><br />${s.descricaoItem}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center; font-family: monospace;">${s.ncm} / ${s.cfopSaida}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: right;">${s.valorContabilItem.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">${s.isExportacaoImune ? '<span style="color:#0369a1;font-weight:bold;">IMUNE</span>' : `${s.aliquotaIpi.toFixed(2)}%`}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold; color: ${s.valorIpiDebitado > 0 ? '#b91c1c' : '#64748b'};">
                  ${s.valorIpiDebitado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style="background: #f1f5f9; font-weight: bold;">
              <td colspan="6" style="padding: 7px; border: 1px solid #cbd5e1; text-align: right;">TOTAL DOS DÉBITOS DO PERÍODO:</td>
              <td style="padding: 7px; border: 1px solid #cbd5e1; text-align: right; color: #b91c1c;">
                ${periodoAtual.totalDebitosSaidasTributadas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </td>
            </tr>
          </tfoot>
        </table>

        <!-- QUADRO 3: CONCILIAÇÃO FINAL DO LIVRO MODELO 8 -->
        <h3 style="font-size: 14px; margin: 15px 0 10px 0; border-bottom: 1px solid #94a3b8; padding-bottom: 5px; color: #0f172a; text-transform: uppercase;">
          3. Demonstrativo de Apuração e Fechamento do Saldo de IPI
        </h3>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 12px; border: 1px solid #cbd5e1;">
          <tr style="background: #f8fafc;">
            <td style="padding: 8px 12px;">(+) Saldo Credor Transferido do Período Anterior</td>
            <td style="padding: 8px 12px; text-align: right; font-weight: bold; font-family: monospace;">${periodoAtual.saldoCredorPeriodoAnterior.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px;">(+) Total de Créditos por Entradas de Insumos (Quadro 1)</td>
            <td style="padding: 8px 12px; text-align: right; font-weight: bold; font-family: monospace; color: #15803d;">${periodoAtual.totalCreditosEntradasInsumos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
          </tr>
          <tr style="background: #f8fafc;">
            <td style="padding: 8px 12px;">(-) Total de Débitos por Saídas Tributadas (Quadro 2)</td>
            <td style="padding: 8px 12px; text-align: right; font-weight: bold; font-family: monospace; color: #b91c1c;">${periodoAtual.totalDebitosSaidasTributadas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
          </tr>
          <tr style="background: #0f172a; color: #ffffff; font-weight: bold;">
            <td style="padding: 10px 12px; font-size: 13px;">
              ${periodoAtual.saldoApuradoIpi <= 0 ? 'SALDO CREDOR ACUMULADO DISPONÍVEL P/ RESSARCIMENTO (PER/DCOMP):' : 'SALDO DEVEDOR DO IPI A RECOLHER (DARF 1097):'}
            </td>
            <td style="padding: 10px 12px; text-align: right; font-size: 14px; font-family: monospace; color: ${periodoAtual.saldoApuradoIpi <= 0 ? '#4ade80' : '#f87171'};">
              ${Math.abs(periodoAtual.saldoApuradoIpi).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </td>
          </tr>
        </table>

        <!-- TERMO DE FECHAMENTO E ASSINATURAS -->
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 4px; padding: 15px; margin-top: 20px; font-size: 11px;">
          <div style="font-weight: bold; margin-bottom: 5px; color: #0f172a;">TERMO DE CONFORMIDADE - RIPI DECRETO Nº 7.212/2010:</div>
          <div>
            Declaramos que os créditos fiscais aqui escriturados são decorrentes de matérias-primas e insumos consumidos diretamente no processo de industrialização.
            O saldo credor apurado no montante de <strong>${Math.abs(periodoAtual.saldoApuradoIpi).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong> está formalmente habilitado para ressarcimento trimestral ou compensação via PER/DCOMP conforme Instrução Normativa RFB nº 2.055/2021.
          </div>
        </div>

        <div style="margin-top: 50px; display: flex; justify-content: space-between; text-align: center; font-size: 11px;">
          <div style="width: 45%; border-top: 1px solid #64748b; padding-top: 8px;">
            <strong>${empresaAtiva.razaoSocial}</strong><br />
            Diretoria Industrial / Representante Legal<br />
            CPF: ____________________________
          </div>
          <div style="width: 45%; border-top: 1px solid #64748b; padding-top: 8px;">
            <strong>CONTADOR RESPONSÁVEL TÉCNICO</strong><br />
            CRC nº 1SP-999999/O-0 • Auditoria IPI<br />
            Assinatura Digital ICP-Brasil
          </div>
        </div>
      </div>
    `;

    if (onOpenReportPreview) {
      onOpenReportPreview({
        titulo: 'Livro Registro de Apuração do IPI - Modelo 8 Oficial',
        subtitulo: `Período: ${periodoAtual.periodo} • Empresa: ${empresaAtiva.razaoSocial}`,
        conteudoHtml: html
      });
    } else {
      const w = window.open('', '_blank');
      if (w) {
        w.document.write(`<html><head><title>Livro Registro Apuração do IPI - Modelo 8</title></head><body>${html}</body></html>`);
        w.document.close();
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#141414] text-neutral-200">
      {/* HEADER BAR */}
      <div className="border-b border-neutral-800 bg-[#1a1a1a] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400">
            <Factory className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              Apuração do IPI & Ressarcimento Trimestral (PER/DCOMP)
              <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30">
                RIPI Dec. 7.212/10 & IN RFB 2.055/21
              </span>
            </h1>
            <p className="text-xs text-neutral-400">
              Crédito básico na aquisição de insumos (MP/PI/ME), manutenção nas exportações e Livro Registro Modelo 8.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#222] border border-neutral-700 px-3 py-1.5 rounded-lg text-xs">
            <Calendar className="w-4 h-4 text-neutral-400" />
            <span className="text-neutral-400">Competência:</span>
            <input
              type="month"
              value={competencia}
              onChange={e => setCompetencia(e.target.value)}
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
            onClick={handleImprimirLivroModelo8A4}
            className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-semibold border border-neutral-700 transition-colors"
          >
            <Printer className="w-4 h-4 text-blue-400" />
            Livro Modelo 8 A4
          </button>

          <button
            onClick={() => setIsModalEntradaOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nova Entrada (Crédito)
          </button>

          <button
            onClick={() => setIsModalSaidaOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nova Saída (Débito)
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 p-6 pb-2">
        {/* Créditos de Insumos */}
        <div className="bg-[#1e1e1e] border border-neutral-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Créditos de Insumos</span>
            <PackageCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono">
            {formatarMoeda(resumo?.totalCreditoInsumos || 0)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">MP, PI e Embalagens</div>
        </div>

        {/* Débitos de Vendas */}
        <div className="bg-[#1e1e1e] border border-neutral-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Débitos sobre Vendas</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold text-rose-400 font-mono">
            {formatarMoeda(resumo?.totalDebitoVendas || 0)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">Saídas tributadas no país</div>
        </div>

        {/* Saldo Credor Acumulado */}
        <div className="bg-[#1e1e1e] border border-neutral-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Saldo Credor Acumulado</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono">
            {formatarMoeda(resumo?.saldoCredorAcumuladoRessarcivel || 0)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">Disponível p/ PER/DCOMP</div>
        </div>

        {/* Exportações Imunes */}
        <div className="bg-[#1e1e1e] border border-neutral-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Exportações Imunes</span>
            <Globe2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-bold text-sky-400 font-mono">
            {formatarMoeda(resumo?.totalExportacoesManutencaoCredito || 0)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">Manutenção Lei 9.779/99</div>
        </div>

        {/* DARF a Recolher */}
        <div className="bg-[#1e1e1e] border border-neutral-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">DARF 1097 IPI</span>
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">
            {formatarMoeda(periodoAtual?.valorGuiaDarfRecolher || 0)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            {periodoAtual?.saldoApuradoIpi && periodoAtual.saldoApuradoIpi <= 0 ? 'Saldo Credor (Isento DARF)' : 'Guia a Recolher'}
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center border-b border-neutral-800 px-6 gap-6 text-xs font-semibold">
        <button
          onClick={() => setAbaAtiva('apuracao')}
          className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
            abaAtiva === 'apuracao'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Scale className="w-4 h-4" />
          Quadro de Apuração (Modelo 8)
        </button>

        <button
          onClick={() => setAbaAtiva('entradas')}
          className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
            abaAtiva === 'entradas'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          Entradas com Crédito (Insumos)
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-neutral-800 text-[10px] text-neutral-300">
            {periodoAtual?.entradas.length || 0}
          </span>
        </button>

        <button
          onClick={() => setAbaAtiva('saidas')}
          className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
            abaAtiva === 'saidas'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <TrendingDown className="w-4 h-4" />
          Saídas Tributadas & Exportação
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-neutral-800 text-[10px] text-neutral-300">
            {periodoAtual?.saidas.length || 0}
          </span>
        </button>

        <button
          onClick={() => setAbaAtiva('legislacao')}
          className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
            abaAtiva === 'legislacao'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          Legislação & Dossiê PER/DCOMP
        </button>
      </div>

      {/* TAB CONTENT: APURAÇÃO LIVRO MODELO 8 */}
      {abaAtiva === 'apuracao' && (
        <div className="flex-1 overflow-auto p-6 max-w-5xl mx-auto w-full space-y-4">
          <div className="bg-[#1a1a1a] border border-neutral-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4 border-b border-neutral-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Scale className="w-5 h-5 text-blue-400" />
                  Livro Registro de Apuração do IPI (Modelo 8 Oficial)
                </h2>
                <p className="text-xs text-neutral-400">
                  Confronto de créditos básicos da não-cumulatividade contra débitos de faturamento industrial.
                </p>
              </div>

              {periodoAtual && (
                <div>
                  {periodoAtual.integradoContabil ? (
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-semibold border border-emerald-500/20">
                      ✓ Integrado ao Diário Geral
                    </span>
                  ) : (
                    <button
                      onClick={() => handleIntegrarContabil(periodoAtual.id)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                    >
                      Integrar Apuração Contábil
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between p-3 bg-[#222] rounded-lg">
                <span className="text-neutral-400">(+) Saldo Credor Transferido do Período Anterior</span>
                <span className="text-white font-bold">{formatarMoeda(periodoAtual?.saldoCredorPeriodoAnterior || 0)}</span>
              </div>

              <div className="flex justify-between p-3 bg-[#222] rounded-lg">
                <span className="text-emerald-400 font-semibold">(+) Total de Créditos por Entradas de Insumos (MP / PI / ME)</span>
                <span className="text-emerald-400 font-bold">{formatarMoeda(periodoAtual?.totalCreditosEntradasInsumos || 0)}</span>
              </div>

              <div className="flex justify-between p-3 bg-[#222] rounded-lg">
                <span className="text-rose-400 font-semibold">(-) Total de Débitos por Saídas Industriais Tributadas</span>
                <span className="text-rose-400 font-bold">-{formatarMoeda(periodoAtual?.totalDebitosSaidasTributadas || 0)}</span>
              </div>

              <div className={`flex justify-between p-4 rounded-xl border ${
                periodoAtual && periodoAtual.saldoApuradoIpi <= 0
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : 'bg-rose-950/20 border-rose-500/30'
              }`}>
                <div>
                  <span className="text-sm font-bold text-white block">
                    {periodoAtual && periodoAtual.saldoApuradoIpi <= 0 ? 'SALDO CREDOR ACUMULADO P/ RESSARCIMENTO (PER/DCOMP):' : 'SALDO DEVEDOR DO IPI A RECOLHER (DARF 1097):'}
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    {periodoAtual && periodoAtual.saldoApuradoIpi <= 0
                      ? 'Créditos gerados por exportação ou insumos com alíquota superior à saída.'
                      : `Vencimento do DARF: ${periodoAtual?.dataVencimentoDarf}`}
                  </span>
                </div>
                <span className={`text-xl font-bold ${periodoAtual && periodoAtual.saldoApuradoIpi <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatarMoeda(Math.abs(periodoAtual?.saldoApuradoIpi || 0))}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ENTRADAS COM CRÉDITO */}
      {abaAtiva === 'entradas' && (
        <div className="flex-1 flex flex-col overflow-hidden p-6 gap-4">
          <div className="flex-1 bg-[#1a1a1a] border border-neutral-800 rounded-xl overflow-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#222] text-neutral-400 border-b border-neutral-800">
                  <th className="py-2.5 px-3 font-semibold text-center w-24">Data</th>
                  <th className="py-2.5 px-3 font-semibold text-center w-20">NF-e</th>
                  <th className="py-2.5 px-3 font-semibold">Fornecedor / Descrição do Insumo</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Tipo Insumo</th>
                  <th className="py-2.5 px-3 font-semibold text-center">NCM</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Valor Contábil</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Alíq (%)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Crédito IPI</th>
                  <th className="py-2.5 px-3 font-semibold text-center w-16">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-mono">
                {(!periodoAtual || periodoAtual.entradas.length === 0) ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-neutral-500 font-sans">
                      Nenhuma entrada com crédito de IPI registrada neste período.
                    </td>
                  </tr>
                ) : (
                  periodoAtual.entradas.map(item => (
                    <tr key={item.id} className="hover:bg-neutral-800/40 transition-colors">
                      <td className="py-3 px-3 text-center text-neutral-400">{item.dataEntrada}</td>
                      <td className="py-3 px-3 text-center font-bold text-white">{item.numeroNotaFiscal}</td>
                      <td className="py-3 px-3 font-sans">
                        <div className="font-semibold text-white">{item.fornecedorNome}</div>
                        <div className="text-[11px] text-neutral-400">{item.descricaoItem} • CFOP {item.cfopEntrada}</div>
                      </td>
                      <td className="py-3 px-3 text-center font-sans">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-neutral-800 text-neutral-300 border border-neutral-700">
                          {item.tipoInsumo}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center text-neutral-400">{item.ncm}</td>
                      <td className="py-3 px-3 text-right text-neutral-300">{formatarMoeda(item.valorContabilItem)}</td>
                      <td className="py-3 px-3 text-center text-neutral-400">{item.aliquotaIpi.toFixed(2)}%</td>
                      <td className="py-3 px-3 text-right text-emerald-400 font-bold">{formatarMoeda(item.valorIpiCreditado)}</td>
                      <td className="py-3 px-3 text-center font-sans">
                        <button
                          onClick={() => handleExcluirItem(item.id, 'ENTRADA')}
                          className="p-1 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SAÍDAS */}
      {abaAtiva === 'saidas' && (
        <div className="flex-1 flex flex-col overflow-hidden p-6 gap-4">
          <div className="flex-1 bg-[#1a1a1a] border border-neutral-800 rounded-xl overflow-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#222] text-neutral-400 border-b border-neutral-800">
                  <th className="py-2.5 px-3 font-semibold text-center w-24">Data</th>
                  <th className="py-2.5 px-3 font-semibold text-center w-20">NF-e</th>
                  <th className="py-2.5 px-3 font-semibold">Cliente / Descrição do Produto</th>
                  <th className="py-2.5 px-3 font-semibold text-center">NCM / CFOP</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Valor Contábil</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Alíq (%)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Débito IPI</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Tipo Operação</th>
                  <th className="py-2.5 px-3 font-semibold text-center w-16">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-mono">
                {(!periodoAtual || periodoAtual.saidas.length === 0) ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-neutral-500 font-sans">
                      Nenhuma saída registrada neste período.
                    </td>
                  </tr>
                ) : (
                  periodoAtual.saidas.map(item => (
                    <tr key={item.id} className="hover:bg-neutral-800/40 transition-colors">
                      <td className="py-3 px-3 text-center text-neutral-400">{item.dataSaida}</td>
                      <td className="py-3 px-3 text-center font-bold text-white">{item.numeroNotaFiscal}</td>
                      <td className="py-3 px-3 font-sans">
                        <div className="font-semibold text-white">{item.clienteNome}</div>
                        <div className="text-[11px] text-neutral-400">{item.descricaoItem}</div>
                      </td>
                      <td className="py-3 px-3 text-center text-neutral-400">{item.ncm} • {item.cfopSaida}</td>
                      <td className="py-3 px-3 text-right text-neutral-300">{formatarMoeda(item.valorContabilItem)}</td>
                      <td className="py-3 px-3 text-center text-neutral-400">
                        {item.isExportacaoImune ? 'IMUNE' : `${item.aliquotaIpi.toFixed(2)}%`}
                      </td>
                      <td className={`py-3 px-3 text-right font-bold ${item.valorIpiDebitado > 0 ? 'text-rose-400' : 'text-neutral-500'}`}>
                        {formatarMoeda(item.valorIpiDebitado)}
                      </td>
                      <td className="py-3 px-3 text-center font-sans">
                        {item.isExportacaoImune ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center gap-1">
                            <Globe2 className="w-3 h-3" /> Exportação
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-neutral-800 text-neutral-300">
                            Mercado Interno
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-sans">
                        <button
                          onClick={() => handleExcluirItem(item.id, 'SAIDA')}
                          className="p-1 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: LEGISLAÇÃO & DOSSIÊ PER/DCOMP */}
      {abaAtiva === 'legislacao' && (
        <div className="flex-1 overflow-auto p-6 max-w-4xl mx-auto w-full space-y-4">
          <div className="bg-[#1a1a1a] border border-neutral-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-400" />
              Princípio da Não-Cumulatividade & Crédito Básico (Art. 225 a 227 do RIPI / Dec. 7.212/2010)
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              O imposto é não-cumulativo, compensando-se o que for devido em cada operação com o montante cobrado nas anteriores. O direito de crédito é assegurado pela entrada de matérias-primas (MP), produtos intermediários (PI) e materiais de embalagem (ME) que participem do processo de fabricação ou integrem o produto industrializado final.
            </p>
          </div>

          <div className="bg-[#1a1a1a] border border-neutral-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-sky-400" />
              Manutenção de Créditos de IPI nas Exportações (Leis nº 9.779/1999 e 10.637/2002)
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              O saldo credor acumulado de IPI resultante da exportação de produtos industrializados não é estornado. O contribuinte possui o direito subjetivo pleno de transferir o saldo para os períodos subsequentes, utilizá-lo para compensar outros tributos federais (IRPJ, CSLL, PIS, COFINS e Contribuições Previdenciárias) ou requerer o seu <strong>ressarcimento em espécie em conta corrente bancária</strong> perante a Receita Federal do Brasil.
            </p>
          </div>

          <div className="bg-[#1a1a1a] border border-neutral-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Procedimentos de Ressarcimento Trimestral via PER/DCOMP Web (IN RFB nº 2.055/2021)
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              O Pedido de Ressarcimento de IPI deve ser formalizado ao final de cada trimestre-calendário mediante o preenchimento da Declaração de Compensação (DCOMP). É obrigatória a prévia escrituração do Livro Registro de Apuração do IPI (Modelo 8) e a transmissão regular do SPED Fiscal (EFD-ICMS/IPI Bloco C e Bloco E) para que a autoridade fiscal homologue os créditos.
            </p>
          </div>
        </div>
      )}

      {/* MODAL NOVA ENTRADA */}
      {isModalEntradaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#1a1a1a] border border-neutral-800 rounded-xl w-full max-w-lg shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                Registrar Entrada de Insumo com Crédito de IPI
              </h2>
              <button onClick={() => setIsModalEntradaOpen(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>
            <div className="p-6 space-y-3 overflow-y-auto max-h-[75vh]">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-400 mb-1 block">Data da Entrada</label>
                  <input type="date" value={entData} onChange={e => setEntData(e.target.value)} className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white" />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 mb-1 block">Número da NF-e</label>
                  <input type="text" value={entNumeroNfe} onChange={e => setEntNumeroNfe(e.target.value)} placeholder="Ex: 10482" className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white" />
                </div>
              </div>
              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Nome do Fornecedor</label>
                <input type="text" value={entFornecedor} onChange={e => setEntFornecedor(e.target.value)} placeholder="Ex: Siderúrgica Aço Forte S.A." className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-400 mb-1 block">CNPJ Fornecedor</label>
                  <input type="text" value={entCnpj} onChange={e => setEntCnpj(e.target.value)} placeholder="00.000.000/0001-00" className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white" />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 mb-1 block">Tipo de Insumo</label>
                  <select value={entTipoInsumo} onChange={e => setEntTipoInsumo(e.target.value as TipoInsumoIpi)} className="w-full bg-[#222] border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white">
                    <option value="MATERIA_PRIMA">Matéria-Prima (MP)</option>
                    <option value="PRODUTO_INTERMEDIARIO">Produto Intermediário (PI)</option>
                    <option value="MATERIAL_EMBALAGEM">Material de Embalagem (ME)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Descrição do Insumo</label>
                <input type="text" value={entDescricao} onChange={e => setEntDescricao(e.target.value)} placeholder="Ex: Bobinas de Aço Inox AISI 304" className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-neutral-400 mb-1 block">NCM</label>
                  <input type="text" value={entNcm} onChange={e => setEntNcm(e.target.value)} placeholder="7219.33.00" className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white" />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 mb-1 block">Valor Contábil (R$)</label>
                  <input type="number" value={entValorContabil} onChange={e => setEntValorContabil(Number(e.target.value))} className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono" />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 mb-1 block">Alíquota IPI (%)</label>
                  <input type="number" step="0.25" value={entAliquota} onChange={e => setEntAliquota(Number(e.target.value))} className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono" />
                </div>
              </div>
              <div className="p-3 bg-[#222] rounded-lg text-xs flex justify-between">
                <span className="text-neutral-400">Crédito Estimado de IPI:</span>
                <span className="text-emerald-400 font-bold font-mono">
                  {formatarMoeda(entValorContabil * (entAliquota / 100))}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-neutral-800 bg-[#161616]">
              <button onClick={() => setIsModalEntradaOpen(false)} className="px-4 py-1.5 text-xs text-neutral-400 hover:text-white">Cancelar</button>
              <button onClick={handleSalvarEntrada} className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold">Salvar Entrada</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NOVA SAÍDA */}
      {isModalSaidaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#1a1a1a] border border-neutral-800 rounded-xl w-full max-w-lg shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-400" />
                Registrar Saída / Faturamento de Produto
              </h2>
              <button onClick={() => setIsModalSaidaOpen(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>
            <div className="p-6 space-y-3 overflow-y-auto max-h-[75vh]">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-400 mb-1 block">Data da Saída</label>
                  <input type="date" value={saiData} onChange={e => setSaiData(e.target.value)} className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white" />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 mb-1 block">Número da NF-e</label>
                  <input type="text" value={saiNumeroNfe} onChange={e => setSaiNumeroNfe(e.target.value)} placeholder="Ex: 2050" className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white" />
                </div>
              </div>
              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Nome do Cliente</label>
                <input type="text" value={saiCliente} onChange={e => setSaiCliente(e.target.value)} placeholder="Ex: Eletrodomésticos Nacionais Ltda" className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white" />
              </div>
              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Descrição do Produto</label>
                <input type="text" value={saiDescricao} onChange={e => setSaiDescricao(e.target.value)} placeholder="Ex: Componentes Estampados" className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-neutral-400 mb-1 block">NCM</label>
                  <input type="text" value={saiNcm} onChange={e => setSaiNcm(e.target.value)} placeholder="8418.99.00" className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white" />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 mb-1 block">Valor Contábil (R$)</label>
                  <input type="number" value={saiValorContabil} onChange={e => setSaiValorContabil(Number(e.target.value))} className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono" />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 mb-1 block">Alíquota IPI (%)</label>
                  <input type="number" disabled={saiIsExportacao} step="0.25" value={saiIsExportacao ? 0 : saiAliquota} onChange={e => setSaiAliquota(Number(e.target.value))} className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono disabled:opacity-50" />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input type="checkbox" id="checkExportacao" checked={saiIsExportacao} onChange={e => setSaiIsExportacao(e.target.checked)} className="rounded border-neutral-700" />
                <label htmlFor="checkExportacao" className="text-xs text-white cursor-pointer flex items-center gap-1.5">
                  <Globe2 className="w-3.5 h-3.5 text-sky-400" />
                  Operação de Exportação (Saída Imune c/ Manutenção de Crédito - Lei 9.779/99)
                </label>
              </div>
              <div className="p-3 bg-[#222] rounded-lg text-xs flex justify-between">
                <span className="text-neutral-400">Débito Apurado de IPI:</span>
                <span className="text-rose-400 font-bold font-mono">
                  {formatarMoeda(saiIsExportacao ? 0 : saiValorContabil * (saiAliquota / 100))}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-neutral-800 bg-[#161616]">
              <button onClick={() => setIsModalSaidaOpen(false)} className="px-4 py-1.5 text-xs text-neutral-400 hover:text-white">Cancelar</button>
              <button onClick={handleSalvarSaida} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold">Salvar Saída</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
