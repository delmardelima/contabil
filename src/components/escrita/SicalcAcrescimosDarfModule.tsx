import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Receipt,
  Printer,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Percent,
  Clock,
  ArrowRight,
  RotateCcw,
  Plus,
  Trash2,
  QrCode,
  Copy,
  Scale,
  Landmark,
  ShieldCheck,
  X
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  Empresa,
  CalculoAcrescimosDarf,
  ResumoSicalcAcrescimos,
  CodigoReceitaDarf
} from '../../types/contabil';

interface SicalcAcrescimosDarfModuleProps {
  empresaAtiva: Empresa;
  onOpenReportPreview?: (config: { titulo: string; subtitulo: string; conteudoHtml: string }) => void;
}

export const SicalcAcrescimosDarfModule: React.FC<SicalcAcrescimosDarfModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [activeTab, setActiveTab] = useState<'guias' | 'simulador' | 'legislacao'>('guias');
  const [dados, setDados] = useState<ResumoSicalcAcrescimos | null>(null);
  const [modalDarfGuia, setModalDarfGuia] = useState<CalculoAcrescimosDarf | null>(null);
  const [feedbackMensagem, setFeedbackMensagem] = useState<string | null>(null);

  // Formulário do Simulador
  const [codigoReceita, setCodigoReceita] = useState<CodigoReceitaDarf>('2089');
  const [descricaoTributo, setDescricaoTributo] = useState('IRPJ - Lucro Presumido Trimestral');
  const [periodoApuracao, setPeriodoApuracao] = useState('2026-06-30');
  const [dataVencimento, setDataVencimento] = useState('2026-07-31');
  const [dataPagamento, setDataPagamento] = useState('2026-10-31');
  const [valorPrincipal, setValorPrincipal] = useState('15000.00');

  const descricoesPadrao: Record<CodigoReceitaDarf, string> = {
    '2089': 'IRPJ - Lucro Presumido Trimestral',
    '2372': 'CSLL - Lucro Presumido Trimestral',
    '2432': 'IRPJ - Lucro Real Estimativa/Ajuste Anual',
    '6012': 'CSLL - Lucro Real Estimativa/Ajuste Anual',
    '5952': 'Retenções CSRF (PIS/COFINS/CSLL 4,65% - Art. 30 Lei 10.833/03)',
    '1708': 'Retenção IRRF PJ Serviços Profissionais (1,5%)',
    '0561': 'IRRF - Rendimentos do Trabalho Assalariado',
    '8109': 'PIS/PASEP - Não-Cumulativo Mensal',
    '6106': 'COFINS - Não-Cumulativa Mensal',
    '1162': 'IPI - Produtos Industrializados'
  };

  const handleCodigoChange = (cod: CodigoReceitaDarf) => {
    setCodigoReceita(cod);
    setDescricaoTributo(descricoesPadrao[cod] || 'Tributo Federal em Atraso');
  };

  const carregarDados = () => {
    const res = dbService.getCalculosSicalcDarf(empresaAtiva.id);
    setDados(res);
  };

  useEffect(() => {
    carregarDados();
  }, [empresaAtiva]);

  const showFeedback = (msg: string) => {
    setFeedbackMensagem(msg);
    setTimeout(() => setFeedbackMensagem(null), 4000);
  };

  const handleCalcularESalvar = (e: React.FormEvent) => {
    e.preventDefault();
    const principal = parseFloat(valorPrincipal);
    if (isNaN(principal) || principal <= 0) {
      showFeedback('Informe um valor principal válido maior que zero.');
      return;
    }

    const calc = dbService.calcularAcrescimosSicalc({
      valorPrincipal: principal,
      dataVencimento,
      dataPagamento,
      codigoReceita
    });

    const novaGuia: CalculoAcrescimosDarf = {
      id: `sicalc-${Date.now()}`,
      empresaId: empresaAtiva.id,
      codigoReceita,
      descricaoTributo,
      periodoApuracao,
      dataVencimentoOriginal: dataVencimento,
      dataPagamentoProjetada: dataPagamento,
      valorPrincipalBRL: principal,
      diasAtrasoCorridos: calc.diasAtraso,
      aliquotaMultaMoraPercentual: calc.aliquotaMulta,
      valorMultaMoraBRL: calc.valorMulta,
      taxaSelicAcumuladaPercentual: calc.taxaSelic,
      valorJurosMoraBRL: calc.valorJuros,
      valorTotalDarfBRL: calc.valorTotal,
      numeroReferencia: `DARF-${codigoReceita}-${Date.now().toString().slice(-4)}`,
      codigoBarrasFebraban: `85890000${Math.floor(calc.valorTotal).toString().padStart(4, '0')} 01350085${codigoReceita} 926073100000 000000000000`,
      linhaDigitavelFebraban: `85890000${Math.floor(calc.valorTotal / 100).toString().padStart(3, '0')}-0 01350085${codigoReceita.slice(0, 3)}-${codigoReceita.slice(3)} 92607310000-0 00000000000-0`,
      qrCodePixPagTesouro: `00020126580014br.gov.bcb.pix0136darf-tesouro-${codigoReceita}-${Date.now()}5204000053039865404${calc.valorTotal.toFixed(2)}5802BR5921RECEITA FEDERAL DO BRASIL6008BRASILIA62070503***6304${Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase()}`,
      status: 'CALCULADO',
      integradoContabil: false,
      observacoes: `Cálculo Sicalc: ${calc.diasAtraso} dias de atraso, multa ${calc.aliquotaMulta}% e juros SELIC ${calc.taxaSelic}%.`
    };

    const res = dbService.salvarCalculoAcrescimosDarf(novaGuia);
    showFeedback(res.mensagem);
    carregarDados();
    setActiveTab('guias');
  };

  const handleExcluirGuia = (id: string) => {
    if (confirm('Deseja excluir este cálculo de DARF?')) {
      const res = dbService.excluirCalculoAcrescimosDarf(id);
      showFeedback(res.mensagem);
      carregarDados();
    }
  };

  const handleIntegrarContabil = (id: string) => {
    const res = dbService.integrarJurosMultaDarfContabil(id);
    showFeedback(res.mensagem);
    carregarDados();
  };

  const handleEmitirDarfA4 = (guia: CalculoAcrescimosDarf) => {
    if (!onOpenReportPreview) return;

    const html = `
      <div style="font-family: Arial, sans-serif; color: #111; font-size: 11px; max-width: 650px; margin: 0 auto; border: 2px solid #000; padding: 12px; background: #fff;">
        <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 10px;">
          <div style="width: 60%;">
            <div style="font-size: 14px; font-weight: bold; text-transform: uppercase;">Ministério da Fazenda</div>
            <div style="font-size: 12px; font-weight: bold; color: #333;">Secretaria Especial da Receita Federal do Brasil</div>
            <div style="font-size: 13px; font-weight: bold; margin-top: 4px;">DARF - Documento de Arrecadação de Receitas Federais</div>
          </div>
          <div style="text-align: right; width: 38%; font-size: 10px;">
            <div><strong>02 PERÍODO DE APURAÇÃO:</strong> ${guia.periodoApuracao.split('-').reverse().join('/')}</div>
            <div><strong>03 NÚMERO DO CPF OU CNPJ:</strong> ${empresaAtiva.cnpj}</div>
            <div><strong>04 CÓDIGO DA RECEITA:</strong> <span style="font-size: 14px; font-weight: bold;">${guia.codigoReceita}</span></div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 8px; margin-bottom: 12px;">
          <div style="border: 1px solid #999; padding: 8px;">
            <div style="font-size: 10px; color: #555;">01 NOME / TELEFONE DO CONTRIBUINTE</div>
            <div style="font-size: 12px; font-weight: bold; margin-top: 2px;">${empresaAtiva.razaoSocial}</div>
            <div style="font-size: 10px; color: #666; margin-top: 2px;">${guia.descricaoTributo}</div>
            <div style="font-size: 9px; color: #777; margin-top: 4px;">Dias de Atraso Corridos: ${guia.diasAtrasoCorridos} dias | Data Prevista Pagamento: ${guia.dataPagamentoProjetada.split('-').reverse().join('/')}</div>
          </div>

          <div style="border: 1px solid #999; padding: 6px; font-size: 10px; line-height: 1.6;">
            <div><strong>05 NÚMERO DE REFERÊNCIA:</strong> ${guia.numeroReferencia || '-'}</div>
            <div><strong>06 DATA DE VENCIMENTO:</strong> ${guia.dataVencimentoOriginal.split('-').reverse().join('/')}</div>
            <div><strong>07 VALOR DO PRINCIPAL:</strong> ${guia.valorPrincipalBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
            <div><strong>08 VALOR DA MULTA:</strong> ${guia.valorMultaMoraBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} (${guia.aliquotaMultaMoraPercentual}%)</div>
            <div><strong>09 VALOR DOS JUROS (SELIC):</strong> ${guia.valorJurosMoraBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} (${guia.taxaSelicAcumuladaPercentual}%)</div>
            <div style="font-size: 11px; font-weight: bold; border-top: 1px solid #999; margin-top: 4px; padding-top: 2px;">
              <strong>10 VALOR TOTAL:</strong> ${guia.valorTotalDarfBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </div>
        </div>

        <div style="background-color: #f1f5f9; border: 1px dashed #64748b; padding: 8px; margin-bottom: 12px; text-align: center;">
          <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #1e293b;">Pague com PIX pelo PagTesouro da Receita Federal</div>
          <div style="font-size: 9px; color: #475569; margin: 4px 0;">Aponte o app do seu banco para o QR Code oficial ou copie o código Pix abaixo:</div>
          <div style="font-family: monospace; font-size: 9px; background: #fff; padding: 4px; border: 1px solid #cbd5e1; word-break: break-all;">
            ${guia.qrCodePixPagTesouro}
          </div>
        </div>

        <div style="border-top: 2px solid #000; padding-top: 8px; text-align: center;">
          <div style="font-family: monospace; font-size: 12px; font-weight: bold; letter-spacing: 1px;">
            ${guia.linhaDigitavelFebraban}
          </div>
          <div style="font-family: monospace; font-size: 10px; color: #666; margin-top: 2px;">
            Código de Arrecadação FEBRABAN | Autenticação Mecânica / Via do Contribuinte
          </div>
        </div>
      </div>
    `;

    onOpenReportPreview({
      titulo: 'GUIA DARF COM ACRÉSCIMOS LEGAIS SICALC',
      subtitulo: `Receita Federal do Brasil - Código ${guia.codigoReceita}`,
      conteudoHtml: html
    });
  };

  if (!dados) {
    return <div className="flex items-center justify-center h-full text-neutral-400">Carregando módulo Sicalc DARF...</div>;
  }

  const formatBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="flex flex-col h-full bg-[#141414] text-neutral-100 overflow-hidden font-sans">
      {/* 1. Header do Módulo Fluent Dark */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#181818]/80 backdrop-blur-md shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-rose-500/20 to-red-500/10 border border-rose-500/30 text-rose-400">
            <Calculator size={22} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-white">Sicalc & Acréscimos Legais DARF</h1>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full font-medium">
                Lei 9.430/96 Art. 61
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full font-medium">
                Domínio SicalcAA
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Cálculo de Multa e Juros SELIC de Tributos Federais em Atraso com Linha Digitável e PagTesouro PIX
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('simulador')}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition shadow-lg shadow-rose-600/20"
          >
            <Plus size={14} />
            <span>Novo Cálculo DARF</span>
          </button>
        </div>
      </div>

      {/* Alerta de Feedback */}
      {feedbackMensagem && (
        <div className="px-6 py-2 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-400 text-xs flex items-center space-x-2">
          <CheckCircle2 size={14} />
          <span>{feedbackMensagem}</span>
        </div>
      )}

      {/* 2. Top Stats Bar */}
      <div className="grid grid-cols-5 gap-3 px-6 py-3 border-b border-white/5 bg-[#161616]/60 shrink-0">
        <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-white/5">
          <div className="text-[11px] text-neutral-400">Guias Calculadas</div>
          <div className="text-base font-bold font-mono text-white mt-0.5">
            {dados.totalGuiasCalculadas} guias
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Tributos federais</div>
        </div>
        <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-white/5">
          <div className="text-[11px] text-neutral-400">Valor Principal</div>
          <div className="text-base font-bold font-mono text-neutral-200 mt-0.5">
            {formatBRL(dados.totalValorPrincipalBRL)}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Base dos tributos</div>
        </div>
        <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-white/5">
          <div className="text-[11px] text-neutral-400">Multa de Mora (até 20%)</div>
          <div className="text-base font-bold font-mono text-rose-400 mt-0.5">
            {formatBRL(dados.totalMultaMoraBRL)}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Indedutível no LALUR</div>
        </div>
        <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-white/5">
          <div className="text-[11px] text-neutral-400">Juros de Mora (SELIC)</div>
          <div className="text-base font-bold font-mono text-amber-400 mt-0.5">
            {formatBRL(dados.totalJurosSelicBRL)}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Despesa Financeira Dedutível</div>
        </div>
        <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-500/20">
          <div className="text-[11px] text-rose-300 font-medium">Total Geral c/ Acréscimos</div>
          <div className="text-base font-bold font-mono text-rose-400 mt-0.5">
            {formatBRL(dados.totalGeralDarfBRL)}
          </div>
          <div className="text-[10px] text-rose-500 mt-0.5">Valor atualizado p/ recolhimento</div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center space-x-1 px-6 pt-3 border-b border-white/5 bg-[#141414] shrink-0">
        <button
          onClick={() => setActiveTab('guias')}
          className={`flex items-center space-x-2 px-4 py-2 text-xs font-medium rounded-t-lg transition border-b-2 ${
            activeTab === 'guias'
              ? 'border-rose-500 text-white bg-white/5'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Receipt size={14} />
          <span>Guias DARF com Acréscimos ({dados.totalGuiasCalculadas})</span>
        </button>
        <button
          onClick={() => setActiveTab('simulador')}
          className={`flex items-center space-x-2 px-4 py-2 text-xs font-medium rounded-t-lg transition border-b-2 ${
            activeTab === 'simulador'
              ? 'border-rose-500 text-white bg-white/5'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Calculator size={14} />
          <span>Simulador Sicalc Interativo</span>
        </button>
        <button
          onClick={() => setActiveTab('legislacao')}
          className={`flex items-center space-x-2 px-4 py-2 text-xs font-medium rounded-t-lg transition border-b-2 ${
            activeTab === 'legislacao'
              ? 'border-rose-500 text-white bg-white/5'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Scale size={14} />
          <span>Regras Normativas & Reflexos LALUR</span>
        </button>
      </div>

      {/* 4. Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* ABA 1: GUIAS DARF */}
        {activeTab === 'guias' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Demonstrativo de Tributos Federais Atualizados</h3>
                <p className="text-xs text-neutral-400">Memória analítica de encargos de mora conforme normas da RFB</p>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 overflow-hidden bg-[#181818]">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-900/90 text-neutral-300 border-b border-white/10">
                    <th className="py-2.5 px-3 font-medium">Código / Tributo</th>
                    <th className="py-2.5 px-3 font-medium text-center">Apuração</th>
                    <th className="py-2.5 px-3 font-medium text-center">Vencimento Original</th>
                    <th className="py-2.5 px-3 font-medium text-center">Data Pgto Prevista</th>
                    <th className="py-2.5 px-3 font-medium text-right">Principal</th>
                    <th className="py-2.5 px-3 font-medium text-right">Multa Mora</th>
                    <th className="py-2.5 px-3 font-medium text-right">Juros SELIC</th>
                    <th className="py-2.5 px-3 font-medium text-right">Total DARF</th>
                    <th className="py-2.5 px-3 font-medium text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {dados.guias.map((guia) => (
                    <tr key={guia.id} className="hover:bg-white/[0.02] transition">
                      <td className="py-2.5 px-3 font-sans">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-mono font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20 text-[11px]">
                            {guia.codigoReceita}
                          </span>
                          <span className="font-semibold text-white text-xs">{guia.descricaoTributo}</span>
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                          {guia.diasAtrasoCorridos} dias de atraso | Multa: {guia.aliquotaMultaMoraPercentual}% | SELIC: {guia.taxaSelicAcumuladaPercentual}%
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center text-neutral-300">
                        {guia.periodoApuracao.split('-').reverse().join('/')}
                      </td>
                      <td className="py-2.5 px-3 text-center text-neutral-400">
                        {guia.dataVencimentoOriginal.split('-').reverse().join('/')}
                      </td>
                      <td className="py-2.5 px-3 text-center text-amber-400 font-semibold">
                        {guia.dataPagamentoProjetada.split('-').reverse().join('/')}
                      </td>
                      <td className="py-2.5 px-3 text-right text-neutral-200">
                        {formatBRL(guia.valorPrincipalBRL)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-rose-400 font-semibold">
                        {formatBRL(guia.valorMultaMoraBRL)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-amber-400 font-semibold">
                        {formatBRL(guia.valorJurosMoraBRL)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-white text-sm">
                        {formatBRL(guia.valorTotalDarfBRL)}
                      </td>
                      <td className="py-2.5 px-3 text-center space-x-1 font-sans">
                        <button
                          onClick={() => handleEmitirDarfA4(guia)}
                          className="px-2 py-1 text-[11px] bg-rose-600/80 hover:bg-rose-500 text-white rounded transition inline-flex items-center space-x-1"
                          title="Imprimir Guia DARF"
                        >
                          <Printer size={12} />
                          <span>DARF</span>
                        </button>
                        {!guia.integradoContabil ? (
                          <button
                            onClick={() => handleIntegrarContabil(guia.id)}
                            className="px-2 py-1 text-[11px] bg-purple-600/80 hover:bg-purple-500 text-white rounded transition"
                            title="Lançar Juros/Multa na Contabilidade"
                          >
                            Integrar
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-400 font-mono">Integrado</span>
                        )}
                        <button
                          onClick={() => handleExcluirGuia(guia.id)}
                          className="p-1 text-neutral-400 hover:text-rose-400 transition"
                          title="Excluir"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 2: SIMULADOR SICALC */}
        {activeTab === 'simulador' && (
          <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-[#181818] border border-white/10 space-y-5">
            <div className="flex items-center space-x-3 border-b border-white/10 pb-4">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Calculator size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Simulador de Tributos em Atraso Sicalc</h3>
                <p className="text-xs text-neutral-400">
                  Calcula automaticamente multa diária de 0,33% (teto 20%) e taxa SELIC acumulada
                </p>
              </div>
            </div>

            <form onSubmit={handleCalcularESalvar} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Código da Receita (DARF)</label>
                  <select
                    value={codigoReceita}
                    onChange={(e) => handleCodigoChange(e.target.value as CodigoReceitaDarf)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white font-mono"
                  >
                    <option value="2089">2089 - IRPJ Lucro Presumido</option>
                    <option value="2372">2372 - CSLL Lucro Presumido</option>
                    <option value="2432">2432 - IRPJ Lucro Real Estimativa</option>
                    <option value="6012">6012 - CSLL Lucro Real Estimativa</option>
                    <option value="5952">5952 - Retenções CSRF (4,65%)</option>
                    <option value="1708">1708 - Retenção IRRF PJ (1,5%)</option>
                    <option value="0561">0561 - IRRF Salários</option>
                    <option value="8109">8109 - PIS Não-Cumulativo</option>
                    <option value="6106">6106 - COFINS Não-Cumulativa</option>
                    <option value="1162">1162 - IPI Indústria</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Valor Principal (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={valorPrincipal}
                    onChange={(e) => setValorPrincipal(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Descrição do Tributo</label>
                <input
                  type="text"
                  value={descricaoTributo}
                  onChange={(e) => setDescricaoTributo(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Período de Apuração</label>
                  <input
                    type="date"
                    required
                    value={periodoApuracao}
                    onChange={(e) => setPeriodoApuracao(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Vencimento Original</label>
                  <input
                    type="date"
                    required
                    value={dataVencimento}
                    onChange={(e) => setDataVencimento(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Data Prevista de Pagamento</label>
                  <input
                    type="date"
                    required
                    value={dataPagamento}
                    onChange={(e) => setDataPagamento(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-white/5 space-y-1 text-xs text-neutral-400">
                <div className="font-semibold text-neutral-200">Regra de Cálculo Automático Aplicada:</div>
                <p>• Multa de Mora: 0,33% por dia corrido de atraso, limitada expressamente ao teto de 20,00%.</p>
                <p>• Juros de Mora: Taxa referencial do Sistema Especial de Liquidação e Custódia (SELIC) + 1% no mês de liquidação.</p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-rose-600/20"
                >
                  Calcular Acréscimos & Gerar DARF
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ABA 3: LEGISLAÇÃO & LALUR */}
        {activeTab === 'legislacao' && (
          <div className="grid grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-[#181818] border border-white/10 space-y-4">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                  <Scale size={20} />
                </span>
                <div>
                  <h4 className="text-base font-bold text-white">Base Legal dos Acréscimos de Tributos Federais</h4>
                  <p className="text-xs text-neutral-400">Instrução Normativa RFB nº 2.022/2021 e Código Tributário Nacional</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-neutral-300 leading-relaxed">
                <div className="p-3 rounded-lg bg-neutral-900/60 border border-white/5 space-y-1">
                  <div className="font-semibold text-white">Art. 61 da Lei nº 9.430/1996 (Multa de Mora):</div>
                  <p className="text-neutral-400">
                    Os débitos tributários federais para com a União, não pagos até a data do vencimento,
                    serão acrescidos de multa de mora, calculada à taxa de 0,33% (trinta e três centésimos por cento),
                    por dia de atraso, limitada a 20% (vinte por cento).
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-neutral-900/60 border border-white/5 space-y-1">
                  <div className="font-semibold text-white">Art. 84 da Lei nº 8.981/1995 (Juros de Mora SELIC):</div>
                  <p className="text-neutral-400">
                    Os tributos e contribuições federais não pagos no vencimento serão acrescidos de juros de mora
                    equivalentes à taxa referencial do Sistema Especial de Liquidação e de Custódia (SELIC) para títulos federais,
                    acumulada mensalmente, a partir do primeiro dia do mês subsequente ao do vencimento do prazo até o mês anterior ao do pagamento e de um por cento no mês do pagamento.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#181818] border border-white/10 space-y-4">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                  <ShieldCheck size={20} />
                </span>
                <div>
                  <h4 className="text-base font-bold text-white">Tratamento Contábil & Reflexos no LALUR (Parte A)</h4>
                  <p className="text-xs text-neutral-400">Diferenciação mandatória entre juros dedutíveis e multas punitivas</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-neutral-300 leading-relaxed">
                <div className="p-3 rounded-lg bg-neutral-900/60 border border-white/5 space-y-1">
                  <div className="font-semibold text-emerald-400">Juros de Mora SELIC (Dedutíveis):</div>
                  <p className="text-neutral-400">
                    Possuem natureza estritamente indenizatória e de recomposição do valor da moeda.
                    São contabilizados como Despesas Financeiras e são integralmente dedutíveis na apuração do Lucro Real e da Base de Cálculo da CSLL.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-neutral-900/60 border border-white/5 space-y-1">
                  <div className="font-semibold text-rose-400">Multa de Mora (Indedutível - Adição LALUR):</div>
                  <p className="text-neutral-400">
                    Conforme o Art. 344 do RIR/2018 (Decreto nº 9.580/2018), as multas por infrações de leis de natureza não compensatória
                    são indedutíveis. Devem ser contabilizadas em conta destacada de despesa e adicionadas no LALUR (Registro M300) e LACS (Registro M350).
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
