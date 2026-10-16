import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Building2,
  FileText,
  FileCode,
  Download,
  Copy,
  PlusCircle,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Landmark,
  Layers,
  Calendar,
  DollarSign,
  TrendingUp,
  MapPin,
  ShieldCheck,
  Send,
  ArrowRightLeft,
  Percent
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  ResumoSpedFiscalBloco1,
  Registro1200CreditoIcms,
  Registro1400ValorAdicionadoMunicipio,
  Registro1601OperacoesPagamentoEletronico
} from '../../types/contabil';

interface Bloco1Props {
  empresaId?: number;
}

export const SpedFiscalBloco1Module: React.FC<Bloco1Props> = ({ empresaId = 1 }) => {
  const [competencia, setCompetencia] = useState<string>('2026-03');
  const [activeTab, setActiveTab] = useState<'PAGAMENTOS_1601' | 'CREDITOS_1200' | 'VALOR_ADICIONADO_1400' | 'DEMONSTRATIVO_A4' | 'TXT_SPED'>('PAGAMENTOS_1601');
  const [bloco1, setBloco1] = useState<ResumoSpedFiscalBloco1 | null>(null);
  const [selectedPagamento, setSelectedPagamento] = useState<Registro1601OperacoesPagamentoEletronico | null>(null);
  const [txtGerado, setTxtGerado] = useState<string>('');
  const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'info'; texto: string } | null>(null);

  // Form Novo Pagamento Eletrônico 1601
  const [modalNovo1601, setModalNovo1601] = useState(false);
  const [formInstNome, setFormInstNome] = useState('');
  const [formInstCnpj, setFormInstCnpj] = useState('');
  const [formTipoInstrumento, setFormTipoInstrumento] = useState<'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'PIX' | 'CARTEIRA_DIGITAL' | 'TRANSFERENCIA_BANCARIA'>('CARTAO_CREDITO');
  const [formValorTotal, setFormValorTotal] = useState<number>(50000);
  const [formTaxaIntermediacao, setFormTaxaIntermediacao] = useState<number>(1000);
  const [formMarketplaceCnpj, setFormMarketplaceCnpj] = useState('');
  const [formMarketplaceNome, setFormMarketplaceNome] = useState('');

  const carregarDados = () => {
    const dados = dbService.getSpedFiscalBloco1(empresaId, competencia);
    setBloco1(dados);
    if (dados.pagamentosEletronicos1601.length > 0 && !selectedPagamento) {
      setSelectedPagamento(dados.pagamentosEletronicos1601[0]);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [empresaId, competencia]);

  const exibirAlerta = (texto: string, tipo: 'sucesso' | 'info' = 'sucesso') => {
    setFeedback({ tipo, texto });
    setTimeout(() => setFeedback(null), 4500);
  };

  const handleSalvarPagamento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formInstNome || !formInstCnpj) {
      alert('Informe a instituição financeira / credenciadora e o respectivo CNPJ.');
      return;
    }

    const valorLiq = Number(formValorTotal) - Number(formTaxaIntermediacao);
    const novoPag: Registro1601OperacoesPagamentoEletronico = {
      id: `pag-1601-${Date.now()}`,
      competencia,
      codigoInstituicaoPagamento: `PAG-${Date.now().toString().slice(-4)}`,
      nomeInstituicao: formInstNome,
      cnpjInstituicaoPagamento: formInstCnpj,
      tipoOperacaoInstrumento: formTipoInstrumento,
      valorTotalOperacoesBRL: Number(formValorTotal),
      valorTaxaIntermediacaoBRL: Number(formTaxaIntermediacao),
      valorLiquidoRecebidoBRL: valorLiq,
      intermediadorMarketplaceCnpj: formMarketplaceCnpj || undefined,
      intermediadorMarketplaceNome: formMarketplaceNome || undefined
    };

    if (bloco1) {
      const atualizado: ResumoSpedFiscalBloco1 = {
        ...bloco1,
        pagamentosEletronicos1601: [...bloco1.pagamentosEletronicos1601, novoPag],
        totalVendasInstrumentosEletronicosBRL: bloco1.totalVendasInstrumentosEletronicosBRL + Number(formValorTotal),
        totalTaxasIntermediacaoBRL: bloco1.totalTaxasIntermediacaoBRL + Number(formTaxaIntermediacao)
      };
      dbService.salvarSpedFiscalBloco1(atualizado);
      setBloco1(atualizado);
      setSelectedPagamento(novoPag);
      setModalNovo1601(false);
      exibirAlerta(`Operação eletrônica com ${formInstNome} cadastrada com sucesso.`);
    }
  };

  const handleGerarTxt = () => {
    const res = dbService.gerarArquivoSpedFiscalBloco1Txt(empresaId, competencia);
    if (res.sucesso) {
      setTxtGerado(res.txt);
      setActiveTab('TXT_SPED');
      exibirAlerta(res.mensagem);
    }
  };

  const copiarTxt = () => {
    navigator.clipboard.writeText(txtGerado);
    exibirAlerta('Arquivo TXT copiado para a área de transferência!');
  };

  const baixarTxt = () => {
    const element = document.createElement('a');
    const file = new Blob([txtGerado], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `SPED_FISCAL_BLOCO_1_${empresaId}_${competencia.replace('-', '')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    exibirAlerta('Download do arquivo TXT iniciado.');
  };

  return (
    <div className="p-6 bg-[#121212] min-h-screen text-slate-200">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-zinc-800 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
              <CreditCard className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
                SPED Fiscal Bloco 1
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-950/60 border border-violet-800/40 text-violet-400 font-mono">
                  Registro 1601 / 1200 / 1400
                </span>
              </h1>
              <p className="text-sm text-zinc-400 mt-0.5">
                Meios de Pagamento Eletrônico (Cartão/PIX/Marketplace 1601), Créditos Acumulados (1200) e IPM Municipal (1400)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300">
            <Calendar className="w-3.5 h-3.5 mr-2 text-zinc-400" />
            <span>Competência:</span>
            <input
              type="month"
              value={competencia}
              onChange={(e) => setCompetencia(e.target.value)}
              className="bg-transparent text-white font-bold ml-2 outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => setModalNovo1601(true)}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-lg shadow-lg shadow-violet-600/20 transition-all text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Novo Registro 1601
          </button>

          <button
            onClick={handleGerarTxt}
            className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm transition-all"
            title="Gerar TXT PVA SPED Fiscal"
          >
            <FileCode className="w-4 h-4 text-violet-400" />
            Gerar TXT
          </button>
        </div>
      </div>

      {/* FEEDBACK ALERT */}
      {feedback && (
        <div className="mt-4 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 flex items-center justify-between animate-fadeIn text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedback.texto}</span>
          </div>
          <span className="text-xs text-emerald-500 uppercase tracking-wider font-semibold">Sucesso</span>
        </div>
      )}

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium uppercase tracking-wider">
            <span>Pagamentos Eletrônicos (1601)</span>
            <CreditCard className="w-4 h-4 text-violet-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">
            R$ {(bloco1?.totalVendasInstrumentosEletronicosBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-zinc-500 mt-1">
            Cartões de Crédito, Débito e PIX
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium uppercase tracking-wider">
            <span>Taxas de Intermediação</span>
            <DollarSign className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-400">
            R$ {(bloco1?.totalTaxasIntermediacaoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-zinc-500 mt-1">
            MDR / Gateways / Adquirentes
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium uppercase tracking-wider">
            <span>Créditos Acumulados (1200)</span>
            <ShieldCheck className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-sky-400">
            R$ {(bloco1?.totalCreditoAcumuladoFinalBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-zinc-500 mt-1">
            Saldo a Transportar de ICMS
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium uppercase tracking-wider">
            <span>Valor Adicionado IPM (1400)</span>
            <MapPin className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400">
            R$ {(bloco1?.totalValorAdicionadoMunicipiosBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-zinc-500 mt-1">
            Base p/ Repasse Municipal
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-zinc-800 mt-8 space-x-2">
        <button
          onClick={() => setActiveTab('PAGAMENTOS_1601')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'PAGAMENTOS_1601'
              ? 'border-violet-500 text-violet-400 bg-violet-500/5'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Meios Eletrônicos 1601 ({bloco1?.pagamentosEletronicos1601.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('CREDITOS_1200')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'CREDITOS_1200'
              ? 'border-sky-500 text-sky-400 bg-sky-500/5'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Créditos Acumulados 1200 ({bloco1?.creditosIcms1200.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('VALOR_ADICIONADO_1400')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'VALOR_ADICIONADO_1400'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <MapPin className="w-4 h-4" />
          Valor Adicionado IPM 1400 ({bloco1?.valorAdicionado1400.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('DEMONSTRATIVO_A4')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'DEMONSTRATIVO_A4'
              ? 'border-amber-500 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          Demonstrativo A4
        </button>

        <button
          onClick={() => setActiveTab('TXT_SPED')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'TXT_SPED'
              ? 'border-purple-500 text-purple-400 bg-purple-500/5'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileCode className="w-4 h-4" />
          Arquivo TXT PVA SPED
        </button>
      </div>

      {/* TAB CONTENT: MEIOS ELETRÔNICOS 1601 */}
      {activeTab === 'PAGAMENTOS_1601' && (
        <div className="mt-6 space-y-6">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-violet-400" />
                  Operações com Instrumentos de Pagamento Eletrônico (Registro 1601)
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Confronto de operações de vendas com cartões de crédito, débito, PIX e marketplaces contra a DIMP
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-300">
                <thead className="bg-zinc-800/40 text-xs uppercase font-medium text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="px-4 py-3">Instituição / Adquirente</th>
                    <th className="px-4 py-3">CNPJ Instituição</th>
                    <th className="px-4 py-3">Instrumento</th>
                    <th className="px-4 py-3">Intermediador / Marketplace</th>
                    <th className="px-4 py-3 text-right">Valor Bruto</th>
                    <th className="px-4 py-3 text-right">Taxa Intermediação</th>
                    <th className="px-4 py-3 text-right">Valor Líquido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono text-xs">
                  {bloco1?.pagamentosEletronicos1601.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedPagamento(p)}
                      className={`hover:bg-zinc-800/30 cursor-pointer transition-colors ${
                        selectedPagamento?.id === p.id ? 'bg-violet-950/20 border-l-2 border-violet-500' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-sans font-medium text-white">{p.nomeInstituicao}</td>
                      <td className="px-4 py-3 text-zinc-400">{p.cnpjInstituicaoPagamento}</td>
                      <td className="px-4 py-3 font-sans">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            p.tipoOperacaoInstrumento === 'PIX'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                              : 'bg-violet-950 text-violet-400 border border-violet-800/40'
                          }`}
                        >
                          {p.tipoOperacaoInstrumento.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-sans text-zinc-400">
                        {p.intermediadorMarketplaceNome ? (
                          <span>{p.intermediadorMarketplaceNome}</span>
                        ) : (
                          <span className="text-zinc-600">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-white">
                        R$ {p.valorTotalOperacoesBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-right text-rose-400">
                        R$ {p.valorTaxaIntermediacaoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-right text-emerald-400 font-bold">
                        R$ {p.valorLiquidoRecebidoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AUDITORIA CRUZADA DIMP */}
          <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 text-xs">
            <div className="flex items-center gap-2 text-violet-400 font-semibold mb-2">
              <ShieldCheck className="w-4 h-4" />
              Auditoria Preventiva com a DIMP (Declaração de Informações de Meios de Pagamentos)
            </div>
            <p className="text-zinc-400 leading-relaxed">
              O Registro 1601 do SPED Fiscal é confrontado pelas Secretarias de Fazenda Estaduais (SEFAZ) com os relatórios mensais enviados por bancos, bandeiras de cartão e fintechs através da DIMP. As divergências superiores a 1% acionam notificações automáticas de malha fiscal de ICMS e presunção de omissão de receita (Art. 527 RICMS).
            </p>
          </div>
        </div>
      )}

      {/* TAB CONTENT: CRÉDITOS ACUMULADOS 1200 */}
      {activeTab === 'CREDITOS_1200' && (
        <div className="mt-6 bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-zinc-800">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              Controle de Créditos Fiscais Acumulados de ICMS (Registro 1200)
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Saldo credor gerado por operações de exportação desoneradas (CFOP 7xxx) ou diferimento interno
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-800/40 text-xs uppercase font-medium text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3">Código Controle</th>
                  <th className="px-4 py-3">Origem do Crédito</th>
                  <th className="px-4 py-3 text-right">Saldo Inicial</th>
                  <th className="px-4 py-3 text-right">Crédito Gerado</th>
                  <th className="px-4 py-3 text-right">Utilizado Próprio</th>
                  <th className="px-4 py-3 text-right">Transferido Terceiros</th>
                  <th className="px-4 py-3 text-right">Saldo Final a Transportar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono text-xs">
                {bloco1?.creditosIcms1200.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-800/30">
                    <td className="px-4 py-3 font-semibold text-sky-300">{c.codigoCreditoAcumulado}</td>
                    <td className="px-4 py-3 font-sans">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-sky-300 border border-zinc-700 text-[10px] font-bold">
                        {c.origemCredito}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-300">
                      R$ {c.saldoCredorInicialBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-400 font-bold">
                      R$ {c.creditoGeradoPeriodoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right text-amber-400">
                      R$ {c.creditoUtilizadoProprioBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-400">
                      R$ {c.creditoTransferidoTerceirosBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right text-white font-bold text-sm">
                      R$ {c.saldoCredorFinalTransportarBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: VALOR ADICIONADO IPM 1400 */}
      {activeTab === 'VALOR_ADICIONADO_1400' && (
        <div className="mt-6 bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-zinc-800">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Valor Adicionado por Município (Registro 1400 - IPM)
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Determinação do Índice de Participação dos Municípios (IPM) na cota-parte estadual de 25% do ICMS arrecadado
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-800/40 text-xs uppercase font-medium text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3">Código IBGE</th>
                  <th className="px-4 py-3">Município</th>
                  <th className="px-4 py-3 text-center">UF</th>
                  <th className="px-4 py-3 text-right">Operações Próprias</th>
                  <th className="px-4 py-3 text-right">Valor Adicionado (V.A.)</th>
                  <th className="px-4 py-3 text-right">% IPM Estimado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono text-xs">
                {bloco1?.valorAdicionado1400.map((v) => (
                  <tr key={v.id} className="hover:bg-zinc-800/30">
                    <td className="px-4 py-3 text-zinc-400">{v.codigoMunicipioIbge}</td>
                    <td className="px-4 py-3 font-sans font-medium text-white">{v.nomeMunicipio}</td>
                    <td className="px-4 py-3 text-center font-bold text-zinc-300">{v.uf}</td>
                    <td className="px-4 py-3 text-right text-zinc-300">
                      R$ {v.valorOperacoesPropriasBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-400">
                      R$ {v.valorAdicionadoCalculadoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-400">{v.aliquotaIpmPercentual.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: DEMONSTRATIVO A4 */}
      {activeTab === 'DEMONSTRATIVO_A4' && bloco1 && (
        <div className="mt-6 bg-white text-zinc-900 p-8 rounded-xl shadow-2xl max-w-4xl mx-auto font-sans">
          {/* CABEÇALHO TIMBRADO */}
          <div className="flex items-center justify-between border-b-2 border-zinc-800 pb-4">
            <div>
              <h2 className="text-xl font-bold uppercase tracking-wider text-zinc-900">
                Demonstrativo de Meios de Pagamento e Créditos de ICMS
              </h2>
              <p className="text-xs text-zinc-600 mt-0.5">
                SPED Fiscal EFD ICMS/IPI | Bloco 1 (1601 / 1200 / 1400) | Competência: {bloco1.competencia}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold px-2 py-1 bg-zinc-100 border border-zinc-300 rounded">
                STATUS: {bloco1.statusBloco1}
              </span>
            </div>
          </div>

          {/* QUADRO DE OPERAÇÕES ELETRÔNICAS 1601 */}
          <div className="mt-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2">
              Registro 1601 - Vendas com Cartões, PIX e Facilitadores
            </h4>
            <table className="w-full text-xs text-left border border-zinc-300">
              <thead className="bg-zinc-100 text-zinc-700 uppercase font-semibold border-b border-zinc-300">
                <tr>
                  <th className="p-2">Instituição</th>
                  <th className="p-2">Instrumento</th>
                  <th className="p-2">Marketplace</th>
                  <th className="p-2 text-right">Taxa (R$)</th>
                  <th className="p-2 text-right">Valor Bruto (R$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 font-mono">
                {bloco1.pagamentosEletronicos1601.map((p) => (
                  <tr key={p.id}>
                    <td className="p-2 font-sans font-medium">{p.nomeInstituicao}</td>
                    <td className="p-2">{p.tipoOperacaoInstrumento}</td>
                    <td className="p-2 font-sans">{p.intermediadorMarketplaceNome || '-'}</td>
                    <td className="p-2 text-right text-rose-700">R$ {p.valorTaxaIntermediacaoBRL.toFixed(2)}</td>
                    <td className="p-2 text-right font-bold">R$ {p.valorTotalOperacoesBRL.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="bg-zinc-100 font-bold">
                  <td colSpan={3} className="p-2 text-right uppercase">Total Faturamento Eletrônico:</td>
                  <td className="p-2 text-right text-rose-700">R$ {bloco1.totalTaxasIntermediacaoBRL.toFixed(2)}</td>
                  <td className="p-2 text-right">R$ {bloco1.totalVendasInstrumentosEletronicosBRL.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* TOTALIZADORES RESUMIDOS */}
          <div className="mt-6 grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-3 bg-zinc-100 rounded border border-zinc-200">
              <span className="text-zinc-600 block">Crédito Acumulado ICMS (1200)</span>
              <span className="font-mono text-sm font-bold text-sky-800">
                R$ {bloco1.totalCreditoAcumuladoFinalBRL.toFixed(2)}
              </span>
            </div>
            <div className="p-3 bg-zinc-100 rounded border border-zinc-200">
              <span className="text-zinc-600 block">Valor Adicionado Municipal (1400)</span>
              <span className="font-mono text-sm font-bold text-emerald-800">
                R$ {bloco1.totalValorAdicionadoMunicipiosBRL.toFixed(2)}
              </span>
            </div>
            <div className="p-3 bg-zinc-100 rounded border border-zinc-200">
              <span className="text-zinc-600 block">Total Vendas Eletrônicas (1601)</span>
              <span className="font-mono text-sm font-bold text-violet-800">
                R$ {bloco1.totalVendasInstrumentosEletronicosBRL.toFixed(2)}
              </span>
            </div>
          </div>

          {/* ASSINATURAS */}
          <div className="mt-12 pt-8 border-t border-zinc-300 grid grid-cols-2 gap-8 text-center text-xs text-zinc-600">
            <div>
              <div className="border-b border-zinc-400 pb-1 mb-1 font-semibold text-zinc-800">
                DEPARTAMENTO FISCAL / TRIBUTÁRIO
              </div>
              <span>Responsável pela EFD</span>
            </div>
            <div>
              <div className="border-b border-zinc-400 pb-1 mb-1 font-semibold text-zinc-800">
                AUDITORIA DE CONCILIAÇÃO BANCÁRIA
              </div>
              <span>Conferência de DIMP e Extratos</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: TXT SPED */}
      {activeTab === 'TXT_SPED' && (
        <div className="mt-6 bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode className="w-5 h-5 text-violet-400" />
              <h3 className="font-semibold text-white text-sm">Estrutura de Arquivo SPED Fiscal Bloco 1</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={copiarTxt}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs flex items-center gap-1.5 transition-all"
              >
                <Copy className="w-3.5 h-3.5" />
                Copiar
              </button>
              <button
                onClick={baixarTxt}
                className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded text-xs flex items-center gap-1.5 transition-all shadow-md shadow-violet-600/20"
              >
                <Download className="w-3.5 h-3.5" />
                Baixar TXT SPED
              </button>
            </div>
          </div>
          <div className="p-4 bg-zinc-950 font-mono text-xs text-violet-300/90 overflow-x-auto max-h-[550px] leading-relaxed">
            <pre>{txtGerado || 'Clique em "Gerar TXT" para compilar os registros 1001, 1200, 1400, 1601 e 1990.'}</pre>
          </div>
        </div>
      )}

      {/* MODAL NOVO PAGAMENTO 1601 */}
      {modalNovo1601 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-xl w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-violet-400" />
                Novo Meio de Pagamento Eletrônico (Registro 1601)
              </h3>
              <button
                onClick={() => setModalNovo1601(false)}
                className="text-zinc-400 hover:text-white text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSalvarPagamento} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Instituição / Adquirente</label>
                  <input
                    type="text"
                    value={formInstNome}
                    onChange={(e) => setFormInstNome(e.target.value)}
                    placeholder="Ex: STONE PAGAMENTOS S.A."
                    className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">CNPJ da Instituição</label>
                  <input
                    type="text"
                    value={formInstCnpj}
                    onChange={(e) => setFormInstCnpj(e.target.value)}
                    placeholder="00.000.000/0001-00"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Instrumento de Pagamento</label>
                <select
                  value={formTipoInstrumento}
                  onChange={(e) => setFormTipoInstrumento(e.target.value as any)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white"
                >
                  <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                  <option value="CARTAO_DEBITO">Cartão de Débito</option>
                  <option value="PIX">PIX (Transferência Instantânea)</option>
                  <option value="CARTEIRA_DIGITAL">Carteira Digital / E-wallet</option>
                  <option value="TRANSFERENCIA_BANCARIA">Transferência Bancária / TED</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Valor Total Bruto (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formValorTotal}
                    onChange={(e) => setFormValorTotal(Number(e.target.value))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-emerald-400 font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Taxa Intermediação (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formTaxaIntermediacao}
                    onChange={(e) => setFormTaxaIntermediacao(Number(e.target.value))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-rose-400 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="p-3 bg-zinc-950/60 rounded border border-zinc-800 space-y-2">
                <span className="font-semibold text-white block">Intermediador da Transação (Marketplace / Plataforma)</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-400 mb-1">Nome do Marketplace (opcional)</label>
                    <input
                      type="text"
                      value={formMarketplaceNome}
                      onChange={(e) => setFormMarketplaceNome(e.target.value)}
                      placeholder="Ex: SHOPEE / AMAZON"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">CNPJ Intermediador (opcional)</label>
                    <input
                      type="text"
                      value={formMarketplaceCnpj}
                      onChange={(e) => setFormMarketplaceCnpj(e.target.value)}
                      placeholder="00.000.000/0001-00"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setModalNovo1601(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded font-medium shadow-md shadow-violet-600/20"
                >
                  Salvar Registro 1601
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
