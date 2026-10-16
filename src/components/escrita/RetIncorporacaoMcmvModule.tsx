import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  RefreshCw,
  Printer,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  FileText,
  Search,
  Filter,
  Calculator,
  Calendar,
  Layers,
  Edit,
  Trash2,
  ShieldCheck,
  Scale,
  DollarSign,
  Landmark,
  Home,
  CheckSquare,
  FileCheck2,
  HelpCircle,
  Clock
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  ApuracaoMensalRet,
  EmpreendimentoAfetacaoRet,
  Empresa,
  ModalidadeRet,
  ResumoRetAfetacao
} from '../../types/contabil';

interface RetIncorporacaoMcmvModuleProps {
  empresaAtiva: Empresa | null;
  onOpenReportPreview?: (config: {
    titulo: string;
    subtitulo: string;
    conteudoHtml: string;
    imprimirDireto?: boolean;
  }) => void;
}

export const RetIncorporacaoMcmvModule: React.FC<RetIncorporacaoMcmvModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [resumo, setResumo] = useState<ResumoRetAfetacao | null>(null);
  const [competencia, setCompetencia] = useState('2026-03');
  const [abaAtiva, setAbaAtiva] = useState<'apuracoes' | 'empreendimentos' | 'conciliacao' | 'legislacao'>('apuracoes');
  const [busca, setBusca] = useState('');

  // Modais
  const [isModalEmpreendimentoOpen, setIsModalEmpreendimentoOpen] = useState(false);
  const [isModalApuracaoOpen, setIsModalApuracaoOpen] = useState(false);
  const [itemEdicaoEmpreendimento, setItemEdicaoEmpreendimento] = useState<EmpreendimentoAfetacaoRet | null>(null);
  const [itemEdicaoApuracao, setItemEdicaoApuracao] = useState<ApuracaoMensalRet | null>(null);

  // Form Empreendimento
  const [empNome, setEmpNome] = useState('');
  const [empCnpjSpe, setEmpCnpjSpe] = useState('');
  const [empTermoRgi, setEmpTermoRgi] = useState('');
  const [empModalidade, setEmpModalidade] = useState<ModalidadeRet>('RET_GERAL_4_PORCENTO');
  const [empBanco, setEmpBanco] = useState('Banco Itaú Unibanco');
  const [empConta, setEmpConta] = useState('');
  const [empDataAdesao, setEmpDataAdesao] = useState('2025-01-15');
  const [empStatus, setEmpStatus] = useState<'EM_CONSTRUCAO' | 'CONCLUIDO_HABITE_SE' | 'ENCERRADO'>('EM_CONSTRUCAO');

  // Form Apuração
  const [apurEmpreendimentoId, setApurEmpreendimentoId] = useState('');
  const [apurCompetencia, setApurCompetencia] = useState('2026-03');
  const [apurVencimentoDarf, setApurVencimentoDarf] = useState('2026-04-20');
  const [apurReceitaConstrucao, setApurReceitaConstrucao] = useState<number>(1250000);
  const [apurReceitaProntas, setApurReceitaProntas] = useState<number>(0);
  const [apurOutrasReceitas, setApurOutrasReceitas] = useState<number>(0);
  const [apurSaldoBancarioConta, setApurSaldoBancarioConta] = useState<number>(1250000);
  const [apurConciliacaoOk, setApurConciliacaoOk] = useState<boolean>(true);
  const [apurStatusDarf, setApurStatusDarf] = useState<'PENDENTE' | 'PAGO' | 'COMPENSADO'>('PENDENTE');
  const [apurObs, setApurObs] = useState('');

  const carregarDados = () => {
    if (!empresaAtiva) return;
    const res = dbService.getResumoRetAfetacao(empresaAtiva.id, competencia);
    setResumo(res);
  };

  useEffect(() => {
    carregarDados();
  }, [empresaAtiva, competencia]);

  const abrirModalNovoEmpreendimento = () => {
    setItemEdicaoEmpreendimento(null);
    setEmpNome('');
    setEmpCnpjSpe('');
    setEmpTermoRgi('');
    setEmpModalidade('RET_GERAL_4_PORCENTO');
    setEmpBanco('Banco do Brasil');
    setEmpConta('Ag. 1234-5 C/C 98765-4 (Vinculada)');
    setEmpDataAdesao(new Date().toISOString().split('T')[0]);
    setEmpStatus('EM_CONSTRUCAO');
    setIsModalEmpreendimentoOpen(true);
  };

  const abrirModalEditarEmpreendimento = (emp: EmpreendimentoAfetacaoRet) => {
    setItemEdicaoEmpreendimento(emp);
    setEmpNome(emp.nomeEmpreendimento);
    setEmpCnpjSpe(emp.cnpjAfetacaoSpe);
    setEmpTermoRgi(emp.termoAfetacaoCartorioRgi);
    setEmpModalidade(emp.modalidade);
    setEmpBanco(emp.bancoContaVinculada);
    setEmpConta(emp.numeroContaVinculada);
    setEmpDataAdesao(emp.dataAdesaoRetRFB);
    setEmpStatus(emp.status);
    setIsModalEmpreendimentoOpen(true);
  };

  const handleSalvarEmpreendimento = () => {
    if (!empresaAtiva) return;
    const item: EmpreendimentoAfetacaoRet = {
      id: itemEdicaoEmpreendimento?.id || `emp-ret-${Date.now()}`,
      empresaId: empresaAtiva.id,
      nomeEmpreendimento: empNome,
      cnpjAfetacaoSpe: empCnpjSpe,
      termoAfetacaoCartorioRgi: empTermoRgi,
      modalidade: empModalidade,
      aliquotaUnificada: empModalidade === 'RET_SOCIAL_MCMV_1_PORCENTO' ? 1.0 : 4.0,
      bancoContaVinculada: empBanco,
      numeroContaVinculada: empConta,
      dataAdesaoRetRFB: empDataAdesao,
      status: empStatus
    };
    dbService.salvarEmpreendimentoRet(item);
    setIsModalEmpreendimentoOpen(false);
    carregarDados();
  };

  const abrirModalNovaApuracao = () => {
    setItemEdicaoApuracao(null);
    const prim = resumo?.empreendimentos[0];
    setApurEmpreendimentoId(prim ? prim.id : '');
    setApurCompetencia(competencia);
    setApurVencimentoDarf('2026-04-20');
    setApurReceitaConstrucao(500000);
    setApurReceitaProntas(0);
    setApurOutrasReceitas(0);
    setApurSaldoBancarioConta(500000);
    setApurConciliacaoOk(true);
    setApurStatusDarf('PENDENTE');
    setApurObs('');
    setIsModalApuracaoOpen(true);
  };

  const abrirModalEditarApuracao = (apur: ApuracaoMensalRet) => {
    setItemEdicaoApuracao(apur);
    setApurEmpreendimentoId(apur.empreendimentoId);
    setApurCompetencia(apur.competencia);
    setApurVencimentoDarf(apur.dataVencimentoDarf);
    setApurReceitaConstrucao(apur.receitasRecebidasUnidadesConstrucao);
    setApurReceitaProntas(apur.receitasRecebidasUnidadesProntas);
    setApurOutrasReceitas(apur.outrasReceitasOperacionais);
    setApurSaldoBancarioConta(apur.saldoBancarioContaAfetacao);
    setApurConciliacaoOk(apur.conciliacaoBancariaValidada);
    setApurStatusDarf(apur.statusDarf);
    setApurObs(apur.observacoes || '');
    setIsModalApuracaoOpen(true);
  };

  const handleSalvarApuracao = () => {
    if (!empresaAtiva) return;
    const emp = resumo?.empreendimentos.find(e => e.id === apurEmpreendimentoId);
    const aliq = emp ? emp.aliquotaUnificada : 4.0;
    const base = apurReceitaConstrucao + apurReceitaProntas + apurOutrasReceitas;
    const valorDarf = Math.round(base * (aliq / 100) * 100) / 100;

    const rateio = aliq === 1.0
      ? {
          irpj: Math.round(base * 0.0031 * 100) / 100,
          csll: Math.round(base * 0.0016 * 100) / 100,
          pis: Math.round(base * 0.0009 * 100) / 100,
          cofins: Math.round(base * 0.0044 * 100) / 100
        }
      : {
          irpj: Math.round(base * 0.0126 * 100) / 100,
          csll: Math.round(base * 0.0066 * 100) / 100,
          pis: Math.round(base * 0.0037 * 100) / 100,
          cofins: Math.round(base * 0.0171 * 100) / 100
        };

    const item: ApuracaoMensalRet = {
      id: itemEdicaoApuracao?.id || `ret-${Date.now()}`,
      empresaId: empresaAtiva.id,
      empreendimentoId: apurEmpreendimentoId,
      nomeEmpreendimento: emp?.nomeEmpreendimento || 'Empreendimento Incorporação',
      cnpjAfetacaoSpe: emp?.cnpjAfetacaoSpe || '',
      competencia: apurCompetencia,
      dataVencimentoDarf: apurVencimentoDarf,
      receitasRecebidasUnidadesConstrucao: apurReceitaConstrucao,
      receitasRecebidasUnidadesProntas: apurReceitaProntas,
      outrasReceitasOperacionais: apurOutrasReceitas,
      baseCalculoEfetivaRet: base,
      aliquotaRet: aliq,
      valorTotalDarf4095: valorDarf,
      rateioTributos: rateio,
      saldoBancarioContaAfetacao: apurSaldoBancarioConta,
      conciliacaoBancariaValidada: apurConciliacaoOk,
      statusDarf: apurStatusDarf,
      integradoContabil: itemEdicaoApuracao?.integradoContabil || false,
      observacoes: apurObs
    };

    dbService.salvarApuracaoRet(item);
    setIsModalApuracaoOpen(false);
    carregarDados();
  };

  const handleExcluirApuracao = (id: string) => {
    if (confirm('Deseja excluir esta apuração do RET?')) {
      dbService.excluirApuracaoRet(id);
      carregarDados();
    }
  };

  const handleIntegrarContabil = (id: string) => {
    const res = dbService.integrarRetContabil(id);
    alert(res.mensagem);
    carregarDados();
  };

  // Impressão A4
  const imprimirDossieRetA4 = () => {
    if (!empresaAtiva || !resumo) return;

    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #111; padding: 24px; max-width: 900px; margin: 0 auto; line-height: 1.4;">
        <div style="border-bottom: 2px solid #0f766e; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <h1 style="margin: 0; font-size: 18px; text-transform: uppercase; color: #0f766e;">DEMONSTRATIVO DE APURAÇÃO DO RET - LEI Nº 10.931/2004</h1>
            <p style="margin: 4px 0 0; font-size: 12px; color: #555;">Regime Especial de Tributação Aplicável às Incorporações Imobiliárias e Construções Habitacionais (MCMV)</p>
          </div>
          <div style="text-align: right; font-size: 11px; color: #666;">
            <strong>Competência:</strong> ${competencia}<br>
            <strong>Emissão:</strong> ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}
          </div>
        </div>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-bottom: 16px; font-size: 12px;">
          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 8px;">
            <div><strong>Incorporadora / Razão Social:</strong> ${empresaAtiva.razaoSocial}</div>
            <div><strong>CNPJ Matriz:</strong> ${empresaAtiva.cnpj}</div>
            <div><strong>Regime de Tributação da Incorporação:</strong> RET com Patrimônio de Afetação Constituído</div>
            <div><strong>Total de Empreendimentos Afetados:</strong> ${resumo.totalObrasAfetadas}</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 10px; border-radius: 6px; text-align: center;">
            <div style="font-size: 10px; font-weight: 600; color: #166534; text-transform: uppercase;">Receita Total Recebida (Caixa)</div>
            <div style="font-size: 16px; font-weight: 700; color: #15803d; margin-top: 4px;">R$ ${resumo.totalReceitaArrecadadaPeriodo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
          <div style="background: #f0fdfa; border: 1px solid #99f6e4; padding: 10px; border-radius: 6px; text-align: center;">
            <div style="font-size: 10px; font-weight: 600; color: #0f766e; text-transform: uppercase;">Total DARF Código 4095</div>
            <div style="font-size: 16px; font-weight: 700; color: #0f766e; margin-top: 4px;">R$ ${resumo.totalTributosRetDevidos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 10px; border-radius: 6px; text-align: center;">
            <div style="font-size: 10px; font-weight: 600; color: #1e40af; text-transform: uppercase;">Vencimento Legal DARF</div>
            <div style="font-size: 15px; font-weight: 700; color: #1d4ed8; margin-top: 4px;">20/${competencia.split('-')[1]}/2026</div>
          </div>
        </div>

        <h3 style="font-size: 13px; text-transform: uppercase; color: #334155; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 8px;">
          Detalhamento por Empreendimento e Segregação do Rateio Federal
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 16px;">
          <thead>
            <tr style="background-color: #f1f5f9; text-align: left; border-bottom: 1px solid #94a3b8;">
              <th style="padding: 6px;">Empreendimento / CNPJ SPE</th>
              <th style="padding: 6px; text-align: right;">Receitas Caixa</th>
              <th style="padding: 6px; text-align: center;">Alíq.</th>
              <th style="padding: 6px; text-align: right;">IRPJ</th>
              <th style="padding: 6px; text-align: right;">CSLL</th>
              <th style="padding: 6px; text-align: right;">PIS</th>
              <th style="padding: 6px; text-align: right;">COFINS</th>
              <th style="padding: 6px; text-align: right;">Total DARF</th>
            </tr>
          </thead>
          <tbody>
            ${resumo.apuracoes.map(a => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 6px;">
                  <strong>${a.nomeEmpreendimento}</strong><br>
                  <span style="font-size: 9px; color: #64748b;">CNPJ SPE: ${a.cnpjAfetacaoSpe}</span>
                </td>
                <td style="padding: 6px; text-align: right; font-family: monospace;">R$ ${a.baseCalculoEfetivaRet.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="padding: 6px; text-align: center; font-weight: 600; color: ${a.aliquotaRet === 1 ? '#047857' : '#0284c7'};">${a.aliquotaRet.toFixed(1)}%</td>
                <td style="padding: 6px; text-align: right; font-family: monospace;">R$ ${a.rateioTributos.irpj.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="padding: 6px; text-align: right; font-family: monospace;">R$ ${a.rateioTributos.csll.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="padding: 6px; text-align: right; font-family: monospace;">R$ ${a.rateioTributos.pis.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="padding: 6px; text-align: right; font-family: monospace;">R$ ${a.rateioTributos.cofins.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="padding: 6px; text-align: right; font-weight: bold; font-family: monospace; color: #0f766e;">R$ ${a.valorTotalDarf4095.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style="background-color: #f8fafc; font-weight: bold; border-top: 2px solid #0f766e;">
              <td style="padding: 6px;">TOTAIS CONSOLIDADOS:</td>
              <td style="padding: 6px; text-align: right; font-family: monospace;">R$ ${resumo.totalReceitaArrecadadaPeriodo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              <td style="padding: 6px; text-align: center;">-</td>
              <td style="padding: 6px; text-align: right; font-family: monospace;">R$ ${resumo.apuracoes.reduce((acc, x) => acc + x.rateioTributos.irpj, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              <td style="padding: 6px; text-align: right; font-family: monospace;">R$ ${resumo.apuracoes.reduce((acc, x) => acc + x.rateioTributos.csll, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              <td style="padding: 6px; text-align: right; font-family: monospace;">R$ ${resumo.apuracoes.reduce((acc, x) => acc + x.rateioTributos.pis, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              <td style="padding: 6px; text-align: right; font-family: monospace;">R$ ${resumo.apuracoes.reduce((acc, x) => acc + x.rateioTributos.cofins, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              <td style="padding: 6px; text-align: right; font-family: monospace; color: #0f766e;">R$ ${resumo.totalTributosRetDevidos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            </tr>
          </tfoot>
        </table>

        <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; margin-bottom: 24px; font-size: 10px; color: #475569; background-color: #f8fafc;">
          <strong>Notas Regulatórias e Fundamentação Jurídico-Fiscal:</strong><br>
          1. <strong>Regime Unificado (Lei nº 10.931/2004, arts. 1º a 4º):</strong> O pagamento unificado mensal sob o código DARF 4095 quita de forma definitiva e segregada os tributos IRPJ, CSLL, PIS e COFINS incidentes sobre as receitas recebidas da incorporação imobiliária sob patrimônio de afetação.<br>
          2. <strong>Alíquotas e Rateio Legal:</strong> Para o RET Geral (4%), o rateio compõe IRPJ (1,26%), CSLL (0,66%), PIS (0,37%) e COFINS (1,71%). Para projetos de Habitação de Interesse Social / MCMV (1%), o rateio é IRPJ (0,31%), CSLL (0,16%), PIS (0,09%) e COFINS (0,44%).<br>
          3. <strong>Segregação Patrimonial e Conta Vinculada:</strong> Os recursos encontram-se depositados e movimentados com exclusividade nas respectivas contas bancárias de afetação vinculadas a cada matrícula imobiliária, sem comunicação com o patrimônio geral da empresa líder.
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; text-align: center; font-size: 11px;">
          <div>
            <div style="border-top: 1px solid #334155; padding-top: 4px; margin-top: 40px;">
              <strong>Engenheiro / Diretor de Operações</strong><br>
              Comissão de Representantes dos Adquirentes
            </div>
          </div>
          <div>
            <div style="border-top: 1px solid #334155; padding-top: 4px; margin-top: 40px;">
              <strong>Contador Responsável</strong><br>
              CRC/SP nº 1SP999999/O-0
            </div>
          </div>
        </div>
      </div>
    `;

    if (onOpenReportPreview) {
      onOpenReportPreview({
        titulo: `Dossiê RET Lei 10.931/2004 - Comp. ${competencia}`,
        subtitulo: `Apuração Mensal do Patrimônio de Afetação e DARF 4095 - ${empresaAtiva.razaoSocial}`,
        conteudoHtml: html,
        imprimirDireto: false
      });
    }
  };

  const apuracoesFiltradas = resumo?.apuracoes.filter(a => {
    const termo = busca.toLowerCase();
    return (
      a.nomeEmpreendimento.toLowerCase().includes(termo) ||
      a.cnpjAfetacaoSpe.toLowerCase().includes(termo) ||
      a.competencia.toLowerCase().includes(termo)
    );
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header com Contexto Fiscal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1f1f1f] p-5 rounded-lg border border-[#333333] shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-950/60 border border-teal-800/80 rounded-lg text-teal-400">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-wide">
                RET - Regime Especial de Tributação (Lei 10.931/2004)
              </h2>
              <span className="px-2 py-0.5 text-xs font-semibold bg-teal-900/40 text-teal-300 border border-teal-700/60 rounded">
                Patrimônio de Afetação & MCMV
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Gestão de SPEs Afetadas, Apuração Mensal por Regime de Caixa (1% e 4%), Rateio Tributário e Emissão do DARF Código 4095
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#141414] border border-[#333333] rounded px-3 py-1.5 text-xs">
            <Calendar className="w-4 h-4 text-teal-400 mr-2" />
            <span className="text-neutral-400 mr-2">Competência:</span>
            <input
              type="month"
              value={competencia}
              onChange={(e) => setCompetencia(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer font-mono text-xs"
            />
          </div>

          <button
            onClick={carregarDados}
            title="Atualizar Dados"
            className="p-2 bg-[#2a2a2a] hover:bg-[#333333] text-neutral-300 rounded border border-[#444444] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={imprimirDossieRetA4}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2a2a2a] hover:bg-[#333333] text-white rounded border border-[#444444] text-xs font-medium transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4 text-teal-400" />
            <span>Dossiê A4</span>
          </button>

          <button
            onClick={abrirModalNovaApuracao}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded text-xs font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Apuração</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Receita Total no Caixa */}
        <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#333333] shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Receitas Arrecadadas (Caixa)</span>
            <span className="p-1.5 bg-emerald-950/50 text-emerald-400 rounded border border-emerald-800/60">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white">
            R$ {(resumo?.totalReceitaArrecadadaPeriodo || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 flex items-center text-xs text-neutral-400">
            <span className="text-emerald-400 font-semibold mr-1">Regime de Caixa</span>
            <span>parcelas e sinal recebidos</span>
          </div>
        </div>

        {/* DARF 4095 Apurado */}
        <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#333333] shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Total DARF Código 4095</span>
            <span className="p-1.5 bg-teal-950/50 text-teal-400 rounded border border-teal-800/60">
              <Calculator className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-teal-400">
            R$ {(resumo?.totalTributosRetDevidos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 flex items-center text-xs text-neutral-400">
            <span className="text-neutral-300 font-medium mr-1">Vencimento:</span>
            <span className="text-neutral-200">20 do mês subsequente</span>
          </div>
        </div>

        {/* Empreendimentos Afetados */}
        <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#333333] shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Obras com Afetação</span>
            <span className="p-1.5 bg-blue-950/50 text-blue-400 rounded border border-blue-800/60">
              <Building2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white">
            {resumo?.totalObrasAfetadas || 0}
          </div>
          <div className="mt-1 flex items-center text-xs text-neutral-400">
            <span className="text-blue-400 font-medium mr-1">SPEs & Filiais</span>
            <span>com Matrícula RGI</span>
          </div>
        </div>

        {/* Status de Conformidade */}
        <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#333333] shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Contas Vinculadas</span>
            <span className="p-1.5 bg-indigo-950/50 text-indigo-400 rounded border border-indigo-800/60">
              <Landmark className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <span>100% Conciliado</span>
          </div>
          <div className="mt-1 flex items-center text-xs text-neutral-400">
            <span className="text-neutral-300">Patrimônio Incomunicável</span>
          </div>
        </div>
      </div>

      {/* Navegação de Abas */}
      <div className="flex items-center justify-between border-b border-[#333333] pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAbaAtiva('apuracoes')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-t-md border-b-2 transition-all ${
              abaAtiva === 'apuracoes'
                ? 'border-teal-500 text-teal-400 bg-[#252525]'
                : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-[#1a1a1a]'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Apurações Mensais & DARF 4095 ({resumo?.apuracoes.length || 0})</span>
          </button>

          <button
            onClick={() => setAbaAtiva('empreendimentos')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-t-md border-b-2 transition-all ${
              abaAtiva === 'empreendimentos'
                ? 'border-teal-500 text-teal-400 bg-[#252525]'
                : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-[#1a1a1a]'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Empreendimentos Afetados ({resumo?.empreendimentos.length || 0})</span>
          </button>

          <button
            onClick={() => setAbaAtiva('conciliacao')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-t-md border-b-2 transition-all ${
              abaAtiva === 'conciliacao'
                ? 'border-teal-500 text-teal-400 bg-[#252525]'
                : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-[#1a1a1a]'
            }`}
          >
            <Landmark className="w-4 h-4" />
            <span>Conciliação de Conta Vinculada</span>
          </button>

          <button
            onClick={() => setAbaAtiva('legislacao')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-t-md border-b-2 transition-all ${
              abaAtiva === 'legislacao'
                ? 'border-teal-500 text-teal-400 bg-[#252525]'
                : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-[#1a1a1a]'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Regras & Alíquotas Legais</span>
          </button>
        </div>

        {abaAtiva === 'empreendimentos' && (
          <button
            onClick={abrirModalNovoEmpreendimento}
            className="flex items-center gap-1.5 px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded text-xs font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Empreendimento</span>
          </button>
        )}
      </div>

      {/* Conteúdo Aba 1: Apurações Mensais & DARF 4095 */}
      {abaAtiva === 'apuracoes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 bg-[#1a1a1a] p-3 rounded-lg border border-[#333333]">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Filtrar por empreendimento ou CNPJ da afetação..."
                className="w-full bg-[#141414] border border-[#333333] rounded pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div className="text-xs text-neutral-400 font-mono">
              Registros encontrados: {apuracoesFiltradas.length}
            </div>
          </div>

          <div className="overflow-x-auto bg-[#1a1a1a] rounded-lg border border-[#333333] shadow-md">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#242424] text-neutral-300 font-semibold border-b border-[#333333]">
                  <th className="p-3">Empreendimento Afetado</th>
                  <th className="p-3">CNPJ SPE</th>
                  <th className="p-3">Competência</th>
                  <th className="p-3 text-right">Base Efetiva (R$)</th>
                  <th className="p-3 text-center">Alíquota</th>
                  <th className="p-3 text-right">DARF 4095 (R$)</th>
                  <th className="p-3 text-center">Rateio (IR/CS/PIS/COF)</th>
                  <th className="p-3 text-center">Vencimento</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2e2e2e]">
                {apuracoesFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-neutral-500">
                      Nenhuma apuração de RET registrada para esta competência.
                    </td>
                  </tr>
                ) : (
                  apuracoesFiltradas.map((a) => (
                    <tr key={a.id} className="hover:bg-[#222222] transition-colors">
                      <td className="p-3 font-medium text-white">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
                          <span>{a.nomeEmpreendimento}</span>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-neutral-300">{a.cnpjAfetacaoSpe}</td>
                      <td className="p-3 font-mono text-neutral-400">{a.competencia}</td>
                      <td className="p-3 text-right font-mono font-semibold text-neutral-200">
                        {a.baseCalculoEfetivaRet.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            a.aliquotaRet === 1.0
                              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/60'
                              : 'bg-teal-950/60 text-teal-300 border border-teal-700/60'
                          }`}
                        >
                          {a.aliquotaRet.toFixed(1)}% {a.aliquotaRet === 1.0 ? 'MCMV' : 'Geral'}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-teal-400">
                        {a.valorTotalDarf4095.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1 font-mono text-[10px] text-neutral-400">
                          <span title="IRPJ" className="text-blue-300 font-semibold">{a.rateioTributos.irpj.toFixed(2)}</span> /
                          <span title="CSLL" className="text-amber-300 font-semibold">{a.rateioTributos.csll.toFixed(2)}</span> /
                          <span title="PIS" className="text-emerald-300 font-semibold">{a.rateioTributos.pis.toFixed(2)}</span> /
                          <span title="COFINS" className="text-purple-300 font-semibold">{a.rateioTributos.cofins.toFixed(2)}</span>
                        </div>
                      </td>
                      <td className="p-3 text-center font-mono text-neutral-300">
                        {a.dataVencimentoDarf}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            a.statusDarf === 'PAGO'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : a.statusDarf === 'COMPENSADO'
                              ? 'bg-purple-950 text-purple-300 border border-purple-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {a.statusDarf}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleIntegrarContabil(a.id)}
                            title={a.integradoContabil ? "Já integrado à contabilidade" : "Integrar ao Diário Geral"}
                            className={`p-1.5 rounded transition-colors ${
                              a.integradoContabil
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 cursor-default'
                                : 'bg-[#2a2a2a] hover:bg-teal-900/50 text-neutral-300 hover:text-teal-300 border border-[#444444]'
                            }`}
                          >
                            <FileCheck2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => abrirModalEditarApuracao(a)}
                            title="Editar Apuração"
                            className="p-1.5 bg-[#2a2a2a] hover:bg-[#333333] text-neutral-300 hover:text-white rounded border border-[#444444] transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleExcluirApuracao(a.id)}
                            title="Excluir"
                            className="p-1.5 bg-[#2a2a2a] hover:bg-red-950/60 text-neutral-400 hover:text-red-400 rounded border border-[#444444] transition-colors"
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

      {/* Conteúdo Aba 2: Empreendimentos Afetados (SPEs e Filiais) */}
      {abaAtiva === 'empreendimentos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resumo?.empreendimentos.map((emp) => (
            <div
              key={emp.id}
              className="bg-[#1a1a1a] rounded-lg border border-[#333333] p-4 flex flex-col justify-between shadow-sm hover:border-teal-700/60 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-teal-950/50 text-teal-400 rounded border border-teal-800/60">
                      <Home className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white leading-tight">{emp.nomeEmpreendimento}</h4>
                      <span className="text-[11px] font-mono text-neutral-400">{emp.cnpjAfetacaoSpe}</span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      emp.modalidade === 'RET_SOCIAL_MCMV_1_PORCENTO'
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/60'
                        : 'bg-teal-950/60 text-teal-300 border border-teal-700/60'
                    }`}
                  >
                    {emp.aliquotaUnificada.toFixed(1)}%
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-neutral-300 border-t border-[#2e2e2e] pt-3">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Cartório / RGI:</span>
                    <span className="font-mono text-neutral-300 text-right">{emp.termoAfetacaoCartorioRgi}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Conta Vinculada:</span>
                    <span className="font-mono text-neutral-200 text-right">{emp.bancoContaVinculada}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Número C/C:</span>
                    <span className="font-mono text-emerald-400 text-right">{emp.numeroContaVinculada}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Adesão RET RFB:</span>
                    <span className="font-mono text-neutral-300">{emp.dataAdesaoRetRFB}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-neutral-500">Status Obra:</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        emp.status === 'EM_CONSTRUCAO'
                          ? 'bg-blue-950 text-blue-300 border border-blue-800'
                          : emp.status === 'CONCLUIDO_HABITE_SE'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                      }`}
                    >
                      {emp.status === 'EM_CONSTRUCAO' ? 'Em Construção' : emp.status === 'CONCLUIDO_HABITE_SE' ? 'Habite-se Concedido' : 'Encerrado'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#2e2e2e] flex justify-end gap-2">
                <button
                  onClick={() => abrirModalEditarEmpreendimento(emp)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-[#252525] hover:bg-[#333333] text-neutral-300 hover:text-white rounded border border-[#444444] text-xs transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Conteúdo Aba 3: Conciliação de Conta Vinculada */}
      {abaAtiva === 'conciliacao' && (
        <div className="bg-[#1a1a1a] p-5 rounded-lg border border-[#333333] space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-950/60 border border-indigo-800/80 rounded-lg text-indigo-400">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Conciliação da Conta Bancária Vinculada ao Patrimônio de Afetação</h3>
              <p className="text-xs text-neutral-400">
                Auditoria de segregação patrimonial: receitas de venda recebidas vs movimentação na conta bancária exclusiva.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#242424] text-neutral-300 font-semibold border-b border-[#333333]">
                  <th className="p-3">Empreendimento</th>
                  <th className="p-3">Instituição Bancária & Conta</th>
                  <th className="p-3 text-right">Receita Apurada (R$)</th>
                  <th className="p-3 text-right">Saldo Conciliado C/C (R$)</th>
                  <th className="p-3 text-center">Divergência</th>
                  <th className="p-3 text-center">Status Conciliação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2e2e2e]">
                {resumo?.apuracoes.map((a) => {
                  const emp = resumo.empreendimentos.find(e => e.id === a.empreendimentoId);
                  const dif = Math.abs(a.baseCalculoEfetivaRet - a.saldoBancarioContaAfetacao);
                  return (
                    <tr key={a.id} className="hover:bg-[#222222]">
                      <td className="p-3 font-medium text-white">{a.nomeEmpreendimento}</td>
                      <td className="p-3 font-mono text-neutral-300">
                        {emp?.bancoContaVinculada} - {emp?.numeroContaVinculada}
                      </td>
                      <td className="p-3 text-right font-mono text-neutral-200">
                        {a.baseCalculoEfetivaRet.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right font-mono text-emerald-400 font-bold">
                        {a.saldoBancarioContaAfetacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-center font-mono">
                        {dif === 0 ? (
                          <span className="text-emerald-400 font-semibold">R$ 0,00</span>
                        ) : (
                          <span className="text-rose-400 font-semibold">R$ {dif.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>100% Validada</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Conteúdo Aba 4: Legislação & Alíquotas */}
      {abaAtiva === 'legislacao' && (
        <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#333333] space-y-4">
          <div className="flex items-center gap-2 text-teal-400 font-semibold text-sm">
            <Scale className="w-5 h-5" />
            <span>Fundamentos Jurídicos e Tributários do RET (Lei Federal nº 10.931/2004)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-neutral-300 leading-relaxed">
            <div className="p-4 bg-[#222222] rounded border border-[#333333] space-y-2">
              <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-teal-400" />
                RET Geral - Incorporações Imobiliárias (Alíquota Unificada de 4,00%)
              </h4>
              <p>
                Para incorporações imobiliárias em geral submetidas ao Patrimônio de Afetação, a alíquota unificada de 4% sobre a receita mensal arrecadada (regime de caixa) substitui integralmente 4 tributos federais:
              </p>
              <ul className="list-disc list-inside space-y-1 font-mono text-neutral-400">
                <li><strong className="text-neutral-200">IRPJ:</strong> 1,26% da receita</li>
                <li><strong className="text-neutral-200">CSLL:</strong> 0,66% da receita</li>
                <li><strong className="text-neutral-200">COFINS:</strong> 1,71% da receita</li>
                <li><strong className="text-neutral-200">PIS/PASEP:</strong> 0,37% da receita</li>
              </ul>
              <p className="text-[11px] text-neutral-500 pt-1">
                Fundamentação: Art. 4º da Lei nº 10.931/2004 com redação dada pela Lei nº 12.767/2012 e IN RFB nº 1.435/2013.
              </p>
            </div>

            <div className="p-4 bg-[#222222] rounded border border-[#333333] space-y-2">
              <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                <Home className="w-4 h-4 text-emerald-400" />
                RET Social - Minha Casa Minha Vida (Alíquota Unificada de 1,00%)
              </h4>
              <p>
                Para projetos de incorporação ou construção de habitações de interesse social inseridos no Programa Minha Casa Minha Vida (PMCMV), a alíquota unificada é reduzida para 1%:
              </p>
              <ul className="list-disc list-inside space-y-1 font-mono text-neutral-400">
                <li><strong className="text-neutral-200">IRPJ:</strong> 0,31% da receita</li>
                <li><strong className="text-neutral-200">CSLL:</strong> 0,16% da receita</li>
                <li><strong className="text-neutral-200">COFINS:</strong> 0,44% da receita</li>
                <li><strong className="text-neutral-200">PIS/PASEP:</strong> 0,09% da receita</li>
              </ul>
              <p className="text-[11px] text-neutral-500 pt-1">
                Fundamentação: Art. 4º, § 6º da Lei nº 10.931/2004 e Lei nº 12.024/2009.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Empreendimento Afetado */}
      {isModalEmpreendimentoOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#1f1f1f] border border-[#333333] rounded-lg max-w-lg w-full p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-teal-400" />
              <span>{itemEdicaoEmpreendimento ? 'Editar Empreendimento Afetado' : 'Novo Empreendimento com Patrimônio de Afetação'}</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Nome do Empreendimento / Residencial</label>
                <input
                  type="text"
                  value={empNome}
                  onChange={(e) => setEmpNome(e.target.value)}
                  placeholder="Ex: Residencial Jardins do Parque SPE"
                  className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">CNPJ Específico da SPE / Filial</label>
                  <input
                    type="text"
                    value={empCnpjSpe}
                    onChange={(e) => setEmpCnpjSpe(e.target.value)}
                    placeholder="00.000.000/0002-00"
                    className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Termo Afetação (Cartório RGI)</label>
                  <input
                    type="text"
                    value={empTermoRgi}
                    onChange={(e) => setEmpTermoRgi(e.target.value)}
                    placeholder="Matrícula 84.120 - 4º RGI"
                    className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Modalidade RET</label>
                  <select
                    value={empModalidade}
                    onChange={(e) => setEmpModalidade(e.target.value as ModalidadeRet)}
                    className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="RET_GERAL_4_PORCENTO">RET Geral (4,00%)</option>
                    <option value="RET_SOCIAL_MCMV_1_PORCENTO">RET Social MCMV (1,00%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Data Adesão RFB</label>
                  <input
                    type="date"
                    value={empDataAdesao}
                    onChange={(e) => setEmpDataAdesao(e.target.value)}
                    className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Banco da Conta Vinculada</label>
                  <input
                    type="text"
                    value={empBanco}
                    onChange={(e) => setEmpBanco(e.target.value)}
                    placeholder="Ex: Banco Itaú Unibanco"
                    className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Número Agência e Conta</label>
                  <input
                    type="text"
                    value={empConta}
                    onChange={(e) => setEmpConta(e.target.value)}
                    placeholder="Ag. 1234 C/C 56789-0"
                    className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Fase / Status da Incorporação</label>
                <select
                  value={empStatus}
                  onChange={(e) => setEmpStatus(e.target.value as any)}
                  className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="EM_CONSTRUCAO">Em Construção (Obras em Andamento)</option>
                  <option value="CONCLUIDO_HABITE_SE">Concluído (Habite-se Concedido)</option>
                  <option value="ENCERRADO">Encerrado / Liquidado</option>
                </select>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#333333] flex justify-end gap-2">
              <button
                onClick={() => setIsModalEmpreendimentoOpen(false)}
                className="px-3.5 py-1.5 bg-[#2a2a2a] hover:bg-[#333333] text-neutral-300 rounded text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvarEmpreendimento}
                className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded text-xs transition-colors shadow-sm"
              >
                Salvar Empreendimento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Apuração Mensal RET */}
      {isModalApuracaoOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#1f1f1f] border border-[#333333] rounded-lg max-w-lg w-full p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-teal-400" />
              <span>{itemEdicaoApuracao ? 'Editar Apuração Mensal RET' : 'Nova Apuração Mensal RET (DARF 4095)'}</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Selecione o Empreendimento Afetado</label>
                <select
                  value={apurEmpreendimentoId}
                  onChange={(e) => setApurEmpreendimentoId(e.target.value)}
                  className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                >
                  {resumo?.empreendimentos.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nomeEmpreendimento} ({emp.aliquotaUnificada}%)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Competência de Recebimento</label>
                  <input
                    type="month"
                    value={apurCompetencia}
                    onChange={(e) => setApurCompetencia(e.target.value)}
                    className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Vencimento DARF (Dia 20)</label>
                  <input
                    type="date"
                    value={apurVencimentoDarf}
                    onChange={(e) => setApurVencimentoDarf(e.target.value)}
                    className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Receitas de Unidades em Construção (R$)</label>
                <input
                  type="number"
                  value={apurReceitaConstrucao}
                  onChange={(e) => setApurReceitaConstrucao(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Receitas Unidades Prontas (R$)</label>
                  <input
                    type="number"
                    value={apurReceitaProntas}
                    onChange={(e) => setApurReceitaProntas(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Outras Receitas Operacionais (R$)</label>
                  <input
                    type="number"
                    value={apurOutrasReceitas}
                    onChange={(e) => setApurOutrasReceitas(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Saldo Extrato C/C Vinculada (R$)</label>
                  <input
                    type="number"
                    value={apurSaldoBancarioConta}
                    onChange={(e) => setApurSaldoBancarioConta(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Status Pagamento DARF</label>
                  <select
                    value={apurStatusDarf}
                    onChange={(e) => setApurStatusDarf(e.target.value as any)}
                    className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="PENDENTE">Pendente</option>
                    <option value="PAGO">Pago</option>
                    <option value="COMPENSADO">Compensado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Observações da Apuração</label>
                <input
                  type="text"
                  value={apurObs}
                  onChange={(e) => setApurObs(e.target.value)}
                  placeholder="Ex: Conciliado com extrato do Banco Itaú referente às vendas da Torre B."
                  className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#333333] flex justify-end gap-2">
              <button
                onClick={() => setIsModalApuracaoOpen(false)}
                className="px-3.5 py-1.5 bg-[#2a2a2a] hover:bg-[#333333] text-neutral-300 rounded text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvarApuracao}
                className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded text-xs transition-colors shadow-sm"
              >
                Calcular e Salvar Apuração
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
