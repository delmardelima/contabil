import React, { useState, useEffect } from 'react';
import {
  FileText,
  Printer,
  Users,
  Heart,
  Globe2,
  Leaf,
  DollarSign,
  TrendingUp,
  Percent,
  Layers,
  Calendar,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Award
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import { Empresa, BalancoSocialIbase, LinhaBalancoSocial } from '../../types/contabil';
import { ReportPrintPreviewModal } from '../layout/ReportPrintPreviewModal';

export const BalancoSocialModule: React.FC = () => {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [ano, setAno] = useState<number>(2026);
  const [balancoSocial, setBalancoSocial] = useState<BalancoSocialIbase | null>(null);
  const [activeTab, setActiveTab] = useState<'internos' | 'externos' | 'ambientais' | 'corpo'>('internos');

  // Modais
  const [showPrintModal, setShowPrintModal] = useState(false);

  const carregarDados = () => {
    const emp = dbService.getActiveEmpresa();
    if (emp) {
      setEmpresa(emp);
      const bs = dbService.getBalancoSocialIbase(emp.id, ano);
      setBalancoSocial(bs);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [ano]);

  return (
    <div className="h-full flex flex-col bg-[#141414] text-neutral-200 overflow-hidden font-sans">
      {/* Top Header */}
      <div className="h-14 border-b border-white/10 bg-[#181818] px-6 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-400">
            <Heart size={18} />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
              Balanço Social Modelo IBASE & Relatório ESG
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                NBC T 15 / CFC nº 1.003/2004
              </span>
            </h1>
            <p className="text-xs text-neutral-400">
              Demonstração dos Indicadores Sociais Internos, Externos, Ambientais e do Corpo Funcional
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-[#1c1c1c] border border-white/10 rounded-lg px-2.5 py-1 text-xs">
            <Calendar size={13} className="text-neutral-400 mr-2" />
            <span className="text-neutral-400 mr-1.5">Exercício Social:</span>
            <select
              value={ano}
              onChange={(e) => setAno(parseInt(e.target.value))}
              className="bg-transparent border-0 text-neutral-200 font-mono text-xs focus:ring-0 p-0 cursor-pointer"
            >
              <option value={2026} className="bg-[#1c1c1c]">2026</option>
              <option value={2025} className="bg-[#1c1c1c]">2025</option>
              <option value={2024} className="bg-[#1c1c1c]">2024</option>
            </select>
          </div>

          <button
            onClick={() => setShowPrintModal(true)}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition shadow-sm"
          >
            <Printer size={14} />
            <span>Imprimir Balanço Social IBASE A4</span>
          </button>
        </div>
      </div>

      {/* Sub-Tabs Bar */}
      <div className="h-10 border-b border-white/10 bg-[#161616] px-6 flex items-center space-x-4 flex-shrink-0">
        <button
          onClick={() => setActiveTab('internos')}
          className={`h-full flex items-center space-x-2 text-xs font-medium border-b-2 transition ${
            activeTab === 'internos' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Users size={13} />
          <span>1. Indicadores Sociais Internos</span>
        </button>

        <button
          onClick={() => setActiveTab('externos')}
          className={`h-full flex items-center space-x-2 text-xs font-medium border-b-2 transition ${
            activeTab === 'externos' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Globe2 size={13} />
          <span>2. Indicadores Sociais Externos</span>
        </button>

        <button
          onClick={() => setActiveTab('ambientais')}
          className={`h-full flex items-center space-x-2 text-xs font-medium border-b-2 transition ${
            activeTab === 'ambientais' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Leaf size={13} />
          <span>3. Indicadores Ambientais (ESG)</span>
        </button>

        <button
          onClick={() => setActiveTab('corpo')}
          className={`h-full flex items-center space-x-2 text-xs font-medium border-b-2 transition ${
            activeTab === 'corpo' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <ShieldCheck size={13} />
          <span>4. Corpo Funcional & Cidadania</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {balancoSocial && (
          <>
            {/* KPI Cards Base de Cálculo */}
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-[#181818] border border-white/10 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-neutral-400 text-xs">
                  <span>Receita Líquida (RL)</span>
                  <DollarSign size={14} className="text-emerald-400" />
                </div>
                <div className="text-lg font-bold font-mono text-neutral-100">
                  R$ {balancoSocial.receitaLiquida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-[10px] text-neutral-500">Base DRE Exercício {ano}</p>
              </div>

              <div className="p-4 bg-[#181818] border border-white/10 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-neutral-400 text-xs">
                  <span>Resultado Operacional (RO)</span>
                  <TrendingUp size={14} className="text-blue-400" />
                </div>
                <div className="text-lg font-bold font-mono text-neutral-100">
                  R$ {balancoSocial.resultadoOperacional.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-[10px] text-neutral-500">Lucro antes de tributos</p>
              </div>

              <div className="p-4 bg-[#181818] border border-white/10 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-neutral-400 text-xs">
                  <span>Folha Pagamento Bruta (FPB)</span>
                  <Users size={14} className="text-indigo-400" />
                </div>
                <div className="text-lg font-bold font-mono text-neutral-100">
                  R$ {balancoSocial.folhaPagamentoBruta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-[10px] text-neutral-500">Remunerações brutas acumuladas</p>
              </div>

              <div className="p-4 bg-[#181818] border border-white/10 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-neutral-400 text-xs">
                  <span>Investimento Social Total</span>
                  <Heart size={14} className="text-rose-400" />
                </div>
                <div className="text-lg font-bold font-mono text-rose-400">
                  R$ {(balancoSocial.indicadoresSociaisInternos.totalSecao + balancoSocial.indicadoresSociaisExternos.totalSecao).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-[10px] text-neutral-500">
                  {((balancoSocial.indicadoresSociaisInternos.totalSecao / balancoSocial.receitaLiquida) * 100).toFixed(2)}% da Receita Líquida
                </p>
              </div>
            </div>

            {/* Tab 1: Indicadores Sociais Internos */}
            {activeTab === 'internos' && (
              <div className="bg-[#181818] border border-white/10 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
                    <Users size={16} className="text-emerald-400" />
                    Quadro Oficial: 1. Indicadores Sociais Internos (IBASE)
                  </h3>
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    Total: R$ {balancoSocial.indicadoresSociaisInternos.totalSecao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#1c1c1c] text-neutral-400 uppercase text-[10px] font-mono border-y border-white/5">
                      <tr>
                        <th className="py-2.5 px-3">Item</th>
                        <th className="py-2.5 px-3">Discriminação do Investimento Social Interno</th>
                        <th className="py-2.5 px-3 text-right">Valor Período (R$)</th>
                        <th className="py-2.5 px-3 text-right">% s/ Folha Bruta</th>
                        <th className="py-2.5 px-3 text-right">% s/ Receita Líquida</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                      {balancoSocial.indicadoresSociaisInternos.linhas.map((linha) => (
                        <tr key={linha.codigo} className="hover:bg-white/[0.02]">
                          <td className="py-2.5 px-3 font-bold text-neutral-400">{linha.codigo}</td>
                          <td className="py-2.5 px-3 font-sans text-neutral-200">{linha.descricao}</td>
                          <td className="py-2.5 px-3 text-right font-semibold text-neutral-100">
                            R$ {linha.valorPeriodo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-3 text-right text-emerald-400">{linha.percentualSobreFolha?.toFixed(2)}%</td>
                          <td className="py-2.5 px-3 text-right text-blue-400">{linha.percentualSobreReceita?.toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-white/10 font-bold font-mono text-xs bg-[#1a1a1a]">
                        <td colSpan={2} className="py-3 px-3 uppercase text-neutral-300">TOTAL DOS INVESTIMENTOS INTERNOS:</td>
                        <td className="py-3 px-3 text-right text-emerald-400 text-sm">
                          R$ {balancoSocial.indicadoresSociaisInternos.totalSecao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-3 text-right text-emerald-400">
                          {((balancoSocial.indicadoresSociaisInternos.totalSecao / balancoSocial.folhaPagamentoBruta) * 100).toFixed(2)}%
                        </td>
                        <td className="py-3 px-3 text-right text-blue-400">
                          {balancoSocial.indicadoresSociaisInternos.percentualTotalSobreReceita?.toFixed(2)}%
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 2: Indicadores Sociais Externos */}
            {activeTab === 'externos' && (
              <div className="bg-[#181818] border border-white/10 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
                    <Globe2 size={16} className="text-blue-400" />
                    Quadro Oficial: 2. Indicadores Sociais Externos & Tributos (IBASE)
                  </h3>
                  <span className="text-xs font-mono text-blue-400 font-bold">
                    Total: R$ {balancoSocial.indicadoresSociaisExternos.totalSecao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#1c1c1c] text-neutral-400 uppercase text-[10px] font-mono border-y border-white/5">
                      <tr>
                        <th className="py-2.5 px-3">Item</th>
                        <th className="py-2.5 px-3">Discriminação do Investimento na Comunidade</th>
                        <th className="py-2.5 px-3 text-right">Valor Período (R$)</th>
                        <th className="py-2.5 px-3 text-right">% s/ Receita Líquida</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                      {balancoSocial.indicadoresSociaisExternos.linhas.map((linha) => (
                        <tr key={linha.codigo} className="hover:bg-white/[0.02]">
                          <td className="py-2.5 px-3 font-bold text-neutral-400">{linha.codigo}</td>
                          <td className="py-2.5 px-3 font-sans text-neutral-200">{linha.descricao}</td>
                          <td className="py-2.5 px-3 text-right font-semibold text-neutral-100">
                            R$ {linha.valorPeriodo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-3 text-right text-blue-400">{linha.percentualSobreReceita?.toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-white/10 font-bold font-mono text-xs bg-[#1a1a1a]">
                        <td colSpan={2} className="py-3 px-3 uppercase text-neutral-300">TOTAL DOS INVESTIMENTOS EXTERNOS:</td>
                        <td className="py-3 px-3 text-right text-blue-400 text-sm">
                          R$ {balancoSocial.indicadoresSociaisExternos.totalSecao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-3 text-right text-blue-400">
                          {balancoSocial.indicadoresSociaisExternos.percentualTotalSobreReceita?.toFixed(2)}%
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 3: Indicadores Ambientais */}
            {activeTab === 'ambientais' && (
              <div className="bg-[#181818] border border-white/10 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
                    <Leaf size={16} className="text-emerald-400" />
                    Quadro Oficial: 3. Indicadores Ambientais & Sustentabilidade ESG
                  </h3>
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    Total: R$ {balancoSocial.indicadoresAmbientais.totalSecao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#1c1c1c] text-neutral-400 uppercase text-[10px] font-mono border-y border-white/5">
                      <tr>
                        <th className="py-2.5 px-3">Item</th>
                        <th className="py-2.5 px-3">Iniciativas de Gestão Ambiental</th>
                        <th className="py-2.5 px-3 text-right">Valor Período (R$)</th>
                        <th className="py-2.5 px-3 text-right">% s/ Receita Líquida</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                      {balancoSocial.indicadoresAmbientais.linhas.map((linha) => (
                        <tr key={linha.codigo} className="hover:bg-white/[0.02]">
                          <td className="py-2.5 px-3 font-bold text-neutral-400">{linha.codigo}</td>
                          <td className="py-2.5 px-3 font-sans text-neutral-200">{linha.descricao}</td>
                          <td className="py-2.5 px-3 text-right font-semibold text-neutral-100">
                            R$ {linha.valorPeriodo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-3 text-right text-emerald-400">{linha.percentualSobreReceita?.toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-white/10 font-bold font-mono text-xs bg-[#1a1a1a]">
                        <td colSpan={2} className="py-3 px-3 uppercase text-neutral-300">TOTAL DOS INVESTIMENTOS AMBIENTAIS:</td>
                        <td className="py-3 px-3 text-right text-emerald-400 text-sm">
                          R$ {balancoSocial.indicadoresAmbientais.totalSecao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-3 text-right text-emerald-400">
                          {balancoSocial.indicadoresAmbientais.percentualTotalSobreReceita?.toFixed(2)}%
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 4: Corpo Funcional & Cidadania */}
            {activeTab === 'corpo' && (
              <div className="space-y-6">
                <div className="bg-[#181818] border border-white/10 rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-indigo-400" />
                    Quadro Oficial: 4. Indicadores do Corpo Funcional & Diversidade
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#1c1c1c] text-neutral-400 uppercase text-[10px] font-mono border-y border-white/5">
                        <tr>
                          <th className="py-2.5 px-3">Indicador</th>
                          <th className="py-2.5 px-3 text-center">Início Período</th>
                          <th className="py-2.5 px-3 text-center">Fim Período</th>
                          <th className="py-2.5 px-3 text-right">% do Corpo Funcional</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-mono">
                        {balancoSocial.indicadoresCorpoFuncional.map((item, idx) => (
                          <tr key={idx} className="hover:bg-white/[0.02]">
                            <td className="py-2.5 px-3 font-sans text-neutral-200">{item.descricao}</td>
                            <td className="py-2.5 px-3 text-center text-neutral-400">{item.quantidadeInicio}</td>
                            <td className="py-2.5 px-3 text-center font-bold text-neutral-100">{item.quantidadeFim}</td>
                            <td className="py-2.5 px-3 text-right text-indigo-400 font-bold">{item.percentualDoTotal.toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-[#181818] border border-white/10 rounded-xl p-5 space-y-3">
                  <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
                    <Award size={16} className="text-amber-400" />
                    Informações Relevantes sobre o Exercício da Cidadania Empresarial
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-[#1c1c1c] rounded-lg border border-white/5 flex items-center justify-between">
                      <span className="text-neutral-300">Código de Conduta Ética e Regras Internas:</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                        SIM (100% DISSEMINADO)
                      </span>
                    </div>
                    <div className="p-3 bg-[#1c1c1c] rounded-lg border border-white/5 flex items-center justify-between">
                      <span className="text-neutral-300">Liberdade de Associação Sindical e Negociação Coletiva:</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                        SIM (ASSEGURADA)
                      </span>
                    </div>
                    <div className="p-3 bg-[#1c1c1c] rounded-lg border border-white/5 flex items-center justify-between">
                      <span className="text-neutral-300">Programa de Participação nos Lucros ou Resultados (PLR):</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                        SIM (INSTITUÍDO)
                      </span>
                    </div>
                    <div className="p-3 bg-[#1c1c1c] rounded-lg border border-white/5 flex items-center justify-between">
                      <span className="text-neutral-300">Plano de Previdência Complementar Privada:</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                        SIM (DISPONIBILIZADO)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal A4 Balanço Social Modelo IBASE Oficial */}
      {showPrintModal && balancoSocial && empresa && (
        <ReportPrintPreviewModal
          isOpen={showPrintModal}
          onClose={() => setShowPrintModal(false)}
          empresa={empresa}
          tituloRelatorio="BALANÇO SOCIAL OFICIAL MODELO IBASE (NBC T 15 / CFC)"
          subtitulo="Demonstração das Informações de Natureza Social e Ambiental"
          periodo={`Exercício Social Encerrado em 31/12/${ano}`}
        >
          <div className="space-y-4 text-black font-sans text-xs">
            {/* Base de Cálculo */}
            <div className="border border-black p-3 space-y-1">
              <div className="font-bold text-xs uppercase border-b border-black pb-1">1 - BASE DE CÁLCULO FINANCEIRA (R$)</div>
              <div className="grid grid-cols-3 gap-2 font-mono text-[11px] pt-1">
                <div>Receita Líquida (RL): <strong>R$ {balancoSocial.receitaLiquida.toFixed(2)}</strong></div>
                <div>Resultado Operacional: <strong>R$ {balancoSocial.resultadoOperacional.toFixed(2)}</strong></div>
                <div>Folha Pagamento Bruta (FPB): <strong>R$ {balancoSocial.folhaPagamentoBruta.toFixed(2)}</strong></div>
              </div>
            </div>

            {/* Quadro Indicadores Sociais Internos */}
            <div className="border border-black">
              <div className="bg-gray-100 font-bold p-1.5 border-b border-black uppercase text-[10px]">
                2 - INDICADORES SOCIAIS INTERNOS
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-black text-[10px] uppercase font-mono bg-gray-50">
                    <th className="p-1.5 text-left">Item</th>
                    <th className="p-1.5 text-left">Discriminação</th>
                    <th className="p-1.5 text-right">Valor Período (R$)</th>
                    <th className="p-1.5 text-right">% s/ FPB</th>
                    <th className="p-1.5 text-right">% s/ RL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300 font-mono text-[11px]">
                  {balancoSocial.indicadoresSociaisInternos.linhas.map((l) => (
                    <tr key={l.codigo}>
                      <td className="p-1.5">{l.codigo}</td>
                      <td className="p-1.5 font-sans">{l.descricao}</td>
                      <td className="p-1.5 text-right">R$ {l.valorPeriodo.toFixed(2)}</td>
                      <td className="p-1.5 text-right">{l.percentualSobreFolha?.toFixed(2)}%</td>
                      <td className="p-1.5 text-right">{l.percentualSobreReceita?.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-black font-bold font-mono">
                    <td colSpan={2} className="p-1.5 text-right uppercase">Total dos Indicadores Internos:</td>
                    <td className="p-1.5 text-right">R$ {balancoSocial.indicadoresSociaisInternos.totalSecao.toFixed(2)}</td>
                    <td className="p-1.5 text-right">{((balancoSocial.indicadoresSociaisInternos.totalSecao / balancoSocial.folhaPagamentoBruta) * 100).toFixed(2)}%</td>
                    <td className="p-1.5 text-right">{balancoSocial.indicadoresSociaisInternos.percentualTotalSobreReceita?.toFixed(2)}%</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Quadro Indicadores Sociais Externos */}
            <div className="border border-black">
              <div className="bg-gray-100 font-bold p-1.5 border-b border-black uppercase text-[10px]">
                3 - INDICADORES SOCIAIS EXTERNOS (COMUNIDADE E TRIBUTOS)
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-black text-[10px] uppercase font-mono bg-gray-50">
                    <th className="p-1.5 text-left">Item</th>
                    <th className="p-1.5 text-left">Discriminação</th>
                    <th className="p-1.5 text-right">Valor Período (R$)</th>
                    <th className="p-1.5 text-right">% s/ RL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300 font-mono text-[11px]">
                  {balancoSocial.indicadoresSociaisExternos.linhas.map((l) => (
                    <tr key={l.codigo}>
                      <td className="p-1.5">{l.codigo}</td>
                      <td className="p-1.5 font-sans">{l.descricao}</td>
                      <td className="p-1.5 text-right">R$ {l.valorPeriodo.toFixed(2)}</td>
                      <td className="p-1.5 text-right">{l.percentualSobreReceita?.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-black font-bold font-mono">
                    <td colSpan={2} className="p-1.5 text-right uppercase">Total dos Indicadores Externos:</td>
                    <td className="p-1.5 text-right">R$ {balancoSocial.indicadoresSociaisExternos.totalSecao.toFixed(2)}</td>
                    <td className="p-1.5 text-right">{balancoSocial.indicadoresSociaisExternos.percentualTotalSobreReceita?.toFixed(2)}%</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Assinaturas Oficiais */}
            <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
              <div className="border-t border-black pt-1">
                {empresa.razaoSocial}<br />
                Diretoria Executiva / Representante Legal
              </div>
              <div className="border-t border-black pt-1">
                Responsável Técnico Contábil<br />
                CRC Ativo - CFC / Resolução nº 1.003/2004
              </div>
            </div>
          </div>
        </ReportPrintPreviewModal>
      )}
    </div>
  );
};
