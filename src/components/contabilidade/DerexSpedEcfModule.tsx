import React, { useState, useEffect } from 'react';
import {
  Globe,
  Landmark,
  FileText,
  DollarSign,
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  Search,
  Printer,
  ShieldCheck,
  Building2,
  FileCheck2,
  SlidersHorizontal,
  Coins,
  BadgePercent
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  ResumoSpedEcfBlocoVX,
  RegistroV020Derex,
  RegistroX300OperacaoExterior,
  TipoOperacaoExterior
} from '../../types/contabil';

export const DerexSpedEcfModule: React.FC = () => {
  const [empresaId] = useState<number>(1);
  const [anoExercicio, setAnoExercicio] = useState<number>(2026);
  const [resumo, setResumo] = useState<ResumoSpedEcfBlocoVX | null>(null);
  const [activeTab, setActiveTab] = useState<'blocoV' | 'blocoX' | 'integracao' | 'laudoA4'>('blocoV');
  const [busca, setBusca] = useState<string>('');

  // Notificações
  const [notificacao, setNotificacao] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  // Modais
  const [modalContaDerex, setModalContaDerex] = useState<boolean>(false);
  const [modalOperacaoX300, setModalOperacaoX300] = useState<boolean>(false);

  // Form Conta DEREX V020
  const [formInstCodigo, setFormInstCodigo] = useState<string>('JPM-US');
  const [formInstNome, setFormInstNome] = useState<string>('');
  const [formContaNum, setFormContaNum] = useState<string>('');
  const [formPais, setFormPais] = useState<string>('ESTADOS UNIDOS (2496)');
  const [formMoeda, setFormMoeda] = useState<'USD' | 'EUR' | 'GBP' | 'CHF'>('USD');
  const [formSaldoIni, setFormSaldoIni] = useState<number>(50000.0);
  const [formIngressos, setFormIngressos] = useState<number>(120000.0);
  const [formUtilizacoes, setFormUtilizacoes] = useState<number>(80000.0);
  const [formTaxaPtax, setFormTaxaPtax] = useState<number>(5.80);

  // Form Operação X300
  const [formOpTipo, setFormOpTipo] = useState<TipoOperacaoExterior>('ROYALTIES');
  const [formOpPais, setFormOpPais] = useState<string>('ESTADOS UNIDOS (2496)');
  const [formOpRazao, setFormOpRazao] = useState<string>('');
  const [formOpNatureza, setFormOpNatureza] = useState<string>('Licença de Uso de Software e Patentes');
  const [formOpMoeda, setFormOpMoeda] = useState<'USD' | 'EUR' | 'BRL'>('USD');
  const [formOpValorMoeda, setFormOpValorMoeda] = useState<number>(10000.0);
  const [formOpPtax, setFormOpPtax] = useState<number>(5.80);
  const [formOpAliqIrrf, setFormOpAliqIrrf] = useState<number>(15.0);
  const [formOpAliqCide, setFormOpAliqCide] = useState<number>(10.0);

  const carregarDados = () => {
    const dados = dbService.getSpedEcfBlocoVX(empresaId, anoExercicio);
    setResumo(dados);
  };

  useEffect(() => {
    carregarDados();
  }, [anoExercicio]);

  const exibirNotificacao = (tipo: 'sucesso' | 'erro', texto: string) => {
    setNotificacao({ tipo, texto });
    setTimeout(() => setNotificacao(null), 5000);
  };

  const handleSalvarContaDerex = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formInstNome || !formContaNum) {
      exibirNotificacao('erro', 'Nome do Banco e Número da Conta são obrigatórios.');
      return;
    }

    const saldoFimMoeda = Number(formSaldoIni) + Number(formIngressos) - Number(formUtilizacoes);
    const saldoFimBRL = saldoFimMoeda * Number(formTaxaPtax);

    const res = dbService.salvarContaDerex({
      empresaId,
      anoExercicio,
      codigoInstituicaoBancaria: formInstCodigo,
      nomeInstituicao: formInstNome,
      numeroConta: formContaNum,
      paisConta: formPais,
      moeda: formMoeda,
      saldoInicialMoeda: Number(formSaldoIni),
      totalIngressosMoeda: Number(formIngressos),
      totalUtilizacoesMoeda: Number(formUtilizacoes),
      saldoFinalMoeda: saldoFimMoeda,
      saldoFinalBRL: saldoFimBRL
    });

    if (res.sucesso) {
      exibirNotificacao('sucesso', res.mensagem);
      setModalContaDerex(false);
      setFormInstNome('');
      setFormContaNum('');
      carregarDados();
    } else {
      exibirNotificacao('erro', res.mensagem);
    }
  };

  const handleSalvarOperacaoX300 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formOpRazao || !formOpNatureza) {
      exibirNotificacao('erro', 'Razão Social e Natureza da Operação são obrigatórias.');
      return;
    }

    const res = dbService.salvarOperacaoExteriorX300({
      empresaId,
      competencia: `${anoExercicio}-03`,
      tipoOperacao: formOpTipo,
      paisDestinoOrigem: formOpPais,
      razaoSocialExterior: formOpRazao,
      naturezaOperacao: formOpNatureza,
      moedaOriginal: formOpMoeda,
      valorMoedaOriginal: Number(formOpValorMoeda),
      taxaCambioPtax: Number(formOpPtax),
      aliquotaIrrfFontePercent: Number(formOpAliqIrrf),
      aliquotaCidePercent: Number(formOpAliqCide)
    });

    if (res.sucesso) {
      exibirNotificacao('sucesso', res.mensagem);
      setModalOperacaoX300(false);
      setFormOpRazao('');
      setFormOpNatureza('');
      carregarDados();
    } else {
      exibirNotificacao('erro', res.mensagem);
    }
  };

  const handleIntegrarOperacao = (id: string) => {
    const res = dbService.integrarOperacaoExteriorContabil(id);
    if (res.sucesso) {
      exibirNotificacao('sucesso', res.mensagem);
      carregarDados();
    } else {
      exibirNotificacao('erro', res.mensagem);
    }
  };

  const contasFiltradas = resumo?.contasDerex.filter(c =>
    c.nomeInstituicao.toLowerCase().includes(busca.toLowerCase()) ||
    c.numeroConta.includes(busca) ||
    c.paisConta.toLowerCase().includes(busca.toLowerCase())
  ) || [];

  const operacoesFiltradas = resumo?.operacoesExterior.filter(o =>
    o.razaoSocialExterior.toLowerCase().includes(busca.toLowerCase()) ||
    o.naturezaOperacao.toLowerCase().includes(busca.toLowerCase()) ||
    o.paisDestinoOrigem.toLowerCase().includes(busca.toLowerCase())
  ) || [];

  return (
    <div className="flex flex-col h-full bg-[#121212] text-[#e0e0e0] overflow-y-auto">
      {/* Header */}
      <div className="p-5 border-b border-[#2d2d2d] bg-[#181818] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                SPED ECF Bloco V & Bloco X - DEREX & Operações no Exterior
                <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-indigo-950/80 text-indigo-300 border border-indigo-700/50">
                  IN RFB 2.003/2021 • Domínio ctspedecf01
                </span>
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                DEREX (V020) Recursos mantidos no exterior e Registro X300 (Royalties, IRRF 0473 e CIDE 8741)
              </p>
            </div>
          </div>
        </div>

        {/* Ano & Ações */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#202020] px-3 py-1.5 rounded-lg border border-[#333333]">
            <span className="text-xs text-gray-400">Ano Exercício:</span>
            <input
              type="number"
              value={anoExercicio}
              onChange={(e) => setAnoExercicio(Number(e.target.value))}
              min="2020"
              max="2030"
              className="bg-transparent text-xs text-indigo-400 font-semibold focus:outline-none w-16"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setModalContaDerex(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Conta DEREX (V020)
            </button>
            <button
              onClick={() => setModalOperacaoX300(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Remessa Exterior (X300)
            </button>
          </div>

          <button
            onClick={carregarDados}
            title="Atualizar dados"
            className="p-2 bg-[#242424] hover:bg-[#303030] border border-[#333333] rounded-lg text-gray-300 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Alerta de Notificação */}
      {notificacao && (
        <div
          className={`mx-5 mt-4 p-3 rounded-lg text-xs flex items-center justify-between border ${
            notificacao.tipo === 'sucesso'
              ? 'bg-emerald-950/60 border-emerald-700/50 text-emerald-200'
              : 'bg-red-950/60 border-red-700/50 text-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notificacao.tipo === 'sucesso' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
            <span>{notificacao.texto}</span>
          </div>
          <button
            onClick={() => setNotificacao(null)}
            className="text-gray-400 hover:text-white text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Dashboard KPI Cards */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#181818] p-4 rounded-xl border border-[#282828] relative overflow-hidden shadow-sm">
          <div className="text-xs font-medium text-gray-400">Total em Contas no Exterior (BRL)</div>
          <div className="text-2xl font-bold text-white mt-1">
            R$ {(resumo?.totalContasExteriorDerexBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-indigo-400 mt-2 flex items-center gap-1">
            <Landmark className="w-3.5 h-3.5" />
            <span>{resumo?.contasDerex.length || 0} contas DEREX ativas</span>
          </div>
          <div className="absolute -right-3 -bottom-3 opacity-5 text-white pointer-events-none">
            <Landmark className="w-24 h-24" />
          </div>
        </div>

        <div className="bg-[#181818] p-4 rounded-xl border border-[#282828] relative overflow-hidden shadow-sm">
          <div className="text-xs font-medium text-gray-400">Remessas / Serviços Técnicos (BRL)</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            R$ {(resumo?.totalRemessasExteriorBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1">
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Registro X300 ECF</span>
          </div>
          <div className="absolute -right-3 -bottom-3 opacity-5 text-emerald-400 pointer-events-none">
            <ArrowRightLeft className="w-24 h-24" />
          </div>
        </div>

        <div className="bg-[#181818] p-4 rounded-xl border border-[#282828] relative overflow-hidden shadow-sm">
          <div className="text-xs font-medium text-gray-400">IRRF na Fonte Retido (DARF 0473)</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">
            R$ {(resumo?.totalIrrfRetidoExteriorBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-amber-300 mt-2 flex items-center gap-1">
            <BadgePercent className="w-3.5 h-3.5" />
            <span>15% regra geral / 25% paraísos</span>
          </div>
          <div className="absolute -right-3 -bottom-3 opacity-5 text-amber-400 pointer-events-none">
            <BadgePercent className="w-24 h-24" />
          </div>
        </div>

        <div className="bg-[#181818] p-4 rounded-xl border border-[#282828] relative overflow-hidden shadow-sm">
          <div className="text-xs font-medium text-gray-400">CIDE Remessas Exterior (DARF 8741)</div>
          <div className="text-2xl font-bold text-cyan-400 mt-1">
            R$ {(resumo?.totalCideRecolhidaBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-cyan-300 mt-2 flex items-center gap-1">
            <Coins className="w-3.5 h-3.5" />
            <span>Alíquota 10% Lei 10.168/2000</span>
          </div>
          <div className="absolute -right-3 -bottom-3 opacity-5 text-cyan-400 pointer-events-none">
            <Coins className="w-24 h-24" />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="px-5 border-b border-[#2d2d2d] flex items-center justify-between gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('blocoV')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'blocoV'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Landmark className="w-4 h-4" />
            Bloco V - DEREX Moeda Estrangeira ({resumo?.contasDerex.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('blocoX')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'blocoX'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            Bloco X - Operações no Exterior X300 ({resumo?.operacoesExterior.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('integracao')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'integracao'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            DARFs & Integração Contábil
          </button>
          <button
            onClick={() => setActiveTab('laudoA4')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'laudoA4'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Printer className="w-4 h-4" />
            Laudo Consolidado Exterior A4
          </button>
        </div>

        {/* Busca rápida */}
        <div className="relative mb-2">
          <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por instituição, país ou natureza..."
            className="bg-[#202020] border border-[#333333] rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-indigo-500 w-64"
          />
        </div>
      </div>

      {/* Conteúdo das Abas */}
      <div className="p-5 flex-1">
        {/* ABA 1: BLOCO V - DEREX */}
        {activeTab === 'blocoV' && (
          <div className="bg-[#181818] border border-[#2d2d2d] rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#2d2d2d] flex justify-between items-center bg-[#1f1f1f]">
              <div className="text-xs font-semibold text-gray-300">
                Registro V020 - Contas Bancárias no Exterior (DEREX {anoExercicio})
              </div>
              <div className="text-xs text-gray-400">
                Obrigatório conforme Lei nº 11.371/2006 e IN RFB nº 2.003/2021
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300 border-collapse">
                <thead className="bg-[#222222] text-gray-400 font-medium border-b border-[#2d2d2d]">
                  <tr>
                    <th className="py-2.5 px-3">Cód. / Instituição</th>
                    <th className="py-2.5 px-3">Conta / Agência</th>
                    <th className="py-2.5 px-3">País BACEN</th>
                    <th className="py-2.5 px-3">Moeda</th>
                    <th className="py-2.5 px-3 text-right">Saldo Inicial</th>
                    <th className="py-2.5 px-3 text-right">Ingressos (+)</th>
                    <th className="py-2.5 px-3 text-right">Utilizações (-)</th>
                    <th className="py-2.5 px-3 text-right">Saldo Final (Moeda)</th>
                    <th className="py-2.5 px-3 text-right">Saldo Convertido (BRL)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#282828]">
                  {contasFiltradas.map((c) => (
                    <tr key={c.id} className="hover:bg-[#202020] transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-white">{c.nomeInstituicao}</div>
                        <div className="text-[10px] text-gray-500 font-mono">Cód: {c.codigoInstituicaoBancaria}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-gray-300">{c.numeroConta}</td>
                      <td className="py-2.5 px-3 text-gray-300">{c.paisConta}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#2a2a2a] text-indigo-300 border border-[#3a3a3a]">
                          {c.moeda}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-400">
                        {c.saldoInicialMoeda.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-400">
                        +{c.totalIngressosMoeda.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-amber-400">
                        -{c.totalUtilizacoesMoeda.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-white">
                        {c.saldoFinalMoeda.toLocaleString('en-US', { minimumFractionDigits: 2 })} {c.moeda}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-indigo-400">
                        R$ {c.saldoFinalBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 2: BLOCO X - OPERAÇÕES NO EXTERIOR X300 */}
        {activeTab === 'blocoX' && (
          <div className="bg-[#181818] border border-[#2d2d2d] rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#2d2d2d] flex justify-between items-center bg-[#1f1f1f]">
              <div className="text-xs font-semibold text-gray-300">
                Registro X300 - Remessas e Serviços Técnicos com o Exterior ({operacoesFiltradas.length} operações)
              </div>
              <div className="text-xs text-gray-400">
                Retenção na fonte DARF 0473 (IRRF) e recolhimento de CIDE DARF 8741
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300 border-collapse">
                <thead className="bg-[#222222] text-gray-400 font-medium border-b border-[#2d2d2d]">
                  <tr>
                    <th className="py-2.5 px-3">Tipo Operação</th>
                    <th className="py-2.5 px-3">Beneficiário Exterior</th>
                    <th className="py-2.5 px-3">País</th>
                    <th className="py-2.5 px-3">Natureza do Serviço</th>
                    <th className="py-2.5 px-3 text-right">Valor Moeda Original</th>
                    <th className="py-2.5 px-3 text-right">PTAX</th>
                    <th className="py-2.5 px-3 text-right">Valor (BRL)</th>
                    <th className="py-2.5 px-3 text-right">IRRF (15%)</th>
                    <th className="py-2.5 px-3 text-right">CIDE (10%)</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#282828]">
                  {operacoesFiltradas.map((o) => (
                    <tr key={o.id} className="hover:bg-[#202020] transition-colors">
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#2a2a2a] text-indigo-300 border border-[#3a3a3a]">
                          {o.tipoOperacao}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-white">{o.razaoSocialExterior}</td>
                      <td className="py-2.5 px-3 text-gray-400">{o.paisDestinoOrigem}</td>
                      <td className="py-2.5 px-3 text-gray-300">{o.naturezaOperacao}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-300">
                        {o.moedaOriginal} {o.valorMoedaOriginal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-400">
                        {o.taxaCambioPtax.toFixed(4)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-white">
                        R$ {o.valorConvertidoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-amber-400">
                        R$ {o.valorIrrfFonteBRL.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-cyan-400">
                        R$ {o.valorCideBRL.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {o.integradoContabil ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                            Integrado
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-950/60 text-amber-300 border border-amber-800/40">
                            Pendente
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {!o.integradoContabil && (
                          <button
                            onClick={() => handleIntegrarOperacao(o.id)}
                            title="Integrar Contabilmente"
                            className="p-1 text-gray-400 hover:text-emerald-400 bg-[#252525] hover:bg-[#303030] rounded border border-[#383838] cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 3: DARFs & INTEGRAÇÃO CONTÁBIL */}
        {activeTab === 'integracao' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* DARF 0473 - IRRF */}
            <div className="bg-[#181818] p-5 rounded-xl border border-[#2d2d2d]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded text-amber-400">
                    <BadgePercent className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">DARF 0473 - IRRF Serviços no Exterior</h3>
                    <p className="text-[11px] text-gray-400">Incidência na data do fato gerador (pagamento/remessa)</p>
                  </div>
                </div>
                <span className="font-mono text-base font-bold text-amber-400">
                  R$ {(resumo?.totalIrrfRetidoExteriorBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="space-y-2 text-xs bg-[#202020] p-3 rounded border border-[#2e2e2e]">
                <div className="flex justify-between">
                  <span className="text-gray-400">Código de Receita:</span>
                  <span className="font-mono text-white">0473</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Alíquota Padrão:</span>
                  <span className="text-white">15,00% (ou 25% paraísos fiscais)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Vencimento:</span>
                  <span className="text-white">Último dia útil do 1º decêndio do mês subsequente</span>
                </div>
              </div>
            </div>

            {/* DARF 8741 - CIDE Remessas */}
            <div className="bg-[#181818] p-5 rounded-xl border border-[#2d2d2d]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded text-cyan-400">
                    <Coins className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">DARF 8741 - CIDE Royalties e Técnicos</h3>
                    <p className="text-[11px] text-gray-400">Contribuição de Intervenção no Domínio Econômico</p>
                  </div>
                </div>
                <span className="font-mono text-base font-bold text-cyan-400">
                  R$ {(resumo?.totalCideRecolhidaBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="space-y-2 text-xs bg-[#202020] p-3 rounded border border-[#2e2e2e]">
                <div className="flex justify-between">
                  <span className="text-gray-400">Código de Receita:</span>
                  <span className="font-mono text-white">8741</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Alíquota CIDE:</span>
                  <span className="text-white">10,00% (Lei nº 10.168/2000)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Vencimento:</span>
                  <span className="text-white">Último dia útil da quinzena subsequente ao mês de ocorrência</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 4: LAUDO OFICIAL EXTERIOR A4 */}
        {activeTab === 'laudoA4' && (
          <div className="flex justify-center">
            <div className="w-[210mm] bg-[#1a1a1a] text-gray-200 border border-[#333333] p-10 shadow-2xl rounded-sm text-xs">
              {/* Topo A4 */}
              <div className="border-b-2 border-indigo-500 pb-4 mb-6 flex justify-between items-start">
                <div>
                  <h2 className="text-base font-bold text-white uppercase tracking-wider">
                    LAUDO CONSOLIDADO DE OPERAÇÕES NO EXTERIOR & DEREX
                  </h2>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Declaração ECF - Bloco V (Recursos no Exterior) & Bloco X (Remessas e Royalties)
                  </p>
                  <p className="text-[10px] text-indigo-400 font-semibold mt-0.5">
                    Instrução Normativa RFB nº 2.003/2021 • Lei nº 11.371/2006
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-white">EMPRESA MODELO S/A</div>
                  <div className="text-[10px] text-gray-400">CNPJ: 00.000.000/0001-91</div>
                  <div className="text-[10px] text-indigo-400 font-mono mt-1">Exercício: {anoExercicio}</div>
                </div>
              </div>

              {/* Contas Bancárias DEREX */}
              <div className="mb-6">
                <span className="text-xs font-bold text-white uppercase block mb-2">
                  1. RECURSOS MANTIDOS EM CONTAS BANCÁRIAS NO EXTERIOR (REGISTRO V020)
                </span>
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="border-b border-gray-600 font-semibold text-gray-300">
                      <th className="py-1 px-2">Banco</th>
                      <th className="py-1 px-2">Conta</th>
                      <th className="py-1 px-2">País</th>
                      <th className="py-1 px-2 text-right">Saldo Final (Moeda)</th>
                      <th className="py-1 px-2 text-right">Saldo em Reais (BRL)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a2a2a]">
                    {resumo?.contasDerex.map(c => (
                      <tr key={c.id}>
                        <td className="py-1 px-2 text-white">{c.nomeInstituicao}</td>
                        <td className="py-1 px-2 font-mono text-gray-400">{c.numeroConta}</td>
                        <td className="py-1 px-2 text-gray-300">{c.paisConta}</td>
                        <td className="py-1 px-2 text-right font-mono text-white">
                          {c.saldoFinalMoeda.toLocaleString('en-US', { minimumFractionDigits: 2 })} {c.moeda}
                        </td>
                        <td className="py-1 px-2 text-right font-mono font-bold text-indigo-400">
                          R$ {c.saldoFinalBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-gray-600 font-bold text-white">
                      <td colSpan={4} className="py-1.5 px-2 text-right">TOTAL ATIVOS EXTERIOR:</td>
                      <td className="py-1.5 px-2 text-right font-mono text-indigo-400">
                        R$ {(resumo?.totalContasExteriorDerexBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Operações Registro X300 */}
              <div className="mb-8">
                <span className="text-xs font-bold text-white uppercase block mb-2">
                  2. REMESSAS E CONTRATOS DE SERVIÇOS TÉCNICOS / ROYALTIES (REGISTRO X300)
                </span>
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="border-b border-gray-600 font-semibold text-gray-300">
                      <th className="py-1 px-2">Beneficiário</th>
                      <th className="py-1 px-2">Natureza</th>
                      <th className="py-1 px-2 text-right">Total (BRL)</th>
                      <th className="py-1 px-2 text-right">IRRF (15%)</th>
                      <th className="py-1 px-2 text-right">CIDE (10%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a2a2a]">
                    {resumo?.operacoesExterior.map(o => (
                      <tr key={o.id}>
                        <td className="py-1 px-2 text-white">{o.razaoSocialExterior}</td>
                        <td className="py-1 px-2 text-gray-300">{o.naturezaOperacao}</td>
                        <td className="py-1 px-2 text-right font-mono text-white">
                          R$ {o.valorConvertidoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-1 px-2 text-right font-mono text-amber-400">
                          R$ {o.valorIrrfFonteBRL.toFixed(2)}
                        </td>
                        <td className="py-1 px-2 text-right font-mono text-cyan-400">
                          R$ {o.valorCideBRL.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-gray-600 font-bold text-white">
                      <td colSpan={2} className="py-1.5 px-2 text-right">TOTAIS RECOLHIDOS:</td>
                      <td className="py-1.5 px-2 text-right font-mono">
                        R$ {(resumo?.totalRemessasExteriorBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-1.5 px-2 text-right font-mono text-amber-400">
                        R$ {(resumo?.totalIrrfRetidoExteriorBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-1.5 px-2 text-right font-mono text-cyan-400">
                        R$ {(resumo?.totalCideRecolhidaBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Assinaturas */}
              <div className="mt-12 pt-8 border-t border-[#333333] grid grid-cols-2 gap-12 text-center text-[10px] text-gray-400">
                <div>
                  <div className="border-b border-gray-500 pb-1 w-3/4 mx-auto mb-1 text-white font-medium">
                    DIRETORIA FINANCEIRA / CÂMBIO
                  </div>
                  <div>Declarante Responsável</div>
                </div>

                <div>
                  <div className="border-b border-gray-500 pb-1 w-3/4 mx-auto mb-1 text-white font-medium">
                    CONTADOR RESPONSÁVEL TÉCNICO
                  </div>
                  <div>CRC 1SP999999/O-0</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: NOVA CONTA DEREX V020 */}
      {modalContaDerex && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1c1c1c] border border-[#333333] rounded-xl max-w-lg w-full p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Landmark className="w-4 h-4 text-indigo-400" />
              Cadastrar Conta Bancária no Exterior (DEREX V020)
            </h3>

            <form onSubmit={handleSalvarContaDerex} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Código Instituição:</label>
                  <input
                    type="text"
                    value={formInstCodigo}
                    onChange={(e) => setFormInstCodigo(e.target.value)}
                    placeholder="JPM-US"
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Nome da Instituição Financeira:</label>
                  <input
                    type="text"
                    value={formInstNome}
                    onChange={(e) => setFormInstNome(e.target.value)}
                    placeholder="JPMorgan Chase Bank, N.A."
                    required
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Número da Conta:</label>
                  <input
                    type="text"
                    value={formContaNum}
                    onChange={(e) => setFormContaNum(e.target.value)}
                    placeholder="987-654321-01"
                    required
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">País da Conta (BACEN):</label>
                  <input
                    type="text"
                    value={formPais}
                    onChange={(e) => setFormPais(e.target.value)}
                    placeholder="ESTADOS UNIDOS (2496)"
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Moeda Estrangeira:</label>
                  <select
                    value={formMoeda}
                    onChange={(e) => setFormMoeda(e.target.value as any)}
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="USD">USD - Dólar Americano</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - Libra Esterlina</option>
                    <option value="CHF">CHF - Franco Suíço</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Taxa PTAX BACEN Encerramento:</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formTaxaPtax}
                    onChange={(e) => setFormTaxaPtax(Number(e.target.value))}
                    min="0"
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Saldo Inicial:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formSaldoIni}
                    onChange={(e) => setFormSaldoIni(Number(e.target.value))}
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Ingressos (+):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formIngressos}
                    onChange={(e) => setFormIngressos(Number(e.target.value))}
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Utilizações (-):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formUtilizacoes}
                    onChange={(e) => setFormUtilizacoes(Number(e.target.value))}
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#333333]">
                <button
                  type="button"
                  onClick={() => setModalContaDerex(false)}
                  className="px-3 py-1.5 bg-[#2a2a2a] hover:bg-[#333333] text-gray-300 rounded text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold cursor-pointer"
                >
                  Salvar Conta DEREX
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVA OPERAÇÃO EXTERIOR X300 */}
      {modalOperacaoX300 && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1c1c1c] border border-[#333333] rounded-xl max-w-lg w-full p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              Lançar Remessa / Serviço com o Exterior (Registro X300)
            </h3>

            <form onSubmit={handleSalvarOperacaoX300} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Tipo de Operação:</label>
                  <select
                    value={formOpTipo}
                    onChange={(e) => setFormOpTipo(e.target.value as any)}
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ROYALTIES">Royalties / Licença de Uso</option>
                    <option value="SERVICO_TOMADO">Serviço Técnico Tomado</option>
                    <option value="EXPORTACAO_BENS">Exportação de Bens</option>
                    <option value="DIVIDENDOS">Remessa de Dividendos</option>
                    <option value="APORTE_CAPITAL">Aporte de Capital</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">País de Destino / Origem:</label>
                  <input
                    type="text"
                    value={formOpPais}
                    onChange={(e) => setFormOpPais(e.target.value)}
                    placeholder="ESTADOS UNIDOS (2496)"
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Razão Social do Beneficiário no Exterior:</label>
                <input
                  type="text"
                  value={formOpRazao}
                  onChange={(e) => setFormOpRazao(e.target.value)}
                  placeholder="Ex: Silicon Valley Tech Inc."
                  required
                  className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Natureza do Contrato / Serviço:</label>
                <input
                  type="text"
                  value={formOpNatureza}
                  onChange={(e) => setFormOpNatureza(e.target.value)}
                  placeholder="Ex: Licenciamento de Software ERP em Nuvem"
                  required
                  className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Moeda:</label>
                  <select
                    value={formOpMoeda}
                    onChange={(e) => setFormOpMoeda(e.target.value as any)}
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="BRL">BRL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Valor Moeda:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formOpValorMoeda}
                    onChange={(e) => setFormOpValorMoeda(Number(e.target.value))}
                    min="0"
                    required
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Taxa PTAX:</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formOpPtax}
                    onChange={(e) => setFormOpPtax(Number(e.target.value))}
                    min="0"
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Alíq. IRRF Fonte (%):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formOpAliqIrrf}
                    onChange={(e) => setFormOpAliqIrrf(Number(e.target.value))}
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Alíq. CIDE (%):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formOpAliqCide}
                    onChange={(e) => setFormOpAliqCide(Number(e.target.value))}
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#333333]">
                <button
                  type="button"
                  onClick={() => setModalOperacaoX300(false)}
                  className="px-3 py-1.5 bg-[#2a2a2a] hover:bg-[#333333] text-gray-300 rounded text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold cursor-pointer"
                >
                  Salvar Operação X300
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
