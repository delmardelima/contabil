import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Calendar, 
  CheckCircle2, 
  FileText, 
  Printer, 
  ShieldCheck, 
  DollarSign, 
  Send, 
  FileCode, 
  Lock, 
  QrCode, 
  BookOpen, 
  AlertCircle,
  Copy
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import { 
  ApuracaoDctfWeb, 
  Empresa 
} from '../../types/contabil';
import { ReportPrintPreviewModal } from '../layout/ReportPrintPreviewModal';

export const DctfWebModule: React.FC = () => {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [competencia, setCompetencia] = useState<string>('2026-02');
  const [activeTab, setActiveTab] = useState<'DEMONSTRATIVO' | 'S1299' | 'LEGAL'>('DEMONSTRATIVO');
  const [dctfWeb, setDctfWeb] = useState<ApuracaoDctfWeb | null>(null);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ tipo: 'success' | 'error' | 'info'; mensagem: string } | null>(null);
  const [copiedPix, setCopiedPix] = useState<boolean>(false);

  const carregarDados = () => {
    const emp = dbService.getActiveEmpresa() || dbService.getEmpresas()[0];
    setEmpresa(emp);
    if (emp) {
      const ap = dbService.getApuracaoDctfWeb(emp.id, competencia);
      setDctfWeb(ap);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [competencia]);

  const handleFecharS1299 = () => {
    if (!empresa) return;
    const res = dbService.fecharESocialS1299(empresa.id, competencia);
    if (res.success) {
      setFeedback({
        tipo: 'success',
        mensagem: `Evento S-1299 transmitido com sucesso! Protocolo/Recibo: ${res.recibo}. DCTFWeb encerrada e DARF gerado no valor de R$ ${res.dctfWeb.saldoLiquidoDARF.toFixed(2)}.`
      });
      carregarDados();
    }
  };

  const handleIntegrarContabil = () => {
    if (!empresa) return;
    const res = dbService.integrarDctfWebContabil(empresa.id, competencia);
    if (res.success) {
      setFeedback({
        tipo: 'success',
        mensagem: `Encargos previdenciários patronais integrados no Livro Diário com sucesso! Lote contábil #${res.loteId} criado.`
      });
      carregarDados();
    }
  };

  const handleCopiarPix = () => {
    if (dctfWeb) {
      navigator.clipboard.writeText(dctfWeb.pixQrCode);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 2500);
    }
  };

  const formatarMoeda = (v: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
  };

  return (
    <div className="flex flex-col h-full bg-[#141414] text-slate-100 overflow-y-auto font-sans p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#2a2a2a]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
              DCTFWeb & Fechamento eSocial (S-1299)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              DARF Previdenciário Único • Código 1138
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Instrução Normativa RFB nº 2.005/2021 • Apuração Consolidada de Contribuições Previdenciárias, RAT/FAP e Terceiros
          </p>
        </div>

        {/* Filtros e Ações */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#1c1c1c] px-3 py-1.5 rounded-lg border border-[#2a2a2a]">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-300 font-medium">
              {empresa ? `${empresa.codigo} - ${empresa.razaoSocial}` : 'Selecionando...'}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-[#1c1c1c] px-3 py-1.5 rounded-lg border border-[#2a2a2a]">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input 
              type="month"
              value={competencia}
              onChange={(e) => setCompetencia(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => setShowPrintModal(true)}
            className="flex items-center gap-1.5 bg-[#252525] hover:bg-[#2d2d2d] text-slate-200 text-xs px-3.5 py-2 rounded-lg border border-[#333] transition"
          >
            <Printer className="w-4 h-4 text-slate-300" />
            Imprimir DARF A4
          </button>

          <button
            onClick={handleFecharS1299}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium px-4 py-2 rounded-lg shadow-sm transition"
          >
            <Lock className="w-4 h-4" />
            Fechar Folha (S-1299)
          </button>

          <button
            onClick={handleIntegrarContabil}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-4 py-2 rounded-lg shadow-sm transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            Integrar Contabilidade
          </button>
        </div>
      </div>

      {/* Alertas */}
      {feedback && (
        <div className={`mt-4 p-3.5 rounded-lg text-xs flex items-center justify-between border ${
          feedback.tipo === 'success' ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' :
          feedback.tipo === 'error' ? 'bg-rose-950/40 border-rose-500/30 text-rose-300' :
          'bg-blue-950/40 border-blue-500/30 text-blue-300'
        }`}>
          <span>{feedback.mensagem}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* KPI Cards */}
      {dctfWeb && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 my-6">
          <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-4 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-medium">Folha Bruta Tributável</span>
            <div className="text-xl font-bold text-white mt-2 font-mono">
              {formatarMoeda(dctfWeb.folhaBruta)}
            </div>
            <span className="text-[11px] text-slate-500 mt-1">Base geral INSS</span>
          </div>

          <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-4 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-medium">INSS Segurados Retido</span>
            <div className="text-xl font-bold text-slate-200 mt-2 font-mono">
              {formatarMoeda(dctfWeb.inssSegurados)}
            </div>
            <span className="text-[11px] text-slate-500 mt-1">Descontado dos colaboradores</span>
          </div>

          <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-4 flex flex-col justify-between border-l-4 border-l-blue-500">
            <span className="text-xs text-slate-400 font-medium">Encargos Patronais (CPP+RAT+Terc)</span>
            <div className="text-xl font-bold text-blue-400 mt-2 font-mono">
              {formatarMoeda(dctfWeb.inssPatronal + dctfWeb.inssRatFap + dctfWeb.inssTerceiros)}
            </div>
            <span className="text-[11px] text-slate-400 mt-1">20% CPP + 3% RAT + 5.8% Terceiros</span>
          </div>

          <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-4 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-medium">Deduções (Sal. Família)</span>
            <div className="text-lg font-bold text-slate-300 mt-2 font-mono">
              {formatarMoeda(dctfWeb.totalDeducoes)}
            </div>
            <span className="text-[11px] text-slate-500 mt-1">Abatimento direto na guia</span>
          </div>

          <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-4 flex flex-col justify-between border-l-4 border-l-emerald-500">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">DARF Previdenciário Líquido</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400 mt-2 font-mono">
              {formatarMoeda(dctfWeb.saldoLiquidoDARF)}
            </div>
            <span className="text-[11px] text-slate-400 mt-1">Vencimento: {dctfWeb.dataVencimento}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[#2a2a2a] mb-6">
        <button
          onClick={() => setActiveTab('DEMONSTRATIVO')}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold border-b-2 transition ${
            activeTab === 'DEMONSTRATIVO'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          Memória de Cálculo DCTFWeb & DARF
        </button>

        <button
          onClick={() => setActiveTab('S1299')}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold border-b-2 transition ${
            activeTab === 'S1299'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode className="w-4 h-4" />
          Fechamento eSocial (S-1299)
        </button>

        <button
          onClick={() => setActiveTab('LEGAL')}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold border-b-2 transition ${
            activeTab === 'LEGAL'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Regras DCTFWeb (IN RFB 2.005/21)
        </button>
      </div>

      {/* TAB 1: DEMONSTRATIVO */}
      {activeTab === 'DEMONSTRATIVO' && dctfWeb && (
        <div className="space-y-6 max-w-5xl">
          <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#2a2a2a] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Composição Analítica dos Tributos Previdenciários</h3>
                <p className="text-xs text-slate-400 mt-0.5">Competência de Apuração: {competencia} • Código da Guia: 1138</p>
              </div>
              <span className={`px-2.5 py-1 rounded text-xs font-mono font-semibold ${
                dctfWeb.status === 'TRANSMITIDA' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {dctfWeb.status}
              </span>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="border border-[#2a2a2a] rounded-lg overflow-hidden">
                <div className="bg-[#202020] px-4 py-2 font-semibold text-slate-300 border-b border-[#2a2a2a]">
                  1. DÉBITOS PREVIDENCIÁRIOS APURADOS
                </div>
                <table className="w-full text-left font-sans">
                  <tbody className="divide-y divide-[#262626]">
                    <tr>
                      <td className="py-2.5 px-4 text-slate-300">INSS Retido dos Segurados (Empregados e Sócios)</td>
                      <td className="py-2.5 px-4 text-right font-mono text-white">{formatarMoeda(dctfWeb.inssSegurados)}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 text-slate-300">Contribuição Previdenciária Patronal - CPP (20,00% sobre a folha)</td>
                      <td className="py-2.5 px-4 text-right font-mono text-white">{formatarMoeda(dctfWeb.inssPatronal)}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 text-slate-300">Grau de Incidência de Incapacidade Laborativa - GILRAT (3,00% ajustado pelo FAP)</td>
                      <td className="py-2.5 px-4 text-right font-mono text-white">{formatarMoeda(dctfWeb.inssRatFap)}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 text-slate-300">Contribuição a Outras Entidades / Terceiros (Salário-Educação, INCRA, SENAI, SESI, SEBRAE - 5,80%)</td>
                      <td className="py-2.5 px-4 text-right font-mono text-white">{formatarMoeda(dctfWeb.inssTerceiros)}</td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-[#202020] font-bold border-t border-[#2a2a2a]">
                    <tr>
                      <td className="py-2.5 px-4 text-slate-200">TOTAL DE DÉBITOS PREVIDENCIÁRIOS:</td>
                      <td className="py-2.5 px-4 text-right font-mono text-emerald-400">{formatarMoeda(dctfWeb.totalDebitosPrevidenciarios)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="border border-[#2a2a2a] rounded-lg overflow-hidden">
                <div className="bg-[#202020] px-4 py-2 font-semibold text-slate-300 border-b border-[#2a2a2a]">
                  2. CRÉDITOS E DEDUÇÕES LEGAIS
                </div>
                <table className="w-full text-left font-sans">
                  <tbody className="divide-y divide-[#262626]">
                    <tr>
                      <td className="py-2.5 px-4 text-slate-300">Salário-Família Pago Diretamente aos Empregados</td>
                      <td className="py-2.5 px-4 text-right font-mono text-amber-400">-{formatarMoeda(dctfWeb.deducaoSalarioFamilia)}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 text-slate-300">Salário-Maternidade Reembolsável</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-400">R$ 0,00</td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-[#202020] font-bold border-t border-[#2a2a2a]">
                    <tr>
                      <td className="py-2.5 px-4 text-slate-200">TOTAL DE DEDUÇÕES VINCULADAS:</td>
                      <td className="py-2.5 px-4 text-right font-mono text-amber-400">-{formatarMoeda(dctfWeb.totalDeducoes)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="bg-[#202020] p-4 rounded-xl border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">VALOR LÍQUIDO A RECOLHER NO DARF PREVIDENCIÁRIO:</span>
                  <div className="text-2xl font-bold text-emerald-400 font-mono mt-0.5">
                    {formatarMoeda(dctfWeb.saldoLiquidoDARF)}
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">Código Barras: {dctfWeb.codigoBarras}</span>
                </div>
                <button
                  onClick={handleCopiarPix}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#252525] hover:bg-[#303030] text-slate-200 text-xs rounded-lg border border-[#333] transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedPix ? 'Copia e Cola Copiado!' : 'Copiar PIX Copia-e-Cola'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FECHAMENTO S-1299 */}
      {activeTab === 'S1299' && dctfWeb && (
        <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-6 shadow-sm space-y-4 max-w-4xl text-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-400" />
              Evento de Fechamento dos Eventos Periódicos (S-1299)
            </h3>
            {dctfWeb.reciboFechamentoS1299 && (
              <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-mono font-bold">
                RECIBO: {dctfWeb.reciboFechamentoS1299}
              </span>
            )}
          </div>
          <p className="text-slate-400">
            O evento S-1299 informa à Receita Federal e ao eSocial a conclusão de todos os fatos geradores da folha de pagamento do mês, disparando a consolidação na DCTFWeb.
          </p>

          <div className="bg-[#121212] p-4 rounded-lg border border-[#2a2a2a] font-mono text-[11px] text-emerald-400 whitespace-pre overflow-x-auto">
            {dctfWeb.xmlFechamentoS1299 || `<!-- O evento S-1299 será gerado e exibido aqui ao clicar em "Fechar Folha (S-1299)" -->`}
          </div>
        </div>
      )}

      {/* TAB 3: LEGAL */}
      {activeTab === 'LEGAL' && (
        <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-6 shadow-sm space-y-4 max-w-4xl text-xs">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            Normas da DCTFWeb e Substituição da GPS (IN RFB nº 2.005/2021)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-[#202020] p-4 rounded-lg border border-[#2a2a2a] space-y-2">
              <h4 className="font-semibold text-emerald-400">Extinção da Guia da Previdência Social (GPS)</h4>
              <p className="text-slate-300 leading-relaxed">
                Desde a implantação da DCTFWeb, o recolhimento das contribuições previdenciárias é efetuado <strong>exclusivamente por meio de DARF numerado com código de barras e QR Code PIX</strong> emitido após o fechamento da escrituração digital.
              </p>
            </div>
            <div className="bg-[#202020] p-4 rounded-lg border border-[#2a2a2a] space-y-2">
              <h4 className="font-semibold text-blue-400">Prazo de Vencimento</h4>
              <p className="text-slate-300 leading-relaxed">
                O DARF Previdenciário vence no <strong>dia 20 do mês subsequente</strong> ao período de apuração. Caso o dia 20 recaia em final de semana ou feriado, o vencimento é antecipado para o dia útil imediatamente anterior.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE IMPRESSÃO A4 DO DARF PREVIDENCIÁRIO */}
      {showPrintModal && empresa && dctfWeb && (
        <ReportPrintPreviewModal
          isOpen={showPrintModal}
          onClose={() => setShowPrintModal(false)}
          empresa={empresa}
          tituloRelatorio="Documento de Arrecadação de Receitas Federais - DARF Previdenciário"
          subtitulo="DCTFWeb • Sistema de Declaração de Débitos e Créditos Tributários Federais"
          periodo={competencia}
        >
          <div className="space-y-6 text-black font-sans text-xs">
            {/* Cabeçalho do DARF */}
            <div className="border-2 border-black p-3 space-y-2">
              <div className="flex justify-between items-center border-b border-black pb-2">
                <div className="font-bold text-sm">
                  <div>MINISTÉRIO DA FAZENDA</div>
                  <div>SECRETARIA DA RECEITA FEDERAL DO BRASIL</div>
                </div>
                <div className="text-right font-bold text-lg">
                  DARF PREVIDENCIÁRIO
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div><strong>Contribuinte:</strong> {empresa.razaoSocial}</div>
                  <div><strong>CNPJ:</strong> {empresa.cnpj}</div>
                  <div><strong>Endereço:</strong> {empresa.logradouro}, {empresa.numero} - {empresa.cidade}/{empresa.uf}</div>
                </div>
                <div className="space-y-1 text-right">
                  <div><strong>Período de Apuração:</strong> {competencia}</div>
                  <div><strong>Código de Receita:</strong> {dctfWeb.codigoReceitaDARF}</div>
                  <div><strong>Número do Documento:</strong> {dctfWeb.codigoBarras.substring(0, 15)}</div>
                  <div><strong>Data de Vencimento:</strong> {dctfWeb.dataVencimento}</div>
                </div>
              </div>
            </div>

            {/* Demonstrativo da Composição */}
            <div className="border border-black p-3">
              <div className="font-bold border-b border-black pb-1 mb-2">DEMONSTRATIVO DE DÉBITOS E CRÉDITOS APURADOS NA DCTFWEB</div>
              <div className="grid grid-cols-2 gap-4 text-[11px]">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>INSS Segurados:</span>
                    <span>{formatarMoeda(dctfWeb.inssSegurados)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CPP Patronal (20%):</span>
                    <span>{formatarMoeda(dctfWeb.inssPatronal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GILRAT / FAP:</span>
                    <span>{formatarMoeda(dctfWeb.inssRatFap)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Terceiros / Outras Entidades:</span>
                    <span>{formatarMoeda(dctfWeb.inssTerceiros)}</span>
                  </div>
                </div>

                <div className="space-y-1 border-l border-black pl-4">
                  <div className="flex justify-between text-gray-700">
                    <span>(-) Salário-Família Pago:</span>
                    <span>-{formatarMoeda(dctfWeb.deducaoSalarioFamilia)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>(-) Salário-Maternidade:</span>
                    <span>R$ 0,00</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-black pt-1 mt-2 text-sm">
                    <span>VALOR TOTAL A PAGAR:</span>
                    <span>{formatarMoeda(dctfWeb.saldoLiquidoDARF)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Código de Barras e PIX */}
            <div className="border-2 border-black p-4 text-center space-y-3">
              <div className="font-mono font-bold text-sm tracking-widest">
                {dctfWeb.codigoBarras}
              </div>
              <div className="text-[10px] text-gray-600">
                Pague pelo aplicativo do seu banco via Código de Barras ou utilize o QR Code PIX oficial da Receita Federal.
              </div>
              <div className="pt-2">
                <span className="font-bold text-xs bg-gray-200 px-3 py-1 rounded">CHAVE PIX QR CODE VÁLIDA</span>
              </div>
            </div>

            {/* Assinaturas */}
            <div className="pt-8 flex justify-between text-center text-xs">
              <div className="w-64 border-t border-black pt-1">
                <div>{empresa.razaoSocial}</div>
                <div className="text-[10px] text-gray-600">Responsável Tributário</div>
              </div>
              <div className="w-64 border-t border-black pt-1">
                <div>Contador Responsável</div>
                <div className="text-[10px] text-gray-600">CRC/SP 1SP123456/O-0</div>
              </div>
            </div>
          </div>
        </ReportPrintPreviewModal>
      )}
    </div>
  );
};
