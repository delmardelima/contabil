import React, { useState, useEffect } from 'react';
import {
  Leaf,
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
  Coins,
  Sparkles,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  Empresa,
  TituloCbio,
  ResumoCbiosRenovabio,
  TipoBiocombustivelCbio,
  StatusCbio
} from '../../types/contabil';

interface CbiosRenovabioModuleProps {
  empresaAtiva: Empresa | null;
  onOpenReportPreview?: (config: {
    titulo: string;
    subtitulo: string;
    conteudoHtml: string;
    imprimirDireto?: boolean;
  }) => void;
}

export const CbiosRenovabioModule: React.FC<CbiosRenovabioModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [resumo, setResumo] = useState<ResumoCbiosRenovabio | null>(null);
  const [anoFiltro, setAnoFiltro] = useState<number>(2026);
  const [abaAtiva, setAbaAtiva] = useState<'titulos' | 'simulador' | 'legislacao'>('titulos');
  const [busca, setBusca] = useState('');

  // Modal formulário
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemEdicao, setItemEdicao] = useState<TituloCbio | null>(null);

  // Formulário
  const [numeroLastroAnp, setNumeroLastroAnp] = useState('');
  const [tipoBiocombustivel, setTipoBiocombustivel] = useState<TipoBiocombustivelCbio>('ETANOL_HIDRATADO');
  const [quantidadeCbios, setQuantidadeCbios] = useState(10000);
  const [dataEmissao, setDataEmissao] = useState('2026-01-15');
  const [dataNegociacao, setDataNegociacao] = useState('');
  const [custoAquisicaoUnitarioBRL, setCustoAquisicaoUnitarioBRL] = useState(70.0);
  const [cotacaoMercadoB3UnitarioBRL, setCotacaoMercadoB3UnitarioBRL] = useState(88.0);
  const [valorAlienacaoTotalBRL, setValorAlienacaoTotalBRL] = useState(0);
  const [status, setStatus] = useState<StatusCbio>('CUSTODIA');
  const [instituicaoCustodiante, setInstituicaoCustodiante] = useState('B3 S.A. - Brasil, Bolsa, Balcão');
  const [observacoes, setObservacoes] = useState('');

  // Simulador de Mercado Secundário & Descarbonização
  const [simQtdCbios, setSimQtdCbios] = useState(20000);
  const [simPrecoVendaB3, setSimPrecoVendaB3] = useState(92.5);
  const [simCustoMedio, setSimCustoMedio] = useState(71.0);

  const carregarDados = () => {
    if (!empresaAtiva) return;
    const data = dbService.getCbiosRenovabio(empresaAtiva.id, anoFiltro);
    setResumo(data);
  };

  useEffect(() => {
    carregarDados();
  }, [empresaAtiva, anoFiltro]);

  const handleNovo = () => {
    setItemEdicao(null);
    setNumeroLastroAnp(`ANP-CBIO-${Date.now().toString().slice(-6)}`);
    setTipoBiocombustivel('ETANOL_HIDRATADO');
    setQuantidadeCbios(10000);
    setDataEmissao(new Date().toISOString().split('T')[0]);
    setDataNegociacao('');
    setCustoAquisicaoUnitarioBRL(70.0);
    setCotacaoMercadoB3UnitarioBRL(88.0);
    setValorAlienacaoTotalBRL(0);
    setStatus('CUSTODIA');
    setInstituicaoCustodiante('B3 S.A. - Brasil, Bolsa, Balcão');
    setObservacoes('');
    setIsModalOpen(true);
  };

  const handleEditar = (c: TituloCbio) => {
    setItemEdicao(c);
    setNumeroLastroAnp(c.numeroLastroAnp);
    setTipoBiocombustivel(c.tipoBiocombustivel);
    setQuantidadeCbios(c.quantidadeCbios);
    setDataEmissao(c.dataEmissao);
    setDataNegociacao(c.dataNegociacao || '');
    setCustoAquisicaoUnitarioBRL(c.custoAquisicaoUnitarioBRL);
    setCotacaoMercadoB3UnitarioBRL(c.cotacaoMercadoB3UnitarioBRL);
    setValorAlienacaoTotalBRL(c.valorAlienacaoTotalBRL || 0);
    setStatus(c.status);
    setInstituicaoCustodiante(c.instituicaoCustodiante);
    setObservacoes(c.observacoes || '');
    setIsModalOpen(true);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaAtiva) return;

    const valorTotalJusto = Math.round(quantidadeCbios * cotacaoMercadoB3UnitarioBRL * 100) / 100;
    const custoTotal = Math.round(quantidadeCbios * custoAquisicaoUnitarioBRL * 100) / 100;
    const ganhoMtM = Math.round((valorTotalJusto - custoTotal) * 100) / 100;

    let irrfRetido = undefined;
    if (status === 'NEGOCIADO_B3') {
      const valorBase = valorAlienacaoTotalBRL > 0 ? valorAlienacaoTotalBRL : valorTotalJusto;
      const ganhoReal = Math.max(0, valorBase - custoTotal);
      irrfRetido = Math.round((ganhoReal * 0.15) * 100) / 100;
    }

    const item: TituloCbio = {
      id: itemEdicao?.id || `cbio-${Date.now()}`,
      empresaId: empresaAtiva.id,
      numeroLastroAnp,
      tipoBiocombustivel,
      quantidadeCbios,
      dataEmissao,
      dataNegociacao: status === 'NEGOCIADO_B3' ? (dataNegociacao || new Date().toISOString().split('T')[0]) : undefined,
      custoAquisicaoUnitarioBRL,
      cotacaoMercadoB3UnitarioBRL,
      valorTotalJustoBRL: valorTotalJusto,
      ganhoMtMAcumuladoBRL: ganhoMtM,
      valorAlienacaoTotalBRL: status === 'NEGOCIADO_B3' ? (valorAlienacaoTotalBRL || valorTotalJusto) : undefined,
      irrf15RetidoB3BRL: irrfRetido,
      status,
      instituicaoCustodiante,
      integradoContabil: itemEdicao ? itemEdicao.integradoContabil : false,
      observacoes
    };

    dbService.salvarTituloCbio(item);
    setIsModalOpen(false);
    carregarDados();
  };

  const handleExcluir = (id: string) => {
    if (confirm('Confirma a exclusão deste lote de CBIOs?')) {
      dbService.excluirTituloCbio(id);
      carregarDados();
    }
  };

  const handleIntegrar = (id: string) => {
    const res = dbService.integrarAlienacaoCbioContabil(id);
    alert(res.mensagem);
    carregarDados();
  };

  const formatarMoeda = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getStatusBadge = (st: StatusCbio) => {
    switch (st) {
      case 'CUSTODIA':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">Em Custódia B3</span>;
      case 'NEGOCIADO_B3':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Alienado na B3</span>;
      case 'BLOQUEADO_APOSENTADORIA':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">Bloqueado Meta ANP</span>;
      case 'APOSENTADO':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">Aposentado (CO2e Abatido)</span>;
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
                  CNPJ: ${empresaAtiva.cnpj} | Registro de Custódia na B3 S.A.
                </p>
                <p style="margin: 2px 0; font-size: 11px; color: #444;">
                  Política Nacional de Biocombustíveis - RenovaBio (Lei Federal nº 13.576/2017)
                </p>
              </td>
              <td style="text-align: right; vertical-align: top;">
                <span style="font-size: 10px; font-weight: bold; border: 1px solid #000; padding: 4px 8px; border-radius: 4px;">
                  CBIOs - RENOVABIO
                </span>
                <p style="margin: 4px 0 0 0; font-size: 10px; color: #666;">Data: ${dataAtual}</p>
              </td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px;">
            CERTIFICADO DE CUSTÓDIA E DEMONSTRATIVO DE CBIOS
          </h2>
          <p style="margin: 3px 0 0 0; font-size: 11px; color: #555;">
            Escrituração de Créditos de Descarbonização (1 CBIO = 1 Tonelada de CO2e Abatida)
          </p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px;">
          <tr style="background-color: #f2f2f2;">
            <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Parâmetro Consolidado</th>
            <th style="border: 1px solid #ccc; padding: 8px; text-align: right;">Valores Registrados na B3</th>
          </tr>
          <tr>
            <td style="border: 1px solid #ccc; padding: 8px;">Estoque de CBIOs em Custódia Ativa</td>
            <td style="border: 1px solid #ccc; padding: 8px; text-align: right; font-weight: bold; font-family: monospace;">${resumo.totalCbiosCustodia.toLocaleString('pt-BR')} CBIOs</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ccc; padding: 8px;">CBIOs Aposentados / Bloqueados para Metas</td>
            <td style="border: 1px solid #ccc; padding: 8px; text-align: right; font-weight: bold; font-family: monospace;">${resumo.totalCbiosAposentados.toLocaleString('pt-BR')} CBIOs</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ccc; padding: 8px;">Valor Justo de Mercado em Carteira (MtM B3)</td>
            <td style="border: 1px solid #ccc; padding: 8px; text-align: right; font-weight: bold; color: #0066cc;">${formatarMoeda(resumo.valorEstoqueMercadoBRL)}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ccc; padding: 8px;">Ganho / Lucro Realizado nas Alienações no Período</td>
            <td style="border: 1px solid #ccc; padding: 8px; text-align: right; font-weight: bold; color: #2e7d32;">${formatarMoeda(resumo.lucroRealizadoPeriodoBRL)}</td>
          </tr>
          <tr style="background-color: #e8f5e9;">
            <td style="border: 1px solid #ccc; padding: 8px; font-weight: bold;">IRRF Retido Definitivo na B3 (15% Art. 60 Lei 13.986/20)</td>
            <td style="border: 1px solid #ccc; padding: 8px; text-align: right; font-weight: bold; color: #d32f2f; font-size: 12px;">${formatarMoeda(resumo.irrfTotalRetidoFonteBRL)}</td>
          </tr>
        </table>

        <h3 style="font-size: 12px; text-transform: uppercase; margin-bottom: 8px; border-bottom: 1px solid #ccc; padding-bottom: 4px;">
          Relação de Títulos de Descarbonização e Lastros Certificados pela ANP
        </h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 10px;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="border: 1px solid #ddd; padding: 6px; text-align: left;">Certificado Lastro ANP</th>
              <th style="border: 1px solid #ddd; padding: 6px; text-align: left;">Biocombustível</th>
              <th style="border: 1px solid #ddd; padding: 6px; text-align: right;">Qtd CBIOs</th>
              <th style="border: 1px solid #ddd; padding: 6px; text-align: right;">Custo Unit.</th>
              <th style="border: 1px solid #ddd; padding: 6px; text-align: right;">Cotação B3</th>
              <th style="border: 1px solid #ddd; padding: 6px; text-align: right;">Valor Justo (MtM)</th>
              <th style="border: 1px solid #ddd; padding: 6px; text-align: center;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${resumo.cbios.map(c => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 6px;">
                  <strong>${c.numeroLastroAnp}</strong><br/>
                  <span style="color: #666; font-size: 9px;">Emissão: ${c.dataEmissao}</span>
                </td>
                <td style="border: 1px solid #ddd; padding: 6px;">${c.tipoBiocombustivel}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-family: monospace;">${c.quantidadeCbios.toLocaleString('pt-BR')}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-family: monospace;">${formatarMoeda(c.custoAquisicaoUnitarioBRL)}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-family: monospace;">${formatarMoeda(c.cotacaoMercadoB3UnitarioBRL)}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-weight: bold; color: #0066cc;">${formatarMoeda(c.valorTotalJustoBRL)}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">${c.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="font-size: 10px; color: #555; background: #fafafa; border: 1px solid #eee; padding: 10px; border-radius: 4px; margin-bottom: 30px;">
          <strong>Notas Regulatórias e Tratamento Tributário (OCPC 08 e Lei nº 14.034/2020):</strong><br/>
          1. <strong>Regime Exclusivo na Fonte:</strong> Conforme o Art. 60 da Lei nº 13.986/2020 c/c Lei nº 14.034/2020, o ganho decorrente da alienação de CBIOs na B3 é tributado exclusivamente na fonte à alíquota definitiva de 15% (quinze por cento).<br/>
          2. <strong>Desoneração de PIS/COFINS:</strong> As receitas decorrentes da negociação primária ou secundária de CBIOs não integram a base de cálculo da Contribuição para o PIS/PASEP e da COFINS.<br/>
          3. <strong>Exclusão no LALUR:</strong> Por ter tributação definitiva e exclusiva, o resultado obtido na venda de CBIOs é excluído na determinação do Lucro Real e da base da CSLL na Parte A do e-LALUR/e-LACS, prevenindo qualquer bitributação.
        </div>

        <table style="width: 100%; margin-top: 40px; font-size: 11px;">
          <tr>
            <td style="width: 50%; text-align: center; padding-right: 20px;">
              <div style="border-top: 1px solid #000; padding-top: 6px;">
                <strong>${empresaAtiva.razaoSocial}</strong><br/>
                Diretor de Sustentabilidade & Relações com Mercado
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
        titulo: 'CERTIFICADO DE CUSTÓDIA E DEMONSTRATIVO DE CBIOS (RENOVABIO)',
        subtitulo: 'Posição em Bolsa (B3), Ajuste a Valor Justo e Retenção Definitiva IRRF 15%',
        conteudoHtml: html
      });
    }
  };

  const cbiosFiltrados = (resumo?.cbios || []).filter(c => {
    const termo = busca.toLowerCase();
    return (
      c.numeroLastroAnp.toLowerCase().includes(termo) ||
      c.tipoBiocombustivel.toLowerCase().includes(termo) ||
      c.status.toLowerCase().includes(termo)
    );
  });

  // Cálculo simulador
  const simValorBruto = Math.round(simQtdCbios * simPrecoVendaB3);
  const simCustoTotal = Math.round(simQtdCbios * simCustoMedio);
  const simLucroBruto = Math.max(0, simValorBruto - simCustoTotal);
  const simIrrfDefinitivo15 = Math.round(simLucroBruto * 0.15);
  const simLucroLiquido = simLucroBruto - simIrrfDefinitivo15;
  const simEconomiaPisCofins = Math.round(simValorBruto * 0.0925);

  return (
    <div className="h-full flex flex-col bg-[#141414] text-neutral-100 text-xs">
      {/* Top Header */}
      <div className="px-4 py-3 bg-[#181818] border-b border-white/5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-bold text-neutral-100">
                Créditos de Descarbonização - CBIOs (RenovaBio)
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                LEI 13.576/2017
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Controle de custódia na B3, marcação a mercado (OCPC 08) e tributação exclusiva de 15% de IRRF
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-[#202020] border border-white/10 rounded-lg p-0.5">
            <button
              onClick={() => setAbaAtiva('titulos')}
              className={`px-3 py-1 rounded-md transition font-medium text-xs flex items-center gap-1.5 ${
                abaAtiva === 'titulos'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              Custódia & Negociação
            </button>
            <button
              onClick={() => setAbaAtiva('simulador')}
              className={`px-3 py-1 rounded-md transition font-medium text-xs flex items-center gap-1.5 ${
                abaAtiva === 'simulador'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              Simulador B3 & IRRF
            </button>
            <button
              onClick={() => setAbaAtiva('legislacao')}
              className={`px-3 py-1 rounded-md transition font-medium text-xs flex items-center gap-1.5 ${
                abaAtiva === 'legislacao'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Normas & OCPC 08
            </button>
          </div>

          <button
            onClick={emitirLaudoA4}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-white/10 transition"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span>Certificado A4</span>
          </button>

          <button
            onClick={handleNovo}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-600/20 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Lote CBIO</span>
          </button>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-[#181818] border border-white/5 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[11px] text-neutral-400 uppercase font-medium">Estoque em Custódia (B3)</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-emerald-400">
                {(resumo?.totalCbiosCustodia || 0).toLocaleString('pt-BR')}
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">CBIOs</span>
            </div>
            <span className="text-[10px] text-neutral-500 mt-1">1 CBIO = 1 tonelada de CO2e</span>
          </div>

          <div className="bg-[#181818] border border-white/5 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[11px] text-neutral-400 uppercase font-medium">Valor de Mercado (MtM)</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-blue-400">
                {formatarMoeda(resumo?.valorEstoqueMercadoBRL || 0)}
              </span>
              <span className="text-[10px] text-blue-400 font-medium">Ativo VJMR</span>
            </div>
            <span className="text-[10px] text-neutral-500 mt-1">Marcação a mercado segundo OCPC 08</span>
          </div>

          <div className="bg-[#181818] border border-white/5 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[11px] text-neutral-400 uppercase font-medium">Ganho Realizado (Vendas)</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-neutral-100">
                {formatarMoeda(resumo?.lucroRealizadoPeriodoBRL || 0)}
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                DRE
              </span>
            </div>
            <span className="text-[10px] text-neutral-500 mt-1">Lucro apurado em pregão eletrônico</span>
          </div>

          <div className="bg-[#181818] border border-white/5 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[11px] text-neutral-400 uppercase font-medium">IRRF Retido B3 (15%)</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-amber-400">
                {formatarMoeda(resumo?.irrfTotalRetidoFonteBRL || 0)}
              </span>
              <span className="text-[10px] text-amber-400 font-medium font-mono">Tributação Definitiva</span>
            </div>
            <span className="text-[10px] text-neutral-500 mt-1">Sem incidência de IRPJ/CSLL na ECF</span>
          </div>
        </div>

        {/* ABA: TÍTULOS / CUSTÓDIA */}
        {abaAtiva === 'titulos' && (
          <div className="space-y-3">
            {/* Barra de Filtros */}
            <div className="flex items-center justify-between bg-[#181818] border border-white/5 p-2 rounded-lg">
              <div className="flex items-center space-x-2 flex-1 max-w-md">
                <Search className="w-3.5 h-3.5 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Filtrar por certificado ANP, biocombustível ou status..."
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
                </select>
              </div>
            </div>

            {/* Grid de CBIOs */}
            <div className="bg-[#181818] border border-white/5 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] uppercase font-bold text-neutral-400 bg-white/[0.02]">
                    <th className="py-2.5 px-3">Certificado ANP & Emissão</th>
                    <th className="py-2.5 px-3">Biocombustível</th>
                    <th className="py-2.5 px-3 text-right">Qtd CBIOs</th>
                    <th className="py-2.5 px-3 text-right">Custo Unit.</th>
                    <th className="py-2.5 px-3 text-right">Cotação B3</th>
                    <th className="py-2.5 px-3 text-right">Valor Justo (MtM)</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-center">Contabilizado</th>
                    <th className="py-2.5 px-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {cbiosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-neutral-500 text-xs">
                        Nenhum lote de CBIOs encontrado para os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    cbiosFiltrados.map((c) => (
                      <tr key={c.id} className="hover:bg-white/[0.02] transition">
                        <td className="py-2.5 px-3">
                          <div className="font-mono font-semibold text-neutral-200">{c.numeroLastroAnp}</div>
                          <div className="text-[10px] text-neutral-500 font-mono">
                            Emissão: {c.dataEmissao} {c.dataNegociacao ? `| Negociado: ${c.dataNegociacao}` : ''}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-medium text-neutral-300">{c.tipoBiocombustivel}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-neutral-200">
                          {c.quantidadeCbios.toLocaleString('pt-BR')}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-neutral-400">
                          {formatarMoeda(c.custoAquisicaoUnitarioBRL)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-400">
                          {formatarMoeda(c.cotacaoMercadoB3UnitarioBRL)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-400">
                          {formatarMoeda(c.valorTotalJustoBRL)}
                        </td>
                        <td className="py-2.5 px-3">
                          {getStatusBadge(c.status)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {c.integradoContabil ? (
                            <span className="inline-flex items-center text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-medium">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Integrado
                            </span>
                          ) : (
                            <button
                              onClick={() => handleIntegrar(c.id)}
                              className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition"
                            >
                              Integrar Venda
                            </button>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => handleEditar(c)}
                              className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-neutral-200 transition"
                              title="Editar Lote"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleExcluir(c.id)}
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

        {/* ABA: SIMULADOR B3 */}
        {abaAtiva === 'simulador' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#181818] border border-white/5 rounded-xl p-4 space-y-4">
              <h3 className="text-xs font-bold text-neutral-200 uppercase flex items-center space-x-2">
                <Calculator className="w-4 h-4 text-emerald-400" />
                <span>Simulação de Alienação na B3</span>
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] text-neutral-400">Volume de CBIOs a Negociar</label>
                  <input
                    type="number"
                    value={simQtdCbios}
                    onChange={(e) => setSimQtdCbios(Number(e.target.value))}
                    className="w-full mt-1 bg-[#202020] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-neutral-200 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400">Preço de Venda em Pregão B3 (R$/CBIO)</label>
                  <input
                    type="number"
                    step="0.10"
                    value={simPrecoVendaB3}
                    onChange={(e) => setSimPrecoVendaB3(Number(e.target.value))}
                    className="w-full mt-1 bg-[#202020] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-neutral-200 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400">Custo Médio de Emissão/Aquisição (R$/CBIO)</label>
                  <input
                    type="number"
                    step="0.10"
                    value={simCustoMedio}
                    onChange={(e) => setSimCustoMedio(Number(e.target.value))}
                    className="w-full mt-1 bg-[#202020] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-neutral-200 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[11px] text-emerald-300">
                <div className="font-semibold mb-1">Vantagem Fiscal Exclusiva:</div>
                A alienação de CBIOs na B3 é isenta de PIS e COFINS e o imposto de renda retido na fonte de 15% encerra a tributação da pessoa jurídica vendedora.
              </div>
            </div>

            <div className="md:col-span-2 bg-[#181818] border border-white/5 rounded-xl p-4 space-y-4">
              <h3 className="text-xs font-bold text-neutral-200 uppercase flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span>Resultado Financeiro & Tributário</span>
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#202020] border border-white/5 rounded-lg">
                  <span className="text-[11px] text-neutral-400">Valor Bruto de Liquidação</span>
                  <div className="text-base font-bold font-mono text-neutral-200 mt-1">
                    {formatarMoeda(simValorBruto)}
                  </div>
                </div>

                <div className="p-3 bg-[#202020] border border-white/5 rounded-lg">
                  <span className="text-[11px] text-neutral-400">Ganho de Capital Bruto</span>
                  <div className="text-base font-bold font-mono text-emerald-400 mt-1">
                    {formatarMoeda(simLucroBruto)}
                  </div>
                </div>

                <div className="p-3 bg-[#202020] border border-white/5 rounded-lg">
                  <span className="text-[11px] text-neutral-400">IRRF Definitivo Retido B3 (15%)</span>
                  <div className="text-base font-bold font-mono text-amber-400 mt-1">
                    {formatarMoeda(simIrrfDefinitivo15)}
                  </div>
                </div>

                <div className="p-3 bg-[#202020] border border-white/5 rounded-lg">
                  <span className="text-[11px] text-neutral-400">Economia PIS/COFINS (9,25% Não Incidente)</span>
                  <div className="text-base font-bold font-mono text-blue-400 mt-1">
                    {formatarMoeda(simEconomiaPisCofins)}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-emerald-900/20 to-blue-900/20 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-neutral-200 uppercase">Lucro Líquido Realizado (Após IRRF)</span>
                  <p className="text-[11px] text-neutral-400 mt-0.5">Recursos líquidos disponíveis creditados em conta corrente</p>
                </div>
                <div className="text-2xl font-bold font-mono text-emerald-400">
                  {formatarMoeda(simLucroLiquido)}
                </div>
              </div>

              <div className="space-y-2 text-[11px] text-neutral-400">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Não sofre incidência de CSLL nem adicional de IRPJ na apuração trimestral/anual da ECF.</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Exclusão automática na Parte A do e-LALUR (código de rendimento tributado exclusivamente na fonte).</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA: LEGISLAÇÃO E OCPC 08 */}
        {abaAtiva === 'legislacao' && (
          <div className="bg-[#181818] border border-white/5 rounded-xl p-5 space-y-4 leading-relaxed text-xs text-neutral-300">
            <h3 className="text-sm font-bold text-neutral-100 uppercase border-b border-white/5 pb-2">
              Política Nacional de Biocombustíveis - RenovaBio e Tratamento Contábil OCPC 08
            </h3>

            <div className="space-y-3">
              <p>
                A <strong>Lei Federal nº 13.576/2017</strong> instituiu o RenovaBio como mecanismo de mercado para expansão da produção e uso de biocombustíveis na matriz energética nacional:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3">
                <div className="p-3 bg-neutral-900/60 rounded-lg border border-white/5 space-y-2">
                  <div className="font-bold text-neutral-100 flex items-center space-x-2">
                    <Globe2 className="w-4 h-4 text-emerald-400" />
                    <span>Emissão e Ciclo dos CBIOs</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-neutral-400 text-[11px]">
                    <li><strong>Lastro Eletrônico:</strong> Emissão exclusiva por produtores certificados pela ANP, vinculada a notas fiscais eletrônicas de comercialização de biocombustíveis.</li>
                    <li><strong>Unidade de Medida:</strong> Cada CBIO equivale a 1 (uma) tonelada métrica de dióxido de carbono equivalente (tCO₂e) evitada em relação ao combustível fóssil.</li>
                    <li><strong>Custódia Centralizada:</strong> Registro obrigatório em conta de custódia na B3 S.A.</li>
                    <li><strong>Aposentadoria:</strong> Ato de retirada do CBIO de circulação para cumprimento da meta compulsória anual de distribuidores de combustíveis.</li>
                  </ul>
                </div>

                <div className="p-3 bg-neutral-900/60 rounded-lg border border-white/5 space-y-2">
                  <div className="font-bold text-neutral-100 flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    <span>Norma Contábil OCPC 08 & Tributação</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-neutral-400 text-[11px]">
                    <li><strong>Ativo Circulante VJMR:</strong> Mensuração a Valor Justo por Meio do Resultado (CPC 48 / NBC TG 48) com base na cotação média de fechamento da B3.</li>
                    <li><strong>Desoneração de PIS/COFINS:</strong> As receitas de alienação de CBIOs não entram no regime cumulativo ou não cumulativo das contribuições sociais.</li>
                    <li><strong>IRRF Definitivo (15%):</strong> Retido na fonte pela entidade registradora/corretora no ato da liquidação financeira em pregão (Art. 60 Lei 13.986/2020).</li>
                    <li><strong>Exclusão no LALUR:</strong> O ganho contábil é excluído na Parte A para apuração do Lucro Real.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Novo / Editar Lote CBIO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#1c1c1c] border border-white/10 rounded-xl shadow-2xl max-w-xl w-full p-5 text-neutral-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-sm text-neutral-100 flex items-center space-x-2">
                <Leaf className="w-4 h-4 text-emerald-400" />
                <span>{itemEdicao ? 'Editar Lote de CBIOs' : 'Registrar Lote de CBIOs na B3'}</span>
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
                  <label className="text-[11px] text-neutral-400">Número do Certificado de Lastro ANP *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: ANP-CBIO-2026-00984"
                    value={numeroLastroAnp}
                    onChange={(e) => setNumeroLastroAnp(e.target.value)}
                    className="w-full mt-1 bg-[#222] border border-white/10 rounded px-2.5 py-1.5 text-xs text-neutral-200 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400">Tipo de Biocombustível *</label>
                  <select
                    value={tipoBiocombustivel}
                    onChange={(e) => setTipoBiocombustivel(e.target.value as TipoBiocombustivelCbio)}
                    className="w-full mt-1 bg-[#222] border border-white/10 rounded px-2.5 py-1.5 text-xs text-neutral-200"
                  >
                    <option value="ETANOL_HIDRATADO">Etanol Hidratado</option>
                    <option value="ETANOL_ANIDRO">Etanol Anidro</option>
                    <option value="BIODIESEL">Biodiesel</option>
                    <option value="BIOMETANO">Biometano</option>
                    <option value="AVGU">Combustível Sustentável Aviação (SAF)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-neutral-400">Quantidade de CBIOs *</label>
                  <input
                    type="number"
                    required
                    value={quantidadeCbios}
                    onChange={(e) => setQuantidadeCbios(Number(e.target.value))}
                    className="w-full mt-1 bg-[#222] border border-white/10 rounded px-2.5 py-1.5 text-xs text-neutral-200 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400">Custo Emissão (R$/CBIO) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={custoAquisicaoUnitarioBRL}
                    onChange={(e) => setCustoAquisicaoUnitarioBRL(Number(e.target.value))}
                    className="w-full mt-1 bg-[#222] border border-white/10 rounded px-2.5 py-1.5 text-xs text-neutral-200 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400">Cotação B3 (R$/CBIO) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={cotacaoMercadoB3UnitarioBRL}
                    onChange={(e) => setCotacaoMercadoB3UnitarioBRL(Number(e.target.value))}
                    className="w-full mt-1 bg-[#222] border border-white/10 rounded px-2.5 py-1.5 text-xs text-neutral-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-neutral-400">Status do Título *</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as StatusCbio)}
                    className="w-full mt-1 bg-[#222] border border-white/10 rounded px-2.5 py-1.5 text-xs text-neutral-200"
                  >
                    <option value="CUSTODIA">Em Custódia B3</option>
                    <option value="NEGOCIADO_B3">Alienado em Pregão B3</option>
                    <option value="BLOQUEADO_APOSENTADORIA">Bloqueado para Meta</option>
                    <option value="APOSENTADO">Aposentado (Descarbonização)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400">Data de Emissão *</label>
                  <input
                    type="date"
                    required
                    value={dataEmissao}
                    onChange={(e) => setDataEmissao(e.target.value)}
                    className="w-full mt-1 bg-[#222] border border-white/10 rounded px-2.5 py-1.5 text-xs text-neutral-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-neutral-400">Notas de Auditoria & Registro B3</label>
                <textarea
                  rows={2}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Informações adicionais de custódia e notas fiscais de lastro..."
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
                  className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition shadow-lg shadow-emerald-600/20"
                >
                  Salvar CBIOs
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
