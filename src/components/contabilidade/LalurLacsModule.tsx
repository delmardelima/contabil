import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Calculator, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Plus, 
  Trash2, 
  Printer, 
  Download, 
  ArrowRight, 
  ShieldCheck, 
  Scale,
  RefreshCw,
  Info,
  Calendar,
  Layers
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import { 
  LancamentoLalurParteA, 
  ContaParteBLalur, 
  ApuracaoLucroRealLalur, 
  Empresa 
} from '../../types/contabil';
import { ReportPrintPreviewModal } from '../layout/ReportPrintPreviewModal';

export const LalurLacsModule: React.FC = () => {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [periodo, setPeriodo] = useState<string>('2026-1T');
  const [activeTab, setActiveTab] = useState<'PARTE_A' | 'PARTE_B' | 'APURACAO' | 'LEGAL'>('PARTE_A');
  const [apuracao, setApuracao] = useState<ApuracaoLucroRealLalur | null>(null);
  const [contasParteB, setContasParteB] = useState<ContaParteBLalur[]>([]);
  const [lancamentosParteA, setLancamentosParteA] = useState<LancamentoLalurParteA[]>([]);
  
  // Modais
  const [showNovoLancamentoModal, setShowNovoLancamentoModal] = useState(false);
  const [showNovaContaBModal, setShowNovaContaBModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  // Form Parte A
  const [novoTipo, setNovoTipo] = useState<'ADICAO' | 'EXCLUSAO'>('ADICAO');
  const [novoTributo, setNovoTributo] = useState<'IRPJ' | 'CSLL' | 'AMBOS'>('AMBOS');
  const [novoCodigoHistorico, setNovoCodigoHistorico] = useState('M300.99');
  const [novaDescricao, setNovaDescricao] = useState('');
  const [novoValor, setNovoValor] = useState<number>(0);
  const [novaContaContabil, setNovaContaContabil] = useState('');
  const [novoVinculoParteB, setNovoVinculoParteB] = useState<number | undefined>(undefined);

  // Form Parte B
  const [novoCodigoB, setNovoCodigoB] = useState('');
  const [novaDescricaoB, setNovaDescricaoB] = useState('');
  const [novoTributoB, setNovoTributoB] = useState<'IRPJ' | 'CSLL' | 'AMBOS'>('IRPJ');
  const [novoTipoContaB, setNovoTipoContaB] = useState<'PREJUIZO_FISCAL' | 'BASE_NEGATIVA' | 'DEPRECIACAO_ACELERADA' | 'PROVISAO_NAO_DEDUTIVEL' | 'OUTROS'>('PREJUIZO_FISCAL');
  const [novoSaldoInicialB, setNovoSaldoInicialB] = useState<number>(0);

  const carregarDados = () => {
    const emp = dbService.getActiveEmpresa();
    setEmpresa(emp);
    if (emp) {
      const ap = dbService.getApuracaoLucroRealLalur(emp.id, 2026, periodo);
      setApuracao(ap);
      setContasParteB(dbService.getContasParteBLalur(emp.id));
      setLancamentosParteA(dbService.getLancamentosParteA(emp.id, periodo));
    }
  };

  useEffect(() => {
    carregarDados();
  }, [periodo]);

  const handleSalvarLancamentoParteA = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresa || !novaDescricao.trim() || novoValor <= 0) return;

    const vinculoB = contasParteB.find(c => c.id === novoVinculoParteB);

    const novoLanc: LancamentoLalurParteA = {
      id: Date.now(),
      empresaId: empresa.id,
      ano: 2026,
      periodo,
      data: '2026-03-31',
      tipo: novoTipo,
      tributo: novoTributo,
      codigoHistorico: novoCodigoHistorico,
      descricao: novaDescricao.trim(),
      valor: novoValor,
      contaContabilNome: novaContaContabil || undefined,
      contaParteBVinculadaId: vinculoB?.id,
      contaParteBNome: vinculoB ? `${vinculoB.codigo} - ${vinculoB.descricao}` : undefined
    };

    dbService.saveLancamentoParteA(novoLanc);
    setShowNovoLancamentoModal(false);
    setNovaDescricao('');
    setNovoValor(0);
    setNovaContaContabil('');
    setNovoVinculoParteB(undefined);
    carregarDados();
    setFeedbackMsg({ tipo: 'success', texto: 'Lançamento da Parte A cadastrado e recalculado com sucesso!' });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleExcluirLancamentoParteA = (id: number) => {
    dbService.deleteLancamentoParteA(id);
    carregarDados();
    setFeedbackMsg({ tipo: 'success', texto: 'Lançamento excluído com sucesso.' });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleSalvarContaParteB = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresa || !novoCodigoB.trim() || !novaDescricaoB.trim()) return;

    const novaConta: ContaParteBLalur = {
      id: Date.now(),
      empresaId: empresa.id,
      codigo: novoCodigoB.trim(),
      descricao: novaDescricaoB.trim(),
      tipoTributo: novoTributoB,
      tipoConta: novoTipoContaB,
      dataCadastro: new Date().toISOString().split('T')[0],
      saldoInicial: novoSaldoInicialB,
      saldoAtual: novoSaldoInicialB,
      identificadorSpedEcf: `M010_${novoCodigoB.trim().replace('-', '_')}`
    };

    dbService.saveContaParteBLalur(novaConta);
    setShowNovaContaBModal(false);
    setNovoCodigoB('');
    setNovaDescricaoB('');
    setNovoSaldoInicialB(0);
    carregarDados();
    setFeedbackMsg({ tipo: 'success', texto: 'Conta da Parte B cadastrada com sucesso!' });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleExcluirContaParteB = (id: number) => {
    dbService.deleteContaParteBLalur(id);
    carregarDados();
    setFeedbackMsg({ tipo: 'success', texto: 'Conta da Parte B excluída.' });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleIntegrarContabil = () => {
    if (!empresa || !apuracao) return;
    const res = dbService.integrarApuracaoLucroRealContabil(empresa.id, periodo);
    if (res.success) {
      carregarDados();
      setFeedbackMsg({ 
        tipo: 'success', 
        texto: `Provisão de IRPJ (R$ ${apuracao.valorLiquidoIRPJARecolher.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}) e CSLL (R$ ${apuracao.valorLiquidoCSLLARecolher.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}) integrada ao Lote Contábil #${res.loteId} no Livro Diário com sucesso!` 
      });
    }
  };

  const exportarCSV = () => {
    if (!apuracao) return;
    const linhas = [
      ['LIVRO ELETRONICO DE APURACAO DO LUCRO REAL E DA CSLL - LALUR / LACS'],
      ['EMPRESA', empresa?.razaoSocial || ''],
      ['CNPJ', empresa?.cnpj || ''],
      ['PERIODO', apuracao.periodo],
      ['DATA APURACAO', apuracao.dataApuracao],
      [''],
      ['--- DEMONSTRATIVO DO IRPJ (LALUR) ---'],
      ['Lucro Liquido contabil antes dos tributos', apuracao.lucroLiquidoAntesTributos.toFixed(2)],
      ['Total de Adicoes Parte A', apuracao.totalAdicoesIRPJ.toFixed(2)],
      ['Total de Exclusoes Parte A', apuracao.totalExclusoesIRPJ.toFixed(2)],
      ['Lucro Real antes da Compensacao', apuracao.lucroRealAntesCompensacao.toFixed(2)],
      ['Limite Legal de Compensacao (Trava 30%)', apuracao.limiteCompensacaoPrejuizo.toFixed(2)],
      ['Prejuizo Fiscal Compensado Parte B', apuracao.prejuizoFiscalCompensado.toFixed(2)],
      ['Lucro Real Tributavel', apuracao.lucroRealApurado.toFixed(2)],
      ['IRPJ Normal (15%)', apuracao.valorIRPJNormal.toFixed(2)],
      ['Adicional IRPJ (10% s/ excedente R$ 60k)', apuracao.valorAdicionalIRPJ.toFixed(2)],
      ['Total IRPJ Devido', apuracao.totalIRPJDevido.toFixed(2)],
      ['IRRF Retido Dedutivel', apuracao.irrfRetidoDedutivel.toFixed(2)],
      ['Incentivos Fiscais / PAT', apuracao.incentivosFiscaisDedutiveis.toFixed(2)],
      ['Valor Liquido IRPJ a Recolher (DARF 2432)', apuracao.valorLiquidoIRPJARecolher.toFixed(2)],
      [''],
      ['--- DEMONSTRATIVO DA CSLL (LACS) ---'],
      ['Base de Calculo antes da Compensacao', apuracao.baseCalculoCSLLAntesCompensacao.toFixed(2)],
      ['Limite Legal de Compensacao (Trava 30%)', apuracao.limiteCompensacaoBaseNegativa.toFixed(2)],
      ['Base Negativa CSLL Compensada', apuracao.baseNegativaCSLLCompensada.toFixed(2)],
      ['Base de Calculo Final da CSLL', apuracao.baseCalculoFinalCSLL.toFixed(2)],
      ['Aliquota CSLL', '9%'],
      ['Total CSLL Devida', apuracao.totalCSLLDevido.toFixed(2)],
      ['CSRF Retida Dedutivel', apuracao.csrfRetidoDedutivel.toFixed(2)],
      ['Valor Liquido CSLL a Recolher (DARF 6012)', apuracao.valorLiquidoCSLLARecolher.toFixed(2)]
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + linhas.map(e => e.join(';')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LALUR_LACS_${periodo}_${empresa?.cnpj.replace(/\D/g, '')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#181818] p-5 rounded-lg border border-[#282828]">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-white">Livro LALUR & LACS Oficial (Lucro Real)</h1>
              <span className="px-2 py-0.5 text-xs font-mono bg-purple-500/20 text-purple-300 rounded border border-purple-500/30">
                SPED ECF Bloco M
              </span>
            </div>
            <p className="text-sm text-gray-400">
              Escrituração eletrônica e apuração do Lucro Real e da CSLL com Parte A, Parte B e Trava de 30% (Art. 42 da Lei 8.981/95).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#202020] px-3 py-1.5 rounded-lg border border-[#333]">
            <Calendar className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-400">Período:</span>
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer"
            >
              <option value="2026-1T" className="bg-[#181818]">1º Trimestre / 2026</option>
              <option value="2026-2T" className="bg-[#181818]">2º Trimestre / 2026</option>
              <option value="2026-3T" className="bg-[#181818]">3º Trimestre / 2026</option>
              <option value="2026-4T" className="bg-[#181818]">4º Trimestre / 2026</option>
              <option value="2026-ANUAL" className="bg-[#181818]">Ajuste Anual / 2026</option>
            </select>
          </div>

          <button
            onClick={exportarCSV}
            className="flex items-center gap-2 px-3 py-2 bg-[#202020] hover:bg-[#282828] text-gray-300 rounded-lg text-sm transition-colors border border-[#333]"
            title="Exportar Planilha CSV"
          >
            <Download className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          <button
            onClick={() => setShowPrintModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir LALUR A4</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className={`p-4 rounded-lg flex items-center justify-between text-sm ${
          feedbackMsg.tipo === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedbackMsg.texto}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-gray-400 hover:text-white">&times;</button>
        </div>
      )}

      {/* KPI Cards */}
      {apuracao && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#181818] p-4 rounded-lg border border-[#282828]">
            <span className="text-xs text-gray-400 uppercase font-mono">Lucro Líquido Contábil (DRE)</span>
            <div className="text-xl font-bold font-mono text-white mt-1">
              R$ {apuracao.lucroLiquidoAntesTributos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <span>Antes das provisões de IRPJ/CSLL</span>
            </div>
          </div>

          <div className="bg-[#181818] p-4 rounded-lg border border-[#282828]">
            <span className="text-xs text-gray-400 uppercase font-mono">Lucro Real Tributável</span>
            <div className="text-xl font-bold font-mono text-purple-400 mt-1">
              R$ {apuracao.lucroRealApurado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Trava 30% Prejuízo compensado: R$ {apuracao.prejuizoFiscalCompensado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="bg-[#181818] p-4 rounded-lg border border-[#282828]">
            <span className="text-xs text-gray-400 uppercase font-mono">IRPJ Líquido a Recolher</span>
            <div className="text-xl font-bold font-mono text-amber-400 mt-1">
              R$ {apuracao.valorLiquidoIRPJARecolher.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              DARF {apuracao.codigoReceitaDARFIRPJ} (15% + 10% adicional)
            </div>
          </div>

          <div className="bg-[#181818] p-4 rounded-lg border border-[#282828]">
            <span className="text-xs text-gray-400 uppercase font-mono">CSLL Líquida a Recolher</span>
            <div className="text-xl font-bold font-mono text-blue-400 mt-1">
              R$ {apuracao.valorLiquidoCSLLARecolher.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              DARF {apuracao.codigoReceitaDARFCSLL} (Alíquota 9%)
            </div>
          </div>
        </div>
      )}

      {/* Navegação por Abas */}
      <div className="flex border-b border-[#282828] gap-2">
        <button
          onClick={() => setActiveTab('PARTE_A')}
          className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'PARTE_A'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Parte A (Demonstrativo de Ajustes)</span>
          <span className="px-1.5 py-0.2 bg-purple-500/20 text-purple-300 text-xs rounded-full font-mono">
            {lancamentosParteA.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('PARTE_B')}
          className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'PARTE_B'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Parte B (Contas Extracontábeis)</span>
          <span className="px-1.5 py-0.2 bg-purple-500/20 text-purple-300 text-xs rounded-full font-mono">
            {contasParteB.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('APURACAO')}
          className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'APURACAO'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Memória de Cálculo Completa</span>
        </button>

        <button
          onClick={() => setActiveTab('LEGAL')}
          className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'LEGAL'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Base Legal & Trava de 30%</span>
        </button>
      </div>

      {/* ABA 1: PARTE A */}
      {activeTab === 'PARTE_A' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Lançamentos da Parte A do LALUR / LACS</h3>
              <p className="text-xs text-gray-400">Adições e exclusões que ajustam o lucro contábil para determinação do Lucro Real e da Base da CSLL.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleIntegrarContabil}
                disabled={apuracao?.integradoContabil}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  apuracao?.integradoContabil 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 cursor-default'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{apuracao?.integradoContabil ? 'Integrado na Contabilidade ✅' : 'Integrar Provisões no Diário'}</span>
              </button>

              <button
                onClick={() => setShowNovoLancamentoModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Adição / Exclusão</span>
              </button>
            </div>
          </div>

          <div className="bg-[#181818] rounded-lg border border-[#282828] overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#202020] text-gray-400 text-xs font-mono uppercase border-b border-[#282828]">
                <tr>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Tributo</th>
                  <th className="py-3 px-4">Código SPED ECF</th>
                  <th className="py-3 px-4">Descrição do Ajuste</th>
                  <th className="py-3 px-4">Conta Contábil / Contrapartida Parte B</th>
                  <th className="py-3 px-4 text-right">Valor (R$)</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#282828]">
                {lancamentosParteA.map((lanc) => (
                  <tr key={lanc.id} className="hover:bg-[#202020]/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                        lanc.tipo === 'ADICAO' 
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {lanc.tipo === 'ADICAO' ? '(+) ADIÇÃO' : '(-) EXCLUSÃO'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-xs font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        {lanc.tributo}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-gray-300">
                      {lanc.codigoHistorico}
                    </td>
                    <td className="py-3 px-4 text-gray-200 font-medium">
                      {lanc.descricao}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-400">
                      <div>{lanc.contaContabilNome || 'Sem vínculo contábil'}</div>
                      {lanc.contaParteBNome && (
                        <div className="text-purple-400 font-mono text-[11px] mt-0.5">Parte B: {lanc.contaParteBNome}</div>
                      )}
                    </td>
                    <td className={`py-3 px-4 text-right font-mono font-semibold ${
                      lanc.tipo === 'ADICAO' ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {lanc.tipo === 'ADICAO' ? '+' : '-'} R$ {lanc.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleExcluirLancamentoParteA(lanc.id)}
                        className="text-gray-500 hover:text-red-400 transition-colors p-1"
                        title="Excluir Lançamento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {lancamentosParteA.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500 text-sm">
                      Nenhum lançamento cadastrado na Parte A para este período.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 2: PARTE B */}
      {activeTab === 'PARTE_B' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Livro da Parte B (Controle Extracontábil)</h3>
              <p className="text-xs text-gray-400">Contas com reflexos futuros no IRPJ e na CSLL (Prejuízos Fiscais, Bases Negativas e Depreciação Acelerada).</p>
            </div>
            <button
              onClick={() => setShowNovaContaBModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Conta Parte B</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {contasParteB.map((conta) => (
              <div key={conta.id} className="bg-[#181818] p-4 rounded-lg border border-[#282828] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 text-xs font-mono bg-purple-500/20 text-purple-300 rounded border border-purple-500/30">
                      {conta.codigo}
                    </span>
                    <span className="text-xs font-mono text-gray-400">{conta.tipoTributo}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white mt-2">{conta.descricao}</h4>
                  <p className="text-xs text-gray-500 mt-1 font-mono">Tipo: {conta.tipoConta} | SPED: {conta.identificadorSpedEcf}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#282828] flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-400">Saldo Atual Disponível:</span>
                    <div className="text-lg font-bold font-mono text-emerald-400">
                      R$ {conta.saldoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <button
                    onClick={() => handleExcluirContaParteB(conta.id)}
                    className="text-gray-500 hover:text-red-400 transition-colors p-1"
                    title="Excluir Conta Parte B"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 3: APURACAO COMPLETA */}
      {activeTab === 'APURACAO' && apuracao && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LALUR - IRPJ */}
          <div className="bg-[#181818] p-5 rounded-lg border border-[#282828] space-y-4">
            <div className="flex items-center justify-between border-b border-[#282828] pb-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-amber-400" />
                <h3 className="font-semibold text-white">Memória de Cálculo - IRPJ (LALUR)</h3>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded border border-amber-500/20">
                DARF 2432
              </span>
            </div>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between py-1 border-b border-[#222]">
                <span className="text-gray-400">Lucro Líquido Contábil (DRE):</span>
                <span className="font-mono text-white">R$ {apuracao.lucroLiquidoAntesTributos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#222]">
                <span className="text-amber-400">(+) Total de Adições (Parte A):</span>
                <span className="font-mono text-amber-400">+ R$ {apuracao.totalAdicoesIRPJ.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#222]">
                <span className="text-emerald-400">(-) Total de Exclusões (Parte A):</span>
                <span className="font-mono text-emerald-400">- R$ {apuracao.totalExclusoesIRPJ.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-1.5 bg-[#202020] px-3 rounded font-semibold">
                <span className="text-gray-300">Lucro Real antes da Compensação:</span>
                <span className="font-mono text-white">R$ {apuracao.lucroRealAntesCompensacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#222]">
                <span className="text-gray-400">Limite Compensação Prejuízos (30%):</span>
                <span className="font-mono text-gray-300">R$ {apuracao.limiteCompensacaoPrejuizo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#222]">
                <span className="text-emerald-400">(-) Prejuízo Fiscal Compensado:</span>
                <span className="font-mono text-emerald-400">- R$ {apuracao.prejuizoFiscalCompensado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-1.5 bg-purple-500/10 border border-purple-500/20 px-3 rounded font-bold">
                <span className="text-purple-300">(=) Lucro Real Tributável:</span>
                <span className="font-mono text-purple-300">R$ {apuracao.lucroRealApurado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-400">IRPJ Alíquota Normal (15%):</span>
                <span className="font-mono text-white">R$ {apuracao.valorIRPJNormal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#222]">
                <span className="text-gray-400">Adicional de IRPJ (10% s/ excedente R$ 60k):</span>
                <span className="font-mono text-amber-400">+ R$ {apuracao.valorAdicionalIRPJ.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#222]">
                <span className="text-gray-400">(-) IRRF Retido na Fonte / PAT:</span>
                <span className="font-mono text-emerald-400">- R$ {(apuracao.irrfRetidoDedutivel + apuracao.incentivosFiscaisDedutiveis).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-2 bg-amber-500/10 border border-amber-500/30 px-3 rounded font-bold text-base">
                <span className="text-amber-300">Total IRPJ a Recolher:</span>
                <span className="font-mono text-amber-300">R$ {apuracao.valorLiquidoIRPJARecolher.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* LACS - CSLL */}
          <div className="bg-[#181818] p-5 rounded-lg border border-[#282828] space-y-4">
            <div className="flex items-center justify-between border-b border-[#282828] pb-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-white">Memória de Cálculo - CSLL (LACS)</h3>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded border border-blue-500/20">
                DARF 6012
              </span>
            </div>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between py-1 border-b border-[#222]">
                <span className="text-gray-400">Lucro Líquido Contábil (DRE):</span>
                <span className="font-mono text-white">R$ {apuracao.lucroLiquidoAntesTributos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#222]">
                <span className="text-amber-400">(+) Total de Adições CSLL:</span>
                <span className="font-mono text-amber-400">+ R$ {apuracao.totalAdicoesCSLL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#222]">
                <span className="text-emerald-400">(-) Total de Exclusões CSLL:</span>
                <span className="font-mono text-emerald-400">- R$ {apuracao.totalExclusoesCSLL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-1.5 bg-[#202020] px-3 rounded font-semibold">
                <span className="text-gray-300">Base da CSLL antes da Compensação:</span>
                <span className="font-mono text-white">R$ {apuracao.baseCalculoCSLLAntesCompensacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#222]">
                <span className="text-gray-400">Limite Legal de Compensação (30%):</span>
                <span className="font-mono text-gray-300">R$ {apuracao.limiteCompensacaoBaseNegativa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#222]">
                <span className="text-emerald-400">(-) Base Negativa Compensada:</span>
                <span className="font-mono text-emerald-400">- R$ {apuracao.baseNegativaCSLLCompensada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-1.5 bg-blue-500/10 border border-blue-500/20 px-3 rounded font-bold">
                <span className="text-blue-300">(=) Base de Cálculo Final da CSLL:</span>
                <span className="font-mono text-blue-300">R$ {apuracao.baseCalculoFinalCSLL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-400">Alíquota da CSLL (Geral PJ):</span>
                <span className="font-mono text-white">9,00%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#222]">
                <span className="text-gray-400">Total CSLL Devida:</span>
                <span className="font-mono text-white">R$ {apuracao.totalCSLLDevido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#222]">
                <span className="text-gray-400">(-) CSRF Retida na Fonte (1%):</span>
                <span className="font-mono text-emerald-400">- R$ {apuracao.csrfRetidoDedutivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-2 bg-blue-500/10 border border-blue-500/30 px-3 rounded font-bold text-base">
                <span className="text-blue-300">Total CSLL a Recolher:</span>
                <span className="font-mono text-blue-300">R$ {apuracao.valorLiquidoCSLLARecolher.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 4: BASE LEGAL */}
      {activeTab === 'LEGAL' && (
        <div className="bg-[#181818] p-6 rounded-lg border border-[#282828] space-y-4">
          <div className="flex items-center gap-2 text-purple-400">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="font-semibold text-white text-base">Fundamentação Tributária & Conformidade Legal (NBC TG / SPED ECF)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div className="bg-[#202020] p-4 rounded-lg border border-[#333] space-y-2">
              <h4 className="font-semibold text-purple-300 flex items-center gap-1.5">
                <Scale className="w-4 h-4" />
                Trava Legal de 30% (Art. 42 da Lei nº 8.981/1995)
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                O prejuízo fiscal apurado em períodos anteriores pode ser compensado com o lucro real apurado, até o limite máximo de 30% do lucro real antes da compensação. O excedente não utilizado permanece registrado na Parte B do LALUR para aproveitamento nos exercícios fiscais subsequentes, sem prazo decadencial de expiração.
              </p>
            </div>

            <div className="bg-[#202020] p-4 rounded-lg border border-[#333] space-y-2">
              <h4 className="font-semibold text-purple-300 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                RIR/2018 (Decreto nº 9.580/2018) & IN RFB nº 1.700/2017
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                A pessoa jurídica tributada com base no Lucro Real é obrigada a escriturar o Livro Eletrônico de Escrituração e Apuração do Imposto sobre a Renda e da Contribuição Social sobre o Lucro Líquido da Pessoa Jurídica (e-Lalur e e-Lacs), correspondente ao Bloco M da Escrituração Contábil Fiscal (SPED ECF).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo Lançamento Parte A */}
      {showNovoLancamentoModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1c1c1c] border border-[#333] rounded-lg max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#282828] pb-3">
              <h3 className="text-base font-semibold text-white">Novo Ajuste - Parte A do LALUR/LACS</h3>
              <button onClick={() => setShowNovoLancamentoModal(false)} className="text-gray-400 hover:text-white">&times;</button>
            </div>

            <form onSubmit={handleSalvarLancamentoParteA} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Tipo de Ajuste</label>
                  <select
                    value={novoTipo}
                    onChange={(e) => setNovoTipo(e.target.value as any)}
                    className="w-full bg-[#141414] border border-[#333] rounded px-3 py-2 text-white"
                  >
                    <option value="ADICAO">(+) ADIÇÃO</option>
                    <option value="EXCLUSAO">(-) EXCLUSÃO</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Tributo Afetado</label>
                  <select
                    value={novoTributo}
                    onChange={(e) => setNovoTributo(e.target.value as any)}
                    className="w-full bg-[#141414] border border-[#333] rounded px-3 py-2 text-white"
                  >
                    <option value="AMBOS">IRPJ e CSLL (Ambos)</option>
                    <option value="IRPJ">Somente IRPJ</option>
                    <option value="CSLL">Somente CSLL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Código SPED ECF (Registro M300/M350)</label>
                <input
                  type="text"
                  value={novoCodigoHistorico}
                  onChange={(e) => setNovoCodigoHistorico(e.target.value)}
                  placeholder="Ex: M300.01"
                  className="w-full bg-[#141414] border border-[#333] rounded px-3 py-2 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Descrição do Ajuste</label>
                <input
                  type="text"
                  value={novaDescricao}
                  onChange={(e) => setNovaDescricao(e.target.value)}
                  placeholder="Ex: Multas Punitivas Fiscais Não Dedutíveis"
                  className="w-full bg-[#141414] border border-[#333] rounded px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Valor do Ajuste (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={novoValor || ''}
                    onChange={(e) => setNovoValor(parseFloat(e.target.value) || 0)}
                    placeholder="0,00"
                    className="w-full bg-[#141414] border border-[#333] rounded px-3 py-2 text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Vínculo Parte B (Opcional)</label>
                  <select
                    value={novoVinculoParteB || ''}
                    onChange={(e) => setNovoVinculoParteB(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full bg-[#141414] border border-[#333] rounded px-3 py-2 text-white"
                  >
                    <option value="">Sem vínculo com Parte B</option>
                    {contasParteB.map((c) => (
                      <option key={c.id} value={c.id}>{c.codigo} - {c.descricao}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Conta Contábil Relacionada (Opcional)</label>
                <input
                  type="text"
                  value={novaContaContabil}
                  onChange={(e) => setNovaContaContabil(e.target.value)}
                  placeholder="Ex: 4.02.01.05.0003 - Multas e Infrações"
                  className="w-full bg-[#141414] border border-[#333] rounded px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#282828]">
                <button
                  type="button"
                  onClick={() => setShowNovoLancamentoModal(false)}
                  className="px-4 py-2 bg-[#252525] hover:bg-[#303030] text-gray-300 rounded text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-semibold"
                >
                  Gravar Ajuste
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nova Conta Parte B */}
      {showNovaContaBModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1c1c1c] border border-[#333] rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#282828] pb-3">
              <h3 className="text-base font-semibold text-white">Nova Conta - Parte B do LALUR/LACS</h3>
              <button onClick={() => setShowNovaContaBModal(false)} className="text-gray-400 hover:text-white">&times;</button>
            </div>

            <form onSubmit={handleSalvarContaParteB} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Código da Conta</label>
                  <input
                    type="text"
                    value={novoCodigoB}
                    onChange={(e) => setNovoCodigoB(e.target.value)}
                    placeholder="Ex: PF-002"
                    className="w-full bg-[#141414] border border-[#333] rounded px-3 py-2 text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Tributo</label>
                  <select
                    value={novoTributoB}
                    onChange={(e) => setNovoTributoB(e.target.value as any)}
                    className="w-full bg-[#141414] border border-[#333] rounded px-3 py-2 text-white"
                  >
                    <option value="IRPJ">IRPJ</option>
                    <option value="CSLL">CSLL</option>
                    <option value="AMBOS">Ambos</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Classificação da Conta</label>
                <select
                  value={novoTipoContaB}
                  onChange={(e) => setNovoTipoContaB(e.target.value as any)}
                  className="w-full bg-[#141414] border border-[#333] rounded px-3 py-2 text-white"
                >
                  <option value="PREJUIZO_FISCAL">Prejuízo Fiscal Operacional</option>
                  <option value="BASE_NEGATIVA">Base de Cálculo Negativa de CSLL</option>
                  <option value="DEPRECIACAO_ACELERADA">Depreciação Acelerada Incentivada</option>
                  <option value="PROVISAO_NAO_DEDUTIVEL">Provisões Não Dedutíveis</option>
                  <option value="OUTROS">Outros Controles Extracontábeis</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Descrição</label>
                <input
                  type="text"
                  value={novaDescricaoB}
                  onChange={(e) => setNovaDescricaoB(e.target.value)}
                  placeholder="Ex: Prejuízo Fiscal Operacional Acumulado"
                  className="w-full bg-[#141414] border border-[#333] rounded px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Saldo Inicial (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={novoSaldoInicialB || ''}
                  onChange={(e) => setNovoSaldoInicialB(parseFloat(e.target.value) || 0)}
                  placeholder="0,00"
                  className="w-full bg-[#141414] border border-[#333] rounded px-3 py-2 text-white font-mono"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#282828]">
                <button
                  type="button"
                  onClick={() => setShowNovaContaBModal(false)}
                  className="px-4 py-2 bg-[#252525] hover:bg-[#303030] text-gray-300 rounded text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-semibold"
                >
                  Salvar Conta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPrintModal && apuracao && empresa && (
        <ReportPrintPreviewModal
          isOpen={showPrintModal}
          onClose={() => setShowPrintModal(false)}
          empresa={empresa}
          tituloRelatorio="Livro Eletrônico LALUR / LACS Oficial - Bloco M"
          subtitulo="SPED ECF / Demonstração do Lucro Real e da CSLL"
          periodo={periodo}
          orientacaoPadrao="portrait"
        >
          <div className="p-8 text-black bg-white font-sans text-xs space-y-6">
            <div className="border-b-2 border-black pb-4 flex justify-between items-start">
              <div>
                <h1 className="text-base font-bold uppercase">{empresa.razaoSocial}</h1>
                <p className="text-gray-700">CNPJ: {empresa.cnpj} | NIRE: {empresa.nire || '35.2.198274-1'}</p>
                <p className="text-gray-700">{empresa.logradouro}, {empresa.numero} - {empresa.cidade}/{empresa.uf}</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-sm">LIVRO LALUR / LACS</span>
                <p className="text-gray-600">SPED ECF Bloco M</p>
                <p className="font-mono text-gray-600 font-semibold">Período: {periodo}</p>
              </div>
            </div>

            <div>
              <h2 className="font-bold text-sm uppercase bg-gray-100 p-2 border-y border-black">
                1. Demonstração do Lucro Real - Bloco M300 (IRPJ)
              </h2>
              <table className="w-full mt-2 border-collapse border border-black text-xs">
                <thead>
                  <tr className="bg-gray-100 border-b border-black">
                    <th className="p-1.5 text-left border-r border-black">Linha</th>
                    <th className="p-1.5 text-left border-r border-black">Discriminação</th>
                    <th className="p-1.5 text-right">Valor (R$)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black font-mono">
                  <tr>
                    <td className="p-1 border-r border-black">1.01</td>
                    <td className="p-1 border-r border-black font-sans">LUCRO LÍQUIDO DO PERÍODO ANTES DO IRPJ E CSLL</td>
                    <td className="p-1 text-right">{apuracao.lucroLiquidoAntesTributos.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="p-1 border-r border-black text-amber-700">1.02</td>
                    <td className="p-1 border-r border-black font-sans text-amber-700">(+) TOTAL DE ADIÇÕES À BASE DE CÁLCULO</td>
                    <td className="p-1 text-right text-amber-700">+{apuracao.totalAdicoesIRPJ.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="p-1 border-r border-black text-emerald-700">1.03</td>
                    <td className="p-1 border-r border-black font-sans text-emerald-700">(-) TOTAL DE EXCLUSÕES DA BASE DE CÁLCULO</td>
                    <td className="p-1 text-right text-emerald-700">-{apuracao.totalExclusoesIRPJ.toFixed(2)}</td>
                  </tr>
                  <tr className="font-bold bg-gray-50">
                    <td className="p-1 border-r border-black">1.04</td>
                    <td className="p-1 border-r border-black font-sans">(=) LUCRO REAL ANTES DA COMPENSAÇÃO DE PREJUÍZOS</td>
                    <td className="p-1 text-right">{apuracao.lucroRealAntesCompensacao.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="p-1 border-r border-black">1.05</td>
                    <td className="p-1 border-r border-black font-sans">(-) Limite Legal de Compensação (Trava de 30% Art. 42 Lei 8.981/95)</td>
                    <td className="p-1 text-right">{apuracao.limiteCompensacaoPrejuizo.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="p-1 border-r border-black text-emerald-700">1.06</td>
                    <td className="p-1 border-r border-black font-sans text-emerald-700">(-) Prejuízo Fiscal Efetivamente Compensado da Parte B</td>
                    <td className="p-1 text-right text-emerald-700">-{apuracao.prejuizoFiscalCompensado.toFixed(2)}</td>
                  </tr>
                  <tr className="font-bold bg-gray-100">
                    <td className="p-1 border-r border-black">1.07</td>
                    <td className="p-1 border-r border-black font-sans">(=) LUCRO REAL TRIBUTÁVEL DO PERÍODO</td>
                    <td className="p-1 text-right">{apuracao.lucroRealApurado.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="p-1 border-r border-black">1.08</td>
                    <td className="p-1 border-r border-black font-sans">IRPJ Alíquota Normal (15%)</td>
                    <td className="p-1 text-right">{apuracao.valorIRPJNormal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="p-1 border-r border-black">1.09</td>
                    <td className="p-1 border-r border-black font-sans">Adicional de IRPJ (10% sobre excedente a R$ 60.000,00)</td>
                    <td className="p-1 text-right">{apuracao.valorAdicionalIRPJ.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="p-1 border-r border-black">1.10</td>
                    <td className="p-1 border-r border-black font-sans">(-) Deduções de IRRF Retido na Fonte e PAT</td>
                    <td className="p-1 text-right">-{(apuracao.irrfRetidoDedutivel + apuracao.incentivosFiscaisDedutiveis).toFixed(2)}</td>
                  </tr>
                  <tr className="font-bold bg-gray-200">
                    <td className="p-1 border-r border-black">1.11</td>
                    <td className="p-1 border-r border-black font-sans">(=) VALOR LÍQUIDO DO IRPJ A RECOLHER (DARF 2432)</td>
                    <td className="p-1 text-right">{apuracao.valorLiquidoIRPJARecolher.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <h2 className="font-bold text-sm uppercase bg-gray-100 p-2 border-y border-black">
                2. Demonstração da Base de Cálculo da CSLL - Bloco M350 (LACS)
              </h2>
              <table className="w-full mt-2 border-collapse border border-black text-xs">
                <thead>
                  <tr className="bg-gray-100 border-b border-black">
                    <th className="p-1.5 text-left border-r border-black">Linha</th>
                    <th className="p-1.5 text-left border-r border-black">Discriminação</th>
                    <th className="p-1.5 text-right">Valor (R$)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black font-mono">
                  <tr>
                    <td className="p-1 border-r border-black">2.01</td>
                    <td className="p-1 border-r border-black font-sans">BASE DE CÁLCULO ANTES DA COMPENSAÇÃO DE BASE NEGATIVA</td>
                    <td className="p-1 text-right">{apuracao.baseCalculoCSLLAntesCompensacao.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="p-1 border-r border-black text-emerald-700">2.02</td>
                    <td className="p-1 border-r border-black font-sans text-emerald-700">(-) Base Negativa de CSLL Compensada (Trava 30%)</td>
                    <td className="p-1 text-right text-emerald-700">-{apuracao.baseNegativaCSLLCompensada.toFixed(2)}</td>
                  </tr>
                  <tr className="font-bold bg-gray-50">
                    <td className="p-1 border-r border-black">2.03</td>
                    <td className="p-1 border-r border-black font-sans">(=) BASE DE CÁLCULO DEFINITIVA DA CSLL</td>
                    <td className="p-1 text-right">{apuracao.baseCalculoFinalCSLL.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="p-1 border-r border-black">2.04</td>
                    <td className="p-1 border-r border-black font-sans">CSLL Devida (Alíquota 9%)</td>
                    <td className="p-1 text-right">{apuracao.totalCSLLDevido.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="p-1 border-r border-black">2.05</td>
                    <td className="p-1 border-r border-black font-sans">(-) Retenções na Fonte de CSRF (1%)</td>
                    <td className="p-1 text-right">-{apuracao.csrfRetidoDedutivel.toFixed(2)}</td>
                  </tr>
                  <tr className="font-bold bg-gray-200">
                    <td className="p-1 border-r border-black">2.06</td>
                    <td className="p-1 border-r border-black font-sans">(=) VALOR LÍQUIDO DA CSLL A RECOLHER (DARF 6012)</td>
                    <td className="p-1 text-right">{apuracao.valorLiquidoCSLLARecolher.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-12 grid grid-cols-2 gap-8 text-center border-t border-black">
              <div>
                <div className="border-t border-black pt-1 font-semibold">{empresa.responsavelLegal || 'ADMINISTRADOR RESPONSÁVEL'}</div>
                <p className="text-gray-600">Sócio-Administrador / Diretor Executivo</p>
              </div>
              <div>
                <div className="border-t border-black pt-1 font-semibold">{empresa.contadorNome || 'ROBERTO CARLOS DA SILVA'}</div>
                <p className="text-gray-600">Contador Responsável - CRC {empresa.contadorCRC || '1SP999999/O-0'}</p>
              </div>
            </div>
          </div>
        </ReportPrintPreviewModal>
      )}
    </div>
  );
};
