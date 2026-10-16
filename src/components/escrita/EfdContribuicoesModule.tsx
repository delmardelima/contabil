import React, { useState, useEffect } from 'react';
import {
  FileCode,
  Calculator,
  Layers,
  Receipt,
  Download,
  Copy,
  Check,
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
  Building2,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Printer,
  ShieldCheck,
  Info
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  DeclaracaoEfdContribuicoes,
  RegistroF100OperacaoCredito,
  RegistroF600RetencaoFonte,
  Empresa
} from '../../types/contabil';

interface EfdContribuicoesModuleProps {
  empresaAtiva: Empresa;
  onOpenReportPreview?: (title: string, subtitle: string, content: React.ReactNode, orientation?: 'portrait' | 'landscape') => void;
}

export const EfdContribuicoesModule: React.FC<EfdContribuicoesModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [competencia, setCompetencia] = useState<string>('2026-08');
  const [activeTab, setActiveTab] = useState<'apuracao' | 'f100' | 'f600' | 'arquivo'>('apuracao');
  const [declaracao, setDeclaracao] = useState<DeclaracaoEfdContribuicoes | null>(null);
  const [copiedTxt, setCopiedTxt] = useState(false);
  const [mensagemStatus, setMensagemStatus] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  // Modais
  const [modalF100Aberto, setModalF100Aberto] = useState(false);
  const [editF100, setEditF100] = useState<RegistroF100OperacaoCredito | null>(null);
  const [formF100, setFormF100] = useState<Omit<RegistroF100OperacaoCredito, 'id' | 'empresaId'>>({
    competencia: '2026-08',
    indicadorOperacao: 'CREDITO',
    naturezaBaseCalculo: '02',
    cstPis: '50',
    cstCofins: '50',
    dataOperacao: '2026-08-10',
    valorOperacao: 5000,
    valorBaseCalculoPis: 5000,
    aliquotaPis: 1.65,
    valorPis: 82.5,
    valorBaseCalculoCofins: 5000,
    aliquotaCofins: 7.60,
    valorCofins: 380,
    participanteNome: '',
    participanteCnpjCpf: '',
    descricao: ''
  });

  const [modalF600Aberto, setModalF600Aberto] = useState(false);
  const [editF600, setEditF600] = useState<RegistroF600RetencaoFonte | null>(null);
  const [formF600, setFormF600] = useState<Omit<RegistroF600RetencaoFonte, 'id' | 'empresaId'>>({
    competencia: '2026-08',
    tipoRetencao: 'PRIVADO_CSRF',
    fontePagadoraCnpj: '',
    fontePagadoraRazaoSocial: '',
    dataRetencao: '2026-08-20',
    valorRendimentoBruto: 10000,
    valorRetidoPis: 65,
    valorRetidoCofins: 300,
    naturezaRetencao: 'Retenção na Fonte de PIS e COFINS'
  });

  const carregarDados = () => {
    const dec = dbService.getDeclaracaoEfdContribuicoes(empresaAtiva.id, competencia);
    dec.arquivoTxtEfd = dbService.gerarArquivoEfdContribuicoesTxt(empresaAtiva.id, competencia);
    setDeclaracao(dec);
  };

  useEffect(() => {
    carregarDados();
  }, [empresaAtiva.id, competencia]);

  const handleCopiarTxt = () => {
    if (!declaracao?.arquivoTxtEfd) return;
    navigator.clipboard.writeText(declaracao.arquivoTxtEfd);
    setCopiedTxt(true);
    setTimeout(() => setCopiedTxt(false), 2500);
  };

  const handleDownloadTxt = () => {
    if (!declaracao?.arquivoTxtEfd) return;
    const blob = new Blob([declaracao.arquivoTxtEfd], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EFD_CONTRIBUICOES_${empresaAtiva.cnpj.replace(/\D/g, '')}_${competencia.replace('-', '')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSalvarF100 = (e: React.FormEvent) => {
    e.preventDefault();
    const novoItem: RegistroF100OperacaoCredito = {
      id: editF100 ? editF100.id : `f100-${Date.now()}`,
      empresaId: empresaAtiva.id,
      ...formF100
    };
    dbService.salvarOperacaoF100(novoItem);
    setModalF100Aberto(false);
    setEditF100(null);
    carregarDados();
    setMensagemStatus({ tipo: 'sucesso', texto: 'Operação F100 gravada com sucesso!' });
    setTimeout(() => setMensagemStatus(null), 3000);
  };

  const handleExcluirF100 = (id: string) => {
    if (confirm('Deseja realmente remover esta operação de crédito F100?')) {
      dbService.excluirOperacaoF100(id);
      carregarDados();
      setMensagemStatus({ tipo: 'sucesso', texto: 'Operação F100 removida com sucesso!' });
      setTimeout(() => setMensagemStatus(null), 3000);
    }
  };

  const handleSalvarF600 = (e: React.FormEvent) => {
    e.preventDefault();
    const novoItem: RegistroF600RetencaoFonte = {
      id: editF600 ? editF600.id : `f600-${Date.now()}`,
      empresaId: empresaAtiva.id,
      ...formF600
    };
    dbService.salvarRetencaoF600(novoItem);
    setModalF600Aberto(false);
    setEditF600(null);
    carregarDados();
    setMensagemStatus({ tipo: 'sucesso', texto: 'Retenção na fonte F600 gravada com sucesso!' });
    setTimeout(() => setMensagemStatus(null), 3000);
  };

  const handleExcluirF600 = (id: string) => {
    if (confirm('Deseja realmente remover esta retenção F600?')) {
      dbService.excluirRetencaoF600(id);
      carregarDados();
      setMensagemStatus({ tipo: 'sucesso', texto: 'Retenção F600 removida com sucesso!' });
      setTimeout(() => setMensagemStatus(null), 3000);
    }
  };

  const handleIntegrarContabil = () => {
    const res = dbService.integrarEfdContribuicoesContabil(empresaAtiva.id, competencia);
    if (res.sucesso) {
      setMensagemStatus({ tipo: 'sucesso', texto: res.mensagem });
    } else {
      setMensagemStatus({ tipo: 'erro', texto: res.mensagem });
    }
    setTimeout(() => setMensagemStatus(null), 4000);
  };

  const handleImprimirRelatorio = () => {
    if (!declaracao || !onOpenReportPreview) return;
    const content = (
      <div className="text-neutral-900 text-xs p-4 space-y-4 font-sans">
        <div className="border-b-2 border-neutral-900 pb-2 flex justify-between items-start">
          <div>
            <h1 className="text-base font-bold uppercase tracking-wider">Demonstrativo de Apuração - EFD Contribuições</h1>
            <p className="text-neutral-600">Contribuição para o PIS/PASEP e COFINS (Leis nº 10.637/02 e 10.833/03)</p>
          </div>
          <div className="text-right">
            <span className="font-mono font-bold bg-neutral-100 px-2 py-1 border border-neutral-300">Competência: {competencia}</span>
            <p className="text-[10px] text-neutral-500 mt-1">Regime: {declaracao.regimeTributario}</p>
          </div>
        </div>

        {/* Quadro 1: Apuração PIS/PASEP */}
        <div className="border border-neutral-300 rounded p-3 bg-neutral-50/50">
          <h2 className="font-bold text-sm text-neutral-800 border-b border-neutral-200 pb-1 mb-2 flex items-center justify-between">
            <span>1. Demonstração do PIS/PASEP (Bloco M - Registros M200 / M210)</span>
            <span className="font-mono text-emerald-700">Saldo a Recolher: R$ {declaracao.saldoPisRecolher.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </h2>
          <div className="grid grid-cols-4 gap-2 text-center text-[11px] mb-3">
            <div className="bg-white p-2 border border-neutral-200 rounded">
              <span className="text-neutral-500 block">Total Débito Apurado</span>
              <span className="font-bold font-mono">R$ {declaracao.totalPisDebito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="bg-white p-2 border border-neutral-200 rounded">
              <span className="text-neutral-500 block">(-) Créditos Operações (F100)</span>
              <span className="font-bold font-mono text-blue-700">R$ {declaracao.totalPisCredito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="bg-white p-2 border border-neutral-200 rounded">
              <span className="text-neutral-500 block">(-) Retenções na Fonte (F600)</span>
              <span className="font-bold font-mono text-amber-700">R$ {declaracao.totalPisRetido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="bg-emerald-50 p-2 border border-emerald-200 rounded">
              <span className="text-emerald-800 font-bold block">PIS Líquido Devido</span>
              <span className="font-bold font-mono text-emerald-700">R$ {declaracao.saldoPisRecolher.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Quadro 2: Apuração COFINS */}
        <div className="border border-neutral-300 rounded p-3 bg-neutral-50/50">
          <h2 className="font-bold text-sm text-neutral-800 border-b border-neutral-200 pb-1 mb-2 flex items-center justify-between">
            <span>2. Demonstração da COFINS (Bloco M - Registros M600 / M610)</span>
            <span className="font-mono text-emerald-700">Saldo a Recolher: R$ {declaracao.saldoCofinsRecolher.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </h2>
          <div className="grid grid-cols-4 gap-2 text-center text-[11px] mb-3">
            <div className="bg-white p-2 border border-neutral-200 rounded">
              <span className="text-neutral-500 block">Total Débito Apurado</span>
              <span className="font-bold font-mono">R$ {declaracao.totalCofinsDebito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="bg-white p-2 border border-neutral-200 rounded">
              <span className="text-neutral-500 block">(-) Créditos Operações (F100)</span>
              <span className="font-bold font-mono text-blue-700">R$ {declaracao.totalCofinsCredito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="bg-white p-2 border border-neutral-200 rounded">
              <span className="text-neutral-500 block">(-) Retenções na Fonte (F600)</span>
              <span className="font-bold font-mono text-amber-700">R$ {declaracao.totalCofinsRetido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="bg-emerald-50 p-2 border border-emerald-200 rounded">
              <span className="text-emerald-800 font-bold block">COFINS Líquida Devida</span>
              <span className="font-bold font-mono text-emerald-700">R$ {declaracao.saldoCofinsRecolher.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Quadro 3: Detalhamento F100 e F600 */}
        <div className="border border-neutral-300 rounded p-3">
          <h3 className="font-bold text-xs uppercase mb-2">3. Memória de Créditos das Operações (Registro F100)</h3>
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="bg-neutral-100 border-b border-neutral-300">
                <th className="py-1 px-2 text-left">Data</th>
                <th className="py-1 px-2 text-left">Base / Natureza</th>
                <th className="py-1 px-2 text-left">Fornecedor / Participante</th>
                <th className="py-1 px-2 text-right">Valor Base (R$)</th>
                <th className="py-1 px-2 text-right">Créd. PIS</th>
                <th className="py-1 px-2 text-right">Créd. COFINS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {declaracao.operacoesF100.map(op => (
                <tr key={op.id}>
                  <td className="py-1 px-2 font-mono">{op.dataOperacao}</td>
                  <td className="py-1 px-2">{op.descricao}</td>
                  <td className="py-1 px-2">{op.participanteNome || '-'}</td>
                  <td className="py-1 px-2 font-mono text-right">R$ {op.valorOperacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="py-1 px-2 font-mono text-right text-blue-700">R$ {op.valorPis.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="py-1 px-2 font-mono text-right text-blue-700">R$ {op.valorCofins.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quadro de Assinaturas */}
        <div className="pt-10 grid grid-cols-2 gap-8 text-center text-xs">
          <div className="border-t border-neutral-800 pt-2">
            <p className="font-bold uppercase">{empresaAtiva.razaoSocial}</p>
            <p className="text-neutral-500">Representante Legal / Administrador</p>
          </div>
          <div className="border-t border-neutral-800 pt-2">
            <p className="font-bold uppercase">Dr. Roberto Silveira Barbosa</p>
            <p className="text-neutral-500">Contador Responsável - CRC-SP 1SP298451/O-4</p>
          </div>
        </div>
      </div>
    );

    onOpenReportPreview('Demonstrativo de Apuração - EFD Contribuições', `Competência ${competencia}`, content, 'portrait');
  };

  return (
    <div className="h-full flex flex-col bg-[#141414] text-neutral-200 select-none overflow-hidden">
      {/* 1. Header do Módulo */}
      <div className="p-4 bg-[#1a1a1a] border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <FileCode size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-wide">EFD-Contribuições (PIS/PASEP & COFINS)</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                IN RFB nº 1.252/2012
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Escrituração Fiscal Digital das Contribuições em Regime Cumulativo e Não-Cumulativo (Leis 10.637/02 e 10.833/03)
            </p>
          </div>
        </div>

        {/* Controles de Topo */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#222] border border-white/10 rounded-lg px-2.5 py-1.5">
            <span className="text-xs text-neutral-400 font-medium">Competência:</span>
            <input
              type="month"
              value={competencia}
              onChange={e => setCompetencia(e.target.value)}
              className="bg-transparent text-xs text-white font-mono outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={handleIntegrarContabil}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-medium transition-colors"
            title="Lançar automaticamente a provisão de PIS e COFINS no Diário Geral"
          >
            <Calculator size={14} />
            <span>Integrar Contábil</span>
          </button>

          <button
            onClick={handleImprimirRelatorio}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-white/10 rounded-lg text-xs font-medium transition-colors"
          >
            <Printer size={14} />
            <span>Imprimir A4</span>
          </button>
        </div>
      </div>

      {/* Banner de Status */}
      {mensagemStatus && (
        <div className={`px-4 py-2 text-xs font-medium flex items-center gap-2 border-b animate-fadeIn ${
          mensagemStatus.tipo === 'sucesso' 
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
            : 'bg-red-950/40 border-red-500/30 text-red-300'
        }`}>
          <AlertCircle size={14} />
          <span>{mensagemStatus.texto}</span>
        </div>
      )}

      {/* 2. Cards de Resumo da Apuração */}
      {declaracao && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3 bg-[#181818] border-b border-white/5">
          <div className="bg-[#202020] border border-white/10 rounded-xl p-3">
            <span className="text-[11px] text-neutral-400 block mb-1">Regime de Tributação</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white uppercase">{declaracao.regimeTributario}</span>
              <span className="text-[10px] text-neutral-400 font-mono">({declaracao.regimeTributario === 'NAO_CUMULATIVO' ? '1,65% / 7,60%' : '0,65% / 3,00%'})</span>
            </div>
            <span className="text-[10px] text-neutral-500 block mt-1">Apropriação: {declaracao.metodoApropriacao}</span>
          </div>

          <div className="bg-[#202020] border border-white/10 rounded-xl p-3">
            <span className="text-[11px] text-neutral-400 block mb-1">Créditos de Operações (F100)</span>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-neutral-400">PIS:</span>
                <span className="text-xs font-bold font-mono text-blue-400 ml-1">R$ {declaracao.totalPisCredito.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400">COFINS:</span>
                <span className="text-xs font-bold font-mono text-blue-400 ml-1">R$ {declaracao.totalCofinsCredito.toFixed(2)}</span>
              </div>
            </div>
            <span className="text-[10px] text-neutral-500 block mt-1">{declaracao.operacoesF100.length} operações registradas</span>
          </div>

          <div className="bg-[#202020] border border-white/10 rounded-xl p-3">
            <span className="text-[11px] text-neutral-400 block mb-1">Retenções Sofridas (F600)</span>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-neutral-400">PIS:</span>
                <span className="text-xs font-bold font-mono text-amber-400 ml-1">R$ {declaracao.totalPisRetido.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400">COFINS:</span>
                <span className="text-xs font-bold font-mono text-amber-400 ml-1">R$ {declaracao.totalCofinsRetido.toFixed(2)}</span>
              </div>
            </div>
            <span className="text-[10px] text-neutral-500 block mt-1">{declaracao.retencoesF600.length} fontes informadas</span>
          </div>

          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3">
            <span className="text-[11px] text-emerald-400 font-medium block mb-1">Total a Recolher (Guias DARF)</span>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-neutral-400">PIS (8109):</span>
                <span className="text-xs font-bold font-mono text-emerald-300 ml-1">R$ {declaracao.saldoPisRecolher.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400">COFINS (2172):</span>
                <span className="text-xs font-bold font-mono text-emerald-300 ml-1">R$ {declaracao.saldoCofinsRecolher.toFixed(2)}</span>
              </div>
            </div>
            <span className="text-[10px] text-neutral-400 block mt-1">Total Geral: R$ {(declaracao.saldoPisRecolher + declaracao.saldoCofinsRecolher).toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* 3. Seletor de Abas */}
      <div className="flex items-center gap-1 px-4 pt-2 bg-[#1a1a1a] border-b border-white/10 text-xs">
        <button
          onClick={() => setActiveTab('apuracao')}
          className={`flex items-center gap-2 px-3.5 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'apuracao'
              ? 'border-emerald-500 text-white bg-white/5'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Calculator size={14} />
          <span>Apuração dos Blocos M200 / M600</span>
        </button>

        <button
          onClick={() => setActiveTab('f100')}
          className={`flex items-center gap-2 px-3.5 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'f100'
              ? 'border-emerald-500 text-white bg-white/5'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Layers size={14} />
          <span>Créditos das Operações (F100)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-800 text-neutral-400">
            {declaracao?.operacoesF100.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('f600')}
          className={`flex items-center gap-2 px-3.5 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'f600'
              ? 'border-emerald-500 text-white bg-white/5'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Receipt size={14} />
          <span>Retenções na Fonte (F600)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-800 text-neutral-400">
            {declaracao?.retencoesF600.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('arquivo')}
          className={`flex items-center gap-2 px-3.5 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'arquivo'
              ? 'border-emerald-500 text-white bg-white/5'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <FileCode size={14} />
          <span>Visualizador SPED (.txt)</span>
        </button>
      </div>

      {/* 4. Conteúdo das Abas */}
      <div className="flex-1 overflow-auto p-4">
        {/* ABA 1: APURAÇÃO BLOCOS M */}
        {activeTab === 'apuracao' && declaracao && (
          <div className="space-y-6 max-w-5xl">
            {/* Bloco M200 - PIS */}
            <div className="bg-[#1c1c1c] border border-white/10 rounded-xl overflow-hidden">
              <div className="p-3.5 bg-neutral-800/50 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">M200 / M210</span>
                  <h2 className="text-sm font-semibold text-white">Consolidação da Contribuição para o PIS/PASEP</h2>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400">A Recolher: R$ {declaracao.saldoPisRecolher.toFixed(2)}</span>
              </div>
              <div className="p-4">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-neutral-400 font-semibold">
                      <th className="py-2 px-2">Cód. Contribuição</th>
                      <th className="py-2 px-2">CST PIS</th>
                      <th className="py-2 px-2">Descrição da Operação</th>
                      <th className="py-2 px-2 text-right">Base de Cálculo (R$)</th>
                      <th className="py-2 px-2 text-right">Alíquota (%)</th>
                      <th className="py-2 px-2 text-right">Débito Apurado</th>
                      <th className="py-2 px-2 text-right">Crédito/Retenção</th>
                      <th className="py-2 px-2 text-right">Valor Devido</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {declaracao.apuracaoPis.map(p => (
                      <tr key={p.id} className="hover:bg-white/[0.02]">
                        <td className="py-2.5 px-2 font-mono font-bold text-neutral-300">{p.codigoContribuicao}</td>
                        <td className="py-2.5 px-2 font-mono">{p.cstPis}</td>
                        <td className="py-2.5 px-2 text-neutral-300">{p.descricao}</td>
                        <td className="py-2.5 px-2 font-mono text-right text-white">R$ {p.valorBaseCalculo.toFixed(2)}</td>
                        <td className="py-2.5 px-2 font-mono text-right text-neutral-400">{p.aliquotaPercentual.toFixed(2)}%</td>
                        <td className="py-2.5 px-2 font-mono text-right text-neutral-300">R$ {p.valorContribuicaoApurada.toFixed(2)}</td>
                        <td className="py-2.5 px-2 font-mono text-right text-blue-400">R$ {p.valorCreditoDescontado.toFixed(2)}</td>
                        <td className="py-2.5 px-2 font-mono text-right font-bold text-emerald-400">R$ {p.valorContribuicaoDevida.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bloco M600 - COFINS */}
            <div className="bg-[#1c1c1c] border border-white/10 rounded-xl overflow-hidden">
              <div className="p-3.5 bg-neutral-800/50 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">M600 / M610</span>
                  <h2 className="text-sm font-semibold text-white">Consolidação da Contribuição para a COFINS</h2>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400">A Recolher: R$ {declaracao.saldoCofinsRecolher.toFixed(2)}</span>
              </div>
              <div className="p-4">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-neutral-400 font-semibold">
                      <th className="py-2 px-2">Cód. Contribuição</th>
                      <th className="py-2 px-2">CST COFINS</th>
                      <th className="py-2 px-2">Descrição da Operação</th>
                      <th className="py-2 px-2 text-right">Base de Cálculo (R$)</th>
                      <th className="py-2 px-2 text-right">Alíquota (%)</th>
                      <th className="py-2 px-2 text-right">Débito Apurado</th>
                      <th className="py-2 px-2 text-right">Crédito/Retenção</th>
                      <th className="py-2 px-2 text-right">Valor Devido</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {declaracao.apuracaoCofins.map(c => (
                      <tr key={c.id} className="hover:bg-white/[0.02]">
                        <td className="py-2.5 px-2 font-mono font-bold text-neutral-300">{c.codigoContribuicao}</td>
                        <td className="py-2.5 px-2 font-mono">{c.cstCofins}</td>
                        <td className="py-2.5 px-2 text-neutral-300">{c.descricao}</td>
                        <td className="py-2.5 px-2 font-mono text-right text-white">R$ {c.valorBaseCalculo.toFixed(2)}</td>
                        <td className="py-2.5 px-2 font-mono text-right text-neutral-400">{c.aliquotaPercentual.toFixed(2)}%</td>
                        <td className="py-2.5 px-2 font-mono text-right text-neutral-300">R$ {c.valorContribuicaoApurada.toFixed(2)}</td>
                        <td className="py-2.5 px-2 font-mono text-right text-blue-400">R$ {c.valorCreditoDescontado.toFixed(2)}</td>
                        <td className="py-2.5 px-2 font-mono text-right font-bold text-emerald-400">R$ {c.valorContribuicaoDevida.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: REGISTRO F100 */}
        {activeTab === 'f100' && declaracao && (
          <div className="space-y-4 max-w-5xl">
            <div className="flex items-center justify-between">
              <p className="text-xs text-neutral-400">
                Operações de créditos permitidas pela não cumulatividade: Energia Elétrica, Aluguéis operacionais, TI e Fretes (Art. 3º das Leis 10.637 e 10.833)
              </p>
              <button
                onClick={() => {
                  setEditF100(null);
                  setFormF100({
                    competencia,
                    indicadorOperacao: 'CREDITO',
                    naturezaBaseCalculo: '02',
                    cstPis: '50',
                    cstCofins: '50',
                    dataOperacao: `${competencia}-10`,
                    valorOperacao: 1000,
                    valorBaseCalculoPis: 1000,
                    aliquotaPis: 1.65,
                    valorPis: 16.5,
                    valorBaseCalculoCofins: 1000,
                    aliquotaCofins: 7.60,
                    valorCofins: 76.0,
                    participanteNome: '',
                    participanteCnpjCpf: '',
                    descricao: ''
                  });
                  setModalF100Aberto(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-colors"
              >
                <Plus size={14} />
                <span>Nova Operação F100</span>
              </button>
            </div>

            <div className="bg-[#1c1c1c] border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-neutral-800/40 border-b border-white/10 text-neutral-400 font-semibold">
                    <th className="py-2 px-3">Data</th>
                    <th className="py-2 px-2">Nat. Base</th>
                    <th className="py-2 px-3">Participante / Fornecedor</th>
                    <th className="py-2 px-3">Descrição da Despesa</th>
                    <th className="py-2 px-2 text-right">Valor Base (R$)</th>
                    <th className="py-2 px-2 text-right">Créd. PIS (1,65%)</th>
                    <th className="py-2 px-2 text-right">Créd. COFINS (7,6%)</th>
                    <th className="py-2 px-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {declaracao.operacoesF100.map(op => (
                    <tr key={op.id} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 px-3 font-mono text-neutral-300">{op.dataOperacao}</td>
                      <td className="py-2.5 px-2 font-mono">
                        <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-white/5">
                          {op.naturezaBaseCalculo}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-white">{op.participanteNome || 'NÃO IDENTIFICADO'}</div>
                        <div className="text-[10px] text-neutral-500 font-mono">{op.participanteCnpjCpf || '-'}</div>
                      </td>
                      <td className="py-2.5 px-3 text-neutral-300 max-w-xs truncate">{op.descricao}</td>
                      <td className="py-2.5 px-2 font-mono text-right text-white">R$ {op.valorOperacao.toFixed(2)}</td>
                      <td className="py-2.5 px-2 font-mono text-right text-blue-400">R$ {op.valorPis.toFixed(2)}</td>
                      <td className="py-2.5 px-2 font-mono text-right text-blue-400">R$ {op.valorCofins.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditF100(op);
                              setFormF100({ ...op });
                              setModalF100Aberto(true);
                            }}
                            className="p-1 hover:bg-white/10 text-neutral-400 hover:text-white rounded"
                            title="Editar"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleExcluirF100(op.id)}
                            className="p-1 hover:bg-red-500/10 text-neutral-400 hover:text-red-400 rounded"
                            title="Excluir"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 3: REGISTRO F600 */}
        {activeTab === 'f600' && declaracao && (
          <div className="space-y-4 max-w-5xl">
            <div className="flex items-center justify-between">
              <p className="text-xs text-neutral-400">
                Retenções na Fonte sofridas em NFS-e de Serviços Prestados a pessoas jurídicas (CSRF 4,65%) e Órgãos Públicos
              </p>
              <button
                onClick={() => {
                  setEditF600(null);
                  setFormF600({
                    competencia,
                    tipoRetencao: 'PRIVADO_CSRF',
                    fontePagadoraCnpj: '',
                    fontePagadoraRazaoSocial: '',
                    dataRetencao: `${competencia}-20`,
                    valorRendimentoBruto: 10000,
                    valorRetidoPis: 65,
                    valorRetidoCofins: 300,
                    naturezaRetencao: 'Retenção na Fonte de PIS e COFINS'
                  });
                  setModalF600Aberto(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-colors"
              >
                <Plus size={14} />
                <span>Nova Retenção F600</span>
              </button>
            </div>

            <div className="bg-[#1c1c1c] border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-neutral-800/40 border-b border-white/10 text-neutral-400 font-semibold">
                    <th className="py-2 px-3">Data</th>
                    <th className="py-2 px-2">Tipo</th>
                    <th className="py-2 px-3">Fonte Pagadora</th>
                    <th className="py-2 px-3 text-right">Rendimento Bruto (R$)</th>
                    <th className="py-2 px-2 text-right">PIS Retido (0,65%)</th>
                    <th className="py-2 px-2 text-right">COFINS Retida (3,0%)</th>
                    <th className="py-2 px-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {declaracao.retencoesF600.map(ret => (
                    <tr key={ret.id} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 px-3 font-mono text-neutral-300">{ret.dataRetencao}</td>
                      <td className="py-2.5 px-2 font-mono">
                        <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-white/5">
                          {ret.tipoRetencao === 'PRIVADO_CSRF' ? 'CSRF 4,65%' : 'Órgão Federal'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-white">{ret.fontePagadoraRazaoSocial}</div>
                        <div className="text-[10px] text-neutral-500 font-mono">{ret.fontePagadoraCnpj}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-right text-white">R$ {ret.valorRendimentoBruto.toFixed(2)}</td>
                      <td className="py-2.5 px-2 font-mono text-right text-amber-400">R$ {ret.valorRetidoPis.toFixed(2)}</td>
                      <td className="py-2.5 px-2 font-mono text-right text-amber-400">R$ {ret.valorRetidoCofins.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditF600(ret);
                              setFormF600({ ...ret });
                              setModalF600Aberto(true);
                            }}
                            className="p-1 hover:bg-white/10 text-neutral-400 hover:text-white rounded"
                            title="Editar"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleExcluirF600(ret.id)}
                            className="p-1 hover:bg-red-500/10 text-neutral-400 hover:text-red-400 rounded"
                            title="Excluir"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 4: ARQUIVO SPED (.TXT) */}
        {activeTab === 'arquivo' && declaracao && (
          <div className="space-y-4 max-w-5xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">Layout Oficial do Programa Validador e Assinador (PVA EFD-Contribuições):</span>
                <span className="text-xs font-mono text-emerald-400 font-semibold">{declaracao.arquivoTxtEfd?.split('\n').length} linhas</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopiarTxt}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-white/10 rounded-lg text-xs font-medium transition-colors"
                >
                  {copiedTxt ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedTxt ? 'Copiado!' : 'Copiar Texto'}</span>
                </button>
                <button
                  onClick={handleDownloadTxt}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  <Download size={14} />
                  <span>Baixar Arquivo .txt</span>
                </button>
              </div>
            </div>

            <div className="bg-[#111] border border-white/10 rounded-xl p-4 font-mono text-[11px] leading-relaxed text-neutral-300 overflow-x-auto max-h-[550px]">
              <pre className="whitespace-pre">{declaracao.arquivoTxtEfd}</pre>
            </div>
          </div>
        )}
      </div>

      {/* MODAL F100 */}
      {modalF100Aberto && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1c] border border-white/10 rounded-xl max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-sm text-white">
                {editF100 ? 'Editar Operação F100' : 'Nova Operação Geradora de Crédito (F100)'}
              </h3>
              <button onClick={() => setModalF100Aberto(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSalvarF100} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Data da Operação</label>
                  <input
                    type="date"
                    required
                    value={formF100.dataOperacao}
                    onChange={e => setFormF100({ ...formF100, dataOperacao: e.target.value })}
                    className="w-full bg-[#242424] border border-white/10 rounded px-2.5 py-1.5 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Natureza da Base de Cálculo</label>
                  <select
                    value={formF100.naturezaBaseCalculo}
                    onChange={e => setFormF100({ ...formF100, naturezaBaseCalculo: e.target.value })}
                    className="w-full bg-[#242424] border border-white/10 rounded px-2.5 py-1.5 text-white outline-none"
                  >
                    <option value="01">01 - Bens para Revenda</option>
                    <option value="02">02 - Energia Elétrica e Térmica</option>
                    <option value="03">03 - Aluguéis de Prédios Operacionais</option>
                    <option value="04">04 - Aluguéis de Máquinas/Equipamentos</option>
                    <option value="05">05 - Arrendamento Mercantil</option>
                    <option value="06">06 - Armazenagem e Frete</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Fornecedor / Participante</label>
                <input
                  type="text"
                  required
                  placeholder="Razão Social do Fornecedor"
                  value={formF100.participanteNome}
                  onChange={e => setFormF100({ ...formF100, participanteNome: e.target.value })}
                  className="w-full bg-[#242424] border border-white/10 rounded px-2.5 py-1.5 text-white outline-none mb-2"
                />
                <input
                  type="text"
                  placeholder="CNPJ do Fornecedor"
                  value={formF100.participanteCnpjCpf}
                  onChange={e => setFormF100({ ...formF100, participanteCnpjCpf: e.target.value })}
                  className="w-full bg-[#242424] border border-white/10 rounded px-2.5 py-1.5 text-white outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Descrição / Histórico</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Fatura mensal de energia elétrica do galpão industrial"
                  value={formF100.descricao}
                  onChange={e => setFormF100({ ...formF100, descricao: e.target.value })}
                  className="w-full bg-[#242424] border border-white/10 rounded px-2.5 py-1.5 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Valor da Operação</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formF100.valorOperacao}
                    onChange={e => {
                      const v = parseFloat(e.target.value) || 0;
                      setFormF100({
                        ...formF100,
                        valorOperacao: v,
                        valorBaseCalculoPis: v,
                        valorPis: Number((v * (formF100.aliquotaPis / 100)).toFixed(2)),
                        valorBaseCalculoCofins: v,
                        valorCofins: Number((v * (formF100.aliquotaCofins / 100)).toFixed(2))
                      });
                    }}
                    className="w-full bg-[#242424] border border-white/10 rounded px-2.5 py-1.5 text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Crédito PIS (1,65%)</label>
                  <input
                    type="number"
                    step="0.01"
                    readOnly
                    value={formF100.valorPis}
                    className="w-full bg-[#181818] border border-white/10 rounded px-2.5 py-1.5 text-blue-400 font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Crédito COFINS (7,6%)</label>
                  <input
                    type="number"
                    step="0.01"
                    readOnly
                    value={formF100.valorCofins}
                    className="w-full bg-[#181818] border border-white/10 rounded px-2.5 py-1.5 text-blue-400 font-mono outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalF100Aberto(false)}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded text-xs"
                >
                  Salvar Operação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL F600 */}
      {modalF600Aberto && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1c] border border-white/10 rounded-xl max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-sm text-white">
                {editF600 ? 'Editar Retenção F600' : 'Nova Retenção na Fonte de PIS/COFINS (F600)'}
              </h3>
              <button onClick={() => setModalF600Aberto(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSalvarF600} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Data da Retenção</label>
                  <input
                    type="date"
                    required
                    value={formF600.dataRetencao}
                    onChange={e => setFormF600({ ...formF600, dataRetencao: e.target.value })}
                    className="w-full bg-[#242424] border border-white/10 rounded px-2.5 py-1.5 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Tipo de Retenção</label>
                  <select
                    value={formF600.tipoRetencao}
                    onChange={e => setFormF600({ ...formF600, tipoRetencao: e.target.value as any })}
                    className="w-full bg-[#242424] border border-white/10 rounded px-2.5 py-1.5 text-white outline-none"
                  >
                    <option value="PRIVADO_CSRF">01 - PJ Privada (CSRF 4,65%)</option>
                    <option value="ORGAO_PUBLICO_FEDERAL">02 - Órgão Público Federal (Lei 9.430)</option>
                    <option value="ORGAO_ESTADUAL_MUNICIPAL">03 - Órgão Estadual / Municipal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Fonte Pagadora (Cliente)</label>
                <input
                  type="text"
                  required
                  placeholder="Razão Social da Fonte Pagadora"
                  value={formF600.fontePagadoraRazaoSocial}
                  onChange={e => setFormF600({ ...formF600, fontePagadoraRazaoSocial: e.target.value })}
                  className="w-full bg-[#242424] border border-white/10 rounded px-2.5 py-1.5 text-white outline-none mb-2"
                />
                <input
                  type="text"
                  required
                  placeholder="CNPJ da Fonte Pagadora"
                  value={formF600.fontePagadoraCnpj}
                  onChange={e => setFormF600({ ...formF600, fontePagadoraCnpj: e.target.value })}
                  className="w-full bg-[#242424] border border-white/10 rounded px-2.5 py-1.5 text-white outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Rendimento Bruto</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formF600.valorRendimentoBruto}
                    onChange={e => {
                      const v = parseFloat(e.target.value) || 0;
                      setFormF600({
                        ...formF600,
                        valorRendimentoBruto: v,
                        valorRetidoPis: Number((v * 0.0065).toFixed(2)),
                        valorRetidoCofins: Number((v * 0.03).toFixed(2))
                      });
                    }}
                    className="w-full bg-[#242424] border border-white/10 rounded px-2.5 py-1.5 text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">PIS Retido (0,65%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formF600.valorRetidoPis}
                    onChange={e => setFormF600({ ...formF600, valorRetidoPis: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#242424] border border-white/10 rounded px-2.5 py-1.5 text-amber-400 font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">COFINS Retida (3%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formF600.valorRetidoCofins}
                    onChange={e => setFormF600({ ...formF600, valorRetidoCofins: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#242424] border border-white/10 rounded px-2.5 py-1.5 text-amber-400 font-mono outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalF600Aberto(false)}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded text-xs"
                >
                  Salvar Retenção
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
