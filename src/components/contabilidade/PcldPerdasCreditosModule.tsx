import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  DollarSign,
  Layers,
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  Search,
  Printer,
  Trash2,
  FileCheck2,
  PieChart,
  SlidersHorizontal,
  Scale,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  ResumoPcld,
  ItemContaReceberPcld,
  FaixaAtrasoPcld,
  TipoGarantiaCredito,
  StatusRecuperacaoCredito,
  EnquadramentoFiscalLei9430
} from '../../types/contabil';

export const PcldPerdasCreditosModule: React.FC = () => {
  const [empresaId] = useState<number>(1);
  const [periodoCompetencia, setPeriodoCompetencia] = useState<string>('2026-03');
  const [resumo, setResumo] = useState<ResumoPcld | null>(null);
  const [activeTab, setActiveTab] = useState<'carteira' | 'conciliacaoLalur' | 'agingAnalysis' | 'laudoA4'>('carteira');
  const [busca, setBusca] = useState<string>('');

  // Notificações
  const [notificacao, setNotificacao] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  // Modal Novo Título
  const [modalNovoTitulo, setModalNovoTitulo] = useState<boolean>(false);
  const [formClienteNome, setFormClienteNome] = useState<string>('');
  const [formClienteCnpj, setFormClienteCnpj] = useState<string>('');
  const [formNumTitulo, setFormNumTitulo] = useState<string>('');
  const [formVencimento, setFormVencimento] = useState<string>('2025-08-15');
  const [formDiasAtraso, setFormDiasAtraso] = useState<number>(220);
  const [formFaixa, setFormFaixa] = useState<FaixaAtrasoPcld>('181_A_360_DIAS');
  const [formValorNominal, setFormValorNominal] = useState<number>(15000.0);
  const [formGarantia, setFormGarantia] = useState<TipoGarantiaCredito>('SEM_GARANTIA');
  const [formStatusCobranca, setFormStatusCobranca] = useState<StatusRecuperacaoCredito>('EM_COBRANCA_ADMINISTRATIVA');
  const [formPercCpc48, setFormPercCpc48] = useState<number>(80.0);
  const [formEnquadramento, setFormEnquadramento] = useState<EnquadramentoFiscalLei9430>('DEDUTIVEL_ATE_15K_6M');
  const [formObs, setFormObs] = useState<string>('');

  const carregarDados = () => {
    const dados = dbService.getPcld(empresaId, periodoCompetencia);
    setResumo(dados);
  };

  useEffect(() => {
    carregarDados();
  }, [periodoCompetencia]);

  const exibirNotificacao = (tipo: 'sucesso' | 'erro', texto: string) => {
    setNotificacao({ tipo, texto });
    setTimeout(() => setNotificacao(null), 5000);
  };

  const handleSalvarItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClienteNome || formValorNominal <= 0) {
      exibirNotificacao('erro', 'Nome do cliente e valor nominal são obrigatórios.');
      return;
    }

    const res = dbService.salvarItemPcld({
      empresaId,
      clienteNomeRazaoSocial: formClienteNome,
      clienteCpfCnpj: formClienteCnpj || '00.000.000/0001-00',
      numeroTituloNfe: formNumTitulo || `DUP-${Date.now()}`,
      dataVencimento: formVencimento,
      diasAtraso: Number(formDiasAtraso),
      faixaAtraso: formFaixa,
      valorNominalBRL: Number(formValorNominal),
      tipoGarantia: formGarantia,
      statusCobranca: formStatusCobranca,
      percentualPerdaEsperadaCpc48: Number(formPercCpc48),
      enquadramentoFiscal: formEnquadramento,
      observacoes: formObs
    });

    if (res.sucesso) {
      exibirNotificacao('sucesso', res.mensagem);
      setModalNovoTitulo(false);
      setFormClienteNome('');
      setFormNumTitulo('');
      setFormValorNominal(0);
      setFormObs('');
      carregarDados();
    } else {
      exibirNotificacao('erro', res.mensagem);
    }
  };

  const handleExcluirItem = (id: string) => {
    if (confirm('Deseja realmente remover este título da apuração de PCLD?')) {
      const res = dbService.excluirItemPcld(id);
      if (res.sucesso) {
        exibirNotificacao('sucesso', res.mensagem);
        carregarDados();
      } else {
        exibirNotificacao('erro', res.mensagem);
      }
    }
  };

  const handleIntegrarContabil = () => {
    if (!resumo) return;
    const res = dbService.integrarPcldContabil(empresaId, periodoCompetencia, resumo.apuracao.totalProvisaoContabilCpc48BRL);
    if (res.sucesso) {
      exibirNotificacao('sucesso', res.mensagem);
      carregarDados();
    } else {
      exibirNotificacao('erro', res.mensagem);
    }
  };

  const itensFiltrados = resumo?.apuracao.itens.filter(i =>
    i.clienteNomeRazaoSocial.toLowerCase().includes(busca.toLowerCase()) ||
    i.numeroTituloNfe.toLowerCase().includes(busca.toLowerCase()) ||
    i.clienteCpfCnpj.includes(busca)
  ) || [];

  return (
    <div className="flex flex-col h-full bg-[#121212] text-[#e0e0e0] overflow-y-auto">
      {/* Header */}
      <div className="p-5 border-b border-[#2d2d2d] bg-[#181818] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                PCLD - Provisão p/ Créditos de Liquidação Duvidosa
                <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-amber-950/80 text-amber-300 border border-amber-700/50">
                  CPC 48 / IFRS 9 • Lei 9.430/96
                </span>
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Perdas esperadas no recebimento de clientes, conciliação de adições no LALUR Parte A e aging list
              </p>
            </div>
          </div>
        </div>

        {/* Competência & Ações */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#202020] px-3 py-1.5 rounded-lg border border-[#333333]">
            <span className="text-xs text-gray-400">Competência:</span>
            <input
              type="month"
              value={periodoCompetencia}
              onChange={(e) => setPeriodoCompetencia(e.target.value)}
              className="bg-transparent text-xs text-amber-400 font-semibold focus:outline-none"
            />
          </div>

          <button
            onClick={() => setModalNovoTitulo(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Novo Título / Perda
          </button>

          <button
            onClick={carregarDados}
            title="Atualizar dados"
            className="p-2 bg-[#242424] hover:bg-[#303030] border border-[#333333] rounded-lg text-gray-300 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Alerta de Notificação */}
      {notificacao && (
        <div
          className={`mx-5 mt-4 p-3 rounded-lg text-xs flex items-center justify-between border ${
            notificacao.tipo === 'sucesso'
              ? 'bg-emerald-950/60 border-emerald-700/50 text-emerald-200'
              : 'bg-red-950/60 border-red-700/50 text-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notificacao.tipo === 'sucesso' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
            <span>{notificacao.texto}</span>
          </div>
          <button
            onClick={() => setNotificacao(null)}
            className="text-gray-400 hover:text-white text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Dashboard KPI Cards */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#181818] p-4 rounded-xl border border-[#282828] relative overflow-hidden shadow-sm">
          <div className="text-xs font-medium text-gray-400">Total Provisão CPC 48 (R$)</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">
            R$ {(resumo?.apuracao.totalProvisaoContabilCpc48BRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-gray-400 mt-2 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Redutora do Ativo Clientes</span>
          </div>
          <div className="absolute -right-3 -bottom-3 opacity-5 text-amber-400 pointer-events-none">
            <ShieldAlert className="w-24 h-24" />
          </div>
        </div>

        <div className="bg-[#181818] p-4 rounded-xl border border-[#282828] relative overflow-hidden shadow-sm">
          <div className="text-xs font-medium text-gray-400">Perdas Dedutíveis IRPJ (R$)</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            R$ {(resumo?.apuracao.totalPerdasDedutiveisFiscaisBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Art. 9º da Lei 9.430/1996</span>
          </div>
          <div className="absolute -right-3 -bottom-3 opacity-5 text-emerald-400 pointer-events-none">
            <CheckCircle2 className="w-24 h-24" />
          </div>
        </div>

        <div className="bg-[#181818] p-4 rounded-xl border border-[#282828] relative overflow-hidden shadow-sm">
          <div className="text-xs font-medium text-gray-400">Adição Temporária LALUR (R$)</div>
          <div className="text-2xl font-bold text-rose-400 mt-1">
            R$ {(resumo?.apuracao.totalAdicaoLalurIndedutivelBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-rose-300 mt-2 flex items-center gap-1">
            <Scale className="w-3.5 h-3.5" />
            <span>Parte A / Código M300</span>
          </div>
          <div className="absolute -right-3 -bottom-3 opacity-5 text-rose-400 pointer-events-none">
            <Scale className="w-24 h-24" />
          </div>
        </div>

        <div className="bg-[#181818] p-4 rounded-xl border border-[#282828] relative overflow-hidden shadow-sm">
          <div className="text-xs font-medium text-gray-400">Índice Geral de Inadimplência</div>
          <div className="text-2xl font-bold text-indigo-400 mt-1">
            {(resumo?.indiceInadimplenciaGeralPercent || 0).toFixed(1)}%
          </div>
          <div className="text-[11px] text-gray-400 mt-2 flex items-center gap-1">
            <span>Carteira: R$ {(resumo?.apuracao.totalCarteiraReceberBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="absolute -right-3 -bottom-3 opacity-5 text-indigo-400 pointer-events-none">
            <PieChart className="w-24 h-24" />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="px-5 border-b border-[#2d2d2d] flex items-center justify-between gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('carteira')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'carteira'
                ? 'border-amber-500 text-amber-400 font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            Carteira & Títulos em Atraso ({resumo?.apuracao.itens.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('conciliacaoLalur')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'conciliacaoLalur'
                ? 'border-amber-500 text-amber-400 font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Scale className="w-4 h-4" />
            Conciliação Fiscal LALUR (Lei 9.430)
          </button>
          <button
            onClick={() => setActiveTab('agingAnalysis')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'agingAnalysis'
                ? 'border-amber-500 text-amber-400 font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Matriz de Aging & Risco de Crédito
          </button>
          <button
            onClick={() => setActiveTab('laudoA4')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'laudoA4'
                ? 'border-amber-500 text-amber-400 font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Printer className="w-4 h-4" />
            Laudo de Perdas A4
          </button>
        </div>

        {/* Busca rápida */}
        <div className="relative mb-2">
          <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por cliente, título ou CNPJ..."
            className="bg-[#202020] border border-[#333333] rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-amber-500 w-64"
          />
        </div>
      </div>

      {/* Conteúdo das Abas */}
      <div className="p-5 flex-1">
        {/* ABA 1: CARTEIRA */}
        {activeTab === 'carteira' && (
          <div className="bg-[#181818] border border-[#2d2d2d] rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#2d2d2d] flex justify-between items-center bg-[#1f1f1f]">
              <div className="text-xs font-semibold text-gray-300">
                Títulos com Atraso e Risco de Inadimplência ({itensFiltrados.length} itens)
              </div>
              <button
                onClick={handleIntegrarContabil}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Integrar Provisão Contábil
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300 border-collapse">
                <thead className="bg-[#222222] text-gray-400 font-medium border-b border-[#2d2d2d]">
                  <tr>
                    <th className="py-2.5 px-3">Cliente / CNPJ</th>
                    <th className="py-2.5 px-3">Título / NF-e</th>
                    <th className="py-2.5 px-3">Vencimento</th>
                    <th className="py-2.5 px-3 text-right">Atraso</th>
                    <th className="py-2.5 px-3 text-right">Valor Nominal (R$)</th>
                    <th className="py-2.5 px-3">Garantia</th>
                    <th className="py-2.5 px-3 text-right">% Perda CPC 48</th>
                    <th className="py-2.5 px-3 text-right">Provisão Contábil</th>
                    <th className="py-2.5 px-3">Tratamento Fiscal</th>
                    <th className="py-2.5 px-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#282828]">
                  {itensFiltrados.map((it) => (
                    <tr key={it.id} className="hover:bg-[#202020] transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-white">{it.clienteNomeRazaoSocial}</div>
                        <div className="text-[10px] text-gray-500 font-mono">CNPJ: {it.clienteCpfCnpj}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-medium text-amber-400">{it.numeroTituloNfe}</td>
                      <td className="py-2.5 px-3 font-mono text-gray-400">{it.dataVencimento}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-400">{it.diasAtraso} d</td>
                      <td className="py-2.5 px-3 text-right font-mono text-white">
                        R$ {it.valorNominalBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#2a2a2a] text-gray-300 border border-[#3a3a3a]">
                          {it.tipoGarantia}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-amber-300 font-bold">
                        {it.percentualPerdaEsperadaCpc48.toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-400">
                        R$ {it.valorProvisaoContabilBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3">
                        {it.enquadramentoFiscal === 'INDEDUTIVEL_TEMPORARIO_LALUR' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-rose-950/60 text-rose-300 border border-rose-800/40">
                            Adição LALUR
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                            Dedutível Lei 9430
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleExcluirItem(it.id)}
                          title="Remover título"
                          className="p-1 text-gray-400 hover:text-red-400 bg-[#252525] hover:bg-[#303030] rounded border border-[#383838] cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 2: CONCILIAÇÃO FISCAL LALUR */}
        {activeTab === 'conciliacaoLalur' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#181818] p-5 rounded-xl border border-[#2d2d2d]">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                <Scale className="w-4 h-4 text-emerald-400" />
                Regras de Dedutibilidade Fiscal (Lei nº 9.430/1996 Arts. 9º a 14)
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-[#202020] rounded-lg border border-[#303030]">
                  <span className="font-semibold text-emerald-400 block mb-1">1. Créditos até R$ 15.000,00 por devedor:</span>
                  <p className="text-gray-400">
                    Vencidos há mais de 6 meses, independentemente de cobrança judicial. Integralmente dedutíveis do Lucro Real e da base de cálculo da CSLL.
                  </p>
                </div>
                <div className="p-3 bg-[#202020] rounded-lg border border-[#303030]">
                  <span className="font-semibold text-emerald-400 block mb-1">2. Créditos de R$ 15.000,01 a R$ 100.000,00:</span>
                  <p className="text-gray-400">
                    Vencidos há mais de 1 ano, mantidas as cobranças administrativas com notificação e protesto em cartório.
                  </p>
                </div>
                <div className="p-3 bg-[#202020] rounded-lg border border-[#303030]">
                  <span className="font-semibold text-amber-400 block mb-1">3. Créditos superiores a R$ 100.000,00:</span>
                  <p className="text-gray-400">
                    Exigem cobrança judicial iniciada e mantida ativa para serem considerados dedutíveis.
                  </p>
                </div>
                <div className="p-3 bg-rose-950/20 rounded-lg border border-rose-800/40">
                  <span className="font-semibold text-rose-300 block mb-1">4. Créditos com Garantia Real:</span>
                  <p className="text-gray-400">
                    Somente o valor que exceder a garantia pode ser deduzido após 2 anos de cobrança judicial sem êxito. Antes disso, a provisão contábil é 100% indedutível.
                  </p>
                </div>
              </div>
            </div>

            {/* Matriz de Ajuste LALUR */}
            <div className="bg-[#181818] p-5 rounded-xl border border-[#2d2d2d] flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                  <FileCheck2 className="w-4 h-4 text-rose-400" />
                  Demonstrativo de Ajustes no LALUR / LACS Parte A
                </h3>
                <div className="space-y-3 text-xs bg-[#202020] p-4 rounded-xl border border-[#303030] mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Despesa Contábil CPC 48:</span>
                    <span className="font-mono text-white font-bold">
                      R$ {(resumo?.apuracao.totalProvisaoContabilCpc48BRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>(-) Parcela Dedutível Fiscalmente:</span>
                    <span className="font-mono font-bold">
                      R$ {(resumo?.apuracao.totalPerdasDedutiveisFiscaisBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-[#333333] text-rose-400 font-bold">
                    <span>(=) ADIÇÃO OBRIGATÓRIA LALUR (M300 / M350):</span>
                    <span className="font-mono text-sm">
                      R$ {(resumo?.apuracao.totalAdicaoLalurIndedutivelBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-400">
                  O valor de <strong>R$ {(resumo?.apuracao.totalAdicaoLalurIndedutivelBRL || 0).toFixed(2)}</strong> é adicionado ao Lucro Líquido no e-LALUR e controlado na Parte B até a ocorrência da perda definitiva ou liquidação da cobrança.
                </p>
              </div>

              <button
                onClick={handleIntegrarContabil}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                <CheckCircle2 className="w-4 h-4" />
                Integrar PCLD no Diário Geral
              </button>
            </div>
          </div>
        )}

        {/* ABA 3: AGING ANALYSIS */}
        {activeTab === 'agingAnalysis' && (
          <div className="bg-[#181818] p-5 rounded-xl border border-[#2d2d2d] space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              Matriz de Inadimplência por Faixas de Vencimento (Aging List)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-[#202020] rounded-lg border border-[#303030]">
                <span className="text-gray-400 block">De 1 a 60 dias:</span>
                <span className="text-lg font-bold text-white font-mono mt-1">R$ 0,00</span>
                <span className="text-[10px] text-gray-500 block mt-1">Provisão CPC 48: 2,5%</span>
              </div>
              <div className="p-4 bg-[#202020] rounded-lg border border-[#303030]">
                <span className="text-gray-400 block">De 61 a 180 dias:</span>
                <span className="text-lg font-bold text-amber-400 font-mono mt-1">R$ 140.000,00</span>
                <span className="text-[10px] text-gray-500 block mt-1">Provisão CPC 48: 50,0%</span>
              </div>
              <div className="p-4 bg-[#202020] rounded-lg border border-[#303030]">
                <span className="text-gray-400 block">De 181 a 360 dias:</span>
                <span className="text-lg font-bold text-rose-400 font-mono mt-1">R$ 12.800,00</span>
                <span className="text-[10px] text-gray-500 block mt-1">Provisão CPC 48: 80,0%</span>
              </div>
              <div className="p-4 bg-[#202020] rounded-lg border border-[#303030]">
                <span className="text-gray-400 block">Acima de 360 dias:</span>
                <span className="text-lg font-bold text-red-500 font-mono mt-1">R$ 65.000,00</span>
                <span className="text-[10px] text-gray-500 block mt-1">Provisão CPC 48: 100,0%</span>
              </div>
            </div>
          </div>
        )}

        {/* ABA 4: LAUDO OFICIAL A4 */}
        {activeTab === 'laudoA4' && (
          <div className="flex justify-center">
            <div className="w-[210mm] bg-[#1a1a1a] text-gray-200 border border-[#333333] p-10 shadow-2xl rounded-sm text-xs">
              {/* Topo A4 */}
              <div className="border-b-2 border-amber-500 pb-4 mb-6 flex justify-between items-start">
                <div>
                  <h2 className="text-base font-bold text-white uppercase tracking-wider">
                    LAUDO DE AVALIAÇÃO DE CRÉDITOS DE LIQUIDAÇÃO DUVIDOSA (PCLD)
                  </h2>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Pronunciamento Técnico CPC 48 (IFRS 9) • Perdas Estimadas no Recebimento de Clientes
                  </p>
                  <p className="text-[10px] text-amber-400 font-semibold mt-0.5">
                    Conciliação Fiscal: Lei Federal nº 9.430/1996 Arts. 9º a 14 • RIR/2018
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-white">EMPRESA MODELO S/A</div>
                  <div className="text-[10px] text-gray-400">CNPJ: 00.000.000/0001-91</div>
                  <div className="text-[10px] text-amber-400 font-mono mt-1">Competência: {periodoCompetencia}</div>
                </div>
              </div>

              {/* Resumo da Carteira */}
              <div className="grid grid-cols-3 gap-4 mb-6 p-3 bg-[#202020] border border-gray-700 rounded">
                <div>
                  <span className="text-[10px] text-gray-400 block">TOTAL DA CARTEIRA EM ATRASO:</span>
                  <span className="text-sm font-bold text-white font-mono">
                    R$ {(resumo?.apuracao.totalCarteiraReceberBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">PROVISÃO CONTÁBIL CPC 48:</span>
                  <span className="text-sm font-bold text-amber-400 font-mono">
                    R$ {(resumo?.apuracao.totalProvisaoContabilCpc48BRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">ADIÇÃO LALUR INDEDUTÍVEL:</span>
                  <span className="text-sm font-bold text-rose-400 font-mono">
                    R$ {(resumo?.apuracao.totalAdicaoLalurIndedutivelBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Tabela de Títulos Avaliados */}
              <table className="w-full text-left text-[11px] border-collapse mb-8">
                <thead>
                  <tr className="border-b border-gray-600 font-semibold text-gray-300">
                    <th className="py-1 px-2">Cliente</th>
                    <th className="py-1 px-2">Título</th>
                    <th className="py-1 px-2 text-right">Atraso</th>
                    <th className="py-1 px-2 text-right">Valor Nominal</th>
                    <th className="py-1 px-2 text-right">Provisão CPC 48</th>
                    <th className="py-1 px-2 text-right">Dedutível Fiscal</th>
                    <th className="py-1 px-2 text-right">Adição LALUR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a2a]">
                  {resumo?.apuracao.itens.map((it) => (
                    <tr key={it.id}>
                      <td className="py-1 px-2 text-white">{it.clienteNomeRazaoSocial}</td>
                      <td className="py-1 px-2 font-mono text-amber-400">{it.numeroTituloNfe}</td>
                      <td className="py-1 px-2 text-right font-mono text-gray-400">{it.diasAtraso} d</td>
                      <td className="py-1 px-2 text-right font-mono text-white">
                        R$ {it.valorNominalBRL.toFixed(2)}
                      </td>
                      <td className="py-1 px-2 text-right font-mono font-bold text-amber-400">
                        R$ {it.valorProvisaoContabilBRL.toFixed(2)}
                      </td>
                      <td className="py-1 px-2 text-right font-mono text-emerald-400">
                        R$ {it.valorDedutivelFiscalBRL.toFixed(2)}
                      </td>
                      <td className="py-1 px-2 text-right font-mono text-rose-400">
                        R$ {it.valorIndedutivelLalurParteABRL.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Assinaturas */}
              <div className="mt-12 pt-8 border-t border-[#333333] grid grid-cols-2 gap-12 text-center text-[10px] text-gray-400">
                <div>
                  <div className="border-b border-gray-500 pb-1 w-3/4 mx-auto mb-1 text-white font-medium">
                    DIRETORIA FINANCEIRA / CRÉDITO E COBRANÇA
                  </div>
                  <div>Responsável pela Política de Risco de Crédito</div>
                </div>

                <div>
                  <div className="border-b border-gray-500 pb-1 w-3/4 mx-auto mb-1 text-white font-medium">
                    CONTADOR RESPONSÁVEL TÉCNICO
                  </div>
                  <div>CRC 1SP999999/O-0</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: NOVO TÍTULO / PERDA */}
      {modalNovoTitulo && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1c1c1c] border border-[#333333] rounded-xl max-w-lg w-full p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-400" />
              Lançar Título em Atraso para PCLD (CPC 48 / Lei 9.430)
            </h3>

            <form onSubmit={handleSalvarItem} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Cliente / Razão Social:</label>
                  <input
                    type="text"
                    value={formClienteNome}
                    onChange={(e) => setFormClienteNome(e.target.value)}
                    placeholder="Nome do cliente devedor"
                    required
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">CNPJ / CPF:</label>
                  <input
                    type="text"
                    value={formClienteCnpj}
                    onChange={(e) => setFormClienteCnpj(e.target.value)}
                    placeholder="00.000.000/0001-00"
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Número do Título / NF-e:</label>
                  <input
                    type="text"
                    value={formNumTitulo}
                    onChange={(e) => setFormNumTitulo(e.target.value)}
                    placeholder="DUP 001.200/01"
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Vencimento Original:</label>
                  <input
                    type="date"
                    value={formVencimento}
                    onChange={(e) => setFormVencimento(e.target.value)}
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Valor Nominal (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formValorNominal}
                    onChange={(e) => setFormValorNominal(Number(e.target.value))}
                    min="0"
                    required
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Dias de Atraso:</label>
                  <input
                    type="number"
                    value={formDiasAtraso}
                    onChange={(e) => setFormDiasAtraso(Number(e.target.value))}
                    min="0"
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">% Perda CPC 48:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formPercCpc48}
                    onChange={(e) => setFormPercCpc48(Number(e.target.value))}
                    min="0"
                    max="100"
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Tipo de Garantia:</label>
                  <select
                    value={formGarantia}
                    onChange={(e) => setFormGarantia(e.target.value as any)}
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="SEM_GARANTIA">Sem Garantia</option>
                    <option value="GARANTIA_REAL_HIPOTECA">Garantia Real (Penhor/Hipoteca)</option>
                    <option value="AVAL_FIANCA">Aval / Fiança Bancária</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Enquadramento Fiscal (Lei 9.430):</label>
                  <select
                    value={formEnquadramento}
                    onChange={(e) => setFormEnquadramento(e.target.value as any)}
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="DEDUTIVEL_ATE_15K_6M">Dedutível: Até R$ 15k (&gt; 6m)</option>
                    <option value="DEDUTIVEL_15K_A_100K_1ANO">Dedutível: R$ 15k a 100k (&gt; 1 ano)</option>
                    <option value="DEDUTIVEL_MAIOR_100K_JUDICIAL">Dedutível: &gt; R$ 100k (Judicial)</option>
                    <option value="INDEDUTIVEL_TEMPORARIO_LALUR">Indedutível: Adição LALUR Parte A</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Observações da Cobrança:</label>
                <input
                  type="text"
                  value={formObs}
                  onChange={(e) => setFormObs(e.target.value)}
                  placeholder="Ex: Título protestado no 2º Cartório de Títulos e Documentos"
                  className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#333333]">
                <button
                  type="button"
                  onClick={() => setModalNovoTitulo(false)}
                  className="px-3 py-1.5 bg-[#2a2a2a] hover:bg-[#333333] text-gray-300 rounded text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-semibold cursor-pointer"
                >
                  Salvar Título
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
