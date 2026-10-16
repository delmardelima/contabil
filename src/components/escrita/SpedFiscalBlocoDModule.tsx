import React, { useState, useEffect } from 'react';
import {
  Truck,
  PhoneCall,
  FileText,
  FileCheck2,
  Printer,
  Download,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Building2,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Car,
  Layers,
  Sparkles,
  Link2
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  DocumentoTransporteD100,
  DocumentoComunicacaoD500,
  ResumoSpedBlocoD
} from '../../types/contabil';

interface SpedBlocoDProps {
  empresaId?: number;
}

export const SpedFiscalBlocoDModule: React.FC<SpedBlocoDProps> = ({ empresaId = 1 }) => {
  const [competencia, setCompetencia] = useState<string>('2026-03');
  const [activeTab, setActiveTab] = useState<'TRANSPORTE' | 'COMUNICACAO' | 'SPED_TXT' | 'DACTE_PREVIEW' | 'LIVRO_PREVIEW'>('TRANSPORTE');
  const [resumo, setResumo] = useState<ResumoSpedBlocoD | null>(null);
  const [selectedCte, setSelectedCte] = useState<DocumentoTransporteD100 | null>(null);
  const [spedTxt, setSpedTxt] = useState<string>('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ tipo: 'sucesso' | 'info'; texto: string } | null>(null);

  const carregarDados = () => {
    const dados = dbService.getSpedBlocoD(empresaId, competencia);
    setResumo(dados);
    if (dados.documentosTransporte.length > 0 && !selectedCte) {
      setSelectedCte(dados.documentosTransporte[0]);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [empresaId, competencia]);

  const handleGerarSpedTxt = () => {
    const res = dbService.gerarArquivoSpedBlocoDTxt(empresaId, competencia);
    if (res.sucesso) {
      setSpedTxt(res.arquivo);
      setActiveTab('SPED_TXT');
      setFeedbackMsg({ tipo: 'sucesso', texto: res.mensagem });
    }
  };

  const handleIntegrarContabil = () => {
    const res = dbService.integrarSpedBlocoDContabil(empresaId, competencia);
    if (res.sucesso) {
      setFeedbackMsg({ tipo: 'sucesso', texto: res.mensagem });
      carregarDados();
    } else {
      setFeedbackMsg({ tipo: 'info', texto: res.mensagem });
    }
  };

  const handleDownloadTxt = () => {
    if (!spedTxt) return;
    const blob = new Blob([spedTxt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SPED_FISCAL_BLOCO_D_${competencia.replace('-', '')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-[#121212] text-gray-200 p-4 space-y-4 overflow-y-auto">
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#262626] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-600/20 text-amber-400 rounded border border-amber-500/30">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                SPED Fiscal Bloco D • Transporte & Comunicação
                <span className="text-xs bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800 font-mono">
                  EFD ICMS/IPI v3.1.6
                </span>
              </h1>
              <p className="text-xs text-gray-400">
                Ajuste SINIEF 02/2009 • CT-e Mod. 57 • Comunicação Mod. 21/22 • Domínio Escrita esr45.pbd / esf21.pbd (Reg. D100 a D590)
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-[#1a1a1a] border border-[#333] px-3 py-1.5 rounded text-xs">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-400">Comp:</span>
            <input
              type="month"
              value={competencia}
              onChange={(e) => setCompetencia(e.target.value)}
              className="bg-transparent border-none text-white focus:outline-none font-mono text-xs cursor-pointer"
            />
          </div>

          <button
            onClick={handleGerarSpedTxt}
            className="px-3 py-1.5 bg-[#1e1e1e] hover:bg-[#252525] text-amber-300 border border-amber-700/50 rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            Gerar TXT Bloco D
          </button>

          <button
            onClick={handleIntegrarContabil}
            className="px-3 py-1.5 bg-amber-700 hover:bg-amber-600 text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Link2 className="w-3.5 h-3.5" />
            Integrar ao Diário Geral
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

      {/* CARDS DE APURAÇÃO DO BLOCO D */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-[#181818] border border-[#262626] p-3 rounded flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-400 uppercase font-semibold">Fretes Tomados (Entradas)</div>
            <div className="text-xl font-bold text-white mt-0.5">
              R$ {(resumo?.totalTransporteEntradasBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-emerald-400 mt-0.5 font-medium flex items-center gap-1">
              <ArrowDownLeft className="w-3 h-3" />
              Crédito ICMS: R$ {(resumo?.totalCreditoIcmsTransporteBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#181818] border border-[#262626] p-3 rounded flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-400 uppercase font-semibold">Fretes Prestados (Saídas)</div>
            <div className="text-xl font-bold text-white mt-0.5">
              R$ {(resumo?.totalTransporteSaidasBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-rose-400 mt-0.5 font-medium flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              Débito ICMS: R$ {(resumo?.totalDebitoIcmsTransporteBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-lg border border-rose-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#181818] border border-[#262626] p-3 rounded flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-400 uppercase font-semibold">Telecom & Comunicação (D500)</div>
            <div className="text-xl font-bold text-sky-400 mt-0.5">
              R$ {(resumo?.totalComunicacaoTomadaBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">
              Crédito ICMS: R$ {(resumo?.totalCreditoIcmsComunicacaoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-lg border border-sky-500/20">
            <PhoneCall className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#181818] border border-[#262626] p-3 rounded flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-400 uppercase font-semibold">Saldo ICMS Bloco D</div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">
              R$ {(Math.abs(resumo?.saldoIcmsBlocoDBRL || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-emerald-400 mt-0.5 font-medium">
              {(resumo?.saldoIcmsBlocoDBRL || 0) <= 0 ? 'Saldo Credor a Compensar' : 'Saldo Devedor'}
            </div>
          </div>
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
            <FileCheck2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* TABS DE NAVEGAÇÃO */}
      <div className="flex border-b border-[#262626] gap-2">
        <button
          onClick={() => setActiveTab('TRANSPORTE')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'TRANSPORTE'
              ? 'border-amber-500 text-amber-400 bg-amber-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          Serviços de Transporte (Reg. D100 a D190)
        </button>

        <button
          onClick={() => setActiveTab('COMUNICACAO')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'COMUNICACAO'
              ? 'border-amber-500 text-amber-400 bg-amber-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <PhoneCall className="w-3.5 h-3.5" />
          Comunicação & Telecom (Reg. D500/D590)
        </button>

        <button
          onClick={() => { handleGerarSpedTxt(); setActiveTab('SPED_TXT'); }}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'SPED_TXT'
              ? 'border-amber-500 text-amber-400 bg-amber-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Arquivo TXT SPED Bloco D
        </button>

        <button
          onClick={() => setActiveTab('DACTE_PREVIEW')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'DACTE_PREVIEW'
              ? 'border-amber-500 text-amber-400 bg-amber-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Printer className="w-3.5 h-3.5" />
          Espelho DACTE (A4)
        </button>
      </div>

      {/* TAB 1: CONHECIMENTOS DE TRANSPORTE (D100) */}
      {activeTab === 'TRANSPORTE' && (
        <div className="space-y-4">
          <div className="bg-[#181818] border border-[#282828] rounded overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1f1f1f] border-b border-[#2d2d2d] text-gray-400 font-medium">
                <tr>
                  <th className="py-2.5 px-3">Mod / Número / Série</th>
                  <th className="py-2.5 px-3">Chave de Acesso CT-e</th>
                  <th className="py-2.5 px-3">Prestador / Tomador</th>
                  <th className="py-2.5 px-3">Origem ➔ Destino</th>
                  <th className="py-2.5 px-3">Tipo Frete</th>
                  <th className="py-2.5 px-3 text-right">Valor Total</th>
                  <th className="py-2.5 px-3 text-right">Base ICMS</th>
                  <th className="py-2.5 px-3 text-right">Crédito ICMS</th>
                  <th className="py-2.5 px-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#242424]">
                {resumo?.documentosTransporte.map(cte => (
                  <tr
                    key={cte.id}
                    onClick={() => setSelectedCte(cte)}
                    className={`hover:bg-[#202020] transition-colors cursor-pointer ${
                      selectedCte?.id === cte.id ? 'bg-[#222222] border-l-2 border-amber-500' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-white">CT-e {cte.numeroDocumento}</div>
                      <div className="text-[10px] text-gray-400 font-mono">Mod. {cte.modelo.split('_')[0]} • Série {cte.serie}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[10px] text-gray-300">
                      {cte.chaveCte.slice(0, 4)}...{cte.chaveCte.slice(-10)}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="text-gray-200">{cte.participanteRazaoSocial}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{cte.participanteCnpjCpf}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="text-gray-300 flex items-center gap-1 text-[11px]">
                        <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>{cte.municipioOrigem.nome}/{cte.municipioOrigem.uf} ➔ {cte.municipioDestino.nome}/{cte.municipioDestino.uf}</span>
                      </div>
                      {cte.veiculo && (
                        <div className="text-[10px] text-gray-500 flex items-center gap-1 font-mono">
                          <Car className="w-2.5 h-2.5" /> Placa: {cte.veiculo.placa} ({cte.veiculo.uf})
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                        cte.tipoFrete === '0_CIF_REMETENTE'
                          ? 'bg-sky-950/60 text-sky-300 border-sky-800'
                          : 'bg-amber-950/60 text-amber-300 border-amber-800'
                      }`}>
                        {cte.tipoFrete === '0_CIF_REMETENTE' ? '0 - CIF (Remetente)' : '1 - FOB (Destinatário)'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-white">
                      R$ {cte.valorTotalDocumento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-gray-300">
                      R$ {cte.baseCalculoIcms.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-400">
                      R$ {cte.valorIcms.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedCte(cte); setActiveTab('DACTE_PREVIEW'); }}
                        title="Visualizar DACTE"
                        className="p-1.5 bg-[#252525] hover:bg-[#333] text-gray-300 rounded border border-[#3a3a3a]"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* DETALHE DOS ITENS D110 E REGISTRO ANALÍTICO D190 */}
          {selectedCte && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ITENS DO SERVIÇO D110 */}
              <div className="bg-[#181818] border border-[#282828] p-4 rounded space-y-3">
                <div className="flex items-center gap-2 border-b border-[#262626] pb-2 text-xs font-semibold text-white">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>Itens do Documento de Transporte (Reg. D110)</span>
                </div>
                <div className="space-y-2">
                  {selectedCte.itensD110.map(item => (
                    <div key={item.numeroItem} className="bg-[#141414] border border-[#242424] p-2.5 rounded text-xs space-y-1">
                      <div className="flex items-center justify-between text-white font-medium">
                        <span>Item #{item.numeroItem} • {item.descricaoItem}</span>
                        <span className="font-mono text-amber-300">R$ {item.valorServico.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="text-[10px] text-gray-400 flex items-center justify-between pt-1 border-t border-[#1e1e1e]">
                        <span>Pedágio: R$ {item.valorPedagio.toFixed(2)}</span>
                        <span>Seguro: R$ {item.valorSeguro.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* REGISTRO ANALÍTICO D190 */}
              <div className="bg-[#181818] border border-[#282828] p-4 rounded space-y-3">
                <div className="flex items-center gap-2 border-b border-[#262626] pb-2 text-xs font-semibold text-white">
                  <FileCheck2 className="w-4 h-4 text-emerald-400" />
                  <span>Registro Analítico da Escrituração (Reg. D190)</span>
                </div>
                <div className="space-y-2">
                  {selectedCte.analiticoD190.map((ana, idx) => (
                    <div key={idx} className="bg-[#141414] border border-[#242424] p-2.5 rounded text-xs space-y-1">
                      <div className="flex items-center justify-between text-white font-medium">
                        <span className="font-mono">CST: {ana.cstIcms} • CFOP: {ana.cfop}</span>
                        <span className="font-mono text-emerald-400">ICMS ({ana.aliquotaIcms}%): R$ {ana.valorIcms.toFixed(2)}</span>
                      </div>
                      <div className="text-[10px] text-gray-400 flex items-center justify-between pt-1 border-t border-[#1e1e1e]">
                        <span>Base Cálculo: R$ {ana.baseCalculoIcms.toFixed(2)}</span>
                        <span>Valor Operação: R$ {ana.valorOperacao.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: COMUNICAÇÃO (D500) */}
      {activeTab === 'COMUNICACAO' && (
        <div className="space-y-4">
          <div className="bg-[#181818] border border-[#282828] rounded overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1f1f1f] border-b border-[#2d2d2d] text-gray-400 font-medium">
                <tr>
                  <th className="py-2.5 px-3">Mod / Número / Série</th>
                  <th className="py-2.5 px-3">Data Emissão / Prestação</th>
                  <th className="py-2.5 px-3">Prestadora de Conectividade</th>
                  <th className="py-2.5 px-3">CFOP & CST</th>
                  <th className="py-2.5 px-3 text-right">Valor Total</th>
                  <th className="py-2.5 px-3 text-right">Base ICMS</th>
                  <th className="py-2.5 px-3 text-right">Crédito ICMS (25%)</th>
                  <th className="py-2.5 px-3 text-right">PIS & COFINS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#242424]">
                {resumo?.documentosComunicacao.map(com => (
                  <tr key={com.id} className="hover:bg-[#202020] transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-white">
                      NF Mod. {com.modelo.split('_')[0]} • Nº {com.numeroDocumento} (Série {com.serie})
                    </td>
                    <td className="py-2.5 px-3 font-mono text-gray-300">
                      {com.dataEmissao}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="text-gray-200">{com.participanteRazaoSocial}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{com.participanteCnpjCpf}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-gray-300">
                      CFOP {com.cfop} • CST {com.cstIcms}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-white">
                      R$ {com.valorTotalDocumento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-gray-300">
                      R$ {com.baseCalculoIcms.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-400">
                      R$ {com.valorIcms.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[10px] text-gray-400">
                      PIS: R$ {com.valorPis.toFixed(2)} | COF: R$ {com.valorCofins.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SPED TXT */}
      {activeTab === 'SPED_TXT' && (
        <div className="bg-[#181818] border border-[#282828] p-4 rounded space-y-3">
          <div className="flex items-center justify-between border-b border-[#262626] pb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-white text-xs">
                Registros do Bloco D • EFD-ICMS/IPI (Layout Oficial Guia Prático v3.1.6)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigator.clipboard.writeText(spedTxt)}
                className="px-2.5 py-1 bg-[#252525] hover:bg-[#303030] text-gray-300 text-xs rounded border border-[#333] flex items-center gap-1"
              >
                <Copy className="w-3 h-3" /> Copiar TXT
              </button>
              <button
                onClick={handleDownloadTxt}
                className="px-2.5 py-1 bg-amber-700 hover:bg-amber-600 text-white text-xs rounded flex items-center gap-1 shadow-sm font-medium"
              >
                <Download className="w-3 h-3" /> Baixar Arquivo
              </button>
            </div>
          </div>
          <pre className="bg-[#121212] p-4 rounded border border-[#222] text-xs font-mono text-amber-300/90 overflow-x-auto max-h-96 leading-relaxed">
            {spedTxt || 'Clique no botão "Gerar TXT Bloco D" para compilar o arquivo magnético.'}
          </pre>
        </div>
      )}

      {/* TAB 4: DACTE PREVIEW A4 */}
      {activeTab === 'DACTE_PREVIEW' && selectedCte && (
        <div className="space-y-3">
          <div className="flex justify-end gap-2">
            <button
              onClick={() => window.print()}
              className="bg-amber-700 hover:bg-amber-600 text-white px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir DACTE Oficial (A4)
            </button>
          </div>

          <div className="bg-white text-gray-900 p-8 rounded shadow-xl font-sans max-w-4xl mx-auto border border-gray-400 text-[10px] leading-tight">
            {/* CABEÇALHO DACTE */}
            <div className="border border-black p-3 mb-2 flex justify-between items-center">
              <div className="w-1/2">
                <div className="font-bold text-xs uppercase">{selectedCte.participanteRazaoSocial}</div>
                <div className="text-[9px] text-gray-600">Transporte Rodoviário de Cargas em Geral</div>
                <div className="font-mono text-[9px] mt-1">CNPJ: {selectedCte.participanteCnpjCpf} • IE: 001.458.980-00</div>
              </div>
              <div className="w-1/2 text-right border-l border-black pl-3">
                <div className="font-black text-sm uppercase">DACTE</div>
                <div className="text-[9px] uppercase font-semibold">Documento Auxiliar do Conhecimento de Transporte Eletrônico</div>
                <div className="font-bold text-xs mt-1">Nº {selectedCte.numeroDocumento} • SÉRIE {selectedCte.serie}</div>
              </div>
            </div>

            {/* CHAVE DE ACESSO E CÓDIGO DE BARRAS */}
            <div className="border border-black p-2 mb-2 bg-gray-50 flex flex-col items-center">
              <div className="font-bold text-[9px] uppercase">Chave de Acesso para Consulta de Autenticidade no Portal Nacional do CT-e</div>
              <div className="font-mono text-xs font-bold tracking-widest my-1">{selectedCte.chaveCte}</div>
              <div className="text-[8px] text-gray-500 italic">Consulta via leitor de código de barras ou portal www.cte.fazenda.gov.br</div>
            </div>

            {/* DADOS DO TRANSPORTE */}
            <div className="border border-black mb-2">
              <div className="bg-gray-200 font-bold px-2 py-0.5 uppercase border-b border-black text-[9px]">
                Prestação do Serviço de Transporte
              </div>
              <div className="p-2 grid grid-cols-2 gap-2 text-[10px]">
                <div><span className="font-bold">Início da Prestação:</span> {selectedCte.municipioOrigem.nome} / {selectedCte.municipioOrigem.uf} (IBGE: {selectedCte.municipioOrigem.codigoIbge})</div>
                <div><span className="font-bold">Término da Prestação:</span> {selectedCte.municipioDestino.nome} / {selectedCte.municipioDestino.uf} (IBGE: {selectedCte.municipioDestino.codigoIbge})</div>
                <div><span className="font-bold">Tomador do Serviço:</span> {selectedCte.tipoFrete === '0_CIF_REMETENTE' ? 'Remetente' : 'Destinatário'}</div>
                <div><span className="font-bold">Tipo do CT-e:</span> {selectedCte.tipoCte.replace('_', ' ')}</div>
              </div>
            </div>

            {/* COMPONENTES DO VALOR DA PRESTAÇÃO */}
            <div className="border border-black mb-2">
              <div className="bg-gray-200 font-bold px-2 py-0.5 uppercase border-b border-black text-[9px]">
                Componentes do Valor da Prestação
              </div>
              <table className="w-full text-left text-[9px]">
                <thead className="border-b border-black bg-gray-50">
                  <tr>
                    <th className="p-1">Nome do Componente</th>
                    <th className="p-1 text-right">Valor do Serviço</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCte.itensD110.map(i => (
                    <tr key={i.numeroItem} className="border-b border-gray-300">
                      <td className="p-1">{i.descricaoItem}</td>
                      <td className="p-1 text-right font-mono">R$ {i.valorServico.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* INFORMAÇÕES RELATIVAS AO IMPOSTO (ICMS) */}
            <div className="border border-black mb-2">
              <div className="bg-gray-200 font-bold px-2 py-0.5 uppercase border-b border-black text-[9px]">
                Informações Tributárias do ICMS
              </div>
              <div className="p-2 grid grid-cols-4 gap-2 text-[10px] text-center">
                <div className="border border-gray-300 p-1">
                  <div className="text-[8px] uppercase font-bold text-gray-500">CST ICMS</div>
                  <div className="font-mono font-bold">{selectedCte.analiticoD190[0]?.cstIcms || '00'}</div>
                </div>
                <div className="border border-gray-300 p-1">
                  <div className="text-[8px] uppercase font-bold text-gray-500">Base de Cálculo</div>
                  <div className="font-mono font-bold">R$ {selectedCte.baseCalculoIcms.toFixed(2)}</div>
                </div>
                <div className="border border-gray-300 p-1">
                  <div className="text-[8px] uppercase font-bold text-gray-500">Alíquota ICMS</div>
                  <div className="font-mono font-bold">{selectedCte.aliquotaIcms}%</div>
                </div>
                <div className="border border-gray-300 p-1 bg-gray-50">
                  <div className="text-[8px] uppercase font-bold text-gray-700">Valor do ICMS</div>
                  <div className="font-mono font-bold text-emerald-800">R$ {selectedCte.valorIcms.toFixed(2)}</div>
                </div>
              </div>
            </div>

            {/* DADOS DO VEÍCULO E OBSERVAÇÕES */}
            <div className="border border-black p-2 text-[9px] mb-4">
              <div className="font-bold uppercase">Observações Fiscais do Transporte:</div>
              <div>Veículo: Placa {selectedCte.veiculo?.placa || 'N/A'} - UF {selectedCte.veiculo?.uf || 'MG'} • Transporte realizado nos termos do Convênio ICMS 06/2003.</div>
              <div className="text-gray-500 mt-1">Escrituração Fiscal Digital (EFD ICMS/IPI) vinculada ao Bloco D do SPED.</div>
            </div>

            <div className="mt-8 border-t border-black pt-1 text-center text-[9px]">
              DOCUMENTO ESCRITURADO E CONCILIADO NO ERP CONTÁBIL STUDIO PRO • SPED BLOCO D
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
