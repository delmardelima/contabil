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
  DollarSign,
  ArrowRightLeft,
  FileCheck2,
  Sparkles,
  Building,
  Factory,
  Percent,
  Clock,
  Landmark,
  Layers,
  HelpCircle,
  Sliders
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  Empresa,
  BemCreditoPisCofins,
  ResumoCreditoPisCofinsImobilizado,
  MetodoApropriacaoPisCofins,
  StatusCreditoPisCofins
} from '../../types/contabil';

interface CreditoPisCofinsImobilizadoModuleProps {
  empresaAtiva: Empresa | null;
  onOpenReportPreview?: (config: {
    titulo: string;
    subtitulo: string;
    conteudoHtml: string;
    imprimirDireto?: boolean;
  }) => void;
}

export const CreditoPisCofinsImobilizadoModule: React.FC<CreditoPisCofinsImobilizadoModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [resumo, setResumo] = useState<ResumoCreditoPisCofinsImobilizado | null>(null);
  const [anoFiltro, setAnoFiltro] = useState<number>(2026);
  const [abaAtiva, setAbaAtiva] = useState<'bens' | 'simulador' | 'legislacao'>('bens');
  const [busca, setBusca] = useState('');
  const [filtroMetodo, setFiltroMetodo] = useState<string>('TODOS');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');

  // Modal formulário
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemEdicao, setItemEdicao] = useState<BemCreditoPisCofins | null>(null);

  // Formulário
  const [codigoBem, setCodigoBem] = useState('');
  const [descricaoBem, setDescricaoBem] = useState('');
  const [categoriaAtivo, setCategoriaAtivo] = useState('Máquinas e Equipamentos Industriais');
  const [numeroNotaFiscal, setNumeroNotaFiscal] = useState('');
  const [dataAquisicao, setDataAquisicao] = useState('2025-01-15');
  const [valorAquisicaoBRL, setValorAquisicaoBRL] = useState(1500000);
  const [metodoApropriacao, setMetodoApropriacao] = useState<MetodoApropriacaoPisCofins>('AQUISICAO_48_MESES');
  const [prazoMesesTotal, setPrazoMesesTotal] = useState(48);
  const [mesesApropriados, setMesesApropriados] = useState(10);
  const [status, setStatus] = useState<StatusCreditoPisCofins>('EM_APROPRIACAO');
  const [observacoes, setObservacoes] = useState('');

  // Simulador de Métodos
  const [simValorAquisicao, setSimValorAquisicao] = useState(2000000);
  const [simVidaUtilAnosDeprec, setSimVidaUtilAnosDeprec] = useState(10);

  const carregarDados = () => {
    if (!empresaAtiva) return;
    const data = dbService.getCreditosPisCofinsImobilizado(empresaAtiva.id, anoFiltro);
    setResumo(data);
  };

  useEffect(() => {
    carregarDados();
  }, [empresaAtiva, anoFiltro]);

  const handleNovo = () => {
    setItemEdicao(null);
    setCodigoBem(`MAQ-${Math.floor(100 + Math.random() * 900)}`);
    setDescricaoBem('Robô Industrial para Solda e Montagem Automatizada');
    setCategoriaAtivo('Máquinas e Equipamentos Industriais');
    setNumeroNotaFiscal(`NF-e ${Math.floor(10000 + Math.random() * 90000)}`);
    setDataAquisicao(new Date().toISOString().split('T')[0]);
    setValorAquisicaoBRL(1800000);
    setMetodoApropriacao('AQUISICAO_48_MESES');
    setPrazoMesesTotal(48);
    setMesesApropriados(1);
    setStatus('EM_APROPRIACAO');
    setObservacoes('');
    setIsModalOpen(true);
  };

  const handleEditar = (item: BemCreditoPisCofins) => {
    setItemEdicao(item);
    setCodigoBem(item.codigoBem);
    setDescricaoBem(item.descricaoBem);
    setCategoriaAtivo(item.categoriaAtivo);
    setNumeroNotaFiscal(item.numeroNotaFiscal);
    setDataAquisicao(item.dataAquisicao);
    setValorAquisicaoBRL(item.valorAquisicaoBRL);
    setMetodoApropriacao(item.metodoApropriacao);
    setPrazoMesesTotal(item.prazoMesesTotal);
    setMesesApropriados(item.mesesApropriados);
    setStatus(item.status);
    setObservacoes(item.observacoes || '');
    setIsModalOpen(true);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaAtiva) return;

    let baseMensal = 0;
    if (metodoApropriacao === 'AQUISICAO_48_MESES') {
      baseMensal = valorAquisicaoBRL / 48;
    } else if (metodoApropriacao === 'AQUISICAO_24_MESES_MAQ') {
      baseMensal = valorAquisicaoBRL / 24;
    } else {
      baseMensal = valorAquisicaoBRL / Math.max(1, prazoMesesTotal);
    }

    baseMensal = Math.round(baseMensal * 100) / 100;
    const pisMensal = Math.round((baseMensal * 0.0165) * 100) / 100;
    const cofinsMensal = Math.round((baseMensal * 0.076) * 100) / 100;
    const totalMensal = pisMensal + cofinsMensal;
    const acumApropriado = Math.round((totalMensal * mesesApropriados) * 100) / 100;
    const saldoRemanescente = Math.max(0, valorAquisicaoBRL - (baseMensal * mesesApropriados));

    const item: BemCreditoPisCofins = {
      id: itemEdicao ? itemEdicao.id : `pis-imob-${Date.now()}`,
      empresaId: empresaAtiva.id,
      codigoBem,
      descricaoBem,
      categoriaAtivo,
      numeroNotaFiscal,
      dataAquisicao,
      valorAquisicaoBRL,
      metodoApropriacao,
      prazoMesesTotal,
      mesesApropriados,
      saldoBaseCreditoRemanescenteBRL: saldoRemanescente,
      baseCreditoMensalBRL: baseMensal,
      aliquotaPisPercentual: 1.65,
      aliquotaCofinsPercentual: 7.60,
      creditoPisMensalBRL: pisMensal,
      creditoCofinsMensalBRL: cofinsMensal,
      creditoTotalMensalBRL: totalMensal,
      creditoTotalAcumuladoApropriadoBRL: acumApropriado,
      status,
      integradoContabil: itemEdicao ? itemEdicao.integradoContabil : false,
      observacoes: observacoes.trim() ? observacoes.trim() : undefined
    };

    const res = dbService.salvarBemCreditoPisCofins(item);
    if (res.sucesso) {
      setIsModalOpen(false);
      carregarDados();
    } else {
      alert(res.mensagem);
    }
  };

  const handleExcluir = (id: string, cod: string) => {
    if (confirm(`Deseja remover o bem "${cod}" do controle de créditos PIS/COFINS?`)) {
      dbService.excluirBemCreditoPisCofins(id);
      carregarDados();
    }
  };

  const handleIntegrar = (id: string) => {
    const res = dbService.integrarCreditoPisCofinsMensalContabil(id);
    alert(res.mensagem);
    carregarDados();
  };

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Filtragem da lista
  const itensFiltrados = (resumo?.itens || []).filter(item => {
    const matchBusca =
      item.codigoBem.toLowerCase().includes(busca.toLowerCase()) ||
      item.descricaoBem.toLowerCase().includes(busca.toLowerCase()) ||
      item.numeroNotaFiscal.toLowerCase().includes(busca.toLowerCase());
    const matchMetodo = filtroMetodo === 'TODOS' || item.metodoApropriacao === filtroMetodo;
    const matchStatus = filtroStatus === 'TODOS' || item.status === filtroStatus;
    return matchBusca && matchMetodo && matchStatus;
  });

  const handleImprimirRelatorio = () => {
    if (!resumo || !empresaAtiva) return;

    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #111; padding: 20px;">
        <div style="border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px;">
          <h1 style="font-size: 20px; font-weight: bold; margin: 0; color: #1d4ed8;">DEMONSTRATIVO DE CRÉDITOS DE PIS/COFINS SOBRE O ATIVO IMOBILIZADO</h1>
          <p style="font-size: 12px; color: #555; margin: 4px 0 0 0;">Lei nº 10.833/03 Art. 3º / Bloco F120 & F130 da EFD-Contribuições - Exercício ${anoFiltro}</p>
        </div>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-bottom: 20px; font-size: 12px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div><strong>Empresa:</strong> ${empresaAtiva.razaoSocial}</div>
            <div><strong>CNPJ:</strong> ${empresaAtiva.cnpj}</div>
            <div><strong>Exercício:</strong> ${anoFiltro}</div>
            <div><strong>Total de Bens em Apropriação:</strong> ${resumo.totalBensEmApropriacao}</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px;">
          <div style="background: #f1f5f9; padding: 10px; border-radius: 6px; border-left: 4px solid #2563eb;">
            <div style="font-size: 10px; color: #64748b; text-transform: uppercase;">Base de Aquisição Total</div>
            <div style="font-size: 15px; font-weight: bold; color: #0f172a; margin-top: 4px;">${formatBRL(resumo.valorTotalBaseAquisicaoBRL)}</div>
          </div>
          <div style="background: #f1f5f9; padding: 10px; border-radius: 6px; border-left: 4px solid #0d9488;">
            <div style="font-size: 10px; color: #64748b; text-transform: uppercase;">Crédito Mensal PIS (1,65%)</div>
            <div style="font-size: 15px; font-weight: bold; color: #0f172a; margin-top: 4px;">${formatBRL(resumo.creditoMensalConsolidadoPisBRL)}</div>
          </div>
          <div style="background: #f1f5f9; padding: 10px; border-radius: 6px; border-left: 4px solid #0284c7;">
            <div style="font-size: 10px; color: #64748b; text-transform: uppercase;">Crédito Mensal COFINS (7,60%)</div>
            <div style="font-size: 15px; font-weight: bold; color: #0f172a; margin-top: 4px;">${formatBRL(resumo.creditoMensalConsolidadoCofinsBRL)}</div>
          </div>
          <div style="background: #f1f5f9; padding: 10px; border-radius: 6px; border-left: 4px solid #16a34a;">
            <div style="font-size: 10px; color: #64748b; text-transform: uppercase;">Crédito Total Mensal (9,25%)</div>
            <div style="font-size: 15px; font-weight: bold; color: #15803d; margin-top: 4px;">${formatBRL(resumo.creditoMensalConsolidadoTotalBRL)}</div>
          </div>
        </div>

        <h3 style="font-size: 14px; font-weight: bold; color: #334155; margin-bottom: 8px;">Itens Escriturados no Ativo e Quotas Mensais de Crédito</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 24px;">
          <thead>
            <tr style="background: #e2e8f0; color: #334155; text-align: left;">
              <th style="padding: 8px; border: 1px solid #cbd5e1;">Código / Bem</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">Nota Fiscal / Data</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">Método EFD</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">V. Aquisição</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Parcela</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">Crédito PIS</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">Crédito COFINS</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">Total Mês</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${resumo.itens
              .map(
                b => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">${b.codigoBem}<br/><span style="font-size: 9px; font-weight: normal; color: #64748b;">${b.descricaoBem}</span></td>
                <td style="padding: 8px; border: 1px solid #cbd5e1;">${b.numeroNotaFiscal}<br/><span style="font-size: 9px; color: #64748b;">${b.dataAquisicao}</span></td>
                <td style="padding: 8px; border: 1px solid #cbd5e1;">${b.metodoApropriacao === 'AQUISICAO_48_MESES' ? 'F120 (1/48 avos)' : b.metodoApropriacao === 'AQUISICAO_24_MESES_MAQ' ? 'F120 (1/24 avos Lei 11.051)' : 'F130 (Depreciação)'}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">${formatBRL(b.valorAquisicaoBRL)}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">${b.mesesApropriados}/${b.prazoMesesTotal}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">${formatBRL(b.creditoPisMensalBRL)}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">${formatBRL(b.creditoCofinsMensalBRL)}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold; color: #166534;">${formatBRL(b.creditoTotalMensalBRL)}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">
                  <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; background: #dcfce7; color: #166534;">${b.status}</span>
                </td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <div style="font-size: 11px; line-height: 1.5; color: #475569; border-top: 1px solid #e2e8f0; padding-top: 12px;">
          <p><strong>Fundamentação Legal (Lei 10.833/2003 / Lei 10.637/2002 / IN RFB 2.121/2022):</strong></p>
          <p>1. O crédito do PIS/COFINS sobre máquinas e equipamentos industriais utilizados na produção de bens destinados à venda pode ser apropriado opcionalmente em 1/48 avos, 1/24 avos (Lei 11.051/04) ou com base nos encargos de depreciação mensal.</p>
          <p>2. Os valores apurados são escriturados nos Blocos F120 e F130 da EFD-Contribuições e integrados aos saldos credores da apuração não-cumulativa.</p>
        </div>

        <div style="margin-top: 50px; display: flex; justify-content: space-between; text-align: center;">
          <div style="width: 45%; border-top: 1px solid #334155; padding-top: 8px;">
            <p style="margin: 0; font-weight: bold; font-size: 12px;">${empresaAtiva.razaoSocial}</p>
            <p style="margin: 0; font-size: 10px; color: #64748b;">Responsável Tributário / Fiscal</p>
          </div>
          <div style="width: 45%; border-top: 1px solid #334155; padding-top: 8px;">
            <p style="margin: 0; font-weight: bold; font-size: 12px;">Contador Responsável</p>
            <p style="margin: 0; font-size: 10px; color: #64748b;">CRC Ativo / EFD-Contribuições</p>
          </div>
        </div>
      </div>
    `;

    if (onOpenReportPreview) {
      onOpenReportPreview({
        titulo: 'Demonstrativo de Créditos PIS/COFINS sobre Ativo Imobilizado',
        subtitulo: `Empresa: ${empresaAtiva.razaoSocial} | Exercício: ${anoFiltro}`,
        conteudoHtml: html
      });
    }
  };

  // Cálculos do simulador comparativo de métodos
  const simBase48 = simValorAquisicao / 48;
  const simCred48Mes = simBase48 * 0.0925;
  const simCred48Ano = simCred48Mes * 12;

  const simBase24 = simValorAquisicao / 24;
  const simCred24Mes = simBase24 * 0.0925;
  const simCred24Ano = simCred24Mes * 12;

  const simBaseDeprec = simValorAquisicao / (simVidaUtilAnosDeprec * 12);
  const simCredDeprecMes = simBaseDeprec * 0.0925;
  const simCredDeprecAno = simCredDeprecMes * 12;

  return (
    <div className="space-y-6">
      {/* Header com identificação e ações */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1e1e1e] border border-[#2d2d2d] p-5 rounded-lg shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-950/40 border border-blue-800/50 rounded-lg text-blue-400">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
              Créditos de PIS/COFINS sobre Ativo Imobilizado
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/50 text-blue-300 border border-blue-700/50 font-normal">
                Bloco F120 & F130 EFD-Contribuições
              </span>
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Apropriação da não-cumulatividade sobre bens de produção em 1/48 avos, 1/24 avos (Lei 11.051/04) ou quotas de depreciação
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={anoFiltro}
            onChange={e => setAnoFiltro(Number(e.target.value))}
            className="bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-blue-500"
          >
            <option value={2026}>Exercício 2026</option>
            <option value={2025}>Exercício 2025</option>
            <option value={2024}>Exercício 2024</option>
          </select>

          <button
            onClick={carregarDados}
            title="Atualizar dados"
            className="p-2 bg-[#262626] hover:bg-[#333333] border border-[#3d3d3d] rounded text-gray-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleImprimirRelatorio}
            className="flex items-center space-x-1.5 bg-[#262626] hover:bg-[#333333] border border-[#3d3d3d] text-blue-400 px-3 py-1.5 rounded text-xs font-medium transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Relatório A4</span>
          </button>

          <button
            onClick={handleNovo}
            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Bem Imobilizado</span>
          </button>
        </div>
      </div>

      {/* Cards de Métricas Consolidadas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-[#1e1e1e] border border-[#2d2d2d] p-4 rounded-lg">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Bens em Apropriação</span>
            <Factory className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-gray-100">{resumo?.totalBensEmApropriacao || 0}</div>
          <div className="text-[11px] text-gray-500 mt-1">Máquinas & Equipamentos</div>
        </div>

        <div className="bg-[#1e1e1e] border border-[#2d2d2d] p-4 rounded-lg">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Base Aquisição Total</span>
            <DollarSign className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-lg font-bold text-sky-400 truncate">
            {formatBRL(resumo?.valorTotalBaseAquisicaoBRL || 0)}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">Custo de Aquisição Faturado</div>
        </div>

        <div className="bg-[#1e1e1e] border border-[#2d2d2d] p-4 rounded-lg">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Crédito PIS Mensal (1,65%)</span>
            <Coins className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-lg font-bold text-teal-400 truncate">
            {formatBRL(resumo?.creditoMensalConsolidadoPisBRL || 0)}
          </div>
          <div className="text-[11px] text-teal-600 mt-1">Apropriação da Competência</div>
        </div>

        <div className="bg-[#1e1e1e] border border-[#2d2d2d] p-4 rounded-lg">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Crédito COFINS Mensal (7,60%)</span>
            <Coins className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-lg font-bold text-cyan-400 truncate">
            {formatBRL(resumo?.creditoMensalConsolidadoCofinsBRL || 0)}
          </div>
          <div className="text-[11px] text-cyan-600 mt-1">Apropriação da Competência</div>
        </div>

        <div className="bg-[#1e1e1e] border border-[#2d2d2d] p-4 rounded-lg">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Total Mensal (9,25%)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-400 truncate">
            {formatBRL(resumo?.creditoMensalConsolidadoTotalBRL || 0)}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">PIS + COFINS Combinados</div>
        </div>
      </div>

      {/* Abas de Navegação */}
      <div className="border-b border-[#2d2d2d] flex space-x-4">
        <button
          onClick={() => setAbaAtiva('bens')}
          className={`pb-2.5 px-2 text-xs font-medium border-b-2 transition-colors flex items-center space-x-2 ${
            abaAtiva === 'bens'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Factory className="w-4 h-4" />
          <span>Bens & Apropriação Mensal ({itensFiltrados.length})</span>
        </button>

        <button
          onClick={() => setAbaAtiva('simulador')}
          className={`pb-2.5 px-2 text-xs font-medium border-b-2 transition-colors flex items-center space-x-2 ${
            abaAtiva === 'simulador'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Simulador de Modalidades (1/48 vs 1/24 vs F130)</span>
        </button>

        <button
          onClick={() => setAbaAtiva('legislacao')}
          className={`pb-2.5 px-2 text-xs font-medium border-b-2 transition-colors flex items-center space-x-2 ${
            abaAtiva === 'legislacao'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Fundamentação Legal & Bloco F120/F130</span>
        </button>
      </div>

      {/* ABA 1: BENS */}
      {abaAtiva === 'bens' && (
        <div className="space-y-4">
          {/* Barra de Filtros */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#1e1e1e] border border-[#2d2d2d] p-3 rounded-lg text-xs">
            <div className="flex items-center space-x-2 flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar por código do bem, descrição ou nota fiscal..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1.5">
                <span className="text-gray-400">Método:</span>
                <select
                  value={filtroMetodo}
                  onChange={e => setFiltroMetodo(e.target.value)}
                  className="bg-[#262626] border border-[#3d3d3d] rounded px-2 py-1 text-gray-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="TODOS">Todos os Métodos</option>
                  <option value="AQUISICAO_48_MESES">F120 (1/48 avos)</option>
                  <option value="AQUISICAO_24_MESES_MAQ">F120 (1/24 avos Lei 11.051)</option>
                  <option value="DEPRECIACAO_MENSAL_F130">F130 (Depreciação)</option>
                </select>
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="text-gray-400">Status:</span>
                <select
                  value={filtroStatus}
                  onChange={e => setFiltroStatus(e.target.value)}
                  className="bg-[#262626] border border-[#3d3d3d] rounded px-2 py-1 text-gray-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="TODOS">Todos os Status</option>
                  <option value="EM_APROPRIACAO">Em Apropriação</option>
                  <option value="CONCLUIDO">Concluído</option>
                  <option value="SUSPENSO">Suspenso</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lista de Bens */}
          {itensFiltrados.length === 0 ? (
            <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-12 text-center text-gray-500">
              <Coins className="w-12 h-12 mx-auto text-gray-600 mb-3" />
              <p className="text-sm font-medium">Nenhum bem do ativo imobilizado encontrado para crédito de PIS/COFINS.</p>
              <button
                onClick={handleNovo}
                className="mt-4 inline-flex items-center space-x-1.5 text-xs text-blue-400 hover:text-blue-300"
              >
                <Plus className="w-4 h-4" />
                <span>Cadastrar primeiro bem</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {itensFiltrados.map(item => (
                <div
                  key={item.id}
                  className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-4 hover:border-[#3d3d3d] transition-all space-y-3"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 border-b border-[#2d2d2d] pb-3">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-[#262626] border border-[#383838] rounded-md mt-0.5">
                        <Factory className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-100 text-sm">{item.codigoBem}</span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-950/60 border border-blue-800/60 text-blue-300">
                            {item.metodoApropriacao === 'AQUISICAO_48_MESES'
                              ? 'F120 (1/48 avos)'
                              : item.metodoApropriacao === 'AQUISICAO_24_MESES_MAQ'
                              ? 'F120 (1/24 avos Máq. Novas)'
                              : 'F130 (Depreciação Mensal)'}
                          </span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
                            {item.status}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          <span className="text-gray-300 font-medium">{item.descricaoBem}</span> • {item.categoriaAtivo} • {item.numeroNotaFiscal} (Entrada: {item.dataAquisicao})
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-end lg:self-center">
                      <button
                        onClick={() => handleIntegrar(item.id)}
                        className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs transition-colors border ${
                          item.integradoContabil
                            ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-400 hover:bg-emerald-900/30'
                            : 'bg-blue-950/40 border-blue-800/60 text-blue-300 hover:bg-blue-900/50'
                        }`}
                      >
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>{item.integradoContabil ? 'Reintegrar Quota' : 'Integrar Quota Mensal'}</span>
                      </button>

                      <button
                        onClick={() => handleEditar(item)}
                        className="p-1.5 bg-[#262626] hover:bg-[#333333] border border-[#3d3d3d] text-gray-300 rounded transition-colors"
                        title="Editar bem"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleExcluir(item.id, item.codigoBem)}
                        className="p-1.5 bg-[#262626] hover:bg-red-950/50 border border-[#3d3d3d] text-red-400 rounded transition-colors"
                        title="Excluir bem"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Detalhes Financeiros */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs bg-[#242424] p-3 rounded border border-[#2e2e2e]">
                    <div>
                      <div className="text-gray-500 text-[10px]">Custo de Aquisição</div>
                      <div className="text-gray-200 font-semibold font-mono mt-0.5">{formatBRL(item.valorAquisicaoBRL)}</div>
                    </div>

                    <div>
                      <div className="text-gray-500 text-[10px]">Progresso de Parcelas</div>
                      <div className="text-blue-400 font-semibold mt-0.5">
                        {item.mesesApropriados} de {item.prazoMesesTotal} meses ({Math.round((item.mesesApropriados / item.prazoMesesTotal) * 100)}%)
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-500 text-[10px]">Base Mensal de Crédito</div>
                      <div className="text-gray-300 font-mono mt-0.5">{formatBRL(item.baseCreditoMensalBRL)}</div>
                    </div>

                    <div>
                      <div className="text-gray-500 text-[10px]">Crédito PIS (1,65%)</div>
                      <div className="text-teal-400 font-bold font-mono mt-0.5">{formatBRL(item.creditoPisMensalBRL)}</div>
                    </div>

                    <div>
                      <div className="text-gray-500 text-[10px]">Crédito COFINS (7,60%)</div>
                      <div className="text-cyan-400 font-bold font-mono mt-0.5">{formatBRL(item.creditoCofinsMensalBRL)}</div>
                    </div>

                    <div>
                      <div className="text-gray-500 text-[10px]">Total Mensal (9,25%)</div>
                      <div className="text-emerald-400 font-bold font-mono mt-0.5">{formatBRL(item.creditoTotalMensalBRL)}</div>
                    </div>
                  </div>

                  {/* Rodapé: Acumulado & Observações */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-gray-400 gap-2 px-1">
                    <div className="flex items-center space-x-4">
                      <span>
                        Crédito Acumulado Apropriado: <strong className="text-emerald-300">{formatBRL(item.creditoTotalAcumuladoApropriadoBRL)}</strong>
                      </span>
                      <span>
                        Saldo Base Remanescente: <strong className="text-gray-300">{formatBRL(item.saldoBaseCreditoRemanescenteBRL)}</strong>
                      </span>
                    </div>
                    {item.observacoes && (
                      <div className="text-gray-500 italic truncate max-w-xs" title={item.observacoes}>
                        {item.observacoes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ABA 2: SIMULADOR DE MÉTODOS */}
      {abaAtiva === 'simulador' && (
        <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-5 space-y-6">
          <div className="border-b border-[#2d2d2d] pb-3">
            <h3 className="text-sm font-semibold text-gray-100 flex items-center space-x-2">
              <Calculator className="w-4 h-4 text-blue-400" />
              <span>Simulador Comparativo de Recuperação de PIS/COFINS (1/48 vs 1/24 vs Depreciação)</span>
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Avalie o impacto no fluxo de caixa tributário ao optar pela apropriação acelerada em 24 meses (Lei 11.051/04) comparada aos 48 meses padrão ou à vida útil contábil.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 bg-[#242424] p-4 rounded-lg border border-[#2e2e2e]">
              <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-blue-400" />
                <span>Parâmetros de Simulação</span>
              </h4>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Valor de Aquisição do Bem Industrial (BRL)</label>
                <input
                  type="number"
                  value={simValorAquisicao}
                  onChange={e => setSimValorAquisicao(Number(e.target.value))}
                  className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Vida Útil Contábil Estimada (anos para F130)</label>
                <input
                  type="number"
                  value={simVidaUtilAnosDeprec}
                  onChange={e => setSimVidaUtilAnosDeprec(Number(e.target.value))}
                  className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="bg-blue-950/30 border border-blue-800/40 p-3 rounded text-[11px] text-blue-300 leading-relaxed">
                <strong>Alíquotas Aplicáveis:</strong> PIS não-cumulativo (1,65%) e COFINS não-cumulativa (7,60%), gerando crédito líquido de 9,25% sobre a base mensal autorizada pela legislação federal.
              </div>
            </div>

            <div className="space-y-4 bg-[#242424] p-4 rounded-lg border border-[#2e2e2e]">
              <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Fluxo Comparativo de Créditos</span>
              </h4>

              <div className="space-y-3">
                <div className="bg-[#1c1c1c] p-3 rounded border border-blue-900/40 flex justify-between items-center">
                  <div>
                    <div className="text-[11px] text-blue-400 font-semibold">1/24 avos - Lei 11.051/04 (Máquinas Novas)</div>
                    <div className="text-base font-bold text-gray-100 mt-0.5">{formatBRL(simCred24Mes)}/mês</div>
                    <div className="text-[10px] text-gray-400">Total 1º Ano: {formatBRL(simCred24Ano)}</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 font-semibold">
                    MAIS VANTAJOSO
                  </span>
                </div>

                <div className="bg-[#1c1c1c] p-3 rounded border border-[#333333] flex justify-between items-center">
                  <div>
                    <div className="text-[11px] text-gray-300 font-semibold">1/48 avos - Regra Geral F120</div>
                    <div className="text-base font-bold text-gray-100 mt-0.5">{formatBRL(simCred48Mes)}/mês</div>
                    <div className="text-[10px] text-gray-400">Total 1º Ano: {formatBRL(simCred48Ano)}</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-400">
                    PADRÃO
                  </span>
                </div>

                <div className="bg-[#1c1c1c] p-3 rounded border border-[#333333] flex justify-between items-center">
                  <div>
                    <div className="text-[11px] text-gray-300 font-semibold">Depreciação F130 ({simVidaUtilAnosDeprec} anos)</div>
                    <div className="text-base font-bold text-gray-100 mt-0.5">{formatBRL(simCredDeprecMes)}/mês</div>
                    <div className="text-[10px] text-gray-400">Total 1º Ano: {formatBRL(simCredDeprecAno)}</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-400">
                    DILUÍDO
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: FUNDAMENTAÇÃO LEGAL */}
      {abaAtiva === 'legislacao' && (
        <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-5 space-y-5">
          <div className="border-b border-[#2d2d2d] pb-3">
            <h3 className="text-sm font-semibold text-gray-100 flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-blue-400" />
              <span>Diretrizes e Regras Fiscais: PIS/COFINS sobre Imobilizado</span>
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Legislação aplicável às pessoas jurídicas tributadas pelo Lucro Real na modalidade não-cumulativa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-[#242424] border border-[#2e2e2e] p-4 rounded-lg space-y-2">
              <div className="text-blue-400 font-semibold flex items-center space-x-1.5">
                <FileText className="w-4 h-4" />
                <span>1. Regra Geral de 1/48 avos (F120)</span>
              </div>
              <p className="text-gray-300 text-[11px] leading-relaxed">
                Art. 3º, VI, da Lei nº 10.833/2003 e Art. 3º, VI, da Lei nº 10.637/2002. Aplica-se à aquisição de máquinas, equipamentos e outros bens incorporados ao Ativo Imobilizado para utilização na produção de bens destinados à venda ou na prestação de serviços.
              </p>
            </div>

            <div className="bg-[#242424] border border-[#2e2e2e] p-4 rounded-lg space-y-2">
              <div className="text-emerald-400 font-semibold flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4" />
                <span>2. Aceleração em 1/24 avos (Lei 11.051)</span>
              </div>
              <p className="text-gray-300 text-[11px] leading-relaxed">
                Art. 1º da Lei nº 11.051/2004 e Art. 165 da IN RFB nº 2.121/2022. Permite a apropriação em 24 meses dos créditos de PIS e COFINS decorrentes da aquisição de máquinas e aparelhos novos destinados ao ativo imobilizado fabril.
              </p>
            </div>

            <div className="bg-[#242424] border border-[#2e2e2e] p-4 rounded-lg space-y-2">
              <div className="text-teal-400 font-semibold flex items-center space-x-1.5">
                <Clock className="w-4 h-4" />
                <span>3. Quota de Depreciação (F130)</span>
              </div>
              <p className="text-gray-300 text-[11px] leading-relaxed">
                Art. 3º, § 1º, III, das Leis 10.637 e 10.833. O crédito é apurado com base no encargo mensal de depreciação escriturado na contabilidade societária, aplicando-se 1,65% de PIS e 7,60% de COFINS sobre a quota fiscal.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CRIAÇÃO / EDIÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 overflow-y-auto">
          <div className="bg-[#1e1e1e] border border-[#3d3d3d] rounded-lg max-w-2xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#2d2d2d] pb-3">
              <h3 className="text-base font-bold text-gray-100 flex items-center space-x-2">
                <Coins className="w-5 h-5 text-blue-400" />
                <span>{itemEdicao ? 'Editar Bem do Imobilizado' : 'Novo Bem para Crédito de PIS/COFINS'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvar} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Código do Bem *</label>
                  <input
                    type="text"
                    required
                    value={codigoBem}
                    onChange={e => setCodigoBem(e.target.value)}
                    placeholder="Ex: MAQ-IND-0104"
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Categoria do Ativo *</label>
                  <input
                    type="text"
                    required
                    value={categoriaAtivo}
                    onChange={e => setCategoriaAtivo(e.target.value)}
                    placeholder="Ex: Máquinas e Equipamentos Industriais"
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Descrição do Bem *</label>
                <input
                  type="text"
                  required
                  value={descricaoBem}
                  onChange={e => setDescricaoBem(e.target.value)}
                  placeholder="Ex: Torno CNC Multitask 7 Eixos"
                  className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Número NF-e *</label>
                  <input
                    type="text"
                    required
                    value={numeroNotaFiscal}
                    onChange={e => setNumeroNotaFiscal(e.target.value)}
                    placeholder="Ex: NF-e 84.102"
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Data Aquisição *</label>
                  <input
                    type="date"
                    required
                    value={dataAquisicao}
                    onChange={e => setDataAquisicao(e.target.value)}
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Valor Aquisição (BRL) *</label>
                  <input
                    type="number"
                    required
                    value={valorAquisicaoBRL}
                    onChange={e => setValorAquisicaoBRL(Number(e.target.value))}
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Método EFD *</label>
                  <select
                    value={metodoApropriacao}
                    onChange={e => {
                      const m = e.target.value as MetodoApropriacaoPisCofins;
                      setMetodoApropriacao(m);
                      if (m === 'AQUISICAO_48_MESES') setPrazoMesesTotal(48);
                      else if (m === 'AQUISICAO_24_MESES_MAQ') setPrazoMesesTotal(24);
                    }}
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="AQUISICAO_48_MESES">F120 (1/48 avos)</option>
                    <option value="AQUISICAO_24_MESES_MAQ">F120 (1/24 avos Lei 11.051)</option>
                    <option value="DEPRECIACAO_MENSAL_F130">F130 (Depreciação)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Prazo Meses Total *</label>
                  <input
                    type="number"
                    required
                    value={prazoMesesTotal}
                    onChange={e => setPrazoMesesTotal(Number(e.target.value))}
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Meses Apropriados *</label>
                  <input
                    type="number"
                    required
                    value={mesesApropriados}
                    onChange={e => setMesesApropriados(Number(e.target.value))}
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Status de Apropriação *</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as StatusCreditoPisCofins)}
                  className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="EM_APROPRIACAO">Em Apropriação</option>
                  <option value="CONCLUIDO">Concluído</option>
                  <option value="SUSPENSO">Suspenso</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Observações Técnicas</label>
                <textarea
                  rows={2}
                  value={observacoes}
                  onChange={e => setObservacoes(e.target.value)}
                  placeholder="Informações sobre uso fabril direto, laudo pericial ou número de série do maquinário..."
                  className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-[#2d2d2d]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#262626] hover:bg-[#333333] border border-[#3d3d3d] text-gray-300 rounded text-xs font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold shadow-sm transition-colors"
                >
                  Salvar Bem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
