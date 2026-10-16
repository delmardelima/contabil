import React, { useState, useEffect } from 'react';
import {
  Coins,
  Plus,
  RefreshCw,
  Printer,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  FileText,
  Search,
  Filter,
  Calculator,
  Percent,
  Calendar,
  Layers,
  Edit,
  Trash2,
  ShieldCheck,
  Scale
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  Empresa,
  ItemReceitaFinanceiraTributada,
  ResumoPisCofinsReceitasFinanceiras,
  TipoReceitaFinanceira
} from '../../types/contabil';

interface PisCofinsReceitasFinanceirasModuleProps {
  empresaAtiva: Empresa | null;
  onOpenReportPreview?: (config: {
    titulo: string;
    subtitulo: string;
    conteudoHtml: string;
    imprimirDireto?: boolean;
  }) => void;
}

export const PisCofinsReceitasFinanceirasModule: React.FC<PisCofinsReceitasFinanceirasModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [resumo, setResumo] = useState<ResumoPisCofinsReceitasFinanceiras | null>(null);
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('TODAS');
  const [competenciaAtiva, setCompetenciaAtiva] = useState('2026-03');
  const [abaAtiva, setAbaAtiva] = useState<'apuracao' | 'simulador' | 'legislacao'>('apuracao');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemReceitaFinanceiraTributada | null>(null);

  // Form Fields
  const [tipo, setTipo] = useState<TipoReceitaFinanceira>('JUROS_CAPITAL_PROPRIO');
  const [descricao, setDescricao] = useState('');
  const [instituicaoFinanceiraOuPagador, setInstituicaoFinanceiraOuPagador] = useState('');
  const [data, setData] = useState('2026-03-15');
  const [valorBrutoReceita, setValorBrutoReceita] = useState<number>(50000);
  const [temIsencaoAliquotaZero, setTemIsencaoAliquotaZero] = useState(false);
  const [fundamentacaoIsencao, setFundamentacaoIsencao] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // Simulador State
  const [simValor, setSimValor] = useState<number>(100000);
  const [simIsento, setSimIsento] = useState(false);

  const carregarDados = () => {
    if (!empresaAtiva) return;
    const res = dbService.getResumoPisCofinsReceitasFinanceiras(empresaAtiva.id, competenciaAtiva);
    setResumo(res);
  };

  useEffect(() => {
    carregarDados();
  }, [empresaAtiva, competenciaAtiva]);

  const handleOpenNovo = () => {
    setEditingItem(null);
    setTipo('JUROS_CAPITAL_PROPRIO');
    setDescricao('');
    setInstituicaoFinanceiraOuPagador('');
    setData(`${competenciaAtiva}-15`);
    setValorBrutoReceita(50000);
    setTemIsencaoAliquotaZero(false);
    setFundamentacaoIsencao('');
    setObservacoes('');
    setIsModalOpen(true);
  };

  const handleOpenEditar = (item: ItemReceitaFinanceiraTributada) => {
    setEditingItem(item);
    setTipo(item.tipo);
    setDescricao(item.descricao);
    setInstituicaoFinanceiraOuPagador(item.instituicaoFinanceiraOuPagador);
    setData(item.data);
    setValorBrutoReceita(item.valorBrutoReceita);
    setTemIsencaoAliquotaZero(item.temIsencaoAliquotaZero);
    setFundamentacaoIsencao(item.fundamentacaoIsencao || '');
    setObservacoes(item.observacoes || '');
    setIsModalOpen(true);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaAtiva) return;

    const baseCalculo = temIsencaoAliquotaZero ? 0 : Number(valorBrutoReceita);
    const aliqPis = temIsencaoAliquotaZero ? 0 : 0.65;
    const aliqCofins = temIsencaoAliquotaZero ? 0 : 4.0;
    const vPis = Math.round((aliqPis / 100) * baseCalculo * 100) / 100;
    const vCofins = Math.round((aliqCofins / 100) * baseCalculo * 100) / 100;

    const item: ItemReceitaFinanceiraTributada = {
      id: editingItem ? editingItem.id : Date.now(),
      empresaId: empresaAtiva.id,
      competencia: competenciaAtiva,
      data,
      tipo,
      descricao,
      instituicaoFinanceiraOuPagador,
      valorBrutoReceita: Number(valorBrutoReceita),
      temIsencaoAliquotaZero,
      fundamentacaoIsencao: temIsencaoAliquotaZero ? fundamentacaoIsencao : undefined,
      baseCalculoEfetiva: baseCalculo,
      aliquotaPis: aliqPis,
      valorPisApurado: vPis,
      aliquotaCofins: aliqCofins,
      valorCofinsApurado: vCofins,
      totalPisCofins: Math.round((vPis + vCofins) * 100) / 100,
      codigoDarfPis: '6912',
      codigoDarfCofins: '5856',
      integradoContabil: editingItem ? editingItem.integradoContabil : false,
      observacoes
    };

    dbService.salvarReceitaFinanceiraPisCofins(item);
    setIsModalOpen(false);
    carregarDados();
  };

  const handleExcluir = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este lançamento de receita financeira?')) {
      dbService.excluirReceitaFinanceiraPisCofins(id);
      carregarDados();
    }
  };

  const handleIntegrarContabil = (id: number) => {
    const res = dbService.integrarPisCofinsRecFinContabil(id);
    alert(res.mensagem);
    carregarDados();
  };

  const handleEmitirDossieA4 = () => {
    if (!onOpenReportPreview || !empresaAtiva || !resumo) return;

    const linhasHtml = resumo.itens
      .map(
        i => `
        <tr style="border-bottom: 1px solid #ddd; ${i.temIsencaoAliquotaZero ? 'background-color: #fafafa;' : ''}">
          <td style="padding: 5px; font-family: monospace;">${new Date(i.data).toLocaleDateString('pt-BR')}</td>
          <td style="padding: 5px;">
            <strong>${i.descricao}</strong><br/>
            <span style="font-size: 7.5pt; color: #555;">${i.instituicaoFinanceiraOuPagador} • ${i.tipo.replace(/_/g, ' ')}</span>
          </td>
          <td style="padding: 5px; text-align: right; font-family: monospace;">R$ ${i.valorBrutoReceita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
          <td style="padding: 5px; text-align: right; font-family: monospace; font-weight: bold;">R$ ${i.baseCalculoEfetiva.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
          <td style="padding: 5px; text-align: right; font-family: monospace; color: #0891b2;">R$ ${i.valorPisApurado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
          <td style="padding: 5px; text-align: right; font-family: monospace; color: #0891b2;">R$ ${i.valorCofinsApurado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
          <td style="padding: 5px; text-align: right; font-family: monospace; font-weight: bold; color: #0e7490;">R$ ${i.totalPisCofins.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        </tr>
      `
      )
      .join('');

    const html = `
      <div style="font-family: Arial, sans-serif; font-size: 10pt; color: #111; line-height: 1.4;">
        <div style="text-align: center; border-bottom: 2px solid #0891b2; padding-bottom: 12px; margin-bottom: 16px;">
          <h2 style="margin: 0; color: #0e7490; font-size: 14pt; text-transform: uppercase;">
            ${empresaAtiva.razaoSocial}
          </h2>
          <div style="font-size: 8.5pt; color: #555; margin-top: 3px;">
            CNPJ: ${empresaAtiva.cnpj} | Regime: LUCRO REAL NÃO CUMULATIVO | Competência: ${competenciaAtiva}
          </div>
          <h3 style="margin: 10px 0 0 0; color: #111; font-size: 12pt;">
            MEMÓRIA DE APURAÇÃO DE PIS E COFINS SOBRE RECEITAS FINANCEIRAS (DECRETO Nº 8.426/2015)
          </h3>
          <div style="font-size: 8.5pt; color: #0891b2; font-weight: bold; margin-top: 2px;">
            DARF PIS: Cód. 6912 (0,65%) | DARF COFINS: Cód. 5856 (4,00%)
          </div>
        </div>

        <div style="margin-bottom: 14px; background-color: #ecfeff; border: 1px solid #a5f3fc; padding: 10px; border-radius: 4px; font-size: 9pt;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="width: 25%; font-weight: bold; color: #0e7490;">Receitas Brutas:</td>
              <td style="width: 25%; font-family: monospace;">R$ ${resumo.totalReceitasBrutas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              <td style="width: 25%; font-weight: bold; color: #0e7490;">Base Tributável:</td>
              <td style="width: 25%; font-family: monospace; font-weight: bold;">R$ ${resumo.totalReceitasTributaveis.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #0e7490;">Receitas Isentas (Hedge):</td>
              <td style="font-family: monospace;">R$ ${resumo.totalReceitasIsentas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              <td style="font-weight: bold; color: #0e7490;">Total PIS + COFINS Devido:</td>
              <td style="font-family: monospace; font-weight: bold; color: #0e7490; font-size: 10.5pt;">R$ ${resumo.totalTributosDevidos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            </tr>
          </table>
        </div>

        <h4 style="color: #0e7490; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-top: 14px; margin-bottom: 8px; font-size: 10pt;">
          DEMONSTRATIVO ANALÍTICO DE RECEITAS E GUIAS DE RECOLHIMENTO
        </h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 8pt; margin-bottom: 16px;">
          <thead>
            <tr style="background-color: #0891b2; color: white;">
              <th style="padding: 5px; border: 1px solid #0891b2; text-align: left;">Data</th>
              <th style="padding: 5px; border: 1px solid #0891b2; text-align: left;">Descrição da Receita Financeira</th>
              <th style="padding: 5px; border: 1px solid #0891b2; text-align: right;">Bruto (R$)</th>
              <th style="padding: 5px; border: 1px solid #0891b2; text-align: right;">Base Efetiva (R$)</th>
              <th style="padding: 5px; border: 1px solid #0891b2; text-align: right;">PIS 0,65% (R$)</th>
              <th style="padding: 5px; border: 1px solid #0891b2; text-align: right;">COFINS 4% (R$)</th>
              <th style="padding: 5px; border: 1px solid #0891b2; text-align: right;">Total DARF (R$)</th>
            </tr>
          </thead>
          <tbody>
            ${linhasHtml}
          </tbody>
        </table>

        <div style="margin-top: 35px; display: flex; justify-content: space-between; text-align: center;">
          <div style="width: 45%;">
            <div style="border-top: 1px solid #333; padding-top: 5px; font-weight: bold; font-size: 9pt;">
              Departamento Fiscal / Tributário
            </div>
            <div style="font-size: 8pt; color: #555;">
              ${empresaAtiva.razaoSocial}
            </div>
          </div>
          <div style="width: 45%;">
            <div style="border-top: 1px solid #333; padding-top: 5px; font-weight: bold; font-size: 9pt;">
              Contador Responsável Técnico
            </div>
            <div style="font-size: 8pt; color: #555;">
              CRC Oficial Ativo — ERP Contábil Studio Pro
            </div>
          </div>
        </div>
      </div>
    `;

    onOpenReportPreview({
      titulo: 'APURAÇÃO DE PIS E COFINS S/ RECEITAS FINANCEIRAS',
      subtitulo: `Competência ${competenciaAtiva} - Decreto nº 8.426/2015`,
      conteudoHtml: html
    });
  };

  const itensFiltrados = (resumo?.itens || []).filter(item => {
    const matchBusca =
      item.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      item.instituicaoFinanceiraOuPagador.toLowerCase().includes(busca.toLowerCase());
    const matchTipo = filtroTipo === 'TODAS' || item.tipo === filtroTipo;
    return matchBusca && matchTipo;
  });

  // Simulador
  const simBase = simIsento ? 0 : simValor;
  const simPis = simIsento ? 0 : Math.round((0.65 / 100) * simBase * 100) / 100;
  const simCofins = simIsento ? 0 : Math.round((4.0 / 100) * simBase * 100) / 100;

  return (
    <div className="h-full flex flex-col bg-[#141414] text-neutral-200">
      {/* Top Header */}
      <div className="p-4 bg-[#181818] border-b border-[#262626] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-cyan-950/60 border border-cyan-700/50 text-cyan-400">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-semibold text-white tracking-wide">
                PIS & COFINS sobre Receitas Financeiras (Decreto nº 8.426/2015)
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-cyan-900/60 text-cyan-300 border border-cyan-700/60">
                0,65% & 4,00%
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Apuração para entidades no Lucro Real Não Cumulativo, segregação de hedge de exportação e emissão de DARFs 6912 e 5856
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 bg-[#202020] border border-[#2e2e2e] rounded px-2.5 py-1">
            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-xs text-neutral-400">Competência:</span>
            <input
              type="month"
              value={competenciaAtiva}
              onChange={e => setCompetenciaAtiva(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
            />
          </div>
          <button
            onClick={carregarDados}
            className="p-2 text-neutral-400 hover:text-white hover:bg-[#262626] rounded transition-colors"
            title="Recarregar dados"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleEmitirDossieA4}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-neutral-200 bg-[#252525] hover:bg-[#303030] border border-[#383838] rounded transition-colors"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>Dossiê DARF A4</span>
          </button>
          <button
            onClick={handleOpenNovo}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Receita Financeira</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Bar */}
      <div className="grid grid-cols-6 gap-3 p-4 bg-[#161616] border-b border-[#242424]">
        <div className="p-3 rounded-lg bg-[#1a1a1a] border border-[#282828]">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs">Receitas Brutas</span>
            <DollarSign className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-base font-bold text-white font-mono">
            R$ {(resumo?.totalReceitasBrutas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">JCP, CDB, variações cambiais</div>
        </div>

        <div className="p-3 rounded-lg bg-[#1a1a1a] border border-[#282828]">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs">Base Tributável</span>
            <Calculator className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-base font-bold text-cyan-400 font-mono">
            R$ {(resumo?.totalReceitasTributaveis || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Base efetiva de cálculo</div>
        </div>

        <div className="p-3 rounded-lg bg-[#1a1a1a] border border-[#282828]">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs">Receitas Isentas</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-base font-bold text-emerald-400 font-mono">
            R$ {(resumo?.totalReceitasIsentas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Hedge exportação alíq. zero</div>
        </div>

        <div className="p-3 rounded-lg bg-[#1a1a1a] border border-[#282828]">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs">PIS 0,65% (DARF 6912)</span>
            <Percent className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-base font-bold text-amber-400 font-mono">
            R$ {(resumo?.totalPis || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Alíquota Decreto 8.426</div>
        </div>

        <div className="p-3 rounded-lg bg-[#1a1a1a] border border-[#282828]">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs">COFINS 4% (DARF 5856)</span>
            <Percent className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-base font-bold text-cyan-400 font-mono">
            R$ {(resumo?.totalCofins || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Alíquota Decreto 8.426</div>
        </div>

        <div className="p-3 rounded-lg bg-[#1a1a1a] border border-[#282828]">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs">Total Tributos</span>
            <TrendingUp className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-base font-bold text-rose-400 font-mono">
            R$ {(resumo?.totalTributosDevidos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Carga de 4,65% s/ Base</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1 px-4 border-b border-[#262626] bg-[#181818]">
        <button
          onClick={() => setAbaAtiva('apuracao')}
          className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
            abaAtiva === 'apuracao'
              ? 'border-cyan-500 text-cyan-400 bg-[#202020]'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          Demonstrativo Mensal de Receitas
        </button>
        <button
          onClick={() => setAbaAtiva('simulador')}
          className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
            abaAtiva === 'simulador'
              ? 'border-cyan-500 text-cyan-400 bg-[#202020]'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          Simulador de Alíquotas e Segregação
        </button>
        <button
          onClick={() => setAbaAtiva('legislacao')}
          className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
            abaAtiva === 'legislacao'
              ? 'border-cyan-500 text-cyan-400 bg-[#202020]'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          Legislação & Enquadramento STF
        </button>
      </div>

      {/* Content: Apuração */}
      {abaAtiva === 'apuracao' && (
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-3 gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-neutral-500" />
              <input
                type="text"
                placeholder="Buscar por descrição ou instituição pagadora..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#1a1a1a] border border-[#2a2a2a] rounded text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-3.5 h-3.5 text-neutral-500" />
              <select
                value={filtroTipo}
                onChange={e => setFiltroTipo(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-[#1a1a1a] border border-[#2a2a2a] rounded text-neutral-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="TODAS">Todos os Tipos de Receita</option>
                <option value="JUROS_CAPITAL_PROPRIO">Juros sobre Capital Próprio (JCP)</option>
                <option value="RENDIMENTO_APLICACAO_RENDA_FIXA">Rendimento Renda Fixa (CDB/DI)</option>
                <option value="VARIACAO_CAMBIAL_ATIVA">Variação Cambial Ativa</option>
                <option value="OPERACAO_HEDGE_COBERTURA">Hedge de Exportação</option>
                <option value="DESCONTO_OBTIDO">Descontos Obtidos</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-auto rounded border border-[#262626] bg-[#171717]">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-[#1f1f1f] text-neutral-300 sticky top-0 border-b border-[#2a2a2a]">
                <tr>
                  <th className="p-2.5 font-semibold">Data / Descrição</th>
                  <th className="p-2.5 font-semibold">Tipo de Receita</th>
                  <th className="p-2.5 font-semibold text-right">Valor Bruto</th>
                  <th className="p-2.5 font-semibold text-right">Base Efetiva</th>
                  <th className="p-2.5 font-semibold text-right">PIS 0,65%</th>
                  <th className="p-2.5 font-semibold text-right">COFINS 4,00%</th>
                  <th className="p-2.5 font-semibold text-right">Total DARF</th>
                  <th className="p-2.5 font-semibold text-center">Status</th>
                  <th className="p-2.5 font-semibold text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#242424]">
                {itensFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-6 text-center text-neutral-500">
                      Nenhuma receita financeira cadastrada nesta competência. Clique em "Nova Receita Financeira".
                    </td>
                  </tr>
                ) : (
                  itensFiltrados.map(item => (
                    <tr key={item.id} className="hover:bg-[#1d1d1d] transition-colors">
                      <td className="p-2.5">
                        <div className="font-semibold text-white">{item.descricao}</div>
                        <div className="text-[10px] text-neutral-500 mt-0.5">
                          {new Date(item.data).toLocaleDateString('pt-BR')} • {item.instituicaoFinanceiraOuPagador}
                        </div>
                        {item.temIsencaoAliquotaZero && (
                          <span className="inline-block px-1.5 py-0.2 rounded text-[9px] bg-emerald-950/70 text-emerald-300 border border-emerald-800/40 mt-1">
                            Alíquota Zero (Hedge Exportação)
                          </span>
                        )}
                      </td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#222] border border-[#333] text-neutral-300">
                          {item.tipo.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-2.5 text-right font-mono text-neutral-300">
                        R$ {item.valorBrutoReceita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2.5 text-right font-mono font-semibold text-cyan-400">
                        R$ {item.baseCalculoEfetiva.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2.5 text-right font-mono text-amber-400">
                        R$ {item.valorPisApurado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2.5 text-right font-mono text-cyan-400">
                        R$ {item.valorCofinsApurado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-rose-400">
                        R$ {item.totalPisCofins.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2.5 text-center">
                        {item.integradoContabil ? (
                          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                            <CheckCircle className="w-3 h-3" />
                            <span>Integrado</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] bg-amber-950/60 text-amber-400 border border-amber-800/40">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Pendente</span>
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => handleIntegrarContabil(item.id)}
                            className="p-1 text-emerald-400 hover:bg-emerald-950/50 rounded transition-colors"
                            title="Integrar Provisão no Diário Geral"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditar(item)}
                            className="p-1 text-neutral-400 hover:bg-neutral-800 rounded transition-colors"
                            title="Editar Receita"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleExcluir(item.id)}
                            className="p-1 text-rose-400 hover:bg-rose-950/50 rounded transition-colors"
                            title="Excluir Receita"
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

      {/* Content: Simulador */}
      {abaAtiva === 'simulador' && (
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="p-4 rounded-lg bg-[#181818] border border-[#262626]">
              <h2 className="text-sm font-semibold text-white mb-1 flex items-center space-x-2">
                <Calculator className="w-4 h-4 text-cyan-400" />
                <span>Simulador de PIS & COFINS sobre Receitas Financeiras</span>
              </h2>
              <p className="text-xs text-neutral-400 mb-4">
                Estime o impacto tributário de resgates financeiros, distribuição de JCP ou variações cambiais.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Valor Bruto da Receita Financeira (R$):
                  </label>
                  <input
                    type="number"
                    value={simValor}
                    onChange={e => setSimValor(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-[#202020] border border-[#333] rounded text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Operação de Hedge de Exportação (Alíquota Zero):
                  </label>
                  <select
                    value={simIsento ? 'SIM' : 'NAO'}
                    onChange={e => setSimIsento(e.target.value === 'SIM')}
                    className="w-full px-3 py-2 text-xs bg-[#202020] border border-[#333] rounded text-neutral-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="NAO">Não (Tributação Integral 4,65%)</option>
                    <option value="SIM">Sim (Alíquota Zero - Art. 1º § 3º Dec 8.426)</option>
                  </select>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#202020] border border-[#333]">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-xs text-neutral-400">PIS (0,65% - DARF 6912)</div>
                    <div className="text-lg font-bold text-amber-400 font-mono mt-1">
                      R$ {simPis.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-neutral-400">COFINS (4,00% - DARF 5856)</div>
                    <div className="text-lg font-bold text-cyan-400 font-mono mt-1">
                      R$ {simCofins.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-neutral-400">Total Devido (4,65%)</div>
                    <div className="text-lg font-bold text-rose-400 font-mono mt-1">
                      R$ {(simPis + simCofins).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content: Legislação */}
      {abaAtiva === 'legislacao' && (
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-4 text-xs leading-relaxed text-neutral-300">
            <div className="p-4 rounded-lg bg-[#181818] border border-[#262626]">
              <h3 className="text-sm font-semibold text-cyan-400 mb-2 flex items-center space-x-2">
                <Scale className="w-4 h-4" />
                <span>Base Legal: Decreto nº 8.426/2015 & Jurisprudência do STF</span>
              </h3>
              <ul className="list-disc pl-5 space-y-1.5 text-neutral-400">
                <li>
                  <strong className="text-neutral-200">Decreto nº 8.426/2015:</strong> Restabeleceu as alíquotas da Contribuição para o PIS/PASEP em 0,65% e da COFINS em 4,00% incidentes sobre as receitas financeiras auferidas pelas pessoas jurídicas sujeitas ao regime de apuração não cumulativo (Lucro Real).
                </li>
                <li>
                  <strong className="text-neutral-200">Julgamento do STF (Tema 1.224):</strong> O Supremo Tribunal Federal fixou tese declarando constitucional a flexibilização das alíquotas de PIS e COFINS sobre receitas financeiras pelo Poder Executivo nos termos do § 2º do Art. 27 da Lei nº 10.865/2004.
                </li>
                <li>
                  <strong className="text-neutral-200">Hipóteses de Alíquota Zero Mantidas:</strong> Permanecem com alíquota de 0% (zero) as receitas financeiras decorrentes de operações de cobertura (hedge) destinadas exclusivamente à proteção contra riscos cambiais de exportação, juros sobre empréstimos concedidos a subsidiárias no exterior e variações cambiais de operações passivas.
                </li>
                <li>
                  <strong className="text-neutral-200">Vedação de Crédito:</strong> A legislação veda expressamente o aproveitamento de créditos de PIS e COFINS sobre despesas financeiras suportadas pela entidade.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#1c1c1c] border border-[#2e2e2e] rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-[#2e2e2e] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white flex items-center space-x-2">
                <Coins className="w-4 h-4 text-cyan-400" />
                <span>{editingItem ? 'Editar Receita Financeira' : 'Nova Receita Financeira (Decreto 8.426/15)'}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvar} className="flex-1 overflow-auto p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Tipo de Receita Financeira:</label>
                  <select
                    value={tipo}
                    onChange={e => setTipo(e.target.value as TipoReceitaFinanceira)}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#242424] border border-[#333] rounded text-neutral-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="JUROS_CAPITAL_PROPRIO">Juros sobre Capital Próprio (JCP)</option>
                    <option value="RENDIMENTO_APLICACAO_RENDA_FIXA">Rendimento Renda Fixa (CDB/DI)</option>
                    <option value="VARIACAO_CAMBIAL_ATIVA">Variação Cambial Ativa</option>
                    <option value="OPERACAO_HEDGE_COBERTURA">Hedge de Exportação</option>
                    <option value="DESCONTO_OBTIDO">Descontos Obtidos</option>
                    <option value="JUROS_MORA_RECEBIDOS">Juros de Mora Recebidos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Data da Operação / Crédito:</label>
                  <input
                    type="date"
                    required
                    value={data}
                    onChange={e => setData(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#242424] border border-[#333] rounded text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-neutral-300 mb-1">Descrição do Rendimento:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Rendimento CDB DI Liquidez Diária, JCP Bradesco..."
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-[#242424] border border-[#333] rounded text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Instituição Financeira ou Pagador:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Banco Itaú, Banco Bradesco..."
                    value={instituicaoFinanceiraOuPagador}
                    onChange={e => setInstituicaoFinanceiraOuPagador(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#242424] border border-[#333] rounded text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Valor Bruto da Receita (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={valorBrutoReceita}
                    onChange={e => setValorBrutoReceita(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#242424] border border-[#333] rounded text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Isenção / Alíquota Zero?</label>
                  <select
                    value={temIsencaoAliquotaZero ? 'SIM' : 'NAO'}
                    onChange={e => setTemIsencaoAliquotaZero(e.target.value === 'SIM')}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#242424] border border-[#333] rounded text-neutral-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="NAO">Não (Tributação 4,65%)</option>
                    <option value="SIM">Sim (Alíquota Zero Hedge Exportação)</option>
                  </select>
                </div>

                {temIsencaoAliquotaZero && (
                  <div>
                    <label className="block text-xs text-neutral-300 mb-1">Fundamentação Legal da Isenção:</label>
                    <input
                      type="text"
                      placeholder="Art. 1º, § 3º do Decreto 8.426/15"
                      value={fundamentacaoIsencao}
                      onChange={e => setFundamentacaoIsencao(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-[#242424] border border-[#333] rounded text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs text-neutral-300 mb-1">Observações:</label>
                <textarea
                  rows={2}
                  value={observacoes}
                  onChange={e => setObservacoes(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-[#242424] border border-[#333] rounded text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-3 border-t border-[#2e2e2e] flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white bg-[#252525] rounded transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded transition-colors"
                >
                  Salvar Receita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
