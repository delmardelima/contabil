import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  UserMinus,
  Calculator,
  Plus,
  Printer,
  CheckCircle,
  AlertCircle,
  Building2,
  DollarSign,
  TrendingDown,
  Layers,
  Calendar,
  FileCheck2,
  Clock,
  ShieldCheck,
  Award
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import { 
  Empresa, 
  Colaborador, 
  RescisaoContratual, 
  MotivoRescisao, 
  TipoAvisoPrevio 
} from '../../types/contabil';
import { ReportPrintPreviewModal } from '../layout/ReportPrintPreviewModal';

export const RescisaoModule: React.FC = () => {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [rescisoes, setRescisoes] = useState<RescisaoContratual[]>([]);
  const [selectedRescisao, setSelectedRescisao] = useState<RescisaoContratual | null>(null);

  // Modais
  const [showNovaRescisaoModal, setShowNovaRescisaoModal] = useState(false);
  const [showTrctModal, setShowTrctModal] = useState(false);
  const [showHomologacaoModal, setShowHomologacaoModal] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  // Form State
  const [formColaboradorId, setFormColaboradorId] = useState<number>(1);
  const [formDataDemissao, setFormDataDemissao] = useState<string>('2026-04-15');
  const [formDataAviso, setFormDataAviso] = useState<string>('2026-03-15');
  const [formMotivo, setFormMotivo] = useState<MotivoRescisao>('SEM_JUSTA_CAUSA');
  const [formTipoAviso, setFormTipoAviso] = useState<TipoAvisoPrevio>('TRABALHADO');
  const [formSaldoFgts, setFormSaldoFgts] = useState<string>('8500.00');
  const [formFeriasVencidas, setFormFeriasVencidas] = useState<boolean>(false);
  const [formOutrasDeducoes, setFormOutrasDeducoes] = useState<string>('0.00');
  const [formObservacoes, setFormObservacoes] = useState<string>('');

  // Simulação / Prévia de Cálculo
  const [rescisaoCalculada, setRescisaoCalculada] = useState<RescisaoContratual | null>(null);

  const carregarDados = () => {
    const emp = dbService.getActiveEmpresa();
    if (emp) {
      setEmpresa(emp);
      const cols = dbService.getColaboradores(emp.id);
      setColaboradores(cols);
      if (cols.length > 0 && !formColaboradorId) {
        setFormColaboradorId(cols[0].id);
      }
      const rescs = dbService.getRescisoes(emp.id);
      setRescisoes(rescs);
      if (rescs.length > 0 && !selectedRescisao) {
        setSelectedRescisao(rescs[0]);
      }
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // KPIs
  const totais = useMemo(() => {
    const totalBruto = rescisoes.reduce((acc, r) => acc + r.totalProventosBruto, 0);
    const totalDescontos = rescisoes.reduce((acc, r) => acc + r.totalDescontos, 0);
    const totalLiquido = rescisoes.reduce((acc, r) => acc + r.valorLiquidoRescisorio, 0);
    const totalMultasFgts = rescisoes.reduce((acc, r) => acc + r.valorMultaFgts, 0);
    return {
      qtd: rescisoes.length,
      totalBruto,
      totalDescontos,
      totalLiquido,
      totalMultasFgts
    };
  }, [rescisoes]);

  // Recalcular simulação ao mudar parâmetros
  const handleSimularCalculo = () => {
    if (!empresa) return;
    const calc = dbService.calcularRescisao({
      empresaId: empresa.id,
      colaboradorId: formColaboradorId,
      dataDemissao: formDataDemissao,
      dataAviso: formDataAviso,
      motivo: formMotivo,
      tipoAviso: formTipoAviso,
      saldoFgts: parseFloat(formSaldoFgts) || 0,
      feriasVencidas: formFeriasVencidas,
      outrasDeducoes: parseFloat(formOutrasDeducoes) || 0,
      observacoes: formObservacoes
    });
    setRescisaoCalculada(calc);
  };

  useEffect(() => {
    if (showNovaRescisaoModal && empresa) {
      handleSimularCalculo();
    }
  }, [
    showNovaRescisaoModal,
    formColaboradorId,
    formDataDemissao,
    formDataAviso,
    formMotivo,
    formTipoAviso,
    formSaldoFgts,
    formFeriasVencidas,
    formOutrasDeducoes
  ]);

  const handleSalvarRescisao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescisaoCalculada) return;

    try {
      dbService.salvarRescisao(rescisaoCalculada);
      setFeedbackMsg({ tipo: 'success', texto: `Rescisão de ${rescisaoCalculada.colaboradorNome} gravada com sucesso!` });
      setShowNovaRescisaoModal(false);
      carregarDados();
    } catch {
      setFeedbackMsg({ tipo: 'error', texto: 'Erro ao gravar rescisão contratual.' });
    }
  };

  const handleIntegrarContabil = (r: RescisaoContratual) => {
    const res = dbService.integrarRescisaoTrctContabil(r.id);
    if (res.sucesso) {
      setFeedbackMsg({ tipo: 'success', texto: res.mensagem });
      carregarDados();
    } else {
      setFeedbackMsg({ tipo: 'error', texto: res.mensagem });
    }
  };

  const formatMotivo = (m: MotivoRescisao) => {
    switch (m) {
      case 'SEM_JUSTA_CAUSA': return 'Dispensa sem Justa Causa pelo Empregador';
      case 'PEDIDO_DEMISSAO': return 'Pedido de Demissão pelo Empregado';
      case 'JUSTA_CAUSA': return 'Dispensa com Justa Causa (Art. 482 CLT)';
      case 'ACORDO_MUTUO': return 'Rescisão por Acordo Mútuo (Art. 484-A CLT)';
      case 'TERMINO_EXPERIENCIA': return 'Término de Contrato de Experiência';
      case 'RESCISAO_ANTECIPADA': return 'Rescisão Antecipada de Contrato a Termo';
      default: return m;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#141414] text-gray-200 overflow-hidden font-sans">
      {/* HEADER BAR */}
      <div className="bg-[#181818] border-b border-[#2a2a2a] px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-600/20 text-rose-400 rounded-lg border border-rose-500/30">
              <UserMinus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-gray-100">Rescisão Contratual & TRCT Oficial</h1>
                <span className="text-xs px-2 py-0.5 rounded bg-rose-950/60 text-rose-400 border border-rose-800/50">
                  Portaria MTE nº 1.057/2012
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-950/60 text-blue-400 border border-blue-800/50">
                  Lei 12.506/2011
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {empresa ? `${empresa.razaoSocial} • CNPJ: ${empresa.cnpj}` : 'Selecione uma empresa'} • Homologação, Quitação e Integração Contábil
              </p>
            </div>
          </div>
        </div>

        {/* CONTROLES DO TOPO */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => {
              if (selectedRescisao) setShowTrctModal(true);
            }}
            disabled={!selectedRescisao}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#242424] hover:bg-[#2e2e2e] disabled:opacity-50 text-gray-200 rounded border border-[#3a3a3a] transition"
            title="Emitir TRCT Termo de Rescisão do Contrato de Trabalho em A4"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            Imprimir TRCT A4
          </button>

          <button
            onClick={() => {
              if (selectedRescisao) setShowHomologacaoModal(true);
            }}
            disabled={!selectedRescisao}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#242424] hover:bg-[#2e2e2e] disabled:opacity-50 text-gray-200 rounded border border-[#3a3a3a] transition"
            title="Emitir Termos de Homologação e Quitação em A4"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Termo de Homologação A4
          </button>

          <button
            onClick={() => {
              handleSimularCalculo();
              setShowNovaRescisaoModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs bg-rose-600 hover:bg-rose-500 text-white font-medium rounded shadow transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Calcular Nova Rescisão
          </button>
        </div>
      </div>

      {/* FEEDBACK ALERT */}
      {feedbackMsg && (
        <div className={`px-6 py-2 text-xs flex items-center justify-between border-b ${
          feedbackMsg.tipo === 'success' 
            ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' 
            : 'bg-rose-950/40 border-rose-800 text-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            {feedbackMsg.tipo === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
            <span>{feedbackMsg.texto}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-gray-400 hover:text-white">✕</button>
        </div>
      )}

      {/* KPI DASHBOARD CARDS */}
      <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#2a2a2a] flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wider">Rescisões Processadas</div>
            <div className="text-base font-bold text-gray-100 font-mono mt-0.5">
              {totais.qtd} {totais.qtd === 1 ? 'Colaborador' : 'Colaboradores'}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">Termos homologados</div>
          </div>
          <div className="p-2 rounded bg-rose-950/40 text-rose-400 border border-rose-800/30">
            <UserMinus className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#2a2a2a] flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wider">Total Verbas Brutas</div>
            <div className="text-base font-bold text-amber-400 font-mono mt-0.5">
              R$ {totais.totalBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">Saldo, 13º, Férias e Aviso</div>
          </div>
          <div className="p-2 rounded bg-amber-950/40 text-amber-400 border border-amber-800/30">
            <Calculator className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#2a2a2a] flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wider">Encargos Retidos (INSS/IR)</div>
            <div className="text-base font-bold text-rose-400 font-mono mt-0.5">
              R$ {totais.totalDescontos.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">Deduções legais aplicadas</div>
          </div>
          <div className="p-2 rounded bg-rose-950/40 text-rose-400 border border-rose-800/30">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#2a2a2a] flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wider">Total Líquido Rescisório</div>
            <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
              R$ {totais.totalLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">Quitação aos colaboradores</div>
          </div>
          <div className="p-2 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/30">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#2a2a2a] flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wider">Multas FGTS (40%/20%)</div>
            <div className="text-base font-bold text-sky-400 font-mono mt-0.5">
              R$ {totais.totalMultasFgts.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">Guia GRRF gerada</div>
          </div>
          <div className="p-2 rounded bg-sky-950/40 text-sky-400 border border-sky-800/30">
            <Award className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* GRADE PRINCIPAL DE RESCISÕES */}
      <div className="flex-1 overflow-auto px-6 pb-6 space-y-4">
        <div className="bg-[#181818] rounded-lg border border-[#2a2a2a] overflow-hidden">
          <div className="px-4 py-3 bg-[#202020] border-b border-[#2a2a2a] flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-200 flex items-center gap-2">
              <FileText className="w-4 h-4 text-rose-400" />
              Relação de Rescisões Contratuais Homologadas
            </h3>
            <span className="text-[11px] text-gray-400">
              Clique em uma rescisão para selecionar e emitir o TRCT Oficial
            </span>
          </div>

          <table className="w-full text-xs text-left">
            <thead className="bg-[#242424] text-gray-400 border-b border-[#2a2a2a]">
              <tr>
                <th className="py-2.5 px-3">Colaborador</th>
                <th className="py-2.5 px-3">Cargo</th>
                <th className="py-2.5 px-3">Admissão</th>
                <th className="py-2.5 px-3">Demissão</th>
                <th className="py-2.5 px-3">Motivo da Rescisão</th>
                <th className="py-2.5 px-3 text-center">Aviso (Lei 12.506)</th>
                <th className="py-2.5 px-3 text-right">Bruto (R$)</th>
                <th className="py-2.5 px-3 text-right">Descontos (R$)</th>
                <th className="py-2.5 px-3 text-right">Líquido a Pagar</th>
                <th className="py-2.5 px-3 text-right">Multa FGTS</th>
                <th className="py-2.5 px-3 text-center">Contabilidade</th>
                <th className="py-2.5 px-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262626]">
              {rescisoes.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-gray-500">
                    Nenhuma rescisão contratual cadastrada até o momento. Clique em "+ Calcular Nova Rescisão".
                  </td>
                </tr>
              ) : (
                rescisoes.map((r) => {
                  const isSelected = selectedRescisao?.id === r.id;
                  return (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedRescisao(r)}
                      className={`cursor-pointer transition ${
                        isSelected ? 'bg-rose-950/20 border-l-2 border-rose-500' : 'hover:bg-[#1f1f1f]'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-semibold text-gray-100">
                        {r.colaboradorNome}
                      </td>
                      <td className="py-2.5 px-3 text-gray-300">
                        {r.cargo}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-gray-400">
                        {r.dataAdmissao.split('-').reverse().join('/')}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-gray-200 font-medium">
                        {r.dataDemissao.split('-').reverse().join('/')}
                      </td>
                      <td className="py-2.5 px-3 text-gray-300 text-[11px] max-w-xs truncate" title={formatMotivo(r.motivo)}>
                        {formatMotivo(r.motivo)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="font-mono px-2 py-0.5 rounded bg-blue-950/60 text-blue-400 border border-blue-800/40 text-[11px]">
                          {r.diasAvisoLei12506} dias ({r.tipoAviso})
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-amber-400">
                        R$ {r.totalProventosBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-rose-400">
                        R$ {r.totalDescontos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                        R$ {r.valorLiquidoRescisorio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-sky-400">
                        {r.valorMultaFgts > 0 ? `R$ ${r.valorMultaFgts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${r.aliquotaMultaFgts}%)` : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {r.statusIntegracaoContabil ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                            Lote #{r.loteContabilId || 'OK'}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-950/60 text-amber-400 border border-amber-800/40">
                            Pendente
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setSelectedRescisao(r);
                              setShowTrctModal(true);
                            }}
                            className="p-1 text-gray-400 hover:text-blue-400 rounded transition"
                            title="Visualizar e Imprimir TRCT A4"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {!r.statusIntegracaoContabil && (
                            <button
                              onClick={() => handleIntegrarContabil(r)}
                              className="p-1 text-gray-400 hover:text-emerald-400 rounded transition"
                              title="Integrar Rescisão no Diário Geral"
                            >
                              <Layers className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CALCULAR NOVA RESCISÃO */}
      {showNovaRescisaoModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1c1c1c] border border-[#333] rounded-lg w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-3.5 bg-[#222] border-b border-[#333] flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-100 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-rose-400" />
                Cálculo de Rescisão Trabalhista & Termo de Homologação (TRCT)
              </h3>
              <button onClick={() => setShowNovaRescisaoModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSalvarRescisao} className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* BLOCO 1: IDENTIFICAÇÃO DO COLABORADOR E DATAS */}
              <div className="p-3 bg-[#151515] rounded border border-[#2a2a2a] space-y-3">
                <div className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
                  <UserMinus className="w-3.5 h-3.5 text-rose-400" />
                  1. Dados do Contrato de Trabalho & Desligamento
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Colaborador *</label>
                    <select
                      value={formColaboradorId}
                      onChange={(e) => setFormColaboradorId(Number(e.target.value))}
                      className="w-full bg-[#202020] border border-[#333] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-rose-500"
                    >
                      {colaboradores.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.nome} - {c.cargo} (R$ {c.salarioBase.toFixed(2)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Data da Demissão (Afastamento) *</label>
                    <input
                      type="date"
                      required
                      value={formDataDemissao}
                      onChange={(e) => setFormDataDemissao(e.target.value)}
                      className="w-full bg-[#202020] border border-[#333] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Data da Notificação do Aviso Prévio</label>
                    <input
                      type="date"
                      required
                      value={formDataAviso}
                      onChange={(e) => setFormDataAviso(e.target.value)}
                      className="w-full bg-[#202020] border border-[#333] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Causa do Afastamento (Motivo) *</label>
                    <select
                      value={formMotivo}
                      onChange={(e) => setFormMotivo(e.target.value as any)}
                      className="w-full bg-[#202020] border border-[#333] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-rose-500"
                    >
                      <option value="SEM_JUSTA_CAUSA">Dispensa sem Justa Causa pelo Empregador</option>
                      <option value="PEDIDO_DEMISSAO">Pedido de Demissão pelo Empregado</option>
                      <option value="JUSTA_CAUSA">Dispensa com Justa Causa (Art. 482 CLT)</option>
                      <option value="ACORDO_MUTUO">Rescisão por Acordo Mútuo (Art. 484-A CLT)</option>
                      <option value="TERMINO_EXPERIENCIA">Término de Contrato de Experiência</option>
                      <option value="RESCISAO_ANTECIPADA">Rescisão Antecipada de Contrato</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Tipo de Aviso Prévio *</label>
                    <select
                      value={formTipoAviso}
                      onChange={(e) => setFormTipoAviso(e.target.value as any)}
                      className="w-full bg-[#202020] border border-[#333] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-rose-500"
                    >
                      <option value="TRABALHADO">Trabalhado</option>
                      <option value="INDENIZADO">Indenizado</option>
                      <option value="DISPENSADO">Dispensado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Saldo para Fins Rescisórios do FGTS (R$)</label>
                    <input
                      type="text"
                      value={formSaldoFgts}
                      onChange={(e) => setFormSaldoFgts(e.target.value)}
                      className="w-full bg-[#202020] border border-[#333] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-rose-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="chkFeriasVencidas"
                      checked={formFeriasVencidas}
                      onChange={(e) => setFormFeriasVencidas(e.target.checked)}
                      className="rounded bg-[#202020] border-[#333] text-rose-500 focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="chkFeriasVencidas" className="text-xs text-gray-300 cursor-pointer">
                      Possui Férias Vencidas (Período aquisitivo completo não gozado + 1/3)
                    </label>
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Outras Deduções / Vales / Adiantamentos (R$)</label>
                    <input
                      type="text"
                      value={formOutrasDeducoes}
                      onChange={(e) => setFormOutrasDeducoes(e.target.value)}
                      className="w-full bg-[#202020] border border-[#333] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-rose-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* BLOCO 2: PRÉVIA ANALÍTICA DO CÁLCULO TRCT */}
              {rescisaoCalculada && (
                <div className="p-4 bg-[#181818] rounded border border-[#2a2a2a] space-y-4">
                  <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-2">
                    <div className="text-xs font-bold text-gray-200 flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-emerald-400" />
                      2. Memória Analítica de Cálculo da Rescisão (TRCT Oficial)
                    </div>
                    <div className="text-xs font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                      Aviso Prévio Lei 12.506/11: {rescisaoCalculada.diasAvisoLei12506} dias
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* PROVENTOS */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                        Verbas Rescisórias (Proventos)
                      </div>
                      <div className="space-y-1.5 text-xs bg-[#202020] p-3 rounded border border-[#333]">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Saldo de Salário ({rescisaoCalculada.saldoSalarioDias} dias):</span>
                          <span className="font-mono text-gray-200">R$ {rescisaoCalculada.saldoSalarioValor.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">13º Salário Proporcional ({rescisaoCalculada.decimoTerceiroAvos}/12 avos):</span>
                          <span className="font-mono text-gray-200">R$ {rescisaoCalculada.decimoTerceiroValor.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Férias Proporcionais ({rescisaoCalculada.feriasProporcionaisAvos}/12 avos):</span>
                          <span className="font-mono text-gray-200">R$ {rescisaoCalculada.feriasProporcionaisValor.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">1/3 Constitucional s/ Férias Proporcionais:</span>
                          <span className="font-mono text-gray-200">R$ {rescisaoCalculada.tercoConstitucionalFeriasProp.toFixed(2)}</span>
                        </div>
                        {rescisaoCalculada.feriasVencidasValor > 0 && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Férias Vencidas:</span>
                              <span className="font-mono text-gray-200">R$ {rescisaoCalculada.feriasVencidasValor.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">1/3 Constitucional s/ Férias Vencidas:</span>
                              <span className="font-mono text-gray-200">R$ {rescisaoCalculada.tercoConstitucionalFeriasVenc.toFixed(2)}</span>
                            </div>
                          </>
                        )}
                        {rescisaoCalculada.avisoPrevioIndenizadoValor > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Aviso Prévio Indenizado:</span>
                            <span className="font-mono text-gray-200">R$ {rescisaoCalculada.avisoPrevioIndenizadoValor.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="pt-2 border-t border-[#333] flex justify-between font-bold text-emerald-400">
                          <span>Total Bruto das Verbas:</span>
                          <span className="font-mono">R$ {rescisaoCalculada.totalProventosBruto.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* DESCONTOS & TOTAIS */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                        Deduções & Resumo Final
                      </div>
                      <div className="space-y-1.5 text-xs bg-[#202020] p-3 rounded border border-[#333]">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Desconto INSS (Saldo Salário + 13º):</span>
                          <span className="font-mono text-rose-400">- R$ {rescisaoCalculada.inssRescisao.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Desconto IRRF Rescisório:</span>
                          <span className="font-mono text-rose-400">- R$ {rescisaoCalculada.irrfRescisao.toFixed(2)}</span>
                        </div>
                        {rescisaoCalculada.outrasDeducoes > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Outras Deduções / Vales:</span>
                            <span className="font-mono text-rose-400">- R$ {rescisaoCalculada.outrasDeducoes.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="pt-2 border-t border-[#333] flex justify-between font-bold text-rose-400">
                          <span>Total de Descontos:</span>
                          <span className="font-mono">- R$ {rescisaoCalculada.totalDescontos.toFixed(2)}</span>
                        </div>

                        <div className="pt-3 border-t border-[#333] flex justify-between font-bold text-base text-gray-100">
                          <span>VALOR LÍQUIDO A RECEBER:</span>
                          <span className="font-mono text-emerald-400">
                            R$ {rescisaoCalculada.valorLiquidoRescisorio.toFixed(2)}
                          </span>
                        </div>

                        {rescisaoCalculada.valorMultaFgts > 0 && (
                          <div className="mt-2 p-2 rounded bg-sky-950/40 border border-sky-800 text-[11px] flex justify-between text-sky-300">
                            <span>Multa Rescisória FGTS ({rescisaoCalculada.aliquotaMultaFgts}%):</span>
                            <span className="font-mono font-bold">R$ {rescisaoCalculada.valorMultaFgts.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-[#333] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNovaRescisaoModal(false)}
                  className="px-4 py-2 text-xs bg-[#2a2a2a] hover:bg-[#333] text-gray-300 rounded transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs bg-rose-600 hover:bg-rose-500 text-white font-medium rounded shadow transition"
                >
                  Gravar Rescisão & Gerar TRCT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL IMPRESSÃO TRCT OFICIAL (PORTARIA MTE 1.057/2012) */}
      {showTrctModal && selectedRescisao && empresa && (
        <ReportPrintPreviewModal
          isOpen={showTrctModal}
          onClose={() => setShowTrctModal(false)}
          empresa={empresa}
          tituloRelatorio="Termo de Rescisão do Contrato de Trabalho (TRCT)"
          subtitulo="Portaria MTE nº 1.057/2012 • Anexo I"
          periodo={`Afastamento em ${selectedRescisao.dataDemissao.split('-').reverse().join('/')}`}
        >
          <div className="space-y-4 text-black font-sans text-[10px]">
            {/* IDENTIFICAÇÃO DO EMPREGADOR */}
            <div className="border border-black p-2 space-y-1">
              <div className="font-bold text-xs uppercase">IDENTIFICAÇÃO DO EMPREGADOR</div>
              <div className="grid grid-cols-2 gap-2">
                <div>01 CNPJ/CEI: <span className="font-bold">{empresa.cnpj}</span></div>
                <div>02 Razão Social: <span className="font-bold">{empresa.razaoSocial}</span></div>
                <div>03 Endereço: {empresa.logradouro}, {empresa.numero} - {empresa.bairro}</div>
                <div>04 Município/UF/CEP: {empresa.cidade || 'São Paulo'}/{empresa.uf} - {empresa.cep}</div>
                <div>05 CNAE: {empresa.cnaePrincipal || '6201-5/00'}</div>
                <div>06 Natureza Jurídica: {empresa.naturezaJuridica || '206-2'}</div>
              </div>
            </div>

            {/* IDENTIFICAÇÃO DO TRABALHADOR */}
            <div className="border border-black p-2 space-y-1">
              <div className="font-bold text-xs uppercase">IDENTIFICAÇÃO DO TRABALHADOR</div>
              <div className="grid grid-cols-2 gap-2">
                <div>10 PIS/PASEP: <span className="font-mono">120.45900.88-1</span></div>
                <div>11 Nome: <span className="font-bold">{selectedRescisao.colaboradorNome}</span></div>
                <div>15 Data de Nascimento: 14/05/1992</div>
                <div>16 Cargo: <span className="font-bold">{selectedRescisao.cargo}</span></div>
                <div>17 CBO: 4110-10</div>
                <div>18 Remuneração Mês Anterior: R$ {selectedRescisao.salarioBase.toFixed(2)}</div>
              </div>
            </div>

            {/* DADOS DO CONTRATO */}
            <div className="border border-black p-2 space-y-1">
              <div className="font-bold text-xs uppercase">DADOS DO CONTRATO</div>
              <div className="grid grid-cols-2 gap-2">
                <div>20 Tipo de Contrato: 1 - Contrato por prazo indeterminado</div>
                <div>21 Causa do Afastamento: <span className="font-bold">{formatMotivo(selectedRescisao.motivo)}</span></div>
                <div>22 Remuneração para Fins Rescisórios: R$ {selectedRescisao.salarioBase.toFixed(2)}</div>
                <div>24 Data de Admissão: <span className="font-bold">{selectedRescisao.dataAdmissao.split('-').reverse().join('/')}</span></div>
                <div>25 Data do Aviso Prévio: {selectedRescisao.dataAvisoPrevio.split('-').reverse().join('/')} ({selectedRescisao.tipoAviso})</div>
                <div>26 Data de Afastamento: <span className="font-bold">{selectedRescisao.dataDemissao.split('-').reverse().join('/')}</span></div>
                <div>29 Dias de Aviso Prévio (Lei 12.506): <span className="font-bold">{selectedRescisao.diasAvisoLei12506} dias</span></div>
              </div>
            </div>

            {/* DISCRIMINAÇÃO DAS VERBAS RESCISÓRIAS */}
            <div className="border border-black p-2">
              <div className="font-bold text-xs uppercase mb-2">DISCRIMINAÇÃO DAS VERBAS RESCISÓRIAS</div>
              <table className="w-full border-collapse border border-black text-[9px]">
                <thead>
                  <tr className="bg-gray-100 border-b border-black">
                    <th className="border border-black p-1 text-left">Rubrica</th>
                    <th className="border border-black p-1 text-left">Descrição da Verba</th>
                    <th className="border border-black p-1 text-center">Ref.</th>
                    <th className="border border-black p-1 text-right">Valor Proventos (R$)</th>
                    <th className="border border-black p-1 text-right">Valor Descontos (R$)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-black">
                    <td className="border border-black p-1 font-mono">50</td>
                    <td className="border border-black p-1">Saldo de Salários</td>
                    <td className="border border-black p-1 text-center">{selectedRescisao.saldoSalarioDias}/30</td>
                    <td className="border border-black p-1 text-right font-mono">{selectedRescisao.saldoSalarioValor.toFixed(2)}</td>
                    <td className="border border-black p-1 text-right font-mono">-</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-1 font-mono">63</td>
                    <td className="border border-black p-1">13º Salário Proporcional</td>
                    <td className="border border-black p-1 text-center">{selectedRescisao.decimoTerceiroAvos}/12</td>
                    <td className="border border-black p-1 text-right font-mono">{selectedRescisao.decimoTerceiroValor.toFixed(2)}</td>
                    <td className="border border-black p-1 text-right font-mono">-</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-1 font-mono">65</td>
                    <td className="border border-black p-1">Férias Proporcionais</td>
                    <td className="border border-black p-1 text-center">{selectedRescisao.feriasProporcionaisAvos}/12</td>
                    <td className="border border-black p-1 text-right font-mono">{selectedRescisao.feriasProporcionaisValor.toFixed(2)}</td>
                    <td className="border border-black p-1 text-right font-mono">-</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-1 font-mono">68</td>
                    <td className="border border-black p-1">1/3 Constitucional de Férias Proporcionais</td>
                    <td className="border border-black p-1 text-center">33.33%</td>
                    <td className="border border-black p-1 text-right font-mono">{selectedRescisao.tercoConstitucionalFeriasProp.toFixed(2)}</td>
                    <td className="border border-black p-1 text-right font-mono">-</td>
                  </tr>
                  {selectedRescisao.feriasVencidasValor > 0 && (
                    <>
                      <tr className="border-b border-black">
                        <td className="border border-black p-1 font-mono">66</td>
                        <td className="border border-black p-1">Férias Vencidas</td>
                        <td className="border border-black p-1 text-center">30 dias</td>
                        <td className="border border-black p-1 text-right font-mono">{selectedRescisao.feriasVencidasValor.toFixed(2)}</td>
                        <td className="border border-black p-1 text-right font-mono">-</td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="border border-black p-1 font-mono">69</td>
                        <td className="border border-black p-1">1/3 Constitucional de Férias Vencidas</td>
                        <td className="border border-black p-1 text-center">33.33%</td>
                        <td className="border border-black p-1 text-right font-mono">{selectedRescisao.tercoConstitucionalFeriasVenc.toFixed(2)}</td>
                        <td className="border border-black p-1 text-right font-mono">-</td>
                      </tr>
                    </>
                  )}
                  {selectedRescisao.avisoPrevioIndenizadoValor > 0 && (
                    <tr className="border-b border-black">
                      <td className="border border-black p-1 font-mono">70</td>
                      <td className="border border-black p-1">Aviso Prévio Indenizado (Lei 12.506/2011)</td>
                      <td className="border border-black p-1 text-center">{selectedRescisao.diasAvisoLei12506}d</td>
                      <td className="border border-black p-1 text-right font-mono">{selectedRescisao.avisoPrevioIndenizadoValor.toFixed(2)}</td>
                      <td className="border border-black p-1 text-right font-mono">-</td>
                    </tr>
                  )}
                  <tr className="border-b border-black">
                    <td className="border border-black p-1 font-mono">100</td>
                    <td className="border border-black p-1">Previdência Social (INSS Rescisório)</td>
                    <td className="border border-black p-1 text-center">Oficial</td>
                    <td className="border border-black p-1 text-right font-mono">-</td>
                    <td className="border border-black p-1 text-right font-mono">{selectedRescisao.inssRescisao.toFixed(2)}</td>
                  </tr>
                  {selectedRescisao.irrfRescisao > 0 && (
                    <tr className="border-b border-black">
                      <td className="border border-black p-1 font-mono">101</td>
                      <td className="border border-black p-1">Imposto de Renda Retido na Fonte (IRRF)</td>
                      <td className="border border-black p-1 text-center">Oficial</td>
                      <td className="border border-black p-1 text-right font-mono">-</td>
                      <td className="border border-black p-1 text-right font-mono">{selectedRescisao.irrfRescisao.toFixed(2)}</td>
                    </tr>
                  )}
                  {selectedRescisao.outrasDeducoes > 0 && (
                    <tr className="border-b border-black">
                      <td className="border border-black p-1 font-mono">115</td>
                      <td className="border border-black p-1">Outros Descontos / Adiantamentos</td>
                      <td className="border border-black p-1 text-center">-</td>
                      <td className="border border-black p-1 text-right font-mono">-</td>
                      <td className="border border-black p-1 text-right font-mono">{selectedRescisao.outrasDeducoes.toFixed(2)}</td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 font-bold border-t border-black">
                    <td colSpan={3} className="border border-black p-1 text-right uppercase">Totais:</td>
                    <td className="border border-black p-1 text-right font-mono">
                      R$ {selectedRescisao.totalProventosBruto.toFixed(2)}
                    </td>
                    <td className="border border-black p-1 text-right font-mono">
                      R$ {selectedRescisao.totalDescontos.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>

              <div className="mt-3 p-2 border border-black bg-gray-50 flex justify-between items-center text-xs font-bold">
                <span>VALOR LÍQUIDO EFETIVO (Campo 150):</span>
                <span className="font-mono text-sm">R$ {selectedRescisao.valorLiquidoRescisorio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* QUITAÇÃO E ASSINATURAS */}
            <div className="border border-black p-3 space-y-6">
              <div className="text-justify leading-relaxed">
                Foi efetuada a quitação das verbas rescisórias acima discriminadas, dando o empregado plena, 
                geral e irrevogável quitação quanto aos valores especificados, nos termos da Lei e da CLT.
              </div>
              <div className="grid grid-cols-2 gap-8 pt-4">
                <div className="text-center border-t border-black pt-1">
                  <div className="font-bold">{empresa.razaoSocial}</div>
                  <div>Empregador (CNPJ: {empresa.cnpj})</div>
                </div>
                <div className="text-center border-t border-black pt-1">
                  <div className="font-bold">{selectedRescisao.colaboradorNome}</div>
                  <div>Empregado / Trabalhador</div>
                </div>
              </div>
            </div>
          </div>
        </ReportPrintPreviewModal>
      )}

      {/* MODAL IMPRESSÃO TERMO DE HOMOLOGAÇÃO (ANEXO I) */}
      {showHomologacaoModal && selectedRescisao && empresa && (
        <ReportPrintPreviewModal
          isOpen={showHomologacaoModal}
          onClose={() => setShowHomologacaoModal(false)}
          empresa={empresa}
          tituloRelatorio="Termo de Homologação de Rescisão de Contrato de Trabalho"
          subtitulo="Portaria MTE nº 1.057/2012 • Anexo I"
          periodo={`Rescisão homologada em ${selectedRescisao.dataDemissao.split('-').reverse().join('/')}`}
        >
          <div className="space-y-6 text-black font-sans text-xs">
            <div className="border border-black p-3 space-y-1">
              <div className="font-bold text-sm uppercase">{empresa.razaoSocial}</div>
              <div>CNPJ: {empresa.cnpj} • Endereço: {empresa.logradouro}, {empresa.numero}</div>
              <div>Colaborador: <span className="font-bold">{selectedRescisao.colaboradorNome}</span> • Cargo: {selectedRescisao.cargo}</div>
              <div>Data de Afastamento: {selectedRescisao.dataDemissao.split('-').reverse().join('/')} • Causa: {formatMotivo(selectedRescisao.motivo)}</div>
            </div>

            <div className="border border-black p-4 space-y-4">
              <div className="font-bold uppercase text-xs">DECLARAÇÃO DE HOMOLOGAÇÃO SINDICAL / MTE</div>
              <p className="text-justify leading-relaxed">
                Nos termos do Artigo 477 da Consolidação das Leis do Trabalho (CLT), foram prestadas 
                todas as orientações às partes sobre os direitos decorrentes da extinção do contrato de trabalho, 
                tendo sido conferidos os cálculos das verbas rescisórias constantes do TRCT, totalizando o valor 
                líquido de <span className="font-bold font-mono">R$ {selectedRescisao.valorLiquidoRescisorio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>, 
                devidamente creditado em conta bancária do trabalhador.
              </p>

              <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 border border-black text-[11px]">
                <div>Multa Rescisória FGTS ({selectedRescisao.aliquotaMultaFgts}%): <span className="font-bold font-mono">R$ {selectedRescisao.valorMultaFgts.toFixed(2)}</span></div>
                <div>Chave de Conectividade Social: <span className="font-bold font-mono">9988776655443321</span></div>
                <div>Código de Saque FGTS: <span className="font-bold">01 (Despedida sem justa causa)</span></div>
                <div>Requerimento Seguro-Desemprego: <span className="font-bold font-mono">7766554433</span></div>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-12">
                <div className="text-center border-t border-black pt-1 text-[10px]">
                  <div className="font-bold">{empresa.razaoSocial}</div>
                  <div>Empregador</div>
                </div>
                <div className="text-center border-t border-black pt-1 text-[10px]">
                  <div className="font-bold">{selectedRescisao.colaboradorNome}</div>
                  <div>Trabalhador</div>
                </div>
                <div className="text-center border-t border-black pt-1 text-[10px]">
                  <div className="font-bold">Homologador Autorizado</div>
                  <div>Entidade Sindical / MTE</div>
                </div>
              </div>
            </div>
          </div>
        </ReportPrintPreviewModal>
      )}
    </div>
  );
};
