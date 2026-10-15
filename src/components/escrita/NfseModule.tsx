import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  Plus, 
  Printer, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  Calendar, 
  Eye, 
  Ban, 
  Send, 
  FileCode,
  QrCode,
  Check,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import { NfseEmissao, Empresa, ParticipanteFiscal } from '../../types/contabil';
import { ReportPrintPreviewModal } from '../layout/ReportPrintPreviewModal';

export const NfseModule: React.FC = () => {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [competencia, setCompetencia] = useState<string>('2026-10');
  const [notas, setNotas] = useState<NfseEmissao[]>([]);
  const [participantes, setParticipantes] = useState<ParticipanteFiscal[]>([]);
  const [notaSelecionada, setNotaSelecionada] = useState<NfseEmissao | null>(null);

  // Modais
  const [showEmissaoModal, setShowEmissaoModal] = useState(false);
  const [showDanfseModal, setShowDanfseModal] = useState(false);
  const [showXmlModal, setShowXmlModal] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  // Form Emissão
  const [tomadorId, setTomadorId] = useState<number | undefined>(undefined);
  const [tomadorNome, setTomadorNome] = useState('');
  const [tomadorCnpj, setTomadorCnpj] = useState('');
  const [tomadorEmail, setTomadorEmail] = useState('');
  const [tomadorCidade, setTomadorCidade] = useState('São Paulo');
  const [tomadorUf, setTomadorUf] = useState('SP');
  const [itemLc116, setItemLc116] = useState('17.19 - Contabilidade, consultoria tributária e auditoria');
  const [discriminacao, setDiscriminacao] = useState('Honorários profissionais contábeis, escrituração fiscal e assessoria trabalhista.');
  const [valorServicos, setValorServicos] = useState<number>(5000);
  const [aliquotaISS, setAliquotaISS] = useState<number>(5.0);
  const [reterIRRF, setReterIRRF] = useState(true);
  const [reterCSRF, setReterCSRF] = useState(true);

  const carregarDados = () => {
    const emp = dbService.getActiveEmpresa();
    setEmpresa(emp);
    if (emp) {
      setNotas(dbService.getNfseEmitidas(emp.id, competencia));
      setParticipantes(dbService.getParticipantes(emp.id));
    }
  };

  useEffect(() => {
    carregarDados();
  }, [competencia]);

  const handleSelecionarParticipante = (id: number) => {
    const p = participantes.find(item => item.id === id);
    if (p) {
      setTomadorId(p.id);
      setTomadorNome(p.nomeRazaoSocial);
      setTomadorCnpj(p.cnpjCpf);
      setTomadorCidade(p.municipio || 'São Paulo');
      setTomadorUf(p.uf || 'SP');
      setTomadorEmail(p.email || '');
    }
  };

  const handleEmitirNfse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresa || !tomadorNome.trim() || !tomadorCnpj.trim() || valorServicos <= 0) return;

    const retIR = reterIRRF ? Math.round((valorServicos * 0.015) * 100) / 100 : 0;
    const retPIS = reterCSRF ? Math.round((valorServicos * 0.0065) * 100) / 100 : 0;
    const retCOF = reterCSRF ? Math.round((valorServicos * 0.030) * 100) / 100 : 0;
    const retCSL = reterCSRF ? Math.round((valorServicos * 0.010) * 100) / 100 : 0;

    const novaNfse = dbService.emitirNfseDPS(empresa.id, {
      competencia,
      tomadorId,
      tomadorRazaoSocial: tomadorNome.trim(),
      tomadorCnpjCpf: tomadorCnpj.trim(),
      tomadorEmail,
      tomadorCidade,
      tomadorUf,
      itemLc116,
      discriminacaoServico: discriminacao,
      valorServicos,
      aliquotaISS,
      retencaoIRRF: retIR,
      retencaoPIS: retPIS,
      retencaoCOFINS: retCOF,
      retencaoCSLL: retCSL
    });

    setShowEmissaoModal(false);
    carregarDados();
    setFeedbackMsg({ 
      tipo: 'success', 
      texto: `NFS-e Nº ${novaNfse.numeroNfse} autorizada com sucesso! DPS transmitida ao Padrão Nacional.` 
    });
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  const handleIntegrarFiscalContabil = (id: number) => {
    const res = dbService.integrarNfseFiscalContabil(id);
    if (res.success) {
      carregarDados();
      setFeedbackMsg({ 
        tipo: 'success', 
        texto: `NFS-e escriturada na Escrita Fiscal e contabilizada no Lote #${res.loteId} com sucesso!` 
      });
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  const handleCancelar = (id: number) => {
    if (confirm('Deseja realmente cancelar esta NFS-e perante a Administração Tributária?')) {
      dbService.cancelarNfse(id, 'Cancelamento solicitado pelo emitente por erro de emissão');
      carregarDados();
      setFeedbackMsg({ tipo: 'success', texto: 'NFS-e cancelada com sucesso.' });
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const totalFaturado = notas.filter(n => n.status === 'EMITIDA').reduce((sum, n) => sum + n.valorServicos, 0);
  const totalISS = notas.filter(n => n.status === 'EMITIDA').reduce((sum, n) => sum + n.valorISS, 0);
  const totalRetencoes = notas.filter(n => n.status === 'EMITIDA').reduce((sum, n) => sum + n.valorTotalRetencoes, 0);
  const totalLiquido = notas.filter(n => n.status === 'EMITIDA').reduce((sum, n) => sum + n.valorLiquidoNfse, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#181818] p-5 rounded-lg border border-[#282828]">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-white">Central de Emissão e Faturamento NFS-e</h1>
              <span className="px-2 py-0.5 text-xs font-mono bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                Padrão Nacional / ABRASF
              </span>
            </div>
            <p className="text-sm text-gray-400">
              Emissão de Declaração de Prestação de Serviços (DPS), autorização, emissão de DANFSE A4 e integração fiscal/contábil.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#202020] px-3 py-1.5 rounded-lg border border-[#333]">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-gray-400">Competência:</span>
            <input
              type="month"
              value={competencia}
              onChange={(e) => setCompetencia(e.target.value)}
              className="bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => setShowEmissaoModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Emitir Nova NFS-e</span>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#181818] p-4 rounded-lg border border-[#282828]">
          <span className="text-xs text-gray-400 uppercase font-mono">Faturamento Bruto de Serviços</span>
          <div className="text-xl font-bold font-mono text-white mt-1">
            R$ {totalFaturado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {notas.filter(n => n.status === 'EMITIDA').length} notas autorizadas
          </div>
        </div>

        <div className="bg-[#181818] p-4 rounded-lg border border-[#282828]">
          <span className="text-xs text-gray-400 uppercase font-mono">ISSQN Próprio Apurado</span>
          <div className="text-xl font-bold font-mono text-amber-400 mt-1">
            R$ {totalISS.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Alíquota média municipal de 5%
          </div>
        </div>

        <div className="bg-[#181818] p-4 rounded-lg border border-[#282828]">
          <span className="text-xs text-gray-400 uppercase font-mono">Retenções Federais na Fonte</span>
          <div className="text-xl font-bold font-mono text-purple-400 mt-1">
            R$ {totalRetencoes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            IRRF (1,5%) e CSRF (4,65%)
          </div>
        </div>

        <div className="bg-[#181818] p-4 rounded-lg border border-[#282828]">
          <span className="text-xs text-gray-400 uppercase font-mono">Valor Líquido a Receber</span>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
            R$ {totalLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Disponibilidade financeira
          </div>
        </div>
      </div>

      {/* Grid de Notas Emitidas */}
      <div className="bg-[#181818] rounded-lg border border-[#282828] overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#202020] text-gray-400 text-xs font-mono uppercase border-b border-[#282828]">
            <tr>
              <th className="py-3 px-4">Número NFS-e / DPS</th>
              <th className="py-3 px-4">Emissão</th>
              <th className="py-3 px-4">Tomador do Serviço</th>
              <th className="py-3 px-4 text-right">Valor Bruto</th>
              <th className="py-3 px-4 text-right">ISS Próprio</th>
              <th className="py-3 px-4 text-right">Retenções</th>
              <th className="py-3 px-4 text-right">Valor Líquido</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#282828]">
            {notas.map((nota) => (
              <tr key={nota.id} className="hover:bg-[#202020]/50 transition-colors">
                <td className="py-3 px-4">
                  <div className="font-mono font-bold text-white text-xs">{nota.numeroNfse || `DPS #${nota.numeroDPS}`}</div>
                  <div className="font-mono text-gray-500 text-[11px]">DPS Série {nota.serieDPS}</div>
                </td>
                <td className="py-3 px-4 font-mono text-xs text-gray-300">
                  {nota.dataEmissao.split(' ')[0]}
                </td>
                <td className="py-3 px-4">
                  <div className="text-gray-200 font-medium text-xs">{nota.tomadorRazaoSocial}</div>
                  <div className="text-gray-500 font-mono text-[11px]">{nota.tomadorCnpjCpf}</div>
                </td>
                <td className="py-3 px-4 text-right font-mono font-semibold text-white">
                  R$ {nota.valorServicos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4 text-right font-mono text-amber-400 text-xs">
                  R$ {nota.valorISS.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4 text-right font-mono text-purple-400 text-xs">
                  R$ {nota.valorTotalRetencoes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                  R$ {nota.valorLiquidoNfse.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                    nota.status === 'EMITIDA' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {nota.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => { setNotaSelecionada(nota); setShowDanfseModal(true); }}
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-[#252525] rounded transition-colors"
                      title="Imprimir DANFSE A4"
                    >
                      <Printer className="w-4 h-4 text-emerald-400" />
                    </button>

                    <button
                      onClick={() => { setNotaSelecionada(nota); setShowXmlModal(true); }}
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-[#252525] rounded transition-colors"
                      title="Ver XML DPS Nacional"
                    >
                      <FileCode className="w-4 h-4 text-blue-400" />
                    </button>

                    <button
                      onClick={() => handleIntegrarFiscalContabil(nota.id)}
                      disabled={nota.integradaFiscal && nota.integradaContabil}
                      className={`p-1.5 rounded transition-colors ${
                        nota.integradaFiscal && nota.integradaContabil 
                          ? 'text-emerald-500/40 cursor-default' 
                          : 'text-gray-400 hover:text-emerald-400 hover:bg-[#252525]'
                      }`}
                      title={nota.integradaFiscal ? 'Já Integrada' : 'Integrar Fiscal e Contábil'}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>

                    {nota.status === 'EMITIDA' && (
                      <button
                        onClick={() => handleCancelar(nota.id)}
                        className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-[#252525] rounded transition-colors"
                        title="Cancelar NFS-e"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {notas.length === 0 && (
              <tr>
                <td colSpan={9} className="py-8 text-center text-gray-500 text-sm">
                  Nenhuma NFS-e emitida para a competência {competencia}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Emissão de NFS-e */}
      {showEmissaoModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1c1c1c] border border-[#333] rounded-lg max-w-xl w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#282828] pb-3">
              <h3 className="text-base font-semibold text-white">Emitir NFS-e Nacional / DPS</h3>
              <button onClick={() => setShowEmissaoModal(false)} className="text-gray-400 hover:text-white">&times;</button>
            </div>

            <form onSubmit={handleEmitirNfse} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Selecionar Tomador Cadastrado (Opcional)</label>
                <select
                  value={tomadorId || ''}
                  onChange={(e) => handleSelecionarParticipante(Number(e.target.value))}
                  className="w-full bg-[#141414] border border-[#333] rounded px-3 py-2 text-white"
                >
                  <option value="">Digitar dados manualmente...</option>
                  {participantes.map((p) => (
                    <option key={p.id} value={p.id}>{p.nomeRazaoSocial} ({p.cnpjCpf})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Razão Social do Tomador</label>
                  <input
                    type="text"
                    value={tomadorNome}
                    onChange={(e) => setTomadorNome(e.target.value)}
                    placeholder="Nome completo do cliente"
                    className="w-full bg-[#141414] border border-[#333] rounded px-3 py-2 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">CNPJ / CPF</label>
                  <input
                    type="text"
                    value={tomadorCnpj}
                    onChange={(e) => setTomadorCnpj(e.target.value)}
                    placeholder="00.000.000/0000-00"
                    className="w-full bg-[#141414] border border-[#333] rounded px-3 py-2 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Item da LC 116/2003</label>
                <input
                  type="text"
                  value={itemLc116}
                  onChange={(e) => setItemLc116(e.target.value)}
                  className="w-full bg-[#141414] border border-[#333] rounded px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Discriminação dos Serviços Prestados</label>
                <textarea
                  value={discriminacao}
                  onChange={(e) => setDiscriminacao(e.target.value)}
                  rows={3}
                  className="w-full bg-[#141414] border border-[#333] rounded px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Valor Total dos Serviços (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={valorServicos || ''}
                    onChange={(e) => setValorServicos(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#141414] border border-[#333] rounded px-3 py-2 text-white font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Alíquota ISSQN (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={aliquotaISS}
                    onChange={(e) => setAliquotaISS(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#141414] border border-[#333] rounded px-3 py-2 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="bg-[#202020] p-3 rounded border border-[#333] flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                  <input
                    type="checkbox"
                    checked={reterIRRF}
                    onChange={(e) => setReterIRRF(e.target.checked)}
                    className="rounded bg-[#141414] border-[#444] text-emerald-500"
                  />
                  <span>Reter IRRF 1,5% (PJ Tomadora)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                  <input
                    type="checkbox"
                    checked={reterCSRF}
                    onChange={(e) => setReterCSRF(e.target.checked)}
                    className="rounded bg-[#141414] border-[#444] text-emerald-500"
                  />
                  <span>Reter CSRF 4,65% (PIS/COFINS/CSLL)</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#282828]">
                <button
                  type="button"
                  onClick={() => setShowEmissaoModal(false)}
                  className="px-4 py-2 bg-[#252525] hover:bg-[#303030] text-gray-300 rounded text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold"
                >
                  Emitir e Transmitir DPS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Visualizador de XML DPS */}
      {showXmlModal && notaSelecionada && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1c1c1c] border border-[#333] rounded-lg max-w-3xl w-full flex flex-col max-h-[85vh] shadow-2xl">
            <div className="p-4 border-b border-[#282828] flex items-center justify-between">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <FileCode className="w-5 h-5 text-emerald-400" />
                <span>XML da DPS / NFS-e Nº {notaSelecionada.numeroNfse}</span>
              </h3>
              <button onClick={() => setShowXmlModal(false)} className="text-gray-400 hover:text-white text-lg">&times;</button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 font-mono text-xs bg-[#121212] text-gray-300 leading-relaxed select-all">
              <pre className="whitespace-pre-wrap">{notaSelecionada.xmlNfse}</pre>
            </div>
          </div>
        </div>
      )}

      {showDanfseModal && notaSelecionada && empresa && (
        <ReportPrintPreviewModal
          isOpen={showDanfseModal}
          onClose={() => setShowDanfseModal(false)}
          empresa={empresa}
          tituloRelatorio={`DANFSE - Documento Auxiliar da NFS-e Nº ${notaSelecionada.numeroNfse}`}
          subtitulo="Padrão Nacional de Nota Fiscal de Serviços Eletrônica"
          periodo={competencia}
          orientacaoPadrao="portrait"
        >
          <div className="p-8 text-black bg-white font-sans text-xs space-y-4">
            <div className="border-2 border-black p-3 flex justify-between items-center">
              <div>
                <h1 className="text-sm font-bold uppercase">{empresa.razaoSocial}</h1>
                <p>CNPJ: {empresa.cnpj} | Inscrição Municipal: {empresa.inscricaoMunicipal || '998877-1'}</p>
                <p>{empresa.logradouro}, {empresa.numero} - {empresa.cidade}/{empresa.uf}</p>
              </div>
              <div className="text-right">
                <div className="border border-black p-2 bg-gray-50 text-center">
                  <span className="font-bold text-xs uppercase block">NFS-e NACIONAL</span>
                  <span className="font-mono font-bold text-sm block">Nº {notaSelecionada.numeroNfse}</span>
                  <span className="text-[10px] text-gray-600 block">Cód: {notaSelecionada.codigoVerificacao}</span>
                </div>
              </div>
            </div>

            <div className="border border-black p-3 space-y-1">
              <span className="font-bold text-xs uppercase block bg-gray-100 p-1 border-b border-black">TOMADOR DO SERVIÇO</span>
              <p className="font-bold text-sm mt-1">{notaSelecionada.tomadorRazaoSocial}</p>
              <p>CNPJ/CPF: {notaSelecionada.tomadorCnpjCpf}</p>
              <p>Endereço: {notaSelecionada.tomadorEndereco || 'Av. Paulista, 1000'} - {notaSelecionada.tomadorCidade}/{notaSelecionada.tomadorUf}</p>
              <p>E-mail: {notaSelecionada.tomadorEmail || 'financeiro@cliente.com.br'}</p>
            </div>

            <div className="border border-black p-3 space-y-2">
              <span className="font-bold text-xs uppercase block bg-gray-100 p-1 border-b border-black">DISCRIMINAÇÃO DOS SERVIÇOS</span>
              <p className="whitespace-pre-wrap leading-relaxed py-2">{notaSelecionada.discriminacaoServico}</p>
              <div className="text-[11px] text-gray-700 border-t border-gray-300 pt-1">
                <strong>Item da Lista de Serviços (LC 116/03):</strong> {notaSelecionada.itemLc116}
              </div>
            </div>

            <div className="border border-black p-3">
              <span className="font-bold text-xs uppercase block bg-gray-100 p-1 border-b border-black mb-2">RETENÇÕES FEDERAIS & TRIBUTOS</span>
              <div className="grid grid-cols-5 gap-2 text-center font-mono">
                <div className="border border-gray-300 p-1.5">
                  <span className="text-[10px] block font-sans">IRRF (1,5%)</span>
                  <span className="font-bold">R$ {notaSelecionada.retencaoIRRF.toFixed(2)}</span>
                </div>
                <div className="border border-gray-300 p-1.5">
                  <span className="text-[10px] block font-sans">PIS (0,65%)</span>
                  <span className="font-bold">R$ {notaSelecionada.retencaoPIS.toFixed(2)}</span>
                </div>
                <div className="border border-gray-300 p-1.5">
                  <span className="text-[10px] block font-sans">COFINS (3%)</span>
                  <span className="font-bold">R$ {notaSelecionada.retencaoCOFINS.toFixed(2)}</span>
                </div>
                <div className="border border-gray-300 p-1.5">
                  <span className="text-[10px] block font-sans">CSLL (1%)</span>
                  <span className="font-bold">R$ {notaSelecionada.retencaoCSLL.toFixed(2)}</span>
                </div>
                <div className="border border-gray-300 p-1.5 bg-gray-100">
                  <span className="text-[10px] block font-sans font-bold">TOTAL RETENÇÕES</span>
                  <span className="font-bold">R$ {notaSelecionada.valorTotalRetencoes.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="border-2 border-black p-3 bg-gray-50 flex justify-between items-center font-mono text-sm">
              <div>
                <span className="font-sans text-xs text-gray-700 block">VALOR TOTAL DOS SERVIÇOS:</span>
                <span className="font-bold text-base">R$ {notaSelecionada.valorServicos.toFixed(2)}</span>
              </div>
              <div className="text-center">
                <span className="font-sans text-xs text-gray-700 block">ISS CALCULADO ({notaSelecionada.aliquotaISS}%):</span>
                <span className="font-bold">R$ {notaSelecionada.valorISS.toFixed(2)}</span>
              </div>
              <div className="text-right">
                <span className="font-sans text-xs text-gray-700 block">VALOR LÍQUIDO A RECEBER:</span>
                <span className="font-bold text-base text-emerald-800">R$ {notaSelecionada.valorLiquidoNfse.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-[10px] text-gray-500 text-center border-t border-gray-300 pt-2">
              Documento emitido por ME ou EPP optante pelo Simples Nacional ou Lucro Presumido/Real. Não gera direito a crédito fiscal de IPI.
            </div>
          </div>
        </ReportPrintPreviewModal>
      )}
    </div>
  );
};
