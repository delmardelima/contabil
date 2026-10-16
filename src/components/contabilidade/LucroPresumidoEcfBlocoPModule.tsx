import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Building2,
  Calendar,
  FileSpreadsheet,
  FileText,
  Printer,
  Copy,
  Download,
  CheckCircle2,
  AlertTriangle,
  Percent,
  DollarSign,
  TrendingUp,
  FileCode,
  ShieldCheck,
  Scale,
  PlusCircle,
  HelpCircle,
  Layers
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  DemonstrativoLucroPresumidoEcfP,
  TrimestreEcf
} from '../../types/contabil';

interface LucroPresumidoModuleProps {
  empresaId?: number;
}

export const LucroPresumidoEcfBlocoPModule: React.FC<LucroPresumidoModuleProps> = ({ empresaId = 1 }) => {
  const [ano, setAno] = useState<number>(2026);
  const [trimestre, setTrimestre] = useState<TrimestreEcf>('1T');
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'MEMORIA_IRPJ' | 'MEMORIA_CSLL' | 'BALANCO_DRE' | 'RELATORIO_A4' | 'TXT_PREVIEW'>('DASHBOARD');
  const [demonstrativo, setDemonstrativo] = useState<DemonstrativoLucroPresumidoEcfP | null>(null);
  const [arquivoTxt, setArquivoTxt] = useState<string>('');
  const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'info'; texto: string } | null>(null);

  const carregarDados = () => {
    const dados = dbService.getLucroPresumidoEcfP(empresaId, ano, trimestre);
    setDemonstrativo(dados);
  };

  useEffect(() => {
    carregarDados();
  }, [empresaId, ano, trimestre]);

  const handleGerarTxt = () => {
    const res = dbService.gerarArquivoEcfBlocoPTxt(empresaId, ano, trimestre);
    if (res.sucesso) {
      setArquivoTxt(res.arquivo);
      setActiveTab('TXT_PREVIEW');
      setFeedback({ tipo: 'sucesso', texto: res.mensagem });
    }
  };

  const handleRecalcular = (campo: string, valor: number) => {
    if (!demonstrativo) return;
    const atualizado = { ...demonstrativo, [campo]: valor };

    // Recálculo IRPJ
    atualizado.basePresumidaMercadorias8 = atualizado.receitaBrutaVendasMercadorias8 * 0.08;
    atualizado.basePresumidaServicos32 = atualizado.receitaBrutaServicosGerais32 * 0.32;
    atualizado.basePresumidaTransportes16 = atualizado.receitaBrutaTransportes16 * 0.16;
    atualizado.baseCalculoTotalIrpj = atualizado.basePresumidaMercadorias8 +
      atualizado.basePresumidaServicos32 +
      atualizado.basePresumidaTransportes16 +
      atualizado.outrasReceitasAcrecimosIrpj;

    atualizado.impostoIrpjBasico = atualizado.baseCalculoTotalIrpj * 0.15;
    atualizado.baseCalculoAdicionalIrpj = Math.max(0, atualizado.baseCalculoTotalIrpj - atualizado.limiteIsencaoAdicionalIrpj);
    atualizado.adicionalIrpjDevido = atualizado.baseCalculoAdicionalIrpj * 0.10;
    atualizado.irpjTotalDevido = atualizado.impostoIrpjBasico + atualizado.adicionalIrpjDevido;
    atualizado.saldoIrpjPagar = Math.max(0, atualizado.irpjTotalDevido - atualizado.deducoesRetencoesFonteIrpj);

    // Recálculo CSLL
    atualizado.basePresumidaComercio12 = atualizado.receitaBrutaComercioCsll12 * 0.12;
    atualizado.basePresumidaServicosCsll32 = atualizado.receitaBrutaServicosCsll32 * 0.32;
    atualizado.baseCalculoTotalCsll = atualizado.basePresumidaComercio12 +
      atualizado.basePresumidaServicosCsll32 +
      atualizado.outrasReceitasAcrecimosCsll;

    atualizado.csllTotalDevida = atualizado.baseCalculoTotalCsll * 0.09;
    atualizado.saldoCsllPagar = Math.max(0, atualizado.csllTotalDevida - atualizado.deducoesRetencoesFonteCsll);

    setDemonstrativo(atualizado);
    dbService.salvarLucroPresumidoEcfP(atualizado);
    setFeedback({ tipo: 'sucesso', texto: 'Apuração do Lucro Presumido recalculada com sucesso!' });
  };

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="flex flex-col h-full bg-[#121212] text-gray-200 p-4 space-y-4 overflow-y-auto">
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-[#262626] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                SPED ECF: Bloco P - Apuração do Lucro Presumido
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                  Manual ECF v10 / IN RFB 2.004
                </span>
              </h1>
              <p className="text-xs text-gray-400">
                Registros P200/P300 (IRPJ 15% + Adicional 10%), P400/P500 (CSLL 9%), Balanço P100 e DRE P150 com geração de DARFs 2089 e 2372
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Seletor de Trimestre */}
          <div className="flex bg-[#181818] border border-[#262626] p-1 rounded gap-1">
            {(['1T', '2T', '3T', '4T'] as TrimestreEcf[]).map((t) => (
              <button
                key={t}
                onClick={() => setTrimestre(t)}
                className={`px-2.5 py-1 text-xs font-bold rounded transition-colors ${
                  trimestre === t
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-[#252525]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 bg-[#181818] border border-[#262626] px-2.5 py-1.5 rounded">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-400">Ano:</span>
            <input
              type="number"
              value={ano}
              onChange={(e) => setAno(parseInt(e.target.value, 10) || 2026)}
              className="bg-transparent text-xs text-white border-0 focus:outline-none font-bold w-14"
            />
          </div>

          <button
            onClick={handleGerarTxt}
            className="px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
          >
            <FileCode className="w-3.5 h-3.5" />
            Gerar TXT Bloco P
          </button>
        </div>
      </div>

      {/* FEEDBACK BANNER */}
      {feedback && (
        <div className="flex items-center justify-between bg-emerald-950/60 border border-emerald-700/50 text-emerald-200 px-4 py-2.5 rounded text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedback.texto}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-gray-400 hover:text-white font-mono text-xs ml-4">
            ×
          </button>
        </div>
      )}

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-[#181818] border border-[#262626] p-3 rounded flex items-center justify-between">
          <div>
            <div className="text-[10px] text-gray-400 uppercase font-semibold">Base Total IRPJ (P200)</div>
            <div className="text-xl font-bold text-white mt-0.5">
              {formatBRL(demonstrativo?.baseCalculoTotalIrpj || 0)}
            </div>
            <div className="text-[10px] text-emerald-400 mt-0.5">8% Comércio + 32% Serviços</div>
          </div>
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
            <Scale className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-[#181818] border border-[#262626] p-3 rounded flex items-center justify-between">
          <div>
            <div className="text-[10px] text-gray-400 uppercase font-semibold">IRPJ Total Devido</div>
            <div className="text-xl font-bold text-sky-400 mt-0.5">
              {formatBRL(demonstrativo?.irpjTotalDevido || 0)}
            </div>
            <div className="text-[10px] text-sky-400/80 mt-0.5">15% Básico + 10% Adicional</div>
          </div>
          <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-lg border border-sky-500/20">
            <Percent className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-[#181818] border border-[#262626] p-3 rounded flex items-center justify-between">
          <div>
            <div className="text-[10px] text-gray-400 uppercase font-semibold">DARF IRPJ a Pagar</div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">
              {formatBRL(demonstrativo?.saldoIrpjPagar || 0)}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">Cód 2089 • Venc. {demonstrativo?.vencimentoDarf}</div>
          </div>
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-[#181818] border border-[#262626] p-3 rounded flex items-center justify-between">
          <div>
            <div className="text-[10px] text-gray-400 uppercase font-semibold">Base Total CSLL (P400)</div>
            <div className="text-xl font-bold text-white mt-0.5">
              {formatBRL(demonstrativo?.baseCalculoTotalCsll || 0)}
            </div>
            <div className="text-[10px] text-purple-400 mt-0.5">12% Comércio + 32% Serviços</div>
          </div>
          <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-[#181818] border border-[#262626] p-3 rounded flex items-center justify-between">
          <div>
            <div className="text-[10px] text-gray-400 uppercase font-semibold">DARF CSLL a Pagar</div>
            <div className="text-xl font-bold text-purple-400 mt-0.5">
              {formatBRL(demonstrativo?.saldoCsllPagar || 0)}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">Cód 2372 • 9% Líquido</div>
          </div>
          <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* NAVEGAÇÃO DE ABAS */}
      <div className="flex border-b border-[#262626] gap-2">
        <button
          onClick={() => setActiveTab('DASHBOARD')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'DASHBOARD'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          Painel de Apuração Trimestral
        </button>

        <button
          onClick={() => setActiveTab('MEMORIA_IRPJ')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'MEMORIA_IRPJ'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          Memória IRPJ (Reg. P200 / P300)
        </button>

        <button
          onClick={() => setActiveTab('MEMORIA_CSLL')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'MEMORIA_CSLL'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Memória CSLL (Reg. P400 / P500)
        </button>

        <button
          onClick={() => setActiveTab('BALANCO_DRE')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'BALANCO_DRE'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          Demonstrações (P100 / P150)
        </button>

        <button
          onClick={() => setActiveTab('RELATORIO_A4')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'RELATORIO_A4'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Printer className="w-3.5 h-3.5" />
          Demonstrativo Oficial ECF (A4)
        </button>

        {activeTab === 'TXT_PREVIEW' && (
          <button
            onClick={() => setActiveTab('TXT_PREVIEW')}
            className="px-4 py-2 text-xs font-medium border-b-2 border-emerald-500 text-emerald-400 bg-emerald-500/10 flex items-center gap-2"
          >
            <FileCode className="w-3.5 h-3.5" />
            Arquivo SPED ECF (TXT)
          </button>
        )}
      </div>

      {/* ABA: DASHBOARD GERAL */}
      {activeTab === 'DASHBOARD' && demonstrativo && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CARD IRPJ */}
            <div className="bg-[#181818] border border-[#262626] rounded p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#262626]">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-sky-500/10 text-sky-400 rounded border border-sky-500/20">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">IRPJ - Imposto de Renda Pessoa Jurídica</h2>
                    <span className="text-[10px] text-gray-400 font-mono">DARF 2089 • Vencimento: {demonstrativo.vencimentoDarf}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Valor a Recolher</span>
                  <div className="text-lg font-bold text-emerald-400 font-mono">{formatBRL(demonstrativo.saldoIrpjPagar)}</div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-[#222]">
                  <span className="text-gray-400">Receita Vendas Mercadorias (8%):</span>
                  <span className="font-mono text-gray-200">{formatBRL(demonstrativo.receitaBrutaVendasMercadorias8)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#222]">
                  <span className="text-gray-400">Receita Prestação de Serviços (32%):</span>
                  <span className="font-mono text-gray-200">{formatBRL(demonstrativo.receitaBrutaServicosGerais32)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#222]">
                  <span className="text-gray-400">Outras Receitas / Ganhos de Capital:</span>
                  <span className="font-mono text-gray-200">{formatBRL(demonstrativo.outrasReceitasAcrecimosIrpj)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#222] font-semibold">
                  <span className="text-gray-300">Base de Cálculo Total IRPJ (P200):</span>
                  <span className="font-mono text-white">{formatBRL(demonstrativo.baseCalculoTotalIrpj)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#222]">
                  <span className="text-gray-400">IRPJ Alíquota Básica (15%):</span>
                  <span className="font-mono text-sky-400">{formatBRL(demonstrativo.impostoIrpjBasico)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#222]">
                  <span className="text-gray-400">Adicional IRPJ (10% sobre base &gt; R$ 60k):</span>
                  <span className="font-mono text-amber-400">{formatBRL(demonstrativo.adicionalIrpjDevido)}</span>
                </div>
                <div className="flex justify-between py-1 text-rose-400">
                  <span>(-) Retenções na Fonte Compensáveis (IRRF):</span>
                  <span className="font-mono font-bold">- {formatBRL(demonstrativo.deducoesRetencoesFonteIrpj)}</span>
                </div>
              </div>
            </div>

            {/* CARD CSLL */}
            <div className="bg-[#181818] border border-[#262626] rounded p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#262626]">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-500/10 text-purple-400 rounded border border-purple-500/20">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">CSLL - Contribuição Social sobre o Lucro Líquido</h2>
                    <span className="text-[10px] text-gray-400 font-mono">DARF 2372 • Vencimento: {demonstrativo.vencimentoDarf}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Valor a Recolher</span>
                  <div className="text-lg font-bold text-purple-400 font-mono">{formatBRL(demonstrativo.saldoCsllPagar)}</div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-[#222]">
                  <span className="text-gray-400">Receita Comércio (12%):</span>
                  <span className="font-mono text-gray-200">{formatBRL(demonstrativo.receitaBrutaComercioCsll12)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#222]">
                  <span className="text-gray-400">Receita Prestação de Serviços (32%):</span>
                  <span className="font-mono text-gray-200">{formatBRL(demonstrativo.receitaBrutaServicosCsll32)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#222]">
                  <span className="text-gray-400">Outras Receitas e Acréscimos:</span>
                  <span className="font-mono text-gray-200">{formatBRL(demonstrativo.outrasReceitasAcrecimosCsll)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#222] font-semibold">
                  <span className="text-gray-300">Base de Cálculo Total CSLL (P400):</span>
                  <span className="font-mono text-white">{formatBRL(demonstrativo.baseCalculoTotalCsll)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#222]">
                  <span className="text-gray-400">CSLL Alíquota Geral (9%):</span>
                  <span className="font-mono text-purple-400">{formatBRL(demonstrativo.csllTotalDevida)}</span>
                </div>
                <div className="flex justify-between py-1 text-rose-400">
                  <span>(-) Retenções na Fonte Compensáveis (CSRF 1%):</span>
                  <span className="font-mono font-bold">- {formatBRL(demonstrativo.deducoesRetencoesFonteCsll)}</span>
                </div>
                <div className="p-2 bg-[#121212] rounded text-[11px] text-gray-400 mt-2">
                  Saldo Líquido da CSLL apurado em conformidade com o Art. 20 da Lei nº 9.249/1995.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA: MEMÓRIA IRPJ (P200/P300) */}
      {activeTab === 'MEMORIA_IRPJ' && demonstrativo && (
        <div className="bg-[#181818] border border-[#262626] rounded p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#262626]">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-sky-400" />
              Detalhamento dos Registros P200 e P300 (IRPJ)
            </h2>
            <span className="text-xs text-gray-400">Edição e recálculo instantâneo</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Receita Venda de Mercadorias (8%)</label>
              <input
                type="number"
                step="0.01"
                value={demonstrativo.receitaBrutaVendasMercadorias8}
                onChange={(e) => handleRecalcular('receitaBrutaVendasMercadorias8', parseFloat(e.target.value) || 0)}
                className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-white font-mono"
              />
              <span className="text-[10px] text-emerald-400 mt-0.5 block font-mono">
                Base Presumida: {formatBRL(demonstrativo.basePresumidaMercadorias8)}
              </span>
            </div>

            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Receita de Serviços em Geral (32%)</label>
              <input
                type="number"
                step="0.01"
                value={demonstrativo.receitaBrutaServicosGerais32}
                onChange={(e) => handleRecalcular('receitaBrutaServicosGerais32', parseFloat(e.target.value) || 0)}
                className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-white font-mono"
              />
              <span className="text-[10px] text-emerald-400 mt-0.5 block font-mono">
                Base Presumida: {formatBRL(demonstrativo.basePresumidaServicos32)}
              </span>
            </div>

            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Outras Receitas e Ganhos de Capital (100%)</label>
              <input
                type="number"
                step="0.01"
                value={demonstrativo.outrasReceitasAcrecimosIrpj}
                onChange={(e) => handleRecalcular('outrasReceitasAcrecimosIrpj', parseFloat(e.target.value) || 0)}
                className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-white font-mono"
              />
              <span className="text-[10px] text-gray-400 mt-0.5 block font-mono">
                Integra integralmente a base de cálculo
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-[#262626]">
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Retenções na Fonte de IRRF (Deduções)</label>
              <input
                type="number"
                step="0.01"
                value={demonstrativo.deducoesRetencoesFonteIrpj}
                onChange={(e) => handleRecalcular('deducoesRetencoesFonteIrpj', parseFloat(e.target.value) || 0)}
                className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-white font-mono text-rose-400 font-bold"
              />
              <span className="text-[10px] text-gray-400 mt-0.5 block">
                IRRF retido em notas fiscais de serviços tomados
              </span>
            </div>

            <div className="p-3 bg-[#141414] border border-[#262626] rounded flex justify-between items-center">
              <div>
                <span className="text-xs text-gray-400 block">Saldo Final do IRPJ Trimestral</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">{formatBRL(demonstrativo.saldoIrpjPagar)}</span>
              </div>
              <span className="text-xs text-gray-500 font-mono">DARF 2089</span>
            </div>
          </div>
        </div>
      )}

      {/* ABA: MEMÓRIA CSLL (P400/P500) */}
      {activeTab === 'MEMORIA_CSLL' && demonstrativo && (
        <div className="bg-[#181818] border border-[#262626] rounded p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#262626]">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              Detalhamento dos Registros P400 e P500 (CSLL)
            </h2>
            <span className="text-xs text-gray-400">Edição e recálculo instantâneo</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Receita de Comércio / Indústria (12%)</label>
              <input
                type="number"
                step="0.01"
                value={demonstrativo.receitaBrutaComercioCsll12}
                onChange={(e) => handleRecalcular('receitaBrutaComercioCsll12', parseFloat(e.target.value) || 0)}
                className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-white font-mono"
              />
              <span className="text-[10px] text-purple-400 mt-0.5 block font-mono">
                Base Presumida: {formatBRL(demonstrativo.basePresumidaComercio12)}
              </span>
            </div>

            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Receita de Serviços em Geral (32%)</label>
              <input
                type="number"
                step="0.01"
                value={demonstrativo.receitaBrutaServicosCsll32}
                onChange={(e) => handleRecalcular('receitaBrutaServicosCsll32', parseFloat(e.target.value) || 0)}
                className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-white font-mono"
              />
              <span className="text-[10px] text-purple-400 mt-0.5 block font-mono">
                Base Presumida: {formatBRL(demonstrativo.basePresumidaServicosCsll32)}
              </span>
            </div>

            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Outras Receitas e Acréscimos (100%)</label>
              <input
                type="number"
                step="0.01"
                value={demonstrativo.outrasReceitasAcrecimosCsll}
                onChange={(e) => handleRecalcular('outrasReceitasAcrecimosCsll', parseFloat(e.target.value) || 0)}
                className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-white font-mono"
              />
              <span className="text-[10px] text-gray-400 mt-0.5 block font-mono">
                Integra integralmente a base de cálculo
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-[#262626]">
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Retenções na Fonte de CSLL / CSRF (Deduções)</label>
              <input
                type="number"
                step="0.01"
                value={demonstrativo.deducoesRetencoesFonteCsll}
                onChange={(e) => handleRecalcular('deducoesRetencoesFonteCsll', parseFloat(e.target.value) || 0)}
                className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-white font-mono text-rose-400 font-bold"
              />
              <span className="text-[10px] text-gray-400 mt-0.5 block">
                Parcela de 1% da retenção CSRF 4,65%
              </span>
            </div>

            <div className="p-3 bg-[#141414] border border-[#262626] rounded flex justify-between items-center">
              <div>
                <span className="text-xs text-gray-400 block">Saldo Final da CSLL Trimestral</span>
                <span className="text-lg font-bold text-purple-400 font-mono">{formatBRL(demonstrativo.saldoCsllPagar)}</span>
              </div>
              <span className="text-xs text-gray-500 font-mono">DARF 2372</span>
            </div>
          </div>
        </div>
      )}

      {/* ABA: DEMONSTRATIVO OFICIAL A4 */}
      {activeTab === 'RELATORIO_A4' && demonstrativo && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-[#181818] p-3 rounded border border-[#262626]">
            <div>
              <span className="text-xs text-gray-400">Demonstrativo de Apuração do Lucro Presumido - </span>
              <span className="text-xs font-bold text-white">{demonstrativo.periodoDescricao}</span>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir Demonstrativo (A4)
            </button>
          </div>

          <div className="bg-white text-black p-8 rounded shadow-2xl max-w-4xl mx-auto space-y-6 print:m-0 print:p-0 font-serif">
            {/* CABEÇALHO */}
            <div className="border-b-2 border-black pb-4 text-center space-y-1">
              <div className="font-extrabold text-base uppercase tracking-wider">
                DEMONSTRATIVO DE APURAÇÃO DO LUCRO PRESUMIDO
              </div>
              <div className="font-bold text-xs uppercase text-gray-800">
                IMPOSTO DE RENDA (IRPJ) E CONTRIBUIÇÃO SOCIAL (CSLL) • ECF BLOCO P
              </div>
              <div className="text-[10px] font-sans text-gray-600">
                Período: {demonstrativo.periodoDescricao} • Instrução Normativa RFB nº 2.004/2021
              </div>
            </div>

            {/* IDENTIFICAÇÃO */}
            <div className="grid grid-cols-2 border border-black p-3 text-xs font-sans gap-2">
              <div>
                <span className="font-bold block text-[10px] text-gray-600">EMPRESA:</span>
                <span className="font-bold">CONTABIL STUDIO PRO BRASIL LTDA</span>
              </div>
              <div>
                <span className="font-bold block text-[10px] text-gray-600">CNPJ:</span>
                <span className="font-mono">00.123.456/0001-91</span>
              </div>
              <div>
                <span className="font-bold block text-[10px] text-gray-600">FORMA DE TRIBUTAÇÃO:</span>
                <span>Lucro Presumido - Regime de Competência</span>
              </div>
              <div>
                <span className="font-bold block text-[10px] text-gray-600">TRIMESTRE:</span>
                <span className="font-bold">{trimestre} / {ano}</span>
              </div>
            </div>

            {/* QUADRO IRPJ */}
            <div className="border border-black font-sans text-xs">
              <div className="bg-gray-100 p-2 font-bold uppercase text-[10px] border-b border-black">
                QUADRO I - APURAÇÃO DO IMPOSTO DE RENDA DAS PESSOAS JURÍDICAS (IRPJ)
              </div>
              <div className="grid grid-cols-2 p-2 border-b border-gray-300">
                <span>Receita Bruta com Comércio / Indústria (Alíquota 8%):</span>
                <span className="font-mono text-right">{formatBRL(demonstrativo.receitaBrutaVendasMercadorias8)} (Base: {formatBRL(demonstrativo.basePresumidaMercadorias8)})</span>
              </div>
              <div className="grid grid-cols-2 p-2 border-b border-gray-300">
                <span>Receita Bruta com Serviços Gerais (Alíquota 32%):</span>
                <span className="font-mono text-right">{formatBRL(demonstrativo.receitaBrutaServicosGerais32)} (Base: {formatBRL(demonstrativo.basePresumidaServicos32)})</span>
              </div>
              <div className="grid grid-cols-2 p-2 border-b border-gray-300">
                <span>Outras Receitas e Ganhos de Capital (100%):</span>
                <span className="font-mono text-right">{formatBRL(demonstrativo.outrasReceitasAcrecimosIrpj)}</span>
              </div>
              <div className="grid grid-cols-2 p-2 border-b border-gray-300 font-bold bg-gray-50">
                <span>(=) Base de Cálculo Total do IRPJ:</span>
                <span className="font-mono text-right">{formatBRL(demonstrativo.baseCalculoTotalIrpj)}</span>
              </div>
              <div className="grid grid-cols-2 p-2 border-b border-gray-300">
                <span>IRPJ Básico (15%):</span>
                <span className="font-mono text-right">{formatBRL(demonstrativo.impostoIrpjBasico)}</span>
              </div>
              <div className="grid grid-cols-2 p-2 border-b border-gray-300">
                <span>Adicional de IRPJ (10% sobre base &gt; R$ 60.000):</span>
                <span className="font-mono text-right">{formatBRL(demonstrativo.adicionalIrpjDevido)}</span>
              </div>
              <div className="grid grid-cols-2 p-2 border-b border-gray-300 text-rose-800">
                <span>(-) Retenções na Fonte de IRPJ (Deduções):</span>
                <span className="font-mono font-bold text-right">- {formatBRL(demonstrativo.deducoesRetencoesFonteIrpj)}</span>
              </div>
              <div className="grid grid-cols-2 p-2 bg-emerald-50 font-bold text-emerald-950 text-sm">
                <span>(=) SALDO DE IRPJ A RECOLHER (DARF 2089):</span>
                <span className="font-mono text-right">{formatBRL(demonstrativo.saldoIrpjPagar)}</span>
              </div>
            </div>

            {/* QUADRO CSLL */}
            <div className="border border-black font-sans text-xs">
              <div className="bg-gray-100 p-2 font-bold uppercase text-[10px] border-b border-black">
                QUADRO II - APURAÇÃO DA CONTRIBUIÇÃO SOCIAL SOBRE O LUCRO LÍQUIDO (CSLL)
              </div>
              <div className="grid grid-cols-2 p-2 border-b border-gray-300">
                <span>Receita Bruta com Comércio / Indústria (Alíquota 12%):</span>
                <span className="font-mono text-right">{formatBRL(demonstrativo.receitaBrutaComercioCsll12)} (Base: {formatBRL(demonstrativo.basePresumidaComercio12)})</span>
              </div>
              <div className="grid grid-cols-2 p-2 border-b border-gray-300">
                <span>Receita Bruta com Serviços Gerais (Alíquota 32%):</span>
                <span className="font-mono text-right">{formatBRL(demonstrativo.receitaBrutaServicosCsll32)} (Base: {formatBRL(demonstrativo.basePresumidaServicosCsll32)})</span>
              </div>
              <div className="grid grid-cols-2 p-2 border-b border-gray-300 font-bold bg-gray-50">
                <span>(=) Base de Cálculo Total da CSLL:</span>
                <span className="font-mono text-right">{formatBRL(demonstrativo.baseCalculoTotalCsll)}</span>
              </div>
              <div className="grid grid-cols-2 p-2 border-b border-gray-300">
                <span>CSLL Devida (9%):</span>
                <span className="font-mono text-right">{formatBRL(demonstrativo.csllTotalDevida)}</span>
              </div>
              <div className="grid grid-cols-2 p-2 border-b border-gray-300 text-rose-800">
                <span>(-) Retenções na Fonte de CSLL (CSRF 1%):</span>
                <span className="font-mono font-bold text-right">- {formatBRL(demonstrativo.deducoesRetencoesFonteCsll)}</span>
              </div>
              <div className="grid grid-cols-2 p-2 bg-purple-50 font-bold text-purple-950 text-sm">
                <span>(=) SALDO DE CSLL A RECOLHER (DARF 2372):</span>
                <span className="font-mono text-right">{formatBRL(demonstrativo.saldoCsllPagar)}</span>
              </div>
            </div>

            {/* ASSINATURAS */}
            <div className="pt-8 text-xs text-center space-y-8 font-sans">
              <div className="grid grid-cols-2 gap-12 pt-4">
                <div className="border-t border-black pt-1">
                  <div className="font-bold">CONTABIL STUDIO PRO BRASIL LTDA</div>
                  <div className="text-[10px] text-gray-600">Representante Legal</div>
                </div>
                <div className="border-t border-black pt-1">
                  <div className="font-bold">DR. ROBERTO SILVEIRA BARBOSA</div>
                  <div className="text-[10px] text-gray-600">Contador Responsável - CRC-SP 1SP298451/O-4</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA: PREVIEW TXT */}
      {activeTab === 'TXT_PREVIEW' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-[#181818] p-3 rounded border border-[#262626]">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-white">SPED ECF - Bloco P (TXT Oficial PVA)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(arquivoTxt);
                  setFeedback({ tipo: 'sucesso', texto: 'Arquivo SPED ECF Bloco P copiado!' });
                }}
                className="px-2.5 py-1 bg-[#222] hover:bg-[#2a2a2a] text-gray-300 rounded text-xs flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                Copiar
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([arquivoTxt], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `SPED_ECF_BLOCO_P_${ano}_${trimestre}.txt`;
                  a.click();
                }}
                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                Baixar TXT
              </button>
            </div>
          </div>

          <pre className="p-4 bg-[#0d0d0d] border border-[#262626] rounded text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-[500px]">
            {arquivoTxt}
          </pre>
        </div>
      )}
    </div>
  );
};
