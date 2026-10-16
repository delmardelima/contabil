import React, { useState, useEffect } from 'react';
import { 
  Empresa, 
  CreditoTributarioPerDcomp, 
  DeclaracaoPerDcomp, 
  DebitoCompensadoPerDcomp,
  TipoCreditoPerDcomp 
} from '../../types/contabil';
import { dbService } from '../../db/sqliteService';
import { 
  Scale, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Plus, 
  Trash2, 
  Printer, 
  DollarSign, 
  Building2, 
  Calendar, 
  ArrowRight, 
  Zap, 
  ShieldCheck,
  Send,
  Download,
  Info,
  Clock,
  RefreshCw,
  Search
} from 'lucide-react';

interface PerDcompModuleProps {
  empresa: Empresa;
  onOpenReportPreview: (title: string, subtitle: string, content: React.ReactNode, orientation?: 'portrait' | 'landscape') => void;
  onIntegracaoSucesso?: () => void;
}

export const PerDcompModule: React.FC<PerDcompModuleProps> = ({ 
  empresa, 
  onOpenReportPreview,
  onIntegracaoSucesso 
}) => {
  const [activeTab, setActiveTab] = useState<'CREDITOS' | 'NOVA_DCOMP' | 'DECLARACOES'>('CREDITOS');
  const [creditos, setCreditos] = useState<CreditoTributarioPerDcomp[]>([]);
  const [declaracoes, setDeclaracoes] = useState<DeclaracaoPerDcomp[]>([]);
  const [feedback, setFeedback] = useState<{ tipo: 'success' | 'error' | 'info'; texto: string } | null>(null);

  // Modal Novo Crédito
  const [modalNovoCredito, setModalNovoCredito] = useState(false);
  const [novoTipoCredito, setNovoTipoCredito] = useState<TipoCreditoPerDcomp>('SALDO_NEGATIVO_IRPJ');
  const [novoPeriodo, setNovoPeriodo] = useState('2026-1T');
  const [novoDtPgto, setNovoDtPgto] = useState('2026-04-30');
  const [novoValorOrig, setNovoValorOrig] = useState<number>(15000);
  const [novaSelic, setNovaSelic] = useState<number>(8.5);

  // Form Nova Declaração PER/DCOMP
  const [creditoSelecionadoId, setCreditoSelecionadoId] = useState<number>(0);
  const [dtTransmissao, setDtTransmissao] = useState(new Date().toISOString().slice(0, 10));
  const [debitosParaCompensar, setDebitosParaCompensar] = useState<{
    tributo: 'PIS' | 'COFINS' | 'IRPJ' | 'CSLL' | 'IPI' | 'INSS_PREVIDENCIARIO';
    codigoReceitaDarf: string;
    periodoApuracao: string;
    dataVencimento: string;
    valorPrincipal: number;
  }[]>([
    { tributo: 'PIS', codigoReceitaDarf: '8109', periodoApuracao: '2026-09', dataVencimento: '2026-10-25', valorPrincipal: 4500 },
    { tributo: 'COFINS', codigoReceitaDarf: '2172', periodoApuracao: '2026-09', dataVencimento: '2026-10-25', valorPrincipal: 8900 }
  ]);

  const carregarDados = () => {
    const creds = dbService.getCreditosPerDcomp(empresa.id);
    const decls = dbService.getDeclaracoesPerDcomp(empresa.id);
    setCreditos(creds);
    setDeclaracoes(decls);
    if (creds.length > 0 && creditoSelecionadoId === 0) {
      const disponivel = creds.find(c => c.saldoDisponivel > 0);
      if (disponivel) setCreditoSelecionadoId(disponivel.id);
      else setCreditoSelecionadoId(creds[0].id);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [empresa.id]);

  const totalCreditosOriginal = creditos.reduce((s, c) => s + c.valorOriginal, 0);
  const totalCreditosAtualizados = creditos.reduce((s, c) => s + c.valorTotalAtualizado, 0);
  const totalCreditosUtilizados = creditos.reduce((s, c) => s + c.valorJaUtilizado, 0);
  const totalSaldoDisponivel = creditos.reduce((s, c) => s + c.saldoDisponivel, 0);

  const handleSalvarNovoCredito = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      dbService.salvarCreditoPerDcomp({
        empresaId: empresa.id,
        tipoCredito: novoTipoCredito,
        periodoApuracao: novoPeriodo,
        dataPagamentoConstituicao: novoDtPgto,
        valorOriginal: novoValorOrig,
        taxaSelicAcumulada: novaSelic
      });
      setFeedback({ tipo: 'success', texto: 'Crédito tributário registrado e atualizado com base na taxa SELIC.' });
      setModalNovoCredito(false);
      carregarDados();
    } catch (err: any) {
      setFeedback({ tipo: 'error', texto: 'Erro ao salvar crédito: ' + err.message });
    }
  };

  const handleTransmitirDcomp = (e: React.FormEvent) => {
    e.preventDefault();
    const cred = creditos.find(c => c.id === creditoSelecionadoId);
    if (!cred) {
      setFeedback({ tipo: 'error', texto: 'Selecione um crédito tributário de origem.' });
      return;
    }

    const totalDebitos = debitosParaCompensar.reduce((s, d) => s + d.valorPrincipal, 0);
    if (totalDebitos > cred.saldoDisponivel) {
      setFeedback({ tipo: 'error', texto: `O total dos débitos (R$ ${totalDebitos.toFixed(2)}) ultrapassa o saldo disponível do crédito (R$ ${cred.saldoDisponivel.toFixed(2)}).` });
      return;
    }

    try {
      const debitosMapped: DebitoCompensadoPerDcomp[] = debitosParaCompensar.map((d, idx) => ({
        id: Date.now() + idx,
        tributo: d.tributo,
        codigoReceitaDarf: d.codigoReceitaDarf,
        periodoApuracao: d.periodoApuracao,
        dataVencimento: d.dataVencimento,
        valorPrincipal: d.valorPrincipal,
        valorMulta: 0,
        valorJuros: 0,
        valorTotalDebito: d.valorPrincipal,
        valorCompensado: d.valorPrincipal
      }));

      const dcomp = dbService.salvarDeclaracaoPerDcomp({
        empresaId: empresa.id,
        creditoId: cred.id,
        dataTransmissao: dtTransmissao,
        debitosCompensados: debitosMapped
      });

      setFeedback({ tipo: 'success', texto: `Declaração ${dcomp.numeroPerDcomp} transmitida com sucesso. Saldo compensado: R$ ${totalDebitos.toFixed(2)}.` });
      carregarDados();
      setActiveTab('DECLARACOES');
    } catch (err: any) {
      setFeedback({ tipo: 'error', texto: 'Erro ao transmitir DCOMP: ' + err.message });
    }
  };

  const handleIntegrarContabil = (dcompId: number) => {
    const res = dbService.integrarPerDcompContabil(dcompId);
    if (res.sucesso) {
      setFeedback({ tipo: 'success', texto: res.mensagem });
      carregarDados();
      if (onIntegracaoSucesso) onIntegracaoSucesso();
    } else {
      setFeedback({ tipo: 'error', texto: res.mensagem });
    }
  };

  // Impressão Oficial A4 da Declaração de Compensação (PER/DCOMP)
  const handleImprimirDcomp = (dcomp: DeclaracaoPerDcomp) => {
    const cred = creditos.find(c => c.id === dcomp.creditoId);

    const relatorioA4 = (
      <div className="p-6 bg-white text-neutral-900 font-sans text-xs space-y-4 min-h-[850px]">
        {/* Cabeçalho Oficial RFB */}
        <div className="border-b-2 border-neutral-900 pb-3 flex justify-between items-start">
          <div>
            <h1 className="text-sm font-bold uppercase tracking-wider">MINISTÉRIO DA FAZENDA - SECRETARIA DA RECEITA FEDERAL DO BRASIL</h1>
            <h2 className="text-xs font-black uppercase text-neutral-800">DOCUMENTO DE COMPROVAÇÃO DE TRANSMISSÃO DE PER/DCOMP</h2>
            <p className="text-[10px] text-neutral-600 font-mono">INSTRUÇÃO NORMATIVA RFB Nº 2.055/2021 | LEI Nº 9.430/1996 ART. 74</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-neutral-500 block">Número do Documento</span>
            <span className="text-sm font-black font-mono text-emerald-800">{dcomp.numeroPerDcomp}</span>
            <p className="text-[9px] text-neutral-500">Transmitido em: {dcomp.dataTransmissao}</p>
          </div>
        </div>

        {/* Quadro 1: Identificação do Sujeito Passivo */}
        <div className="border border-neutral-300 rounded p-2.5 bg-neutral-50">
          <span className="text-[9px] font-bold uppercase text-neutral-500 block mb-1">Quadro 01 - Identificação do Sujeito Passivo</span>
          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <div>
              <span className="text-neutral-500 block text-[8px] uppercase">Razão Social</span>
              <span className="font-bold">{empresa.razaoSocial}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[8px] uppercase">CNPJ / Estabelecimento Matriz</span>
              <span className="font-mono font-semibold">{empresa.cnpj}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[8px] uppercase">Domicílio Fiscal</span>
              <span>{empresa.cidade}/{empresa.uf}</span>
            </div>
          </div>
        </div>

        {/* Quadro 2: Dados do Crédito Utilizado */}
        <div className="border border-neutral-300 rounded p-2.5 bg-neutral-50">
          <span className="text-[9px] font-bold uppercase text-neutral-500 block mb-1">Quadro 02 - Demonstração do Crédito Tributário Reconhecido</span>
          <div className="grid grid-cols-4 gap-2 text-[10px]">
            <div>
              <span className="text-neutral-500 block text-[8px] uppercase">Espécie do Crédito</span>
              <span className="font-bold text-emerald-800">{dcomp.tipoCredito.replace(/_/g, ' ')}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[8px] uppercase">Período de Apuração</span>
              <span className="font-mono">{cred?.periodoApuracao || '-'}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[8px] uppercase">Valor Original do Crédito</span>
              <span className="font-mono">R$ {dcomp.valorCreditoOriginal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[8px] uppercase">Valor Total Atualizado (SELIC)</span>
              <span className="font-mono font-bold text-neutral-900">R$ {dcomp.valorCreditoAtualizadoSelic.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Quadro 3: Débitos Compensados nesta Declaração */}
        <div>
          <div className="bg-neutral-800 text-white px-2 py-1 font-bold text-[10px] uppercase tracking-wide">
            Quadro 03 - Débitos Tributários Federais Extintos por Compensação
          </div>
          <table className="w-full text-[10px] border border-neutral-300 mt-1">
            <thead>
              <tr className="bg-neutral-200 text-neutral-800 font-bold border-b border-neutral-300">
                <th className="py-1 px-2 text-left">Tributo</th>
                <th className="py-1 px-2 text-left">Cód. Receita DARF</th>
                <th className="py-1 px-2 text-left">Período Apuração</th>
                <th className="py-1 px-2 text-left">Data Vencimento</th>
                <th className="py-1 px-2 text-right">Valor Principal (R$)</th>
                <th className="py-1 px-2 text-right">Total Compensado (R$)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {dcomp.debitosCompensados.map(deb => (
                <tr key={deb.id}>
                  <td className="py-1.5 px-2 font-bold">{deb.tributo}</td>
                  <td className="py-1.5 px-2 font-mono">{deb.codigoReceitaDarf}</td>
                  <td className="py-1.5 px-2 font-mono">{deb.periodoApuracao}</td>
                  <td className="py-1.5 px-2 font-mono">{deb.dataVencimento}</td>
                  <td className="py-1.5 px-2 font-mono text-right">R$ {deb.valorPrincipal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="py-1.5 px-2 font-mono font-bold text-right text-emerald-800">
                    R$ {deb.valorCompensado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-neutral-100 font-bold border-t-2 border-neutral-800">
                <td colSpan={5} className="py-1.5 px-2 text-right uppercase text-[9px]">Total Geral dos Débitos Extintos:</td>
                <td className="py-1.5 px-2 font-mono text-right text-emerald-800">
                  R$ {dcomp.totalDebitosCompensados.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
              </tr>
              <tr className="bg-neutral-50 font-bold text-neutral-600">
                <td colSpan={5} className="py-1 px-2 text-right uppercase text-[9px]">Saldo Remanescente do Crédito para Futuras DCOMPs:</td>
                <td className="py-1 px-2 font-mono text-right text-neutral-900">
                  R$ {dcomp.saldoRemanescenteCredito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Quadro 4: Termo de Responsabilidade Legal & Homologação */}
        <div className="pt-8 border-t border-neutral-300 mt-6 text-[9px] text-neutral-600 space-y-6">
          <p className="leading-tight">
            A declaração de compensação constitui confissão de dívida e instrumento hábil e suficiente para a exigência dos débitos indevidamente compensados (Lei nº 9.430/1996, art. 74, § 6º). O prazo para homologação tácita da compensação é de 5 (cinco) anos, contados da data de entrega da declaração.
          </p>

          <div className="grid grid-cols-2 gap-12 text-center pt-4">
            <div className="border-t border-neutral-800 pt-1">
              <span className="font-bold text-neutral-900 block text-[10px]">{empresa.responsavelLegal || 'Representante Legal da PJ'}</span>
              <span className="text-[8px] text-neutral-500 uppercase">Assinatura do Sujeito Passivo / Procurador</span>
            </div>
            <div className="border-t border-neutral-800 pt-1">
              <span className="font-bold text-neutral-900 block text-[10px]">Amilton Silva de Oliveira - CRC-SP 1SP298450/O-2</span>
              <span className="text-[8px] text-neutral-500 uppercase">Contador Responsável Técnico</span>
            </div>
          </div>
        </div>
      </div>
    );

    onOpenReportPreview(
      `DECLARAÇÃO DE COMPENSAÇÃO (PER/DCOMP) - ${dcomp.numeroPerDcomp}`,
      `Emitido em estrita conformidade com a IN RFB nº 2.055/2021`,
      relatorioA4,
      'portrait'
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#141414] text-neutral-100 overflow-hidden">
      {/* Top Banner PER/DCOMP Fluent */}
      <div className="p-4 bg-[#181818] border-b border-white/5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Scale size={22} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-neutral-100">PER/DCOMP Web & Créditos Compensáveis</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                IN RFB nº 2.055/2021
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Gestão de Saldos Negativos de IRPJ/CSLL, PIS/COFINS, Retenção 11% INSS e Atualização SELIC
            </p>
          </div>
        </div>

        {/* Abas */}
        <div className="flex items-center space-x-1 bg-neutral-900/80 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab('CREDITOS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'CREDITOS' ? 'bg-blue-600 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Créditos Disponíveis
          </button>
          <button
            onClick={() => setActiveTab('NOVA_DCOMP')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'NOVA_DCOMP' ? 'bg-blue-600 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Nova DCOMP (Compensar)
          </button>
          <button
            onClick={() => setActiveTab('DECLARACOES')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'DECLARACOES' ? 'bg-blue-600 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Declarações Transmitidas
          </button>
        </div>
      </div>

      {/* KPI Cards de Saldos Tributários */}
      <div className="grid grid-cols-4 gap-3 p-4 bg-[#161616] border-b border-white/5">
        <div className="p-3 bg-[#181818] border border-white/5 rounded-xl">
          <span className="text-[10px] text-neutral-500 uppercase font-bold block">Créditos Originais</span>
          <span className="text-base font-mono font-bold text-neutral-300">
            R$ {totalCreditosOriginal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-neutral-500 block mt-0.5">Valor histórico constituído</span>
        </div>
        <div className="p-3 bg-[#181818] border border-white/5 rounded-xl">
          <span className="text-[10px] text-neutral-500 uppercase font-bold block">Créditos Atualizados (SELIC)</span>
          <span className="text-base font-mono font-bold text-blue-400">
            R$ {totalCreditosAtualizados.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-emerald-400 block mt-0.5 font-semibold">
            + R$ {(totalCreditosAtualizados - totalCreditosOriginal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} juros SELIC
          </span>
        </div>
        <div className="p-3 bg-[#181818] border border-white/5 rounded-xl">
          <span className="text-[10px] text-neutral-500 uppercase font-bold block">Créditos Já Compensados</span>
          <span className="text-base font-mono font-bold text-amber-400">
            R$ {totalCreditosUtilizados.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-neutral-500 block mt-0.5">Extintos em DCOMPs</span>
        </div>
        <div className="p-3 bg-[#181818] border border-emerald-500/20 bg-emerald-500/[0.02] rounded-xl">
          <span className="text-[10px] text-emerald-400 uppercase font-bold block">Saldo Disponível para Uso</span>
          <span className="text-lg font-mono font-black text-emerald-400">
            R$ {totalSaldoDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-emerald-500/80 block mt-0.5">Pronto para compensação</span>
        </div>
      </div>

      {/* Banner de Feedback */}
      {feedback && (
        <div className={`mx-4 mt-3 px-4 py-2.5 rounded-xl border text-xs flex items-center justify-between animate-in fade-in ${
          feedback.tipo === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
          feedback.tipo === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
          'bg-blue-500/10 border-blue-500/30 text-blue-400'
        }`}>
          <div className="flex items-center space-x-2">
            {feedback.tipo === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            <span>{feedback.texto}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-neutral-400 hover:text-neutral-200">✕</button>
        </div>
      )}

      {/* Conteúdo Dinâmico */}
      <div className="flex-1 p-4 overflow-y-auto">
        {/* ABA 1: CRÉDITOS TRIBUTÁRIOS DISPONÍVEIS */}
        {activeTab === 'CREDITOS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400">
                Créditos Tributários Cadastrados: <strong className="text-neutral-200">{creditos.length}</strong>
              </span>
              <button
                onClick={() => setModalNovoCredito(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition shadow"
              >
                <Plus size={14} />
                <span>Registrar Novo Crédito</span>
              </button>
            </div>

            <div className="bg-[#181818] border border-white/5 rounded-xl overflow-hidden shadow-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-900/60 text-neutral-400 uppercase text-[10px] font-bold border-b border-white/5">
                  <tr>
                    <th className="py-2.5 px-3">Espécie do Crédito</th>
                    <th className="py-2.5 px-3">Período Apuração</th>
                    <th className="py-2.5 px-3">Data Constituição</th>
                    <th className="py-2.5 px-3 text-right">Valor Original (R$)</th>
                    <th className="py-2.5 px-2 text-center">SELIC Acumulada</th>
                    <th className="py-2.5 px-3 text-right">Juros SELIC (R$)</th>
                    <th className="py-2.5 px-3 text-right">Total Atualizado (R$)</th>
                    <th className="py-2.5 px-3 text-right">Saldo Disponível (R$)</th>
                    <th className="py-2.5 px-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                  {creditos.map(c => (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition">
                      <td className="py-2.5 px-3 font-sans font-semibold text-neutral-200">
                        {c.tipoCredito.replace(/_/g, ' ')}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-neutral-300">{c.periodoApuracao}</td>
                      <td className="py-2.5 px-3 text-neutral-400">{c.dataPagamentoConstituicao}</td>
                      <td className="py-2.5 px-3 text-right">R$ {c.valorOriginal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td className="py-2.5 px-2 text-center font-bold text-emerald-400">+{c.taxaSelicAcumulada.toFixed(2)}%</td>
                      <td className="py-2.5 px-3 text-right text-emerald-400">R$ {c.valorJurosSelic.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-blue-300">
                        R$ {c.valorTotalAtualizado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-emerald-400">
                        R$ {c.saldoDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          c.status === 'DISPONIVEL' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          c.status === 'COMPENSADO_PARCIAL' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-neutral-800 text-neutral-500'
                        }`}>
                          {c.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 2: NOVA DECLARAÇÃO DCOMP */}
        {activeTab === 'NOVA_DCOMP' && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="p-4 bg-[#181818] border border-white/5 rounded-xl shadow space-y-4">
              <h3 className="text-sm font-bold text-neutral-100 flex items-center space-x-2">
                <Send size={16} className="text-blue-400" />
                <span>Nova Declaração de Compensação (DCOMP)</span>
              </h3>

              <form onSubmit={handleTransmitirDcomp} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-neutral-400 block mb-1">Selecione o Crédito de Origem:</label>
                    <select
                      value={creditoSelecionadoId}
                      onChange={e => setCreditoSelecionadoId(Number(e.target.value))}
                      className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200"
                    >
                      {creditos.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.tipoCredito.replace(/_/g, ' ')} ({c.periodoApuracao}) - Saldo: R$ {c.saldoDisponivel.toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-1">Data de Transmissão da DCOMP:</label>
                    <input
                      type="date"
                      value={dtTransmissao}
                      onChange={e => setDtTransmissao(e.target.value)}
                      className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200 font-mono"
                    />
                  </div>
                </div>

                {/* Lista de Débitos a Compensar */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-neutral-300 font-bold uppercase text-[10px]">
                      Débitos Federais a Extinguir por Compensação:
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setDebitosParaCompensar([
                          ...debitosParaCompensar,
                          { tributo: 'PIS', codigoReceitaDarf: '8109', periodoApuracao: '2026-10', dataVencimento: '2026-11-25', valorPrincipal: 2000 }
                        ]);
                      }}
                      className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-[10px] border border-white/10 flex items-center space-x-1"
                    >
                      <Plus size={12} />
                      <span>Adicionar Débito</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {debitosParaCompensar.map((deb, idx) => (
                      <div key={idx} className="p-3 bg-neutral-900/60 border border-white/5 rounded-lg grid grid-cols-5 gap-2 items-center">
                        <div>
                          <span className="text-[9px] text-neutral-500 block uppercase">Tributo</span>
                          <select
                            value={deb.tributo}
                            onChange={e => {
                              const arr = [...debitosParaCompensar];
                              arr[idx].tributo = e.target.value as any;
                              setDebitosParaCompensar(arr);
                            }}
                            className="w-full bg-neutral-950 border border-white/10 rounded p-1.5 text-neutral-200 text-xs"
                          >
                            <option value="PIS">PIS (8109)</option>
                            <option value="COFINS">COFINS (2172)</option>
                            <option value="IRPJ">IRPJ (2089/2362)</option>
                            <option value="CSLL">CSLL (2372/6012)</option>
                            <option value="IPI">IPI (1097)</option>
                            <option value="INSS_PREVIDENCIARIO">INSS Previdenciário</option>
                          </select>
                        </div>
                        <div>
                          <span className="text-[9px] text-neutral-500 block uppercase">Cód. DARF</span>
                          <input
                            type="text"
                            value={deb.codigoReceitaDarf}
                            onChange={e => {
                              const arr = [...debitosParaCompensar];
                              arr[idx].codigoReceitaDarf = e.target.value;
                              setDebitosParaCompensar(arr);
                            }}
                            className="w-full bg-neutral-950 border border-white/10 rounded p-1.5 text-neutral-200 font-mono text-xs"
                          />
                        </div>
                        <div>
                          <span className="text-[9px] text-neutral-500 block uppercase">Período</span>
                          <input
                            type="text"
                            value={deb.periodoApuracao}
                            onChange={e => {
                              const arr = [...debitosParaCompensar];
                              arr[idx].periodoApuracao = e.target.value;
                              setDebitosParaCompensar(arr);
                            }}
                            className="w-full bg-neutral-950 border border-white/10 rounded p-1.5 text-neutral-200 font-mono text-xs"
                          />
                        </div>
                        <div>
                          <span className="text-[9px] text-neutral-500 block uppercase">Valor Débito (R$)</span>
                          <input
                            type="number"
                            step="0.01"
                            value={deb.valorPrincipal}
                            onChange={e => {
                              const arr = [...debitosParaCompensar];
                              arr[idx].valorPrincipal = Number(e.target.value);
                              setDebitosParaCompensar(arr);
                            }}
                            className="w-full bg-neutral-950 border border-white/10 rounded p-1.5 text-neutral-200 font-mono text-xs text-right font-bold text-emerald-400"
                          />
                        </div>
                        <div className="flex justify-end pt-3">
                          <button
                            type="button"
                            onClick={() => {
                              const arr = debitosParaCompensar.filter((_, i) => i !== idx);
                              setDebitosParaCompensar(arr);
                            }}
                            className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded"
                            title="Remover"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-neutral-900/90 rounded-lg border border-white/10 mt-3 flex justify-between items-center text-xs">
                    <span className="text-neutral-400">Total a Compensar nesta DCOMP:</span>
                    <span className="text-base font-mono font-black text-emerald-400">
                      R$ {debitosParaCompensar.reduce((s, d) => s + d.valorPrincipal, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t border-white/10">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex items-center space-x-2 shadow"
                  >
                    <Send size={15} />
                    <span>Transmitir PER/DCOMP</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ABA 3: DECLARAÇÕES PER/DCOMP TRANSMITIDAS */}
        {activeTab === 'DECLARACOES' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400">
                Declarações Transmitidas: <strong className="text-neutral-200">{declaracoes.length}</strong>
              </span>
            </div>

            <div className="space-y-3">
              {declaracoes.map(d => (
                <div key={d.id} className="p-4 bg-[#181818] border border-white/5 rounded-xl shadow space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded font-mono text-xs font-black bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {d.numeroPerDcomp}
                        </span>
                        <span className="text-xs text-neutral-300 font-semibold">
                          Origem: {d.tipoCredito.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-500 font-mono mt-1 block">
                        Transmitido em: {d.dataTransmissao} | Crédito Utilizado: R$ {d.totalDebitosCompensados.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {d.integradoContabilidade ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Lote Contábil #{d.numeroLoteContabil}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleIntegrarContabil(d.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 shadow"
                        >
                          <Zap size={12} />
                          <span>Integrar Contábil (1-Clique)</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleImprimirDcomp(d)}
                        className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs border border-white/10 flex items-center space-x-1"
                      >
                        <Printer size={12} />
                        <span>Imprimir A4</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-neutral-900/40 p-2.5 rounded-lg border border-white/5">
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wide block mb-1">
                      Débitos Extintos nesta DCOMP:
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {d.debitosCompensados.map((deb, idx) => (
                        <div key={idx} className="flex justify-between p-1.5 bg-neutral-950/60 rounded border border-white/5 font-mono">
                          <span className="text-neutral-300">{deb.tributo} ({deb.codigoReceitaDarf})</span>
                          <span className="font-bold text-emerald-400">R$ {deb.valorCompensado.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-neutral-500 font-mono pt-1">
                    <span>Saldo Remanescente do Crédito: R$ {d.saldoRemanescenteCredito.toFixed(2)}</span>
                    <span>Status: Homologação Tácita em Curso (5 anos)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal Registrar Novo Crédito */}
      {modalNovoCredito && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#181818] border border-white/10 rounded-xl shadow-2xl max-w-md w-full p-5 text-neutral-100 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-neutral-100 mb-3 flex items-center space-x-2">
              <Plus size={18} className="text-blue-400" />
              <span>Registrar Crédito Tributário Reconhecido</span>
            </h3>
            <form onSubmit={handleSalvarNovoCredito} className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">Tipo de Crédito:</label>
                <select
                  value={novoTipoCredito}
                  onChange={e => setNovoTipoCredito(e.target.value as any)}
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200"
                >
                  <option value="SALDO_NEGATIVO_IRPJ">Saldo Negativo de IRPJ (Lucro Real)</option>
                  <option value="SALDO_NEGATIVO_CSLL">Saldo Negativo de CSLL</option>
                  <option value="PIS_NAO_CUMULATIVO">Crédito Acumulado de PIS Não-Cumulativo</option>
                  <option value="COFINS_NAO_CUMULATIVO">Crédito Acumulado de COFINS Não-Cumulativo</option>
                  <option value="RETENCAO_LEI_9711_INSS">Retenção de INSS 11% (Cessão Mão de Obra)</option>
                  <option value="PAGAMENTO_INDEVIDO_A_MAIOR">Pagamento Indevido ou a Maior em DARF</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-400 block mb-1">Período de Apuração:</label>
                  <input
                    type="text"
                    value={novoPeriodo}
                    onChange={e => setNovoPeriodo(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200 font-mono"
                    placeholder="Ex: 2026-1T ou 2026-08"
                    required
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Data Pagamento/Origem:</label>
                  <input
                    type="date"
                    value={novoDtPgto}
                    onChange={e => setNovoDtPgto(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-400 block mb-1">Valor Original (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={novoValorOrig}
                    onChange={e => setNovoValorOrig(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Taxa SELIC Acumulada (%):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={novaSelic}
                    onChange={e => setNovaSelic(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-neutral-900 rounded-lg border border-white/5 text-[11px] space-y-1">
                <div className="flex justify-between text-neutral-400">
                  <span>Juros SELIC Calculados:</span>
                  <span className="font-mono text-emerald-400">
                    R$ {(novoValorOrig * (novaSelic / 100)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-neutral-200 border-t border-white/10 pt-1">
                  <span>Total Atualizado para Compensação:</span>
                  <span className="font-mono text-blue-400">
                    R$ {(novoValorOrig + (novoValorOrig * (novaSelic / 100))).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalNovoCredito(false)}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold shadow"
                >
                  Gravar Crédito
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
