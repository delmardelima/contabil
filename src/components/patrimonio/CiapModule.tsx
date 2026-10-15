import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Calendar, 
  Plus, 
  Printer, 
  FileSpreadsheet, 
  CheckCircle2, 
  Calculator, 
  Percent, 
  BookOpen, 
  Layers, 
  Check, 
  DollarSign
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import { 
  ItemCiap, 
  ApuracaoCiapCompetencia, 
  Empresa 
} from '../../types/contabil';
import { ReportPrintPreviewModal } from '../layout/ReportPrintPreviewModal';

export const CiapModule: React.FC = () => {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [competencia, setCompetencia] = useState<string>('2026-02');
  const [activeTab, setActiveTab] = useState<'APURACAO' | 'CADASTRO' | 'LEGAL'>('APURACAO');
  const [apuracao, setApuracao] = useState<ApuracaoCiapCompetencia | null>(null);
  const [itensCiap, setItensCiap] = useState<ItemCiap[]>([]);
  const [feedback, setFeedback] = useState<{ tipo: 'success' | 'error' | 'info'; mensagem: string } | null>(null);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  // Form de cadastro de novo bem
  const [novoBem, setNovoBem] = useState<{
    codigoBem: string;
    descricaoBem: string;
    dataEntrada: string;
    numeroNotaFiscal: string;
    serieNotaFiscal: string;
    fornecedorNome: string;
    fornecedorCnpj: string;
    valorTotalBem: number;
    valorICMSOriginal: number;
    parcelaAtual: number;
    totalParcelas: number;
  }>({
    codigoBem: '',
    descricaoBem: '',
    dataEntrada: new Date().toISOString().split('T')[0],
    numeroNotaFiscal: '',
    serieNotaFiscal: '1',
    fornecedorNome: '',
    fornecedorCnpj: '',
    valorTotalBem: 0,
    valorICMSOriginal: 0,
    parcelaAtual: 1,
    totalParcelas: 48
  });

  const carregarDados = () => {
    const emp = dbService.getActiveEmpresa() || dbService.getEmpresas()[0];
    setEmpresa(emp);
    if (emp) {
      const bens = dbService.getItensCiap(emp.id);
      setItensCiap(bens);
      const ap = dbService.getApuracaoCiapCompetencia(emp.id, competencia);
      setApuracao(ap);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [competencia]);

  const handleSalvarBem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresa) return;

    if (!novoBem.codigoBem || !novoBem.descricaoBem || novoBem.valorICMSOriginal <= 0) {
      setFeedback({ tipo: 'error', mensagem: 'Preencha os campos obrigatórios (Código, Descrição e ICMS Original).' });
      return;
    }

    dbService.saveItemCiap({
      empresaId: empresa.id,
      ...novoBem
    });

    setFeedback({ tipo: 'success', mensagem: `Bem CIAP "${novoBem.codigoBem}" cadastrado com sucesso!` });
    setNovoBem({
      codigoBem: '',
      descricaoBem: '',
      dataEntrada: new Date().toISOString().split('T')[0],
      numeroNotaFiscal: '',
      serieNotaFiscal: '1',
      fornecedorNome: '',
      fornecedorCnpj: '',
      valorTotalBem: 0,
      valorICMSOriginal: 0,
      parcelaAtual: 1,
      totalParcelas: 48
    });
    carregarDados();
    setActiveTab('APURACAO');
  };

  const handleIntegrarFiscalContabil = () => {
    if (!empresa) return;
    const res = dbService.integrarCiapFiscalContabil(empresa.id, competencia);
    if (res.success) {
      setFeedback({
        tipo: 'success',
        mensagem: `Apropriação CIAP integrada com sucesso! Lote Diário #${res.loteId} criado no valor de R$ ${res.totalCredito.toFixed(2)} e escriturado na Apuração do ICMS (Outros Créditos - Bloco G).`
      });
      carregarDados();
    } else {
      setFeedback({ tipo: 'error', mensagem: 'Não há créditos apropriáveis para esta competência ou os bens já foram totalmente amortizados.' });
    }
  };

  const formatarMoeda = (v: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
  };

  return (
    <div className="flex flex-col h-full bg-[#141414] text-slate-100 overflow-y-auto font-sans p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#2a2a2a]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Layers className="w-7 h-7 text-amber-500" />
              Controle de Crédito de ICMS do Ativo Permanente (CIAP)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              SPED Bloco G / LC 87/96
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Ficha Modelo C/D • Apropriação de 1/48 Avos Proporcional às Saídas Tributadas (Art. 20 § 5º da Lei Kandir)
          </p>
        </div>

        {/* Filtros e Controles */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#1c1c1c] px-3 py-1.5 rounded-lg border border-[#2a2a2a]">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-300 font-medium">
              {empresa ? `${empresa.codigo} - ${empresa.razaoSocial}` : 'Selecionando...'}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-[#1c1c1c] px-3 py-1.5 rounded-lg border border-[#2a2a2a]">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input 
              type="month"
              value={competencia}
              onChange={(e) => setCompetencia(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => setShowPrintModal(true)}
            className="flex items-center gap-1.5 bg-[#252525] hover:bg-[#2d2d2d] text-slate-200 text-xs px-3.5 py-2 rounded-lg border border-[#333] transition"
          >
            <Printer className="w-4 h-4 text-slate-300" />
            Imprimir A4
          </button>

          <button
            onClick={handleIntegrarFiscalContabil}
            className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium px-4 py-2 rounded-lg shadow-sm transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            Integrar Fiscal & Contábil
          </button>
        </div>
      </div>

      {/* Alertas / Feedback */}
      {feedback && (
        <div className={`mt-4 p-3.5 rounded-lg text-xs flex items-center justify-between border ${
          feedback.tipo === 'success' ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' :
          feedback.tipo === 'error' ? 'bg-rose-950/40 border-rose-500/30 text-rose-300' :
          'bg-blue-950/40 border-blue-500/30 text-blue-300'
        }`}>
          <span>{feedback.mensagem}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* KPI Cards */}
      {apuracao && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 my-6">
          <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-4 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-medium">Bens Ativos no CIAP</span>
            <div className="text-2xl font-bold text-white mt-2 font-mono">
              {apuracao.itens.length}
            </div>
            <span className="text-[11px] text-slate-500 mt-1">Imobilizado em apropriação</span>
          </div>

          <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-4 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-medium">Saídas Tributadas / Totais</span>
            <div className="text-lg font-bold text-slate-200 mt-2 font-mono">
              {formatarMoeda(apuracao.totalSaidasTributadas)}
            </div>
            <span className="text-[11px] text-slate-500 mt-1">
              Total Saídas: {formatarMoeda(apuracao.totalSaidasGerais)}
            </span>
          </div>

          <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-4 flex flex-col justify-between border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Fator de Apropriação</span>
              <Percent className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-400 mt-2 font-mono">
              {(apuracao.fatorApropriacao * 100).toFixed(4)}%
            </div>
            <span className="text-[11px] text-slate-400 mt-1">Índice LC 87/96 (4 decimais)</span>
          </div>

          <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-4 flex flex-col justify-between border-l-4 border-l-emerald-500">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Crédito Apropriado no Mês</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400 mt-2 font-mono">
              {formatarMoeda(apuracao.totalCreditoApropriadoMes)}
            </div>
            <span className="text-[11px] text-slate-400 mt-1">Parcela mensal 1/48 × Fator</span>
          </div>

          <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-4 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-medium">Saldo Remanescente Total</span>
            <div className="text-xl font-bold text-slate-300 mt-2 font-mono">
              {formatarMoeda(apuracao.totalSaldoRemanescente)}
            </div>
            <span className="text-[11px] text-slate-500 mt-1">Créditos de meses futuros</span>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#2a2a2a] mb-6">
        <button
          onClick={() => setActiveTab('APURACAO')}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold border-b-2 transition ${
            activeTab === 'APURACAO'
              ? 'border-amber-500 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Ficha CIAP Modelo C/D (Bloco G)
        </button>

        <button
          onClick={() => setActiveTab('CADASTRO')}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold border-b-2 transition ${
            activeTab === 'CADASTRO'
              ? 'border-amber-500 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Plus className="w-4 h-4" />
          Novo Bem no CIAP
        </button>

        <button
          onClick={() => setActiveTab('LEGAL')}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold border-b-2 transition ${
            activeTab === 'LEGAL'
              ? 'border-amber-500 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Regras & Legislação (LC 87/96)
        </button>
      </div>

      {/* TAB 1: APURAÇÃO CIAP */}
      {activeTab === 'APURACAO' && apuracao && (
        <div className="space-y-6">
          <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#2a2a2a] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Demonstrativo Analítico dos Bens do Ativo Permanente - Competência {competencia}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Fórmula Oficial: Crédito Apropriado = (ICMS Destacado / 48) × (Saídas Tributadas / Total de Saídas)
                </p>
              </div>
              <span className="text-xs font-mono px-3 py-1 bg-[#222] border border-[#333] rounded text-slate-300">
                Registros SPED G110 / G125
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[#202020] text-slate-400 uppercase tracking-wider font-semibold border-b border-[#2a2a2a]">
                  <tr>
                    <th className="py-3 px-4">Código / Bem</th>
                    <th className="py-3 px-4">NF-e / Fornecedor</th>
                    <th className="py-3 px-4 text-center">Data Entrada</th>
                    <th className="py-3 px-4 text-right">Valor Bem</th>
                    <th className="py-3 px-4 text-right">ICMS Total</th>
                    <th className="py-3 px-4 text-center">Parcela</th>
                    <th className="py-3 px-4 text-right">Parcela 1/48</th>
                    <th className="py-3 px-4 text-center">Fator Saídas</th>
                    <th className="py-3 px-4 text-right text-emerald-400">Crédito Apropriado</th>
                    <th className="py-3 px-4 text-right">Saldo Remanescente</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262626]">
                  {apuracao.itens.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-8 text-center text-slate-500">
                        Nenhum bem ativo encontrado no CIAP para esta competência.
                      </td>
                    </tr>
                  ) : (
                    apuracao.itens.map(item => (
                      <tr key={item.id} className="hover:bg-[#202020]/50 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white">{item.codigoBem}</div>
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">{item.descricaoBem}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-slate-200">NF {item.numeroNotaFiscal} S:{item.serieNotaFiscal}</div>
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">{item.fornecedorNome}</div>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-slate-300">
                          {item.dataEntrada}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                          {formatarMoeda(item.valorTotalBem)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                          {formatarMoeda(item.valorICMSOriginal)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {item.parcelaAtual}/{item.totalParcelas}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                          {formatarMoeda(item.parcelaMesICMS)}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-amber-400">
                          {(item.fatorApropriacao * 100).toFixed(2)}%
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                          {formatarMoeda(item.creditoApropriadoMes)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                          {formatarMoeda(item.saldoAposApropriacao)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {apuracao.itens.length > 0 && (
                  <tfoot className="bg-[#202020] font-bold text-white border-t border-[#2a2a2a]">
                    <tr>
                      <td colSpan={3} className="py-3 px-4 text-right uppercase tracking-wider text-xs text-slate-400">
                        Totais Gerais do Mês:
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-xs">
                        {formatarMoeda(apuracao.itens.reduce((acc, i) => acc + i.valorTotalBem, 0))}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-xs">
                        {formatarMoeda(apuracao.itens.reduce((acc, i) => acc + i.valorICMSOriginal, 0))}
                      </td>
                      <td></td>
                      <td className="py-3 px-4 text-right font-mono text-xs">
                        {formatarMoeda(apuracao.itens.reduce((acc, i) => acc + i.parcelaMesICMS, 0))}
                      </td>
                      <td></td>
                      <td className="py-3 px-4 text-right font-mono text-xs text-emerald-400 font-bold">
                        {formatarMoeda(apuracao.totalCreditoApropriadoMes)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-xs text-slate-300">
                        {formatarMoeda(apuracao.totalSaldoRemanescente)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CADASTRO DE BEM */}
      {activeTab === 'CADASTRO' && (
        <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-6 shadow-sm max-w-4xl">
          <h3 className="text-sm font-semibold text-white mb-1">Entrada de Bem no Ativo Permanente (CIAP)</h3>
          <p className="text-xs text-slate-400 mb-6">
            Cadastre os dados fiscais e o ICMS destacado na NF-e de aquisição do ativo imobilizado para início da apropriação em 48 parcelas.
          </p>

          <form onSubmit={handleSalvarBem} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Código do Bem *</label>
                <input 
                  type="text"
                  required
                  placeholder="ex: CIAP-004"
                  value={novoBem.codigoBem}
                  onChange={(e) => setNovoBem({ ...novoBem, codigoBem: e.target.value.toUpperCase() })}
                  className="w-full bg-[#202020] border border-[#333] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">Descrição Detalhada do Bem *</label>
                <input 
                  type="text"
                  required
                  placeholder="ex: Prensadora Hidráulica 150T com Painel Digital"
                  value={novoBem.descricaoBem}
                  onChange={(e) => setNovoBem({ ...novoBem, descricaoBem: e.target.value })}
                  className="w-full bg-[#202020] border border-[#333] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Data de Entrada *</label>
                <input 
                  type="date"
                  required
                  value={novoBem.dataEntrada}
                  onChange={(e) => setNovoBem({ ...novoBem, dataEntrada: e.target.value })}
                  className="w-full bg-[#202020] border border-[#333] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Número NF-e *</label>
                <input 
                  type="text"
                  required
                  placeholder="ex: 8845"
                  value={novoBem.numeroNotaFiscal}
                  onChange={(e) => setNovoBem({ ...novoBem, numeroNotaFiscal: e.target.value })}
                  className="w-full bg-[#202020] border border-[#333] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Série NF-e</label>
                <input 
                  type="text"
                  value={novoBem.serieNotaFiscal}
                  onChange={(e) => setNovoBem({ ...novoBem, serieNotaFiscal: e.target.value })}
                  className="w-full bg-[#202020] border border-[#333] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Parcela Atual / Total</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number"
                    min="1"
                    max="48"
                    value={novoBem.parcelaAtual}
                    onChange={(e) => setNovoBem({ ...novoBem, parcelaAtual: Number(e.target.value) })}
                    className="w-1/2 bg-[#202020] border border-[#333] rounded-lg px-3 py-2 text-xs text-white focus:outline-none font-mono text-center"
                  />
                  <span className="text-slate-400">/</span>
                  <input 
                    type="number"
                    readOnly
                    value={48}
                    className="w-1/2 bg-[#262626] border border-[#333] rounded-lg px-3 py-2 text-xs text-slate-400 font-mono text-center cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Razão Social do Fornecedor</label>
                <input 
                  type="text"
                  placeholder="ex: MÁQUINAS INDUSTRIAIS DO BRASIL S/A"
                  value={novoBem.fornecedorNome}
                  onChange={(e) => setNovoBem({ ...novoBem, fornecedorNome: e.target.value.toUpperCase() })}
                  className="w-full bg-[#202020] border border-[#333] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">CNPJ do Fornecedor</label>
                <input 
                  type="text"
                  placeholder="00.000.000/0000-00"
                  value={novoBem.fornecedorCnpj}
                  onChange={(e) => setNovoBem({ ...novoBem, fornecedorCnpj: e.target.value })}
                  className="w-full bg-[#202020] border border-[#333] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#202020] p-4 rounded-lg border border-[#2a2a2a]">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Valor Total do Bem (R$)</label>
                <input 
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={novoBem.valorTotalBem || ''}
                  onChange={(e) => setNovoBem({ ...novoBem, valorTotalBem: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#181818] border border-[#333] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-emerald-400 mb-1">Valor do ICMS Destacado na NF-e (R$) *</label>
                <input 
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="0.00"
                  value={novoBem.valorICMSOriginal || ''}
                  onChange={(e) => setNovoBem({ ...novoBem, valorICMSOriginal: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#181818] border border-emerald-500/30 rounded-lg px-3 py-2 text-xs text-emerald-300 focus:outline-none focus:border-emerald-500 font-mono font-bold"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Parcela Mensal Estimada (1/48): {formatarMoeda((novoBem.valorICMSOriginal || 0) / 48)}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setActiveTab('APURACAO')}
                className="px-4 py-2 bg-[#252525] hover:bg-[#2d2d2d] text-slate-300 text-xs rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Salvar Bem no CIAP
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: LEGISLAÇÃO E REGRAS */}
      {activeTab === 'LEGAL' && (
        <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-6 shadow-sm space-y-6 max-w-4xl">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-500" />
              Fundamentação Legal e Validação SPED Fiscal Bloco G
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Normas técnicas aplicáveis à apropriação e escrituração de créditos do ativo permanente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-[#202020] p-4 rounded-lg border border-[#2a2a2a] space-y-2">
              <h4 className="font-semibold text-amber-400">Lei Complementar Nº 87/1996 (Art. 20 § 5º)</h4>
              <p className="text-slate-300 leading-relaxed">
                A apropriação do crédito de ICMS referente à entrada de bens destinados ao ativo permanente é feita à razão de <strong>um quarenta e oito avos (1/48)</strong> por mês.
              </p>
              <p className="text-slate-300 leading-relaxed">
                A parcela a ser apropriada é proporcional à relação entre o somatório das saídas e prestações tributadas (somadas às exportações imunes) e o total das saídas do período.
              </p>
            </div>

            <div className="bg-[#202020] p-4 rounded-lg border border-[#2a2a2a] space-y-2">
              <h4 className="font-semibold text-emerald-400">Escrituração no SPED Fiscal (EFD-ICMS/IPI)</h4>
              <p className="text-slate-300 leading-relaxed">
                <strong>Registro G110:</strong> Apuração mensal do crédito do CIAP contendo total de saídas, total tributado, fator e crédito total apurado.
              </p>
              <p className="text-slate-300 leading-relaxed">
                <strong>Registro G125:</strong> Movimentação individual de cada bem no mês (SI, Entrada, Baixa, Parcela e Saldo Final).
              </p>
              <p className="text-slate-300 leading-relaxed">
                <strong>Registro E111:</strong> Lançamento de ajuste de apuração do ICMS como "Outros Créditos" vinculado à apuração do Bloco G.
              </p>
            </div>
          </div>

          <div className="bg-[#202020] p-4 rounded-lg border border-[#2a2a2a] space-y-2 text-xs">
            <h4 className="font-semibold text-blue-400">Contabilização Oficial (Padrão CFC / CPC 27)</h4>
            <p className="text-slate-300 leading-relaxed">
              Na data de aquisição do ativo, o ICMS a apropriar nos 48 meses pode ser segregado em conta do Realizável a Longo Prazo / Ativo Permanente.
            </p>
            <div className="bg-[#141414] p-3 rounded font-mono text-[11px] text-slate-200 border border-[#333]">
              <div>D: 1.01.04.001.0001 - ICMS a Recuperar (Ativo Circulante)</div>
              <div>C: 1.02.01.001.0001 - ICMS s/ Ativo Permanente a Apropriar (Ativo Não Circulante)</div>
              <div className="text-slate-500 mt-1">// Partida gerada automaticamente pela rotina de integração do ERP Contábil.</div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE IMPRESSÃO A4 OFICIAL */}
      {showPrintModal && empresa && apuracao && (
        <ReportPrintPreviewModal
          isOpen={showPrintModal}
          onClose={() => setShowPrintModal(false)}
          empresa={empresa}
          tituloRelatorio="Ficha CIAP Modelo C/D - Bloco G SPED Fiscal"
          subtitulo="Controle de Crédito de ICMS do Ativo Permanente - Art. 20 § 5º da Lei Complementar 87/96"
          periodo={competencia}
        >
          <div className="space-y-6 text-black font-sans text-xs">
            {/* Cabeçalho da Ficha */}
            <div className="border border-black p-3 rounded space-y-1">
              <div className="flex justify-between font-bold text-sm">
                <span>ESTADO DE SÃO PAULO - SECRETARIA DA FAZENDA</span>
                <span>SPED EFD BLOCO G</span>
              </div>
              <div className="flex justify-between">
                <span>Empresa: {empresa.razaoSocial}</span>
                <span>CNPJ: {empresa.cnpj}</span>
                <span>IE: {empresa.inscricaoEstadual}</span>
              </div>
              <div className="flex justify-between">
                <span>Competência de Apuração: {competencia}</span>
                <span>Fator de Saídas Tributadas: {(apuracao.fatorApropriacao * 100).toFixed(4)}%</span>
              </div>
            </div>

            {/* Demonstrativo de Saídas */}
            <div className="border border-black p-3 rounded">
              <div className="font-bold border-b border-black pb-1 mb-2">1. DEMONSTRATIVO DAS SAÍDAS FISCAIS DO PERÍODO (LEI KANDIR)</div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="font-semibold">Saídas Tributadas / Exportações:</span>
                  <div>{formatarMoeda(apuracao.totalSaidasTributadas)}</div>
                </div>
                <div>
                  <span className="font-semibold">Total Geral de Saídas:</span>
                  <div>{formatarMoeda(apuracao.totalSaidasGerais)}</div>
                </div>
                <div>
                  <span className="font-semibold">Fator Calculado (Razão 4 casas):</span>
                  <div className="font-bold">{apuracao.fatorApropriacao.toFixed(4)}</div>
                </div>
              </div>
            </div>

            {/* Tabela de Bens do CIAP */}
            <div>
              <div className="font-bold mb-2">2. DEMONSTRATIVO INDIVIDUAL DOS BENS DO ATIVO PERMANENTE</div>
              <table className="w-full border-collapse border border-black text-[10px]">
                <thead>
                  <tr className="bg-gray-100 border-b border-black">
                    <th className="border border-black p-1 text-left">Código / Descrição</th>
                    <th className="border border-black p-1 text-left">NF-e / Fornecedor</th>
                    <th className="border border-black p-1 text-center">Entrada</th>
                    <th className="border border-black p-1 text-right">Valor Bem</th>
                    <th className="border border-black p-1 text-right">ICMS Dest.</th>
                    <th className="border border-black p-1 text-center">Parc.</th>
                    <th className="border border-black p-1 text-right">1/48 Avos</th>
                    <th className="border border-black p-1 text-right font-bold">Crédito Mês</th>
                    <th className="border border-black p-1 text-right">Saldo Rem.</th>
                  </tr>
                </thead>
                <tbody>
                  {apuracao.itens.map(item => (
                    <tr key={item.id} className="border-b border-black">
                      <td className="border border-black p-1">
                        <strong>{item.codigoBem}</strong> - {item.descricaoBem}
                      </td>
                      <td className="border border-black p-1">
                        NF {item.numeroNotaFiscal} - {item.fornecedorNome}
                      </td>
                      <td className="border border-black p-1 text-center">{item.dataEntrada}</td>
                      <td className="border border-black p-1 text-right">{formatarMoeda(item.valorTotalBem)}</td>
                      <td className="border border-black p-1 text-right">{formatarMoeda(item.valorICMSOriginal)}</td>
                      <td className="border border-black p-1 text-center">{item.parcelaAtual}/{item.totalParcelas}</td>
                      <td className="border border-black p-1 text-right">{formatarMoeda(item.parcelaMesICMS)}</td>
                      <td className="border border-black p-1 text-right font-bold">{formatarMoeda(item.creditoApropriadoMes)}</td>
                      <td className="border border-black p-1 text-right">{formatarMoeda(item.saldoAposApropriacao)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 font-bold border-t border-black">
                    <td colSpan={7} className="border border-black p-1 text-right">TOTAL GERAL DE CRÉDITO APROPRIADO NO MÊS:</td>
                    <td className="border border-black p-1 text-right">{formatarMoeda(apuracao.totalCreditoApropriadoMes)}</td>
                    <td className="border border-black p-1 text-right">{formatarMoeda(apuracao.totalSaldoRemanescente)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Assinaturas */}
            <div className="pt-10 flex justify-between text-center text-xs">
              <div className="w-64 border-t border-black pt-1">
                <div>{empresa.razaoSocial}</div>
                <div className="text-[10px] text-gray-600">Representante Legal / Contribuinte</div>
              </div>
              <div className="w-64 border-t border-black pt-1">
                <div>Responsável Técnico Contábil</div>
                <div className="text-[10px] text-gray-600">CRC/SP 1SP123456/O-0</div>
              </div>
            </div>
          </div>
        </ReportPrintPreviewModal>
      )}
    </div>
  );
};
