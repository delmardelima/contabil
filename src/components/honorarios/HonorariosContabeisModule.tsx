import React, { useState, useEffect } from 'react';
import {
  FileText,
  DollarSign,
  Plus,
  Printer,
  CheckCircle2,
  Clock,
  AlertCircle,
  QrCode,
  Copy,
  Receipt,
  Users,
  Building2,
  TrendingUp,
  FileCheck,
  Percent,
  Calendar,
  X,
  Send
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  Empresa,
  ResumoHonorariosContabeis,
  ContratoHonorarioContabil,
  FaturamentoHonorarioItem,
  TipoContratoHonorario,
  IndiceReajusteHonorario
} from '../../types/contabil';

interface HonorariosContabeisModuleProps {
  empresaAtiva: Empresa;
  onOpenReportPreview?: (config: { titulo: string; subtitulo: string; conteudoHtml: string }) => void;
}

export const HonorariosContabeisModule: React.FC<HonorariosContabeisModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [activeTab, setActiveTab] = useState<'faturamentos' | 'contratos' | 'faturamentoLote'>('faturamentos');
  const [dados, setDados] = useState<ResumoHonorariosContabeis | null>(null);
  const [competenciaSelecionada, setCompetenciaSelecionada] = useState<string>('10/2026');
  const [modalBoletoFatura, setModalBoletoFatura] = useState<FaturamentoHonorarioItem | null>(null);
  const [modalNovoContratoOpen, setModalNovoContratoOpen] = useState(false);
  const [feedbackMensagem, setFeedbackMensagem] = useState<string | null>(null);

  // Formulário de Novo Contrato
  const [formClienteRazao, setFormClienteRazao] = useState('');
  const [formClienteCnpj, setFormClienteCnpj] = useState('');
  const [formNumeroContrato, setFormNumeroContrato] = useState('');
  const [formTipoContrato, setFormTipoContrato] = useState<TipoContratoHonorario>('MENSAL_FIXO');
  const [formValorBase, setFormValorBase] = useState('3500.00');
  const [formDiaVencimento, setFormDiaVencimento] = useState('10');
  const [formIndiceReajuste, setFormIndiceReajuste] = useState<IndiceReajusteHonorario>('IPCA');
  const [formLimiteColab, setFormLimiteColab] = useState('15');
  const [formLimiteNotas, setFormLimiteNotas] = useState('80');
  const [formTarifaColabExc, setFormTarifaColabExc] = useState('45.00');
  const [formTarifaNotaExc, setFormTarifaNotaExc] = useState('2.50');
  const [formPossuiDecimoTerceiro, setFormPossuiDecimoTerceiro] = useState(true);

  const carregarDados = () => {
    const res = dbService.getHonorariosContabeis(empresaAtiva.id);
    setDados(res);
  };

  useEffect(() => {
    carregarDados();
  }, [empresaAtiva]);

  const showFeedback = (msg: string) => {
    setFeedbackMensagem(msg);
    setTimeout(() => setFeedbackMensagem(null), 4000);
  };

  const handleSalvarContrato = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClienteRazao || !formClienteCnpj) {
      showFeedback('Por favor, informe a razão social e CNPJ do cliente contratante.');
      return;
    }

    const novoContrato: ContratoHonorarioContabil = {
      id: `hon-ctr-${Date.now()}`,
      empresaId: empresaAtiva.id,
      clienteRazaoSocial: formClienteRazao,
      clienteCnpj: formClienteCnpj,
      numeroContrato: formNumeroContrato || `HON-${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
      tipoContrato: formTipoContrato,
      dataInicio: new Date().toISOString().split('T')[0],
      dataRenovacao: `${new Date().getFullYear() + 1}-12-31`,
      valorMensalidadeBaseBRL: parseFloat(formValorBase) || 3000,
      diaVencimentoBoleto: parseInt(formDiaVencimento, 10) || 10,
      indiceReajuste: formIndiceReajuste,
      percentualUltimoReajuste: 0,
      dataUltimoReajuste: new Date().toISOString().split('T')[0],
      servicosInclusos: [
        'Escrituração Contábil e Fiscal Digital',
        'Folha de Pagamento e Encargos Previdenciários (eSocial)',
        'Consultoria Tributária Preventiva Contínua'
      ],
      limiteColaboradoresInclusos: parseInt(formLimiteColab, 10) || 10,
      limiteNotasFiscaisInclusas: parseInt(formLimiteNotas, 10) || 50,
      tarifaPorColaboradorExcedenteBRL: parseFloat(formTarifaColabExc) || 40,
      tarifaPorNotaExcedenteBRL: parseFloat(formTarifaNotaExc) || 2,
      possuiDecimoTerceiroHonorario: formPossuiDecimoTerceiro,
      status: 'ATIVO',
      observacoes: 'Contrato cadastrado via painel Domínio Honorários Studio Pro.'
    };

    const res = dbService.salvarContratoHonorario(novoContrato);
    showFeedback(res.mensagem);
    setModalNovoContratoOpen(false);
    carregarDados();
  };

  const handleExcluirContrato = (id: string) => {
    if (confirm('Deseja realmente remover este contrato de prestação de serviços?')) {
      const res = dbService.excluirContratoHonorario(id);
      showFeedback(res.mensagem);
      carregarDados();
    }
  };

  const handleGerarFaturamentoMes = () => {
    const res = dbService.gerarFaturamentoMensalHonorariosDominio(competenciaSelecionada, empresaAtiva.id);
    showFeedback(res.mensagem);
    carregarDados();
  };

  const handleBaixarFatura = (faturaId: string) => {
    const res = dbService.baixarFaturamentoHonorario(faturaId);
    showFeedback(res.mensagem);
    carregarDados();
  };

  const handleIntegrarContabilidade = (faturaId: string) => {
    const res = dbService.integrarFaturamentoHonorarioContabil(faturaId);
    showFeedback(res.mensagem);
    carregarDados();
  };

  const handleEmitirRelatorioExtratoA4 = () => {
    if (!onOpenReportPreview || !dados) return;

    const html = `
      <div style="font-family: Arial, sans-serif; color: #111; font-size: 11px; line-height: 1.4;">
        <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 12px; margin-bottom: 16px;">
          <h2 style="margin: 0 0 4px 0; font-size: 16px; text-transform: uppercase;">Relatório Oficial de Gestão de Honorários Contábeis</h2>
          <div style="font-size: 12px; font-weight: bold; color: #444;">${empresaAtiva.razaoSocial} | CNPJ: ${empresaAtiva.cnpj}</div>
          <div style="font-size: 11px; color: #666;">Demonstrativo de Faturamento Recorrente e Cobranças (Resolução CFC nº 1.457/2013)</div>
        </div>

        <div style="display: flex; justify-content: space-between; margin-bottom: 16px; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 4px; padding: 10px;">
          <div><strong>Contratos Ativos:</strong> ${dados.totalContratosAtivos} clientes</div>
          <div><strong>MRR Base:</strong> ${dados.receitaMensalRecorrenteMRR_BRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
          <div><strong>Total Faturado Mês:</strong> ${dados.totalFaturadoMesBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
          <div><strong>Total Liquidado:</strong> ${dados.totalRecebidoMesBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
        </div>

        <h4 style="margin: 14px 0 6px 0; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #ccc; padding-bottom: 4px;">Faturas Emitidas - Competência ${competenciaSelecionada}</h4>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 10px;">
          <thead>
            <tr style="background-color: #f1f5f9; border-bottom: 1px solid #cbd5e1;">
              <th style="padding: 6px; text-align: left;">Cliente Contratante</th>
              <th style="padding: 6px; text-align: left;">CNPJ</th>
              <th style="padding: 6px; text-align: right;">Mensalidade</th>
              <th style="padding: 6px; text-align: right;">Extras</th>
              <th style="padding: 6px; text-align: right;">Total Fatura</th>
              <th style="padding: 6px; text-align: center;">Vencimento</th>
              <th style="padding: 6px; text-align: center;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${dados.faturamentos.map(f => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 5px;"><strong>${f.clienteRazaoSocial}</strong></td>
                <td style="padding: 5px; font-family: monospace;">${f.clienteCnpj}</td>
                <td style="padding: 5px; text-align: right;">${f.valorMensalidadeBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="padding: 5px; text-align: right;">${f.valorServicosExtrasBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="padding: 5px; text-align: right; font-weight: bold;">${f.valorTotalBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="padding: 5px; text-align: center;">${f.dataVencimento.split('-').reverse().join('/')}</td>
                <td style="padding: 5px; text-align: center; font-weight: bold; color: ${f.status === 'PAGO' ? 'green' : 'orange'};">${f.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="margin-top: 30px; display: flex; justify-content: space-between; text-align: center;">
          <div style="width: 45%; border-top: 1px solid #333; padding-top: 6px;">
            <strong>${empresaAtiva.razaoSocial}</strong><br/>
            Departamento Financeiro & Cobrança
          </div>
          <div style="width: 45%; border-top: 1px solid #333; padding-top: 6px;">
            <strong>Dr. Alexandre Moreira de Andrade</strong><br/>
            Contador Responsável - CRC/SP nº 1SP284.910/O-2
          </div>
        </div>
      </div>
    `;

    onOpenReportPreview({
      titulo: 'EXTRATO GERAL DE HONORÁRIOS CONTÁBEIS',
      subtitulo: `Gestão de Cobranças e Contratos - ${empresaAtiva.razaoSocial}`,
      conteudoHtml: html
    });
  };

  if (!dados) {
    return <div className="flex items-center justify-center h-full text-neutral-400">Carregando módulo de honorários...</div>;
  }

  const formatBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="flex flex-col h-full bg-[#141414] text-neutral-100 overflow-hidden font-sans">
      {/* 1. Header do Módulo Fluent Dark */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#181818]/80 backdrop-blur-md shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 text-amber-400">
            <DollarSign size={22} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-white">Gestão de Honorários Contábeis</h1>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full font-medium">
                Domínio Honorários
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full font-medium">
                Res. CFC 1.457/13
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Contratos de Assessoria, Serviços Extras, Reajustes Automáticos, Boletos com PIX e Integração Contábil
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setModalNovoContratoOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-neutral-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition"
          >
            <Plus size={14} />
            <span>Novo Contrato</span>
          </button>
          <button
            onClick={handleEmitirRelatorioExtratoA4}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition shadow-lg shadow-amber-600/20"
          >
            <Printer size={14} />
            <span>Extrato A4 Timbrado</span>
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
          <div className="text-[11px] text-neutral-400">Contratos Ativos</div>
          <div className="text-base font-bold font-mono text-white mt-0.5">
            {dados.totalContratosAtivos} clientes
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Base regular</div>
        </div>
        <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-white/5">
          <div className="text-[11px] text-neutral-400">MRR Recorrente</div>
          <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
            {formatBRL(dados.receitaMensalRecorrenteMRR_BRL)}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Receita base contratada</div>
        </div>
        <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-white/5">
          <div className="text-[11px] text-neutral-400">Total Faturado Mês</div>
          <div className="text-base font-bold font-mono text-amber-400 mt-0.5">
            {formatBRL(dados.totalFaturadoMesBRL)}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Inclui extras e franquias</div>
        </div>
        <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-white/5">
          <div className="text-[11px] text-neutral-400">Total Recebido</div>
          <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
            {formatBRL(dados.totalRecebidoMesBRL)}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Baixas conciliadas</div>
        </div>
        <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-white/5">
          <div className="text-[11px] text-neutral-400">Pendente / Inadimplente</div>
          <div className="text-base font-bold font-mono text-rose-400 mt-0.5">
            {formatBRL(dados.totalInadimplenteBRL)}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Aguardando liquidação</div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center space-x-1 px-6 pt-3 border-b border-white/5 bg-[#141414] shrink-0">
        <button
          onClick={() => setActiveTab('faturamentos')}
          className={`flex items-center space-x-2 px-4 py-2 text-xs font-medium rounded-t-lg transition border-b-2 ${
            activeTab === 'faturamentos'
              ? 'border-amber-500 text-white bg-white/5'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Receipt size={14} />
          <span>Faturamentos & Boletos ({competenciaSelecionada})</span>
        </button>
        <button
          onClick={() => setActiveTab('contratos')}
          className={`flex items-center space-x-2 px-4 py-2 text-xs font-medium rounded-t-lg transition border-b-2 ${
            activeTab === 'contratos'
              ? 'border-amber-500 text-white bg-white/5'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <FileText size={14} />
          <span>Contratos de Prestação de Serviços</span>
        </button>
        <button
          onClick={() => setActiveTab('faturamentoLote')}
          className={`flex items-center space-x-2 px-4 py-2 text-xs font-medium rounded-t-lg transition border-b-2 ${
            activeTab === 'faturamentoLote'
              ? 'border-amber-500 text-white bg-white/5'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Send size={14} />
          <span>Faturamento em Lote & Reajustes</span>
        </button>
      </div>

      {/* 4. Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* ABA 1: FATURAMENTOS & BOLETOS */}
        {activeTab === 'faturamentos' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Faturamento de Honorários da Competência</h3>
                <p className="text-xs text-neutral-400">Emissão de boletos bancários com QR Code PIX e conciliação atômica</p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-neutral-400">Competência:</span>
                <select
                  value={competenciaSelecionada}
                  onChange={(e) => setCompetenciaSelecionada(e.target.value)}
                  className="px-2.5 py-1 text-xs bg-neutral-900 border border-white/10 rounded-lg text-white font-mono"
                >
                  <option value="10/2026">10/2026</option>
                  <option value="09/2026">09/2026</option>
                  <option value="08/2026">08/2026</option>
                </select>
                <button
                  onClick={handleGerarFaturamentoMes}
                  className="px-3 py-1 text-xs font-medium bg-amber-600/80 hover:bg-amber-500 text-white rounded-lg transition"
                >
                  Processar Faturamento
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 overflow-hidden bg-[#181818]">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-900/90 text-neutral-300 border-b border-white/10">
                    <th className="py-2.5 px-3 font-medium">Cliente Contratante</th>
                    <th className="py-2.5 px-3 font-medium text-right">Mensalidade</th>
                    <th className="py-2.5 px-3 font-medium text-right">Serviços Extras</th>
                    <th className="py-2.5 px-3 font-medium text-right">Valor Total</th>
                    <th className="py-2.5 px-3 font-medium text-center">Vencimento</th>
                    <th className="py-2.5 px-3 font-medium text-center">Boleto / PIX</th>
                    <th className="py-2.5 px-3 font-medium text-center">Status</th>
                    <th className="py-2.5 px-3 font-medium text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {dados.faturamentos.map((fat) => (
                    <tr key={fat.id} className="hover:bg-white/[0.02] transition">
                      <td className="py-2.5 px-3 font-sans">
                        <div className="font-semibold text-white">{fat.clienteRazaoSocial}</div>
                        <div className="text-[11px] text-neutral-400 font-mono">{fat.clienteCnpj}</div>
                        {fat.descricaoServicosExtras && (
                          <div className="text-[10px] text-amber-400/90 font-sans mt-0.5">
                            Extra: {fat.descricaoServicosExtras}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right text-neutral-300">
                        {formatBRL(fat.valorMensalidadeBRL)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-neutral-300">
                        {fat.valorServicosExtrasBRL > 0 ? formatBRL(fat.valorServicosExtrasBRL) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-white">
                        {formatBRL(fat.valorTotalBRL)}
                      </td>
                      <td className="py-2.5 px-3 text-center text-neutral-300">
                        {fat.dataVencimento.split('-').reverse().join('/')}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => setModalBoletoFatura(fat)}
                          className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition text-[11px]"
                        >
                          <QrCode size={12} />
                          <span>Ver Boleto</span>
                        </button>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            fat.status === 'PAGO'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {fat.status === 'PAGO' ? 'PAGO' : 'PENDENTE'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center space-x-1.5 font-sans">
                        {fat.status !== 'PAGO' && (
                          <button
                            onClick={() => handleBaixarFatura(fat.id)}
                            className="px-2 py-1 text-[11px] bg-emerald-600/80 hover:bg-emerald-500 text-white rounded transition"
                            title="Baixar como pago"
                          >
                            Baixar
                          </button>
                        )}
                        {!fat.integradoContabil ? (
                          <button
                            onClick={() => handleIntegrarContabilidade(fat.id)}
                            className="px-2 py-1 text-[11px] bg-purple-600/80 hover:bg-purple-500 text-white rounded transition"
                            title="Lançar no Diário Geral"
                          >
                            Integrar
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-400 font-mono">Integrado</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 2: CONTRATOS */}
        {activeTab === 'contratos' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Contratos de Prestação de Serviços Contábeis</h3>
                <p className="text-xs text-neutral-400">
                  Cadastros contratuais regidos pela Resolução CFC nº 1.457/2013 e Código de Ética Profissional
                </p>
              </div>
              <button
                onClick={() => setModalNovoContratoOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition"
              >
                <Plus size={14} />
                <span>Adicionar Contrato</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {dados.contratos.map((ctr) => (
                <div key={ctr.id} className="p-4 rounded-xl bg-[#181818] border border-white/10 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-amber-400">{ctr.numeroContrato}</span>
                        <span className="px-2 py-0.5 text-[9px] rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                          {ctr.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1">{ctr.clienteRazaoSocial}</h4>
                      <p className="text-xs text-neutral-400 font-mono">{ctr.clienteCnpj}</p>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-bold font-mono text-emerald-400">
                        {formatBRL(ctr.valorMensalidadeBaseBRL)}
                      </div>
                      <div className="text-[10px] text-neutral-400">Vencimento todo dia {ctr.diaVencimentoBoleto}</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-white/5 space-y-1.5 text-xs">
                    <div className="flex justify-between text-neutral-400">
                      <span>Índice de Reajuste:</span>
                      <span className="text-white font-semibold">{ctr.indiceReajuste} ({ctr.percentualUltimoReajuste}% em {ctr.dataUltimoReajuste})</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>Franquia Colaboradores:</span>
                      <span className="text-neutral-200">Até {ctr.limiteColaboradoresInclusos} (Excedente: {formatBRL(ctr.tarifaPorColaboradorExcedenteBRL)}/colab)</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>Franquia Notas Fiscais:</span>
                      <span className="text-neutral-200">Até {ctr.limiteNotasFiscaisInclusas} NFs (Excedente: {formatBRL(ctr.tarifaPorNotaExcedenteBRL)}/NF)</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>13º Honorário Contábil:</span>
                      <span className={ctr.possuiDecimoTerceiroHonorario ? 'text-emerald-400 font-semibold' : 'text-neutral-500'}>
                        {ctr.possuiDecimoTerceiroHonorario ? 'Previsto em Dezembro' : 'Não se aplica'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-neutral-500">Início: {ctr.dataInicio} | Renovação: {ctr.dataRenovacao}</span>
                    <button
                      onClick={() => handleExcluirContrato(ctr.id)}
                      className="text-xs text-rose-400 hover:text-rose-300 transition"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA 3: FATURAMENTO EM LOTE & REAJUSTES */}
        {activeTab === 'faturamentoLote' && (
          <div className="grid grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-[#181818] border border-white/10 space-y-4">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <Send size={20} />
                </span>
                <div>
                  <h4 className="text-base font-bold text-white">Rotina de Faturamento em Lote Automático</h4>
                  <p className="text-xs text-neutral-400">Processa contratos, apura excedentes e gera títulos para a carteira</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-neutral-300">
                <p>
                  A rotina de faturamento em lote do Domínio Honorários calcula de forma transparente:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-neutral-400">
                  <li>Mensalidade contratual base conforme cadastro do contrato;</li>
                  <li>Contagem automática de colaboradores ativos no eSocial (apurando excedentes);</li>
                  <li>Contagem de documentos fiscais emitidos/tomados na Escrita Fiscal;</li>
                  <li>Geração da linha digitável FEBRABAN e QR Code PIX instantâneo;</li>
                </ul>
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <input
                  type="text"
                  value={competenciaSelecionada}
                  onChange={(e) => setCompetenciaSelecionada(e.target.value)}
                  className="px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white font-mono text-xs w-32"
                  placeholder="MM/AAAA"
                />
                <button
                  onClick={handleGerarFaturamentoMes}
                  className="flex-1 py-2 px-4 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs rounded-lg transition shadow-lg shadow-amber-600/20"
                >
                  Disparar Faturamento em Lote
                </button>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#181818] border border-white/10 space-y-4">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Percent size={20} />
                </span>
                <div>
                  <h4 className="text-base font-bold text-white">Reajustes Anuais dos Honorários</h4>
                  <p className="text-xs text-neutral-400">Cláusula de recomposição monetária inflacionária</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-white/5 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-neutral-400">Índice IPCA Acumulado 12m:</span>
                  <span className="text-emerald-400 font-bold font-mono">4.62% a.a.</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-neutral-400">Índice IGP-M (FGV) 12m:</span>
                  <span className="text-emerald-400 font-bold font-mono">5.10% a.a.</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-neutral-400">Reajuste Salário Mínimo:</span>
                  <span className="text-emerald-400 font-bold font-mono">6.97% a.a.</span>
                </div>
              </div>

              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Os reajustes são aplicados automaticamente na data de aniversário de cada contrato,
                notificando os clientes com memória de cálculo e carta formal timbrada.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: NOVO CONTRATO DE HONORÁRIOS */}
      {modalNovoContratoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#181818] border border-white/10 rounded-2xl shadow-2xl max-w-xl w-full p-6 text-neutral-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <h3 className="text-base font-semibold text-white flex items-center space-x-2">
                <FileText size={18} className="text-amber-400" />
                <span>Novo Contrato de Prestação de Serviços Contábeis</span>
              </h3>
              <button
                onClick={() => setModalNovoContratoOpen(false)}
                className="text-neutral-400 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSalvarContrato} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Razão Social do Cliente</label>
                  <input
                    type="text"
                    required
                    value={formClienteRazao}
                    onChange={(e) => setFormClienteRazao(e.target.value)}
                    placeholder="Ex: Comercial Aliança Ltda"
                    className="w-full px-3 py-1.5 bg-neutral-900 border border-white/10 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">CNPJ do Cliente</label>
                  <input
                    type="text"
                    required
                    value={formClienteCnpj}
                    onChange={(e) => setFormClienteCnpj(e.target.value)}
                    placeholder="00.000.000/0001-00"
                    className="w-full px-3 py-1.5 bg-neutral-900 border border-white/10 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Mensalidade Base (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formValorBase}
                    onChange={(e) => setFormValorBase(e.target.value)}
                    className="w-full px-3 py-1.5 bg-neutral-900 border border-white/10 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Dia do Vencimento</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={formDiaVencimento}
                    onChange={(e) => setFormDiaVencimento(e.target.value)}
                    className="w-full px-3 py-1.5 bg-neutral-900 border border-white/10 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Índice Reajuste</label>
                  <select
                    value={formIndiceReajuste}
                    onChange={(e) => setFormIndiceReajuste(e.target.value as IndiceReajusteHonorario)}
                    className="w-full px-3 py-1.5 bg-neutral-900 border border-white/10 rounded-lg text-white"
                  >
                    <option value="IPCA">IPCA (IBGE)</option>
                    <option value="IGPM">IGP-M (FGV)</option>
                    <option value="INPC">INPC</option>
                    <option value="SALARIO_MINIMO">Salário Mínimo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Franquia Colaboradores</label>
                  <input
                    type="number"
                    value={formLimiteColab}
                    onChange={(e) => setFormLimiteColab(e.target.value)}
                    className="w-full px-3 py-1.5 bg-neutral-900 border border-white/10 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Tarifa Excedente p/ Colaborador (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formTarifaColabExc}
                    onChange={(e) => setFormTarifaColabExc(e.target.value)}
                    className="w-full px-3 py-1.5 bg-neutral-900 border border-white/10 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="decimoTerceiroCheck"
                  checked={formPossuiDecimoTerceiro}
                  onChange={(e) => setFormPossuiDecimoTerceiro(e.target.checked)}
                  className="rounded bg-neutral-900 border-white/20 text-amber-500"
                />
                <label htmlFor="decimoTerceiroCheck" className="text-neutral-300">
                  Cobrar 13º Honorário Contábil anual no mês de Dezembro
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalNovoContratoOpen(false)}
                  className="px-4 py-1.5 text-xs text-neutral-300 hover:text-white bg-neutral-800 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition"
                >
                  Salvar Contrato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VISUALIZADOR DE BOLETO COM PIX */}
      {modalBoletoFatura && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#181818] border border-white/10 rounded-2xl shadow-2xl max-w-lg w-full p-6 text-neutral-100 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <Receipt size={18} className="text-amber-400" />
                <h3 className="text-base font-semibold text-white">Boleto Bancário & PIX Copia e Cola</h3>
              </div>
              <button onClick={() => setModalBoletoFatura(null)} className="text-neutral-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-neutral-900/80 border border-white/5 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-400">Sacado / Cliente:</span>
                <span className="text-white font-semibold">{modalBoletoFatura.clienteRazaoSocial}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">CNPJ:</span>
                <span className="font-mono text-neutral-300">{modalBoletoFatura.clienteCnpj}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Vencimento:</span>
                <span className="text-amber-400 font-bold">{modalBoletoFatura.dataVencimento.split('-').reverse().join('/')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Valor Cobrado:</span>
                <span className="text-emerald-400 font-bold text-sm">{formatBRL(modalBoletoFatura.valorTotalBRL)}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <span className="text-neutral-400">Linha Digitável FEBRABAN:</span>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={modalBoletoFatura.linhaDigitavel}
                  className="w-full px-3 py-1.5 bg-neutral-900 border border-white/10 rounded-lg text-white font-mono text-[11px]"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(modalBoletoFatura.linhaDigitavel);
                    showFeedback('Linha digitável copiada!');
                  }}
                  className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-neutral-300"
                  title="Copiar linha digitável"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <span className="text-neutral-400">PIX Copia e Cola:</span>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={modalBoletoFatura.codigoPixCopiaECola}
                  className="w-full px-3 py-1.5 bg-neutral-900 border border-white/10 rounded-lg text-white font-mono text-[10px] truncate"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(modalBoletoFatura.codigoPixCopiaECola);
                    showFeedback('Código PIX copiado!');
                  }}
                  className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-neutral-300"
                  title="Copiar código PIX"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setModalBoletoFatura(null)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
