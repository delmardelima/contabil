import React, { useState, useEffect } from 'react';
import {
  Coins,
  ShieldAlert,
  Percent,
  Plus,
  Trash2,
  Printer,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Search,
  Building2,
  Landmark,
  FileCheck2,
  ArrowRightLeft,
  Calendar,
  Layers
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  ResumoFundosEquilibrioFiscal,
  ItemApuracaoFundoEquilibrio,
  TipoFundoEquilibrioEstadual
} from '../../types/contabil';

export const FundosEquilibrioFiscalModule: React.FC = () => {
  const [empresaId] = useState<number>(1);
  const [competencia, setCompetencia] = useState<string>('2026-03');
  const [resumo, setResumo] = useState<ResumoFundosEquilibrioFiscal | null>(null);
  const [activeTab, setActiveTab] = useState<'apuracoes' | 'laudoA4'>('apuracoes');
  const [busca, setBusca] = useState<string>('');

  // Modal Nova Apuração
  const [modalNovo, setModalNovo] = useState<boolean>(false);
  const [formFundo, setFormFundo] = useState<TipoFundoEquilibrioEstadual>('FOT_SC');
  const [formDispositivo, setFormDispositivo] = useState<string>('');
  const [formTipoBeneficio, setFormTipoBeneficio] = useState<'ISENCAO' | 'REDUCAO_BASE' | 'CREDITO_PRESUMIDO' | 'DIFERIMENTO_PARCIAL'>('CREDITO_PRESUMIDO');
  const [formBase, setFormBase] = useState<number>(0);
  const [formAliqBeneficio, setFormAliqBeneficio] = useState<number>(12);
  const [formAliqFundo, setFormAliqFundo] = useState<number>(10);
  const [formDataVencimento, setFormDataVencimento] = useState<string>('2026-04-20');
  const [formCodigoGuia, setFormCodigoGuia] = useState<string>('DARE-SC 1644');
  const [formChaveNfe, setFormChaveNfe] = useState<string>('');
  const [formObservacoes, setFormObservacoes] = useState<string>('');

  // Notificações
  const [notificacao, setNotificacao] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  const carregarDados = () => {
    const dados = dbService.getFundosEquilibrioFiscal(empresaId, competencia);
    setResumo(dados);
  };

  useEffect(() => {
    carregarDados();
  }, [competencia]);

  // Atualiza código de guia padrão ao trocar de fundo
  useEffect(() => {
    if (formFundo === 'FOT_SC') {
      setFormCodigoGuia('DARE-SC 1644');
      setFormAliqFundo(10);
    } else if (formFundo === 'FEEF_RJ') {
      setFormCodigoGuia('GNRE-RJ 021-3');
      setFormAliqFundo(10);
    } else if (formFundo === 'PROTEGE_GO') {
      setFormCodigoGuia('DARE-GO 5013');
      setFormAliqFundo(15);
    } else if (formFundo === 'FEM_MG') {
      setFormCodigoGuia('DAE-MG 112-8');
      setFormAliqFundo(10);
    } else if (formFundo === 'FEPAF_BA') {
      setFormCodigoGuia('DAE-BA 2175');
      setFormAliqFundo(10);
    } else if (formFundo === 'FEEF_PE') {
      setFormCodigoGuia('GNRE-PE 040-5');
      setFormAliqFundo(10);
    }
  }, [formFundo]);

  const exibirNotificacao = (tipo: 'sucesso' | 'erro', texto: string) => {
    setNotificacao({ tipo, texto });
    setTimeout(() => setNotificacao(null), 5000);
  };

  const handleSalvarItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (formBase <= 0) {
      exibirNotificacao('erro', 'A base de cálculo da desoneração deve ser maior que zero.');
      return;
    }

    const valorDesonerado = (formBase * formAliqBeneficio) / 100;
    const valorDevido = (valorDesonerado * formAliqFundo) / 100;

    const res = dbService.salvarItemFundoEquilibrio({
      empresaId,
      competencia,
      fundo: formFundo,
      dispositivoLegal: formDispositivo || 'TARE Estadual Vinculado',
      tipoBeneficio: formTipoBeneficio,
      baseCalculoDesoneracaoBRL: formBase,
      aliquotaBeneficioPercent: formAliqBeneficio,
      valorDesoneradoBRL: valorDesonerado,
      aliquotaFundoPercent: formAliqFundo,
      valorDevidoFundoBRL: valorDevido,
      dataVencimento: formDataVencimento,
      codigoReceitaGuia: formCodigoGuia,
      chaveNfeReferencia: formChaveNfe,
      statusPagamento: 'A_RECOLHER',
      observacoes: formObservacoes
    });

    if (res.sucesso) {
      exibirNotificacao('sucesso', res.mensagem);
      setModalNovo(false);
      setFormBase(0);
      setFormDispositivo('');
      setFormChaveNfe('');
      setFormObservacoes('');
      carregarDados();
    }
  };

  const handleExcluir = (id: string) => {
    if (confirm('Confirma a exclusão deste item de apuração do fundo estadual?')) {
      const res = dbService.excluirItemFundoEquilibrio(id);
      if (res.sucesso) {
        exibirNotificacao('sucesso', res.mensagem);
        carregarDados();
      }
    }
  };

  const handleIntegrarContabil = (id: string) => {
    const res = dbService.integrarFundoEquilibrioContabil(id);
    if (res.sucesso) {
      exibirNotificacao('sucesso', res.mensagem);
      carregarDados();
    } else {
      exibirNotificacao('erro', res.mensagem);
    }
  };

  const empresa = dbService.getEmpresa(empresaId);
  const itensFiltrados = (resumo?.itens || []).filter(
    i =>
      i.dispositivoLegal.toLowerCase().includes(busca.toLowerCase()) ||
      i.codigoReceitaGuia.toLowerCase().includes(busca.toLowerCase()) ||
      i.fundo.includes(busca.toUpperCase())
  );

  const nomesFundos: Record<TipoFundoEquilibrioEstadual, string> = {
    FOT_SC: 'FOT - Santa Catarina (Lei 17.762/19)',
    FEEF_RJ: 'FEEF - Rio de Janeiro (Lei 7.428/16)',
    PROTEGE_GO: 'PROTEGE - Goiás (Lei 14.469/03)',
    FEM_MG: 'FEM - Minas Gerais (Erradicação da Miséria)',
    FEPAF_BA: 'FEPAF - Bahia (Combate à Pobreza)',
    FEEF_PE: 'FEEF - Pernambuco (Lei 15.865/16)'
  };

  return (
    <div className="flex flex-col h-full bg-[#121212] text-zinc-100 overflow-y-auto">
      {/* Top Header */}
      <div className="p-6 border-b border-zinc-800 bg-[#181818] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-amber-950/60 border border-amber-800 text-amber-400">
              <Coins className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-wide">
                  Fundos de Equilíbrio Fiscal Estaduais (FEEF / FOT / PROTEGE)
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-900/50 text-amber-300 border border-amber-700/60 font-semibold">
                  Convênio ICMS 42/2016
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 font-semibold">
                  Depósito Compulsório 10% a 15%
                </span>
              </div>
              <p className="text-sm text-zinc-400 mt-1">
                Controle do depósito compulsório sobre benefícios fiscais estaduais (FOT-SC, FEEF-RJ, PROTEGE-GO, FEM-MG) para garantia da fruição de incentivos.
              </p>
            </div>
          </div>
        </div>

        {/* Controles de Competência e Ações */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-[#202020] px-3 py-1.5 rounded-lg border border-zinc-700">
            <span className="text-xs text-zinc-400 uppercase font-semibold">Competência:</span>
            <input
              type="month"
              value={competencia}
              onChange={(e) => setCompetencia(e.target.value)}
              className="bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => setModalNovo(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nova Apuração de Fundo
          </button>

          <button
            onClick={() => setActiveTab('laudoA4')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold transition-colors"
          >
            <Printer className="w-4 h-4 text-zinc-400" />
            Imprimir Laudo A4
          </button>
        </div>
      </div>

      {/* Alerta de Notificação */}
      {notificacao && (
        <div
          className={`mx-6 mt-4 p-3 rounded-lg border text-sm flex items-center justify-between ${
            notificacao.tipo === 'sucesso'
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/60 border-rose-800 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {notificacao.tipo === 'sucesso' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{notificacao.texto}</span>
          </div>
          <button onClick={() => setNotificacao(null)} className="text-xs hover:underline">Fechar</button>
        </div>
      )}

      {/* Aviso Legal de Inadimplemento */}
      <div className="mx-6 mt-4 p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/60 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200/90 leading-relaxed">
          <strong>Atenção Regulatória (Cláusula Primeira § 1º do Convênio ICMS nº 42/2016):</strong> O não recolhimento tempestivo da contribuição
          ao Fundo Estadual de Equilíbrio Fiscal no prazo legal (geralmente dia 20 do mês subsequente) resulta na <strong>perda definitiva do benefício fiscal fruído</strong> no respectivo mês,
          tornando exigível o ICMS integral com juros e multa moratória pela fiscalização da SEFAZ.
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#181818] border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
            <span>INCENTIVOS FRUÍDOS</span>
            <Coins className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-blue-400">
            R$ {(resumo?.totalIncentivosFruidosBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">Montante total desonerado em TTDs/Incentivos</div>
        </div>

        <div className="p-4 rounded-xl bg-[#181818] border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
            <span>TOTAL DEVIDO AOS FUNDOS</span>
            <Percent className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-amber-400">
            R$ {(resumo?.totalDevidoFundosBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">Depósito compulsório (10% a 15%)</div>
        </div>

        <div className="p-4 rounded-xl bg-[#181818] border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
            <span>TOTAL RECOLHIDO</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-emerald-400">
            R$ {(resumo?.totalRecolhidoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">Guias liquidadas e comprovadas</div>
        </div>

        <div className="p-4 rounded-xl bg-[#181818] border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
            <span>PENDENTE DE RECOLHIMENTO</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-rose-400">
            R$ {(resumo?.totalPendenteRecolhimentoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">Guias a pagar até o vencimento</div>
        </div>
      </div>

      {/* Navegação por Abas */}
      <div className="px-6 border-b border-zinc-800 flex gap-4">
        <button
          onClick={() => setActiveTab('apuracoes')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'apuracoes' ? 'border-amber-500 text-amber-400' : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          Apurações de Benefícios & Fundos ({resumo?.itens?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('laudoA4')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'laudoA4' ? 'border-amber-500 text-amber-400' : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          Demonstrativo de Regularidade Fiscal A4
        </button>
      </div>

      {/* Conteúdo das Abas */}
      <div className="p-6 flex-1">
        {/* ABA 1: TABELA DE APURAÇÕES */}
        {activeTab === 'apuracoes' && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-3">
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filtrar por dispositivo legal, guia ou fundo..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full bg-[#181818] border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="text-xs text-zinc-400">
                Lançamentos no Diário: D - Despesa Tributária Fundo Estadual | C - Obrigações a Recolher
              </div>
            </div>

            <div className="bg-[#181818] border border-zinc-800 rounded-xl overflow-hidden shadow">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#202020] text-zinc-400 font-semibold border-b border-zinc-800">
                  <tr>
                    <th className="py-3 px-4">Fundo Estadual</th>
                    <th className="py-3 px-4">Dispositivo Legal / TARE</th>
                    <th className="py-3 px-4">Modalidade</th>
                    <th className="py-3 px-4 text-right">Incentivo Fruído</th>
                    <th className="py-3 px-4 text-right">Alíq. Fundo</th>
                    <th className="py-3 px-4 text-right">Valor Devido</th>
                    <th className="py-3 px-4">Vencimento / Guia</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {itensFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-zinc-500 font-sans">
                        Nenhuma apuração de fundo estadual localizada para esta competência.
                      </td>
                    </tr>
                  ) : (
                    itensFiltrados.map((item) => (
                      <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-amber-300 block">{item.fundo}</span>
                          <span className="text-[10px] text-zinc-400">{nomesFundos[item.fundo]}</span>
                        </td>
                        <td className="py-3 px-4 text-zinc-200 font-medium max-w-xs truncate">
                          {item.dispositivoLegal}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-300">
                            {item.tipoBeneficio}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-blue-300">
                          R$ {item.valorDesoneradoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-zinc-300">
                          {item.aliquotaFundoPercent.toFixed(1)}%
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-amber-400">
                          R$ {item.valorDevidoFundoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 font-mono text-zinc-300">
                          <div>{item.dataVencimento}</div>
                          <span className="text-[10px] text-zinc-400">{item.codigoReceitaGuia}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            item.statusPagamento === 'RECOLHIDO'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : 'bg-rose-950 text-rose-300 border-rose-800'
                          }`}>
                            {item.statusPagamento === 'RECOLHIDO' ? 'RECOLHIDO' : 'A RECOLHER'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {!item.integradoContabil ? (
                              <button
                                onClick={() => handleIntegrarContabil(item.id)}
                                title="Integrar no Diário Geral"
                                className="p-1.5 rounded-lg bg-cyan-900/40 hover:bg-cyan-800/60 text-cyan-300 border border-cyan-700/50 transition-colors"
                              >
                                <ArrowRightLeft className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <span title="Integrado na contabilidade" className="text-emerald-400 text-[10px] font-semibold">
                                Lote {item.loteContabilId}
                              </span>
                            )}
                            <button
                              onClick={() => handleExcluir(item.id)}
                              title="Excluir apuração"
                              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-900/40 text-zinc-400 hover:text-rose-400 border border-zinc-700 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 2: LAUDO A4 OFICIAL DE REGULARIDADE */}
        {activeTab === 'laudoA4' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow transition-colors"
              >
                <Printer className="w-4 h-4" />
                Imprimir Laudo Oficial A4
              </button>
            </div>

            <div className="bg-white text-black p-8 rounded-xl shadow-2xl max-w-4xl mx-auto font-sans border border-zinc-300 print:m-0 print:border-none print:shadow-none">
              {/* Header do Laudo */}
              <div className="border-b-2 border-black pb-4 flex justify-between items-start">
                <div>
                  <div className="text-xl font-black uppercase tracking-wider text-black">
                    DEMONSTRATIVO DE RECOLHIMENTO A FUNDO DE EQUILÍBRIO FISCAL
                  </div>
                  <div className="text-xs font-semibold text-zinc-700 mt-1">
                    CONVÊNIO ICMS Nº 42/2016 - CONTROLE DE DESONERAÇÃO E DEPÓSITO COMPULSÓRIO
                  </div>
                  <div className="text-xs text-zinc-600 mt-0.5">
                    Comprovação de Adimplemento para Fruição de Benefícios Fiscais Estaduais
                  </div>
                </div>

                <div className="text-right text-xs">
                  <div className="font-bold text-sm text-black">{empresa?.razaoSocial}</div>
                  <div className="text-zinc-600">CNPJ: {empresa?.cnpj}</div>
                  <div className="text-zinc-600">Competência: {competencia}</div>
                  <div className="text-zinc-500 text-[10px]">Emissão: {new Date().toLocaleDateString('pt-BR')}</div>
                </div>
              </div>

              {/* Informações da Apuração */}
              <div className="my-6 grid grid-cols-4 gap-4 p-4 bg-zinc-50 rounded border border-zinc-200 text-xs">
                <div>
                  <span className="block text-zinc-500 font-semibold text-[10px] uppercase">Total Desoneração Fruída</span>
                  <span className="font-bold text-sm text-black">
                    R$ {(resumo?.totalIncentivosFruidosBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="block text-zinc-500 font-semibold text-[10px] uppercase">Contribuição aos Fundos</span>
                  <span className="font-bold text-sm text-black">
                    R$ {(resumo?.totalDevidoFundosBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="block text-zinc-500 font-semibold text-[10px] uppercase">Total Recolhido</span>
                  <span className="font-bold text-sm text-emerald-700">
                    R$ {(resumo?.totalRecolhidoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="block text-zinc-500 font-semibold text-[10px] uppercase">Saldo em Aberto</span>
                  <span className="font-bold text-sm text-rose-700">
                    R$ {(resumo?.totalPendenteRecolhimentoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Tabela de Discriminação dos Benefícios */}
              <div className="mt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-black mb-2 border-b border-zinc-400 pb-1">
                  1. Discriminação dos Benefícios Fiscais e Depósitos Compulsórios por Estado
                </h4>
                <table className="w-full text-left text-[11px] border border-zinc-300">
                  <thead className="bg-zinc-100 text-black font-bold border-b border-zinc-300">
                    <tr>
                      <th className="py-1.5 px-2 border-r border-zinc-300">Fundo Estadual</th>
                      <th className="py-1.5 px-2 border-r border-zinc-300">Dispositivo Legal / Ato Declaratório</th>
                      <th className="py-1.5 px-2 border-r border-zinc-300 text-right">Base Desoneração</th>
                      <th className="py-1.5 px-2 border-r border-zinc-300 text-right">Incentivo Fruído</th>
                      <th className="py-1.5 px-2 border-r border-zinc-300 text-right">Alíq. Fundo</th>
                      <th className="py-1.5 px-2 border-r border-zinc-300 text-right">Valor Devido</th>
                      <th className="py-1.5 px-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {(resumo?.itens || []).map((i) => (
                      <tr key={i.id}>
                        <td className="py-1.5 px-2 font-bold border-r border-zinc-300">{i.fundo}</td>
                        <td className="py-1.5 px-2 border-r border-zinc-300">{i.dispositivoLegal}</td>
                        <td className="py-1.5 px-2 text-right border-r border-zinc-300 font-mono">
                          R$ {i.baseCalculoDesoneracaoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-1.5 px-2 text-right border-r border-zinc-300 font-mono">
                          R$ {i.valorDesoneradoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-1.5 px-2 text-right border-r border-zinc-300 font-mono">
                          {i.aliquotaFundoPercent.toFixed(1)}%
                        </td>
                        <td className="py-1.5 px-2 text-right border-r border-zinc-300 font-mono font-bold">
                          R$ {i.valorDevidoFundoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-1.5 px-2 text-center">
                          <span className="font-semibold text-[10px]">
                            {i.statusPagamento === 'RECOLHIDO' ? 'RECOLHIDO' : 'A RECOLHER'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Termo de Conformidade */}
              <div className="mt-8 p-4 bg-zinc-50 border border-zinc-300 rounded text-xs text-zinc-700 leading-relaxed text-justify">
                <strong>Declaração de Conformidade Tributária:</strong> Certificamos para os devidos fins de direito e fiscalização que os valores
                apurados e discriminados neste laudo correspondem estritamente aos incentivos fiscais fruídos no período de apuração de{' '}
                <strong>{competencia}</strong>, cumprindo as exigências do Convênio ICMS nº 42/2016 e legislações estaduais correlatas (Lei SC 17.762/19,
                Lei RJ 7.428/16, Lei GO 14.469/03). O recolhimento tempestivo das guias vinculadas garante a manutenção integral dos regimes e termos
                de acordo firmados com as respectivas Fazendas Estaduais.
              </div>

              {/* Assinaturas */}
              <div className="mt-12 pt-6 border-t border-zinc-300 grid grid-cols-2 gap-8 text-center text-xs">
                <div>
                  <div className="border-b border-black w-4/5 mx-auto mb-1"></div>
                  <div className="font-bold text-black">{empresa?.razaoSocial}</div>
                  <div className="text-zinc-600 text-[10px]">Contribuinte Beneficiário / Representante Legal</div>
                </div>
                <div>
                  <div className="border-b border-black w-4/5 mx-auto mb-1"></div>
                  <div className="font-bold text-black">Responsável Técnico Contábil</div>
                  <div className="text-zinc-600 text-[10px]">CRC/UF Ativo | Termo de Auditoria Tributária</div>
                </div>
              </div>

              <div className="mt-8 text-center text-[9px] text-zinc-500 font-mono">
                Autenticação Digital: FEF-SEFAZ-{competencia.replace('-', '')}-CV4216-90214890B1C2D3
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Nova Apuração */}
      {modalNovo && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#181818] border border-zinc-700 rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Nova Apuração de Fundo de Equilíbrio Fiscal</h3>
            <form onSubmit={handleSalvarItem} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Fundo Estadual</label>
                  <select
                    value={formFundo}
                    onChange={(e) => setFormFundo(e.target.value as any)}
                    className="w-full bg-[#202020] border border-zinc-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="FOT_SC">FOT - Santa Catarina (10%)</option>
                    <option value="FEEF_RJ">FEEF - Rio de Janeiro (10%)</option>
                    <option value="PROTEGE_GO">PROTEGE - Goiás (15%)</option>
                    <option value="FEM_MG">FEM - Minas Gerais (10%)</option>
                    <option value="FEPAF_BA">FEPAF - Bahia (10%)</option>
                    <option value="FEEF_PE">FEEF - Pernambuco (10%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Modalidade do Benefício</label>
                  <select
                    value={formTipoBeneficio}
                    onChange={(e) => setFormTipoBeneficio(e.target.value as any)}
                    className="w-full bg-[#202020] border border-zinc-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="CREDITO_PRESUMIDO">Crédito Presumido</option>
                    <option value="REDUCAO_BASE">Redução de Base de Cálculo</option>
                    <option value="ISENCAO">Isenção Total ou Parcial</option>
                    <option value="DIFERIMENTO_PARCIAL">Diferimento Parcial</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Dispositivo Legal / TARE Vinculado</label>
                <input
                  type="text"
                  placeholder="Ex: TARE 014/2023 - TTD 409 Importação"
                  value={formDispositivo}
                  onChange={(e) => setFormDispositivo(e.target.value)}
                  className="w-full bg-[#202020] border border-zinc-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Base Desoneração (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formBase || ''}
                    onChange={(e) => setFormBase(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#202020] border border-zinc-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Alíq. Benefício (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formAliqBeneficio}
                    onChange={(e) => setFormAliqBeneficio(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#202020] border border-zinc-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Alíq. Fundo (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formAliqFundo}
                    onChange={(e) => setFormAliqFundo(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#202020] border border-zinc-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              {/* Preview dos cálculos */}
              <div className="p-3 bg-[#222] border border-zinc-700 rounded-lg text-xs space-y-1">
                <div className="flex justify-between text-zinc-400">
                  <span>Valor Desonerado Estimado:</span>
                  <span className="font-mono text-blue-300">
                    R$ {((formBase * formAliqBeneficio) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-white pt-1 border-t border-zinc-700">
                  <span>Valor Devido ao Fundo ({formAliqFundo}%):</span>
                  <span className="font-mono text-amber-400">
                    R$ {(((formBase * formAliqBeneficio) / 100 * formAliqFundo) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Data de Vencimento</label>
                  <input
                    type="date"
                    value={formDataVencimento}
                    onChange={(e) => setFormDataVencimento(e.target.value)}
                    className="w-full bg-[#202020] border border-zinc-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Código Receita / Guia</label>
                  <input
                    type="text"
                    value={formCodigoGuia}
                    onChange={(e) => setFormCodigoGuia(e.target.value)}
                    className="w-full bg-[#202020] border border-zinc-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Chave NF-e Referenciada (opcional)</label>
                <input
                  type="text"
                  maxLength={44}
                  placeholder="44 dígitos da NF-e vinculada..."
                  value={formChaveNfe}
                  onChange={(e) => setFormChaveNfe(e.target.value)}
                  className="w-full bg-[#202020] border border-zinc-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-mono text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setModalNovo(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow"
                >
                  Salvar Apuração
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
