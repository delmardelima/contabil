import React, { useState, useEffect } from 'react';
import {
  Scale,
  Calculator,
  Layers,
  FileCode,
  Download,
  Copy,
  Check,
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
  Building2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Printer,
  ShieldCheck,
  Info
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  DeclaracaoGiaEletronica,
  ResumoCfopGia,
  OcorrenciaAjusteGia,
  Empresa
} from '../../types/contabil';

interface GiaSintegraModuleProps {
  empresaAtiva: Empresa;
  onOpenReportPreview?: (title: string, subtitle: string, content: React.ReactNode, orientation?: 'portrait' | 'landscape') => void;
}

export const GiaSintegraModule: React.FC<GiaSintegraModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [competencia, setCompetencia] = useState<string>('2026-08');
  const [activeTab, setActiveTab] = useState<'apuracao' | 'cfops' | 'sintegra' | 'giaTxt'>('apuracao');
  const [declaracao, setDeclaracao] = useState<DeclaracaoGiaEletronica | null>(null);
  const [copiedTxt, setCopiedTxt] = useState(false);
  const [mensagemStatus, setMensagemStatus] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  // Modais
  const [modalAjusteAberto, setModalAjusteAberto] = useState(false);
  const [editAjuste, setEditAjuste] = useState<OcorrenciaAjusteGia | null>(null);
  const [formAjuste, setFormAjuste] = useState<Omit<OcorrenciaAjusteGia, 'id'>>({
    tipoAjuste: 'OUTROS_CREDITOS',
    codigoSubanexo: '007.01',
    descricao: '',
    fundamentoLegal: 'Art. 61, § 10 do RICMS/SP',
    valor: 1000
  });

  const [modalCfopAberto, setModalCfopAberto] = useState(false);
  const [editCfop, setEditCfop] = useState<ResumoCfopGia | null>(null);
  const [formCfop, setFormCfop] = useState<Omit<ResumoCfopGia, 'id'>>({
    cfop: '1.102',
    natureza: 'ENTRADA',
    origemDestino: 'INTERNA',
    descricao: '',
    valorContabil: 10000,
    baseCalculo: 10000,
    impostoDebitadoOuCreditado: 1800,
    isentasOuNaoTributadas: 0,
    outras: 0,
    aliquotaMedia: 18.0
  });

  const carregarDados = () => {
    const dec = dbService.getDeclaracaoGia(empresaAtiva.id, competencia);
    dec.arquivoGiaTxt = dbService.gerarArquivoGiaTxt(empresaAtiva.id, competencia);
    dec.arquivoSintegraTxt = dbService.gerarArquivoSintegraTxt(empresaAtiva.id, competencia);
    setDeclaracao(dec);
  };

  useEffect(() => {
    carregarDados();
  }, [empresaAtiva.id, competencia]);

  const handleCopiarTxt = (txt?: string) => {
    if (!txt) return;
    navigator.clipboard.writeText(txt);
    setCopiedTxt(true);
    setTimeout(() => setCopiedTxt(false), 2500);
  };

  const handleDownloadTxt = (conteudo: string, nomeArquivo: string) => {
    const blob = new Blob([conteudo], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nomeArquivo;
    link.click;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSalvarAjuste = (e: React.FormEvent) => {
    e.preventDefault();
    const novo: OcorrenciaAjusteGia = {
      id: editAjuste ? editAjuste.id : `ajuste-${Date.now()}`,
      ...formAjuste
    };
    dbService.salvarAjusteGia(novo);
    setModalAjusteAberto(false);
    setEditAjuste(null);
    carregarDados();
    setMensagemStatus({ tipo: 'sucesso', texto: 'Ajuste / Ocorrência fiscal salvo com sucesso!' });
    setTimeout(() => setMensagemStatus(null), 3000);
  };

  const handleExcluirAjuste = (id: string) => {
    if (confirm('Deseja realmente remover esta ocorrência da GIA?')) {
      dbService.excluirAjusteGia(id);
      carregarDados();
      setMensagemStatus({ tipo: 'sucesso', texto: 'Ajuste removido com sucesso!' });
      setTimeout(() => setMensagemStatus(null), 3000);
    }
  };

  const handleSalvarCfop = (e: React.FormEvent) => {
    e.preventDefault();
    const novo: ResumoCfopGia = {
      id: editCfop ? editCfop.id : `cfop-${Date.now()}`,
      ...formCfop
    };
    dbService.salvarResumoCfopGia(novo);
    setModalCfopAberto(false);
    setEditCfop(null);
    carregarDados();
    setMensagemStatus({ tipo: 'sucesso', texto: 'Resumo por CFOP atualizado com sucesso!' });
    setTimeout(() => setMensagemStatus(null), 3000);
  };

  const handleIntegrarContabil = () => {
    const res = dbService.integrarGiaContabil(empresaAtiva.id, competencia);
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
            <h1 className="text-base font-bold uppercase tracking-wider">Guia de Informação e Apuração do ICMS (GIA)</h1>
            <p className="text-neutral-600">Demonstrativo Mensal do ICMS Próprio e ST - SEFAZ / Portaria CAT</p>
          </div>
          <div className="text-right">
            <span className="font-mono font-bold bg-neutral-100 px-2 py-1 border border-neutral-300">Competência: {competencia}</span>
            <p className="text-[10px] text-neutral-500 mt-1">IE: {declaracao.inscricaoEstadual}</p>
          </div>
        </div>

        {/* Quadro 1: Apuração do ICMS Próprio */}
        <div className="border border-neutral-300 rounded p-3 bg-neutral-50/50">
          <h2 className="font-bold text-sm text-neutral-800 border-b border-neutral-200 pb-1 mb-2 flex items-center justify-between">
            <span>1. Quadro da Apuração do Imposto (Quadro C)</span>
            <span className="font-mono text-emerald-700">ICMS a Recolher: R$ {declaracao.impostoRecolher.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </h2>
          <div className="grid grid-cols-3 gap-3 text-xs mb-3">
            <div className="space-y-1">
              <span className="font-bold text-neutral-700 block border-b border-neutral-200 pb-0.5">Valores a Débito</span>
              <div className="flex justify-between"><span>001 - Por Saídas c/ Débito:</span> <span className="font-mono">R$ {declaracao.totalDebitoImposto.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>002 - Outros Débitos:</span> <span className="font-mono">R$ {declaracao.totalOutrosDebitos.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>003 - Estornos de Crédito:</span> <span className="font-mono">R$ {declaracao.totalEstornoCreditos.toFixed(2)}</span></div>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-neutral-700 block border-b border-neutral-200 pb-0.5">Valores a Crédito</span>
              <div className="flex justify-between"><span>005 - Por Entradas c/ Crédito:</span> <span className="font-mono text-blue-700">R$ {declaracao.totalCreditoImposto.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>006 - Outros Créditos (CIAP):</span> <span className="font-mono text-blue-700">R$ {declaracao.totalOutrosCreditos.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>007 - Estornos de Débito:</span> <span className="font-mono text-blue-700">R$ {declaracao.totalEstornoDebitos.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>009 - Saldo Credor Anterior:</span> <span className="font-mono text-blue-700">R$ {declaracao.saldoCredorAnterior.toFixed(2)}</span></div>
            </div>
            <div className="space-y-1 bg-white p-2 border border-neutral-200 rounded">
              <span className="font-bold text-neutral-700 block border-b border-neutral-200 pb-0.5">Resultado da Apuração</span>
              <div className="flex justify-between font-bold text-emerald-800">
                <span>013 - Imposto a Recolher:</span>
                <span className="font-mono text-emerald-700">R$ {declaracao.impostoRecolher.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>014 - Saldo Credor Seguinte:</span>
                <span className="font-mono">R$ {declaracao.saldoCredorSeguinte.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-700 pt-1 border-t border-neutral-200">
                <span>ICMS-ST a Recolher:</span>
                <span className="font-mono font-bold">R$ {declaracao.icmsStRecolher.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quadro 2: Resumo de CFOPs de Entradas e Saídas */}
        <div className="border border-neutral-300 rounded p-3">
          <h3 className="font-bold text-xs uppercase mb-2">2. Resumo de Operações por CFOP (Quadros A e B)</h3>
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="bg-neutral-100 border-b border-neutral-300">
                <th className="py-1 px-2 text-left">CFOP</th>
                <th className="py-1 px-2 text-left">Nat / Destino</th>
                <th className="py-1 px-2 text-left">Descrição</th>
                <th className="py-1 px-2 text-right">Valor Contábil</th>
                <th className="py-1 px-2 text-right">Base de Cálculo</th>
                <th className="py-1 px-2 text-right">ICMS Apurado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {declaracao.resumoCfops.map(c => (
                <tr key={c.id}>
                  <td className="py-1 px-2 font-mono font-bold">{c.cfop}</td>
                  <td className="py-1 px-2">{c.natureza} ({c.origemDestino})</td>
                  <td className="py-1 px-2">{c.descricao}</td>
                  <td className="py-1 px-2 font-mono text-right">R$ {c.valorContabil.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="py-1 px-2 font-mono text-right">R$ {c.baseCalculo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className={`py-1 px-2 font-mono text-right font-bold ${c.natureza === 'ENTRADA' ? 'text-blue-700' : 'text-neutral-800'}`}>
                    R$ {c.impostoDebitadoOuCreditado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Termo de Conciliação e Assinaturas */}
        <div className="bg-neutral-50 p-2.5 border border-neutral-200 rounded text-[11px] leading-relaxed">
          <p>
            <strong>Termo de Conciliação Fiscal:</strong> Os valores acima confrontam fidedignamente os Livros Registros de Entradas (Mod. 1/1A), Registro de Saídas (Mod. 2/2A) e Registro de Apuração do ICMS (Mod. 9), inexistindo divergências cadastrais perante a SEFAZ.
          </p>
        </div>

        <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
          <div className="border-t border-neutral-800 pt-2">
            <p className="font-bold uppercase">{empresaAtiva.razaoSocial}</p>
            <p className="text-neutral-500">Contribuinte / Representante Legal</p>
          </div>
          <div className="border-t border-neutral-800 pt-2">
            <p className="font-bold uppercase">Dr. Roberto Silveira Barbosa</p>
            <p className="text-neutral-500">Contador Responsável - CRC-SP 1SP298451/O-4</p>
          </div>
        </div>
      </div>
    );

    onOpenReportPreview('Guia de Informação e Apuração do ICMS (GIA)', `Competência ${competencia}`, content, 'portrait');
  };

  return (
    <div className="h-full flex flex-col bg-[#141414] text-neutral-200 select-none overflow-hidden">
      {/* 1. Header do Módulo */}
      <div className="p-4 bg-[#1a1a1a] border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
            <Scale size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-wide">GIA Eletrônica Estadual & SINTEGRA</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Portaria CAT / Convênio ICMS 57/95
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Guia de Informação e Apuração do ICMS Próprio, Substituição Tributária (ST) e Validador Magnético SINTEGRA
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
            title="Lançar automaticamente a guia do ICMS a recolher no Diário Geral"
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

      {/* Banner de Feedback */}
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

      {/* 2. Cards Resumo da GIA */}
      {declaracao && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3 bg-[#181818] border-b border-white/5">
          <div className="bg-[#202020] border border-white/10 rounded-xl p-3">
            <span className="text-[11px] text-neutral-400 block mb-1">Total Débitos (Saídas)</span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold font-mono text-white">R$ {declaracao.totalDebitoImposto.toFixed(2)}</span>
            </div>
            <span className="text-[10px] text-neutral-500 block mt-1">+ Outros Débitos R$ {declaracao.totalOutrosDebitos.toFixed(2)}</span>
          </div>

          <div className="bg-[#202020] border border-white/10 rounded-xl p-3">
            <span className="text-[11px] text-neutral-400 block mb-1">Total Créditos (Entradas)</span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold font-mono text-blue-400">R$ {declaracao.totalCreditoImposto.toFixed(2)}</span>
            </div>
            <span className="text-[10px] text-neutral-500 block mt-1">+ CIAP R$ {declaracao.totalOutrosCreditos.toFixed(2)} | + Ant. R$ {declaracao.saldoCredorAnterior.toFixed(2)}</span>
          </div>

          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3">
            <span className="text-[11px] text-emerald-400 font-medium block mb-1">ICMS Próprio a Recolher</span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold font-mono text-emerald-300">R$ {declaracao.impostoRecolher.toFixed(2)}</span>
            </div>
            <span className="text-[10px] text-neutral-400 block mt-1">Guia GARE / DAE estadual</span>
          </div>

          <div className="bg-[#202020] border border-white/10 rounded-xl p-3">
            <span className="text-[11px] text-neutral-400 block mb-1">ICMS Substituição Tributária (ST)</span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold font-mono text-amber-400">R$ {declaracao.icmsStRecolher.toFixed(2)}</span>
            </div>
            <span className="text-[10px] text-neutral-500 block mt-1">Base ST R$ {declaracao.icmsStBaseCalculo.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* 3. Seletor de Abas */}
      <div className="flex items-center gap-1 px-4 pt-2 bg-[#1a1a1a] border-b border-white/10 text-xs">
        <button
          onClick={() => setActiveTab('apuracao')}
          className={`flex items-center gap-2 px-3.5 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'apuracao'
              ? 'border-amber-500 text-white bg-white/5'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Scale size={14} />
          <span>Apuração & Ajustes (GIA)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-800 text-neutral-400">
            {declaracao?.ajustesOcorrencias.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('cfops')}
          className={`flex items-center gap-2 px-3.5 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'cfops'
              ? 'border-amber-500 text-white bg-white/5'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Layers size={14} />
          <span>Resumo por CFOP (Quadros A/B)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-800 text-neutral-400">
            {declaracao?.resumoCfops.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('sintegra')}
          className={`flex items-center gap-2 px-3.5 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'sintegra'
              ? 'border-amber-500 text-white bg-white/5'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <FileCode size={14} />
          <span>SINTEGRA Convênio 57/95 (.txt)</span>
        </button>

        <button
          onClick={() => setActiveTab('giaTxt')}
          className={`flex items-center gap-2 px-3.5 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'giaTxt'
              ? 'border-amber-500 text-white bg-white/5'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <FileCode size={14} />
          <span>Arquivo Magnético GIA (.txt)</span>
        </button>
      </div>

      {/* 4. Conteúdo das Abas */}
      <div className="flex-1 overflow-auto p-4">
        {/* ABA 1: APURAÇÃO & AJUSTES */}
        {activeTab === 'apuracao' && declaracao && (
          <div className="space-y-6 max-w-5xl">
            {/* Tabela de Ocorrências e Ajustes da GIA */}
            <div className="bg-[#1c1c1c] border border-white/10 rounded-xl overflow-hidden">
              <div className="p-3.5 bg-neutral-800/50 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-white">Quadro de Ocorrências e Ajustes da Apuração</h2>
                  <p className="text-xs text-neutral-400">Subanexos de Crédito Acumulado, CIAP Bloco G e Estornos regulamentados no RICMS</p>
                </div>
                <button
                  onClick={() => {
                    setEditAjuste(null);
                    setFormAjuste({
                      tipoAjuste: 'OUTROS_CREDITOS',
                      codigoSubanexo: '007.01',
                      descricao: '',
                      fundamentoLegal: 'Art. 61, § 10 do RICMS/SP',
                      valor: 1000
                    });
                    setModalAjusteAberto(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  <Plus size={14} />
                  <span>Nova Ocorrência / Ajuste</span>
                </button>
              </div>

              <div className="p-4">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-neutral-400 font-semibold">
                      <th className="py-2 px-2">Subanexo</th>
                      <th className="py-2 px-2">Tipo de Ajuste</th>
                      <th className="py-2 px-3">Descrição da Ocorrência</th>
                      <th className="py-2 px-3">Fundamento Legal</th>
                      <th className="py-2 px-2 text-right">Valor (R$)</th>
                      <th className="py-2 px-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {declaracao.ajustesOcorrencias.map(aj => (
                      <tr key={aj.id} className="hover:bg-white/[0.02]">
                        <td className="py-2.5 px-2 font-mono font-bold text-neutral-300">{aj.codigoSubanexo}</td>
                        <td className="py-2.5 px-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                            aj.tipoAjuste === 'OUTROS_CREDITOS' || aj.tipoAjuste === 'ESTORNO_DEBITOS'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            {aj.tipoAjuste.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-white font-medium">{aj.descricao}</td>
                        <td className="py-2.5 px-3 text-neutral-400 italic text-[11px]">{aj.fundamentoLegal}</td>
                        <td className="py-2.5 px-2 font-mono text-right font-bold text-white">R$ {aj.valor.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setEditAjuste(aj);
                                setFormAjuste({ ...aj });
                                setModalAjusteAberto(true);
                              }}
                              className="p-1 hover:bg-white/10 text-neutral-400 hover:text-white rounded"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleExcluirAjuste(aj.id)}
                              className="p-1 hover:bg-red-500/10 text-neutral-400 hover:text-red-400 rounded"
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
          </div>
        )}

        {/* ABA 2: RESUMO POR CFOP */}
        {activeTab === 'cfops' && declaracao && (
          <div className="space-y-4 max-w-5xl">
            <div className="flex items-center justify-between">
              <p className="text-xs text-neutral-400">
                Lançamentos agregados por Código Fiscal de Operações e Prestações (CFOP) confrontados com a EFD-ICMS/IPI
              </p>
              <button
                onClick={() => {
                  setEditCfop(null);
                  setFormCfop({
                    cfop: '5.102',
                    natureza: 'SAIDA',
                    origemDestino: 'INTERNA',
                    descricao: 'Venda de mercadoria',
                    valorContabil: 10000,
                    baseCalculo: 10000,
                    impostoDebitadoOuCreditado: 1800,
                    isentasOuNaoTributadas: 0,
                    outras: 0,
                    aliquotaMedia: 18.0
                  });
                  setModalCfopAberto(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-medium transition-colors"
              >
                <Plus size={14} />
                <span>Novo CFOP</span>
              </button>
            </div>

            <div className="bg-[#1c1c1c] border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-neutral-800/40 border-b border-white/10 text-neutral-400 font-semibold">
                    <th className="py-2 px-3">CFOP</th>
                    <th className="py-2 px-2">Tipo</th>
                    <th className="py-2 px-3">Descrição da Operação</th>
                    <th className="py-2 px-2 text-right">Valor Contábil</th>
                    <th className="py-2 px-2 text-right">Base de Cálculo</th>
                    <th className="py-2 px-2 text-right">ICMS Apurado</th>
                    <th className="py-2 px-2 text-right">Outras / Isentas</th>
                    <th className="py-2 px-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {declaracao.resumoCfops.map(c => (
                    <tr key={c.id} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 px-3 font-mono font-bold text-white">{c.cfop}</td>
                      <td className="py-2.5 px-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                          c.natureza === 'ENTRADA' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {c.natureza}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-neutral-300">{c.descricao}</td>
                      <td className="py-2.5 px-2 font-mono text-right text-white">R$ {c.valorContabil.toFixed(2)}</td>
                      <td className="py-2.5 px-2 font-mono text-right text-neutral-300">R$ {c.baseCalculo.toFixed(2)}</td>
                      <td className="py-2.5 px-2 font-mono text-right font-bold text-amber-400">R$ {c.impostoDebitadoOuCreditado.toFixed(2)}</td>
                      <td className="py-2.5 px-2 font-mono text-right text-neutral-400">R$ {(c.outras + c.isentasOuNaoTributadas).toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => {
                            setEditCfop(c);
                            setFormCfop({ ...c });
                            setModalCfopAberto(true);
                          }}
                          className="p-1 hover:bg-white/10 text-neutral-400 hover:text-white rounded"
                        >
                          <Edit2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 3: SINTEGRA */}
        {activeTab === 'sintegra' && declaracao && (
          <div className="space-y-4 max-w-5xl">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400">Arquivo Magnético SINTEGRA (Convênio ICMS 57/95 - Registros 10, 11, 50 e 90):</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopiarTxt(declaracao.arquivoSintegraTxt)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-white/10 rounded-lg text-xs font-medium transition-colors"
                >
                  {copiedTxt ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>Copiar</span>
                </button>
                <button
                  onClick={() => handleDownloadTxt(declaracao.arquivoSintegraTxt || '', `SINTEGRA_${empresaAtiva.cnpj.replace(/\D/g, '')}_${competencia.replace('-', '')}.txt`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  <Download size={14} />
                  <span>Baixar SINTEGRA</span>
                </button>
              </div>
            </div>

            <div className="bg-[#111] border border-white/10 rounded-xl p-4 font-mono text-[11px] leading-relaxed text-neutral-300 overflow-x-auto max-h-[550px]">
              <pre className="whitespace-pre">{declaracao.arquivoSintegraTxt}</pre>
            </div>
          </div>
        )}

        {/* ABA 4: GIA TXT */}
        {activeTab === 'giaTxt' && declaracao && (
          <div className="space-y-4 max-w-5xl">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400">Arquivo Posicional da SEFAZ para Importação da GIA (CR=01, CR=10, CR=20, CR=30):</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopiarTxt(declaracao.arquivoGiaTxt)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-white/10 rounded-lg text-xs font-medium transition-colors"
                >
                  {copiedTxt ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>Copiar</span>
                </button>
                <button
                  onClick={() => handleDownloadTxt(declaracao.arquivoGiaTxt || '', `GIA_${empresaAtiva.cnpj.replace(/\D/g, '')}_${competencia.replace('-', '')}.txt`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  <Download size={14} />
                  <span>Baixar GIA</span>
                </button>
              </div>
            </div>

            <div className="bg-[#111] border border-white/10 rounded-xl p-4 font-mono text-[11px] leading-relaxed text-neutral-300 overflow-x-auto max-h-[550px]">
              <pre className="whitespace-pre">{declaracao.arquivoGiaTxt}</pre>
            </div>
          </div>
        )}
      </div>

      {/* MODAL AJUSTE */}
      {modalAjusteAberto && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1c] border border-white/10 rounded-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-sm text-white">
                {editAjuste ? 'Editar Ocorrência GIA' : 'Nova Ocorrência / Ajuste da GIA'}
              </h3>
              <button onClick={() => setModalAjusteAberto(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSalvarAjuste} className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">Tipo de Ajuste</label>
                <select
                  value={formAjuste.tipoAjuste}
                  onChange={e => setFormAjuste({ ...formAjuste, tipoAjuste: e.target.value as any })}
                  className="w-full bg-[#242424] border border-white/10 rounded px-2.5 py-1.5 text-white outline-none"
                >
                  <option value="OUTROS_CREDITOS">Outros Créditos (Subanexo 007)</option>
                  <option value="ESTORNO_DEBITOS">Estorno de Débitos (Subanexo 006)</option>
                  <option value="OUTROS_DEBITOS">Outros Débitos (Subanexo 002)</option>
                  <option value="ESTORNO_CREDITOS">Estorno de Créditos (Subanexo 003)</option>
                  <option value="DEDUCAO_LEGAL">Deduções Legais (Subanexo 012)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Código Subanexo</label>
                  <input
                    type="text"
                    required
                    value={formAjuste.codigoSubanexo}
                    onChange={e => setFormAjuste({ ...formAjuste, codigoSubanexo: e.target.value })}
                    className="w-full bg-[#242424] border border-white/10 rounded px-2.5 py-1.5 text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Valor do Ajuste (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formAjuste.valor}
                    onChange={e => setFormAjuste({ ...formAjuste, valor: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#242424] border border-white/10 rounded px-2.5 py-1.5 text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Descrição da Ocorrência</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Apropriação mensal de 1/48 de crédito do CIAP"
                  value={formAjuste.descricao}
                  onChange={e => setFormAjuste({ ...formAjuste, descricao: e.target.value })}
                  className="w-full bg-[#242424] border border-white/10 rounded px-2.5 py-1.5 text-white outline-none"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Fundamento Legal</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Artigo 61, § 10 do RICMS/SP"
                  value={formAjuste.fundamentoLegal}
                  onChange={e => setFormAjuste({ ...formAjuste, fundamentoLegal: e.target.value })}
                  className="w-full bg-[#242424] border border-white/10 rounded px-2.5 py-1.5 text-white outline-none"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalAjusteAberto(false)}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded text-xs"
                >
                  Salvar Ajuste
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CFOP */}
      {modalCfopAberto && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1c] border border-white/10 rounded-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-sm text-white">
                {editCfop ? 'Editar CFOP' : 'Novo CFOP na GIA'}
              </h3>
              <button onClick={() => setModalCfopAberto(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSalvarCfop} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-neutral-400 block mb-1">CFOP</label>
                  <input
                    type="text"
                    required
                    value={formCfop.cfop}
                    onChange={e => setFormCfop({ ...formCfop, cfop: e.target.value })}
                    className="w-full bg-[#242424] border border-white/10 rounded px-2.5 py-1.5 text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Natureza</label>
                  <select
                    value={formCfop.natureza}
                    onChange={e => setFormCfop({ ...formCfop, natureza: e.target.value as any })}
                    className="w-full bg-[#242424] border border-white/10 rounded px-2.5 py-1.5 text-white outline-none"
                  >
                    <option value="ENTRADA">ENTRADA</option>
                    <option value="SAIDA">SAÍDA</option>
                  </select>
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Destino</label>
                  <select
                    value={formCfop.origemDestino}
                    onChange={e => setFormCfop({ ...formCfop, origemDestino: e.target.value as any })}
                    className="w-full bg-[#242424] border border-white/10 rounded px-2.5 py-1.5 text-white outline-none"
                  >
                    <option value="INTERNA">INTERNA</option>
                    <option value="INTERESTADUAL">INTERESTADUAL</option>
                    <option value="EXTERIOR">EXTERIOR</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Descrição</label>
                <input
                  type="text"
                  required
                  value={formCfop.descricao}
                  onChange={e => setFormCfop({ ...formCfop, descricao: e.target.value })}
                  className="w-full bg-[#242424] border border-white/10 rounded px-2.5 py-1.5 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-neutral-400 block mb-1">Valor Contábil</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formCfop.valorContabil}
                    onChange={e => {
                      const v = parseFloat(e.target.value) || 0;
                      setFormCfop({
                        ...formCfop,
                        valorContabil: v,
                        baseCalculo: v,
                        impostoDebitadoOuCreditado: Number((v * (formCfop.aliquotaMedia / 100)).toFixed(2))
                      });
                    }}
                    className="w-full bg-[#242424] border border-white/10 rounded px-2.5 py-1.5 text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Base Cálculo</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formCfop.baseCalculo}
                    onChange={e => setFormCfop({ ...formCfop, baseCalculo: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#242424] border border-white/10 rounded px-2.5 py-1.5 text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">ICMS</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formCfop.impostoDebitadoOuCreditado}
                    onChange={e => setFormCfop({ ...formCfop, impostoDebitadoOuCreditado: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#242424] border border-white/10 rounded px-2.5 py-1.5 text-amber-400 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalCfopAberto(false)}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded text-xs"
                >
                  Salvar CFOP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
