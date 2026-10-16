import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  PieChart,
  Scale,
  Building,
  FileCheck2,
  Printer,
  Sparkles,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Share2,
  Percent,
  Coins,
  ShieldCheck,
  Link2
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  InvestimentoParticipacaoMep,
  ApuracaoPeriodicaMep,
  ResumoMepMaisValia
} from '../../types/contabil';

interface MepModuleProps {
  empresaId?: number;
}

export const MepMaisValiaAgioModule: React.FC<MepModuleProps> = ({ empresaId = 1 }) => {
  const [exercicio, setExercicio] = useState<string>('2026');
  const [activeTab, setActiveTab] = useState<'CARTEIRA' | 'APURACOES' | 'LALUR' | 'LAUDO_PREVIEW'>('CARTEIRA');
  const [resumo, setResumo] = useState<ResumoMepMaisValia | null>(null);
  const [selectedInvestimento, setSelectedInvestimento] = useState<InvestimentoParticipacaoMep | null>(null);
  const [selectedApuracao, setSelectedApuracao] = useState<ApuracaoPeriodicaMep | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ tipo: 'sucesso' | 'info'; texto: string } | null>(null);

  const carregarDados = () => {
    const dados = dbService.getMepMaisValia(empresaId, exercicio);
    setResumo(dados);
    if (dados.investimentos.length > 0 && !selectedInvestimento) {
      setSelectedInvestimento(dados.investimentos[0]);
    }
    if (dados.apuracoes.length > 0 && !selectedApuracao) {
      setSelectedApuracao(dados.apuracoes[0]);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [empresaId, exercicio]);

  const handleIntegrar = (apuracaoId: string) => {
    const res = dbService.integrarMepContabilELalur(apuracaoId);
    if (res.sucesso) {
      setFeedbackMsg({ tipo: 'sucesso', texto: res.mensagem });
      carregarDados();
    } else {
      setFeedbackMsg({ tipo: 'info', texto: res.mensagem });
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#121212] text-gray-200 p-4 space-y-4 overflow-y-auto">
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#262626] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-600/20 text-purple-400 rounded border border-purple-500/30">
              <PieChart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Equivalência Patrimonial Avançada & Mais-Valia de Ativos
                <span className="text-xs bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-800 font-mono">
                  CPC 15 / CPC 18 (R2)
                </span>
              </h1>
              <p className="text-xs text-gray-400">
                Lei nº 6.404/76 arts. 248 a 250 • Lei nº 12.973/2014 • RIR/2018 arts. 416-425 • Domínio Contábil & LALUR ctc04.pbd
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-[#1a1a1a] border border-[#333] px-3 py-1.5 rounded text-xs">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-400">Exercício:</span>
            <input
              type="text"
              value={exercicio}
              onChange={(e) => setExercicio(e.target.value)}
              className="bg-transparent border-none text-white focus:outline-none font-mono text-xs w-14 cursor-pointer"
            />
          </div>

          <button
            onClick={() => setActiveTab('LAUDO_PREVIEW')}
            className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors border ${
              activeTab === 'LAUDO_PREVIEW'
                ? 'bg-purple-700 text-white border-purple-600'
                : 'bg-[#1e1e1e] hover:bg-[#252525] text-gray-300 border-[#333]'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            Laudo de Apuração MEP (A4)
          </button>
        </div>
      </div>

      {/* FEEDBACK BANNER */}
      {feedbackMsg && (
        <div className="flex items-center justify-between bg-emerald-950/60 border border-emerald-700/50 text-emerald-200 px-4 py-2.5 rounded text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedbackMsg.texto}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-gray-400 hover:text-white font-mono text-xs ml-4">
            ×
          </button>
        </div>
      )}

      {/* CARDS DE RESUMO DO MEP */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-[#181818] border border-[#262626] p-3 rounded flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-400 uppercase font-semibold">Investimentos em Participações</div>
            <div className="text-xl font-bold text-white mt-0.5">
              R$ {(resumo?.totalInvestimentosAtivoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-purple-400 mt-0.5 font-medium">Ativo Não Circulante (Coligadas/Controladas)</div>
          </div>
          <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
            <Building className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#181818] border border-[#262626] p-3 rounded flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-400 uppercase font-semibold">Receita Líquida de MEP</div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">
              R$ {(resumo?.totalReceitaMepPeriodoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-emerald-400 mt-0.5 font-medium flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              Ganhos de Equivalência no Período
            </div>
          </div>
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#181818] border border-[#262626] p-3 rounded flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-400 uppercase font-semibold">Amortização de Mais-Valia</div>
            <div className="text-xl font-bold text-amber-400 mt-0.5">
              R$ {(resumo?.totalAmortizacaoMaisValiaBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">Depreciação dos Ativos Subjacentes</div>
          </div>
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#181818] border border-[#262626] p-3 rounded flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-400 uppercase font-semibold">Exclusão LALUR (Parte A)</div>
            <div className="text-xl font-bold text-sky-400 mt-0.5">
              R$ {(resumo?.impactoLalurParteAExclusoesBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-sky-400 mt-0.5 font-medium">Art. 418 RIR/18 (Não Tributável)</div>
          </div>
          <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-lg border border-sky-500/20">
            <Scale className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* BARRA DE NAVEGAÇÃO DE ABAS */}
      <div className="flex border-b border-[#262626] gap-2">
        <button
          onClick={() => setActiveTab('CARTEIRA')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'CARTEIRA'
              ? 'border-purple-500 text-purple-400 bg-purple-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          Carteira de Investimentos & PPA (CPC 15)
        </button>

        <button
          onClick={() => setActiveTab('APURACOES')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'APURACOES'
              ? 'border-purple-500 text-purple-400 bg-purple-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Apuração Periódica do MEP (CPC 18)
        </button>

        <button
          onClick={() => setActiveTab('LALUR')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'LALUR'
              ? 'border-purple-500 text-purple-400 bg-purple-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          Reflexos Tributários LALUR/LACS (Lei 12.973)
        </button>

        <button
          onClick={() => setActiveTab('LAUDO_PREVIEW')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'LAUDO_PREVIEW'
              ? 'border-purple-500 text-purple-400 bg-purple-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Printer className="w-3.5 h-3.5" />
          Laudo Oficial de Avaliação (A4)
        </button>
      </div>

      {/* TAB 1: CARTEIRA DE INVESTIMENTOS & PPA */}
      {activeTab === 'CARTEIRA' && (
        <div className="space-y-4">
          <div className="bg-[#181818] border border-[#282828] rounded overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1f1f1f] border-b border-[#2d2d2d] text-gray-400 font-medium">
                <tr>
                  <th className="py-2.5 px-3">Investida / CNPJ</th>
                  <th className="py-2.5 px-3">Tipo Societário</th>
                  <th className="py-2.5 px-3">% Participação</th>
                  <th className="py-2.5 px-3 font-mono text-right">Custo de Aquisição</th>
                  <th className="py-2.5 px-3 font-mono text-right">Fração do PL</th>
                  <th className="py-2.5 px-3 font-mono text-right">Mais-Valia (PPA)</th>
                  <th className="py-2.5 px-3 font-mono text-right">Goodwill (Ágio)</th>
                  <th className="py-2.5 px-3">Subcontas Contábeis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#242424]">
                {resumo?.investimentos.map(inv => (
                  <tr
                    key={inv.id}
                    onClick={() => setSelectedInvestimento(inv)}
                    className={`hover:bg-[#202020] transition-colors cursor-pointer ${
                      selectedInvestimento?.id === inv.id ? 'bg-[#222222] border-l-2 border-purple-500' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-white">{inv.investidaRazaoSocial}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{inv.investidaCnpj}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                        inv.tipoInvestimento === 'CONTROLADA'
                          ? 'bg-purple-950/60 text-purple-300 border-purple-800'
                          : 'bg-blue-950/60 text-blue-300 border-blue-800'
                      }`}>
                        {inv.tipoInvestimento}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-gray-200">
                      {inv.percentualCapitalTotal.toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-white">
                      R$ {inv.custoTotalAquisicaoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-gray-300">
                      R$ {inv.fracaoPlAdquiridaBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-amber-300 font-medium">
                      R$ {inv.maisValiaAtivosIdentificaveisBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-medium">
                      R$ {inv.goodwillRentabilidadeFuturaBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-[10px] font-mono text-gray-400">
                      <div>PL: {inv.contaContabilInvestimentoPl}</div>
                      <div>MV: {inv.contaContabilMaisValia}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* DETALHAMENTO DO PPA DO INVESTIMENTO SELECIONADO */}
          {selectedInvestimento && (
            <div className="bg-[#181818] border border-[#282828] p-4 rounded space-y-3">
              <div className="flex items-center justify-between border-b border-[#262626] pb-2">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-purple-400" />
                  <span className="font-semibold text-white text-xs">
                    Desdobramento do Custo de Aquisição (PPA - Purchase Price Allocation) • {selectedInvestimento.investidaRazaoSocial}
                  </span>
                </div>
                <div className="text-[11px] text-gray-400">
                  Data de Aquisição: <span className="text-gray-200 font-mono">{selectedInvestimento.dataAquisicao}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-[#141414] border border-[#242424] p-3 rounded text-xs space-y-1">
                  <div className="text-gray-400 text-[11px] font-medium">1. Parcela do PL Contábil</div>
                  <div className="text-base font-bold text-white font-mono">
                    R$ {selectedInvestimento.fracaoPlAdquiridaBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {selectedInvestimento.percentualCapitalTotal}% de R$ {selectedInvestimento.plInvestidaNaAquisicaoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (PL da Investida)
                  </div>
                </div>

                <div className="bg-[#141414] border border-[#242424] p-3 rounded text-xs space-y-1">
                  <div className="text-amber-400 text-[11px] font-medium">2. Mais-Valia de Ativos a Fair Value</div>
                  <div className="text-base font-bold text-amber-300 font-mono">
                    R$ {selectedInvestimento.maisValiaAtivosIdentificaveisBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    Diferença entre Valor Justo e Valor Contábil (Amortização vinculada à depreciação)
                  </div>
                </div>

                <div className="bg-[#141414] border border-[#242424] p-3 rounded text-xs space-y-1">
                  <div className="text-emerald-400 text-[11px] font-medium">3. Goodwill por Rentabilidade Futura</div>
                  <div className="text-base font-bold text-emerald-300 font-mono">
                    R$ {selectedInvestimento.goodwillRentabilidadeFuturaBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    Excedente econômico sujeito a Teste Anual de Impairment (CPC 01)
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: APURAÇÕES PERIÓDICAS DO MEP */}
      {activeTab === 'APURACOES' && (
        <div className="space-y-4">
          <div className="bg-[#181818] border border-[#282828] rounded overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1f1f1f] border-b border-[#2d2d2d] text-gray-400 font-medium">
                <tr>
                  <th className="py-2.5 px-3">Investida</th>
                  <th className="py-2.5 px-3">Exercício</th>
                  <th className="py-2.5 px-3 font-mono text-right">Lucro Líquido Investida</th>
                  <th className="py-2.5 px-3 font-mono text-right">Lucros Não Realizados</th>
                  <th className="py-2.5 px-3 font-mono text-right">Base MEP</th>
                  <th className="py-2.5 px-3 font-mono text-right">Resultado MEP</th>
                  <th className="py-2.5 px-3 font-mono text-right">Amort. Mais-Valia</th>
                  <th className="py-2.5 px-3 font-mono text-right">Saldo Final Ativo</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#242424]">
                {resumo?.apuracoes.map(apur => {
                  const inv = resumo.investimentos.find(i => i.id === apur.investimentoId);
                  return (
                    <tr
                      key={apur.id}
                      onClick={() => setSelectedApuracao(apur)}
                      className={`hover:bg-[#202020] transition-colors cursor-pointer ${
                        selectedApuracao?.id === apur.id ? 'bg-[#222222] border-l-2 border-purple-500' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-semibold text-white">
                        {inv?.investidaRazaoSocial || 'Investida'}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-gray-300">{apur.competencia}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-200">
                        R$ {apur.lucroPrejuizoLiquidoInvestidaBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-rose-400">
                        R$ {apur.lucrosNaoRealizadosIntercompanyBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-300 font-medium">
                        R$ {apur.baseCalculoMepBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                        R$ {apur.resultadoMepCalculadoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-amber-300">
                        R$ {apur.amortizacaoMaisValiaPeriodoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                        R$ {apur.saldoContabilInvestimentoFinalBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                          {apur.statusIntegracao.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleIntegrar(apur.id); }}
                          className="px-2 py-1 bg-purple-700 hover:bg-purple-600 text-white rounded text-[11px] font-medium transition-colors shadow-sm"
                        >
                          Integrar
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

      {/* TAB 3: LALUR/LACS REFLEXOS TRIBUTÁRIOS */}
      {activeTab === 'LALUR' && (
        <div className="space-y-4">
          <div className="bg-[#181818] border border-[#282828] p-4 rounded space-y-3">
            <div className="flex items-center gap-2 border-b border-[#262626] pb-2 text-xs font-semibold text-white">
              <Scale className="w-4 h-4 text-sky-400" />
              <span>Memória de Cálculo de Ajustes no Livro Eletrônico LALUR / LACS (ECF Blocos M300 / M350)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* PARTE A */}
              <div className="bg-[#141414] border border-[#242424] p-3 rounded text-xs space-y-2">
                <div className="text-sky-300 font-bold border-b border-[#222] pb-1">
                  Parte A • Exclusões do Lucro Líquido (Art. 418 RIR/2018)
                </div>
                <div className="text-gray-300 leading-relaxed text-[11px]">
                  Os resultados positivos decorrentes da aplicação do método de equivalência patrimonial não integram a base de cálculo do IRPJ e da CSLL.
                </div>
                <div className="bg-[#191919] p-2.5 rounded border border-[#282828] flex justify-between items-center font-mono">
                  <span>Código ECF: M010_EXCLUSAO_MEP</span>
                  <span className="text-emerald-400 font-bold">
                    (-) R$ {(resumo?.impactoLalurParteAExclusoesBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* PARTE B */}
              <div className="bg-[#141414] border border-[#242424] p-3 rounded text-xs space-y-2">
                <div className="text-amber-300 font-bold border-b border-[#222] pb-1">
                  Parte B • Controle de Subcontas Vinculadas (Lei nº 12.973/2014)
                </div>
                <div className="text-gray-300 leading-relaxed text-[11px]">
                  A mais-valia e o ágio por rentabilidade futura (goodwill) permanecem controlados em subcontas patrimoniais distintas, com dedutibilidade admitida na realização ou baixa da participação.
                </div>
                <div className="bg-[#191919] p-2.5 rounded border border-[#282828] space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Saldo Mais-Valia Controlada:</span>
                    <span className="text-amber-300 font-bold">R$ 1.024.000,00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Saldo Goodwill Controlado:</span>
                    <span className="text-purple-300 font-bold">R$ 500.000,00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LAUDO OFICIAL DE EQUIVALÊNCIA PATRIMONIAL A4 */}
      {activeTab === 'LAUDO_PREVIEW' && selectedInvestimento && (
        <div className="space-y-3">
          <div className="flex justify-end gap-2">
            <button
              onClick={() => window.print()}
              className="bg-purple-700 hover:bg-purple-600 text-white px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir Laudo Oficial (A4)
            </button>
          </div>

          <div className="bg-white text-gray-900 p-8 rounded shadow-xl font-serif max-w-4xl mx-auto border border-gray-400 text-[11px] leading-relaxed">
            <div className="border-b-2 border-purple-900 pb-3 mb-4 text-center">
              <div className="font-bold text-sm tracking-wide">EMPRESA INDUSTRIAL DE BEBIDAS MINAS S.A.</div>
              <div className="text-[10px] text-gray-600 font-mono">CNPJ: 12.345.678/0001-95 • NIRE 31.300.124.980</div>
              <div className="font-bold text-base uppercase text-purple-900 mt-2 underline">
                LAUDO DE AVALIAÇÃO PATRIMONIAL & DEMONSTRAÇÃO DO MÉTODO DE EQUIVALÊNCIA PATRIMONIAL (MEP)
              </div>
              <div className="text-[10px] text-gray-600 italic">
                Elaborado em estrita conformidade com o Pronunciamento Técnico CPC 18 (R2), CPC 15 (R1) e Lei nº 6.404/76
              </div>
            </div>

            {/* SEÇÃO I: DADOS DA INVESTIDORA E INVESTIDA */}
            <div className="mb-4">
              <div className="bg-gray-100 font-bold px-2 py-1 uppercase text-[10px] border border-gray-300">
                1. Identificação das Sociedades e Percentuais de Participação
              </div>
              <table className="w-full border-collapse border border-gray-300 mt-1 text-[10px]">
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-1 font-bold w-1/4">Sociedade Investida:</td>
                    <td className="border border-gray-300 p-1 w-1/4 font-bold">{selectedInvestimento.investidaRazaoSocial}</td>
                    <td className="border border-gray-300 p-1 font-bold w-1/4">CNPJ da Investida:</td>
                    <td className="border border-gray-300 p-1 w-1/4 font-mono">{selectedInvestimento.investidaCnpj}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-1 font-bold">Classificação Societária:</td>
                    <td className="border border-gray-300 p-1 font-bold text-purple-900">{selectedInvestimento.tipoInvestimento}</td>
                    <td className="border border-gray-300 p-1 font-bold">Percentual no Capital:</td>
                    <td className="border border-gray-300 p-1 font-mono font-bold">{selectedInvestimento.percentualCapitalTotal}%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SEÇÃO II: DEMONSTRAÇÃO DO CUSTO E PPA */}
            <div className="mb-4">
              <div className="bg-gray-100 font-bold px-2 py-1 uppercase text-[10px] border border-gray-300">
                2. Desdobramento do Custo de Aquisição (PPA a Valor Justo)
              </div>
              <table className="w-full border-collapse border border-gray-300 mt-1 text-[10px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-300 p-1">Componente do Investimento</th>
                    <th className="border border-gray-300 p-1">Conta Contábil</th>
                    <th className="border border-gray-300 p-1 text-right">Valor Inicial (Aquisição)</th>
                    <th className="border border-gray-300 p-1 text-right">Saldo Atualizado ({exercicio})</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-1 font-medium">Patrimônio Líquido Proporcional da Investida</td>
                    <td className="border border-gray-300 p-1 font-mono">{selectedInvestimento.contaContabilInvestimentoPl}</td>
                    <td className="border border-gray-300 p-1 text-right font-mono">
                      R$ {selectedInvestimento.fracaoPlAdquiridaBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="border border-gray-300 p-1 text-right font-mono font-bold">
                      R$ 3.720.000,00
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-1 font-medium">Mais-Valia de Ativos Identificáveis (Fair Value)</td>
                    <td className="border border-gray-300 p-1 font-mono">{selectedInvestimento.contaContabilMaisValia}</td>
                    <td className="border border-gray-300 p-1 text-right font-mono text-amber-800">
                      R$ {selectedInvestimento.maisValiaAtivosIdentificaveisBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="border border-gray-300 p-1 text-right font-mono font-bold text-amber-800">
                      R$ 800.000,00
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-1 font-medium">Goodwill por Expectativa de Rentabilidade Futura</td>
                    <td className="border border-gray-300 p-1 font-mono">{selectedInvestimento.contaContabilGoodwill}</td>
                    <td className="border border-gray-300 p-1 text-right font-mono text-emerald-800">
                      R$ {selectedInvestimento.goodwillRentabilidadeFuturaBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="border border-gray-300 p-1 text-right font-mono font-bold text-emerald-800">
                      R$ 500.000,00
                    </td>
                  </tr>
                  <tr className="bg-gray-100 font-bold">
                    <td className="border border-gray-300 p-1 uppercase" colSpan={2}>Valor Contábil Total da Participação</td>
                    <td className="border border-gray-300 p-1 text-right font-mono">
                      R$ {selectedInvestimento.custoTotalAquisicaoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="border border-gray-300 p-1 text-right font-mono text-purple-900">
                      R$ 5.020.000,00
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SEÇÃO III: APURAÇÃO DO RESULTADO E REFLEXO TRIBUTÁRIO */}
            <div className="mb-6">
              <div className="bg-gray-100 font-bold px-2 py-1 uppercase text-[10px] border border-gray-300">
                3. Resultado Periódico e Ajustes Fiscais no LALUR (Art. 418 RIR/18)
              </div>
              <div className="p-2 border border-t-0 border-gray-300 space-y-1 text-[10px]">
                <div className="flex justify-between">
                  <span>Lucro Líquido do Período apurado pela Investida:</span>
                  <span className="font-mono font-bold">R$ 1.200.000,00</span>
                </div>
                <div className="flex justify-between text-rose-700">
                  <span>(-) Eliminação de Lucros Não Realizados em Transações Intercompany:</span>
                  <span className="font-mono font-bold">(-) R$ 150.000,00</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-1">
                  <span>Base de Cálculo Ajustada do MEP:</span>
                  <span className="font-mono font-bold">R$ 1.050.000,00</span>
                </div>
                <div className="flex justify-between text-emerald-800 font-bold text-[11px] border-t border-gray-300 pt-1">
                  <span>Receita de Equivalência Patrimonial Reconhecida no Resultado (60%):</span>
                  <span className="font-mono">R$ 630.000,00</span>
                </div>
                <div className="flex justify-between text-sky-800 text-[10px]">
                  <span>Ajuste de Exclusão na Parte A do Livro LALUR / LACS:</span>
                  <span className="font-mono font-bold">(-) R$ 630.000,00</span>
                </div>
              </div>
            </div>

            {/* ASSINATURAS FORMAIS */}
            <div className="mt-12 flex justify-around text-center text-[10px]">
              <div className="w-2/5 border-t border-black pt-1">
                <div className="font-bold">Dra. Amanda Rodrigues Silva</div>
                <div>Contadora Responsável • CRC/MG 089.412/O-0</div>
              </div>
              <div className="w-2/5 border-t border-black pt-1">
                <div className="font-bold">Dr. Carlos Eduardo Meirelles</div>
                <div>Diretor Financeiro & de Relações com Investidores</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
