import React, { useState, useEffect } from 'react';
import {
  Coins,
  Layers,
  ArrowRightLeft,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Trash2,
  Printer,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  Building2,
  Landmark,
  FileCheck2,
  CreditCard
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  OperacaoContaCorrenteSiscred,
  ResumoSiscredPr,
  TipoOrigemCreditoSiscred,
  TipoDestinacaoCreditoSiscred
} from '../../types/contabil';

export const SiscredParanaModule: React.FC = () => {
  const [empresaId] = useState<number>(1);
  const [competencia, setCompetencia] = useState<string>('2026-03');
  const [resumo, setResumo] = useState<ResumoSiscredPr | null>(null);
  const [activeTab, setActiveTab] = useState<'contaCorrente' | 'transferencias' | 'extratoA4'>('contaCorrente');

  // Modal Nova Operação
  const [modalNovaOp, setModalNovaOp] = useState<boolean>(false);
  const [formTipoMovimento, setFormTipoMovimento] = useState<'CREDITO_GERADO' | 'HABILITACAO_RECEITA' | 'TRANSFERENCIA_SAIDA'>('CREDITO_GERADO');
  const [formOrigem, setFormOrigem] = useState<TipoOrigemCreditoSiscred>('EXPORTACAO');
  const [formDestinacao, setFormDestinacao] = useState<TipoDestinacaoCreditoSiscred>('TRANSFERENCIA_FORNECEDOR_INSUMOS');
  const [formProcesso, setFormProcesso] = useState<string>('');
  const [formCnpjFavorecido, setFormCnpjFavorecido] = useState<string>('');
  const [formRazaoFavorecido, setFormRazaoFavorecido] = useState<string>('');
  const [formChaveNfe, setFormChaveNfe] = useState<string>('');
  const [formValor, setFormValor] = useState<number>(0);
  const [formObservacoes, setFormObservacoes] = useState<string>('');

  // Notificações
  const [notificacao, setNotificacao] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  const carregarDados = () => {
    const dados = dbService.getSiscredPr(empresaId, competencia);
    setResumo(dados);
  };

  useEffect(() => {
    carregarDados();
  }, [competencia]);

  const exibirNotificacao = (tipo: 'sucesso' | 'erro', texto: string) => {
    setNotificacao({ tipo, texto });
    setTimeout(() => setNotificacao(null), 5000);
  };

  const handleSalvarOperacao = (e: React.FormEvent) => {
    e.preventDefault();
    if (formValor <= 0) {
      exibirNotificacao('erro', 'O valor da operação deve ser maior que zero.');
      return;
    }

    const res = dbService.salvarOperacaoSiscred({
      empresaId,
      competencia,
      tipoMovimento: formTipoMovimento,
      origemCredito: formTipoMovimento === 'CREDITO_GERADO' ? formOrigem : undefined,
      destinacao: formTipoMovimento === 'TRANSFERENCIA_SAIDA' ? formDestinacao : undefined,
      numeroProcessoSEFAZ: formProcesso || `SEFAZ/PR-${Date.now()}`,
      cnpjFavorecido: formTipoMovimento === 'TRANSFERENCIA_SAIDA' ? formCnpjFavorecido : undefined,
      razaoSocialFavorecido: formTipoMovimento === 'TRANSFERENCIA_SAIDA' ? formRazaoFavorecido : undefined,
      chaveNfeVinculada: formChaveNfe,
      valorOperacaoBRL: formValor,
      observacoes: formObservacoes
    });

    if (res.sucesso) {
      exibirNotificacao('sucesso', res.mensagem);
      setModalNovaOp(false);
      setFormProcesso('');
      setFormCnpjFavorecido('');
      setFormRazaoFavorecido('');
      setFormChaveNfe('');
      setFormValor(0);
      setFormObservacoes('');
      carregarDados();
    }
  };

  const handleIntegrarContabil = (id: string) => {
    const res = dbService.integrarSiscredContabil(id);
    if (res.sucesso) {
      exibirNotificacao('sucesso', res.mensagem);
      carregarDados();
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#121212] text-neutral-200">
      {/* 1. Header do Módulo */}
      <div className="p-4 bg-[#181818] border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400">
            <Coins size={24} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-white tracking-wide">Siscred Paraná - Créditos Acumulados de ICMS</h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                NPF 084/2017
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-neutral-800 text-neutral-300 border border-white/10">
                Decreto 7.871/2017 PR
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Controle da conta corrente gráfica do Siscred/PR, habilitação de créditos de exportação/diferimento e transferência para fornecedores
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-[#202020] border border-white/10 rounded-lg px-2.5 py-1">
            <span className="text-xs text-neutral-400 mr-2">Competência:</span>
            <input
              type="month"
              value={competencia}
              onChange={(e) => setCompetencia(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => setModalNovaOp(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-medium transition shadow-sm"
          >
            <Plus size={15} />
            <span>Lançar Operação Siscred</span>
          </button>
        </div>
      </div>

      {/* Notificação Toast */}
      {notificacao && (
        <div className={`p-3 text-xs font-medium border-b flex items-center justify-between transition-all ${
          notificacao.tipo === 'sucesso' ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300' : 'bg-rose-950/60 border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex items-center space-x-2">
            {notificacao.tipo === 'sucesso' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{notificacao.texto}</span>
          </div>
          <button onClick={() => setNotificacao(null)} className="text-white/60 hover:text-white">✕</button>
        </div>
      )}

      {/* 2. KPIs da Conta Corrente Siscred */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-[#141414] border-b border-white/5">
        <div className="p-3 bg-[#181818] border border-white/5 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Créditos Habilitados em Conta</span>
            <ShieldCheck size={15} className="text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400">
            R$ {(resumo?.totalCreditosHabilitadosBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-emerald-400/70 mt-1">Homologados pela IGF da SEFAZ/PR</div>
        </div>

        <div className="p-3 bg-[#181818] border border-white/5 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Transferências Utilizadas</span>
            <ArrowUpRight size={15} className="text-rose-400" />
          </div>
          <div className="text-xl font-bold text-rose-400">
            R$ {(resumo?.totalTransferenciasUtilizadasBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-neutral-500 mt-1">Pagamentos de compras e ativo fixo</div>
        </div>

        <div className="p-3 bg-[#181818] border border-white/5 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Saldo Final Disponível</span>
            <Coins size={15} className="text-teal-400" />
          </div>
          <div className="text-xl font-bold text-teal-300">
            R$ {(resumo?.saldoFinalDisponivelBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-teal-400/70 mt-1">Disponível para novas transferências</div>
        </div>

        <div className="p-3 bg-[#181818] border border-white/5 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Limite Operacional Mensal (LOM)</span>
            <CreditCard size={15} className="text-indigo-400" />
          </div>
          <div className="text-xl font-bold text-indigo-300">
            R$ {(resumo?.limiteOperacionalMensalLomBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-neutral-500 mt-1">Teto mensal autorizado pela Receita Estadual</div>
        </div>
      </div>

      {/* 3. Navegação por Abas */}
      <div className="px-4 border-b border-white/10 bg-[#161616] flex space-x-1">
        <button
          onClick={() => setActiveTab('contaCorrente')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition ${
            activeTab === 'contaCorrente' ? 'border-teal-500 text-teal-400 bg-white/5' : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          Extrato da Conta Corrente Siscred
        </button>
        <button
          onClick={() => setActiveTab('transferencias')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition ${
            activeTab === 'transferencias' ? 'border-teal-500 text-teal-400 bg-white/5' : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          Transferências a Fornecedores (Insumos)
        </button>
        <button
          onClick={() => setActiveTab('extratoA4')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition ${
            activeTab === 'extratoA4' ? 'border-teal-500 text-teal-400 bg-white/5' : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          Extrato Oficial A4 Timbrado
        </button>
      </div>

      {/* 4. Conteúdo das Abas */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'contaCorrente' && (
          <div className="space-y-4">
            <div className="bg-[#181818] border border-white/10 rounded-xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#202020] text-neutral-400 border-b border-white/10">
                    <tr>
                      <th className="py-2.5 px-3">Data</th>
                      <th className="py-2.5 px-3">Tipo Movimento</th>
                      <th className="py-2.5 px-3">Processo SEFAZ/PR</th>
                      <th className="py-2.5 px-3">Origem / Destinação</th>
                      <th className="py-2.5 px-3">Favorecido (Se Transferência)</th>
                      <th className="py-2.5 px-3 text-right">Valor Operação</th>
                      <th className="py-2.5 px-3 text-right">Saldo em Conta</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-center">Contabilização</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-neutral-300">
                    {(resumo?.operacoes || []).map((op) => (
                      <tr key={op.id} className="hover:bg-white/[0.02] transition">
                        <td className="py-2.5 px-3 font-mono text-neutral-300">{op.dataOperacao}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            op.tipoMovimento === 'HABILITACAO_RECEITA'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : op.tipoMovimento === 'TRANSFERENCIA_SAIDA'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          }`}>
                            {op.tipoMovimento}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-neutral-400">{op.numeroProcessoSEFAZ}</td>
                        <td className="py-2.5 px-3 text-neutral-300">
                          {op.origemCredito || op.destinacao || '-'}
                        </td>
                        <td className="py-2.5 px-3 text-neutral-300 truncate max-w-xs">
                          {op.razaoSocialFavorecido ? `${op.razaoSocialFavorecido} (${op.cnpjFavorecido})` : '-'}
                        </td>
                        <td className={`py-2.5 px-3 text-right font-mono font-bold ${
                          op.tipoMovimento === 'TRANSFERENCIA_SAIDA' ? 'text-rose-400' : 'text-emerald-400'
                        }`}>
                          {op.tipoMovimento === 'TRANSFERENCIA_SAIDA' ? '-' : '+'} R$ {op.valorOperacaoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-teal-300">
                          R$ {op.saldoContaCorrenteBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                            {op.statusHomologacao}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {op.integradoContabil ? (
                            <span className="text-[10px] font-semibold text-emerald-400 flex items-center justify-center space-x-1">
                              <CheckCircle2 size={12} />
                              <span>Lote {op.loteContabilId}</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => handleIntegrarContabil(op.id)}
                              className="px-2 py-0.5 rounded bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-medium transition"
                            >
                              Integrar Diário
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Caixa Informativa NPF 084/2017 */}
            <div className="p-4 bg-teal-950/20 border border-teal-500/20 rounded-xl text-xs space-y-2">
              <div className="flex items-center space-x-2 text-teal-300 font-semibold">
                <HelpCircle size={16} />
                <span>Normas de Transferência Siscred/PR (Decreto nº 7.871/2017)</span>
              </div>
              <p className="text-neutral-400 leading-relaxed">
                A transferência de crédito habilitado para fornecedores paranaenses de matérias-primas, insumos ou embalagens é limitada a <strong>40%</strong> do valor total da nota fiscal de aquisição. A liberação ocorre mediante protocolo eletrônico e homologação da Agência de Rendas do domicílio tributário.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'transferencias' && (
          <div className="space-y-4">
            <div className="bg-[#181818] border border-white/10 rounded-xl p-4">
              <h3 className="text-sm font-bold text-white mb-2">Transferências Homologadas a Fornecedores</h3>
              <p className="text-xs text-neutral-400 mb-4">Relação de créditos transferidos para liquidação de duplicatas de fornecedores de insumos industriais</p>

              <div className="space-y-3">
                {(resumo?.operacoes || []).filter(o => o.tipoMovimento === 'TRANSFERENCIA_SAIDA').map(op => (
                  <div key={op.id} className="p-3 bg-[#121212] border border-white/5 rounded-lg flex justify-between items-center text-xs">
                    <div>
                      <div className="font-bold text-white">{op.razaoSocialFavorecido} (CNPJ: {op.cnpjFavorecido})</div>
                      <div className="text-neutral-400 font-mono text-[11px] mt-0.5">NF-e Vinculada: {op.chaveNfeVinculada || 'Não informada'}</div>
                      <div className="text-[10px] text-teal-400 mt-1">Processo: {op.numeroProcessoSEFAZ} • Data: {op.dataOperacao}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold font-mono text-sm text-rose-400">
                        R$ {op.valorOperacaoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold mt-1 inline-block">
                        {op.statusHomologacao}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'extratoA4' && (
          <div className="max-w-4xl mx-auto bg-white text-neutral-900 p-8 rounded-xl shadow-2xl space-y-6">
            <div className="border-b-2 border-neutral-900 pb-4 flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-neutral-900">ESTADO DO PARANÁ - SECRETARIA DE ESTADO DA FAZENDA</h1>
                <h2 className="text-sm font-semibold text-neutral-700">SISCRED - SISTEMA DE CONTROLE DA TRANSFERÊNCIA DE CRÉDITOS ACUMULADOS</h2>
                <p className="text-xs text-neutral-500 mt-0.5">NPF nº 084/2017 e Regulamento do ICMS do Paraná (Decreto nº 7.871/2017)</p>
              </div>
              <div className="text-right text-xs">
                <div className="font-bold text-neutral-800">COMPETÊNCIA: {competencia}</div>
                <div className="text-neutral-500">Emissão: {new Date().toLocaleDateString('pt-BR')}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-neutral-50 p-3 rounded-lg border border-neutral-200">
              <div>
                <div className="text-neutral-500">Estabelecimento Detentor:</div>
                <div className="font-bold text-neutral-900">Amil Labs Indústria e Automação S/A</div>
              </div>
              <div>
                <div className="text-neutral-500">CNPJ / CAD-ICMS (PR):</div>
                <div className="font-bold font-mono text-neutral-900">12.345.678/0001-90 | CAD: 901.234.567-89</div>
              </div>
            </div>

            {/* Extrato da Conta */}
            <div className="space-y-4 text-xs">
              <h3 className="font-bold text-neutral-800 border-b border-neutral-300 pb-1">EXTRATO CONSOLIDADO DA CONTA CORRENTE GRÁFICA</h3>
              <table className="w-full text-left text-[11px] border border-neutral-300">
                <thead className="bg-neutral-100 text-neutral-700">
                  <tr>
                    <th className="border border-neutral-300 p-2">Data</th>
                    <th className="border border-neutral-300 p-2">Processo SEFAZ</th>
                    <th className="border border-neutral-300 p-2">Histórico da Operação</th>
                    <th className="border border-neutral-300 p-2 text-right">Crédito (+)</th>
                    <th className="border border-neutral-300 p-2 text-right">Débito (-)</th>
                    <th className="border border-neutral-300 p-2 text-right">Saldo Corrente</th>
                  </tr>
                </thead>
                <tbody>
                  {(resumo?.operacoes || []).map(op => (
                    <tr key={op.id} className="border-b border-neutral-200">
                      <td className="border border-neutral-300 p-2 font-mono">{op.dataOperacao}</td>
                      <td className="border border-neutral-300 p-2 font-mono">{op.numeroProcessoSEFAZ}</td>
                      <td className="border border-neutral-300 p-2">
                        {op.tipoMovimento} {op.razaoSocialFavorecido ? `- Favorecido: ${op.razaoSocialFavorecido}` : ''}
                      </td>
                      <td className="border border-neutral-300 p-2 text-right font-mono font-bold text-emerald-700">
                        {op.tipoMovimento !== 'TRANSFERENCIA_SAIDA' ? `R$ ${op.valorOperacaoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                      </td>
                      <td className="border border-neutral-300 p-2 text-right font-mono font-bold text-rose-700">
                        {op.tipoMovimento === 'TRANSFERENCIA_SAIDA' ? `R$ ${op.valorOperacaoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                      </td>
                      <td className="border border-neutral-300 p-2 text-right font-mono font-bold">
                        R$ {op.saldoContaCorrenteBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="bg-neutral-100 p-3 rounded-lg border border-neutral-300 flex justify-between items-center">
                <span className="font-bold text-sm text-neutral-900">SALDO FINAL DISPONÍVEL HOMOLOGADO:</span>
                <span className="font-mono text-base font-bold text-neutral-900">
                  R$ {(resumo?.saldoFinalDisponivelBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="pt-8 border-t border-neutral-300 grid grid-cols-2 gap-8 text-center text-xs">
              <div>
                <div className="border-t border-neutral-400 pt-2 font-bold text-neutral-800">
                  Inspetoria Geral de Fiscalização (IGF) - SEFAZ/PR
                </div>
                <div className="text-neutral-500">Auditor Fiscal da Receita Estadual</div>
              </div>
              <div>
                <div className="border-t border-neutral-400 pt-2 font-bold text-neutral-800">
                  Responsável Contábil / Procurador Habilitado
                </div>
                <div className="text-neutral-500">CRC/PR nº 000.000/O</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Nova Operação */}
      {modalNovaOp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#181818] border border-white/10 rounded-xl shadow-2xl max-w-lg w-full p-6 text-neutral-100 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-white mb-1">Lançamento na Conta Corrente Siscred</h3>
            <p className="text-xs text-neutral-400 mb-4">Registre créditos acumulados gerados ou transferências para fornecedores</p>

            <form onSubmit={handleSalvarOperacao} className="space-y-3">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Tipo de Movimento</label>
                <select
                  value={formTipoMovimento}
                  onChange={(e) => setFormTipoMovimento(e.target.value as any)}
                  className="w-full bg-[#121212] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="CREDITO_GERADO">Crédito Gerado (Exportação / Diferimento)</option>
                  <option value="HABILITACAO_RECEITA">Habilitação Definitiva pela Receita Estadual</option>
                  <option value="TRANSFERENCIA_SAIDA">Transferência de Saída para Fornecedor / Ativo</option>
                </select>
              </div>

              {formTipoMovimento === 'CREDITO_GERADO' && (
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Hipótese Geradora</label>
                  <select
                    value={formOrigem}
                    onChange={(e) => setFormOrigem(e.target.value as any)}
                    className="w-full bg-[#121212] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="EXPORTACAO">Saídas para o Exterior (Exportação Imune)</option>
                    <option value="DIFERIMENTO">Saídas com Diferimento do Imposto</option>
                    <option value="SUSPENSAO">Operações com Suspensão do ICMS</option>
                    <option value="REDUCAO_BASE_CALCULO">Saídas com Redução de Base de Cálculo</option>
                  </select>
                </div>
              )}

              {formTipoMovimento === 'TRANSFERENCIA_SAIDA' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">CNPJ do Fornecedor</label>
                      <input
                        type="text"
                        required
                        value={formCnpjFavorecido}
                        onChange={(e) => setFormCnpjFavorecido(e.target.value)}
                        placeholder="00.000.000/0000-00"
                        className="w-full bg-[#121212] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">Razão Social Favorecido</label>
                      <input
                        type="text"
                        required
                        value={formRazaoFavorecido}
                        onChange={(e) => setFormRazaoFavorecido(e.target.value)}
                        placeholder="Nome do Fornecedor"
                        className="w-full bg-[#121212] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Chave de Acesso NF-e Vinculada</label>
                    <input
                      type="text"
                      value={formChaveNfe}
                      onChange={(e) => setFormChaveNfe(e.target.value)}
                      placeholder="Chave de 44 dígitos da nota de compra"
                      className="w-full bg-[#121212] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Valor da Operação (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formValor}
                    onChange={(e) => setFormValor(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#121212] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Processo SEFAZ/PR</label>
                  <input
                    type="text"
                    value={formProcesso}
                    onChange={(e) => setFormProcesso(e.target.value)}
                    placeholder="Ex: SEFAZ/PR-09.123.456-7"
                    className="w-full bg-[#121212] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Observações da Operação</label>
                <textarea
                  rows={2}
                  value={formObservacoes}
                  onChange={(e) => setFormObservacoes(e.target.value)}
                  placeholder="Justificativa legal e detalhamento..."
                  className="w-full bg-[#121212] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalNovaOp(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-lg border border-white/10 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium rounded-lg transition"
                >
                  Gravar Operação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
