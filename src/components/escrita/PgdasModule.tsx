import React, { useState, useEffect, useMemo } from 'react';
import {
  Calculator,
  Receipt,
  Printer,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Percent,
  Layers,
  Calendar,
  Building2,
  Copy,
  Zap,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  HelpCircle,
  Barcode,
  QrCode
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import { Empresa, ApuracaoPgdas, SegregacaoReceitaPgdas, AnexoSimplesNacional } from '../../types/contabil';
import { ReportPrintPreviewModal } from '../layout/ReportPrintPreviewModal';

export const PgdasModule: React.FC = () => {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [competencia, setCompetencia] = useState<string>('2026-04');
  const [apuracao, setApuracao] = useState<ApuracaoPgdas | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'apuracao' | 'segregacoes' | 'das' | 'tabelas'>('apuracao');

  // Modais
  const [showDasModal, setShowDasModal] = useState(false);
  const [showMemoriaModal, setShowMemoriaModal] = useState(false);
  const [copiadoPix, setCopiadoPix] = useState(false);
  const [copiadoCodigo, setCopiadoCodigo] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  const carregarDados = () => {
    const emp = dbService.getActiveEmpresa();
    if (emp) {
      setEmpresa(emp);
      const ap = dbService.getApuracaoPgdas(emp.id, competencia);
      setApuracao(ap);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [competencia]);

  const handleIntegrarContabil = () => {
    if (!apuracao) return;
    const res = dbService.integrarPgdasContabil(apuracao.id);
    if (res.sucesso) {
      setFeedbackMsg({ tipo: 'success', texto: `${res.mensagem} (Lote Contábil nº ${res.loteId})` });
      carregarDados();
    } else {
      setFeedbackMsg({ tipo: 'error', texto: res.mensagem });
    }
  };

  const handleCopiarPix = () => {
    if (!apuracao) return;
    navigator.clipboard.writeText(apuracao.qrCodePixDas);
    setCopiadoPix(true);
    setTimeout(() => setCopiadoPix(false), 2500);
  };

  const handleCopiarCodigoBarras = () => {
    if (!apuracao) return;
    navigator.clipboard.writeText(apuracao.codigoBarrasDas.replace(/\D/g, ''));
    setCopiadoCodigo(true);
    setTimeout(() => setCopiadoCodigo(false), 2500);
  };

  const tabelas = useMemo(() => dbService.getTabelasSimplesNacional(), []);

  return (
    <div className="h-full flex flex-col bg-[#141414] text-neutral-200 overflow-hidden font-sans">
      {/* Top Header */}
      <div className="h-14 border-b border-white/10 bg-[#181818] px-6 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 text-amber-400">
            <Calculator size={18} />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
              PGDAS-D 2026 & Simples Nacional Avançado
              <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                LC 123/2006 & CGSN 140/2018
              </span>
            </h1>
            <p className="text-xs text-neutral-400">
              Segregação por Anexos I a V, Cálculo da Alíquota Efetiva, Fator R Dinâmico e Emissão da Guia DAS
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-[#1c1c1c] border border-white/10 rounded-lg px-2.5 py-1 text-xs">
            <Calendar size={13} className="text-neutral-400 mr-2" />
            <span className="text-neutral-400 mr-1.5">Competência:</span>
            <input
              type="month"
              value={competencia}
              onChange={(e) => setCompetencia(e.target.value)}
              className="bg-transparent border-0 text-neutral-200 font-mono text-xs focus:ring-0 p-0 cursor-pointer"
            />
          </div>

          <button
            onClick={() => setShowDasModal(true)}
            className="flex items-center space-x-1.5 bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition shadow-sm"
          >
            <Printer size={14} />
            <span>Imprimir Guia DAS A4</span>
          </button>

          <button
            onClick={() => setShowMemoriaModal(true)}
            className="flex items-center space-x-1.5 bg-[#1c1c1c] hover:bg-neutral-800 border border-white/10 text-neutral-200 px-3 py-1.5 rounded-lg text-xs font-medium transition"
          >
            <Receipt size={14} />
            <span>Memória de Cálculo A4</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackMsg && (
        <div className={`px-6 py-2 text-xs flex items-center justify-between border-b ${
          feedbackMsg.tipo === 'success' ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40' : 'bg-red-950/60 text-red-300 border-red-800/40'
        }`}>
          <div className="flex items-center space-x-2">
            {feedbackMsg.tipo === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            <span>{feedbackMsg.texto}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-xs hover:opacity-75">×</button>
        </div>
      )}

      {/* Sub-Tabs Bar */}
      <div className="h-10 border-b border-white/10 bg-[#161616] px-6 flex items-center space-x-4 flex-shrink-0">
        <button
          onClick={() => setActiveSubTab('apuracao')}
          className={`h-full flex items-center space-x-2 text-xs font-medium border-b-2 transition ${
            activeSubTab === 'apuracao' ? 'border-amber-500 text-amber-400' : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <TrendingUp size={13} />
          <span>Apuração & Indicadores Fiscais</span>
        </button>

        <button
          onClick={() => setActiveSubTab('segregacoes')}
          className={`h-full flex items-center space-x-2 text-xs font-medium border-b-2 transition ${
            activeSubTab === 'segregacoes' ? 'border-amber-500 text-amber-400' : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Layers size={13} />
          <span>Segregação de Receitas por Anexo</span>
        </button>

        <button
          onClick={() => setActiveSubTab('das')}
          className={`h-full flex items-center space-x-2 text-xs font-medium border-b-2 transition ${
            activeSubTab === 'das' ? 'border-amber-500 text-amber-400' : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Barcode size={13} />
          <span>Guia DAS & Quitação Bancária</span>
        </button>

        <button
          onClick={() => setActiveSubTab('tabelas')}
          className={`h-full flex items-center space-x-2 text-xs font-medium border-b-2 transition ${
            activeSubTab === 'tabelas' ? 'border-amber-500 text-amber-400' : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Percent size={13} />
          <span>Tabelas Oficiais Anexos I a V</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {apuracao && activeSubTab === 'apuracao' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-5 gap-4">
              <div className="p-4 bg-[#181818] border border-white/10 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-neutral-400 text-xs">
                  <span>Receita Mês</span>
                  <DollarSign size={14} className="text-amber-400" />
                </div>
                <div className="text-lg font-bold font-mono text-neutral-100">
                  R$ {apuracao.faturamentoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-[10px] text-neutral-500">Base da competência {competencia}</p>
              </div>

              <div className="p-4 bg-[#181818] border border-white/10 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-neutral-400 text-xs">
                  <span>RBT12 Acumulada</span>
                  <TrendingUp size={14} className="text-blue-400" />
                </div>
                <div className="text-lg font-bold font-mono text-neutral-100">
                  R$ {apuracao.rbt12.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-[10px] text-neutral-500">Últimos 12 meses anteriores</p>
              </div>

              <div className="p-4 bg-[#181818] border border-white/10 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-neutral-400 text-xs">
                  <span>Fator R (Folha/RBT12)</span>
                  <Percent size={14} className="text-indigo-400" />
                </div>
                <div className="text-lg font-bold font-mono flex items-center gap-2">
                  <span className={apuracao.enquadraFatorR ? 'text-emerald-400' : 'text-amber-400'}>
                    {(apuracao.fatorR * 100).toFixed(2)}%
                  </span>
                  <span className={`text-[10px] font-sans px-1.5 py-0.5 rounded border ${
                    apuracao.enquadraFatorR 
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40' 
                      : 'bg-amber-950/60 text-amber-300 border-amber-800/40'
                  }`}>
                    {apuracao.enquadraFatorR ? 'Anexo III (≥ 28%)' : 'Anexo V (< 28%)'}
                  </span>
                </div>
                <p className="text-[10px] text-neutral-500">Folha 12m: R$ {apuracao.folhaSalarios12Meses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>

              <div className="p-4 bg-[#181818] border border-white/10 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-neutral-400 text-xs">
                  <span>Total DAS a Recolher</span>
                  <Calculator size={14} className="text-emerald-400" />
                </div>
                <div className="text-lg font-bold font-mono text-emerald-400">
                  R$ {apuracao.totalDevidoDas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-[10px] text-neutral-500">Vencimento: {apuracao.dataVencimento.split('-').reverse().join('/')}</p>
              </div>

              <div className="p-4 bg-[#181818] border border-white/10 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-neutral-400 text-xs">
                  <span>Status Contábil</span>
                  <FileCheck2 size={14} className={apuracao.statusIntegracaoContabil ? 'text-emerald-400' : 'text-neutral-500'} />
                </div>
                <div className="text-sm font-semibold flex items-center gap-1.5 pt-1">
                  {apuracao.statusIntegracaoContabil ? (
                    <span className="text-emerald-400 flex items-center gap-1 text-xs">
                      <CheckCircle2 size={13} /> Integrado (Lote {apuracao.loteContabilId})
                    </span>
                  ) : (
                    <button
                      onClick={handleIntegrarContabil}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-medium transition"
                    >
                      Integrar ao Diário
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-neutral-500">Partidas dobradas D: 4.1.02 / C: 2.1.04</p>
              </div>
            </div>

            {/* Resumo da Apuração do Período */}
            <div className="bg-[#181818] border border-white/10 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
                <Receipt size={16} className="text-amber-400" />
                Quadro Resumo da Apuração Mensal por Atividade
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#1c1c1c] text-neutral-400 uppercase text-[10px] font-mono border-y border-white/5">
                    <tr>
                      <th className="py-2.5 px-3">Anexo</th>
                      <th className="py-2.5 px-3">Descrição da Atividade</th>
                      <th className="py-2.5 px-3 text-right">Receita Bruta (R$)</th>
                      <th className="py-2.5 px-3 text-right">Subst. Tributária</th>
                      <th className="py-2.5 px-3 text-right">Base Tributável</th>
                      <th className="py-2.5 px-3 text-right">Alíq. Efetiva</th>
                      <th className="py-2.5 px-3 text-right">DAS Devido (R$)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {apuracao.segregacoes.map((seg) => (
                      <tr key={seg.id} className="hover:bg-white/[0.02]">
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-bold">
                            {seg.anexo.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-sans text-neutral-300">{seg.descricaoAtividade}</td>
                        <td className="py-2.5 px-3 text-right">R$ {seg.valorReceitaBruta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="py-2.5 px-3 text-right text-neutral-400">R$ {seg.valorSubstituicaoTributaria.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="py-2.5 px-3 text-right font-semibold text-neutral-100">R$ {seg.valorTributavel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="py-2.5 px-3 text-right text-amber-400">{(seg.aliquotaEfetiva * 100).toFixed(2)}%</td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-400">R$ {seg.valorDevido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-white/10 font-bold font-mono text-xs bg-[#1a1a1a]">
                      <td colSpan={2} className="py-3 px-3 uppercase text-neutral-300">TOTAIS CONSOLIDADOS DO SIMPLES NACIONAL:</td>
                      <td className="py-3 px-3 text-right text-neutral-100">
                        R$ {apuracao.segregacoes.reduce((acc, s) => acc + s.valorReceitaBruta, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right text-neutral-400">
                        R$ {apuracao.segregacoes.reduce((acc, s) => acc + s.valorSubstituicaoTributaria, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right text-neutral-100">
                        R$ {apuracao.segregacoes.reduce((acc, s) => acc + s.valorTributavel, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right text-neutral-400">-</td>
                      <td className="py-3 px-3 text-right text-emerald-400 text-sm">
                        R$ {apuracao.totalDevidoDas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Repartição Analítica dos Tributos na DAS */}
            <div className="bg-[#181818] border border-white/10 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
                <Percent size={16} className="text-indigo-400" />
                Repartição dos Tributos Federais, Estaduais e Municipais na Guia Única
              </h3>

              <div className="grid grid-cols-4 gap-4">
                {(() => {
                  const totaisTributos = apuracao.segregacoes.reduce(
                    (acc, seg) => {
                      acc.irpj += seg.detalhamentoTributos.irpj;
                      acc.csll += seg.detalhamentoTributos.csll;
                      acc.cofins += seg.detalhamentoTributos.cofins;
                      acc.pis += seg.detalhamentoTributos.pis;
                      acc.cpp += seg.detalhamentoTributos.cpp;
                      acc.icms += seg.detalhamentoTributos.icms;
                      acc.ipi += seg.detalhamentoTributos.ipi;
                      acc.iss += seg.detalhamentoTributos.iss;
                      return acc;
                    },
                    { irpj: 0, csll: 0, cofins: 0, pis: 0, cpp: 0, icms: 0, ipi: 0, iss: 0 }
                  );

                  return (
                    <>
                      <div className="p-3 bg-[#1c1c1c] border border-white/5 rounded-lg space-y-1">
                        <div className="text-[10px] text-neutral-400 uppercase font-mono">IRPJ (Federal)</div>
                        <div className="text-sm font-bold font-mono text-neutral-200">R$ {totaisTributos.irpj.toFixed(2)}</div>
                      </div>
                      <div className="p-3 bg-[#1c1c1c] border border-white/5 rounded-lg space-y-1">
                        <div className="text-[10px] text-neutral-400 uppercase font-mono">CSLL (Federal)</div>
                        <div className="text-sm font-bold font-mono text-neutral-200">R$ {totaisTributos.csll.toFixed(2)}</div>
                      </div>
                      <div className="p-3 bg-[#1c1c1c] border border-white/5 rounded-lg space-y-1">
                        <div className="text-[10px] text-neutral-400 uppercase font-mono">COFINS (Federal)</div>
                        <div className="text-sm font-bold font-mono text-neutral-200">R$ {totaisTributos.cofins.toFixed(2)}</div>
                      </div>
                      <div className="p-3 bg-[#1c1c1c] border border-white/5 rounded-lg space-y-1">
                        <div className="text-[10px] text-neutral-400 uppercase font-mono">PIS / PASEP (Federal)</div>
                        <div className="text-sm font-bold font-mono text-neutral-200">R$ {totaisTributos.pis.toFixed(2)}</div>
                      </div>
                      <div className="p-3 bg-[#1c1c1c] border border-white/5 rounded-lg space-y-1">
                        <div className="text-[10px] text-neutral-400 uppercase font-mono">CPP Patronal Previdenciária</div>
                        <div className="text-sm font-bold font-mono text-neutral-200">R$ {totaisTributos.cpp.toFixed(2)}</div>
                      </div>
                      <div className="p-3 bg-[#1c1c1c] border border-white/5 rounded-lg space-y-1">
                        <div className="text-[10px] text-neutral-400 uppercase font-mono">ICMS (Estadual)</div>
                        <div className="text-sm font-bold font-mono text-neutral-200">R$ {totaisTributos.icms.toFixed(2)}</div>
                      </div>
                      <div className="p-3 bg-[#1c1c1c] border border-white/5 rounded-lg space-y-1">
                        <div className="text-[10px] text-neutral-400 uppercase font-mono">ISS (Municipal)</div>
                        <div className="text-sm font-bold font-mono text-neutral-200">R$ {totaisTributos.iss.toFixed(2)}</div>
                      </div>
                      <div className="p-3 bg-emerald-950/40 border border-emerald-500/20 rounded-lg space-y-1">
                        <div className="text-[10px] text-emerald-400 uppercase font-mono">TOTAL GERAL DA GUIA</div>
                        <div className="text-sm font-bold font-mono text-emerald-300">R$ {apuracao.totalDevidoDas.toFixed(2)}</div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Segregações por Anexo */}
        {apuracao && activeSubTab === 'segregacoes' && (
          <div className="space-y-6">
            <div className="bg-[#181818] border border-white/10 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-100">Memória Pormenorizada de Segregação de Receitas</h3>
                  <p className="text-xs text-neutral-400">Detalhamento por atividade com separação de imunidades, isenções e ICMS ST</p>
                </div>
              </div>

              {apuracao.segregacoes.map((seg, idx) => (
                <div key={seg.id} className="p-4 bg-[#1c1c1c] border border-white/5 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold">
                        {seg.anexo}
                      </span>
                      <span className="text-xs font-semibold text-neutral-200">{seg.descricaoAtividade}</span>
                    </div>
                    <div className="text-xs font-mono text-emerald-400 font-bold">
                      DAS: R$ {seg.valorDevido.toFixed(2)}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3 text-xs font-mono">
                    <div>
                      <span className="text-neutral-500 block text-[10px]">Receita Bruta:</span>
                      <span className="text-neutral-200">R$ {seg.valorReceitaBruta.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[10px]">Substituição Tributária / Monofásico:</span>
                      <span className="text-neutral-200">R$ {seg.valorSubstituicaoTributaria.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[10px]">Alíquota Efetiva:</span>
                      <span className="text-amber-400 font-bold">{(seg.aliquotaEfetiva * 100).toFixed(4)}%</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[10px]">Fórmula PGDAS:</span>
                      <span className="text-neutral-400 text-[10px]">(RBT12 × AlíqNom - Ded) ÷ RBT12</span>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-2 flex flex-wrap gap-4 text-[11px] font-mono text-neutral-400">
                    {seg.detalhamentoTributos.irpj > 0 && <span>IRPJ: R$ {seg.detalhamentoTributos.irpj.toFixed(2)}</span>}
                    {seg.detalhamentoTributos.csll > 0 && <span>CSLL: R$ {seg.detalhamentoTributos.csll.toFixed(2)}</span>}
                    {seg.detalhamentoTributos.cofins > 0 && <span>COFINS: R$ {seg.detalhamentoTributos.cofins.toFixed(2)}</span>}
                    {seg.detalhamentoTributos.pis > 0 && <span>PIS: R$ {seg.detalhamentoTributos.pis.toFixed(2)}</span>}
                    {seg.detalhamentoTributos.cpp > 0 && <span>CPP: R$ {seg.detalhamentoTributos.cpp.toFixed(2)}</span>}
                    {seg.detalhamentoTributos.icms > 0 && <span>ICMS: R$ {seg.detalhamentoTributos.icms.toFixed(2)}</span>}
                    {seg.detalhamentoTributos.iss > 0 && <span>ISS: R$ {seg.detalhamentoTributos.iss.toFixed(2)}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Guia DAS & Quitação */}
        {apuracao && activeSubTab === 'das' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-[#181818] border border-white/10 rounded-xl p-6 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
                    <Receipt size={24} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-neutral-100">Documento de Arrecadação do Simples Nacional (DAS)</h2>
                    <p className="text-xs text-neutral-400 font-mono">Número: {apuracao.numeroDas}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-neutral-500 uppercase block font-mono">Vencimento</span>
                  <span className="text-sm font-bold text-amber-400 font-mono">
                    {apuracao.dataVencimento.split('-').reverse().join('/')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-neutral-500">Razão Social:</span>
                  <div className="font-semibold text-neutral-200">{empresa?.razaoSocial}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-neutral-500">CNPJ:</span>
                  <div className="font-mono text-neutral-200">{empresa?.cnpj}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-neutral-500">Período de Apuração:</span>
                  <div className="font-mono text-neutral-200">{competencia}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-neutral-500">Valor Total do Documento:</span>
                  <div className="text-lg font-bold font-mono text-emerald-400">
                    R$ {apuracao.totalDevidoDas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Linha Digitável e Código de Barras */}
              <div className="p-4 bg-[#141414] border border-white/10 rounded-xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400 font-medium">Linha Digitável / Código de Barras Febraban:</span>
                  <button
                    onClick={handleCopiarCodigoBarras}
                    className="flex items-center space-x-1 text-amber-400 hover:text-amber-300 text-xs transition"
                  >
                    <Copy size={12} />
                    <span>{copiadoCodigo ? 'Copiado!' : 'Copiar Linha'}</span>
                  </button>
                </div>
                <div className="font-mono text-xs text-neutral-300 bg-[#1c1c1c] p-2.5 rounded border border-white/5 break-all">
                  {apuracao.codigoBarrasDas}
                </div>
              </div>

              {/* PIX Copia e Cola & QR Code */}
              <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                <div className="space-y-1 pr-4">
                  <div className="flex items-center space-x-1.5 text-emerald-400 text-xs font-semibold">
                    <QrCode size={14} />
                    <span>Pagamento Instantâneo via PIX (Banco Central)</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Escaneie ou copie a chave PIX Oficial gerada para quitação direta em qualquer banco.
                  </p>
                </div>
                <button
                  onClick={handleCopiarPix}
                  className="flex-shrink-0 flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
                >
                  <Copy size={13} />
                  <span>{copiadoPix ? 'PIX Copiado!' : 'Copiar PIX'}</span>
                </button>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  onClick={() => setShowDasModal(true)}
                  className="flex items-center space-x-1.5 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg text-xs font-medium transition shadow-sm"
                >
                  <Printer size={14} />
                  <span>Visualizar Guia DAS para Impressão A4</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Tabelas Oficiais do Simples Nacional */}
        {activeSubTab === 'tabelas' && (
          <div className="space-y-6">
            <div className="bg-[#181818] border border-white/10 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
                <Percent size={16} className="text-amber-400" />
                Tabelas Oficiais de Alíquotas e Deduções do Simples Nacional (LC 123/2006 Atualizada)
              </h3>
              <p className="text-xs text-neutral-400">
                Alíquotas Nominais e Parcelas a Deduzir aplicáveis sobre a Receita Bruta dos Últimos 12 Meses (RBT12)
              </p>

              {(['ANEXO_I', 'ANEXO_II', 'ANEXO_III', 'ANEXO_IV', 'ANEXO_V'] as AnexoSimplesNacional[]).map((anexoKey) => (
                <div key={anexoKey} className="p-4 bg-[#1c1c1c] border border-white/5 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-amber-400 uppercase">
                    {anexoKey.replace('_', ' ')} - {
                      anexoKey === 'ANEXO_I' ? 'Comércio' :
                      anexoKey === 'ANEXO_II' ? 'Indústria' :
                      anexoKey === 'ANEXO_III' ? 'Serviços em Geral (Fator R ≥ 28%)' :
                      anexoKey === 'ANEXO_IV' ? 'Construção, Vigilância, Limpeza, Advocacia' :
                      'Serviços Intelectuais (Fator R < 28%)'
                    }
                  </h4>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#141414] text-neutral-400 text-[10px] font-mono">
                        <tr>
                          <th className="py-1.5 px-3">Faixa</th>
                          <th className="py-1.5 px-3">Receita Bruta em 12 Meses (R$)</th>
                          <th className="py-1.5 px-3 text-right">Alíquota Nominal</th>
                          <th className="py-1.5 px-3 text-right">Parcela a Deduzir (R$)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                        {tabelas[anexoKey].map((fx) => (
                          <tr key={fx.faixa} className="hover:bg-white/[0.02]">
                            <td className="py-1.5 px-3 font-bold">{fx.faixa}ª Faixa</td>
                            <td className="py-1.5 px-3">
                              De R$ {fx.limiteInferior.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} até R$ {fx.limiteSuperior.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-1.5 px-3 text-right text-amber-400 font-semibold">
                              {(fx.aliquotaNominal * 100).toFixed(2)}%
                            </td>
                            <td className="py-1.5 px-3 text-right text-neutral-300">
                              R$ {fx.deducao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal A4 da Guia DAS Oficial */}
      {showDasModal && apuracao && empresa && (
        <ReportPrintPreviewModal
          isOpen={showDasModal}
          onClose={() => setShowDasModal(false)}
          empresa={empresa}
          tituloRelatorio="DOCUMENTO DE ARRECADAÇÃO DO SIMPLES NACIONAL (DAS)"
          subtitulo="RECEITA FEDERAL DO BRASIL / COMITÊ GESTOR DO SIMPLES NACIONAL"
          periodo={`Competência: ${competencia} | Vencimento: ${apuracao.dataVencimento.split('-').reverse().join('/')}`}
        >
          <div className="space-y-6 text-black font-sans text-xs">
            {/* Cabeçalho da Guia */}
            <div className="border-2 border-black p-4 space-y-3">
              <div className="flex justify-between items-center border-b border-black pb-2">
                <div>
                  <h2 className="text-base font-bold uppercase">DAS - SIMPLES NACIONAL</h2>
                  <p className="text-[10px] text-gray-700">Documento de Arrecadação do Simples Nacional</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] block font-mono">Número do Documento</span>
                  <span className="text-sm font-bold font-mono">{apuracao.numeroDas}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-gray-600 block">Razão Social:</span>
                  <span className="font-bold">{empresa.razaoSocial}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-600 block">CNPJ:</span>
                  <span className="font-mono font-bold">{empresa.cnpj}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-600 block">Período de Apuração:</span>
                  <span className="font-mono font-bold">{competencia}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-600 block">Data de Vencimento:</span>
                  <span className="font-mono font-bold text-red-700 text-sm">{apuracao.dataVencimento.split('-').reverse().join('/')}</span>
                </div>
              </div>
            </div>

            {/* Demonstrativo das Atividades Tributadas */}
            <div className="border border-black">
              <div className="bg-gray-100 font-bold p-2 border-b border-black uppercase text-[11px]">
                Discriminação dos Tributos e Segregações da Receita Bruta
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-black text-[10px] uppercase font-mono">
                    <th className="p-2 text-left">Anexo</th>
                    <th className="p-2 text-left">Atividade</th>
                    <th className="p-2 text-right">Base de Cálculo (R$)</th>
                    <th className="p-2 text-right">Alíq. Efetiva</th>
                    <th className="p-2 text-right">Valor Devido (R$)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300 font-mono">
                  {apuracao.segregacoes.map((seg) => (
                    <tr key={seg.id}>
                      <td className="p-2 font-bold">{seg.anexo}</td>
                      <td className="p-2 font-sans">{seg.descricaoAtividade}</td>
                      <td className="p-2 text-right">R$ {seg.valorTributavel.toFixed(2)}</td>
                      <td className="p-2 text-right">{(seg.aliquotaEfetiva * 100).toFixed(2)}%</td>
                      <td className="p-2 text-right font-bold">R$ {seg.valorDevido.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-black font-bold font-mono">
                    <td colSpan={4} className="p-2 text-right uppercase">VALOR TOTAL DO DOCUMENTO (DAS):</td>
                    <td className="p-2 text-right text-sm">R$ {apuracao.totalDevidoDas.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Código de Barras e Autenticação */}
            <div className="border-2 border-black p-4 space-y-3">
              <div className="text-center font-mono font-bold text-sm tracking-wider">
                {apuracao.codigoBarrasDas}
              </div>
              <div className="h-10 bg-neutral-900 flex items-center justify-center text-white text-[10px] tracking-widest font-mono">
                ||||| | ||||| || |||||| | |||| ||||| ||||||| |||| ||||| |||| ||||| |||||||
              </div>
              <div className="text-center text-[10px] text-gray-600">
                Autenticação Mecânica / QR Code PIX válido para quitação em qualquer canal bancário ou aplicativo credenciado.
              </div>
            </div>
          </div>
        </ReportPrintPreviewModal>
      )}

      {/* Modal A4 de Memória de Cálculo PGDAS-D */}
      {showMemoriaModal && apuracao && empresa && (
        <ReportPrintPreviewModal
          isOpen={showMemoriaModal}
          onClose={() => setShowMemoriaModal(false)}
          empresa={empresa}
          tituloRelatorio="MEMÓRIA DE CÁLCULO PGDAS-D & ALÍQUOTA EFETIVA"
          subtitulo="Demonstrativo Técnico de Apuração conforme Resolução CGSN nº 140/2018"
          periodo={`Competência: ${competencia}`}
        >
          <div className="space-y-4 text-black font-sans text-xs">
            <div className="border border-black p-3 space-y-2">
              <div className="font-bold text-sm border-b border-black pb-1">1. PARÂMETROS GERAIS DO CONTRIBUINTE</div>
              <div className="grid grid-cols-3 gap-2">
                <div><span className="font-semibold">Receita Bruta no Mês (RPA):</span> R$ {apuracao.faturamentoMes.toFixed(2)}</div>
                <div><span className="font-semibold">Receita Bruta 12 Meses (RBT12):</span> R$ {apuracao.rbt12.toFixed(2)}</div>
                <div><span className="font-semibold">Folha Salários 12 Meses:</span> R$ {apuracao.folhaSalarios12Meses.toFixed(2)}</div>
                <div><span className="font-semibold">Fator R Apurado:</span> {(apuracao.fatorR * 100).toFixed(2)}%</div>
                <div><span className="font-semibold">Enquadramento Fator R:</span> {apuracao.enquadraFatorR ? 'Anexo III (≥ 28%)' : 'Anexo V (< 28%)'}</div>
                <div><span className="font-semibold">Regime de Apuração:</span> Competência</div>
              </div>
            </div>

            <div className="border border-black p-3 space-y-2">
              <div className="font-bold text-sm border-b border-black pb-1">2. FÓRMULA DE CÁLCULO DA ALÍQUOTA EFETIVA</div>
              <p className="text-[11px] font-mono">
                Alíquota Efetiva = [(RBT12 × Alíquota Nominal da Faixa) - Parcela a Deduzir] ÷ RBT12
              </p>
              {apuracao.segregacoes.map((seg, i) => (
                <div key={i} className="p-2 bg-gray-50 border border-gray-300 font-mono text-[11px] space-y-1">
                  <div className="font-bold text-black font-sans">{seg.anexo} - {seg.descricaoAtividade}</div>
                  <div>Base de Cálculo: R$ {seg.valorTributavel.toFixed(2)}</div>
                  <div>Alíquota Efetiva Calculada: {(seg.aliquotaEfetiva * 100).toFixed(4)}%</div>
                  <div className="font-bold">Valor Apurado para este Anexo: R$ {seg.valorDevido.toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div className="border border-black p-3 space-y-2">
              <div className="font-bold text-sm border-b border-black pb-1">3. REPARTIÇÃO DOS ENCARGOS DA GUIA ÚNICA</div>
              <p className="text-[11px]">
                O recolhimento do Simples Nacional extingue a obrigação de recolhimento individualizado dos tributos IRPJ, CSLL, PIS, COFINS, CPP, ICMS e ISS para as receitas abrangidas.
              </p>
              <div className="text-right font-bold font-mono text-sm pt-2">
                TOTAL GERAL DAS DA COMPETÊNCIA: R$ {apuracao.totalDevidoDas.toFixed(2)}
              </div>
            </div>
          </div>
        </ReportPrintPreviewModal>
      )}
    </div>
  );
};
