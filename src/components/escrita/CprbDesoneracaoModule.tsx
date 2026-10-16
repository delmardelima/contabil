import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  FileText,
  DollarSign,
  TrendingDown,
  Printer,
  Plus,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Building,
  Calendar,
  Layers,
  Send,
  Database,
  Search,
  ExternalLink,
  Percent,
  X,
  CreditCard,
  Scale
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import { ApuracaoCprbCompetencia, ResumoCprb, AjusteCprbReinf } from '../../types/contabil';

export const CprbDesoneracaoModule: React.FC = () => {
  const [resumo, setResumo] = useState<ResumoCprb | null>(null);
  const [selectedApuracao, setSelectedApuracao] = useState<ApuracaoCprbCompetencia | null>(null);
  const [activeTab, setActiveTab] = useState<'apuracoes' | 'ajustes' | 'reinf' | 'comparativo'>('apuracoes');
  const [filtroCompetencia, setFiltroCompetencia] = useState('');
  const [modalDarf, setModalDarf] = useState(false);
  const [modalNovoAjuste, setModalNovoAjuste] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  // Form novo ajuste
  const [novoAjusteTipo, setNovoAjusteTipo] = useState<'REDUCAO' | 'ACRESCIMO'>('REDUCAO');
  const [novoAjusteOrigem, setNovoAjusteOrigem] = useState<'01_ACAO_JUDICIAL' | '02_PROCESSO_ADMINISTRATIVO'>('01_ACAO_JUDICIAL');
  const [novoAjusteProcesso, setNovoAjusteProcesso] = useState('');
  const [novoAjusteDesc, setNovoAjusteDesc] = useState('');
  const [novoAjusteValor, setNovoAjusteValor] = useState('');

  const carregarDados = () => {
    try {
      const data = dbService.getApuracaoCprb();
      setResumo(data);
      if (data.apuracoes.length > 0) {
        if (!selectedApuracao || !data.apuracoes.some(a => a.id === selectedApuracao.id)) {
          setSelectedApuracao(data.apuracoes[0]);
        } else {
          const atual = data.apuracoes.find(a => a.id === selectedApuracao.id);
          if (atual) setSelectedApuracao(atual);
        }
      }
    } catch (e: any) {
      setMensagemErro('Erro ao carregar dados da CPRB: ' + e.message);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleTransmitirReinf = (id: string) => {
    const res = dbService.transmitirEventoReinf2060(id);
    if (res.sucesso) {
      setMensagemSucesso(res.mensagem);
      carregarDados();
    } else {
      setMensagemErro(res.mensagem);
    }
  };

  const handleIntegrarContabilidade = (id: string) => {
    const res = dbService.integrarCprbContabil(id);
    if (res.sucesso) {
      setMensagemSucesso(res.mensagem);
      carregarDados();
    } else {
      setMensagemErro(res.mensagem);
    }
  };

  const handleAdicionarAjuste = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApuracao) return;

    const vlr = parseFloat(novoAjusteValor);
    if (isNaN(vlr) || vlr <= 0) {
      setMensagemErro('Informe um valor de ajuste válido maior que zero.');
      return;
    }

    const novoAjuste: AjusteCprbReinf = {
      id: `ajuste-${Date.now()}`,
      tipoAjuste: novoAjusteTipo,
      origemAjuste: novoAjusteOrigem,
      numeroProcesso: novoAjusteProcesso || 'S/N',
      codigoAjuste: novoAjusteOrigem === '01_ACAO_JUDICIAL' ? '01' : '02',
      descricaoAjuste: novoAjusteDesc || 'Ajuste fiscal da base CPRB',
      valorAjusteBRL: vlr
    };

    const novosAjustes = [...selectedApuracao.ajustes, novoAjuste];
    const totalReducao = novosAjustes.filter(a => a.tipoAjuste === 'REDUCAO').reduce((acc, a) => acc + a.valorAjusteBRL, 0);
    const totalAcrescimo = novosAjustes.filter(a => a.tipoAjuste === 'ACRESCIMO').reduce((acc, a) => acc + a.valorAjusteBRL, 0);
    const valorLiquido = Math.max(0, selectedApuracao.valorCprbApuradoBRL + totalAcrescimo - totalReducao);

    const apuracaoAtualizada: ApuracaoCprbCompetencia = {
      ...selectedApuracao,
      ajustes: novosAjustes,
      totalAjustesAcrescimoBRL: totalAcrescimo,
      totalAjustesReducaoBRL: totalReducao,
      valorCprbLiquidoRecolherBRL: valorLiquido
    };

    dbService.salvarApuracaoCprb(apuracaoAtualizada);
    setSelectedApuracao(apuracaoAtualizada);
    setModalNovoAjuste(false);
    setNovoAjusteDesc('');
    setNovoAjusteProcesso('');
    setNovoAjusteValor('');
    setMensagemSucesso('Ajuste de CPRB inserido com sucesso na apuração.');
    carregarDados();
  };

  const apuracaoAtual = selectedApuracao || (resumo && resumo.apuracoes[0]) || null;

  // Cálculo hipotético de economia vs INSS Folha 20%
  // Supondo folha de salários correspondente a 40% da receita bruta
  const folhaSalariosEstimada = apuracaoAtual ? apuracaoAtual.receitaBrutaTotalBRL * 0.40 : 0;
  const inssFolha20 = folhaSalariosEstimada * 0.20;
  const cprbDevida = apuracaoAtual?.valorCprbLiquidoRecolherBRL || 0;
  const economiaDesoneracao = inssFolha20 - cprbDevida;

  return (
    <div className="flex flex-col h-full bg-[#121212] text-gray-100 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#1a1a1a] border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-600/20 text-emerald-400 rounded-lg border border-emerald-500/30">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-white">CPRB - Desoneração da Folha de Pagamento</h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-900/40 text-emerald-300 border border-emerald-800">
                Lei nº 12.546/2011 & Lei 14.973/2024
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-900/40 text-blue-300 border border-blue-800">
                Evento R-2060 EFD-Reinf
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-purple-900/40 text-purple-300 border border-purple-800">
                DARF 2985
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Contribuição Previdenciária sobre a Receita Bruta, Deduções de Exportação, Ajustes R-2060 e Apuração de DARF
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => carregarDados()}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-gray-800 hover:bg-gray-700 text-gray-200 rounded border border-gray-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Atualizar</span>
          </button>
          {apuracaoAtual && (
            <>
              <button
                onClick={() => handleTransmitirReinf(apuracaoAtual.id)}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded transition shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Transmitir R-2060</span>
              </button>
              <button
                onClick={() => handleIntegrarContabilidade(apuracaoAtual.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded transition shadow-sm ${
                  apuracaoAtual.integradoContabil
                    ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700 cursor-default'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>{apuracaoAtual.integradoContabil ? 'Contabilizado' : 'Integrar Diário'}</span>
              </button>
              <button
                onClick={() => setModalDarf(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-purple-600 hover:bg-purple-500 text-white rounded transition shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Emitir DARF 2985 A4</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Alerts */}
      {mensagemSucesso && (
        <div className="mx-6 mt-4 p-3 bg-emerald-950/60 border border-emerald-800 rounded-lg flex items-center justify-between text-emerald-200 text-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{mensagemSucesso}</span>
          </div>
          <button onClick={() => setMensagemSucesso(null)} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {mensagemErro && (
        <div className="mx-6 mt-4 p-3 bg-rose-950/60 border border-rose-800 rounded-lg flex items-center justify-between text-rose-200 text-xs">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{mensagemErro}</span>
          </div>
          <button onClick={() => setMensagemErro(null)} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 px-6 py-4">
        <div className="p-4 bg-[#1a1a1a] rounded-xl border border-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Receita Bruta Total</span>
            <DollarSign className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight">
            R$ {(apuracaoAtual?.receitaBrutaTotalBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">Faturamento bruto da competência</div>
        </div>

        <div className="p-4 bg-[#1a1a1a] rounded-xl border border-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Deduções & Exportações</span>
            <TrendingDown className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 tracking-tight">
            R$ {((apuracaoAtual?.deducaoExportacoesDiretasBRL || 0) + (apuracaoAtual?.deducaoVendasCanceladasDescontosBRL || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-1">Exportação Direta + Cancelamentos</div>
        </div>

        <div className="p-4 bg-[#1a1a1a] rounded-xl border border-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Base de Cálculo CPRB</span>
            <Briefcase className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight">
            R$ {(apuracaoAtual?.baseCalculoCprbBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-indigo-400/80 mt-1">Alíquota: {(apuracaoAtual?.aliquotaPercentual || 4.5).toFixed(1)}% (TI/TIC)</div>
        </div>

        <div className="p-4 bg-[#1a1a1a] rounded-xl border border-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>CPRB Líquida a Recolher</span>
            <CreditCard className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-purple-300 tracking-tight">
            R$ {(apuracaoAtual?.valorCprbLiquidoRecolherBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-purple-400/80 mt-1">DARF 2985 Venc. {apuracaoAtual?.dataVencimentoDarf || '20/04/2026'}</div>
        </div>

        <div className="p-4 bg-[#1a1a1a] rounded-xl border border-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Economia vs INSS Folha 20%</span>
            <Percent className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400 tracking-tight">
            +R$ {economiaDesoneracao > 0 ? economiaDesoneracao.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
          </div>
          <div className="text-[11px] text-amber-400/80 mt-1">Ganho de eficiência tributária</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1 px-6 border-b border-gray-800 bg-[#161616]">
        <button
          onClick={() => setActiveTab('apuracoes')}
          className={`px-4 py-3 text-xs font-semibold border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'apuracoes'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Apurações Mensais ({resumo?.apuracoes.length || 0})</span>
        </button>
        <button
          onClick={() => setActiveTab('ajustes')}
          className={`px-4 py-3 text-xs font-semibold border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'ajustes'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Ajustes R-2060 / Ações Judiciais ({apuracaoAtual?.ajustes.length || 0})</span>
        </button>
        <button
          onClick={() => setActiveTab('reinf')}
          className={`px-4 py-3 text-xs font-semibold border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'reinf'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Evento R-2060 EFD-Reinf XML</span>
        </button>
        <button
          onClick={() => setActiveTab('comparativo')}
          className={`px-4 py-3 text-xs font-semibold border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'comparativo'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <TrendingDown className="w-4 h-4" />
          <span>Estudo Comparativo (CPRB vs INSS Folha 20%)</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-auto p-6">
        {/* Tab 1: Apurações Mensais */}
        {activeTab === 'apuracoes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative w-72">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filtrar por competência (YYYY-MM)..."
                  value={filtroCompetencia}
                  onChange={e => setFiltroCompetencia(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#1a1a1a] border border-gray-700 rounded text-gray-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-800 bg-[#181818]">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#202020] text-gray-400 font-semibold border-b border-gray-800">
                  <tr>
                    <th className="py-3 px-4">Competência</th>
                    <th className="py-3 px-4">Atividade EFD-Reinf</th>
                    <th className="py-3 px-4 text-right">Receita Bruta</th>
                    <th className="py-3 px-4 text-right">Deduções</th>
                    <th className="py-3 px-4 text-right">Base CPRB</th>
                    <th className="py-3 px-4 text-center">Alíquota</th>
                    <th className="py-3 px-4 text-right">CPRB Apurada</th>
                    <th className="py-3 px-4 text-right">Ajustes</th>
                    <th className="py-3 px-4 text-right">CPRB a Recolher</th>
                    <th className="py-3 px-4 text-center">Status Reinf</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {resumo?.apuracoes
                    .filter(a => a.competencia.includes(filtroCompetencia))
                    .map(a => {
                      const isSelected = selectedApuracao?.id === a.id;
                      return (
                        <tr
                          key={a.id}
                          onClick={() => setSelectedApuracao(a)}
                          className={`hover:bg-gray-800/50 cursor-pointer transition ${isSelected ? 'bg-emerald-900/20' : ''}`}
                        >
                          <td className="py-3 px-4 font-mono font-bold text-white">
                            {a.competencia}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-200">{a.codigoAtividadeReinf} - {a.setor}</div>
                            <div className="text-[11px] text-gray-500 truncate max-w-xs">{a.descricaoAtividade}</div>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-white">
                            R$ {a.receitaBrutaTotalBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-emerald-400">
                            -R$ {(a.deducaoExportacoesDiretasBRL + a.deducaoVendasCanceladasDescontosBRL).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-white">
                            R$ {a.baseCalculoCprbBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-blue-400 font-bold">
                            {a.aliquotaPercentual.toFixed(1)}%
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-gray-300">
                            R$ {a.valorCprbApuradoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-amber-400">
                            {a.totalAjustesReducaoBRL > 0 ? `-R$ ${a.totalAjustesReducaoBRL.toFixed(2)}` : 'R$ 0,00'}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-purple-300">
                            R$ {a.valorCprbLiquidoRecolherBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-blue-900/40 text-blue-300 border border-blue-800 flex items-center justify-center space-x-1">
                              <CheckCircle className="w-3 h-3 text-blue-400" />
                              <span>{a.statusApuracao.replace('_', ' ')}</span>
                            </span>
                            {a.reciboReinfProtocolo && (
                              <div className="text-[9px] text-gray-500 font-mono mt-0.5">{a.reciboReinfProtocolo}</div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedApuracao(a);
                                setModalDarf(true);
                              }}
                              className="p-1 hover:bg-gray-700 text-gray-400 hover:text-white rounded"
                              title="Emitir DARF 2985"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Ajustes R-2060 */}
        {activeTab === 'ajustes' && apuracaoAtual && (
          <div className="space-y-4">
            <div className="p-4 bg-[#1a1a1a] rounded-xl border border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>Ajustes da Contribuição Previdenciária - Competência {apuracaoAtual.competencia}</span>
                  <span className="text-xs font-mono text-emerald-400">(Tabela 9 EFD-Reinf / Domínio 103-INSS-RB)</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Acréscimos ou reduções de valores apurados oriundos de Ação Judicial (Cód. 01) ou Processo Administrativo (Cód. 02)
                </p>
              </div>
              <button
                onClick={() => setModalNovoAjuste(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Novo Ajuste Reinf</span>
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-800 bg-[#181818]">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#202020] text-gray-400 font-semibold border-b border-gray-800">
                  <tr>
                    <th className="py-3 px-4">Tipo</th>
                    <th className="py-3 px-4">Origem</th>
                    <th className="py-3 px-4">Nº Processo Judicial/Admin</th>
                    <th className="py-3 px-4">Descrição do Ajuste</th>
                    <th className="py-3 px-4 text-right">Valor do Ajuste</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {apuracaoAtual.ajustes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-gray-500">
                        Nenhum ajuste fiscal cadastrado para esta competência.
                      </td>
                    </tr>
                  ) : (
                    apuracaoAtual.ajustes.map(aj => (
                      <tr key={aj.id} className="hover:bg-gray-800/40">
                        <td className="py-3 px-4 font-bold">
                          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                            aj.tipoAjuste === 'REDUCAO'
                              ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-800'
                              : 'bg-rose-900/40 text-rose-300 border border-rose-800'
                          }`}>
                            {aj.tipoAjuste}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-gray-300">
                          {aj.origemAjuste.replace('_', ' ')}
                        </td>
                        <td className="py-3 px-4 font-mono text-white">
                          {aj.numeroProcesso}
                        </td>
                        <td className="py-3 px-4 text-gray-300">
                          {aj.descricaoAjuste}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                          {aj.tipoAjuste === 'REDUCAO' ? '-' : '+'}R$ {aj.valorAjusteBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: XML EFD-Reinf */}
        {activeTab === 'reinf' && apuracaoAtual && (
          <div className="space-y-4">
            <div className="p-4 bg-[#1a1a1a] rounded-xl border border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>Estrutura do Evento R-2060 - EFD-Reinf</span>
                  <span className="text-xs font-mono text-gray-400">ID: {apuracaoAtual.eventoReinfId || 'R2060-001'}</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Validação com layout oficial Sped EFD-Reinf v2.1.02 e transmissão via WebService
                </p>
              </div>
              <button
                onClick={() => handleTransmitirReinf(apuracaoAtual.id)}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded transition shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Transmitir ao Sped Reinf</span>
              </button>
            </div>

            <div className="p-4 bg-[#0d0d0d] rounded-xl border border-gray-800 font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed">
              <pre>{`<?xml version="1.0" encoding="UTF-8"?>
<Reinf xmlns="http://www.reinf.esocial.gov.br/schemas/evtInfoCPRB/v2_01_02">
  <evtCPRB id="${apuracaoAtual.eventoReinfId || 'ID100000000000000'}">
    <ideEvento>
      <indRetif>1</indRetif>
      <perApur>${apuracaoAtual.competencia}</perApur>
      <tpAmb>1</tpAmb>
      <procEmi>1</procEmi>
      <verProc>ERP_CONTABIL_STUDIO_PRO_41.0</verProc>
    </ideEvento>
    <ideContri>
      <tpInsc>1</tpInsc>
      <nrInsc>01234567000189</nrInsc>
      <infoCPRB>
        <ideEstab>
          <tpInscEstab>1</tpInscEstab>
          <nrInscEstab>01234567000189</nrInscEstab>
          <vlrRecBrutaTotal>${apuracaoAtual.receitaBrutaTotalBRL.toFixed(2)}</vlrRecBrutaTotal>
          <vlrCPApurTotal>${apuracaoAtual.valorCprbLiquidoRecolherBRL.toFixed(2)}</vlrCPApurTotal>
          <tipoCod>
            <codAtivEcon>${apuracaoAtual.codigoAtividadeReinf}</codAtivEcon>
            <vlrRecBrutaAtiv>${apuracaoAtual.receitaBrutaTotalBRL.toFixed(2)}</vlrRecBrutaAtiv>
            <vlrExcRecBruta>${(apuracaoAtual.deducaoExportacoesDiretasBRL + apuracaoAtual.deducaoVendasCanceladasDescontosBRL).toFixed(2)}</vlrExcRecBruta>
            <vlrAdicRecBruta>0.00</vlrAdicRecBruta>
            <vlrBcCPRB>${apuracaoAtual.baseCalculoCprbBRL.toFixed(2)}</vlrBcCPRB>
            <vlrCPRBapur>${apuracaoAtual.valorCprbApuradoBRL.toFixed(2)}</vlrCPRBapur>
${apuracaoAtual.ajustes.map(aj => `            <tipoAjuste>
              <tpAjuste>${aj.tipoAjuste === 'REDUCAO' ? '0' : '1'}</tpAjuste>
              <codAjuste>${aj.codigoAjuste}</codAjuste>
              <vlrAjuste>${aj.valorAjusteBRL.toFixed(2)}</vlrAjuste>
              <descAjuste>${aj.descricaoAjuste}</descAjuste>
              <dtProc>${apuracaoAtual.competencia}-15</dtProc>
              <nrProc>${aj.numeroProcesso}</nrProc>
            </tipoAjuste>`).join('\n')}
          </tipoCod>
        </ideEstab>
      </infoCPRB>
    </ideContri>
  </evtCPRB>
</Reinf>`}</pre>
            </div>
          </div>
        )}

        {/* Tab 4: Estudo Comparativo */}
        {activeTab === 'comparativo' && apuracaoAtual && (
          <div className="space-y-6">
            <div className="p-4 bg-[#1a1a1a] rounded-xl border border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>Estudo de Eficiência Tributária: CPRB vs Regime Convencional INSS Patronal (20%)</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Análise da opção pela desoneração da folha de pagamento sob as regras da Lei 12.546/2011 e Lei 14.973/2024
                </p>
              </div>
              <div className="px-3 py-1.5 bg-emerald-900/40 text-emerald-300 border border-emerald-800 rounded text-xs font-bold">
                ECONOMIA MENSAL: R$ {economiaDesoneracao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Regime Convencional */}
              <div className="p-5 bg-[#181818] rounded-xl border border-gray-800 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 border-b border-gray-800 pb-2">
                  Cenário 1: Regime Convencional (20% sobre a Folha)
                </h4>
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center text-gray-300">
                    <span className="font-sans">Folha Salarial Bruta Estimada:</span>
                    <span className="font-bold text-white">R$ {folhaSalariosEstimada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-300">
                    <span className="font-sans">Alíquota Patronal FPAS Básica:</span>
                    <span className="text-rose-400 font-bold">20,00%</span>
                  </div>
                  <div className="pt-3 border-t border-gray-800 flex justify-between items-center text-sm font-bold text-rose-400">
                    <span className="font-sans">Custo Previdenciário Patronal:</span>
                    <span>R$ {inssFolha20.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Regime CPRB Desonerado */}
              <div className="p-5 bg-[#181818] rounded-xl border border-gray-800 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 border-b border-gray-800 pb-2">
                  Cenário 2: Desoneração CPRB (Lei nº 12.546/2011)
                </h4>
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center text-gray-300">
                    <span className="font-sans">Base de Cálculo CPRB:</span>
                    <span className="font-bold text-white">R$ {apuracaoAtual.baseCalculoCprbBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-300">
                    <span className="font-sans">Alíquota Setorial TI/TIC:</span>
                    <span className="text-blue-400 font-bold">{(apuracaoAtual.aliquotaPercentual).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-300">
                    <span className="font-sans">(-) Ajustes Judiciais e Deduções:</span>
                    <span className="text-emerald-400 font-bold">-R$ {apuracaoAtual.totalAjustesReducaoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-800 flex justify-between items-center text-sm font-bold text-emerald-400">
                    <span className="font-sans">Custo CPRB a Recolher (DARF 2985):</span>
                    <span>R$ {apuracaoAtual.valorCprbLiquidoRecolherBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Guia DARF 2985 A4 */}
      {modalDarf && apuracaoAtual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white text-gray-900 w-full max-w-3xl h-[90vh] overflow-y-auto rounded-lg shadow-2xl flex flex-col font-sans p-8 print:p-0">
            {/* Action Bar */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-300 print:hidden">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                Visualização de DARF Oficial - Receita Federal do Brasil (Sicalc)
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center space-x-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Guia</span>
                </button>
                <button
                  onClick={() => setModalDarf(false)}
                  className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-xs font-semibold"
                >
                  Fechar
                </button>
              </div>
            </div>

            {/* DARF Layout */}
            <div className="border-2 border-gray-900 p-6 space-y-4">
              <div className="flex border-b-2 border-gray-900 pb-3">
                <div className="w-2/3 pr-4 border-r border-gray-400 flex flex-col justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="font-black text-xl tracking-tighter">MINISTÉRIO DA FAZENDA</div>
                  </div>
                  <div className="text-xs font-bold text-gray-700 mt-1">
                    SECRETARIA DA RECEITA FEDERAL DO BRASIL
                  </div>
                  <div className="text-sm font-black mt-2">
                    DOCUMENTO DE ARRECADAÇÃO DE RECEITAS FEDERAIS - DARF
                  </div>
                  <div className="text-[10px] text-gray-600 mt-2">
                    CONTRIBUIÇÃO PREVIDENCIÁRIA SOBRE A RECEITA BRUTA - CPRB (LEI 12.546/2011)
                  </div>
                </div>

                <div className="w-1/3 pl-4 space-y-2 text-xs font-mono">
                  <div className="border border-gray-400 p-1.5 rounded">
                    <div className="text-[9px] text-gray-500 font-sans uppercase">02 Período de Apuração</div>
                    <div className="font-bold text-gray-900">{apuracaoAtual.competencia}</div>
                  </div>
                  <div className="border border-gray-400 p-1.5 rounded">
                    <div className="text-[9px] text-gray-500 font-sans uppercase">03 Número do CNPJ</div>
                    <div className="font-bold text-gray-900">01.234.567/0001-89</div>
                  </div>
                  <div className="border border-gray-400 p-1.5 rounded">
                    <div className="text-[9px] text-gray-500 font-sans uppercase">04 Código da Receita</div>
                    <div className="font-bold text-gray-900 text-sm">{apuracaoAtual.codigoReceitaDarf}</div>
                  </div>
                  <div className="border border-gray-400 p-1.5 rounded">
                    <div className="text-[9px] text-gray-500 font-sans uppercase">06 Data de Vencimento</div>
                    <div className="font-bold text-gray-900">{apuracaoAtual.dataVencimentoDarf}</div>
                  </div>
                  <div className="border border-gray-400 p-1.5 rounded">
                    <div className="text-[9px] text-gray-500 font-sans uppercase">07 Valor do Principal</div>
                    <div className="font-bold text-gray-900">R$ {apuracaoAtual.valorCprbLiquidoRecolherBRL.toFixed(2)}</div>
                  </div>
                  <div className="border border-gray-400 p-1.5 rounded bg-gray-100">
                    <div className="text-[9px] text-gray-700 font-sans uppercase font-bold">10 Valor Total</div>
                    <div className="font-black text-gray-900 text-sm">R$ {apuracaoAtual.valorCprbLiquidoRecolherBRL.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              {/* Informações Complementares */}
              <div className="border border-gray-400 p-3 rounded text-xs">
                <div className="font-bold uppercase text-gray-700 mb-1">Instruções para Pagamento:</div>
                <div className="space-y-0.5 text-gray-600 font-mono text-[11px]">
                  <div>- Recolhimento através da rede bancária autorizada ou canais de Internet Banking.</div>
                  <div>- Base de Cálculo CPRB: R$ {apuracaoAtual.baseCalculoCprbBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (Alíquota {apuracaoAtual.aliquotaPercentual}%)</div>
                  <div>- Evento R-2060 transmitido à EFD-Reinf sob recibo: {apuracaoAtual.reciboReinfProtocolo || '2026-REINF-R2060'}</div>
                </div>
              </div>

              {/* Código de barras FEBRABAN */}
              <div className="pt-4 text-center space-y-1">
                <div className="font-mono text-xs font-bold tracking-widest text-gray-800">
                  {apuracaoAtual.codigoBarrasDarfFebraban}
                </div>
                <div className="h-10 bg-gray-900 w-full rounded flex items-center justify-center text-white text-[10px] font-mono tracking-widest">
                  || | |||| ||| ||||| |||| || |||||| ||||| ||| |||| |||| ||||| || ||||
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo Ajuste */}
      {modalNovoAjuste && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1e1e1e] border border-gray-700 text-gray-100 w-full max-w-md rounded-xl shadow-2xl p-6 font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Novo Ajuste CPRB (EFD-Reinf R-2060)</span>
              </h3>
              <button onClick={() => setModalNovoAjuste(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdicionarAjuste} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Tipo de Ajuste</label>
                <select
                  value={novoAjusteTipo}
                  onChange={e => setNovoAjusteTipo(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#252525] border border-gray-700 rounded text-gray-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="REDUCAO">Redução do Valor Devido</option>
                  <option value="ACRESCIMO">Acréscimo do Valor Devido</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Origem do Ajuste (Tabela 9 Reinf)</label>
                <select
                  value={novoAjusteOrigem}
                  onChange={e => setNovoAjusteOrigem(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#252525] border border-gray-700 rounded text-gray-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="01_ACAO_JUDICIAL">01 - Ajuste Oriundo de Ação Judicial</option>
                  <option value="02_PROCESSO_ADMINISTRATIVO">02 - Ajuste Oriundo de Processo Administrativo</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Número do Processo Judicial / Administrativo</label>
                <input
                  type="text"
                  placeholder="Ex: 5001234-88.2025.4.04.7100"
                  value={novoAjusteProcesso}
                  onChange={e => setNovoAjusteProcesso(e.target.value)}
                  className="w-full px-3 py-2 bg-[#252525] border border-gray-700 rounded text-gray-200 focus:outline-none focus:border-emerald-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Descrição Detalhada do Ajuste</label>
                <input
                  type="text"
                  placeholder="Ex: Liminar excluindo royalties e cessão de software"
                  value={novoAjusteDesc}
                  onChange={e => setNovoAjusteDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-[#252525] border border-gray-700 rounded text-gray-200 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Valor do Ajuste (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={novoAjusteValor}
                  onChange={e => setNovoAjusteValor(e.target.value)}
                  className="w-full px-3 py-2 bg-[#252525] border border-gray-700 rounded text-gray-200 focus:outline-none focus:border-emerald-500 font-mono"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setModalNovoAjuste(false)}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded shadow-sm"
                >
                  Gravar Ajuste
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
