import React, { useState, useEffect } from 'react';
import {
  Layers,
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
  Edit,
  Trash2,
  ShieldCheck,
  Scale,
  DollarSign,
  ArrowRightLeft,
  Send,
  Coins,
  FileCheck2,
  Globe2,
  HelpCircle,
  Clock,
  CheckSquare
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  Empresa,
  HipoteseGeradoraCreditoAcumulado,
  ItemGeradorCreditoAcumulado,
  ResumoCreditoAcumuladoIcms
} from '../../types/contabil';

interface CreditoAcumuladoIcmsModuleProps {
  empresaAtiva: Empresa | null;
  onOpenReportPreview?: (config: {
    titulo: string;
    subtitulo: string;
    conteudoHtml: string;
    imprimirDireto?: boolean;
  }) => void;
}

export const CreditoAcumuladoIcmsModule: React.FC<CreditoAcumuladoIcmsModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [resumo, setResumo] = useState<ResumoCreditoAcumuladoIcms | null>(null);
  const [competencia, setCompetencia] = useState('2026-03');
  const [abaAtiva, setAbaAtiva] = useState<'gerador' | 'apropriacao' | 'legislacao'>('gerador');
  const [busca, setBusca] = useState('');

  // Modais
  const [isModalItemOpen, setIsModalItemOpen] = useState(false);
  const [itemEdicao, setItemEdicao] = useState<ItemGeradorCreditoAcumulado | null>(null);

  // Form Item
  const [formNumeroNfe, setFormNumeroNfe] = useState('');
  const [formChaveNfe, setFormChaveNfe] = useState('');
  const [formDataEmissao, setFormDataEmissao] = useState('2026-03-10');
  const [formCliente, setFormCliente] = useState('');
  const [formUfDestino, setFormUfDestino] = useState('BA');
  const [formCfop, setFormCfop] = useState('6.101');
  const [formHipotese, setFormHipotese] = useState<HipoteseGeradoraCreditoAcumulado>('INCISO_I_ALIQUOTA_DIFERENCIADA');
  const [formValorOperacao, setFormValorOperacao] = useState<number>(300000);
  const [formBaseCalculo, setFormBaseCalculo] = useState<number>(300000);
  const [formAliqSaida, setFormAliqSaida] = useState<number>(7.0);
  const [formCustoEntrada, setFormCustoEntrada] = useState<number>(220000);
  const [formAliqEntrada, setFormAliqEntrada] = useState<number>(18.0);
  const [formStatusSefaz, setFormStatusSefaz] = useState<'GERADO_ESCRITURAL' | 'SUBMETIDO_ECREDAC' | 'HOMOLOGADO_SEFAZ' | 'UTILIZADO_TRANSFERIDO'>('SUBMETIDO_ECREDAC');
  const [formProtocoloSefaz, setFormProtocoloSefaz] = useState('ECREDAC-SP-2026-0001');

  const carregarDados = () => {
    if (!empresaAtiva) return;
    const res = dbService.getCreditoAcumuladoIcms(empresaAtiva.id, competencia);
    setResumo(res);
  };

  useEffect(() => {
    carregarDados();
  }, [empresaAtiva, competencia]);

  const abrirModalNovoItem = () => {
    setItemEdicao(null);
    setFormNumeroNfe('');
    setFormChaveNfe('');
    setFormDataEmissao(new Date().toISOString().split('T')[0]);
    setFormCliente('');
    setFormUfDestino('BA');
    setFormCfop('6.101');
    setFormHipotese('INCISO_I_ALIQUOTA_DIFERENCIADA');
    setFormValorOperacao(250000);
    setFormBaseCalculo(250000);
    setFormAliqSaida(7.0);
    setFormCustoEntrada(180000);
    setFormAliqEntrada(18.0);
    setFormStatusSefaz('GERADO_ESCRITURAL');
    setFormProtocoloSefaz('');
    setIsModalItemOpen(true);
  };

  const abrirModalEditarItem = (item: ItemGeradorCreditoAcumulado) => {
    setItemEdicao(item);
    setFormNumeroNfe(item.numeroNfe);
    setFormChaveNfe(item.chaveNfe);
    setFormDataEmissao(item.dataEmissao);
    setFormCliente(item.clienteDestinatario);
    setFormUfDestino(item.ufDestino);
    setFormCfop(item.cfop);
    setFormHipotese(item.hipoteseGeradora);
    setFormValorOperacao(item.valorOperacao);
    setFormBaseCalculo(item.baseCalculoIcms);
    setFormAliqSaida(item.aliquotaIcmsSaida);
    setFormCustoEntrada(item.custoInsumosEntradaEquivalente);
    setFormAliqEntrada(item.aliquotaMediaEntrada);
    setFormStatusSefaz(item.statusHomologacaoSefaz);
    setFormProtocoloSefaz(item.numeroProtocoloSefaz || '');
    setIsModalItemOpen(true);
  };

  const handleSalvarItem = () => {
    if (!empresaAtiva) return;

    const debSaida = Math.round(formBaseCalculo * (formAliqSaida / 100) * 100) / 100;
    const credEntrada = Math.round(formCustoEntrada * (formAliqEntrada / 100) * 100) / 100;
    const credAcum = Math.max(0, Math.round((credEntrada - debSaida) * 100) / 100);

    const item: ItemGeradorCreditoAcumulado = {
      id: itemEdicao?.id || `cred-ac-${Date.now()}`,
      empresaId: empresaAtiva.id,
      competencia,
      numeroNfe: formNumeroNfe || '10500',
      chaveNfe: formChaveNfe || `352603${empresaAtiva.cnpj.replace(/\D/g, '')}5500100001050010000105001`,
      dataEmissao: formDataEmissao,
      clienteDestinatario: formCliente || 'Cliente Destinatário Interestadual',
      ufDestino: formUfDestino,
      cfop: formCfop,
      hipoteseGeradora: formHipotese,
      valorOperacao: formValorOperacao,
      baseCalculoIcms: formBaseCalculo,
      aliquotaIcmsSaida: formAliqSaida,
      debitoIcmsSaida: debSaida,
      custoInsumosEntradaEquivalente: formCustoEntrada,
      aliquotaMediaEntrada: formAliqEntrada,
      creditoEntradaEquivalente: credEntrada,
      creditoAcumuladoGerado: credAcum,
      statusHomologacaoSefaz: formStatusSefaz,
      numeroProtocoloSefaz: formProtocoloSefaz || undefined
    };

    dbService.salvarItemCreditoAcumulado(item);
    setIsModalItemOpen(false);
    carregarDados();
  };

  const handleExcluirItem = (id: string) => {
    if (confirm('Deseja excluir esta operação geradora de crédito acumulado?')) {
      dbService.excluirItemCreditoAcumulado(id);
      carregarDados();
    }
  };

  const handleIntegrarContabil = (id: string) => {
    const res = dbService.integrarCreditoAcumuladoContabil(id);
    alert(res.mensagem);
    carregarDados();
  };

  // Impressão A4 Timbrada
  const imprimirDossieCreditoAcumuladoA4 = () => {
    if (!empresaAtiva || !resumo) return;

    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #111; padding: 24px; max-width: 900px; margin: 0 auto; line-height: 1.4;">
        <div style="border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <h1 style="margin: 0; font-size: 18px; text-transform: uppercase; color: #0284c7;">DEMONSTRATIVO DO CRÉDITO ACUMULADO DE ICMS</h1>
            <p style="margin: 4px 0 0; font-size: 12px; color: #555;">Sistema Eletrônico de Gerenciamento do Crédito Acumulado - e-CredAc SP / Portaria CAT 26/2010</p>
          </div>
          <div style="text-align: right; font-size: 11px; color: #666;">
            <strong>Competência:</strong> ${competencia}<br>
            <strong>Emissão:</strong> ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}
          </div>
        </div>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-bottom: 16px; font-size: 12px;">
          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 8px;">
            <div><strong>Estabelecimento Gerador:</strong> ${empresaAtiva.razaoSocial}</div>
            <div><strong>CNPJ:</strong> ${empresaAtiva.cnpj}</div>
            <div><strong>Inscrição Estadual (IE):</strong> ${empresaAtiva.inscricaoEstadual || 'Isento/Homologado'}</div>
            <div><strong>Hipóteses Geradoras:</strong> Incisos I, II e III do Art. 71 do RICMS/SP</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 10px; border-radius: 6px; text-align: center;">
            <div style="font-size: 10px; font-weight: 600; color: #166534; text-transform: uppercase;">Total Gerado no Período</div>
            <div style="font-size: 16px; font-weight: 700; color: #15803d; margin-top: 4px;">R$ ${resumo.totalCreditoAcumuladoGeradoPeriodo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
          <div style="background: #f0f9ff; border: 1px solid #bae6fd; padding: 10px; border-radius: 6px; text-align: center;">
            <div style="font-size: 10px; font-weight: 600; color: #0369a1; text-transform: uppercase;">Homologado pela SEFAZ</div>
            <div style="font-size: 16px; font-weight: 700; color: #0284c7; margin-top: 4px;">R$ ${resumo.totalHomologadoSefaz.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 10px; border-radius: 6px; text-align: center;">
            <div style="font-size: 10px; font-weight: 600; color: #1e40af; text-transform: uppercase;">Saldo Disponível Apropriação</div>
            <div style="font-size: 16px; font-weight: 700; color: #1d4ed8; margin-top: 4px;">R$ ${resumo.saldoDisponivelParaApropriacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        <h3 style="font-size: 13px; text-transform: uppercase; color: #334155; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 8px;">
          Relação de Operações Geradoras de Crédito Acumulado
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 16px;">
          <thead>
            <tr style="background-color: #f1f5f9; text-align: left; border-bottom: 1px solid #94a3b8;">
              <th style="padding: 6px;">NF-e / Destinatário</th>
              <th style="padding: 6px; text-align: center;">UF / CFOP</th>
              <th style="padding: 6px;">Hipótese Geradora</th>
              <th style="padding: 6px; text-align: right;">Débito Saída</th>
              <th style="padding: 6px; text-align: right;">Crédito Insumos</th>
              <th style="padding: 6px; text-align: right;">Crédito Acumulado</th>
              <th style="padding: 6px; text-align: center;">Status SEFAZ</th>
            </tr>
          </thead>
          <tbody>
            ${resumo.itens.map(i => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 6px;">
                  <strong>NF-e nº ${i.numeroNfe}</strong><br>
                  <span style="font-size: 9px; color: #64748b;">${i.clienteDestinatario}</span>
                </td>
                <td style="padding: 6px; text-align: center; font-family: monospace;">${i.ufDestino} / ${i.cfop}</td>
                <td style="padding: 6px; font-size: 10px;">
                  ${i.hipoteseGeradora === 'INCISO_I_ALIQUOTA_DIFERENCIADA' ? 'Inciso I - Alíquota Diferenciada' : i.hipoteseGeradora === 'INCISO_II_REDUCAO_BASE_CALCULO' ? 'Inciso II - Redução Base Cálculo' : 'Inciso III - Exportação / Não-Incidência'}
                </td>
                <td style="padding: 6px; text-align: right; font-family: monospace; color: #b91c1c;">R$ ${i.debitoIcmsSaida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="padding: 6px; text-align: right; font-family: monospace; color: #15803d;">R$ ${i.creditoEntradaEquivalente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="padding: 6px; text-align: right; font-family: monospace; font-weight: bold; color: #0284c7;">R$ ${i.creditoAcumuladoGerado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="padding: 6px; text-align: center;">
                  <span style="font-size: 9px; font-weight: 600; padding: 2px 6px; border-radius: 4px; background: ${i.statusHomologacaoSefaz === 'HOMOLOGADO_SEFAZ' ? '#dcfce7; color: #15803d;' : '#e0f2fe; color: #0369a1;'}">
                    ${i.statusHomologacaoSefaz}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style="background-color: #f8fafc; font-weight: bold; border-top: 2px solid #0284c7;">
              <td colspan="5" style="padding: 6px; text-align: right;">TOTAL DE CRÉDITO ACUMULADO HOMOLOGÁVEL:</td>
              <td style="padding: 6px; text-align: right; font-family: monospace; font-size: 12px; color: #0284c7;">R$ ${resumo.totalCreditoAcumuladoGeradoPeriodo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>

        <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; margin-bottom: 24px; font-size: 10px; color: #475569; background-color: #f8fafc;">
          <strong>Notas Explicativas e Procedimentos Fiscais (RICMS/SP e Portaria CAT 26/2010):</strong><br>
          1. <strong>Diferença de Alíquotas (Art. 71, I):</strong> Ocorre quando o estabelecimento promove saídas interestaduais tributadas a 4%, 7% ou 12%, enquanto os insumos produtivos foram adquiridos à alíquota de 18% no mercado interno.<br>
          2. <strong>Manutenção de Créditos nas Exportações (Art. 71, III):</strong> Nos termos do Art. 155, § 2º, X, "a" da CF/88 e Art. 3º, II da LC 87/96, é assegurada a manutenção integral dos créditos decorrentes da entrada de mercadorias empregadas na industrialização de produtos exportados.<br>
          3. <strong>Homologação no e-CredAc:</strong> O saldo somente adquire liquidez financeira para compensação ou transferência para fornecedores de matérias-primas após acolhimento pelo Fisco Estadual via sistema e-CredAc.
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; text-align: center; font-size: 11px;">
          <div>
            <div style="border-top: 1px solid #334155; padding-top: 4px; margin-top: 40px;">
              <strong>Gerente Tributário / Fiscal</strong><br>
              Responsável pelo e-CredAc
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
        titulo: `Dossiê e-CredAc SP - Crédito Acumulado de ICMS (${competencia})`,
        subtitulo: `Demonstrativo de Apropriação e Homologação SEFAZ - ${empresaAtiva.razaoSocial}`,
        conteudoHtml: html,
        imprimirDireto: false
      });
    }
  };

  const itensFiltrados = resumo?.itens.filter(i => {
    const termo = busca.toLowerCase();
    return (
      i.numeroNfe.toLowerCase().includes(termo) ||
      i.clienteDestinatario.toLowerCase().includes(termo) ||
      i.cfop.toLowerCase().includes(termo)
    );
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header com Contexto Fiscal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1f1f1f] p-5 rounded-lg border border-[#333333] shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-sky-950/60 border border-sky-800/80 rounded-lg text-sky-400">
            <Coins className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-wide">
                Crédito Acumulado de ICMS (e-CredAc SP / Portaria CAT 26/2010)
              </h2>
              <span className="px-2 py-0.5 text-xs font-semibold bg-sky-900/40 text-sky-300 border border-sky-700/60 rounded">
                Art. 71 do RICMS / SEFAZ
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Apuração por Hipótese Geradora (Alíquota Diferenciada, Redução de Base e Exportação) e Gestão de Homologação Eletrônica
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#141414] border border-[#333333] rounded px-3 py-1.5 text-xs">
            <Calendar className="w-4 h-4 text-sky-400 mr-2" />
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
            onClick={imprimirDossieCreditoAcumuladoA4}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2a2a2a] hover:bg-[#333333] text-white rounded border border-[#444444] text-xs font-medium transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4 text-sky-400" />
            <span>Dossiê A4</span>
          </button>

          <button
            onClick={abrirModalNovoItem}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Operação</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Gerado no Período */}
        <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#333333] shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Crédito Gerado no Mês</span>
            <span className="p-1.5 bg-sky-950/50 text-sky-400 rounded border border-sky-800/60">
              <Coins className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-sky-400">
            R$ {(resumo?.totalCreditoAcumuladoGeradoPeriodo || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 flex items-center text-xs text-neutral-400">
            <span className="text-neutral-300 font-medium mr-1">Insumos 18%</span>
            <span>vs Saídas Interestaduais/Exp.</span>
          </div>
        </div>

        {/* Homologado SEFAZ */}
        <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#333333] shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Homologado no e-CredAc</span>
            <span className="p-1.5 bg-emerald-950/50 text-emerald-400 rounded border border-emerald-800/60">
              <CheckCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">
            R$ {(resumo?.totalHomologadoSefaz || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 flex items-center text-xs text-neutral-400">
            <span className="text-emerald-400 font-semibold mr-1">Apto para Uso</span>
            <span>com visto fiscal SEFAZ</span>
          </div>
        </div>

        {/* Transferido / Utilizado */}
        <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#333333] shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Transferido / Utilizado</span>
            <span className="p-1.5 bg-purple-950/50 text-purple-400 rounded border border-purple-800/60">
              <ArrowRightLeft className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-purple-400">
            R$ {(resumo?.totalTransferidoUtilizado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 flex items-center text-xs text-neutral-400">
            <span className="text-purple-400 font-medium mr-1">Fornecedores & Mútuos</span>
          </div>
        </div>

        {/* Saldo Disponível */}
        <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#333333] shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Saldo em Conta Fiscal</span>
            <span className="p-1.5 bg-blue-950/50 text-blue-400 rounded border border-blue-800/60">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white">
            R$ {(resumo?.saldoDisponivelParaApropriacao || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 flex items-center text-xs text-neutral-400">
            <span className="text-blue-400 font-medium mr-1">Disponível</span>
            <span>para liquidação ou cessão</span>
          </div>
        </div>
      </div>

      {/* Navegação de Abas */}
      <div className="flex items-center justify-between border-b border-[#333333] pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAbaAtiva('gerador')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-t-md border-b-2 transition-all ${
              abaAtiva === 'gerador'
                ? 'border-sky-500 text-sky-400 bg-[#252525]'
                : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-[#1a1a1a]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Operações Geradoras ({resumo?.itens.length || 0})</span>
          </button>

          <button
            onClick={() => setAbaAtiva('apropriacao')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-t-md border-b-2 transition-all ${
              abaAtiva === 'apropriacao'
                ? 'border-sky-500 text-sky-400 bg-[#252525]'
                : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-[#1a1a1a]'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Apropriação & Transferência</span>
          </button>

          <button
            onClick={() => setAbaAtiva('legislacao')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-t-md border-b-2 transition-all ${
              abaAtiva === 'legislacao'
                ? 'border-sky-500 text-sky-400 bg-[#252525]'
                : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-[#1a1a1a]'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Portaria CAT 26 & Hipóteses do Art. 71</span>
          </button>
        </div>
      </div>

      {/* Conteúdo Aba 1: Operações Geradoras */}
      {abaAtiva === 'gerador' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 bg-[#1a1a1a] p-3 rounded-lg border border-[#333333]">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Filtrar por NF-e, destinatário ou CFOP..."
                className="w-full bg-[#141414] border border-[#333333] rounded pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div className="text-xs text-neutral-400 font-mono">
              Registros: {itensFiltrados.length}
            </div>
          </div>

          <div className="overflow-x-auto bg-[#1a1a1a] rounded-lg border border-[#333333] shadow-md">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#242424] text-neutral-300 font-semibold border-b border-[#333333]">
                  <th className="p-3">NF-e / Destinatário</th>
                  <th className="p-3">UF / CFOP</th>
                  <th className="p-3">Hipótese Geradora</th>
                  <th className="p-3 text-right">Valor Operação (R$)</th>
                  <th className="p-3 text-right">Débito Saída (R$)</th>
                  <th className="p-3 text-right">Crédito Insumos (R$)</th>
                  <th className="p-3 text-right">Crédito Acumulado (R$)</th>
                  <th className="p-3 text-center">Status SEFAZ</th>
                  <th className="p-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2e2e2e]">
                {itensFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-neutral-500">
                      Nenhuma operação geradora registrada para esta competência.
                    </td>
                  </tr>
                ) : (
                  itensFiltrados.map((i) => (
                    <tr key={i.id} className="hover:bg-[#222222] transition-colors">
                      <td className="p-3 font-medium text-white">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-sky-400 flex-shrink-0" />
                          <div>
                            <div>NF-e nº {i.numeroNfe}</div>
                            <span className="text-[10px] text-neutral-400">{i.clienteDestinatario}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-neutral-300">
                        {i.ufDestino} / {i.cfop}
                      </td>
                      <td className="p-3 text-neutral-300">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700">
                          {i.hipoteseGeradora === 'INCISO_I_ALIQUOTA_DIFERENCIADA'
                            ? 'Inc. I - Alíq. Diferenciada'
                            : i.hipoteseGeradora === 'INCISO_II_REDUCAO_BASE_CALCULO'
                            ? 'Inc. II - Redução Base'
                            : 'Inc. III - Exportação'}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono text-neutral-200">
                        {i.valorOperacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right font-mono text-rose-400">
                        {i.debitoIcmsSaida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right font-mono text-emerald-400">
                        {i.creditoEntradaEquivalente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-sky-400 text-sm">
                        {i.creditoAcumuladoGerado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            i.statusHomologacaoSefaz === 'HOMOLOGADO_SEFAZ'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : i.statusHomologacaoSefaz === 'SUBMETIDO_ECREDAC'
                              ? 'bg-sky-950 text-sky-300 border border-sky-800'
                              : i.statusHomologacaoSefaz === 'UTILIZADO_TRANSFERIDO'
                              ? 'bg-purple-950 text-purple-300 border border-purple-800'
                              : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                          }`}
                        >
                          {i.statusHomologacaoSefaz === 'HOMOLOGADO_SEFAZ'
                            ? 'Homologado'
                            : i.statusHomologacaoSefaz === 'SUBMETIDO_ECREDAC'
                            ? 'Submetido'
                            : i.statusHomologacaoSefaz === 'UTILIZADO_TRANSFERIDO'
                            ? 'Transferido'
                            : 'Gerado'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleIntegrarContabil(i.id)}
                            title="Integrar ao Ativo Circulante"
                            className="p-1.5 bg-[#2a2a2a] hover:bg-sky-900/50 text-neutral-300 hover:text-sky-300 rounded border border-[#444444] transition-colors"
                          >
                            <FileCheck2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => abrirModalEditarItem(i)}
                            title="Editar"
                            className="p-1.5 bg-[#2a2a2a] hover:bg-[#333333] text-neutral-300 hover:text-white rounded border border-[#444444] transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleExcluirItem(i.id)}
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

      {/* Conteúdo Aba 2: Apropriação & Transferência */}
      {abaAtiva === 'apropriacao' && (
        <div className="bg-[#1a1a1a] p-5 rounded-lg border border-[#333333] space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-950/60 border border-sky-800/80 rounded-lg text-sky-400">
              <ArrowRightLeft className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Gestão de Pedidos de Apropriação e Transferência e-CredAc</h3>
              <p className="text-xs text-neutral-400">
                Apropriação escritural em conta gráfica ou cessão para fornecedores de insumos industriais homologados perante o Fisco Paulista.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-[#222222] rounded border border-[#333333] space-y-2">
              <h4 className="font-bold text-white text-xs uppercase flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                Compensação de Saldo Devedor
              </h4>
              <p className="text-xs text-neutral-400">
                Utilização do crédito acumulado próprio para abater o imposto devido no Livro Registro de Apuração do ICMS (GIA / EFD).
              </p>
            </div>

            <div className="p-4 bg-[#222222] rounded border border-[#333333] space-y-2">
              <h4 className="font-bold text-white text-xs uppercase flex items-center gap-1.5">
                <ArrowRightLeft className="w-4 h-4 text-sky-400" />
                Transferência Entre Filiais
              </h4>
              <p className="text-xs text-neutral-400">
                Transferência para outro estabelecimento da mesma pessoa jurídica situado no Estado de São Paulo (Art. 73 do RICMS).
              </p>
            </div>

            <div className="p-4 bg-[#222222] rounded border border-[#333333] space-y-2">
              <h4 className="font-bold text-white text-xs uppercase flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-purple-400" />
                Pagamento a Fornecedores
              </h4>
              <p className="text-xs text-neutral-400">
                Cessão de crédito para fornecedores de matérias-primas e bens do ativo imobilizado mediante autorização SEFAZ.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo Aba 3: Legislação */}
      {abaAtiva === 'legislacao' && (
        <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#333333] space-y-4">
          <div className="flex items-center gap-2 text-sky-400 font-semibold text-sm">
            <Scale className="w-5 h-5" />
            <span>Fundamentos Jurídicos do Crédito Acumulado de ICMS (RICMS/SP e Portaria CAT 26/2010)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-neutral-300 leading-relaxed">
            <div className="p-4 bg-[#222222] rounded border border-[#333333] space-y-1.5">
              <h4 className="font-bold text-white">Art. 71, Inciso I - Alíquota Diferenciada</h4>
              <p>
                Ocorre na aplicação de alíquotas diversificadas em operações de entrada e saída. Clássico exemplo de compras internas com alíquota de 18% e saídas interestaduais tributadas a 4%, 7% ou 12%.
              </p>
            </div>

            <div className="p-4 bg-[#222222] rounded border border-[#333333] space-y-1.5">
              <h4 className="font-bold text-white">Art. 71, Inciso II - Redução de Base de Cálculo</h4>
              <p>
                Ocorre quando a saída é amparada por redução da base de cálculo com manutenção expressa do crédito integral da entrada, gerando acúmulo contínuo na escrita fiscal.
              </p>
            </div>

            <div className="p-4 bg-[#222222] rounded border border-[#333333] space-y-1.5">
              <h4 className="font-bold text-white">Art. 71, Inciso III - Saídas Isentas / Exportação</h4>
              <p>
                Aplica-se às saídas sem pagamento do imposto quando houver previsão expressa de manutenção de crédito, com destaque para as operações de comércio exterior (CF/88 Art. 155, § 2º, X).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Operação Geradora */}
      {isModalItemOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#1f1f1f] border border-[#333333] rounded-lg max-w-lg w-full p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Coins className="w-5 h-5 text-sky-400" />
              <span>{itemEdicao ? 'Editar Operação Geradora' : 'Nova Operação Geradora de Crédito Acumulado'}</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Número NF-e Saída</label>
                  <input
                    type="text"
                    value={formNumeroNfe}
                    onChange={(e) => setFormNumeroNfe(e.target.value)}
                    placeholder="Ex: 10450"
                    className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Data Emissão</label>
                  <input
                    type="date"
                    value={formDataEmissao}
                    onChange={(e) => setFormDataEmissao(e.target.value)}
                    className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Cliente / Destinatário</label>
                <input
                  type="text"
                  value={formCliente}
                  onChange={(e) => setFormCliente(e.target.value)}
                  placeholder="Razão Social ou Nome do Comprador"
                  className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">UF Destino</label>
                  <input
                    type="text"
                    value={formUfDestino}
                    onChange={(e) => setFormUfDestino(e.target.value.toUpperCase())}
                    maxLength={2}
                    className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">CFOP</label>
                  <input
                    type="text"
                    value={formCfop}
                    onChange={(e) => setFormCfop(e.target.value)}
                    className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Alíq. Saída (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formAliqSaida}
                    onChange={(e) => setFormAliqSaida(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Hipótese Geradora (Art. 71 RICMS)</label>
                <select
                  value={formHipotese}
                  onChange={(e) => setFormHipotese(e.target.value as any)}
                  className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="INCISO_I_ALIQUOTA_DIFERENCIADA">Inciso I - Alíquota Diferenciada (Saída 4%/7%/12% vs Entrada 18%)</option>
                  <option value="INCISO_II_REDUCAO_BASE_CALCULO">Inciso II - Redução de Base de Cálculo c/ Manutenção de Crédito</option>
                  <option value="INCISO_III_SAIDAS_IMUNES_EXPORTACAO">Inciso III - Exportação / Saídas Imunes (LC 87/96)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Valor Operação / Base ICMS (R$)</label>
                  <input
                    type="number"
                    value={formBaseCalculo}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value) || 0;
                      setFormBaseCalculo(v);
                      setFormValorOperacao(v);
                    }}
                    className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Custo Insumos Entrada (R$)</label>
                  <input
                    type="number"
                    value={formCustoEntrada}
                    onChange={(e) => setFormCustoEntrada(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Alíq. Média Entrada (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formAliqEntrada}
                    onChange={(e) => setFormAliqEntrada(parseFloat(e.target.value) || 18)}
                    className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Status no e-CredAc</label>
                  <select
                    value={formStatusSefaz}
                    onChange={(e) => setFormStatusSefaz(e.target.value as any)}
                    className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="GERADO_ESCRITURAL">Gerado na Escrita Fiscal</option>
                    <option value="SUBMETIDO_ECREDAC">Submetido ao e-CredAc</option>
                    <option value="HOMOLOGADO_SEFAZ">Homologado pela SEFAZ</option>
                    <option value="UTILIZADO_TRANSFERIDO">Utilizado / Transferido</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Número de Protocolo SEFAZ</label>
                <input
                  type="text"
                  value={formProtocoloSefaz}
                  onChange={(e) => setFormProtocoloSefaz(e.target.value)}
                  placeholder="Ex: ECREDAC-SP-2026-00481"
                  className="w-full bg-[#141414] border border-[#333333] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#333333] flex justify-end gap-2">
              <button
                onClick={() => setIsModalItemOpen(false)}
                className="px-3.5 py-1.5 bg-[#2a2a2a] hover:bg-[#333333] text-neutral-300 rounded text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvarItem}
                className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded text-xs transition-colors shadow-sm"
              >
                Calcular e Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
